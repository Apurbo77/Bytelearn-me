import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { Button } from './Button';
import axios from 'axios';
import { BookOpen, Search, User, Clock, Star, Filter, CheckCircle, Play, ArrowRight } from 'lucide-react';

interface CourseCatalogProps {
    courses: Course[];
    enrolledCourseIds?: number[];
    onNavigate: (page: string) => void;
}

export const CourseCatalog: React.FC<CourseCatalogProps> = ({ courses = [], enrolledCourseIds = [], onNavigate }) => {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        axios.get('/api/courses/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleCategoryClick = (category: string) => {
        const url = new URL(window.location.href);
        if (category === 'All') {
            url.searchParams.delete('category');
        } else {
            url.searchParams.set('category', category);
        }
        window.location.href = url.toString();
    };

    const currentCategory = new URLSearchParams(window.location.search).get('category') || 'All';

    const isEnrolled = (courseId: number) => enrolledCourseIds.includes(courseId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-16">
            {/* Modern Header / Hero */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white pt-28 pb-16">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm font-medium">Premium Learning Experience</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold mb-5 tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Explore Courses
                    </h1>
                    <p className="text-blue-100 text-xl max-w-2xl mx-auto leading-relaxed">
                        Master new skills with expert-led courses designed for the future.
                    </p>
                </div>
            </div>

            {/* Filter Section */}
            <div className="container mx-auto px-6 -mt-8 relative z-20">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/5 p-6 border border-white/50">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
                            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
                            <button
                                onClick={() => handleCategoryClick('All')}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${currentCategory === 'All'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md'
                                    }`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${currentCategory === cat
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-md'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Grid */}
            <div className="container mx-auto px-6 py-14">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.map(course => {
                        const enrolled = isEnrolled(course.id);
                        return (
                            <div key={course.id} className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col h-full hover:-translate-y-2">
                                {/* Enrolled Badge */}
                                {enrolled && (
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Enrolled
                                    </div>
                                )}

                                {/* Image Section */}
                                <div className="h-52 relative overflow-hidden">
                                    {course.image ? (
                                        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500">
                                            <BookOpen className="w-16 h-16 text-white/80" />
                                        </div>
                                    )}
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Category Badge */}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/95 backdrop-blur-sm text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide shadow-sm">
                                            {course.category || 'General'}
                                        </span>
                                    </div>

                                    {/* Play Button on Hover */}
                                    {enrolled && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="bg-white rounded-full p-4 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                                <Play className="w-8 h-8 text-blue-600 fill-blue-600" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2 text-left group-hover:text-blue-600 transition-colors duration-300">
                                        {course.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-5 flex-1 text-left leading-relaxed">
                                        {course.description}
                                    </p>

                                    <div className="mt-auto space-y-4">
                                        {/* Instructor */}
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                                {(course.instructor?.name || 'T')[0]}
                                            </div>
                                            <span className="text-sm text-slate-600 font-medium">{course.instructor?.name || 'Top Instructor'}</span>
                                        </div>

                                        {/* Rating & Action */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                ))}
                                                <span className="text-xs text-slate-500 ml-1">5.0</span>
                                            </div>

                                            {enrolled ? (
                                                <a
                                                    href={`/student/continue/${course.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                                                >
                                                    <Play className="w-4 h-4" />
                                                    Continue
                                                </a>
                                            ) : (
                                                <a
                                                    href={`/courses/${course.id}`}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors group/link"
                                                >
                                                    View Course
                                                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {courses.length === 0 && (
                    <div className="text-center py-24">
                        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                            <Search className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No courses found</h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                            We couldn't find any courses matching your criteria. Try adjusting your filters or search terms.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/courses'}
                            className="px-6 py-3 rounded-xl"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
