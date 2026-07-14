import type { Spell, SpellCombination } from '@/types';
import {
  AETHER_SPELL_ID,
  SPELL_COMBINATIONS,
  createAetherAmplifiedCombination,
} from './combinationDefinitions';

export interface RecentCast {
  spellId: string;
  timestamp: number;
}

function pairMatches(combo: SpellCombination, a: string, b: string): boolean {
  const [first, second] = combo.spellIds;
  if (combo.orderMatters) {
    return first === a && second === b;
  }
  return (first === a && second === b) || (first === b && second === a);
}

/** Returns `null` when the pair doesn't match any known combination or the window between casts has elapsed. */
export function detectCombination(
  previous: RecentCast | null,
  current: RecentCast,
  spellsById: Record<string, Spell>,
  combinations: SpellCombination[] = SPELL_COMBINATIONS,
): SpellCombination | null {
  if (!previous) return null;
  const elapsed = current.timestamp - previous.timestamp;
  if (elapsed < 0) return null;

  for (const combo of combinations) {
    if (elapsed > combo.windowMs) continue;
    if (pairMatches(combo, previous.spellId, current.spellId)) {
      return combo;
    }
  }

  const isAetherPair =
    (previous.spellId === AETHER_SPELL_ID && current.spellId !== AETHER_SPELL_ID) ||
    (current.spellId === AETHER_SPELL_ID && previous.spellId !== AETHER_SPELL_ID);

  if (isAetherPair && elapsed <= 2500) {
    const otherId = previous.spellId === AETHER_SPELL_ID ? current.spellId : previous.spellId;
    const other = spellsById[otherId];
    if (other) {
      return createAetherAmplifiedCombination(other);
    }
  }

  return null;
}
