import { SignDefinition, SignLanguageCode, SignLanguageInfo, SpokenLanguageCode, SpokenLanguageInfo, MediaTranslationPreset } from '../types';

export const SUPPORTED_SIGN_LANGUAGES: SignLanguageInfo[] = [
  {
    code: 'ASL',
    name: 'American Sign Language',
    region: 'North America & Global',
    twoHandedAlphabet: false,
    flag: '🇺🇸',
    description: 'One-handed manual alphabet with topic-comment grammatical structure and rich facial non-manual markers.',
  },
  {
    code: 'BSL',
    name: 'British Sign Language',
    region: 'United Kingdom',
    twoHandedAlphabet: true,
    flag: '🇬🇧',
    description: 'Distinctive two-handed manual alphabet, spatial verbs, and unique regional British dialect markers.',
  },
  {
    code: 'LSF',
    name: 'French Sign Language (Langue des Signes Française)',
    region: 'France & Francophone',
    twoHandedAlphabet: false,
    flag: '🇫🇷',
    description: 'The historic ancestor of ASL and ISL, using rapid facial expressions and directional inflections.',
  },
  {
    code: 'ISL',
    name: 'International Sign',
    region: 'Global Conferences & Deaflympics',
    twoHandedAlphabet: false,
    flag: '🌐',
    description: 'Cross-cultural contact sign language utilizing highly iconic, pictorial, and pantomimic gestures.',
  },
  {
    code: 'Auslan',
    name: 'Australian Sign Language',
    region: 'Australia',
    twoHandedAlphabet: true,
    flag: '🇦🇺',
    description: 'Part of the BANZSL family with two-handed alphabet and Australian indigenous sign influences.',
  },
];

