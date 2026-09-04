/**
 * TC SIM uzun koşu / fuzz doğrulayıcı.
 *
 *   node scripts/tc-sim-longrun.mjs                 # 520 hafta, seed 1
 *   node scripts/tc-sim-longrun.mjs 1040 7          # 1040 hafta, seed 7
 *   node scripts/tc-sim-longrun.mjs fuzz            # 20 seed × 260 hafta
 *
 * Oyuncu eylemleri yalnız arayüzün izin verdiği yollardan (kayıt, bırakma,
 * teklif kabulü, taşınma, haftalık kararlar) seçilir. Her hafta invariant
 * yürüyüşü yapılır; ihlal varsa çıkış kodu 1 olur ve hafta numarasıyla raporlanır.
 */
import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import {
  acceptJobOffer,
  enrollEducation,
  getHomeById,
  getJobById,
  moveHome,
  stopEducation,
} from "../public/games/tc-sim/js/life.js";
import {
  advanceWeek,
  applyDecision,
  canApplyDecision,
  getAvailableDecisions,
} from "../public/games/tc-sim/js/time.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import { EDUCATION_PATHS, getPathById } from "../public/games/tc-sim/js/education.js";
import { getEraById } from "../public/games/tc-sim/js/eras.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";
import {
  applySocialAction,
  getAvailableSocialActions,
  getRelationship,
} from "../public/games/tc-sim/js/social.js";

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

const JOB_IDS = ["market", "courier", "office", "technician", "specialist"];
const HOME_IDS = ["family", "shared", "studio"];

