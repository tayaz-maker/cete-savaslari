import test from "node:test";
import assert from "node:assert/strict";
import { SAVE_VERSION, addNpcMemory, createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";
import { getKnownOpenCases } from "../public/games/tc-sim/js/calendar.js";
import { snapshotWeekState, summarizeWeek } from "../public/games/tc-sim/js/weekly-feedback.js";
import {
  EVENT_DEFINITIONS,
  activateNextEvent,
  getChoiceEffectSummary,
  getEventDefinition,
  processDueOpenCases,
  resolveEvent,
} from "../public/games/tc-sim/js/events.js";
import { ADULT_LIFE_EVENTS } from "../public/games/tc-sim/js/adult-life-events.js";
import {
  applyRelationshipDelta,
  becomePartner,
  getRelationship,
  hasNpcMemory,
  scheduleSocialFollowup,
  setRomanticInterest,
} from "../public/games/tc-sim/js/social.js";

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

const LIFE_PREFIX = "life_";
const STANDALONE_IDS = [
  "life_mehmet_needed_you",
  "life_mehmet_new_job",
  "life_mehmet_secret",
  "life_elif_weekend_alone",
  "life_elif_shared_bill",
  "life_elif_phone",
  "life_anne_komsu_compare",
  "life_anne_elif_dinner",
  "life_baba_benzin",
  "life_baba_ask_money",
  "life_work_credit",
  "life_saturday_shift",
  "life_office_rumor",
  "life_work_mistake",
  "life_unexpected_bill",
  "life_meyhane_tab",
  "life_regret_text",
  "life_commitment_pace",
];
const CHAIN_STAGE_IDS = [
  "life_chn11_saturday_ask",
  "life_chn11_elif_waits",
  "life_chn11_elif_remembers",
  "life_chn12_anne_asks",
  "life_chn12_elif_hears",
  "life_chn12_table",
  "life_chn13_night",
  "life_chn13_morning_work",
  "life_chn13_elif_comment",
  "life_chn14_promise",
  "life_chn14_due",
  "life_chn14_after",
];
const NEW_IDS = [...STANDALONE_IDS, ...CHAIN_STAGE_IDS];
const INTERNAL_LEAK = /\b(CHN-\d+|life_chn\d+|EVENT_|FLAG_|openCase|sourceCaseId|social3D|npcMemoryAnne)\b/;

const fresh = () => createNewGame({ name: "Hayat", now: "2027-01-01T00:00:00.000Z", seed: 19 });

const bondElif = (state) => {
  setRomanticInterest(state, "elif");
  applyRelationshipDelta(state, "elif", { closeness: 40, trust: 20, tension: -10 });
};

const partnerElif = (state) => {
  bondElif(state);
  applyRelationshipDelta(state, "elif", { closeness: 40, trust: 30 });
  assert.equal(becomePartner(state, "elif"), true);
};

const giveJob = (state) => {
  if (!state.career.jobId) state.career.jobId = "market";
};

const drain = (state) => {
  while (state.events.active) {
    const definition = getEventDefinition(state.events.active.eventId);
    resolveEvent(state, definition.choices[0].id);
  }
};

const play = (state, eventId, choiceId) => {
  state.events.active = { eventId, occurrenceId: `life-${eventId}-${choiceId}` };
  const result = resolveEvent(state, choiceId);
  assert.equal(result.ok, true, `${eventId}:${choiceId}`);
  drain(state);
  return result;
};

const fireFollowup = (state, eventId) => {
  const open = state.openCases.find((item) => item.eventId === eventId && item.status !== "resolved");
  assert.ok(open, eventId);
  state.time.absoluteWeek = open.dueWeek;
  processDueOpenCases(state);
  drain(state);
  state.events.active = null;
  activateNextEvent(state);
  assert.equal(state.events.active?.eventId, eventId, eventId);
  return open;
};

test("LIFE.1 yeni olay tanımları katalogda ve benzersiz", () => {
  const ids = EVENT_DEFINITIONS.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of NEW_IDS) {
    assert.ok(getEventDefinition(id), id);
    assert.ok(ADULT_LIFE_EVENTS.some((item) => item.id === id), id);
  }
  assert.equal(STANDALONE_IDS.length, 18);
});

test("LIFE.2 seçim kimlikleri olay içinde benzersiz, özet üretir", () => {
  for (const definition of ADULT_LIFE_EVENTS) {
    const choiceIds = definition.choices.map((choice) => choice.id);
    assert.equal(new Set(choiceIds).size, choiceIds.length, definition.id);
    assert.ok(definition.choices.length >= 2, definition.id);
    for (const choice of definition.choices) {
      const summary = getChoiceEffectSummary(choice);
      assert.equal(typeof summary, "string");
      assert.ok(summary.length > 0, `${definition.id}:${choice.id}`);
    }
  }
});

