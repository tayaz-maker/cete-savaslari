import { definition, locate, fieldCards, activeCards } from "./model.js";

export function hasSeries(state, uid, series) {
  return [].concat(definition(state, uid)?.series || []).includes(series);
}
export function modified(state, uid, key) {
  return state.cards[uid]?.modifiers.some(
    (m) => (m.until === null || m.until >= state.turn) && m[key],
  );
}
export function suppressed(state, uid) {
  const c = state.cards[uid],
    at = locate(state, uid);
  return (
    !c ||
    c.negated ||
    c.negatedUntil >= state.turn ||
    modified(state, uid, "negated") ||
    (at && state.players[at.player].flags.negateField?.until >= state.turn)
  );
}
export function standing(state, player) {
  return activeCards(state, player).filter((uid) => !suppressed(state, uid));
}
export function condition(state, uid, spec) {
  const player = locate(state, uid)?.player ?? state.cards[uid].owner,
    p = state.players[player];
  switch (spec.condition) {
    case "ownSetTrap":
      return p.support.some(
        (id) => id && state.cards[id].face === "down" && definition(state, id).kind === "trap",
      );
    case "pointsBelow":
      return p.points < spec.threshold;
    case "emptyAuxiliary":
      return p.auxiliary.length === 0;
    case "equipped":
      return fieldCards(state, player).some((id) => state.cards[id].equippedTo === uid);
    case "field":
      return state.players.some((x) => x.field && state.cards[x.field].face === "up");
    case "twoFields":
      return new Set(state.players.flatMap((x) => x.fieldHistory)).size >= 2;
    case "ownSeries":
      return p.units.some((id) => id && hasSeries(state, id, spec.series));
    case "otherSeries":
      return p.units.some((id) => id && id !== uid && hasSeries(state, id, spec.series));
    default:
      return false;
  }
}
function auraMatches(state, uid, aura, owner) {
  const d = definition(state, uid),
    c = state.cards[uid];
  return (
    (!aura.series || hasSeries(state, uid, aura.series)) &&
    (!aura.face || aura.face === c.face) &&
    (aura.maxLevel === undefined || d.level <= aura.maxLevel) &&
    (aura.minLevel === undefined || d.level >= aura.minLevel) &&
    (aura.pointsBelow === undefined || state.players[owner].points < aura.pointsBelow)
  );
}
export function statistic(state, uid, key) {
  const def = definition(state, uid),
    card = state.cards[uid],
    player = locate(state, uid)?.player ?? card.owner,
    p = state.players[player];
  const traits = suppressed(state, uid) ? {} : def.traits || {};
  let value = def[key] || 0;
  if (key === "attack" && traits.dynamicAttack === "pointDifference")
    value = Math.min(
      3000,
      Math.floor(Math.abs(state.players[0].points - state.players[1].points) / 10),
    );
  if (key === "attack" && traits.dynamicAttack === "allUnits400")
    value = 1200 + 400 * state.players.flatMap((x) => x.units).filter(Boolean).length;
  if (traits.conditionalStats && condition(state, uid, traits.conditionalStats))
    value += traits.conditionalStats[key] || 0;
  if (traits.countStats) {
    const spec = traits.countStats;
    const count =
      spec.count === "enemySet"
        ? fieldCards(state, 1 - player).filter((id) => state.cards[id].face === "down").length
        : spec.count === "ownBanished"
          ? p.banished.length
          : spec.count === "ownDistinctSeries"
            ? new Set(p.units.filter(Boolean).flatMap((id) => definition(state, id).series)).size
            : 0;
    value += count * (spec[key] || 0);
  }
  if (key === "attack" && traits.tributeAttack)
    value += (card.tributeCount || 0) * traits.tributeAttack;
  if (traits.attackingStats && card.attacksUsed) {
    if (traits.attackingStats[`${key}Set`] !== undefined)
      value = traits.attackingStats[`${key}Set`];
    value += traits.attackingStats[key] || 0;
  }
  for (const source of [
    ...standing(state, player),
    ...standing(state, 1 - player).filter((uid) => state.players[1 - player].field === uid),
  ]) {
    const t = definition(state, source).traits || {};
    for (const aura of [...(t.auras || []), ...(t.aura ? [t.aura] : [])])
      if (auraMatches(state, uid, aura, player)) value += aura[key] || 0;
    if (
      t.pairedSeriesAttack &&
      key === "attack" &&
      p.units.filter(
        (id) => id && definition(state, id).series.some((s) => hasSeries(state, uid, s)),
      ).length >= 2
    )
      value += t.pairedSeriesAttack;
    if (t.equip && state.cards[source].equippedTo === uid) {
      if (t.equip[`${key}Set`] !== undefined) value = t.equip[`${key}Set`];
      value += t.equip[key] || 0;
    }
  }
  for (const mod of card.modifiers) {
    if (mod.until !== null && mod.until < state.turn) continue;
    if (mod[`${key}Set`] !== undefined) value = mod[`${key}Set`];
    value += mod[key] || 0;
  }
  if (!Number.isFinite(value)) throw Error("Non-finite statistic");
  return Math.max(0, value);
}
