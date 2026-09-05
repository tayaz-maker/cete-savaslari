import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, setYearlyPriorities, validateState } from "../public/games/tc-sim/js/state.js";
import { HEALTH_CHAIN_REGISTRY, acknowledgeBodyWarning, getBodyCareContext, manageBodyCondition, processLongTermBody, recordBodyExposure, getBodyRiskSummary, scheduleHealthChain, reassessBodyCondition, getKnownBodyConditions, getBodyYearSummary, ensureBodyState } from "../public/games/tc-sim/js/body-systems.js";
import { getBodyEventContext } from "../public/games/tc-sim/js/body-events.js";
import { getEventDefinition, activateNextEvent } from "../public/games/tc-sim/js/events.js";
import { applyDecision, advanceWeek, canApplyDecision } from "../public/games/tc-sim/js/time.js";
import { enrollEducation, quitJob, applyWeeklyLifeLoad, updateCareerProgress } from "../public/games/tc-sim/js/life.js";
import { getKnownOpenCases, getPlayerVisibleOpenCases } from "../public/games/tc-sim/js/calendar.js";
import { isSecretKnownTo, transferSecret } from "../public/games/tc-sim/js/depth2-systems.js";
import { getRelationship } from "../public/games/tc-sim/js/social.js";
import { saveGame, loadGame, migrateState } from "../public/games/tc-sim/js/save.js";
import { playBodyWeek, settleBodyEvents, runBodyMatrix } from "./tc-sim-longrun.mjs";

