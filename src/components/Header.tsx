import React from 'react';
import { 
  Wifi, WifiOff, Cloud, Sliders, Shield, Volume2, 
  Video, BookOpen, Mic, Sparkles, RefreshCw, Eye 
} from 'lucide-react';
import { SyncStatus, AccessibilitySettings } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  activeTab: 'text-to-sign' | 'vision-detector' | 'media-translator' | 'vocabulary';
  onTabChange: (tab: 'text-to-sign' | 'vision-detector' | 'media-translator' | 'vocabulary') => void;
  syncStatus: SyncStatus;
  onOpenAccessibility: () => void;
  settings: AccessibilitySettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  syncStatus,
  onOpenAccessibility,
  settings,
}) => {
  return (
    <header className="w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">
                  GESTURA
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-full">
                  Universal Sign AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Bi-Directional Sign Language & Accessibility Platform
              </p>
            </div>
          </div>

          {/* Mobile Access Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => {
                onOpenAccessibility();
                triggerHaptic('tick', settings.hapticEnabled);
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              aria-label="Open Accessibility Options"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Primary Functional Tabs */}
        <nav 
          className="flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none"
          role="tablist"
        >
          {[
            { id: 'text-to-sign', label: 'Voice & Text', icon: Mic },
            { id: 'vision-detector', label: 'Vision Sign-to-Speech', icon: Eye },
            { id: 'media-translator', label: 'Video & Audio URL', icon: Video },
            { id: 'vocabulary', label: 'Sign Dictionary', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  onTabChange(tab.id as typeof activeTab);
                  triggerHaptic('tick', settings.hapticEnabled);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicators & Accessibility Shortcut */}
        <div className="hidden md:flex items-center gap-3">
          {/* Network Connection Badge */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border ${
              syncStatus.isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title={syncStatus.isOnline ? 'Online - Cloud Syncing Active' : 'Offline Mode - Storing Locally'}
          >
            {syncStatus.isOnline ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : (
              <WifiOff className="w-3.5 h-3.5" />
            )}
            <span>{syncStatus.isOnline ? 'Cloud Synced' : 'Offline'}</span>
            {syncStatus.pendingItemsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {syncStatus.pendingItemsCount}
              </span>
            )}
          </div>

          {/* Accessibility Center Trigger */}
          <button
            onClick={() => {
              onOpenAccessibility();
              triggerHaptic('tick', settings.hapticEnabled);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition-all shadow-sm"
            aria-label="Open Accessibility & Haptic Controls"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Accessibility & Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};
