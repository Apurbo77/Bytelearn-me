<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class EnrollmentController extends Controller
{
    /**
     * Enroll student in course
     */
    public function store(Request $request, $courseId)
    {
        $student = Auth::user();
        $course = Course::where('status', 'published')->findOrFail($courseId);

        // Check if already enrolled
        $existingEnrollment = Enrollment::where('user_id', $student->id)
                                        ->where('course_id', $courseId)
                                        ->first();

        if ($existingEnrollment) {
            if ($request->wantsJson() || $request->is('api/*')) {
                 return response()->json(['message' => 'Already enrolled'], 200);
            }
            return back()->with('info', 'Already enrolled in this course');
        }

        // Create enrollment
        Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $courseId,
            'enrollment_date' => now(),
            'progress' => 0,
        ]);
        // 📩 EMAIL: Course Enrollment (best-effort)
        try {
            NotificationService::send($student, 'You have successfully enrolled in the course!');
        } catch (\Throwable $e) {
            // ignore
        }

        if ($request->wantsJson() || $request->is('api/*')) {
             return response()->json(['message' => 'Successfully enrolled'], 201);
             
        }

        return redirect()->route('student.dashboard')
                       ->with('success', 'Successfully enrolled in course!');
    }

    /**
     * Unenroll from course
     */
    public function destroy($enrollmentId)
    {
        $student = Auth::user();
        $enrollment = Enrollment::findOrFail($enrollmentId);

        if ($enrollment->user_id !== $student->id) {
            abort(403, 'Unauthorized');
        }

        $enrollment->delete();

        return back()->with('success', 'Unenrolled from course successfully!');
    }
    /**
     * Update progress
     */
    public function updateProgress(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'progress' => 'required|integer|min:0|max:100',
        ]);

        $student = Auth::user();

        $courseId = (int) $request->course_id;
        $enrollment = Enrollment::where('user_id', $student->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$enrollment) {
            return response()->json(['message' => 'Enrollment not found'], 404);
        }

        $previousProgress = (int) ($enrollment->progress ?? 0);
        $newProgress = (int) $request->progress;

        $enrollment->progress = $newProgress;
        $enrollment->save();

        // 📩 Send completion email only once
        if ($newProgress >= 100 && $previousProgress < 100) {
            try {
                NotificationService::send($student, 'Congratulations! You have completed the course 🎉');
            } catch (\Throwable $e) {
                // ignore
            }
        }

        // Update learning streak for consecutive day tracking
        $student->updateLearningStreak();

        // Auto-issue certificate when progress hits 100% (idempotent)
        if ($newProgress >= 100) {
            $course = Course::find($courseId);

            $existingCertificate = Certificate::where('user_id', $student->id)
                ->where('course_id', $courseId)
                ->first();

            if (!$existingCertificate) {
                $createdCertificate = false;
                try {
                    $certificate = new Certificate([
                        'user_id' => $student->id,
                        'course_id' => $courseId,
                        'verification_code' => strtoupper('CERT-' . date('YmdHis') . '-' . strtoupper(uniqid())),
                        'issue_date' => now(),
                    ]);

                    $certificate->timestamps = Schema::hasColumn('certificates', 'created_at')
                        && Schema::hasColumn('certificates', 'updated_at');
                    $certificate->save();

                    $createdCertificate = true;
                } catch (QueryException $e) {
                    // ignore (unique constraint / race)
                }

                if ($createdCertificate && $course) {
                    // Best-effort email about certificate
                    try {
                        NotificationService::send($student, "Your certificate has been generated for \"{$course->title}\"!");
                    } catch (\Throwable $e) {
                        // ignore
                    }

                    // Best-effort in-app notification
                    if (Schema::hasTable('notifications')) {
                        try {
                            Notification::create([
                                'user_id' => $student->id,
                                'title' => 'Certificate Earned!',
                                'message' => "Congratulations! You received a certificate for successfully completing the \"{$course->title}\" course.",
                                'type' => 'success',
                            ]);
                        } catch (QueryException $e) {
                            // ignore
                        }
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Progress updated',
            'progress' => $enrollment->progress,
        ]);
    }
}