import React, { createContext, useContext, useState, useEffect } from 'react';
import { audioFeedback } from '../services/audioFeedback';

interface AudioContextType {
  isEnabled: boolean;
  toggleAudio: () => void;
  speak: (text: string, options?: any) => Promise<void>;
  playSound: (sound: string) => void;
}

const AudioContext = createContext<AudioContextType>({
  isEnabled: true,
  toggleAudio: () => {},
  speak: async () => {},
  playSound: () => {},
});

export const useAudio = () => useContext(AudioContext);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('audioEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('audioEnabled', JSON.stringify(isEnabled));
    audioFeedback.setEnabled(isEnabled);
    
    // Toggle screen reader based on audio setting
    if (!isEnabled) {
      window.speechSynthesis.cancel();
    }
  }, [isEnabled]);

  // Set initial zoom level
  useEffect(() => {
    document.body.style.zoom = "140%";
  }, []);

  const toggleAudio = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
    }
  };

  const speak = async (text: string, options = {}) => {
    if (isEnabled) {
      await audioFeedback.speak(text, options);
    }
  };

  const playSound = (sound: string) => {
    if (isEnabled) {
      audioFeedback.playSound(sound as any);
    }
  };

  return (
    <AudioContext.Provider value={{ isEnabled, toggleAudio, speak, playSound }}>
      {children}
    </AudioContext.Provider>
  );
};