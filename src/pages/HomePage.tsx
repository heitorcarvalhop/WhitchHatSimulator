import { useState } from 'react';
import { useAppState } from '@/app/useAppState';
import { SpellStage } from '@/components/center/SpellStage';
import { TrainingBanner } from '@/components/training/TrainingBanner';
import './home-page.css';

export interface HomePageProps {
  trainingSpellId: string | null;
  onExitTraining: () => void;
}

export function HomePage({ trainingSpellId, onExitTraining }: HomePageProps) {
  const { spellsById, settings, updateSetting } = useAppState();
  const [lastAccuracy, setLastAccuracy] = useState<number | null>(null);

  const trainingSpell = trainingSpellId ? (spellsById[trainingSpellId] ?? null) : null;

  return (
    <div className="home-page">
      {trainingSpell && (
        <TrainingBanner
          spell={trainingSpell}
          helpLevel={settings.trainingHelpLevel}
          onChangeHelpLevel={(level) => updateSetting('trainingHelpLevel', level)}
          lastAccuracy={lastAccuracy}
          onExit={onExitTraining}
        />
      )}
      <SpellStage
        trainingSpell={trainingSpell}
        onTrainingResult={(accuracy) => setLastAccuracy(accuracy)}
      />
    </div>
  );
}
