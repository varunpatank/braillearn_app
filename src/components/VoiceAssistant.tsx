import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

// ─── Route keyword map ───
const ROUTE_MAP: { keywords: string[]; path: string; label: string }[] = [
  { keywords: ['home', 'main', 'start', 'beginning', 'welcome'], path: '/', label: 'Home' },
  { keywords: ['learn', 'lesson', 'study', 'course', 'schedule', 'week', 'classes'], path: '/learn', label: 'Learn' },
  { keywords: ['practice', 'drill', 'exercise', 'quiz', 'test'], path: '/practice', label: 'Practice' },
  { keywords: ['speech', 'talk', 'voice', 'speak', 'convert', 'speech to braille', 'dictate'], path: '/speech-to-braille', label: 'Speech to Braille' },
  { keywords: ['hardware', 'arduino', 'device', 'connect', 'setup', 'physical'], path: '/hardware-setup', label: 'Hardware Setup' },
  { keywords: ['class', 'classroom', 'teacher', 'hub', 'class hub'], path: '/class-hub', label: 'Class Hub' },
  { keywords: ['quest', 'mission', 'braille quest', 'explore', 'adventure', 'achievement'], path: '/braillequest', label: 'BrailleQuest' },
  { keywords: ['about', 'info', 'information', 'help'], path: '/about', label: 'About' },
  { keywords: ['stats', 'statistics', 'progress', 'data'], path: '/statistics', label: 'Statistics' },
  { keywords: ['access', 'accessibility', 'settings', 'preferences'], path: '/accessibility', label: 'Accessibility' },
];

// ─── AI Agent keywords (dispatched as events for LearnPage to pick up) ───
const AI_AGENT_KEYWORDS = [
  'add', 'remove', 'change', 'schedule', 'create lesson', 'make lesson',
  'more time', 'less time', 'math', 'letter', 'alphabet', 'contraction',
  'easier', 'harder', 'advanced', 'beginner', 'random', 'shuffle',
  'rush', 'slow down', 'clear', 'reset',
];

const PAGE_GREETINGS: Record<string, string> = {
  '/': 'Welcome to BrailleLearn! Designed for partially sighted learners, with full voice navigation for blind users. Say "learn" to start lessons, "practice" to drill, or tell me anything you\'d like to do.',
  '/learn': 'You\'re on the Learn page. Say a command like "add letter lessons" to edit your schedule, or "practice" to switch pages.',
  '/practice': 'Practice page. Here you can drill braille characters. Say "learn" to go back to lessons.',
  '/speech-to-braille': 'Speech to Braille converter. Speak any text and it will be converted to braille.',
  '/hardware-setup': 'Hardware Setup. Connect your Arduino braille display here.',
  '/class-hub': 'Class Hub. Manage your classroom and students.',
  '/braillequest': 'BrailleQuest! Go on braille missions in the real world.',
  '/about': 'About BrailleLearn. Learn more about our mission.',
  '/statistics': 'Your Statistics dashboard. Track your learning progress.',
  '/accessibility': 'Accessibility settings. Customize your experience.',
};

