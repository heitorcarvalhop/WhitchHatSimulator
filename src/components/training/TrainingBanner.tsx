import type { HelpLevel, Spell } from '@/types';
import { Button } from '@/components/common/Button';
import './training-banner.css';

const HELP_LEVELS: Array<{ value: HelpLevel; label: string }> = [
  { value: 'full-guide', label: 'Guia completo' },
  { value: 'key-points', label: 'Pontos principais' },
  { value: 'ghost-symbol', label: 'Símbolo transparente' },
  { value: 'none', label: 'Sem ajuda' },
];

export interface TrainingBannerProps {
  spell: Spell;
  helpLevel: HelpLevel;
  onChangeHelpLevel: (level: HelpLevel) => void;
  lastAccuracy: number | null;
  onExit: () => void;
}

export function TrainingBanner({
  spell,
  helpLevel,
  onChangeHelpLevel,
  lastAccuracy,
  onExit,
}: TrainingBannerProps) {
  return (
    <div className="training-banner glass-panel af-anim-slide-up">
      <div className="training-banner__info">
        <strong style={{ color: spell.color }}>Treinando: {spell.name}</strong>
        {lastAccuracy !== null && <span>Última tentativa: {Math.round(lastAccuracy * 100)}%</span>}
      </div>
      <div className="training-banner__help">
        {HELP_LEVELS.map((h) => (
          <button
            key={h.value}
            className={`training-banner__chip ${helpLevel === h.value ? 'is-active' : ''}`}
            onClick={() => onChangeHelpLevel(h.value)}
          >
            {h.label}
          </button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onExit}>
        Sair do treino
      </Button>
    </div>
  );
}
