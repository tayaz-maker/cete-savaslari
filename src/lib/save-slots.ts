export const SLOT_COUNT = 3 as const;
export type SlotIndex = 1 | 2 | 3;

export type SlotStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export function isSlotIndex(value: unknown): value is SlotIndex {
  return value === 1 || value === 2 || value === 3;
}

export function slotKey(gameId: string, slot: SlotIndex) {
  return `tariklab::${gameId}:${slot}`;
}

export function activeSlotKey(gameId: string) {
  return `tariklab::${gameId}:active`;
}

export function backupSlotKey(gameId: string, slot: SlotIndex) {
  return `tariklab::${gameId}:${slot}:bak`;
}

export function readActiveSlot(storage: SlotStorage, gameId: string): SlotIndex {
  try {
    const raw = Number(storage.getItem(activeSlotKey(gameId)));
    return isSlotIndex(raw) ? raw : 1;
  } catch {
    return 1;
  }
}

export function writeActiveSlot(storage: SlotStorage, gameId: string, slot: SlotIndex) {
  try {
    storage.setItem(activeSlotKey(gameId), String(slot));
    return true;
  } catch {
    return false;
  }
}

export function readSlotRaw(storage: SlotStorage, gameId: string, slot: SlotIndex) {
  try {
    return storage.getItem(slotKey(gameId, slot));
  } catch {
    return null;
  }
}

export function writeSlotRaw(
  storage: SlotStorage,
  gameId: string,
  slot: SlotIndex,
  raw: string,
): { ok: true } | { ok: false; reason: "quota" | "error" } {
  const key = slotKey(gameId, slot);
  const bak = backupSlotKey(gameId, slot);
  try {
    const current = storage.getItem(key);
    if (current && current !== raw) {
      try {
        storage.setItem(bak, current);
      } catch {
        /* backup is best-effort */
      }
    }
    storage.setItem(key, raw);
    return { ok: true };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return { ok: false, reason: name === "QuotaExceededError" ? "quota" : "error" };
  }
}

export function clearSlot(storage: SlotStorage, gameId: string, slot: SlotIndex) {
  try {
    storage.removeItem(backupSlotKey(gameId, slot));
    storage.removeItem(slotKey(gameId, slot));
    return true;
  } catch {
    return false;
  }
}

export type LegacyMigration = {
  migrated: boolean;
  alreadyPresent: boolean;
  source: string | null;
};

export function migrateLegacyToSlot1(
  storage: SlotStorage,
  gameId: string,
  legacyKeys: string[],
): LegacyMigration {
  const flag = `tariklab::${gameId}:legacy-migrated`;
  const existing = readSlotRaw(storage, gameId, 1);
  if (existing !== null) {
    try { storage.setItem(flag, "1"); } catch { /* best effort */ }
    return { migrated: false, alreadyPresent: true, source: null };
  }
  try {
    if (storage.getItem(flag) === "1") return { migrated: false, alreadyPresent: false, source: null };
  } catch {
    return { migrated: false, alreadyPresent: false, source: null };
  }
  for (const key of legacyKeys) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(key);
    } catch {
      raw = null;
    }
    if (!raw || !parseSlotEnvelope(raw)) continue;
    const written = writeSlotRaw(storage, gameId, 1, raw);
    if (!written.ok) continue;
    try {
      storage.setItem(flag, "1");
    } catch {
      /* ignore */
    }
    writeActiveSlot(storage, gameId, 1);
    return { migrated: true, alreadyPresent: false, source: key };
  }
  try {
    storage.setItem(flag, "1");
  } catch {
    /* ignore */
  }
  return { migrated: false, alreadyPresent: false, source: null };
}

export function parseSlotEnvelope(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}
