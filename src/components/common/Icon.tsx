export type IconName =
  | 'clear'
  | 'cast'
  | 'undo'
  | 'repeat'
  | 'book'
  | 'settings'
  | 'menu'
  | 'close'
  | 'search'
  | 'star'
  | 'star-filled'
  | 'lock'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'volume'
  | 'mute'
  | 'fullscreen'
  | 'flask'
  | 'target'
  | 'trophy'
  | 'download'
  | 'upload'
  | 'trash'
  | 'edit'
  | 'copy'
  | 'plus'
  | 'check'
  | 'info'
  | 'bolt';

const PATHS: Record<IconName, string> = {
  clear: 'M4 4l16 16M20 4L4 20',
  cast: 'M12 2l2.2 6.2L20 10l-6 2.2L12 18l-1.8-5.8L4 10l5.8-1.8L12 2z',
  undo: 'M9 14l-5-5 5-5M4 9h9a7 7 0 010 14h-2',
  repeat: 'M17 2l4 4-4 4M3 11V9a4 4 0 014-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 01-4 4H3',
  book: 'M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 004 17.5v-13z M4 17.5A2.5 2.5 0 016.5 15H20',
  settings:
    'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15 1.65 1.65 0 003.09 14H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.14.36.4.66.74.85.34.19.5.24 1.77.24H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z',
  'star-filled':
    'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z',
  lock: 'M6 10V7a6 6 0 1112 0v3M5 10h14v11H5V10z',
  'chevron-left': 'M15 18l-6-6 6-6',
  'chevron-right': 'M9 18l6-6-6-6',
  'chevron-down': 'M6 9l6 6 6-6',
  volume: 'M4 9v6h4l5 5V4L8 9H4zM17.5 8.5a5 5 0 010 7',
  mute: 'M4 9v6h4l5 5V4L8 9H4zM17 9l5 5M22 9l-5 5',
  fullscreen: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  flask: 'M9 2h6M10 2v6l-5.5 9.5A2 2 0 006.2 21h11.6a2 2 0 001.7-3.5L14 8V2',
  target:
    'M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z',
  trophy: 'M8 21h8M12 17v4M6 4h12v4a6 6 0 01-12 0V4zM6 4H3v2a3 3 0 003 3M18 4h3v2a3 3 0 01-3 3',
  download: 'M12 3v12m0 0l-4-4m4 4l4-4M4 21h16',
  upload: 'M12 21V9m0 0l-4 4m4-4l4 4M4 3h16',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6L9 17l-5-5',
  info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
};

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  const filled = name === 'star-filled';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