export const SUPPORTED_SPOKEN_LANGUAGES: SpokenLanguageInfo[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Chinese (Mandarin)', nativeName: '中文', flag: '🇨🇳' },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

// Helper to create rest/neutral hand pose
export const NEUTRAL_HAND_POSE = {
  thumb: 0.2,
  index: 0.2,
  middle: 0.25,
  ring: 0.3,
  pinky: 0.35,
  wristRotation: [0, 0, 0] as [number, number, number],
  armPosition: [0.35, -0.65, 0.15] as [number, number, number],
  armRotation: [0.1, 0, 0] as [number, number, number],
};

// Sign Alphabet Definitions (Fingerspelling A-Z)
const ALPHABET_SIGNS: SignDefinition[] = [
  {
    id: 'alpha-a',
    word: 'A',
    gloss: 'A',
    category: 'alphabet',
    description: 'Fist with thumb resting upright beside the folded index finger.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.0, // upright
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0, 0.1],
          armPosition: [0.28, -0.15, 0.42],
          armRotation: [0.8, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'alpha-b',
    word: 'B',
    gloss: 'B',
    category: 'alphabet',
    description: 'Four fingers upright and flat together with thumb tucked across the palm.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 1.0, // folded across palm
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, 0, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-c',
    word: 'C',
    gloss: 'C',
    category: 'alphabet',
    description: 'Curved hand resembling the letter C with fingers together and thumb opposed.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.5,
          index: 0.55,
          middle: 0.55,
          ring: 0.55,
          pinky: 0.55,
          wristRotation: [0, 0.4, 0.2],
          armPosition: [0.28, -0.14, 0.42],
          armRotation: [0.82, 0.1, -0.18],
        },
      },
    ],
  },
  {
    id: 'alpha-d',
    word: 'D',
    gloss: 'D',
    category: 'alphabet',
    description: 'Index finger pointing straight up, with thumb touching middle and ring tips into an O.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.7,
          index: 0.0, // pointing
          middle: 0.8,
          ring: 0.85,
          pinky: 0.9,
          wristRotation: [0, 0.1, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-e',
    word: 'E',
    gloss: 'E',
    category: 'alphabet',
    description: 'All fingertips curled tightly down touching the tucked thumb.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.9,
          index: 0.9,
          middle: 0.9,
          ring: 0.9,
          pinky: 0.9,
          wristRotation: [0.1, 0, 0],
          armPosition: [0.28, -0.15, 0.4],
          armRotation: [0.8, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'alpha-f',
    word: 'F',
    gloss: 'F',
    category: 'alphabet',
    description: 'Index tip and thumb tip touching to form a circle, other three fingers flared open.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.65,
          index: 0.65,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, 0.1, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-g',
    word: 'G',
    gloss: 'G',
    category: 'alphabet',
    description: 'Thumb and index finger pointing parallel horizontally, side view.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.6, 1.2],
          armPosition: [0.25, -0.16, 0.4],
          armRotation: [0.8, 0.2, -0.3],
        },
      },
    ],
  },
  {
    id: 'alpha-h',
    word: 'H',
    gloss: 'H',
    category: 'alphabet',
    description: 'Index and middle fingers extended together pointing horizontally to the side.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.6, 1.2],
          armPosition: [0.25, -0.16, 0.4],
          armRotation: [0.8, 0.2, -0.3],
        },
      },
    ],
  },
  {
    id: 'alpha-i',
    word: 'I',
    gloss: 'I',
    category: 'alphabet',
    description: 'Fist with only the little pinky finger extended straight up.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.9,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 0.0, // pinky up
          wristRotation: [0, 0, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-l',
    word: 'L',
    gloss: 'L',
    category: 'alphabet',
    description: 'Thumb and index extended at right angle forming an L, other fingers curled.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.0,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-o',
    word: 'O',
    gloss: 'O',
    category: 'alphabet',
    description: 'All fingers curved with tips meeting the thumb tip to form an O shape.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.65,
          index: 0.75,
          middle: 0.75,
          ring: 0.75,
          pinky: 0.75,
          wristRotation: [0, 0.3, 0.1],
          armPosition: [0.28, -0.14, 0.42],
          armRotation: [0.82, 0.08, -0.16],
        },
      },
    ],
  },
  {
    id: 'alpha-v',
    word: 'V',
    gloss: 'V',
    category: 'alphabet',
    description: 'Index and middle fingers extended apart in a V shape, other fingers folded.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 1.0,
          pinky: 1.0,
          spread: [0, -0.22, 0.22, 0, 0],
          wristRotation: [0, 0, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-w',
    word: 'W',
    gloss: 'W',
    category: 'alphabet',
    description: 'Index, middle, and ring fingers extended upright apart in a W shape.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 1.0,
          spread: [0, -0.25, 0.0, 0.25, 0],
          wristRotation: [0, 0, 0],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
  {
    id: 'alpha-y',
    word: 'Y',
    gloss: 'Y',
    category: 'alphabet',
    description: 'Thumb and pinky extended wide, middle three fingers folded into fist.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 700,
    keyframes: [
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.0,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 0.0,
          spread: [-0.35, 0, 0, 0, 0.35],
          wristRotation: [0, 0, -0.2],
          armPosition: [0.28, -0.12, 0.42],
          armRotation: [0.85, 0.05, -0.15],
        },
      },
    ],
  },
];

