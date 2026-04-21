<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstructorCourseEditViewTest extends TestCase
{
    use RefreshDatabase;

    public function test_instructor_edit_course_view_has_course_variable(): void
    {
        $instructor = User::create([
            'name' => 'Instructor User',
            'email' => 'instructor@example.com',
            'password' => bcrypt('password'),
            'role' => 'instructor',
        ]);

        $course = Course::create([
            'title' => 'Test Course',
            'description' => 'Course description',
            'instructor_id' => $instructor->id,
            'category' => 'Programming',
            'status' => 'draft',
        ]);

        $this->actingAs($instructor)
            ->get(route('instructor.courses.edit', $course->id))
            ->assertOk()
            ->assertViewIs('instructor.courses.edit')
            ->assertViewHas('course', function ($viewCourse) use ($course) {
                return (int) $viewCourse->id === (int) $course->id;
            });
    }
}
