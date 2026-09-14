/** Measures the real action economy across many matches. */
import { readFileSync } from "node:fs";
import { buildCards } from "../public/games/duel-core/card-data.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { dispatch, createDuel } from "../public/games/duel-core/rules.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction, AI_PROFILE_IDS } from "../public/games/duel-core/ai.js";
import { expandDeck } from "../public/games/duel-core/decks.js";

const theme = process.argv[2] || "veto-h";
const N = Number(process.argv[3] || 200);
const { designs } = await import(`../public/games/${theme}/designs.js`);
const pool = buildCards(JSON.parse(readFileSync(`public/games/${theme}/source-cards.json`,"utf8")), designs, theme);
const presets = JSON.parse(readFileSync(`public/games/${theme}/decks.json`,"utf8")).decks;

const stat = { specialsPerTurn: [], freeSpecials: 0, specials: 0, setsPerTurn: [],
  boardAfterT1: [], boardAfterT2: [], plays: {}, turns: [], t1Plays: [] };
let matches = 0;
for (let i = 0; i < N; i++) {
  const seed = 1000 + i;
  const a = presets[i % presets.length], b = presets[(i + 3) % presets.length];
  const prof = AI_PROFILE_IDS[i % AI_PROFILE_IDS.length];
  let state = createDuel(pool, theme, seed, i % 2, [expandDeck(a,pool,seed), expandDeck(b,pool,seed+1)]);
  const perTurn = {};
  let guard = 0;
  while (!state.result && guard++ < 4000) {
    const actor = state.choice?.player ?? state.pending?.responding ?? state.active;
    const legal = legalActions(state, actor);
    if (!legal.length) break;
    const action = chooseAction(publicView(state, actor), legal, prof);
    const before = state;
    const res = dispatch(state, action);
    if (!res.ok) break;
    const key = `${before.turn}|${actor}`;
    perTurn[key] = perTurn[key] || { special: 0, free: 0, set: 0, plays: 0 };
    if (action.type === "special") {
      perTurn[key].special++; stat.specials++;
      if (!(action.materials||[]).length) { perTurn[key].free++; stat.freeSpecials++; }
    }
    if (action.type === "set-support") perTurn[key].set++;
    // Only actions that actually commit a card to the board/field count as a
    // "play"; choices, discards and phase ends are bookkeeping.
    const CARD_PLAY = ["summon","set-unit","set-support","set-field","special","activate"];
    if (CARD_PLAY.includes(action.type)) perTurn[key].plays++;
    if (action.type !== "phase") stat.plays[action.type] = (stat.plays[action.type]||0)+1;
    if (before.turn === 1 && action.type !== "phase") { }
    state = res.state;
    if (before.turn === 1 && state.turn === 2)
      stat.boardAfterT1.push(state.players.map(p=>p.units.filter(Boolean).length).reduce((x,y)=>x+y,0));
    if (before.turn === 2 && state.turn === 3)
      stat.boardAfterT2.push(state.players.map(p=>p.units.filter(Boolean).length).reduce((x,y)=>x+y,0));
  }
  if (state.result) matches++;
  stat.turns.push(state.turn);
  for (const [k,v] of Object.entries(perTurn)) {
    stat.specialsPerTurn.push(v.special); stat.setsPerTurn.push(v.set);
    if (k.startsWith("1|")) stat.t1Plays.push(v.plays);
  }
}
const pct=(arr,f)=>((arr.filter(f).length/arr.length)*100).toFixed(1);
const avg=(a)=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2);
const max=(a)=>Math.max(...a);
console.log(`${theme}: ${matches}/${N} finished`);
console.log(`special summons: ${stat.specials} total, ${stat.freeSpecials} with NO material (${(stat.freeSpecials/Math.max(1,stat.specials)*100).toFixed(1)}%)`);
console.log(`specials per seat-turn: avg ${avg(stat.specialsPerTurn)}, max ${max(stat.specialsPerTurn)}, >=2 in ${pct(stat.specialsPerTurn,v=>v>=2)}% of seat-turns, >=3 in ${pct(stat.specialsPerTurn,v=>v>=3)}%`);
console.log(`support sets per seat-turn: avg ${avg(stat.setsPerTurn)}, max ${max(stat.setsPerTurn)}, >=3 in ${pct(stat.setsPerTurn,v=>v>=3)}%`);
console.log(`card plays in turn 1: avg ${avg(stat.t1Plays)}, max ${max(stat.t1Plays)}, >=3 in ${pct(stat.t1Plays,v=>v>=3)}%, >=4 in ${pct(stat.t1Plays,v=>v>=4)}%`);
console.log(`units on board after turn 1: avg ${avg(stat.boardAfterT1)}, max ${max(stat.boardAfterT1)}`);
console.log(`units on board after turn 2: avg ${avg(stat.boardAfterT2)}, max ${max(stat.boardAfterT2)}`);
console.log(`match length: avg ${avg(stat.turns)} turns, max ${max(stat.turns)}`);
console.log(`play mix: ${JSON.stringify(stat.plays)}`);
