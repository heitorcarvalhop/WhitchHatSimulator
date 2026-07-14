import { useCallback, useMemo, useRef, useState, type ComponentProps } from 'react';
import type { Gesture, Spell } from '@/types';
import { DrawingCanvas, type DrawingCanvasHandle } from '@/drawing/DrawingCanvas';
import { instantSpeed } from '@/drawing/strokeAnalysis';
import { MagicCircle } from '@/canvas/MagicCircle';
import { ParticleLayer, type ParticleLayerHandle } from '@/canvas/ParticleLayer';
import { useAppState } from '@/app/useAppState';
import { audioEngine } from '@/audio/AudioEngine';
import { soundElementFor } from '@/audio/soundPresets';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { mapRange } from '@/utils/math';
import { ActionButtons } from './ActionButtons';
import { RecognitionFeedback, type FeedbackState } from './RecognitionFeedback';
import { GuideOverlay } from '@/components/training/GuideOverlay';
import './spell-stage.css';

function gestureCentroid(gesture: Gesture): { x: number; y: number } {
  let x = 0;
  let y = 0;
  let count = 0;
  for (const stroke of gesture.strokes) {
    for (const p of stroke.points) {
      x += p.x;
      y += p.y;
      count += 1;
    }
  }
  if (count === 0) return { x: 0, y: 0 };
  return { x: x / count, y: y / count };
}

export interface SpellStageProps {
  trainingSpell?: Spell | null;
  onTrainingResult?: (accuracy: number, usedGuide: boolean) => void;
}

