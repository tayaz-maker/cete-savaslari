import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState, addNpcMemory } from "../public/games/tc-sim/js/state.js";
import { migrateState } from "../public/games/tc-sim/js/save.js";
import { advanceWeek, applyDecision, canApplyDecision } from "../public/games/tc-sim/js/time.js";
import { getMonthlySummary } from "../public/games/tc-sim/js/life.js";
import { getEventChoiceAvailability, getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { buildLifeDossier, getLifePhase } from "../public/games/tc-sim/js/life-depth.js";
import { applySocialAction, canUseSocialAction } from "../public/games/tc-sim/js/social.js";
import {
  CHAINS,
  EXCLUSIVE_PAIRS,
  LIFE_CONTENT_EVENTS,
  applyLifeContentResolution,
  decorateLifeDossier,
  lifeContentBag,
  scheduleContent,
  takeDueLifeContent,
} from "../public/games/tc-sim/js/life-content.js";

const copy = (value) => JSON.parse(JSON.stringify(value));

function settle(state, strategy = "balanced", metrics = null) {
  let guard = 0;
  while (state.events.active && guard++ < 80) {
    const event = getEventDefinition(state.events.active.eventId);
    assert.ok(event, `missing ${state.events.active.eventId}`);
    const preferences = {
      relationship: ["try_self", "confirm", "discuss", "want", "wants", "plan", "shared", "coordinate", "commit", "interested", "talk", "repair", "block", "go", "accept"],
      family: ["try_self", "confirm", "discuss", "want", "wants", "plan", "shared", "coordinate", "commit", "go", "accept", "stay", "family", "take"],
      adaptive: ["try_self", "confirm", "discuss", "want", "wants", "plan", "shared", "coordinate", "commit", "interested", "talk", "repair", "go", "accept"],
      money: ["decline", "no", "minimum", "min", "budget"],
      "high-risk": ["take", "jump", "push", "go", "accept"],
      "low-risk": ["keep", "wait", "decline", "small", "rest"],
      social: ["go", "help", "talk", "accept"],
    }[strategy] || [];
    const familyReady = state.finances.balance >= getMonthlySummary(state).expenses * 3;
    const prudentDelay =
      ["relationship", "family", "adaptive"].includes(strategy) &&
      ((event.id === "family_intent_discussion" && !familyReady) ||
        (["parent_planning", "parent_planning_review"].includes(event.id) && state.household.union?.familyPlan?.response !== "wants" && !familyReady));
    const choice = (prudentDelay
      ? event.choices.find((row) => ["later", "wait"].includes(row.id) && getEventChoiceAvailability(state, row.id).ok)
      : null) || preferences
        .map((id) => event.choices.find((row) => row.id === id))
        .find((row) => row && getEventChoiceAvailability(state, row.id).ok) ||
        event.choices.find((row) => getEventChoiceAvailability(state, row.id).ok);
    assert.ok(choice, `no available choice ${event.id}`);
    const id = event.id;
    assert.equal(resolveEvent(state, choice.id).ok, true, `${id}:${choice.id}`);
    if (metrics) {
      metrics.occurrences += 1;
      if (id.startsWith("lc_")) {
        metrics.contentOccurrences += 1;
        metrics.contentPhases.add(getLifePhase(state));
      }
      else metrics.productionOccurrences += 1;
    }
  }
  assert.ok(guard < 80, "event queue soft-lock");
}

test("lifeContent waiting is sanitized, bounded and once-only across save boundaries", () => {
  const state = createNewGame({ seed: 4401 });
  state.time.absoluteWeek = 20;
  assert.equal(scheduleContent(state, { eventId: "lc_arrears_letter", key: "arrears", dueWeeks: 3 }), true);
  assert.equal(scheduleContent(state, { eventId: "lc_arrears_letter", key: "arrears", dueWeeks: 3 }), false);
  assert.equal(scheduleContent(state, { eventId: "not_real", key: "fake", dueWeeks: 1 }), false);
  const before = migrateState(copy(state));
  assert.equal(before.ok, true);
  assert.deepEqual(migrateState(copy(before.state)).state, before.state);
  before.state.flags.lifeContent.waiting.push(
    { id: "lc:arrears", eventId: "lc_arrears_letter", dueWeek: 1 },
    { id: "bad", eventId: "other_game", dueWeek: "NaN" },
    null,
  );
  const bag = lifeContentBag(before.state);
  assert.equal(bag.waiting.length, 1);
  before.state.time.absoluteWeek = bag.waiting[0].dueWeek;
  const onDue = migrateState(copy(before.state));
  assert.equal(onDue.ok, true);
  assert.equal(takeDueLifeContent(onDue.state), "lc_arrears_letter");
  assert.equal(takeDueLifeContent(onDue.state), null);
  const after = migrateState(copy(onDue.state));
  assert.equal(after.ok, true);
  assert.equal(takeDueLifeContent(after.state), null);
  assert.equal(scheduleContent(after.state, { eventId: "lc_arrears_letter", key: "arrears", dueWeeks: 1 }), false);

  const absent = createNewGame({ seed: 4402 });
  absent.time.absoluteWeek = 30;
  assert.equal(scheduleContent(absent, { eventId: "lc_move_help_echo", key: "actor", dueWeeks: 1, actorId: "mehmet" }), true);
  absent.people = absent.people.filter((row) => row.id !== "mehmet");
  absent.time.absoluteWeek += 1;
  assert.equal(takeDueLifeContent(absent), null);
  assert.equal(absent.flags.lifeContent.waiting.length, 0);
  assert.ok(absent.flags.lifeContent.once["resolved:lc:actor"]);

  const dead = createNewGame({ seed: 4403 });
  scheduleContent(dead, { eventId: "lc_arrears_letter", key: "death", dueWeeks: 1 });
  dead.time.absoluteWeek += 1;
  dead.lifetime = { ...(dead.lifetime || {}), death: { week: dead.time.absoluteWeek, reportId: "x" } };
  assert.equal(takeDueLifeContent(dead), null);
  assert.equal(dead.flags.lifeContent.waiting.length, 1);

  const overflow = createNewGame({ seed: 4404 });
  const callbackIds = LIFE_CONTENT_EVENTS.filter((row) => row.delayed).slice(0, 16).map((row) => row.id);
  callbackIds.forEach((eventId, index) => scheduleContent(overflow, { eventId, key: `cap-${index}`, dueWeeks: 2 + index }));
  assert.ok(lifeContentBag(overflow).waiting.length <= 12);
  assert.equal(validateState(overflow).ok, true);
});

test("exclusive state and memory follow-ups survive repeated migration", () => {
  const state = createNewGame({ seed: 4405 });
  const event = getEventDefinition("lc_metro_offer");
  applyLifeContentResolution(state, event, "take");
  addNpcMemory(state, "mehmet", "Doğal takip hafızası", "lc_helped_mehmet_money");
  const locked = state.flags.lifeContent.exclusive["commute-path"];
  let loaded = copy(state);
  for (let i = 0; i < 10; i += 1) {
    const result = migrateState(copy(loaded));
    assert.equal(result.ok, true);
    loaded = result.state;
  }
  assert.equal(loaded.flags.lifeContent.exclusive["commute-path"], locked);
  assert.equal(loaded.people.find((row) => row.id === "mehmet").memories.filter((row) => row.type === "lc_helped_mehmet_money").length, 1);
});

test("40 seeds x 16 strategies x 720 weeks closes natural content reachability", { timeout: 600_000 }, () => {
  const seedCount = Number(process.env.WAVE4_MATRIX_SEEDS) || 40;
  const strategies = [
    "career", "family", "money", "relationship", "education", "social", "debt-zero", "debt-heavy",
    "housing-min", "housing-quality", "overtime", "low-risk", "high-risk", "balanced", "adaptive", "random",
  ];
  const seen = new Set();
  const eligible = new Set();
  const started = new Set();
  const completed = new Set();
  const arcs = new Set();
  const phases = new Set();
  const exclusiveSeen = Object.fromEntries(Object.keys(EXCLUSIVE_PAIRS).map((id) => [id, new Set()]));
  const metrics = { occurrences: 0, contentOccurrences: 0, productionOccurrences: 0, contentPhases: new Set() };
  let maxWaiting = 0, maxOnce = 0, maxMemory = 0, maxSizeEarly = 0, maxSizeLate = 0;
  let partnerRuns = 0, cohabitingRuns = 0, marriedRuns = 0, plannedRuns = 0, childRuns = 0;
  const familyPlans = {};

  for (let seedIndex = 0; seedIndex < seedCount; seedIndex += 1) {
    for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex += 1) {
      const strategy = strategies[strategyIndex];
      const state = createNewGame({
        seed: 50000 + seedIndex * 100 + strategyIndex,
        profile: strategy === "career" || strategy === "overtime" ? "ambitious" : strategy === "relationship" || strategy === "social" ? "social" : "balanced",
        familyType: ["nuclear", "extended", "stem", "single"][seedIndex % 4],
      });
      if (strategy === "housing-quality") state.household.homeId = "studio";
      if (strategy === "housing-min") state.household.homeId = "family";
      if (strategy === "debt-heavy") state.finances.arrears = 9000;
      for (let week = 0; week < 720 && !state.lifetime?.death; week += 1) {
        settle(state, strategy, metrics);
        for (const row of LIFE_CONTENT_EVENTS) {
          if (row.organic && row.organicCheck?.(state)) eligible.add(row.id);
        }
        if (strategy === "relationship" || (strategy === "adaptive" && week >= 240)) {
          const action = ["advance_romance", "confide", "meet"].find((id) => canUseSocialAction(state, "elif", id).ok);
          if (action) applySocialAction(state, "elif", action);
        } else if (strategy === "social") {
          const action = ["confide", "meet"].find((id) => canUseSocialAction(state, "mehmet", id).ok);
          if (action) applySocialAction(state, "mehmet", action);
        } else if (strategy === "family") {
          const action = ["confide", "meet"].find((id) => canUseSocialAction(state, "anne", id).ok);
          if (action) applySocialAction(state, "anne", action);
        }
        const actions = {
          career: ["overtime", "rest"], family: ["family", "rest"], money: ["overtime", "budget-check"],
          relationship: ["overtime", "budget-check"], education: ["rest", "budget-check"], social: ["friend", "exercise"],
          "debt-zero": ["budget-check", "rest"], "debt-heavy": ["overtime", "budget-check"],
          "housing-min": ["family", "rest"], "housing-quality": ["overtime", "rest"], overtime: ["overtime", "rest"],
          "low-risk": ["rest", "exercise"], "high-risk": ["overtime", "friend"], balanced: ["rest", "family"],
          adaptive: [state.health.stress > 60 ? "rest" : "overtime", "family"], random: [week % 2 ? "friend" : "exercise", "rest"],
        }[strategy];
        for (const id of actions) {
          settle(state, strategy, metrics);
          if (canApplyDecision(state, id).ok) applyDecision(state, id);
        }
        settle(state, strategy, metrics);
        assert.equal(advanceWeek(state).ok, true);
        if (week === 359) maxSizeEarly = Math.max(maxSizeEarly, Buffer.byteLength(JSON.stringify(state)));
      }
      settle(state, strategy, metrics);
      for (const id of state.events.seen) if (String(id).startsWith("lc_")) seen.add(id);
      for (const chain of CHAINS) {
        if (state.events.seen.includes(chain.nodes[0].id)) started.add(chain.id);
        if (state.events.seen.includes(chain.nodes.at(-1).id)) completed.add(chain.id);
      }
      for (const [family] of Object.entries(EXCLUSIVE_PAIRS)) {
        const siblings = CHAINS.filter((chain) => chain.exclusive === family && state.events.seen.includes(chain.nodes[0].id));
        assert.ok(siblings.length <= 1, `${family} contradictory siblings: ${siblings.map((row) => row.branch).join(",")}`);
      }
      for (const eventId of state.events.seen) {
        const event = LIFE_CONTENT_EVENTS.find((row) => row.id === eventId);
        if (event?.arc) arcs.add(event.arc);
      }
      for (const [family, branch] of Object.entries(lifeContentBag(state).exclusive)) exclusiveSeen[family]?.add(branch);
      phases.add(state.lifeDepth.phase);
      maxWaiting = Math.max(maxWaiting, lifeContentBag(state).waiting.length);
      maxOnce = Math.max(maxOnce, Object.keys(lifeContentBag(state).once).length);
      maxMemory = Math.max(maxMemory, ...state.people.map((row) => row.memories.length));
      maxSizeLate = Math.max(maxSizeLate, Buffer.byteLength(JSON.stringify(state)));
      if (state.social.currentPartnerNpcId) partnerRuns += 1;
      if (state.household.union?.cohabitingSince) cohabitingRuns += 1;
      if (state.household.union?.marriedSince) marriedRuns += 1;
      if (state.household.union?.familyPlan) {
        plannedRuns += 1;
        const key = `${state.household.union.familyPlan.intent}:${state.household.union.familyPlan.response}`;
        familyPlans[key] = (familyPlans[key] || 0) + 1;
      }
      if (state.parenthood.children.length) childRuns += 1;
      assert.equal(validateState(state).ok, true);
    }
  }

  const siblingCoverage = Object.values(exclusiveSeen).filter((branches) => branches.size === 2).length;
  const summary = {
    authored: LIFE_CONTENT_EVENTS.length, eligible: eligible.size, seen: seen.size,
    chainStarts: started.size, chainCompletes: completed.size, arcs: [...arcs].sort(), phases: [...metrics.contentPhases].sort(),
    missingChains: CHAINS.filter((chain) => !started.has(chain.id)).map((chain) => chain.id),
    incompleteChains: CHAINS.filter((chain) => started.has(chain.id) && !completed.has(chain.id)).map((chain) => chain.id),
    exclusiveFamiliesBoth: siblingCoverage,
    missingExclusive: Object.entries(exclusiveSeen).filter(([, branches]) => branches.size !== 2).map(([family, branches]) => [family, [...branches]]),
    organicRatio: metrics.contentOccurrences / Math.max(1, metrics.occurrences),
    maxWaiting, maxOnce, maxMemory, maxSizeEarly, maxSizeLate, partnerRuns, cohabitingRuns, marriedRuns, plannedRuns, childRuns, familyPlans,
  };
  console.log(`WAVE4_FINAL_MATRIX ${JSON.stringify(summary)}`);
  assert.equal(arcs.size, 10, JSON.stringify(summary));
  assert.ok(seen.size >= 80, JSON.stringify(summary));
  assert.ok(started.size >= 40, JSON.stringify(summary));
  assert.ok(completed.size >= 36, JSON.stringify(summary));
  assert.equal(siblingCoverage, 12, JSON.stringify(summary));
  assert.ok(metrics.contentOccurrences / Math.max(1, metrics.occurrences) >= 0.05, JSON.stringify(summary));
  assert.ok(maxWaiting <= 12 && maxMemory <= 50, JSON.stringify(summary));
  assert.ok(maxSizeLate < 300_000, JSON.stringify(summary));
  assert.ok(maxSizeLate < maxSizeEarly * 1.35, JSON.stringify(summary));
});

test("dossier content stays unique, capped and reload deterministic", () => {
  const state = createNewGame({ seed: 4406 });
  const bag = lifeContentBag(state);
  for (const [family, branches] of Object.entries(EXCLUSIVE_PAIRS)) bag.exclusive[family] = branches[0];
  state.finances.arrears = 4000;
  addNpcMemory(state, "anne", "Bayrama geldi", "lc_bayram_came");
  addNpcMemory(state, "mehmet", "Düğüne geldi", "lc_wedding_came");
  buildLifeDossier(state);
  const first = copy(decorateLifeDossier(state));
  const secondState = migrateState(copy(state)).state;
  buildLifeDossier(secondState);
  const second = decorateLifeDossier(secondState);
  assert.deepEqual(second.traces, first.traces);
  assert.ok(second.traces.length <= 10);
  assert.equal(new Set(second.traces.map((row) => row.id)).size, second.traces.length);
  assert.ok(second.contentNotes.some((row) => row.includes("Gecikmiş bakiye")));
});
