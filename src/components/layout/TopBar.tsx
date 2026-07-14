import { APP_CONFIG } from '@/config/appConfig';
import { useAppState } from '@/app/useAppState';
import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/common/Button';
import './top-bar.css';

export type AppView = 'play' | 'lab';

export interface TopBarProps {
  view: AppView;
  onChangeView: (view: AppView) => void;
  onToggleLeftDrawer: () => void;
  onToggleRightDrawer: () => void;
  onOpenChallenges: () => void;
}

export function TopBar({
  view,
  onChangeView,
  onToggleLeftDrawer,
  onToggleRightDrawer,
  onOpenChallenges,
}: TopBarProps) {
  const { progress } = useAppState();

  return (
    <header className="top-bar glass-panel">
      <button
        className="top-bar__menu-btn"
        onClick={onToggleLeftDrawer}
        aria-label="Abrir grimório"
      >
        <Icon name="book" size={20} />
      </button>

      <div className="top-bar__brand">
        <span className="top-bar__sigil" aria-hidden="true">
          ✦
        </span>
        <div>
          <h1 className="top-bar__title">{APP_CONFIG.name}</h1>
          <p className="top-bar__subtitle">{APP_CONFIG.subtitle}</p>
        </div>
      </div>

      <nav className="top-bar__nav" aria-label="Navegação principal">
        <Button
          variant={view === 'play' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChangeView('play')}
        >
          Jogar
        </Button>
        <Button
          variant={view === 'lab' ? 'primary' : 'ghost'}
          size="sm"
          icon="flask"
          onClick={() => onChangeView('lab')}
        >
          Laboratório
        </Button>
      </nav>

      <button
        className="top-bar__level"
        onClick={onOpenChallenges}
        title={`${progress.xp} XP total — ver desafios`}
      >
        <Icon name="trophy" size={16} />
        <span>Nível {progress.level}</span>
      </button>

      <button
        className="top-bar__menu-btn"
        onClick={onToggleRightDrawer}
        aria-label="Abrir estatísticas"
      >
        <Icon name="target" size={20} />
      </button>
    </header>
  );
}
