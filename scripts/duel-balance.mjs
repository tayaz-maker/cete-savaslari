/**
 * Deterministic balance and deck-health suite.
 *
 * Every preset against every preset, both seat orders, all AI profiles. The
 * numbers here are what a balance decision is made from, so the run is seeded
 * and reproducible: the same arguments always produce the same table.
 *
 * Usage: node scripts/duel-balance.mjs [reps] [--json out.json]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { buildCards } from "../public/games/duel-core/card-data.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction, AI_PROFILE_IDS } from "../public/games/duel-core/ai.js";
import { expandDeck, presetCardIds } from "../public/games/duel-core/decks.js";

const REPS = Number(process.argv[2] || 1);
const jsonAt = process.argv.indexOf("--json");
const THEMES = ["veto-h", "gett-oh"];
const NULLISH = (v) => typeof v === "number" && !Number.isFinite(v);

/**
 * What a beginner can actually do with a card on their first turns.
 *
 * A unit of level 4 or less can be summoned outright; level 5+ needs tributes
 * it will not have yet. A spell or trap can be played or set. A field card is
 * counted, but on its own it does nothing the player can see.
 */
function openingPlayable(def) {
  if (def.kind === "unit") return (def.level ?? 0) <= 4;
  return def.subtype !== "field";
}
/** The stricter question: can they put a body on the board at all? */
function openingBody(def) {
  return def.kind === "unit" && (def.level ?? 0) <= 4;
}

function playMatch({ pool, theme, seed, decks, profiles }) {
  let state = createDuel(pool, theme, seed, seed % 2, decks);
  const out = {
    turns: 0,
    winner: null,
    illegal: 0,
    invalid: 0,
    nan: 0,
    deckOut: false,
    loop: false,
  };
  const seen = new Set();
  let guard = 0;
  while (!state.result && guard++ < 6000) {
    const actor = state.choice?.player ?? state.pending?.responding ?? state.active;
    const legal = legalActions(state, actor);
    if (!legal.length) break;
    const action = chooseAction(publicView(state, actor), legal, profiles[actor]);
    if (!legal.includes(action)) out.illegal++;
    const res = dispatch(state, action);
    if (!res.ok) {
      out.invalid++;
      break;
    }
    state = res.state;
    for (const p of state.players) if (NULLISH(p.points)) out.nan++;
    const key = `${state.revision}`;
    if (seen.has(key)) out.loop = true;
    seen.add(key);
  }
  if (guard >= 6000) out.loop = true;
  out.turns = state.turn;
  out.winner = state.result ? state.result.winner : null;
  out.deckOut = state.players.some((p) => !p.deck.length);
  return out;
}

