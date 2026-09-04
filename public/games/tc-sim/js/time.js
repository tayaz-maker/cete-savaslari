import {
  WEEKS_PER_MONTH,
  MONTHS_PER_YEAR,
  addMemory,
  addNpcMemory,
  addYearHistory,
  adjustHealth,
  assertValidState,
  getWeeklyActivityLimit,
  isCriticalHealth,
  transact,
  updateRelationship,
} from "./state.js?v=5";
import { applyRelationshipDelta, markMeaningfulContact } from "./social.js?v=5";
import { activateNextEvent, processDueOpenCases } from "./events.js?v=5";
import { applyWeeklyLifeLoad, getMonthlySummary } from "./life.js?v=5";

/** Ek mesai: ilk haftalar tam öder, aralıksız sürdükçe getirisi düşer ve yükü artar. */
export const OVERTIME_BASE_PAY = 1250;
export const OVERTIME_FREE_WEEKS = 2;
const OVERTIME_MIN_PAY_RATIO = 0.5;
const OVERTIME_BASE_STRESS = 12;
const OVERTIME_MAX_STRESS = 20;

/** `streak`, kesintisiz geçmiş mesai haftası sayısıdır (bu hafta dahil değil). */
export function getOvertimePay(streak = 0) {
  const extra = Math.max(0, streak - (OVERTIME_FREE_WEEKS - 1));
  const ratio = Math.max(OVERTIME_MIN_PAY_RATIO, 1 - extra * 0.2);
  return Math.round(OVERTIME_BASE_PAY * ratio);
}

export function getOvertimeStress(streak = 0) {
  const extra = Math.max(0, streak - (OVERTIME_FREE_WEEKS - 1));
  return Math.min(OVERTIME_MAX_STRESS, OVERTIME_BASE_STRESS + extra * 2);
}

/** Dinlenme: yüksek stres altında toparlanma zayıflar. Stresin ayrı bir işi olur. */
export const REST_BASE_ENERGY = 22;
export function getRestEnergyGain(stress) {
  if (stress >= 80) return 10;
  if (stress >= 60) return 15;
  return REST_BASE_ENERGY;
}

