import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Award, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';

interface QuizQuestion {
    id: number;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    options?: string[];
    correct_answer: string | number;
    explanation?: string;
}

interface QuizTakeProps {
    quizId?: number;
    lessonId?: number;
    title?: string;
    questions?: QuizQuestion[];
    timeLimit?: number; // in minutes
    onComplete?: (score: number, answers: Record<number, string>) => void;
    onClose?: () => void;
    isAIGenerated?: boolean;
}

export function QuizTake({ 
    quizId,
    lessonId,
    title = "Lesson Quiz",
    questions: initialQuestions,
    timeLimit,
    onComplete,
    onClose,
    isAIGenerated = false
}: QuizTakeProps) {
    const [questions] = useState<QuizQuestion[]>(initialQuestions || [
        {
            id: 1,
            question: "What is the primary purpose of React hooks?",
            type: "multiple-choice",
            options: [
                "To style components",
                "To manage state and side effects in functional components",
                "To create class components",
                "To handle routing"
            ],
            correct_answer: 1,
            explanation: "React hooks allow functional components to use state and other React features without writing a class."
        },
        {
            id: 2,
            question: "useState is a React hook.",
            type: "true-false",
            options: ["True", "False"],
            correct_answer: 0,
            explanation: "useState is indeed a React hook used for managing state in functional components."
        },
        {
            id: 3,
            question: "What does JSX stand for?",
            type: "multiple-choice",
            options: [
                "JavaScript XML",
                "Java Syntax Extension",
                "JavaScript Extension",
                "Java Standard XML"
            ],
            correct_answer: 0,
            explanation: "JSX stands for JavaScript XML, which allows us to write HTML-like syntax in JavaScript."
        }
    ]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Timer
    useEffect(() => {
        if (timeRemaining === null || timeRemaining <= 0 || showResults) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev && prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev ? prev - 1 : null;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, showResults]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (answer: string) => {
        setAnswers({
            ...answers,
            [currentQuestion.id]: answer
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        // Calculate score
        let correct = 0;
        questions.forEach(q => {
            const userAnswer = answers[q.id];
            const correctAnswer = q.type === 'multiple-choice' || q.type === 'true-false'
                ? q.options?.[q.correct_answer as number]
                : q.correct_answer;
            
            if (userAnswer === correctAnswer) {
                correct++;
            }
        });

        const score = (correct / questions.length) * 100;

        try {
            // Submit to backend
            if (quizId && !isAIGenerated) {
                await fetch('/api/quiz/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (window as any).csrfToken || ''
                    },
                    body: JSON.stringify({
                        quiz_id: quizId,
                        lesson_id: lessonId,
                        answers,
                        score
                    })
                });
            }

            if (onComplete) {
                onComplete(score, answers);
            }

            setShowResults(true);
        } catch (error) {
            console.error('Quiz submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateResults = () => {
        let correct = 0;
        const results: Array<{
            question: QuizQuestion;
            userAnswer: string;
            isCorrect: boolean;
        }> = [];

        questions.forEach(q => {
            const userAnswer = answers[q.id] || 'Not answered';
            const correctAnswer = q.type === 'multiple-choice' || q.type === 'true-false'
                ? q.options?.[q.correct_answer as number]
                : q.correct_answer;
            
            const isCorrect = userAnswer === correctAnswer;
            if (isCorrect) correct++;

            results.push({
                question: q,
                userAnswer,
                isCorrect
            });
        });

        return { correct, total: questions.length, results };
    };

    if (showResults) {
        const { correct, total, results } = calculateResults();
        const percentage = (correct / total) * 100;

        return (
            <div className="max-w-4xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <div className="text-center">
                            <div className="mb-4">
                                {percentage >= 80 ? (
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <Award className="w-10 h-10 text-green-600" />
                                    </div>
                                ) : percentage >= 60 ? (
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-10 h-10 text-blue-600" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                        <XCircle className="w-10 h-10 text-red-600" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold mb-2">
                                {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
                            </h2>
                            <p className="text-gray-600">
                                You scored {correct} out of {total} ({Math.round(percentage)}%)
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Results Breakdown */}
                        <div className="space-y-4">
                            {results.map((result, index) => (
                                <div key={result.question.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {result.isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-2">
                                                {index + 1}. {result.question.question}
                                            </p>
                                            <div className="space-y-1 text-sm">
                                                <p>
                                                    <span className="text-gray-600">Your answer:</span>{' '}
                                                    <span className={result.isCorrect ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                        {result.userAnswer}
                                                    </span>
                                                </p>
                                                {!result.isCorrect && (
                                                    <p>
                                                        <span className="text-gray-600">Correct answer:</span>{' '}
                                                        <span className="text-green-600 font-medium">
                                                            {result.question.type === 'multiple-choice' || result.question.type === 'true-false'
                                                                ? result.question.options?.[result.question.correct_answer as number]
                                                                : result.question.correct_answer}
                                                        </span>
                                                    </p>
                                                )}
                                                {result.question.explanation && (
                                                    <p className="text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                                                        💡 {result.question.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-center">
                            {onClose && (
                                <Button variant="outline" onClick={onClose}>
                                    Close
                                </Button>
                            )}
                            <Button 
                                variant="primary" 
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retake Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <CardTitle>{title}</CardTitle>
                            {isAIGenerated && (
                                <Badge variant="info" className="mt-2">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Generated
                                </Badge>
                            )}
                        </div>
                        {timeRemaining !== null && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-5 h-5" />
                                <span className="font-mono font-semibold">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span>{Math.round(progress)}% Complete</span>
                        </div>
                        <Progress value={progress} />
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Question */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            {currentQuestion.question}
                        </h3>

                        {/* Answer Options */}
                        <div className="space-y-3">
                            {currentQuestion.options?.map((option, index) => (
                                <label
                                    key={index}
                                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                        answers[currentQuestion.id] === option
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option}
                                        checked={answers[currentQuestion.id] === option}
                                        onChange={(e) => handleAnswerSelect(e.target.value)}
                                        className="mt-1"
                                    />
                                    <span className="flex-1 text-gray-900">{option}</span>
                                </label>
                            ))}

                            {currentQuestion.type === 'short-answer' && (
                                <textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswerSelect(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={4}
                                    placeholder="Type your answer here..."
                                />
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                                variant="primary"
                                onClick={handleNext}
                                disabled={!answers[currentQuestion.id]}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                onClick={handleSubmit}
                                disabled={!answers[currentQuestion.id] || isSubmitting}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
