import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from '@/components/motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title as ChartTitle, Tooltip, Legend, Filler,
  RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Users, BookOpen, Video, Plus, Play, X, Star,
  Activity, Sparkles, GraduationCap,
  Megaphone, Award, ChevronRight, Copy, Check, Search,
  Grid, Trash2, ArrowLeft, BarChart3, TrendingUp,
  Eye, Globe, Calendar, Upload, Shield,
  Clock, Target, Brain, Flame, PieChart, LineChart,
  UserPlus, FileText, Hash, Bell, CheckCircle2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/react';
import { useSupabase } from '@/hooks/useSupabase';
import {
  createCourse, getMyCourses, getPublicCourses, enrollInCourse,
  unenrollFromCourse, getMyEnrollments, updateCourse, getCourseEnrollments,
  Course, Enrollment
} from '@/services/dbService';
import {
  getTutors, becomeTutor, getMyTutorProfile,
  createMeetingRoom, getLiveMeetings, endMeeting, joinMeeting, leaveMeeting,
  createDiagram, getCourseDiagrams, deleteDiagram,
  createCustomLesson, getMyCustomLessons, deleteCustomLesson,
  getCourseAnnouncements, createAnnouncement,
  getStudentProgress, getCourseAnalytics,
  TutorProfile, MeetingRoom as MeetingRoomType, BrailleDiagram, CustomLesson,
  Announcement, StudentCourseProgress, ClassAnalytics
} from '@/services/classHubService';
import BrailleDiagramEditor from '@/components/BrailleDiagramEditor';
import MeetingRoom from '@/components/MeetingRoom';
import LessonCreator from '@/components/LessonCreator';
import { showSuccessConfetti } from '@/utils/confetti';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, ChartTitle, Tooltip, Legend, Filler, RadialLinearScale);

