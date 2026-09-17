import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { advanceWeek, applyDecision, canApplyDecision } from "../public/games/tc-sim/js/time.js";
import { acceptJobOffer, getRetirementEligibility, retireCareer } from "../public/games/tc-sim/js/life.js";
import { getEventChoiceAvailability, getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { applySocialAction, canUseSocialAction } from "../public/games/tc-sim/js/social.js";
import { CHAINS, LIFE_CONTENT_CALLBACKS } from "../public/games/tc-sim/js/life-content.js";

const strategies = ["career", "family", "money", "relationship", "education", "social", "balanced", "adaptive"];
const bands = [
  { id: "35-45", min: 35, max: 45 },
  { id: "45-55", min: 45, max: 55 },
  { id: "55-65", min: 55, max: 65 },
  { id: "65-75", min: 65, max: 75 },
  { id: "75-80", min: 75, max: 80 },
  { id: "80-85", min: 80, max: 85 },
  { id: "85-90", min: 85, max: 90 },
  { id: "90+", min: 90, max: Infinity },
];
const chainOpenings = new Set(CHAINS.map((chain) => chain.nodes[0]?.id).filter(Boolean));
const chainContinuations = new Set(CHAINS.flatMap((chain) => chain.nodes.slice(1).map((node) => node.id)));
const contentCallbacks = new Set(LIFE_CONTENT_CALLBACKS.map((event) => event.id));
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
    const late = event.tags?.includes("late-life");
    row[late ? "lateHits" : "oldHits"] += 1;
    row[late ? "lateIds" : "oldIds"].add(event.id);
    if (chainOpenings.has(event.id)) row.chainStarts.add(event.id);
    if (chainOpenings.has(event.id)) row.openingHits += 1;
    else if (chainContinuations.has(event.id)) row.continuationHits += 1;
    else if (contentCallbacks.has(event.id)) row.callbackHits += 1;
    if (row.lastAuthoredWeek !== null) row.gaps.push(state.time.absoluteWeek - row.lastAuthoredWeek);
    row.streak = row.lastAuthoredWeek !== null && state.time.absoluteWeek - row.lastAuthoredWeek <= 1 ? row.streak + 1 : 1;
    row.maxStreak = Math.max(row.maxStreak, row.streak);
    row.lastAuthoredWeek = state.time.absoluteWeek;
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
    oldHits: 0, lateHits: 0,
    openingHits: 0, continuationHits: 0, callbackHits: 0, streak: 0, maxStreak: 0, lastAuthoredWeek: null,
    gaps: [],
    ids: new Set(), authoredIds: new Set(), oldIds: new Set(), lateIds: new Set(), productionIds: new Set(),
    chainStarts: new Set(), arcs: new Set(), authoredWeeks: [],
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
let maxSave720 = 0;
let maxSave1440 = 0;
let maxSaveAge82 = 0;
let maxSaveAtDeath = 0;
let runs = 0;
let largestState = null;

for (let seedIndex = 0; seedIndex < seedCount; seedIndex += 1) {
  for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex += 1) {
    runs += 1;
    const strategy = strategies[strategyIndex];
    const state = createNewGame({
      seed: 880000 + seedIndex * 100 + strategyIndex,
      profile: strategy === "career" ? "ambitious" : ["relationship", "social", "family"].includes(strategy) ? "social" : "balanced",
      familyType: ["nuclear", "extended", "stem", "single"][seedIndex % 4],
    });
    const checkpoints = new Set();
    for (const row of Object.values(metrics)) row.lastAuthoredWeek = null;
    for (let week = 0; state.player.age < 96 && !state.lifetime?.death && week < 3900; week += 1) {
      settle(state, strategy, metrics);
      const band = bandFor(state.player.age);
      if (band) metrics[band].weeks += 1;
      if (!state.career.jobId && !state.career.pendingJob && state.career.retirement?.status !== "retired") {
        acceptJobOffer(state, "market");
        settle(state, strategy, metrics);
      }
      if (state.player.age >= 60 && strategy !== "career" && state.career.jobId && getRetirementEligibility(state).eligible) {
        retireCareer(state);
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
      if (state.time.absoluteWeek >= 720 && !checkpoints.has(720)) {
        checkpoints.add(720);
        maxSave720 = Math.max(maxSave720, Buffer.byteLength(JSON.stringify(state)));
      }
      if (state.time.absoluteWeek >= 1440 && !checkpoints.has(1440)) {
        checkpoints.add(1440);
        maxSave1440 = Math.max(maxSave1440, Buffer.byteLength(JSON.stringify(state)));
      }
      if (state.player.age >= 82 && !checkpoints.has(82)) {
        checkpoints.add(82);
        maxSaveAge82 = Math.max(maxSaveAge82, Buffer.byteLength(JSON.stringify(state)));
      }
    }
    settle(state, strategy, metrics);
    assert.equal(validateState(state).ok, true);
    const saveBytes = Buffer.byteLength(JSON.stringify(state));
    if (saveBytes > maxSaveBytes) {
      maxSaveBytes = saveBytes;
      largestState = structuredClone(state);
    }
    if (state.lifetime?.death) {
      deaths += 1;
      maxSaveAtDeath = Math.max(maxSaveAtDeath, Buffer.byteLength(JSON.stringify(state)));
    }
    else if (state.player.age >= 96) completedLives += 1;
  }
}

const summary = Object.fromEntries(bands.map(({ id }) => {
  const row = metrics[id];
  const years = row.weeks / 48;
  return [id, {
    observedYears: Number(years.toFixed(1)),
    authoredEvents: row.authored,
    productionEvents: row.production,
    meaningfulAuthoredPerYear: Number((row.authored / Math.max(1, years)).toFixed(3)),
    productionPerYear: Number((row.production / Math.max(1, years)).toFixed(3)),
    uniqueAuthored: row.authoredIds.size,
    oldCatalogHits: row.oldHits,
    uniqueOldCatalog: row.oldIds.size,
    lateLifeHits: row.lateHits,
    uniqueLateLife: row.lateIds.size,
    chainStarts: row.chainStarts.size,
    openingHits: row.openingHits,
    continuationHits: row.continuationHits,
    callbackHits: row.callbackHits,
    uniqueProduction: row.productionIds.size,
    arcDiversity: [...row.arcs].sort(),
    dossierRelevant: row.dossierRelevant,
    authoredGapP25Weeks: percentile(row.gaps, 0.25),
    authoredGapMedianWeeks: percentile(row.gaps, 0.5),
    authoredGapP75Weeks: percentile(row.gaps, 0.75),
    authoredGapP90Weeks: percentile(row.gaps, 0.9),
    maxConsecutiveAuthored: row.maxStreak,
  }];
}));

const largestSections = Object.fromEntries(Object.entries(largestState || {}).map(([key, value]) =>
  [key, Buffer.byteLength(JSON.stringify(value))],
).sort((a, b) => b[1] - a[1]).slice(0, 12));
console.log(`WAVE4_POST_OPUS_LATE_LIFE ${JSON.stringify({ runs, completedLives, deaths, maxSaveBytes, maxSave720, maxSave1440, maxSaveAge82, maxSaveAtDeath, largestSections, bands: summary })}`);
assert.ok(seedCount >= 20, "late-life closure requires at least 20 seeds");
assert.equal(completedLives + deaths, runs);
assert.ok(Object.values(summary).slice(0, 3).every((row) => row.observedYears > 1000), JSON.stringify(summary));
assert.ok(maxSaveBytes < 300_000, `save grew to ${maxSaveBytes}`);
