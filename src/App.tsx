import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TextToSignSection } from './components/TextToSignSection';
import { VisionSignDetector } from './components/VisionSignDetector';
import { MediaTranslator } from './components/MediaTranslator';
import { SignVocabularySection } from './components/SignVocabularySection';
import { AccessibilityModal } from './components/AccessibilityModal';
import { 
  SignLanguageCode, AccessibilitySettings, SyncStatus, TranslationHistoryItem 
} from './types';
import { 
  getSettings, saveSettings, getPendingSyncIds, getLastSyncTime, 
  performCloudSync 
} from './utils/storage';
import { triggerHaptic } from './utils/haptics';
import { 
  ShieldCheck, Wifi, WifiOff, Sparkles, Heart, 
  HelpCircle, Keyboard, RefreshCw, Volume2 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'text-to-sign' | 'vision-detector' | 'media-translator' | 'vocabulary'>('text-to-sign');
  const [activeSignLang, setActiveSignLang] = useState<SignLanguageCode>('ASL');
  const [settings, setSettings] = useState<AccessibilitySettings>(getSettings);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<TranslationHistoryItem[]>([]);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastSyncedTimestamp: getLastSyncTime(),
    pendingItemsCount: getPendingSyncIds().length,
    isSyncing: false,
  });

  // Save settings when changed
  const handleUpdateSettings = (newSettings: AccessibilitySettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const refreshSyncQueue = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      pendingItemsCount: getPendingSyncIds().length,
      lastSyncedTimestamp: getLastSyncTime(),
    }));
  }, []);

  // Listen to network changes for automatic cloud synchronization
  useEffect(() => {
    const handleOnline = async () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      triggerHaptic('success', settings.hapticEnabled, settings.hapticStrength);

      // Network detected! Automatically trigger cloud sync
      try {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
        await performCloudSync();
        refreshSyncQueue();
      } catch (err) {
        console.warn('Auto sync error:', err);
      } finally {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      triggerHaptic('warning', settings.hapticEnabled, settings.hapticStrength);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [settings.hapticEnabled, settings.hapticStrength, refreshSyncQueue]);

  // Global accessibility keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1') {
        setActiveTab('text-to-sign');
        triggerHaptic('tick', settings.hapticEnabled);
      } else if (e.key === '2') {
        setActiveTab('vision-detector');
        triggerHaptic('tick', settings.hapticEnabled);
      } else if (e.key === '3') {
        setActiveTab('media-translator');
        triggerHaptic('tick', settings.hapticEnabled);
      } else if (e.key === '4') {
        setActiveTab('vocabulary');
        triggerHaptic('tick', settings.hapticEnabled);
      } else if (e.key.toLowerCase() === 'a' || e.key === '?') {
        setIsAccessModalOpen(prev => !prev);
        triggerHaptic('tick', settings.hapticEnabled);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.hapticEnabled]);

  // Handle contrast & font styles
  const getThemeClasses = () => {
    let classes = 'min-h-screen text-slate-100 flex flex-col font-sans ';

    if (settings.highContrast === 'high-contrast-yellow') {
      classes += 'bg-black text-yellow-300 ';
    } else if (settings.highContrast === 'high-contrast-dark') {
      classes += 'bg-black text-white ';
    } else {
      classes += 'bg-slate-950 text-slate-100 ';
    }

    if (settings.fontSize === 'large') {
      classes += 'text-lg ';
    } else if (settings.fontSize === 'extra-large') {
      classes += 'text-xl ';
    }

    if (settings.dyslexicFont) {
      classes += 'tracking-wider leading-relaxed ';
    }

    return classes;
  };

  return (
    <div className={getThemeClasses()}>
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        syncStatus={syncStatus}
        onOpenAccessibility={() => setIsAccessModalOpen(true)}
        settings={settings}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
        {/* Network & Offline Status Banner (Shown if offline) */}
        {!syncStatus.isOnline && (
          <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-amber-200">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-sm">Offline Processing Active</span>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Sign interpretation, 3D avatar rendering, and computer vision run 100% locally on your device. Translations will sync automatically when network is reconnected.
                </p>
              </div>
            </div>
            <span className="bg-amber-400/20 text-amber-300 font-mono text-xs px-2.5 py-1 rounded-lg shrink-0">
              {syncStatus.pendingItemsCount} Queued
            </span>
          </div>
        )}

        {/* Tab 1: Voice & Text to Sign */}
        {activeTab === 'text-to-sign' && (
          <TextToSignSection
            activeSignLang={activeSignLang}
            onSignLangChange={setActiveSignLang}
            settings={settings}
            onSaveHistory={(item) => {
              setHistoryItems(prev => [item, ...prev]);
              refreshSyncQueue();
            }}
          />
        )}

        {/* Tab 2: Computer Vision Sign-to-Speech */}
        {activeTab === 'vision-detector' && (
          <VisionSignDetector
            settings={settings}
            activeSignLang={activeSignLang}
          />
        )}

        {/* Tab 3: Media & Video URL Sign Translator */}
        {activeTab === 'media-translator' && (
          <MediaTranslator
            activeSignLang={activeSignLang}
            settings={settings}
          />
        )}

        {/* Tab 4: Interactive Sign Dictionary & Practice */}
        {activeTab === 'vocabulary' && (
          <SignVocabularySection
            activeSignLang={activeSignLang}
            settings={settings}
          />
        )}

        {/* Quick Accessibility Badges & Capabilities Footer Bar */}
        <div className="border-t border-slate-900 pt-6 mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Client-Side Offline Engine
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Multi-Language Speech Synthesis
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              {settings.hapticEnabled ? 'Tactile Haptics Active' : 'Haptics Muted'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Shortcuts: [1] Text [2] Vision [3] Media [4] Dictionary [A] Settings
            </span>
          </div>
        </div>
      </main>

      {/* Accessibility & Cloud Sync Modal */}
      <AccessibilityModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        syncStatus={syncStatus}
        onSyncComplete={refreshSyncQueue}
      />
    </div>
  );
}