const fresh = () => createNewGame({ now: "2027-01-01T00:00:00.000Z" });
const activeCondition = (status = "active") => ({ id: "persistent-fatigue", status, knownToPlayer: true, createdWeek: 1, lastUpdateWeek: 1, severity: "moderate" });
function roundTrip(state) {
  const entries = new Map();
  const storage = { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  assert.equal(saveGame(storage, state).ok, true);
  const result = loadGame(storage);
  assert.equal(result.ok, true);
  return result.state;
}

for (const [chainKey, strategy, weeks, conditionId] of [
  ["CHN_H01", "overworker", 120, "persistent-fatigue"],
  ["CHN_H02", "low-recovery", 180, "recovery-strain"],
  ["CHN_H03", "inactive", 120, "physical-sluggishness"],
]) {
  test(`${HEALTH_CHAIN_REGISTRY[chainKey].id} real weekly pattern reaches warning, delayed outcome and cleanup`, () => {
    const state = fresh();
    const chain = HEALTH_CHAIN_REGISTRY[chainKey];
    let warnings = 0, outcomes = 0, consequence = false, overtime = 0;
    const observe = (target, definition, _choice, phase) => {
      if (definition.chainId !== chain.id) return;
      if (phase === "before") {
        const source = target.openCases.find((item) => item.id === target.events.active.sourceCaseId);
        assert.ok(source, "actual scheduler, not manually injected event");
        assert.ok(target.time.absoluteWeek >= source.dueWeek);
        if (definition.id === chain.warning) {
          const key = chainKey === "CHN_H01" ? "overwork" : chainKey === "CHN_H02" ? "underRecovery" : "inactivity";
          assert.ok(target.body.exposures[key] >= (chainKey === "CHN_H03" ? 60 : 45));
        }
        if (definition.id === chain.followup) {
          assert.equal(source.dueWeek - source.createdWeek, 4);
          outcomes += 1;
        }
      } else if (definition.id === chain.warning) {
        warnings += 1;
        assert.equal(target.body.warningAcknowledged, true);
        const cases = target.openCases.filter((item) => item.chainId === chain.id && item.status !== "resolved");
        assert.equal(cases.length, 1);
        assert.equal(cases[0].eventId, chain.followup);
        assert.equal(scheduleHealthChain(target, chain.id, chain.warning), false);
      } else {
        assert.equal(target.openCases.filter((item) => item.chainId === chain.id && item.status !== "resolved").length, 0);
        consequence ||= target.body.conditions.some((item) => item.id === conditionId && item.status === "active");
      }
    };
    for (let week = 0; week < weeks; week += 1) overtime += playBodyWeek(state, strategy, observe).filter((id) => id === "overtime").length;
    assert.ok(warnings > 0 && outcomes > 0 && consequence);
    if (chainKey === "CHN_H01") assert.ok(overtime > 10);
    if (chainKey === "CHN_H02") {
      assert.equal(overtime, 0);
      assert.equal(state.body.exposures.overwork, 0);
      assert.equal(state.events.history.some((item) => item.eventId === "health_overload_review"), false);
    }
    assert.ok(state.openCases.filter((item) => item.type === "health-followup").length <= 8);
  });
}

test("planned H03 improvement averts a condition and active chain survives save/load", () => {
  let state = fresh();
  for (let week = 0; week < 59; week += 1) playBodyWeek(state, "inactive");
  // The real sixtieth idle week crosses the warning; choose the planned path.
  assert.equal(advanceWeek(state).ok, true);
  settleBodyEvents(state, "balanced");
  const chain = state.openCases.find((item) => item.chainId === "CHN-H03" && item.status === "pending");
  assert.equal(chain.eventId, "health_inactivity_outcome");
  assert.equal(chain.payload.playerKnown, true);
  const before = structuredClone(chain);
  const uninterrupted = structuredClone(state);
  state = roundTrip(state);
  assert.deepEqual(state.openCases.find((item) => item.id === before.id), before);
  for (let week = 0; week < 5; week += 1) {
    playBodyWeek(state, "balanced");
    playBodyWeek(uninterrupted, "balanced");
  }
  assert.deepEqual(state.body, uninterrupted.body);
  assert.deepEqual(state.openCases, uninterrupted.openCases);
  assert.deepEqual(state.events.history, uninterrupted.events.history);
  assert.ok(state.events.history.some((item) => item.eventId === "health_inactivity_outcome"));
  assert.equal(state.body.conditions.some((item) => item.id === "physical-sluggishness"), false);
  assert.equal(state.openCases.some((item) => item.id === before.id), false);
});

test("H04 Anne disclosure has scoped canonical knowledge, family response, memory and callback", () => {
  const responses = [];
  for (const family of ["supportive", "strained"]) {
    const state = fresh();
    state.player.background.family = family;
    state.body.conditions = [activeCondition()];
    const before = getRelationship(state, "anne").trust;
    let disclosed = false;
    activateNextEvent(state);
    settleBodyEvents(state, "balanced", (target, definition, _choice, phase) => {
      if (definition.id !== "health_support_disclosure" || phase !== "after") return;
      disclosed = true;
      assert.equal(isSecretKnownTo(target, "body-support", "anne"), true);
      assert.equal(isSecretKnownTo(target, "body-support", "mehmet"), false);
      assert.equal(target.body.conditions[0].status, "active", "disclosure is not medical care");
      assert.ok(target.people.find((p) => p.id === "anne").memories.some((item) => item.type === "health_support"));
    });
    assert.equal(disclosed, true);
    responses.push(getRelationship(state, "anne").trust - before);
    const followup = state.openCases.find((item) => item.chainId === "CHN-H04" && item.status === "pending");
    assert.ok(followup);
    for (let week = 0; week < 4; week += 1) playBodyWeek(state, "balanced");
    assert.equal(state.openCases.some((item) => item.id === followup.id), false);
    assert.ok(state.events.history.some((item) => item.eventId === "health_support_callback"));
    assert.ok(state.people.find((p) => p.id === "anne").memories.some((item) => item.type === "health_callback"));
    assert.equal(isSecretKnownTo(state, "body-support", "mehmet"), false);
    assert.equal(transferSecret(state, "body-support", "mehmet", "anne"), true);
    assert.equal(isSecretKnownTo(state, "body-support", "mehmet"), true);
    assert.equal(isSecretKnownTo(state, "body-support", "baba"), false);
  }
  assert.equal(responses[0] - responses[1], 2);
});

test("H04 concealment cannot authorize Anne's reaction or write her a health memory", () => {
  const state = fresh();
  state.body.conditions = [activeCondition("chronic")];
  activateNextEvent(state);
  settleBodyEvents(state, "overworker");
  assert.equal(isSecretKnownTo(state, "body-support", "anne"), false);
  for (let week = 0; week < 4; week += 1) playBodyWeek(state, "overworker");
  assert.equal(state.people.find((p) => p.id === "anne").memories.some((item) => item.type?.startsWith("health_")), false);
  assert.ok(state.events.history.some((item) => item.eventId === "health_support_callback"));
  assert.equal(state.openCases.some((item) => item.chainId === "CHN-H04" && item.status !== "resolved"), false);
});

test("career capacity has two effects without reputation judgment and care restores availability", () => {
  const healthy = fresh(), fatigued = fresh();
  fatigued.body.conditions = [activeCondition("chronic")];
  const reputation = structuredClone(fatigued.reputation);
  assert.equal(canApplyDecision(healthy, "overtime").ok, true);
  assert.equal(canApplyDecision(fatigued, "overtime").ok, false);
  updateCareerProgress(healthy);
  updateCareerProgress(fatigued);
  assert.equal(healthy.career.performance - fatigued.career.performance, 1);
  assert.deepEqual(fatigued.reputation, reputation);
  const exposure = structuredClone(fatigued.body.exposures);
  assert.equal(applyDecision(fatigued, "body-care").ok, true);
  assert.equal(fatigued.body.conditions[0].status, "managed");
  assert.deepEqual(fatigued.body.exposures, exposure);
  settleBodyEvents(fatigued);
  assert.equal(canApplyDecision(fatigued, "overtime").ok, true);
});

test("full-time education contributes to underRecovery without any overtime", () => {
  const student = fresh(), control = fresh();
  quitJob(student); quitJob(control);
  assert.equal(enrollEducation(student, "university", "full").ok, true);
  student.health.energy = control.health.energy = 42;
  // Same insufficient reserve: only the real education load crosses into poor recovery.
  applyWeeklyLifeLoad(student); applyWeeklyLifeLoad(control);
  processLongTermBody(student, { decisionIds: [] }); processLongTermBody(control, { decisionIds: [] });
  assert.equal(student.body.exposures.underRecovery, 1);
  assert.equal(control.body.exposures.underRecovery, 0);
  assert.equal(student.body.exposures.overwork, 0);
  assert.equal(student.flags.overtimeLastWeek, undefined);
});

test("existing discipline changes the rendered warning context without curing or forcing choices", () => {
  const low = fresh(), high = fresh();
  low.player.tendencies.discipline = 30;
  high.player.tendencies.discipline = 80;
  const definition = getEventDefinition("health_recovery_review");
  const before = structuredClone(high.body);
  assert.notEqual(getBodyEventContext(low, definition), getBodyEventContext(high, definition));
  assert.match(getBodyEventContext(high, definition), /Planlı/);
  assert.deepEqual(high.body, before);
  assert.deepEqual(definition.choices.map((item) => item.id), ["care", "ignore"]);
});

test("Year File summarizes all known outcomes, compares health priority and hides latent risks", () => {
  for (const status of ["active", "managed", "resolved", "chronic"]) {
    const state = fresh();
    setYearlyPriorities(state, ["health"]);
    state.body.conditions = [activeCondition(status), { id: "hidden-condition", status: "active", knownToPlayer: false }];
    state.body.exposures = { overwork: 38, underRecovery: 37, inactivity: 36 };
    state.time = { absoluteWeek: 48, weekOfMonth: 4, month: 12, year: 2027 };
    const startingHealth = state.meta.yearStartHealth.health;
    assert.equal(advanceWeek(state).ok, true);
    const year = state.yearlyHistory.at(-1);
    assert.equal(year.health.start.health, startingHealth);
    assert.equal(year.health.end.health, state.health.health);
    assert.equal(year.health.conditions.length, 1);
    assert.equal(year.health.conditions[0].name, "Uzun süren yorgunluk");
    assert.equal(year.health.conditions[0].status, status);
    assert.ok(year.health.conditions[0].outcome);
    assert.doesNotMatch(JSON.stringify(year.health), /overwork|underRecovery|inactivity|persistent-fatigue|hidden-condition|CHN-H/);
    assert.match(year.priorityReflection[0], ["active", "chronic"].includes(status) ? /gerisinde/ : /uyumlu/);
  }
  const state = fresh();
  const before = structuredClone(state.health);
  setYearlyPriorities(state, ["health"]);
  assert.deepEqual(state.health, before);
  const summary = getBodyYearSummary(state);
  delete state.meta.yearStartHealth;
  assert.equal(getBodyYearSummary(state).start, null, "old save must not invent year-start health");
  assert.equal(summary.conditions.length, 0);
});

test("BEDEN data and calendar distinguish known conditions and planned followups from hidden state", () => {
  const state = fresh();
  state.body.conditions = [activeCondition("managed"), { id: "hidden-condition", status: "active", knownToPlayer: false }];
  state.body.exposures = { overwork: 91, underRecovery: 87, inactivity: 83 };
  const visible = JSON.stringify(getKnownBodyConditions(state)) + getBodyRiskSummary(state);
  assert.match(visible, /Uzun süren yorgunluk/);
  assert.match(visible, /yönetiliyor/);
  assert.doesNotMatch(visible, /91|87|83|persistent-fatigue|hidden-condition|CHN-H|overwork/);
  scheduleHealthChain(state, "CHN-H01", "health_overload_outcome", 4, { playerKnown: true });
  scheduleHealthChain(state, "CHN-H02", "health_recovery_outcome", 4);
  assert.deepEqual(getKnownOpenCases(state).map((item) => item.chainId), ["CHN-H01"]);
  assert.deepEqual(getPlayerVisibleOpenCases(state).map((item) => item.chainId), ["CHN-H01"]);
});

test("health expiry preserves unrelated cases and old anonymous health flow resolves after load", () => {
  let state = fresh();
  const unrelated = Array.from({ length: 40 }, (_, i) => ({ id: `other-${i}`, type: "social-followup", status: "resolved", dueWeek: 1 }));
  state.openCases.push(...unrelated);
  state.openCases.push({ id: "legacy-health", type: "health-followup", chainId: "CHN-H01", eventId: "health_overload_review", dueWeek: 2, status: "pending" });
  state = roundTrip(state);
  assert.equal(advanceWeek(state).ok, true);
  settleBodyEvents(state, "balanced");
  assert.ok(state.openCases.some((item) => item.chainId === "CHN-H01" && item.eventId === "health_overload_outcome" && item.status === "pending"));
  for (let week = 0; week < 5; week += 1) playBodyWeek(state, "balanced");
  assert.ok(unrelated.every((entry) => state.openCases.some((item) => item.id === entry.id)));
  assert.equal(state.openCases.some((item) => item.id === "legacy-health"), false);
  scheduleHealthChain(state, "CHN-H02", "health_recovery_outcome", 1);
  state.time.absoluteWeek += 10;
  processLongTermBody(state);
  assert.equal(state.openCases.some((item) => item.chainId === "CHN-H02"), false);
});

test("management requires gradual improvement and survives ongoing simulation after save", () => {
  let state = fresh();
  state.body.conditions = [activeCondition("chronic")];
  state.body.exposures = { overwork: 60, underRecovery: 60, inactivity: 0 };
  state = roundTrip(state);
  assert.equal(state.body.conditions[0].status, "chronic");
  assert.equal(applyDecision(state, "body-care").ok, true);
  assert.equal(state.weekly.used, 1);
  assert.equal(state.finances.ledger.at(-1).reason, "Beden bakımı");
  const body = structuredClone(state.body);
  state = roundTrip(state);
  assert.deepEqual(state.body.conditions, body.conditions);
  playBodyWeek(state, "health-first");
  assert.ok(state.body.exposures.overwork > 0 && state.body.exposures.underRecovery > 0);
  assert.equal(state.body.conditions[0].status, "managed");
  for (let week = 0; week < 60; week += 1) playBodyWeek(state, "health-first");
  assert.equal(state.body.conditions[0].status, "resolved");
  assert.equal(state.body.conditions.length, 1);
});

test("body normalization is bounded, idempotent and rejects duplicate or invalid conditions", () => {
  const state = fresh();
  state.body.conditions = Array.from({ length: 12 }, (_, i) => ({ ...activeCondition(), id: `condition-${i}` }));
  state.body.conditions.push({ ...activeCondition(), id: "condition-11" }, { id: "bad", status: "unknown" });
  state.body.exposures = { overwork: 900, underRecovery: -10, inactivity: NaN };
  ensureBodyState(state);
  assert.equal(state.body.conditions.length, 8);
  assert.deepEqual(state.body.exposures, { overwork: 100, underRecovery: 0, inactivity: 0 });
  const normalized = structuredClone(state.body);
  ensureBodyState(state);
  assert.deepEqual(state.body, normalized);
  assert.equal(validateState(state).ok, true);
  const legacy = fresh();
  legacy.body.conditions = [activeCondition("resolved"), activeCondition("chronic")];
  const loaded = migrateState(legacy);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.state.body.conditions.length, 1);
  assert.equal(loaded.state.body.conditions[0].status, "chronic", "last legacy outcome must survive duplicate cleanup");
});

