import type { SpellDifficulty, SpellElement } from '@/types';

export const ELEMENT_LABELS: Record<SpellElement, string> = {
  fire: 'Fogo',
  water: 'Água',
  air: 'Ar',
  earth: 'Terra',
  light: 'Luz',
  shadow: 'Sombra',
  electric: 'Eletricidade',
  ice: 'Gelo',
  nature: 'Natureza',
  arcane: 'Energia Arcana',
};

export const DIFFICULTY_LABELS: Record<SpellDifficulty, string> = {
  novice: 'Iniciante',
  adept: 'Adepto',
  expert: 'Especialista',
  master: 'Mestre',
};

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diffSec = Math.max(0, Math.round((now - timestamp) / 1000));
  if (diffSec < 5) return 'agora mesmo';
  if (diffSec < 60) return `há ${diffSec}s`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin}min`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `há ${diffHour}h`;
  const diffDay = Math.round(diffHour / 24);
  return `há ${diffDay}d`;
}
