// Reusable duel-core simulation harness shared by the DARBE-H! Repair II
// diagnostics, the fast regression suite and the heavy closure matrix. Also
// used, theme-parametrically, for the VETO-H!/GETT-OH! first-mover A/B: the
// harness itself must not assume anything DARBE-specific.
import { readFileSync } from "node:fs";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction, AI_PROFILE_IDS } from "../public/games/duel-core/ai.js";
import { expandDeck } from "../public/games/duel-core/decks.js";
import { statistic } from "../public/games/duel-core/modifiers.js";

export { AI_PROFILE_IDS };

const PREFIX = { "darbe-h": "DRB-", "veto-h": "SND-", "gett-oh": "RCN-" };

export function loadPresets(theme) {
  return JSON.parse(readFileSync(`public/games/${theme}/decks.json`, "utf8")).decks;
}

// A single match. Records production ids (never uids) for every card played,
// the T1/T2 opening, the terminal (last-touched) cards and, for each unit
// actually placed on the board, its live attack via statistic() so a fusion
// or conditional-stat body is measured as it really lands, not by its
// printed base number.
export function playMatch(pool, theme, presets, { seed, deckA, deckB, first, profileA, profileB, guard = 4000 }) {
  const byPreset = Object.fromEntries(presets.map((d) => [d.id, d]));
  let state = createDuel(pool, theme, seed, first, [
    expandDeck(byPreset[deckA], pool, seed + 11),
    expandDeck(byPreset[deckB], pool, seed + 29),
  ]);
  const prefix = PREFIX[theme] || "";
  const plays = {}, opening = {}, terminal = {}, summonAtk = [];
  let n = 0, firstFusionTurn = null;
  while (!state.result && n++ < guard) {
    const actor = state.choice?.player ?? state.pending?.responding ?? state.active;
    const legal = legalActions(state, actor);
    if (!legal.length) return { stuck: true, turn: state.turn, phase: state.phase, seed, deckA, deckB, first };
    const pick = chooseAction(publicView(state, actor), legal, actor === 0 ? profileA : profileB);
    const printed = pick?.card ? state.cards[pick.card]?.id || pick.card : null;
    const wasFusion = pick?.type === "special" && Array.isArray(pick?.materials) && pick.materials.length > 0;
    const res = dispatch(state, pick);
    if (!res.ok) return { fail: res.why || res.error, turn: state.turn, seed, deckA, deckB, first };
    state = res.state;
    if (printed && printed.startsWith(prefix)) {
      plays[printed] = (plays[printed] || 0) + 1;
      if (state.turn <= 2) opening[printed] = (opening[printed] || 0) + 1;
      terminal[printed] = (terminal[printed] || 0) + 1;
      if (wasFusion && state.turn <= 1 && firstFusionTurn === null) firstFusionTurn = state.turn;
      if (pick.card && state.cards[pick.card]) {
        const uid = pick.card;
        if (state.players.some((p) => p.units.includes(uid)))
          summonAtk.push({ turn: state.turn, id: printed, atk: statistic(state, uid, "attack") });
      }
    }
    if (!Number.isFinite(state.players[0].points) || !Number.isFinite(state.players[1].points))
      return { nan: true, turn: state.turn, seed, deckA, deckB, first };
  }
  if (!state.result) return { stuck: true, turn: state.turn, phase: state.phase, seed, deckA, deckB, first };
  const last = Object.entries(terminal).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => id);
  return {
    result: state.result, turn: state.turn, seed, deckA, deckB, first,
    plays, opening, terminalTop: last,
    size: JSON.stringify(state).length,
    firstFusionTurn,
    t1Swing:
      (summonAtk.find((s) => s.turn === 1)?.atk || 0) -
      (summonAtk.filter((s) => s.turn === 1).slice(1)[0]?.atk || 0),
    summonAtk,
  };
}

// 5x5 decks (or however many `ids` names) x both seats x every profile x
// `reps` mirrored seed repeats. "Mirrored" means each (seed, deckA, deckB,
// profileA, profileB) combination is played with first=0 AND first=1, so
// every pairing has a same-seed, seat-swapped twin for the opening-delta
// metric — never just a second independent seed.
export function runMatrix(pool, theme, presets, { reps = 10, seedBase = 5000, profiles = AI_PROFILE_IDS } = {}) {
  const ids = presets.map((d) => d.id);
  const rows = [];
  let n = 0;
  for (let rep = 0; rep < reps; rep++)
    for (const a of ids)
      for (const b of ids)
        for (const profile of profiles) {
          // Fix the seed and the profile assignment once per (rep, a, b,
          // profile) cell, THEN vary `first` — this is what makes the two
          // rows an actual mirrored pair (identical seed and matchup, only
          // the opening seat swapped), not two independently seeded games
          // that merely share a deck pairing.
          const seed = seedBase + n;
          const profileB = profiles[(n + 2) % profiles.length];
          for (const first of [0, 1])
            rows.push(playMatch(pool, theme, presets, { seed, deckA: a, deckB: b, first, profileA: profile, profileB }));
          n++;
        }
  return rows;
}

