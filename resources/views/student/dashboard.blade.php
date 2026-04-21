@extends('layouts.app')

@section('title', 'Student Dashboard - ByteLearn')

@section('scripts')
@php
    $currentUser = $student ?? auth()->user();
    $userData = [
        'id' => $currentUser->id,
        'name' => $currentUser->name,
        'email' => $currentUser->email,
        'role' => 'student',
        'location' => $currentUser->locationRecord->location_string ?? $currentUser->location,
        'lat' => $currentUser->locationRecord->latitude ?? null,
        'lon' => $currentUser->locationRecord->longitude ?? null,
        'share_email' => $currentUser->locationRecord->share_email ?? true,
    ];

    $enrolledCoursesData = $enrolledCourses->map(function($enrollment) use ($courseProgress) {
        return [
            'id' => $enrollment->course->id,
            'title' => $enrollment->course->title,
            'instructor' => $enrollment->course->instructor->name ?? 'Instructor',
            'image' => 'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=600',
            'continueUrl' => route('student.continue-learning', ['courseId' => $enrollment->course->id]),
            'progress' => $courseProgress[$enrollment->course->id] ?? 0,
            'currentLesson' => 'Continue Learning',
            'totalLessons' => $enrollment->course->lessons->count(),
            'completedLessons' => round(($courseProgress[$enrollment->course->id] ?? 0) * $enrollment->course->lessons->count() / 100),
            'nextQuiz' => null,
            'lastAccessed' => ($enrollment->updated_at ?? $enrollment->enrollment_date ?? now())->diffForHumans()
        ];
    });

    $notificationsData = $notifications->map(function($notification) {
        return [
            'id' => $notification->id,
            'type' => 'info',
            'message' => $notification->message,
            'time' => $notification->created_at->diffForHumans(),
            'unread' => $notification->read_at === null
        ];
    });
@endphp
<script>
    // Pass Laravel data to React
    document.getElementById('app-data').textContent = JSON.stringify({
        page: 'student-dashboard',
        user: @json($userData),
        dashboardData: {
            enrolledCourses: @json($enrolledCoursesData),
            completedCourses: @json($completedCoursesData),
            notifications: @json($notificationsData),
            privateNotes: @json($privateNotes),
            enrolledLessions: @json($enrolledLessions),
            recentDiscussions: @json($recentDiscussions),
            nearbyStudents: @json($nearbyStudents),
            stats: {
                'ongoingCourses': {{ $ongoingCourses }},
                'completedCourses': {{ $completedCourses }},
                'learningStreak': {{ $learningStreak }},
                'certificatesEarned': {{ $certificatesEarned }}
            },
            courseProgress: @json($courseProgress),
            leaderboard: @json($leaderboard),
            currentUserPoints: {{ $currentUserPoints }}
        }
    });
</script>
@endsection