test("LIFE.3 oyuncu metninde iç kimlik sızmaz", () => {
  for (const definition of ADULT_LIFE_EVENTS) {
    const blob = [definition.id, definition.title, definition.text]
      .concat(definition.choices.flatMap((choice) => [choice.id, choice.label, JSON.stringify(choice.effects || {})]))
      .join("\n");
    const playerFacing = [definition.title, definition.text]
      .concat(
        definition.choices.flatMap((choice) => [
          choice.label,
          choice.effects?.memory || "",
          choice.effects?.npcMemory?.text || "",
        ]),
      )
      .join("\n");
    assert.equal(INTERNAL_LEAK.test(playerFacing), false, definition.id);
    assert.doesNotMatch(playerFacing, /Grok|ChatGPT|Claude|LLM|prompt/i);
    void blob;
  }
});

test("LIFE.4 zincir adımları organik aramada kapalı", () => {
  const state = fresh();
  state.time.absoluteWeek = 20;
  giveJob(state);
  bondElif(state);
  const later = CHAIN_STAGE_IDS.filter((id) =>
    /_waits$|_remembers$|_hears$|_table$|_morning_work$|_elif_comment$|_due$|_after$/.test(id),
  );
  for (const id of later) {
    const definition = getEventDefinition(id);
    assert.equal(definition.condition(state), false, id);
  }
});

test("LIFE.5 temsilî olaylar makul state'te ulaşılabilir", () => {
  const state = fresh();
  state.time.absoluteWeek = 16;
  giveJob(state);
  state.finances.balance = 4000;
  bondElif(state);
  assert.equal(getEventDefinition("life_mehmet_needed_you").condition(state), true);
  assert.equal(getEventDefinition("life_mehmet_secret").condition(state), true);
  assert.equal(getEventDefinition("life_elif_weekend_alone").condition(state), true);
  assert.equal(getEventDefinition("life_anne_komsu_compare").condition(state), true);
  assert.equal(getEventDefinition("life_work_mistake").condition(state), true);
  assert.equal(getEventDefinition("life_baba_ask_money").condition(state), true);
  assert.equal(getEventDefinition("life_chn11_saturday_ask").condition(state), true);
  assert.equal(getEventDefinition("life_chn12_anne_asks").condition(state), true);
  assert.equal(getEventDefinition("life_chn13_night").condition(state), true);
  assert.equal(getEventDefinition("life_chn14_promise").condition(state), true);
  partnerElif(state);
  assert.equal(getEventDefinition("life_commitment_pace").condition(state), true);
});

test("LIFE.6 CHN-11 iş seçimi Elif'in hatırlamasını planlar", () => {
  const state = fresh();
  state.time.absoluteWeek = 12;
  giveJob(state);
  bondElif(state);
  play(state, "life_chn11_saturday_ask", "work");
  assert.equal(state.flags.chn11ChoseWork, true);
  assert.equal(hasNpcMemory(state, "elif", "chn11_chose_work"), true);
  const waits = state.openCases.find((item) => item.eventId === "life_chn11_elif_waits");
  assert.ok(waits);
  assert.equal(waits.type, "social-followup");
  assert.equal(waits.status, "pending");
  assert.equal(getKnownOpenCases(state).some((item) => item.eventId === "life_chn11_elif_waits"), false);
  fireFollowup(state, "life_chn11_elif_waits");
  play(state, "life_chn11_elif_waits", "short");
  fireFollowup(state, "life_chn11_elif_remembers");
  const trustBefore = getRelationship(state, "elif").trust;
  play(state, "life_chn11_elif_remembers", "rewrite");
  assert.equal(getRelationship(state, "elif").trust < trustBefore, true);
  assert.equal(hasNpcMemory(state, "elif", "chn11_rewrote"), true);
});

test("LIFE.7 CHN-11 Elif seçilirse bekleyen mesaj zinciri açılmaz", () => {
  const state = fresh();
  giveJob(state);
  bondElif(state);
  play(state, "life_chn11_saturday_ask", "elif");
  assert.equal(state.flags.chn11ChoseElif, true);
  assert.equal(state.openCases.some((item) => item.eventId === "life_chn11_elif_waits"), false);
});

test("LIFE.8 CHN-12 küçültme Elif'e gider, savunma sofraya atlar", () => {
  const minimized = fresh();
  minimized.time.absoluteWeek = 16;
  bondElif(minimized);
  play(minimized, "life_chn12_anne_asks", "minimize");
  assert.ok(minimized.openCases.some((item) => item.eventId === "life_chn12_elif_hears"));
  assert.equal(minimized.openCases.some((item) => item.eventId === "life_chn12_table"), false);

  const defended = fresh();
  defended.time.absoluteWeek = 16;
  bondElif(defended);
  play(defended, "life_chn12_anne_asks", "defend");
  assert.ok(defended.openCases.some((item) => item.eventId === "life_chn12_table"));
  assert.equal(defended.openCases.some((item) => item.eventId === "life_chn12_elif_hears"), false);
});

