import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAction, create, normalize, DISCOVERABLES, createPhoneState,
  availableEvidence, PHONE_FACTS, PHONE_SIDE_SECRETS, ENDINGS,
} from "../public/games/next-wave.js";

const discover = (state, ids) => ids.forEach((id) => applyAction("kayip-telefon", state, `discover:${id}`));

test("Wave 3 evidence graph has unique nodes and at least two real paths per critical fact", () => {
  assert.equal(new Set(DISCOVERABLES.map((x) => x.id)).size, DISCOVERABLES.length);
  for (const fact of PHONE_FACTS.filter((x) => x.critical)) {
    assert.ok(fact.paths.length >= 2, fact.id);
    for (const path of fact.paths) {
      assert.ok(path.length >= 2);
      assert.ok(path.every((id) => DISCOVERABLES.some((x) => x.id === id)), `${fact.id}: ${path}`);
      const state = createPhoneState(71);
      discover(state, path);
      assert.ok(state.knownFacts.includes(fact.id), `${fact.id} path unreachable`);
    }
  }
});

test("case seed is stable across save/load while controlled layouts vary", () => {
  const one = createPhoneState(1001), reload = normalize("kayip-telefon", JSON.parse(JSON.stringify(one)));
  assert.deepEqual(reload.caseLayout, one.caseLayout);
  assert.equal(reload.caseSeed, 1001);
  const layouts = new Set(Array.from({ length: 20 }, (_, i) => JSON.stringify(createPhoneState(i + 1).caseLayout)));
  assert.ok(layouts.size >= 10);
});

test("old v1 save migrates once and foreign/corrupt saves fail closed", () => {
  const old = create("kayip-telefon");
  old.meta.version = 1;
  delete old.caseSeed; delete old.caseLayout; delete old.evidenceLinks; delete old.pinnedItems;
  const migrated = normalize("kayip-telefon", old);
  assert.equal(migrated.meta.version, 2);
  const once = JSON.stringify(migrated), twice = JSON.stringify(normalize("kayip-telefon", migrated));
  assert.equal(twice, once);
  assert.equal(normalize("kayip-telefon", { meta: { version: 2, id: "apartman" }, history: [], openCases: [] }), null);
  assert.equal(normalize("kayip-telefon", { meta: { version: 2, id: "kayip-telefon" }, history: [], openCases: [] }), null);
});

test("links, pins, theories and final case report survive repeated load", () => {
  const state = createPhoneState(82);
  discover(state, ["photo_ticket", "cal_bus", "photo_bag", "cal_naz", "photo_cafe"]);
  applyAction("kayip-telefon", state, "pin:photo_ticket");
  applyAction("kayip-telefon", state, "link:photo_ticket:cal_bus");
  applyAction("kayip-telefon", state, "link:photo_ticket:cal_bus");
  applyAction("kayip-telefon", state, "theory:what:planned");
  assert.equal(state.evidenceLinks.length, 1);
  assert.equal(state.hypotheses[0].status, "supported");
  let loaded = normalize("kayip-telefon", JSON.parse(JSON.stringify(state)));
  loaded = normalize("kayip-telefon", JSON.parse(JSON.stringify(loaded)));
  applyAction("kayip-telefon", loaded, "decision:warn-family");
  applyAction("kayip-telefon", loaded, "return");
  const report = JSON.stringify(loaded.caseReport);
  applyAction("kayip-telefon", loaded, "return");
  assert.equal(JSON.stringify(loaded.caseReport), report);
  assert.equal(loaded.history.filter((x) => x.type === "ending").length, 1);
});

test("contradiction requires both sides and theory can be refuted", () => {
  const state = createPhoneState(9);
  discover(state, ["photo_cafe"]);
  assert.equal(state.contradiction.some((x) => x.with === "cal_naz"), false);
  discover(state, ["cal_naz"]);
  assert.equal(state.contradiction.some((x) => x.with === "cal_naz"), true);
  discover(state, ["photo_ticket", "cal_bus"]);
  applyAction("kayip-telefon", state, "theory:what:abduction");
  assert.equal(state.hypotheses[0].status, "refuted");
});

