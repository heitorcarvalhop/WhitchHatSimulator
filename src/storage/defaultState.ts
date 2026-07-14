import type { PlayerProgress, UserSettings } from '@/types';
import { CURRENT_PROGRESS_VERSION, CURRENT_SETTINGS_VERSION } from './schema';

export function createDefaultSettings(): UserSettings {
  return {
    version: CURRENT_SETTINGS_VERSION,
    graphicsQuality: 'high',
    maxParticles: 600,
    flashIntensity: 0.8,
    screenShake: true,
    masterVolume: 0.8,
    effectsVolume: 0.9,
    ambientVolume: 0.5,
    muted: false,
    drawingSensitivity: 0.5,
    recognitionTolerance: 0.42,
    strokeWidth: 4,
    animationSpeed: 1,
    highContrast: false,
    reducedMotion: false,
    reducedFlash: false,
    vibration: true,
    showFps: false,
    language: 'pt-BR',
    trainingHelpLevel: 'full-guide',
    leftPanelCollapsed: false,
    rightPanelCollapsed: false,
  };
}

export function createDefaultProgress(): PlayerProgress {
  return {
    version: CURRENT_PROGRESS_VERSION,
    xp: 0,
    level: 1,
    discoveredSpellIds: [],
    favoriteSpellIds: [],
    discoveredCombinationIds: [],
    bestAccuracyBySpell: {},
    timesCastBySpell: {},
    castHistory: [],
    challengeProgress: {},
    customSpellIds: [],
    currentStreak: 0,
    bestStreak: 0,
    lastCastAt: null,
  };
}
