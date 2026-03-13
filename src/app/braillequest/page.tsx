'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useSupabase } from '@/hooks/useSupabase'
import { getProfile, getUserMissions, completeMission as dbCompleteMission, updateProfile, getUserBadges, awardBadge, getUserAchievements, updateAchievementProgress, getLeaderboard } from '@/services/dbService'

import { parseExifGps } from '@/utils/exif'
import { openRouterService } from '@/services/openRouterService'
import { geminiService } from '@/services/geminiService'
import {
  MapPin, Camera, Trophy, Star, CheckCircle,
  X, Upload, Target, Award, Globe, Lock,
  Share2, Brain,
  Flame,
  BookOpen, Zap, Crown, Medal, Shield,
  Heart, Sparkles, ChevronLeft, ChevronRight,
  Volume2, Bot
} from 'lucide-react'

interface Mission {
  id: string
  level: number
  title: string
  description: string
  xpReward: number
  icon: string
  category: 'signage' | 'transport' | 'food' | 'education' | 'public' | 'medical' | 'recreation' | 'government'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  completed?: boolean
  bonusObjective?: string
}

interface LeaderboardEntry {
  rank: number
  name: string
  avatar: string
  xp: number
  missionsCompleted: number
  streak: number
}

type CategoryFilter = 'all' | Mission['category']