export function summarize(rows, ids, deckMembers = {}) {
  const finished = rows.filter((r) => r.result);
  const stuck = rows.filter((r) => r.stuck || r.fail || r.nan);
  const byDeck = Object.fromEntries(ids.map((id) => [id, { w: 0, n: 0 }]));
  const vs = {};
  const firstWins = [0, 0], firstGames = [0, 0];
  const turns = [];
  const cardUse = {}, playedGames = {}, openingUse = {}, terminalUse = {};
  let maxSize = 0, deckOut = 0;
  const deckOutBy = Object.fromEntries(ids.map((id) => [id, 0]));
  const t1SwingByDeck = Object.fromEntries(ids.map((id) => [id, []]));
  for (const r of finished) {
    const w = r.result.winner;
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
    if (r.result.reason === "deck-out") {
      deckOut++;
      deckOutBy[r.deckA] = (deckOutBy[r.deckA] || 0) + 1;
    }
    if (typeof r.t1Swing === "number") t1SwingByDeck[r.deckA].push(r.t1Swing);
    const seen = new Set(Object.keys(r.plays || {}));
    for (const [id, c] of Object.entries(r.plays || {})) cardUse[id] = (cardUse[id] || 0) + c;
    for (const id of seen) {
      playedGames[id] = playedGames[id] || { n: 0, w: 0 };
      playedGames[id].n++;
      if (w === 0) playedGames[id].w++;
    }
    for (const [id, c] of Object.entries(r.opening || {})) openingUse[id] = (openingUse[id] || 0) + c;
    for (const id of r.terminalTop || []) terminalUse[id] = (terminalUse[id] || 0) + 1;
  }
  turns.sort((a, b) => a - b);
  const pct = (i) => turns[Math.min(turns.length - 1, Math.floor((i / 100) * (turns.length - 1)))];
  const rates = Object.fromEntries(ids.map((id) => [id, byDeck[id].w / Math.max(1, byDeck[id].n)]));
  const matrix = {};
  for (const a of ids) {
    matrix[a] = {};
    for (const b of ids) {
      const cell = vs[`${a}>${b}`] || { n: 0, a: 0 };
      matrix[a][b] = { n: cell.n, win: cell.a / Math.max(1, cell.n) };
    }
  }
  const top = (obj, k = 20) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, k);
  const totalWins = finished.filter((r) => r.result.winner === 0).length;
  const topDelta = Object.entries(playedGames)
    .map(([id, row]) => {
      const notPlayedN = finished.length - row.n, notPlayedW = totalWins - row.w;
      const when = row.w / Math.max(1, row.n), without = notPlayedW / Math.max(1, notPlayedN);
      return { id, played: row.n, winWhenPlayed: when, delta: when - without };
    })
    .sort((a, b) => b.delta - a.delta);
  return {
    n: rows.length,
    finished: finished.length,
    stuck: stuck.length,
    stuckSample: stuck.slice(0, 3),
    rates,
    matrix,
    // "first-mover" = the seat that actually opened the match (state.first),
    // never seat0/seat1 occupancy — that is a materially different number
    // and conflating the two is exactly how the Repair I report mis-stated
    // its own +9pp claim.
    firstMoverRate: (firstWins[0] + firstWins[1]) / Math.max(1, firstGames[0] + firstGames[1]),
    firstMoverBySeat: { seat0Opens: firstWins[0] / Math.max(1, firstGames[0]), seat1Opens: firstWins[1] / Math.max(1, firstGames[1]) },
    concentration: Object.keys(deckMembers).length ? deckConcentration(rows, deckMembers) : {},
    medianTurn: pct(50), p75Turn: pct(75), p90Turn: pct(90), p95Turn: pct(95), maxTurn: turns[turns.length - 1],
    maxSize,
    deckOut, deckOutBy,
    top20PlayRate: top(cardUse),
    top20Opening: top(openingUse),
    top20Terminal: top(terminalUse),
    topWinDelta: topDelta.slice(0, 12),
    t1SwingByDeck: Object.fromEntries(
      Object.entries(t1SwingByDeck).map(([id, arr]) => [id, arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0]),
    ),
    firstFusionT1: rows.filter((r) => r.firstFusionTurn === 1).length,
  };
}

