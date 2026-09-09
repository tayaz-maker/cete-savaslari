import { generateDeck } from "./deckgen.js";
import {
  PHASES,
  MAIN,
  ROWS,
  definition,
  locate,
  log,
  finish,
  checkPoints,
  validateState,
  canonicalize,
} from "./model.js";
import { drawCard, runEffects, primitives } from "./effects.js";
import { resolveBattle } from "./battle.js";
import { validateTargets } from "./targeting.js";
import { trait, candidates } from "./selection.js";
import { hasSeries, standing, modified, suppressed } from "./modifiers.js";
import { specialPlans, ritualPlans } from "./summoning.js";
import { attackTargets, attackBlocked, traits as combatTraits } from "./combat-rules.js";
import { canRespond, flagActive, hasTrait } from "./timing.js";

export function createDuel(pool, theme, seed, first = 0, prepared = null) {
  const state = {
    version: 1,
    theme,
    seed: seed >>> 0,
    rng: seed >>> 0,
    revision: 0,
    first,
    active: first,
    turn: 1,
    phase: "draw",
    cards: {},
    catalog: Object.fromEntries(pool.map((c) => [c.id, c])),
    players: [],
    log: [],
    pending: null,
    result: null,
    work: [],
    choice: null,
    effectSerial: 0,
  };
  for (let player = 0; player < 2; player++) {
    const deck =
      prepared?.[player] || generateDeck(pool, (seed + Math.imul(player + 1, 2654435761)) >>> 0);
    const p = {
      points: 8000,
      deck: [],
      auxiliary: [],
      hand: [],
      grave: [],
      banished: [],
      units: Array(5).fill(null),
      support: Array(5).fill(null),
      field: null,
      normalUsed: 0,
      flags: {},
      used: {},
      fieldHistory: [],
    };
    for (const zone of ["deck", "auxiliary"]) {
      const ids = zone === "deck" ? deck.main : deck.auxiliary;
      ids.forEach((id, index) => {
        const uid = `${player}:${zone}:${index}`;
        state.cards[uid] = {
          id,
          owner: player,
          face: "down",
          position: "defense",
          setTurn: 0,
          summonedTurn: 0,
          positionTurn: 0,
          attacksUsed: 0,
          modifiers: [],
          used: {},
          knownTo: [player === 0, player === 1],
        };
        p[zone].push(uid);
      });
    }
    state.players.push(p);
  }
  for (let i = 0; i < 5; i++) for (let player = 0; player < 2; player++) drawCard(state, player);
  log(state, "start", { first });
  return state;
}

