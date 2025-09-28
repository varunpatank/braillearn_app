import React, { useState, useEffect, useCallback, useMemo } from 'react';import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useAudio } from '../context/AudioContext';import { useAudio } from '../context/AudioContext';

import { useAuth } from '../context/AuthContext';import { useAuth } from '../context/AuthContext';

import { supabase } from '../lib/supabase';import { supabase } from '../lib/supabase';

import { motion, AnimatePresence } from 'framer-motion';import { motion, AnimatePresence } from 'framer-motion';

import { Award, Star, Trophy, Target, BookOpen, Zap, Navigation, Route, Flag, Clock, TrendingUp } from 'lucide-react';import { Award, Star, Trophy, Target, BookOpen, Zap, Navigation, Route, Flag, Clock, TrendingUp } from 'lucide-react';

import LessonCard from '../components/lessons/LessonCard';import LessonCard from '../components/lessons/LessonCard';

import { geminiService } from '../services/geminiService';import { geminiService } from '../services/geminiService';

import { generateLessonsForLevel } from '../services/lessonService';import { generateLessonsForLevel } from '../services/lessonService';

import type { GeneratedPlan } from '../types/customTypes';import type { GeneratedPlan } from '../types/customTypes';

import type { Category, Exercise, Lesson, LessonProgress } from '../types/learnTypes';import type { Category, Exercise, Lesson, LessonProgress } from '../types/learnTypes';



interface CategoryInfo {interface CategoryInfo {

  id: Category | 'all';  id: Category | 'all';

  name: string;  name: string;

  emoji: string;  emoji: string;

}}



interface LevelInfo {interface LevelInfo {

  emoji: string;  emoji: string;

  title: string;  title: string;

  description: string;  description: string;

}}



const categories: CategoryInfo[] = [const categories: CategoryInfo[] = [

  { id: 'all', name: 'All Lessons', emoji: '📚' },  { id: 'all', name: 'All Lessons', emoji: '📚' },

  { id: 'basics', name: 'Basics', emoji: '🎯' },  { id: 'basics', name: 'Basics', emoji: '🎯' },

  { id: 'words', name: 'Words', emoji: '📝' },  { id: 'words', name: 'Words', emoji: '📝' },

  { id: 'sentences', name: 'Sentences', emoji: '📖' },  { id: 'sentences', name: 'Sentences', emoji: '📖' },

  { id: 'contractions', name: 'Contractions', emoji: '✨' },  { id: 'contractions', name: 'Contractions', emoji: '✨' },

  { id: 'advanced', name: 'Advanced', emoji: '🎓' }  { id: 'advanced', name: 'Advanced', emoji: '🎓' }

];];



// Generate level info for a specific levelconst LearnPage: React.FC = () => {

