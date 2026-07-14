import { useEffect } from 'react';

export type ShortcutMap = Record<string, (e: KeyboardEvent) => void>;

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return EDITABLE_TAGS.has(target.tagName) || target.isContentEditable;
}

/** Keys combine with `ctrl+`/`shift+` prefixes, e.g. `{ 'ctrl+z': undo }`; ignored while focus is on a text input. */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.shiftKey) parts.push('shift');
      parts.push(e.key.toLowerCase());
      const combo = parts.join('+');

      const handlerFn = shortcuts[combo] ?? shortcuts[e.key.toLowerCase()];
      if (handlerFn) {
        e.preventDefault();
        handlerFn(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
