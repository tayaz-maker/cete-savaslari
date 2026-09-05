import { addMemory, addNpcMemory, appendCapped, adjustHealth, getWeeklyActivityLimit, transact } from "./state.js?v=5";
import { getRelationship, applyRelationshipDelta } from "./social.js?v=5";
import { getMonthlySummary, relocateHome, getHomeById } from "./life.js?v=5";
import { createSecret, transferSecret } from "./depth2-systems.js?v=5";

export const PARENTING_CHAINS = Object.freeze({
  planning: { id: "CHN-P01", eventId: "parent_planning_review" },
  preparation: { id: "CHN-P02", eventId: "parent_preparation" },
  birth: { id: "CHN-P03", eventId: "parent_birth" },
  care: { id: "CHN-P04", eventId: "parent_care_review" },
  budget: { id: "CHN-P05", eventId: "parent_budget_review" },
  support: { id: "CHN-P06", eventId: "parent_family_support" },
  housing: { id: "CHN-P07", eventId: "parent_housing_review" },
  school: { id: "CHN-C01", eventId: "child_school_transition" },
  attendance: { id: "CHN-C02", eventId: "child_attendance_concern" },
  conflict: { id: "CHN-C03", eventId: "child_conflict_repair" },
  peer: { id: "CHN-C04", eventId: "child_peer_concern" },
  activity: { id: "CHN-C05", eventId: "child_activity_review" },
  autonomy: { id: "CHN-C06", eventId: "child_autonomy_followup" },
  contact: { id: "CHN-C07", eventId: "child_contact_followup" },
  future: { id: "CHN-C08", eventId: "child_future_discussion" },
});
export function neutralParenthood() {
  return { pregnancy: null, children: [], carePlan: "home", careOwedThisMonth: 0, coveredUntil: 0, missedCareWeeks: 0, lastWeek: 0 };
}
export function normalizeParenthood(state) {
  if (!state.parenthood) state.parenthood = neutralParenthood();
  else state.parenthood = { ...neutralParenthood(), ...state.parenthood };
  for (const child of state.parenthood.children) {
    if (!child.relationship) child.relationship = { closeness: 60, trust: 60, tension: 0 };
    if (!Object.hasOwn(child, "futurePreference")) child.futurePreference = null;
    if (!child.school) child.school = { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, hiddenIssue: null, lastUpdatedWeek: 0 };
    if (!Object.hasOwn(child.school, "hiddenIssue")) child.school.hiddenIssue = null;
    if (!child.stageMark) child.stageMark = { stage: null, transitions: [] };
    if (!Array.isArray(child.stageMark.transitions)) child.stageMark.transitions = [];
    if (!Array.isArray(child.school.issues)) child.school.issues = [];
    child.school.attendancePressure = Math.max(0, Math.min(12, Number(child.school.attendancePressure) || 0));
    child.school.socialPressure = Math.max(0, Math.min(12, Number(child.school.socialPressure) || 0));
    child.school.lastUpdatedWeek = Number.isInteger(child.school.lastUpdatedWeek) ? child.school.lastUpdatedWeek : 0;
  }
}
export function validateParenthood(state) {
  const p = state.parenthood;
  if (!p) return true;
  const week = (v) => Number.isInteger(v) && v >= 0 && v <= state.time.absoluteWeek;
  const person = (id) => state.people.some((item) => item.id === id);
  const cases = (state.openCases || []).filter(c => c.type === "parenting-followup" && c.status !== "resolved");
  if (cases.length > 14 || new Set(cases.map(c => c.id)).size !== cases.length || cases.some(c => !Object.hasOwn(PARENTING_CHAINS, c.payload?.kind) || c.chainId !== PARENTING_CHAINS[c.payload.kind].id || typeof c.payload.playerKnown !== "boolean")) return false;
  return Array.isArray(p.children) && p.children.every((c) => typeof c?.id === "string" && c.id && typeof c.name === "string" && c.name.length <= 40 && week(c.bornWeek) && c.bornWeek >= 1 && person(c.otherParentId) && typeof c.livesWithPlayer === "boolean") &&
    new Set(p.children.map((c) => c.id)).size === p.children.length &&
    ["home", "paid"].includes(p.carePlan) && Number.isInteger(p.careOwedThisMonth) && p.careOwedThisMonth >= 0 && p.careOwedThisMonth <= 4500 && Number.isInteger(p.coveredUntil) && p.coveredUntil >= 0 &&
    Number.isInteger(p.missedCareWeeks) && p.missedCareWeeks >= 0 && p.missedCareWeeks <= 8 && week(p.lastWeek) &&
    (p.pregnancy === null || (p.pregnancy && typeof p.pregnancy.id === "string" && week(p.pregnancy.startWeek) && p.pregnancy.startWeek >= 1 && ["trying", "known"].includes(p.pregnancy.phase) && ["player", "partner"].includes(p.pregnancy.carrier) && person(p.pregnancy.otherParentId)));
}
export function childAge(state, child) { return Math.max(0, Math.floor((state.time.absoluteWeek - child.bornWeek) / 48)); }
export function childStage(state, child) {
  const age = childAge(state, child);
  if (age < 6) return age < 1 ? "Bebeklik" : age < 3 ? "Küçük çocukluk" : "Erken çocukluk";
  if (age <= 11) return "Okul çağı (6–11)";
  if (age <= 14) return "Erken ergenlik (12–14)";
  if (age <= 17) return "Geç ergenlik (15–17)";
  return "Yetişkinliğe geçiş (18+)";
}
export function childAcademicStanding(child) {
  const school = child.school || {};
  const issues = (school.issues || []).filter(i => i.status !== "resolved").length;
  if ((school.attendancePressure || 0) >= 9 || issues >= 2) return "zorlanıyor";
  if ((school.attendancePressure || 0) >= 5 || (school.socialPressure || 0) >= 7 || issues) return "yeterli";
  return "iyi";
}
const dependents = (state) => (state.parenthood?.children || []).filter((c) => c.livesWithPlayer && state.time.absoluteWeek - c.bornWeek < 288);
export const needsParentCare = (state) => dependents(state).length > 0;
export function careCovered(state) {
  return state.parenthood?.carePlan === "paid" || state.parenthood?.coveredUntil >= state.time.absoluteWeek || state.weekly.selectedIds.includes("parent-care");
}
export function parentingOvertimeBlocked(state) {
  return needsParentCare(state) && state.parenthood.missedCareWeeks >= 2 && !careCovered(state);
}
export function parenthoodCosts(state, { closingMonth = false } = {}) {
  const p = state.parenthood;
  if (!p) return 0;
  const routineCost = p.children.filter((c) => c.livesWithPlayer).reduce((sum, c) => {
    const age = state.time.absoluteWeek - c.bornWeek;
    const fraction = closingMonth ? Math.min(4, Math.max(0, age)) / 4 : 1;
    const years = Math.floor(Math.max(0, age) / 48);
    const routine = years < 1 ? 1400 : years < 3 ? 1200 : years < 6 ? 1000 : years <= 11 ? 1250 : years <= 14 ? 1450 : years <= 17 ? 1600 : 0;
    return sum + Math.round(routine * fraction) + (closingMonth ? (c.school?.extracurricular?.monthlyCost || 0) : 0);
  }, 0);
  return routineCost + (closingMonth ? p.careOwedThisMonth : p.carePlan === "paid" ? dependents(state).length * 1500 : 0);
}
export function planningAlignment(state) {
  const plan = state.household.union?.familyPlan;
  if (!plan) return "Henüz konuşulmadı";
  if (plan.intent === "wants" && plan.response === "wants") return "Ortak istek var";
  if (plan.intent === "no" && plan.response === "no") return "Çocuksuz yaşam konusunda ortak görüş";
  return plan.intent === plan.response ? "Şimdilik bekleme konusunda ortak görüş" : "Niyet veya zamanlama farklı";
}
function familyContext(state) {
  return Boolean(state.social.currentPartnerNpcId && state.household.union?.cohabitingSince && !state.household.union.separatedSince && state.household.union.familyPlan);
}
export function canTryParenthood(state) {
  const p = state.parenthood;
  if (!familyContext(state) || p.pregnancy || state.player.age < 18 || state.player.age > 35) return false;
  const plan = state.household.union.familyPlan;
  const relationship = getRelationship(state, state.social.currentPartnerNpcId);
  return plan.intent === "wants" && plan.response === "wants" && relationship.trust >= 62 && relationship.tension <= 35 && dependents(state).length < 3 &&
    p.children.every((c) => state.time.absoluteWeek - c.bornWeek >= 96);
}
function record(state, kind, text, personId) {
  const id = `${kind}-${state.time.absoluteWeek}`;
  if (state.household.history.some((item) => item.id === id)) return;
  appendCapped(state.household.history, { id, kind, text, week: state.time.absoluteWeek, personId }, 24);
  addMemory(state, text, "important");
  if (personId) addNpcMemory(state, personId, text, kind);
}
function schedule(state, kind, delay, payload = {}, eventId = null, hidden = false) {
  if (state.openCases.some((c) => c.type === "parenting-followup" && c.payload.kind === kind && c.payload.childId === payload.childId && c.status !== "resolved")) return false;
  const chain = PARENTING_CHAINS[kind];
  state.openCases.push({ id: `parent-${kind}-${payload.childId || "all"}-${state.time.absoluteWeek}`, type: "parenting-followup", chainId: chain.id, eventId: eventId || chain.eventId,
    createdWeek: state.time.absoluteWeek, dueWeek: state.time.absoluteWeek + delay, expiresWeek: (kind === "birth" || eventId === "parent_confirm") ? null : state.time.absoluteWeek + delay + 12,
    status: "pending", payload: { kind, playerKnown: !hidden, ...payload } });
  return true;
}
export function canRequestParentPlanning(state) {
  return familyContext(state) && !state.parenthood.pregnancy && !state.openCases.some(c => c.type === "parenting-followup" && c.payload.kind === "planning" && c.status !== "resolved");
}
export function requestParentPlanning(state) { schedule(state, "planning", 1); }
export function requestCareBudget(state) { schedule(state, "budget", 1); }
export function processParenthoodWeek(state) {
  const p = state.parenthood;
  if (p.lastWeek === state.time.absoluteWeek) return;
  p.lastWeek = state.time.absoluteWeek;
  if (needsParentCare(state)) {
    if (p.carePlan === "paid") p.careOwedThisMonth += dependents(state).length * 375;
    if (careCovered(state)) p.missedCareWeeks = 0;
    else { p.missedCareWeeks = Math.min(8, p.missedCareWeeks + 1); adjustHealth(state, { energy: -4, stress: 3 }); }
    if (p.missedCareWeeks >= 3 && state.time.absoluteWeek >= (state.events.cooldowns.parent_care_review || 0)) schedule(state, "care", 2);
    if (state.finances.balance < 2500 && state.time.absoluteWeek >= (state.events.cooldowns.parent_budget_review || 0)) schedule(state, "budget", 2);
  } else p.missedCareWeeks = 0;
  for (const child of p.children) {
    const age = childAge(state, child);
    if (age < 6 || age > 17) continue;
    const school = child.school;
    if (school.lastUpdatedWeek === state.time.absoluteWeek) continue;
    school.lastUpdatedWeek = state.time.absoluteWeek;
    const pressure = p.missedCareWeeks > 0 ? 1 : 0;
    school.attendancePressure = Math.min(12, school.attendancePressure + pressure);
    if (age >= 12 && p.missedCareWeeks > 1) school.socialPressure = Math.min(12, school.socialPressure + 1);
    if (school.attendancePressure >= 8) schedule(state, "attendance", 2, { childId: child.id, playerKnown: true });
    if (age >= 12 && school.socialPressure >= 8) schedule(state, "peer", 2, { childId: child.id, playerKnown: true });
    if (age >= 12 && age <= 17 && school.socialPressure >= 6 && !school.hiddenIssue && !state.openCases.some(x => x.payload?.kind === "autonomy" && x.payload.childId === child.id && x.status !== "resolved")) {
      school.hiddenIssue = { kind: "privacy", status: "active", knownToPlayer: false, createdWeek: state.time.absoluteWeek };
      schedule(state, "autonomy", 2, { childId: child.id, playerKnown: false }, "child_autonomy_probe", true);
    }
    if (age >= 12 && age <= 17 && school.issues.some(i => i.status !== "resolved") && child.relationship.tension >= 20) schedule(state, "conflict", 2, { childId: child.id, playerKnown: true }, "child_relationship_conflict");
    if (age >= 6 && age <= 17 && !school.extracurricular && [6, 12, 15].includes(age)) schedule(state, "activity", 2, { childId: child.id, playerKnown: true }, "child_activity_choice");
  }
}
export function processParenthoodCases(state) {
  const p = state.parenthood;
  for (const item of state.openCases) {
    if (item.type === "parenting-followup" && item.payload?.kind === "autonomy" && item.status === "pending" && item.expiresWeek !== null && state.time.absoluteWeek >= item.dueWeek) {
      const child = p.children.find(c => c.id === item.payload.childId);
      if (child?.school?.hiddenIssue) child.school.hiddenIssue.knownToPlayer = true;
      item.eventId = "child_autonomy_disclosure"; item.payload.playerKnown = true; item.expiresWeek = state.time.absoluteWeek + 12;
    }
  }
  for (const item of state.openCases) {
    if (item.type !== "parenting-followup" || item.status === "resolved") continue;
    const stalePregnancy = item.payload.pregnancyId && item.payload.pregnancyId !== p.pregnancy?.id;
    if (stalePregnancy || (item.expiresWeek !== null && state.time.absoluteWeek > item.expiresWeek)) item.status = "resolved";
  }
  const removed = new Set(state.openCases.filter((c) => c.type === "parenting-followup" && c.status === "resolved").map((c) => c.id));
  state.events.queue = state.events.queue.filter((c) => !removed.has(c.sourceCaseId));
  state.openCases = state.openCases.filter((c) => !removed.has(c.id));
  for (const child of p.children) {
    if (!child.stageMark) child.stageMark = { stage: null, transitions: [] };
    if (!child.school) child.school = { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, hiddenIssue: null, lastUpdatedWeek: 0 };
    if (!child.relationship) child.relationship = { closeness: 60, trust: 60, tension: 0 };
    const age = childAge(state, child);
    const stage = childStage(state, child);
    if (child.stageMark?.stage !== stage) {
      const previous = child.stageMark?.stage;
      child.stageMark.stage = stage;
      const milestone = { stage, week: state.time.absoluteWeek };
      if (!child.stageMark.transitions.some(t => t.stage === stage)) child.stageMark.transitions.push(milestone);
      if (state.time.absoluteWeek === child.bornWeek || [6, 12, 15, 18].includes(age)) record(state, `child-stage-${child.id}-${age}`, `${child.name}: ${stage} dönemine geçti.`, child.otherParentId);
      if ([6, 12, 15].includes(age)) schedule(state, "school", 2, { childId: child.id, transition: true }, "child_school_transition");
    if (age === 18) child.trajectory = childAcademicStanding(child) === "iyi" ? "education-focused" : child.relationship.trust >= 60 ? "undecided" : "work-focused";
      if (age === 15) schedule(state, "future", 2, { childId: child.id, playerKnown: true }, "child_future_discussion");
    }
    if (age >= 6 && age <= 17) {
      child.school = child.school || { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, hiddenIssue: null, lastUpdatedWeek: 0 };
      const issue = child.school.issues.find(i => i.kind === "attendance" && i.status !== "resolved");
      if (issue && child.school.attendancePressure <= 2) issue.status = "resolved";
    }
  }
}
export function parenthoodSummary(state) {
  const p = state.parenthood;
  const pregnancy = p?.pregnancy;
  return {
    pregnancy: pregnancy ? pregnancy.phase === "trying" ? "Çocuk için denemeyi seçtiniz; henüz gebelik bilgisi yok." : state.time.absoluteWeek - pregnancy.startWeek < 20 ? "Gebelik biliniyor; hazırlık dönemi." : "Gebelik ilerliyor; doğum ve bakım düzeni yaklaşıyor." : "",
    children: (p?.children || []).map((c) => `${c.name} · ${childAge(state, c)} yaş · ${childStage(state, c)} · okul: ${childAcademicStanding(c)}${c.school?.hiddenIssue?.knownToPlayer ? " · bilinen özel konu" : ""}`),
    care: needsParentCare(state) ? careCovered(state) ? "Bu haftanın bakım düzeni karşılanıyor." : "Bakım bu hafta bir aktivite ister; karşılanmazsa toparlanman zorlaşır." : "",
    alignment: planningAlignment(state),
  };
}
export function parenthoodYearSummary(state, startWeek, endWeek) {
  const births = state.parenthood.children.filter(c => c.bornWeek >= startWeek && c.bornWeek <= endWeek).map(c => `${c.name} bu yıl doğdu.`);
  const stages = state.household.history.filter(h => h.week >= startWeek && h.week <= endWeek && String(h.kind).startsWith("child-stage")).map(h => h.text);
  const school = state.parenthood.children.filter(c => childAge(state,c) >= 6 && childAge(state,c) <= 17 && (c.school?.issues || []).some(i => i.status !== "resolved")).map(c => `${c.name}: okul desteği gerekiyor.`);
  return { ...parenthoodSummary(state), births, stages, school };
}
export function parentChoiceAvailability(state, definition, choice, source) {
  if (["wait", "private", "later"].includes(choice.id)) return { ok: true };
  if (definition.id !== "parent_planning" && (!source || source.status === "resolved" || source.eventId !== definition.id || state.time.absoluteWeek < source.dueWeek)) return { ok: false, reason: "Bu görüşmenin açık ve zamanı gelmiş bir kaydı yok." };
  if (["parent_confirm", "parent_birth", "parent_preparation"].includes(definition.id) && (!state.parenthood.pregnancy || source?.payload.pregnancyId !== state.parenthood.pregnancy.id)) return { ok: false, reason: "Bu gebelik kaydı artık geçerli değil." };
  if (definition.id === "parent_confirm" && state.parenthood.pregnancy?.phase !== "trying") return { ok: false, reason: "Deneme aşaması zaten tamamlandı." };
  if (["parent_birth", "parent_preparation"].includes(definition.id) && state.parenthood.pregnancy?.phase !== "known") return { ok: false, reason: "Bu aşama için bilinen bir gebelik yok." };
  if (["parent_care_review", "parent_budget_review"].includes(definition.id) && !needsParentCare(state)) return { ok: false, reason: "Bu bakım dönemine uygun çocuk yok." };
  if (["parent_planning", "parent_planning_review"].includes(definition.id) && !familyContext(state)) return { ok: false, reason: "Önce ortak yaşam ve aile planlama niyetini konuşmalısınız." };
  if (choice.id.startsWith("try_") && !canTryParenthood(state)) return { ok: false, reason: "Ortak istek, uygun ilişki ve bakım kapasitesi henüz yok. Son doğumdan sonra iki yıllık aralık gerekir." };
  if (!["confirm", "birth"].includes(choice.id) && state.weekly.used >= getWeeklyActivityLimit(state)) return { ok: false, reason: "Bu görüşme haftalık bir aktivite ister." };
  const cost = choice.id === "prepare" ? 500 : choice.id === "studio" && state.household.homeId !== "studio" ? getHomeById("studio").moveCost : 0;
  if (state.finances.balance < cost) return { ok: false, reason: "Bu seçim için bütçe yetersiz." };
  return { ok: true };
}
export function resolveParentChoice(state, definition, choiceId, source) {
  const p = state.parenthood;
  const id = definition.id;
  if (source) source.status = "resolved";
  if (["private", "later"].includes(choiceId)) {
    if (id === "parent_preparation" || id === "parent_housing_review") adjustHealth(state, { stress: 2 });
    return;
  }
  if (choiceId === "wait") {
    if (id === "parent_planning") schedule(state, "planning", 12);
    return;
  }
  if (!["confirm", "birth"].includes(choiceId)) { state.weekly.used += 1; state.weekly.selectedIds.push(`parent:${id}`); }
  if (["parent_planning", "parent_planning_review"].includes(id)) {
    const partnerId = state.social.currentPartnerNpcId;
    if (choiceId === "no") { state.household.union.familyPlan.intent = "no"; record(state, "parent-decision", "Şimdilik çocuk sahibi olma yoluna girmemeyi seçtin.", partnerId); }
    else if (choiceId === "want") { state.household.union.familyPlan.intent = "wants"; record(state, "parent-intent", "Çocuk istediğini açıkça söyledin; partnerinin niyeti otomatik değişmedi.", partnerId); schedule(state, "planning", 4); }
    else if (choiceId === "discuss") {
      const r = getRelationship(state, partnerId);
      if (!["no", "unsure"].includes(state.household.union.familyPlan.response)) state.household.union.familyPlan.response = state.finances.balance >= getMonthlySummary(state).expenses * 3 && r.trust >= 75 && r.tension <= 15 ? "wants" : "not_now";
      record(state, "parent-discussion", `Çocuk planını yeniden konuştunuz. ${planningAlignment(state)}.`, partnerId);
      schedule(state, "planning", 4);
    } else if (choiceId.startsWith("try_")) {
      const pregnancy = { id: `pregnancy-${state.time.absoluteWeek}`, startWeek: state.time.absoluteWeek, phase: "trying", carrier: choiceId === "try_self" ? "player" : "partner", otherParentId: partnerId };
      p.pregnancy = pregnancy;
      record(state, "parent-try", "Uygun gebelik senaryosunu açıkça seçerek çocuk için denemeye karar verdiniz.", partnerId);
      schedule(state, "preparation", 4, { pregnancyId: pregnancy.id }, "parent_confirm", true);
    }
  } else if (id === "parent_confirm") {
    if (!familyContext(state) || state.social.currentPartnerNpcId !== p.pregnancy.otherParentId || state.household.union.familyPlan.intent !== "wants" || state.household.union.familyPlan.response !== "wants") {
      record(state, "parent-paused", "Ortak plan değişti; deneme süreci gebelik başlamadan durdu.", p.pregnancy.otherParentId); p.pregnancy = null; return;
    }
    p.pregnancy.phase = "known";
    record(state, "pregnancy", "Gebelik haberini aldınız; ortak hayatın hazırlık dönemi başladı.", p.pregnancy.otherParentId);
    createSecret(state, { id: p.pregnancy.id, summary: "Gebelik haberi", type: "family", knownBy: ["player", p.pregnancy.otherParentId] });
    schedule(state, "preparation", 8, { pregnancyId: p.pregnancy.id });
    schedule(state, "birth", 36, { pregnancyId: p.pregnancy.id });
  } else if (id === "parent_preparation") {
    transact(state, -500, "Doğum ve bakım hazırlığı", "parenting");
    adjustHealth(state, { energy: -3, stress: -2 });
    record(state, "pregnancy-prepared", "Doğum ve ilk bakım düzeni için zaman ve bütçe ayırdınız.", p.pregnancy.otherParentId);
  } else if (id === "parent_birth") {
    const pregnancy = p.pregnancy;
    const childId = `child-${pregnancy.startWeek}`;
    if (p.children.some((c) => c.id === childId)) return;
    const child = { id: childId, name: `Çocuk ${p.children.length + 1}`, bornWeek: state.time.absoluteWeek, otherParentId: pregnancy.otherParentId, livesWithPlayer: true,
      relationship: { closeness: 60, trust: 60, tension: 0 }, futurePreference: null, school: { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, hiddenIssue: null, lastUpdatedWeek: 0 }, stageMark: { stage: null, transitions: [] } };
    p.children.push(child); p.pregnancy = null;
    record(state, `birth-${childId}`, `${child.name} doğdu; hanene katıldı. Düzenli bakım ve çocuk giderleri başladı.`, child.otherParentId);
    createSecret(state, { id: childId, summary: `${child.name}: doğum haberi`, type: "family", knownBy: ["player", child.otherParentId] });
    schedule(state, "support", 4, { childId });
    if (state.household.homeId !== "studio") schedule(state, "housing", 8, { childId });
  } else if (id === "parent_care_review") {
    p.coveredUntil = state.time.absoluteWeek + 3; p.missedCareWeeks = 0;
    adjustHealth(state, { stress: -2 });
    const other = p.children.find((c) => c.livesWithPlayer)?.otherParentId;
    if (other && other === state.social.currentPartnerNpcId && state.household.union.cohabitingSince) applyRelationshipDelta(state, other, { trust: 1, tension: -2 });
    record(state, "care-arrangement", "Önümüzdeki haftalar için bakım saatlerini düzenledin; bunun için zaman ayırdın.", other);
  } else if (id === "parent_budget_review") {
    p.carePlan = choiceId === "paid" ? "paid" : "home";
    record(state, "care-budget", choiceId === "paid" ? "Ücretli bakım düzenini seçtin; aylık çocuk gideri arttı." : "Bakımı kendi zamanınla karşılamayı seçtin; haftalık karar alanın daralıyor.", state.social.currentPartnerNpcId);
  } else if (id === "parent_family_support") {
    const child = p.children.find((c) => c.id === source.payload.childId);
    if (child && transferSecret(state, child.id, "anne")) {
      const supportive = state.player.background.family === "supportive" && getRelationship(state, "anne").trust >= 45;
      p.coveredUntil = Math.max(p.coveredUntil, state.time.absoluteWeek + (supportive ? 3 : 0));
      applyRelationshipDelta(state, "anne", { trust: 1, tension: state.player.background.family === "demanding" ? 2 : 0 });
      record(state, `grandparent-${child.id}`, supportive ? "Anne doğum haberini öğrendi; dört haftalık bakım desteğini konuştunuz." : "Anne doğum haberini öğrendi; bu haftalık yardımın sınırlarını konuştunuz.", "anne");
    }
  } else if (id === "parent_housing_review") {
    relocateHome(state, "studio");
    record(state, "child-housing", "Çocuğun bakım alanı için stüdyoya taşındın.", state.social.currentPartnerNpcId);
  } else if (["child_school_transition", "child_attendance_concern", "child_peer_concern", "child_relationship_conflict", "child_conflict_repair", "child_autonomy_disclosure", "child_autonomy_followup", "child_other_parent_contact", "child_contact_followup", "child_activity_choice", "child_activity_review", "child_future_discussion"].includes(id)) {
    const child = p.children.find(c => c.id === source?.payload?.childId);
    if (!child) return;
    const age = childAge(state, child); const school = child.school || (child.school = { attendancePressure: 0, socialPressure: 0, issues: [], extracurricular: null, hiddenIssue: null, lastUpdatedWeek: 0 });
    if (id === "child_school_transition") { record(state, `school-start-${child.id}-${age}`, `${child.name} için ${childStage(state, child)} okul geçişini konuştunuz.`, child.otherParentId); return; }
    if (id === "child_attendance_concern") {
      const issue = school.issues.find(i => i.kind === "attendance") || { kind: "attendance", status: "active", createdWeek: state.time.absoluteWeek };
      if (!school.issues.includes(issue)) school.issues.push(issue);
      if (choiceId === "support") { issue.status = "managed"; school.attendancePressure = Math.max(0, school.attendancePressure - 4); child.relationship.trust = Math.min(100, child.relationship.trust + 2); }
      else { school.attendancePressure = Math.min(12, school.attendancePressure + 1); child.relationship.tension = Math.min(100, child.relationship.tension + 2); }
      record(state, `school-${child.id}`, choiceId === "support" ? `${child.name} için okul düzenine destek oldun.` : `${child.name} için okul uyarısını erteledin.`, child.otherParentId); return;
    }
    if (id === "child_peer_concern") { school.socialPressure = choiceId === "support" ? Math.max(0, school.socialPressure - 3) : Math.min(12, school.socialPressure + 1); record(state, `peer-${child.id}`, `${child.name} sosyal çevresi hakkında bir konuşma yaptınız.`, child.otherParentId); return; }
    if (id === "child_relationship_conflict") { child.relationship.tension = Math.min(100, child.relationship.tension + (choiceId === "listen" ? 0 : 3)); child.relationship.trust = Math.max(0, child.relationship.trust + (choiceId === "listen" ? 2 : -2)); record(state, `child-conflict-${child.id}`, `${child.name} ile bir anlaşmazlığı konuştunuz.`, child.otherParentId); schedule(state, "conflict", 4, { childId: child.id }, "child_conflict_repair"); return; }
    if (id === "child_conflict_repair") { if (choiceId === "repair") { child.relationship.trust = Math.min(100, child.relationship.trust + 3); child.relationship.tension = Math.max(0, child.relationship.tension - 4); } record(state, `child-repair-${child.id}`, `${child.name} ile anlaşmazlığın ardından yeniden konuştunuz.`, child.otherParentId); return; }
    if (id === "child_autonomy_disclosure") { if (!school.hiddenIssue) school.hiddenIssue = { kind: "privacy", status: "active", knownToPlayer: false, createdWeek: state.time.absoluteWeek }; if (choiceId === "listen") { school.hiddenIssue.knownToPlayer = true; child.relationship.trust = Math.min(100, child.relationship.trust + 3); } else child.relationship.tension = Math.min(100, child.relationship.tension + 3); record(state, `child-autonomy-${child.id}`, `${child.name} ile mahremiyet ve karar alanı üzerine konuştunuz.`, child.otherParentId); schedule(state, "autonomy", 4, { childId: child.id }, "child_autonomy_followup"); return; }
    if (id === "child_autonomy_followup") { record(state, `child-autonomy-followup-${child.id}`, `${child.name} ile karar alanını yeniden değerlendirdiniz.`, child.otherParentId); return; }
    if (id === "child_other_parent_contact") { record(state, `child-contact-${child.id}`, `${child.name} için diğer ebeveynle iletişim düzenini sürdürdünüz.`, child.otherParentId); schedule(state, "contact", 4, { childId: child.id }, "child_contact_followup"); return; }
    if (id === "child_contact_followup") { record(state, `child-contact-followup-${child.id}`, `${child.name} için diğer ebeveynle temasın devamını değerlendirdiniz.`, child.otherParentId); return; }
    if (id === "child_activity_choice") { if (choiceId === "join") { school.extracurricular = { name: "kurs", monthlyCost: 450 }; transact(state, -450, "Çocuk etkinliği başlangıcı", "parenting"); schedule(state, "activity", 12, { childId: child.id }, "child_activity_review"); } return; }
    if (id === "child_activity_review") { if (choiceId === "stop") school.extracurricular = null; record(state, `child-activity-${child.id}`, `${child.name} için etkinlik düzenini gözden geçirdiniz.`, child.otherParentId); return; }
    if (id === "child_future_discussion") { child.futurePreference = childAcademicStanding(child) === "iyi" ? "education" : child.relationship.trust < 45 ? "work" : "undecided"; if (choiceId === "support") child.relationship.trust = Math.min(100, child.relationship.trust + 2); if (choiceId === "push") child.relationship.tension = Math.min(100, child.relationship.tension + 3); record(state, `child-future-${child.id}`, `${child.name} ile geleceğe dair yönelimleri konuştunuz.`, child.otherParentId); return; }
  }
}
const choice = (id, label) => ({ id, label, effects: {} });
const event = (id, title, text, choices, condition = () => false) => ({ id, title, text, choices, condition, repeat: "cooldown", cooldownWeeks: 24, parenting: true, validateChoice: parentChoiceAvailability });
const planningChoices = () => [choice("wait", "Şimdi değil, bekle"), choice("no", "Çocuk planına girme · bir aktivite"), choice("discuss", "Niyetleri yeniden konuş · bir aktivite"), choice("want", "Çocuk istediğimi söyle · bir aktivite"), choice("try_self", "Gebeliği taşıyabilirim; ben taşıyacağım senaryoda denemeyi seç · bir aktivite"), choice("try_partner", "Partnerim gebeliği taşıyabiliyor; bu senaryoda denemeyi seç · bir aktivite")];
export const PARENTING_EVENTS = [
  event("parent_planning", "Ebeveynliğe geçmek mi?", "Ortak istek olsa da denemek ayrı karardır. Yalnız sizin için mümkün olan gebelik yolunu açıkça seçin. Beklemek veya çocuk istememek geçerli kararlardır.", planningChoices(), (s) => familyContext(s) && !s.parenthood.pregnancy && s.player.age <= 35 && !s.openCases.some((c) => c.type === "parenting-followup" && c.payload.kind === "planning" && c.status !== "resolved") && s.household.union.familyPlan.intent !== "no" && s.parenthood.children.every((c) => s.time.absoluteWeek - c.bornWeek >= 96)),
  event("parent_planning_review", "Çocuk planını tekrar konuşmak", "Bütçe, ilişkiniz ve niyetleriniz aynı olmayabilir. Görüş ayrılığı gebelik veya ayrılık kararına kendiliğinden dönüşmez.", planningChoices()),
  event("parent_confirm", "Ortak planın sonraki adımı", "Denemeyi seçtiğiniz yolun sonucu ve ortak planınız yeniden değerlendiriliyor.", [choice("confirm", "Haberi değerlendir")]),
  event("parent_preparation", "Doğuma hazırlanmak", "Bakım, iş ve dinlenme saatlerini konuşmak gerekiyor. Bu hazırlık gerçek zaman ve ₺500 bütçe kullanır.", [choice("later", "Hazırlığı ertele"), choice("prepare", "Hazırlığa zaman ayır · bir aktivite")]),
  event("parent_birth", "Haneye yeni biri katılıyor", "Doğumla birlikte bakım sorumluluğu ve düzenli giderler başlıyor. Bu temel senaryoda çocuk senin hanende yaşayacak; diğer ebeveynin kaydı korunur.", [choice("birth", "Çocuğunu karşıla")]),
  event("parent_care_review", "Bakım saatleri sıkışıyor", "Üst üste karşılanmayan bakım zamanı dinlenmene yansıyor. Bakım için yer açmadan ek mesaiyi büyütemezsin.", [choice("later", "Bu hafta düzen kuramıyorum"), choice("arrange", "Bakım saatlerini düzenle · bir aktivite")]),
  event("parent_budget_review", "Çocuk giderleri ve zaman", "Ücretli bakım çocuk başına aylık ₺1.500 ekler; evde bakım haftalık aktivite ister. Bu tercihler gelir yaratmaz.", [choice("later", "Mevcut düzeni sürdür"), choice("home", "Bakımı kendi zamanımla karşıla · bir aktivite"), choice("paid", "Ücretli bakım düzeni seç · bir aktivite")]),
  event("parent_family_support", "Anne'yle bakım sınırları", "Doğum haberini Anne'yle paylaşabilir, ne kadar yardımın mümkün olduğunu konuşabilirsin. Haber kendiliğinden aileye yayılmaz.", [choice("private", "Şimdilik paylaşma"), choice("tell", "Haberi ve yardım ihtiyacını konuş · bir aktivite")]),
  event("parent_housing_review", "Bakım için yer açmak", "Mevcut evde ortak alan ve mahremiyet sınırlı. Daha bağımsız alan gerçek taşınma masrafı ve farklı aylık gider demektir.", [choice("later", "Mevcut evde kal"), choice("studio", "Stüdyoya taşın · bir aktivite")]),
  event("child_school_transition", "Çocuğun okul dönemi", "Yeni okul dönemi için destek ve zaman ayırmayı seçebilirsin.", [choice("support", "Destek ol · bir aktivite"), choice("later", "Şimdilik ertele")], s => s.parenthood.children.some(c => childAge(s,c) >= 6 && childAge(s,c) <= 17)),
  event("child_attendance_concern", "Okuldan gelen uyarı", "Çocuğun devam düzeniyle ilgili bir sorun görünür oldu.", [choice("support", "Birlikte düzen kur · bir aktivite"), choice("ignore", "Şimdilik ertele")]),
  event("child_peer_concern", "Sosyal çevre kaygısı", "Çocuğun sosyal uyumuyla ilgili konuşmak gerekiyor.", [choice("support", "Dinle ve destek ol · bir aktivite"), choice("ignore", "Şimdilik ertele")]),
  event("child_relationship_conflict", "Çocukla anlaşmazlık", "Önemli bir kararda çocuğunla aynı düşünmüyorsunuz.", [choice("listen", "Dinle · bir aktivite"), choice("insist", "Israr et · bir aktivite")]),
  event("child_autonomy_disclosure", "Ergenlikte mahremiyet", "Çocuğun bazı kararları kendisinin almak istediğini söylüyor.", [choice("listen", "Alan aç ve dinle · bir aktivite"), choice("insist", "Sınırı koru · bir aktivite")]),
  event("child_other_parent_contact", "Diğer ebeveynle temas", "Ayrı hanelerde yaşayan ebeveynler için planlı temas zamanı geldi.", [choice("support", "Teması kolaylaştır · bir aktivite"), choice("later", "Bu hafta ertele")], s => s.parenthood.children.some(c => childAge(s,c) >= 6 && c.otherParentId && s.household.union?.separatedSince)),
  event("child_activity_choice", "Bir etkinlik seçeneği", "Çocuğun için zaman ve bütçe gerektiren bir etkinlik seçeneği var.", [choice("join", "Katılımı başlat · bir aktivite"), choice("later", "Şimdilik bekle")]),
  event("child_conflict_repair", "Çocukla yeniden konuşmak", "Anlaşmazlığın ardından ilişkiyi onarmak için bir fırsat var.", [choice("repair", "Yeniden konuş · bir aktivite"), choice("later", "Şimdilik bekle")]),
  event("child_autonomy_followup", "Ergenlik konuşmasının devamı", "Mahremiyet ve karar alanı üzerine önceki konuşmayı yeniden değerlendirebilirsin.", [choice("listen", "Dinlemeye devam et · bir aktivite"), choice("later", "Şimdilik bekle")]),
  event("child_activity_review", "Etkinlik düzenini gözden geçir", "Çocuğun etkinliğinin zaman ve bütçe yükü yeniden değerlendirilebilir.", [choice("continue", "Sürdür"), choice("stop", "Sonlandır · bir aktivite")]),
  event("child_contact_followup", "Diğer ebeveyn teması", "Ayrı haneler arasındaki temasın nasıl sürdüğünü değerlendirebilirsin.", [choice("support", "Teması sürdür · bir aktivite"), choice("later", "Şimdilik bekle")]),
  event("child_future_discussion", "Gelecek üzerine konuşma", "Ergenlik döneminde eğitim, çalışma veya biraz daha zaman tanımak üzerine konuşabilirsiniz.", [choice("support", "Tercihini destekle · bir aktivite"), choice("push", "Başka bir yolu öner · bir aktivite"), choice("later", "Zaman tanı")]),
];
