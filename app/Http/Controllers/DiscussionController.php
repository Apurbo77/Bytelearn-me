<?php

namespace App\Http\Controllers;

use App\Models\Discussion;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiscussionController extends Controller
{
    /**
     * Show discussions for a lesson
     */
    public function index($lessonId)
    {
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        $discussions = $lesson->discussions()->whereNull('parent_id')->with('user', 'replies.user')->paginate(10);

        return view('student.discussions.index', [
            'lesson' => $lesson,
            'discussions' => $discussions,
        ]);
    }

    /**
     * Create new discussion
     */
    public function store(Request $request, $lessonId)
    {
        $lesson = Lesson::with('course')->findOrFail($lessonId);
        $user = Auth::user();

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $discussion = Discussion::create([
            'lesson_id' => $lessonId,
            'user_id' => $user->id,
            'content' => $validated['content'],
            'parent_id' => null,
        ]);

        return back()->with('success', 'Discussion posted successfully!');
    }

    /**
     * Show discussion detail
     */
    public function show($discussionId)
    {
        $discussion = Discussion::with('user', 'replies.user')->findOrFail($discussionId);

        return view('student.discussions.show', ['discussion' => $discussion]);
    }

    /**
     * Add reply to discussion
     */
    public function reply(Request $request, $discussionId)
    {
        $discussion = Discussion::findOrFail($discussionId);
        $user = Auth::user();

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        Discussion::create([
            'lesson_id' => $discussion->lesson_id,
            'user_id' => $user->id,
            'parent_id' => $discussionId,
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Reply posted successfully!');
    }
}

