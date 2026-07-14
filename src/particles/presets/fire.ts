import type { ParticlePreset } from '@/types';

export const FIRE_PRESET: ParticlePreset = {
  id: 'fire',
  label: 'Fogo',
  quantity: 40,
  duration: 900,
  loop: false,
  speed: { min: 1.2, max: 3.6 },
  direction: { min: 250, max: 290 },
  spread: 50,
  gravity: -0.6,
  rotationSpeed: { min: -2, max: 2 },
  scale: { start: 22, end: 4, variance: 0.35 },
  opacity: { start: 0.95, end: 0 },
  colors: ['#fff2b0', '#ffb648', '#ff6a3d', '#c23616'],
  blendMode: 'add',
  acceleration: 0.4,
  turbulence: 0.8,
  textureShape: 'circle',
  emissionRadius: 14,
  lifetime: { min: 450, max: 820 },
  trail: true,
};
