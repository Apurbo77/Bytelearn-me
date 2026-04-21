<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CourseController extends Controller
{
    // List distinct categories
    public function categories()
    {
        $categories = Course::whereNotNull('category')
                            ->where('category', '<>', '')
                            ->where('status', 'published')
                            ->distinct()
                            ->pluck('category');
        return response()->json($categories);
    }

    // List all courses (for Student Catalog)
    public function index(Request $request)
    {
        $query = Course::query()->with('instructor')->where('status', 'published');

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->has('category') && $request->category != '') {
            $query->where('category', $request->category);
        }

        $courses = $query->paginate(12);

        if ($request->wantsJson() || $request->is('api/*')) {
             return response()->json($courses);
        }

        // Get enrolled course IDs for the current user
        $enrolledCourseIds = [];
        if (auth()->check()) {
            $enrolledCourseIds = \App\Models\Enrollment::where('user_id', auth()->id())
                ->pluck('course_id')
                ->toArray();
        }

        return view('courses.index', [
            'data' => [
                'page' => 'courses', // New page type
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'role' => auth()->user()->role
                ] : null,
                'courses' => $courses->items(),
                'enrolledCourseIds' => $enrolledCourseIds,
                'pagination' => $courses // Pass full pagination object if needed later
            ]
        ]);
    }

    // List instructor's courses
    public function instructorCourses(Request $request)
    {
        $instructorId = auth()->id() ?: $request->input('instructor_id', 1);
        
        $courses = Course::where('instructor_id', $instructorId)
                         ->withCount('enrollments')
                         ->get();
        return response()->json($courses);
    }

    // Create a new course
    public function create()
    {
        return view('instructor.courses.create', [
            'data' => [
                'page' => 'blade',
                'user' => auth()->user()
            ]
        ]);
    }

    // Store a new course
    public function store(Request $request)
    {
        // Automatically set instructor_id from auth user if not present
        if (!$request->has('instructor_id') && auth()->check()) {
            $request->merge(['instructor_id' => auth()->id()]);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'instructor_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson() || $request->is('api/*')) {
                \Illuminate\Support\Facades\Log::error('Course Creation Failed', $validator->errors()->toArray());
                return response()->json($validator->errors(), 422);
            }
            return back()->withErrors($validator)->withInput();
        }

        // Use except('_token') to avoid mass assignment errors with guarded=[]
        $courseData = $request->except('_token');
        $course = Course::create($courseData);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json($course, 201);
        }

        // Redirect to course editor with success message
        return redirect()->route('instructor.courses.edit', $course->id)
            ->with('success', 'Course created successfully! Now you can add lessons and publish it.');
    }

    // Show course details
    public function show(Request $request, $id)
    {
        $course = Course::with(['lessons', 'instructor'])->find($id);

        if (!$course) {
            if ($request->wantsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Course not found'], 404);
            }
            abort(404);
        }

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json($course);
        }

        // Return View for React
        return view('courses.show', [
            'data' => [
                'page' => 'course-details',
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'role' => auth()->user()->role
                ] : null,
                'course' => $course
            ]
        ]);
    }

    // Learn (Lesson Player)
    public function learn(Request $request, $courseId, $lessonId = null)
    {
        $course = Course::with('lessons')->findOrFail($courseId);
        
        return view('courses.learn', [
            'data' => [
                'page' => 'lesson-player',
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'role' => auth()->user()->role
                ] : null,
                'courseId' => (int)$courseId,
                'lessonId' => $lessonId ? (int)$lessonId : null
            ]
        ]);
    }

    // Edit course (Instructor)
    public function edit(Request $request, $id)
    {
        $course = Course::with('lessons')->find($id);

        if (!$course) {
            abort(404);
        }

        // Authorization check
        if ($course->instructor_id !== auth()->id()) {
            abort(403);
        }

        return view('instructor.courses.edit', [
            'course' => $course,
            'data' => [
                'page' => 'course-editor',
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                    'role' => auth()->user()->role
                ] : null,
                'courseId' => (int)$id
            ]
        ]);
    }

    // Update course
    public function update(Request $request, $id)
    {
        $course = Course::find($id);

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Authorization check
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->update($request->all());

        return response()->json($course);
    }

    // Publish/Unpublish
    public function toggleStatus($id)
    {
        $course = Course::find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Authorization check
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->status = $course->status === 'published' ? 'draft' : 'published';
        $course->save();

        return response()->json(['status' => $course->status]);
    }

    // Delete course
    public function destroy($id)
    {
        $course = Course::find($id);
        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        // Authorization check
        if ($course->instructor_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $course->delete(); // Cascading delete handled by DB constraints or model events
        return response()->json(['message' => 'Course deleted successfully']);
    }
}
