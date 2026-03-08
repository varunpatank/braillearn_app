import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
  Share2, Plus, X,
  Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Bookmark,
  Flame, Trophy, TrendingUp, Copy, ThumbsUp, Smile, Star, Zap
} from 'lucide-react';

// ─── Types ───
interface Story {
  id: string;
  username: string;
  avatar: string;
  caption: string;
  timestamp: string;
  seen: boolean;
  streak?: number;
  badge?: string;
}

interface ScheduleBlock {
  time: string;
  lesson: string;
  type: 'lesson' | 'practice' | 'break' | 'review';
}

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface Post {
  id: string;
  username: string;
  avatar: string;
  timestamp: string;
  schedule: ScheduleBlock[];
  caption: string;
  reactions: Reaction[];
  saved: boolean;
  image?: string;
  streak?: number;
  badge?: string;
  lessonsCompleted?: number;
}

// ─── Mock Data ───
const mockStories: Story[] = [
  { id: 'your-story', username: 'Your Story', avatar: '', caption: '', timestamp: '', seen: false },
  { id: 's1', username: 'alex_reads', avatar: '🧑‍🦱', caption: 'Starting Grade 2 today!', timestamp: '2h ago', seen: false, streak: 14, badge: '🔥' },
  { id: 's2', username: 'braille_bee', avatar: '🐝', caption: 'Day 30 streak!', timestamp: '4h ago', seen: false, streak: 30, badge: '🏆' },
  { id: 's3', username: 'tactile_pro', avatar: '👩‍🏫', caption: 'Teaching contractions', timestamp: '5h ago', seen: true, streak: 45, badge: '⭐' },
  { id: 's4', username: 'dot_master', avatar: '⠿', caption: 'Perfect score!', timestamp: '6h ago', seen: true, streak: 22 },
  { id: 's5', username: 'learn_braille', avatar: '📚', caption: 'New lesson unlocked', timestamp: '7h ago', seen: false, streak: 8 },
  { id: 's6', username: 'quest_hero', avatar: '🦸', caption: 'Found elevator braille!', timestamp: '8h ago', seen: true, streak: 12 },
  { id: 's7', username: 'study_buddy', avatar: '🤝', caption: 'Group study session', timestamp: '9h ago', seen: true, streak: 5 },
  { id: 's8', username: 'braille_art', avatar: '🎨', caption: 'Created braille art', timestamp: '10h ago', seen: false, streak: 19 },
];

const REACTION_OPTIONS = ['👏', '🔥', '💪', '🎉', '💡', '❤️'];

const mockPosts: Post[] = [
  {
    id: 'p1', username: 'alex_reads', avatar: '🧑‍🦱', timestamp: '2 hours ago',
    streak: 14, badge: '🔥', lessonsCompleted: 28,
    schedule: [
      { time: '9:00 AM', lesson: 'Grade 2 Contractions', type: 'lesson' },
      { time: '9:30 AM', lesson: 'Speed Challenge', type: 'practice' },
      { time: '10:00 AM', lesson: 'Break', type: 'break' },
      { time: '10:15 AM', lesson: 'Numbers & Punctuation', type: 'lesson' },
      { time: '10:45 AM', lesson: 'Review Session', type: 'review' },
    ],
    caption: "Starting my Grade 2 journey today! 📖 Excited to learn contractions. Who else is working on this?",
    reactions: [
      { emoji: '🔥', count: 12, reacted: false },
      { emoji: '👏', count: 8, reacted: true },
      { emoji: '💪', count: 5, reacted: false },
    ],
    saved: false,
  },
  {
    id: 'p2', username: 'braille_bee', avatar: '🐝', timestamp: '4 hours ago',
    streak: 30, badge: '🏆', lessonsCompleted: 64,
    schedule: [
      { time: '8:00 AM', lesson: 'Alphabet Review', type: 'review' },
      { time: '8:30 AM', lesson: 'Memory Champion', type: 'practice' },
      { time: '9:00 AM', lesson: 'Grade 1 Numbers', type: 'lesson' },
      { time: '9:30 AM', lesson: 'Coffee Break ☕', type: 'break' },
      { time: '9:45 AM', lesson: 'Word Builder', type: 'practice' },
    ],
    caption: "30 day streak! 🔥 Consistency is key. Here's my morning routine.",
    reactions: [
      { emoji: '🔥', count: 32, reacted: true },
      { emoji: '🎉', count: 18, reacted: false },
      { emoji: '❤️', count: 6, reacted: false },
    ],
    saved: true,
  },
  {
    id: 'p3', username: 'tactile_pro', avatar: '👩‍🏫', timestamp: '5 hours ago',
    streak: 45, badge: '⭐', lessonsCompleted: 120,
    schedule: [
      { time: '2:00 PM', lesson: 'Teaching: Intro to Braille', type: 'lesson' },
      { time: '3:00 PM', lesson: 'Student Q&A', type: 'review' },
      { time: '3:30 PM', lesson: 'Live Practice Session', type: 'practice' },
      { time: '4:00 PM', lesson: 'Lesson Planning', type: 'break' },
    ],
    caption: "Teaching afternoon session today. Love seeing students get their first contractions right! 💡",
    reactions: [
      { emoji: '❤️', count: 24, reacted: false },
      { emoji: '💡', count: 15, reacted: false },
      { emoji: '👏', count: 9, reacted: false },
    ],
    saved: false,
  },
];

