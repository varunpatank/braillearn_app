// User-related types
export interface User {
  id: string;
  name: string;
  email: string;
  progress: {
    level: number;
    experience: number;
    streak: number;
    lastActive: string;
  };
  preferences: {
    theme?: 'light' | 'dark' | 'high-contrast';
    fontSize?: 'small' | 'medium' | 'large';
    audioFeedback: boolean;
    arduinoMode: boolean;
    profileColor?: string;
    dailyGoal?: number;
    learningGoal?: string;
    experienceLevel?: string;
  };
}

// Lesson-related types
export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  category: 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced';
  duration: number; // in minutes
  exercises: Exercise[];
  prerequisites: string[]; // IDs of prerequisite lessons
}

// Scheduled lesson with dates and completion tracking
export interface ScheduledLesson extends Lesson {
  scheduledDate: string; // ISO date string
  isCompleted: boolean;
  completedDate?: string; // ISO date string when completed
  score?: number; // 0-100
  attempts?: number;
  notes?: string; // User or AI generated notes
  canReschedule: boolean; // Whether AI can move this lesson
  priority: 'low' | 'medium' | 'high';
  estimatedCompletionTime?: number; // in minutes
  adaptiveDifficulty?: 'easy' | 'normal' | 'hard'; // AI-adjusted difficulty
}

// Study plan with AI management capabilities
export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  totalLessons: number;
  scheduledLessons: ScheduledLesson[];
  startDate: string;
  targetEndDate: string;
  currentStreak: number;
  weeklyGoal: number; // lessons per week
  isActive: boolean;
  aiManaged: boolean; // Whether AI can automatically adjust
  lastAIOptimization?: string; // Last time AI reorganized the plan
  preferences: {
    preferredTimeSlots: string[]; // ['morning', 'afternoon', 'evening']
    maxLessonsPerDay: number;
    difficultyProgression: 'gradual' | 'moderate' | 'aggressive';
    focusAreas: string[]; // categories to emphasize
    availableDays: string[]; // days of week available for lessons
  };
  statistics: {
    lessonsCompleted: number;
    averageScore: number;
    timeSpent: number; // total minutes
    currentLevel: number;
    strengthAreas: string[];
    improvementAreas: string[];
  };
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'match' | 'braille-to-text' | 'text-to-braille' | 'speech-to-braille';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  braillePattern?: BrailleCell[];
  points: number;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  dateStarted: string;
  lastUpdated: string;
  category?: string;
}

// AI Study Assistant types
export interface AIRequest {
  type: 'reschedule' | 'difficulty' | 'add_lesson' | 'remove_lesson' | 'optimize_plan' | 'focus_change';
  parameters: Record<string, any>;
  userMessage: string;
}

export interface AIResponse {
  success: boolean;
  message: string;
  updatedPlan?: StudyPlan;
  changesDescription?: string;
  suggestions?: string[];
}

// Journey animation types
export interface JourneyAnimation {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  message: string;
  progress: number; // 0-100
}

// Braille-related types
export interface BrailleCell {
  dots: number[]; // Array of dot numbers that are raised (1-6)
  char?: string; // The character representation if applicable
  description?: string; // Description or meaning
}

export interface BrailleDocument {
  id: string;
  title: string;
  content: string;
  brailleContent: BrailleCell[][];
  createdAt: string;
  updatedAt: string;
}

// Arduino hardware interface
export interface ArduinoConnection {
  isConnected: boolean;
  deviceName?: string;
  lastConnected?: string;
  sendPattern: (pattern: BrailleCell | BrailleCell[]) => Promise<boolean>;
}

// Speech Recognition
export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}