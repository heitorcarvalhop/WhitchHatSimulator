import type { SpellTemplate } from '@/types';
import { arc, dot, line, polyline, spiral, star } from './shapeBuilders';

/** Expressed on an arbitrary 0-100 design grid — the recognizer normalizes scale/position, so only proportions matter. */
export const SPELL_TEMPLATES: Record<string, SpellTemplate> = {
  ignis: {
    orderMatters: false,
    strokes: [
      polyline(
        [
          [50, 10],
          [85, 85],
          [15, 85],
          [50, 10],
        ],
        16,
      ),
      line(50, 22, 50, 78),
    ],
  },
  aqua: {
    orderMatters: true,
    strokes: [[...spiral(50, 40, 6, 32, 1.6, 50), ...line(50, 68, 42, 88, 10)]],
  },
  ventus: {
    orderMatters: false,
    strokes: [
      arc(50, 28, 30, 200, 340, 20),
      arc(50, 50, 30, 200, 340, 20),
      arc(50, 72, 30, 200, 340, 20),
    ],
  },
  terra: {
    orderMatters: false,
    strokes: [
      polyline(
        [
          [20, 20],
          [80, 20],
          [80, 80],
          [20, 80],
          [20, 20],
        ],
        12,
      ),
      dot(50, 50),
    ],
  },
  lux: {
    orderMatters: false,
    strokes: [star(50, 50, 38, 15)],
  },
  umbra: {
    orderMatters: false,
    strokes: [arc(58, 50, 32, 300, 60, 40)],
  },
  fulmen: {
    orderMatters: false,
    strokes: [
      polyline(
        [
          [62, 8],
          [34, 48],
          [56, 48],
          [26, 92],
        ],
        14,
      ),
    ],
  },
  glacies: {
    orderMatters: false,
    strokes: [line(50, 12, 50, 88), line(15, 30, 85, 70), line(85, 30, 15, 70)],
  },
  vita: {
    orderMatters: false,
    strokes: [
      polyline(
        [
          [50, 10],
          [78, 50],
          [50, 90],
          [22, 50],
          [50, 10],
        ],
        12,
      ),
      line(50, 18, 50, 82),
    ],
  },
  aether: {
    orderMatters: false,
    strokes: [arc(50, 50, 34, 0, 359, 48), dot(50, 32), dot(38, 60), dot(62, 60)],
  },
};