test("whole-week inputs preserve overtime exposure and cannot reuse last week's rest", () => {
  const state = fresh();
  for (let week = 0; week < 10; week += 1) {
    settleBodyEvents(state);
    assert.equal(applyDecision(state, "overtime").ok, true);
    settleBodyEvents(state);
    assert.equal(applyDecision(state, "rest").ok, true);
    settleBodyEvents(state);
    assert.equal(advanceWeek(state).ok, true);
  }
  assert.equal(state.body.exposures.overwork, 30, "rest chosen second does not erase overtime");
  const before = state.body.exposures.overwork;
  playBodyWeek(state, "balanced");
  assert.equal(state.flags.overtimeStreak, 0);
  assert.equal(state.body.exposures.overwork, before - 1);
  // Isolate the stale-decision regression: last week was rest, this week was empty.
  state.flags.lastDecisionId = "rest";
  state.health.energy = 20;
  state.body.exposures.underRecovery = 20;
  settleBodyEvents(state);
  assert.equal(advanceWeek(state).ok, true);
  assert.equal(state.body.exposures.underRecovery, 21);
});

test("combined fatigue boundaries require both sources; pre-warning state cannot penalize career", () => {
  for (const [overwork, underRecovery, expected] of [[100, 0, false], [0, 100, false], [69, 55, false], [70, 54, false], [70, 55, true]]) {
    const state = fresh();
    state.body.exposures = { overwork, underRecovery, inactivity: 0 };
    assert.equal(reassessBodyCondition(state, "CHN-H01"), false);
    assert.equal(canApplyDecision(state, "overtime").ok, true);
    acknowledgeBodyWarning(state);
    assert.equal(reassessBodyCondition(state, "CHN-H01"), expected);
    assert.equal(state.body.conditions.some((item) => item.status === "chronic"), false);
  }
});

test("pre-Body legacy save has neutral conditions and cannot fabricate a year's starting health", () => {
  const old = fresh();
  old.meta.saveVersion = 1;
  delete old.meta.yearStartHealth;
  delete old.body;
  const result = migrateState(old);
  assert.equal(result.ok, true);
  assert.deepEqual(result.state.body.exposures, { overwork: 0, underRecovery: 0, inactivity: 0 });
  assert.deepEqual(result.state.body.conditions, []);
  assert.equal(getBodyYearSummary(result.state).start, null);
  assert.equal(result.state.yearlyHistory.length, 0);
});

test("automated 52/156/520 Body strategy matrix is deterministic, distinct and bounded", () => {
  const matrix = runBodyMatrix();
  assert.deepEqual(runBodyMatrix(), matrix);
  for (const week of [52, 156, 520]) {
    assert.ok(matrix.overworker.checkpoints[week].overwork > matrix.balanced.checkpoints[week].overwork);
    assert.ok(matrix["low-recovery"].checkpoints[week].underRecovery > matrix["health-first"].checkpoints[week].underRecovery);
    assert.equal(matrix.balanced.checkpoints[week].chronic, 0);
  }
  assert.equal(matrix["low-recovery"].decisions.overtime, undefined);
  assert.ok(matrix["health-first"].decisions.rest >= 500, "recovery consumes real activity slots");
  for (const result of Object.values(matrix)) {
    assert.ok(result.maximums.conditions <= 8);
    assert.ok(result.maximums.healthOpenCases <= 4);
    assert.equal(result.yearHealthSummaries, 10);
    for (const key of ["overwork", "underRecovery", "inactivity"]) assert.ok(result.maximums[key] <= 100);
  }
});

