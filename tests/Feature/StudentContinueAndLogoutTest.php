<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentContinueAndLogoutTest extends TestCase
{
    use RefreshDatabase;

    private function makeStudentAndCourse(): array
    {
        $instructor = User::create([
            'name' => 'Instructor User',
            'email' => 'instructor@example.com',
            'password' => bcrypt('password'),
            'role' => 'instructor',
        ]);

        $student = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);

        $course = Course::create([
            'title' => 'JavaScript',
            'description' => 'Course for continue learning tests',
            'instructor_id' => $instructor->id,
            'category' => 'Programming',
            'status' => 'published',
        ]);

        $lesson1 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Lesson 1',
            'content' => 'Intro',
            'content_type' => 'text',
            'sequence_number' => 1,
        ]);

        $lesson2 = Lesson::create([
            'course_id' => $course->id,
            'title' => 'Lesson 2',
            'content' => 'Intermediate',
            'content_type' => 'text',
            'sequence_number' => 2,
        ]);

        return [$student, $course, $lesson1, $lesson2];
    }

    public function test_continue_learning_loads_next_unfinished_lesson_view(): void
    {
        [$student, $course, $lesson1, $lesson2] = $this->makeStudentAndCourse();

        Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'enrollment_date' => now(),
            'progress' => 50,
        ]);

        $this->actingAs($student)
            ->get(route('student.continue-learning', $course->id))
            ->assertOk()
            ->assertViewIs('courses.learn')
            ->assertViewHas('data', function ($data) use ($lesson2, $course) {
                return isset($data['page'], $data['courseId'], $data['lessonId'])
                    && $data['page'] === 'lesson-player'
                    && (int) $data['courseId'] === (int) $course->id
                    && (int) $data['lessonId'] === (int) $lesson2->id;
            });
    }

    public function test_continue_learning_loads_first_lesson_when_progress_is_zero(): void
    {
        [$student, $course, $lesson1, $lesson2] = $this->makeStudentAndCourse();

        Enrollment::create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'enrollment_date' => now(),
            'progress' => 0,
        ]);

        $this->actingAs($student)
            ->get(route('student.continue-learning', $course->id))
            ->assertOk()
            ->assertViewIs('courses.learn')
            ->assertViewHas('data', function ($data) use ($lesson1, $course) {
                return isset($data['page'], $data['courseId'], $data['lessonId'])
                    && $data['page'] === 'lesson-player'
                    && (int) $data['courseId'] === (int) $course->id
                    && (int) $data['lessonId'] === (int) $lesson1->id;
            });
    }

    public function test_logout_redirects_to_welcome_and_clears_authentication(): void
    {
        [$student, $course, $lesson1, $lesson2] = $this->makeStudentAndCourse();

        $this->actingAs($student)
            ->post(route('logout'))
            ->assertRedirect(route('home'));

        $this->assertGuest();
    }
}
