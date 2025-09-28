import React, { useEffect, useRef } from 'react';
import { BrailleCell as BrailleCellType } from '../../types/types';
import { useAppContext } from '../../context/AppContext';

interface BrailleCellProps {
  cell: BrailleCellType;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onDotToggle?: (dotNumber: number) => void;
  showText?: boolean;
  animateIn?: boolean;
  triggerSolenoids?: boolean;
}

const BrailleCell: React.FC<BrailleCellProps> = ({
  cell,
  size = 'md',
  interactive = false,
  onDotToggle,
  showText = true,
  animateIn = false,
  triggerSolenoids = true
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const { isArduinoConnected, sendBraillePattern } = useAppContext();

  // Determine size classes
  const containerClass = {
    sm: 'w-12 h-20',
    md: 'w-16 h-28',
    lg: 'w-24 h-40'
  }[size];

  const dotSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8'
  }[size];

  // Helper to check if a dot is raised
  const isDotRaised = (dotNumber: number) => {
    return cell?.dots ? cell.dots.includes(dotNumber) : false;
  };

  // Handle dot click for interactive cells
  const handleDotClick = (dotNumber: number) => {
    if (interactive && onDotToggle) {
      onDotToggle(dotNumber);
    }
  };

  // Send pattern to Arduino when cell changes
  useEffect(() => {
    // Only send to Arduino during lessons and speech-to-braille
    const currentPath = window.location.pathname;
    const isLessonPage = currentPath.includes('/learn/');
    const isSpeechToBraille = currentPath.includes('/speech-to-braille');
    
    if (isArduinoConnected && triggerSolenoids && cell?.dots && (isLessonPage || isSpeechToBraille)) {
      // Send the dots array directly - Arduino expects array of dot numbers (1-6)
      console.log('Sending braille pattern to Arduino:', cell.dots);
      sendBraillePattern(cell.dots);
    } else if (cell?.dots && triggerSolenoids) {
      console.log('Arduino not triggered - only active during lessons and speech-to-braille');
    }
  }, [cell?.dots, isArduinoConnected, triggerSolenoids, sendBraillePattern]);

  // Animate the cell when it appears
  useEffect(() => {
    if (animateIn && cellRef.current) {
      const dots = cellRef.current.querySelectorAll('.braille-dot');
      dots.forEach((dot, index) => {
        const dotElement = dot as HTMLElement;
        dotElement.style.opacity = '0';
        dotElement.style.transform = 'scale(0.5)';
      });

      dots.forEach((dot, index) => {
        const dotElement = dot as HTMLElement;
        setTimeout(() => {
          dotElement.style.transition = 'opacity 300ms ease, transform 300ms ease';
          dotElement.style.opacity = '1';
          dotElement.style.transform = 'scale(1)';
        }, 50 * index);
      });
    }
  }, [animateIn, cell?.dots]);

  return (
    <div className="flex flex-col items-center">
      <div ref={cellRef} className={`${containerClass} relative bg-white border border-gray-200 rounded-lg shadow-sm p-2 mb-1`}>
        <div className="grid grid-cols-2 grid-rows-3 h-full w-full gap-2">
          {/* Dot 1 (top left) */}
          <div
            className={`braille-dot ${dotSize} rounded-full ${isDotRaised(1) ? 'bg-blue-600' : 'bg-gray-200'} ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => handleDotClick(1)}
            aria-label={`Dot 1 ${isDotRaised(1) ? 'raised' : 'not raised'}`}
          ></div>
          
          {/* Dot 4 (top right) */}
          <div
            className={`braille-dot ${dotSize} rounded-full ${isDotRaised(4) ? 'bg-blue-600' : 'bg-gray-200'} ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => handleDotClick(4)}
            aria-label={`Dot 4 ${isDotRaised(4) ? 'raised' : 'not raised'}`}
          ></div>
          
          {/* Dot 2 (middle left) */}
          <div
            className={`braille-dot ${dotSize} rounded-full ${isDotRaised(2) ? 'bg-blue-600' : 'bg-gray-200'} ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => handleDotClick(2)}
            aria-label={`Dot 2 ${isDotRaised(2) ? 'raised' : 'not raised'}`}
          ></div>
          
          {/* Dot 5 (middle right) */}
          <div
            className={`braille-dot ${dotSize} rounded-full ${isDotRaised(5) ? 'bg-blue-600' : 'bg-gray-200'} ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => handleDotClick(5)}
            aria-label={`Dot 5 ${isDotRaised(5) ? 'raised' : 'not raised'}`}
          ></div>
          
          {/* Dot 3 (bottom left) */}
          <div
            className={`braille-dot ${dotSize} rounded-full ${isDotRaised(3) ? 'bg-blue-600' : 'bg-gray-200'} ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => handleDotClick(3)}
            aria-label={`Dot 3 ${isDotRaised(3) ? 'raised' : 'not raised'}`}
          ></div>
          
          {/* Dot 6 (bottom right) */}
          <div
            className={`braille-dot ${dotSize} rounded-full ${isDotRaised(6) ? 'bg-blue-600' : 'bg-gray-200'} ${interactive ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => handleDotClick(6)}
            aria-label={`Dot 6 ${isDotRaised(6) ? 'raised' : 'not raised'}`}
          ></div>
        </div>
      </div>
      
      {showText && cell?.char && (
        <div className="text-center mt-1">
          <span className="text-lg font-semibold">{cell.char}</span>
          {cell.description && (
            <p className="text-xs text-gray-500">{cell.description}</p>
          )}
          {isArduinoConnected && cell.dots.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Arduino: dots {cell.dots.join(',')}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrailleCell;