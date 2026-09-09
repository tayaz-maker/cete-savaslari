import assert from "node:assert/strict";
import { pools } from "./duel-pools.mjs";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
import { legalActions } from "../public/games/duel-core/actions.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { chooseAction } from "../public/games/duel-core/ai.js";
const count = Number(process.argv[2] || 10);
for (const [theme, pool] of Object.entries(pools)) {
  const turns = [],
    wins = [0, 0, 0];
  for (let seed = 0; seed < count; seed++) {
    let s = createDuel(pool, theme, seed),
      step = 0,
      last;
    try {
      while (!s.result && s.turn <= 500 && step++ < 15000) {
        const player = s.choice?.player ?? s.pending?.responding ?? s.active;
        const action = chooseAction(publicView(s, player), legalActions(s, player));
        assert.ok(action, `No legal action at ${s.phase}`);
        last = action;
        const result = dispatch(s, action);
        assert.equal(result.ok, true, result.error);
        s = result.state;
      }
      assert.ok(s.result, `Stuck: ${s.turn} turns, ${step} actions`);
    } catch (error) {
      console.error(theme, seed, last, JSON.stringify(s.choice), error.message);
      throw error;
    }
    turns.push(s.turn);
    wins[s.result.winner ?? 2]++;
  }
  console.log(
    JSON.stringify({
      theme,
      count,
      wins,
      mean: turns.reduce((a, b) => a + b, 0) / count,
      max: Math.max(...turns),
    }),
  );
}
