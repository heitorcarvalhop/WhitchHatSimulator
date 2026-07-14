import type { HelpLevel, Spell } from '@/types';
import './guide-overlay.css';

export interface GuideOverlayProps {
  spell: Spell;
  helpLevel: HelpLevel;
}

/** Uses the same 0-100 design grid as the spell templates so it lines up with the drawing surface. */
export function GuideOverlay({ spell, helpLevel }: GuideOverlayProps) {
  if (helpLevel === 'none') return null;

  const showKeyPointsOnly = helpLevel === 'key-points';
  const opacityClass =
    helpLevel === 'ghost-symbol' ? 'guide-overlay--ghost' : 'guide-overlay--guide';

  return (
    <svg
      className={`guide-overlay ${opacityClass}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {spell.template.strokes.map((stroke, strokeIndex) => {
        const path = stroke.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        return (
          <g key={strokeIndex}>
            {!showKeyPointsOnly && (
              <path
                d={path}
                className="guide-overlay__path"
                style={{ stroke: spell.color }}
                fill="none"
              />
            )}
            {showKeyPointsOnly &&
              stroke
                .filter((_, i) => i % Math.max(1, Math.floor(stroke.length / 6)) === 0)
                .map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={1.6}
                    className="guide-overlay__point"
                    style={{ fill: spell.color }}
                  />
                ))}
            {helpLevel === 'full-guide' && (
              <circle
                cx={stroke[0]!.x}
                cy={stroke[0]!.y}
                r={3}
                className="guide-overlay__start"
                style={{ stroke: spell.color }}
              >
                <title>{`Traço ${strokeIndex + 1}`}</title>
              </circle>
            )}
            {helpLevel === 'full-guide' && (
              <text x={stroke[0]!.x} y={stroke[0]!.y + 1.2} className="guide-overlay__label">
                {strokeIndex + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
