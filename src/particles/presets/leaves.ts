import type { ParticlePreset } from '@/types';

export const LEAVES_PRESET: ParticlePreset = {
  id: 'leaves',
  label: 'Folhas',
  quantity: 20,
  duration: 1400,
  loop: false,
  speed: { min: 1, max: 3 },
  direction: { min: 250, max: 290 },
  spread: 100,
  gravity: 0.25,
  rotationSpeed: { min: -3, max: 3 },
  scale: { start: 10, end: 8, variance: 0.4 },
  opacity: { start: 0.95, end: 0 },
  colors: ['#5fd97a', '#3fae5c', '#a9e34b', '#2f7d3f'],
  blendMode: 'normal',
  acceleration: 0,
  turbulence: 0.9,
  textureShape: 'leaf',
  emissionRadius: 16,
  lifetime: { min: 700, max: 1300 },
  trail: false,
};
