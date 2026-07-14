import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { sha256Hex } from '@/utils/hash';
import './admin-gate.css';

/** SHA-256 de "Zerotwo002!" — o hash fica no bundle, não a senha em texto puro. */
const ADMIN_PASSWORD_HASH = '00a5710a70ff5616fc3053823399a391a7d052fd781a24a9c4855df403ddec3a';

export interface AdminGateProps {
  onClose: () => void;
  onUnlock: () => void;
}

export function AdminGate({ onClose, onUnlock }: AdminGateProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    const hash = await sha256Hex(value);
    setChecking(false);
    if (hash === ADMIN_PASSWORD_HASH) {
      setValue('');
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <Modal title="Acesso restrito" onClose={onClose} size="md">
      <form className="admin-gate" onSubmit={handleSubmit}>
        <div className="admin-gate__icon">
          <Icon name="lock" size={26} />
        </div>
        <p className="admin-gate__hint">
          O console de administrador concede controle total sobre a simulação — feitiços,
          progressão, energia e mais. Digite a senha para continuar.
        </p>
        <input
          type="password"
          autoFocus
          autoComplete="off"
          className={`admin-gate__input ${error ? 'is-error' : ''}`}
          placeholder="Senha de administrador"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        {error && (
          <span className="admin-gate__error" role="alert">
            Senha incorreta. Tente novamente.
          </span>
        )}
        <div className="admin-gate__actions">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" icon="lock" disabled={checking}>
            Desbloquear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
