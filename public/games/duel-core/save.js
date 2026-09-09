import { validateState } from "./model.js";

export const saveKey = (theme) => `tariklab.${theme}.duel`;
function checksum(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}
export function serialize(state) {
  if (!validateState(state)) throw new Error("Invalid state cannot be saved");
  const { catalog: _catalog, ...data } = state;
  const payload = JSON.stringify(data);
  return JSON.stringify({ version: 1, checksum: checksum(payload), payload });
}
export function deserialize(raw, pool, theme) {
  try {
    const envelope = JSON.parse(raw);
    if (envelope.version !== 1 || checksum(envelope.payload) !== envelope.checksum)
      return { ok: false, error: "corrupt-save" };
    const state = {
      ...JSON.parse(envelope.payload),
      catalog: Object.fromEntries(pool.map((c) => [c.id, c])),
    };
    if (state.theme !== theme || !validateState(state)) return { ok: false, error: "invalid-save" };
    return { ok: true, state };
  } catch {
    return { ok: false, error: "corrupt-save" };
  }
}
export function saveDuel(storage, state) {
  try {
    const key = saveKey(state.theme),
      raw = serialize(state),
      previous = storage.getItem(key);
    if (previous && deserialize(previous, Object.values(state.catalog), state.theme).ok)
      storage.setItem(`${key}.backup`, previous);
    storage.setItem(key, raw);
    return { ok: true };
  } catch {
    return { ok: false, error: "storage-failed" };
  }
}
export function loadDuel(storage, pool, theme) {
  try {
    const raw = storage.getItem(saveKey(theme));
    if (raw === null) return { ok: false, error: "no-save" };
    const result = deserialize(raw, pool, theme);
    if (result.ok) return result;
    const backup = deserialize(storage.getItem(`${saveKey(theme)}.backup`), pool, theme);
    return backup.ok ? { ...backup, recovered: true } : result;
  } catch {
    return { ok: false, error: "storage-failed" };
  }
}
