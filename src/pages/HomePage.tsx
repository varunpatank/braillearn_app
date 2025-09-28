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
      speak('Welcome to BrailleLearn. Start your journey to braille literacy today.');
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
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-16 relative">
        <div className="absolute inset-0 braille-bg opacity-10"></div>
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.h1 
              className="text-4xl font-bold leading-tight sm:text-5xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Learn Braille Interactively
            </motion.h1>
            <motion.p 
              className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Master braille through fun, interactive lessons, speech recognition, and optional 
              Arduino hardware integration for a complete learning experience.
            </motion.p>
            <motion.div 
              className="mt-8 flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/learn"
                id="start-learning-btn"
                className="px-6 py-3 bg-white text-primary-700 rounded-lg font-medium shadow-md hover:bg-primary-50 transition-all hover:scale-105"
              >
                Start Learning
              </Link>
              <Link
                to="/hardware-setup"
                id="connect-hardware-btn"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-900 transition-all hover:scale-105"
              >
                Connect Hardware
              </Link>
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
          <Link
            to="/learn"
            className="inline-block px-8 py-4 bg-white text-blue-900 rounded-lg font-medium shadow-lg hover:bg-blue-50 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;