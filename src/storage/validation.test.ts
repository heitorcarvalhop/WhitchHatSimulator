import { describe, expect, it } from 'vitest';
import { validateCustomSpell } from './validation';
import { SPELLS_BY_ID } from '@/spells/spellDefinitions';

function validCustomSpellPayload() {
  const base = SPELLS_BY_ID.ignis!;
  return {
    id: 'custom-1',
    name: 'Meu Feitiço',
    element: base.element,
    difficulty: base.difficulty,
    description: 'Um feitiço de teste.',
    lore: 'Criado no Laboratório Arcano.',
    energyCost: 20,
    color: '#ff6a3d',
    template: base.template,
    particlePresetId: 'fire',
    soundId: 'custom-1',
    unlockLevel: 0,
  };
}

describe('validateCustomSpell', () => {
  it('accepts a well-formed custom spell', () => {
    const result = validateCustomSpell(validCustomSpellPayload());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects a non-object', () => {
    expect(validateCustomSpell(null).valid).toBe(false);
    expect(validateCustomSpell('nope').valid).toBe(false);
  });

  it('rejects an invalid element', () => {
    const result = validateCustomSpell({ ...validCustomSpellPayload(), element: 'plasma' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Elemento'))).toBe(true);
  });

  it('rejects an out-of-range energy cost', () => {
    const result = validateCustomSpell({ ...validCustomSpellPayload(), energyCost: 500 });
    expect(result.valid).toBe(false);
  });

  it('rejects a malformed color', () => {
    const result = validateCustomSpell({ ...validCustomSpellPayload(), color: 'orange' });
    expect(result.valid).toBe(false);
  });

  it('rejects a template with no strokes', () => {
    const result = validateCustomSpell({
      ...validCustomSpellPayload(),
      template: { strokes: [], orderMatters: false },
    });
    expect(result.valid).toBe(false);
  });

  it('rejects an unknown particle preset id', () => {
    const result = validateCustomSpell({
      ...validCustomSpellPayload(),
      particlePresetId: 'plasma-burst',
    });
    expect(result.valid).toBe(false);
  });
});
