import assert from 'node:assert/strict';
import {loadStrategy} from './strategy-harness.mjs';
export function hanedan(kind,seed=4242){
 const g=loadStrategy('public/games/hanedan/index.html',seed);g.ev('act("new:hanedan");act("setupgo");draftPick=draftPool.slice(0,8).map(m=>m.id);act("draftok");');
 // Rendered browser acceptance is separate; avoid rebuilding the fake DOM in stress loops.
 g.ev("paint=function(){};");
 const checkpoints=[];let raids=0,rest=0;
 for(let step=0;step<160&&!g.ev('S.over');step++){
  g.ev('closeSheet(false);S.men.filter(m=>m.sozlesme<=0).forEach(m=>act("soz:pay:"+m.id));');
  if(g.ev('currentSquadMen().length<3'))g.ev('S.market.slice(0,2).forEach(m=>act("hire:"+m.id));S.prep.squad=autoSquad();');
  if(kind!=='aggressive')g.ev('if(!S.staff.doktor)act("staff:doktor");if(!S.bld.hamam)act("up:hamam");if(!S.bld.hukuk)act("up:hukuk");');
  g.ev(`act("gambit:${kind==='aggressive'?'ilkates':'polis'}");`);
  const shouldRest=g.ev('!currentSquadMen().length')||(kind==='conservative'&&step%3===2);
  if(shouldRest){g.ev('act("rest")');rest++;}else{g.ev('act("ilerlet")');if(g.ev('!!reader')){raids++;g.ev('while(reader){if(reader.raid.rooms[reader.idx].silent&&!S.prep.silent)act("silent:telsiz");act("rnext");}');}}
  const s=JSON.parse(g.ev('JSON.stringify(S)'));assert.ok(Number.isFinite(s.kasa));assert.ok(s.men.length<=24);assert.ok(s.heat>=0&&s.heat<=100);assert.equal(new Set(s.men.map(m=>m.id)).size,s.men.length);assert.ok(s.grave.length<=80);assert.ok(s.kronik.length<=400);assert.ok(s.archive.length<=24);
  if(step%16===15||s.over)checkpoints.push({week:s.week,season:s.season,tier:s.tier,cash:s.kasa,crew:s.men.length,over:s.over,crowned:!!s.crowned});
  if(step%9===0){assert.ok(g.ev('parseSave(encodeSave(S))')!=='corrupt');g.ev('resumeSave(parseSave(encodeSave(S)))');}
 }
 return {kind,raids,rest,checkpoints};
}
export function bukucu(seed=4242,n=3){
 const g=loadStrategy('public/games/bukucu/index.html',seed);g.ev(`act("hot${n}");paint=function(){};drawRing=function(){};`);let steps=0;
 while(!g.ev('S.win!=null')&&steps++<5000){
  const wait=g.ev('S.wait');
  if(wait==='roll'||wait==='jail')g.ev('act("roll")');
  else if(wait==='buy')g.ev('act(S.cash[S.turn]>SQ[S.pos[S.turn]][2]+100?"al":"gec")');
  else if(wait==='auc')g.ev('act(S.cash[S.auc.turn]>=nextAucBid() && nextAucBid()<=SQ[S.auc.i][2]?"aup":"aun")');
  else if(wait==='pay')g.ev('act("ode")');
  else if(wait==='offer')g.ev('act("tno")');
  else if(wait==='own')g.ev('act("bitir")');
  else g.ev('act("ok")');
  g.flush(100);
  const s=JSON.parse(g.ev('JSON.stringify(S)'));assert.ok(s.cash.every(x=>Number.isFinite(x)&&x>=0));assert.ok(s.own.every(x=>Number.isInteger(x)&&x>=-1&&x<n));assert.ok(s.bld.every(x=>x>=0&&x<=4));
  if(steps%13===0)g.ev('act("quit");act("cont")');
 }
 assert.ok(g.ev('S.win!=null'),'production game must end');return JSON.parse(g.ev('JSON.stringify({winner:S.win,turns:S.stat.turns,cash:S.cash,own:S.own,steps:'+steps+'})'));
}
if(process.argv[1]?.endsWith('strategy-longrun.mjs')){
 const h=['balanced','aggressive','conservative'].map(k=>{const a=hanedan(k);assert.deepEqual(a,hanedan(k));return a;});
 const b=Array.from({length:8},(_,i)=>{const a=bukucu(4242+i,2+i%3);assert.deepEqual(a,bukucu(4242+i,2+i%3));return a;});
 console.log(JSON.stringify({hanedan:h,bukucu:b,determinism:'PASS'},null,2));
}