const trendingSchedules = [
  { user: 'braille_bee', avatar: '🐝', title: 'Morning Power Routine', blocks: 5, adopted: 142, streak: 30 },
  { user: 'tactile_pro', avatar: '👩‍🏫', title: 'Teaching Prep Flow', blocks: 4, adopted: 89, streak: 45 },
  { user: 'dot_master', avatar: '⠿', title: 'Speed Drill Session', blocks: 6, adopted: 67, streak: 22 },
];

const weeklyLeaders = [
  { rank: 1, user: 'braille_bee', avatar: '🐝', xp: 2450, streak: 30 },
  { rank: 2, user: 'tactile_pro', avatar: '👩‍🏫', xp: 2180, streak: 45 },
  { rank: 3, user: 'alex_reads', avatar: '🧑‍🦱', xp: 1890, streak: 14 },
  { rank: 4, user: 'dot_master', avatar: '⠿', xp: 1720, streak: 22 },
  { rank: 5, user: 'quest_hero', avatar: '🦸', xp: 1560, streak: 12 },
];

const typeColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  lesson: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  practice: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
  break: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  review: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
};

// ─── Component ───
const CommunityPage: React.FC = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState(mockPosts);
  const [stories] = useState(mockStories);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newSchedule, setNewSchedule] = useState<ScheduleBlock[]>([
    { time: '9:00 AM', lesson: '', type: 'lesson' },
  ]);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [copiedSchedule, setCopiedSchedule] = useState<string | null>(null);
  const storiesRef = useRef<HTMLDivElement>(null);

  const scrollStories = (dir: 'left' | 'right') => {
    storiesRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const toggleReaction = (postId: string, emoji: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const existing = p.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...p,
          reactions: p.reactions.map(r =>
            r.emoji === emoji ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted } : r
          ).filter(r => r.count > 0 || r.reacted)
        };
      }
      return { ...p, reactions: [...p.reactions, { emoji, count: 1, reacted: true }] };
    }));
    setShowReactionPicker(null);
  };

  const toggleSave = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    ));
  };

  const copySchedule = (postId: string) => {
    setCopiedSchedule(postId);
    setTimeout(() => setCopiedSchedule(null), 2000);
  };

  const createPost = () => {
    if (!newCaption.trim() || newSchedule.every(s => !s.lesson.trim())) return;
    const post: Post = {
      id: `p${Date.now()}`, username: user?.firstName || 'You', avatar: '⭐',
      timestamp: 'Just now',
      schedule: newSchedule.filter(s => s.lesson.trim()),
      caption: newCaption,
      reactions: [], saved: false,
    };
    setPosts(prev => [post, ...prev]);
    setShowNewPost(false);
    setNewCaption('');
    setNewSchedule([{ time: '9:00 AM', lesson: '', type: 'lesson' }]);
  };

  const addScheduleBlock = () => {
    setNewSchedule(prev => [...prev, { time: '', lesson: '', type: 'lesson' }]);
  };

  const updateScheduleBlock = (i: number, field: keyof ScheduleBlock, value: string) => {
    setNewSchedule(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const removeScheduleBlock = (i: number) => {
    setNewSchedule(prev => prev.filter((_, idx) => idx !== i));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Community</h1>
              <p className="text-blue-200 mt-1 text-lg">See what fellow learners are studying, share your schedule, and stay motivated</p>
            </div>
            <motion.button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-2xl font-bold shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Plus className="w-5 h-5" /> Share Your Schedule
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stories Row */}
        <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 py-5">
          <button onClick={() => scrollStories('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 border border-gray-200">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => scrollStories('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 border border-gray-200">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <div ref={storiesRef} className="flex gap-5 px-8 overflow-x-auto scrollbar-hide">
            {stories.map(story => (
              <motion.button
                key={story.id}
                onClick={() => story.id !== 'your-story' && setViewingStory(story)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <div className="relative">
                  <div className={`w-[68px] h-[68px] rounded-full flex items-center justify-center text-2xl ${
                    story.id === 'your-story'
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300'
                      : story.seen
                        ? 'bg-gray-100 ring-[3px] ring-gray-200'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-100 ring-[3px] ring-gradient-to-r ring-indigo-500'
                  }`} style={!story.seen && story.id !== 'your-story' ? { boxShadow: '0 0 0 3px #6366f1' } : {}}>
                    {story.id === 'your-story' ? (
                      <Plus className="w-6 h-6 text-gray-400" />
                    ) : (
                      story.avatar
                    )}
                  </div>
                  {story.streak && story.streak >= 7 && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                      {story.badge || '🔥'}
                    </div>
                  )}
                </div>
                <span className={`text-xs max-w-[72px] truncate ${story.id === 'your-story' ? 'text-gray-500' : story.seen ? 'text-gray-400' : 'text-gray-900 font-semibold'}`}>
                  {story.username}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content: Feed + Sidebar */}
        <div className="flex gap-6">
          {/* Left: Feed */}
          <div className="flex-1 min-w-0 space-y-5">
            {posts.map(post => (
              <motion.article
                key={post.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-xl ring-2 ring-indigo-500/20">
                        {post.avatar}
                      </div>
                      {post.streak && post.streak >= 7 && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-orange-500 text-[8px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                          🔥
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{post.username}</p>
                        {post.badge && <span className="text-xs">{post.badge}</span>}
                        {post.streak && post.streak >= 7 && (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">
                            {post.streak}d streak
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{post.timestamp}{post.lessonsCompleted ? ` · ${post.lessonsCompleted} lessons` : ''}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Caption above schedule */}
                <div className="px-5 pb-3">
                  <p className="text-[15px] text-gray-800 leading-relaxed">
                    <span className="font-bold mr-1">{post.username}</span>
                    {post.caption}
                  </p>
                </div>

                {/* Schedule Card */}
                <div className="px-5 pb-4">
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50/50 rounded-2xl border border-gray-200/80 overflow-hidden">
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/80" />
                        <span className="text-xs font-bold text-white tracking-wide uppercase">Today's Schedule</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/60 font-medium">{post.schedule.length} blocks</span>
                        <motion.button
                          onClick={() => copySchedule(post.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-[10px] font-bold text-white transition-colors"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Copy className="w-3 h-3" />
                          {copiedSchedule === post.id ? 'Copied!' : 'Use this'}
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {post.schedule.map((block, i) => {
                        const tc = typeColors[block.type];
                        return (
                          <motion.div
                            key={i}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${tc.bg} border ${tc.border} transition-all`}
                            whileHover={{ x: 4 }}
                          >
                            <div className={`w-2 h-2 rounded-full ${tc.dot} flex-shrink-0`} />
                            <span className="text-xs font-mono text-gray-500 w-16 flex-shrink-0">{block.time}</span>
                            <span className={`text-sm font-semibold ${tc.text} flex-1`}>{block.lesson}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${tc.text} opacity-50`}>{block.type}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Reactions Row */}
                <div className="px-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Existing reactions */}
                      {post.reactions.map(r => (
                        <motion.button
                          key={r.emoji}
                          onClick={() => toggleReaction(post.id, r.emoji)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                            r.reacted
                              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300 shadow-sm'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                          whileTap={{ scale: 1.15 }}
                        >
                          <span className="text-base">{r.emoji}</span>
                          <span className="text-xs font-bold">{r.count}</span>
                        </motion.button>
                      ))}
                      {/* Add reaction button */}
                      <div className="relative">
                        <motion.button
                          onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all"
                          whileTap={{ scale: 0.95 }}
                        >
                          <Smile className="w-4 h-4" />
                          <Plus className="w-3 h-3" />
                        </motion.button>
                        <AnimatePresence>
                          {showReactionPicker === post.id && (
                            <motion.div
                              className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 flex gap-1 z-20"
                              initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.9 }}
                            >
                              {REACTION_OPTIONS.map(emoji => (
                                <motion.button
                                  key={emoji}
                                  onClick={() => toggleReaction(post.id, emoji)}
                                  className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-lg transition-colors"
                                  whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}
                                >
                                  {emoji}
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => {/* share */}}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        whileTap={{ scale: 0.9 }}
                      >
                        <Share2 className="w-5 h-5 text-gray-400" />
                      </motion.button>
                      <motion.button
                        onClick={() => toggleSave(post.id)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        whileTap={{ scale: 1.2 }}
                      >
                        <Bookmark className={`w-5 h-5 ${post.saved ? 'fill-indigo-600 text-indigo-600' : 'text-gray-400'}`} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-5 flex-shrink-0">
            {/* Trending Schedules */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">Trending Schedules</h3>
              </div>
              <div className="p-3 space-y-1">
                {trendingSchedules.map((s, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    whileHover={{ x: 3 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-lg">
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{s.title}</p>
                      <p className="text-xs text-gray-400">{s.user} · {s.blocks} blocks</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-bold text-indigo-600">{s.adopted}</p>
                      <p className="text-[10px] text-gray-400">adopted</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Weekly Leaderboard */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Weekly Leaderboard</h3>
              </div>
              <div className="p-3 space-y-0.5">
                {weeklyLeaders.map((l) => (
                  <div key={l.rank} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className={`w-6 text-center font-extrabold text-sm ${
                      l.rank === 1 ? 'text-amber-500' : l.rank === 2 ? 'text-gray-400' : l.rank === 3 ? 'text-orange-400' : 'text-gray-300'
                    }`}>
                      {l.rank <= 3 ? ['🥇', '🥈', '🥉'][l.rank - 1] : `#${l.rank}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center text-base">
                      {l.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{l.user}</p>
                      <p className="text-[10px] text-gray-400">{l.streak}d streak</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                      <Zap className="w-3 h-3" />
                      {l.xp.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 text-white">
              <h3 className="text-sm font-bold mb-3 opacity-90">Your Activity</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Streak', value: '7d', icon: Flame },
                  { label: 'Lessons', value: '24', icon: Star },
                  { label: 'Reactions', value: '48', icon: ThumbsUp },
                  { label: 'Shared', value: '3', icon: Share2 },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl px-3 py-3 text-center">
                    <s.icon className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <p className="text-lg font-extrabold">{s.value}</p>
                    <p className="text-[10px] opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewingStory(null)}
          >
            <motion.div
              className="relative w-full max-w-sm mx-auto bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl overflow-hidden"
              style={{ height: '80vh' }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div className="absolute top-2 left-4 right-4 h-1 bg-white/20 rounded-full z-20">
                <motion.div className="h-full bg-white rounded-full" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} />
              </div>
              {/* Header */}
              <div className="absolute top-5 left-0 right-0 px-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl border border-white/30">
                    {viewingStory.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{viewingStory.username}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-white/60 text-[10px]">{viewingStory.timestamp}</p>
                      {viewingStory.streak && (
                        <span className="text-[10px] font-bold text-orange-300">🔥 {viewingStory.streak}d</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => setViewingStory(null)} className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Story Content */}
              <div className="flex items-center justify-center h-full px-8">
                <div className="text-center">
                  <div className="text-6xl mb-6">{viewingStory.avatar}</div>
                  <p className="text-white text-2xl font-extrabold mb-3">{viewingStory.caption}</p>
                  <p className="text-white/50 text-sm">{viewingStory.username}</p>
                  {viewingStory.streak && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm font-bold">{viewingStory.streak} day streak</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowNewPost(false)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-extrabold text-gray-900">Share Your Schedule</h2>
                <button onClick={() => setShowNewPost(false)} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Schedule Blocks */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">Today's Schedule</label>
                  <div className="space-y-2">
                    {newSchedule.map((block, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text" value={block.time}
                          onChange={e => updateScheduleBlock(i, 'time', e.target.value)}
                          placeholder="9:00 AM"
                          className="w-24 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                        <input
                          type="text" value={block.lesson}
                          onChange={e => updateScheduleBlock(i, 'lesson', e.target.value)}
                          placeholder="Lesson name"
                          className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                        <select
                          value={block.type}
                          onChange={e => updateScheduleBlock(i, 'type', e.target.value)}
                          className="px-2.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-500 outline-none bg-white"
                        >
                          <option value="lesson">Lesson</option>
                          <option value="practice">Practice</option>
                          <option value="review">Review</option>
                          <option value="break">Break</option>
                        </select>
                        {newSchedule.length > 1 && (
                          <button onClick={() => removeScheduleBlock(i)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={addScheduleBlock} className="mt-3 flex items-center gap-1 text-sm text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                    <Plus className="w-4 h-4" /> Add block
                  </button>
                </div>

                {/* Caption */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">Caption</label>
                  <textarea
                    value={newCaption}
                    onChange={e => setNewCaption(e.target.value)}
                    placeholder="What's your learning focus today?"
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all"
                    rows={3}
                  />
                </div>

                <motion.button
                  onClick={createPost}
                  disabled={!newCaption.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl disabled:opacity-50 transition-all"
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                >
                  Share Schedule
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunityPage;
