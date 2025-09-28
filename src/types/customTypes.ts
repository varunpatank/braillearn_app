export interface CustomizationForm {
  currentLevel: number;
  learningStyle: 'visual' | 'tactile' | 'auditory' | 'kinesthetic' | 'mixed';
  focusAreas: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeAvailable: string;
}

export interface GeneratedPlan {
  levels: LevelPlan[];
  totalLessons: number;
  estimatedWeeks: number;
  dailyTimeCommitment: number;
  learningStyle: string;
  roadmap: RoadmapPhase[];
  weeklySchedule: WeeklySchedule[];
}

interface LevelPlan {
  level: number;
  lessons: LessonPlan[];
}

interface LessonPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  exercises: ExercisePlan[];
}

interface ExercisePlan {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  braillePattern: { dots: number[]; char: string }[];
  points: number;
}

interface RoadmapPhase {
  phase: string;
  weeks: string;
  focus: string;
  milestone: string;
}

interface WeeklySchedule {
  week: number;
  focus: string;
  practiceTime: number;
  lessons: string[];
}