function context(state, player, source = null, targets = []) {
  const ctx = { state, player, source, targets: [...targets] };
  ctx.activate = (uid) => {
    const def = definition(state, uid),
      activation = context(state, player, uid);
    if (def.subtype === "quick")
      state.players[player].points -= standing(state, player).reduce(
        (sum, id) => sum + (definition(state, id).traits?.quickCost || 0),
        0,
      );
    for (const cost of def.costs || []) primitives[cost.op](activation, cost);
    state.cards[uid].used.activate = state.turn;
    ctx.emit("spell", { player, uid });
    resolve(state, { type: "activate", player, card: uid, targets: [] });
  };
  ctx.deferBattle = (action) => state.work.push({ type: "battle", action });
  ctx.specialCost = (plan) => {
    const def = definition(state, plan.card);
    if (plan.enabler && locate(state, plan.enabler)?.zone !== "grave")
      ctx.move(plan.enabler, "grave", "ritual-rite");
    for (const uid of plan.materials || []) {
      const at = locate(state, uid);
      if (!at) throw Error("Stale summon material");
      ctx.move(
        uid,
        at.zone === "grave" || def.traits?.ritualBanish ? "banished" : "grave",
        "material",
      );
    }
  };
  ctx.special = (plan) => {
    const where = locate(state, plan.card);
    if (!where) return;
    if (!plan.paidMaterials) ctx.specialCost(plan);
    const slot = state.players[player].units.indexOf(null);
    if (slot < 0) {
      log(state, "summon-zone-lost", { player, uid: plan.card });
      return;
    }
    ctx.move(plan.card, "units", "special", player, slot);
    const c = state.cards[plan.card];
    c.face = "up";
    c.position = "attack";
    c.summonedTurn = state.turn;
    c.knownTo = [true, true];
    if (plan.reveal) {
      state.cards[plan.reveal].knownTo = [true, true];
      state.players[1 - player].flags.lockedName = {
        value: definition(state, plan.reveal).name.tr,
        until: state.turn,
      };
    }
    if (plan.discount) delete state.players[player].flags.auxiliaryDiscount;
    ctx.emit("summon", { player, uid: plan.card, special: true, from: where.zone });
    if (where.zone === "auxiliary") ctx.emit("auxiliary-summon", { player, uid: plan.card });
  };
  ctx.token = (op) => {
    for (let i = 0; i < (op.count || 1); i++) {
      const slot = state.players[player].units.indexOf(null);
      if (slot < 0) break;
      const uid = `token:${++state.effectSerial}`;
      state.cards[uid] = {
        id: "token",
        owner: player,
        face: "up",
        position: op.position || "defense",
        token: {
          tr: op.tr || "Temsilci",
          en: op.en || "Representative",
          attack: op.attack || 0,
          defense: op.defense || 0,
        },
        setTurn: state.turn,
        summonedTurn: state.turn,
        positionTurn: state.turn,
        attacksUsed: 0,
        modifiers: [],
        used: {},
        knownTo: [true, true],
      };
      state.players[player].units[slot] = uid;
      log(state, "token", { player, uid });
    }
  };
  ctx.draw = (who) => drawCard(state, who, ctx.emit);
  ctx.move = (uid, to, reason = "effect", destination = state.cards[uid]?.owner, slot = null) => {
    const where = locate(state, uid);
    if (!where) return false;
    if (["deck", "hand"].includes(to) && definition(state, uid).deckLocation === "auxiliary")
      to = "auxiliary";
    if (
      where.zone === "grave" &&
      reason !== "material" &&
      hasTrait(state, 1 - where.player, "lockEnemyGrave")
    )
      return false;
    if (ROWS.includes(to) && (slot === null || state.players[destination][to][slot] !== null))
      return false;
    if (ROWS.includes(where.zone)) state.players[where.player][where.zone][where.index] = null;
    else if (where.zone === "field") state.players[where.player].field = null;
    else state.players[where.player][where.zone].splice(where.index, 1);
    if (state.cards[uid].token && !ROWS.includes(to)) {
      delete state.cards[uid];
      log(state, "token-left", { player: where.player, uid, reason });
      return true;
    }
    if (ROWS.includes(to)) state.players[destination][to][slot] = uid;
    else if (to === "field") state.players[destination].field = uid;
    else state.players[destination][to].push(uid);
    if (
      ["units", "support", "field"].includes(where.zone) &&
      !["units", "support", "field"].includes(to)
    ) {
      state.cards[uid].modifiers = [];
      state.cards[uid].negated = false;
      delete state.cards[uid].negatedUntil;
      for (const owner of [0, 1])
        for (const equip of [...state.players[owner].support]) {
          if (equip && state.cards[equip].equippedTo === uid)
            ctx.move(equip, "grave", "equip-target-left");
        }
    }
    if (["grave", "banished"].includes(to)) {
      if (to === "banished") state.cards[uid].banishReason = reason;
      state.cards[uid].face = "up";
      state.cards[uid].knownTo = [true, true];
      state.cards[uid].modifiers = [];
      state.cards[uid].negated = false;
    }
    log(state, "move", { player: where.player, uid, from: where.zone, to, reason });
    if (to === "grave") ctx.emit("grave", { player: where.player, uid, reason });
    return true;
  };
  ctx.destroy = (uid, reason, banish = false) => {
    if (!locate(state, uid)) return false;
    const traits = suppressed(state, uid) ? {} : definition(state, uid).traits || {},
      card = state.cards[uid];
    const protection = reason === "battle" ? traits.battleProtection : traits.effectProtection;
    if (protection === "always") return false;
    if (protection === "turn" && card.used.protection !== state.turn) {
      card.used.protection = state.turn;
      return false;
    }
    if (protection === "duel" && !card.used.duelProtection) {
      card.used.duelProtection = true;
      return false;
    }
    if (reason === "battle") {
      const index = card.modifiers.findIndex(
        (m) => m.protectBattleOnce && (m.until === null || m.until >= state.turn),
      );
      if (index >= 0) {
        card.modifiers.splice(index, 1);
        return false;
      }
    }
    if (
      card.modifiers.some(
        (m) =>
          (m.until === null || m.until >= state.turn) &&
          (m.protectAll || m[reason === "battle" ? "protectBattle" : "protectEffect"]),
      )
    )
      return false;
    const owner = locate(state, uid).player;
    const t = suppressed(state, uid) ? {} : traits;
    if (
      (t.fieldProtection || (reason === "battle" && t.fieldBattleProtection)) &&
      state.players.some((p) => p.field && state.cards[p.field].face === "up")
    )
      return false;
    if (
      reason === "battle" &&
      t.fieldBattleOnce &&
      state.players.some(
        (p) =>
          p.field &&
          state.cards[p.field].face === "up" &&
          definition(state, p.field).id === t.fieldBattleOnce,
      ) &&
      !card.used.fieldProtection
    ) {
      card.used.fieldProtection = true;
      return false;
    }
    for (const source of standing(state, owner)) {
      const sourceTraits = definition(state, source).traits || {},
        sourceCard = state.cards[source];
      if (
        reason === "battle" &&
        sourceTraits.seriesBattleProtection &&
        hasSeries(state, uid, sourceTraits.seriesBattleProtection)
      )
        return false;
      if (
        reason === "effect" &&
        sourceTraits.protectOwnSetUnits &&
        card.face === "down" &&
        definition(state, uid).kind === "unit"
      )
        return false;
      if (
        card.face === "down" &&
        (sourceTraits.protectSetOnce ||
          (reason === "effect" && sourceTraits.protectSetEffectOnce)) &&
        sourceCard.used.setProtection !== state.turn
      ) {
        sourceCard.used.setProtection = state.turn;
        return false;
      }
      if (
        reason === "battle" &&
        sourceCard.equippedTo === uid &&
        sourceTraits.equip?.battleDestroyedDraw
      )
        runEffects({ ...ctx, player: owner, source, targets: [] }, [
          { op: "draw", count: sourceTraits.equip.battleDestroyedDraw },
        ]);
    }
    ctx.move(uid, banish ? "banished" : "grave", reason);
    ctx.emit("destroy", { player: owner, uid, reason });
    state.work.push({ type: "destruction-window", player: owner, source: uid });
    return true;
  };
  let depth = 0;
  ctx.emit = (event, data) => {
    if (++depth > 100) throw new Error("Effect trigger cycle");
    const listeners = [...standing(state, 0), ...standing(state, 1)];
    if (event === "destroy")
      for (const owner of [0, 1])
        for (const uid of state.players[owner].grave) {
          const series = definition(state, uid).traits?.reviveOnSeriesDestroyed;
          if (
            owner === data.player &&
            series &&
            hasSeries(state, data.uid, series) &&
            state.cards[uid].used.revive !== state.turn
          ) {
            state.cards[uid].used.revive = state.turn;
            runEffects({ ...ctx, player: owner, source: uid, targets: [] }, [
              { op: "optional", effects: [{ op: "summon", self: true }] },
            ]);
          }
        }
    if (data.uid && !listeners.includes(data.uid)) listeners.push(data.uid);
    for (const uid of listeners) {
      const def = definition(state, uid);
      if (!def) continue;
      const owner = locate(state, uid)?.player ?? state.cards[uid].owner;
      const t = def.traits || {};
      if (
        event === "tribute" &&
        t.tributeSearchSpell &&
        locate(state, data.uid)?.zone === "grave"
      ) {
        ctx.move(data.uid, "banished", "tribute-replacement");
        runEffects({ ...ctx, player: owner, source: uid, targets: [] }, [
          { op: "select", key: "spell", selector: { zones: "deck", kind: "spell" } },
          { op: "move", to: "hand" },
          { op: "shuffle" },
        ]);
      }
      if (event === "set" && owner !== data.player && t.revealEnemySet)
        state.cards[data.uid].knownTo[owner] = true;
      if (
        event === "draw" &&
        owner !== data.player &&
        t.revealEnemyDrawSpell &&
        state.cards[uid].used.drawReveal !== state.turn
      ) {
        state.cards[uid].used.drawReveal = state.turn;
        state.cards[data.uid].knownTo = [true, true];
        if (definition(state, data.uid).kind === "spell")
          ctx.move(data.uid, "grave", "revealed-draw");
      }
      for (const effect of def?.triggers || []) {
        if (
          effect.event !== event ||
          (!effect.global && uid !== data.uid) ||
          (effect.own && owner !== data.player) ||
          (effect.opponent && owner === data.player) ||
          (effect.normal && !data.normal) ||
          (effect.tribute && !data.tributes?.length) ||
          (effect.from && effect.from !== data.from) ||
          (effect.tributeSeries &&
            !data.tributes?.some((id) =>
              [].concat(effect.tributeSeries).some((series) => hasSeries(state, id, series)),
            )) ||
          (effect.sameLevel && definition(state, data.target)?.level !== def.level) ||
          (effect.requiresSeries &&
            !state.players[owner].units.some(
              (id) => id && hasSeries(state, id, effect.requiresSeries),
            )) ||
          (effect.reason && effect.reason !== data.reason)
        )
          continue;
        const nested = { ...ctx, player: owner, source: uid, targets: data.targets || [] };
        runEffects(nested, effect.effects);
      }
    }
    depth--;
  };
  return ctx;
}