test("LIFE.9 CHN-13 gece kalınca iş ve Elif sırayla gelir", () => {
  const state = fresh();
  state.time.absoluteWeek = 10;
  giveJob(state);
  bondElif(state);
  play(state, "life_chn13_night", "stay");
  fireFollowup(state, "life_chn13_morning_work");
  play(state, "life_chn13_morning_work", "cover");
  fireFollowup(state, "life_chn13_elif_comment");
  play(state, "life_chn13_elif_comment", "soft");
  assert.equal(state.flags.chn13LiedToElif, true);
});

test("LIFE.10 CHN-13 ev seçilirse sabah iş zinciri açılmaz", () => {
  const state = fresh();
  giveJob(state);
  play(state, "life_chn13_night", "home");
  assert.equal(state.openCases.some((item) => item.eventId === "life_chn13_morning_work"), false);
});

test("LIFE.11 CHN-14 söz tutulmazsa dayı mesajı gelir", () => {
  const state = fresh();
  state.time.absoluteWeek = 8;
  play(state, "life_chn14_promise", "accept");
  const due = state.openCases.find((item) => item.eventId === "life_chn14_due");
  assert.ok(due);
  assert.equal(getKnownOpenCases(state).length, 0);
  fireFollowup(state, "life_chn14_due");
  play(state, "life_chn14_due", "bail");
  assert.equal(hasNpcMemory(state, "anne", "chn14_bailed"), true);
  fireFollowup(state, "life_chn14_after");
  play(state, "life_chn14_after", "leave");
});

test("LIFE.12 CHN-14 baştan reddedilirse pazar sabahı gelmez", () => {
  const state = fresh();
  play(state, "life_chn14_promise", "refuse");
  assert.equal(state.openCases.some((item) => item.eventId === "life_chn14_due"), false);
});

test("LIFE.13 yemek getirince anne de Elif'i hatırlar", () => {
  const state = fresh();
  bondElif(state);
  play(state, "life_anne_elif_dinner", "bring");
  assert.equal(state.flags.familyMetElifDinner, true);
  assert.equal(hasNpcMemory(state, "elif", "met_family_dinner"), true);
  assert.equal(hasNpcMemory(state, "anne", "met_elif_dinner"), true);
});

test("LIFE.14 gizli sonuç TAKVİM ve haftalık özete sızmaz", () => {
  const state = fresh();
  giveJob(state);
  bondElif(state);
  const snap = snapshotWeekState(state);
  play(state, "life_chn11_saturday_ask", "work");
  const known = getKnownOpenCases(state);
  assert.equal(known.some((item) => String(item.eventId || "").startsWith(LIFE_PREFIX)), false);
  const changes = summarizeWeek(snap, state);
  const blob = JSON.stringify(changes);
  assert.equal(/life_chn11_elif_waits/.test(blob), false);
  assert.equal(/social-followup/.test(blob), false);
});

test("LIFE.15 NPC hafızası sınırda kalır, save v5 bozulmaz", () => {
  const state = fresh();
  play(state, "life_mehmet_needed_you", "say_it");
  for (let i = 0; i < 70; i += 1) addNpcMemory(state, "mehmet", `fazla ${i}`, "needed_you_called_out");
  assert.equal(state.people.find((person) => person.id === "mehmet").memories.length, 50);
  const storage = new MemoryStorage();
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage).state;
  assert.equal(SAVE_VERSION, 5);
  assert.equal(loaded.meta.saveVersion, 5);
  assert.equal(loaded.flags.toldMehmetHeVanished, true);
  assert.equal(validateState(loaded).ok, true);
});

test("LIFE.16 mevcut 3D zincir kimlikleri duruyor", () => {
  for (const id of ["mehmet_needs_money", "promise_mehmet_reference", "elif_alone_at_home", "cousin_wedding_gold", "elif_stayed_over"]) {
    assert.ok(getEventDefinition(id), id);
  }
});

test("LIFE.sim üç tohum, 260 hafta, yeni paket görünür", () => {
  const seen = new Set();
  let chainsStarted = 0;
  const seeds = [3, 11, 29];
  for (const seed of seeds) {
    const state = createNewGame({ name: "Sim", now: "2027-01-01T00:00:00.000Z", seed });
    giveJob(state);
    bondElif(state);
    state.finances.balance = 8000;
    for (let week = 0; week < 260; week += 1) {
      state.time.absoluteWeek += 1;
      processDueOpenCases(state);
      if (!state.events.active) activateNextEvent(state);
      if (!state.events.active) continue;
      const eventId = state.events.active.eventId;
      if (NEW_IDS.includes(eventId)) seen.add(eventId);
      if (["life_chn11_saturday_ask", "life_chn12_anne_asks", "life_chn13_night", "life_chn14_promise"].includes(eventId))
        chainsStarted += 1;
      const definition = getEventDefinition(eventId);
      const choice = definition.choices[week % definition.choices.length];
      resolveEvent(state, choice.id);
      drain(state);
    }
  }
  assert.ok(seen.size >= 4, `seen ${[...seen].join(",")}`);
  void chainsStarted;
});
