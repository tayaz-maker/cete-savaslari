import {
  WEEKLY_ACTIVITY_LIMIT,
  addMemory,
  addNpcMemory,
  adjustHealth,
  clamp,
  transact,
  updateRelationship,
} from "./state.js";

export const RELATIONSHIP_STAGES = {
  acquaintance: "Tanışık",
  friend: "Arkadaş",
  close: "Yakın",
  romantic_interest: "Romantik ilgi",
  partner: "Sevgili",
  family: "Aile",
  work_contact: "İş bağlantısı",
};

export const SOCIAL_ROLE_LABELS = {
  family: "Aile",
  friend: "Arkadaş",
  acquaintance: "Tanıdık",
  work_contact: "İş bağlantısı",
};

const ACTIONS = {
  meet: { title: "Görüş", detail: "₺250 · yakınlık +6 · güven +2", cost: 250 },
  confide: { title: "Dertleş", detail: "yakınlık +3 · güven +5 · stres −5", cost: 0 },
  help: { title: "Yardım et", detail: "₺400 · güven +7 · yakınlık +2", cost: 400 },
  repair: { title: "Arayı düzelt", detail: "gerilim −14 · güven +3", cost: 0 },
  fulfill_promise: { title: "Sözünü tut", detail: "açık yardımı tamamla · güven +10", cost: 300 },
  advance_romance: { title: "İlişkiyi ileri taşı", detail: "romantik ilgiyi açıkça konuş", cost: 200 },
};

export function getPerson(state, personId) {
  return state.people.find((person) => person.id === personId) || null;
}

export function getRelationship(state, personId) {
  const person = getPerson(state, personId);
  if (!person) return null;
  return {
    closeness: state.relationships[personId],
    trust: person.social.trust,
    tension: person.social.tension,
    lastMeaningfulContactWeek: person.social.lastMeaningfulContactWeek,
    romanceStatus: person.social.romanceStatus,
  };
}

export function getRelationshipStage(state, personId) {
  const person = getPerson(state, personId);
  const relationship = getRelationship(state, personId);
  if (!person || !relationship) return "acquaintance";
  if (person.roleId === "family") return "family";
  if (state.social.currentPartnerNpcId === personId || relationship.romanceStatus === "partner")
    return "partner";
  if (relationship.romanceStatus === "interest") return "romantic_interest";
  if (person.roleId === "work_contact" && relationship.closeness < 45) return "work_contact";
  if (relationship.closeness >= 72 && relationship.trust >= 62 && relationship.tension <= 45)
    return "close";
  if (relationship.closeness >= 42) return "friend";
  return "acquaintance";
}

export function applyRelationshipDelta(state, personId, delta = {}) {
  const person = getPerson(state, personId);
  if (!person) return false;
  if (Number.isFinite(delta.closeness)) updateRelationship(state, personId, delta.closeness);
  if (Number.isFinite(delta.trust)) person.social.trust = clamp(person.social.trust + delta.trust);
  if (Number.isFinite(delta.tension))
    person.social.tension = clamp(person.social.tension + delta.tension);
  return true;
}

export function markMeaningfulContact(state, personId) {
  const person = getPerson(state, personId);
  if (!person) return false;
  person.social.lastMeaningfulContactWeek = state.time.absoluteWeek;
  return true;
}

export function getOpenSocialCase(state, personId) {
  return (
    state.openCases.find(
      (item) =>
        item.type === "social-obligation" &&
        item.status === "pending" &&
        item.payload?.personId === personId,
    ) || null
  );
}

export function createSocialObligation(state, personId) {
  const person = getPerson(state, personId);
  if (!person || getOpenSocialCase(state, personId)) return false;
  const id = `social-promise-${personId}-${state.time.absoluteWeek}`;
  state.openCases.push({
    id,
    type: "social-obligation",
    createdWeek: state.time.absoluteWeek,
    dueWeek: state.time.absoluteWeek + 3,
    eventId: "social_promise_due",
    status: "pending",
    payload: { personId },
  });
  addMemory(state, `${person.name}'e üç hafta içinde yardım edeceğine söz verdin.`, "important");
  addNpcMemory(state, personId, "Yardım edeceğine söz verdi.", "promise_made");
  return true;
}

export function resolveSocialObligation(state, personId, success) {
  const item = state.openCases.find(
    (candidate) =>
      candidate.type === "social-obligation" &&
      candidate.payload?.personId === personId &&
      ["pending", "triggered"].includes(candidate.status),
  );
  if (!item || item.resolutionApplied) return false;
  item.status = "resolved";
  item.resolutionApplied = true;
  if (success) {
    applyRelationshipDelta(state, personId, { closeness: 4, trust: 10, tension: -5 });
    addMemory(state, `${getPerson(state, personId).name}'e verdiğin sözü tuttun.`, "important");
    addNpcMemory(state, personId, "Verdiği sözü zamanında tuttu.", "promise_kept");
    markMeaningfulContact(state, personId);
  } else {
    applyRelationshipDelta(state, personId, { closeness: -4, trust: -12, tension: 12 });
    addMemory(state, `${getPerson(state, personId).name}'e verdiğin sözü tutamadın.`, "important");
    addNpcMemory(state, personId, "Verdiği sözü tutmadı.", "promise_broken");
  }
  return true;
}

export function setRomanticInterest(state, personId) {
  const person = getPerson(state, personId);
  if (!person || person.roleId === "family" || !person.tags.includes("romance_available"))
    return false;
  if (person.social.romanceStatus !== "none") return false;
  person.social.romanceStatus = "interest";
  addNpcMemory(state, personId, "Aramızdaki romantik ihtimali açıkça konuştuk.", "romance_started");
  addMemory(state, `${person.name} ile aranda romantik bir ilgi oluştu.`, "important");
  return true;
}

