#!/usr/bin/env node
// DARBE-H! Repair II diagnostic CLI. Stages:
//   node scripts/darbe-h-diagnose.mjs A [n]        - diagnostic run (default 750)
//   node scripts/darbe-h-diagnose.mjs B [n]        - mirrored balance run (default 1250)
//   node scripts/darbe-h-diagnose.mjs C [n]        - heavy closure matrix (default 3000)
//   node scripts/darbe-h-diagnose.mjs sibling [n]  - DARBE/VETO/GETT first-mover A/B (default 600 each)
import { pools } from "./duel-pools.mjs";
import {
  loadPresets, playMatch, runMatrix, summarize, openingDelta, deckConcentration, AI_PROFILE_IDS,
} from "./darbe-h-sim.mjs";

function deckMembersOf(presets) {
  return Object.fromEntries(
    presets.map((d) => [d.id, [...d.cards.map((c) => c.id), ...d.auxiliary.map((c) => c.id)]]),
  );
}

function report(theme, rows, presets) {
  const ids = presets.map((d) => d.id);
  const deckMembers = deckMembersOf(presets);
  const summary = summarize(rows, ids, deckMembers);
  const delta = openingDelta(rows);
  const conc = deckConcentration(rows, deckMembers);
  console.log(`\n=== ${theme}: ${rows.length} matches (${summary.finished} finished, ${summary.stuck} stuck/failed) ===`);
  console.log("deck rates:", JSON.stringify(summary.rates, null, 0));
  console.log("matchup matrix (row win% vs column):");
  for (const a of ids) console.log("  " + a.padEnd(11), ids.map((b) => (a === b ? "  -  " : (summary.matrix[a][b].win * 100).toFixed(0).padStart(3) + "%")).join(" "));
  console.log("first-mover rate:", summary.firstMoverRate.toFixed(3), "| seat0-opens:", summary.firstMoverBySeat.seat0Opens.toFixed(3), "seat1-opens:", summary.firstMoverBySeat.seat1Opens.toFixed(3));
  console.log("opening delta (mirrored pairs):", delta.delta.toFixed(3), "pairs:", delta.pairs, "flipShare:", delta.flipShare.toFixed(3));
  console.log("turns median/p75/p90/p95/max:", summary.medianTurn, summary.p75Turn, summary.p90Turn, summary.p95Turn, summary.maxTurn);
  console.log("deck-out:", summary.deckOut, JSON.stringify(summary.deckOutBy));
  console.log("firstFusionT1 (T1 hand-fusion bombs):", summary.firstFusionT1, "/", rows.length);
  for (const id of ids) {
    const c = conc[id];
    console.log(`  ${id}: distinct=${c.distinct} top5Share=${(c.top5Share * 100).toFixed(1)}% topCard=${c.topCard?.[0]}(${c.topCard?.[1]}) neverPlayed=${JSON.stringify(c.neverPlayed)}`);
  }
  const dominant = ids.reduce((a, b) => (summary.rates[a] > summary.rates[b] ? a : b));
  const weakest = ids.reduce((a, b) => (summary.rates[a] < summary.rates[b] ? a : b));
  console.log("current dominant deck:", dominant, summary.rates[dominant].toFixed(3), "| current weakest:", weakest, summary.rates[weakest].toFixed(3));
  return { summary, delta, conc };
}

const stage = process.argv[2] || "A";
const n = Number(process.argv[3]) || { A: 750, B: 1250, C: 3000, sibling: 600 }[stage];

if (stage === "A" || stage === "B" || stage === "C") {
  const theme = "darbe-h";
  const presets = loadPresets(theme);
  const reps = Math.max(1, Math.round(n / (presets.length * presets.length * 2 * AI_PROFILE_IDS.length)));
  const rows = runMatrix(pools[theme], theme, presets, { reps, seedBase: stage === "A" ? 1000 : stage === "B" ? 3000 : 7000 });
  report(theme, rows, presets);
} else if (stage === "sibling") {
  for (const theme of ["darbe-h", "veto-h", "gett-oh"]) {
    const presets = loadPresets(theme);
    const reps = Math.max(1, Math.round(n / (presets.length * presets.length * 2 * AI_PROFILE_IDS.length)));
    const rows = runMatrix(pools[theme], theme, presets, { reps, seedBase: 20000 });
    const { summary, delta } = report(theme, rows, presets);
    console.log(`>>> ${theme} first-mover=${summary.firstMoverRate.toFixed(3)} openingDelta=${delta.delta.toFixed(3)}`);
  }
} else {
  console.error(`Unknown stage "${stage}". Use A, B, C or sibling.`);
  process.exit(1);
}
