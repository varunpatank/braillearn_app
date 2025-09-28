import { Category, Exercise, ExerciseType, Lesson } from '../types/lessons';

const standardPatterns = {
  letters: [
    { char: 'A', dots: [1] },
    { char: 'B', dots: [1, 2] },
    { char: 'C', dots: [1, 4] },
    { char: 'D', dots: [1, 4, 5] },
    { char: 'E', dots: [1, 5] },
    { char: 'F', dots: [1, 2, 4] },
    { char: 'G', dots: [1, 2, 4, 5] },
    { char: 'H', dots: [1, 2, 5] },
    { char: 'I', dots: [2, 4] },
    { char: 'J', dots: [2, 4, 5] }
  ],
  numbers: [
    { char: '1', dots: [1] },
    { char: '2', dots: [1, 2] },
    { char: '3', dots: [1, 4] },
    { char: '4', dots: [1, 4, 5] },
    { char: '5', dots: [1, 5] },
    { char: '6', dots: [1, 2, 4] },
    { char: '7', dots: [1, 2, 4, 5] },
    { char: '8', dots: [1, 2, 5] },
    { char: '9', dots: [2, 4] },
    { char: '0', dots: [2, 4, 5] }
  ],
  punctuation: [
    { char: '.', dots: [2, 5, 6] },
    { char: ',', dots: [2] },
    { char: ';', dots: [2, 3] },
    { char: ':', dots: [2, 5] },
    { char: '!', dots: [2, 3, 5] }
  ]
};

const generatePattern = (level: number, index: number) => {
  if (level <= 10) {
    return standardPatterns.letters[index % standardPatterns.letters.length];
  } else if (level <= 20) {
    return standardPatterns.numbers[index % standardPatterns.numbers.length];
  } else {
    return standardPatterns.punctuation[index % standardPatterns.punctuation.length];
  }
};

const generateExercise = (level: number, lessonIndex: number, exerciseIndex: number): Exercise => {
  const types: ExerciseType[] = ['multiple-choice', 'braille-to-text', 'text-to-braille', 'match', 'speech-to-braille'];
  const pattern = generatePattern(level, exerciseIndex);
  
  return {
    id: `ex-${level}-${lessonIndex}-${exerciseIndex}`,
    type: types[exerciseIndex % types.length],
    question: `What does this braille pattern represent? ${pattern.char}`,
    options: ['A', 'B', 'C', 'D'].map(opt => 
      opt === 'A' ? pattern.char : standardPatterns.letters[(exerciseIndex + opt.charCodeAt(0)) % standardPatterns.letters.length].char
    ),
    correctAnswer: pattern.char,
    braillePattern: [pattern],
    points: 10 + (level * 2)
  };
};

const getLevelCategory = (level: number): Category => {
  if (level <= 6) return 'basics';
  if (level <= 12) return 'words';
  if (level <= 18) return 'sentences';
  if (level <= 24) return 'contractions';
  return 'advanced';
};

const generateLessonTitle = (level: number, index: number): string => {
  const category = getLevelCategory(level);
  const titles = {
    basics: [
      'Introduction to Letters',
      'Basic Letter Patterns',
      'Letter Recognition',
      'Simple Letter Combinations',
      'Letter Practice'
    ],
    words: [
      'Common Words',
      'Word Formation',
      'Word Recognition',
      'Word Patterns',
      'Word Practice'
    ],
    sentences: [
      'Simple Sentences',
      'Sentence Structure',
      'Reading Flow',
      'Sentence Building',
      'Sentence Practice'
    ],
    contractions: [
      'Basic Contractions',
      'Common Contractions',
      'Contraction Rules',
      'Advanced Contractions',
      'Contraction Practice'
    ],
    advanced: [
      'Advanced Patterns',
      'Complex Structures',
      'Speed Reading',
      'Technical Braille',
      'Professional Writing'
    ]
  };

  return `${titles[category][index % titles[category].length]} - Level ${level}`;
};

export const generateLessonContent = (level: number, index: number): Lesson => {
  const exerciseCount = Math.min(3 + Math.floor(level / 5), 7); // 3-7 exercises per lesson
  
  return {
    id: `lesson-${level}-${index}`,
    title: generateLessonTitle(level, index),
    description: `Master ${getLevelCategory(level)} braille patterns and improve your reading skills.`,
    level,
    category: getLevelCategory(level),
    duration: 15 + (level * 2),
    exercises: Array.from({ length: exerciseCount }, (_, i) => 
      generateExercise(level, index, i)
    ),
    prerequisites: level > 1 ? [`lesson-${level - 1}-${index}`] : []
  };
};

export const generateLevelLessons = (level: number): Lesson[] => {
  const lessonCount = Math.min(4 + Math.floor(level / 3), 8); // 4-8 lessons per level
  return Array.from({ length: lessonCount }, (_, i) => 
    generateLessonContent(level, i)
  );
};

export const generateFullCurriculum = (): Lesson[] => {
  const allLessons: Lesson[] = [];
  for (let level = 1; level <= 30; level++) {
    allLessons.push(...generateLevelLessons(level));
  }
  return allLessons;
};
