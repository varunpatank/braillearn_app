import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles, BookOpen } from 'lucide-react';

interface BrailleChar {
  char: string;
  dots: boolean[];
  unicode: string;
}

interface EducationSlide {
  title: string;
  description: string;
  characters: BrailleChar[];
  funFact?: string;
}

const dotsToUnicode = (dots: boolean[]): string => {
  let val = 0x2800;
  dots.forEach((d, i) => { if (d) val += (1 << i); });
  return String.fromCodePoint(val);
};

const educationData: Record<string, EducationSlide[]> = {
  signage: [
    {
      title: 'Common Door Signs in Braille',
      description: 'Door signs use Grade 1 Braille — each letter is written out fully.',
      characters: [
        { char: 'E', dots: [true, false, true, false, false, false], unicode: '' },
        { char: 'X', dots: [true, false, true, true, false, true], unicode: '' },
        { char: 'I', dots: [false, true, false, true, false, false], unicode: '' },
        { char: 'T', dots: [false, true, true, true, true, false], unicode: '' },
      ],
      funFact: '"EXIT" is one of the most common braille signs — required by ADA in all public buildings!'
    },
    {
      title: 'Room Numbers',
      description: 'Numbers in braille use a number indicator (⠼) followed by letter positions.',
      characters: [
        { char: '⠼', dots: [false, false, true, true, true, true], unicode: '⠼' },
        { char: '1 (A)', dots: [true, false, false, false, false, false], unicode: '⠁' },
        { char: '2 (B)', dots: [true, true, false, false, false, false], unicode: '⠃' },
        { char: '3 (C)', dots: [true, false, false, true, false, false], unicode: '⠉' },
      ],
      funFact: 'The number sign tells the reader: "the next characters are numbers, not letters!"'
    },
    {
      title: 'Restroom Signs',
      description: 'Restroom signs include tactile pictograms alongside braille text.',
      characters: [
        { char: 'M', dots: [true, true, false, true, false, false], unicode: '⠍' },
        { char: 'E', dots: [true, false, true, false, false, false], unicode: '⠑' },
        { char: 'N', dots: [true, true, false, true, false, true], unicode: '⠝' },
      ],
      funFact: 'ADA requires restroom signs to be mounted 48-60 inches from the floor on the latch side of doors.'
    },
  ],
  transport: [
    {
      title: 'Transit Braille Basics',
      description: 'Public transit uses braille on route maps, stop announcements, and ticket machines.',
      characters: [
        { char: 'B', dots: [true, true, false, false, false, false], unicode: '⠃' },
        { char: 'U', dots: [true, false, false, true, false, true], unicode: '⠥' },
        { char: 'S', dots: [false, true, true, false, true, false], unicode: '⠎' },
      ],
      funFact: 'Many bus stops now have QR codes alongside braille for audio announcements!'
    },
    {
      title: 'Crosswalk Signals',
      description: 'Accessible pedestrian signals (APS) include tactile arrows and braille labels.',
      characters: [
        { char: 'W', dots: [false, true, false, true, true, true], unicode: '⠺' },
        { char: 'A', dots: [true, false, false, false, false, false], unicode: '⠁' },
        { char: 'L', dots: [true, true, true, false, false, false], unicode: '⠇' },
        { char: 'K', dots: [true, false, true, false, true, false], unicode: '⠅' },
      ],
      funFact: 'The vibrating button on crosswalk signals lets blind pedestrians know which direction to cross.'
    },
  ],
  food: [
    {
      title: 'Braille Menus',
      description: 'Some restaurants offer braille menus — often using Grade 2 (contracted) braille to save space.',
      characters: [
        { char: 'F', dots: [true, true, false, true, false, false], unicode: '⠋' },
        { char: 'O', dots: [true, false, true, false, true, false], unicode: '⠕' },
        { char: 'O', dots: [true, false, true, false, true, false], unicode: '⠕' },
        { char: 'D', dots: [true, false, true, true, false, false], unicode: '⠙' },
      ],
      funFact: 'In Grade 2 Braille, common words are shortened — "food" stays the same, but "the" is just one character!'
    },
  ],
  education: [
    {
      title: 'Library & School Braille',
      description: 'Libraries use braille for shelf labels, catalog cards, and book spine labels.',
      characters: [
        { char: 'R', dots: [true, true, true, false, true, false], unicode: '⠗' },
        { char: 'E', dots: [true, false, true, false, false, false], unicode: '⠑' },
        { char: 'A', dots: [true, false, false, false, false, false], unicode: '⠁' },
        { char: 'D', dots: [true, false, true, true, false, false], unicode: '⠙' },
      ],
      funFact: 'The Library of Congress has over 60,000 braille and audio books available for free!'
    },
    {
      title: 'Museum Accessibility',
      description: 'Museums use tactile exhibits with braille descriptions for inclusive experiences.',
      characters: [
        { char: 'A', dots: [true, false, false, false, false, false], unicode: '⠁' },
        { char: 'R', dots: [true, true, true, false, true, false], unicode: '⠗' },
        { char: 'T', dots: [false, true, true, true, true, false], unicode: '⠞' },
      ],
      funFact: 'Some museums have 3D-printed tactile replicas of famous artworks with braille descriptions!'
    },
  ],
  public: [
    {
      title: 'ATM & Banking Braille',
      description: 'All ATMs are required to have braille keypads and audio guidance.',
      characters: [
        { char: 'P', dots: [true, true, true, true, false, false], unicode: '⠏' },
        { char: 'I', dots: [false, true, false, true, false, false], unicode: '⠊' },
        { char: 'N', dots: [true, true, false, true, false, true], unicode: '⠝' },
      ],
      funFact: 'Drive-through ATMs also have braille! This helps passengers who are blind.'
    },
  ],
  medical: [
    {
      title: 'Medical Braille Labels',
      description: 'Prescription labels, hospital signs, and medical equipment use braille for safety.',
      characters: [
        { char: 'R', dots: [true, true, true, false, true, false], unicode: '⠗' },
        { char: 'X', dots: [true, false, true, true, false, true], unicode: '⠭' },
      ],
      funFact: 'Some pharmacies now use "talking labels" — small devices attached to pill bottles that speak the medication info.'
    },
  ],
  recreation: [
    {
      title: 'Parks & Recreation Braille',
      description: 'National parks use braille on trail signs, visitor guides, and interpretive displays.',
      characters: [
        { char: 'P', dots: [true, true, true, true, false, false], unicode: '⠏' },
        { char: 'A', dots: [true, false, false, false, false, false], unicode: '⠁' },
        { char: 'R', dots: [true, true, true, false, true, false], unicode: '⠗' },
        { char: 'K', dots: [true, false, true, false, true, false], unicode: '⠅' },
      ],
      funFact: 'Yellowstone National Park has braille trail guides and tactile maps of geothermal features!'
    },
  ],
  government: [
    {
      title: 'Government Building Braille',
      description: 'Courthouses, city halls, and federal buildings are required to have braille signage.',
      characters: [
        { char: 'L', dots: [true, true, true, false, false, false], unicode: '⠇' },
        { char: 'A', dots: [true, false, false, false, false, false], unicode: '⠁' },
        { char: 'W', dots: [false, true, false, true, true, true], unicode: '⠺' },
      ],
      funFact: 'All US currency now has tactile features — different denominations have different raised patterns!'
    },
  ],
};

