import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAction, create, normalize, DISCOVERABLES, createPhoneState,
  availableEvidence, PHONE_FACTS, PHONE_SIDE_SECRETS,
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
