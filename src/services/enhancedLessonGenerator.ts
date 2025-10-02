import { Lesson, Exercise } from '../types/types';

// Comprehensive Braille patterns matching the Arduino experiment code EXACTLY
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

// Enhanced vocabulary banks for comprehensive lessons
const vocabularyBanks = {
  basicLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  basicWords: ['CAT', 'DOG', 'SUN', 'BAT', 'HAT', 'RUN', 'FUN', 'BOY', 'GIRL', 'BOOK', 'TREE', 'FISH', 'BIRD', 'HAND', 'FOOT'],
  sightWords: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'],
  actionWords: ['RUN', 'JUMP', 'WALK', 'SING', 'DANCE', 'PLAY', 'READ', 'WRITE', 'DRAW', 'SWIM', 'CLIMB', 'THROW', 'CATCH', 'PUSH', 'PULL', 'LIFT', 'CARRY', 'MOVE', 'STOP', 'START'],
  colorWords: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'WHITE', 'PINK', 'PURPLE', 'ORANGE', 'BROWN', 'GRAY', 'SILVER', 'GOLD'],
  animalNames: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'BEAR', 'FROG', 'DUCK', 'HORSE', 'COW', 'PIG', 'SHEEP', 'GOAT', 'RABBIT', 'MOUSE', 'ELEPHANT', 'TIGER', 'MONKEY', 'SNAKE', 'TURTLE'],
  familyWords: ['MOM', 'DAD', 'SON', 'DAUGHTER', 'GIRL', 'BOY', 'BABY', 'SISTER', 'BROTHER', 'GRANDMA', 'GRANDPA', 'AUNT', 'UNCLE', 'COUSIN'],
  foodWords: ['BREAD', 'MILK', 'MEAT', 'FRUIT', 'CAKE', 'SOUP', 'RICE', 'EGGS', 'CHEESE', 'BUTTER', 'SUGAR', 'SALT', 'PEPPER', 'WATER', 'JUICE', 'TEA', 'COFFEE'],
  bodyParts: ['HEAD', 'HAIR', 'EYE', 'NOSE', 'MOUTH', 'EAR', 'NECK', 'ARM', 'HAND', 'FINGER', 'LEG', 'FOOT', 'TOE', 'BACK', 'CHEST'],
  homeWords: ['HOUSE', 'ROOM', 'DOOR', 'WINDOW', 'TABLE', 'CHAIR', 'BED', 'KITCHEN', 'BATHROOM', 'GARAGE', 'YARD', 'GARDEN'],
  schoolWords: ['SCHOOL', 'TEACHER', 'STUDENT', 'BOOK', 'PENCIL', 'PEN', 'PAPER', 'DESK', 'CHAIR', 'BOARD', 'CLASS', 'LESSON', 'HOMEWORK'],
  contractions: ['AND', 'FOR', 'OF', 'THE', 'WITH', 'CH', 'SH', 'TH', 'GH', 'WH', 'ED', 'ER', 'ING', 'OU', 'OW', 'ST', 'AR'],
  advancedWords: ['COMPUTER', 'INTERNET', 'SOFTWARE', 'HARDWARE', 'PROGRAM', 'DATABASE', 'TECHNOLOGY', 'SCIENCE', 'MATHEMATICS', 'LITERATURE', 'HISTORY', 'GEOGRAPHY'],
  emotionWords: ['HAPPY', 'SAD', 'ANGRY', 'EXCITED', 'SCARED', 'SURPRISED', 'WORRIED', 'CALM', 'PROUD', 'GRATEFUL', 'CONFUSED', 'TIRED'],
  weatherWords: ['SUN', 'RAIN', 'SNOW', 'WIND', 'CLOUD', 'STORM', 'HOT', 'COLD', 'WARM', 'COOL', 'WET', 'DRY'],
  timeWords: ['DAY', 'NIGHT', 'MORNING', 'AFTERNOON', 'EVENING', 'HOUR', 'MINUTE', 'SECOND', 'WEEK', 'MONTH', 'YEAR', 'TODAY', 'TOMORROW', 'YESTERDAY']
};

