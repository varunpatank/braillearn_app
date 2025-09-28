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
        id: 'paragraph-reading',
        type: 'braille-to-text',
        question: 'Read this complete paragraph:',
        correctAnswer: 'The cat sat on the mat. It was a sunny day. The children were playing in the park.',
        braillePattern: [
          // This would be a long array representing the entire paragraph
          { dots: braillePatterns['THE'], char: 'THE' },
          { dots: [], char: ' ' },
          { dots: braillePatterns['C'], char: 'C' },
          { dots: braillePatterns['A'], char: 'A' },
          { dots: braillePatterns['T'], char: 'T' },
          // ... (abbreviated for brevity)
        ],
        points: 60
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
        question: 'Read this passage as quickly as possible:',
        correctAnswer: 'Quick brown fox jumps over lazy dog.',
        braillePattern: [
          // Speed reading passage
        ],
        points: 30
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
        id: 'poetry-reading',
        type: 'braille-to-text',
        question: 'Read this line of poetry:',
        correctAnswer: 'Roses are red, violets are blue.',
        braillePattern: [
          // Poetry line in braille
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
        id: 'master-assessment',
        type: 'braille-to-text',
        question: 'Read this complex passage demonstrating all your skills:',
        correctAnswer: 'Congratulations! You have mastered braille reading. This achievement opens doors to literacy and independence.',
        braillePattern: [
          // Complex passage using all learned elements
        ],
        points: 100
      }
    ],
    prerequisites: ['lesson-49']
  }
];

// Generate extended lessons for levels 6-30
const generateExtendedLessons = (): Lesson[] => {
  const extendedLessons: Lesson[] = [];
  
  for (let level = 6; level <= 30; level++) {
    const lessonsPerLevel = Math.min(5 + Math.floor(level / 5), 10);
    
    for (let i = 0; i < lessonsPerLevel; i++) {
      const lessonNumber = (level - 1) * 10 + i + 1;
      
      extendedLessons.push({
        id: `lesson-${lessonNumber}`,
        title: `Level ${level} - Advanced Skills ${i + 1}`,
        description: `Master advanced braille techniques and specialized patterns for level ${level}`,
        level: level,
        category: level <= 10 ? 'basics' : level <= 15 ? 'words' : level <= 20 ? 'sentences' : level <= 25 ? 'contractions' : 'advanced',
        duration: 20 + (level * 2),
        exercises: [
          {
            id: `ex-${lessonNumber}`,
            type: 'multiple-choice',
            question: `Advanced level ${level} braille challenge`,
            options: ['Pattern A', 'Pattern B', 'Pattern C', 'Pattern D'],
            correctAnswer: 'Pattern A',
            braillePattern: [{ dots: [1, 2, 3], char: 'Advanced' }],
            points: 15 + level
          }
        ],
        prerequisites: level > 6 ? [`lesson-${lessonNumber - 10}`] : ['lesson-50']
      });
    }
  }
  
  return extendedLessons;
};

export const lessons: Lesson[] = [...baseLessons, ...generateExtendedLessons()];

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