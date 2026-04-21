import { Search, Bell, User } from 'lucide-react';
import { ByteLearnLogo, ByteLearnLogoText } from './ByteLearnLogo';

interface NavbarProps {
    userRole?: 'student' | 'instructor' | null;
    userName?: string;
    onNavigate?: (page: string) => void;
}

export function Navbar({ userRole, userName, onNavigate }: NavbarProps) {
    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <ByteLearnLogo className="w-10 h-10" />
                        <ByteLearnLogoText className="text-xl" />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses, instructors..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/courses?search=${e.currentTarget.value}`;
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate?.('courses')}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors hidden sm:block"
                        >
                            Courses
                        </button>

                        {userRole ? (
                            <>
                                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>
                                <button
                                    onClick={() => onNavigate?.(userRole === 'student' ? 'student-dashboard' : 'instructor-dashboard')}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden sm:inline">{userName || 'Dashboard'}</span>
                                </button>
                                <form method="POST" action="/logout" className="inline-block">
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ml-2"
                                    >
                                        Log Out
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => onNavigate?.('login')}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => onNavigate?.('register')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Sign Up
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
