import { definition } from "./model.js";

export function createMatchTelemetry(meta = {}) {
  return {
    version: 1,
    theme: meta.theme || "",
    seed: meta.seed ?? null,
    aiProfile: meta.aiProfile || "controlled",
    identity: meta.identity || null,
    startedAt: meta.startedAt || Date.now(),
    events: [],
    opByTurn: [[8000, 8000]],
    cardStats: {},
  };
}

function bump(stats, id, key, amount = 1) {
  if (!id) return;
  if (!stats[id])
    stats[id] = {
      plays: 0,
      damage: 0,
      heal: 0,
      draws: 0,
      destroys: 0,
      summons: 0,
      prevented: 0,
      impact: 0,
    };
  stats[id][key] = (stats[id][key] || 0) + amount;
}

function cardId(state, uid) {
  return state.cards[uid]?.id || uid;
}

export function recordAction(tel, prev, next, action) {
  if (!tel || !next) return tel;
  const actor = action?.player ?? prev?.active ?? 0;
  const uid = action?.card;
  const def = uid ? definition(next, uid) || next.catalog?.[next.cards[uid]?.id] : null;
  const opBefore = prev?.players?.map((p) => p.points) || [8000, 8000];
  const opAfter = next.players.map((p) => p.points);
  const delta = [opAfter[0] - opBefore[0], opAfter[1] - opBefore[1]];
  const newLog = next.log.slice(prev?.log?.length || 0);
  const destroys = newLog.filter(
    (e) => e.event === "destroy" || (e.event === "move" && e.to === "grave"),
  ).length;
  const draws = newLog.filter((e) => e.event === "draw").reduce((s, e) => s + (e.count || 1), 0);
  const summons = newLog.filter((e) => e.event === "move" && e.to === "units").length;
  const id = def?.id;
  if (
    id &&
    ["summon", "set-unit", "set-support", "activate", "attack", "special", "respond"].includes(
      action?.type,
    )
  ) {
    bump(tel.cardStats, id, "plays");
    if (delta[1] < 0) bump(tel.cardStats, id, "damage", -delta[1]);
    if (delta[0] > 0) bump(tel.cardStats, id, "heal", delta[0]);
    if (draws) bump(tel.cardStats, id, "draws", draws);
    if (destroys) bump(tel.cardStats, id, "destroys", destroys);
    if (summons) bump(tel.cardStats, id, "summons", summons);
    const value = -delta[1] + delta[0] + draws * 200 + destroys * 250 + summons * 180;
    bump(tel.cardStats, id, "impact", value);
  }
  const turn = next.turn;
  while (tel.opByTurn.length < turn) tel.opByTurn.push([...tel.opByTurn.at(-1)]);
  tel.opByTurn[turn - 1] = opAfter.slice();
  tel.events.push({
    turn,
    // The phase the action was taken IN. `next.phase` is where the duel landed
    // afterwards, which mislabels the move that advanced the phase.
    phase: prev?.phase ?? next.phase,
    actor,
    type: action?.type || "unknown",
    card: id || null,
    name: def?.name || null,
    target: action?.target
      ? cardId(next, action.target)
      : action?.target === null
        ? "direct"
        : null,
    delta,
    destroys,
    draws,
    summons,
    result: next.result || null,
  });
  if (tel.events.length > 240) tel.events.shift();
  return tel;
}

export function cardValue(stat = {}) {
  return (
    (stat.damage || 0) +
    (stat.heal || 0) +
    (stat.draws || 0) * 200 +
    (stat.destroys || 0) * 250 +
    (stat.summons || 0) * 180 +
    (stat.prevented || 0)
  );
}
