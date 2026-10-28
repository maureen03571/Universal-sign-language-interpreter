import { AccessibilitySettings, TranslationHistoryItem, SyncStatus } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'gestura_history_v1',
  PENDING_SYNC: 'gestura_pending_sync_v1',
  SETTINGS: 'gestura_settings_v1',
  LAST_SYNC: 'gestura_last_sync_timestamp',
  CUSTOM_VOCAB: 'gestura_custom_vocab_v1',
};

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: 'off',
  fontSize: 'normal',
  dyslexicFont: false,
  hapticEnabled: true,
  hapticStrength: 'medium',
  avatarSpeed: 1.0,
  avatarMirror: false,
  showLandmarkOverlay: true,
  autoSpeakDetectedSigns: true,
  targetSpeechLanguage: 'en-US',
  speechVoiceRate: 1.0,
  speechVoicePitch: 1.0,
  offlineProcessingPreferred: true,
};

export function getSettings(): AccessibilitySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings from storage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AccessibilitySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings', e);
  }
}

export function getHistory(): TranslationHistoryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load history', e);
  }
  return [
    {
      id: 'demo-1',
      timestamp: Date.now() - 1000 * 60 * 15,
      inputText: 'Welcome to Gestura sign language interpreter',
      sourceLang: 'en-US',
      targetSignLang: 'ASL',
      glosses: ['WELCOME', 'SIGN', 'LANGUAGE', 'INTERPRETER'],
      syncedToCloud: true,
      category: 'greeting',
    },
    {
      id: 'demo-2',
      timestamp: Date.now() - 1000 * 60 * 45,
      inputText: 'Nice to meet you friend',
      sourceLang: 'en-US',
      targetSignLang: 'ASL',
      glosses: ['NICE', 'MEET', 'YOU', 'FRIEND'],
      syncedToCloud: true,
      category: 'greeting',
    },
    {
      id: 'demo-3',
      timestamp: Date.now() - 1000 * 60 * 120,
      inputText: 'Can you please help me with directions',
      sourceLang: 'en-US',
      targetSignLang: 'ASL',
      glosses: ['PLEASE', 'HELP', 'ME', 'WHERE'],
      syncedToCloud: true,
      category: 'emergency',
    }
  ];
}

export function saveHistoryItem(item: TranslationHistoryItem): void {
  try {
    const history = getHistory();
    const updated = [item, ...history.filter(h => h.id !== item.id)].slice(0, 50); // Keep latest 50
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));

    // If item not yet synced, add to pending sync queue
    if (!item.syncedToCloud) {
      addToPendingSync(item.id);
    }
  } catch (e) {
    console.warn('Failed to save history item', e);
  }
}

export function getPendingSyncIds(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Failed to load sync queue', e);
  }
  return [];
}

export function addToPendingSync(id: string): void {
  try {
    const ids = getPendingSyncIds();
    if (!ids.includes(id)) {
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([...ids, id]));
    }
  } catch (e) {
    console.warn('Failed to add to sync queue', e);
  }
}

export function clearPendingSync(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
  } catch (e) {
    console.warn('Failed to clear sync queue', e);
  }
}

export function getLastSyncTime(): number | null {
  try {
    const t = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return t ? parseInt(t, 10) : null;
  } catch {
    return null;
  }
}

export function setLastSyncTime(timestamp: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
  } catch (e) {
    console.warn('Failed to set last sync', e);
  }
}

/**
 * Execute Cloud Syncing once network connection is available
 */
export async function performCloudSync(): Promise<{ syncedCount: number; success: boolean }> {
  const pendingIds = getPendingSyncIds();
  const history = getHistory();

  // Simulate network request syncing encrypted local offline items to cloud vault
  await new Promise(resolve => setTimeout(resolve, 800));

  const updatedHistory = history.map(item => {
    if (pendingIds.includes(item.id)) {
      return { ...item, syncedToCloud: true };
    }
    return item;
  });

  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
    clearPendingSync();
    setLastSyncTime(Date.now());
  } catch (e) {
    console.warn('Failed to update synced status', e);
  }

  return { syncedCount: pendingIds.length, success: true };
}
