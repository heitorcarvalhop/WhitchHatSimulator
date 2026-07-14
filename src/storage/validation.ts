import type { CustomSpell, SpellDifficulty, SpellElement } from '@/types';
import { PARTICLE_PRESETS } from '@/particles/presets';

const VALID_ELEMENTS: SpellElement[] = [
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
];

const VALID_DIFFICULTIES: SpellDifficulty[] = ['novice', 'adept', 'expert', 'master'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPointArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (p) =>
        typeof p === 'object' &&
        p !== null &&
        isFiniteNumber((p as Record<string, unknown>).x) &&
        isFiniteNumber((p as Record<string, unknown>).y),
    )
  );
}

export function validateCustomSpell(candidate: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof candidate !== 'object' || candidate === null) {
    return { valid: false, errors: ['O feitiço importado não é um objeto válido.'] };
  }

  const spell = candidate as Record<string, unknown>;

  if (typeof spell.id !== 'string' || spell.id.trim().length === 0) {
    errors.push('Campo "id" ausente ou inválido.');
  }
  if (typeof spell.name !== 'string' || spell.name.trim().length < 1 || spell.name.length > 40) {
    errors.push('O nome deve ter entre 1 e 40 caracteres.');
  }
  if (
    typeof spell.element !== 'string' ||
    !VALID_ELEMENTS.includes(spell.element as SpellElement)
  ) {
    errors.push(`Elemento inválido. Use um de: ${VALID_ELEMENTS.join(', ')}.`);
  }
  if (
    typeof spell.difficulty !== 'string' ||
    !VALID_DIFFICULTIES.includes(spell.difficulty as SpellDifficulty)
  ) {
    errors.push(`Dificuldade inválida. Use um de: ${VALID_DIFFICULTIES.join(', ')}.`);
  }
  if (typeof spell.description !== 'string' || spell.description.length > 400) {
    errors.push('Descrição inválida ou longa demais (máx. 400 caracteres).');
  }
  if (typeof spell.lore !== 'string' || spell.lore.length > 800) {
    errors.push('Lore inválida ou longa demais (máx. 800 caracteres).');
  }
  if (!isFiniteNumber(spell.energyCost) || spell.energyCost < 1 || spell.energyCost > 100) {
    errors.push('Custo de energia deve ser um número entre 1 e 100.');
  }
  if (typeof spell.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(spell.color)) {
    errors.push('Cor deve estar no formato hexadecimal, ex: #ff6a3d.');
  }
  if (typeof spell.particlePresetId !== 'string' || !(spell.particlePresetId in PARTICLE_PRESETS)) {
    errors.push(
      `Preset de partículas inválido. Use um de: ${Object.keys(PARTICLE_PRESETS).join(', ')}.`,
    );
  }
  if (typeof spell.soundId !== 'string' || spell.soundId.trim().length === 0) {
    errors.push('Campo "soundId" ausente ou inválido.');
  }
  if (!isFiniteNumber(spell.unlockLevel) || spell.unlockLevel < 0) {
    errors.push('Nível de desbloqueio inválido.');
  }

  const template = spell.template as Record<string, unknown> | undefined;
  if (!template || typeof template !== 'object') {
    errors.push('Template do símbolo ausente.');
  } else {
    if (!Array.isArray(template.strokes) || template.strokes.length === 0) {
      errors.push('O template precisa de ao menos um traço.');
    } else if (!template.strokes.every(isPointArray)) {
      errors.push('Todos os traços do template precisam ter pontos com x/y numéricos.');
    }
    if (typeof template.orderMatters !== 'boolean') {
      errors.push('Campo "template.orderMatters" ausente ou inválido.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Fills in bookkeeping fields (isCustom/timestamps) after a payload has passed validation. */
export function sanitizeCustomSpell(candidate: Record<string, unknown>): CustomSpell {
  const now = Date.now();
  return {
    ...(candidate as unknown as CustomSpell),
    isCustom: true,
    createdAt: isFiniteNumber(candidate.createdAt) ? (candidate.createdAt as number) : now,
    updatedAt: now,
  };
}
