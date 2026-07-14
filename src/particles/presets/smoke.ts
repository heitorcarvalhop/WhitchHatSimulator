import type { ParticlePreset } from '@/types';

export const SMOKE_PRESET: ParticlePreset = {
  id: 'smoke',
  label: 'Fumaça',
  quantity: 18,
  duration: 1600,
  loop: false,
  speed: { min: 0.3, max: 1 },
  direction: { min: 250, max: 290 },
  spread: 70,
  gravity: -0.15,
  rotationSpeed: { min: -0.6, max: 0.6 },
  scale: { start: 12, end: 34, variance: 0.4 },
  opacity: { start: 0.35, end: 0 },
  colors: ['#5a5a66', '#3a3a44', '#232329'],
  blendMode: 'normal',
  acceleration: 0.05,
  turbulence: 0.5,
  textureShape: 'circle',
  emissionRadius: 10,
  lifetime: { min: 900, max: 1500 },
  trail: false,
};
