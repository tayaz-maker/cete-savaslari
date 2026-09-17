import assert from "node:assert/strict";
import { hydrateDevlet, applyPolicy, tickDevlet, finiteState } from "../public/games/next-wave/devlet-sim.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";

const strategies = ["do-nothing", "growth", "fiscal", "social", "institution", "security", "market", "state", "rural", "urban", "balanced", "opportunistic", "adaptive", "random", "repeat-one", "reversal", "stimulus-spam", "austerity-spam"];
const activeCompetent = new Set(["growth", "fiscal", "social", "institution", "market", "state", "rural", "urban", "balanced", "opportunistic", "adaptive"]);
const score = (p, s, strategy, turn) => {
  const id = p.id;
  if (strategy === "growth") return /credit|ihracat|export|region|infra|egitim|univ|housing|konut/.test(id) ? 30 : p.cost;
  if (strategy === "fiscal" || strategy === "austerity-spam") return /imf|budget|vergi|tax-admin|audit|pension|public-admin/.test(id) ? 35 : -p.cost - p.inflation;
  if (strategy === "social" || strategy === "stimulus-spam") return /social|health|pension|housing|konut|relief|koy|agri|tarim/.test(id) ? 35 : p.cost;
  if (strategy === "institution") return /admin|audit|judicial|yargi|bilgi|stat|kanun|brief/.test(id) ? 35 : 0;
  if (strategy === "security") return /security|guvenlik|defense|ordu|goc|border/.test(id) ? 35 : 0;
  if (strategy === "market") return /market|ihracat|export|credit|ticaret|bank|faiz|customs/.test(id) ? 35 : 0;
  if (strategy === "state") return /kamu|plan|merkez|vergi|sanayi|public/.test(id) ? 35 : 0;
  if (strategy === "rural") return /agri|koy|tarim|region|water/.test(id) ? 35 : 0;
  if (strategy === "urban") return /konut|housing|belediye|health|egitim|water/.test(id) ? 35 : 0;
  if (strategy === "opportunistic") return p.cost <= s.actual.treasury / 12 ? 12 - p.cost : -30;
  if (strategy === "adaptive") return s.actual.inflation > 18 ? -p.inflation * 5 : s.devletDepth.macro.publicDebt > 85 ? -p.cost * 2 : s.actual.unemployment > 13 ? p.cost : 8 - p.cost;
  if (strategy === "random") return ((turn * 1103515245 + id.length * 12345 + s.meta.seed) >>> 0) % 97;
  return 7 - Math.abs(p.cost - 6);
};
function choose(s, strategy, turn) {
  if (strategy === "do-nothing") return null;
  const pool = POLICIES[s.eraId] || POLICIES["2002"];
  if (strategy === "repeat-one") return pool[0];
  if (strategy === "reversal") return pool[turn % Math.min(2, pool.length)];
  return pool.slice().sort((a, b) => score(b, s, strategy, turn) - score(a, s, strategy, turn))[0];
}

const rows = [], checkpoints = [60, 120, 300, 600, 900, 1284];
for (let run = 0; run < 72; run++) {
  const strategy = strategies[run % strategies.length];
  const s = hydrateDevlet("1923", { campaign: true, seed: 5100 + run }), snapshots = [];
  for (let month = 0; month < 1300 && !s.flags.campaignEnd; month++) {
    const spam = strategy.endsWith("spam") || strategy === "repeat-one" || strategy === "reversal";
    if (spam || month % 3 === run % 3) { const p = choose(s, strategy, month); if (p) applyPolicy(s, p.id); }
    tickDevlet(s); assert.ok(finiteState(s));
    if (checkpoints.includes(month + 1)) snapshots.push({ turn: month + 1, debt: s.devletDepth.macro.publicDebt, entropy: s.entropy, urban: s.devletDepth.demography.urbanization, fragmentation: s.devletDepth.media.fragmentation, size: JSON.stringify(s).length });
  }
  const d = s.devletDepth, institution = d.outcome.institutions, groupMood = d.groups.reduce((a, g) => a + g.satisfaction, 0) / d.groups.length;
  const composite = d.outcome.economy + institution + groupMood + d.confidence.expectations + d.outcome.cohesion + d.outcome.resilience + d.outcome.development + d.outcome.external;
  rows.push({ strategy, inflation:s.actual.inflation, unemployment:s.actual.unemployment, debt:d.macro.publicDebt, growth:d.macro.realGrowth, tax:d.macro.taxBurden, spending:d.macro.publicSpending, confidence:d.confidence.expectations, institution, implementation:d.outcome.institutions, entropy:s.entropy, network:s.networks.reduce((a,n)=>a+n.pressure,0)/s.networks.length, groupMood, urban:d.demography.urbanization, migration:d.demography.internalMigration, fragmentation:d.media.fragmentation, crises:d.crises.history.length, form:d.forms.dominant, policies:new Set(d.policy.history.map(x=>x.id)).size, cadreMemory:d.cadres.reduce((a,c)=>a+c.memory.length,0), size:JSON.stringify(s).length, composite, snapshots });
}
const max = key => Math.max(...rows.map(r => r[key])), min = key => Math.min(...rows.map(r => r[key])), avg = list => list.reduce((a,b)=>a+b,0)/list.length;
for (const key of ["inflation","unemployment","debt","growth","tax","spending","confidence","institution","implementation","entropy","network","groupMood","urban","migration","fragmentation","size"]) assert.ok(Number.isFinite(max(key)) && Number.isFinite(min(key)), key);
assert.ok(max("size") < 300_000); assert.ok(min("implementation") >= 0); assert.ok(min("urban") > 7 && max("urban") < 95); assert.ok(min("tax") < max("tax") && min("spending") < max("spending")); assert.ok(max("cadreMemory") > 0);
const doNothing = rows.filter(r=>r.strategy==="do-nothing"), competent = rows.filter(r=>activeCompetent.has(r.strategy));
console.log("WAVE5_CORE_COMPARE", { doNothing: avg(doNothing.map(r=>r.composite)), active: avg(competent.map(r=>r.composite)), byStrategy: Object.fromEntries(strategies.map(name=>[name,Math.round(avg(rows.filter(r=>r.strategy===name).map(r=>r.composite))*10)/10])) });
assert.ok(avg(competent.map(r=>r.composite)) > avg(doNothing.map(r=>r.composite)) * .9, "active competent play remains systematically dominated");
assert.ok(strategies.filter(name=>name!=="do-nothing" && avg(rows.filter(r=>r.strategy===name).map(r=>r.composite)) > avg(doNothing.map(r=>r.composite))).length >= 3, "do-nothing remains the general optimum");
const winners = ["growth","confidence","institution","groupMood"].map(key=>rows.filter(r=>r.strategy!=="random").sort((a,b)=>b[key]-a[key])[0].strategy); assert.ok(new Set(winners).size>=2);
console.log("WAVE5_CORE_LONGRUN", JSON.stringify({runs:rows.length,ranges:Object.fromEntries(["inflation","unemployment","debt","growth","tax","spending","confidence","institution","entropy","network","groupMood","urban","migration","fragmentation","crises","policies","cadreMemory","size"].map(k=>[k,[Math.round(min(k)*10)/10,Math.round(max(k)*10)/10]])),forms:Object.fromEntries([...new Set(rows.map(r=>r.form))].map(f=>[f,rows.filter(r=>r.form===f).length])),doNothing:Math.round(avg(doNothing.map(r=>r.composite))*10)/10,active:Math.round(avg(competent.map(r=>r.composite))*10)/10,winners:[...new Set(winners)],checkpoints:rows[0].snapshots}));
