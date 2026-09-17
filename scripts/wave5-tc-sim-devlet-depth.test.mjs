import test from "node:test";
import assert from "node:assert/strict";
import { create, normalize, POLICIES, finiteState } from "../public/games/next-wave.js";
import { hydrateDevlet, tickDevlet, applyPolicy, previewPolicy } from "../public/games/next-wave/devlet-sim.js";
import { DEVLET_BOUNDS, validateDevletDepth } from "../public/games/next-wave/devlet-depth.js";

const clone = value => JSON.parse(JSON.stringify(value));
const eraIds = ["1923", "1950", "1980", "2002", "gunumuz", "alternatif"];

test("Wave 5 creates the causal economy, society, institution and government layers", () => {
  const s = create("tc-sim-devlet"), d = s.devletDepth;
  assert.equal(s.meta.version, 2);
  assert.ok(validateDevletDepth(s));
  for (const key of ["realGrowth", "nominalGrowth", "interestRate", "budgetBalance", "publicDebt", "investment", "purchasingPower", "reserves", "externalPressure", "inequality", "taxBurden", "publicSpending"]) assert.ok(Number.isFinite(d.macro[key]), key);
  assert.deepEqual(Object.keys(d.confidence).sort(), ["business", "expectations", "household", "institutional"]);
  assert.equal(d.groups.length, 10);
  assert.ok(s.institutions.every(i => ["professionalism", "trust", "budget", "leadership", "fatigue", "alignment"].every(k => Number.isFinite(i[k]))));
  assert.ok(d.government.id && d.cadres.length >= 7 && d.demography.populationIndex && d.media.salience && d.world.globalGrowth);
});

test("all six period presets are mechanically distinct, finite and deterministic", () => {
  const signatures = new Set();
  for (const era of eraIds) {
    const a = hydrateDevlet(era, { seed: 9182 }), b = hydrateDevlet(era, { seed: 9182 });
    assert.deepEqual(a, b);
    signatures.add(JSON.stringify([a.devletDepth.macro, a.devletDepth.demography, a.devletDepth.world, a.devletDepth.government.name, a.institutions.map(i => i.capacity)]));
    for (let i = 0; i < 18; i++) { tickDevlet(a); tickDevlet(b); }
    assert.deepEqual(a, b, era);
    assert.ok(finiteState(a));
  }
  assert.equal(signatures.size, eraIds.length);
});

test("policy preview exposes horizons, groups, institution demand, cost and contextual risk", () => {
  const s = hydrateDevlet("2002"), p = POLICIES["2002"].find(x => x.id === "social-relief"), view = previewPolicy(s, p);
  assert.ok(view.domain && view.institution && view.risk && view.reversibility);
  assert.ok(view.affectedGroups.length >= 3);
  assert.ok(view.horizons.short && view.horizons.medium && view.horizons.long);
  assert.ok(Number.isFinite(view.fiscalCost) && Number.isFinite(view.rate));
});

test("policy effects resolve once before/on/after due and survive repeated reload", () => {
  const s = hydrateDevlet("2002"), p = POLICIES["2002"][0];
  applyPolicy(s, p.id);
  assert.equal(s.devletDepth.policy.pending.length, 3);
  const before = normalize("tc-sim-devlet", clone(s));
  tickDevlet(before);
  const onDue = normalize("tc-sim-devlet", clone(before));
  assert.equal(onDue.devletDepth.policy.resolved.filter(x => x.source === p.id && x.horizon === "short").length, 1);
  tickDevlet(onDue); const snapshot = clone(onDue.devletDepth.policy.resolved);
  const after = normalize("tc-sim-devlet", clone(onDue)); tickDevlet(after);
  assert.equal(after.devletDepth.policy.resolved.filter(x => x.source === p.id && x.horizon === "short").length, 1);
  assert.deepEqual(normalize("tc-sim-devlet", clone(after)).devletDepth.policy.resolved, after.devletDepth.policy.resolved);
  assert.ok(snapshot.length <= after.devletDepth.policy.resolved.length);
});

test("same-month duplicate is blocked while later repetition creates cooldown/diminishing returns", () => {
  const s = hydrateDevlet("2002"), p = POLICIES["2002"][0];
  applyPolicy(s, p.id); const pending = s.devletDepth.policy.pending.length;
  applyPolicy(s, p.id);
  assert.equal(s.devletDepth.policy.pending.length, pending);
  assert.equal(previewPolicy(s, p).cooldown, 4);
  tickDevlet(s);
  applyPolicy(s, p.id);
  assert.equal(s.devletDepth.policy.counts[p.id], 2);
  assert.ok(s.devletDepth.policy.pending.some(x => x.source === p.id && x.repeatFactor < 1));
});

test("institution quality materially changes implementation and fatigue recovers", () => {
  const p = POLICIES["2002"].find(x => x.inst === "maliye"), high = hydrateDevlet("2002"), low = hydrateDevlet("2002");
  Object.assign(high.institutions.find(i => i.id === p.inst), { capacity: 90, professionalism: 90, budget: 85, leadership: 85, fatigue: 0 });
  Object.assign(low.institutions.find(i => i.id === p.inst), { capacity: 20, professionalism: 20, budget: 25, leadership: 25, fatigue: 70 });
  assert.ok(previewPolicy(high, p).rate > previewPolicy(low, p).rate + 30);
  applyPolicy(high, p.id); const tired = high.institutions.find(i => i.id === p.inst).fatigue;
  for (let i = 0; i < 6; i++) tickDevlet(high);
  assert.ok(high.institutions.find(i => i.id === p.inst).fatigue < tired);
});

