import type { PlayerProgress } from '@/types';

const BASE_XP = 100;
const CURVE_EXPONENT = 1.35;

/** Cumulative XP required to reach `level` (level 1 = 0 XP). */
export function xpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(BASE_XP * Math.pow(level - 1, CURVE_EXPONENT));
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpThresholdForLevel(level + 1) <= totalXp) {
    level += 1;
  }
  return level;
}

export function xpProgressWithinLevel(totalXp: number): {
  current: number;
  needed: number;
  ratio: number;
} {
  const level = levelFromXp(totalXp);
  const floor = xpThresholdForLevel(level);
  const ceiling = xpThresholdForLevel(level + 1);
  const span = Math.max(1, ceiling - floor);
  const current = totalXp - floor;
  return { current, needed: span, ratio: Math.min(1, current / span) };
}

export interface XpGainResult {
  progress: PlayerProgress;
  leveledUp: boolean;
  newLevel: number;
  xpGained: number;
}

export function addXp(progress: PlayerProgress, amount: number): XpGainResult {
  const xpGained = Math.max(0, Math.round(amount));
  const newXp = progress.xp + xpGained;
  const previousLevel = levelFromXp(progress.xp);
  const newLevel = levelFromXp(newXp);

  return {
    progress: { ...progress, xp: newXp, level: newLevel },
    leveledUp: newLevel > previousLevel,
    newLevel,
    xpGained,
  };
}

export function xpForCast(tierMultiplier: number, isFirstDiscovery: boolean): number {
  const base = 12 * tierMultiplier;
  return Math.round(isFirstDiscovery ? base + 40 : base);
}

export function xpForCombination(isFirstDiscovery: boolean): number {
  return isFirstDiscovery ? 80 : 25;
}
