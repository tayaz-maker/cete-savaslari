// Accept only the public projection and engine-approved commands. No imported
// engine, PRNG, raw state, deck order, or enemy hand access exists here.

export const AI_PROFILES = {
  aggressive: {
    tr: { name: "Saldırgan", blurb: "Baskı, tempo, erken tartışma. Kaynağı tutmaz." },
    en: { name: "Aggressive", blurb: "Pressure and tempo. Spends resources to keep the line moving." },
  },
  patient: {
    tr: { name: "Sabırlı", blurb: "Zayıf takası geç. Daha iyi pencereyi bekler." },
    en: { name: "Patient", blurb: "Skips weak trades. Holds cards for a cleaner window." },
  },
  trapper: {
    tr: { name: "Tuzakçı", blurb: "Set, cevap, tuzak hattı. Rakibi kendi hamlesinde yakalar." },
    en: { name: "Trapper", blurb: "Sets, answers, bait. Prefers to catch you on your action." },
  },
  gambler: {
    tr: { name: "Risk Alan", blurb: "Yüksek sapma. Artı için eksiye razı." },
    en: { name: "Gambler", blurb: "High variance. Takes the upside line even when it can miss." },
  },
  controlled: {
    tr: { name: "Kontrollü", blurb: "Dengeli hat. Kart avantajı, az gereksiz risk." },
    en: { name: "Controlled", blurb: "Balanced. Card advantage first, fewer needless risks." },
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
