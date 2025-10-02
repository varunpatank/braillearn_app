import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, Play, Check, X, ChevronDown, 
  Settings, Sparkles, Send, Route
} from 'lucide-react';
import { lessons } from '../data/lessons';
import { geminiService } from '../services/geminiService';
import type { ScheduledLesson, StudyPlan, JourneyAnimation, Lesson, LessonProgress } from '../types/types';

interface SchedulePreferences {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focusAreas: 'basics' | 'words' | 'sentences' | 'contractions' | 'advanced' | 'all';
  lessonsPerWeek: number;
  totalLessons: number;
  timePerLesson: number;
  preferredDays: string[];
  startDate: string;
}

const NewLearnPage: React.FC = () => {
  // Context hooks
  const { speak } = useAudio();
  const { user } = useAuth();

  // Core state
  const [loading, setLoading] = useState(true);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);

  // Schedule management state
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [hasConfirmedSchedule, setHasConfirmedSchedule] = useState(false);
  const [showScheduleBuilder, setShowScheduleBuilder] = useState(false);
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  // Animation state
  const [journeyAnimation, setJourneyAnimation] = useState<JourneyAnimation>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    message: '',
    progress: 0
  });

  // UI state
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'agent';
    timestamp: Date;
  }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [scheduleEditing, setScheduleEditing] = useState(false);

  // Schedule preferences
  const [schedulePrefs, setSchedulePrefs] = useState<SchedulePreferences>({
    difficulty: 'beginner',
    focusAreas: 'all',
    lessonsPerWeek: 3,
    totalLessons: 50,
    timePerLesson: 20,
    preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startDate: new Date().toISOString().split('T')[0]
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load lessons from data folder
        setAllLessons(lessons);
        console.log(`Loaded ${lessons.length} lessons from data`);
        
        // Check for existing study plan
        const savedPlan = localStorage.getItem('braillearn-study-plan');
        const savedConfirmation = localStorage.getItem('braillearn-schedule-confirmed');
        
        if (savedPlan && savedConfirmation === 'true') {
          const plan: StudyPlan = JSON.parse(savedPlan);
          setStudyPlan(plan);
          setHasConfirmedSchedule(true);
          console.log('Restored saved study plan:', plan);
        }
        
        // Load user progress if authenticated
        if (user) {
          const { data: progress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id);
            
          if (progress) {
            setLessonProgress(progress);
          }
        }
        
        speak('Welcome to your personalized braille learning journey!');
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, speak]);

  // Generate study plan from preferences
  const generateStudyPlan = (prefs: SchedulePreferences): StudyPlan => {
    console.log('Generating study plan with preferences:', prefs);
    
    // Filter lessons based on preferences
    let selectedLessons = [...lessons];
    
    // Filter by difficulty
    if (prefs.difficulty === 'beginner') {
      selectedLessons = selectedLessons.filter(lesson => lesson.level <= 10);
    } else if (prefs.difficulty === 'intermediate') {
      selectedLessons = selectedLessons.filter(lesson => lesson.level >= 5 && lesson.level <= 20);
    } else if (prefs.difficulty === 'advanced') {
      selectedLessons = selectedLessons.filter(lesson => lesson.level >= 15);
    }
    
    // Filter by focus areas
    if (prefs.focusAreas !== 'all') {
      selectedLessons = selectedLessons.filter(lesson => 
        lesson.category === prefs.focusAreas || lesson.category === 'basics'
      );
    }
    
    // Limit to requested number of lessons
    selectedLessons = selectedLessons.slice(0, prefs.totalLessons);
    
    // Create schedule
    const startDate = new Date(prefs.startDate);
    const scheduledLessons: ScheduledLesson[] = selectedLessons.map((lesson, index) => {
      const lessonDate = new Date(startDate);
      const weekNumber = Math.floor(index / prefs.lessonsPerWeek);
      const dayInWeek = index % prefs.lessonsPerWeek;
      lessonDate.setDate(startDate.getDate() + (weekNumber * 7) + dayInWeek);
      
      return {
        ...lesson,
        scheduledDate: lessonDate.toISOString(),
        isCompleted: false,
        canReschedule: true,
        priority: index < 10 ? 'high' : index < 30 ? 'medium' : 'low',
        estimatedCompletionTime: prefs.timePerLesson,
        adaptiveDifficulty: 'normal'
      };
    });

    const targetEndDate = new Date(startDate);
    targetEndDate.setDate(startDate.getDate() + Math.ceil(selectedLessons.length / prefs.lessonsPerWeek) * 7);

    return {
      id: `plan-${Date.now()}`,
      userId: user?.id || 'guest',
      title: `${prefs.difficulty.charAt(0).toUpperCase() + prefs.difficulty.slice(1)} Braille Journey`,
      description: `Personalized ${selectedLessons.length}-lesson plan focusing on ${prefs.focusAreas}`,
      totalLessons: selectedLessons.length,
      scheduledLessons,
      startDate: startDate.toISOString(),
      targetEndDate: targetEndDate.toISOString(),
      currentStreak: 0,
      weeklyGoal: prefs.lessonsPerWeek,
      isActive: true,
      aiManaged: true,
      preferences: {
        preferredTimeSlots: ['morning'],
        maxLessonsPerDay: Math.min(prefs.lessonsPerWeek, 3),
        difficultyProgression: prefs.difficulty === 'beginner' ? 'gradual' : 'moderate',
        focusAreas: [prefs.focusAreas],
        availableDays: prefs.preferredDays
      },
      statistics: {
        lessonsCompleted: 0,
        averageScore: 0,
        timeSpent: 0,
        currentLevel: 1,
        strengthAreas: [],
        improvementAreas: []
      }
    };
  };

  // Journey animation
  const playJourneyAnimation = async (plan: StudyPlan) => {
    const steps = [
      "🚀 Analyzing your learning goals...",
      "📚 Selecting perfect lessons from our library...",
      "📅 Creating your personalized schedule...",
      "🎯 Optimizing lesson order for maximum progress...",
      "✨ Your learning journey is ready!"
    ];

    setJourneyAnimation({
      isPlaying: true,
      currentStep: 0,
      totalSteps: steps.length,
      message: steps[0],
      progress: 0
    });

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
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

  // Generate schedule
  const handleGenerateSchedule = async () => {
    try {
      setLoading(true);
      const plan = generateStudyPlan(schedulePrefs);
      await playJourneyAnimation(plan);
    } catch (error) {
      console.error('Error generating schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // Confirm schedule
  const confirmSchedule = () => {
    if (studyPlan) {
      localStorage.setItem('braillearn-study-plan', JSON.stringify(studyPlan));
      localStorage.setItem('braillearn-schedule-confirmed', 'true');
      
      setHasConfirmedSchedule(true);
      setShowSchedulePreview(false);
      setShowScheduleBuilder(false);
      
      speak(`Your personalized study plan with ${studyPlan.totalLessons} lessons has been saved!`);
    }
  };

  // Reject schedule
  const rejectSchedule = () => {
    setShowSchedulePreview(false);
    setStudyPlan(null);
    setShowScheduleBuilder(true);
  };

  // Start new plan
  const startNewPlan = () => {
    localStorage.removeItem('braillearn-study-plan');
    localStorage.removeItem('braillearn-schedule-confirmed');
    setStudyPlan(null);
    setHasConfirmedSchedule(false);
    setShowScheduleBuilder(true);
  };

  // Auto-modify schedule based on user request
  const autoModifySchedule = (userRequest: string, currentPlan: StudyPlan): StudyPlan => {
    const request = userRequest.toLowerCase();
    const modifiedPlan = { ...currentPlan };
    let changesApplied = [];

    // Handle difficulty changes with level modifications
    if (request.includes('harder') || request.includes('more challenging') || request.includes('difficult')) {
      // Get harder lessons from higher levels (levels 15+)
      const harderLessons = lessons.filter(l => l.level >= 15);
      
      if (harderLessons.length > 0) {
        const startDate = new Date(modifiedPlan.startDate);
        // Make dates closer together for harder difficulty (every 1-2 days)
        modifiedPlan.scheduledLessons = harderLessons.slice(0, Math.max(currentPlan.totalLessons, 40)).map((lesson, index) => {
          const newDate = new Date(startDate);
          newDate.setDate(startDate.getDate() + (index * 1.5)); // 1.5 days between lessons
          return {
            ...lesson,
            scheduledDate: newDate.toISOString(),
            isCompleted: false,
            canReschedule: true,
            priority: 'high' as const,
            estimatedCompletionTime: lesson.duration + 10, // Longer time for harder lessons
            adaptiveDifficulty: 'hard' as const
          };
        });
        
        modifiedPlan.totalLessons = modifiedPlan.scheduledLessons.length;
        modifiedPlan.weeklyGoal = Math.min(7, Math.ceil(modifiedPlan.weeklyGoal * 1.5)); // More frequent
        modifiedPlan.preferences.difficultyProgression = 'aggressive';
        
        // Update target end date
        const lastLesson = modifiedPlan.scheduledLessons[modifiedPlan.scheduledLessons.length - 1];
        modifiedPlan.targetEndDate = lastLesson.scheduledDate;
        
        changesApplied.push(`upgraded to ${modifiedPlan.scheduledLessons.length} advanced lessons from levels 15+`);
        changesApplied.push('compressed schedule to 1.5-day intervals');
        changesApplied.push(`increased weekly goal to ${modifiedPlan.weeklyGoal} lessons`);
      }
    }

    if (request.includes('easier') || request.includes('simpler') || request.includes('beginner')) {
      // Get easier lessons from lower levels (levels 1-10)
      const easierLessons = lessons.filter(l => l.level <= 10);
      
      if (easierLessons.length > 0) {
        const startDate = new Date(modifiedPlan.startDate);
        // Spread out dates more for easier difficulty (every 4-5 days)
        modifiedPlan.scheduledLessons = easierLessons.slice(0, Math.max(currentPlan.totalLessons, 30)).map((lesson, index) => {
          const newDate = new Date(startDate);
          newDate.setDate(startDate.getDate() + (index * 4)); // 4 days between lessons
          return {
            ...lesson,
            scheduledDate: newDate.toISOString(),
            isCompleted: false,
            canReschedule: true,
            priority: 'low' as const,
            estimatedCompletionTime: Math.max(10, lesson.duration - 5), // Shorter time for easier lessons
            adaptiveDifficulty: 'easy' as const
          };
        });
        
        modifiedPlan.totalLessons = modifiedPlan.scheduledLessons.length;
        modifiedPlan.weeklyGoal = Math.max(1, Math.floor(modifiedPlan.weeklyGoal / 2)); // Less frequent
        modifiedPlan.preferences.difficultyProgression = 'gradual';
        
        // Update target end date
        const lastLesson = modifiedPlan.scheduledLessons[modifiedPlan.scheduledLessons.length - 1];
        modifiedPlan.targetEndDate = lastLesson.scheduledDate;
        
        changesApplied.push(`switched to ${modifiedPlan.scheduledLessons.length} beginner lessons from levels 1-10`);
        changesApplied.push('spread out schedule to 4-day intervals');
        changesApplied.push(`reduced weekly goal to ${modifiedPlan.weeklyGoal} lessons`);
      }
    }

    // Handle date spacing changes (independent of difficulty)
    if (request.includes('spread out') || request.includes('more time') || request.includes('slower pace')) {
      const startDate = new Date(modifiedPlan.startDate);
      modifiedPlan.scheduledLessons = modifiedPlan.scheduledLessons.map((lesson, index) => {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + (index * 5)); // 5 days between lessons
        return {
          ...lesson,
          scheduledDate: newDate.toISOString()
        };
      });
      
      // Update target end date
      const lastLesson = modifiedPlan.scheduledLessons[modifiedPlan.scheduledLessons.length - 1];
      modifiedPlan.targetEndDate = lastLesson.scheduledDate;
      
      modifiedPlan.weeklyGoal = Math.max(1, Math.floor(modifiedPlan.weeklyGoal / 2));
      changesApplied.push('spaced lessons 5 days apart', 'reduced weekly goal');
    }

    if (request.includes('faster') || request.includes('accelerate') || request.includes('daily') || request.includes('more frequent')) {
      const startDate = new Date(modifiedPlan.startDate);
      modifiedPlan.scheduledLessons = modifiedPlan.scheduledLessons.map((lesson, index) => {
        const newDate = new Date(startDate);
        newDate.setDate(startDate.getDate() + index); // Daily lessons
        return {
          ...lesson,
          scheduledDate: newDate.toISOString()
        };
      });
      
      // Update target end date
      const lastLesson = modifiedPlan.scheduledLessons[modifiedPlan.scheduledLessons.length - 1];
      modifiedPlan.targetEndDate = lastLesson.scheduledDate;
      
      modifiedPlan.weeklyGoal = Math.min(7, modifiedPlan.weeklyGoal * 2);
      changesApplied.push('scheduled daily lessons', 'increased weekly goal');
    }

    // Handle focus area changes
    if (request.includes('focus on words') || request.includes('more words')) {
      const wordLessons = lessons.filter(l => l.category === 'words');
      if (wordLessons.length > 0) {
        const currentDates = modifiedPlan.scheduledLessons.map(l => l.scheduledDate);
        modifiedPlan.scheduledLessons = wordLessons.slice(0, currentDates.length).map((lesson, index) => ({
          ...lesson,
          scheduledDate: currentDates[index],
          isCompleted: false,
          canReschedule: true,
          priority: 'medium' as const,
          estimatedCompletionTime: lesson.duration,
          adaptiveDifficulty: 'normal' as const
        }));
        changesApplied.push('focused on word-based lessons');
      }
    }

    if (request.includes('contractions') || request.includes('abbreviations')) {
      const contractionLessons = lessons.filter(l => l.category === 'contractions');
      if (contractionLessons.length > 0) {
        const currentDates = modifiedPlan.scheduledLessons.map(l => l.scheduledDate);
        modifiedPlan.scheduledLessons = contractionLessons.slice(0, currentDates.length).map((lesson, index) => ({
          ...lesson,
          scheduledDate: currentDates[index],
          isCompleted: false,
          canReschedule: true,
          priority: 'medium' as const,
          estimatedCompletionTime: lesson.duration,
          adaptiveDifficulty: 'normal' as const
        }));
        changesApplied.push('focused on contractions and abbreviations');
      }
    }

    // Handle lesson count changes
    if (request.includes('more lessons') || request.includes('add lessons')) {
      const additionalLessons = lessons.filter(l => 
        !modifiedPlan.scheduledLessons.some(sl => sl.id === l.id)
      ).slice(0, 15); // Add up to 15 more lessons

      const lastDate = new Date(modifiedPlan.scheduledLessons[modifiedPlan.scheduledLessons.length - 1]?.scheduledDate || new Date());
      
      additionalLessons.forEach((lesson, index) => {
        const newDate = new Date(lastDate);
        newDate.setDate(lastDate.getDate() + (index + 1) * 2);
        modifiedPlan.scheduledLessons.push({
          ...lesson,
          scheduledDate: newDate.toISOString(),
          isCompleted: false,
          canReschedule: true,
          priority: 'medium' as const,
          estimatedCompletionTime: lesson.duration,
          adaptiveDifficulty: 'normal' as const
        });
      });
      
      modifiedPlan.totalLessons = modifiedPlan.scheduledLessons.length;
      
      // Update target end date
      const lastLesson = modifiedPlan.scheduledLessons[modifiedPlan.scheduledLessons.length - 1];
      modifiedPlan.targetEndDate = lastLesson.scheduledDate;
      
      changesApplied.push(`added ${additionalLessons.length} more lessons`);
    }

    // Update plan metadata
    if (changesApplied.length > 0) {
      modifiedPlan.description = `Modified plan: ${changesApplied.join(', ')}`;
    }
    
    return modifiedPlan;
  };
  // Handle AI chat for schedule modifications
  const handleAIRequest = async (message: string) => {
    if (!message.trim()) return;
    
    setChatLoading(true);
    setScheduleEditing(true);
    
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
    
    try {
      // Auto-modify the schedule based on user request
      if (studyPlan) {
        const modifiedPlan = autoModifySchedule(message, studyPlan);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Apply the changes
        setStudyPlan(modifiedPlan);
        localStorage.setItem('braillearn-study-plan', JSON.stringify(modifiedPlan));
        
        // Create context about current study plan
        const context = `Successfully modified your study plan: ${modifiedPlan.description}. You now have ${modifiedPlan.totalLessons} lessons with ${modifiedPlan.weeklyGoal} lessons per week.`;
        
        const response = await geminiService.askInstructor(
          `The user requested: "${message}". I've automatically applied changes to their braille learning schedule. Context: ${context}. Please provide a friendly confirmation message about what was changed and encourage them to continue learning. Respond as the Braillearn Agent.`,
          context
        );
        
        const agentMessage = {
          id: (Date.now() + 1).toString(),
          text: response + `\n\n✅ Changes applied automatically!\n📚 Your schedule now has ${modifiedPlan.totalLessons} lessons\n🎯 Weekly goal: ${modifiedPlan.weeklyGoal} lessons`,
          sender: 'agent' as const,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, agentMessage]);
        speak(`Schedule updated! ${modifiedPlan.description}`);
        
      } else {
        // No study plan to modify
        const response = await geminiService.askInstructor(
          `User request: ${message}\n\nThe user doesn't have a study plan yet. Please encourage them to create one first and explain how the Braillearn Agent can help modify schedules once they have one.`,
          'No active study plan'
        );
        
        const agentMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'agent' as const,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, agentMessage]);
      }
      
    } catch (error) {
      console.error('Error with agent request:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now, but I'd be happy to help you adjust your study schedule. Try asking about changing lesson difficulty, focus areas, or weekly goals!",
        sender: 'agent' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
      setScheduleEditing(false);
    }
  };

  // Helper functions
  const getCurrentLessons = () => {
    return hasConfirmedSchedule && studyPlan ? studyPlan.scheduledLessons : allLessons;
  };

  const getLessonsByLevel = () => {
    const currentLessons = getCurrentLessons();
    return currentLessons.reduce((acc: Record<number, (Lesson | ScheduledLesson)[]>, lesson: Lesson | ScheduledLesson) => {
      const level = lesson.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(lesson);
      return acc;
    }, {});
  };

  const getSortedLevels = () => {
    const lessonsByLevel = getLessonsByLevel();
    return Array.from({length: 30}, (_, i) => i + 1).filter(level => lessonsByLevel[level]);
  };

  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.find(p => p.lessonId === lessonId);
  };

  const calculateProgress = () => {
    const currentLessons = getCurrentLessons();
    const completedLessons = lessonProgress.filter(p => p.completed).length;
    const totalLessons = currentLessons.length;
    return Math.round((completedLessons / totalLessons) * 100) || 0;
  };

  const getLevelInfo = (level: number) => {
    const emojis = ['🌱', '🌿', '🌺', '🌳', '⭐', '🎯', '🚀', '💎', '🏆', '👑'];
    const titles = [
      'Foundation', 'Building', 'Growing', 'Exploring', 'Mastering',
      'Advanced', 'Expert', 'Elite', 'Champion', 'Legend'
    ];
    
    return {
      emoji: emojis[(level - 1) % emojis.length],
      title: titles[Math.min(level - 1, titles.length - 1)],
      description: `Level ${level} - ${titles[Math.min(level - 1, titles.length - 1)]} Braille Skills`
    };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Journey Animation Overlay */}
      <AnimatePresence>
        {journeyAnimation.isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-xl p-8 max-w-md mx-4 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold mb-4">Creating Your Journey</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${journeyAnimation.progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">{journeyAnimation.message}</p>
              <div className="mt-4 text-sm text-gray-500">
                Step {journeyAnimation.currentStep} of {journeyAnimation.totalSteps}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Preview Modal */}
      <AnimatePresence>
        {showSchedulePreview && studyPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  📅 Your Personalized Learning Schedule
                </h2>
                <p className="text-gray-600">
                  {studyPlan.totalLessons} lessons over {Math.ceil(studyPlan.totalLessons / studyPlan.weeklyGoal)} weeks
                </p>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {studyPlan.scheduledLessons.slice(0, 20).map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                          <p className="text-sm text-gray-500">
                            Level {lesson.level} • {lesson.duration} min • {lesson.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(lesson.scheduledDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(lesson.scheduledDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {studyPlan.scheduledLessons.length > 20 && (
                    <div className="text-center py-4 text-gray-500">
                      ... and {studyPlan.scheduledLessons.length - 20} more lessons
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex space-x-4">
                <button
                  onClick={confirmSchedule}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Confirm & Start Journey
                </button>
                <button
                  onClick={rejectSchedule}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Modify Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Builder Modal */}
      <AnimatePresence>
        {showScheduleBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ✨ Create Your Learning Schedule
                </h2>
                <p className="text-gray-600">
                  Let's build a personalized plan from our {lessons.length} available lessons
                </p>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={schedulePrefs.difficulty}
                      onChange={(e) => setSchedulePrefs({...schedulePrefs, difficulty: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="beginner">Beginner (Levels 1-10)</option>
                      <option value="intermediate">Intermediate (Levels 5-20)</option>
                      <option value="advanced">Advanced (Levels 15+)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Areas
                    </label>
                    <select
                      value={schedulePrefs.focusAreas}
                      onChange={(e) => setSchedulePrefs({...schedulePrefs, focusAreas: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Areas</option>
                      <option value="basics">Basics & Letters</option>
                      <option value="words">Words & Vocabulary</option>
                      <option value="sentences">Sentences & Reading</option>
                      <option value="contractions">Contractions</option>
                      <option value="advanced">Advanced Skills</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lessons per Week
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={schedulePrefs.lessonsPerWeek}
                      onChange={(e) => setSchedulePrefs({...schedulePrefs, lessonsPerWeek: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Lessons
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={schedulePrefs.totalLessons}
                      onChange={(e) => setSchedulePrefs({...schedulePrefs, totalLessons: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time per Lesson (minutes)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="60"
                      value={schedulePrefs.timePerLesson}
                      onChange={(e) => setSchedulePrefs({...schedulePrefs, timePerLesson: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={schedulePrefs.startDate}
                      onChange={(e) => setSchedulePrefs({...schedulePrefs, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex space-x-4">
                <button
                  onClick={handleGenerateSchedule}
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center disabled:opacity-50"
                >
                  <Route className="w-5 h-5 mr-2" />
                  {loading ? 'Generating...' : 'Generate Schedule'}
                </button>
                <button
                  onClick={() => setShowScheduleBuilder(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <BookOpen className="w-8 h-8 text-primary-600 mr-3" />
                    Braille Learning Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    <span className="font-semibold text-primary-600">{allLessons.length}</span> lessons from data
                    {hasConfirmedSchedule && studyPlan && (
                      <>
                        {' • '}
                        <span className="font-semibold text-green-600">
                          {studyPlan.totalLessons} lessons in your plan
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {hasConfirmedSchedule && (
                    <>
                      <button
                        onClick={() => setShowAIChat(!showAIChat)}
                        className="px-3 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm rounded-full hover:from-primary-600 hover:to-primary-700 font-medium flex items-center shadow-md transform hover:scale-105 transition-all duration-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Agent
                      </button>
                      <button
                        onClick={startNewPlan}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        New Plan
                      </button>
                    </>
                  )}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{calculateProgress()}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!hasConfirmedSchedule ? (
              // Empty state - no schedule yet
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Ready to Start Your Braille Journey?
                </h3>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Create a personalized learning schedule from our library of {lessons.length} carefully crafted lessons
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl mb-3">📚</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{lessons.length} Lessons</h4>
                    <p className="text-gray-600 text-sm">From data folder, all verified and structured</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl mb-3">🤖</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Smart Agent</h4>
                    <p className="text-gray-600 text-sm">Braillearn Agent helps with scheduling and modifications</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl mb-3">💾</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Persistent</h4>
                    <p className="text-gray-600 text-sm">Your schedule saves automatically</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleBuilder(true)}
                  className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <Play className="w-6 h-6 mr-3" />
                  Create My Schedule
                </button>
              </div>
            ) : (
              // Show lessons by level
              <div className="space-y-6">
                {getSortedLevels().map((level) => {
                  const levelLessons = getLessonsByLevel()[level] || [];
                  const levelInfo = getLevelInfo(level);
                  const completedCount = levelLessons.filter(lesson => 
                    getLessonProgress(lesson.id)?.completed
                  ).length;
                  
                  return (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div
                        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">{levelInfo.emoji}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                Level {level}: {levelInfo.title}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                {levelInfo.description}
                              </p>
                              <div className="text-sm text-gray-500 mt-2">
                                {completedCount} / {levelLessons.length} completed
                                {hasConfirmedSchedule && levelLessons.length > 0 && (
                                  <div className="mt-1">
                                    <span className="text-xs text-blue-600">
                                      📅 Next: {(() => {
                                        const nextLesson = levelLessons.find(l => !getLessonProgress(l.id)?.completed) as ScheduledLesson;
                                        return nextLesson?.scheduledDate ? 
                                          new Date(nextLesson.scheduledDate).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric' 
                                          }) : 'TBD';
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="w-32 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${(completedCount / levelLessons.length) * 100}%` 
                                }}
                              ></div>
                            </div>
                            <ChevronDown 
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
                                expandedLevel === level ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedLevel === level && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gray-50 border-t border-gray-200"
                          >
                            <div className="p-6">
                              {/* Roadmap Timeline View */}
                              <div className="space-y-4">
                                {levelLessons
                                  .sort((a, b) => {
                                    const aDate = 'scheduledDate' in a ? a.scheduledDate : '';
                                    const bDate = 'scheduledDate' in b ? b.scheduledDate : '';
                                    return new Date(aDate).getTime() - new Date(bDate).getTime();
                                  })
                                  .map((lesson, index) => {
                                  const scheduledLesson = lesson as ScheduledLesson;
                                  const isScheduled = hasConfirmedSchedule && 'scheduledDate' in lesson;
                                  const lessonDate = isScheduled ? new Date(scheduledLesson.scheduledDate) : null;
                                  const isUpcoming = lessonDate && lessonDate > new Date();
                                  const isToday = lessonDate && 
                                    lessonDate.toDateString() === new Date().toDateString();
                                  const isPast = lessonDate && lessonDate < new Date() && !isToday;
                                  const progress = getLessonProgress(lesson.id);
                                  const isCompleted = progress?.completed || false;
                                  
                                  return (
                                    <motion.div
                                      key={lesson.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="relative"
                                    >
                                      {/* Timeline connector */}
                                      {index < levelLessons.length - 1 && (
                                        <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-primary-300 to-primary-200 z-0"></div>
                                      )}
                                      
                                      <div className={`relative flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                                        isToday 
                                          ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
                                          : isCompleted 
                                            ? 'border-green-300 bg-green-50' 
                                            : isUpcoming 
                                              ? 'border-blue-300 bg-blue-50' 
                                              : isPast 
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-gray-200 bg-white'
                                      }`}>
                                        {/* Timeline dot */}
                                        <div className={`relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                                          isCompleted 
                                            ? 'bg-green-500 border-green-300' 
                                            : isToday 
                                              ? 'bg-yellow-400 border-yellow-300 animate-pulse' 
                                              : isUpcoming 
                                                ? 'bg-blue-500 border-blue-300' 
                                                : isPast 
                                                  ? 'bg-red-400 border-red-300'
                                                  : 'bg-gray-300 border-gray-200'
                                        }`}>
                                          {isCompleted ? (
                                            <Check className="w-6 h-6 text-white" />
                                          ) : isToday ? (
                                            <Play className="w-6 h-6 text-white" />
                                          ) : (
                                            <BookOpen className="w-6 h-6 text-white" />
                                          )}
                                          
                                          {/* Pulsing animation for today's lesson */}
                                          {isToday && (
                                            <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20"></div>
                                          )}
                                        </div>
                                        
                                        {/* Lesson content */}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <h4 className="font-semibold text-gray-900 mb-1">
                                                {lesson.title}
                                              </h4>
                                              <p className="text-sm text-gray-600 mb-2">
                                                {lesson.description}
                                              </p>
                                              
                                              {/* Date and status badges */}
                                              <div className="flex items-center space-x-2 flex-wrap">
                                                {isScheduled && (
                                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    isToday 
                                                      ? 'bg-yellow-200 text-yellow-800' 
                                                      : isUpcoming 
                                                        ? 'bg-blue-200 text-blue-800' 
                                                        : isPast 
                                                          ? 'bg-red-200 text-red-800'
                                                          : 'bg-gray-200 text-gray-800'
                                                  }`}>
                                                    📅 {lessonDate?.toLocaleDateString('en-US', { 
                                                      month: 'short', 
                                                      day: 'numeric',
                                                      weekday: 'short'
                                                    })}
                                                  </span>
                                                )}
                                                
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                  (lesson.level <= 5) 
                                                    ? 'bg-green-200 text-green-800' 
                                                    : (lesson.level <= 15) 
                                                      ? 'bg-yellow-200 text-yellow-800' 
                                                      : 'bg-red-200 text-red-800'
                                                }`}>
                                                  {lesson.level <= 5 ? 'Beginner' : lesson.level <= 15 ? 'Intermediate' : 'Advanced'}
                                                </span>
                                                
                                                <span className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-medium">
                                                  {('estimatedCompletionTime' in lesson ? lesson.estimatedCompletionTime : lesson.duration) || 20}m
                                                </span>
                                                
                                                {isCompleted && progress?.score && (
                                                  <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                                                    {progress.score}% ⭐
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* Action button */}
                                            <div className="ml-4">
                                              <Link
                                                to={`/learn/${lesson.id}`}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                                  isCompleted 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                    : isToday 
                                                      ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500 shadow-lg animate-pulse' 
                                                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                                                }`}
                                              >
                                                {isCompleted ? 'Review' : isToday ? 'Start Now!' : 'Start Lesson'}
                                              </Link>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Editing Loading Overlay */}
        {scheduleEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-primary-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Editing Schedule</h3>
              <p className="text-gray-600 mb-4">
                Braillearn Agent is updating your learning plan...
              </p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Braillearn Agent Chat Overlay */}
        {showAIChat && hasConfirmedSchedule && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            className="fixed top-24 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold text-sm">Braillearn Agent</span>
                </div>
                <button
                  onClick={() => setShowAIChat(false)}
                  className="text-primary-100 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-primary-100 text-xs mt-1">
                Customize your learning schedule
              </p>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[400px]">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-xs p-3">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary-400" />
                  <p className="mb-2 font-medium">I can automatically modify your schedule:</p>
                  <ul className="text-left space-y-1 text-xs">
                    <li>• "Make it harder" - Advanced levels + closer dates</li>
                    <li>• "Make it easier" - Beginner levels + spaced out</li>
                    <li>• "Spread out dates" - More time between lessons</li>
                    <li>• "Focus on words" - Change to word-based lessons</li>
                    <li>• "Add more lessons" - Extend your program</li>
                  </ul>
                </div>
              )}
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
                      message.sender === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div>{message.text}</div>
                    <div className={`text-xs mt-1 opacity-70 ${
                      message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-2.5 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500"></div>
                      <span className="text-xs text-gray-600">Analyzing...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && handleAIRequest(chatInput)}
                  placeholder="Ask me to modify your schedule..."
                  className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 text-xs bg-white"
                  disabled={chatLoading}
                />
                <button
                  onClick={() => handleAIRequest(chatInput)}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-2.5 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={12} />
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Try: "Make it easier", "Make it harder", or "Spread out dates"
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewLearnPage;