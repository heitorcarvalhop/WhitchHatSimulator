import { Button } from '@/components/common/Button';
import './action-buttons.css';

export interface ActionButtonsProps {
  onClear: () => void;
  onExecute: () => void;
  onUndo: () => void;
  onRepeat: () => void;
  canExecute: boolean;
  canUndo: boolean;
  canRepeat: boolean;
}

export function ActionButtons({
  onClear,
  onExecute,
  onUndo,
  onRepeat,
  canExecute,
  canUndo,
  canRepeat,
}: ActionButtonsProps) {
  return (
    <div className="action-buttons" role="group" aria-label="Ações de conjuração">
      <Button
        icon="undo"
        variant="ghost"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Desfazer último traço"
        title="Desfazer último traço (Ctrl+Z)"
      >
        Desfazer
      </Button>
      <Button
        icon="clear"
        variant="ghost"
        onClick={onClear}
        disabled={!canUndo}
        aria-label="Limpar desenho"
        title="Limpar (Esc)"
      >
        Limpar
      </Button>
      <Button
        icon="cast"
        variant="primary"
        size="lg"
        onClick={onExecute}
        disabled={!canExecute}
        aria-label="Executar feitiço"
        title="Executar (Enter)"
      >
        Conjurar
      </Button>
      <Button
        icon="repeat"
        variant="ghost"
        onClick={onRepeat}
        disabled={!canRepeat}
        aria-label="Repetir último feitiço"
        title="Repetir último feitiço (R)"
      >
        Repetir
      </Button>
    </div>
  );
}
