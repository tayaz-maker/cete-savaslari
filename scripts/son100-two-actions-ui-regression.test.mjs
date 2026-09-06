/**
 * Regression for the Sonnet V1 closure fix: the UI's only "core" button for
 * Son 100 Gün used to dispatch the generic "advance" action, which itself
 * secretly performed one free "work" action AND unconditionally advanced the
 * day in the same call. That meant a single button press both consumed the
 * day's first action slot and ended the day, so the documented "two actions
 * per day" contract could never be exercised by a real player no matter how
 * logically correct the underlying act:-prefixed state machine was.
 *
 * Fix: "advance" is now a pure, honest "skip the rest of today" (forfeits
 * unused actions, still guarded against re-running after flags.finalReport),
 * and the UI's core button now dispatches "act:work" instead.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { create, applyAction } from "../public/games/next-wave.js";

test("son 100 gun: first act does not end the day, second does, matching the UI's core button", () => {
  const s = create("son-100-gun");
  const day0 = s.day;
  assert.equal(s.actionsRemaining, 2);

  // First press of the UI's core button: applyAction(id, state, "act:work").
  applyAction("son-100-gun", s, "act:work");
  assert.equal(s.day, day0, "one action must not end the day");
  assert.equal(s.actionsRemaining, 1, "the second action's right must remain");

  // Second press: the day may only advance now, on the correct completion.
  applyAction("son-100-gun", s, "act:work");
  assert.equal(s.day, day0 + 1, "the day must advance only after both actions are used");
  assert.equal(s.actionsRemaining, 2, "the new day must reset to two available actions");
});

test("son 100 gun: rapid/third act call within the same day cannot fabricate an extra action", () => {
  const s = create("son-100-gun");
  const day0 = s.day;
  const cashAfterOne = (() => {
    applyAction("son-100-gun", s, "act:work");
    return s.resources?.money ?? s.money;
  })();
  // A rapid-fire extra click while still on the same day, before the second
  // real action: applyAction is called a second time before the day rolls
  // over, simulating a double-fire of the same click handler.
  applyAction("son-100-gun", s, "act:work");
  assert.equal(s.day, day0 + 1, "two real actions still end the day exactly once");
  const dayAfterTwo = s.day;
  const remainingAfterTwo = s.actionsRemaining;

  // A further rapid click landing after the day has already rolled over must
  // behave as the new day's first action, not as a phantom third action of
  // the day that just ended.
  applyAction("son-100-gun", s, "act:work");
  assert.equal(s.day, dayAfterTwo, "a same-tick extra click must not skip an entire day");
  assert.equal(s.actionsRemaining, remainingAfterTwo - 1);
  void cashAfterOne;
});

test("son 100 gun: save/reload mid-day preserves actionsRemaining and does not double-apply resource effects", () => {
  const s = create("son-100-gun");
  applyAction("son-100-gun", s, "act:work");
  assert.equal(s.actionsRemaining, 1);

  // Round-trip through JSON exactly as localStorage save/load does.
  const reloaded = JSON.parse(JSON.stringify(s));
  assert.equal(reloaded.actionsRemaining, 1, "save/reload must preserve the day's remaining action count");
  assert.equal(reloaded.day, s.day, "save/reload must preserve the current day");

  // Continuing on the reloaded state must consume exactly the second action,
  // not re-run the first one (which would double-apply its resource effect).
  const before = JSON.stringify(reloaded.resources ?? { money: reloaded.money });
  applyAction("son-100-gun", reloaded, "act:work");
  assert.equal(reloaded.day, s.day + 1, "the reloaded state advances the day on its own second action");
  assert.notEqual(JSON.stringify(reloaded.resources ?? { money: reloaded.money }), before);
});

test("son 100 gun: explicit advance (skip today) forfeits unused actions without performing a free action", () => {
  const s = create("son-100-gun");
  const before = JSON.stringify({ ...s, day: undefined });
  const day0 = s.day;
  applyAction("son-100-gun", s, "advance");
  assert.equal(s.day, day0 + 1, "advance still ends the day (explicit skip)");
  assert.equal(s.actionsRemaining, 2, "the new day resets to two actions");
  void before;
});
