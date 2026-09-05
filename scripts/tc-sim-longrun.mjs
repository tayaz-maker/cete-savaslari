import { needsParentCare, canTryParenthood, childStage } from "../public/games/tc-sim/js/parenthood.js";
/**
 * TC SIM uzun koşu / fuzz doğrulayıcı.
 *
 *   node scripts/tc-sim-longrun.mjs                 # 520 hafta, seed 1
 *   node scripts/tc-sim-longrun.mjs 1040 7          # 1040 hafta, seed 7
 *   node scripts/tc-sim-longrun.mjs fuzz            # 20 seed × 260 hafta
 *
 * Oyuncu eylemleri yalnız arayüzün izin verdiği yollardan (kayıt, bırakma,
 * teklif kabulü, taşınma, haftalık kararlar) seçilir. Her hafta invariant
 * yürüyüşü yapılır; ihlal varsa çıkış kodu 1 olur ve hafta numarasıyla raporlanır.
 */
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import {
  acceptJobOffer,
  enrollEducation,
  getHomeById,
  getJobById,
  moveHome,
  stopEducation,
} from "../public/games/tc-sim/js/life.js";
import {
  advanceWeek,
  applyDecision,
  canApplyDecision,
  getAvailableDecisions,
} from "../public/games/tc-sim/js/time.js";
import { getEventDefinition, resolveEvent, getEventChoiceAvailability, activateNextEvent } from "../public/games/tc-sim/js/events.js";
import { EDUCATION_PATHS, getPathById } from "../public/games/tc-sim/js/education.js";
import { getEraById } from "../public/games/tc-sim/js/eras.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";
import {
  applySocialAction,
  canUseSocialAction,
  getAvailableSocialActions,
  getRelationship,
} from "../public/games/tc-sim/js/social.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
}

const JOB_IDS = ["market", "courier", "office", "technician", "specialist"];
const HOME_IDS = ["family", "shared", "studio"];

