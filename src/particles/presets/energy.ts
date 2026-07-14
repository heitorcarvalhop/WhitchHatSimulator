import type { ParticlePreset } from '@/types';

export const ENERGY_PRESET: ParticlePreset = {
  id: 'energy',
  label: 'Energia',
  quantity: 32,
  duration: 900,
  loop: false,
  speed: { min: 0.8, max: 2.6 },
  direction: { min: 0, max: 360 },
  spread: 180,
  gravity: -0.05,
  rotationSpeed: { min: -2, max: 2 },
  scale: { start: 10, end: 3, variance: 0.4 },
  opacity: { start: 1, end: 0 },
  colors: ['#ffe27a', '#e8d5ff', '#c9a8ff'],
  blendMode: 'add',
  acceleration: -0.1,
  turbulence: 0.4,
  textureShape: 'ring',
  emissionRadius: 10,
  lifetime: { min: 400, max: 800 },
  trail: true,
};
