import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Trophy, Target, BookOpen, Zap, Navigation, Route, Flag, Clock, TrendingUp } from 'lucide-react';
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
  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);
  
  // Lesson State
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  
  // Plan State
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  
  // Form State
  const [customizationForm, setCustomizationForm] = useState({
    currentLevel: 1,
    learningStyle: 'visual' as const,
    focusAreas: 'letters',
    difficulty: 'beginner' as const,
    timeAvailable: '30'
  });
  // Context hooks
  const { speak } = useAudio();
  const { user } = useAuth();

  // UI State
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showAICustomization, setShowAICustomization] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);
  
  // Lesson State
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  
  // Plan State
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  
  // Form State
  const [customizationForm, setCustomizationForm] = useState({
    currentLevel: 1,
    learningStyle: 'visual',
    focusAreas: 'letters',
    difficulty: 'beginner',
    timeAvailable: '30'
  } as const);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);
  const [showAICustomization, setShowAICustomization] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);
  const [customizationForm, setCustomizationForm] = useState<{
    currentLevel: number;
    learningStyle: string;
    focusAreas: string;
    difficulty: string;
    timeAvailable: string;
  }>({
    currentLevel: 1,
    learningStyle: 'visual',
    focusAreas: 'letters',
    difficulty: 'beginner',
    timeAvailable: '30'
  });
  const { speak } = useAudio();

  // Initialize lessons array
  const { speak } = useAudio();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fix the closing brace of useEffect
  if (user) {
    initializeLessons();
  }
  useEffect(() => {
    async function loadLessons() {
      document.title = 'Learn Braille - BrailleLearn';
      window.scrollTo(0, 0);
      speak('Welcome to the learning page. Choose a lesson to begin.');
      
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

        // Load saved lessons from the database
        const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .order('level', { ascending: true });

        if (lessons) {
          setSavedLessons(lessons);
        }
        
        // Load standard lessons for all 30 levels
        const loadedLessons: Lesson[] = [];
        for (let level = 1; level <= 30; level++) {
          const levelLessons = generateLessonsForLevel(level);
          loadedLessons.push(...levelLessons);
        }
        
        setAllLessons([...loadedLessons, ...(lessons || [])]);
      } catch (error) {
        console.error('Error loading lessons:', error);
      }
      
      setLoading(false);
    }

    loadLessons();
  }, [user, speak]);

  // Define categories with emojis
  const categories = [
    { id: 'all', name: 'All Lessons', emoji: '📚' },
    { id: 'basics', name: 'Basics', emoji: '🎯' },
    { id: 'words', name: 'Words', emoji: '📝' },
    { id: 'sentences', name: 'Sentences', emoji: '📖' },
    { id: 'contractions', name: 'Contractions', emoji: '✨' },
    { id: 'advanced', name: 'Advanced', emoji: '🎓' }
  ];

  // Level emojis and titles
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

  const { user } = useAuth();
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  
  useEffect(() => {
    const initializeLessons = async () => {
      document.title = 'Learn Braille - BrailleLearn';
      window.scrollTo(0, 0);
      speak('Welcome to the learning page. Choose a lesson to begin.');
      
      try {
        if (!user) return;

        // Load user's lesson progress
        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('user_id', user.id);
          
        if (progress) {
          setLessonProgress(progress);
        }

        // Load saved lessons from the database
        const { data: lessons } = await supabase
          .from('lessons')
          .select('*')
          .order('level', { ascending: true });

        if (lessons) {
          setSavedLessons(lessons);
        }
        
        // Load standard lessons for all 30 levels
        const loadedLessons: Lesson[] = [];
        for (let level = 1; level <= 30; level++) {
          const levelLessons = generateLessonsForLevel(level);
          loadedLessons.push(...levelLessons);
        }
        
        setAllLessons([...loadedLessons, ...savedLessons]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading lessons:', error);
        setLoading(false);
      }
    };

    if (user) {
      initializeLessons();
  }, [speak]);

  // Process lessons - ALWAYS ensure we have lessons to show
  const finalLessons = React.useMemo(() => {
    console.log('Processing lessons...');
    console.log('useCustomPlan:', useCustomPlan);
    console.log('generatedPlan exists:', !!generatedPlan);
    
    // If using custom plan and we have generated lessons, use those instead
    if (useCustomPlan && generatedPlan && generatedPlan.levels) {
      const customLessons = generatedPlan.levels.flatMap((level: any) => {
        // Transform the generated lessons to match the expected format
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
      
      console.log('Custom lessons extracted:', customLessons.length);
      if (customLessons.length > 0) {
        return customLessons;
      }
    }
    
    // Start with standard lessons from data file
    let processedLessons = [...lessons];
    console.log('Standard lessons loaded:', processedLessons.length);
    
    // Generate additional lessons for levels 6-30 if using standard plan
    if (!useCustomPlan) {
      for (let level = 6; level <= 30; level++) {
        const levelInfo = generateLevelInfo(level);
        const lessonsPerLevel = Math.min(5 + Math.floor(level / 5), 10);
        
        for (let i = 0; i < lessonsPerLevel; i++) {
          processedLessons.push({
            id: `lesson-${level}-${i + 1}`,
            title: `${levelInfo.title} - Part ${i + 1}`,
            description: `Advanced ${levelInfo.description.toLowerCase()} - specialized training`,
            level: level,
            category: level <= 10 ? 'basics' : level <= 15 ? 'words' : level <= 20 ? 'sentences' : level <= 25 ? 'contractions' : 'advanced',
            duration: 20 + (level * 2),
            exercises: [
              {
                id: `ex-${level}-${i}`,
                type: 'multiple-choice' as const,
                question: `Advanced ${levelInfo.title} challenge`,
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 'Option A',
                braillePattern: [{ dots: [1, 2], char: 'Advanced' }],
                points: 15 + level
              }
            ],
            prerequisites: level > 1 ? [`lesson-${level - 1}-1`] : []
          });
        }
      }
    }
    
    console.log('Final processed lessons:', processedLessons.length);
    
    // Update cards state with processed lessons
    setCards(processedLessons);
    
    return processedLessons;
  }, [useCustomPlan, generatedPlan]);
  
  const lessonsByLevel = (finalLessons || []).reduce((acc: Record<number, Lesson[]>, lesson: Lesson) => {
    const level = lesson.level;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(lesson);
    return acc;
  }, {});

  console.log('Lessons by level:', Object.keys(lessonsByLevel).map(level => ({
    level,
    count: lessonsByLevel[parseInt(level)].length
  })));
  // Define lesson type
  type Category = 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced';
  type ExerciseType = 'multiple-choice' | 'match' | 'braille-to-text' | 'text-to-braille' | 'speech-to-braille';
  
  type Exercise = {
    id: string;
    type: ExerciseType;
    question: string;
    options: string[];
    correctAnswer: string;
    braillePattern: Array<{ dots: number[]; char: string }>;
    points: number;
  };
  
  type Lesson = {
    id: string;
    title: string;
    description: string;
    level: number;
    category: Category;
    duration: number;
    exercises: Exercise[];
    prerequisites: string[];
  };

  // Sort levels
  const sortedLevels = Array.from({length: 30}, (_, i) => i + 1).filter(level => lessonsByLevel[level]);
  console.log('Sorted levels with lessons:', sortedLevels);

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
  const completedLessons = (lessonProgress || []).filter((p: any) => p.completed).length;
  const totalLessons = (finalLessons || []).length;
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);
  const generateCustomLessons = async () => {
    try {
      setLoading(true);
      console.log('Generating custom plan with form data:', customizationForm);
      
      const customPlan = await geminiService.generatePersonalizedStudyPlan(
        customizationForm.currentLevel,
        [customizationForm.focusAreas],
        customizationForm.learningStyle,
        parseInt(customizationForm.timeAvailable)
      );
      
      console.log('Generated custom plan:', customPlan);
      console.log('Plan has levels:', customPlan.levels?.length);
      console.log('Total lessons in plan:', customPlan.levels?.reduce((total: number, level: any) => total + (level.lessons?.length || 0), 0));
      
      // Immediately set useCustomPlan to true to switch to custom lessons
      setUseCustomPlan(true);
      setGeneratedPlan(customPlan);
      setCustomizedLessons(customPlan.levels || []);
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
            🎓 Learn Braille
          </h1>
          <p className="text-lg text-primary-100">
            Progress through interactive lessons at your own pace
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
        {/* AI Instructor and Progress */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          {/* AI Lesson Customization */}
          <div className="bg-white rounded-xl p-6 mb-8 border border-navy-200 shadow-lg">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-primary-700 mr-3" />
              <h3 className="text-2xl font-bold text-primary-900">BrailleLearn Study Plan Generator</h3>
            </div>
            <p className="text-lg font-semibold text-primary-800 mb-6 leading-relaxed">
              Create a personalized 30-level learning path based on your current level, learning style, and goals. 
              The system will generate all lessons to match your specific needs and preferences.
            </p>
            
            {!showAICustomization ? (
              <button
                onClick={() => setShowAICustomization(true)}
                className="px-8 py-4 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-xl hover:from-primary-800 hover:to-primary-900 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Generate My Custom Study Plan
              </button>
            ) : (
              <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      Focus Areas
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
                      Time Available (minutes/day)
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
                
                <div className="flex space-x-3">
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
                        Generating...
                      </>
                    ) : (
                      'Generate Study Plan'
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Levels</h3>
              <div className="flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-700">30</div>
                  <div className="text-sm text-gray-500">levels to master</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  From beginner to expert level
                </div>
              </div>
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
                        className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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
                    Debug info: {finalLessons.length} total lessons, {Object.keys(lessonsByLevel).length} levels with content
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    useCustomPlan: {useCustomPlan.toString()}, generatedPlan: {!!generatedPlan ? 'exists' : 'null'}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Roadmap Modal */}
        <AnimatePresence>
          {showRoadmap && generatedPlan && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[55vh] overflow-hidden flex flex-col"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                  <div className="bg-gradient-to-r from-primary-700 to-primary-800 text-white p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Route className="w-5 h-5 mr-2" />
                        <div>
                          <h2 className="text-lg font-bold">Your Learning Journey</h2>
                          <p className="text-primary-100 text-sm">Personalized 30-Level Braille Mastery Path</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRoadmap(false)}
                        className="text-white hover:text-primary-200 text-xl font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                
                  <div className="p-4 overflow-y-auto flex-1">
                  {/* Plan Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-primary-50 rounded-lg p-4 text-center border border-primary-200">
                        <Target className="w-6 h-6 text-primary-700 mx-auto mb-2" />
                        <div className="text-lg font-bold text-primary-800">{generatedPlan.totalLessons}</div>
                        <div className="text-sm text-gray-600">Total Lessons</div>
                      </div>
                      <div className="bg-primary-50 rounded-lg p-4 text-center border border-primary-200">
                        <Clock className="w-6 h-6 text-primary-700 mx-auto mb-2" />
                        <div className="text-lg font-bold text-primary-800">{generatedPlan.estimatedWeeks}</div>
                        <div className="text-sm text-gray-600">Weeks to Complete</div>
                      </div>
                      <div className="bg-primary-50 rounded-lg p-4 text-center border border-primary-200">
                        <Zap className="w-6 h-6 text-primary-700 mx-auto mb-2" />
                        <div className="text-sm font-bold text-primary-800 capitalize">{generatedPlan.learningStyle}</div>
                        <div className="text-sm text-gray-600">Learning Style</div>
                      </div>
                      <div className="bg-primary-50 rounded-lg p-4 text-center border border-primary-200">
                        <TrendingUp className="w-6 h-6 text-primary-700 mx-auto mb-2" />
                        <div className="text-lg font-bold text-primary-800">{generatedPlan.dailyTimeCommitment}</div>
                        <div className="text-sm text-gray-600">Minutes/Day</div>
                      </div>
                    </div>
                  
                  {/* Redesigned Learning Path */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-primary-900 mb-4 text-center flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-primary-700" />
                      Your Learning Journey
                      </h3>
                      <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200 shadow-md">
                      {/* Interactive Learning Graph */}
                        <div className="relative mb-4 bg-white rounded-lg p-3 border border-primary-200">
                        <svg className="w-full h-48" viewBox="0 0 600 180" preserveAspectRatio="xMidYMid meet">
                          {/* Background grid */}
                          <defs>
                            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                            </pattern>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#1d4ed8" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />
                          
                          {/* Animated progress line through ALL 6 points */}
                          <motion.path
                            d="M 80 140 L 160 120 L 240 100 L 320 80 L 400 60 L 480 40"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: Math.min(roadmapAnimation / 6, 1) }}
                            transition={{ duration: 6, ease: "easeInOut" }}
                          />
                          
                          {/* All 6 milestone points */}
                          {[
                            { x: 80, y: 140, level: '1-5', title: 'Foundation', icon: 'foundation' },
                            { x: 160, y: 120, level: '6-10', title: 'Building', icon: 'building' },
                            { x: 240, y: 100, level: '11-15', title: 'Reading', icon: 'reading' },
                            { x: 320, y: 80, level: '16-20', title: 'Fluency', icon: 'fluency' },
                            { x: 400, y: 60, level: '21-25', title: 'Mastery', icon: 'mastery' },
                            { x: 480, y: 40, level: '26-30', title: 'Expert', icon: 'expert' }
                          ].map((point, index) => (
                            <motion.g key={point.level}>
                              <motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="12"
                                fill={index <= roadmapAnimation ? "#1d4ed8" : "#cbd5e1"}
                                stroke="#ffffff"
                                strokeWidth="3"
                                initial={{ scale: 0 }}
                                animate={{ scale: index <= roadmapAnimation ? 1.2 : 1 }}
                                transition={{ delay: index * 0.8, type: "spring", stiffness: 300 }}
                              />
                              <motion.text
                                x={point.x}
                                y={point.y + 25}
                                textAnchor="middle"
                                className="text-[10px] font-bold fill-primary-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: index <= roadmapAnimation ? 1 : 0.5 }}
                                transition={{ delay: index * 0.8 }}
                              >
                                {point.level}
                              </motion.text>
                              <motion.text
                                x={point.x}
                                y={point.y + 38}
                                textAnchor="middle"
                                className="text-[8px] font-medium fill-primary-600"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: index <= roadmapAnimation ? 1 : 0.3 }}
                                transition={{ delay: index * 0.8 }}
                              >
                                {point.title}
                              </motion.text>
                            </motion.g>
                          ))}
                        </svg>
                        </div>
                      
                      {/* Dynamic Skills Display */}
                        <AnimatePresence mode="wait">
                          {roadmapAnimation > 0 && (
                            <motion.div
                              key={roadmapAnimation}
                              className="bg-white rounded-lg p-3 border border-primary-200 shadow-sm mb-3"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.5 }}
                            >
                              {roadmapAnimation === 1 && (
                                <div className="text-center">
                                  <BookOpen className="w-6 h-6 text-primary-700 mx-auto mb-2" />
                                  <h4 className="text-sm font-bold text-primary-800 mb-1">Foundation (Levels 1-5)</h4>
                                  <p className="text-primary-700 mb-2 text-xs">Master the fundamentals of braille reading</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-primary-50 p-1 rounded">• Basic alphabet A-Z</div>
                                    <div className="bg-primary-50 p-1 rounded">• Number recognition</div>
                                    <div className="bg-primary-50 p-1 rounded">• Essential punctuation</div>
                                    <div className="bg-primary-50 p-1 rounded">• Finger positioning</div>
                                  </div>
                                </div>
                              )}
                              {roadmapAnimation === 2 && (
                                <div className="text-center">
                                  <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                  <h4 className="text-sm font-bold text-primary-800 mb-1">Building (Levels 6-10)</h4>
                                  <p className="text-primary-700 mb-2 text-xs">Develop word recognition and reading skills</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-green-50 p-1 rounded">• Common sight words</div>
                                    <div className="bg-green-50 p-1 rounded">• Word formation</div>
                                    <div className="bg-green-50 p-1 rounded">• Reading rhythm</div>
                                    <div className="bg-green-50 p-1 rounded">• Pattern recognition</div>
                                  </div>
                                </div>
                              )}
                              {roadmapAnimation === 3 && (
                                <div className="text-center">
                                  <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                                  <h4 className="text-sm font-bold text-primary-800 mb-1">Reading (Levels 11-15)</h4>
                                  <p className="text-primary-700 mb-2 text-xs">Build fluency with sentences and paragraphs</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-yellow-50 p-1 rounded">• Sentence structure</div>
                                    <div className="bg-yellow-50 p-1 rounded">• Reading flow</div>
                                    <div className="bg-yellow-50 p-1 rounded">• Comprehension</div>
                                    <div className="bg-yellow-50 p-1 rounded">• Context clues</div>
                                  </div>
                                </div>
                              )}
                              {roadmapAnimation === 4 && (
                                <div className="text-center">
                                  <Star className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                  <h4 className="text-sm font-bold text-primary-800 mb-1">Fluency (Levels 16-20)</h4>
                                  <p className="text-primary-700 mb-2 text-xs">Master contractions and increase reading speed</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-purple-50 p-1 rounded">• Braille contractions</div>
                                    <div className="bg-purple-50 p-1 rounded">• Speed techniques</div>
                                    <div className="bg-purple-50 p-1 rounded">• Advanced patterns</div>
                                    <div className="bg-purple-50 p-1 rounded">• Efficient reading</div>
                                  </div>
                                </div>
                              )}
                              {roadmapAnimation === 5 && (
                                <div className="text-center">
                                  <Award className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                  <h4 className="text-sm font-bold text-primary-800 mb-1">Mastery (Levels 21-25)</h4>
                                  <p className="text-primary-700 mb-2 text-xs">Advanced techniques and specialized skills</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-red-50 p-1 rounded">• Technical reading</div>
                                    <div className="bg-red-50 p-1 rounded">• Math notation</div>
                                    <div className="bg-red-50 p-1 rounded">• Music braille</div>
                                    <div className="bg-red-50 p-1 rounded">• Document formatting</div>
                                  </div>
                                </div>
                              )}
                              {roadmapAnimation === 6 && (
                                <div className="text-center">
                                  <Trophy className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                                  <h4 className="text-sm font-bold text-primary-800 mb-1">Expert (Levels 26-30)</h4>
                                  <p className="text-primary-700 mb-2 text-xs">Become a braille expert and teacher</p>
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    <div className="bg-indigo-50 p-1 rounded">• Teaching skills</div>
                                    <div className="bg-indigo-50 p-1 rounded">• Research methods</div>
                                    <div className="bg-indigo-50 p-1 rounded">• Innovation</div>
                                    <div className="bg-indigo-50 p-1 rounded">• Leadership</div>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  
                  {/* Learning Phases */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-primary-900 mb-3">Learning Phases</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {generatedPlan.roadmap.map((phase: any, index: number) => (
                          <div key={index} className="bg-primary-50 rounded-lg p-2 border border-primary-200">
                          <div className="flex items-center mb-2">
                              <Flag className="w-4 h-4 text-primary-700 mr-2" />
                              <h4 className="font-medium text-primary-900 text-sm">{phase.phase}</h4>
                            </div>
                            <p className="text-xs text-primary-600">{phase.weeks}</p>
                            <p className="text-xs text-primary-700">{phase.focus}</p>
                            <div className="text-xs text-primary-600 font-medium">{phase.milestone}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  
                  {/* Weekly Schedule Preview */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-primary-900 mb-3">Weekly Schedule Preview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {generatedPlan.weeklySchedule.slice(0, 6).map((week: any, index: number) => (
                          <div key={index} className="bg-white border border-primary-200 rounded-lg p-2 shadow-sm">
                          <div className="flex items-center mb-2">
                              <Navigation className="w-4 h-4 text-primary-700 mr-2" />
                              <h4 className="font-medium text-primary-900 text-sm">Week {week.week}</h4>
                            </div>
                            <p className="text-xs text-primary-600">{week.focus}</p>
                            <div className="text-xs text-primary-500">
                              {week.practiceTime} min/week • {week.lessons.length} lessons
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setShowRoadmap(false);
                          // Force re-render with custom lessons
                          setUseCustomPlan(true);
                          setExpandedLevel(1); // Auto-expand Level 1 to show custom lessons
                          speak('Your personalized study plan is ready! Start with Level 1 to begin your journey.');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-primary-700 to-primary-800 text-white rounded-xl hover:from-primary-800 hover:to-primary-900 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Start My Personalized Journey
                      </button>
                    </div>
                  </div>
                </motion.div>
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
                <p className="text-2xl font-bold text-primary-700">Active</p>
              </div>
            </div>
          </motion.div>
        )}
        </motion.div>

      </div>
    </div>
  );
};

export default LearnPage;