import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useUser } from '@clerk/clerk-react';
import { useSupabase } from '@/hooks/useSupabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, BookOpen, TrendingUp,
  Send, Sparkles,
  Check, ChevronDown,
  Layers, Brain,
  X, ArrowRight, BarChart,
  Rocket,
  Calendar, Gamepad2,
  Play, Users, Wand2,
  ChevronRight, Coffee,
  CheckCircle, AlertTriangle, Info,
  MousePointer2, Clock
} from 'lucide-react';
import LessonCard from '../components/lessons/LessonCard';
import { openRouterService } from '../services/openRouterService';
import { lessons } from '../data/lessons';
import type { ScheduledLesson, StudyPlan, Lesson, LessonProgress } from '../types/types';
import { lazy, Suspense } from 'react';
const PracticePage = lazy(() => import('./PracticePage'));

// ─── Toast Notification Types ───
interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

const ToastNotification: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const styles = {
    success: { bg: 'from-green-500 to-emerald-600', icon: CheckCircle, border: 'border-green-200' },
    info: { bg: 'from-blue-500 to-indigo-600', icon: Info, border: 'border-blue-200' },
    warning: { bg: 'from-amber-500 to-orange-600', icon: AlertTriangle, border: 'border-amber-200' },
  };
  const s = styles[toast.type];
  const Icon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`bg-white rounded-2xl shadow-2xl border-2 ${s.border} p-4 min-w-[320px] max-w-[420px] flex items-start gap-3`}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.bg} flex-shrink-0 flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-sm">{toast.title}</h4>
        <p className="text-xs text-gray-600 mt-0.5">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

type ViewMode = 'grid' | 'list';
type WizardStep = 'level' | 'style' | 'focus' | 'schedule' | 'review';
type DashboardTab = 'overview' | 'lessons' | 'practice';

interface ScheduleBlock {
  id: string;
  time: string;
  duration: number;
  activity: string;
  type: 'lesson' | 'practice' | 'review' | 'break';
  description: string;
  lessonSuggestion?: string;
  lessonId?: string;
}

interface DailySchedule {
  date: string;
  totalMinutes: number;
  blocks: ScheduleBlock[];
  tips: string[];
  motivationalMessage: string;
}

type WeeklySchedule = Record<string, DailySchedule>;