function settle(state) {
  let count = 0;
  while (state.work.length && !state.choice && !state.result) {
    if (++count > 1000) throw new Error("Effect resolution cycle");
    const job = state.work.shift();
    const ctx = context(state, job.player ?? job.action?.player, job.source);
    if (job.type === "destruction-window") {
      if (locate(state, job.source)?.zone !== "grave") continue;
      const pending = {
        action: { type: "destroy", player: 1 - job.player, card: job.source },
        responding: job.player,
        negated: false,
      };
      state.pending = pending;
      pending.allowed = state.players[job.player].support.filter(
        (uid) =>
          uid &&
          definition(state, uid).traits?.destroyedSeries &&
          canRespond(state, uid, job.player),
      );
      if (pending.allowed.length) break;
      state.pending = null;
      continue;
    }
    if (job.type === "resolve") {
      resolve(state, job.action);
      continue;
    }
    if (job.type === "response-finish") {
      const pending = state.pending;
      if (
        locate(state, job.source) &&
        !["unit"].includes(definition(state, job.source).kind) &&
        definition(state, job.source).subtype !== "continuous"
      )
        ctx.move(job.source, "grave", "response");
      state.pending = null;
      if (pending?.negated && pending.action.card) {
        const at = locate(state, pending.action.card);
        if (
          at &&
          (["summon", "special"].includes(pending.action.type) ||
            definition(state, pending.action.card).kind !== "unit") &&
          ["hand", "support", "field", "auxiliary"].includes(at.zone)
        )
          ctx.move(pending.action.card, "grave", "negated");
      }
      if (pending && !pending.negated && !state.result) {
        resolve(state, { ...pending.action, noDraw: pending.noDraw });
        if (pending.postEffects)
          runEffects({ ...ctx, targets: [pending.action.card] }, pending.postEffects);
      }
      continue;
    }
    if (job.type === "cleanup") {
      if (locate(state, job.source)) ctx.move(job.source, "grave", "resolved");
      continue;
    }
    if (job.type === "battle") {
      resolveBattle(ctx, job.action);
      continue;
    }
    if (job.type !== "effects") throw new Error("Unknown resolution job");
    if (!job.effects.length) continue;
    const op = job.effects.shift();
    state.work.unshift(job);
    ctx.targets = job.targets;
    ctx.jobId = job.id;
    const handler = primitives[op.op];
    if (!handler) throw new Error(`Unimplemented primitive: ${op.op}`);
    handler(ctx, op);
  }
  if (state.result) {
    state.work = [];
    state.choice = null;
  }
}

