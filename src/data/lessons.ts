import { Lesson, Exercise } from '../types/types';

// Braille patterns matching the Arduino experiment code EXACTLY
export const braillePatterns: Record<string, number[]> = {
  // Letters A-Z (EXACTLY from your Arduino experiment)
  'A': [1], 'B': [1, 2], 'C': [1, 4], 'D': [1, 4, 5], 'E': [1, 5],
  'F': [1, 2, 4], 'G': [1, 2, 4, 5], 'H': [1, 2, 5], 'I': [2, 4], 'J': [2, 4, 5],
  'K': [1, 3], 'L': [1, 2, 3], 'M': [1, 3, 4], 'N': [1, 3, 4, 5], 'O': [1, 3, 5],
  'P': [1, 2, 3, 4], 'Q': [1, 2, 3, 4, 5], 'R': [1, 2, 3, 5], 'S': [2, 3, 4], 'T': [2, 3, 4, 5],
  'U': [1, 3, 6], 'V': [1, 2, 3, 6], 'W': [2, 4, 5, 6], 'X': [1, 3, 4, 6], 'Y': [1, 3, 4, 5, 6], 'Z': [1, 3, 5, 6],

  // Numbers (with number prefix)
  '1': [1], '2': [1, 2], '3': [1, 4], '4': [1, 4, 5], '5': [1, 5],
  '6': [1, 2, 4], '7': [1, 2, 4, 5], '8': [1, 2, 5], '9': [2, 4], '0': [2, 4, 5],

  // Punctuation
  '.': [2, 5, 6], ',': [2], '?': [2, 3, 6], '!': [2, 3, 5], "'": [3], '"': [2, 3, 5, 6],
  ':': [2, 5], ';': [2, 3], '-': [3, 6], '(': [2, 3, 6], ')': [3, 5, 6],

  // Common contractions
  'AND': [1, 2, 3, 4, 6], 'FOR': [1, 2, 3, 4, 5, 6], 'OF': [1, 2, 3, 5, 6], 'THE': [2, 3, 4, 6],
  'WITH': [2, 3, 4, 5, 6], 'CH': [1, 6], 'GH': [1, 2, 6], 'SH': [1, 4, 6], 'TH': [1, 4, 5, 6],
  'WH': [1, 5, 6], 'ED': [1, 2, 4, 6], 'ER': [1, 2, 4, 5, 6], 'OU': [1, 2, 5, 6], 'OW': [2, 4, 6],
  'ST': [3, 4], 'AR': [3, 4, 5], 'ING': [3, 4, 6]
};

// Generate exercises for each lesson
const generateExercises = (lessonType: string, content: any): Exercise[] => {
  const exercises: Exercise[] = [];
  
  switch (lessonType) {
    case 'letter-recognition':
      exercises.push({
        id: `${content.letter}-recognition`,
        type: 'multiple-choice',
        question: `What letter does this braille pattern represent?`,
        options: [content.letter, ...content.distractors],
        correctAnswer: content.letter,
        braillePattern: [{ dots: braillePatterns[content.letter], char: content.letter }],
        points: 10
      });
      break;
      
    case 'letter-formation':
      exercises.push({
        id: `${content.letter}-formation`,
        type: 'braille-to-text',
        question: `Form the braille pattern for the letter "${content.letter}"`,
        correctAnswer: content.letter,
        points: 15
      });
      break;
      
    case 'word-reading':
      content.words.forEach((word: string, index: number) => {
        exercises.push({
          id: `word-${index}`,
          type: 'braille-to-text',
          question: `Read this braille word:`,
          correctAnswer: word,
          braillePattern: word.split('').map(char => ({ 
            dots: braillePatterns[char.toUpperCase()], 
            char: char.toUpperCase() 
          })),
          points: 20
        });
      });
      break;
      
    case 'sentence-reading':
      exercises.push({
        id: 'sentence-reading',
        type: 'braille-to-text',
        question: `Read this braille sentence:`,
        correctAnswer: content.sentence,
        braillePattern: content.sentence.split('').map((char: string) => ({ 
          dots: braillePatterns[char.toUpperCase()] || [], 
          char: char === ' ' ? ' ' : char.toUpperCase() 
        })),
        points: 30
      });
      break;
      
    case 'contraction-recognition':
      exercises.push({
        id: 'contraction-recognition',
        type: 'multiple-choice',
        question: `What does this braille contraction represent?`,
        options: [content.contraction, ...content.distractors],
        correctAnswer: content.contraction,
        braillePattern: [{ dots: braillePatterns[content.contraction], char: content.contraction }],
        points: 25
      });
      break;
  }
  
  return exercises;
};

