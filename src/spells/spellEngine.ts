import type { Spell, SpellResult, SpellTier } from '@/types';

export interface AccuracyBand {
  tier: SpellTier;
  min: number;
  max: number;
  label: string;
}

/** Accuracy thresholds exactly as specified by the design: [min, max). */
export const ACCURACY_BANDS: AccuracyBand[] = [
  { tier: 'fail', min: 0, max: 0.45, label: 'Falha' },
  { tier: 'unstable', min: 0.45, max: 0.6, label: 'Instável' },
  { tier: 'common', min: 0.6, max: 0.75, label: 'Comum' },
  { tier: 'powerful', min: 0.75, max: 0.9, label: 'Poderoso' },
  { tier: 'perfect', min: 0.9, max: 0.98, label: 'Perfeito' },
  { tier: 'legendary', min: 0.98, max: 1.01, label: 'Lendário' },
];

export function tierFromAccuracy(accuracy: number): SpellTier {
  const band = ACCURACY_BANDS.find((b) => accuracy >= b.min && accuracy < b.max);
  return band?.tier ?? 'fail';
}

export function tierLabel(tier: SpellTier): string {
  return ACCURACY_BANDS.find((b) => b.tier === tier)?.label ?? tier;
}

const TIER_POWER_MULTIPLIER: Record<SpellTier, number> = {
  fail: 0.15,
  unstable: 0.45,
  common: 0.75,
  powerful: 1.1,
  perfect: 1.5,
  legendary: 2,
};

/** Energy actually drawn from the pool: failed casts fizzle and waste less than a full cost. */
const TIER_ENERGY_FACTOR: Record<SpellTier, number> = {
  fail: 0.5,
  unstable: 0.8,
  common: 1,
  powerful: 1,
  perfect: 1,
  legendary: 0.9,
};

/** Chance [0,1] that a special bonus effect (extra particles/flourish) triggers. */
const TIER_SPECIAL_CHANCE: Record<SpellTier, number> = {
  fail: 0,
  unstable: 0.05,
  common: 0.15,
  powerful: 0.35,
  perfect: 0.7,
  legendary: 1,
};

export interface SpellCastComputation {
  tier: SpellTier;
  power: number;
  energyCost: number;
  stability: number;
  specialEffectTriggered: boolean;
  particleMultiplier: number;
  sizeMultiplier: number;
  durationMultiplier: number;
}

export function computeSpellCast(
  spell: Spell,
  accuracy: number,
  comboMultiplier: number,
  randomSeed: number = Math.random(),
): SpellCastComputation {
  const clampedAccuracy = Math.max(0, Math.min(1, accuracy));
  const tier = tierFromAccuracy(clampedAccuracy);
  const tierMultiplier = TIER_POWER_MULTIPLIER[tier];

  const power = Math.round(
    spell.energyCost * tierMultiplier * comboMultiplier * (0.6 + clampedAccuracy * 0.4),
  );
  const energyCost = Math.round(spell.energyCost * TIER_ENERGY_FACTOR[tier]);
  const stability = Math.max(0, Math.min(1, clampedAccuracy * 1.1 - (tier === 'fail' ? 0.3 : 0)));
  const specialEffectTriggered = randomSeed < TIER_SPECIAL_CHANCE[tier];

  return {
    tier,
    power,
    energyCost,
    stability,
    specialEffectTriggered,
    particleMultiplier: 0.35 + tierMultiplier * 0.5,
    sizeMultiplier: 0.5 + clampedAccuracy * 0.8,
    durationMultiplier: 0.6 + tierMultiplier * 0.4,
  };
}

export function buildSpellResult(
  spell: Spell,
  accuracy: number,
  comboMultiplier: number,
  candidates: Array<{ spellId: string; score: number }>,
  recognized: boolean,
  rejectionReason?: string,
): SpellResult {
  const computation = computeSpellCast(spell, accuracy, comboMultiplier);
  return {
    spellId: spell.id,
    accuracy,
    tier: computation.tier,
    power: computation.power,
    energyCost: computation.energyCost,
    timestamp: Date.now(),
    comboMultiplier,
    recognized,
    candidates,
    rejectionReason,
  };
}
