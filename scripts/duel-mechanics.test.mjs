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

test("face-down units cannot activate until flipped", () => {
  const s = fixture("gett-oh"),
    uid = place(s, "RCN-038", 0, "units");
  s.cards[uid].face = "down";
  assert.equal(
    rejection(s, { type: "activate", card: uid, player: 0, revision: s.revision }),
    "flip-required",
  );
});
test("advertising response shield blocks exactly the next declaration", () => {
  let s = fixture();
  const shield = place(s, "SND-113", 0, "hand"),
    unit = place(s, "SND-002", 0, "hand");
  place(s, "SND-120", 1, "support");
  s = act(s, { type: "activate", card: shield });
  assert.ok(s.players[1].flags.blockNextResponse);
  s = act(s, { type: "summon", card: unit, slot: 0, tributes: [] });
  assert.equal(s.pending, null);
  assert.equal(s.players[0].units[0], unit);
  assert.equal(s.players[1].flags.blockNextResponse, undefined);
});
test("converted quick-play timing works in Battle, not just in Main phases", () => {
  const s = fixture(),
    card = place(s, "SND-083", 0, "hand");
  s.phase = "battle";
  s.cards[card].modifiers.push({ quick: true, until: s.turn });
  assert.equal(rejection(s, { type: "activate", card, player: 0, revision: s.revision }), null);
});

test("destruction-specific recovery waits for actual destruction and preserves dealt damage", () => {
  let s = fixture("gett-oh");
  s.phase = "battle";
  const attacker = place(s, "RCN-071", 0, "units"),
    victim = place(s, "RCN-001", 1, "units"),
    trap = place(s, "RCN-141", 1, "support");
  const damage = stat(s, attacker, "attack") - stat(s, victim, "attack");
  s = act(s, { type: "attack", card: attacker, target: victim });
  assert.equal(s.pending?.action.type, "destroy");
  assert.ok(s.players[1].grave.includes(victim));
  assert.equal(s.players[1].points, 8000 - damage);
  s = act(s, { type: "respond", card: trap });
  assert.ok(s.players[1].hand.includes(victim));
  assert.equal(s.players[1].points, 8000 - damage);
  assert.equal(s.pending, null);
});
test("unknown effect jobs in a corrupted save cannot be resumed", () => {
  const s = fixture();
  s.work = [
    {
      type: "effects",
      id: 1,
      player: 0,
      source: null,
      targets: [],
      effects: [{ op: "not-a-rule" }],
    },
  ];
  assert.equal(validateState(s), false);
});

test("field set uses only the field zone and can then be activated", () => {
  let s = fixture();
  const card = place(s, "SND-114", 0, "hand");
  s = act(s, { type: "set-field", card });
  assert.equal(s.players[0].field, card);
  assert.equal(s.cards[card].face, "down");
  assert.ok(s.players[0].support.every((x) => x === null));
  s = act(s, { type: "activate", card });
  assert.equal(s.cards[card].face, "up");
  assert.equal(s.players[0].field, card);
  assert.equal(
    rejection(s, { type: "activate", card, player: 0, revision: s.revision }),
    "no-activated-effect",
  );
});
test("face-up passive support does not expose a no-op reactivation", () => {
  const s = fixture();
  const card = place(s, "SND-148", 0, "support");
  s.cards[card].face = "up";
  assert.equal(
    rejection(s, { type: "activate", card, player: 0, revision: s.revision }),
    "no-activated-effect",
  );
});

