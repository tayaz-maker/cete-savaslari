import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame } from "../public/games/tc-sim/js/state.js";
import { getMonthlySummary, getCostOfLivingIndex } from "../public/games/tc-sim/js/life.js";
import { activateNextEvent, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { advanceWeek } from "../public/games/tc-sim/js/time.js";

test("cost of living drift is derived, bounded and neutral at the start", () => {
  const s=createNewGame({now:"2027-01-01T00:00:00.000Z"}); const base=getMonthlySummary(s).otherExpenses;
  assert.equal(getCostOfLivingIndex(s),1); assert.equal(base,5000);
  s.time.absoluteWeek=260; assert.equal(getCostOfLivingIndex(s),1.2); assert.equal(getMonthlySummary(s).otherExpenses,6000);
  s.time.absoluteWeek=5200; assert.equal(getCostOfLivingIndex(s),1.5);
});

test("career warning schedules a real delayed review and persistent risk can end employment", () => {
  const s=createNewGame({now:"2027-01-01T00:00:00.000Z"}); s.career.performance=20; s.health.health=70;
  s.events.queue.push({ eventId: "job_security_warning", occurrenceId: "fixture-career-warning", sourceCaseId: null }); activateNextEvent(s); assert.equal(s.events.active?.eventId,"job_security_warning"); assert.equal(resolveEvent(s,"push").ok,true);
  const review=s.openCases.find(c=>c.payload?.kind === "job_security"); assert.ok(review); s.time.absoluteWeek=review.dueWeek; advanceWeek(s);
  if (!s.events.active || s.events.active.eventId !== "job_security_review") activateNextEvent(s);
  assert.equal(s.events.active?.eventId,"job_security_review"); assert.equal(resolveEvent(s,"accept_risk").ok,true); assert.equal(s.career.jobId,null);
  assert.equal(s.career.history.filter(h=>h.type === "involuntary_unemployment").length,1);
});

test("career warning recovery keeps a healthy job", () => {
  const s=createNewGame({now:"2027-01-01T00:00:00.000Z"}); const job=s.career.jobId; s.career.performance=20;
  s.events.queue.push({ eventId: "job_security_warning", occurrenceId: "fixture-career-recover", sourceCaseId: null }); activateNextEvent(s); assert.equal(resolveEvent(s,"recover").ok,true); assert.equal(s.career.jobId,job);
});