function run(weeks, seed) {
  let state = createNewGame({
    name: "Uzun",
    profile: "balanced",
    seed,
    now: "2027-01-01T00:00:00.000Z",
  });
  const storage = new MemoryStorage();
  const problems = [];
  const seenProblems = new Set();
  const check = (ok, message) => {
    if (ok || seenProblems.has(message)) return;
    seenProblems.add(message);
    problems.push(`hafta ${state.time.absoluteWeek}: ${message}`);
  };

  let rng = seed >>> 0 || 1;
  const rand = () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    rng >>>= 0;
    return rng / 4294967296;
  };
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const settle = (target) => {
    let guard = 0;
    while (target.events.active && guard++ < 50) {
      const definition = getEventDefinition(target.events.active.eventId);
      resolveEvent(target, pick(definition.choices).id);
    }
  };

  for (let step = 0; step < weeks; step += 1) {
    settle(state);
    if (rand() < 0.05 && !state.education.active)
      enrollEducation(state, pick(EDUCATION_PATHS).id, rand() < 0.5 ? "full" : "part");
    if (rand() < 0.01 && state.education.active) stopEducation(state);
    if (rand() < 0.03) acceptJobOffer(state, pick(JOB_IDS));
    if (rand() < 0.02) moveHome(state, pick(HOME_IDS));
    if (rand() < 0.28 && !state.events.active) {
      const person = pick(state.people);
      const actions = getAvailableSocialActions(state, person.id).filter(
        (action) => action.availability.ok,
      );
      const action = pick(actions);
      if (action) applySocialAction(state, person.id, action.id);
    }
    const available = getAvailableDecisions(state);
    for (let slot = 0; slot < 2; slot += 1) {
      const decision = pick(available);
      if (decision && canApplyDecision(state, decision.id).ok) applyDecision(state, decision.id);
    }
    settle(state);

    const advanced = advanceWeek(state);
    check(advanced.ok, `advanceWeek reddetti: ${advanced.messages?.join(" ")}`);
    settle(state);

    const validation = validateState(state);
    check(validation.ok, `validateState: ${validation.errors.join("; ")}`);
    check(state.career.jobId === null || Boolean(getJobById(state.career.jobId)), "geçersiz jobId");
    check(Boolean(getHomeById(state.household.homeId)), "geçersiz homeId");
    check(Boolean(getEraById(state.world.eraId)), "geçersiz eraId");

    const active = state.education.active;
    if (active) {
      const path = getPathById(active.pathId);
      check(Boolean(path), "geçersiz pathId");
      check(
        Number.isInteger(active.progressPoints) &&
          active.progressPoints >= 0 &&
          active.progressPoints <= (path?.targetPoints ?? 0),
        "ilerleme aralık dışı",
      );
    }
    check(
      Number.isInteger(state.education.tuitionOwedThisMonth) &&
        state.education.tuitionOwedThisMonth >= 0,
      "eğitim borcu geçersiz",
    );

    let totalExperience = 0;
    for (const value of Object.values(state.career.jobFamilyExperience)) {
      check(Number.isInteger(value) && value >= 0, "deneyim geçersiz");
      totalExperience += value;
    }
    check(totalExperience <= state.time.absoluteWeek, "deneyim geçen haftadan fazla");

    for (const key of ["energy", "stress", "health"])
      check(
        Number.isFinite(state.health[key]) && state.health[key] >= 0 && state.health[key] <= 100,
        `beden değeri aralık dışı: ${key}`,
      );
    check(Number.isFinite(state.finances.balance), "bakiye sayı değil");
    for (const value of Object.values(state.relationships))
      check(Number.isFinite(value) && value >= 0 && value <= 100, "ilişki aralık dışı");
    for (const person of state.people) {
      const relationship = getRelationship(state, person.id);
      check(
        Number.isFinite(relationship.trust) && relationship.trust >= 0 && relationship.trust <= 100,
        "güven aralık dışı",
      );
      check(
        Number.isFinite(relationship.tension) &&
          relationship.tension >= 0 &&
          relationship.tension <= 100,
        "gerilim aralık dışı",
      );
      check(person.memories.length <= 50, "NPC hafızası sınırı aşıldı");
      check(
        person.roleId !== "family" || person.social.romanceStatus === "none",
        "aile NPC romantik durumda",
      );
    }
    const partners = state.people.filter((person) => person.social.romanceStatus === "partner");
    check(partners.length <= 1, "birden fazla partner");
    check(
      (state.social.currentPartnerNpcId === null && partners.length === 0) ||
        partners[0]?.id === state.social.currentPartnerNpcId,
      "partner kimliği tutarsız",
    );
    check(state.weekly.used <= 2, "haftalık karar hakkı aşıldı");

    // Sınırlı listeler taşmamalı.
    check(state.memories.length <= 200, "hafıza sınırı aşıldı");
    check(state.finances.ledger.length <= 120, "defter sınırı aşıldı");
    check(state.events.history.length <= 200, "event geçmişi sınırı aşıldı");
    check(state.yearlyHistory.length <= 80, "yıl dosyası sınırı aşıldı");

    // 3D: openCases patlamaz, borç tutarları sınırlı ve negatif olmaz, tekrar yok.
    check(state.openCases.length <= 50, "openCases sınırsız büyüyor");
    const caseIds = new Set();
    for (const item of state.openCases) {
      check(!caseIds.has(item.id), `tekrar eden openCase id: ${item.id}`);
      caseIds.add(item.id);
      if (item.type === "personal-debt")
        check(
          Number.isFinite(item.payload?.amount) && item.payload.amount > 0,
          "kişisel borç tutarı geçersiz/negatif",
        );
    }
    const unresolvedDebts = state.openCases.filter(
      (item) => item.type === "personal-debt" && item.status !== "resolved",
    );
    check(unresolvedDebts.length <= 1, "birden fazla bekleyen kişisel borç");

    if ((step + 1) % 12 === 0) {
      const saved = saveGame(storage, state);
      check(saved.ok, `save başarısız: ${saved.message}`);
      const loaded = loadGame(storage);
      check(loaded.ok, "load başarısız");
      if (loaded.ok) state = loaded.state;
    }
  }

  return {
    weeks,
    seed,
    problems,
    age: state.player.age,
    years: state.yearlyHistory.length,
    growth: {
      memories: state.memories.length,
      ledger: state.finances.ledger.length,
      eventHistory: state.events.history.length,
      openCases: state.openCases.length,
      openSocialCases: state.openCases.filter(
        (item) => item.type === "social-obligation" && item.status !== "resolved",
      ).length,
      yearlyHistory: state.yearlyHistory.length,
      npcMemories: state.people.map((person) => person.memories.length),
      flags: Object.keys(state.flags).length,
      saveBytes: Buffer.byteLength(JSON.stringify(state)),
    },
    final: {
      educationLevel: state.education.level,
      fields: state.education.fields,
      jobId: state.career.jobId,
      experience: state.career.jobFamilyExperience,
      balance: state.finances.balance,
      health: state.health,
      currentPartnerNpcId: state.social.currentPartnerNpcId,
    },
  };
}

const mode = process.argv[2] || "520";
if (mode === "fuzz") {
  const failed = [];
  for (let seed = 1; seed <= 20; seed += 1) {
    const result = run(260, seed);
    if (result.problems.length) failed.push({ seed, problems: result.problems });
  }
  console.log(JSON.stringify({ mode: "fuzz", seeds: 20, weeksPerSeed: 260, failed }, null, 1));
  process.exitCode = failed.length ? 1 : 0;
} else {
  const result = run(Number(mode), Number(process.argv[3] || 1));
  console.log(JSON.stringify(result, null, 1));
  process.exitCode = result.problems.length ? 1 : 0;
}
