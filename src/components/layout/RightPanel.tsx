import { useAppState } from '@/app/useAppState';
import { EnergyBar } from '@/components/stats/EnergyBar';
import { CastMeters } from '@/components/stats/CastMeters';
import { ComboDisplay } from '@/components/stats/ComboDisplay';
import { HistoryList } from '@/components/stats/HistoryList';
import { QuickSettings } from '@/components/stats/QuickSettings';
import { Icon } from '@/components/common/Icon';
import './side-panel.css';

export interface RightPanelProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export function RightPanel({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  onOpenSettings,
}: RightPanelProps) {
  const { energy, maxEnergy, lastOutcome, progress } = useAppState();

  return (
    <>
      {mobileOpen && (
        <div className="side-panel-scrim" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`side-panel side-panel--right glass-panel ${collapsed ? 'side-panel--collapsed' : ''} ${mobileOpen ? 'side-panel--mobile-open' : ''}`}
        aria-label="Estatísticas"
      >
        <div className="side-panel__header">
          <h2>
            <Icon name="target" size={18} /> Estatísticas
          </h2>
          <div className="side-panel__header-actions">
            <button
              className="side-panel__close-mobile"
              onClick={onCloseMobile}
              aria-label="Fechar estatísticas"
            >
              <Icon name="close" size={18} />
            </button>
            <button
              className="side-panel__collapse"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expandir estatísticas' : 'Recolher estatísticas'}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
        {!collapsed && (
          <div className="side-panel__scroll">
            <EnergyBar energy={energy} maxEnergy={maxEnergy} />
            <CastMeters lastOutcome={lastOutcome} />
            <ComboDisplay
              currentStreak={progress.currentStreak}
              bestStreak={progress.bestStreak}
              level={progress.level}
              xp={progress.xp}
            />
            <HistoryList history={progress.castHistory} />
            <QuickSettings onOpenSettings={onOpenSettings} />
          </div>
        )}
      </aside>
    </>
  );
}
