import type { SpellElement, SpellTier } from '@/types';
import { clamp, mapRange, randomBetween } from '@/utils/math';
import { ELEMENT_TONE_PRESETS, UI_TONE_PRESETS, type TonePreset } from './soundPresets';

const TIER_GAIN: Record<SpellTier, number> = {
  fail: 0.55,
  unstable: 0.7,
  common: 0.85,
  powerful: 1,
  perfect: 1.15,
  legendary: 1.35,
};

const TIER_DETUNE_CENTS: Record<SpellTier, number> = {
  fail: -60,
  unstable: -25,
  common: 0,
  powerful: 0,
  perfect: 4,
  legendary: 10,
};

let noiseBufferCache: AudioBuffer | null = null;

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBufferCache && noiseBufferCache.sampleRate === ctx.sampleRate) return noiseBufferCache;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBufferCache = buffer;
  return buffer;
}

/** Every effect is synthesized at runtime from oscillators + filtered noise — no external audio assets needed. */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private effectsGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  private masterVolume = 0.8;
  private effectsVolume = 0.9;
  private ambientVolume = 0.5;
  private muted = false;

  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private humFilter: BiquadFilterNode | null = null;

  ensureContext(): AudioContext {
    if (!this.ctx) {
      const ctx = new AudioContext();
      const master = ctx.createGain();
      const effects = ctx.createGain();
      const ambient = ctx.createGain();
      effects.connect(master);
      ambient.connect(master);
      master.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = master;
      this.effectsGain = effects;
      this.ambientGain = ambient;
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private applyVolumes(): void {
    if (!this.masterGain || !this.effectsGain || !this.ambientGain) return;
    this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
    this.effectsGain.gain.value = this.effectsVolume;
    this.ambientGain.gain.value = this.ambientVolume;
  }

  setMasterVolume(v: number): void {
    this.masterVolume = clamp(v, 0, 1);
    this.applyVolumes();
  }

  setEffectsVolume(v: number): void {
    this.effectsVolume = clamp(v, 0, 1);
    this.applyVolumes();
  }

  setAmbientVolume(v: number): void {
    this.ambientVolume = clamp(v, 0, 1);
    this.applyVolumes();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyVolumes();
  }

  private playTone(
    preset: TonePreset,
    options: { gainScale?: number; pan?: number; detuneCents?: number } = {},
  ): void {
    const ctx = this.ensureContext();
    if (!this.effectsGain) return;

    const now = ctx.currentTime;
    const gainScale = options.gainScale ?? 1;
    const pan = clamp(options.pan ?? 0, -1, 1);

    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;

    const filter = ctx.createBiquadFilter();
    filter.type = preset.filterType;
    filter.frequency.value = preset.filterFrequency;
    filter.connect(panner);
    panner.connect(this.effectsGain);

    const envelope = ctx.createGain();
    envelope.gain.value = 0;
    envelope.connect(filter);

    const peak = 0.28 * gainScale;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(peak, now + Math.max(0.001, preset.attack));
    envelope.gain.linearRampToValueAtTime(
      peak * (0.001 + preset.sustain),
      now + preset.attack + preset.decay,
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration + preset.release);

    for (const freq of preset.frequencies) {
      const osc = ctx.createOscillator();
      osc.type = preset.shape;
      const randomDetune =
        randomBetween(-preset.detune, preset.detune) + (options.detuneCents ?? 0);
      osc.frequency.value = freq;
      osc.detune.value = randomDetune;
      osc.connect(envelope);
      osc.start(now);
      osc.stop(now + preset.duration + preset.release + 0.05);
    }

    if (preset.noiseMix > 0) {
      const noise = ctx.createBufferSource();
      noise.buffer = getNoiseBuffer(ctx);
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = preset.noiseFilterType;
      noiseFilter.frequency.value = preset.noiseFilterFrequency;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(filter);

      const noisePeak = peak * preset.noiseMix;
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(noisePeak, now + Math.max(0.001, preset.attack));
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration + preset.release);

      noise.start(now);
      noise.stop(now + preset.duration + preset.release + 0.05);
    }
  }

  playElementSound(element: SpellElement, tier: SpellTier, pan = 0): void {
    const preset = ELEMENT_TONE_PRESETS[element];
    this.playTone(preset, {
      gainScale: TIER_GAIN[tier],
      pan,
      detuneCents: TIER_DETUNE_CENTS[tier],
    });
  }

  playCombinationSound(elements: [SpellElement, SpellElement], pan = 0): void {
    this.ensureContext();
    this.playTone(ELEMENT_TONE_PRESETS[elements[0]], { gainScale: 1.2, pan, detuneCents: 6 });
    setTimeout(() => {
      this.playTone(ELEMENT_TONE_PRESETS[elements[1]], {
        gainScale: 1.1,
        pan: -pan,
        detuneCents: -6,
      });
    }, 90);
  }

  playFailure(): void {
    this.playTone(UI_TONE_PRESETS.failure!);
  }

  playPerfect(): void {
    this.playTone(UI_TONE_PRESETS.perfect!);
  }

  playDiscovery(): void {
    this.playTone(UI_TONE_PRESETS.discovery!);
  }

  playUiClick(): void {
    this.playTone(UI_TONE_PRESETS.click!, { gainScale: 0.6 });
  }

  playUiHover(): void {
    this.playTone(UI_TONE_PRESETS.hover!, { gainScale: 0.3 });
  }

  startDrawingHum(): void {
    const ctx = this.ensureContext();
    if (!this.effectsGain || this.humOsc) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    osc.type = 'sine';
    osc.frequency.value = 180;
    gain.gain.value = 0;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.effectsGain);
    osc.start();

    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.08);

    this.humOsc = osc;
    this.humGain = gain;
    this.humFilter = filter;
  }

  updateDrawingHum(speed: number): void {
    if (!this.ctx || !this.humOsc || !this.humFilter || !this.humGain) return;
    const freq = mapRange(clamp(speed, 0, 3), 0, 3, 160, 520);
    this.humOsc.frequency.linearRampToValueAtTime(freq, this.ctx.currentTime + 0.05);
    this.humFilter.frequency.linearRampToValueAtTime(600 + freq * 2, this.ctx.currentTime + 0.05);
    const gainTarget = mapRange(clamp(speed, 0, 3), 0, 3, 0.03, 0.09);
    this.humGain.gain.linearRampToValueAtTime(gainTarget, this.ctx.currentTime + 0.05);
  }

  stopDrawingHum(): void {
    if (!this.ctx || !this.humOsc || !this.humGain) return;
    const ctx = this.ctx;
    const osc = this.humOsc;
    const gain = this.humGain;
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
    osc.stop(ctx.currentTime + 0.2);
    this.humOsc = null;
    this.humGain = null;
    this.humFilter = null;
  }

  playCharge(progress: number, pan = 0): void {
    const preset = UI_TONE_PRESETS.charge!;
    this.playTone(preset, { gainScale: 0.4 + progress * 0.4, pan, detuneCents: progress * 40 });
  }
}

export const audioEngine = new AudioEngine();
