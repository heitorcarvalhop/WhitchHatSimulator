import { beforeEach, describe, expect, it } from 'vitest';
import {
  exportAllData,
  importAllData,
  loadCustomSpells,
  loadProgress,
  loadSettings,
  resetAllData,
  saveProgress,
  saveSettings,
} from './storage';
import { createDefaultProgress, createDefaultSettings } from './defaultState';

beforeEach(() => {
  localStorage.clear();
});

describe('settings persistence', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(createDefaultSettings());
  });

  it('round-trips saved settings', () => {
    const settings = { ...createDefaultSettings(), masterVolume: 0.3, highContrast: true };
    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });

  it('falls back to defaults on corrupted JSON', () => {
    localStorage.setItem('arcane-forge:settings', '{not valid json');
    expect(loadSettings()).toEqual(createDefaultSettings());
  });
});

describe('progress persistence', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadProgress()).toEqual(createDefaultProgress());
  });

  it('round-trips saved progress', () => {
    const progress = {
      ...createDefaultProgress(),
      xp: 250,
      level: 3,
      discoveredSpellIds: ['ignis'],
    };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
});

describe('export/import', () => {
  it('exports a JSON bundle that can be re-imported', () => {
    const progress = { ...createDefaultProgress(), xp: 500 };
    saveProgress(progress);

    const json = exportAllData();
    localStorage.clear();

    const result = importAllData(json);
    expect(result.success).toBe(true);
    expect(loadProgress().xp).toBe(500);
  });

  it('rejects malformed JSON', () => {
    const result = importAllData('{not json');
    expect(result.success).toBe(false);
  });

  it('rejects a bundle missing required fields', () => {
    const result = importAllData(JSON.stringify({ foo: 'bar' }));
    expect(result.success).toBe(false);
  });
});

describe('resetAllData', () => {
  it('clears settings, progress and custom spells', () => {
    saveSettings({ ...createDefaultSettings(), masterVolume: 0.1 });
    saveProgress({ ...createDefaultProgress(), xp: 999 });
    resetAllData();
    expect(loadSettings()).toEqual(createDefaultSettings());
    expect(loadProgress()).toEqual(createDefaultProgress());
    expect(loadCustomSpells()).toEqual([]);
  });
});
