/** Seeded LCG — same family as next-wave, isolated here so İHTİLAL never imports that runtime. */
export function mulberry(seed) {
  let s = (Number(seed) >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function shuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

export function pick(list, rng) {
  if (!list.length) return null;
  return list[Math.floor(rng() * list.length)];
}

export function finite(n, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, finite(n, lo)));
}
