import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  indicators,
  economy,
  townModifiers,
  investorTerms,
  actionInfo,
} from "../public/games/son-kasaba/sim.js";
import { EVENTS as TOWN_EVENTS, INVESTORS } from "../public/games/son-kasaba/data.js";

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

function stepSonDay(s, preferredOrder) {
  const startDay = s.day;
  let guard = 0;
  while (s.day === startDay && s.remainingDays > 0) {
    guard++;
    if (guard > 6) {
      applyAction("son-100-gun", s, "act:rest");
      continue;
    }
    if (s.actionsRemaining > 0) {
      const acts = availableSonActions(s);
      const id = preferredOrder.find((x) => acts.includes(x)) || acts[0];
      if (id) applyAction("son-100-gun", s, `act:${id}`);
      else applyAction("son-100-gun", s, "advance");
    } else {
      applyAction("son-100-gun", s, "advance");
    }
  }
}

test("Son 100 Gün: write-will stays reachable during the legal crisis chain's preparation window", () => {
  // Regression for a real bug: availableSonActions() truncates to 10 ids, and
  // write-will/forgive/confess/donate/report-crime/legacy used to be appended
  // AFTER the fracture/scarcity/collapse "chaos" options (quit/party/drink/
  // travel/confront/sex/pray), which alone already fill the 10-slot cap during
  // those phases. That made write-will - the only real preparation for the
  // "legal-return" crisis chain - silently invisible for its entire due
  // window (remainingDays 40 down to 33), so no amount of player skill could
  // reduce that chain's risk. Assert it now actually appears in that window.
  const s = create("son-100-gun");
  applyAction("son-100-gun", s, "scenario:financial-recovery");
  while (s.remainingDays > 40) stepSonDay(s, ["work"]);
  let sawWriteWill = false;
  while (s.remainingDays >= 33 && s.remainingDays > 0) {
    if (availableSonActions(s).includes("write-will")) sawWriteWill = true;
    stepSonDay(s, ["write-will"]);
  }
  assert.equal(sawWriteWill, true);
  const chain = s.depth.resolved.find((c) => c.id === "legal-return");
  assert.ok(chain, "legal-return chain must have resolved by remainingDays 33");
  assert.ok(
    chain.preparation >= 6,
    `a player who spends the whole window on write-will should reach high legal preparation, got ${chain.preparation}`,
  );
});

test("Son 100 Gün: a save with a duplicate openCases id is rejected by normalize", () => {
  // Regression: validateSonState had no uniqueness check on openCases (unlike
  // Son Kasaba's equivalent check on `pending`), so a corrupted/tampered save
  // with two entries sharing one id would pass validation and later have its
  // consequence applied twice by resolveCases().
  const tampered = create("son-100-gun");
  tampered.openCases.push({ id: "dup-x", title: "a", due: tampered.day + 5, status: "open" });
  tampered.openCases.push({ id: "dup-x", title: "b", due: tampered.day + 5, status: "open" });
  assert.equal(normalize("son-100-gun", tampered), null);
  const clean = create("son-100-gun");
  assert.notEqual(normalize("son-100-gun", clean), null);
});

test("Son 100 Gün: phase/forecast bilingual text is rendered with text(), not passed whole into loc()", () => {
  // Regression: sonPhase().label/.note and sonForecast().title/.band are all
  // [tr, en] pairs. app.js used to hand the whole pair straight to loc(),
  // which expects a single Turkish string and returns its argument unchanged
  // when not in English - so the pair array reached a template literal and
  // Array#toString joined it as "Türkçe,English" (e.g. "HAZIRLIK,PREPARATION"
  // in the phase eyebrow, and again in the new risk-forecast panel and the
  // final report's crisis dossier). The fix added a local pair() helper that
  // calls text(tr, en) for arrays instead. This test guards the four call
  // sites directly against a regression back to bare loc(...).
  const source = readFileSync(
    new URL("../public/games/son-100-gun/app.js", import.meta.url),
    "utf8",
  );
  for (const broken of [
    "loc(phase.label)",
    "loc(phase.note)",
    "loc(forecast.title)",
    "loc(forecast.band)",
  ]) {
    assert.ok(
      !source.includes(broken),
      `${broken} must not appear - use pair(...) for [tr, en] fields`,
    );
  }
  for (const fixed of [
    "pair(phase.label)",
    "pair(phase.note)",
    "pair(forecast.title)",
    "pair(forecast.band)",
  ]) {
    assert.ok(source.includes(fixed), `expected ${fixed} in app.js`);
  }
});

test("Son 100 Gün: every action label has a real English phrase", async () => {
  await import("../public/i18n/tlab-i18n.js");
  globalThis.tlabI18n.setLang("en");
  for (const action of SON_ACTIONS)
    assert.notEqual(globalThis.tlabI18n.phrase(action.label), action.label, action.id);
  globalThis.tlabI18n.setLang("tr");
});

test("Son Kasaba: every governance stage unlocks bounded, mechanical institution effects", () => {
  const s = createTown();
  const baseIndicators = indicators(s);
  const baseEconomy = economy(s);
  assert.deepEqual(townModifiers(s), {
    councilTrust: 1,
    serviceBonus: 0,
    marketIncome: 1,
    upkeepFactor: 1,
    migrationRelief: 0,
    companyResistance: 0,
  });

  s.progression = {
    stage: "municipal",
    score: 50,
    institutions: ["council", "service-board", "market-desk"],
    milestones: [],
  };
  assert.equal(Math.round(indicators(s).health - baseIndicators.health), 4);
  assert.ok(economy(s).income.business > baseEconomy.income.business);
  assert.equal(investorTerms(s, "hotel").eligible, true);
  assert.equal(investorTerms(s, "solar").eligible, false);

  s.progression = {
    stage: "planning",
    score: 65,
    institutions: ["council", "service-board", "market-desk", "planning-office", "social-council"],
    milestones: [],
  };
  const planning = economy(s);
  assert.ok(planning.costs.maintenance < baseEconomy.costs.maintenance);
  assert.equal(townModifiers(s).migrationRelief, 0.18);
  assert.equal(investorTerms(s, "mine").eligible, true);

  s.progression = {
    stage: "regional",
    score: 80,
    institutions: [
      "council",
      "service-board",
      "market-desk",
      "planning-office",
      "social-council",
      "town-charter",
    ],
    milestones: [],
  };
  assert.equal(townModifiers(s).companyResistance, 1);
  assert.ok(Object.values(townModifiers(s)).every((value) => Number.isFinite(value)));
});

const TOWN_POLICIES = [
  "accept-all",
  "reject-all",
  "selective",
  "identity-aligned",
  "cash-first",
  "trust-first",
  "service-first",
  "adaptive",
];

function investorChoice(policy, s, offer, context) {
  if (policy === "accept-all") return "accept";
  if (policy === "reject-all") return "reject";
  if (policy === "selective")
    return ["solar", "hospital", "agriculture"].includes(offer.id) ? "accept" : "reject";
  if (policy === "identity-aligned") {
    const aligned = {
      balanced: ["hotel", "hospital"],
      industry: ["factory", "logistics"],
      rural: ["solar", "agriculture"],
    }[context];
    return aligned.includes(offer.id) ? "accept" : "reject";
  }
  if (policy === "cash-first") return s.budget < 80000 ? "accept" : "negotiate";
  if (policy === "trust-first") return s.metrics.trust < 55 ? "reject" : "negotiate";
  if (policy === "service-first")
    return ["hospital", "solar"].includes(offer.id) ? "accept" : "reject";
  return s.metrics.company < 35 && s.metrics.trust > 42 ? "accept" : "reject";
}

function runTownPolicy(policy, run) {
  const context = ["balanced", "industry", "rural"][run % 3];
  const s = createTown({ context });
  const civic = {
    "accept-all": ["civic:road", "civic:water", "civic:energy"],
    "reject-all": ["civic:road", "civic:water", "repair:school"],
    selective: ["civic:support", "civic:road", "repair:clinic"],
    "identity-aligned": ["civic:support", "civic:festival", "civic:water"],
    "cash-first": ["civic:repay", "civic:support", "civic:road"],
    "trust-first": ["civic:festival", "civic:housing", "coalition:young:elders"],
    "service-first": ["repair:school", "repair:clinic", "civic:water"],
    adaptive: ["civic:road", "civic:water", "civic:support"],
  }[policy];
  while (!s.ended) {
    for (const offer of s.investors.filter((item) => item.status === "offered")) {
      const choice = investorChoice(policy, s, offer, context);
      const command = `investor:${offer.id}:${choice}`;
      if (!actionInfo(s, command).reason) applyTownAction(s, command);
    }
    for (const command of civic)
      if (s.used.length < 3 && !actionInfo(s, command).reason) applyTownAction(s, command);
    for (const event of s.events.filter((item) => item.status === "open")) {
      const command = `event:${event.id}:${run % 4 === 0 ? "decline" : "act"}`;
      if (s.used.length < 3 && !actionInfo(s, command).reason) applyTownAction(s, command);
    }
    advanceTown(s);
    assert.ok(validateTown(s));
  }
  return {
    ending: s.ending.id,
    population: population(s),
    budget: s.budget,
    debt: s.debt,
    trust: s.metrics.trust,
    company: s.metrics.company,
    investors: s.investors.filter((item) => item.status === "accepted").length,
    stage: s.progression.stage,
    saveSize: JSON.stringify(s).length,
  };
}

test("Son Kasaba: 8-policy investor matrix keeps accept-all viable without making it dominant", () => {
  const matrix = Object.fromEntries(
    TOWN_POLICIES.map((policy) => [
      policy,
      Array.from({ length: 6 }, (_, run) => runTownPolicy(policy, run)),
    ]),
  );
  const average = (policy, key) =>
    matrix[policy].reduce((total, row) => total + row[key], 0) / matrix[policy].length;
  assert.ok(matrix["accept-all"].every((row) => row.population >= 350));
  assert.ok(matrix["accept-all"].every((row) => row.investors === INVESTORS.length));
  assert.ok(matrix["accept-all"].every((row) => row.ending === "sold"));
  assert.ok(matrix["reject-all"].every((row) => row.investors === 0 && row.ending !== "ghost"));
  assert.ok(average("selective", "population") >= average("accept-all", "population"));
  assert.ok(average("selective", "debt") < average("accept-all", "debt"));
  assert.ok(average("selective", "company") < average("accept-all", "company"));
  assert.ok(
    Object.values(matrix)
      .flat()
      .every((row) => row.saveSize < 100000),
  );
  assert.ok(
    new Set(
      Object.values(matrix)
        .flat()
        .map((row) => row.ending),
    ).size >= 4,
  );
});

test("Son Kasaba: investor commitments and institution state survive save/load without duplicate consequences", () => {
  const s = createTown();
  s.month = 10;
  s.completedMonths = 9;
  for (const key of ["trust", "reputation", "services", "water", "energy", "health", "school"])
    s.metrics[key] = 80;
  for (const building of s.buildings) {
    building.open = true;
    building.condition = 80;
  }
  updateTownProgression(s);
  const offer = s.investors.find((item) => item.id === "hotel");
  offer.status = "offered";
  assert.equal(applyTownAction(s, "investor:hotel:accept"), true);
  const restored = normalizeTown("son-kasaba", copy(s));
  assert.deepEqual(restored.progression, s.progression);
  assert.equal(restored.investors.find((item) => item.id === "hotel").acceptedMonth, 10);
  while (restored.month < 13) advanceTown(restored);
  const resolved = restored.resolvedEffects.filter((id) => id === "investor-hotel");
  assert.equal(resolved.length, 1);
  assert.equal(restored.openCases.filter((item) => item.id === "investor-hotel").length, 1);
  assert.equal(
    normalizeTown("son-kasaba", { ...copy(restored), meta: { ...restored.meta, id: "apartman" } }),
    null,
  );
});
