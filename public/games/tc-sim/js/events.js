import {
  addEventHistory,
  addMemory,
  addNpcMemory,
  adjustHealth,
  transact,
  updateRelationship,
} from "./state.js";

function applyEffects(state, effects = {}) {
  if (effects.money) transact(state, effects.money, effects.reason || "Event sonucu", "event");
  if (effects.health) adjustHealth(state, effects.health);
  if (effects.relationships) {
    for (const [personId, amount] of Object.entries(effects.relationships))
      updateRelationship(state, personId, amount);
  }
  if (effects.flags) Object.assign(state.flags, effects.flags);
  if (effects.memory) addMemory(state, effects.memory, effects.importance || "normal");
  if (effects.npcMemory) addNpcMemory(state, effects.npcMemory.personId, effects.npcMemory.text);
}

export const EVENT_DEFINITIONS = [
  {
    id: "family_budget_talk",
    repeat: "once",
    title: "Evde para konuşması",
    text: "Paran azalınca annen masrafları nasıl yöneteceğini sordu.",
    condition: (state) => state.finances.balance < 2500 && state.household.livingWithFamily,
    choices: [
      {
        id: "accept",
        label: "Geçici destek iste",
        effects: {
          money: 1000,
          relationships: { anne: -3 },
          memory: "Annen maddi olarak destek oldu.",
          reason: "Aile desteği",
        },
      },
      {
        id: "refuse",
        label: "Kendim halledeceğim de",
        effects: {
          health: { stress: 7 },
          relationships: { anne: 2 },
          memory: "Maddi sıkıntıyı kendi başına çözmeyi seçtin.",
        },
      },
    ],
  },
  {
    id: "burnout_warning",
    repeat: "once",
    title: "Yorgunluk birikti",
    text: "Üst üste yoğun haftalar bedeninde ve sabrında iz bırakmaya başladı.",
    condition: (state) => state.health.stress >= 70 || state.flags.overtimeStreak >= 2,
    choices: [
      {
        id: "slow",
        label: "Biraz yavaşla",
        effects: {
          health: { energy: 12, stress: -15 },
          memory: "Yoğun temponun ardından yavaşlamayı seçtin.",
        },
      },
      {
        id: "push",
        label: "Devam et",
        effects: {
          money: 500,
          health: { energy: -12, stress: 10, health: -4 },
          reason: "Yoğun tempo",
        },
      },
    ],
  },
  {
    id: "friend_followup",
    repeat: "once",
    title: "Mehmet'ten haber var",
    text: "Daha önce yardım ettiğin Mehmet, görüşmeye çağrıldığını söyledi.",
    condition: (state) =>
      state.flags.helpedFriend === true &&
      state.time.absoluteWeek >= state.flags.helpedFriendWeek + 6,
    choices: [
      {
        id: "celebrate",
        label: "Birlikte kutla",
        effects: {
          money: -300,
          relationships: { mehmet: 8 },
          health: { stress: -5 },
          memory: "Mehmet'in iş görüşmesini birlikte kutladınız.",
          npcMemory: { personId: "mehmet", text: "İyi haberimi birlikte kutladı." },
          reason: "Kutlama",
        },
      },
      {
        id: "message",
        label: "Mesajla tebrik et",
        effects: {
          relationships: { mehmet: 3 },
          npcMemory: { personId: "mehmet", text: "İş görüşmem için beni tebrik etti." },
        },
      },
    ],
  },
  {
    id: "health_warning",
    repeat: "cooldown",
    cooldownWeeks: 16,
    title: "Bedenin uyarıyor",
    text: "Uzun süren yorgunluk günlük hayatını etkilemeye başladı.",
    condition: (state) => state.health.health <= 55,
    choices: [
      {
        id: "clinic",
        label: "Sağlık ocağına git",
        effects: {
          money: -250,
          health: { health: 12, stress: -5 },
          memory: "Sağlığın için yardım aldın.",
          reason: "Sağlık gideri",
        },
      },
      { id: "ignore", label: "Şimdilik ertele", effects: { health: { health: -6, stress: 4 } } },
    ],
  },
  {
    id: "work_review",
    repeat: "once",
    title: "İlk iş değerlendirmesi",
    text: "Yöneticin ilk aylarını değerlendirmek için seni çağırdı.",
    condition: (state) => state.time.absoluteWeek >= 9,
    choices: [
      {
        id: "steady",
        label: "Dengeli devam et",
        effects: { health: { stress: -3 }, memory: "İlk iş değerlendirmeni sorunsuz tamamladın." },
      },
      {
        id: "responsibility",
        label: "Daha fazla sorumluluk iste",
        effects: {
          money: 400,
          health: { stress: 6 },
          flags: { soughtResponsibility: true },
          memory: "İşinde daha fazla sorumluluk istedin.",
          reason: "İş primi",
        },
      },
    ],
  },
  {
    id: "loan_repayment",
    repeat: "repeatable",
    title: "Verdiğin borcun günü geldi",
    text: "Mehmet borcu konuşmak için seni aradı.",
    condition: () => false,
    choices: [
      {
        id: "collect",
        label: "Geri ödemeyi al",
        effects: {
          money: 1500,
          relationships: { mehmet: -2 },
          memory: "Mehmet verdiğin borcu geri ödedi.",
          reason: "Borç geri ödemesi",
        },
      },
      {
        id: "forgive",
        label: "Borcu kapat",
        effects: {
          relationships: { mehmet: 10 },
          memory: "Mehmet'in borcunu sildin.",
          npcMemory: { personId: "mehmet", text: "Ödeyemediğim borcu sildi." },
        },
      },
    ],
  },
];

