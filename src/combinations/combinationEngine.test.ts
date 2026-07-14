import { describe, expect, it } from 'vitest';
import { detectCombination } from './combinationEngine';
import { SPELLS_BY_ID } from '@/spells/spellDefinitions';

describe('detectCombination', () => {
  it('returns null when there is no previous cast', () => {
    expect(detectCombination(null, { spellId: 'ignis', timestamp: 1000 }, SPELLS_BY_ID)).toBeNull();
  });

  it('detects a known combination regardless of cast order', () => {
    const a = detectCombination(
      { spellId: 'ignis', timestamp: 1000 },
      { spellId: 'ventus', timestamp: 1500 },
      SPELLS_BY_ID,
    );
    expect(a?.id).toBe('firestorm');

    const b = detectCombination(
      { spellId: 'ventus', timestamp: 1000 },
      { spellId: 'ignis', timestamp: 1500 },
      SPELLS_BY_ID,
    );
    expect(b?.id).toBe('firestorm');
  });

  it('does not trigger a combination outside the time window', () => {
    const result = detectCombination(
      { spellId: 'ignis', timestamp: 0 },
      { spellId: 'ventus', timestamp: 10_000 },
      SPELLS_BY_ID,
    );
    expect(result).toBeNull();
  });

  it('synthesizes an Aether-amplified combination with any other element', () => {
    const result = detectCombination(
      { spellId: 'aether', timestamp: 1000 },
      { spellId: 'terra', timestamp: 1800 },
      SPELLS_BY_ID,
    );
    expect(result?.id).toBe('aether-amplified-terra');
    expect(result?.name).toContain('Terra');
  });

  it('returns null for unrelated spell pairs', () => {
    const result = detectCombination(
      { spellId: 'lux', timestamp: 1000 },
      { spellId: 'terra', timestamp: 1200 },
      SPELLS_BY_ID,
    );
    expect(result).toBeNull();
  });
});
