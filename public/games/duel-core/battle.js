import { stat } from "./effects.js";
import { log } from "./model.js";
import { trait } from "./selection.js";
import { battleDamage, traits } from "./combat-rules.js";
import { modified } from "./modifiers.js";

// Battle math is independent of the presentation and uses one deterministic
// damage packet. Destruction triggers resolve only after the packet is applied.
export function battlePacket(state, attacker, defender) {
  const attack = stat(state, attacker, "attack");
  if (!defender)
    return {
      damage: [
        0,
        Math.floor(
          attack *
            (traits(state, attacker).fullDirect || modified(state, attacker, "fullDirect")
              ? 1
              : (trait(state, attacker, "directMultiplier") ?? 1)),
        ),
      ],
      destroy: [],
    };
  const defense =
    state.cards[defender].position === "defense" &&
    !trait(state, attacker, "attackDefenseAsAttack") &&
    !modified(state, defender, "defendWithAttack");
  const value = stat(state, defender, defense ? "defense" : "attack");
  if (defense)
    return { damage: [Math.max(0, value - attack), 0], destroy: attack > value ? [defender] : [] };
  const packet = {
    damage: [Math.max(0, value - attack), Math.max(0, attack - value)],
    destroy: attack === value ? [attacker, defender] : attack > value ? [defender] : [attacker],
  };
  if (attack === value && trait(state, attacker, "winTie")) packet.destroy = [defender];
  return packet;
}
export function resolveBattle(ctx, action) {
  const state = ctx.state,
    attacker = action.card,
    defender = action.target;
  if (
    !state.players[action.player].units.includes(attacker) ||
    (defender && !state.players[1 - action.player].units.includes(defender))
  ) {
    log(state, "attack-target-left");
    return;
  }
  if (defender && state.cards[defender].face === "down") {
    state.cards[defender].battleWasSet = true;
    state.cards[defender].face = "up";
    ctx.emit("flip", { player: 1 - action.player, uid: defender });
    if (state.work.length) {
      ctx.deferBattle(action);
      return;
    }
    if (
      !state.players[action.player].units.includes(attacker) ||
      !state.players[1 - action.player].units.includes(defender)
    )
      return;
  }
  if (!defender) state.players[action.player].points -= traits(state, attacker).directCost || 0;
  const packet = battleDamage(
    state,
    attacker,
    defender,
    battlePacket(state, attacker, defender),
    action.player,
  );
  state.players[action.player].points -= packet.damage[0];
  state.players[1 - action.player].points -= packet.damage[1];
  log(state, "battle", { player: action.player, attacker, defender, damage: packet.damage });
  for (const uid of packet.destroy) {
    const value = stat(state, uid, "attack"),
      wasSet = state.cards[uid]?.battleWasSet;
    const destroyed = ctx.destroy(
      uid,
      "battle",
      uid === defender && traits(state, attacker).battleBanish,
    );
    if (destroyed && uid === defender) {
      const t = traits(state, attacker);
      if (wasSet) state.players[1 - action.player].points -= t.destroySetDamage || 0;
      if (t.destroyedAttackDamage) state.players[1 - action.player].points -= value;
      ctx.emit("battle-kill", { player: action.player, uid: attacker, target: defender });
    }
    if (state.cards[uid]) delete state.cards[uid].battleWasSet;
  }
  if (state.cards[defender]) delete state.cards[defender].battleWasSet;
}
