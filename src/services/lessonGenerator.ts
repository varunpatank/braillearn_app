import { Category, Exercise, ExerciseType, Lesson } from '../types/lessons';

// Comprehensive braille patterns matching Arduino setup
const braillePatterns = {
  letters: [
    { char: 'A', dots: [1] }, { char: 'B', dots: [1, 2] }, { char: 'C', dots: [1, 4] },
    { char: 'D', dots: [1, 4, 5] }, { char: 'E', dots: [1, 5] }, { char: 'F', dots: [1, 2, 4] },
    { char: 'G', dots: [1, 2, 4, 5] }, { char: 'H', dots: [1, 2, 5] }, { char: 'I', dots: [2, 4] },
    { char: 'J', dots: [2, 4, 5] }, { char: 'K', dots: [1, 3] }, { char: 'L', dots: [1, 2, 3] },
    { char: 'M', dots: [1, 3, 4] }, { char: 'N', dots: [1, 3, 4, 5] }, { char: 'O', dots: [1, 3, 5] },
    { char: 'P', dots: [1, 2, 3, 4] }, { char: 'Q', dots: [1, 2, 3, 4, 5] }, { char: 'R', dots: [1, 2, 3, 5] },
    { char: 'S', dots: [2, 3, 4] }, { char: 'T', dots: [2, 3, 4, 5] }, { char: 'U', dots: [1, 3, 6] },
    { char: 'V', dots: [1, 2, 3, 6] }, { char: 'W', dots: [2, 4, 5, 6] }, { char: 'X', dots: [1, 3, 4, 6] },
    { char: 'Y', dots: [1, 3, 4, 5, 6] }, { char: 'Z', dots: [1, 3, 5, 6] }
  ],
  numbers: [
    { char: '1', dots: [1] }, { char: '2', dots: [1, 2] }, { char: '3', dots: [1, 4] },
    { char: '4', dots: [1, 4, 5] }, { char: '5', dots: [1, 5] }, { char: '6', dots: [1, 2, 4] },
    { char: '7', dots: [1, 2, 4, 5] }, { char: '8', dots: [1, 2, 5] }, { char: '9', dots: [2, 4] },
    { char: '0', dots: [2, 4, 5] }
  ],
  punctuation: [
    { char: '.', dots: [2, 5, 6] }, { char: ',', dots: [2] }, { char: ';', dots: [2, 3] },
    { char: ':', dots: [2, 5] }, { char: '!', dots: [2, 3, 5] }, { char: '?', dots: [2, 3, 6] },
    { char: "'", dots: [3] }, { char: '"', dots: [2, 3, 5, 6] }, { char: '-', dots: [3, 6] }
  ],
  contractions: [
    { char: 'AND', dots: [1, 2, 3, 4, 6] }, { char: 'FOR', dots: [1, 2, 3, 4, 5, 6] },
    { char: 'OF', dots: [1, 2, 3, 5, 6] }, { char: 'THE', dots: [2, 3, 4, 6] },
    { char: 'WITH', dots: [2, 3, 4, 5, 6] }, { char: 'CH', dots: [1, 6] },
    { char: 'GH', dots: [1, 2, 6] }, { char: 'SH', dots: [1, 4, 6] },
    { char: 'TH', dots: [1, 4, 5, 6] }, { char: 'WH', dots: [1, 5, 6] },
    { char: 'ED', dots: [1, 2, 4, 6] }, { char: 'ER', dots: [1, 2, 4, 5, 6] },
    { char: 'ING', dots: [3, 4, 6] }, { char: 'ST', dots: [3, 4] }
  ]
};

// Vocabulary banks for different levels
const vocabularyByLevel = {
  basic: ['CAT', 'DOG', 'SUN', 'HAT', 'RUN', 'BIG', 'RED', 'TOP', 'CUP', 'BOX'],
  intermediate: ['HOUSE', 'WATER', 'HAPPY', 'SCHOOL', 'FRIEND', 'FAMILY', 'COLOR', 'MUSIC', 'STORY', 'DREAM'],
  advanced: ['COMPUTER', 'EDUCATION', 'ENVIRONMENT', 'TECHNOLOGY', 'COMMUNICATION', 'INDEPENDENCE', 'ACCESSIBILITY', 'DEMOCRACY']
};

const sentenceTemplates = {
  simple: [
    'I {verb} {object}.',
    'The {noun} is {adjective}.',
    '{Name} has a {noun}.',
    'We {verb} at {place}.'
  ],
  complex: [
    'When I {verb}, I feel {adjective}.',
    'The {adjective} {noun} {verb} {adverb}.',
    'Because {reason}, we {action}.',
    'Although {condition}, {result}.'
  ]
};

