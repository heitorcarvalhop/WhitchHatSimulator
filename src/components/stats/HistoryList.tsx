import type { SpellCastRecord } from '@/types';
import { tierLabel } from '@/spells/spellEngine';
import { formatRelativeTime } from '@/utils/formatters';
import './history-list.css';

export interface HistoryListProps {
  history: SpellCastRecord[];
}

export function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="history-list">
      <h3 className="history-list__title">Histórico recente</h3>
      {history.length === 0 && (
        <p className="history-list__empty">Nenhum feitiço conjurado ainda.</p>
      )}
      <ul>
        {history.slice(0, 12).map((entry) => (
          <li key={entry.id} className={`history-list__item history-list__item--${entry.tier}`}>
            <span className="history-list__name">{entry.spellName}</span>
            <span className="history-list__tier">{tierLabel(entry.tier)}</span>
            <span className="history-list__time">{formatRelativeTime(entry.timestamp)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
