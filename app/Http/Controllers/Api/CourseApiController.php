<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseApiController extends Controller
{
    public function categories()
    {
        $categories = Course::query()
            ->whereNotNull('category')
            ->where('category', '<>', '')
            ->where('status', 'published')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json($categories);
    }

    public function featured()
    {
        // Homepage expects a simplified payload (e.g. instructor name as string).
        $courses = Course::query()
            ->with('instructor')
            ->withCount(['lessons', 'enrollments'])
            ->withAvg('reviews', 'rating')
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->limit(4)
            ->get()
            ->map(function (Course $course) {
                $lessonsCount = (int) ($course->lessons_count ?? 0);
                $studentsCount = (int) ($course->enrollments_count ?? 0);
                $rating = $course->reviews_avg_rating;

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'instructor' => $course->instructor->name ?? 'Unknown Instructor',
                    'image' => $course->thumbnail
                        ?? 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800',
                    'rating' => round((float) ($rating ?? 4.5), 1),
                    'students' => $studentsCount,
                    'lessons' => $lessonsCount,
                    'duration' => $lessonsCount . ' lessons',
                    'level' => $course->level ?? 'All Levels',
                ];
            });

        return response()->json($courses->values());
    }

    public function show(Course $course)
    {
        $course->load(['lessons', 'instructor']);
        return response()->json($course);
    }

    public function update(Request $request, Course $course)
    {
        // Authorization check
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Minimal validation to match editor payload.
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'learning_outcomes' => 'nullable|string',
            'status' => 'sometimes|in:draft,published,archived',
        ]);

        $course->fill($validated);
        $course->save();

        $course->load(['lessons', 'instructor']);
        return response()->json($course);
    }

    public function toggleStatus(Course $course)
    {
        // Authorization check
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->status = $course->status === 'published' ? 'draft' : 'published';
        $course->save();

        return response()->json(['status' => $course->status]);
    }
}
