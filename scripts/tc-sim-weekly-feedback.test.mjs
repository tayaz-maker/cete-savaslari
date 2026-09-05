import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame } from "../public/games/tc-sim/js/state.js";
import { transact, adjustHealth } from "../public/games/tc-sim/js/state.js";
import {
  applyRelationshipDelta,
  createSocialObligation,
  scheduleSocialFollowup,
} from "../public/games/tc-sim/js/social.js";
import { snapshotWeekState, summarizeWeek } from "../public/games/tc-sim/js/weekly-feedback.js";

const fresh = () => createNewGame({ name: "Feedback", now: "2027-01-01T00:00:00.000Z", seed: 21 });

test("sessiz bir haftada hiçbir değişiklik döndürülmez", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  assert.deepEqual(summarizeWeek(before, state), []);
});

test("para değişimi doğru tutarla döner", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  transact(state, -1850, "Test gideri", "test");
  const changes = summarizeWeek(before, state);
  assert.deepEqual(
    changes.find((c) => c.kind === "money"),
    { kind: "money", amount: -1850 },
  );
});

test("beden değişimi yalnız değişen eksenlerde döner, değişmeyenler görünmez", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  adjustHealth(state, { energy: -14 });
  const changes = summarizeWeek(before, state);
  const body = changes.filter((c) => c.kind === "body");
  assert.equal(body.length, 1);
  assert.equal(body[0].axis, "energy");
  assert.equal(body[0].from, before.health.energy);
  assert.equal(body[0].to, state.health.energy);
});

test("küçük/gürültülü ilişki değişimi eşik altında kalırsa gösterilmez", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  applyRelationshipDelta(state, "mehmet", { closeness: 1 });
  const changes = summarizeWeek(before, state);
  assert.equal(changes.some((c) => c.kind === "relationship"), false);
});

test("anlamlı ilişki değişimi doğru yön ve eksenle döner", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  applyRelationshipDelta(state, "mehmet", { tension: 8 });
  const changes = summarizeWeek(before, state);
  const relationship = changes.find((c) => c.kind === "relationship" && c.personId === "mehmet");
  assert.ok(relationship);
  assert.equal(relationship.axis, "tension");
  assert.equal(relationship.direction, "up");
});

test("bilinen bir yükümlülük (social-obligation) yeni olarak yakalanır", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  assert.equal(createSocialObligation(state, "mehmet"), true);
  const changes = summarizeWeek(before, state);
  const obligation = changes.find((c) => c.kind === "obligation");
  assert.ok(obligation);
  assert.equal(obligation.case.type, "social-obligation");
});

test("gizli gecikmeli sosyal sonuç (social-followup) haftalık özette asla görünmez", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  assert.equal(
    scheduleSocialFollowup(state, {
      eventId: "debt_elif_comment",
      dueWeek: state.time.absoluteWeek + 6,
      personId: "elif",
    }),
    true,
  );
  const changes = summarizeWeek(before, state);
  assert.equal(changes.some((c) => c.kind === "obligation"), false);
});

test("en fazla altı değişiklik döner, öncelik parayla başlar", () => {
  const state = fresh();
  const before = snapshotWeekState(state);
  transact(state, -500, "Test", "test");
  adjustHealth(state, { energy: -10, stress: 8, health: -3 });
  applyRelationshipDelta(state, "mehmet", { tension: 10 });
  applyRelationshipDelta(state, "elif", { closeness: 10 });
  applyRelationshipDelta(state, "anne", { trust: -10 });
  createSocialObligation(state, "mehmet");
  const changes = summarizeWeek(before, state);
  assert.ok(changes.length <= 6);
  assert.equal(changes[0].kind, "money");
});