const generateLevelInfo = (level: number): LevelInfo => {  // Context hooks

  const emojis = ['🌱', '🌿', '🌺', '🌳', '⭐', '🎯', '🚀', '💎', '🏆', '👑'];  const { speak } = useAudio();

  const titles = [  const { user } = useAuth();

    'Beginner Sprout', 'Growing Learner', 'Blooming Reader', 'Braille Explorer', 'Pattern Master',

    'Word Builder', 'Sentence Reader', 'Contraction Expert', 'Speed Reader', 'Braille Champion',  // UI State

    'Advanced Scholar', 'Literary Expert', 'Technical Reader', 'Math Specialist', 'Music Reader',  const [loading, setLoading] = useState(true);

    'Multi-Language', 'Teaching Expert', 'Research Scholar', 'Innovation Leader', 'Master Teacher',  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

    'Global Expert', 'Technology Pioneer', 'Accessibility Advocate', 'Community Leader', 'Mentor Master',  const [showAICustomization, setShowAICustomization] = useState(false);

    'Legacy Builder', 'Wisdom Keeper', 'Grand Master', 'Ultimate Scholar', 'Braille Legend'  const [showRoadmap, setShowRoadmap] = useState(false);

  ];  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);

  const descriptions = [  

    'Learn the braille alphabet and basic symbols',  // Lesson State

    'Master numbers, punctuation, and simple words',  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);

    'Read common words and simple sentences',  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

    'Learn contractions and advanced reading',  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);

    'Master complex patterns and recognition',  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);

    'Build vocabulary and word formation',  

    'Read complete sentences fluently',  // Plan State

    'Master braille contractions and shortcuts',  const [useCustomPlan, setUseCustomPlan] = useState(false);

    'Develop speed reading techniques',  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

    'Achieve championship-level skills',  

    'Advanced literary and technical reading',  // Form State

    'Master complex literary works',  const [customizationForm, setCustomizationForm] = useState({

    'Read technical and scientific texts',    currentLevel: 1,

    'Specialize in mathematical notation',    learningStyle: 'visual' as const,

    'Learn braille music notation',    focusAreas: 'letters',

    'Read multiple languages in braille',    difficulty: 'beginner' as const,

    'Develop teaching and mentoring skills',    timeAvailable: '30'

    'Conduct research in braille literacy',  });

    'Lead innovation in braille technology',  // Context hooks

    'Master all aspects of braille education',  const { speak } = useAudio();

    'Become a global braille expert',  const { user } = useAuth();

    'Pioneer new braille technologies',

    'Advocate for accessibility worldwide',  // UI State

    'Lead braille communities globally',  const [loading, setLoading] = useState(true);

    'Mentor the next generation',  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

    'Build lasting educational legacies',  const [showAICustomization, setShowAICustomization] = useState(false);

    'Preserve and share braille wisdom',  const [showRoadmap, setShowRoadmap] = useState(false);

    'Achieve grand master status',  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);

    'Become the ultimate braille scholar',  

    'Join the legends of braille literacy'  // Lesson State

  ];  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);

    const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  return {  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);

    emoji: emojis[(level - 1) % emojis.length],  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);

    title: titles[Math.min(level - 1, titles.length - 1)],  

    description: descriptions[Math.min(level - 1, descriptions.length - 1)]  // Plan State

  };  const [useCustomPlan, setUseCustomPlan] = useState(false);

};  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  

