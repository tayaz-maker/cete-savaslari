import test from "node:test";
import assert from "node:assert/strict";
import { create, applyAction, normalize, SON_ACTIONS } from "../public/games/next-wave.js";
import { EVENTS as SON_EVENTS, SON_CALLBACKS } from "../public/games/next-wave/son100-data.js";
import {
  SON_PHASES,
  availableSonActions,
  sonEventEligibleForPhase,
  sonForecast,
  sonPhase,
} from "../public/games/next-wave/son100-sim.js";
import {
  createTown,
  normalizeTown,
  applyTownAction,
  advanceTown,
  eventEligible,
  updateTownProgression,
  validateTown,
  population,
} from "../public/games/son-kasaba/sim.js";
import { EVENTS as TOWN_EVENTS } from "../public/games/son-kasaba/data.js";

const copy = (value) => JSON.parse(JSON.stringify(value));

test("Son 100 Gün uses the exact five phase boundaries and every authored event has a reachable phase", () => {
  const boundaries = [
    [100, "preparation"],
    [81, "preparation"],
    [80, "fracture"],
    [61, "fracture"],
    [60, "scarcity"],
    [41, "scarcity"],
    [40, "collapse"],
    [21, "collapse"],
    [20, "finale"],
    [1, "finale"],
  ];
  for (const [left, id] of boundaries) assert.equal(sonPhase({ remainingDays: left }).id, id);
  assert.equal(SON_PHASES.length, 5);
  assert.equal(new Set(SON_EVENTS.map((e) => e.id)).size, SON_EVENTS.length);
  assert.equal(new Set(SON_CALLBACKS.map((e) => e.id)).size, SON_CALLBACKS.length);
  assert.equal(new Set(SON_ACTIONS.map((e) => e.id)).size, SON_ACTIONS.length);
  const samples = { preparation: 90, fracture: 70, scarcity: 50, collapse: 30, finale: 10 };
  for (const event of SON_EVENTS) {
    assert.ok(
      Object.entries(samples).some(([phase, left]) => sonEventEligibleForPhase(event, phase, left)),
      event.id,
    );
  }
});

test("Son 100 Gün forecast, preparation, actor memory and crisis chains survive save/load and resolve once", () => {
  const raw = create("son-100-gun");
  raw.meta.version = 1;
  delete raw.depth;
  const s = normalize("son-100-gun", copy(raw));
  assert.equal(s.meta.version, 2);
  const again = copy(s);
  normalize("son-100-gun", s);
  assert.deepEqual(s, again);
  applyAction("son-100-gun", s, "act:doctor");
  assert.equal(s.depth.preparations.health, 1);
  assert.ok(sonForecast(s));
  const saved = normalize("son-100-gun", copy(s));
  while (saved.remainingDays > 91) applyAction("son-100-gun", saved, "advance");
  const count = saved.history.filter((x) => x.type === "crisis" && x.id === "diagnosis").length;
  applyAction("son-100-gun", saved, "advance");
  assert.equal(count, 1);
  assert.equal(saved.history.filter((x) => x.type === "crisis" && x.id === "diagnosis").length, 1);
  const corrupt = create("son-100-gun");
  delete corrupt.resources;
  assert.equal(normalize("son-100-gun", corrupt), null);
  const foreign = create("son-100-gun");
  foreign.meta.id = "son-kasaba";
  assert.equal(normalize("son-100-gun", foreign), null);
});

test("20 Son 100 Gün strategies finish deterministically with varied dossiers and bounded saves", () => {
  const endings = new Set();
  const seen = new Set();
  for (let run = 0; run < 20; run++) {
    const s = create("son-100-gun");
    applyAction(
      "son-100-gun",
      s,
      `scenario:${["financial-recovery", "family-care", "creative-legacy", "justice-case"][run % 4]}`,
    );
    while (s.remainingDays > 0) {
      const actions = availableSonActions(s);
      const preferences =
        run % 4 === 0
          ? ["work", "pay", "family"]
          : run % 4 === 1
            ? ["rest", "doctor", "family"]
            : run % 4 === 2
              ? ["legacy", "write-will", "donate"]
              : ["confess", "report-crime", "forgive"];
      const id =
        preferences.find((x) => actions.includes(x)) || actions[(run + s.day) % actions.length];
      if (id) applyAction("son-100-gun", s, `act:${id}`);
      applyAction("son-100-gun", s, "advance");
      for (const op of s.opportunities) if (op.src) seen.add(op.src);
    }
    assert.equal(s.flags.finalReport, true);
    assert.equal(s.depth.resolved.length, 5);
    assert.equal(new Set(s.depth.resolved.map((x) => x.id)).size, 5);
    assert.ok(JSON.stringify(s).length < 70000);
    assert.ok(Number.isFinite(s.resources.money));
    endings.add(s.flags.report.endingId);
  }
  assert.ok(endings.size >= 3);
  assert.ok(seen.size >= 30);
});

