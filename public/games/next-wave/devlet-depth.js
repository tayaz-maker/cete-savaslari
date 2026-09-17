/**
 * Wave 5 causal foundation for TC SIM: DEVLET.
 * Additive to the authored period/event kernel: no game-specific state leaks.
 */
export const DEVLET_SAVE_VERSION = 2;

const cap = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo));
const boundedPush = (rows, value, limit) => {
  rows.push(value);
  if (rows.length > limit) rows.splice(0, rows.length - limit);
};
const hash01 = (seed, turn, salt = 0) => {
  let x = ((seed || 12345) ^ Math.imul(turn + 1, 2654435761) ^ Math.imul(salt + 17, 2246822519)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 2246822507); x ^= x >>> 13; x = Math.imul(x, 3266489909); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};

export const DEVLET_BOUNDS = Object.freeze({
  policyHistory: 72, pending: 32, resolved: 64, institutionMemory: 12,
  actorMemory: 12, crisisHistory: 36, groupMemory: 12, regionalHistory: 24,
  annualReports: 108, traces: 48,
});

export const GROUP_SPECS = Object.freeze([
  ["labor", "Çalışanlar", "realIncome"], ["business", "İş dünyası", "investment"],
  ["farmers", "Çiftçiler", "agriculture"], ["youth", "Gençler", "jobs"],
  ["bureaucracy", "Kamu / bürokrasi", "institutions"], ["urban", "Kentli orta sınıf", "prices"],
  ["rural", "Kırsal nüfus", "services"], ["retirees", "Emekliler", "purchasingPower"],
  ["media", "Medya / kanaat", "credibility"], ["security", "Güvenlik bürokrasisi", "stability"],
]);

const ERA_DEPTH = Object.freeze({
  "1923": { growth: 2.1, interest: 9, budget: -5, debt: 58, reserves: 24, inequality: 66, tax: 28, spending: 42, urban: 24, young: 42, old: 6, participation: 48, global: [42, 58, 56, 43, 36], government: ["Kurucu kabine", 68, 72] },
  "1950": { growth: 4.8, interest: 7, budget: -3, debt: 42, reserves: 43, inequality: 58, tax: 34, spending: 44, urban: 32, young: 39, old: 7, participation: 52, global: [64, 38, 43, 62, 40], government: ["Seçilmiş hükümet", 61, 66] },
  "1980": { growth: -2.4, interest: 34, budget: -10, debt: 69, reserves: 18, inequality: 63, tax: 46, spending: 58, urban: 44, young: 37, old: 8, participation: 49, global: [40, 78, 74, 35, 76], government: ["Geçiş yönetimi", 44, 58] },
  "2002": { growth: 1.4, interest: 42, budget: -12, debt: 76, reserves: 27, inequality: 61, tax: 52, spending: 58, urban: 65, young: 32, old: 10, participation: 48, global: [51, 44, 61, 54, 62], government: ["Yeni hükümet", 64, 70] },
  gunumuz: { growth: 3.2, interest: 38, budget: -8, debt: 52, reserves: 31, inequality: 69, tax: 57, spending: 66, urban: 78, young: 28, old: 14, participation: 53, global: [48, 70, 72, 47, 68], government: ["Görevdeki hükümet", 51, 57] },
  alternatif: { growth: 4.1, interest: 16, budget: -3, debt: 45, reserves: 58, inequality: 52, tax: 48, spending: 54, urban: 67, young: 31, old: 11, participation: 56, global: [58, 45, 48, 59, 45], government: ["Alternatif hükümet", 58, 64] },
});

const institutionRole = id => ({
  maliye: "fiscal", merkez: "monetary", mulkiye: "administration", yargi: "justice",
  ordu: "security", maarif: "education", belediye: "local", istikhbarat: "intelligence",
}[id] || "administration");

function makeCadres(institutions, eraId) {
  return institutions.slice(0, 8).map((inst, index) => ({
    id: `cadre-${inst.id}`, institution: inst.id, role: institutionRole(inst.id),
    name: `${inst.name} kadrosu`, experience: cap(38 + inst.capacity * 0.45 + index),
    management: cap(35 + inst.capacity * 0.5), expertise: cap(42 + inst.professionalism * 0.42),
    reliability: cap(45 + (inst.trust || 50) * 0.35), publicProfile: cap(24 + index * 4),
    networkRisk: cap(55 - inst.professionalism * 0.35), crisisResilience: cap(35 + inst.capacity * 0.4),
    institutionalLoyalty: cap(35 + inst.autonomy * 0.45), appointedTurn: 1,
    era: eraId, memory: [],
  }));
}

