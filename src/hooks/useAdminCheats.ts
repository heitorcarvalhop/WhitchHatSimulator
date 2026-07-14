import { useCallback } from 'react';
import { APP_CONFIG } from '@/config/appConfig';
import { useLocalStorageState } from './useLocalStorageState';

export interface AdminCheats {
  /** Ignora o `unlockLevel` — todo feitiço fica conjurável e aparece desbloqueado. */
  unlockAllSpells: boolean;
  /** A energia nunca cai e volta ao máximo a cada tick. */
  infiniteEnergy: boolean;
  /** Todo feitiço reconhecido é tratado como 100% de precisão (sempre Lendário). */
  autoPerfect: boolean;
}

const STORAGE_KEY = `${APP_CONFIG.storagePrefix}:admin-cheats`;

function defaultCheats(): AdminCheats {
  return { unlockAllSpells: false, infiniteEnergy: false, autoPerfect: false };
}

function loadCheats(): AdminCheats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCheats();
    return { ...defaultCheats(), ...JSON.parse(raw) };
  } catch {
    return defaultCheats();
  }
}

function saveCheats(cheats: AdminCheats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cheats));
  } catch {
    // Armazenamento cheio ou bloqueado — os cheats simplesmente não persistem entre recarregamentos.
  }
}

export function useAdminCheats() {
  const [cheats, setCheats] = useLocalStorageState<AdminCheats>(loadCheats, saveCheats);

  const setCheat = useCallback(
    <K extends keyof AdminCheats>(key: K, value: AdminCheats[K]) => {
      setCheats((prev) => ({ ...prev, [key]: value }));
    },
    [setCheats],
  );

  const resetCheats = useCallback(() => {
    setCheats(defaultCheats());
  }, [setCheats]);

  return { cheats, setCheat, resetCheats };
}
