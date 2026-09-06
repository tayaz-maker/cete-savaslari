import assert from "node:assert/strict";
import test from "node:test";
import { createNewGame } from "../public/games/tc-sim/js/state.js";
import {
  SAVE_KEY,
  clearSaves,
  getActiveSlot,
  listSlots,
  loadGame,
  loadSlot,
  saveGame,
  setActiveSlot,
} from "../public/games/tc-sim/js/save.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
}

test("tc-sim slots stay isolated across save/load", () => {
  const storage = new MemoryStorage();
  const a = createNewGame({ name: "Deniz", seed: 1, now: "2027-01-01T00:00:00.000Z" });
  const b = createNewGame({ name: "Ece", seed: 2, now: "2027-01-01T00:00:00.000Z" });
  b.finances.balance = 9999;
  setActiveSlot(storage, 1);
  assert.equal(saveGame(storage, a).ok, true);
  setActiveSlot(storage, 2);
  assert.equal(saveGame(storage, b).ok, true);
  const first = loadSlot(storage, 1);
  const second = loadSlot(storage, 2);
  assert.equal(first.state.player.name, "Deniz");
  assert.equal(second.state.player.name, "Ece");
  assert.equal(second.state.finances.balance, 9999);
  assert.equal(first.state.finances.balance !== 9999, true);
});

test("tc-sim legacy save migrates once into slot 1", () => {
  const storage = new MemoryStorage();
  const legacy = createNewGame({ name: "Eski", seed: 9, now: "2027-01-01T00:00:00.000Z" });
  storage.setItem(SAVE_KEY, JSON.stringify(legacy));
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.state.player.name, "Eski");
  assert.equal(getActiveSlot(storage), 1);
  storage.setItem(SAVE_KEY, JSON.stringify(createNewGame({ name: "Yeni", seed: 8, now: "2027-01-01T00:00:00.000Z" })));
  const again = loadGame(storage);
  assert.equal(again.state.player.name, "Eski");
});

test("tc-sim clearing one slot leaves the other", () => {
  const storage = new MemoryStorage();
  setActiveSlot(storage, 1);
  saveGame(storage, createNewGame({ name: "A", seed: 1, now: "2027-01-01T00:00:00.000Z" }));
  setActiveSlot(storage, 2);
  saveGame(storage, createNewGame({ name: "B", seed: 2, now: "2027-01-01T00:00:00.000Z" }));
  assert.equal(clearSaves(storage), true);
  const slots = listSlots(storage);
  assert.equal(slots[1].empty, true);
  assert.equal(slots[0].name, "A");
});

test("corrupt slot does not hide a healthy sibling", () => {
  const storage = new MemoryStorage();
  setActiveSlot(storage, 2);
  saveGame(storage, createNewGame({ name: "Saglam", seed: 3, now: "2027-01-01T00:00:00.000Z" }));
  storage.setItem("tariklab::tc-sim:1", "{not-json");
  const slots = listSlots(storage);
  assert.equal(slots[0].empty, true);
  assert.equal(slots[1].name, "Saglam");
});