test("20 seeds x 10 strategies remain reachable, finite and bounded", () => {
  const endings = new Set(), theories = new Set(), secrets = new Set(), sizes = [];
  const strategies = ["early", "travel", "naz", "work", "ali", "family", "privacy", "broad", "wrong", "selective"];
  for (let seed = 1; seed <= 20; seed += 1) for (const strategy of strategies) {
    const state = createPhoneState(seed);
    const pools = {
      early: [], travel: ["photo_ticket", "cal_bus", "photo_bag"], naz: ["cal_naz", "photo_cafe", "file_map"],
      work: ["file_pdf", "cal_work", "call_emre"], ali: ["note_pin", "voice_2", "deleted_ali"],
      family: ["clue_0", "call_leyla", "photo_ticket", "cal_bus"], privacy: ["note_pin", "file_scan", "note_pass", "lock_note"],
      broad: DISCOVERABLES.map((x) => x.id), wrong: ["photo_ticket", "cal_bus"],
      selective: ["clue_0", "photo_bag", "cal_naz", "photo_cafe", "file_pdf", "cal_work"],
    };
    discover(state, pools[strategy]);
    if (strategy === "wrong") applyAction("kayip-telefon", state, "theory:what:abduction");
    else if (strategy !== "early") applyAction("kayip-telefon", state, "theory:what:planned");
    applyAction("kayip-telefon", state, `decision:${strategy === "wrong" ? "accuse-ali" : strategy === "family" ? "warn-family" : "return"}`);
    applyAction("kayip-telefon", state, "return");
    endings.add(state.flags.ending); state.hypotheses.forEach((x) => theories.add(`${x.question}:${x.option}:${x.status}`)); state.sideSecrets.forEach((x) => secrets.add(x));
    const encoded = JSON.stringify(state); sizes.push(encoded.length);
    assert.ok(!encoded.includes("NaN")); assert.ok(state.caseReport); assert.ok(state.history.length <= 80); assert.ok(state.timeline.length <= 80);
    for (const app of state.unlockedApps) assert.ok(Array.isArray(availableEvidence(state, app)));
  }
  assert.ok(endings.size >= 4); assert.ok(theories.size >= 2); assert.ok(secrets.size >= 3);
  assert.ok(Math.max(...sizes) < 20000);
  assert.equal(new Set(PHONE_SIDE_SECRETS.map((x) => x.id)).size, PHONE_SIDE_SECRETS.length);
});

// ---------------------------------------------------------------------------
// Wave 3 adversarial review regressions
// ---------------------------------------------------------------------------
const copy = (value) => JSON.parse(JSON.stringify(value));
const closeCase = (state, decision = "return") => {
  applyAction("kayip-telefon", state, `decision:${decision}`);
  applyAction("kayip-telefon", state, "return");
  return state;
};
// Cheapest route to all five critical facts (72 privacy pressure) that never
// opens the ID scan, the password draft or the lock pattern.
const RESTRAINED_FULL_SOLVE = [
  "photo_ticket", "cal_bus", "cal_naz", "photo_cafe",
  "file_pdf", "cal_work", "call_leyla", "voice_2", "deleted_ali",
];

test("a tampered save cannot seed the evidence graph with links linkEvidence would refuse", () => {
  const state = createPhoneState(7);
  discover(state, ["clue_0", "cal_clinic"]);
  const raw = copy(state);
  raw.evidenceLinks = [
    { key: "FAKE_A|FAKE_B", a: "FAKE_A", b: "FAKE_B", relation: "relevant" },
    { key: "clue_0|clue_0", a: "clue_0", b: "clue_0", relation: "relevant" },
    { key: "cal_clinic|clue_0", a: "clue_0", b: "cal_clinic", relation: "relevant" },
    { key: "cal_clinic|clue_0", a: "cal_clinic", b: "clue_0", relation: "relevant" },
    { key: "clue_0|photo_bag", a: "clue_0", b: "photo_bag", relation: "relevant" },
  ];
  const loaded = normalize("kayip-telefon", raw);
  assert.deepEqual(loaded.evidenceLinks.map((x) => x.key), ["cal_clinic|clue_0"]);
  assert.ok(loaded.evidenceLinks.every((x) => loaded.discoveredItems.includes(x.a) && loaded.discoveredItems.includes(x.b)));
  assert.ok(!loaded.evidenceLinks.some((x) => x.a === x.b));
});

test("a tampered save cannot repeat one theory answer to buy a better ending", () => {
  const honest = createPhoneState(7);
  discover(honest, ["photo_ticket", "cal_bus"]);
  applyAction("kayip-telefon", honest, "theory:what:planned");
  closeCase(honest, "accuse-ali");
  assert.equal(honest.caseReport.correct, 1);
  assert.equal(honest.flags.ending, "reckless");

  const tampered = createPhoneState(7);
  discover(tampered, ["photo_ticket", "cal_bus"]);
  applyAction("kayip-telefon", tampered, "theory:what:planned");
  const raw = copy(tampered);
  raw.hypotheses = [raw.hypotheses[0], copy(raw.hypotheses[0]), copy(raw.hypotheses[0])];
  const loaded = normalize("kayip-telefon", raw);
  assert.equal(loaded.hypotheses.length, 1);
  closeCase(loaded, "accuse-ali");
  assert.equal(loaded.caseReport.correct, 1);
  assert.equal(loaded.flags.ending, honest.flags.ending);
});