// Complete lesson database
const baseLessons: Lesson[] = [
  // LEVEL 1: Basic Letters (Lessons 1-10)
  {
    id: 'lesson-1',
    title: 'Letter A',
    description: 'Learn the braille pattern for the letter A - the foundation of braille reading',
    level: 1,
    category: 'basics',
    duration: 10,
    exercises: generateExercises('letter-recognition', { 
      letter: 'A', 
      distractors: ['B', 'C', 'D'] 
    }),
    prerequisites: []
  },
  {
    id: 'lesson-2',
    title: 'Letter B',
    description: 'Master the letter B and distinguish it from A',
    level: 1,
    category: 'basics',
    duration: 10,
    exercises: generateExercises('letter-recognition', { 
      letter: 'B', 
      distractors: ['A', 'C', 'L'] 
    }),
    prerequisites: ['lesson-1']
  },
  {
    id: 'lesson-3',
    title: 'Letter C',
    description: 'Learn letter C and practice A-B-C recognition',
    level: 1,
    category: 'basics',
    duration: 12,
    exercises: generateExercises('letter-recognition', { 
      letter: 'C', 
      distractors: ['A', 'B', 'F'] 
    }),
    prerequisites: ['lesson-2']
  },
  {
    id: 'lesson-4',
    title: 'Letters D and E',
    description: 'Expand your alphabet knowledge with D and E',
    level: 1,
    category: 'basics',
    duration: 15,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'D', distractors: ['C', 'F', 'H'] }),
      ...generateExercises('letter-recognition', { letter: 'E', distractors: ['A', 'I', 'O'] })
    ],
    prerequisites: ['lesson-3']
  },
  {
    id: 'lesson-5',
    title: 'Letters F, G, H',
    description: 'Continue building your braille alphabet foundation',
    level: 1,
    category: 'basics',
    duration: 18,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'F', distractors: ['C', 'D', 'P'] }),
      ...generateExercises('letter-recognition', { letter: 'G', distractors: ['F', 'H', 'Q'] }),
      ...generateExercises('letter-recognition', { letter: 'H', distractors: ['B', 'G', 'R'] })
    ],
    prerequisites: ['lesson-4']
  },
  {
    id: 'lesson-6',
    title: 'Letters I and J',
    description: 'Learn the unique patterns of I and J',
    level: 1,
    category: 'basics',
    duration: 12,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'I', distractors: ['E', 'S', 'Y'] }),
      ...generateExercises('letter-recognition', { letter: 'J', distractors: ['I', 'T', 'W'] })
    ],
    prerequisites: ['lesson-5']
  },
  {
    id: 'lesson-7',
    title: 'Letters K, L, M',
    description: 'Master the second row patterns K, L, and M',
    level: 1,
    category: 'basics',
    duration: 20,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'K', distractors: ['A', 'U', 'C'] }),
      ...generateExercises('letter-recognition', { letter: 'L', distractors: ['B', 'V', 'F'] }),
      ...generateExercises('letter-recognition', { letter: 'M', distractors: ['C', 'W', 'G'] })
    ],
    prerequisites: ['lesson-6']
  },
  {
    id: 'lesson-8',
    title: 'Letters N, O, P',
    description: 'Continue with N, O, and P patterns',
    level: 1,
    category: 'basics',
    duration: 20,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'N', distractors: ['D', 'X', 'H'] }),
      ...generateExercises('letter-recognition', { letter: 'O', distractors: ['E', 'Y', 'I'] }),
      ...generateExercises('letter-recognition', { letter: 'P', distractors: ['F', 'Z', 'J'] })
    ],
    prerequisites: ['lesson-7']
  },
  {
    id: 'lesson-9',
    title: 'Letters Q, R, S',
    description: 'Learn the complex patterns of Q, R, and S',
    level: 1,
    category: 'basics',
    duration: 22,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'Q', distractors: ['G', 'P', 'M'] }),
      ...generateExercises('letter-recognition', { letter: 'R', distractors: ['H', 'Q', 'N'] }),
      ...generateExercises('letter-recognition', { letter: 'S', distractors: ['I', 'R', 'O'] })
    ],
    prerequisites: ['lesson-8']
  },
  {
    id: 'lesson-10',
    title: 'Letters T, U, V, W, X, Y, Z',
    description: 'Complete the alphabet with the remaining letters',
    level: 1,
    category: 'basics',
    duration: 30,
    exercises: [
      ...generateExercises('letter-recognition', { letter: 'T', distractors: ['J', 'S', 'P'] }),
      ...generateExercises('letter-recognition', { letter: 'U', distractors: ['K', 'T', 'Q'] }),
      ...generateExercises('letter-recognition', { letter: 'V', distractors: ['L', 'U', 'R'] }),
      ...generateExercises('letter-recognition', { letter: 'W', distractors: ['J', 'V', 'S'] }),
      ...generateExercises('letter-recognition', { letter: 'X', distractors: ['M', 'W', 'T'] }),
      ...generateExercises('letter-recognition', { letter: 'Y', distractors: ['N', 'X', 'U'] }),
      ...generateExercises('letter-recognition', { letter: 'Z', distractors: ['O', 'Y', 'V'] })
    ],
    prerequisites: ['lesson-9']
  },

  // LEVEL 2: Numbers and Punctuation (Lessons 11-20)
  {
    id: 'lesson-11',
    title: 'Number Sign and Digits 1-5',
    description: 'Learn the number prefix and basic digits',
    level: 2,
    category: 'basics',
    duration: 25,
    exercises: [
      {
        id: 'number-sign',
        type: 'multiple-choice',
        question: 'What does this braille symbol represent?',
        options: ['Number sign', 'Capital sign', 'Period', 'Comma'],
        correctAnswer: 'Number sign',
        braillePattern: [{ dots: [3, 4, 5, 6], char: '#' }],
        points: 15
      },
      ...['1', '2', '3', '4', '5'].map(num => ({
        id: `number-${num}`,
        type: 'multiple-choice' as const,
        question: `What number does this represent?`,
        options: [num, String(Number(num) + 1), String(Number(num) - 1), String(Number(num) + 2)],
        correctAnswer: num,
        braillePattern: [
          { dots: [3, 4, 5, 6], char: '#' },
          { dots: braillePatterns[num], char: num }
        ],
        points: 10
      }))
    ],
    prerequisites: ['lesson-10']
  },
  {
    id: 'lesson-12',
    title: 'Digits 6-0',
    description: 'Complete your number recognition with digits 6 through 0',
    level: 2,
    category: 'basics',
    duration: 20,
    exercises: ['6', '7', '8', '9', '0'].map(num => ({
      id: `number-${num}`,
      type: 'multiple-choice' as const,
      question: `What number does this represent?`,
      options: [num, String((Number(num) + 1) % 10), String((Number(num) + 2) % 10), String((Number(num) + 3) % 10)],
      correctAnswer: num,
      braillePattern: [
        { dots: [3, 4, 5, 6], char: '#' },
        { dots: braillePatterns[num], char: num }
      ],
      points: 10
    })),
    prerequisites: ['lesson-11']
  },
  {
    id: 'lesson-13',
    title: 'Basic Punctuation: Period and Comma',
    description: 'Learn essential punctuation marks for sentence structure',
    level: 2,
    category: 'basics',
    duration: 15,
    exercises: [
      ...generateExercises('letter-recognition', { letter: '.', distractors: [':', ';', '!'] }),
      ...generateExercises('letter-recognition', { letter: ',', distractors: ['.', "'", ';'] })
    ],
    prerequisites: ['lesson-12']
  },
  {
    id: 'lesson-14',
    title: 'Question Mark and Exclamation Point',
    description: 'Master expressive punctuation marks',
    level: 2,
    category: 'basics',
    duration: 15,
    exercises: [
      ...generateExercises('letter-recognition', { letter: '?', distractors: ['!', '.', ':'] }),
      ...generateExercises('letter-recognition', { letter: '!', distractors: ['?', '.', ';'] })
    ],
    prerequisites: ['lesson-13']
  },
  {
    id: 'lesson-15',
    title: 'Quotation Marks and Apostrophe',
    description: 'Learn to handle quoted text and contractions',
    level: 2,
    category: 'basics',
    duration: 18,
    exercises: [
      ...generateExercises('letter-recognition', { letter: '"', distractors: ["'", '!', '?'] }),
      ...generateExercises('letter-recognition', { letter: "'", distractors: ['"', ',', '.'] })
    ],
    prerequisites: ['lesson-14']
  },
  {
    id: 'lesson-16',
    title: 'Colon, Semicolon, and Hyphen',
    description: 'Advanced punctuation for complex sentences',
    level: 2,
    category: 'basics',
    duration: 20,
    exercises: [
      ...generateExercises('letter-recognition', { letter: ':', distractors: [';', '.', '!'] }),
      ...generateExercises('letter-recognition', { letter: ';', distractors: [':', ',', '?'] }),
      ...generateExercises('letter-recognition', { letter: '-', distractors: [':', ';', '.'] })
    ],
    prerequisites: ['lesson-15']
  },
  {
    id: 'lesson-17',
    title: 'Capital Letters',
    description: 'Learn to recognize and form capital letters',
    level: 2,
    category: 'basics',
    duration: 25,
    exercises: [
      {
        id: 'capital-sign',
        type: 'multiple-choice',
        question: 'What does this braille symbol represent?',
        options: ['Capital sign', 'Number sign', 'Period', 'Comma'],
        correctAnswer: 'Capital sign',
        braillePattern: [{ dots: [6], char: 'CAP' }],
        points: 15
      },
      {
        id: 'capital-word',
        type: 'braille-to-text',
        question: 'Read this capitalized word:',
        correctAnswer: 'HELLO',
        braillePattern: [
          { dots: [6], char: 'CAP' },
          { dots: braillePatterns['H'], char: 'H' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['O'], char: 'O' }
        ],
        points: 20
      }
    ],
    prerequisites: ['lesson-16']
  },
  {
    id: 'lesson-18',
    title: 'Simple Words: 3-Letter Words',
    description: 'Start reading complete words with CAT, DOG, SUN',
    level: 2,
    category: 'words',
    duration: 20,
    exercises: generateExercises('word-reading', { 
      words: ['CAT', 'DOG', 'SUN', 'BAT', 'HAT', 'RUN'] 
    }),
    prerequisites: ['lesson-17']
  },
  {
    id: 'lesson-19',
    title: 'Simple Words: 4-Letter Words',
    description: 'Progress to longer words like BOOK, TREE, FISH',
    level: 2,
    category: 'words',
    duration: 25,
    exercises: generateExercises('word-reading', { 
      words: ['BOOK', 'TREE', 'FISH', 'BIRD', 'HAND', 'FOOT'] 
    }),
    prerequisites: ['lesson-18']
  },
  {
    id: 'lesson-20',
    title: 'Mixed Practice: Letters, Numbers, and Punctuation',
    description: 'Comprehensive review of all basic elements',
    level: 2,
    category: 'basics',
    duration: 30,
    exercises: [
      {
        id: 'mixed-sentence',
        type: 'braille-to-text',
        question: 'Read this complete sentence:',
        correctAnswer: 'I have 3 cats.',
        braillePattern: [
          { dots: braillePatterns['I'], char: 'I' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['H'], char: 'H' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['V'], char: 'V' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: [], char: ' ' },
          { dots: [3, 4, 5, 6], char: '#' },
          { dots: braillePatterns['3'], char: '3' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['C'], char: 'C' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['T'], char: 'T' },
          { dots: braillePatterns['S'], char: 'S' },
          { dots: braillePatterns['.'], char: '.' }
        ],
        points: 40
      }
    ],
    prerequisites: ['lesson-19']
  },

  // LEVEL 3: Common Words and Phrases (Lessons 21-30)
  {
    id: 'lesson-21',
    title: 'Sight Words: THE, AND, FOR',
    description: 'Master the most common English words',
    level: 3,
    category: 'words',
    duration: 20,
    exercises: generateExercises('word-reading', { 
      words: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT'] 
    }),
    prerequisites: ['lesson-20']
  },
  {
    id: 'lesson-22',
    title: 'Sight Words: YOU, ALL, CAN',
    description: 'Continue with essential vocabulary',
    level: 3,
    category: 'words',
    duration: 20,
    exercises: generateExercises('word-reading', { 
      words: ['YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS'] 
    }),
    prerequisites: ['lesson-21']
  },
  {
    id: 'lesson-23',
    title: 'Action Words: RUN, JUMP, WALK',
    description: 'Learn common verbs and action words',
    level: 3,
    category: 'words',
    duration: 25,
    exercises: generateExercises('word-reading', { 
      words: ['RUN', 'JUMP', 'WALK', 'SING', 'DANCE', 'PLAY'] 
    }),
    prerequisites: ['lesson-22']
  },
  {
    id: 'lesson-24',
    title: 'Color Words',
    description: 'Master color vocabulary in braille',
    level: 3,
    category: 'words',
    duration: 25,
    exercises: generateExercises('word-reading', { 
      words: ['RED', 'BLUE', 'GREEN', 'BLACK', 'WHITE', 'PINK'] 
    }),
    prerequisites: ['lesson-23']
  },
  {
    id: 'lesson-25',
    title: 'Animal Names',
    description: 'Learn to read animal names fluently',
    level: 3,
    category: 'words',
    duration: 30,
    exercises: generateExercises('word-reading', { 
      words: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR', 'FROG', 'DUCK'] 
    }),
    prerequisites: ['lesson-24']
  },
  {
    id: 'lesson-26',
    title: 'Family Words',
    description: 'Master family relationship vocabulary',
    level: 3,
    category: 'words',
    duration: 25,
    exercises: generateExercises('word-reading', { 
      words: ['MOM', 'DAD', 'SON', 'GIRL', 'BOY', 'BABY'] 
    }),
    prerequisites: ['lesson-25']
  },
  {
    id: 'lesson-27',
    title: 'Food Words',
    description: 'Learn common food vocabulary',
    level: 3,
    category: 'words',
    duration: 30,
    exercises: generateExercises('word-reading', { 
      words: ['BREAD', 'MILK', 'MEAT', 'FRUIT', 'CAKE', 'SOUP', 'RICE', 'EGGS'] 
    }),
    prerequisites: ['lesson-26']
  },
  {
    id: 'lesson-28',
    title: 'Simple Sentences: Subject + Verb',
    description: 'Start reading complete simple sentences',
    level: 3,
    category: 'sentences',
    duration: 25,
    exercises: [
      ...generateExercises('sentence-reading', { sentence: 'I run.' }),
      ...generateExercises('sentence-reading', { sentence: 'You jump.' }),
      ...generateExercises('sentence-reading', { sentence: 'We play.' })
    ],
    prerequisites: ['lesson-27']
  },
  {
    id: 'lesson-29',
    title: 'Simple Sentences: Subject + Verb + Object',
    description: 'Read sentences with objects',
    level: 3,
    category: 'sentences',
    duration: 30,
    exercises: [
      ...generateExercises('sentence-reading', { sentence: 'I see a cat.' }),
      ...generateExercises('sentence-reading', { sentence: 'You have a book.' }),
      ...generateExercises('sentence-reading', { sentence: 'We eat cake.' })
    ],
    prerequisites: ['lesson-28']
  },
  {
    id: 'lesson-30',
    title: 'Questions and Answers',
    description: 'Practice reading questions and responses',
    level: 3,
    category: 'sentences',
    duration: 35,
    exercises: [
      ...generateExercises('sentence-reading', { sentence: 'What is your name?' }),
      ...generateExercises('sentence-reading', { sentence: 'How are you?' }),
      ...generateExercises('sentence-reading', { sentence: 'Where do you live?' })
    ],
    prerequisites: ['lesson-29']
  },

  // LEVEL 4: Contractions and Advanced Reading (Lessons 31-40)
  {
    id: 'lesson-31',
    title: 'Basic Contractions: AND, FOR, OF',
    description: 'Introduction to braille contractions for faster reading',
    level: 4,
    category: 'contractions',
    duration: 30,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'AND', 
        distractors: ['FOR', 'OF', 'THE'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'FOR', 
        distractors: ['AND', 'OF', 'WITH'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'OF', 
        distractors: ['AND', 'FOR', 'THE'] 
      })
    ],
    prerequisites: ['lesson-30']
  },
  {
    id: 'lesson-32',
    title: 'Common Contractions: THE, WITH',
    description: 'Master the most frequently used contractions',
    level: 4,
    category: 'contractions',
    duration: 25,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'THE', 
        distractors: ['WITH', 'AND', 'FOR'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'WITH', 
        distractors: ['THE', 'AND', 'OF'] 
      })
    ],
    prerequisites: ['lesson-31']
  },
  {
    id: 'lesson-33',
    title: 'Letter Combinations: CH, SH, TH',
    description: 'Learn common letter combination contractions',
    level: 4,
    category: 'contractions',
    duration: 30,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'CH', 
        distractors: ['SH', 'TH', 'WH'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'SH', 
        distractors: ['CH', 'TH', 'GH'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'TH', 
        distractors: ['CH', 'SH', 'WH'] 
      })
    ],
    prerequisites: ['lesson-32']
  },
  {
    id: 'lesson-34',
    title: 'More Letter Combinations: GH, WH',
    description: 'Complete your letter combination knowledge',
    level: 4,
    category: 'contractions',
    duration: 25,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'GH', 
        distractors: ['WH', 'CH', 'SH'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'WH', 
        distractors: ['GH', 'TH', 'CH'] 
      })
    ],
    prerequisites: ['lesson-33']
  },
  {
    id: 'lesson-35',
    title: 'Ending Contractions: ED, ER, ING',
    description: 'Learn common word ending contractions',
    level: 4,
    category: 'contractions',
    duration: 35,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'ED', 
        distractors: ['ER', 'ING', 'OU'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'ER', 
        distractors: ['ED', 'ING', 'OW'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'ING', 
        distractors: ['ED', 'ER', 'ST'] 
      })
    ],
    prerequisites: ['lesson-34']
  },
  {
    id: 'lesson-36',
    title: 'Vowel Combinations: OU, OW',
    description: 'Master vowel combination contractions',
    level: 4,
    category: 'contractions',
    duration: 25,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'OU', 
        distractors: ['OW', 'AR', 'ER'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'OW', 
        distractors: ['OU', 'AR', 'ST'] 
      })
    ],
    prerequisites: ['lesson-35']
  },
  {
    id: 'lesson-37',
    title: 'Position Contractions: ST, AR',
    description: 'Learn contractions that depend on position in words',
    level: 4,
    category: 'contractions',
    duration: 30,
    exercises: [
      ...generateExercises('contraction-recognition', { 
        contraction: 'ST', 
        distractors: ['AR', 'OU', 'ING'] 
      }),
      ...generateExercises('contraction-recognition', { 
        contraction: 'AR', 
        distractors: ['ST', 'ER', 'OW'] 
      })
    ],
    prerequisites: ['lesson-36']
  },
  {
    id: 'lesson-38',
    title: 'Reading with Contractions',
    description: 'Practice reading sentences that include contractions',
    level: 4,
    category: 'sentences',
    duration: 40,
    exercises: [
      {
        id: 'contracted-sentence-1',
        type: 'braille-to-text',
        question: 'Read this sentence with contractions:',
        correctAnswer: 'The children are playing.',
        braillePattern: [
          { dots: braillePatterns['THE'], char: 'THE' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['C'], char: 'C' },
          { dots: braillePatterns['H'], char: 'H' },
          { dots: braillePatterns['I'], char: 'I' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['D'], char: 'D' },
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: braillePatterns['N'], char: 'N' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['P'], char: 'P' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['Y'], char: 'Y' },
          { dots: braillePatterns['ING'], char: 'ING' },
          { dots: braillePatterns['.'], char: '.' }
        ],
        points: 50
      }
    ],
    prerequisites: ['lesson-37']
  },
  {
    id: 'lesson-39',
    title: 'Compound Words',
    description: 'Read compound words with and without contractions',
    level: 4,
    category: 'words',
    duration: 35,
    exercises: generateExercises('word-reading', { 
      words: ['SUNSHINE', 'RAINBOW', 'FOOTBALL', 'BEDROOM', 'HOMEWORK', 'BIRTHDAY'] 
    }),
    prerequisites: ['lesson-38']
  },
  {
    id: 'lesson-40',
    title: 'Paragraph Reading',
    description: 'Read complete paragraphs with mixed content',
    level: 4,
    category: 'sentences',
    duration: 45,
    exercises: [
      {
        id: 'paragraph-reading-1',
        type: 'braille-to-text',
        question: 'Read this sentence:',
        correctAnswer: 'THE CAT SAT',
        braillePattern: [
          { dots: braillePatterns['THE'], char: 'THE' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['C'], char: 'C' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['T'], char: 'T' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['S'], char: 'S' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['T'], char: 'T' }
        ],
        points: 30
      },
      {
        id: 'paragraph-reading-2',
        type: 'braille-to-text',
        question: 'Read the next line:',
        correctAnswer: 'ON THE MAT',
        braillePattern: [
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['N'], char: 'N' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['THE'], char: 'THE' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['M'], char: 'M' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['T'], char: 'T' }
        ],
        points: 30
      },
      {
        id: 'paragraph-reading-3',
        type: 'braille-to-text',
        question: 'Read the final line:',
        correctAnswer: 'A SUNNY DAY',
        braillePattern: [
          { dots: braillePatterns['A'], char: 'A' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['S'], char: 'S' },
          { dots: braillePatterns['U'], char: 'U' },
          { dots: braillePatterns['N'], char: 'N' },
          { dots: braillePatterns['N'], char: 'N' },
          { dots: braillePatterns['Y'], char: 'Y' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['D'], char: 'D' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['Y'], char: 'Y' }
        ],
        points: 30
      }
    ],
    prerequisites: ['lesson-39']
  },

  // LEVEL 5: Advanced Skills (Lessons 41-50)
  {
    id: 'lesson-41',
    title: 'Speed Reading Techniques',
    description: 'Learn techniques to increase your braille reading speed',
    level: 5,
    category: 'advanced',
    duration: 40,
    exercises: [
      {
        id: 'speed-reading-1',
        type: 'braille-to-text',
        question: 'Speed-read this common phrase:',
        correctAnswer: 'THE QUICK FOX',
        braillePattern: [
          { dots: braillePatterns['THE'], char: 'THE' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['Q'], char: 'Q' },
          { dots: braillePatterns['U'], char: 'U' },
          { dots: braillePatterns['I'], char: 'I' },
          { dots: braillePatterns['C'], char: 'C' },
          { dots: braillePatterns['K'], char: 'K' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['F'], char: 'F' },
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['X'], char: 'X' }
        ],
        points: 30
      },
      {
        id: 'speed-reading-2',
        type: 'braille-to-text',
        question: 'Read this sentence quickly:',
        correctAnswer: 'JUMP OVER',
        braillePattern: [
          { dots: braillePatterns['J'], char: 'J' },
          { dots: braillePatterns['U'], char: 'U' },
          { dots: braillePatterns['M'], char: 'M' },
          { dots: braillePatterns['P'], char: 'P' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['V'], char: 'V' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: braillePatterns['R'], char: 'R' }
        ],
        points: 25
      },
      {
        id: 'speed-reading-3',
        type: 'braille-to-text',
        question: 'Quickly read this word:',
        correctAnswer: 'LAZY DOG',
        braillePattern: [
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['Z'], char: 'Z' },
          { dots: braillePatterns['Y'], char: 'Y' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['D'], char: 'D' },
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['G'], char: 'G' }
        ],
        points: 25
      }
    ],
    prerequisites: ['lesson-40']
  },
  {
    id: 'lesson-42',
    title: 'Mathematical Notation Basics',
    description: 'Introduction to braille mathematical symbols',
    level: 5,
    category: 'advanced',
    duration: 45,
    exercises: [
      {
        id: 'math-symbols',
        type: 'multiple-choice',
        question: 'What mathematical operation does this represent?',
        options: ['Addition', 'Subtraction', 'Multiplication', 'Division'],
        correctAnswer: 'Addition',
        braillePattern: [{ dots: [2, 3, 5], char: '+' }],
        points: 20
      }
    ],
    prerequisites: ['lesson-41']
  },
  {
    id: 'lesson-43',
    title: 'Mathematical Expressions',
    description: 'Read and understand mathematical expressions in braille',
    level: 5,
    category: 'advanced',
    duration: 50,
    exercises: [
      {
        id: 'math-expression',
        type: 'braille-to-text',
        question: 'What is this mathematical expression?',
        correctAnswer: '2 + 3 = 5',
        braillePattern: [
          { dots: [3, 4, 5, 6], char: '#' },
          { dots: braillePatterns['2'], char: '2' },
          { dots: [], char: ' ' },
          { dots: [2, 3, 5], char: '+' },
          { dots: [], char: ' ' },
          { dots: [3, 4, 5, 6], char: '#' },
          { dots: braillePatterns['3'], char: '3' },
          { dots: [], char: ' ' },
          { dots: [2, 3, 5, 6], char: '=' },
          { dots: [], char: ' ' },
          { dots: [3, 4, 5, 6], char: '#' },
          { dots: braillePatterns['5'], char: '5' }
        ],
        points: 35
      }
    ],
    prerequisites: ['lesson-42']
  },
  {
    id: 'lesson-44',
    title: 'Music Notation Introduction',
    description: 'Basic introduction to braille music notation',
    level: 5,
    category: 'advanced',
    duration: 55,
    exercises: [
      {
        id: 'music-note',
        type: 'multiple-choice',
        question: 'What musical note does this represent?',
        options: ['C', 'D', 'E', 'F'],
        correctAnswer: 'C',
        braillePattern: [{ dots: [1, 4, 5], char: 'C♪' }],
        points: 25
      }
    ],
    prerequisites: ['lesson-43']
  },
  {
    id: 'lesson-45',
    title: 'Foreign Language Basics: Spanish',
    description: 'Introduction to Spanish braille characters',
    level: 5,
    category: 'advanced',
    duration: 50,
    exercises: [
      {
        id: 'spanish-accent',
        type: 'multiple-choice',
        question: 'What Spanish character is this?',
        options: ['á', 'é', 'í', 'ó'],
        correctAnswer: 'á',
        braillePattern: [{ dots: [1, 2, 3, 5, 6], char: 'á' }],
        points: 30
      }
    ],
    prerequisites: ['lesson-44']
  },
  {
    id: 'lesson-46',
    title: 'Technical Writing: Computer Terms',
    description: 'Learn braille notation for computer and technical terms',
    level: 5,
    category: 'advanced',
    duration: 45,
    exercises: generateExercises('word-reading', { 
      words: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'PROGRAM', 'DATABASE'] 
    }),
    prerequisites: ['lesson-45']
  },
  {
    id: 'lesson-47',
    title: 'Literary Braille: Poetry',
    description: 'Read and understand poetry in braille format',
    level: 5,
    category: 'advanced',
    duration: 50,
    exercises: [
      {
        id: 'poetry-reading-1',
        type: 'braille-to-text',
        question: 'Read this line of poetry:',
        correctAnswer: 'ROSES ARE RED',
        braillePattern: [
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['S'], char: 'S' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: braillePatterns['S'], char: 'S' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: braillePatterns['D'], char: 'D' }
        ],
        points: 40
      },
      {
        id: 'poetry-reading-2',
        type: 'braille-to-text',
        question: 'Continue reading the poem:',
        correctAnswer: 'VIOLETS ARE BLUE',
        braillePattern: [
          { dots: braillePatterns['V'], char: 'V' },
          { dots: braillePatterns['I'], char: 'I' },
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: braillePatterns['T'], char: 'T' },
          { dots: braillePatterns['S'], char: 'S' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['E'], char: 'E' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['B'], char: 'B' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['U'], char: 'U' },
          { dots: braillePatterns['E'], char: 'E' }
        ],
        points: 40
      }
    ],
    prerequisites: ['lesson-46']
  },
  {
    id: 'lesson-48',
    title: 'Advanced Contractions: Whole Words',
    description: 'Master advanced whole-word contractions',
    level: 5,
    category: 'contractions',
    duration: 40,
    exercises: [
      {
        id: 'whole-word-contraction',
        type: 'multiple-choice',
        question: 'What word does this contraction represent?',
        options: ['ABOUT', 'ABOVE', 'ACROSS', 'AFTER'],
        correctAnswer: 'ABOUT',
        braillePattern: [{ dots: [1, 2], char: 'ABOUT' }],
        points: 25
      }
    ],
    prerequisites: ['lesson-47']
  },
  {
    id: 'lesson-49',
    title: 'Document Formatting',
    description: 'Understand braille document formatting and structure',
    level: 5,
    category: 'advanced',
    duration: 45,
    exercises: [
      {
        id: 'document-structure',
        type: 'multiple-choice',
        question: 'What does this formatting symbol indicate?',
        options: ['New paragraph', 'Page break', 'Chapter heading', 'Footnote'],
        correctAnswer: 'New paragraph',
        braillePattern: [{ dots: [5], char: '¶' }],
        points: 20
      }
    ],
    prerequisites: ['lesson-48']
  },
  {
    id: 'lesson-50',
    title: 'Master Assessment',
    description: 'Comprehensive test of all braille skills learned',
    level: 5,
    category: 'advanced',
    duration: 60,
    exercises: [
      {
        id: 'master-letters',
        type: 'braille-to-text',
        question: 'Read these letters:',
        correctAnswer: 'BRAILLE',
        braillePattern: [
          { dots: braillePatterns['B'], char: 'B' },
          { dots: braillePatterns['R'], char: 'R' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['I'], char: 'I' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['L'], char: 'L' },
          { dots: braillePatterns['E'], char: 'E' }
        ],
        points: 30
      },
      {
        id: 'master-numbers',
        type: 'braille-to-text',
        question: 'Read this number:',
        correctAnswer: '42',
        braillePattern: [
          { dots: [3, 4, 5, 6], char: '#' },
          { dots: braillePatterns['4'], char: '4' },
          { dots: braillePatterns['2'], char: '2' }
        ],
        points: 20
      },
      {
        id: 'master-sentence',
        type: 'braille-to-text',
        question: 'Read this congratulatory message:',
        correctAnswer: 'YOU DID IT',
        braillePattern: [
          { dots: braillePatterns['Y'], char: 'Y' },
          { dots: braillePatterns['O'], char: 'O' },
          { dots: braillePatterns['U'], char: 'U' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['D'], char: 'D' },
          { dots: braillePatterns['I'], char: 'I' },
          { dots: braillePatterns['D'], char: 'D' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['I'], char: 'I' },
          { dots: braillePatterns['T'], char: 'T' }
        ],
        points: 30
      },
      {
        id: 'master-contraction',
        type: 'multiple-choice',
        question: 'What word does this contraction represent?',
        options: ['KNOWLEDGE', 'THROUGH', 'CHILDREN', 'ABOUT'],
        correctAnswer: 'CHILDREN',
        braillePattern: [{ dots: [1, 6], char: 'CHILDREN' }],
        points: 20
      }
    ],
    prerequisites: ['lesson-49']
  }
];

