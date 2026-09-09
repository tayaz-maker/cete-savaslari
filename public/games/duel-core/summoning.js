import { definition } from './model.js';
import { hasSeries, standing } from './modifiers.js';

export function specialAllowed(state,player,uid) {
  if(state.players[player].flags.blockSpecial?.until>=state.turn)return false;
  return !standing(state,1-player).some(source=>{const t=definition(state,source).traits||{};return t.blockSpecialMaxLevel>=definition(state,uid).level&&(!t.requiresSeries||state.players[1-player].units.some(id=>id&&hasSeries(state,id,t.requiresSeries)));});
}
function combos(values,n) {
  if(!n)return [[]];
  return values.flatMap((v,i)=>combos(values.slice(i+1),n-1).map(rest=>[v,...rest]));
}
function seriesMatch(state,materials,requirements) {
  if(!requirements.length)return true;
  return materials.some((uid,i)=>(requirements[0]===null||hasSeries(state,uid,requirements[0]))&&
    seriesMatch(state,materials.filter((_,j)=>i!==j),requirements.slice(1)));
}
export function specialPlans(state,player,credit=0,restricted=null) {
  const p=state.players[player],plans=[];
  if(p.flags.blockSpecial?.until>=state.turn)return plans;
  const discount=p.flags.auxiliaryDiscount?.value||0;
  for(const uid of p.auxiliary) {
    const t=definition(state,uid).traits||{},req=t.materials;
    if(t.specialCondition==='fourGraveUnits'&&p.grave.filter(id=>definition(state,id).kind==='unit').length>=4)plans.push({card:uid,materials:[]});
    if(t.specialCondition==='revealHandUnit')for(const reveal of p.hand.filter(id=>definition(state,id).kind==='unit'))plans.push({card:uid,materials:[],reveal});
    if(!req)continue;
    const n=Math.max(0,(req.count||req.series?.length||0)-credit-discount);
    const available=restricted||[...new Set((req.zones||['hand','units']).flatMap(zone=>p[zone]))].filter(id=>id&&definition(state,id).kind==='unit');
    for(const materials of combos(available,n)) {
      if(req.series&&!seriesMatch(state,materials,req.series.slice(credit+discount)))continue;
      if(req.differentSeries&&materials.length>1&&definition(state,materials[0]).series.some(s=>hasSeries(state,materials[1],s)))continue;
      if(p.units.includes(null)||materials.some(id=>p.units.includes(id)))plans.push({card:uid,materials,discount:Boolean(discount)});
    }
  }
  for(const uid of p.banished)if(definition(state,uid).traits?.specialCondition==='effectBanished'&&state.cards[uid].banishReason==='effect'&&p.units.includes(null))plans.push({card:uid,materials:[]});
  return plans.filter(plan=>specialAllowed(state,player,plan.card));
}
export function ritualPlans(state,player,riteSource=null) {
  const p=state.players[player],plans=[];
  if(p.flags.blockSpecial?.until>=state.turn)return plans;
  const enabler=riteSource&&definition(state,riteSource)?.traits?.ritualEnabler?riteSource:[...p.hand,...standing(state,player)].find(id=>definition(state,id).traits?.ritualEnabler);
  if(!enabler)return plans;
  const helpers=standing(state,player).filter(id=>definition(state,id).traits?.graveRitualMaterial);
  for(const uid of p.hand) {
    const requirement=definition(state,uid).traits?.ritualLevel;if(!requirement)continue;
    const available=[...p.hand,...p.units].filter(id=>id&&id!==uid&&id!==enabler&&definition(state,id).kind==='unit');
    const grave=p.grave.filter(id=>definition(state,id).traits?.graveRitualLevel||helpers.length&&definition(state,id).kind==='unit');
    for(let count=1;count<=available.length;count++) {
      const sets=combos(available,count);
      for(const material of sets)for(const extra of [null,...grave]) {
        const materials=extra?[...material,extra]:material;
        const level=materials.reduce((sum,id)=>sum+(p.grave.includes(id)&&definition(state,id).traits?.graveRitualLevel||definition(state,id).traits?.materialLevelSet||definition(state,id).level),0);
        if(level>=requirement&&(p.units.includes(null)||materials.some(id=>p.units.includes(id))))plans.push({card:uid,materials,ritual:true,enabler});
      }
      if(plans.some(plan=>plan.card===uid))break;
    }
  }
  return plans.filter(plan=>specialAllowed(state,player,plan.card));
}
