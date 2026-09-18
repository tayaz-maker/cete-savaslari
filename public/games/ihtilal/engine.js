import { cardOf, CARDS } from "./cards.js";
import { ARCHETYPES, DESKS, buildDeck } from "./decks.js";
import { clamp, finite, mulberry, shuffle } from "./rng.js";

export const GAME_ID = "ihtilal";
export const SAVE_VERSION = 1;
export { DESKS, ARCHETYPES };

export const LIMITS = {
  murekkepMax: 8,
  murekkepBase: 3,
  muhurMax: 20,
  isiMax: 100,
  hukumWin: 10,
  deskLock: 3,
  presenceMax: 6,
  handStart: 5,
  handMax: 7,
  playsPerTurn: 2,
  deckSize: 30,
  archiveCap: 12,
  logCap: 80,
  memoryCap: 24,
  turnCap: 40,
  skipLimit: 3,
  playedCap: 80,
};

function emptyDesks() {
  return Object.fromEntries(
    DESKS.map((d) => [d, { presence: [0, 0], lock: null, protect: [0, 0] }]),
  );
}

function emptyPlayer(id, archetype, deck) {
  return {
    id,
    archetype,
    deck: deck.slice(),
    hand: [],
    discard: [],
    exile: [],
    murekkep: LIMITS.murekkepBase,
    muhur: 2,
    hukum: 0,
    skips: 0,
    plays: 0,
  };
}

function log(state, row) {
  state.log = (state.log || []).concat(row).slice(-LIMITS.logCap);
}

function memPush(state, key) {
  state.memory = (state.memory || []).concat(key).slice(-LIMITS.memoryCap);
}

export function createMatch({ seed = 1, playerArchetype = "kalemci", oppArchetype = "hesapci", first = 0 } = {}) {
  const rng = mulberry(seed);
  const p0 = emptyPlayer(0, playerArchetype, buildDeck(playerArchetype, rng));
  const p1 = emptyPlayer(1, oppArchetype, buildDeck(oppArchetype, rng));
  const state = {
    meta: { id: GAME_ID, version: SAVE_VERSION, seed: finite(seed, 1) >>> 0 },
    turn: 1,
    turnPlayer: first === 1 ? 1 : 0,
    phase: "kalem",
    playsLeft: LIMITS.playsPerTurn,
    heat: 8,
    desks: emptyDesks(),
    archive: [],
    players: [p0, p1],
    playedDesk: {},
    once: {},
    familyClaim: {},
    chains: {},
    lastPlay: null,
    pendingCounter: false,
    peek: [null, null],
    result: null,
    log: [],
    memory: [],
    repeats: [0, 0],
    lastDesk: [null, null],
    tutorial: false,
  };
  for (const p of state.players) draw(state, p, LIMITS.handStart);
  beginTurn(state, false);
  log(state, { t: 1, k: "open", a: state.turnPlayer });
  return state;
}

function draw(state, player, n) {
  for (let i = 0; i < n; i++) {
    if (player.hand.length >= LIMITS.handMax) break;
    if (!player.deck.length) {
      if (!player.discard.length) break;
      player.deck = shuffle(player.discard, mulberry((state.meta.seed + state.turn * 17 + player.id * 91) >>> 0));
      player.discard = [];
      log(state, { t: state.turn, k: "reshuffle", a: player.id });
    }
    const id = player.deck.shift();
    if (id) player.hand.push(id);
  }
}

function mill(state, player, n) {
  for (let i = 0; i < n; i++) {
    if (!player.deck.length) break;
    const id = player.deck.shift();
    player.discard.push(id);
  }
}

function opponentOf(state, player) {
  return state.players[1 - player.id];
}

function resolveDesk(desk, actorDesk) {
  if (desk === "any") return actorDesk || "sicil";
  return DESKS.includes(desk) ? desk : actorDesk || "sicil";
}