// Generate extended lessons for levels 6-30
const generateExtendedLessons = (): Lesson[] => {
  const extendedLessons: Lesson[] = [];
  
  // Level 6-10: Advanced Basics
  const level6to10Topics = [
    { topic: 'Capitalization', question: 'What does this capitalization symbol indicate?', options: ['Capital letter follows', 'All caps word', 'Proper noun', 'Emphasis'], correct: 'Capital letter follows', pattern: [6] },
    { topic: 'Number Signs', question: 'What follows the number sign?', options: ['Letters', 'Numbers', 'Punctuation', 'Spaces'], correct: 'Numbers', pattern: [3, 4, 5, 6] },
    { topic: 'Italics Indicator', question: 'What does this symbol represent?', options: ['Bold text', 'Italic text', 'Underlined text', 'Foreign word'], correct: 'Italic text', pattern: [4, 6] },
    { topic: 'Bold Text Marker', question: 'How is bold text indicated in braille?', options: ['Double dots', 'Special symbol', 'Capital letters', 'Underscores'], correct: 'Special symbol', pattern: [4, 5, 6] },
    { topic: 'Foreign Alphabet', question: 'What indicates foreign alphabet usage?', options: ['Special prefix', 'Different dots', 'Capital marker', 'Number sign'], correct: 'Special prefix', pattern: [4] }
  ];
  
  // Level 11-15: Advanced Words  
  const level11to15Topics = [
    { topic: 'Compound Words', question: 'How should this compound word be read?', options: ['As one word', 'As two words', 'With hyphen', 'Separately spaced'], correct: 'As one word', pattern: [1, 2, 3] },
    { topic: 'Abbreviations', question: 'What does this abbreviation stand for?', options: ['Doctor', 'Department', 'December', 'Degree'], correct: 'Doctor', pattern: [1, 4] },
    { topic: 'Technical Terms', question: 'This technical term means:', options: ['Computer command', 'Medical term', 'Legal phrase', 'Scientific concept'], correct: 'Computer command', pattern: [1, 2, 4, 5] },
    { topic: 'Proper Nouns', question: 'This represents which type of proper noun?', options: ['Person name', 'Place name', 'Organization', 'Brand name'], correct: 'Person name', pattern: [6, 1, 2] },
    { topic: 'Academic Vocabulary', question: 'This academic term is used in:', options: ['Mathematics', 'Science', 'Literature', 'History'], correct: 'Mathematics', pattern: [1, 3, 4, 6] }
  ];
  
  // Level 16-20: Complex Sentences
  const level16to20Topics = [
    { topic: 'Dialogue Format', question: 'How is spoken dialogue indicated?', options: ['Quotation marks', 'Special indent', 'Bold text', 'Italics'], correct: 'Quotation marks', pattern: [2, 3, 6] },
    { topic: 'Poetry Structure', question: 'What indicates a new line in poetry?', options: ['Line break symbol', 'Special spacing', 'Indent marker', 'Stanza break'], correct: 'Line break symbol', pattern: [5] },
    { topic: 'List Formatting', question: 'How are bulleted lists shown?', options: ['Special bullets', 'Number sequence', 'Letter sequence', 'Dash markers'], correct: 'Special bullets', pattern: [2, 5] },
    { topic: 'Footnote Reference', question: 'What indicates a footnote reference?', options: ['Superscript number', 'Special symbol', 'Asterisk', 'Letter marker'], correct: 'Special symbol', pattern: [3, 5] },
    { topic: 'Mathematical Expressions', question: 'How are mathematical equations formatted?', options: ['Special math mode', 'Standard text', 'Number format', 'Symbol replacement'], correct: 'Special math mode', pattern: [4, 5] }
  ];
  
  // Level 21-25: Advanced Contractions
  const level21to25Topics = [
    { topic: 'Grade 2 Contractions', question: 'What word does this grade 2 contraction represent?', options: ['KNOWLEDGE', 'THROUGH', 'ENOUGH', 'OUGHT'], correct: 'KNOWLEDGE', pattern: [1, 3] },
    { topic: 'Part-word Contractions', question: 'This contraction represents which word part?', options: ['-ING', '-TION', '-NESS', '-MENT'], correct: '-ING', pattern: [3, 4, 6] },
    { topic: 'Initial Contractions', question: 'This initial contraction begins which words?', options: ['UNDER-', 'OVER-', 'OUT-', 'UPON-'], correct: 'UNDER-', pattern: [1, 3, 6] },
    { topic: 'Final Contractions', question: 'This final contraction ends which words?', options: ['-NESS', '-MENT', '-TION', '-ALLY'], correct: '-NESS', pattern: [1, 4, 5, 6] },
    { topic: 'Short-form Words', question: 'What complete word does this represent?', options: ['CHILDREN', 'CHARACTER', 'KNOWLEDGE', 'THROUGH'], correct: 'CHILDREN', pattern: [1, 6] }
  ];
  
  // Level 26-30: Professional/Academic
  const level26to30Topics = [
    { topic: 'Scientific Notation', question: 'How is scientific notation expressed?', options: ['Superscript format', 'Special symbols', 'Standard notation', 'Abbreviated form'], correct: 'Special symbols', pattern: [4, 5, 6] },
    { topic: 'Legal Documents', question: 'What indicates legal formatting?', options: ['Special indentation', 'Bold headers', 'Number systems', 'Citation format'], correct: 'Citation format', pattern: [2, 4, 6] },
    { topic: 'Computer Code', question: 'How is programming code represented?', options: ['Monospace format', 'Special symbols', 'Standard text', 'Abbreviated syntax'], correct: 'Special symbols', pattern: [4, 6] },
    { topic: 'Musical Notation', question: 'What does this music symbol indicate?', options: ['Note value', 'Key signature', 'Time signature', 'Tempo marking'], correct: 'Note value', pattern: [1, 4, 6] },
    { topic: 'Foreign Languages', question: 'How are foreign words indicated?', options: ['Special markers', 'Italic format', 'Different alphabet', 'Translation notes'], correct: 'Special markers', pattern: [4] }
  ];
  
  const allTopics = [
    ...level6to10Topics, ...level11to15Topics, ...level16to20Topics,
    ...level21to25Topics, ...level26to30Topics
  ];
  
  for (let level = 6; level <= 30; level++) {
    const lessonsPerLevel = Math.min(3 + Math.floor(level / 10), 5);
    
    for (let i = 0; i < lessonsPerLevel; i++) {
      const lessonNumber = (level - 6) * 5 + i + 51; // Start from lesson 51
      const topicIndex = ((level - 6) * 5 + i) % allTopics.length;
      const topic = allTopics[topicIndex];
      
      extendedLessons.push({
        id: `lesson-${lessonNumber}`,
        title: `Level ${level} - ${topic.topic}`,
        description: `Master ${topic.topic.toLowerCase()} in braille reading and writing`,
        level: level,
        category: level <= 10 ? 'basics' : level <= 15 ? 'words' : level <= 20 ? 'sentences' : level <= 25 ? 'contractions' : 'advanced',
        duration: 15 + (level * 1.5),
        exercises: [
          {
            id: `ex-${lessonNumber}-1`,
            type: 'multiple-choice',
            question: topic.question,
            options: topic.options,
            correctAnswer: topic.correct,
            braillePattern: [{ dots: topic.pattern, char: topic.topic }],
            points: 10 + level
          },
          {
            id: `ex-${lessonNumber}-2`,
            type: 'braille-to-text',
            question: `Read this ${topic.topic.toLowerCase()} example:`,
            correctAnswer: topic.correct.toLowerCase(),
            braillePattern: [{ dots: topic.pattern, char: topic.correct }],
            points: 15 + level
          },
          {
            id: `ex-${lessonNumber}-3`,
            type: 'text-to-braille',
            question: `Write "${topic.correct}" in braille:`,
            correctAnswer: topic.pattern.join(','),
            braillePattern: [{ dots: topic.pattern, char: topic.correct }],
            points: 20 + level
          }
        ],
        prerequisites: level > 6 ? [`lesson-${lessonNumber - 5}`] : ['lesson-50']
      });
    }
  }
  
  return extendedLessons;
};