test("Level 7+ requires two distinct tributes; full board cannot gain a free summon", () => {
  let s = fixture("gett-oh");
  const boss = place(s, "RCN-071", 0, "hand"),
    a = place(s, "RCN-001", 0, "units", 0),
    b = place(s, "RCN-002", 0, "units", 1);
  for (const tributes of [[], [a], [a, a]])
    assert.equal(
      rejection(s, {
        type: "summon",
        card: boss,
        tributes,
        slot: 0,
        player: 0,
        revision: s.revision,
      }),
      "tributes-required",
    );
  s = act(s, { type: "summon", card: boss, tributes: [a, b], slot: 0 });
  assert.equal(s.players[0].units[0], boss);
  assert.ok(s.players[0].grave.includes(a) && s.players[0].grave.includes(b));
  const full = fixture();
  for (let i = 0; i < 5; i++) place(full, `SND-00${i + 1}`, 0, "units", i);
  const extra = place(full, "SND-007", 0, "hand");
  assert.equal(
    rejection(full, {
      type: "summon",
      card: extra,
      tributes: [],
      slot: 0,
      player: 0,
      revision: full.revision,
    }),
    "unit-zone-required",
  );
});
test("Main 2 uses the same normal-summon right as Main 1", () => {
  let s = fixture();
  s.phase = "main2";
  const a = place(s, "SND-002", 0, "hand"),
    b = place(s, "SND-007", 0, "hand");
  s = act(s, { type: "summon", card: a, slot: 0, tributes: [] });
  assert.equal(
    rejection(s, {
      type: "set-unit",
      card: b,
      slot: 1,
      tributes: [],
      player: 0,
      revision: s.revision,
    }),
    "normal-used",
  );
});
test("end-phase hand limit requires explicit discards before exactly one turn reset", () => {
  let s = fixture();
  s.phase = "end";
  for (let i = 1; i <= 7; i++) place(s, `SND-00${i}`, 0, "hand");
  assert.equal(rejection(s, { type: "phase", player: 0, revision: s.revision }), "hand-limit");
  s = act(s, { type: "discard", card: s.players[0].hand[0] });
  const command = { type: "phase", player: 0, revision: s.revision };
  s = act(s, command);
  assert.equal(s.turn, 4);
  assert.equal(s.active, 1);
  assert.equal(dispatch(s, command).error, "stale-action");
});
test("standby effects trigger once on entry and do not rerun on hydration", () => {
  let s = fixture("gett-oh");
  s.phase = "draw";
  place(s, "RCN-039", 0, "units");
  s = act(s, { type: "phase" });
  assert.equal(s.phase, "standby");
  assert.equal(s.players[1].points, 7800);
  const restored = deserialize(serialize(s), pools["gett-oh"], "gett-oh");
  assert.equal(restored.ok, true);
  s = act(restored.state, { type: "phase" });
  assert.equal(s.players[1].points, 7800);
});
test("face-down defense is revealed before battle and a later manual flip consumes position rights", () => {
  let s = fixture("gett-oh");
  s.phase = "battle";
  const attacker = place(s, "RCN-071", 0, "units"),
    victim = place(s, "RCN-001", 1, "units");
  s.cards[victim].face = "down";
  s.cards[victim].position = "defense";
  s = act(s, { type: "attack", card: attacker, target: victim });
  assert.equal(s.cards[victim].face, "up");
  assert.ok(s.players[1].grave.includes(victim));
  assert.equal(s.players[1].points, 8000);
  let later = fixture();
  const unit = place(later, "SND-002", 0, "units");
  later.cards[unit].face = "down";
  later.cards[unit].position = "defense";
  later = decisions(act(later, { type: "position", card: unit }));
  assert.equal(later.cards[unit].face, "up");
  assert.equal(later.cards[unit].position, "attack");
  assert.equal(
    rejection(later, { type: "position", card: unit, player: 0, revision: later.revision }),
    "position-used",
  );
});
test("two-attack effect has an exact cap and cannot refresh through save/reload", () => {
  let s = fixture("gett-oh");
  s.phase = "battle";
  const uid = place(s, "RCN-061", 0, "units");
  const damage = Math.floor(stat(s, uid, "attack") / 2);
  s = act(s, { type: "attack", card: uid, target: null });
  s = deserialize(serialize(s), pools["gett-oh"], "gett-oh").state;
  s = act(s, { type: "attack", card: uid, target: null });
  assert.equal(s.players[1].points, 8000 - 2 * damage);
  assert.equal(
    rejection(s, { type: "attack", card: uid, target: null, player: 0, revision: s.revision }),
    "attack-used",
  );
  assert.equal(
    rejection(s, { type: "position", card: uid, player: 0, revision: s.revision }),
    "main-phase-only",
  );
});
test("auxiliary cards cannot be summoned without their specified material requirements", () => {
  const s = fixture();
  const uid = place(s, "SND-069", 0, "auxiliary");
  assert.equal(
    specialPlans(s, 0).some((p) => p.card === uid),
    false,
  );
  assert.equal(
    rejection(s, { type: "special", card: uid, materials: [], player: 0, revision: s.revision }),
    "special-requirements",
  );
});

