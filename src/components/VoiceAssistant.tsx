import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2, VolumeX, Bot } from 'lucide-react';
import { geminiService } from '../services/geminiService';

// ═══════════════════════════════════════════════════════
//  BRAYLIN — Always-listening BrailleLearn voice robot
//  No wake word needed — Braylin hears every command.
//  Compact, sleek UI. Commands for every feature.
// ═══════════════════════════════════════════════════════

// ─── Page routes ───
const ROUTE_MAP: { keywords: string[]; path: string; label: string; desc: string }[] = [
  { keywords: ['home', 'main', 'start', 'beginning', 'welcome', 'front page', 'homepage', 'landing'], path: '/', label: 'Home', desc: 'the home page' },
  { keywords: ['learn', 'lesson', 'study', 'course', 'dashboard', 'learning', 'curriculum', 'schedule'], path: '/learn', label: 'Learn', desc: 'the learning dashboard' },
  { keywords: ['practice', 'drill', 'exercise', 'quiz', 'test', 'game', 'play', 'training', 'games'], path: '/practice', label: 'Practice', desc: 'practice mode' },
  { keywords: ['speech', 'speech to braille', 'convert', 'dictate', 'translator', 'translate', 'voice to braille'], path: '/speech-to-braille', label: 'Speech to Braille', desc: 'the speech to braille converter' },
  { keywords: ['hardware', 'arduino', 'device', 'connect', 'setup', 'solenoid', 'bluetooth', 'display'], path: '/hardware-setup', label: 'Hardware Setup', desc: 'hardware setup' },
  { keywords: ['class', 'classroom', 'teacher', 'class hub', 'students', 'tutor', 'tutoring', 'classes'], path: '/class-hub', label: 'Class Hub', desc: 'the class hub' },
  { keywords: ['quest', 'mission', 'braille quest', 'adventure', 'missions', 'quests', 'challenges', 'explore'], path: '/braillequest', label: 'BrailleQuest', desc: 'BrailleQuest missions' },
  { keywords: ['about', 'info', 'information', 'team', 'who made this'], path: '/about', label: 'About', desc: 'the about page' },
  { keywords: ['stats', 'statistics', 'progress', 'analytics', 'my progress', 'how am i doing'], path: '/statistics', label: 'Statistics', desc: 'your statistics' },
  { keywords: ['access', 'accessibility', 'preferences', 'customize', 'settings', 'accessible'], path: '/accessibility', label: 'Accessibility', desc: 'accessibility settings' },
];

// ─── Schedule / AI agent keywords ───
const AI_AGENT_KEYWORDS = [
  'add', 'remove', 'change', 'edit', 'modify', 'update',
  'more time', 'less time', 'extend', 'shorten',
  'math', 'letter', 'alphabet', 'number', 'contraction', 'word', 'sentence',
  'punctuation', 'symbol', 'capital', 'music', 'spanish', 'poetry',
  'computer', 'tech', 'speed', 'compound', 'format', 'document',
  'easier', 'harder', 'random', 'shuffle', 'rush', 'slow down',
  'clear schedule', 'reset schedule',
  'replace', 'swap', 'increase', 'decrease', 'double', 'halve',
  'focus on', 'skip', 'prioritize', 'reorder', 'rearrange',
];

// ─── Wizard keywords ───
const WIZARD_KEYWORDS = [
  'create a plan', 'make a plan', 'make me a plan', 'study plan',
  'make a study plan', 'create study plan', 'new plan', 'build a plan',
  'set up a plan', 'set up my plan', 'plan my learning', 'learning plan',
  'personalize', 'personalized plan', 'custom plan',
  'generate a plan', 'i need a plan', 'give me a plan', 'design a plan',
  'start a plan', 'build my plan', 'help me plan', 'plan for me',
  'set up my schedule', 'create a schedule', 'make me a schedule',
];

