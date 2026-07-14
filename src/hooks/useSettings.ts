import { useCallback } from 'react';
import type { UserSettings } from '@/types';
import { loadSettings } from '@/storage/storage';
import { createDefaultSettings } from '@/storage/defaultState';
import { persistSettings } from '@/services/persistenceService';
import { useLocalStorageState } from './useLocalStorageState';

export function useSettings() {
  const [settings, setSettings] = useLocalStorageState<UserSettings>(loadSettings, persistSettings);

  const updateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings],
  );

  const resetSettings = useCallback(() => {
    setSettings(createDefaultSettings());
  }, [setSettings]);

  return { settings, setSettings, updateSetting, resetSettings };
}
