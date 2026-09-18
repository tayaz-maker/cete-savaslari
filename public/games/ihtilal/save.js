import { GAME_ID, SAVE_VERSION, normalize } from "./engine.js";

export const SLOT_COUNT = 3;
export const slotKey = (n) => `tariklab.ihtilal.v1.slot${n}`;

function checksum(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(16);
}

export function serialize(state) {
  const clean = normalize(state);
  if (!clean) throw new Error("invalid-state");
  const payload = JSON.stringify(clean);
  return JSON.stringify({
    gameId: GAME_ID,
    version: SAVE_VERSION,
    checksum: checksum(payload),
    savedAt: Date.now(),
    payload,
  });
}

export function deserialize(raw) {
  try {
    const envelope = JSON.parse(raw);
    if (envelope.gameId !== GAME_ID) return { ok: false, error: "foreign-save" };
    if (envelope.version !== SAVE_VERSION) return { ok: false, error: "version" };
    if (checksum(envelope.payload) !== envelope.checksum) return { ok: false, error: "corrupt-save" };
    const state = normalize(JSON.parse(envelope.payload));
    if (!state) return { ok: false, error: "invalid-save" };
    return { ok: true, state, savedAt: envelope.savedAt };
  } catch {
    return { ok: false, error: "corrupt-save" };
  }
}

export function saveSlot(storage, slot, state) {
  const n = Number(slot);
  if (n < 1 || n > SLOT_COUNT) return { ok: false, error: "slot" };
  try {
    const raw = serialize(state);
    const key = slotKey(n);
    const previous = storage.getItem(key);
    if (previous && deserialize(previous).ok) storage.setItem(`${key}.backup`, previous);
    storage.setItem(key, raw);
    return { ok: true };
  } catch {
    return { ok: false, error: "storage-failed" };
  }
}

export function loadSlot(storage, slot) {
  const n = Number(slot);
  if (n < 1 || n > SLOT_COUNT) return { ok: false, error: "slot" };
  try {
    const key = slotKey(n);
    const raw = storage.getItem(key);
    if (raw == null) return { ok: false, error: "empty" };
    const result = deserialize(raw);
    if (result.ok) return result;
    const backup = storage.getItem(`${key}.backup`);
    if (!backup) return result;
    const recovered = deserialize(backup);
    return recovered.ok ? { ...recovered, recovered: true } : result;
  } catch {
    return { ok: false, error: "storage-failed" };
  }
}

export function clearSlot(storage, slot) {
  try {
    storage.removeItem(slotKey(slot));
    storage.removeItem(`${slotKey(slot)}.backup`);
    return { ok: true };
  } catch {
    return { ok: false, error: "storage-failed" };
  }
}

export function slotSummary(storage, slot) {
  const loaded = loadSlot(storage, slot);
  if (!loaded.ok) return null;
  const s = loaded.state;
  return {
    slot,
    turn: s.turn,
    heat: s.heat,
    hukum: s.players.map((p) => p.hukum),
    archetypes: s.players.map((p) => p.archetype),
    result: s.result,
    savedAt: loaded.savedAt,
  };
}
