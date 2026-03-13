import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Accessibility, Eye, Volume2, Keyboard, Monitor, 
  Sun, Moon, Type, MousePointer, ZoomIn, Hand,
  Check, Settings, Brain, Headphones, Focus,
  ScreenShare, ArrowRight, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

interface AccessibilityFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'vision' | 'hearing' | 'motor' | 'cognitive';
  implemented: boolean;
  howToUse?: string;
}

const AccessibilityPage: React.FC = () => {
  const { isEnabled: isAudioEnabled, toggleAudio, speak } = useAudio();
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Accessibility - BrailleLearn';
    window.scrollTo(0, 0);
    
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }
  }, []);

  const accessibilityFeatures: AccessibilityFeature[] = [
    {
      id: 'screen-reader',
      title: 'Screen Reader Support',
      description: 'Full compatibility with NVDA, JAWS, VoiceOver, and other screen readers. All interactive elements have proper ARIA labels and descriptions.',
      icon: ScreenShare,
      category: 'vision',
      implemented: true,
      howToUse: 'Enable your screen reader and navigate using standard commands. All braille patterns are announced with their dot positions and character names.'
    },
    {
      id: 'audio-narration',
      title: 'Audio Narration',
      description: 'Built-in speech synthesis reads all content, instructions, and feedback aloud. Adjustable speech rate and voice selection.',
      icon: Volume2,
      category: 'vision',
      implemented: true,
      howToUse: 'Click the speaker icon in the header to toggle audio narration on/off. The system will read page content and provide audio feedback for actions.'
    },
    {
      id: 'high-contrast',
      title: 'High Contrast Mode',
      description: 'Enhanced color contrast ratios for improved visibility. Meets WCAG 2.1 AAA standards for text contrast.',
      icon: Sun,
      category: 'vision',
      implemented: true,
      howToUse: 'Toggle high contrast mode in settings or use the system-wide high contrast setting which will be detected automatically.'
    },
    {
      id: 'zoom-friendly',
      title: 'Zoom Friendly Design',
      description: 'Interface remains fully functional at 200% zoom or higher. No horizontal scrolling required.',
      icon: ZoomIn,
      category: 'vision',
      implemented: true,
      howToUse: 'Use browser zoom (Ctrl/Cmd + Plus) up to 400% without losing functionality.'
    },
    {
      id: 'braille-visual',
      title: 'Braille Cell Visualization',
      description: 'Large, clear braille dot representations with customizable sizing and colors.',
      icon: Eye,
      category: 'vision',
      implemented: true,
      howToUse: 'Braille cells are displayed at multiple sizes across the app. In practice mode, cells can be enlarged for better visibility.'
    },
    
    {
      id: 'visual-feedback',
      title: 'Visual Feedback',
      description: 'All audio cues have corresponding visual indicators. Color-coded feedback for correct/incorrect answers.',
      icon: Monitor,
      category: 'hearing',
      implemented: true,
      howToUse: 'All sounds in the app are accompanied by visual animations, color changes, or text notifications.'
    },
    {
      id: 'text-alternatives',
      title: 'Text Alternatives',
      description: 'All spoken content is also displayed as text. Captions for any audio/video content.',
      icon: Type,
      category: 'hearing',
      implemented: true,
      howToUse: 'All instructions, feedback, and content are displayed visually alongside any audio.'
    },
    
    {
      id: 'keyboard-nav',
      title: 'Full Keyboard Navigation',
      description: 'Complete access to all features using only the keyboard. Tab order follows logical reading order.',
      icon: Keyboard,
      category: 'motor',
      implemented: true,
      howToUse: 'Use Tab to move between elements, Enter to activate, Arrow keys for lists and menus, Escape to close dialogs.'
    },
    {
      id: 'focus-indicators',
      title: 'Clear Focus Indicators',
      description: 'Highly visible focus outlines on all interactive elements. Never rely on color alone.',
      icon: Focus,
      category: 'motor',
      implemented: true,
      howToUse: 'Focus indicators are always visible when using keyboard navigation.'
    },
    {
      id: 'large-targets',
      title: 'Large Touch Targets',
      description: 'All interactive elements meet 44x44px minimum touch target size for easy tapping.',
      icon: Hand,
      category: 'motor',
      implemented: true,
      howToUse: 'Buttons and interactive elements are sized for easy clicking and tapping on all devices.'
    },
    {
      id: 'reduced-motion',
      title: 'Reduced Motion Option',
      description: 'Respects system preference for reduced motion. Animations can be disabled entirely.',
      icon: MousePointer,
      category: 'motor',
      implemented: true,
      howToUse: 'Enable "Reduce Motion" in your operating system settings, or toggle in app settings.'
    },
    
    {
      id: 'simple-language',
      title: 'Clear, Simple Language',
      description: 'All instructions use plain language at an 8th-grade reading level or below.',
      icon: Brain,
      category: 'cognitive',
      implemented: true,
      howToUse: 'All content is written to be easily understood without specialized vocabulary.'
    },
    {
      id: 'progress-saving',
      title: 'Automatic Progress Saving',
      description: 'Your progress is automatically saved. Return anytime to continue where you left off.',
      icon: Settings,
      category: 'cognitive',
      implemented: true,
      howToUse: 'Your lesson progress, scores, and settings are automatically saved and synced.'
    },
    {
      id: 'ai-assistance',
      title: 'Smart Learning Assistant',
      description: 'Personalized help and explanations available at any time during lessons.',
      icon: Headphones,
      category: 'cognitive',
      implemented: true,
      howToUse: 'Click the assistant icon during lessons to get help, explanations, or alternative approaches.'
    }
  ];

  const categories = [
    { id: 'vision', name: 'Vision', icon: Eye, color: 'blue' },
    { id: 'hearing', name: 'Hearing', icon: Volume2, color: 'green' },
    { id: 'motor', name: 'Motor', icon: Hand, color: 'purple' },
    { id: 'cognitive', name: 'Cognitive', icon: Brain, color: 'orange' }
  ];

  const categoryColors: Record<string, string> = {
    vision: 'from-blue-500 to-blue-600',
    hearing: 'from-green-500 to-green-600',
    motor: 'from-purple-500 to-purple-600',
    cognitive: 'from-orange-500 to-orange-600'
  };

  const filteredFeatures = activeCategory 
    ? accessibilityFeatures.filter(f => f.category === activeCategory)
    : accessibilityFeatures;

  const fontSizes = { small: '14px', medium: '16px', large: '20px' };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontSize: fontSizes[fontSize] }}>
      <section className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
          {[
            { x: '15%', y: '20%', s: 200 }, { x: '70%', y: '30%', s: 260 }, { x: '40%', y: '60%', s: 180 },
            { x: '80%', y: '70%', s: 220 }, { x: '25%', y: '80%', s: 150 }
          ].map((c, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white" style={{ left: c.x, top: c.y, width: c.s, height: c.s, transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div 
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center">
                <Accessibility className="w-12 h-12" />
              </div>
            </motion.div>
            <motion.div 
              className="text-center md:text-left flex-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                <Accessibility className="w-4 h-4" />
                <span className="text-sm font-medium">WCAG 2.1 AA Compliant</span>
              </div>
              <h1 className="text-4xl font-extrabold mb-4">Accessibility</h1>
              <p className="text-lg text-blue-200 max-w-2xl">
                BrailleLearn is built with accessibility at its core, ensuring everyone can learn braille effectively
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Settings</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => {
                toggleAudio();
                if (!isAudioEnabled) {
                  speak('Audio narration enabled');
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                isAudioEnabled 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
              }`}
              aria-pressed={isAudioEnabled}
            >
              <Volume2 className="w-5 h-5" />
              Audio {isAudioEnabled ? 'On' : 'Off'}
              {isAudioEnabled && <Check className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Text Size:</span>
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all ${
                    fontSize === size 
                      ? 'border-primary-500 bg-primary-50 text-primary-700' 
                      : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                  }`}
                  aria-pressed={fontSize === size}
                >
                  <Type className={`${size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'}`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                highContrast 
                  ? 'border-gray-900 bg-gray-900 text-white' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
              }`}
              aria-pressed={highContrast}
            >
              {highContrast ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              High Contrast
            </button>

            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                reducedMotion 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
              }`}
              aria-pressed={reducedMotion}
            >
              <MousePointer className="w-5 h-5" />
              Reduce Motion
              {reducedMotion && <Check className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeCategory === null 
                  ? 'bg-primary-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
              }`}
            >
              All Features
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeCategory === cat.id 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300'
                }`}
              >
                <cat.icon className="w-5 h-5" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFeatures.map((feature, index) => (
              <motion.div
                key={feature.id}
                className={`bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden ${
                  highContrast ? 'border-black' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
              >
                <div className={`h-2 bg-gradient-to-r ${categoryColors[feature.category]}`} />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[feature.category]}`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">{feature.title}</h3>
                        {feature.implemented && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            ✓ Active
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                      {feature.howToUse && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                            <Info className="w-4 h-4" />
                            How to Use
                          </div>
                          <p className="text-xs text-gray-600">{feature.howToUse}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Keyboard Shortcuts
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              {[
                { keys: ['Tab'], action: 'Move to next focusable element' },
                { keys: ['Shift', 'Tab'], action: 'Move to previous focusable element' },
                { keys: ['Enter'], action: 'Activate buttons and links' },
                { keys: ['Space'], action: 'Toggle checkboxes and buttons' },
                { keys: ['Escape'], action: 'Close modals and dialogs' },
                { keys: ['Arrow Keys'], action: 'Navigate within menus and lists' },
                { keys: ['1-6'], action: 'Toggle braille dots in practice mode' },
                { keys: ['Ctrl/Cmd', '+/-'], action: 'Zoom in/out' }
              ].map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-2">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={key}>
                        <kbd className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-mono shadow-sm">
                          {key}
                        </kbd>
                        {i < shortcut.keys.length - 1 && <span className="text-gray-400">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="text-gray-600">{shortcut.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Accessibility className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Our Commitment to Accessibility</h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            We are committed to making BrailleLearn accessible to all users, regardless of ability. 
            We continuously test and improve our platform based on user feedback and the latest accessibility guidelines.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/learn"
              className="px-6 py-3 bg-white text-primary-700 rounded-lg font-semibold shadow-lg hover:bg-primary-50 transition-all inline-flex items-center gap-2"
            >
              Start Learning
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="mailto:accessibility@braillelearn.app"
              className="px-6 py-3 bg-primary-500/30 backdrop-blur-sm text-white rounded-lg font-semibold border border-white/20 hover:bg-primary-500/50 transition-all"
            >
              Report an Issue
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AccessibilityPage;