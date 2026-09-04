import test from "node:test";
import assert from "node:assert/strict";
import { SAVE_VERSION, createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { advanceWeek } from "../public/games/tc-sim/js/time.js";
import {
  acceptJobOffer,
  applyWeeklyLifeLoad,
  enrollEducation,
  getMonthlySummary,
  quitJob,
  stopEducation,
} from "../public/games/tc-sim/js/life.js";
import { getJobById } from "../public/games/tc-sim/js/catalog.js";
import {
  getCareerBand,
  getPathById,
  isEligibleForJob,
} from "../public/games/tc-sim/js/education.js";
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

const fresh = () => createNewGame({ name: "3B", seed: 11, now: "2027-01-01T00:00:00.000Z" });
const settle = (state) => {
  while (state.events.active) {
    const event = getEventDefinition(state.events.active.eventId);
    assert.equal(resolveEvent(state, event.choices[0].id).ok, true);
  }
};
const runWeeks = (state, count) => {
  for (let index = 0; index < count; index += 1) {
    settle(state);
    assert.equal(advanceWeek(state).ok, true);
    settle(state);
  }
};
/** Migration testleri için gerçek bir v3 kayıt gövdesi üretir. */
const legacyV3 = (mutate = () => {}) => {
  const raw = JSON.parse(JSON.stringify(fresh()));
  raw.meta.saveVersion = 3;
  delete raw.education;
  delete raw.career.jobFamilyExperience;
  mutate(raw);
  return raw;
};

// ---------------------------------------------------------------- eğitim

test("1. yeni oyun eğitim ve kariyer varsayılanlarıyla başlar", () => {
  const state = fresh();
  assert.deepEqual(state.education, {
    level: "lise",
    fields: [],
    active: null,
    tuitionOwedThisMonth: 0,
  });
  assert.deepEqual(state.career.jobFamilyExperience, {});
  assert.equal(validateState(state).ok, true);
});

test("2. v3 kayıt mevcut durumu koruyarak v4'e taşınır", () => {
  const raw = legacyV3((save) => {
    save.career.jobId = "courier";
    save.finances.balance = 12345;
    save.household.homeId = "shared";
    save.health.energy = 41;
    save.people[0].memories.push({ week: 2, year: 2027, text: "eski hatıra" });
    save.openCases.push({
      id: "loan-2",
      type: "friend-loan",
      createdWeek: 2,
      dueWeek: 6,
      eventId: "loan_repayment",
      status: "pending",
    });
  });
  const migrated = migrateState(raw);
  assert.equal(migrated.ok, true);
  assert.equal(migrated.state.meta.saveVersion, SAVE_VERSION);
  assert.equal(migrated.state.career.jobId, "courier");
  assert.equal(migrated.state.finances.balance, 12345);
  assert.equal(migrated.state.household.homeId, "shared");
  assert.equal(migrated.state.health.energy, 41);
  assert.equal(migrated.state.people[0].memories.length, 1);
  assert.equal(migrated.state.openCases.length, 1);
  assert.equal(migrated.state.world.eraId, "present_day");
  assert.equal(migrated.state.education.level, "lise");
  assert.deepEqual(migrated.state.career.jobFamilyExperience, {});
});

test("3. bozuk eğitim/kariyer alanları kaydı çöpe atmadan onarılır", () => {
  const raw = legacyV3((save) => {
    save.education = {
      level: "doktora",
      fields: "teknik",
      active: { pathId: "yok", intensity: "x", progressPoints: NaN },
      tuitionOwedThisMonth: -5,
    };
    save.career.jobFamilyExperience = { hizmet: -3, ofis: 2.5, "": 4 };
  });
  const migrated = migrateState(raw);
  assert.equal(migrated.ok, true);
  assert.equal(migrated.state.education.level, "lise");
  assert.deepEqual(migrated.state.education.fields, []);
  assert.equal(migrated.state.education.active, null);
  assert.equal(migrated.state.education.tuitionOwedThisMonth, 0);
  assert.deepEqual(migrated.state.career.jobFamilyExperience, { hizmet: 0, ofis: 0 });
});

test("4. yinelenen alanlar migration sırasında teke indirilir", () => {
  const raw = legacyV3((save) => {
    save.education = {
      level: "lisans",
      fields: ["technical", "technical", 7, "business"],
      active: null,
      tuitionOwedThisMonth: 0,
    };
  });
  const migrated = migrateState(raw);
  assert.equal(migrated.ok, true);
  assert.deepEqual(migrated.state.education.fields, ["technical", "business"]);
  assert.equal(migrated.state.education.level, "lisans");
});

test("5. migration aynı kayda tekrar uygulandığında state bozulmaz", () => {
  const first = migrateState(legacyV3());
  assert.equal(first.ok, true);
  const second = migrateState(JSON.parse(JSON.stringify(first.state)));
  assert.equal(second.ok, true);
  assert.deepEqual(second.state.education, first.state.education);
  assert.deepEqual(second.state.career, first.state.career);
});

test("6. kayıt ücreti anında düşer ve karar hakkı tüketmez", () => {
  const state = fresh();
  const path = getPathById("university");
  const before = state.finances.balance;
  assert.equal(enrollEducation(state, "university", "full").ok, true);
  assert.equal(state.finances.balance, before - path.enrollmentFee);
  assert.equal(state.education.active.progressPoints, 0);
  assert.equal(state.weekly.used, 0);
});

test("7. parası yetmeyen karakter kaydolamaz", () => {
  const state = fresh();
  state.finances.balance = 100;
  const result = enrollEducation(state, "university", "full");
  assert.equal(result.ok, false);
  assert.equal(state.education.active, null);
});

test("8. aynı anda ikinci bir eğitim başlatılamaz", () => {
  const state = fresh();
  state.finances.balance = 50000;
  assert.equal(enrollEducation(state, "university", "full").ok, true);
  assert.equal(enrollEducation(state, "vocational_course", "full").ok, false);
  assert.equal(state.education.active.pathId, "university");
});

test("9. geçersiz yoğunluk reddedilir", () => {
  const state = fresh();
  assert.equal(enrollEducation(state, "university", "yarım").ok, false);
  assert.equal(state.education.active, null);
});

test("10. aynı hafta ikinci kez işlenemez", () => {
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "university", "full");
  // Aynı hafta içinde ikinci çağrı guard tarafından reddedilir.
  assert.equal(applyWeeklyLifeLoad(state), true);
  assert.equal(state.education.active.progressPoints, 3);
  assert.equal(state.career.jobFamilyExperience.hizmet, 1);
  assert.equal(applyWeeklyLifeLoad(state), false);
  assert.equal(state.education.active.progressPoints, 3);
  assert.equal(state.career.jobFamilyExperience.hizmet, 1);
});