test("long-term body exposures are bounded and produce a recoverable warning", () => {
  const state = createNewGame();
  for (let i = 0; i < 60; i += 1) recordBodyExposure(state, "overwork", 3);
  processLongTermBody(state, { decisionId: "overtime" });
  assert.equal(state.body.exposures.overwork, 100);
  assert.equal(state.body.warningAvailable, true);
  processLongTermBody(state, { decisionId: "rest" });
  for (let i = 0; i < 20; i += 1) processLongTermBody(state, { decisionId: "rest" });
  assert.equal(state.body.exposures.overwork < 100, true);
  assert.equal(typeof getBodyRiskSummary(state), "string");
});

test("old saves without body state normalize safely", async () => {
  const { loadGame } = await import("../public/games/tc-sim/js/save.js");
  const state = createNewGame();
  delete state.body;
  const storage = { getItem: () => JSON.stringify(state), setItem() {} };
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state.body.exposures, { overwork: 0, underRecovery: 0, inactivity: 0 });
});

test("warning precedes persistent condition and care manages it", () => {
  const state = createNewGame();
  state.health.energy = 80;
  for (let i = 0; i < 24; i += 1) { recordBodyExposure(state, "overwork", 3); recordBodyExposure(state, "underRecovery", 6); processLongTermBody(state, { decisionId: "overtime" }); }
  assert.equal(state.body.warningAvailable, true);
  assert.equal(state.body.conditions.some((condition) => condition.status === "active"), false);
  acknowledgeBodyWarning(state);
  assert.equal(reassessBodyCondition(state, "CHN-H01"), true);
  assert.equal(state.body.conditions.some((condition) => condition.status === "active"), true);
  assert.equal(manageBodyCondition(state), true);
  assert.equal(state.body.conditions.some((condition) => condition.status === "managed"), true);
});

