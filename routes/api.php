<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CourseApiController;
use App\Http\Controllers\Api\LessonApiController;
use App\Http\Controllers\Api\EnrollmentApiController;
use App\Http\Controllers\Api\QuizApiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Lesson Quiz API (public for enrolled students)
Route::get('/lesson/{lessonId}/quiz', function ($lessonId) {
    $lesson = \App\Models\Lesson::findOrFail($lessonId);
    $quiz = \App\Models\Quiz::where('lesson_id', $lessonId)->first();
    
    if (!$quiz) {
        return response()->json(['questions' => []]);
    }
    
    $questions = \App\Models\QuizQuestion::where('quiz_id', $quiz->id)->get()->map(function ($q) {
        return [
            'id' => $q->id,
            'question' => $q->question_text,
            'options' => $q->options ?? [],
            'correctAnswer' => $q->correct_answer,
        ];
    });
    
    return response()->json(['questions' => $questions]);
});

// Lesson AI Chat
Route::post('/lesson/{lessonId}/chat', [\App\Http\Controllers\LessonChatController::class, 'chat']);

Route::prefix('courses')->group(function () {
    Route::get('/categories', [CourseApiController::class, 'categories']);
    Route::get('/featured', [CourseApiController::class, 'featured']);
    Route::get('/{course}', [CourseApiController::class, 'show']);
    Route::put('/{course}', [CourseApiController::class, 'update'])->middleware(['web', 'auth']);
    Route::post('/{course}/toggle-status', [CourseApiController::class, 'toggleStatus'])->middleware(['web', 'auth']);
});

Route::prefix('lessons')->group(function () {
    Route::post('/', [LessonApiController::class, 'store'])->middleware(['web', 'auth']);
    Route::put('/{lesson}', [LessonApiController::class, 'update'])->middleware(['web', 'auth']);
    Route::delete('/{lesson}', [LessonApiController::class, 'destroy'])->middleware(['web', 'auth']);
    Route::post('/reorder', [LessonApiController::class, 'reorder'])->middleware(['web', 'auth']);
});

Route::post('/enrollments/progress', [EnrollmentApiController::class, 'updateProgress'])->middleware('auth:sanctum');

Route::get('/lesson/{lesson}/quiz', [QuizApiController::class, 'forLesson']);

// Instructor Quiz Generation with AI
Route::post('/instructor/lesson/{lessonId}/quiz/generate', [\App\Http\Controllers\QuizGenerationController::class, 'generate'])->middleware(['web', 'auth']);
Route::post('/instructor/lesson/{lessonId}/quiz/save', [\App\Http\Controllers\QuizGenerationController::class, 'saveQuiz'])->middleware(['web', 'auth']);
Route::get('/instructor/lesson/{lessonId}/quiz/questions', [\App\Http\Controllers\QuizGenerationController::class, 'getQuestions'])->middleware(['web', 'auth']);
