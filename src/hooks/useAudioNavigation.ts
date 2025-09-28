import { useEffect, useCallback } from 'react';
import { audioFeedback } from '../services/audioFeedback';

interface UseAudioNavigationOptions {
  description: string;
  hoverSound?: boolean;
  clickSound?: boolean;
  announceOnFocus?: boolean;
  customSounds?: {
    hover?: string;
    click?: string;
  };
}

export function useAudioNavigation(
  elementId: string,
  options: UseAudioNavigationOptions
) {
  const {
    description,
    hoverSound = true,
    clickSound = true,
    announceOnFocus = true,
    customSounds = {}
  } = options;

  const handleFocus = useCallback(() => {
    if (announceOnFocus) {
      audioFeedback.speak(description, { priority: true });
    }
  }, [description, announceOnFocus]);

  const handleHover = useCallback(() => {
    if (hoverSound) {
      audioFeedback.playSound(customSounds.hover || 'hover');
    }
  }, [hoverSound, customSounds.hover]);

  const handleClick = useCallback(() => {
    if (clickSound) {
      audioFeedback.playSound(customSounds.click || 'tap');
    }
  }, [clickSound, customSounds.click]);

  useEffect(() => {
    const element = document.getElementById(elementId);
    
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('mouseenter', handleHover);
      element.addEventListener('click', handleClick);

      // Add ARIA attributes
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', description);

      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('mouseenter', handleHover);
        element.removeEventListener('click', handleClick);
      };
    }
  }, [elementId, handleFocus, handleHover, handleClick, description]);
}