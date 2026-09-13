import { definition } from "./model.js";
import { copyKey } from "./card-data.js";
import { standing, suppressed, modified } from "./modifiers.js";
export function flagActive(state, player, name) {
  const f = state.players[player].flags[name];
  return f && f.until >= state.turn ? f.value : false;
}
export function hasTrait(state, player, name) {
  return standing(state, player).some((uid) => definition(state, uid).traits?.[name]);
}
export function canRespond(state, uid, player, fromDeck = false) {
  const p = state.players[player],
    d = definition(state, uid),
    c = state.cards[uid],
    t = d?.traits || {},
    a = state.pending?.action;
  if (p.flags.lockedName?.until >= state.turn && p.flags.lockedName.value === copyKey(d))
    return false;
  if (
    !a ||
    !d ||
    suppressed(state, uid) ||
    c.used.activate === state.turn ||
    (t.oncePerDuel && c.used.duelActivated)
  )
    return false;
  const quickCost =
    d.subtype === "quick"
      ? standing(state, player).reduce(
          (sum, id) => sum + (definition(state, id).traits?.quickCost || 0),
          0,
        )
      : 0;
  const cost =
    quickCost +
    (d.costs || []).filter((op) => op.op === "points").reduce((sum, op) => sum - op.amount, 0);
  if (p.points < cost) return false;
  const source = definition(state, a.card);
  const set = p.support.includes(uid),
    hand = fromDeck || p.hand.includes(uid),
    unit = p.units.includes(uid),
    grave = p.grave.includes(uid);
  if (
    (t.responseFrom === "grave" && !grave) ||
    (t.responseFrom === "units" && !unit) ||
    (t.responseFrom === "hand" && !hand)
  )
    return false;
  if (!t.responseFrom && !set && !hand) return false;
  const delay = standing(state, 1 - player).reduce(
    (sum, id) => sum + (definition(state, id).traits?.trapDelay || 0),
    0,
  );
  if (d.kind === "trap") {
    if (!set || flagActive(state, player, "blockTrap")) return false;
    const early =
      c.setTurn === state.turn &&
      hasTrait(state, player, "sameTurnTrapOnce") &&
      p.used.sameTurnTrap !== state.turn;
    if (!early && state.turn - c.setTurn < 1 + delay) return false;
    if (
      a.type === "attack" &&
      state.cards[a.target]?.position === "defense" &&
      definition(state, a.target)?.traits?.blockTrapWhenDefending
    )
      return false;
  }
  if (d.kind === "spell") {
    if (hand && !fromDeck && flagActive(state, player, "blockHandSpell")) return false;
    if (d.subtype !== "quick" && !modified(state, uid, "quick")) return false;
    if (hasTrait(state, 1 - player, "blockQuick")) return false;
    if (set && c.setTurn >= state.turn) return false;
    if (hand && !fromDeck && state.active !== player && !hasTrait(state, player, "quickEnemyHand"))
      return false;
    if (
      hand &&
      !fromDeck &&
      (hasTrait(state, 0, "quickMustSet") || hasTrait(state, 1, "quickMustSet"))
    )
      return false;
  }
  if (d.kind === "unit" && !t.responseFrom) return false;
  if (t.responseKinds && !t.responseKinds.includes(source?.kind)) return false;
  if (t.responseSubtypes && !t.responseSubtypes.includes(source?.subtype)) return false;
  if (t.responseTypes && !t.responseTypes.includes(a.type)) return false;
  if (t.directOnly && (a.type !== "attack" || a.target)) return false;
  if (t.tributeOnly && !a.tributes?.length) return false;
  if (t.responseDraw && a.type !== "draw") return false;
  if (t.responseLook && !source?.effects.some((op) => op.op === "look")) return false;
  if (
    t.responseDrawEffect &&
    !source?.effects.some((op) => ["draw", "drawSetTrap"].includes(op.op))
  )
    return false;
  if (
    t.responseDestroy &&
    !["attack", "destroy"].includes(a.type) &&
    !source?.effects.some((op) => op.op === "destroy")
  )
    return false;
  if (t.responseTargetOrBattle && a.type === "attack" && !a.target) return false;
  if (
    t.responseTargetOrBattle &&
    a.type !== "attack" &&
    !source?.effects.some((op) => op.op === "select")
  )
    return false;
  if (
    source?.kind === "trap" &&
    hasTrait(state, a.player, "trapUnnegatable") &&
    d.effects.some((op) => op.op === "negate")
  )
    return false;
  if (t.destroyedSeries && (!source?.series.includes(t.destroyedSeries) || a.type !== "destroy"))
    return false;
  if (
    t.quickFromDeck &&
    !p.deck.some(
      (id) =>
        definition(state, id).subtype === "quick" &&
        definition(state, id).response?.includes(a.type) &&
        canRespond(state, id, player, true),
    )
  )
    return false;
  return true;
}