// Rich Conversational & Core Vocabulary
export const CORE_SIGNS: SignDefinition[] = [
  ...ALPHABET_SIGNS,
  {
    id: 'sign-hello',
    word: 'hello',
    gloss: 'HELLO',
    category: 'greeting',
    description: 'Open flat hand at temple saluting smoothly outward in greeting with a warm smile.',
    supportedLanguages: ['ASL', 'BSL', 'LSF', 'ISL', 'Auslan'],
    durationMs: 1200,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        mouthing: 'hello',
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          spread: [-0.18, -0.05, 0, 0.05, 0.1],
          wristRotation: [0.2, 0.2, -0.1],
          armPosition: [0.22, 0.15, 0.32],
          armRotation: [1.2, 0.3, -0.4],
        },
      },
      {
        timestamp: 0.5,
        headTilt: [0.05, 0, 0],
        expression: 'smile',
        mouthing: 'hello',
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          spread: [-0.2, -0.06, 0, 0.06, 0.12],
          wristRotation: [0.3, 0.1, 0.1],
          armPosition: [0.26, 0.18, 0.38],
          armRotation: [1.3, 0.2, -0.3],
        },
      },
      {
        timestamp: 1.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        mouthing: 'hello',
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          spread: [-0.22, -0.08, 0, 0.08, 0.15],
          wristRotation: [0.1, -0.2, 0.3],
          armPosition: [0.38, 0.12, 0.44],
          armRotation: [1.1, -0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-thank-you',
    word: 'thank you',
    gloss: 'THANK-YOU',
    category: 'greeting',
    description: 'Fingertips of dominant flat hand touch chin/lips, then move gently forward toward receiver with an appreciative nod.',
    supportedLanguages: ['ASL', 'BSL', 'LSF', 'ISL', 'Auslan'],
    durationMs: 1300,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        mouthing: 'thank you',
        rightHand: {
          thumb: 0.2,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          spread: [-0.08, 0, 0, 0, 0],
          wristRotation: [-0.3, 0.1, 0],
          armPosition: [0.1, 0.05, 0.3],
          armRotation: [1.35, 0.15, -0.1],
        },
      },
      {
        timestamp: 0.4,
        headTilt: [0.08, 0, 0],
        expression: 'smile',
        mouthing: 'thank you',
        rightHand: {
          thumb: 0.2,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          spread: [-0.08, 0, 0, 0, 0],
          wristRotation: [-0.4, 0.0, 0],
          armPosition: [0.06, 0.08, 0.26], // near chin
          armRotation: [1.45, 0.05, -0.05],
        },
      },
      {
        timestamp: 1.0,
        headTilt: [0.05, 0, 0],
        expression: 'smile',
        mouthing: 'thank you',
        rightHand: {
          thumb: 0.2,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          spread: [-0.1, 0, 0, 0, 0],
          wristRotation: [0.2, 0, 0],
          armPosition: [0.15, -0.08, 0.48], // extended towards viewer
          armRotation: [0.95, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-please',
    word: 'please',
    gloss: 'PLEASE',
    category: 'common',
    description: 'Open flat hand placed over the chest and gently rubbed in a circular motion.',
    supportedLanguages: ['ASL', 'LSF', 'ISL'],
    durationMs: 1400,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0.05, 0, 0],
        expression: 'smile',
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [-0.2, 0.3, 0],
          armPosition: [0.08, -0.15, 0.24],
          armRotation: [1.0, 0.2, -0.2],
        },
      },
      {
        timestamp: 0.33,
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [-0.1, 0.2, 0.2],
          armPosition: [0.12, -0.10, 0.24],
          armRotation: [1.1, 0.2, -0.1],
        },
      },
      {
        timestamp: 0.66,
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [-0.2, 0.1, -0.2],
          armPosition: [0.04, -0.12, 0.24],
          armRotation: [1.05, 0.1, -0.2],
        },
      },
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [-0.2, 0.3, 0],
          armPosition: [0.08, -0.15, 0.24],
          armRotation: [1.0, 0.2, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-yes',
    word: 'yes',
    gloss: 'YES',
    category: 'common',
    description: 'Fist held up and nodded up and down from the wrist, like a head nodding affirmatively.',
    supportedLanguages: ['ASL', 'BSL', 'LSF', 'ISL', 'Auslan'],
    durationMs: 1100,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0.05, 0, 0],
        expression: 'nod',
        rightHand: {
          thumb: 0.8,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [-0.3, 0, 0], // tilted back
          armPosition: [0.26, -0.12, 0.38],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 0.5,
        headTilt: [0.15, 0, 0],
        expression: 'nod',
        rightHand: {
          thumb: 0.8,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0.4, 0, 0], // bent down
          armPosition: [0.26, -0.15, 0.38],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 1.0,
        headTilt: [0.05, 0, 0],
        expression: 'nod',
        rightHand: {
          thumb: 0.8,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0.0, 0, 0],
          armPosition: [0.26, -0.13, 0.38],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-no',
    word: 'no',
    gloss: 'NO',
    category: 'common',
    description: 'Index and middle fingers snap shut against the thumb, mimicking a beak closing with head shaking.',
    supportedLanguages: ['ASL', 'LSF', 'ISL'],
    durationMs: 1100,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0.1, 0],
        expression: 'neutral',
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0.3, 0],
          armPosition: [0.25, -0.1, 0.4],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 0.5,
        headTilt: [0, -0.1, 0],
        expression: 'neutral',
        rightHand: {
          thumb: 0.7,
          index: 0.8,
          middle: 0.8,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0.1, 0.3, 0],
          armPosition: [0.25, -0.12, 0.4],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 1.0,
        headTilt: [0, 0.05, 0],
        expression: 'neutral',
        rightHand: {
          thumb: 0.7,
          index: 0.8,
          middle: 0.8,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0.1, 0.3, 0],
          armPosition: [0.25, -0.12, 0.4],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-help',
    word: 'help',
    gloss: 'HELP',
    category: 'emergency',
    twoHanded: true,
    description: 'Left flat open hand faces up as a supportive base; right fist with thumb up rests upon it and both elevate together.',
    supportedLanguages: ['ASL', 'BSL', 'LSF', 'ISL', 'Auslan'],
    durationMs: 1400,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0.05, 0, 0],
        expression: 'emphasis',
        leftHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, 0.6, -0.4],
          armPosition: [-0.08, -0.3, 0.35],
          armRotation: [0.8, -0.1, 0.2],
        },
        rightHand: {
          thumb: 0.0, // thumb up
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.2, 0],
          armPosition: [-0.05, -0.25, 0.35],
          armRotation: [0.85, 0.15, -0.2],
        },
      },
      {
        timestamp: 0.6,
        leftHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, 0.6, -0.4],
          armPosition: [-0.08, -0.16, 0.38],
          armRotation: [0.95, -0.1, 0.2],
        },
        rightHand: {
          thumb: 0.0,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.2, 0],
          armPosition: [-0.05, -0.11, 0.38],
          armRotation: [1.0, 0.15, -0.2],
        },
      },
      {
        timestamp: 1.0,
        leftHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, 0.6, -0.4],
          armPosition: [-0.08, -0.14, 0.39],
          armRotation: [0.98, -0.1, 0.2],
        },
        rightHand: {
          thumb: 0.0,
          index: 1.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.2, 0],
          armPosition: [-0.05, -0.09, 0.39],
          armRotation: [1.02, 0.15, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-i-love-you',
    word: 'i love you',
    gloss: 'I-LOVE-YOU',
    category: 'emotions',
    description: 'Iconic ASL ILY sign: thumb, index, and pinky extended wide; middle and ring folded.',
    supportedLanguages: ['ASL', 'LSF', 'ISL'],
    durationMs: 1300,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        mouthing: 'I love you',
        rightHand: {
          thumb: 0.0,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 0.0,
          spread: [-0.35, -0.15, 0, 0, 0.35],
          wristRotation: [0, 0, 0],
          armPosition: [0.25, -0.15, 0.38],
          armRotation: [0.85, 0.1, -0.2],
        },
      },
      {
        timestamp: 0.5,
        headTilt: [0.05, 0, 0.05],
        expression: 'smile',
        mouthing: 'I love you',
        rightHand: {
          thumb: 0.0,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 0.0,
          spread: [-0.38, -0.16, 0, 0, 0.38],
          wristRotation: [0, 0, -0.15],
          armPosition: [0.26, -0.08, 0.44],
          armRotation: [1.0, 0.1, -0.15],
        },
      },
      {
        timestamp: 1.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        mouthing: 'I love you',
        rightHand: {
          thumb: 0.0,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 0.0,
          spread: [-0.35, -0.15, 0, 0, 0.35],
          wristRotation: [0, 0, 0.1],
          armPosition: [0.26, -0.08, 0.44],
          armRotation: [1.0, 0.1, -0.15],
        },
      },
    ],
  },
  {
    id: 'sign-friend',
    word: 'friend',
    gloss: 'FRIEND',
    category: 'common',
    twoHanded: true,
    description: 'Curved index fingers hook into each other, then flip and hook the opposite way, symbolizing a bond.',
    supportedLanguages: ['ASL', 'LSF', 'ISL', 'BSL', 'Auslan'],
    durationMs: 1400,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        leftHand: {
          thumb: 0.7,
          index: 0.4,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0.4, -0.2],
          armPosition: [-0.08, -0.18, 0.36],
          armRotation: [0.9, -0.1, 0.2],
        },
        rightHand: {
          thumb: 0.7,
          index: 0.4,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.4, 0.2],
          armPosition: [0.08, -0.16, 0.36],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 0.5,
        leftHand: {
          thumb: 0.7,
          index: 0.4,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0.2, 0.5, -0.1],
          armPosition: [-0.04, -0.15, 0.38],
          armRotation: [0.95, -0.05, 0.15],
        },
        rightHand: {
          thumb: 0.7,
          index: 0.4,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [-0.2, -0.5, 0.1],
          armPosition: [0.04, -0.17, 0.38],
          armRotation: [0.95, 0.05, -0.15],
        },
      },
      {
        timestamp: 1.0,
        leftHand: {
          thumb: 0.7,
          index: 0.4,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0.4, -0.2],
          armPosition: [-0.06, -0.17, 0.36],
          armRotation: [0.9, -0.1, 0.2],
        },
        rightHand: {
          thumb: 0.7,
          index: 0.4,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.4, 0.2],
          armPosition: [0.06, -0.17, 0.36],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-where',
    word: 'where',
    gloss: 'WHERE',
    category: 'questions',
    description: 'Index finger extended upright, wagging side-to-side with eyebrows furrowed in a question marker.',
    supportedLanguages: ['ASL', 'LSF', 'ISL'],
    durationMs: 1200,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0.05, 0, 0],
        expression: 'question',
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0, -0.25],
          armPosition: [0.24, -0.12, 0.4],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 0.5,
        headTilt: [0.08, 0, 0],
        expression: 'question',
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0, 0.25],
          armPosition: [0.24, -0.12, 0.4],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 1.0,
        headTilt: [0.05, 0, 0],
        expression: 'question',
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0, -0.1],
          armPosition: [0.24, -0.12, 0.4],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
    ],
  },
  {
    id: 'sign-sign-language',
    word: 'sign language',
    gloss: 'SIGN-LANGUAGE',
    category: 'common',
    twoHanded: true,
    description: 'Both index fingers cycle around each other in alternating circular motions, representing visual flow.',
    supportedLanguages: ['ASL', 'BSL', 'LSF', 'ISL', 'Auslan'],
    durationMs: 1500,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        leftHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0.5, 0],
          armPosition: [-0.15, -0.15, 0.38],
          armRotation: [0.9, -0.2, 0.1],
        },
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.5, 0],
          armPosition: [0.15, -0.08, 0.38],
          armRotation: [1.0, 0.2, -0.1],
        },
      },
      {
        timestamp: 0.5,
        leftHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0.1, 0.3, 0.2],
          armPosition: [-0.12, -0.08, 0.36],
          armRotation: [1.0, -0.1, 0.1],
        },
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [-0.1, -0.3, -0.2],
          armPosition: [0.12, -0.15, 0.36],
          armRotation: [0.9, 0.1, -0.1],
        },
      },
      {
        timestamp: 1.0,
        leftHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, 0.5, 0],
          armPosition: [-0.15, -0.12, 0.38],
          armRotation: [0.95, -0.15, 0.1],
        },
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 1.0,
          ring: 1.0,
          pinky: 1.0,
          wristRotation: [0, -0.5, 0],
          armPosition: [0.15, -0.12, 0.38],
          armRotation: [0.95, 0.15, -0.1],
        },
      },
    ],
  },
  {
    id: 'sign-water',
    word: 'water',
    gloss: 'WATER',
    category: 'common',
    description: 'W handshape (three middle fingers up) tapping index finger against the chin twice.',
    supportedLanguages: ['ASL', 'LSF', 'ISL'],
    durationMs: 1200,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'neutral',
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 1.0,
          wristRotation: [0, 0.2, 0],
          armPosition: [0.12, 0.02, 0.32],
          armRotation: [1.3, 0.1, -0.1],
        },
      },
      {
        timestamp: 0.4,
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 1.0,
          wristRotation: [0, 0.2, 0],
          armPosition: [0.08, 0.06, 0.28], // tap chin
          armRotation: [1.4, 0.05, -0.05],
        },
      },
      {
        timestamp: 0.7,
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 1.0,
          wristRotation: [0, 0.2, 0],
          armPosition: [0.11, 0.03, 0.31],
          armRotation: [1.32, 0.1, -0.1],
        },
      },
      {
        timestamp: 1.0,
        rightHand: {
          thumb: 0.8,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 1.0,
          wristRotation: [0, 0.2, 0],
          armPosition: [0.08, 0.06, 0.28], // tap chin second time
          armRotation: [1.4, 0.05, -0.05],
        },
      },
    ],
  },
  {
    id: 'sign-peace',
    word: 'peace',
    gloss: 'PEACE',
    category: 'common',
    twoHanded: true,
    description: 'Hands clasp together, rotate smoothly, then separate moving downward with flat palms expressing calm.',
    supportedLanguages: ['ASL', 'BSL', 'LSF', 'ISL', 'Auslan'],
    durationMs: 1400,
    keyframes: [
      {
        timestamp: 0.0,
        headTilt: [0, 0, 0],
        expression: 'smile',
        leftHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, 0.5, -0.3],
          armPosition: [-0.05, -0.18, 0.34],
          armRotation: [0.9, -0.1, 0.2],
        },
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [0, -0.5, 0.3],
          armPosition: [0.05, -0.15, 0.34],
          armRotation: [0.9, 0.1, -0.2],
        },
      },
      {
        timestamp: 1.0,
        leftHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [-0.2, 0.2, -0.5],
          armPosition: [-0.28, -0.32, 0.36],
          armRotation: [0.7, -0.2, 0.3],
        },
        rightHand: {
          thumb: 0.1,
          index: 0.0,
          middle: 0.0,
          ring: 0.0,
          pinky: 0.0,
          wristRotation: [-0.2, -0.2, 0.5],
          armPosition: [0.28, -0.32, 0.36],
          armRotation: [0.7, 0.2, -0.3],
        },
      },
    ],
  },
];