export const DECISIONS = [
  {
    id: "overtime",
    title: "Ek mesai yap",
    detail: "+₺1.250 · enerji −16 · stres +12 · aralıksız sürerse azalır",
    apply(state) {
      const streak = state.flags.overtimeStreak || 0;
      transact(state, getOvertimePay(streak), "Ek mesai", "work");
      adjustHealth(state, { energy: -16, stress: getOvertimeStress(streak) });
      state.flags.overtimeStreak = streak + 1;
      state.flags.overtimeLastWeek = state.time.absoluteWeek;
    },
  },
  {
    id: "family",
    title: "Aileyle vakit geçir",
    detail: "anne ilişkisi +8 · stres −6",
    contextual: (state) => state.relationships.anne < 96,
    apply(state) {
      updateRelationship(state, "anne", 8);
      applyRelationshipDelta(state, "anne", { trust: 2, tension: -3 });
      markMeaningfulContact(state, "anne");
      adjustHealth(state, { energy: -5, stress: -6 });
      addMemory(state, "Ailenle sakin bir hafta geçirdin.");
      addNpcMemory(state, "anne", "Bu hafta benimle vakit geçirdi.");
    },
  },
  {
    id: "friend",
    title: "Mehmet'le buluş",
    detail: "₺250 · ilişki +7 · enerji −8",
    contextual: (state) => state.relationships.mehmet < 96 && state.finances.balance >= 250,
    apply(state) {
      transact(state, -250, "Arkadaş buluşması", "social");
      updateRelationship(state, "mehmet", 7);
      applyRelationshipDelta(state, "mehmet", { trust: 2, tension: -2 });
      markMeaningfulContact(state, "mehmet");
      adjustHealth(state, { energy: -8, stress: -5 });
      addNpcMemory(state, "mehmet", "Bu hafta birlikte vakit geçirdik.");
    },
  },
  {
    id: "rest",
    title: "Dinlen",
    detail: "enerji +22 · stres −12 · stres yüksekken daha az toparlar",
    apply(state) {
      adjustHealth(state, { energy: getRestEnergyGain(state.health.stress), stress: -12 });
    },
  },
  {
    id: "exercise",
    title: "Spor yap",
    detail: "₺150 · sağlık +4 · stres −8",
    apply(state) {
      transact(state, -150, "Spor gideri", "health");
      adjustHealth(state, { energy: -8, stress: -8, health: 4 });
    },
  },
  {
    id: "help-friend",
    title: "Mehmet'in başvurusuna yardım et",
    detail: "geçmişte hatırlanır · ilişki +6",
    onceFlag: "helpedFriend",
    contextual: (state) => !state.flags.helpedFriend && state.relationships.mehmet >= 40,
    apply(state) {
      state.flags.helpedFriend = true;
      state.flags.helpedFriendWeek = state.time.absoluteWeek;
      updateRelationship(state, "mehmet", 6);
      applyRelationshipDelta(state, "mehmet", { trust: 6, tension: -2 });
      markMeaningfulContact(state, "mehmet");
      addMemory(state, "Mehmet'in iş başvurusuna yardım ettin.", "important");
      addNpcMemory(state, "mehmet", "İş başvurumda bana yardım etti.");
    },
  },
  {
    id: "lend-friend",
    title: "Mehmet'e borç ver",
    detail: "₺1.500 şimdi gider · 4 hafta sonra döner",
    onceFlag: "loanedToMehmet",
    minimumBalance: 1500,
    contextual: (state) =>
      !state.flags.loanedToMehmet &&
      state.finances.balance >= 1500 &&
      state.relationships.mehmet >= 45,
    apply(state) {
      transact(state, -1500, "Mehmet'e verilen borç", "social");
      state.flags.loanedToMehmet = true;
      state.openCases.push({
        id: `loan-${state.time.absoluteWeek}`,
        type: "friend-loan",
        createdWeek: state.time.absoluteWeek,
        dueWeek: state.time.absoluteWeek + 4,
        eventId: "loan_repayment",
        status: "pending",
      });
      addMemory(state, "Mehmet'e ₺1.500 borç verdin.", "important");
    },
  },
  {
    id: "quiet-evening",
    title: "Sakin bir akşam geçir",
    detail: "enerji +10 · stres −4",
    contextual: (state) => state.health.energy <= 50,
    apply(state) {
      adjustHealth(state, { energy: 10, stress: -4 });
    },
  },
  {
    id: "reset-routine",
    title: "Temponu düzenle",
    detail: "enerji +4 · stres −10",
    contextual: (state) => state.health.stress >= 50,
    apply(state) {
      adjustHealth(state, { energy: 4, stress: -10 });
    },
  },
  {
    id: "budget-check",
    title: "Bütçeyi gözden geçir",
    detail: "stres −5 · harcama planı kaydı",
    contextual: (state) => state.finances.balance < 3500,
    apply(state) {
      adjustHealth(state, { stress: -5 });
      state.flags.reviewedBudget = state.time.absoluteWeek;
      addMemory(state, "Bütçeni gözden geçirip harcama planı yaptın.");
    },
  },
  {
    id: "job-search",
    title: "İş fırsatlarını araştır",
    detail: "stres −3 · iş arama kaydı",
    contextual: (state) => state.career.jobId === null && !state.career.pendingJob,
    apply(state) {
      adjustHealth(state, { stress: -3 });
      state.flags.searchedForWorkWeek = state.time.absoluteWeek;
      addMemory(state, "Yeni iş fırsatlarını araştırdın.");
    },
  },
  {
    id: "call-anne",
    title: "Aylin'i ara",
    detail: "anne ilişkisi +5 · stres −2",
    contextual: (state) => state.relationships.anne <= 62,
    apply(state) {
      updateRelationship(state, "anne", 5);
      applyRelationshipDelta(state, "anne", { trust: 2, tension: -3 });
      markMeaningfulContact(state, "anne");
      adjustHealth(state, { stress: -2 });
      addMemory(state, "Aylin'i arayıp aranızdaki mesafeyi azalttın.");
      addNpcMemory(state, "anne", "Arayıp halimi hatırımı sordu.");
    },
  },
  {
    id: "reconnect-mehmet",
    title: "Mehmet'e ulaş",
    detail: "Mehmet ilişkisi +5 · enerji −3",
    contextual: (state) => state.relationships.mehmet <= 45,
    apply(state) {
      updateRelationship(state, "mehmet", 5);
      applyRelationshipDelta(state, "mehmet", { trust: 2, tension: -3 });
      markMeaningfulContact(state, "mehmet");
      adjustHealth(state, { energy: -3, stress: -2 });
      addMemory(state, "Mehmet'e ulaşıp aranızdaki sessizliği bozdun.");
      addNpcMemory(state, "mehmet", "Uzun sessizliğin ardından bana ulaştı.");
    },
  },
];

const CORE_DECISION_IDS = new Set(["overtime", "rest", "exercise"]);

export function getAvailableDecisions(state) {
  return DECISIONS.filter(
    (decision) => CORE_DECISION_IDS.has(decision.id) || decision.contextual?.(state),
  );
}

