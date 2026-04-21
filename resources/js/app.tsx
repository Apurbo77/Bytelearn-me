import { useState, useEffect } from 'react';
import axios from 'axios';


// Configure axios CSRF token
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { StudentDashboard } from './components/StudentDashboard';
import { InstructorDashboard } from './components/InstructorDashboard';
import { CourseEditor } from './components/CourseEditor';
import { LessonPlayer } from './components/LessonPlayer';
import { CourseCatalog } from './components/CourseCatalog';

import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';

import { CourseDetails } from './components/CourseDetails';
import { CertificatesPage } from './components/CertificatesPage';

type Page = 'home' | 'student-dashboard' | 'instructor-dashboard' | 'course-editor' | 'lesson-player' | 'courses' | 'login' | 'register' | 'blade' | 'course-details' | 'certificates' | 'instructor-analytics';
type UserRole = 'student' | 'instructor' | null;

interface AppProps {
    initialData?: {
        page?: Page;
        user?: {
            id: number;
            name: string;
            email: string;
            role: UserRole;
            location?: string | null;
        };
        dashboardData?: any;
        courseId?: number;
        lessonId?: number;
        course?: any; // Full course object for details page
        courses?: any[]; // For catalog
        enrolledCourseIds?: number[]; // IDs of courses user is enrolled in
        certificates?: any[]; // For certificates page
        analyticsData?: any; // For instructor analytics page
        error?: string; // For login/auth errors
    };
}

import { createRoot } from 'react-dom/client';

export default function App({ initialData = {} }: AppProps) {
    const [currentPage, setCurrentPage] = useState<Page>(initialData.page || 'home');
    const [userRole, setUserRole] = useState<UserRole>(initialData.user?.role || null);
    const [user, setUser] = useState(initialData.user || null);
    const [dashboardData, setDashboardData] = useState(initialData.dashboardData || null);
    // Courses Data
    const [courses, setCourses] = useState(initialData.courses || []);

    const handleNavigate = (page: string) => {
        // For actual navigation, redirect to Laravel routes
        if (page === 'home') {
            window.location.href = '/';
        } else if (page === 'student-dashboard') {
            window.location.href = '/student/dashboard';
        } else if (page === 'instructor-dashboard') {
            window.location.href = '/instructor/dashboard';
        } else if (page === 'courses') {
            window.location.href = '/courses';
        } else if (page === 'certificates') {
            window.location.href = '/student/certificates';
        } else if (page === 'login') {
            window.location.href = '/login';
        } else if (page === 'register') {
            window.location.href = '/register';
        }
    };

    return (
        <div className={`bg-white ${currentPage === 'blade' ? '' : 'min-h-screen'}`}>
            {currentPage !== 'lesson-player' && currentPage !== 'login' && currentPage !== 'register' && (
                <Navbar
                    userRole={userRole}
                    userName={user?.name}
                    onNavigate={handleNavigate}
                />
            )}

            {currentPage === 'home' && <Homepage onNavigate={handleNavigate} />}
            {currentPage === 'student-dashboard' && (
                <StudentDashboard
                    onNavigate={handleNavigate}
                    user={user}
                    data={dashboardData}
                />
            )}
            {currentPage === 'instructor-dashboard' && (
                <InstructorDashboard
                    onNavigate={handleNavigate}
                    user={user}
                    data={dashboardData}
                />
            )}
            {currentPage === 'courses' && (
                <CourseCatalog
                    courses={courses}
                    enrolledCourseIds={initialData.enrolledCourseIds || []}
                    onNavigate={handleNavigate}
                />
            )}
            {currentPage === 'course-editor' && initialData.courseId && (
                <CourseEditor
                    courseId={initialData.courseId}
                    onNavigate={handleNavigate}
                />
            )}
            {currentPage === 'course-details' && initialData.course && (
                <CourseDetails
                    course={initialData.course}
                    user={user}
                    onNavigate={handleNavigate}
                />
            )}
            {currentPage === 'lesson-player' && initialData.courseId && (
                <LessonPlayer
                    courseId={initialData.courseId}
                    initialLessonId={initialData.lessonId}
                    user={user}
                    onNavigate={handleNavigate}
                />
            )}
            {currentPage === 'certificates' && (
                <CertificatesPage
                    certificates={initialData.certificates || []}
                    user={user}
                    onNavigate={handleNavigate}
                />
            )}
            {currentPage === 'login' && <LoginForm initialError={initialData.error} />}
            {currentPage === 'register' && <RegisterForm />}
            
            {/* 'blade' pages will just render Navbar (above) and let Blade yield its content */}
        </div>
    );
}

// Mount logic
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    const scriptTag = document.getElementById('app-data');
    const initialData = scriptTag ? JSON.parse(scriptTag.textContent || '{}') : {};
    root.render(<App initialData={initialData} />);
}
