import { parenthoodCosts } from "./parenthood.js?v=5";
import { getHouseholdFinance } from "./household.js?v=5";
import { addCareerHistory, addMemory, adjustHealth, getWeeklyActivityLimit, isCriticalHealth, transact } from "./state.js?v=5";
import { getCommuteLoad, getHomeById, getJobById } from "./catalog.js?v=5";
import {
  getEducationWeeklyLoad,
  getPathById,
  getWeeklyProgressGain,
  isEligibleForJob,
  resolveCompletedLevel,
} from "./education.js?v=5";
import { applySocialMaintenance } from "./social.js?v=5";
import { scheduleMoveConsequence } from "./depth3-systems.js?v=5";

export { HOMES, JOBS, getCommuteLoad, getHomeById, getJobById } from "./catalog.js?v=5";

export function getWeeklyLifeLoad(state) {
  const job = getJobById(state.career.jobId);
  const commute = getCommuteLoad(state.household.homeId, state.career.jobId);
  const education = getEducationWeeklyLoad(state);
  return {
    commute,
    education,
    load: (job?.load || 0) + commute + education.load,
    energy: (job?.energy || 0) - commute * 2 + education.energy,
    stress: (job?.stress || 0) + commute * 2 + education.stress,
  };
}

export function getCommuteExplanation(homeId, jobId) {
  if (jobId === null)
    return {
      label: "İşsiz — ulaşım yükü yok",
      detail: "Aktif iş olmadığı için haftalık ulaşım etkisi yok.",
      energy: 0,
      stress: 0,
    };
  const load = getCommuteLoad(homeId, jobId);
  const labels = ["Çok düşük", "Düşük", "Orta", "Yüksek"];
  const label = labels[Math.min(load, labels.length - 1)];
  return {
    label,
    detail:
      load === 0
        ? "Ev ve iş yakın; haftalık ek ulaşım yükü yok."
        : `Haftalık etki: ${-load * 2} enerji · +${load * 2} stres`,
    energy: -load * 2,
    stress: load * 2,
  };
}

export const PRIVACY_CONTEXT =
  "Mahremiyet şu an doğrudan stat değiştirmez; ileride aile, partner ve sosyal olaylarda bağlam sağlar.";

export const getMonthlyEmploymentIncome = (state) => getJobById(state.career.jobId)?.salary || 0;
export function getCostOfLivingIndex(state) {
  const years = Math.max(0, Math.floor((state.time?.absoluteWeek || 0) / 52));
  return Math.min(1.5, 1 + years * 0.04);
}
export function getMonthlyHousingBreakdown(state, options = {}) {
  const home = getHomeById(state.household.homeId);
  const base = home?.monthlyCost || 0;
  const salary = getMonthlyEmploymentIncome(state);
  // Aile yanında yaşamak düşük maliyetli kalır; gelir yükseldikçe ev katkısı da yükselir.
  const familyContribution = home?.id === "family" && salary > 10000 ? Math.round((salary - 10000) * 0.2) : 0;
  const shared = getHouseholdFinance(state, options);
  return { base, familyContribution, ...shared, total: Math.max(0, base + familyContribution + shared.householdExtra - shared.partnerContribution) };
}

export const getMonthlyHousingCost = (state) => getMonthlyHousingBreakdown(state).total;
export const hasIndependentHousing = (state) => getHomeById(state.household.homeId)?.id !== "family";
export const hasSavings = (state, amount) =>
  Number.isFinite(amount) && Number.isFinite(state.finances?.balance) && state.finances.balance >= amount;
export const getMoveCost = (homeId) => getHomeById(homeId)?.moveCost ?? Infinity;

const PROMOTION_PATHS = {
  market: "office",
  courier: "technician",
  office: "specialist",
};

export function getNextCareerStep(state) {
  const current = getJobById(state?.career?.jobId);
  const nextId = current ? PROMOTION_PATHS[current.id] : null;
  const next = nextId ? getJobById(nextId) : null;
  if (!next) return null;
  return isEligibleForJob(state, next).ok ? next : null;
}

export function promoteCareer(state) {
  const next = getNextCareerStep(state);
  if (!next) return { ok: false, reason: "Şu an uygun bir üst pozisyon yok." };
  const previous = getJobById(state.career.jobId);
  state.career.jobId = next.id;
  state.career.weeksInRole = 0;
  state.career.performance = Math.max(55, Number(state.career.performance) || 55);
  addCareerHistory(state, {
    type: "promotion",
    fromJobId: previous?.id || null,
    jobId: next.id,
    label: `${next.title} pozisyonuna geçtin.`,
  });
  addMemory(state, `${next.title} pozisyonuna geçtin.`, "important");
  return { ok: true, job: next };
}

export function updateCareerProgress(state) {
  const career = state.career;
  if (!career || !getJobById(career.jobId)) return false;
  career.weeksInRole = Number.isInteger(career.weeksInRole) ? career.weeksInRole + 1 : 1;
  const healthyWeek = state.health.health > 40 && state.health.energy >= 35;
  const manageableStress = state.health.stress < 70;
  const bodyPenalty = state.body?.conditions?.some((condition) => condition.knownToPlayer && ["active", "chronic"].includes(condition.status)) ? 1 : 0;
  const delta = healthyWeek && manageableStress ? Math.max(0, 1 - bodyPenalty) : state.health.health <= 15 || state.health.stress >= 85 ? -2 : 0;
  career.performance = Math.min(100, Math.max(0, career.performance + delta));
  return true;
}

