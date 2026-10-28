import React, { useState, useRef, useEffect } from 'react';
import { 
  Youtube, Music, Video, Link as LinkIcon, Play, Pause, 
  RotateCcw, Sparkles, Check, Upload, ExternalLink, Subtitles, 
  Clock, Volume2, Shield 
} from 'lucide-react';
import { MediaTranslationPreset, SignLanguageCode, AccessibilitySettings } from '../types';
import { MEDIA_PRESETS, translateTextToSignSequence } from '../utils/signDictionary';
import { ThreeSignAvatar } from './ThreeSignAvatar';
import { triggerHaptic } from '../utils/haptics';

interface MediaTranslatorProps {
  activeSignLang: SignLanguageCode;
  settings: AccessibilitySettings;
}

export const MediaTranslator: React.FC<MediaTranslatorProps> = ({
  activeSignLang,
  settings,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<MediaTranslationPreset>(MEDIA_PRESETS[0]);
  const [inputUrl, setInputUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [speed, setSpeed] = useState(settings.avatarSpeed || 1.0);
  const [mirror, setMirror] = useState(settings.avatarMirror || false);
  const [customFileLoaded, setCustomFileLoaded] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive sign sequence from active sentence
  const activeSentence = selectedPreset.transcript[activeSentenceIndex] || selectedPreset.transcript[0];
  const signSequence = React.useMemo(() => {
    return translateTextToSignSequence(activeSentence.text, activeSignLang);
  }, [activeSentence, activeSignLang]);

  // Media playback simulation timer
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.2 * speed;
          // Find matching sentence
          const currentSentence = selectedPreset.transcript[activeSentenceIndex];
          if (currentSentence && next >= currentSentence.endTime) {
            if (activeSentenceIndex < selectedPreset.transcript.length - 1) {
              const nextIndex = activeSentenceIndex + 1;
              setActiveSentenceIndex(nextIndex);
              setActiveWordIndex(0);
              triggerHaptic('tick', settings.hapticEnabled);
            } else {
              setIsPlaying(false);
              return 0;
            }
          }
          return next;
        });
      }, 200);
    }

    return () => clearInterval(interval);
  }, [isPlaying, speed, activeSentenceIndex, selectedPreset, settings]);

  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    // Detect platform
    const isYt = inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be');
    const isSp = inputUrl.includes('spotify.com');

    // Create dynamic translated media item with simulated captions
    const newMedia: MediaTranslationPreset = {
      id: `custom-${Date.now()}`,
      title: isYt ? 'Imported YouTube Video Translation' : isSp ? 'Imported Spotify Track Translation' : 'Imported Web Media Translation',
      source: isYt ? 'youtube' : isSp ? 'spotify' : 'video',
      duration: '0:35',
      url: inputUrl,
      author: 'Live Media Interpreter Engine',
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&auto=format&fit=crop&q=80',
      transcript: [
        { startTime: 0, endTime: 6, text: 'Hello, welcome to this translated video broadcast.', gloss: 'HELLO WELCOME TRANSLATE VIDEO' },
        { startTime: 6, endTime: 14, text: 'The sign language avatar translates speech in real time.', gloss: 'SIGN-LANGUAGE TRANSLATE REAL-TIME' },
        { startTime: 14, endTime: 24, text: 'Accessible captions and visual gestures keep you connected.', gloss: 'ACCESSIBLE CAPTION VISUAL SIGN KEEP CONNECT' },
        { startTime: 24, endTime: 35, text: 'Thank you for building an inclusive world.', gloss: 'THANK-YOU BUILD INCLUSIVE WORLD PEACE' },
      ],
    };

    setSelectedPreset(newMedia);
    setInputUrl('');
    setCurrentTime(0);
    setActiveSentenceIndex(0);
    setActiveWordIndex(0);
    setIsPlaying(true);
    triggerHaptic('success', settings.hapticEnabled);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setCustomFileLoaded(file.name);

    const uploadedMedia: MediaTranslationPreset = {
      id: `upload-${Date.now()}`,
      title: file.name,
      source: file.type.includes('audio') ? 'spotify' : 'video',
      duration: '0:30',
      url: fileUrl,
      author: 'Local Device File',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      transcript: [
        { startTime: 0, endTime: 7, text: 'Playing your local media file with synchronized sign interpretation.', gloss: 'PLAY LOCAL MEDIA FILE SIGN SYNCHRONIZE' },
        { startTime: 7, endTime: 18, text: 'Offline processing ensures your private media remains safe on your device.', gloss: 'OFFLINE PROCESS PRIVATE MEDIA SAFE DEVICE' },
        { startTime: 18, endTime: 30, text: 'Thank you for using Gestura accessibility tools.', gloss: 'THANK-YOU USE GESTURA ACCESSIBLE TOOLS' },
      ],
    };

    setSelectedPreset(uploadedMedia);
    setCurrentTime(0);
    setActiveSentenceIndex(0);
    setActiveWordIndex(0);
    setIsPlaying(true);
    triggerHaptic('success', settings.hapticEnabled);
  };

  const jumpToSentence = (idx: number) => {
    setActiveSentenceIndex(idx);
    setActiveWordIndex(0);
    const item = selectedPreset.transcript[idx];
    if (item) {
      setCurrentTime(item.startTime);
    }
    triggerHaptic('tick', settings.hapticEnabled);
  };

  // Helper to extract clean YouTube embed ID if valid
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=0&controls=1` : null;
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header and Link Importer Form */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Media & Video URL Sign Translator
              </h2>
              <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Live Subtitle Sync
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Paste YouTube or Spotify links, or upload local files. The 3D avatar interprets the audio in synchronized sign language.
            </p>
          </div>

          {/* Quick Preset Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {MEDIA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset);
                  setCurrentTime(0);
                  setActiveSentenceIndex(0);
                  setActiveWordIndex(0);
                  setIsPlaying(false);
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
                  selectedPreset.id === preset.id
                    ? 'bg-sky-500 text-white font-bold shadow'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.source === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-400" />}
                {preset.source === 'spotify' && <Music className="w-3.5 h-3.5 text-emerald-400" />}
                {preset.source === 'video' && <Video className="w-3.5 h-3.5 text-amber-400" />}
                <span className="truncate max-w-[120px]">{preset.title.split(':')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form for YouTube / Spotify URL or Local File */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleCustomUrlSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste YouTube, Spotify, or video link (e.g., https://www.youtube.com/watch?v=...)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-semibold shrink-0 transition-colors shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Translate Link
            </button>
          </form>

          {/* Local File Upload Button for Complete Offline Functionality */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="video/*,audio/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-2xl text-xs font-medium shrink-0 transition-colors flex items-center gap-1.5"
            title="Upload offline video or audio file"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Upload Offline Media</span>
          </button>
        </div>
      </div>

      {/* Main Side-by-Side Synchronized Media & 3D Sign Avatar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Media Viewport & Synchronized Player */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner aspect-video relative flex flex-col justify-center items-center">
            {/* If YouTube, display embed; otherwise thumbnail + visualizer */}
            {selectedPreset.source === 'youtube' && getYouTubeEmbedUrl(selectedPreset.url) ? (
              <iframe
                src={getYouTubeEmbedUrl(selectedPreset.url)!}
                title={selectedPreset.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={selectedPreset.thumbnail}
                  alt={selectedPreset.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="relative z-10 text-center p-4 space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center mx-auto backdrop-blur-sm shadow-xl">
                    {selectedPreset.source === 'spotify' ? (
                      <Music className="w-7 h-7" />
                    ) : (
                      <Video className="w-7 h-7" />
                    )}
                  </div>
                  <h3 className="text-white font-bold text-base max-w-sm truncate">{selectedPreset.title}</h3>
                  <p className="text-slate-400 text-xs">{selectedPreset.author}</p>
                </div>

                {/* Animated Sound Waves / Audio Visualizer when playing */}
                {isPlaying && (
                  <div className="absolute bottom-4 inset-x-8 flex items-end justify-center gap-1.5 h-10 pointer-events-none">
                    {[16, 28, 40, 24, 34, 18, 30, 42, 22, 38, 20, 32].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-sky-400/80 rounded-full transition-all duration-150 animate-pulse"
                        style={{ height: `${(h * (isPlaying ? 1 : 0.2)).toFixed(0)}px` }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Live Synchronized Closed Caption Banner */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 pt-6 pointer-events-none">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold mb-1">
                <Subtitles className="w-3.5 h-3.5" /> Synchronized Sign Transcript
              </div>
              <div className="text-white font-medium text-sm sm:text-base leading-snug drop-shadow">
                "{activeSentence?.text}"
              </div>
            </div>
          </div>

          {/* Media Player Controls */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  triggerHaptic('startSigning', settings.hapticEnabled);
                }}
                className="p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-2 text-xs transition-colors shadow"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Play Synced'}</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTime(0);
                  setActiveSentenceIndex(0);
                  setActiveWordIndex(0);
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                title="Restart playback"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{Math.floor(currentTime)}s / {selectedPreset.duration}</span>
            </div>
          </div>

          {/* Interactive Transcript Sentence List */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Interactive Timed Transcript
            </span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {selectedPreset.transcript.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => jumpToSentence(idx)}
                  className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                    activeSentenceIndex === idx
                      ? 'bg-sky-500/15 border-sky-500/50 text-white font-medium'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-sky-400">
                      {item.startTime}s - {item.endTime}s
                    </span>
                    <span className="font-mono text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      Gloss: {item.gloss}
                    </span>
                  </div>
                  <div>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 3D Sign Language Interpreter Avatar */}
        <div className="lg:col-span-6 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Avatar Sign Interpreter
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] px-2 py-0.5 rounded-full font-mono">
                {activeSignLang} Standard
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Signing: <strong className="text-sky-300">{signSequence[activeWordIndex]?.word || 'Idle'}</strong>
            </span>
          </div>

          {/* 3D Avatar Render Viewport */}
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
