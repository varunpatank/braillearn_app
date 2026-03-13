import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { geminiService } from '../../services/geminiService';
import BrailleCell from '../../components/braille/BrailleCell';
import BrailleWord from '../../components/braille/BrailleWord';
import { ChevronLeft, ChevronRight, CheckCircle, Volume2, RotateCcw, Award, Brain, MessageCircle, Lightbulb, Send } from 'lucide-react';
import { getLessonById, braillePatterns } from '../../data/lessons';
import { Exercise } from '../../types/types';

const dotPatternToLabel = (dots: number[], char?: string): string => {
  const dotStr = dots.length === 1 ? `dot ${dots[0]}` : `dots ${dots.join(' and ')}`;
  return char ? `${char}, ${dotStr}` : dotStr;
};

const LessonPage: React.FC = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { updateLessonProgress, isArduinoConnected } = useAppContext();
  
  const narrate = (text: string) => window.dispatchEvent(new CustomEvent('braylin-narrate', { detail: { text } }));
  
  const [lesson, setLesson] = useState(getLessonById(lessonId || ''));
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [textInput, setTextInput] = useState('');
  const [showAIInstructor, setShowAIInstructor] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [wrongAnswerCount, setWrongAnswerCount] = useState(0);
  const [showChatbox, setShowChatbox] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'ai', timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (lesson) {
      document.title = `${lesson.title} - BrailleLearn`;
      narrate(`Starting lesson: ${lesson.title}. ${lesson.description}`);
    }
  }, [lesson]);

  useEffect(() => {
    if (!lesson) return;
    const ex = lesson.exercises[currentExerciseIndex];
    if (!ex) return;
    const timer = setTimeout(() => {
      let patternNarration = '';
      if (ex.braillePattern && ex.braillePattern.length > 0) {
        patternNarration = ex.braillePattern
          .map(cell => dotPatternToLabel(cell.dots, cell.char))
          .join('. ');
      }
      const text = `Exercise ${currentExerciseIndex + 1} of ${lesson.exercises.length}. ${ex.question}` +
        (patternNarration ? `. The braille pattern is: ${patternNarration}.` : '') +
        (ex.options ? ` Options: ${ex.options.join(', ')}.` : ' Type your answer.');
      narrate(text);
    }, currentExerciseIndex === 0 ? 2500 : 500);
    return () => clearTimeout(timer);
  }, [currentExerciseIndex, lesson]);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h1>
          <button
            onClick={() => navigate('/learn')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  const currentExercise = lesson.exercises[currentExerciseIndex];
  const totalExercises = lesson.exercises.length;
  const progress = ((currentExerciseIndex + 1) / totalExercises) * 100;

  const handleAnswer = (answer: string) => {
    const correct = Array.isArray(currentExercise.correctAnswer) 
      ? currentExercise.correctAnswer.includes(answer)
      : answer.toLowerCase() === currentExercise.correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setUserAnswers([...userAnswers, answer]);

    if (correct) {
      setScore(score + currentExercise.points);
      narrate('Correct! Well done.');
      setWrongAnswerCount(0);
    } else {
      narrate(`Incorrect. The correct answer is ${currentExercise.correctAnswer}`);
      setWrongAnswerCount(prev => prev + 1);
      
      if (wrongAnswerCount >= 1) {
        showAIHelp();
      }
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer('');
      setTextInput('');
      
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      } else {
        const finalScore = Math.round((score / lesson.exercises.reduce((sum, ex) => sum + ex.points, 0)) * 100);
        setLessonCompleted(true);
        updateLessonProgress(lessonId || '', true, finalScore);
        narrate(`Lesson completed! Your score is ${finalScore} percent.`);
      }
    }, 2000);
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleAnswer(textInput.trim());
    }
  };

  const showAIHelp = async () => {
    setAiLoading(true);
    setShowAIInstructor(true);
    
    try {
      const context = `The student is working on: ${currentExercise.question}. The correct answer is: ${currentExercise.correctAnswer}. They've gotten this wrong ${wrongAnswerCount + 1} times.`;
      const response = await geminiService.askInstructor(
        `I'm having trouble with this braille exercise. Can you give me a hint?`,
        context
      );
      setAiResponse(response);
      narrate(response);
    } catch (error) {
      console.error('Error getting AI help:', error);
      setAiResponse('I\'m having trouble connecting right now. Try breaking down the braille pattern dot by dot, and remember that each character has a unique pattern!');
    } finally {
      setAiLoading(false);
    }
  };

  const restartLesson = () => {
    setCurrentExerciseIndex(0);
    setUserAnswers([]);
    setScore(0);
    setLessonCompleted(false);
    setShowFeedback(false);
    setSelectedAnswer('');
    setTextInput('');
    setWrongAnswerCount(0);
    setShowAIInstructor(false);
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
      const context = `The student is working on lesson: ${lesson.title}. Current exercise: ${currentExercise.question}`;
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
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        sender: 'ai' as const,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };
  const speakContent = (text: string) => {
    narrate(text);
  };

  useEffect(() => {
    const onAction = (e: Event) => {
      const { action, value } = (e as CustomEvent).detail || {};
      if (action === 'exit-lesson') {
        sessionStorage.setItem('braillearn-returned-from-lesson', 'true');
        narrate('Going back to the learn page.');
        navigate('/learn');
        window.scrollTo(0, 0);
      }
      if (action === 'read-question') {
        const ex = lesson?.exercises[currentExerciseIndex];
        if (ex) speakContent(ex.question);
      }
      if (action === 'answer' && value) {
        handleAnswer(value);
      }
      if (action === 'repeat-pattern') {
        const ex = lesson?.exercises[currentExerciseIndex];
        if (ex?.braillePattern) {
          const text = ex.braillePattern.map(c => dotPatternToLabel(c.dots, c.char)).join('. ');
          narrate(`The braille pattern is: ${text}`);
        }
      }
    };
    window.addEventListener('braylin-lesson-action', onAction);
    return () => window.removeEventListener('braylin-lesson-action', onAction);
  }, [currentExerciseIndex, lesson, navigate]);

  useEffect(() => {
    if (lessonCompleted) {
      const timer = setTimeout(() => {
        narrate('Say "exit" to go back to the learn page.');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lessonCompleted]);

  if (lessonCompleted) {
    const finalScore = Math.round((score / lesson.exercises.reduce((sum, ex) => sum + ex.points, 0)) * 100);
    const stars = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : 1;
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lesson Complete!
            </h1>
            <p className="text-gray-600">{lesson.title}</p>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {finalScore}%
            </div>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${
                    i < stars ? 'bg-yellow-400' : 'bg-gray-200'
                  } flex items-center justify-center`}
                >
                  ⭐
                </div>
              ))}
            </div>
            <p className="text-gray-600">
              You scored {score} out of {lesson.exercises.reduce((sum, ex) => sum + ex.points, 0)} points
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={restartLesson}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center"
            >
              <RotateCcw size={16} className="mr-2" />
              Retry
            </button>
            <button
              onClick={() => navigate('/learn')}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 braille-bg">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate('/learn')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>Back to Lessons</span>
            </button>
            <button
              onClick={() => setShowChatbox(!showChatbox)}
              className="flex items-center px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <MessageCircle size={16} className="mr-1" />
              AI Instructor
            </button>
            <span className="text-sm text-gray-500">
              Exercise {currentExerciseIndex + 1} of {totalExercises}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          <div className="flex-1">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {lesson.title}
                </h1>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => speakContent(currentExercise.question)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Read question aloud"
                >
                  <Volume2 size={20} />
                </button>
                <button
                  onClick={showAIHelp}
                  className="p-2 text-primary-600 hover:text-primary-700 rounded-full hover:bg-primary-50"
                  title="Get AI help"
                >
                  <Brain size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentExercise.question}
            </h2>

            {currentExercise.braillePattern && (
              <div className="flex justify-center mb-8">
                <div className="flex flex-wrap gap-4 justify-center">
                  {currentExercise.braillePattern.map((cell, index) => (
                    <BrailleCell
                      key={index}
                      cell={cell}
                      size="lg"
                      showText={currentExercise.type === 'multiple-choice'}
                      animateIn={true}
                      triggerSolenoids={isArduinoConnected}
                    />
                  ))}
                </div>
              </div>
            )}

            {currentExercise.type === 'multiple-choice' && currentExercise.options && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentExercise.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedAnswer(option);
                      handleAnswer(option);
                    }}
                    disabled={showFeedback}
                    className={`p-4 text-lg font-medium rounded-lg border-2 transition-all
                      ${showFeedback
                        ? option === currentExercise.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : option === selectedAnswer
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                        : 'border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {(currentExercise.type === 'braille-to-text' || currentExercise.type === 'text-to-braille') && (
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                  disabled={showFeedback}
                  autoFocus
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!textInput.trim() || showFeedback}
                  className="mt-4 w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {showFeedback && (
              <div className={`mt-6 p-4 rounded-lg ${
                isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-center">
                  <CheckCircle size={20} className="mr-2" />
                  <span className="font-medium">
                    {isCorrect ? 'Correct!' : `Incorrect. The correct answer is: ${currentExercise.correctAnswer}`}
                  </span>
                </div>
                {isCorrect && (
                  <p className="mt-2 text-sm">
                    +{currentExercise.points} points
                  </p>
                )}
              </div>
            )}
          </div>

          {showAIInstructor && (
            <div className="mt-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 border border-primary-200">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-primary-600" />
                    <span className="font-medium text-primary-800">AI Instructor Hint:</span>
                  </div>
                  {aiLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                      <span className="text-primary-700">Thinking of a helpful hint...</span>
                    </div>
                  ) : (
                    <div className="text-primary-700">{aiResponse}</div>
                  )}
                </div>
                <button
                  onClick={() => setShowAIInstructor(false)}
                  className="text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            Current Score: {score} points
          </div>
        </div>
          </div>

          {showChatbox && (
            <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">AI Instructor</span>
                  </div>
                  <button
                    onClick={() => setShowChatbox(false)}
                    className="text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm">
                    Ask me anything about this lesson!
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
                        <span className="text-sm text-gray-600">AI is typing...</span>
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
                    placeholder="Ask a question..."
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;