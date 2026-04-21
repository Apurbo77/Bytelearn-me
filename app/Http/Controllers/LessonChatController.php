<?php

namespace App\Http\Controllers;

use App\Models\AIChatInteraction;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonChatController extends Controller
{
    /**
     * Handle incoming chat messages from the lesson player.
     */
    public function chat(Request $request, $lessonId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $lesson = Lesson::findOrFail($lessonId);
        $userMessage = $request->input('message');
        
        // Ensure user is authenticated to track history, though it's optional for the response
        $userId = Auth::id();

        // 1. You can fetch previous message history if you want to pass context to an LLM
        $interaction = null;
        if ($userId) {
            $interaction = AIChatInteraction::firstOrCreate(
                ['user_id' => $userId, 'lesson_id' => $lessonId],
                ['message_history' => []]
            );

            // Append user message to history
            $history = $interaction->message_history ?? [];
            $history[] = ['role' => 'user', 'content' => $userMessage];
            $interaction->update(['message_history' => $history]);
        }

        // 2. GENERATE AI RESPONSE 
        // NOTE: Since there's no OpenAI or Gemini SDK installed, this is a simulated response.
        // To fully implement, you would pass `$userMessage` and `$history` to the AI API here.
        
        $simulatedReply = "I am your AI Learning Assistant! You asked about: '{$userMessage}' in the context of the lesson '{$lesson->title}'. Currently, my brain is not hooked up to a real LLM, but I'm ready for you to integrate one!";
        
        if (stripos($userMessage, 'help') !== false) {
            $simulatedReply = "I'm here to help! Review the lesson video and let me know which concept is confusing.";
        }

        // 3. Append Assistant response to history
        if ($interaction) {
            $history = $interaction->message_history ?? [];
            $history[] = ['role' => 'assistant', 'content' => $simulatedReply];
            $interaction->update(['message_history' => $history]);
        }

        // Return JSON response format expected by LessonPlayer.tsx
        return response()->json([
            'reply' => $simulatedReply
        ]);
    }
}