export function SpellStage({ trainingSpell = null, onTrainingResult }: SpellStageProps) {
  const { settings, energy, maxEnergy, resolveCast, commitCastOutcome, spellsById } = useAppState();

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const particleRef = useRef<ParticleLayerHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gestureStartRef = useRef<number | null>(null);
  const pointCounterRef = useRef(0);
  const lastSuccessRef = useRef<{ gesture: Gesture } | null>(null);

  const [strokeCount, setStrokeCount] = useState(0);
  const [isCasting, setIsCasting] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [flash, setFlash] = useState<{ color: string; key: number } | null>(null);
  const [activeColor, setActiveColor] = useState('#c9a8ff');
  const [feedback, setFeedback] = useState<FeedbackState>({ status: 'idle' });
  const [canRepeat, setCanRepeat] = useState(false);

  const energyRatio = maxEnergy > 0 ? energy / maxEnergy : 0;

  const handleStrokeStart = useCallback(() => {
    if (gestureStartRef.current === null) gestureStartRef.current = performance.now();
    audioEngine.startDrawingHum();
  }, []);

  const handlePointActivity = useCallback<
    NonNullable<ComponentProps<typeof DrawingCanvas>['onPointActivity']>
  >(
    (point, stroke) => {
      pointCounterRef.current += 1;
      if (pointCounterRef.current % 2 === 0 && particleRef.current) {
        particleRef.current.emitCustom('spark', point, 0.12, [activeColor]);
      }
      const pts = stroke.points;
      if (pts.length >= 2) {
        const speed = instantSpeed(pts[pts.length - 2]!, pts[pts.length - 1]!);
        audioEngine.updateDrawingHum(speed);
      }
    },
    [activeColor],
  );

  const handleStrokeEnd = useCallback((count: number) => {
    setStrokeCount(count);
    audioEngine.stopDrawingHum();
  }, []);

  const resetGesture = useCallback(() => {
    gestureStartRef.current = null;
    setStrokeCount(0);
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    resetGesture();
    setFeedback({ status: 'idle' });
  }, [resetGesture]);

  const handleUndo = useCallback(() => {
    canvasRef.current?.undoLastStroke();
    setStrokeCount((c) => {
      const next = Math.max(0, c - 1);
      if (next === 0) gestureStartRef.current = null;
      return next;
    });
  }, []);

  const triggerShake = useCallback(() => {
    if (settings.reducedMotion || !settings.screenShake) return;
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, [settings.reducedMotion, settings.screenShake]);

  const triggerFlash = useCallback(
    (color: string) => {
      if (settings.reducedFlash) return;
      setFlash({ color, key: Date.now() });
    },
    [settings.reducedFlash],
  );

  const runCast = useCallback(
    (gesture: Gesture, isRepeat: boolean) => {
      const drawDurationMs = gestureStartRef.current
        ? performance.now() - gestureStartRef.current
        : (gesture.strokes[0]?.points.at(-1)?.t ?? 0) - (gesture.strokes[0]?.points[0]?.t ?? 0);

      setIsCasting(true);
      const outcome = resolveCast(gesture, Math.max(0, drawDurationMs), {
        isTrainingMode: !!trainingSpell,
        usedGuide: settings.trainingHelpLevel !== 'none',
      });

      const centroid = gestureCentroid(gesture);
      const stageBounds = stageRef.current?.getBoundingClientRect();
      const pan = stageBounds ? mapRange(centroid.x, 0, stageBounds.width, -1, 1) : 0;

      if (!outcome.spell) {
        particleRef.current?.emitFizzle(centroid);
        audioEngine.playFailure();
        setFeedback({
          status: 'fail',
          message: outcome.recognition.rejectionReason,
          candidates: outcome.recognition.candidates
            .map((c) => ({ name: spellsById[c.templateId]?.name ?? c.templateId, score: c.score }))
            .filter((c) => c.score > 0.15),
        });
      } else if (!outcome.energySufficient) {
        audioEngine.playFailure();
        setFeedback({
          status: 'blocked',
          message: outcome.blockedReason,
          spellName: outcome.spell.name,
          color: outcome.spell.color,
        });
      } else if (outcome.computation) {
        const { spell, computation } = outcome;
        setActiveColor(spell.color);

        if (computation.tier === 'fail') {
          particleRef.current?.emitFizzle(centroid);
        } else {
          particleRef.current?.emitSpellEffect(spell.id, centroid, computation.particleMultiplier);
        }
        audioEngine.playElementSound(soundElementFor(spell), computation.tier, pan);

        if (outcome.combination) {
          const [idA, idB] = outcome.combination.spellIds;
          const spellA = spellsById[idA];
          const spellB = spellsById[idB];
          const elA = spellA ? soundElementFor(spellA) : spell.element;
          const elB = spellB ? soundElementFor(spellB) : spell.element;
          setTimeout(() => {
            particleRef.current?.emitCustom(outcome.combination!.particlePresetId, centroid, 1.4, [
              outcome.combination!.color,
            ]);
            audioEngine.playCombinationSound([elA, elB], pan);
          }, 140);
        }
        if (computation.tier === 'perfect' || computation.tier === 'legendary') {
          audioEngine.playPerfect();
        }
        if (outcome.isNewSpellDiscovery) {
          audioEngine.playDiscovery();
        }
        if (
          computation.tier === 'powerful' ||
          computation.tier === 'perfect' ||
          computation.tier === 'legendary' ||
          outcome.combination
        ) {
          triggerShake();
          triggerFlash(spell.color);
        }

        setFeedback({
          status: computation.tier === 'fail' ? 'fail' : 'success',
          spellName: spell.name,
          color: spell.color,
          accuracy: outcome.result?.accuracy,
          tier: computation.tier,
          comboName: outcome.combination?.name,
        });

        if (computation.tier !== 'fail') {
          lastSuccessRef.current = { gesture };
          setCanRepeat(true);
        }

        if (trainingSpell && outcome.result) {
          onTrainingResult?.(outcome.result.accuracy, settings.trainingHelpLevel !== 'none');
        }
      }

      commitCastOutcome(outcome);
      if (!isRepeat) {
        canvasRef.current?.clear();
        resetGesture();
      }
      setTimeout(() => setIsCasting(false), 550);
    },
    [
      resolveCast,
      commitCastOutcome,
      settings.trainingHelpLevel,
      trainingSpell,
      onTrainingResult,
      spellsById,
      resetGesture,
      triggerShake,
      triggerFlash,
    ],
  );

  const handleExecute = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.hasStrokes()) return;
    runCast(canvas.getGesture(), false);
  }, [runCast]);

  const handleRepeat = useCallback(() => {
    if (!lastSuccessRef.current) return;
    runCast(lastSuccessRef.current.gesture, true);
  }, [runCast]);

  useKeyboardShortcuts(
    useMemo(
      () => ({
        enter: handleExecute,
        escape: handleClear,
        'ctrl+z': handleUndo,
        r: handleRepeat,
      }),
      [handleExecute, handleClear, handleUndo, handleRepeat],
    ),
  );

  return (
    <div
      ref={stageRef}
      className={`spell-stage ${shaking ? 'af-anim-shake' : ''}`}
      style={{ ['--af-anim-speed' as string]: settings.animationSpeed }}
    >
      {flash && (
        <div
          key={flash.key}
          className="af-screen-flash"
          style={{ background: flash.color, ['--flash-peak' as string]: settings.flashIntensity }}
          onAnimationEnd={() => setFlash(null)}
        />
      )}

      <div className="spell-stage__circle-wrap">
        <MagicCircle
          color={activeColor}
          energyRatio={energyRatio}
          isCasting={isCasting}
          reducedMotion={settings.reducedMotion}
        />
        {trainingSpell && (
          <GuideOverlay spell={trainingSpell} helpLevel={settings.trainingHelpLevel} />
        )}
        <ParticleLayer ref={particleRef} maxParticles={settings.maxParticles} />
        <DrawingCanvas
          ref={canvasRef}
          strokeColor={activeColor}
          glowColor={activeColor}
          baseWidth={settings.strokeWidth}
          minPointDistance={mapRange(settings.drawingSensitivity, 0, 1, 6, 1)}
          onStrokeStart={handleStrokeStart}
          onStrokeEnd={handleStrokeEnd}
          onPointActivity={handlePointActivity}
        />
      </div>

      <RecognitionFeedback state={feedback} />

      <ActionButtons
        onClear={handleClear}
        onExecute={handleExecute}
        onUndo={handleUndo}
        onRepeat={handleRepeat}
        canExecute={strokeCount > 0}
        canUndo={strokeCount > 0}
        canRepeat={canRepeat}
      />
    </div>
  );
}
