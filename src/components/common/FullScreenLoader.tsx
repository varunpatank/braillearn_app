import React from 'react';
import Logo from './Logo';

const FullScreenLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="braille-loader scale-150">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="mt-8 text-lg text-gray-600 animate-pulse">
        Loading BrailleLearn...
      </p>
    </div>
  );
};

export default FullScreenLoader;