function run(weeks, seed) {
  let state = createNewGame({
    name: "Uzun",
    profile: "balanced",
    seed,
    now: "2027-01-01T00:00:00.000Z",
  });
  const storage = new MemoryStorage();
  const problems = [];
  const seenProblems = new Set();
  const check = (ok, message) => {
    if (ok || seenProblems.has(message)) return;
    seenProblems.add(message);
    problems.push(`hafta ${state.time.absoluteWeek}: ${message}`);
  };

  let rng = seed >>> 0 || 1;
  const rand = () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    rng >>>= 0;
    return rng / 4294967296;
  };
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const settle = (target) => {
    let guard = 0;
    while (target.events.active && guard++ < 50) {
      const definition = getEventDefinition(target.events.active.eventId);
      resolveEvent(target, pick(definition.choices).id);
    }
  };

  for (let step = 0; step < weeks; step += 1) {
    settle(state);
    if (rand() < 0.05 && !state.education.active)
      enrollEducation(state, pick(EDUCATION_PATHS).id, rand() < 0.5 ? "full" : "part");
    if (rand() < 0.01 && state.education.active) stopEducation(state);
    if (rand() < 0.03) acceptJobOffer(state, pick(JOB_IDS));
    if (rand() < 0.02) moveHome(state, pick(HOME_IDS));
    if (rand() < 0.28 && !state.events.active) {
      const person = pick(state.people);
      const actions = getAvailableSocialActions(state, person.id).filter(
        (action) => action.availability.ok,
      );
      const action = pick(actions);
      if (action) applySocialAction(state, person.id, action.id);
    }
    const available = getAvailableDecisions(state);
    for (let slot = 0; slot < 2; slot += 1) {
      const decision = pick(available);
      if (decision && canApplyDecision(state, decision.id).ok) applyDecision(state, decision.id);
    }
    settle(state);

    const advanced = advanceWeek(state);
    check(advanced.ok, `advanceWeek reddetti: ${advanced.messages?.join(" ")}`);
    settle(state);

    const validation = validateState(state);
    check(validation.ok, `validateState: ${validation.errors.join("; ")}`);
    check(state.career.jobId === null || Boolean(getJobById(state.career.jobId)), "geçersiz jobId");
    check(Boolean(getHomeById(state.household.homeId)), "geçersiz homeId");
    check(Boolean(getEraById(state.world.eraId)), "geçersiz eraId");

    const active = state.education.active;
    if (active) {
      const path = getPathById(active.pathId);
      check(Boolean(path), "geçersiz pathId");
      check(
        Number.isInteger(active.progressPoints) &&
          active.progressPoints >= 0 &&
          active.progressPoints <= (path?.targetPoints ?? 0),
        "ilerleme aralık dışı",
      );
    }
    check(
      Number.isInteger(state.education.tuitionOwedThisMonth) &&
        state.education.tuitionOwedThisMonth >= 0,
      "eğitim borcu geçersiz",
    );

    let totalExperience = 0;
    for (const value of Object.values(state.career.jobFamilyExperience)) {
      check(Number.isInteger(value) && value >= 0, "deneyim geçersiz");
      totalExperience += value;
    }
    check(totalExperience <= state.time.absoluteWeek, "deneyim geçen haftadan fazla");

    for (const key of ["energy", "stress", "health"])
      check(
        Number.isFinite(state.health[key]) && state.health[key] >= 0 && state.health[key] <= 100,
        `beden değeri aralık dışı: ${key}`,
      );
    check(Number.isFinite(state.finances.balance), "bakiye sayı değil");
    for (const value of Object.values(state.relationships))
      check(Number.isFinite(value) && value >= 0 && value <= 100, "ilişki aralık dışı");
    for (const person of state.people) {
      const relationship = getRelationship(state, person.id);
      check(
        Number.isFinite(relationship.trust) && relationship.trust >= 0 && relationship.trust <= 100,
        "güven aralık dışı",
      );
      check(
        Number.isFinite(relationship.tension) &&
          relationship.tension >= 0 &&
          relationship.tension <= 100,
        "gerilim aralık dışı",
      );
      check(person.memories.length <= 50, "NPC hafızası sınırı aşıldı");
      check(
        person.roleId !== "family" || person.social.romanceStatus === "none",
        "aile NPC romantik durumda",
      );
    }
    const partners = state.people.filter((person) => person.social.romanceStatus === "partner");
    check(partners.length <= 1, "birden fazla partner");
    check(
      (state.social.currentPartnerNpcId === null && partners.length === 0) ||
        partners[0]?.id === state.social.currentPartnerNpcId,
      "partner kimliği tutarsız",
    );
    check(state.weekly.used <= 2, "haftalık karar hakkı aşıldı");

    // Sınırlı listeler taşmamalı.
    check(state.memories.length <= 200, "hafıza sınırı aşıldı");
    check(state.finances.ledger.length <= 120, "defter sınırı aşıldı");
    check(state.events.history.length <= 200, "event geçmişi sınırı aşıldı");
    check(state.yearlyHistory.length <= 80, "yıl dosyası sınırı aşıldı");

    // 3D: openCases patlamaz, borç tutarları sınırlı ve negatif olmaz, tekrar yok.
    check(state.openCases.length <= 50, "openCases sınırsız büyüyor");
    const caseIds = new Set();
    for (const item of state.openCases) {
      check(!caseIds.has(item.id), `tekrar eden openCase id: ${item.id}`);
      caseIds.add(item.id);
      if (item.type === "personal-debt")
        check(
          Number.isFinite(item.payload?.amount) && item.payload.amount > 0,
          "kişisel borç tutarı geçersiz/negatif",
        );
    }
    const unresolvedDebts = state.openCases.filter(
      (item) => item.type === "personal-debt" && item.status !== "resolved",
    );
    check(unresolvedDebts.length <= 1, "birden fazla bekleyen kişisel borç");

    if ((step + 1) % 12 === 0) {
      const saved = saveGame(storage, state);
      check(saved.ok, `save başarısız: ${saved.message}`);
      const loaded = loadGame(storage);
      check(loaded.ok, "load başarısız");
      if (loaded.ok) state = loaded.state;
    }
  }

  return {
    weeks,
    seed,
    problems,
    age: state.player.age,
    years: state.yearlyHistory.length,
    growth: {
      memories: state.memories.length,
      ledger: state.finances.ledger.length,
      eventHistory: state.events.history.length,
      openCases: state.openCases.length,
      activeOpenCases: state.openCases.filter((item) => item.status !== "resolved").length,
      resolvedOpenCases: state.openCases.filter((item) => item.status === "resolved").length,
      openSocialCases: state.openCases.filter(
        (item) => item.type === "social-obligation" && item.status !== "resolved",
      ).length,
      yearlyHistory: state.yearlyHistory.length,
      npcMemories: state.people.map((person) => person.memories.length),
      flags: Object.keys(state.flags).length,
      saveBytes: Buffer.byteLength(JSON.stringify(state)),
    },
    final: {
      educationLevel: state.education.level,
      fields: state.education.fields,
      jobId: state.career.jobId,
      experience: state.career.jobFamilyExperience,
      balance: state.finances.balance,
      health: state.health,
      currentPartnerNpcId: state.social.currentPartnerNpcId,
    },
  };
}

