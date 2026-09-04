import { getHomeById, getJobById } from "./catalog.js";
import { PRESENT_DAY_ERA_ID, getEraById } from "./eras.js";
import { isEducationLevel, isValidActiveEducation } from "./education.js";

export const SAVE_VERSION = 4;
export const WEEKS_PER_MONTH = 4;
export const MONTHS_PER_YEAR = 12;
export const WEEKLY_ACTIVITY_LIMIT = 2;

const LIMITS = {
  memories: 200,
  npcMemories: 50,
  eventHistory: 200,
  yearlyHistory: 80,
};

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Number(value)));
}

export function appendCapped(list, item, limit) {
  list.push(item);
  if (list.length > limit) list.splice(0, list.length - limit);
}

function profileSettings(profile) {
  const profiles = {
    balanced: { label: "Dengeli başlangıç", balance: 5000, energy: 76, stress: 24 },
    ambitious: { label: "Hırslı başlangıç", balance: 6500, energy: 68, stress: 34 },
    social: { label: "Sosyal başlangıç", balance: 4000, energy: 80, stress: 20 },
  };
  return profiles[profile] || profiles.balanced;
}

export function createNewGame(options = {}) {
  const profile = profileSettings(options.profile);
  const now = options.now || new Date().toISOString();
  const seed = Number.isInteger(options.seed) ? options.seed >>> 0 : 20270101;
  const socialBonus = options.profile === "social" ? 6 : 0;

  return {
    meta: {
      saveVersion: SAVE_VERSION,
      gameId: options.gameId || `tc-${seed}-${String(options.name || "oyuncu").length}`,
      createdAt: now,
      updatedAt: now,
      rngState: seed || 1,
      yearStartBalance: profile.balance,
      yearStartRelationships: {
        anne: 70 + socialBonus,
        baba: 64,
        mehmet: 52 + socialBonus,
        elif: 38,
      },
    },
    player: {
      name:
        String(options.name || "Deniz")
          .trim()
          .slice(0, 40) || "Deniz",
      gender: ["woman", "man", "unspecified"].includes(options.gender)
        ? options.gender
        : "unspecified",
      profile: profile.label,
      age: 18,
      city: "İstanbul",
    },
    world: { eraId: getEraById(options.eraId)?.id || PRESENT_DAY_ERA_ID },
    time: { year: 2027, month: 1, weekOfMonth: 1, absoluteWeek: 1 },
    finances: {
      balance: profile.balance,
      otherMonthlyIncome: 0,
      otherMonthlyExpenses: 5000,
      ledger: [],
    },
    career: { jobId: "market", pendingJob: null, jobFamilyExperience: {} },
    education: { level: "lise", fields: [], active: null, tuitionOwedThisMonth: 0 },
    household: { homeId: "family", livingWithFamily: true },
    people: [
      { id: "anne", name: "Aylin", relationType: "Anne", memories: [] },
      { id: "baba", name: "Murat", relationType: "Baba", memories: [] },
      { id: "mehmet", name: "Mehmet", relationType: "Arkadaş", memories: [] },
      { id: "elif", name: "Elif", relationType: "Tanıdık", memories: [] },
    ],
    relationships: { anne: 70 + socialBonus, baba: 64, mehmet: 52 + socialBonus, elif: 38 },
    health: { energy: profile.energy, stress: profile.stress, health: 82 },
    memories: [],
    flags: {},
    openCases: [],
    events: { active: null, queue: [], seen: [], cooldowns: {}, history: [] },
    weekly: { used: 0, selectedIds: [] },
    yearlyHistory: [],
  };
}

export function nextRandom(state) {
  let x = state.meta.rngState >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.meta.rngState = x >>> 0 || 1;
  return state.meta.rngState / 4294967296;
}

export function transact(state, amount, reason, category = "other") {
  if (!Number.isFinite(amount)) throw new Error("Geçersiz para işlemi");
  const rounded = Math.round(amount);
  state.finances.balance += rounded;
  if (!Number.isFinite(state.finances.balance)) throw new Error("Kasa geçersiz duruma geldi");
  appendCapped(
    state.finances.ledger,
    { week: state.time.absoluteWeek, amount: rounded, reason, category },
    120,
  );
}

