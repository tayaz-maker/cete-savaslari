import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { advanceWeek } from "../public/games/tc-sim/js/time.js";
import { activateNextEvent, getEventDefinition, processDueOpenCases, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { canNpcReactToInformation, createFavor, DEPTH3_CHAIN_REGISTRY, getDepth3ChainByEvent, getRealityPerceptionGap, getReputationContext, markNpcMilestoneKnown, processNpcMilestones, recordNpcMilestone, recordReputationEvidence, resolveFavor, transferNpcInformation, updatePerceivedIdentity } from "../public/games/tc-sim/js/depth3-systems.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";
import { moveHome } from "../public/games/tc-sim/js/life.js";
class MemoryStorage { constructor() { this.data = new Map(); } getItem(k) { return this.data.get(k) ?? null; } setItem(k, v) { this.data.set(k, String(v)); } }

test("depth3 roster and state normalize without changing save version", () => {
  const state = createNewGame();
  assert.deepEqual(state.people.map((person) => person.id), ["anne", "baba", "mehmet", "elif", "selin", "emre", "burak"]);
  assert.equal(validateState(state).ok, true);
  const storage = new MemoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage);
  assert.equal(loaded.state.meta.saveVersion, 5);
  assert.equal(validateState(loaded.state).ok, true);
});

test("NPC milestones are deterministic, bounded, and player knowledge is separate", () => {
  const state = createNewGame();
  state.time.absoluteWeek = 48;
  processNpcMilestones(state);
  assert.ok(state.people.find((person) => person.id === "selin").lifeMilestones.some((item) => item.id === "selin-job"));
  assert.equal(state.people.find((person) => person.id === "selin").knownMilestones.length, 0);
  assert.equal(markNpcMilestoneKnown(state, "selin", "selin-job"), true);
  assert.deepEqual(state.people.find((person) => person.id === "selin").knownMilestones, ["selin-job"]);
});

test("favor reciprocity is person-specific and resolves only once", () => {
  const state = createNewGame();
  const favor = createFavor(state, { personId: "burak", type: "referral" });
  assert.ok(favor);
  assert.equal(state.openCases.some((item) => item.type === "favor-obligation"), true);
  assert.equal(resolveFavor(state, favor.id, "fulfilled"), true);
  assert.equal(resolveFavor(state, favor.id, "fulfilled"), false);
  assert.equal(state.favors[0].status, "resolved");
});

test("favor, reputation, and known milestone survive a save round-trip", () => {
  const state = createNewGame();
  state.time.absoluteWeek = 48;
  processNpcMilestones(state);
  markNpcMilestoneKnown(state, "burak", "burak-promotion");
  createFavor(state, { personId: "selin", type: "housing" });
  recordReputationEvidence(state, "friends", "helpful", 2);
  const storage = new MemoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage).state;
  assert.equal(loaded.favors.length, 1);
  assert.equal(loaded.reputation.evidence.some((item) => item.circle === "friends"), true);
  assert.equal(loaded.people.find((person) => person.id === "burak").knownMilestones.includes("burak-promotion"), true);
});

test("reputation remains layered by circle", () => {
  const state = createNewGame();
  recordReputationEvidence(state, "professional", "reliable", 2);
  recordReputationEvidence(state, "family", "distant", -1);
  assert.equal(getReputationContext(state, "professional").signal, "reliable");
  assert.equal(getReputationContext(state, "family").signal, "distant");
});

test("perception context can diverge from financial reality", () => {
  const state = createNewGame();
  state.finances.balance = 1200;
  state.household.homeId = "family";
  updatePerceivedIdentity(state);
  const gap = getRealityPerceptionGap(state, "family");
  assert.equal(gap.gap, true);
});

