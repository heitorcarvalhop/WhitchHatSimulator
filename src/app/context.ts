import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { CustomSpell, PlayerProgress, Spell, UserSettings } from '@/types';
import type { useCustomSpells } from '@/hooks/useCustomSpells';
import type { CastInput, CastOutcome } from '@/services/spellExecutionService';
import type { RecentCast } from '@/combinations/combinationEngine';
import type { AppToast, ToastKind } from './toasts';

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
}

export const AppStateContext = createContext<AppStateValue | null>(null);
