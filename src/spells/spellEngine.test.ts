import { describe, expect, it } from 'vitest';
import { computeSpellCast, tierFromAccuracy } from './spellEngine';
import { SPELLS_BY_ID } from './spellDefinitions';

describe('tierFromAccuracy', () => {
  it.each([
    [0, 'fail'],
    [0.44, 'fail'],
    [0.45, 'unstable'],
    [0.59, 'unstable'],
    [0.6, 'common'],
    [0.74, 'common'],
    [0.75, 'powerful'],
    [0.89, 'powerful'],
    [0.9, 'perfect'],
    [0.97, 'perfect'],
    [0.98, 'legendary'],
    [1, 'legendary'],
  ])('maps accuracy %s to tier %s', (accuracy, expected) => {
    expect(tierFromAccuracy(accuracy)).toBe(expected);
  });
});

describe('computeSpellCast', () => {
  const ignis = SPELLS_BY_ID.ignis!;

  it('produces higher power for higher accuracy at the same combo', () => {
    const low = computeSpellCast(ignis, 0.5, 1, 0);
    const high = computeSpellCast(ignis, 0.95, 1, 0);
    expect(high.power).toBeGreaterThan(low.power);
  });

  it('scales power with combo multiplier', () => {
    const noCombo = computeSpellCast(ignis, 0.8, 1, 0);
    const combo = computeSpellCast(ignis, 0.8, 2, 0);
    expect(combo.power).toBeGreaterThan(noCombo.power);
  });

  it('charges reduced energy for a failed cast', () => {
    const failed = computeSpellCast(ignis, 0.2, 1, 0);
    expect(failed.energyCost).toBeLessThan(ignis.energyCost);
    expect(failed.tier).toBe('fail');
  });

  it('always triggers the special effect on a legendary cast', () => {
    const legendary = computeSpellCast(ignis, 0.99, 1, 0.999);
    expect(legendary.specialEffectTriggered).toBe(true);
  });
});
