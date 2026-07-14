import type { SpellTier } from '@/types';
import { tierLabel } from '@/spells/spellEngine';
import './recognition-feedback.css';

export interface FeedbackCandidate {
  name: string;
  score: number;
}

export interface FeedbackState {
  status: 'idle' | 'success' | 'fail' | 'blocked';
  spellName?: string;
  color?: string;
  accuracy?: number;
  tier?: SpellTier;
  message?: string;
  candidates?: FeedbackCandidate[];
  comboName?: string;
}

const TIER_CLASS: Record<SpellTier, string> = {
  fail: 'tier-fail',
  unstable: 'tier-unstable',
  common: 'tier-common',
  powerful: 'tier-powerful',
  perfect: 'tier-perfect',
  legendary: 'tier-legendary',
};

export function RecognitionFeedback({ state }: { state: FeedbackState }) {
  return (
    <div className="recognition-feedback" role="status" aria-live="polite">
      {state.status === 'idle' && (
        <p className="recognition-feedback__hint">
          Desenhe um símbolo dentro do círculo para conjurar.
        </p>
      )}

      {state.status !== 'idle' && state.spellName && (
        <div className="recognition-feedback__result af-anim-pop">
          <span className="recognition-feedback__name" style={{ color: state.color }}>
            {state.spellName}
          </span>
          {typeof state.accuracy === 'number' && state.tier && (
            <div className="recognition-feedback__meta">
              <span className={`recognition-feedback__tier ${TIER_CLASS[state.tier]}`}>
                {tierLabel(state.tier)}
              </span>
              <div className="recognition-feedback__bar">
                <div
                  className="recognition-feedback__bar-fill"
                  style={{ width: `${Math.round(state.accuracy * 100)}%`, background: state.color }}
                />
              </div>
              <span className="recognition-feedback__percent">
                {Math.round(state.accuracy * 100)}%
              </span>
            </div>
          )}
          {state.comboName && (
            <p className="recognition-feedback__combo">⚡ Combinação: {state.comboName}</p>
          )}
        </div>
      )}

      {state.status === 'blocked' && state.message && (
        <p className="recognition-feedback__message recognition-feedback__message--warning">
          {state.message}
        </p>
      )}

      {state.status === 'fail' && !state.spellName && (
        <div className="recognition-feedback__unrecognized af-anim-fade-in">
          <p className="recognition-feedback__message">
            {state.message ?? 'Símbolo não reconhecido.'}
          </p>
          {state.candidates && state.candidates.length > 0 && (
            <ul className="recognition-feedback__candidates">
              {state.candidates.map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <span>{Math.round(c.score * 100)}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