const VoiceAssistant: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const greetedPagesRef = useRef<Set<string>>(new Set());
  const autoGreetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Speak helper ───
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                        voices.find(v => v.lang === 'en-US') ||
                        voices[0];
      if (preferred) utterance.voice = preferred;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ─── Speech recognition setup ───
  const initRecognition = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      setTranscript(finalText || interimText);
      if (finalText) {
        handleCommand(finalText.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setStatus('Could not hear you. Try again.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return recognition;
  }, []);

  // ─── Handle voice command ───
  const handleCommand = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    setStatus(`Heard: "${text}"`);

    // Check if it's a "stop" / "close" / "nevermind"
    if (/\b(stop|close|never\s?mind|cancel|dismiss)\b/.test(lower)) {
      await speak('Okay, closing assistant.');
      setIsOpen(false);
      setTranscript('');
      setStatus('');
      return;
    }

    // Check if it's an AI agent schedule command (only on /learn page)
    if (location.pathname === '/learn') {
      const isAgentCmd = AI_AGENT_KEYWORDS.some(kw => lower.includes(kw));
      if (isAgentCmd) {
        setStatus(`Sending to AI Agent: "${text}"`);
        await speak(`Got it. Sending "${text}" to the AI Agent.`);
        // Dispatch custom event for LearnPage to pick up
        window.dispatchEvent(new CustomEvent('voice-agent-command', { detail: { message: text } }));
        setTranscript('');
        return;
      }
    }

    // Check for navigation keywords
    for (const route of ROUTE_MAP) {
      if (route.keywords.some(kw => lower.includes(kw))) {
        if (location.pathname === route.path) {
          setStatus(`Already on ${route.label}`);
          await speak(`You're already on the ${route.label} page.`);
        } else {
          setStatus(`Navigating to ${route.label}...`);
          await speak(`Taking you to ${route.label}.`);
          navigate(route.path);
          window.scrollTo(0, 0);
        }
        setTranscript('');
        return;
      }
    }

    // If on any page other than /learn, but user seems to want the AI agent
    const isAgentIntent = AI_AGENT_KEYWORDS.some(kw => lower.includes(kw));
    if (isAgentIntent) {
      setStatus('Navigating to Learn page for AI Agent...');
      await speak(`I'll take you to the Learn page and send your command to the AI Agent.`);
      navigate('/learn');
      window.scrollTo(0, 0);
      // Short delay to let LearnPage mount, then dispatch
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('voice-agent-command', { detail: { message: text } }));
      }, 1500);
      setTranscript('');
      return;
    }

    // Fallback
    setStatus('Not sure what you meant. Try "learn", "practice", or "add letter lessons".');
    await speak('I didn\'t quite get that. Try saying "learn" to start lessons, "practice" to drill, or any schedule command like "add letter lessons".');
    setTranscript('');
  }, [location.pathname, navigate, speak]);

  // ─── Start / stop listening ───
  const startListening = useCallback(() => {
    window.speechSynthesis.cancel();
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    if (!recognitionRef.current) {
      setStatus('Speech recognition not supported in this browser.');
      return;
    }
    setTranscript('');
    setStatus('Listening...');
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch {
      // Already started — ignore
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
  }, []);

  // ─── Auto-greet on page change ───
  useEffect(() => {
    const path = location.pathname;

    // Only auto-greet once per page per session
    if (greetedPagesRef.current.has(path)) return;

    // Check if this is the first visit ever (greet on homepage)
    const isFirstVisit = !hasGreeted && path === '/';

    if (autoGreetTimeoutRef.current) clearTimeout(autoGreetTimeoutRef.current);

    autoGreetTimeoutRef.current = setTimeout(async () => {
      greetedPagesRef.current.add(path);

      const greeting = PAGE_GREETINGS[path] || 'You can say where you\'d like to go, or ask me to do anything.';

      if (isFirstVisit) {
        setHasGreeted(true);
        setIsOpen(true);
        setStatus('Welcome! Listening after greeting...');
        await speak(greeting);
        // Auto-start listening after greeting
        startListening();
      } else if (isFirstVisit === false && path !== '/') {
        // Brief narration on page change (non-intrusive)
        const shortGreeting = PAGE_GREETINGS[path]?.split('.')[0] || `You're on ${path}`;
        await speak(shortGreeting);
      }
    }, isFirstVisit ? 1500 : 800);

    return () => {
      if (autoGreetTimeoutRef.current) clearTimeout(autoGreetTimeoutRef.current);
    };
  }, [location.pathname, hasGreeted, speak, startListening]);

  // ─── Clean up on unmount ───
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* */ }
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // ─── Toggle panel ───
  const togglePanel = async () => {
    if (isOpen) {
      stopListening();
      window.speechSynthesis.cancel();
      setIsOpen(false);
    } else {
      setIsOpen(true);
      const greeting = PAGE_GREETINGS[location.pathname] ||
        'What would you like to do? Say a page name or a command.';
      await speak(greeting);
      startListening();
    }
  };

  return (
    <>
      {/* ─── Floating Mic Button ─── */}
      <motion.button
        onClick={togglePanel}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
          isListening
            ? 'bg-red-500 hover:bg-red-600'
            : isSpeaking
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        aria-label="Voice Assistant — click to speak commands"
        title="Voice Assistant"
      >
        {isListening ? (
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            <Mic className="w-6 h-6" />
          </motion.div>
        ) : isSpeaking ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {/* Pulse ring when listening */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}
      </motion.button>

      {/* ─── Voice Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span className="font-bold text-sm">Voice Navigator</span>
              </div>
              <button onClick={() => { stopListening(); window.speechSynthesis.cancel(); setIsOpen(false); }}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              {/* Accessibility callout */}
              <div className="bg-blue-50 rounded-xl px-3 py-2 text-xs text-blue-700 border border-blue-100">
                <span className="font-bold">♿ Accessible to all —</span> Designed for partially sighted learners. Blind users can navigate entirely by voice.
              </div>

              {/* Status */}
              <div className="text-sm text-gray-600 min-h-[20px]">
                {status || (isListening ? '🎤 Listening... say where to go or what to do' : 'Tap the mic or say a command')}
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium italic">
                  "{transcript}"
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick voice commands</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Learn', 'Practice', 'Quest', 'Add letter lessons', 'Home'].map(cmd => (
                    <button key={cmd}
                      onClick={() => handleCommand(cmd)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-blue-100 text-xs font-medium rounded-lg text-gray-700 hover:text-blue-700 transition-colors">
                      "{cmd}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Mic toggle */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isListening ? <><MicOff className="w-4 h-4" /> Stop Listening</> : <><Mic className="w-4 h-4" /> Start Listening</>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
