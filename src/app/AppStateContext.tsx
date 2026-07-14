import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BUILTIN_SPELLS } from '@/spells/spellDefinitions';
import { useSettings } from '@/hooks/useSettings';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { useCustomSpells } from '@/hooks/useCustomSpells';
import { executeCast, type CastInput, type CastOutcome } from '@/services/spellExecutionService';
import type { RecentCast } from '@/combinations/combinationEngine';
import type { Spell } from '@/types';
import { ENERGY_TICK_MS, maxEnergyForLevel, regenPerSecondForLevel } from './energy';
import type { AppToast, ToastKind } from './toasts';
import { createId } from '@/utils/id';
import { AppStateContext, type AppStateValue } from './context';

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { progress, setProgress, toggleFavorite } = usePlayerProgress();
  const { customSpells, saveCustomSpell, deleteCustomSpell, duplicateCustomSpell } =
    useCustomSpells();

  const maxEnergy = useMemo(() => maxEnergyForLevel(progress.level), [progress.level]);
  const [energy, setEnergy] = useState(maxEnergy);
  const [lastCast, setLastCast] = useState<RecentCast | null>(null);
  const [lastOutcome, setLastOutcome] = useState<CastOutcome | null>(null);
  const [toasts, setToasts] = useState<AppToast[]>([]);

  useEffect(() => {
    setEnergy((e) => Math.min(e, maxEnergyForLevel(progress.level)));
  }, [progress.level]);

  useEffect(() => {
    const regenPerTick = (regenPerSecondForLevel(progress.level) * ENERGY_TICK_MS) / 1000;
    const id = setInterval(() => {
      setEnergy((e) => Math.min(maxEnergy, e + regenPerTick));
    }, ENERGY_TICK_MS);
    return () => clearInterval(id);
  }, [progress.level, maxEnergy]);

  const allSpells = useMemo<Spell[]>(() => [...BUILTIN_SPELLS, ...customSpells], [customSpells]);
  const unlockedSpells = useMemo(
    () => allSpells.filter((s) => s.unlockLevel <= progress.level),
    [allSpells, progress.level],
  );
  const spellsById = useMemo(
    () => Object.fromEntries(allSpells.map((s) => [s.id, s])),
    [allSpells],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  const pushToast = useCallback(
    (kind: ToastKind, title: string, message: string) => {
      const id = createId('toast');
      setToasts((prev) => [...prev, { id, kind, title, message }]);
      const timer = setTimeout(() => {
        dismissToast(id);
        timersRef.current.delete(timer);
      }, 5200);
      timersRef.current.add(timer);
    },
    [dismissToast],
  );

  const resolveCast = useCallback(
    (
      gesture: CastInput['gesture'],
      drawDurationMs: number,
      opts: { isTrainingMode?: boolean; usedGuide?: boolean } = {},
    ): CastOutcome => {
      return executeCast({
        gesture,
        drawDurationMs,
        spells: unlockedSpells,
        spellsById,
        tolerance: settings.recognitionTolerance,
        currentEnergy: energy,
        maxEnergy,
        progress,
        lastCast,
        isTrainingMode: opts.isTrainingMode ?? false,
        usedGuide: opts.usedGuide ?? false,
      });
    },
    [
      unlockedSpells,
      spellsById,
      settings.recognitionTolerance,
      energy,
      maxEnergy,
      progress,
      lastCast,
    ],
  );

  const commitCastOutcome = useCallback(
    (outcome: CastOutcome) => {
      if (!outcome.spell) return;

      if (!outcome.energySufficient) {
        pushToast(
          'warning',
          'Energia insuficiente',
          outcome.blockedReason ?? 'Aguarde a energia regenerar.',
        );
        return;
      }

      setEnergy(outcome.energyAfter);
      setProgress(outcome.updatedProgress);
      setLastCast({ spellId: outcome.spell.id, timestamp: Date.now() });
      setLastOutcome(outcome);

      if (outcome.isNewSpellDiscovery) {
        pushToast(
          'discovery',
          'Novo feitiço descoberto!',
          `${outcome.spell.name} foi adicionado ao seu grimório.`,
        );
      }
      if (outcome.combination && outcome.combinationIsFirstDiscovery) {
        pushToast('combination', 'Combinação descoberta!', outcome.combination.name);
      }
      if (outcome.leveledUp) {
        pushToast('levelup', 'Nível aumentado!', `Você alcançou o nível ${outcome.newLevel}.`);
      }
      for (const challenge of outcome.newlyCompletedChallenges) {
        pushToast('challenge', 'Desafio concluído!', challenge.name);
      }
    },
    [pushToast, setProgress],
  );

  const value: AppStateValue = {
    settings,
    updateSetting,
    resetSettings,
    progress,
    setProgress,
    toggleFavorite,
    customSpells,
    saveCustomSpell,
    deleteCustomSpell,
    duplicateCustomSpell,
    allSpells,
    unlockedSpells,
    spellsById,
    energy,
    maxEnergy,
    lastCast,
    lastOutcome,
    resolveCast,
    commitCastOutcome,
    toasts,
    pushToast,
    dismissToast,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