// Generate comprehensive exercises for different types
const generateExercise = (level: number, lessonIndex: number, exerciseIndex: number, type: ExerciseType): Exercise => {
  const category = getLevelCategory(level);
  let pattern: { char: string; dots: number[] };
  let question: string;
  let options: string[] = [];
  let correctAnswer: string;

  switch (type) {
    case 'multiple-choice':
      if (category === 'basics') {
        pattern = braillePatterns.letters[exerciseIndex % braillePatterns.letters.length];
        question = `What letter does this braille pattern represent?`;
        options = [pattern.char, ...getRandomLetters(3, pattern.char)];
        correctAnswer = pattern.char;
      } else if (category === 'contractions') {
        pattern = braillePatterns.contractions[exerciseIndex % braillePatterns.contractions.length];
        question = `What contraction does this braille pattern represent?`;
        options = [pattern.char, ...getRandomContractions(3, pattern.char)];
        correctAnswer = pattern.char;
      } else {
        const word = vocabularyByLevel.basic[exerciseIndex % vocabularyByLevel.basic.length];
        pattern = { char: word, dots: [1, 2, 3] };
        question = `What word is spelled in braille?`;
        options = [word, ...getRandomWords(3, word, category)];
        correctAnswer = word;
      }
      break;

    case 'braille-to-text':
      const vocab = getVocabForLevel(level);
      const word = vocab[exerciseIndex % vocab.length];
      pattern = { char: word, dots: [1, 2, 3] };
      question = `Read this braille word:`;
      options = [];
      correctAnswer = word;
      break;

    case 'text-to-braille':
      pattern = braillePatterns.letters[exerciseIndex % braillePatterns.letters.length];
      question = `Form the braille pattern for "${pattern.char}":`;
      options = [];
      correctAnswer = pattern.char;
      break;

    default:
      pattern = braillePatterns.letters[0];
      question = 'Basic braille exercise';
      options = ['A', 'B', 'C', 'D'];
      correctAnswer = 'A';
  }

  return {
    id: `ex-${level}-${lessonIndex}-${exerciseIndex}-${type}`,
    type,
    question,
    options,
    correctAnswer,
    braillePattern: [pattern],
    points: calculatePoints(level, type)
  };
};

const getRandomLetters = (count: number, exclude: string): string[] => {
  const letters = braillePatterns.letters.map(p => p.char).filter(c => c !== exclude);
  return shuffleArray(letters).slice(0, count);
};

const getRandomContractions = (count: number, exclude: string): string[] => {
  const contractions = braillePatterns.contractions.map(p => p.char).filter(c => c !== exclude);
  return shuffleArray(contractions).slice(0, count);
};

const getRandomWords = (count: number, exclude: string, category: Category): string[] => {
  let wordBank = vocabularyByLevel.basic;
  if (category === 'words' || category === 'sentences') wordBank = vocabularyByLevel.intermediate;
  if (category === 'advanced') wordBank = vocabularyByLevel.advanced;
  
  return shuffleArray(wordBank.filter(w => w !== exclude)).slice(0, count);
};

