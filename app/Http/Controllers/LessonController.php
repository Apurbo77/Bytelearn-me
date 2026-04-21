<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\QuizAttempt;
use App\Models\Enrollment;
class LessonController extends Controller
{
    // View a lesson (for students)
    public function view(Request $request, $id)
    {
        $lesson = Lesson::with('course')->findOrFail($id);
        $course = $lesson->course;

        // Check enrollment
        $isEnrolled = \App\Models\Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->exists();

        if (!$isEnrolled) {
            return redirect()->route('courses.show', $course->id)
                           ->with('error', 'You must be enrolled to view this lesson.');
        }

        // Update learning streak for consecutive day tracking
        auth()->user()->updateLearningStreak();

        // Use the learn view (LessonPlayer)
        return view('courses.learn', [
            'data' => [
                'page' => 'lesson-player',
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'role' => auth()->user()->role
                ] : null,
                'courseId' => (int)$course->id,
                'lessonId' => (int)$id
            ]
        ]);
    }

// #complete history
public function markComplete(Request $request)
{
    $request->validate([
        'lesson_id' => 'required|exists:lessons,id',
    ]);

    $lesson = Lesson::with('course')->findOrFail($request->lesson_id);
    $course = $lesson->course;

    // Must be enrolled
    $enrollment = Enrollment::where('user_id', auth()->id())
        ->where('course_id', $course->id)
        ->first();

    if (!$enrollment) {
        return response()->json(['success' => false, 'message' => 'Not enrolled'], 403);
    }

    // Option A (current system): mark completion by creating a quiz attempt,
    // because progress is computed from quiz_attempts in Enrollment::updateProgress()
    $quiz = $lesson->quizzes()->first();
    if ($quiz) {
        QuizAttempt::firstOrCreate(
            ['quiz_id' => $quiz->id, 'user_id' => auth()->id()],
            ['score' => 0, 'attempt_date' => now()]
        );
    }

    // Recalculate progress after marking completion
    $enrollment->updateProgress();
    $enrollment->save();

    return response()->json([
        'success' => true,
        'progress' => $enrollment->progress,
    ]);
}
    // Add a lesson to a course
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'pdf_url' => 'nullable|url', 
            'external_link' => 'nullable|url',
            'external_link_label' => 'nullable|string|max:255',
            'sequence_number' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Auto-detect 'content_type'
        $data = $request->all();
        if ($request->video_url && $request->content) {
            $data['content_type'] = 'mixed';
        } elseif ($request->video_url) {
            $data['content_type'] = 'video';
        } elseif ($request->pdf_url) {
            $data['content_type'] = 'pdf';
        } elseif ($request->external_link) {
            $data['content_type'] = 'link';
        } else {
            $data['content_type'] = 'text';
        }
        
        $lesson = Lesson::create($data);

        return response()->json($lesson, 201);
    }

    // Update a lesson
    public function update(Request $request, $id)
    {
        $lesson = Lesson::find($id);

        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'pdf_url' => 'nullable|url', 
            'external_link' => 'nullable|url',
            'external_link_label' => 'nullable|string|max:255',
            'sequence_number' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();

        // Recalculate content_type if fields are being updated
        if ($request->hasAny(['video_url', 'content', 'pdf_url', 'external_link'])) {
            $hasVideo = $request->has('video_url') ? $request->video_url : $lesson->video_url;
            $hasContent = $request->has('content') ? $request->content : $lesson->content;
            $hasPdf = $request->has('pdf_url') ? $request->pdf_url : $lesson->pdf_url;
            $hasLink = $request->has('external_link') ? $request->external_link : $lesson->external_link;

            if ($hasVideo && $hasContent) {
                $data['content_type'] = 'mixed';
            } elseif ($hasVideo) {
                $data['content_type'] = 'video';
            } elseif ($hasPdf) {
                $data['content_type'] = 'pdf';
            } elseif ($hasLink) {
                $data['content_type'] = 'link';
            } else {
                $data['content_type'] = 'text';
            }
        }

        $lesson->update($data);

        return response()->json($lesson);
    }

    // Delete a lesson
    public function destroy($id)
    {
        $lesson = Lesson::find($id);
        if (!$lesson) {
            return response()->json(['message' => 'Lesson not found'], 404);
        }
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }

    // Reorder lessons
    public function reorder(Request $request)
    {
        $request->validate([
            'lessons' => 'required|array',
            'lessons.*.id' => 'required|exists:lessons,id',
            'lessons.*.sequence_number' => 'required|integer',
        ]);

        foreach ($request->lessons as $item) {
            Lesson::where('id', $item['id'])->update(['sequence_number' => $item['sequence_number']]);
        }

        return response()->json(['message' => 'Lessons reordered successfully']);
    }
}
