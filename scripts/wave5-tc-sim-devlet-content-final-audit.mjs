import assert from "node:assert/strict";
import { hydrateDevlet, applyPolicy, tickDevlet } from "../public/games/next-wave/devlet-sim.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";
import {
  CONTENT_EVENTS,
  CHAINS,
  EXTRA_NODES,
  EXTRA_CALLBACKS,
  EXCLUSIVE_PAIRS,
  DOSSIER_TRACE_TEMPLATES,
  eventById,
  applyContentChoice,
  devletContentBag,
  shownBranch,
} from "../public/games/next-wave/devlet-content.js";

const strategies = ["idle", "growth", "fiscal", "social", "institution", "security", "market", "state", "rural", "urban", "balanced", "adaptive"];
const eras = ["1923", "1950", "1980", "2002", "gunumuz", "alternatif"];
const patterns = {
  growth: /sanayi|yatirim|ihrac|buyume|kredi/,
  fiscal: /vergi|butce|mali|imf|istikrar|emisyon/,
  social: /sosyal|konut|yardim|rahat|egitim|maarif|saglik/,
  institution: /kurum|yargi|idare|liyakat|buro|kanun/,
  security: /savun|guven|ordu|sinir|istih/,
  market: /piyasa|ozel|serbest|ithalat|ticaret/,
  state: /kamu|devlet|plan|kamul/,
  rural: /koy|tarim|cift|sulama/,
  urban: /kent|konut|beled|imar/,
};

function policyFor(state, strategy, month) {
  const pool = POLICIES[state.eraId] || [];
  if (strategy === "idle") return null;
  const cadence = strategy === "balanced" ? 4 : strategy === "adaptive" ? 5 : 3;
  if (month % cadence) return null;
  return pool.find((row) => patterns[strategy]?.test(row.id)) || pool[(month + state.meta.seed) % pool.length];
}

const raw = [...CHAINS.flatMap((row) => row.nodes), ...EXTRA_NODES];
const rawIds = raw.map((row) => row.id);
assert.equal(new Set(rawIds).size, rawIds.length, "semantic duplicate event ID");
assert.equal(CONTENT_EVENTS.length, raw.length, "runtime dedupe discarded authored content");

const seen = new Set();
const eligible = new Set();
const started = new Set();
const completed = new Set();
const delayedSeen = new Set();
const traces = new Set();
const branchCoverage = Object.fromEntries(Object.keys(EXCLUSIVE_PAIRS).map((key) => [key, new Set()]));
const periodCounts = {};
const arcCounts = {};
const indexCounts = [0, 0, 0, 0];
const rawById = new Map(raw.map((row) => [row.id, row]));
const naturalDimensions = { institutions: new Set(), groups: new Set(), regions: new Set(), crises: new Set(), forms: new Set() };
const chainActivations = {};
let maxSave = 0;
let authoredActivations = 0;
let months = 0;

function observeActive(state, run, month) {
  const id = state.flags?.contentActive?.eventId;
  if (!id) return;
  const event = eventById(id);
  assert.ok(event, `unknown active content ${id}`);
  seen.add(id);
  authoredActivations += 1;
  periodCounts[state.eraId] = (periodCounts[state.eraId] || 0) + 1;
  arcCounts[event.arc] = (arcCounts[event.arc] || 0) + 1;
  chainActivations[event.chain] = (chainActivations[event.chain] || 0) + 1;
  const authored = rawById.get(id);
  if (authored?.needInst) naturalDimensions.institutions.add(authored.needInst);
  if (authored?.needGroup) naturalDimensions.groups.add(authored.needGroup);
  if (authored?.needRegion) naturalDimensions.regions.add(authored.needRegion);
  if (authored?.needCrisis) naturalDimensions.crises.add(authored.needCrisis);
  if (authored?.form) naturalDimensions.forms.add(authored.form);
  const index = CONTENT_EVENTS.findIndex((row) => row.id === id);
  indexCounts[Math.min(3, Math.floor(index * 4 / CONTENT_EVENTS.length))] += 1;
  if (event.organic) started.add(event.chain);
  else delayedSeen.add(id);
  const choice = event.choices[(run + month) % 4 === 0 ? Math.min(1, event.choices.length - 1) : 0];
  applyContentChoice(state, id, choice.id);
}

