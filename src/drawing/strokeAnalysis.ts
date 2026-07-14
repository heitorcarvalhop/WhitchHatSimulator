import type { Point, Stroke, StrokeFeatures } from '@/types';

function segmentDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function analyzeStroke(stroke: Stroke): StrokeFeatures {
  const { points } = stroke;
  const first = points[0];
  const last = points[points.length - 1];

  if (!first || !last) {
    const zero: Point = { x: 0, y: 0, t: 0 };
    return {
      length: 0,
      duration: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      startPoint: zero,
      endPoint: zero,
      curvature: 0,
      direction: 0,
    };
  }

  let length = 0;
  let maxSpeed = 0;
  let minX = first.x;
  let minY = first.y;
  let maxX = first.x;
  let maxY = first.y;
  let curvatureSum = 0;
  let curvatureSamples = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    const dist = segmentDistance(prev, curr);
    length += dist;

    const dt = Math.max(1, curr.t - prev.t);
    const speed = dist / dt;
    if (speed > maxSpeed) maxSpeed = speed;

    if (curr.x < minX) minX = curr.x;
    if (curr.y < minY) minY = curr.y;
    if (curr.x > maxX) maxX = curr.x;
    if (curr.y > maxY) maxY = curr.y;

    if (i >= 2) {
      const prevPrev = points[i - 2]!;
      const angle1 = Math.atan2(prev.y - prevPrev.y, prev.x - prevPrev.x);
      const angle2 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      let delta = Math.abs(angle2 - angle1);
      if (delta > Math.PI) delta = 2 * Math.PI - delta;
      curvatureSum += delta;
      curvatureSamples += 1;
    }
  }

  const duration = Math.max(1, last.t - first.t);
  const averageSpeed = length / duration;
  const direction = Math.atan2(last.y - first.y, last.x - first.x);
  const curvature = curvatureSamples > 0 ? curvatureSum / curvatureSamples : 0;

  return {
    length,
    duration,
    averageSpeed,
    maxSpeed,
    boundingBox: { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY },
    startPoint: first,
    endPoint: last,
    curvature,
    direction,
  };
}

export function instantSpeed(a: Point, b: Point): number {
  const dt = Math.max(1, b.t - a.t);
  return segmentDistance(a, b) / dt;
}
