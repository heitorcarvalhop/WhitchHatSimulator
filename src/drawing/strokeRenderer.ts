import type { Point, Stroke } from '@/types';
import { clamp, mapRange } from '@/utils/math';
import { instantSpeed } from './strokeAnalysis';

export interface StrokeRenderOptions {
  color: string;
  glowColor: string;
  baseWidth: number;
  fadeTrail: boolean;
  trailFadeMs: number;
  now: number;
}

const MIN_SPEED_WIDTH = 0.55;
const MAX_SPEED_WIDTH = 1.35;
const SPEED_NORMALIZER = 1.6;

function widthForSpeed(speed: number, baseWidth: number): number {
  const factor = clamp(
    mapRange(speed, 0, SPEED_NORMALIZER, MAX_SPEED_WIDTH, MIN_SPEED_WIDTH),
    MIN_SPEED_WIDTH,
    MAX_SPEED_WIDTH,
  );
  return baseWidth * factor;
}

function alphaForAge(point: Point, options: StrokeRenderOptions): number {
  if (!options.fadeTrail) return 1;
  const age = options.now - point.t;
  return clamp(1 - age / options.trailFadeMs, 0, 1);
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  width: number,
  alpha: number,
  options: StrokeRenderOptions,
) {
  if (alpha <= 0) return;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Outer glow pass
  ctx.strokeStyle = options.glowColor;
  ctx.lineWidth = width * 3;
  ctx.shadowColor = options.glowColor;
  ctx.shadowBlur = width * 4;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(a.x, a.y, midX, midY);
  ctx.stroke();

  // Bright energy core
  ctx.strokeStyle = options.color;
  ctx.lineWidth = width;
  ctx.shadowBlur = width * 1.5;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.quadraticCurveTo(a.x, a.y, midX, midY);
  ctx.stroke();

  ctx.restore();
}

export function renderStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  options: StrokeRenderOptions,
): void {
  const { points } = stroke;
  if (points.length < 2) {
    if (points.length === 1) {
      const p = points[0]!;
      const alpha = alphaForAge(p, options);
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = options.color;
      ctx.shadowColor = options.glowColor;
      ctx.shadowBlur = options.baseWidth * 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, options.baseWidth * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    return;
  }

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    const speed = instantSpeed(a, b);
    const width = widthForSpeed(speed, options.baseWidth);
    const alpha = Math.min(alphaForAge(a, options), alphaForAge(b, options));
    drawSegment(ctx, a, b, width, alpha, options);
  }
}

export function renderAllStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  currentStroke: Stroke | null,
  options: StrokeRenderOptions,
): void {
  for (const stroke of strokes) {
    renderStroke(ctx, stroke, options);
  }
  if (currentStroke) {
    renderStroke(ctx, currentStroke, options);
  }
}
