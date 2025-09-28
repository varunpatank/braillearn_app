import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import LessonCard from '../components/lessons/LessonCard';
import { geminiService } from '../services/geminiService';
import { standardLessons } from '../services/lessonService';
import type { GeneratedPlan } from '../types/customTypes';
import type { Lesson, LessonProgress } from '../types/types';

type Category = 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced';

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

const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: 'All Lessons', emoji: '📚' },
  { id: 'basics', name: 'Basics', emoji: '🎯' },
  { id: 'words', name: 'Words', emoji: '📝' },
  { id: 'sentences', name: 'Sentences', emoji: '📖' },
  { id: 'contractions', name: 'Contractions', emoji: '✨' },
  { id: 'advanced', name: 'Advanced', emoji: '🎓' }
];

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

const LearnPage: React.FC = () => {
  // Context hooks
  const { speak } = useAudio();
  const { user } = useAuth();

  // UI State
  const [loading, setLoading] = useState(true);
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showAICustomization, setShowAICustomization] = useState(false);
  // Lesson State
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);
  
  // Plan State
  const [useCustomPlan, setUseCustomPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  // Load lessons on mount
  useEffect(() => {
    const loadLessons = async () => {
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
          loadedLessons.push(...(standardLessons.filter(lesson => lesson.level === level)));
        }
        
        setAllLessons([...loadedLessons, ...savedLessons]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading lessons:', error);
        setLoading(false);
      }
    };

    loadLessons();
  }, [user, speak, savedLessons]);

  // Process lessons - ALWAYS ensure we have lessons to show
  const finalLessons = useMemo(() => {
    if (useCustomPlan && generatedPlan && generatedPlan.levels) {
      const customLessons = generatedPlan.levels.flatMap((level: any) => {
        return (level.lessons || []).map((lesson: any) => ({
          id: `custom-${level.level}-${lesson.id || Math.random()}`,
          title: lesson.title || 'Untitled Lesson',
          description: lesson.description || 'Custom generated lesson',
          level: level.level,
          category: (lesson.category as Category) || 'basics',
          duration: lesson.duration || 20,
          exercises: lesson.exercises || [{
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
      
      if (customLessons.length > 0) {
        return customLessons;
      }
    }
    
    // Start with standard lessons
    let processedLessons = [...allLessons];
    
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
                type: 'multiple-choice',
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
    
    return processedLessons;
  }, [useCustomPlan, generatedPlan, allLessons]);

  // Group lessons by level
  const lessonsByLevel = useMemo(() => 
    finalLessons.reduce((acc: Record<number, Lesson[]>, lesson: Lesson) => {
      const level = lesson.level;
      if (!acc[level]) {
        acc[level] = [];
      }
      acc[level].push(lesson);
      return acc;
    }, {}), 
    [finalLessons]
  );

  // Sort levels
  const sortedLevels = useMemo(() => 
    Array.from({length: 30}, (_, i) => i + 1).filter(level => lessonsByLevel[level]),
    [lessonsByLevel]
  );

  const toggleLevel = useCallback((level: number) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  }, [expandedLevel]);

  // Check if a lesson is locked
  const isLessonLocked = useCallback((lesson: Lesson): boolean => {
    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {
      return false;
    }
    return !lesson.prerequisites.every((prereqId: string) => {
      const prereqProgress = lessonProgress.find(p => p.lessonId === prereqId);
      return prereqProgress && prereqProgress.completed;
    });
  }, [lessonProgress]);

  // Get lesson progress
  const getLessonProgress = useCallback((lessonId: string) => 
    lessonProgress.find(p => p.lessonId === lessonId),
    [lessonProgress]
  );

  // Calculate overall progress
  const { completedLessons, totalLessons, overallProgress } = useMemo(() => {
    const completed = lessonProgress.filter(p => p.completed).length;
    const total = finalLessons.length;
    return {
      completedLessons: completed,
      totalLessons: total,
      overallProgress: Math.round((completed / total) * 100)
    };
  }, [lessonProgress, finalLessons]);

  // Generate custom lessons
  const generateCustomLessons = useCallback(async () => {
    try {
      setLoading(true);
      const customPlan = await geminiService.generatePersonalizedStudyPlan(
        1, // Default level
        ['letters'], // Default focus areas
        'visual', // Default learning style
        30 // Default time available
      );
      
      setUseCustomPlan(true);
      setGeneratedPlan(customPlan);
      setShowAICustomization(false);
      
      speak(`Custom 30-level study plan generated! Your personalized roadmap includes ${customPlan.totalLessons} lessons across ${customPlan.estimatedWeeks} weeks.`);
      
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating custom lessons:', error);
      speak('Error generating custom lessons. Please try again.');
      setLoading(false);
    }
  }, [speak]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 braille-bg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col space-y-8">
          {/* Header Section */}
          <motion.div 
            className="flex flex-col items-center text-center space-y-4"
            variants={itemVariants}
          >
            <h1 className="text-4xl font-bold text-gray-900">Learn Braille</h1>
            <p className="text-xl text-gray-600">Your journey to braille mastery begins here</p>
            
            {/* Progress Overview */}
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Your Progress</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-600">{completedLessons} / {totalLessons} lessons completed</span>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <motion.div 
                    style={{ width: `${overallProgress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{overallProgress}% Complete</span>
                  <span>{totalLessons - completedLessons} lessons remaining</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Course Content */}
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            variants={itemVariants}
          >
            {sortedLevels.map((level) => {
              const levelInfo = generateLevelInfo(level);
              const lessons = lessonsByLevel[level] || [];
              const isExpanded = expandedLevel === level;
              const completedInLevel = lessons.filter(
                (lesson: Lesson) => lessonProgress.some(p => p.lessonId === lesson.id && p.completed)
              ).length;

              return (
                <motion.div
                  key={`level-${level}`}
                  className={`bg-white rounded-lg shadow-md overflow-hidden
                    ${isExpanded ? 'col-span-full' : ''}`}
                  layoutId={`level-${level}`}
                  onClick={() => toggleLevel(level)}
                  variants={itemVariants}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-4xl">{levelInfo.emoji}</span>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Level {level}: {levelInfo.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {completedInLevel} / {lessons.length} lessons completed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {completedInLevel === lessons.length && (
                          <Trophy className="w-6 h-6 text-yellow-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{levelInfo.description}</p>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          {lessons.map((lesson: Lesson) => (
                            <LessonCard
                              key={lesson.id}
                              lesson={lesson}
                              progress={getLessonProgress(lesson.id)}
                              isLocked={isLessonLocked(lesson)}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* AI Customization Modal */}
          <AnimatePresence>
            {showAICustomization && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white rounded-lg p-8 max-w-lg w-full mx-4"
                >
                  <h2 className="text-2xl font-bold mb-6">Customize Your Learning Plan</h2>
                  
                  {/* Form content here */}
                  
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setShowAICustomization(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateCustomLessons}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Generate Plan
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default LearnPage;