export function rejection(state, action) {
  if (!state || !action || ![0, 1].includes(action.player)) return "invalid-action";
  if (
    Object.keys(action).some(
      (key) =>
        ![
          "type",
          "player",
          "revision",
          "card",
          "target",
          "targets",
          "slot",
          "tributes",
          "materials",
          "reveal",
          "discount",
          "ritual",
          "enabler",
          "option",
        ].includes(key),
    )
  )
    return "invalid-action";
  if (state.result) return "duel-ended";
  if (action.revision !== state.revision) return "stale-action";
  if (action.type === "surrender") return null;
  if (state.choice) {
    const c = state.choice;
    if (action.type !== "choose" || action.player !== c.player) return "choice-required";
    if (c.kind === "option")
      return c.options.some((o) => o.id === action.option) ? null : "legal-option-required";
    const ids = action.targets || [];
    return ids.length === c.count &&
      new Set(ids).size === ids.length &&
      ids.every((uid) => c.ids.includes(uid) && locate(state, uid))
      ? null
      : "legal-target-required";
  }
  if (state.pending) {
    if (action.player !== state.pending.responding) return "response-owner";
    if (action.type === "pass") return null;
    if (action.type !== "respond") return "response-pending";
    if (!responseCards(state).includes(action.card)) return "illegal-response";
    return validateTargets(state, action);
  }
  if (action.player !== state.active) return "opponent-turn";
  const p = state.players[action.player],
    card = state.cards[action.card],
    def = definition(state, action.card);
  if (action.type === "end-main") return MAIN.includes(state.phase) ? null : "main-phase-only";
  if (action.type === "phase") {
    if (state.phase === "end" && p.hand.length > 6) return "hand-limit";
    return null;
  }
  if (action.type === "discard")
    return state.phase === "end" && p.hand.length > 6 && p.hand.includes(action.card)
      ? null
      : "hand-limit-only";
  if (action.type === "special") {
    if (!MAIN.includes(state.phase)) return "main-phase-only";
    const plans = [...specialPlans(state, action.player), ...ritualPlans(state, action.player)];
    return plans.some(
      (plan) =>
        plan.card === action.card &&
        JSON.stringify(plan.materials) === JSON.stringify(action.materials || []) &&
        plan.reveal === action.reveal &&
        plan.enabler === action.enabler,
    )
      ? null
      : "special-requirements";
  }
  if (["summon", "set-unit"].includes(action.type)) {
    if (!MAIN.includes(state.phase)) return "main-phase-only";
    if (!p.hand.includes(action.card) || def?.kind !== "unit" || def.subtype === "ritual")
      return "invalid-unit";
    if (
      state.phase === "main1" &&
      state.players[1 - action.player].units.some(
        (uid) =>
          uid &&
          state.cards[uid].face === "down" &&
          definition(state, uid).traits?.facedownBlockNormalMain1,
      )
    )
      return "normal-blocked";
    const extra = standing(state, action.player).find(
      (uid) => definition(state, uid).traits?.extraNormalMaxLevel >= def.level,
    );
    if (p.normalUsed >= (extra ? 2 : 1)) return "normal-used";
    const needed = def.level >= 7 ? 2 : def.level >= 5 ? 1 : 0;
    const tributes = action.tributes || [];
    const alternative = def.traits?.tributeAlternative;
    const alternate =
      alternative &&
      tributes.length === alternative.count &&
      tributes.every(
        (uid) =>
          p[alternative.zone].includes(uid) && definition(state, uid).kind === alternative.kind,
      );
    if (
      !alternate &&
      (tributes.length !== needed ||
        new Set(tributes).size !== needed ||
        tributes.some((uid) => !p.units.includes(uid)))
    )
      return "tributes-required";
    if (
      !Number.isInteger(action.slot) ||
      action.slot < 0 ||
      action.slot > 4 ||
      (p.units[action.slot] && !tributes.includes(p.units[action.slot]))
    )
      return "unit-zone-required";
    return null;
  }
  if (action.type === "set-field")
    return MAIN.includes(state.phase) && p.hand.includes(action.card) && def.subtype === "field"
      ? null
      : "invalid-field";
  if (action.type === "set-support") {
    if (def?.subtype === "field") return "field-slot-only";
    if (
      !MAIN.includes(state.phase) ||
      !p.hand.includes(action.card) ||
      !["spell", "trap"].includes(def?.kind)
    )
      return "invalid-set";
    return Number.isInteger(action.slot) &&
      action.slot >= 0 &&
      action.slot < 5 &&
      !p.support[action.slot]
      ? null
      : "support-zone-required";
  }
  if (action.type === "position") {
    if (state.phase === "end" && p.units.includes(action.card) && def.traits?.endPosition)
      return card.used.endPosition === state.turn ? "position-used" : null;
    if (!MAIN.includes(state.phase) || !p.units.includes(action.card)) return "main-phase-only";
    return card.summonedTurn === state.turn || card.positionTurn === state.turn || card.attacksUsed
      ? "position-used"
      : null;
  }
  if (action.type === "activate") {
    if (
      !MAIN.includes(state.phase) &&
      !(
        (def?.subtype === "quick" || modified(state, action.card, "quick")) &&
        state.phase === "battle"
      )
    )
      return "main-phase-only";
    const fromHand = p.hand.includes(action.card),
      fromSupport = p.support.includes(action.card),
      fromField = p.field === action.card;
    if (!fromHand && !fromSupport && !fromField && !p.units.includes(action.card))
      return "invalid-source";
    if (
      def?.kind === "unit" &&
      fromHand &&
      def.traits?.activateFrom !== "hand" &&
      !def.traits?.ritualEnabler
    )
      return "unit-must-be-on-field";
    if (
      def.traits?.requiresSeries &&
      !p.units.some((uid) => uid && hasSeries(state, uid, def.traits.requiresSeries))
    )
      return "series-required";
    if (p.flags.lockedName?.until >= state.turn && p.flags.lockedName.value === def.name.tr)
      return "name-locked";
    if (p.units.includes(action.card) && card.face !== "up") return "flip-required";
    if (def.kind === "spell" && fromHand && flagActive(state, action.player, "blockHandSpell"))
      return "effect-negated";
    if (suppressed(state, action.card)) return "effect-negated";
    if (def?.kind === "trap") {
      const early =
        card.setTurn === state.turn &&
        hasTrait(state, action.player, "sameTurnTrapOnce") &&
        p.used.sameTurnTrap !== state.turn;
      const delay = standing(state, 1 - action.player).reduce(
        (sum, uid) => sum + (definition(state, uid).traits?.trapDelay || 0),
        0,
      );
      if (fromHand || (!early && state.turn - card.setTurn < 1 + delay)) return "trap-must-wait";
      if (flagActive(state, action.player, "blockTrap")) return "effect-negated";
    }
    if (def?.subtype === "quick") {
      if (hasTrait(state, 1 - action.player, "blockQuick")) return "effect-negated";
      if (fromHand && (hasTrait(state, 0, "quickMustSet") || hasTrait(state, 1, "quickMustSet")))
        return "quick-must-wait";
    }
    if (fromSupport && def?.subtype === "quick" && card.setTurn >= state.turn)
      return "quick-must-wait";
    if (
      !def?.effects?.length &&
      !(def?.kind !== "unit" && ["continuous", "equip", "field"].includes(def?.subtype))
    )
      return "no-activated-effect";
    if (!def.effects.length && card.face === "up" && !fromHand) return "no-activated-effect";
    if (card.used.activate === state.turn) return "effect-used";
    if (def.traits?.oncePerDuel && card.used.duelActivated) return "effect-used";
    if (def.responseOnly) return "response-only";
    const quickCost =
      def.subtype === "quick"
        ? standing(state, action.player).reduce(
            (sum, uid) => sum + (definition(state, uid).traits?.quickCost || 0),
            0,
          )
        : 0;
    const cost =
      quickCost +
      (def.costs || []).filter((op) => op.op === "points").reduce((sum, op) => sum - op.amount, 0);
    if (p.points < cost) return "insufficient-points";
    if (
      def.effects.some((op) => op.op === "ritual") &&
      !ritualPlans(state, action.player, action.card).length
    )
      return "special-requirements";
    const firstSelect = def.effects.find((op) => op.op === "select");
    if (
      firstSelect &&
      !def.effects
        .slice(0, def.effects.indexOf(firstSelect))
        .some((op) => ["draw", "drawSetTrap", "move", "summon"].includes(op.op)) &&
      candidates(state, action.player, { ...firstSelect.selector, reference: action.card }).length <
        (firstSelect.count || 1)
    )
      return "no-legal-target";
    if (
      def.effects.some((op) => op.op === "auxiliary") &&
      !specialPlans(
        state,
        action.player,
        def.effects.find((op) => op.op === "auxiliary").materialCredit || 0,
      ).length
    )
      return "special-requirements";
    const bloc = def.effects.find((op) => op.requiredIds);
    if (
      bloc &&
      [...p.hand, ...p.units].filter(
        (uid) => uid && bloc.requiredIds.includes(definition(state, uid).id),
      ).length < bloc.materialCredit
    )
      return "special-requirements";
    if (["continuous", "equip"].includes(def.subtype) && fromHand && !p.support.includes(null))
      return "support-zone-required";
    return validateTargets(state, action);
  }
  if (action.type === "attack") {
    if (state.phase !== "battle" || state.turn === 1) return "battle-unavailable";
    if (
      !p.units.includes(action.card) ||
      card.face !== "up" ||
      card.position !== "attack" ||
      card.attacksUsed >= (trait(state, action.card, "attacks") || 1)
    )
      return "attack-used";
    if (attackBlocked(state, action.player, action.card, action.target)) return "attack-blocked";
    return attackTargets(state, action.player, action.card).includes(action.target || null)
      ? null
      : "invalid-battle-target";
  }
  return "unknown-action";
}

