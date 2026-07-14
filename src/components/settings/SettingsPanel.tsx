import { useRef, useState } from 'react';
import { useAppState } from '@/app/useAppState';
import { Modal } from '@/components/common/Modal';
import { Toggle } from '@/components/common/Toggle';
import { Slider } from '@/components/common/Slider';
import { Button } from '@/components/common/Button';
import { exportAllData, importAllData, resetAllData } from '@/storage/storage';
import type { GraphicsQuality, SupportedLanguage } from '@/types';
import './settings-panel.css';

export interface SettingsPanelProps {
  onClose: () => void;
}

const GRAPHICS_OPTIONS: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra'];
const GRAPHICS_LABELS: Record<GraphicsQuality, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  ultra: 'Ultra',
};
const GRAPHICS_PARTICLES: Record<GraphicsQuality, number> = {
  low: 150,
  medium: 350,
  high: 600,
  ultra: 900,
};

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSetting, resetSettings, pushToast } = useAppState();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arcane-forge-progresso.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importAllData(String(reader.result));
      if (result.success) {
        pushToast(
          'info',
          'Progresso importado',
          'Recarregue a página para aplicar os dados importados.',
        );
      } else {
        pushToast('warning', 'Falha ao importar', result.error ?? 'Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    resetAllData();
    resetSettings();
    setConfirmingReset(false);
    pushToast('info', 'Dados restaurados', 'Recarregue a página para começar do zero.');
  };

  return (
    <Modal title="Configurações" onClose={onClose} size="lg">
      <div className="settings-panel">
        <section>
          <h3>Gráficos</h3>
          <label className="settings-panel__select">
            Qualidade gráfica
            <select
              value={settings.graphicsQuality}
              onChange={(e) => {
                const quality = e.target.value as GraphicsQuality;
                updateSetting('graphicsQuality', quality);
                updateSetting('maxParticles', GRAPHICS_PARTICLES[quality]);
              }}
            >
              {GRAPHICS_OPTIONS.map((q) => (
                <option key={q} value={q}>
                  {GRAPHICS_LABELS[q]}
                </option>
              ))}
            </select>
          </label>
          <Slider
            label="Quantidade máxima de partículas"
            value={settings.maxParticles}
            min={50}
            max={1200}
            step={50}
            onChange={(v) => updateSetting('maxParticles', v)}
          />
          <Slider
            label="Intensidade dos flashes"
            value={settings.flashIntensity}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSetting('flashIntensity', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Toggle
            label="Vibração de tela"
            checked={settings.screenShake}
            onChange={(v) => updateSetting('screenShake', v)}
          />
          <Slider
            label="Velocidade das animações"
            value={settings.animationSpeed}
            min={0.5}
            max={2}
            step={0.1}
            onChange={(v) => updateSetting('animationSpeed', v)}
            formatValue={(v) => `${v.toFixed(1)}x`}
          />
        </section>

        <section>
          <h3>Áudio</h3>
          <Toggle
            label="Silenciar"
            checked={settings.muted}
            onChange={(v) => updateSetting('muted', v)}
          />
          <Slider
            label="Volume geral"
            value={settings.masterVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSetting('masterVolume', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Volume de efeitos"
            value={settings.effectsVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSetting('effectsVolume', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Volume ambiente"
            value={settings.ambientVolume}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSetting('ambientVolume', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
        </section>

        <section>
          <h3>Desenho e reconhecimento</h3>
          <Slider
            label="Sensibilidade do desenho"
            value={settings.drawingSensitivity}
            min={0}
            max={1}
            step={0.05}
            onChange={(v) => updateSetting('drawingSensitivity', v)}
          />
          <Slider
            label="Tolerância do reconhecimento"
            value={settings.recognitionTolerance}
            min={0.2}
            max={0.85}
            step={0.02}
            onChange={(v) => updateSetting('recognitionTolerance', v)}
            formatValue={(v) => `${Math.round(v * 100)}%`}
          />
          <Slider
            label="Espessura do traço"
            value={settings.strokeWidth}
            min={2}
            max={12}
            step={1}
            onChange={(v) => updateSetting('strokeWidth', v)}
          />
        </section>

        <section>
          <h3>Acessibilidade</h3>
          <Toggle
            label="Modo de alto contraste"
            checked={settings.highContrast}
            onChange={(v) => updateSetting('highContrast', v)}
          />
          <Toggle
            label="Reduzir movimento"
            checked={settings.reducedMotion}
            onChange={(v) => updateSetting('reducedMotion', v)}
            description="Desativa animações e rotações contínuas"
          />
          <Toggle
            label="Reduzir flashes"
            checked={settings.reducedFlash}
            onChange={(v) => updateSetting('reducedFlash', v)}
            description="Remove clarões de tela cheia"
          />
          <Toggle
            label="Vibração do dispositivo"
            checked={settings.vibration}
            onChange={(v) => updateSetting('vibration', v)}
          />
          <Toggle
            label="Exibir FPS"
            checked={settings.showFps}
            onChange={(v) => updateSetting('showFps', v)}
          />
          <label className="settings-panel__select">
            Idioma
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value as SupportedLanguage)}
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
            </select>
          </label>
        </section>

        <section>
          <h3>Dados</h3>
          <div className="settings-panel__data-actions">
            <Button icon="download" variant="ghost" size="sm" onClick={handleExport}>
              Exportar progresso
            </Button>
            <Button
              icon="upload"
              variant="ghost"
              size="sm"
              onClick={() => importInputRef.current?.click()}
            >
              Importar progresso
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="visually-hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {!confirmingReset ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmingReset(true)}
              className="settings-panel__reset-btn"
            >
              Restaurar padrões
            </Button>
          ) : (
            <div className="settings-panel__confirm">
              <span>Isso apagará todo o progresso local. Tem certeza?</span>
              <Button variant="danger" size="sm" onClick={handleResetConfirm}>
                Sim, apagar tudo
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