test("four health chains are canonically registered", () => {
  assert.equal(Object.keys(HEALTH_CHAIN_REGISTRY).length, 4);
  assert.deepEqual(Object.values(HEALTH_CHAIN_REGISTRY).map((item) => item.id), ["CHN-H01", "CHN-H02", "CHN-H03", "CHN-H04"]);
});

test("chronic fatigue requires renewed load after management; time alone cannot cause it", () => {
  const state = createNewGame();
  acknowledgeBodyWarning(state);
  state.body.exposures = { overwork: 80, underRecovery: 70, inactivity: 0 };
  assert.equal(reassessBodyCondition(state, "CHN-H01"), true);
  assert.equal(manageBodyCondition(state), true);
  state.time.absoluteWeek += 100;
  processLongTermBody(state, { decisionIds: [] });
  assert.equal(state.body.conditions[0].status, "managed", "time without renewed exposure is not relapse");
  state.body.exposures = { overwork: 10, underRecovery: 10, inactivity: 0 };
  processLongTermBody(state, { decisionId: "rest" });
  state.body.exposures = { overwork: 85, underRecovery: 70, inactivity: 0 };
  for (let i = 0; i < 3; i += 1) {
    state.time.absoluteWeek += 1;
    processLongTermBody(state, { decisionId: "overtime" });
    assert.equal(state.body.conditions[0].status, "managed");
  }
  state.time.absoluteWeek += 1;
  processLongTermBody(state, { decisionId: "overtime" });
  assert.equal(state.body.conditions[0].status, "chronic");
  assert.equal(state.body.conditions.length, 1);
});

test("body care is a real weekly decision with readable cost", async () => {
  const { canApplyDecision, applyDecision } = await import("../public/games/tc-sim/js/time.js");
  const state = createNewGame();
  state.body.warningAvailable = true;
  const before = state.finances.balance;
  assert.equal(canApplyDecision(state, "body-care").ok, true);
  assert.equal(applyDecision(state, "body-care").ok, true);
  assert.equal(state.finances.balance, before - 300);
});

test("active fatigue blocks overtime while recovery remains available", async () => {
  const { canApplyDecision } = await import("../public/games/tc-sim/js/time.js");
  const state = createNewGame();
  state.body.conditions = [{ id: "persistent-fatigue", status: "active", knownToPlayer: true }];
  assert.equal(canApplyDecision(state, "overtime").ok, false);
  assert.equal(canApplyDecision(state, "rest").ok, true);
});

test("health chain scheduling is delayed and duplicate-safe", () => {
  const state = createNewGame();
  assert.equal(scheduleHealthChain(state, "CHN-H01", "health_overload_review", 4), true);
  assert.equal(scheduleHealthChain(state, "CHN-H01", "health_overload_review", 4), false);
  assert.equal(state.openCases[0].type, "health-followup");
  assert.equal(state.openCases[0].chainId, "CHN-H01");
});

test("discipline provides a contextual body-care read without changing stats", () => {
  const state = createNewGame();
  state.player.tendencies.discipline = 80;
  assert.match(getBodyCareContext(state), /Planlı/);
});

test("education-like low recovery can rise without overtime", () => {
  const state = createNewGame();
  state.health.energy = 20;
  for (let i = 0; i < 8; i += 1) processLongTermBody(state, { decisionId: "friend" });
  assert.equal(state.body.exposures.overwork, 0);
  assert.equal(state.body.exposures.underRecovery > 0, true);
});
