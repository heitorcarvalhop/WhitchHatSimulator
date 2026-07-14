export interface Vec2 {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function toVec2(points: Array<{ x: number; y: number }>): Vec2[] {
  return points.map((p) => ({ x: p.x, y: p.y }));
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pathLength(points: Vec2[]): number {
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    length += distance(points[i - 1]!, points[i]!);
  }
  return length;
}

export function centroid(points: Vec2[]): Vec2 {
  if (points.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

export function boundingBox(points: Vec2[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export function removeRedundantPoints(points: Vec2[], minDistance = 1): Vec2[] {
  if (points.length === 0) return [];
  const result: Vec2[] = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const prev = result[result.length - 1]!;
    if (distance(prev, points[i]!) >= minDistance) {
      result.push(points[i]!);
    }
  }
  return result;
}

export function resample(points: Vec2[], n: number): Vec2[] {
  if (points.length === 0) return [];
  if (points.length === 1) return Array.from({ length: n }, () => ({ ...points[0]! }));

  const working = points.map((p) => ({ ...p }));
  const totalLength = pathLength(working);
  const interval = totalLength / Math.max(1, n - 1);
  let accumulated = 0;
  const result: Vec2[] = [{ ...working[0]! }];

  for (let i = 1; i < working.length; i++) {
    const prev = working[i - 1]!;
    const curr = working[i]!;
    const segmentDistance = distance(prev, curr);

    if (accumulated + segmentDistance >= interval) {
      const remaining = interval - accumulated;
      const ratio = segmentDistance === 0 ? 0 : remaining / segmentDistance;
      const newPoint: Vec2 = {
        x: prev.x + ratio * (curr.x - prev.x),
        y: prev.y + ratio * (curr.y - prev.y),
      };
      result.push(newPoint);
      working.splice(i, 0, newPoint);
      accumulated = 0;
    } else {
      accumulated += segmentDistance;
    }
  }

  while (result.length < n) {
    result.push({ ...working[working.length - 1]! });
  }
  if (result.length > n) result.length = n;

  return result;
}

export function translateToOrigin(points: Vec2[]): Vec2[] {
  const c = centroid(points);
  return points.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
}

export function scaleToSquare(points: Vec2[], size: number): Vec2[] {
  const box = boundingBox(points);
  const width = box.width || 1;
  const height = box.height || 1;
  return points.map((p) => ({
    x: ((p.x - box.minX) * size) / width,
    y: ((p.y - box.minY) * size) / height,
  }));
}

export function rotateBy(points: Vec2[], radians: number): Vec2[] {
  const c = centroid(points);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return points.map((p) => {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    return {
      x: dx * cos - dy * sin + c.x,
      y: dx * sin + dy * cos + c.y,
    };
  });
}

export function pathDistance(a: Vec2[], b: Vec2[]): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return Infinity;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += distance(a[i]!, b[i]!);
  }
  return sum / n;
}

/** Golden-section search for the rotation that minimizes distance to `template`, bounded to `thetaDeg` so tremor is tolerated without collapsing chirally distinct shapes (e.g. crescent vs. inverted crescent). */
export function distanceAtBestAngle(
  points: Vec2[],
  template: Vec2[],
  thetaDeg = 30,
  thresholdDeg = 2,
): number {
  const phi = 0.5 * (-1 + Math.sqrt(5));
  let a = -thetaDeg;
  let b = thetaDeg;
  let x1 = phi * a + (1 - phi) * b;
  let f1 = distanceAtAngle(points, template, x1);
  let x2 = (1 - phi) * a + phi * b;
  let f2 = distanceAtAngle(points, template, x2);

  while (Math.abs(b - a) > thresholdDeg) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = phi * a + (1 - phi) * b;
      f1 = distanceAtAngle(points, template, x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = (1 - phi) * a + phi * b;
      f2 = distanceAtAngle(points, template, x2);
    }
  }
  return Math.min(f1, f2);
}

function distanceAtAngle(points: Vec2[], template: Vec2[], degrees: number): number {
  const rotated = rotateBy(points, (degrees * Math.PI) / 180);
  return pathDistance(rotated, template);
}

export function normalizePath(points: Vec2[], resampleCount: number, squareSize: number): Vec2[] {
  const deduped = removeRedundantPoints(points, 0.5);
  const resampled = resample(deduped, resampleCount);
  const scaled = scaleToSquare(resampled, squareSize);
  return translateToOrigin(scaled);
}

export function permutationsOf<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  for (let i = 0; i < items.length; i++) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const perm of permutationsOf(rest)) {
      result.push([items[i]!, ...perm]);
    }
  }
  return result;
}
