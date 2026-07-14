export type BlendModeName = 'normal' | 'add' | 'screen' | 'multiply';

export type ParticleTextureShape =
  'circle' | 'spark' | 'triangle' | 'square' | 'leaf' | 'star' | 'ring' | 'bolt';

export interface ParticlePreset {
  id: string;
  label: string;
  quantity: number;
  duration: number;
  loop: boolean;
  speed: { min: number; max: number };
  direction: { min: number; max: number };
  spread: number;
  gravity: number;
  rotationSpeed: { min: number; max: number };
  scale: { start: number; end: number; variance: number };
  opacity: { start: number; end: number };
  colors: string[];
  blendMode: BlendModeName;
  acceleration: number;
  turbulence: number;
  textureShape: ParticleTextureShape;
  emissionRadius: number;
  lifetime: { min: number; max: number };
  trail: boolean;
}

export interface EmitterOrigin {
  x: number;
  y: number;
}
