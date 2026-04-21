<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIChatInteraction;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatApiController extends Controller
{
    public function ask(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $answer = $this->generateAnswer($lesson, $validated['message']);

        try {
            AIChatInteraction::create([
                'user_id' => $request->user()->id,
                'lesson_id' => $lesson->id,
                'question' => $validated['message'],
                'answer' => $answer,
            ]);
        } catch (\Throwable $e) {
            // If model/table isn't available, still respond.
        }

        return response()->json([
            // Keep both keys for compatibility with existing frontend variants.
            'reply' => $answer,
            'answer' => $answer,
        ]);
    }

    public function stream(Request $request, Lesson $lesson)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $user = $request->user();

        $headers = [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ];

        return response()->stream(function () use ($lesson, $validated, $user) {
            $this->disableOutputBuffering();

            $interactionId = null;
            try {
                $interaction = AIChatInteraction::create([
                    'user_id' => $user->id,
                    'lesson_id' => $lesson->id,
                    'question' => $validated['message'],
                    'answer' => null,
                ]);
                $interactionId = $interaction->id;
            } catch (\Throwable $e) {
                // If model/table isn't available, still stream the response.
            }

            $emit = function (string $event, array $data): void {
                echo "event: {$event}\n";
                echo 'data: ' . json_encode($data, JSON_UNESCAPED_UNICODE) . "\n\n";
                @ob_flush();
                @flush();
            };

            // Open the stream ASAP.
            echo ": connected\n\n";
            @ob_flush();
            @flush();

            $provider = $this->getChatCompletionsProvider();

            // If no streaming-capable provider is configured, fall back to other providers and stream by chunking.
            if (!$provider) {
                $answer = $this->generateAnswer($lesson, $validated['message']);
                foreach ($this->chunkStringForStreaming($answer, 24) as $chunk) {
                    $emit('chunk', ['delta' => $chunk, 'interaction_id' => $interactionId]);
                    usleep(25_000);
                }
                $emit('done', ['answer' => $answer, 'interaction_id' => $interactionId]);

                if ($interactionId) {
                    try {
                        AIChatInteraction::whereKey($interactionId)->update(['answer' => $answer]);
                    } catch (\Throwable $e) {
                    }
                }

                return;
            }

            $messages = $this->buildMessages($lesson, $validated['message']);

            try {
                $response = Http::withToken($provider['key'])
                    ->withHeaders($provider['headers'])
                    ->withHeaders(['Accept' => 'text/event-stream'])
                    ->withOptions(['stream' => true])
                    ->timeout(0)
                    ->post("{$provider['base_url']}/chat/completions", [
                        'model' => $provider['model'],
                        'messages' => $messages,
                        'temperature' => 0.2,
                        'stream' => true,
                    ]);
            } catch (\Throwable $e) {
                $emit('error', ['message' => 'AI provider request failed.', 'interaction_id' => $interactionId]);
                return;
            }

            if (!$response->successful()) {
                $emit('error', [
                    'message' => 'AI provider returned an error.',
                    'status' => $response->status(),
                    'interaction_id' => $interactionId,
                ]);
                return;
            }

            $body = $response->toPsrResponse()->getBody();
            $buffer = '';
            $fullAnswer = '';

            while (!$body->eof()) {
                $buffer .= $body->read(1024);

                while (($newlinePos = strpos($buffer, "\n")) !== false) {
                    $line = trim(substr($buffer, 0, $newlinePos));
                    $buffer = substr($buffer, $newlinePos + 1);

                    if ($line === '' || str_starts_with($line, ':')) {
                        continue;
                    }

                    if (!str_starts_with($line, 'data:')) {
                        continue;
                    }

                    $data = trim(substr($line, 5));
                    if ($data === '[DONE]') {
                        $emit('done', ['answer' => $fullAnswer, 'interaction_id' => $interactionId]);
                        if ($interactionId) {
                            try {
                                AIChatInteraction::whereKey($interactionId)->update(['answer' => $fullAnswer]);
                            } catch (\Throwable $e) {
                            }
                        }
                        return;
                    }

                    $payload = json_decode($data, true);
                    if (!is_array($payload)) {
                        continue;
                    }

                    $delta = $payload['choices'][0]['delta']['content'] ?? '';
                    if (!is_string($delta) || $delta === '') {
                        continue;
                    }

                    $fullAnswer .= $delta;
                    $emit('chunk', ['delta' => $delta, 'interaction_id' => $interactionId]);
                }
            }

            // If the provider stream ends unexpectedly, finalize gracefully.
            $emit('done', ['answer' => $fullAnswer, 'interaction_id' => $interactionId]);
            if ($interactionId) {
                try {
                    AIChatInteraction::whereKey($interactionId)->update(['answer' => $fullAnswer]);
                } catch (\Throwable $e) {
                }
            }
        }, 200, $headers);
    }

    private function generateAnswer(Lesson $lesson, string $message): string
    {
        $geminiKey = config('services.gemini.key');
        if ($geminiKey) {
            return $this->generateAnswerWithGemini($lesson, $message);
        }

        $provider = $this->getChatCompletionsProvider();
        if (!$provider) {
            $hfToken = config('services.huggingface.token');
            if ($hfToken) {
                return $this->generateAnswerWithHuggingFaceQA($lesson, $message);
            }

            return $this->generateAnswerLocally($lesson, $message);
        }

        $messages = $this->buildMessages($lesson, $message);

        try {
            $response = Http::withToken($provider['key'])
                ->withHeaders($provider['headers'])
                ->timeout(60)
                ->post("{$provider['base_url']}/chat/completions", [
                    'model' => $provider['model'],
                    'messages' => $messages,
                    'temperature' => 0.2,
                ]);
        } catch (\Throwable $e) {
            return 'AI provider request failed. Please try again.';
        }

        if (!$response->successful()) {
            return 'AI provider returned an error. Please try again.';
        }

        $answer = $response->json('choices.0.message.content');
        if (!is_string($answer) || trim($answer) === '') {
            return 'Sorry, I could not generate an answer right now.';
        }

        return trim($answer);
    }

    private function generateAnswerLocally(Lesson $lesson, string $question): string
    {
        $title = trim((string) ($lesson->title ?? 'this lesson'));
        $rawContent = trim(preg_replace('/\s+/', ' ', strip_tags((string) ($lesson->content ?? ''))));

        if ($rawContent === '') {
            return "I can still help with {$title}, but I don't have lesson notes loaded yet. Ask your instructor to add lesson content for better answers.";
        }

        $questionWords = preg_split('/[^a-z0-9]+/i', strtolower($question), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $questionWords = array_values(array_filter($questionWords, fn ($w) => strlen($w) >= 4));

        $sentences = preg_split('/(?<=[.!?])\s+/', $rawContent, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $bestSentence = '';
        $bestScore = -1;
        foreach ($sentences as $sentence) {
            $haystack = strtolower($sentence);
            $score = 0;
            foreach ($questionWords as $word) {
                if (str_contains($haystack, $word)) {
                    $score++;
                }
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestSentence = trim($sentence);
            }
        }

        $summary = mb_substr($rawContent, 0, 260);
        if (mb_strlen($rawContent) > 260) {
            $summary .= '...';
        }

        if ($bestScore <= 0 || $bestSentence === '') {
            return "From {$title}: {$summary}\n\nI could not find a direct keyword match for your question. Try asking with key terms from the lesson title or content.";
        }

        return "Based on {$title}: {$bestSentence}\n\nLesson summary: {$summary}";
    }

    private function generateAnswerWithGemini(Lesson $lesson, string $message): string
    {
        $apiKey = (string) config('services.gemini.key');
        $model = (string) config('services.gemini.model', 'gemma-3-4b-it');
        $baseUrl = rtrim((string) config('services.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');

        // Accept either "gemini-2.0-flash" or "models/gemini-2.0-flash".
        $model = trim($model);
        if (str_starts_with($model, 'models/')) {
            $model = substr($model, 7);
        }

        $messages = $this->buildMessages($lesson, $message);
        $systemText = '';
        $userText = '';
        foreach ($messages as $m) {
            if (($m['role'] ?? '') === 'system') {
                $systemText = (string) ($m['content'] ?? '');
            }
            if (($m['role'] ?? '') === 'user') {
                $userText = (string) ($m['content'] ?? '');
            }
        }

        if ($userText === '') {
            $userText = $message;
        }

        $tryModels = array_values(array_unique([
            $model,
            'gemma-3-4b-it',
        ]));

        $lastErrorMessage = null;

        foreach ($tryModels as $tryModel) {
            $payload = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [[
                            'text' => $this->geminiMergeSystemIntoUserForModel($systemText, $userText, $tryModel),
                        ]],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                ],
            ];

            if ($systemText !== '' && $this->geminiModelSupportsSystemInstruction($tryModel)) {
                $payload['systemInstruction'] = ['role' => 'system', 'parts' => [['text' => $systemText]]];
            }

            try {
                $response = Http::timeout(60)
                    ->post("{$baseUrl}/models/{$tryModel}:generateContent?key=" . urlencode($apiKey), $payload);
            } catch (\Throwable $e) {
                $lastErrorMessage = 'AI provider request failed. Please try again.';
                continue;
            }

            if (!$response->successful()) {
                $status = $response->status();
                $err = $response->json('error.message');
                $errText = is_string($err) ? trim($err) : null;
                $lastErrorMessage = $errText ?: 'AI provider returned an error. Please try again.';

                // If the model is unavailable or quota-blocked, try the next model.
                if (in_array($status, [404, 429], true)) {
                    continue;
                }

                return $lastErrorMessage;
            }

            $parts = $response->json('candidates.0.content.parts');
            if (is_array($parts)) {
                $text = '';
                foreach ($parts as $p) {
                    if (is_array($p) && isset($p['text']) && is_string($p['text'])) {
                        $text .= $p['text'];
                    }
                }
                $text = trim($text);
                if ($text !== '') {
                    return $text;
                }
            }

            $fallback = $response->json('candidates.0.output');
            if (is_string($fallback) && trim($fallback) !== '') {
                return trim($fallback);
            }
        }

        return $lastErrorMessage ?: 'Sorry, I could not generate an answer right now.';
    }

    private function geminiModelSupportsSystemInstruction(string $model): bool
    {
        $model = trim($model);

        // Gemini-hosted Gemma models reject "developer" / system instructions.
        if (str_starts_with($model, 'gemma-')) {
            return false;
        }

        return true;
    }

    private function geminiMergeSystemIntoUserForModel(string $systemText, string $userText, string $model): string
    {
        $userText = (string) $userText;
        $systemText = (string) $systemText;

        if ($systemText === '' || $this->geminiModelSupportsSystemInstruction($model)) {
            return $userText;
        }

        // For models that don't support system instructions, prepend it to the user message.
        return trim("Instructions:\n{$systemText}\n\nQuestion:\n{$userText}");
    }

    /**
     * Returns an OpenAI-compatible provider config for chat completions.
     * Priority: OpenAI -> OpenRouter.
     */
    private function getChatCompletionsProvider(): ?array
    {
        $openAiKey = config('services.openai.key');
        if ($openAiKey) {
            return [
                'key' => (string) $openAiKey,
                'model' => (string) config('services.openai.model', 'gpt-4o-mini'),
                'base_url' => rtrim((string) config('services.openai.base_url', 'https://api.openai.com/v1'), '/'),
                'headers' => [],
            ];
        }

        $openRouterKey = config('services.openrouter.key');
        if ($openRouterKey) {
            $headers = [];
            $referer = config('services.openrouter.http_referer');
            $title = config('services.openrouter.x_title');
            if (is_string($referer) && trim($referer) !== '') {
                $headers['HTTP-Referer'] = $referer;
            }
            if (is_string($title) && trim($title) !== '') {
                $headers['X-Title'] = $title;
            }

            return [
                'key' => (string) $openRouterKey,
                'model' => (string) config('services.openrouter.model', 'google/gemma-4-31b-it:free'),
                'base_url' => rtrim((string) config('services.openrouter.base_url', 'https://openrouter.ai/api/v1'), '/'),
                'headers' => $headers,
            ];
        }

        return null;
    }

    private function generateAnswerWithHuggingFaceQA(Lesson $lesson, string $question): string
    {
        $token = (string) config('services.huggingface.token');
        $model = (string) config('services.huggingface.qa_model', 'distilbert/distilbert-base-cased-distilled-squad');
        $baseUrl = rtrim((string) config('services.huggingface.base_url', 'https://api-inference.huggingface.co'), '/');

        $context = $this->buildLessonContextForQA($lesson);
        if ($context === '') {
            $context = 'No lesson context available.';
        }

        try {
            $response = Http::withToken($token)
                ->timeout(60)
                ->post("{$baseUrl}/models/{$model}", [
                    'inputs' => [
                        'question' => $question,
                        'context' => $context,
                    ],
                ]);
        } catch (\Throwable $e) {
            return 'AI provider request failed. Please try again.';
        }

        if (!$response->successful()) {
            return 'AI provider returned an error. Please try again.';
        }

        $answer = $response->json('answer');
        if (is_string($answer) && trim($answer) !== '') {
            return trim($answer);
        }

        // Some HF endpoints may return an error payload or a different structure.
        $raw = $response->json();
        if (is_array($raw) && isset($raw['error']) && is_string($raw['error'])) {
            return 'AI provider error: ' . $raw['error'];
        }

        return 'Sorry, I could not generate an answer right now.';
    }

    private function buildLessonContextForQA(Lesson $lesson): string
    {
        $lessonTitle = (string) ($lesson->title ?? '');
        $lessonContent = $lesson->content ?? '';
        $lessonContentText = trim(preg_replace('/\s+/', ' ', strip_tags((string) $lessonContent)));

        $parts = [];
        if ($lessonTitle !== '') {
            $parts[] = "Lesson title: {$lessonTitle}";
        }
        if ($lessonContentText !== '') {
            $parts[] = "Lesson content: {$lessonContentText}";
        }

        $text = trim(implode("\n", $parts));
        if (mb_strlen($text) > 3500) {
            $text = mb_substr($text, 0, 3500) . '…';
        }

        return $text;
    }

    private function buildMessages(Lesson $lesson, string $message): array
    {
        $lessonTitle = (string) ($lesson->title ?? '');
        $lessonContent = $lesson->content ?? '';
        $lessonContentText = trim(preg_replace('/\s+/', ' ', strip_tags((string) $lessonContent)));
        if (mb_strlen($lessonContentText) > 2500) {
            $lessonContentText = mb_substr($lessonContentText, 0, 2500) . '…';
        }

        $system = 'You are ByteLearn\'s AI Learning Assistant. Answer the student\'s question using the lesson context when helpful. If the lesson context is insufficient, say what\'s missing and suggest what to review. Keep answers clear and concise.';

        $user = "Lesson title: {$lessonTitle}\n";
        if ($lessonContentText !== '') {
            $user .= "Lesson content (partial): {$lessonContentText}\n\n";
        }
        $user .= "Student question: {$message}";

        return [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ];
    }

    private function disableOutputBuffering(): void
    {
        @ini_set('output_buffering', 'off');
        @ini_set('zlib.output_compression', '0');

        while (ob_get_level() > 0) {
            @ob_end_flush();
        }
    }

    /**
     * @return array<int, string>
     */
    private function chunkStringForStreaming(string $text, int $chunkSize): array
    {
        if ($chunkSize <= 0) {
            return [$text];
        }

        $chunks = [];
        $len = mb_strlen($text);
        for ($i = 0; $i < $len; $i += $chunkSize) {
            $chunks[] = mb_substr($text, $i, $chunkSize);
        }
        return $chunks;
    }
}