test("11. save/load turları ilerlemeyi ve deneyimi çoğaltmaz", () => {
  const storage = new MemoryStorage();
  let state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "university", "full");
  for (let week = 0; week < 4; week += 1) {
    runWeeks(state, 1);
    assert.equal(saveGame(storage, state).ok, true);
    const loaded = loadGame(storage);
    assert.equal(loaded.ok, true);
    state = loaded.state;
  }
  assert.equal(state.education.active.progressPoints, 12);
  assert.equal(state.career.jobFamilyExperience.hizmet, 4);
});

test("12. yarı zamanlı ilerleme tam sayı kalır", () => {
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "university", "part");
  runWeeks(state, 3);
  assert.equal(state.education.active.progressPoints, 6);
  assert.equal(Number.isInteger(state.education.active.progressPoints), true);
});

test("13. eğitimi bırakmak ilerlemeyi siler ve ücret iade edilmez", () => {
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "vocational_course", "full");
  runWeeks(state, 2);
  assert.equal(state.education.active.progressPoints > 0, true);
  const balanceAfterFee = state.finances.balance;
  assert.equal(stopEducation(state).ok, true);
  assert.equal(state.education.active, null);
  assert.equal(state.finances.balance, balanceAfterFee);
  const path = getPathById("vocational_course");
  const before = state.finances.balance;
  assert.equal(enrollEducation(state, "vocational_course", "full").ok, true);
  assert.equal(state.education.active.progressPoints, 0);
  assert.equal(state.finances.balance, before - path.enrollmentFee);
});

test("14. ay içinde bırakılan eğitimin ücreti yine tahsil edilir", () => {
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "vocational_course", "full");
  runWeeks(state, 1);
  assert.equal(stopEducation(state).ok, true);
  const owed = state.education.tuitionOwedThisMonth;
  assert.equal(owed, getPathById("vocational_course").monthlyTuition);
  runWeeks(state, 3); // ay sonuna kadar
  assert.equal(state.education.tuitionOwedThisMonth, 0);
  const charged = state.finances.ledger.filter(
    (entry) => entry.category === "education" && entry.reason === "Eğitim ücreti",
  );
  assert.equal(charged.length, 1);
  assert.equal(charged[0].amount, -owed);
});

