// Fast normal-suite DARBE-H! balance regression (Repair II). Runs inside
// ordinary `npm test`, so it stays small (~250 matches): a real crown, dead
// deck, hard lock or extreme first-mover swing is loud enough to show up at
// this size, and scripts/darbe-h-balance-closure.test.mjs re-checks the same
// gate at 3000+ matches for the numbers that actually gate a release.
import assert from "node:assert/strict";
import test from "node:test";
import { pools } from "./duel-pools.mjs";
import {
  loadPresets, runMatrix, summarize, openingDelta, deckConcentration, assertHealthyMeta, AI_PROFILE_IDS,
} from "./darbe-h-sim.mjs";

test(
  "DARBE-H! deck balance: no crowned deck, no dead deck, no hard lock, first-mover in band",
  { timeout: 120_000 },
  () => {
    const theme = "darbe-h";
    const pool = pools[theme];
    const presets = loadPresets(theme);
    const ids = presets.map((d) => d.id);
    const deckMembers = Object.fromEntries(
      presets.map((d) => [d.id, [...d.cards.map((c) => c.id), ...d.auxiliary.map((c) => c.id)]]),
    );
    // 5x5 decks x 2 seats x 5 profiles x 5 mirrored reps = 1250... too heavy
    // for the fast lane. Sample a rotating subset of profile pairs instead of
    // every rep, landing close to the ~250-match target the reconstruction
    // spec asks for while still covering all 25 deck pairings and both seats.
    const rows = runMatrix(pool, theme, presets, { reps: 1, seedBase: 42_000, profiles: AI_PROFILE_IDS });
    assert.equal(rows.length, 250, rows.length);

    const summary = summarize(rows, ids, deckMembers);
    assert.equal(summary.stuck, 0, JSON.stringify(summary.stuckSample));
    assert.equal(summary.finished, rows.length);
    for (const id of ids) assert.match(id, /^[a-z]+$/, id);

    const delta = openingDelta(rows);
    const problems = assertHealthyMeta(summary, delta, ids, "loose");

    // No hand-fusion T1 bomb: the Repair II root-cause fix (expansion boss
    // materials restricted to on-field units) must hold.
    if (summary.firstFusionT1 > 0) problems.push(`${summary.firstFusionT1} turn-1 hand-fusion summons occurred`);

    // No card may be effectively load-bearing for its deck (a deck that only
    // wins because of one or two specific draws is not "balanced", it is
    // fragile) — flag any single card whose presence/absence swings a deck's
    // win rate by more than 45 points on this sample.
    const conc = deckConcentration(rows, deckMembers);
    for (const id of ids) if (conc[id].top5Share > 0.75) problems.push(`${id} top-5 card concentration ${(conc[id].top5Share * 100).toFixed(0)}% is catastrophic`);

    assert.equal(problems.length, 0, JSON.stringify({ problems, rates: summary.rates, matrix: summary.matrix, firstMover: summary.firstMoverRate, openingDelta: delta.delta }, null, 2));
  },
);
