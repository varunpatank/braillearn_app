import confetti from 'canvas-confetti';

export const showSuccessConfetti = () => {
  // First burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4CAF50', '#8BC34A', '#CDDC39'],
  });

  // Second burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#2196F3', '#03A9F4', '#00BCD4'],
    });
  }, 200);

  // Third burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#9C27B0', '#E91E63', '#FF9800'],
    });
  }, 400);
};