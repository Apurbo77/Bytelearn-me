<?php

namespace App\Http\Controllers;

use App\Models\AIChatInteraction;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatbotController extends Controller
{
    /**
     * Send message to AI learning assistant
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string',
            'lesson_id' => 'required|exists:lessons,id',
        ]);

        $user = Auth::user();
        $lesson = Lesson::with('course')->findOrFail($validated['lesson_id']);

        // Generate AI response (placeholder - integrate with actual AI service)
        $answer = $this->generateAIResponse($validated['question'], $lesson);

        // Save chat interaction
        $interaction = AIChatInteraction::create([
            'user_id' => $user->id,
            'lesson_id' => $validated['lesson_id'],
            'question' => $validated['question'],
            'answer' => $answer,
        ]);

        return response()->json([
            'success' => true,
            'answer' => $answer,
            'interaction_id' => $interaction->id,
        ]);
    }

    /**
     * Generate AI response (placeholder)
     * TODO: Integrate with actual RAG-based AI service
     */
    private function generateAIResponse($question, $lesson)
    {
        // This is a placeholder. In production, this would:
        // 1. Retrieve relevant lesson content using RAG
        // 2. Send to AI model with the question
        // 3. Return context-aware response

        return "I'm your learning assistant for the lesson: " . $lesson->title . ". " .
               "Your question: " . $question . ". " .
               "This is a placeholder response. In production, I would use RAG to ground responses in actual lesson content.";
    }

    /**
     * Get chat history for a lesson
     */
    public function history($lessonId)
    {
        $user = Auth::user();
        $interactions = AIChatInteraction::where('user_id', $user->id)
                                        ->where('lesson_id', $lessonId)
                                        ->orderBy('created_at', 'asc')
                                        ->get();

        return response()->json(['interactions' => $interactions]);
    }
}

