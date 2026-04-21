import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Save, X, GripVertical, ChevronUp, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './Button';
import RichTextEditor from '../components/RichTextEditor';
import { Course, Lesson } from '../types';

// Configure axios to include CSRF token
const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

interface CourseEditorProps {
    courseId: number;
    onNavigate: (page: string) => void;
}

export const CourseEditor: React.FC<CourseEditorProps> = ({ courseId, onNavigate }) => {
    // Course State
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingCourse, setIsEditingCourse] = useState(false);
    const [courseFormData, setCourseFormData] = useState({ title: '', description: '', category: '' });

    // Lesson State
    const [showLessonForm, setShowLessonForm] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const [lessonData, setLessonData] = useState({
        title: '',
        content: '',
        video_url: '',
        pdf_url: '',
        external_link: '',
        external_link_label: ''
    });

    // Quiz State
    interface QuizQuestion {
        id?: number;
        question: string;
        options: string[];
        correctAnswer: number;
    }
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    // Success Message State
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const lessonFormRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`/api/courses/${courseId}`);
            setCourse(response.data);
            setCourseFormData({
                title: response.data.title,
                description: response.data.description,
                category: response.data.category
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching course:', error);
            alert('Course not found');
            onNavigate('instructor-dashboard');
        }
    };

    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`/api/courses/${courseId}`, courseFormData);
            setCourse(prev => prev ? { ...prev, ...courseFormData } : null);
            setIsEditingCourse(false);
            showSuccessMessage('Course details updated successfully');
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Failed to update course details');
        }
    };

    const handleToggleStatus = async () => {
        try {
            const response = await axios.post(`/api/courses/${courseId}/toggle-status`);
            setCourse(prev => prev ? { ...prev, status: response.data.status } : null);
            const statusText = response.data.status === 'published' ? 'published' : 'unpublished';
            showSuccessMessage(`Course ${statusText} successfully`);
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    const openAddLesson = () => {
        setLessonData({ title: '', content: '', video_url: '', pdf_url: '', external_link: '', external_link_label: '' });
        setEditingLessonId(null);
        setShowLessonForm(true);
        setTimeout(() => {
            lessonFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const openEditLesson = (lesson: Lesson) => {
        setLessonData({
            title: lesson.title,
            content: lesson.content || '',
            video_url: lesson.video_url || '',
            pdf_url: lesson.pdf_url || '',
            external_link: lesson.external_link || '',
            external_link_label: lesson.external_link_label || ''
        });
        setEditingLessonId(lesson.id);
        setShowLessonForm(true);
        // Load existing quiz questions
        loadQuizQuestions(lesson.id);
        setTimeout(() => {
            lessonFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const loadQuizQuestions = async (lessonId: number) => {
        try {
            const res = await axios.get(`/api/instructor/lesson/${lessonId}/quiz/questions`);
            setQuizQuestions(res.data.questions || []);
        } catch (error) {
            console.error('Error loading quiz:', error);
            setQuizQuestions([]);
        }
    };

    const addEmptyQuestion = () => {
        if (quizQuestions.length >= 6) {
            alert('Maximum 6 questions allowed per lesson');
            return;
        }
        setQuizQuestions([...quizQuestions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const updated = [...quizQuestions];
        if (field === 'question') {
            updated[index].question = value;
        } else if (field === 'correctAnswer') {
            updated[index].correctAnswer = value;
        }
        setQuizQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...quizQuestions];
        updated[qIndex].options[oIndex] = value;
        setQuizQuestions(updated);
    };

    const removeQuestion = (index: number) => {
        setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    };

    const generateQuizWithAI = async () => {
        if (!lessonData.title && !lessonData.content) {
            alert('Please add lesson title and content before generating quiz.');
            return;
        }
        setIsGeneratingQuiz(true);
        try {
            // We need the lesson ID for the API call, but for new lessons we don't have it yet
            // For new lessons, save first then generate
            if (!editingLessonId) {
                alert('Please save the lesson first before generating quiz questions.');
                setIsGeneratingQuiz(false);
                return;
            }
            const res = await axios.post(`/api/instructor/lesson/${editingLessonId}/quiz/generate`, {
                existingCount: quizQuestions.length,
                lessonTitle: lessonData.title,
                lessonContent: lessonData.content,
                videoUrl: lessonData.video_url
            });
            if (res.data.questions) {
                setQuizQuestions([...quizQuestions, ...res.data.questions]);
            }
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to generate quiz');
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    const saveQuizQuestions = async (lessonId: number) => {
        if (quizQuestions.length === 0) return;
        try {
            await axios.post(`/api/instructor/lesson/${lessonId}/quiz/save`, { questions: quizQuestions });
        } catch (error) {
            console.error('Error saving quiz:', error);
        }
    };

    const handleSaveLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                course_id: courseId,
                title: lessonData.title,
                content: lessonData.content,
                video_url: lessonData.video_url || null,
                pdf_url: lessonData.pdf_url || null,
                external_link: lessonData.external_link || null,
                external_link_label: lessonData.external_link_label || null,
                sequence_number: editingLessonId
                    ? course?.lessons?.find(l => l.id === editingLessonId)?.sequence_number
                    : ((course?.lessons?.length || 0) + 1)
            };

            if (editingLessonId) {
                const res = await axios.put(`/api/lessons/${editingLessonId}`, payload);
                setCourse(prev => prev ? {
                    ...prev,
                    lessons: prev.lessons?.map(l => l.id === editingLessonId ? res.data : l)
                } : null);
                showSuccessMessage('Lesson updated successfully');
            } else {
                const res = await axios.post('/api/lessons', payload);
                setCourse(prev => prev ? {
                    ...prev,
                    lessons: [...(prev.lessons || []), res.data]
                } : null);
                showSuccessMessage('Lesson added successfully');
                // Save quiz for newly created lesson
                if (res.data.id && quizQuestions.length > 0) {
                    await saveQuizQuestions(res.data.id);
                }
            }

            // Save quiz questions
            if (editingLessonId && quizQuestions.length > 0) {
                await saveQuizQuestions(editingLessonId);
            }

            setShowLessonForm(false);
            setLessonData({ title: '', content: '', video_url: '', pdf_url: '', external_link: '', external_link_label: '' });
            setQuizQuestions([]);
        } catch (error: any) {
            console.error('Error saving lesson:', error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.error ||
                                Object.values(error.response?.data || {}).join(', ') ||
                                error.message ||
                                'Failed to save lesson';
            alert('Failed to save lesson: ' + errorMessage);
        }
    };

    const handleDeleteLesson = async (lessonId: number) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        try {
            await axios.delete(`/api/lessons/${lessonId}`);
            setCourse(prev => prev ? {
                ...prev,
                lessons: prev.lessons?.filter(l => l.id !== lessonId)
            } : null);
            setShowLessonForm(false);
            showSuccessMessage('Lesson deleted successfully');
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Failed to delete lesson');
        }
    };

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!course) return null;

    return (
        <div className="container mx-auto px-6 py-8 pb-12">
            {/* Success Notification */}
            {successMessage && (
                <div className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <button onClick={() => onNavigate('instructor-dashboard')} className="mb-6 text-gray-500 hover:text-gray-900 transition-colors">
                ← Back to Dashboard
            </button>

            <div className="mb-8">
                {isEditingCourse ? (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <form onSubmit={handleUpdateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Course Title</label>
                                <input
                                    type="text" required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={courseFormData.title}
                                    onChange={e => setCourseFormData({ ...courseFormData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg h-24"
                                    value={courseFormData.description}
                                    onChange={e => setCourseFormData({ ...courseFormData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button type="submit">Save Changes</Button>
                                <button type="button" onClick={() => setIsEditingCourse(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {course.status === 'published' ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <p className="text-lg text-gray-600 mb-2">{course.description}</p>
                            <button onClick={() => setIsEditingCourse(true)} className="text-indigo-600 hover:underline">
                                Edit Details
                            </button>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleToggleStatus} variant="outline" className={course.status === 'published' ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}>
                                {course.status === 'published' ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button onClick={openAddLesson}>+ Add Lesson</Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Lessons */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-semibold mb-6">Course Content</h2>

                    {showLessonForm && (
                        <div ref={lessonFormRef} className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm mb-8 ring-2 ring-indigo-50">
                            <h3 className="text-lg font-semibold mb-4">{editingLessonId ? 'Edit Lesson' : 'New Lesson'}</h3>
                            <form onSubmit={handleSaveLesson} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Lesson Title</label>
                                    <input
                                        type="text" required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={lessonData.title}
                                        onChange={e => setLessonData({ ...lessonData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Video URL (Optional)</label>
                                        <input
                                            type="url"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={lessonData.video_url}
                                            onChange={e => setLessonData({ ...lessonData, video_url: e.target.value })}
                                            placeholder="YouTube URL"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">PDF URL (Optional)</label>
                                        <input
                                            type="url"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            value={lessonData.pdf_url}
                                            onChange={e => setLessonData({ ...lessonData, pdf_url: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Content</label>
                                    <RichTextEditor value={lessonData.content} onChange={(content) => setLessonData({ ...lessonData, content })} />
                                </div>

                                {/* Quiz Section */}
                                <div className="border-t border-gray-200 pt-6 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold">Quiz Questions ({quizQuestions.length}/6)</h4>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={generateQuizWithAI}
                                                disabled={isGeneratingQuiz || quizQuestions.length >= 6}
                                                className="flex items-center gap-2"
                                            >
                                                {isGeneratingQuiz ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                                {isGeneratingQuiz ? 'Generating...' : 'Generate with AI'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addEmptyQuestion}
                                                disabled={quizQuestions.length >= 6}
                                            >
                                                <Plus className="w-4 h-4 mr-1" /> Add Question
                                            </Button>
                                        </div>
                                    </div>

                                    {quizQuestions.length === 0 ? (
                                        <p className="text-gray-500 text-sm">No quiz questions yet. Add manually or generate with AI.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {quizQuestions.map((q, qIndex) => (
                                                <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-sm font-medium text-gray-500">Question {qIndex + 1}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeQuestion(qIndex)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter your question"
                                                        className="w-full p-2 border border-gray-300 rounded-lg mb-3"
                                                        value={q.question}
                                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {q.options.map((opt, oIndex) => (
                                                            <div key={oIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${qIndex}`}
                                                                    checked={q.correctAnswer === oIndex}
                                                                    onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                                                    className="w-4 h-4 text-indigo-600"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                                    className={`flex-1 p-2 border rounded-lg text-sm ${q.correctAnswer === oIndex ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                                                                    value={opt}
                                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    {editingLessonId && (
                                        <button type="button" onClick={() => handleDeleteLesson(editingLessonId)} className="mr-auto text-red-500 hover:text-red-700">Delete Lesson</button>
                                    )}
                                    <button type="button" onClick={() => setShowLessonForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                                    <Button type="submit">{editingLessonId ? 'Update Lesson' : 'Save Lesson'}</Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-3">
                        {course.lessons?.sort((a, b) => a.sequence_number - b.sequence_number).map((lesson, index) => (
                            <div key={lesson.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center hover:border-indigo-200 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-8 gap-1">
                                        <button
                                            onClick={async () => {
                                                if (index === 0) return;
                                                const lessons = [...(course.lessons || [])].sort((a, b) => a.sequence_number - b.sequence_number);
                                                const current = lessons[index];
                                                const prev = lessons[index - 1];

                                                // Swap sequences
                                                const temp = current.sequence_number;
                                                current.sequence_number = prev.sequence_number;
                                                prev.sequence_number = temp;

                                                // Optimistic update
                                                setCourse(prevCourse => prevCourse ? { ...prevCourse, lessons: lessons } : null);

                                                try {
                                                    await axios.post('/api/lessons/reorder', {
                                                        lessons: [
                                                            { id: current.id, sequence_number: current.sequence_number },
                                                            { id: prev.id, sequence_number: prev.sequence_number }
                                                        ]
                                                    });
                                                } catch (e) {
                                                    console.error(e);
                                                    alert('Failed to save order');
                                                }
                                            }}
                                            className="text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                                            disabled={index === 0}
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-bold">{index + 1}</span>
                                        <button
                                            onClick={async () => {
                                                if (index === (course.lessons?.length || 0) - 1) return;
                                                const lessons = [...(course.lessons || [])].sort((a, b) => a.sequence_number - b.sequence_number);
                                                const current = lessons[index];
                                                const next = lessons[index + 1];

                                                // Swap sequences
                                                const temp = current.sequence_number;
                                                current.sequence_number = next.sequence_number;
                                                next.sequence_number = temp;

                                                // Optimistic update
                                                setCourse(prevCourse => prevCourse ? { ...prevCourse, lessons: lessons } : null);

                                                try {
                                                    await axios.post('/api/lessons/reorder', {
                                                        lessons: [
                                                            { id: current.id, sequence_number: current.sequence_number },
                                                            { id: next.id, sequence_number: next.sequence_number }
                                                        ]
                                                    });
                                                } catch (e) {
                                                    console.error(e);
                                                    alert('Failed to save order');
                                                }
                                            }}
                                            className="text-gray-400 hover:text-indigo-600 disabled:opacity-30"
                                            disabled={index === (course.lessons?.length || 0) - 1}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">{lesson.content_type}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={`/courses/${courseId}/learn/lessons/${lesson.id}`}
                                        className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Preview
                                    </a>
                                    <Button variant="outline" size="sm" onClick={() => openEditLesson(lesson)}>Edit</Button>
                                </div>
                            </div>
                        ))}
                        {(!course.lessons || course.lessons.length === 0) && (
                            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
                                No lessons yet. Click "Add Lesson" to start.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