export function ensureDevletDepth(state) {
  if (!state || state.meta?.id !== "tc-sim-devlet") return null;
  const preset = ERA_DEPTH[state.eraId] || ERA_DEPTH["2002"];
  state.meta.version = DEVLET_SAVE_VERSION;
  state.meta.seed = Number.isInteger(state.meta.seed) ? state.meta.seed : 12345;
  const d = state.devletDepth && typeof state.devletDepth === "object" ? state.devletDepth : {};
  d.version = 1;
  d.macro = Object.assign({
    realGrowth: preset.growth, nominalGrowth: preset.growth + (state.actual?.inflation || 0), interestRate: preset.interest,
    budgetBalance: preset.budget, publicDebt: preset.debt, investment: 48, purchasingPower: cap(100 - (state.actual?.inflation || 0) * .7),
    reserves: preset.reserves, externalPressure: state.actual?.externalDep || 50, inequality: preset.inequality,
    taxBurden: preset.tax, publicSpending: preset.spending,
  }, d.macro || {});
  d.confidence = Object.assign({ household: 48, business: 48, institutional: state.infoQuality || 50, expectations: 48 }, d.confidence || {});
  const oldGroups = new Map((d.groups || []).map(x => [x.id, x]));
  d.groups = GROUP_SPECS.map(([id, name, priority], index) => Object.assign({
    id, name, priority, satisfaction: cap(48 - (state.heat || 40) * .08 + index % 3),
    expectation: 50, pressure: 25 + index * 2, mobilization: 18 + index * 2, memory: [],
  }, oldGroups.get(id) || {}));
  for (const inst of state.institutions || []) {
    inst.professionalism = cap(inst.professionalism ?? 50);
    inst.trust = cap(inst.trust ?? (state.infoQuality || 50));
    inst.budget = cap(inst.budget ?? inst.capacity);
    inst.leadership = cap(inst.leadership ?? inst.capacity);
    inst.fatigue = cap(inst.fatigue ?? 8);
    inst.alignment = cap(inst.alignment ?? 55);
    inst.role = inst.role || institutionRole(inst.id);
    inst.memory = Array.isArray(inst.memory) ? inst.memory.slice(-DEVLET_BOUNDS.institutionMemory) : [];
  }
  d.government = Object.assign({
    id: `gov-${state.eraId}-${state.time?.year || 0}`, name: preset.government[0], mandate: preset.government[1],
    politicalCapital: preset.government[2], publicSupport: 52, coalitionPressure: 25,
    crisisPerformance: 50, preference: state.dna?.market >= 55 ? "market" : state.dna?.socialState >= 55 ? "social" : "mixed",
    termStart: state.time?.turn || 1, terms: 0, memory: [],
  }, d.government || {});
  d.cadres = Array.isArray(d.cadres) && d.cadres.length ? d.cadres : makeCadres(state.institutions || [], state.eraId);
  d.cadres = d.cadres.slice(0, 12).map(x => ({ ...x, memory: Array.isArray(x.memory) ? x.memory.slice(-DEVLET_BOUNDS.actorMemory) : [] }));
  d.demography = Object.assign({ populationIndex: 100, urbanization: preset.urban, youngShare: preset.young, workingShare: 100 - preset.young - preset.old, elderlyShare: preset.old, participation: preset.participation, internalMigration: 1.5, netMigration: 0 }, d.demography || {});
  d.media = Object.assign({ salience: { economy: 55, institutions: 35, security: 30, services: 35 }, trust: state.infoQuality || 50, fragmentation: 35, topIssue: "economy" }, d.media || {});
  d.world = Object.assign({ globalGrowth: preset.global[0], energyPressure: preset.global[1], globalRates: preset.global[2], tradeDemand: preset.global[3], regionalRisk: preset.global[4], shock: null }, d.world || {});
  d.policy = Object.assign({ pending: [], resolved: [], counts: {}, cooldowns: {}, lastByDomain: {}, history: [] }, d.policy || {});
  for (const key of ["pending", "resolved", "history"]) d.policy[key] = Array.isArray(d.policy[key]) ? d.policy[key] : [];
  d.policy.counts = d.policy.counts && typeof d.policy.counts === "object" ? d.policy.counts : {};
  d.policy.cooldowns = d.policy.cooldowns && typeof d.policy.cooldowns === "object" ? d.policy.cooldowns : {};
  d.crises = Object.assign({ active: [], history: [], resilience: 45, exposure: {} }, d.crises || {});
  d.crises.active = Array.isArray(d.crises.active) ? d.crises.active.slice(-8) : [];
  d.crises.history = Array.isArray(d.crises.history) ? d.crises.history.slice(-DEVLET_BOUNDS.crisisHistory) : [];
  d.forms = Object.assign({ scores: {}, dominant: state.form, reasons: [] }, d.forms || {});
  d.traces = Array.isArray(d.traces) ? d.traces.slice(-DEVLET_BOUNDS.traces) : [];
  d.regionalHistory = Array.isArray(d.regionalHistory) ? d.regionalHistory.slice(-DEVLET_BOUNDS.regionalHistory) : [];
  d.outcome = d.outcome && typeof d.outcome === "object" ? d.outcome : {};
  for (const region of state.regions || []) {
    region.activity = cap(region.activity ?? 45 + region.impl * .15);
    region.unemployment = cap(region.unemployment ?? (state.actual?.unemployment || 10), 0, 40);
    region.services = cap(region.services ?? region.impl);
    region.satisfaction = cap(region.satisfaction ?? 52 - region.heat * .12);
    region.migration = cap(region.migration ?? 50);
    region.stability = cap(region.stability ?? 100 - region.heat);
    region.infrastructure = cap(region.infrastructure ?? region.impl);
    region.urbanization = cap(region.urbanization ?? preset.urban + (region.impl - 50) * .2);
  }
  for (const g of d.groups) g.memory = Array.isArray(g.memory) ? g.memory.slice(-DEVLET_BOUNDS.groupMemory) : [];
  state.devletDepth = d;
  boundDevletDepth(state);
  return state;
}

