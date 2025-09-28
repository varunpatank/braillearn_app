import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { SpeechRecognitionResult } from '../../types/types';

interface SpeechRecognitionProps {
  onResult: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  continuous?: boolean;
  language?: string;
  stopAfterResult?: boolean;
  interimResults?: boolean;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onResult,
  onError,
  autoStart = false,
  continuous = true,
  language = 'en-US',
  stopAfterResult = false,
  interimResults = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const audioFeedbackRef = useRef<HTMLAudioElement | null>(null);
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    // Create audio element for feedback
    audioFeedbackRef.current = new Audio();
    
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setErrorMessage('Speech recognition is not supported in this browser.');
      if (onError) onError('Speech recognition not supported');
      return;
    }

    // Initialize the SpeechRecognition object
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognitionAPI();
    
    // Configure recognition
    recognitionRef.current.continuous = continuous;
    recognitionRef.current.interimResults = interimResults;
    recognitionRef.current.lang = language;

    // Set up event handlers
    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      const fullTranscript = finalTranscriptRef.current + interimTranscript;
      setTranscript(fullTranscript);
      
      onResult({
        transcript: fullTranscript,
        isFinal: event.results[event.results.length - 1].isFinal,
        confidence: event.results[event.results.length - 1][0].confidence
      });
      
      // If stopAfterResult is true and we have a final result, stop listening
      if (stopAfterResult && event.results[event.results.length - 1].isFinal) {
        stopListening();
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      const errorMsg = `Speech recognition error: ${event.error}`;
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    };

    recognitionRef.current.onend = () => {
      // Only update state if we didn't explicitly stop
      if (isListening) {
        setIsListening(false);
      }
    };

    // Start recognition automatically if autoStart is true
    if (autoStart) {
      startListening();
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [autoStart, continuous, language, onError, onResult, stopAfterResult, interimResults, isListening]);

  const startListening = () => {
    if (errorMessage === 'Speech recognition is not supported in this browser.') {
      return;
    }

    setErrorMessage(null);
    setIsListening(true);
    finalTranscriptRef.current = '';
    
    try {
      recognitionRef.current.start();
      
      // Play audio feedback for start
      if (audioFeedbackRef.current) {
        audioFeedbackRef.current.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD/////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCQAAAAAAAAAGwuLWBVDEAAAAAAAAAAAAAAABBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAANcAJeGUEQAQL7iKdJDJESQgj4kQdM/+MYxAYNOAJyeUAQAgEQbnP//JJIYyD/wxjE/+MYxAkAAANIAAAAABERERE';
        audioFeedbackRef.current.volume = 0.3;
        audioFeedbackRef.current.play();
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      const errorMsg = 'Failed to start speech recognition.';
      setErrorMessage(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Play audio feedback for stop
      if (audioFeedbackRef.current) {
        audioFeedbackRef.current.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAeAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD/////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQCQAAAAAAAAAHguC1GWjEAAAAAAAAAAAAAAABBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAN0AKeGUEQAYASgKfrPnJJCYgl4Rf4/+MYxAYPGAJ+eUEQAAEn//ySSW/hD/MEY/+MYxAcAAANIAAAAABERERE';
        audioFeedbackRef.current.volume = 0.3;
        audioFeedbackRef.current.play();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={!!errorMessage}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <MicOff size={28} className="text-white" />
          ) : (
            <Mic size={28} className="text-white" />
          )}
        </button>
        
        {isListening && (
          <div className="absolute -top-1 -right-1">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        {isListening ? (
          <div className="flex items-center text-red-600">
            <Volume2 size={16} className="mr-1 animate-pulse" />
            <span>Listening...</span>
          </div>
        ) : (
          <div className="text-gray-600">
            {errorMessage ? (
              <span className="text-red-500">{errorMessage}</span>
            ) : (
              <span>Click the microphone to start</span>
            )}
          </div>
        )}
      </div>
      
      {transcript && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-gray-800 w-full max-w-md">
          <p className="font-medium">Recognized speech:</p>
          <p className="text-gray-700 italic">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;