import test from "node:test";
import assert from "node:assert/strict";
import { hydrateDevlet, applyPolicy, tickDevlet, previewPolicy, finiteState } from "../public/games/next-wave/devlet-sim.js";
import { policyMetadata, DEVLET_BOUNDS } from "../public/games/next-wave/devlet-depth.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";

const clone = value => JSON.parse(JSON.stringify(value));
const tick = (s, n) => { for (let i=0;i<n && !s.flags.campaignEnd;i++) tickDevlet(s); return s; };

test("fiscal policies move live tax/spending levers and produce recoverable debt divergence", () => {
  const tax = hydrateDevlet("2002", {seed:11}), transfer = hydrateDevlet("2002", {seed:11});
  const taxStart = tax.devletDepth.macro.taxBurden, spendStart = tax.devletDepth.macro.publicSpending;
  applyPolicy(tax, "tax-admin"); applyPolicy(transfer, "social-relief"); tick(tax,18); tick(transfer,18);
  assert.ok(tax.devletDepth.macro.taxBurden > taxStart);
  assert.ok(transfer.devletDepth.macro.publicSpending > spendStart);
  assert.ok(tax.devletDepth.macro.publicDebt < transfer.devletDepth.macro.publicDebt);
});

test("competent active governance avoids entropy punishment while reversal/spam pays", () => {
  const competent=hydrateDevlet("2002",{seed:22}), reversal=hydrateDevlet("2002",{seed:22});
  for(let i=0;i<72;i++){
    if(i%6===0) applyPolicy(competent,i%12===0?"public-admin":"stat-independence");
    applyPolicy(reversal,i%2?"social-relief":"imf-sba");
    tickDevlet(competent); tickDevlet(reversal);
  }
  assert.ok(competent.entropy < reversal.entropy);
  assert.ok(competent.devletDepth.outcome.institutions >= 0);
});

function formFixture(name){
  const s=hydrateDevlet("gunumuz",{seed:31});
  Object.assign(s.dna,{security:0,institutionalism:0,centralization:0,market:0,paternalism:0});
  Object.assign(s.devletDepth.confidence,{business:0,institutional:80,household:50});
  Object.assign(s.devletDepth.government,{mandate:20,publicSupport:20});
  Object.assign(s.devletDepth.macro,{investment:10,publicSpending:25});
  Object.assign(s.devletDepth.media.salience,{security:0,economy:0}); s.entropy=0; s.heat=20;
  for(const i of s.institutions) Object.assign(i,{capacity:50,autonomy:50,professionalism:70});
  for(const n of s.networks) n.pressure=0;
  if(name==="Kışla-Devlet"){s.dna.security=100;const i=s.institutions.find(x=>x.id==="ordu");Object.assign(i,{autonomy:100,capacity:100});s.devletDepth.media.salience.security=100;}
  if(name==="Bürokrasi-Devlet"){s.dna.institutionalism=100;for(const i of s.institutions)Object.assign(i,{capacity:100,autonomy:100,professionalism:100});}
  if(name==="Parti-Devlet"){s.dna.centralization=100;s.devletDepth.government.mandate=100;for(const i of s.institutions)i.autonomy=0;}
  if(name==="Sermaye-Devlet"){s.dna.market=100;s.devletDepth.confidence.business=100;s.devletDepth.macro.investment=100;}
  if(name==="Cemaat-Devlet"){s.dna.paternalism=100;for(const n of s.networks)n.pressure=100;for(const i of s.institutions)i.professionalism=0;}
  if(name==="Popülist-Devlet"){s.dna.paternalism=100;s.devletDepth.government.publicSupport=100;s.devletDepth.macro.publicSpending=90;s.devletDepth.media.salience.economy=100;s.devletDepth.confidence.institutional=0;}
  if(name==="Boş Kabuk"){s.entropy=100;s.devletDepth.confidence.institutional=0;for(const i of s.institutions)Object.assign(i,{capacity:0,professionalism:0});}
  tickDevlet(s); return s;
}

test("all seven state forms are mathematically and fixture reachable",()=>{
  const forms=["Kışla-Devlet","Bürokrasi-Devlet","Parti-Devlet","Sermaye-Devlet","Cemaat-Devlet","Popülist-Devlet","Boş Kabuk"];
  for(const form of forms) assert.equal(formFixture(form).form,form,form);
});

