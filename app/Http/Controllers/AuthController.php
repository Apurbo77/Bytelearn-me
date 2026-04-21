<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Show registration form
     */
    public function showRegister()
    {
        return view('auth.register');
    }

    /**
     * Handle user registration
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:student,instructor',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->route('login')
                       ->with('success', 'Welcome to ByteLearn! Your account has been created. Please login.');
    }

    /**
     * Show login form
     */
    public function showLogin()
    {
        return view('auth.login');
    }

    /**
     * Handle user login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        \Log::info('Login attempt', ['email' => $credentials['email']]);

        if (!Auth::attempt($credentials)) {
            \Log::warning('Login failed', ['email' => $credentials['email']]);
            return back()->withErrors([
                'email' => 'Invalid email or password.',
            ])->withInput();
        }

        \Log::info('Auth::attempt succeeded');

        $request->session()->regenerate();
        
        \Log::info('Session regenerated');

        $user = Auth::user();

        \Log::info('User authenticated', ['user_id' => $user->id, 'role' => $user->role]);

        // ✅ ROLE-BASED REDIRECT
        if ($user->role === 'student') {
            \Log::info('Redirecting student to dashboard');
            return redirect()->route('student.dashboard');
        }

        if ($user->role === 'instructor') {
            \Log::info('Redirecting instructor to dashboard');
            return redirect()->route('instructor.dashboard');
        }

        // fallback (optional)
        Auth::logout();
        return redirect('/login')->withErrors(['role' => 'Unauthorized role']);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        Auth::logout();

        // Ensure the session is fully cleared to prevent stale auth state.
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Logged out successfully!');
    }
}
