import { useMemo, useState } from 'react';
import type { Spell, SpellElement } from '@/types';
import { useAppState } from '@/app/useAppState';
import { SearchFilter } from './SearchFilter';
import { SpellCard } from './SpellCard';
import { SpellDetailPage } from './SpellDetailPage';
import './grimoire-list.css';

export interface GrimoireListProps {
  onTrain: (spellId: string) => void;
}

export function GrimoireList({ onTrain }: GrimoireListProps) {
  const { allSpells, progress, toggleFavorite, cheats } = useAppState();
  const [query, setQuery] = useState('');
  const [activeElement, setActiveElement] = useState<SpellElement | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [openSpell, setOpenSpell] = useState<Spell | null>(null);

  const filtered = useMemo(() => {
    return allSpells.filter((spell) => {
      if (activeElement && spell.element !== activeElement) return false;
      if (favoritesOnly && !progress.favoriteSpellIds.includes(spell.id)) return false;
      if (query.trim() && !spell.name.toLowerCase().includes(query.trim().toLowerCase()))
        return false;
      return true;
    });
  }, [allSpells, activeElement, favoritesOnly, query, progress.favoriteSpellIds]);

  const discoveredCount = progress.discoveredSpellIds.length;
  const completion =
    allSpells.length > 0 ? Math.round((discoveredCount / allSpells.length) * 100) : 0;

  return (
    <div className="grimoire-list">
      <div className="grimoire-list__summary">
        <span>
          {discoveredCount}/{allSpells.length} descobertos
        </span>
        <div className="grimoire-list__progress">
          <div className="grimoire-list__progress-fill" style={{ width: `${completion}%` }} />
        </div>
        <span>{completion}%</span>
      </div>

      <SearchFilter
        query={query}
        onQueryChange={setQuery}
        activeElement={activeElement}
        onElementChange={setActiveElement}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      <ul className="grimoire-list__items">
        {filtered.map((spell) => {
          const locked = !cheats.unlockAllSpells && spell.unlockLevel > progress.level;
          const discovered = progress.discoveredSpellIds.includes(spell.id);
          return (
            <SpellCard
              key={spell.id}
              spell={spell}
              locked={locked}
              discovered={discovered}
              favorite={progress.favoriteSpellIds.includes(spell.id)}
              timesCast={progress.timesCastBySpell[spell.id] ?? 0}
              onOpen={() => setOpenSpell(spell)}
              onToggleFavorite={() => toggleFavorite(spell.id)}
              onTrain={() => onTrain(spell.id)}
            />
          );
        })}
        {filtered.length === 0 && (
          <li className="grimoire-list__empty">Nenhum feitiço encontrado.</li>
        )}
      </ul>

      {openSpell && (
        <SpellDetailPage
          spell={openSpell}
          bestAccuracy={progress.bestAccuracyBySpell[openSpell.id] ?? 0}
          timesCast={progress.timesCastBySpell[openSpell.id] ?? 0}
          discoveredCombinationIds={progress.discoveredCombinationIds}
          onClose={() => setOpenSpell(null)}
          onTrain={() => {
            onTrain(openSpell.id);
            setOpenSpell(null);
          }}
        />
      )}
    </div>
  );
}
