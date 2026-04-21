<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'picture',
        'learning_streak',
        'last_activity_date',
        'location',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'last_activity_date' => 'date',
    ];

    /**
     * Update learning streak based on consecutive days of activity
     * Call this when user watches a lesson or interacts with course content
     */
    public function updateLearningStreak(): void
    {
        $today = now()->startOfDay();
        $lastActivity = $this->last_activity_date ? $this->last_activity_date->startOfDay() : null;

        if ($lastActivity === null) {
            // First time activity
            $this->learning_streak = 1;
        } elseif ($lastActivity->equalTo($today)) {
            // Already logged activity today - no change
            return;
        } elseif ($lastActivity->equalTo($today->copy()->subDay())) {
            // Consecutive day - increment streak
            $this->learning_streak += 1;
        } else {
            // Streak broken - reset to 1
            $this->learning_streak = 1;
        }

        $this->last_activity_date = now()->toDateString();
        $this->save();
    }

    // For instructors - courses they teach
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'instructor_id');
    }

    // For students - courses they're enrolled in
    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'user_id');
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'user_id');
    }

    public function discussions(): HasMany
    {
        return $this->hasMany(Discussion::class, 'user_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'user_id');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'user_id');
    }

    public function chatInteractions(): HasMany
    {
        return $this->hasMany(AIChatInteraction::class, 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function locationRecord()
    {
        return $this->hasOne(Location::class, 'user_id');
    }

    public function isInstructor(): bool
    {
        return $this->role === 'instructor';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function getTotalEnrolledCourses()
    {
        return $this->enrollments()->count();
    }

    public function getTotalCompletedCourses()
    {
        return $this->certificates()->count();
    }

    public function getCompletionRate()
    {
        $total = $this->getTotalEnrolledCourses();
        if ($total == 0) return 0;

        $completed = $this->getTotalCompletedCourses();
        return round(($completed / $total) * 100, 2);
    }

    /**
     * Get total lessons completed by this user (based on progress across enrollments)
     */
    public function getTotalLessonsCompleted(): int
    {
        $total = 0;
        foreach ($this->enrollments()->with('course.lessons')->get() as $enrollment) {
            $lessonsCount = $enrollment->course->lessons->count();
            if ($lessonsCount > 0) {
                $completed = (int) floor(($enrollment->progress / 100) * $lessonsCount);
                $total += $completed;
            }
        }
        return $total;
    }

    /**
     * Calculate leaderboard points
     * Points = (learning_streak * 10) + (lessons_completed * 5) + (certificates * 50)
     */
    public function getLeaderboardPoints(): int
    {
        $streakPoints = ($this->learning_streak ?? 0) * 10;
        $lessonPoints = $this->getTotalLessonsCompleted() * 5;
        $certificatePoints = $this->getTotalCompletedCourses() * 50;

        return $streakPoints + $lessonPoints + $certificatePoints;
    }
}
