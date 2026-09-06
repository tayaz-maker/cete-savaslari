/**
 * DEVLET simulation kernel — period starts, monthly tick, signature systems.
 * Player = state organism. Intent ≠ field result.
 */
import {
  PERIODS,
  POLICIES,
  EVENTS,
  COHORTS,
  REGIONS,
  NETWORKS,
  DOCTRINES,
  ALT_PRESETS,
  PERIOD_BANDS,
  DNA_AXES,
  DEBT_DOMAINS,
  FOREIGN_AXES,
  GRAND_HOOKS,
  GUNUMUZ_BASELINE,
} from "./devlet-data.js";

export { DOCTRINES, ALT_PRESETS, DNA_AXES, GRAND_HOOKS, GUNUMUZ_BASELINE, PERIOD_BANDS };

export const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

export function implementationRate(s) {
  const inst = s.institutions || [];
  const cap = inst.reduce((a, x) => a + (x.capacity || 0), 0) / Math.max(1, inst.length);
  const entropy = s.entropy || 0;
  const heat = s.heat || 0;
  const instDna = s.dna?.institutionalism || 50;
  const info = s.infoQuality || 50;
  return clamp(cap - entropy * 0.18 - heat * 0.12 + (instDna - 50) * 0.12 + (info - 50) * 0.08);
}

function eraOfYear(year) {
  const band = PERIOD_BANDS.find((b) => year >= b.from && year <= b.to);
  return band ? band.era : year < 1923 ? "1923" : "gunumuz";
}

function policiesOf(eraId) {
  return POLICIES[eraId] || POLICIES["2002"];
}

function eventsOf(eraId) {
  return EVENTS[eraId] || [];
}

function defaultForeign() {
  const o = {};
  for (const k of FOREIGN_AXES) o[k] = 50;
  return o;
}

function defaultDebt() {
  const o = {};
  for (const k of DEBT_DOMAINS) o[k] = 20;
  return o;
}

export function hydrateDevlet(eraId, opts = {}) {
  const era = PERIODS[eraId] || PERIODS["2002"];
  const start = era.start || { year: 2002, month: 1 };
  const campaign = !!opts.campaign;
  const doctrine = DOCTRINES.find((d) => d.id === opts.doctrine) || null;
  const alt = ALT_PRESETS.find((a) => a.id === opts.alt) || null;
  const dna = { ...era.dna };
  if (doctrine) {
    for (const [k, v] of Object.entries(doctrine.prefer)) {
      if (k in dna) dna[k] = clamp(dna[k] + v);
    }
  }
  if (alt?.dna) {
    for (const [k, v] of Object.entries(alt.dna)) dna[k] = clamp(v);
  }
  const economy = { ...era.economy, ...(alt?.economy || {}) };
  return {
    meta: { version: 1, id: "tc-sim-devlet" },
    time: { year: start.year, month: start.month, turn: 1 },
    scenario: {
      id: campaign ? "1923-2030" : era.id === "2002" ? "2002-2005" : era.id,
      campaign,
      doctrine: doctrine?.id || null,
      doctrineName: doctrine?.name || null,
      alt: alt?.id || null,
    },
    eraId: era.id,
    actual: {
      inflation: economy.inflation,
      treasury: economy.treasury,
      unemployment: economy.unemployment,
      fx: economy.fx,
      debt: economy.debt,
      industry: economy.industry,
      agri: economy.agri,
      energy: economy.energy,
      externalDep: economy.externalDep,
    },
    reported: {
      inflation: economy.inflation,
      treasury: economy.treasury,
      unemployment: economy.unemployment,
    },
    known: {
      inflation: { confidence: era.infoQuality / 100 },
      treasury: { confidence: era.infoQuality / 100 },
      unemployment: { confidence: Math.max(0.3, era.infoQuality / 140) },
    },
    institutions: era.institutions.map((x) => ({ ...x })),
    characters: [],
    appointments: [],
    generations: [{ id: "g0", year: start.year, note: "açılış kohortu" }],
    cohorts: COHORTS.map((c) => ({ ...c, mood: 52 - Math.round(era.heat / 8), trust: 50 })),
    regions: REGIONS.map((r) => ({ id: r.id, name: r.name, impl: Math.round(50 * r.implMod), heat: era.heat })),
    networks: NETWORKS.map((n) => ({ ...n })),
    foreign: { ...defaultForeign(), ...(alt?.foreign || {}) },
    events: [],
    periodPacks: Object.keys(PERIODS),
    grand: { ...GRAND_HOOKS, active: campaign, endYear: campaign ? 2030 : era.id === "2002" ? 2005 : start.year + 8 },
    dna,
    reflexes: era.reflexes.slice(),
    form: alt?.form || era.form,
    kimDevlet: { center: dna.centralization, networks: 30, street: era.heat, capital: dna.market },
    entropy: era.entropy,
    infoQuality: era.infoQuality,
    nervous: { channels: era.channels.slice(), lag: Math.round((100 - era.infoQuality) / 12) },
    policyDebt: defaultDebt(),
    path: [],
    memoryState: [],
    memoryPublic: [],
    butterflies: [],
    attraction: 70,
    ghosts: [],
    files: [],
    media: [{ id: "official", reach: 60, trust: era.infoQuality, tone: "resmi" }, { id: "street", reach: 40, trust: 35, tone: "söylenti" }],
    rumor: 20,
    heat: era.heat,
    procurement: { quality: 50, delay: 20, graftRisk: 18 },
    openCases: [],
    archive: [],
    yearDigest: [],
    implementationLog: [],
    flags: { baseline: era.id === "gunumuz" ? GUNUMUZ_BASELINE : null },
    history: [],
    ui: { screen: "Durum", flavor: era.flavor },
  };
}

