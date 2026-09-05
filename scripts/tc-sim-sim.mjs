import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { enrollEducation, getHomeById, getJobById } from "../public/games/tc-sim/js/life.js";
import { getPathById, isEligibleForJob } from "../public/games/tc-sim/js/education.js";
import { getEraById } from "../public/games/tc-sim/js/eras.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import {
  advanceWeek,
  applyDecision,
  canApplyDecision,
  getAvailableDecisions,
} from "../public/games/tc-sim/js/time.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
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

// Varsayılan çalıştırma 3B öncesiyle birebir aynıdır; senaryolar ek argümanla açılır.
const SCENARIOS = {
  base: { label: "Genel akış", education: null },
  work: { label: "Yalnız çalışma", education: null },
  full: { label: "Tam zamanlı üniversite", education: ["university", "full"] },
  part: { label: "Çalışma + yarı zamanlı üniversite", education: ["university", "part"] },
};
const scenarioId = process.argv[2] || "base";
const scenario = SCENARIOS[scenarioId];
if (!scenario) throw new Error(`Bilinmeyen senaryo: ${scenarioId}`);

let state = createNewGame({
  name: "Simülasyon",
  profile: "balanced",
  seed: 987654,
  now: "2027-01-01T00:00:00.000Z",
});
const storage = new MemoryStorage();
let eventCount = 0;
const problems = [];
const check = (ok, message) => {
  if (!ok && !problems.includes(message)) problems.push(message);
};

if (scenario.education) {
  const enrolled = enrollEducation(state, scenario.education[0], scenario.education[1]);
  if (!enrolled.ok) throw new Error(`Senaryo kaydı başarısız: ${enrolled.reason}`);
}

for (let step = 0; step < 144; step += 1) {
  if (state.events.active) {
    const definition = getEventDefinition(state.events.active.eventId);
    const preferred =
      state.events.active.eventId === "loan_repayment" ? "collect" : definition.choices[0].id;
    if (!resolveEvent(state, preferred).ok) throw new Error("Event çözülemedi");
    eventCount += 1;
  }
  const available = getAvailableDecisions(state);
  if (!available.length) throw new Error("Karar havuzu boş kaldı");
  const first = available[(step * 2) % available.length];
  const second = available[(step * 2 + 1) % available.length];
  for (const decision of [first, second])
    if (canApplyDecision(state, decision.id).ok) applyDecision(state, decision.id);
  if (state.events.active) {
    const definition = getEventDefinition(state.events.active.eventId);
    resolveEvent(
      state,
      state.events.active.eventId === "loan_repayment" ? "collect" : definition.choices[0].id,
    );
    eventCount += 1;
  }
  const advanced = advanceWeek(state);
  if (!advanced.ok) throw new Error(advanced.messages.join(" "));
  const validation = validateState(state);
  if (!validation.ok) throw new Error(validation.errors.join("; "));
  if (
    (state.career.jobId !== null && !getJobById(state.career.jobId)) ||
    !getHomeById(state.household.homeId) ||
    !getEraById(state.world.eraId)
  )
    throw new Error("İş/konut/dönem invariantı bozuldu");
  const numericValues = [
    state.finances.balance,
    state.health.energy,
    state.health.stress,
    state.health.health,
  ];
  if (!numericValues.every(Number.isFinite)) throw new Error("Sayısal invariant bozuldu");

  // 3B invariantları — her hafta kontrol edilir.
  const active = state.education.active;
  if (active) {
    const path = getPathById(active.pathId);
    check(Boolean(path), "Geçersiz eğitim programı");
    check(
      Number.isInteger(active.progressPoints) &&
        active.progressPoints >= 0 &&
        active.progressPoints <= (path?.targetPoints ?? 0),
      "İlerleme puanı geçersiz",
    );
  }
  check(state.education.tuitionOwedThisMonth >= 0, "Eğitim borcu negatif");
  let totalExperience = 0;
  for (const weeks of Object.values(state.career.jobFamilyExperience)) {
    check(Number.isInteger(weeks) && weeks >= 0, "Deneyim tam sayı değil");
    totalExperience += weeks;
  }
  check(totalExperience <= state.time.absoluteWeek, "Deneyim geçen haftadan fazla");
  if ((step + 1) % 12 === 0) {
    const saved = saveGame(storage, state);
    if (!saved.ok) throw new Error(saved.message);
    const loaded = loadGame(storage);
    if (!loaded.ok) throw new Error(loaded.message);
    state = loaded.state;
  }
}