function applyOps(state, player, ops, actorDesk) {
  const opp = opponentOf(state, player);
  for (const op of ops || []) {
    if (!op || typeof op !== "object") continue;
    const desk = resolveDesk(op.desk, actorDesk);
    if (op.op === "push") {
      const d = state.desks[desk];
      if (d) d.presence[player.id] = clamp(d.presence[player.id] + finite(op.n, 1), 0, LIMITS.presenceMax);
    } else if (op.op === "pull") {
      const target = op.who === "self" ? player : opp;
      const d = state.desks[desk];
      if (d) d.presence[target.id] = clamp(d.presence[target.id] - finite(op.n, 1), 0, LIMITS.presenceMax);
    } else if (op.op === "steal") {
      const d = state.desks[desk];
      if (d) {
        const n = Math.min(finite(op.n, 1), d.presence[opp.id]);
        d.presence[opp.id] = clamp(d.presence[opp.id] - n, 0, LIMITS.presenceMax);
        d.presence[player.id] = clamp(d.presence[player.id] + n, 0, LIMITS.presenceMax);
      }
    } else if (op.op === "seal") {
      player.muhur = clamp(player.muhur + finite(op.n, 1), 0, LIMITS.muhurMax);
    } else if (op.op === "heat") {
      state.heat = clamp(state.heat + finite(op.n, 0), 0, LIMITS.isiMax);
    } else if (op.op === "ink") {
      player.murekkep = clamp(player.murekkep + finite(op.n, 1), 0, LIMITS.murekkepMax);
    } else if (op.op === "draw") {
      draw(state, player, finite(op.n, 1));
    } else if (op.op === "mill") {
      mill(state, opp, finite(op.n, 1));
    } else if (op.op === "hukum") {
      player.hukum = clamp(player.hukum + finite(op.n, 1), 0, 12);
    } else if (op.op === "protect") {
      const d = state.desks[desk];
      if (d) d.protect[player.id] = state.turn + 1;
    } else if (op.op === "unlock") {
      const d = state.desks[desk];
      if (d && d.lock != null && d.protect[d.lock] < state.turn) {
        const owner = state.players[d.lock];
        owner.hukum = clamp(owner.hukum - 2, 0, 12);
        d.lock = null;
        log(state, { t: state.turn, k: "unlock", d: desk, a: player.id });
      }
    } else if (op.op === "discard") {
      for (let i = 0; i < finite(op.n, 1); i++) {
        if (!opp.hand.length) break;
        const id = opp.hand.pop();
        opp.discard.push(id);
      }
    } else if (op.op === "peek") {
      const due = state.archive.find((x) => x.owner === opp.id);
      state.peek[player.id] = due ? due.cardId : null;
    }
  }
}

function scheduleArtci(state, player, card, desk) {
  const due = state.turn + Math.max(1, card.delay || 1);
  state.archive.push({
    id: `${card.id}:${state.turn}:${player.id}`,
    owner: player.id,
    due,
    cardId: card.id,
    desk,
    ops: card.effect,
  });
  if (state.archive.length > LIMITS.archiveCap) {
    const oldest = state.archive.shift();
    const owner = state.players[oldest.owner];
    applyOps(state, owner, oldest.ops, oldest.desk);
    log(state, { t: state.turn, k: "artci-overflow", c: oldest.cardId, a: oldest.owner });
  }
}

function resolveDueArchive(state) {
  const due = [];
  const keep = [];
  for (const row of state.archive) {
    if (row.due <= state.turn) due.push(row);
    else keep.push(row);
  }
  state.archive = keep;
  for (const row of due) {
    const owner = state.players[row.owner];
    applyOps(state, owner, row.ops, row.desk);
    log(state, { t: state.turn, k: "artci", c: row.cardId, a: row.owner, d: row.desk });
  }
}

function lockDesks(state) {
  for (const desk of DESKS) {
    const d = state.desks[desk];
    const [a, b] = d.presence;
    let winner = null;
    if (a >= LIMITS.deskLock && a > b) winner = 0;
    else if (b >= LIMITS.deskLock && b > a) winner = 1;
    if (winner == null) continue;
    if (d.lock === winner) continue;
    if (d.lock != null && d.protect[d.lock] >= state.turn) continue;
    if (d.lock != null && d.lock !== winner) {
      const prev = state.players[d.lock];
      prev.hukum = clamp(prev.hukum - 2, 0, 12);
      log(state, { t: state.turn, k: "steal-lock", d: desk, a: winner });
    }
    d.lock = winner;
    state.players[winner].hukum = clamp(state.players[winner].hukum + 2, 0, 12);
    log(state, { t: state.turn, k: "lock", d: desk, a: winner });
  }
}

function lockedCount(state, id) {
  return DESKS.filter((d) => state.desks[d].lock === id).length;
}

