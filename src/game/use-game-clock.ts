import { useEffect } from "react";
import { REAL_MS_PER_TICK } from "./data";
import { useGame } from "./store";

export function useGameClock(active: boolean) {
  const tick = useGame((s) => s.tick);
  const hiz = useGame((s) => s.hiz);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(now - last, 200);
      last = now;
      acc += dt * hiz;
      const step = REAL_MS_PER_TICK;
      let n = 0;
      while (acc >= step && n < 3) {
        acc -= step;
        n += 1;
      }
      if (n) tick(n);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, tick, hiz]);
}
