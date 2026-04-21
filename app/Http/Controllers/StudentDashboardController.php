<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Note;
use App\Models\Discussion;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentDashboardController extends Controller
{
    /**
     * Show student dashboard
     */
    public function index()
    {
        $student = Auth::user();

        // Get enrolled courses
        $enrolledCourses = $student->enrollments()->with('course')->get();
        
        $courseProgress = [];
        foreach ($enrolledCourses as $enrollment) {
            $courseProgress[$enrollment->course_id] = $enrollment->progress ?? 0;
        }

        // Calculate stats
        $ongoingCourses = $enrolledCourses->count();
        $completedCourses = $student->certificates()->count();
        $learningStreak = $student->learning_streak ?? 0;
        $certificatesEarned = $completedCourses;
        
        // Get notifications - safely handle if table doesn't exist yet
        $notifications = collect([]);
        try {
            $notifications = $student->notifications()
                                     ->orderBy('created_at', 'desc')
                                     ->limit(10)
                                     ->get();
        } catch (\Exception $e) {
            // Notifications table doesn't exist yet - return empty collection
            $notifications = collect([]);
        }

        // Get leaderboard - top students by points
        $leaderboard = User::where('role', 'student')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'points' => $user->getLeaderboardPoints(),
                    'streak' => $user->learning_streak ?? 0,
                    'lessonsCompleted' => $user->getTotalLessonsCompleted(),
                ];
            })
            ->sortByDesc('points')
            ->take(10)
            ->values();

        // Format Completed Courses Data for React
        $learningStreak = $student->learning_streak ?? 0;
        $certificatesEarned = $completedCourses;
        
        $completedCoursesData = $student->certificates()->with(['course.reviews' => function($query) use ($student) {
            $query->where('user_id', $student->id);
        }])->get()->map(function($cert) {
            $userReview = $cert->course->reviews->first();

            $completedAt = $cert->issue_date ?? $cert->created_at;
            return [
                'id' => $cert->course->id,
                'title' => $cert->course->title,
                'instructor' => $cert->course->instructor->name ?? 'Instructor',
                'completedDate' => $completedAt ? $completedAt->format('M d, Y') : '—',
                'rating' => $userReview ? $userReview->rating : 0,
                'certificate' => true,
                'certificateId' => $cert->id
            ];
        });

        // Get private notes (lesson_id = NULL)
        $privateNotes = $student->notes()
                                ->whereNull('lesson_id')
                                ->orderBy('created_at', 'desc')
                                ->get()
                                ->map(function($note) {
                                    return [
                                        'id' => $note->id,
                                        'content' => $note->content,
                                        'createdAt' => $note->created_at->format('M d, Y H:i'),
                                        'updatedAt' => $note->updated_at->format('M d, Y H:i'),
                                    ];
                                });

        // Get enrolled lessons and discussions
        $enrolledLessions = [];
        foreach ($enrolledCourses as $enrollment) {
            $lessons = $enrollment->course->lessons()->orderBy('sequence_number')->get();
            foreach ($lessons as $lesson) {
                $enrolledLessions[] = [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'course_id' => $lesson->course_id,
                    'course_title' => $enrollment->course->title,
                ];
            }
        }

        // Get recent discussions across all enrolled courses
        $recentDiscussions = [];
        foreach ($enrolledCourses as $enrollment) {
            $lessons = $enrollment->course->lessons;
            if ($lessons->count() > 0) {
                $lessonIds = $lessons->pluck('id')->toArray();
                $discussions = Discussion::whereIn('lesson_id', $lessonIds)
                                        ->whereNull('parent_id')
                                        ->with('user', 'lesson')
                                        ->orderBy('created_at', 'desc')
                                        ->limit(5)
                                        ->get();
                
                foreach ($discussions as $discussion) {
                    $recentDiscussions[] = [
                        'id' => $discussion->id,
                        'content' => substr($discussion->content, 0, 100) . (strlen($discussion->content) > 100 ? '...' : ''),
                        'user_name' => $discussion->user->name,
                        'lesson_title' => $discussion->lesson->title,
                        'lesson_id' => $discussion->lesson_id,
                        'replies_count' => $discussion->getTotalReplies(),
                        'created_at' => $discussion->created_at->diffForHumans(),
                    ];
                }
            }
        }

        // Get nearby students (within ~5km straight line)
        $nearbyStudents = [];
        $currentUserLocation = $student->locationRecord;
        if ($currentUserLocation && $currentUserLocation->latitude && $currentUserLocation->longitude) {
            $lat1 = $currentUserLocation->latitude;
            $lon1 = $currentUserLocation->longitude;

            $otherUsers = User::where('role', 'student')
                                ->where('id', '!=', $student->id)
                                ->whereHas('locationRecord', function($q) {
                                    $q->whereNotNull('latitude')->whereNotNull('longitude');
                                })
                                ->with('locationRecord')
                                ->get();

            foreach ($otherUsers as $otherUser) {
                $lat2 = $otherUser->locationRecord->latitude;
                $lon2 = $otherUser->locationRecord->longitude;

                // Haversine formula
                $theta = $lon1 - $lon2;
                $val = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
                $val = max(-1, min(1, $val));
                $dist = acos($val);
                $dist = rad2deg($dist);
                $kilometers = $dist * 60 * 1.1515 * 1.609344;

                if ($kilometers <= 5) {
                    $nearbyStudents[] = [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'email' => $otherUser->locationRecord->share_email ? $otherUser->email : null,
                        'location' => $otherUser->locationRecord->location_string,
                        'straight_distance' => round($kilometers, 2),
                        'lat' => $lat2,
                        'lon' => $lon2,
                    ];
                }
            }
            
            // Sort by straight-line distance
            usort($nearbyStudents, function($a, $b) {
                return $a['straight_distance'] <=> $b['straight_distance'];
            });
        }

        return view('student.dashboard', [
            'student' => $student,
            'enrolledCourses' => $enrolledCourses,
            'courseProgress' => $courseProgress,
            'ongoingCourses' => $ongoingCourses,
            'completedCourses' => $completedCourses,
            'learningStreak' => $learningStreak,
            'certificatesEarned' => $certificatesEarned,
            'notifications' => $notifications,
            'leaderboard' => $leaderboard,
            'currentUserPoints' => $student->getLeaderboardPoints(),
            'completedCoursesData' => $completedCoursesData,
            'privateNotes' => $privateNotes,
            'enrolledLessions' => $enrolledLessions,
            'recentDiscussions' => $recentDiscussions,
            'nearbyStudents' => $nearbyStudents
        ]);
    }

    /**
     * Show enrolled courses
     */
    public function courses()
    {
        $student = Auth::user();
        $enrolledCourses = $student->enrollments()->with('course.instructor')->paginate(10);

        return view('student.courses', [
            'enrolledCourses' => $enrolledCourses,
            'data' => [
                'page' => 'blade',
                'user' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'role' => $student->role,
                ],
            ],
        ]);
    }

    /**
     * Show completed courses
     */
    public function completedCourses()
    {
        $student = Auth::user();
        $completedCourses = $student->certificates()->with('course.instructor')->paginate(10);

        return view('student.completed-courses', [
            'completedCourses' => $completedCourses,
            'data' => [
                'page' => 'blade',
                'user' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'role' => $student->role,
                ],
            ],
        ]);
    }

    /**
     * Continue learning - get next uncompleted lesson
     */
    public function continueLearning($courseId)
    {
        $student = Auth::user();
        $course = Course::with('lessons')->findOrFail($courseId);

        // Check if student is enrolled
        $enrollment = Enrollment::where('user_id', $student->id)
                                 ->where('course_id', $courseId)
                                 ->firstOrFail();

        $lessons = $course->lessons
            ->sortBy([
                ['sequence_number', 'asc'],
                ['id', 'asc'],
            ])
            ->values();

        if ($lessons->isEmpty()) {
            return redirect()->to(route('student.courses', [], false))
                           ->with('info', 'No lessons available in this course!');
        }

        $progress = max(0, min(100, (int) ($enrollment->progress ?? 0)));

        if ($progress >= 100) {
            return redirect()->to(route('student.completed-courses', [], false))
                           ->with('info', 'You have already completed this course!');
        }

        $completedLessons = (int) floor(($progress / 100) * $lessons->count());
        $nextLessonIndex = min($completedLessons, $lessons->count() - 1);
        $nextLesson = $lessons->get($nextLessonIndex);

        if (!$nextLesson) {
            return redirect()->to(route('student.courses', [], false))
                           ->with('info', 'No lessons available in this course!');
        }

        return view('courses.learn', [
            'data' => [
                'page' => 'lesson-player',
                'user' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'role' => $student->role,
                    'location' => $student->location,
                    'lat' => $student->locationRecord->latitude ?? null,
                    'lon' => $student->locationRecord->longitude ?? null,
                ],
                'courseId' => (int) $course->id,
                'lessonId' => (int) $nextLesson->id,
            ],
        ]);
    }

    /**
     * Update student location
     */
    public function updateLocation(Request $request)
    {
        $request->validate([
            'location' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = Auth::user();
        
        // Save string directly on user model for legacy compatibility
        $user->location = $request->location;
        $user->save();
        
        // Save details to dedicated locations table
        \App\Models\Location::updateOrCreate(
            ['user_id' => $user->id],
            [
                'location_string' => $request->location,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'share_email' => $request->has('share_email') ? $request->share_email : true,
            ]
        );

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Location updated successfully', 'location' => $user->location]);
        }

        return redirect()->back()->with('success', 'Location updated successfully');
    }
}

