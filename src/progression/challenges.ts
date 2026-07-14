import type { Challenge, ChallengeProgress, SpellElement, SpellTier } from '@/types';
import { CHALLENGES } from './challengeDefinitions';

export function initChallengeProgress(
  challenges: Challenge[] = CHALLENGES,
): Record<string, ChallengeProgress> {
  return Object.fromEntries(
    challenges.map((c) => [c.id, { challengeId: c.id, progress: 0, completed: false }]),
  );
}

export interface ChallengeCastContext {
  element: SpellElement;
  tier: SpellTier;
  accuracyPercent: number;
  drawDurationMs: number;
  usedGuide: boolean;
  isTrainingMode: boolean;
  combinationDiscoveredNow: boolean;
  currentStreak: number;
  elementsCastSoFar: ReadonlySet<SpellElement>;
}

function progressValueFor(
  challenge: Challenge,
  ctx: ChallengeCastContext,
  previous: number,
): number {
  switch (challenge.conditionType) {
    case 'perfect-casts':
      return ctx.tier === 'perfect' || ctx.tier === 'legendary' ? previous + 1 : previous;
    case 'discover-combination':
      return ctx.combinationDiscoveredNow ? challenge.target : previous;
    case 'fast-draw':
      return ctx.drawDurationMs > 0 && ctx.drawDurationMs < 2000 && ctx.tier !== 'fail'
        ? challenge.target
        : previous;
    case 'all-elements':
      return Math.max(previous, ctx.elementsCastSoFar.size);
    case 'cast-streak':
      return Math.max(previous, ctx.currentStreak);
    case 'accuracy-above':
      return ctx.accuracyPercent > challenge.target ? challenge.target : previous;
    case 'no-guide-cast':
      return ctx.isTrainingMode && !ctx.usedGuide && ctx.tier !== 'fail'
        ? challenge.target
        : previous;
    default:
      return previous;
  }
}

export interface ChallengeUpdateResult {
  progressMap: Record<string, ChallengeProgress>;
  newlyCompleted: Challenge[];
}

export function updateChallengeProgressOnCast(
  progressMap: Record<string, ChallengeProgress>,
  ctx: ChallengeCastContext,
  challenges: Challenge[] = CHALLENGES,
): ChallengeUpdateResult {
  const next: Record<string, ChallengeProgress> = { ...progressMap };
  const newlyCompleted: Challenge[] = [];

  for (const challenge of challenges) {
    const existing = next[challenge.id] ?? {
      challengeId: challenge.id,
      progress: 0,
      completed: false,
    };
    if (existing.completed) continue;

    const rawProgress = progressValueFor(challenge, ctx, existing.progress);
    const progress = Math.min(challenge.target, Math.max(0, rawProgress));
    const completed = progress >= challenge.target;

    next[challenge.id] = {
      challengeId: challenge.id,
      progress,
      completed,
      completedAt: completed ? Date.now() : existing.completedAt,
    };

    if (completed && !existing.completed) {
      newlyCompleted.push(challenge);
    }
  }

  return { progressMap: next, newlyCompleted };
}