function checkEnd(state) {
  if (state.result) return state;
  for (const p of state.players) {
    if (p.hukum >= LIMITS.hukumWin) {
      state.result = { winner: p.id, reason: "hukum" };
      state.phase = "end";
      log(state, { t: state.turn, k: "end", r: "hukum", a: p.id });
      return state;
    }
  }
  if (state.heat >= LIMITS.isiMax) {
    const a = state.players[0].muhur;
    const b = state.players[1].muhur;
    const winner = a === b ? "draw" : a > b ? 0 : 1;
    state.result = { winner, reason: "dagilma" };
    state.phase = "end";
    log(state, { t: state.turn, k: "end", r: "dagilma", a: winner });
    return state;
  }
  const bothEmpty = state.players.every(
    (p) => !p.hand.length && !p.deck.length && !p.discard.length && !state.archive.some((x) => x.owner === p.id),
  );
  const skipOut = state.players.every((p) => p.skips >= LIMITS.skipLimit);
  if (bothEmpty || skipOut || state.turn > LIMITS.turnCap) {
    const l0 = lockedCount(state, 0);
    const l1 = lockedCount(state, 1);
    let winner = "draw";
    if (l0 !== l1) winner = l0 > l1 ? 0 : 1;
    else if (state.players[0].muhur !== state.players[1].muhur)
      winner = state.players[0].muhur > state.players[1].muhur ? 0 : 1;
    state.result = { winner, reason: bothEmpty ? "exhaust" : skipOut ? "skip" : "time" };
    state.phase = "end";
    log(state, { t: state.turn, k: "end", r: state.result.reason, a: winner });
  }
  return state;
}

function beginTurn(state, increment) {
  if (state.result) return;
  if (increment) {
    state.turnPlayer = 1 - state.turnPlayer;
    if (state.turnPlayer === 0) state.turn += 1;
  }
  const p = state.players[state.turnPlayer];
  const bonus = lockedCount(state, p.id) + (ARCHETYPES[p.archetype]?.inkBonus || 0);
  p.murekkep = clamp(LIMITS.murekkepBase + bonus, 1, LIMITS.murekkepMax);
  draw(state, p, 1);
  resolveDueArchive(state);
  for (const desk of DESKS) {
    const d = state.desks[desk];
    if (d.protect[0] < state.turn) d.protect[0] = 0;
    if (d.protect[1] < state.turn) d.protect[1] = 0;
  }
  state.phase = "kalem";
  state.playsLeft = LIMITS.playsPerTurn;
  p.plays = 0;
  state.lastPlay = null;
  state.pendingCounter = false;
  state.peek[p.id] = null;
  checkEnd(state);
}

function playKey(cardId, desk) {
  return `${cardId}:${desk}`;
}

function chainReady(state, player, card) {
  if (!card.chain) return true;
  const rec = state.chains[`${player.id}:${card.chain.id}`];
  if (card.chain.step <= 1) return true;
  return rec && rec.step === card.chain.step - 1;
}

export function canPlay(state, playerId, cardId, desk) {
  if (state.result) return { ok: false, why: "ended" };
  const player = state.players[playerId];
  const card = cardOf(cardId);
  if (!player || !card) return { ok: false, why: "missing" };
  if (!player.hand.includes(cardId)) return { ok: false, why: "not-in-hand" };
  if (state.once[cardId]) return { ok: false, why: "once" };
  const target = resolveDesk(card.desk === "any" ? desk : card.desk, desk);
  if (!DESKS.includes(target)) return { ok: false, why: "desk" };
  if (card.desk !== "any" && desk && desk !== card.desk) return { ok: false, why: "wrong-desk" };
  if (state.playedDesk[playKey(cardId, target)]) return { ok: false, why: "repeat-desk" };
  if (player.murekkep < card.cost) return { ok: false, why: "ink" };
  if (player.muhur < card.seal) return { ok: false, why: "seal" };
  if (card.type === "karsi") {
    if (state.phase !== "karsi" || state.turnPlayer === playerId || !state.pendingCounter)
      return { ok: false, why: "counter-window" };
  } else if (state.phase !== "kalem" || state.turnPlayer !== playerId) {
    return { ok: false, why: "phase" };
  } else if (state.playsLeft <= 0) {
    return { ok: false, why: "plays" };
  }
  if (!chainReady(state, player, card) && card.type !== "karsi") return { ok: false, why: "chain" };
  return { ok: true, desk: target, card };
}

