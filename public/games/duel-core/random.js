// All gameplay randomness belongs to the serialized PRNG, never the renderer.
export function random(state) {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}
export function shuffle(values, state) {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random(state) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function pick(values, state) { return values[Math.floor(random(state) * values.length)]; }