// Generate exercises for each lesson type
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
        braillePattern: [{ dots: braillePatterns[content.letter] || [], char: content.letter }],
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
            dots: braillePatterns[char.toUpperCase()] || [], 
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
        braillePattern: [{ dots: braillePatterns[content.contraction] || [], char: content.contraction }],
        points: 25
      });
      break;

    case 'mixed-practice':
      // Generate a mix of different exercise types
      const randomWords = content.words.slice(0, 3);
      randomWords.forEach((word: string, index: number) => {
        exercises.push({
          id: `mixed-${index}`,
          type: 'braille-to-text',
          question: `Read this word:`,
          correctAnswer: word,
          braillePattern: word.split('').map(char => ({ 
            dots: braillePatterns[char.toUpperCase()] || [], 
            char: char.toUpperCase() 
          })),
          points: 15
        });
      });
      break;

    case 'comprehension':
      exercises.push({
        id: 'comprehension',
        type: 'multiple-choice',
        question: content.question,
        options: content.options,
        correctAnswer: content.correctAnswer,
        braillePattern: content.passage.split('').map((char: string) => ({ 
          dots: braillePatterns[char.toUpperCase()] || [], 
          char: char === ' ' ? ' ' : char.toUpperCase() 
        })),
        points: 35
      });
      break;
  }
  
  return exercises;
};

