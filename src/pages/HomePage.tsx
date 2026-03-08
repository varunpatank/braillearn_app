import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Mic, Settings, HardDrive, CheckCircle } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAudioNavigation } from '../hooks/useAudioNavigation';

const HomePage: React.FC = () => {
  const [showFeatures, setShowFeatures] = useState(false);
  const { speak } = useAudio();
  
  useAudioNavigation('start-learning-btn', {
    description: 'Start your braille learning journey',
    hoverSound: true,
    clickSound: true
  });

  useAudioNavigation('connect-hardware-btn', {
    description: 'Connect your Arduino hardware for tactile feedback',
    hoverSound: true,
    clickSound: true
  });

  useEffect(() => {
    document.title = 'BrailleLearn - Interactive Braille Learning';
    window.scrollTo(0, 0);
    if (speak) {
      speak('Welcome to BrailleLearn. Designed for partially sighted learners, with full voice navigation for blind users. Tap the microphone button or say what you\'d like to do.');
    }
    
    // Show features immediately
    setShowFeatures(true);
  }, [speak]);

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Progress through structured lessons from basic characters to advanced contractions.',
      color: 'blue' as const
    },
    {
      icon: Mic,
      title: 'Speech to Braille',
      description: 'Convert spoken words to braille and create printable braille documents.',
      color: 'teal' as const
    },
    {
      icon: Settings,
      title: 'Customized Practice',
      description: 'Focus on specific braille characters or words with personalized practice sessions.',
      color: 'purple' as const
    },
    {
      icon: HardDrive,
      title: 'Arduino Integration',
      description: 'Connect with Arduino hardware for tactile feedback on physical braille cells.',
      color: 'orange' as const
    }
  ];

  const featureColors = {
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="min-h-screen bg-gray-50 braille-bg">
      {/* Blue Hero Banner — Diagonal Split */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white py-12 overflow-hidden">
        {/* Hexagonal pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg width="100%" height="100%"><defs><pattern id="hex" width="56" height="100" patternUnits="userSpaceOnUse" patternTransform="scale(1)"><path d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100" fill="none" stroke="white" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#hex)"/></svg>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/15 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left: Text Content */}
            <div className="flex-1 text-center lg:text-left relative z-10">
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              >
                <BookOpen className="w-5 h-5" />
                <span className="text-sm font-medium">Award-Winning Education Platform</span>
              </motion.span>
              <motion.h1 
                className="text-5xl font-extrabold leading-tight sm:text-6xl mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Learn Braille<br />
                <span className="text-blue-200">Interactively</span>
              </motion.h1>
              <motion.p 
                className="text-xl text-blue-100 max-w-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Designed for partially sighted learners — with full voice navigation so blind users 
                can explore hands-free. Master braille through interactive lessons, speech recognition, 
                and optional Arduino hardware for a complete learning experience.
              </motion.p>
              <motion.div 
                className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  to="/learn"
                  id="start-learning-btn"
                  className="px-8 py-4 bg-white text-blue-700 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-all hover:scale-105 inline-flex items-center gap-2"
                >
                  <BookOpen className="w-5 h-5" />
                  Start Learning
                </Link>
                <Link
                  to="/hardware-setup"
                  id="connect-hardware-btn"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all hover:scale-105 inline-flex items-center gap-2"
                >
                  <HardDrive className="w-5 h-5" />
                  Connect Hardware
                </Link>
              </motion.div>

              {/* Stats badges below buttons */}
              <motion.div className="hidden lg:flex mt-6 gap-3"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                {[
                  { icon: '\u283f', label: '6-Dot System', desc: '64 combinations' },
                  { icon: '\ud83d\udcd6', label: 'Grade 1 & 2', desc: 'Full curriculum' },
                  { icon: '\ud83d\udd0a', label: 'Audio Support', desc: 'Speech enabled' },
                  { icon: '\u267f', label: 'Accessible', desc: 'Voice navigable' },
                ].map((stat, i) => (
                  <motion.div key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-white/8 backdrop-blur-sm rounded-xl border border-white/10"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.15, type: 'spring' }}
                  >
                    <span className="text-lg">{stat.icon}</span>
                    <div>
                      <p className="text-[11px] font-bold text-white/90">{stat.label}</p>
                      <p className="text-[9px] text-white/50">{stat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            {/* Right: Organic Braille Art */}
            <motion.div 
              className="flex-shrink-0 hidden lg:block relative"
              style={{ width: 460, height: 400 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
            >
              {/* Large background braille dots pattern */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 460 400">
                {/* Scattered background dots */}
                {[
                  { cx: 30, cy: 40, r: 4, o: 0.08 }, { cx: 90, cy: 20, r: 3, o: 0.06 },
                  { cx: 380, cy: 60, r: 5, o: 0.07 }, { cx: 350, cy: 310, r: 4, o: 0.06 },
                  { cx: 60, cy: 320, r: 3, o: 0.05 }, { cx: 200, cy: 340, r: 4, o: 0.07 },
                  { cx: 400, cy: 180, r: 3, o: 0.06 }, { cx: 20, cy: 180, r: 5, o: 0.08 },
                ].map((d, i) => (
                  <motion.circle key={`bg-${i}`} cx={d.cx} cy={d.cy} r={d.r} fill="white" opacity={d.o}
                    animate={{ opacity: [d.o, d.o * 2, d.o] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity }} />
                ))}
              </svg>

              {/* Floating braille word: "LEARN" spelled out as dot cells */}
              {[
                { letter: 'L', dots: [1,2,3], x: 20, y: 30, delay: 0.4 },
                { letter: 'E', dots: [1,5], x: 100, y: 10, delay: 0.5 },
                { letter: 'A', dots: [1], x: 180, y: 40, delay: 0.6 },
                { letter: 'R', dots: [1,2,3,5], x: 260, y: 15, delay: 0.7 },
                { letter: 'N', dots: [1,3,4,5], x: 340, y: 35, delay: 0.8 },
              ].map((cell, ci) => (
                <motion.div
                  key={ci}
                  className="absolute"
                  style={{ left: cell.x, top: cell.y }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cell.delay, type: 'spring', stiffness: 200 }}
                >
                  <motion.div
                    className="relative"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3 + ci * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg width="56" height="70" viewBox="0 0 56 70">
                      <rect x="2" y="2" width="52" height="66" rx="12" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
                      {[
                        { cx: 20, cy: 16 }, { cx: 20, cy: 35 }, { cx: 20, cy: 54 },
                        { cx: 36, cy: 16 }, { cx: 36, cy: 35 }, { cx: 36, cy: 54 },
                      ].map((pos, di) => (
                        <circle key={di} cx={pos.cx} cy={pos.cy} r={cell.dots.includes(di + 1) ? 6.5 : 4}
                          fill={cell.dots.includes(di + 1) ? 'white' : 'rgba(255,255,255,0.12)'}
                          stroke={cell.dots.includes(di + 1) ? 'rgba(255,255,255,0.6)' : 'transparent'}
                          strokeWidth="1" />
                      ))}
                    </svg>
                    <span className="block text-center text-[11px] font-bold text-white/60 mt-0.5 tracking-widest">{cell.letter}</span>
                  </motion.div>
                </motion.div>
              ))}

              {/* Center: Large animated braille cell with glow */}
              <motion.div
                className="absolute"
                style={{ left: 130, top: 110 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl scale-110" />
                  <svg width="160" height="190" viewBox="0 0 160 190" className="relative">
                    <rect x="4" y="4" width="152" height="182" rx="28" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    {/* Full braille cell (all 6 dots) */}
                    {[
                      { cx: 55, cy: 45 }, { cx: 55, cy: 95 }, { cx: 55, cy: 145 },
                      { cx: 105, cy: 45 }, { cx: 105, cy: 95 }, { cx: 105, cy: 145 },
                    ].map((pos, i) => (
                      <motion.circle key={i} cx={pos.cx} cy={pos.cy} r={16}
                        fill="white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, opacity: [0.7, 1, 0.7] }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}
                      />
                    ))}
                  </svg>
                </div>
              </motion.div>

              {/* Braille Man mascot */}
              <motion.div
                className="absolute"
                style={{ right: 20, bottom: 10 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                  <svg width="64" height="64" viewBox="0 0 40 40">
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
                </motion.div>
              </motion.div>

              {/* Floating label badges */}
              {[
                { text: '6-dot cell', x: 280, y: 150, delay: 1.2 },
                { text: 'Grade 1', x: 10, y: 250, delay: 1.4 },
                { text: 'Tactile', x: 310, y: 260, delay: 1.6 },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  className="absolute px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-[11px] font-medium text-white/70"
                  style={{ left: badge.x, top: badge.y }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: badge.delay, type: 'spring' }}
                >
                  {badge.text}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence>
            {showFeatures && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {features.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  
                  return (
                    <motion.div
                      key={feature.title}
                      className="flex flex-col items-center text-center"
                      initial={{ opacity: 0, scale: 0.5, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5,
                        delay: index * 0.2,
                        bounce: 0.5,
                        type: "spring"
                      }}
                    >
                      <motion.div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${featureColors[feature.color]} p-4 shadow-lg mb-6`}
                        animate={{
                          y: [0, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        <FeatureIcon className="w-12 h-12 text-white" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 max-w-sm">
                        {feature.description}
                      </p>
                      <Link
                        to={feature.title === 'Interactive Lessons' ? '/learn' :
                            feature.title === 'Speech to Braille' ? '/speech-to-braille' :
                            feature.title === 'Customized Practice' ? '/practice' :
                            '/about'}
                        className="mt-4 text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                      >
                        Learn more
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </section>

      {/* Hardware Connection Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🔧 Connect Your Braille Hardware
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Enhance your learning experience with tactile feedback using Arduino-based braille displays
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Setup Guide</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Prepare Your Arduino</h4>
                      <p className="text-gray-600">Use Arduino Nano ESP32 with our firmware installed</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Connect Solenoids</h4>
                      <p className="text-gray-600">Wire 6 push-type solenoids to GPIO pins 2-7</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Power & Connect</h4>
                      <p className="text-gray-600">Use 5V external power and connect via Bluetooth</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link
                    to="/hardware-setup"
                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    <HardDrive className="w-5 h-5 mr-2" />
                    Full Setup Guide
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hardware Requirements</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Arduino Nano ESP32 (with Bluetooth)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    6x Push-type solenoids (5V)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    ULN2803 driver chip
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    5V power supply (2A+)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Breadboard & jumper wires
                  </li>
                </ul>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Important</h4>
                      <p className="text-blue-700 text-sm">Solenoids should push DOWN when activated to create raised braille dots</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Master Braille?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Start your journey to braille literacy today with our interactive lessons,
            speech-to-braille tools, and optional hardware integration.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/learn"
              className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-colors"
            >
              Get Started for Free
            </Link>
            <Link
              to="/about"
              className="inline-block px-8 py-4 bg-primary-600/50 backdrop-blur-sm text-white rounded-lg font-medium border border-white/20 hover:bg-primary-600/70 transition-colors"
            >
              Learn About Our Mission
            </Link>
          </div>
        </div>
      </section>

      {/* Social Impact Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Making a Difference</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              BrailleLearn addresses the critical need for accessible braille education
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-bold text-primary-600">285M+</div>
              <div className="text-sm text-gray-600">Visually impaired worldwide</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-primary-600">&lt;10%</div>
              <div className="text-sm text-gray-600">Braille literacy rate</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-primary-600">50+</div>
              <div className="text-sm text-gray-600">Interactive lessons</div>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-3xl font-bold text-primary-600">100%</div>
              <div className="text-sm text-gray-600">Free & accessible</div>
            </motion.div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/statistics"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              View Impact Statistics
            </Link>
            <Link
              to="/braillequest"
              className="inline-flex items-center px-6 py-3 bg-white text-primary-700 rounded-lg font-medium border-2 border-primary-200 hover:border-primary-300 transition-colors"
            >
              Explore Achievements
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;