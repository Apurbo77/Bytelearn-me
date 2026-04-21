export function ByteLearnLogo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer circle with gradient */}
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                </linearGradient>
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                </linearGradient>
            </defs>

            {/* Background circle */}
            <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

            {/* Book/Pages representation */}
            <path
                d="M 30 35 L 30 70 L 50 65 L 70 70 L 70 35 L 50 40 Z"
                fill="white"
                opacity="0.95"
            />

            {/* Center spine */}
            <line
                x1="50"
                y1="40"
                x2="50"
                y2="65"
                stroke="url(#accentGradient)"
                strokeWidth="2"
            />

            {/* Binary/Tech dots - left side */}
            <circle cx="38" cy="45" r="2" fill="url(#accentGradient)" />
            <circle cx="38" cy="52" r="2" fill="url(#accentGradient)" />
            <circle cx="42" cy="48.5" r="1.5" fill="url(#accentGradient)" opacity="0.6" />

            {/* Binary/Tech dots - right side */}
            <circle cx="62" cy="45" r="2" fill="url(#accentGradient)" />
            <circle cx="62" cy="52" r="2" fill="url(#accentGradient)" />
            <circle cx="58" cy="48.5" r="1.5" fill="url(#accentGradient)" opacity="0.6" />

            {/* AI Sparkle accent */}
            <g transform="translate(65, 25)">
                <path
                    d="M 0 -5 L 1 -1 L 5 0 L 1 1 L 0 5 L -1 1 L -5 0 L -1 -1 Z"
                    fill="#fbbf24"
                />
            </g>

            {/* Page lines */}
            <line x1="35" y1="48" x2="45" y2="48" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
            <line x1="35" y1="54" x2="45" y2="54" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
            <line x1="55" y1="48" x2="65" y2="48" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
            <line x1="55" y1="54" x2="65" y2="54" stroke="url(#accentGradient)" strokeWidth="1" opacity="0.4" />
        </svg>
    );
}

export function ByteLearnLogoText({
    className = "text-xl",
    showTagline = false
}: {
    className?: string;
    showTagline?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <div className={`font-bold ${className}`}>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Byte
                </span>
                <span className="text-gray-900">Learn</span>
            </div>
            {showTagline && (
                <span className="text-xs text-gray-500 -mt-1">AI-Powered Learning</span>
            )}
        </div>
    );
}
