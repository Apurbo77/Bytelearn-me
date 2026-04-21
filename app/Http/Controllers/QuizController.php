<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Lesson;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class QuizController extends Controller
{
    /**
     * Show quiz questions
     */
    public function show($quizId)
    {
        $quiz = Quiz::with('attempts', 'lesson.course')->findOrFail($quizId);
        $student = Auth::user();
        $course = $quiz->lesson->course;

        // Check enrollment
        $isEnrolled = $course->enrollments()
                            ->where('user_id', $student->id)
                            ->exists();

        if (!$isEnrolled && $course->instructor_id !== $student->id) {
            abort(403, 'Not enrolled in this course');
        }

        return view('student.quizzes.show', ['quiz' => $quiz]);
    }

    // /**
    //  * Submit quiz answers
    //  */
    // public function submit(Request $request, $quizId)
    // {
    //     $quiz = Quiz::findOrFail($quizId);
    //     $student = Auth::user();

    //     $score = $request->input('score', 0);
    //     $attempt = QuizAttempt::create([
    //         'quiz_id' => $quizId,
    //         'user_id' => $student->id,
    //         'score' => $score,
    //         'attempt_date' => now(),
    //     ]);

    //     return redirect()->route('student.quiz.result', $attempt->id)
    //                    ->with('success', 'Quiz submitted successfully!');
    // }


// /*New Implementation*/ 
public function submit(Request $request, $quizId)
{
    $quiz = Quiz::findOrFail($quizId);
    $student = Auth::user();

    // Expect answers in request, e.g., {"answers": {"question_id": "selected_option_index", ...}}
    $answers = $request->input('answers', []);
    
    $score = 0;
    $totalQuestions = $quiz->questions->count();
    
    foreach ($quiz->questions as $question) {
        $userAnswer = $answers[$question->id] ?? null;
        if ($userAnswer == $question->correct_answer) {
            $score++;
        }
    }
    
    $percentage = $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;

    $attempt = QuizAttempt::create([
        'quiz_id' => $quizId,
        'user_id' => $student->id,
        'score' => $percentage,  // Save as percentage
        'attempt_date' => now(),
    ]);

    // For API, return JSON instead of redirect
    if ($request->wantsJson()) {
        return response()->json([
            'success' => true,
            'attempt_id' => $attempt->id,
            'score' => $percentage,
        ]);
    }

    return redirect()->route('student.quiz.result', $attempt->id)
                   ->with('success', 'Quiz submitted successfully!');
    }
}