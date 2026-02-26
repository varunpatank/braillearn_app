'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { parseExifGps } from '@/utils/exif'
import { openRouterService } from '@/services/openRouterService'
import {
  MapPin, Camera, Trophy, Star, CheckCircle,
  X, Upload, Target, Award, Globe, Lock,
  Share2, BarChart, Brain,
  Flame, Map as MapIcon,
  Eye, BookOpen, Zap, Crown, Medal, Shield,
  Heart, Sparkles
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

type SidebarTab = 'leaderboard' | 'activity' | 'badges' | 'share' | 'achievements' | 'rewards'
type CategoryFilter = 'all' | Mission['category']

export default function BrailleQuestPage() {
  const missions: Mission[] = useMemo(() => ([
    // Level 1 - Beginner (Easy)
    { id: 'm1', level: 1, title: 'Spot a Door Sign', description: 'Find and photograph a braille sign on any public building entrance.', xpReward: 25, icon: '🚪', category: 'signage', difficulty: 'easy', bonusObjective: 'Find one with room numbers' },
    { id: 'm2', level: 1, title: 'Restroom Finder', description: 'Locate a braille restroom sign and capture it clearly.', xpReward: 30, icon: '🚻', category: 'signage', difficulty: 'easy' },
    { id: 'm3', level: 1, title: 'Elevator Explorer', description: 'Find braille on elevator buttons or panels.', xpReward: 35, icon: '🛗', category: 'signage', difficulty: 'easy', bonusObjective: 'Photograph all floor buttons' },
    { id: 'm4', level: 1, title: 'Room Number Reader', description: 'Find braille room numbers in a hotel or office building.', xpReward: 25, icon: '🔢', category: 'signage', difficulty: 'easy' },
    { id: 'm5', level: 1, title: 'Parking Sign Spotter', description: 'Find braille on a handicapped parking sign.', xpReward: 30, icon: '🅿️', category: 'signage', difficulty: 'easy' },
    // Level 2 - Explorer (Medium)
    { id: 'm6', level: 2, title: 'Bus Stop Detective', description: 'Discover braille information at a public transit stop.', xpReward: 50, icon: '🚌', category: 'transport', difficulty: 'medium', bonusObjective: 'Find route info in braille' },
    { id: 'm7', level: 2, title: 'ATM Hunter', description: 'Find and photograph braille on an ATM machine keypad.', xpReward: 45, icon: '🏧', category: 'public', difficulty: 'medium' },
    { id: 'm8', level: 2, title: 'Menu Master', description: 'Locate a restaurant with a braille menu option.', xpReward: 60, icon: '🍽️', category: 'food', difficulty: 'medium', bonusObjective: 'Ask staff about it' },
    { id: 'm9', level: 2, title: 'Pharmacy Finder', description: 'Find braille labels on prescription medication bottles.', xpReward: 55, icon: '💊', category: 'medical', difficulty: 'medium' },
    { id: 'm10', level: 2, title: 'Store Directory', description: 'Find a braille store directory in a shopping mall.', xpReward: 50, icon: '🏬', category: 'public', difficulty: 'medium' },
    { id: 'm11', level: 2, title: 'Crosswalk Clicker', description: 'Find braille on a pedestrian crossing signal button.', xpReward: 40, icon: '🚶', category: 'transport', difficulty: 'medium' },
    { id: 'm12', level: 2, title: 'Vending Victory', description: 'Find braille labels on a vending machine.', xpReward: 45, icon: '🥤', category: 'public', difficulty: 'medium' },
    // Level 3 - Adventurer (Hard)
    { id: 'm13', level: 3, title: 'Library Legend', description: 'Find braille resources or signage in a public library.', xpReward: 70, icon: '📚', category: 'education', difficulty: 'hard', bonusObjective: 'Find a braille book' },
    { id: 'm14', level: 3, title: 'Museum Guide', description: 'Discover braille descriptions at a museum exhibit.', xpReward: 80, icon: '🏛️', category: 'education', difficulty: 'hard' },
    { id: 'm15', level: 3, title: 'Hospital Navigator', description: 'Document braille wayfinding signs in a hospital.', xpReward: 75, icon: '🏥', category: 'medical', difficulty: 'hard' },
    { id: 'm16', level: 3, title: 'Park Explorer', description: 'Find braille on trail signs or information boards in a park.', xpReward: 65, icon: '🌲', category: 'recreation', difficulty: 'hard', bonusObjective: 'Find a tactile nature map' },
    { id: 'm17', level: 3, title: 'Airport Ace', description: 'Document braille accessibility features at an airport.', xpReward: 85, icon: '✈️', category: 'transport', difficulty: 'hard' },
    { id: 'm18', level: 3, title: 'School Scout', description: 'Find braille signage in a school or university.', xpReward: 70, icon: '🏫', category: 'education', difficulty: 'hard' },
    { id: 'm19', level: 3, title: 'Government Guru', description: 'Find braille at a government building (courthouse, city hall).', xpReward: 75, icon: '🏛️', category: 'government', difficulty: 'hard' },
    // Level 4 - Champion (Hard)
    { id: 'm20', level: 4, title: 'Tactile Map Finder', description: 'Locate a tactile/braille map in a public space.', xpReward: 100, icon: '🗺️', category: 'public', difficulty: 'hard', bonusObjective: 'Describe what the map shows' },
    { id: 'm21', level: 4, title: 'Train Station Pro', description: 'Document braille accessibility features at a train station.', xpReward: 90, icon: '🚂', category: 'transport', difficulty: 'hard' },
    { id: 'm22', level: 4, title: 'Hotel Investigator', description: 'Find 3+ different braille signs in one hotel.', xpReward: 95, icon: '🏨', category: 'signage', difficulty: 'hard' },
    { id: 'm23', level: 4, title: 'Playground Pioneer', description: 'Find braille signage at a playground or recreation center.', xpReward: 85, icon: '🎡', category: 'recreation', difficulty: 'hard' },
    { id: 'm24', level: 4, title: 'Movie Night', description: 'Find braille accessibility options at a movie theater.', xpReward: 90, icon: '🎬', category: 'recreation', difficulty: 'hard' },
    // Level 5 - Master (Legendary)
    { id: 'm25', level: 5, title: 'Braille Art Discovery', description: 'Find public art or sculpture that incorporates braille.', xpReward: 150, icon: '🎨', category: 'recreation', difficulty: 'legendary', bonusObjective: 'Research the artist' },
    { id: 'm26', level: 5, title: 'Currency Expert', description: 'Document all accessibility features on different currency bills.', xpReward: 120, icon: '💵', category: 'public', difficulty: 'legendary' },
    { id: 'm27', level: 5, title: 'Historic Discovery', description: 'Find braille at a historical landmark or monument.', xpReward: 140, icon: '🏰', category: 'education', difficulty: 'legendary' },
    { id: 'm28', level: 5, title: 'Braille in Nature', description: 'Find a braille trail guide or nature center with braille.', xpReward: 130, icon: '🦋', category: 'recreation', difficulty: 'legendary' },
    // Level 6 - Legend (Legendary)
    { id: 'm29', level: 6, title: 'World Traveler', description: 'Document braille signs in 3 different cities.', xpReward: 200, icon: '🌍', category: 'public', difficulty: 'legendary', bonusObjective: 'Compare accessibility across cities' },
    { id: 'm30', level: 6, title: 'Accessibility Advocate', description: 'Find a business WITHOUT braille and help them learn about it.', xpReward: 250, icon: '📢', category: 'public', difficulty: 'legendary', bonusObjective: 'Write them a friendly letter' },
    { id: 'm31', level: 6, title: 'Community Mapper', description: 'Create a complete braille accessibility map of your neighborhood.', xpReward: 300, icon: '🗺️', category: 'public', difficulty: 'legendary', bonusObjective: 'Map 10+ locations' },
    { id: 'm32', level: 6, title: 'Ultimate BrailleQuest', description: 'Complete every mission category and earn the Master Explorer badge.', xpReward: 500, icon: '👑', category: 'public', difficulty: 'legendary' },
  ]), [])

  const leaderboard: LeaderboardEntry[] = [
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
  const [completedMissions, setCompletedMissions] = useState<string[]>(['m1', 'm2', 'm3', 'm6', 'm7'])
  const [fileCoords, setFileCoords] = useState<{ latitude?: number; longitude?: number } | null>(null)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('leaderboard')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareAchievement, setShareAchievement] = useState<string>('')
  const [showMapView, setShowMapView] = useState(false)
  const { user: _user } = useAuth()

  // AI Activity data
  const aiInsights = [
    { icon: '🔥', title: 'Hot Streak!', desc: `You've completed 3 missions this week. Keep going to earn the 7-day streak badge!`, type: 'motivation' },
    { icon: '📊', title: 'Most Active Category', desc: 'You focus on signage missions. Try transport or food categories for variety!', type: 'insight' },
    { icon: '🎯', title: 'Next Recommended', desc: 'Based on your progress, try "Bus Stop Detective" — it\'s nearby and matches your skill level.', type: 'recommendation' },
    { icon: '📈', title: 'Weekly Progress', desc: 'You\'re 40% more active than last week. At this rate, you\'ll reach Explorer rank in 5 days!', type: 'progress' },
    { icon: '🏆', title: 'Achievement Alert', desc: 'You\'re 2 missions away from unlocking the "Category Explorer" badge!', type: 'achievement' },
  ]

  // Map discovery pins
  const mapDiscoveries = [
    { id: 1, lat: 47.6062, lng: -122.3321, title: 'City Hall Entrance', type: 'signage', emoji: '🚪' },
    { id: 2, lat: 47.6097, lng: -122.3331, title: 'Central Library', type: 'education', emoji: '📚' },
    { id: 3, lat: 47.6025, lng: -122.3271, title: 'Pike Place ATM', type: 'public', emoji: '🏧' },
    { id: 4, lat: 47.6114, lng: -122.3378, title: 'Bus Stop #447', type: 'transport', emoji: '🚌' },
    { id: 5, lat: 47.6080, lng: -122.3355, title: 'Hotel Lobby', type: 'signage', emoji: '🏨' },
    { id: 6, lat: 47.6040, lng: -122.3290, title: 'Museum of Art', type: 'education', emoji: '🏛️' },
    { id: 7, lat: 47.6070, lng: -122.3340, title: 'Pharmacy', type: 'medical', emoji: '💊' },
    { id: 8, lat: 47.6055, lng: -122.3310, title: 'Park Trail Sign', type: 'recreation', emoji: '🌲' },
  ]

  const levels = [
    { level: 1, title: 'Beginner', requiredXP: 0, icon: '🌱', color: 'from-green-400 to-green-500' },
    { level: 2, title: 'Explorer', requiredXP: 100, icon: '🧭', color: 'from-blue-400 to-blue-500' },
    { level: 3, title: 'Adventurer', requiredXP: 300, icon: '⛰️', color: 'from-purple-400 to-purple-500' },
    { level: 4, title: 'Champion', requiredXP: 600, icon: '🏆', color: 'from-yellow-400 to-orange-500' },
    { level: 5, title: 'Master', requiredXP: 1000, icon: '💎', color: 'from-pink-400 to-rose-500' },
    { level: 6, title: 'Legend', requiredXP: 2000, icon: '👑', color: 'from-amber-400 to-amber-600' },
  ]

  const badges = [
    { icon: '🔍', name: 'First Find', earned: true, desc: 'Complete your first mission' },
    { icon: '📸', name: 'Shutterbug', earned: true, desc: 'Upload 5 verified photos' },
    { icon: '🏃', name: '7-Day Streak', earned: false, desc: 'Complete missions 7 days in a row' },
    { icon: '🌟', name: 'Star Hunter', earned: true, desc: 'Earn 500+ XP total' },
    { icon: '🗺️', name: 'Explorer', earned: true, desc: 'Complete all Level 1 missions' },
    { icon: '🏆', name: 'Champion', earned: false, desc: 'Reach Champion rank' },
    { icon: '💎', name: 'Rare Find', earned: false, desc: 'Complete a legendary mission' },
    { icon: '👑', name: 'Legend', earned: false, desc: 'Complete all missions' },
    { icon: '🌍', name: 'World Traveler', earned: false, desc: 'Find braille in 3 cities' },
    { icon: '🎨', name: 'Category Explorer', earned: false, desc: 'Complete missions in 5 categories' },
    { icon: '🔥', name: 'On Fire', earned: true, desc: 'Complete 3 missions in one day' },
    { icon: '📢', name: 'Advocate', earned: false, desc: 'Help a business learn about braille' },
  ]

  // ─── Achievement System (merged from Achievements page) ───
  interface AchievementItem {
    id: string; title: string; description: string; icon: React.ElementType;
    category: 'learning' | 'practice' | 'streak' | 'mastery' | 'special';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xpReward: number; requirement: string; progress: number; maxProgress: number;
    unlocked: boolean; unlockedDate?: string;
  }

  const rarityColors: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
    common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', gradient: 'from-gray-400 to-gray-500' },
    rare: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', gradient: 'from-blue-400 to-blue-600' },
    epic: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', gradient: 'from-purple-400 to-purple-600' },
    legendary: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', gradient: 'from-yellow-400 to-orange-500' }
  }

  const achievementsList: AchievementItem[] = [
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
  ]

  const rewardItems = [
    { id: 'r1', name: 'Dark Theme', description: 'Unlock a sleek dark mode for the app', cost: 500, icon: '🌙', category: 'Themes', owned: false },
    { id: 'r2', name: 'Golden Profile Frame', description: 'Show off with a golden border around your avatar', cost: 1000, icon: '🖼️', category: 'Profile', owned: false },
    { id: 'r3', name: 'Custom Braille Font', description: 'Access unique braille display fonts', cost: 750, icon: '🔤', category: 'Customization', owned: false },
    { id: 'r4', name: 'Streak Shield', description: 'Protect your streak for one missed day', cost: 300, icon: '🛡️', category: 'Power-ups', owned: true },
    { id: 'r5', name: 'Double XP Weekend', description: 'Earn 2x XP for an entire weekend', cost: 800, icon: '⚡', category: 'Power-ups', owned: false },
    { id: 'r6', name: 'Confetti Celebration', description: 'Extra confetti effects on achievements', cost: 200, icon: '🎊', category: 'Effects', owned: true },
    { id: 'r7', name: 'Ocean Theme', description: 'A calming ocean-inspired color palette', cost: 600, icon: '🌊', category: 'Themes', owned: false },
    { id: 'r8', name: 'Galaxy Badge', description: 'A rare galaxy-themed profile badge', cost: 1500, icon: '🌌', category: 'Profile', owned: false },
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
    
    // Convert file to base64 data URL for AI analysis
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
      
      // Parse AI response
      try {
        const cleaned = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const result = JSON.parse(cleaned)
        isSuccess = result.verified === true
        setVerifyReason(result.reason || '')
      } catch {
        // If we can't parse JSON, check for positive keywords in response
        const lower = aiResponse.toLowerCase()
        isSuccess = (lower.includes('verified') && lower.includes('true')) ||
                    lower.includes('braille') && !lower.includes('no braille') && !lower.includes('not') && !lower.includes('cannot')
        setVerifyReason(aiResponse || '')
      }
    } catch (err) {
      console.error('AI verification failed, using fallback:', err)
      // Fallback: still give a chance if AI is unavailable
      isSuccess = Math.random() > 0.4
    }

    setVerifyStatus(isSuccess ? 'success' : 'failure')
    if (isSuccess) {
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + (selectedMission.xpReward ?? 50),
        missions: prev.missions + 1,
        totalFinds: prev.totalFinds + 1
      }))
      setCompletedMissions(prev => [...prev, selectedMission.id])
    }
  }

  function resetSubmission() {
    setFile(null)
    setPreview(null)
    setVerifyStatus('idle')
    setVerifyReason('')
    setShowMissionModal(false)
    setSelectedMission(null)
  }

  function handleShare(text: string) {
    setShareAchievement(text)
    setShowShareModal(true)
  }

  function shareToClipboard() {
    navigator.clipboard.writeText(`🎯 BrailleQuest Achievement: ${shareAchievement}\n\nJoin me in discovering braille accessibility in our community! #BrailleQuest #Accessibility`)
    setShowShareModal(false)
  }

  const currentLevelInfo = levels.find(l => l.level === selectedLevel) || levels[0]
  const isLevelUnlocked = (level: number) => userStats.xp >= (levels.find(l => l.level === level)?.requiredXP || 0)

  const filteredMissions = missions.filter(m => {
    if (m.level !== selectedLevel) return false
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false
    return true
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Hero Header — Explorer/Map Theme */}
      <section className="bg-gradient-to-bl from-blue-600 via-indigo-700 to-blue-800 text-white py-10 relative overflow-hidden">
        {/* Topographic/contour lines pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%"><defs><pattern id="topo" width="80" height="80" patternUnits="userSpaceOnUse"><circle cx="40" cy="40" r="15" fill="none" stroke="white" strokeWidth="0.5"/><circle cx="40" cy="40" r="30" fill="none" stroke="white" strokeWidth="0.5"/><circle cx="40" cy="40" r="38" fill="none" stroke="white" strokeWidth="0.3"/></pattern></defs><rect width="100%" height="100%" fill="url(#topo)"/></svg>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute text-xl" initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '-100%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
              style={{ left: `${Math.random() * 100}%` }}>
              {['🗺️', '📸', '🏆', '⭐', '🎯', '🔍', '📍', '🧭'][i]}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-3">
                <MapPin className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-medium">Real-World Braille Discovery</span>
              </motion.span>
              <h1 className="text-4xl md:text-5xl font-extrabold flex items-center gap-3 mb-2">
                <span className="text-5xl">🗺️</span> BrailleQuest
              </h1>
              <p className="text-blue-100 text-lg max-w-xl">
                Explore your community, discover braille in the wild, and earn XP while making the world more accessible!
              </p>
            </motion.div>

            {/* Stats Bar */}
            <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {[
                { value: userStats.xp, label: 'XP', icon: Star, color: 'bg-yellow-500' },
                { value: userStats.streak, label: 'Streak', icon: Flame, color: 'bg-orange-500' },
                { value: userStats.missions, label: 'Missions', icon: Target, color: 'bg-green-500' },
                { value: `#${userStats.rank}`, label: 'Rank', icon: Trophy, color: 'bg-purple-500' },
                { value: userStats.totalFinds, label: 'Finds', icon: Eye, color: 'bg-blue-500' },
                { value: userStats.citiesMapped, label: 'Cities', icon: Globe, color: 'bg-indigo-500' },
              ].map((stat, i) => (
                <motion.div key={stat.label}
                  className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 text-center border border-white/20 min-w-[70px]"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.08, type: 'spring' }}>
                  <stat.icon className="w-4 h-4 mx-auto mb-0.5 text-blue-200" />
                  <div className="text-lg font-extrabold">{stat.value}</div>
                  <div className="text-[10px] text-blue-200">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map View Toggle */}
            <div className="flex gap-3">
              <motion.button onClick={() => setShowMapView(false)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${!showMapView ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border-2 border-blue-100 hover:border-blue-300'}`}
                whileHover={{ scale: 1.03 }}>
                <Target className="w-4 h-4" /> Missions
              </motion.button>
              <motion.button onClick={() => setShowMapView(true)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${showMapView ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 border-2 border-blue-100 hover:border-blue-300'}`}
                whileHover={{ scale: 1.03 }}>
                <MapIcon className="w-4 h-4" /> Discovery Map
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {showMapView ? (
                <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {/* Discovery Map */}
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <MapIcon className="w-6 h-6" /> Your Discovery Map
                      </h3>
                      <p className="text-blue-200 text-sm mt-1">All braille finds documented by you and the community</p>
                    </div>
                    {/* Map placeholder - visual representation */}
                    <div className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
                      {/* Grid lines */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #3b82f6 1px, transparent 1px), linear-gradient(to bottom, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                      {/* Discovery pins */}
                      {mapDiscoveries.map((pin, i) => (
                        <motion.div key={pin.id}
                          className="absolute cursor-pointer group"
                          style={{ left: `${15 + (i % 4) * 22}%`, top: `${10 + Math.floor(i / 4) * 40}%` }}
                          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: 'spring' }}
                          whileHover={{ scale: 1.3, zIndex: 10 }}>
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-xl border-2 border-blue-300 flex items-center justify-center text-xl relative">
                            {pin.emoji}
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                          </div>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all font-bold">
                            {pin.title}
                          </div>
                        </motion.div>
                      ))}
                      {/* Map stats */}
                      <div className="absolute bottom-4 left-4 right-4 flex gap-3">
                        {[
                          { label: 'Your Finds', value: '8', icon: '📍' },
                          { label: 'Community', value: '1,247', icon: '🌐' },
                          { label: 'Cities', value: '89', icon: '🏙️' },
                        ].map(stat => (
                          <div key={stat.label} className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-blue-100 flex items-center gap-2">
                            <span className="text-lg">{stat.icon}</span>
                            <div>
                              <div className="text-sm font-extrabold text-gray-900">{stat.value}</div>
                              <div className="text-[10px] text-gray-500">{stat.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 border-t border-blue-100">
                      <h4 className="font-bold text-gray-900 mb-3 text-sm">Recent Discoveries</h4>
                      <div className="space-y-2">
                        {mapDiscoveries.slice(0, 4).map(pin => (
                          <div key={pin.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 transition-all">
                            <span className="text-xl">{pin.emoji}</span>
                            <div className="flex-1">
                              <div className="font-bold text-sm text-gray-900">{pin.title}</div>
                              <div className="text-xs text-gray-500 capitalize">{pin.type}</div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">+25 XP</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="missions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  {/* Level Selector */}
                  <motion.div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-6"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Your Journey</h2>
                      <div className="text-sm text-gray-500 font-bold">{completedMissions.length}/{missions.length} missions</div>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {levels.map(level => {
                        const unlocked = isLevelUnlocked(level.level)
                        const isSelected = selectedLevel === level.level
                        const doneInLvl = missions.filter(m => m.level === level.level && completedMissions.includes(m.id)).length
                        const totalInLvl = missions.filter(m => m.level === level.level).length
                        return (
                          <motion.button key={level.level} onClick={() => unlocked && setSelectedLevel(level.level)}
                            disabled={!unlocked}
                            className={`relative flex flex-col items-center p-3 rounded-2xl transition-all ${
                              isSelected ? 'bg-gradient-to-br ' + level.color + ' text-white shadow-lg scale-110 ring-4 ring-blue-300'
                                : unlocked ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                            whileHover={unlocked ? { scale: isSelected ? 1.1 : 1.05 } : {}} whileTap={unlocked ? { scale: 0.95 } : {}}>
                            {!unlocked && <Lock className="absolute -top-2 -right-2 w-4 h-4 text-gray-400 bg-white rounded-full p-0.5" />}
                            <span className="text-2xl mb-0.5">{level.icon}</span>
                            <span className="font-bold text-xs">{level.title}</span>
                            <span className="text-[10px] opacity-80">{doneInLvl}/{totalInLvl}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* Category Filters */}
                  <div className="flex gap-2 overflow-x-auto py-3 -mx-2 px-2">
                    {categories.filter(c => c.id === 'all' || missions.some(m => m.level === selectedLevel && m.category === c.id)).map(cat => (
                      <button key={cat.id} onClick={() => setCategoryFilter(cat.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          categoryFilter === cat.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                        }`}>
                        <span>{cat.emoji}</span> {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Missions Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">{currentLevelInfo.icon}</span> {currentLevelInfo.title} Missions
                      </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {filteredMissions.map((mission, index) => {
                        const isCompleted = completedMissions.includes(mission.id)
                        return (
                          <motion.div key={mission.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            onClick={() => !isCompleted && (setSelectedMission(mission), setShowMissionModal(true))}
                            className={`relative bg-white rounded-3xl shadow-lg border-2 p-5 cursor-pointer transition-all ${
                              isCompleted ? 'border-green-300 bg-green-50' : 'border-blue-100 hover:border-blue-400 hover:shadow-xl'
                            }`}>
                            {isCompleted && (
                              <div className="absolute top-3 right-3 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                                isCompleted ? 'bg-green-200' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                              }`}>
                                {mission.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold ${isCompleted ? 'text-green-700' : 'text-gray-800'}`}>{mission.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{mission.description}</p>
                                {mission.bonusObjective && (
                                  <div className="text-[11px] text-purple-600 font-bold mb-2 flex items-center gap-1">
                                    <Star className="w-3 h-3" /> Bonus: {mission.bonusObjective}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    mission.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                    mission.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    mission.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>{mission.difficulty}</span>
                                  <span className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                                    <Star className="w-3 h-3" />{mission.xpReward} XP
                                  </span>
                                  {isCompleted && (
                                    <button onClick={(e) => { e.stopPropagation(); handleShare(`Completed "${mission.title}" and earned ${mission.xpReward} XP!`); }}
                                      className="flex items-center gap-1 text-xs font-bold text-blue-500 hover:text-blue-700">
                                      <Share2 className="w-3 h-3" /> Share
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            {!isCompleted && (
                              <div className="mt-3 flex justify-end">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-1.5 rounded-full text-sm shadow-md">
                                  START
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                    {filteredMissions.length === 0 && (
                      <div className="bg-white rounded-3xl p-8 border-2 border-blue-100 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-gray-600 font-bold">No missions in this category for this level</p>
                        <button onClick={() => setCategoryFilter('all')} className="mt-2 text-blue-600 font-bold text-sm hover:underline">Show all</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Sidebar Tab Switcher */}
            <div className="bg-white rounded-2xl shadow-lg p-2 border-2 border-blue-100">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'leaderboard' as SidebarTab, label: '🏆', title: 'Rankings' },
                  { id: 'achievements' as SidebarTab, label: '🏅', title: 'Achieve' },
                  { id: 'rewards' as SidebarTab, label: '🎁', title: 'Rewards' },
                  { id: 'activity' as SidebarTab, label: '🧠', title: 'Insights' },
                  { id: 'badges' as SidebarTab, label: '🎖️', title: 'Badges' },
                  { id: 'share' as SidebarTab, label: '📤', title: 'Share' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSidebarTab(tab.id)}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl text-xs font-bold transition-all ${
                      sidebarTab === tab.id
                        ? 'bg-blue-600 text-white shadow-md scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
                    }`}>
                    <span className="text-base leading-none">{tab.label}</span>
                    <span className="text-[10px] leading-tight">{tab.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Leaderboard Tab */}
              {sidebarTab === 'leaderboard' && (
                <motion.div key="lb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Trophy className="w-5 h-5 text-yellow-500" /> Weekly Rankings
                    </h3>
                    <div className="space-y-2">
                      {leaderboard.map((entry, i) => (
                        <motion.div key={entry.rank}
                          className={`flex items-center gap-2 p-2.5 rounded-xl ${
                            entry.name === 'You' ? 'bg-blue-100 border-2 border-blue-300 shadow-md' : 'bg-gray-50'
                          }`}
                          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                            entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                            entry.rank === 3 ? 'bg-orange-300 text-orange-800' :
                            'bg-gray-200 text-gray-600'
                          }`}>{entry.rank}</div>
                          <span className="text-lg">{entry.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-gray-800 truncate">{entry.name}</div>
                            <div className="text-[10px] text-gray-500">{entry.missionsCompleted} missions</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xs text-yellow-600">{entry.xp} XP</div>
                            <div className="flex items-center gap-0.5 text-[10px] text-orange-500">
                              <Flame className="w-2.5 h-2.5" />{entry.streak}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI Activity Insights Tab */}
              {sidebarTab === 'activity' && (
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-purple-500" /> Activity Insights
                    </h3>
                    <div className="space-y-3">
                      {aiInsights.map((insight, i) => (
                        <motion.div key={i} className="bg-gray-50 rounded-2xl p-3 border border-gray-100 hover:border-blue-200 transition-all"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{insight.icon}</span>
                            <div>
                              <div className="font-bold text-sm text-gray-900">{insight.title}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{insight.desc}</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {/* Weekly Activity Chart */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1"><BarChart className="w-4 h-4" /> This Week</h4>
                      <div className="flex items-end gap-1 h-20">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                          const height = [40, 65, 30, 80, 55, 20, 0][i]
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <motion.div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                                initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: i * 0.1, duration: 0.5 }} />
                              <span className="text-[10px] font-bold text-gray-500">{day}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Badges Tab */}
              {sidebarTab === 'badges' && (
                <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-purple-500" /> Badges ({badges.filter(b => b.earned).length}/{badges.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {badges.map((badge, i) => (
                        <motion.div key={i} className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                          badge.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md border border-yellow-200' : 'bg-gray-50 opacity-50 grayscale'
                        }`}
                          whileHover={badge.earned ? { scale: 1.1 } : {}} title={badge.desc}>
                          <span className="text-2xl mb-1">{badge.icon}</span>
                          <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{badge.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Share Tab */}
              {sidebarTab === 'share' && (
                <motion.div key="share" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                      <Share2 className="w-5 h-5 text-blue-500" /> Share Achievements
                    </h3>
                    <div className="space-y-3">
                      {/* Shareable stats card */}
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                        </div>
                        <div className="relative z-10 text-center">
                          <div className="text-3xl mb-2">🗺️</div>
                          <div className="text-xl font-extrabold mb-1">My BrailleQuest Stats</div>
                          <div className="flex justify-center gap-4 mt-3">
                            <div><div className="text-lg font-extrabold">{userStats.xp}</div><div className="text-[10px] text-blue-200">XP</div></div>
                            <div><div className="text-lg font-extrabold">{userStats.missions}</div><div className="text-[10px] text-blue-200">Missions</div></div>
                            <div><div className="text-lg font-extrabold">{userStats.streak}</div><div className="text-[10px] text-blue-200">Streak</div></div>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleShare(`I've completed ${userStats.missions} missions and earned ${userStats.xp} XP on BrailleQuest!`)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm">
                        <Share2 className="w-4 h-4" /> Share My Progress
                      </button>
                      <button onClick={() => handleShare(`I'm on a ${userStats.streak}-day streak on BrailleQuest! Join me in discovering braille accessibility!`)}
                        className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-sm">
                        <Flame className="w-4 h-4" /> Share My Streak
                      </button>
                    </div>
                  </div>

                  {/* Community Impact */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-5 text-white mt-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                      <Globe className="w-5 h-5" /> Community Impact
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { val: '1,247', label: 'Signs Found' },
                        { val: '89', label: 'Cities Mapped' },
                        { val: '3,420', label: 'Active Explorers' },
                        { val: '156', label: 'Businesses Informed' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                          <div className="text-xl font-extrabold">{stat.val}</div>
                          <div className="text-[10px] text-blue-200">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Achievements Tab */}
              {sidebarTab === 'achievements' && (
                <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                      <Trophy className="w-5 h-5 text-yellow-500" /> Achievements ({unlockedAchievements}/{achievementsList.length})
                    </h3>
                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: 'Unlocked', value: unlockedAchievements, icon: '✅' },
                        { label: 'XP Earned', value: achievementsList.filter(a => a.unlocked).reduce((s, a) => s + a.xpReward, 0), icon: '⭐' },
                        { label: 'In Progress', value: achievementsList.filter(a => !a.unlocked && a.progress > 0).length, icon: '🔄' },
                      ].map(s => (
                        <div key={s.label} className="bg-gray-50 rounded-xl p-2 text-center">
                          <div className="text-sm">{s.icon}</div>
                          <div className="text-sm font-extrabold text-gray-900">{s.value}</div>
                          <div className="text-[10px] text-gray-500">{s.label}</div>
                        </div>
                      ))}
                    </div>
                    {/* Category filter */}
                    <div className="flex gap-1 flex-wrap mb-3">
                      <button onClick={() => setAchievementCategoryFilter(null)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${!achievementCategoryFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
                      {achievementCategories.map(cat => (
                        <button key={cat.id} onClick={() => setAchievementCategoryFilter(cat.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${achievementCategoryFilter === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {cat.emoji} {cat.name}
                        </button>
                      ))}
                    </div>
                    {/* Achievement list */}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {filteredAchievements.map((a, i) => {
                        const colors = rarityColors[a.rarity]
                        const pct = (a.progress / a.maxProgress) * 100
                        return (
                          <motion.div key={a.id} className={`p-3 rounded-2xl border-2 transition-all ${a.unlocked ? colors.border + ' bg-white' : 'border-gray-200 opacity-75'}`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`p-1.5 rounded-lg ${a.unlocked ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-200'}`}>
                                {a.unlocked ? <a.icon className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-gray-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-xs text-gray-900 truncate">{a.title}</span>
                                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${colors.bg} ${colors.text}`}>{a.rarity}</span>
                                </div>
                                <div className="text-[10px] text-gray-500">{a.description}</div>
                              </div>
                              <span className="text-[10px] font-bold text-yellow-600 whitespace-nowrap">+{a.xpReward}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`h-1.5 rounded-full bg-gradient-to-r ${colors.gradient}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between mt-0.5">
                              <span className="text-[9px] text-gray-400">{a.requirement}</span>
                              <span className="text-[9px] font-bold text-gray-600">{a.progress}/{a.maxProgress}</span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Rewards Shop Tab */}
              {sidebarTab === 'rewards' && (
                <motion.div key="rewards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-5">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-purple-500" /> Rewards Shop
                    </h3>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-3 text-white mb-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-blue-200">Your Balance</div>
                        <div className="text-lg font-extrabold flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> {userStats.xp} XP</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-white/10 rounded-lg px-2 py-1 text-center">
                          <div className="text-sm font-bold">{rewardItems.filter(r => r.owned).length}</div>
                          <div className="text-[9px] text-blue-200">Owned</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                      {rewardItems.map((item, i) => {
                        const canAfford = userStats.xp >= item.cost
                        return (
                          <motion.div key={item.id} className={`p-3 rounded-2xl border-2 transition-all ${item.owned ? 'border-green-300 bg-green-50' : canAfford ? 'border-blue-200' : 'border-gray-200 opacity-60'}`}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{item.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xs text-gray-900">{item.name}</div>
                                <div className="text-[10px] text-gray-500">{item.description}</div>
                                <div className="text-[9px] text-gray-400">{item.category}</div>
                              </div>
                              {item.owned ? (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600"><CheckCircle className="w-3 h-3" /> Owned</span>
                              ) : (
                                <button className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${canAfford ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`} disabled={!canAfford}>
                                  {item.cost} XP
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mission Modal */}
      <AnimatePresence>
        {showMissionModal && selectedMission && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => verifyStatus === 'idle' && resetSubmission()}>
            <motion.div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-t-3xl text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                </div>
                <button onClick={resetSubmission} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
                  <X className="w-5 h-5" />
                </button>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">{selectedMission.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedMission.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full text-xs font-bold">
                        <Star className="w-3 h-3" /> {selectedMission.xpReward} XP
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        selectedMission.difficulty === 'easy' ? 'bg-green-500 text-white' :
                        selectedMission.difficulty === 'medium' ? 'bg-yellow-500 text-yellow-900' :
                        selectedMission.difficulty === 'hard' ? 'bg-red-500 text-white' :
                        'bg-purple-500 text-white'
                      }`}>{selectedMission.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{selectedMission.description}</p>
                {selectedMission.bonusObjective && (
                  <div className="bg-purple-50 rounded-xl p-3 mb-4 border border-purple-100">
                    <span className="text-sm font-bold text-purple-700 flex items-center gap-1"><Star className="w-4 h-4" /> Bonus: {selectedMission.bonusObjective}</span>
                  </div>
                )}
                {verifyStatus === 'idle' && (
                  <>
                    <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all ${preview ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                      {preview ? (
                        <div className="space-y-3">
                          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-lg" />
                          {fileCoords && (
                            <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                              <MapPin className="w-4 h-4" />{fileCoords.latitude?.toFixed(4)}, {fileCoords.longitude?.toFixed(4)}
                            </div>
                          )}
                          <button onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-red-500 hover:text-red-600">Remove</button>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Take a photo of braille in the wild!</p>
                          <label className="inline-block">
                            <input type="file" accept="image/*" capture="environment" className="hidden"
                              onChange={e => handleFileChange(e.target.files?.[0] ?? null)} />
                            <span className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full cursor-pointer hover:bg-blue-700 inline-flex items-center gap-2">
                              <Upload className="w-5 h-5" /> Upload Photo
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                    {preview && (
                      <Button onClick={handleSubmit} className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-full text-lg shadow-lg">
                        Submit for Verification
                      </Button>
                    )}
                  </>
                )}
                {verifyStatus === 'uploading' && (
                  <div className="text-center py-8">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">Uploading your photo...</p>
                  </div>
                )}
                {verifyStatus === 'verifying' && (
                  <div className="text-center py-8">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl mb-4">🤖</motion.div>
                    <p className="text-gray-800 font-bold text-lg mb-2">Analyzing your photo...</p>
                    <p className="text-gray-500 text-sm">Checking for braille patterns</p>
                    <div className="mt-4 flex justify-center gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-3 h-3 bg-blue-500 rounded-full"
                          animate={{ y: [-4, 4, -4] }} transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }} />
                      ))}
                    </div>
                  </div>
                )}
                {verifyStatus === 'success' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-7xl mb-4">🎉</motion.div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Mission Complete!</h3>
                    <p className="text-gray-600 mb-4">{verifyReason || 'Great find!'}</p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 inline-block">
                      <div className="flex items-center gap-3">
                        <Star className="w-8 h-8 text-yellow-500" />
                        <span className="text-3xl font-bold text-yellow-700">+{selectedMission.xpReward} XP</span>
                      </div>
                    </motion.div>
                    <div className="flex gap-3 mt-6">
                      <Button onClick={() => handleShare(`Just completed "${selectedMission.title}" and earned ${selectedMission.xpReward} XP!`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                      </Button>
                      <Button onClick={resetSubmission} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-full">
                        Continue
                      </Button>
                    </div>
                  </motion.div>
                )}
                {verifyStatus === 'failure' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
                    <div className="text-6xl mb-4">😅</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Not quite...</h3>
                    <p className="text-gray-600 mb-4">{verifyReason || "We couldn't verify braille in this photo. Try again with a clearer image!"}</p>
                    <div className="bg-blue-50 rounded-xl p-4 text-left mb-6">
                      <h4 className="font-bold text-blue-800 mb-2">Tips:</h4>
                      <ul className="space-y-1 text-sm text-blue-700">
                        <li>• Good lighting</li><li>• Get close to the braille</li><li>• Avoid blurry images</li><li>• Capture the entire text</li>
                      </ul>
                    </div>
                    <Button onClick={() => setVerifyStatus('idle')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full">
                      Try Again
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
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
                <p className="text-sm text-gray-800">{shareAchievement}</p>
                <p className="text-xs text-blue-600 mt-2">#BrailleQuest #Accessibility</p>
              </div>
              <div className="flex gap-3">
                <button onClick={shareToClipboard} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm">
                  📋 Copy to Clipboard
                </button>
                <button onClick={() => setShowShareModal(false)} className="px-4 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
