import type { Point } from './geometry';

export type SpellElement =
  | 'fire'
  | 'water'
  | 'air'
  | 'earth'
  | 'light'
  | 'shadow'
  | 'electric'
  | 'ice'
  | 'nature'
  | 'arcane';

export type SpellDifficulty = 'novice' | 'adept' | 'expert' | 'master';

export type SpellTier = 'fail' | 'unstable' | 'common' | 'powerful' | 'perfect' | 'legendary';

export type TemplateStroke = Point[];

export interface SpellTemplate {
  strokes: TemplateStroke[];
  orderMatters: boolean;
}

export interface Spell {
  id: string;
  name: string;
  element: SpellElement;
  difficulty: SpellDifficulty;
  description: string;
  lore: string;
  energyCost: number;
  color: string;
  template: SpellTemplate;
  particlePresetId: string;
  soundId: string;
  /** Minimum player level required to have this spell available (0 = always). */
  unlockLevel: number;
}

export interface SpellResult {
  spellId: string;
  accuracy: number;
  tier: SpellTier;
  power: number;
  energyCost: number;
  timestamp: number;
  comboMultiplier: number;
  recognized: boolean;
  candidates: Array<{ spellId: string; score: number }>;
  rejectionReason?: string;
}

export interface CustomSpell extends Spell {
  isCustom: true;
  createdAt: number;
  updatedAt: number;
}
