export const BASE_MAX_ENERGY = 100;
export const MAX_ENERGY_PER_LEVEL = 6;
export const BASE_REGEN_PER_SECOND = 4;
export const REGEN_PER_LEVEL = 0.25;
export const ENERGY_TICK_MS = 250;

export function maxEnergyForLevel(level: number): number {
  return BASE_MAX_ENERGY + (level - 1) * MAX_ENERGY_PER_LEVEL;
}

export function regenPerSecondForLevel(level: number): number {
  return BASE_REGEN_PER_SECOND + (level - 1) * REGEN_PER_LEVEL;
}
