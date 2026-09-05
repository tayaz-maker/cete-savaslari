import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, adjustTendency, setYearlyPriorities, validateState, recordComparisonMilestone } from "../public/games/tc-sim/js/state.js";
import { activateNextEvent, getEventDefinition, processDueOpenCases, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { advanceWeek, applyDecision } from "../public/games/tc-sim/js/time.js";
import { saveGame, loadGame } from "../public/games/tc-sim/js/save.js";
import { createSecret, transferSecret, isSecretKnownTo, getRelationshipContext } from "../public/games/tc-sim/js/depth2-systems.js";
import { getKnownOpenCases } from "../public/games/tc-sim/js/calendar.js";

class MemoryStorage {
  constructor() { this.data = new Map(); }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, String(value)); }
}

test("background choices change only intended starting context", () => {
  const tight = createNewGame({ economicBackground: "tight", familyBackground: "demanding", educationBackground: "vocational", socialBackground: "broad" });
  const stable = createNewGame({ economicBackground: "stable", familyBackground: "supportive", educationBackground: "general", socialBackground: "close" });
  assert.equal(tight.player.background.education, "vocational");
  assert.equal(tight.education.fields.includes("technical"), true);
  assert.ok(stable.finances.balance > tight.finances.balance);
  assert.equal(validateState(tight).ok, true);
});

test("tendencies move slowly and stay bounded", () => {
  const state = createNewGame();
  for (let i = 0; i < 300; i += 1) adjustTendency(state, "risk", 1);
  assert.equal(state.player.tendencies.risk, 100);
  adjustTendency(state, "risk", -300);
  assert.equal(state.player.tendencies.risk, 0);
  assert.equal(validateState(state).ok, true);
});

test("yearly priorities accept at most two valid categories", () => {
  const state = createNewGame();
  setYearlyPriorities(state, ["career", "money", "career", "unknown"]);
  assert.deepEqual(state.yearlyPlan.priorities, ["career", "money"]);
  assert.equal(state.weekly.used, 0);
});

test("secret registry transfers knowledge without exposing implementation ids", () => {
  const state = createNewGame();
  createSecret(state, { id: "test-secret", summary: "Kişisel bir mesele", relatedPeople: ["anne"], knownBy: ["player"] });
  assert.equal(isSecretKnownTo(state, "test-secret", "anne"), false);
  assert.equal(transferSecret(state, "test-secret", "anne"), true);
  assert.equal(isSecretKnownTo(state, "test-secret", "anne"), true);
  assert.equal(state.secrets[0].summary.includes("test-secret"), false);
});

test("comparison milestones are capped and persist through save", () => {
  const state = createNewGame();
  for (let i = 0; i < 40; i += 1) recordComparisonMilestone(state, { key: `m-${i}`, text: "Bir haber" });
  assert.ok(state.comparisonCircle.milestones.length <= 24);
  const storage = new MemoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  assert.equal(loadGame(storage).state.comparisonCircle.milestones.length, 24);
});

test("career promotion window schedules one delayed review", () => {
  const state = createNewGame();
  state.flags.depth2Enabled = true;
  state.career.weeksInRole = 24;
  state.career.performance = 70;
  state.education.level = "lise";
  state.career.jobFamilyExperience.hizmet = 30;
  state.events.active = { eventId: "career_promotion_window", occurrenceId: "depth2-career", sourceCaseId: null };
  assert.equal(resolveEvent(state, "accept").ok, true);
  assert.equal(state.openCases.filter((item) => item.eventId === "career_promotion_review").length, 1);
  const item = state.openCases.find((entry) => entry.eventId === "career_promotion_review");
  state.time.absoluteWeek = item.dueWeek;
  processDueOpenCases(state);
  state.events.active = null;
  activateNextEvent(state);
  assert.equal(state.events.active.eventId, "career_promotion_review");
  resolveEvent(state, "advance");
  assert.equal(item.status, "resolved");
});

test("family and money delayed cases expire once and clear their flags", () => {
  const state = createNewGame();
  state.flags.depth2Enabled = true;
  state.household.homeId = "family";
  state.time.absoluteWeek = 30;
  state.events.active = { eventId: "family_expectation_window", occurrenceId: "depth2-family", sourceCaseId: null };
  resolveEvent(state, "commit");
  const familyCase = state.openCases.find((item) => item.eventId === "family_expectation_followup");
  state.time.absoluteWeek = familyCase.expiresWeek + 1;
  processDueOpenCases(state);
  assert.equal(familyCase.status, "resolved");
  assert.equal(state.flags.familyExpectationOpen, null);
  assert.equal(validateState(state).ok, true);
});

test("old save normalization supplies depth2 state without changing version", () => {
  const state = createNewGame();
  const old = structuredClone(state);
  delete old.player.background;
  delete old.player.tendencies;
  delete old.yearlyPlan;
  delete old.secrets;
  delete old.comparisonCircle;
  delete old.military;
  const storage = new MemoryStorage();
  storage.setItem("tc-sim-save", JSON.stringify(old));
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.state.meta.saveVersion, 5);
  assert.equal(validateState(loaded.state).ok, true);
});

