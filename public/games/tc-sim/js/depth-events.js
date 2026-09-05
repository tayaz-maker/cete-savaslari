import { addMemory, addNpcMemory, addCareerHistory } from "./state.js?v=7";
import { getHomeById, getNextCareerStep, promoteCareer } from "./life.js?v=7";
import { applyRelationshipDelta } from "./social.js?v=7";

const followup = (state, eventId, payload, delay = 4, expires = 8) => {
  const id = `depth-${eventId}-${state.time.absoluteWeek}`;
  state.openCases.push({
    id,
    type: "depth-followup",
    createdWeek: state.time.absoluteWeek,
    dueWeek: state.time.absoluteWeek + delay,
    expiresWeek: state.time.absoluteWeek + expires,
    eventId,
    status: "pending",
    payload,
  });
  return id;
};

export const DEPTH_EVENTS = [
  {
    id: "career_responsibility_offer",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 28,
    title: "Sorumluluk teklifi",
    text: "Yöneticin, zor bir işi senin üstlenmeni istiyor. Karşılığında adın daha görünür olacak.",
    condition: (state) => {
      const next = getNextCareerStep(state);
      return Boolean(next && state.career.weeksInRole >= 12 && state.career.performance >= 65 && !state.flags.careerResponsibilityPending);
    },
    choices: [
      {
        id: "accept",
        label: "Sorumluluğu al",
        effects: { health: { energy: -4, stress: 5 }, flags: { careerResponsibilityPending: true }, memory: "İşte ek sorumluluk aldın.", reason: "Ek sorumluluk" },
      },
      {
        id: "decline",
        label: "Bu kez alma",
        effects: { social: { anne: { tension: 1 } }, health: { stress: -2 }, memory: "İşte ek sorumluluğu bu kez kabul etmedin." },
      },
    ],
  },
  {
    id: "career_responsibility_review",
    social3D: true,
    repeat: "once",
    title: "Kararın karşılığı",
    text: "Üstlendiğin iş tamamlandı. Şimdi bunu daha kalıcı bir role dönüştürüp dönüştürmeyeceğine karar vermen gerekiyor.",
    condition: () => false,
    choices: [
      { id: "advance", label: "Üst pozisyona geç", effects: { health: { stress: 5 }, memory: "Ek sorumluluğu kariyer adımına çevirdin." } },
      { id: "steady", label: "Mevcut tempoda kal", effects: { health: { stress: -4 }, memory: "Ek sorumluluğun ardından mevcut tempoda kalmayı seçtin." } },
    ],
  },
  {
    id: "family_independence_talk",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 32,
    title: "Evde gelecek konuşması",
    text: "Aylin, işin ve yaşın ilerlerken evde ne kadar daha kalmayı düşündüğünü açıkça soruyor.",
    condition: (state) => state.household.homeId === "family" && state.time.absoluteWeek >= 20 && state.career.jobId !== null,
    choices: [
      {
        id: "plan",
        label: "Taşınmayı planla",
        effects: { social: { anne: { trust: -1, tension: 4 } }, health: { stress: 3 }, flags: { familyMovePlan: true }, memory: "Ailene taşınmayı planladığını söyledin." },
      },
      {
        id: "stay",
        label: "Şimdilik kalacağım de",
        effects: { social: { anne: { trust: 2, tension: 2 } }, npcMemory: { personId: "anne", type: "home_stay_decision", text: "Şimdilik evde kalacağını söyledi." }, memory: "Şimdilik aile evinde kalmaya karar verdin." },
      },
    ],
  },
  {
    id: "family_independence_followup",
    social3D: true,
    repeat: "once",
    title: "Aile evinden sonra",
    text: "Taşınma konuşmasının üzerinden birkaç hafta geçti. Ailen kararının gerçekten arkasında olup olmadığını görmek istiyor.",
    condition: () => false,
    choices: [
      { id: "move", label: "Bu ay taşın", effects: { social: { anne: { closeness: -2, tension: 5 }, baba: { tension: 3 } }, health: { stress: 4 }, memory: "Aile evinden ayrılma kararını netleştirdin." } },
      { id: "delay", label: "Biraz daha bekle", effects: { social: { anne: { trust: -2, tension: 5 } }, health: { stress: 4 }, memory: "Taşınma kararını bir kez daha erteledin." } },
    ],
  },
  {
    id: "family_obligation",
    social3D: true,
    repeat: "cooldown",
    cooldownWeeks: 36,
    title: "Aileden önemli bir rica",
    text: "Babanın hafta sonu yardımına ihtiyacı var. İş ve eğitim planını buna göre düzenlemen gerekecek.",
    condition: (state) =>
      state.household.homeId === "family" &&
      getHomeById(state.household.homeId)?.privacy <= 1 &&
      state.time.absoluteWeek >= 16 &&
      state.career.jobId !== null,
    choices: [
      { id: "attend", label: "Yanında ol", effects: { health: { energy: -6, stress: -2 }, social: { baba: { trust: 4, tension: -3 } }, npcMemory: { personId: "baba", type: "family_obligation_kept", text: "İhtiyacı olduğunda yanında oldu." }, memory: "Ailenin önemli bir işinde yanında oldun." } },
      { id: "ignore", label: "Bu hafta gelemem de", effects: { health: { stress: 5 }, social: { baba: { trust: -5, tension: 7 } }, npcMemory: { personId: "baba", type: "family_obligation_missed", text: "Önemli bir günde gelemedi." }, memory: "Ailenin önemli ricasını geri çevirdin." } },
    ],
  },
];

export function applyDepthResolution(state, definition, choiceId) {
  if (definition.id === "career_responsibility_offer" && choiceId === "accept") {
    followup(state, "career_responsibility_review", { kind: "career" }, 6, 10);
  }
  if (definition.id === "career_responsibility_review") {
    state.flags.careerResponsibilityPending = null;
    if (choiceId === "advance") {
      const result = promoteCareer(state);
      if (!result.ok) addCareerHistory(state, { type: "career_setback", label: "Ek sorumluluk aldın ama uygun bir üst pozisyon açılmadı." });
    } else {
      addCareerHistory(state, { type: "responsibility_declined", label: "Ek sorumluluğun ardından mevcut tempoda kaldın." });
    }
  }
  if (definition.id === "family_independence_talk" && choiceId === "plan")
    followup(state, "family_independence_followup", { kind: "family" }, 8, 14);
  if (definition.id === "family_independence_followup" && choiceId === "move") {
    state.flags.familyMovePlan = null;
    addNpcMemory(state, "anne", "Taşınma kararını gerçekten uyguladı.", "move_plan_kept");
  }
}

export function expireDepthCases(state) {
  for (const item of state.openCases) {
    if (item.type !== "depth-followup" || item.status !== "pending" || !Number.isInteger(item.expiresWeek)) continue;
    if (state.time.absoluteWeek > item.expiresWeek) {
      item.status = "resolved";
      addMemory(state, "Bir hayat meselesinin süresi geçti; kararını zamanında netleştiremedin.");
      if (item.payload?.kind === "career") state.career.performance = Math.max(0, state.career.performance - 5);
      if (item.payload?.kind === "family") applyRelationshipDelta(state, "anne", { trust: -3, tension: 5 });
    }
  }
}
