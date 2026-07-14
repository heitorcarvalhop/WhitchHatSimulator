import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { CustomSpell, PlayerProgress, Spell, UserSettings } from '@/types';
import type { useCustomSpells } from '@/hooks/useCustomSpells';
import type { AdminCheats } from '@/hooks/useAdminCheats';
import type { CastInput, CastOutcome } from '@/services/spellExecutionService';
import type { RecentCast } from '@/combinations/combinationEngine';
import type { AppToast, ToastKind } from './toasts';

export interface AdminActions {
  setLevel: (level: number) => void;
  maxLevel: () => void;
  addXp: (amount: number) => void;
  discoverAllSpells: () => void;
  unlockAllCombinations: () => void;
  fillEnergy: () => void;
  setStreak: (value: number) => void;
  completeAllChallenges: () => void;
  resetChallenges: () => void;
  resetProgress: () => void;
}

export interface AppStateValue {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
  progress: PlayerProgress;
  setProgress: Dispatch<SetStateAction<PlayerProgress>>;
  toggleFavorite: (spellId: string) => void;
  customSpells: CustomSpell[];
  saveCustomSpell: ReturnType<typeof useCustomSpells>['saveCustomSpell'];
  deleteCustomSpell: (id: string) => void;
  duplicateCustomSpell: (id: string) => void;
  allSpells: Spell[];
  unlockedSpells: Spell[];
  spellsById: Record<string, Spell>;
  energy: number;
  maxEnergy: number;
  lastCast: RecentCast | null;
  lastOutcome: CastOutcome | null;
  resolveCast: (
    gesture: CastInput['gesture'],
    drawDurationMs: number,
    opts?: { isTrainingMode?: boolean; usedGuide?: boolean },
  ) => CastOutcome;
  commitCastOutcome: (outcome: CastOutcome) => void;
  toasts: AppToast[];
  pushToast: (kind: ToastKind, title: string, message: string) => void;
  dismissToast: (id: string) => void;
  cheats: AdminCheats;
  setCheat: <K extends keyof AdminCheats>(key: K, value: AdminCheats[K]) => void;
  adminActions: AdminActions;
}

export const AppStateContext = createContext<AppStateValue | null>(null);