test("Market Stall's explicit direct-attack exception does not bypass another defender", () => {
  const s = fixture(),
    attacker = place(s, "SND-001", 0, "units"),
    stall = place(s, "SND-005", 1, "units");
  s.cards[stall].position = "defense";
  assert.deepEqual(attackTargets(s, 0, attacker), [null]);
  const other = place(s, "SND-002", 1, "units", 1);
  assert.deepEqual(attackTargets(s, 0, attacker), [other]);
});
test("a previously Set equip binds its target and applies stats exactly once after reload", () => {
  let s = fixture();
  const unit = place(s, "SND-001", 0, "units"),
    equip = place(s, "SND-117", 0, "support");
  const attack = stat(s, unit, "attack");
  s = decisions(act(s, { type: "activate", card: equip, targets: [unit] }));
  assert.equal(s.cards[equip].equippedTo, unit);
  assert.equal(stat(s, unit, "attack"), attack + 500);
  s = deserialize(serialize(s), pools["veto-h"], "veto-h").state;
  assert.equal(stat(s, unit, "attack"), attack + 500);
  assert.equal(
    rejection(s, {
      type: "activate",
      player: 0,
      revision: s.revision,
      card: equip,
      targets: [unit],
    }),
    "no-activated-effect",
  );
});
test("Quick-Play surcharge is paid before a negation and never paid twice", () => {
  let s = fixture();
  place(s, "SND-116", 0, "field");
  place(s, "SND-001", 0, "units");
  const quick = place(s, "SND-111", 0, "hand"),
    counter = place(s, "SND-123", 1, "support");
  s = act(s, { type: "activate", card: quick });
  assert.equal(s.players[0].points, 7700);
  assert.ok(s.pending);
  s = act(s, { type: "respond", card: counter });
  assert.equal(s.players[0].points, 7700);
});

test("a negated special summon consumes declared ritual materials before the response", () => {
  let s = fixture("veto-h");
  const ritual = place(s, "SND-074", 0, "hand"),
    material = place(s, "SND-043", 0, "hand"),
    rite = place(s, "SND-065", 0, "hand");
  const counter = place(s, "SND-140", 1, "support");
  const plan = ritualPlans(s, 0).find((p) => p.card === ritual);
  assert.ok(plan);
  s = act(s, { type: "special", ...plan });
  assert.ok(s.players[0].grave.includes(material));
  assert.ok(s.players[0].grave.includes(rite));
  assert.ok(s.pending);
  assert.ok(responseCards(s).includes(counter));
  s = deserialize(serialize(s), pools["veto-h"], "veto-h").state;
  s = act(s, { type: "respond", card: counter });
  assert.ok(s.players[0].grave.includes(ritual));
  assert.equal(s.players[0].units.filter(Boolean).length, 0);
});

test("Consensus cannot exchange a single low-level unit for a two-material auxiliary summon", () => {
  const s = fixture();
  const consensus = place(s, "SND-062", 0, "units"),
    low = place(s, "SND-001", 0, "units", 1);
  place(s, "SND-068", 0, "auxiliary");
  const before = serialize(s);
  assert.equal(
    rejection(s, { type: "activate", player: 0, revision: s.revision, card: consensus }),
    "no-legal-target",
  );
  assert.equal(serialize(s), before);
  assert.ok(s.players[0].units.includes(low));
  place(s, "SND-002", 0, "units", 2);
  assert.equal(
    rejection(s, { type: "activate", player: 0, revision: s.revision, card: consensus }),
    null,
  );
});

test("losing a required material in the response fizzles the exchange without a partial payment", () => {
  let s = fixture();
  const consensus = place(s, "SND-062", 0, "units"),
    first = place(s, "SND-001", 0, "units", 1),
    second = place(s, "SND-002", 0, "units", 2);
  s.cards[second].face = "down";
  const auxiliary = place(s, "SND-068", 0, "auxiliary"),
    trap = place(s, "SND-135", 1, "support");
  s = act(s, { type: "activate", card: consensus });
  s = act(s, { type: "respond", card: trap });
  assert.ok(s.choice);
  s = act(s, { type: "choose", targets: [second] });
  assert.ok(s.players[0].units.includes(first));
  assert.ok(s.players[0].grave.includes(second));
  assert.ok(s.players[0].auxiliary.includes(auxiliary));
  assert.ok(s.log.some((e) => e.event === "targets-unavailable"));
  assert.equal(s.choice, null);
});

test("a targeted response is unavailable until a real legal target exists", () => {
  const s = fixture(),
    trap = place(s, "SND-135", 1, "support");
  s.pending = { action: { type: "draw", player: 0 }, responding: 1, negated: false };
  assert.equal(responseCards(s).includes(trap), false);
  const target = place(s, "SND-002", 0, "units");
  s.cards[target].face = "down";
  assert.equal(responseCards(s).includes(trap), true);
});
