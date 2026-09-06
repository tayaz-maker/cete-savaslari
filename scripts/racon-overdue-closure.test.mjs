import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGame } from './racon-harness.mjs';
const setup=()=>{const g=loadGame();g.ev('blank("Rozet QA");enterPlay();S.seed=42;');return g;};
function noBadge(g) {
 g.ev('drawTop()');
 assert.doesNotMatch(g.document.getElementById('top-meta').innerHTML,/gecikmiş|pill bad/);
}
test('Resolved postponement is historical, not an actionable overdue counter',()=>{
 const g=setup();
 g.ev('pushCal({week:S.week,day:S.day,strip:"tehdit",title:"QA tehdit"});window.qa=S.calendar[S.calendar.length-1];delayThreat(window.qa);S.day++;');
 assert.equal(g.ev('window.qa.status'),'ertelendi');
 // This exact runtime state was counted by the removed HUD predicate despite
 // its consequence already being applied and no remaining collection action.
 assert.ok(g.ev('window.qa.week*7+window.qa.day < S.week*7+S.day'));
 const before=g.ev('JSON.stringify(S)');noBadge(g);noBadge(g);assert.equal(g.ev('JSON.stringify(S)'),before);
 g.ev('UI.calId=window.qa.id');assert.match(g.ev('drawTakvim()'),/ertelendi/);
});
test('Calendar history survives save/load; stale badge never returns or duplicates effects',()=>{
 const g=setup();g.ev('pushCal({week:S.week,day:S.day,strip:"tehdit",title:"QA tehdit"});delayThreat(S.calendar[S.calendar.length-1]);S.day++;writeSave();');
 const calendar=g.ev('JSON.stringify(S.calendar)'),pressure=g.ev('S.dosya'),hostility=g.ev('S.rivals[0].husumet');
 for(let i=0;i<3;i++){g.ev('S=loadSave()');noBadge(g);assert.equal(g.ev('JSON.stringify(S.calendar)'),calendar);assert.equal(g.ev('S.dosya'),pressure);assert.equal(g.ev('S.rivals[0].husumet'),hostility);}
});
test('Empty, completed, missed, postponed, multiple historical and endgame states have no dead control',()=>{
 const g=setup();
 for(const statuses of [[],['bitti'],['kacirildi'],['ertelendi'],['bekler','kabul','ertelendi','bitti','kacirildi']]) {
  g.ev(`S.calendar=${JSON.stringify(statuses.map((status,i)=>({id:`qa${i}`,week:1,day:1,strip:'plan',title:'QA',status})))};S.week=3;S.day=1;`);noBadge(g);
 }
 g.ev('S.flags.oyunSonu=true');noBadge(g);assert.equal(g.document.getElementById('btn-ilerlet').disabled,true);
});