test("depth3 referral chain requires known milestone and resolves its favor", () => {
  const state = createNewGame();
  state.flags.depth2Enabled = true;
  state.flags.depth3Enabled = true;
  state.time.absoluteWeek = 48;
  processNpcMilestones(state);
  markNpcMilestoneKnown(state, "burak", "burak-promotion");
  const definition = getEventDefinition("network_referral_offer");
  assert.equal(definition.condition(state), true);
  state.events.active = { eventId: definition.id, occurrenceId: "depth3-referral", sourceCaseId: null };
  assert.equal(resolveEvent(state, "consider").ok, true);
  const pending = state.openCases.find((item) => item.eventId === "network_referral_followup");
  assert.ok(pending);
  state.time.absoluteWeek = pending.dueWeek;
  processDueOpenCases(state);
  state.events.active = null;
  activateNextEvent(state);
  assert.equal(state.events.active.eventId, "network_favor_due");
  assert.equal(resolveEvent(state, "fulfill").ok, true);
  assert.equal(state.events.active.eventId, "network_referral_followup");
  assert.equal(resolveEvent(state, "show_up").ok, true);
  assert.equal(state.favors.some((item) => item.type === "referral" && item.status === "resolved"), true);
});

test("old save without depth3 fields normalizes safely", () => {
  const state = createNewGame();
  const old = structuredClone(state);
  delete old.favors; delete old.reputation; delete old.perception;
  old.people.forEach((person) => { delete person.circles; delete person.lifeState; delete person.lifeMilestones; delete person.knownMilestones; });
  const storage = new MemoryStorage();
  storage.setItem("tc-sim-save", JSON.stringify(old));
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.equal(validateState(loaded.state).ok, true);
});

test("NPC information transfer reaches B but not unrelated C", () => {
  const state = createNewGame();
  state.time.absoluteWeek = 48;
  processNpcMilestones(state);
  const a = state.people.find((p) => p.id === "burak");
  const b = state.people.find((p) => p.id === "mehmet");
  const c = state.people.find((p) => p.id === "elif");
  assert.equal(a.knownMilestones.includes("burak-promotion"), false);
  markNpcMilestoneKnown(state, "burak", "burak-promotion");
  assert.equal(canNpcReactToInformation(state, b.id, "milestone", a.id, "burak-promotion"), false);
  assert.equal(transferNpcInformation(state, { category: "milestone", subjectPersonId: a.id, sourcePersonId: a.id, targetPersonId: b.id, milestoneId: "burak-promotion" }), true);
  assert.equal(canNpcReactToInformation(state, b.id, "milestone", a.id, "burak-promotion"), true);
  assert.equal(canNpcReactToInformation(state, c.id, "milestone", a.id, "burak-promotion"), false);
});

test("move schedules one explicit social follow-up and resolves it", () => {
  const state = createNewGame();
  state.flags.depth3Enabled = true;
  state.finances.balance = 100000;
  assert.equal(moveHome(state, "studio").ok, true);
  const item = state.openCases.find((entry) => entry.eventId === "housing_move_followup");
  assert.ok(item);
  assert.equal(item.payload.fromHomeId, "family");
  assert.equal(item.payload.toHomeId, "studio");
});

test("emergency favor discloses financial strain only to helper", () => {
  const state = createNewGame();
  state.finances.balance = 1000;
  const favor = createFavor(state, { personId: "anne", type: "emergency-help" });
  assert.ok(favor);
  assert.equal(state.people.find((p) => p.id === "anne").memories.some((m) => m.type === "financial_disclosure"), true);
  assert.equal(state.people.find((p) => p.id === "baba").memories.some((m) => m.type === "financial_disclosure"), false);
  assert.equal(state.perception.circles.family, "baskı altında");
});

test("family perception flow has one canonical explicit chain registration", () => {
  assert.equal(DEPTH3_CHAIN_REGISTRY.FAMILY_PERCEPTION.id, "CHN-19");
  assert.equal(getDepth3ChainByEvent("perception_reality_gap").id, "CHN-19");
  assert.equal(Object.values(DEPTH3_CHAIN_REGISTRY).filter((chain) => chain.eventId === "perception_reality_gap").length, 1);
});

test("active housing chain identity survives save/load without schema change", () => {
  const state = createNewGame();
  state.openCases.push({ id: "legacy-gap", type: "depth3-followup", eventId: "perception_reality_gap", status: "pending", createdWeek: 1, dueWeek: 3 });
  const storage = new MemoryStorage();
  saveGame(storage, state);
  const loaded = loadGame(storage).state;
  assert.equal(getDepth3ChainByEvent(loaded.openCases[0].eventId).id, "CHN-19");
  assert.equal(loaded.meta.saveVersion, 5);
});
