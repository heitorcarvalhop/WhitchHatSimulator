import type { ParticlePreset } from '@/types';

export const DUST_PRESET: ParticlePreset = {
  id: 'dust',
  label: 'Poeira',
  quantity: 28,
  duration: 1000,
  loop: false,
  speed: { min: 1, max: 3.5 },
  direction: { min: 0, max: 360 },
  spread: 180,
  gravity: 0.1,
  rotationSpeed: { min: -1, max: 1 },
  scale: { start: 7, end: 2, variance: 0.5 },
  opacity: { start: 0.6, end: 0 },
  colors: ['#c98a4b', '#a5713a', '#8c6239'],
  blendMode: 'normal',
  acceleration: -0.2,
  turbulence: 0.7,
  textureShape: 'square',
  emissionRadius: 18,
  lifetime: { min: 400, max: 850 },
  trail: false,
};
