import { describe, expect, it } from 'vitest';
import { GestureRecognizer, type RecognizableTemplate } from './recognizer';
import { SPELL_TEMPLATES } from '@/spells/templates';

function templateToGesture(strokes: Array<Array<{ x: number; y: number }>>) {
  return { strokes: strokes.map((points) => ({ points })) };
}

function asTemplates(): RecognizableTemplate[] {
  return Object.entries(SPELL_TEMPLATES).map(([id, template]) => ({
    id,
    strokes: template.strokes,
    orderMatters: template.orderMatters,
  }));
}

describe('GestureRecognizer', () => {
  it('recognizes a perfect redraw of a known template with high confidence', () => {
    const recognizer = new GestureRecognizer();
    const templates = asTemplates();
    const luxTemplate = templates.find((t) => t.id === 'lux')!;

    const gesture = templateToGesture(luxTemplate.strokes);
    const outcome = recognizer.recognize(gesture, templates, 0.6);

    expect(outcome.recognized).toBe(true);
    expect(outcome.bestMatch?.templateId).toBe('lux');
    expect(outcome.bestMatch?.score).toBeGreaterThan(0.95);
  });

  it('ranks the top three candidates by score, descending', () => {
    const recognizer = new GestureRecognizer();
    const templates = asTemplates();
    const terraTemplate = templates.find((t) => t.id === 'terra')!;
    const gesture = templateToGesture(terraTemplate.strokes);

    const outcome = recognizer.recognize(gesture, templates, 0.6);
    expect(outcome.candidates.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < outcome.candidates.length; i++) {
      expect(outcome.candidates[i - 1]!.score).toBeGreaterThanOrEqual(outcome.candidates[i]!.score);
    }
  });

  it('rejects a scribble that matches nothing well', () => {
    const recognizer = new GestureRecognizer();
    const templates = asTemplates();
    const scribble = [
      { x: 0, y: 0 },
      { x: 3, y: 7 },
      { x: -2, y: 11 },
      { x: 6, y: 2 },
      { x: -5, y: -3 },
      { x: 9, y: 9 },
    ];
    const outcome = recognizer.recognize(templateToGesture([scribble]), templates, 0.6);
    expect(outcome.recognized).toBe(false);
    expect(outcome.rejectionReason).toBeDefined();
  });

  it('rejects gestures with too few points', () => {
    const recognizer = new GestureRecognizer();
    const outcome = recognizer.recognize(templateToGesture([[{ x: 0, y: 0 }]]), asTemplates(), 0.6);
    expect(outcome.recognized).toBe(false);
    expect(outcome.rejectionReason).toContain('curto');
  });

  it('handles multistroke order-independent templates regardless of draw order', () => {
    const recognizer = new GestureRecognizer();
    const templates = asTemplates();
    const terraTemplate = templates.find((t) => t.id === 'terra')!;
    const reorderedStrokes = [...terraTemplate.strokes].reverse();

    const outcome = recognizer.recognize(templateToGesture(reorderedStrokes), templates, 0.6);
    expect(outcome.bestMatch?.templateId).toBe('terra');
  });

  it('returns no match on an empty gesture', () => {
    const recognizer = new GestureRecognizer();
    const outcome = recognizer.recognize({ strokes: [] }, asTemplates(), 0.6);
    expect(outcome.recognized).toBe(false);
    expect(outcome.bestMatch).toBeNull();
  });
});