export function adjustHealth(state, changes) {
  for (const key of ["energy", "stress", "health"]) {
    if (changes[key] !== undefined) state.health[key] = clamp(state.health[key] + changes[key]);
  }
}

export function updateRelationship(state, personId, amount) {
  if (!(personId in state.relationships) || !Number.isFinite(amount)) return false;
  state.relationships[personId] = clamp(state.relationships[personId] + amount);
  return true;
}

export function addMemory(state, text, importance = "normal") {
  appendCapped(
    state.memories,
    {
      id: `m-${state.time.absoluteWeek}-${state.memories.length + 1}`,
      week: state.time.absoluteWeek,
      year: state.time.year,
      text,
      importance,
    },
    LIMITS.memories,
  );
}

export function addNpcMemory(state, personId, text) {
  const person = state.people.find((candidate) => candidate.id === personId);
  if (!person) return false;
  appendCapped(
    person.memories,
    { week: state.time.absoluteWeek, year: state.time.year, text },
    LIMITS.npcMemories,
  );
  return true;
}

export function addEventHistory(state, entry) {
  appendCapped(state.events.history, entry, LIMITS.eventHistory);
}

export function addYearHistory(state, entry) {
  appendCapped(state.yearlyHistory, entry, LIMITS.yearlyHistory);
}

const safeCount = (value) => (Number.isInteger(value) && value >= 0 ? value : 0);

/**
 * Eğitim ve kariyer alanlarını her migration dalından sonra güvenli hale getirir.
 * Bozuk tek bir alan yüzünden kaydın tamamı çöpe atılmaz; alan güvenli varsayılana döner.
 * Geçmişe dönük deneyim tahmini yapılmaz.
 */
export function normalizeEducationCareer(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return state;

  const career = state.career && typeof state.career === "object" ? state.career : {};
  const rawExperience = career.jobFamilyExperience;
  const experience = {};
  if (rawExperience && typeof rawExperience === "object" && !Array.isArray(rawExperience)) {
    for (const [familyId, weeks] of Object.entries(rawExperience)) {
      if (typeof familyId !== "string" || !familyId) continue;
      experience[familyId] = safeCount(weeks);
    }
  }
  state.career = { ...career, jobFamilyExperience: experience };

  const raw = state.education && typeof state.education === "object" ? state.education : {};
  const fields = [];
  if (Array.isArray(raw.fields)) {
    for (const field of raw.fields)
      if (typeof field === "string" && field && !fields.includes(field)) fields.push(field);
  }
  state.education = {
    level: isEducationLevel(raw.level) ? raw.level : "lise",
    fields,
    active: isValidActiveEducation(raw.active) ? raw.active : null,
    tuitionOwedThisMonth: safeCount(raw.tuitionOwedThisMonth),
  };
  return state;
}

