<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;

class QuizApiController extends Controller
{
    public function forLesson(Request $request, Lesson $lesson)
    {
        // Frontend expects an array of questions; provide empty set if none.
        // If quiz/questions models exist later, this can be upgraded.
        return response()->json([
            'lesson_id' => $lesson->id,
            'questions' => [],
        ]);
    }
}
