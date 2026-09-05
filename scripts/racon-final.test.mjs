import test from 'node:test';
import assert from 'node:assert/strict';
import { loadGame } from './racon-harness.mjs';

function game(seed=4242) {
  const g=loadGame();
  g.win.__raconSeedSabit=seed;
  g.ev(`blank("Kabul");enterPlay();S.seed=${seed};UI.fastJob=true;`);
  return g;
}
function plan(g, kind='tahsilat',street='st_fevzi') {
  g.document.getElementById('job-street').value=street;
  g.document.getElementById('job-kind').value=kind;
  const ids=g.ev('S.men.filter(function(m){return availableMan(m);}).map(function(m){return m.id;})');
  g.document.querySelectorAll=selector=>selector==='input[data-man]:checked'?ids.map(id=>({getAttribute:()=>id})):[];
  g.ev(`UI.planKind=${JSON.stringify(kind)};UI.planMen=null;act("planla",{});`);
  return g.ev('S.jobs[S.jobs.length-1]');
}
function finish(g,id,choice='sessiz') {
  g.ev(`act("sahne",{id:${JSON.stringify(id)}});`);
  for(let i=0;i<15&&g.ev('UI.sahne&&!UI.jobDone');i++) {
    g.ev(`act("job-emir",{id:jobBy(UI.jobId).okulBekliyor?"cekil":(${JSON.stringify(choice)})});`);
  }
  assert.equal(g.ev('UI.jobDone'),true,'production choices finish the scene');
  g.ev('act("job-tamam",{});');
}
function day(g){g.ev('act("ilerlet",{});if(UI.modal) act("threat-yes",{});');}
function invariant(g){
  assert.equal(g.ev('S.kasa'),g.ev('S.cleanKasa+S.dirtyKasa'));
  assert.equal(g.ev('S.kasa>=0&&S.dirtyKasa>=0&&S.cleanKasa>=0'),true);
  assert.equal(g.ev('Number.isFinite(S.dosya)&&S.dosya>=0&&S.dosya<=100'),true);
}

