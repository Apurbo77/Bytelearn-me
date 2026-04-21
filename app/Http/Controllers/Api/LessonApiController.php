<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LessonApiController extends Controller
{
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

    public function update(Request $request, Lesson $lesson)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
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

    public function destroy(Lesson $lesson)
    {
        $lesson->delete();
        return response()->json(['message' => 'Lesson deleted']);
    }

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
