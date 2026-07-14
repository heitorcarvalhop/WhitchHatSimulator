import type { Spell } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { SpellSymbolPreview } from '@/components/common/SpellSymbolPreview';
import { SPELL_COMBINATIONS } from '@/combinations/combinationDefinitions';
import { DIFFICULTY_LABELS, ELEMENT_LABELS, formatPercent } from '@/utils/formatters';
import './spell-detail-page.css';

export interface SpellDetailPageProps {
  spell: Spell;
  bestAccuracy: number;
  timesCast: number;
  discoveredCombinationIds: string[];
  onClose: () => void;
  onTrain: () => void;
}

export function SpellDetailPage({
  spell,
  bestAccuracy,
  timesCast,
  discoveredCombinationIds,
  onClose,
  onTrain,
}: SpellDetailPageProps) {
  const relatedCombinations = SPELL_COMBINATIONS.filter((c) => c.spellIds.includes(spell.id));

  return (
    <Modal title={spell.name} onClose={onClose} size="md">
      <div className="spell-detail">
        <div className="spell-detail__header">
          <div
            className="spell-detail__symbol"
            style={{ ['--spell-color' as string]: spell.color }}
          >
            <SpellSymbolPreview template={spell.template} color={spell.color} size={72} />
          </div>
          <div>
            <p className="spell-detail__tags">
              {ELEMENT_LABELS[spell.element]} · {DIFFICULTY_LABELS[spell.difficulty]} · Custo{' '}
              {spell.energyCost}
            </p>
            <p className="spell-detail__description">{spell.description}</p>
          </div>
        </div>

        <blockquote className="spell-detail__lore">{spell.lore}</blockquote>

        <div className="spell-detail__stats">
          <div>
            <span className="spell-detail__stat-label">Melhor precisão</span>
            <span className="spell-detail__stat-value">
              {bestAccuracy > 0 ? formatPercent(bestAccuracy) : '—'}
            </span>
          </div>
          <div>
            <span className="spell-detail__stat-label">Conjurações</span>
            <span className="spell-detail__stat-value">{timesCast}</span>
          </div>
        </div>

        {relatedCombinations.length > 0 && (
          <div className="spell-detail__combos">
            <h3>Combinações relacionadas</h3>
            <ul>
              {relatedCombinations.map((c) => (
                <li key={c.id}>
                  <span
                    style={{ color: discoveredCombinationIds.includes(c.id) ? c.color : undefined }}
                  >
                    {discoveredCombinationIds.includes(c.id) ? c.name : '??? (não descoberta)'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          icon="target"
          variant="primary"
          onClick={onTrain}
          className="spell-detail__train-btn"
        >
          Treinar este símbolo
        </Button>
      </div>
    </Modal>
  );
}