export function responseCards(state) {
  if (!state.pending || state.pending.blocked) return [];
  const who = state.pending.responding,
    p = state.players[who];
  return [...p.support, ...p.hand, ...p.units, ...p.grave]
    .filter(Boolean)
    .filter((uid) => {
      const def = definition(state, uid);
      if (state.pending.allowed && !state.pending.allowed.includes(uid)) return false;
      const selection = def.effects.find((op) => op.op === "select" && !op.all);
      if (
        selection &&
        !def.effects
          .slice(0, def.effects.indexOf(selection))
          .some((op) => ["draw", "drawSetTrap", "move", "summon", "token"].includes(op.op)) &&
        candidates(state, who, { ...selection.selector, reference: uid }).length <
          (selection.count || 1)
      )
        return false;
      return (
        (def.response?.includes(state.pending.action.type) ||
          (def.kind === "spell" && modified(state, uid, "quick"))) &&
        canRespond(state, uid, who)
      );
    })
    .sort(
      (a, b) =>
        Number(definition(state, b).subtype === "counter") -
        Number(definition(state, a).subtype === "counter"),
    );
}

function resolve(state, action) {
  const ctx = context(state, action.player, action.card, action.targets),
    p = state.players[action.player];
  const card = state.cards[action.card],
    def = definition(state, action.card);
  if (action.type === "draw") {
    if (flagActive(state, action.player, "skipDraw")) delete p.flags.skipDraw;
    else ctx.draw(action.player);
    state.phase = "standby";
    ctx.emit("standby", { player: action.player });
  } else if (action.type === "battle-start") {
    state.phase = "battle";
    ctx.emit("battle-start", { player: action.player });
  } else if (action.type === "special") ctx.special(action);
  else if (["summon", "set-unit"].includes(action.type)) {
    for (const uid of action.paidTributes ? [] : action.tributes || []) {
      const alternate = p.grave.includes(uid);
      ctx.move(uid, alternate ? "banished" : "grave", alternate ? "summon-cost" : "tribute");
      if (!alternate) ctx.emit("tribute", { player: action.player, uid });
    }
    const slot = p.units[action.slot] === null ? action.slot : p.units.indexOf(null);
    if (slot < 0 || !ctx.move(action.card, "units", "summon", action.player, slot)) {
      log(state, "summon-zone-lost", { player: action.player, uid: action.card });
      return;
    }
    card.face = action.type === "summon" ? "up" : "down";
    card.position = action.type === "summon" ? "attack" : "defense";
    card.summonedTurn = state.turn;
    card.setTurn = state.turn;
    card.tributeCount = action.tributes?.length || 0;
    if (def.traits?.tributeAuxiliary && card.face === "up")
      runEffects(ctx, [{ op: "auxiliary", available: action.tributes || [] }]);
    if (card.face === "up") {
      card.knownTo = [true, true];
      ctx.emit("summon", {
        player: action.player,
        uid: action.card,
        normal: true,
        tributes: action.tributes,
        from: "hand",
      });
    }
  } else if (action.type === "activate") {
    card.face = "up";
    card.knownTo = [true, true];
    if (def.subtype === "field") {
      if (p.field && p.field !== action.card) ctx.move(p.field, "grave", "field-replaced");
      ctx.move(action.card, "field", "activated", action.player);
      p.fieldHistory.push(def.id);
    } else if (["continuous", "equip"].includes(def.subtype)) {
      if (p.hand.includes(action.card))
        ctx.move(action.card, "support", "activated", action.player, p.support.indexOf(null));
      if (def.subtype === "equip") {
        card.equippedTo = action.targets?.[0];
        ctx.emit("equip", { player: action.player, uid: action.card });
        if (def.traits?.equip?.revealTrap)
          runEffects(ctx, [
            {
              op: "select",
              key: "trap",
              selector: { owner: "opponent", zones: "support", kind: "trap", face: "down" },
            },
            { op: "reveal" },
          ]);
      }
    }
    if (def.kind !== "unit" && !["continuous", "equip", "field"].includes(def.subtype))
      state.work.unshift({ type: "cleanup", player: action.player, source: action.card });
    runEffects(ctx, action.noDraw ? def.effects.filter((op) => op.op !== "draw") : def.effects);
  } else if (action.type === "attack") resolveBattle(ctx, action);
}

