import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Calendar, Plus, Trash2,
  Play, GraduationCap, Users, Wand2,
  ChevronRight, Sun, Moon, Coffee, Sunset,
  CheckCircle, AlertTriangle, Info, Heart, MessageSquare
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
type DashboardTab = 'overview' | 'lessons' | 'community' | 'create';

interface ScheduleBlock {
  id: string;
  time: string;
  duration: number;
  activity: string;
  type: 'lesson' | 'practice' | 'review' | 'break';
  description: string;
  lessonSuggestion?: string;
}

interface DailySchedule {
  date: string;
  totalMinutes: number;
  blocks: ScheduleBlock[];
  tips: string[];
  motivationalMessage: string;
}

interface CustomClass {
  id: string;
  name: string;
  description: string;
  level: string;
  createdAt: string;
  lessons: string[];
  schedule: string[];
  color: string;
}

interface AILesson {
  id: string;
  title: string;
  description: string;
  level: number;
  category: string;
  duration: number;
  objectives?: string[];
  content?: any;
  exercises: any[];
  prerequisites: string[];
  isAIGenerated: boolean;
}

interface CommunityBrailleWord {
  id: string;
  dots: boolean[];
  word: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

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
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [scheduleHours, setScheduleHours] = useState(2);
  const [preferredTime, setPreferredTime] = useState<string[]>(['morning']);

  // Schedule Customization Chat
  const [scheduleChatMessages, setScheduleChatMessages] = useState<Array<{ id: string; text: string; sender: 'user' | 'ai'; timestamp: Date }>>([]);
  const [scheduleChatInput, setScheduleChatInput] = useState('');
  const [scheduleChatLoading, setScheduleChatLoading] = useState(false);
  const scheduleChatEndRef = React.useRef<HTMLDivElement>(null);

  // Create Class
  const [myClasses, setMyClasses] = useState<CustomClass[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('beginner');
  const [newClassColor, setNewClassColor] = useState('blue');

  // Create Lesson
  const [newLessonTopic, setNewLessonTopic] = useState('');
  const [newLessonLevel, setNewLessonLevel] = useState(1);
  const [newLessonDuration, setNewLessonDuration] = useState(15);
  const [newLessonStyle, setNewLessonStyle] = useState('visual');
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [aiLessons, setAILessons] = useState<AILesson[]>([]);

  // Braille Dot Creator
  const [selectedDots, setSelectedDots] = useState<boolean[]>([false, false, false, false, false, false]);
  const [dotWordName, setDotWordName] = useState('');
  const [dotWordDescription, setDotWordDescription] = useState('');
  const [communityWords, setCommunityWords] = useState<CommunityBrailleWord[]>([]);

  // Toast Notifications & Confirmations
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
        const savedClasses = localStorage.getItem('braillearn-classes');
        if (savedClasses) setMyClasses(JSON.parse(savedClasses));
        const savedAILessons = localStorage.getItem('braillearn-ai-lessons');
        if (savedAILessons) setAILessons(JSON.parse(savedAILessons));
        const savedSchedule = localStorage.getItem('braillearn-daily-schedule');
        if (savedSchedule) setDailySchedule(JSON.parse(savedSchedule));
        const savedCommunityWords = localStorage.getItem('braillearn-community-words');
        if (savedCommunityWords) {
          setCommunityWords(JSON.parse(savedCommunityWords));
        } else {
          const seedWords: CommunityBrailleWord[] = [
            { id: 'seed-1', dots: [true, false, false, false, false, false], word: 'Letter A', description: 'The first letter — just dot 1', createdBy: 'BrailleBot', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 'seed-2', dots: [true, true, false, false, false, false], word: 'Letter B', description: 'Dots 1-2 make the letter B', createdBy: 'Sarah_T', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: 'seed-3', dots: [true, false, false, true, false, false], word: 'Letter C', description: 'Two top dots together', createdBy: 'Alex_M', createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'seed-4', dots: [true, false, false, true, true, false], word: 'Letter D', description: 'Three dots in an L shape', createdBy: 'Jordan_K', createdAt: new Date(Date.now() - 43200000).toISOString() },
            { id: 'seed-5', dots: [true, false, false, false, true, false], word: 'Letter E', description: 'Dots 1 and 5', createdBy: 'Taylor_R', createdAt: new Date().toISOString() },
          ];
          setCommunityWords(seedWords);
          localStorage.setItem('braillearn-community-words', JSON.stringify(seedWords));
        }

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
      plan = await openRouterService.generateStudyPlan(
        customForm.currentLevel,
        [customForm.focusAreas],
        customForm.learningStyle,
        parseInt(customForm.dailyTime) || 30,
        customForm.customPrompt
      ) as unknown as StudyPlan;
    } catch (err) {
      console.error('AI plan generation failed, using local generator:', err);
      setGenerationMessage('⚠️ BrailleLearn Intelligence unavailable — generating smart default plan...');
      await new Promise(r => setTimeout(r, 1200));
      plan = generateStudyPlan(customForm);
    }

