import React, { useState } from 'react';
import { Course } from '../types';
import { Button } from './Button';
import { Clock, BookOpen, User, Star, PlayCircle, CheckCircle, Share2, Award, Lock } from 'lucide-react';
import axios from 'axios';

interface CourseDetailsProps {
    course: Course;
    user: any;
    onNavigate: (page: string) => void;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ course, user, onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [enrolled, setEnrolled] = useState(false);

    const handleEnroll = async () => {
        if (!user) {
            onNavigate('login');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/student/enroll/${course.id}`);
            setEnrolled(true);
            // Redirect to dashboard after short delay or show success
            window.location.href = '/student/dashboard';
        } catch (error) {
            console.error(error);
            alert('Enrollment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-900/20"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-indigo-500/30 border border-indigo-400/30 rounded-full text-sm font-medium mb-6 text-indigo-100 backdrop-blur-sm">
                                    {course.category || 'General'}
                                </span>
                                <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-white">{course.title}</h1>
                                <p className="text-xl text-indigo-100 mb-8 leading-relaxed opacity-90">{course.description}</p>

                                <div className="flex flex-wrap gap-6 text-indigo-100 text-sm mb-8">
                                    <div className="flex items-center gap-2 bg-indigo-800/50 px-3 py-1.5 rounded-lg">
                                        <User className="w-4 h-4 text-indigo-300" />
                                        <span>{course.instructor?.name || 'Top Instructor'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-indigo-800/50 px-3 py-1.5 rounded-lg">
                                        <Clock className="w-4 h-4 text-indigo-300" />
                                        <span>Last updated {new Date(course.updated_at || Date.now()).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-indigo-800/50 px-3 py-1.5 rounded-lg">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-current" />
                                            ))}
                                        </div>
                                        <span>{(course as any).average_rating || '4.5'} ({(course as any).reviews_count || 0} reviews)</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button
                                        size="lg"
                                        className="bg-white !text-blue-700 hover:bg-blue-50 border-0 font-bold px-8 shadow-lg"
                                        onClick={handleEnroll}
                                        disabled={loading || enrolled}
                                    >
                                        {loading ? 'Enrolling...' : enrolled ? 'Enrolled ✓' : 'Enroll Now - Start Learning'}
                                    </Button>
                                    <span className="text-sm self-center text-indigo-200 flex items-center gap-1">
                                        <Award className="w-4 h-4" />
                                        Certificate of completion included
                                    </span>
                                </div>
                            </div>

                            {/* Course Thumbnail/Preview Card */}
                            <div className="w-full md:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900 hidden md:block transform rotate-1 hover:rotate-0 transition-transform duration-300">
                                <div className="h-48 bg-gray-200 relative group cursor-pointer">
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <BookOpen className="w-12 h-12 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                                        <div className="bg-white/90 rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
                                            <PlayCircle className="w-8 h-8 text-indigo-600 ml-1" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-3xl font-bold mb-2 text-indigo-900">Free</div>
                                    <div className="text-gray-500 text-sm mb-6 line-through">$49.99</div>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <span>{course.lessons?.length || 0} Lessons</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <div className="p-1.5 bg-purple-50 text-purple-600 rounded">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <span>Self-paced learning</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                            <div className="p-1.5 bg-green-50 text-green-600 rounded">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                            <span>Access on mobile and TV</span>
                                        </div>
                                    </div>
                                    <button className="w-full py-2 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <Share2 className="w-4 h-4" /> Share this course
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900">Course Content</h2>
                                <div className="space-y-3">
                                    {course.lessons && course.lessons.length > 0 ? (
                                        course.lessons.sort((a, b) => a.sequence_number - b.sequence_number).map((lesson, index) => (
                                            <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full border border-gray-200 text-sm font-bold text-gray-500 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-colors">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1 gap-4">
                                                            <h4 className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                                {lesson.title}
                                                            </h4>
                                                            <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 italic">No lessons have been added to this course yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
