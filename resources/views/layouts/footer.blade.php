<footer class="footer">
    <div class="footer-container">
        <div class="footer-section">
            <h3>ByteLearn</h3>
            <p>A peer-led micro learning platform for interactive education.</p>
        </div>

        <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
                <li><a href="{{ route('courses.index') }}">Browse Courses</a></li>
                <li><a href="{{ route('home') }}">Home</a></li>
            </ul>
        </div>

        <div class="footer-section">
            <h4>Account</h4>
            <ul>
                @auth
                    <li><a href="#">Profile</a></li>
                    <li><a href="#">Settings</a></li>
                @else
                    <li><a href="{{ route('login') }}">Login</a></li>
                    <li><a href="{{ route('register') }}">Register</a></li>
                @endauth
            </ul>
        </div>
    </div>

    <div class="footer-bottom">
        <p>&copy; 2024 ByteLearn. All rights reserved.</p>
    </div>
</footer>
