export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type HelpLevel = 'full-guide' | 'key-points' | 'ghost-symbol' | 'none';
export type SupportedLanguage = 'pt-BR' | 'en-US';

export interface UserSettings {
  version: number;
  graphicsQuality: GraphicsQuality;
  maxParticles: number;
  flashIntensity: number;
  screenShake: boolean;
  masterVolume: number;
  effectsVolume: number;
  ambientVolume: number;
  muted: boolean;
  drawingSensitivity: number;
  recognitionTolerance: number;
  strokeWidth: number;
  animationSpeed: number;
  highContrast: boolean;
  reducedMotion: boolean;
  reducedFlash: boolean;
  vibration: boolean;
  showFps: boolean;
  language: SupportedLanguage;
  trainingHelpLevel: HelpLevel;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
}
