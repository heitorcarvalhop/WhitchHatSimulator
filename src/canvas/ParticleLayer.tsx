import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { ParticleSystem, getPreset } from '@/particles';
import { FIZZLE_LAYER, SPELL_EFFECT_LAYERS } from '@/particles/spellEffectMap';
import type { EmitterOrigin } from '@/types';

export interface ParticleLayerHandle {
  emitSpellEffect: (spellId: string, origin: EmitterOrigin, powerMultiplier: number) => void;
  emitFizzle: (origin: EmitterOrigin) => void;
  emitCustom: (
    presetId: string,
    origin: EmitterOrigin,
    countMultiplier?: number,
    colorOverride?: string[],
  ) => void;
  setMaxParticles: (n: number) => void;
}

export interface ParticleLayerProps {
  className?: string;
  maxParticles?: number;
}

export const ParticleLayer = forwardRef<ParticleLayerHandle, ParticleLayerProps>(
  function ParticleLayer({ className, maxParticles = 600 }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const systemRef = useRef<ParticleSystem | null>(null);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      const system = new ParticleSystem(maxParticles);
      systemRef.current = system;
      void system.mount(container);
      return () => {
        system.destroy();
        systemRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      emitSpellEffect: (spellId, origin, powerMultiplier) => {
        const system = systemRef.current;
        if (!system) return;
        const layers = SPELL_EFFECT_LAYERS[spellId] ?? [];
        for (const layer of layers) {
          system.emit(getPreset(layer.presetId), origin, {
            countMultiplier: layer.countMultiplier * powerMultiplier,
            scaleMultiplier: Math.max(0.5, powerMultiplier),
            colorOverride: layer.colorOverride,
          });
        }
      },
      emitFizzle: (origin) => {
        const system = systemRef.current;
        if (!system) return;
        for (const layer of FIZZLE_LAYER) {
          system.emit(getPreset(layer.presetId), origin, {
            countMultiplier: layer.countMultiplier,
          });
        }
      },
      emitCustom: (presetId, origin, countMultiplier = 1, colorOverride) => {
        systemRef.current?.emit(getPreset(presetId), origin, { countMultiplier, colorOverride });
      },
      setMaxParticles: (n) => systemRef.current?.setMaxParticles(n),
    }));

    return (
      <div
        ref={containerRef}
        className={className}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      />
    );
  },
);