export function getMonthlySummary(state, options = {}) {
  const salary = getMonthlyEmploymentIncome(state);
  const housingBreakdown = getMonthlyHousingBreakdown(state, options);
  const housing = housingBreakdown.total;
  const otherIncome = state.finances.otherMonthlyIncome;
  const otherExpenses = Math.round(state.finances.otherMonthlyExpenses * getCostOfLivingIndex(state));
  const tuition = state.education?.tuitionOwedThisMonth || 0;
  return {
    salary,
    housing,
    housingBreakdown,
    otherIncome,
    otherExpenses,
    tuition,
    parenting: parenthoodCosts(state, options),
    income: salary + otherIncome,
    expenses: housing + otherExpenses + tuition + parenthoodCosts(state, options),
  };
}

function canUseWeeklyAction(state, actionId) {
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  if (state.weekly.used >= getWeeklyActivityLimit(state))
    return {
      ok: false,
      reason: isCriticalHealth(state)
        ? "Sağlığın kritik; bu hafta yalnız bir şeye gücün yetiyor."
        : "Bu haftanın aktivite hakkı bitti.",
    };
  if (state.weekly.selectedIds.includes(actionId))
    return { ok: false, reason: "Bu işlem bu hafta zaten yapıldı." };
  return { ok: true };
}

function markWeeklyAction(state, actionId) {
  state.weekly.used += 1;
  state.weekly.selectedIds.push(actionId);
}

export function acceptJobOffer(state, jobId) {
  const job = getJobById(jobId);
  if (!job) return { ok: false, reason: "İş teklifi geçersiz." };
  if (state.career.jobId === jobId) return { ok: false, reason: "Zaten bu işte çalışıyorsun." };
  if (state.career.pendingJob)
    return { ok: false, reason: "Önce bekleyen iş başlangıcı sonuçlanmalı." };
  const eligibility = isEligibleForJob(state, job);
  if (!eligibility.ok) return { ok: false, reason: eligibility.reason };
  const actionId = `job-offer:${jobId}`;
  const check = canUseWeeklyAction(state, actionId);
  if (!check.ok) return check;
  const caseId = `job-start-${state.time.absoluteWeek}-${jobId}`;
  state.career.pendingJob = { jobId, startWeek: state.time.absoluteWeek + 1, caseId };
  state.openCases.push({
    id: caseId,
    type: "job-start",
    createdWeek: state.time.absoluteWeek,
    dueWeek: state.time.absoluteWeek + 1,
    eventId: "job_start",
    status: "pending",
    payload: { jobId },
  });
  markWeeklyAction(state, actionId);
  addCareerHistory(state, { type: "offer_accepted", jobId, label: `${job.title} teklifini kabul ettin.` });
  addMemory(
    state,
    `${job.title} teklifini kabul ettin; başlangıç tarihini bekliyorsun.`,
    "important",
  );
  return { ok: true, message: `${job.title} teklifi kabul edildi. İş gelecek hafta başlayacak.` };
}

export function completePendingJob(state, sourceCaseId) {
  const pending = state.career.pendingJob;
  if (!pending || pending.caseId !== sourceCaseId || !getJobById(pending.jobId)) return false;
  state.career.jobId = pending.jobId;
  state.career.pendingJob = null;
  state.career.weeksInRole = 0;
  state.career.performance = Math.max(50, Number(state.career.performance) || 50);
  addCareerHistory(state, { type: "job_started", jobId: pending.jobId, label: `${getJobById(pending.jobId).title} olarak başladın.` });
  addMemory(state, `${getJobById(state.career.jobId).title} olarak işe başladın.`, "important");
  return true;
}

export function quitJob(state) {
  if (state.career.jobId === null) return { ok: false, reason: "Bırakılacak aktif iş yok." };
  if (state.career.pendingJob)
    return { ok: false, reason: "Bekleyen iş teklifi varken mevcut iş bırakılamaz." };
  const check = canUseWeeklyAction(state, "quit-job");
  if (!check.ok) return check;
  const oldJob = getJobById(state.career.jobId);
  state.career.jobId = null;
  addCareerHistory(state, { type: "resigned", jobId: oldJob.id, label: `${oldJob.title} işinden ayrıldın.` });
  markWeeklyAction(state, "quit-job");
  addMemory(state, `${oldJob.title} işinden ayrıldın.`, "important");
  return { ok: true, message: "İşten ayrıldın; artık işsizsin." };
}

export function moveHome(state, homeId) {
  const home = getHomeById(homeId);
  if (!home) return { ok: false, reason: "Konut seçeneği geçersiz." };
  if (state.household.homeId === homeId) return { ok: false, reason: "Zaten burada yaşıyorsun." };
  const actionId = `move-home:${homeId}`;
  const check = canUseWeeklyAction(state, actionId);
  if (!check.ok) return check;
  const result = relocateHome(state, homeId);
  if (result.ok) markWeeklyAction(state, actionId);
  return result;
}

