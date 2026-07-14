import { useCallback } from 'react';
import type { PlayerProgress } from '@/types';
import { loadProgress } from '@/storage/storage';
import { persistProgress } from '@/services/persistenceService';
import { useLocalStorageState } from './useLocalStorageState';

export function usePlayerProgress() {
  const [progress, setProgress] = useLocalStorageState<PlayerProgress>(
    loadProgress,
    persistProgress,
  );

  const toggleFavorite = useCallback(
    (spellId: string) => {
      setProgress((prev) => ({
        ...prev,
        favoriteSpellIds: prev.favoriteSpellIds.includes(spellId)
          ? prev.favoriteSpellIds.filter((id) => id !== spellId)
          : [...prev.favoriteSpellIds, spellId],
      }));
    },
    [setProgress],
  );

  return { progress, setProgress, toggleFavorite };
}
