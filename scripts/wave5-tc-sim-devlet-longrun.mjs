import assert from "node:assert/strict";
import { hydrateDevlet, applyPolicy, tickDevlet, finiteState } from "../public/games/next-wave/devlet-sim.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";

const eras = ["1923", "1950", "1980", "2002", "gunumuz", "alternatif"];
const strategies = ["growth-max", "fiscal-conservative", "social-heavy", "institution-first", "security-first", "market-heavy", "state-heavy", "rural-heavy", "urban-heavy", "balanced", "opportunistic", "adaptive", "random"];
const score = (p, state, strategy, turn) => {
  const id = p.id;
  if (strategy === "growth-max") return p.cost + (p.inflation >= 0 ? 3 : 0);
  if (strategy === "fiscal-conservative") return -p.cost - p.inflation * 2;
  if (strategy === "social-heavy") return /social|health|pension|housing|relief|koy/.test(id) ? 20 : 0;
  if (strategy === "institution-first") return /admin|audit|judicial|yargi|bilgi|stat|kanun/.test(id) ? 20 : 0;
  if (strategy === "security-first") return /security|guvenlik|defense|ordu|goc/.test(id) ? 20 : 0;
  if (strategy === "market-heavy") return /market|ihracat|credit|ticaret|bank|faiz/.test(id) ? 20 : 0;
  if (strategy === "state-heavy") return /kamu|plan|merkez|vergi|sanayi/.test(id) ? 20 : 0;
  if (strategy === "rural-heavy") return /agri|koy|tarim|region|water/.test(id) ? 20 : 0;
  if (strategy === "urban-heavy") return /konut|housing|belediye|health|egitim/.test(id) ? 20 : 0;
  if (strategy === "opportunistic") return p.cost <= state.actual.treasury / 12 ? 8 - p.cost : -20;
  if (strategy === "adaptive") return state.actual.inflation > 30 ? -p.inflation * 4 : state.actual.unemployment > 14 ? p.cost : 5 - p.cost;
  if (strategy === "random") return ((turn * 1103515245 + id.length * 12345) >>> 0) % 97;
  return 5 - Math.abs(p.cost - 6);
};

const rows = [];
for (let run = 0; run < 42; run++) {
  const era = eras[run % eras.length], strategy = strategies[run % strategies.length];
  const s = hydrateDevlet(era, { seed: 1000 + run });
  for (let month = 0; month < 96 && !s.flags.campaignEnd; month++) {
    const pool = (POLICIES[s.eraId] || POLICIES["2002"]).slice().sort((a, b) => score(b, s, strategy, month) - score(a, s, strategy, month));
    for (const p of pool) { const before = s.flags.decisionsRemaining; applyPolicy(s, p.id); if (s.flags.decisionsRemaining < before) break; }
    tickDevlet(s); assert.ok(finiteState(s));
  }
  const d = s.devletDepth;
  rows.push({ run, era, strategy, inflation: s.actual.inflation, unemployment: s.actual.unemployment, debt: d.macro.publicDebt, growth: d.macro.realGrowth, confidence: d.confidence.expectations, institution: d.outcome.institutions, groupMood: d.groups.reduce((a, g) => a + g.satisfaction, 0) / d.groups.length, crises: d.crises.history.length, form: d.forms.dominant, policies: new Set(d.policy.history.map(x => x.id)).size, size: JSON.stringify(s).length, outcome: d.outcome });
}
const max = (key) => Math.max(...rows.map(r => r[key])), min = key => Math.min(...rows.map(r => r[key]));
for (const key of ["inflation", "unemployment", "debt", "growth", "confidence", "institution", "groupMood", "size"]) assert.ok(Number.isFinite(max(key)) && Number.isFinite(min(key)), key);
assert.ok(max("size") < 260_000);
assert.ok(new Set(rows.map(r => r.form)).size >= 3);
assert.ok(new Set(rows.map(r => JSON.stringify(Object.values(r.outcome).map(Math.round)))).size >= 10);
const dimensions = ["growth", "confidence", "institution", "groupMood"], winners = new Set(dimensions.map(key => rows.slice().sort((a, b) => b[key] - a[key])[0].strategy));
assert.ok(winners.size >= 2, "one strategy won every positive dimension");
console.log("WAVE5_LONGRUN", JSON.stringify({ runs: rows.length, ranges: Object.fromEntries(["inflation", "unemployment", "debt", "growth", "confidence", "institution", "groupMood", "crises", "policies", "size"].map(k => [k, [Math.round(min(k) * 10) / 10, Math.round(max(k) * 10) / 10]])), forms: Object.fromEntries([...new Set(rows.map(r => r.form))].map(f => [f, rows.filter(r => r.form === f).length])), winners: [...winners], outcomes: new Set(rows.map(r => JSON.stringify(Object.values(r.outcome).map(Math.round)))).size }));
