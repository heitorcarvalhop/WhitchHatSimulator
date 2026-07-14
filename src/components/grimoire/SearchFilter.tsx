import type { SpellElement } from '@/types';
import { Icon } from '@/components/common/Icon';
import { ELEMENT_LABELS } from '@/utils/formatters';
import './search-filter.css';

const ELEMENTS = Object.keys(ELEMENT_LABELS) as SpellElement[];

export interface SearchFilterProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeElement: SpellElement | null;
  onElementChange: (element: SpellElement | null) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (value: boolean) => void;
}

export function SearchFilter({
  query,
  onQueryChange,
  activeElement,
  onElementChange,
  favoritesOnly,
  onFavoritesOnlyChange,
}: SearchFilterProps) {
  return (
    <div className="search-filter">
      <div className="search-filter__input">
        <Icon name="search" size={16} />
        <input
          type="search"
          placeholder="Buscar feitiço..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Buscar feitiço"
        />
      </div>
      <div className="search-filter__chips" role="group" aria-label="Filtrar por elemento">
        <button
          className={`search-filter__chip ${activeElement === null ? 'is-active' : ''}`}
          onClick={() => onElementChange(null)}
        >
          Todos
        </button>
        <button
          className={`search-filter__chip ${favoritesOnly ? 'is-active' : ''}`}
          onClick={() => onFavoritesOnlyChange(!favoritesOnly)}
          aria-pressed={favoritesOnly}
        >
          <Icon name="star-filled" size={12} /> Favoritos
        </button>
        {ELEMENTS.map((el) => (
          <button
            key={el}
            className={`search-filter__chip ${activeElement === el ? 'is-active' : ''}`}
            onClick={() => onElementChange(activeElement === el ? null : el)}
          >
            {ELEMENT_LABELS[el]}
          </button>
        ))}
      </div>
    </div>
  );
}
