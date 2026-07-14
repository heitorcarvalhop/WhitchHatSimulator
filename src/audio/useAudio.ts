import { useEffect } from 'react';
import { audioEngine } from './AudioEngine';
import type { UserSettings } from '@/types';

export function useAudioSync(
  settings: Pick<UserSettings, 'masterVolume' | 'effectsVolume' | 'ambientVolume' | 'muted'>,
): void {
  useEffect(() => {
    audioEngine.setMasterVolume(settings.masterVolume);
  }, [settings.masterVolume]);

  useEffect(() => {
    audioEngine.setEffectsVolume(settings.effectsVolume);
  }, [settings.effectsVolume]);

  useEffect(() => {
    audioEngine.setAmbientVolume(settings.ambientVolume);
  }, [settings.ambientVolume]);

  useEffect(() => {
    audioEngine.setMuted(settings.muted);
  }, [settings.muted]);
}
