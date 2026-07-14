import { GrimoireList } from '@/components/grimoire/GrimoireList';
import { Icon } from '@/components/common/Icon';
import './side-panel.css';

export interface LeftPanelProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onTrain: (spellId: string) => void;
}

export function LeftPanel({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  onTrain,
}: LeftPanelProps) {
  return (
    <>
      {mobileOpen && (
        <div className="side-panel-scrim" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`side-panel side-panel--left glass-panel ${collapsed ? 'side-panel--collapsed' : ''} ${mobileOpen ? 'side-panel--mobile-open' : ''}`}
        aria-label="Grimório"
      >
        <div className="side-panel__header">
          <h2>
            <Icon name="book" size={18} /> Grimório
          </h2>
          <div className="side-panel__header-actions">
            <button
              className="side-panel__close-mobile"
              onClick={onCloseMobile}
              aria-label="Fechar grimório"
            >
              <Icon name="close" size={18} />
            </button>
            <button
              className="side-panel__collapse"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expandir grimório' : 'Recolher grimório'}
            >
              <Icon name="chevron-left" size={16} />
            </button>
          </div>
        </div>
        {!collapsed && <GrimoireList onTrain={onTrain} />}
      </aside>
    </>
  );
}
