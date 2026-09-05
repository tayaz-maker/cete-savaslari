import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { applyDecision, getAvailableDecisions } from "../public/games/tc-sim/js/time.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
}

test("ilişki kararı değeri değiştirir ve doğru NPC hafızasına yazılır", () => {
  const state = createNewGame({ seed: 41 });
  const before = state.relationships.mehmet;
  assert.equal(applyDecision(state, "friend").ok, true);
  assert.equal(state.relationships.mehmet, before + 7);
  assert.equal(
    state.people.find((person) => person.id === "mehmet").memories.at(-1).text,
    "Bu hafta birlikte vakit geçirdik.",
  );
  assert.equal(validateState(state).ok, true);
});

test("ilişki bağlamlı karar yalnız ilgili düşük ilişkide görünür", () => {
  const state = createNewGame({ seed: 42 });
  assert.equal(
    getAvailableDecisions(state).some((item) => item.id === "reconnect-mehmet"),
    false,
  );
  state.relationships.mehmet = 42;
  assert.equal(
    getAvailableDecisions(state).some((item) => item.id === "reconnect-mehmet"),
    true,
  );
  assert.equal(
    getAvailableDecisions(state).some((item) => item.id === "call-anne"),
    false,
  );
  assert.equal(applyDecision(state, "reconnect-mehmet").ok, true);
  assert.equal(state.relationships.mehmet, 47);
  assert.equal(state.people.find((person) => person.id === "mehmet").memories.length, 1);
});

test("ilişki ve NPC hafızası save/load sonrasında korunur", () => {
  const state = createNewGame({ seed: 43 });
  applyDecision(state, "family");
  const storage = new MemoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage).state;
  assert.equal(loaded.relationships.anne, 78);
  assert.equal(
    loaded.people.find((person) => person.id === "anne").memories.at(-1).text,
    "Bu hafta benimle vakit geçirdi.",
  );
});
