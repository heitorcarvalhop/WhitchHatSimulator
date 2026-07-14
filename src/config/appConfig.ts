/** Change these values to re-brand the app — every screen reads its title from here. */
export const APP_CONFIG = {
  name: 'Arcane Forge',
  subtitle: 'Interactive Spell Simulator',
  shortName: 'Arcane Forge',
  version: '0.1.0',
  storagePrefix: 'arcane-forge',
  author: 'Arcane Forge Contributors',
  defaultLanguage: 'pt-BR' as const,
} as const;

export type AppConfig = typeof APP_CONFIG;
