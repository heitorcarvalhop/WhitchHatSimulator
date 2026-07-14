export interface SpellEmitterLayer {
  presetId: string;
  countMultiplier: number;
  colorOverride?: string[];
}

/** Each spell layers a primary preset with a secondary accent, so all ten mandatory presets get used across the roster. */
export const SPELL_EFFECT_LAYERS: Record<string, SpellEmitterLayer[]> = {
  ignis: [
    { presetId: 'fire', countMultiplier: 1 },
    { presetId: 'smoke', countMultiplier: 0.5 },
    { presetId: 'spark', countMultiplier: 0.6 },
  ],
  aqua: [
    { presetId: 'water', countMultiplier: 1 },
    { presetId: 'spark', countMultiplier: 0.3, colorOverride: ['#bfe9ff', '#ffffff'] },
  ],
  ventus: [
    { presetId: 'dust', countMultiplier: 0.8, colorOverride: ['#dfeee0', '#c7e6c9', '#ffffff'] },
    { presetId: 'leaves', countMultiplier: 0.7 },
  ],
  terra: [
    { presetId: 'dust', countMultiplier: 1.2 },
    { presetId: 'spark', countMultiplier: 0.3, colorOverride: ['#c98a4b', '#8c6239'] },
  ],
  lux: [
    { presetId: 'energy', countMultiplier: 1, colorOverride: ['#ffe27a', '#fff2b0', '#ffffff'] },
    { presetId: 'spark', countMultiplier: 0.5, colorOverride: ['#ffe27a', '#ffffff'] },
  ],
  umbra: [
    { presetId: 'shadow', countMultiplier: 1 },
    { presetId: 'smoke', countMultiplier: 0.6, colorOverride: ['#2a1a3d', '#0f0a17'] },
  ],
  fulmen: [
    { presetId: 'electric', countMultiplier: 1 },
    { presetId: 'spark', countMultiplier: 0.5, colorOverride: ['#f7ef4a', '#ffffff'] },
  ],
  glacies: [
    { presetId: 'snow', countMultiplier: 1 },
    { presetId: 'spark', countMultiplier: 0.3, colorOverride: ['#bff6ff', '#ffffff'] },
  ],
  vita: [
    { presetId: 'leaves', countMultiplier: 1 },
    { presetId: 'energy', countMultiplier: 0.4, colorOverride: ['#5fd97a', '#c8ffb0'] },
  ],
  aether: [
    { presetId: 'energy', countMultiplier: 1.2, colorOverride: ['#e8d5ff', '#c9a8ff', '#ffffff'] },
    { presetId: 'spark', countMultiplier: 0.4, colorOverride: ['#e8d5ff'] },
  ],
};

/** Failed casts always use this muted layer regardless of the intended spell. */
export const FIZZLE_LAYER: SpellEmitterLayer[] = [
  { presetId: 'smoke', countMultiplier: 0.4, colorOverride: ['#6b6b76', '#3a3a44'] },
  { presetId: 'spark', countMultiplier: 0.2, colorOverride: ['#8b8b96'] },
];
