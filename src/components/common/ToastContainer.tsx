import type { AppToast } from '@/app/toasts';
import { Icon, type IconName } from './Icon';
import './toast-container.css';

const KIND_ICON: Record<AppToast['kind'], IconName> = {
  discovery: 'star-filled',
  combination: 'bolt',
  levelup: 'trophy',
  challenge: 'check',
  info: 'info',
  warning: 'info',
};

export interface ToastContainerProps {
  toasts: AppToast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notificações">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.kind} af-anim-slide-up`} role="status">
          <Icon name={KIND_ICON[toast.kind]} size={18} />
          <div className="toast__text">
            <strong>{toast.title}</strong>
            <span>{toast.message}</span>
          </div>
          <button
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dispensar notificação"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