// Generate comprehensive lesson database with ~300 lessons across 30 levels
export const generateFullCurriculum = (): Lesson[] => {
  const lessons: Lesson[] = [];
  let lessonCounter = 1;

  // LEVEL 1: Basic Letters (Lessons 1-15)
  const basicLetterGroups = [
    { letters: ['A'], title: 'Letter A', description: 'Learn the braille pattern for the letter A - the foundation of braille reading' },
    { letters: ['B'], title: 'Letter B', description: 'Master the letter B and distinguish it from A' },
    { letters: ['C'], title: 'Letter C', description: 'Learn letter C and practice A-B-C recognition' },
    { letters: ['D', 'E'], title: 'Letters D and E', description: 'Expand your alphabet knowledge with D and E' },
    { letters: ['F', 'G', 'H'], title: 'Letters F, G, H', description: 'Continue building your braille alphabet foundation' },
    { letters: ['I', 'J'], title: 'Letters I and J', description: 'Learn the unique patterns of I and J' },
    { letters: ['K', 'L', 'M'], title: 'Letters K, L, M', description: 'Master the second row patterns K, L, and M' },
    { letters: ['N', 'O', 'P'], title: 'Letters N, O, P', description: 'Continue with N, O, and P patterns' },
    { letters: ['Q', 'R', 'S'], title: 'Letters Q, R, S', description: 'Learn the complex patterns of Q, R, and S' },
    { letters: ['T', 'U', 'V'], title: 'Letters T, U, V', description: 'Master T, U, and V patterns' },
    { letters: ['W', 'X'], title: 'Letters W and X', description: 'Learn the bottom-row letters W and X' },
    { letters: ['Y', 'Z'], title: 'Letters Y and Z', description: 'Complete the alphabet with Y and Z' },
    { letters: ['A', 'B', 'C', 'D', 'E'], title: 'Review A-E', description: 'Comprehensive review of first five letters' },
    { letters: ['F', 'G', 'H', 'I', 'J'], title: 'Review F-J', description: 'Practice letters F through J' },
    { letters: vocabularyBanks.basicLetters, title: 'Full Alphabet Review', description: 'Master all 26 letters of the alphabet' }
  ];

  basicLetterGroups.forEach((group, index) => {
    const exercises: Exercise[] = [];
    group.letters.forEach(letter => {
      const distractors = vocabularyBanks.basicLetters.filter(l => l !== letter).slice(0, 3);
      exercises.push(...generateExercises('letter-recognition', { letter, distractors }));
    });

    lessons.push({
      id: `lesson-${lessonCounter}`,
      title: group.title,
      description: group.description,
      level: 1,
      category: 'basics',
      duration: 10 + (index * 2),
      exercises,
      prerequisites: lessonCounter > 1 ? [`lesson-${lessonCounter - 1}`] : []
    });
    lessonCounter++;
  });

  // LEVEL 2: Numbers and Basic Punctuation (Lessons 16-25)
  const numberLessons = [
    { content: ['1', '2', '3'], title: 'Numbers 1-3', description: 'Learn your first braille numbers' },
    { content: ['4', '5', '6'], title: 'Numbers 4-6', description: 'Continue with numbers 4, 5, and 6' },
    { content: ['7', '8', '9'], title: 'Numbers 7-9', description: 'Master numbers 7, 8, and 9' },
    { content: ['0'], title: 'Number 0', description: 'Learn the braille pattern for zero' },
    { content: vocabularyBanks.numbers, title: 'All Numbers Review', description: 'Practice all numbers 0-9' },
    { content: ['.', ','], title: 'Period and Comma', description: 'Essential punctuation marks' },
    { content: ['?', '!'], title: 'Question and Exclamation', description: 'Expressive punctuation' },
    { content: ['"', "'"], title: 'Quotes and Apostrophe', description: 'Quotation marks and contractions' },
    { content: [':', ';', '-'], title: 'Advanced Punctuation', description: 'Colon, semicolon, and hyphen' },
    { content: [...vocabularyBanks.numbers, '.', ',', '?', '!'], title: 'Numbers & Punctuation Review', description: 'Comprehensive review of numbers and basic punctuation' }
  ];

  numberLessons.forEach((lesson, index) => {
    const exercises: Exercise[] = [];
    lesson.content.forEach(item => {
      if (vocabularyBanks.numbers.includes(item)) {
        const distractors = vocabularyBanks.numbers.filter(n => n !== item).slice(0, 3);
        exercises.push(...generateExercises('letter-recognition', { letter: item, distractors }));
      } else {
        const punctuationOptions = ['.', ',', '?', '!', '"', "'", ':', ';', '-'];
        const distractors = punctuationOptions.filter(p => p !== item).slice(0, 3);
        exercises.push(...generateExercises('letter-recognition', { letter: item, distractors }));
      }
    });

    lessons.push({
      id: `lesson-${lessonCounter}`,
      title: lesson.title,
      description: lesson.description,
      level: 2,
      category: 'basics',
      duration: 15 + index,
      exercises,
      prerequisites: [`lesson-${lessonCounter - 1}`]
    });
    lessonCounter++;
  });

  // LEVEL 3: Simple Words (Lessons 26-40)
  const wordCategories = [
    { words: vocabularyBanks.basicWords.slice(0, 5), title: '3-Letter Words Part 1', description: 'Start reading complete words' },
    { words: vocabularyBanks.basicWords.slice(5, 10), title: '3-Letter Words Part 2', description: 'More simple three-letter words' },
    { words: vocabularyBanks.basicWords.slice(10, 15), title: '4-Letter Words', description: 'Progress to longer words' },
    { words: vocabularyBanks.sightWords.slice(0, 6), title: 'Sight Words 1', description: 'Most common English words' },
    { words: vocabularyBanks.sightWords.slice(6, 12), title: 'Sight Words 2', description: 'Essential vocabulary words' },
    { words: vocabularyBanks.colorWords.slice(0, 6), title: 'Color Words', description: 'Learn to read color names' },
    { words: vocabularyBanks.animalNames.slice(0, 8), title: 'Animal Names 1', description: 'Common animal words' },
    { words: vocabularyBanks.animalNames.slice(8, 16), title: 'Animal Names 2', description: 'More animal vocabulary' },
    { words: vocabularyBanks.familyWords.slice(0, 7), title: 'Family Words', description: 'Family relationship terms' },
    { words: vocabularyBanks.actionWords.slice(0, 8), title: 'Action Words 1', description: 'Common verbs and actions' },
    { words: vocabularyBanks.actionWords.slice(8, 16), title: 'Action Words 2', description: 'More action vocabulary' },
    { words: vocabularyBanks.foodWords.slice(0, 8), title: 'Food Words 1', description: 'Common food vocabulary' },
    { words: vocabularyBanks.foodWords.slice(8, 16), title: 'Food Words 2', description: 'More food terms' },
    { words: vocabularyBanks.bodyParts.slice(0, 8), title: 'Body Parts', description: 'Learn body part vocabulary' },
    { words: [...vocabularyBanks.basicWords.slice(0, 10), ...vocabularyBanks.sightWords.slice(0, 5)], title: 'Mixed Word Review', description: 'Review all learned words' }
  ];

  wordCategories.forEach((category, index) => {
    lessons.push({
      id: `lesson-${lessonCounter}`,
      title: category.title,
      description: category.description,
      level: 3,
      category: 'words',
      duration: 20 + index,
      exercises: generateExercises('word-reading', { words: category.words }),
      prerequisites: [`lesson-${lessonCounter - 1}`]
    });
    lessonCounter++;
  });

  // Continue with more levels...
  // LEVEL 4: Simple Sentences (Lessons 41-55)
  const simpleSentences = [
    'I am happy.',
    'You are nice.',
    'We can play.',
    'The cat is big.',
    'I like dogs.',
    'She has a book.',
    'He runs fast.',
    'We eat food.',
    'The sun is hot.',
    'I see a bird.',
    'You have a car.',
    'The book is red.',
    'I can read.',
    'She is my mom.',
    'We go to school.'
  ];

  simpleSentences.forEach((sentence, index) => {
    lessons.push({
      id: `lesson-${lessonCounter}`,
      title: `Simple Sentence ${index + 1}`,
      description: `Practice reading: "${sentence}"`,
      level: 4,
      category: 'sentences',
      duration: 25 + index,
      exercises: generateExercises('sentence-reading', { sentence }),
      prerequisites: [`lesson-${lessonCounter - 1}`]
    });
    lessonCounter++;
  });

  // LEVEL 5: Contractions (Lessons 56-70)
  const contractionLessons = [
    { contractions: ['AND'], title: 'Contraction: AND', description: 'Learn the AND contraction' },
    { contractions: ['FOR'], title: 'Contraction: FOR', description: 'Master the FOR contraction' },
    { contractions: ['OF'], title: 'Contraction: OF', description: 'Learn the OF contraction' },
    { contractions: ['THE'], title: 'Contraction: THE', description: 'Master the THE contraction' },
    { contractions: ['WITH'], title: 'Contraction: WITH', description: 'Learn the WITH contraction' },
    { contractions: ['CH'], title: 'Letter Combination: CH', description: 'Master CH combination' },
    { contractions: ['SH'], title: 'Letter Combination: SH', description: 'Learn SH combination' },
    { contractions: ['TH'], title: 'Letter Combination: TH', description: 'Master TH combination' },
    { contractions: ['GH'], title: 'Letter Combination: GH', description: 'Learn GH combination' },
    { contractions: ['WH'], title: 'Letter Combination: WH', description: 'Master WH combination' },
    { contractions: ['ED'], title: 'Ending: ED', description: 'Learn ED ending contraction' },
    { contractions: ['ER'], title: 'Ending: ER', description: 'Master ER ending contraction' },
    { contractions: ['ING'], title: 'Ending: ING', description: 'Learn ING ending contraction' },
    { contractions: ['ST'], title: 'Combination: ST', description: 'Master ST combination' },
    { contractions: ['AR'], title: 'Combination: AR', description: 'Learn AR combination' }
  ];

  contractionLessons.forEach((lesson, index) => {
    const exercises: Exercise[] = [];
    lesson.contractions.forEach(contraction => {
      const distractors = vocabularyBanks.contractions.filter(c => c !== contraction).slice(0, 3);
      exercises.push(...generateExercises('contraction-recognition', { contraction, distractors }));
    });

    lessons.push({
      id: `lesson-${lessonCounter}`,
      title: lesson.title,
      description: lesson.description,
      level: 5,
      category: 'contractions',
      duration: 30 + index,
      exercises,
      prerequisites: [`lesson-${lessonCounter - 1}`]
    });
    lessonCounter++;
  });

  // Generate extended lessons for levels 6-30 (Lessons 71-300)
  for (let level = 6; level <= 30; level++) {
    const lessonsPerLevel = Math.min(8 + Math.floor(level / 5), 12);
    
    for (let i = 0; i < lessonsPerLevel; i++) {
      const categories = ['advanced', 'comprehension', 'writing', 'technical', 'literature'];
      const category = categories[i % categories.length];
      
      let exercises: Exercise[] = [];
      let title = '';
      let description = '';
      
      switch (category) {
        case 'advanced':
          const advancedWords = [...vocabularyBanks.advancedWords, ...vocabularyBanks.emotionWords, ...vocabularyBanks.weatherWords].slice(i * 3, (i * 3) + 6);
          title = `Level ${level} - Advanced Vocabulary ${i + 1}`;
          description = `Master complex vocabulary and specialized terms`;
          exercises = generateExercises('word-reading', { words: advancedWords });
          break;
          
        case 'comprehension':
          title = `Level ${level} - Reading Comprehension ${i + 1}`;
          description = `Advanced reading comprehension and analysis`;
          exercises = generateExercises('comprehension', {
            passage: 'The quick brown fox jumps over the lazy dog.',
            question: 'What animal jumps in this sentence?',
            options: ['Fox', 'Dog', 'Cat', 'Bird'],
            correctAnswer: 'Fox'
          });
          break;
          
        case 'writing':
          title = `Level ${level} - Writing Practice ${i + 1}`;
          description = `Practice braille writing and formation skills`;
          const writingWords = vocabularyBanks.timeWords.slice(i * 2, (i * 2) + 4);
          exercises = generateExercises('mixed-practice', { words: writingWords });
          break;
          
        case 'technical':
          title = `Level ${level} - Technical Reading ${i + 1}`;
          description = `Specialized technical and scientific vocabulary`;
          const techWords = vocabularyBanks.schoolWords.slice(i * 3, (i * 3) + 5);
          exercises = generateExercises('word-reading', { words: techWords });
          break;
          
        case 'literature':
          title = `Level ${level} - Literary Text ${i + 1}`;
          description = `Advanced literary passages and poetry`;
          exercises = generateExercises('sentence-reading', { 
            sentence: `Beautiful words create lasting memories and meaningful connections.`
          });
          break;
      }

      lessons.push({
        id: `lesson-${lessonCounter}`,
        title,
        description,
        level,
        category: category as 'advanced' | 'basics' | 'words' | 'sentences' | 'contractions',
        duration: 25 + (level * 2) + (i * 3),
        exercises,
        prerequisites: lessonCounter > 1 ? [`lesson-${lessonCounter - 1}`] : []
      });
      lessonCounter++;
    }
  }

  console.log(`Generated ${lessons.length} comprehensive lessons across ${Math.max(...lessons.map(l => l.level))} levels`);
  return lessons;
};

