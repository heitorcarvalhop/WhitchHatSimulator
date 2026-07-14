import { describe, expect, it } from 'vitest';
import {
  boundingBox,
  centroid,
  distance,
  distanceAtBestAngle,
  normalizePath,
  pathDistance,
  pathLength,
  permutationsOf,
  removeRedundantPoints,
  resample,
  rotateBy,
  scaleToSquare,
  translateToOrigin,
} from './geometry';

describe('distance', () => {
  it('computes euclidean distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe('pathLength', () => {
  it('sums segment distances', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 3, y: 8 },
    ];
    expect(pathLength(points)).toBe(9);
  });

  it('returns 0 for a single point', () => {
    expect(pathLength([{ x: 5, y: 5 }])).toBe(0);
  });
});

describe('centroid', () => {
  it('averages point coordinates', () => {
    const c = centroid([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 5, y: 10 },
    ]);
    expect(c.x).toBeCloseTo(5);
    expect(c.y).toBeCloseTo(3.333, 2);
  });
});

describe('boundingBox', () => {
  it('finds min/max extents', () => {
    const box = boundingBox([
      { x: -5, y: 2 },
      { x: 10, y: -3 },
      { x: 4, y: 8 },
    ]);
    expect(box).toEqual({ minX: -5, minY: -3, maxX: 10, maxY: 8, width: 15, height: 11 });
  });
});

describe('removeRedundantPoints', () => {
  it('drops points closer than the minimum distance', () => {
    const result = removeRedundantPoints(
      [
        { x: 0, y: 0 },
        { x: 0.1, y: 0 },
        { x: 5, y: 0 },
      ],
      1,
    );
    expect(result).toHaveLength(2);
  });
});

describe('resample', () => {
  it('produces exactly n points', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    const result = resample(points, 16);
    expect(result).toHaveLength(16);
  });

  it('keeps points roughly equidistant', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ];
    const result = resample(points, 5);
    const gaps = result.slice(1).map((p, i) => distance(p, result[i]!));
    for (const gap of gaps) {
      expect(gap).toBeCloseTo(25, 0);
    }
  });
});

describe('translateToOrigin', () => {
  it('centers the centroid at 0,0', () => {
    const result = translateToOrigin([
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ]);
    const c = centroid(result);
    expect(c.x).toBeCloseTo(0);
    expect(c.y).toBeCloseTo(0);
  });
});

describe('scaleToSquare', () => {
  it('fits the bounding box to the target size', () => {
    const result = scaleToSquare(
      [
        { x: 0, y: 0 },
        { x: 50, y: 200 },
      ],
      100,
    );
    const box = boundingBox(result);
    expect(box.width).toBeCloseTo(100);
    expect(box.height).toBeCloseTo(100);
  });
});

describe('rotateBy', () => {
  it('rotates points around the centroid', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const rotated = rotateBy(points, Math.PI / 2);
    expect(rotated[1]!.x).toBeCloseTo(5, 1);
    expect(rotated[1]!.y).toBeCloseTo(5, 1);
  });
});

describe('pathDistance', () => {
  it('is zero for identical paths', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ];
    expect(pathDistance(points, points)).toBe(0);
  });

  it('increases as paths diverge', () => {
    const a = [{ x: 0, y: 0 }];
    const b = [{ x: 10, y: 0 }];
    expect(pathDistance(a, b)).toBe(10);
  });
});

describe('distanceAtBestAngle', () => {
  it('finds a near-zero distance for a slightly rotated copy of itself', () => {
    const square = normalizePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
      ],
      32,
      100,
    );
    const rotated = rotateBy(square, (10 * Math.PI) / 180);
    const d = distanceAtBestAngle(rotated, square);
    expect(d).toBeLessThan(5);
  });
});

describe('normalizePath', () => {
  it('produces a path invariant to uniform translation and scale', () => {
    const shapeA = normalizePath(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      32,
      100,
    );
    const shapeB = normalizePath(
      [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
      ],
      32,
      100,
    );
    expect(pathDistance(shapeA, shapeB)).toBeLessThan(1);
  });
});

describe('permutationsOf', () => {
  it('generates n! permutations', () => {
    expect(permutationsOf([0, 1, 2])).toHaveLength(6);
    expect(permutationsOf([0])).toHaveLength(1);
  });
});
