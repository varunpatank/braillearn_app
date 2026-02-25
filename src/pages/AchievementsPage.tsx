import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Trophy, Zap, Target, Flame, Crown, 
  Medal, Shield, BookOpen, Brain, Heart,
  CheckCircle, Lock, Sparkles, TrendingUp,
  Calendar, Clock, X
} from 'lucide-react';
import { useMockAuth } from '../context/MockAuthContext';
import confetti from 'canvas-confetti';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'learning' | 'practice' | 'streak' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirement: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  achievements: number;
  isCurrentUser?: boolean;
}

const AchievementsPage: React.FC = () => {
  const { user } = useMockAuth();
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard' | 'rewards'>('achievements');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [userStats] = useState({
    totalXP: 2450,
    level: 12,
    streak: 7,
    lessonsCompleted: 34,
    achievementsUnlocked: 15,
    totalAchievements: 45
  });

  useEffect(() => {
    document.title = 'Achievements & Rewards - BrailleLearn';
    window.scrollTo(0, 0);
  }, []);

  const rarityColors: Record<string, { bg: string; border: string; text: string; gradient: string; glow: string }> = {
    common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', gradient: 'from-gray-400 to-gray-500', glow: 'shadow-gray-200' },
    rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', gradient: 'from-blue-400 to-blue-600', glow: 'shadow-blue-200' },
    epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', gradient: 'from-purple-400 to-purple-600', glow: 'shadow-purple-200' },
    legendary: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-200' }
  };

  const achievements: Achievement[] = [
    { id: 'first-lesson', title: 'First Steps', description: 'Complete your first braille lesson', icon: BookOpen, category: 'learning', rarity: 'common', xpReward: 50, requirement: 'Complete 1 lesson', progress: 1, maxProgress: 1, unlocked: true, unlockedDate: '2024-01-15' },
    { id: 'alphabet-master', title: 'Alphabet Master', description: 'Learn all 26 letters of the braille alphabet', icon: Star, category: 'learning', rarity: 'rare', xpReward: 200, requirement: 'Complete all letter lessons', progress: 26, maxProgress: 26, unlocked: true, unlockedDate: '2024-02-01' },
    { id: 'number-ninja', title: 'Number Ninja', description: 'Master all braille number patterns', icon: Target, category: 'learning', rarity: 'rare', xpReward: 150, requirement: 'Complete all number lessons', progress: 10, maxProgress: 10, unlocked: true, unlockedDate: '2024-02-10' },
    { id: 'contraction-expert', title: 'Contraction Expert', description: 'Learn 50 braille contractions', icon: Brain, category: 'learning', rarity: 'epic', xpReward: 500, requirement: 'Learn 50 contractions', progress: 32, maxProgress: 50, unlocked: false },
    { id: 'grade-2-graduate', title: 'Grade 2 Graduate', description: 'Complete all Grade 2 braille lessons', icon: Crown, category: 'learning', rarity: 'legendary', xpReward: 1000, requirement: 'Complete all Grade 2 lessons', progress: 15, maxProgress: 30, unlocked: false },
    { id: 'practice-beginner', title: 'Practice Makes Perfect', description: 'Complete 10 practice sessions', icon: Zap, category: 'practice', rarity: 'common', xpReward: 75, requirement: 'Complete 10 practice sessions', progress: 10, maxProgress: 10, unlocked: true },
    { id: 'speed-demon', title: 'Speed Demon', description: 'Achieve 100% accuracy in Speed Challenge', icon: Flame, category: 'practice', rarity: 'epic', xpReward: 300, requirement: 'Perfect score in Speed mode', progress: 1, maxProgress: 1, unlocked: true },
    { id: 'memory-master', title: 'Memory Master', description: 'Complete Memory Champion mode without mistakes', icon: Brain, category: 'practice', rarity: 'epic', xpReward: 350, requirement: 'Perfect Memory game', progress: 0, maxProgress: 1, unlocked: false },
    { id: 'all-rounder', title: 'All-Rounder', description: 'Complete all 8 practice game modes', icon: Medal, category: 'practice', rarity: 'rare', xpReward: 250, requirement: 'Play all game modes', progress: 6, maxProgress: 8, unlocked: false },
    { id: 'week-warrior', title: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: Flame, category: 'streak', rarity: 'rare', xpReward: 200, requirement: '7 consecutive days', progress: 7, maxProgress: 7, unlocked: true },
    { id: 'month-master', title: 'Month Master', description: 'Maintain a 30-day learning streak', icon: Trophy, category: 'streak', rarity: 'epic', xpReward: 500, requirement: '30 consecutive days', progress: 7, maxProgress: 30, unlocked: false },
    { id: 'century-champion', title: 'Century Champion', description: 'Maintain a 100-day learning streak', icon: Crown, category: 'streak', rarity: 'legendary', xpReward: 1500, requirement: '100 consecutive days', progress: 7, maxProgress: 100, unlocked: false },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Score 100% on any lesson', icon: CheckCircle, category: 'mastery', rarity: 'common', xpReward: 100, requirement: 'Get 100% on a lesson', progress: 1, maxProgress: 1, unlocked: true },
    { id: 'accuracy-ace', title: 'Accuracy Ace', description: 'Maintain 95%+ accuracy across 20 lessons', icon: Target, category: 'mastery', rarity: 'epic', xpReward: 400, requirement: '95%+ accuracy on 20 lessons', progress: 12, maxProgress: 20, unlocked: false },
    { id: 'braille-sage', title: 'Braille Sage', description: 'Complete all lessons with 90%+ score', icon: Shield, category: 'mastery', rarity: 'legendary', xpReward: 2000, requirement: 'Master all content', progress: 34, maxProgress: 50, unlocked: false },
    { id: 'hardware-hero', title: 'Hardware Hero', description: 'Connect and use Arduino braille display', icon: Sparkles, category: 'special', rarity: 'rare', xpReward: 300, requirement: 'Use hardware device', progress: 1, maxProgress: 1, unlocked: true },
    { id: 'speech-star', title: 'Speech Star', description: 'Convert 100 words using speech-to-braille', icon: Star, category: 'special', rarity: 'rare', xpReward: 200, requirement: 'Convert 100 words', progress: 78, maxProgress: 100, unlocked: false },
    { id: 'early-bird', title: 'Early Adopter', description: 'Join BrailleLearn in its first year', icon: Heart, category: 'special', rarity: 'legendary', xpReward: 500, requirement: 'Early signup', progress: 1, maxProgress: 1, unlocked: true }
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'BrailleMaster99', avatar: '👑', xp: 15420, level: 45, achievements: 42 },
    { rank: 2, name: 'DotReader', avatar: '🌟', xp: 12890, level: 38, achievements: 38 },
    { rank: 3, name: 'TactileLearner', avatar: '🎯', xp: 11250, level: 34, achievements: 35 },
    { rank: 4, name: 'PatternPro', avatar: '💎', xp: 9870, level: 30, achievements: 31 },
    { rank: 5, name: 'CellExplorer', avatar: '🔥', xp: 8540, level: 27, achievements: 28 },
    { rank: 6, name: 'BrailleNinja', avatar: '⚡', xp: 7230, level: 24, achievements: 25 },
    { rank: 7, name: 'DotMaster', avatar: '🏆', xp: 5890, level: 21, achievements: 22 },
    { rank: 8, name: user?.username || 'You', avatar: '😊', xp: 2450, level: 12, achievements: 15, isCurrentUser: true },
    { rank: 9, name: 'TouchTyper', avatar: '📚', xp: 2100, level: 10, achievements: 12 },
    { rank: 10, name: 'BrailleNewbie', avatar: '🌱', xp: 1560, level: 8, achievements: 9 }
  ];

  const categories = [
    { id: 'learning', name: 'Learning', icon: BookOpen, emoji: '📖' },
    { id: 'practice', name: 'Practice', icon: Zap, emoji: '⚡' },
    { id: 'streak', name: 'Streaks', icon: Flame, emoji: '🔥' },
    { id: 'mastery', name: 'Mastery', icon: Trophy, emoji: '🏆' },
    { id: 'special', name: 'Special', icon: Sparkles, emoji: '✨' }
  ];

  const filteredAchievements = activeCategory
    ? achievements.filter(a => a.category === activeCategory)
    : achievements;

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    if (achievement.unlocked) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const currentLevelXP = userStats.totalXP % 250;
  const xpForNextLevel = 250;
  const levelProgress = (currentLevelXP / xpForNextLevel) * 100;
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const nearlyComplete = achievements.filter(a => !a.unlocked && a.progress / a.maxProgress >= 0.7);

  const rewardItems = [
    { id: 'r1', name: 'Dark Theme', description: 'Unlock a sleek dark mode for the app', cost: 500, icon: '🌙', category: 'Themes', owned: false },
    { id: 'r2', name: 'Golden Profile Frame', description: 'Show off with a golden border around your avatar', cost: 1000, icon: '🖼️', category: 'Profile', owned: false },
    { id: 'r3', name: 'Custom Braille Font', description: 'Access unique braille display fonts', cost: 750, icon: '🔤', category: 'Customization', owned: false },
    { id: 'r4', name: 'Streak Shield', description: 'Protect your streak for one missed day', cost: 300, icon: '🛡️', category: 'Power-ups', owned: true },
    { id: 'r5', name: 'Double XP Weekend', description: 'Earn 2x XP for an entire weekend', cost: 800, icon: '⚡', category: 'Power-ups', owned: false },
    { id: 'r6', name: 'Confetti Celebration', description: 'Extra confetti effects on achievements', cost: 200, icon: '🎊', category: 'Effects', owned: true },
    { id: 'r7', name: 'Ocean Theme', description: 'A calming ocean-inspired color palette', cost: 600, icon: '🌊', category: 'Themes', owned: false },
    { id: 'r8', name: 'Galaxy Badge', description: 'A rare galaxy-themed profile badge', cost: 1500, icon: '🌌', category: 'Profile', owned: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Header — Trophy Shelf Theme */}
      <section className="relative bg-gradient-to-r from-indigo-700 via-blue-600 to-blue-700 text-white py-12 overflow-hidden">
        {/* Trophy shelf / podium lines */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%"><defs><pattern id="shelves" width="100%" height="50" patternUnits="userSpaceOnUse"><line x1="0" y1="50" x2="100%" y2="50" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#shelves)"/></svg>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-xl"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '-100%', opacity: [0, 1, 1, 0], x: Math.sin(i) * 40 }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
              style={{ left: `${Math.random() * 100}%` }}
            >
              {['⭐', '🏆', '💎', '✨'][i % 4]}
            </motion.div>
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div className="text-center md:text-left" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Gamification System</span>
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-3">
                <span className="text-5xl">🏆</span> Achievements
              </h1>
              <p className="text-blue-100 mt-2 text-lg max-w-xl">
                Earn XP, unlock achievements, and compete on the leaderboard!
              </p>
            </motion.div>
            
            <motion.div className="flex items-center gap-3 flex-wrap justify-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              {[
                { value: userStats.level, label: 'Level', color: 'text-yellow-400' },
                { value: userStats.totalXP.toLocaleString(), label: 'XP', color: 'text-white' },
                { value: userStats.streak, label: 'Streak', color: 'text-orange-400', icon: Zap },
                { value: `${unlockedCount}/${achievements.length}`, label: 'Unlocked', color: 'text-green-400' },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20 text-center">
                  <div className={`text-2xl font-extrabold ${s.color} flex items-center justify-center gap-1`}>
                    {s.icon && <s.icon className="w-5 h-5" />}{s.value}
                  </div>
                  <div className="text-xs text-blue-200">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
          
          <motion.div className="max-w-md mx-auto md:mx-0 mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">Level {userStats.level}</span>
              <span className="text-blue-200">{currentLevelXP}/{xpForNextLevel} XP</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <motion.div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }} transition={{ duration: 1, delay: 0.5 }} />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div className="bg-white rounded-2xl shadow-xl p-2 mb-8 border-2 border-blue-100 inline-flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { id: 'achievements', label: 'Achievements', emoji: '🏅' },
            { id: 'leaderboard', label: 'Leaderboard', emoji: '🏆' },
            { id: 'rewards', label: 'Rewards Shop', emoji: '🎁' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
              }`}>
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Stats overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Completed', value: unlockedCount, icon: '✅', sub: `of ${achievements.length}` },
                  { label: 'In Progress', value: achievements.filter(a => !a.unlocked && a.progress > 0).length, icon: '🔄', sub: 'keep going!' },
                  { label: 'XP Earned', value: achievements.filter(a => a.unlocked).reduce((s, a) => s + a.xpReward, 0), icon: '⭐', sub: 'from achievements' },
                  { label: 'Nearly Done', value: nearlyComplete.length, icon: '🔥', sub: '70%+ complete' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-4 text-center"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.03, y: -4 }}>
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                    <div className="text-xs text-gray-400">{stat.sub}</div>
                  </motion.div>
                ))}
              </div>

              {/* Nearly Complete */}
              {nearlyComplete.length > 0 && (
                <motion.div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-3xl border-2 border-orange-200 p-6 mb-8"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Almost There! 🔥
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {nearlyComplete.map((a) => {
                      const colors = rarityColors[a.rarity];
                      return (
                        <motion.div key={a.id} className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-md border border-orange-200 cursor-pointer min-w-[200px]"
                          whileHover={{ scale: 1.05 }} onClick={() => handleAchievementClick(a)}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
                              <a.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-gray-900">{a.title}</div>
                              <div className="text-xs text-gray-500">{Math.round((a.progress / a.maxProgress) * 100)}% done</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full bg-gradient-to-r ${colors.gradient}`} style={{ width: `${(a.progress / a.maxProgress) * 100}%` }} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Category Filter */}
              <div className="flex flex-wrap gap-3 mb-8 justify-center">
                <button onClick={() => setActiveCategory(null)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                    activeCategory === null ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-blue-100 hover:border-blue-300'
                  }`}>
                  All ({achievements.length})
                </button>
                {categories.map((cat) => {
                  const catCount = achievements.filter(a => a.category === cat.id).length;
                  const catUnlocked = achievements.filter(a => a.category === cat.id && a.unlocked).length;
                  return (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                        activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-blue-100 hover:border-blue-300'
                      }`}>
                      <span>{cat.emoji}</span>{cat.name}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'}`}>{catUnlocked}/{catCount}</span>
                    </button>
                  );
                })}
              </div>

              {/* Achievement Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAchievements.map((achievement, index) => {
                  const colors = rarityColors[achievement.rarity];
                  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                  return (
                    <motion.div key={achievement.id}
                      className={`bg-white rounded-3xl shadow-lg border-2 overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                        achievement.unlocked ? colors.border : 'border-gray-200 opacity-80'
                      }`}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                      onClick={() => handleAchievementClick(achievement)} whileHover={{ scale: 1.02, y: -4 }}>
                      <div className={`h-1.5 bg-gradient-to-r ${colors.gradient}`} />
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          <motion.div className={`p-3 rounded-2xl ${achievement.unlocked ? `bg-gradient-to-br ${colors.gradient} shadow-lg ${colors.glow}` : 'bg-gray-200'}`}
                            whileHover={achievement.unlocked ? { rotate: [0, -10, 10, 0] } : {}}>
                            {achievement.unlocked ? <achievement.icon className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-gray-400" />}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>{achievement.rarity}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">{achievement.requirement}</span>
                                <span className="font-bold text-gray-700">{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <motion.div className={`h-2.5 rounded-full bg-gradient-to-r ${colors.gradient}`}
                                  initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-yellow-600 flex items-center gap-1">
                                <Star className="w-4 h-4" />+{achievement.xpReward} XP
                              </span>
                              {achievement.unlocked && achievement.unlockedDate && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />{new Date(achievement.unlockedDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <motion.div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-blue-100">
                    <div className="p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
                      <h2 className="text-2xl font-extrabold flex items-center gap-3">
                        <Trophy className="w-7 h-7 text-yellow-400" /> Global Leaderboard
                      </h2>
                      <p className="text-blue-200 mt-1">Top learners this month</p>
                    </div>
                    
                    {/* Top 3 Podium */}
                    <div className="flex justify-center items-end gap-4 p-6 bg-gradient-to-b from-blue-50 to-white">
                      {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
                        const heights = ['h-24', 'h-32', 'h-20'];
                        const sizes = ['text-4xl', 'text-5xl', 'text-4xl'];
                        return (
                          <motion.div key={entry.rank} className="flex flex-col items-center"
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                            <span className={`${sizes[i]} mb-2`}>{entry.avatar}</span>
                            <div className="font-bold text-sm text-gray-900 mb-1">{entry.name}</div>
                            <div className="text-xs text-gray-500 mb-2">{entry.xp.toLocaleString()} XP</div>
                            <div className={`${heights[i]} w-20 rounded-t-xl flex items-start justify-center pt-2 ${
                              i === 1 ? 'bg-gradient-to-b from-yellow-400 to-yellow-500' :
                              i === 0 ? 'bg-gradient-to-b from-gray-300 to-gray-400' :
                              'bg-gradient-to-b from-orange-300 to-orange-400'
                            }`}>
                              <span className="text-white font-extrabold text-lg">{i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    <div className="divide-y">
                      {leaderboard.slice(3).map((entry, index) => (
                        <motion.div key={entry.rank}
                          className={`flex items-center gap-4 p-4 ${entry.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600">{entry.rank}</div>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl shadow-md">{entry.avatar}</div>
                          <div className="flex-1">
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {entry.name}
                              {entry.isCurrentUser && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">You</span>}
                            </div>
                            <div className="text-sm text-gray-500">Level {entry.level} • {entry.achievements} achievements</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{entry.xp.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">XP</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-6">
                  <motion.div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Target className="w-5 h-5" /> Your Position</h3>
                    <div className="text-center">
                      <div className="text-6xl font-extrabold text-yellow-400">#8</div>
                      <div className="text-blue-200 mt-1">out of 10 players</div>
                      <div className="mt-4 bg-white/10 rounded-xl p-3">
                        <div className="text-sm text-blue-200">XP to next rank</div>
                        <div className="text-xl font-bold">3,440 XP</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" /> This Week
                    </h3>
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                        const activity = [85, 60, 100, 45, 90, 30, 70][i];
                        const isToday = i === new Date().getDay() - 1;
                        return (
                          <div key={day} className="flex items-center gap-3">
                            <span className={`text-xs font-bold w-8 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>{day}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                              <motion.div className={`h-2.5 rounded-full ${isToday ? 'bg-blue-600' : 'bg-blue-300'}`}
                                initial={{ width: 0 }} animate={{ width: `${activity}%` }} transition={{ duration: 0.5, delay: i * 0.1 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600" /> Collection
                    </h3>
                    <div className="space-y-3">
                      {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
                        const total = achievements.filter(a => a.rarity === rarity).length;
                        const unlocked = achievements.filter(a => a.rarity === rarity && a.unlocked).length;
                        const colors = rarityColors[rarity];
                        return (
                          <div key={rarity} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${colors.gradient}`} />
                            <span className="text-sm font-medium text-gray-700 capitalize flex-1">{rarity}</span>
                            <span className="text-sm font-bold text-gray-900">{unlocked}/{total}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* REWARDS SHOP TAB */}
          {activeTab === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <motion.div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-6 text-white mb-8 shadow-xl"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="text-sm text-blue-200 font-medium">Your XP Balance</div>
                    <div className="text-4xl font-extrabold flex items-center gap-2">
                      <Star className="w-8 h-8 text-yellow-400" />{userStats.totalXP.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-center">
                      <div className="text-lg font-bold">{rewardItems.filter(r => r.owned).length}</div>
                      <div className="text-xs text-blue-200">Owned</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 text-center">
                      <div className="text-lg font-bold">{rewardItems.length}</div>
                      <div className="text-xs text-blue-200">Available</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {rewardItems.map((item, index) => {
                  const canAfford = userStats.totalXP >= item.cost;
                  return (
                    <motion.div key={item.id}
                      className={`bg-white rounded-3xl shadow-lg border-2 p-5 text-center transition-all ${
                        item.owned ? 'border-green-300 bg-green-50' : canAfford ? 'border-blue-200 hover:border-blue-400' : 'border-gray-200 opacity-70'
                      }`}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
                      whileHover={!item.owned ? { scale: 1.05, y: -4 } : {}}>
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mb-3">{item.description}</p>
                      <div className="text-xs text-gray-400 mb-3">{item.category}</div>
                      {item.owned ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-full font-bold text-sm">
                          <CheckCircle className="w-4 h-4" /> Owned
                        </span>
                      ) : (
                        <button className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                          canAfford ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`} disabled={!canAfford}>
                          <Star className="w-4 h-4 inline mr-1" />{item.cost} XP
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <div className={`p-8 bg-gradient-to-br ${rarityColors[selectedAchievement.rarity].gradient} text-white text-center relative`}>
                <button onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <X className="w-5 h-5" />
                </button>
                <motion.div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4"
                  initial={{ rotate: 0 }} animate={selectedAchievement.unlocked ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}>
                  <selectedAchievement.icon className="w-10 h-10" />
                </motion.div>
                <h2 className="text-2xl font-extrabold">{selectedAchievement.title}</h2>
                <p className="text-white/80 mt-2">{selectedAchievement.description}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-yellow-600">+{selectedAchievement.xpReward}</div>
                    <div className="text-xs text-gray-500">XP Reward</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`text-lg font-bold ${rarityColors[selectedAchievement.rarity].text}`}>
                      {selectedAchievement.rarity.charAt(0).toUpperCase() + selectedAchievement.rarity.slice(1)}
                    </div>
                    <div className="text-xs text-gray-500">Rarity</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{selectedAchievement.requirement}</span>
                    <span className="font-bold">{selectedAchievement.progress}/{selectedAchievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className={`h-3 rounded-full bg-gradient-to-r ${rarityColors[selectedAchievement.rarity].gradient}`}
                      style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }} />
                  </div>
                </div>
                {selectedAchievement.unlocked && selectedAchievement.unlockedDate && (
                  <div className="text-center text-sm text-green-600 font-medium flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Unlocked on {new Date(selectedAchievement.unlockedDate).toLocaleDateString()}
                  </div>
                )}
                <button onClick={() => setSelectedAchievement(null)}
                  className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementsPage;