export function getEventDefinition(eventId) {
  return EVENT_DEFINITIONS.find((event) => event.id === eventId) || null;
}

function isEligible(state, definition) {
  if (definition.repeat === "once" && state.events.seen.includes(definition.id)) return false;
  if (
    definition.repeat === "cooldown" &&
    (state.events.cooldowns[definition.id] || 0) > state.time.absoluteWeek
  )
    return false;
  if (
    state.events.active?.eventId === definition.id ||
    state.events.queue.some((item) => item.eventId === definition.id)
  )
    return false;
  return definition.condition(state);
}

export function enqueueEvent(state, eventId, sourceCaseId = null) {
  const definition = getEventDefinition(eventId);
  if (!definition) return false;
  const occurrenceId = `${eventId}-${state.time.absoluteWeek}-${state.events.history.length + state.events.queue.length + 1}`;
  state.events.queue.push({ eventId, occurrenceId, sourceCaseId });
  return true;
}

export function activateNextEvent(state) {
  if (state.events.active) return state.events.active;
  if (!state.events.queue.length) {
    const definition = EVENT_DEFINITIONS.find((candidate) => isEligible(state, candidate));
    if (definition) enqueueEvent(state, definition.id);
  }
  state.events.active = state.events.queue.shift() || null;
  return state.events.active;
}

export function resolveEvent(state, choiceId) {
  const active = state.events.active;
  if (!active) return { ok: false, message: "Çözülecek olay yok." };
  if (state.events.history.some((entry) => entry.occurrenceId === active.occurrenceId))
    return { ok: false, message: "Bu olay zaten sonuçlandı." };
  const definition = getEventDefinition(active.eventId);
  const choice = definition?.choices.find((candidate) => candidate.id === choiceId);
  if (!definition || !choice) return { ok: false, message: "Geçersiz olay seçimi." };

  applyEffects(state, choice.effects);
  if (!state.events.seen.includes(definition.id)) state.events.seen.push(definition.id);
  if (definition.repeat === "cooldown")
    state.events.cooldowns[definition.id] = state.time.absoluteWeek + definition.cooldownWeeks;
  if (active.sourceCaseId) {
    const openCase = state.openCases.find((item) => item.id === active.sourceCaseId);
    if (openCase) openCase.status = "resolved";
  }
  addEventHistory(state, {
    occurrenceId: active.occurrenceId,
    eventId: definition.id,
    choiceId,
    week: state.time.absoluteWeek,
  });
  state.events.active = null;
  activateNextEvent(state);
  return { ok: true, message: choice.effects.memory || `${definition.title}: ${choice.label}` };
}

export function processDueOpenCases(state) {
  const triggered = [];
  for (const openCase of state.openCases) {
    if (openCase.status === "pending" && openCase.dueWeek <= state.time.absoluteWeek) {
      if (enqueueEvent(state, openCase.eventId, openCase.id)) {
        openCase.status = "triggered";
        triggered.push(openCase.id);
      }
    }
  }
  return triggered;
}
