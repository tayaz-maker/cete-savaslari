import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { activateNextEvent, processDueOpenCases, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { applyWeeklyLifeLoad, getNextCareerStep, promoteCareer } from "../public/games/tc-sim/js/life.js";

test("depth career progression is state-driven and records a bounded history", () => {
  const state = createNewGame({ seed: 7 });
  state.career.weeksInRole = 12;
  state.career.performance = 70;
  assert.equal(getNextCareerStep(state)?.id, "office");
  assert.equal(promoteCareer(state).ok, true);
  assert.equal(state.career.jobId, "office");
  assert.equal(state.career.history.at(-1).type, "promotion");
  assert.equal(validateState(state).ok, true);
});

test("family obligation offers agency and records either outcome", () => {
  const state = createNewGame({ seed: 7 });
  state.time.absoluteWeek = 20;
  state.career.weeksInRole = 20;
  activateNextEvent(state);
  state.events.active = { eventId: "family_obligation", occurrenceId: "test-family", sourceCaseId: null };
  resolveEvent(state, "ignore");
  assert.equal(state.people.find((person) => person.id === "baba").memories.at(-1).type, "family_obligation_missed");
});

test("career responsibility follow-up expires without leaving a pending case", () => {
  const state = createNewGame({ seed: 7 });
  state.time.absoluteWeek = 20;
  state.career.weeksInRole = 20;
  state.career.performance = 70;
  state.events.active = { eventId: "career_responsibility_offer", occurrenceId: "test-career", sourceCaseId: null };
  resolveEvent(state, "accept");
  const pending = state.openCases.find((item) => item.eventId === "career_responsibility_review");
  assert.ok(pending);
  state.time.absoluteWeek = pending.expiresWeek + 1;
  processDueOpenCases(state);
  assert.equal(pending.status, "resolved");
  assert.equal(state.openCases.filter((item) => item.status === "pending").length, 0);
  assert.equal(validateState(state).ok, true);
});

test("weekly career progress stays within bounds under critical workload", () => {
  const state = createNewGame({ seed: 7 });
  state.career.performance = 1;
  state.health.health = 10;
  state.health.stress = 90;
  applyWeeklyLifeLoad(state);
  assert.equal(state.career.performance, 0);
  assert.equal(validateState(state).ok, true);
});
