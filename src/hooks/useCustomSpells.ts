import { useCallback } from 'react';
import type { CustomSpell } from '@/types';
import { loadCustomSpells } from '@/storage/storage';
import { persistCustomSpells } from '@/services/persistenceService';
import { createId } from '@/utils/id';
import { useLocalStorageState } from './useLocalStorageState';

export function useCustomSpells() {
  const [customSpells, setCustomSpells] = useLocalStorageState<CustomSpell[]>(
    loadCustomSpells,
    persistCustomSpells,
  );

  const saveCustomSpell = useCallback(
    (spell: Omit<CustomSpell, 'isCustom' | 'createdAt' | 'updatedAt' | 'id'> & { id?: string }) => {
      const now = Date.now();
      setCustomSpells((prev) => {
        const existingIndex = spell.id ? prev.findIndex((s) => s.id === spell.id) : -1;
        if (existingIndex >= 0) {
          const updated: CustomSpell = {
            ...prev[existingIndex]!,
            ...spell,
            id: spell.id!,
            isCustom: true,
            updatedAt: now,
          };
          const next = [...prev];
          next[existingIndex] = updated;
          return next;
        }
        const created: CustomSpell = {
          ...spell,
          id: spell.id ?? createId('custom-spell'),
          isCustom: true,
          createdAt: now,
          updatedAt: now,
        };
        return [...prev, created];
      });
    },
    [setCustomSpells],
  );

  const deleteCustomSpell = useCallback(
    (id: string) => {
      setCustomSpells((prev) => prev.filter((s) => s.id !== id));
    },
    [setCustomSpells],
  );

  const duplicateCustomSpell = useCallback(
    (id: string) => {
      setCustomSpells((prev) => {
        const original = prev.find((s) => s.id === id);
        if (!original) return prev;
        const now = Date.now();
        const copy: CustomSpell = {
          ...original,
          id: createId('custom-spell'),
          name: `${original.name} (cópia)`,
          createdAt: now,
          updatedAt: now,
        };
        return [...prev, copy];
      });
    },
    [setCustomSpells],
  );

  return {
    customSpells,
    setCustomSpells,
    saveCustomSpell,
    deleteCustomSpell,
    duplicateCustomSpell,
  };
}
