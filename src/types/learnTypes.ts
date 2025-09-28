export type Category = 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced';

export type ExerciseType = 'multiple-choice' | 'match' | 'braille-to-text' | 'text-to-braille' | 'speech-to-braille';

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options: string[];
  correctAnswer: string;
  braillePattern: Array<{ dots: number[]; char: string }>;
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

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: number;
  category: Category;
  duration: number;
  exercises: Exercise[];
  prerequisites: string[];
}

export interface RoadmapPhase {
  phase: string;
  weeks: string;
  focus: string;
  milestone: string;
}

export interface WeeklySchedule {
  week: number;
  focus: string;
  practiceTime: number;
  lessons: string[];
}