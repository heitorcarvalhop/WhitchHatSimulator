import type { ParticlePreset } from '@/types';

export const SNOW_PRESET: ParticlePreset = {
  id: 'snow',
  label: 'Neve',
  quantity: 30,
  duration: 1800,
  loop: false,
  speed: { min: 0.3, max: 1.2 },
  direction: { min: 60, max: 120 },
  spread: 100,
  gravity: 0.15,
  rotationSpeed: { min: -1.5, max: 1.5 },
  scale: { start: 6, end: 9, variance: 0.5 },
  opacity: { start: 0.9, end: 0 },
  colors: ['#ffffff', '#e6f9ff', '#bff6ff'],
  blendMode: 'screen',
  acceleration: 0,
  turbulence: 0.6,
  textureShape: 'star',
  emissionRadius: 20,
  lifetime: { min: 900, max: 1700 },
  trail: false,
};