function policyDomain(p) {
  const id = p.id || "";
  if (p.inst === "merkez" || /inflation|faiz|fx|reserve|capa/.test(id)) return "monetary";
  if (p.inst === "maliye" || /tax|budget|imf|bank|credit/.test(id)) return "fiscal";
  if (p.inst === "maarif" || /egitim|uni/.test(id)) return "education";
  if (p.inst === "belediye" || /housing|konut|water|yerel|region/.test(id)) return "services";
  if (p.inst === "ordu" || p.inst === "mulkiye" || /security|guvenlik|goc/.test(id)) return "security";
  if (p.inst === "yargi" || /judicial|yargi|legal|eu/.test(id)) return "institutions";
  return "development";
}

export function policyMetadata(p) {
  const domain = policyDomain(p), expansion = p.cost >= 7 && (p.inflation || 0) >= 0;
  const affected = {
    monetary: [["urban", -1], ["business", 2], ["labor", -1], ["retirees", -1]],
    fiscal: [["business", 1], ["bureaucracy", 1], ["urban", -1]],
    education: [["youth", 3], ["bureaucracy", 1], ["rural", 1]],
    services: [["urban", 2], ["rural", 2], ["farmers", 1]],
    security: [["security", 3], ["media", -1], ["youth", -1]],
    institutions: [["bureaucracy", 2], ["media", 2], ["business", 1]],
    development: [["business", 2], ["labor", 1], ["farmers", 1]],
  }[domain];
  return {
    domain, implementationDemand: p.capacityNeed || 50, fiscalCost: p.cost || 0,
    affectedGroups: affected, institution: p.inst, cooldown: domain === "monetary" ? 3 : 4,
    reversibility: ["monetary", "fiscal"].includes(domain) ? "medium" : "low",
    risk: expansion ? "inflation" : domain === "security" ? "trust" : "implementation",
    horizons: {
      short: { inflation: p.inflation || 0, budget: -(p.cost || 0) * .45, growth: expansion ? .35 : -.08, trust: p.trust || 0 },
      medium: { inflation: (p.inflation || 0) * .35, budget: -(p.cost || 0) * .12, growth: domain === "education" ? .22 : expansion ? .18 : .08, trust: (p.trust || 0) * .45 },
      long: { inflation: 0, budget: domain === "institutions" ? .18 : 0, growth: ["education", "development", "services"].includes(domain) ? .18 : 0, trust: domain === "institutions" ? .2 : 0 },
    },
  };
}

function implementationFor(state, p, meta) {
  const d = state.devletDepth, inst = state.institutions.find(x => x.id === p.inst);
  const institutional = inst ? inst.capacity * .28 + inst.professionalism * .2 + inst.budget * .12 + inst.leadership * .1 + inst.alignment * .1 - inst.fatigue * .16 - Math.max(0, inst.autonomy - 70) * .08 : 42;
  const social = d.groups.reduce((a, g) => a + g.satisfaction, 0) / d.groups.length;
  const repeat = d.policy.counts[p.id] || 0;
  return cap(institutional + d.confidence.institutional * .12 + social * .08 - state.entropy * .12 - meta.implementationDemand * .16 - repeat * 5, 12, 96);
}

export function previewPolicy(state, p) {
  // Presentation receives a read-only proxy that deliberately throws if the
  // hidden `actual` layer is touched. Hydrated/migrated saves already own the
  // depth layer, so preview must not re-hydrate or inspect hidden truth.
  if (!state.devletDepth) ensureDevletDepth(state);
  const meta = policyMetadata(p), rate = implementationFor(state, p, meta), d = state.devletDepth;
  const repeats = d.policy.counts[p.id] || 0, cooldown = Math.max(0, (d.policy.cooldowns[p.id] || 0) - state.time.turn);
  const context = [];
  if (d.macro.publicDebt > 70 && meta.fiscalCost >= 7) context.push("yüksek borç mali alanı daraltıyor");
  if (d.confidence.institutional < 40) context.push("düşük kurumsal güven uygulamayı zayıflatıyor");
  if (repeats) context.push(`tekrar ${repeats}: azalan getiri`);
  if (cooldown) context.push(`${cooldown} tur kurumsal yorgunluk`);
  return { ...meta, rate, repeats, cooldown, context };
}

