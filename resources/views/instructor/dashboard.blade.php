@extends('layouts.app')

@section('title', 'Instructor Dashboard - ByteLearn')

@section('scripts')
@php
    $userData = [
        'id' => $instructor->id ?? auth()->user()->id,
        'name' => $instructor->name ?? auth()->user()->name,
        'email' => $instructor->email ?? auth()->user()->email,
        'role' => 'instructor'
    ];

    $coursesData = $courses->map(function($course) {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'image' => 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=600',
            'students' => $course->enrollments->count(),
            'status' => ucfirst($course->status),
            'completionRate' => 0,
            'rating' => 0, // $course->averageRating() not implemented
            'reviews' => 0, // $course->totalReviews() not implemented
            'revenue' => '$0',
            'lessons' => $course->lessons->count(),
            'lastUpdated' => $course->updated_at->diffForHumans()
        ];
    });
@endphp
<script>
    // Pass Laravel data to React
    document.getElementById('app-data').textContent = JSON.stringify({
        page: 'instructor-dashboard',
        user: @json($userData),
        dashboardData: {
            courses: @json($coursesData),
            stats: {
                'totalStudents': {{ $totalStudents }},
                'totalCourses': {{ $totalCourses }},
                'totalLessons': {{ $totalLessons }},
                'avgRating': {{ $averageRating }}
            }
        }
    });
</script>
@endsection
