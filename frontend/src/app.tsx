import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Configure axios API URL from Environment Variables (Fallback to local Backend)
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_BASE_URL;

// Configure axios CSRF token
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true; // Important for Sanctum/session auth

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

type UserRole = 'student' | 'instructor' | null;

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [user, setUser] = useState<any>(null);
    
    // Attempt to fetch authenticated user on mount
    useEffect(() => {
        // Fetch CSRF cookie, then user data using typical Laravel Sanctum flow
        axios.get('/sanctum/csrf-cookie').then(() => {
            axios.get('/api/user')
                .then(res => {
                    if (res.data) {
                       setUser(res.data);
                       setUserRole(res.data.role);
                    }
                })
                .catch(err => {
                    console.error("Not authenticated", err);
                });
        });
    }, []);

    const handleNavigate = (page: string) => {
        if (page === 'home') navigate('/');
        else if (page === 'student-dashboard') navigate('/student/dashboard');
        else if (page === 'instructor-dashboard') navigate('/instructor/dashboard');
        else if (page === 'courses') navigate('/courses');
        else if (page === 'certificates') navigate('/student/certificates');
        else if (page === 'login') navigate('/login');
        else if (page === 'register') navigate('/register');
    };

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isLessonPlayer = location.pathname.includes('/lesson-player');

    return (
        <div className={`bg-white min-h-screen`}>
            {!isLessonPlayer && !isAuthPage && (
                <Navbar
                    userRole={userRole}
                    userName={user?.name}
                    onNavigate={handleNavigate}
                />
            )}

            <Routes>
                <Route path="/" element={<Homepage onNavigate={handleNavigate} />} />
                
                {/* Auth */}
                <Route path="/login" element={<LoginForm initialError={""} />} />
                <Route path="/register" element={<RegisterForm />} />
                
                {/* Catalog & Courses */}
                <Route path="/courses" element={<CourseCatalog courses={[]} enrolledCourseIds={[]} onNavigate={handleNavigate} />} />
                <Route path="/courses/:id" element={<CourseDetails course={null as any} user={user} onNavigate={handleNavigate} />} />
                
                {/* Student Routes */}
                <Route path="/student/dashboard" element={<StudentDashboard onNavigate={handleNavigate} user={user} data={null as any} />} />
                <Route path="/student/certificates" element={<CertificatesPage certificates={[]} user={user} onNavigate={handleNavigate} />} />
                
                {/* Instructor Routes */}
                <Route path="/instructor/dashboard" element={<InstructorDashboard onNavigate={handleNavigate} user={user} data={null as any} />} />
                <Route path="/instructor/course-editor/:id?" element={<CourseEditor courseId={undefined as any} onNavigate={handleNavigate} />} />
                
                {/* General/Lesson */}
                <Route path="/lesson-player/:courseId/:lessonId?" element={<LessonPlayer courseId={0} initialLessonId={undefined} user={user} onNavigate={handleNavigate} />} />
            </Routes>
        </div>
    );
}