for (let run = 0; run < 120; run += 1) {
  const grand = run < 72;
  const era = grand ? "1923" : eras[run % eras.length];
  const state = hydrateDevlet(era, {
    seed: 51001 + run * 97,
    campaign: grand,
    alt: era === "alternatif" && run % 2 ? "socialist" : undefined,
    doctrine: ["muasir", "sanayi", "demokratik", "sosyal", "istikrar", "bagimsiz"][run % 6],
  });
  const limit = grand ? 1400 : 180;
  for (let month = 0; month < limit && !state.flags.campaignEnd; month += 1) {
    months += 1;
    for (const event of CONTENT_EVENTS) {
      if (event.organic && event.organicCheck?.(state)) eligible.add(event.id);
    }
    observeActive(state, run, month);
    const policy = policyFor(state, strategies[run % strategies.length], month);
    if (policy) applyPolicy(state, policy.id);
    tickDevlet(state);
    const store = devletContentBag(state);
    for (const chain of CHAINS) {
      const stage = Number(store.chains[chain.id]) || 0;
      if (stage >= 4 || stage === 9) completed.add(chain.id);
    }
  }
  observeActive(state, run, limit);
  const store = devletContentBag(state);
  for (const family of Object.keys(EXCLUSIVE_PAIRS)) branchCoverage[family].add(shownBranch(state, family));
  for (const row of state.devletDepth?.outcome?.contentTraces || []) traces.add(row.id);
  assert.ok(store.waiting.length <= 16, "content queue cap");
  const size = JSON.stringify(state).length;
  maxSave = Math.max(maxSave, size);
  assert.ok(size < 300000, `save grew to ${size}`);
}

const inbound = new Set();
for (const event of CONTENT_EVENTS) for (const choice of event.choices || []) if (choice.next?.eventId) inbound.add(choice.next.eventId);
const callbacks = new Set(EXTRA_CALLBACKS.map((row) => row.eventId));
const unseen = CONTENT_EVENTS.filter((row) => !seen.has(row.id));
const classified = {
  rareNatural: unseen.filter((row) => row.organic && eligible.has(row.id)).map((row) => row.id),
  exclusiveOrGatedOpening: unseen.filter((row) => row.organic && !eligible.has(row.id)).map((row) => row.id),
  reachableContinuation: unseen.filter((row) => !row.organic && inbound.has(row.id)).map((row) => row.id),
  callback: unseen.filter((row) => !row.organic && callbacks.has(row.id)).map((row) => row.id),
  genuinelyDead: unseen.filter((row) => !row.organic && !inbound.has(row.id) && !callbacks.has(row.id)).map((row) => row.id),
};

for (const [family, branches] of Object.entries(EXCLUSIVE_PAIRS)) {
  for (const branch of branches) assert.ok(branchCoverage[family].has(branch), `${family}/${branch} never selected`);
}
assert.equal(classified.genuinelyDead.length, 0, "genuinely dead authored nodes");
assert.ok(seen.size >= 290, `natural authored coverage ${seen.size}/${CONTENT_EVENTS.length}`);
assert.ok(started.size >= 98, `natural chain starts ${started.size}/${CHAINS.length}`);
assert.ok(completed.size >= 95, `natural chain completions ${completed.size}/${CHAINS.length}`);
assert.ok(delayedSeen.size >= 190, `delayed resolution coverage ${delayedSeen.size}`);
assert.ok(indexCounts.every((count) => count > 0), `array-position starvation ${indexCounts}`);
assert.ok(traces.size >= 18, `dossier template distribution ${traces.size}/${DOSSIER_TRACE_TEMPLATES.length}`);
assert.deepEqual([...naturalDimensions.crises].sort(), ["external", "financial", "inflation", "institutional", "migration", "recession", "trust"]);
assert.equal(naturalDimensions.regions.size, 7, `regional coverage ${[...naturalDimensions.regions]}`);

const delays = [
  ...CONTENT_EVENTS.flatMap((event) => event.choices.map((choice) => choice.next?.dueTurns).filter(Number.isFinite)),
  ...EXTRA_CALLBACKS.map((row) => row.dueTurns),
].sort((a, b) => a - b);
const percentile = (p) => delays[Math.floor((delays.length - 1) * p)];

console.log(JSON.stringify({
  runs: 120,
  grandCampaigns: 72,
  months,
  authored: CONTENT_EVENTS.length,
  rawAuthored: raw.length,
  naturallyEligible: eligible.size,
  naturallySeen: seen.size,
  unseen: unseen.length,
  classification: classified,
  chains: CHAINS.length,
  chainStarted: started.size,
  chainCompleted: completed.size,
  delayedResolved: delayedSeen.size,
  exclusiveCoverage: Object.fromEntries(Object.entries(branchCoverage).map(([key, value]) => [key, [...value].sort()])),
  periodCounts,
  arcCounts,
  naturalDimensions: Object.fromEntries(Object.entries(naturalDimensions).map(([key, value]) => [key, [...value].sort()])),
  maxChainShare: Number((Math.max(...Object.values(chainActivations)) / authoredActivations).toFixed(4)),
  arrayQuartileActivations: indexCounts,
  authoredRatePerMonth: Number((authoredActivations / months).toFixed(4)),
  dossierTemplatesSeen: traces.size,
  dossierTraceIds: [...traces].sort(),
  delayedTiming: { count: delays.length, multiYear: delays.filter((value) => value >= 24).length, min: percentile(0), median: percentile(0.5), p75: percentile(0.75), p90: percentile(0.9), max: percentile(1) },
  maxSaveBytes: maxSave,
}, null, 2));