// Aynı motor ve karar doğrulamasıyla strateji karşılaştırması. Haftalık sağlık
// değerlerine müdahale edilmez; farklar seçilen aktivitelerden doğar.
export function settleBodyEvents(state, strategy = "balanced", observe = () => {}) {
  let count = 0;
  while (state.events.active) {
    assert.ok(count++ < 80, "Olay zinciri aynı haftada sonlanmalı");
    const definition = getEventDefinition(state.events.active.eventId);
    const pushing = ["overworker", "low-recovery", "inactive"].includes(strategy);
    const preferred = pushing ? ["continue", "ignore", "hide"] : ["slow", "care", "move", "tell"];
    const selected = preferred.map((id) => definition.choices.find((item) => item.id === id)).find(Boolean) || definition.choices[0];
    observe(state, definition, selected, "before");
    assert.equal(resolveEvent(state, selected.id).ok, true);
    observe(state, definition, selected, "after");
  }
}

export function playBodyWeek(state, strategy, observe = () => {}) {
  settleBodyEvents(state, strategy, observe);
  const actions = strategy === "overworker" ? ["overtime"]
    : strategy === "low-recovery" ? ["exercise", "friend", "family"]
    : strategy === "inactive" ? []
    : strategy === "health-first" ? ["body-care", "rest", "exercise"]
    : ["rest", state.time.absoluteWeek % 4 === 0 ? "family" : "exercise"];
  const available = new Set(getAvailableDecisions(state).map((item) => item.id));
  for (const id of actions) {
    if (available.has(id) && canApplyDecision(state, id).ok) {
      assert.equal(applyDecision(state, id).ok, true);
      settleBodyEvents(state, strategy, observe);
    }
  }
  const choices = [...state.weekly.selectedIds];
  assert.equal(advanceWeek(state).ok, true);
  settleBodyEvents(state, strategy, observe);
  assert.equal(validateState(state).ok, true);
  return choices;
}

export function runBodyStrategy(strategy, weeks = 520) {
  const state = createNewGame({ name: "Deniz", profile: "balanced", now: "2027-01-01T00:00:00.000Z" });
  const checkpoints = {};
  const maximums = { overwork: 0, underRecovery: 0, inactivity: 0, conditions: 0, healthOpenCases: 0 };
  const decisions = {};
  let warnings = 0;
  for (let step = 1; step <= weeks; step += 1) {
    const choices = playBodyWeek(state, strategy, (_state, definition, _choice, phase) => {
      if (phase === "before" && /^health_(overload|recovery|inactivity)_review$/.test(definition.id)) warnings += 1;
    });
    for (const id of choices) decisions[id] = (decisions[id] || 0) + 1;
    for (const [key, value] of Object.entries(state.body.exposures)) {
      assert.ok(value >= 0 && value <= 100);
      maximums[key] = Math.max(maximums[key], value);
    }
    maximums.conditions = Math.max(maximums.conditions, state.body.conditions.length);
    const healthOpenCases = state.openCases.filter((item) => item.type === "health-followup" && item.status !== "resolved");
    maximums.healthOpenCases = Math.max(maximums.healthOpenCases, healthOpenCases.length);
    assert.ok(state.body.conditions.length <= 8);
    assert.ok(healthOpenCases.length <= 4);
    assert.equal(new Set(healthOpenCases.map((item) => item.chainId)).size, healthOpenCases.length);
    assert.ok(state.people.every((person) => person.memories.length <= 50));
    assert.ok(state.yearlyHistory.length <= 80);
    if ([52, 156, 520].includes(step)) checkpoints[step] = {
      ...state.body.exposures,
      ...Object.fromEntries(["active", "managed", "resolved", "chronic"].map((status) => [status, state.body.conditions.filter((item) => item.status === status).length])),
      healthOpenCases: healthOpenCases.length,
    };
  }
  return { strategy, checkpoints, maximums, warnings, decisions,
    healthNpcMemories: state.people.reduce((sum, person) => sum + person.memories.filter((item) => item.type?.startsWith("health_")).length, 0),
    yearHealthSummaries: state.yearlyHistory.filter((entry) => entry.health?.end).length,
    yearHealthConditions: state.yearlyHistory.flatMap((entry) => entry.health?.conditions || []).length,
  };
}

