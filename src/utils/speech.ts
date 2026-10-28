import { SpokenLanguageCode } from '../types';

/**
 * Text-to-Speech (TTS) synthesizer for speaking detected sign language words in real-time
 */
class SpeechSynthesizer {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public speak(
    text: string, 
    lang: SpokenLanguageCode = 'en-US',
    rate: number = 1.0, 
    pitch: number = 1.0,
    onEnd?: () => void
  ): boolean {
    if (!this.synth) return false;

    try {
      this.synth.cancel(); // Cancel any ongoing speech for real-time responsiveness

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = Math.max(0.5, Math.min(2.0, rate));
      utterance.pitch = Math.max(0.5, Math.min(2.0, pitch));

      const availableVoices = this.getVoices();
      const matchedVoice = availableVoices.find(v => v.lang === lang || v.lang.startsWith(lang.split('-')[0]));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }

      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      return false;
    }
  }

  public cancel() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const speechSynth = new SpeechSynthesizer();

/**
 * Speech Recognition (STT) for listening to spoken voice and translating to sign language
 */
export interface SpeechRecognitionListener {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function createSpeechRecognizer(
  lang: SpokenLanguageCode,
  listener: SpeechRecognitionListener
) {
  if (typeof window === 'undefined') return null;

  // Web Speech API
  const SpeechRecognitionConstructor = 
    (window as unknown as Record<string, any>)['SpeechRecognition'] || 
    (window as unknown as Record<string, any>)['webkitSpeechRecognition'];

  if (!SpeechRecognitionConstructor) {
    return null;
  }

  try {
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        listener.onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        listener.onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      listener.onError(event.error);
    };

    recognition.onend = () => {
      listener.onEnd();
    };

    return recognition;
  } catch (err) {
    console.warn('SpeechRecognition initialization error:', err);
    return null;
  }
}
