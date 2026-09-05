import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { loadGame } from './racon-harness.mjs';

// Production actions only. Initial seed/origin are scenario configuration.
export function runRaconLife(kind='balanced',seed=4242,days=730,exportSave=false) {
 const g=loadGame();g.win.__raconSeedSabit=seed;
 const ev=g.ev;ev('UI.pendingLakap="Uzun hayat";act("origin",{id:"koy"});act("night",{id:"kahve"});UI.fastJob=true;');
 const max={jobs:0,inbox:0,calendar:0,evidence:0,history:0,peopleMods:0,men:0,dosya:0};let jobs=0,appointments=0;
 const checkpoints=[];
 function settleJob(id){
   ev(`act("sahne",{id:${JSON.stringify(id)}});`);
   for(let i=0;i<20&&ev('UI.sahne&&!UI.jobDone');i++) ev(`act("job-emir",{id:jobBy(UI.jobId).okulBekliyor?"cekil":${JSON.stringify(kind==='aggressive'?'sikistir':'sessiz')}});`);
   if(ev('UI.jobDone')){jobs++;ev('act("job-tamam",{});');}
 }
 for(let day=0;day<days&&!ev('S.flags.oyunSonu');day++){
   const dayBefore=ev("today()");
   const ready=ev('S.jobs.filter(function(j){return !jobReason(j);}).map(function(j){return j.id;})');
   ready.forEach(settleJob);
   // A changed crew can invalidate a reservation; normal cancellation releases it.
   ev('S.jobs.filter(function(j){return j.phase!=="done"&&j.prepLeft===0&&jobReason(j);}).forEach(function(j){act("job-cancel",{id:j.id});});');
   const due=ev('S.calendar.filter(function(c){return c.strip==="randevu"&&c.status==="bekler"&&c.week===S.week&&c.day===S.day;}).map(function(c){return c.id;})');
   for(const id of due)if(!ev(`actionReason("randevu-git",{id:"${id}"})`)){
     ev(`act("randevu-git",{id:"${id}",tarz:"kapi"});`);
     for(let n=0;n<30&&ev('!!UI.rnd');n++)ev('if(UI.rnd.bekle)act("rnd-karar",{k:"konus"});else rndTick();');
     appointments++;
   }
   if(!ev('UI.sahne')){
     const free=ev('S.men.filter(function(m){return availableMan(m);}).map(function(m){return m.id;})');
     if(free.length&&kind!=='passive'){
       const street=ev('S.streets.filter(function(s){return s.sahip==="bos"&&!s.muhurLeft;}).sort(function(a,b){return num(S.flags.touchJobs[b.id],0)-num(S.flags.touchJobs[a.id],0);})[0]||streetBy(S.streetHome)');
       g.document.getElementById('job-street').value=street.id;g.document.getElementById('job-kind').value='tahsilat';
       g.document.querySelectorAll=q=>q==='input[data-man]:checked'?free.map(id=>({getAttribute:()=>id})):[];
       ev('UI.planMen=null;UI.planKind="tahsilat";act("planla",{});');
     }
     ev('S.streets.filter(function(s){return s.sahip==="bos"&&!actionReason("tut",{id:s.id});}).slice(0,1).forEach(function(s){act("tut",{id:s.id});});');
     if(kind==='balanced')ev('if(!actionReason("hayat",{id:"kahve"}))act("hayat",{id:"kahve"});if(S.day===5&&!actionReason("hayat",{id:"cami"}))act("hayat",{id:"cami"});');
     ev('S.men.filter(function(m){return m.durum==="yarali"&&!actionReason("tedavi",{id:m.id});}).slice(0,1).forEach(function(m){act("tedavi",{id:m.id});});');
     ev('act("ilerlet",{});if(UI.modal)act("threat-yes",{});');
   }
   assert.ok(ev('today()')>dayBefore||ev('S.flags.oyunSonu'),JSON.stringify(ev('({week:S.week,day:S.day,busy:S.busy,scene:UI.sahne,modal:UI.modal,feedback:UI.feedback})')));
   assert.equal(ev('S.kasa===S.cleanKasa+S.dirtyKasa&&S.kasa>=0'),true,'cash invariant');
   assert.equal(ev('S.dosya>=0&&S.dosya<=100&&S.streets.every(function(s){return s.heat>=0&&s.heat<=100;})'),true,'bounds');
   for(const [key,expr] of Object.entries({jobs:'S.jobs.length',inbox:'S.inbox.length',calendar:'S.calendar.length',evidence:'S.evidence.length',history:'S.defter.length',peopleMods:'Math.max.apply(null,S.people.map(function(p){return p.mods.length;}))',men:'S.men.length',dosya:'S.dosya'}))max[key]=Math.max(max[key],ev(expr));
   if(day%28===27){const before=ev('today()');assert.equal(ev('writeSave()'),true);assert.equal(ev('validSave(JSON.parse(localStorage.getItem(KEY)))'),true,JSON.stringify(ev('dumpSave()')));ev('S=loadSave();enterPlay();UI.fastJob=true;');assert.equal(ev('today()'),before,'roundtrip must not roll back');checkpoints.push(ev('({week:S.week,kasa:S.kasa,stage:S.stage,own:ownN(),dosya:S.dosya})'));}
 }
 assert.equal(ev('!!UI.sahne'),false,'no stuck scene');
 assert.ok(max.history<=240);assert.ok(max.jobs<=47);assert.ok(max.inbox<=300,JSON.stringify(max));
 return {kind,seed,jobs,appointments,max,checkpoints,...(exportSave?{save:ev("exportText()")}:{}),final:ev('({week:S.week,day:S.day,stage:S.stage,kasa:S.kasa,own:ownN(),end:S.flags.oyunSonu,seed:S.seed})')};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=['balanced','aggressive','passive'].map(k=>{const a=runRaconLife(k);assert.deepEqual(runRaconLife(k),a,'repeat '+k);return a;});
 const stress=[];for(let i=1;i<=12;i++)stress.push(runRaconLife(i%2?'balanced':'aggressive',i*9127,365));
 console.log(JSON.stringify({scenarios:report,stress:stress.map(s=>({seed:s.seed,final:s.final,max:s.max})),determinism:'PASS'},null,2));
}
