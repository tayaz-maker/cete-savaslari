import { cardOf, legalActions } from "./engine.js";

export const AI_PROFILES = ["aggressive", "defensive", "tempo", "control", "resource", "adaptive"];

function deskLead(view, desk, me) {
  const d = view.desks[desk];
  return d.presence[me] - d.presence[1 - me];
}

function scorePlay(view, action, profile) {
  const me = view.viewer;
  const card = cardOf(action.cardId);
  if (!card) return -999;
  const desk = action.desk;
  const d = view.desks[desk];
  let score = 0;
  const lead = deskLead(view, desk, me);
  const lockClose = d.presence[me] + 1 >= 4 && d.presence[me] >= d.presence[1 - me];
  const oppLockClose = d.presence[1 - me] >= 3;
  const heat = view.heat;
  const hukumGap = view.opp.hukum - view.me.hukum;

  if (action.type === "play" || action.type === "counter") {
    score += card.cost === 1 ? 2 : 0;
    if (card.effect.some((op) => op.op === "push" && (op.desk === desk || op.desk === "any"))) score += 6 + lead;
    if (card.effect.some((op) => op.op === "steal")) score += 8;
    if (card.effect.some((op) => op.op === "pull" && op.who === "opp")) score += oppLockClose ? 10 : 4;
    if (card.effect.some((op) => op.op === "protect")) score += d.lock === me ? 9 : 3;
    if (card.effect.some((op) => op.op === "hukum")) score += 12;
    if (card.effect.some((op) => op.op === "seal")) score += 3;
    if (card.effect.some((op) => op.op === "draw")) score += 3;
    if (card.effect.some((op) => op.op === "unlock")) score += d.lock === 1 - me ? 11 : 0;
    if (lockClose) score += 14;
    if (card.type === "artci") score += profile === "control" ? 6 : 1;
    if (card.type === "muhurluk") score += view.me.muhur >= 4 ? 5 : -4;
    const heatDelta = card.effect.reduce((n, op) => n + (op.op === "heat" ? op.n : 0), 0);
    if (heat > 80 && heatDelta > 0) score -= 12;
    if (heat > 90 && view.me.muhur <= view.opp.muhur && heatDelta > 0) score -= 20;
    if (heat > 70 && heatDelta < 0) score += 8;
  }

  if (profile === "aggressive") {
    score += lockClose ? 10 : 0;
    score += heatDeltaScore(card, 1);
  } else if (profile === "defensive") {
    score += card.effect.some((op) => op.op === "protect" || (op.op === "pull" && op.who === "opp")) ? 10 : 0;
    if (heatDeltaScore(card, 1) > 0) score -= 6;
  } else if (profile === "tempo") {
    score += card.cost === 1 ? 6 : -2;
    score += card.effect.some((op) => op.op === "draw" || op.op === "ink") ? 6 : 0;
  } else if (profile === "control") {
    score += card.type === "artci" || card.type === "karsi" ? 8 : 0;
    score += card.effect.some((op) => op.op === "peek" || op.op === "mill") ? 5 : 0;
  } else if (profile === "resource") {
    score += card.effect.some((op) => op.op === "seal" || op.op === "ink") ? 8 : 0;
    score += desk === "kasa" ? 4 : 0;
  } else if (profile === "adaptive") {
    if (hukumGap > 2) score += lockClose ? 12 : 4;
    if (heat > 75) score += heatDeltaScore(card, -1) * 3;
    if (view.me.murekkep <= 1) score += card.cost === 1 ? 5 : -5;
  }
  return score;
}

function heatDeltaScore(card, sign) {
  return card.effect.reduce((n, op) => n + (op.op === "heat" ? op.n * sign : 0), 0);
}

export function chooseAction(view, actions, profile = "adaptive", rng) {
  const list = actions && actions.length ? actions : [];
  if (!list.length) return null;
  const usable = AI_PROFILES.includes(profile) ? profile : "adaptive";
  const roll = typeof rng === "function" ? rng : () => 0;
  const ranked = list.map((action, i) => {
    let value = 0;
    if (action.type === "end-kalem") value = list.some((a) => a.type === "play") ? -2 : 1;
    else if (action.type === "skip-karsi") value = 0;
    else value = scorePlay(view, action, usable);
    value += (roll() - 0.5) * 0.4;
    return { action, value, i };
  });
  ranked.sort((a, b) => b.value - a.value || a.i - b.i);
  return ranked[0].action;
}

export function pickLegal(state, playerId, profile, rng) {
  const actions = legalActions(state, playerId);
  const view = {
    viewer: playerId,
    heat: state.heat,
    desks: state.desks,
    me: state.players[playerId],
    opp: state.players[1 - playerId],
  };
  // Build a view-shaped object from state for the AI without opponent hand.
  const safeView = {
    viewer: playerId,
    heat: state.heat,
    desks: state.desks,
    me: {
      murekkep: state.players[playerId].murekkep,
      muhur: state.players[playerId].muhur,
      hukum: state.players[playerId].hukum,
    },
    opp: {
      murekkep: state.players[1 - playerId].murekkep,
      muhur: state.players[1 - playerId].muhur,
      hukum: state.players[1 - playerId].hukum,
    },
  };
  void view;
  return chooseAction(safeView, actions, profile, rng);
}
