import type { ParticlePreset } from '@/types';

export const WATER_PRESET: ParticlePreset = {
  id: 'water',
  label: 'Água',
  quantity: 34,
  duration: 800,
  loop: false,
  speed: { min: 1.5, max: 4 },
  direction: { min: 60, max: 120 },
  spread: 90,
  gravity: 0.9,
  rotationSpeed: { min: -1, max: 1 },
  scale: { start: 10, end: 4, variance: 0.3 },
  opacity: { start: 0.9, end: 0 },
  colors: ['#bfe9ff', '#3da9ff', '#1c6fb0'],
  blendMode: 'screen',
  acceleration: 0.1,
  turbulence: 0.3,
  textureShape: 'circle',
  emissionRadius: 12,
  lifetime: { min: 400, max: 750 },
  trail: true,
};
