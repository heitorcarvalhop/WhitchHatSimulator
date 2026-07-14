import { useMemo } from 'react';
import './magic-circle.css';

export interface MagicCircleProps {
  color: string;
  energyRatio: number;
  isCasting: boolean;
  reducedMotion: boolean;
}

function RuneRing({
  radius,
  count,
  className,
}: {
  radius: number;
  count: number;
  className: string;
}) {
  const runes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360;
        return { angle, key: i };
      }),
    [count],
  );

  return (
    <g className={className}>
      {runes.map(({ angle, key }) => (
        <g key={key} transform={`rotate(${angle} 200 200)`}>
          <rect x={198} y={200 - radius} width={4} height={key % 3 === 0 ? 16 : 9} rx={1.5} />
        </g>
      ))}
    </g>
  );
}

export function MagicCircle({ color, energyRatio, isCasting, reducedMotion }: MagicCircleProps) {
  return (
    <svg
      className={`magic-circle ${isCasting ? 'magic-circle--casting' : ''} ${reducedMotion ? 'magic-circle--static' : ''}`}
      viewBox="0 0 400 400"
      role="presentation"
      aria-hidden="true"
      style={{ ['--circle-color' as string]: color, ['--energy-ratio' as string]: energyRatio }}
    >
      <defs>
        <radialGradient id="circle-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="70%" stopColor={color} stopOpacity="0.05" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={200} cy={200} r={190} fill="url(#circle-glow)" />
      <circle className="magic-circle__ring magic-circle__ring--outer" cx={200} cy={200} r={178} />
      <circle className="magic-circle__ring magic-circle__ring--mid" cx={200} cy={200} r={150} />
      <circle className="magic-circle__ring magic-circle__ring--inner" cx={200} cy={200} r={122} />

      <g className="magic-circle__rotator magic-circle__rotator--slow">
        <RuneRing radius={168} count={24} className="magic-circle__runes" />
      </g>
      <g className="magic-circle__rotator magic-circle__rotator--reverse">
        <RuneRing
          radius={140}
          count={16}
          className="magic-circle__runes magic-circle__runes--secondary"
        />
      </g>

      <polygon
        className="magic-circle__sigil"
        points="200,60 314,270 86,270"
        fill="none"
        strokeWidth={1.5}
      />
      <polygon
        className="magic-circle__sigil"
        points="200,340 86,130 314,130"
        fill="none"
        strokeWidth={1.5}
      />
      <circle className="magic-circle__core" cx={200} cy={200} r={4} />
    </svg>
  );
}
