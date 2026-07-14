import type { ParticlePreset } from '@/types';

export const SPARK_PRESET: ParticlePreset = {
  id: 'spark',
  label: 'Faísca',
  quantity: 26,
  duration: 500,
  loop: false,
  speed: { min: 3, max: 7 },
  direction: { min: 0, max: 360 },
  spread: 180,
  gravity: 0.3,
  rotationSpeed: { min: -4, max: 4 },
  scale: { start: 8, end: 1, variance: 0.4 },
  opacity: { start: 1, end: 0 },
  colors: ['#ffffff', '#ffe27a', '#ffb648'],
  blendMode: 'add',
  acceleration: -0.3,
  turbulence: 0.2,
  textureShape: 'spark',
  emissionRadius: 6,
  lifetime: { min: 200, max: 420 },
  trail: false,
};
