import React, { useState } from 'react';
import { BrailleCell } from '../../types/types';

interface BrailleKeyboardProps {
  onCellCreated?: (cell: BrailleCell) => void;
  showLetterHints?: boolean;
}

const BrailleKeyboard: React.FC<BrailleKeyboardProps> = ({
  onCellCreated,
  showLetterHints = true
}) => {
  const [activeDots, setActiveDots] = useState<number[]>([]);
  
  // Common braille patterns with corresponding characters
  const commonPatterns: Record<string, number[]> = {
    'a': [1],
    'b': [1, 2],
    'c': [1, 4],
    'd': [1, 4, 5],
    'e': [1, 5],
    'f': [1, 2, 4],
    'g': [1, 2, 4, 5],
    'h': [1, 2, 5],
    'i': [2, 4],
    'j': [2, 4, 5]
  };

  const toggleDot = (dotNumber: number) => {
    setActiveDots(prev => {
      if (prev.includes(dotNumber)) {
        return prev.filter(d => d !== dotNumber);
      } else {
        return [...prev, dotNumber].sort((a, b) => a - b);
      }
    });
  };

  const clearDots = () => {
    setActiveDots([]);
  };

  const createCell = () => {
    if (onCellCreated) {
      // Determine the character based on the pattern
      let char = '';
      for (const [letter, pattern] of Object.entries(commonPatterns)) {
        if (arraysEqual(pattern, activeDots)) {
          char = letter;
          break;
        }
      }

      onCellCreated({
        dots: [...activeDots],
        char,
        description: char ? `Letter ${char.toUpperCase()}` : 'Custom pattern'
      });
      
      // Optionally clear after creating
      clearDots();
    }
  };

  // Helper function to compare arrays
  const arraysEqual = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  // Find matching character for the current pattern
  const currentChar = Object.entries(commonPatterns).find(
    ([_, pattern]) => arraysEqual(pattern, activeDots)
  )?.[0] || '';

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Braille Keyboard
      </h3>
      
      <div className="flex flex-col items-center mb-6">
        {/* Current Cell Preview */}
        <div className="w-20 h-32 bg-gray-50 border border-gray-200 rounded-lg mb-4 relative">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-2 p-3">
            {[1, 4, 2, 5, 3, 6].map((dotNumber, index) => (
              <div
                key={dotNumber}
                className={`rounded-full ${
                  activeDots.includes(dotNumber) ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>
        
        {showLetterHints && (
          <div className="text-center mb-4">
            {currentChar ? (
              <span className="text-2xl font-bold text-blue-600">{currentChar.toUpperCase()}</span>
            ) : (
              activeDots.length > 0 ? (
                <span className="text-sm text-gray-500">Custom pattern</span>
              ) : (
                <span className="text-sm text-gray-500">Select dots to form a character</span>
              )
            )}
          </div>
        )}
      </div>
      
      {/* Dot Input Buttons */}
      <div className="grid grid-cols-2 grid-rows-3 gap-4 w-40 h-60 mx-auto mb-6">
        {[1, 4, 2, 5, 3, 6].map((dotNumber) => (
          <button
            key={dotNumber}
            className={`rounded-full ${
              activeDots.includes(dotNumber)
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } font-medium text-lg transition-colors`}
            onClick={() => toggleDot(dotNumber)}
            aria-label={`Dot ${dotNumber} ${activeDots.includes(dotNumber) ? 'active' : 'inactive'}`}
          >
            {dotNumber}
          </button>
        ))}
      </div>
      
      <div className="flex justify-center space-x-3">
        <button
          onClick={clearDots}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={createCell}
          className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700"
          disabled={activeDots.length === 0}
        >
          Create Cell
        </button>
      </div>
      
      {showLetterHints && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Common Patterns</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(commonPatterns).map(([char, pattern]) => (
              <button
                key={char}
                className="px-3 py-1 text-sm border border-gray-200 rounded-md hover:bg-gray-50"
                onClick={() => setActiveDots([...pattern])}
              >
                {char.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrailleKeyboard;