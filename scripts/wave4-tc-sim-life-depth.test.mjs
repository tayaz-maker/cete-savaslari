import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState, SAVE_VERSION } from "../public/games/tc-sim/js/state.js";
import { migrateState } from "../public/games/tc-sim/js/save.js";
import { advanceWeek, applyDecision, canApplyDecision, getAvailableDecisions } from "../public/games/tc-sim/js/time.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import {
  LIFE_ARC_IDS,
  LIFE_DEPTH_EVENTS,
  applyLifeDepthResolution,
  buildLifeDossier,
  economyCausality,
  processLifeDepthWeek,
  recordLifeDecision,
  refreshLifeArcs,
  validateLifeDepthState,
} from "../public/games/tc-sim/js/life-depth.js";

const copy = (value) => JSON.parse(JSON.stringify(value));
function settle(state, prefer = null) {
  let guard = 0;
  while (state.events.active && guard++ < 40) {
    const event = getEventDefinition(state.events.active.eventId);
    const choice = event.choices.find((x) => x.id === prefer) || event.choices[0];
    assert.equal(resolveEvent(state, choice.id).ok, true, event.id);
  }
  assert.ok(guard < 40, "event queue soft-lock");
}

test("Wave 4 creates ten bounded arcs and migrates v5 idempotently", () => {
  const state = createNewGame({ seed: 44 });
  assert.equal(SAVE_VERSION, 6);
  assert.deepEqual(Object.keys(state.lifeDepth.arcs), LIFE_ARC_IDS);
  assert.equal(validateLifeDepthState(state), true);
  const old = copy(state); old.meta.saveVersion = 5; delete old.lifeDepth;
  const migrated = migrateState(old);
  assert.equal(migrated.ok, true);
  assert.equal(migrated.state.meta.saveVersion, 6);
  const once = JSON.stringify(migrated.state);
  assert.equal(JSON.stringify(migrateState(copy(migrated.state)).state), once);
  assert.equal(validateState(migrated.state).ok, true);
});

test("economy causality connects housing, family, debt and time pressure", () => {
  const state = createNewGame({ seed: 2 });
  const family = economyCausality(state);
  state.household.homeId = "studio";
  const studio = economyCausality(state);
  assert.notEqual(studio.commute, family.commute);
  state.parenthood.children.push({ id: "fixture-child", alive: true });
  state.openCases.push({ id: "fixture-debt", type: "personal-debt", status: "pending", dueWeek: 20, payload: { amount: 9000 } });
  const loaded = economyCausality(state);
  assert.ok(loaded.familyLoad > studio.familyLoad);
  assert.ok(loaded.liquidityPressure > studio.liquidityPressure);
  assert.ok(loaded.timePressure > studio.timePressure);
});

test("decisions create cross-arc memory, goals and delayed consequences once", () => {
  const state = createNewGame({ seed: 3 });
  for (let week = 0; week < 3; week += 1) {
    settle(state);
    assert.equal(applyDecision(state, "overtime").ok, true);
    settle(state);
    assert.equal(advanceWeek(state).ok, true);
  }
  assert.equal(state.lifeDepth.pendingEffects.filter((x) => x.eventId === "life_depth_overwork_echo").length, 1);
  const effectId = state.lifeDepth.pendingEffects[0].id;
  const dueWeek = state.lifeDepth.pendingEffects[0].dueWeek;
  while (state.time.absoluteWeek < dueWeek) { settle(state); advanceWeek(state); }
  settle(state, "slow-down");
  assert.equal(state.lifeDepth.resolvedEffects.filter((x) => x === effectId).length, 1);
  const before = state.lifeDepth.resolvedEffects.length;
  processLifeDepthWeek(state); processLifeDepthWeek(state);
  assert.equal(state.lifeDepth.resolvedEffects.length, before);
  assert.ok(state.lifeDepth.arcs.career.memory.length);
  assert.ok(state.lifeDepth.decisionHistory.length >= 3);
});

test("friend memory unlocks a delayed career opportunity and survives missing actor", () => {
  const state = createNewGame({ seed: 5 });
  recordLifeDecision(state, "help-friend");
  const pending = state.lifeDepth.pendingEffects.find((x) => x.eventId === "life_depth_friend_return");
  assert.ok(pending);
  state.time.absoluteWeek = pending.dueWeek;
  assert.deepEqual(processLifeDepthWeek(state), ["life_depth_friend_return"]);
  const definition = LIFE_DEPTH_EVENTS.find((x) => x.id === "life_depth_friend_return");
  const oldPerformance = state.career.performance;
  assert.equal(applyLifeDepthResolution(state, definition, "use-referral"), true);
  assert.ok(state.career.performance > oldPerformance);
  assert.ok(state.people.find((x) => x.id === "mehmet").memories.some((x) => x.type === "life_arc"));
  state.people = state.people.filter((x) => x.id !== "burak");
  assert.doesNotThrow(() => applyLifeDepthResolution(state, LIFE_DEPTH_EVENTS.find((x) => x.id === "life_depth_education_leverage"), "wait"));
});

test("all arc hooks and four delayed event chains are mechanically reachable", () => {
  const state = createNewGame({ seed: 8 });
  state.player.age = 38; state.career.performance = 78; state.career.weeksInRole = 120;
  state.education.level = "lisans"; state.household.homeId = "shared";
  state.finances.balance = 30000; state.health = { energy: 82, stress: 18, health: 86 };
  for (const key of Object.keys(state.relationships)) state.relationships[key] = 75;
  const depth = refreshLifeArcs(state);
  for (const id of LIFE_ARC_IDS) assert.ok(depth.arcs[id], id);
  for (const event of LIFE_DEPTH_EVENTS) {
    assert.equal(event.condition(state), false, `${event.id} must be queue-only`);
    assert.ok(event.choices.length >= 2);
    assert.ok(event.choices.every((x) => x.risk), event.id);
  }
  state.education.level = "lise"; state.education.active = { pathId: "fixture", progress: 35 };
  refreshLifeArcs(state);
  assert.ok(state.lifeDepth.goals.some((x) => x.id === "complete-education"));
});

test("deterministic Life Dossier reflects multiple systems and stays bounded", () => {
  const state = createNewGame({ seed: 9 });
  state.career.performance = 82; state.career.weeksInRole = 140;
  state.education.level = "lisans"; state.finances.balance = 26000;
  state.household.homeId = "shared"; state.player.age = 54;
  for (const id of ["overtime", "rest", "family", "friend", "budget-check"]) recordLifeDecision(state, id);
  const first = buildLifeDossier(state), second = buildLifeDossier(state);
  assert.deepEqual(second, first);
  assert.ok(first.outcome);
  assert.ok(first.actorOutcomes.length >= 4);
  assert.ok(first.traces.length <= 10);
  assert.ok(first.achievements.every((id) => LIFE_ARC_IDS.includes(id)));
});

test("20 strategy lives stay finite, diverse and bounded", { timeout: 120_000 }, () => {
  const strategies = ["career", "family", "money", "low-risk", "high-risk", "relationship", "education", "balanced", "random", "adaptive"];
  const outcomes = new Set(), stages = new Set(), sizes = [], echoCounts = [];
  for (let run = 0; run < 20; run += 1) {
    const strategy = strategies[run % strategies.length];
    const state = createNewGame({ seed: 1000 + run, profile: strategy === "career" ? "ambitious" : strategy === "relationship" ? "social" : "balanced" });
    for (let step = 0; step < 720 && !state.lifetime?.death; step += 1) {
      settle(state, strategy === "high-risk" ? "push-through" : strategy === "relationship" ? "repair" : null);
      const preferred = {
        career: ["overtime", "rest"], family: ["family", "rest"], money: ["overtime", "budget-check"],
        "low-risk": ["rest", "exercise"], "high-risk": ["overtime", "friend"], relationship: ["friend", "family"],
        education: ["rest", "budget-check"], balanced: ["rest", "family"], random: ["exercise", "friend"], adaptive: [state.health.stress > 60 ? "rest" : "overtime", "family"],
      }[strategy];
      for (const id of preferred) {
        settle(state);
        if (canApplyDecision(state, id).ok) applyDecision(state, id);
        settle(state);
      }
      settle(state);
      const result = advanceWeek(state);
      assert.equal(result.ok, true);
      assert.equal(validateState(state).ok, true);
    }
    const dossier = buildLifeDossier(state);
    outcomes.add(dossier.outcome);
    LIFE_ARC_IDS.forEach((id) => stages.add(`${id}:${state.lifeDepth.arcs[id].stage}`));
    const encoded = JSON.stringify(state); sizes.push(Buffer.byteLength(encoded)); echoCounts.push(state.lifeDepth.echoes.length);
    assert.equal(encoded.includes("NaN"), false);
    assert.ok(state.lifeDepth.arcHistory.length <= 80);
    assert.ok(state.lifeDepth.decisionHistory.length <= 80);
    assert.ok(state.lifeDepth.pendingEffects.length <= 12);
    assert.ok(state.lifeDepth.resolvedEffects.length <= 32);
    assert.ok(state.lifeDepth.goals.length <= 6);
  }
  assert.ok(outcomes.size >= 3, JSON.stringify([...outcomes]));
  assert.ok(stages.size >= 15, `arc-stage diversity ${stages.size}`);
  assert.ok(Math.max(...sizes) < 300_000, `save ${Math.max(...sizes)}`);
  assert.ok(Math.max(...echoCounts) > 0);
  assert.equal(getAvailableDecisions(createNewGame()).length > 0, true);
});

