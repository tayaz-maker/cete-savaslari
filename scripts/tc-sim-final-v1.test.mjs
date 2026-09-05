import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, getStartingProfileId } from "../public/games/tc-sim/js/state.js";
import { advanceWeek } from "../public/games/tc-sim/js/time.js";
import { EVENT_DEFINITIONS } from "../public/games/tc-sim/js/events.js";

test("V1 profile context remains stable without adding save fields", () => {
  assert.equal(getStartingProfileId(createNewGame({ profile: "ambitious" })), "ambitious");
  assert.equal(getStartingProfileId(createNewGame({ profile: "social" })), "social");
  assert.equal(getStartingProfileId(createNewGame()), "balanced");
  assert.equal(createNewGame().meta.saveVersion, 5);
});

test("V1 year file stores a compact life snapshot at year close", () => {
  const state = createNewGame({ now: "2027-01-01T00:00:00.000Z", seed: 7 });
  for (let week = 0; week < 48; week += 1) {
    const result = advanceWeek(state);
    assert.equal(result.ok, true);
    while (state.events.active) state.events.active = null;
  }
  assert.equal(state.yearlyHistory.length, 1);
  const year = state.yearlyHistory[0];
  assert.equal(year.year, 2027);
  assert.equal(typeof year.career, "object");
  assert.equal(typeof year.education, "object");
  assert.equal(typeof year.health, "object");
  assert.equal(typeof year.housing, "object");
  assert.equal(Number.isInteger(year.knownObligations), true);
});

test("study workload pressure uses a surgical long-game cooldown", () => {
  const event = EVENT_DEFINITIONS.find((item) => item.id === "study_workload_pressure");
  assert.equal(event?.cooldownWeeks, 16);
});