function spendAndRemove(player, card) {
  player.murekkep = clamp(player.murekkep - card.cost, 0, LIMITS.murekkepMax);
  player.muhur = clamp(player.muhur - card.seal, 0, LIMITS.muhurMax);
  player.hand = player.hand.filter((id) => id !== card.id);
  if (card.once) player.exile.push(card.id);
  else player.discard.push(card.id);
}

function noteChain(state, player, card) {
  if (!card.chain) return;
  const key = `${player.id}:${card.chain.id}`;
  const rec = state.chains[key] || { id: card.chain.id, step: 0 };
  if (card.chain.step === rec.step + 1 || (card.chain.step === 1 && rec.step === 0)) {
    rec.step = card.chain.step;
    state.chains[key] = rec;
    if (rec.step >= 2) {
      player.hukum = clamp(player.hukum + 1, 0, 12);
      log(state, { t: state.turn, k: "chain", c: card.chain.id, a: player.id, s: rec.step });
    }
  }
}

function noteFamily(state, player, card) {
  if (!card.family) return;
  const key = `${player.id}:${card.family}`;
  const rec = state.familyClaim[key] || { n: 0, family: card.family };
  rec.n += 1;
  state.familyClaim[key] = rec;
  if (rec.n === 3 && !state.familyClaim[`${card.family}:locked`]) {
    state.familyClaim[`${card.family}:locked`] = player.id;
    player.hukum = clamp(player.hukum + 1, 0, 12);
    log(state, { t: state.turn, k: "family", f: card.family, a: player.id });
  }
}

function noteRepeat(state, player, desk) {
  if (state.lastDesk[player.id] === desk) state.repeats[player.id] += 1;
  else state.repeats[player.id] = 1;
  state.lastDesk[player.id] = desk;
  if (state.repeats[player.id] >= 3) {
    state.heat = clamp(state.heat + 2, 0, LIMITS.isiMax);
    state.repeats[player.id] = 0;
    log(state, { t: state.turn, k: "repeat-heat", a: player.id, d: desk });
  }
}

function afterPlay(state, player, card, desk) {
  state.playedDesk[playKey(card.id, desk)] = true;
  const keys = Object.keys(state.playedDesk);
  if (keys.length > LIMITS.playedCap) delete state.playedDesk[keys[0]];
  if (card.once) state.once[card.id] = true;
  noteChain(state, player, card);
  noteFamily(state, player, card);
  noteRepeat(state, player, desk);
  memPush(state, `${player.id}:${card.type}:${desk}`);
  state.lastPlay = { actor: player.id, cardId: card.id, desk, type: card.type };
  state.heat = clamp(state.heat + (card.type === "muhurluk" ? 1 : 0), 0, LIMITS.isiMax);
}

export function actingPlayer(state) {
  if (!state || state.result) return 0;
  if (state.phase === "karsi") return 1 - state.turnPlayer;
  return state.turnPlayer;
}

export function legalActions(state, playerId = actingPlayer(state)) {
  if (state.result) return [];
  const actions = [];
  const player = state.players[playerId];
  if (state.phase === "karsi" && playerId !== state.turnPlayer && state.pendingCounter) {
    for (const id of player.hand) {
      const card = cardOf(id);
      if (card?.type === "karsi" && canPlay(state, playerId, id, state.lastPlay?.desk).ok) {
        actions.push({ type: "counter", cardId: id, desk: state.lastPlay?.desk });
      }
    }
    actions.push({ type: "skip-karsi" });
    return actions;
  }
  if (state.phase !== "kalem" || playerId !== state.turnPlayer) return actions;
  for (const id of player.hand) {
    const card = cardOf(id);
    if (!card || card.type === "karsi") continue;
    const desks = card.desk === "any" ? DESKS : [card.desk];
    for (const desk of desks) {
      if (canPlay(state, playerId, id, desk).ok) actions.push({ type: "play", cardId: id, desk });
    }
  }
  actions.push({ type: "end-kalem" });
  return actions;
}

function enterKarsi(state) {
  const opp = 1 - state.turnPlayer;
  const has = state.players[opp].hand.some((id) => cardOf(id)?.type === "karsi");
  if (has && state.lastPlay) {
    state.phase = "karsi";
    state.pendingCounter = true;
    return true;
  }
  return false;
}

function finishKalem(state) {
  lockDesks(state);
  const p = state.players[state.turnPlayer];
  while (p.hand.length > LIMITS.handMax) {
    const id = p.hand.pop();
    p.discard.push(id);
  }
  checkEnd(state);
  if (!state.result) beginTurn(state, true);
}

