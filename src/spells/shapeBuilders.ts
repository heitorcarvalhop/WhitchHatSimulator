import type { Point } from '@/types';

function toPoints(coords: Array<[number, number]>): Point[] {
  return coords.map(([x, y], i) => ({ x, y, t: i * 16 }));
}

export function line(x1: number, y1: number, x2: number, y2: number, steps = 12): Point[] {
  const coords: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coords.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
  }
  return toPoints(coords);
}

export function arc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  steps = 24,
): Point[] {
  const coords: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const deg = startDeg + (endDeg - startDeg) * t;
    const rad = (deg * Math.PI) / 180;
    coords.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
  }
  return toPoints(coords);
}

export function polyline(points: Array<[number, number]>, stepsPerSegment = 10): Point[] {
  const coords: Array<[number, number]> = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i]!;
    const [x2, y2] = points[i + 1]!;
    const segSteps = i === points.length - 2 ? stepsPerSegment : stepsPerSegment - 1;
    for (let s = 0; s <= segSteps; s++) {
      const t = s / stepsPerSegment;
      coords.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
    }
  }
  return toPoints(coords);
}

/** A tiny two-point stroke so a single "point" mark still registers as a valid stroke. */
export function dot(x: number, y: number): Point[] {
  return toPoints([
    [x, y],
    [x + 0.6, y + 0.6],
  ]);
}

export function spiral(
  cx: number,
  cy: number,
  startRadius: number,
  endRadius: number,
  turns: number,
  steps = 60,
): Point[] {
  const coords: Array<[number, number]> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = turns * 2 * Math.PI * t;
    const radius = startRadius + (endRadius - startRadius) * t;
    coords.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return toPoints(coords);
}

export function star(cx: number, cy: number, outerR: number, innerR: number): Point[] {
  const points: Array<[number, number]> = [];
  const spikes = 5;
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  for (let i = 0; i < spikes; i++) {
    points.push([cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR]);
    rot += step;
    points.push([cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR]);
    rot += step;
  }
  points.push(points[0]!);
  return polyline(points, 6);
}
