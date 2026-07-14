import { describe, expect, it } from 'vitest';
import { addXp, levelFromXp, xpForCast, xpProgressWithinLevel, xpThresholdForLevel } from './xp';
import { createDefaultProgress } from '@/storage/defaultState';

describe('xpThresholdForLevel', () => {
  it('requires zero xp for level 1', () => {
    expect(xpThresholdForLevel(1)).toBe(0);
  });

  it('increases monotonically', () => {
    const l2 = xpThresholdForLevel(2);
    const l3 = xpThresholdForLevel(3);
    const l4 = xpThresholdForLevel(4);
    expect(l3).toBeGreaterThan(l2);
    expect(l4).toBeGreaterThan(l3);
  });
});

describe('levelFromXp', () => {
  it('returns 1 for zero xp', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('matches the threshold boundary', () => {
    const threshold = xpThresholdForLevel(5);
    expect(levelFromXp(threshold)).toBe(5);
    expect(levelFromXp(threshold - 1)).toBe(4);
  });
});

describe('xpProgressWithinLevel', () => {
  it('reports a ratio between 0 and 1', () => {
    const { ratio } = xpProgressWithinLevel(150);
    expect(ratio).toBeGreaterThanOrEqual(0);
    expect(ratio).toBeLessThanOrEqual(1);
  });
});

describe('addXp', () => {
  it('accumulates xp and reports level ups', () => {
    const progress = createDefaultProgress();
    const bigThreshold = xpThresholdForLevel(2);
    const result = addXp(progress, bigThreshold);
    expect(result.progress.xp).toBe(bigThreshold);
    expect(result.leveledUp).toBe(true);
    expect(result.newLevel).toBeGreaterThanOrEqual(2);
  });

  it('does not level up on tiny gains', () => {
    const progress = createDefaultProgress();
    const result = addXp(progress, 1);
    expect(result.leveledUp).toBe(false);
  });

  it('rounds and floors negative amounts to zero', () => {
    const progress = createDefaultProgress();
    const result = addXp(progress, -50);
    expect(result.xpGained).toBe(0);
  });
});

describe('xpForCast', () => {
  it('grants a discovery bonus on first cast', () => {
    const first = xpForCast(1, true);
    const repeat = xpForCast(1, false);
    expect(first).toBeGreaterThan(repeat);
  });
});
