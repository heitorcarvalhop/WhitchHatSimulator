import { useEffect, useState } from 'react';
import { AppStateProvider } from '@/app/AppStateContext';
import { useAppState } from '@/app/useAppState';
import { AppShell } from '@/components/layout/AppShell';
import type { AppView } from '@/components/layout/TopBar';
import { HomePage } from '@/pages/HomePage';
import { LabPage } from '@/pages/LabPage';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { ChallengesModal } from '@/components/stats/ChallengesModal';
import { ToastContainer } from '@/components/common/ToastContainer';
import { FpsMonitor } from '@/components/common/FpsMonitor';
import { BackgroundFog } from '@/canvas/BackgroundFog';
import { CursorGlow } from '@/canvas/CursorGlow';
import { useAudioSync } from '@/audio/useAudio';

function AppContent() {
  const { settings, toasts, dismissToast } = useAppState();
  const [view, setView] = useState<AppView>('play');
  const [trainingSpellId, setTrainingSpellId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [challengesOpen, setChallengesOpen] = useState(false);

  useAudioSync(settings);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reducedMotion = String(settings.reducedMotion);
    root.dataset.highContrast = String(settings.highContrast);
    root.lang = settings.language;
    root.style.setProperty('--af-anim-speed', String(settings.animationSpeed));
  }, [settings.reducedMotion, settings.highContrast, settings.language, settings.animationSpeed]);

  const handleTrainSpell = (spellId: string) => {
    setTrainingSpellId(spellId);
    setView('play');
  };

  return (
    <>
      <BackgroundFog intensity={settings.graphicsQuality} reducedMotion={settings.reducedMotion} />
      <CursorGlow
        color="#c9a8ff"
        enabled={!settings.reducedMotion && settings.graphicsQuality !== 'low'}
      />

      <AppShell
        view={view}
        onChangeView={setView}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenChallenges={() => setChallengesOpen(true)}
        onTrainSpell={handleTrainSpell}
      >
        {view === 'play' ? (
          <HomePage
            trainingSpellId={trainingSpellId}
            onExitTraining={() => setTrainingSpellId(null)}
          />
        ) : (
          <LabPage />
        )}
      </AppShell>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {settings.showFps && <FpsMonitor />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
      {challengesOpen && <ChallengesModal onClose={() => setChallengesOpen(false)} />}
    </>
  );
}

export function App() {
  return (
    <AppStateProvider>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>
      <AppContent />
    </AppStateProvider>
  );
}
