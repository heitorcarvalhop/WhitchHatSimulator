import './energy-bar.css';

export interface EnergyBarProps {
  energy: number;
  maxEnergy: number;
}

export function EnergyBar({ energy, maxEnergy }: EnergyBarProps) {
  const ratio = maxEnergy > 0 ? energy / maxEnergy : 0;
  const low = ratio < 0.25;

  return (
    <div className="energy-bar">
      <div className="energy-bar__label">
        <span>Energia Arcana</span>
        <span>
          {Math.round(energy)}/{Math.round(maxEnergy)}
        </span>
      </div>
      <div className={`energy-bar__track ${low ? 'energy-bar__track--low' : ''}`}>
        <div className="energy-bar__fill" style={{ width: `${ratio * 100}%` }} />
        <div className="energy-bar__shine" />
      </div>
    </div>
  );
}
