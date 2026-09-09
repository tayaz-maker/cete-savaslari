import test from "node:test";
import assert from "node:assert/strict";
import { createDuel, dispatch, rejection } from "../public/games/duel-core/rules.js";
import { battlePacket } from "../public/games/duel-core/battle.js";
import { generateDeck, validateDeck } from "../public/games/duel-core/deckgen.js";
import { validateState } from "../public/games/duel-core/model.js";
import { serialize, deserialize } from "../public/games/duel-core/save.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { chooseAction } from "../public/games/duel-core/ai.js";
import { publicView } from "../public/games/duel-core/projection.js";

const pool = Array.from({ length: 24 }, (_, i) => ({
  id: `FIX-${i}`,
  name: { tr: `Fixture ${i}`, en: `Fixture ${i}` },
  kind: i < 14 ? "unit" : i < 20 ? "spell" : "trap",
  subtype: "normal",
  deckLocation: "main",
  level: i < 14 ? 4 : 0,
  attack: 1500,
  defense: 1000,
  effects: i < 14 ? [] : [{ op: "points", amount: 100 }],
  text: { tr: "Test", en: "Test" },
  triggers: [],
}));
const act = (state, action) => {
  const result = dispatch(state, {
    player: state.pending?.responding ?? state.active,
    revision: state.revision,
    ...action,
  });
  assert.equal(result.ok, true, result.error);
  return result.state;
};

test("2003 opening draws, skips first battle, and resets exactly once", () => {
  let s = createDuel(pool, "fixture", 44);
  assert.equal(s.players[0].hand.length, 5);
  s = act(s, { type: "phase" });
  assert.equal(s.phase, "standby");
  assert.equal(s.players[0].hand.length, 6);
  const old = { type: "phase", player: 0, revision: s.revision };
  s = act(s, { type: "phase" });
  assert.equal(s.phase, "main1");
  assert.equal(dispatch(s, old).error, "stale-action");
  s = act(s, { type: "phase" });
  assert.equal(s.phase, "end");
  s = act(s, { type: "phase" });
  assert.equal(s.active, 1);
  assert.equal(s.turn, 2);
  s = act(s, { type: "phase" });
  assert.equal(s.players[1].hand.length, 6);
});
test("normal summon, set, position and atomic stale command rejection", () => {
  let s = createDuel(pool, "fixture", 44);
  s = act(act(s, { type: "phase" }), { type: "phase" });
  const card = s.players[0].hand.find((uid) => s.catalog[s.cards[uid].id].kind === "unit");
  const command = {
    type: "set-unit",
    card,
    slot: 0,
    tributes: [],
    player: 0,
    revision: s.revision,
  };
  s = act(s, command);
  assert.equal(s.cards[card].face, "down");
  assert.equal(s.cards[card].position, "defense");
  assert.equal(dispatch(s, command).error, "stale-action");
  assert.equal(
    rejection(s, { type: "position", card, player: 0, revision: s.revision }),
    "position-used",
  );
  assert.equal(s.players[0].normalUsed, 1);
  assert.equal(validateState(s), true);
});
test("battle matrix covers all base comparisons and direct damage", () => {
  const s = createDuel(pool, "fixture", 42),
    [a, b] = Object.keys(s.cards);
  for (const [atk, def, pos, damage, destroy] of [
    [2000, 1000, "attack", [0, 1000], [b]],
    [1000, 2000, "attack", [1000, 0], [a]],
    [1000, 1000, "attack", [0, 0], [a, b]],
    [2000, 1000, "defense", [0, 0], [b]],
    [1000, 2000, "defense", [1000, 0], []],
    [1000, 1000, "defense", [0, 0], []],
  ]) {
    s.cards[a].modifiers = [{ attackSet: atk, until: null }];
    s.cards[b].modifiers = [{ attackSet: def, defenseSet: def, until: null }];
    s.cards[b].position = pos;
    assert.deepEqual(battlePacket(s, a, b), { damage, destroy });
  }
  assert.deepEqual(battlePacket(s, a, null), { damage: [0, 1000], destroy: [] });
});
test("seeded deck generator is deterministic and preserves constraints", () => {
  for (let seed = 0; seed < 100; seed++) {
    const d = generateDeck(pool, seed);
    assert.equal(validateDeck(d, pool), true);
    assert.deepEqual(d, generateDeck(pool, seed));
  }
});
test("save reload preserves future draw, rejects duplicate locations and corruption", () => {
  const s = createDuel(pool, "fixture", 91),
    restored = deserialize(serialize(s), pool, "fixture");
  assert.equal(restored.ok, true);
  assert.deepEqual(restored.state, s);
  assert.deepEqual(act(restored.state, { type: "phase" }), act(s, { type: "phase" }));
  assert.equal(deserialize("{", pool, "fixture").ok, false);
  s.players[0].hand.push(s.players[0].deck[0]);
  assert.equal(validateState(s), false);
});
test("AI completes a legal fixture duel through the public information boundary", () => {
  let s = createDuel(pool, "fixture", 123),
    steps = 0;
  while (!s.result && steps++ < 1500) {
    const who = s.pending?.responding ?? s.active,
      view = publicView(s, who);
    assert.equal(view.players[1 - who].hand.length, 0);
    assert.equal(view.players[who].deck, undefined);
    const action = chooseAction(view, legalActions(s, who));
    assert.ok(action);
    s = act(s, action);
  }
  assert.ok(s.result);
  assert.equal(validateState(s), true);
});
