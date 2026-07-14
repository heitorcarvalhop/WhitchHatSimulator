import type { CastOutcome } from '@/services/spellExecutionService';
import { formatPercent } from '@/utils/formatters';
import './cast-meters.css';

export interface CastMetersProps {
  lastOutcome: CastOutcome | null;
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="cast-meter">
      <div className="cast-meter__label">
        <span>{label}</span>
        <span>{formatPercent(value)}</span>
      </div>
      <div className="cast-meter__track">
        <div
          className="cast-meter__fill"
          style={{ width: `${Math.round(value * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function CastMeters({ lastOutcome }: CastMetersProps) {
  const accuracy = lastOutcome?.result?.accuracy ?? 0;
  const stability = lastOutcome?.computation?.stability ?? 0;
  const power = lastOutcome?.computation ? Math.min(1, lastOutcome.computation.power / 80) : 0;

  return (
    <div className="cast-meters">
      <Meter label="Precisão do desenho" value={accuracy} color="var(--af-accent)" />
      <Meter label="Estabilidade" value={stability} color="var(--af-success)" />
      <Meter label="Poder do feitiço" value={power} color="var(--af-gold)" />
    </div>
  );
}
