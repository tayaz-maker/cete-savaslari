import test from "node:test";
import assert from "node:assert/strict";
import { pools } from "./duel-pools.mjs";
import { createDuel, dispatch, rejection, responseCards } from "../public/games/duel-core/rules.js";
import { locate, validateState } from "../public/games/duel-core/model.js";
import { stat } from "../public/games/duel-core/effects.js";
import { specialPlans, ritualPlans } from "../public/games/duel-core/summoning.js";
import { attackTargets } from "../public/games/duel-core/combat-rules.js";
import { publicView } from "../public/games/duel-core/projection.js";
import { serialize, deserialize } from "../public/games/duel-core/save.js";
let serial = 0;
function fixture(theme = "veto-h") {
  const s = createDuel(pools[theme], theme, 9);
  s.phase = "main1";
  s.turn = 3;
  for (const p of s.players) {
    p.deck.push(...p.hand);
    p.hand = [];
  }
  return s;
}
function place(s, id, player, zone, slot = 0) {
  let uid = Object.keys(s.cards).find(
    (uid) => s.cards[uid].id === id && s.cards[uid].owner === player,
  );
  if (uid) {
    const at = locate(s, uid);
    if (["units", "support"].includes(at.zone)) s.players[player][at.zone][at.index] = null;
    else if (at.zone === "field") s.players[player].field = null;
    else s.players[player][at.zone].splice(at.index, 1);
  } else {
    uid = `fixture:${++serial}`;
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
  }
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
function act(s, a) {
  const r = dispatch(s, {
    player: s.choice?.player ?? s.pending?.responding ?? s.active,
    revision: s.revision,
    ...a,
  });
  assert.equal(r.ok, true, r.error);
  return r.state;
}
function decisions(s) {
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

test("paid activation cost stays paid through a negating response; insufficient points reject atomically", () => {
  let s = fixture("gett-oh");
  const jewel = place(s, "RCN-038", 0, "units"),
    counter = place(s, "RCN-148", 1, "support");
  s.players[0].points = 500;
  const before = serialize(s);
  assert.equal(
    rejection(s, { type: "activate", player: 0, revision: s.revision, card: jewel }),
    "insufficient-points",
  );
  assert.equal(serialize(s), before);
  s.players[0].points = 8000;
  s = act(s, { type: "activate", card: jewel });
  assert.equal(s.players[0].points, 7000);
  assert.ok(s.pending);
  s = act(s, { type: "respond", card: counter });
  assert.equal(s.players[0].points, 7000);
  assert.equal(s.cards[jewel].modifiers.length, 0);
  assert.ok(s.players[1].grave.includes(counter));
});
test("tribute materials are spent before the response and never duplicated by reload", () => {
  let s = fixture();
  const small = place(s, "SND-002", 0, "units"),
    large = place(s, "SND-029", 0, "hand");
  place(s, "SND-130", 1, "support");
  s = act(s, { type: "summon", card: large, slot: 0, tributes: [small] });
  assert.ok(s.players[0].grave.includes(small));
  assert.equal(s.players[0].normalUsed, 1);
  assert.ok(s.pending);
  const restored = deserialize(serialize(s), pools["veto-h"], "veto-h");
  assert.equal(restored.ok, true);
  assert.deepEqual(decisions(restored.state), decisions(s));
});
test("normal summon alternate grave cost banishes the spell and uses the normal right", () => {
  let s = fixture();
  const unit = place(s, "SND-039", 0, "hand"),
    spell = place(s, "SND-083", 0, "grave");
  s = act(s, { type: "summon", card: unit, slot: 0, tributes: [spell] });
  assert.ok(s.players[0].banished.includes(spell));
  assert.equal(s.players[0].units[0], unit);
  assert.equal(s.players[0].normalUsed, 1);
});
test("low-level special summon lock applies to generated legal plans and is removed with its source", () => {
  const s = fixture();
  const blocker = place(s, "SND-044", 1, "units");
  const candidate = place(s, "SND-075", 0, "auxiliary");
  place(s, "SND-002", 0, "hand");
  const original = s.catalog["SND-075"];
  s.catalog = { ...s.catalog, "SND-075": { ...original, level: 3 } };
  assert.equal(
    specialPlans(s, 0).some((p) => p.card === candidate),
    false,
  );
  s.cards[blocker].negated = true;
  assert.equal(
    specialPlans(s, 0).some((p) => p.card === candidate),
    true,
  );
});
test("ritual requires a real enabler; materials and rite are consumed exactly once", () => {
  let s = fixture("gett-oh");
  const ritual = place(s, "RCN-082", 0, "hand");
  place(s, "RCN-074", 0, "hand");
  assert.equal(ritualPlans(s, 0).length, 0);
  const enabler = place(s, "RCN-090", 0, "hand");
  const plan = ritualPlans(s, 0).find((p) => p.card === ritual);
  assert.ok(plan);
  s = decisions(act(s, { type: "special", ...plan }));
  assert.ok(s.players[0].grave.includes(enabler));
  assert.ok(s.players[0].units.includes(ritual));
  assert.ok(plan.materials.every((id) => s.players[0].grave.includes(id)));
  assert.equal(s.players[0].normalUsed, 0);
});
test("a new Set trap waits, old traps can respond, and one response consumes the window", () => {
  let s = fixture("gett-oh");
  s.phase = "battle";
  const attacker = place(s, "RCN-001", 0, "units"),
    trap = place(s, "RCN-130", 1, "support");
  s.cards[trap].setTurn = s.turn;
  const declared = {
    type: "attack",
    card: attacker,
    target: null,
    player: 0,
    revision: s.revision,
  };
  s.pending = { action: declared, responding: 1, negated: false };
  assert.deepEqual(responseCards(s), []);
  s.cards[trap].setTurn = s.turn - 1;
  assert.ok(responseCards(s).includes(trap));
  s = act(s, { type: "respond", card: trap });
  assert.equal(s.pending, null);
  assert.ok(s.players[1].grave.includes(trap));
  assert.equal(s.players[1].points, 8000);
});
test("battle protection mode prevents destruction without cancelling battle damage", () => {
  let s = fixture("gett-oh");
  s.phase = "battle";
  const attacker = place(s, "RCN-071", 0, "units"),
    defender = place(s, "RCN-001", 1, "units"),
    shield = place(s, "RCN-149", 1, "support");
  const damage = stat(s, attacker, "attack") - stat(s, defender, "attack");
  assert.ok(damage > 0);
  s = act(s, { type: "attack", card: attacker, target: defender });
  s = act(s, { type: "respond", card: shield });
  assert.ok(s.players[1].units.includes(defender));
  assert.equal(s.players[1].points, 8000 - damage);
});
test("untargetable units do not make the opposing field empty for direct attacks", () => {
  const s = fixture("gett-oh"),
    attacker = place(s, "RCN-001", 0, "units");
  place(s, "RCN-050", 1, "units");
  assert.deepEqual(attackTargets(s, 0, attacker), []);
});
test("token series remain arrays under paired-series auras and public projection", () => {
  let s = fixture();
  place(s, "SND-040", 0, "units");
  const summoner = place(s, "SND-054", 0, "hand");
  s = act(s, { type: "summon", card: summoner, slot: 1, tributes: [] });
  assert.ok(s.players[0].units.some((uid) => uid && s.cards[uid].token));
  assert.doesNotThrow(() => publicView(s, 0));
  assert.equal(validateState(s), true);
});
test("enemy-targeted discard gives the hidden-hand choice to the hand owner", () => {
  let s = fixture();
  const speaker = place(s, "SND-014", 0, "hand");
  place(s, "SND-002", 1, "hand");
  place(s, "SND-003", 1, "hand");
  s = act(s, { type: "summon", card: speaker, slot: 0, tributes: [] });
  assert.equal(s.choice.player, 1);
  assert.equal(publicView(s, 0).choice, null);
});
test("incomplete card bookkeeping is rejected at hydration", () => {
  const s = fixture();
  delete s.cards[Object.keys(s.cards)[0]].knownTo;
  assert.equal(validateState(s), false);
});
