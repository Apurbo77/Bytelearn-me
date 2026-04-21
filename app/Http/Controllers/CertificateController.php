<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Certificate;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\QueryException;

class CertificateController extends Controller
{
    private static ?bool $certificatesHaveTimestamps = null;
    private static ?bool $notificationsTableExists = null;

    private function certificatesHaveTimestamps(): bool
    {
        if (self::$certificatesHaveTimestamps !== null) {
            return self::$certificatesHaveTimestamps;
        }

        self::$certificatesHaveTimestamps = Schema::hasColumn('certificates', 'created_at')
            && Schema::hasColumn('certificates', 'updated_at');

        return self::$certificatesHaveTimestamps;
    }

    private function notificationsTableExists(): bool
    {
        if (self::$notificationsTableExists !== null) {
            return self::$notificationsTableExists;
        }

        self::$notificationsTableExists = Schema::hasTable('notifications');
        return self::$notificationsTableExists;
    }

    /**
     * Complete a course - mark as done, generate certificate, send notification
     */
    public function completeCourse($courseId)
    {
        $student = Auth::user();
        $course = Course::findOrFail($courseId);

        // Check enrollment
        $enrollment = Enrollment::where('user_id', $student->id)
                                ->where('course_id', $courseId)
                                ->first();

        if (!$enrollment) {
            return back()->with('error', 'You are not enrolled in this course.');
        }

        $previousProgress = $enrollment->progress;

        $enrollment->progress = 100;
        $enrollment->save();

        // 📩 SEND COMPLETION EMAIL
        if ($previousProgress < 100) {NotificationService::send($student,"Congratulations! You have completed the course 🎉");}
    
        // Check if certificate already exists
        $existingCertificate = Certificate::where('user_id', $student->id)
            ->where('course_id', $courseId)
            ->first();

        if (!$existingCertificate) {
            // Create certificate (supports legacy schema without created_at/updated_at)
            try {
                $certificate = new Certificate([
                    'user_id' => $student->id,
                    'course_id' => $courseId,
                    'verification_code' => $this->generateVerificationCode(),
                    'issue_date' => now(),
                ]);
                $certificate->timestamps = $this->certificatesHaveTimestamps();
                $certificate->save();
            } catch (QueryException $e) {
                // If a race hits the unique(user_id,course_id) constraint, fetch the existing row.
                $certificate = Certificate::where('user_id', $student->id)
                    ->where('course_id', $courseId)
                    ->first();
                if (!$certificate) {
                    throw $e;
                }
            }

            // Best-effort email notification (don't block completion if mail isn't configured)
            try {
                NotificationService::send($student, "Your certificate has been generated for \"{$course->title}\"!");
            } catch (\Throwable $e) {
                // ignore
            }

            // Create notification if the table exists (some installs may not have migrated it yet)
            if ($this->notificationsTableExists()) {
                try {
                    Notification::create([
                        'user_id' => $student->id,
                        'title' => 'Certificate Earned!',
                        'message' => "Congratulations! You received a certificate for successfully completing the \"{$course->title}\" course.",
                        'type' => 'success',
                    ]);
                } catch (QueryException $e) {
                    // Don't block completion if notifications are misconfigured.
                }
            }
        }

        return redirect()->route('student.dashboard')
                       ->with('success', "Congratulations! You've completed \"{$course->title}\" and earned a certificate!");
    }

    /**
     * Generate certificate for completed course
     */
    public function generate($courseId)
    {
        $student = Auth::user();
        $course = Course::findOrFail($courseId);

        // Check if course is completed
        $enrollment = $course->enrollments()->where('user_id', $student->id)->first();

        if (!$enrollment || ((int) ($enrollment->progress ?? 0)) < 100) {
            return back()->with('error', 'Course not yet completed');
        }

        // Check if certificate already exists
        $existingCertificate = Certificate::where('user_id', $student->id)
                                          ->where('course_id', $courseId)
                                          ->first();

        if ($existingCertificate) {
            return response()->download(storage_path('certificates/' . $existingCertificate->id . '.pdf'));
        }

        // Create certificate (supports legacy schema without created_at/updated_at)
        $certificate = new Certificate([
            'user_id' => $student->id,
            'course_id' => $courseId,
            'verification_code' => $this->generateVerificationCode(),
            'issue_date' => now(),
        ]);
        $certificate->timestamps = $this->certificatesHaveTimestamps();
        $certificate->save();

        try {
            NotificationService::send($student, "Your certificate is ready for download 🎓");
        } catch (\Throwable $e) {
            // ignore
        }

        return response()->json([
            'success' => true,
            'certificate_id' => $certificate->id,
            'verification_code' => $certificate->verification_code,
        ]);
    }

    /**
     * Download certificate
     */
    public function download($certificateId)
    {
        $student = Auth::user();
        $certificate = Certificate::findOrFail($certificateId);

        if ($certificate->user_id !== $student->id) {
            abort(403, 'Unauthorized');
        }

        // In a real app, this would generate/download a PDF
        return response()->json([
            'certificate_number' => $certificate->verification_code,
            'user' => $certificate->user->name,
            'course' => $certificate->course->title,
            'issue_date' => $certificate->issue_date->format('F j, Y'),
        ]);
    }

    /**
     * Generate unique verification code
     */
    private function generateVerificationCode()
    {
        return strtoupper('CERT-' . date('YmdHis') . '-' . strtoupper(uniqid()));
    }

    /**
     * Show all certificates for student
     */
    public function index()
    {
        $student = Auth::user();
        $certificates = $student->certificates()->with('course')->get();

        $certificatesData = $certificates->map(function($cert) {
            return [
                'id' => $cert->id,
                'courseTitle' => $cert->course->title,
                'courseId' => $cert->course_id,
                'studentName' => $cert->user->name,
                'verificationCode' => $cert->verification_code,
                'issueDate' => $cert->issue_date->format('F j, Y'),
                'issueDateRaw' => $cert->issue_date->toISOString(),
            ];
        });

        return view('student.certificates', [
            'data' => [
                'page' => 'certificates',
                'user' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'role' => $student->role,
                ],
                'certificates' => $certificatesData,
            ]
        ]);
    }
}
