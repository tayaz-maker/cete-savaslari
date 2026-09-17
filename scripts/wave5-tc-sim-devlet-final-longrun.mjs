import assert from "node:assert/strict";
import { hydrateDevlet, applyPolicy, tickDevlet, finiteState } from "../public/games/next-wave/devlet-sim.js";
import { previewPolicy } from "../public/games/next-wave/devlet-depth.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";

const strategies = ["do-nothing", "competent-low", "growth", "fiscal", "social", "institution", "security", "market", "state", "rural", "urban", "balanced", "adaptive", "opportunistic", "random", "repeat-one", "reversal", "stimulus-spam", "austerity-spam", "active-high"];
const checkpoints = new Set([60, 120, 300, 600, 900, 1284]);
const axes = ["economy", "institutions", "groups", "confidence", "cohesion", "resilience", "development", "external"];

function score(policy, state, strategy, month) {
  const id = policy.id;
  if (strategy === "growth") return /credit|ihracat|export|region|infra|egitim|univ|housing|konut/.test(id) ? 40 : policy.cost;
  if (["fiscal", "austerity-spam"].includes(strategy)) return /imf|budget|vergi|tax-admin|audit|pension|public-admin/.test(id) ? 45 : -policy.cost - policy.inflation;
  if (["social", "stimulus-spam"].includes(strategy)) return /social|health|pension|housing|konut|relief|koy|agri|tarim/.test(id) ? 45 : policy.cost;
  if (strategy === "institution") return /admin|audit|judicial|yargi|bilgi|stat|kanun|brief/.test(id) ? 45 : 0;
  if (strategy === "security") return /security|guvenlik|defense|ordu|goc|border/.test(id) ? 45 : 0;
  if (strategy === "market") return /market|ihracat|export|credit|ticaret|bank|faiz|customs/.test(id) ? 45 : 0;
  if (strategy === "state") return /kamu|plan|merkez|vergi|sanayi|public/.test(id) ? 45 : 0;
  if (strategy === "rural") return /agri|koy|tarim|region|water/.test(id) ? 45 : 0;
  if (strategy === "urban") return /konut|housing|belediye|health|egitim|water/.test(id) ? 45 : 0;
  if (strategy === "adaptive") return state.actual.inflation > 18 ? -policy.inflation * 6 : state.devletDepth.macro.publicDebt > 90 ? -policy.cost * 2 : state.actual.unemployment > 13 ? policy.cost : 10 - policy.cost;
  if (strategy === "opportunistic") return previewPolicy(state, policy).rate - policy.cost * .6;
  if (strategy === "random") return ((month * 1103515245 + id.length * 12345 + state.meta.seed) >>> 0) % 997;
  return 8 - Math.abs(policy.cost - 6);
}

function choose(state, strategy, month) {
  const pool = POLICIES[state.eraId] || POLICIES["2002"];
  if (strategy === "do-nothing") return null;
  if (strategy === "repeat-one") return pool[0];
  if (strategy === "reversal") return pool[month % Math.min(2, pool.length)];
  if (strategy === "competent-low") return pool.map(p => [p, previewPolicy(state, p)]).filter(([, v]) => v.cooldown === 0).sort((a, b) => b[1].rate - a[1].rate)[0]?.[0];
  return pool.slice().sort((a, b) => score(b, state, strategy, month) - score(a, state, strategy, month))[0];
}