// ─── Page narrations ───
const PAGE_NARRATIONS: Record<string, string> = {
  '/': 'Home page. Say "start learning", "connect hardware", "go to missions", or "help" for all commands.',
  '/learn': 'Learning Dashboard. Say "view lessons" to hear your lessons for today. "Overview", "lessons", or "practice" tab. "Start lesson" to begin. "Edit schedule" to change your plan. Say a day name like "Monday" to switch days.',
  '/practice': 'Practice page. Say a mode name: Lightning Reader, Precision Master, Pattern Detective, Braille Architect, Marathon Master, Memory Champion, Speed Demon, or Pattern Ninja.',
  '/speech-to-braille': 'Speech to Braille converter. Just speak text to convert it.',
  '/hardware-setup': 'Hardware Setup. Say "setup tab", "test tab", or "troubleshoot tab".',
  '/class-hub': 'Class Hub. Say "tutors", "classes", "dashboard", "resources". "Create class", "join class", "open meeting", or "view stats".',
  '/braillequest': 'BrailleQuest missions! Say "next mission", "leaderboard", "rewards", "badges", "achievements". Say "level 1" through "level 6" to filter. "Submit", "take photo", "view lesson", "next section", "previous section", "read this", or "close".',
  '/about': 'About page. Say "mission", "hardware", "design", "features", or "tech".',
  '/statistics': 'Statistics dashboard.',
  '/accessibility': 'Accessibility settings.',
};

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const greetedPagesRef = useRef<Set<string>>(new Set());
  const autoGreetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(false);
  const alwaysListenRef = useRef(true);
  const isListeningRef = useRef(false);
  const handleCommandRef = useRef<(text: string) => Promise<void>>(async () => {});
  const startListeningRef = useRef<() => void>(() => {});
  const pendingGreetRef = useRef<string | null>(null);
  const hasUserGestureRef = useRef(false);
  const livePreviewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mutedRef = useRef(false);

  // ─── Speak (Braylin's voice) ───
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      // If muted, skip speech entirely
      if (mutedRef.current) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.1;
      utterance.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                        voices.find(v => v.lang === 'en-US') ||
                        voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => { hasUserGestureRef.current = true; setIsSpeaking(true); isSpeakingRef.current = true; };
      utterance.onend = () => {
        setIsSpeaking(false); isSpeakingRef.current = false;
        // Auto-restart listening after speaking finishes
        if (alwaysListenRef.current) {
          setTimeout(() => {
            if (alwaysListenRef.current && !isSpeakingRef.current && !isListeningRef.current) {
              startListeningRef.current();
            }
          }, 200);
        }
        resolve();
      };
      utterance.onerror = (e) => {
        setIsSpeaking(false); isSpeakingRef.current = false;
        // If speech was blocked (no user gesture yet), queue it for later
        if (!hasUserGestureRef.current && (e as any).error === 'not-allowed') {
          pendingGreetRef.current = text;
        }
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ─── Recognition (always-on, continuous) ───
  const setListening = useCallback((val: boolean) => {
    isListeningRef.current = val;
    setIsListening(val);
  }, []);

  const startListeningInternal = useCallback(() => {
    if (isSpeakingRef.current) return;
    if (isListeningRef.current) return; // already listening, skip
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* */ }
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      // If we're getting results, mic access is confirmed
      hasUserGestureRef.current = true;
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      // Show live preview of what user is saying
      const previewText = finalText || interimText;
      setTranscript(previewText);
      setInterimTranscript(interimText);
      if (previewText) {
        setShowLivePreview(true);
        if (livePreviewTimeoutRef.current) clearTimeout(livePreviewTimeoutRef.current);
        livePreviewTimeoutRef.current = setTimeout(() => setShowLivePreview(false), 3000);
      }
      if (finalText) {
        // Flash the final text briefly, then fade
        if (livePreviewTimeoutRef.current) clearTimeout(livePreviewTimeoutRef.current);
        livePreviewTimeoutRef.current = setTimeout(() => { setShowLivePreview(false); setInterimTranscript(''); }, 2000);
        handleCommandRef.current(finalText.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      // Permission denied or other error — mark not listening
      recognitionRef.current = null;
      setListening(false);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      isListeningRef.current = false; // allow restart
      if (alwaysListenRef.current && !isSpeakingRef.current) {
        // DON'T call setIsListening(false) — avoids the visual flicker
        restartTimeoutRef.current = setTimeout(() => {
          if (alwaysListenRef.current && !isSpeakingRef.current) startListeningInternal();
        }, 300);
      } else {
        setIsListening(false); // only update UI when actually stopping
      }
    };

    recognitionRef.current = recognition;
    setListening(true);
    try { recognition.start(); } catch {
      recognitionRef.current = null;
      setListening(false);
    }
  }, [setListening]);

  // ─── Handle any voice command (no wake word needed) ───
  const handleCommand = useCallback(async (text: string) => {
    const lower = text.toLowerCase().trim();
    // Strip conversational prefixes so "can I edit my plan" → "edit my plan"
    const stripped = lower
      .replace(/^(hey\s+)?braylin[,]?\s*/i, '')
      .replace(/^(can (you|i|we)|could (you|i|we)|would (you|i)|will (you|i)|i('d| would) like (to|you to)?|i want (to|you to)?|i need (to|you to)?|i('d| would) love to|let me|let's|help me|please|show me|take me (to)?|bring me (to)?|navigate\s*(me\s*)?(to)?|go\s*(to)?|(switch|change)\s*(to|over to)?|open\s*(up)?|give me|tell me (about)?|how (do|can) (i|you)|where (is|are|can i find)|what (is|are|about))\s*/i, '')
      .replace(/^\s*(the|a|an|my|some|that|this)\s+/i, '')
      .trim();

    setLastCommand(text);
    setStatus(`"${text}"`);

    // ─── Mute / unmute Braylin ───
    if (/\b(mute|shut up|quiet|stop talking|silence|be quiet|hush)\b/.test(lower)) {
      window.speechSynthesis.cancel();
      mutedRef.current = true;
      setIsMuted(true);
      // Stop mic too
      alwaysListenRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* */ }
      recognitionRef.current = null;
      setListening(false);
      setStatus('🔇 Fully muted. Tap the pill to unmute.');
      return;
    }
    if (/\b(unmute|speak|talk|volume|wake up|come back|turn on)\b/.test(lower)) {
      mutedRef.current = false;
      setIsMuted(false);
      alwaysListenRef.current = true;
      startListeningInternal();
      await speak('I\'m back! What do you need?');
      return;
    }

    // ─── Help ───
    if (/\b(what can you do|help|commands|list commands|what do you do|how does this work|what are my options|what should i say)\b/.test(lower)) {
      await speak(
        'I\'m Braylin, your hands-free guide. Everything works by voice! ' +
        'Navigation: "go to learn", "go to practice", "go to missions", "go to class hub", "go to about". ' +
        'Learn tabs: "overview", "lessons", "practice". "Edit schedule", "reset plan", "make me a study plan". ' +
        '"Select Monday" through "Sunday" to pick a day. ' +
        'Missions: "next mission", "leaderboard", "rewards", "badges", "level 1" to "level 6", "submit", "close". ' +
        'Class Hub: "tutors", "classes", "dashboard", "resources", "create class", "view stats", "open meeting". ' +
        'Practice: say any game name like "Lightning Reader" or "Speed Demon", then "start game". ' +
        'Auth: "sign in", "continue with google", "sign out". ' +
        'For popups, say "OK", "yes", or "confirm" to continue, or "no", "close", "dismiss" to cancel. ' +
        '"Where am I" for current page. I show a preview of what you\'re saying at the bottom of the screen.'
      );
      setTranscript('');
      return;
    }

    // ─── Where am I ───
    if (/\b(where am i|where are we|what page|current page|which page|what screen|what's this page)\b/.test(lower)) {
      if (/^\/learn\/.+/.test(location.pathname)) {
        await speak('You\'re in a lesson. Say "repeat pattern" for the braille dots, "read question" for the question, or "exit" to go back.');
      } else {
        await speak(PAGE_NARRATIONS[location.pathname] || `You're on ${location.pathname}.`);
      }
      setTranscript('');
      return;
    }

    // ─── Sign in / Sign out / Continue with Google ───
    if (/\b(sign in|log in|login|sign me in|i want to log in|get me signed in|authenticate)\b/.test(lower)) {
      setStatus('Opening sign in...');
      await speak('Opening the sign in dialog. Say "continue with Google" to sign in with Google.');
      window.dispatchEvent(new CustomEvent('braylin-auth', { detail: { action: 'sign-in' } }));
      setTranscript('');
      return;
    }
    if (/\b(sign up|register|create account)\b/.test(lower)) {
      setStatus('Opening sign up...');
      await speak('Opening sign up. You can also say "continue with Google".');
      window.dispatchEvent(new CustomEvent('braylin-auth', { detail: { action: 'sign-in' } }));
      setTranscript('');
      return;
    }
    if (/\b(continue\s*with\s*google|google\s*sign\s*in|use\s*google|google\s*login)\b/.test(lower)) {
      setStatus('Signing in with Google...');
      await speak('Signing in with Google now.');
      window.dispatchEvent(new CustomEvent('braylin-auth', { detail: { action: 'google' } }));
      setTranscript('');
      return;
    }
    if (/\b(sign out|log out|logout)\b/.test(lower)) {
      setStatus('Signing out...');
      await speak('Signing you out now.');
      window.dispatchEvent(new CustomEvent('braylin-auth', { detail: { action: 'sign-out' } }));
      setTranscript('');
      return;
    }

    // ─── Read schedule ───
    if (/\b(what('s| is) on (my |the )?schedule|today('s| s) (lesson|schedule)|my schedule|read (my )?schedule|what('s| do i) (have )?today|what should i (study|learn|do)|show (my )?schedule|what lessons do i have|what am i studying|my lessons for today)\b/.test(lower)) {
      window.dispatchEvent(new CustomEvent('braylin-read-schedule'));
      setTranscript('');
      return;
    }

    // ─── Edit schedule (go to lessons tab, ask what to change) ───
    if (/\b(edit|change|modify|update|adjust|fix|rearrange|tweak|customize|manage)\s*(my\s*)?(schedule|plan|lessons?|week|study|curriculum)?\b/.test(lower) && /\b(edit|change|modify|update|adjust|fix|rearrange|tweak|customize|manage)\b/.test(lower) && !/\b(next|go|navigate)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
      await speak('Here\'s your weekly schedule. What would you like to change? Say things like "add letter lessons", "remove math", "more practice time", or describe any change.');
      setTranscript('');
      return;
    }

    // ─── Reset plan ───
    if (/\b(reset\s*(my\s*)?(plan|schedule)|clear\s*(my\s*)?(plan|schedule)|start\s*over|new\s*plan)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-learn-action', { detail: { action: 'reset-plan' } }));
      await speak('Plan reset. Say "make me a study plan" to create a new one.');
      setTranscript('');
      return;
    }

    // ─── Select day in schedule (Mon-Sun) ───
    if (/\b(select|pick|choose|show)\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(lower)) {
      const dayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
      if (dayMatch) {
        await ensurePage('/learn', 'Learn');
        window.dispatchEvent(new CustomEvent('braylin-learn-action', { detail: { action: 'select-day', day: dayMatch[1] } }));
        await speak(`Selected ${dayMatch[1]}.`);
        setTranscript('');
        return;
      }
    }

    // ─── Study plan wizard ───
    if (WIZARD_KEYWORDS.some(kw => lower.includes(kw))) {
      if (location.pathname !== '/learn') {
        await speak('Going to Learn to create your plan.');
        navigate('/learn');
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 1200));
      }
      await speak(
        'Let\'s build your study plan. What\'s your braille level? ' +
        'Brand New, Some Basics, Beginner, Intermediate, Advanced, or Expert.'
      );
      window.dispatchEvent(new CustomEvent('braylin-open-wizard'));
      setTranscript('');
      return;
    }

    // ─── Wizard answers (level) ───
    if (/\b(brand new|some basics)\b/.test(lower) || /^(beginner|intermediate|advanced|expert)$/i.test(stripped)) {
      const levelMap: Record<string, { val: number; label: string }> = {
        'brand new': { val: 1, label: 'Brand New' },
        'some basics': { val: 5, label: 'Some Basics' },
        'beginner': { val: 10, label: 'Beginner' },
        'intermediate': { val: 15, label: 'Intermediate' },
        'advanced': { val: 20, label: 'Advanced' },
        'expert': { val: 25, label: 'Expert' },
      };
      for (const [key, info] of Object.entries(levelMap)) {
        if (lower.includes(key)) {
          window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'set-level', value: info.val } }));
          await speak(`Level: ${info.label}. Learning style? Visual, Tactile, Auditory, Kinesthetic, or Mixed.`);
          setTranscript('');
          return;
        }
      }
    }

    // ─── Wizard answers (style) ───
    const styleMatch = stripped.match(/^(visual|tactile|auditory|kinesthetic|mixed)$/);
    if (styleMatch) {
      window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'set-style', value: styleMatch[1] } }));
      await speak(`Style: ${styleMatch[1]}. Focus area? Fundamentals, Words, Sentences, Contractions, Writing, or Everything.`);
      setTranscript('');
      return;
    }

    // ─── Wizard answers (focus) ───
    if (/^(fundamentals|words|vocabulary|sentences|contractions|writing|everything)$/i.test(stripped)) {
      const focusMap: Record<string, string> = { 'fundamentals': 'basics', 'words': 'words', 'vocabulary': 'words', 'sentences': 'sentences', 'contractions': 'contractions', 'writing': 'writing', 'everything': 'all' };
      const key = Object.keys(focusMap).find(k => stripped.includes(k));
      if (key) {
        window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'set-focus', value: focusMap[key] } }));
        await speak(`Focus: ${key}. Daily study time? 15 minutes, 30 minutes, or 1 hour.`);
        setTranscript('');
        return;
      }
    }

    // ─── Wizard answers (time) ───
    if (/\b(15 min|30 min|1 hour|one hour|60 min|half hour)\b/.test(lower)) {
      let m = '30';
      if (/15/.test(lower)) m = '15';
      else if (/60|1 hour|one hour/.test(lower)) m = '60';
      window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'set-time', value: m } }));
      await speak(`${m} minutes. Difficulty? Easy, Medium, or Hard.`);
      setTranscript('');
      return;
    }

    // ─── Wizard answers (difficulty) ───
    if (/^(easy|medium|hard)$/i.test(stripped)) {
      const map: Record<string, string> = { 'easy': 'beginner', 'medium': 'intermediate', 'hard': 'advanced' };
      window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'set-difficulty', value: map[stripped] || 'intermediate' } }));
      await speak(`Difficulty: ${stripped}. Which days? Say "every day", "weekdays", or list specific days.`);
      setTranscript('');
      return;
    }

    // ─── Wizard answers (days) ───
    if (/\b(every day|weekday|weekend)\b/.test(lower) || /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(lower)) {
      let days: string[] = [];
      if (/every\s*day/.test(lower)) days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      else if (/weekday/.test(lower)) days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      else if (/weekend/.test(lower)) days = ['saturday', 'sunday'];
      else {
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(d => { if (lower.includes(d)) days.push(d); });
      }
      if (days.length === 0) days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'set-days', value: days } }));
      await speak(`Days set. Say "confirm" or "generate" to create your plan.`);
      setTranscript('');
      return;
    }

    // ─── Wizard confirm ───
    if (/\b(confirm|generate|create it|build it|go ahead|do it|generate my plan)\b/.test(lower)) {
      window.dispatchEvent(new CustomEvent('braylin-wizard-action', { detail: { action: 'generate' } }));
      await speak('Generating your study plan now.');
      setTranscript('');
      return;
    }

    // ═══════════════════════════════════════
    //  SUB-TAB COMMANDS — Learn page
    // ═══════════════════════════════════════
    if (/\b(overview\s*tab|overview\s*in\s*learn|show\s*overview)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'overview' } }));
      await speak('Switched to the overview tab.');
      setTranscript('');
      return;
    }
    if (/\b(lessons?\s*tab|lessons?\s*in\s*learn|browse\s*lessons?|show\s*lessons?)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons' } }));
      await speak('Switched to the lessons tab.');
      setTranscript('');
      return;
    }
    if (/\b(practice\s*tab|practice\s*in\s*learn|show\s*practice)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'practice' } }));
      await speak('Switched to the practice tab.');
      setTranscript('');
      return;
    }
    // Learn lessons sub-tabs
    if (/\b(browse\s*tab|browse\s*all|all\s*lessons?)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'browse' } }));
      await speak('Showing all lessons to browse.');
      setTranscript('');
      return;
    }
    if (/\b(week(ly)?\s*(schedule|tab|view)|my\s*week|schedule\s*tab)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
      await speak('Showing your weekly schedule.');
      setTranscript('');
      return;
    }

    // ─── View lessons (read them out) ───
    if (/\b(view\s*(my\s*)?lessons?|read\s*(my\s*)?lessons?|what\s*(are\s*)?(my\s*)?lessons?|list\s*(my\s*)?lessons?|show\s*(my\s*)?lessons?|what('s| is)\s*(on|for)\s*(my\s*)?(today|this week)|tell me (about )?my lessons?)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
      const dayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today)\b/);
      const day = dayMatch ? (dayMatch[1] === 'today' ? undefined : dayMatch[1]) : undefined;
      await new Promise(r => setTimeout(r, 800));
      window.dispatchEvent(new CustomEvent('braylin-view-lessons', { detail: { day } }));
      setTranscript('');
      return;
    }

    // ─── Start lesson (for a specific day or today) ───
    if (/\b(start\s*(a\s*)?lesson|begin\s*(a\s*)?lesson|launch\s*lesson)\b/.test(lower)) {
      await ensurePage('/learn', 'Learn');
      const dayMatch = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today)\b/);
      const day = dayMatch ? (dayMatch[1] === 'today' ? undefined : dayMatch[1]) : undefined;
      window.dispatchEvent(new CustomEvent('braylin-start-lesson', { detail: { day } }));
      setTranscript('');
      return;
    }

    // ─── Repeat braille pattern (while in a lesson) ───
    if (/\b(repeat\s*(the\s*)?(pattern|dots|braille)|what\s*(are\s*)?(the\s*)?(dots|pattern))\b/.test(lower) && /^\/learn\/.+/.test(location.pathname)) {
      window.dispatchEvent(new CustomEvent('braylin-lesson-action', { detail: { action: 'repeat-pattern' } }));
      setTranscript('');
      return;
    }

    // ─── Read question (while in a lesson) ───
    if (/\b(read\s*(the\s*)?question|what('s| is)\s*(the\s*)?question|repeat\s*question)\b/.test(lower) && /^\/learn\/.+/.test(location.pathname)) {
      window.dispatchEvent(new CustomEvent('braylin-lesson-action', { detail: { action: 'read-question' } }));
      setTranscript('');
      return;
    }

    // ─── Answer by voice in a lesson ───
    if (/\b(answer|my answer is|i think it's|it's|the answer is)\s+(.+)/i.test(lower) && /^\/learn\/.+/.test(location.pathname)) {
      const answerMatch = lower.match(/\b(?:answer|my answer is|i think it's|it's|the answer is)\s+(.+)/i);
      if (answerMatch) {
        window.dispatchEvent(new CustomEvent('braylin-lesson-action', { detail: { action: 'answer', value: answerMatch[1].trim() } }));
        setTranscript('');
        return;
      }
    }

    // ─── Select day by just saying the day name (for lesson view) ───
    if (/^(today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i.test(stripped)) {
      if (location.pathname === '/learn') {
        const day = stripped === 'today' ? undefined : stripped;
        if (stripped === 'today') {
          window.dispatchEvent(new CustomEvent('braylin-view-lessons', { detail: {} }));
        } else {
          window.dispatchEvent(new CustomEvent('braylin-learn-action', { detail: { action: 'select-day', day: stripped } }));
          await new Promise(r => setTimeout(r, 500));
          window.dispatchEvent(new CustomEvent('braylin-view-lessons', { detail: { day } }));
        }
        setTranscript('');
        return;
      }
    }

    // ═══════════════════════════════════════
    //  SUB-TAB COMMANDS — BrailleQuest / Missions
    // ═══════════════════════════════════════
    if (/\b(xp|experience|xp\s*progress)\b/.test(lower) && !(/\b(navigate|go)\b/.test(lower))) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'xp' } }));
      await speak('Showing XP progress.');
      setTranscript('');
      return;
    }
    if (/\b(leaderboard|rankings?|top\s*(players?|users?))\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'leaderboard' } }));
      await speak('Showing leaderboard.');
      setTranscript('');
      return;
    }
    if (/\b(rewards?\s*(shop|store|tab)?|redeem)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'rewards' } }));
      await speak('Showing rewards.');
      setTranscript('');
      return;
    }
    if (/\b(badges?)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'badges' } }));
      await speak('Showing badges.');
      setTranscript('');
      return;
    }
    if (/\b(activity|recent\s*activity)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'activity' } }));
      await speak('Showing activity feed.');
      setTranscript('');
      return;
    }
    if (/\b(achievements?)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'achievements' } }));
      await speak('Showing achievements.');
      setTranscript('');
      return;
    }
    if (/\b(share|share\s*progress)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'braillequest', tab: 'share' } }));
      await speak('Showing share options.');
      setTranscript('');
      return;
    }
    if (/\b(next\s*mission|new\s*mission|start\s*mission|do\s*a\s*mission)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'next-mission' } }));
      await speak('Selecting next available mission for you.');
      setTranscript('');
      return;
    }
    // Mission category filters
    if (/\b(signage|transport|food|education|public|medical|recreation|government)\s*(missions?|category|filter)?\b/.test(lower)) {
      const catMatch = lower.match(/\b(signage|transport|food|education|public|medical|recreation|government)\b/);
      if (catMatch) {
        await ensurePage('/braillequest', 'BrailleQuest');
        window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'filter', category: catMatch[1] } }));
        await speak(`Filtering missions to ${catMatch[1]}.`);
        setTranscript('');
        return;
      }
    }
    if (/\b(all\s*missions?|show\s*all|clear\s*filter)\b/.test(lower)) {
      await ensurePage('/braillequest', 'BrailleQuest');
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'filter', category: 'all' } }));
      await speak('Showing all missions.');
      setTranscript('');
      return;
    }

    // ═══════════════════════════════════════
    //  SUB-TAB COMMANDS — Class Hub
    // ═══════════════════════════════════════
    if (/\b(tutors?\s*tab|show\s*tutors?|browse\s*tutors?|find\s*tutor)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'class-hub', tab: 'tutors' } }));
      await speak('Showing tutors.');
      setTranscript('');
      return;
    }
    if (/\b(classes\s*tab|show\s*classes|my\s*classes|view\s*classes)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'class-hub', tab: 'classes' } }));
      await speak('Showing classes.');
      setTranscript('');
      return;
    }
    if (/\b(class\s*)?dashboard\s*tab\b/.test(lower) && (location.pathname === '/class-hub' || /class/i.test(lower))) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'class-hub', tab: 'dashboard' } }));
      await speak('Showing class dashboard.');
      setTranscript('');
      return;
    }
    if (/\b(resources?\s*tab|show\s*resources?|materials?)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'class-hub', tab: 'resources' } }));
      await speak('Showing resources.');
      setTranscript('');
      return;
    }
    if (/\b(create\s*(a\s*)?class|new\s*class|start\s*(a\s*)?class)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-class-action', { detail: { action: 'create-class' } }));
      await speak('Opening create class dialog.');
      setTranscript('');
      return;
    }
    if (/\b(join\s*(a\s*)?class)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'class-hub', tab: 'classes' } }));
      await speak('Showing available classes to join.');
      setTranscript('');
      return;
    }

    // ═══════════════════════════════════════
    //  SUB-TAB COMMANDS — About page
    // ═══════════════════════════════════════
    if (/\b(mission\s*tab|about\s*mission|our\s*mission)\b/.test(lower)) {
      await ensurePage('/about', 'About');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'about', tab: 'mission' } }));
      await speak('Showing mission.');
      setTranscript('');
      return;
    }
    if (/\b(hardware\s*tab|about\s*hardware|hardware\s*specs)\b/.test(lower)) {
      await ensurePage('/about', 'About');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'about', tab: 'hardware' } }));
      await speak('Showing hardware specs.');
      setTranscript('');
      return;
    }
    if (/\b(design\s*tab|about\s*design|design\s*phases?)\b/.test(lower)) {
      await ensurePage('/about', 'About');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'about', tab: 'design' } }));
      await speak('Showing design phases.');
      setTranscript('');
      return;
    }
    if (/\b(features?\s*tab|about\s*features?|core\s*features?)\b/.test(lower)) {
      await ensurePage('/about', 'About');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'about', tab: 'features' } }));
      await speak('Showing features.');
      setTranscript('');
      return;
    }
    if (/\b(tech\s*tab|tech\s*stack|about\s*tech)\b/.test(lower)) {
      await ensurePage('/about', 'About');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'about', tab: 'tech' } }));
      await speak('Showing tech stack.');
      setTranscript('');
      return;
    }

    // ═══════════════════════════════════════
    //  SUB-TAB COMMANDS — Hardware Setup
    // ═══════════════════════════════════════
    if (/\b(setup\s*tab|connection\s*tab|bluetooth\s*tab)\b/.test(lower)) {
      await ensurePage('/hardware-setup', 'Hardware Setup');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'hardware-setup', tab: 'setup' } }));
      await speak('Showing setup tab.');
      setTranscript('');
      return;
    }
    if (/\b(test\s*tab|test\s*dots?|test\s*cells?)\b/.test(lower)) {
      await ensurePage('/hardware-setup', 'Hardware Setup');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'hardware-setup', tab: 'test' } }));
      await speak('Showing test tab.');
      setTranscript('');
      return;
    }
    if (/\b(troubleshoot|troubleshooting|diagnos)\b/.test(lower)) {
      await ensurePage('/hardware-setup', 'Hardware Setup');
      window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'hardware-setup', tab: 'troubleshoot' } }));
      await speak('Showing troubleshooting.');
      setTranscript('');
      return;
    }

    // ═══════════════════════════════════════
    //  PRACTICE PAGE — game modes
    // ═══════════════════════════════════════
    if (/\b(lightning\s*reader)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'lightning-reader' } }));
      await speak('Lightning Reader selected. Choose difficulty and say "start game" when ready.');
      setTranscript(''); return;
    }
    if (/\b(precision\s*master)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'precision-master' } }));
      await speak('Precision Master selected. Choose difficulty and say "start game".');
      setTranscript(''); return;
    }
    if (/\b(pattern\s*detective)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'pattern-detective' } }));
      await speak('Pattern Detective selected.');
      setTranscript(''); return;
    }
    if (/\b(braille\s*architect)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'braille-architect' } }));
      await speak('Braille Architect selected.');
      setTranscript(''); return;
    }
    if (/\b(marathon\s*master)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'marathon-master' } }));
      await speak('Marathon Master selected.');
      setTranscript(''); return;
    }
    if (/\b(memory\s*champion)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'memory-champion' } }));
      await speak('Memory Champion selected.');
      setTranscript(''); return;
    }
    if (/\b(speed\s*demon)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'speed-demon' } }));
      await speak('Speed Demon selected.');
      setTranscript(''); return;
    }
    if (/\b(pattern\s*ninja)\b/.test(lower)) {
      await ensurePage('/practice', 'Practice');
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: 'pattern-ninja' } }));
      await speak('Pattern Ninja selected.');
      setTranscript(''); return;
    }
    // Practice customization
    if (/\b(start\s*(the\s*)?(game|practice|session|playing))\b/.test(lower)) {
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'start-game' } }));
      await speak('Starting the game!');
      setTranscript(''); return;
    }
    if (/\b(basics?\s*(level)?|words?\s*(level)?|sentences?\s*(level)?|contractions?\s*(level)?|advanced\s*level)\b/.test(lower) && (location.pathname === '/practice')) {
      const lvlMatch = lower.match(/\b(basics?|words?|sentences?|contractions?|advanced)\b/);
      if (lvlMatch) {
        const lvl = lvlMatch[1].replace(/s$/, '');
        window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'set-level', level: lvl === 'basic' ? 'basics' : lvl === 'word' ? 'words' : lvl === 'sentence' ? 'sentences' : lvl } }));
        await speak(`Level set to ${lvl}.`);
        setTranscript(''); return;
      }
    }
    if (/\b(5\s*min|10\s*min|15\s*min|20\s*min)\b/.test(lower) && location.pathname === '/practice') {
      const durMatch = lower.match(/\b(\d+)\s*min/);
      if (durMatch) {
        window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'set-duration', duration: parseInt(durMatch[1]) } }));
        await speak(`Duration set to ${durMatch[1]} minutes.`);
        setTranscript(''); return;
      }
    }
    if (/\b(retry|try again|play again|restart)\b/.test(lower) && location.pathname === '/practice') {
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'retry' } }));
      await speak('Restarting the game.');
      setTranscript(''); return;
    }
    if (/\b(new game|different game|back to modes|change mode)\b/.test(lower) && location.pathname === '/practice') {
      window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'new-game' } }));
      await speak('Back to mode selection.');
      setTranscript(''); return;
    }

    // ═══════════════════════════════════════
    //  MISSION — level select, submit, close
    // ═══════════════════════════════════════
    if (/\b(level\s*([1-6]))\b/.test(lower) && (location.pathname === '/braillequest' || /mission|quest/i.test(lower))) {
      const lvl = lower.match(/level\s*([1-6])/);
      if (lvl) {
        await ensurePage('/braillequest', 'BrailleQuest');
        window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'select-level', level: parseInt(lvl[1]) } }));
        await speak(`Showing level ${lvl[1]} missions.`);
        setTranscript(''); return;
      }
    }
    if (/\b(submit|upload|verify|send photo|submit photo)\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'submit' } }));
      await speak('Submitting for verification.');
      setTranscript(''); return;
    }
    if (/\b(take photo|open camera|camera|capture)\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'take-photo' } }));
      await speak('Opening camera to take a photo.');
      setTranscript(''); return;
    }
    if (/\b(buy|purchase)\s/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'purchase' } }));
      await speak('Purchasing reward.');
      setTranscript(''); return;
    }

    // ─── Mission lesson navigation (after verification) ───
    if (/\b(view\s*(the\s*)?lesson|open\s*(the\s*)?lesson|show\s*(the\s*)?lesson|start\s*(the\s*)?lesson|learn\s*more|see\s*(the\s*)?lesson|read\s*(the\s*)?lesson)\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'view-lesson' } }));
      setTranscript(''); return;
    }
    if (/\b(next\s*(section|part|slide|page)?|forward|continue|move\s*on|keep going|go on|more|next one)\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'next-section' } }));
      setTranscript(''); return;
    }
    if (/\b(previous\s*(section|part|slide|page)?|back\s*(one|a\s*section)?|go\s*back|before|last\s*(one|section|part)?)\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'prev-section' } }));
      setTranscript(''); return;
    }
    if (/\b(read\s*(this|it|section|current|aloud|out\s*loud|to\s*me)?|what('s| is|does)\s*(this|it)\s*(say|about|mean)?|tell\s*me|explain\s*(this|it)?|what\s*am\s*i\s*(looking|reading))\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'read-section' } }));
      setTranscript(''); return;
    }
    if (/\b(complete\s*(the\s*)?lesson|finish\s*(the\s*)?lesson|done\s*(with\s*)?lesson|close\s*(the\s*)?lesson|i('m| am) done|finished|all done|lesson complete)\b/.test(lower) && location.pathname === '/braillequest') {
      window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'complete-lesson' } }));
      setTranscript(''); return;
    }

    // ═══════════════════════════════════════
    //  CLASS HUB — extra actions
    // ═══════════════════════════════════════
    if (/\b(view\s*stats|class\s*stats|statistics)\b/.test(lower) && (location.pathname === '/class-hub' || /class/i.test(lower))) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-class-action', { detail: { action: 'view-stats' } }));
      await speak('Opening class statistics.');
      setTranscript(''); return;
    }
    if (/\b(open\s*meeting|join\s*meeting|meeting\s*room|start\s*meeting)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-class-action', { detail: { action: 'open-meeting' } }));
      await speak('Opening meeting room.');
      setTranscript(''); return;
    }
    if (/\b(add\s*resource|new\s*resource|upload\s*resource)\b/.test(lower)) {
      await ensurePage('/class-hub', 'Class Hub');
      window.dispatchEvent(new CustomEvent('braylin-class-action', { detail: { action: 'add-resource' } }));
      await speak('Opening add resource dialog.');
      setTranscript(''); return;
    }

    // ═══════════════════════════════════════
    //  OK / Yes / Confirm / Continue — for popups
    // ═══════════════════════════════════════
    if (/^(ok(ay)?|yes|yep|yeah|confirm|continue|proceed|accept|agree|next|sure|alright|sounds good|do it|go ahead|let's go|that's fine|absolutely|definitely|of course|right|correct|affirmative|perfect|great|awesome|bet|for sure|you got it|yup)$/i.test(lower)
      || (/\b(ok(ay)?|yes|confirm|continue|proceed|sure|go ahead|do it)\b/.test(lower) && lower.length < 30)) {
      window.dispatchEvent(new CustomEvent('braylin-confirm'));
      setTranscript(''); return;
    }

    // ═══════════════════════════════════════
    //  No / Decline — for popups
    // ═══════════════════════════════════════
    if (/^(no|nope|nah|deny|decline|reject|skip|not now|no thanks|never mind|forget it|i don't want to|cancel that|stop)$/i.test(lower)) {
      window.dispatchEvent(new CustomEvent('braylin-dismiss'));
      await speak('Dismissed.');
      setTranscript(''); return;
    }

    // ═══════════════════════════════════════
    //  UNIVERSAL — Close / Dismiss / Go Back
    // ═══════════════════════════════════════
    if (/\b(close|dismiss|cancel|go back|never\s*mind|exit|leave|get out|back out|return)\b/.test(lower)) {
      // If on a lesson page, "exit" navigates back to learn
      if (/^\/learn\/.+/.test(location.pathname) && /\b(exit|go back)\b/.test(lower)) {
        window.dispatchEvent(new CustomEvent('braylin-lesson-action', { detail: { action: 'exit-lesson' } }));
        setTranscript(''); return;
      }
      window.dispatchEvent(new CustomEvent('braylin-dismiss'));
      await speak('Closed.');
      setTranscript(''); return;
    }

    // ═══════════════════════════════════════
    //  HOME PAGE — CTAs
    // ═══════════════════════════════════════
    if (/\b(start\s*learning|begin\s*learning|get\s*started)\b/.test(lower)) {
      await speak('Starting your learning journey!');
      navigate('/learn');
      window.scrollTo(0, 0);
      setTranscript(''); return;
    }
    if (/\b(connect\s*hardware|setup\s*hardware|pair\s*device)\b/.test(lower)) {
      await speak('Going to hardware setup.');
      navigate('/hardware-setup');
      window.scrollTo(0, 0);
      setTranscript(''); return;
    }

    // ─── Navigation (page-level) — check after sub-tabs ───
    for (const route of ROUTE_MAP) {
      if (route.keywords.some(kw => stripped.includes(kw) || lower.includes(kw))) {
        if (location.pathname === route.path) {
          await speak(`Already on ${route.label}. ${PAGE_NARRATIONS[route.path] || ''}`);
        } else {
          await speak(`Going to ${route.label}.`);
          navigate(route.path);
          window.scrollTo(0, 0);
        }
        setTranscript('');
        return;
      }
    }

    // ─── Schedule AI agent commands ───
    const isAgentCmd = AI_AGENT_KEYWORDS.some(kw => lower.includes(kw));
    if (isAgentCmd) {
      // Translate spoken text into clearer keywords for the AI
      let cleaned = text;
      cleaned = cleaned.replace(/\b(um|uh|like|you know|basically|I want to|can you|please|could you)\b/gi, '').trim();
      cleaned = cleaned.replace(/\bput\s+more\b/gi, 'add more');
      cleaned = cleaned.replace(/\btake\s+away\b/gi, 'remove');
      cleaned = cleaned.replace(/\bget\s+rid\s+of\b/gi, 'remove');
      cleaned = cleaned.replace(/\bswap\b/gi, 'change');
      cleaned = cleaned.replace(/\bmake\s+it\s+longer\b/gi, 'extend time');
      cleaned = cleaned.replace(/\bmake\s+it\s+shorter\b/gi, 'shorten time');
      cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

      if (location.pathname !== '/learn') {
        await speak('Going to Learn page to edit your schedule.');
        navigate('/learn');
        window.scrollTo(0, 0);
        await new Promise(r => setTimeout(r, 1500));
        // Switch to weekly schedule tab
        window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
        await new Promise(r => setTimeout(r, 500));
      }
      await speak(`Sending to AI: "${cleaned}".`);
      window.dispatchEvent(new CustomEvent('voice-agent-command', { detail: { message: cleaned } }));
      setTranscript('');
      return;
    }

    // ─── Smart fallback: fuzzy route match → Gemini NLU → page tips ───
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    // Try partial route matching first (instant)
    for (const route of ROUTE_MAP) {
      if (route.keywords.some(kw => words.some(w => kw.includes(w) || w.includes(kw)))) {
        await speak(`Going to ${route.label}.`);
        navigate(route.path);
        window.scrollTo(0, 0);
        setTranscript('');
        return;
      }
    }

    // ─── Gemini NLU fallback — parse ANY natural language into an action ───
    try {
      setStatus('🤔 Thinking...');
      const nluPrompt = `You are Braylin, a voice assistant for the BrailleLearn app. The user said: "${text}"
Current page: ${location.pathname}

Available actions (respond with EXACTLY one JSON object):
- {"action":"navigate","path":"/learn"} — paths: /, /learn, /practice, /braillequest, /class-hub, /hardware-setup, /about, /speech-to-braille, /accessibility, /statistics
- {"action":"tab","page":"learn","tab":"overview"|"lessons"|"practice"}
- {"action":"tab","page":"learn","tab":"lessons","subTab":"browse"|"week"}
- {"action":"tab","page":"braillequest","tab":"xp"|"leaderboard"|"rewards"|"badges"|"activity"|"achievements"|"share"}
- {"action":"tab","page":"class-hub","tab":"tutors"|"classes"|"dashboard"|"resources"}
- {"action":"tab","page":"about","tab":"mission"|"hardware"|"design"|"features"|"tech"}
- {"action":"tab","page":"hardware-setup","tab":"setup"|"test"|"troubleshoot"}
- {"action":"practice","mode":"lightning-reader"|"precision-master"|"pattern-detective"|"braille-architect"|"marathon-master"|"memory-champion"|"speed-demon"|"pattern-ninja"}
- {"action":"practice-ctrl","ctrl":"start-game"|"retry"|"new-game"}
- {"action":"quest","ctrl":"next-mission"|"submit"|"take-photo"|"view-lesson"|"next-section"|"prev-section"|"read-section"|"complete-lesson"}
- {"action":"quest-filter","category":"signage"|"transport"|"food"|"education"|"public"|"medical"|"recreation"|"government"|"all"}
- {"action":"quest-level","level":1-6}
- {"action":"schedule","command":"edit"|"reset"|"view-lessons"|"create-plan"}
- {"action":"schedule-agent","message":"<cleaned instruction>"}  — for AI schedule edits like adding/removing/changing lessons
- {"action":"auth","method":"sign-in"|"sign-out"|"google"}
- {"action":"mute"} or {"action":"unmute"}
- {"action":"help"}
- {"action":"confirm"} or {"action":"dismiss"}
- {"action":"class","ctrl":"create-class"|"open-meeting"|"add-resource"}
- {"action":"speak","text":"<response to user>"} — for questions, chitchat, or when no app action fits

Respond ONLY with a single JSON object, no markdown, no explanation.`;

      const raw = await geminiService.askInstructor(nluPrompt, `page:${location.pathname}`);
      const cleaned = raw.replace(/```json\s*/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(cleaned);

      // Dispatch the parsed action
      switch (result.action) {
        case 'navigate':
          await speak(`Going to ${ROUTE_MAP.find(r => r.path === result.path)?.label || result.path}.`);
          navigate(result.path);
          window.scrollTo(0, 0);
          break;

        case 'tab':
          await ensurePage(
            result.page === 'learn' ? '/learn' :
            result.page === 'braillequest' ? '/braillequest' :
            result.page === 'class-hub' ? '/class-hub' :
            result.page === 'about' ? '/about' :
            result.page === 'hardware-setup' ? '/hardware-setup' : `/${result.page}`,
            result.page
          );
          window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: result.page, tab: result.tab, subTab: result.subTab } }));
          await speak(`Switched to ${result.tab}${result.subTab ? ` — ${result.subTab}` : ''}.`);
          break;

        case 'practice': {
          await ensurePage('/practice', 'Practice');
          window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: 'select-mode', mode: result.mode } }));
          await speak(`${result.mode.replace(/-/g, ' ')} selected.`);
          break;
        }
        case 'practice-ctrl':
          window.dispatchEvent(new CustomEvent('braylin-practice-action', { detail: { action: result.ctrl } }));
          await speak(result.ctrl === 'start-game' ? 'Starting!' : result.ctrl === 'retry' ? 'Restarting.' : 'Back to modes.');
          break;

        case 'quest':
          await ensurePage('/braillequest', 'BrailleQuest');
          window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: result.ctrl } }));
          break;

        case 'quest-filter':
          await ensurePage('/braillequest', 'BrailleQuest');
          window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'filter', category: result.category } }));
          await speak(`Filtering to ${result.category}.`);
          break;

        case 'quest-level':
          await ensurePage('/braillequest', 'BrailleQuest');
          window.dispatchEvent(new CustomEvent('braylin-quest-action', { detail: { action: 'select-level', level: result.level } }));
          await speak(`Level ${result.level}.`);
          break;

        case 'schedule':
          await ensurePage('/learn', 'Learn');
          if (result.command === 'edit') {
            window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
            await speak('Here\'s your schedule. What would you like to change?');
          } else if (result.command === 'reset') {
            window.dispatchEvent(new CustomEvent('braylin-learn-action', { detail: { action: 'reset-plan' } }));
            await speak('Plan reset.');
          } else if (result.command === 'view-lessons') {
            window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
            await new Promise(r => setTimeout(r, 800));
            window.dispatchEvent(new CustomEvent('braylin-view-lessons', { detail: {} }));
          } else if (result.command === 'create-plan') {
            window.dispatchEvent(new CustomEvent('braylin-open-wizard'));
            await speak('Let\'s build your study plan!');
          }
          break;

        case 'schedule-agent':
          await ensurePage('/learn', 'Learn');
          window.dispatchEvent(new CustomEvent('braylin-tab', { detail: { page: 'learn', tab: 'lessons', subTab: 'week' } }));
          await new Promise(r => setTimeout(r, 500));
          window.dispatchEvent(new CustomEvent('voice-agent-command', { detail: { message: result.message } }));
          await speak(`Sending to AI: "${result.message}".`);
          break;

        case 'auth':
          window.dispatchEvent(new CustomEvent('braylin-auth', { detail: { action: result.method } }));
          await speak(result.method === 'sign-out' ? 'Signing out.' : 'Opening sign in.');
          break;

        case 'mute':
          window.speechSynthesis.cancel();
          mutedRef.current = true;
          setIsMuted(true);
          alwaysListenRef.current = false;
          if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* */ }
          recognitionRef.current = null;
          setListening(false);
          setStatus('🔇 Fully muted');
          break;

        case 'unmute':
          mutedRef.current = false;
          setIsMuted(false);
          alwaysListenRef.current = true;
          startListeningInternal();
          await speak('I\'m back!');
          break;

        case 'help':
          await handleCommand('help');
          return; // already handled transcript clear

        case 'confirm':
          window.dispatchEvent(new CustomEvent('braylin-confirm'));
          break;

        case 'dismiss':
          window.dispatchEvent(new CustomEvent('braylin-dismiss'));
          await speak('Dismissed.');
          break;

        case 'class':
          await ensurePage('/class-hub', 'Class Hub');
          window.dispatchEvent(new CustomEvent('braylin-class-action', { detail: { action: result.ctrl } }));
          break;

        case 'speak':
          await speak(result.text);
          break;

        default:
          await speak(result.text || 'I\'m not sure what to do with that. Say "help" for commands.');
      }

      setTranscript('');
      return;
    } catch (nluError) {
      // Gemini NLU failed — fall back to page tips
      console.warn('Gemini NLU fallback failed:', nluError);
    }

    // Last-resort: context-aware suggestion
    const pageTips: Record<string, string> = {
      '/': 'Try "start learning", "go to missions", or "help".',
      '/learn': 'Try "view lessons", "edit schedule", "start lesson", or a day name like "Monday".',
      '/practice': 'Try a game name like "Lightning Reader", or "start game".',
      '/braillequest': 'Try "next mission", "take photo", "view lesson", "next section", or "leaderboard".',
      '/class-hub': 'Try "tutors", "classes", "create class", or "join class".',
      '/hardware-setup': 'Try "setup tab", "test tab", or "troubleshoot".',
    };
    const tip = pageTips[location.pathname] || 'Say "help" to hear all commands, or say a page name to navigate.';
    await speak(`I heard "${stripped}". ${tip}`);
    setTranscript('');
  }, [location.pathname, navigate, speak]);

  // Keep handleCommandRef up to date so recognition always uses latest
  useEffect(() => { handleCommandRef.current = handleCommand; }, [handleCommand]);
  useEffect(() => { startListeningRef.current = startListeningInternal; }, [startListeningInternal]);

  // ─── Helper: ensure we're on the right page before sending tab event ───
  const ensurePage = useCallback(async (path: string, label: string) => {
    if (location.pathname !== path) {
      navigate(path);
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 1000));
    }
  }, [location.pathname, navigate]);

  // ─── Auto-start always-on listening ───
  // Triple strategy: immediate start, gesture fallback, watchdog.
  // Also restart on tab focus / visibility change so refresh works.
  useEffect(() => {
    // Attempt start immediately (0ms) and again shortly after (600ms)
    startListeningInternal();
    const timer = setTimeout(() => {
      if (!isListeningRef.current) startListeningInternal();
    }, 600);

    // Gesture fallback: if browser blocks auto-start, start on first interaction
    const onGesture = () => {
      if (!hasUserGestureRef.current) {
        hasUserGestureRef.current = true;
        if (pendingGreetRef.current) {
          const text = pendingGreetRef.current;
          pendingGreetRef.current = null;
          speak(text);
        }
      }
      if (!isListeningRef.current && alwaysListenRef.current) {
        startListeningInternal();
      }
    };
    document.addEventListener('click', onGesture, true);
    document.addEventListener('touchstart', onGesture, true);
    document.addEventListener('keydown', onGesture, true);

    // Restart on tab focus / visibility change (handles refresh & tab-switch)
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && alwaysListenRef.current && !isSpeakingRef.current) {
        setTimeout(() => {
          if (!isListeningRef.current) startListeningInternal();
        }, 300);
      }
    };
    const onFocus = () => {
      if (alwaysListenRef.current && !isSpeakingRef.current && !isListeningRef.current) {
        startListeningInternal();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    // Watchdog: ensure we're always listening (catches silent mic drops)
    const watchdog = setInterval(() => {
      if (alwaysListenRef.current && !isSpeakingRef.current) {
        if (!isListeningRef.current || !recognitionRef.current) {
          try { if (recognitionRef.current) recognitionRef.current.stop(); } catch { /* */ }
          recognitionRef.current = null;
          isListeningRef.current = false;
          startListeningInternal();
        }
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearInterval(watchdog);
      document.removeEventListener('click', onGesture, true);
      document.removeEventListener('touchstart', onGesture, true);
      document.removeEventListener('keydown', onGesture, true);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
    };
  }, [startListeningInternal]);

  // ─── Auto-greet + page narration ───
  useEffect(() => {
    const path = location.pathname;
    if (greetedPagesRef.current.has(path)) return;
    const isFirstVisit = !hasGreeted && path === '/';
    if (autoGreetTimeoutRef.current) clearTimeout(autoGreetTimeoutRef.current);
    autoGreetTimeoutRef.current = setTimeout(async () => {
      greetedPagesRef.current.add(path);
      const greetText = isFirstVisit
        ? 'Hello! I\'m Braylin, your BrailleLearn voice assistant. I\'m always listening — just speak any command. Say "help" to hear everything I can do, or "go to learn" to start lessons.'
        : PAGE_NARRATIONS[path]?.split('.')[0] || `You're on ${path}`;
      if (isFirstVisit) setHasGreeted(true);
      // Save greeting as pending so it plays on first user gesture if speech is blocked
      if (!hasUserGestureRef.current) pendingGreetRef.current = greetText;
      await speak(greetText);
    }, isFirstVisit ? 1500 : 500);
    return () => { if (autoGreetTimeoutRef.current) clearTimeout(autoGreetTimeoutRef.current); };
  }, [location.pathname, hasGreeted, speak]);

  // ─── Listen for narration events ───
  useEffect(() => {
    const onNarrate = (e: Event) => {
      if (mutedRef.current) return; // respect mute
      const text = (e as CustomEvent).detail?.text;
      if (text) speak(text);
    };
    window.addEventListener('braylin-narrate', onNarrate);
    return () => window.removeEventListener('braylin-narrate', onNarrate);
  }, [speak]);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      alwaysListenRef.current = false;
      if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* */ }
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <>
      {/* ─── Floating live speech preview ─── */}
      <AnimatePresence>
        {showLivePreview && (transcript || interimTranscript) && (
          <motion.div
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[10000] max-w-xs px-4 py-2 rounded-full shadow-lg border border-blue-200 bg-white/95 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
              >
                <Mic className="w-3.5 h-3.5 text-red-500" />
              </motion.div>
              <span className={`text-xs font-medium truncate max-w-[200px] ${
                interimTranscript ? 'text-gray-400 italic' : 'text-gray-800'
              }`}>
                {transcript || interimTranscript}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Compact Braylin pill ─── */}
      <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-1.5">
        {/* Mute toggle button */}
        <motion.button
          onClick={() => {
            const newMuted = !mutedRef.current;
            mutedRef.current = newMuted;
            setIsMuted(newMuted);
            if (newMuted) {
              window.speechSynthesis.cancel();
              alwaysListenRef.current = false;
              if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
              if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* */ }
              recognitionRef.current = null;
              setListening(false);
              setStatus('🔇 Fully muted');
            } else {
              alwaysListenRef.current = true;
              startListeningInternal();
              setStatus('🎤 Unmuted');
              speak('I\'m back!');
            }
          }}
          className={`h-10 w-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isMuted ? 'bg-gray-500 text-white' : 'bg-green-500 text-white'
          }`}
          whileTap={{ scale: 0.9 }}
          aria-label={isMuted ? 'Unmute Braylin' : 'Mute Braylin'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>

        {/* Main pill */}
        <motion.button
          onClick={() => setIsOpen(o => !o)}
        className={`h-10 px-3 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold transition-colors ${
          isMuted
            ? 'bg-gray-500 text-white'
            : isListening
            ? 'bg-red-500 text-white'
            : isSpeaking
              ? 'bg-yellow-500 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
        }`}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        aria-label="Braylin voice assistant"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : isListening ? (
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
            <Mic className="w-4 h-4" />
          </motion.div>
        ) : isSpeaking ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
        <span>{isMuted ? 'Muted' : 'Braylin'}</span>
        {isListening && !isMuted && (
          <motion.div
            className="absolute inset-0 rounded-full border border-red-300"
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </motion.button>
      </div>

      {/* ─── Compact panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-16 right-4 z-[9999] w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden text-xs"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span className="font-bold text-xs">Braylin</span>
                <span className="text-[9px] opacity-70">always listening</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40">
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Body */}
            <div className="p-2.5 space-y-2 max-h-[40vh] overflow-y-auto">
              {/* Status */}
              <div className={`text-[11px] font-medium truncate ${isListening ? 'text-red-600' : isSpeaking ? 'text-yellow-600' : 'text-gray-500'}`}>
                {status || (isListening ? '🎤 Listening...' : isSpeaking ? '🔊 Speaking...' : '🤖 Ready')}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-50 rounded-lg px-2 py-1.5 text-[11px] text-gray-700 italic border border-gray-100 truncate">
                  "{transcript}"
                </div>
              )}

              {lastCommand && (
                <div className="bg-green-50 rounded-lg px-2 py-1 text-[10px] text-green-700 border border-green-100 truncate">
                  ✓ {lastCommand}
                </div>
              )}

              {/* Quick commands */}
              <div className="flex flex-wrap gap-1">
                {['Help', 'Go to learn', 'Lessons tab', 'Missions', 'Leaderboard', 'Sign in'].map(cmd => (
                  <button key={cmd} onClick={() => handleCommand(cmd)}
                    className="px-2 py-0.5 bg-gray-100 hover:bg-blue-100 text-[10px] font-medium rounded-md text-gray-600 hover:text-blue-700 transition-colors">
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Mic toggle */}
              <button
                onClick={() => {
                  if (isListening) {
                    alwaysListenRef.current = false;
                    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
                    if (recognitionRef.current) try { recognitionRef.current.stop(); } catch { /* */ }
                    recognitionRef.current = null;
                    setListening(false);
                  } else {
                    alwaysListenRef.current = true;
                    startListeningInternal();
                  }
                }}
                className={`w-full py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 ${
                  isListening ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                }`}
              >
                {isListening ? <><MicOff className="w-3 h-3" /> Pause</> : <><Mic className="w-3 h-3" /> Resume</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
