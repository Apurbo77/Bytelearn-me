import React, { useState } from 'react';
import { Button } from '../Button';

export const LoginForm = ({ initialError = '' }: { initialError?: string }) => {
    const [error, setError] = useState(initialError);
    const [loading, setLoading] = useState(false);

    // Get CSRF token from meta tag
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Sign in to ByteLearn</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">create a new account</a>
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Use standard form POST - Laravel will handle role-based redirect */}
                <form className="mt-8 space-y-6" method="POST" action="/login">
                    <input type="hidden" name="_token" value={csrfToken} />

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <Button type="submit" className="w-full flex justify-center">
                            Sign in
                        </Button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <a href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">← Back to Home</a>
                </div>
            </div>
        </div>
    );
};