// Multilingual word mapping to canonical ASL glosses
const MULTILINGUAL_WORD_MAP: Record<string, string> = {
  // English
  'hello': 'HELLO',
  'hi': 'HELLO',
  'hey': 'HELLO',
  'greetings': 'HELLO',
  'thank': 'THANK-YOU',
  'thanks': 'THANK-YOU',
  'please': 'PLEASE',
  'yes': 'YES',
  'yeah': 'YES',
  'yep': 'YES',
  'no': 'NO',
  'nope': 'NO',
  'help': 'HELP',
  'assist': 'HELP',
  'love': 'I-LOVE-YOU',
  'friend': 'FRIEND',
  'friends': 'FRIEND',
  'where': 'WHERE',
  'sign': 'SIGN-LANGUAGE',
  'signing': 'SIGN-LANGUAGE',
  'language': 'SIGN-LANGUAGE',
  'water': 'WATER',
  'peace': 'PEACE',

  // Spanish
  'hola': 'HELLO',
  'gracias': 'THANK-YOU',
  'por favor': 'PLEASE',
  'si': 'YES',
  'sí': 'YES',
  'ayuda': 'HELP',
  'amigo': 'FRIEND',
  'amiga': 'FRIEND',
  'donde': 'WHERE',
  'dónde': 'WHERE',
  'agua': 'WATER',
  'paz': 'PEACE',

  // French
  'bonjour': 'HELLO',
  'salut': 'HELLO',
  'merci': 'THANK-YOU',
  's\'il vous plaît': 'PLEASE',
  'oui': 'YES',
  'non': 'NO',
  'aide': 'HELP',
  'ami': 'FRIEND',
  'où': 'WHERE',
  'eau': 'WATER',
  'paix': 'PEACE',

  // German
  'hallo': 'HELLO',
  'danke': 'THANK-YOU',
  'bitte': 'PLEASE',
  'ja': 'YES',
  'nein': 'NO',
  'hilfe': 'HELP',
  'freund': 'FRIEND',
  'wo': 'WHERE',
  'wasser': 'WATER',
  'frieden': 'PEACE',

  // Swahili
  'habari': 'HELLO',
  'jambo': 'HELLO',
  'asante': 'THANK-YOU',
  'tafadhali': 'PLEASE',
  'ndiyo': 'YES',
  'hapana': 'NO',
  'msaada': 'HELP',
  'rafiki': 'FRIEND',
  'wapi': 'WHERE',
  'maji': 'WATER',
  'amani': 'PEACE',
};

