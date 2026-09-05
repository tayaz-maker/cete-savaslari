import { useEffect } from "react";
import { REAL_MS_PER_TICK } from "./data";
import { useGame } from "./store";

export function useGameClock(active: boolean) {
  const tick = useGame((s) => s.tick);
  const hiz = useGame((s) => s.hiz);

  useEffect(() => {
    if (!active) return;
    let last = performance.now();
    let acc = 0;
    const step = () => {
      if (typeof document !== "undefined" && document.hidden) {
        last = performance.now();
        acc = 0;
        return;
      }
      const now = performance.now();
      acc += Math.min(now - last, 400) * hiz;
      last = now;
      const unit = REAL_MS_PER_TICK;
      let n = 0;
      while (acc >= unit && n < 3) {
        acc -= unit;
        n += 1;
      }
      if (n) tick(n);
    };
    const id = window.setInterval(step, 250);
    const onVis = () => {
      last = performance.now();
      if (document.hidden) acc = 0;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active, tick, hiz]);
}