test("a save with a broken flags block loads playable instead of soft-locking", () => {
  // Unknown ending id: ENDINGS has no entry, so the UI used to render the
  // playable phone while every action and finishCase() refused to run.
  const bogus = copy(createPhoneState(3));
  bogus.flags.ending = "not-an-ending";
  const loaded = normalize("kayip-telefon", bogus);
  assert.equal(loaded.flags.ending, null);
  applyAction("kayip-telefon", loaded, "discover:clue_0");
  assert.equal(loaded.discoveredItems.length, 1);
  closeCase(loaded);
  assert.ok(Object.hasOwn(ENDINGS, loaded.flags.ending));
  assert.ok(loaded.caseReport);

  // Missing flags object entirely: the first action used to throw.
  const headless = copy(createPhoneState(3));
  delete headless.flags;
  const restored = normalize("kayip-telefon", headless);
  applyAction("kayip-telefon", restored, "discover:clue_0");
  closeCase(restored);
  assert.equal(restored.discoveredItems.length, 1);
  assert.ok(Object.hasOwn(ENDINGS, restored.flags.ending));
});

test("a run that opens nothing is never reported as a leaked life", () => {
  for (const option of ["planned", "abduction", "impulse"]) {
    const state = createPhoneState(3);
    applyAction("kayip-telefon", state, `theory:what:${option}`);
    closeCase(state);
    assert.equal(state.privacyPressure, 0);
    assert.equal(state.knownFacts.length, 0);
    // "reckless" is the privacy verdict and "thorough" claims you saw enough;
    // neither is true for a player who never opened a single item.
    assert.equal(state.flags.ending, "minimal", `what:${option}`);
  }
});

test("a complete restrained solve reaches the restrained endings, and one intimate file forfeits them", () => {
  for (const seed of [1, 7, 20]) {
    const witness = createPhoneState(seed);
    discover(witness, RESTRAINED_FULL_SOLVE);
    for (const [q, o] of [["what", "planned"], ["naz", "confidant"], ["ali", "lied"]])
      applyAction("kayip-telefon", witness, `theory:${q}:${o}`);
    assert.equal(witness.knownFacts.length, PHONE_FACTS.length, `seed ${seed}`);
    assert.equal(witness.privacyPressure, 72, `seed ${seed}`);
    closeCase(witness);
    assert.equal(witness.flags.ending, "witness", `seed ${seed}`);
    assert.equal(witness.caseReport.correct, 3);

    const family = createPhoneState(seed);
    discover(family, RESTRAINED_FULL_SOLVE);
    applyAction("kayip-telefon", family, "theory:what:planned");
    closeCase(family, "warn-family");
    assert.equal(family.flags.ending, "family", `seed ${seed}`);

    // Same deduction, plus the ID scan: the endings that are authored around
    // not touching the intimate files must drop away.
    const peeked = createPhoneState(seed);
    discover(peeked, RESTRAINED_FULL_SOLVE.concat("file_scan"));
    for (const [q, o] of [["what", "planned"], ["naz", "confidant"], ["ali", "lied"]])
      applyAction("kayip-telefon", peeked, `theory:${q}:${o}`);
    closeCase(peeked);
    assert.equal(peeked.flags.ending, "reckless", `seed ${seed}`);
  }
});

test("all five endings stay reachable and none dominates across a seed/strategy sweep", () => {
  const plans = {
    nothing: { items: [], theories: [], decision: "return" },
    thin: { items: ["photo_ticket", "cal_bus", "clue_0", "cal_clinic"], theories: [["what", "planned"]], decision: "return" },
    restrained: { items: RESTRAINED_FULL_SOLVE, theories: [["what", "planned"], ["naz", "confidant"], ["ali", "lied"]], decision: "return" },
    warnFamily: { items: RESTRAINED_FULL_SOLVE, theories: [["what", "planned"]], decision: "warn-family" },
    sweep: { items: DISCOVERABLES.map((x) => x.id), theories: [["what", "planned"], ["naz", "confidant"]], decision: "expose" },
    accuse: { items: ["note_pin", "voice_2"], theories: [["ali", "lied"]], decision: "accuse-ali" },
  };
  const tally = {};
  let runs = 0;
  for (let seed = 1; seed <= 20; seed += 1) {
    for (const plan of Object.values(plans)) {
      const state = createPhoneState(seed);
      discover(state, plan.items);
      for (const [q, o] of plan.theories) applyAction("kayip-telefon", state, `theory:${q}:${o}`);
      closeCase(state, plan.decision);
      tally[state.flags.ending] = (tally[state.flags.ending] || 0) + 1;
      runs += 1;
      assert.ok(Object.hasOwn(ENDINGS, state.flags.ending));
      assert.ok(!JSON.stringify(state).includes("NaN"));
    }
  }
  assert.equal(Object.keys(tally).length, Object.keys(ENDINGS).length, JSON.stringify(tally));
  for (const [ending, count] of Object.entries(tally))
    assert.ok(count / runs <= 0.45, `${ending} dominates at ${((count / runs) * 100).toFixed(1)}% ${JSON.stringify(tally)}`);
});