// Per-deck top-5 concentration and cards that never fired despite being in
// the list — both computed against each deck's own known member cards
// (`deckMembers`), not the global play table, so a card shared by two decks
// is attributed to each deck it actually belongs to.
export function deckConcentration(rows, deckMembers) {
  const out = {};
  for (const [deckId, members] of Object.entries(deckMembers)) {
    const plays = {};
    for (const r of rows) {
      if (r.deckA !== deckId && r.deckB !== deckId) continue;
      for (const id of members) if (r.plays?.[id]) plays[id] = (plays[id] || 0) + r.plays[id];
    }
    const total = Object.values(plays).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(plays).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5).reduce((a, [, c]) => a + c, 0);
    const never = members.filter((id) => !plays[id]);
    out[deckId] = { distinct: sorted.length, total, top5Share: total ? top5 / total : 0, topCard: sorted[0], neverPlayed: never };
  }
  return out;
}

// Same-seed, seat-swapped mirrored pairs: for every (seed, deckA, deckB,
// profileA, profileB) combination the harness plays first=0 and first=1, so
// the opening delta below isolates the seat, holding everything else fixed.
export function openingDelta(rows) {
  const byKey = new Map();
  for (const r of rows) {
    if (!r.result) continue;
    const key = `${r.seed}|${r.deckA}|${r.deckB}`;
    const slot = byKey.get(key) || {};
    slot[r.first] = r;
    byKey.set(key, slot);
  }
  let pairs = 0, seat0OpensWins = 0, seat0OpensGames = 0, seat0ClosesWins = 0, seat0ClosesGames = 0, flips = 0;
  for (const slot of byKey.values()) {
    if (!slot[0] || !slot[1]) continue;
    pairs++;
    seat0OpensGames++;
    if (slot[0].result.winner === 0) seat0OpensWins++;
    seat0ClosesGames++;
    if (slot[1].result.winner === 0) seat0ClosesWins++;
    if ((slot[0].result.winner === 0) !== (slot[1].result.winner === 0)) flips++;
  }
  return {
    pairs,
    seat0WinsWhenOpening: seat0OpensWins / Math.max(1, seat0OpensGames),
    seat0WinsWhenNotOpening: seat0ClosesWins / Math.max(1, seat0ClosesGames),
    delta: seat0OpensWins / Math.max(1, seat0OpensGames) - seat0ClosesWins / Math.max(1, seat0ClosesGames),
    flipShare: flips / Math.max(1, pairs),
  };
}

// The single health gate both the fast and the closure suite call, so the
// bands cannot silently drift apart between them. `mode` is "loose" (fast
// regression, forgiving of small-n noise) or "tight" (closure, same bands
// the reconstructed handoff specifies).
export function assertHealthyMeta(summary, delta, ids, mode = "loose") {
  const bands = mode === "tight"
    ? { rate: [0.38, 0.62], cell: [0.2, 0.8], firstMover: 0.61, openingDelta: 0.2 }
    : { rate: [0.32, 0.68], cell: [0.15, 0.85], firstMover: 0.62, openingDelta: 0.22 };
  const problems = [];
  for (const id of ids) {
    const r = summary.rates[id];
    if (!(r > bands.rate[0] && r < bands.rate[1])) problems.push(`${id} rate ${r.toFixed(3)} outside [${bands.rate}]`);
  }
  for (const a of ids)
    for (const b of ids)
      if (a !== b) {
        const cell = summary.matrix[a][b];
        if (!(cell.win > bands.cell[0] && cell.win < bands.cell[1]))
          problems.push(`${a}>${b} ${cell.win.toFixed(3)} outside [${bands.cell}] (n=${cell.n})`);
      }
  // No deck may lack a favourable-or-even matchup anywhere in the space.
  for (const a of ids) {
    const best = Math.max(...ids.filter((b) => b !== a).map((b) => summary.matrix[a][b].win));
    if (best < 0.48) problems.push(`${a} has no favourable/even matchup (best cell ${best.toFixed(3)})`);
  }
  // No deck may win essentially everything.
  for (const a of ids) {
    const worst = Math.min(...ids.filter((b) => b !== a).map((b) => summary.matrix[a][b].win));
    if (worst > 0.55) problems.push(`${a} has no unfavourable/even matchup (worst cell ${worst.toFixed(3)}) — hard lock risk`);
  }
  if (summary.firstMoverRate > bands.firstMover)
    problems.push(`first-mover rate ${summary.firstMoverRate.toFixed(3)} exceeds ${bands.firstMover}`);
  if (Math.abs(delta.delta) > bands.openingDelta)
    problems.push(`opening delta ${delta.delta.toFixed(3)} exceeds ${bands.openingDelta}`);
  if (summary.stuck > 0) problems.push(`${summary.stuck} stuck/failed/non-finite matches`);
  return problems;
}