export function schedulePolicyDepth(state, p) {
  ensureDevletDepth(state);
  const d = state.devletDepth, meta = policyMetadata(p), preview = previewPolicy(state, p);
  const duplicate = d.policy.pending.some(x => x.source === p.id && x.scheduledTurn === state.time.turn);
  if (duplicate) return false;
  const previousDomain = d.policy.lastByDomain[meta.domain];
  const reversal = previousDomain && previousDomain.id !== p.id && state.time.turn - previousDomain.turn <= 6;
  const repeatFactor = 1 / (1 + preview.repeats * .28);
  for (const [horizon, delay] of [["short", 1], ["medium", 6], ["long", 15]]) {
    const id = `${p.id}:${state.time.turn}:${horizon}`;
    d.policy.pending.push({ id, source: p.id, domain: meta.domain, institution: p.inst, horizon, scheduledTurn: state.time.turn, dueTurn: state.time.turn + delay, rate: preview.rate, repeatFactor, reversal, effects: meta.horizons[horizon] });
  }
  d.policy.counts[p.id] = preview.repeats + 1;
  d.policy.cooldowns[p.id] = state.time.turn + meta.cooldown;
  d.policy.lastByDomain[meta.domain] = { id: p.id, turn: state.time.turn };
  boundedPush(d.policy.history, { turn: state.time.turn, id: p.id, domain: meta.domain, rate: preview.rate, reversal }, DEVLET_BOUNDS.policyHistory);
  const inst = state.institutions.find(x => x.id === p.inst);
  if (inst) {
    inst.fatigue = cap(inst.fatigue + 4 + preview.repeats * 2);
    boundedPush(inst.memory, { turn: state.time.turn, type: "policy", id: p.id, rate: preview.rate }, DEVLET_BOUNDS.institutionMemory);
  }
  for (const [id, delta] of meta.affectedGroups) {
    const g = d.groups.find(x => x.id === id); if (!g) continue;
    g.expectation = cap(g.expectation + delta);
    boundedPush(g.memory, { turn: state.time.turn, policy: p.id, expected: delta }, DEVLET_BOUNDS.groupMemory);
  }
  if (reversal) {
    d.confidence.business = cap(d.confidence.business - 2.5);
    d.confidence.institutional = cap(d.confidence.institutional - 2);
  }
  boundDevletDepth(state);
  return true;
}

function resolvePolicies(state) {
  const d = state.devletDepth, keep = [];
  for (const effect of d.policy.pending) {
    if (effect.dueTurn > state.time.turn) { keep.push(effect); continue; }
    if (d.policy.resolved.some(x => x.id === effect.id)) continue;
    const inst = state.institutions.find(x => x.id === effect.institution);
    const liveRate = inst ? cap(effect.rate * .65 + (inst.capacity + inst.professionalism - inst.fatigue) * .175, 8, 98) : effect.rate * .55;
    const factor = liveRate / 100 * effect.repeatFactor * (effect.reversal ? .82 : 1);
    const e = effect.effects;
    d.macro.realGrowth = cap(d.macro.realGrowth + e.growth * factor, -12, 15);
    d.macro.budgetBalance = cap(d.macro.budgetBalance + e.budget * factor, -25, 12);
    state.actual.inflation = cap(state.actual.inflation + e.inflation * factor, 0, 180);
    d.confidence.household = cap(d.confidence.household + e.trust * factor);
    d.confidence.institutional = cap(d.confidence.institutional + (effect.domain === "institutions" ? 1.2 : .15) * factor);
    if (effect.domain === "education" && effect.horizon === "long") d.demography.participation = cap(d.demography.participation + .5 * factor);
    if (effect.domain === "services") for (const r of state.regions) r.services = cap(r.services + .45 * factor);
    if (inst) inst.professionalism = cap(inst.professionalism + (effect.domain === "institutions" ? .5 : .08) * factor);
    boundedPush(d.policy.resolved, { id: effect.id, turn: state.time.turn, source: effect.source, horizon: effect.horizon, factor }, DEVLET_BOUNDS.resolved);
    boundedPush(d.traces, { turn: state.time.turn, type: "policy", source: effect.source, horizon: effect.horizon, factors: [`uygulama %${Math.round(liveRate)}`, `tekrar çarpanı ${effect.repeatFactor.toFixed(2)}`, effect.reversal ? "yakın politika dönüşü" : "politika sürekliliği"] }, DEVLET_BOUNDS.traces);
  }
  d.policy.pending = keep;
}

function updateWorld(state) {
  const d = state.devletDepth, w = d.world, t = state.time.turn, seed = state.meta.seed;
  const cycle = Math.sin((t + (seed % 17)) / 11);
  w.globalGrowth = cap(w.globalGrowth * .94 + (50 + cycle * 12) * .06);
  w.energyPressure = cap(w.energyPressure * .93 + (50 + Math.sin(t / 7) * 15) * .07);
  w.globalRates = cap(w.globalRates * .95 + (48 - cycle * 10) * .05);
  w.tradeDemand = cap(w.tradeDemand * .92 + (w.globalGrowth * .7 + 15) * .08);
  w.regionalRisk = cap(w.regionalRisk * .95 + (45 + Math.cos(t / 13) * 12) * .05);
  w.shock = null;
  if (t % 18 === 0 && hash01(seed, t, 9) < .42) {
    const kinds = ["energy", "finance", "trade", "regional"], kind = kinds[Math.floor(hash01(seed, t, 10) * kinds.length)];
    const severity = 8 + Math.round(hash01(seed, t, 11) * 14);
    w.shock = { id: `${kind}-${t}`, kind, severity, turn: t };
    if (kind === "energy") w.energyPressure = cap(w.energyPressure + severity);
    if (kind === "finance") w.globalRates = cap(w.globalRates + severity);
    if (kind === "trade") w.tradeDemand = cap(w.tradeDemand - severity);
    if (kind === "regional") w.regionalRisk = cap(w.regionalRisk + severity);
  }
}