export function dispatch(original, action) {
  const error = rejection(original, action);
  if (error) return { ok: false, error, state: original };
  action = structuredClone(action);
  const { catalog, ...mutable } = original;
  const state = { ...structuredClone(mutable), catalog },
    ctx = context(state, action.player, action.card, action.targets);
  const p = state.players[action.player],
    card = state.cards[action.card];
  state.revision++;
  if (["activate", "respond"].includes(action.type)) {
    const def = definition(state, action.card),
      wasSet = card.face === "down" && (p.support.includes(action.card) || p.field === action.card);
    if (def.subtype === "quick")
      p.points -= standing(state, action.player).reduce(
        (sum, uid) => sum + (definition(state, uid).traits?.quickCost || 0),
        0,
      );
    for (const cost of def.costs || []) primitives[cost.op](ctx, cost);
    card.face = "up";
    card.knownTo = [true, true];
    if (def.kind === "trap" && card.setTurn === state.turn) p.used.sameTurnTrap = state.turn;
    if (wasSet) ctx.emit("set-activate", { player: action.player, uid: action.card });
    if (def.kind === "spell") ctx.emit("spell", { player: action.player, uid: action.card });
  }
  if (["summon", "set-unit"].includes(action.type)) {
    for (const uid of action.tributes || []) {
      const alternate = p.grave.includes(uid);
      ctx.move(uid, alternate ? "banished" : "grave", alternate ? "summon-cost" : "tribute");
      if (!alternate) ctx.emit("tribute", { player: action.player, uid });
    }
    action.paidTributes = true;
    if (action.type === "summon") {
      card.face = "up";
      card.knownTo = [true, true];
    }
  }
  if (action.type === "special") {
    ctx.specialCost(action);
    action.paidMaterials = true;
  }
  if (action.type === "attack" && !action.target) {
    ctx.emit("direct-declared", { player: action.player, uid: action.card });
    const redirect = state.players[1 - action.player].units.find(
      (uid) =>
        uid &&
        combatTraits(state, uid).redirectDirect &&
        state.cards[uid].used.redirect !== state.turn,
    );
    if (redirect) {
      state.cards[redirect].used.redirect = state.turn;
      action.target = redirect;
    }
  }
  if (action.type === "surrender") finish(state, 1 - action.player, "surrender");
  else if (state.choice) {
    const job = state.work.find((item) => item.id === state.choice.jobId);
    if (!job) throw new Error("Missing choice continuation");
    if (state.choice.kind === "option")
      job.effects.unshift(...state.choice.options.find((o) => o.id === action.option).effects);
    else job.targets.push(...action.targets);
    state.choice = null;
  } else if (state.pending) {
    if (action.type === "respond") {
      card.used.activate = state.turn;
      card.face = "up";
      card.knownTo = [true, true];
      card.used.duelActivated = true;
      if (card.setTurn === state.turn && definition(state, action.card).kind === "trap")
        p.used.sameTurnTrap = state.turn;
      state.work.unshift({ type: "response-finish", player: action.player, source: action.card });
      runEffects(ctx, definition(state, action.card).effects);
    } else {
      const pending = state.pending;
      if (pending && !pending.negated && !state.result) resolve(state, pending.action);
      state.pending = null;
    }
  } else if (action.type === "end-main") {
    state.phase = "end";
    log(state, "phase", { phase: "end" });
    ctx.emit("end", { player: state.active });
  } else if (action.type === "phase") {
    if (state.phase === "draw" || (state.phase === "main1" && state.turn > 1)) {
      const declared = {
        type: state.phase === "draw" ? "draw" : "battle-start",
        player: state.active,
        revision: state.revision,
      };
      state.pending = { action: declared, responding: 1 - state.active, negated: false };
      if (!responseCards(state).length) {
        resolve(state, declared);
        state.pending = null;
      }
      settle(state);
      checkPoints(state);
      canonicalize(state);
      if (!validateState(state)) throw Error("Invalid phase declaration");
      return { ok: true, state };
    }
    let index = PHASES.indexOf(state.phase) + 1;
    if (state.turn === 1 && state.phase === "main1") index = 5;
    if (index >= PHASES.length) {
      for (const uid of Object.keys(state.cards)) {
        const c = state.cards[uid],
          at = locate(state, uid);
        if (!at) continue;
        if (c.returnControl?.turn === state.turn) {
          const owner = c.returnControl.player,
            slot = state.players[owner].units.indexOf(null);
          delete c.returnControl;
          if (slot >= 0) ctx.move(uid, "units", "control-return", owner, slot);
          else ctx.move(uid, "grave", "control-return-no-zone");
        }
        if (modified(state, uid, "endGrave")) ctx.move(uid, "grave", "end-effect");
      }
      state.turn++;
      state.active = 1 - state.active;
      index = 0;
      for (const player of state.players) {
        player.normalUsed = 0;
        player.flags = Object.fromEntries(
          Object.entries(player.flags).filter(([key]) => key === "skipDraw"),
        );
      }
      for (const c of Object.values(state.cards)) {
        c.attacksUsed = 0;
        c.modifiers = c.modifiers.filter((m) => m.until === null);
      }
    }
    state.phase = PHASES[index];
    log(state, "phase", { phase: state.phase });
    if (state.phase !== "draw") ctx.emit(state.phase, { player: state.active });
  } else if (action.type === "discard") ctx.move(action.card, "grave", "hand-limit");
  else if (action.type === "set-field") {
    if (p.field) ctx.move(p.field, "grave", "field-replaced");
    ctx.move(action.card, "field", "set", action.player);
    card.face = "down";
    card.setTurn = state.turn;
    ctx.emit("set", { player: action.player, uid: action.card });
  } else if (action.type === "set-support") {
    ctx.move(action.card, "support", "set", action.player, action.slot);
    card.face = "down";
    card.setTurn = state.turn;
    ctx.emit("set", { player: action.player, uid: action.card });
  } else if (action.type === "position") {
    if (state.phase === "end") card.used.endPosition = state.turn;
    const flip = card.face === "down";
    card.face = "up";
    card.knownTo = [true, true];
    card.position = flip || card.position === "defense" ? "attack" : "defense";
    card.positionTurn = state.turn;
    if (flip) ctx.emit("flip", { player: action.player, uid: action.card });
  } else {
    if (["summon", "set-unit"].includes(action.type)) p.normalUsed++;
    if (action.type === "attack") card.attacksUsed++;
    if (action.type === "activate") {
      card.used.activate = state.turn;
      card.used.duelActivated = true;
    }
    state.pending = { action, responding: 1 - action.player, negated: false };
    if (flagActive(state, 1 - action.player, "blockNextResponse")) {
      state.pending.blocked = true;
      delete state.players[1 - action.player].flags.blockNextResponse;
    }
    if (!responseCards(state).length) {
      resolve(state, action);
      state.pending = null;
    }
  }
  settle(state);
  checkPoints(state);
  canonicalize(state);
  if (!validateState(state)) throw new Error("Invalid duel transaction", { cause: state });
  return { ok: true, state };
}