const PRESET_COURSES: (Course & { _preset?: true; _enrolled_count?: number; _rating?: number; _creator_name?: string })[] = [
  {
    id: 'preset-1', creator_id: 'system', title: 'Braille Foundations: Letters A–Z',
    description: 'Master the entire English braille alphabet with interactive dot-pattern drills, audio feedback, and spaced repetition. Perfect for absolute beginners.',
    image_url: null, level: 'beginner', category: 'Literacy', is_public: true, max_students: 50,
    tags: ['alphabet', 'beginner', 'interactive'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-01-15T10:00:00Z', updated_at: '2025-03-01T10:00:00Z', _preset: true, _enrolled_count: 128, _rating: 4.9, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-2', creator_id: 'system', title: 'Grade 2 Braille Contractions',
    description: 'Learn 189 contractions used in Grade 2 (Unified English Braille). Includes word-sign drills, short-form exercises, and real-world reading passages.',
    image_url: null, level: 'intermediate', category: 'Contractions', is_public: true, max_students: 40,
    tags: ['grade-2', 'UEB', 'contractions'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-10T10:00:00Z', updated_at: '2025-03-05T10:00:00Z', _preset: true, _enrolled_count: 87, _rating: 4.8, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-3', creator_id: 'system', title: 'Braille Music Notation',
    description: 'Read and write music in braille! Covers note values, rests, key signatures, dynamics, and full musical scores using internationally standardized braille music code.',
    image_url: null, level: 'advanced', category: 'Music', is_public: true, max_students: 25,
    tags: ['music', 'notation', 'advanced'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-01-20T10:00:00Z', updated_at: '2025-03-08T10:00:00Z', _preset: true, _enrolled_count: 34, _rating: 4.7, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-4', creator_id: 'system', title: 'Braille Math: Nemeth Code Basics',
    description: 'Introduction to Nemeth Braille Code for mathematics. Learn numbers, operators, fractions, exponents, and Greek letters in braille.',
    image_url: null, level: 'intermediate', category: 'STEM', is_public: true, max_students: 35,
    tags: ['math', 'nemeth', 'STEM'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-01T10:00:00Z', updated_at: '2025-03-06T10:00:00Z', _preset: true, _enrolled_count: 56, _rating: 4.6, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-5', creator_id: 'system', title: 'Speed Reading Braille',
    description: 'Build reading fluency through timed exercises, common word recognition, and progressive difficulty passages. Track WPM and accuracy over time.',
    image_url: null, level: 'intermediate', category: 'Fluency', is_public: true, max_students: 60,
    tags: ['speed', 'fluency', 'practice'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-01-25T10:00:00Z', updated_at: '2025-03-04T10:00:00Z', _preset: true, _enrolled_count: 92, _rating: 4.8, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-6', creator_id: 'system', title: 'Braille for Educators',
    description: 'Designed for sighted teachers and paraprofessionals. Learn to read, write, and transcribe braille so you can support visually impaired students in your classroom.',
    image_url: null, level: 'beginner', category: 'Education', is_public: true, max_students: 100,
    tags: ['teachers', 'education', 'transcription'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-14T10:00:00Z', updated_at: '2025-03-07T10:00:00Z', _preset: true, _enrolled_count: 213, _rating: 4.9, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-7', creator_id: 'system', title: 'Computer Braille Code',
    description: 'Learn braille representations for programming symbols, email addresses, URLs, and file paths. Essential for tech-savvy braille readers.',
    image_url: null, level: 'advanced', category: 'Technology', is_public: true, max_students: 30,
    tags: ['tech', 'computer', 'programming'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-20T10:00:00Z', updated_at: '2025-03-09T10:00:00Z', _preset: true, _enrolled_count: 41, _rating: 4.5, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-8', creator_id: 'system', title: 'Braille Writing Workshop',
    description: 'Practice writing braille using a slate & stylus, Perkins brailler, and digital tools. Includes handwriting exercises, formatting rules, and transcription practice.',
    image_url: null, level: 'beginner', category: 'Writing', is_public: true, max_students: 45,
    tags: ['writing', 'slate', 'workshop'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-01-30T10:00:00Z', updated_at: '2025-03-02T10:00:00Z', _preset: true, _enrolled_count: 76, _rating: 4.7, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-9', creator_id: 'system', title: 'World Languages in Braille',
    description: 'Explore braille codes for Spanish, French, German, and Mandarin (Chinese braille). Compare adaptations and practice multilingual reading.',
    image_url: null, level: 'advanced', category: 'Languages', is_public: true, max_students: 20,
    tags: ['languages', 'international', 'multilingual'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-05T10:00:00Z', updated_at: '2025-03-03T10:00:00Z', _preset: true, _enrolled_count: 29, _rating: 4.4, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-10', creator_id: 'system', title: 'Braille Science Notation',
    description: 'Chemistry formulas, physics equations, and biology terms in braille. Uses both Nemeth and UEB Technical for scientific content.',
    image_url: null, level: 'advanced', category: 'STEM', is_public: true, max_students: 30,
    tags: ['science', 'chemistry', 'physics'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-18T10:00:00Z', updated_at: '2025-03-08T10:00:00Z', _preset: true, _enrolled_count: 22, _rating: 4.6, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-11', creator_id: 'system', title: 'Kids Braille Adventures',
    description: 'Fun, gamified braille lessons for children ages 5–12. Features animated characters, treasure hunts, and rewards that make learning braille exciting!',
    image_url: null, level: 'beginner', category: 'Kids', is_public: true, max_students: 80,
    tags: ['kids', 'gamified', 'fun'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-01-10T10:00:00Z', updated_at: '2025-03-09T10:00:00Z', _preset: true, _enrolled_count: 164, _rating: 5.0, _creator_name: 'BrailLearn Team',
  },
  {
    id: 'preset-12', creator_id: 'system', title: 'Refreshable Braille Displays',
    description: 'Hands-on guide to using refreshable braille display hardware — setup, pairing with screen readers, navigation gestures, and troubleshooting.',
    image_url: null, level: 'intermediate', category: 'Hardware', is_public: true, max_students: 35,
    tags: ['hardware', 'displays', 'assistive-tech'], curriculum: [], meeting_link: null, schedule: null,
    created_at: '2025-02-22T10:00:00Z', updated_at: '2025-03-07T10:00:00Z', _preset: true, _enrolled_count: 48, _rating: 4.7, _creator_name: 'BrailLearn Team',
  },
];

const CARD_GRADIENTS = [
  'from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600', 'from-cyan-500 to-blue-600', 'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600', 'from-indigo-500 to-purple-600', 'from-teal-500 to-emerald-600',
  'from-fuchsia-500 to-purple-600', 'from-green-500 to-lime-600', 'from-sky-500 to-indigo-600',
];

const CARD_ICONS = [BookOpen, Brain, Activity, Target, Flame, GraduationCap, Sparkles, FileText, Globe, Award, Star, Shield];

const COURSE_LESSON_MAP: Record<string, { title: string; desc: string }[]> = {
  'preset-1': [
    { title: 'The Braille Cell: Your 6-Dot Canvas', desc: 'Understand the 2×3 grid that forms every braille character. Identify dots 1-6 by position.' },
    { title: 'Letters A through E', desc: 'Your first five letters using just dots 1, 2, 4, and 5. The building blocks of everything.' },
    { title: 'Letters F through J', desc: 'Add more dot combinations. Notice the pattern — F-J mirror A-E with dot 4 added.' },
    { title: 'Letters K through O', desc: 'The second decade: K-O are A-E plus dot 3. Recognize the elegant repetition.' },
    { title: 'Letters P through T', desc: 'Five more letters. P-T follow F-J plus dot 3. You now know 20 letters!' },
    { title: 'Letters U through Z', desc: 'Complete your alphabet. U-Z introduce dot 6 for the final group of letters.' },
    { title: 'The Number Indicator & Digits 1-0', desc: 'Learn how ⠼ (dots 3-4-5-6) turns letters A-J into numbers 1 through 0.' },
    { title: 'Essential Punctuation Marks', desc: 'Period, comma, question mark, exclamation point, semicolon, and colon in braille.' },
    { title: 'Capital Letters & Formatting', desc: 'The capital indicator ⠠ and how uppercase works in braille text.' },
    { title: 'Reading Your First Sentences', desc: 'Combine everything — read complete sentences with letters, numbers, and punctuation.' },
    { title: 'Writing Practice: Slate & Stylus', desc: 'Learn right-to-left writing technique with a traditional slate and stylus.' },
    { title: 'Alphabet Speed Drills', desc: 'Timed exercises to build instant recognition of all 26 letters.' },
  ],
  'preset-2': [
    { title: 'Grade 1 vs. Grade 2 Braille', desc: 'Understand why contractions exist and how they make braille reading faster and more compact.' },
    { title: 'Alphabetic Word Signs (A-M)', desc: 'Single-letter shortcuts: b=but, c=can, d=do, e=every, f=from, g=go, h=have, j=just, k=knowledge, l=like, m=more.' },
    { title: 'Alphabetic Word Signs (N-Z)', desc: 'Remaining word signs: n=not, p=people, q=quite, r=rather, s=so, t=that, u=us, v=very, w=will, x=it, y=you, z=as.' },
    { title: 'Strong Contractions: AND, FOR, OF, THE, WITH', desc: 'Five essential two-cell contractions used constantly in UEB braille text.' },
    { title: 'Short-Form Words Part 1', desc: 'Abbreviations like "ab" for about, "abv" for above, "ac" for according, "acr" for across.' },
    { title: 'Short-Form Words Part 2', desc: 'More short-forms: "af" for after, "afn" for afternoon, "ag" for again, "agst" for against.' },
    { title: 'Initial-Letter Contractions with Dots 4-5', desc: 'Contractions starting with ⠘: "upon", "word", "these", "those", "whose".' },
    { title: 'Initial-Letter Contractions with Dots 4-5-6', desc: 'Contractions starting with ⠸: "cannot", "many", "spirit", "their", "world".' },
    { title: 'Final-Letter Groupsigns', desc: 'Endings like -ment, -ness, -tion, -sion, -ity that contract to single cells.' },
    { title: 'Reading Real Text: News Articles', desc: 'Apply all contractions to read genuine news stories transcribed in Grade 2.' },
    { title: 'Transcription Workshop', desc: 'Convert print English to fully contracted Grade 2 braille following UEB rules.' },
  ],
  'preset-3': [
    { title: 'History of Braille Music', desc: 'From Louis Braille\'s original 1829 system to the modern international braille music code.' },
    { title: 'Note Values: Whole, Half & Quarter', desc: 'Read whole notes (⠝), half notes (⠞), and quarter notes (⠹) in braille music.' },
    { title: 'Eighth & Sixteenth Notes', desc: 'Faster note values and how they combine. Beam groups and counting in braille.' },
    { title: 'Rests & Silence', desc: 'Whole rest through sixteenth rest symbols. Music breathes through its silences.' },
    { title: 'Key Signatures & Accidentals', desc: 'Sharps ⠩, flats ⠣, naturals, and how key signatures appear at the start of a piece.' },
    { title: 'Time Signatures & Bar Lines', desc: 'Common, cut, and complex time signatures. Bar lines and double bar lines.' },
    { title: 'Intervals & In-Accord Notation', desc: 'Reading chords and simultaneous notes using interval signs.' },
    { title: 'Dynamics & Expression Marks', desc: 'Piano (p), forte (f), crescendo, diminuendo, accents, and fermatas.' },
    { title: 'Repeat Signs & Navigation', desc: 'Da capo, dal segno, codas, repeat bars, and first/second endings.' },
    { title: 'Reading a Complete Piano Piece', desc: 'Put it all together — read a full piano composition with both hands.' },
  ],
  'preset-4': [
    { title: 'Introduction to Nemeth Code', desc: 'Why mathematics needs its own braille code and how Nemeth differs from literary braille.' },
    { title: 'Nemeth Numbers & Decimal Points', desc: 'Numbers 0-9 in Nemeth (different from literary!), decimals, and the numeric indicator.' },
    { title: 'Basic Arithmetic Operators', desc: 'Plus (+), minus (−), times (×), divided by (÷), and equals (=) in Nemeth.' },
    { title: 'Fractions: Simple & Complex', desc: 'Simple fractions like ½, complex fractions, mixed numbers, and fraction indicators.' },
    { title: 'Exponents & Superscripts', desc: 'Powers, squared, cubed, and the superscript indicator for any exponent.' },
    { title: 'Subscripts & Chemical Formulas', desc: 'Subscript notation for math and basic chemical formulas like H₂O.' },
    { title: 'Radical Expressions & Roots', desc: 'Square roots, cube roots, nth roots, and nested radical expressions.' },
    { title: 'Greek Letters & Constants', desc: 'Alpha (α), beta (β), pi (π), sigma (σ), theta (θ) and other mathematical symbols.' },
    { title: 'Algebraic Equations', desc: 'Write and read complete algebraic equations: variables, coefficients, and expressions.' },
    { title: 'Geometry Symbols', desc: 'Angles, degrees, parallel, perpendicular, congruent, and similar in Nemeth braille.' },
  ],
  'preset-5': [
    { title: 'Baseline Assessment', desc: 'Measure your current braille reading speed (WPM) and accuracy to set improvement goals.' },
    { title: 'Common Word Recognition', desc: 'Flash-drill the 100 most frequent English words in braille for instant recognition.' },
    { title: 'Finger Tracking Technique', desc: 'Proper hand positioning, pressure, and scanning patterns for efficient braille reading.' },
    { title: 'Two-Hand Reading Method', desc: 'Advanced technique: left hand finds the next line while right hand finishes the current one.' },
    { title: 'Contraction Speed Drills', desc: 'Timed exercises focused on rapid recognition of Grade 2 contractions.' },
    { title: 'Phrase Recognition Patterns', desc: 'Read common phrases as units instead of individual words: "in the", "of the", "it was".' },
    { title: 'Short Passage Sprints', desc: 'Timed readings of 50-100 word passages. Track WPM improvement over attempts.' },
    { title: 'Comprehension Under Speed', desc: 'Maintain reading comprehension while increasing speed. Answer questions after timed reads.' },
    { title: 'Long-Form Reading Endurance', desc: 'Build stamina with 500+ word passages. Sustained reading without fatigue.' },
    { title: 'Speed Reading Challenge Final', desc: 'Put it all together — aim for your personal best WPM with 95%+ accuracy.' },
  ],
  'preset-6': [
    { title: 'Why Educators Need Braille', desc: 'Understanding the role of braille literacy in inclusive education for visually impaired students.' },
    { title: 'The Braille Alphabet for Sighted Readers', desc: 'Learn to visually read braille cells. Identify all 26 letters on sight.' },
    { title: 'Reading Braille by Touch (Simulated)', desc: 'Exercises using tactile cards and blindfold practice to understand the student experience.' },
    { title: 'Classroom Materials: Transcription Basics', desc: 'Convert worksheets, handouts, and tests to braille using transcription rules.' },
    { title: 'Technology for Braille Education', desc: 'Screen readers, refreshable displays, embossers, and note-takers used in classrooms.' },
    { title: 'Adapting Math & Science Content', desc: 'Nemeth code overview for educators — how to make STEM accessible in braille.' },
    { title: 'IEP Goals & Braille Assessments', desc: 'Setting measurable braille literacy goals in Individual Education Programs.' },
    { title: 'Creating an Inclusive Classroom', desc: 'Physical layout, peer interaction, and universal design for learning with braille students.' },
    { title: 'Working with TVIs & Specialists', desc: 'Collaborating with Teachers of the Visually Impaired and orientation & mobility specialists.' },
    { title: 'Parent Communication & Resources', desc: 'Equipping families with braille resources and strategies to support learning at home.' },
    { title: 'Capstone: Prepare a Braille Lesson Plan', desc: 'Design a complete lesson plan that integrates braille for a mainstream classroom.' },
  ],
  'preset-7': [
    { title: 'What is Computer Braille?', desc: 'How CBC differs from literary braille — one-to-one mapping for every ASCII character.' },
    { title: 'Uppercase & Lowercase Letters', desc: 'Computer braille distinguishes case. Learn the dot-6 prefix for uppercase.' },
    { title: 'Digits & Special Number Handling', desc: 'Numbers in computer braille use dropped-number positions without a numeric indicator.' },
    { title: 'Programming Symbols: Brackets & Braces', desc: 'Parentheses (), square brackets [], curly braces {}, and angle brackets <> in braille.' },
    { title: 'Operators & Punctuation for Code', desc: 'Semicolons, colons, dots, equals, plus, minus, asterisk, slash, backslash, pipe.' },
    { title: 'Email Addresses & URLs', desc: 'The @ sign, forward slashes, periods in domains, and how to read web addresses.' },
    { title: 'File Paths & Extensions', desc: 'Backslashes in Windows paths, forward slashes in Unix, and common file extensions.' },
    { title: 'Reading Source Code in Braille', desc: 'Practice reading Python, JavaScript, and HTML code rendered in computer braille.' },
    { title: 'Terminal & Command Line Braille', desc: 'Navigate command prompts, read error messages, and use CLI tools with braille.' },
    { title: 'Coding Project: Build a Simple App', desc: 'Write a complete small program using only braille input and screen reader output.' },
  ],
  'preset-8': [
    { title: 'History of Braille Writing Tools', desc: 'From Louis Braille\'s original board to modern electronic braillers.' },
    { title: 'The Slate & Stylus: Setup', desc: 'Choosing your slate, loading paper correctly, and positioning for right-to-left writing.' },
    { title: 'Mirror Writing Technique', desc: 'Master the core skill: writing braille right-to-left so it reads correctly left-to-right.' },
    { title: 'Slate Practice: Letters A-M', desc: 'Write the first 13 letters repeatedly until muscle memory develops.' },
    { title: 'Slate Practice: Letters N-Z', desc: 'Complete the alphabet. Focus on accuracy before speed with the stylus.' },
    { title: 'The Perkins Brailler', desc: 'Learn the 6-key layout, paper loading, spacing, and line advance on a Perkins brailler.' },
    { title: 'Perkins Speed Writing', desc: 'Build typing speed on the Perkins brailler with timed word and sentence exercises.' },
    { title: 'Digital Writing: Braille Keyboards', desc: 'Use braille keyboard apps and Bluetooth braille displays for digital text entry.' },
    { title: 'Formatting Rules', desc: 'Paragraphs, headings, page numbers, margins, and other braille formatting standards.' },
    { title: 'Creative Writing in Braille', desc: 'Write a short story or poem directly in braille. Focus on flow and expression.' },
    { title: 'Transcription Exercise: Print to Braille', desc: 'Transcribe a full page of print text to properly formatted braille.' },
  ],
  'preset-9': [
    { title: 'How Braille Adapts to Languages', desc: 'Every language has its own braille code. Understand the principles of adaptation.' },
    { title: 'Spanish Braille (Estenografía)', desc: 'Spanish-specific characters: ñ, accented vowels (á, é, í, ó, ú), ¿, ¡, and contractions.' },
    { title: 'French Braille (Antoine)', desc: 'French accents in braille: é, è, ê, ë, ç, and the French contraction system.' },
    { title: 'German Braille (Blindenschrift)', desc: 'Umlauts (ä, ö, ü), eszett (ß), and German Grade 2 contractions.' },
    { title: 'Chinese Braille (现行盲文)', desc: 'Mandarin uses phonetic braille based on Pinyin. Tones, initials, and finals.' },
    { title: 'Arabic Braille (البرايل)', desc: 'Right-to-left braille: Arabic letter forms, diacritics, and numbers.' },
    { title: 'Japanese Braille (点字)', desc: 'Katakana-based braille with vowel-consonant combinations and special markers.' },
    { title: 'Comparing Braille Systems', desc: 'Side-by-side comparison of how different languages solve similar problems in braille.' },
    { title: 'Multilingual Reading Challenge', desc: 'Read short passages in 3+ languages. Identify which braille code is being used.' },
  ],
  'preset-10': [
    { title: 'Science Braille vs. Nemeth vs. UEB Tech', desc: 'Compare the three systems used for scientific content in braille worldwide.' },
    { title: 'Chemical Element Symbols', desc: 'Single and double-letter chemical symbols in braille: H, He, Li, Be, B, C, N, O, etc.' },
    { title: 'Chemical Formulas & Bonds', desc: 'Write H₂O, CO₂, NaCl, and understand single, double, and triple bond notation.' },
    { title: 'Chemical Equations & Reactions', desc: 'Balance equations with reaction arrows, catalysts, states of matter, and yields.' },
    { title: 'Physics: Units & Measurements', desc: 'SI units (m, kg, s, A, K, mol, cd) and derived units (N, J, W, Pa) in braille.' },
    { title: 'Physics Equations', desc: 'F=ma, E=mc², v=d/t, and other fundamental physics formulas in braille.' },
    { title: 'Biology Terminology', desc: 'Scientific nomenclature, genus/species italics, and biological process notation.' },
    { title: 'Scientific Diagrams in Braille', desc: 'Tactile graphics conventions: labeled diagrams, graphs, and data tables.' },
    { title: 'Lab Report Writing in Braille', desc: 'Structure and format a complete scientific lab report using proper braille conventions.' },
    { title: 'Advanced: Organic Chemistry Structures', desc: 'Represent benzene rings, functional groups, and molecular structures in braille.' },
  ],
  'preset-11': [
    { title: 'Meet Dotty the Braille Bug!', desc: 'Our friendly guide introduces the magical world of braille dots. Touch, feel, and explore!' },
    { title: 'Treasure Hunt: Find the Letters!', desc: 'A fun scavenger hunt learning letters A-F through a pirate treasure adventure.' },
    { title: 'Animal Alphabet: G through L', desc: 'Each letter is paired with an animal friend. G-Giraffe, H-Hippo, I-Iguana, J-Jaguar, K-Koala, L-Lion.' },
    { title: 'Space Explorer: Letters M through R', desc: 'Blast off! Learn M-R through a space mission where each letter unlocks a new planet.' },
    { title: 'Underwater Adventure: S through Z', desc: 'Dive deep to discover the final letters with sea creatures as your guides.' },
    { title: 'Number Ninjas: Counting 1-10', desc: 'Become a number ninja! Learn braille numbers through martial arts-themed mini-games.' },
    { title: 'Braille Bingo!', desc: 'Play bingo with braille letters and numbers. Fun multiplayer game to practice recognition.' },
    { title: 'Story Time: Read Along', desc: 'Read short stories together with audio narration. Tap braille cells to hear each word.' },
    { title: 'Creative Corner: Write Your Name', desc: 'Learn to write your own name in braille! Create a personalized braille nameplate.' },
    { title: 'Dot Detective Mystery', desc: 'Solve a fun mystery by decoding braille clues. Each clue leads to the next!' },
    { title: 'Braille Champion Challenge', desc: 'Final challenge — show off everything you\'ve learned with games, quizzes, and prizes!' },
  ],
  'preset-12': [
    { title: 'What is a Refreshable Braille Display?', desc: 'How piezoelectric pins create dynamic braille cells. Types, sizes, and manufacturers.' },
    { title: 'Choosing Your Display', desc: 'Compare popular models: Focus, Brailliant, Orbit, and VarioUltra. Features and prices.' },
    { title: 'Setup & Bluetooth Pairing', desc: 'Connect your display to iOS, Android, Windows, or Mac via Bluetooth or USB.' },
    { title: 'JAWS + Braille Display', desc: 'Configure JAWS screen reader with your display. Navigation keys and cursor routing.' },
    { title: 'NVDA + Braille Display', desc: 'Free screen reader NVDA setup. Braille output tables, input gestures, and focus tracking.' },
    { title: 'VoiceOver + Braille (Apple)', desc: 'Use braille displays with iPhone, iPad, and Mac. VoiceOver braille commands.' },
    { title: 'TalkBack + BrailleBack (Android)', desc: 'Android braille display support. Navigation, text input, and app switching.' },
    { title: 'Braille Note-Taking', desc: 'Use your display as a standalone note-taker. Create, edit, and organize documents.' },
    { title: 'Web Browsing in Braille', desc: 'Navigate websites, fill forms, and read articles using your braille display.' },
    { title: 'Troubleshooting Common Issues', desc: 'Fix pairing problems, cell display errors, driver conflicts, and firmware updates.' },
  ],
};

function makePresetLessons(courseId: string, _courseTitle: string, level: string): CustomLesson[] {
  const p = PRESET_COURSES.find(c => c.id === courseId);
  const category = p?.category || 'Literacy';
  const baseDur = level === 'beginner' ? 10 : level === 'intermediate' ? 15 : 20;
  const chapterList = COURSE_LESSON_MAP[courseId] || COURSE_LESSON_MAP['preset-1'];

  return chapterList.map((ch, i) => ({
    id: `${courseId}-lesson-${i}`,
    creator_id: 'system',
    course_id: courseId,
    title: `Ch ${i + 1}: ${ch.title}`,
    description: ch.desc,
    level: level === 'beginner' ? 1 : level === 'intermediate' ? 2 : 3,
    category,
    duration: baseDur + i * 2 + Math.floor(i / 3) * 3,
    exercises: Array.from({ length: 3 + (i % 4) + Math.floor(i / 4) }, (_, j) => ({
      type: ['multiple-choice', 'dot-pattern', 'typing', 'matching', 'fill-blank', 'audio-recognition'][j % 6],
      question: `Exercise ${j + 1} for ${ch.title}`,
      points: 10 + j * 5,
    })),
    ai_generated: i % 3 === 0,
    ai_prompt: i % 3 === 0 ? `Generate braille exercises for: ${ch.title}` : null,
    source_diagram_id: null,
    is_published: true,
    tags: [category.toLowerCase(), level],
    created_at: new Date(2025, 0, 15 + i * 3).toISOString(),
    updated_at: new Date(2025, 2, 1 + i).toISOString(),
  }));
}

function makePresetDiagrams(courseId: string, _level: string): BrailleDiagram[] {
  const dotMap: Record<string, number[]> = {
    A: [1], B: [1, 2], C: [1, 4], D: [1, 4, 5], E: [1, 5], F: [1, 2, 4], G: [1, 2, 4, 5],
    H: [1, 2, 5], I: [2, 4], J: [2, 4, 5], K: [1, 3], L: [1, 2, 3], M: [1, 3, 4],
    N: [1, 3, 4, 5], O: [1, 3, 5], P: [1, 2, 3, 4], Q: [1, 2, 3, 4, 5], R: [1, 2, 3, 5],
    S: [2, 3, 4], T: [2, 3, 4, 5], U: [1, 3, 6], V: [1, 2, 3, 6], W: [2, 4, 5, 6],
    X: [1, 3, 4, 6], Y: [1, 3, 4, 5, 6], Z: [1, 3, 5, 6],
    '#': [3, 4, 5, 6], '.': [2, 5, 6], ',': [2], '?': [2, 3, 6], '!': [2, 3, 5],
    ';': [2, 3], ':': [2, 5], '"': [2, 3, 5, 6], "'": [3], '-': [3, 6],
    '⠁': [1], '⠂': [2], '⠄': [3], '⠈': [4], '⠐': [5], '⠠': [6],
    CAP: [6], NUM: [3, 4, 5, 6],
    AND: [1, 2, 3, 4, 6], FOR: [1, 2, 3, 4, 5, 6], OF: [1, 2, 3, 5, 6], THE: [2, 3, 4, 6], WITH: [2, 3, 4, 5, 6],
    CH: [1, 6], GH: [1, 2, 6], SH: [1, 4, 6], TH: [1, 4, 5, 6], WH: [1, 5, 6],
    ED: [1, 2, 4, 6], ER: [1, 2, 4, 5, 6], OU: [1, 2, 5, 6], OW: [2, 4, 6],
    ST: [3, 4], AR: [3, 4, 5], ING: [3, 4, 6],
    '+': [3, 4, 6], '=': [1, 2, 3, 4, 5, 6], '×': [1, 6], '÷': [3, 4],
    '(': [1, 2, 6], ')': [3, 4, 5],
    SHARP: [1, 4, 6], FLAT: [1, 2, 6], NATURAL: [1, 6],
  };

  const diagrams: Record<string, { title: string; desc: string; chars: { c: string; label: string }[] }[]> = {
    'preset-1': [
      { title: 'Letters A–J', desc: 'First 10 letters using dots 1, 2, 4, 5 only', chars: 'ABCDEFGHIJ'.split('').map(c => ({ c, label: c })) },
      { title: 'Letters K–T', desc: 'Middle letters — K-O add dot 3 to A-E; P-T add dot 3 to F-J', chars: 'KLMNOPQRST'.split('').map(c => ({ c, label: c })) },
      { title: 'Letters U–Z', desc: 'Final 6 letters introducing dot 6', chars: 'UVWXYZ'.split('').map(c => ({ c, label: c })) },
      { title: 'Numbers 0–9', desc: 'Number indicator ⠼ followed by letters A-J', chars: [{ c: 'NUM', label: '⠼' }, ...'ABCDEFGHIJ'.split('').map((c, i) => ({ c, label: `${(i + 1) % 10}` }))] },
      { title: 'Essential Punctuation', desc: 'Period, comma, question mark, exclamation, semicolon, colon', chars: ['.', ',', '?', '!', ';', ':'].map(c => ({ c, label: c })) },
      { title: 'Capital Indicator', desc: 'Dot 6 signals the next letter is uppercase', chars: [{ c: 'CAP', label: '⠠' }, { c: 'A', label: 'A' }, { c: 'B', label: 'B' }, { c: 'H', label: 'H' }] },
    ],
    'preset-2': [
      { title: 'Strong Contractions', desc: 'AND, FOR, OF, THE, WITH — five essential single-cell contractions', chars: [{ c: 'AND', label: 'AND' }, { c: 'FOR', label: 'FOR' }, { c: 'OF', label: 'OF' }, { c: 'THE', label: 'THE' }, { c: 'WITH', label: 'WITH' }] },
      { title: 'Alphabetic Word Signs', desc: 'Single letters that stand for whole words in Grade 2', chars: [{ c: 'B', label: 'but' }, { c: 'C', label: 'can' }, { c: 'D', label: 'do' }, { c: 'E', label: 'every' }, { c: 'G', label: 'go' }, { c: 'H', label: 'have' }, { c: 'K', label: 'knowledge' }, { c: 'L', label: 'like' }] },
      { title: 'Groupsigns: CH, SH, TH, WH', desc: 'Two-letter combinations represented by single braille cells', chars: [{ c: 'CH', label: 'CH' }, { c: 'SH', label: 'SH' }, { c: 'TH', label: 'TH' }, { c: 'WH', label: 'WH' }, { c: 'GH', label: 'GH' }] },
      { title: 'Final Groupsigns', desc: 'Endings: -ED, -ER, -OU, -OW, -ST, -AR, -ING', chars: [{ c: 'ED', label: '-ED' }, { c: 'ER', label: '-ER' }, { c: 'OU', label: '-OU' }, { c: 'OW', label: '-OW' }, { c: 'ST', label: '-ST' }, { c: 'AR', label: '-AR' }, { c: 'ING', label: '-ING' }] },
    ],
    'preset-3': [
      { title: 'Note Values', desc: 'Whole, half, quarter, eighth notes in braille music', chars: [{ c: 'N', label: '𝅝' }, { c: 'O', label: '𝅗𝅥' }, { c: 'P', label: '♩' }, { c: 'Q', label: '♪' }] },
      { title: 'Music Accidentals', desc: 'Sharp, flat, and natural signs', chars: [{ c: 'SHARP', label: '♯' }, { c: 'FLAT', label: '♭' }, { c: 'NATURAL', label: '♮' }] },
      { title: 'Pitch Letters C–B', desc: 'The seven pitch names in braille music notation', chars: [{ c: 'D', label: 'C' }, { c: 'E', label: 'D' }, { c: 'F', label: 'E' }, { c: 'G', label: 'F' }, { c: 'H', label: 'G' }, { c: 'I', label: 'A' }, { c: 'J', label: 'B' }] },
    ],
    'preset-4': [
      { title: 'Nemeth Digits 0–9', desc: 'Number representations in Nemeth code (differ from literary)', chars: [{ c: 'J', label: '0' }, { c: 'A', label: '1' }, { c: 'B', label: '2' }, { c: 'C', label: '3' }, { c: 'D', label: '4' }, { c: 'E', label: '5' }, { c: 'F', label: '6' }, { c: 'G', label: '7' }, { c: 'H', label: '8' }, { c: 'I', label: '9' }] },
      { title: 'Arithmetic Operators', desc: 'Plus, minus, times, divide, equals in Nemeth braille', chars: [{ c: '+', label: '+' }, { c: '-', label: '−' }, { c: '×', label: '×' }, { c: '÷', label: '÷' }, { c: '=', label: '=' }] },
      { title: 'Grouping Symbols', desc: 'Parentheses and fraction indicators', chars: [{ c: '(', label: '(' }, { c: ')', label: ')' }] },
    ],
    'preset-5': [
      { title: 'Top 20 Sight Words', desc: 'Most frequent English words for rapid braille recognition', chars: 'THE AND FOR YOU NOT'.split('').filter(c => c !== ' ').map(c => ({ c, label: c })) },
      { title: 'Common Contractions Speed Drill', desc: 'Practice instant recognition of frequent contractions', chars: [{ c: 'AND', label: 'AND' }, { c: 'THE', label: 'THE' }, { c: 'FOR', label: 'FOR' }, { c: 'WITH', label: 'WITH' }, { c: 'OF', label: 'OF' }, { c: 'ST', label: 'ST' }, { c: 'ING', label: 'ING' }, { c: 'ED', label: 'ED' }] },
    ],
    'preset-6': [
      { title: 'Full Braille Alphabet', desc: 'All 26 letters for educators to learn visual braille reading', chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => ({ c, label: c })) },
      { title: 'Braille Cell Positions', desc: 'The 6 dot positions: 1-2-3 left column, 4-5-6 right column', chars: [{ c: '⠁', label: 'Dot 1' }, { c: '⠂', label: 'Dot 2' }, { c: '⠄', label: 'Dot 3' }, { c: '⠈', label: 'Dot 4' }, { c: '⠐', label: 'Dot 5' }, { c: '⠠', label: 'Dot 6' }] },
      { title: 'Formatting Indicators', desc: 'Capital, number, and letter indicators used in UEB', chars: [{ c: 'CAP', label: 'Capital' }, { c: 'NUM', label: 'Number' }] },
    ],
    'preset-7': [
      { title: 'Programming Brackets', desc: 'Parentheses, square brackets, curly braces, angle brackets', chars: [{ c: '(', label: '(' }, { c: ')', label: ')' }, { c: 'K', label: '[' }, { c: 'L', label: ']' }, { c: 'M', label: '{' }, { c: 'N', label: '}' }] },
      { title: 'Code Operators', desc: 'Equals, plus, minus, asterisk, slash for programming', chars: [{ c: '=', label: '=' }, { c: '+', label: '+' }, { c: '-', label: '-' }, { c: '.', label: '.' }, { c: ':', label: ':' }, { c: ';', label: ';' }] },
      { title: 'Uppercase & Lowercase', desc: 'Computer braille distinguishes case with dot-6 prefix', chars: [{ c: 'CAP', label: '⠠' }, { c: 'A', label: 'A' }, { c: 'A', label: 'a' }, { c: 'B', label: 'B' }, { c: 'B', label: 'b' }] },
    ],
    'preset-8': [
      { title: 'Slate Writing: A–M (Mirrored)', desc: 'Right-to-left dot positions for slate writing', chars: 'ABCDEFGHIJKLM'.split('').map(c => ({ c, label: c })) },
      { title: 'Slate Writing: N–Z (Mirrored)', desc: 'Complete the mirrored alphabet for slate mastery', chars: 'NOPQRSTUVWXYZ'.split('').map(c => ({ c, label: c })) },
      { title: 'Perkins Brailler Keys', desc: 'Key layout: 3-2-1 Space 4-5-6 (left to right)', chars: [{ c: '⠄', label: 'Key 3' }, { c: '⠂', label: 'Key 2' }, { c: '⠁', label: 'Key 1' }, { c: '⠈', label: 'Key 4' }, { c: '⠐', label: 'Key 5' }, { c: '⠠', label: 'Key 6' }] },
    ],
    'preset-9': [
      { title: 'Spanish Braille Characters', desc: 'Ñ and accented vowels unique to Spanish braille', chars: [{ c: 'N', label: 'Ñ' }, { c: 'A', label: 'Á' }, { c: 'E', label: 'É' }, { c: 'I', label: 'Í' }, { c: 'O', label: 'Ó' }, { c: 'U', label: 'Ú' }] },
      { title: 'French Braille Accents', desc: 'French-specific accented characters in braille', chars: [{ c: 'E', label: 'É' }, { c: 'A', label: 'È' }, { c: 'I', label: 'Ê' }, { c: 'O', label: 'Ë' }, { c: 'C', label: 'Ç' }] },
      { title: 'German Braille Umlauts', desc: 'Ä, Ö, Ü, and ß in German braille code', chars: [{ c: 'A', label: 'Ä' }, { c: 'O', label: 'Ö' }, { c: 'U', label: 'Ü' }, { c: 'S', label: 'ß' }] },
    ],
    'preset-10': [
      { title: 'Chemical Elements', desc: 'Common element symbols in braille: H, O, C, N, Na, Fe', chars: [{ c: 'H', label: 'H' }, { c: 'O', label: 'O' }, { c: 'C', label: 'C' }, { c: 'N', label: 'N' }] },
      { title: 'Math & Chemistry Operators', desc: 'Plus, arrow, equals for chemical equations', chars: [{ c: '+', label: '+' }, { c: '=', label: '→' }, { c: '(', label: '(' }, { c: ')', label: ')' }] },
      { title: 'SI Unit Symbols', desc: 'Meter, kilogram, second, ampere in braille', chars: [{ c: 'M', label: 'm' }, { c: 'K', label: 'kg' }, { c: 'S', label: 's' }, { c: 'A', label: 'A' }] },
    ],
    'preset-11': [
      { title: 'My First Letters: A–F', desc: 'Meet your first braille friends! Six simple letters to start', chars: 'ABCDEF'.split('').map(c => ({ c, label: c })) },
      { title: 'Animal Alphabet: G–L', desc: 'G-Giraffe, H-Hippo, I-Iguana, J-Jaguar, K-Koala, L-Lion', chars: [{ c: 'G', label: '🦒 G' }, { c: 'H', label: '🦛 H' }, { c: 'I', label: '🦎 I' }, { c: 'J', label: '🐆 J' }, { c: 'K', label: '🐨 K' }, { c: 'L', label: '🦁 L' }] },
      { title: 'Numbers for Ninjas: 1–5', desc: 'Learn to count with braille number power!', chars: [{ c: 'NUM', label: '⠼' }, { c: 'A', label: '1' }, { c: 'B', label: '2' }, { c: 'C', label: '3' }, { c: 'D', label: '4' }, { c: 'E', label: '5' }] },
    ],
    'preset-12': [
      { title: 'Navigation Keys', desc: 'Common braille display navigation: pan left/right, cursor routing', chars: [{ c: 'A', label: '◀ Pan' }, { c: 'B', label: 'Pan ▶' }, { c: 'C', label: 'Route' }, { c: 'D', label: 'Home' }] },
      { title: 'Braille Cell Layout', desc: 'Dot positions 1-6 as displayed on a refreshable braille cell', chars: [{ c: '⠁', label: 'Dot 1' }, { c: '⠂', label: 'Dot 2' }, { c: '⠄', label: 'Dot 3' }, { c: '⠈', label: 'Dot 4' }, { c: '⠐', label: 'Dot 5' }, { c: '⠠', label: 'Dot 6' }] },
    ],
  };

  const courseDiagrams = diagrams[courseId] || diagrams['preset-1'];

  return courseDiagrams.map((d, i) => ({
    id: `${courseId}-diagram-${i}`,
    creator_id: 'system',
    course_id: courseId,
    title: d.title,
    description: d.desc,
    diagram_type: 'custom' as const,
    cells: d.chars.map(ch => ({ dots: dotMap[ch.c] || [1], char: ch.c, label: ch.label })),
    layout: { columns: Math.min(d.chars.length, 10) },
    tags: ['reference'],
    is_public: true,
    thumbnail_url: null,
    created_at: new Date(2025, 0, 20 + i * 5).toISOString(),
    updated_at: new Date(2025, 2, 1 + i).toISOString(),
  }));
}

const DEMO_STUDENT_NAMES = [
  'Alex Rivera', 'Jamie Chen', 'Sam Patel', 'Morgan Lee', 'Taylor Brooks',
  'Jordan Kim', 'Casey Martinez', 'Riley Ahmed', 'Quinn Okafor', 'Avery Singh',
  'Dakota Reeves', 'Skylar Nakamura', 'Charlie Dubois', 'Harper Stone', 'Emerson Park',
  'Rowan Fitzgerald', 'Sage Kwan', 'Nico Alvarez', 'Jules Tanaka', 'Phoenix Gray',
  'Elliot Sato', 'Remy Osei', 'Blair Vasquez', 'Finley Chang', 'Lennox Ibrahim',
];

function makePresetStudents(courseId: string, count: number): StudentCourseProgress[] {
  const lessons = COURSE_LESSON_MAP[courseId] || COURSE_LESSON_MAP['preset-1'];
  const totalLessons = lessons.length;
  const seed = courseId.charCodeAt(courseId.length - 1) + courseId.charCodeAt(courseId.length - 2) * 7;
  const actualCount = Math.min(count, 25);

  return Array.from({ length: actualCount }, (_, i) => {
    const s = (seed + i * 37) % 100;
    const completed = Math.min(totalLessons, 1 + Math.floor((s / 100) * totalLessons * 0.8) + Math.floor(i / 5));
    const avgScore = 55 + Math.floor((s + i * 3) % 40);
    return {
      id: `${courseId}-student-${i}`,
      course_id: courseId,
      user_id: `demo-user-${courseId}-${i}`,
      lessons_completed: completed,
      assignments_completed: Math.floor(completed * 0.4),
      total_score: completed * avgScore,
      avg_score: avgScore,
      time_spent_seconds: completed * (900 + (s % 600)),
      current_streak: Math.max(0, (s + i * 2) % 18),
      skills: {
        letterRecognition: Math.min(95, 25 + Math.floor(completed / totalLessons * 65) + (s % 10)),
        wordReading: Math.min(90, 15 + Math.floor(completed / totalLessons * 55) + ((s + 5) % 12)),
        sentenceReading: Math.min(85, 10 + Math.floor(completed / totalLessons * 50) + ((s + 3) % 15)),
        contractions: Math.min(80, 10 + Math.floor(completed / totalLessons * 45) + ((s + 7) % 10)),
        speed: Math.min(88, 15 + Math.floor(completed / totalLessons * 50) + ((s + 2) % 13)),
        writing: Math.min(85, 20 + Math.floor(completed / totalLessons * 55) + ((s + 9) % 11)),
      },
      last_activity_at: new Date(Date.now() - (i % 7) * 86400000 - (s % 12) * 3600000).toISOString(),
      profile: { display_name: DEMO_STUDENT_NAMES[i % DEMO_STUDENT_NAMES.length], avatar_url: '' },
    };
  });
}

function makePresetAnalytics(courseId: string, days: number): ClassAnalytics[] {
  const p = PRESET_COURSES.find(c => c.id === courseId);
  const totalEnrolled = p?._enrolled_count || 20;
  const lessons = COURSE_LESSON_MAP[courseId] || COURSE_LESSON_MAP['preset-1'];
  const totalLessons = lessons.length;
  const analytics: ClassAnalytics[] = [];
  const seed = courseId.charCodeAt(courseId.length - 1) * 3;

  for (let d = days; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const progress = (days - d) / days;
    const enrolled = Math.floor(totalEnrolled * (0.3 + progress * 0.7));
    const activeRate = 0.55 + progress * 0.25 + ((seed + d) % 10) / 100;
    const scoreBase = 58 + progress * 22 + ((seed + d * 3) % 8);
    const completionBase = 15 + progress * 45 + ((seed + d * 2) % 10);

    analytics.push({
      id: `${courseId}-analytics-${d}`,
      course_id: courseId,
      snapshot_date: date.toISOString().split('T')[0],
      total_enrolled: enrolled,
      active_students: Math.floor(enrolled * Math.min(0.95, activeRate)),
      avg_score: Math.min(95, Math.floor(scoreBase)),
      avg_progress: Math.min(90, Math.floor(15 + progress * 60 + ((seed + d) % 12))),
      completion_rate: Math.min(85, Math.floor(completionBase)),
      attendance_rate: Math.min(98, Math.floor(60 + progress * 25 + ((seed + d * 5) % 10))),
      lessons_completed: Math.floor(enrolled * Math.min(totalLessons, 1 + progress * totalLessons * 0.6)),
      assignments_submitted: Math.floor(enrolled * progress * 0.4),
      meeting_minutes: Math.floor(20 + progress * 80 + ((seed + d) % 30)),
    });
  }
  return analytics;
}

function makePresetAnnouncements(courseId: string, courseTitle: string): Announcement[] {
  return [
    { id: `${courseId}-ann-1`, course_id: courseId, author_id: 'system', title: `Welcome to ${courseTitle}!`, content: 'We are excited to have you in this class. Start with Chapter 1 and work at your own pace. Feel free to use the voice assistant for help!', priority: 'high', pinned: true, attachments: [], created_at: '2025-03-01T10:00:00Z', updated_at: '2025-03-01T10:00:00Z' },
    { id: `${courseId}-ann-2`, course_id: courseId, author_id: 'system', title: 'New Practice Exercises Added', content: 'We have added 15 new interactive exercises to chapters 2, 3, and 4. These include audio-guided dot-pattern drills and timed reading challenges.', priority: 'normal', pinned: false, attachments: [], created_at: '2025-03-05T14:00:00Z', updated_at: '2025-03-05T14:00:00Z' },
    { id: `${courseId}-ann-3`, course_id: courseId, author_id: 'system', title: 'Live Study Session This Friday', content: 'Join us for a live Q&A and group practice session this Friday at 4 PM EST. We will review common mistakes and answer your questions.', priority: 'normal', pinned: false, attachments: [], created_at: '2025-03-08T09:00:00Z', updated_at: '2025-03-08T09:00:00Z' },
  ];
}

const PRESET_ENROLLMENT_KEY = 'braillearn-preset-enrolled';
function getStoredPresetEnrollments(): Set<string> {
  try {
    const raw = localStorage.getItem(PRESET_ENROLLMENT_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}
function savePresetEnrollments(ids: Set<string>) {
  localStorage.setItem(PRESET_ENROLLMENT_KEY, JSON.stringify([...ids]));
}

function FloatingBrailleDots() {
  const dots = React.useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.5 + 3) % 100}%`,
    top: `${(i * 7.3 + 5) % 100}%`,
    size: 4 + (i % 4) * 2,
    delay: (i * 0.3) % 4,
    duration: 6 + (i % 5) * 2,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {dots.map(d => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-blue-400/10"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function AnimatedBrailleCell({ char, delay = 0 }: { char: string; delay?: number }) {
  const dotMap: Record<string, number[]> = {
    B: [1, 2], R: [1, 2, 3, 5], A: [1], I: [2, 4], L: [1, 2, 3],
    E: [1, 5], N: [1, 3, 4, 5], '⠃': [1, 2], '⠗': [1, 2, 3, 5],
  };
  const active = dotMap[char] || [1, 3, 5];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      className="inline-flex flex-col gap-0.5 p-1"
    >
      {[0, 1, 2].map(row => (
        <div key={row} className="flex gap-0.5">
          {[0, 1].map(col => {
            const dotNum = row + 1 + col * 3;
            const isActive = active.includes(dotNum);
            return (
              <motion.div
                key={col}
                className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                animate={isActive ? { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] } : {}}
                transition={{ duration: 2, delay: delay + dotNum * 0.1, repeat: Infinity }}
              />
            );
          })}
        </div>
      ))}
    </motion.div>
  );
}

function genDemoTimeSeries(days: number, min: number, max: number): number[] {
  const arr: number[] = [];
  let v = min + Math.random() * (max - min) * 0.3;
  for (let i = 0; i < days; i++) {
    v += (Math.random() - 0.4) * (max - min) * 0.15;
    v = Math.max(min, Math.min(max, v));
    arr.push(Math.round(v * 10) / 10);
  }
  return arr;
}
function genDemoLabels(days: number): string[] {
  const labels: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  }
  return labels;
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const chartOpts = (legend = false) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: legend, position: 'bottom' as const, labels: { usePointStyle: true, padding: 16, font: { size: 11 } } },
    tooltip: { backgroundColor: '#1e293b', titleFont: { size: 12 }, bodyFont: { size: 11 }, cornerRadius: 8, padding: 10 },
  },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } } },
});

const ClassHubPage: React.FC = () => {
  const { user: clerkUser } = useUser();
  const supabase = useSupabase();
  const user = clerkUser
    ? { id: clerkUser.id, username: clerkUser.firstName || clerkUser.fullName || 'User', email: clerkUser.emailAddresses?.[0]?.emailAddress || '' }
    : null;

  const [view, setView] = useState<'hub' | 'dashboard'>('hub');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [dashTab, setDashTab] = useState<'overview' | 'lessons' | 'diagrams' | 'students' | 'meetings' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [hubTab, setHubTab] = useState<'my-classes' | 'enrolled' | 'browse' | 'tutors'>('my-classes');

  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [publicCourses, setPublicCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [tutorsList, setTutorsList] = useState<TutorProfile[]>([]);
  const [myTutorProfile, setMyTutorProfile] = useState<TutorProfile | null>(null);
  const [liveMeetings, setLiveMeetings] = useState<MeetingRoomType[]>([]);

  const [courseLessons, setCourseLessons] = useState<CustomLesson[]>([]);
  const [courseDiagrams, setCourseDiagrams] = useState<BrailleDiagram[]>([]);
  const [courseStudents, setCourseStudents] = useState<StudentCourseProgress[]>([]);
  const [courseAnnouncements, setCourseAnnouncements] = useState<Announcement[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<ClassAnalytics[]>([]);
  const [courseEnrollments, setCourseEnrollments] = useState<Enrollment[]>([]);

  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showTutorSignup, setShowTutorSignup] = useState(false);
  const [showDiagramEditor, setShowDiagramEditor] = useState(false);
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [showMeeting, setShowMeeting] = useState<MeetingRoomType | null>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [presetEnrolledIds, setPresetEnrolledIds] = useState<Set<string>>(() => getStoredPresetEnrollments());

  const [classForm, setClassForm] = useState({ title: '', description: '', level: 'beginner' as Course['level'], category: '', max_students: 30, is_public: true, tags: '', imageFile: null as File | null, imagePreview: '' });
  const [tutorForm, setTutorForm] = useState({ bio: '', specialties: '', certifications: '' });
  const [meetingForm, setMeetingForm] = useState({ title: '', description: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });

  const imageInputRef = useRef<HTMLInputElement>(null);

  const loadHub = useCallback(async () => {
    if (!supabase || !user) return;
    setLoading(true);
    try {
      const [mc, pc, me, tl, tp, lm] = await Promise.all([
        getMyCourses(supabase, user.id),
        getPublicCourses(supabase),
        getMyEnrollments(supabase, user.id),
        getTutors(supabase),
        getMyTutorProfile(supabase, user.id),
        getLiveMeetings(supabase),
      ]);
      setMyCourses(mc); setPublicCourses(pc); setMyEnrollments(me);
      setTutorsList(tl); setMyTutorProfile(tp); setLiveMeetings(lm);
    } catch (e) { console.error('[ClassHub] loadHub:', e); }
    finally { setLoading(false); }
  }, [supabase, user?.id]);

  const loadDashboard = useCallback(async (courseId: string) => {
    if (!supabase || !user) return;
    try {
      const [les, dia, stu, ann, ana, enr] = await Promise.all([
        getMyCustomLessons(supabase, user.id),
        getCourseDiagrams(supabase, courseId),
        getStudentProgress(supabase, courseId),
        getCourseAnnouncements(supabase, courseId),
        getCourseAnalytics(supabase, courseId),
        getCourseEnrollments(supabase, courseId),
      ]);
      setCourseLessons(les.filter(l => l.course_id === courseId || !l.course_id));
      setCourseDiagrams(dia); setCourseStudents(stu);
      setCourseAnnouncements(ann); setCourseAnalytics(ana);
      setCourseEnrollments(enr);
    } catch (e) { console.error('[ClassHub] loadDash:', e); }
  }, [supabase, user?.id]);

  useEffect(() => { loadHub(); }, [loadHub]);
  useEffect(() => { if (activeCourse && !activeCourse.id.startsWith('preset-')) loadDashboard(activeCourse.id); }, [activeCourse?.id, loadDashboard]);

  useEffect(() => {
    const onAction = (e: Event) => {
      const action = (e as CustomEvent).detail?.action;
      if (action === 'create-class') setShowCreateClass(true);
      else if (action === 'open-meeting') {
        if (view === 'dashboard' && activeCourse) setShowCreateMeeting(true);
        else if (liveMeetings.length > 0) handleJoinMeeting(liveMeetings[0]);
      }
      else if (action === 'create-lesson') { if (view === 'dashboard') setShowLessonCreator(true); }
      else if (action === 'create-diagram') { if (view === 'dashboard') setShowDiagramEditor(true); }
      else if (action === 'become-tutor') { if (!myTutorProfile) setShowTutorSignup(true); }
      else if (action === 'view-stats' || action === 'view-analytics') {
        if (view === 'dashboard') setDashTab('analytics');
        else if (myCourses.length > 0) { openDashboard(myCourses[0]); setTimeout(() => setDashTab('analytics'), 300); }
      }
      else if (action === 'back' || action === 'go-back') { if (view === 'dashboard') backToHub(); }
    };

    const onTab = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.page !== 'class-hub') return;
      const tab = d.tab;
      if (tab === 'tutors') { setView('hub'); setHubTab('tutors'); }
      else if (tab === 'classes' || tab === 'my-classes') { setView('hub'); setHubTab('my-classes'); }
      else if (tab === 'enrolled') { setView('hub'); setHubTab('enrolled'); }
      else if (tab === 'browse' || tab === 'resources') { setView('hub'); setHubTab('browse'); }
      else if (tab === 'overview') { if (view === 'dashboard') setDashTab('overview'); }
      else if (tab === 'lessons') { if (view === 'dashboard') setDashTab('lessons'); }
      else if (tab === 'diagrams') { if (view === 'dashboard') setDashTab('diagrams'); }
      else if (tab === 'students') { if (view === 'dashboard') setDashTab('students'); }
      else if (tab === 'meetings') { if (view === 'dashboard') setDashTab('meetings'); }
      else if (tab === 'analytics' || tab === 'stats') { if (view === 'dashboard') setDashTab('analytics'); }
      else if (tab === 'dashboard') {
        if (myCourses.length > 0) openDashboard(myCourses[0]);
      }
    };

    const onDismiss = () => {
      setShowCreateClass(false); setShowTutorSignup(false); setShowCreateMeeting(false);
      setShowDiagramEditor(false); setShowLessonCreator(false); setShowMeeting(null);
    };

    window.addEventListener('braylin-class-action', onAction);
    window.addEventListener('braylin-tab', onTab);
    window.addEventListener('braylin-dismiss', onDismiss);
    return () => {
      window.removeEventListener('braylin-class-action', onAction);
      window.removeEventListener('braylin-tab', onTab);
      window.removeEventListener('braylin-dismiss', onDismiss);
    };
  }, [view, activeCourse, myCourses, liveMeetings, myTutorProfile]);

  const uploadCourseImage = async (file: File, courseId: string): Promise<string | null> => {
    if (!supabase) return null;
    const ext = file.name.split('.').pop();
    const path = `${user!.id}/${courseId}.${ext}`;
    const { error } = await supabase.storage.from('class-files').upload(path, file, { upsert: true });
    if (error) { console.error('[ClassHub] upload error:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('class-files').getPublicUrl(path);
    return publicUrl;
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    const course = await createCourse(supabase, {
      creator_id: user.id, title: classForm.title, description: classForm.description,
      image_url: null, level: classForm.level, category: classForm.category || null,
      is_public: classForm.is_public, max_students: classForm.max_students,
      tags: classForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      curriculum: [], meeting_link: null, schedule: null,
    });
    if (course) {
      if (classForm.imageFile) {
        const url = await uploadCourseImage(classForm.imageFile, course.id);
        if (url) await updateCourse(supabase, course.id, { image_url: url });
        course.image_url = url;
      }
      toast({ title: 'Class Created!', description: `"${course.title}" is ready.` });
      showSuccessConfetti();
      setShowCreateClass(false);
      setClassForm({ title: '', description: '', level: 'beginner', category: '', max_students: 30, is_public: true, tags: '', imageFile: null, imagePreview: '' });
      await loadHub();
      openDashboard(course);
    } else {
      toast({ title: 'Error', description: 'Could not create class.', variant: 'destructive' });
    }
  };

  const openDashboard = (course: Course) => {
    setActiveCourse(course);
    setDashTab('overview');
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if ((course as typeof PRESET_COURSES[0])._preset) {
      const lessons = makePresetLessons(course.id, course.title, course.level);
      const diagrams = makePresetDiagrams(course.id, course.level);
      const students = makePresetStudents(course.id, (course as typeof PRESET_COURSES[0])._enrolled_count || 20);
      const analytics = makePresetAnalytics(course.id, 21);
      const announcements = makePresetAnnouncements(course.id, course.title);
      setCourseLessons(lessons);
      setCourseDiagrams(diagrams);
      setCourseStudents(students);
      setCourseAnalytics(analytics);
      setCourseAnnouncements(announcements);
      setCourseEnrollments(students.map((s, i) => ({
        id: `${course.id}-enr-${i}`, course_id: course.id, user_id: s.user_id,
        role: 'student' as const, enrolled_at: s.last_activity_at, progress_pct: Math.floor(Math.random() * 80 + 10),
        completed_lessons: [] as string[], last_active: s.last_activity_at,
        profile: { id: s.user_id, email: null, display_name: s.profile?.display_name ?? 'Student', avatar_url: s.profile?.avatar_url ?? null, xp: 0, streak: s.current_streak, rank: 0, total_finds: 0, cities_mapped: 0, lessons_completed: s.lessons_completed, role: 'student' as const, preferences: {}, created_at: s.last_activity_at, updated_at: s.last_activity_at },
      })));
    }
  };
  const backToHub = () => { setView('hub'); setActiveCourse(null); };

  const handleEnroll = async (courseId: string) => {
    if (!supabase || !user) return;
    const e = await enrollInCourse(supabase, courseId, user.id);
    if (e) { toast({ title: 'Enrolled!' }); showSuccessConfetti(); loadHub(); }
    else toast({ title: 'Error', description: 'Could not enroll.', variant: 'destructive' });
  };

  const handleUnenroll = async (courseId: string) => {
    if (!supabase || !user) return;
    if (await unenrollFromCourse(supabase, courseId, user.id)) { toast({ title: 'Left Class' }); loadHub(); }
  };

  const handleEnrollPreset = (courseId: string) => {
    const next = new Set(presetEnrolledIds);
    next.add(courseId);
    setPresetEnrolledIds(next);
    savePresetEnrollments(next);
    toast({ title: 'Enrolled!' });
    showSuccessConfetti();
    const course = PRESET_COURSES.find(c => c.id === courseId);
    if (course) openDashboard(course);
  };

  const handleUnenrollPreset = (courseId: string) => {
    const next = new Set(presetEnrolledIds);
    next.delete(courseId);
    setPresetEnrolledIds(next);
    savePresetEnrollments(next);
    toast({ title: 'Left Class' });
  };

  const handleBecomeTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    const tp = await becomeTutor(supabase, user.id, { specialties: tutorForm.specialties.split(',').map(s => s.trim()).filter(Boolean), bio: tutorForm.bio, certifications: tutorForm.certifications.split(',').map(s => s.trim()).filter(Boolean) });
    if (tp) { toast({ title: 'You are a Tutor!' }); showSuccessConfetti(); setShowTutorSignup(false); loadHub(); }
    else toast({ title: 'Error', variant: 'destructive' });
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !activeCourse) return;
    const room = await createMeetingRoom(supabase, { course_id: activeCourse.id, host_id: user.id, title: meetingForm.title || `${activeCourse.title} Meeting` });
    if (room) { toast({ title: 'Meeting started!', description: `Room: ${room.room_code}` }); setShowCreateMeeting(false); setShowMeeting(room); loadDashboard(activeCourse.id); }
    else toast({ title: 'Error', variant: 'destructive' });
  };

  const handleJoinMeeting = async (room: MeetingRoomType) => { if (!supabase || !user) return; await joinMeeting(supabase, room.id, user.id); setShowMeeting(room); };
  const handleLeaveMeeting = async () => { if (!supabase || !user || !showMeeting) return; await leaveMeeting(supabase, showMeeting.id, user.id); if (showMeeting.host_id === user.id) await endMeeting(supabase, showMeeting.id); setShowMeeting(null); if (activeCourse) loadDashboard(activeCourse.id); };

  const handleSaveDiagram = async (data: { title: string; description: string; cells: Array<{ dots: number[]; char: string; label?: string }>; layout: Record<string, unknown> }) => {
    if (!supabase || !user) return;
    const d = await createDiagram(supabase, { creator_id: user.id, course_id: activeCourse?.id || null, title: data.title, description: data.description, diagram_type: 'custom', cells: data.cells, layout: data.layout, tags: [], is_public: true, thumbnail_url: null });
    if (d) { toast({ title: 'Diagram Saved!' }); showSuccessConfetti(); setShowDiagramEditor(false); if (activeCourse) loadDashboard(activeCourse.id); }
    else toast({ title: 'Error', variant: 'destructive' });
  };

  const handleSaveLesson = async (data: { title: string; description: string; level: number; category: string; duration: number; exercises: unknown[]; ai_generated: boolean; ai_prompt: string }) => {
    if (!supabase || !user) return;
    const lesson = await createCustomLesson(supabase, { creator_id: user.id, course_id: activeCourse?.id || null, title: data.title, description: data.description, level: data.level, category: data.category, duration: data.duration, exercises: data.exercises, ai_generated: data.ai_generated, ai_prompt: data.ai_prompt || null, source_diagram_id: null, is_published: true, tags: [] });
    if (lesson) { toast({ title: 'Lesson Created!' }); showSuccessConfetti(); setShowLessonCreator(false); if (activeCourse) loadDashboard(activeCourse.id); }
    else toast({ title: 'Error', variant: 'destructive' });
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !activeCourse) return;
    const a = await createAnnouncement(supabase, { course_id: activeCourse.id, author_id: user.id, title: announcementForm.title, content: announcementForm.content });
    if (a) { toast({ title: 'Posted!' }); setAnnouncementForm({ title: '', content: '' }); loadDashboard(activeCourse.id); }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClassForm(f => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  };

  const enrolledIds = new Set(myEnrollments.map(e => e.course_id));
  const browseCourses = publicCourses.filter(c => c.creator_id !== user?.id);
  const allBrowse = [...browseCourses, ...PRESET_COURSES.filter(p => !browseCourses.some(c => c.title === p.title))];
  const filtered = searchQuery ? allBrowse.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.category?.toLowerCase().includes(searchQuery.toLowerCase()) || c.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) : allBrowse;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10 bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="text-white" size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Class Hub</h2>
          <p className="text-gray-500">Sign in to create classes, become a tutor, and join live meetings.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <AnimatePresence>{showMeeting && <MeetingRoom roomCode={showMeeting.room_code} jitsiRoomName={showMeeting.jitsi_room_name || showMeeting.room_code} title={showMeeting.title} isHost={showMeeting.host_id === user.id} userName={user.username} onLeave={handleLeaveMeeting} />}</AnimatePresence>
      <AnimatePresence>{showDiagramEditor && <Overlay><BrailleDiagramEditor onSave={handleSaveDiagram} onCancel={() => setShowDiagramEditor(false)} /></Overlay>}</AnimatePresence>
      <AnimatePresence>{showLessonCreator && <Overlay><LessonCreator onSave={handleSaveLesson} onCancel={() => setShowLessonCreator(false)} geminiAvailable={!!import.meta.env.VITE_GOOGLE_AI_API_KEY} /></Overlay>}</AnimatePresence>

      {view === 'hub' ? (
        <>
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-800 to-indigo-800" />
            <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-gradient-to-br from-blue-500/30 to-cyan-400/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-30%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/20 to-cyan-400/10 rounded-full blur-[80px]" />
            <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-400/10 rounded-full blur-[60px]" />
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 1 }} className="absolute top-8 right-16 flex gap-2">
              {[1,2,3].map(i => <div key={i} className="w-3 h-3 rounded-full bg-blue-300" />)}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} transition={{ delay: 1.3 }} className="absolute bottom-20 left-10 flex flex-col gap-2">
              {[1,2].map(i => <div key={i} className="flex gap-2">{[1,2].map(j => <div key={j} className="w-2.5 h-2.5 rounded-full bg-blue-300" />)}</div>)}
            </motion.div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-white/90 text-sm font-medium mb-4 border border-white/15 shadow-lg shadow-black/10">
                    <Sparkles size={14} className="text-yellow-300" /> Class Hub Platform
                  </motion.div>
                  <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                    Create, Teach & Learn{' '}
                    <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-200 bg-clip-text text-transparent">Braille</span>
                  </motion.h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-blue-200/80 mt-3 max-w-xl text-sm sm:text-base leading-relaxed">
                    Build interactive classes with AI-powered lessons, live video meetings, braille diagrams, and real-time analytics.
                  </motion.p>
                </div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex gap-3 flex-wrap">
                  {!myTutorProfile && (
                    <button onClick={() => setShowTutorSignup(true)} className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white font-semibold hover:bg-white/20 transition flex items-center gap-2 text-sm"><Award size={16} /> Become Tutor</button>
                  )}
                  <button onClick={() => setShowCreateClass(true)} className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold shadow-xl shadow-black/20 hover:bg-blue-50 hover:shadow-2xl transition flex items-center gap-2 text-sm"><Plus size={16} /> Create Class</button>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                {([
                  { label: 'My Classes', val: myCourses.length, icon: <BookOpen size={18} />, grad: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-400/20' },
                  { label: 'Enrolled', val: myEnrollments.length, icon: <UserPlus size={18} />, grad: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-400/20' },
                  { label: 'Community', val: tutorsList.length + PRESET_COURSES.length, icon: <GraduationCap size={18} />, grad: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-400/20' },
                  { label: 'Live Now', val: liveMeetings.length, icon: <Video size={18} />, grad: 'from-rose-500/20 to-red-500/10', border: 'border-rose-400/20' },
                ] as const).map((s, i) => (
                  <motion.div key={s.label} whileHover={{ scale: 1.03, y: -2 }} className={`bg-gradient-to-br ${s.grad} backdrop-blur-xl rounded-2xl px-4 py-4 border ${s.border} cursor-default shadow-lg shadow-black/5`}>
                    <div className="flex items-center gap-2 text-white/70 mb-1.5">{s.icon}<span className="text-xs font-medium uppercase tracking-wider">{s.label}</span></div>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }} className="text-3xl font-black text-white">{s.val}</motion.p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
                <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="white" fillOpacity="0.05"/>
                <path d="M0 55C360 85 720 25 1080 55C1260 70 1380 50 1440 55V80H0V55Z" className="fill-white dark:fill-gray-900"/>
              </svg>
            </div>
          </section>

          {liveMeetings.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 relative z-10">
              <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-4 shadow-xl shadow-red-500/20">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    <span className="font-bold text-sm">{liveMeetings.length} Live Meeting{liveMeetings.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {liveMeetings.slice(0, 3).map(m => (
                      <button key={m.id} onClick={() => handleJoinMeeting(m)} className="px-4 py-1.5 bg-white/20 backdrop-blur rounded-lg text-white text-sm font-semibold hover:bg-white/30 transition flex items-center gap-1.5">
                        <Play size={12} /> {m.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
            <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-8 w-fit">
              {([
                { id: 'my-classes' as const, label: 'My Classes', icon: <BookOpen size={14} />, count: myCourses.length },
                { id: 'enrolled' as const, label: 'Enrolled', icon: <UserPlus size={14} />, count: myEnrollments.length + presetEnrolledIds.size },
                { id: 'browse' as const, label: 'Browse All', icon: <Globe size={14} />, count: allBrowse.length },
                { id: 'tutors' as const, label: 'Tutors', icon: <GraduationCap size={14} />, count: tutorsList.length },
              ]).map(t => (
                <button key={t.id} onClick={() => setHubTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${hubTab === t.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                  {t.icon} {t.label} <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${hubTab === t.id ? 'bg-white/20' : 'bg-gray-100'}`}>{t.count}</span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="relative w-12 h-12"><div className="absolute inset-0 border-4 border-blue-200 rounded-full" /><div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={hubTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                  {hubTab === 'my-classes' && (
                    <div className="space-y-8">
                      {myCourses.length === 0 ? (
                        <div className="space-y-8">
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border-2 border-dashed border-blue-200 p-12 text-center relative overflow-hidden">
                            <FloatingBrailleDots />
                            <div className="relative z-10">
                              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                <BookOpen className="text-blue-500" size={36} />
                              </motion.div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Your First Class</h3>
                              <p className="text-gray-500 mb-6 max-w-md mx-auto">Start teaching braille by creating a class. Add lessons, diagrams, invite students, and track their progress.</p>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowCreateClass(true)} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/25 transition inline-flex items-center gap-2"><Plus size={18} /> Create Class</motion.button>
                            </div>
                          </motion.div>

                          <div>
                            <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>
                                <Sparkles className="text-yellow-500" size={18} />
                              </motion.div>
                              Quick Start Templates
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {PRESET_COURSES.slice(0, 6).map((c, i) => {
                                const Icon = CARD_ICONS[i % CARD_ICONS.length];
                                return (
                                  <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 100 }}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    onClick={() => {
                                      setClassForm(f => ({ ...f, title: c.title, description: c.description || '', category: c.category || '', level: c.level, tags: c.tags?.join(', ') || '' }));
                                      setShowCreateClass(true);
                                    }}
                                    className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all group"
                                  >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center mb-3 shadow-lg`}>
                                      <Icon className="text-white" size={20} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition mb-1">{c.title}</h4>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-2">{c.description}</p>
                                    <div className="flex items-center gap-2">
                                      <LevelBadge level={c.level} />
                                      <span className="text-xs text-gray-400">{c.category}</span>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-extrabold text-gray-900">My Classes</h2>
                            <button onClick={() => setShowCreateClass(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"><Plus size={14} /> New Class</button>
                          </div>
                          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {myCourses.map((c, i) => (
                              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }} onClick={() => openDashboard(c)}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
                                <div className="h-36 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                                  {c.image_url ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" /> : (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20"><BookOpen size={64} className="text-white" /></div>
                                  )}
                                  <div className="absolute top-3 right-3"><LevelBadge level={c.level} /></div>
                                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/40" />
                                </div>
                                <div className="p-5">
                                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-1">{c.title}</h3>
                                  <p className="text-xs text-indigo-600 font-medium mb-1">by {c.creator?.display_name || user.username}</p>
                                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{c.description || 'No Description Yet'}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      <span className="flex items-center gap-1"><Users size={12} /> {c.max_students}</span>
                                      {c.category && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{c.category}</span>}
                                    </div>
                                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1 group-hover:underline">Dashboard <ChevronRight size={12} /></span>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </>
                      )}

                      {myTutorProfile && (
                        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-100 rounded-2xl p-6 flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20"><Award className="text-white" size={28} /></div>
                          <div>
                            <p className="font-extrabold text-gray-900 text-lg">Tutor Profile Active</p>
                            <p className="text-sm text-gray-600">Rating: <Star size={12} className="inline text-yellow-500" fill="currentColor" /> {myTutorProfile.rating}/5 · {myTutorProfile.total_students} students · {myTutorProfile.total_sessions} sessions</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {hubTab === 'browse' && (
                    <div className="space-y-8 relative">
                      <FloatingBrailleDots />

                      <div className="flex items-center gap-4 flex-wrap relative z-10">
                        <div className="relative flex-1 min-w-[250px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, category, or tag..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Hash size={14} /> {filtered.length} Classes Available
                        </div>
                      </div>

                      {!searchQuery && (
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                                <Sparkles className="text-yellow-500" size={20} />
                              </motion.div>
                              <h3 className="text-lg font-extrabold text-gray-900">Featured Classes</h3>
                            </div>
                            <div className="flex items-center gap-1">
                              {['BRAILLE'].map(word => word.split('').map((ch, i) => (
                                <AnimatedBrailleCell key={`${word}-${i}`} char={ch} delay={i * 0.15} />
                              )))}
                            </div>
                          </div>
                          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2">
                            {PRESET_COURSES.slice(0, 5).map((c, i) => {
                              const Icon = CARD_ICONS[i % CARD_ICONS.length];
                              return (
                                <motion.div
                                  key={c.id}
                                  initial={{ opacity: 0, x: 40 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.08, type: 'spring', stiffness: 100 }}
                                  whileHover={{ y: -6, scale: 1.02 }}
                                  onClick={() => {
                                    if (!presetEnrolledIds.has(c.id)) handleEnrollPreset(c.id);
                                    else openDashboard(c);
                                  }}
                                  className="min-w-[280px] max-w-[320px] snap-start flex-shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                                >
                                  <div className={`h-28 bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} relative overflow-hidden`}>
                                    <div className="absolute inset-0 opacity-20">
                                      <svg width="100%" height="100%"><defs><pattern id={`feat-${i}`} width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="white"/><circle cx="12" cy="12" r="2" fill="white"/></pattern></defs><rect width="100%" height="100%" fill={`url(#feat-${i})`}/></svg>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="opacity-10">
                                        <Icon size={80} className="text-white" />
                                      </motion.div>
                                    </div>
                                    <div className="absolute top-3 left-3"><LevelBadge level={c.level} /></div>
                                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-yellow-400/90 backdrop-blur rounded-full text-xs font-bold text-yellow-900"><Star size={10} fill="currentColor" /> {(c as typeof PRESET_COURSES[0])._rating}</div>
                                    <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/30" />
                                  </div>
                                  <div className="p-4">
                                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition text-sm mb-1">{c.title}</h4>
                                    <p className="text-xs text-indigo-600 font-medium mb-1">by {(c as typeof PRESET_COURSES[0])._creator_name}</p>
                                    <p className="text-gray-500 text-xs line-clamp-2 mb-3">{c.description}</p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={11} /> {(c as typeof PRESET_COURSES[0])._enrolled_count} Enrolled</span>
                                      <span className={`text-xs font-bold flex items-center gap-1 transition ${presetEnrolledIds.has(c.id) ? 'text-green-600' : 'text-blue-600 opacity-0 group-hover:opacity-100'}`}>
                                        {presetEnrolledIds.has(c.id) ? <><Check size={12} /> Enrolled</> : <>Enroll <ChevronRight size={12} /></>}
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {!searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-2 flex-wrap relative z-10">
                          {['All', 'Literacy', 'STEM', 'Music', 'Kids', 'Education', 'Technology', 'Writing', 'Hardware'].map((cat) => (
                            <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
                              className={`px-4 py-2 rounded-full text-xs font-semibold transition border ${!searchQuery && cat === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                              {cat}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}

                      {filtered.length === 0 ? (
                        <div className="text-center py-16"><Globe className="mx-auto mb-3 text-gray-300" size={48} /><p className="text-gray-400 text-sm">No Classes Found.</p></div>
                      ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 relative z-10">
                          {filtered.map((c, i) => {
                            const isPreset = (c as typeof PRESET_COURSES[0])._preset;
                            const enrolled = enrolledIds.has(c.id);
                            const Icon = CARD_ICONS[i % CARD_ICONS.length];
                            const grad = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                            return (
                              <motion.div key={c.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: i * 0.04, type: 'spring', stiffness: 120, damping: 15 }}
                                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
                                <div className={`h-32 bg-gradient-to-br ${grad} relative overflow-hidden`}>
                                  {c.image_url ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover" /> : (
                                    <>
                                      <div className="absolute inset-0 opacity-10">
                                        <svg width="100%" height="100%"><defs><pattern id={`bg-${c.id}`} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="2" fill="white" /><circle cx="15" cy="15" r="1.5" fill="white" /></pattern></defs><rect width="100%" height="100%" fill={`url(#bg-${c.id})`}/></svg>
                                      </div>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                          initial={{ opacity: 0.15, scale: 0.8 }}
                                          animate={{ opacity: [0.15, 0.25, 0.15], scale: [0.8, 1, 0.8] }}
                                          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                        >
                                          <Icon size={56} className="text-white" />
                                        </motion.div>
                                      </div>
                                    </>
                                  )}
                                  <div className="absolute top-3 left-3"><LevelBadge level={c.level} /></div>
                                  {c.is_public && <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500/80 backdrop-blur text-white text-xs font-bold rounded-full">Public</div>}
                                  {isPreset && (c as typeof PRESET_COURSES[0])._rating && (
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-full text-xs text-white font-semibold">
                                      <Star size={10} fill="currentColor" className="text-yellow-400" /> {(c as typeof PRESET_COURSES[0])._rating}
                                    </div>
                                  )}
                                  <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/20" />
                                </div>
                                <div className="p-5">
                                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition">{c.title}</h3>
                                  <p className="text-xs text-indigo-600 font-medium mb-1">by {isPreset ? (c as typeof PRESET_COURSES[0])._creator_name : (c.creator?.display_name || 'Unknown')}</p>
                                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">{c.description || 'No Description'}</p>
                                  {c.tags && c.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">{c.tags.slice(0, 3).map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs">{t}</span>)}</div>
                                  )}
                                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={12} /> {isPreset ? `${(c as typeof PRESET_COURSES[0])._enrolled_count} Enrolled` : `${c.max_students} Max`}</span>
                                    {isPreset ? (
                                      presetEnrolledIds.has(c.id) ? (
                                        <div className="flex gap-2">
                                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => openDashboard(c)}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition">
                                            View
                                          </motion.button>
                                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleUnenrollPreset(c.id)}
                                            className="px-3 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition">
                                            Leave
                                          </motion.button>
                                        </div>
                                      ) : (
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                          onClick={() => handleEnrollPreset(c.id)}
                                          className="px-5 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 transition">
                                          Enroll Now
                                        </motion.button>
                                      )
                                    ) : (
                                      <button onClick={() => enrolled ? handleUnenroll(c.id) : handleEnroll(c.id)}
                                        className={`px-5 py-2 rounded-xl text-sm font-bold transition ${enrolled ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25'}`}>
                                        {enrolled ? 'Leave' : 'Enroll Now'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}

                      {!searchQuery && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="relative z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-center overflow-hidden"
                        >
                          <div className="absolute inset-0 opacity-10">
                            <svg width="100%" height="100%"><defs><pattern id="cta-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="white"/><circle cx="16" cy="16" r="2" fill="white"/></pattern></defs><rect width="100%" height="100%" fill="url(#cta-dots)"/></svg>
                          </div>
                          <div className="relative z-10">
                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                              <GraduationCap className="mx-auto text-white/80 mb-3" size={40} />
                            </motion.div>
                            <h3 className="text-2xl font-extrabold text-white mb-2">Ready to Teach?</h3>
                            <p className="text-white/80 mb-6 max-w-md mx-auto text-sm">Create your own braille class with AI-powered lessons, live video meetings, and real-time student analytics.</p>
                            <button onClick={() => setShowCreateClass(true)} className="px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:bg-blue-50 transition inline-flex items-center gap-2">
                              <Plus size={18} /> Create Your Class
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {hubTab === 'tutors' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-extrabold text-gray-900">All Tutors</h2>
                        {!myTutorProfile && (
                          <button onClick={() => setShowTutorSignup(true)} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition flex items-center gap-2"><Award size={14} /> Become a Tutor</button>
                        )}
                      </div>
                      {tutorsList.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-purple-200">
                          <GraduationCap className="mx-auto mb-3 text-purple-300" size={48} />
                          <p className="text-gray-500 mb-4">No Tutors Yet. Be The First!</p>
                          {!myTutorProfile && <button onClick={() => setShowTutorSignup(true)} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition inline-flex items-center gap-2"><Award size={16} /> Sign Up</button>}
                        </div>
                      ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {tutorsList.map((t, i) => (
                            <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all group">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-500/20">
                                  {t.profile?.avatar_url ? <img src={t.profile.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" /> : t.profile?.display_name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-lg">{t.profile?.display_name || 'Tutor'}</p>
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="flex items-center gap-1 text-yellow-600"><Star size={12} fill="currentColor" />{t.rating.toFixed(1)}</span>
                                    <span className="text-gray-400">·</span>
                                    <span className="text-gray-500">{t.total_students} Students</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{t.bio || 'Experienced Braille Tutor Ready To Help You Learn.'}</p>
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {t.specialties.map(s => <span key={s} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">{s}</span>)}
                              </div>
                              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                                <span>{t.total_sessions} Sessions</span>
                                {t.is_volunteer && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">Volunteer</span>}
                                {t.certifications?.length > 0 && <span className="flex items-center gap-1"><Shield size={10} /> {t.certifications.length} Certs</span>}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {hubTab === 'enrolled' && (
                    <div className="space-y-8">
                      {myEnrollments.length === 0 && presetEnrolledIds.size === 0 ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl border-2 border-dashed border-purple-200 p-12 text-center relative overflow-hidden">
                          <FloatingBrailleDots />
                          <div className="relative z-10">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                              <UserPlus className="text-purple-500" size={36} />
                            </motion.div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Enrolled Classes Yet</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Browse available classes and enroll to start learning braille with peers.</p>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setHubTab('browse')} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-purple-500/25 transition inline-flex items-center gap-2"><Globe size={18} /> Browse Classes</motion.button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          <div>
                            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2"><UserPlus className="text-purple-600" size={22} /> Enrolled Classes</h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {PRESET_COURSES.filter(p => presetEnrolledIds.has(p.id)).map((p, i) => {
                                const Icon = CARD_ICONS[i % CARD_ICONS.length];
                                const grad = CARD_GRADIENTS[i % CARD_GRADIENTS.length];
                                const demoProgress = 15 + ((p.id.charCodeAt(p.id.length - 1) * 7) % 60);
                                return (
                                  <motion.div key={p.id}
                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -3 }}
                                    onClick={() => openDashboard(p)}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                                    <div className={`h-24 bg-gradient-to-br ${grad} relative overflow-hidden`}>
                                      <div className="absolute inset-0 flex items-center justify-center opacity-20"><Icon size={48} className="text-white" /></div>
                                      <div className="absolute top-3 left-3"><LevelBadge level={p.level} /></div>
                                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded-full text-xs text-white font-semibold">
                                        <Star size={10} fill="currentColor" className="text-yellow-400" /> {p._rating}
                                      </div>
                                    </div>
                                    <div className="p-4">
                                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition mb-2">{p.title}</h3>
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${demoProgress}%` }} /></div>
                                        <span className="text-sm font-bold text-purple-600">{demoProgress}%</span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Users size={11} /> {p._enrolled_count} Classmates</span>
                                        <button onClick={ev => { ev.stopPropagation(); handleUnenrollPreset(p.id); }} className="text-red-500 hover:text-red-700 font-medium">Leave</button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                              {myEnrollments.map((enr, i) => {
                                const grad = CARD_GRADIENTS[(i + 6) % CARD_GRADIENTS.length];
                                const Icon = CARD_ICONS[(i + 6) % CARD_ICONS.length];
                                return (
                                  <motion.div key={enr.id}
                                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (presetEnrolledIds.size + i) * 0.05 }}
                                    whileHover={{ y: -3 }}
                                    onClick={() => { if (enr.course) openDashboard(enr.course); }}
                                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                                    <div className={`h-24 bg-gradient-to-br ${grad} relative overflow-hidden`}>
                                      {enr.course?.image_url ? <img src={enr.course.image_url} alt={enr.course.title} className="w-full h-full object-cover" /> : (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-20"><Icon size={48} className="text-white" /></div>
                                      )}
                                      <div className="absolute top-3 left-3"><LevelBadge level={enr.course?.level || 'beginner'} /></div>
                                    </div>
                                    <div className="p-4">
                                      <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition mb-1">{enr.course?.title || 'Class'}</h3>
                                      <p className="text-xs text-indigo-600 font-medium mb-2">by {enr.course?.creator?.display_name || 'Tutor'}</p>
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${enr.progress_pct}%` }} /></div>
                                        <span className="text-sm font-bold text-purple-600">{enr.progress_pct}%</span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{enr.completed_lessons?.length || 0} Lessons Done</span>
                                        <button onClick={ev => { ev.stopPropagation(); handleUnenroll(enr.course_id); }} className="text-red-500 hover:text-red-700 font-medium">Leave</button>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                              <Video className="text-green-600" size={22} /> Upcoming Sessions
                            </h2>
                            {(() => {
                              const enrolledPresets = PRESET_COURSES.filter(p => presetEnrolledIds.has(p.id));
                              const upcomingSessions: { courseId: string; courseTitle: string; time: Date; type: string; grad: string }[] = [];
                              enrolledPresets.forEach((p, pi) => {
                                const grad = CARD_GRADIENTS[pi % CARD_GRADIENTS.length];
                                const baseHour = 10 + (p.id.charCodeAt(p.id.length - 1) % 8);
                                const dayOffset = 1 + (pi % 3);
                                const sessionDate = new Date();
                                sessionDate.setDate(sessionDate.getDate() + dayOffset);
                                sessionDate.setHours(baseHour, 0, 0, 0);
                                upcomingSessions.push({ courseId: p.id, courseTitle: p.title, time: sessionDate, type: pi % 2 === 0 ? 'Live Class' : 'Study Group', grad });
                                if (pi < 4) {
                                  const session2 = new Date(sessionDate);
                                  session2.setDate(session2.getDate() + 3);
                                  session2.setHours(baseHour + 2, 30, 0, 0);
                                  upcomingSessions.push({ courseId: p.id, courseTitle: p.title, time: session2, type: 'Q&A Session', grad });
                                }
                              });
                              liveMeetings.forEach(m => {
                                const enrollment = myEnrollments.find(en => en.course_id === m.course_id);
                                if (enrollment) {
                                  upcomingSessions.push({ courseId: m.course_id, courseTitle: m.title, time: new Date(), type: 'LIVE NOW', grad: 'from-red-500 to-rose-600' });
                                }
                              });
                              upcomingSessions.sort((a, b) => a.time.getTime() - b.time.getTime());

                              if (upcomingSessions.length === 0) {
                                return (
                                  <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                                    <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-gray-400 text-sm">No Upcoming Sessions.</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {upcomingSessions.slice(0, 6).map((s, i) => (
                                    <motion.div key={`session-${i}`}
                                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                      className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer group"
                                      onClick={() => {
                                        const course = PRESET_COURSES.find(c => c.id === s.courseId) || publicCourses.find(c => c.id === s.courseId);
                                        if (course) openDashboard(course);
                                      }}
                                    >
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.grad} flex items-center justify-center shadow-sm`}>
                                          <Video className="text-white" size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{s.courseTitle}</p>
                                          <span className={`text-xs font-semibold ${s.type === 'LIVE NOW' ? 'text-red-600' : 'text-gray-500'}`}>
                                            {s.type === 'LIVE NOW' && <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />}
                                            {s.type}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={12} />
                                        <span className="font-medium">
                                          {s.type === 'LIVE NOW' ? 'Happening now!' : s.time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ' at ' + s.time.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          <div>
                            <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                              <Bell className="text-orange-500" size={22} /> Lesson Progress
                            </h2>
                            {(() => {
                              const enrolledPresets = PRESET_COURSES.filter(p => presetEnrolledIds.has(p.id));
                              type LessonNotification = { courseId: string; courseTitle: string; lessonTitle: string; lessonIndex: number; totalLessons: number; type: 'overdue' | 'next-up' | 'new'; grad: string };
                              const notifications: LessonNotification[] = [];

                              enrolledPresets.forEach((p, pi) => {
                                const grad = CARD_GRADIENTS[pi % CARD_GRADIENTS.length];
                                const lessons = COURSE_LESSON_MAP[p.id] || COURSE_LESSON_MAP['preset-1'];
                                const demoProgress = Math.floor(15 + ((p.id.charCodeAt(p.id.length - 1) * 7) % 60));
                                const completedCount = Math.floor(demoProgress / 100 * lessons.length);
                                const nextIndex = Math.min(completedCount, lessons.length - 1);

                                if (nextIndex < lessons.length) {
                                  notifications.push({
                                    courseId: p.id, courseTitle: p.title,
                                    lessonTitle: `Ch ${nextIndex + 1}: ${lessons[nextIndex].title}`,
                                    lessonIndex: nextIndex, totalLessons: lessons.length,
                                    type: nextIndex > 0 && pi < 3 ? 'overdue' : 'next-up', grad,
                                  });
                                }
                                if (pi % 3 === 0 && lessons.length > nextIndex + 1) {
                                  notifications.push({
                                    courseId: p.id, courseTitle: p.title,
                                    lessonTitle: `Ch ${nextIndex + 2}: ${lessons[nextIndex + 1].title}`,
                                    lessonIndex: nextIndex + 1, totalLessons: lessons.length,
                                    type: 'new', grad,
                                  });
                                }
                              });

                              const order = { overdue: 0, 'next-up': 1, new: 2 };
                              notifications.sort((a, b) => order[a.type] - order[b.type]);

                              if (notifications.length === 0) {
                                return (
                                  <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                                    <CheckCircle2 className="mx-auto text-green-400 mb-2" size={32} />
                                    <p className="text-gray-400 text-sm">You're All Caught Up! No Pending Lessons.</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-2">
                                  {notifications.slice(0, 8).map((n, i) => (
                                    <motion.div key={`notif-${i}`}
                                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                      className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
                                      onClick={() => {
                                        const course = PRESET_COURSES.find(c => c.id === n.courseId);
                                        if (course) { openDashboard(course); setTimeout(() => setDashTab('lessons'), 200); }
                                      }}
                                    >
                                      <div className={`w-2 h-8 rounded-full flex-shrink-0 ${n.type === 'overdue' ? 'bg-red-500' : n.type === 'next-up' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${n.grad} flex items-center justify-center shadow-sm flex-shrink-0`}>
                                        <BookOpen className="text-white" size={18} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition">{n.lessonTitle}</p>
                                        <p className="text-xs text-gray-500 truncate">{n.courseTitle}</p>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                          n.type === 'overdue' ? 'bg-red-50 text-red-600' :
                                          n.type === 'next-up' ? 'bg-blue-50 text-blue-600' :
                                          'bg-green-50 text-green-600'
                                        }`}>
                                          {n.type === 'overdue' ? 'Overdue' : n.type === 'next-up' ? 'Next Up' : 'New'}
                                        </span>
                                        <span className="text-xs text-gray-400">{n.lessonIndex}/{n.totalLessons}</span>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition" />
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </>
      ) : activeCourse && (
        <>
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex items-center gap-4 py-4">
                <button onClick={backToHub} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"><ArrowLeft size={20} /></button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-extrabold text-gray-900 truncate">{activeCourse.title}</h1>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <LevelBadge level={activeCourse.level} />
                    {activeCourse.category && <span className="px-2 py-0.5 rounded-full bg-gray-100">{activeCourse.category}</span>}
                    <span className="flex items-center gap-1"><Users size={11} /> {courseEnrollments.length || (activeCourse as typeof PRESET_COURSES[0])._enrolled_count || 0} Enrolled</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} /> {courseLessons.length} Lessons</span>
                    {(activeCourse as typeof PRESET_COURSES[0])._rating && (
                      <span className="flex items-center gap-1 text-yellow-600"><Star size={11} fill="currentColor" /> {(activeCourse as typeof PRESET_COURSES[0])._rating}</span>
                    )}
                  </div>
                </div>
                {activeCourse.creator_id === user.id && (
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreateMeeting(true)} className="px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition flex items-center gap-1.5 shadow-sm"><Video size={13} /> Meet</button>
                    <button onClick={() => setShowLessonCreator(true)} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"><Sparkles size={13} /> Lesson</button>
                    <button onClick={() => setShowDiagramEditor(true)} className="px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition flex items-center gap-1.5 shadow-sm"><Grid size={13} /> Diagram</button>
                  </div>
                )}
              </div>
              <div className="flex gap-0.5 -mb-px overflow-x-auto">
                {([
                  { id: 'overview' as const, label: 'Overview', icon: <Eye size={14} /> },
                  { id: 'lessons' as const, label: 'Lessons', icon: <BookOpen size={14} /> },
                  { id: 'diagrams' as const, label: 'Diagrams', icon: <Grid size={14} /> },
                  { id: 'students' as const, label: 'Students', icon: <Users size={14} /> },
                  { id: 'meetings' as const, label: 'Meetings', icon: <Video size={14} /> },
                  { id: 'analytics' as const, label: 'Analytics', icon: <BarChart3 size={14} /> },
                ]).map(t => (
                  <button key={t.id} onClick={() => setDashTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${dashTab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{t.icon}{t.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <AnimatePresence mode="wait">
              <motion.div key={dashTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                {dashTab === 'overview' && <OverviewTab course={activeCourse} lessons={courseLessons} diagrams={courseDiagrams} students={courseStudents} enrollments={courseEnrollments} analytics={courseAnalytics} announcements={courseAnnouncements} announcementForm={announcementForm} setAnnouncementForm={setAnnouncementForm} onPostAnnouncement={handlePostAnnouncement} isOwner={activeCourse.creator_id === user.id} />}
                {dashTab === 'lessons' && <LessonsTab lessons={courseLessons} isOwner={activeCourse.creator_id === user.id} onCreate={() => setShowLessonCreator(true)} onDelete={async id => { if (!supabase) return; await deleteCustomLesson(supabase, id); toast({ title: 'Deleted' }); loadDashboard(activeCourse.id); }} />}
                {dashTab === 'diagrams' && <DiagramsTab diagrams={courseDiagrams} isOwner={activeCourse.creator_id === user.id} onCreate={() => setShowDiagramEditor(true)} onDelete={async id => { if (!supabase) return; await deleteDiagram(supabase, id); toast({ title: 'Deleted' }); loadDashboard(activeCourse.id); }} />}
                {dashTab === 'students' && <StudentsTab students={courseStudents} enrollments={courseEnrollments} />}
                {dashTab === 'meetings' && <MeetingsTab meetings={liveMeetings.filter(m => m.course_id === activeCourse.id)} isOwner={activeCourse.creator_id === user.id} onStart={() => setShowCreateMeeting(true)} onJoin={handleJoinMeeting} />}
                {dashTab === 'analytics' && <AnalyticsTab analytics={courseAnalytics} students={courseStudents} enrollments={courseEnrollments} lessons={courseLessons} diagrams={courseDiagrams} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}

      <AnimatePresence>
        {showCreateClass && (
          <Modal onClose={() => setShowCreateClass(false)} title="Create a New Class" icon={<BookOpen size={20} />}>
            <form onSubmit={handleCreateClass} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Class Cover Image</label>
                <div onClick={() => imageInputRef.current?.click()} className="relative h-40 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer overflow-hidden flex items-center justify-center">
                  {classForm.imagePreview ? (
                    <img src={classForm.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center"><Upload className="mx-auto text-gray-400 mb-2" size={28} /><p className="text-sm text-gray-500">Click to upload cover image</p><p className="text-xs text-gray-400">PNG, JPG up to 5MB</p></div>
                  )}
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              </div>
              <FormInput label="Class Title" required value={classForm.title} onChange={v => setClassForm(f => ({ ...f, title: v }))} placeholder="e.g., Braille Fundamentals" />
              <FormTextArea label="Description" value={classForm.description} onChange={v => setClassForm(f => ({ ...f, description: v }))} placeholder="What will students learn in this class?" />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Level" value={classForm.level} onChange={v => setClassForm(f => ({ ...f, level: v as Course['level'] }))} options={[{ value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }]} />
                <FormInput label="Category" value={classForm.category} onChange={v => setClassForm(f => ({ ...f, category: v }))} placeholder="e.g., Literary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Max Students" type="number" value={String(classForm.max_students)} onChange={v => setClassForm(f => ({ ...f, max_students: parseInt(v) || 30 }))} />
                <FormInput label="Tags (comma-separated)" value={classForm.tags} onChange={v => setClassForm(f => ({ ...f, tags: v }))} placeholder="beginner, literacy" />
              </div>
              <label className="flex items-center gap-3 text-sm text-gray-700 p-3 bg-gray-50 rounded-xl">
                <input type="checkbox" checked={classForm.is_public} onChange={e => setClassForm(f => ({ ...f, is_public: e.target.checked }))} className="w-4 h-4 rounded text-blue-600" />
                <div><span className="font-semibold">Make Public</span><p className="text-xs text-gray-500">Anyone can find and enroll in this class</p></div>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateClass(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:shadow-lg hover:shadow-blue-500/25 transition flex items-center justify-center gap-2"><Plus size={16} /> Create Class</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorSignup && (
          <Modal onClose={() => setShowTutorSignup(false)} title="Become a Tutor" icon={<Award size={20} />}>
            <form onSubmit={handleBecomeTutor} className="space-y-5">
              <FormTextArea label="About You" required value={tutorForm.bio} onChange={v => setTutorForm(f => ({ ...f, bio: v }))} placeholder="Tell students about your experience and teaching style..." />
              <FormInput label="Specialties (comma-separated)" required value={tutorForm.specialties} onChange={v => setTutorForm(f => ({ ...f, specialties: v }))} placeholder="Literary Braille, Music, Grade 2" />
              <FormInput label="Certifications (comma-separated)" value={tutorForm.certifications} onChange={v => setTutorForm(f => ({ ...f, certifications: v }))} placeholder="CTEBVI, RESNA" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTutorSignup(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition">Sign Up</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateMeeting && (
          <Modal onClose={() => setShowCreateMeeting(false)} title="Start a Meeting" icon={<Video size={20} />}>
            <form onSubmit={handleCreateMeeting} className="space-y-5">
              <FormInput label="Meeting Title" value={meetingForm.title} onChange={v => setMeetingForm(f => ({ ...f, title: v }))} placeholder="Study Session" />
              <FormTextArea label="Description" value={meetingForm.description} onChange={v => setMeetingForm(f => ({ ...f, description: v }))} placeholder="What's this meeting about?" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateMeeting(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"><Video size={16} /> Start</button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

function OverviewTab({ course, lessons, diagrams, students, enrollments, analytics, announcements, announcementForm, setAnnouncementForm, onPostAnnouncement, isOwner }: {
  course: Course; lessons: CustomLesson[]; diagrams: BrailleDiagram[]; students: StudentCourseProgress[];
  enrollments: Enrollment[]; analytics: ClassAnalytics[]; announcements: Announcement[];
  announcementForm: { title: string; content: string }; setAnnouncementForm: (f: { title: string; content: string }) => void;
  onPostAnnouncement: (e: React.FormEvent) => void; isOwner: boolean;
}) {
  const latest = analytics[analytics.length - 1];
  const demoLabels = genDemoLabels(14);
  const demoEnrollment = genDemoTimeSeries(14, 0, 15);
  const demoActive = genDemoTimeSeries(14, 0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {([
          { label: 'Students', val: enrollments.length || students.length, icon: <Users size={18} />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
          { label: 'Lessons', val: lessons.length, icon: <BookOpen size={18} />, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50' },
          { label: 'Diagrams', val: diagrams.length, icon: <Grid size={18} />, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50' },
          { label: 'Avg Score', val: latest ? `${latest.avg_score.toFixed(0)}%` : '72%', icon: <Target size={18} />, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
          { label: 'Completion', val: latest ? `${latest.completion_rate.toFixed(0)}%` : '58%', icon: <TrendingUp size={18} />, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50' },
        ] as const).map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
            <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-2`}><div className={`bg-gradient-to-r ${s.color} text-white rounded-lg p-1`}>{s.icon}</div></div>
            <p className="text-2xl font-extrabold text-gray-900">{s.val}</p>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Enrollment Trend" icon={<LineChart size={16} className="text-blue-500" />}>
          <div className="h-52">
            <Line data={{
              labels: analytics.length > 1 ? analytics.map(a => fmtDate(a.snapshot_date)) : demoLabels,
              datasets: [
                { label: 'Enrolled', data: analytics.length > 1 ? analytics.map(a => a.total_enrolled) : demoEnrollment, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
                { label: 'Active', data: analytics.length > 1 ? analytics.map(a => a.active_students) : demoActive, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 2 },
              ],
            }} options={chartOpts(true)} />
          </div>
        </Card>
        <Card title="Class Composition" icon={<PieChart size={16} className="text-purple-500" />}>
          <div className="h-52 flex items-center justify-center">
            <Doughnut data={{
              labels: ['Lessons', 'Diagrams', 'Assignments', 'Resources'],
              datasets: [{ data: [lessons.length || 3, diagrams.length || 2, 1, 2], backgroundColor: ['#8b5cf6', '#f97316', '#3b82f6', '#10b981'], borderWidth: 0, hoverOffset: 8 }],
            }} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 12, font: { size: 11 } } } } }} />
          </div>
        </Card>
      </div>

      <Card title="About This Class" icon={<FileText size={16} className="text-gray-500" />}>
        <p className="text-gray-600 text-sm leading-relaxed">{course.description || 'No Description Provided. Click Edit To Add One.'}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {course.tags?.map(t => <span key={t} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{t}</span>)}
          <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs flex items-center gap-1"><Clock size={10} /> Created {fmtDate(course.created_at)}</span>
        </div>
      </Card>

      <Card title="Announcements" icon={<Megaphone size={16} className="text-blue-500" />}>
        {isOwner && (
          <form onSubmit={onPostAnnouncement} className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl space-y-3 border border-gray-100">
            <input value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} placeholder="Announcement title..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <textarea value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} placeholder="Write your announcement..." rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none" required />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition">Post</button>
          </form>
        )}
        {announcements.length === 0 ? <p className="text-gray-400 text-sm py-4">No Announcements Yet.</p> : (
          <div className="space-y-2">{announcements.map(a => (
            <div key={a.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50/50 transition">
              <div className="flex items-center justify-between"><p className="font-semibold text-gray-900 text-sm">{a.title}</p><span className="text-xs text-gray-400">{fmtDate(a.created_at)}</span></div>
              <p className="text-gray-500 text-xs mt-1">{a.content}</p>
            </div>
          ))}</div>
        )}
      </Card>
    </div>
  );
}

function LessonsTab({ lessons, isOwner, onCreate, onDelete }: { lessons: CustomLesson[]; isOwner: boolean; onCreate: () => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900">Lessons</h3>
          <p className="text-sm text-gray-500">{lessons.length} Lesson{lessons.length !== 1 ? 's' : ''} Created</p>
        </div>
        {isOwner && <button onClick={onCreate} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-xl hover:shadow-blue-500/25 transition flex items-center gap-2"><Sparkles size={15} /> Create with AI</button>}
      </div>
      {lessons.length === 0 ? (
        <EmptyState icon={<Sparkles size={48} />} title="No Lessons Yet" desc="Create AI-powered braille lessons for your students" action={isOwner ? { label: 'Create Lesson', onClick: onCreate } : undefined} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{l.title}</h4>
                  <p className="text-gray-500 text-xs line-clamp-2 mt-1">{l.description || 'No Description'}</p>
                </div>
                {isOwner && <button onClick={() => onDelete(l.id)} className="ml-2 text-gray-300 hover:text-red-500 transition"><Trash2 size={15} /></button>}
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold">Level {l.level}</span>
                <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600">{(l.exercises as unknown[]).length} exercises</span>
                <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 flex items-center gap-1"><Clock size={10} />{l.duration}m</span>
                {l.ai_generated && <span className="px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold flex items-center gap-1"><Sparkles size={10} /> AI</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiagramsTab({ diagrams, isOwner, onCreate, onDelete }: { diagrams: BrailleDiagram[]; isOwner: boolean; onCreate: () => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-gray-900">Braille Diagrams</h3><p className="text-sm text-gray-500">{diagrams.length} Diagram{diagrams.length !== 1 ? 's' : ''}</p></div>
        {isOwner && <button onClick={onCreate} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold hover:shadow-xl hover:shadow-orange-500/25 transition flex items-center gap-2"><Plus size={15} /> New Diagram</button>}
      </div>
      {diagrams.length === 0 ? (
        <EmptyState icon={<Grid size={48} />} title="No Diagrams Yet" desc="Create interactive braille cell diagrams" action={isOwner ? { label: 'Create Diagram', onClick: onCreate } : undefined} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diagrams.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-gray-900">{d.title}</h4>
                {isOwner && <button onClick={() => onDelete(d.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={15} /></button>}
              </div>
              <p className="text-gray-500 text-xs mb-3">{d.description || 'Interactive Braille Diagram'}</p>
              <div className="flex gap-1.5 overflow-hidden p-2 bg-orange-50 rounded-xl">
                {d.cells.slice(0, 8).map((c, ci) => (
                  <div key={ci} className="w-8 h-10 rounded-lg border-2 border-orange-200 bg-white flex items-center justify-center shadow-sm"><span className="text-orange-700 text-xs font-bold font-mono">{c.char || '?'}</span></div>
                ))}
                {d.cells.length > 8 && <span className="text-orange-400 text-xs self-center ml-1 font-bold">+{d.cells.length - 8}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentsTab({ students, enrollments }: { students: StudentCourseProgress[]; enrollments: Enrollment[] }) {
  const allStudents = students.length > 0 ? students : enrollments.filter(e => e.role === 'student');
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-extrabold text-gray-900">Students ({allStudents.length})</h3>
      {allStudents.length === 0 ? (
        <EmptyState icon={<Users size={48} />} title="No Students Yet" desc="Share your class link to get students enrolled!" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
              <tr>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Streak</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Lessons</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(students.length > 0 ? students : []).map((s, i) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'][i % 4]}`}>{s.profile?.display_name?.[0]?.toUpperCase() || '?'}</div>
                    <span className="text-sm font-semibold text-gray-900">{s.profile?.display_name || 'Student'}</span>
                  </td>
                  <td className="px-5 py-3.5"><span className={`text-sm font-bold ${s.avg_score >= 80 ? 'text-green-600' : s.avg_score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>{s.avg_score.toFixed(0)}%</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm text-gray-700 flex items-center gap-1"><Flame size={12} className="text-orange-500" />{s.current_streak}d</span></td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{s.lessons_completed}</td>
                  <td className="px-5 py-3.5"><span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">Active</span></td>
                </tr>
              ))}
              {students.length === 0 && enrollments.map((e, i) => (
                <tr key={e.id} className="hover:bg-blue-50/30 transition">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs ${['bg-blue-500', 'bg-purple-500', 'bg-green-500'][i % 3]}`}>{e.profile?.display_name?.[0]?.toUpperCase() || '?'}</div>
                    <span className="text-sm font-semibold text-gray-900">{e.profile?.display_name || 'Student'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">—</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">—</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">—</td>
                  <td className="px-5 py-3.5"><span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Enrolled</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function MeetingsTab({ meetings, isOwner, onStart, onJoin }: { meetings: MeetingRoomType[]; isOwner: boolean; onStart: () => void; onJoin: (m: MeetingRoomType) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h3 className="text-xl font-extrabold text-gray-900">Meetings</h3><p className="text-sm text-gray-500">{meetings.length} Active</p></div>
        {isOwner && <button onClick={onStart} className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition flex items-center gap-2 shadow-lg shadow-green-500/20"><Video size={14} /> New Meeting</button>}
      </div>
      {meetings.length === 0 ? (
        <EmptyState icon={<Video size={48} />} title="No Active Meetings" desc="Start a live video meeting with your students" action={isOwner ? { label: 'Start Meeting', onClick: onStart } : undefined} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {meetings.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border-2 border-green-100 p-5 shadow-sm hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /><span className="text-xs font-bold text-red-600">LIVE</span></div>
                <CopyBtn text={m.room_code} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{m.title}</h4>
              <p className="text-xs text-gray-500 mb-4 font-mono">{m.room_code}</p>
              <button onClick={() => onJoin(m)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg transition flex items-center justify-center gap-2"><Play size={14} /> Join</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsTab({ analytics, students, enrollments, lessons, diagrams }: {
  analytics: ClassAnalytics[]; students: StudentCourseProgress[]; enrollments: Enrollment[];
  lessons: CustomLesson[]; diagrams: BrailleDiagram[];
}) {
  const latest = analytics[analytics.length - 1];
  const demoLabels = genDemoLabels(21);
  const hasReal = analytics.length > 1;

  const skillLabels = ['Letters', 'Words', 'Sentences', 'Contractions', 'Speed', 'Writing'];
  const skillKeys = ['letterRecognition', 'wordReading', 'sentenceReading', 'contractions', 'speed', 'writing'];
  const avgSkills = skillKeys.map(k => {
    if (students.length === 0) return 15 + Math.random() * 45;
    return students.reduce((a, s) => a + (((s.skills as Record<string, number>) || {})[k] || 0), 0) / students.length;
  });

  const dEnroll = genDemoTimeSeries(21, 2, 20);
  const dActive = genDemoTimeSeries(21, 1, 12);
  const dScore = genDemoTimeSeries(21, 40, 95);
  const dCompletion = genDemoTimeSeries(21, 20, 80);
  const dAttendance = genDemoTimeSeries(21, 50, 100);
  const dLessonsCompleted = genDemoTimeSeries(21, 0, 30);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {([
          { label: 'Enrolled', val: enrollments.length || Math.round(dEnroll[dEnroll.length - 1]), icon: <Users size={16} />, color: 'text-blue-600 bg-blue-50', trend: '+12%' },
          { label: 'Active (7d)', val: latest?.active_students ?? Math.round(dActive[dActive.length - 1]), icon: <Activity size={16} />, color: 'text-green-600 bg-green-50', trend: '+8%' },
          { label: 'Avg Score', val: `${(latest?.avg_score ?? dScore[dScore.length - 1]).toFixed(0)}%`, icon: <Target size={16} />, color: 'text-purple-600 bg-purple-50', trend: '+5%' },
          { label: 'Completion', val: `${(latest?.completion_rate ?? dCompletion[dCompletion.length - 1]).toFixed(0)}%`, icon: <TrendingUp size={16} />, color: 'text-orange-600 bg-orange-50', trend: '+15%' },
          { label: 'Attendance', val: `${(latest?.attendance_rate ?? dAttendance[dAttendance.length - 1]).toFixed(0)}%`, icon: <Calendar size={16} />, color: 'text-indigo-600 bg-indigo-50', trend: '+3%' },
          { label: 'Lessons Done', val: latest?.lessons_completed ?? Math.round(dLessonsCompleted[dLessonsCompleted.length - 1]), icon: <BookOpen size={16} />, color: 'text-pink-600 bg-pink-50', trend: '+20%' },
        ] as const).map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-sm">
            <div className={`inline-flex p-1.5 rounded-lg ${s.color} mb-2`}>{s.icon}</div>
            <p className="text-xl font-extrabold text-gray-900">{s.val}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{s.label}</p>
              <span className="text-xs text-green-600 font-semibold">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Enrollment & Activity" icon={<LineChart size={16} className="text-blue-500" />}>
          <div className="h-60">
            <Line data={{
              labels: hasReal ? analytics.map(a => fmtDate(a.snapshot_date)) : demoLabels,
              datasets: [
                { label: 'Enrolled', data: hasReal ? analytics.map(a => a.total_enrolled) : dEnroll, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 1 },
                { label: 'Active', data: hasReal ? analytics.map(a => a.active_students) : dActive, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 1 },
              ],
            }} options={chartOpts(true)} />
          </div>
          {!hasReal && <p className="text-xs text-gray-400 text-center mt-2 italic">Demo Data — Real Analytics Will Appear As Students Engage</p>}
        </Card>

        <Card title="Scores & Completion" icon={<TrendingUp size={16} className="text-orange-500" />}>
          <div className="h-60">
            <Line data={{
              labels: hasReal ? analytics.map(a => fmtDate(a.snapshot_date)) : demoLabels,
              datasets: [
                { label: 'Avg Score', data: hasReal ? analytics.map(a => a.avg_score) : dScore, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 1 },
                { label: 'Completion %', data: hasReal ? analytics.map(a => a.completion_rate) : dCompletion, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 1 },
              ],
            }} options={{ ...chartOpts(true), scales: { ...chartOpts(true).scales, y: { ...chartOpts(true).scales.y, max: 100 } } }} />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title="Skill Radar" icon={<Brain size={16} className="text-purple-500" />}>
          <div className="h-60 flex items-center justify-center">
            <Radar data={{
              labels: skillLabels,
              datasets: [{ label: 'Avg Skill', data: avgSkills.map(v => Math.round(v)), backgroundColor: 'rgba(139,92,246,0.15)', borderColor: '#8b5cf6', borderWidth: 2, pointBackgroundColor: '#8b5cf6', pointRadius: 4 }],
            }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, ticks: { display: false }, grid: { color: '#e2e8f0' }, pointLabels: { font: { size: 10 } } } } }} />
          </div>
        </Card>

        <Card title="Content Distribution" icon={<PieChart size={16} className="text-pink-500" />}>
          <div className="h-60 flex items-center justify-center">
            <Doughnut data={{
              labels: ['Lessons', 'Diagrams', 'Students', 'Meetings'],
              datasets: [{ data: [lessons.length || 4, diagrams.length || 2, enrollments.length || 8, 1], backgroundColor: ['#8b5cf6', '#f97316', '#3b82f6', '#10b981'], borderWidth: 0, hoverOffset: 10 }],
            }} options={{ responsive: true, maintainAspectRatio: false, cutout: '55%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 10, font: { size: 10 } } } } }} />
          </div>
        </Card>

        <Card title="Attendance Trend" icon={<Calendar size={16} className="text-indigo-500" />}>
          <div className="h-60">
            <Bar data={{
              labels: hasReal ? analytics.map(a => fmtDate(a.snapshot_date)) : demoLabels.slice(-10),
              datasets: [{ label: 'Attendance %', data: hasReal ? analytics.map(a => a.attendance_rate) : dAttendance.slice(-10), backgroundColor: 'rgba(99,102,241,0.7)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 6 }],
            }} options={{ ...chartOpts(), scales: { ...chartOpts().scales, y: { ...chartOpts().scales.y, max: 100 } } }} />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Lesson Completion Progress" icon={<BookOpen size={16} className="text-blue-500" />}>
          <div className="h-60">
            <Bar data={{
              labels: hasReal ? analytics.map(a => fmtDate(a.snapshot_date)) : demoLabels.slice(-14),
              datasets: [
                { label: 'Started', data: hasReal ? analytics.map(a => (a as ClassAnalytics & { lessons_started?: number }).lessons_started || 0) : genDemoTimeSeries(14, 1, 15), backgroundColor: 'rgba(59,130,246,0.4)', borderRadius: 4 },
                { label: 'Completed', data: hasReal ? analytics.map(a => a.lessons_completed) : genDemoTimeSeries(14, 0, 10), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4 },
              ],
            }} options={{ ...chartOpts(true), scales: { ...chartOpts(true).scales, x: { ...chartOpts(true).scales.x, stacked: true }, y: { ...chartOpts(true).scales.y, stacked: true } } }} />
          </div>
        </Card>

        <Card title="Top Students" icon={<Award size={16} className="text-yellow-500" />}>
          {students.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto mb-2 text-gray-300" size={36} />
              <p className="text-gray-400 text-sm">Student Leaderboard Will Appear Here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">{students.slice(0, 10).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'][i % 4]}`}>{s.profile?.display_name?.[0]?.toUpperCase() || '?'}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">{s.profile?.display_name || 'Student'}</p><p className="text-xs text-gray-400">{s.lessons_completed} Lessons · {s.current_streak}d Streak</p></div>
                <span className="text-sm font-extrabold text-blue-600">{s.avg_score.toFixed(0)}%</span>
              </div>
            ))}</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto mt-8 mb-8">{children}</div>
    </motion.div>
  );
}

function Modal({ onClose, title, children, icon, wide }: { onClose: () => void; title: string; children: React.ReactNode; icon?: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}
        className={`${wide ? 'max-w-3xl' : 'max-w-lg'} w-full mt-12 mb-8 bg-white rounded-3xl shadow-2xl border border-gray-100`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {icon && <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">{icon}</div>}
            <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 pt-5 pb-3"><span>{icon}</span><h3 className="font-bold text-gray-900 text-sm">{title}</h3></div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
      <div className="text-gray-300 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">{desc}</p>
      {action && <button onClick={action.onClick} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-blue-500/25 transition inline-flex items-center gap-2"><Plus size={16} /> {action.label}</button>}
    </div>
  );
}

function FormInput({ label, ...props }: { label: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & { onChange: (v: string) => void }) {
  const { onChange, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1.5">{label}</label>
      <input {...rest} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm" />
    </div>
  );
}

function FormTextArea({ label, ...props }: { label: string } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> & { onChange: (v: string) => void }) {
  const { onChange, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1.5">{label}</label>
      <textarea {...rest} rows={3} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm resize-none" />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition shadow-sm">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const c: Record<string, string> = { beginner: 'from-green-400 to-emerald-500 text-white', intermediate: 'from-yellow-400 to-orange-500 text-white', advanced: 'from-red-400 to-rose-500 text-white' };
  return <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gradient-to-r ${c[level] || c.beginner} shadow-sm capitalize`}>{level}</span>;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-gray-400 hover:text-gray-700 transition" title="Copy room code">
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export default ClassHubPage;