function updateMacro(state) {
  const d = state.devletDepth, m = d.macro, w = d.world;
  const avgInst = state.institutions.reduce((a, i) => a + i.capacity + i.professionalism - i.fatigue, 0) / Math.max(1, state.institutions.length * 2);
  const external = (w.globalRates + w.energyPressure + w.regionalRisk) / 3;
  const demand = (d.confidence.household + d.confidence.business + w.tradeDemand) / 3;
  const debtService = m.publicDebt * (m.interestRate / 100) * .012;
  const fiscalImpulse = cap(-m.budgetBalance, -10, 20) * .025;
  const structural = ((state.actual.industry || 40) + (state.actual.agri || 30) + (state.actual.energy || 40)) / 150;
  const targetGrowth = (demand - 50) * .055 + (w.globalGrowth - 50) * .035 + (avgInst - 45) * .025 + structural - external * .012 + fiscalImpulse;
  m.realGrowth = cap(m.realGrowth * .78 + targetGrowth * .22, -12, 15);
  const inflationPressure = (w.energyPressure - 50) * .025 + (m.publicSpending - m.taxBurden) * .018 + (50 - d.confidence.institutional) * .012 + Math.max(0, m.realGrowth - 6) * .08;
  state.actual.inflation = cap(state.actual.inflation * .965 + inflationPressure, 0, 180);
  m.nominalGrowth = cap(m.realGrowth + state.actual.inflation, -10, 190);
  m.interestRate = cap(m.interestRate * .88 + (state.actual.inflation * .55 + w.globalRates * .18 + (50 - d.confidence.institutional) * .12) * .12, 0, 120);
  state.actual.unemployment = cap(state.actual.unemployment - m.realGrowth * .035 + (d.demography.participation - 50) * .004, 1, 40);
  // Deficits create debt pressure, but automatic stabilisers and debt service
  // work on a monthly scale. The earlier coefficients made every competent
  // eight-year run hit the debt ceiling regardless of policy.
  m.budgetBalance = cap(m.budgetBalance + (m.taxBurden - m.publicSpending) * .012 - debtService * .035 + m.realGrowth * .04 - m.budgetBalance * .015, -25, 12);
  m.publicDebt = cap(m.publicDebt - m.budgetBalance * .015 + debtService * .02 - m.realGrowth * .04, 0, 140);
  state.actual.debt = cap(m.publicDebt, 0, 140);
  m.reserves = cap(m.reserves + (w.tradeDemand - 50) * .018 - (w.globalRates - 50) * .015 - Math.max(0, state.actual.inflation - 25) * .012, 0, 100);
  m.externalPressure = cap((100 - m.reserves) * .42 + w.globalRates * .25 + w.energyPressure * .2 + state.actual.externalDep * .13);
  m.investment = cap(m.investment * .88 + (d.confidence.business * .45 + avgInst * .25 + w.tradeDemand * .2 - m.interestRate * .15) * .12);
  m.purchasingPower = cap(m.purchasingPower + m.realGrowth * .08 - state.actual.inflation * .025 + (m.publicSpending - 50) * .01);
  m.inequality = cap(m.inequality + (m.realGrowth > 4 ? .04 : -.01) + (m.purchasingPower < 40 ? .08 : -.015));
  state.actual.treasury = cap(state.actual.treasury + m.budgetBalance * .08 - Math.max(0, m.externalPressure - 70) * .015, 0, 220);
  const factors = [];
  if (w.energyPressure > 65) factors.push("enerji baskısı");
  if (m.publicSpending - m.taxBurden > 12) factors.push("geniş bütçe dürtüsü");
  if (d.confidence.institutional < 40) factors.push("düşük kurumsal güven");
  if (w.globalRates > 65) factors.push("küresel finansman sıkılığı");
  if (factors.length) boundedPush(d.traces, { turn: state.time.turn, type: "macro", source: "inflation-pressure", factors }, DEVLET_BOUNDS.traces);
}

