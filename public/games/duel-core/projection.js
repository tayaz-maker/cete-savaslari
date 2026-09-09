import { definition, locate } from "./model.js";
import { stat } from "./effects.js";

// The AI/UI boundary deliberately contains no draw order or opposing hand IDs.
export function publicView(state, viewer) {
  const cards = {};
  for (const [uid, card] of Object.entries(state.cards)) {
    const at = locate(state, uid);
    if (at.zone === "auxiliary" && at.player !== viewer) continue;
    const choosing =
      state.choice?.player === viewer &&
      [...(state.choice.ids || []), ...(state.choice.revealed || [])].includes(uid);
    const visible =
      choosing ||
      (at.zone !== "deck" &&
        (card.face === "up" ||
          (at.player === viewer && at.zone !== "auxiliary") ||
          card.knownTo[viewer]));
    if (
      !choosing &&
      (at.zone === "deck" || (at.zone === "hand" && at.player !== viewer && !card.knownTo[viewer]))
    )
      continue;
    cards[uid] = visible
      ? {
          uid,
          id: card.id,
          ...definition(state, uid),
          face: card.face,
          position: card.position,
          attack: stat(state, uid, "attack"),
          defense: stat(state, uid, "defense"),
          owner: at.player,
          zone: at.zone,
          ...(["units", "support"].includes(at.zone) ? { slot: at.index } : {}),
          used: { ...card.used },
          attacksUsed: card.attacksUsed,
          baseAttack: definition(state, uid).attack,
          baseDefense: definition(state, uid).defense,
        }
      : {
          uid,
          face: "down",
          position: card.position,
          owner: at.player,
          zone: at.zone,
          slot: at.index,
        };
  }
  return {
    theme: state.theme,
    turn: state.turn,
    phase: state.phase,
    active: state.active,
    revision: state.revision,
    viewer,
    result: state.result,
    choice: state.choice?.player === viewer ? state.choice : null,
    pending: state.pending
      ? { action: state.pending.action, responding: state.pending.responding }
      : null,
    players: state.players.map((p, i) => ({
      points: p.points,
      deckCount: p.deck.length,
      handCount: p.hand.length,
      hand: i === viewer ? [...p.hand] : [],
      units: [...p.units],
      support: [...p.support],
      field: p.field,
      grave: [...p.grave],
      banished: [...p.banished],
      auxiliaryCount: p.auxiliary.length,
      normalUsed: p.normalUsed,
    })),
    cards,
    log: state.log.filter((e) => e.private === undefined || e.private === viewer),
  };
}
