import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', color = 'primary' }) => {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }[size];

  return (
    <div className={`${sizeClass} relative`}>
      <div className="absolute grid grid-cols-2 grid-rows-3 gap-1 w-full h-full p-1">
        <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm"></div>
        <div className="rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm"></div>
        <div className="rounded-full bg-gradient-to-br from-blue-400 to-blue-500 opacity-70 shadow-sm"></div>
        <div className="rounded-full bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm"></div>
        <div className="rounded-full bg-gradient-to-br from-blue-700 to-blue-800 shadow-sm"></div>
        <div className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-70 shadow-sm"></div>
      </div>
    </div>
  );
};

export default Logo;