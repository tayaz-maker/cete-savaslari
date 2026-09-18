// Freeze DARBE-H! first-150 as the pre-expansion baseline.
// DARBE shipped at 300; this snapshot is the contract freeze, not a historical dump.
import { writeFileSync } from "node:fs";
import { pools } from "./duel-pools.mjs";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { serialize } from "../public/games/duel-core/save.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction } from "../public/games/duel-core/ai.js";

const theme = "darbe-h";
const pool = pools[theme];
const old = pool.slice(0, 150);
const dir = "scripts/fixtures/duel";

writeFileSync(`${dir}/${theme}-old-pool.json`, JSON.stringify(old) + "\n");

function play(state, n) {
  for (let i = 0; i < n && !state.result; i++) {
    const player = state.choice?.player ?? state.pending?.responding ?? state.active;
    const action = chooseAction(publicView(state, player), legalActions(state, player));
    if (!action) break;
    const result = dispatch(state, action);
    if (!result.ok) break;
    state = result.state;
  }
  return state;
}

let saveState = createDuel(old, theme, 42);
saveState = play(saveState, 18);
writeFileSync(`${dir}/${theme}-old-save.json`, serialize(saveState));

let response = null;
for (const seed of [77, 99, 111, 222, 333, 444, 555, 777, 888, 999, 1201, 2026]) {
  let s = createDuel(old, theme, seed);
  for (let i = 0; i < 80 && !s.result; i++) {
    if (s.pending) {
      response = s;
      break;
    }
    const player = s.choice?.player ?? s.pending?.responding ?? s.active;
    const action = chooseAction(publicView(s, player), legalActions(s, player));
    if (!action) break;
    const result = dispatch(s, action);
    if (!result.ok) break;
    s = result.state;
  }
  if (response) break;
}
if (!response?.pending) throw new Error("could not capture a DARBE-H! response window");
writeFileSync(`${dir}/${theme}-old-response.json`, serialize(response));
console.log({
  old: old.length,
  saveTurn: saveState.turn,
  savePhase: saveState.phase,
  responseTurn: response.turn,
  responsePhase: response.phase,
  pending: response.pending?.action?.type,
});
