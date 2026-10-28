import React, { useState } from 'react';
import { 
  Search, BookOpen, Sparkles, Filter, CheckCircle2, 
  HelpCircle, RotateCcw, Volume2, Shield 
} from 'lucide-react';
import { SignDefinition, SignLanguageCode, AccessibilitySettings } from '../types';
import { CORE_SIGNS } from '../utils/signDictionary';
import { ThreeSignAvatar } from './ThreeSignAvatar';
import { triggerHaptic } from '../utils/haptics';
import { speechSynth } from '../utils/speech';

interface SignVocabularySectionProps {
  activeSignLang: SignLanguageCode;
  settings: AccessibilitySettings;
}

export const SignVocabularySection: React.FC<SignVocabularySectionProps> = ({
  activeSignLang,
  settings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeSign, setActiveSign] = useState<SignDefinition>(CORE_SIGNS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(settings.avatarSpeed || 1.0);
  const [mirror, setMirror] = useState(settings.avatarMirror || false);
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceQuizIdx, setPracticeQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Filter signs by language, search, and category
  const filteredSigns = CORE_SIGNS.filter(sign => {
    const matchesLang = sign.supportedLanguages.includes(activeSignLang);
    const matchesSearch = 
      sign.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sign.gloss.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || sign.category === selectedCategory;
    return matchesLang && matchesSearch && matchesCat;
  });

  const categories = [
    { id: 'all', label: 'All Signs' },
    { id: 'greeting', label: 'Greetings' },
    { id: 'common', label: 'Common' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'alphabet', label: 'Alphabet A-Z' },
    { id: 'questions', label: 'Questions' },
    { id: 'emotions', label: 'Emotions' },
  ];

  const handleSelectSign = (sign: SignDefinition) => {
    setActiveSign(sign);
    setIsPlaying(true);
    triggerHaptic('startSigning', settings.hapticEnabled);
  };

  const handlePracticeAnswer = (option: string, correct: string) => {
    setSelectedAnswer(option);
    if (option === correct) {
      setQuizScore(prev => prev + 1);
      triggerHaptic('success', settings.hapticEnabled);
    } else {
      triggerHaptic('warning', settings.hapticEnabled);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedAnswer(null);
    setPracticeQuizIdx(prev => (prev + 1) % CORE_SIGNS.length);
    setIsPlaying(true);
    triggerHaptic('tick', settings.hapticEnabled);
  };

  // Convert active sign to sequence for avatar
  const signSequence = React.useMemo(() => {
    return [{ word: activeSign.word, sign: activeSign, isFingerspelled: activeSign.category === 'alphabet' }];
  }, [activeSign]);

  // Quiz active question
  const currentQuizSign = CORE_SIGNS[practiceQuizIdx % CORE_SIGNS.length];
  const quizSequence = React.useMemo(() => {
    return [{ word: currentQuizSign.word, sign: currentQuizSign, isFingerspelled: currentQuizSign.category === 'alphabet' }];
  }, [currentQuizSign]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header & Practice Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <span>Interactive Sign Dictionary & Practice</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Explore {CORE_SIGNS.length} anatomical signs and test your recognition with interactive drills.
          </p>
        </div>

        {/* Toggle Practice Drill Mode */}
        <button
          onClick={() => {
            setPracticeMode(!practiceMode);
            setSelectedAnswer(null);
            triggerHaptic('tick', settings.hapticEnabled);
          }}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md ${
            practiceMode
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold ring-2 ring-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{practiceMode ? 'Exit Practice Mode' : 'Start Practice Quiz'}</span>
        </button>
      </div>

      {!practiceMode ? (
        /* Dictionary Browsing Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Search, Filter Tabs & Sign Cards */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sign dictionary (e.g. hello, help, peace, A, B)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-500"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    triggerHaptic('tick', settings.hapticEnabled);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-sky-500 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sign Cards List */}
            <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filteredSigns.map((sign) => (
                <div
                  key={sign.id}
                  onClick={() => handleSelectSign(sign)}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                    activeSign.id === sign.id
                      ? 'bg-sky-500/15 border-sky-500/60 ring-1 ring-sky-400'
                      : 'bg-slate-950 border-slate-800/80 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-white text-sm">{sign.word}</span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded">
                      {sign.gloss}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {sign.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Sign Detail & 3D Interactive Avatar */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{activeSign.word}</h3>
                  <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md font-mono">
                    Gloss: {activeSign.gloss}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-md">
                  {activeSign.description}
                </p>
              </div>

              <button
                onClick={() => {
                  speechSynth.speak(activeSign.word);
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
                title="Speak word aloud"
              >
                <Volume2 className="w-3.5 h-3.5 text-sky-400" /> Speak Word
              </button>
            </div>

            <ThreeSignAvatar
              currentSignSequence={signSequence}
              isPlaying={isPlaying}
              onPlayStateChange={setIsPlaying}
              speed={speed}
              onSpeedChange={setSpeed}
              mirror={mirror}
              onMirrorChange={setMirror}
              hapticEnabled={settings.hapticEnabled}
              activeWordIndex={0}
              onWordIndexChange={() => {}}
            />
          </div>
        </div>
      ) : (
        /* Interactive Practice Quiz Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 flex flex-col space-y-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Question {practiceQuizIdx + 1}</span>
                <h3 className="text-base font-bold text-white mt-0.5">Which sign is the avatar demonstrating?</h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400 font-bold">Score: {quizScore}</span>
              </div>
            </div>

            {/* Multiple Choice Answers */}
            <div className="grid grid-cols-1 gap-2.5">
              {[
                currentQuizSign.word,
                CORE_SIGNS[(practiceQuizIdx + 3) % CORE_SIGNS.length].word,
                CORE_SIGNS[(practiceQuizIdx + 7) % CORE_SIGNS.length].word,
                CORE_SIGNS[(practiceQuizIdx + 11) % CORE_SIGNS.length].word,
              ]
                .sort()
                .map((option, idx) => {
                  const isCorrect = option === currentQuizSign.word;
                  const isSelected = selectedAnswer === option;

                  let btnStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-850';
                  if (selectedAnswer) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!!selectedAnswer}
                      onClick={() => handlePracticeAnswer(option, currentQuizSign.word)}
                      className={`p-4 rounded-2xl border text-sm text-left transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </button>
                  );
                })}
            </div>

            {selectedAnswer && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  {selectedAnswer === currentQuizSign.word ? '🎉 Correct!' : `❌ Correct answer was: ${currentQuizSign.word}`}
                </span>
                <button
                  onClick={nextQuizQuestion}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  Next Sign Drill
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-6">
            <ThreeSignAvatar
              currentSignSequence={quizSequence}
              isPlaying={true}
              onPlayStateChange={setIsPlaying}
              speed={speed}
              onSpeedChange={setSpeed}
              mirror={mirror}
              onMirrorChange={setMirror}
              hapticEnabled={settings.hapticEnabled}
              activeWordIndex={0}
              onWordIndexChange={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};
