import { Howl } from 'howler';

class AudioFeedback {
  private static instance: AudioFeedback;
  private sounds: Record<string, Howl>;
  private enabled: boolean = true;
  private currentVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    this.sounds = {
      tap: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'],
        volume: 0.5
      }),
      success: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3'],
        volume: 0.5
      }),
      error: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'],
        volume: 0.5
      }),
      navigation: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'],
        volume: 0.3
      }),
      hover: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2574/2574-preview.mp3'],
        volume: 0.2
      }),
      achievement: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2575/2575-preview.mp3'],
        volume: 0.6
      })
    };

    // Initialize speech synthesis voice
    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();
      this.currentVoice = voices.find(voice => voice.lang === 'en-US') || voices[0];
    };
  }

  public static getInstance(): AudioFeedback {
    if (!AudioFeedback.instance) {
      AudioFeedback.instance = new AudioFeedback();
    }
    return AudioFeedback.instance;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public playSound(soundName: keyof typeof this.sounds) {
    if (this.enabled && this.sounds[soundName]) {
      this.sounds[soundName].play();
    }
  }

  public speak(text: string, options: {
    priority?: boolean;
    rate?: number;
    pitch?: number;
    volume?: number;
  } = {}) {
    if (!this.enabled) return;

    const { priority = false, rate = 1, pitch = 1, volume = 1 } = options;

    if (priority) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.currentVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    window.speechSynthesis.speak(utterance);

    return new Promise((resolve) => {
      utterance.onend = resolve;
    });
  }

  public stopSpeaking() {
    window.speechSynthesis.cancel();
  }

  public async announceNavigation(text: string) {
    this.playSound('navigation');
    await this.speak(text, { priority: true });
  }

  public async announceSuccess(text: string) {
    this.playSound('success');
    await this.speak(text, { priority: true });
  }

  public async announceError(text: string) {
    this.playSound('error');
    await this.speak(text, { priority: true });
  }

  public async announceAchievement(text: string) {
    this.playSound('achievement');
    await this.speak(text, { priority: true, rate: 0.9, pitch: 1.1 });
  }
}

export const audioFeedback = AudioFeedback.getInstance();