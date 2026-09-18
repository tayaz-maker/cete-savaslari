// Smoke/regression tests for the DARBE-H! Repair II instrumentation itself
// (scripts/darbe-h-sim.mjs). These do not judge game balance — they judge
// whether the harness measuring it is trustworthy, since a broken metric is
// worse than no metric (Repair I's own report mis-stated its first-mover
// number this way).
import assert from "node:assert/strict";
import test from "node:test";
import { pools } from "./duel-pools.mjs";
import {
  loadPresets, playMatch, runMatrix, summarize, openingDelta, deckConcentration, assertHealthyMeta, AI_PROFILE_IDS,
} from "./darbe-h-sim.mjs";

test("runMatrix produces exactly reps x decks^2 x 2 seats x profiles rows", () => {
  const theme = "darbe-h";
  const presets = loadPresets(theme);
  const rows = runMatrix(pools[theme], theme, presets, { reps: 1, seedBase: 1 });
  assert.equal(rows.length, presets.length * presets.length * 2 * AI_PROFILE_IDS.length);
});

test("mirrored rows share a seed and only the opening seat differs", () => {
  const theme = "darbe-h";
  const presets = loadPresets(theme);
  const rows = runMatrix(pools[theme], theme, presets, { reps: 1, seedBase: 500 });
  const byKey = new Map();
  for (const r of rows) {
    const key = `${r.seed}|${r.deckA}|${r.deckB}`;
    const slot = byKey.get(key) || {};
    slot[r.first] = r;
    byKey.set(key, slot);
  }
  let pairs = 0;
  for (const slot of byKey.values()) {
    if (slot[0] === undefined || slot[1] === undefined) continue;
    pairs++;
    assert.equal(slot[0].seed, slot[1].seed);
    assert.equal(slot[0].deckA, slot[1].deckA);
    assert.equal(slot[0].deckB, slot[1].deckB);
    assert.notEqual(slot[0].first, slot[1].first);
  }
  // Every (seed, deckA, deckB, profile) cell should have exactly one
  // mirrored pair -- runMatrix fixes a fresh seed per (rep, a, b, profile),
  // so a (deckA, deckB) combination carries AI_PROFILE_IDS.length pairs, not
  // just one.
  assert.equal(pairs, presets.length * presets.length * AI_PROFILE_IDS.length);
});

test("playMatch never records a foreign-theme id and finishes within the turn guard", () => {
  const theme = "darbe-h";
  const pool = pools[theme];
  const presets = loadPresets(theme);
  const ids = presets.map((d) => d.id);
  for (let seed = 0; seed < 12; seed++) {
    const r = playMatch(pool, theme, presets, {
      seed: 9000 + seed, deckA: ids[seed % ids.length], deckB: ids[(seed + 1) % ids.length],
      first: seed % 2, profileA: AI_PROFILE_IDS[seed % AI_PROFILE_IDS.length], profileB: AI_PROFILE_IDS[(seed + 2) % AI_PROFILE_IDS.length],
    });
    assert.ok(r.result || r.stuck, JSON.stringify(r).slice(0, 200));
    for (const id of Object.keys(r.plays || {})) assert.match(id, /^DRB-\d{3}$/, id);
  }
});

test("the reconstructed materials fix holds: no DARBE-H! match ends with a turn-1 hand fusion", () => {
  const theme = "darbe-h";
  const presets = loadPresets(theme);
  const rows = runMatrix(pools[theme], theme, presets, { reps: 1, seedBase: 2000 });
  const summary = summarize(rows, presets.map((d) => d.id));
  assert.equal(summary.firstFusionT1, 0, "expansion boss fusion must require on-field materials");
});

test("openingDelta computes seat0-opening vs seat0-not-opening across every mirrored pair", () => {
  const rows = [
    { seed: 1, deckA: "a", deckB: "b", first: 0, result: { winner: 0 } },
    { seed: 1, deckA: "a", deckB: "b", first: 1, result: { winner: 1 } },
    { seed: 2, deckA: "a", deckB: "b", first: 0, result: { winner: 1 } },
    { seed: 2, deckA: "a", deckB: "b", first: 1, result: { winner: 0 } },
  ];
  const delta = openingDelta(rows);
  assert.equal(delta.pairs, 2);
  // seat0 opens (first=0) and wins in pair 1, loses in pair 2 -> 0.5
  assert.equal(delta.seat0WinsWhenOpening, 0.5);
  // seat0 does not open (first=1): wins pair2's first=1 row (winner 0), loses pair1's -> 0.5
  assert.equal(delta.seat0WinsWhenNotOpening, 0.5);
  assert.equal(delta.delta, 0);
});

test("deckConcentration attributes plays only to a deck's own member cards", () => {
  const rows = [
    { deckA: "a", deckB: "b", plays: { "X-001": 3, "Y-001": 2 } },
    { deckA: "b", deckB: "a", plays: { "X-001": 1, "Z-001": 4 } },
  ];
  const members = { a: ["X-001", "Z-001"], b: ["Y-001"] };
  const conc = deckConcentration(rows, members);
  assert.equal(conc.a.total, 3 + 1 + 4); // X-001 counted in both rows since a plays it both times, Z-001 in row 2
  assert.equal(conc.b.total, 2);
  assert.deepEqual(conc.b.neverPlayed, []);
});

test("assertHealthyMeta(tight) rejects a synthetic hard-lock and dead-deck summary", () => {
  const ids = ["a", "b"];
  const summary = {
    rates: { a: 0.95, b: 0.05 },
    matrix: { a: { a: { n: 0, win: 0 }, b: { n: 100, win: 0.95 } }, b: { a: { n: 100, win: 0.05 }, b: { n: 0, win: 0 } } },
    firstMoverRate: 0.5,
    stuck: 0,
  };
  const problems = assertHealthyMeta(summary, { delta: 0 }, ids, "tight");
  assert.ok(problems.length > 0);
});

test("assertHealthyMeta(loose) accepts a healthy synthetic summary", () => {
  const ids = ["a", "b", "c"];
  const summary = {
    rates: { a: 0.48, b: 0.52, c: 0.5 },
    matrix: {
      a: { a: { n: 0, win: 0 }, b: { n: 100, win: 0.45 }, c: { n: 100, win: 0.55 } },
      b: { a: { n: 100, win: 0.55 }, b: { n: 0, win: 0 }, c: { n: 100, win: 0.5 } },
      c: { a: { n: 100, win: 0.45 }, b: { n: 100, win: 0.5 }, c: { n: 0, win: 0 } },
    },
    firstMoverRate: 0.55,
    stuck: 0,
  };
  const problems = assertHealthyMeta(summary, { delta: 0.1 }, ids, "loose");
  assert.deepEqual(problems, []);
});
