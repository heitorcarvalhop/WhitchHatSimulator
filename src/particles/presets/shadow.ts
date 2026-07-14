import type { ParticlePreset } from '@/types';

export const SHADOW_PRESET: ParticlePreset = {
  id: 'shadow',
  label: 'Sombra',
  quantity: 30,
  duration: 1100,
  loop: false,
  speed: { min: 1.5, max: 4 },
  direction: { min: 0, max: 360 },
  spread: 180,
  gravity: 0,
  rotationSpeed: { min: -1.5, max: 1.5 },
  scale: { start: 4, end: 16, variance: 0.4 },
  opacity: { start: 0.85, end: 0 },
  colors: ['#8b5cf6', '#4c1d95', '#1a1023'],
  blendMode: 'multiply',
  acceleration: -0.5,
  turbulence: 0.3,
  textureShape: 'circle',
  emissionRadius: 8,
  lifetime: { min: 500, max: 950 },
  trail: true,
};
