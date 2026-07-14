import type { Spell } from '@/types';
import { Icon } from '@/components/common/Icon';
import { SpellSymbolPreview } from '@/components/common/SpellSymbolPreview';
import { DIFFICULTY_LABELS, ELEMENT_LABELS } from '@/utils/formatters';
import './spell-card.css';

export interface SpellCardProps {
  spell: Spell;
  discovered: boolean;
  locked: boolean;
  favorite: boolean;
  timesCast: number;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onTrain: () => void;
}

export function SpellCard({
  spell,
  discovered,
  locked,
  favorite,
  timesCast,
  onOpen,
  onToggleFavorite,
  onTrain,
}: SpellCardProps) {
  return (
    <li className={`spell-card ${locked ? 'spell-card--locked' : ''}`}>
      <button
        className="spell-card__main"
        onClick={onOpen}
        disabled={locked}
        aria-label={locked ? 'Feitiço bloqueado' : `Abrir página de ${spell.name}`}
      >
        <div className="spell-card__icon" style={{ ['--spell-color' as string]: spell.color }}>
          {locked ? (
            <Icon name="lock" size={20} />
          ) : (
            <SpellSymbolPreview template={spell.template} color={spell.color} size={38} />
          )}
        </div>
        <div className="spell-card__info">
          <span className="spell-card__name">{locked ? '???' : spell.name}</span>
          <span className="spell-card__meta">
            {locked
              ? `Nível ${spell.unlockLevel}`
              : `${ELEMENT_LABELS[spell.element]} · ${DIFFICULTY_LABELS[spell.difficulty]}`}
          </span>
          {discovered && !locked && (
            <span className="spell-card__casts">
              {timesCast} conjuração{timesCast === 1 ? '' : 'ões'}
            </span>
          )}
        </div>
      </button>
      {!locked && (
        <div className="spell-card__actions">
          <button
            className="spell-card__favorite"
            onClick={onToggleFavorite}
            aria-pressed={favorite}
            aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Icon name={favorite ? 'star-filled' : 'star'} size={16} />
          </button>
          <button
            className="spell-card__train"
            onClick={onTrain}
            aria-label={`Treinar ${spell.name}`}
          >
            Treinar
          </button>
        </div>
      )}
    </li>
  );
}