const LearnPage: React.FC = () => {  // Form State

  // Context hooks  const [customizationForm, setCustomizationForm] = useState({

  const { speak } = useAudio();    currentLevel: 1,

  const { user } = useAuth();    learningStyle: 'visual',

    focusAreas: 'letters',

  // UI State    difficulty: 'beginner',

  const [loading, setLoading] = useState(true);    timeAvailable: '30'

  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);  } as const);

  const [showAICustomization, setShowAICustomization] = useState(false);  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);

  const [showRoadmap, setShowRoadmap] = useState(false);  const [loading, setLoading] = useState(true);

  const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);

    const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);

  // Lesson State  const [showAICustomization, setShowAICustomization] = useState(false);

  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);  const [showRoadmap, setShowRoadmap] = useState(false);

  const [allLessons, setAllLessons] = useState<Lesson[]>([]);  const [useCustomPlan, setUseCustomPlan] = useState(false);

  const [customizedLessons, setCustomizedLessons] = useState<Lesson[]>([]);  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

    const [roadmapAnimation, setRoadmapAnimation] = useState<number>(0);

  // Plan State  const [customizationForm, setCustomizationForm] = useState<{

  const [useCustomPlan, setUseCustomPlan] = useState(false);    currentLevel: number;

  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);    learningStyle: string;

      focusAreas: string;

  // Form State    difficulty: string;

  const [customizationForm, setCustomizationForm] = useState({    timeAvailable: string;

    currentLevel: 1,  }>({

    learningStyle: 'visual' as const,    currentLevel: 1,

    focusAreas: 'letters',    learningStyle: 'visual',

    difficulty: 'beginner' as const,    focusAreas: 'letters',

    timeAvailable: '30'    difficulty: 'beginner',

  });    timeAvailable: '30'

  });

  // Load lessons on mount  const { speak } = useAudio();

  useEffect(() => {

    const loadLessons = async () => {  // Initialize lessons array

      document.title = 'Learn Braille - BrailleLearn';  const { speak } = useAudio();

      window.scrollTo(0, 0);  const { user } = useAuth();

      speak('Welcome to the learning page. Choose a lesson to begin.');  const [currentPage, setCurrentPage] = useState(1);

  

      if (!user) {  // Fix the closing brace of useEffect

        setLoading(false);  if (user) {

        return;    initializeLessons();

      }  }

  useEffect(() => {

      try {    async function loadLessons() {

        // Load user's lesson progress      document.title = 'Learn Braille - BrailleLearn';

        const { data: progress } = await supabase      window.scrollTo(0, 0);

          .from('lesson_progress')      speak('Welcome to the learning page. Choose a lesson to begin.');

          .select('*')      

          .eq('user_id', user.id);      if (!user) {

                  setLoading(false);

        if (progress) {        return;

          setLessonProgress(progress);      }

        }

      try {

        // Load saved lessons from the database        // Load user's lesson progress

        const { data: lessons } = await supabase        const { data: progress } = await supabase

          .from('lessons')          .from('lesson_progress')

          .select('*')          .select('*')

          .order('level', { ascending: true });          .eq('user_id', user.id);

          

        if (lessons) {        if (progress) {

          setSavedLessons(lessons);          setLessonProgress(progress);

        }        }

        

        // Load standard lessons for all 30 levels        // Load saved lessons from the database

        const loadedLessons: Lesson[] = [];        const { data: lessons } = await supabase

        for (let level = 1; level <= 30; level++) {          .from('lessons')

          const levelLessons = generateLessonsForLevel(level);          .select('*')

          loadedLessons.push(...levelLessons);          .order('level', { ascending: true });

        }

                if (lessons) {

        setAllLessons([...loadedLessons, ...savedLessons]);          setSavedLessons(lessons);

        setLoading(false);        }

      } catch (error) {        

        console.error('Error loading lessons:', error);        // Load standard lessons for all 30 levels

        setLoading(false);        const loadedLessons: Lesson[] = [];

      }        for (let level = 1; level <= 30; level++) {

    };          const levelLessons = generateLessonsForLevel(level);

          loadedLessons.push(...levelLessons);

    loadLessons();        }

  }, [user, speak, savedLessons]);        

        setAllLessons([...loadedLessons, ...(lessons || [])]);

  // Process lessons - ALWAYS ensure we have lessons to show      } catch (error) {

  const finalLessons = useMemo(() => {        console.error('Error loading lessons:', error);

    if (useCustomPlan && generatedPlan && generatedPlan.levels) {      }

      const customLessons = generatedPlan.levels.flatMap((level: any) => {      

        return (level.lessons || []).map((lesson: any) => ({      setLoading(false);

          id: `custom-${level.level}-${lesson.id || Math.random()}`,    }

          title: lesson.title || 'Untitled Lesson',

          description: lesson.description || 'Custom generated lesson',    loadLessons();

          level: level.level,  }, [user, speak]);

          category: (lesson.category as Category) || 'basics',

          duration: lesson.duration || 20,  // Define categories with emojis

          exercises: (lesson.exercises as Exercise[]) || [{  const categories = [

            id: `ex-${level.level}-${Math.random()}`,    { id: 'all', name: 'All Lessons', emoji: '📚' },

            type: 'multiple-choice',    { id: 'basics', name: 'Basics', emoji: '🎯' },

            question: lesson.title || 'Custom Exercise',    { id: 'words', name: 'Words', emoji: '📝' },

            options: ['Option A', 'Option B', 'Option C', 'Option D'],    { id: 'sentences', name: 'Sentences', emoji: '📖' },

            correctAnswer: 'Option A',    { id: 'contractions', name: 'Contractions', emoji: '✨' },

            braillePattern: [{ dots: [1, 2], char: 'Custom' }],    { id: 'advanced', name: 'Advanced', emoji: '🎓' }

            points: 15  ];

          }],

          prerequisites: []  // Level emojis and titles

        }));  const generateLevelInfo = (level: number) => {

      });    const emojis = ['🌱', '🌿', '🌺', '🌳', '⭐', '🎯', '🚀', '💎', '🏆', '👑'];

          const titles = [

      if (customLessons.length > 0) {      'Beginner Sprout', 'Growing Learner', 'Blooming Reader', 'Braille Explorer', 'Pattern Master',

        return customLessons;      'Word Builder', 'Sentence Reader', 'Contraction Expert', 'Speed Reader', 'Braille Champion',

      }      'Advanced Scholar', 'Literary Expert', 'Technical Reader', 'Math Specialist', 'Music Reader',

    }      'Multi-Language', 'Teaching Expert', 'Research Scholar', 'Innovation Leader', 'Master Teacher',

          'Global Expert', 'Technology Pioneer', 'Accessibility Advocate', 'Community Leader', 'Mentor Master',

    // Start with standard lessons      'Legacy Builder', 'Wisdom Keeper', 'Grand Master', 'Ultimate Scholar', 'Braille Legend'

    let processedLessons = [...allLessons];    ];

        const descriptions = [

    // Generate additional lessons for levels 6-30 if using standard plan      'Learn the braille alphabet and basic symbols',

    if (!useCustomPlan) {      'Master numbers, punctuation, and simple words',

      for (let level = 6; level <= 30; level++) {      'Read common words and simple sentences',

        const levelInfo = generateLevelInfo(level);      'Learn contractions and advanced reading',

        const lessonsPerLevel = Math.min(5 + Math.floor(level / 5), 10);      'Master complex patterns and recognition',

              'Build vocabulary and word formation',

        for (let i = 0; i < lessonsPerLevel; i++) {      'Read complete sentences fluently',

          processedLessons.push({      'Master braille contractions and shortcuts',

            id: `lesson-${level}-${i + 1}`,      'Develop speed reading techniques',

            title: `${levelInfo.title} - Part ${i + 1}`,      'Achieve championship-level skills',

            description: `Advanced ${levelInfo.description.toLowerCase()} - specialized training`,      'Advanced literary and technical reading',

            level: level,      'Master complex literary works',

            category: level <= 10 ? 'basics' : level <= 15 ? 'words' : level <= 20 ? 'sentences' : level <= 25 ? 'contractions' : 'advanced',      'Read technical and scientific texts',

            duration: 20 + (level * 2),      'Specialize in mathematical notation',

            exercises: [      'Learn braille music notation',

              {      'Read multiple languages in braille',

                id: `ex-${level}-${i}`,      'Develop teaching and mentoring skills',

                type: 'multiple-choice',      'Conduct research in braille literacy',

                question: `Advanced ${levelInfo.title} challenge`,      'Lead innovation in braille technology',

                options: ['Option A', 'Option B', 'Option C', 'Option D'],      'Master all aspects of braille education',

                correctAnswer: 'Option A',      'Become a global braille expert',

                braillePattern: [{ dots: [1, 2], char: 'Advanced' }],      'Pioneer new braille technologies',

                points: 15 + level      'Advocate for accessibility worldwide',

              }      'Lead braille communities globally',

            ],      'Mentor the next generation',

            prerequisites: level > 1 ? [`lesson-${level - 1}-1`] : []      'Build lasting educational legacies',

          });      'Preserve and share braille wisdom',

        }      'Achieve grand master status',

      }      'Become the ultimate braille scholar',

    }      'Join the legends of braille literacy'

        ];

    return processedLessons;    

  }, [useCustomPlan, generatedPlan, allLessons]);    return {

        emoji: emojis[(level - 1) % emojis.length],

  // Group lessons by level      title: titles[Math.min(level - 1, titles.length - 1)],

  const lessonsByLevel = useMemo(() =>       description: descriptions[Math.min(level - 1, descriptions.length - 1)]

    finalLessons.reduce((acc: Record<number, Lesson[]>, lesson: Lesson) => {    };

      const level = lesson.level;  };

      if (!acc[level]) {

        acc[level] = [];  const { user } = useAuth();

      }  const [savedLessons, setSavedLessons] = useState<Lesson[]>([]);

      acc[level].push(lesson);  

      return acc;  useEffect(() => {

    }, {}),     const initializeLessons = async () => {

    [finalLessons]      document.title = 'Learn Braille - BrailleLearn';

  );      window.scrollTo(0, 0);

      speak('Welcome to the learning page. Choose a lesson to begin.');

  // Sort levels      

  const sortedLevels = useMemo(() =>       try {

    Array.from({length: 30}, (_, i) => i + 1).filter(level => lessonsByLevel[level]),        if (!user) return;

    [lessonsByLevel]

  );        // Load user's lesson progress

        const { data: progress } = await supabase

  const toggleLevel = useCallback((level: number) => {          .from('lesson_progress')

    setExpandedLevel(expandedLevel === level ? null : level);          .select('*')

  }, [expandedLevel]);          .eq('user_id', user.id);

          

  // Check if a lesson is locked        if (progress) {

  const isLessonLocked = useCallback((lesson: Lesson): boolean => {          setLessonProgress(progress);

    if (!lesson.prerequisites || lesson.prerequisites.length === 0) {        }

      return false;

    }        // Load saved lessons from the database

    return !lesson.prerequisites.every((prereqId: string) => {        const { data: lessons } = await supabase

      const prereqProgress = lessonProgress.find(p => p.lessonId === prereqId);          .from('lessons')

      return prereqProgress && prereqProgress.completed;          .select('*')

    });          .order('level', { ascending: true });

  }, [lessonProgress]);

        if (lessons) {

  // Get lesson progress          setSavedLessons(lessons);

  const getLessonProgress = useCallback((lessonId: string) =>         }

    lessonProgress.find(p => p.lessonId === lessonId),        

    [lessonProgress]        // Load standard lessons for all 30 levels

  );        const loadedLessons: Lesson[] = [];

        for (let level = 1; level <= 30; level++) {

  // Calculate overall progress          const levelLessons = generateLessonsForLevel(level);

  const { completedLessons, totalLessons, overallProgress } = useMemo(() => {          loadedLessons.push(...levelLessons);

    const completed = lessonProgress.filter(p => p.completed).length;        }

    const total = finalLessons.length;        

    return {        setAllLessons([...loadedLessons, ...savedLessons]);

      completedLessons: completed,        setLoading(false);

      totalLessons: total,      } catch (error) {

      overallProgress: Math.round((completed / total) * 100)        console.error('Error loading lessons:', error);

    };        setLoading(false);

  }, [lessonProgress, finalLessons]);      }

    };

  const generateCustomLessons = useCallback(async () => {

    try {    if (user) {

      setLoading(true);      initializeLessons();

      console.log('Generating custom plan with form data:', customizationForm);  }, [speak]);

      

      const customPlan = await geminiService.generatePersonalizedStudyPlan(  // Process lessons - ALWAYS ensure we have lessons to show

        customizationForm.currentLevel,  const finalLessons = React.useMemo(() => {

        [customizationForm.focusAreas],    console.log('Processing lessons...');

        customizationForm.learningStyle,    console.log('useCustomPlan:', useCustomPlan);

        parseInt(customizationForm.timeAvailable)    console.log('generatedPlan exists:', !!generatedPlan);

      );    

          // If using custom plan and we have generated lessons, use those instead

      // Immediately set useCustomPlan to true to switch to custom lessons    if (useCustomPlan && generatedPlan && generatedPlan.levels) {

      setUseCustomPlan(true);      const customLessons = generatedPlan.levels.flatMap((level: any) => {

      setGeneratedPlan(customPlan);        // Transform the generated lessons to match the expected format

      setCustomizedLessons(customPlan.levels || []);        return (level.lessons || []).map((lesson: any) => ({

      setShowAICustomization(false);          id: `custom-${level.level}-${lesson.id || Math.random()}`,

      setShowRoadmap(true);          title: lesson.title || 'Untitled Lesson',

                description: lesson.description || 'Custom generated lesson',

      // Start roadmap animation          level: level.level,

      setRoadmapAnimation(0);          category: (lesson.category as Category) || 'basics',

      const animationTimer = setInterval(() => {          duration: lesson.duration || 20,

        setRoadmapAnimation(prev => {          exercises: (lesson.exercises as Exercise[]) || [{

          if (prev >= 6) {            id: `ex-${level.level}-${Math.random()}`,

            clearInterval(animationTimer);            type: 'multiple-choice',

            return prev;            question: lesson.title || 'Custom Exercise',

          }            options: ['Option A', 'Option B', 'Option C', 'Option D'],

          return prev + 1;            correctAnswer: 'Option A',

        });            braillePattern: [{ dots: [1, 2], char: 'Custom' }],

      }, 800);            points: 15

                }],

      speak(`Custom 30-level study plan generated! Your personalized roadmap includes ${customPlan.totalLessons} lessons across ${customPlan.estimatedWeeks} weeks.`);          prerequisites: []

              }));

      setTimeout(() => {      });

        setLoading(false);      

      }, 2000);      console.log('Custom lessons extracted:', customLessons.length);

    } catch (error) {      if (customLessons.length > 0) {

      console.error('Error generating custom lessons:', error);        return customLessons;

      speak('Error generating custom lessons. Please try again.');      }

      setLoading(false);    }

    }    

  }, [customizationForm, speak]);    // Start with standard lessons from data file

    let processedLessons = [...lessons];

  // Animation variants    console.log('Standard lessons loaded:', processedLessons.length);

  const containerVariants = {    

    hidden: { opacity: 0 },    // Generate additional lessons for levels 6-30 if using standard plan

    visible: {    if (!useCustomPlan) {

      opacity: 1,      for (let level = 6; level <= 30; level++) {

      transition: { staggerChildren: 0.1 }        const levelInfo = generateLevelInfo(level);

    }        const lessonsPerLevel = Math.min(5 + Math.floor(level / 5), 10);

  };        

        for (let i = 0; i < lessonsPerLevel; i++) {

  const itemVariants = {          processedLessons.push({

    hidden: { opacity: 0, y: 20 },            id: `lesson-${level}-${i + 1}`,

    visible: { opacity: 1, y: 0 }            title: `${levelInfo.title} - Part ${i + 1}`,

  };            description: `Advanced ${levelInfo.description.toLowerCase()} - specialized training`,

            level: level,

  return (            category: level <= 10 ? 'basics' : level <= 15 ? 'words' : level <= 20 ? 'sentences' : level <= 25 ? 'contractions' : 'advanced',

    <div className="min-h-screen bg-gray-50 braille-bg">            duration: 20 + (level * 2),

      {/* Hero Section */}            exercises: [

      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-12 relative">              {

        <div className="absolute inset-0 braille-bg opacity-10"></div>                id: `ex-${level}-${i}`,

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">                type: 'multiple-choice' as const,

          <h1 className="text-3xl font-bold leading-tight mb-4">                question: `Advanced ${levelInfo.title} challenge`,

            🎓 Learn Braille                options: ['Option A', 'Option B', 'Option C', 'Option D'],

          </h1>                correctAnswer: 'Option A',

          <p className="text-lg text-primary-100">                braillePattern: [{ dots: [1, 2], char: 'Advanced' }],

            Progress through interactive lessons at your own pace                points: 15 + level

          </p>              }

        </div>            ],

      </section>            prerequisites: level > 1 ? [`lesson-${level - 1}-1`] : []

          });

      {/* Rest of your JSX... */}        }

    </div>      }

  );    }

};    

    console.log('Final processed lessons:', processedLessons.length);

export default LearnPage;    
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