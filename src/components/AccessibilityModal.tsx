import React, { useState } from 'react';
import { 
  X, Vibrate, Eye, Shield, Cloud, Wifi, WifiOff, 
  RotateCw, Check, Sparkles, AlertCircle, Type, Sliders 
} from 'lucide-react';
import { AccessibilitySettings, SyncStatus } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { performCloudSync, getPendingSyncIds } from '../utils/storage';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings) => void;
  syncStatus: SyncStatus;
  onSyncComplete: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  syncStatus,
  onSyncComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'haptics' | 'visual' | 'sync' | 'privacy'>('haptics');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    if (!syncStatus.isOnline) {
      setSyncFeedback('Device is currently offline. Items will sync automatically when network reconnects.');
      triggerHaptic('warning', settings.hapticEnabled, settings.hapticStrength);
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);
    triggerHaptic('tick', settings.hapticEnabled);

    try {
      const res = await performCloudSync();
      setIsSyncing(false);
      setSyncFeedback(`Successfully synchronized ${res.syncedCount} items to cloud vault.`);
      triggerHaptic('success', settings.hapticEnabled, settings.hapticStrength);
      onSyncComplete();
    } catch {
      setIsSyncing(false);
      setSyncFeedback('Sync encountered a temporary issue. Will retry automatically.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h3 id="accessibility-title" className="text-lg font-bold text-white">
              Accessibility & Cloud Sync Center
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              triggerHaptic('tick', settings.hapticEnabled);
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-1 overflow-x-auto">
          {[
            { id: 'haptics', label: 'Tactile Haptics', icon: Vibrate },
            { id: 'visual', label: 'Visual & Font', icon: Eye },
            { id: 'sync', label: 'Network & Cloud Sync', icon: Cloud },
            { id: 'privacy', label: 'Offline Privacy', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-400 bg-slate-900/80 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: Tactile Haptic Feedback */}
          {activeTab === 'haptics' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-white">Haptic Vibration Alerts</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Provides sensory vibration feedback when signs are recognized, completed, or spoken.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.hapticEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    onUpdateSettings({ ...settings, hapticEnabled: enabled });
                    if (enabled) triggerHaptic('success', true);
                  }}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {settings.hapticEnabled && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      Vibration Intensity
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['light', 'medium', 'strong'] as const).map((strength) => (
                        <button
                          key={strength}
                          onClick={() => {
                            onUpdateSettings({ ...settings, hapticStrength: strength });
                            triggerHaptic('signDetected', true, strength);
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                            settings.hapticStrength === strength
                              ? 'bg-sky-500 border-sky-400 text-white font-bold shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {strength}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Test Vibration Sensations */}
                  <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-2.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Test Sensory Vibration Patterns
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        onClick={() => triggerHaptic('signDetected', true, settings.hapticStrength)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl text-left border border-slate-700/60 flex items-center justify-between"
                      >
                        <span>Sign Recognized Tap</span>
                        <Vibrate className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                      <button
                        onClick={() => triggerHaptic('signComplete', true, settings.hapticStrength)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl text-left border border-slate-700/60 flex items-center justify-between"
                      >
                        <span>Sign Complete Rhythm</span>
                        <Vibrate className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => triggerHaptic('warning', true, settings.hapticStrength)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs rounded-xl text-left border border-slate-700/60 flex items-center justify-between"
                      >
                        <span>Emergency Warning Pulse</span>
                        <Vibrate className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Visual & Font Accessibility */}
          {activeTab === 'visual' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  High Contrast Theme (WCAG AAA)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'off', label: 'Default Slate' },
                    { id: 'high-contrast-dark', label: 'Pure Black' },
                    { id: 'high-contrast-yellow', label: 'Yellow on Black' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        onUpdateSettings({ ...settings, highContrast: theme.id as typeof settings.highContrast });
                        triggerHaptic('tick', settings.hapticEnabled);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                        settings.highContrast === theme.id
                          ? 'bg-sky-500 border-sky-400 text-white font-bold shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Text Sizing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'extra-large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onUpdateSettings({ ...settings, fontSize: size });
                        triggerHaptic('tick', settings.hapticEnabled);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-medium capitalize border transition-all ${
                        settings.fontSize === size
                          ? 'bg-sky-500 border-sky-400 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {size.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-white">Dyslexia-Friendly Typography</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enhance letter spacing and character clarity for dyslexic readers.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.dyslexicFont}
                  onChange={(e) => {
                    onUpdateSettings({ ...settings, dyslexicFont: e.target.checked });
                    triggerHaptic('tick', settings.hapticEnabled);
                  }}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Network & Cloud Sync */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              {/* Network Status Card */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${syncStatus.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {syncStatus.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {syncStatus.isOnline ? 'Network Connected' : 'Working Completely Offline'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {syncStatus.isOnline 
                        ? 'Cloud syncing active. Changes auto-sync immediately.' 
                        : 'Translations saved locally in IndexedDB. Will sync when reconnected.'}
                    </p>
                  </div>
                </div>

                <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                  syncStatus.isOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {syncStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              {/* Sync Statistics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Pending Sync Queue
                  </span>
                  <div className="text-xl font-bold text-white mt-1">
                    {syncStatus.pendingItemsCount} items
                  </div>
                  <span className="text-[11px] text-slate-400">Stored safely on device</span>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Last Cloud Sync
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {syncStatus.lastSyncedTimestamp 
                      ? new Date(syncStatus.lastSyncedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Just now'}
                  </div>
                  <span className="text-[11px] text-emerald-400">Encrypted cloud vault</span>
                </div>
              </div>

              {syncFeedback && (
                <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs p-3 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              {/* Sync Trigger Button */}
              <button
                disabled={isSyncing}
                onClick={handleManualSync}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing with Cloud...' : 'Trigger Cloud Sync Now'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: Offline Privacy & Security */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">Privacy & Security Guarantee</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    All computer vision landmark processing and speech recognition run directly on your device CPU/GPU. Video streams and camera feeds are NEVER recorded, streamed, or uploaded to any third-party servers.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Works in remote areas without cellular or Wi-Fi connection</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Local client-side gesture recognition algorithms</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Encrypted IndexedDB offline cache with exportable backup</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
