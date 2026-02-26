import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, BookOpen, TrendingUp,
  Send, Sparkles,
  Check, ChevronDown,
  Layers, Brain,
  X, ArrowRight, BarChart,
  Rocket, Search, Grid3X3, List,
  Calendar,
  Play, Users, Wand2,
  ChevronRight, Coffee,
  CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import LessonCard from '../components/lessons/LessonCard';
import { openRouterService } from '../services/openRouterService';
import { lessons } from '../data/lessons';
import type { ScheduledLesson, StudyPlan, Lesson, LessonProgress } from '../types/types';

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
type FilterStatus = 'all' | 'completed' | 'in-progress' | 'locked';
type FilterDifficulty = 'all' | 'beginner' | 'intermediate' | 'advanced';
type WizardStep = 'level' | 'style' | 'focus' | 'schedule' | 'review';
type DashboardTab = 'overview' | 'lessons';

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
  const { user } = useAuth();

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



  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<FilterDifficulty>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Schedule
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<string>(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  });
  const [lessonViewMode, setLessonViewMode] = useState<'today' | 'all'>('all');

  // Schedule Customization Chat
  const [scheduleChatMessages, setScheduleChatMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'ai'; timestamp: Date }>>([]);
  const [scheduleChatInput, setScheduleChatInput] = useState('');
  const [scheduleChatLoading, setScheduleChatLoading] = useState(false);
  const scheduleChatEndRef = React.useRef<HTMLDivElement>(null);

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
    const init = async () => {
      document.title = 'Learn Braille - BrailleLearn';
      window.scrollTo(0, 0);
      speak('Welcome to the learning dashboard.');

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

        if (user) {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id);
          if (progress) setLessonProgress(progress);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    init();
  }, [user, speak]);

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

  // Schedule Customization Chat — handles weekly schedule, plan changes, and general braille Q&A
  const handleScheduleChat = async (message: string) => {
    if (!message.trim()) return;
    setScheduleChatLoading(true);
    setScheduleChatMessages(prev => [...prev, { id: Date.now().toString(), text: message, sender: 'user', timestamp: new Date() }]);
    setScheduleChatInput('');

    try {
      const today = getTodayName();
      const scheduleContext = weeklySchedule
        ? `Weekly schedule (${Object.keys(weeklySchedule).length} days):\n${Object.entries(weeklySchedule).map(([day, sched]) =>
          `${day.toUpperCase()}: ${sched.blocks.filter(b => b.type === 'lesson').map(b => b.lessonId ? `${b.activity} [${b.lessonId}]` : b.activity).join(', ')} (${sched.totalMinutes}min total)`
        ).join('\n')}\nToday is ${today}.`
        : 'No weekly schedule generated yet. The user needs to create a plan first.';

      const planContext = studyPlan
        ? `Study plan: "${studyPlan.title}" — ${studyPlan.totalLessons} lessons, ${studyPlan.statistics?.lessonsCompleted || 0} completed. Weekly goal: ${studyPlan.weeklyGoal}. Focus: ${studyPlan.preferences?.focusAreas?.join(', ') || 'all'}. Difficulty: ${studyPlan.preferences?.difficultyProgression || 'gradual'}. Days: ${studyPlan.preferences?.availableDays?.join(', ') || 'weekdays'}.`
        : 'No study plan yet.';

      const lessonBankSummary = `Available lesson bank: ${allLessons.length} total lessons. Categories: basics (letters A-Z, ${allLessons.filter(l => l.category === 'basics').length} lessons), words (${allLessons.filter(l => l.category === 'words').length} lessons), sentences (${allLessons.filter(l => l.category === 'sentences').length} lessons), contractions (${allLessons.filter(l => l.category === 'contractions').length} lessons), advanced (${allLessons.filter(l => l.category === 'advanced').length} lessons). Levels 1–30.`;

      const systemPrompt = `You are BrailleLearn Intelligence — a powerful learning assistant. You handle ANY request about the user's braille learning:
- Change their weekly schedule (swap days, adjust times, add/remove days, reorder lessons)
- Change their study plan (focus areas, difficulty, weekly goals, lesson order)
- Filter or recommend specific lessons from the lesson bank
- Answer questions about braille, learning strategies, etc.

User progress: ${completedLessons}/${totalLessonsCount} lessons completed. Level: ${customForm.currentLevel}.
${scheduleContext}
${planContext}
${lessonBankSummary}

IMPORTANT: If the user wants to make a CHANGE (schedule, plan, lessons), include a JSON code block. If they're just asking a question, respond normally without JSON.

JSON format for changes:
\`\`\`json
{
  "type": "schedule" | "plan" | "both",
  "weeklySchedule": {
    "monday": {
      "date": "monday",
      "totalMinutes": number,
      "blocks": [
        { "id": "mon-1", "time": "9:00 AM", "duration": 30, "activity": "Activity name", "type": "lesson|practice|review|break", "description": "Details", "lessonId": "lesson-1", "lessonSuggestion": "Lesson title" }
      ],
      "tips": ["tip"],
      "motivationalMessage": "message"
    }
  },
  "planUpdates": {
    "title": "optional new title",
    "weeklyGoal": number,
    "preferences": {
      "difficultyProgression": "gradual|moderate|aggressive",
      "focusAreas": ["basics","words","sentences","contractions","advanced"],
      "availableDays": ["monday","tuesday",...],
      "maxLessonsPerDay": number
    }
  }
}
\`\`\`

For "schedule" type: include "weeklySchedule" with ALL days the user wants scheduled.
For "plan" type: include "planUpdates" with only the fields to change.
For "both": include both "weeklySchedule" and "planUpdates".
Use actual lesson IDs (lesson-1 through lesson-50, adventure-1, etc.) in lessonId when assigning lessons.
Respond with a friendly message explaining what you changed, then the JSON block.`;

      const response = await openRouterService.chat(systemPrompt, message, { maxTokens: 3000, temperature: 0.7 });

      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      let chatResponse = response;
      let appliedChanges = false;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          chatResponse = response.replace(/```json\s*[\s\S]*?\s*```/, '').replace(/```\s*[\s\S]*?\s*```/, '').trim();
          if (!chatResponse) chatResponse = "Done! I've updated your learning setup. ✨";

          // Handle weekly schedule updates
          if ((parsed.type === 'schedule' || parsed.type === 'both') && parsed.weeklySchedule) {
            const newWeekly: WeeklySchedule = {};
            Object.entries(parsed.weeklySchedule).forEach(([day, sched]: [string, any]) => {
              newWeekly[day] = {
                date: day,
                totalMinutes: sched.totalMinutes || sched.blocks?.reduce((s: number, b: any) => s + (b.duration || 0), 0) || 60,
                blocks: (sched.blocks || []).map((b: any, i: number) => ({
                  ...b,
                  id: b.id || `${day}-${i}`
                })),
                tips: sched.tips || ['Keep up the great work!'],
                motivationalMessage: sched.motivationalMessage || 'You\'re making progress! 🌟'
              };
            });
            setWeeklySchedule(newWeekly);
            localStorage.setItem('braillearn-weekly-schedule', JSON.stringify(newWeekly));
            addToast('success', '📅 Weekly Schedule Updated!', `Schedule updated for ${Object.keys(newWeekly).length} days.`);
            appliedChanges = true;
          }
          // Legacy: single-day schedule object
          else if ((parsed.type === 'schedule' || !parsed.type) && parsed.schedule?.blocks) {
            const dayKey = today;
            const updated = { ...(weeklySchedule || {}), [dayKey]: {
              ...parsed.schedule,
              date: dayKey,
              blocks: parsed.schedule.blocks.map((b: any, i: number) => ({ ...b, id: b.id || `${dayKey}-${i}` }))
            }};
            setWeeklySchedule(updated);
            localStorage.setItem('braillearn-weekly-schedule', JSON.stringify(updated));
            addToast('success', '📅 Schedule Updated!', `Today's schedule updated with ${parsed.schedule.blocks.length} activities.`);
            appliedChanges = true;
          }
          // Legacy: bare blocks array
          else if (!parsed.type && parsed.blocks) {
            const dayKey = today;
            const updated = { ...(weeklySchedule || {}), [dayKey]: {
              date: dayKey,
              totalMinutes: parsed.totalMinutes || parsed.blocks.reduce((s: number, b: any) => s + (b.duration || 0), 0),
              blocks: parsed.blocks.map((b: any, i: number) => ({ ...b, id: b.id || `${dayKey}-${i}` })),
              tips: parsed.tips || [],
              motivationalMessage: parsed.motivationalMessage || ''
            }};
            setWeeklySchedule(updated);
            localStorage.setItem('braillearn-weekly-schedule', JSON.stringify(updated));
            addToast('success', '📅 Schedule Updated!', `Today's schedule updated.`);
            appliedChanges = true;
          }

          // Handle study plan updates
          if ((parsed.type === 'plan' || parsed.type === 'both') && parsed.planUpdates && studyPlan) {
            const updates = parsed.planUpdates;
            const updatedPlan = { ...studyPlan };

            if (updates.title) updatedPlan.title = updates.title;
            if (updates.weeklyGoal) updatedPlan.weeklyGoal = updates.weeklyGoal;
            if (updates.preferences) {
              updatedPlan.preferences = {
                ...updatedPlan.preferences,
                ...updates.preferences,
                focusAreas: updates.preferences.focusAreas || updatedPlan.preferences.focusAreas,
                availableDays: updates.preferences.availableDays || updatedPlan.preferences.availableDays,
                preferredTimeSlots: updates.preferences.preferredTimeSlots || updatedPlan.preferences.preferredTimeSlots,
              };
            }

            if (updates.preferences?.focusAreas || updates.preferences?.difficultyProgression) {
              const focusAreas = updates.preferences?.focusAreas || updatedPlan.preferences.focusAreas;
              let selectedLessons = lessons.filter(lesson => {
                if (focusAreas.includes('all')) return true;
                return focusAreas.includes(lesson.category) || lesson.category === 'basics';
              });
              const diff = updates.preferences?.difficultyProgression || updatedPlan.preferences.difficultyProgression;
              if (diff === 'gradual') selectedLessons = selectedLessons.filter(l => l.level <= 10);
              else if (diff === 'moderate') selectedLessons = selectedLessons.filter(l => l.level <= 20);

              const startDate = new Date();
              const scheduledLessons: ScheduledLesson[] = selectedLessons.slice(0, 50).map((lesson, index) => {
                const scheduleDate = new Date(startDate);
                scheduleDate.setDate(startDate.getDate() + Math.floor(index / (updates.weeklyGoal || updatedPlan.weeklyGoal || 3)) * 7 + (index % 3));
                const existing = updatedPlan.scheduledLessons.find(sl => sl.id === lesson.id);
                return { ...lesson, scheduledDate: scheduleDate.toISOString(), isCompleted: existing?.isCompleted || false, canReschedule: true, priority: index < 10 ? 'high' as const : index < 30 ? 'medium' as const : 'low' as const, estimatedCompletionTime: lesson.duration, adaptiveDifficulty: 'normal' as const } as ScheduledLesson;
              });
              updatedPlan.scheduledLessons = scheduledLessons;
              updatedPlan.totalLessons = scheduledLessons.length;
            }

            updatedPlan.lastAIOptimization = new Date().toISOString();
            setStudyPlan(updatedPlan);
            localStorage.setItem('braillearn-study-plan', JSON.stringify(updatedPlan));

            // Also rebuild weekly schedule from updated plan
            const newWeekly = buildWeeklySchedule(updatedPlan, parseInt(customForm.dailyTime) || 30);
            setWeeklySchedule(newWeekly);
            localStorage.setItem('braillearn-weekly-schedule', JSON.stringify(newWeekly));

            addToast('success', '📚 Plan & Schedule Updated!', `Plan "${updatedPlan.title}" and weekly schedule have been updated.`);
            appliedChanges = true;
          }

          if (!appliedChanges) {
            chatResponse += '\n\n_I can help you make changes — try asking me to adjust your schedule, change lesson focus, or modify your study days._';
          }
        } catch {
          // JSON parsing failed, just show the text response
        }
      }

      setScheduleChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: chatResponse || response,
        sender: 'ai',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Schedule chat error:', error);
      setScheduleChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: '⚠️ I\'m having trouble processing your request right now. Please try again in a moment!',
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
    setScheduleChatLoading(false);
    setTimeout(() => scheduleChatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
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
    let result = allLessons;

    // Filter by today's schedule if in 'today' mode
    if (lessonViewMode === 'today' && weeklySchedule) {
      const todaySchedule = weeklySchedule[getTodayName()];
      if (todaySchedule) {
        const todayLessonIds = todaySchedule.blocks
          .filter(b => b.type === 'lesson' && b.lessonId)
          .map(b => b.lessonId!);
        if (todayLessonIds.length > 0) {
          const todayResult = result.filter(l => todayLessonIds.includes(l.id));
          // Only apply filter if it actually matches real lessons; otherwise show all
          if (todayResult.length > 0) {
            result = todayResult;
          }
        }
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l => l.title.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter(l => {
        const prog = getLessonProg(l.id);
        if (filterStatus === 'completed') return prog?.completed;
        if (filterStatus === 'in-progress') return prog && !prog.completed;
        if (filterStatus === 'locked') return isLessonLocked(l);
        return true;
      });
    }
    if (filterDifficulty !== 'all') {
      result = result.filter(l => {
        if (filterDifficulty === 'beginner') return l.level <= 10;
        if (filterDifficulty === 'intermediate') return l.level > 10 && l.level <= 20;
        if (filterDifficulty === 'advanced') return l.level > 20;
        return true;
      });
    }
    return result;
  }, [allLessons, searchQuery, filterStatus, filterDifficulty, lessonProgress, lessonViewMode, weeklySchedule]);

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
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
            <BookOpen className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading your learning journey...</p>
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
                personalized curriculum
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
            <motion.button key={tab.id} onClick={() => setActiveTab(tab.id)}
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
                            <p className="text-gray-600">Let's set up your personalized learning journey in 3 easy steps.</p>
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
                                    <Link key={block.id || i} to={`/learn/${block.lessonId}`}>{blockContent}</Link>
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
                  <div className="flex gap-5">
                    {/* ─── Main Lessons Area ─── */}
                    <div className="flex-1 min-w-0">
                      {/* Filters */}
                      <div className="bg-white rounded-3xl shadow-xl p-5 border-2 border-blue-100 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search lessons..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm font-medium" />
                            </div>
                          </div>
                          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FilterStatus)}
                            className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 font-bold text-sm text-gray-700">
                            <option value="all">All Status</option>
                            <option value="completed">✅ Completed</option>
                            <option value="in-progress">🔵 In Progress</option>
                            <option value="locked">🔒 Locked</option>
                          </select>
                          <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value as FilterDifficulty)}
                            className="px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 font-bold text-sm text-gray-700">
                            <option value="all">All Levels</option>
                            <option value="beginner">🌱 Beginner</option>
                            <option value="intermediate">⭐ Intermediate</option>
                            <option value="advanced">🏆 Advanced</option>
                          </select>
                          <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
                            <button onClick={() => setViewMode('grid')} className={`px-2.5 py-2.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                              <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`px-2.5 py-2.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                              <List className="w-4 h-4" />
                            </button>
                          </div>
                          {weeklySchedule && (
                            <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden">
                              <button onClick={() => setLessonViewMode('today')}
                                className={`px-3 py-2.5 font-bold text-xs transition-all ${lessonViewMode === 'today' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                📅 Today
                              </button>
                              <button onClick={() => setLessonViewMode('all')}
                                className={`px-3 py-2.5 font-bold text-xs transition-all ${lessonViewMode === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                📚 All
                              </button>
                            </div>
                          )}
                        </div>
                        {(searchQuery || filterStatus !== 'all' || filterDifficulty !== 'all' || lessonViewMode === 'today') && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-500">
                              {lessonViewMode === 'today' ? `Today's lessons: ${filteredLessons.length}` : `Showing ${filteredLessons.length} of ${totalLessonsCount}`}
                            </span>
                            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterDifficulty('all'); setLessonViewMode('all'); }}
                              className="text-blue-600 font-bold hover:underline">Clear</button>
                          </div>
                        )}
                      </div>

                      {/* Levels */}
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

                        {sortedLevels.length === 0 && (
                          <motion.div className="bg-white rounded-3xl shadow-xl p-10 border-2 border-blue-100 text-center"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Search className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                            <h3 className="text-lg font-extrabold text-gray-900 mb-2">No lessons match your filters</h3>
                            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterDifficulty('all'); }}
                              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                              Clear Filters
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* ─── Chat Sidebar ─── */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                      <div className="sticky top-6">
                        <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden"
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Send className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-xs">Lesson Assistant</h3>
                              <p className="text-blue-200 text-[10px]">Ask to customize your learning</p>
                            </div>
                          </div>

                          {/* Chat Messages */}
                          <div className="max-h-[40vh] overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-blue-50/30 to-white">
                            {scheduleChatMessages.length === 0 && (
                              <div className="space-y-1.5">
                                {[
                                  'Focus on contractions',
                                  'Numbers and math',
                                  'Shorter, faster lessons',
                                  'More practice A–J',
                                  'More review sessions',
                                  'Evening-only schedule'
                                ].map(suggestion => (
                                  <button key={suggestion} onClick={() => handleScheduleChat(suggestion)}
                                    className="w-full text-left text-xs px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-medium border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all">
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                            {scheduleChatMessages.map(msg => (
                              <motion.div key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                                <div className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs ${
                                  msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                                    : 'bg-white border border-blue-100 text-gray-800 rounded-bl-md shadow-sm'
                                }`}>
                                  {msg.sender === 'ai' && <span className="text-[10px] font-bold text-blue-600 block mb-0.5">🧠 BrailleLearn</span>}
                                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                </div>
                              </motion.div>
                            ))}
                            {scheduleChatLoading && (
                              <div className="flex justify-start">
                                <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex gap-0.5">
                                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-[10px] text-blue-500 font-medium">Thinking...</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            <div ref={scheduleChatEndRef} />
                          </div>

                          {/* Chat Input */}
                          <div className="px-3 py-2.5 border-t border-blue-100 bg-white flex items-center gap-1.5">
                            <input
                              type="text"
                              value={scheduleChatInput}
                              onChange={e => setScheduleChatInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && !scheduleChatLoading && handleScheduleChat(scheduleChatInput)}
                              placeholder="Ask about lessons..."
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