test("cadre stats affect delivery and appointment lifecycle writes bounded memory",()=>{
  const p=POLICIES["2002"].find(x=>x.id==="cadre-maliye"), high=hydrateDevlet("2002",{seed:45}), low=clone(high);
  Object.assign(high.devletDepth.cadres.find(c=>c.institution==="maliye"),{competence:95,professionalism:95,management:95,expertise:95,reliability:95,networkRisk:5});
  Object.assign(low.devletDepth.cadres.find(c=>c.institution==="maliye"),{competence:10,professionalism:10,management:10,expertise:10,reliability:10,networkRisk:95});
  assert.ok(previewPolicy(high,p).rate>previewPolicy(low,p).rate+15);
  applyPolicy(high,p.id); high.grand.endYear=2100; tick(high,49);
  const memories=high.devletDepth.cadres.flatMap(c=>c.memory);
  assert.ok(memories.some(m=>m.type==="reappointment")); assert.ok(memories.some(m=>m.type==="removed")); assert.ok(memories.some(m=>m.type==="appointed"));
  assert.ok(high.devletDepth.cadres.every(c=>c.memory.length<=DEVLET_BOUNDS.actorMemory));
});

test("active crises exert bounded ongoing family effects and resilience matters",()=>{
  const base=hydrateDevlet("2002",{seed:66}); base.time.turn=2;
  const none=clone(base), low=clone(base), high=clone(base);
  low.devletDepth.crises.active=[{id:"financial-x",family:"financial",startTurn:1,severity:60,status:"active"}];
  high.devletDepth.crises.active=clone(low.devletDepth.crises.active);
  Object.assign(low.devletDepth.macro,{publicDebt:120,reserves:5}); for(const i of low.institutions)Object.assign(i,{capacity:15,professionalism:15});
  Object.assign(high.devletDepth.macro,{publicDebt:20,reserves:95}); for(const i of high.institutions)Object.assign(i,{capacity:90,professionalism:90});
  tickDevlet(none); tickDevlet(low); tickDevlet(high);
  assert.notEqual(low.devletDepth.macro.investment,none.devletDepth.macro.investment);
  assert.ok(high.devletDepth.crises.resilience>low.devletDepth.crises.resilience);
  assert.ok(low.devletDepth.crises.active[0].ticks===1);
});

test("urbanization uses live jobs/services/infrastructure without zero or hundred attraction",()=>{
  const urban=hydrateDevlet("1923",{campaign:true,seed:71}), rural=clone(urban);
  for(const r of urban.regions)Object.assign(r,{activity:80,services:80,infrastructure:85,unemployment:4});
  for(const r of rural.regions)Object.assign(r,{activity:38,services:38,infrastructure:35,unemployment:20});
  tick(urban,240);tick(rural,240);
  assert.ok(urban.devletDepth.demography.urbanization>rural.devletDepth.demography.urbanization);
  assert.ok(urban.devletDepth.demography.urbanization<95&&rural.devletDepth.demography.urbanization>7);
});

test("government turnover reseeds government fields while preserving state memory",()=>{
  const s=hydrateDevlet("gunumuz",{seed:91}), before=clone(s.devletDepth.government); s.grand.endYear=2100; applyPolicy(s,POLICIES.gunumuz[0].id); tick(s,48);
  const after=s.devletDepth.government;
  assert.notEqual(after.id,before.id); assert.notEqual(after.preference,before.preference); assert.equal(after.crisisPerformance,50); assert.notEqual(after.publicSupport,before.publicSupport);
  assert.ok(s.devletDepth.policy.history.length); assert.ok(after.memory.some(m=>m.type==="government-change"));
});

test("development and intelligence branches have meaningful existing policy paths",()=>{
  const all=Object.values(POLICIES).flat(), metadata=all.map(p=>[p,policyMetadata(p)]);
  assert.ok(metadata.some(([,m])=>m.domain==="development"));
  assert.ok(metadata.some(([,m])=>m.institution==="istikhbarat"));
});

test("contextual directional inflation preview substantially matches one-turn outcomes",()=>{
  let compared=0,mismatch=0;
  for(const [era,pool] of Object.entries(POLICIES)) for(const p of pool){
    const s=hydrateDevlet(era,{seed:101}), direction=previewPolicy(s,p).expected.inflationDirection, before=s.actual.inflation;
    applyPolicy(s,p.id);tickDevlet(s);const delta=s.actual.inflation-before;
    if(direction==="neutral"||Math.abs(delta)<.12)continue;compared++;if((direction==="up"&&delta<0)||(direction==="down"&&delta>0))mismatch++;
  }
  assert.ok(compared>20); assert.ok(mismatch/compared<.05,`${mismatch}/${compared}`);
});

test("media fragmentation can recover and does not stick to maximum",()=>{
  const s=hydrateDevlet("2002",{seed:121});s.devletDepth.media.fragmentation=100;s.devletDepth.media.trust=85;s.heat=20;s.devletDepth.government.publicSupport=70;s.devletDepth.crises.active=[];
  tick(s,24); assert.ok(s.devletDepth.media.fragmentation<90); assert.ok(finiteState(s));
});