export function canBecomePartner(state, personId) {
  const person = getPerson(state, personId);
  const relationship = getRelationship(state, personId);
  if (!person || !relationship) return false;
  return (
    !state.social.currentPartnerNpcId &&
    person.roleId !== "family" &&
    person.tags.includes("romance_available") &&
    relationship.romanceStatus === "interest" &&
    relationship.closeness >= 68 &&
    relationship.trust >= 62 &&
    relationship.tension <= 35
  );
}

export function becomePartner(state, personId) {
  if (!canBecomePartner(state, personId)) return false;
  const person = getPerson(state, personId);
  state.social.currentPartnerNpcId = personId;
  person.social.romanceStatus = "partner";
  addNpcMemory(state, personId, "İlişkimizi sevgililik olarak tanımladık.", "became_partner");
  addMemory(state, `${person.name} ile sevgili oldunuz.`, "important");
  return true;
}

export function canUseSocialAction(state, personId, actionId) {
  const person = getPerson(state, personId);
  const relationship = getRelationship(state, personId);
  const action = ACTIONS[actionId];
  if (!person || !relationship || !action) return { ok: false, reason: "Sosyal işlem geçersiz." };
  if (state.events.active) return { ok: false, reason: "Önce açık olayı sonuçlandır." };
  if (state.weekly.used >= WEEKLY_ACTIVITY_LIMIT)
    return { ok: false, reason: "Bu haftanın aktivite hakkı bitti." };
  const decisionId = `social:${personId}:${actionId}`;
  if (state.weekly.selectedIds.includes(decisionId))
    return { ok: false, reason: "Bu kişiyle aynı etkileşimi bu hafta yaptın." };
  if (state.finances.balance < action.cost) return { ok: false, reason: "Yeterli paran yok." };
  if (actionId === "confide" && relationship.closeness < 40)
    return { ok: false, reason: "Dertleşmek için önce biraz yakınlaşmalısınız." };
  if (actionId === "repair" && relationship.tension < 25 && relationship.trust >= 45)
    return { ok: false, reason: "Şu an onarılması gereken belirgin bir gerilim yok." };
  if (actionId === "fulfill_promise" && !getOpenSocialCase(state, personId))
    return { ok: false, reason: "Bu kişiye verilmiş açık bir söz yok." };
  if (actionId === "advance_romance" && !canBecomePartner(state, personId))
    return { ok: false, reason: "İlişki henüz sevgililiğe hazır değil." };
  return { ok: true, action, decisionId };
}

export function getAvailableSocialActions(state, personId) {
  return Object.entries(ACTIONS)
    .map(([id, action]) => ({ id, ...action, availability: canUseSocialAction(state, personId, id) }))
    .filter((action) => {
      if (["repair", "fulfill_promise", "advance_romance"].includes(action.id))
        return action.availability.ok;
      return true;
    });
}

export function applySocialAction(state, personId, actionId) {
  const check = canUseSocialAction(state, personId, actionId);
  if (!check.ok) return check;
  const person = getPerson(state, personId);
  if (check.action.cost) transact(state, -check.action.cost, `${person.name}: ${check.action.title}`, "social");
  if (actionId === "meet") {
    applyRelationshipDelta(state, personId, { closeness: 6, trust: 2, tension: -2 });
    adjustHealth(state, { energy: -6, stress: -3 });
    addNpcMemory(state, personId, "Birlikte vakit geçirdik.", "met");
  } else if (actionId === "confide") {
    applyRelationshipDelta(state, personId, { closeness: 3, trust: 5, tension: -3 });
    adjustHealth(state, { energy: -3, stress: -5 });
    addNpcMemory(state, personId, "Benimle açıkça dertleşti.", "confided");
  } else if (actionId === "help") {
    applyRelationshipDelta(state, personId, { closeness: 2, trust: 7, tension: -2 });
    adjustHealth(state, { energy: -5, stress: 1 });
    addNpcMemory(state, personId, "İhtiyacım olduğunda yardım etti.", "helped");
  } else if (actionId === "repair") {
    applyRelationshipDelta(state, personId, { closeness: 1, trust: 3, tension: -14 });
    adjustHealth(state, { energy: -3, stress: -4 });
    addNpcMemory(state, personId, "Aramızdaki gerilimi konuşarak azalttı.", "repaired");
  } else if (actionId === "fulfill_promise") {
    resolveSocialObligation(state, personId, true);
  } else if (actionId === "advance_romance") {
    becomePartner(state, personId);
  }
  if (actionId !== "fulfill_promise") markMeaningfulContact(state, personId);
  state.weekly.used += 1;
  state.weekly.selectedIds.push(check.decisionId);
  state.social.engaged = true;
  return { ok: true, message: `${person.name}: ${check.action.title} tamamlandı.` };
}

export function applySocialMaintenance(state) {
  const week = state.time.absoluteWeek;
  if (state.social.lastMaintenanceWeek === week) return false;
  for (const person of state.people) {
    const relationship = getRelationship(state, person.id);
    const gap = week - relationship.lastMeaningfulContactWeek;
    const stage = getRelationshipStage(state, person.id);
    const threshold = stage === "partner" ? 5 : stage === "close" || stage === "family" ? 8 : 12;
    if (gap > threshold && gap % 4 === 0) {
      applyRelationshipDelta(state, person.id, {
        closeness: stage === "partner" ? -2 : -1,
        trust: stage === "partner" ? -1 : 0,
        tension: stage === "partner" ? 1 : 0,
      });
    }
  }
  state.social.lastMaintenanceWeek = week;
  return true;
}