function updateConfidenceAndGroups(state) {
  const d = state.devletDepth, m = d.macro;
  const avgInstTrust = state.institutions.reduce((a, i) => a + i.trust, 0) / Math.max(1, state.institutions.length);
  d.confidence.household = cap(d.confidence.household * .9 + (m.purchasingPower * .42 + (100 - state.actual.unemployment * 2) * .28 + (100 - state.actual.inflation) * .18 + d.government.publicSupport * .12) * .1);
  d.confidence.business = cap(d.confidence.business * .9 + (m.investment * .35 + (100 - m.externalPressure) * .25 + avgInstTrust * .2 + (100 - m.interestRate) * .2) * .1);
  d.confidence.institutional = cap(d.confidence.institutional * .92 + (avgInstTrust * .45 + state.infoQuality * .3 + (100 - state.entropy) * .25) * .08);
  d.confidence.expectations = cap((d.confidence.household + d.confidence.business + d.confidence.institutional) / 3);
  const targets = {
    labor: m.purchasingPower * .45 + (100 - state.actual.unemployment * 2) * .35 + d.confidence.household * .2,
    business: m.investment * .45 + d.confidence.business * .35 + (100 - m.taxBurden) * .2,
    farmers: (state.actual.agri || 40) * .45 + state.regions.filter(r => r.urbanization < 55).reduce((a, r) => a + r.services, 0) / Math.max(1, state.regions.filter(r => r.urbanization < 55).length) * .35 + d.confidence.household * .2,
    youth: (100 - state.actual.unemployment * 2) * .45 + d.demography.participation * .2 + state.institutions.find(i => i.id === "maarif")?.capacity * .35,
    bureaucracy: avgInstTrust * .45 + implementationAverage(state) * .35 + (100 - state.entropy) * .2,
    urban: m.purchasingPower * .4 + (100 - state.actual.inflation) * .3 + state.regions.filter(r => r.urbanization >= 55).reduce((a, r) => a + r.services, 0) / Math.max(1, state.regions.filter(r => r.urbanization >= 55).length) * .3,
    rural: (state.actual.agri || 40) * .4 + state.regions.filter(r => r.urbanization < 55).reduce((a, r) => a + r.infrastructure, 0) / Math.max(1, state.regions.filter(r => r.urbanization < 55).length) * .4 + d.confidence.household * .2,
    retirees: m.purchasingPower * .55 + (m.publicSpending) * .25 + d.confidence.household * .2,
    media: d.media.trust * .45 + state.infoQuality * .35 + (100 - d.media.fragmentation) * .2,
    security: state.institutions.find(i => i.id === "ordu")?.capacity * .45 + (100 - d.world.regionalRisk) * .25 + d.government.crisisPerformance * .3,
  };
  for (const g of d.groups) {
    g.satisfaction = cap(g.satisfaction * .88 + (targets[g.id] ?? 50) * .12);
    g.pressure = cap(g.pressure * .92 + Math.max(0, g.expectation - g.satisfaction) * .12);
    g.mobilization = cap(g.mobilization * .94 + g.pressure * .035 + (100 - g.satisfaction) * .02);
    g.expectation = cap(g.expectation * .985 + 50 * .015);
  }
  const avgMood = d.groups.reduce((a, g) => a + g.satisfaction, 0) / d.groups.length;
  state.heat = cap(state.heat * .9 + (100 - avgMood) * .1 + d.media.fragmentation * .015);
}

function implementationAverage(state) {
  return state.institutions.reduce((a, i) => a + i.capacity + i.professionalism - i.fatigue, 0) / Math.max(1, state.institutions.length * 2);
}

function updateInstitutionsAndRegions(state) {
  const d = state.devletDepth, m = d.macro;
  for (const inst of state.institutions) {
    inst.fatigue = cap(inst.fatigue * .92 - .3);
    const fundingGap = inst.budget - 50;
    inst.capacity = cap(inst.capacity + fundingGap * .003 + inst.professionalism * .002 - inst.fatigue * .003 - state.entropy * .0012 + (50 - inst.capacity) * .002);
    inst.trust = cap(inst.trust * .96 + (inst.professionalism * .45 + d.confidence.institutional * .35 + inst.leadership * .2) * .04);
    inst.alignment = cap(inst.alignment * .97 + (100 - Math.abs(inst.autonomy - d.government.mandate)) * .03);
  }
  const serviceInst = state.institutions.filter(i => ["belediye", "maarif", "mulkiye"].includes(i.id));
  const serviceCapacity = serviceInst.reduce((a, i) => a + i.capacity, 0) / Math.max(1, serviceInst.length);
  for (const r of state.regions) {
    const local = (r.impl / 50) * serviceCapacity;
    r.activity = cap(r.activity * .94 + (50 + m.realGrowth * 3 + d.world.tradeDemand * .1) * .06);
    r.unemployment = cap(r.unemployment * .9 + state.actual.unemployment * .1 + (50 - r.activity) * .01, 0, 40);
    r.services = cap(r.services * .97 + local * .03 - state.entropy * .004);
    r.infrastructure = cap(r.infrastructure * .98 + (state.actual.treasury > 45 ? .12 : -.08));
    r.satisfaction = cap(r.satisfaction * .9 + (r.services * .3 + r.activity * .3 + (100 - r.unemployment * 2) * .25 + d.confidence.household * .15) * .1);
    r.heat = cap(r.heat * .92 + (100 - r.satisfaction) * .08);
    r.stability = cap(100 - r.heat * .65 - r.unemployment * .5);
    r.migration = cap(50 + (r.activity - 50) * .4 + (r.services - 50) * .25 - r.heat * .2);
    r.urbanization = cap(r.urbanization + (r.migration - 50) * .002);
  }
  d.demography.urbanization = cap(state.regions.reduce((a, r) => a + r.urbanization, 0) / state.regions.length);
  d.demography.internalMigration = cap(state.regions.reduce((a, r) => a + Math.abs(r.migration - 50), 0) / state.regions.length * .05, 0, 10);
  d.demography.populationIndex = cap(d.demography.populationIndex + (d.demography.youngShare - d.demography.elderlyShare) * .002 + d.demography.netMigration * .002, 60, 180);
}

