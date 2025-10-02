import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Play, RotateCcw, Award, Clock, Target, Zap, Brain, 
  Sparkles, CheckCircle, X, Search, Layers, Shield, Flame, Eye, 
  Shuffle, Volume2, MessageCircle, Send, ArrowRight, Home, Star,
  Timer, Trophy, Heart, RefreshCw
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useAppContext } from '../context/AppContext';
import { geminiService } from '../services/geminiService';
import BrailleCell from '../components/braille/BrailleCell';
import BrailleKeyboard from '../components/braille/BrailleKeyboard';
import Logo from '../components/common/Logo';
import { BrailleCell as BrailleCellType, Exercise } from '../types/types';
import { braillePatterns } from '../data/lessons';
import { translateTextToBraille } from '../services/brailleTranslator';

const PracticePage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('basics');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [selectedFocus, setSelectedFocus] = useState('mixed');
  const [showCustomization, setShowCustomization] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lives, setLives] = useState(3);
  const [selectedDots, setSelectedDots] = useState<number[]>([]);
  const [draggedCells, setDraggedCells] = useState<BrailleCellType[]>([]);
  const [targetWord, setTargetWord] = useState<BrailleCellType[]>([]);
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(true);
  const [gameTimer, setGameTimer] = useState<NodeJS.Timeout | null>(null);
  const [questionTimer, setQuestionTimer] = useState<NodeJS.Timeout | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { speak, playSound } = useAudio();
  const { isArduinoConnected, sendBraillePattern } = useAppContext();

  // Enhanced practice modes
  const practiceModes = [
    {
      id: 'lightning-reader',
      title: '⚡ Lightning Reader',
      description: 'Read braille patterns at lightning speed - no English hints!',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Hard',
      xp: 100,
      benefits: ['Speed reading', 'Pattern recognition', 'Time pressure'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'precision-master',
      title: '🎯 Precision Master',
      description: 'Choose the correct braille pattern from similar options - visual only!',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      difficulty: 'Expert',
      xp: 120,
      benefits: ['Pattern precision', 'Visual discrimination', 'Accuracy'],
      estimatedTime: '8-20 min'
    },
    {
      id: 'pattern-detective',
      title: '🔍 Pattern Detective',
      description: 'Complete missing dots in partial braille patterns - pure logic!',
      icon: Search,
      color: 'from-purple-500 to-indigo-500',
      difficulty: 'Expert',
      xp: 130,
      benefits: ['Pattern completion', 'Logical thinking', 'Dot placement'],
      estimatedTime: '10-25 min'
    },
    {
      id: 'braille-architect',
      title: '🔨 Braille Architect',
      description: 'Build words by dragging braille cells - no English scaffolding!',
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      difficulty: 'Hard',
      xp: 110,
      benefits: ['Word construction', 'Cell manipulation', 'Spatial reasoning'],
      estimatedTime: '12-22 min'
    },
    {
      id: 'marathon-master',
      title: '🏃 Marathon Master',
      description: 'Survive waves of braille challenges with limited lives!',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Expert',
      xp: 150,
      benefits: ['Endurance', 'Consistency', 'Pressure handling'],
      estimatedTime: '15-30 min'
    },
    {
      id: 'memory-champion',
      title: '🧠 Memory Champion',
      description: 'Match braille patterns to letters using pure memory!',
      icon: Brain,
      color: 'from-indigo-500 to-purple-500',
      difficulty: 'Hard',
      xp: 125,
      benefits: ['Memory training', 'Pattern recall', 'Mental mapping'],
      estimatedTime: '10-20 min'
    },
    {
      id: 'speed-demon',
      title: '👹 Speed Demon',
      description: 'Ultimate speed challenge - read braille faster than ever!',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      difficulty: 'Insane',
      xp: 200,
      benefits: ['Maximum speed', 'Instant recognition', 'Elite performance'],
      estimatedTime: '5-15 min'
    },
    {
      id: 'pattern-ninja',
      title: '🥷 Pattern Ninja',
      description: 'Stealth mode - identify patterns with minimal visual cues!',
      icon: Eye,
      color: 'from-gray-600 to-gray-800',
      difficulty: 'Insane',
      xp: 180,
      benefits: ['Minimal cues', 'Advanced recognition', 'Expert intuition'],
      estimatedTime: '8-18 min'
    }
  ];

  // Customization options
  const practiceOptions = {
    levels: [
      { id: 'basics', name: 'Basics', emoji: '🌱', description: 'Letters, numbers, and punctuation' },
      { id: 'words', name: 'Words', emoji: '📝', description: 'Common words and vocabulary' },
      { id: 'sentences', name: 'Sentences', emoji: '📖', description: 'Reading complete sentences' },
      { id: 'contractions', name: 'Contractions', emoji: '✨', description: 'Braille contractions and shortcuts' },
      { id: 'advanced', name: 'Advanced', emoji: '🎓', description: 'Complex patterns and speed reading' }
    ],
    difficulties: [
      { 
        id: 'easy', 
        name: 'Beginner', 
        emoji: '🌱', 
        description: 'Longer time limits, simpler patterns, fewer options. Perfect for building confidence.',
        timeMultiplier: 1.5,
        characterPool: 'small',
        optionCount: 3
      },
      { 
        id: 'medium', 
        name: 'Intermediate', 
        emoji: '📚', 
        description: 'Standard time limits, common patterns, moderate options. Balanced challenge.',
        timeMultiplier: 1.0,
        characterPool: 'medium',
        optionCount: 4
      },
      { 
        id: 'hard', 
        name: 'Advanced', 
        emoji: '🎓', 
        description: 'Shorter time limits, complex patterns, more options. Tests your skills.',
        timeMultiplier: 0.8,
        characterPool: 'large',
        optionCount: 5
      },
      { 
        id: 'expert', 
        name: 'Expert', 
        emoji: '🔥', 
        description: 'Very short time limits, similar patterns, many options. For experienced readers.',
        timeMultiplier: 0.6,
        characterPool: 'full',
        optionCount: 6
      },
      { 
        id: 'insane', 
        name: 'Insane', 
        emoji: '💀', 
        description: 'Extreme time pressure, nearly identical patterns, maximum options. Ultimate test.',
        timeMultiplier: 0.4,
        characterPool: 'full',
        optionCount: 8
      }
    ],
    durations: [
      { value: 5, label: '5 minutes', description: 'Quick focused session' },
      { value: 10, label: '10 minutes', description: 'Standard practice session' },
      { value: 15, label: '15 minutes', description: 'Extended practice session' },
      { value: 20, label: '20 minutes', description: 'Deep focus session' }
    ],
    focusAreas: [
      { id: 'mixed', name: 'Mixed Practice', description: 'Balanced combination of all skills' },
      { id: 'accuracy', name: 'Accuracy Focus', description: 'Emphasis on getting patterns exactly right' },
      { id: 'speed', name: 'Speed Focus', description: 'Emphasis on reading patterns quickly' },
      { id: 'comprehension', name: 'Comprehension', description: 'Understanding meaning and context' }
    ]
  };

  useEffect(() => {
    document.title = 'Practice Sessions - BrailleLearn';
    window.scrollTo(0, 0);
    speak('Welcome to Practice Sessions! Choose a practice mode to improve your braille skills.');
    
    // Test Gemini API connection when page loads
    const testAPI = async () => {
      try {
        console.log('🔍 Testing Gemini API connection on page load...');
        const isConnected = await geminiService.testConnection();
        console.log('📊 API Connection Status:', isConnected ? 'Connected' : 'Failed');
        
        if (!isConnected) {
          console.warn('⚠️ Gemini API connection test failed - AI features may not work properly');
        }
      } catch (error) {
        console.error('❌ Error testing API connection:', error);
      }
    };
    
    testAPI();
  }, [speak]);

  // Timer effects
  useEffect(() => {
    if (gameActive && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      setGameTimer(timer);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
  }, [timeLeft, gameActive, showResults]);

  const generateBrailleCell = (letter: string): BrailleCellType => {
    return {
      dots: braillePatterns[letter.toUpperCase()] || [],
      char: letter.toUpperCase(),
      description: `Letter ${letter.toUpperCase()}`
    };
  };

  const generateSimilarPatterns = (targetDots: number[], count: number = 3): number[][] => {
    const allPatterns = Object.values(braillePatterns);
    const similar = allPatterns
      .filter(pattern => {
        const intersection = pattern.filter(dot => targetDots.includes(dot));
        const union = [...new Set([...pattern, ...targetDots])];
        const similarity = intersection.length / union.length;
        return similarity > 0.3 && similarity < 1.0;
      })
      .slice(0, count);
    
    while (similar.length < count) {
      const randomPattern = allPatterns[Math.floor(Math.random() * allPatterns.length)];
      if (!similar.some(p => arraysEqual(p, randomPattern)) && !arraysEqual(randomPattern, targetDots)) {
        similar.push(randomPattern);
      }
    }
    
    return similar;
  };

  const arraysEqual = (a: number[], b: number[]) => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  const startPracticeSession = async (modeId: string) => {
    setLoading(true);
    setSelectedMode(modeId);
    setScore(0);
    setStreak(0);
    setShowResults(false);
    setShowCustomization(false);
    setCurrentQuestionIndex(0);
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setUserAnswer('');
    setShowFeedback(false);
    setLives(3);
    setSelectedDots([]);
    setDraggedCells([]);
    setTargetWord([]);
    setMemoryCards([]);
    setFlippedCards([]);
    setMatchedCards([]);
    setIsAnswered(false);
    
    // Always generate practice content successfully
    const practiceData = await generatePracticeContent(modeId);
    setGameState(practiceData);
    setGameActive(true);
    
    if (practiceData.questions && practiceData.questions.length > 0) {
      setCurrentQuestion(practiceData.questions[0]);
      
      // Initialize mode-specific state
      if (modeId === 'memory-champion') {
        setMemoryCards(practiceData.questions[0].cards || []);
      }
    }
    
    setTimeLeft(selectedDuration * 60);
    
    playSound('navigation');
    speak(`Starting ${practiceModes.find(m => m.id === modeId)?.title}! Good luck!`);
    
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const generatePracticeContent = async (modeId: string) => {
    const wordLists = {
      'basics': {
        'easy': ['a', 'b', 'c', 'd', 'e'],
        'medium': ['cat', 'dog', 'sun', 'run', 'big'],
        'hard': ['quick', 'brown', 'jumps', 'over'],
        'expert': ['complex', 'pattern', 'advanced'],
        'insane': ['extraordinary', 'magnificent']
      },
      'words': {
        'easy': ['cat', 'dog', 'sun', 'run'],
        'medium': ['house', 'water', 'light', 'happy'],
        'hard': ['beautiful', 'wonderful', 'amazing'],
        'expert': ['magnificent', 'extraordinary'],
        'insane': ['incomprehensible', 'indescribable']
      },
      'sentences': {
        'easy': ['I am happy', 'The cat runs'],
        'medium': ['The quick brown fox jumps'],
        'hard': ['Understanding patterns requires practice'],
        'expert': ['Extraordinary achievements come from effort'],
        'insane': ['The magnificent sunset painted brilliant colors']
      },
      'contractions': {
        'easy': ['and', 'for', 'of', 'the'],
        'medium': ['about', 'above', 'across'],
        'hard': ['according', 'altogether'],
        'expert': ['conceive', 'deceive'],
        'insane': ['extraordinary', 'magnificent']
      },
      'advanced': {
        'easy': ['knowledge', 'learning'],
        'medium': ['comprehension', 'intelligence'],
        'hard': ['extraordinary', 'magnificent'],
        'expert': ['incomprehensible'],
        'insane': ['supercalifragilisticexpialidocious']
      }
    };
    
    const words = wordLists[selectedLevel as keyof typeof wordLists]?.[selectedDifficulty as keyof typeof wordLists['basics']] || 
                  wordLists.basics.easy;
    
    const questions = [];
    const numQuestions = Math.min(selectedDuration * 2, 30);
    const difficultySettings = practiceOptions.difficulties.find(d => d.id === selectedDifficulty);
    
    // Generate mode-specific content
    switch (modeId) {
      case 'lightning-reader':
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          questions.push({
            type: 'text-input',
            question: 'Read this braille pattern quickly!',
            braillePattern: brailleCells[0]?.[0]?.dots || [1],
            correctAnswer: word,
            timeLimit: Math.round(10 * (difficultySettings?.timeMultiplier || 1)),
            points: selectedDifficulty === 'insane' ? 25 : selectedDifficulty === 'expert' ? 20 : 15
          });
        }
        break;

      case 'precision-master':
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          const targetPattern = brailleCells[0]?.[0]?.dots || [1];
          const similarPatterns = generateSimilarPatterns(targetPattern, (difficultySettings?.optionCount || 4) - 1);
          
          questions.push({
            type: 'pattern-choice',
            question: 'Which braille pattern matches the target?',
            targetPattern,
            patternOptions: [targetPattern, ...similarPatterns].sort(() => Math.random() - 0.5),
            correctAnswer: targetPattern.join(','),
            points: selectedDifficulty === 'insane' ? 30 : selectedDifficulty === 'expert' ? 25 : 20
          });
        }
        break;

      case 'pattern-detective':
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          const fullPattern = brailleCells[0]?.[0]?.dots || [1];
          
          const dotsToHide = selectedDifficulty === 'insane' ? 4 : selectedDifficulty === 'expert' ? 3 : selectedDifficulty === 'hard' ? 2 : 1;
          const visibleDots = [...fullPattern];
          for (let j = 0; j < dotsToHide && visibleDots.length > 0; j++) {
            const randomIndex = Math.floor(Math.random() * visibleDots.length);
            visibleDots.splice(randomIndex, 1);
          }
          
          questions.push({
            type: 'complete-pattern',
            question: 'Complete the missing dots in this braille pattern:',
            partialPattern: visibleDots,
            fullPattern,
            correctAnswer: fullPattern.join(','),
            points: selectedDifficulty === 'insane' ? 35 : selectedDifficulty === 'expert' ? 30 : 25
          });
        }
        break;

      case 'braille-architect':
        for (let i = 0; i < Math.min(numQuestions, 10); i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          const wordCells = brailleCells[0] || [];
          
          const availableCells = [...wordCells];
          const distractorLetters = ['x', 'y', 'z', 'q', 'j'];
          for (let j = 0; j < 3; j++) {
            const distractor = distractorLetters[Math.floor(Math.random() * distractorLetters.length)];
            availableCells.push(generateBrailleCell(distractor));
          }
          
          questions.push({
            type: 'word-builder',
            question: 'Build this word using braille cells:',
            targetWord: wordCells,
            availableCells: availableCells.sort(() => Math.random() - 0.5),
            correctAnswer: word,
            points: selectedDifficulty === 'insane' ? 40 : selectedDifficulty === 'expert' ? 35 : 30
          });
        }
        break;

      case 'marathon-master':
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          questions.push({
            type: 'survival',
            question: `Wave ${i + 1}: Read this pattern!`,
            braillePattern: brailleCells[0]?.[0]?.dots || [1],
            correctAnswer: word,
            waveNumber: i + 1,
            timeLimit: Math.max(Math.round((15 - Math.floor(i / 5)) * (difficultySettings?.timeMultiplier || 1)), 3),
            points: (i + 1) * 5
          });
        }
        break;

      case 'memory-champion':
        const letters = words.filter(w => w.length === 1).slice(0, 8);
        const pairs: any[] = [];
        letters.forEach(letter => {
          const brailleCell = generateBrailleCell(letter);
          pairs.push(
            { id: pairs.length, type: 'pattern', content: brailleCell, matchId: letter, flipped: false, matched: false },
            { id: pairs.length + 1, type: 'letter', content: letter, matchId: letter, flipped: false, matched: false }
          );
        });
        
        questions.push({
          type: 'memory-match',
          question: 'Match braille patterns to their letters:',
          cards: pairs.sort(() => Math.random() - 0.5),
          correctAnswer: 'all-matched',
          points: selectedDifficulty === 'insane' ? 50 : selectedDifficulty === 'expert' ? 40 : 30
        });
        break;

      case 'speed-demon':
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          questions.push({
            type: 'speed-read',
            question: 'SPEED READ NOW!',
            braillePattern: brailleCells[0]?.[0]?.dots || [1],
            correctAnswer: word,
            timeLimit: Math.round((selectedDifficulty === 'insane' ? 2 : selectedDifficulty === 'expert' ? 3 : 4) * (difficultySettings?.timeMultiplier || 1)),
            points: selectedDifficulty === 'insane' ? 30 : selectedDifficulty === 'expert' ? 25 : 20
          });
        }
        break;

      case 'pattern-ninja':
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          questions.push({
            type: 'minimal-cues',
            question: 'Identify this pattern with minimal visual cues:',
            braillePattern: brailleCells[0]?.[0]?.dots || [1],
            correctAnswer: word,
            showDots: selectedDifficulty === 'insane' ? 1 : selectedDifficulty === 'expert' ? 2 : 3,
            points: selectedDifficulty === 'insane' ? 35 : selectedDifficulty === 'expert' ? 30 : 25
          });
        }
        break;

      default:
        for (let i = 0; i < numQuestions; i++) {
          const word = words[Math.floor(Math.random() * words.length)];
          const brailleCells = await translateTextToBraille(word);
          questions.push({
            type: 'text-input',
            question: 'Read this braille pattern!',
            braillePattern: brailleCells[0]?.[0]?.dots || [1],
            correctAnswer: word,
            timeLimit: 10,
            points: 15
          });
        }
    }
    
    return {
      mode: modeId,
      questions,
      totalQuestions: questions.length,
      settings: {
        level: selectedLevel,
        difficulty: selectedDifficulty,
        duration: selectedDuration,
        focus: selectedFocus
      }
    };
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    setUserAnswer(answer);
    
    const correct = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    
    if (correct) {
      setScore(score + currentQuestion.points);
      setStreak(streak + 1);
      setCorrectAnswers(correctAnswers + 1);
      playSound('success');
      speak('Correct!');
    } else {
      setStreak(0);
      if (selectedMode === 'marathon-master') {
        setLives(lives - 1);
        if (lives <= 1) {
          endGame();
          return;
        }
      }
      playSound('error');
      speak(`Incorrect. The answer was ${currentQuestion.correctAnswer}`);
    }
    
    setShowFeedback(true);
    setQuestionsAnswered(questionsAnswered + 1);
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handlePatternAnswer = (pattern: number[]) => {
    handleAnswer(pattern.join(','));
  };

  const handleDotToggle = (dotNumber: number) => {
    if (isAnswered) return;
    
    setSelectedDots(prev => {
      if (prev.includes(dotNumber)) {
        return prev.filter(d => d !== dotNumber);
      } else {
        return [...prev, dotNumber].sort((a, b) => a - b);
      }
    });
  };

  const submitDotPattern = () => {
    handleAnswer(selectedDots.join(','));
  };

  const handleCardFlip = (cardIndex: number) => {
    if (flippedCards.length >= 2 || flippedCards.includes(cardIndex) || matchedCards.includes(cardIndex)) {
      return;
    }
    
    const newFlipped = [...flippedCards, cardIndex];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const firstCard = memoryCards[first];
      const secondCard = memoryCards[second];
      
      if (firstCard.matchId === secondCard.matchId) {
        // Match found
        setTimeout(() => {
          setMatchedCards(prev => [...prev, first, second]);
          setFlippedCards([]);
          
          // Check if all cards are matched
          if (matchedCards.length + 2 >= memoryCards.length) {
            handleAnswer('all-matched');
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setFlippedCards([]);
        }, 1500);
      }
    }
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer('');
    setSelectedDots([]);
    setIsAnswered(false);
    
    if (currentQuestionIndex < gameState.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(gameState.questions[nextIndex]);
      
      if (selectedMode === 'memory-champion') {
        setMemoryCards(gameState.questions[nextIndex].cards || []);
        setFlippedCards([]);
        setMatchedCards([]);
      }
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setGameActive(false);
    setShowResults(true);
    
    if (gameTimer) {
      clearTimeout(gameTimer);
    }
    if (questionTimer) {
      clearTimeout(questionTimer);
    }
    
    const finalScore = Math.round((correctAnswers / questionsAnswered) * 100) || 0;
    const mode = practiceModes.find(m => m.id === selectedMode);
    
    playSound('achievement');
    speak(`Practice session complete! You scored ${finalScore} percent and earned ${score} points.`);
  };

  const restartGame = () => {
    if (selectedMode) {
      startPracticeSession(selectedMode);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);
    
    try {
      const context = `The student is practicing ${selectedMode} mode with ${selectedDifficulty} difficulty.`;
      const response = await geminiService.askInstructor(chatInput, context);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Keep practicing - you\'re doing great!',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Full screen loader component
  const FullScreenLoader = () => (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="braille-loader scale-150 mb-8">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <motion.p 
        className="text-2xl font-semibold text-primary-700 animate-pulse"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Generating Practice Session...
      </motion.p>
      <motion.p 
        className="text-lg text-gray-600 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Customizing your {selectedDifficulty} difficulty {selectedLevel} practice
      </motion.p>
    </motion.div>
  );

  // Results screen
  if (showResults) {
    const finalScore = Math.round((correctAnswers / questionsAnswered) * 100) || 0;
    const stars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : 1;
    
    return (
      <div className="min-h-screen bg-gray-50 braille-bg flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Practice Complete!
            </h1>
            <p className="text-gray-600">{practiceModes.find(m => m.id === selectedMode)?.title}</p>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {finalScore}%
            </div>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  size={32}
                  className={i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-900">{correctAnswers}</div>
                <div className="text-gray-600">Correct</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-900">{score}</div>
                <div className="text-gray-600">Points</div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={restartGame}
              className="flex-1 px-4 py-2 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" />
              Retry
            </button>
            <button
              onClick={() => {
                setSelectedMode(null);
                setShowCustomization(false);
                setGameActive(false);
                setShowResults(false);
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Home size={16} className="mr-2" />
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {loading && <FullScreenLoader />}
      </AnimatePresence>
      
      <div className="min-h-screen bg-gray-50 braille-bg">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-12 relative">
          <div className="absolute inset-0 braille-bg opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-3xl font-bold leading-tight mb-4">
              🎯 Practice Sessions
            </h1>
            <p className="text-lg text-primary-100">
              Challenge yourself with interactive braille practice games
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!selectedMode ? (
            // Practice Mode Selection
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {practiceModes.map((mode) => {
                const IconComponent = mode.icon;
                return (
                  <motion.div
                    key={mode.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedMode(mode.id);
                      setShowCustomization(true);
                    }}
                  >
                    <div className={`h-32 bg-gradient-to-br ${mode.color} flex items-center justify-center relative overflow-hidden`}>
                      <IconComponent size={48} className="text-white z-10" />
                      <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity"></div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{mode.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          mode.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                          mode.difficulty === 'Expert' ? 'bg-red-100 text-red-700' :
                          mode.difficulty === 'Insane' ? 'bg-gray-800 text-white' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {mode.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{mode.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">XP Reward:</span>
                          <span className="font-semibold text-primary-600">+{mode.xp}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Duration:</span>
                          <span className="font-medium text-gray-700">{mode.estimatedTime}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-xs text-gray-500 mb-2">Benefits:</div>
                        <div className="flex flex-wrap gap-1">
                          {mode.benefits.map((benefit, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : showCustomization ? (
            // Customization Screen
            <div className="flex gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white rounded-xl shadow-sm p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Customize Your Practice
                  </h2>
                  <button
                    onClick={() => {
                      setSelectedMode(null);
                      setShowCustomization(false);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Practice Level */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Practice Level</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {practiceOptions.levels.map((level) => (
                        <label key={level.id} className="cursor-pointer">
                          <input
                            type="radio"
                            name="level"
                            value={level.id}
                            checked={selectedLevel === level.id}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all text-center ${
                            selectedLevel === level.id
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}>
                            <div className="text-2xl mb-2">{level.emoji}</div>
                            <div className="font-medium text-gray-900">{level.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Level</h3>
                    <div className="space-y-3">
                      {practiceOptions.difficulties.map((difficulty) => (
                        <label key={difficulty.id} className="cursor-pointer block">
                          <input
                            type="radio"
                            name="difficulty"
                            value={difficulty.id}
                            checked={selectedDifficulty === difficulty.id}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all ${
                            selectedDifficulty === difficulty.id
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">{difficulty.emoji}</span>
                                <div>
                                  <div className="font-medium text-gray-900">{difficulty.name}</div>
                                  <div className="text-sm text-gray-600 mt-1">{difficulty.description}</div>
                                </div>
                              </div>
                              <div className="text-right text-xs text-gray-500">
                                <div>Time: {Math.round(10 * difficulty.timeMultiplier)}s</div>
                                <div>Options: {difficulty.optionCount}</div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Duration</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {practiceOptions.durations.map((duration) => (
                        <label key={duration.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="duration"
                            value={duration.value}
                            checked={selectedDuration === duration.value}
                            onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all text-center ${
                            selectedDuration === duration.value
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}>
                            <div className="font-medium text-gray-900">{duration.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{duration.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Focus Area */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Focus Area</h3>
                    <div className="space-y-3">
                      {practiceOptions.focusAreas.map((focus) => (
                        <label key={focus.id} className="cursor-pointer block">
                          <input
                            type="radio"
                            name="focus"
                            value={focus.id}
                            checked={selectedFocus === focus.id}
                            onChange={(e) => setSelectedFocus(e.target.value)}
                            className="sr-only"
                          />
                          <div className={`p-4 rounded-xl border-2 transition-all ${
                            selectedFocus === focus.id
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}>
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900 mr-3">{focus.name}</div>
                              <div className="text-sm text-gray-600">{focus.description}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <div className="text-center pt-6 border-t border-gray-200">
                    <button
                      onClick={() => startPracticeSession(selectedMode)}
                      className="px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      <Play size={20} className="inline mr-2" />
                      Start Practice Session
                    </button>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p>
                        {practiceOptions.levels.find(l => l.id === selectedLevel)?.name} • {practiceOptions.difficulties.find(d => d.id === selectedDifficulty)?.name} • {selectedDuration} minutes • {practiceOptions.focusAreas.find(f => f.id === selectedFocus)?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* AI Assistant Sidebar */}
              <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-670 to-primary-700 text-white rounded-t-xl">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">Practice Assistant</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm">
                      Ask me about practice strategies, difficulty levels, or braille techniques!
                    </div>
                  )}
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                          <span className="text-sm text-gray-600">BrailleLearn Agent is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask about practice..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : gameActive ? (
            // Active Game Screen
            <div className="flex gap-8">
              <div className="flex-1">
                {/* Game Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {practiceModes.find(m => m.id === selectedMode)?.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Timer size={16} className="mr-1" />
                          {formatTime(timeLeft)}
                        </div>
                        <div className="flex items-center">
                          <Trophy size={16} className="mr-1" />
                          {score} pts
                        </div>
                        {selectedMode === 'marathon-master' && (
                          <div className="flex items-center">
                            <Heart size={16} className="mr-1 text-red-500" />
                            {lives}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setGameActive(false);
                        setSelectedMode(null);
                        setShowCustomization(false);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      End Session
                    </button>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / gameState.totalQuestions) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mt-2">
                    Question {currentQuestionIndex + 1} of {gameState.totalQuestions}
                  </div>
                </div>

                {/* Game Content */}
                <div className="bg-white rounded-xl shadow-sm p-8">
                  {currentQuestion && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                        {currentQuestion.question}
                      </h3>

                      {/* Lightning Reader */}
                      {currentQuestion.type === 'text-input' && (
                        <div className="text-center">
                          <div className="mb-8">
                            <BrailleCell
                              cell={{ dots: currentQuestion.braillePattern, char: '', description: '' }}
                              size="lg"
                              showText={false}
                              triggerSolenoids={isArduinoConnected}
                            />
                          </div>
                          <div className="max-w-md mx-auto">
                            <input
                              type="text"
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && !isAnswered && handleAnswer(userAnswer)}
                              placeholder="Type what you read..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg text-center"
                              disabled={isAnswered}
                              autoFocus
                            />
                            <button
                              onClick={() => handleAnswer(userAnswer)}
                              disabled={!userAnswer.trim() || isAnswered}
                              className="mt-4 w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Submit Answer
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Precision Master */}
                      {currentQuestion.type === 'pattern-choice' && (
                        <div className="text-center">
                          <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 mb-4">Target Pattern:</h4>
                            <BrailleCell
                              cell={{ dots: currentQuestion.targetPattern, char: '', description: '' }}
                              size="lg"
                              showText={false}
                            />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                            {currentQuestion.patternOptions.map((pattern: number[], index: number) => (
                              <button
                                key={index}
                                onClick={() => handlePatternAnswer(pattern)}
                                disabled={isAnswered}
                                className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
                              >
                                <BrailleCell
                                  cell={{ dots: pattern, char: '', description: '' }}
                                  size="md"
                                  showText={false}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pattern Detective */}
                      {currentQuestion.type === 'complete-pattern' && (
                        <div className="text-center">
                          <div className="mb-8">
                            <h4 className="text-lg font-medium text-gray-700 mb-4">Partial Pattern (complete the missing dots):</h4>
                            <BrailleCell
                              cell={{ dots: currentQuestion.partialPattern, char: '', description: '' }}
                              size="lg"
                              showText={false}
                            />
                          </div>
                          <div className="mb-6">
                            <h4 className="text-md font-medium text-gray-700 mb-4">Click dots to complete the pattern:</h4>
                            <div className="flex justify-center">
                              <div className="grid grid-cols-2 grid-rows-3 gap-3 w-32 h-48 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                {[1, 4, 2, 5, 3, 6].map((dotNumber) => (
                                  <button
                                    key={dotNumber}
                                    onClick={() => handleDotToggle(dotNumber)}
                                    disabled={isAnswered}
                                    className={`rounded-full font-medium flex items-center justify-center text-white transition-all ${
                                      selectedDots.includes(dotNumber)
                                        ? 'bg-primary-600 hover:bg-primary-700'
                                        : 'bg-gray-400 hover:bg-gray-500'
                                    } disabled:opacity-50`}
                                  >
                                    {dotNumber}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={submitDotPattern}
                            disabled={selectedDots.length === 0 || isAnswered}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Submit Pattern
                          </button>
                        </div>
                      )}

                      {/* Memory Champion */}
                      {currentQuestion.type === 'memory-match' && (
                        <div className="text-center">
                          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                            {memoryCards.map((card, index) => (
                              <button
                                key={card.id}
                                onClick={() => handleCardFlip(index)}
                                disabled={matchedCards.includes(index)}
                                className={`aspect-square p-4 rounded-xl border-2 transition-all ${
                                  matchedCards.includes(index)
                                    ? 'border-green-500 bg-green-50'
                                    : flippedCards.includes(index)
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                                }`}
                              >
                                {(flippedCards.includes(index) || matchedCards.includes(index)) ? (
                                  card.type === 'pattern' ? (
                                    <BrailleCell
                                      cell={card.content}
                                      size="sm"
                                      showText={false}
                                    />
                                  ) : (
                                    <div className="text-2xl font-bold">{card.content}</div>
                                  )
                                ) : (
                                  <div className="text-4xl">?</div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      {showFeedback && (
                        <div className={`mt-6 p-4 rounded-lg ${
                          userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() || 
                          (currentQuestion.type === 'complete-pattern' && arraysEqual(selectedDots, currentQuestion.fullPattern)) ||
                          (currentQuestion.type === 'pattern-choice' && selectedDots.join(',') === currentQuestion.correctAnswer)
                            ? 'bg-green-50 border border-green-200 text-green-700' 
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                          <div className="flex items-center justify-center">
                            <CheckCircle size={20} className="mr-2" />
                            <span className="font-medium">
                              {userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() || 
                               (currentQuestion.type === 'complete-pattern' && arraysEqual(selectedDots, currentQuestion.fullPattern)) ||
                               (currentQuestion.type === 'pattern-choice' && selectedDots.join(',') === currentQuestion.correctAnswer)
                                ? 'Correct!' 
                                : `Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI Assistant Sidebar */}
              <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-xl">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">Practice Coach</span>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 text-sm">
                      I'm here to help during your practice! Ask me about strategies, tips, or if you need encouragement.
                    </div>
                  )}
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.text}</div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                          <span className="text-sm text-gray-600">BrailleLearn Agent is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask for help or tips..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      disabled={chatLoading}
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim() || chatLoading}
                      className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default PracticePage;