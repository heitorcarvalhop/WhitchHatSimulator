import { Modal } from '@/components/common/Modal';
import { Icon } from '@/components/common/Icon';
import { CHALLENGES } from '@/progression/challengeDefinitions';
import { useAppState } from '@/app/useAppState';
import './challenges-modal.css';

export interface ChallengesModalProps {
  onClose: () => void;
}

export function ChallengesModal({ onClose }: ChallengesModalProps) {
  const { progress } = useAppState();

  return (
    <Modal title="Desafios" onClose={onClose} size="lg">
      <ul className="challenges-modal__list">
        {CHALLENGES.map((challenge) => {
          const state = progress.challengeProgress[challenge.id];
          const progressValue = state?.progress ?? 0;
          const completed = state?.completed ?? false;
          const ratio = Math.min(1, progressValue / challenge.target);
          return (
            <li
              key={challenge.id}
              className={`challenges-modal__item ${completed ? 'is-complete' : ''}`}
            >
              <div className="challenges-modal__icon">
                <Icon name={completed ? 'check' : 'target'} size={18} />
              </div>
              <div className="challenges-modal__body">
                <div className="challenges-modal__title-row">
                  <strong>{challenge.name}</strong>
                  <span>+{challenge.xpReward} XP</span>
                </div>
                <p>{challenge.description}</p>
                <div className="challenges-modal__track">
                  <div className="challenges-modal__fill" style={{ width: `${ratio * 100}%` }} />
                </div>
                <span className="challenges-modal__progress-label">
                  {progressValue}/{challenge.target}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}
