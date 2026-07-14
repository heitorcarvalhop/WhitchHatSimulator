import { useState } from 'react';
import { useAppState } from '@/app/useAppState';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Toggle } from '@/components/common/Toggle';
import { Slider } from '@/components/common/Slider';
import { Icon } from '@/components/common/Icon';
import './admin-console.css';

export interface AdminConsoleProps {
  onClose: () => void;
  onLock: () => void;
}

export function AdminConsole({ onClose, onLock }: AdminConsoleProps) {
  const { progress, energy, maxEnergy, allSpells, cheats, setCheat, adminActions, pushToast } =
    useAppState();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const activeCheatCount = Object.values(cheats).filter(Boolean).length;

  const handleResetProgress = () => {
    adminActions.resetProgress();
    setConfirmingReset(false);
    pushToast('info', 'Progresso resetado', 'Todo o progresso do jogador foi zerado.');
  };

  return (
    <Modal title="Console de Administrador" onClose={onClose} size="lg">
      <div className="admin-console">
        <div className="admin-console__banner">
          <div className="admin-console__banner-text">
            <Icon name="bolt" size={18} />
            <span>
              Acesso concedido. {activeCheatCount > 0
                ? `${activeCheatCount} cheat(s) ativo(s).`
                : 'Nenhum cheat ativo no momento.'}
            </span>
          </div>
          <Button variant="danger" size="sm" icon="lock" onClick={onLock}>
            Bloquear console
          </Button>
        </div>

        <div className="admin-console__stats">
          <div className="admin-console__stat">
            <span className="admin-console__stat-label">Nível</span>
            <span className="admin-console__stat-value">{progress.level}</span>
          </div>
          <div className="admin-console__stat">
            <span className="admin-console__stat-label">XP total</span>
            <span className="admin-console__stat-value">{progress.xp}</span>
          </div>
          <div className="admin-console__stat">
            <span className="admin-console__stat-label">Energia</span>
            <span className="admin-console__stat-value">
              {Math.round(energy)}/{maxEnergy}
            </span>
          </div>
          <div className="admin-console__stat">
            <span className="admin-console__stat-label">Sequência</span>
            <span className="admin-console__stat-value">{progress.currentStreak}</span>
          </div>
          <div className="admin-console__stat">
            <span className="admin-console__stat-label">Feitiços descobertos</span>
            <span className="admin-console__stat-value">
              {progress.discoveredSpellIds.length}/{allSpells.length}
            </span>
          </div>
        </div>

        <section className="admin-console__section">
          <h3>
            <Icon name="trophy" size={16} /> Progressão
          </h3>
          <Slider
            label="Definir nível"
            value={progress.level}
            min={1}
            max={99}
            step={1}
            onChange={(v) => adminActions.setLevel(v)}
          />
          <div className="admin-console__actions">
            <Button size="sm" icon="plus" onClick={() => adminActions.addXp(100)}>
              +100 XP
            </Button>
            <Button size="sm" icon="plus" onClick={() => adminActions.addXp(1000)}>
              +1.000 XP
            </Button>
            <Button size="sm" icon="plus" onClick={() => adminActions.addXp(10000)}>
              +10.000 XP
            </Button>
            <Button size="sm" variant="primary" icon="star-filled" onClick={adminActions.maxLevel}>
              Nível máximo
            </Button>
          </div>
        </section>

        <section className="admin-console__section">
          <h3>
            <Icon name="book" size={16} /> Feitiços &amp; Grimório
          </h3>
          <Toggle
            label="Ignorar nível dos feitiços"
            description="Todos os feitiços ficam conjuráveis e desbloqueados no grimório, independente do nível."
            checked={cheats.unlockAllSpells}
            onChange={(v) => setCheat('unlockAllSpells', v)}
          />
          <div className="admin-console__actions">
            <Button size="sm" icon="check" onClick={adminActions.discoverAllSpells}>
              Descobrir todos os feitiços
            </Button>
            <Button size="sm" icon="check" onClick={adminActions.unlockAllCombinations}>
              Desbloquear todas as combinações
            </Button>
          </div>
        </section>

        <section className="admin-console__section">
          <h3>
            <Icon name="bolt" size={16} /> Energia
          </h3>
          <Toggle
            label="Energia infinita"
            description="A energia nunca acaba e se mantém sempre no máximo."
            checked={cheats.infiniteEnergy}
            onChange={(v) => setCheat('infiniteEnergy', v)}
          />
          <div className="admin-console__actions">
            <Button size="sm" icon="bolt" onClick={adminActions.fillEnergy}>
              Encher energia agora
            </Button>
          </div>
        </section>

        <section className="admin-console__section">
          <h3>
            <Icon name="target" size={16} /> Poder de conjuração
          </h3>
          <Toggle
            label="Acerto perfeito automático"
            description="Todo feitiço reconhecido é tratado como precisão máxima (Lendário)."
            checked={cheats.autoPerfect}
            onChange={(v) => setCheat('autoPerfect', v)}
          />
        </section>

        <section className="admin-console__section">
          <h3>
            <Icon name="repeat" size={16} /> Sequência &amp; Desafios
          </h3>
          <Slider
            label="Sequência atual"
            value={progress.currentStreak}
            min={0}
            max={30}
            step={1}
            onChange={(v) => adminActions.setStreak(v)}
          />
          <div className="admin-console__actions">
            <Button size="sm" icon="trophy" onClick={adminActions.completeAllChallenges}>
              Completar todos os desafios
            </Button>
            <Button size="sm" variant="ghost" icon="undo" onClick={adminActions.resetChallenges}>
              Reiniciar desafios
            </Button>
          </div>
        </section>

        <section className="admin-console__section admin-console__section--danger">
          <h3>
            <Icon name="trash" size={16} /> Zona de perigo
          </h3>
          {!confirmingReset ? (
            <Button variant="danger" size="sm" icon="trash" onClick={() => setConfirmingReset(true)}>
              Resetar progresso do jogador
            </Button>
          ) : (
            <div className="admin-console__confirm">
              <span>Isso apagará nível, XP, feitiços descobertos e desafios. Tem certeza?</span>
              <Button variant="danger" size="sm" onClick={handleResetProgress}>
                Sim, resetar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
                Cancelar
              </Button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
