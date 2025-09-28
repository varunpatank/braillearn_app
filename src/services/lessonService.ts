import { Category, Exercise, Lesson } from '../types/types';

export const standardLessons: Lesson[] = [
  // Level 1: Alphabet Basics
  {
    id: 'l1-alphabet',
    title: 'Introduction to Braille Alphabet',
    description: 'Learn the basics of braille alphabet and letter formation',
    level: 1,
    category: 'basics',
    duration: 20,
    exercises: [
      {
        id: 'ex-l1-1',
        type: 'multiple-choice',
        question: 'What letter does this braille pattern represent?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        braillePattern: [{ dots: [1], char: 'A' }],
        points: 10
      }
    ],
    prerequisites: []
  },
  {
    id: 'l1-numbers',
    title: 'Basic Numbers in Braille',
    description: 'Introduction to numbers 0-9 in braille',
    level: 1,
    category: 'basics',
    duration: 25,
    exercises: [
      {
        id: 'ex-l1-2',
        type: 'multiple-choice',
        question: 'What number does this braille pattern represent?',
        options: ['1', '2', '3', '4'],
        correctAnswer: '1',
        braillePattern: [{ dots: [1], char: '1' }],
        points: 10
      }
    ],
    prerequisites: []
  },
  // Add more standard lessons here...
];

export const generateLessonsForLevel = (level: number): Lesson[] => {
  const levelInfo = getLevelInfo(level);
  const lessons: Lesson[] = [];
  
  // Generate 5-10 lessons per level
  const lessonCount = Math.min(5 + Math.floor(level / 3), 10);
  
  for (let i = 0; i < lessonCount; i++) {
    lessons.push({
      id: `l${level}-${i + 1}`,
      title: `${levelInfo.title} - Lesson ${i + 1}`,
      description: generateDescription(level, i + 1),
      level,
      category: getLevelCategory(level),
      duration: 20 + (level * 2),
      exercises: generateExercises(level, i + 1),
      prerequisites: level > 1 ? [`l${level - 1}-1`] : []
    });
  }
  
  return lessons;
};

const getLevelInfo = (level: number) => {
  const titles = [
    'Alphabet Basics',
    'Numbers & Punctuation',
    'Simple Words',
    'Basic Sentences',
    'Common Contractions',
    'Advanced Words',
    'Complex Sentences',
    'Literature Reading',
    'Technical Braille',
    'Professional Writing'
  ];
  
  return {
    title: titles[Math.min(level - 1, titles.length - 1)],
    description: `Level ${level} braille mastery`
  };
};

const generateDescription = (level: number, lesson: number): string => {
  const topics = [
    'letter recognition',
    'number patterns',
    'word formation',
    'sentence structure',
    'contraction usage',
    'speed reading',
    'composition',
    'technical notation'
  ];
  
  const topic = topics[Math.min(Math.floor((level - 1) / 4), topics.length - 1)];
  return `Master ${topic} through interactive exercises and practical examples.`;
};

const getLevelCategory = (level: number): Category => {
  if (level <= 5) return 'basics';
  if (level <= 10) return 'words';
  if (level <= 15) return 'sentences';
  if (level <= 20) return 'contractions';
  return 'advanced';
};

const generateExercises = (level: number, lesson: number): Exercise[] => {
  const types = ['multiple-choice', 'braille-to-text', 'text-to-braille', 'match', 'speech-to-braille'] as const;
  const exercises: Exercise[] = [];
  
  // Generate 2-5 exercises per lesson
  const exerciseCount = Math.min(2 + Math.floor(level / 5), 5);
  
  for (let i = 0; i < exerciseCount; i++) {
    exercises.push({
      id: `ex-l${level}-${lesson}-${i + 1}`,
      type: types[i % types.length],
      question: generateQuestion(level, lesson, i),
      options: generateOptions(level, lesson, i),
      correctAnswer: 'A', // This would be set appropriately in a real implementation
      braillePattern: [{ dots: [1, 2], char: 'Sample' }],
      points: 10 + (level * 2)
    });
  }
  
  return exercises;
};

const generateQuestion = (level: number, lesson: number, exercise: number): string => {
  const questions = [
    'What letter does this braille pattern represent?',
    'Convert this braille pattern to text',
    'What word is formed by these dots?',
    'Match the braille pattern to its meaning',
    'Read the following braille sentence'
  ];
  
  return questions[exercise % questions.length];
};

const generateOptions = (level: number, lesson: number, exercise: number): string[] => {
  const optionSets = [
    ['A', 'B', 'C', 'D'],
    ['Cat', 'Dog', 'Bird', 'Fish'],
    ['First', 'Second', 'Third', 'Fourth'],
    ['1', '2', '3', '4'],
    ['Yes', 'No', 'Maybe', 'Sometimes']
  ];
  
  return optionSets[exercise % optionSets.length];
};