test('accepted bundled unit suite remains green',()=>assert.deepEqual(game().win.__raconTest(),[]));
test('real plan → preparation → scene choices → pay → save; crew unavailable same day',()=>{
 const g=game(),j=plan(g); while(g.ev(`jobBy("${j.id}").prepLeft>0`)) day(g);
 const before=g.ev('S.kasa'); finish(g,j.id);
 assert.equal(g.ev(`jobBy("${j.id}").phase`),'done');assert.ok(g.ev('S.kasa')>=before);invariant(g);
 const n=g.ev('S.jobs.length');plan(g);assert.equal(g.ev('S.jobs.length'),n);
 const saved=g.ev('parseSave(localStorage.getItem(KEY))');assert.equal(saved.kasa,g.ev('S.kasa'));
 day(g);assert.ok(g.ev('S.men.some(function(m){return availableMan(m);})'));
});
test('job reservation blocks a second assignment and cancellation frees crew without reward',()=>{
 const g=game();const j=plan(g,'kepenk'),before=g.ev('S.kasa');plan(g);assert.equal(g.ev('S.jobs.length'),1);
 g.ev(`act("job-cancel",{id:"${j.id}"});act("job-cancel",{id:"${j.id}"});`);
 assert.equal(g.ev('S.jobs.length'),0);assert.equal(g.ev('S.kasa'),before);assert.equal(g.ev('S.men.every(function(m){return availableMan(m);})'),true);
});
test('injured crew cannot enter a job or appointment',()=>{
 const g=game();g.ev('S.men.forEach(function(m){m.durum="yarali";});');
 assert.match(g.ev('actionReason("planla",{})'),/müsait/);plan(g);assert.equal(g.ev('S.jobs.length'),0);
});
test('daily personal limit and Friday eligibility survive reload',()=>{
 const g=game();assert.match(g.ev('actionReason("hayat",{id:"cami"})'),/Cuma/);
 g.ev('act("hayat",{id:"kahve"});');const cash=g.ev('S.kasa');g.ev('act("hayat",{id:"kahve"});');assert.equal(g.ev('S.kasa'),cash);
 g.ev('act("hayat",{id:"hamam"});S=parseSave(localStorage.getItem(KEY));enterPlay();');
 assert.match(g.ev('actionReason("hayat",{id:"raki"})'),/iki/);invariant(g);
});
test('closed real paper choice cannot award twice',()=>{
 const g=game();g.ev('doAdvance();');const id=g.ev('S.inbox.find(function(p){return !p.kapali;}).id');
 g.ev(`act("paper-dosya",{id:"${id}"});`);const before=g.ev('JSON.stringify(S.rep)');
 g.ev(`act("paper-dosya",{id:"${id}"});`);assert.equal(g.ev('JSON.stringify(S.rep)'),before);
 assert.match(g.ev(`actionReason("paper-dosya",{id:"${id}"})`),/kapandı/);
});
test('calendar production schedule cannot be resolved early or postponed twice',()=>{
 const g=game();for(let i=0;i<8&&!g.ev('S.calendar.some(function(c){return c.strip==="randevu";})');i++)day(g);
 const c=g.ev('S.calendar.find(function(c){return c.strip==="randevu";})');assert.ok(c);
 if(g.ev('today()')<(c.week-1)*7+c.day){assert.match(g.ev(`actionReason("randevu-git",{id:"${c.id}"})`),/Tarihi/);}
 for(let i=0;i<21&&g.ev('today()')<(c.week-1)*7+c.day;i++)day(g);
 g.ev(`act("randevu-ertele",{id:"${c.id}"});`);assert.equal(g.ev(`S.calendar.find(function(c){return c.id==="${c.id}";}).postponed`),true);
 const date=g.ev(`JSON.stringify(S.calendar.find(function(c){return c.id==="${c.id}";}))`);g.ev(`act("randevu-ertele",{id:"${c.id}"});`);assert.equal(g.ev(`JSON.stringify(S.calendar.find(function(c){return c.id==="${c.id}";}))`),date);
});
test('cash normalization preserves actual total; spending consumes money exactly once',()=>{
 const g=game();g.ev('S.kasa=9000;S.cleanKasa=3000;S.dirtyKasa=90000;cashNormalize(S);');invariant(g);
 g.ev('cashChange(-7000);');assert.deepEqual(g.ev('[S.kasa,S.cleanKasa,S.dirtyKasa]'),[2000,2000,0]);
 g.ev('cashChange(800,true);cashChange(200);');invariant(g);
});
test('buy and estate rapid repeats do not double charge',()=>{
 const g=game();g.ev('cashChange(100000);');const item=g.ev('SHOP.find(function(i){return S.inventory.indexOf(i.id)<0;})');
 g.ev(`act("buy",{id:"${item.id}"});`);const cash=g.ev('S.kasa');g.ev(`act("buy",{id:"${item.id}"});`);assert.equal(g.ev('S.kasa'),cash);invariant(g);
 const house=g.ev('EMLAK[0]');g.ev(`act("estate",{id:"${house.id}"});`);const after=g.ev('S.kasa');g.ev(`act("estate",{id:"${house.id}"});`);assert.equal(g.ev('S.kasa'),after);
});
test('weighted race has negative expected return and cannot be replayed same day',()=>{
 const g=game();const odds=g.ev('ATLAR.map(function(a){return a.oran;})');assert.ok(odds.reduce((n,o)=>n+0.9/o,0)<1);
 for(const o of odds)assert.ok((0.9/o)*o<1);
 g.ev('act("at",{id:ATLAR[2].id});');const before=g.ev('[S.kasa,S.seed]');g.ev('act("at",{id:ATLAR[0].id});');assert.deepEqual(g.ev('[S.kasa,S.seed]'),before);
});
test('file-pressure consequence is retained on next recalculation',()=>{
 const g=game();g.ev('filePressure(20,"test context");');const before=g.ev('S.dosya');g.ev('recalcDosya();');assert.equal(g.ev('S.dosya'),before);assert.ok(before>0);
});
test('mid-scene save resumes the exact pending choice and deterministic result',()=>{
 const a=game(),j=plan(a);while(a.ev(`jobBy("${j.id}").prepLeft>0`))day(a);
 a.ev(`act("sahne",{id:"${j.id}"});act("job-emir",{id:"devam"});writeSave();`);
 const text=a.localStorage.getItem('racon_v1'),b=game();b.localStorage.setItem('racon_v1',text);b.ev('S=loadSave();enterPlay();');
 assert.equal(b.ev('UI.sahne'),true);assert.deepEqual(b.ev('[S.seed,UI.jobOrders,UI.jobWait]'),a.ev('[S.seed,UI.jobOrders,UI.jobWait]'));
 for(const g of [a,b]){for(let i=0;i<15&&g.ev('!UI.jobDone');i++)g.ev('act("job-emir",{id:jobBy(UI.jobId).okulBekliyor?"cekil":"sessiz"});');g.ev('act("job-tamam",{});');}
 assert.deepEqual(b.ev('[S.seed,S.kasa,S.rep,S.dosya]'),a.ev('[S.seed,S.kasa,S.rep,S.dosya]'));
});
test('malformed primary loads good backup; storage failure is visible',()=>{
 const g=game();g.ev('writeSave();writeSave();');g.localStorage.setItem('racon_v1','{"week":1,"men":[null]}');
 assert.ok(g.ev('loadSave()'));assert.match(g.ev('UI.loadErr'),/yedek/);
 g.localStorage.setItem=()=>{throw Error('quota');};assert.equal(g.ev('writeSave()'),false);assert.match(g.ev('UI.feedback'),/yazılamadı/);
});
test('empty crew remains a valid save rather than rolling back to an older life',()=>{const g=game();g.ev('S.men=[];writeSave();');assert.deepEqual(g.ev('loadSave().men'),[]);});
test('old save neutral and invalid nested arrays rejected',()=>{
 const g=game();assert.equal(g.ev('parseSave(JSON.stringify({week:1,men:canonical().men,kasa:9000})).kasa'),9000);
 for(const expr of ['x.people=[{mods:[null]}]','x.lig={fikstur:[null]}','x.flags.touchJobs=null','x.jobs=[{assigned:[null]}]'])assert.equal(g.ev(`(function(){var x=canonical();${expr};return parseSave(JSON.stringify(x));})()`),null);
});
test('terminal state blocks time, costed actions, repeat settlement and keeps save',()=>{
 const g=game();g.ev('S.flags.oyunSonu="hanedan";');const before=g.ev('[S.kasa,S.week,S.day]');g.ev('act("ilerlet",{});act("hayat",{id:"kahve"});doAdvance();');assert.deepEqual(g.ev('[S.kasa,S.week,S.day]'),before);g.ev('writeSave();');assert.equal(g.ev('parseSave(localStorage.getItem(KEY)).flags.oyunSonu'),'hanedan');
});
test('new game requires explicit replacement confirmation',()=>{
 const g=game();g.ev('act("menu",{go:"nick"});');assert.ok(g.ev('UI.modal'));g.ev('act("new-cancel",{});');assert.equal(g.ev('S.lakap'),'Kabul');
});
test('all twelve domain views render current state without invalid text; no fake locked navigation',()=>{
 const g=game();const views=g.ev('NAV.map(function(n){return n.id;})');assert.equal(views.length,12);
 for(const id of views){g.ev(`act("nav",{id:"${id}"});`);assert.equal(g.ev('S.screen'),id);assert.doesNotMatch(g.document.getElementById('stage').innerHTML,/undefined|NaN|\[object Object\]/);}
 assert.doesNotMatch(g.document.getElementById('nav').innerHTML,/navbtn lock/);
});

test('completed work creates fatigue at the real daily transition',()=>{const g=game();const j=plan(g);finish(g,j.id);const before=g.ev('S.men[0].yorgunluk');day(g);assert.ok(g.ev('S.men[0].yorgunluk')>before);});