test("groups disagree and policy/economy paths create divergent social outcomes", () => {
  const social = hydrateDevlet("2002"), tight = hydrateDevlet("2002");
  const relief = POLICIES["2002"].find(x => x.id === "social-relief"), anchor = POLICIES["2002"].find(x => x.id === "imf-sba");
  applyPolicy(social, relief.id); applyPolicy(tight, anchor.id);
  for (let i = 0; i < 18; i++) { tickDevlet(social); tickDevlet(tight); }
  const mood = state => Object.fromEntries(state.devletDepth.groups.map(g => [g.id, g.satisfaction]));
  assert.notDeepEqual(mood(social), mood(tight));
  assert.ok(new Set(Object.values(mood(social)).map(Math.round)).size > 2);
});

test("government changes while institutional and policy memory survives", () => {
  const s = hydrateDevlet("gunumuz"), firstGov = s.devletDepth.government.id;
  const policy = POLICIES.gunumuz.find(p => p.inst === "maliye");
  applyPolicy(s, policy.id);
  const memory = s.institutions.find(i => i.id === policy.inst).memory.length;
  for (let i = 0; i < 49; i++) tickDevlet(s);
  assert.notEqual(s.devletDepth.government.id, firstGov);
  assert.ok(s.institutions.find(i => i.id === policy.inst).memory.length >= memory);
  assert.ok(s.devletDepth.policy.history.length > 0);
});

test("regional, demographic, media, external and state-form layers evolve causally", () => {
  const s = hydrateDevlet("gunumuz", { seed: 77 }), before = clone({ regions: s.regions, demography: s.devletDepth.demography, media: s.devletDepth.media, world: s.devletDepth.world, form: s.form });
  for (let i = 0; i < 30; i++) tickDevlet(s);
  assert.notDeepEqual(s.regions, before.regions);
  assert.notDeepEqual(s.devletDepth.demography, before.demography);
  assert.notDeepEqual(s.devletDepth.media, before.media);
  assert.notDeepEqual(s.devletDepth.world, before.world);
  assert.ok(Object.keys(s.devletDepth.forms.scores).length === 7);
  assert.ok(s.devletDepth.forms.reasons.length === 3);
});

test("state-driven crises use exposure/resilience and leave causal traces", () => {
  const s = hydrateDevlet("1980", { seed: 4 });
  Object.assign(s.devletDepth.macro, { publicDebt: 120, externalPressure: 95, reserves: 5 });
  Object.assign(s.devletDepth.confidence, { household: 15, business: 15, institutional: 15 });
  s.actual.inflation = 150; s.actual.unemployment = 35; s.entropy = 90;
  for (let i = 0; i < 120 && !s.devletDepth.crises.history.length; i++) tickDevlet(s);
  assert.ok(s.devletDepth.crises.history.length > 0);
  assert.ok(s.devletDepth.traces.some(x => x.type === "crisis" && x.factors.length === 3));
});

test("v1 migration is idempotent, bounded and foreign saves fail closed", () => {
  const old = hydrateDevlet("2002"); delete old.devletDepth; old.meta.version = 1;
  const migrated = normalize("tc-sim-devlet", clone(old));
  assert.equal(migrated.meta.version, 2); assert.ok(validateDevletDepth(migrated));
  assert.deepEqual(normalize("tc-sim-devlet", clone(migrated)), migrated);
  assert.equal(normalize("tc-sim-devlet", { meta: { id: "apartman", version: 2 }, history: [], openCases: [] }), null);
  assert.equal(normalize("tc-sim-devlet", { meta: { id: "tc-sim-devlet", version: 99 }, history: [], openCases: [] }), null);
});

test("all Wave 5 collections remain bounded and finite in a grand campaign", () => {
  const s = hydrateDevlet("1923", { campaign: true, seed: 456 });
  for (let i = 0; i < 1400 && !s.flags.campaignEnd; i++) {
    const pool = POLICIES[s.eraId] || POLICIES["2002"], p = pool[i % pool.length];
    applyPolicy(s, p.id); tickDevlet(s);
    assert.ok(finiteState(s));
  }
  const d = s.devletDepth;
  assert.ok(d.policy.history.length <= DEVLET_BOUNDS.policyHistory);
  assert.ok(d.policy.pending.length <= DEVLET_BOUNDS.pending);
  assert.ok(d.policy.resolved.length <= DEVLET_BOUNDS.resolved);
  assert.ok(d.traces.length <= DEVLET_BOUNDS.traces);
  assert.ok(d.crises.history.length <= DEVLET_BOUNDS.crisisHistory);
  assert.ok(d.regionalHistory.length <= DEVLET_BOUNDS.regionalHistory);
  assert.ok(d.groups.every(g => g.memory.length <= DEVLET_BOUNDS.groupMemory));
  assert.ok(s.institutions.every(i => i.memory.length <= DEVLET_BOUNDS.institutionMemory));
  assert.ok(JSON.stringify(s).length < 260_000);
});