const getVocabForLevel = (level: number): string[] => {
  if (level <= 10) return vocabularyByLevel.basic;
  if (level <= 20) return vocabularyByLevel.intermediate;
  return vocabularyByLevel.advanced;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const calculatePoints = (level: number, type: ExerciseType): number => {
  const basePoints = {
    'multiple-choice': 10,
    'braille-to-text': 15,
    'text-to-braille': 20,
    'match': 12,
    'speech-to-braille': 25
  };
  return basePoints[type] + (level * 2);
};

const getLevelCategory = (level: number): Category => {
  if (level <= 6) return 'basics';
  if (level <= 12) return 'words';
  if (level <= 18) return 'sentences';
  if (level <= 24) return 'contractions';
  return 'advanced';
};

// Comprehensive lesson themes and topics
const lessonThemes = {
  basics: [
    'Single Letters A-E', 'Letters F-J', 'Letters K-O', 'Letters P-T', 'Letters U-Z',
    'Numbers 1-5', 'Numbers 6-0', 'Basic Punctuation', 'Capital Letters', 'Letter Review'
  ],
  words: [
    'Common Sight Words', 'Action Words', 'Color Words', 'Animal Names', 'Food Words',
    'Family Words', 'Body Parts', 'Weather Words', 'Time Words', 'Place Words'
  ],
  sentences: [
    'Simple Statements', 'Questions', 'Commands', 'Descriptions', 'Stories',
    'Conversations', 'Instructions', 'Explanations', 'Opinions', 'Complex Sentences'
  ],
  contractions: [
    'Word Contractions', 'Letter Combinations', 'Common Contractions', 'Ending Contractions',
    'Beginning Contractions', 'Middle Contractions', 'Whole Word Contractions', 'Special Contractions'
  ],
  advanced: [
    'Technical Terms', 'Mathematical Notation', 'Music Braille', 'Foreign Languages',
    'Computer Terms', 'Scientific Terms', 'Literary Devices', 'Academic Writing',
    'Professional Communication', 'Specialized Vocabularies'
  ]
};

const generateLessonTitle = (level: number, index: number): string => {
  const category = getLevelCategory(level);
  const themes = lessonThemes[category];
  const themeIndex = Math.floor(index / 2) % themes.length;
  const variant = (index % 2) + 1;
  
  return `${themes[themeIndex]} - Part ${variant}`;
};

const generateLessonDescription = (level: number, title: string): string => {
  const category = getLevelCategory(level);
  const descriptions = {
    basics: 'Master fundamental braille patterns and build your foundation for reading.',
    words: 'Expand your vocabulary and learn to read complete words fluently.',
    sentences: 'Practice reading full sentences and develop comprehension skills.',
    contractions: 'Learn braille contractions to increase your reading speed and efficiency.',
    advanced: 'Develop specialized skills and tackle complex braille applications.'
  };
  
  return `${descriptions[category]} Focus: ${title.toLowerCase()}.`;
};

export const generateLessonContent = (level: number, index: number): Lesson => {
  const title = generateLessonTitle(level, index);
  const category = getLevelCategory(level);
  
  // Generate 4-8 exercises per lesson with variety
  const exerciseTypes: ExerciseType[] = ['multiple-choice', 'braille-to-text', 'text-to-braille', 'match'];
  const exerciseCount = Math.min(4 + Math.floor(level / 5), 8);
  
  const exercises = Array.from({ length: exerciseCount }, (_, i) => {
    const type = exerciseTypes[i % exerciseTypes.length];
    return generateExercise(level, index, i, type);
  });

  return {
    id: `lesson-${level}-${String(index + 1).padStart(2, '0')}`,
    title,
    description: generateLessonDescription(level, title),
    level,
    category,
    duration: 15 + (level * 2) + (exerciseCount * 3),
    exercises,
    prerequisites: level > 1 && index === 0 ? [`lesson-${level - 1}-01`] : 
                   index > 0 ? [`lesson-${level}-${String(index).padStart(2, '0')}`] : []
  };
};

export const generateLevelLessons = (level: number): Lesson[] => {
  // Generate 6-8 lessons per level for comprehensive coverage
  const lessonCount = 6 + Math.floor(level / 5); // 6-12 lessons per level
  return Array.from({ length: lessonCount }, (_, i) => 
    generateLessonContent(level, i)
  );
};

export const generateFullCurriculum = (): Lesson[] => {
  console.log('Generating comprehensive 30-level curriculum...');
  const allLessons: Lesson[] = [];
  
  for (let level = 1; level <= 30; level++) {
    const levelLessons = generateLevelLessons(level);
    allLessons.push(...levelLessons);
    console.log(`Generated ${levelLessons.length} lessons for Level ${level}`);
  }
  
  console.log(`Total lessons generated: ${allLessons.length}`);
  return allLessons;
};

// Customization functions for AI-driven reordering
export const customizeLessonOrder = (
  lessons: Lesson[], 
  focusArea: string, 
  learningStyle: string,
  difficulty: string
): Lesson[] => {
  let customized = [...lessons];
  
  // Sort by focus area preference
  if (focusArea === 'letters') {
    customized.sort((a, b) => {
      if (a.category === 'basics' && b.category !== 'basics') return -1;
      if (a.category !== 'basics' && b.category === 'basics') return 1;
      return a.level - b.level;
    });
  } else if (focusArea === 'contractions') {
    customized.sort((a, b) => {
      if (a.category === 'contractions' && b.category !== 'contractions') return -1;
      if (a.category !== 'contractions' && b.category === 'contractions') return 1;
      return a.level - b.level;
    });
  }
  
  // Adjust for learning style
  if (learningStyle === 'kinesthetic') {
    // Prefer hands-on exercises
    customized = customized.map(lesson => ({
      ...lesson,
      exercises: lesson.exercises.sort((a, b) => 
        a.type === 'text-to-braille' ? -1 : b.type === 'text-to-braille' ? 1 : 0
      )
    }));
  }
  
  // Adjust for difficulty
  if (difficulty === 'beginner') {
    customized = customized.filter(lesson => lesson.level <= 15);
  } else if (difficulty === 'advanced') {
    customized = customized.filter(lesson => lesson.level >= 10);
  }
  
  return customized;
};

export const generateCustomSchedule = (
  lessons: Lesson[],
  dailyTime: number,
  availableDays: string[],
  _goals: string // Prefix with underscore to indicate intentionally unused
): { week: number; lessons: Lesson[]; totalTime: number }[] => {
  const schedule = [];
  const lessonsPerDay = Math.floor(dailyTime / 30); // ~30 min per lesson
  const daysPerWeek = availableDays.length;
  const lessonsPerWeek = lessonsPerDay * daysPerWeek;
  
  for (let week = 1; week <= Math.ceil(lessons.length / lessonsPerWeek); week++) {
    const startIndex = (week - 1) * lessonsPerWeek;
    const weekLessons = lessons.slice(startIndex, startIndex + lessonsPerWeek);
    
    schedule.push({
      week,
      lessons: weekLessons,
      totalTime: weekLessons.reduce((sum, lesson) => sum + lesson.duration, 0)
    });
  }
  
  return schedule;
};
