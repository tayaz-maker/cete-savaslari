import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { pools } from "./duel-pools.mjs";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction, AI_PROFILE_IDS } from "../public/games/duel-core/ai.js";
import { expandDeck } from "../public/games/duel-core/decks.js";

function play(pool, presets, seed, deckA, deckB, first, profileA, profileB) {
  let state = createDuel(pool, "darbe-h", seed, first, [
    expandDeck(presets[deckA], pool, seed + 11),
    expandDeck(presets[deckB], pool, seed + 29),
  ]);
  let guard = 0;
  const plays = {};
  while (!state.result && guard++ < 4000) {
    const actor = state.choice?.player ?? state.pending?.responding ?? state.active;
    const legal = legalActions(state, actor);
    if (!legal.length) return { stuck: true, turn: state.turn, phase: state.phase };
    const pick = chooseAction(publicView(state, actor), legal, actor === 0 ? profileA : profileB);
    const res = dispatch(state, pick);
    if (!res.ok) return { fail: res.why, turn: state.turn };
    if (pick?.card) plays[pick.card] = (plays[pick.card] || 0) + 1;
    state = res.state;
    if (!Number.isFinite(state.players[0].points) || !Number.isFinite(state.players[1].points))
      return { nan: true, turn: state.turn };
  }
  return {
    result: state.result,
    turn: state.turn,
    first,
    deckA,
    deckB,
    plays,
    size: JSON.stringify({ ...state, catalog: undefined }).length,
  };
}

test("1000 DARBE-H! matches finish without a crowned deck or soft-lock", () => {
  const pool = pools["darbe-h"];
  const presets = JSON.parse(readFileSync("public/games/darbe-h/decks.json", "utf8")).decks;
  const ids = presets.map((d) => d.id);
  const rows = [];
  let n = 0;
  for (let rep = 0; rep < 4; rep++) {
    for (let a = 0; a < 5; a++) {
      for (let b = 0; b < 5; b++) {
        for (const first of [0, 1]) {
          for (const profile of AI_PROFILE_IDS) {
            if (rows.length >= 1000) break;
            rows.push(
              play(
                pool,
                Object.fromEntries(presets.map((d) => [d.id, d])),
                4000 + n,
                ids[a],
                ids[b],
                first,
                profile,
                AI_PROFILE_IDS[(n + 2) % AI_PROFILE_IDS.length],
              ),
            );
            n++;
          }
        }
      }
    }
  }
  assert.ok(rows.length >= 1000, rows.length);
  const sample = rows.slice(0, 1000);
  const stuck = sample.filter((r) => r.stuck || r.fail || r.nan);
  assert.equal(stuck.length, 0, JSON.stringify(stuck.slice(0, 3)));
  const finished = sample.filter((r) => r.result);
  assert.equal(finished.length, 1000);
  const wins = [0, 0, 0];
  const firstWins = [0, 0];
  const firstGames = [0, 0];
  const byDeck = Object.fromEntries(ids.map((id) => [id, { w: 0, n: 0 }]));
  const vs = {};
  const reasons = {};
  const turns = [];
  const cardUse = {};
  let maxSize = 0;
  for (const r of sample) {
    const w = r.result.winner;
    if (w === 0) wins[0]++;
    else if (w === 1) wins[1]++;
    else wins[2]++;
    reasons[r.result.reason || "x"] = (reasons[r.result.reason || "x"] || 0) + 1;
    firstGames[r.first]++;
    if (w === r.first) firstWins[r.first]++;
    byDeck[r.deckA].n++;
    if (w === 0) byDeck[r.deckA].w++;
    const key = `${r.deckA}>${r.deckB}`;
    vs[key] = vs[key] || { n: 0, a: 0 };
    vs[key].n++;
    if (w === 0) vs[key].a++;
    turns.push(r.turn);
    maxSize = Math.max(maxSize, r.size || 0);
    for (const [id, c] of Object.entries(r.plays || {})) cardUse[id] = (cardUse[id] || 0) + c;
  }
  turns.sort((a, b) => a - b);
  const rates = Object.fromEntries(
    ids.map((id) => [id, Number((byDeck[id].w / Math.max(1, byDeck[id].n)).toFixed(3))]),
  );
  const dominantDeck = ids.reduce((a, b) => (rates[a] > rates[b] ? a : b));
  const dominantCard = Object.entries(cardUse).sort((a, b) => b[1] - a[1])[0];
  const firstRate = firstWins[0] / Math.max(1, firstGames[0]);
  console.log(
    JSON.stringify({
      n: 1000,
      wins,
      draws: wins[2],
      reasons,
      rates,
      firstPlayerWinRate: Number(firstRate.toFixed(3)),
      medianTurn: turns[500],
      p90Turn: turns[900],
      p95Turn: turns[950],
      maxTurn: turns[999],
      maxSave: maxSize,
      dominantDeck,
      dominantCard,
    }),
  );
  assert.ok(wins[0] > 200 && wins[1] > 200, JSON.stringify(wins));
  for (const id of ids) {
    assert.ok(rates[id] > 0.15 && rates[id] < 0.85, `${id} ${rates[id]}`);
  }
  assert.ok(firstRate > 0.25 && firstRate < 0.75, firstRate);
  assert.ok(turns[999] < 200);
  assert.ok(maxSize < 200000);
});
