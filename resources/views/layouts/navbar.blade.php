<nav class="navbar">
    <div class="navbar-container">
        <div class="navbar-brand">
            <a href="{{ route('home') }}" class="logo">ByteLearn</a>
        </div>

        <div class="navbar-menu">
            <a href="{{ route('courses.index') }}" class="nav-link">Courses</a>

            @auth
                @if (auth()->user()->role === 'student')
                    <a href="{{ route('student.dashboard') }}" class="nav-link">Dashboard</a>
                    <a href="{{ route('student.courses') }}" class="nav-link">My Courses</a>
                    
                    <!-- Notification Bell for Students -->
                    <button class="notification-bell" id="notificationBell" style="display: flex; align-items: center; gap: 0.5rem; position: relative;">
                        🔔
                        @php
                            try {
                                $unreadCount = auth()->user()->notifications()
                                                               ->whereNull('read_at')
                                                               ->count();
                            } catch (\Exception $e) {
                                $unreadCount = 0;
                            }
                        @endphp
                        @if ($unreadCount > 0)
                            <span class="notification-badge">{{ $unreadCount > 9 ? '9+' : $unreadCount }}</span>
                        @endif
                    </button>
                @elseif (auth()->user()->role === 'instructor')
                    <a href="{{ route('instructor.dashboard') }}" class="nav-link">Dashboard</a>
                    <a href="{{ route('instructor.courses') }}" class="nav-link">My Courses</a>
                @endif

                <div class="nav-user">
                    <span class="user-name">{{ auth()->user()->name }}</span>
                    <form action="{{ route('logout') }}" method="POST" style="display:inline;">
                        @csrf
                        <button type="submit" class="btn btn-secondary">Logout</button>
                    </form>
                </div>
            @else
                <a href="{{ route('login') }}" class="btn btn-primary">Login</a>
                <a href="{{ route('register') }}" class="btn btn-secondary">Register</a>
            @endauth
        </div>
    </div>
</nav>