function makeTownEventReachable(event) {
  const s = createTown();
  s.seenEvents = [];
  s.events = [];
  s.month = Math.max(event.month, event.gate === "late" ? 20 : 1);
  if (event.gate === "wet") while (s.month % 6 !== 3 && s.month < 24) s.month++;
  s.completedMonths = s.month - 1;
  const m = s.metrics;
  if (["road", "water", "supply", "energy", "jobs", "social"].includes(event.gate))
    m[event.gate] = 0;
  if (event.gate === "health") {
    m.health = 0;
    m.supply = 0;
    s.buildings.find((b) => b.id === "clinic").open = false;
  }
  if (event.gate === "school") s.buildings.find((b) => b.id === "school").open = false;
  if (event.gate === "transport") {
    s.buildings.find((b) => b.id === "fuel").open = false;
    s.buildings.find((b) => b.id === "bus").open = false;
  }
  const positiveGate = {
    reputation: "reputation",
    industry: "production",
    culture: "localIdentity",
    enterprise: "enterprise",
    agriculture: "agriculture",
    tourism: "tourism",
  }[event.gate];
  if (positiveGate) m[positiveGate] = 100;
  if (event.gate === "prices") m.prices = 150;
  if (event.gate === "rent") m.rent = 100;
  if (event.gate === "debt") s.debt = 100000;
  if (event.gate === "pollution") m.pollution = 100;
  if (event.gate === "retirement") s.cohorts.find((c) => c.id === "retired").count = 250;
  if (event.gate === "division") m.inequality = 100;
  if (event.gate === "company") m.company = 100;
  return s;
}

test("every Son Kasaba event gate is reachable and v1 migration is strict and idempotent", () => {
  assert.equal(new Set(TOWN_EVENTS.map((e) => e.id)).size, TOWN_EVENTS.length);
  for (const event of TOWN_EVENTS)
    assert.equal(eventEligible(makeTownEventReachable(event), event), true, event.id);
  const legacy = createTown();
  legacy.meta.version = 1;
  delete legacy.progression;
  delete legacy.chains;
  delete legacy.identityHistory;
  delete legacy.migrationLog;
  delete legacy.resolvedEffects;
  const migrated = normalizeTown("son-kasaba", legacy);
  assert.equal(migrated.meta.version, 2);
  const stable = copy(migrated);
  normalizeTown("son-kasaba", migrated);
  assert.deepEqual(migrated, stable);
  const corrupt = copy(legacy);
  delete corrupt.cohorts;
  assert.equal(normalizeTown("son-kasaba", corrupt), null);
});

test("20 Son Kasaba investment, migration, service and cash policies remain bounded", () => {
  const endings = new Set();
  for (let run = 0; run < 20; run++) {
    const s = createTown({ context: ["balanced", "industry", "rural"][run % 3] });
    if (run % 4 === 0) s.budget = 25000;
    if (run % 4 === 2) s.budget = 350000;
    for (let month = 0; month < 24; month++) {
      const candidates =
        run % 4 === 0
          ? ["civic:loan", "civic:road", "repair:school"]
          : run % 4 === 1
            ? ["civic:housing", "civic:support", "civic:festival"]
            : run % 4 === 2
              ? ["civic:water", "civic:energy", "repair:clinic"]
              : ["civic:cleanup", "civic:road", "coalition:young:elders"];
      for (const cmd of candidates) applyTownAction(s, cmd);
      for (const e of s.events.filter((x) => x.status === "open").slice(0, 1))
        applyTownAction(s, `event:${e.id}:${run % 3 ? "act" : "decline"}`);
      for (const offer of s.investors.filter((x) => x.status === "offered").slice(0, 1))
        applyTownAction(
          s,
          `investor:${offer.id}:${run % 3 === 0 ? "reject" : run % 3 === 1 ? "negotiate" : "accept"}`,
        );
      advanceTown(s);
      assert.ok(validateTown(s));
      assert.ok(Number.isFinite(population(s)) && population(s) <= 100000);
      assert.ok(s.budget <= 1e9 && s.debt <= 1e9);
    }
    endings.add(s.ending.id);
    assert.ok(JSON.stringify(s).length < 100000);
  }
  assert.ok(endings.size >= 2);
  const high = createTown();
  high.month = 18;
  high.completedMonths = 17;
  for (const key of ["trust", "reputation", "services", "water", "energy", "health", "school"])
    high.metrics[key] = 90;
  for (const b of high.buildings) {
    b.open = true;
    b.condition = 90;
  }
  updateTownProgression(high);
  assert.equal(high.progression.stage, "regional");
});
