import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { advanceWeek, applyDecision, canApplyDecision } from "../public/games/tc-sim/js/time.js";
import { acceptJobOffer } from "../public/games/tc-sim/js/life.js";
import { getEventChoiceAvailability, getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { applySocialAction, canUseSocialAction } from "../public/games/tc-sim/js/social.js";

const strategies = ["career", "family", "money", "relationship", "education", "social", "balanced", "adaptive"];
const bands = [
  { id: "45-55", min: 45, max: 55 },
  { id: "55-65", min: 55, max: 65 },
  { id: "65-75", min: 65, max: 75 },
  { id: "75+", min: 75, max: Infinity },
];
const dossierArcs = new Set(["career", "family", "finance", "housing", "relationship", "crisis"]);

function bandFor(age) {
  return bands.find((row) => age >= row.min && age < row.max)?.id || null;
}

function choose(state, strategy) {
  const event = getEventDefinition(state.events.active.eventId);
  assert.ok(event, `missing event ${state.events.active.eventId}`);
  const preferences = {
    career: ["push", "take", "continue", "carry", "work", "accept"],
    family: ["family", "home", "take", "go", "help", "repair", "accept"],
    money: ["decline", "budget", "minimum", "wait", "keep"],
    relationship: ["home", "talk", "repair", "call", "go", "accept"],
    education: ["study", "course", "speak", "take", "accept"],
    social: ["go", "help", "talk", "call", "accept"],
    balanced: ["repair", "rest", "keep", "talk", "accept"],
    adaptive: state.health.stress > 60 ? ["rest", "home", "repair", "wait"] : ["take", "go", "accept", "push"],
  }[strategy];
  return preferences
    .map((id) => event.choices.find((row) => row.id === id))
    .find((row) => row && getEventChoiceAvailability(state, row.id).ok)
    || event.choices.find((row) => getEventChoiceAvailability(state, row.id).ok);
}

function record(metrics, state, event) {
  const band = bandFor(state.player.age);
  if (!band) return;
  const row = metrics[band];
  row.events += 1;
  row.ids.add(event.id);
  if (event.id.startsWith("lc_")) {
    row.authored += 1;
    row.authoredIds.add(event.id);
    if (event.arc) row.arcs.add(event.arc);
    if (dossierArcs.has(event.arc) || event.tags?.some((tag) => dossierArcs.has(tag))) row.dossierRelevant += 1;
    row.authoredWeeks.push(state.time.absoluteWeek);
  } else {
    row.production += 1;
    row.productionIds.add(event.id);
  }
}

function settle(state, strategy, metrics) {
  let guard = 0;
  while (state.events.active && guard++ < 80) {
    const event = getEventDefinition(state.events.active.eventId);
    record(metrics, state, event);
    const choice = choose(state, strategy);
    assert.ok(choice, `no choice ${event.id}`);
    assert.equal(resolveEvent(state, choice.id).ok, true, `${event.id}:${choice.id}`);
  }
  assert.ok(guard < 80, "event soft-lock");
}

function actionPlan(state, strategy, week) {
  return {
    career: ["overtime", "rest"],
    family: ["family", "rest"],
    money: ["budget-check", "overtime"],
    relationship: ["family", "rest"],
    education: ["rest", "budget-check"],
    social: ["friend", "exercise"],
    balanced: ["rest", "family"],
    adaptive: [state.health.stress > 58 || state.health.energy < 45 ? "rest" : "overtime", week % 3 ? "family" : "friend"],
  }[strategy];
}

function emptyMetrics() {
  return Object.fromEntries(bands.map(({ id }) => [id, {
    weeks: 0, events: 0, authored: 0, production: 0, dossierRelevant: 0,
    ids: new Set(), authoredIds: new Set(), productionIds: new Set(), arcs: new Set(), authoredWeeks: [],
  }]));
}

function percentile(values, fraction) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * fraction))];
}

const seedCount = Number(process.env.WAVE4_LATE_LIFE_SEEDS) || 20;
const metrics = emptyMetrics();
let completedLives = 0;
let deaths = 0;
let maxSaveBytes = 0;
let runs = 0;

for (let seedIndex = 0; seedIndex < seedCount; seedIndex += 1) {
  for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex += 1) {
    runs += 1;
    const strategy = strategies[strategyIndex];
    const state = createNewGame({
      seed: 880000 + seedIndex * 100 + strategyIndex,
      profile: strategy === "career" ? "ambitious" : ["relationship", "social", "family"].includes(strategy) ? "social" : "balanced",
      familyType: ["nuclear", "extended", "stem", "single"][seedIndex % 4],
    });
    for (let week = 0; state.player.age < 82 && !state.lifetime?.death && week < 3200; week += 1) {
      settle(state, strategy, metrics);
      const band = bandFor(state.player.age);
      if (band) metrics[band].weeks += 1;
      if (!state.career.jobId && !state.career.pendingJob && state.career.retirement?.status !== "retired") {
        acceptJobOffer(state, "market");
        settle(state, strategy, metrics);
      }
      if (strategy === "relationship" || strategy === "adaptive") {
        const action = ["advance_romance", "confide", "meet"].find((id) => canUseSocialAction(state, "elif", id).ok);
        if (action) applySocialAction(state, "elif", action);
      } else if (strategy === "family") {
        const action = ["confide", "meet"].find((id) => canUseSocialAction(state, "anne", id).ok);
        if (action) applySocialAction(state, "anne", action);
      } else if (strategy === "social") {
        const action = ["confide", "meet"].find((id) => canUseSocialAction(state, "mehmet", id).ok);
        if (action) applySocialAction(state, "mehmet", action);
      }
      for (const id of actionPlan(state, strategy, week)) {
        settle(state, strategy, metrics);
        if (canApplyDecision(state, id).ok) applyDecision(state, id);
      }
      settle(state, strategy, metrics);
      assert.equal(advanceWeek(state).ok, true);
    }
    settle(state, strategy, metrics);
    assert.equal(validateState(state).ok, true);
    maxSaveBytes = Math.max(maxSaveBytes, Buffer.byteLength(JSON.stringify(state)));
    if (state.lifetime?.death) deaths += 1;
    else if (state.player.age >= 82) completedLives += 1;
  }
}

const summary = Object.fromEntries(bands.map(({ id }) => {
  const row = metrics[id];
  const years = row.weeks / 48;
  const gaps = row.authoredWeeks.slice(1).map((week, index) => week - row.authoredWeeks[index]).filter((gap) => gap >= 0 && gap < 2000);
  return [id, {
    observedYears: Number(years.toFixed(1)),
    authoredEvents: row.authored,
    productionEvents: row.production,
    meaningfulAuthoredPerYear: Number((row.authored / Math.max(1, years)).toFixed(3)),
    productionPerYear: Number((row.production / Math.max(1, years)).toFixed(3)),
    uniqueAuthored: row.authoredIds.size,
    uniqueProduction: row.productionIds.size,
    arcDiversity: [...row.arcs].sort(),
    dossierRelevant: row.dossierRelevant,
    authoredGapP90Weeks: percentile(gaps, 0.9),
  }];
}));

assert.ok(seedCount >= 20, "late-life closure requires at least 20 seeds");
assert.equal(completedLives + deaths, runs);
assert.ok(Object.values(summary).slice(0, 3).every((row) => row.observedYears > 1000), JSON.stringify(summary));
assert.ok(maxSaveBytes < 300_000, `save grew to ${maxSaveBytes}`);
console.log(`WAVE4_POST_OPUS_LATE_LIFE ${JSON.stringify({ runs, completedLives, deaths, maxSaveBytes, bands: summary })}`);
