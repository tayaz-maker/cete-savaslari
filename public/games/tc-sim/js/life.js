import { WEEKLY_ACTIVITY_LIMIT, addMemory, adjustHealth, transact } from "./state.js";
import { getCommuteLoad, getHomeById, getJobById } from "./catalog.js";

export { HOMES, JOBS, getCommuteLoad, getHomeById, getJobById } from "./catalog.js";

export function getWeeklyLifeLoad(state) {
  const job = getJobById(state.career.jobId);
  const commute = getCommuteLoad(state.household.homeId, state.career.jobId);
  return {
    commute,
    load: (job?.load || 0) + commute,
    energy: (job?.energy || 0) - commute * 2,
    stress: (job?.stress || 0) + commute * 2,
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
export const getMonthlyHousingCost = (state) =>
  getHomeById(state.household.homeId)?.monthlyCost || 0;
export const getMoveCost = (homeId) => getHomeById(homeId)?.moveCost ?? Infinity;

export function getMonthlySummary(state) {
  const salary = getMonthlyEmploymentIncome(state);
  const housing = getMonthlyHousingCost(state);
  const otherIncome = state.finances.otherMonthlyIncome;
  const otherExpenses = state.finances.otherMonthlyExpenses;
  return {
    salary,
    housing,
    otherIncome,
    otherExpenses,
    income: salary + otherIncome,
    expenses: housing + otherExpenses,
  };
}

function canUseWeeklyAction(state, actionId) {
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  if (state.weekly.used >= WEEKLY_ACTIVITY_LIMIT)
    return { ok: false, reason: "Bu haftanın aktivite hakkı bitti." };
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
  const cost = getMoveCost(homeId);
  if (state.finances.balance < cost)
    return { ok: false, reason: `Taşınmak için ₺${cost.toLocaleString("tr-TR")} gerekiyor.` };
  transact(state, -cost, `${home.title} taşınma masrafı`, "housing");
  state.household.homeId = homeId;
  state.household.livingWithFamily = homeId === "family";
  markWeeklyAction(state, actionId);
  addMemory(state, `${home.title} konutuna taşındın.`, "important");
  return { ok: true, message: `${home.title} konutuna taşındın; taşınma maliyeti bir kez ödendi.` };
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
  return true;
}
