import test from "node:test";
import assert from "node:assert/strict";
import {create,applyAction,normalize} from "../public/games/next-wave.js";
import {LIFE_ACTIONS,PEOPLE,lifeReason} from "../public/games/next-wave/hayat-life.js";
const copy=s=>JSON.parse(JSON.stringify(s));
test("everyday actions use two persisted rights; duplicates, ghost IDs, stale turns and insufficient funds are atomic",()=>{
 const s=create("hayat");applyAction("hayat",s,"act:work@1");const cash=s.resources.money;
 applyAction("hayat",s,"act:work@1");assert.equal(s.resources.money,cash);
 const loaded=normalize("hayat",copy(s));applyAction("hayat",loaded,"act:rest@1");const full=copy(loaded);
 applyAction("hayat",loaded,"act:friend@1");assert.deepEqual(loaded,full);
 applyAction("hayat",loaded,"advance@1");const next=copy(loaded);
 applyAction("hayat",loaded,"advance@1");applyAction("hayat",loaded,"act:work@1");assert.deepEqual(loaded,next);
 applyAction("hayat",loaded,"act:ghost");assert.deepEqual(loaded,next);
 loaded.resources.money=0;const poor=copy(loaded);applyAction("hayat",loaded,"act:doctor");assert.deepEqual(loaded,poor);
});
test("education, book ownership, jobs, housing, savings, relationships and named memories have real consequences",()=>{
 const s=create("hayat"),act=id=>applyAction("hayat",s,`act:${id}`),next=()=>applyAction("hayat",s,"advance");
 act("book");act("course");next();act("study");assert.equal(s.life.course.progress,2);next();act("study");assert.equal(s.life.skill,3);act("search");assert.equal(s.life.job,"qualified");
 s.resources.money=5000;next();act("view-home");act("move");assert.equal(s.life.home,"shared");next();act("save");assert.equal(s.life.savings,200);act("withdraw");assert.equal(s.life.savings,0);
 next();act("date");assert.ok(s.life.people.find(p=>p.id==="ece").memory.length);s.life.people.find(p=>p.id==="ece").value=80;act("commit");next();act("marry");assert.equal(s.life.married,true);
 assert.equal(PEOPLE.length,10);assert.ok(LIFE_ACTIONS.length>=25);
});
test("major events are secondary, consume capacity, retain Long Shadow and cannot resolve twice",()=>{
 const s=create("hayat");applyAction("hayat",s,"act:work");applyAction("hayat",s,"choose:ambition");assert.equal(s.life.used.length,2);assert.equal(s.shadows.length,1);
 applyAction("hayat",s,"choose:give");assert.equal(s.decisionsLog.length,1);
 applyAction("hayat",s,"advance");applyAction("hayat",s,"choose:ambition");assert.equal(s.decisionsLog.length,1);
 for(let i=0;i<16;i++)applyAction("hayat",s,"advance");assert.equal(s.history.filter(r=>r.type==="shadow-callback").length,1);
});
test("legacy upgrade keeps decisions, shadows, money and age; corrupt models are rejected",()=>{
 const s=create("hayat");applyAction("hayat",s,"major-choice");delete s.life;s.playerName="Legacy";
 const n=normalize("hayat",copy(s));assert.equal(n.age,s.age);assert.equal(n.resources.money,s.resources.money);assert.deepEqual(n.shadows,s.shadows);
 const bad=copy(n);bad.life.people[0].id="ghost";assert.equal(normalize("hayat",bad),null);
 const bad2=copy(n);bad2.resources.energy=null;assert.equal(normalize("hayat",bad2),null);
 const other=normalize("hayat",copy(n));other.life.people[0].value=0;assert.notEqual(n.life.people[0].value,0);
});
test("18 to 36 deterministic life stays finite, bounded and serializable with no mandatory major deadlock",()=>{
 const s=create("hayat");for(let i=0;i<100;i++){
  for(const id of ["work","rest"]){if(!lifeReason(s,id))applyAction("hayat",s,`act:${id}`);}
  applyAction("hayat",s,`advance@${s.turn}`);assert.ok(normalize("hayat",copy(s)));assert.ok(s.resources.money>=0);assert.ok(s.resources.energy>=0&&s.resources.energy<=100);
 }
 assert.equal(s.age,36);const before=copy(s);applyAction("hayat",s,"advance");assert.deepEqual(s,before);assert.ok(JSON.stringify(s).length<50000);
});
