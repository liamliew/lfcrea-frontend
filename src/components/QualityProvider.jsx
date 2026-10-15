import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { QualityContext, TIERS, detectStartTier } from '../lib/useQualityTier';

const SKIP_MS = 2000;
const WINDOW_MS = 1000;
const LOW_FPS = 40;
const HIGH_FPS = 55;
const DOWN_AFTER_MS = 3000;
const UP_AFTER_MS = 10000;

export default function QualityProvider({ children }) {
  const [start] = useState(detectStartTier);
  const [tier, setTier] = useState(start);
  const tierRef = useRef(start);

  useLayoutEffect(() => {
    document.documentElement.dataset.quality = tier;
  }, [tier]);

  useEffect(() => {
    const ceiling = TIERS.indexOf(start);
    const bornAt = performance.now();
    let raf = null;
    let frames = 0;
    let windowStart = 0;
    let slowMs = 0;
    let fastMs = 0;

    const reset = () => {
      frames = 0;
      windowStart = 0;
      slowMs = 0;
      fastMs = 0;
    };

    const move = (step) => {
      const next = TIERS.indexOf(tierRef.current) + step;
      if (next < 0 || next > ceiling) return;
      tierRef.current = TIERS[next];
      setTier(TIERS[next]);
      reset();
    };

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (now - bornAt < SKIP_MS) return;
      if (!windowStart) {
        windowStart = now;
        frames = 0;
        return;
      }
      frames += 1;
      const elapsed = now - windowStart;
      if (elapsed < WINDOW_MS) return;
      const average = (frames * 1000) / elapsed;
      windowStart = now;
      frames = 0;
      if (average < LOW_FPS) {
        fastMs = 0;
        slowMs += elapsed;
        if (slowMs >= DOWN_AFTER_MS) move(-1);
      } else if (average > HIGH_FPS) {
        slowMs = 0;
        fastMs += elapsed;
        if (fastMs >= UP_AFTER_MS) move(1);
      } else {
        slowMs = 0;
        fastMs = 0;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
        reset();
      } else if (raf === null) {
        raf = requestAnimationFrame(tick);
      }
    };

    if (!document.hidden) raf = requestAnimationFrame(tick);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [start]);

  const value = useMemo(() => ({ tier }), [tier]);

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  );
}
