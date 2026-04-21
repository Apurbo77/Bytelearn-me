<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Services\QuizAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class QuizGenerationController extends Controller
{
    private QuizAIService $quizAIService;

    public function __construct(QuizAIService $quizAIService)
    {
        $this->quizAIService = $quizAIService;
        $this->middleware('auth');
    }

    /**
     * Generate quiz questions using AI
     * POST /instructor/lesson/{lessonId}/quiz/generate
     */
    public function generate(Request $request, $lessonId)
    {
        try {
            // Validate request
            $request->validate([
                'lessonTitle' => 'required|string|max:500',
                'lessonContent' => 'required|string',
                'videoUrl' => 'nullable|url',
                'existingCount' => 'nullable|integer|min:0',
            ]);

            // Find the lesson
            $lesson = Lesson::findOrFail($lessonId);

            // Check authorization - user must be the instructor of this course
            $this->authorizeInstructor($lesson);

            $existingCount = $request->input('existingCount', 0);
            $numberOfQuestions = min(6 - $existingCount, 3); // Generate up to 3 questions at a time

            if ($numberOfQuestions <= 0) {
                return response()->json([
                    'error' => 'Maximum of 6 questions per quiz reached',
                ], 422);
            }

            // Call AI service to generate questions
            $generatedQuestions = $this->quizAIService->generateQuizQuestions(
                $request->input('lessonTitle'),
                $request->input('lessonContent'),
                $numberOfQuestions,
                $request->input('videoUrl')
            );

            // Format questions for frontend
            $formattedQuestions = collect($generatedQuestions)->map(function ($question) {
                return [
                    'question' => $question['question'] ?? $question['question_text'],
                    'question_text' => $question['question_text'],
                    'options' => $question['options'],
                    'correct_answer' => $question['correct_answer'],
                    'correctAnswer' => $question['correct_answer'],
                    'explanation' => $question['explanation'],
                    'question_type' => $question['question_type'] ?? 'multiple_choice',
                    'is_temp' => true, // Mark as temporary until saved
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'questions' => $formattedQuestions,
                'count' => count($formattedQuestions),
            ]);

        } catch (\Exception $e) {
            Log::error('Quiz Generation Error', [
                'lessonId' => $lessonId,
                'userId' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => $e->getMessage() ?? 'Failed to generate quiz',
            ], 500);
        }
    }

    /**
     * Save generated quiz questions
     * POST /instructor/lesson/{lessonId}/quiz/save
     */
    public function saveQuiz(Request $request, $lessonId)
    {
        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'questions' => 'required|array|min:1',
                'questions.*.question_text' => 'required_without:questions.*.question|string',
                'questions.*.question' => 'required_without:questions.*.question_text|string',
                'questions.*.options' => 'required|array|min:2|max:4',
                'questions.*.correct_answer' => 'required|integer',
                'questions.*.explanation' => 'nullable|string',
            ]);

            $lesson = Lesson::findOrFail($lessonId);
            $this->authorizeInstructor($lesson);

            // Create or update quiz
            $quiz = Quiz::updateOrCreate(
                ['lesson_id' => $lessonId],
                [
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'ai_generated' => true,
                ]
            );

            // Delete existing questions if updating
            QuizQuestion::where('quiz_id', $quiz->id)->delete();

            // Save questions
            foreach ($request->input('questions') as $question) {
                QuizQuestion::create([
                    'quiz_id' => $quiz->id,
                    'question_text' => $question['question_text'] ?? $question['question'],
                    'question_type' => $question['question_type'] ?? 'multiple_choice',
                    'options' => $question['options'],
                    'correct_answer' => $question['correct_answer'],
                    'explanation' => $question['explanation'] ?? null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Quiz saved successfully',
                'quiz_id' => $quiz->id,
                'questions_count' => count($request->input('questions')),
            ]);

        } catch (\Exception $e) {
            Log::error('Quiz Save Error', [
                'lessonId' => $lessonId,
                'userId' => Auth::id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to save quiz: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get quiz questions (for loading saved quizzes)
     * GET /instructor/lesson/{lessonId}/quiz/questions
     */
    public function getQuestions($lessonId)
    {
        try {
            $lesson = Lesson::findOrFail($lessonId);
            $this->authorizeInstructor($lesson);

            $quiz = Quiz::where('lesson_id', $lessonId)->first();

            if (!$quiz) {
                return response()->json([
                    'success' => true,
                    'quiz' => null,
                    'questions' => [],
                ]);
            }

            $questions = $quiz->questions()->get()->map(function ($q) {
                return [
                    'id' => $q->id,
                    'question' => $q->question_text,
                    'question_text' => $q->question_text,
                    'options' => $q->options,
                    'correct_answer' => $q->correct_answer,
                    'correctAnswer' => $q->correct_answer,
                    'explanation' => $q->explanation,
                    'question_type' => $q->question_type,
                ];
            });

            return response()->json([
                'success' => true,
                'quiz' => [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'description' => $quiz->description,
                    'ai_generated' => $quiz->ai_generated,
                ],
                'questions' => $questions,
            ]);

        } catch (\Exception $e) {
            Log::error('Get Quiz Questions Error', [
                'lessonId' => $lessonId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to load quiz',
            ], 500);
        }
    }

    /**
     * Check if user is the instructor of the lesson's course
     */
    private function authorizeInstructor(Lesson $lesson)
    {
        $userId = Auth::id();
        $course = $lesson->course;

        if (!$course || $course->instructor_id != $userId) {
            abort(403, 'Unauthorized to edit this lesson');
        }
    }
}
