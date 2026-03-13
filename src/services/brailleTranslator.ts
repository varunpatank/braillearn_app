import { BrailleCell } from '../types/types';
import { braillePatterns } from '../data/lessons';

const numberPrefix = [3, 4, 5, 6];

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

const capitalPrefix = [6];

export async function translateTextToBraille(text: string): Promise<BrailleCell[][]> {
  const normalizedText = text.trim();
  
  const words = normalizedText.split(/\s+/);
  
  const brailleWords: BrailleCell[][] = words.map(word => {
    const brailleCells: BrailleCell[] = [];
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const upperChar = char.toUpperCase();
      let dots: number[] = [];
      
      if (char !== char.toLowerCase() && braillePatterns[upperChar]) {
        brailleCells.push({
          dots: capitalPrefix,
          char: 'CAP',
          description: 'Capital letter indicator'
        });
      }
      
      if (!isNaN(Number(char))) {
        if (i === 0 || isNaN(Number(word[i-1]))) {
          brailleCells.push({
            dots: numberPrefix,
            char: '#',
            description: 'Number sign'
          });
        }
        dots = braillePatterns[char] || [];
      }
      else if (braillePunctuation[char]) {
        dots = braillePunctuation[char];
      }
      else if (braillePatterns[upperChar] && upperChar.length > 1) {
        dots = braillePatterns[upperChar];
      }
      else {
        dots = braillePatterns[upperChar] || [];
      }
      
      brailleCells.push({
        dots,
        char: char,
        description: `${char === char.toUpperCase() && char !== char.toLowerCase() ? 'Capital ' : ''}${getCharacterDescription(char)}`
      });
    }
    
    return brailleCells;
  });
  
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

export function translateBrailleToText(brailleCells: BrailleCell[][]): string {
  let result = '';
  
  brailleCells.forEach((word, wordIndex) => {
    if (wordIndex > 0) {
      result += ' ';
    }
    
    word.forEach(cell => {
      if (cell.char && cell.char !== 'CAP' && cell.char !== '#') {
        result += cell.char;
      }
    });
  });
  
  return result;
}

export function exportToPrintableFormat(brailleCells: BrailleCell[][], options: any): string {
  console.log('Exporting to printable format:', brailleCells, options);
  return 'Generated file content';
}

export async function loadBrailleDatabase(): Promise<boolean> {
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return true;
}

export function getBraillePattern(char: string): number[] {
  const upperChar = char.toUpperCase();
  return braillePatterns[upperChar] || braillePunctuation[char] || [];
}

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

export function convertToArduinoFormat(dots: number[]): string {
  return dots.join(',');
}

export function sendToArduino(char: string): void {
  const pattern = getBraillePattern(char);
  const arduinoFormat = convertToArduinoFormat(pattern);
  
  console.log(`Arduino command: char:${char.toLowerCase()}`);
  console.log(`Arduino dots: ${arduinoFormat}`);
  
}