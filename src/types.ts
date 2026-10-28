export type SignLanguageCode = 'ASL' | 'BSL' | 'LSF' | 'ISL' | 'Auslan';

export interface SignLanguageInfo {
  code: SignLanguageCode;
  name: string;
  region: string;
  twoHandedAlphabet: boolean;
  flag: string;
  description: string;
}

export type SpokenLanguageCode = 
  | 'en-US' 
  | 'es-ES' 
  | 'fr-FR' 
  | 'de-DE' 
  | 'ja-JP' 
  | 'zh-CN' 
  | 'sw-KE' 
  | 'ar-SA' 
  | 'pt-BR' 
  | 'hi-IN';

export interface SpokenLanguageInfo {
  code: SpokenLanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface HandPose {
  // Finger bends (0 = fully extended, 1 = fully curled)
  thumb: number;
  index: number;
  middle: number;
  ring: number;
  pinky: number;
  // Optional lateral finger spread / abduction in radians
  spread?: [number, number, number, number, number];
  // Wrist / forearm rotation angles in radians
  wristRotation: [number, number, number];
  armPosition: [number, number, number];
  armRotation: [number, number, number];
}

export interface SignKeyframe {
  timestamp: number; // 0 to 1 progress within sign
  leftHand?: HandPose;
  rightHand: HandPose;
  headTilt?: [number, number, number];
  expression?: 'neutral' | 'smile' | 'question' | 'nod' | 'emphasis';
  mouthing?: string; // Word or syllable to mouth on the humanoid lips
}

export interface SignDefinition {
  id: string;
  word: string;
  category: 'alphabet' | 'number' | 'greeting' | 'common' | 'emergency' | 'questions' | 'emotions';
  gloss: string;
  description: string;
  supportedLanguages: SignLanguageCode[];
  durationMs: number;
  keyframes: SignKeyframe[];
  twoHanded?: boolean;
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  inputText: string;
  sourceLang: string;
  targetSignLang: SignLanguageCode;
  glosses: string[];
  syncedToCloud: boolean;
  category?: string;
  favorite?: boolean;
}

export interface DetectedSignEvent {
  sign: string;
  confidence: number;
  timestamp: number;
  spoken: boolean;
  category: string;
}

export interface MediaTranslationPreset {
  id: string;
  title: string;
  source: 'youtube' | 'spotify' | 'video' | 'podcast';
  duration: string;
  url: string;
  author: string;
  thumbnail: string;
  transcript: {
    startTime: number;
    endTime: number;
    text: string;
    gloss: string;
  }[];
}

export interface AccessibilitySettings {
  highContrast: 'off' | 'high-contrast-dark' | 'high-contrast-yellow';
  fontSize: 'normal' | 'large' | 'extra-large';
  dyslexicFont: boolean;
  hapticEnabled: boolean;
  hapticStrength: 'light' | 'medium' | 'strong';
  avatarSpeed: number; // 0.25 to 2.0
  avatarMirror: boolean;
  showLandmarkOverlay: boolean;
  autoSpeakDetectedSigns: boolean;
  targetSpeechLanguage: SpokenLanguageCode;
  speechVoiceRate: number;
  speechVoicePitch: number;
  offlineProcessingPreferred: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncedTimestamp: number | null;
  pendingItemsCount: number;
  isSyncing: boolean;
}
