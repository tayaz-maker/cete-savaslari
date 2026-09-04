import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import {
  activateNextEvent,
  getEventDefinition,
  resolveEvent,
} from "../public/games/tc-sim/js/events.js";
import { advanceWeek } from "../public/games/tc-sim/js/time.js";
import {
  acceptJobOffer,
  applyWeeklyLifeLoad,
  getCommuteLoad,
  getMonthlySummary,
  moveHome,
  quitJob,
} from "../public/games/tc-sim/js/life.js";
import { loadGame, migrateState, saveGame } from "../public/games/tc-sim/js/save.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.get(key) ?? null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
}
const fresh = () => createNewGame({ name: "3A", seed: 7, now: "2027-01-01T00:00:00.000Z" });
const settle = (state) => {
  while (state.events.active) {
    const event = getEventDefinition(state.events.active.eventId);
    assert.equal(resolveEvent(state, event.choices[0].id).ok, true);
  }
};

test("3A.1 job/home kimlikleri doğrulanır; işsizlik geçerlidir", () => {
  const state = fresh();
  state.career.jobId = null;
  assert.equal(validateState(state).ok, true);
  state.career.jobId = "hayalet";
  assert.equal(validateState(state).ok, false);
  state.career.jobId = null;
  state.household.homeId = "hayalet";
  assert.equal(validateState(state).ok, false);
});

test("3A.2 commute ev ve iş kombinasyonundan türetilir; işsizken sıfırdır", () => {
  assert.notEqual(getCommuteLoad("family", "market"), getCommuteLoad("family", "courier"));
  assert.notEqual(getCommuteLoad("family", "courier"), getCommuteLoad("studio", "courier"));
  assert.equal(getCommuteLoad("studio", null), 0);
});

test("3A.3 haftalık iş yükü tam bir kez uygulanır ve sınırlar korunur", () => {
  const state = fresh();
  state.career.jobId = "courier";
  const before = { ...state.health };
  assert.equal(applyWeeklyLifeLoad(state), true);
  const once = { ...state.health };
  assert.equal(applyWeeklyLifeLoad(state), false);
  assert.deepEqual(state.health, once);
  assert.notDeepEqual(state.health, before);
  assert.equal(validateState(state).ok, true);
});

test("3A.4 maaş, kira ve diğer giderler ayda tam bir kez uygulanır", () => {
  const state = fresh();
  const summary = getMonthlySummary(state);
  const start = state.finances.balance;
  for (let i = 0; i < 4; i += 1) {
    settle(state);
    advanceWeek(state);
  }
  assert.equal(state.finances.balance, start + summary.income - summary.expenses);
  assert.equal(state.finances.ledger.filter((x) => x.reason === "Aylık maaş").length, 1);
  assert.equal(state.finances.ledger.filter((x) => x.reason === "Aylık konut gideri").length, 1);
  assert.equal(
    state.finances.ledger.some((x) => x.reason === "Diğer düzenli gider"),
    true,
  );
});

test("3A.5 işsiz maaş almaz ama konut gideri öder", () => {
  const state = fresh();
  state.career.jobId = null;
  const start = state.finances.balance;
  for (let i = 0; i < 4; i += 1) {
    settle(state);
    advanceWeek(state);
  }
  assert.equal(state.finances.balance, start - 6500);
  assert.equal(
    state.finances.ledger.some((x) => x.reason === "Aylık maaş"),
    false,
  );
});

test("3A.6 teklif gecikmeli başlar, pending save/load ile korunur ve hopping engellenir", () => {
  const state = fresh();
  assert.equal(acceptJobOffer(state, "office").ok, true);
  assert.equal(state.career.jobId, "market");
  assert.equal(acceptJobOffer(state, "courier").ok, false);
  const storage = new MemoryStorage();
  saveGame(storage, state);
  const loaded = loadGame(storage).state;
  assert.equal(loaded.career.pendingJob.jobId, "office");
  advanceWeek(loaded);
  assert.equal(loaded.events.active.eventId, "job_start");
  assert.equal(resolveEvent(loaded, "start").ok, true);
  assert.equal(loaded.career.jobId, "office");
  assert.equal(loaded.career.pendingJob, null);
});

test("3A.7 iş bırakma null state üretir ve karar hakkı kullanır", () => {
  const state = fresh();
  assert.equal(quitJob(state).ok, true);
  assert.equal(state.career.jobId, null);
  assert.equal(state.weekly.used, 1);
  assert.equal(quitJob(state).ok, false);
});

test("3A.8 başarısız taşınma atomiktir", () => {
  const state = fresh();
  state.finances.balance = 100;
  const before = structuredClone(state);
  assert.equal(moveHome(state, "studio").ok, false);
  assert.equal(state.household.homeId, before.household.homeId);
  assert.equal(state.finances.balance, before.finances.balance);
  assert.equal(state.weekly.used, 0);
});

test("3A.9 başarılı taşınma maliyeti bir kez uygular ve save/load korunur", () => {
  const state = fresh();
  const start = state.finances.balance;
  assert.equal(moveHome(state, "shared").ok, true);
  assert.equal(state.finances.balance, start - 2400);
  assert.equal(moveHome(state, "shared").ok, false);
  const storage = new MemoryStorage();
  saveGame(storage, state);
  assert.equal(loadGame(storage).state.household.homeId, "shared");
});

test("3A.10 eski save veri kaybetmeden v2'ye migrate olur ve round-trip geçer", () => {
  const legacy = fresh();
  legacy.meta.saveVersion = 1;
  legacy.finances = { balance: 4321, monthlyIncome: 9000, monthlyExpenses: 6500, ledger: [] };
  legacy.career = { title: "Kafe servis elemanı", status: "employed" };
  legacy.household = { housing: "Aile evi", livingWithFamily: true };
  legacy.memories.push({
    id: "m-old",
    week: 1,
    year: 2027,
    text: "Korunmalı",
    importance: "normal",
  });
  legacy.openCases.push({
    id: "old-case",
    dueWeek: 99,
    eventId: "loan_repayment",
    status: "pending",
  });
  const migrated = migrateState(legacy);
  assert.equal(migrated.ok, true);
  assert.equal(migrated.state.finances.balance, 4321);
  assert.equal(migrated.state.memories.at(-1).text, "Korunmalı");
  assert.equal(migrated.state.openCases.at(-1).id, "old-case");
  assert.equal(migrated.state.career.jobId, "market");
  assert.equal(migrated.state.household.homeId, "family");
  const storage = new MemoryStorage();
  saveGame(storage, migrated.state);
  assert.equal(loadGame(storage).ok, true);
});

test("3A.11 kritik yeni eventler yalnız doğru bağlamda tetiklenir", () => {
  const state = fresh();
  state.events.seen.push("family_budget_talk", "burnout_warning");
  state.career.jobId = "courier";
  state.health.stress = 70;
  activateNextEvent(state);
  assert.equal(state.events.active.eventId, "job_pressure");
  settle(state);
  const clean = fresh();
  clean.events.seen.push("family_budget_talk", "burnout_warning");
  clean.career.jobId = "courier";
  clean.health.stress = 20;
  activateNextEvent(clean);
  assert.notEqual(clean.events.active?.eventId, "job_pressure");
});
