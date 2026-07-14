import type { CustomSpell, PlayerProgress, UserSettings } from '@/types';
import { saveCustomSpells, saveProgress, saveSettings } from '@/storage/storage';
import { debounce } from '@/utils/throttle';

const SAVE_DEBOUNCE_MS = 400;

export const persistSettings = debounce(
  (settings: UserSettings) => saveSettings(settings),
  SAVE_DEBOUNCE_MS,
);
export const persistProgress = debounce(
  (progress: PlayerProgress) => saveProgress(progress),
  SAVE_DEBOUNCE_MS,
);
export const persistCustomSpells = debounce(
  (spells: CustomSpell[]) => saveCustomSpells(spells),
  SAVE_DEBOUNCE_MS,
);
