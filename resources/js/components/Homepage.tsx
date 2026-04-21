import { useState, useEffect } from 'react';
import { BookOpen, Users, Award, TrendingUp, Sparkles, MessageSquare, Play, Star, Clock, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { ByteLearnLogo, ByteLearnLogoText } from './ByteLearnLogo';
import axios from 'axios';

interface HomepageProps {
    onNavigate?: (page: string) => void;
}

interface FeaturedCourse {
    id: number;
    title: string;
    instructor: string;
    image: string;
    rating: number;
    students: number;
    lessons: number;
    duration: string;
    level: string;
}

export function Homepage({ onNavigate }: HomepageProps) {
    const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);

    useEffect(() => {
        const fetchFeaturedCourses = async () => {
            try {
                const res = await axios.get('/api/courses/featured');
                setFeaturedCourses(res.data || []);
            } catch (error) {
                console.error('Failed to fetch featured courses:', error);
                setFeaturedCourses([]);
            }
        };
        fetchFeaturedCourses();
    }, []);

    const features = [
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "AI-Powered Learning",
            description: "Auto-generated quizzes and intelligent chatbot assistance"
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Progress Tracking",
            description: "Visual progress bars and completion certificates"
        },
        {
            icon: <MessageSquare className="w-6 h-6" />,
            title: "Interactive Q&A",
            description: "Engage with peers and instructors in discussions"
        },
        {
            icon: <Award className="w-6 h-6" />,
            title: "Earn Certificates",
            description: "Get recognized for your achievements"
        }
    ];

    const stats = [
        { label: "Active Learners", value: "15,000+" },
        { label: "Expert Instructors", value: "500+" },
        { label: "Courses Available", value: "1,200+" },
        { label: "Completion Rate", value: "92%" }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-500/30 px-4 py-2 rounded-full mb-6">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm">AI-Powered Micro Learning</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6">
                                Learn Smarter, <br />Not Harder
                            </h1>
                            <p className="text-xl text-blue-100 mb-8">
                                Join ByteLearn's peer-led platform where instructors create engaging courses
                                and students learn with AI-powered tools, interactive quizzes, and real-time assistance.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => onNavigate?.('register')}
                                    className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
                                >
                                    <span>Start Learning</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onNavigate?.('register')}
                                    className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Teach on ByteLearn
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <ImageWithFallback
                                    src="https://images.unsplash.com/photo-1759984782106-4b56d0aa05b8?w=800"
                                    alt="Student learning online"
                                    className="w-full h-[400px] object-cover"
                                />
                            </div>
                            {/* Floating Card */}
                            <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 p-4 rounded-xl shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500 rounded-full p-3">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">5,000+</div>
                                        <div className="text-sm text-gray-600">Certificates Issued</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-gray-50 py-12 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Choose ByteLearn?</h2>
                        <p className="text-xl text-gray-600">
                            Experience the future of online education with our innovative features
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                <div className="bg-blue-100 text-blue-600 rounded-lg p-3 w-fit mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Courses */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl font-bold mb-4">Featured Courses</h2>
                            <p className="text-xl text-gray-600">
                                Explore our most popular learning paths
                            </p>
                        </div>
                        <button
                            onClick={() => onNavigate?.('courses')}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold"
                        >
                            View All Courses
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredCourses.map((course) => (
                            <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
                                <div className="relative">
                                    <ImageWithFallback
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-medium">
                                        {course.level}
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                        <div className="bg-white rounded-full p-3">
                                            <Play className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-gray-600 mb-4">by {course.instructor}</p>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium">{course.rating}</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                                            <Users className="w-4 h-4" />
                                            <span>{course.students}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-1">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{course.lessons} lessons</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{course.duration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning Journey?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of learners and instructors already on ByteLearn
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => onNavigate?.('register')}
                            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Get Started Free
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <ByteLearnLogo className="w-8 h-8" />
                                <ByteLearnLogoText className="text-lg" showTagline />
                            </div>
                            <p className="text-sm">
                                Empowering learners worldwide with peer-led micro learning
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="/courses" className="hover:text-white">Browse Courses</a></li>
                                <li><a href="/register" className="hover:text-white">Become Instructor</a></li>
                                <li><a href="#" className="hover:text-white">Leaderboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Help Center</a></li>
                                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white">FAQs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Careers</a></li>
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-800 text-center text-sm">
                        <p>&copy; 2025 ByteLearn. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
