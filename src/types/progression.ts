import type { SpellTier } from './spell';

export interface SpellCastRecord {
  id: string;
  spellId: string;
  spellName: string;
  accuracy: number;
  tier: SpellTier;
  timestamp: number;
  comboMultiplier: number;
}

export type ChallengeConditionType =
  | 'perfect-casts'
  | 'discover-combination'
  | 'fast-draw'
  | 'all-elements'
  | 'cast-streak'
  | 'accuracy-above'
  | 'no-guide-cast';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  conditionType: ChallengeConditionType;
  target: number;
  xpReward: number;
}

export interface ChallengeProgress {
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: number;
}

export interface PlayerProgress {
  version: number;
  xp: number;
  level: number;
  discoveredSpellIds: string[];
  favoriteSpellIds: string[];
  discoveredCombinationIds: string[];
  bestAccuracyBySpell: Record<string, number>;
  timesCastBySpell: Record<string, number>;
  castHistory: SpellCastRecord[];
  challengeProgress: Record<string, ChallengeProgress>;
  customSpellIds: string[];
  currentStreak: number;
  bestStreak: number;
  lastCastAt: number | null;
}
