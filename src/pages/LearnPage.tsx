import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Trophy, Target, BookOpen, TrendingUp,
  Send, Edit3, Settings, Sparkles, Calendar,
  Play, Check, X, ChevronDown, ChevronRight
} from 'lucide-react';
import LessonCard from '../components/lessons/LessonCard';
import { geminiService } from '../services/geminiService';
import { lessons, getLessonsByLevel } from '../data/lessons';
import type { ScheduledLesson, StudyPlan, JourneyAnimation, Lesson, LessonProgress } from '../types/types';

interface LevelInfo {
  emoji: string;
  title: string;
  description: string;
}

const LearnPage: React.FC = () => {
  
  const { speak } = useAudio();
  const { user } = useAuth();

  
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showAICustomization, setShowAICustomization] = useState(false);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);
  
  
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  
  
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [journeyAnimation, setJourneyAnimation] = useState<JourneyAnimation>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    message: '',
    progress: 0
  });
  
  
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  
  const [customizationForm, setCustomizationForm] = useState({
    currentLevel: 1,
    learningStyle: 'visual' as 'visual' | 'tactile' | 'auditory' | 'kinesthetic' | 'mixed',
    focusAreas: 'basics' as 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced' | 'all',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    duration: 12, 
    lessonsPerWeek: 3,
    totalLessons: 50,
    preferredTimes: ['morning'] as string[],
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[]
  });

  useEffect(() => {
    const initializePage = async () => {
      document.title = 'Learn Braille - BrailleLearn';
      window.scrollTo(0, 0);
      speak('Welcome to the advanced learning page with AI-powered study plans.');
      
      try {
        
        setAllLessons(lessons);
        console.log(`Loaded ${lessons.length} lessons from data`);
        
        
        const savedPlan = localStorage.getItem('braillearn-study-plan');
        const savedConfirmation = localStorage.getItem('braillearn-schedule-confirmed');
        
        if (savedPlan && savedConfirmation === 'true') {
          const plan: StudyPlan = JSON.parse(savedPlan);
          setStudyPlan(plan);
          setScheduleConfirmed(true);
          setUseCustomPlan(true);
          console.log('Restored saved study plan:', plan);
        }
        
        if (user) {
          
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id);
            
          if (progress) {
            setLessonProgress(progress);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
      
      setLoading(false);
    };

    initializePage();
  }, [user, speak]);

  
  const generateStudyPlan = (form: any): StudyPlan => {
    const startDate = new Date();
    const targetEndDate = new Date();
    targetEndDate.setDate(startDate.getDate() + (form.duration * 7)); 

    
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

    
    const scheduledLessons: ScheduledLesson[] = selectedLessons.slice(0, form.totalLessons).map((lesson, index) => {
      const scheduleDate = new Date(startDate);
      scheduleDate.setDate(startDate.getDate() + Math.floor(index / form.lessonsPerWeek) * 7 + (index % form.lessonsPerWeek));
      
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
      description: `Personalized study plan focusing on ${form.focusAreas} with ${form.learningStyle} learning style`,
      totalLessons: scheduledLessons.length,
      scheduledLessons,
      startDate: startDate.toISOString(),
      targetEndDate: targetEndDate.toISOString(),
      currentStreak: 0,
      weeklyGoal: form.lessonsPerWeek,
      isActive: true,
      aiManaged: true,
      preferences: {
        preferredTimeSlots: form.preferredTimes || ['morning'],
        maxLessonsPerDay: Math.min(form.lessonsPerWeek, 3),
        difficultyProgression: form.difficulty === 'beginner' ? 'gradual' : 'moderate',
        focusAreas: [form.focusAreas],
        availableDays: form.availableDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
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

  
  const playJourneyAnimation = async (plan: StudyPlan) => {
    const steps = [
      "🚀 Preparing your learning journey...",
      "📚 Organizing lessons by difficulty...",
      "📅 Creating your personalized schedule...",
      "🎯 Setting up learning goals...",
      "✨ Your journey is ready!"
    ];

    setJourneyAnimation({
      isPlaying: true,
      currentStep: 0,
      totalSteps: steps.length,
      message: steps[0],
      progress: 0
    });

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setJourneyAnimation(prev => ({
        ...prev,
        currentStep: i + 1,
        message: steps[i],
        progress: ((i + 1) / steps.length) * 100
      }));
    }

    
    setStudyPlan(plan);
    setShowSchedulePreview(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setJourneyAnimation(prev => ({ ...prev, isPlaying: false }));
  };

  
  const confirmSchedule = () => {
    if (studyPlan) {
      
      localStorage.setItem('braillearn-study-plan', JSON.stringify(studyPlan));
      localStorage.setItem('braillearn-schedule-confirmed', 'true');
      
      setScheduleConfirmed(true);
      setUseCustomPlan(true);
      setShowSchedulePreview(false);
      setShowAICustomization(false);
      
      speak('Your personalized study plan has been saved and activated!');
    }
  };

  
  const rejectSchedule = () => {
    setShowSchedulePreview(false);
    setStudyPlan(null);
    setShowAICustomization(true);
  };

  
  const createNewPlan = () => {
    localStorage.removeItem('braillearn-study-plan');
    localStorage.removeItem('braillearn-schedule-confirmed');
    setStudyPlan(null);
    setScheduleConfirmed(false);
    setUseCustomPlan(false);
    setShowAICustomization(true);
  };
  };

  
  const generateLevelInfo = (level: number): LevelInfo => {
    const emojis = ['🌱', '🌿', '🌺', '🌳', '⭐', '🎯', '🚀', '💎', '🏆', '👑'];
    const titles = [
      'Beginner Sprout', 'Growing Learner', 'Blooming Reader', 'Braille Explorer', 'Pattern Master',
      'Word Builder', 'Sentence Reader', 'Contraction Expert', 'Speed Reader', 'Braille Champion',
      'Advanced Scholar', 'Literary Expert', 'Technical Reader', 'Math Specialist', 'Music Reader',
      'Multi-Language', 'Teaching Expert', 'Research Scholar', 'Innovation Leader', 'Master Teacher',
      'Global Expert', 'Technology Pioneer', 'Accessibility Advocate', 'Community Leader', 'Mentor Master',
      'Legacy Builder', 'Wisdom Keeper', 'Grand Master', 'Ultimate Scholar', 'Braille Legend'
    ];
    const descriptions = [
      'Learn the braille alphabet and basic symbols',
      'Master numbers, punctuation, and simple words',
      'Read common words and simple sentences',
      'Learn contractions and advanced reading',
      'Master complex patterns and recognition',
      'Build vocabulary and word formation',
      'Read complete sentences fluently',
      'Master braille contractions and shortcuts',
      'Develop speed reading techniques',
      'Achieve championship-level skills',
      'Advanced literary and technical reading',
      'Master complex literary works',
      'Read technical and scientific texts',
      'Specialize in mathematical notation',
      'Learn braille music notation',
      'Read multiple languages in braille',
      'Develop teaching and mentoring skills',
      'Conduct research in braille literacy',
      'Lead innovation in braille technology',
      'Master all aspects of braille education',
      'Become a global braille expert',
      'Pioneer new braille technologies',
      'Advocate for accessibility worldwide',
      'Lead braille communities globally',
      'Mentor the next generation',
      'Build lasting educational legacies',
      'Preserve and share braille wisdom',
      'Achieve grand master status',
      'Become the ultimate braille scholar',
      'Join the legends of braille literacy'
    ];
    
    return {
      emoji: emojis[(level - 1) % emojis.length],
      title: titles[Math.min(level - 1, titles.length - 1)],
      description: descriptions[Math.min(level - 1, descriptions.length - 1)]
    };
  };

  
  const finalLessons = React.useMemo(() => {
    if (useCustomPlan && generatedPlan && generatedPlan.levels) {
      const customLessons = generatedPlan.levels.flatMap((level: any) => {
        return (level.lessons || []).map((lesson: any) => ({
          id: `custom-${level.level}-${lesson.id || Math.random()}`,
          title: lesson.title || 'Untitled Lesson',
          description: lesson.description || 'Custom generated lesson',
          level: level.level,
          category: (lesson.category as Category) || 'basics',
          duration: lesson.duration || 20,
          exercises: (lesson.exercises as Exercise[]) || [{
            id: `ex-${level.level}-${Math.random()}`,
            type: 'multiple-choice',
            question: lesson.title || 'Custom Exercise',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 'Option A',
            braillePattern: [{ dots: [1, 2], char: 'Custom' }],
            points: 15
          }],
          prerequisites: []
        }));
      });
      
      return customLessons.length > 0 ? customLessons : allLessons;
    }
    
    return allLessons;
  }, [useCustomPlan, generatedPlan, allLessons]);
  
  const lessonsByLevel = finalLessons.reduce((acc: Record<number, Lesson[]>, lesson: Lesson) => {
    const level = lesson.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(lesson);
    return acc;
  }, {});

  const sortedLevels = Array.from({length: 30}, (_, i) => i + 1).filter(level => lessonsByLevel[level]);

  const toggleLevel = (level: number) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  
  const isLessonLocked = (lesson: Lesson): boolean => {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return false;
    }
    return !lesson.prerequisites.every((prereqId: string) => {
      const prereqProgress = lessonProgress.find(p => p.lessonId === prereqId);
      return prereqProgress && prereqProgress.completed;
    });
  };

  
  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(p => p.lessonId === lessonId);
  };

  
  const completedLessons = lessonProgress.filter(p => p.completed).length;
  const totalLessons = finalLessons.length;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100) || 0;
  
  const generateCustomLessons = async () => {
    try {
      setLoading(true);
      console.log('Generating custom AI plan with form data:', customizationForm);
      
      const plan = generateStudyPlan(customizationForm);
      await playJourneyAnimation(plan);
      
    } catch (error) {
      console.error('Error generating custom lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleAIRequest = async (message: string) => {
    if (!message.trim() || !studyPlan) return;
    
    setChatLoading(true);
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    try {
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        text: `I understand you want to: "${message}". I can help you modify your study plan. Would you like me to make these changes?`,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error handling AI request:', error);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    }
  };

  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      {/* Modern Dashboard Header */}
      <section className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
                Learning Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                <span className="font-semibold text-primary-600">{allLessons.length}</span> lessons available • 
                Personalized AI-powered curriculum
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{overallProgress}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallProgress / 100)}`}
                    className="text-primary-600 transition-all duration-300"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout Container */}
      <div className="flex">
        {/* Main Content */}
        <motion.div 
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Dashboard Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold text-gray-900">{totalLessons}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{completedLessons}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {lessonProgress.length > 0 
                      ? Math.round(lessonProgress.reduce((acc, curr) => acc + curr.score, 0) / lessonProgress.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Study Plan</p>
                  <p className="text-xl font-bold text-gray-900">
                    {useCustomPlan ? 'AI Custom' : 'Standard'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Study Plan Generator Card */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-8 h-8 mr-3" />
                    <h2 className="text-2xl font-bold">AI Study Plan Generator</h2>
                  </div>
                  <p className="text-primary-100 text-lg mb-6 max-w-2xl">
                    Generate a personalized curriculum of ~200 lessons tailored to your learning style, 
                    schedule, and goals. The AI will customize lesson order and difficulty for optimal progress.
                  </p>
                  
                  {!showAICustomization ? (
                    <button
                      onClick={() => setShowAICustomization(true)}
                      className="inline-flex items-center px-6 py-3 bg-white text-primary-700 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create My Custom Curriculum
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAICustomization(false)}
                      className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all font-semibold"
                    >
                      <Edit3 className="w-5 h-5 mr-2" />
                      Hide Customization
                    </button>
                  )}
                </div>
                <div className="hidden lg:block">
                  <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                    <Target className="w-16 h-16 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* AI Customization Form */}
          <AnimatePresence>
            {showAICustomization && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Customize Your Learning Experience
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Tell us about your goals and preferences to create the perfect study plan
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Basic Settings */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Starting Level
                          </label>
                          <select
                            value={customizationForm.currentLevel}
                            onChange={(e) => setCustomizationForm({...customizationForm, currentLevel: parseInt(e.target.value)})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {Array.from({length: 30}, (_, i) => (
                              <option key={i + 1} value={i + 1}>
                                Level {i + 1} {i < 5 ? '(Beginner)' : i < 15 ? '(Intermediate)' : '(Advanced)'}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Learning Style
                          </label>
                          <select
                            value={customizationForm.learningStyle}
                            onChange={(e) => setCustomizationForm({...customizationForm, learningStyle: e.target.value as 'visual' | 'tactile' | 'auditory' | 'kinesthetic' | 'mixed'})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="visual">Visual Learner (patterns & diagrams)</option>
                            <option value="tactile">Tactile Learner (hands-on practice)</option>
                            <option value="auditory">Auditory Learner (sound & speech)</option>
                            <option value="kinesthetic">Kinesthetic Learner (movement & touch)</option>
                            <option value="mixed">Mixed Approach (combination)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Focus Area
                          </label>
                          <select
                            value={customizationForm.focusAreas}
                            onChange={(e) => setCustomizationForm({...customizationForm, focusAreas: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="letters">Letters & Alphabet</option>
                            <option value="numbers">Numbers & Math</option>
                            <option value="punctuation">Punctuation & Symbols</option>
                            <option value="contractions">Contractions & Speed Reading</option>
                            <option value="words">Word Formation & Vocabulary</option>
                            <option value="sentences">Sentences & Comprehension</option>
                            <option value="writing">Braille Writing Skills</option>
                            <option value="technology">Technology Integration</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Daily Study Time
                          </label>
                          <select
                            value={customizationForm.timeAvailable}
                            onChange={(e) => setCustomizationForm({...customizationForm, timeAvailable: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="15">15 minutes (quick sessions)</option>
                            <option value="30">30 minutes (balanced)</option>
                            <option value="45">45 minutes (focused)</option>
                            <option value="60">1 hour (intensive)</option>
                            <option value="90">1.5 hours (dedicated)</option>
                            <option value="120">2 hours (immersive)</option>
                          </select>
                        </div>
                      </div>

                      {/* Right Column - Advanced Settings */}
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Study Goals & Motivation
                          </label>
                          <textarea
                            value={customizationForm.studyGoals}
                            onChange={(e) => setCustomizationForm({...customizationForm, studyGoals: e.target.value})}
                            placeholder="e.g., I want to read braille fluently for work, help my visually impaired child, pass a certification exam, or pursue independence..."
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24 resize-none"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Learning Schedule
                          </label>
                          <select
                            value={customizationForm.preferredSchedule}
                            onChange={(e) => setCustomizationForm({...customizationForm, preferredSchedule: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="flexible">Flexible (self-paced)</option>
                            <option value="structured">Structured (daily goals)</option>
                            <option value="intensive">Intensive (accelerated)</option>
                            <option value="relaxed">Relaxed (gradual progress)</option>
                            <option value="weekend">Weekend Focus</option>
                            <option value="evening">Evening Sessions</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Study Days
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                              <label key={day} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={customizationForm.availableDays.includes(day)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCustomizationForm({
                                        ...customizationForm,
                                        availableDays: [...customizationForm.availableDays, day]
                                      });
                                    } else {
                                      setCustomizationForm({
                                        ...customizationForm,
                                        availableDays: customizationForm.availableDays.filter(d => d !== day)
                                      });
                                    }
                                  }}
                                  className="mr-3 text-primary-600"
                                />
                                <span className="text-sm font-medium capitalize">{day}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowAICustomization(false)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={generateCustomLessons}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 flex items-center justify-center font-semibold min-w-[200px]"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate My Curriculum
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Level Progress Overview */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Level Progress Overview
              </h3>
              <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-15 gap-2">
                {Array.from({length: 30}, (_, i) => {
                  const level = i + 1;
                  const levelLessons = lessonsByLevel[level] || [];
                  const completedCount = levelLessons.filter((lesson: Lesson) => 
                    getLessonProgress(lesson.id)?.completed
                  ).length;
                  const progress = levelLessons.length > 0 ? (completedCount / levelLessons.length) * 100 : 0;
                  
                  return (
                    <button
                      key={level}
                      onClick={() => toggleLevel(level)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        progress === 100 
                          ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                          : progress > 0 
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                          : 'bg-gray-100 text-gray-500 border-2 border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 border-2 border-gray-200 rounded mr-2"></div>
                  <span className="text-gray-600">Not Started</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
                  <span className="text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border-2 border-green-300 rounded mr-2"></div>
                  <span className="text-gray-600">Completed</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Level Boxes */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                className="flex flex-col items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-600">Generating comprehensive curriculum...</p>
                <p className="text-sm text-gray-500 mt-1">Creating {useCustomPlan ? 'personalized' : 'standard'} lessons</p>
              </motion.div>
            ) : (
              <motion.div
                key="levels"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={containerVariants}
              >
                {sortedLevels.map(level => (
                  <motion.div 
                    key={level} 
                    className="mb-6"
                    variants={itemVariants}
                  >
                    {/* Level Header Box */}
                    <motion.div 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => toggleLevel(level)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mr-4">
                            <span className="text-2xl">{generateLevelInfo(level).emoji}</span>
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">
                              Level {level}: {generateLevelInfo(level).title}
                            </h2>
                            <p className="text-gray-600 mt-1">
                              {generateLevelInfo(level).description}
                            </p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="text-sm text-primary-600 font-medium">
                                {lessonsByLevel[level]?.length || 0} lessons
                              </span>
                              <span className="text-sm text-gray-500">
                                ~{((lessonsByLevel[level] || []).reduce((acc: number, l: Lesson) => acc + l.duration, 0))} min total
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-2">
                              {(lessonsByLevel[level] || []).filter((lesson: Lesson) =>
                                getLessonProgress(lesson.id)?.completed
                              ).length} / {lessonsByLevel[level]?.length || 0} completed
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${((lessonsByLevel[level] || []).filter((lesson: Lesson) => 
                                    getLessonProgress(lesson.id)?.completed
                                  ).length / (lessonsByLevel[level]?.length || 1)) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className={`transform transition-transform duration-200 ${expandedLevel === level ? 'rotate-180' : ''}`}>
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Expandable Lessons */}
                    <AnimatePresence>
                      {expandedLevel === level && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4"
                        >
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {(lessonsByLevel[level] || []).map((lesson: Lesson) => (
                                <motion.div
                                  key={lesson.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <LessonCard
                                    lesson={lesson}
                                    progress={getLessonProgress(lesson?.id || '')}
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
                ))}
                
                {sortedLevels.length === 0 && (
                  <motion.div 
                    className="text-center py-20"
                    variants={itemVariants}
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Ready to Start Learning?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Generate an AI-powered study plan to access your personalized curriculum of ~200 lessons
                    </p>
                    <button
                      onClick={() => setShowAICustomization(true)}
                      className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Started
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* AI Chat Sidebar */}
        {generatedPlan && (
          <div className="w-80 bg-white shadow-lg border-l border-gray-200 flex flex-col h-screen sticky top-0">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">AI Study Assistant</span>
              </div>
              <p className="text-primary-100 text-sm mt-1">
                Ask questions or request plan changes
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm p-4">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary-300" />
                  <p className="mb-2">I can help you:</p>
                  <ul className="text-left space-y-1">
                    <li>• Modify your study plan</li>
                    <li>• Adjust lesson difficulty</li>
                    <li>• Change focus areas</li>
                    <li>• Update schedule</li>
                    <li>• Answer questions</li>
                  </ul>
                </div>
              )}
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                      <span className="text-sm text-gray-600">AI Assistant is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleAIRequest(chatInput)}
                  placeholder="Ask me to change your plan..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  disabled={chatLoading}
                />
                <button
                  onClick={() => handleAIRequest(chatInput)}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Try: "Make it more challenging" or "Add more writing practice"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnPage;