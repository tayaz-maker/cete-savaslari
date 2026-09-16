import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState, SAVE_VERSION, addNpcMemory } from "../public/games/tc-sim/js/state.js";
import { migrateState } from "../public/games/tc-sim/js/save.js";
import { advanceWeek, applyDecision, canApplyDecision } from "../public/games/tc-sim/js/time.js";
import {
  EVENT_DEFINITIONS,
  enqueueEvent,
  activateNextEvent,
  getEventDefinition,
  resolveEvent,
} from "../public/games/tc-sim/js/events.js";
import { buildLifeDossier, LIFE_ARC_IDS, LIFE_DEPTH_EVENTS, validateLifeDepthState } from "../public/games/tc-sim/js/life-depth.js";
import {
  LIFE_CONTENT_EVENTS,
  CHAINS,
  EXCLUSIVE_PAIRS,
  ACTOR_VOICES,
  coverage,
  shownBranch,
  applyLifeContentResolution,
  processLifeContentWeek,
  decorateLifeDossier,
  lifeContentBag,
  scheduleContent,
  DOSSIER_TRACE_TEMPLATES,
  actorVoiceLine,
} from "../public/games/tc-sim/js/life-content.js";

const copy = (value) => JSON.parse(JSON.stringify(value));

function settle(state, prefer = null) {
  let guard = 0;
  while (state.events.active && guard++ < 50) {
    const event = getEventDefinition(state.events.active.eventId);
    assert.ok(event, `missing definition ${state.events.active.eventId}`);
    const choice = event.choices.find((row) => row.id === prefer) || event.choices[0];
    assert.equal(resolveEvent(state, choice.id).ok, true, event.id);
  }
  assert.ok(guard < 50, "event queue soft-lock");
}

function fire(state, eventId, choiceId) {
  state.events.active = null;
  assert.equal(enqueueEvent(state, eventId), true, eventId);
  activateNextEvent(state);
  assert.equal(state.events.active?.eventId, eventId, eventId);
  const result = resolveEvent(state, choiceId);
  assert.equal(result.ok, true, `${eventId}:${choiceId}`);
  return result;
}

function finiteTree(value, path = "root") {
  if (value == null) return;
  if (typeof value === "number") {
    assert.ok(Number.isFinite(value), `NaN/Inf at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => finiteTree(item, `${path}[${i}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) finiteTree(item, `${path}.${key}`);
  }
}

test("Wave 4 content coverage: unique ids, floors met, no core collisions", () => {
  const cov = coverage();
  assert.ok(cov.events >= 120, `events ${cov.events}`);
  assert.ok(cov.chains >= 30, `chains ${cov.chains}`);
  assert.ok(cov.delayedCallbacks >= 40, `delayed ${cov.delayedCallbacks}`);
  assert.ok(cov.memorySensitive >= 35, `memory ${cov.memorySensitive}`);
  assert.ok(cov.crossArc >= 25, `cross ${cov.crossArc}`);
  assert.ok(cov.phaseAge >= 20, `phase ${cov.phaseAge}`);
  assert.ok(cov.economyHousing >= 20, `economy ${cov.economyHousing}`);
  assert.ok(cov.relationshipFamily >= 20, `rel ${cov.relationshipFamily}`);
  assert.ok(cov.careerEducation >= 15, `career ${cov.careerEducation}`);
  assert.equal(cov.exclusive, 12);
  assert.ok(cov.voices >= 6, `voices ${cov.voices}`);
  assert.ok(cov.dossierTraces >= 10, `traces ${cov.dossierTraces}`);
  assert.ok(cov.outcomeFlavor >= 8, `flavor ${cov.outcomeFlavor}`);
  assert.ok(cov.longTerm >= 10, `long ${cov.longTerm}`);
  const ids = LIFE_CONTENT_EVENTS.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length);
  const core = new Set(EVENT_DEFINITIONS.filter((row) => !row.lifeContent).map((row) => row.id));
  for (const id of ids) assert.equal(core.has(id), false, `collision ${id}`);
  for (const event of LIFE_CONTENT_EVENTS) {
    assert.ok(event.choices.length >= 2, event.id);
    assert.ok(event.en?.title && event.en?.text, event.id);
    assert.ok(!String(event.title).includes("undefined"), event.id);
    assert.ok(!String(event.text).includes("[object"), event.id);
  }
  const chainIds = new Set(CHAINS.map((row) => row.id));
  assert.equal(chainIds.size, CHAINS.length);
  assert.equal(Object.keys(EXCLUSIVE_PAIRS).length, 12);
  for (const [family, branches] of Object.entries(EXCLUSIVE_PAIRS)) {
    assert.equal(branches.length, 2, family);
    assert.notEqual(branches[0], branches[1]);
    const siblings = CHAINS.filter((row) => row.exclusive === family);
    assert.ok(siblings.length >= 2, family);
  }
  const voices = Object.values(ACTOR_VOICES).map((row) => JSON.stringify(row.line));
  assert.equal(new Set(voices).size, voices.length);
  assert.equal(DOSSIER_TRACE_TEMPLATES.length, cov.dossierTraces);
  assert.equal(LIFE_DEPTH_EVENTS.length, 4);
  assert.equal(SAVE_VERSION, 6);
});

test("metro-shift, mehmet-nakit and bayram chains walk delayed stages", () => {
  const metro = createNewGame({ seed: 11 });
  metro.career.jobId = "office";
  fire(metro, "lc_metro_offer", "take");
  assert.equal(metro.flags.lifeContent.exclusive["commute-path"], "metro");
  const month = metro.flags.lifeContent.waiting.find((row) => row.eventId === "lc_metro_month");
  assert.ok(month);
  while (metro.time.absoluteWeek < month.dueWeek) {
    settle(metro);
    assert.equal(advanceWeek(metro).ok, true);
  }
  settle(metro);
  assert.ok(metro.events.seen.includes("lc_metro_month"));

  const mehmet = createNewGame({ seed: 12 });
  mehmet.finances.balance = 12000;
  fire(mehmet, "lc_mehmet_cash", "lend");
  assert.ok(mehmet.people.find((row) => row.id === "mehmet").memories.some((row) => row.type === "lc_helped_mehmet_money"));
  const pay = mehmet.flags.lifeContent.waiting.find((row) => row.eventId === "lc_mehmet_payback");
  assert.ok(pay);
  while (mehmet.time.absoluteWeek < pay.dueWeek) {
    settle(mehmet);
    assert.equal(advanceWeek(mehmet).ok, true);
  }
  settle(mehmet);
  assert.ok(mehmet.events.seen.includes("lc_mehmet_payback"));

  const bayram = createNewGame({ seed: 13 });
  fire(bayram, "lc_bayram_invite", "go");
  assert.ok(bayram.people.find((row) => row.id === "anne").memories.some((row) => row.type === "lc_bayram_came"));
  const table = bayram.flags.lifeContent.waiting.find((row) => row.eventId === "lc_bayram_table");
  assert.ok(table);
  while (bayram.time.absoluteWeek < table.dueWeek) {
    settle(bayram);
    assert.equal(advanceWeek(bayram).ok, true);
  }
  settle(bayram);
  assert.ok(bayram.events.seen.includes("lc_bayram_table"));
});

test("exclusive families seed-pick one sibling and lock on resolve", () => {
  const seen = { metro: 0, car: 0 };
  for (let seed = 1; seed <= 24; seed += 1) {
    const state = createNewGame({ seed });
    state.time.absoluteWeek = 20;
    state.player.age = 28;
    state.career.jobId = "office";
    const branch = shownBranch(state, "commute-path");
    seen[branch] = (seen[branch] || 0) + 1;
    const metro = LIFE_CONTENT_EVENTS.find((row) => row.id === "lc_metro_offer");
    const car = LIFE_CONTENT_EVENTS.find((row) => row.id === "lc_car_offer");
    const metroOk = typeof metro.organicCheck === "function" && metro.organicCheck(state);
    const carOk = typeof car.organicCheck === "function" && car.organicCheck(state);
    assert.equal(metroOk && carOk, false, `both open seed ${seed}`);
    if (branch === "metro") assert.equal(carOk, false);
    if (branch === "car") assert.equal(metroOk, false);
  }
  assert.ok(seen.metro > 0 && seen.car > 0, JSON.stringify(seen));

  const locked = createNewGame({ seed: 4 });
  fire(locked, "lc_metro_offer", "keep");
  assert.equal(locked.flags.lifeContent.exclusive["commute-path"], "metro");
  locked.time.absoluteWeek = 40;
  locked.career.jobId = "office";
  locked.player.age = 30;
  assert.equal(LIFE_CONTENT_EVENTS.find((row) => row.id === "lc_car_offer").organicCheck(locked), false);
});

test("delayed auto-callbacks stay once and leave room for engine effects", () => {
  const state = createNewGame({ seed: 21 });
  state.time.absoluteWeek = 20;
  state.finances.arrears = 4000;
  processLifeContentWeek(state);
  processLifeContentWeek(state);
  const letters = state.flags.lifeContent.waiting.filter((row) => row.eventId === "lc_arrears_letter");
  assert.equal(letters.length, 1);
  assert.ok(state.flags.lifeContent.once["lc:arrears-letter"]);
  const again = scheduleContent(state, { eventId: "lc_arrears_letter", dueWeeks: 1, key: "arrears-letter" });
  assert.equal(again, false);
  assert.ok(state.lifeDepth.pendingEffects.length <= 12);
  assert.equal(validateLifeDepthState(state), true);
});

test("actor memory follow-up schedules and missing actor does not throw", () => {
  const state = createNewGame({ seed: 22 });
  state.time.absoluteWeek = 22;
  state.household.homeId = "studio";
  state.finances.arrears = 0;
  addNpcMemory(state, "mehmet", "3.500'ü verdi, söylemedi.", "lc_helped_mehmet_money");
  processLifeContentWeek(state);
  assert.ok(state.flags.lifeContent.waiting.some((row) => row.eventId === "lc_move_help_echo"));

  const ghost = createNewGame({ seed: 23 });
  ghost.people = ghost.people.filter((row) => row.id !== "mehmet");
  assert.doesNotThrow(() => fire(ghost, "lc_mehmet_cash", "lend"));
  assert.doesNotThrow(() => applyLifeContentResolution(ghost, getEventDefinition("lc_mehmet_cash"), "lend"));
  assert.doesNotThrow(() => actorVoiceLine("nobody"));
  assert.equal(actorVoiceLine("nobody"), "");
});

test("old v6 save without lifeContent migrates and stays bounded", () => {
  const state = createNewGame({ seed: 24 });
  assert.equal(state.meta.saveVersion, 6);
  delete state.flags.lifeContent;
  const migrated = migrateState(copy(state));
  assert.equal(migrated.ok, true);
  assert.doesNotThrow(() => processLifeContentWeek(migrated.state));
  assert.ok(migrated.state.flags.lifeContent);
  assert.deepEqual(migrated.state.flags.lifeContent.once, {});
  fire(migrated.state, "lc_bayram_invite", "skip");
  const encoded = JSON.stringify(migrated.state);
  assert.equal(encoded.includes("NaN"), false);
  assert.ok(Buffer.byteLength(encoded) < 300_000);
  assert.equal(validateState(migrated.state).ok, true);
  const second = migrateState(copy(migrated.state));
  assert.equal(second.ok, true);
});

test("Life Dossier decorate is additive and does not change outcome ids", () => {
  const state = createNewGame({ seed: 9 });
  state.career.performance = 82;
  state.career.weeksInRole = 140;
  state.education.level = "lisans";
  state.finances.balance = 26000;
  state.household.homeId = "shared";
  state.player.age = 54;
  lifeContentBag(state).exclusive["career-fork"] = "yurtdisi";
  lifeContentBag(state).exclusive["commute-path"] = "metro";
  const first = buildLifeDossier(state);
  const outcome = first.outcome;
  const decorated = decorateLifeDossier(state);
  assert.equal(decorated.outcome, outcome);
  assert.ok(decorated.flavor);
  assert.ok(decorated.traces.length <= 10);
  assert.ok(decorated.traces.some((row) => String(row.id).startsWith("lc-")));
  const second = buildLifeDossier(copy(state));
  assert.equal(second.outcome, outcome);
});

test("40 strategy lives stay finite, diverse and content-bearing", { timeout: 240_000 }, () => {
  const strategies = [
    "career", "family", "money", "relationship", "education", "social",
    "debt-zero", "debt-heavy", "housing-min", "housing-quality",
    "balanced", "adaptive", "random",
  ];
  const outcomes = new Set();
  const seenContent = new Set();
  const sizes = [];
  for (let run = 0; run < 40; run += 1) {
    const strategy = strategies[run % strategies.length];
    const profile = strategy === "career" ? "ambitious" : strategy === "relationship" || strategy === "social" ? "social" : "balanced";
    const state = createNewGame({
      seed: 2000 + run,
      profile,
      familyType: ["nuclear", "extended", "stem", "single"][run % 4],
    });
    if (strategy === "housing-quality") state.household.homeId = "studio";
    if (strategy === "housing-min") state.household.homeId = "family";
    if (strategy === "debt-heavy") state.finances.arrears = 8000;
    for (let step = 0; step < 720 && !state.lifetime?.death; step += 1) {
      settle(state, strategy === "debt-heavy" ? "hold" : null);
      const preferred = {
        career: ["overtime", "rest"],
        family: ["family", "rest"],
        money: ["overtime", "budget-check"],
        relationship: ["friend", "family"],
        education: ["rest", "budget-check"],
        social: ["friend", "exercise"],
        "debt-zero": ["budget-check", "rest"],
        "debt-heavy": ["overtime", "budget-check"],
        "housing-min": ["family", "rest"],
        "housing-quality": ["overtime", "rest"],
        balanced: ["rest", "family"],
        adaptive: [state.health.stress > 60 ? "rest" : "overtime", "family"],
        random: ["exercise", "friend"],
      }[strategy];
      for (const id of preferred) {
        settle(state);
        if (canApplyDecision(state, id).ok) applyDecision(state, id);
        settle(state);
      }
      settle(state);
      const result = advanceWeek(state);
      assert.equal(result.ok, true);
    }
    assert.equal(validateState(state).ok, true);
    finiteTree(state);
    const encoded = JSON.stringify(state);
    assert.equal(encoded.includes("NaN"), false);
    sizes.push(Buffer.byteLength(encoded));
    assert.ok(state.lifeDepth.pendingEffects.length <= 12);
    assert.ok(state.lifeDepth.resolvedEffects.length <= 32);
    assert.ok(state.lifeDepth.goals.length <= 6);
    const dossier = buildLifeDossier(state);
    outcomes.add(dossier.outcome);
    for (const id of state.events.seen) if (String(id).startsWith("lc_")) seenContent.add(id);
    LIFE_ARC_IDS.forEach((id) => assert.ok(state.lifeDepth.arcs[id], id));
  }
  assert.ok(outcomes.size >= 3, JSON.stringify([...outcomes]));
  assert.ok(seenContent.size >= 12, `content diversity ${seenContent.size}`);
  assert.ok(Math.max(...sizes) < 300_000, `save ${Math.max(...sizes)}`);
});
