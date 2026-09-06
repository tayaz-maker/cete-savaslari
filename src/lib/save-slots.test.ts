import assert from "node:assert/strict";
import test from "node:test";
import {
  SLOT_COUNT,
  clearSlot,
  migrateLegacyToSlot1,
  parseSlotEnvelope,
  readActiveSlot,
  readSlotRaw,
  slotKey,
  writeActiveSlot,
  writeSlotRaw,
} from "./save-slots.ts";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(key: string) {
    return this.data.has(key) ? this.data.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, String(value));
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

test("slot keys stay namespaced and collision-safe", () => {
  assert.equal(SLOT_COUNT, 3);
  assert.equal(slotKey("cete", 1), "tariklab::cete:1");
  assert.notEqual(slotKey("cete", 1), slotKey("tc-sim", 1));
  assert.notEqual(slotKey("cete", 1), slotKey("cete", 2));
});

test("active slot defaults to 1 and persists independently", () => {
  const storage = new MemoryStorage();
  assert.equal(readActiveSlot(storage, "cete"), 1);
  writeActiveSlot(storage, "cete", 2);
  assert.equal(readActiveSlot(storage, "cete"), 2);
  assert.equal(readActiveSlot(storage, "hanedan"), 1);
});

test("slots do not bleed state", () => {
  const storage = new MemoryStorage();
  assert.equal(writeSlotRaw(storage, "cete", 1, JSON.stringify({ cash: 10 })).ok, true);
  assert.equal(writeSlotRaw(storage, "cete", 2, JSON.stringify({ cash: 99 })).ok, true);
  assert.equal(JSON.parse(readSlotRaw(storage, "cete", 1) || "{}").cash, 10);
  assert.equal(JSON.parse(readSlotRaw(storage, "cete", 2) || "{}").cash, 99);
  clearSlot(storage, "cete", 1);
  assert.equal(readSlotRaw(storage, "cete", 1), null);
  assert.equal(JSON.parse(readSlotRaw(storage, "cete", 2) || "{}").cash, 99);
});

test("legacy save migrates once into slot 1", () => {
  const storage = new MemoryStorage();
  storage.setItem("cete-savaslari-save-v1", JSON.stringify({ player: { name: "Eski" } }));
  const first = migrateLegacyToSlot1(storage, "cete", ["cete-savaslari-save-v1"]);
  assert.equal(first.migrated, true);
  assert.equal(JSON.parse(readSlotRaw(storage, "cete", 1) || "{}").player.name, "Eski");
  storage.setItem("cete-savaslari-save-v1", JSON.stringify({ player: { name: "Yeni" } }));
  const second = migrateLegacyToSlot1(storage, "cete", ["cete-savaslari-save-v1"]);
  assert.equal(second.migrated, false);
  assert.equal(second.alreadyPresent, true);
  assert.equal(JSON.parse(readSlotRaw(storage, "cete", 1) || "{}").player.name, "Eski");
});

test("corrupt JSON does not poison sibling slots", () => {
  const storage = new MemoryStorage();
  writeSlotRaw(storage, "cete", 2, JSON.stringify({ ok: true }));
  storage.setItem(slotKey("cete", 1), "{not-json");
  assert.equal(parseSlotEnvelope(readSlotRaw(storage, "cete", 1)), null);
  assert.equal(parseSlotEnvelope(readSlotRaw(storage, "cete", 2))?.ok, true);
});

test("existing slot seals migration and deletion cannot resurrect legacy", () => {
  const storage = new MemoryStorage();
  storage.setItem("legacy", '{"player":{"name":"old"}}');
  storage.setItem(slotKey("cete", 1), '{"player":{"name":"new"}}');
  migrateLegacyToSlot1(storage, "cete", ["legacy"]);
  clearSlot(storage, "cete", 1);
  assert.equal(migrateLegacyToSlot1(storage, "cete", ["legacy"]).migrated, false);
  assert.equal(readSlotRaw(storage, "cete", 1), null);
  assert.equal(migrateLegacyToSlot1(storage, "hanedan", ["legacy"]).migrated, true);
});

test("corrupt legacy is skipped and quota preserves previous slot", () => {
  const storage = new MemoryStorage();
  storage.setItem("legacy", "{bad");
  assert.equal(migrateLegacyToSlot1(storage, "cete", ["legacy"]).migrated, false);
  storage.setItem(slotKey("cete", 2), '{"old":true}');
  storage.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); };
  assert.deepEqual(writeSlotRaw(storage, "cete", 2, '{}'), { ok: false, reason: "quota" });
  assert.equal(readSlotRaw(storage, "cete", 2), '{"old":true}');
});