test("15. eğitim ücreti ay sonunda tam bir kez tahsil edilir", () => {
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "university", "full");
  runWeeks(state, 4);
  const charges = state.finances.ledger.filter(
    (entry) => entry.category === "education" && entry.reason === "Eğitim ücreti",
  );
  assert.equal(charges.length, 1);
  assert.equal(charges[0].amount, -getPathById("university").monthlyTuition);
  assert.equal(state.education.tuitionOwedThisMonth, 0);
});

test("16. eğitimsiz ayda eğitim ücreti alınmaz", () => {
  const state = fresh();
  runWeeks(state, 8);
  assert.equal(
    state.finances.ledger.some((entry) => entry.category === "education"),
    false,
  );
});

test("17. tamamlanma tam bir kez uygulanır ve diploma kalıcıdır", () => {
  const state = fresh();
  state.finances.balance = 200000;
  enrollEducation(state, "vocational_course", "full");
  const path = getPathById("vocational_course");
  state.education.active.progressPoints = path.targetPoints - 3;
  runWeeks(state, 1);
  assert.equal(state.education.active, null);
  assert.deepEqual(state.education.fields, ["technical"]);
  runWeeks(state, 5);
  assert.deepEqual(state.education.fields, ["technical"]);
  const completions = state.memories.filter((memory) =>
    memory.text.includes("eğitimini tamamladın"),
  );
  assert.equal(completions.length, 1);
});

test("18. tamamlanma ödülü event çözülmeden de verilir", () => {
  const state = fresh();
  state.finances.balance = 200000;
  enrollEducation(state, "university", "full");
  state.education.active.progressPoints = getPathById("university").targetPoints - 3;
  assert.equal(advanceWeek(state).ok, true);
  // Event henüz çözülmedi; diploma yine de state'te olmalı.
  assert.equal(state.education.level, "lisans");
  assert.equal(state.education.fields.includes("business"), true);
  assert.equal(state.education.active, null);
});

test("19. eğitim seviyesi asla geriye düşmez", () => {
  const state = fresh();
  state.finances.balance = 200000;
  state.education.level = "lisans";
  enrollEducation(state, "vocational_course", "full");
  state.education.active.progressPoints = getPathById("vocational_course").targetPoints - 3;
  runWeeks(state, 1);
  assert.equal(state.education.level, "lisans");
});

test("20. aynı alan iki kez eklenmez", () => {
  const state = fresh();
  state.finances.balance = 200000;
  state.education.fields.push("technical");
  enrollEducation(state, "vocational_course", "full");
  state.education.active.progressPoints = getPathById("vocational_course").targetPoints - 3;
  runWeeks(state, 1);
  assert.deepEqual(state.education.fields, ["technical"]);
});

test("21. aktif eğitim haftalık beden yükünü artırır", () => {
  const withoutEducation = fresh();
  const withEducation = fresh();
  withEducation.finances.balance = 50000;
  enrollEducation(withEducation, "university", "full");
  runWeeks(withoutEducation, 1);
  runWeeks(withEducation, 1);
  assert.equal(withEducation.health.energy < withoutEducation.health.energy, true);
  assert.equal(withEducation.health.stress > withoutEducation.health.stress, true);
});

// --------------------------------------------------------------- kariyer

test("22. aktif iş her hafta yalnız kendi alanına deneyim yazar", () => {
  const state = fresh();
  runWeeks(state, 3);
  assert.equal(state.career.jobFamilyExperience.hizmet, 3);
  assert.equal(state.career.jobFamilyExperience.ofis, undefined);
});

test("23. işsiz haftalarda deneyim birikmez", () => {
  const state = fresh();
  assert.equal(quitJob(state).ok, true);
  runWeeks(state, 3);
  assert.deepEqual(state.career.jobFamilyExperience, {});
});

