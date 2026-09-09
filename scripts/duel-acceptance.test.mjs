import test from "node:test";
import assert from "node:assert/strict";
import { pools } from "./duel-pools.mjs";
import { generateDeck, validateDeck } from "../public/games/duel-core/deckgen.js";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction } from "../public/games/duel-core/ai.js";
import {
  serialize,
  deserialize,
  saveDuel,
  loadDuel,
  saveKey,
} from "../public/games/duel-core/save.js";
import { primitives } from "../public/games/duel-core/effects.js";
import { labels } from "../public/games/duel-core/labels.js";

for (const [theme, pool] of Object.entries(pools)) {
  test(`${theme}: all 150 source identities, bilingual fields and typed operations resolve`, () => {
    assert.equal(pool.length, 150);
    assert.equal(new Set(pool.map((c) => c.id)).size, 150);
    for (const [i, c] of pool.entries()) {
      assert.equal(Number(c.id.slice(4)), i + 1);
      assert.ok(c.name.tr && c.name.en && c.text.tr && c.text.en);
      assert.ok(Number.isFinite(c.attack) && Number.isFinite(c.defense));
      for (const op of [...c.effects, ...c.triggers.flatMap((t) => t.effects)])
        assert.equal(typeof primitives[op.op], "function", `${c.id}: ${op.op}`);
    }
  });
  test(`${theme}: 10,000 seeded decks satisfy the composition and name-copy constraints`, () => {
    for (let seed = 0; seed < 10000; seed++)
      assert.deepEqual(validateDeck(generateDeck(pool, seed), pool), true, `seed ${seed}`);
  });
  test(`${theme}: pending decisions, responses and subsequent AI actions survive every reload`, () => {
    let state = createDuel(pool, theme, 28),
      choices = 0;
    for (let step = 0; step < 500 && !state.result; step++) {
      const restored = deserialize(serialize(state), pool, theme);
      assert.equal(restored.ok, true);
      assert.deepEqual(restored.state, state);
      const player = state.choice?.player ?? state.pending?.responding ?? state.active;
      const action = chooseAction(publicView(state, player), legalActions(state, player));
      assert.ok(action);
      const live = dispatch(state, action),
        loaded = dispatch(restored.state, action);
      assert.equal(live.ok, true);
      assert.deepEqual(loaded, live);
      state = live.state;
      if (state.choice) choices++;
    }
    assert.ok(state.result);
    assert.ok(choices > 0);
  });
  test(`${theme}: public projection does not contain opponent hand identities or deck order`, () => {
    const s = createDuel(pool, theme, 42),
      v = publicView(s, 0);
    assert.deepEqual(v.players[1].hand, []);
    assert.equal("deck" in v.players[0], false);
    for (const uid of [...s.players[1].hand, ...s.players[0].deck, ...s.players[1].deck])
      assert.equal(uid in v.cards, false);
    assert.equal("catalog" in v, false);
    assert.equal("rng" in v, false);
  });
  test(`${theme}: quota failure leaves primary intact and corruption recovers only a valid backup`, () => {
    const data = new Map(),
      storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
    const state = createDuel(pool, theme, 17);
    assert.equal(saveDuel(storage, state).ok, true);
    const original = storage.getItem(saveKey(theme));
    const failed = saveDuel(
      {
        ...storage,
        setItem: () => {
          throw Error("quota");
        },
      },
      state,
    );
    assert.equal(failed.ok, false);
    assert.equal(storage.getItem(saveKey(theme)), original);
    assert.equal(saveDuel(storage, state).ok, true);
    storage.setItem(saveKey(theme), "{broken");
    const recovered = loadDuel(storage, pool, theme);
    assert.equal(recovered.ok, true);
    assert.equal(recovered.recovered, true);
    assert.deepEqual(recovered.state, state);
  });
}
test("TR and EN UI keys are complete and symmetrical", () => {
  assert.deepEqual(Object.keys(labels.tr).sort(), Object.keys(labels.en).sort());
  for (const dict of Object.values(labels))
    assert.ok(Object.values(dict).every((v) => typeof v === "string" && v.length));
});