const LearnPage: React.FC = () => {
  const { speak } = useAudio();
  const speakRef = useRef(speak);
  speakRef.current = speak;
  const { user: clerkUser } = useUser();
  const supabase = useSupabase();
  const supabaseRef = useRef(supabase);
  supabaseRef.current = supabase;
  const userId = clerkUser?.id ?? null;
  const user = useMemo(() => (userId ? { id: userId } : null), [userId]);

  // Core state
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // AI Study Plan
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [, setScheduleConfirmed] = useState(false);
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>('level');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationMessage, setGenerationMessage] = useState('');



  // View
  const [viewMode] = useState<ViewMode>('grid');

  // Schedule
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  });

  // AI Agent state
  const [scheduleChatInput, setScheduleChatInput] = useState('');
  const [scheduleChatLoading, setScheduleChatLoading] = useState(false);

  // AI Visual Agent Cursor state
  const [aiCursorActive, setAiCursorActive] = useState(false);
  const [aiCursorPos, setAiCursorPos] = useState({ x: 0, y: 0 });
  const [aiCursorLabel, setAiCursorLabel] = useState('');
  const [aiEditingBlocks, setAiEditingBlocks] = useState<string[]>([]);
  const [aiChangePopup, setAiChangePopup] = useState<{ show: boolean; title: string; changes: string[]; type: string } | null>(null);

  // Lessons sub-tab: 'browse' shows all/filtered lessons, 'week' shows weekly schedule
  const [lessonsSubTab, setLessonsSubTab] = useState<'browse' | 'week'>('week');

  // Toast Notifications & Confirmations
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Customization form
  const [customForm, setCustomForm] = useState({
    currentLevel: 1,
    learningStyle: 'visual' as string,
    focusAreas: 'basics' as string,
    difficulty: 'beginner' as string,
    dailyTime: '30',
    studyGoals: '',
    preferredSchedule: 'flexible',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[],
    customPrompt: ''
  });

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      document.title = 'Learn Braille - BrailleLearn';
      window.scrollTo(0, 0);
      speakRef.current('Welcome to the learning dashboard.');

      try {
        setAllLessons(lessons);
        const savedPlan = localStorage.getItem('braillearn-study-plan');
        const savedConfirmation = localStorage.getItem('braillearn-schedule-confirmed');
        if (savedPlan && savedConfirmation === 'true') {
          setStudyPlan(JSON.parse(savedPlan));
          setScheduleConfirmed(true);
          setUseCustomPlan(true);
        }
        const savedWeekly = localStorage.getItem('braillearn-weekly-schedule');
        if (savedWeekly) setWeeklySchedule(JSON.parse(savedWeekly));

        if (user && supabaseRef.current) {
          try {
            const { data: progress } = await Promise.race([
              supabaseRef.current
                .from('lesson_progress')
                .select('*')
                .eq('user_id', user.id),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 4000)),
            ]);
            if (!cancelled && progress) setLessonProgress(progress);
          } catch (dbError) {
            console.warn('Supabase fetch skipped:', dbError);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
  }, [user]);

  // Reset state on sign-out
  useEffect(() => {
    if (!clerkUser) {
      setStudyPlan(null);
      setUseCustomPlan(false);
      setWeeklySchedule(null);
      setLessonProgress([]);
      setScheduleConfirmed(false);
      localStorage.removeItem('braillearn-study-plan');
      localStorage.removeItem('braillearn-schedule-confirmed');
      localStorage.removeItem('braillearn-weekly-schedule');
    }
  }, [clerkUser]);

  // ─── Voice Assistant integration — listen for voice-agent-command events ───
  useEffect(() => {
    const onVoiceCmd = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message;
      if (msg && typeof msg === 'string') {
        handleScheduleChat(msg);
      }
    };
    window.addEventListener('voice-agent-command', onVoiceCmd);
    return () => window.removeEventListener('voice-agent-command', onVoiceCmd);
  }, []);

  // ─── Schedule Generation Helpers ───
  const formatScheduleTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const getTodayName = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  const buildWeeklySchedule = (plan: StudyPlan, dailyMinutes: number): WeeklySchedule => {
    const availDays = plan.preferences?.availableDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const maxPerDay = plan.preferences?.maxLessonsPerDay || 3;
    const unfinished = (plan.scheduledLessons || []).filter(l => !l.isCompleted);
    const weekly: WeeklySchedule = {};
    let idx = 0;
    const startHour = 9; // 9 AM default

    availDays.forEach(day => {
      const blocks: ScheduleBlock[] = [];
      let t = startHour * 60;
      const dayLessonCount = Math.min(maxPerDay, Math.max(1, Math.ceil(unfinished.length / availDays.length)));

      // Review block
      blocks.push({ id: `${day}-review`, time: formatScheduleTime(t), duration: 15, activity: '📖 Review', type: 'review', description: 'Warm up with previous material' });
      t += 15;

      // Lesson blocks
      for (let i = 0; i < dayLessonCount && idx < unfinished.length; i++) {
        const les = unfinished[idx];
        const dur = Math.min(les.duration || 20, Math.max(15, Math.floor(dailyMinutes / (dayLessonCount + 2))));
        blocks.push({
          id: `${day}-lesson-${i}`,
          time: formatScheduleTime(t),
          duration: dur,
          activity: `✨ ${les.title}`,
          type: 'lesson',
          description: les.description || 'Continue learning',
          lessonId: les.id,
          lessonSuggestion: les.title
        });
        t += dur;
        idx++;
        if (i < dayLessonCount - 1) {
          blocks.push({ id: `${day}-break-${i}`, time: formatScheduleTime(t), duration: 10, activity: '☕ Break', type: 'break', description: 'Rest your eyes and fingers' });
          t += 10;
        }
      }

      // Practice block
      blocks.push({ id: `${day}-practice`, time: formatScheduleTime(t), duration: 15, activity: '⚡ Practice', type: 'practice', description: 'Build speed and accuracy' });

      const totalUsed = blocks.reduce((s, b) => s + b.duration, 0);
      weekly[day] = {
        date: day,
        totalMinutes: totalUsed,
        blocks,
        tips: ['Focus on accuracy before speed', 'Review yesterday\'s material first'],
        motivationalMessage: 'Consistency is the key to mastery! 🌟'
      };
    });

    return weekly;
  };

  // Generate study plan
  const generateStudyPlan = (form: typeof customForm): StudyPlan => {
    const startDate = new Date();
    const targetEndDate = new Date();
    targetEndDate.setDate(startDate.getDate() + 84);

    let selectedLessons = lessons.filter(lesson => {
      if (form.difficulty === 'beginner') return lesson.level <= 10;
      if (form.difficulty === 'intermediate') return lesson.level >= 5 && lesson.level <= 20;
      if (form.difficulty === 'advanced') return lesson.level >= 15;
      return true;
    });

    if (form.focusAreas !== 'all') {
      selectedLessons = selectedLessons.filter(lesson =>
        lesson.category === form.focusAreas || lesson.category === 'basics'
      );
    }

    const scheduledLessons: ScheduledLesson[] = selectedLessons.slice(0, 50).map((lesson, index) => {
      const scheduleDate = new Date(startDate);
      scheduleDate.setDate(startDate.getDate() + Math.floor(index / 3) * 7 + (index % 3));
      return {
        ...lesson,
        scheduledDate: scheduleDate.toISOString(),
        isCompleted: false,
        canReschedule: true,
        priority: index < 10 ? 'high' : index < 30 ? 'medium' : 'low',
        estimatedCompletionTime: lesson.duration,
        adaptiveDifficulty: 'normal'
      };
    });

    return {
      id: `plan-${Date.now()}`,
      userId: user?.id || 'guest',
      title: `${form.difficulty.charAt(0).toUpperCase() + form.difficulty.slice(1)} Braille Journey`,
      description: `Personalized plan focusing on ${form.focusAreas} with ${form.learningStyle} style`,
      totalLessons: scheduledLessons.length,
      scheduledLessons,
      startDate: startDate.toISOString(),
      targetEndDate: targetEndDate.toISOString(),
      currentStreak: 0,
      weeklyGoal: 3,
      isActive: true,
      aiManaged: true,
      preferences: {
        preferredTimeSlots: ['morning'],
        maxLessonsPerDay: 3,
        difficultyProgression: form.difficulty === 'beginner' ? 'gradual' : 'moderate',
        focusAreas: [form.focusAreas],
        availableDays: form.availableDays
      },
      statistics: {
        lessonsCompleted: 0,
        averageScore: 0,
        timeSpent: 0,
        currentLevel: form.currentLevel,
        strengthAreas: [],
        improvementAreas: []
      }
    };
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    setGenerationProgress(0);

    const steps = [
      { msg: '🚀 Analyzing your learning profile...', pct: 20 },
      { msg: '📚 Selecting optimal lessons...', pct: 40 },
      { msg: '🤖 BrailleLearn Intelligence is crafting your curriculum...', pct: 60 },
      { msg: '📅 Building your schedule...', pct: 80 },
      { msg: '✨ Finalizing your personalized plan!', pct: 100 }
    ];

    for (const step of steps) {
      setGenerationMessage(step.msg);
      setGenerationProgress(step.pct);
      await new Promise(r => setTimeout(r, 800));
    }

    let plan: StudyPlan;
    try {
      const aiRaw = await openRouterService.generateStudyPlan(
        customForm.currentLevel,
        [customForm.focusAreas],
        customForm.learningStyle,
        parseInt(customForm.dailyTime) || 30,
        customForm.customPrompt
      ) as any;

      // Normalize AI response → proper StudyPlan with scheduledLessons
      const startDate = new Date();
      const targetEndDate = new Date();
      targetEndDate.setDate(startDate.getDate() + 84);

      // Extract lessons from levels array if present (AI format)
      let aiLessonsList: any[] = [];
      if (aiRaw.levels && Array.isArray(aiRaw.levels)) {
        aiRaw.levels.forEach((lvl: any) => {
          if (lvl.lessons && Array.isArray(lvl.lessons)) {
            lvl.lessons.forEach((les: any) => {
              aiLessonsList.push({ ...les, level: lvl.level || 1 });
            });
          }
        });
      }

      // Always use real lessons from the lesson bank so IDs match for schedule filtering
      const realLessonsPool = lessons.filter(l => {
        if (customForm.focusAreas === 'all') return true;
        return l.category === customForm.focusAreas || l.category === 'basics';
      });

      // If AI suggested lessons, try to match them to real ones by title
      let orderedLessons = realLessonsPool;
      if (aiLessonsList.length > 0) {
        const matched: typeof lessons = [];
        const usedIds = new Set<string>();
        for (const aiLesson of aiLessonsList) {
          const titleLower = (aiLesson.title || '').toLowerCase();
          const match = realLessonsPool.find(rl =>
            !usedIds.has(rl.id) && (
              rl.title.toLowerCase().includes(titleLower) ||
              titleLower.includes(rl.title.toLowerCase()) ||
              rl.category === (aiLesson.category || 'basics')
            )
          );
          if (match) {
            matched.push(match);
            usedIds.add(match.id);
          }
        }
        // Fill remaining slots with unmatched real lessons
        const remaining = realLessonsPool.filter(l => !usedIds.has(l.id));
        orderedLessons = [...matched, ...remaining];
      }

      const scheduledLessons: ScheduledLesson[] = orderedLessons.slice(0, 50).map((lesson, index) => {
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(startDate.getDate() + Math.floor(index / 3) * 7 + (index % 3));
        return {
          ...lesson,
          scheduledDate: scheduleDate.toISOString(),
          isCompleted: false,
          canReschedule: true,
          priority: index < 10 ? 'high' as const : index < 20 ? 'medium' as const : 'low' as const,
          estimatedCompletionTime: lesson.duration || 15,
          adaptiveDifficulty: 'normal' as const
        } as ScheduledLesson;
      });

      plan = {
        id: `plan-${Date.now()}`,
        userId: user?.id || 'guest',
        title: aiRaw.title || `${customForm.difficulty.charAt(0).toUpperCase() + customForm.difficulty.slice(1)} Braille Journey`,
        description: aiRaw.description || `Personalized plan focusing on ${customForm.focusAreas}`,
        totalLessons: scheduledLessons.length,
        scheduledLessons,
        startDate: startDate.toISOString(),
        targetEndDate: targetEndDate.toISOString(),
        currentStreak: 0,
        weeklyGoal: aiRaw.weeklyGoal || 3,
        isActive: true,
        aiManaged: true,
        preferences: {
          preferredTimeSlots: ['morning'],
          maxLessonsPerDay: 3,
          difficultyProgression: aiRaw.difficultyProgression || (customForm.difficulty === 'beginner' ? 'gradual' : 'moderate'),
          focusAreas: aiRaw.focusAreas || [customForm.focusAreas],
          availableDays: customForm.availableDays
        },
        statistics: {
          lessonsCompleted: 0,
          averageScore: 0,
          timeSpent: 0,
          currentLevel: customForm.currentLevel,
          strengthAreas: [],
          improvementAreas: []
        }
      };
    } catch (err) {
      console.error('AI plan generation failed, using local generator:', err);
      setGenerationMessage('⚠️ BrailleLearn Intelligence unavailable — generating smart default plan...');
      await new Promise(r => setTimeout(r, 1200));
      plan = generateStudyPlan(customForm);
    }

    setStudyPlan(plan);
    localStorage.setItem('braillearn-study-plan', JSON.stringify(plan));
    localStorage.setItem('braillearn-schedule-confirmed', 'true');

    // Auto-generate weekly schedule from plan
    const weekly = buildWeeklySchedule(plan, parseInt(customForm.dailyTime) || 30);
    setWeeklySchedule(weekly);
    localStorage.setItem('braillearn-weekly-schedule', JSON.stringify(weekly));

    setScheduleConfirmed(true);
    setUseCustomPlan(true);
    setShowWizard(false);
    setGeneratingPlan(false);
    setLessonsSubTab('week');
    setSelectedScheduleDay(getTodayName());
    const dayCount = Object.keys(weekly).length;
    addToast('success', '🎉 Plan & Schedule Created!', `Your "${plan.title || 'Braille Journey'}" plan is ready with schedules for ${dayCount} days/week.`);
    setActiveTab('overview');
    speak('Your personalized study plan and weekly schedule are ready!');
  };

  const resetPlan = () => {
    localStorage.removeItem('braillearn-study-plan');
    localStorage.removeItem('braillearn-schedule-confirmed');
    localStorage.removeItem('braillearn-weekly-schedule');
    setStudyPlan(null);
    setWeeklySchedule(null);
    setScheduleConfirmed(false);
    setUseCustomPlan(false);
    addToast('info', 'Plan Reset', 'Your study plan and schedule have been cleared. Create a new one anytime from the Overview tab.');
  };

  // AI Agent — translates natural language to schedule commands, feeds ALL lessons + current schedule to Gemini
  // Cursor moves in slow motion with scroll-follow so user can watch hands-free
  const handleScheduleChat = async (message: string) => {
    if (!message.trim()) return;
    setScheduleChatLoading(true);
    setScheduleChatInput('');

    try {
      const today = getTodayName();
      const scheduleContext = weeklySchedule
        ? `CURRENT WEEKLY SCHEDULE:\n${Object.entries(weeklySchedule).map(([day, sched]) =>
          `${day.toUpperCase()}: ${sched.blocks.map((b, i) => `[${b.id || day + '-' + i}] ${b.time || ''} ${b.activity} (${b.duration}min, type:${b.type}${b.lessonId ? ', lessonId:' + b.lessonId : ''})`).join(' | ')} — Total: ${sched.totalMinutes}min`
        ).join('\n')}\nToday is ${today}.`
        : 'NO SCHEDULE EXISTS YET — create one from scratch.';

      const planContext = studyPlan
        ? `STUDY PLAN: "${studyPlan.title}" — ${studyPlan.totalLessons} lessons, ${studyPlan.statistics?.lessonsCompleted || 0} completed. Weekly goal: ${studyPlan.weeklyGoal}. Focus: ${studyPlan.preferences?.focusAreas?.join(', ') || 'all'}. Difficulty: ${studyPlan.preferences?.difficultyProgression || 'gradual'}. Days: ${studyPlan.preferences?.availableDays?.join(', ') || 'weekdays'}.`
        : 'No study plan yet.';

      // Build FULL lesson catalog for Gemini
      const lessonCatalog = allLessons.map(l => `${l.id}: "${l.title}" (cat:${l.category}, lvl:${l.level}, ${l.duration}min)`).join('\n');

      const systemPrompt = `You are BrailleLearn Agent — a COMMAND EXECUTOR that DIRECTLY EDITS the user's weekly braille learning schedule. You receive natural language and output ONLY a valid JSON command. NEVER output text — ONLY JSON.

USER STATE:
- Progress: ${completedLessons}/${totalLessonsCount} lessons completed. Level: ${customForm.currentLevel}.
${scheduleContext}
${planContext}

COMPLETE LESSON CATALOG (use these EXACT lesson IDs):
${lessonCatalog}

YOUR JOB: Take ANY user request — no matter how specific or vague — and translate it into a JSON schedule edit. ALWAYS output a complete weeklySchedule with the FULL updated schedule for ALL days. If the user asks for something you're unsure about, make your best guess and DO IT.

EXAMPLES OF REQUESTS YOU MUST HANDLE:
- "Add math lessons" → find lesson-42 (Mathematical Notation) and lesson-43 (Mathematical Expressions) and add them
- "More letters" / "letter lessons" / "character lessons" / "alphabet" → add lesson-1 through lesson-10 (Letters A-Z)
- "Change style to contractions" → replace current lessons with contraction lessons (lesson-31 through lesson-37)
- "Make it easier" / "too hard" / "simpler" → swap for lower-level basics lessons (lesson-1 through lesson-10)
- "Make it harder" / "more challenging" / "advanced" → add lesson-41+ (advanced category)
- "I want to learn numbers" / "digits" → add lesson-11 and lesson-12
- "Focus on words" / "word lessons" → replace with word lessons (lesson-18, 19, 21-27, 39)
- "Add music lessons" / "music notation" → add lesson-44
- "I want Spanish" / "foreign language" → add lesson-45
- "Add computer lessons" / "tech" / "coding" → add lesson-46
- "More poetry" / "poems" → add lesson-47
- "Punctuation lessons" / "periods and commas" → add lesson-13 through lesson-16
- "Symbol lessons" / "special characters" → add lesson-13 through lesson-17
- "Sentence lessons" / "reading sentences" → add lesson-28, 29, 30, 40
- "Capital letters" / "capitalization" → add lesson-17
- "Shorten sessions" / "less time" / "quick" → reduce all block durations to 15min
- "Make it longer" / "more time" / "extend" → increase block durations to 45min
- "Remove Monday" → remove monday from schedule
- "Add weekends" / "saturday and sunday" → add saturday and sunday with lessons
- "Swap Monday and Friday" → swap those days' blocks
- "Move everything to evenings" / "evening schedule" → change times to 6:00 PM+
- "Move to mornings" / "morning schedule" → change times to 8:00 AM+
- "Afternoon schedule" → change times to 1:00 PM+
- "I need more practice" / "practice sessions" → add practice/review type blocks
- "Add breaks" / "rest periods" → insert break blocks between lesson blocks
- "Only 3 days a week" / "fewer days" → keep only 3 days
- "Every day" / "7 days" / "daily" → schedule all 7 days
- "Review what I learned" / "revision" → add review blocks for completed lessons
- "Double the lessons" / "more lessons per day" → add more lesson blocks per day
- "Only basics" / "basic only" → replace everything with basics category lessons
- "Mix categories" / "variety" / "diverse" → alternate between different categories each day
- "Theme days" / "focused days" → each day focuses on one category
- "Clear everything" / "reset" / "start over" → empty all days then rebuild
- "Start fresh" / "new schedule" → rebuild from scratch with balanced lessons
- "Make it fun" / "adventure" / "games" → use adventure lessons
- "Randomize" / "shuffle" / "surprise me" → random mix of lessons from all categories
- "Rush" / "accelerate" / "cover more" / "speed up" → pack more lessons per day, shorter durations
- "Slow down" / "take it easy" / "relaxed" → fewer lessons per day, longer durations
- "Give all lessons on X" → find all lessons matching that topic and add them
- "Focus on reading" → add lesson-38, 40, 41 (reading-focused)
- "Compound words" → add lesson-39
- "Document formatting" → add lesson-49
- "Speed reading" → add lesson-41

OUTPUT FORMAT — ALWAYS this exact structure:
{
  "command": "edit_schedule",
  "changeSummary": ["Human-readable change 1", "Human-readable change 2"],
  "weeklySchedule": {
    "monday": {
      "date": "monday",
      "totalMinutes": 60,
      "blocks": [
        {"id": "mon-0", "time": "9:00 AM", "duration": 30, "activity": "EXACT lesson title from catalog", "type": "lesson", "description": "Brief description", "lessonId": "lesson-1"},
        {"id": "mon-1", "time": "9:30 AM", "duration": 30, "activity": "Another lesson title", "type": "lesson", "description": "Brief description", "lessonId": "lesson-2"}
      ],
      "tips": ["Helpful tip for this day"],
      "motivationalMessage": "Encouraging message 🌟"
    }
  }
}

CRITICAL RULES:
1. ALWAYS output ONLY valid JSON — no text before/after, no markdown.
2. ALWAYS include "changeSummary" — short array of what you changed.
3. ALWAYS include "weeklySchedule" with ALL days that should exist.
4. Use REAL lessonId values from the catalog above.
5. Activity names should match the lesson titles from the catalog.
6. Set realistic times (morning: 9:00 AM, afternoon: 1:00 PM, evening: 6:00 PM).
7. Block durations: 15-60 min. Space blocks 30 min apart.
8. Every block needs: id, time, duration, activity, type, description, lessonId.
9. Valid block types: "lesson", "practice", "review", "break".
10. For break blocks, omit lessonId. For review, use a previously-assigned lessonId.
11. If the current schedule is empty, CREATE one with sensible defaults.
12. For ANY request — even ambiguous — output a schedule. NEVER refuse.`;

      const response = await openRouterService.chat(systemPrompt, message, { maxTokens: 4000, temperature: 0.3 });

      // Bulletproof JSON extraction — try every possible format
      let jsonStr = response.trim();
      const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || jsonStr.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      const bareJson = jsonStr.match(/\{[\s\S]*\}/);
      if (bareJson) jsonStr = bareJson[0];

      let cmd: any;
      try {
        cmd = JSON.parse(jsonStr);
      } catch {
        // Last resort: try to fix common JSON issues
        const fixedJson = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/(['"])?([a-zA-Z_]\w*)\1\s*:/g, '"$2":');
        try {
          cmd = JSON.parse(fixedJson);
        } catch {
          // NEVER show an error — build a smart fallback schedule from the user's message
          const msgLower = message.toLowerCase();
          const fallbackLessons: any[] = [];
          const addLesson = (id: string) => {
            if (fallbackLessons.some(l => l.lessonId === id)) return;
            const lesson = allLessons.find(l => l.id === id);
            if (lesson) fallbackLessons.push({ id: `fb-${fallbackLessons.length}`, time: `${9 + Math.floor(fallbackLessons.length / 2)}:${fallbackLessons.length % 2 === 0 ? '00' : '30'} AM`, duration: lesson.duration || 30, activity: lesson.title, type: 'lesson', description: lesson.description || '', lessonId: lesson.id });
          };
          const addLessons = (ids: string[]) => ids.forEach(addLesson);

          // ─── 30+ keyword-to-lesson mappings (checked in priority order) ───
          // Letters / alphabet / characters (MUST be checked BEFORE "advanced"/"more")
          if (/\b(letter|alphabet|character|abc|a-z)\b/.test(msgLower)) {
            addLessons(['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'lesson-6', 'lesson-7', 'lesson-8', 'lesson-9', 'lesson-10']);
          }
          // Numbers / digits / math
          else if (/\b(math|number|digit|calculation|arithmetic)\b/.test(msgLower)) {
            addLessons(['lesson-11', 'lesson-12', 'lesson-42', 'lesson-43']);
          }
          // Punctuation
          else if (/\b(punctuation|period|comma|question mark|exclamation)\b/.test(msgLower)) {
            addLessons(['lesson-13', 'lesson-14', 'lesson-15', 'lesson-16']);
          }
          // Symbols / special characters
          else if (/\b(symbol|special char|sign)\b/.test(msgLower)) {
            addLessons(['lesson-13', 'lesson-14', 'lesson-15', 'lesson-16', 'lesson-17']);
          }
          // Capitalization
          else if (/\b(capital|uppercase|capitalization)\b/.test(msgLower)) {
            addLessons(['lesson-17']);
          }
          // Words
          else if (/\b(word|words|sight word|vocabulary)\b/.test(msgLower)) {
            addLessons(['lesson-18', 'lesson-19', 'lesson-21', 'lesson-22', 'lesson-23', 'lesson-24', 'lesson-25', 'lesson-26', 'lesson-27']);
          }
          // Sentences / reading
          else if (/\b(sentence|reading|paragraph|read)\b/.test(msgLower)) {
            addLessons(['lesson-28', 'lesson-29', 'lesson-30', 'lesson-38', 'lesson-40']);
          }
          // Contractions
          else if (/\b(contraction|short form|abbreviat)\b/.test(msgLower)) {
            addLessons(['lesson-31', 'lesson-32', 'lesson-33', 'lesson-34', 'lesson-35', 'lesson-36', 'lesson-37', 'lesson-48']);
          }
          // Easy / beginner / basics
          else if (/\b(easy|easier|beginner|basic|simple|start)\b/.test(msgLower)) {
            addLessons(['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5']);
          }
          // Hard / advanced / challenge
          else if (/\b(hard|harder|difficult|advanced|challeng)\b/.test(msgLower)) {
            addLessons(['lesson-41', 'lesson-44', 'lesson-46', 'lesson-48', 'lesson-50']);
          }
          // Music
          else if (/\b(music|notation|musical)\b/.test(msgLower)) {
            addLessons(['lesson-44']);
          }
          // Spanish / foreign language
          else if (/\b(spanish|foreign|language|french|german)\b/.test(msgLower)) {
            addLessons(['lesson-45']);
          }
          // Computer / tech / coding
          else if (/\b(computer|tech|code|coding|programming|software)\b/.test(msgLower)) {
            addLessons(['lesson-46']);
          }
          // Poetry / poems
          else if (/\b(poetry|poem|literary)\b/.test(msgLower)) {
            addLessons(['lesson-47']);
          }
          // Speed reading
          else if (/\b(speed|speed read|fast read)\b/.test(msgLower)) {
            addLessons(['lesson-41']);
          }
          // Compound words
          else if (/\b(compound)\b/.test(msgLower)) {
            addLessons(['lesson-39']);
          }
          // Document formatting
          else if (/\b(document|format|formatting)\b/.test(msgLower)) {
            addLessons(['lesson-49']);
          }
          // Assessment / test
          else if (/\b(assess|test|exam|quiz)\b/.test(msgLower)) {
            addLessons(['lesson-50']);
          }
          // Adventure / fun
          else if (/\b(fun|adventure|game|play)\b/.test(msgLower)) {
            const advLessons = allLessons.filter(l => l.id.startsWith('adventure-')).slice(0, 5);
            advLessons.forEach(l => addLesson(l.id));
          }
          // Randomize / shuffle / surprise
          else if (/\b(random|shuffle|surprise|mix up)\b/.test(msgLower)) {
            const shuffled = [...allLessons].sort(() => Math.random() - 0.5).slice(0, 10);
            shuffled.forEach(l => addLesson(l.id));
          }
          // Rush / accelerate / cover more
          else if (/\b(rush|accelerat|cover more|speed up|faster|more lessons)\b/.test(msgLower)) {
            addLessons(['lesson-1', 'lesson-5', 'lesson-10', 'lesson-15', 'lesson-20', 'lesson-25', 'lesson-30', 'lesson-35', 'lesson-40', 'lesson-45', 'lesson-50']);
          }
          // Slow down / relaxed / take it easy
          else if (/\b(slow|relax|take it easy|chill|calm)\b/.test(msgLower)) {
            addLessons(['lesson-1', 'lesson-2', 'lesson-3']);
          }
          // More time / longer / extend
          else if (/\b(more time|longer|extend|extra time)\b/.test(msgLower)) {
            // Keep current lessons but with longer durations — handled via special flag
            addLessons(['lesson-1', 'lesson-2', 'lesson-3']);
            fallbackLessons.forEach(l => l.duration = 45);
          }
          // Shorten / less time / quick
          else if (/\b(short|less time|quick|brief|15 min)\b/.test(msgLower)) {
            addLessons(['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5']);
            fallbackLessons.forEach(l => l.duration = 15);
          }
          // Practice / review
          else if (/\b(practice|review|revision|recap|drill)\b/.test(msgLower)) {
            addLessons(['lesson-1', 'lesson-11', 'lesson-21']);
            fallbackLessons.forEach(l => l.type = 'review');
          }
          // Colors
          else if (/\b(color|colour)\b/.test(msgLower)) {
            addLessons(['lesson-24']);
          }
          // Animals
          else if (/\b(animal|animals|pet)\b/.test(msgLower)) {
            addLessons(['lesson-25']);
          }
          // Family
          else if (/\b(family|mom|dad|parent|brother|sister)\b/.test(msgLower)) {
            addLessons(['lesson-26']);
          }
          // Food
          else if (/\b(food|eat|meal|cook)\b/.test(msgLower)) {
            addLessons(['lesson-27']);
          }
          // Clear / reset / fresh
          else if (/\b(clear|reset|start over|fresh|empty|wipe)\b/.test(msgLower)) {
            // Return empty schedule
            cmd = { command: 'edit_schedule', changeSummary: ['Cleared entire schedule'], weeklySchedule: { monday: { date: 'monday', totalMinutes: 0, blocks: [], tips: ['Schedule cleared!'], motivationalMessage: 'Ready for a fresh start! 🌟' } } };
          }

          // If we matched lessons, build the schedule
          if (fallbackLessons.length > 0 && !(cmd && cmd.weeklySchedule)) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const fbSchedule: any = {};
            const perDay = Math.max(1, Math.ceil(fallbackLessons.length / days.length));
            days.forEach((day, di) => {
              const dayBlocks = fallbackLessons.slice(di * perDay, (di + 1) * perDay);
              if (dayBlocks.length > 0) {
                fbSchedule[day] = { date: day, totalMinutes: dayBlocks.reduce((s: number, b: any) => s + b.duration, 0), blocks: dayBlocks.map((b: any, i: number) => ({ ...b, id: `${day}-${i}`, time: `${9 + i}:00 AM` })), tips: ['Generated from your request!'], motivationalMessage: 'Let\'s learn! 🌟' };
              }
            });
            cmd = { command: 'edit_schedule', changeSummary: [`Applied: "${message}"`], weeklySchedule: fbSchedule };
          } else if (!cmd || !cmd.weeklySchedule) {
            // Absolute last resort — balanced mix
            addLessons(['lesson-1', 'lesson-11', 'lesson-21', 'lesson-31', 'lesson-41']);
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            const fbSchedule: any = {};
            const perDay = Math.max(1, Math.ceil(fallbackLessons.length / days.length));
            days.forEach((day, di) => {
              const dayBlocks = fallbackLessons.slice(di * perDay, (di + 1) * perDay);
              if (dayBlocks.length > 0) {
                fbSchedule[day] = { date: day, totalMinutes: dayBlocks.reduce((s: number, b: any) => s + b.duration, 0), blocks: dayBlocks.map((b: any, i: number) => ({ ...b, id: `${day}-${i}`, time: `${9 + i}:00 AM` })), tips: ['Balanced mix of lessons!'], motivationalMessage: 'Let\'s learn! 🌟' };
              }
            });
            cmd = { command: 'edit_schedule', changeSummary: [`Applied: "${message}"`], weeklySchedule: fbSchedule };
          }
        }
      }

      const changeSummary: string[] = cmd.changeSummary || ['Schedule updated'];

      // ─── ULTRA-SLOW CURSOR WITH REAL-TIME POSITIONING ───
      // Positions are looked up IN REAL TIME at each step (not pre-computed).
      // The element is scrolled into view FIRST, then the cursor moves to it.
      // This guarantees the cursor is always on top of what's being edited.
      type CursorStep = {
        selector?: string; // CSS selector to find element — position computed at runtime
        fallbackPos?: { x: number; y: number }; // only if selector not found
        label: string;
        blocks?: string[];
        action?: () => void;
      };

      const runCursorSteps = (
        steps: CursorStep[],
        popupTitle: string,
        popupType: string
      ) => {
        // Spawn cursor at center of screen immediately
        setAiCursorPos({ x: window.innerWidth / 2, y: window.innerHeight / 3 });
        setAiCursorLabel('🤖 Starting...');
        setAiCursorActive(true);
        const PAUSE_BETWEEN_STEPS = 4500; // 4.5s per step — ultra slow
        const SCROLL_SETTLE = 800; // wait for scroll animation to finish

        let stepIndex = 0;

        const executeStep = () => {
          if (stepIndex >= steps.length) {
            // All steps done — show final label, then popup
            setAiCursorLabel('✨ All changes applied!');
            setAiEditingBlocks([]);
            setTimeout(() => {
              setAiChangePopup({ show: true, title: popupTitle, changes: changeSummary, type: popupType });
            }, 3000);
            return;
          }

          const step = steps[stepIndex];
          stepIndex++;

          // Run the action (schedule edit) FIRST so elements exist in DOM
          if (step.action) step.action();

          // Find the target element in real time
          const el = step.selector ? document.querySelector(step.selector) as HTMLElement : null;

          if (el) {
            // Scroll element into the center of the viewport
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

            // Wait for scroll to settle, THEN read position and move cursor
            setTimeout(() => {
              const rect = el.getBoundingClientRect();
              const cursorX = rect.left + rect.width / 2;
              const cursorY = rect.top + rect.height / 2;
              setAiCursorPos({ x: cursorX, y: cursorY });
              setAiCursorLabel(step.label);
              if (step.blocks) setAiEditingBlocks(step.blocks);

              // Purple highlight glow on the element
              el.style.transition = 'box-shadow 0.4s, outline 0.4s';
              el.style.boxShadow = '0 0 24px 8px rgba(147,51,234,0.45)';
              el.style.outline = '3px solid rgba(147,51,234,0.8)';
              el.style.outlineOffset = '3px';
              setTimeout(() => {
                el.style.boxShadow = '';
                el.style.outline = '';
                el.style.outlineOffset = '';
              }, 3500);

              // Wait, then go to next step
              setTimeout(executeStep, PAUSE_BETWEEN_STEPS);
            }, SCROLL_SETTLE);
          } else {
            // No element found — use fallback position
            const pos = step.fallbackPos || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            setAiCursorPos({ x: pos.x, y: pos.y });
            setAiCursorLabel(step.label);
            if (step.blocks) setAiEditingBlocks(step.blocks);

            setTimeout(executeStep, PAUSE_BETWEEN_STEPS);
          }
        };

        // Start the chain
        executeStep();
      };

      // ─── EXECUTE: Switch to week view, then animate cursor across schedule ───
      setActiveTab('lessons');
      setLessonsSubTab('week');

      // Wait for DOM to render, then build cursor steps and execute
      setTimeout(() => {
        const ws = cmd.weeklySchedule;
        if (!ws) {
          setAiChangePopup({ show: true, title: 'No Changes', changes: ['The AI did not return a schedule. Try: "Add math lessons to my week"'], type: 'error' });
          setScheduleChatLoading(false);
          return;
        }

        const changedDays = Object.keys(ws);
        const steps: CursorStep[] = [];

        // Step 0: INTRO — cursor spawns at center, pauses, describes plan
        const introPlan = changeSummary[0] || `Working on: "${message}"`;
        steps.push({
          fallbackPos: { x: window.innerWidth / 2, y: window.innerHeight / 3 },
          label: `🤖 ${introPlan}`,
          blocks: []
        });

        // Step 1: Cursor goes to the "Week" tab
        steps.push({
          selector: '[data-subtab="week"]',
          label: '🔍 Opening weekly schedule...',
          blocks: []
        });

        // Step 2: Scan existing schedule header
        steps.push({
          selector: '[data-ai-day]',
          label: '📋 Reading current schedule...',
          blocks: []
        });

        // Step 3+: For each day — apply changes, then visit each block
        changedDays.forEach(day => {
          const dayTitle = day.charAt(0).toUpperCase() + day.slice(1);
          const dayBlocks = ws[day]?.blocks || [];
          const dayMins = ws[day]?.totalMinutes || dayBlocks.reduce((s: number, b: any) => s + (b.duration || 0), 0);

          // Move to day header + apply this day's schedule
          steps.push({
            selector: `[data-ai-day="${day}"]`,
            fallbackPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
            label: `📅 ${dayTitle} — adding ${dayBlocks.length} blocks (${dayMins}min)`,
            blocks: [day],
            action: () => {
              setWeeklySchedule(prev => {
                const updated = { ...(prev || {}) };
                updated[day] = {
                  date: day,
                  totalMinutes: dayMins,
                  blocks: dayBlocks.map((b: any, i: number) => ({ ...b, id: b.id || `${day}-${i}` })),
                  tips: ws[day]?.tips || ['Keep learning!'],
                  motivationalMessage: ws[day]?.motivationalMessage || 'Great progress! 🌟'
                };
                localStorage.setItem('braillearn-weekly-schedule', JSON.stringify(updated));
                return updated;
              });
            }
          });

          // Visit each block within this day
          dayBlocks.forEach((block: any, bIdx: number) => {
            const actionVerb = block.type === 'break' ? '☕ Break' :
              block.type === 'review' ? '🔄 Review' :
              block.type === 'practice' ? '🎯 Practice' :
              '📝 Lesson';

            steps.push({
              selector: `[data-ai-block="${day}-${bIdx}"]`,
              fallbackPos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
              label: `${actionVerb}: "${block.activity}" — ${block.duration}min @ ${block.time || ''}`,
              blocks: [day, `${day}-${bIdx}`]
            });
          });
        });

        // Final confirming step
        steps.push({
          selector: '[data-subtab="week"]',
          label: '✅ All days updated!',
          blocks: changedDays
        });

        runCursorSteps(
          steps,
          changeSummary.length > 1 ? 'Schedule Updated' : changeSummary[0] || 'Schedule Updated',
          'schedule'
        );
      }, 600);

    } catch (error) {
      console.error('AI Agent error:', error);
      setAiChangePopup({ show: true, title: 'Agent Error', changes: ['Something went wrong. Please try again.'], type: 'error' });
    }
    setScheduleChatLoading(false);
  };

  // Level info
  const generateLevelInfo = (level: number) => {
    const emojis = ['🌱', '🌿', '🌺', '🌳', '⭐', '🎯', '🚀', '💎', '🏆', '👑'];
    const titles = [
      'Beginner Sprout', 'Growing Learner', 'Blooming Reader', 'Braille Explorer', 'Pattern Master',
      'Word Builder', 'Sentence Reader', 'Contraction Expert', 'Speed Reader', 'Braille Champion',
      'Advanced Scholar', 'Literary Expert', 'Technical Reader', 'Math Specialist', 'Music Reader',
      'Multi-Language', 'Teaching Expert', 'Research Scholar', 'Innovation Leader', 'Master Teacher',
      'Global Expert', 'Technology Pioneer', 'Accessibility Advocate', 'Community Leader', 'Mentor Master',
      'Legacy Builder', 'Wisdom Keeper', 'Grand Master', 'Ultimate Scholar', 'Braille Legend'
    ];
    return {
      emoji: emojis[(level - 1) % emojis.length],
      title: titles[Math.min(level - 1, titles.length - 1)]
    };
  };

  // Helpers
  const isLessonLocked = (lesson: Lesson): boolean => {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) return false;
    return !lesson.prerequisites.every((prereqId: string) => {
      const p = lessonProgress.find(lp => lp.lessonId === prereqId);
      return p && p.completed;
    });
  };

  const getLessonProg = (lessonId: string) => lessonProgress.find(p => p.lessonId === lessonId);
  const completedLessons = lessonProgress.filter(p => p.completed).length;
  const totalLessonsCount = allLessons.length;
  const overallProgress = Math.round((completedLessons / totalLessonsCount) * 100) || 0;
  const avgScore = lessonProgress.length > 0
    ? Math.round(lessonProgress.reduce((acc, curr) => acc + curr.score, 0) / lessonProgress.length)
    : 0;

  // Filtered and grouped lessons
  const filteredLessons = useMemo(() => {
    return allLessons;
  }, [allLessons]);

  const lessonsByLevel = filteredLessons.reduce((acc: Record<number, Lesson[]>, lesson) => {
    if (!acc[lesson.level]) acc[lesson.level] = [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {});

  const sortedLevels = Array.from({ length: 30 }, (_, i) => i + 1).filter(l => lessonsByLevel[l]);

  const wizardSteps: { id: WizardStep; label: string; emoji: string }[] = [
    { id: 'level', label: 'Level', emoji: '📊' },
    { id: 'style', label: 'Style', emoji: '🎨' },
    { id: 'focus', label: 'Focus', emoji: '🎯' },
    { id: 'schedule', label: 'Schedule', emoji: '📅' },
    { id: 'review', label: 'Review', emoji: '✅' }
  ];

  const currentWizardIndex = wizardSteps.findIndex(s => s.id === wizardStep);

  const dashTabs: { id: DashboardTab; label: string; icon: any; desc: string }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart, desc: 'Dashboard & stats' },
    { id: 'lessons', label: 'Lessons', icon: BookOpen, desc: 'Browse & study' },
    { id: 'practice', label: 'Practice', icon: Gamepad2, desc: 'Games & drills' },
  ];

  if (loading) {
    const brailleCells = [
      { letter: 'L', dots: [1,2,3] },
      { letter: 'E', dots: [1,5] },
      { letter: 'A', dots: [1] },
      { letter: 'R', dots: [1,2,3,5] },
      { letter: 'N', dots: [1,3,4,5] },
    ];
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 flex items-start justify-center pt-[15vh] p-6">
        {/* Ambient floating dots */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div key={i}
              className="absolute w-2 h-2 rounded-full bg-blue-300/20"
              style={{ left: `${10 + (i * 7) % 80}%`, top: `${15 + (i * 13) % 70}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <motion.div
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_60px_rgba(99,102,241,0.12)] border border-white/60 px-10 py-10 max-w-lg w-full text-center"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Subtle glow ring */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-blue-200/30 via-indigo-200/20 to-purple-200/30 -z-10 blur-sm" />

          {/* Braille cells — large */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {brailleCells.map((cell, cellIdx) => (
              <motion.div
                key={cell.letter}
                className="flex flex-col items-center gap-2.5"
                initial={{ opacity: 0, y: -25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + cellIdx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="grid grid-cols-2 gap-2 bg-gradient-to-b from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200/80 p-4 w-16 h-24 shadow-sm">
                  {[1,4,2,5,3,6].map(dot => {
                    const isRaised = cell.dots.includes(dot);
                    return (
                      <motion.div
                        key={dot}
                        className={`w-4 h-4 rounded-full mx-auto ${isRaised ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-slate-200/80'}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, ...(isRaised ? { boxShadow: ['0 0 4px rgba(99,102,241,0.2)', '0 0 12px rgba(99,102,241,0.5)', '0 0 4px rgba(99,102,241,0.2)'] } : {}) }}
                        transition={isRaised
                          ? { scale: { delay: 0.3 + cellIdx * 0.1 + dot * 0.03 }, boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
                          : { delay: 0.3 + cellIdx * 0.1 + dot * 0.03 }}
                      />
                    );
                  })}
                </div>
                <motion.span
                  className="text-sm font-bold text-slate-400 tracking-wide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + cellIdx * 0.1 }}
                >{cell.letter}</motion.span>
              </motion.div>
            ))}
          </div>

          <motion.h2 className="text-slate-800 font-bold text-xl mb-1 tracking-tight"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Loading your lessons
          </motion.h2>
          <motion.p className="text-slate-400 text-sm mb-6 font-medium"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Preparing your personalized experience...
          </motion.p>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-5">
            <motion.div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              initial={{ width: '0%' }} animate={{ width: '90%' }}
              transition={{ duration: 3, ease: 'easeInOut' }} />
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-400/70"
                animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* ─── Hero ─── */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">BrailleLearn Intelligence Dashboard</span>
              </motion.span>
              <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 mb-1">
                <BookOpen className="w-9 h-9" /> Learning Dashboard
              </h1>
              <p className="text-blue-100 text-base">
                <span className="font-bold text-white">{totalLessonsCount}</span> lessons •
                personalized curriculum • <span className="text-blue-200">accessible to partially sighted & blind learners</span>
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div className="flex gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {[
                { value: `${overallProgress}%`, label: 'Complete', icon: TrendingUp },
                { value: completedLessons.toString(), label: 'Done', icon: Check },
                { value: `${avgScore}%`, label: 'Avg Score', icon: Star },
                { value: sortedLevels.length.toString(), label: 'Levels', icon: Layers }
              ].map((stat, i) => (
                <motion.div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2.5 text-center border border-white/20 min-w-[75px]"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}>
                  <stat.icon className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                  <div className="text-lg font-extrabold">{stat.value}</div>
                  <div className="text-xs text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-1.5 flex gap-1">
          {dashTabs.map(tab => (
            <motion.button key={tab.id} data-tab={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* ─── Main Content ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ═══ OVERVIEW TAB ═══ */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {/* Getting Started - shown when no plan exists */}
                  {!useCustomPlan && !studyPlan && (
                    <motion.div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl p-8 border-2 border-blue-200 mb-6 relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-200/30 rounded-full blur-3xl" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                            <Rocket className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">Welcome to BrailleLearn! 👋</h2>
                            <p className="text-gray-600">Let's set up your personalized learning journey in 3 easy steps. Designed for partially sighted learners — blind users can navigate entirely by voice.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                          {[
                            { step: 1, title: 'Create Your Plan', desc: 'Tell us your level and goals — BrailleLearn Intelligence builds a custom curriculum.', icon: Brain, action: () => setShowWizard(true), btn: 'Get Started', color: 'from-blue-500 to-blue-600' },
                            { step: 2, title: 'Browse Lessons', desc: 'Explore 50+ braille lessons and customize your focus areas.', icon: BookOpen, action: () => setActiveTab('lessons'), btn: 'View Lessons', color: 'from-green-500 to-emerald-600' },
                            { step: 3, title: 'Practice & Review', desc: 'Reinforce your learning with hands-on braille practice exercises.', icon: Wand2, action: () => setActiveTab('lessons'), btn: 'Start Practice', color: 'from-purple-500 to-purple-600' },
                          ].map((item) => (
                            <motion.div key={item.step} className="bg-white rounded-2xl p-5 border-2 border-blue-100 shadow-md"
                              whileHover={{ y: -3, shadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm">{item.step}</span>
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                                  <item.icon className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                              <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                              <button onClick={item.action}
                                className={`w-full py-2.5 bg-gradient-to-r ${item.color} text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all`}>
                                {item.btn}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: useCustomPlan ? 'Edit Plan' : 'Create Plan', icon: Brain, color: 'from-blue-500 to-blue-600', action: () => setShowWizard(true) },
                      { label: 'Browse Lessons', icon: BookOpen, color: 'from-green-500 to-emerald-600', action: () => setActiveTab('lessons') },
                      { label: 'Practice', icon: Wand2, color: 'from-purple-500 to-purple-600', action: () => setActiveTab('lessons') },
                      { label: 'Study Groups', icon: Users, color: 'from-orange-500 to-orange-600', action: () => setActiveTab('lessons') },
                    ].map((action, i) => (
                      <motion.button key={action.label} onClick={action.action}
                        className="relative overflow-hidden bg-white rounded-3xl shadow-lg border-2 border-blue-100 p-5 text-left group hover:shadow-xl hover:border-blue-300 transition-all"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="font-bold text-gray-900 text-sm">{action.label}</div>
                        <ChevronRight className="absolute top-5 right-4 w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </motion.button>
                    ))}
                  </div>

                  {/* Active Plan Banner */}
                  {useCustomPlan && studyPlan && (
                    <motion.div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-5 text-white mb-6 shadow-xl relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                      </div>
                      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Brain className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-extrabold">{studyPlan.title}</h3>
                            <p className="text-green-100 text-sm">{studyPlan.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/20">
                            <div className="text-lg font-extrabold">{studyPlan.totalLessons}</div>
                            <div className="text-xs text-green-100">Lessons</div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/20">
                            <div className="text-lg font-extrabold">{studyPlan.weeklyGoal}</div>
                            <div className="text-xs text-green-100">Per Week</div>
                          </div>
                          <button onClick={resetPlan} className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 text-center border border-white/20 hover:bg-white/30 transition-all">
                            <X className="w-5 h-5 mx-auto" />
                            <div className="text-xs text-green-100">Reset</div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── Weekly Schedule ─── */}
                  <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 mb-6 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" /> Weekly Schedule
                        </h3>
                        {weeklySchedule && (
                          <button onClick={() => { setWeeklySchedule(null); localStorage.removeItem('braillearn-weekly-schedule'); }}
                            className="text-xs font-bold text-gray-500 hover:text-red-500 transition-all flex items-center gap-1">
                            <X className="w-3.5 h-3.5" /> Reset Schedule
                          </button>
                        )}
                      </div>

                      {!weeklySchedule ? (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium mb-2">No schedule yet</p>
                          <p className="text-sm text-gray-500 mb-4">Create a study plan and your weekly schedule will be generated automatically!</p>
                          <motion.button onClick={() => setShowWizard(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Brain className="w-4 h-4" /> Create Your Plan
                          </motion.button>
                        </div>
                      ) : (
                        <div>
                          {/* Day Tabs */}
                          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-thin">
                            {Object.keys(weeklySchedule).map(day => {
                              const isToday = day === getTodayName();
                              const isSelected = day === selectedScheduleDay;
                              const dayBlocks = weeklySchedule[day]?.blocks || [];
                              const lessonCount = dayBlocks.filter(b => b.type === 'lesson').length;
                              return (
                                <button key={day} onClick={() => setSelectedScheduleDay(day)}
                                  className={`flex-shrink-0 px-3 py-2 rounded-xl font-bold text-xs transition-all border-2 ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                      : isToday
                                        ? 'border-green-300 bg-green-50 text-green-700 hover:border-green-400'
                                        : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                                  }`}>
                                  <div className="capitalize">{day.slice(0, 3)}</div>
                                  <div className="text-[10px] font-medium opacity-70">{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</div>
                                  {isToday && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-1" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Day Schedule */}
                          {weeklySchedule[selectedScheduleDay] ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                  {weeklySchedule[selectedScheduleDay].blocks.length} activities · ⏱ {Math.floor(weeklySchedule[selectedScheduleDay].totalMinutes / 60)}h {weeklySchedule[selectedScheduleDay].totalMinutes % 60}m
                                </span>
                                {selectedScheduleDay === getTodayName() && (
                                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Today
                                  </span>
                                )}
                              </div>
                              <div className="space-y-2">
                                {weeklySchedule[selectedScheduleDay].blocks.map((block, i) => {
                                  const typeStyles: Record<string, string> = {
                                    lesson: 'border-l-blue-500 bg-blue-50',
                                    practice: 'border-l-purple-500 bg-purple-50',
                                    review: 'border-l-amber-500 bg-amber-50',
                                    break: 'border-l-green-500 bg-green-50',
                                  };
                                  const typeIcons: Record<string, any> = {
                                    lesson: BookOpen, practice: Play, review: Star, break: Coffee
                                  };
                                  const Icon = typeIcons[block.type] || BookOpen;
                                  const blockContent = (
                                    <motion.div key={block.id || i}
                                      className={`rounded-xl border-l-4 p-3 ${typeStyles[block.type] || 'bg-gray-50 border-l-gray-400'} ${block.type === 'lesson' && block.lessonId ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all' : ''}`}
                                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                          <Icon className="w-4 h-4 text-gray-500" />
                                          <div>
                                            <div className="font-bold text-sm text-gray-900">{block.activity}</div>
                                            <div className="text-xs text-gray-500">{block.description}</div>
                                          </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <div className="text-xs font-bold text-gray-600">{block.time}</div>
                                          <div className="text-xs text-gray-400">{block.duration}m</div>
                                          {block.type === 'lesson' && block.lessonId && (
                                            <div className="text-[10px] text-blue-600 font-bold mt-0.5">Start →</div>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                  return block.type === 'lesson' && block.lessonId ? (
                                    <Link key={block.id || i} to={`/learn/${block.lessonId}`} onClick={() => window.scrollTo(0, 0)}>{blockContent}</Link>
                                  ) : blockContent;
                                })}
                              </div>
                              {weeklySchedule[selectedScheduleDay].motivationalMessage && (
                                <p className="text-sm text-gray-500 mt-3 italic">💬 {weeklySchedule[selectedScheduleDay].motivationalMessage}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">No activities scheduled for this day. Rest day! 😴</p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Level Progress Map */}
                  <motion.div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100 mb-6"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-blue-600" /> Level Progress Map
                    </h3>
                    <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
                      {Array.from({ length: 30 }, (_, i) => {
                        const level = i + 1;
                        const lvlLessons = allLessons.filter(l => l.level === level);
                        const done = lvlLessons.filter(l => getLessonProg(l.id)?.completed).length;
                        const pct = lvlLessons.length > 0 ? (done / lvlLessons.length) * 100 : 0;
                        return (
                          <motion.button key={level} onClick={() => { setActiveTab('lessons'); setExpandedLevel(expandedLevel === level ? null : level); }}
                            className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-extrabold transition-all ${
                              pct === 100 ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-md'
                                : pct > 0 ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 border-2 border-gray-200'
                            }`}
                            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                            {level}
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center mt-4 gap-6 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-100 border-2 border-gray-200 rounded" /> Not Started</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded" /> In Progress</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> Complete</span>
                    </div>
                  </motion.div>

                </motion.div>
              )}

              {/* ═══ LESSONS TAB ═══ */}
              {activeTab === 'lessons' && (
                <motion.div key="lessons" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {/* Lessons Sub-Tab Bar */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-1.5 flex gap-1 mb-6">
                    <button data-subtab="browse" onClick={() => setLessonsSubTab('browse')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        lessonsSubTab === 'browse' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'
                      }`}>
                      <BookOpen className="w-4 h-4" /> Browse Lessons
                    </button>
                    <button data-subtab="week" onClick={() => setLessonsSubTab('week')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                        lessonsSubTab === 'week' ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-md' : 'text-gray-600 hover:bg-purple-50'
                      }`}>
                      <Calendar className="w-4 h-4" /> Your Week
                      {weeklySchedule && <span className="ml-1 text-xs opacity-80">({Object.keys(weeklySchedule).length} days)</span>}
                    </button>
                  </div>

                  <div className="flex gap-5">
                    {/* ─── Main Lessons Area ─── */}
                    <div className="flex-1 min-w-0">

                      {/* ─── BROWSE SUB-TAB ─── */}
                      {lessonsSubTab === 'browse' && (
                        <>
                      {/* All Lessons by Level */}
                      <div className="space-y-4">
                        {sortedLevels.map((level, idx) => {
                          const info = generateLevelInfo(level);
                          const lvlLessons = lessonsByLevel[level] || [];
                          const done = lvlLessons.filter((l: Lesson) => getLessonProg(l.id)?.completed).length;
                          const pct = lvlLessons.length > 0 ? Math.round((done / lvlLessons.length) * 100) : 0;

                          return (
                            <motion.div key={level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
                              <motion.button
                                onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                                className={`w-full bg-white rounded-3xl shadow-lg p-5 border-2 transition-all text-left ${
                                  expandedLevel === level ? 'border-blue-500 shadow-xl' : 'border-blue-100 hover:border-blue-300 hover:shadow-xl'
                                }`}
                                whileHover={{ y: -2 }}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl shadow-lg">
                                      {info.emoji}
                                    </div>
                                    <div>
                                      <h2 className="text-lg font-extrabold text-gray-900">Level {level}: {info.title}</h2>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-sm text-blue-600 font-bold">{lvlLessons.length} lessons</span>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-gray-500">{done}/{lvlLessons.length} done</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="hidden sm:block text-right">
                                      <div className="text-sm font-bold text-gray-900 mb-1">{pct}%</div>
                                      <div className="w-20 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                          initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5, delay: idx * 0.03 }} />
                                      </div>
                                    </div>
                                    <motion.div animate={{ rotate: expandedLevel === level ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    </motion.div>
                                  </div>
                                </div>
                              </motion.button>

                              <AnimatePresence>
                                {expandedLevel === level && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <div className="mt-3 bg-blue-50/50 rounded-3xl p-5 border-2 border-blue-100">
                                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                                        {lvlLessons.map((lesson: Lesson) => (
                                          <motion.div key={lesson.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.02 }}>
                                            <LessonCard
                                              lesson={lesson}
                                              progress={getLessonProg(lesson.id)}
                                              isLocked={isLessonLocked(lesson)}
                                            />
                                          </motion.div>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}

                      </div>
                        </>
                      )}

                      {/* ─── YOUR WEEK SUB-TAB ─── */}
                      {lessonsSubTab === 'week' && (
                        <div className="space-y-4">
                          {!weeklySchedule ? (
                            <motion.div className="bg-white rounded-3xl shadow-xl p-10 border-2 border-blue-100 text-center"
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                              <Calendar className="w-14 h-14 text-blue-300 mx-auto mb-4" />
                              <h3 className="text-xl font-extrabold text-gray-900 mb-2">No Weekly Schedule Yet</h3>
                              <p className="text-gray-500 mb-5 max-w-md mx-auto">Create a study plan and your personalized weekly schedule will appear here with lessons, breaks, and time commitments for each day.</p>
                              <motion.button onClick={() => setShowWizard(true)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Brain className="w-5 h-5" /> Create Your Plan
                              </motion.button>
                            </motion.div>
                          ) : (
                            <>
                              {/* Week overview header */}
                              <motion.div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                                <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                                      <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-extrabold">Your Weekly Schedule</h3>
                                      <p className="text-indigo-200 text-sm">{Object.keys(weeklySchedule).length} study days · {Object.values(weeklySchedule).reduce((s, d) => s + d.totalMinutes, 0)} min total</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                                      {Object.values(weeklySchedule).reduce((s, d) => s + d.blocks.filter(b => b.type === 'lesson').length, 0)} lessons
                                    </span>
                                    <span className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold">
                                      {Math.round(Object.values(weeklySchedule).reduce((s, d) => s + d.totalMinutes, 0) / 60 * 10) / 10}h/week
                                    </span>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Each day card */}
                              {Object.entries(weeklySchedule).map(([day, daySchedule], dayIdx) => {
                                const isToday = day === getTodayName();
                                const lessonBlocks = daySchedule.blocks.filter(b => b.type === 'lesson');
                                const isEditing = aiEditingBlocks.includes(day);
                                return (
                                  <motion.div key={day}
                                    data-ai-day={day}
                                    className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden transition-all ${
                                      isToday ? 'border-green-400 shadow-green-100' : isEditing ? 'border-purple-400 shadow-purple-100' : 'border-blue-100'
                                    }`}
                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: dayIdx * 0.05 }}
                                    layout>
                                    {/* Day header */}
                                    <div className={`px-5 py-3 flex items-center justify-between ${isToday ? 'bg-green-50' : 'bg-gray-50'}`}>
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg font-extrabold text-gray-900 capitalize">{day}</span>
                                        {isToday && (
                                          <span className="text-xs font-bold bg-green-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Today
                                          </span>
                                        )}
                                        {isEditing && (
                                          <motion.span className="text-xs font-bold bg-purple-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1"
                                            animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                            <MousePointer2 className="w-3 h-3" /> AI Editing...
                                          </motion.span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                          <Clock className="w-3.5 h-3.5" />
                                          {Math.floor(daySchedule.totalMinutes / 60)}h {daySchedule.totalMinutes % 60}m
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                          {lessonBlocks.length} lesson{lessonBlocks.length !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Blocks timeline */}
                                    <div className="p-4 space-y-2">
                                      {daySchedule.blocks.map((block, i) => {
                                        const matchedLesson = block.lessonId ? allLessons.find(l => l.id === block.lessonId) : null;
                                        const prog = block.lessonId ? getLessonProg(block.lessonId) : null;
                                        const typeStyles: Record<string, { bg: string; border: string; dot: string }> = {
                                          lesson: { bg: 'bg-blue-50', border: 'border-l-blue-500', dot: 'bg-blue-500' },
                                          practice: { bg: 'bg-purple-50', border: 'border-l-purple-500', dot: 'bg-purple-500' },
                                          review: { bg: 'bg-amber-50', border: 'border-l-amber-500', dot: 'bg-amber-500' },
                                          break: { bg: 'bg-green-50', border: 'border-l-green-400', dot: 'bg-green-400' },
                                        };
                                        const style = typeStyles[block.type] || typeStyles.lesson;
                                        const blockIsEditing = isEditing && aiEditingBlocks.includes(`${day}-${i}`);

                                        return (
                                          <motion.div key={block.id || i}
                                            data-ai-block={`${day}-${i}`}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${style.border} ${style.bg} ${blockIsEditing ? 'ring-2 ring-purple-400 ring-offset-1' : ''} ${block.type === 'lesson' && block.lessonId ? 'hover:shadow-md transition-shadow' : ''}`}
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: dayIdx * 0.05 + i * 0.02 }}
                                            layout>
                                            {/* Time column */}
                                            <div className="w-16 flex-shrink-0 text-center">
                                              <div className="text-xs font-bold text-gray-700">{block.time}</div>
                                              <div className="text-[10px] text-gray-400">{block.duration}m</div>
                                            </div>
                                            {/* Dot */}
                                            <div className={`w-2.5 h-2.5 rounded-full ${style.dot} flex-shrink-0`} />
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                              <div className="font-bold text-sm text-gray-900 truncate">{matchedLesson?.title || block.activity}</div>
                                              <div className="text-xs text-gray-500 truncate">{block.description}</div>
                                            </div>
                                            {/* Action */}
                                            {block.type === 'lesson' && block.lessonId && (
                                              <Link to={`/learn/${block.lessonId}`}
                                                onClick={() => window.scrollTo(0, 0)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex-shrink-0 ${
                                                  prog?.completed
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                }`}>
                                                {prog?.completed ? '✓ Done' : 'Start →'}
                                              </Link>
                                            )}
                                          </motion.div>
                                        );
                                      })}
                                    </div>

                                    {/* Day tips */}
                                    {daySchedule.motivationalMessage && (
                                      <div className="px-5 pb-3">
                                        <p className="text-xs text-gray-500 italic">💬 {daySchedule.motivationalMessage}</p>
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}

                    </div>

                    {/* ─── AI Agent Sidebar ─── */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                      <div className="sticky top-6">
                        <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden"
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <MousePointer2 className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-xs">AI Agent</h3>
                              <p className="text-blue-200 text-[10px]">Tell me what to do — I'll execute it</p>
                            </div>
                          </div>

                          {/* Status Area */}
                          <div className="p-4 bg-gradient-to-b from-blue-50/30 to-white min-h-[80px] flex items-center justify-center">
                            {scheduleChatLoading ? (
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs text-blue-600 font-semibold">Executing action...</span>
                              </div>
                            ) : (
                              <div className="text-center">
                                <MousePointer2 className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                                <p className="text-xs text-gray-500 font-medium">Type a command below</p>
                                <p className="text-[10px] text-gray-400 mt-1">e.g. "Add number lessons to Monday"</p>
                              </div>
                            )}
                          </div>

                          {/* Command Input */}
                          <div className="px-3 py-2.5 border-t border-blue-100 bg-white flex items-center gap-1.5">
                            <input
                              type="text"
                              value={scheduleChatInput}
                              onChange={e => setScheduleChatInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && !scheduleChatLoading && handleScheduleChat(scheduleChatInput)}
                              placeholder="Tell the agent what to do..."
                              className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 text-xs font-medium outline-none transition-all"
                            />
                            <motion.button
                              onClick={() => handleScheduleChat(scheduleChatInput)}
                              disabled={!scheduleChatInput.trim() || scheduleChatLoading}
                              className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md disabled:opacity-40 disabled:shadow-none transition-all"
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Send className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ PRACTICE TAB ═══ */}
              {activeTab === 'practice' && (
                <motion.div key="practice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <Suspense fallback={
                    <div className="flex items-center justify-center py-24">
                      <div className="text-center">
                        <motion.div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
                        <p className="text-gray-500 font-medium">Loading practice...</p>
                      </div>
                    </div>
                  }>
                    <PracticePage />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── AI Plan Wizard Modal ─── */}
      <AnimatePresence>
        {showWizard && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowWizard(false); }}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border-2 border-blue-100"
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}>
              {generatingPlan ? (
                <div className="p-12 text-center">
                  <motion.div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl"
                    animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Brain className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-2">{generationMessage}</h3>
                  <div className="w-full bg-gray-100 rounded-full h-4 mt-6 overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      animate={{ width: `${generationProgress}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">{generationProgress}% complete</p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-4 text-white rounded-t-3xl relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-extrabold">Curriculum Builder</h2>
                        <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-white/20 rounded-xl"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="flex gap-2">
                        {wizardSteps.map((step, i) => (
                          <button key={step.id} onClick={() => setWizardStep(step.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              i <= currentWizardIndex ? 'bg-white text-blue-700' : 'bg-white/20 text-white/70'
                            }`}>
                            <span>{step.emoji}</span> {step.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                      {wizardStep === 'level' && (
                        <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">What's your current level?</h3>
                          <p className="text-gray-600 mb-4 text-sm">Select where you'd like to start</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: 1, label: 'Brand New', emoji: '🌱', desc: 'Never learned braille' },
                              { val: 5, label: 'Some Basics', emoji: '🌿', desc: 'Know some letters' },
                              { val: 10, label: 'Beginner', emoji: '⭐', desc: 'Can read simple words' },
                              { val: 15, label: 'Intermediate', emoji: '🚀', desc: 'Read sentences' },
                              { val: 20, label: 'Advanced', emoji: '💎', desc: 'Know contractions' },
                              { val: 25, label: 'Expert', emoji: '👑', desc: 'Near fluent reader' }
                            ].map(opt => (
                              <motion.button key={opt.val} onClick={() => setCustomForm({ ...customForm, currentLevel: opt.val })}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                                  customForm.currentLevel === opt.val ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                                }`} whileHover={{ scale: 1.03 }}>
                                <div className="text-xl mb-1">{opt.emoji}</div>
                                <div className="font-bold text-gray-900 text-xs">{opt.label}</div>
                                <div className="text-xs text-gray-500">{opt.desc}</div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 'style' && (
                        <motion.div key="style" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">How do you learn best?</h3>
                          <p className="text-gray-600 mb-4 text-sm">We'll adapt content to your style</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { val: 'visual', label: 'Visual', emoji: '👁️', desc: 'Patterns, diagrams, colors' },
                              { val: 'tactile', label: 'Tactile', emoji: '✋', desc: 'Hands-on, physical practice' },
                              { val: 'auditory', label: 'Auditory', emoji: '👂', desc: 'Sound, speech, listening' },
                              { val: 'kinesthetic', label: 'Kinesthetic', emoji: '🏃', desc: 'Movement & interaction' },
                              { val: 'mixed', label: 'Mixed', emoji: '🔀', desc: 'Combination of all styles' }
                            ].map(opt => (
                              <motion.button key={opt.val} onClick={() => setCustomForm({ ...customForm, learningStyle: opt.val })}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                                  customForm.learningStyle === opt.val ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                                }`} whileHover={{ scale: 1.03 }}>
                                <div className="text-xl mb-1">{opt.emoji}</div>
                                <div className="font-bold text-gray-900 text-sm">{opt.label}</div>
                                <div className="text-xs text-gray-500">{opt.desc}</div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 'focus' && (
                        <motion.div key="focus" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">What do you want to focus on?</h3>
                          <p className="text-gray-600 mb-4 text-sm">Select your primary learning goal</p>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { val: 'basics', label: 'Fundamentals', emoji: '📝' },
                              { val: 'words', label: 'Words & Vocab', emoji: '📖' },
                              { val: 'sentences', label: 'Sentences', emoji: '📰' },
                              { val: 'contractions', label: 'Contractions', emoji: '⚡' },
                              { val: 'writing', label: 'Writing', emoji: '✍️' },
                              { val: 'all', label: 'Everything', emoji: '🌟' }
                            ].map(opt => (
                              <motion.button key={opt.val} onClick={() => setCustomForm({ ...customForm, focusAreas: opt.val })}
                                className={`p-3 rounded-2xl border-2 text-left transition-all ${
                                  customForm.focusAreas === opt.val ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                                }`} whileHover={{ scale: 1.03 }}>
                                <span className="text-xl">{opt.emoji}</span>
                                <div className="font-bold text-gray-900 mt-1 text-sm">{opt.label}</div>
                              </motion.button>
                            ))}
                          </div>
                          <div className="mt-4">
                            <label className="text-sm font-bold text-gray-700 mb-1 block">Custom instructions (optional)</label>
                            <textarea value={customForm.customPrompt}
                              onChange={e => setCustomForm({ ...customForm, customPrompt: e.target.value })}
                              placeholder="e.g. I'm a teacher who needs to learn braille to help my student..."
                              className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm font-medium focus:border-blue-500 h-20 resize-none" />
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 'schedule' && (
                        <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">Set your schedule</h3>
                          <p className="text-gray-600 mb-4 text-sm">When and how often can you study?</p>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-bold text-gray-700 mb-2 block">Daily study time</label>
                              <div className="grid grid-cols-3 gap-3">
                                {[{ val: '15', label: '15 min', emoji: '⏱️' }, { val: '30', label: '30 min', emoji: '⏲️' }, { val: '60', label: '1 hour', emoji: '🕐' }].map(opt => (
                                  <button key={opt.val} onClick={() => setCustomForm({ ...customForm, dailyTime: opt.val })}
                                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                      customForm.dailyTime === opt.val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                    }`}>
                                    {opt.emoji} {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-bold text-gray-700 mb-2 block">Difficulty</label>
                              <div className="grid grid-cols-3 gap-3">
                                {[{ val: 'beginner', label: 'Easy', emoji: '🌱' }, { val: 'intermediate', label: 'Medium', emoji: '⭐' }, { val: 'advanced', label: 'Hard', emoji: '🔥' }].map(opt => (
                                  <button key={opt.val} onClick={() => setCustomForm({ ...customForm, difficulty: opt.val })}
                                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                                      customForm.difficulty === opt.val ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                    }`}>
                                    {opt.emoji} {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-bold text-gray-700 mb-2 block">Study days</label>
                              <div className="flex flex-wrap gap-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                  const fullDay = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][i];
                                  const isSelected = customForm.availableDays.includes(fullDay);
                                  return (
                                    <button key={day} onClick={() => setCustomForm({
                                      ...customForm,
                                      availableDays: isSelected
                                        ? customForm.availableDays.filter(d => d !== fullDay)
                                        : [...customForm.availableDays, fullDay]
                                    })}
                                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                        isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'
                                      }`}>
                                      {day}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 'review' && (
                        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">Review your plan</h3>
                          <p className="text-gray-600 mb-4 text-sm">Here's what BrailleLearn Intelligence will create for you</p>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-100 space-y-2">
                            {[
                              { label: 'Starting Level', value: `Level ${customForm.currentLevel}` },
                              { label: 'Learning Style', value: customForm.learningStyle },
                              { label: 'Focus Area', value: customForm.focusAreas },
                              { label: 'Difficulty', value: customForm.difficulty },
                              { label: 'Daily Time', value: `${customForm.dailyTime} minutes` },
                              { label: 'Study Days', value: `${customForm.availableDays.length} days/week` }
                            ].map(item => (
                              <div key={item.label} className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">{item.label}</span>
                                <span className="font-bold text-gray-900 capitalize">{item.value}</span>
                              </div>
                            ))}
                            {customForm.customPrompt && (
                              <div className="pt-3 border-t border-blue-200">
                                <span className="text-gray-600 font-medium text-sm">Custom note:</span>
                                <p className="text-gray-900 text-sm mt-1">{customForm.customPrompt}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="p-4 border-t border-gray-100 flex justify-between flex-shrink-0">
                    <button onClick={() => {
                      const idx = currentWizardIndex;
                      if (idx > 0) setWizardStep(wizardSteps[idx - 1].id);
                      else setShowWizard(false);
                    }}
                      className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                      {currentWizardIndex === 0 ? 'Cancel' : 'Back'}
                    </button>
                    <motion.button onClick={() => {
                      if (wizardStep === 'review') handleGeneratePlan();
                      else setWizardStep(wizardSteps[currentWizardIndex + 1].id);
                    }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      {wizardStep === 'review' ? (
                        <><Rocket className="w-5 h-5" /> Generate Plan</>
                      ) : (
                        <>Next <ArrowRight className="w-5 h-5" /></>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Cursor Overlay ─── */}
      <AnimatePresence>
        {aiCursorActive && (
          <motion.div className="fixed inset-0 z-[100] pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Cursor */}
            <motion.div
              className="absolute flex items-start gap-2"
              animate={{ left: aiCursorPos.x, top: aiCursorPos.y }}
              transition={{ type: 'tween', duration: 2.2, ease: 'easeInOut' }}>
              {/* Cursor icon — larger */}
              <div className="relative">
                <MousePointer2 className="w-9 h-9 text-purple-600 drop-shadow-[0_2px_12px_rgba(147,51,234,0.7)]" fill="rgba(147,51,234,0.25)" />
                {/* Pulse ring */}
                <motion.div className="absolute -inset-5 rounded-full border-[3px] border-purple-400/60"
                  animate={{ scale: [0.5, 2], opacity: [0.9, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                {/* Inner glow */}
                <motion.div className="absolute -inset-2 rounded-full bg-purple-400/20"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }} />
              </div>
              {/* Label — bigger, more prominent, shows what's being edited */}
              {aiCursorLabel && (
                <motion.div className="mt-8 -ml-3 bg-gray-900/95 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-2xl max-w-xs border border-purple-500/30"
                  initial={{ opacity: 0, y: -8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={aiCursorLabel}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
                  <span className="text-purple-400 mr-1.5 text-xs font-extrabold tracking-wider">AI AGENT</span>
                  <br />
                  <span className="text-white/90 leading-snug">{aiCursorLabel}</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Change Popup ─── */}
      <AnimatePresence>
        {aiChangePopup?.show && (
          <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setAiChangePopup(null); setAiCursorActive(false); setAiCursorLabel(''); }}>
            <motion.div
              className="relative bg-white rounded-3xl shadow-[0_20px_80px_rgba(99,102,241,0.2)] border border-indigo-100/60 max-w-md w-full mx-4 overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{aiChangePopup.title}</h3>
                    <p className="text-white/70 text-xs font-medium">AI made the following changes</p>
                  </div>
                </div>
              </div>
              {/* Changes list */}
              <div className="px-6 py-5 space-y-2.5">
                {aiChangePopup.changes.map((change, i) => (
                  <motion.div key={i}
                    className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-emerald-50/50 rounded-xl px-4 py-3 border border-green-100"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-snug">{change}</p>
                  </motion.div>
                ))}
                {aiChangePopup.changes.length === 0 && (
                  <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <p className="text-sm text-gray-700 font-medium">Changes applied successfully!</p>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="px-6 pb-5">
                <button
                  onClick={() => { setAiChangePopup(null); setAiCursorActive(false); setAiCursorLabel(''); }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-sm">
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Toast Notifications ─── */}
      <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastNotification key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default LearnPage;
