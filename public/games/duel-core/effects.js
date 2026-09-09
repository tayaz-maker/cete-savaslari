import { definition, locate, log, activeCards, finish } from './model.js';
import { shuffle, random } from './random.js';
import { candidates } from './selection.js';
import { statistic, standing, hasSeries } from './modifiers.js';
import { specialPlans, ritualPlans, specialAllowed } from './summoning.js';

// Cards compose these operations; displayed prose is never evaluated as code.
export const primitives = {
  select(ctx, op) {
    const ids = candidates(ctx.state, ctx.player, {...op.selector,reference:ctx.source});
    if (op.all) ctx.targets.push(...ids);
    else {
      const chosen = ctx.selections?.[op.key] || [];
      if (chosen.length) {
        if (chosen.length !== Math.min(op.count || 1, ids.length) || new Set(chosen).size !== chosen.length || chosen.some(uid => !ids.includes(uid))) throw new Error('Invalid effect selection');
        ctx.targets.push(...chosen);
      } else if (ids.length) {
        // The effect runner pauses here. Continuation is data, not a closure;
        // reload can resume exactly the same visible choice and remaining ops.
        ctx.state.choice = { player: op.chooser==='opponent'?1-ctx.player:ctx.player, source: ctx.source, key: op.key, ids,
          count: Math.min(op.count || 1, ids.length), jobId: ctx.jobId };
      }
    }
  },
  points(ctx, op) {
    let amount=op.amount;
    if(op.opponent&&amount<0&&definition(ctx.state,ctx.source)?.subtype==='quick') {
      amount-=standing(ctx.state,ctx.player).reduce((sum,uid)=>sum+(definition(ctx.state,uid).traits?.quickDamage||0),0);
      const bonus=ctx.state.players[ctx.player].flags.quickDamage;if(bonus?.until>=ctx.state.turn)amount-=bonus.value;
    }
    ctx.state.players[op.opponent ? 1 - ctx.player : ctx.player].points += amount;
  },
  draw(ctx, op) {
    const player = op.opponent ? 1 - ctx.player : ctx.player;
    for (let i = 0; i < (op.count || 1) && !ctx.state.result; i++) ctx.draw(player);
  },
  discard(ctx, op) {
    const player = op.opponent ? 1 - ctx.player : ctx.player;
    for (let i = 0; i < (op.count || 1); i++) {
      const hand = ctx.state.players[player].hand;
      const uid = op.random ? hand[Math.floor(random(ctx.state) * hand.length)] : ctx.targets.shift();
      if (uid && hand.includes(uid)) ctx.move(uid, 'grave', 'discard');
    }
  },
  move(ctx, op) {
    for (const uid of ctx.targets.splice(0, op.count || 1)) {
      if (locate(ctx.state, uid)) ctx.move(uid, op.to, op.reason || 'effect');
    }
  },
  destroy(ctx, op) {
    for (const uid of ctx.targets.splice(0, op.count || 1)) ctx.destroy(uid, 'effect');
  },
  modifier(ctx, op) {
    for (const uid of op.self ? [ctx.source] : ctx.targets.splice(0, op.count || 1)) {
      if (ctx.state.cards[uid]) ctx.state.cards[uid].modifiers.push({ ...op.value, until: op.permanent ? null : ctx.state.turn });
    }
  },
  negate(ctx, op) {
    if (ctx.state.pending) {
      ctx.state.pending.negated = true;
      if (op.drawOnly) { ctx.state.pending.negated = false; ctx.state.pending.noDraw = true; }
    }
  },
  cancelAttack(ctx) { if (ctx.state.pending?.action.type === 'attack') ctx.state.pending.negated = true; },
  reveal(ctx, op) {
    const ids = op.hand ? ctx.state.players[1 - ctx.player].hand : ctx.targets.splice(0, op.count || 1);
    for (const uid of ids) if (ctx.state.cards[uid]) ctx.state.cards[uid].knownTo[ctx.player] = true;
    log(ctx.state, 'reveal', { player: ctx.player, cards: [...ids], private: ctx.player });
  },
  shuffle(ctx) { const p = ctx.state.players[ctx.player]; p.deck = shuffle(p.deck, ctx.state); },
  position(ctx, op) {
    for (const uid of ctx.targets.splice(0, op.count || 1)) {
      const card = ctx.state.cards[uid];
      if (uid === ctx.state.pending?.action.card && ['summon','set-unit'].includes(ctx.state.pending.action.type)) {
        (ctx.state.pending.postEffects ||= []).push(op); continue;
      }
      if (card) { card.position = op.position; card.face = op.face || 'up'; }
    }
  },
  flag(ctx, op) { ctx.state.players[op.opponent ? 1 - ctx.player : ctx.player].flags[op.name] = { value: op.value ?? true, until: ctx.state.turn }; },
  pendingTarget(ctx) { if(ctx.state.pending?.action.card)ctx.targets.push(ctx.state.pending.action.card); },
  targets(ctx,op) { ctx.targets.push(...op.ids.filter(uid=>locate(ctx.state,uid))); },
  auxiliary(ctx,op) {
    const p=ctx.state.players[ctx.player];
    const required=op.requiredIds?[...p.hand,...p.units].filter(uid=>uid&&op.requiredIds.includes(definition(ctx.state,uid).id)).slice(0,op.materialCredit):[];
    if(op.requiredIds&&required.length!==op.materialCredit)return;
    const plans=specialPlans(ctx.state,ctx.player,op.materialCredit||0,op.available).map(plan=>({...plan,materials:[...required,...plan.materials.filter(uid=>!required.includes(uid))]}));
    if(!plans.length)return;
    ctx.state.choice={kind:'option',player:ctx.player,source:ctx.source,key:'auxiliary',jobId:ctx.jobId,
      options:plans.map((plan,i)=>({id:`summon-${i}`,card:plan.card,materials:plan.materials,effects:[{op:'performSpecial',plan}]}))};
  },
  ritual(ctx) {
    const plans=ritualPlans(ctx.state,ctx.player,ctx.source);if(!plans.length)return;
    ctx.state.choice={kind:'option',player:ctx.player,source:ctx.source,key:'ritual',jobId:ctx.jobId,
      options:plans.map((plan,i)=>({id:`ritual-${i}`,card:plan.card,materials:plan.materials,effects:[{op:'performSpecial',plan}]}))};
  },
  activateSelected(ctx) {const uid=ctx.targets.shift();if(uid&&locate(ctx.state,uid))ctx.activate(uid);},
  optional(ctx,op) {ctx.state.choice={kind:'option',player:ctx.player,source:ctx.source,key:'optional',jobId:ctx.jobId,options:[{id:'accept',effects:op.effects},{id:'keep',effects:[]}]};},
  performSpecial(ctx,op) {ctx.special(op.plan);},
  look(ctx,op) {
    if(!op.repeated&&hasSeries(ctx.state,ctx.source,'Anket')&&standing(ctx.state,ctx.player).some(uid=>definition(ctx.state,uid).traits?.doublePollLook))ctx.state.work.find(j=>j.id===ctx.jobId).effects.unshift({...op,repeated:true});
    const top=ctx.state.players[ctx.player].deck.slice(0,op.count),eligible=top.filter(uid=>!op.kind||definition(ctx.state,uid).kind===op.kind);
    for(const uid of top)ctx.state.cards[uid].knownTo[ctx.player]=true;
    log(ctx.state,'look',{player:ctx.player,cards:top,private:ctx.player});
    if(!eligible.length)return;
    const job=ctx.state.work.find(j=>j.id===ctx.jobId),count=Math.min(op.take,eligible.length);
    job.effects.unshift({op:'move',to:'hand',count},{op:'lookRest',ids:top,bottom:op.bottom});
    ctx.state.choice={player:ctx.player,source:ctx.source,key:'look',ids:eligible,count,jobId:ctx.jobId};
  },
  lookRest(ctx,op) {
    if(!op.bottom)return;
    const p=ctx.state.players[ctx.player],remaining=op.ids.filter(uid=>p.deck.includes(uid));
    p.deck=p.deck.filter(uid=>!remaining.includes(uid)).concat(remaining);
  },
  forceTributeOrDiscard(ctx) {
    const units=ctx.state.players[1-ctx.player].units.filter(Boolean),job=ctx.state.work.find(j=>j.id===ctx.jobId);
    job.effects.unshift({op:'select',key:'forced',chooser:'opponent',selector:{owner:'opponent',zones:units.length?'units':'hand'}},
      {op:'move',to:'grave',reason:units.length?'tribute':'discard'});
  },
  payOrDiscard(ctx,op) {
    const player=op.opponent?1-ctx.player:ctx.player,options=[{id:'pay',effects:[{op:'points',amount:-op.cost,opponent:op.opponent}]}];
    if(ctx.state.players[player].hand.length)options.push({id:'discard',effects:[{op:'select',key:'discard',chooser:op.opponent?'opponent':'own',selector:{owner:op.opponent?'opponent':'own',zones:'hand'}},{op:'discard',opponent:op.opponent}]});
    ctx.state.choice={kind:'option',player,source:ctx.source,key:'pay-or-discard',options,jobId:ctx.jobId};
  },
  tributeOrPay(ctx,op) {
    const uid=ctx.targets.shift(),at=locate(ctx.state,uid);
    if(!at)return;
    const options=[{id:'tribute',effects:[{op:'targets',ids:[uid]},{op:'move',to:'grave',reason:'tribute'}]}];
    if(ctx.state.players[at.player].points>=op.cost)options.push({id:'pay',effects:[{op:'points',amount:-op.cost,opponent:at.player!==ctx.player}]});
    ctx.state.choice={kind:'option',player:at.player,source:ctx.source,key:'tribute-or-pay',options,jobId:ctx.jobId};
  },
  peekDestroy(ctx,op) {
    const uid=ctx.targets.shift(); if(!locate(ctx.state,uid))return;
    ctx.state.cards[uid].knownTo[ctx.player]=true;
    const options=[{id:'keep',effects:[]}];
    if(ctx.state.players[ctx.player].points>=op.cost)options.push({id:'destroy',effects:[{op:'points',amount:-op.cost},{op:'targets',ids:[uid]},{op:'destroy'}]});
    ctx.state.choice={kind:'option',player:ctx.player,source:ctx.source,key:'peek-destroy',revealed:[uid],options,jobId:ctx.jobId};
  },
  relocate(ctx) {
    const uid=ctx.targets.shift(),at=locate(ctx.state,uid);if(!at)return;
    const options=ctx.state.players[at.player][at.zone].flatMap((value,slot)=>value===null?[{id:`zone-${slot+1}`,effects:[{op:'relocateTo',uid,zone:at.zone,slot}]}]:[]);
    if(options.length)ctx.state.choice={kind:'option',player:ctx.player,source:ctx.source,key:'zone',options,jobId:ctx.jobId};
  },
  relocateTo(ctx,op) {ctx.move(op.uid,op.zone,'relocate',ctx.player,op.slot);},
  drawSetTrap(ctx) {
    const uid=ctx.draw(ctx.player);if(!uid||definition(ctx.state,uid).kind!=='trap'||!ctx.state.players[ctx.player].support.includes(null))return;
    ctx.state.choice={kind:'option',player:ctx.player,source:ctx.source,key:'draw-set',jobId:ctx.jobId,options:[
      {id:'keep',effects:[]},{id:'set',effects:[{op:'targets',ids:[uid]},{op:'set'}]}]};
  },
  negateResponse(ctx) {if(ctx.state.pending)ctx.state.pending.responseLocked=true;},
  skipBattle(ctx) {ctx.state.phase='main2'; if(ctx.state.pending?.action.type==='battle-start')ctx.state.pending.negated=true;},
  cancelSummonToGrave(ctx) {const uid=ctx.state.pending?.action.card;if(uid&&locate(ctx.state,uid))ctx.move(uid,'grave','summon-negated');},
  destroyedTarget(ctx) {const uid=ctx.state.pending?.action.card;if(uid&&locate(ctx.state,uid))ctx.targets.push(uid);},
  transferSameLevel(ctx) {
    const uid=ctx.targets.shift(),d=definition(ctx.state,uid);if(!d||!locate(ctx.state,uid))return;
    const level=d.level;ctx.move(uid,'grave','effect');
    ctx.state.work.find(j=>j.id===ctx.jobId).effects.unshift({op:'select',key:'transfer',selector:{zones:'hand',kind:'unit',minLevel:level,maxLevel:level}},{op:'summon'});
  },
  swapStats(ctx) {
    for(const uid of ctx.targets.splice(0,1)) {
      const attack=stat(ctx.state,uid,'attack'),defense=stat(ctx.state,uid,'defense');
      ctx.state.cards[uid].modifiers.push({attackSet:defense,defenseSet:attack,until:ctx.state.turn});
    }
  },
  conditionalPoints(ctx,op) {
    if(candidates(ctx.state,ctx.player,{zones:'units',series:op.series}).length)ctx.state.players[ctx.player].points+=op.amount;
  },
  discardIf(ctx,op) {
    for(const uid of ctx.targets.splice(0,1))if(definition(ctx.state,uid)?.kind===op.kind)ctx.move(uid,'grave','discard');
  },
  summon(ctx, op) {
    const player = op.opponent ? 1 - ctx.player : ctx.player;
    const uids = op.self ? [ctx.source] : ctx.targets.splice(0, op.count || 1);
    for (const uid of uids) {
      const slot = ctx.state.players[player].units.indexOf(null);
      if (slot < 0 || definition(ctx.state, uid)?.kind !== 'unit' || !specialAllowed(ctx.state,player,uid)) continue;
      if (ctx.move(uid, 'units', 'special', player, slot)) {
        const card = ctx.state.cards[uid];
        card.face = op.face || 'up'; card.position = op.position || 'attack'; card.summonedTurn = ctx.state.turn;
        card.setTurn = ctx.state.turn;
        if (card.face === 'up') { card.knownTo = [true,true]; ctx.emit('summon', {player,uid,special:true}); }
      }
    }
  },
  set(ctx, op) {
    for (const uid of ctx.targets.splice(0, op.count || 1)) {
      const slot = ctx.state.players[ctx.player].support.indexOf(null);
      if (slot < 0 || definition(ctx.state, uid)?.kind === 'unit') continue;
      if (ctx.move(uid, 'support', 'effect-set', ctx.player, slot)) {
        ctx.state.cards[uid].face = 'down'; ctx.state.cards[uid].setTurn = ctx.state.turn;
      }
    }
  },
  selfMove(ctx, op) { ctx.move(ctx.source, op.to, op.reason || 'effect'); },
  token(ctx, op) { ctx.token(op); },
  control(ctx, op) {
    for (const uid of ctx.targets.splice(0, op.count || 1)) {
      const slot = ctx.state.players[ctx.player].units.indexOf(null);
      if (slot < 0) continue;
      const original = locate(ctx.state, uid)?.player;
      if (ctx.move(uid, 'units', 'control', ctx.player, slot) && !op.permanent) ctx.state.cards[uid].returnControl = { player: original, turn: ctx.state.turn };
    }
  },
};

export function enabled(state, uid) { return activeCards(state, locate(state, uid)?.player ?? state.cards[uid]?.owner).includes(uid); }
export function runEffects(ctx, effects) {
  if (!effects?.length) return;
  ctx.state.work.unshift({ type: 'effects', id: ++ctx.state.effectSerial, player: ctx.player,
    source: ctx.source, targets: [...ctx.targets], effects: structuredClone(effects) });
}
export function stat(state, uid, key) {
  return statistic(state,uid,key);
}
export function drawCard(state, player, emit) {
  const p = state.players[player];
  if (!p.deck.length) { finish(state, 1 - player, 'deck-out'); return null; }
  const uid = p.deck.shift(); p.hand.push(uid); state.cards[uid].knownTo[player] = true;
  log(state, 'draw', { player, count: 1 });
  emit?.('draw', { player, uid });
  return uid;
}
