import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'emblem' | 'full';
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-11 md:h-12 w-auto',
  variant = 'light',
  alt = 'DSP DIGITAL MART - Your Smart Partner in the Digital World',
}) => {
  const src =
    variant === 'emblem'
      ? '/emblem.png'
      : variant === 'dark'
      ? '/logo-dark.png'
      : '/logo.png';

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`object-contain select-none transition-opacity hover:opacity-95 ${className}`}
      onError={(e) => {
        // Fallback gracefully to logo.png
        if ((e.target as HTMLImageElement).src !== '/logo.png') {
          (e.target as HTMLImageElement).src = '/logo.png';
        }
      }}
    />
  );
};

