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

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  category: 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced';
  duration: number;
  exercises: Exercise[];
  prerequisites: string[];
}

export interface ScheduledLesson extends Lesson {
  scheduledDate: string;
  isCompleted: boolean;
  completedDate?: string;
  score?: number;
  attempts?: number;
  notes?: string;
  canReschedule: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedCompletionTime?: number;
  adaptiveDifficulty?: 'easy' | 'normal' | 'hard';
}

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
  weeklyGoal: number;
  isActive: boolean;
  aiManaged: boolean;
  lastAIOptimization?: string;
  preferences: {
    preferredTimeSlots: string[];
    maxLessonsPerDay: number;
    difficultyProgression: 'gradual' | 'moderate' | 'aggressive';
    focusAreas: string[];
    availableDays: string[];
  };
  statistics: {
    lessonsCompleted: number;
    averageScore: number;
    timeSpent: number;
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

export interface JourneyAnimation {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  message: string;
  progress: number;
}

export interface BrailleCell {
  dots: number[];
  char?: string;
  description?: string;
}

export interface BrailleDocument {
  id: string;
  title: string;
  content: string;
  brailleContent: BrailleCell[][];
  createdAt: string;
  updatedAt: string;
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  xpReward?: number;
  createdAt?: string;
  isActive?: boolean;
}

export interface MissionSubmission {
  id: string;
  missionId: string;
  userId: string;
  imagePath?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  aiVerification?: any;
  score?: number;
  status?: 'pending' | 'verified' | 'rejected';
  createdAt?: string;
}

export interface ArduinoConnection {
  isConnected: boolean;
  deviceName?: string;
  lastConnected?: string;
  sendPattern: (pattern: BrailleCell | BrailleCell[]) => Promise<boolean>;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}