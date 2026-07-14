import { useAppState } from '@/app/useAppState';
import { Icon } from '@/components/common/Icon';
import './quick-settings.css';

export interface QuickSettingsProps {
  onOpenSettings: () => void;
}

export function QuickSettings({ onOpenSettings }: QuickSettingsProps) {
  const { settings, updateSetting } = useAppState();

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };

  return (
    <div className="quick-settings">
      <button
        className="quick-settings__btn"
        onClick={() => updateSetting('muted', !settings.muted)}
        aria-pressed={settings.muted}
        aria-label={settings.muted ? 'Reativar som' : 'Silenciar'}
        title={settings.muted ? 'Reativar som' : 'Silenciar'}
      >
        <Icon name={settings.muted ? 'mute' : 'volume'} size={17} />
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={settings.masterVolume}
        onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
        aria-label="Volume geral"
        className="quick-settings__slider"
      />
      <button
        className="quick-settings__btn"
        onClick={toggleFullscreen}
        aria-label="Tela cheia"
        title="Tela cheia"
      >
        <Icon name="fullscreen" size={17} />
      </button>
      <button
        className="quick-settings__btn"
        onClick={onOpenSettings}
        aria-label="Configurações"
        title="Configurações"
      >
        <Icon name="settings" size={17} />
      </button>
    </div>
  );
}
