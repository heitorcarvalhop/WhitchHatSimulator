import './toggle.css';

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <label className="af-toggle">
      <span className="af-toggle__text">
        <span className="af-toggle__label">{label}</span>
        {description && <span className="af-toggle__desc">{description}</span>}
      </span>
      <span className="af-toggle__switch-wrap">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          role="switch"
          aria-checked={checked}
        />
        <span className="af-toggle__switch" aria-hidden="true" />
      </span>
    </label>
  );
}
