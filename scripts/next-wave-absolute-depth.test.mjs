import test from "node:test";
import assert from "node:assert/strict";
import {
  create,
  applyAction,
  implementationRate,
  SCENARIOS,
  PERIODS,
  hydrateDevlet,
  tickDevletN,
  DOCTRINES,
  ALT_PRESETS,
  DISCOVERABLES,
  RESIDENTS,
  ISSUE_TEMPLATES,
  MEETINGS,
  finiteState,
  GUNUMUZ_BASELINE,
} from "../public/games/next-wave.js";

test("all devlet starts are playable and distinct", () => {
  const ids = ["1923", "1950", "1980", "2002", "gunumuz", "alternatif"];
  for (const id of ids) {
    assert.equal(PERIODS[id].playable, true, id);
    const s = hydrateDevlet(id);
    assert.equal(s.eraId, id);
    assert.ok(s.institutions.length >= 6);
    assert.ok(s.dna.centralization >= 0);
    assert.ok(s.actual.inflation !== undefined);
    applyAction("tc-sim-devlet", s, "policy");
    applyAction("tc-sim-devlet", s, "advance");
    assert.ok(s.time.turn >= 2);
    assert.notEqual(JSON.stringify(s.actual), JSON.stringify({ ...s.reported, fx: s.actual.fx }));
  }
  const a = hydrateDevlet("1923");
  const b = hydrateDevlet("2002");
  assert.notEqual(a.time.year, b.time.year);
  assert.notEqual(a.actual.inflation, b.actual.inflation);
  assert.notEqual(a.form, undefined);
  assert.equal(hydrateDevlet("gunumuz").time.year, GUNUMUZ_BASELINE.year);
});

test("era action hydrates real 1923 not a label", () => {
  const s = create("tc-sim-devlet");
  assert.equal(s.time.year, 2002);
  applyAction("tc-sim-devlet", s, "era:1923");
  assert.equal(s.eraId, "1923");
  assert.equal(s.time.year, 1923);
  assert.equal(s.scenario.id, "1923");
  assert.ok(s.institutions.some((i) => i.id === "maarif"));
});

test("grand campaign hedefsiz and hedefli plus alt sandbox", () => {
  const free = create("tc-sim-devlet");
  applyAction("tc-sim-devlet", free, "campaign:grand");
  assert.equal(free.scenario.campaign, true);
  assert.equal(free.time.year, 1923);
  assert.equal(free.scenario.doctrine, null);
  const aimed = create("tc-sim-devlet");
  applyAction("tc-sim-devlet", aimed, "campaign:sosyal");
  assert.equal(aimed.scenario.doctrine, "sosyal");
  assert.ok(aimed.dna.socialState > hydrateDevlet("1923").dna.socialState);
  const alt = create("tc-sim-devlet");
  applyAction("tc-sim-devlet", alt, "alt:federal");
  assert.equal(alt.eraId, "alternatif");
  assert.equal(alt.scenario.alt, "federal");
  assert.ok(DOCTRINES.length >= 7);
  assert.ok(ALT_PRESETS.length >= 5);
});

test("1284-month grand campaign is finite bounded deterministic", () => {
  const a = hydrateDevlet("1923", { campaign: true, doctrine: "istikrar" });
  tickDevletN(a, 1284);
  assert.ok(a.time.year >= 2029);
  assert.ok(finiteState(a));
  assert.ok(a.archive.length <= 40);
  assert.ok(a.history.length <= 80);
  assert.ok(a.events.length <= 40);
  assert.ok(a.yearDigest.length <= 120);
  const b = hydrateDevlet("1923", { campaign: true, doctrine: "istikrar" });
  tickDevletN(b, 1284);
  assert.equal(a.time.year, b.time.year);
  assert.equal(a.time.month, b.time.month);
  assert.equal(Math.round(a.actual.inflation), Math.round(b.actual.inflation));
  assert.ok(a.history.some((h) => h.type === "period-transition") || a.eraId !== "1923");
});

test("signature systems have consumers", () => {
  const s = hydrateDevlet("1980");
  const before = implementationRate(s);
  s.entropy = 90;
  s.heat = 90;
  const after = implementationRate(s);
  assert.ok(after < before);
  applyAction("tc-sim-devlet", s, "policy");
  assert.ok(s.butterflies.length >= 1);
  assert.ok(s.path.length >= 1);
  applyAction("tc-sim-devlet", s, "advance");
  assert.ok(s.kimDevlet && s.form);
  assert.ok(s.policyDebt.housing != null);
  assert.ok(s.memoryState || s.archive.length >= 1);
});

test("2002 isolation still holds after deepen", () => {
  const s = create("tc-sim-devlet");
  s.actual.inflation = 99;
  assert.equal(s.reported.inflation, 35);
  applyAction("tc-sim-devlet", s, "policy:eu-align");
  applyAction("tc-sim-devlet", s, "advance");
  assert.ok(implementationRate(s) >= 0 && implementationRate(s) <= 100);
});

test("son 100 has 16+ distinct scenarios that finish", () => {
  assert.ok(SCENARIOS.length >= 16);
  const ids = new Set(SCENARIOS.map((x) => x.id));
  assert.equal(ids.size, SCENARIOS.length);
  const starts = SCENARIOS.map((sc) => JSON.stringify(sc.resources) + sc.obligations[0].id);
  assert.ok(new Set(starts).size >= 16);
  for (const sc of SCENARIOS) {
    const s = create("son-100-gun");
    applyAction("son-100-gun", s, "scenario:" + sc.id);
    assert.equal(s.scenarioId, sc.id);
    assert.equal(s.remainingDays, 100);
    for (let i = 0; i < 100; i += 1) applyAction("son-100-gun", s, "advance");
    assert.equal(s.remainingDays, 0);
    assert.equal(s.flags.finalReport, true);
    assert.ok(Number.isFinite(s.resources.money));
  }
});


test("apartman resident politics scale", () => {
  assert.ok(RESIDENTS.length >= 16);
  assert.ok(ISSUE_TEMPLATES.length >= 40);
  assert.ok(MEETINGS.length >= 6);
  const s = create("apartman");
  applyAction("apartman", s, "meeting");
  assert.ok(s.lastMeeting.yes + s.lastMeeting.no === s.residents.length);
});

test("kayip telefon deeper graph", () => {
  assert.ok(DISCOVERABLES.length >= 26);
  const s = create("kayip-telefon");
  assert.ok(s.contacts.length >= 8);
  applyAction("kayip-telefon", s, "discover:call_leyla");
  applyAction("kayip-telefon", s, "discover:file_pdf");
  applyAction("kayip-telefon", s, "discover:cal_work");
  assert.ok(s.corroboration.length >= 1);
});
