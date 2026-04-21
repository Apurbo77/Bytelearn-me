export interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor';
    picture?: string;
}

export interface Lesson {
    id: number;
    course_id: number;
    title: string;
    content?: string;
    content_type: 'video' | 'text' | 'pdf' | 'link' | 'mixed';
    video_url?: string;
    pdf_url?: string;
    external_link?: string;
    external_link_label?: string;
    sequence_number: number;
    created_at?: string;
    updated_at?: string;
}

export interface Course {
    id: number;
    instructor_id: number;
    title: string;
    description: string;
    category: string;
    learning_outcomes?: string;
    status: 'draft' | 'published' | 'archived';
    created_at?: string;
    updated_at?: string;
    lessons?: Lesson[];
    instructor?: User;
    enrollments_count?: number;
    image?: string;
}

export interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    progress: number;
    enrollment_date: string;
}
