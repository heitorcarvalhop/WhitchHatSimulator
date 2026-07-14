import { useCallback, useRef, useState } from 'react';
import type { Point, Stroke } from '@/types';
import { createId } from '@/utils/id';

export interface UseDrawingOptions {
  disabled?: boolean;
  minPointDistance?: number;
  onStrokeStart?: (stroke: Stroke) => void;
  onPointAdded?: (point: Point, stroke: Stroke) => void;
  onStrokeEnd?: (stroke: Stroke, allStrokes: Stroke[]) => void;
  onClear?: () => void;
}

export interface UseDrawingResult {
  strokesRef: React.MutableRefObject<Stroke[]>;
  currentStrokeRef: React.MutableRefObject<Stroke | null>;
  strokeCount: number;
  isDrawing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLCanvasElement>) => void;
  clear: () => void;
  undoLastStroke: () => void;
}

function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>): Point {
  const rect = e.currentTarget.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    t: performance.now(),
    pressure: e.pressure > 0 ? e.pressure : 0.5,
  };
}

/** Strokes are kept in mutable refs, not React state, so the canvas render loop can read them every frame without a re-render on every pointer move. */
export function useDrawing(options: UseDrawingOptions = {}): UseDrawingResult {
  const {
    disabled = false,
    minPointDistance = 2,
    onStrokeStart,
    onPointAdded,
    onStrokeEnd,
    onClear,
  } = options;

  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const activePointerId = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      activePointerId.current = e.pointerId;

      const point = pointFromEvent(e);
      const stroke: Stroke = {
        id: createId('stroke'),
        points: [point],
        startTime: point.t,
        endTime: point.t,
      };
      currentStrokeRef.current = stroke;
      setIsDrawing(true);
      onStrokeStart?.(stroke);
      onPointAdded?.(point, stroke);
    },
    [disabled, onStrokeStart, onPointAdded],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const stroke = currentStrokeRef.current;
      if (!stroke || disabled || activePointerId.current !== e.pointerId) return;

      const events = e.nativeEvent.getCoalescedEvents
        ? e.nativeEvent.getCoalescedEvents()
        : [e.nativeEvent];
      const rect = e.currentTarget.getBoundingClientRect();

      for (const native of events.length > 0 ? events : [e.nativeEvent]) {
        const point: Point = {
          x: native.clientX - rect.left,
          y: native.clientY - rect.top,
          t: performance.now(),
          pressure: native.pressure > 0 ? native.pressure : 0.5,
        };
        const last = stroke.points[stroke.points.length - 1];
        if (last) {
          const dist = Math.hypot(point.x - last.x, point.y - last.y);
          if (dist < minPointDistance) continue;
        }
        stroke.points.push(point);
        stroke.endTime = point.t;
        onPointAdded?.(point, stroke);
      }
    },
    [disabled, minPointDistance, onPointAdded],
  );

  const finishStroke = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const stroke = currentStrokeRef.current;
      if (!stroke || activePointerId.current !== e.pointerId) return;

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture may already be released by the browser
      }
      activePointerId.current = null;
      currentStrokeRef.current = null;
      setIsDrawing(false);

      if (stroke.points.length >= 2) {
        strokesRef.current = [...strokesRef.current, stroke];
        setStrokeCount(strokesRef.current.length);
        onStrokeEnd?.(stroke, strokesRef.current);
      }
    },
    [onStrokeEnd],
  );

  const clear = useCallback(() => {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setStrokeCount(0);
    setIsDrawing(false);
    onClear?.();
  }, [onClear]);

  const undoLastStroke = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokeCount(strokesRef.current.length);
  }, []);

  return {
    strokesRef,
    currentStrokeRef,
    strokeCount,
    isDrawing,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishStroke,
    onPointerCancel: finishStroke,
    clear,
    undoLastStroke,
  };
}