test("background and social context create deterministic later divergence", () => {
  const broad = createNewGame({ socialBackground: "broad" });
  const family = createNewGame({ socialBackground: "family" });
  for (const state of [broad, family]) {
    state.social.engaged = true;
    state.time.absoluteWeek = 4;
    state.people.find((person) => person.id === "mehmet").social.lastMeaningfulContactWeek = 1;
  }
  const invitation = getEventDefinition("social_invitation");
  assert.equal(invitation.condition(broad), true);
  assert.equal(invitation.condition(family), false);
});

test("yearly priorities roll over into a bounded year-file reflection", () => {
  const state = createNewGame();
  setYearlyPriorities(state, ["career", "health"]);
  state.time.absoluteWeek = 48;
  state.time.year = 2027;
  state.time.month = 12;
  state.time.weekOfMonth = 4;
  advanceWeek(state);
  assert.equal(state.yearlyHistory.length, 1);
  assert.deepEqual(state.yearlyHistory[0].priorities, ["career", "health"]);
  assert.equal(state.yearlyHistory[0].priorityReflection.length, 2);
  assert.deepEqual(state.yearlyPlan.priorities, []);
  assert.equal(validateState(state).ok, true);
});

test("education window creates a known expiring decision and clears it", () => {
  const state = createNewGame({ educationBackground: "unfinished" });
  state.flags.depth2Enabled = true;
  state.time.absoluteWeek = 10;
  state.events.active = { eventId: "education_path_window", occurrenceId: "education-window", sourceCaseId: null };
  assert.equal(resolveEvent(state, "consider").ok, true);
  const pending = state.openCases.find((item) => item.payload?.kind === "education_window");
  assert.ok(pending);
  assert.equal(getKnownOpenCases(state).some((item) => item.id === pending.id), true);
  state.time.absoluteWeek = pending.dueWeek;
  processDueOpenCases(state);
  state.events.active = null;
  activateNextEvent(state);
  assert.equal(state.events.active.eventId, "education_window_followup");
  assert.equal(resolveEvent(state, "postpone").ok, true);
  assert.equal(pending.status, "resolved");
  assert.equal(state.flags.educationWindowOpen, null);
});

test("generic secret knowledge stays isolated until a known transfer", () => {
  const state = createNewGame();
  const secret = createSecret(state, { id: "isolated", summary: "Paylaşılmamış bir karar", relatedPeople: ["elif", "mehmet"], knownBy: ["player", "elif"] });
  assert.equal(secret.status, "exposed");
  assert.equal(isSecretKnownTo(state, "isolated", "mehmet"), false);
  assert.equal(transferSecret(state, "isolated", "mehmet", "elif"), true);
  assert.equal(isSecretKnownTo(state, "isolated", "mehmet"), true);
});

test("relationship context reads privacy, neglect, and family pressure without extra meters", () => {
  const state = createNewGame({ familyBackground: "demanding" });
  state.social.currentPartnerNpcId = "elif";
  state.people.find((person) => person.id === "elif").social.romanceStatus = "partner";
  state.time.absoluteWeek = 20;
  state.people.find((person) => person.id === "elif").social.lastMeaningfulContactWeek = 1;
  state.health.stress = 75;
  const notes = getRelationshipContext(state, "elif");
  assert.ok(notes.some((note) => note.includes("Mahremiyet")));
  assert.ok(notes.some((note) => note.includes("zaman")));
});

test("military state and job terms remain deterministic and compatible", () => {
  const state = createNewGame({ militaryApplicable: true });
  assert.equal(state.military.status, "pending");
  assert.equal(state.military.dueWeek, 96);
  const job = getEventDefinition("work_review");
  state.time.absoluteWeek = 8;
  state.career.weeksInRole = 8;
  assert.equal(job.condition(state), true);
  assert.equal(validateState(state).ok, true);
});

test("military deferment expires once without leaving a stale deadline", () => {
  const state = createNewGame({ militaryApplicable: true });
  state.time.absoluteWeek = 97;
  advanceWeek(state);
  assert.equal(state.military.status, "expired");
  assert.equal(state.military.dueWeek, null);
  assert.equal(validateState(state).ok, true);
});

test("military deferment respects an active education plan", () => {
  const state = createNewGame({ militaryApplicable: true });
  state.flags.depth2Enabled = true;
  state.education.active = { pathId: "university", intensity: "part", points: 0, targetPoints: 24 };
  state.events.active = { eventId: "military_window", occurrenceId: "military-window", sourceCaseId: null };
  assert.equal(resolveEvent(state, "defer").ok, true);
  assert.equal(state.military.status, "deferred");
  assert.equal(state.military.dueWeek, state.time.absoluteWeek + 60);
});