    setStudyPlan(plan);
    localStorage.setItem('braillearn-study-plan', JSON.stringify(plan));
    localStorage.setItem('braillearn-schedule-confirmed', 'true');
    setScheduleConfirmed(true);
    setUseCustomPlan(true);
    setShowWizard(false);
    setGeneratingPlan(false);
    addToast('success', '🎉 Study Plan Created!', `Your personalized "${plan.title || 'Braille Journey'}" plan with ${plan.totalLessons} lessons is ready. Check the Overview tab!`);
    setActiveTab('overview');
    speak('Your personalized study plan is ready!');
  };

  const resetPlan = () => {
    localStorage.removeItem('braillearn-study-plan');
    localStorage.removeItem('braillearn-schedule-confirmed');
    setStudyPlan(null);
    setScheduleConfirmed(false);
    setUseCustomPlan(false);
    addToast('info', 'Plan Reset', 'Your study plan has been cleared. Create a new one anytime from the Overview tab.');
  };

  // AI Schedule
  const handleGenerateSchedule = async () => {
    setGeneratingSchedule(true);
    try {
      const schedule = await openRouterService.generateDailySchedule(
        scheduleHours,
        customForm.currentLevel,
        completedLessons,
        totalLessonsCount,
        [customForm.focusAreas],
        preferredTime
      );
      setDailySchedule(schedule);
      localStorage.setItem('braillearn-daily-schedule', JSON.stringify(schedule));
      addToast('success', '📅 Schedule Generated!', `Your ${scheduleHours}-hour study schedule is ready with ${schedule.blocks?.length || 0} activities.`);
    } catch (error) {
      console.error('AI schedule generation failed:', error);
      setDailySchedule({
        date: new Date().toISOString().split('T')[0],
        totalMinutes: scheduleHours * 60,
        blocks: [
          { id: '1', time: '9:00 AM', duration: 30, activity: '📖 Pattern Review', type: 'review', description: 'Warm up with familiar patterns' },
          { id: '2', time: '9:30 AM', duration: 30, activity: '✨ New Lesson', type: 'lesson', description: 'Learn new braille characters', lessonSuggestion: 'Continue your current level' },
          { id: '3', time: '10:00 AM', duration: 10, activity: '☕ Break', type: 'break', description: 'Rest your eyes and fingers' },
          { id: '4', time: '10:10 AM', duration: 30, activity: '⚡ Speed Practice', type: 'practice', description: 'Build reading speed' },
        ],
        tips: ['⚠️ Schedule generation was unavailable — showing a default schedule. Try again later for a personalized one!', 'Take breaks between sessions', 'Focus on accuracy before speed'],
        motivationalMessage: 'Every practice session gets you closer to mastery! 🌟'
      });
    }
    setGeneratingSchedule(false);
  };

  // Schedule Customization Chat
  const handleScheduleChat = async (message: string) => {
    if (!message.trim()) return;
    setScheduleChatLoading(true);
    setScheduleChatMessages(prev => [...prev, { id: Date.now().toString(), text: message, sender: 'user', timestamp: new Date() }]);
    setScheduleChatInput('');

    try {
      const currentScheduleContext = dailySchedule
        ? `Current schedule (${dailySchedule.blocks.length} blocks, ${dailySchedule.totalMinutes} min total):\n${dailySchedule.blocks.map(b => `- ${b.time}: ${b.activity} (${b.duration}min, type: ${b.type}) — ${b.description}`).join('\n')}`
        : 'No schedule generated yet.';

      const systemPrompt = `You are BrailleLearn Intelligence — a smart schedule customization assistant for braille learners. The user wants to modify their study schedule/lessons. Based on their request, you MUST:
1. Respond with a friendly explanation of what you changed
2. Return a NEW complete schedule as a JSON block

User progress: ${completedLessons}/${totalLessonsCount} lessons completed. Level: ${customForm.currentLevel}.
${currentScheduleContext}

IMPORTANT: After your friendly message, you MUST include a JSON code block with the updated schedule in this exact format:
\`\`\`json
{
  "date": "${new Date().toISOString().split('T')[0]}",
  "totalMinutes": number,
  "blocks": [
    {
      "id": "unique-id",
      "time": "9:00 AM",
      "duration": 30,
      "activity": "Activity name",
      "type": "lesson|practice|review|break",
      "description": "What to focus on",
      "lessonSuggestion": "optional suggestion"
    }
  ],
  "tips": ["tip1", "tip2"],
  "motivationalMessage": "motivational message"
}
\`\`\`

Always create a complete, realistic schedule based on the user's request. Adjust times, durations, activity types, and lessons to match what they asked for.`;

      const response = await openRouterService.chat(systemPrompt, message, { maxTokens: 2000, temperature: 0.8 });

      // Try to extract JSON schedule from the response
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
      let updatedSchedule = null;
      let chatResponse = response;

      if (jsonMatch) {
        try {
          updatedSchedule = JSON.parse(jsonMatch[1]);
          chatResponse = response.replace(/```json\s*[\s\S]*?\s*```/, '').replace(/```\s*[\s\S]*?\s*```/, '').trim();
          if (!chatResponse) chatResponse = "Done! I've updated your schedule based on your request. 📅";
        } catch {
          // JSON parsing failed, just show the text response
        }
      }

      if (updatedSchedule && updatedSchedule.blocks) {
        // Ensure each block has an id
        updatedSchedule.blocks = updatedSchedule.blocks.map((b: any, i: number) => ({
          ...b,
          id: b.id || `block-${i + 1}`
        }));
        setDailySchedule(updatedSchedule);
        localStorage.setItem('braillearn-daily-schedule', JSON.stringify(updatedSchedule));
        addToast('success', '📅 Schedule Updated!', `Your schedule has been customized with ${updatedSchedule.blocks.length} activities.`);
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

  // Create Class
  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    const newClass: CustomClass = {
      id: `class-${Date.now()}`,
      name: newClassName,
      description: newClassDesc,
      level: newClassLevel,
      createdAt: new Date().toISOString(),
      lessons: [],
      schedule: [],
      color: newClassColor
    };
    const updated = [...myClasses, newClass];
    setMyClasses(updated);
    localStorage.setItem('braillearn-classes', JSON.stringify(updated));
    setNewClassName('');
    setNewClassDesc('');
    addToast('success', '🎓 Class Created!', `"${newClass.name}" has been added to your classes. You can find it on the Overview tab.`);
    speak(`Class "${newClass.name}" created!`);
  };

  const handleDeleteClass = (id: string) => {
    const cls = myClasses.find(c => c.id === id);
    const updated = myClasses.filter(c => c.id !== id);
    setMyClasses(updated);
    localStorage.setItem('braillearn-classes', JSON.stringify(updated));
    setDeleteConfirmId(null);
    addToast('info', 'Class Deleted', `"${cls?.name || 'Class'}" has been removed.`);
  };

  // Braille Dot Creator
  const dotsToUnicode = (dots: boolean[]): string => {
    const dotValues = [1, 2, 4, 8, 16, 32];
    const charCode = 0x2800 + dots.reduce((acc, dot, i) => acc + (dot ? dotValues[i] : 0), 0);
    return String.fromCharCode(charCode);
  };

  const handleCreateBrailleWord = () => {
    if (!dotWordName.trim() || !selectedDots.some(d => d)) return;
    const newWord: CommunityBrailleWord = {
      id: `bw-${Date.now()}`,
      dots: [...selectedDots],
      word: dotWordName.trim(),
      description: dotWordDescription.trim(),
      createdBy: user?.email?.split('@')[0] || 'Anonymous',
      createdAt: new Date().toISOString(),
    };
    const updated = [newWord, ...communityWords];
    setCommunityWords(updated);
    localStorage.setItem('braillearn-community-words', JSON.stringify(updated));
    setSelectedDots([false, false, false, false, false, false]);
    setDotWordName('');
    setDotWordDescription('');
    addToast('success', '🎉 Braille Word Created!', `"${newWord.word}" has been shared with the community!`);
    speak(`Braille word "${newWord.word}" created!`);
  };

  const handleDeleteBrailleWord = (id: string) => {
    const updated = communityWords.filter(w => w.id !== id);
    setCommunityWords(updated);
    localStorage.setItem('braillearn-community-words', JSON.stringify(updated));
    addToast('info', 'Word Removed', 'Your braille word has been removed.');
  };

  // Create AI Lesson
  const handleCreateLesson = async () => {
    if (!newLessonTopic.trim()) return;
    setCreatingLesson(true);
    try {
      const lesson = await openRouterService.generateLesson(
        newLessonTopic,
        newLessonLevel,
        newLessonDuration,
        newLessonStyle
      );
      if (lesson) {
        const aiLesson: AILesson = {
          ...lesson,
          id: lesson.id || `ai-${Date.now()}`,
          isAIGenerated: true,
          prerequisites: lesson.prerequisites || []
        };
        const updated = [...aiLessons, aiLesson];
        setAILessons(updated);
        localStorage.setItem('braillearn-ai-lessons', JSON.stringify(updated));
        setNewLessonTopic('');
        addToast('success', '✨ Lesson Created!', `"${aiLesson.title}" (Level ${aiLesson.level}, ${aiLesson.duration}min) is ready. Find it on the Overview tab.`);
        speak(`Lesson "${aiLesson.title}" created!`);
      }
    } catch (error) {
      console.error('Lesson creation failed:', error);
    }
    setCreatingLesson(false);
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
  }, [allLessons, searchQuery, filterStatus, filterDifficulty, lessonProgress]);

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

  const classColors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    pink: 'from-pink-500 to-pink-600',
    teal: 'from-teal-500 to-teal-600',
  };

  const timeIcons: Record<string, any> = { morning: Sun, afternoon: Coffee, evening: Sunset, night: Moon };

  const dashTabs: { id: DashboardTab; label: string; icon: any; desc: string }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart, desc: 'Dashboard & stats' },
    { id: 'lessons', label: 'Lessons', icon: BookOpen, desc: 'Browse & study' },
    { id: 'community', label: 'Community', icon: Heart, desc: 'Shared creations' },
    { id: 'create', label: 'Create', icon: Plus, desc: 'Lessons & classes' },
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
                <span className="font-bold text-white">{totalLessonsCount + aiLessons.length}</span> lessons •
                <span className="font-bold text-white"> {myClasses.length}</span> classes •
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
                            { step: 3, title: 'Create Content', desc: 'Generate custom lessons and organize them into classes.', icon: Wand2, action: () => setActiveTab('create'), btn: 'Create', color: 'from-purple-500 to-purple-600' },
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
                      { label: 'Create Lesson', icon: Wand2, color: 'from-purple-500 to-purple-600', action: () => { setActiveTab('create'); } },
                      { label: 'Create Class', icon: Users, color: 'from-orange-500 to-orange-600', action: () => { setActiveTab('create'); } },
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

                  {/* ─── Today's Schedule ─── */}
                  <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 mb-6 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" /> Today's Schedule
                      </h3>

                      {!dailySchedule ? (
                        /* Schedule Generator (compact) */
                        <div>
                          <p className="text-sm text-gray-600 mb-4">Set your availability and BrailleLearn Intelligence will build your daily plan.</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Hours available</label>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4].map(h => (
                                  <button key={h} onClick={() => setScheduleHours(h)}
                                    className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                                      scheduleHours === h ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                    }`}>
                                    {h}h
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-600 mb-1.5 block">Preferred time</label>
                              <div className="flex gap-2">
                                {(['morning', 'afternoon', 'evening'] as const).map(t => {
                                  const Icon = timeIcons[t] || Sun;
                                  const isSelected = preferredTime.includes(t);
                                  return (
                                    <button key={t} onClick={() => setPreferredTime(isSelected ? preferredTime.filter(x => x !== t) : [...preferredTime, t])}
                                      className={`flex-1 py-2.5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1 capitalize ${
                                        isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                                      }`}>
                                      <Icon className="w-3.5 h-3.5" /> {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <motion.button onClick={handleGenerateSchedule} disabled={generatingSchedule}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            {generatingSchedule ? (
                              <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Generating...</>
                            ) : (
                              <><Brain className="w-4 h-4" /> Generate Smart Schedule</>
                            )}
                          </motion.button>
                        </div>
                      ) : (
                        /* Schedule Display */
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                              {dailySchedule.blocks.length} activities · ⏱ {Math.floor(dailySchedule.totalMinutes / 60)}h {dailySchedule.totalMinutes % 60}m
                            </span>
                            <button onClick={() => { setDailySchedule(null); localStorage.removeItem('braillearn-daily-schedule'); }}
                              className="text-xs font-bold text-gray-500 hover:text-red-500 transition-all flex items-center gap-1">
                              <X className="w-3.5 h-3.5" /> Reset
                            </button>
                          </div>
                          <div className="space-y-2">
                            {dailySchedule.blocks.map((block, i) => {
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
                              return (
                                <motion.div key={i}
                                  className={`rounded-xl border-l-4 p-3 ${typeStyles[block.type] || 'bg-gray-50 border-l-gray-400'}`}
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
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                          {dailySchedule.motivationalMessage && (
                            <p className="text-sm text-gray-500 mt-3 italic">💬 {dailySchedule.motivationalMessage}</p>
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

                  {/* My Classes */}
                  {myClasses.length > 0 && (
                    <motion.div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100 mb-6"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" /> My Classes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {myClasses.map(cls => (
                          <motion.div key={cls.id} className="relative rounded-2xl overflow-hidden border-2 border-blue-100 hover:shadow-lg transition-all"
                            whileHover={{ y: -2 }}>
                            <div className={`bg-gradient-to-r ${classColors[cls.color] || classColors.blue} p-4 text-white`}>
                              <h4 className="font-bold">{cls.name}</h4>
                              <p className="text-sm text-white/80 capitalize">{cls.level}</p>
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-gray-600 mb-2">{cls.description || 'No description'}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">{new Date(cls.createdAt).toLocaleDateString()}</span>
                                <button onClick={() => setDeleteConfirmId(cls.id)} className="text-red-400 hover:text-red-600 transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* AI-Generated Lessons */}
                  {aiLessons.length > 0 && (
                    <motion.div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-600" /> Generated Lessons
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiLessons.map(lesson => (
                          <motion.div key={lesson.id} className="rounded-2xl border-2 border-purple-100 p-4 hover:shadow-lg hover:border-purple-300 transition-all"
                            whileHover={{ y: -2 }}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">{lesson.title}</h4>
                                <p className="text-xs text-gray-500">Level {lesson.level} • {lesson.duration}min</p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{lesson.description}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{lesson.category}</span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{lesson.exercises?.length || 0} exercises</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
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
                        </div>
                        {(searchQuery || filterStatus !== 'all' || filterDifficulty !== 'all') && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Showing {filteredLessons.length} of {totalLessonsCount}</span>
                            <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterDifficulty('all'); }}
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
                              <MessageSquare className="w-3.5 h-3.5 text-white" />
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

              {/* ═══ COMMUNITY TAB ═══ */}
              {activeTab === 'community' && (
                <motion.div key="community" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {/* ─── Braille Dot Creator ─── */}
                  <motion.div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-emerald-100 mb-6"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <Grid3X3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Create Braille Character</h3>
                        <p className="text-sm text-gray-500">Select dots, name your character & share with the community</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Dot Selector */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-6 border-2 border-emerald-200 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                          <div className="relative grid grid-cols-2 gap-3">
                            {[
                              [0, 3],
                              [1, 4],
                              [2, 5]
                            ].map((row, rowIdx) => (
                              <React.Fragment key={rowIdx}>
                                {row.map(dotIdx => (
                                  <motion.button
                                    key={dotIdx}
                                    onClick={() => {
                                      const newDots = [...selectedDots];
                                      newDots[dotIdx] = !newDots[dotIdx];
                                      setSelectedDots(newDots);
                                    }}
                                    className={`w-14 h-14 rounded-full border-[3px] font-bold text-lg transition-all ${
                                      selectedDots[dotIdx]
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-white border-gray-300 text-gray-400 hover:border-emerald-400 hover:bg-emerald-50'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {dotIdx + 1}
                                  </motion.button>
                                ))}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                        {/* Unicode Preview */}
                        <div className="text-center">
                          <div className="text-6xl font-mono leading-none mb-1">
                            {dotsToUnicode(selectedDots)}
                          </div>
                          <p className="text-xs text-gray-500 font-medium">
                            {selectedDots.some(d => d)
                              ? `Dots: ${selectedDots.map((d, i) => d ? i + 1 : null).filter(Boolean).join(', ')}`
                              : 'Tap dots to select'}
                          </p>
                        </div>
                      </div>

                      {/* Word Info */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">What does this mean?</label>
                          <input type="text" value={dotWordName} onChange={e => setDotWordName(e.target.value)}
                            placeholder="e.g. Letter A, Number 1, Love, Hello..."
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-medium outline-none transition-all" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Description (optional)</label>
                          <textarea value={dotWordDescription} onChange={e => setDotWordDescription(e.target.value)}
                            placeholder="Add a note about this braille character, memory tip, or context..."
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-sm font-medium h-24 resize-none outline-none transition-all" />
                        </div>

                        {/* Quick preset buttons */}
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-2 block">Quick Presets</label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: 'A', dots: [true, false, false, false, false, false] },
                              { label: 'B', dots: [true, true, false, false, false, false] },
                              { label: 'C', dots: [true, false, false, true, false, false] },
                              { label: 'D', dots: [true, false, false, true, true, false] },
                              { label: 'E', dots: [true, false, false, false, true, false] },
                              { label: 'F', dots: [true, true, false, true, false, false] },
                              { label: 'Clear', dots: [false, false, false, false, false, false] },
                            ].map(preset => (
                              <button key={preset.label} onClick={() => setSelectedDots(preset.dots)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                                  preset.label === 'Clear'
                                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}>
                                {preset.label === 'Clear' ? '✕ Clear' : `${preset.label} ${dotsToUnicode(preset.dots)}`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <motion.button onClick={handleCreateBrailleWord}
                          disabled={!dotWordName.trim() || !selectedDots.some(d => d)}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Sparkles className="w-5 h-5" /> Share with Community
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* ─── Community Braille Words Grid ─── */}
                  <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-100 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-sm">Community Braille Words</h3>
                          <p className="text-emerald-200 text-xs">{communityWords.length} custom characters shared by learners</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      {communityWords.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {communityWords.map((w, idx) => (
                            <motion.div key={w.id}
                              className="relative group bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl p-3 border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all text-center"
                              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              whileHover={{ y: -2 }}>
                              <div className="text-4xl font-mono mb-1">{dotsToUnicode(w.dots)}</div>
                              <div className="font-bold text-sm text-gray-900 truncate">{w.word}</div>
                              <div className="text-xs text-gray-500 truncate">{w.description || `Dots ${w.dots.map((d: boolean, i: number) => d ? i + 1 : null).filter(Boolean).join(', ')}`}</div>
                              <div className="text-[10px] text-emerald-600 font-medium mt-1">by {w.createdBy}</div>
                              {/* Visual dots indicator */}
                              <div className="grid grid-cols-2 gap-0.5 w-6 mx-auto mt-2">
                                {[
                                  [0, 3],
                                  [1, 4],
                                  [2, 5]
                                ].map((row, ri) => (
                                  <React.Fragment key={ri}>
                                    {row.map(di => (
                                      <div key={di} className={`w-2.5 h-2.5 rounded-full ${w.dots[di] ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                    ))}
                                  </React.Fragment>
                                ))}
                              </div>
                              {/* Delete button */}
                              <button
                                onClick={() => handleDeleteBrailleWord(w.id)}
                                className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Grid3X3 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                          <h3 className="text-lg font-extrabold text-gray-900 mb-1">No community words yet</h3>
                          <p className="text-sm text-gray-500">Create your first braille character above to get started!</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ═══ CREATE TAB ═══ */}
              {activeTab === 'create' && (
                <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Create Lesson Card */}
                    <motion.div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <Wand2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Create Custom Lesson</h3>
                          <p className="text-sm text-gray-500">BrailleLearn Intelligence generates a full lesson</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Topic</label>
                          <input type="text" value={newLessonTopic} onChange={e => setNewLessonTopic(e.target.value)}
                            placeholder="e.g. Numbers in braille, Common contractions..."
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-sm font-medium" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">Level</label>
                            <select value={newLessonLevel} onChange={e => setNewLessonLevel(parseInt(e.target.value))}
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-sm font-bold">
                              {Array.from({ length: 30 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-bold text-gray-700 mb-1 block">Duration</label>
                            <select value={newLessonDuration} onChange={e => setNewLessonDuration(parseInt(e.target.value))}
                              className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-sm font-bold">
                              <option value={10}>10 min</option>
                              <option value={15}>15 min</option>
                              <option value={20}>20 min</option>
                              <option value={30}>30 min</option>
                              <option value={45}>45 min</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Style</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: 'visual', label: 'Visual', emoji: '👁️' },
                              { val: 'tactile', label: 'Tactile', emoji: '✋' },
                              { val: 'mixed', label: 'Mixed', emoji: '🔀' },
                            ].map(s => (
                              <button key={s.val} onClick={() => setNewLessonStyle(s.val)}
                                className={`py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                                  newLessonStyle === s.val ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                                }`}>
                                {s.emoji} {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <motion.button onClick={handleCreateLesson} disabled={!newLessonTopic.trim() || creatingLesson}
                          className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          {creatingLesson ? (
                            <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> Creating...</>
                          ) : (
                            <><Sparkles className="w-5 h-5" /> Generate Lesson</>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Create Class Card */}
                    <motion.div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-blue-100"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Create Class</h3>
                          <p className="text-sm text-gray-500">Organize your learning</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Class Name</label>
                          <input type="text" value={newClassName} onChange={e => setNewClassName(e.target.value)}
                            placeholder="e.g. My Braille Journey, Grade 1 Braille..."
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 text-sm font-medium" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Description</label>
                          <textarea value={newClassDesc} onChange={e => setNewClassDesc(e.target.value)}
                            placeholder="What is this class about?"
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-500 text-sm font-medium h-20 resize-none" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Level</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { val: 'beginner', label: 'Beginner', emoji: '🌱' },
                              { val: 'intermediate', label: 'Intermediate', emoji: '⭐' },
                              { val: 'advanced', label: 'Advanced', emoji: '🏆' },
                            ].map(l => (
                              <button key={l.val} onClick={() => setNewClassLevel(l.val)}
                                className={`py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                                  newClassLevel === l.val ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'
                                }`}>
                                {l.emoji} {l.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1 block">Color</label>
                          <div className="flex gap-2">
                            {Object.keys(classColors).map(c => (
                              <button key={c} onClick={() => setNewClassColor(c)}
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${classColors[c]} transition-all ${
                                  newClassColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'
                                }`} />
                            ))}
                          </div>
                        </div>
                        <motion.button onClick={handleCreateClass} disabled={!newClassName.trim()}
                          className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Plus className="w-5 h-5" /> Create Class
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Existing items list */}
                  {(aiLessons.length > 0 || myClasses.length > 0) && (
                    <div className="mt-6 space-y-4">
                      {aiLessons.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-purple-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" /> Your Generated Lessons ({aiLessons.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {aiLessons.map(l => (
                              <div key={l.id} className="rounded-2xl border-2 border-purple-100 p-3 hover:border-purple-300 transition-all">
                                <div className="font-bold text-sm text-gray-900">{l.title}</div>
                                <div className="text-xs text-gray-500">Level {l.level} • {l.duration}min • {l.exercises?.length || 0} exercises</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {myClasses.length > 0 && (
                        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-orange-100">
                          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-orange-600" /> Your Classes ({myClasses.length})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {myClasses.map(c => (
                              <div key={c.id} className="rounded-2xl border-2 border-orange-100 p-3 flex items-center justify-between hover:border-orange-300 transition-all">
                                <div>
                                  <div className="font-bold text-sm text-gray-900">{c.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{c.level}</div>
                                </div>
                                <button onClick={() => setDeleteConfirmId(c.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-blue-100"
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
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white rounded-t-3xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-extrabold">Curriculum Builder</h2>
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

                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      {wizardStep === 'level' && (
                        <motion.div key="level" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">What's your current level?</h3>
                          <p className="text-gray-600 mb-5">Select where you'd like to start</p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { val: 1, label: 'Brand New', emoji: '🌱', desc: 'Never learned braille' },
                              { val: 5, label: 'Some Basics', emoji: '🌿', desc: 'Know some letters' },
                              { val: 10, label: 'Beginner', emoji: '⭐', desc: 'Can read simple words' },
                              { val: 15, label: 'Intermediate', emoji: '🚀', desc: 'Read sentences' },
                              { val: 20, label: 'Advanced', emoji: '💎', desc: 'Know contractions' },
                              { val: 25, label: 'Expert', emoji: '👑', desc: 'Near fluent reader' }
                            ].map(opt => (
                              <motion.button key={opt.val} onClick={() => setCustomForm({ ...customForm, currentLevel: opt.val })}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                  customForm.currentLevel === opt.val ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                                }`} whileHover={{ scale: 1.03 }}>
                                <div className="text-2xl mb-1">{opt.emoji}</div>
                                <div className="font-bold text-gray-900 text-sm">{opt.label}</div>
                                <div className="text-xs text-gray-500">{opt.desc}</div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 'style' && (
                        <motion.div key="style" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">How do you learn best?</h3>
                          <p className="text-gray-600 mb-5">We'll adapt content to your style</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { val: 'visual', label: 'Visual', emoji: '👁️', desc: 'Patterns, diagrams, colors' },
                              { val: 'tactile', label: 'Tactile', emoji: '✋', desc: 'Hands-on, physical practice' },
                              { val: 'auditory', label: 'Auditory', emoji: '👂', desc: 'Sound, speech, listening' },
                              { val: 'kinesthetic', label: 'Kinesthetic', emoji: '🏃', desc: 'Movement & interaction' },
                              { val: 'mixed', label: 'Mixed', emoji: '🔀', desc: 'Combination of all styles' }
                            ].map(opt => (
                              <motion.button key={opt.val} onClick={() => setCustomForm({ ...customForm, learningStyle: opt.val })}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                  customForm.learningStyle === opt.val ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                                }`} whileHover={{ scale: 1.03 }}>
                                <div className="text-2xl mb-1">{opt.emoji}</div>
                                <div className="font-bold text-gray-900">{opt.label}</div>
                                <div className="text-xs text-gray-500">{opt.desc}</div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 'focus' && (
                        <motion.div key="focus" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">What do you want to focus on?</h3>
                          <p className="text-gray-600 mb-5">Select your primary learning goal</p>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { val: 'basics', label: 'Fundamentals', emoji: '📝' },
                              { val: 'words', label: 'Words & Vocab', emoji: '📖' },
                              { val: 'sentences', label: 'Sentences', emoji: '📰' },
                              { val: 'contractions', label: 'Contractions', emoji: '⚡' },
                              { val: 'writing', label: 'Writing', emoji: '✍️' },
                              { val: 'all', label: 'Everything', emoji: '🌟' }
                            ].map(opt => (
                              <motion.button key={opt.val} onClick={() => setCustomForm({ ...customForm, focusAreas: opt.val })}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                                  customForm.focusAreas === opt.val ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                                }`} whileHover={{ scale: 1.03 }}>
                                <span className="text-2xl">{opt.emoji}</span>
                                <div className="font-bold text-gray-900 mt-1">{opt.label}</div>
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
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Set your schedule</h3>
                          <p className="text-gray-600 mb-5">When and how often can you study?</p>
                          <div className="space-y-5">
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
                          <h3 className="text-xl font-extrabold text-gray-900 mb-2">Review your plan</h3>
                          <p className="text-gray-600 mb-5">Here's what BrailleLearn Intelligence will create for you</p>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100 space-y-3">
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

                  <div className="p-6 border-t border-gray-100 flex justify-between">
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

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border-2 border-red-100"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Delete Class?</h3>
                  <p className="text-sm text-gray-500">"{myClasses.find(c => c.id === deleteConfirmId)?.name}" will be permanently removed.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDeleteClass(deleteConfirmId)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearnPage;
