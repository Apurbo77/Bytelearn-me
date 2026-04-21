<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\InstructorDashboardController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\Api\ChatApiController;
use App\Http\Controllers\DiscussionController;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\CertificateController;

Route::get('/', function () {
    return view('welcome');
})->name('home');

// Authentication Routes
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// Lesson AI chat (served from web middleware for session auth + SSE)
Route::prefix('api')
    ->middleware(['auth'])
    ->group(function () {
        Route::post('/lesson/{lesson}/chat', [ChatApiController::class, 'ask']);
        Route::get('/lesson/{lesson}/chat/stream', [ChatApiController::class, 'stream']);
    });


// Course Discovery Routes (Public/Students)
Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
// React Views (Hybrid)
Route::get('/courses/{id}', [CourseController::class, 'show'])->name('courses.show');
Route::get('/courses/{id}/edit', [CourseController::class, 'edit'])->name('courses.edit')->middleware('auth');
Route::get('/courses/{id}/learn/lessons/{lessonId?}', [CourseController::class, 'learn'])->name('courses.learn')->middleware('auth');


// Student Routes
Route::prefix('student')
    ->middleware(['auth', 'role:student'])
    ->group(function () {
        Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');
        Route::get('/courses', [StudentDashboardController::class, 'courses'])->name('student.courses');
        Route::get('/completed', [StudentDashboardController::class, 'completedCourses'])->name('student.completed-courses');
        Route::get('/continue/{courseId}', [StudentDashboardController::class, 'continueLearning'])->name('student.continue-learning');
        Route::put('/profile/location', [StudentDashboardController::class, 'updateLocation'])->name('student.profile.location');

        // Certificates
        Route::get('/certificates', [CertificateController::class, 'index'])->name('student.certificates');

        // Enrollment
        Route::post('/enroll/{courseId}', [EnrollmentController::class, 'store'])->name('student.enroll');
        Route::delete('/unenroll/{enrollmentId}', [EnrollmentController::class, 'destroy'])->name('student.unenroll');


        // Lessons
        Route::get('/lesson/{id}', [LessonController::class, 'view'])->name('student.lesson.view');
        Route::post('/lesson/{id}/complete', [LessonController::class, 'markComplete'])->name('student.lesson.complete');


        // Discussions
        Route::get('/lesson/{lessonId}/discussions', [DiscussionController::class, 'index'])->name('student.discussions.index');
        Route::post('/lesson/{lessonId}/discussion', [DiscussionController::class, 'store'])->name('student.discussion.store');
        Route::get('/discussion/{discussionId}', [DiscussionController::class, 'show'])->name('student.discussion.show');
        Route::post('/discussion/{discussionId}/reply', [DiscussionController::class, 'reply'])->name('student.discussion.reply');

        // Private Notes
        Route::get('/notes', [NotesController::class, 'index'])->name('student.notes.index');
        Route::post('/notes', [NotesController::class, 'store'])->name('student.notes.store');
        Route::put('/notes/{note}', [NotesController::class, 'update'])->name('student.notes.update');
        Route::delete('/notes/{note}', [NotesController::class, 'destroy'])->name('student.notes.destroy');

        // Lesson-Specific Notes
        Route::get('/lesson/{lessonId}/notes', [NotesController::class, 'getLessonNotes'])->name('student.lesson.notes.index');
        Route::post('/lesson/{lessonId}/notes', [NotesController::class, 'storeLessonNote'])->name('student.lesson.notes.store');
        Route::put('/lesson-notes/{note}', [NotesController::class, 'updateLessonNote'])->name('student.lesson.notes.update');
        Route::delete('/lesson-notes/{note}', [NotesController::class, 'deleteLessonNote'])->name('student.lesson.notes.delete');

        // Course Completion
        Route::post('/course/{courseId}/complete', [CertificateController::class, 'completeCourse'])->name('student.course.complete');
    });

    

// Instructor Routes
Route::prefix('instructor')
    ->middleware(['auth', 'role:instructor'])
    ->group(function () {
        Route::get('/dashboard', [InstructorDashboardController::class, 'index'])->name('instructor.dashboard');
        Route::get('/courses', [InstructorDashboardController::class, 'courses'])->name('instructor.courses');
        Route::get('/course/{courseId}/analytics', [InstructorDashboardController::class, 'courseAnalytics'])->name('instructor.course.analytics');

          // Course Management
        Route::get('/courses/create', [CourseController::class, 'create'])->name('instructor.courses.create');
        Route::post('/courses', [CourseController::class, 'store'])->name('instructor.courses.store');
        Route::get('/courses/{id}/edit', [CourseController::class, 'edit'])->name('instructor.courses.edit');
        Route::patch('/courses/{id}', [CourseController::class, 'update'])->name('instructor.courses.update');
        Route::post('/courses/{id}/publish', [CourseController::class, 'toggleStatus'])->name('instructor.courses.publish');
        Route::delete('/courses/{id}', [CourseController::class, 'destroy'])->name('instructor.courses.destroy');
        
        // Lesson Management
        Route::get('/courses/{courseId}/lesson/create', [LessonController::class, 'create'])->name('instructor.lessons.create');
        Route::post('/courses/{courseId}/lesson', [LessonController::class, 'store'])->name('instructor.lessons.store');
        

        });

// API Routes for React Frontend
Route::middleware(['auth'])->prefix('api')->group(function () {
    // Instructor Course Management
    Route::get('/instructor/courses', [CourseController::class, 'instructorCourses']);
    Route::post('/courses', [CourseController::class, 'store']);
    Route::put('/courses/{id}', [CourseController::class, 'update']);
    Route::post('/courses/{id}/toggle-status', [CourseController::class, 'toggleStatus']);
    Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

    // Lesson Management
    Route::post('/lessons', [LessonController::class, 'store']);
    Route::post('/lessons/reorder', [LessonController::class, 'reorder']);
    Route::put('/lessons/{id}', [LessonController::class, 'update']);
    Route::delete('/lessons/{id}', [LessonController::class, 'destroy']);

    // Enrollment Progress
    Route::post('/enrollments/progress', [EnrollmentController::class, 'updateProgress']);
});