// Generate themed adventure lessons for more engaging learning
const generateThemedAdventureLessons = (): Lesson[] => {
  const adventureLessons: Lesson[] = [];
  
  // Space Explorer Theme (Levels 1-5)
  const spaceTheme = [
    {
      title: '🚀 Space Launch: Letter Training',
      description: 'Prepare for your space mission by learning astronaut alphabet codes!',
      story: 'You are a trainee astronaut learning to read space communication codes.',
      words: ['STAR', 'MOON', 'SUN', 'SHIP', 'MARS'],
      level: 1
    },
    {
      title: '🌟 Constellation Mapper',
      description: 'Map the stars by reading their braille coordinates!',
      story: 'Navigate through the galaxy by reading star names in braille.',
      words: ['ORION', 'DRACO', 'LYRA', 'VEGA', 'ARIES'],
      level: 2
    },
    {
      title: '👽 Alien Messages',
      description: 'Decode messages from friendly aliens using braille!',
      story: 'Aliens communicate using braille patterns - can you understand them?',
      words: ['HELLO', 'PEACE', 'FRIEND', 'EARTH', 'LIFE'],
      level: 3
    },
    {
      title: '🛸 Mission Control',
      description: 'Become a mission controller and read critical flight data!',
      story: 'Lives depend on your ability to read braille commands accurately.',
      words: ['LAUNCH', 'ORBIT', 'FUEL', 'OXYGEN', 'LAND'],
      level: 4
    },
    {
      title: '🌌 Galaxy Explorer Badge',
      description: 'Complete your space training with this final challenge!',
      story: 'Earn your Galaxy Explorer badge by mastering all space vocabulary.',
      words: ['COSMOS', 'NEBULA', 'COMET', 'PLANET', 'ROCKET'],
      level: 5
    }
  ];

  // Ocean Adventure Theme (Levels 1-5)
  const oceanTheme = [
    {
      title: '🐠 Coral Reef Explorer',
      description: 'Discover sea creatures by reading their braille names!',
      story: 'Dive deep into the coral reef and identify marine life.',
      words: ['FISH', 'CORAL', 'CRAB', 'SEAL', 'EEL'],
      level: 1
    },
    {
      title: '🦈 Shark Researcher',
      description: 'Study sharks and ocean predators through braille research notes!',
      story: 'You are a marine biologist documenting shark species.',
      words: ['SHARK', 'WHALE', 'SQUID', 'ORCA', 'RAY'],
      level: 2
    },
    {
      title: '🐢 Sea Turtle Tracker',
      description: 'Follow sea turtles on their migration by reading tracking data!',
      story: 'Track endangered sea turtles across the Pacific Ocean.',
      words: ['TURTLE', 'BEACH', 'NEST', 'SHELL', 'WAVE'],
      level: 3
    },
    {
      title: '🏝️ Treasure Island',
      description: 'Find hidden treasure by reading ancient braille maps!',
      story: 'Decode a pirate\'s braille treasure map to find gold.',
      words: ['ISLAND', 'GOLD', 'CHEST', 'SHIP', 'SAIL'],
      level: 4
    },
    {
      title: '🐙 Deep Sea Master',
      description: 'Explore the deepest ocean trenches and discover mysteries!',
      story: 'Descend to the Mariana Trench in your submarine.',
      words: ['DEEP', 'DARK', 'GIANT', 'ABYSS', 'GLOW'],
      level: 5
    }
  ];

  // Safari Adventure Theme (Levels 1-5)
  const safariTheme = [
    {
      title: '🦁 Safari Starter',
      description: 'Begin your African safari by learning animal names!',
      story: 'Embark on a thrilling safari adventure in the savanna.',
      words: ['LION', 'ZEBRA', 'GIRAFFE', 'HIPPO', 'RHINO'],
      level: 1
    },
    {
      title: '🐘 Elephant Tracker',
      description: 'Follow elephant herds and read tracking signs!',
      story: 'Help researchers track elephant migrations across Africa.',
      words: ['HERD', 'TRUNK', 'TUSK', 'CALF', 'WATERING'],
      level: 2
    },
    {
      title: '🦒 Savanna Explorer',
      description: 'Navigate the vast savanna with braille guidebooks!',
      story: 'Identify all the wildlife in the African grasslands.',
      words: ['SAVANNA', 'GRASS', 'SUNSET', 'DUST', 'HORIZON'],
      level: 3
    },
    {
      title: '🐆 Night Safari',
      description: 'Spot nocturnal animals using braille night vision guides!',
      story: 'The most exciting animals come out at night.',
      words: ['LEOPARD', 'OWL', 'BAT', 'HYENA', 'STARS'],
      level: 4
    },
    {
      title: '🏆 Safari Champion',
      description: 'Complete your safari certification exam!',
      story: 'Prove your wildlife expertise to become a certified ranger.',
      words: ['WILDLIFE', 'PROTECT', 'NATURE', 'CONSERVE', 'WILD'],
      level: 5
    }
  ];

  // Superhero Academy Theme (Levels 3-7)
  const superheroTheme = [
    {
      title: '⚡ Hero Academy Orientation',
      description: 'Begin your superhero training at the academy!',
      story: 'Welcome to Hero Academy - learn to read your hero manual.',
      words: ['HERO', 'POWER', 'CAPE', 'MASK', 'SAVE'],
      level: 3
    },
    {
      title: '🦸 Power Training',
      description: 'Learn the names of different superpowers!',
      story: 'Discover what powers you might develop.',
      words: ['FLIGHT', 'SPEED', 'STRENGTH', 'VISION', 'MIND'],
      level: 4
    },
    {
      title: '🎯 Mission Briefing',
      description: 'Read mission briefings to save the city!',
      story: 'The city needs you! Read your mission objectives carefully.',
      words: ['RESCUE', 'DANGER', 'CITIZEN', 'ALERT', 'ACTION'],
      level: 5
    },
    {
      title: '🛡️ Team Training',
      description: 'Work with your superhero team using coded messages!',
      story: 'Heroes work together - communicate with your team.',
      words: ['TEAM', 'UNITE', 'TRUST', 'SHIELD', 'DEFEND'],
      level: 6
    },
    {
      title: '🏅 Hero Graduation',
      description: 'Graduate from Hero Academy with honors!',
      story: 'Complete your final exam to become a certified hero.',
      words: ['JUSTICE', 'HONOR', 'BRAVE', 'LEGEND', 'VICTORY'],
      level: 7
    }
  ];

  // Wizard School Theme (Levels 5-10)
  const wizardTheme = [
    {
      title: '🧙 Wizard School Welcome',
      description: 'Learn magical words at the Wizard Academy!',
      story: 'You have been accepted to the School of Magic.',
      words: ['WAND', 'SPELL', 'MAGIC', 'POTION', 'ROBE'],
      level: 5
    },
    {
      title: '📖 Spellbook Reading',
      description: 'Master your first spells from the ancient spellbook!',
      story: 'The spellbook is written in magical braille - learn to read it.',
      words: ['FIRE', 'WATER', 'WIND', 'EARTH', 'LIGHT'],
      level: 6
    },
    {
      title: '🔮 Crystal Ball Visions',
      description: 'Read prophecies in the crystal ball!',
      story: 'The crystal ball reveals secrets in braille patterns.',
      words: ['FUTURE', 'VISION', 'DREAM', 'DESTINY', 'FATE'],
      level: 7
    },
    {
      title: '🐉 Dragon Taming',
      description: 'Learn the names of magical creatures to tame them!',
      story: 'Dragons can only be tamed by those who know their true names.',
      words: ['DRAGON', 'PHOENIX', 'GRIFFIN', 'UNICORN', 'FAIRY'],
      level: 8
    },
    {
      title: '⚗️ Potion Mastery',
      description: 'Read potion recipes to create magical brews!',
      story: 'Follow recipes carefully or the potion might explode!',
      words: ['BREW', 'MIX', 'HERB', 'CAULDRON', 'BUBBLES'],
      level: 9
    },
    {
      title: '🎓 Grand Wizard Exam',
      description: 'Pass the final exam to become a Grand Wizard!',
      story: 'The ultimate test of your magical reading abilities.',
      words: ['WISDOM', 'ANCIENT', 'POWER', 'MASTER', 'LEGEND'],
      level: 10
    }
  ];

  // Detective Agency Theme (Levels 8-15)
  const detectiveTheme = [
    {
      title: '🔍 Detective Training',
      description: 'Begin your detective career by reading case files!',
      story: 'Join the Detective Agency and solve your first case.',
      words: ['CLUE', 'CASE', 'SOLVE', 'FIND', 'SEARCH'],
      level: 8
    },
    {
      title: '📋 Case Files',
      description: 'Read confidential case files to crack the mystery!',
      story: 'Every detail in the file could be important.',
      words: ['SECRET', 'HIDDEN', 'MYSTERY', 'SUSPECT', 'WITNESS'],
      level: 9
    },
    {
      title: '🔐 Code Breaker',
      description: 'Decode secret messages left by criminals!',
      story: 'The criminal left coded messages - can you decode them?',
      words: ['CODE', 'CIPHER', 'DECODE', 'MESSAGE', 'UNLOCK'],
      level: 10
    },
    {
      title: '🕵️ Undercover Mission',
      description: 'Read undercover mission briefings carefully!',
      story: 'Go undercover to gather evidence.',
      words: ['DISGUISE', 'IDENTITY', 'COVER', 'STEALTH', 'BLEND'],
      level: 11
    },
    {
      title: '⚖️ Court Evidence',
      description: 'Present evidence in court by reading legal documents!',
      story: 'Your evidence reading skills will prove innocence or guilt.',
      words: ['EVIDENCE', 'COURT', 'JUDGE', 'JURY', 'TRUTH'],
      level: 12
    },
    {
      title: '🏆 Master Detective',
      description: 'Solve the ultimate mystery and become a Master Detective!',
      story: 'The biggest case of your career awaits.',
      words: ['BRILLIANT', 'DEDUCTION', 'REVEAL', 'JUSTICE', 'SOLVED'],
      level: 15
    }
  ];

  // Combine all themed lessons
  const allThemes = [...spaceTheme, ...oceanTheme, ...safariTheme, ...superheroTheme, ...wizardTheme, ...detectiveTheme];
  
  allThemes.forEach((theme, index) => {
    const lessonId = `adventure-${index + 1}`;
    const exercises: Exercise[] = theme.words.map((word, wordIndex) => ({
      id: `${lessonId}-ex-${wordIndex + 1}`,
      type: 'braille-to-text' as const,
      question: `Read this word from your ${theme.title.split(' ')[0]} adventure:`,
      correctAnswer: word,
      braillePattern: word.split('').map(char => ({
        dots: braillePatterns[char.toUpperCase()] || [],
        char: char.toUpperCase()
      })),
      points: 15 + (theme.level * 2)
    }));

    // Add story context exercise
    exercises.push({
      id: `${lessonId}-story`,
      type: 'multiple-choice' as const,
      question: `In this adventure, you are: "${theme.story.substring(0, 50)}..."`,
      options: ['An explorer', 'A student', 'A hero', 'All of the above!'],
      correctAnswer: 'All of the above!',
      braillePattern: [],
      points: 10
    });

    adventureLessons.push({
      id: lessonId,
      title: theme.title,
      description: theme.description,
      level: theme.level,
      category: theme.level <= 5 ? 'basics' : theme.level <= 10 ? 'words' : theme.level <= 15 ? 'sentences' : 'contractions',
      duration: 20 + (theme.level * 2),
      exercises,
      prerequisites: index > 0 ? [`adventure-${index}`] : ['lesson-1']
    });
  });

  return adventureLessons;
};

// Export all lessons combined
export const lessons: Lesson[] = [...baseLessons, ...generateExtendedLessons(), ...generateThemedAdventureLessons()];

// Helper function to get lesson by ID
export const getLessonById = (id: string): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

// Helper function to get lessons by category
export const getLessonsByCategory = (category: string): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};

// Helper function to get lessons by level
export const getLessonsByLevel = (level: number): Lesson[] => {
  return lessons.filter(lesson => lesson.level === level);
};