const brailleAlphabet: BrailleChar[] = [
  { char: 'A', dots: [true, false, false, false, false, false], unicode: '⠁' },
  { char: 'B', dots: [true, true, false, false, false, false], unicode: '⠃' },
  { char: 'C', dots: [true, false, false, true, false, false], unicode: '⠉' },
  { char: 'D', dots: [true, false, true, true, false, false], unicode: '⠙' },
  { char: 'E', dots: [true, false, true, false, false, false], unicode: '⠑' },
  { char: 'F', dots: [true, true, false, true, false, false], unicode: '⠋' },
  { char: 'G', dots: [true, true, true, true, false, false], unicode: '⠛' },
  { char: 'H', dots: [true, true, true, false, false, false], unicode: '⠓' },
  { char: 'I', dots: [false, true, false, true, false, false], unicode: '⠊' },
  { char: 'J', dots: [false, true, true, true, false, false], unicode: '⠚' },
];

function BrailleDotCell({ dots, size = 'lg', animate = true }: { dots: boolean[]; size?: 'sm' | 'md' | 'lg'; animate?: boolean }) {
  const sizeMap = { sm: { cell: 'w-10 h-14', dot: 'w-2.5 h-2.5', gap: 'gap-1.5' }, md: { cell: 'w-14 h-20', dot: 'w-3.5 h-3.5', gap: 'gap-2' }, lg: { cell: 'w-20 h-28', dot: 'w-5 h-5', gap: 'gap-3' } };
  const s = sizeMap[size];

  return (
    <div className={`${s.cell} bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 flex flex-col items-center justify-center ${s.gap} p-2`}>
      {[0, 1, 2].map(row => (
        <div key={row} className={`flex ${s.gap}`}>
          {[row, row + 3].map(idx => (
            <motion.div
              key={idx}
              className={`${s.dot} rounded-full ${dots[idx] ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-white/20 border border-white/30'}`}
              initial={animate ? { scale: 0 } : {}}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface Props {
  missionCategory: string;
  missionTitle: string;
  xpEarned: number;
  onClose: () => void;
}

export default function BrailleEducationAnimation({ missionCategory, missionTitle, xpEarned, onClose }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAlphabet, setShowAlphabet] = useState(false);
  const [animPhase, setAnimPhase] = useState<'celebrate' | 'educate'>('celebrate');

  const slides = educationData[missionCategory] || educationData.signage;

  useEffect(() => {
    const timer = setTimeout(() => setAnimPhase('educate'), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/10"
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {animPhase === 'celebrate' ? (
            <motion.div
              key="celebrate"
              className="p-10 text-center text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <motion.div
                className="text-8xl mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                transition={{ duration: 0.8, type: 'spring' }}
              >
                🎉
              </motion.div>
              <motion.h2
                className="text-3xl font-extrabold mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Mission Complete!
              </motion.h2>
              <motion.p
                className="text-blue-200 text-lg mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {missionTitle}
              </motion.p>
              <motion.div
                className="inline-flex items-center gap-3 bg-yellow-500/20 border-2 border-yellow-400/40 rounded-2xl px-6 py-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <span className="text-2xl font-extrabold text-yellow-400">+{xpEarned} XP</span>
              </motion.div>
              <motion.p
                className="text-blue-300 text-sm mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1] }}
                transition={{ delay: 1.5, duration: 1 }}
              >
                Loading your braille lesson...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="educate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Learn About This Find</h3>
                    <p className="text-blue-300 text-xs">
                      Slide {currentSlide + 1} of {slides.length}
                      {showAlphabet && ' • Alphabet Reference'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {!showAlphabet ? (
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-xl font-bold text-white mb-2">{slides[currentSlide].title}</h4>
                      <p className="text-blue-200 mb-6">{slides[currentSlide].description}</p>

                      <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
                        {slides[currentSlide].characters.map((ch, i) => (
                          <motion.div
                            key={i}
                            className="flex flex-col items-center gap-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.15 }}
                          >
                            <BrailleDotCell dots={ch.dots} size="lg" />
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{ch.char}</div>
                              <div className="text-3xl text-yellow-400">{dotsToUnicode(ch.dots)}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10 mb-4">
                        <p className="text-blue-300 text-xs mb-2">Together they spell:</p>
                        <div className="flex items-center justify-center gap-1">
                          {slides[currentSlide].characters.map((ch, i) => (
                            <span key={i} className="text-4xl text-yellow-400">{dotsToUnicode(ch.dots)}</span>
                          ))}
                        </div>
                        <p className="text-white font-bold text-lg mt-1">
                          {slides[currentSlide].characters.map(c => c.char).join('')}
                        </p>
                      </div>

                      {slides[currentSlide].funFact && (
                        <motion.div
                          className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <p className="text-yellow-300 text-sm flex items-start gap-2">
                            <span className="text-lg mt-[-2px]">💡</span>
                            {slides[currentSlide].funFact}
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                      disabled={currentSlide === 0}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-bold disabled:opacity-30 hover:bg-white/20 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={() => setShowAlphabet(true)}
                      className="text-xs text-blue-300 hover:text-blue-200 underline"
                    >
                      View Alphabet Reference
                    </button>
                    {currentSlide < slides.length - 1 ? (
                      <button
                        onClick={() => setCurrentSlide(currentSlide + 1)}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={onClose}
                        className="flex items-center gap-1 px-6 py-2 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all"
                      >
                        Done! <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-4">Braille Alphabet (A-J)</h4>
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    {brailleAlphabet.map((ch, i) => (
                      <motion.div
                        key={ch.char}
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <BrailleDotCell dots={ch.dots} size="sm" />
                        <div className="text-center">
                          <div className="text-sm font-bold text-white">{ch.char}</div>
                          <div className="text-lg text-yellow-400">{ch.unicode}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                    <p className="text-blue-200 text-sm">
                      The braille cell has 6 dots arranged in 2 columns of 3. Letters A-J use only the top 4 dots. 
                      K-T add dot 3, and U-Z add dots 3 and 6. This logical pattern makes braille systematic and learnable!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAlphabet(false)}
                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all text-sm"
                  >
                    Back to Lesson
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}