/**
 * Translates natural text into a sequence of Sign Definitions / Fingerspelled letters
 */
export function translateTextToSignSequence(
  text: string, 
  signLanguage: SignLanguageCode = 'ASL'
): { word: string; sign: SignDefinition; isFingerspelled: boolean }[] {
  if (!text || !text.trim()) return [];

  const clean = text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .trim();

  const tokens = clean.split(/\s+/).filter(Boolean);
  const result: { word: string; sign: SignDefinition; isFingerspelled: boolean }[] = [];

  for (let i = 0; i < tokens.length; i++) {
    // Check 2-word phrase first (e.g. "thank you", "sign language", "i love you")
    if (i < tokens.length - 1) {
      const twoWord = `${tokens[i]} ${tokens[i + 1]}`;
      const mappedGloss = MULTILINGUAL_WORD_MAP[twoWord];
      const match = CORE_SIGNS.find(s => 
        (s.word.toLowerCase() === twoWord || (mappedGloss && s.gloss === mappedGloss)) &&
        s.supportedLanguages.includes(signLanguage)
      );
      if (match) {
        result.push({ word: twoWord, sign: match, isFingerspelled: false });
        i++; // skip next
        continue;
      }
    }

    // Check single word
    const singleWord = tokens[i];
    const mappedGloss = MULTILINGUAL_WORD_MAP[singleWord];
    const match = CORE_SIGNS.find(s => 
      (s.word.toLowerCase() === singleWord || (mappedGloss && s.gloss === mappedGloss)) &&
      s.supportedLanguages.includes(signLanguage)
    );

    if (match) {
      result.push({ word: singleWord, sign: match, isFingerspelled: false });
    } else {
      // Fingerspell word character by character
      for (const char of singleWord.toUpperCase()) {
        const letterSign = ALPHABET_SIGNS.find(s => s.word === char);
        if (letterSign) {
          result.push({ word: char, sign: letterSign, isFingerspelled: true });
        }
      }
    }
  }

  return result;
}

