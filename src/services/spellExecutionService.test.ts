import { describe, expect, it } from 'vitest';
import { executeCast } from './spellExecutionService';
import { BUILTIN_SPELLS, SPELLS_BY_ID } from '@/spells/spellDefinitions';
import { createDefaultProgress } from '@/storage/defaultState';
import type { Gesture } from '@/types';

function gestureFromTemplate(spellId: string): Gesture {
  const spell = SPELLS_BY_ID[spellId]!;
  return {
    strokes: spell.template.strokes.map((points, i) => ({
      id: `s-${i}`,
      points,
      startTime: points[0]?.t ?? 0,
      endTime: points[points.length - 1]?.t ?? 0,
    })),
    createdAt: Date.now(),
  };
}

function baseInput(overrides: Partial<Parameters<typeof executeCast>[0]> = {}) {
  return {
    gesture: gestureFromTemplate('ignis'),
    drawDurationMs: 1000,
    spells: BUILTIN_SPELLS,
    spellsById: SPELLS_BY_ID,
    tolerance: 0.4,
    currentEnergy: 100,
    maxEnergy: 100,
    progress: createDefaultProgress(),
    lastCast: null,
    isTrainingMode: false,
    usedGuide: false,
    ...overrides,
  };
}

describe('executeCast', () => {
  it('recognizes a perfectly-drawn spell and deducts energy', () => {
    const outcome = executeCast(baseInput());
    expect(outcome.spell?.id).toBe('ignis');
    expect(outcome.result).not.toBeNull();
    expect(outcome.energyAfter).toBeLessThan(100);
    expect(outcome.isNewSpellDiscovery).toBe(true);
  });

  it('blocks casting when energy is insufficient', () => {
    const outcome = executeCast(baseInput({ currentEnergy: 1 }));
    expect(outcome.energySufficient).toBe(false);
    expect(outcome.blockedReason).toBeDefined();
    expect(outcome.updatedProgress).toEqual(createDefaultProgress());
  });

  it('returns no spell for an unrecognizable scribble', () => {
    const scribble: Gesture = {
      strokes: [
        {
          id: 's-0',
          points: [
            { x: 0, y: 0, t: 0 },
            { x: 5, y: 9, t: 16 },
            { x: -3, y: 2, t: 32 },
          ],
          startTime: 0,
          endTime: 32,
        },
      ],
      createdAt: Date.now(),
    };
    const outcome = executeCast(baseInput({ gesture: scribble }));
    expect(outcome.spell).toBeNull();
    expect(outcome.recognition.recognized).toBe(false);
  });

  it('restores energy on a successful Vita cast instead of only spending it', () => {
    const outcome = executeCast(
      baseInput({ gesture: gestureFromTemplate('vita'), currentEnergy: 50 }),
    );
    expect(outcome.spell?.id).toBe('vita');
    expect(outcome.energyAfter).toBeGreaterThan(50 - SPELLS_BY_ID.vita!.energyCost);
  });

  it('detects a combination when the previous cast pairs with the current one', () => {
    const outcome = executeCast(
      baseInput({
        gesture: gestureFromTemplate('ventus'),
        lastCast: { spellId: 'ignis', timestamp: Date.now() - 500 },
      }),
    );
    expect(outcome.combination?.id).toBe('firestorm');
    expect(outcome.combinationIsFirstDiscovery).toBe(true);
  });

  it('awards xp and marks the spell as discovered after a successful cast', () => {
    const outcome = executeCast(baseInput());
    expect(outcome.xpGained).toBeGreaterThan(0);
    expect(outcome.updatedProgress.discoveredSpellIds).toContain('ignis');
    expect(outcome.updatedProgress.timesCastBySpell.ignis).toBe(1);
  });
});
