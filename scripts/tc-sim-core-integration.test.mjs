import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame } from "../public/games/tc-sim/js/state.js";
import { createFavor, resolveFavor, markNpcMilestoneKnown, processNpcMilestones, transferNpcInformation, getPerceptionContext, getReputationContext, recordReputationEvidence } from "../public/games/tc-sim/js/depth3-systems.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { getKnownOpenCases } from "../public/games/tc-sim/js/calendar.js";

test("perception disclosure changes only the informed circle and survives further reads", () => {
  const state = createNewGame();
  state.finances.balance = 1000;
  state.time.absoluteWeek = 60;
  assert.equal(getPerceptionContext(state, "family"), "dengeli");
  assert.equal(getEventDefinition("perception_reality_gap").condition(state), true);
  state.events.active = { eventId: "perception_reality_gap", occurrenceId: "disclosure" };
  assert.equal(resolveEvent(state, "share").ok, true);
  assert.equal(getPerceptionContext(state, "family"), "baskı altında");
  assert.equal(getPerceptionContext(state, "professional"), "dengeli");
  assert.equal(getEventDefinition("perception_reality_gap").condition(state), false);
  assert.deepEqual(state.secrets.find((item) => item.id === "financial-context").knownBy, ["player", "anne"]);
});

test("professional emergency help does not tell the family; favor closes its calendar obligation", () => {
  const state = createNewGame();
  state.finances.balance = 1000;
  const favor = createFavor(state, { personId: "burak", type: "emergency-help" });
  assert.equal(getPerceptionContext(state, "family"), "dengeli");
  assert.equal(getPerceptionContext(state, "professional"), "baskı altında");
  assert.equal(getKnownOpenCases(state).length, 1);
  assert.equal(resolveFavor(state, favor.id), true);
  assert.equal(getKnownOpenCases(state).length, 0);
  assert.equal(resolveFavor(state, favor.id), false);
  assert.equal(createFavor(state, { personId: "burak", type: "emergency-help" }), null);
});

test("negative professional evidence can gate a referral and cannot be spammed in one week", () => {
  const state = createNewGame();
  recordReputationEvidence(state, "professional", "reliable", 1, "work");
  recordReputationEvidence(state, "professional", "unreliable", -3, "broken-promise");
  assert.equal(recordReputationEvidence(state, "professional", "unreliable", -3, "broken-promise"), false);
  assert.equal(getReputationContext(state, "professional").signal, "unreliable");
  state.time.absoluteWeek = 48;
  processNpcMilestones(state);
  markNpcMilestoneKnown(state, "burak", "burak-promotion");
  assert.equal(getEventDefinition("network_referral_offer").condition(state), false);
  assert.equal(getReputationContext(state, "family").signal, "distant");
});

test("milestone discovery cannot farm memory and information needs a valid source on every hop", () => {
  const state = createNewGame();
  state.time.absoluteWeek = 48;
  processNpcMilestones(state);
  assert.equal(markNpcMilestoneKnown(state, "burak", "burak-promotion"), true);
  const memories = state.memories.length;
  assert.equal(markNpcMilestoneKnown(state, "burak", "burak-promotion"), false);
  assert.equal(state.memories.length, memories);
  const information = { category: "milestone", subjectPersonId: "burak", milestoneId: "burak-promotion" };
  assert.equal(transferNpcInformation(state, { ...information, sourcePersonId: "mehmet", targetPersonId: "elif" }), false);
  assert.equal(transferNpcInformation(state, { ...information, sourcePersonId: "burak", targetPersonId: "mehmet" }), true);
  assert.equal(transferNpcInformation(state, { ...information, sourcePersonId: "burak", targetPersonId: "mehmet" }), false);
  assert.equal(transferNpcInformation(state, { ...information, sourcePersonId: "mehmet", targetPersonId: "elif" }), true);
  assert.equal(transferNpcInformation(state, { category: "invented", sourcePersonId: "mehmet", targetPersonId: "anne" }), false);
});
