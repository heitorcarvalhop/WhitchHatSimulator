import { Icon, type IconName } from '@/components/common/Icon';
import type { AppView } from './TopBar';
import './mobile-nav.css';

export interface MobileNavProps {
  view: AppView;
  onChangeView: (view: AppView) => void;
  onOpenLeft: () => void;
  onOpenRight: () => void;
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`mobile-nav__btn ${active ? 'is-active' : ''}`} onClick={onClick}>
      <Icon name={icon} size={20} />
      <span>{label}</span>
    </button>
  );
}

export function MobileNav({ view, onChangeView, onOpenLeft, onOpenRight }: MobileNavProps) {
  return (
    <nav className="mobile-nav glass-panel" aria-label="Navegação móvel">
      <NavButton icon="book" label="Grimório" onClick={onOpenLeft} />
      <NavButton
        icon="cast"
        label="Jogar"
        active={view === 'play'}
        onClick={() => onChangeView('play')}
      />
      <NavButton
        icon="flask"
        label="Laboratório"
        active={view === 'lab'}
        onClick={() => onChangeView('lab')}
      />
      <NavButton icon="target" label="Status" onClick={onOpenRight} />
    </nav>
  );
}
