import type { ParticlePreset } from '@/types';

export const ELECTRIC_PRESET: ParticlePreset = {
  id: 'electric',
  label: 'Eletricidade',
  quantity: 36,
  duration: 450,
  loop: false,
  speed: { min: 3, max: 8 },
  direction: { min: 0, max: 360 },
  spread: 180,
  gravity: 0,
  rotationSpeed: { min: -6, max: 6 },
  scale: { start: 9, end: 1, variance: 0.5 },
  opacity: { start: 1, end: 0 },
  colors: ['#ffffff', '#f7ef4a', '#c9e8ff'],
  blendMode: 'add',
  acceleration: -0.6,
  turbulence: 1.2,
  textureShape: 'bolt',
  emissionRadius: 10,
  lifetime: { min: 150, max: 380 },
  trail: false,
};
