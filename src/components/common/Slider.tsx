import './slider.css';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function Slider({ label, value, min, max, step = 1, onChange, formatValue }: SliderProps) {
  return (
    <label className="af-slider">
      <span className="af-slider__label">
        <span>{label}</span>
        <span className="af-slider__value">{formatValue ? formatValue(value) : value}</span>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
