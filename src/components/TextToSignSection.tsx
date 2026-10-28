import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Volume2, Sparkles, Send, RotateCcw, 
  Bookmark, Globe, Info, Clock, Check, HelpCircle 
} from 'lucide-react';
import { 
  SignLanguageCode, SpokenLanguageCode, AccessibilitySettings, 
  TranslationHistoryItem 
} from '../types';
import { 
  SUPPORTED_SIGN_LANGUAGES, SUPPORTED_SPOKEN_LANGUAGES, 
  translateTextToSignSequence 
} from '../utils/signDictionary';
import { createSpeechRecognizer, speechSynth } from '../utils/speech';
import { triggerHaptic } from '../utils/haptics';
import { saveHistoryItem } from '../utils/storage';
import { ThreeSignAvatar } from './ThreeSignAvatar';

interface TextToSignSectionProps {
  activeSignLang: SignLanguageCode;
  onSignLangChange: (lang: SignLanguageCode) => void;
  settings: AccessibilitySettings;
  onSaveHistory: (item: TranslationHistoryItem) => void;
}

const QUICK_PHRASES = [
  'Hello! Nice to meet you friend',
  'Please help me find water',
  'Where is the hospital?',
  'Thank you for your assistance',
  'I love you and wish you peace',
  'Yes, I understand sign language',
];

export const TextToSignSection: React.FC<TextToSignSectionProps> = ({
  activeSignLang,
  onSignLangChange,
  settings,
  onSaveHistory,
}) => {
  const [inputText, setInputText] = useState('Hello! Welcome to Gestura sign language interpreter.');
  const [selectedSpokenLang, setSelectedSpokenLang] = useState<SpokenLanguageCode>('en-US');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [speed, setSpeed] = useState(settings.avatarSpeed || 1.0);
  const [mirror, setMirror] = useState(settings.avatarMirror || false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  // Active sign sequence derived from current input text
  const signSequence = React.useMemo(() => {
    return translateTextToSignSequence(inputText, activeSignLang);
  }, [inputText, activeSignLang]);

  // Voice Speech-To-Text Recognition handler
  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);

  const startVoiceInput = () => {
    const rec = createSpeechRecognizer(selectedSpokenLang, {
      onResult: (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          setIsPlaying(true);
          setActiveWordIndex(0);
          triggerHaptic('success', settings.hapticEnabled);
        }
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (rec) {
      recognizerRef.current = rec;
      rec.start();
      setIsListening(true);
      triggerHaptic('startSigning', settings.hapticEnabled);
    } else {
      setVoiceSupported(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
    }
    setIsListening(false);
  };

  const handleTranslateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsPlaying(true);
    setActiveWordIndex(0);
    triggerHaptic('startSigning', settings.hapticEnabled);

    // Save to local offline history & sync queue
    const historyItem: TranslationHistoryItem = {
      id: `trans-${Date.now()}`,
      timestamp: Date.now(),
      inputText: inputText.trim(),
      sourceLang: selectedSpokenLang,
      targetSignLang: activeSignLang,
      glosses: signSequence.map(s => s.sign.gloss),
      syncedToCloud: false, // will sync once network connects
      category: 'general',
    };
    saveHistoryItem(historyItem);
    onSaveHistory(historyItem);
  };

  const activeSignInfo = SUPPORTED_SIGN_LANGUAGES.find(s => s.code === activeSignLang)!;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Top Bar: Language Selectors & Standard Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Voice & Text to Sign Interpreter</span>
            <span className="text-xs bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
              3D Procedural
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Speak or type in your language. The 3D interpreter performs anatomical sign grammar and fingerspelling.
          </p>
        </div>

        {/* Dual Language Selector (Input Spoken Lang & Target Sign Standard) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Spoken Language */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Input Voice/Text
            </span>
            <select
              value={selectedSpokenLang}
              onChange={(e) => {
                setSelectedSpokenLang(e.target.value as SpokenLanguageCode);
                triggerHaptic('tick', settings.hapticEnabled);
              }}
              className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {SUPPORTED_SPOKEN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Sign Language */}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sign Language Standard
            </span>
            <select
              value={activeSignLang}
              onChange={(e) => {
                onSignLangChange(e.target.value as SignLanguageCode);
                triggerHaptic('tick', settings.hapticEnabled);
              }}
              className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
            >
              {SUPPORTED_SIGN_LANGUAGES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.flag} {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input, Voice Recognition & Quick Phrase Chips */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <form onSubmit={handleTranslateSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or speak words to translate into sign language..."
                rows={4}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-500 resize-none leading-relaxed"
              />

              {/* Character count & clear */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-slate-500">
                <span>{inputText.length} chars</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2">
              {/* Mic Speech-to-Text Button */}
              {isListening ? (
                <button
                  type="button"
                  onClick={stopVoiceInput}
                  className="px-3.5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-pulse"
                >
                  <MicOff className="w-4 h-4" /> Listening... (Click to Stop)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startVoiceInput}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors"
                  title="Speak into microphone"
                >
                  <Mic className="w-4 h-4 text-sky-400" />
                  <span>Speak via Mic</span>
                </button>
              )}

              {/* Submit & Sign Button */}
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Interpret Sign</span>
              </button>
            </div>
          </form>

          {/* Sign Language Metadata Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>{activeSignInfo.flag}</span>
                <span>{activeSignInfo.name}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                {activeSignInfo.twoHandedAlphabet ? 'Two-Handed Alphabet' : 'One-Handed Alphabet'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {activeSignInfo.description}
            </p>
          </div>

          {/* Quick Practice Phrases */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quick Accessible Phrases
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PHRASES.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(phrase);
                    setIsPlaying(true);
                    setActiveWordIndex(0);
                    triggerHaptic('tick', settings.hapticEnabled);
                  }}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs transition-colors text-left"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 3D Sign Language Avatar Viewport */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Live Sign Language Interpretation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Tokens: {signSequence.length} {signSequence.length === 1 ? 'sign' : 'signs'}
            </span>
          </div>

          {/* Three.js Avatar Component */}
          <ThreeSignAvatar
            currentSignSequence={signSequence}
            isPlaying={isPlaying}
            onPlayStateChange={setIsPlaying}
            speed={speed}
            onSpeedChange={setSpeed}
            mirror={mirror}
            onMirrorChange={setMirror}
            hapticEnabled={settings.hapticEnabled}
            activeWordIndex={activeWordIndex}
            onWordIndexChange={setActiveWordIndex}
          />
        </div>
      </div>
    </div>
  );
};
