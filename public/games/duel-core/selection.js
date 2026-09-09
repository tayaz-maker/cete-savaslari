import { definition, locate, faceUp } from "./model.js";
import { effectTargetable } from "./combat-rules.js";

export function matches(state, uid, filter = {}, player = 0) {
  const card = state.cards[uid],
    def = definition(state, uid),
    at = locate(state, uid);
  if (!card || !def || !at) return false;
  if (filter.kind && def.kind !== filter.kind) return false;
  if (filter.subtype && ![].concat(filter.subtype).includes(def.subtype)) return false;
  if (filter.series && ![].concat(def.series).some((s) => [].concat(filter.series).includes(s)))
    return false;
  const effectLevel =
    def.level +
    card.modifiers
      .filter((m) => m.until === null || m.until >= state.turn)
      .reduce((sum, m) => sum + (m.effectLevel || 0), 0);
  if (filter.maxLevel !== undefined && effectLevel > filter.maxLevel) return false;
  if (filter.minLevel !== undefined && effectLevel < filter.minLevel) return false;
  if (filter.face && card.face !== filter.face) return false;
  if (filter.position && card.position !== filter.position) return false;
  if (filter.owner === "own" && at.player !== player) return false;
  if (filter.owner === "opponent" && at.player === player) return false;
  if (filter.exclude && filter.exclude.includes(uid)) return false;
  if (filter.ids && !filter.ids.includes(def.id)) return false;
  if (filter.bossOrLevelOne && def.level !== 1 && ![].concat(def.series).includes("Baba"))
    return false;
  if (
    filter.sameLevel &&
    filter.reference &&
    def.level !== definition(state, filter.reference)?.level
  )
    return false;
  if (
    ["units", "support", "field"].includes(at.zone) &&
    filter.effect !== false &&
    !effectTargetable(state, uid, player)
  )
    return false;
  return true;
}
export function candidates(state, player, selector = {}) {
  const owners =
    selector.owner === "opponent" ? [1 - player] : selector.owner === "both" ? [0, 1] : [player];
  const zones = [].concat(selector.zones || "units");
  return owners
    .flatMap((who) =>
      zones.flatMap((zone) =>
        zone === "field"
          ? [state.players[who].field].filter(Boolean)
          : state.players[who][zone] || [],
      ),
    )
    .filter((uid) => matches(state, uid, selector, player));
}
export function trait(state, uid, key) {
  const card = state.cards[uid],
    def = definition(state, uid);
  if (!card || !def || !faceUp(state, uid) || card.negated || card.negatedUntil >= state.turn)
    return null;
  return def.traits?.[key] ?? null;
}
