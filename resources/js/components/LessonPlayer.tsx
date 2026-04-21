import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Button } from './Button';
import { Course, Lesson } from '../types';

interface LessonPlayerProps {
    courseId: number;
    initialLessonId?: number;
    user?: any;
    onNavigate: (page: string) => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ courseId, initialLessonId, user, onNavigate }) => {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
    const [isVideoCompleted, setIsVideoCompleted] = useState(false);

    // Rating State
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');

    // Quiz State
    interface QuizQuestion {
        id?: number;
        question: string;
        options: string[];
        correctAnswer: number;
    }
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [showResults, setShowResults] = useState(false);
    const [quizScore, setQuizScore] = useState(0);

    // AI Chat State
    interface ChatMessage {
        role: 'user' | 'assistant';
        content: string;
    }
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    const chatStreamRef = useRef<EventSource | null>(null);

    const playerRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isInstructor = user?.role === 'instructor';

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`/api/courses/${courseId}`);
                setCourse(response.data);

                if (response.data.lessons && response.data.lessons.length > 0) {
                    const sortedLessons = response.data.lessons.sort((a: Lesson, b: Lesson) => a.sequence_number - b.sequence_number);
                    if (initialLessonId) {
                        const found = sortedLessons.find((l: Lesson) => l.id === initialLessonId);
                        setCurrentLesson(found || sortedLessons[0]);
                    } else {
                        setCurrentLesson(sortedLessons[0]);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching course:', error);
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, initialLessonId]);

    // Fetch quiz questions when lesson changes
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!currentLesson) return;
            try {
                const res = await axios.get(`/api/lesson/${currentLesson.id}/quiz`);
                setQuizQuestions(res.data.questions || []);
                setSelectedAnswers({});
                setShowResults(false);
                setQuizScore(0);
                setChatMessages([]); // Clear chat on lesson change
                chatStreamRef.current?.close();
                chatStreamRef.current = null;
            } catch (error) {
                setQuizQuestions([]);
            }
        };
        fetchQuiz();
    }, [currentLesson]);

    useEffect(() => {
        return () => {
            chatStreamRef.current?.close();
            chatStreamRef.current = null;
        };
    }, []);

    // Initialize Plyr
    useEffect(() => {
        let player: any = null;
        if (currentLesson && currentLesson.video_url && playerRef.current) {
            setIsVideoCompleted(false);
            const videoId = getYouTubeId(currentLesson.video_url);

            if (videoId) {
                player = new Plyr(playerRef.current, {
                    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
                    youtube: { noCookie: true, rel: 0, showinfo: 0, modestbranding: 1 }
                });

                player.on('ended', () => setIsVideoCompleted(true));
                player.on('play', () => setIsVideoCompleted(false));
            }
        }
        return () => {
            if (player) player.destroy();
        };
    }, [currentLesson]);

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading lesson...</div>;
    if (!course) return <div className="p-12 text-center text-red-500">Course not found.</div>;
    if (!currentLesson) return <div className="p-12 text-center text-gray-500">No lessons available.</div>;

    const sortedLessons = [...(course.lessons || [])].sort((a, b) => a.sequence_number - b.sequence_number);
    const currentIndex = sortedLessons.findIndex(l => l.id === currentLesson.id);
    const prevLesson = currentIndex > 0 ? sortedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < sortedLessons.length - 1 ? sortedLessons[currentIndex + 1] : null;

    const handleLessonChange = (lesson: Lesson) => {
        setCurrentLesson(lesson);
    };

    const handleChatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendChatMessage();
    };

    const updateProgress = async () => {
        if (isInstructor) return; // Don't track progress for instructors
        try {
            const total = sortedLessons.length;
            const finishedCount = currentIndex + 1;
            const progressPercent = Math.round((finishedCount / total) * 100);
            await axios.post('/api/enrollments/progress', {
                course_id: courseId,
                progress: progressPercent
            });
        } catch (err) { console.error(err); }
    };

    const submitRating = async () => {
        try {
            await axios.post(`/student/course/${courseId}/review`, {
                rating,
                comment: ratingComment
            });
            setIsRatingModalOpen(false);
            alert("Thank you for your feedback!");
        } catch (error) {
            console.error(error);
            alert("Failed to submit review. Please try again.");
        }
    };

    const handleAnswerSelect = (qIndex: number, optionIndex: number) => {
        if (showResults) return;
        setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
    };

    const submitQuiz = () => {
        let score = 0;
        quizQuestions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correctAnswer) score++;
        });
        setQuizScore(score);
        setShowResults(true);
    };

    const resetQuiz = () => {
        setSelectedAnswers({});
        setShowResults(false);
        setQuizScore(0);
    };

    const sendChatMessage = async () => {
        if (!chatInput.trim() || isChatLoading || !currentLesson) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }, { role: 'assistant', content: '' }]);
        setIsChatLoading(true);

        try {
            chatStreamRef.current?.close();

            const url = `/api/lesson/${currentLesson.id}/chat/stream?message=${encodeURIComponent(userMessage)}`;
            const es = new EventSource(url);
            chatStreamRef.current = es;

            const appendDelta = (delta: string) => {
                if (!delta) return;
                setChatMessages(prev => {
                    const next = [...prev];
                    for (let i = next.length - 1; i >= 0; i--) {
                        if (next[i].role === 'assistant') {
                            next[i] = { ...next[i], content: (next[i].content || '') + delta };
                            break;
                        }
                    }
                    return next;
                });
            };

            es.addEventListener('chunk', (event: any) => {
                try {
                    const data = JSON.parse((event as MessageEvent).data);
                    appendDelta(String(data.delta || ''));
                } catch {
                    // ignore malformed chunks
                }
            });

            es.addEventListener('done', (event: any) => {
                try {
                    const data = JSON.parse((event as MessageEvent).data);
                    const finalAnswer = typeof data.answer === 'string' ? data.answer : '';
                    if (finalAnswer) {
                        // If we missed deltas for any reason, ensure the final answer is present.
                        setChatMessages(prev => {
                            const next = [...prev];
                            for (let i = next.length - 1; i >= 0; i--) {
                                if (next[i].role === 'assistant') {
                                    if (!next[i].content) {
                                        next[i] = { ...next[i], content: finalAnswer };
                                    }
                                    break;
                                }
                            }
                            return next;
                        });
                    }
                } catch {
                    // ignore
                } finally {
                    es.close();
                    if (chatStreamRef.current === es) {
                        chatStreamRef.current = null;
                    }
                    setIsChatLoading(false);
                }
            });

            es.addEventListener('error', async () => {
                es.close();
                if (chatStreamRef.current === es) {
                    chatStreamRef.current = null;
                }

                // Fallback to non-streaming endpoint (also handles environments that buffer SSE).
                try {
                    const res = await axios.post(`/api/lesson/${currentLesson.id}/chat`, { message: userMessage });
                    const reply = res.data?.reply ?? res.data?.answer ?? '';
                    setChatMessages(prev => {
                        const next = [...prev];
                        for (let i = next.length - 1; i >= 0; i--) {
                            if (next[i].role === 'assistant') {
                                next[i] = { ...next[i], content: String(reply || 'Sorry, I could not respond. Please try again.') };
                                break;
                            }
                        }
                        return next;
                    });
                } catch (error: any) {
                    const msg = error.response?.data?.error || 'Sorry, I could not respond. Please try again.';
                    setChatMessages(prev => {
                        const next = [...prev];
                        for (let i = next.length - 1; i >= 0; i--) {
                            if (next[i].role === 'assistant') {
                                next[i] = { ...next[i], content: msg };
                                break;
                            }
                        }
                        return next;
                    });
                } finally {
                    setIsChatLoading(false);
                }
            });
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Sorry, I could not respond. Please try again.';
            setChatMessages(prev => {
                const next = [...prev];
                for (let i = next.length - 1; i >= 0; i--) {
                    if (next[i].role === 'assistant') {
                        next[i] = { ...next[i], content: msg };
                        break;
                    }
                }
                return next;
            });
            setIsChatLoading(false);
        } finally {
            setTimeout(() => {
                chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* Left Sidebar - Lesson List */}
            <div className="w-72 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
                <div className="p-6 border-b border-gray-200">
                    <button onClick={() => onNavigate(isInstructor ? 'course-editor' : 'student-dashboard')} className="text-sm text-gray-500 hover:text-gray-900 mb-2 block">
                        ← Back to {isInstructor ? 'Editor' : 'Dashboard'}
                    </button>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{course.title}</h2>
                </div>
                <div className="p-3 space-y-1">
                    {sortedLessons.map((lesson, idx) => (
                        <div
                            key={lesson.id}
                            onClick={() => handleLessonChange(lesson)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${lesson.id === currentLesson.id
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'hover:bg-gray-200 text-gray-700'
                                }`}
                        >
                            <span className={`text-xs font-mono opacity-80 ${lesson.id === currentLesson.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                                {String(idx + 1).padStart(2, '0')}.
                            </span>
                            <span className="text-sm font-medium truncate">{lesson.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">{currentLesson.title}</h1>

                    {/* Video */}
                    {currentLesson.video_url && (
                        <div key={`video-${currentLesson.id}`} className="mb-8 relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
                            {getYouTubeId(currentLesson.video_url) ? (
                                <div className="plyr__video-embed" ref={playerRef} data-plyr-provider="youtube" data-plyr-embed-id={getYouTubeId(currentLesson.video_url)} />
                            ) : (
                                <video src={currentLesson.video_url} controls className="w-full h-full" />
                            )}

                            {isVideoCompleted && !isInstructor && (
                                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white">
                                    <h3 className="text-2xl font-bold mb-4">Lesson Completed! 🎉</h3>
                                    <div className="flex gap-4">
                                        <button onClick={() => setIsVideoCompleted(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur">
                                            Replay
                                        </button>
                                        {nextLesson && (
                                            <button
                                                onClick={() => { handleLessonChange(nextLesson); updateProgress(); }}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                                            >
                                                Next Lesson →
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    {currentLesson.content && (
                        <div className="prose prose-indigo max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                    )}

                    {/* Links & Resources */}
                    <div className="mt-8 space-y-4">
                        {currentLesson.pdf_url && (
                            <a href={currentLesson.pdf_url} download target="_blank" rel="noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📄</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">PDF Resource</div>
                                        <div className="text-sm text-gray-500">Click to download</div>
                                    </div>
                                </div>
                            </a>
                        )}
                        {currentLesson.external_link && (
                            <a href={currentLesson.external_link} target="_blank" rel="noreferrer" className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all group bg-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔗</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{currentLesson.external_link_label || 'External Link'}</div>
                                        <div className="text-sm text-gray-500">Visit resource</div>
                                    </div>
                                </div>
                            </a>
                        )}
                    </div>

                    {/* AI Chat Assistant */}
                    <div className="mt-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">🤖</div>
                            <div>
                                <h3 className="font-semibold text-gray-900">AI Learning Assistant</h3>
                                <p className="text-sm text-gray-600">Need clarification? Ask your questions about this lesson here</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        {chatMessages.length > 0 && (
                            <div
                                ref={chatContainerRef}
                                className="bg-white rounded-lg border border-gray-200 p-4 mb-4 max-h-64 overflow-y-auto space-y-3"
                            >
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                            }`}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-100 text-gray-600 p-3 rounded-lg rounded-bl-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chat Input */}
                        <form className="flex gap-3" onSubmit={handleChatSubmit}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Type your question about this lesson..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                disabled={isChatLoading}
                            />
                            <button
                                type="submit"
                                disabled={isChatLoading || !chatInput.trim()}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                {isChatLoading ? (
                                    <span className="animate-spin">⏳</span>
                                ) : (
                                    <>Send</>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Pagination - Hide Complete for Instructor */}
                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                        {prevLesson ? (
                            <Button variant="outline" onClick={() => handleLessonChange(prevLesson)}>← Previous</Button>
                        ) : <div />}

                        {nextLesson ? (
                            <Button onClick={() => { handleLessonChange(nextLesson); updateProgress(); }}>Next Lesson →</Button>
                        ) : (
                            !isInstructor && (
                                <div className="flex flex-col gap-3 w-full sm:w-auto">
                                    <form method="POST" action={`/student/course/${courseId}/complete`} className="w-full">
                                        <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                                            🎓 Complete Course & Get Certificate
                                        </Button>
                                    </form>
                                    <Button variant="outline" onClick={() => setIsRatingModalOpen(true)} className="w-full">
                                        ⭐ Rate this Course
                                    </Button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Rating Modal */}
                {isRatingModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 animate-scale-in">
                            <h3 className="text-xl font-bold mb-2">Rate this Course</h3>
                            <p className="text-gray-600 mb-6">How was your learning experience? Your feedback helps us improve.</p>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110 focus:outline-none"
                                    >
                                        <svg
                                            className={`w-10 h-10 ${star <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tell us what you liked or how we can improve (optional)"
                                rows={3}
                                value={ratingComment}
                                onChange={(e) => setRatingComment(e.target.value)}
                            ></textarea>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsRatingModalOpen(false)} className="flex-1">Skip</Button>
                                <Button
                                    onClick={submitRating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    disabled={rating === 0}
                                >
                                    Submit Review
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Quiz Panel */}
            {quizQuestions.length > 0 && (
                <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            📝 Lesson Quiz
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{quizQuestions.length} question{quizQuestions.length > 1 ? 's' : ''}</p>
                    </div>

                    <div className="p-4 space-y-6">
                        {quizQuestions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <p className="font-medium text-gray-900 mb-3">
                                    <span className="text-indigo-600 mr-2">Q{qIndex + 1}.</span>
                                    {q.question}
                                </p>
                                <div className="space-y-2">
                                    {q.options.map((opt, oIndex) => {
                                        const isSelected = selectedAnswers[qIndex] === oIndex;
                                        const isCorrect = q.correctAnswer === oIndex;
                                        let optionClass = 'border-gray-200 hover:border-indigo-300 bg-white';

                                        if (showResults) {
                                            if (isCorrect) {
                                                optionClass = 'border-green-500 bg-green-50 text-green-800';
                                            } else if (isSelected && !isCorrect) {
                                                optionClass = 'border-red-500 bg-red-50 text-red-800';
                                            }
                                        } else if (isSelected) {
                                            optionClass = 'border-indigo-500 bg-indigo-50 text-indigo-800';
                                        }

                                        return (
                                            <button
                                                key={oIndex}
                                                onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                                disabled={showResults}
                                                className={`w-full text-left p-3 rounded-lg border transition-all ${optionClass} ${!showResults ? 'cursor-pointer' : 'cursor-default'}`}
                                            >
                                                <span className="font-medium mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Quiz Actions */}
                        <div className="pt-4 border-t border-gray-200">
                            {showResults ? (
                                <div className="text-center">
                                    <div className={`text-2xl font-bold mb-2 ${quizScore === quizQuestions.length ? 'text-green-600' : quizScore >= quizQuestions.length / 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {quizScore} / {quizQuestions.length}
                                    </div>
                                    <p className="text-gray-600 mb-4">
                                        {quizScore === quizQuestions.length ? '🎉 Perfect!' : quizScore >= quizQuestions.length / 2 ? '👍 Good job!' : '📚 Keep learning!'}
                                    </p>
                                    <Button onClick={resetQuiz} variant="outline" className="w-full">
                                        Try Again
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    onClick={submitQuiz}
                                    disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Submit Quiz
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
