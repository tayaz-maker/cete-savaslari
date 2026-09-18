import assert from "node:assert/strict";
import test from "node:test";
import { ARCHETYPE_IDS } from "../public/games/ihtilal/decks.js";
import { actingPlayer, applyAction, createMatch, legalActions, publicView } from "../public/games/ihtilal/engine.js";
import { AI_PROFILES, chooseAction } from "../public/games/ihtilal/ai.js";
import { mulberry } from "../public/games/ihtilal/rng.js";

function runMatch(seed, a, b, profileA, profileB, first = 0) {
  const state = createMatch({ seed, playerArchetype: a, oppArchetype: b, first });
  let guard = 0;
  let plays = 0;
  while (!state.result && guard++ < 500) {
    const actor = actingPlayer(state);
    const acts = legalActions(state);
    if (!acts.length) return { stuck: true, turn: state.turn, phase: state.phase };
    const profile = actor === 0 ? profileA : profileB;
    const rng = mulberry((seed + state.turn * 997 + guard * 13 + actor) >>> 0);
    const pick = chooseAction(publicView(state, actor), acts, profile, rng) || acts.at(-1);
    const result = applyAction(state, pick);
    if (!result.ok) return { fail: result.why, pick, turn: state.turn };
    if (pick.type === "play" || pick.type === "counter") plays += 1;
  }
  return {
    result: state.result,
    turn: state.turn,
    heat: state.heat,
    hukum: state.players.map((p) => p.hukum),
    locks: [0, 1].map((id) => Object.values(state.desks).filter((d) => d.lock === id).length),
    plays,
    size: JSON.stringify(state).length,
    a,
    b,
  };
}

test("1,296-match mirrored matrix has defensible pacing, heat, seats and archetypes", () => {
  const rows = [];
  let group = 0;
  for (const a of ARCHETYPE_IDS) {
    for (const b of ARCHETYPE_IDS) {
      for (let i = 0; i < 18; i += 1) {
        const profileA = AI_PROFILES[i % AI_PROFILES.length];
        const profileB = AI_PROFILES[(i + 3) % AI_PROFILES.length];
        const seed = 100000 + group * 37 + i;
        rows.push(runMatch(seed, a, b, profileA, profileB, i % 2));
        rows.push(runMatch(seed, b, a, profileB, profileA, 1 - (i % 2)));
      }
      group += 1;
    }
  }
  assert.equal(rows.length, 1296);
  const stuck = rows.filter((r) => r.stuck || r.fail);
  assert.equal(stuck.length, 0, JSON.stringify(stuck.slice(0, 3)));
  const finished = rows.filter((r) => r.result);
  assert.equal(finished.length, 1296);
  const wins = [0, 0, 0];
  const reasons = {};
  const byArch = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, { w: 0, l: 0, d: 0, n: 0 }]));
  let maxTurn = 0;
  let maxSize = 0;
  for (let n = 0; n < rows.length; n++) {
    const r = rows[n];
    maxTurn = Math.max(maxTurn, r.turn);
    maxSize = Math.max(maxSize, r.size);
    reasons[r.result.reason] = (reasons[r.result.reason] || 0) + 1;
    if (r.result.winner === 0) wins[0] += 1;
    else if (r.result.winner === 1) wins[1] += 1;
    else wins[2] += 1;
    for (const seat of [0, 1]) {
      const id = seat === 0 ? r.a : r.b;
      byArch[id].n += 1;
      if (r.result.winner === "draw") byArch[id].d += 1;
      else if (r.result.winner === seat) byArch[id].w += 1;
      else byArch[id].l += 1;
    }
  }
  assert.ok(maxTurn <= 80);
  assert.ok(maxSize < 40000, maxSize);
  const decisive = wins[0] + wins[1];
  const firstAdvantage = Math.abs(wins[0] - wins[1]) / decisive;
  const turns = rows.map((r) => r.turn).sort((a, b) => a - b);
  const percentile = (p) => turns[Math.floor((turns.length - 1) * p)];
  assert.ok(firstAdvantage < 0.08, JSON.stringify({ wins, firstAdvantage }));
  assert.ok((reasons.time || 0) / rows.length < 0.1, JSON.stringify(reasons));
  assert.ok((reasons.dagilma || 0) > 0, JSON.stringify(reasons));
  assert.ok(percentile(0.5) < 20 && percentile(0.95) < 35, JSON.stringify({ median: percentile(0.5), p95: percentile(0.95) }));
  for (const id of ARCHETYPE_IDS) {
    const rate = byArch[id].w / Math.max(1, byArch[id].w + byArch[id].l);
    assert.ok(rate >= 0.4 && rate <= 0.6, `${id} ${rate}`);
  }
  console.log("IHTILAL_MATRIX", JSON.stringify({ wins, reasons, median: percentile(0.5), p95: percentile(0.95), byArch }));
});
