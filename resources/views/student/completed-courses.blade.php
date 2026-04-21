@extends('layouts.app')

@section('title', 'Completed Courses - ByteLearn')

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-baseline justify-between gap-4 mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Completed Courses</h1>
        <a href="{{ route('student.dashboard') }}" class="text-blue-600 hover:text-blue-700 font-medium">Back to dashboard</a>
    </div>

    @if ($completedCourses->count() === 0)
        <div class="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-600">
            <p class="text-lg">No completed courses yet.</p>
            <p class="mt-2">Finish a course to earn a certificate.</p>
        </div>
    @else
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Completed</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        @foreach ($completedCourses as $certificate)
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4">
                                    <div class="font-semibold text-gray-900">{{ $certificate->course->title ?? 'Course' }}</div>
                                    <div class="text-sm text-gray-600">Instructor: {{ $certificate->course->instructor->name ?? 'Instructor' }}</div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-700">
                                    {{ optional($certificate->created_at)->format('M d, Y') ?? '—' }}
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex justify-end gap-3">
                                        <a
                                            href="{{ route('courses.show', $certificate->course_id) }}"
                                            class="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Details
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>

        <div class="mt-6">
            {{ $completedCourses->links() }}
        </div>
    @endif
</div>
@endsection