function pushBounded(arr, row, cap) {
  arr.push(row);
  if (arr.length > cap) arr.splice(0, arr.length - cap);
}

function applyDnaDelta(s, delta) {
  if (!delta) return;
  s.dna = s.dna || {};
  for (const [k, v] of Object.entries(delta)) {
    if (k === "entropy") {
      s.entropy = clamp((s.entropy || 40) + v);
      continue;
    }
    if (DNA_AXES.includes(k)) s.dna[k] = clamp((s.dna[k] || 50) + v);
  }
}

export function applyPolicy(s, policyId) {
  const pool = policiesOf(s.eraId);
  const p = pool.find((x) => x.id === policyId) || pool[0];
  if (!p) return s;
  const inst = s.institutions.find((i) => i.id === p.inst);
  const cap = inst ? inst.capacity : 50;
  const rate = clamp((cap / Math.max(30, p.capacityNeed)) * 70 - (s.entropy || 0) * 0.1);
  s.appointments.push({ id: "policy_" + s.time.turn, kind: p.id === pool[0].id ? "stability" : p.id, institution: p.inst, rate });
  if (s.appointments.length > 40) s.appointments.splice(0, s.appointments.length - 40);
  pushBounded(s.implementationLog, { turn: s.time.turn, policy: p.id, rate }, 48);
  s.flags.pendingPolicy = { id: p.id, rate, inflation: p.inflation, cost: p.cost, trust: p.trust };
  applyDnaDelta(s, p.dna);
  const domain = p.inst === "belediye" ? "housing" : p.inst === "maarif" ? "education" : p.inst === "maliye" ? "infra" : "legal";
  if (p.cost >= 8) s.policyDebt[domain] = clamp((s.policyDebt[domain] || 20) - 4);
  else if (p.id.includes("relief") || p.id.includes("rahat")) s.policyDebt.housing = clamp((s.policyDebt.housing || 20) + 3);
  pushBounded(s.path, { turn: s.time.turn, policy: p.id, era: s.eraId }, 36);
  pushBounded(s.butterflies, { turn: s.time.turn, from: p.id, text: p.intent }, 24);
  pushBounded(s.history, { type: "policy", turn: s.time.turn, policy: p.id }, 80);
  return s;
}

function pickEvent(s) {
  const list = eventsOf(s.eraId);
  if (!list.length) return null;
  const exact = list.find((e) => (e.year ? e.year === s.time.year : true) && e.month === s.time.month);
  if (exact) return exact;
  if (s.time.month % 4 === 0) return list[s.time.turn % list.length];
  return null;
}

