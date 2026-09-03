import {
  WEEKLY_ACTIVITY_LIMIT,
  WEEKS_PER_MONTH,
  MONTHS_PER_YEAR,
  addMemory,
  addNpcMemory,
  addYearHistory,
  adjustHealth,
  assertValidState,
  transact,
  updateRelationship,
} from "./state.js";
import { activateNextEvent, processDueOpenCases } from "./events.js";

export const DECISIONS = [
  {
    id: "overtime",
    title: "Ek mesai yap",
    detail: "+₺1.250 · enerji −16 · stres +12",
    apply(state) {
      transact(state, 1250, "Ek mesai", "work");
      adjustHealth(state, { energy: -16, stress: 12 });
      state.flags.overtimeStreak = (state.flags.overtimeStreak || 0) + 1;
      state.flags.overtimeLastWeek = state.time.absoluteWeek;
    },
  },
  {
    id: "family",
    title: "Aileyle vakit geçir",
    detail: "anne ilişkisi +8 · stres −6",
    apply(state) {
      updateRelationship(state, "anne", 8);
      adjustHealth(state, { energy: -5, stress: -6 });
      addMemory(state, "Ailenle sakin bir hafta geçirdin.");
    },
  },
  {
    id: "friend",
    title: "Mehmet'le buluş",
    detail: "₺250 · ilişki +7 · enerji −8",
    apply(state) {
      transact(state, -250, "Arkadaş buluşması", "social");
      updateRelationship(state, "mehmet", 7);
      adjustHealth(state, { energy: -8, stress: -5 });
    },
  },
  {
    id: "rest",
    title: "Dinlen",
    detail: "enerji +22 · stres −12",
    apply(state) {
      adjustHealth(state, { energy: 22, stress: -12 });
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
    apply(state) {
      state.flags.helpedFriend = true;
      state.flags.helpedFriendWeek = state.time.absoluteWeek;
      updateRelationship(state, "mehmet", 6);
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
];

export function canApplyDecision(state, decisionId) {
  const decision = DECISIONS.find((item) => item.id === decisionId);
  if (!decision) return { ok: false, reason: "Karar bulunamadı." };
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  if (state.weekly.used >= WEEKLY_ACTIVITY_LIMIT)
    return { ok: false, reason: "Bu haftanın aktivite hakkı bitti." };
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
  transact(state, state.finances.monthlyIncome, "Aylık gelir", "income");
  transact(state, -state.finances.monthlyExpenses, "Aylık düzenli gider", "expense");
  return `Ay sonu: ₺${state.finances.monthlyIncome.toLocaleString("tr-TR")} gelir, ₺${state.finances.monthlyExpenses.toLocaleString("tr-TR")} gider işlendi.`;
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