// Helper functions for lesson management
export const getLessonById = (id: string, lessons: Lesson[]): Lesson | undefined => {
  return lessons.find(lesson => lesson.id === id);
};

export const getLessonsByCategory = (category: string, lessons: Lesson[]): Lesson[] => {
  return lessons.filter(lesson => lesson.category === category);
};

export const getLessonsByLevel = (level: number, lessons: Lesson[]): Lesson[] => {
  return lessons.filter(lesson => lesson.level === level);
};

export const getProgressStats = (lessons: Lesson[], completedLessons: string[]) => {
  const totalLessons = lessons.length;
  const completed = completedLessons.length;
  const overallProgress = Math.round((completed / totalLessons) * 100);
  
  const levelStats = Array.from({length: 30}, (_, i) => {
    const level = i + 1;
    const levelLessons = lessons.filter(l => l.level === level);
    const levelCompleted = levelLessons.filter(l => completedLessons.includes(l.id)).length;
    const levelProgress = levelLessons.length > 0 ? Math.round((levelCompleted / levelLessons.length) * 100) : 0;
    
    return {
      level,
      totalLessons: levelLessons.length,
      completedLessons: levelCompleted,
      progress: levelProgress
    };
  });
  
  return {
    totalLessons,
    completedLessons: completed,
    overallProgress,
    levelStats
  };
};