const report = {};
for (const theme of THEMES) {
  const { designs } = await import(`../public/games/${theme}/designs.js`);
  const pool = buildCards(
    JSON.parse(readFileSync(`public/games/${theme}/source-cards.json`, "utf8")),
    designs,
    theme,
  );
  const presets = JSON.parse(readFileSync(`public/games/${theme}/decks.json`, "utf8")).decks;
  const stats = Object.fromEntries(
    presets.map((d) => [
      d.id,
      {
        games: 0,
        wins: 0,
        firstGames: 0,
        firstWins: 0,
        secondGames: 0,
        secondWins: 0,
        turns: [],
        vs: {},
      },
    ]),
  );
  let matches = 0,
    illegal = 0,
    invalid = 0,
    nan = 0,
    loops = 0,
    deckOuts = 0;

  // Deck health is a property of the list, not of a match: sample real opening
  // hands from the same shuffle the duel uses.
  const health = {};
  for (const preset of presets) {
    let playable = 0,
      dead = 0,
      hands = 0,
      lowUnits = 0,
      noBody = 0;
    for (let s = 0; s < 400; s++) {
      const built = expandDeck(preset, pool, 9000 + s);
      const hand = built.main
        .slice(0, 5)
        .map((id) => pool.find((c) => c.id === id))
        .filter(Boolean);
      const good = hand.filter(openingPlayable).length;
      playable += good;
      hands++;
      if (!good) dead++;
      lowUnits += hand.filter(openingBody).length;
      if (!hand.some(openingBody)) noBody++;
    }
    const ids = presetCardIds(preset);
    const defs = ids.map((id) => pool.find((c) => c.id === id)).filter(Boolean);
    health[preset.id] = {
      playablePerHand: +(playable / hands).toFixed(2),
      deadHandRate: +((dead / hands) * 100).toFixed(1),
      lowUnitsPerHand: +(lowUnits / hands).toFixed(2),
      noBodyRate: +((noBody / hands) * 100).toFixed(1),
      units: defs.filter((c) => c.kind === "unit").length,
      spells: defs.filter((c) => c.kind === "spell").length,
      traps: defs.filter((c) => c.kind === "trap").length,
      lvl5plus: defs.filter((c) => c.kind === "unit" && (c.level ?? 0) >= 5).length,
    };
  }

  for (const a of presets)
    for (const b of presets) {
      if (a.id === b.id) continue;
      for (const profile of AI_PROFILE_IDS)
        for (let rep = 0; rep < REPS; rep++) {
          for (const order of [0, 1]) {
            const seed = (matches * 7919 + rep * 131 + order) % 2147483647;
            const first = order === 0 ? a : b,
              second = order === 0 ? b : a;
            const r = playMatch({
              pool,
              theme,
              seed,
              decks: [expandDeck(first, pool, seed), expandDeck(second, pool, seed + 7)],
              profiles: [profile, profile],
            });
            matches++;
            illegal += r.illegal;
            invalid += r.invalid;
            nan += r.nan;
            if (r.loop) loops++;
            if (r.deckOut) deckOuts++;
            const seats = [first.id, second.id];
            seats.forEach((id, seat) => {
              const st = stats[id];
              st.games++;
              st.turns.push(r.turns);
              const won = r.winner === seat;
              if (won) st.wins++;
              if (seat === 0) {
                st.firstGames++;
                if (won) st.firstWins++;
              } else {
                st.secondGames++;
                if (won) st.secondWins++;
              }
              const foe = seats[1 - seat];
              st.vs[foe] = st.vs[foe] || { games: 0, wins: 0 };
              st.vs[foe].games++;
              if (won) st.vs[foe].wins++;
            });
          }
        }
    }
  const rows = presets.map((d) => {
    const st = stats[d.id];
    const rate = (w, g) => (g ? +((w / g) * 100).toFixed(1) : null);
    return {
      id: d.id,
      games: st.games,
      winRate: rate(st.wins, st.games),
      firstWinRate: rate(st.firstWins, st.firstGames),
      secondWinRate: rate(st.secondWins, st.secondGames),
      avgTurns: +(st.turns.reduce((x, y) => x + y, 0) / st.turns.length).toFixed(1),
      ...health[d.id],
    };
  });
  report[theme] = { matches, illegal, invalid, nan, loops, deckOuts, rows, stats };
  console.log(`\n=== ${theme}: ${matches} matches ===`);
  console.log(
    `illegal ${illegal} · invalid ${invalid} · NaN ${nan} · loops ${loops} · deck-outs ${deckOuts}`,
  );
  console.log(
    "preset        win%   1st%   2nd%  turns  play/hand  bodies  noBody%  U/S/T    lvl5+",
  );
  for (const r of rows)
    console.log(
      `${r.id.padEnd(12)} ${String(r.winRate).padStart(5)} ${String(r.firstWinRate).padStart(6)} ` +
        `${String(r.secondWinRate).padStart(6)} ${String(r.avgTurns).padStart(6)} ` +
        `${String(r.playablePerHand).padStart(9)} ${String(r.lowUnitsPerHand).padStart(7)} ` +
        `${String(r.noBodyRate).padStart(8)}  ` +
        `${r.units}/${r.spells}/${r.traps}`.padEnd(9) +
        String(r.lvl5plus).padStart(4),
    );
  const seat = rows.reduce((s, r) => s + r.firstWinRate, 0) / rows.length;
  console.log(`first-seat win rate across presets: ${seat.toFixed(1)}%`);
}
if (jsonAt > 0) writeFileSync(process.argv[jsonAt + 1], JSON.stringify(report, null, 2));
const total = Object.values(report).reduce((n, r) => n + r.matches, 0);
const bad = Object.values(report).reduce((n, r) => n + r.illegal + r.invalid + r.nan + r.loops, 0);
console.log(`\nTOTAL ${total} matches, ${bad} integrity problems`);
process.exit(bad ? 1 : 0);
