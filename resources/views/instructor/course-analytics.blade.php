@extends('layouts.app')

@section('title', 'Course Analytics - ' . $course->title)

@section('scripts')
@php
    $userData = [
        'id' => auth()->user()->id,
        'name' => auth()->user()->name,
        'email' => auth()->user()->email,
        'role' => 'instructor'
    ];

    $reviewsData = $reviews->map(function($review) {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'userName' => $review->user->name ?? 'Anonymous',
            'createdAt' => $review->created_at->diffForHumans(),
        ];
    });
@endphp
<script>
    document.getElementById('app-data').textContent = JSON.stringify({
        page: 'instructor-analytics',
        user: @json($userData),
        analyticsData: {
            courseId: {{ $course->id }},
            courseTitle: @json($course->title),
            totalEnrollments: {{ $totalEnrollments }},
            enrollmentsThisWeek: {{ $enrollmentsThisWeek }},
            averageRating: {{ $averageRating }},
            totalReviews: {{ $totalReviews }},
            ratingDistribution: @json($ratingDistribution),
            reviews: @json($reviewsData)
        }
    });
</script>
@endsection
