import assert from "node:assert/strict";
import test from "node:test";
import { ARCHETYPE_IDS } from "../public/games/ihtilal/decks.js";
import { actingPlayer, applyAction, createMatch, legalActions, publicView } from "../public/games/ihtilal/engine.js";
import { AI_PROFILES, chooseAction } from "../public/games/ihtilal/ai.js";
import { mulberry } from "../public/games/ihtilal/rng.js";

function runMatch(seed, a, b, profileA, profileB) {
  const state = createMatch({ seed, playerArchetype: a, oppArchetype: b });
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
  };
}

test("500-match matrix finishes, stays finite, and does not crown one deck", () => {
  const rows = [];
  let i = 0;
  for (const a of ARCHETYPE_IDS) {
    for (const b of ARCHETYPE_IDS) {
      for (const profile of AI_PROFILES) {
        rows.push(runMatch(2000 + i, a, b, profile, "adaptive"));
        i += 1;
      }
    }
  }
  // 6*6*6 = 216. Fill to 500 with extra seeds.
  while (rows.length < 500) {
    const a = ARCHETYPE_IDS[rows.length % 6];
    const b = ARCHETYPE_IDS[(rows.length * 3) % 6];
    const p = AI_PROFILES[rows.length % AI_PROFILES.length];
    rows.push(runMatch(8000 + rows.length, a, b, p, AI_PROFILES[(rows.length + 2) % AI_PROFILES.length]));
  }
  assert.equal(rows.length, 500);
  const stuck = rows.filter((r) => r.stuck || r.fail);
  assert.equal(stuck.length, 0, JSON.stringify(stuck.slice(0, 3)));
  const finished = rows.filter((r) => r.result);
  assert.equal(finished.length, 500);
  const wins = [0, 0, 0];
  const reasons = {};
  const byArch = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, { w: 0, n: 0 }]));
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
    const a = ARCHETYPE_IDS[n % 6];
    byArch[a].n += 1;
    if (r.result.winner === 0) byArch[a].w += 1;
  }
  assert.ok(maxTurn <= 80);
  assert.ok(maxSize < 40000, maxSize);
  assert.ok(wins[0] > 40 && wins[1] > 40, JSON.stringify({ wins, reasons }));
  for (const id of ARCHETYPE_IDS) {
    const rate = byArch[id].w / Math.max(1, byArch[id].n);
    assert.ok(rate > 0.05 && rate < 0.95, `${id} ${rate}`);
  }
});
