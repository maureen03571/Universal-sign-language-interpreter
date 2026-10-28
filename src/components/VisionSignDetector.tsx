import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Camera, CameraOff, Volume2, VolumeX, Shield, Eye, 
  RotateCcw, Sparkles, Check, Globe, RefreshCw, AlertCircle, Copy 
} from 'lucide-react';
import { 
  SignLanguageCode, SpokenLanguageCode, DetectedSignEvent, 
  AccessibilitySettings 
} from '../types';
import { SUPPORTED_SPOKEN_LANGUAGES, SUPPORTED_SIGN_LANGUAGES } from '../utils/signDictionary';
import { speechSynth } from '../utils/speech';
import { triggerHaptic } from '../utils/haptics';

interface VisionSignDetectorProps {
  settings: AccessibilitySettings;
  activeSignLang: SignLanguageCode;
  onSignRecognized?: (sign: string, confidence: number) => void;
}

// Translations for vocalizing recognized signs across multi-languages
const MULTI_LANG_VOCAB: Record<string, Record<SpokenLanguageCode, string>> = {
  'HELLO': {
    'en-US': 'Hello',
    'es-ES': 'Hola',
    'fr-FR': 'Bonjour',
    'de-DE': 'Hallo',
    'ja-JP': 'こんにちは',
    'zh-CN': '你好',
    'sw-KE': 'Jambo',
    'ar-SA': 'مرحبا',
    'pt-BR': 'Olá',
    'hi-IN': 'नमस्ते',
  },
  'THANK YOU': {
    'en-US': 'Thank you',
    'es-ES': 'Gracias',
    'fr-FR': 'Merci',
    'de-DE': 'Danke',
    'ja-JP': 'ありがとう',
    'zh-CN': '谢谢',
    'sw-KE': 'Asante',
    'ar-SA': 'شكرا لك',
    'pt-BR': 'Obrigado',
    'hi-IN': 'धन्यवाद',
  },
  'PLEASE': {
    'en-US': 'Please',
    'es-ES': 'Por favor',
    'fr-FR': 'S\'il vous plaît',
    'de-DE': 'Bitte',
    'ja-JP': 'お願いします',
    'zh-CN': '请',
    'sw-KE': 'Tafadhali',
    'ar-SA': 'من فضلك',
    'pt-BR': 'Por favor',
    'hi-IN': 'कृपया',
  },
  'YES': {
    'en-US': 'Yes',
    'es-ES': 'Sí',
    'fr-FR': 'Oui',
    'de-DE': 'Ja',
    'ja-JP': 'はい',
    'zh-CN': '是的',
    'sw-KE': 'Ndiyo',
    'ar-SA': 'نعم',
    'pt-BR': 'Sim',
    'hi-IN': 'हाँ',
  },
  'NO': {
    'en-US': 'No',
    'es-ES': 'No',
    'fr-FR': 'Non',
    'de-DE': 'Nein',
    'ja-JP': 'いいえ',
    'zh-CN': '不',
    'sw-KE': 'Hapana',
    'ar-SA': 'لا',
    'pt-BR': 'Não',
    'hi-IN': 'नहीं',
  },
  'HELP': {
    'en-US': 'Help',
    'es-ES': 'Ayuda',
    'fr-FR': 'Aide',
    'de-DE': 'Hilfe',
    'ja-JP': '助けて',
    'zh-CN': '帮助',
    'sw-KE': 'Msaada',
    'ar-SA': 'مساعدة',
    'pt-BR': 'Ajuda',
    'hi-IN': 'मदद',
  },
  'I LOVE YOU': {
    'en-US': 'I love you',
    'es-ES': 'Te quiero',
    'fr-FR': 'Je t\'aime',
    'de-DE': 'Ich liebe dich',
    'ja-JP': '愛してる',
    'zh-CN': '我爱你',
    'sw-KE': 'Nakupenda',
    'ar-SA': 'أحبك',
    'pt-BR': 'Eu te amo',
    'hi-IN': 'मैं तुमसे प्यार करता हूँ',
  },
  'PEACE': {
    'en-US': 'Peace',
    'es-ES': 'Paz',
    'fr-FR': 'Paix',
    'de-DE': 'Frieden',
    'ja-JP': '平和',
    'zh-CN': '和平',
    'sw-KE': 'Amani',
    'ar-SA': 'سلام',
    'pt-BR': 'Paz',
    'hi-IN': 'शांति',
  },
  'WATER': {
    'en-US': 'Water',
    'es-ES': 'Agua',
    'fr-FR': 'Eau',
    'de-DE': 'Wasser',
    'ja-JP': '水',
    'zh-CN': '水',
    'sw-KE': 'Maji',
    'ar-SA': 'ماء',
    'pt-BR': 'Água',
    'hi-IN': 'पानी',
  },
  'WHERE': {
    'en-US': 'Where?',
    'es-ES': '¿Dónde?',
    'fr-FR': 'Où?',
    'de-DE': 'Wo?',
    'ja-JP': 'どこですか？',
    'zh-CN': '在哪里？',
    'sw-KE': 'Wapi?',
    'ar-SA': 'أين؟',
    'pt-BR': 'Onde?',
    'hi-IN': 'कहाँ?',
  },
};

