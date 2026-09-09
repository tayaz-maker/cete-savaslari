import { definition } from './model.js';
import { standing, hasSeries, modified, suppressed } from './modifiers.js';
export function traits(state,uid) {return suppressed(state,uid)||state.cards[uid]?.face!=='up'?{}:definition(state,uid).traits||{};}
export function effectTargetable(state,uid,player) {
  const card=state.cards[uid],owner=state.players.findIndex(p=>p.units.includes(uid)||p.support.includes(uid)||p.field===uid);
  if(owner===player)return true;
  const t=traits(state,uid);
  if(t.untargetableEffect)return false;
  if(t.targetProtectionWithSetTrap&&state.players[owner].support.some(id=>id&&state.cards[id].face==='down'&&definition(state,id).kind==='trap'))return false;
  return !standing(state,owner).some(id=>state.cards[id].equippedTo===uid&&definition(state,id).traits?.equip?.untargetableEffect)&&card!==undefined;
}
export function attackTargets(state,player,uid) {
  const opponent=state.players[1-player],t=traits(state,uid);
  const defenders=opponent.units.filter(Boolean).filter(id=>{
    const x=traits(state,id);return !x.untargetableBattle&&!(x.untargetableDefense&&state.cards[id].position==='defense');
  });
  const blocked=opponent.units.some(id=>id&&state.cards[id].position==='defense'&&traits(state,id).blockDirectDefense);
  const redirect=opponent.units.find(id=>id&&traits(state,id).redirectDirect&&state.cards[id].used.redirect!==state.turn);
  const direct=t.direct||t.directGraveCount<=state.players[player].grave.length||
    t.directWithField&&state.players.some(p=>p.field&&definition(state,p.field).id===t.directWithField);
  const mayDirect=!blocked&&!redirect&&(!defenders.length||direct);
  return mayDirect?[...defenders,null]:defenders;
}
export function attackBlocked(state,player,uid,target) {
  const t=traits(state,uid),p=state.players[player],def=definition(state,uid);
  return t.cannotAttack||modified(state,uid,'cannotAttack')||
    (p.flags.blockAttackMaxLevel?.until>=state.turn&&def.level<=p.flags.blockAttackMaxLevel.value)||
    (p.flags.blockAttackSeries?.until>=state.turn&&hasSeries(state,uid,p.flags.blockAttackSeries.value))||
    (target&&t.directOnlyMultiple&&state.cards[uid].attacksUsed>=1);
}
export function battleDamage(state,attacker,defender,packet,player) {
  const t=traits(state,attacker),out={damage:[...packet.damage],destroy:[...packet.destroy]};
  for(let i=0;i<2;i++) {
    const who=i===0?player:1-player,p=state.players[who];
    if(p.flags.noBattleDamage?.until>=state.turn||p.units.some(id=>id&&state.cards[id].position==='defense'&&traits(state,id).noBattleDamageDefense))out.damage[i]=0;
    else if(out.damage[i]>0) {
      for(const owner of [0,1])for(const uid of standing(state,owner))out.damage[i]+=traits(state,uid).battleDamage||0;
      if(i===1)out.damage[i]=Math.floor(out.damage[i]*(t.battleMultiplier??1));
    }
  }
  if(!defender&&out.damage[1]>0) {
    for(const owner of [0,1])for(const uid of standing(state,owner))out.damage[1]-=traits(state,uid).directReduction||0;
    if(t.directBonusBelow&&state.players[player].points<t.directBonusBelow.threshold)out.damage[1]+=t.directBonusBelow.amount;
    for(const uid of standing(state,player)) {
      const x=traits(state,uid);
      if(x.seriesDirectBonus&&hasSeries(state,attacker,x.seriesDirectBonus.series))out.damage[1]+=x.seriesDirectBonus.amount;
      if(x.equip&&state.cards[uid].equippedTo===attacker&&x.equip.directMultiplier)out.damage[1]=Math.floor(out.damage[1]*x.equip.directMultiplier);
    }
  }
  if(defender&&out.damage[1]>0&&definition(state,attacker).level===definition(state,defender).level)out.damage[1]+=t.sameLevelDamage||0;
  out.damage=out.damage.map(n=>Math.max(0,n));return out;
}