export function canApplyDecision(state, decisionId) {
  const decision = DECISIONS.find((item) => item.id === decisionId);
  if (!decision) return { ok: false, reason: "Karar bulunamadı." };
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  if (state.weekly.used >= getWeeklyActivityLimit(state))
    return {
      ok: false,
      reason: isCriticalHealth(state)
        ? "Sağlığın kritik; bu hafta yalnız bir şeye gücün yetiyor."
        : "Bu haftanın aktivite hakkı bitti.",
    };
  if (decisionId === "overtime" && isCriticalHealth(state))
    return { ok: false, reason: "Sağlığın kritik seviyede; bu hafta ek mesaiye kalkışamazsın." };
  if (state.weekly.selectedIds.includes(decisionId))
    return { ok: false, reason: "Aynı aktivite bir haftada iki kez seçilemez." };
  if (decision.onceFlag && state.flags[decision.onceFlag])
    return { ok: false, reason: "Bu karar daha önce verildi." };
  if (decision.minimumBalance && state.finances.balance < decision.minimumBalance)
    return { ok: false, reason: "Yeterli paran yok." };
  return { ok: true, decision };
}

export function applyDecision(state, decisionId) {
  const check = canApplyDecision(state, decisionId);
  if (!check.ok) return check;
  check.decision.apply(state);
  state.weekly.used += 1;
  state.weekly.selectedIds.push(decisionId);
  state.flags.lastDecisionId = decisionId;
  activateNextEvent(state);
  assertValidState(state);
  return { ok: true, message: `${check.decision.title} uygulandı.` };
}

function processMonthEnd(state) {
  const summary = getMonthlySummary(state);
  if (summary.salary) transact(state, summary.salary, "Aylık maaş", "income");
  if (summary.otherIncome) transact(state, summary.otherIncome, "Diğer düzenli gelir", "income");
  transact(state, -summary.housing, "Aylık konut gideri", "housing");
  if (summary.otherExpenses)
    transact(state, -summary.otherExpenses, "Diğer düzenli gider", "expense");
  // Ay içinde tek hafta bile ilerleme olduysa tam aylık ücret alınır; eğitimi
  // bırakmak o ayın borcunu silmez. Ay başına tam bir kez.
  if (summary.tuition) {
    transact(state, -summary.tuition, "Eğitim ücreti", "education");
    state.education.tuitionOwedThisMonth = 0;
  }
  return `Ay sonu: ₺${summary.income.toLocaleString("tr-TR")} gelir, ₺${summary.expenses.toLocaleString("tr-TR")} gider işlendi.`;
}

function closeYear(state, endedYear) {
  const yearMemories = state.memories.filter((memory) => memory.year === endedYear);
  const entry = {
    year: endedYear,
    startingBalance: state.meta.yearStartBalance,
    endingBalance: state.finances.balance,
    importantMemories: yearMemories
      .filter((memory) => memory.importance === "important")
      .slice(-8)
      .map((memory) => memory.text),
    relationships: { ...state.relationships },
  };
  addYearHistory(state, entry);
  state.meta.yearStartBalance = state.finances.balance;
  state.meta.yearStartRelationships = { ...state.relationships };
  addMemory(
    state,
    `${endedYear} yılı tamamlandı. Yıl sonu bakiyesi ₺${state.finances.balance.toLocaleString("tr-TR")}.`,
    "important",
  );
  return entry;
}

export function advanceWeek(state) {
  if (state.events.active) return { ok: false, messages: ["Önce açık olayı sonuçlandır."] };
  const messages = [];
  const previousYear = state.time.year;
  const workedOvertime = state.flags.overtimeLastWeek === state.time.absoluteWeek;

  applyWeeklyLifeLoad(state);

  state.time.absoluteWeek += 1;
  state.time.weekOfMonth += 1;
  if (state.time.weekOfMonth > WEEKS_PER_MONTH) {
    state.time.weekOfMonth = 1;
    state.time.month += 1;
    messages.push(processMonthEnd(state));
    if (state.time.month > MONTHS_PER_YEAR) {
      state.time.month = 1;
      state.time.year += 1;
      state.player.age += 1;
      closeYear(state, previousYear);
      messages.push(`${previousYear} yılı tamamlandı; yaşın ${state.player.age} oldu.`);
    }
  }

  state.weekly = { used: 0, selectedIds: [] };
  if (!workedOvertime) state.flags.overtimeStreak = 0;
  adjustHealth(state, { energy: 7, stress: -2, health: state.health.stress >= 80 ? -2 : 0 });
  processDueOpenCases(state);
  activateNextEvent(state);
  assertValidState(state);
  return { ok: true, messages: messages.length ? messages : ["Yeni hafta başladı."] };
}
