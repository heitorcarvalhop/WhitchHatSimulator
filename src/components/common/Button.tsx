import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { audioEngine } from '@/audio/AudioEngine';
import { Icon, type IconName } from './Icon';
import './button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  silent?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    icon,
    variant = 'secondary',
    size = 'md',
    silent = false,
    className,
    children,
    onClick,
    onMouseEnter,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`af-button af-button--${variant} af-button--${size} ${className ?? ''}`}
      onMouseEnter={(e) => {
        if (!silent) audioEngine.playUiHover();
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        if (!silent) audioEngine.playUiClick();
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
    </button>
  );
});