while (state.events.active) {
  const definition = getEventDefinition(state.events.active.eventId);
  resolveEvent(
    state,
    state.events.active.eventId === "loan_repayment" ? "collect" : definition.choices[0].id,
  );
  eventCount += 1;
}

const overdueCases = state.openCases.filter(
  (item) => item.status !== "resolved" && item.dueWeek <= state.time.absoluteWeek,
);
const completionMemories = state.memories.filter((memory) =>
  memory.text.includes("eğitimini tamamladın"),
);
// Ledger 120 kayıtla sınırlıdır, bu yüzden sayaç olarak kullanılamaz; buradaki
// kontrol pencerede kalan kayıtlar üzerinde çift tahsilat aramaktır.
const tuitionCharges = state.finances.ledger.filter(
  (entry) => entry.category === "education" && entry.reason === "Eğitim ücreti",
);
const tuitionWeeks = tuitionCharges.map((entry) => entry.week);
check(
  new Set(tuitionWeeks).size === tuitionWeeks.length,
  "Aynı ay içinde birden fazla eğitim ücreti tahsil edildi",
);
const experienceTotal = Object.values(state.career.jobFamilyExperience).reduce(
  (sum, weeks) => sum + weeks,
  0,
);

// Tamamlanma hiçbir senaryoda çiftlenemez.
check(completionMemories.length <= 1, "Eğitim birden fazla kez tamamlandı");

if (scenarioId === "work") {
  check(state.education.active === null, "Çalışma senaryosunda eğitim aktif");
  check(state.education.level === "lise", "Çalışma senaryosunda seviye değişti");
  check(experienceTotal > 100, "Çalışma senaryosunda deneyim birikmedi");
  check(tuitionCharges.length === 0, "Eğitimsiz senaryoda eğitim ücreti alındı");
}
if (scenarioId === "full") {
  check(state.education.level === "lisans", "Tam zamanlı üniversite bitmedi");
  check(state.education.fields.includes("business"), "Alan kazanılmadı");
  check(state.education.active === null, "Tamamlanan eğitim temizlenmedi");
  check(completionMemories.length === 1, "Tamamlanma kaydı tam bir kez değil");
  check(tuitionCharges.length > 0, "Eğitim ücreti hiç işlenmedi");
  // Zincirin asıl karşılığı: diploma yeni bir işi gerçekten açmalı.
  check(isEligibleForJob(state, getJobById("specialist")).ok, "Diploma yeni iş uygunluğu açmadı");
}
if (scenarioId === "part") {
  check(state.education.active !== null, "Yarı zamanlı eğitim erken bitti");
  check(state.education.active?.progressPoints === 288, "Yarı zamanlı ilerleme beklenenden farklı");
  check(experienceTotal > 100, "Yarı zamanlı senaryoda deneyim birikmedi");
  check(tuitionCharges.length > 0, "Eğitim ücreti hiç işlenmedi");
}

const serialized = JSON.stringify(state);
const result = {
  scenario: `${scenarioId} — ${scenario.label}`,
  simulatedWeeks: 144,
  yearsCompleted: state.yearlyHistory.length,
  finalDate: state.time,
  age: state.player.age,
  balance: state.finances.balance,
  health: state.health,
  eventsResolved: eventCount,
  memories: state.memories.length,
  openCases: state.openCases.length,
  overdueCases: overdueCases.length,
  saveBytes: Buffer.byteLength(serialized),
  valid: validateState(state).ok,
  jobId: state.career.jobId,
  homeId: state.household.homeId,
  eraId: state.world.eraId,
  educationLevel: state.education.level,
  educationFields: state.education.fields,
  activeEducation: state.education.active,
  tuitionCharges: tuitionCharges.length,
  jobFamilyExperience: state.career.jobFamilyExperience,
  completions: completionMemories.length,
  problems,
};

if (
  !result.valid ||
  overdueCases.length ||
  problems.length ||
  !Number.isFinite(result.balance) ||
  result.saveBytes > 200000
)
  process.exitCode = 1;
console.log(JSON.stringify(result, null, 2));
