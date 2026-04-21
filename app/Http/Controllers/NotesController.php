<?php

namespace App\Http\Controllers;

use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotesController extends Controller
{
    /**
     * Get all private notes for the authenticated user (lesson_id = NULL)
     */
    public function index()
    {
        $notes = Note::where('user_id', Auth::id())
                     ->whereNull('lesson_id')
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $notes
        ]);
    }

    /**
     * Store a new private note
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'content' => 'required|string|min:1'
            ]);

            $note = Note::create([
                'user_id' => Auth::id(),
                'lesson_id' => null, // Private note (NULL instead of 0)
                'content' => $validated['content']
            ]);

            // Reload to ensure timestamps are available
            $note->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Note created successfully',
                'data' => [
                    'id' => $note->id,
                    'content' => $note->content,
                    'user_id' => $note->user_id,
                    'lesson_id' => $note->lesson_id,
                    'created_at' => $note->created_at,
                    'updated_at' => $note->updated_at,
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Note Creation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating note: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a private note
     */
    public function update(Request $request, Note $note)
    {
        // Check if the note belongs to the current user
        if ($note->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if the note is a private note (lesson_id = NULL)
        if ($note->lesson_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'This is not a private note'
            ], 403);
        }

        $request->validate([
            'content' => 'required|string'
        ]);

        $note->update([
            'content' => $request->content
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note updated successfully',
            'data' => $note
        ]);
    }

    /**
     * Delete a private note
     */
    public function destroy(Note $note)
    {
        // Check if the note belongs to the current user
        if ($note->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if the note is a private note (lesson_id = NULL)
        if ($note->lesson_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'This is not a private note'
            ], 403);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note deleted successfully'
        ]);
    }

    /**
     * Get notes for a specific lesson
     */
    public function getLessonNotes($lessonId)
    {
        try {
            $notes = Note::where('user_id', Auth::id())
                         ->where('lesson_id', $lessonId)
                         ->orderBy('created_at', 'desc')
                         ->get();

            return response()->json([
                'success' => true,
                'data' => $notes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching notes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new lesson-specific note
     */
    public function storeLessonNote(Request $request, $lessonId)
    {
        try {
            $validated = $request->validate([
                'content' => 'required|string|min:1'
            ]);

            $note = Note::create([
                'user_id' => Auth::id(),
                'lesson_id' => $lessonId,
                'content' => $validated['content']
            ]);

            $note->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Lesson note created successfully',
                'data' => [
                    'id' => $note->id,
                    'content' => $note->content,
                    'user_id' => $note->user_id,
                    'lesson_id' => $note->lesson_id,
                    'created_at' => $note->created_at,
                    'updated_at' => $note->updated_at,
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Lesson Note Creation Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error creating note: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a lesson-specific note
     */
    public function updateLessonNote(Request $request, Note $note)
    {
        try {
            // Check if the note belongs to the current user
            if ($note->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if the note is a lesson note (lesson_id IS NOT NULL)
            if ($note->lesson_id === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'This is not a lesson note'
                ], 403);
            }

            $validated = $request->validate([
                'content' => 'required|string|min:1'
            ]);

            $note->update([
                'content' => $validated['content']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lesson note updated successfully',
                'data' => $note
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating note: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a lesson-specific note
     */
    public function deleteLessonNote(Note $note)
    {
        try {
            // Check if the note belongs to the current user
            if ($note->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            // Check if the note is a lesson note (lesson_id IS NOT NULL)
            if ($note->lesson_id === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'This is not a lesson note'
                ], 403);
            }

            $note->delete();

            return response()->json([
                'success' => true,
                'message' => 'Lesson note deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting note: ' . $e->getMessage()
            ], 500);
        }
    }
}
