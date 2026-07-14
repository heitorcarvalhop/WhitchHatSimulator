import type { ParticlePreset } from '@/types';
import { FIRE_PRESET } from './fire';
import { SMOKE_PRESET } from './smoke';
import { SPARK_PRESET } from './spark';
import { WATER_PRESET } from './water';
import { SNOW_PRESET } from './snow';
import { DUST_PRESET } from './dust';
import { LEAVES_PRESET } from './leaves';
import { ENERGY_PRESET } from './energy';
import { SHADOW_PRESET } from './shadow';
import { ELECTRIC_PRESET } from './electric';

export {
  FIRE_PRESET,
  SMOKE_PRESET,
  SPARK_PRESET,
  WATER_PRESET,
  SNOW_PRESET,
  DUST_PRESET,
  LEAVES_PRESET,
  ENERGY_PRESET,
  SHADOW_PRESET,
  ELECTRIC_PRESET,
};

export const PARTICLE_PRESETS: Record<string, ParticlePreset> = {
  fire: FIRE_PRESET,
  smoke: SMOKE_PRESET,
  spark: SPARK_PRESET,
  water: WATER_PRESET,
  snow: SNOW_PRESET,
  dust: DUST_PRESET,
  leaves: LEAVES_PRESET,
  energy: ENERGY_PRESET,
  shadow: SHADOW_PRESET,
  electric: ELECTRIC_PRESET,
};

export function getPreset(id: string): ParticlePreset {
  const preset = PARTICLE_PRESETS[id];
  if (!preset) {
    throw new Error(`Unknown particle preset: ${id}`);
  }
  return preset;
}
