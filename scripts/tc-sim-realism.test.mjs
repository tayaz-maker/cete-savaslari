import test from "node:test";
import assert from "node:assert/strict";
import { SAVE_VERSION, createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";
import {
  EVENT_DEFINITIONS,
  activateNextEvent,
  getEventDefinition,
  getChoiceEffectSummary,
  processDueOpenCases,
  resolveEvent,
} from "../public/games/tc-sim/js/events.js";
import { REALISM_EVENTS } from "../public/games/tc-sim/js/realism-events.js";
import { getKnownOpenCases } from "../public/games/tc-sim/js/calendar.js";
import {
  applyRelationshipDelta,
  becomePartner,
  getRelationship,
  hasNpcMemory,
  setRomanticInterest,
} from "../public/games/tc-sim/js/social.js";
import { recordNpcMilestone, markNpcMilestoneKnown } from "../public/games/tc-sim/js/depth3-systems.js";

class MemoryStorage {
  data = new Map();
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
}

const fresh = (opts = {}) =>
  createNewGame({ name: "Realism", now: "2027-01-01T00:00:00.000Z", seed: 17, ...opts });

const play = (state, eventId, choiceId) => {
  state.events.active = { eventId, occurrenceId: `t-${eventId}-${state.time.absoluteWeek}` };
  const result = resolveEvent(state, choiceId);
  assert.equal(result.ok, true, `${eventId}:${choiceId}`);
  while (state.events.active) {
    const definition = getEventDefinition(state.events.active.eventId);
    resolveEvent(state, definition.choices[0].id);
  }
  return result;
};

const INTERNAL = /CHN-|rl_chn|flags\.|eventId|openCases|depth[0-9]|SAVE_VERSION/;

test("REAL.1 yeni olaylar katalogda ve benzersiz", () => {
  const ids = REALISM_EVENTS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(getEventDefinition(id), id);
  assert.equal(EVENT_DEFINITIONS.filter((item) => item.id === "job_market_late_close").length, 1);
});

test("REAL.2 seçimler olay içinde benzersiz, özet üretir, iç kimlik sızmaz", () => {
  for (const definition of REALISM_EVENTS) {
    const choiceIds = definition.choices.map((choice) => choice.id);
    assert.equal(new Set(choiceIds).size, choiceIds.length, definition.id);
    const blob = [definition.title, definition.text, ...definition.choices.flatMap((choice) => [choice.label, choice.effects?.memory || ""])].join(" ");
    assert.equal(INTERNAL.test(blob), false, definition.id);
    for (const choice of definition.choices) {
      const summary = getChoiceEffectSummary(choice);
      assert.equal(typeof summary, "string");
      assert.ok(summary.length > 0);
    }
  }
});

test("REAL.3 zincir adımları organik aramada kapalı", () => {
  const state = fresh();
  state.time.absoluteWeek = 80;
  for (const definition of REALISM_EVENTS.filter((item) => item.condition.length === 0)) {
    assert.equal(definition.condition(state), false, definition.id);
  }
});

test("REAL.4 işe özel olaylar yalnız o işte açılır", () => {
  const state = fresh();
  state.time.absoluteWeek = 12;
  state.career.weeksInRole = 12;
  state.career.jobId = "market";
  assert.equal(getEventDefinition("job_market_late_close").condition(state), true);
  assert.equal(getEventDefinition("job_courier_rain").condition(state), false);
  state.career.jobId = "courier";
  assert.equal(getEventDefinition("job_courier_rain").condition(state), true);
  assert.equal(getEventDefinition("job_office_meeting").condition(state), false);
  state.career.jobId = "office";
  assert.equal(getEventDefinition("job_office_meeting").condition(state), true);
  state.career.jobId = "technician";
  assert.equal(getEventDefinition("job_tech_part").condition(state), true);
  state.career.jobId = "specialist";
  assert.equal(getEventDefinition("job_spec_dinner").condition(state), true);
});

test("REAL.5 bekâr hayatı partnerliyken açılmaz", () => {
  const state = fresh();
  state.time.absoluteWeek = 20;
  assert.equal(getEventDefinition("single_quiet_sunday").condition(state), true);
  setRomanticInterest(state, "elif");
  applyRelationshipDelta(state, "elif", { closeness: 40, trust: 25 });
  becomePartner(state, "elif");
  assert.equal(getEventDefinition("single_third_wheel").condition(state), false);
  assert.equal(getEventDefinition("single_wedding_invite").condition(state), false);
});

test("REAL.6 CHN-15 iş seçimi yemek yorumunu planlar", () => {
  const state = fresh();
  state.time.absoluteWeek = 12;
  play(state, "rl_chn15_overtime", "work");
  const comment = state.openCases.find((item) => item.eventId === "rl_chn15_comment");
  assert.ok(comment);
  assert.equal(comment.type, "social-followup");
  assert.equal(getKnownOpenCases(state).some((item) => item.eventId === "rl_chn15_comment"), false);
  state.time.absoluteWeek = comment.dueWeek;
  processDueOpenCases(state);
  play(state, "rl_chn15_comment", "soft");
  const later = state.openCases.find((item) => item.eventId === "rl_chn15_later");
  assert.ok(later);
  state.time.absoluteWeek = later.dueWeek;
  processDueOpenCases(state);
  play(state, "rl_chn15_later", "accept");
  assert.equal(hasNpcMemory(state, "anne", "chn15_dropped"), true);
});

test("REAL.7 CHN-15 ev seçilirse yorum zinciri açılmaz", () => {
  const state = fresh();
  play(state, "rl_chn15_overtime", "home");
  assert.equal(state.openCases.some((item) => item.eventId === "rl_chn15_comment"), false);
});

test("REAL.8 CHN-16 bekleme komşu ve depozitoya gider", () => {
  const state = fresh();
  state.household.homeId = "studio";
  state.time.absoluteWeek = 14;
  play(state, "rl_chn16_repair", "wait");
  const neighbor = state.openCases.find((item) => item.eventId === "rl_chn16_neighbor");
  assert.ok(neighbor);
  state.time.absoluteWeek = neighbor.dueWeek;
  processDueOpenCases(state);
  play(state, "rl_chn16_neighbor", "admit");
  const deposit = state.openCases.find((item) => item.eventId === "rl_chn16_deposit");
  assert.ok(deposit);
});

test("REAL.9 CHN-16 usta çağrılırsa komşu zinciri açılmaz", () => {
  const state = fresh();
  state.household.homeId = "studio";
  play(state, "rl_chn16_repair", "fix");
  assert.equal(state.openCases.some((item) => item.eventId === "rl_chn16_neighbor"), false);
});

test("REAL.10 işsizlik bağlantısı görüşmeyi açar", () => {
  const state = fresh();
  state.career.jobId = null;
  state.time.absoluteWeek = 10;
  play(state, "jobless_mehmet_lead", "take");
  assert.equal(state.flags.askedMehmetJobLead, true);
  play(state, "rl_chn17_lead", "go");
  const result = state.openCases.find((item) => item.eventId === "rl_chn17_result");
  assert.ok(result);
  state.time.absoluteWeek = result.dueWeek;
  processDueOpenCases(state);
  play(state, "rl_chn17_result", "tell");
  assert.ok(state.openCases.some((item) => item.eventId === "rl_chn17_family"));
});

test("REAL.11 CHN-18 skip story ve sonraki daveti planlar", () => {
  const state = fresh();
  state.time.absoluteWeek = 14;
  state.finances.balance = 2000;
  play(state, "rl_chn18_trip", "skip");
  const story = state.openCases.find((item) => item.eventId === "rl_chn18_story");
  assert.ok(story);
  state.time.absoluteWeek = story.dueWeek;
  processDueOpenCases(state);
  play(state, "rl_chn18_story", "like");
  assert.ok(state.openCases.some((item) => item.eventId === "rl_chn18_next"));
});

test("REAL.12 milestone bilinmeden Selin kutusu açılmaz", () => {
  const state = fresh();
  state.time.absoluteWeek = 80;
  assert.equal(getEventDefinition("weak_selin_favor").condition(state), false);
  recordNpcMilestone(state, "selin", { id: "selin-moved", type: "housing", text: "Selin kendi düzenini kurdu." });
  markNpcMilestoneKnown(state, "selin", "selin-moved");
  assert.equal(getEventDefinition("weak_selin_favor").condition(state), true);
});

test("REAL.13 gizli sonuç TAKVİM'e sızmaz, save v5 bozulmaz", () => {
  const state = fresh();
  play(state, "rl_chn15_overtime", "work");
  assert.equal(getKnownOpenCases(state).length, 0);
  const storage = new MemoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.equal(SAVE_VERSION, 5);
  assert.equal(loaded.state.meta.saveVersion, 5);
  assert.equal(loaded.state.flags.chn15ChoseWork, true);
  assert.equal(loaded.state.openCases.find((item) => item.eventId === "rl_chn15_comment").status, "pending");
  assert.equal(validateState(loaded.state).ok, true);
});

test("REAL.14 emeklilik sabahı yalnız emeklide açılır", () => {
  const state = fresh();
  state.time.absoluteWeek = 10;
  assert.equal(getEventDefinition("retire_morning").condition(state), false);
  state.career.retirement = { status: "retired", retiredWeek: 400, monthlyIncome: 6000, lastJobId: "office" };
  assert.equal(getEventDefinition("retire_morning").condition(state), true);
});

test("REAL.sim üç tohum, 260 hafta, paket görünür", () => {
  const seen = new Set();
  for (const seed of [5, 13, 21]) {
    const state = fresh({ seed });
    setRomanticInterest(state, "elif");
    applyRelationshipDelta(state, "elif", { closeness: 30, trust: 15 });
    state.finances.balance = 7000;
    for (let week = 0; week < 260; week += 1) {
      state.time.absoluteWeek += 1;
      processDueOpenCases(state);
      if (!state.events.active) activateNextEvent(state);
      if (!state.events.active) continue;
      const id = state.events.active.eventId;
      if (REALISM_EVENTS.some((item) => item.id === id)) seen.add(id);
      const definition = getEventDefinition(id);
      resolveEvent(state, definition.choices[week % definition.choices.length].id);
      while (state.events.active) {
        const next = getEventDefinition(state.events.active.eventId);
        resolveEvent(state, next.choices[0].id);
      }
    }
    assert.equal(validateState(state).ok, true);
  }
  assert.ok(seen.size >= 5, `seen ${seen.size}`);
});
