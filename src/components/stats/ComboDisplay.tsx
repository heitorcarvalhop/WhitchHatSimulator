import { xpProgressWithinLevel } from '@/progression/xp';
import './combo-display.css';

export interface ComboDisplayProps {
  currentStreak: number;
  bestStreak: number;
  level: number;
  xp: number;
}

export function ComboDisplay({ currentStreak, bestStreak, level, xp }: ComboDisplayProps) {
  const multiplier = 1 + Math.min(currentStreak, 10) * 0.05;
  const { ratio } = xpProgressWithinLevel(xp);

  return (
    <div className="combo-display">
      <div className="combo-display__row">
        <div>
          <span className="combo-display__label">Sequência atual</span>
          <span className="combo-display__value">{currentStreak}</span>
        </div>
        <div>
          <span className="combo-display__label">Multiplicador</span>
          <span className="combo-display__value">x{multiplier.toFixed(2)}</span>
        </div>
        <div>
          <span className="combo-display__label">Recorde</span>
          <span className="combo-display__value">{bestStreak}</span>
        </div>
      </div>
      <div className="combo-display__level">
        <span>Nível {level}</span>
        <div className="combo-display__xp-track">
          <div className="combo-display__xp-fill" style={{ width: `${ratio * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
