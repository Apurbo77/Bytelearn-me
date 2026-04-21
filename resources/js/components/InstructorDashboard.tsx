import { Plus, Edit, Trash2, Users, Eye, TrendingUp, BookOpen, Award, MessageSquare, Clock, BarChart3, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface InstructorDashboardProps {
    onNavigate?: (page: string) => void;
    user?: {
        id: number;
        name: string;
        email: string;
        role: 'student' | 'instructor' | null;
    } | null;
    data?: {
        courses?: any[];
        stats?: {
            totalStudents: number;
            totalCourses: number;
            totalLessons: number;
            avgRating: number;
        };
    };
}

export function InstructorDashboard({ onNavigate, user, data }: InstructorDashboardProps) {
    const myCourses = data?.courses || [];

    const stats = [
        { label: "Total Students", value: data?.stats?.totalStudents?.toString() || "0", change: "", icon: <Users className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
        { label: "Active Courses", value: data?.stats?.totalCourses?.toString() || "0", change: "", icon: <BookOpen className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
        { label: "Avg. Rating", value: data?.stats?.avgRating?.toString() || "0", change: "", icon: <Award className="w-5 h-5" />, color: "bg-yellow-100 text-yellow-600" },
        { label: "Total Lessons", value: data?.stats?.totalLessons?.toString() || "0", change: "", icon: <TrendingUp className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" }
    ];

    const recentActivity: any[] = [];
    const topPerformingLessons: any[] = [];

    const userName = user?.name || 'Instructor';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Welcome, {userName}!</h1>
                            <p className="text-gray-600">Manage your courses and track student progress</p>
                        </div>
                        <a
                            href="/instructor/courses/create"
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Course
                        </a>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className={`${stat.color} rounded-lg p-2 w-fit mb-3`}>
                                    {stat.icon}
                                </div>
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </div>
                                    <div className="text-sm text-green-600 font-medium">{stat.change}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* My Courses */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">My Courses</h2>
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>All Courses</option>
                                    <option>Published</option>
                                    <option>Draft</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                {myCourses.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 mb-2">You haven't created any courses yet.</p>
                                        <a href="/instructor/courses/create" className="text-blue-600 font-medium hover:underline">
                                            Create your first course →
                                        </a>
                                    </div>
                                ) : (
                                    myCourses.map((course) => (
                                        <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div className="p-5">
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                                        <ImageWithFallback
                                                            src={course.image}
                                                            alt={course.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${course.status === 'Published'
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-yellow-500 text-white'
                                                            }`}>
                                                            {course.status}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <div>
                                                                <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                                                                <p className="text-sm text-gray-600">{course.lessons} lessons • Updated {course.lastUpdated}</p>
                                                            </div>
                                                        </div>

                                                        {/* Course Stats */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                                            <div>
                                                                <div className="text-xl font-bold">{course.students}</div>
                                                                <div className="text-xs text-gray-600">Students</div>
                                                            </div>
                                                            {course.status === 'Published' && (
                                                                <>
                                                                    <div>
                                                                        <div className="text-xl font-bold">{course.completionRate}%</div>
                                                                        <div className="text-xs text-gray-600">Completion</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xl font-bold flex items-center gap-1">
                                                                            {course.rating}
                                                                            <Award className="w-4 h-4 text-yellow-500" />
                                                                        </div>
                                                                        <div className="text-xs text-gray-600">{course.reviews} reviews</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xl font-bold text-green-600">{course.revenue}</div>
                                                                        <div className="text-xs text-gray-600">Revenue</div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex flex-wrap gap-2">
                                                            <a
                                                                href={`/instructor/courses/${course.id}/edit`}
                                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit Course
                                                            </a>
                                                            <a href={`/courses/${course.id}/learn/lessons`} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                                                <Eye className="w-4 h-4" />
                                                                View
                                                            </a>
                                                            <a
                                                                href={`/instructor/course/${course.id}/analytics`}
                                                                className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                                                            >
                                                                <BarChart3 className="w-4 h-4" />
                                                                Analytics
                                                            </a>
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                                                                        // Call delete API
                                                                        import('axios').then(axios => {
                                                                            axios.default.delete(`/api/courses/${course.id}`)
                                                                                .then(() => {
                                                                                    window.location.reload();
                                                                                })
                                                                                .catch(err => {
                                                                                    console.error(err);
                                                                                    alert('Failed to delete course');
                                                                                });
                                                                        });
                                                                    }
                                                                }}
                                                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Top Performing Lessons */}
                        <section className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Top Performing Lessons</h3>
                            <div className="space-y-4">
                                {topPerformingLessons.map((lesson, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium mb-2">{lesson.title}</h4>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <div className="text-gray-600">Views</div>
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                        <span>{lesson.views}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600">Completion</div>
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span>{lesson.completion}%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-600">Engagement</div>
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                                        <span>{lesson.engagement}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AI Features */}
                        <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-600 rounded-full p-3 flex-shrink-0">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold mb-2">AI-Powered Course Tools</h3>
                                    <p className="text-gray-600 mb-4">
                                        Enhance your courses with automatic quiz generation based on lesson content.
                                        Save time and ensure comprehensive assessments.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <button className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Generate Quizzes
                                        </button>
                                        <button className="px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors border border-purple-200">
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Recent Activity */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === 'enrollment' ? 'bg-blue-100' :
                                            activity.type === 'completion' ? 'bg-green-100' :
                                                activity.type === 'question' ? 'bg-yellow-100' :
                                                    'bg-purple-100'
                                            }`}>
                                            {activity.type === 'enrollment' && <Users className="w-5 h-5 text-blue-600" />}
                                            {activity.type === 'completion' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                            {activity.type === 'question' && <MessageSquare className="w-5 h-5 text-yellow-600" />}
                                            {activity.type === 'review' && <Award className="w-5 h-5 text-purple-600" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm mb-1">
                                                <span className="font-medium">{activity.student}</span>
                                                {activity.type === 'enrollment' && ' enrolled in '}
                                                {activity.type === 'completion' && ' completed '}
                                                {activity.type === 'question' && ' asked a question in '}
                                                {activity.type === 'review' && ' left a review for '}
                                                <span className="text-gray-600">{activity.course}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* This Week Stats */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4">This Week</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-blue-600" />
                                        <span>New Students</span>
                                    </div>
                                    <span className="text-xl font-bold">143</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span>Completions</span>
                                    </div>
                                    <span className="text-xl font-bold">87</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-5 h-5 text-purple-600" />
                                        <span>Questions</span>
                                    </div>
                                    <span className="text-xl font-bold">24</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Award className="w-5 h-5 text-yellow-600" />
                                        <span>New Reviews</span>
                                    </div>
                                    <span className="text-xl font-bold">15</span>
                                </div>
                            </div>
                        </section>

                        {/* Action Items */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4">Action Items</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm mb-1">5 questions need responses</p>
                                        <button className="text-xs text-yellow-700 hover:underline">Review now</button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm mb-1">Update course content</p>
                                        <button className="text-xs text-blue-700 hover:underline">View courses</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center gap-3 transition-colors">
                                    <Users className="w-5 h-5 text-gray-600" />
                                    <span>Manage Students</span>
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center gap-3 transition-colors">
                                    <MessageSquare className="w-5 h-5 text-gray-600" />
                                    <span>Q&A Forum</span>
                                </button>
                                <button className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left flex items-center gap-3 transition-colors">
                                    <BarChart3 className="w-5 h-5 text-gray-600" />
                                    <span>Full Analytics</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
