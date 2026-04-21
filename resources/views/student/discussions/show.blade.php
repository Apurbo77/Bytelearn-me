@extends('layouts.app')

@section('content')
<div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
        {{-- Back Button --}}
        <div class="mb-6">
            <a href="{{ route('student.dashboard') }}" class="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Dashboard
            </a>
        </div>

        {{-- Main Discussion --}}
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {{ substr($discussion->user->name, 0, 1) }}
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900">{{ $discussion->user->name }}</h3>
                            <p class="text-sm text-gray-500">{{ $discussion->created_at->format('M d, Y \a\t h:i A') }}</p>
                        </div>
                    </div>
                </div>
                <div class="prose prose-sm max-w-none">
                    <p class="text-gray-700 whitespace-pre-wrap">{{ $discussion->content }}</p>
                </div>
            </div>
        </div>

        {{-- Replies Section --}}
        @if($discussion->replies->count() > 0)
            <div class="mb-6">
                <h2 class="text-xl font-bold mb-4">Replies ({{ $discussion->replies->count() }})</h2>
                <div class="space-y-4">
                    @foreach($discussion->replies as $reply)
                        <div class="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                            <div class="flex items-start gap-3 mb-3">
                                <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {{ substr($reply->user->name, 0, 1) }}
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">{{ $reply->user->name }}</h4>
                                    <p class="text-xs text-gray-500">{{ $reply->created_at->format('M d, Y \a\t h:i A') }}</p>
                                </div>
                            </div>
                            <p class="text-gray-700 text-sm whitespace-pre-wrap ml-13">{{ $reply->content }}</p>
                        </div>
                    @endforeach
                </div>
            </div>
        @else
            <div class="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8 mb-6 text-center">
                <p class="text-gray-500">No replies yet. Be the first to reply!</p>
            </div>
        @endif

        {{-- Add Reply Form --}}
        @auth
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold mb-4">Add Your Reply</h3>
            <form action="{{ route('student.discussion.reply', $discussion->id) }}" method="POST">
                @csrf
                <div class="mb-4">
                    <textarea 
                        name="content" 
                        rows="4" 
                        placeholder="Share your thoughts or answer..."
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none @error('content') border-red-500 @enderror"
                        required
                    ></textarea>
                    @error('content')
                        <p class="text-red-500 text-sm mt-2">{{ $message }}</p>
                    @enderror
                </div>
                <div class="flex justify-end gap-3">
                    <a href="{{ route('student.dashboard') }}" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Cancel
                    </a>
                    <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Post Reply
                    </button>
                </div>
            </form>
        </div>
        @else
            <div class="bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
                <p class="text-blue-900">Please <a href="{{ route('login') }}" class="font-semibold underline">log in</a> to reply to discussions.</p>
            </div>
        @endauth
    </div>
</div>
@endsection
