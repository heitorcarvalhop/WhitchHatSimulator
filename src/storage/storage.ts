import { APP_CONFIG } from '@/config/appConfig';
import type { CustomSpell, PlayerProgress, UserSettings } from '@/types';
import { createDefaultProgress, createDefaultSettings } from './defaultState';
import {
  CURRENT_CUSTOM_SPELLS_VERSION,
  CURRENT_PROGRESS_VERSION,
  CURRENT_SETTINGS_VERSION,
  type VersionedPayload,
} from './schema';
import {
  CUSTOM_SPELLS_MIGRATIONS,
  PROGRESS_MIGRATIONS,
  SETTINGS_MIGRATIONS,
  runMigrations,
  type MigrationStep,
} from './migrations';

const KEYS = {
  settings: `${APP_CONFIG.storagePrefix}:settings`,
  progress: `${APP_CONFIG.storagePrefix}:progress`,
  customSpells: `${APP_CONFIG.storagePrefix}:custom-spells`,
};

let storageAvailable: boolean | null = null;

function isStorageAvailable(): boolean {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const testKey = '__arcane_forge_probe__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  return storageAvailable;
}

function readVersioned<T>(
  key: string,
  migrations: Record<number, MigrationStep>,
  targetVersion: number,
  fallback: () => T,
): T {
  if (!isStorageAvailable()) return fallback();
  const raw = localStorage.getItem(key);
  if (!raw) return fallback();
  try {
    const parsed = JSON.parse(raw) as VersionedPayload<unknown>;
    const sourceVersion = typeof parsed.version === 'number' ? parsed.version : targetVersion;
    const migrated = runMigrations(parsed.payload, sourceVersion, targetVersion, migrations);
    return migrated as T;
  } catch {
    return fallback();
  }
}

function writeVersioned<T>(key: string, version: number, payload: T): void {
  if (!isStorageAvailable()) return;
  const wrapper: VersionedPayload<T> = { version, payload };
  try {
    localStorage.setItem(key, JSON.stringify(wrapper));
  } catch {
    // Storage full or blocked — silently no-op, the session simply won't persist.
  }
}

export function loadSettings(): UserSettings {
  return readVersioned(
    KEYS.settings,
    SETTINGS_MIGRATIONS,
    CURRENT_SETTINGS_VERSION,
    createDefaultSettings,
  );
}

export function saveSettings(settings: UserSettings): void {
  writeVersioned(KEYS.settings, CURRENT_SETTINGS_VERSION, settings);
}

export function loadProgress(): PlayerProgress {
  return readVersioned(
    KEYS.progress,
    PROGRESS_MIGRATIONS,
    CURRENT_PROGRESS_VERSION,
    createDefaultProgress,
  );
}

export function saveProgress(progress: PlayerProgress): void {
  writeVersioned(KEYS.progress, CURRENT_PROGRESS_VERSION, progress);
}

export function loadCustomSpells(): CustomSpell[] {
  return readVersioned(
    KEYS.customSpells,
    CUSTOM_SPELLS_MIGRATIONS,
    CURRENT_CUSTOM_SPELLS_VERSION,
    () => [],
  );
}

export function saveCustomSpells(spells: CustomSpell[]): void {
  writeVersioned(KEYS.customSpells, CURRENT_CUSTOM_SPELLS_VERSION, spells);
}

export interface ExportBundle {
  appVersion: string;
  exportedAt: number;
  settings: UserSettings;
  progress: PlayerProgress;
  customSpells: CustomSpell[];
}

export function exportAllData(): string {
  const bundle: ExportBundle = {
    appVersion: APP_CONFIG.version,
    exportedAt: Date.now(),
    settings: loadSettings(),
    progress: loadProgress(),
    customSpells: loadCustomSpells(),
  };
  return JSON.stringify(bundle, null, 2);
}

export interface ImportResult {
  success: boolean;
  error?: string;
}

export function importAllData(json: string): ImportResult {
  let parsed: Partial<ExportBundle>;
  try {
    parsed = JSON.parse(json) as Partial<ExportBundle>;
  } catch {
    return { success: false, error: 'Não foi possível interpretar o arquivo JSON.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { success: false, error: 'Arquivo inválido.' };
  }
  if (!parsed.settings || !parsed.progress) {
    return {
      success: false,
      error: 'Estrutura de dados incompleta — faltam configurações ou progresso.',
    };
  }

  saveSettings({
    ...createDefaultSettings(),
    ...parsed.settings,
    version: CURRENT_SETTINGS_VERSION,
  });
  saveProgress({
    ...createDefaultProgress(),
    ...parsed.progress,
    version: CURRENT_PROGRESS_VERSION,
  });
  saveCustomSpells(Array.isArray(parsed.customSpells) ? parsed.customSpells : []);
  return { success: true };
}

export function resetAllData(): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(KEYS.settings);
  localStorage.removeItem(KEYS.progress);
  localStorage.removeItem(KEYS.customSpells);
}
