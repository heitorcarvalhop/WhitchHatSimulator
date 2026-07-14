import { describe, expect, it } from 'vitest';
import {
  initChallengeProgress,
  updateChallengeProgressOnCast,
  type ChallengeCastContext,
} from './challenges';
import { CHALLENGES } from './challengeDefinitions';

function baseContext(overrides: Partial<ChallengeCastContext> = {}): ChallengeCastContext {
  return {
    element: 'fire',
    tier: 'common',
    accuracyPercent: 70,
    drawDurationMs: 3000,
    usedGuide: true,
    isTrainingMode: false,
    combinationDiscoveredNow: false,
    currentStreak: 1,
    elementsCastSoFar: new Set(['fire']),
    ...overrides,
  };
}

describe('updateChallengeProgressOnCast', () => {
  it('increments perfect-casts progress only on perfect/legendary tiers', () => {
    const initial = initChallengeProgress();
    const { progressMap } = updateChallengeProgressOnCast(
      initial,
      baseContext({ tier: 'perfect' }),
    );
    expect(progressMap['three-perfect-casts']!.progress).toBe(1);

    const { progressMap: unchanged } = updateChallengeProgressOnCast(
      initial,
      baseContext({ tier: 'common' }),
    );
    expect(unchanged['three-perfect-casts']!.progress).toBe(0);
  });

  it('completes the accuracy challenge above the threshold, not at it', () => {
    const initial = initChallengeProgress();
    const at95 = updateChallengeProgressOnCast(initial, baseContext({ accuracyPercent: 95 }));
    expect(at95.progressMap['accuracy-95']!.completed).toBe(false);

    const above95 = updateChallengeProgressOnCast(initial, baseContext({ accuracyPercent: 96 }));
    expect(above95.progressMap['accuracy-95']!.completed).toBe(true);
    expect(above95.newlyCompleted.map((c) => c.id)).toContain('accuracy-95');
  });

  it('completes the all-elements challenge once every element has been cast', () => {
    const allElements = new Set([
      'fire',
      'water',
      'air',
      'earth',
      'light',
      'shadow',
      'electric',
      'ice',
      'nature',
      'arcane',
    ]) as ChallengeCastContext['elementsCastSoFar'];
    const { progressMap } = updateChallengeProgressOnCast(
      initChallengeProgress(),
      baseContext({ elementsCastSoFar: allElements }),
    );
    expect(progressMap['all-elements']!.completed).toBe(true);
  });

  it('never regresses progress once a challenge is completed', () => {
    let state = initChallengeProgress();
    state = updateChallengeProgressOnCast(state, baseContext({ tier: 'perfect' })).progressMap;
    state = updateChallengeProgressOnCast(state, baseContext({ tier: 'perfect' })).progressMap;
    state = updateChallengeProgressOnCast(state, baseContext({ tier: 'perfect' })).progressMap;
    expect(state['three-perfect-casts']!.completed).toBe(true);

    const { progressMap: after } = updateChallengeProgressOnCast(
      state,
      baseContext({ tier: 'fail' }),
    );
    expect(after['three-perfect-casts']!.progress).toBe(3);
    expect(after['three-perfect-casts']!.completed).toBe(true);
  });

  it('never returns a progress value above the challenge target', () => {
    const { progressMap } = updateChallengeProgressOnCast(
      initChallengeProgress(),
      baseContext({ currentStreak: 999 }),
    );
    const streakChallenge = CHALLENGES.find((c) => c.id === 'five-cast-streak')!;
    expect(progressMap['five-cast-streak']!.progress).toBeLessThanOrEqual(streakChallenge.target);
  });
});
