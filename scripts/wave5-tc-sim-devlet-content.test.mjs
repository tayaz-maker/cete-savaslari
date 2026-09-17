import test from "node:test";
import assert from "node:assert/strict";
import { hydrateDevlet, applyPolicy, tickDevlet } from "../public/games/next-wave/devlet-sim.js";
import { previewPolicy, validateDevletDepth, DEVLET_SAVE_VERSION } from "../public/games/next-wave/devlet-depth.js";
import { POLICIES, EVENTS } from "../public/games/next-wave/devlet-data.js";
import { applyAction, normalize } from "../public/games/next-wave.js";
import {
  CONTENT_EVENTS,
  CHAINS,
  EXTRA_NODES,
  EXCLUSIVE_PAIRS,
  EXTRA_CALLBACKS,
  DOSSIER_TRACE_TEMPLATES,
  POLICY_PROSE,
  coverage,
  shownBranch,
  applyContentChoice,
  settleDevletContent,
  processDevletContentMonth,
  decorateDevletDossier,
  scheduleContent,
  takeDueDevletContent,
  overlayCadres,
  devletContentBag,
  eventById,
} from "../public/games/next-wave/devlet-content.js";

const clone = (value) => JSON.parse(JSON.stringify(value));

function finiteTree(value, path = "root") {
  if (value == null) return;
  if (typeof value === "number") {
    assert.ok(Number.isFinite(value), `NaN/Inf at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => finiteTree(item, `${path}[${i}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) finiteTree(item, `${path}.${key}`);
  }
}

function settle(state) {
  if (state.flags?.contentActive?.eventId) {
    const def = eventById(state.flags.contentActive.eventId);
    const choice = def?.choices?.[0];
    if (choice) applyContentChoice(state, def.id, choice.id);
    else settleDevletContent(state);
  }
}

function playMonths(state, n, strategy = "idle") {
  const pool = () => POLICIES[state.eraId] || POLICIES["2002"];
  for (let i = 0; i < n; i += 1) {
    if (state.flags?.campaignEnd) break;
    settle(state);
    const list = pool();
    if (strategy === "competent" && i % 3 === 0 && list[0]) applyPolicy(state, list[0].id);
    if (strategy === "fiscal" && list.find((p) => /tax|imf|budget|vergi|sba/.test(p.id))) {
      applyPolicy(state, list.find((p) => /tax|imf|budget|vergi|sba/.test(p.id)).id);
    }
    if (strategy === "social" && list.find((p) => /relief|social|koy|konut|deprem|agri|tarim/.test(p.id))) {
      applyPolicy(state, list.find((p) => /relief|social|koy|konut|deprem|agri|tarim/.test(p.id)).id);
    }
    if (strategy === "random") applyPolicy(state, list[i % list.length].id);
    if (strategy === "reversal") {
      applyPolicy(state, list[0].id);
      applyPolicy(state, list[1 % list.length].id);
    }
    tickDevlet(state);
  }
  return state;
}

test("Wave 5 DEVLET content coverage floors, unique ids, bilingual nodes", () => {
  const cov = coverage();
  assert.ok(cov.events >= 220, `events ${cov.events}`);
  assert.ok(cov.chains >= 50, `chains ${cov.chains}`);
  assert.ok(cov.delayedCallbacks >= 120, `delayed ${cov.delayedCallbacks}`);
  assert.ok(cov.exclusive >= 12, `exclusive ${cov.exclusive}`);
  assert.ok(cov.dossierTraces >= 20, `traces ${cov.dossierTraces}`);
  assert.ok(cov.cadreProfiles >= 20, `cadres ${cov.cadreProfiles}`);
  assert.equal(cov.formFlavor, 7);
  assert.ok(cov.longTerm >= 20, `long ${cov.longTerm}`);
  assert.ok(cov.institution >= 80, `institution ${cov.institution}`);
  assert.ok(cov.group >= 80, `group ${cov.group}`);
  assert.ok(cov.period >= 60, `period ${cov.period}`);
  assert.ok(cov.region >= 50, `region ${cov.region}`);
  assert.ok(cov.government >= 40, `gov ${cov.government}`);
  assert.ok(cov.media >= 35, `media ${cov.media}`);
  assert.ok(cov.external >= 35, `external ${cov.external}`);
  assert.ok(cov.cadre >= 30, `cadre ${cov.cadre}`);
  assert.ok(cov.fiscal >= 30, `fiscal ${cov.fiscal}`);
  assert.ok(cov.development >= 25, `dev ${cov.development}`);
  assert.ok(cov.crisisChains >= 25, `crisis chains ${cov.crisisChains}`);
  assert.ok(cov.form >= 20, `form ${cov.form}`);
  assert.ok(cov.intelligence >= 8, `intel ${cov.intelligence}`);
  const ids = CONTENT_EVENTS.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate event id");
  const rawNodes = [...CHAINS.flatMap((row) => row.nodes), ...EXTRA_NODES];
  const rawIds = rawNodes.map((row) => row.id);
  assert.equal(new Set(rawIds).size, rawIds.length, "pre-dedupe authored event id collision");
  assert.equal(CONTENT_EVENTS.length, rawNodes.length, "runtime dedupe must not discard authored nodes");
  const chainIds = CHAINS.map((row) => row.id);
  assert.equal(new Set(chainIds).size, chainIds.length, "duplicate chain id");
  const callbackKeys = EXTRA_CALLBACKS.map((row) => row.key);
  assert.equal(new Set(callbackKeys).size, callbackKeys.length, "duplicate callback key");
  const callbackEvents = EXTRA_CALLBACKS.map((row) => row.eventId);
  for (const id of callbackEvents) assert.ok(eventById(id), `missing extra ${id}`);
  for (const event of CONTENT_EVENTS) {
    assert.ok(event.choices.length >= 2, event.id);
    assert.ok(event.en?.title && event.en?.text, event.id);
    assert.ok(!String(event.title).includes("undefined"), event.id);
    assert.ok(!String(event.text).includes("[object"), event.id);
    assert.match(event.id, /^dc_/);
  }
  for (const [family, branches] of Object.entries(EXCLUSIVE_PAIRS)) {
    assert.equal(branches.length, 2, family);
    const siblings = CHAINS.filter((row) => row.exclusive === family);
    assert.ok(siblings.length >= 2, family);
    assert.deepEqual([...new Set(siblings.map((row) => row.branch))].sort(), [...branches].sort());
  }
  const nextIds = [];
  for (const event of CONTENT_EVENTS) {
    for (const choice of event.choices) {
      if (choice.next?.eventId) {
        nextIds.push(choice.next.eventId);
        assert.ok(eventById(choice.next.eventId), `broken continuation ${event.id} -> ${choice.next.eventId}`);
        assert.ok(choice.next.key, event.id);
      }
    }
  }
  assert.equal(DEVLET_SAVE_VERSION, 2);
  assert.equal(POLICIES["2002"].length, 48);
  assert.equal(EVENTS["2002"].length, 62);
  assert.ok(Object.keys(POLICY_PROSE).length >= 70, "policy prose");
});

test("all 77 policy briefs are complete and mapped to their real period", () => {
  const policies = Object.entries(POLICIES).flatMap(([period, rows]) => rows.map((row) => ({ period, ...row })));
  assert.equal(policies.length, 77);
  assert.equal(new Set(policies.map((row) => row.id)).size, 77);
  assert.deepEqual(Object.keys(POLICY_PROSE).sort(), policies.map((row) => row.id).sort());
  for (const policy of policies) {
    const prose = POLICY_PROSE[policy.id];
    assert.equal(prose.period, policy.period, `${policy.id} period`);
    for (const field of ["rationale", "groups", "short", "medium", "long", "risk", "reversal", "trace"]) {
      assert.ok(typeof prose[field] === "string" && prose[field].trim().length >= 3, `${policy.id}.${field}`);
      assert.ok(!/undefined|\[object Object\]|TR,EN/.test(prose[field]), `${policy.id}.${field} render`);
    }
    assert.ok(policy.inst && Number.isFinite(policy.cost) && Number.isFinite(policy.capacityNeed), `${policy.id} mechanics`);
  }
});

test("authored political content stays systemic and non-operational", () => {
  const corpus = CONTENT_EVENTS.flatMap((event) => [event.title, event.text, event.en?.title, event.en?.text, ...event.choices.flatMap((choice) => [choice.label, event.en?.choices?.[choice.id]])]).join("\n");
  assert.doesNotMatch(corpus, /\b(AKP|CHP|MHP|DEM Parti|İYİ Parti|Recep Tayyip Erdoğan|Kemal Kılıçdaroğlu|Ekrem İmamoğlu)\b/i);
  assert.doesNotMatch(corpus, /(darbe nasıl|gizli gözetim yöntemi|sabotaj talimatı|şiddet yöntemi|how to stage a coup|surveillance instructions)/i);
});

test("all 107 authored chain openings have a satisfiable natural gate", () => {
  for (const chain of CHAINS) {
    const node = chain.nodes.find((row) => row.organic);
    assert.ok(node, `${chain.id} has no organic opening`);
    const rawEra = [].concat(node.era || chain.era || ["2002"])[0];
    const era = rawEra === "grand" ? "1923" : rawEra;
    const state = hydrateDevlet(era, { seed: 97001, campaign: Boolean(node.campaign || rawEra === "grand") });
    const store = devletContentBag(state);
    store.chains[chain.id] = node.needStage || 0;
    if (chain.exclusive) store.exclusive[chain.exclusive] = chain.branch;
    state.time.turn = Math.max(1, node.minTurn || 1);
    if (node.maxTurn) state.time.turn = Math.min(state.time.turn, node.maxTurn);
    if (node.form) {
      state.form = node.form;
      state.devletDepth.forms.dominant = node.form;
    }
    if (node.needCrisis) state.devletDepth.crises.active = [{ id: `fixture:${chain.id}`, family: node.needCrisis }];
    if (node.forbidCrisis) state.devletDepth.crises.active = [];
    if (node.needInst) {
      let row = state.institutions.find((item) => item.id === node.needInst);
      if (!row) {
        row = { id: node.needInst, name: node.needInst, capacity: 50, professionalism: 50, autonomy: 50, trust: 50, fatigue: 10, memory: [] };
        state.institutions.push(row);
      }
      if (node.minCapacity) row.capacity = node.minCapacity;
      if (node.maxCapacity) row.capacity = node.maxCapacity;
      if (node.minFatigue) row.fatigue = node.minFatigue;
      if (node.maxTrust) row.trust = node.maxTrust;
    }
    if (node.needGroup) {
      const row = state.devletDepth.groups.find((item) => item.id === node.needGroup);
      assert.ok(row, `${chain.id} missing group fixture ${node.needGroup}`);
      if (node.minPressure) row.pressure = node.minPressure;
      if (node.maxSatisfaction) row.satisfaction = node.maxSatisfaction;
    }
    if (node.needRegion) {
      const row = state.regions.find((item) => item.id === node.needRegion);
      assert.ok(row, `${chain.id} missing region fixture ${node.needRegion}`);
      if (node.maxServices) row.services = node.maxServices;
      if (node.minUnemp) row.unemployment = node.minUnemp;
      if (node.minHeat) row.heat = node.minHeat;
    }
    if (node.minInflation) state.actual.inflation = node.minInflation;
    if (node.minHeat && !node.needRegion) state.heat = node.minHeat;
    if (node.minDebt) state.devletDepth.macro.publicDebt = node.minDebt;
    if (node.minEntropy) state.entropy = node.minEntropy;
    if (node.minFragmentation) state.devletDepth.media.fragmentation = node.minFragmentation;
    if (node.minEnergy) state.devletDepth.world.energyPressure = node.minEnergy;
    if (node.needCadre && !state.devletDepth.cadres.some((row) => row.institution === node.needCadre)) {
      state.devletDepth.cadres.push({ institution: node.needCadre, competence: 50, professionalism: 50, expertise: 50, crisisResilience: 50, reliability: 50, networkRisk: 20, memory: [] });
    }
    const event = CONTENT_EVENTS.find((row) => row.id === node.id);
    assert.ok(event?.organicCheck(state), `unsatisfiable opening ${chain.id}/${node.id}`);
  }
});

test("dossier cap preserves route and dynamic traces without first-array starvation", () => {
  const observed = new Set();
  for (let seed = 1; seed <= 96; seed += 1) {
    const state = hydrateDevlet("gunumuz", { seed });
    const store = devletContentBag(state);
    for (const family of Object.keys(EXCLUSIVE_PAIRS)) shownBranch(state, family);
    state.devletDepth.crises.history.push({ id: `crisis:${seed}`, family: "trust" });
    state.institutions[0].memory = [{ turn: 1, type: "fixture" }];
    state.devletDepth.government.terms = 2;
    state.devletDepth.world.energyPressure = 80;
    state.networks[0].pressure = 60;
    state.regions[0].services = 30;
    store.once["seen:dc_x_water_loss"] = 3;
    store.once["seen:dc_x_brief"] = 4;
    decorateDevletDossier(state);
    const traces = state.devletDepth.outcome.contentTraces;
    assert.ok(traces.length <= 8);
    assert.equal(new Set(traces.map((row) => row.id)).size, traces.length);
    assert.ok(traces.some((row) => DOSSIER_TRACE_TEMPLATES.slice(0, 12).some((item) => item.id === row.id)));
    assert.ok(traces.some((row) => DOSSIER_TRACE_TEMPLATES.slice(12).some((item) => item.id === row.id)));
    for (const row of traces) observed.add(row.id);
    const loaded = normalize("tc-sim-devlet", clone(state));
    decorateDevletDossier(loaded);
    assert.deepEqual(loaded.devletDepth.outcome.contentTraces, traces);
  }
  assert.equal(observed.size, DOSSIER_TRACE_TEMPLATES.length, "all authored trace templates should surface across campaigns");
});

test("exclusive siblings never co-appear and both branches exist across seeds", () => {
  const seen = {};
  for (const family of Object.keys(EXCLUSIVE_PAIRS)) seen[family] = new Set();
  for (let seed = 1; seed <= 24; seed += 1) {
    const state = hydrateDevlet("2002", { seed });
    for (const family of Object.keys(EXCLUSIVE_PAIRS)) {
      const branch = shownBranch(state, family);
      seen[family].add(branch);
      const store = devletContentBag(state);
      assert.equal(store.exclusive[family], branch);
      const loaded = normalize("tc-sim-devlet", clone(state));
      assert.equal(shownBranch(loaded, family), branch);
    }
  }
  for (const [family, branches] of Object.entries(EXCLUSIVE_PAIRS)) {
    for (const branch of branches) assert.ok(seen[family].has(branch), `${family} missing ${branch}`);
  }
  const a = hydrateDevlet("1923", { seed: 3 });
  const tighten = shownBranch(a, "fiscal-path");
  const openings = CONTENT_EVENTS.filter((row) => row.organic && row.exclusive === "fiscal-path" && row.organicCheck(a));
  assert.ok(openings.every((row) => row.branch === tighten));
});

test("delayed continuations fire once and skip missing institutions", () => {
  const state = hydrateDevlet("1923", { seed: 21 });
  const ok = scheduleContent(state, { eventId: "dc_p23_iskan2", dueTurns: 1, key: "walk-iskan2" });
  assert.equal(ok, true);
  const again = scheduleContent(state, { eventId: "dc_p23_iskan2", dueTurns: 1, key: "walk-iskan2" });
  assert.equal(again, false);
  state.time.turn += 2;
  const due = takeDueDevletContent(state);
  assert.equal(due, "dc_p23_iskan2");
  const due2 = takeDueDevletContent(state);
  assert.equal(due2, null);

  const drop = hydrateDevlet("1923", { seed: 22 });
  assert.equal(scheduleContent(drop, { eventId: "dc_x_brief", dueTurns: 1, key: "brief-drop" }, { expectedInst: "istikhbarat" }), true);
  drop.time.turn += 2;
  assert.equal(takeDueDevletContent(drop), null);

  const fire = hydrateDevlet("1923", { seed: 23 });
  fire.flags.contentActive = null;
  applyContentChoice(fire, "dc_p23_iskan", "place");
  const waiting = devletContentBag(fire).waiting.find((row) => row.eventId === "dc_p23_iskan2");
  assert.ok(waiting);
  fire.time.turn = waiting.dueTurn;
  fire.flags.contentActive = null;
  processDevletContentMonth(fire);
  assert.equal(fire.flags.contentActive?.eventId, "dc_p23_iskan2");
});

test("content choices do not consume the two policy slots", () => {
  const state = hydrateDevlet("2002", { seed: 44 });
  const before = state.flags.decisionsRemaining;
  const event = CONTENT_EVENTS.find((row) => row.organic && row.era === "2002") || CONTENT_EVENTS[0];
  applyContentChoice(state, event.id, event.choices[0].id);
  assert.equal(state.flags.decisionsRemaining, before);
  applyPolicy(state, "imf-sba");
  assert.equal(state.flags.decisionsRemaining, before - 1);
});

test("cadre overlay is flavor-only and old v2 saves hydrate", () => {
  const state = hydrateDevlet("2002", { seed: 9 });
  const competence = state.devletDepth.cadres.map((row) => row.competence);
  overlayCadres(state);
  assert.deepEqual(state.devletDepth.cadres.map((row) => row.competence), competence);
  assert.ok(state.devletDepth.cadres.every((row) => row.name && !String(row.name).endsWith("kadrosu") || row.name));
  assert.ok(state.devletDepth.cadres.some((row) => row.profileId));

  const raw = hydrateDevlet("2002", { seed: 11 });
  delete raw.devletDepth.content;
  const loaded = normalize("tc-sim-devlet", clone(raw));
  assert.ok(loaded);
  assert.equal(validateDevletDepth(loaded), true);
  assert.ok(loaded.devletDepth.content);
  finiteTree(loaded);
});

test("advance without a content choice does not soft-lock", () => {
  const state = hydrateDevlet("1950", { seed: 31 });
  const active = state.flags.contentActive;
  assert.ok(active?.eventId);
  applyAction("tc-sim-devlet", state, "advance");
  assert.equal(state.flags.contentActive?.eventId === active.eventId, false);
  finiteTree(state);
});

test("engine regression: 2002 policy/event freeze, entropy channel still moves", () => {
  assert.equal(POLICIES["2002"].length, 48);
  assert.equal(EVENTS["2002"].length, 62);
  const idle = hydrateDevlet("2002", { seed: 8500, campaign: true });
  idle.entropy = 80;
  const competent = hydrateDevlet("2002", { seed: 8500, campaign: true });
  competent.entropy = 80;
  playMonths(idle, 36, "idle");
  playMonths(competent, 36, "competent");
  assert.ok(competent.entropy < idle.entropy || competent.entropy < 80, "competent should not lose the recovery channel");
  finiteTree(idle);
  finiteTree(competent);
});

test("preview fidelity and determinism with content layer", () => {
  const a = hydrateDevlet("2002", { seed: 77 });
  const b = hydrateDevlet("2002", { seed: 77 });
  const policy = POLICIES["2002"][0];
  assert.deepEqual(previewPolicy(a, policy).rate, previewPolicy(b, policy).rate);
  playMonths(a, 18, "idle");
  playMonths(b, 18, "idle");
  assert.equal(a.entropy, b.entropy);
  assert.equal(a.heat, b.heat);
  assert.deepEqual(a.devletDepth.content.exclusive, b.devletDepth.content.exclusive);
});

test("content-bearing campaigns: 72 mixed runs stay finite, exclusive, bounded", () => {
  const eras = ["1923", "1950", "1980", "2002", "gunumuz", "alternatif"];
  const strategies = ["idle", "competent", "fiscal", "social", "random", "reversal"];
  const seen = new Set();
  const families = new Set();
  let maxSave = 0;
  for (let i = 0; i < 72; i += 1) {
    const era = eras[i % eras.length];
    const strategy = strategies[i % strategies.length];
    const campaign = i % 9 === 0;
    const state = hydrateDevlet(era === "alternatif" ? "alternatif" : era, {
      seed: 4000 + i * 17,
      campaign,
      alt: era === "alternatif" ? "federal" : undefined,
    });
    playMonths(state, campaign ? 180 : 96, strategy);
    finiteTree(state);
    assert.equal(validateDevletDepth(state), true);
    const store = devletContentBag(state);
    assert.ok(store.waiting.length <= 16);
    const json = JSON.stringify(state);
    maxSave = Math.max(maxSave, json.length);
    assert.ok(json.length < 300000, `save ${json.length}`);
    for (const event of state.events || []) if (String(event.id).startsWith("dc_")) seen.add(event.id);
    for (const [family, branch] of Object.entries(store.exclusive || {})) {
      families.add(family);
      const allowed = EXCLUSIVE_PAIRS[family];
      if (allowed) assert.ok(allowed.includes(branch), `${family} ${branch}`);
    }
    const reloaded = normalize("tc-sim-devlet", clone(state));
    assert.ok(reloaded);
    assert.equal(reloaded.devletDepth.content.exclusive["fiscal-path"] || null, store.exclusive["fiscal-path"] || null);
  }
  assert.ok(seen.size >= 40, `unique seen ${seen.size}`);
  assert.ok(maxSave < 300000);
});
