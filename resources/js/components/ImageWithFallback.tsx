import { useState } from 'react';

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export function ImageWithFallback({
    src,
    alt,
    className = '',
    fallbackSrc = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
}: ImageWithFallbackProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    return (
        <img
            src={imgSrc}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}