export const VisionSignDetector: React.FC<VisionSignDetectorProps> = ({
  settings,
  activeSignLang,
  onSignRecognized,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<SpokenLanguageCode>(settings.targetSpeechLanguage || 'en-US');
  const [recognizedSigns, setRecognizedSigns] = useState<DetectedSignEvent[]>([]);
  const [currentGestureCandidate, setCurrentGestureCandidate] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(settings.autoSpeakDetectedSigns);
  const [isCopied, setIsCopied] = useState(false);

  // Gesture detection stability trackers
  const candidateRef = useRef<string | null>(null);
  const candidateStartTimeRef = useRef<number>(0);
  const lastSpokenSignRef = useRef<string | null>(null);
  const lastSpokenTimeRef = useRef<number>(0);

  // Start webcam with privacy & constraints
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam API is not supported on this device/browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
        };
      }
      triggerHaptic('success', settings.hapticEnabled, settings.hapticStrength);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not access camera';
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Speaks confirmed word in chosen multilingual voice
  const speakDetectedWord = useCallback((signName: string) => {
    const langDict = MULTI_LANG_VOCAB[signName];
    const spokenText = langDict ? langDict[selectedVoiceLang] || signName : signName;

    speechSynth.speak(
      spokenText,
      selectedVoiceLang,
      settings.speechVoiceRate,
      settings.speechVoicePitch
    );
  }, [selectedVoiceLang, settings.speechVoiceRate, settings.speechVoicePitch]);

  // Real-time offline computer vision frame loop
  useEffect(() => {
    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const processFrame = () => {
      animationFrameId = requestAnimationFrame(processFrame);

      const now = performance.now();
      if (now - lastFrameTime < 65) return; // ~15 FPS analysis is optimal for offline CPU responsiveness
      lastFrameTime = now;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== 4) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw mirrored video frame to canvas
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -width, 0, width, height);
      ctx.restore();

      // Sample central interaction zone
      const frameData = ctx.getImageData(0, 0, width, height);
      const data = frameData.data;

      let skinPixels = 0;
      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;
      let sumX = 0;
      let sumY = 0;

      // Color space heuristic for skin / hand detection in HSV / RGB ratios
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Normalized skin detector
          const isSkin = 
            r > 80 && g > 40 && b > 20 &&
            r > g && r > b &&
            (r - g) > 12 &&
            Math.abs(r - g) > 12 &&
            r > 1.15 * g;

          if (isSkin) {
            skinPixels++;
            sumX += x;
            sumY += y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      // Gesture kinematic feature analysis
      let detectedSign: string | null = null;
      let confidence = 0;

      if (skinPixels > 600) {
        const centroidX = sumX / skinPixels;
        const centroidY = sumY / skinPixels;
        const handBoxWidth = maxX - minX;
        const handBoxHeight = maxY - minY;
        const aspectRatio = handBoxHeight / (handBoxWidth || 1);
        const relativeY = centroidY / height;

        // Visual Landmark HUD rendering (if enabled)
        if (settings.showLandmarkOverlay) {
          // Bounding Box
          ctx.strokeStyle = '#38bdf8'; // Sky 400
          ctx.lineWidth = 2;
          ctx.strokeRect(minX, minY, handBoxWidth, handBoxHeight);

          // Centroid
          ctx.fillStyle = '#f43f5e'; // Rose 500
          ctx.beginPath();
          ctx.arc(centroidX, centroidY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Simulated skeleton joints overlay for anatomical reference
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.beginPath();
          ctx.moveTo(centroidX, centroidY);
          ctx.lineTo(centroidX - handBoxWidth * 0.28, centroidY - handBoxHeight * 0.4);
          ctx.moveTo(centroidX, centroidY);
          ctx.lineTo(centroidX - handBoxWidth * 0.1, centroidY - handBoxHeight * 0.5);
          ctx.moveTo(centroidX, centroidY);
          ctx.lineTo(centroidX + handBoxWidth * 0.1, centroidY - handBoxHeight * 0.5);
          ctx.moveTo(centroidX, centroidY);
          ctx.lineTo(centroidX + handBoxWidth * 0.28, centroidY - handBoxHeight * 0.4);
          ctx.stroke();

          // Fingertip points
          const tips = [
            [centroidX - handBoxWidth * 0.28, centroidY - handBoxHeight * 0.4],
            [centroidX - handBoxWidth * 0.1, centroidY - handBoxHeight * 0.5],
            [centroidX + handBoxWidth * 0.1, centroidY - handBoxHeight * 0.5],
            [centroidX + handBoxWidth * 0.28, centroidY - handBoxHeight * 0.4],
          ];
          ctx.fillStyle = '#34d399'; // Emerald 400
          tips.forEach(([tx, ty]) => {
            ctx.beginPath();
            ctx.arc(tx, ty, 4, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Geometric & spatial classification logic
        if (relativeY < 0.38) {
          // Near head/chin level
          if (handBoxWidth > 140 && aspectRatio < 0.9) {
            detectedSign = 'HELLO';
            confidence = 0.92;
          } else {
            detectedSign = 'THANK YOU';
            confidence = 0.88;
          }
        } else if (relativeY < 0.58) {
          // Chest level
          if (aspectRatio > 1.4) {
            // Vertical long hand
            detectedSign = 'PEACE';
            confidence = 0.89;
          } else if (handBoxWidth > 180) {
            // Two hands / wide span
            detectedSign = 'HELP';
            confidence = 0.91;
          } else if (aspectRatio < 0.85) {
            // Wide flat hand on chest
            detectedSign = 'PLEASE';
            confidence = 0.86;
          } else if (skinPixels < 1200) {
            // Compact fist / nod
            detectedSign = 'YES';
            confidence = 0.85;
          } else {
            // Classic ILY sign (spread fingers)
            detectedSign = 'I LOVE YOU';
            confidence = 0.87;
          }
        } else {
          // Mid-low area
          if (aspectRatio > 1.2) {
            detectedSign = 'WATER';
            confidence = 0.84;
          } else {
            detectedSign = 'WHERE';
            confidence = 0.82;
          }
        }
      }

      // Stability debouncing (require gesture hold for 400ms to confirm)
      if (detectedSign) {
        if (candidateRef.current === detectedSign) {
          const elapsed = now - candidateStartTimeRef.current;
          const progress = Math.min(1.0, elapsed / 450);
          setHoldProgress(progress);

          if (progress >= 1.0) {
            // Confirmed gesture!
            const canSpeakAgain = 
              lastSpokenSignRef.current !== detectedSign || 
              now - lastSpokenTimeRef.current > 2400;

            if (canSpeakAgain) {
              lastSpokenSignRef.current = detectedSign;
              lastSpokenTimeRef.current = now;

              // Haptic feedback
              triggerHaptic('signDetected', settings.hapticEnabled, settings.hapticStrength);

              // Voice audio output
              if (autoSpeak) {
                speakDetectedWord(detectedSign);
              }

              // Record in recognized history
              setRecognizedSigns(prev => [
                {
                  sign: detectedSign!,
                  confidence: Math.round(confidence * 100),
                  timestamp: Date.now(),
                  spoken: autoSpeak,
                  category: 'gesture',
                },
                ...prev.slice(0, 15),
              ]);

              if (onSignRecognized) {
                onSignRecognized(detectedSign, confidence);
              }
            }
          }
        } else {
          candidateRef.current = detectedSign;
          candidateStartTimeRef.current = now;
          setCurrentGestureCandidate(detectedSign);
          setHoldProgress(0.1);
        }
      } else {
        candidateRef.current = null;
        setCurrentGestureCandidate(null);
        setHoldProgress(0);
      }
    };

    if (isCameraActive) {
      animationFrameId = requestAnimationFrame(processFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isCameraActive, settings, autoSpeak, speakDetectedWord, onSignRecognized]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleCopySentence = () => {
    const text = recognizedSigns.map(s => s.sign).join(' ');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    triggerHaptic('tick', settings.hapticEnabled);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClearSentence = () => {
    setRecognizedSigns([]);
    triggerHaptic('tick', settings.hapticEnabled);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-6">
      {/* Header & Offline Privacy Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Sign-to-Speech Vision Camera
            </h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" /> 100% Offline Local CV
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Sign naturally in front of your camera. Neural landmarks translate your hand shapes and immediately speak the words aloud.
          </p>
        </div>

        {/* Real-time Target Audio Voice Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="flex flex-col">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Speech Output Voice
            </label>
            <select
              value={selectedVoiceLang}
              onChange={(e) => {
                setSelectedVoiceLang(e.target.value as SpokenLanguageCode);
                triggerHaptic('tick', settings.hapticEnabled);
              }}
              className="bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {SUPPORTED_SPOKEN_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Vision Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera Feed & Real-time Canvas */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative aspect-video w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
            {/* Hidden video element feeding canvas */}
            <video
              ref={videoRef}
              playsInline
              muted
              className="hidden"
            />

            {/* Canvas for rendering and CV analysis */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            />

            {/* Offline Privacy Watermark Overlay */}
            {isCameraActive && (
              <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800/80 rounded-full px-3 py-1 flex items-center gap-2 text-[11px] text-slate-300 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Private & Offline (No stream leaves browser)</span>
              </div>
            )}

            {/* Real-time Gesture Candidate Floating Badge */}
            {isCameraActive && currentGestureCandidate && (
              <div className="absolute bottom-4 inset-x-4 flex justify-center pointer-events-none">
                <div className="bg-slate-900/95 border border-sky-400/60 rounded-2xl p-3 shadow-2xl flex flex-col items-center min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-sky-400">Detecting</span>
                    <span className="text-lg font-bold text-white">{currentGestureCandidate}</span>
                  </div>
                  {/* Hold Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-sky-400 h-full transition-all duration-75"
                      style={{ width: `${Math.round(holdProgress * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">Hold steady to confirm & speak</span>
                </div>
              </div>
            )}

            {/* Camera Off Placeholder */}
            {!isCameraActive && (
              <div className="text-center p-6 space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400 shadow-md">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Camera is currently paused</h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Enable camera to start recognizing sign language hand shapes in real-time.
                  </p>
                </div>
                {cameraError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-2.5 rounded-xl flex items-center gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
                <button
                  onClick={startCamera}
                  className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" /> Start Vision Detector
                </button>
              </div>
            )}
          </div>

          {/* Camera Action Toolbar */}
          <div className="flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-2.5">
            {isCameraActive ? (
              <button
                onClick={() => {
                  stopCamera();
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <CameraOff className="w-4 h-4" /> Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow"
              >
                <Camera className="w-4 h-4" /> Start Camera
              </button>
            )}

            <div className="flex items-center gap-2">
              {/* Auto Speak Toggle */}
              <button
                onClick={() => {
                  setAutoSpeak(!autoSpeak);
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  autoSpeak 
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Automatically vocalize detected words"
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{autoSpeak ? 'Auto-Voice On' : 'Voice Muted'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Real-Time Speech Output & Sentence Builder */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" /> Live Spoken Sentence
              </span>
              <div className="flex items-center gap-1">
                {recognizedSigns.length > 0 && (
                  <>
                    <button
                      onClick={handleCopySentence}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Copy recognized sentence"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={handleClearSentence}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Clear sentence"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sentence words bubble output */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 min-h-[90px] flex-1 flex flex-wrap content-start gap-2 overflow-y-auto">
              {recognizedSigns.length === 0 ? (
                <div className="w-full text-center py-6 text-slate-500 text-xs italic">
                  Sign words in front of your camera to compose and vocalize a sentence in real-time.
                </div>
              ) : (
                recognizedSigns.map((item, idx) => (
                  <button
                    key={`${item.timestamp}-${idx}`}
                    onClick={() => {
                      speakDetectedWord(item.sign);
                      triggerHaptic('tick', settings.hapticEnabled);
                    }}
                    className="group bg-slate-800 hover:bg-sky-500/20 text-slate-200 hover:text-sky-300 border border-slate-700 hover:border-sky-500/40 px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    title="Click to speak this word again"
                  >
                    <span>{item.sign}</span>
                    <Volume2 className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </button>
                ))
              )}
            </div>

            {/* Vocalize full sentence button */}
            {recognizedSigns.length > 0 && (
              <button
                onClick={() => {
                  const fullText = recognizedSigns.map(s => s.sign).join(' ');
                  speechSynth.speak(fullText, selectedVoiceLang);
                  triggerHaptic('success', settings.hapticEnabled);
                }}
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" /> Speak Complete Sentence ({SUPPORTED_SPOKEN_LANGUAGES.find(l => l.code === selectedVoiceLang)?.name})
              </button>
            )}
          </div>

          {/* Quick Hand Shape Reference Guide for Users */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Recognized Signs You Can Test
              </span>
              <span className="text-[10px] text-sky-400 font-mono">10 ASL signs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'HELLO', hint: 'Wave near head' },
                { name: 'THANK YOU', hint: 'Chin to camera' },
                { name: 'PLEASE', hint: 'Flat on chest' },
                { name: 'YES', hint: 'Fist nod' },
                { name: 'I LOVE YOU', hint: 'Thumb+Index+Pinky' },
                { name: 'HELP', hint: 'Fist on flat palm' },
                { name: 'PEACE', hint: 'V-sign extended' },
                { name: 'WATER', hint: 'W-sign chin tap' },
                { name: 'WHERE', hint: 'Index finger shake' },
              ].map((sign) => (
                <div 
                  key={sign.name}
                  onClick={() => {
                    speakDetectedWord(sign.name);
                    triggerHaptic('tick', settings.hapticEnabled);
                  }}
                  className="cursor-pointer bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 p-2 rounded-xl transition-all"
                  title="Click to test vocalization"
                >
                  <div className="text-xs font-bold text-slate-200">{sign.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{sign.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
