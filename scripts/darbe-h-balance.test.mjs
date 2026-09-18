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
  const opening = {};
  const terminal = {};
  while (!state.result && guard++ < 4000) {
    const actor = state.choice?.player ?? state.pending?.responding ?? state.active;
    const legal = legalActions(state, actor);
    if (!legal.length) return { stuck: true, turn: state.turn, phase: state.phase };
    const pick = chooseAction(publicView(state, actor), legal, actor === 0 ? profileA : profileB);
    const printed = pick?.card ? state.cards[pick.card]?.id || pick.card : null;
    const res = dispatch(state, pick);
    if (!res.ok) return { fail: res.why || res.error, turn: state.turn };
    if (printed && printed.startsWith("DRB-")) {
      plays[printed] = (plays[printed] || 0) + 1;
      if (state.turn <= 2) opening[printed] = (opening[printed] || 0) + 1;
      terminal[printed] = (terminal[printed] || 0) + 1;
    }
    state = res.state;
    if (!Number.isFinite(state.players[0].points) || !Number.isFinite(state.players[1].points))
      return { nan: true, turn: state.turn };
  }
  const last = Object.entries(terminal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => id);
  return {
    result: state.result,
    turn: state.turn,
    first,
    deckA,
    deckB,
    profileA,
    profileB,
    plays,
    opening,
    last,
    size: JSON.stringify({ ...state, catalog: undefined }).length,
  };
}

test(
  "2500 mirrored DARBE-H! matches finish without a crowned deck or uid telemetry",
  { timeout: 600_000 },
  () => {
    const pool = pools["darbe-h"];
    const presets = JSON.parse(readFileSync("public/games/darbe-h/decks.json", "utf8")).decks;
    const ids = presets.map((d) => d.id);
    const byPreset = Object.fromEntries(presets.map((d) => [d.id, d]));
    const rows = [];
    let n = 0;
    // 5×5 decks × 2 seats × 5 AI profiles × 10 mirrored reps = 2500.
    for (let rep = 0; rep < 10; rep++) {
      for (let a = 0; a < 5; a++) {
        for (let b = 0; b < 5; b++) {
          for (const first of [0, 1]) {
            for (const profile of AI_PROFILE_IDS) {
              rows.push(
                play(
                  pool,
                  byPreset,
                  5000 + n,
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
    assert.equal(rows.length, 2500, rows.length);
    const stuck = rows.filter((r) => r.stuck || r.fail || r.nan);
    assert.equal(stuck.length, 0, JSON.stringify(stuck.slice(0, 3)));
    const finished = rows.filter((r) => r.result);
    assert.equal(finished.length, 2500);
    const wins = [0, 0, 0];
    const firstWins = [0, 0];
    const firstGames = [0, 0];
    const byDeck = Object.fromEntries(ids.map((id) => [id, { w: 0, n: 0 }]));
    const vs = {};
    const reasons = {};
    const turns = [];
    const cardUse = {};
    const cardWins = {};
    const openingUse = {};
    const playedGames = {};
    let maxSize = 0;
    for (const r of finished) {
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
      const seen = new Set(Object.keys(r.plays || {}));
      for (const [id, c] of Object.entries(r.plays || {})) {
        assert.match(id, /^DRB-\d{3}$/, id);
        cardUse[id] = (cardUse[id] || 0) + c;
        if (w === 0) cardWins[id] = (cardWins[id] || 0) + c;
      }
      for (const id of seen) {
        playedGames[id] = playedGames[id] || { n: 0, w: 0 };
        playedGames[id].n++;
        if (w === 0) playedGames[id].w++;
      }
      for (const [id, c] of Object.entries(r.opening || {}))
        openingUse[id] = (openingUse[id] || 0) + c;
    }
    turns.sort((a, b) => a - b);
    const rates = Object.fromEntries(
      ids.map((id) => [id, Number((byDeck[id].w / Math.max(1, byDeck[id].n)).toFixed(3))]),
    );
    const matrix = {};
    for (const a of ids) {
      matrix[a] = {};
      for (const b of ids) {
        const cell = vs[`${a}>${b}`] || { n: 0, a: 0 };
        matrix[a][b] = {
          n: cell.n,
          win: Number((cell.a / Math.max(1, cell.n)).toFixed(3)),
        };
      }
    }
    const top = (obj, k = 20) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, k);
    const delta = Object.entries(playedGames)
      .map(([id, row]) => {
        const when = row.w / Math.max(1, row.n);
        const withoutN = finished.length - row.n;
        const withoutW = wins[0] - row.w;
        const notPlayed = withoutW / Math.max(1, withoutN);
        return { id, played: row.n, winWhenPlayed: Number(when.toFixed(3)), delta: Number((when - notPlayed).toFixed(3)) };
      })
      .sort((a, b) => b.delta - a.delta);
    const dominantDeck = ids.reduce((a, b) => (rates[a] > rates[b] ? a : b));
    const firstRate = firstWins[0] / Math.max(1, firstGames[0]);
    const firstRate1 = firstWins[1] / Math.max(1, firstGames[1]);
    const pct = (i) => turns[Math.min(turns.length - 1, Math.floor((i / 100) * (turns.length - 1)))];
    console.log(
      JSON.stringify(
        {
          n: 2500,
          wins,
          draws: wins[2],
          reasons,
          rates,
          matrix,
          firstPlayerWinRate: {
            whenFirstIs0: Number(firstRate.toFixed(3)),
            whenFirstIs1: Number(firstRate1.toFixed(3)),
          },
          medianTurn: pct(50),
          p75Turn: pct(75),
          p90Turn: pct(90),
          p95Turn: pct(95),
          maxTurn: turns[turns.length - 1],
          maxSave: maxSize,
          dominantDeck,
          top20PlayRate: top(cardUse),
          top20WinningPlays: top(cardWins),
          top20Opening: top(openingUse),
          topWinDelta: delta.slice(0, 12),
        },
        null,
        2,
      ),
    );
    assert.ok(wins[0] > 600 && wins[1] > 600, JSON.stringify(wins));
    for (const id of ids) {
      assert.ok(rates[id] > 0.2 && rates[id] < 0.8, `${id} ${rates[id]}`);
    }
    // No hard unwinnable matchup: every deck wins at least once against every other.
    for (const a of ids)
      for (const b of ids)
        if (a !== b)
          assert.ok(matrix[a][b].win > 0.07 && matrix[a][b].win < 0.93, `${a}>${b} ${matrix[a][b].win}`);
    assert.ok(firstRate > 0.25 && firstRate < 0.75, firstRate);
    assert.ok(turns[turns.length - 1] < 200);
    assert.ok(maxSize < 200000);
    const topCard = top(cardUse, 1)[0];
    assert.ok(topCard && /^DRB-\d{3}$/.test(topCard[0]), JSON.stringify(topCard));
  },
);
