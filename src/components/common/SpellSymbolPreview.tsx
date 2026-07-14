import type { SpellTemplate } from '@/types';
import './spell-symbol-preview.css';

export interface SpellSymbolPreviewProps {
  template: SpellTemplate;
  color: string;
  size?: number;
  locked?: boolean;
}

export function SpellSymbolPreview({
  template,
  color,
  size = 44,
  locked = false,
}: SpellSymbolPreviewProps) {
  return (
    <svg
      className={`spell-symbol-preview ${locked ? 'spell-symbol-preview--locked' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={locked ? 'Símbolo bloqueado' : 'Símbolo do feitiço'}
    >
      {template.strokes.map((stroke, i) => {
        const path = stroke.map((p, pi) => `${pi === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        return (
          <path
            key={i}
            d={path}
            fill="none"
            stroke={locked ? 'currentColor' : color}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}
