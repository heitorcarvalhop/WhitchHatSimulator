import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BUILTIN_SPELLS } from '@/spells/spellDefinitions';
import { useSettings } from '@/hooks/useSettings';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { useCustomSpells } from '@/hooks/useCustomSpells';
import { useAdminCheats } from '@/hooks/useAdminCheats';
import { executeCast, type CastInput, type CastOutcome } from '@/services/spellExecutionService';
import type { RecentCast } from '@/combinations/combinationEngine';
import { SPELL_COMBINATIONS } from '@/combinations/combinationDefinitions';
import { addXp, xpThresholdForLevel } from '@/progression/xp';
import { CHALLENGES } from '@/progression/challengeDefinitions';
import { initChallengeProgress } from '@/progression/challenges';
import { createDefaultProgress } from '@/storage/defaultState';
import type { Spell } from '@/types';
import { ENERGY_TICK_MS, maxEnergyForLevel, regenPerSecondForLevel } from './energy';
import type { AppToast, ToastKind } from './toasts';
import { createId } from '@/utils/id';
import { AppStateContext, type AdminActions, type AppStateValue } from './context';

const ADMIN_MAX_LEVEL = 99;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { progress, setProgress, toggleFavorite } = usePlayerProgress();
  const { customSpells, saveCustomSpell, deleteCustomSpell, duplicateCustomSpell } =
    useCustomSpells();
  const { cheats, setCheat } = useAdminCheats();

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
      setEnergy((e) =>
        cheats.infiniteEnergy ? maxEnergy : Math.min(maxEnergy, e + regenPerTick),
      );
    }, ENERGY_TICK_MS);
    return () => clearInterval(id);
  }, [progress.level, maxEnergy, cheats.infiniteEnergy]);

  const allSpells = useMemo<Spell[]>(() => [...BUILTIN_SPELLS, ...customSpells], [customSpells]);
  const unlockedSpells = useMemo(
    () =>
      cheats.unlockAllSpells ? allSpells : allSpells.filter((s) => s.unlockLevel <= progress.level),
    [allSpells, progress.level, cheats.unlockAllSpells],
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
        forcedAccuracy: cheats.autoPerfect ? 1 : undefined,
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
      cheats.autoPerfect,
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

      setEnergy(cheats.infiniteEnergy ? maxEnergy : outcome.energyAfter);
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
    [pushToast, setProgress, cheats.infiniteEnergy, maxEnergy],
  );

  const adminActions = useMemo<AdminActions>(
    () => ({
      setLevel: (level) => {
        const clamped = Math.max(1, Math.min(ADMIN_MAX_LEVEL, Math.round(level)));
        setProgress((prev) => ({ ...prev, level: clamped, xp: xpThresholdForLevel(clamped) }));
      },
      maxLevel: () => {
        setProgress((prev) => ({
          ...prev,
          level: ADMIN_MAX_LEVEL,
          xp: xpThresholdForLevel(ADMIN_MAX_LEVEL),
        }));
      },
      addXp: (amount) => {
        setProgress((prev) => addXp(prev, amount).progress);
      },
      discoverAllSpells: () => {
        setProgress((prev) => ({ ...prev, discoveredSpellIds: allSpells.map((s) => s.id) }));
      },
      unlockAllCombinations: () => {
        const comboIds = [
          ...SPELL_COMBINATIONS.map((c) => c.id),
          ...allSpells
            .filter((s) => s.id !== 'aether')
            .map((s) => `aether-amplified-${s.id}`),
        ];
        setProgress((prev) => ({ ...prev, discoveredCombinationIds: comboIds }));
      },
      fillEnergy: () => {
        setEnergy(maxEnergy);
      },
      setStreak: (value) => {
        const clamped = Math.max(0, Math.round(value));
        setProgress((prev) => ({
          ...prev,
          currentStreak: clamped,
          bestStreak: Math.max(prev.bestStreak, clamped),
        }));
      },
      completeAllChallenges: () => {
        setProgress((prev) => {
          let totalReward = 0;
          const challengeProgress = { ...prev.challengeProgress };
          for (const challenge of CHALLENGES) {
            const existing = challengeProgress[challenge.id];
            if (!existing?.completed) totalReward += challenge.xpReward;
            challengeProgress[challenge.id] = {
              challengeId: challenge.id,
              progress: challenge.target,
              completed: true,
              completedAt: existing?.completedAt ?? Date.now(),
            };
          }
          return addXp({ ...prev, challengeProgress }, totalReward).progress;
        });
      },
      resetChallenges: () => {
        setProgress((prev) => ({ ...prev, challengeProgress: initChallengeProgress() }));
      },
      resetProgress: () => {
        setProgress(createDefaultProgress());
        setEnergy(maxEnergyForLevel(1));
      },
    }),
    [setProgress, allSpells, maxEnergy],
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
    cheats,
    setCheat,
    adminActions,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}