// Customize lesson order based on user preferences
export const customizeLessonOrder = (
  lessons: Lesson[], 
  focusAreas: string, 
  learningStyle: string, 
  difficulty: string
): Lesson[] => {
  let customizedLessons = [...lessons];
  
  // Sort by focus areas
  const focusWeight = (lesson: Lesson) => {
    if (focusAreas.includes(lesson.category)) return 3;
    if (focusAreas.includes('letters') && lesson.category === 'basics') return 2;
    if (focusAreas.includes('words') && lesson.category === 'words') return 2;
    return 1;
  };
  
  // Sort by learning style preferences
  const styleWeight = (lesson: Lesson) => {
    if (learningStyle === 'visual' && lesson.exercises.some(e => e.type === 'braille-to-text')) return 2;
    if (learningStyle === 'auditory' && lesson.exercises.some(e => e.type === 'speech-to-braille')) return 2;
    if (learningStyle === 'tactile' && lesson.category === 'basics') return 2;
    return 1;
  };
  
  // Sort by difficulty preference
  const difficultyWeight = (lesson: Lesson) => {
    if (difficulty === 'beginner' && lesson.level <= 10) return 2;
    if (difficulty === 'intermediate' && lesson.level > 5 && lesson.level <= 20) return 2;
    if (difficulty === 'advanced' && lesson.level > 15) return 2;
    return 1;
  };
  
  customizedLessons.sort((a, b) => {
    const aScore = focusWeight(a) + styleWeight(a) + difficultyWeight(a);
    const bScore = focusWeight(b) + styleWeight(b) + difficultyWeight(b);
    
    if (aScore !== bScore) return bScore - aScore;
    return a.level - b.level; // Fallback to level order
  });
  
  return customizedLessons;
};

// Generate custom study schedule
export const generateCustomSchedule = (
  lessons: Lesson[],
  dailyTimeAvailable: number,
  availableDays: string[],
  studyGoals: string
): Array<{week: number, lessons: Lesson[], totalTime: number}> => {
  const schedule = [];
  const lessonsPerWeek = Math.ceil(availableDays.length * (dailyTimeAvailable / 20)); // Assuming 20 min per lesson
  
  let currentWeek = 1;
  let currentLessons: Lesson[] = [];
  let currentTime = 0;
  
  for (const lesson of lessons) {
    if (currentLessons.length >= lessonsPerWeek || currentTime + lesson.duration > dailyTimeAvailable * availableDays.length) {
      if (currentLessons.length > 0) {
        schedule.push({
          week: currentWeek,
          lessons: [...currentLessons],
          totalTime: currentTime
        });
        currentWeek++;
        currentLessons = [];
        currentTime = 0;
      }
    }
    
    currentLessons.push(lesson);
    currentTime += lesson.duration;
  }
  
  // Add remaining lessons
  if (currentLessons.length > 0) {
    schedule.push({
      week: currentWeek,
      lessons: currentLessons,
      totalTime: currentTime
    });
  }
  
  return schedule;
};