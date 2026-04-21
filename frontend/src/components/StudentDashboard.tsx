import { BookOpen, Play, Clock, CheckCircle2, Trophy, Bell, TrendingUp, Award, MessageSquare, Bot, ArrowRight, Star, BarChart3, Plus, Trash2, Edit2, Filter, MapPin, Map } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import { useState, useEffect } from 'react';

interface StudentDashboardProps {
    onNavigate?: (page: string) => void;
    user?: {
        id: number;
        name: string;
        email: string;
        role: 'student' | 'instructor' | null;
        location?: string | null;
        lat?: number | null;
        lon?: number | null;
        share_email?: boolean;
    } | null;
    data?: {
        enrolledCourses?: any[];
        completedCourses?: any[];
        notifications?: any[];
        privateNotes?: any[];
        enrolledLessions?: any[];
        recentDiscussions?: any[];
        stats?: {
            ongoingCourses: number;
            completedCourses: number;
            learningStreak: number;
            certificatesEarned: number;
        };
        courseProgress?: Record<number, number>;
        leaderboard?: {
            id: number;
            name: string;
            points: number;
            streak: number;
            lessonsCompleted: number;
        }[];
        currentUserPoints?: number;
        nearbyStudents?: any[];
    };
}

export function StudentDashboard({ onNavigate, user, data }: StudentDashboardProps) {
    // State management - Private Notes
    const [notes, setNotes] = useState(data?.privateNotes || []);
    const [newNote, setNewNote] = useState('');
    const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State management - Lesson Notes
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [lessonNotes, setLessonNotes] = useState<Record<number, any[]>>({});
    const [newLessonNote, setNewLessonNote] = useState('');
    const [editingLessonNoteId, setEditingLessonNoteId] = useState<number | null>(null);
    const [editingLessonNoteContent, setEditingLessonNoteContent] = useState('');

    // State management - Discussions
    const [selectedLessonFilter, setSelectedLessonFilter] = useState<number | null>(null);
    const [selectedDiscussionLessonId, setSelectedDiscussionLessonId] = useState<number | null>(null);
    const [newDiscussionContent, setNewDiscussionContent] = useState('');
    const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);

    // Profile settings
    const [location, setLocation] = useState(user?.location || '');
    const [latitude, setLatitude] = useState<number | null>(user?.lat || null);
    const [longitude, setLongitude] = useState<number | null>(user?.lon || null);
    const [shareEmail, setShareEmail] = useState<boolean>(user?.share_email ?? true);
    const [contactModalStudent, setContactModalStudent] = useState<any>(null);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    // Nearby Students logic
    const [nearbyStudents, setNearbyStudents] = useState<any[]>(data?.nearbyStudents || []);
    const [calculatingRoutes, setCalculatingRoutes] = useState(false);
    const [selectedMapStudentId, setSelectedMapStudentId] = useState<number | null>(null);

    // Use data passed from Laravel
    const enrolledCourses = data?.enrolledCourses || [];

    const completedCourses = data?.completedCourses || [];

    const notifications = data?.notifications || [];
    
    const enrolledLessions = data?.enrolledLessions || [];
    
    const allDiscussions = data?.recentDiscussions || [];
    
    // Filter discussions by lesson if selected
    const filteredDiscussions = selectedLessonFilter 
        ? allDiscussions.filter((d: any) => d.lesson_id === selectedLessonFilter)
        : allDiscussions;

    // Check OSRM distances for nearby students
    useEffect(() => {
        const checkRouteDistances = async () => {
            if (!user?.lat || !user?.lon || !nearbyStudents.length || calculatingRoutes) return;
            
            setCalculatingRoutes(true);
            const updatedStudents = [...nearbyStudents];
            
            for (let i = 0; i < updatedStudents.length; i++) {
                const student = updatedStudents[i];
                if (!student.route_distance) {
                    try {
                        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${user.lon},${user.lat};${student.lon},${student.lat}?overview=true&geometries=geojson`);
                        if (response.ok) {
                            const routeData = await response.json();
                            if (routeData.routes && routeData.routes[0]) {
                                // Convert meters to km
                                student.route_distance = (routeData.routes[0].distance / 1000).toFixed(2);
                                student.route_geometry = routeData.routes[0].geometry;
                            }
                        }
                    } catch (e) {
                        console.error('OSRM route error', e);
                    }
                }
            }
            
            setNearbyStudents([...updatedStudents]);
            setCalculatingRoutes(false);
        };
        
        checkRouteDistances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Draw Map when a student is selected
    useEffect(() => {
        if (!selectedMapStudentId || !user?.lat || !user?.lon) return;

        const selectedTgt = nearbyStudents.find(s => s.id === selectedMapStudentId);
        if (!selectedTgt) return;

        const L = (window as any).L;
        if (!L) return;

        const mapId = `leaflet-map-${selectedMapStudentId}`;
        const mapContainer = document.getElementById(mapId);
        if (!mapContainer || (mapContainer as any)._leaflet_map) return;

        // Initialize the map
        const map = L.map(mapId);
        (mapContainer as any)._leaflet_map = map;

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        L.marker([user.lat, user.lon]).addTo(map).bindPopup('You are here!').openPopup();
        L.marker([selectedTgt.lat, selectedTgt.lon]).addTo(map).bindPopup(`${selectedTgt.name}'s Location`);

        // Draw Route line if available from OSRM, else straight line polyline
        if (selectedTgt.route_geometry && selectedTgt.route_geometry.coordinates) {
            // geojson uses [lon, lat], convert to [lat, lon]
            const coords = selectedTgt.route_geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
            const routeLine = L.polyline(coords, {color: 'green', weight: 5, opacity: 0.7}).addTo(map);
            map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
        } else {
            const latlngs = [
                [user.lat, user.lon],
                [selectedTgt.lat, selectedTgt.lon]
            ];
            const polyline = L.polyline(latlngs, {color: 'blue', dashArray: '5, 10', weight: 4}).addTo(map);
            map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        }

        return () => {
            map.remove();
            delete (mapContainer as any)._leaflet_map;
        };
    }, [selectedMapStudentId, nearbyStudents, user?.lat, user?.lon]);

    // Handle Add Note
    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch('/student/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ content: newNote })
            });
            
            const result = await response.json();
            console.log('Add Note Response:', result);
            
            if (result.success && result.data) {
                const formattedNote = {
                    id: result.data.id,
                    content: result.data.content,
                    createdAt: new Date(result.data.created_at).toLocaleString(),
                    updatedAt: new Date(result.data.updated_at).toLocaleString()
                };
                setNotes([formattedNote, ...notes]);
                setNewNote('');
                alert('Note added successfully!');
            } else {
                alert('Error: ' + (result.message || 'Failed to add note'));
                console.error('Error response:', result);
            }
        } catch (error) {
            console.error('Error adding note:', error);
            alert('Error adding note: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Update Note
    const handleUpdateNote = async (noteId: number) => {
        if (!editingContent.trim()) return;
        
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(`/student/notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ content: editingContent })
            });
            
            const result = await response.json();
            console.log('Update Note Response:', result);
            
            if (result.success && result.data) {
                const formattedNote = {
                    id: result.data.id,
                    content: result.data.content,
                    createdAt: new Date(result.data.created_at).toLocaleString(),
                    updatedAt: new Date(result.data.updated_at).toLocaleString()
                };
                setNotes(notes.map(n => n.id === noteId ? formattedNote : n));
                setEditingNoteId(null);
                setEditingContent('');
                alert('Note updated successfully!');
            } else {
                alert('Error: ' + (result.message || 'Failed to update note'));
            }
        } catch (error) {
            console.error('Error updating note:', error);
            alert('Error updating note: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Note
    const handleDeleteNote = async (noteId: number) => {
        if (!confirm('Are you sure you want to delete this note?')) return;
        
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(`/student/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            const result = await response.json();
            console.log('Delete Note Response:', result);
            
            if (result.success) {
                setNotes(notes.filter(n => n.id !== noteId));
                alert('Note deleted successfully!');
            } else {
                alert('Error: ' + (result.message || 'Failed to delete note'));
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Error deleting note: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Load Lesson Notes
    const handleLoadLessonNotes = async (lessonId: number) => {
        if (lessonNotes[lessonId]) {
            setSelectedLessonId(lessonId);
            return;
        }

        try {
            const response = await fetch(`/student/lesson/${lessonId}/notes`);
            const result = await response.json();
            
            if (result.success) {
                const formattedNotes = result.data.map((note: any) => ({
                    id: note.id,
                    content: note.content,
                    createdAt: new Date(note.created_at).toLocaleString(),
                    updatedAt: new Date(note.updated_at).toLocaleString()
                }));
                setLessonNotes(prev => ({ ...prev, [lessonId]: formattedNotes }));
                setSelectedLessonId(lessonId);
            }
        } catch (error) {
            console.error('Error loading lesson notes:', error);
        }
    };

    // Handle Add Lesson Note
    const handleAddLessonNote = async () => {
        if (!newLessonNote.trim() || !selectedLessonId) return;
        
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(`/student/lesson/${selectedLessonId}/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ content: newLessonNote })
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const formattedNote = {
                    id: result.data.id,
                    content: result.data.content,
                    createdAt: new Date(result.data.created_at).toLocaleString(),
                    updatedAt: new Date(result.data.updated_at).toLocaleString()
                };
                setLessonNotes(prev => ({
                    ...prev,
                    [selectedLessonId]: [formattedNote, ...(prev[selectedLessonId] || [])]
                }));
                setNewLessonNote('');
                alert('Note added successfully!');
            } else {
                alert('Error: ' + (result.message || 'Failed to add note'));
            }
        } catch (error) {
            console.error('Error adding lesson note:', error);
            alert('Error adding note');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Update Lesson Note
    const handleUpdateLessonNote = async (noteId: number) => {
        if (!editingLessonNoteContent.trim()) return;
        
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(`/student/lesson-notes/${noteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ content: editingLessonNoteContent })
            });
            
            const result = await response.json();
            
            if (result.success && selectedLessonId) {
                const formattedNote = {
                    id: result.data.id,
                    content: result.data.content,
                    createdAt: new Date(result.data.created_at).toLocaleString(),
                    updatedAt: new Date(result.data.updated_at).toLocaleString()
                };
                setLessonNotes(prev => ({
                    ...prev,
                    [selectedLessonId]: (prev[selectedLessonId] || []).map(n => n.id === noteId ? formattedNote : n)
                }));
                setEditingLessonNoteId(null);
                setEditingLessonNoteContent('');
                alert('Note updated successfully!');
            }
        } catch (error) {
            console.error('Error updating lesson note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Lesson Note
    const handleDeleteLessonNote = async (noteId: number) => {
        if (!confirm('Are you sure?')) return;
        
        setIsSubmitting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(`/student/lesson-notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                }
            });
            
            const result = await response.json();
            
            if (result.success && selectedLessonId) {
                setLessonNotes(prev => ({
                    ...prev,
                    [selectedLessonId]: (prev[selectedLessonId] || []).filter(n => n.id !== noteId)
                }));
                alert('Note deleted successfully!');
            }
        } catch (error) {
            console.error('Error deleting lesson note:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Create Discussion
    const handleCreateDiscussion = async () => {
        if (!newDiscussionContent.trim() || !selectedDiscussionLessonId) {
            alert('Please select a lesson and write a discussion note');
            return;
        }

        setIsPostingDiscussion(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            
            const response = await fetch(`/student/lesson/${selectedDiscussionLessonId}/discussion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ content: newDiscussionContent })
            });
            
            if (response.ok) {
                alert('Discussion posted successfully!');
                setNewDiscussionContent('');
                setSelectedDiscussionLessonId(null);
                // Optionally reload discussions here by calling a refresh function
            } else {
                const result = await response.json();
                alert('Error: ' + (result.message || 'Failed to post discussion'));
            }
        } catch (error) {
            console.error('Error creating discussion:', error);
            alert('Error posting discussion: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsPostingDiscussion(false);
        }
    };

    // Process leaderboard data
    const rawLeaderboard = data?.leaderboard || [];
    // If empty (e.g. fresh db), add current user placeholder if logged in
    const displayLeaderboard = rawLeaderboard.length > 0 ? rawLeaderboard.map((item, index) => ({
        rank: index + 1,
        name: item.id === user?.id ? "You" : item.name,
        points: item.points,
        avatar: item.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
        isCurrentUser: item.id === user?.id,
    })) : [
        { rank: 1, name: "You", points: data?.currentUserPoints || 0, avatar: user?.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "ME", isCurrentUser: true }
    ];

    const stats = [
        { label: "Courses Enrolled", value: data?.stats?.ongoingCourses?.toString() || "0", icon: <BookOpen className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
        { label: "Courses Completed", value: data?.stats?.completedCourses?.toString() || "0", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
        { label: "Learning Streak", value: data?.stats?.learningStreak?.toString() || "0 days", icon: <TrendingUp className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" },
        { label: "Certificates Earned", value: data?.stats?.certificatesEarned?.toString() || "0", icon: <Award className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" }
    ];

    const handleFetchLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude: lat, longitude: lon } = position.coords;
                    setLatitude(lat);
                    setLongitude(lon);
                    
                    // Using OpenStreetMap Nominatim API for reverse geocoding
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        // Set the exact, fully detailed physical location
                        setLocation(data.display_name || 'Exact location not found');
                    } else {
                        alert('Could not pinpoint exact location details.');
                    }
                } catch (error) {
                    console.error('Error fetching location details:', error);
                    alert('Error determining location address.');
                } finally {
                    setIsFetchingLocation(false);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to retrieve your location. Please check browser permissions.');
                setIsFetchingLocation(false);
            }
        );
    };

    const handleUpdateLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingLocation(true);
        let finalLat = latitude;
        let finalLon = longitude;

        try {
            if ((!latitude || !longitude) && location.trim().length > 0) {
                // Generate fallback queries to guarantee at least a city/region match
                const searchQueries = [location];
                
                if (location.includes(',')) {
                    const parts = location.split(',').map(p => p.trim());
                    if (parts.length > 1) searchQueries.push(parts.slice(1).join(', ')); // Drop first chunk
                    if (parts.length > 2) searchQueries.push(parts.slice(-2).join(', ')); // Just last 2 chunks
                    searchQueries.push(parts[parts.length - 1]); // Just the last chunk
                } else {
                    const words = location.split(/\s+/);
                    if (words.length > 3) {
                        searchQueries.push(words.slice(-2).join(' ')); // Try last 2 words
                        searchQueries.push(words[words.length - 1]); // Try last word
                    }
                }

                // Exhaust queries until a coordinate is found
                for (const query of searchQueries) {
                    try {
                        const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
                        const geoData = await geoResp.json();
                        if (geoData && geoData.length > 0) {
                            finalLat = parseFloat(geoData[0].lat);
                            finalLon = parseFloat(geoData[0].lon);
                            break; // Stop at first valid resolution!
                        }
                    } catch (e) {
                        console.error('Geocoding retry failed for', query);
                    }
                }
            }

            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch('/student/profile/location', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ location, latitude: finalLat, longitude: finalLon, share_email: shareEmail })
            });
            const result = await response.json();
            if (response.ok) {
                alert('Location updated successfully! Refreshing to synchronize your study buddies...');
                window.location.reload();
            } else {
                alert('Error: ' + (result.message || 'Failed to update location'));
                setIsUpdatingLocation(false);
            }
        } catch (error) {
            console.error('Error updating location:', error);
            alert('Error updating location');
            setIsUpdatingLocation(false);
        }
    };

    const userName = user?.name || 'Student';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dashboard Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-900">Welcome back, {userName}! 👋</h1>
                            <p className="text-sm sm:text-base text-gray-600">Let's continue your learning journey</p>
                        </div>
                        <button
                            onClick={() => onNavigate?.('courses')}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <BookOpen className="w-5 h-5" />
                            Browse Courses
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className={`${stat.color} rounded-lg p-2 w-fit mb-3`}>
                                    {stat.icon}
                                </div>
                                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Continue Learning */}
                        <section>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold">Continue Learning</h2>
                                <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium text-sm sm:text-base">
                                    View All
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {enrolledCourses.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 mb-2">You haven't enrolled in any courses yet.</p>
                                        <button onClick={() => onNavigate?.('courses')} className="text-blue-600 font-medium hover:underline">
                                            Browse Courses →
                                        </button>
                                    </div>
                                ) : (
                                    enrolledCourses.map((course) => (
                                        <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            <div className="flex flex-col sm:flex-row gap-4 p-5">
                                                <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                                    <ImageWithFallback
                                                        src={course.image}
                                                        alt={course.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                                        <div className="bg-white rounded-full p-3">
                                                            <Play className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                        <div>
                                                            <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                                                            <p className="text-gray-600 text-sm">by {course.instructor}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-2xl font-bold text-blue-600">{course.progress}%</div>
                                                            <div className="text-xs text-gray-500">Complete</div>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="mb-3">
                                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-600 rounded-full transition-all"
                                                                style={{ width: `${course.progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                                                        <div className="flex items-center gap-1">
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{course.lastAccessed}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-3">
                                                        <a
                                                            href={course.continueUrl || `/student/continue/${course.id}`}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                            Continue Learning
                                                        </a>
                                                        {course.nextQuiz && (
                                                            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                                                Take Quiz
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Completed Courses */}
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Completed Courses</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {completedCourses.map((course) => (
                                    <div key={course.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                                                <p className="text-gray-600 text-sm mb-2">by {course.instructor}</p>
                                                <p className="text-xs text-gray-500">Completed on {course.completedDate}</p>
                                            </div>
                                            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < course.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {course.certificate && (
                                            <button className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                                <Award className="w-4 h-4" />
                                                View Certificate
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Private Notes */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Private Notes</h2>
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>

                            {/* Add Note Form */}
                            <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
                                <div className="mb-4">
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Write your private note here..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleAddNote}
                                        disabled={!newNote.trim() || isSubmitting}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {isSubmitting ? 'Adding...' : 'Add Note'}
                                    </button>
                                </div>
                            </div>

                            {/* Notes List */}
                            <div className="space-y-4">
                                {notes.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 mb-2">No private notes yet.</p>
                                        <p className="text-gray-400 text-sm">Create your first note to get started!</p>
                                    </div>
                                ) : (
                                    notes.map((note) => (
                                        <div key={note.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-100 hover:shadow-md transition-shadow">
                                            {editingNoteId === note.id ? (
                                                // Edit Mode
                                                <div>
                                                    <textarea
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
                                                        rows={3}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingNoteId(null);
                                                                setEditingContent('');
                                                            }}
                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateNote(note.id)}
                                                            disabled={!editingContent.trim() || isSubmitting}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                        >
                                                            {isSubmitting ? 'Saving...' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode
                                                <div>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <p className="text-gray-800 mb-2 whitespace-pre-wrap break-words">{note.content}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-gray-500">
                                                            Created: {note.createdAt}
                                                            {note.updatedAt !== note.createdAt && (
                                                                <div>Updated: {note.updatedAt}</div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingNoteId(note.id);
                                                                    setEditingContent(note.content);
                                                                }}
                                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit note"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteNote(note.id)}
                                                                disabled={isSubmitting}
                                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Delete note"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Discussions */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Discussions</h2>
                                <MessageSquare className="w-5 h-5 text-blue-600" />
                            </div>

                            {/* Create Discussion Form */}
                            <div className="mb-6 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4">Start a New Discussion</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Lesson:</label>
                                        <select
                                            value={selectedDiscussionLessonId || ''}
                                            onChange={(e) => setSelectedDiscussionLessonId(e.target.value ? parseInt(e.target.value) : null)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Choose a lesson...</option>
                                            {enrolledLessions.map((lesson: any) => (
                                                <option key={lesson.id} value={lesson.id}>
                                                    {lesson.title} ({lesson.course_title})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Discussion Note:</label>
                                        <textarea
                                            value={newDiscussionContent}
                                            onChange={(e) => setNewDiscussionContent(e.target.value)}
                                            placeholder="Share your thoughts, questions, or insights about this lesson..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleCreateDiscussion}
                                            disabled={!newDiscussionContent.trim() || !selectedDiscussionLessonId || isPostingDiscussion}
                                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                            {isPostingDiscussion ? 'Posting...' : 'Post Discussion'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Discussion Filters */}
                            <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Filter className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-600">Filter by Lesson:</span>
                                </div>
                                <select
                                    value={selectedLessonFilter || ''}
                                    onChange={(e) => setSelectedLessonFilter(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Lessons</option>
                                    {enrolledLessions && enrolledLessions.length > 0 ? (
                                        enrolledLessions.map((lesson: any) => (
                                            <option key={lesson.id} value={lesson.id}>
                                                {lesson.title} ({lesson.course_title})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No lessons available</option>
                                    )}
                                </select>
                            </div>

                            {/* Discussions List */}
                            <div className="space-y-4">
                                {filteredDiscussions.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 mb-2">No discussions yet.</p>
                                        <p className="text-gray-400 text-sm">Start a discussion in a lesson!</p>
                                    </div>
                                ) : (
                                    filteredDiscussions.map((discussion: any) => (
                                        <div key={discussion.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="mb-3">
                                                <h3 className="font-semibold text-gray-900 mb-1">Lesson: {discussion.lesson_title}</h3>
                                                <p className="text-gray-700">{discussion.content}</p>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-4 text-gray-600">
                                                    <span><strong>{discussion.user_name}</strong></span>
                                                    <span>{discussion.created_at}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-gray-500">{discussion.replies_count} replies</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Lesson Notes */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Lesson Notesf</h2>
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>

                            {/* Select Lesson */}
                            <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Lesson:</label>
                                <select
                                    value={selectedLessonId || ''}
                                    onChange={(e) => {
                                        const lessonId = e.target.value ? parseInt(e.target.value) : null;
                                        if (lessonId) handleLoadLessonNotes(lessonId);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a lesson...</option>
                                    {enrolledLessions.map((lesson: any) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {lesson.title} ({lesson.course_title})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Lesson Notes Content */}
                            {selectedLessonId && (
                                <div className="space-y-4">
                                    {/* Add Lesson Note Form */}
                                    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                        <div className="mb-4">
                                            <textarea
                                                value={newLessonNote}
                                                onChange={(e) => setNewLessonNote(e.target.value)}
                                                placeholder="Add a note for this lesson..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleAddLessonNote}
                                                disabled={!newLessonNote.trim() || isSubmitting}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {isSubmitting ? 'Adding...' : 'Add Note'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lesson Notes List */}
                                    {(lessonNotes[selectedLessonId] || []).length === 0 ? (
                                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 mb-2">No notes for this lesson yet.</p>
                                            <p className="text-gray-400 text-sm">Create a note to get started!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {(lessonNotes[selectedLessonId] || []).map((note) => (
                                                <div key={note.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                                    {editingLessonNoteId === note.id ? (
                                                        // Edit Mode
                                                        <div>
                                                            <textarea
                                                                value={editingLessonNoteContent}
                                                                onChange={(e) => setEditingLessonNoteContent(e.target.value)}
                                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
                                                                rows={3}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingLessonNoteId(null);
                                                                        setEditingLessonNoteContent('');
                                                                    }}
                                                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateLessonNote(note.id)}
                                                                    disabled={!editingLessonNoteContent.trim() || isSubmitting}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        // View Mode
                                                        <div>
                                                            <p className="text-gray-800 mb-3 whitespace-pre-wrap break-words">{note.content}</p>
                                                            <div className="flex items-center justify-between">
                                                                <div className="text-xs text-gray-500">
                                                                    Created: {note.createdAt}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingLessonNoteId(note.id);
                                                                            setEditingLessonNoteContent(note.content);
                                                                        }}
                                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteLessonNote(note.id)}
                                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        {/* Notifications */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Notifications</h3>
                                <div className="relative">
                                    <Bell className="w-5 h-5 text-gray-400" />
                                    {notifications.filter(n => n.unread).length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {notifications.filter(n => n.unread).length}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border ${notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <p className="text-sm mb-1">{notification.message}</p>
                                        <p className="text-xs text-gray-500">{notification.time}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                View All Notifications
                            </button>
                        </section>

                        {/* Leaderboard */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                <h3 className="text-lg font-semibold">Leaderboard</h3>
                            </div>
                            <div className="space-y-3">
                                {displayLeaderboard.map((user) => (
                                    <div
                                        key={user.rank}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${user.isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                                            user.rank === 2 ? 'bg-gray-400 text-white' :
                                                user.rank === 3 ? 'bg-orange-600 text-white' :
                                                    'bg-gray-300 text-gray-700'
                                            }`}>
                                            {user.rank}
                                        </div>
                                        <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-medium">
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.points} pts</div>
                                        </div>
                                        {user.isCurrentUser && (
                                            <TrendingUp className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <a href="/student/certificates" className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-lg text-left flex items-center gap-3 transition-colors border border-blue-200">
                                    <Award className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-700">My Certificates</span>
                                </a>
                            </div>
                        </section>

                        {/* Location Settings */}
                        <section className="bg-white rounded-xl shadow-sm p-5">
                            <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                            <form onSubmit={handleUpdateLocation} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="e.g. Dhaka, Bangladesh"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleFetchLocation}
                                            disabled={isFetchingLocation}
                                            title="Auto-detect location"
                                            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 flex items-center justify-center shrink-0 disabled:opacity-50"
                                        >
                                            <MapPin className={`w-5 h-5 ${isFetchingLocation ? 'animate-pulse text-blue-500' : ''}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="shareEmail"
                                            checked={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="shareEmail" className="text-sm text-gray-600 cursor-pointer select-none">
                                            Allow nearby Study Buddies to email me
                                        </label>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdatingLocation}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                                >
                                    {isUpdatingLocation ? 'Updating...' : 'Update Location'}
                                </button>
                            </form>
                        </section>

                        {/* Nearby Students / Study Buddies */}
                        <section className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5 text-green-600" />
                                <h3 className="text-base sm:text-lg font-semibold">Nearby Study Buddies</h3>
                            </div>
                            
                            {!latitude || !longitude ? (
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="mt-3 w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Find Again
                                    </button>
                                </div>
                            ) : nearbyStudents.length === 0 ? (
                                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    No students found within a 5km radius.
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="mt-3 w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors border border-blue-200 flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        <MapPin className="w-4 h-4" />
                                        Find Again
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {nearbyStudents.map(student_badge => {
                                        // Student needs distance <= 5km to be contactable
                                        const routeDist = parseFloat(student_badge.route_distance || student_badge.straight_distance || "999");
                                        const isContactable = routeDist <= 5.0;

                                        return (
                                            <div key={student_badge.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col gap-3">
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{student_badge.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {student_badge.location} <br />
                                                            <span className="font-medium text-gray-700">
                                                                {student_badge.route_distance ? `🛣️ Route: ${student_badge.route_distance}km` : `📏 Straight Line: ${student_badge.straight_distance}km`}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => setSelectedMapStudentId(selectedMapStudentId === student_badge.id ? null : student_badge.id)}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-sm font-medium transition-colors border border-blue-200 flex items-center justify-center gap-1 shadow-sm"
                                                        >
                                                            <Map className="w-4 h-4" /> 
                                                            {selectedMapStudentId === student_badge.id ? 'Close Map' : 'View Path'}
                                                        </button>

                                                        {calculatingRoutes && !student_badge.route_distance ? (
                                                            <span className="text-xs text-gray-400 animate-pulse px-3 py-1.5 flex items-center">Calculating...</span>
                                                        ) : isContactable ? (
                                                            student_badge.email ? (
                                                                <button 
                                                                    onClick={() => setContactModalStudent(student_badge)}
                                                                    className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition-colors border border-green-300 shadow-sm inline-flex items-center gap-1.5"
                                                                >
                                                                    👋 Contact
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    disabled
                                                                    title="This student chose to keep their email private."
                                                                    className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded text-sm font-medium border border-gray-200 shadow-sm cursor-not-allowed"
                                                                >
                                                                    🔒 Private
                                                                </button>
                                                            )
                                                        ) : (
                                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1.5 flex items-center rounded border border-gray-200">
                                                                &gt; 5km away
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Leaflet Map Expansion */}
                                                {selectedMapStudentId === student_badge.id && (
                                                    <div className="mt-2 w-full pt-3 border-t border-gray-200">
                                                        <div id={`leaflet-map-${student_badge.id}`} className="w-full h-48 rounded-lg border border-gray-300 relative z-0 shadow-inner"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {/* Contact Modal */}
            {contactModalStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Contact Study Buddy</h2>
                            <button 
                                onClick={() => setContactModalStudent(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold border-2 border-blue-200">
                                    {contactModalStudent.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{contactModalStudent.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {contactModalStudent.straight_distance}km away
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 group hover:border-gray-300 transition-colors">
                                <div className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Email Address</div>
                                <div className="text-gray-900 font-medium break-all selection:bg-blue-100 text-lg">
                                    {contactModalStudent.email}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a 
                                    href={`mailto:${contactModalStudent.email}`}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Open Email App
                                </a>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(contactModalStudent.email);
                                        alert('Email copied to clipboard!');
                                    }}
                                    className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm hover:shadow"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
