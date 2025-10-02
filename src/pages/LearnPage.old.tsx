import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Star, Trophy, Target, BookOpen, Zap, Navigation, Route, Flag, Clock, TrendingUp,
  MessageCircle, Send, Edit3, Save, RefreshCw, Calendar, User, Settings, Sparkles
} from 'lucide-react';
import LessonCard from '../components/lessons/LessonCard';
import { geminiService } from '../services/geminiService';
import { generateLessonsForLevel } from '../services/lessonService';
import type { GeneratedPlan } from '../types/customTypes';
import type { Category, Exercise, Lesson, LessonProgress } from '../types/learnTypes';

interface CategoryInfo {
  id: Category | 'all';
  name: string;
  emoji: string;
}

interface LevelInfo {
  emoji: string;
  title: string;
  description: string;
}

const categories: CategoryInfo[] = [
  { id: 'all', name: 'All Lessons', emoji: '📚' },
  { id: 'basics', name: 'Basics', emoji: '🎯' },
  { id: 'words', name: 'Words', emoji: '📝' },
  { id: 'sentences', name: 'Sentences', emoji: '📖' },
  { id: 'contractions', name: 'Contractions', emoji: '✨' },
  { id: 'advanced', name: 'Advanced', emoji: '🎓' }
];

const LearnPage: React.FC = () => {
  // Context hooks
  const { speak } = useAudio();
  const { user } = useAuth();

  // UI State
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showAICustomization, setShowAICustomization] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showAIEditor, setShowAIEditor] = useState(false);
  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);
  
  // Lesson State
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);
  
  // Plan State
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Form State
  const [customizationForm, setCustomizationForm] = useState({
    currentLevel: 1,
    learningStyle: 'visual' as const,
    focusAreas: 'letters',
    difficulty: 'beginner' as const,
    timeAvailable: '30',
    studyGoals: '',
    preferredSchedule: 'flexible',
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[]
  });

  useEffect(() => {
    const initializePage = async () => {
      document.title = 'Learn Braille - BrailleLearn';
      window.scrollTo(0, 0);
      speak('Welcome to the advanced learning page with AI-powered study plans.');
      
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Load user's lesson progress
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);
          
        if (progress) {
          setLessonProgress(progress);
        }

        // Load standard lessons for all 30 levels
        const loadedLessons: Lesson[] = [];
        for (let level = 1; level <= 30; level++) {
          const levelLessons = generateLessonsForLevel(level);
          loadedLessons.push(...levelLessons);
        }
        
        setAllLessons(loadedLessons);
      } catch (error) {
        console.error('Error loading lessons:', error);
      }
      
      setLoading(false);
    };

    initializePage();
  }, [user, speak]);

  // Level emojis and titles
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

  // Process lessons - get the right lessons to display
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

  // Check if a lesson is locked
  const isLessonLocked = (lesson: Lesson): boolean => {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return false;
    }
    return !lesson.prerequisites.every((prereqId: string) => {
      const prereqProgress = lessonProgress.find(p => p.lessonId === prereqId);
      return prereqProgress && prereqProgress.completed;
    });
  };

  // Get lesson progress
  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(p => p.lessonId === lessonId);
  };

  // Calculate overall progress
  const completedLessons = lessonProgress.filter(p => p.completed).length;
  const totalLessons = finalLessons.length;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100) || 0;
  const generateCustomLessons = async () => {
    try {
      setLoading(true);
      console.log('Generating custom plan with form data:', customizationForm);
      
      const customPlan = await geminiService.generatePersonalizedStudyPlan(
        customizationForm.currentLevel,
        [customizationForm.focusAreas],
        customizationForm.learningStyle,
        parseInt(customizationForm.timeAvailable),
        `Study Goals: ${customizationForm.studyGoals}. Schedule: ${customizationForm.preferredSchedule}. Available Days: ${customizationForm.availableDays.join(', ')}.`
      );
      
      console.log('Generated custom plan:', customPlan);
      
      setUseCustomPlan(true);
      setGeneratedPlan(customPlan);
      setShowAICustomization(false);
      setShowRoadmap(true);
      
      // Start roadmap animation
      setRoadmapAnimation(0);
      const animationTimer = setInterval(() => {
        setRoadmapAnimation(prev => {
          if (prev >= 6) {
            clearInterval(animationTimer);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
      
      speak(`Custom 30-level study plan generated! Your personalized roadmap includes ${customPlan.totalLessons} lessons across ${customPlan.estimatedWeeks} weeks.`);
      
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating custom lessons:', error);
      speak('Error generating custom lessons. Please try again.');
      setLoading(false);
    }
  };

  // AI Chat Functions
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const context = `The user has a study plan with ${generatedPlan?.totalLessons || 'many'} lessons across 30 levels. Current level: ${customizationForm.currentLevel}. Learning style: ${customizationForm.learningStyle}. Focus areas: ${customizationForm.focusAreas}.`;
      const response = await geminiService.askInstructor(chatInput, context);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Keep practicing - you\'re doing great!',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // AI Study Plan Editing Function
  const editStudyPlan = async (editRequest: string) => {
    if (!generatedPlan) return;
    
    setChatLoading(true);
    try {
      const editPrompt = `The user wants to modify their current study plan. Current plan details:
      - Total Lessons: ${generatedPlan.totalLessons}
      - Estimated Weeks: ${generatedPlan.estimatedWeeks}
      - Learning Style: ${generatedPlan.learningStyle}
      - Daily Time: ${generatedPlan.dailyTimeCommitment} minutes
      - Current Level: ${customizationForm.currentLevel}
      - Focus Areas: ${customizationForm.focusAreas}
      
      User's Edit Request: ${editRequest}
      
      Please generate an updated study plan in the same JSON format as the original, incorporating their requested changes. Keep the same structure but modify according to their request.`;
      
      const response = await geminiService.generatePersonalizedStudyPlan(
        customizationForm.currentLevel,
        [customizationForm.focusAreas],
        customizationForm.learningStyle,
        parseInt(customizationForm.timeAvailable),
        editPrompt
      );
      
      // Update the plan with AI modifications
      setGeneratedPlan(response);
      
      const aiMessage = {
        id: Date.now().toString(),
        text: `I've updated your study plan based on your request! The changes include: ${editRequest}. Your updated plan now has ${response.totalLessons} lessons across ${response.estimatedWeeks} weeks.`,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      speak('Study plan updated successfully based on your request!');
      
    } catch (error) {
      console.error('Error editing study plan:', error);
      const errorMessage = {
        id: Date.now().toString(),
        text: 'I had trouble updating your study plan. Please try rephrasing your request.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle AI requests that might be study plan edits
  const handleAIRequest = async (message: string) => {
    const editKeywords = ['change', 'modify', 'update', 'edit', 'adjust', 'add', 'remove', 'increase', 'decrease', 'more', 'less', 'different'];
    const isEditRequest = editKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (isEditRequest && generatedPlan) {
      // Add user message first
      const userMessage = {
        id: Date.now().toString(),
        text: message,
        sender: 'user' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, userMessage]);
      setChatInput('');
      
      // Then process as edit request
      await editStudyPlan(message);
    } else {
      // Handle as regular chat
      await sendChatMessage();
    }
  };

  // Animation variants
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
    <div className="min-h-screen bg-gray-50 braille-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-12 relative">
        <div className="absolute inset-0 braille-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl font-bold leading-tight mb-4">
            🎓 AI-Powered Learning Hub
          </h1>
          <p className="text-lg text-primary-100">
            Create personalized study plans and get real-time AI assistance
          </p>
        </div>
      </section>

      <div className="flex">
        {/* Main Content */}
        <motion.div 
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* AI Study Plan Generator */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="bg-white rounded-xl p-6 mb-8 border border-navy-200 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-700 mr-3" />
                <h3 className="text-2xl font-bold text-primary-900">AI Study Plan Generator</h3>
              </div>
              <p className="text-lg font-semibold text-primary-800 mb-6 leading-relaxed">
                Create a comprehensive 30-level personalized learning path. The AI will generate all lessons 
                and can modify them in real-time based on your feedback.
              </p>
              
              {!showAICustomization ? (
                <button
                  onClick={() => setShowAICustomization(true)}
                  className="px-8 py-4 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-xl hover:from-primary-800 hover:to-primary-900 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 inline mr-2" />
                  Generate My AI Study Plan
                </button>
              ) : (
                <div className="bg-white rounded-lg p-6 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Settings
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Level
                        </label>
                        <select
                          value={customizationForm.currentLevel}
                          onChange={(e) => setCustomizationForm({...customizationForm, currentLevel: parseInt(e.target.value)})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          {Array.from({length: 30}, (_, i) => (
                            <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Learning Style
                        </label>
                        <select
                          value={customizationForm.learningStyle}
                          onChange={(e) => setCustomizationForm({...customizationForm, learningStyle: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="visual">Visual Learner</option>
                          <option value="tactile">Tactile Learner</option>
                          <option value="auditory">Auditory Learner</option>
                          <option value="kinesthetic">Kinesthetic Learner</option>
                          <option value="mixed">Mixed Approach</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Primary Focus Area
                        </label>
                        <select
                          value={customizationForm.focusAreas}
                          onChange={(e) => setCustomizationForm({...customizationForm, focusAreas: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="letters">Letters & Alphabet</option>
                          <option value="numbers">Numbers & Math</option>
                          <option value="punctuation">Punctuation</option>
                          <option value="contractions">Contractions</option>
                          <option value="speed">Speed Reading</option>
                          <option value="comprehension">Reading Comprehension</option>
                          <option value="writing">Braille Writing</option>
                          <option value="technology">Technology Integration</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Daily Study Time
                        </label>
                        <select
                          value={customizationForm.timeAvailable}
                          onChange={(e) => setCustomizationForm({...customizationForm, timeAvailable: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="45">45 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="90">1.5 hours</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Study Preferences
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Study Goals
                        </label>
                        <textarea
                          value={customizationForm.studyGoals}
                          onChange={(e) => setCustomizationForm({...customizationForm, studyGoals: e.target.value})}
                          placeholder="e.g., I want to read braille fluently for work, pass a certification exam, or help my visually impaired child..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-20 resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preferred Schedule
                        </label>
                        <select
                          value={customizationForm.preferredSchedule}
                          onChange={(e) => setCustomizationForm({...customizationForm, preferredSchedule: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="flexible">Flexible (self-paced)</option>
                          <option value="structured">Structured (daily goals)</option>
                          <option value="intensive">Intensive (accelerated)</option>
                          <option value="relaxed">Relaxed (gradual progress)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Study Days
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <label key={day} className="flex items-center">
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
                                className="mr-2"
                              />
                              <span className="text-sm capitalize">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAICustomization(false)}
                      className="flex-1 px-4 py-3 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateCustomLessons}
                      disabled={loading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-lg hover:from-primary-800 hover:to-primary-900 disabled:opacity-50 flex items-center justify-center font-semibold"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating AI Plan...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate AI Study Plan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Overall Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-primary-600">Overall Progress</span>
                  <span className="font-bold text-primary-700">{overallProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary-600 to-primary-700 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${overallProgress}%` }}
                  ></div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Plan Type</h3>
                <div className="flex items-center justify-center">
                  {useCustomPlan ? (
                    <Sparkles className="w-8 h-8 text-primary-600 mr-3" />
                  ) : (
                    <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
                  )}
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-700">
                      {useCustomPlan ? 'AI Custom' : 'Standard'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {useCustomPlan ? 'Personalized by AI' : '30 structured levels'}
                    </div>
                  </div>
                </div>
                {useCustomPlan && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowAIEditor(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit with AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Level Boxes */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                className="flex justify-center items-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </motion.div>
            ) : (
              <motion.div
                key="levels"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={containerVariants}
                className="max-w-4xl mx-auto"
              >
                {sortedLevels.map(level => (
                  <motion.div 
                    key={level} 
                    className="mb-6"
                    variants={itemVariants}
                  >
                    {/* Level Header Box */}
                    <motion.div 
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 cursor-pointer hover:shadow-xl transition-all mb-4"
                      onClick={() => toggleLevel(level)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-4xl mr-4">{generateLevelInfo(level).emoji}</span>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              Level {level}: {generateLevelInfo(level).title}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {generateLevelInfo(level).description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {(lessonsByLevel[level] || []).filter((lesson: Lesson) =>
                                getLessonProgress(lesson.id)?.completed
                              ).length} / {lessonsByLevel[level]?.length || 0} completed
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${((lessonsByLevel[level] || []).filter((lesson: Lesson) => 
                                    getLessonProgress(lesson.id)?.completed
                                  ).length / (lessonsByLevel[level]?.length || 1)) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className={`transform transition-transform ${expandedLevel === level ? 'rotate-180' : ''}`}>
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
                          className="bg-gray-50 rounded-xl p-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No lessons found
                    </h3>
                    <p className="text-gray-600">
                      Generate an AI study plan to get started with personalized lessons
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Achievement Section */}
          {completedLessons > 0 && (
            <motion.div 
              className="mt-16 bg-white rounded-xl shadow-sm p-8"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Your Achievements
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-primary-700" />
                  </div>
                  <h4 className="font-medium text-gray-900">Lessons Completed</h4>
                  <p className="text-2xl font-bold text-primary-700">{completedLessons}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="font-medium text-gray-900">Average Score</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {lessonProgress.length > 0 
                      ? Math.round(lessonProgress.reduce((acc, curr) => acc + curr.score, 0) / lessonProgress.length)
                      : 0}%
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-primary-700" />
                  </div>
                  <h4 className="font-medium text-gray-900">Study Plan</h4>
                  <p className="text-2xl font-bold text-primary-700">
                    {useCustomPlan ? 'AI Custom' : 'Standard'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
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
                      <span className="text-sm text-gray-600">BrailleLearn Agent is thinking...</span>
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