export function applyAction(state, action) {
  if (!state || state.result || !action) return { ok: false, why: "ended" };
  if (action.type === "play") {
    const gate = canPlay(state, state.turnPlayer, action.cardId, action.desk);
    if (!gate.ok) return gate;
    const player = state.players[state.turnPlayer];
    const card = gate.card;
    const desk = gate.desk;
    spendAndRemove(player, card);
    state.playsLeft -= 1;
    player.plays += 1;
    player.skips = 0;
    if (card.type === "artci" || card.delay > 0) scheduleArtci(state, player, card, desk);
    else applyOps(state, player, card.effect, desk);
    afterPlay(state, player, card, desk);
    log(state, { t: state.turn, k: "play", c: card.id, a: player.id, d: desk });
    if (enterKarsi(state)) return { ok: true, state };
    if (state.playsLeft <= 0) finishKalem(state);
    checkEnd(state);
    return { ok: true, state };
  }
  if (action.type === "counter") {
    const actor = 1 - state.turnPlayer;
    const gate = canPlay(state, actor, action.cardId, action.desk || state.lastPlay?.desk);
    if (!gate.ok) return gate;
    const player = state.players[actor];
    const card = gate.card;
    spendAndRemove(player, card);
    applyOps(state, player, card.effect, gate.desk);
    afterPlay(state, player, card, gate.desk);
    log(state, { t: state.turn, k: "counter", c: card.id, a: actor, d: gate.desk });
    state.phase = "kalem";
    state.pendingCounter = false;
    if (state.playsLeft <= 0) finishKalem(state);
    checkEnd(state);
    return { ok: true, state };
  }
  if (action.type === "skip-karsi") {
    if (state.phase !== "karsi") return { ok: false, why: "phase" };
    state.phase = "kalem";
    state.pendingCounter = false;
    if (state.playsLeft <= 0) finishKalem(state);
    return { ok: true, state };
  }
  if (action.type === "end-kalem") {
    if (state.phase !== "kalem" || action.player != null && action.player !== state.turnPlayer)
      return { ok: false, why: "phase" };
    const p = state.players[state.turnPlayer];
    if (state.playsLeft === LIMITS.playsPerTurn && !p.hand.length) p.skips += 1;
    finishKalem(state);
    return { ok: true, state };
  }
  return { ok: false, why: "unknown" };
}

export function publicView(state, viewer = 0) {
  const me = state.players[viewer];
  const opp = state.players[1 - viewer];
  return {
    viewer,
    turn: state.turn,
    phase: state.phase,
    turnPlayer: state.turnPlayer,
    playsLeft: state.playsLeft,
    heat: state.heat,
    result: state.result,
    desks: Object.fromEntries(
      DESKS.map((d) => {
        const row = state.desks[d];
        return [d, { presence: row.presence.slice(), lock: row.lock, protect: row.protect.slice() }];
      }),
    ),
    me: {
      hand: me.hand.slice(),
      deck: me.deck.length,
      discard: me.discard.length,
      murekkep: me.murekkep,
      muhur: me.muhur,
      hukum: me.hukum,
      archetype: me.archetype,
      archive: state.archive.filter((x) => x.owner === viewer).map((x) => ({ due: x.due, cardId: x.cardId, desk: x.desk })),
      peek: state.peek[viewer],
    },
    opp: {
      hand: opp.hand.length,
      deck: opp.deck.length,
      discard: opp.discard.length,
      murekkep: opp.murekkep,
      muhur: opp.muhur,
      hukum: opp.hukum,
      archetype: opp.archetype,
      archive: state.archive.filter((x) => x.owner !== viewer).length,
    },
    lastPlay: state.lastPlay,
    log: state.log.slice(-12),
    pendingCounter: state.pendingCounter,
  };
}