function updateMediaGovernmentForms(state) {
  const d = state.devletDepth, m = d.macro;
  const issues = { economy: state.actual.inflation + state.actual.unemployment * 2, institutions: 100 - d.confidence.institutional, security: d.world.regionalRisk, services: 100 - state.regions.reduce((a, r) => a + r.services, 0) / state.regions.length };
  for (const [k, v] of Object.entries(issues)) d.media.salience[k] = cap(d.media.salience[k] * .82 + v * .18);
  d.media.topIssue = Object.entries(d.media.salience).sort((a, b) => b[1] - a[1])[0][0];
  d.media.trust = cap(d.media.trust * .94 + (state.infoQuality * .5 + d.confidence.institutional * .5) * .06);
  d.media.fragmentation = cap(d.media.fragmentation + (state.heat - 50) * .015 + (50 - d.media.trust) * .01);
  const avgMood = d.groups.reduce((a, g) => a + g.satisfaction, 0) / d.groups.length;
  d.government.publicSupport = cap(d.government.publicSupport * .9 + (avgMood * .55 + d.confidence.household * .3 + (100 - state.heat) * .15) * .1);
  d.government.politicalCapital = cap(d.government.politicalCapital + (d.government.publicSupport - 50) * .012 - d.government.coalitionPressure * .004);
  if (state.time.turn - d.government.termStart >= 48) {
    boundedPush(d.government.memory, { turn: state.time.turn, type: "government-change", support: d.government.publicSupport }, 12);
    d.government = { ...d.government, id: `gov-${state.eraId}-${state.time.turn}`, name: "Yeni hükümet", mandate: cap(45 + hash01(state.meta.seed, state.time.turn, 31) * 30), politicalCapital: 62, coalitionPressure: cap(20 + hash01(state.meta.seed, state.time.turn, 32) * 35), termStart: state.time.turn, terms: d.government.terms + 1, memory: d.government.memory };
    boundedPush(d.traces, { turn: state.time.turn, type: "government", source: "government-change", factors: ["görev süresi tamamlandı", "devlet kurumları ve politika hafızası korundu"] }, DEVLET_BOUNDS.traces);
  }
  const avgAutonomy = state.institutions.reduce((a, i) => a + i.autonomy, 0) / state.institutions.length;
  const avgCapacity = state.institutions.reduce((a, i) => a + i.capacity, 0) / state.institutions.length;
  const scores = {
    "Kışla-Devlet": state.dna.security * .55 + (state.institutions.find(i => i.id === "ordu")?.autonomy || 50) * .45,
    "Bürokrasi-Devlet": state.dna.institutionalism * .45 + avgCapacity * .35 + avgAutonomy * .2,
    "Parti-Devlet": state.dna.centralization * .45 + (100 - avgAutonomy) * .35 + d.government.mandate * .2,
    "Sermaye-Devlet": state.dna.market * .5 + d.confidence.business * .3 + m.investment * .2,
    "Cemaat-Devlet": state.dna.paternalism * .42 + state.networks.reduce((a, n) => a + n.pressure, 0) / Math.max(1, state.networks.length) * .58,
    "Popülist-Devlet": d.government.publicSupport * .35 + m.publicSpending * .3 + state.heat * .35,
    "Boş Kabuk": state.entropy * .45 + (100 - avgCapacity) * .35 + (100 - d.confidence.institutional) * .2,
  };
  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  d.forms.scores = scores; d.forms.dominant = dominant[0];
  d.forms.reasons = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, score]) => `${id}: ${Math.round(score)}`);
  state.form = dominant[0];
}