export function runBodyMatrix() {
  return Object.fromEntries(["overworker", "balanced", "low-recovery", "health-first"].map((strategy) => [strategy, runBodyStrategy(strategy)]));
}

export function settleHouseholdEvents(state, choices = {}) {
  let guard = 0;
  activateNextEvent(state);
  while (state.events.active) {
    assert.ok(guard++ < 80, "Olaylar sonlanmalı");
    const definition = getEventDefinition(state.events.active.eventId);
    const preferred = choices[definition.id] || {
      cohabitation_discussion: "plan", cohabitation_move: "shared", household_adjustment: "coordinate",
      household_family_visit: "tell", marriage_discussion: "plan", marriage_commitment: "confirm",
      romantic_opportunity: "interested", partner_transition: "commit",
      health_overload_review: "slow", health_recovery_review: "care", health_inactivity_review: "move", health_support_disclosure: "tell",
    }[definition.id];
    const choice = definition.choices.find((item) => item.id === preferred && getEventChoiceAvailability(state, item.id).ok) || definition.choices.find((item) => getEventChoiceAvailability(state, item.id).ok);
    assert.ok(choice);
    assert.equal(resolveEvent(state, choice.id).ok, true);
  }
}

export function runHouseholdScenario(weeks = 520, { conflict = false } = {}) {
  let state = createNewGame({ now: "2027-01-01T00:00:00.000Z", name: "Deniz" });
  const storage = new MemoryStorage();
  let maxCases = 0;
  const choices = {};
  const settle = () => settleHouseholdEvents(state, choices);
  for (let step = 0; step < weeks; step += 1) {
    const neglect = conflict && step >= 40;
    if (neglect) Object.assign(choices, { household_adjustment: "skip", relationship_tension: "avoid", elif_neglect_week: "work", separation_discussion: "separate", separation_review: "divorce" });
    settle();
    if (canApplyDecision(state, "rest").ok) applyDecision(state, "rest");
    settle();
    const socialAction = canUseSocialAction(state, "elif", "confide").ok ? "confide" : "meet";
    if (!neglect && step % 2 === 0 && canUseSocialAction(state, "elif", socialAction).ok) applySocialAction(state, "elif", socialAction);
    else if (canApplyDecision(state, "exercise").ok) applyDecision(state, "exercise");
    settle();
    assert.equal(advanceWeek(state).ok, true);
    settle();
    assert.equal(validateState(state).ok, true);
    const cases = state.openCases.filter((item) => item.type === "household-followup" && item.status !== "resolved");
    assert.equal(new Set(cases.map((item) => item.payload.kind)).size, cases.length);
    maxCases = Math.max(maxCases, cases.length);
    assert.ok(cases.length <= 4);
    assert.ok(state.household.history.length <= 24);
    assert.ok(state.people.every((person) => person.memories.length <= 50));
    assert.ok(state.yearlyHistory.length <= 80);
    if (step % 12 === 0) {
      assert.equal(saveGame(storage, state).ok, true);
      const loaded = loadGame(storage);
      assert.equal(loaded.ok, true);
      assert.deepEqual(loaded.state.household, state.household);
      state = loaded.state;
    }
  }
  return { weeks, partner: state.social.currentPartnerNpcId, union: state.household.union, home: state.household.homeId,
    balance: state.finances.balance, history: state.household.history, years: state.yearlyHistory.map((year) => ({ year: year.year, household: year.household })),
    maxCases, partnerCount: state.people.filter((person) => person.social.romanceStatus === "partner").length,
    activeHouseholdCases: state.openCases.filter((item) => item.type === "household-followup" && item.status !== "resolved").length,
    npcMemoryCounts: state.people.map((person) => person.memories.length),
    playerMemories: state.memories.length,
  };
}