export function validateState(state) {
  const errors = [];
  const finite = (value) => typeof value === "number" && Number.isFinite(value);
  if (!state || typeof state !== "object" || Array.isArray(state))
    return { ok: false, errors: ["State nesne değil"] };
  if (state.meta?.saveVersion !== SAVE_VERSION) errors.push("Save sürümü geçersiz");
  if (
    !state.player ||
    typeof state.player.name !== "string" ||
    !Number.isInteger(state.player.age) ||
    state.player.age < 0
  )
    errors.push("Oyuncu geçersiz");
  const time = state.time;
  if (
    !time ||
    !Number.isInteger(time.year) ||
    !Number.isInteger(time.month) ||
    time.month < 1 ||
    time.month > MONTHS_PER_YEAR ||
    !Number.isInteger(time.weekOfMonth) ||
    time.weekOfMonth < 1 ||
    time.weekOfMonth > WEEKS_PER_MONTH ||
    !Number.isInteger(time.absoluteWeek) ||
    time.absoluteWeek < 1
  )
    errors.push("Zaman geçersiz");
  if (
    !state.finances ||
    !finite(state.finances.balance) ||
    !finite(state.finances.otherMonthlyIncome) ||
    !finite(state.finances.otherMonthlyExpenses) ||
    !Array.isArray(state.finances.ledger)
  )
    errors.push("Finans geçersiz");
  if (!state.career || (state.career.jobId !== null && !getJobById(state.career.jobId)))
    errors.push("İş kaydı geçersiz");
  if (
    state.career?.pendingJob !== null &&
    (!state.career?.pendingJob ||
      !getJobById(state.career.pendingJob.jobId) ||
      !Number.isInteger(state.career.pendingJob.startWeek) ||
      typeof state.career.pendingJob.caseId !== "string")
  )
    errors.push("Bekleyen iş kaydı geçersiz");
  const experience = state.career?.jobFamilyExperience;
  if (
    !experience ||
    typeof experience !== "object" ||
    Array.isArray(experience) ||
    Object.values(experience).some((weeks) => !Number.isInteger(weeks) || weeks < 0)
  )
    errors.push("Deneyim kaydı geçersiz");
  const education = state.education;
  if (
    !education ||
    typeof education !== "object" ||
    Array.isArray(education) ||
    !isEducationLevel(education.level) ||
    !Array.isArray(education.fields) ||
    education.fields.some((field) => typeof field !== "string" || !field) ||
    new Set(education.fields).size !== education.fields.length ||
    !Number.isInteger(education.tuitionOwedThisMonth) ||
    education.tuitionOwedThisMonth < 0 ||
    (education.active !== null && !isValidActiveEducation(education.active))
  )
    errors.push("Eğitim kaydı geçersiz");
  if (!state.household || !getHomeById(state.household.homeId)) errors.push("Konut kaydı geçersiz");
  if (!state.world || !getEraById(state.world.eraId)) errors.push("Dönem kaydı geçersiz");
  if (
    !state.health ||
    ["energy", "stress", "health"].some(
      (key) => !finite(state.health[key]) || state.health[key] < 0 || state.health[key] > 100,
    )
  )
    errors.push("Beden değerleri geçersiz");
  if (
    !Array.isArray(state.people) ||
    new Set(state.people.map((person) => person?.id)).size !== state.people.length ||
    state.people.some((person) => !person?.id || !Array.isArray(person.memories))
  )
    errors.push("NPC kayıtları geçersiz");
  if (
    !state.relationships ||
    typeof state.relationships !== "object" ||
    Object.values(state.relationships).some((value) => !finite(value) || value < 0 || value > 100)
  )
    errors.push("İlişkiler geçersiz");
  if (
    !state.weekly ||
    !Number.isInteger(state.weekly.used) ||
    state.weekly.used < 0 ||
    state.weekly.used > WEEKLY_ACTIVITY_LIMIT ||
    !Array.isArray(state.weekly.selectedIds) ||
    new Set(state.weekly.selectedIds).size !== state.weekly.selectedIds.length
  )
    errors.push("Haftalık aktivite kaydı geçersiz");
  if (
    !Array.isArray(state.memories) ||
    !Array.isArray(state.openCases) ||
    !Array.isArray(state.yearlyHistory)
  )
    errors.push("Geçmiş kayıtları geçersiz");
  if (
    !state.events ||
    !Array.isArray(state.events.queue) ||
    !Array.isArray(state.events.seen) ||
    !Array.isArray(state.events.history) ||
    typeof state.events.cooldowns !== "object"
  )
    errors.push("Event kayıtları geçersiz");
  if (
    state.openCases?.some(
      (item) =>
        !item?.id ||
        !Number.isInteger(item.dueWeek) ||
        !["pending", "triggered", "resolved"].includes(item.status),
    )
  )
    errors.push("Açık dosya geçersiz");
  return { ok: errors.length === 0, errors };
}

export function assertValidState(state) {
  const result = validateState(state);
  if (!result.ok) throw new Error(result.errors.join("; "));
  return state;
}
