import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { Gesture, Point, Stroke } from '@/types';
import { useDrawing } from './useDrawing';
import { renderAllStrokes } from './strokeRenderer';
import './drawing-canvas.css';

export interface DrawingCanvasHandle {
  clear: () => void;
  undoLastStroke: () => void;
  getGesture: () => Gesture;
  hasStrokes: () => boolean;
}

export interface DrawingCanvasProps {
  strokeColor?: string;
  glowColor?: string;
  baseWidth?: number;
  fadeTrail?: boolean;
  trailFadeMs?: number;
  disabled?: boolean;
  minPointDistance?: number;
  onStrokeStart?: () => void;
  onStrokeEnd?: (strokeCount: number) => void;
  onPointActivity?: (point: Point, stroke: Stroke) => void;
  onClear?: () => void;
  className?: string;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas(
    {
      strokeColor = '#c9a8ff',
      glowColor = '#7c3aed',
      baseWidth = 4,
      fadeTrail = false,
      trailFadeMs = 2200,
      disabled = false,
      minPointDistance = 2,
      onStrokeStart,
      onStrokeEnd,
      onPointActivity,
      onClear,
      className,
    },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | undefined>(undefined);

    const drawing = useDrawing({
      disabled,
      minPointDistance,
      onStrokeStart,
      onPointAdded: onPointActivity,
      onStrokeEnd: (_stroke, all) => onStrokeEnd?.(all.length),
      onClear,
    });

    useImperativeHandle(
      ref,
      () => ({
        clear: drawing.clear,
        undoLastStroke: drawing.undoLastStroke,
        hasStrokes: () => drawing.strokesRef.current.length > 0,
        getGesture: (): Gesture => ({
          strokes: drawing.strokesRef.current.map((s) => ({ ...s, points: [...s.points] })),
          createdAt: Date.now(),
        }),
      }),
      [drawing.clear, drawing.undoLastStroke, drawing.strokesRef],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { width, height } = container.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(width * dpr));
        canvas.height = Math.max(1, Math.round(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);
      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const loop = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        ctx.clearRect(0, 0, width, height);
        renderAllStrokes(ctx, drawing.strokesRef.current, drawing.currentStrokeRef.current, {
          color: strokeColor,
          glowColor,
          baseWidth,
          fadeTrail,
          trailFadeMs,
          now: performance.now(),
        });
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
      return () => {
        if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
      };
    }, [
      strokeColor,
      glowColor,
      baseWidth,
      fadeTrail,
      trailFadeMs,
      drawing.strokesRef,
      drawing.currentStrokeRef,
    ]);

    return (
      <div ref={containerRef} className={`drawing-canvas-container ${className ?? ''}`}>
        <canvas
          ref={canvasRef}
          className="drawing-canvas"
          role="img"
          aria-label="Área de desenho de símbolos mágicos"
          onPointerDown={drawing.onPointerDown}
          onPointerMove={drawing.onPointerMove}
          onPointerUp={drawing.onPointerUp}
          onPointerCancel={drawing.onPointerCancel}
          onPointerLeave={drawing.onPointerUp}
        />
      </div>
    );
  },
);
