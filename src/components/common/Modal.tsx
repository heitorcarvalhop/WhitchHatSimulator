import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';
import './modal.css';

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="af-modal-overlay af-anim-fade-in"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`af-modal glass-panel af-anim-slide-up af-modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="af-modal-title"
      >
        <header className="af-modal__header">
          <h2 id="af-modal-title">{title}</h2>
          <button
            ref={closeButtonRef}
            className="af-modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <Icon name="close" />
          </button>
        </header>
        <div className="af-modal__body">{children}</div>
      </div>
    </div>
  );
}
