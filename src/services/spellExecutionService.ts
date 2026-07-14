import type {
  Challenge,
  ChallengeProgress,
  Gesture,
  PlayerProgress,
  Spell,
  SpellCombination,
  SpellResult,
} from '@/types';
import { gestureRecognizer, type RecognitionOutcome } from '@/recognition/recognizer';
import {
  buildSpellResult,
  computeSpellCast,
  type SpellCastComputation,
} from '@/spells/spellEngine';
import { detectCombination, type RecentCast } from '@/combinations/combinationEngine';
import { updateChallengeProgressOnCast, type ChallengeCastContext } from '@/progression/challenges';
import { addXp, xpForCast, xpForCombination } from '@/progression/xp';
import { CHALLENGES } from '@/progression/challengeDefinitions';

const VITA_RESTORE_BASE = 26;

export interface CastInput {
  gesture: Gesture;
  drawDurationMs: number;
  spells: Spell[];
  spellsById: Record<string, Spell>;
  tolerance: number;
  currentEnergy: number;
  maxEnergy: number;
  progress: PlayerProgress;
  lastCast: RecentCast | null;
  isTrainingMode: boolean;
  usedGuide: boolean;
}

export interface CastOutcome {
  recognition: RecognitionOutcome;
  spell: Spell | null;
  result: SpellResult | null;
  computation: SpellCastComputation | null;
  combination: SpellCombination | null;
  combinationIsFirstDiscovery: boolean;
  energyAfter: number;
  energySufficient: boolean;
  updatedProgress: PlayerProgress;
  xpGained: number;
  leveledUp: boolean;
  newLevel: number;
  newlyCompletedChallenges: Challenge[];
  isNewSpellDiscovery: boolean;
  blockedReason?: string;
}

function cloneChallengeProgress(
  map: Record<string, ChallengeProgress>,
): Record<string, ChallengeProgress> {
  return { ...map };
}

/** Pure aside from `Date.now()` — callers own applying the result to state and triggering particle/audio side effects. */
export function executeCast(input: CastInput): CastOutcome {
  const {
    gesture,
    drawDurationMs,
    spells,
    spellsById,
    tolerance,
    currentEnergy,
    maxEnergy,
    progress,
    lastCast,
    isTrainingMode,
    usedGuide,
  } = input;

  const templates = spells.map((s) => ({
    id: s.id,
    strokes: s.template.strokes,
    orderMatters: s.template.orderMatters,
  }));
  const recognition = gestureRecognizer.recognize(gesture, templates, tolerance);

  const baseOutcome: CastOutcome = {
    recognition,
    spell: null,
    result: null,
    computation: null,
    combination: null,
    combinationIsFirstDiscovery: false,
    energyAfter: currentEnergy,
    energySufficient: true,
    updatedProgress: progress,
    xpGained: 0,
    leveledUp: false,
    newLevel: progress.level,
    newlyCompletedChallenges: [],
    isNewSpellDiscovery: false,
  };

  if (!recognition.recognized || !recognition.bestMatch) {
    return baseOutcome;
  }

  const spell = spellsById[recognition.bestMatch.templateId];
  if (!spell) {
    return baseOutcome;
  }

  if (currentEnergy < spell.energyCost) {
    return {
      ...baseOutcome,
      spell,
      energySufficient: false,
      blockedReason: 'Energia arcana insuficiente para conjurar este feitiço.',
    };
  }

  const accuracy = recognition.bestMatch.score;
  const comboMultiplier = 1 + Math.min(progress.currentStreak, 10) * 0.05;
  const computation = computeSpellCast(spell, accuracy, comboMultiplier);
  const candidateScores = recognition.candidates.map((c) => ({
    spellId: c.templateId,
    score: c.score,
  }));
  const result = buildSpellResult(spell, accuracy, comboMultiplier, candidateScores, true);

  let energyAfter = Math.max(0, currentEnergy - computation.energyCost);
  if (spell.id === 'vita' && computation.tier !== 'fail') {
    energyAfter = Math.min(maxEnergy, energyAfter + VITA_RESTORE_BASE * (0.5 + accuracy * 0.5));
  }

  const isNewSpellDiscovery = !progress.discoveredSpellIds.includes(spell.id);
  const combination = detectCombination(
    lastCast,
    { spellId: spell.id, timestamp: Date.now() },
    spellsById,
  );
  const combinationIsFirstDiscovery = combination
    ? !progress.discoveredCombinationIds.includes(combination.id)
    : false;

  let xpGained = 0;
  if (computation.tier !== 'fail') {
    xpGained += xpForCast(computation.power / Math.max(1, spell.energyCost), isNewSpellDiscovery);
  }
  if (combination) {
    xpGained += xpForCombination(combinationIsFirstDiscovery);
  }

  const streakAlive = computation.tier !== 'fail';
  const currentStreak = streakAlive ? progress.currentStreak + 1 : 0;
  const bestStreak = Math.max(progress.bestStreak, currentStreak);

  const elementsCastSoFar = new Set(
    spells
      .filter((s) => (progress.timesCastBySpell[s.id] ?? 0) > 0 || s.id === spell.id)
      .map((s) => s.element),
  );

  const challengeContext: ChallengeCastContext = {
    element: spell.element,
    tier: computation.tier,
    accuracyPercent: accuracy * 100,
    drawDurationMs,
    usedGuide,
    isTrainingMode,
    combinationDiscoveredNow: combinationIsFirstDiscovery,
    currentStreak,
    elementsCastSoFar,
  };

  const { progressMap: challengeProgress, newlyCompleted } = updateChallengeProgressOnCast(
    cloneChallengeProgress(progress.challengeProgress),
    challengeContext,
    CHALLENGES,
  );

  for (const challenge of newlyCompleted) {
    xpGained += challenge.xpReward;
  }

  const bestAccuracyBySpell = { ...progress.bestAccuracyBySpell };
  bestAccuracyBySpell[spell.id] = Math.max(bestAccuracyBySpell[spell.id] ?? 0, accuracy);

  const timesCastBySpell = { ...progress.timesCastBySpell };
  timesCastBySpell[spell.id] = (timesCastBySpell[spell.id] ?? 0) + 1;

  const castHistory = [
    {
      id: `${spell.id}-${Date.now()}`,
      spellId: spell.id,
      spellName: spell.name,
      accuracy,
      tier: computation.tier,
      timestamp: Date.now(),
      comboMultiplier,
    },
    ...progress.castHistory,
  ].slice(0, 50);

  const mergedProgress: PlayerProgress = {
    ...progress,
    discoveredSpellIds: isNewSpellDiscovery
      ? [...progress.discoveredSpellIds, spell.id]
      : progress.discoveredSpellIds,
    discoveredCombinationIds:
      combination && combinationIsFirstDiscovery
        ? [...progress.discoveredCombinationIds, combination.id]
        : progress.discoveredCombinationIds,
    bestAccuracyBySpell,
    timesCastBySpell,
    castHistory,
    challengeProgress,
    currentStreak,
    bestStreak,
    lastCastAt: Date.now(),
  };

  const xpResult = addXp(mergedProgress, xpGained);

  return {
    recognition,
    spell,
    result,
    computation,
    combination,
    combinationIsFirstDiscovery,
    energyAfter,
    energySufficient: true,
    updatedProgress: xpResult.progress,
    xpGained,
    leveledUp: xpResult.leveledUp,
    newLevel: xpResult.newLevel,
    newlyCompletedChallenges: newlyCompleted,
    isNewSpellDiscovery,
  };
}
