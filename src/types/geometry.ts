export interface Point {
  x: number;
  y: number;
  /** Timestamp in ms, relative to `performance.now()`. */
  t: number;
  /** Pointer pressure 0..1, defaults to 0.5 for mouse. */
  pressure?: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  startTime: number;
  endTime: number;
}

export interface StrokeFeatures {
  length: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  startPoint: Point;
  endPoint: Point;
  /** Approximate curvature: mean absolute turning angle per sampled segment, in radians. */
  curvature: number;
  direction: number;
}

export interface Gesture {
  strokes: Stroke[];
  createdAt: number;
}
