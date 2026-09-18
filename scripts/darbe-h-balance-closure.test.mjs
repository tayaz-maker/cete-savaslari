// Heavy DARBE-H! Repair II closure matrix. NOT part of the fast lane: set
// DARBE_H_CLOSURE=1 to actually run the 3000+-match matrix (several minutes).
// Without it the suite reports as skipped so `npm test` accounts for the
// file without paying its cost on every run — the reconstruction spec asks
// for the heavy matrix to live "outside normal npm test if appropriate".
import assert from "node:assert/strict";
import test from "node:test";
import { pools } from "./duel-pools.mjs";
import {
  loadPresets, runMatrix, summarize, openingDelta, deckConcentration, assertHealthyMeta, AI_PROFILE_IDS,
} from "./darbe-h-sim.mjs";

const RUN = process.env.DARBE_H_CLOSURE === "1";
const SKIP_REASON = "set DARBE_H_CLOSURE=1 to run the 3000+-match DARBE-H! closure matrix";

test(
  "DARBE-H! closure: 3000+ mirrored matches, tight bands, full matchup matrix",
  { timeout: 20 * 60_000, skip: RUN ? false : SKIP_REASON },
  () => {
    const theme = "darbe-h";
    const pool = pools[theme];
    const presets = loadPresets(theme);
    const ids = presets.map((d) => d.id);
    const deckMembers = Object.fromEntries(
      presets.map((d) => [d.id, [...d.cards.map((c) => c.id), ...d.auxiliary.map((c) => c.id)]]),
    );
    // reps=12 -> 5x5x2x5x12 = 3000 matches.
    const rows = runMatrix(pool, theme, presets, { reps: 12, seedBase: 70_000, profiles: AI_PROFILE_IDS });
    assert.equal(rows.length, 3000, rows.length);

    const summary = summarize(rows, ids, deckMembers);
    const delta = openingDelta(rows);
    const conc = deckConcentration(rows, deckMembers);

    console.log(JSON.stringify({
      n: rows.length, finished: summary.finished, stuck: summary.stuck,
      rates: summary.rates, matrix: summary.matrix,
      firstMoverRate: summary.firstMoverRate, firstMoverBySeat: summary.firstMoverBySeat,
      openingDelta: delta, medianTurn: summary.medianTurn, p75Turn: summary.p75Turn,
      p90Turn: summary.p90Turn, p95Turn: summary.p95Turn, maxTurn: summary.maxTurn,
      deckOut: summary.deckOut, deckOutBy: summary.deckOutBy,
      firstFusionT1: summary.firstFusionT1,
      top20PlayRate: summary.top20PlayRate, top20Opening: summary.top20Opening,
      topWinDelta: summary.topWinDelta, concentration: conc,
    }, null, 2));

    assert.equal(summary.stuck, 0, JSON.stringify(summary.stuckSample));
    assert.equal(summary.firstFusionT1, 0, "the Repair II material-zone fix must hold at scale");

    const problems = assertHealthyMeta(summary, delta, ids, "tight");
    for (const id of ids) if (conc[id].top5Share > 0.7) problems.push(`${id} top-5 concentration ${(conc[id].top5Share * 100).toFixed(0)}%`);
    assert.equal(problems.length, 0, JSON.stringify(problems, null, 2));
  },
);
