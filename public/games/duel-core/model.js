export const PHASES = ['draw', 'standby', 'main1', 'battle', 'main2', 'end'];
export const PILES = ['deck', 'hand', 'grave', 'banished', 'auxiliary'];
export const ROWS = ['units', 'support'];
export const MAIN = ['main1', 'main2'];

export function definition(state, uid) {
  const card = state.cards[uid];
  return card?.token ? { id:'token',kind:'unit',subtype:'token',deckLocation:'token',level:1,
    name:{tr:card.token.tr,en:card.token.en},attack:card.token.attack,defense:card.token.defense,series:'token',triggers:[],effects:[] } : state.catalog[card?.id];
}
export function locate(state, uid) {
  for (let player = 0; player < 2; player++) {
    const p = state.players[player];
    for (const zone of [...PILES, ...ROWS]) {
      const index = p[zone].indexOf(uid);
      if (index >= 0) return { player, zone, index };
    }
    if (p.field === uid) return { player, zone: 'field', index: 0 };
  }
  return null;
}
export function fieldCards(state, player) {
  const p = state.players[player];
  return [...p.units, ...p.support, p.field].filter(Boolean);
}
export function faceUp(state, uid) { return state.cards[uid]?.face === 'up'; }
export function activeCards(state, player) {
  return fieldCards(state, player).filter(uid => faceUp(state, uid) &&
    !state.cards[uid].negated && !(state.cards[uid].negatedUntil >= state.turn));
}
export function log(state, event, data = {}) {
  state.log.push({ revision: state.revision, turn: state.turn, player: state.active, event, ...data });
  if (state.log.length > 180) state.log.shift();
}
export function finish(state, winner, reason) {
  if (state.result) return;
  state.result = { winner, reason, turn: state.turn, points: state.players.map(p => p.points) };
  state.pending = null;
  log(state, 'result', state.result);
}
export function checkPoints(state) {
  const dead = state.players.map(p => p.points <= 0);
  if (dead[0] || dead[1]) finish(state, dead[0] && dead[1] ? null : dead[0] ? 1 : 0, dead[0] && dead[1] ? 'simultaneous' : 'points');
}
export function canonicalize(value) {
  if(!value||typeof value!=='object')return value;
  for(const key of Object.keys(value)) {
    if(key==='catalog')continue;
    if(value[key]===undefined&&!Array.isArray(value))delete value[key];
    else canonicalize(value[key]);
  }
  return value;
}

// Identity and zone invariants also protect save hydration. Catalog is trusted
// local data and is attached separately, never accepted from a saved payload.
export function validateState(state) {
  if (!state || state.version !== 1 || !Array.isArray(state.players) || state.players.length !== 2 ||
      ![0, 1].includes(state.active) || ![0, 1].includes(state.first) || !PHASES.includes(state.phase) ||
      !Number.isSafeInteger(state.turn) || state.turn < 1 || !Number.isSafeInteger(state.revision) || state.revision < 0 ||
      !Number.isSafeInteger(state.rng) || state.rng < 0 || state.rng > 4294967295 ||
      !state.cards || !state.catalog || !Array.isArray(state.log)) return false;
  const {catalog:_catalog,...saved}=state;
  const dataOnly=value=>value===null||typeof value==='string'||typeof value==='boolean'||
    typeof value==='number'&&Number.isFinite(value)||
    typeof value==='object'&&value!==null&&Object.values(value).every(dataOnly);
  if(!dataOnly(saved)||!Array.isArray(state.work)||state.work.length>1000||!Number.isSafeInteger(state.effectSerial))return false;
  if(state.choice&&(![0,1].includes(state.choice.player)||!state.work.some(j=>j.id===state.choice.jobId)))return false;
  const seen = new Set();
  for (const p of state.players) {
    if (!Number.isFinite(p.points) || !Number.isSafeInteger(p.normalUsed) || p.normalUsed < 0) return false;
    for (const zone of [...PILES, ...ROWS, 'field']) {
      const items = zone === 'field' ? [p.field] : p[zone];
      if (!Array.isArray(items) || (ROWS.includes(zone) && items.length !== 5)) return false;
      for (const uid of items) {
        if (uid === null && (ROWS.includes(zone) || zone === 'field')) continue;
        const card = state.cards[uid], def = definition(state, uid);
        if (!card || !def || seen.has(uid) || ![0, 1].includes(card.owner) ||
            !['up', 'down'].includes(card.face) || !['attack', 'defense'].includes(card.position) ||
            !Number.isSafeInteger(card.setTurn) || !Number.isSafeInteger(card.summonedTurn) ||
            !Number.isSafeInteger(card.attacksUsed) || card.attacksUsed < 0 || !Array.isArray(card.modifiers)) return false;
        if (zone === 'units' && def.kind !== 'unit') return false;
        if (zone === 'support' && def.kind === 'unit') return false;
        if (zone === 'auxiliary' && def.deckLocation !== 'auxiliary') return false;
        if (zone === 'deck' && def.deckLocation !== 'main') return false;
        seen.add(uid);
      }
    }
  }
  return Object.keys(state.cards).every(uid => seen.has(uid));
}
