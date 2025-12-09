'use client';

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
  fallbackSrc = '/images/placeholder.jpg'
}: ImageWithFallbackProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