export function runParenthoodScenario({ noChild = false } = {}) {
  let state = createNewGame({ now: "2027-01-01T00:00:00.000Z", name: "Deniz" });
  const storage = new MemoryStorage();
  let maximumCases = 0;
  for (let step = 0; step < 520; step += 1) {
    const ready = state.time.absoluteWeek >= 220;
    const tryingChoice = state.parenthood.children.length >= 2 ? "no" : canTryParenthood(state) ? "try_partner" : "discuss";
    const choices = {
      family_intent_discussion: ready ? noChild ? "no" : "wants" : "later", family_intent_review: "talk",
      parent_planning: ready && !noChild ? tryingChoice : "wait", parent_planning_review: ready && !noChild ? tryingChoice : "wait",
      parent_preparation: "prepare", parent_family_support: "tell", parent_housing_review: "studio", parent_care_review: "arrange", parent_budget_review: "home",
    };
    const settle = () => settleHouseholdEvents(state, choices);
    settle();
    if (needsParentCare(state) && canApplyDecision(state, "parent-care").ok) applyDecision(state, "parent-care");
    else if (canApplyDecision(state, "rest").ok) applyDecision(state, "rest");
    settle();
    const socialAction = canUseSocialAction(state, "elif", "confide").ok ? "confide" : "meet";
    if (step % 2 === 0 && canUseSocialAction(state, "elif", socialAction).ok) applySocialAction(state, "elif", socialAction);
    else if (canApplyDecision(state, "rest").ok) applyDecision(state, "rest");
    else if (canApplyDecision(state, "exercise").ok) applyDecision(state, "exercise");
    settle();
    assert.equal(advanceWeek(state).ok, true); settle();
    assert.equal(validateState(state).ok, true);
    const cases = state.openCases.filter(c => c.type === "parenting-followup" && c.status !== "resolved");
    assert.equal(new Set(cases.map(c => c.payload.kind)).size, cases.length);
    maximumCases = Math.max(maximumCases, cases.length);
    assert.ok(cases.length <= 7);
    assert.ok(state.household.history.length <= 24);
    assert.ok(state.people.every(p => p.memories.length <= 50));
    if (step % 12 === 0) {
      assert.equal(saveGame(storage, state).ok, true);
      const next = loadGame(storage); assert.equal(next.ok, true); assert.deepEqual(next.state.parenthood, state.parenthood); state = next.state;
    }
  }
  return { children: state.parenthood.children, pregnancy: state.parenthood.pregnancy, stages: state.parenthood.children.map(c => childStage(state,c)),
    balance: state.finances.balance, relationship: getRelationship(state, "elif"), plan: state.household.union.familyPlan,
    maximumCases, parentingCases: state.openCases.filter(c => c.type === "parenting-followup" && c.status !== "resolved").length,
    npcMemories: state.people.map(p=>p.memories.length), history: state.household.history, years: state.yearlyHistory, valid: validateState(state).ok };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const mode = process.argv[2] || "520";
if (mode === "parenthood" || mode === "no-child") {
  console.log(JSON.stringify(runParenthoodScenario({ noChild: mode === "no-child" }), null, 2));
} else if (mode === "household" || mode === "separation") {
  console.log(JSON.stringify(runHouseholdScenario(520, { conflict: mode === "separation" }), null, 2));
} else if (mode === "body") {
  console.log(JSON.stringify(runBodyMatrix(), null, 2));
} else if (mode === "fuzz") {
  const failed = [];
  for (let seed = 1; seed <= 20; seed += 1) {
    const result = run(260, seed);
    if (result.problems.length) failed.push({ seed, problems: result.problems });
  }
  console.log(JSON.stringify({ mode: "fuzz", seeds: 20, weeksPerSeed: 260, failed }, null, 1));
  process.exitCode = failed.length ? 1 : 0;
} else {
  const result = run(Number(mode), Number(process.argv[3] || 1));
  console.log(JSON.stringify(result, null, 1));
  process.exitCode = result.problems.length ? 1 : 0;
}

}
