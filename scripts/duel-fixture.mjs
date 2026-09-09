import assert from "node:assert/strict";
import { pools } from "./duel-pools.mjs";
import { createDuel, dispatch } from "../public/games/duel-core/rules.js";
let serial = 0;
export function fixture(theme = "veto-h") {
  const s = createDuel(pools[theme], theme, 9);
  s.phase = "main1";
  s.turn = 3;
  for (const p of s.players) {
    p.deck.push(...p.hand);
    p.hand = [];
  }
  return s;
}
export function place(s, id, player, zone, slot = 0) {
  const uid = `fixture:${++serial}`;
  s.cards[uid] = {
    id,
    owner: player,
    face: "down",
    position: "defense",
    setTurn: 0,
    summonedTurn: 0,
    positionTurn: 0,
    attacksUsed: 0,
    modifiers: [],
    used: {},
    knownTo: [player === 0, player === 1],
  };
  if (["units", "support"].includes(zone)) s.players[player][zone][slot] = uid;
  else if (zone === "field") s.players[player].field = uid;
  else s.players[player][zone].push(uid);
  if (["units", "field"].includes(zone)) {
    s.cards[uid].face = "up";
    s.cards[uid].position = "attack";
    s.cards[uid].knownTo = [true, true];
  }
  return uid;
}
export function act(s, a) {
  const r = dispatch(s, {
    player: s.choice?.player ?? s.pending?.responding ?? s.active,
    revision: s.revision,
    ...a,
  });
  assert.equal(r.ok, true, r.error);
  return r.state;
}
export function decisions(s) {
  for (let i = 0; i < 30 && (s.choice || s.pending); i++)
    s = act(
      s,
      s.choice
        ? s.choice.kind === "option"
          ? { type: "choose", option: s.choice.options[0].id }
          : { type: "choose", targets: s.choice.ids.slice(0, s.choice.count) }
        : { type: "pass" },
    );
  return s;
}
