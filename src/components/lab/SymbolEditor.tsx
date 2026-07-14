import { useRef, useState } from 'react';
import type { SpellTemplate } from '@/types';
import { DrawingCanvas, type DrawingCanvasHandle } from '@/drawing/DrawingCanvas';
import { Button } from '@/components/common/Button';
import './symbol-editor.css';

export interface SymbolEditorProps {
  color: string;
  orderMatters: boolean;
  onOrderMattersChange: (value: boolean) => void;
  onTemplateChange: (template: SpellTemplate | null) => void;
}

export function SymbolEditor({
  color,
  orderMatters,
  onOrderMattersChange,
  onTemplateChange,
}: SymbolEditorProps) {
  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [strokeCount, setStrokeCount] = useState(0);

  const syncTemplate = (count: number) => {
    setStrokeCount(count);
    const canvas = canvasRef.current;
    if (!canvas || !canvas.hasStrokes()) {
      onTemplateChange(null);
      return;
    }
    const gesture = canvas.getGesture();
    onTemplateChange({ strokes: gesture.strokes.map((s) => s.points), orderMatters });
  };

  return (
    <div className="symbol-editor">
      <div className="symbol-editor__canvas">
        <DrawingCanvas
          ref={canvasRef}
          strokeColor={color}
          glowColor={color}
          baseWidth={4}
          onStrokeEnd={syncTemplate}
          onClear={() => {
            setStrokeCount(0);
            onTemplateChange(null);
          }}
        />
      </div>
      <div className="symbol-editor__controls">
        <span className="symbol-editor__count">
          {strokeCount} traço{strokeCount === 1 ? '' : 's'}
        </span>
        <label className="symbol-editor__toggle">
          <input
            type="checkbox"
            checked={orderMatters}
            onChange={(e) => onOrderMattersChange(e.target.checked)}
          />
          A ordem dos traços importa
        </label>
        <Button
          icon="clear"
          variant="ghost"
          size="sm"
          onClick={() => {
            canvasRef.current?.clear();
            onTemplateChange(null);
          }}
        >
          Limpar símbolo
        </Button>
      </div>
    </div>
  );
}
