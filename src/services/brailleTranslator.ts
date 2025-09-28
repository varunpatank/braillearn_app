import { BrailleCell } from '../types/types';
import { braillePatterns } from '../data/lessons';

// Numbers require a number prefix
const numberPrefix = [3, 4, 5, 6]; // Number sign

// Punctuation patterns (matching Arduino experiment)
const braillePunctuation: Record<string, number[]> = {
  '.': [2, 5, 6],
  ',': [2],
  '?': [2, 3, 6],
  '!': [2, 3, 5],
  "'": [3],
  '"': [2, 3, 5, 6],
  ':': [2, 5],
  ';': [2, 3],
  '-': [3, 6],
  '(': [2, 3, 6],
  ')': [3, 5, 6]
};

// Capital letter prefix
const capitalPrefix = [6];

/**
 * Translates text to braille cells using the same patterns as Arduino experiment
 */
export async function translateTextToBraille(text: string): Promise<BrailleCell[][]> {
  // Normalize the text (trim)
  const normalizedText = text.trim();
  
  // Split the text into words
  const words = normalizedText.split(/\s+/);
  
  // Translate each word to braille
  const brailleWords: BrailleCell[][] = words.map(word => {
    const brailleCells: BrailleCell[] = [];
    
    // Process each character in the word
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const upperChar = char.toUpperCase();
      let dots: number[] = [];
      
      // Check if it's a capital letter
      if (char !== char.toLowerCase() && braillePatterns[upperChar]) {
        brailleCells.push({
          dots: capitalPrefix,
          char: 'CAP',
          description: 'Capital letter indicator'
        });
      }
      
      // Check if it's a number
      if (!isNaN(Number(char))) {
        // For the first number in a sequence, add the number sign
        if (i === 0 || isNaN(Number(word[i-1]))) {
          brailleCells.push({
            dots: numberPrefix,
            char: '#',
            description: 'Number sign'
          });
        }
        dots = braillePatterns[char] || [];
      }
      // Check if it's punctuation
      else if (braillePunctuation[char]) {
        dots = braillePunctuation[char];
      }
      // Check for contractions first
      else if (braillePatterns[upperChar] && upperChar.length > 1) {
        dots = braillePatterns[upperChar];
      }
      // Otherwise, assume it's a letter (using Arduino experiment patterns)
      else {
        dots = braillePatterns[upperChar] || [];
      }
      
      // Add the braille cell
      brailleCells.push({
        dots,
        char: char,
        description: `${char === char.toUpperCase() && char !== char.toLowerCase() ? 'Capital ' : ''}${getCharacterDescription(char)}`
      });
    }
    
    return brailleCells;
  });
  
  // Add a small delay to simulate processing time
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('Translated text to braille (Arduino format):', {
    originalText: text,
    words: words,
    brailleWords: brailleWords.map(word => 
      word.map(cell => ({ char: cell.char, dots: cell.dots }))
    )
  });
  
  return brailleWords;
}

/**
 * Get description for a character
 */
function getCharacterDescription(char: string): string {
  if (!isNaN(Number(char))) {
    return `Number ${char}`;
  } else if (braillePunctuation[char]) {
    const punctuationNames: Record<string, string> = {
      '.': 'Period',
      ',': 'Comma',
      '?': 'Question mark',
      '!': 'Exclamation point',
      "'": 'Apostrophe',
      '"': 'Quotation mark',
      ':': 'Colon',
      ';': 'Semicolon',
      '-': 'Hyphen',
      '(': 'Left parenthesis',
      ')': 'Right parenthesis'
    };
    return punctuationNames[char] || 'Punctuation';
  } else {
    return `Letter ${char.toUpperCase()}`;
  }
}

/**
 * Translates braille cells back to text
 */
export function translateBrailleToText(brailleCells: BrailleCell[][]): string {
  let result = '';
  
  // Process each word
  brailleCells.forEach((word, wordIndex) => {
    // Add spaces between words
    if (wordIndex > 0) {
      result += ' ';
    }
    
    // Process each cell in the word
    word.forEach(cell => {
      if (cell.char && cell.char !== 'CAP' && cell.char !== '#') {
        result += cell.char;
      }
    });
  });
  
  return result;
}

/**
 * Exports braille cells to a printable format
 */
export function exportToPrintableFormat(brailleCells: BrailleCell[][], options: any): string {
  // This would generate a printable format (e.g., PDF, BRF)
  console.log('Exporting to printable format:', brailleCells, options);
  return 'Generated file content';
}

/**
 * Load braille database
 */
export async function loadBrailleDatabase(): Promise<boolean> {
  // In a real app, this would load a comprehensive braille database
  // For this implementation, we're using the static pattern objects
  
  // Simulate loading time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
}

/**
 * Get braille pattern for a character (using Arduino experiment patterns)
 */
export function getBraillePattern(char: string): number[] {
  const upperChar = char.toUpperCase();
  return braillePatterns[upperChar] || braillePunctuation[char] || [];
}

/**
 * Validate if text can be converted to braille
 */
export function validateBrailleText(text: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const char of text) {
    const upperChar = char.toUpperCase();
    if (char !== ' ' && !braillePatterns[upperChar] && !braillePunctuation[char] && isNaN(Number(char))) {
      errors.push(`Character "${char}" is not supported in braille`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Convert braille pattern to Arduino format (for serial communication)
 */
export function convertToArduinoFormat(dots: number[]): string {
  // Convert array of dot numbers to comma-separated string
  return dots.join(',');
}

/**
 * Send braille pattern to Arduino via serial (if connected)
 */
export function sendToArduino(char: string): void {
  const pattern = getBraillePattern(char);
  const arduinoFormat = convertToArduinoFormat(pattern);
  
  console.log(`Arduino command: char:${char.toLowerCase()}`);
  console.log(`Arduino dots: ${arduinoFormat}`);
  
  // In a real implementation, this would send via serial port
  // For now, we just log the commands that would be sent
}