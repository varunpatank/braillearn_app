import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
    
    if (!isEnabled) {
      window.speechSynthesis.cancel();
    }
  }, [isEnabled]);

  useEffect(() => {
    document.body.style.zoom = "140%";
  }, []);

  const toggleAudio = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled) {
      window.speechSynthesis.cancel();
    }
  };

  const speak = useCallback(async (text: string, options = {}) => {
    if (isEnabled) {
      await audioFeedback.speak(text, options);
    }
  }, [isEnabled]);

  const playSound = useCallback((sound: string) => {
    if (isEnabled) {
      audioFeedback.playSound(sound as any);
    }
  }, [isEnabled]);

  return (
    <AudioContext.Provider value={{ isEnabled, toggleAudio, speak, playSound }}>
      {children}
    </AudioContext.Provider>
  );
};