export default function BrailleQuestPage() {
  const missions: Mission[] = useMemo(() => ([
    { id: 'm1', level: 1, title: 'Spot a Door Sign', description: 'Find and photograph a braille sign on any public building entrance.', xpReward: 25, icon: '🚪', category: 'signage', difficulty: 'easy', bonusObjective: 'Find one with room numbers' },
    { id: 'm2', level: 1, title: 'Restroom Finder', description: 'Locate a braille restroom sign and capture it clearly.', xpReward: 30, icon: '🚻', category: 'signage', difficulty: 'easy' },
    { id: 'm3', level: 1, title: 'Elevator Explorer', description: 'Find braille on elevator buttons or panels.', xpReward: 35, icon: '🛗', category: 'signage', difficulty: 'easy', bonusObjective: 'Photograph all floor buttons' },
    { id: 'm4', level: 1, title: 'Room Number Reader', description: 'Find braille room numbers in a hotel or office building.', xpReward: 25, icon: '🔢', category: 'signage', difficulty: 'easy' },
    { id: 'm5', level: 1, title: 'Parking Sign Spotter', description: 'Find braille on a handicapped parking sign.', xpReward: 30, icon: '🅿️', category: 'signage', difficulty: 'easy' },
    { id: 'm6', level: 2, title: 'Bus Stop Detective', description: 'Discover braille information at a public transit stop.', xpReward: 50, icon: '🚌', category: 'transport', difficulty: 'medium', bonusObjective: 'Find route info in braille' },
    { id: 'm7', level: 2, title: 'ATM Hunter', description: 'Find and photograph braille on an ATM machine keypad.', xpReward: 45, icon: '🏧', category: 'public', difficulty: 'medium' },
    { id: 'm8', level: 2, title: 'Menu Master', description: 'Locate a restaurant with a braille menu option.', xpReward: 60, icon: '🍽️', category: 'food', difficulty: 'medium', bonusObjective: 'Ask staff about it' },
    { id: 'm9', level: 2, title: 'Pharmacy Finder', description: 'Find braille labels on prescription medication bottles.', xpReward: 55, icon: '💊', category: 'medical', difficulty: 'medium' },
    { id: 'm10', level: 2, title: 'Store Directory', description: 'Find a braille store directory in a shopping mall.', xpReward: 50, icon: '🏬', category: 'public', difficulty: 'medium' },
    { id: 'm11', level: 2, title: 'Crosswalk Clicker', description: 'Find braille on a pedestrian crossing signal button.', xpReward: 40, icon: '🚶', category: 'transport', difficulty: 'medium' },
    { id: 'm12', level: 2, title: 'Vending Victory', description: 'Find braille labels on a vending machine.', xpReward: 45, icon: '🥤', category: 'public', difficulty: 'medium' },
    { id: 'm13', level: 3, title: 'Library Legend', description: 'Find braille resources or signage in a public library.', xpReward: 70, icon: '📚', category: 'education', difficulty: 'hard', bonusObjective: 'Find a braille book' },
    { id: 'm14', level: 3, title: 'Museum Guide', description: 'Discover braille descriptions at a museum exhibit.', xpReward: 80, icon: '🏛️', category: 'education', difficulty: 'hard' },
    { id: 'm15', level: 3, title: 'Hospital Navigator', description: 'Document braille wayfinding signs in a hospital.', xpReward: 75, icon: '🏥', category: 'medical', difficulty: 'hard' },
    { id: 'm16', level: 3, title: 'Park Explorer', description: 'Find braille on trail signs or information boards in a park.', xpReward: 65, icon: '🌲', category: 'recreation', difficulty: 'hard', bonusObjective: 'Find a tactile nature map' },
    { id: 'm17', level: 3, title: 'Airport Ace', description: 'Document braille accessibility features at an airport.', xpReward: 85, icon: '✈️', category: 'transport', difficulty: 'hard' },
    { id: 'm18', level: 3, title: 'School Scout', description: 'Find braille signage in a school or university.', xpReward: 70, icon: '🏫', category: 'education', difficulty: 'hard' },
    { id: 'm19', level: 3, title: 'Government Guru', description: 'Find braille at a government building (courthouse, city hall).', xpReward: 75, icon: '🏛️', category: 'government', difficulty: 'hard' },
    { id: 'm20', level: 4, title: 'Tactile Map Finder', description: 'Locate a tactile/braille map in a public space.', xpReward: 100, icon: '🗺️', category: 'public', difficulty: 'hard', bonusObjective: 'Describe what the map shows' },
    { id: 'm21', level: 4, title: 'Train Station Pro', description: 'Document braille accessibility features at a train station.', xpReward: 90, icon: '🚂', category: 'transport', difficulty: 'hard' },
    { id: 'm22', level: 4, title: 'Hotel Investigator', description: 'Find 3+ different braille signs in one hotel.', xpReward: 95, icon: '🏨', category: 'signage', difficulty: 'hard' },
    { id: 'm23', level: 4, title: 'Playground Pioneer', description: 'Find braille signage at a playground or recreation center.', xpReward: 85, icon: '🎡', category: 'recreation', difficulty: 'hard' },
    { id: 'm24', level: 4, title: 'Movie Night', description: 'Find braille accessibility options at a movie theater.', xpReward: 90, icon: '🎬', category: 'recreation', difficulty: 'hard' },
    { id: 'm25', level: 5, title: 'Braille Art Discovery', description: 'Find public art or sculpture that incorporates braille.', xpReward: 150, icon: '🎨', category: 'recreation', difficulty: 'legendary', bonusObjective: 'Research the artist' },
    { id: 'm26', level: 5, title: 'Currency Expert', description: 'Document all accessibility features on different currency bills.', xpReward: 120, icon: '💵', category: 'public', difficulty: 'legendary' },
    { id: 'm27', level: 5, title: 'Historic Discovery', description: 'Find braille at a historical landmark or monument.', xpReward: 140, icon: '🏰', category: 'education', difficulty: 'legendary' },
    { id: 'm28', level: 5, title: 'Braille in Nature', description: 'Find a braille trail guide or nature center with braille.', xpReward: 130, icon: '🦋', category: 'recreation', difficulty: 'legendary' },
    { id: 'm29', level: 6, title: 'World Traveler', description: 'Document braille signs in 3 different cities.', xpReward: 200, icon: '🌍', category: 'public', difficulty: 'legendary', bonusObjective: 'Compare accessibility across cities' },
    { id: 'm30', level: 6, title: 'Accessibility Advocate', description: 'Find a business WITHOUT braille and help them learn about it.', xpReward: 250, icon: '📢', category: 'public', difficulty: 'legendary', bonusObjective: 'Write them a friendly letter' },
    { id: 'm31', level: 6, title: 'Community Mapper', description: 'Create a complete braille accessibility map of your neighborhood.', xpReward: 300, icon: '🗺️', category: 'public', difficulty: 'legendary', bonusObjective: 'Map 10+ locations' },
    { id: 'm32', level: 6, title: 'Ultimate BrailleQuest', description: 'Complete every mission category and earn the Master Explorer badge.', xpReward: 500, icon: '👑', category: 'public', difficulty: 'legendary' },
  ]), [])

  const fallbackLeaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'BrailleHero', avatar: '🦸', xp: 4850, missionsCompleted: 31, streak: 21 },
    { rank: 2, name: 'AccessChamp', avatar: '🏆', xp: 4180, missionsCompleted: 28, streak: 14 },
    { rank: 3, name: 'TactileExplorer', avatar: '🔍', xp: 3920, missionsCompleted: 25, streak: 18 },
    { rank: 4, name: 'SignSpotter', avatar: '👁️', xp: 3650, missionsCompleted: 22, streak: 9 },
    { rank: 5, name: 'BrailleFinder', avatar: '🔦', xp: 3100, missionsCompleted: 20, streak: 7 },
    { rank: 6, name: 'AccessExplorer', avatar: '🧭', xp: 2800, missionsCompleted: 18, streak: 11 },
    { rank: 7, name: 'DotReader', avatar: '⠿', xp: 2400, missionsCompleted: 15, streak: 5 },
    { rank: 8, name: 'You', avatar: '⭐', xp: 1200, missionsCompleted: 16, streak: 3 },
    { rank: 9, name: 'NewExplorer', avatar: '🌱', xp: 800, missionsCompleted: 8, streak: 2 },
    { rank: 10, name: 'BrailleRookie', avatar: '🐣', xp: 350, missionsCompleted: 4, streak: 1 },
  ]

  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'uploading' | 'verifying' | 'success' | 'failure'>('idle')
  const [verifyReason, setVerifyReason] = useState<string>('')
  const [showMissionModal, setShowMissionModal] = useState(false)
  const [userStats, setUserStats] = useState({ xp: 1200, streak: 3, missions: 16, rank: 8, totalFinds: 42, citiesMapped: 2 })
  const [completedMissions, setCompletedMissions] = useState<string[]>([])
  const [fileCoords, setFileCoords] = useState<{ latitude?: number; longitude?: number } | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareAchievement, setShareAchievement] = useState<string>('')
  const [sideTabIndex, setSideTabIndex] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(100)
  const [showGoalEditor, setShowGoalEditor] = useState(false)
  const [ownedRewards, setOwnedRewards] = useState<string[]>(['r4', 'r6'])
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([])
  const [dbAchievementData, setDbAchievementData] = useState<{ achievement_id: string; progress: number; max_progress: number; unlocked: boolean }[]>([])
  const [dbLeaderboard, setDbLeaderboard] = useState<LeaderboardEntry[]>([])
  const leaderboard = dbLeaderboard.length > 0 ? dbLeaderboard : fallbackLeaderboard
  const [lessonContent, setLessonContent] = useState<{ title: string; facts: string[]; brailleTypes: { name: string; desc: string; dots: number[] }[]; funFact: string; braillePreview: { letter: string; dots: number[] }[]; commonPatterns?: { symbol: string; meaning: string; dots: number[] }[]; explanation?: string; practiceTips?: string[]; realWorldExamples?: string[] } | null>(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [activeDotCell, setActiveDotCell] = useState<number | null>(null)
  const [imageDescription, setImageDescription] = useState('')
  const [showFirstMissionCelebration, setShowFirstMissionCelebration] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showFullLesson, setShowFullLesson] = useState(false)
  const [timelineIndex, setTimelineIndex] = useState(0)

  const pathRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const velocity = useRef({ x: 0, y: 0 })
  const lastMouse = useRef({ x: 0, y: 0, t: 0 })
  const momentumRaf = useRef<number>(0)

  const { user: _user, isLoaded: clerkLoaded } = useUser()

  const aiInsights = [
    { icon: '🔥', title: 'Hot Streak!', desc: `You've completed 3 missions this week. Keep going to earn the 7-day streak badge!` },
    { icon: '📊', title: 'Most Active Category', desc: 'You focus on signage missions. Try transport or food categories for variety!' },
    { icon: '🎯', title: 'Next Recommended', desc: 'Based on your progress, try "Bus Stop Detective" — it\'s nearby and matches your skill level.' },
    { icon: '📈', title: 'Weekly Progress', desc: 'You\'re 40% more active than last week. At this rate, you\'ll reach Explorer rank in 5 days!' },
    { icon: '🏆', title: 'Achievement Alert', desc: 'You\'re 2 missions away from unlocking the "Category Explorer" badge!' },
  ]

  const navigate = useNavigate()
  const supabase = useSupabase()

  const levels = [
    { level: 1, title: 'Beginner', requiredXP: 0, icon: '🌱',
      bgStyle: { background: 'linear-gradient(180deg, #0c4a6e 0%, #075985 25%, #0284c7 50%, #0ea5e9 75%, #7dd3fc 100%)' } },
    { level: 2, title: 'Explorer', requiredXP: 100, icon: '🧭',
      bgStyle: { background: 'linear-gradient(180deg, #0c2d48 0%, #1a3a5c 25%, #1e40af 50%, #2563eb 75%, #3b82f6 100%)' } },
    { level: 3, title: 'Adventurer', requiredXP: 300, icon: '⛰️',
      bgStyle: { background: 'linear-gradient(180deg, #2e1065 0%, #4c1d95 25%, #6d28d9 50%, #7c3aed 75%, #8b5cf6 100%)' } },
    { level: 4, title: 'Champion', requiredXP: 600, icon: '🏆',
      bgStyle: { background: 'linear-gradient(180deg, #451a03 0%, #78350f 25%, #b45309 50%, #d97706 75%, #f59e0b 100%)' } },
    { level: 5, title: 'Master', requiredXP: 1000, icon: '💎',
      bgStyle: { background: 'linear-gradient(180deg, #500724 0%, #831843 25%, #be185d 50%, #ec4899 75%, #f472b6 100%)' } },
    { level: 6, title: 'Legend', requiredXP: 2000, icon: '👑',
      bgStyle: { background: 'linear-gradient(180deg, #0f0c29 0%, #1a1a2e 20%, #302b63 40%, #44337a 60%, #6d28d9 80%, #f59e0b 100%)' } },
  ]

  const badgeDefinitions = [
    { id: 'first-find', icon: '🔍', name: 'First Find', desc: 'Complete your first mission' },
    { id: 'shutterbug', icon: '📸', name: 'Shutterbug', desc: 'Upload 5 verified photos' },
    { id: '7-day-streak', icon: '🏃', name: '7-Day Streak', desc: 'Complete missions 7 days in a row' },
    { id: 'star-hunter', icon: '🌟', name: 'Star Hunter', desc: 'Earn 500+ XP total' },
    { id: 'explorer', icon: '🗺️', name: 'Explorer', desc: 'Complete all Level 1 missions' },
    { id: 'champion', icon: '🏆', name: 'Champion', desc: 'Reach Champion rank' },
    { id: 'rare-find', icon: '💎', name: 'Rare Find', desc: 'Complete a legendary mission' },
    { id: 'legend', icon: '👑', name: 'Legend', desc: 'Complete all missions' },
    { id: 'world-traveler', icon: '🌍', name: 'World Traveler', desc: 'Find braille in 3 cities' },
    { id: 'category-explorer', icon: '🎨', name: 'Category Explorer', desc: 'Complete missions in 5 categories' },
    { id: 'on-fire', icon: '🔥', name: 'On Fire', desc: 'Complete 3 missions in one day' },
    { id: 'advocate', icon: '📢', name: 'Advocate', desc: 'Help a business learn about braille' },
  ]
  const badges = badgeDefinitions.map(b => ({ ...b, earned: earnedBadgeIds.includes(b.id) }))

  interface AchievementItem {
    id: string; title: string; description: string; icon: React.ElementType;
    category: 'learning' | 'practice' | 'streak' | 'mastery' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number; requirement: string; progress: number; maxProgress: number;
    unlocked: boolean; unlockedDate?: string;
  }

  const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
    common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700' },
    rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
    epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
    legendary: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700' }
  }

  const achievementDefaults: AchievementItem[] = [
    { id: 'first-lesson', title: 'First Steps', description: 'Complete your first braille lesson', icon: BookOpen, category: 'learning', rarity: 'common', xpReward: 50, requirement: 'Complete 1 lesson', progress: 0, maxProgress: 1, unlocked: false },
    { id: 'alphabet-master', title: 'Alphabet Master', description: 'Learn all 26 letters of the braille alphabet', icon: Star, category: 'learning', rarity: 'rare', xpReward: 200, requirement: 'Complete all letter lessons', progress: 0, maxProgress: 26, unlocked: false },
    { id: 'number-ninja', title: 'Number Ninja', description: 'Master all braille number patterns', icon: Target, category: 'learning', rarity: 'rare', xpReward: 150, requirement: 'Complete all number lessons', progress: 0, maxProgress: 10, unlocked: false },
    { id: 'contraction-expert', title: 'Contraction Expert', description: 'Learn 50 braille contractions', icon: Brain, category: 'learning', rarity: 'epic', xpReward: 500, requirement: 'Learn 50 contractions', progress: 0, maxProgress: 50, unlocked: false },
    { id: 'grade-2-graduate', title: 'Grade 2 Graduate', description: 'Complete all Grade 2 braille lessons', icon: Crown, category: 'learning', rarity: 'legendary', xpReward: 1000, requirement: 'Complete all Grade 2 lessons', progress: 0, maxProgress: 30, unlocked: false },
    { id: 'practice-beginner', title: 'Practice Makes Perfect', description: 'Complete 10 practice sessions', icon: Zap, category: 'practice', rarity: 'common', xpReward: 75, requirement: 'Complete 10 practice sessions', progress: 0, maxProgress: 10, unlocked: false },
    { id: 'speed-demon', title: 'Speed Demon', description: 'Achieve 100% accuracy in Speed Challenge', icon: Flame, category: 'practice', rarity: 'epic', xpReward: 300, requirement: 'Perfect score in Speed mode', progress: 0, maxProgress: 1, unlocked: false },
    { id: 'memory-master', title: 'Memory Master', description: 'Complete Memory Champion mode without mistakes', icon: Brain, category: 'practice', rarity: 'epic', xpReward: 350, requirement: 'Perfect Memory game', progress: 0, maxProgress: 1, unlocked: false },
    { id: 'all-rounder', title: 'All-Rounder', description: 'Complete all 8 practice game modes', icon: Medal, category: 'practice', rarity: 'rare', xpReward: 250, requirement: 'Play all game modes', progress: 0, maxProgress: 8, unlocked: false },
    { id: 'week-warrior', title: 'Week Warrior', description: 'Maintain a 7-day learning streak', icon: Flame, category: 'streak', rarity: 'rare', xpReward: 200, requirement: '7 consecutive days', progress: 0, maxProgress: 7, unlocked: false },
    { id: 'month-master', title: 'Month Master', description: 'Maintain a 30-day learning streak', icon: Trophy, category: 'streak', rarity: 'epic', xpReward: 500, requirement: '30 consecutive days', progress: 0, maxProgress: 30, unlocked: false },
    { id: 'century-champion', title: 'Century Champion', description: 'Maintain a 100-day learning streak', icon: Crown, category: 'streak', rarity: 'legendary', xpReward: 1500, requirement: '100 consecutive days', progress: 0, maxProgress: 100, unlocked: false },
    { id: 'perfect-score', title: 'Perfectionist', description: 'Score 100% on any lesson', icon: CheckCircle, category: 'mastery', rarity: 'common', xpReward: 100, requirement: 'Get 100% on a lesson', progress: 0, maxProgress: 1, unlocked: false },
    { id: 'accuracy-ace', title: 'Accuracy Ace', description: 'Maintain 95%+ accuracy across 20 lessons', icon: Target, category: 'mastery', rarity: 'epic', xpReward: 400, requirement: '95%+ accuracy on 20 lessons', progress: 0, maxProgress: 20, unlocked: false },
    { id: 'braille-sage', title: 'Braille Sage', description: 'Complete all lessons with 90%+ score', icon: Shield, category: 'mastery', rarity: 'legendary', xpReward: 2000, requirement: 'Master all content', progress: 0, maxProgress: 50, unlocked: false },
    { id: 'hardware-hero', title: 'Hardware Hero', description: 'Connect and use Arduino braille display', icon: Sparkles, category: 'special', rarity: 'rare', xpReward: 300, requirement: 'Use hardware device', progress: 0, maxProgress: 1, unlocked: false },
    { id: 'speech-star', title: 'Speech Star', description: 'Convert 100 words using speech-to-braille', icon: Star, category: 'special', rarity: 'rare', xpReward: 200, requirement: 'Convert 100 words', progress: 0, maxProgress: 100, unlocked: false },
    { id: 'early-bird', title: 'Early Adopter', description: 'Join BrailleLearn in its first year', icon: Heart, category: 'special', rarity: 'legendary', xpReward: 500, requirement: 'Early signup', progress: 0, maxProgress: 1, unlocked: false }
  ]

  const achievementsList: AchievementItem[] = achievementDefaults.map(def => {
    const dbRow = dbAchievementData.find(d => d.achievement_id === def.id)
    if (dbRow) {
      return { ...def, progress: dbRow.progress, unlocked: dbRow.unlocked, unlockedDate: dbRow.unlocked ? new Date().toISOString().split('T')[0] : undefined }
    }
    return def
  })

  const rewardItems = [
    { id: 'r1', name: 'Dark Theme', description: 'Unlock a sleek dark mode for the app', cost: 500, icon: '🌙', category: 'Themes' },
    { id: 'r2', name: 'Golden Profile Frame', description: 'Show off with a golden border around your avatar', cost: 1000, icon: '🖼️', category: 'Profile' },
    { id: 'r3', name: 'Custom Braille Font', description: 'Access unique braille display fonts', cost: 750, icon: '🔤', category: 'Customization' },
    { id: 'r4', name: 'Streak Shield', description: 'Protect your streak for one missed day', cost: 300, icon: '🛡️', category: 'Power-ups' },
    { id: 'r5', name: 'Double XP Weekend', description: 'Earn 2x XP for an entire weekend', cost: 800, icon: '⚡', category: 'Power-ups' },
    { id: 'r6', name: 'Confetti Celebration', description: 'Extra confetti effects on achievements', cost: 200, icon: '🎊', category: 'Effects' },
    { id: 'r7', name: 'Ocean Theme', description: 'A calming ocean-inspired color palette', cost: 600, icon: '🌊', category: 'Themes' },
    { id: 'r8', name: 'Galaxy Badge', description: 'A rare galaxy-themed profile badge', cost: 1500, icon: '🌌', category: 'Profile' },
  ]

  const achievementCategories = [
    { id: 'learning', name: 'Learning', emoji: '📖' },
    { id: 'practice', name: 'Practice', emoji: '⚡' },
    { id: 'streak', name: 'Streaks', emoji: '🔥' },
    { id: 'mastery', name: 'Mastery', emoji: '🏆' },
    { id: 'special', name: 'Special', emoji: '✨' }
  ]

  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState<string | null>(null)
  const filteredAchievements = achievementCategoryFilter
    ? achievementsList.filter(a => a.category === achievementCategoryFilter)
    : achievementsList
  const unlockedAchievements = achievementsList.filter(a => a.unlocked).length

  const sideTabs = [
    { key: 'xp', label: 'XP Progress', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-5 h-5 text-yellow-500" /> },
    { key: 'rewards', label: 'Rewards', icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
    { key: 'badges', label: 'Badges', icon: <Award className="w-5 h-5 text-purple-500" /> },
    { key: 'activity', label: 'Activity', icon: <Brain className="w-5 h-5 text-indigo-500" /> },
    { key: 'achievements', label: 'Achievements', icon: <Medal className="w-5 h-5 text-yellow-500" /> },
    { key: 'share', label: 'Share', icon: <Share2 className="w-5 h-5 text-blue-500" /> },
  ]

  function prevSideTab() { setSideTabIndex(i => i > 0 ? i - 1 : sideTabs.length - 1) }
  function nextSideTab() { setSideTabIndex(i => i < sideTabs.length - 1 ? i + 1 : 0) }

  useEffect(() => {
    const onTab = (e: Event) => {
      const { page, tab } = (e as CustomEvent).detail || {}
      if (page !== 'braillequest') return
      const idx = sideTabs.findIndex(t => t.key === tab)
      if (idx >= 0) setSideTabIndex(idx)
    }
    const fileInputRef_braylin = document.querySelector('input[type="file"]') as HTMLInputElement | null
    const onAction = (e: Event) => {
      const { action, category, level } = (e as CustomEvent).detail || {}
      if (action === 'filter') setCategoryFilter(category || 'all')
      if (action === 'select-level') setSelectedLevel(level)
      if (action === 'next-mission') {
        const available = missions.filter(m => !completedMissions.includes(m.id) && (categoryFilter === 'all' || m.category === categoryFilter))
        if (available.length > 0) {
          setSelectedMission(available[0])
          setShowMissionModal(true)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Mission: ${available[0].title}. ${available[0].description}. Say "take photo" to upload an image, or "close" to go back.` } }))
          }, 500)
        } else {
          window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'No available missions in this category. Try "show all missions" or pick a different level.' } }))
        }
      }
      if (action === 'submit') handleSubmit()
      if (action === 'take-photo') {
        if (fileInputRef_braylin) fileInputRef_braylin.click()
      }
      if (action === 'view-lesson') {
        if (lessonContent) {
          setTimelineIndex(0)
          setShowFullLesson(true)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Lesson opened: ${lessonContent.title}. Say "next" to advance, "read this" to hear the current section, or "close" to exit.` } }))
          }, 600)
        } else if (lessonLoading) {
          window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'The lesson is still loading. Please wait a moment and try again.' } }))
        } else {
          window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'No lesson available yet. Complete a mission first to unlock a braille lesson.' } }))
        }
      }
      if (action === 'next-section' && showFullLesson && lessonContent) {
        const totalSections = [lessonContent.explanation, lessonContent.braillePreview?.length, lessonContent.facts?.length, lessonContent.commonPatterns?.length, lessonContent.realWorldExamples?.length, lessonContent.practiceTips?.length, true].filter(Boolean).length
        if (timelineIndex < totalSections - 1) {
          setTimelineIndex(prev => prev + 1)
        } else {
          setShowFullLesson(false)
          window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Lesson complete! Great work. Say "next mission" to continue exploring.' } }))
        }
      }
      if (action === 'prev-section' && showFullLesson && lessonContent) {
        if (timelineIndex > 0) {
          setTimelineIndex(prev => prev - 1)
        } else {
          window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Already at the first section.' } }))
        }
      }
      if (action === 'read-section' && showFullLesson && lessonContent) {
        const sectionNames: string[] = []
        if (lessonContent.explanation) sectionNames.push('overview')
        if (lessonContent.braillePreview?.length) sectionNames.push('braille')
        if (lessonContent.facts?.length) sectionNames.push('facts')
        if (lessonContent.commonPatterns?.length) sectionNames.push('patterns')
        if (lessonContent.realWorldExamples?.length) sectionNames.push('real-world')
        if (lessonContent.practiceTips?.length) sectionNames.push('tips')
        sectionNames.push('fun fact')
        const idx = Math.min(timelineIndex, sectionNames.length - 1)
        const name = sectionNames[idx]
        let narration = ''
        if (name === 'overview') narration = lessonContent.explanation || ''
        else if (name === 'braille') narration = `Interactive braille preview: ${lessonContent.braillePreview!.map(c => `${c.letter.toUpperCase()} uses dots ${c.dots.join(', ')}`).join('. ')}.`
        else if (name === 'facts') narration = `Key facts: ${lessonContent.facts!.slice(0, 4).join('. ')}.`
        else if (name === 'patterns') narration = `Braille patterns: ${lessonContent.commonPatterns!.slice(0, 4).map(p => `${p.symbol} means ${p.meaning}`).join('. ')}.`
        else if (name === 'real-world') narration = `Real world examples: ${lessonContent.realWorldExamples!.join('. ')}.`
        else if (name === 'tips') narration = `Practice tips: ${lessonContent.practiceTips!.join('. ')}.`
        else if (name === 'fun fact') narration = `Fun fact: ${lessonContent.funFact}`
        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: narration || 'This section has visual content. Try "next" to continue.' } }))
      }
      if (action === 'complete-lesson') {
        if (showFullLesson) {
          setShowFullLesson(false)
          setTimelineIndex(0)
          window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Lesson complete! Great work. Say "next mission" to keep exploring.' } }))
        }
      }
    }
    const onDismiss = () => {
      if (showMissionModal) {
        setShowMissionModal(false)
        setSelectedMission(null)
        setFile(null)
        setPreview(null)
        setVerifyStatus('idle')
      }
      if (showShareModal) setShowShareModal(false)
      if (showGoalEditor) setShowGoalEditor(false)
    }
    const onConfirm = () => {
      if (showMissionModal && file) {
        handleSubmit()
      } else if (showShareModal) {
        shareToClipboard()
      } else if (showGoalEditor) {
        saveDailyGoal(dailyGoal)
      } else if (showMissionModal && !file) {
        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'You need to take a photo first. Say "take photo" to capture an image.' } }))
      }
    }
    window.addEventListener('braylin-tab', onTab)
    window.addEventListener('braylin-quest-action', onAction)
    window.addEventListener('braylin-dismiss', onDismiss)
    window.addEventListener('braylin-confirm', onConfirm)
    return () => {
      window.removeEventListener('braylin-tab', onTab)
      window.removeEventListener('braylin-quest-action', onAction)
      window.removeEventListener('braylin-dismiss', onDismiss)
      window.removeEventListener('braylin-confirm', onConfirm)
    }
  }, [completedMissions, categoryFilter, showMissionModal, showShareModal, showGoalEditor, file, selectedMission, showFullLesson, timelineIndex, lessonContent, lessonLoading])

  useEffect(() => {
    if (showMissionModal && selectedMission) {
      const msg = `Mission opened: ${selectedMission.title}. ${selectedMission.description}. Worth ${selectedMission.xpReward} XP. Say "take photo" to capture an image, "submit" after uploading, or "close" to dismiss.`
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: msg } }))
    }
  }, [showMissionModal, selectedMission])

  useEffect(() => {
    if (verifyStatus === 'uploading') {
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'Uploading your photo...' } }))
    } else if (verifyStatus === 'verifying') {
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: 'AI is verifying your submission. Please wait...' } }))
    } else if (verifyStatus === 'success') {
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Mission complete! ${verifyReason}. You earned XP! A braille lesson is loading now.` } }))
    } else if (verifyStatus === 'failure') {
      window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Verification failed. ${verifyReason}. Try taking another photo or say "close" to dismiss.` } }))
    }
  }, [verifyStatus, verifyReason])

  useEffect(() => {
    if (!showFullLesson || !lessonContent) return
    const sectionNames: string[] = []
    if (lessonContent.explanation) sectionNames.push('Overview')
    if (lessonContent.braillePreview?.length) sectionNames.push('Braille Preview')
    if (lessonContent.facts?.length) sectionNames.push('Key Facts')
    if (lessonContent.commonPatterns?.length) sectionNames.push('Patterns')
    if (lessonContent.realWorldExamples?.length) sectionNames.push('Real World')
    if (lessonContent.practiceTips?.length) sectionNames.push('Practice Tips')
    sectionNames.push('Fun Fact')
    const idx = Math.min(timelineIndex, sectionNames.length - 1)
    const total = sectionNames.length
    window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Section ${idx + 1} of ${total}: ${sectionNames[idx]}. Say "read this" to hear it, or "next" to continue.` } }))
  }, [timelineIndex, showFullLesson])

  useEffect(() => {
    if (!lessonLoading && lessonContent && verifyStatus === 'success' && !showFullLesson) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Your braille lesson "${lessonContent.title}" is ready! Say "view lesson" to start learning, or "close" to dismiss.` } }))
      }, 2000)
    }
  }, [lessonLoading, lessonContent, verifyStatus])

  useEffect(() => {
    if (!clerkLoaded) return

    const userId = (_user as any)?.id
    if (!userId) {
      setCompletedMissions([])
      setUserStats({ xp: 1200, streak: 3, missions: 16, rank: 8, totalFinds: 42, citiesMapped: 2 })
      setEarnedBadgeIds([])
      setDbAchievementData([])
      try { localStorage.removeItem('bq_completed') } catch {}
      return
    }
    try {
      const cached = localStorage.getItem('bq_completed')
      if (cached) setCompletedMissions(JSON.parse(cached))
    } catch {}
    async function loadData() {
      try {
        const [profile, missionData, badgeIds, achievementRows, leaderboardData] = await Promise.all([
          getProfile(supabase, userId),
          getUserMissions(supabase, userId),
          getUserBadges(supabase, userId),
          getUserAchievements(supabase, userId),
          getLeaderboard(supabase, 20)
        ])
        if (profile) {
          setUserStats({
            xp: profile.xp ?? 0,
            streak: profile.streak ?? 0,
            missions: missionData?.length ?? 0,
            rank: profile.rank ?? 0,
            totalFinds: profile.total_finds ?? 0,
            citiesMapped: profile.cities_mapped ?? 0,
          })
        }
        if (missionData && missionData.length > 0) {
          const ids = missionData.map(m => m.mission_id)
          setCompletedMissions(ids)
          try { localStorage.setItem('bq_completed', JSON.stringify(ids)) } catch {}
        }
        if (badgeIds && badgeIds.length > 0) {
          setEarnedBadgeIds(badgeIds)
        }
        if (achievementRows && achievementRows.length > 0) {
          setDbAchievementData(achievementRows.map((r: any) => ({
            achievement_id: r.achievement_id,
            progress: r.progress ?? 0,
            max_progress: r.max_progress ?? 0,
            unlocked: r.unlocked ?? false
          })))
        }
        if (leaderboardData && leaderboardData.length > 0) {
          const avatars = ['🦸', '🏆', '🔍', '👁️', '🔦', '🧭', '⠿', '⭐', '🌱', '🐣']
          setDbLeaderboard(leaderboardData.map((p: any, i: number) => ({
            rank: i + 1,
            name: p.id === userId ? 'You' : (p.display_name || p.username || `Explorer${i + 1}`),
            avatar: p.id === userId ? '⭐' : (avatars[i % avatars.length]),
            xp: p.xp ?? 0,
            missionsCompleted: p.total_finds ?? 0,
            streak: p.streak ?? 0,
          })))
        }
      } catch (e) {
        console.error('Failed to load user data:', e)
      }
    }
    loadData()
  }, [clerkLoaded, _user, supabase])

  useEffect(() => {
    if (!file) { setPreview(null); setFileCoords(null); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function handleFileChange(f: File | null) {
    setFile(f)
    setFileCoords(null)
    if (!f) return
    try {
      const coords = await parseExifGps(f)
      if (coords?.latitude && coords?.longitude) { setFileCoords(coords); return }
    } catch (e) { console.warn('EXIF parse failed', e) }
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setFileCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {}
      )
    }
  }

  async function handleSubmit() {
    if (!selectedMission || !file) return
    setVerifyStatus('uploading')

    let dataUrl: string
    try {
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    } catch {
      setVerifyStatus('failure')
      return
    }

    setVerifyStatus('verifying')

    let isSuccess = false
    let imgDesc = ''
    try {
      const aiResponse = await openRouterService.analyzeImage(
        dataUrl,
        `You are verifying a BrailleQuest mission submission. The mission is: "${selectedMission.title}" — ${selectedMission.description}.

Analyze this photo and determine:
1. Does this image contain braille text or braille-related signage/features?
2. Is it relevant to the mission described above?

Respond with a JSON object ONLY: {"verified": true/false, "reason": "brief explanation"}
If you can clearly see braille patterns or braille-related accessibility features relevant to this mission, set verified to true. Be reasonably generous — if the photo shows any genuine braille or accessibility signage in context, verify it.`
      )
      try {
        const cleaned = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const result = JSON.parse(cleaned)
        isSuccess = result.verified === true
        imgDesc = result.reason || ''
        setVerifyReason(imgDesc)
      } catch {
        const lower = aiResponse.toLowerCase()
        isSuccess = (lower.includes('verified') && lower.includes('true')) ||
                    (lower.includes('braille') && !lower.includes('no braille') && !lower.includes('not') && !lower.includes('cannot'))
        imgDesc = aiResponse || ''
        setVerifyReason(imgDesc)
      }
    } catch (err) {
      console.error('AI verification failed, using fallback:', err)
      isSuccess = Math.random() > 0.4
    }

    setVerifyStatus(isSuccess ? 'success' : 'failure')
    if (isSuccess) {
      setImageDescription(imgDesc)
      fetchBrailleLesson(selectedMission, imgDesc)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 4000)
      const newXP = userStats.xp + (selectedMission.xpReward ?? 50)
      const newFinds = userStats.totalFinds + 1
      setUserStats(prev => ({
        ...prev,
        xp: newXP,
        missions: prev.missions + 1,
        totalFinds: newFinds
      }))
      setCompletedMissions(prev => {
        const next = [...prev, selectedMission.id]
        try { localStorage.setItem('bq_completed', JSON.stringify(next)) } catch {}
        if (prev.length === 0) {
          setTimeout(() => setShowFirstMissionCelebration(true), 1500)
        }
        return next
      })

      const userId = (_user as any)?.id
      if (userId) {
        try {
          await dbCompleteMission(
            supabase, userId, selectedMission.id, selectedMission.xpReward,
            undefined,
            fileCoords?.latitude && fileCoords?.longitude
              ? { latitude: fileCoords.latitude, longitude: fileCoords.longitude }
              : undefined
          )
          await updateProfile(supabase, userId, { xp: newXP, total_finds: newFinds })

          const allCompleted = [...completedMissions, selectedMission.id]
          const newBadges: string[] = []

          if (allCompleted.length >= 1) newBadges.push('first-find')
          if (newFinds >= 5) newBadges.push('shutterbug')
          if (newXP >= 500) newBadges.push('star-hunter')
          const level1Ids = missions.filter(m => m.level === 1).map(m => m.id)
          if (level1Ids.every(id => allCompleted.includes(id))) newBadges.push('explorer')
          if (newXP >= 600) newBadges.push('champion')
          if (missions.some(m => m.difficulty === 'legendary' && allCompleted.includes(m.id))) newBadges.push('rare-find')
          if (missions.every(m => allCompleted.includes(m.id))) newBadges.push('legend')
          const completedCategories = new Set(missions.filter(m => allCompleted.includes(m.id)).map(m => m.category))
          if (completedCategories.size >= 5) newBadges.push('category-explorer')
          if (newFinds >= 3) newBadges.push('on-fire')
          if (allCompleted.includes('m30')) newBadges.push('advocate')
          if (userStats.citiesMapped >= 3) newBadges.push('world-traveler')

          for (const badgeId of newBadges) {
            if (!earnedBadgeIds.includes(badgeId)) {
              await awardBadge(supabase, userId, badgeId)
            }
          }
          if (newBadges.length > 0) {
            setEarnedBadgeIds(prev => [...new Set([...prev, ...newBadges])])
          }

          await updateAchievementProgress(supabase, userId, 'first-lesson', Math.min(allCompleted.length, 1), 1)
          const streakVal = userStats.streak
          if (streakVal > 0) {
            await updateAchievementProgress(supabase, userId, 'week-warrior', Math.min(streakVal, 7), 7)
            await updateAchievementProgress(supabase, userId, 'month-master', Math.min(streakVal, 30), 30)
            await updateAchievementProgress(supabase, userId, 'century-champion', Math.min(streakVal, 100), 100)
          }
        } catch (e) {
          console.error('Failed to persist mission completion:', e)
        }
      }
    }
  }

  function resetSubmission() {
    setFile(null)
    setPreview(null)
    setVerifyStatus('idle')
    setVerifyReason('')
    setImageDescription('')
    setLessonContent(null)
    setLessonLoading(false)
    setActiveDotCell(null)
    setShowMissionModal(false)
    setSelectedMission(null)
    setShowFullLesson(false)
    setTimelineIndex(0)
    setShowConfetti(false)
  }

  function handleShare(text: string) {
    setShareAchievement(text)
    setShowShareModal(true)
  }

  function shareToClipboard() {
    navigator.clipboard.writeText(`🎯 BrailleQuest Achievement: ${shareAchievement}\n\nJoin me in discovering braille accessibility in our community! #BrailleQuest #Accessibility`)
    setShowShareModal(false)
  }

  const brailleDotMap: Record<string, number[]> = {
    a: [1], b: [1,2], c: [1,4], d: [1,4,5], e: [1,5], f: [1,2,4], g: [1,2,4,5],
    h: [1,2,5], i: [2,4], j: [2,4,5], k: [1,3], l: [1,2,3], m: [1,3,4],
    n: [1,3,4,5], o: [1,3,5], p: [1,2,3,4], q: [1,2,3,4,5], r: [1,2,3,5],
    s: [2,3,4], t: [2,3,4,5], u: [1,3,6], v: [1,2,3,6], w: [2,4,5,6],
    x: [1,3,4,6], y: [1,3,4,5,6], z: [1,3,5,6],
  }

  function BrailleCell({ dots, size = 40, active = false, onTap }: { dots: number[]; size?: number; active?: boolean; onTap?: () => void }) {
    const dotSize = size * 0.22
    const positions = [
      { cx: size * 0.33, cy: size * 0.2 },
      { cx: size * 0.33, cy: size * 0.5 },
      { cx: size * 0.33, cy: size * 0.8 },
      { cx: size * 0.67, cy: size * 0.2 },
      { cx: size * 0.67, cy: size * 0.5 },
      { cx: size * 0.67, cy: size * 0.8 },
    ]
    return (
      <motion.svg width={size} height={size * 1.2} viewBox={`0 0 ${size} ${size * 1.2}`}
        className={`cursor-pointer transition-transform ${active ? 'scale-110' : ''}`}
        whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} onClick={onTap}
      >
        <rect x={1} y={1} width={size - 2} height={size * 1.2 - 2} rx={size * 0.15}
          fill={active ? '#eef2ff' : '#f8fafc'} stroke={active ? '#6366f1' : '#e2e8f0'} strokeWidth={1.5} />
        {positions.map((pos, i) => (
          <circle key={i} cx={pos.cx} cy={pos.cy + size * 0.1} r={dotSize}
            fill={dots.includes(i + 1) ? (active ? '#4f46e5' : '#1e293b') : '#e2e8f0'}
            stroke={dots.includes(i + 1) ? (active ? '#4338ca' : '#334155') : 'transparent'}
            strokeWidth={0.5}
          />
        ))}
      </motion.svg>
    )
  }

  async function fetchBrailleLesson(mission: Mission, imgDesc: string = '') {
    setLessonLoading(true)
    try {
      const imgContext = imgDesc ? `\n\nThe AI detected in the uploaded photo: "${imgDesc}". Use this description to tailor the lesson specifically to what was found in the image.` : ''
      const response = await geminiService.askInstructor(
        `The user found braille related to: "${mission.title}" — ${mission.description}.${imgContext}

Teach them a UNIQUE, detailed lesson about this specific braille sign based on what they found. Return a JSON object with:
{
  "title": "creative educational title about this specific braille discovery",
  "explanation": "A 2-3 sentence paragraph explaining what the user found and why it matters for accessibility. Reference the specific image/sign they discovered.",
  "facts": ["8-10 interesting, unique facts about this specific braille signage — how it's made, who uses it, why it matters, ADA/accessibility standards, history, manufacturing process, materials used, and cultural significance"],
  "brailleTypes": [{"name": "Grade 1 Braille", "desc": "letter-by-letter transcription of text", "dots": [1,2,4,5]}, {"name": "Grade 2 Braille", "desc": "uses contractions for common words", "dots": [1,2,3,4,5,6]}],
  "commonPatterns": [{"symbol": "the", "meaning": "Common contraction for 'the'", "dots": [2,3,4,6]}, {"symbol": "and", "meaning": "Contraction for 'and'", "dots": [1,2,3,4,6]}, {"symbol": "for", "meaning": "Contraction for 'for'", "dots": [1,2,3,4,5,6]}, {"symbol": "#", "meaning": "Number indicator", "dots": [3,4,5,6]}, {"symbol": "CAP", "meaning": "Capital letter indicator", "dots": [6]}],
  "funFact": "one surprising fun fact specifically related to what was found in the image",
  "practiceTips": ["3-4 actionable tips for the user to practice reading/identifying this type of braille in real life"],
  "realWorldExamples": ["3-4 specific real-world places or contexts where you'd find this exact type of braille signage"],
  "braillePreview": [{"letter": "b", "dots": [1,2]}, {"letter": "r", "dots": [1,2,3,5]}, {"letter": "l", "dots": [1,2,3]}]
}
For braillePreview, spell out a 4-6 letter word related to the specific discovery using actual braille dot positions (dots 1-6 per cell).
For brailleTypes, include 2-3 types with example dot patterns.
For commonPatterns, include 5-8 common braille patterns/contractions/indicators relevant to this type of signage. Use REAL braille dot positions.
Make every lesson UNIQUE — do not repeat generic facts. Tailor everything to the specific mission and image.
Return ONLY the JSON object.`,
        `Category: ${mission.category}, Difficulty: ${mission.difficulty}, Image context: ${imgDesc || 'none'}`
      )
      const cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      const firstBrace = cleaned.indexOf('{')
      const lastBrace = cleaned.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1) {
        const parsed = JSON.parse(cleaned.substring(firstBrace, lastBrace + 1))
        if (!parsed.braillePreview || !Array.isArray(parsed.braillePreview)) {
          parsed.braillePreview = 'braille'.split('').map(ch => ({ letter: ch, dots: brailleDotMap[ch] || [1] }))
        }
        if (!parsed.brailleTypes || !Array.isArray(parsed.brailleTypes) || typeof parsed.brailleTypes[0] === 'string') {
          parsed.brailleTypes = [
            { name: 'Grade 1 Braille', desc: 'Letter-by-letter transcription', dots: [1,2,4,5] },
            { name: 'Grade 2 Braille', desc: 'Uses contractions for common words', dots: [1,2,3,4,5,6] },
            { name: 'Unified English Braille', desc: 'Modern international standard', dots: [1,3,4,5] },
          ]
        }
        setLessonContent(parsed)
      } else {
        throw new Error('Could not parse response')
      }
    } catch (e) {
      console.error('Lesson fetch failed:', e)
      const word = mission.title.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5) || 'sign'
      setLessonContent({
        title: `Understanding: ${mission.title}`,
        explanation: `You discovered braille signage related to "${mission.title}". This type of braille is commonly found in public spaces and plays a crucial role in making our world more accessible for people with visual impairments.`,
        facts: [
          'Braille cells consist of 6 raised dots arranged in a 3×2 grid, allowing 64 possible combinations.',
          'The ADA (Americans with Disabilities Act) requires braille on all permanent room signs in public buildings.',
          'Braille signs must be placed between 48-60 inches from the floor for easy tactile reading.',
          'Signs use Grade 2 Braille (contracted) which shortens common words — "the" becomes a single cell.',
          'Braille signage includes both the raised dots and accompanying raised print letters.',
          'Over 133 million people worldwide have significant vision impairment and benefit from braille accessibility.',
          'Modern braille signs are typically made from photopolymer or cast metals for durability.',
          'The average braille reader can read 100-200 words per minute by touch.'
        ],
        brailleTypes: [
          { name: 'Grade 1 Braille', desc: 'Each letter is individually transcribed dot-by-dot', dots: [1,2,4,5] },
          { name: 'Grade 2 Braille', desc: 'Uses 189 contractions to shorten common words and letter combos', dots: [1,2,3,4,5,6] },
          { name: 'Unified English Braille', desc: 'The modern international standard adopted in 2004', dots: [1,3,4,5] },
        ],
        commonPatterns: [
          { symbol: 'the', meaning: 'Common contraction for "the"', dots: [2,3,4,6] },
          { symbol: 'and', meaning: 'Contraction for "and"', dots: [1,2,3,4,6] },
          { symbol: 'for', meaning: 'Contraction for "for"', dots: [1,2,3,4,5,6] },
          { symbol: '#', meaning: 'Number indicator — placed before digits', dots: [3,4,5,6] },
          { symbol: 'CAP', meaning: 'Capital letter indicator', dots: [6] },
          { symbol: 'ing', meaning: 'Common ending contraction', dots: [3,4,6] },
        ],
        practiceTips: [
          'Run your fingertips gently over braille signs you encounter — feel the dot patterns.',
          'Try to identify the number indicator (#) on elevator buttons and room numbers.',
          'Look for braille on everyday items like medicine packaging and ATM keypads.',
          'Practice spelling your name in braille using the Grade 1 dot positions.'
        ],
        realWorldExamples: [
          'Elevator buttons and floor indicators in buildings',
          'Room signs and door plaques in offices and hotels',
          'ATM machines and bank terminals',
          'Public restroom signs and wayfinding markers'
        ],
        funFact: 'Louis Braille invented his system at just 15 years old in 1824, based on a military night-writing code!',
        braillePreview: word.split('').map(ch => ({ letter: ch, dots: brailleDotMap[ch] || [1] }))
      })
    } finally {
      setLessonLoading(false)
    }
  }

  function purchaseReward(rewardId: string, cost: number) {
    if (userStats.xp < cost || ownedRewards.includes(rewardId)) return
    const newXP = userStats.xp - cost
    setOwnedRewards(prev => [...prev, rewardId])
    setUserStats(prev => ({ ...prev, xp: newXP }))
    const userId = (_user as any)?.id
    if (userId) {
      updateProfile(supabase, userId, { xp: newXP }).catch(console.error)
    }
  }

  function saveDailyGoal(goal: number) {
    setDailyGoal(goal)
    setShowGoalEditor(false)
    const userId = (_user as any)?.id
    if (userId) {
      updateProfile(supabase, userId, { preferences: { dailyGoal: goal } }).catch(console.error)
    }
  }

  const isLevelUnlocked = (level: number) => userStats.xp >= (levels.find(l => l.level === level)?.requiredXP || 0)

  const filteredMissions = missions.filter(m => {
    if (m.level !== selectedLevel) return false
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false
    return true
  })

  const clampPan = useCallback((x: number, y: number) => {
    if (!pathRef.current) return { x, y }
    const container = pathRef.current
    const contentW = 900
    const contentH = filteredMissions.length * 250 + 350
    const maxX = Math.max(200, (contentW - container.clientWidth) / 2 + 300)
    const maxYDown = 300
    const maxYUp = Math.max(0, contentH - container.clientHeight + 200)
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxYUp, Math.min(maxYDown, y)),
    }
  }, [filteredMissions.length])

  const startMomentum = useCallback(() => {
    cancelAnimationFrame(momentumRaf.current)
    const decay = () => {
      velocity.current.x *= 0.92
      velocity.current.y *= 0.92
      if (Math.abs(velocity.current.x) < 0.5 && Math.abs(velocity.current.y) < 0.5) return
      setPanOffset(prev => clampPan(prev.x + velocity.current.x, prev.y + velocity.current.y))
      momentumRaf.current = requestAnimationFrame(decay)
    }
    momentumRaf.current = requestAnimationFrame(decay)
  }, [clampPan])

  const handlePathMouseDown = useCallback((e: React.MouseEvent) => {
    cancelAnimationFrame(momentumRaf.current)
    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y }
    lastMouse.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    e.preventDefault()
  }, [panOffset])

  const handlePathMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const now = Date.now()
    const dt = Math.max(1, now - lastMouse.current.t)
    velocity.current = { x: (e.clientX - lastMouse.current.x) / dt * 16, y: (e.clientY - lastMouse.current.y) / dt * 16 }
    lastMouse.current = { x: e.clientX, y: e.clientY, t: now }
    setPanOffset(clampPan(dragStart.current.panX + dx, dragStart.current.panY + dy))
  }, [clampPan])

  const handlePathMouseUp = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false
    startMomentum()
  }, [startMomentum])

  useEffect(() => { setPanOffset({ x: 0, y: 0 }) }, [selectedLevel, categoryFilter])

  const categories: { id: CategoryFilter; label: string; emoji: string }[] = [
    { id: 'all', label: 'All', emoji: '🌐' },
    { id: 'signage', label: 'Signage', emoji: '🪧' },
    { id: 'transport', label: 'Transport', emoji: '🚌' },
    { id: 'food', label: 'Food', emoji: '🍽️' },
    { id: 'education', label: 'Education', emoji: '📚' },
    { id: 'public', label: 'Public', emoji: '🏛️' },
    { id: 'medical', label: 'Medical', emoji: '🏥' },
    { id: 'recreation', label: 'Recreation', emoji: '🎡' },
    { id: 'government', label: 'Government', emoji: '🏛️' },
  ]

  const currentLevelBg = levels.find(l => l.level === selectedLevel) || levels[0]

  function renderSideTabContent() {
    const tab = sideTabs[sideTabIndex]
    switch (tab.key) {
      case 'xp':
        return (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-gray-900">Daily Goal</h3>
              <button onClick={() => setShowGoalEditor(!showGoalEditor)} className="text-blue-600 text-sm font-bold hover:underline">
                {showGoalEditor ? 'CANCEL' : 'EDIT GOAL'}
              </button>
            </div>
            {showGoalEditor ? (
              <div className="space-y-3 mb-5">
                <p className="text-sm text-gray-600 font-medium">Choose your daily XP goal:</p>
                {[50, 100, 150, 200].map(g => (
                  <button key={g} onClick={() => saveDailyGoal(g)}
                    className={`w-full py-3 px-4 rounded-xl text-left font-bold transition-all border-2 flex items-center justify-between ${
                      dailyGoal === g ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}>
                    <span className="text-base">{g === 50 ? '🌿 Casual' : g === 100 ? '📚 Regular' : g === 150 ? '🔥 Serious' : '⚡ Intense'} — {g} XP/day</span>
                    {dailyGoal === g && <CheckCircle className="w-5 h-5 text-blue-500" />}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-gray-700">Today&apos;s Progress</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <motion.div className="h-full bg-yellow-400 rounded-full" initial={{ width: '0%' }} animate={{ width: `${Math.min(100, ((userStats.xp % dailyGoal) / dailyGoal) * 100)}%` }} transition={{ duration: 1 }} />
                      </div>
                      <span className="text-sm font-bold text-gray-600">{userStats.xp % dailyGoal}/{dailyGoal}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-sm font-bold text-gray-700 mb-3">This Week</p>
                  <div className="flex items-end gap-2 h-28">
                    {['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'].map((day, i) => {
                      const heights = [20, 80, 45, 30, 65, 50, 10]
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                            <motion.div className="w-full bg-blue-400 rounded-t-md" initial={{ height: 0 }} animate={{ height: `${heights[i]}%` }} transition={{ delay: i * 0.08, duration: 0.5 }} />
                          </div>
                          <span className="text-xs font-bold text-gray-500">{day}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      case 'leaderboard':
        return (
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" /> Weekly Rankings
            </h3>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {leaderboard.map((entry) => {
                const isYou = (_user && entry.name === ((_user as any)?.firstName || 'You')) || entry.name === 'You'
                return (
                  <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isYou ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' : entry.rank === 2 ? 'bg-gray-300 text-gray-700' : entry.rank === 3 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-500'}`}>{entry.rank}</div>
                    <span className="text-xl">{entry.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-800 truncate">{entry.name}{isYou && ' (You)'}</div>
                      <div className="text-xs text-gray-400">{entry.missionsCompleted} missions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-yellow-600">{entry.xp} XP</div>
                      <div className="flex items-center gap-0.5 text-xs text-orange-500"><Flame className="w-3 h-3" />{entry.streak}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'rewards':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" /> Rewards Shop
              </h3>
              <div className="flex items-center gap-1.5">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-base text-yellow-600">{userStats.xp} XP</span>
              </div>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {rewardItems.map((item) => {
                const isOwned = ownedRewards.includes(item.id)
                const canAfford = userStats.xp >= item.cost
                return (
                  <div key={item.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${isOwned ? 'border-green-200 bg-green-50' : canAfford ? 'border-gray-200 hover:border-blue-300' : 'border-gray-100 opacity-60'}`}>
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                    </div>
                    {isOwned ? (
                      <span className="flex items-center gap-1 text-sm font-bold text-green-600"><CheckCircle className="w-4 h-4" /> Owned</span>
                    ) : (
                      <button
                        onClick={() => purchaseReward(item.id, item.cost)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${canAfford ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                      >{item.cost} XP</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'badges':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" /> Badges
              </h3>
              <span className="text-sm text-gray-500 font-bold">{badges.filter(b => b.earned).length}/{badges.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge, i) => (
                <div key={i} className={`flex flex-col items-center p-4 rounded-xl transition-all ${badge.earned ? 'bg-yellow-50 border-2 border-yellow-200' : 'opacity-40 grayscale bg-gray-50 border-2 border-gray-100'}`} title={badge.desc}>
                  <span className="text-3xl mb-2">{badge.icon}</span>
                  <span className="text-xs font-bold text-gray-700 text-center leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      case 'activity':
        return (
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-500" /> Activity Insights
            </h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {aiInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{insight.title}</div>
                    <div className="text-sm text-gray-600 mt-1 leading-relaxed">{insight.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'achievements':
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Medal className="w-5 h-5 text-yellow-500" /> Achievements
              </h3>
              <span className="text-sm text-gray-500 font-bold">{unlockedAchievements}/{achievementsList.length}</span>
            </div>
            <div className="flex gap-1.5 flex-wrap mb-4">
              <button onClick={() => setAchievementCategoryFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${!achievementCategoryFilter ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>All</button>
              {achievementCategories.map(cat => (
                <button key={cat.id} onClick={() => setAchievementCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${achievementCategoryFilter === cat.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {cat.emoji} {cat.name}
                </button>
              ))}
            </div>
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredAchievements.map((a) => {
                const pct = (a.progress / a.maxProgress) * 100
                const colors = rarityColors[a.rarity]
                return (
                  <div key={a.id} className={`p-3 rounded-xl border-2 transition-all ${a.unlocked ? colors.border + ' bg-white' : 'border-gray-200 opacity-70'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${a.unlocked ? colors.bg : 'bg-gray-100'}`}>
                        {a.unlocked ? <a.icon className={`w-5 h-5 ${colors.text}`} /> : <Lock className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900 truncate">{a.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${colors.bg} ${colors.text}`}>{a.rarity}</span>
                        </div>
                        <div className="text-xs text-gray-500">{a.description}</div>
                      </div>
                      <span className="text-xs font-bold text-yellow-600 whitespace-nowrap">+{a.xpReward}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className={`h-full rounded-full ${a.unlocked ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{a.requirement}</span>
                      <span className="text-xs font-bold text-gray-600">{a.progress}/{a.maxProgress}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      case 'share':
        return (
          <div>
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-blue-500" /> Share Progress
            </h3>
            <div className="bg-blue-600 rounded-2xl p-6 text-white text-center mb-4">
              <div className="text-4xl mb-3">🗺️</div>
              <div className="text-xl font-extrabold mb-2">My BrailleQuest Stats</div>
              <div className="flex justify-center gap-8 mt-4">
                <div><div className="text-2xl font-extrabold">{userStats.xp}</div><div className="text-sm text-blue-200">XP</div></div>
                <div><div className="text-2xl font-extrabold">{completedMissions.length}</div><div className="text-sm text-blue-200">Missions</div></div>
                <div><div className="text-2xl font-extrabold">{userStats.streak}</div><div className="text-sm text-blue-200">Streak</div></div>
              </div>
            </div>
            <button onClick={() => handleShare("I've completed " + completedMissions.length + " missions and earned " + userStats.xp + " XP on BrailleQuest!")}
              className="w-full py-3.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-base">
              <Share2 className="w-5 h-5" /> Share My Progress
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.04) 42%, transparent 42%)' }} />
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%"><defs><pattern id="bqhex" width="48" height="84" patternUnits="userSpaceOnUse"><path d="M24 0L48 14V42L24 56L0 42V14Z" fill="none" stroke="white" strokeWidth="0.5"/><path d="M24 28L48 42V70L24 84L0 70V42Z" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#bqhex)"/></svg>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-8 left-[15%] w-20 h-20 border border-white/10 rounded-2xl rotate-12 animate-pulse" />

          <div className="absolute top-1/2 left-[8%] w-3 h-3 bg-blue-300/20 rounded-full" />
          <div className="absolute top-[20%] right-[12%] w-2 h-2 bg-white/15 rounded-full" />
          <div className="absolute bottom-[30%] left-[25%] w-1.5 h-1.5 bg-indigo-300/25 rounded-full" />
          <svg className="absolute top-6 right-[30%] opacity-[0.06]" width="60" height="60" viewBox="0 0 60 60">
            <polygon points="30,5 55,50 5,50" fill="none" stroke="white" strokeWidth="1" />
          </svg>
          <svg className="absolute bottom-8 left-[40%] opacity-[0.06]" width="50" height="50" viewBox="0 0 50 50">
            <rect x="5" y="5" width="40" height="40" rx="4" fill="none" stroke="white" strokeWidth="1" transform="rotate(20 25 25)" />
          </svg>
          <svg className="absolute top-[40%] right-[6%] opacity-[0.08]" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="15" fill="none" stroke="white" strokeWidth="0.8" strokeDasharray="4 3" />
          </svg>
        </div>
        <div className="absolute -top-20 right-16 w-80 h-80 bg-blue-400/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/20 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/8 rounded-full blur-[120px]" />
        <div className="absolute top-4 right-8 opacity-[0.08] pointer-events-none hidden lg:block">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="35" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="40" y1="8" x2="40" y2="20" stroke="white" strokeWidth="2" />
            <line x1="40" y1="60" x2="40" y2="72" stroke="white" strokeWidth="1" />
            <line x1="8" y1="40" x2="20" y2="40" stroke="white" strokeWidth="1" />
            <line x1="60" y1="40" x2="72" y2="40" stroke="white" strokeWidth="1" />
            <polygon points="40,12 37,22 43,22" fill="white" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <motion.div className="flex items-center gap-3 mb-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                  <MapPin className="w-4 h-4 text-blue-300" />
                  <span className="text-sm font-bold tracking-wide">BrailleQuest</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-400/30 text-yellow-300 text-xs font-bold">
                  <Globe className="w-3.5 h-3.5" /> Explorer Mode
                </span>
              </motion.div>
              <motion.h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                🗺️ BrailleQuest
              </motion.h1>
              <motion.p className="text-base text-blue-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                Level {selectedLevel} · {completedMissions.filter(id => missions.find(m => m.id === id)?.level === selectedLevel).length}/{missions.filter(m => m.level === selectedLevel).length} complete
                {_user && <span> · Welcome back, <span className="font-bold text-white">{(_user as any).firstName || 'Explorer'}</span></span>}
              </motion.p>
            </div>
            <motion.div className="flex items-center gap-3 flex-wrap" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {[
                { value: userStats.streak, label: 'Streak', icon: Flame, color: 'text-orange-300' },
                { value: userStats.xp, label: 'XP', icon: Star, color: 'text-yellow-300' },
                { value: completedMissions.length, label: 'Done', icon: Target, color: 'text-blue-300' },
              ].map((stat, i) => (
                <motion.div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2 border border-white/10"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-lg font-extrabold">{stat.value}</span>
                  <span className="text-xs text-blue-200">{stat.label}</span>
                </motion.div>
              ))}
              <button onClick={() => navigate('/learn')}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center gap-2 border border-white/10 hover:bg-white/20 transition-all text-sm font-bold">
                <BookOpen className="w-4 h-4" /> Guidebook
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="mb-6 bg-blue-50 rounded-2xl px-5 py-3 border border-blue-100 flex items-center gap-3">
          <span className="text-2xl">♿</span>
          <p className="text-sm text-blue-700"><span className="font-bold">Accessible to all</span> — Designed for partially sighted learners. Blind users can navigate and complete missions entirely by voice.</p>
        </div>

        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {levels.map((level) => {
            const unlocked = isLevelUnlocked(level.level)
            const isSelected = selectedLevel === level.level
            const doneInLvl = missions.filter(m => m.level === level.level && completedMissions.includes(m.id)).length
            const totalInLvl = missions.filter(m => m.level === level.level).length
            const allDone = doneInLvl === totalInLvl && totalInLvl > 0
            return (
              <button
                key={level.level}
                onClick={() => unlocked && setSelectedLevel(level.level)}
                disabled={!unlocked}
                className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl text-base font-bold transition-all border-2 ${
                  isSelected
                    ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200'
                    : allDone
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : unlocked
                        ? 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                {!unlocked ? <Lock className="w-5 h-5" /> : allDone ? <CheckCircle className="w-5 h-5" /> : <span className="text-lg">{level.icon}</span>}
                <span>{level.title}</span>
                <span className="text-sm opacity-60">{doneInLvl}/{totalInLvl}</span>
              </button>
            )
          })}
        </div>

        <div className="flex gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.filter(c => c.id === 'all' || missions.some(m => m.level === selectedLevel && m.category === c.id)).map(cat => (
            <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border-2 ${
                categoryFilter === cat.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}>
              <span>{cat.emoji}</span> {cat.label}
            </button>
          ))}
        </div>

        <div className="flex gap-8 items-start">

          <div className="flex-1 min-w-0">
            {filteredMissions.length > 0 ? (
              <div
                ref={pathRef}
                className="relative rounded-3xl overflow-hidden shadow-xl cursor-grab select-none"
                style={{ ...currentLevelBg.bgStyle, height: 'calc(100vh - 220px)' }}
                onMouseDown={handlePathMouseDown}
                onMouseMove={handlePathMouseMove}
                onMouseUp={handlePathMouseUp}
                onMouseLeave={handlePathMouseUp}
              >
                <div style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                  transition: isDragging.current ? 'none' : 'transform 0.05s ease-out',
                  minHeight: `${filteredMissions.length * 200 + 380}px`,
                  width: '100%',
                  position: 'relative',
                }}>

<div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-5xl"
                      style={{ left: `${10 + (i * 12) % 80}%`, top: `${5 + (i * 17) % 75}%`, opacity: 0.12 }}
                      animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {currentLevelBg.icon}
                    </motion.div>
                  ))}
                </div>

                <div className="absolute top-5 left-5 z-10 flex items-center gap-3 bg-black/30 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20">
                  <svg width="28" height="28" viewBox="0 0 40 40" className="flex-shrink-0">
                    <circle cx="20" cy="10" r="7" fill="white" />
                    <circle cx="17" cy="9" r="1.2" fill="#3b82f6" />
                    <circle cx="23" cy="9" r="1.2" fill="#3b82f6" />
                    <circle cx="17" cy="12" r="1" fill="#3b82f6" opacity="0.6" />
                    <circle cx="23" cy="12" r="1" fill="#3b82f6" opacity="0.6" />
                    <rect x="15" y="17" width="10" height="12" rx="3" fill="white" />
                    <circle cx="17.5" cy="20" r="1" fill="#3b82f6" /><circle cx="22.5" cy="20" r="1" fill="#3b82f6" />
                    <circle cx="17.5" cy="24" r="1" fill="#3b82f6" /><circle cx="22.5" cy="24" r="1" fill="#3b82f6" />
                    <line x1="15" y1="21" x2="10" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="25" y1="21" x2="30" y2="16" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="17" y1="29" x2="15" y2="37" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    <line x1="23" y1="29" x2="25" y2="37" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div>
                    <div className="text-sm font-bold text-white">{currentLevelBg.title}</div>
                    <div className="text-xs text-white/70">Level {selectedLevel}</div>
                  </div>
                </div>

                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}
                  viewBox={`0 0 400 ${filteredMissions.length * 200 + 380}`} preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="softGlow">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  {filteredMissions.map((_, index) => {
                    if (index === 0) return null
                    const ROW = 200
                    const TOP = 180
                    const getNodeX = (i: number) => {
                      const side = i % 2 === 0 ? -1 : 1
                      return 200 + side * 80
                    }
                    const p1 = { x: getNodeX(index - 1), y: TOP + (index - 1) * ROW }
                    const p2 = { x: getNodeX(index), y: TOP + index * ROW }
                    const cp1 = { x: p1.x, y: p1.y + ROW * 0.45 }
                    const cp2 = { x: p2.x, y: p2.y - ROW * 0.45 }
                    const prevDone = completedMissions.includes(filteredMissions[index - 1].id)
                    const curDone = completedMissions.includes(filteredMissions[index].id)
                    const pathDone = prevDone && curDone
                    const pathActive = prevDone && !curDone
                    const d = `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p2.x} ${p2.y}`

                    return (
                      <g key={`path-${index}`}>
                        <path d={d} fill="none"
                          stroke={pathDone ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}
                          strokeWidth={pathDone ? 12 : 8} strokeLinecap="round"
                          filter={pathDone ? 'url(#softGlow)' : undefined} />
                        <path d={d} fill="none"
                          stroke={pathDone ? 'url(#pathGradient)' : pathActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'}
                          strokeWidth={pathDone ? 3 : 2} strokeLinecap="round"
                          strokeDasharray={pathDone ? 'none' : pathActive ? '8 12' : '4 16'}
                          filter={pathDone ? 'url(#glow)' : undefined} />
                        {pathDone && [0.2, 0.5, 0.8].map(t => {
                          const u = 1 - t
                          const bx = u*u*u*p1.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p2.x
                          const by = u*u*u*p1.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p2.y
                          return (
                            <g key={t}>
                              <circle cx={bx} cy={by} r={4} fill="rgba(255,255,255,0.12)" />
                              <circle cx={bx} cy={by} r={2.5} fill="#ffffff" opacity={0.7} />
                            </g>
                          )
                        })}
                        {pathActive && (() => {
                          const t = 0.5, u = 0.5
                          const bx = u*u*u*p1.x + 3*u*u*t*cp1.x + 3*u*t*t*cp2.x + t*t*t*p2.x
                          const by = u*u*u*p1.y + 3*u*u*t*cp1.y + 3*u*t*t*cp2.y + t*t*t*p2.y
                          return (
                            <circle cx={bx} cy={by} r={3} fill="rgba(255,255,255,0.5)">
                              <animate attributeName="r" values="2;5;2" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )
                        })()}
                      </g>
                    )
                  })}
                </svg>

                <div className="relative" style={{ minHeight: `${filteredMissions.length * 200 + 380}px`, zIndex: 2 }}>
                  {filteredMissions.map((mission, index) => {
                    const isCompleted = completedMissions.includes(mission.id)
                    const prevCompleted = index === 0 || completedMissions.includes(filteredMissions[index - 1].id)
                    const isAvailable = !isCompleted && prevCompleted
                    const isLocked = !isCompleted && !prevCompleted
                    const side = index % 2 === 0 ? -1 : 1
                    const offsetX = side * 80
                    const showMascot = isAvailable

                    return (
                      <div
                        key={mission.id}
                        className="absolute flex items-center"
                        style={{
                          left: `calc(50% + ${offsetX}px - 48px)`,
                          top: `${180 + index * 200}px`,
                          transform: 'translateY(-50%)',
                        }}
                      >
                        <div className="flex flex-col items-center relative">
                          <motion.button
                            onClick={() => !isLocked && (setSelectedMission(mission), setShowMissionModal(true))}
                            disabled={isLocked}
                            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-b-[6px] transition-all shadow-xl ${
                              isCompleted
                                ? 'bg-yellow-400 border-yellow-500 text-yellow-900'
                                : isAvailable
                                  ? 'bg-blue-500 border-blue-600 text-white cursor-pointer ring-4 ring-blue-300/40'
                                  : 'bg-white/20 border-white/30 text-white/50 cursor-not-allowed backdrop-blur-sm'
                            }`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 20 }}
                            whileHover={!isLocked ? { scale: 1.1, y: -6 } : {}}
                            whileTap={!isLocked ? { scale: 0.95 } : {}}
                          >
                            {isLocked ? (
                              <Lock className="w-7 h-7 opacity-50" />
                            ) : isCompleted ? (
                              <CheckCircle className="w-10 h-10" />
                            ) : (
                              <span className="text-4xl">{mission.icon}</span>
                            )}
                          </motion.button>
                          {isCompleted && (
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3].map(s => (
                                <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-md" />
                              ))}
                            </div>
                          )}
                          {!isLocked && (
                            <div className="mt-3 text-center max-w-[200px]">
                              <p className="text-base font-bold leading-snug text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                                {mission.title}
                              </p>
                              <p className="text-xs text-white/70 mt-1 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                                {mission.description.slice(0, 50)}...
                              </p>
                              <span className="inline-block mt-1.5 text-sm font-bold text-yellow-300 bg-black/20 px-3 py-0.5 rounded-full" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                                +{mission.xpReward} XP
                              </span>
                            </div>
                          )}
                        </div>
                        {showMascot && (
                          <motion.div
                            className="ml-4 flex-shrink-0"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                          >
                            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-white/50 px-4 py-3 max-w-[180px]">
                              <div className="flex items-center gap-2 mb-1.5">
                                <svg width="28" height="28" viewBox="0 0 40 40" className="flex-shrink-0">
                                  <circle cx="20" cy="10" r="7" fill="#3b82f6" />
                                  <circle cx="17" cy="9" r="1.2" fill="white" />
                                  <circle cx="23" cy="9" r="1.2" fill="white" />
                                  <circle cx="17" cy="12" r="1" fill="white" opacity="0.6" />
                                  <circle cx="23" cy="12" r="1" fill="white" opacity="0.6" />
                                  <rect x="15" y="17" width="10" height="12" rx="3" fill="#3b82f6" />
                                  <circle cx="17.5" cy="20" r="1" fill="white" />
                                  <circle cx="22.5" cy="20" r="1" fill="white" />
                                  <circle cx="17.5" cy="24" r="1" fill="white" />
                                  <circle cx="22.5" cy="24" r="1" fill="white" />
                                  <line x1="15" y1="21" x2="10" y2="26" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                  <line x1="25" y1="21" x2="30" y2="16" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                  <line x1="17" y1="29" x2="15" y2="37" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                  <line x1="23" y1="29" x2="25" y2="37" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <span className="text-xs font-bold text-blue-600">Let's go!</span>
                              </div>
                              <p className="text-xs text-gray-700 font-medium leading-snug">{mission.title}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}

                  <div
                    className="absolute flex flex-col items-center"
                    style={{ left: 'calc(50% - 32px)', top: `${100 + filteredMissions.length * 200 + 30}px` }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-yellow-400/90 rounded-2xl flex items-center justify-center border-2 border-yellow-300 shadow-xl"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="text-4xl">🏆</span>
                    </motion.div>
                    <span className="text-sm font-bold text-white mt-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Level Complete!</span>
                  </div>
                </div>
                </div>{/* close inner scroll content */}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-14 border-2 border-gray-200 text-center shadow-sm">
                <div className="text-6xl mb-5">🔍</div>
                <p className="text-gray-600 font-semibold text-xl">No missions in this category</p>
                <button onClick={() => setCategoryFilter('all')} className="mt-4 text-blue-600 font-bold text-base hover:underline">Show all missions</button>
              </div>
            )}

            <div className="bg-blue-600 rounded-2xl p-6 mt-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🧭</span>
                  <div>
                    <p className="text-white font-extrabold text-lg">Adventure: Braille Explorer</p>
                    <p className="text-blue-200 text-base">{completedMissions.filter(id => missions.find(m => m.id === id)?.level === selectedLevel).length} of {missions.filter(m => m.level === selectedLevel).length} missions complete</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const next = filteredMissions.find(m => !completedMissions.includes(m.id))
                    if (next) { setSelectedMission(next); setShowMissionModal(true) }
                  }}
                  className="bg-white text-blue-600 font-extrabold text-base px-7 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-md"
                >
                  START +{filteredMissions.find(m => !completedMissions.includes(m.id))?.xpReward || 30} XP
                </button>
              </div>
              <div className="bg-white/20 rounded-full h-3 mt-4 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${missions.filter(m => m.level === selectedLevel).length > 0 ? (completedMissions.filter(id => missions.find(m => m.id === id)?.level === selectedLevel).length / missions.filter(m => m.level === selectedLevel).length * 100) : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          <div className="w-[400px] flex-shrink-0 hidden lg:block">
            <div className="sticky top-6 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
                  <button
                    onClick={prevSideTab}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex items-center gap-2.5">
                    {sideTabs[sideTabIndex].icon}
                    <span className="font-bold text-lg text-gray-900">{sideTabs[sideTabIndex].label}</span>
                  </div>
                  <button
                    onClick={nextSideTab}
                    className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex justify-center gap-1.5 py-3 border-b border-gray-100">
                  {sideTabs.map((_, i) => (
                    <button key={i} onClick={() => setSideTabIndex(i)}
                      className={`h-2.5 rounded-full transition-all ${i === sideTabIndex ? 'bg-blue-500 w-7' : 'bg-gray-300 w-2.5 hover:bg-gray-400'}`} />
                  ))}
                </div>

                <div className="p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={sideTabIndex}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderSideTabContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Target className="w-6 h-6 text-blue-500" />, label: 'Missions', value: `${completedMissions.length}/${missions.length}` },
                  { icon: <Globe className="w-6 h-6 text-green-500" />, label: 'Finds', value: String(userStats.totalFinds) },
                  { icon: <Flame className="w-6 h-6 text-orange-500" />, label: 'Streak', value: `${userStats.streak}d` },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
                    <div className="flex justify-center mb-2">{stat.icon}</div>
                    <div className="font-extrabold text-xl text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
              <button onClick={prevSideTab}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-all">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-2.5">
                {sideTabs[sideTabIndex].icon}
                <span className="font-bold text-lg text-gray-900">{sideTabs[sideTabIndex].label}</span>
              </div>
              <button onClick={nextSideTab}
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-all">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex justify-center gap-1.5 py-3 border-b border-gray-100">
              {sideTabs.map((_, i) => (
                <button key={i} onClick={() => setSideTabIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${i === sideTabIndex ? 'bg-blue-500 w-7' : 'bg-gray-300 w-2.5'}`} />
              ))}
            </div>
            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div key={`m-${sideTabIndex}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
                  {renderSideTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { icon: <Target className="w-6 h-6 text-blue-500" />, label: 'Missions', value: `${completedMissions.length}/${missions.length}` },
              { icon: <Globe className="w-6 h-6 text-green-500" />, label: 'Finds', value: String(userStats.totalFinds) },
              { icon: <Flame className="w-6 h-6 text-orange-500" />, label: 'Streak', value: `${userStats.streak}d` },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="font-extrabold text-xl text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMissionModal && selectedMission && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { e.stopPropagation(); resetSubmission(); }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden" style={{ maxHeight: '75vh' }}
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}>
              <div className="relative bg-blue-600 px-5 pt-4 pb-4 flex-shrink-0 overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/20">{selectedMission.icon}</div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-tight">{selectedMission.title}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="flex items-center gap-1 bg-white/15 text-white px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm">
                          <Star className="w-2.5 h-2.5" /> {selectedMission.xpReward} XP
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/15 text-white backdrop-blur-sm">{selectedMission.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); resetSubmission(); }}
                    className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="relative z-10 flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit border border-white/15">
                  <Bot className="w-3.5 h-3.5 text-white" />
                  <span className="text-[10px] font-medium text-blue-100">Braylin will verify your braille photo</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <p className="text-gray-500 mb-3 text-xs leading-relaxed">{selectedMission.description}</p>
                {selectedMission.bonusObjective && (
                  <div className="bg-blue-50 rounded-lg px-3 py-2 mb-3 border border-blue-100">
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Bonus: {selectedMission.bonusObjective}</span>
                  </div>
                )}
                {verifyStatus === 'idle' && (
                  <>
                    <label className="block cursor-pointer">
                      <input type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={e => handleFileChange(e.target.files?.[0] ?? null)} />
                      {preview ? (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                          <div className="relative group">
                            <img src={preview} alt="Preview" className="w-full max-h-56 object-contain bg-white" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.preventDefault(); setFile(null); setPreview(null); }}
                                  className="w-9 h-9 bg-white text-red-500 rounded-lg flex items-center justify-center shadow-md hover:bg-red-50 border border-gray-200">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-white">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                              <span className="text-[11px] font-medium text-gray-600">Ready to submit</span>
                            </div>
                            {fileCoords && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin className="w-2.5 h-2.5" />{fileCoords.latitude?.toFixed(3)}, {fileCoords.longitude?.toFixed(3)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors bg-blue-50/50">
                          <div className="py-8 px-6 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mx-auto mb-3">
                              <Camera className="w-7 h-7 text-blue-500" />
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">Upload your braille photo</p>
                            <p className="text-xs text-gray-400 mb-4">Take a clear, close-up photo of the braille sign</p>
                            <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                              <Upload className="w-3.5 h-3.5" /> Choose Photo
                            </div>
                          </div>
                        </div>
                      )}
                    </label>
                    {preview && (
                      <button onClick={handleSubmit}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Submit for Verification
                      </button>
                    )}
                  </>
                )}
                {verifyStatus === 'uploading' && (
                  <div className="text-center py-10">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-10 h-10 border-3 border-blue-100 border-t-blue-600 rounded-full mx-auto mb-4" />
                    <p className="text-gray-800 font-semibold text-sm">Uploading...</p>
                    <p className="text-gray-400 text-xs mt-1">This won't take long</p>
                  </div>
                )}
                {verifyStatus === 'verifying' && (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl border border-blue-200 flex items-center justify-center mx-auto mb-4">
                      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <Bot className="w-6 h-6 text-blue-600" />
                      </motion.div>
                    </div>
                    <p className="text-gray-800 font-semibold text-sm mb-1">Braylin is analyzing your photo</p>
                    <p className="text-gray-400 text-xs">Looking for braille patterns...</p>
                    <div className="mt-4 flex justify-center gap-1.5">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-blue-300 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                )}

                {verifyStatus === 'success' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {showConfetti && (
                      <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
                        {Array.from({ length: 50 }).map((_, i) => {
                          const colors = ['#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899']
                          const color = colors[i % colors.length]
                          const left = Math.random() * 100
                          const delay = Math.random() * 1.5
                          const size = 4 + Math.random() * 6
                          const rotation = Math.random() * 360
                          return (
                            <motion.div key={i}
                              className="absolute rounded-sm"
                              style={{ left: `${left}%`, top: -20, width: size, height: size * 0.6, backgroundColor: color, rotate: rotation }}
                              initial={{ y: -20, opacity: 1, rotate: rotation }}
                              animate={{ y: window.innerHeight + 100, opacity: [1, 1, 0], rotate: rotation + 720 + Math.random() * 360 }}
                              transition={{ duration: 2.5 + Math.random() * 2, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
                            />
                          )
                        })}
                      </div>
                    )}

                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4 text-center">
                      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-200">
                        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5, delay: 0.3 }}>
                          <Bot className="w-7 h-7 text-blue-600" />
                        </motion.div>
                      </div>
                      <h3 className="text-base font-bold text-blue-900 mb-1">Mission Complete!</h3>
                      <p className="text-sm text-blue-600 mb-3">Braylin verified your discovery</p>
                      <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-lg border border-blue-200">
                        <Star className="w-4 h-4 text-amber-500" fill="#f59e0b" />
                        <span className="text-sm font-bold text-gray-900">+{selectedMission.xpReward} XP</span>
                      </div>
                    </motion.div>

                    <div className="space-y-2">
                      <motion.button
                        onClick={() => {
                          if (lessonContent) {
                            setTimelineIndex(0)
                            setShowFullLesson(true)
                          }
                        }}
                        disabled={lessonLoading && !lessonContent}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl disabled:opacity-40 transition-colors text-sm flex items-center justify-center gap-2"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}>
                        {lessonLoading ? (
                          <span className="flex items-center gap-2">
                            <motion.div className="flex gap-1">
                              {[0,1,2].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 bg-white rounded-full"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.12 }} />
                              ))}
                            </motion.div>
                            Preparing lesson...
                          </span>
                        ) : (
                          <>
                            <BookOpen className="w-4 h-4" />
                            Learn About This Discovery
                          </>
                        )}
                      </motion.button>

                      <div className="flex gap-2">
                        <button onClick={() => handleShare(`Just completed "${selectedMission.title}" on BrailleQuest! +${selectedMission.xpReward} XP`)}
                          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl border border-gray-200 text-xs flex items-center justify-center gap-1.5">
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); resetSubmission(); }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-xs">
                          Next Mission →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {verifyStatus === 'failure' && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-200">
                        <Bot className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">Not quite right</h3>
                      <p className="text-sm text-gray-600">{verifyReason || "Braylin couldn't verify braille in this photo."}</p>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-4 mb-4 border border-blue-100">
                      <h4 className="font-semibold text-gray-800 mb-2 text-xs flex items-center gap-1.5"><Bot className="w-3 h-3 text-blue-500" /> Braylin's tips</h4>
                      <ul className="space-y-1 text-xs text-gray-600">
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" />Good, even lighting</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" />Get close to the braille sign</li>
                        <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" />Keep the camera steady</li>
                      </ul>
                    </div>
                    <button onClick={() => setVerifyStatus('idle')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
                      Try Again
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showShareModal && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2"><Share2 className="w-5 h-5 text-blue-600" /> Share Achievement</h3>
              <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
                <p className="text-base text-gray-800">{shareAchievement}</p>
                <p className="text-sm text-blue-600 mt-2">#BrailleQuest #Accessibility</p>
              </div>
              <div className="flex gap-3">
                <button onClick={shareToClipboard} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-base">
                  📋 Copy to Clipboard
                </button>
                <button onClick={() => setShowShareModal(false)} className="px-5 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 text-base">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showFirstMissionCelebration && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-md" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-white/20"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1, 0.5],
                    opacity: [0, 0.6, 0],
                    y: [0, -100 - Math.random() * 200],
                  }}
                  transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 1.5, repeat: Infinity, repeatDelay: Math.random() * 3 }}
                />
              ))}
            </div>

            <motion.div
              className="relative z-10 text-center max-w-md mx-auto px-6"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <motion.div
                className="w-32 h-32 mx-auto mb-6 relative"
                initial={{ rotateY: 180, scale: 0 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              >
                <div className="w-full h-full rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-500 shadow-2xl shadow-yellow-500/40 flex items-center justify-center border-4 border-yellow-300">
                  <div className="text-center">
                    <motion.span
                      className="text-5xl block"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      🏅
                    </motion.span>
                  </div>
                </div>
                <motion.div
                  className="absolute -inset-3 rounded-[28px] border-2 border-yellow-300/50"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>

              <motion.div
                className="flex justify-center gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {[
                  { l: 'F', d: [1,2,4] }, { l: 'I', d: [2,4] }, { l: 'R', d: [1,2,3,5] },
                  { l: 'S', d: [2,3,4] }, { l: 'T', d: [2,3,4,5] }
                ].map((cell, ci) => (
                  <motion.div
                    key={ci}
                    className="grid grid-cols-2 gap-1 bg-white/10 backdrop-blur rounded-lg p-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + ci * 0.1, type: 'spring' }}
                  >
                    {[1,4,2,5,3,6].map(dot => (
                      <div
                        key={dot}
                        className={`w-2.5 h-2.5 rounded-full ${
                          cell.d.includes(dot) ? 'bg-yellow-400 shadow-sm shadow-yellow-400/50' : 'bg-white/15'
                        }`}
                      />
                    ))}
                  </motion.div>
                ))}
              </motion.div>

              <motion.h2
                className="text-3xl font-extrabold text-white mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                First Mission Complete! 🎉
              </motion.h2>
              <motion.p
                className="text-blue-200 text-base mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                You've earned the <span className="font-bold text-yellow-300">First Find</span> badge!
              </motion.p>
              <motion.p
                className="text-blue-300/70 text-sm mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Welcome to BrailleQuest — keep exploring to discover more braille in the world around you.
              </motion.p>

              <motion.button
                onClick={() => setShowFirstMissionCelebration(false)}
                className="px-8 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 font-extrabold rounded-2xl shadow-xl shadow-yellow-500/30 hover:shadow-2xl hover:scale-105 transition-all text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, type: 'spring' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue Exploring →
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {showFullLesson && lessonContent && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="relative z-10 bg-blue-600 px-6 pt-5 pb-4 overflow-hidden"
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-base font-bold text-white truncate">{lessonContent.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/15">
                      <Bot className="w-3 h-3 text-blue-200" />
                      <span className="text-[10px] font-medium text-blue-100">Braylin’s Lesson</span>
                    </div>
                    <span className="text-[10px] text-blue-200">{selectedMission?.icon} {selectedMission?.title} • {(() => {
                      const sections: string[] = []
                      if (lessonContent.explanation) sections.push('overview')
                      if (lessonContent.braillePreview?.length) sections.push('braille')
                      if (lessonContent.facts?.length) sections.push('facts')
                      if (lessonContent.commonPatterns?.length) sections.push('patterns')
                      if (lessonContent.realWorldExamples?.length) sections.push('real-world')
                      if (lessonContent.practiceTips?.length) sections.push('tips')
                      sections.push('fun fact')
                      return `${sections.length} sections`
                    })()}</span>
                  </div>
                </div>
                <button onClick={() => setShowFullLesson(false)}
                  className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors ml-3 flex-shrink-0">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>

            <div className="relative z-10 px-6 py-3 bg-blue-50 border-b border-blue-100">
              {(() => {
                const sections: { id: string; icon: string; label: string }[] = []
                if (lessonContent.explanation) sections.push({ id: 'overview', icon: '🔍', label: 'Overview' })
                if (lessonContent.braillePreview?.length) sections.push({ id: 'braille', icon: '⠿', label: 'Braille' })
                if (lessonContent.facts?.length) sections.push({ id: 'facts', icon: '📖', label: 'Facts' })
                if (lessonContent.commonPatterns?.length) sections.push({ id: 'patterns', icon: '🧩', label: 'Patterns' })
                if (lessonContent.realWorldExamples?.length) sections.push({ id: 'world', icon: '🌍', label: 'Real World' })
                if (lessonContent.practiceTips?.length) sections.push({ id: 'tips', icon: '💪', label: 'Practice' })
                sections.push({ id: 'funfact', icon: '💡', label: 'Fun Fact' })

                return (
                  <div className="flex items-center gap-1">
                    {sections.map((s, i) => (
                      <button key={s.id} onClick={() => setTimelineIndex(i)} className="flex-1 group">
                        <div className={`h-1 rounded-full transition-all duration-300 ${
                          i < timelineIndex ? 'bg-blue-600' :
                          i === timelineIndex ? 'bg-blue-600' :
                          'bg-blue-200'
                        }`} />
                        <p className={`text-[9px] font-semibold mt-1 transition-colors text-center ${
                          i === timelineIndex ? 'text-blue-700' : 'text-blue-300'
                        }`}>
                          {s.label}
                        </p>
                      </button>
                    ))}
                  </div>
                )
              })()}
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto bg-slate-50">
              <AnimatePresence mode="wait">
                {(() => {
                  const sections: React.ReactNode[] = []

                  if (lessonContent.explanation) sections.push(
                    <motion.div key="overview" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <span className="text-xl">🔍</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">What You Discovered</h3>
                      </div>
                      <p className="text-base text-gray-600 leading-relaxed mb-6">{lessonContent.explanation}</p>
                      {imageDescription && (
                        <div className="bg-blue-50 rounded-xl px-5 py-4 border border-blue-100">
                          <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-1">From your photo</p>
                          <p className="text-sm text-gray-700">{imageDescription}</p>
                        </div>
                      )}
                      {lessonContent.brailleTypes?.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-gray-800 mb-3">Braille Types Found</h4>
                          <div className="space-y-2">
                            {lessonContent.brailleTypes.map((bt, i) => (
                              <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100">
                                <BrailleCell dots={bt.dots || [1]} size={32} />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{bt.name}</p>
                                  <p className="text-xs text-gray-500">{bt.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <button onClick={() => {
                        const narration = `${lessonContent.explanation}${imageDescription ? `. From your photo: ${imageDescription}` : ''}${lessonContent.brailleTypes?.length ? `. Braille types: ${lessonContent.brailleTypes.map(bt => `${bt.name} — ${bt.desc}`).join('. ')}` : ''}`
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: narration } }))
                      }} className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read aloud
                      </button>
                    </motion.div>
                  )

                  if (lessonContent.braillePreview?.length) sections.push(
                    <motion.div key="braille" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <span className="text-xl">⠿</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Interactive Braille</h3>
                          <p className="text-xs text-gray-400">Tap each cell to explore the dot pattern</p>
                        </div>
                      </div>
                      <div className="flex justify-center gap-3 flex-wrap mb-6">
                        {lessonContent.braillePreview.map((cell, i) => (
                          <motion.div key={i} className="flex flex-col items-center"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06, type: 'spring' }}
                            onClick={() => {
                              setActiveDotCell(activeDotCell === i ? null : i)
                              window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Letter ${cell.letter.toUpperCase()}, dots ${cell.dots.join(', ')}` } }))
                            }}>
                            <div className={`rounded-xl p-3 border-2 transition-all cursor-pointer ${
                              activeDotCell === i ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}>
                              <BrailleCell dots={cell.dots} size={48} active={activeDotCell === i} />
                            </div>
                            <span className={`text-base font-bold mt-2 transition-colors ${
                              activeDotCell === i ? 'text-blue-700' : 'text-gray-400'
                            }`}>{cell.letter.toUpperCase()}</span>
                          </motion.div>
                        ))}
                      </div>
                      {activeDotCell !== null && lessonContent.braillePreview[activeDotCell] && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="bg-blue-50 rounded-xl px-5 py-4 border border-blue-200">
                          <div className="flex items-center gap-4">
                            <BrailleCell dots={lessonContent.braillePreview[activeDotCell].dots} size={56} active />
                            <div>
                              <p className="text-sm text-gray-500">Letter</p>
                              <p className="text-2xl font-bold text-gray-900">{lessonContent.braillePreview[activeDotCell].letter.toUpperCase()}</p>
                              <p className="text-xs text-gray-400 mt-1 font-mono">Dots: {lessonContent.braillePreview[activeDotCell].dots.join(', ')}</p>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-1 w-fit">
                            {[1,4,2,5,3,6].map(dot => (
                              <div key={dot} className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                lessonContent!.braillePreview![activeDotCell!].dots.includes(dot)
                                  ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                              }`}>{dot}</div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      <button onClick={() => {
                        const narration = lessonContent.braillePreview!.map(c => `Letter ${c.letter.toUpperCase()}, dots ${c.dots.join(' ')}`).join('. ')
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Braille spelling: ${narration}` } }))
                      }} className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read all cells
                      </button>
                    </motion.div>
                  )

                  if (lessonContent.facts?.length) sections.push(
                    <motion.div key="facts" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <span className="text-xl">📖</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Key Facts</h3>
                      </div>
                      <div className="space-y-2">
                        {lessonContent.facts.map((fact, i) => (
                          <motion.div key={i}
                            className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100 hover:border-blue-200 transition-colors"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}>
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{fact}</p>
                          </motion.div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const narration = lessonContent.facts!.map((f, i) => `Fact ${i + 1}: ${f}`).join('. ')
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: narration } }))
                      }} className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read all facts
                      </button>
                    </motion.div>
                  )

                  if (lessonContent.commonPatterns?.length) sections.push(
                    <motion.div key="patterns" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <span className="text-xl">🧩</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Braille Patterns</h3>
                          <p className="text-xs text-gray-400">Common contractions and symbols</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lessonContent.commonPatterns.map((pat, i) => (
                          <motion.div key={i}
                            className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100 hover:border-blue-200 transition-colors cursor-pointer"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `${pat.symbol}: ${pat.meaning}. Dots ${(pat.dots || []).join(', ')}` } }))
                            }}>
                            <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-100 flex-shrink-0">
                              <BrailleCell dots={pat.dots || [1]} size={32} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-900">{pat.symbol}</p>
                              <p className="text-xs text-gray-500 leading-snug">{pat.meaning}</p>
                              <p className="text-[10px] text-gray-300 font-mono mt-0.5">dots {(pat.dots || []).join('-')}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const narration = lessonContent.commonPatterns!.map(p => `${p.symbol}: ${p.meaning}, dots ${(p.dots || []).join(' ')}`).join('. ')
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Common patterns: ${narration}` } }))
                      }} className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read all patterns
                      </button>
                    </motion.div>
                  )

                  if (lessonContent.realWorldExamples?.length) sections.push(
                    <motion.div key="world" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <span className="text-xl">🌍</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Where You'll Find This</h3>
                      </div>
                      <div className="space-y-2">
                        {lessonContent.realWorldExamples.map((ex, i) => (
                          <motion.div key={i}
                            className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}>
                            <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin className="w-3 h-3 text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{ex}</p>
                          </motion.div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const narration = lessonContent.realWorldExamples!.map((e, i) => `${i + 1}: ${e}`).join('. ')
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Where you'll find this: ${narration}` } }))
                      }} className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read aloud
                      </button>
                    </motion.div>
                  )

                  if (lessonContent.practiceTips?.length) sections.push(
                    <motion.div key="tips" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                          <span className="text-xl">💪</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Practice Tips</h3>
                      </div>
                      <div className="space-y-2">
                        {lessonContent.practiceTips.map((tip, i) => (
                          <motion.div key={i}
                            className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-blue-100"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}>
                            <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Zap className="w-3 h-3 text-blue-500" />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                          </motion.div>
                        ))}
                      </div>
                      <button onClick={() => {
                        const narration = lessonContent.practiceTips!.map((t, i) => `Tip ${i + 1}: ${t}`).join('. ')
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: narration } }))
                      }} className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read all tips
                      </button>
                    </motion.div>
                  )

                  sections.push(
                    <motion.div key="funfact" className="max-w-2xl mx-auto px-6 py-8"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}>
                      <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                          <span className="text-2xl">💡</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-2">Did You Know?</h3>
                        <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">{lessonContent.funFact}</p>
                      </div>
                      <button onClick={() => {
                        window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `Fun fact: ${lessonContent.funFact}` } }))
                      }} className="mt-4 mx-auto flex items-center gap-2 text-xs font-medium text-blue-400 hover:text-blue-600 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" /> Read aloud
                      </button>
                    </motion.div>
                  )

                  return sections[Math.min(timelineIndex, sections.length - 1)]
                })()}
              </AnimatePresence>
            </div>

            <motion.div className="relative z-10 px-6 pb-5 pt-3 border-t border-blue-100 bg-white"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="max-w-2xl mx-auto flex items-center gap-3">
                <button
                  onClick={() => setTimelineIndex(Math.max(0, timelineIndex - 1))}
                  disabled={timelineIndex === 0}
                  className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-20 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5 text-blue-600" />
                </button>

                <button
                  onClick={() => {
                    const totalSections = [
                      lessonContent.explanation,
                      lessonContent.braillePreview?.length,
                      lessonContent.facts?.length,
                      lessonContent.commonPatterns?.length,
                      lessonContent.realWorldExamples?.length,
                      lessonContent.practiceTips?.length,
                      true
                    ].filter(Boolean).length

                    if (timelineIndex < totalSections - 1) {
                      setTimelineIndex(timelineIndex + 1)
                    } else {
                      setShowFullLesson(false)
                    }
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm">
                  {(() => {
                    const totalSections = [
                      lessonContent.explanation,
                      lessonContent.braillePreview?.length,
                      lessonContent.facts?.length,
                      lessonContent.commonPatterns?.length,
                      lessonContent.realWorldExamples?.length,
                      lessonContent.practiceTips?.length,
                      true
                    ].filter(Boolean).length
                    return timelineIndex < totalSections - 1 ? 'Next Section →' : 'Complete Lesson ✓'
                  })()}
                </button>

                <button
                  onClick={() => setShowFullLesson(false)}
                  className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-blue-500" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}