function finitePlayer(p, i) {
  if (!p || typeof p !== "object") return null;
  if (![0, 1].includes(i)) return null;
  const hand = Array.isArray(p.hand) ? p.hand.filter((id) => cardOf(id)).slice(0, LIMITS.handMax) : [];
  const deck = Array.isArray(p.deck) ? p.deck.filter((id) => cardOf(id)).slice(0, 40) : [];
  const discard = Array.isArray(p.discard) ? p.discard.filter((id) => cardOf(id)).slice(0, 40) : [];
  const exile = Array.isArray(p.exile) ? p.exile.filter((id) => cardOf(id)).slice(0, 40) : [];
  if (!ARCHETYPES[p.archetype]) return null;
  return {
    id: i,
    archetype: p.archetype,
    deck,
    hand,
    discard,
    exile,
    murekkep: clamp(p.murekkep, 0, LIMITS.murekkepMax),
    muhur: clamp(p.muhur, 0, LIMITS.muhurMax),
    hukum: clamp(p.hukum, 0, 12),
    skips: clamp(p.skips, 0, 8),
    plays: clamp(p.plays, 0, 4),
  };
}

export function normalize(raw) {
  try {
    if (!raw || typeof raw !== "object") return null;
    if (raw.meta?.id !== GAME_ID) return null;
    if (raw.meta?.version !== SAVE_VERSION) return null;
    if (!Number.isFinite(raw.meta.seed)) return null;
    const players = [finitePlayer(raw.players?.[0], 0), finitePlayer(raw.players?.[1], 1)];
    if (!players[0] || !players[1]) return null;
    const desks = emptyDesks();
    for (const d of DESKS) {
      const src = raw.desks?.[d];
      if (!src) return null;
      desks[d] = {
        presence: [clamp(src.presence?.[0], 0, LIMITS.presenceMax), clamp(src.presence?.[1], 0, LIMITS.presenceMax)],
        lock: src.lock === 0 || src.lock === 1 ? src.lock : null,
        protect: [clamp(src.protect?.[0], 0, 80), clamp(src.protect?.[1], 0, 80)],
      };
    }
    const archive = Array.isArray(raw.archive)
      ? raw.archive
          .filter((x) => x && cardOf(x.cardId) && (x.owner === 0 || x.owner === 1))
          .slice(0, LIMITS.archiveCap)
          .map((x) => ({
            id: String(x.id || x.cardId).slice(0, 48),
            owner: x.owner,
            due: clamp(x.due, 1, 80),
            cardId: x.cardId,
            desk: DESKS.includes(x.desk) ? x.desk : "sicil",
            ops: Array.isArray(x.ops) ? x.ops.slice(0, 8) : [],
          }))
      : [];
    const phase = ["kalem", "karsi", "end"].includes(raw.phase) ? raw.phase : "kalem";
    return {
      meta: { id: GAME_ID, version: SAVE_VERSION, seed: raw.meta.seed >>> 0 },
      turn: clamp(raw.turn, 1, 80),
      turnPlayer: raw.turnPlayer === 1 ? 1 : 0,
      phase,
      playsLeft: clamp(raw.playsLeft, 0, LIMITS.playsPerTurn),
      heat: clamp(raw.heat, 0, LIMITS.isiMax),
      desks,
      archive,
      players,
      playedDesk: raw.playedDesk && typeof raw.playedDesk === "object" ? { ...raw.playedDesk } : {},
      once: raw.once && typeof raw.once === "object" ? { ...raw.once } : {},
      familyClaim: raw.familyClaim && typeof raw.familyClaim === "object" ? { ...raw.familyClaim } : {},
      chains: raw.chains && typeof raw.chains === "object" ? { ...raw.chains } : {},
      lastPlay: raw.lastPlay && typeof raw.lastPlay === "object" ? raw.lastPlay : null,
      pendingCounter: !!raw.pendingCounter,
      peek: Array.isArray(raw.peek) ? [raw.peek[0] || null, raw.peek[1] || null] : [null, null],
      result: raw.result && typeof raw.result === "object" ? raw.result : null,
      log: Array.isArray(raw.log) ? raw.log.slice(-LIMITS.logCap) : [],
      memory: Array.isArray(raw.memory) ? raw.memory.slice(-LIMITS.memoryCap) : [],
      repeats: [clamp(raw.repeats?.[0], 0, 5), clamp(raw.repeats?.[1], 0, 5)],
      lastDesk: [DESKS.includes(raw.lastDesk?.[0]) ? raw.lastDesk[0] : null, DESKS.includes(raw.lastDesk?.[1]) ? raw.lastDesk[1] : null],
      tutorial: !!raw.tutorial,
    };
  } catch {
    return null;
  }
}

export function cloneState(state) {
  return normalize(JSON.parse(JSON.stringify(state)));
}

export function playable(state) {
  return !!state && !state.result && (legalActions(state).length > 0 || state.phase === "karsi");
}

export { CARDS, cardOf };
