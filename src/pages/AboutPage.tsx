import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Code, Users, Heart, Target, Lightbulb, 
  CheckCircle, Award, Layers, Zap, Cpu,
  TestTube, Rocket, Accessibility,
  Brain, Mic, HardDrive, BarChart,
  Globe, Shield, Eye, Bluetooth,
  CircuitBoard, Settings, Wifi, Monitor
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mission' | 'hardware' | 'design' | 'features' | 'tech'>('mission');

  useEffect(() => {
    document.title = 'About BrailleLearn - Design Process & Mission';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onTab = (e: Event) => {
      const { page, tab } = (e as CustomEvent).detail || {};
      if (page !== 'about') return;
      if (tab === 'mission' || tab === 'hardware' || tab === 'design' || tab === 'features' || tab === 'tech') {
        setActiveTab(tab);
      }
    };
    window.addEventListener('braylin-tab', onTab);
    return () => window.removeEventListener('braylin-tab', onTab);
  }, []);

  useEffect(() => {
    const labels: Record<string, string> = { mission: 'Our Mission', hardware: 'Hardware', design: 'Design Process', features: 'Features', tech: 'Tech Stack' };
    window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text: `About page: ${labels[activeTab] || activeTab}. Say a section name to switch.` } }));
  }, [activeTab]);

  const impactStats = [
    { value: '285M+', label: 'Visually impaired worldwide', icon: Users, color: 'from-blue-500 to-blue-600' },
    { value: '<10%', label: 'US Braille literacy rate', icon: BookOpen, color: 'from-red-500 to-red-600' },
    { value: '50+', label: 'Interactive lessons', icon: Award, color: 'from-green-500 to-green-600' },
    { value: '8', label: 'Practice game modes', icon: Zap, color: 'from-purple-500 to-purple-600' },
    { value: '6', label: 'Solenoid braille cells', icon: CircuitBoard, color: 'from-orange-500 to-orange-600' },
    { value: 'Smart', label: 'Powered tutoring', icon: Brain, color: 'from-indigo-500 to-indigo-600' }
  ];

  const designPhases = [
    {
      id: 'requirements', title: '1. Requirements Analysis', description: 'Identifying the societal need and defining project scope', icon: Target, color: 'from-blue-500 to-blue-600',
      details: ['Researched braille literacy challenges facing visually impaired individuals', 'Identified gap in accessible, interactive braille learning tools', 'Surveyed potential users and educators for feature requirements', 'Defined core features: lessons, practice, speech-to-braille, hardware integration', 'Established accessibility requirements (WCAG 2.1 AA compliance)', 'Created user personas for students, teachers, and self-learners'],
      technologies: ['User Research', 'Requirements Documentation', 'Accessibility Standards']
    },
    {
      id: 'design', title: '2. System Design', description: 'Architecting the solution with scalability and accessibility', icon: Layers, color: 'from-purple-500 to-purple-600',
      details: ['Designed component-based architecture using React for modularity', 'Created responsive UI/UX wireframes with accessibility-first approach', 'Planned state management using React Context for global data', 'Designed database schema for user progress and lesson content', 'Architected BrailleLearn Intelligence for personalized learning paths', 'Planned hardware communication protocol for Arduino braille displays'],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Web Bluetooth API']
    },
    {
      id: 'implementation', title: '3. Implementation', description: 'Building the application with modern web technologies', icon: Code, color: 'from-green-500 to-green-600',
      details: ['Developed 50+ interactive braille lessons with progressive difficulty', 'Implemented real-time speech-to-braille conversion using Web Speech API', 'Built 8 unique practice game modes for reinforcement learning', 'Created Web Bluetooth integration for Arduino tactile feedback devices', 'Integrated BrailleLearn Intelligence (Gemini) for personalized tutoring', 'Designed and built solenoid-based braille display circuit with Arduino Uno R3'],
      technologies: ['Vite', 'React 18', 'TypeScript', 'BrailleLearn Intelligence', 'Web Speech API', 'Web Bluetooth', 'Arduino']
    },
    {
      id: 'testing', title: '4. Testing & Validation', description: 'Ensuring quality, accessibility, and user satisfaction', icon: TestTube, color: 'from-orange-500 to-orange-600',
      details: ['Conducted unit testing for core braille translation algorithms', 'Performed accessibility audits using screen readers (NVDA, VoiceOver)', 'Tested Arduino hardware integration with physical braille cells', 'Validated lesson content with braille literacy educators', 'User acceptance testing with visually impaired beta testers', 'Cross-browser compatibility testing (Chrome, Firefox, Safari, Edge)'],
      technologies: ['Jest', 'Accessibility Audits', 'User Testing', 'Hardware Testing']
    }
  ];

  const hardwareSpecs = [
    { label: 'Microcontroller', value: 'Arduino Uno R3', icon: Cpu, detail: 'ATmega328P-based board providing 14 digital I/O pins for solenoid control' },
    { label: 'Actuators', value: '6× Push-Pull Solenoids', icon: CircuitBoard, detail: '5V miniature solenoids that push pins up/down to form braille dot patterns' },
    { label: 'Driver', value: 'L293D Motor Driver IC', icon: Settings, detail: 'H-bridge motor driver controlling solenoid direction and power switching' },
    { label: 'Connectivity', value: 'HC-05 Bluetooth Module', icon: Bluetooth, detail: 'Serial Bluetooth for wireless communication with the BrailleLearn web app' },
    { label: 'Protocol', value: 'Web Bluetooth API', icon: Wifi, detail: 'Browser-native API enabling direct connection between web app and Arduino' },
    { label: 'Interface', value: 'Real-time Display', icon: Monitor, detail: 'As users learn braille in the app, patterns are physically displayed on the device' }
  ];

  const coreFeatures = [
    { icon: BookOpen, title: 'Interactive Lessons', description: '50+ structured lessons from basic letters to advanced contractions', benefit: 'Progressive learning path adapts to user skill level', stats: '50+ lessons, 5 difficulty levels' },
    { icon: Mic, title: 'Speech to Braille', description: 'Convert spoken words to braille patterns in real-time', benefit: 'Makes braille accessible to sighted teachers and family members', stats: 'Real-time conversion, PDF export' },
    { icon: Brain, title: 'Smart Tutoring', description: 'Personalized study plans and intelligent assistance powered by BrailleLearn Intelligence', benefit: 'Adapts to learning pace and identifies areas needing practice', stats: 'BrailleLearn Intelligence' },
    { icon: HardDrive, title: 'Hardware Integration', description: 'Connect Arduino solenoid braille display for tactile feedback', benefit: 'Physical feedback enhances muscle memory and pattern recognition', stats: 'Web Bluetooth, 6-solenoid display' },
    { icon: Zap, title: 'Practice Games', description: '8 unique game modes including speed challenge, memory, and quests', benefit: 'Gamification increases engagement and retention by 3x', stats: '8 modes, XP & achievement system' },
    { icon: Accessibility, title: 'Full Accessibility', description: 'Screen reader support, keyboard navigation, audio feedback throughout', benefit: 'Usable by learners of all abilities from day one', stats: 'WCAG 2.1 AA compliant' },
    { icon: Globe, title: 'BrailleQuest Missions', description: 'Real-world scavenger hunt to find braille signs in your community', benefit: 'Connects learning to real-world braille awareness', stats: 'GPS verified, smart photo analysis' },
    { icon: Shield, title: 'Class Hub', description: 'Create classes, find tutors, and join learning centers', benefit: 'Community-driven learning with analytics and collaboration', stats: 'Live classes, analytics, resources' }
  ];

  const techStack = [
    { name: 'React 18', category: 'Frontend', icon: '⚛️' },
    { name: 'TypeScript', category: 'Language', icon: '📘' },
    { name: 'Vite', category: 'Build', icon: '⚡' },
    { name: 'Tailwind CSS', category: 'Styling', icon: '🎨' },
    { name: 'Framer Motion', category: 'Animation', icon: '🎬' },
    { name: 'BrailleLearn Intelligence', category: 'Intelligence', icon: '🧠' },
    { name: 'Web Speech API', category: 'Speech', icon: '🎙️' },
    { name: 'Web Bluetooth', category: 'Hardware', icon: '📡' },
    { name: 'Supabase', category: 'Backend', icon: '🗄️' },
    { name: 'Arduino C++', category: 'Firmware', icon: '🔧' },
    { name: 'Chart.js', category: 'Charts', icon: '📊' },
    { name: 'Netlify', category: 'Deploy', icon: '🚀' }
  ];

  const teamMembers = [
    { name: 'Hardware Engineer', role: 'Solenoid Circuit Design', emoji: '🔧', contribution: 'Designed and soldered the braille display circuit with 6 solenoids, L293D drivers, and Arduino integration' },
    { name: 'Software Developer', role: 'Full-Stack Development', emoji: '💻', contribution: 'Built the React/TypeScript web application with 50+ lessons, smart intelligence integration, and real-time features' },
    { name: 'UX Designer', role: 'Accessibility & Design', emoji: '🎨', contribution: 'Created WCAG-compliant interfaces with screen reader support and intuitive navigation' },
    { name: 'Intelligence Engineer', role: 'Smart Systems Integration', emoji: '🧠', contribution: 'Integrated BrailleLearn Intelligence (Gemini) for personalized tutoring, image analysis, and study plans' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div key={i} className="absolute text-xl" initial={{ y: '100%', opacity: 0 }} animate={{ y: '-100%', opacity: [0, 1, 1, 0] }}
              transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }} style={{ left: `${Math.random() * 100}%` }}>
              {['⠿', '⠇', '⠏', '⠛', '⠻', '🔧', '💡', '🧠', '⚡', '🎯'][i % 10]}
            </motion.div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium">TSA Software Development Project</span>
            </motion.div>
            <motion.h1 className="text-4xl md:text-6xl font-extrabold mb-4" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              About BrailleLearn
            </motion.h1>
            <motion.p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              An interactive braille learning platform combining intelligent software with a custom-built solenoid braille display — bridging digital education with physical tactile feedback. Designed for partially sighted learners, with full voice navigation for blind users.
            </motion.p>
            <motion.div className="flex flex-wrap justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Link to="/learn" className="px-8 py-4 bg-white text-blue-700 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-all hover:scale-105 inline-flex items-center gap-2">
                <Rocket className="w-5 h-5" /> Start Learning
              </Link>
              <a href="#hardware" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all inline-flex items-center gap-2">
                <CircuitBoard className="w-5 h-5" /> View Hardware
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-10 -mt-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {impactStats.map((stat, i) => (
              <motion.div key={stat.label} className="bg-white rounded-3xl p-5 shadow-lg border-2 border-blue-100 text-center"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.05, y: -4 }}>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} mb-2 shadow-md`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div className="bg-white rounded-2xl shadow-xl p-2 border-2 border-blue-100 inline-flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { id: 'mission', label: 'Our Mission', emoji: '🎯' },
            { id: 'hardware', label: 'Braille Hardware', emoji: '🔧' },
            { id: 'design', label: 'Design Process', emoji: '📐' },
            { id: 'features', label: 'Features', emoji: '⚡' },
            { id: 'tech', label: 'Tech & Team', emoji: '👥' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>
              <span>{tab.emoji}</span>{tab.label}
            </button>
          ))}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AnimatePresence mode="wait">
          {activeTab === 'mission' && (
            <motion.div key="mission" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100 h-full">
                    <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full mb-6">
                      <Eye className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-bold text-red-700">The Problem</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Braille Literacy is in Crisis</h2>
                    <div className="space-y-4 text-gray-600">
                      <p><strong className="text-gray-900">285 million people</strong> worldwide are visually impaired, yet <strong className="text-red-600">less than 10%</strong> of blind individuals in the US can read braille.</p>
                      <p>Traditional braille education requires specialized materials, trained instructors, and significant time investments. Many schools <strong className="text-gray-900">lack resources</strong> to provide quality braille instruction.</p>
                      <p>Without braille literacy, visually impaired individuals face significant barriers to <strong className="text-gray-900">employment, education, and independence</strong>.</p>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                        <div className="text-3xl font-extrabold text-red-600">70%</div>
                        <div className="text-xs text-red-700 font-medium">Unemployment rate among blind adults</div>
                      </div>
                      <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
                        <div className="text-3xl font-extrabold text-orange-600">$0</div>
                        <div className="text-xs text-orange-700 font-medium">Cost of BrailleLearn to users</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-xl p-8 text-white h-full relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold">Our Solution</span>
                      </div>
                      <h2 className="text-3xl font-extrabold mb-6">BrailleLearn: Software + Hardware</h2>
                      <ul className="space-y-3">
                        {[
                          'Free, web-based learning accessible from any device',
                          'Custom solenoid braille display for tactile feedback',
                          'BrailleLearn Intelligence-powered personalized study plans',
                          'Real-time speech-to-braille conversion',
                          'Gamified practice with XP, achievements, and quests',
                          'Community learning hub with live classes',
                          'BrailleQuest: real-world braille scavenger hunts',
                          'Full WCAG 2.1 AA accessibility compliance'
                        ].map((item, i) => (
                          <motion.li key={i} className="flex items-start gap-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-blue-100">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Globe className="w-6 h-6 text-blue-600" /> Partners & Collaborators</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 bg-blue-50 p-5 rounded-2xl border-2 border-blue-100">
                    <img src="/partners/wssb.svg" alt="WSSB" className="h-14" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <div>
                      <div className="font-bold text-gray-900">Washington State School for the Blind</div>
                      <div className="text-sm text-gray-600">Co-created lesson packs & educator resources</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-green-50 p-5 rounded-2xl border-2 border-green-100">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-2xl shadow-md">🤝</div>
                    <div>
                      <div className="font-bold text-gray-900">Community Volunteers</div>
                      <div className="text-sm text-gray-600">Accessibility reviewers, testers, and content validators</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'hardware' && (
            <motion.div key="hardware" id="hardware" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <motion.div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-xl p-8 text-white mb-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                      <CircuitBoard className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-bold">Custom Hardware</span>
                    </div>
                    <h2 className="text-3xl font-extrabold mb-4">Solenoid Braille Display</h2>
                    <p className="text-blue-100 text-lg mb-6">
                      We designed and built a physical braille display using <strong className="text-white">6 push-pull solenoids</strong> controlled by an <strong className="text-white">Arduino Uno R3</strong>. Each solenoid represents one of the 6 dots in a braille cell, physically pushing up or pulling down to create tactile patterns that users can feel with their fingertips.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['Arduino Uno R3', 'L293D Driver', 'HC-05 Bluetooth', '6× Solenoids'].map(tag => (
                        <span key={tag} className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-bold border border-white/20">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <motion.div className="relative" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                        <div className="text-center mb-4 text-sm font-bold text-blue-200">Braille Cell Layout</div>
                        <div className="grid grid-cols-2 gap-4 w-32 mx-auto">
                          {[1, 4, 2, 5, 3, 6].map(dot => (
                            <motion.div key={dot} className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-blue-800 font-extrabold text-lg shadow-lg"
                              whileHover={{ scale: 1.2, backgroundColor: 'rgb(59, 130, 246)' }} transition={{ type: 'spring' }}>
                              {dot}
                            </motion.div>
                          ))}
                        </div>
                        <div className="text-center mt-4 text-xs text-blue-200">Each dot = 1 solenoid</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Settings className="w-6 h-6 text-blue-600" /> How It Works</h3>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'User learns in the app', desc: 'As the user practices braille letters in BrailleLearn, the app determines which dots to activate.' },
                      { step: '2', title: 'Bluetooth transmission', desc: 'The HC-05 module receives a 6-bit pattern via Web Bluetooth API from the browser.' },
                      { step: '3', title: 'Arduino processes signal', desc: 'The Arduino Uno R3 reads the serial data and activates the corresponding solenoid pins.' },
                      { step: '4', title: 'Solenoids actuate', desc: 'L293D motor drivers power the solenoids. Raised dots = active solenoids that the user feels.' },
                      { step: '5', title: 'Tactile feedback', desc: 'The user touches the braille cell and feels the physical dot pattern, reinforcing muscle memory.' }
                    ].map((item, i) => (
                      <motion.div key={item.step} className="flex gap-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-extrabold flex-shrink-0 shadow-md">{item.step}</div>
                        <div>
                          <div className="font-bold text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-blue-100" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Cpu className="w-6 h-6 text-blue-600" /> Component Specs</h3>
                  <div className="space-y-4">
                    {hardwareSpecs.map((spec, i) => (
                      <motion.div key={spec.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition-all"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02 }}>
                        <div className="flex items-center gap-3 mb-1">
                          <spec.icon className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-gray-900">{spec.label}</span>
                          <span className="ml-auto text-sm font-bold text-blue-600">{spec.value}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-8">{spec.detail}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2"><Rocket className="w-6 h-6" /> Future Hardware Plans</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: 'Multi-Cell Display', desc: 'Expand from 1 braille cell to 6+ cells for reading full words and sentences in physical braille', icon: '📟' },
                    { title: 'Custom PCB', desc: 'Design a dedicated printed circuit board to replace breadboard wiring for a compact, portable device', icon: '🔌' },
                    { title: '3D Printed Enclosure', desc: 'Create a sleek, ergonomic case with proper finger placement guides for comfortable reading', icon: '🖨️' },
                    { title: 'Refreshable Display', desc: 'Implement piezoelectric actuators for faster, quieter dot movement like commercial braille displays', icon: '⚡' },
                    { title: 'Battery Powered', desc: 'Add rechargeable Li-Po battery for fully wireless, portable braille learning anywhere', icon: '🔋' },
                    { title: 'Haptic Feedback', desc: 'Integrate vibration motors for additional learning cues and error/success notifications', icon: '📳' }
                  ].map((plan, i) => (
                    <motion.div key={plan.title} className="bg-white rounded-2xl p-5 border border-green-200 hover:shadow-lg transition-all"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} whileHover={{ scale: 1.03, y: -4 }}>
                      <div className="text-3xl mb-2">{plan.icon}</div>
                      <div className="font-bold text-gray-900 mb-1">{plan.title}</div>
                      <div className="text-sm text-gray-600">{plan.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'design' && (
            <motion.div key="design" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Software Design Process</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Following industry-standard software engineering practices from requirements to deployment.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {designPhases.map((phase, index) => (
                  <motion.div key={phase.id}
                    className={`bg-white rounded-3xl border-2 p-6 cursor-pointer transition-all ${activePhase === phase.id ? 'border-blue-500 shadow-xl scale-105' : 'border-blue-100 hover:border-blue-300 hover:shadow-lg'}`}
                    onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -4 }}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${phase.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <phase.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{phase.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{phase.description}</p>
                    <AnimatePresence>
                      {activePhase === phase.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t pt-4 mt-4">
                          <ul className="space-y-2">
                            {phase.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{detail}
                              </li>
                            ))}
                          </ul>
                          {phase.technologies && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {phase.technologies.map((tech, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 font-medium">{tech}</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'features' && (
            <motion.div key="features" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Core Features & Capabilities</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">A comprehensive suite of tools designed for all braille learners.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreFeatures.map((feature, i) => (
                  <motion.div key={feature.title} className="bg-white rounded-3xl shadow-lg p-6 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -6, scale: 1.02 }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                    <div className="bg-blue-50 rounded-xl p-3 mb-3 border border-blue-100">
                      <p className="text-xs text-blue-700"><strong>Benefit:</strong> {feature.benefit}</p>
                    </div>
                    <div className="text-xs text-gray-500 font-bold">{feature.stats}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tech' && (
            <motion.div key="tech" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="mb-12">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2"><Code className="w-6 h-6 text-blue-600" /> Technology Stack</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {techStack.map((tech, i) => (
                    <motion.div key={tech.name} className="bg-white rounded-2xl p-5 text-center border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all"
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, scale: 1.05 }}>
                      <div className="text-3xl mb-2">{tech.icon}</div>
                      <div className="font-bold text-gray-900 text-sm">{tech.name}</div>
                      <div className="text-xs text-blue-600 font-medium">{tech.category}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mb-12">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" /> Team Roles</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamMembers.map((member, i) => (
                    <motion.div key={member.name} className="bg-white rounded-3xl shadow-lg p-6 border-2 border-blue-100 text-center hover:shadow-xl transition-all"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}>
                      <div className="text-4xl mb-3">{member.emoji}</div>
                      <div className="font-bold text-gray-900 mb-1">{member.name}</div>
                      <div className="text-sm text-blue-600 font-bold mb-3">{member.role}</div>
                      <p className="text-xs text-gray-600">{member.contribution}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-xl p-8 text-white text-center relative overflow-hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-extrabold mb-4">Built with Purpose</h2>
                  <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
                    BrailleLearn was developed to address the critical need for accessible braille education, combining intelligent software, innovative hardware, and engaging gamification.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/learn" className="px-8 py-4 bg-white text-blue-700 rounded-full font-bold shadow-lg hover:bg-blue-50 hover:scale-105 transition-all inline-flex items-center gap-2">
                      <Rocket className="w-5 h-5" /> Start Learning Now
                    </Link>
                    <Link to="/statistics" className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all inline-flex items-center gap-2">
                      <BarChart className="w-5 h-5" /> View Statistics
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AboutPage;