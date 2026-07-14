import { useEffect, useRef, useState } from 'react';
import './fps-monitor.css';

export function FpsMonitor() {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const loop = () => {
      frameCount.current += 1;
      const now = performance.now();
      const elapsed = now - lastTime.current;
      if (elapsed >= 500) {
        setFps(Math.round((frameCount.current * 1000) / elapsed));
        frameCount.current = 0;
        lastTime.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const level = fps >= 50 ? 'good' : fps >= 30 ? 'ok' : 'bad';

  return (
    <div className={`fps-monitor fps-monitor--${level}`} aria-hidden="true">
      {fps} FPS
    </div>
  );
}
