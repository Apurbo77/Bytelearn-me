import React from 'react';
import { Users, TrendingUp, Star, MessageSquare, ArrowLeft } from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    userName: string;
    createdAt: string;
}

interface AnalyticsData {
    courseId: number;
    courseTitle: string;
    totalEnrollments: number;
    enrollmentsThisWeek: number;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    reviews: Review[];
}

interface InstructorAnalyticsProps {
    data: AnalyticsData;
    onNavigate: (page: string) => void;
}

export function InstructorAnalytics({ data, onNavigate }: InstructorAnalyticsProps) {
    const maxRatingCount = Math.max(...Object.values(data.ratingDistribution), 1);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => onNavigate('instructor-dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Course Analytics</h1>
                    <p className="text-gray-600 mt-1">{data.courseTitle}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Enrollments</p>
                                <p className="text-2xl font-bold">{data.totalEnrollments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 text-green-600 rounded-lg p-3">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Enrollments This Week</p>
                                <p className="text-2xl font-bold">{data.enrollmentsThisWeek}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-100 text-yellow-600 rounded-lg p-3">
                                <Star className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Average Rating</p>
                                <p className="text-2xl font-bold">{data.averageRating > 0 ? data.averageRating.toFixed(1) : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 text-purple-600 rounded-lg p-3">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Reviews</p>
                                <p className="text-2xl font-bold">{data.totalReviews}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rating Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6">Rating Distribution</h2>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-16">
                                        <span className="text-sm font-medium">{star}</span>
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </div>
                                    <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-400 rounded-full transition-all"
                                            style={{ width: `${(data.ratingDistribution[star] / maxRatingCount) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-500 w-8 text-right">
                                        {data.ratingDistribution[star] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-6">Student Reviews</h2>
                        {data.reviews.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No reviews yet</p>
                        ) : (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {data.reviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                    {review.userName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{review.userName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
                                        )}
                                        <p className="text-xs text-gray-400">{review.createdAt}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
