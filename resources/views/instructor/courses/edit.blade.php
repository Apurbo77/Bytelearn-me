@extends('layouts.app')

@section('styles')
<style>
    .form-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .form-card {
        background: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .form-card h1 {
        margin-top: 0;
        color: #333;
        margin-bottom: 1.5rem;
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 500;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 5px;
        font-size: 1rem;
        font-family: inherit;
    }

    .form-group textarea {
        resize: vertical;
        min-height: 120px;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
        transition: opacity 0.3s;
    }

    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .btn-primary:hover {
        opacity: 0.9;
    }

    .btn-secondary {
        background: #e5e7eb;
        color: #333;
    }

    .btn-secondary:hover {
        background: #d1d5db;
    }

    .btn-success {
        background: #10b981;
        color: white;
    }

    .btn-success:hover {
        opacity: 0.9;
    }

    .btn-danger {
        background: #ef4444;
        color: white;
    }

    .btn-danger:hover {
        opacity: 0.9;
    }

    .error-text {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }

    .form-group.error input,
    .form-group.error textarea,
    .form-group.error select {
        border-color: #dc3545;
    }

    .course-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        margin-bottom: 2rem;
    }

    .course-status {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 5px;
        font-size: 0.875rem;
    }
</style>
@endsection

@section('content')
<div class="form-container">
    <div class="course-header">
        <h1>{{ $course->title }}</h1>
        <p>Edit Course</p>
        <span class="course-status">Status: {{ ucfirst($course->status) }}</span>
    </div>

    @if (session('success'))
        <div id="successMessage" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 5px solid #047857; color: white; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <svg style="width: 24px; height: 24px; flex-shrink: 0;" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div>
                    <div style="font-weight: 600; margin-bottom: 0.25rem;">Success!</div>
                    <div style="font-size: 0.95rem; opacity: 0.95;">{{ session('success') }}</div>
                </div>
            </div>
            <button type="button" onclick="document.getElementById('successMessage').style.display='none';" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 1.5rem; cursor: pointer; padding: 0 0.5rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                ×
            </button>
        </div>
        <script>
            // Auto-dismiss success message after 5 seconds
            setTimeout(function() {
                const msg = document.getElementById('successMessage');
                if (msg) {
                    msg.style.transition = 'opacity 0.3s ease-out';
                    msg.style.opacity = '0';
                    setTimeout(() => { msg.style.display = 'none'; }, 300);
                }
            }, 5000);
        </script>
    @endif

    @if ($errors->any())
        <div style="background: #fee; padding: 1rem; border-radius: 5px; margin-bottom: 1.5rem; border-left: 4px solid #c33;">
            @foreach ($errors->all() as $error)
                <div style="color: #c33;">{{ $error }}</div>
            @endforeach
        </div>
    @endif

    <div class="form-card">
        <form action="{{ route('instructor.courses.update', $course->id) }}" method="POST">
            @csrf
            @method('PATCH')

            <div class="form-group @error('title') error @enderror">
                <label for="title">Course Title *</label>
                <input type="text" id="title" name="title" value="{{ old('title', $course->title) }}" required>
                @error('title')
                    <span class="error-text">{{ $message }}</span>
                @enderror
            </div>

            <div class="form-group @error('description') error @enderror">
                <label for="description">Description *</label>
                <textarea id="description" name="description" required>{{ old('description', $course->description) }}</textarea>
                @error('description')
                    <span class="error-text">{{ $message }}</span>
                @enderror
            </div>

            <div class="form-group @error('category') error @enderror">
                <label for="category">Category *</label>
                <input type="text" id="category" name="category" value="{{ old('category', $course->category) }}" required>
                @error('category')
                    <span class="error-text">{{ $message }}</span>
                @enderror
            </div>

            <div class="form-group @error('level') error @enderror">
                <label for="level">Level</label>
                <select id="level" name="level">
                    <option value="">Select Level</option>
                    <option value="beginner" @selected(old('level', $course->level) === 'beginner')>Beginner</option>
                    <option value="intermediate" @selected(old('level', $course->level) === 'intermediate')>Intermediate</option>
                    <option value="advanced" @selected(old('level', $course->level) === 'advanced')>Advanced</option>
                </select>
                @error('level')
                    <span class="error-text">{{ $message }}</span>
                @enderror
            </div>

            <div class="form-group @error('price') error @enderror">
                <label for="price">Price (Optional)</label>
                <input type="number" id="price" name="price" step="0.01" min="0" value="{{ old('price', $course->price) }}">
                @error('price')
                    <span class="error-text">{{ $message }}</span>
                @enderror
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Update Course</button>
                <a href="{{ route('instructor.dashboard') }}" class="btn btn-secondary" style="text-decoration: none; display: flex; align-items: center;">Back to Dashboard</a>
            </div>
        </form>

        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;">
            <h3 style="color: #333;">Danger Zone</h3>
            
            @if ($course->status === 'draft')
                <form action="{{ route('instructor.courses.publish', $course->id) }}" method="POST" style="margin-bottom: 1rem;">
                    @csrf
                    <button type="submit" class="btn btn-success">Publish Course</button>
                </form>
            @else
                <p style="color: #6b7280; margin-bottom: 1rem;">Course is published and cannot be deleted.</p>
            @endif

            <form action="{{ route('instructor.courses.destroy', $course->id) }}" method="POST" onsubmit="return confirm('Are you sure you want to delete this course? This action cannot be undone.');">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Delete Course</button>
            </form>
        </div>
    </div>
</div>
@endsection