// ---------------------------------------------------------------------------
// Wave 4 adversarial review regressions
// ---------------------------------------------------------------------------
import { HOMES, getEffectiveCommuteLoad } from "../public/games/tc-sim/js/life.js";
import { ensureLifeDepthState, applyLifeDepthResolution as resolveDepth } from "../public/games/tc-sim/js/life-depth.js";

test("derived commute is the game's own zone model, so housing stays a real trade-off", () => {
  // It used to be guessed from the home id ("center"/"central" matched nothing,
  // so shared and studio scored identically and family scored worst whatever
  // the job was) which made the pricier flat strictly dominated.
  for (const home of HOMES) {
    for (const jobId of ["market", "office", "developer", "taxi", "teacher", "factory"]) {
      const state = createNewGame({ seed: 5 });
      state.household.homeId = home.id;
      state.career.jobId = jobId;
      assert.equal(economyCausality(state).commute, getEffectiveCommuteLoad(state), `${home.id}/${jobId}`);
    }
  }
  // every home must be the commute-optimal choice for some job zone
  const best = new Set();
  for (const jobId of ["market", "office", "taxi"]) {
    const rows = HOMES.map((home) => {
      const state = createNewGame({ seed: 5 });
      state.household.homeId = home.id;
      state.career.jobId = jobId;
      return { home: home.id, time: economyCausality(state).timePressure };
    });
    const min = Math.min(...rows.map((r) => r.time));
    for (const row of rows) if (row.time === min) best.add(row.home);
  }
  assert.equal(best.size, HOMES.length, `only ${[...best].join(",")} are ever commute-optimal`);
  // a car still reduces the load, matching getEffectiveCommuteLoad
  const driver = createNewGame({ seed: 5 });
  driver.household.homeId = "studio";
  driver.career.jobId = "office";
  const onFoot = economyCausality(driver).commute;
  driver.wealth = { ...(driver.wealth || {}), vehicle: { id: "car", currentValue: 100000 } };
  assert.equal(economyCausality(driver).commute, Math.max(0, onFoot - 1));
});

test("the education payoff stays once per life even after the effect ledger rolls over", () => {
  const state = createNewGame({ seed: 5 });
  state.education.level = "lisans";
  state.career.jobId = "office";
  let fires = 0;
  for (let week = 0; week < 240; week += 1) {
    state.career.performance = 70;
    // a long life resolves far more than the 32 entries resolvedEffects keeps,
    // which used to evict the marker and reopen the gate
    const depth = ensureLifeDepthState(state);
    if (week % 3 === 0) depth.resolvedEffects.push(`overwork-echo:${state.time.absoluteWeek}`);
    const before = new Set(ensureLifeDepthState(state).resolvedEffects.filter((x) => x.startsWith("education-leverage")));
    for (const eventId of processLifeDepthWeek(state)) {
      if (eventId !== "life_depth_education_leverage") continue;
      resolveDepth(state, LIFE_DEPTH_EVENTS.find((x) => x.id === eventId), "specialize");
    }
    for (const id of ensureLifeDepthState(state).resolvedEffects)
      if (id.startsWith("education-leverage") && !before.has(id)) fires += 1;
    state.time.absoluteWeek += 1;
  }
  assert.equal(fires, 1, `education leverage resolved ${fires} times`);
  assert.equal(state.flags.lifeDepthEducationLeverage, true);
  // a save written before the marker existed must still be closed on load
  const legacy = createNewGame({ seed: 5 });
  ensureLifeDepthState(legacy).resolvedEffects.push("education-leverage:12");
  delete legacy.flags.lifeDepthEducationLeverage;
  ensureLifeDepthState(legacy);
  assert.equal(legacy.flags.lifeDepthEducationLeverage, true);
});

test("resolving one chain twice in a week does not stack duplicate actor memories", () => {
  const state = createNewGame({ seed: 9 });
  const definition = LIFE_DEPTH_EVENTS.find((x) => x.id === "life_depth_friend_return");
  for (let i = 0; i < 25; i += 1) resolveDepth(state, definition, "use-referral");
  const mehmet = state.people.find((x) => x.id === "mehmet");
  const tagged = mehmet.memories.filter((x) => String(x.id).startsWith("wave4:"));
  assert.equal(tagged.length, 1, `${tagged.length} entries for one week`);
  // separate weeks still record separately
  for (let week = 2; week <= 5; week += 1) {
    state.time.absoluteWeek = week;
    resolveDepth(state, definition, "use-referral");
  }
  const later = mehmet.memories.filter((x) => String(x.id).startsWith("wave4:"));
  assert.equal(later.length, 5);
  assert.equal(new Set(later.map((x) => x.id)).size, later.length);
  assert.ok(mehmet.memories.length <= 50);
});
