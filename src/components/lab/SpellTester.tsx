import { useRef, useState } from 'react';
import type { SpellTemplate } from '@/types';
import { DrawingCanvas, type DrawingCanvasHandle } from '@/drawing/DrawingCanvas';
import { Button } from '@/components/common/Button';
import { gestureRecognizer } from '@/recognition/recognizer';
import { formatPercent } from '@/utils/formatters';
import './spell-tester.css';

export interface SpellTesterProps {
  template: SpellTemplate | null;
  color: string;
}

export function SpellTester({ template, color }: SpellTesterProps) {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [score, setScore] = useState<number | null>(null);

  const runTest = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.hasStrokes() || !template) {
      setScore(null);
      return;
    }
    const gesture = canvas.getGesture();
    const outcome = gestureRecognizer.recognize(
      gesture,
      [{ id: 'draft', strokes: template.strokes, orderMatters: template.orderMatters }],
      0,
    );
    setScore(outcome.candidates[0]?.score ?? 0);
  };

  return (
    <div className="spell-tester">
      <p className="spell-tester__hint">
        Redesenhe o símbolo aqui para testar o reconhecimento do seu feitiço.
      </p>
      <div className="spell-tester__canvas">
        <DrawingCanvas
          ref={canvasRef}
          strokeColor={color}
          glowColor={color}
          baseWidth={4}
          onClear={() => setScore(null)}
        />
      </div>
      <div className="spell-tester__actions">
        <Button
          variant="ghost"
          size="sm"
          icon="clear"
          onClick={() => {
            canvasRef.current?.clear();
            setScore(null);
          }}
        >
          Limpar
        </Button>
        <Button variant="primary" size="sm" icon="cast" onClick={runTest} disabled={!template}>
          Testar
        </Button>
      </div>
      {score !== null && (
        <p className="spell-tester__score" style={{ color }}>
          Similaridade: {formatPercent(score)}
        </p>
      )}
      {!template && <p className="spell-tester__warning">Desenhe o símbolo do feitiço primeiro.</p>}
    </div>
  );
}
