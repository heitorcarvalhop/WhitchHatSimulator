import { useState, type ReactNode } from 'react';
import { useAppState } from '@/app/useAppState';
import { TopBar, type AppView } from './TopBar';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { MobileNav } from './MobileNav';
import './app-shell.css';

export interface AppShellProps {
  view: AppView;
  onChangeView: (view: AppView) => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
  onTrainSpell: (spellId: string) => void;
  children: ReactNode;
}

export function AppShell({
  view,
  onChangeView,
  onOpenSettings,
  onOpenChallenges,
  onTrainSpell,
  children,
}: AppShellProps) {
  const { settings, updateSetting } = useAppState();
  const [mobileDrawer, setMobileDrawer] = useState<'left' | 'right' | null>(null);

  return (
    <div className="app-shell">
      <TopBar
        view={view}
        onChangeView={onChangeView}
        onToggleLeftDrawer={() => setMobileDrawer((d) => (d === 'left' ? null : 'left'))}
        onToggleRightDrawer={() => setMobileDrawer((d) => (d === 'right' ? null : 'right'))}
        onOpenChallenges={onOpenChallenges}
      />
      <div className="app-shell__body">
        {view === 'play' && (
          <LeftPanel
            collapsed={settings.leftPanelCollapsed}
            onToggleCollapsed={() =>
              updateSetting('leftPanelCollapsed', !settings.leftPanelCollapsed)
            }
            mobileOpen={mobileDrawer === 'left'}
            onCloseMobile={() => setMobileDrawer(null)}
            onTrain={(id) => {
              onTrainSpell(id);
              setMobileDrawer(null);
            }}
          />
        )}
        <main id="main-content" className="app-shell__center" tabIndex={-1}>
          {children}
        </main>
        {view === 'play' && (
          <RightPanel
            collapsed={settings.rightPanelCollapsed}
            onToggleCollapsed={() =>
              updateSetting('rightPanelCollapsed', !settings.rightPanelCollapsed)
            }
            mobileOpen={mobileDrawer === 'right'}
            onCloseMobile={() => setMobileDrawer(null)}
            onOpenSettings={onOpenSettings}
          />
        )}
      </div>
      <MobileNav
        view={view}
        onChangeView={onChangeView}
        onOpenLeft={() => setMobileDrawer('left')}
        onOpenRight={() => setMobileDrawer('right')}
      />
    </div>
  );
}