function maybeTransition(s) {
  if (!s.scenario?.campaign) return;
  const next = eraOfYear(s.time.year);
  if (next !== s.eraId && PERIODS[next]) {
    const era = PERIODS[next];
    s.eraId = next;
    s.ui.flavor = era.flavor;
    s.nervous.channels = era.channels.slice();
    for (const inst of era.institutions) {
      const cur = s.institutions.find((i) => i.id === inst.id);
      if (cur) {
        cur.capacity = clamp(Math.round(cur.capacity * 0.7 + inst.capacity * 0.3));
        cur.name = inst.name;
      } else s.institutions.push({ ...inst });
    }
    s.ghosts.push({ year: s.time.year, from: "transition", text: era.name + " bandına geçildi. Eski kadro alışkanlığı duruyor." });
    if (s.ghosts.length > 16) s.ghosts.splice(0, s.ghosts.length - 16);
    pushBounded(s.history, { type: "period-transition", era: next, year: s.time.year }, 80);
  }
}

export function tickDevlet(s) {
  s.time.month += 1;
  if (s.time.month > 12) {
    s.time.month = 1;
    s.time.year += 1;
    pushBounded(
      s.yearDigest,
      {
        year: s.time.year - 1,
        inflation: Math.round(s.actual.inflation),
        heat: s.heat,
        entropy: s.entropy,
        form: s.form,
        era: s.eraId,
      },
      120,
    );
    if (s.time.year % 25 === 0) {
      pushBounded(s.generations, { id: "g" + s.generations.length, year: s.time.year, note: "nesil kaydı" }, 8);
    }
  }
  s.time.turn += 1;
  const rate = implementationRate(s) / 100;
  const pending = s.flags.pendingPolicy;
  const boost = pending ? pending.rate / 100 : 0;
  s.actual.inflation = clamp(s.actual.inflation * (1 - rate * 0.06 - boost * 0.02) + (s.heat - 40) * 0.01, 0, 220);
  s.actual.unemployment = clamp((s.actual.unemployment || 10) + (pending && pending.cost > 8 ? -0.05 : 0.02) - rate * 0.04, 0, 40);
  s.actual.treasury = clamp((s.actual.treasury || 50) - (pending ? pending.cost : 1) + rate * 3, 0, 220);
  if (pending) s.flags.pendingPolicy = null;
  const lag = s.nervous?.lag || 1;
  const optimism = 0.88 + rate * 0.18 - (100 - (s.infoQuality || 50)) / 400;
  s.reported.inflation = Math.round(s.actual.inflation * optimism);
  s.reported.treasury = Math.round(s.actual.treasury * (0.94 + rate * 0.05));
  s.reported.unemployment = Math.round((s.actual.unemployment || 10) * (0.9 + (s.infoQuality || 50) / 500));
  s.known.inflation = { confidence: Math.min(1, (s.known.inflation?.confidence || 0.4) + 0.02 - lag * 0.002) };
  s.entropy = clamp((s.entropy || 40) + (s.appointments.length > 20 ? 0.15 : 0.02) - rate * 0.05);
  s.heat = clamp((s.heat || 40) + ((s.actual.unemployment || 10) - 8) * 0.05 + (s.actual.inflation > 40 ? 0.2 : -0.05) - (pending?.trust || 0) * 0.05);
  s.rumor = clamp((s.rumor || 20) + (s.infoQuality < 45 ? 0.3 : -0.1));
  s.infoQuality = clamp((s.infoQuality || 50) + (s.dna?.institutionalism - 50) * 0.01 - s.rumor * 0.01);
  const formScore = {
    security: s.dna.security,
    bureau: s.dna.institutionalism,
    capital: s.dna.market,
    street: s.heat,
  };
  const top = Object.entries(formScore).sort((a, b) => b[1] - a[1])[0][0];
  s.form =
    top === "security" && s.dna.security > 70
      ? "Kışla-Devlet"
      : top === "capital" && s.dna.market > 65
        ? "Sermaye-Devlet"
        : s.heat > 70
          ? "Popülist-Devlet"
          : s.entropy > 70
            ? "Boş Kabuk"
            : "Bürokrasi-Devlet";
  s.kimDevlet = {
    center: s.dna.centralization,
    networks: s.networks.reduce((a, n) => a + n.pressure, 0) / Math.max(1, s.networks.length),
    street: s.heat,
    capital: s.dna.market,
  };
  for (const d of DEBT_DOMAINS) {
    if (s.time.month === 1) s.policyDebt[d] = clamp((s.policyDebt[d] || 20) + 0.4);
  }
  const ev = pickEvent(s);
  if (ev) {
    pushBounded(s.events, { id: ev.id, title: ev.title, year: s.time.year, month: s.time.month }, 36);
    if (ev.domain === "prices") s.reported.inflation = Math.max(0, s.reported.inflation - 2);
    if (ev.domain === "labor") s.actual.unemployment = clamp((s.actual.unemployment || 10) + 0.3, 0, 40);
    if (ev.domain === "heat") s.heat = clamp(s.heat + 4);
    if (ev.domain === "info") s.infoQuality = clamp(s.infoQuality - 3);
    if (ev.contested) pushBounded(s.files, { id: ev.id, status: "open", year: s.time.year, contested: true }, 20);
    else if (s.time.turn % 18 === 0) pushBounded(s.files, { id: "f" + s.time.turn, status: "sleeping", year: s.time.year }, 20);
    pushBounded(s.memoryState, { year: s.time.year, text: ev.title, voice: "resmi" }, 24);
    pushBounded(s.memoryPublic, { year: s.time.year, text: ev.voices?.halk || ev.text, voice: "halk" }, 24);
    pushBounded(s.archive, { year: s.time.year, month: s.time.month, rate, event: ev.id, provenance: ev.provenance, contested: !!ev.contested }, 36);
  } else {
    pushBounded(s.archive, { year: s.time.year, month: s.time.month, rate }, 36);
  }
  if (s.files.some((f) => f.status === "sleeping") && s.time.month === 6) {
    const f = s.files.find((x) => x.status === "sleeping");
    if (f) {
      f.status = "reopened";
      pushBounded(s.history, { type: "file-return", id: f.id, year: s.time.year }, 80);
    }
  }
  s.attraction = clamp(70 - Math.abs(s.time.year - (PERIODS[s.eraId]?.start?.year || s.time.year)) * 0.15);
  maybeTransition(s);
  const endYear = s.grand?.endYear || 2005;
  if (s.time.year > endYear || (s.time.year === endYear && s.time.month >= 12)) {
    s.flags.campaignEnd = true;
  }
  pushBounded(s.history, { type: "month", turn: s.time.turn, year: s.time.year, month: s.time.month }, 80);
  s.openCases = (s.openCases || []).slice(-24);
  return s;
}