/**
 * Pre-defined media translation presets (YouTube, Spotify, etc.)
 */
export const MEDIA_PRESETS: MediaTranslationPreset[] = [
  {
    id: 'preset-yt-ted',
    title: 'TED Talk: The Power of Deaf Culture & Visual Expression',
    source: 'youtube',
    duration: '0:42',
    url: 'https://www.youtube.com/watch?v=20x1e3k6wX4',
    author: 'Accessible Global Voices',
    thumbnail: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=600&auto=format&fit=crop&q=80',
    transcript: [
      { startTime: 0, endTime: 6, text: 'Hello and welcome everyone.', gloss: 'HELLO WELCOME ALL' },
      { startTime: 6, endTime: 14, text: 'Sign language is a rich visual language with deep cultural connection.', gloss: 'SIGN-LANGUAGE RICH VISUAL CULTURE DEEP' },
      { startTime: 14, endTime: 22, text: 'When we learn to communicate together, we build friendship and understanding.', gloss: 'LEARN COMMUNICATE TOGETHER BUILD FRIEND UNDERSTAND' },
      { startTime: 22, endTime: 32, text: 'Thank you for supporting accessibility everywhere.', gloss: 'THANK-YOU ALL SUPPORT ACCESSIBLE EVERYWHERE' },
      { startTime: 32, endTime: 42, text: 'Peace and community for all.', gloss: 'PEACE COMMUNITY FOR ALL' },
    ],
  },
  {
    id: 'preset-spotify-lyrics',
    title: 'Acoustic Melody: "Peace & Understanding"',
    source: 'spotify',
    duration: '0:36',
    url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    author: 'Harmonic Bridge',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    transcript: [
      { startTime: 0, endTime: 8, text: 'Hello morning, the sun begins to rise.', gloss: 'HELLO SUN RISE MORNING' },
      { startTime: 8, endTime: 16, text: 'Where is the quiet melody of hope?', gloss: 'WHERE QUIET MUSIC HOPE' },
      { startTime: 16, endTime: 25, text: 'I love you through every season and storm.', gloss: 'I-LOVE-YOU EVERY SEASON STORM' },
      { startTime: 25, endTime: 36, text: 'Thank you for standing by my side in peace.', gloss: 'THANK-YOU YOU STAND WITH ME PEACE' },
    ],
  },
  {
    id: 'preset-emergency-brief',
    title: 'Accessibility Emergency & First Response Guide',
    source: 'video',
    duration: '0:30',
    url: 'https://example.com/accessibility-guidelines.mp4',
    author: 'Global Disaster Relief & Deaf Access',
    thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    transcript: [
      { startTime: 0, endTime: 6, text: 'Please stay calm and follow emergency signs.', gloss: 'PLEASE CALM FOLLOW EMERGENCY' },
      { startTime: 6, endTime: 14, text: 'Do you need help or medical assistance?', gloss: 'YOU NEED HELP DOCTOR QUESTION' },
      { startTime: 14, endTime: 22, text: 'Water and medical supplies are located here.', gloss: 'WATER MEDICAL HERE' },
      { startTime: 22, endTime: 30, text: 'Yes, help is on the way. Thank you.', gloss: 'YES HELP ARRIVE SOON THANK-YOU' },
    ],
  },
];
