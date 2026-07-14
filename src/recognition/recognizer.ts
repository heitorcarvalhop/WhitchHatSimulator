import {
  type Vec2,
  boundingBox,
  distanceAtBestAngle,
  normalizePath,
  permutationsOf,
  toVec2,
} from './geometry';

const RESAMPLE_POINTS = 64;
const SQUARE_SIZE = 250;
const HALF_DIAGONAL = 0.5 * Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE);
/** Caps factorial blow-up for pathological gestures with many strokes. */
const MAX_STROKES_FOR_PERMUTATION = 5;

export interface RecognizableTemplate {
  id: string;
  strokes: Vec2[][];
  orderMatters: boolean;
}

export interface RecognitionCandidate {
  templateId: string;
  score: number;
}

export interface RecognitionOutcome {
  recognized: boolean;
  bestMatch: RecognitionCandidate | null;
  candidates: RecognitionCandidate[];
  rejectionReason?: string;
}

interface PreparedTemplate {
  id: string;
  strokeCount: number;
  normalized: Vec2[];
}

/** $N-style multistroke extension: every stroke ordering (if order doesn't matter) crossed with every per-stroke drawing direction, concatenated into a single path. */
function generateCandidateUnistrokes(strokes: Vec2[][], allowReordering: boolean): Vec2[][] {
  const indices = strokes.map((_, i) => i);
  const capReordering = allowReordering && strokes.length <= MAX_STROKES_FOR_PERMUTATION;
  const orders = capReordering ? permutationsOf(indices) : [indices];
  const k = strokes.length;
  const maxMask = k <= MAX_STROKES_FOR_PERMUTATION ? 1 << k : 1;

  const results: Vec2[][] = [];
  for (const order of orders) {
    for (let mask = 0; mask < maxMask; mask++) {
      const combined: Vec2[] = [];
      for (let i = 0; i < order.length; i++) {
        const strokeIndex = order[i]!;
        const stroke = strokes[strokeIndex]!;
        const reversed = ((mask >> i) & 1) === 1;
        const oriented = reversed ? [...stroke].reverse() : stroke;
        combined.push(...oriented);
      }
      results.push(combined);
    }
  }
  return results;
}

function prepareTemplate(template: RecognizableTemplate): PreparedTemplate {
  const combined = template.strokes.flat();
  return {
    id: template.id,
    strokeCount: template.strokes.length,
    normalized: normalizePath(combined, RESAMPLE_POINTS, SQUARE_SIZE),
  };
}

function scoreFromDistance(rawDistance: number): number {
  const score = 1 - rawDistance / HALF_DIAGONAL;
  return Math.max(0, Math.min(1, score));
}

export interface GestureLike {
  strokes: Array<{ points: Array<{ x: number; y: number }> }>;
}

export class GestureRecognizer {
  /** Free of framework/UI concerns so it can later be swapped for an ML-based implementation behind the same interface. */
  recognize(
    gesture: GestureLike,
    templates: RecognizableTemplate[],
    tolerance: number,
  ): RecognitionOutcome {
    if (gesture.strokes.length === 0 || templates.length === 0) {
      return {
        recognized: false,
        bestMatch: null,
        candidates: [],
        rejectionReason: 'Nenhum traço foi desenhado.',
      };
    }

    const strokePoints = gesture.strokes.map((s) => toVec2(s.points)).filter((s) => s.length > 0);
    if (strokePoints.length === 0) {
      return {
        recognized: false,
        bestMatch: null,
        candidates: [],
        rejectionReason: 'Traço vazio ou tempo insuficiente.',
      };
    }

    const totalPoints = strokePoints.reduce((sum, s) => sum + s.length, 0);
    if (totalPoints < 4) {
      return {
        recognized: false,
        bestMatch: null,
        candidates: [],
        rejectionReason: 'Desenho curto demais para ser reconhecido.',
      };
    }

    const box = boundingBox(strokePoints.flat());
    if (box.width < 4 && box.height < 4) {
      return {
        recognized: false,
        bestMatch: null,
        candidates: [],
        rejectionReason: 'O símbolo é pequeno demais — desenhe com mais amplitude.',
      };
    }

    const candidates: RecognitionCandidate[] = [];

    for (const template of templates) {
      const prepared = prepareTemplate(template);
      const strokeCountMatches = prepared.strokeCount === strokePoints.length;
      const allowReordering = !template.orderMatters;
      const unistrokes = generateCandidateUnistrokes(strokePoints, allowReordering);

      let best = Infinity;
      for (const unistroke of unistrokes) {
        const normalized = normalizePath(unistroke, RESAMPLE_POINTS, SQUARE_SIZE);
        const d = distanceAtBestAngle(normalized, prepared.normalized);
        if (d < best) best = d;
      }

      let score = scoreFromDistance(best);
      if (!strokeCountMatches) {
        // Wrong stroke count can still resemble the shape loosely, but should
        // never win outright — penalize proportional to the mismatch.
        const diff = Math.abs(prepared.strokeCount - strokePoints.length);
        score *= Math.max(0, 1 - diff * 0.3);
      }

      candidates.push({ templateId: template.id, score });
    }

    candidates.sort((a, b) => b.score - a.score);
    const top = candidates.slice(0, 3);
    const best = top[0] ?? null;
    const recognized = best !== null && best.score >= tolerance;

    let rejectionReason: string | undefined;
    if (!recognized) {
      if (!best) {
        rejectionReason = 'Nenhum feitiço conhecido se assemelha a este traço.';
      } else if (best.score < 0.3) {
        rejectionReason = 'O símbolo desenhado não corresponde a nenhum feitiço conhecido.';
      } else {
        rejectionReason = `Quase lá — o traço ficou a ${Math.round(
          (tolerance - best.score) * 100,
        )}% de precisão do símbolo mais próximo.`;
      }
    }

    return {
      recognized,
      bestMatch: recognized ? best : null,
      candidates: top,
      rejectionReason,
    };
  }
}

export const gestureRecognizer = new GestureRecognizer();