const rows = [], crisisCounts = Object.fromEntries(["inflation", "recession", "financial", "migration", "institutional", "trust", "external"].map(id => [id, 0]));
for (let seedIndex = 0; seedIndex < 6; seedIndex++) for (const strategy of strategies) {
  const state = hydrateDevlet("1923", { campaign: true, seed: 15000 + seedIndex }), seenCrises = new Set(), snapshots = [];
  for (let month = 0; month < 1300 && !state.flags.campaignEnd; month++) {
    const spam = ["repeat-one", "reversal", "stimulus-spam", "austerity-spam", "active-high"].includes(strategy);
    const cadence = strategy === "competent-low" ? 4 : 3;
    if (spam || month % cadence === seedIndex % cadence) {
      const policy = choose(state, strategy, month); if (policy) applyPolicy(state, policy.id);
      if (strategy === "active-high") { const second = choose(state, "random", month + 71); if (second) applyPolicy(state, second.id); }
    }
    tickDevlet(state); assert.ok(finiteState(state), `${strategy}/${seedIndex} non-finite`);
    for (const crisis of [...state.devletDepth.crises.active, ...state.devletDepth.crises.history]) if (!seenCrises.has(crisis.id)) { seenCrises.add(crisis.id); crisisCounts[crisis.family]++; }
    if (checkpoints.has(month + 1)) snapshots.push({ turn: month + 1, entropy: state.entropy, debt: state.devletDepth.macro.publicDebt, size: JSON.stringify(state).length });
  }
  const d = state.devletDepth, groups = d.groups.reduce((sum, group) => sum + group.satisfaction, 0) / d.groups.length;
  const vector = { economy: d.outcome.economy, institutions: d.outcome.institutions, groups, confidence: d.confidence.expectations, cohesion: d.outcome.cohesion, resilience: d.outcome.resilience, development: d.outcome.development, external: d.outcome.external };
  rows.push({ strategy, vector, entropy: state.entropy, debt: d.macro.publicDebt, inflation: state.actual.inflation, unemployment: state.actual.unemployment, form: state.form, size: JSON.stringify(state).length, crisisFamilies: new Set([...d.crises.history, ...d.crises.active].map(c => c.family)).size, regionUrbanSpread: Math.max(...state.regions.map(r => r.urbanization)) - Math.min(...state.regions.map(r => r.urbanization)), snapshots });
}

const average = (strategy, key) => { const list = rows.filter(r => r.strategy === strategy); return list.reduce((sum, row) => sum + row.vector[key], 0) / list.length; };
const vectors = Object.fromEntries(strategies.map(strategy => [strategy, Object.fromEntries(axes.map(axis => [axis, average(strategy, axis)]))]));
const dominates = (a, b) => axes.every(axis => vectors[a][axis] >= vectors[b][axis]) && axes.some(axis => vectors[a][axis] > vectors[b][axis]);
const domination = Object.fromEntries(strategies.map(a => [a, strategies.filter(b => a !== b && dominates(a, b)).length]));
const max = key => Math.max(...rows.map(row => row[key]));
const min = key => Math.min(...rows.map(row => row[key]));

assert.equal(rows.length, 120);
assert.deepEqual(Object.keys(crisisCounts).filter(family => crisisCounts[family] === 0), [], `natural crisis families missing: ${JSON.stringify(crisisCounts)}`);
assert.ok(max("size") < 300_000);
assert.ok(min("regionUrbanSpread") > .5, "regions converged to functional identity");
assert.ok(domination["do-nothing"] < strategies.length / 3, "do-nothing remains general optimum");
assert.ok(domination["institution"] < strategies.length - 1, "institution-first became universal optimum");
assert.ok(domination["competent-low"] < strategies.length - 1, "low cadence became universal optimum");
assert.ok(Math.max(...Object.values(domination)) < strategies.length - 1, "one route dominates every alternative on all eight axes");
assert.ok(vectors["competent-low"].institutions > vectors.reversal.institutions);
assert.ok(rows.filter(r => r.strategy === "competent-low").reduce((s, r) => s + r.entropy, 0) < rows.filter(r => r.strategy === "reversal").reduce((s, r) => s + r.entropy, 0));

console.log("WAVE5_FINAL_LONGRUN", JSON.stringify({ campaigns: rows.length, months: 1284, crisisCounts, domination, ranges: { entropy: [min("entropy"), max("entropy")], debt: [min("debt"), max("debt")], inflation: [min("inflation"), max("inflation")], unemployment: [min("unemployment"), max("unemployment")], size: [min("size"), max("size")], regionUrbanSpread: [min("regionUrbanSpread"), max("regionUrbanSpread")] }, forms: Object.fromEntries([...new Set(rows.map(r => r.form))].map(form => [form, rows.filter(r => r.form === form).length])), checkpoints: rows[0].snapshots }));