function updateCrises(state) {
  const d = state.devletDepth, m = d.macro;
  const institutionHealth = implementationAverage(state);
  const cohesion = state.regions.reduce((a, r) => a + r.stability, 0) / state.regions.length;
  d.crises.resilience = cap(state.actual.treasury * .12 + (100 - m.publicDebt) * .15 + institutionHealth * .3 + d.confidence.institutional * .2 + cohesion * .15 + m.reserves * .08);
  const exposure = {
    inflation: state.actual.inflation * .7 + (100 - d.confidence.institutional) * .3,
    recession: state.actual.unemployment * 2 + Math.max(0, -m.realGrowth) * 8,
    financial: m.publicDebt * .35 + m.externalPressure * .45 + m.interestRate * .2,
    migration: d.demography.internalMigration * 6 + Math.abs(d.demography.netMigration) * 3,
    institutional: state.entropy * .45 + (100 - d.confidence.institutional) * .35 + (100 - institutionHealth) * .2,
    trust: state.heat * .45 + (100 - d.confidence.household) * .35 + d.media.fragmentation * .2,
    external: d.world.regionalRisk * .45 + d.world.energyPressure * .3 + d.world.globalRates * .25,
  };
  d.crises.exposure = exposure;
  // A crisis has to run its course. Nothing used to remove an entry from
  // `active` or move `status` off "active", so the `active.length >= 3` guard
  // below permanently switched the whole crisis system off: in a 107-year
  // campaign the same three crises stayed active for 97 years, crisisHistory
  // froze at 3 of its 36 rows and six of the seven families never appeared at
  // all. A resilient state works through a crisis faster than a brittle one;
  // history holds the same objects, so it records the resolution too.
  for (const c of d.crises.active) {
    const duration = Math.max(3, Math.round(c.severity * .35 - d.crises.resilience * .12 + 6));
    if (state.time.turn - c.startTurn >= duration) { c.status = "resolved"; c.endTurn = state.time.turn; }
  }
  d.crises.active = d.crises.active.filter(c => c.status === "active");
  if (state.time.turn % 6 !== 0 || d.crises.active.length >= 3) return;
  const [family, raw] = Object.entries(exposure).sort((a, b) => b[1] - a[1])[0];
  const probability = cap((raw - d.crises.resilience) * .009, 0, .55);
  if (hash01(state.meta.seed, state.time.turn, 41) >= probability) return;
  const crisis = { id: `${family}-${state.time.turn}`, family, startTurn: state.time.turn, severity: cap(raw - d.crises.resilience + 20, 10, 80), status: "active" };
  d.crises.active.push(crisis); boundedPush(d.crises.history, crisis, DEVLET_BOUNDS.crisisHistory);
  state.heat = cap(state.heat + crisis.severity * .04);
  d.government.crisisPerformance = cap(d.government.crisisPerformance - crisis.severity * .025 + d.crises.resilience * .015);
  boundedPush(d.traces, { turn: state.time.turn, type: "crisis", source: family, factors: [`maruziyet ${Math.round(raw)}`, `dayanıklılık ${Math.round(d.crises.resilience)}`, `şiddet ${Math.round(crisis.severity)}`] }, DEVLET_BOUNDS.traces);
}

export function tickDevletDepth(state) {
  ensureDevletDepth(state);
  resolvePolicies(state); updateWorld(state); updateMacro(state); updateConfidenceAndGroups(state);
  updateInstitutionsAndRegions(state); updateMediaGovernmentForms(state); updateCrises(state);
  const d = state.devletDepth;
  if (state.time.month === 1) boundedPush(d.regionalHistory, { year: state.time.year - 1, regions: state.regions.map(r => ({ id: r.id, satisfaction: Math.round(r.satisfaction), activity: Math.round(r.activity), services: Math.round(r.services) })) }, DEVLET_BOUNDS.regionalHistory);
  d.outcome = {
    economy: cap(50 + d.macro.realGrowth * 4 - state.actual.inflation * .35 - state.actual.unemployment * 1.2),
    institutions: implementationAverage(state), external: cap(100 - d.macro.externalPressure),
    cohesion: cap(100 - state.heat), resilience: d.crises.resilience,
    development: cap((d.macro.investment + d.demography.participation + state.regions.reduce((a, r) => a + r.infrastructure, 0) / state.regions.length) / 3),
  };
  boundDevletDepth(state);
  return state;
}

export function boundDevletDepth(state) {
  const d = state.devletDepth; if (!d) return state;
  d.policy.pending = d.policy.pending.filter(x => x && typeof x.id === "string" && Number.isFinite(x.dueTurn)).slice(-DEVLET_BOUNDS.pending);
  d.policy.resolved = d.policy.resolved.filter(x => x && typeof x.id === "string").slice(-DEVLET_BOUNDS.resolved);
  d.policy.history = d.policy.history.slice(-DEVLET_BOUNDS.policyHistory);
  d.crises.history = d.crises.history.slice(-DEVLET_BOUNDS.crisisHistory);
  d.traces = d.traces.slice(-DEVLET_BOUNDS.traces); d.regionalHistory = d.regionalHistory.slice(-DEVLET_BOUNDS.regionalHistory);
  for (const g of d.groups) g.memory = g.memory.slice(-DEVLET_BOUNDS.groupMemory);
  for (const i of state.institutions) i.memory = i.memory.slice(-DEVLET_BOUNDS.institutionMemory);
  for (const c of d.cadres) c.memory = c.memory.slice(-DEVLET_BOUNDS.actorMemory);
  return state;
}

export function validateDevletDepth(state) {
  if (!state || state.meta?.id !== "tc-sim-devlet" || state.meta.version !== DEVLET_SAVE_VERSION) return false;
  const d = state.devletDepth;
  if (!d || !Array.isArray(d.groups) || d.groups.length !== GROUP_SPECS.length || !Array.isArray(d.policy?.pending)) return false;
  const finite = value => typeof value === "number" ? Number.isFinite(value) : !value || typeof value !== "object" ? true : Object.values(value).every(finite);
  return finite(state);
}
