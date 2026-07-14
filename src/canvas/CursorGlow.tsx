import { useEffect, useRef } from 'react';
import './cursor-glow.css';

export interface CursorGlowProps {
  color: string;
  enabled: boolean;
}

/** Position updates go through CSS custom properties, not React state, to avoid a re-render per pointer move. */
export function CursorGlow({ color, enabled }: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | undefined>(undefined);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', handleMove, { passive: true });

    const animate = () => {
      current.current.x += (target.current.x - current.current.x) * 0.18;
      current.current.y += (target.current.y - current.current.y) * 0.18;
      const el = glowRef.current;
      if (el) {
        el.style.setProperty('--glow-x', `${current.current.x}px`);
        el.style.setProperty('--glow-y', `${current.current.y}px`);
      }
      frame.current = requestAnimationFrame(animate);
    };
    frame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
      style={{ ['--glow-color' as string]: color }}
    />
  );
}
