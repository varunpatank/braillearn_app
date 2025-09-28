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