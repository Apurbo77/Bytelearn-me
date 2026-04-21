<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class EnrollmentApiController extends Controller
{
    public function updateProgress(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'progress' => 'required|numeric|min:0|max:100',
        ]);

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $validated['course_id'])
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $enrollment->progress = $validated['progress'];
        $enrollment->save();

        return response()->json(['message' => 'Progress updated', 'progress' => $enrollment->progress]);
    }
}