test("24. iş değişikliği haftasında tek alana kredi yazılır", () => {
  const state = fresh();
  runWeeks(state, 2);
  const before = { ...state.career.jobFamilyExperience };
  assert.equal(acceptJobOffer(state, "office").ok, true);
  runWeeks(state, 1); // job_start event'i bu tur içinde çözülür
  assert.equal(state.career.jobId, "office");
  const after = state.career.jobFamilyExperience;
  const gained =
    (after.hizmet || 0) - (before.hizmet || 0) + ((after.ofis || 0) - (before.ofis || 0));
  assert.equal(gained, 1);
  assert.equal(after.hizmet, (before.hizmet || 0) + 1);
  assert.equal(after.ofis, undefined);
});

test("25. kariyer bandı eşikleri doğru türetilir", () => {
  assert.equal(getCareerBand(0).id, "entry");
  assert.equal(getCareerBand(23).id, "entry");
  assert.equal(getCareerBand(24).id, "experienced");
  assert.equal(getCareerBand(71).id, "experienced");
  assert.equal(getCareerBand(72).id, "senior");
  assert.equal(getCareerBand(-4).id, "entry");
});

test("26. mevcut giriş işleri lise mezunu için açık kalır", () => {
  const state = fresh();
  for (const jobId of ["market", "courier", "office"])
    assert.equal(isEligibleForJob(state, getJobById(jobId)).ok, true, jobId);
  assert.equal(isEligibleForJob(state, getJobById("specialist")).ok, false);
  assert.equal(isEligibleForJob(state, getJobById("technician")).ok, false);
});

test("27. eğitim seviyesi gereksinimi uygulanır", () => {
  const state = fresh();
  state.education.fields.push("business");
  assert.equal(isEligibleForJob(state, getJobById("specialist")).ok, false);
  state.education.level = "lisans";
  assert.equal(isEligibleForJob(state, getJobById("specialist")).ok, true);
});

test("28. alan gereksinimi uygulanır", () => {
  const state = fresh();
  state.career.jobFamilyExperience.hizmet = 30;
  assert.equal(isEligibleForJob(state, getJobById("technician")).ok, false);
  state.education.fields.push("technical");
  assert.equal(isEligibleForJob(state, getJobById("technician")).ok, true);
});

test("29. deneyim gereksinimi uygulanır", () => {
  const state = fresh();
  state.education.fields.push("technical");
  state.career.jobFamilyExperience.hizmet = 10;
  assert.equal(isEligibleForJob(state, getJobById("technician")).ok, false);
  state.career.jobFamilyExperience.hizmet = 24;
  assert.equal(isEligibleForJob(state, getJobById("technician")).ok, true);
});

test("30. uygun olmayan iş teklifi kabul edilemez", () => {
  const state = fresh();
  const result = acceptJobOffer(state, "specialist");
  assert.equal(result.ok, false);
  assert.equal(state.career.pendingJob, null);
  assert.equal(state.weekly.used, 0);
  assert.equal(
    state.openCases.some((item) => item.type === "job-start"),
    false,
  );
});

test("31. uygunluk sağlanınca teklif kabul edilir", () => {
  const state = fresh();
  state.education.level = "lisans";
  state.education.fields.push("business");
  assert.equal(acceptJobOffer(state, "specialist").ok, true);
  assert.equal(state.career.pendingJob.jobId, "specialist");
});

test("32. fırsat event koşulu uygunluk sağlanmadan tetiklenmez", () => {
  const state = fresh();
  const definition = getEventDefinition("education_opportunity");
  assert.equal(definition.condition(state), false);
  state.education.level = "lisans";
  state.education.fields.push("business");
  assert.equal(definition.condition(state), true);
});

test("33. eğitim ve deneyim save/load turunda korunur", () => {
  const storage = new MemoryStorage();
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "university", "part");
  runWeeks(state, 5);
  assert.equal(saveGame(storage, state).ok, true);
  const loaded = loadGame(storage);
  assert.equal(loaded.ok, true);
  assert.deepEqual(loaded.state.education, state.education);
  assert.deepEqual(loaded.state.career.jobFamilyExperience, state.career.jobFamilyExperience);
  assert.equal(validateState(loaded.state).ok, true);
});

test("34. aylık özet eğitim ücretini gidere dahil eder", () => {
  const state = fresh();
  state.finances.balance = 50000;
  enrollEducation(state, "university", "full");
  runWeeks(state, 1);
  const summary = getMonthlySummary(state);
  assert.equal(summary.tuition, getPathById("university").monthlyTuition);
  assert.equal(summary.expenses, summary.housing + summary.otherExpenses + summary.tuition);
});
