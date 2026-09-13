// Accept only the public projection and engine-approved commands. No imported
// engine, PRNG, raw state, deck order, or enemy hand access exists here.

export const AI_PROFILES = {
  aggressive: {
    tr: { name: "Saldırgan", blurb: "Tempoyu sever. Fırsat bulunca baskıyı artırır." },
    en: { name: "Aggressive", blurb: "Likes a fast game. Pushes harder when an opening appears." },
  },
  patient: {
    tr: { name: "Sabırlı", blurb: "Kartlarını kolay harcamaz. Daha temiz fırsatı bekler." },
    en: { name: "Patient", blurb: "Does not spend cards lightly. Waits for a better opportunity." },
  },
  trapper: {
    tr: {
      name: "Tuzakçı",
      blurb: "Set ve cevap kartlarını sever. Seni kendi hamlende yakalamaya çalışır.",
    },
    en: {
      name: "Trapper",
      blurb: "Likes set cards and responses. Tries to catch you during your own move.",
    },
  },
  gambler: {
    tr: { name: "Risk Alan", blurb: "Güvenli oyundan çok büyük hamleleri tercih eder." },
    en: { name: "Gambler", blurb: "Prefers a big play to a safe one." },
  },
  controlled: {
    tr: {
      name: "Kontrollü",
      blurb: "Dengeli oynar. Kart avantajını ve güvenli hamleleri önemser.",
    },
    en: { name: "Controlled", blurb: "Plays steadily, valuing card advantage and safer moves." },
  },
};

export const AI_PROFILE_IDS = Object.keys(AI_PROFILES);

function hashNoise(view, action) {
  const key = `${view.turn}|${view.phase}|${action.type}|${action.card || ""}|${action.target || ""}|${action.slot ?? ""}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

function baseValue(view, action) {
  const opponent = view.players[1 - view.viewer];
  const card = view.cards[action.card],
    target = view.cards[action.target];
  let value = -1000;
  if (action.type === "phase") value = 0;
  if (action.type === "end-main") value = -1;
  if (action.type === "pass") value = 1;
  if (action.type === "choose") value = 100;
  if (action.type === "respond") value = 250;
  if (action.type === "discard") value = 50 - ((card?.attack || 0) + (card?.defense || 0)) / 100;
  if (action.type === "summon")
    value =
      100 +
      card.attack / 100 -
      (action.tributes || []).reduce((sum, uid) => sum + (view.cards[uid]?.attack || 0) / 100, 0);
  if (action.type === "special")
    value =
      105 +
      (card?.attack || 0) / 100 -
      (action.materials || []).reduce((sum, uid) => sum + (view.cards[uid]?.attack || 0) / 100, 0);
  if (action.type === "set-unit")
    value = 95 + card.defense / 100 - (action.tributes || []).length * 20;
  if (action.type === "set-support")
    value = card.kind === "trap" || card.subtype === "quick" ? 60 : -20;
  if (action.type === "activate") value = 80;
  if (["activate", "respond"].includes(action.type)) {
    const effects = card?.effects || [];
    const destroys = (owner) =>
      effects.some(
        (op, i) =>
          op.op === "select" && op.selector.owner === owner && effects[i + 1]?.op === "destroy",
      );
    if (destroys("own") && destroys("opponent") && !opponent.units.some(Boolean)) value = -100;
    const damage = effects
      .filter((op) => op.op === "points" && op.opponent && op.amount < 0)
      .reduce((sum, op) => sum - op.amount, 0);
    if (damage >= opponent.points) value = 10000;
  }
  if (action.type === "position")
    value =
      card.face === "down" || (card.position === "defense" && card.attack > card.defense)
        ? 25
        : -20;
  if (action.type === "attack") {
    if (!action.target) value = card.attack >= opponent.points ? 10000 : 200 + card.attack / 100;
    else {
      const enemy =
        target?.face === "down"
          ? 1200
          : target?.position === "defense"
            ? target.defense
            : target.attack;
      value = card.attack >= enemy ? 150 + (card.attack - enemy) / 100 : -50;
      if (target?.position === "attack" && card.attack - enemy >= opponent.points) value = 10000;
    }
  }
  return value;
}

function applyProfile(profile, view, action, value) {
  const card = view.cards[action.card];
  if (profile === "aggressive") {
    if (action.type === "attack") value += 40;
    if (action.type === "summon" || action.type === "special") value += 18;
    if (action.type === "set-support") value -= 12;
    if (action.type === "set-unit") value -= 8;
    if (action.type === "end-main" || action.type === "phase") value -= 6;
  } else if (profile === "patient") {
    if (action.type === "attack" && value < 180) value -= 35;
    if (action.type === "set-unit") value += 22;
    if (action.type === "set-support") value += 10;
    if (action.type === "summon" && (card?.attack || 0) < 1400) value -= 10;
    if (action.type === "end-main") value += 4;
  } else if (profile === "trapper") {
    if (action.type === "set-support") value += 55;
    if (action.type === "respond") value += 40;
    if (action.type === "set-unit") value += 12;
    if (action.type === "attack" && action.target && view.cards[action.target]?.face === "down")
      value -= 20;
    if (action.type === "activate" && card?.kind === "trap") value += 20;
  } else if (profile === "gambler") {
    value += (hashNoise(view, action) - 0.35) * 90;
    if (action.type === "attack" && !action.target) value += 15;
    if (action.type === "special") value += 12;
  }
  return value;
}

export function chooseAction(view, actions, profile = "controlled") {
  let best = null,
    score = -Infinity;
  const id = AI_PROFILES[profile] ? profile : "controlled";
  for (const action of actions) {
    let value = baseValue(view, action);
    value = applyProfile(id, view, action, value);
    if (value > score) {
      score = value;
      best = action;
    }
  }
  return best;
}

export function scoreActions(view, actions, profile = "controlled") {
  const id = AI_PROFILES[profile] ? profile : "controlled";
  return actions.map((action) => ({
    action,
    value: applyProfile(id, view, action, baseValue(view, action)),
  }));
}
