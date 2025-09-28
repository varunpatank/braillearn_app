import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', color = 'primary' }) => {
  // Determine size class
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }[size];

  // Determine color class
  const colorClass = {
    primary: 'text-blue-600',
    white: 'text-white',
    gray: 'text-gray-700'
  }[color as 'primary' | 'white' | 'gray'] || 'text-blue-600';

  return (
    <div className={`${sizeClass} ${colorClass} relative`}>
      {/* This is a simple braille-inspired logo */}
      <div className="absolute grid grid-cols-2 grid-rows-3 gap-1 w-full h-full p-1">
        {/* Dot 1 (top left) */}
        <div className="rounded-full bg-current"></div>
        {/* Dot 2 (top right) */}
        <div className="rounded-full bg-current"></div>
        {/* Dot 3 (middle left) */}
        <div className="rounded-full bg-current opacity-50"></div>
        {/* Dot 4 (middle right) */}
        <div className="rounded-full bg-current"></div>
        {/* Dot 5 (bottom left) */}
        <div className="rounded-full bg-current"></div>
        {/* Dot 6 (bottom right) */}
        <div className="rounded-full bg-current opacity-50"></div>
      </div>
    </div>
  );
};

export default Logo;