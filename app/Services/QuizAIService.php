<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class QuizAIService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.key');
        $this->model = config('services.openrouter.model');
        $this->baseUrl = config('services.openrouter.base_url');
    }

    /**
     * Ensure the OpenRouter API key is configured.
     *
     * @throws \Exception
     */
    private function ensureApiKey(): void
    {
        if (empty($this->apiKey)) {
            throw new \Exception('OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file.');
        }
    }

    /**
     * Generate quiz questions using OpenRouter API
     *
     * @param string $lessonTitle
     * @param string $lessonContent
     * @param int $numberOfQuestions
     * @param string|null $videoUrl
     * @return array
     */
    public function generateQuizQuestions(
        string $lessonTitle,
        string $lessonContent,
        int $numberOfQuestions = 3,
        ?string $videoUrl = null
    ): array {
        try {
            $this->ensureApiKey();
            $prompt = $this->buildPrompt($lessonTitle, $lessonContent, $numberOfQuestions, $videoUrl);

            $response = Http::timeout(60)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'HTTP-Referer' => config('services.openrouter.http_referer') ?? url('/'),
                    'X-Title' => config('services.openrouter.x_title') ?? config('app.name'),
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->baseUrl}/chat/completions", [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => $prompt
                        ]
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 4096,
                ]);

            if ($response->failed()) {
                Log::error('OpenRouter API Error', [
                    'status' => $response->status(),
                    'body' => $response->json()
                ]);
                throw new \Exception('Failed to generate quiz: ' . $response->body());
            }

            $responseData = $response->json();
            $generatedText = $responseData['choices'][0]['message']['content'] ?? '';

            return $this->parseQuizResponse($generatedText);
        } catch (\Exception $e) {
            Log::error('Quiz Generation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Build the prompt for quiz generation
     */
    private function buildPrompt(
        string $lessonTitle,
        string $lessonContent,
        int $numberOfQuestions,
        ?string $videoUrl = null
    ): string {
        $prompt = <<<EOT
You are an expert educational assessment designer. Generate exactly {$numberOfQuestions} multiple-choice quiz questions based on the following lesson material.

LESSON TITLE: {$lessonTitle}

LESSON CONTENT:
{$lessonContent}

EOT;

        if ($videoUrl) {
            $prompt .= "\nVIDEO URL: {$videoUrl}\n";
        }

        $prompt .= <<<EOT

REQUIREMENTS:
1. Generate exactly {$numberOfQuestions} multiple-choice questions
2. Each question should test understanding of key concepts from the lesson
3. Provide exactly 4 answer options per question
4. Only ONE correct answer per question
5. Provide brief explanations for why the correct answer is right
6. Vary question difficulty (easy, medium, hard)
7. Ensure questions are clear and unambiguous

RESPONSE FORMAT:
Return ONLY a valid JSON array with NO additional text before or after.
Do not include markdown, code fences, bullet points, numbering, or any additional explanation outside the JSON.
Use this exact structure:
[
  {
    "question_text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Why this is the correct answer..."
  }
]

Additional rules:
- Each question must have exactly 4 plain text options.
- Do not prefix options with letters like A., B., C., or D.
- If you cannot produce valid JSON, return an empty array: []

Notes:
- correct_answer is the 0-based index (0=first option, 1=second, etc.)
- Keep explanations concise (1-2 sentences)
- Make questions practical and scenario-based when possible
EOT;

        return $prompt;
    }

    /**
     * Parse the Gemini API response and extract quiz questions
     */
    private function parseQuizResponse(string $responseText): array
    {
        try {
            $jsonString = $this->extractJsonArray($responseText);
            $questions = json_decode($jsonString, true);

            if (!is_array($questions)) {
                $questions = json_decode($this->fixMalformedJson($jsonString), true);
            }

            if (!is_array($questions)) {
                $questions = $this->extractCompleteObjects($responseText);
            }

            if (!is_array($questions)) {
                throw new \Exception('Invalid JSON format: ' . json_last_error_msg());
            }

            $validatedQuestions = [];
            foreach ($questions as $question) {
                if ($this->isValidQuestion($question)) {
                    $validatedQuestions[] = $this->sanitizeQuestion($question);
                }
            }

            if (empty($validatedQuestions)) {
                throw new \Exception('No valid questions found in response');
            }

            return $validatedQuestions;
        } catch (\Exception $e) {
            Log::error('Quiz Response Parsing Error', [
                'error' => $e->getMessage(),
                'response' => substr($responseText, 0, 1000)
            ]);
            throw new \Exception('Failed to parse quiz response: ' . $e->getMessage());
        }
    }

    private function extractJsonArray(string $text): string
    {
        $start = strpos($text, '[');
        if ($start === false) {
            throw new \Exception('No valid JSON array found in response');
        }

        $end = strrpos($text, ']');
        if ($end === false) {
            return substr($text, $start);
        }

        return substr($text, $start, $end - $start + 1);
    }

    private function fixMalformedJson(string $json): string
    {
        $json = preg_replace('/```[\s\S]*?```/m', '', $json);
        $json = preg_replace('/,\s*([\]}])/m', '$1', $json);
        $json = str_replace("\r\n", '\\n', $json);
        $json = str_replace("\n", '\\n', $json);
        return $json;
    }

    private function extractCompleteObjects(string $text): array
    {
        $objects = [];
        $depth = 0;
        $inString = false;
        $escape = false;
        $buffer = '';

        for ($i = 0, $len = strlen($text); $i < $len; $i++) {
            $char = $text[$i];
            $buffer .= $char;

            if ($escape) {
                $escape = false;
                continue;
            }

            if ($char === '\\') {
                $escape = true;
                continue;
            }

            if ($char === '"') {
                $inString = !$inString;
            }

            if ($inString) {
                continue;
            }

            if ($char === '{') {
                $depth++;
            } elseif ($char === '}') {
                $depth--;
            }

            if ($depth === 0 && strlen(trim($buffer)) > 0 && strpos(trim($buffer), '{') === 0 && str_ends_with(trim($buffer), '}')) {
                $decoded = json_decode($buffer, true);
                if (is_array($decoded) && $this->isValidQuestion($decoded)) {
                    $objects[] = $decoded;
                }
                $buffer = '';
            }
        }

        return $objects;
    }

    /**
     * Validate question structure
     */
    private function isValidQuestion(array $question): bool
    {
        $hasQuestionText = isset($question['question_text']) || isset($question['question']);

        return $hasQuestionText
            && isset($question['options'])
            && is_array($question['options'])
            && count($question['options']) >= 2
            && isset($question['correct_answer'])
            && is_int($question['correct_answer'])
            && $question['correct_answer'] >= 0
            && $question['correct_answer'] < count($question['options']);
    }

    /**
     * Sanitize and format question data
     */
    private function sanitizeQuestion(array $question): array
    {
        return [
            'question' => trim($question['question_text']),
            'question_text' => trim($question['question_text']),
            'options' => array_map('trim', $question['options']),
            'correct_answer' => (int)$question['correct_answer'],
            'correctAnswer' => (int)$question['correct_answer'],
            'explanation' => isset($question['explanation']) 
                ? trim($question['explanation']) 
                : 'No explanation provided',
            'question_type' => 'multiple_choice'
        ];
    }
}
