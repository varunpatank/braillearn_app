import React, { useEffect } from 'react';
import BrailleCell from './BrailleCell';
import { BrailleCell as BrailleCellType } from '../../types/types';
import { useAppContext } from '../../context/AppContext';

interface BrailleWordProps {
  cells: BrailleCellType[];
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onCellUpdate?: (index: number, updatedCell: BrailleCellType) => void;
  showText?: boolean;
  word?: string;
  triggerSolenoids?: boolean;
}

const BrailleWord: React.FC<BrailleWordProps> = ({
  cells,
  size = 'md',
  interactive = false,
  onCellUpdate,
  showText = true,
  word,
  triggerSolenoids = true
}) => {
  const { isArduinoConnected, sendBraillePattern } = useAppContext();

  const handleDotToggle = (cellIndex: number, dotNumber: number) => {
    if (interactive && onCellUpdate) {
      const cell = cells[cellIndex];
      const updatedDots = cell.dots.includes(dotNumber)
        ? cell.dots.filter(d => d !== dotNumber)
        : [...cell.dots, dotNumber];
      
      const updatedCell: BrailleCellType = {
        ...cell,
        dots: updatedDots
      };
      
      onCellUpdate(cellIndex, updatedCell);
    }
  };

  // Send the first cell's pattern to Arduino when word changes
  useEffect(() => {
    // Only send to Arduino during lessons and speech-to-braille
    const currentPath = window.location.pathname;
    const isLessonPage = currentPath.includes('/learn/');
    const isSpeechToBraille = currentPath.includes('/speech-to-braille');
    
    if (isArduinoConnected && triggerSolenoids && cells.length > 0 && (isLessonPage || isSpeechToBraille)) {
      // For words, send the first character's pattern to the Arduino
      // This allows users to feel the first letter of each word
      const firstCell = cells[0];
      if (firstCell?.dots) {
        console.log('Sending first letter of word to Arduino:', firstCell.dots, 'for word:', word);
        sendBraillePattern(firstCell.dots);
      }
    } else if (cells.length > 0 && triggerSolenoids) {
      console.log('Arduino not triggered - only active during lessons and speech-to-braille');
    }
  }, [cells, isArduinoConnected, triggerSolenoids, sendBraillePattern, word]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-4">
        {cells.map((cell, index) => (
          <BrailleCell
            key={index}
            cell={cell}
            size={size}
            interactive={interactive}
            onDotToggle={(dotNumber) => handleDotToggle(index, dotNumber)}
            showText={false}
            animateIn={true}
            triggerSolenoids={index === 0 && triggerSolenoids} // Only first cell triggers solenoids
          />
        ))}
      </div>
      
      {showText && word && (
        <div className="mt-4 text-center">
          <p className="text-xl font-semibold">{word}</p>
          <p className="text-sm text-gray-500">
            {cells.length} {cells.length === 1 ? 'cell' : 'cells'}
          </p>
          {isArduinoConnected && cells.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Feeling: {cells[0].char || 'First letter'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BrailleWord;