/** Ortak taşınma işlemi; haftalık karar veya doğrulanmış olay seçimi kullanır. */
export function relocateHome(state, homeId) {
  const home = getHomeById(homeId);
  if (!home || state.household.homeId === homeId) return { ok: false, reason: "Konut değişikliği yok." };
  if (homeId === "family" && state.household.union?.cohabitingSince) return { ok: false, reason: "Önce partnerinle ayrı evlerde yaşama kararını konuşmalısın." };
  const previousHomeId = state.household.homeId;
  const cost = getMoveCost(homeId);
  if (state.finances.balance < cost) return { ok: false, reason: `Taşınmak için ₺${cost.toLocaleString("tr-TR")} gerekiyor.` };
  transact(state, -cost, `${home.title} taşınma masrafı`, "housing");
  state.household.homeId = homeId;
  state.household.livingWithFamily = homeId === "family";
  addMemory(state, `${home.title} konutuna taşındın.`, "important");
  scheduleMoveConsequence(state, previousHomeId, homeId);
  return { ok: true, message: `${home.title} konutuna taşındın; taşınma maliyeti bir kez ödendi.` };
}

/** Biten haftanın deneyimi. Aktif iş yoksa kredi yok; bir hafta tek aileye yazar. */
function creditWeeklyExperience(state) {
  const job = getJobById(state.career.jobId);
  if (!job?.family) return false;
  // Doğrulanmış her state'te bu harita vardır; tick'in çökmesindense kendini onarır.
  if (!state.career.jobFamilyExperience) state.career.jobFamilyExperience = {};
  const experience = state.career.jobFamilyExperience;
  experience[job.family] = (experience[job.family] || 0) + 1;
  return true;
}

/** Diploma ödülü tick içinde verilir; event yalnız bildirimdir. */
function completeEducation(state, path) {
  const education = state.education;
  education.level = resolveCompletedLevel(education.level, path.grantsLevel);
  if (path.grantsField && !education.fields.includes(path.grantsField))
    education.fields.push(path.grantsField);
  education.active = null;
  state.flags.educationCompletedPending = path.id;
  addMemory(state, `${path.displayName} eğitimini tamamladın.`, "important");
}

function advanceEducationProgress(state) {
  const active = state.education.active;
  if (!active) return false;
  const path = getPathById(active.pathId);
  if (!path) {
    state.education.active = null;
    return false;
  }
  active.progressPoints += getWeeklyProgressGain(active.intensity);
  // O ay doğan borç ay içinde yalnız artabilir: pahalı programı bırakıp ucuza
  // geçerek borcu düşürmek engellenir. Ay sonunda tahsil edilip sıfırlanır.
  state.education.tuitionOwedThisMonth = Math.max(
    state.education.tuitionOwedThisMonth,
    path.monthlyTuition,
  );
  if (active.progressPoints >= path.targetPoints) completeEducation(state, path);
  return true;
}

export function applyWeeklyLifeLoad(state) {
  const week = state.time.absoluteWeek;
  if (state.flags.lastLifeLoadWeek === week) return false;
  const effects = getWeeklyLifeLoad(state);
  adjustHealth(state, {
    energy: effects.energy,
    stress: effects.stress,
    health: effects.load >= 6 && state.health.stress >= 75 ? -1 : 0,
  });
  state.flags.lastLifeLoadWeek = week;
  creditWeeklyExperience(state);
  updateCareerProgress(state);
  advanceEducationProgress(state);
  applySocialMaintenance(state);
  return true;
}

export function enrollEducation(state, pathId, intensity) {
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  if (state.education.active) return { ok: false, reason: "Zaten devam eden bir eğitimin var." };
  const path = getPathById(pathId);
  if (!path) return { ok: false, reason: "Eğitim seçeneği geçersiz." };
  if (!path.allowedIntensity.includes(intensity))
    return { ok: false, reason: "Bu yoğunluk bu program için geçerli değil." };
  if (state.finances.balance < path.enrollmentFee)
    return {
      ok: false,
      reason: `Kayıt için ₺${path.enrollmentFee.toLocaleString("tr-TR")} gerekiyor.`,
    };
  transact(state, -path.enrollmentFee, `${path.displayName} kayıt ücreti`, "education");
  state.education.active = { pathId: path.id, intensity, progressPoints: 0 };
  addMemory(state, `${path.displayName} programına kaydoldun.`, "important");
  return {
    ok: true,
    message: `${path.displayName} programına kaydoldun; ilerleme gelecek hafta başlar.`,
  };
}

export function stopEducation(state) {
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  const active = state.education.active;
  if (!active) return { ok: false, reason: "Devam eden bir eğitim yok." };
  const path = getPathById(active.pathId);
  state.education.active = null;
  addMemory(state, `${path?.displayName || "Eğitim"} programını bıraktın.`, "important");
  return {
    ok: true,
    message: "Eğitimi bıraktın. Biriken ilerleme silindi, ödenen ücret iade edilmez.",
  };
}