export function tickDevletN(s, n) {
  const cap = Math.max(0, n | 0);
  for (let i = 0; i < cap; i += 1) {
    if (s.flags.campaignEnd && i > 0 && s.scenario?.campaign && s.time.year >= 2030) break;
    s.flags.campaignEnd = false;
    tickDevlet(s);
  }
  return s;
}

export function applyAlt(s, altId) {
  const alt = ALT_PRESETS.find((a) => a.id === altId);
  if (!alt) return s;
  s.scenario.alt = alt.id;
  if (alt.form) s.form = alt.form;
  if (alt.dna) applyDnaDelta(s, Object.fromEntries(Object.entries(alt.dna).map(([k, v]) => [k, v - (s.dna[k] || 50)])));
  if (alt.foreign) s.foreign = { ...s.foreign, ...alt.foreign };
  if (alt.economy) {
    for (const [k, v] of Object.entries(alt.economy)) s.actual[k] = v;
  }
  pushBounded(s.history, { type: "alt", id: alt.id }, 80);
  return s;
}

export function applyDoctrine(s, doctrineId) {
  const d = DOCTRINES.find((x) => x.id === doctrineId);
  if (!d) return s;
  s.scenario.doctrine = d.id;
  s.scenario.doctrineName = d.name;
  applyDnaDelta(s, d.prefer);
  pushBounded(s.history, { type: "doctrine", id: d.id }, 80);
  return s;
}

export function finiteState(s) {
  const walk = (v) => {
    if (typeof v === "number") return Number.isFinite(v);
    if (!v || typeof v !== "object") return true;
    if (Array.isArray(v)) return v.every(walk);
    return Object.values(v).every(walk);
  };
  return walk(s);
}
