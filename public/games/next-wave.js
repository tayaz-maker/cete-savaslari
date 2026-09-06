const NS = "tariklab.nextwave.";
export const VERSION = 1;
export const seeds = (n) => {
  let x = n >>> 0;
  return () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
};
export const rng = seeds;
export const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
export const implementationRate = (s) =>
  clamp(((s.institutions || []).reduce((a, x) => a + (x.capacity || 0), 0) / Math.max(1, (s.institutions || []).length)));

import { SYSTEMS, RESIDENTS, ISSUES, ISSUE_TEMPLATES, MEETINGS, PROPOSALS } from "./next-wave/apartman-data.js";
import { SCENARIOS, MILESTONES, ACTIONS as A100 } from "./next-wave/son100-data.js";
import { MAJORS, SHADOWS } from "./next-wave/hayat-data.js";
import { APPS, CONTACTS, THREADS, DISCOVERABLES, ENDINGS } from "./next-wave/kayip-data.js";
import { PERIODS, POLICIES_2002, EVENTS_2002, COHORTS, REGIONS, GRAND_HOOKS } from "./next-wave/devlet-data.js";

function pushHist(s, row) {
  s.history = (s.history || []).concat(row).slice(-80);
}

function scenarioOf(id) {
  return SCENARIOS.find((x) => x.id === id) || SCENARIOS[0];
}

const defs = {
  apartman: {
    title: "Apartman: Apartman Yöneticisi",
    tag: "Toplantı Gecesi",
    screens: ["Genel", "Sakinler", "Bina", "Aidat/Kasa", "Meseleler", "Toplantı", "Geçmiş"],
    initial: () => ({
      meta: { version: 1, id: "apartman" },
      week: 1,
      building: {
        systems: SYSTEMS.map((x) => x.id),
        condition: 72,
        parts: SYSTEMS.map((x) => ({ id: x.id, name: x.name, condition: x.condition })),
      },
      finance: { cash: 12000, dues: 2400, arrears: 1800 },
      residents: RESIDENTS.map((r) => ({ ...r })),
      issues: ISSUES.map((i) => ({ ...i })),
      meetings: MEETINGS.map((m) => m.id),
      lastMeeting: null,
      openCases: [],
      history: [],
      flags: { meeting: false, cheapPatch: 0 },
      ui: { screen: "Genel" },
    }),
  },
  "son-100-gun": {
    title: "Son 100 Gün",
    tag: "Zaman kıtlığı",
    screens: ["Durum", "Yüküm", "Fırsat", "İlişkiler", "Geçmiş"],
    initial: () => {
      const sc = scenarioOf("financial-recovery");
      return {
        meta: { version: 1, id: "son-100-gun" },
        day: 1,
        remainingDays: 100,
        actionsRemaining: 2,
        scenarioId: sc.id,
        resources: { ...sc.resources },
        relationships: Object.entries(sc.relations).map(([id, value]) => ({ id, value })),
        obligations: sc.obligations.map((o) => ({ ...o, status: "open" })),
        goalProgress: { money: 0, relationship: 0, health: 0, work: 0 },
        missed: [],
        openCases: [],
        history: [],
        flags: { milestones: [], finalReport: false },
        ui: { screen: "Durum" },
      };
    },
  },
  hayat: {
    title: "Hayat",
    tag: "Uzun Gölge",
    screens: ["Hayat", "Karar", "Gölgeler", "Geçmiş"],
    initial: () => ({
      meta: { version: 1, id: "hayat" },
      age: 18,
      chapter: 1,
      turn: 1,
      resources: { energy: 80, money: 1000, health: 90 },
      relationships: [
        { id: "family", value: 50 },
        { id: "friend", value: 48 },
        { id: "romance", value: 40 },
      ],
      commitments: [],
      shadows: [],
      decisionsLog: [],
      openCases: [],
      history: [],
      flags: {},
      ui: { screen: "Hayat" },
    }),
  },
  "kayip-telefon": {
    title: "Kayıp Telefon",
    tag: "Keşif · mahremiyet",
    screens: ["Mesajlar", "Aramalar", "Fotoğraflar", "Notlar", "Takvim", "Rehber", "Dosyalar", "Ses Kayıtları"],
    initial: () => ({
      meta: { version: 1, id: "kayip-telefon" },
      caseId: "lost-phone-01",
      unlockedApps: ["messages", "contacts"],
      discoveredItems: [],
      contacts: CONTACTS.map((c) => ({ id: c.id, name: c.name })),
      threads: THREADS.map((t) => ({ id: t.id, contactId: t.contactId, messages: t.messages.slice() })),
      clues: [],
      hypotheses: [],
      privacyPressure: 0,
      ownerRisk: 0,
      corroboration: [],
      contradiction: [],
      openCases: [],
      timeline: [],
      history: [],
      flags: { ending: null },
      ui: { app: "messages", screen: "Mesajlar" },
    }),
  },
  "tc-sim-devlet": {
    title: "TC SIM: DEVLET",
    tag: "2002–2005 · Mühür Masası",
    screens: ["Durum", "Politika", "Kurumlar", "Arşiv", "Dönemler", "Geçmiş"],
    initial: () => {
      const p = PERIODS["2002"];
      return {
        meta: { version: 1, id: "tc-sim-devlet" },
        time: { year: 2002, month: 1, turn: 1 },
        scenario: { id: "2002-2005" },
        eraId: "2002",
        actual: { inflation: p.economy.inflation, treasury: p.economy.treasury, unemployment: p.economy.unemployment },
        reported: { inflation: p.economy.inflation, treasury: p.economy.treasury, unemployment: p.economy.unemployment },
        known: { inflation: { confidence: 1 }, treasury: { confidence: 1 }, unemployment: { confidence: 0.6 } },
        institutions: p.institutions.map((x) => ({ id: x.id, name: x.name, capacity: x.capacity, autonomy: x.autonomy })),
        characters: [],
        appointments: [],
        cohorts: COHORTS.map((c) => ({ ...c, mood: 50 })),
        regions: REGIONS.map((r) => ({ id: r.id, name: r.name, impl: 50 })),
        networks: [],
        events: [],
        periodPacks: Object.keys(PERIODS),
        grand: GRAND_HOOKS,
        openCases: [],
        archive: [],
        implementationLog: [],
        flags: {},
        history: [],
        ui: { screen: "Durum" },
      };
    },
  },
};

export function create(id) {
  const s = defs[id].initial();
  s.meta.seed = 12345;
  return s;
}
export function validate(s) {
  return !!s && s.meta?.version === 1 && Array.isArray(s.history) && Array.isArray(s.openCases);
}
export function normalize(id, raw) {
  return validate(raw) ? raw : raw ? null : create(id);
}

function rel(s, key, d) {
  const r = (s.relationships || []).find((x) => x.id === key);
  if (r) r.value = clamp(r.value + d);
}

function apartmanVote(s, proposal) {
  const cheap = proposal.id === "cheap-patch";
  const wait = proposal.id === "wait";
  let yes = 0;
  let no = 0;
  for (const r of s.residents) {
    let score = (r.satisfaction - 50) / 20 + r.influence / 200;
    if (!r.pays) score -= 0.35;
    if (!r.owner) score -= 0.1;
    if (cheap) score += r.satisfaction < 55 ? 0.25 : -0.15;
    if (wait) score += r.pays ? -0.2 : 0.15;
    if (s.issues.some((i) => (i.parties || []).includes(r.id))) score += 0.2;
    if (score >= 0) yes += 1;
    else no += 1;
  }
  return { yes, no, accepted: yes > no };
}

function tickApartman(s) {
  s.week += 1;
  const paid = s.residents.filter((r) => r.pays).length;
  s.finance.cash += Math.round((s.finance.dues * paid) / s.residents.length);
  s.finance.arrears += Math.round((s.finance.dues * (s.residents.length - paid)) / s.residents.length);
  for (const p of s.building.parts) {
    p.condition = clamp(p.condition - (s.flags.cheapPatch > 0 && p.id === "asansor" ? 3 : 1), 0, 100);
  }
  s.building.condition = clamp(Math.round(s.building.parts.reduce((a, p) => a + p.condition, 0) / s.building.parts.length));
  if (s.flags.cheapPatch > 0) {
    s.flags.cheapPatch -= 1;
    if (s.flags.cheapPatch === 0) {
      s.issues.push({
        id: "cb_asansor_" + s.week,
        type: "bakım",
        system: "asansor",
        title: "Ucuz asansör yaması tutmadı",
        status: "acik",
        severity: 4,
      });
      pushHist(s, { type: "callback", text: "Ucuz asansör bakımı ikinci haftada ses yaptı." });
    }
  }
  for (const c of s.openCases.slice()) {
    if (typeof c.due === "number" && c.due <= s.week) {
      c.status = "due";
      const el = s.residents.find((r) => !r.pays);
      if (el) el.satisfaction = clamp(el.satisfaction - 6);
    }
  }
  if (s.issues.filter((i) => i.status === "acik").length < 4) {
    const used = new Set(s.issues.map((i) => i.id));
    const next = ISSUE_TEMPLATES.find((t) => !used.has(t.id));
    if (next) s.issues.push({ ...next, status: "acik" });
  }
}

function applySonAction(s, actId) {
  const act = A100.find((a) => a.id === actId) || A100[0];
  s.resources.energy = clamp(s.resources.energy + (act.energy || 0));
  s.resources.money += act.money || 0;
  s.resources.hope = clamp(s.resources.hope + (act.hope || 0));
  if (act.family) rel(s, "family", act.family);
  if (act.friend) rel(s, "friend", act.friend);
  if (act.work) rel(s, "work", act.work);
  if (act.work) s.goalProgress.work += act.work;
  if (act.family || act.friend) s.goalProgress.relationship += 1;
  if (act.money && act.money > 0) s.goalProgress.money += act.money;
  if (act.id === "rest") s.goalProgress.health += 2;
  if (act.risk) s.flags.risk = (s.flags.risk || 0) + act.risk;
  if (act.id === "pay" || act.id === "min") {
    const ob = s.obligations.find((o) => o.status === "open");
    if (ob) {
      ob.status = act.id === "pay" ? "paid" : "min";
      s.resources.money -= Math.max(0, (ob.cost || 0) - 200);
    }
  }
  s.actionsRemaining = Math.max(0, s.actionsRemaining - 1);
  pushHist(s, { type: "act", id: act.id, day: s.day });
}

function sonAdvanceDay(s) {
  s.day += 1;
  s.remainingDays = Math.max(0, s.remainingDays - 1);
  s.actionsRemaining = 2;
  s.resources.energy = clamp(s.resources.energy - 4);
  for (const o of s.obligations) {
    if (o.status === "open") {
      o.due -= 1;
      if (o.due <= 0) {
        o.status = "missed";
        s.missed.push(o.id);
        s.resources.hope = clamp(s.resources.hope - 8);
        s.resources.money -= Math.round((o.cost || 0) * 0.15);
        rel(s, "family", o.domain === "family" || o.domain === "home" ? -6 : -1);
      }
    }
  }
  if (s.obligations.filter((o) => o.status === "open").length < 2 && s.remainingDays > 8) {
    s.obligations.push({
      id: "wave_" + s.day,
      title: s.day % 3 === 0 ? "Fatura" : "Randevu",
      due: 6 + (s.day % 5),
      cost: 120 + (s.day % 7) * 20,
      domain: s.day % 2 ? "money" : "bureaucracy",
      status: "open",
    });
  }
  for (const m of MILESTONES) {
    if (s.remainingDays === m && !(s.flags.milestones || []).includes(m)) {
      s.flags.milestones = (s.flags.milestones || []).concat(m);
      pushHist(s, { type: "milestone", left: m });
    }
  }
  if (s.remainingDays === 0) s.flags.finalReport = true;
  pushHist(s, { type: "day", day: s.day });
}

function hayatApplyChoice(s, choiceKey) {
  const chapterEvents = MAJORS.filter((m) => m.chapter === s.chapter);
  const ev = chapterEvents[s.turn % Math.max(1, chapterEvents.length)] || MAJORS[0];
  const choice = choiceKey || ev.choice || "ambition";
  s.decisionsLog.push({ turn: s.turn, choice, event: ev.id, title: ev.title });
  const tmpl = SHADOWS.find((x) => x.category === ev.shadow) || SHADOWS.find((x) => x.category === "career");
  s.shadows.push({
    id: "shadow_" + s.turn,
    category: tmpl.category,
    createdAt: s.age,
    eligibleFrom: s.age + (tmpl.delay || 3),
    status: "open",
    choice,
    event: ev.id,
  });
  if (choice === "ambition" || choice === "work" || choice === "grind") {
    s.resources.money += 400;
    s.resources.energy -= 15;
  } else if (choice === "give" || choice === "help" || choice === "return") {
    s.resources.money -= 200;
    rel(s, "family", 8);
  } else if (choice === "school") {
    s.resources.money -= 150;
    s.resources.energy -= 8;
  } else {
    s.resources.energy -= 6;
  }
  s.resources.energy = clamp(s.resources.energy);
  s.resources.health = clamp(s.resources.health);
  pushHist(s, { type: "major", choice, title: ev.title });
}

function hayatAdvance(s) {
  s.turn += 1;
  if (s.turn % 4 === 0) s.age += 1;
  s.chapter = Math.min(5, Math.floor((s.age - 18) / 4) + 1);
  const sh = s.shadows.find((x) => x.status === "open" && s.age >= x.eligibleFrom);
  if (sh) {
    sh.status = "resolved";
    const tmpl = SHADOWS.find((x) => x.category === sh.category) || SHADOWS[0];
    const mix = (s.resources.money > 1800 ? 1 : 0) + (s.relationships[0].value > 55 ? 1 : 0);
    sh.outcome = mix >= 2 ? "good" : mix === 1 ? "mix" : "bad";
    sh.text = tmpl[sh.outcome === "good" ? "good" : sh.outcome === "mix" ? "mix" : "bad"];
    if (sh.outcome === "good") s.resources.hope = clamp((s.resources.hope || 50) + 6);
    if (sh.outcome === "bad") s.resources.health = clamp(s.resources.health - 4);
    pushHist(s, { type: "shadow-callback", id: sh.id, text: sh.text, outcome: sh.outcome });
  }
}

function unlockPhoneApps(s) {
  const map = {
    call_leyla: "calls",
    call_emre: "calls",
    call_unknown: "calls",
    photo_cafe: "photos",
    photo_key: "photos",
    photo_bag: "photos",
    photo_ticket: "photos",
    note_pin: "notes",
    note_debt: "notes",
    note_pass: "notes",
    cal_naz: "calendar",
    cal_clinic: "calendar",
    cal_work: "calendar",
    file_pdf: "files",
    file_scan: "files",
    file_chat: "files",
    voice_1: "voice",
    voice_2: "voice",
  };
  for (const id of s.discoveredItems) {
    const app = map[id];
    if (app && !s.unlockedApps.includes(app)) s.unlockedApps.push(app);
  }
  if (s.discoveredItems.length >= 2 && !s.unlockedApps.includes("calls")) s.unlockedApps.push("calls");
  if (s.discoveredItems.length >= 3 && !s.unlockedApps.includes("photos")) s.unlockedApps.push("photos");
  if (s.discoveredItems.length >= 4 && !s.unlockedApps.includes("notes")) s.unlockedApps.push("notes");
  if (s.discoveredItems.length >= 5 && !s.unlockedApps.includes("calendar")) s.unlockedApps.push("calendar");
  if (s.discoveredItems.length >= 6 && !s.unlockedApps.includes("files")) s.unlockedApps.push("files");
  if (s.discoveredItems.length >= 7 && !s.unlockedApps.includes("voice")) s.unlockedApps.push("voice");
}

function phoneDiscover(s, item) {
  if (s.discoveredItems.includes(item)) return;
  s.discoveredItems.push(item);
  s.clues.push(item);
  const spec = DISCOVERABLES.find((d) => d.id === item);
  const extra = spec?.pressure || 8;
  s.privacyPressure = clamp(s.privacyPressure + extra);
  s.ownerRisk = clamp(s.ownerRisk + (spec?.tags?.includes("privacy") ? 10 : 3));
  if (spec?.corroborates) s.corroboration.push({ item, with: spec.corroborates });
  if (spec?.contradicts) s.contradiction.push({ item, with: spec.contradicts });
  s.timeline.push({ item, pressure: s.privacyPressure });
  unlockPhoneApps(s);
  pushHist(s, { type: "discover", item });
}

function phoneEnding(pressure) {
  return pressure < 20 ? "minimal" : pressure < 60 ? "thorough" : "reckless";
}

function devletPolicy(s, policyId) {
  const p = POLICIES_2002.find((x) => x.id === policyId) || POLICIES_2002[0];
  const inst = s.institutions.find((i) => i.id === p.inst);
  const cap = inst ? inst.capacity : 50;
  const rate = clamp((cap / Math.max(40, p.capacityNeed)) * 70);
  s.appointments.push({ id: "policy_" + s.time.turn, kind: p.id === POLICIES_2002[0].id ? "stability" : p.id, institution: p.inst, rate });
  s.implementationLog.push({ turn: s.time.turn, policy: p.id, rate });
  s.flags.pendingPolicy = { id: p.id, rate, inflation: p.inflation, cost: p.cost };
  pushHist(s, { type: "policy", turn: s.time.turn, policy: p.id });
}

function devletAdvance(s) {
  s.time.month += 1;
  if (s.time.month > 12) {
    s.time.month = 1;
    s.time.year += 1;
  }
  s.time.turn += 1;
  const rate = implementationRate(s) / 100;
  const pending = s.flags.pendingPolicy;
  const boost = pending ? pending.rate / 100 : 0;
  s.actual.inflation = clamp(s.actual.inflation * (1 - rate * 0.08 - boost * 0.02), 0, 200);
  if (pending) {
    s.actual.treasury = clamp(s.actual.treasury - pending.cost + rate * 4, 0, 200);
    s.flags.pendingPolicy = null;
  }
  const optimism = 0.9 + rate * 0.2;
  s.reported.inflation = Math.round(s.actual.inflation * optimism);
  s.reported.treasury = Math.round(s.actual.treasury * (0.95 + rate * 0.05));
  s.known.inflation = { confidence: Math.min(1, (s.known.inflation?.confidence || 0) + 0.05) };
  const ev = EVENTS_2002.find((e) => e.year === s.time.year && e.month === s.time.month);
  if (ev) {
    s.events.push({ id: ev.id, title: ev.title });
    s.archive.push({ year: s.time.year, month: s.time.month, rate, event: ev.id, provenance: ev.provenance });
    if (ev.domain === "prices") s.reported.inflation = Math.max(0, s.reported.inflation - 2);
    if (ev.domain === "labor") s.actual.unemployment = clamp((s.actual.unemployment || 10) + 0.3, 0, 40);
  } else {
    s.archive.push({ year: s.time.year, month: s.time.month, rate });
  }
  if (s.time.year > 2005 || (s.time.year === 2005 && s.time.month >= 12)) {
    s.flags.campaignEnd = true;
  }
  pushHist(s, { type: "month", turn: s.time.turn });
}

export function applyAction(id, s, action) {
  if (!s) return null;
  if (typeof action !== "string") return s;
  if (id === "apartman" && action === "meeting") {
    const proposal = s.flags.cheapPatch >= 0 && s.finance.cash < 2000 ? PROPOSALS[1] : PROPOSALS[0];
    const vote = apartmanVote(s, proposal);
    s.flags.meeting = true;
    s.lastMeeting = { type: s.finance.arrears > 2500 ? "aidat-krizi" : "butce", proposal: proposal.id, ...vote, week: s.week };
    if (vote.accepted) {
      s.finance.cash -= proposal.cash;
      s.building.condition = clamp(s.building.condition + proposal.condition);
      const elev = s.building.parts.find((p) => p.id === "asansor");
      if (elev) elev.condition = clamp(elev.condition + proposal.condition);
      if (proposal.id === "cheap-patch") s.flags.cheapPatch = 3;
      s.issues = s.issues.filter((x) => x.id !== "i1");
      s.openCases.push({ id: "followup1", kind: "inspection", due: s.week + 2 });
    }
    pushHist(s, { type: "meeting", proposal: proposal.id, accepted: vote.accepted, yes: vote.yes, no: vote.no });
  } else if (id === "apartman" && action === "advance") {
    tickApartman(s);
  } else if (id === "apartman" && action.startsWith("proposal:")) {
    const proposal = PROPOSALS.find((p) => p.id === action.slice(9)) || PROPOSALS[0];
    const vote = apartmanVote(s, proposal);
    s.flags.meeting = true;
    s.lastMeeting = { type: "acil-onarim", proposal: proposal.id, ...vote, week: s.week };
    if (vote.accepted) {
      s.finance.cash -= proposal.cash;
      s.building.condition = clamp(s.building.condition + proposal.condition);
      if (proposal.id === "cheap-patch") s.flags.cheapPatch = 3;
      s.issues = s.issues.map((i) => (i.status === "acik" && i.system === "asansor" ? { ...i, status: "kapali" } : i));
    }
    pushHist(s, { type: "meeting", proposal: proposal.id, accepted: vote.accepted });
  } else if (id === "son-100-gun" && action === "advance") {
    if (s.actionsRemaining > 0) applySonAction(s, "work");
    sonAdvanceDay(s);
  } else if (id === "son-100-gun" && action.startsWith("act:")) {
    if (s.actionsRemaining > 0 && !s.flags.finalReport) applySonAction(s, action.slice(4));
    if (s.actionsRemaining === 0) sonAdvanceDay(s);
  } else if (id === "son-100-gun" && action.startsWith("scenario:")) {
    const sc = scenarioOf(action.slice(9));
    const fresh = defs["son-100-gun"].initial();
    Object.assign(s, fresh, {
      meta: s.meta,
      scenarioId: sc.id,
      resources: { ...sc.resources },
      relationships: Object.entries(sc.relations).map(([id, value]) => ({ id, value })),
      obligations: sc.obligations.map((o) => ({ ...o, status: "open" })),
    });
  } else if (id === "hayat" && action === "major-choice") {
    hayatApplyChoice(s, "ambition");
  } else if (id === "hayat" && action.startsWith("choose:")) {
    hayatApplyChoice(s, action.slice(7));
  } else if (id === "hayat" && action === "advance") {
    hayatAdvance(s);
  } else if (id === "kayip-telefon" && action.startsWith("discover:")) {
    phoneDiscover(s, action.slice(9));
  } else if (id === "kayip-telefon" && action === "return") {
    s.flags.ending = phoneEnding(s.privacyPressure);
    pushHist(s, { type: "ending", ending: s.flags.ending });
  } else if (id === "tc-sim-devlet" && action === "policy") {
    devletPolicy(s, "imf-sba");
  } else if (id === "tc-sim-devlet" && action.startsWith("policy:")) {
    devletPolicy(s, action.slice(7));
  } else if (id === "tc-sim-devlet" && action === "advance") {
    devletAdvance(s);
  } else if (id === "tc-sim-devlet" && action.startsWith("era:")) {
    const era = PERIODS[action.slice(4)];
    if (era) {
      s.eraId = era.id;
      s.flags.eraPreview = era.id;
      pushHist(s, { type: "era-select", era: era.id, playable: !!era.playable });
    }
  }
  s.history = (s.history || []).slice(-80);
  s.openCases = (s.openCases || []).slice(-40);
  return s;
}

export { defs, SYSTEMS, MEETINGS, SCENARIOS, MAJORS, DISCOVERABLES, PERIODS, POLICIES_2002, ENDINGS, APPS, ISSUE_TEMPLATES };

function h(s) {
  return String(s ?? "")
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">");
}

function panelHtml(id, state) {
  if (!state) return "<p>Yeni oyun ile başla.</p>";
  const screen = state.ui?.screen || "Durum";
  if (id === "apartman") {
    if (screen === "Sakinler") {
      return `<article><h2>Sakinler</h2><ul>${state.residents
        .map(
          (r) =>
            `<li><strong>${h(r.name)}</strong> · ${r.owner ? "malik" : "kiracı"} · kat ${r.floor} · aidat ${r.pays ? "yatıyor" : "gecikmiş"} · memnuniyet ${r.satisfaction}</li>`,
        )
        .join("")}</ul></article>`;
    }
    if (screen === "Bina") {
      return `<article><h2>Bina sistemleri</h2><ul>${state.building.parts
        .map((p) => `<li>${h(p.name)} · ${p.condition}</li>`)
        .join("")}</ul><p>Genel durum ${state.building.condition}</p></article>`;
    }
    if (screen === "Aidat/Kasa") {
      return `<article><h2>Kasa</h2><p>Nakit ${state.finance.cash} TL · aidat ${state.finance.dues} · gecikme ${state.finance.arrears}</p></article>`;
    }
    if (screen === "Meseleler") {
      return `<article><h2>Açık meseleler</h2><ul>${state.issues
        .filter((i) => i.status !== "kapali")
        .map((i) => `<li>${h(i.title || i.type)} · ${i.status}</li>`)
        .join("")}</ul></article>`;
    }
    if (screen === "Toplantı") {
      const m = state.lastMeeting;
      return `<article><h2>Toplantı Gecesi</h2>${
        m
          ? `<p>${h(m.proposal)} · kabul ${m.accepted ? "evet" : "hayır"} · ${m.yes}-${m.no}</p>`
          : "<p>Henüz toplanılmadı.</p>"
      }<p>Altı arketip: bütçe, acil onarım, aidat krizi, anlaşmazlık, güvenoyu, büyük tadilat.</p></article>`;
    }
    if (screen === "Geçmiş") {
      return `<article><h2>Geçmiş</h2><ul>${state.history
        .slice(-12)
        .map((x) => `<li>${h(x.type)} ${h(x.proposal || x.text || "")}</li>`)
        .join("")}</ul></article>`;
    }
    return `<article><h2>Genel</h2><p>Hafta ${state.week}. Kasa ${state.finance.cash} TL. Durum ${state.building.condition}. Açık mesele ${state.issues.filter((i) => i.status === "acik").length}.</p></article>`;
  }
  if (id === "son-100-gun") {
    if (state.flags.finalReport) {
      return `<article><h2>Yüz gün bitti</h2><p>Nakit ${state.resources.money} · umut ${state.resources.hope} · enerji ${state.resources.energy}</p><p>Kaçırılan yüküm: ${state.missed.join(", ") || "yok"}</p><p>Senaryo: ${h(state.scenarioId)}</p></article>`;
    }
    return `<article><h2>${h(screen)}</h2><p>Kalan ${state.remainingDays} gün · bugün ${state.actionsRemaining} hareket</p><p>Enerji ${state.resources.energy} · nakit ${state.resources.money} · umut ${state.resources.hope}</p><ul>${state.obligations
      .filter((o) => o.status === "open")
      .map((o) => `<li>${h(o.title)} · ${o.due} gün · ${o.cost || 0} TL</li>`)
      .join("")}</ul></article>`;
  }
  if (id === "hayat") {
    const open = state.shadows.filter((x) => x.status === "open");
    const done = state.shadows.filter((x) => x.status === "resolved");
    return `<article><h2>${h(screen)}</h2><p>Yaş ${state.age} · bölüm ${state.chapter} · tur ${state.turn}</p><p>Enerji ${state.resources.energy} · nakit ${state.resources.money} · beden ${state.resources.health}</p><h3>Açık gölgeler</h3><ul>${open.map((x) => `<li>${h(x.category)} · ${x.eligibleFrom} yaşında döner</li>`).join("") || "<li>Yok</li>"}</ul><h3>Dönenler</h3><ul>${done.map((x) => `<li>${h(x.text || x.category)}</li>`).join("") || "<li>—</li>"}</ul></article>`;
  }
  if (id === "kayip-telefon") {
    if (state.flags.ending) {
      const e = ENDINGS[state.flags.ending];
      return `<article><h2>${h(e.title)}</h2><p>${h(e.text)}</p><p>Keşif ${state.discoveredItems.length} · mahremiyet ${state.privacyPressure}</p></article>`;
    }
    const threads = state.threads
      .map((t) => {
        const c = state.contacts.find((x) => x.id === t.contactId);
        return `<li><strong>${h(c?.name)}</strong> — ${h(t.messages[t.messages.length - 1])}</li>`;
      })
      .join("");
    return `<article><h2>${h(screen)}</h2><p>Açık uygulamalar: ${state.unlockedApps.join(", ")}</p><p>Keşif ${state.discoveredItems.length} · baskı ${state.privacyPressure} · doğrulama ${state.corroboration.length} · çelişki ${state.contradiction.length}</p><ul>${threads}</ul></article>`;
  }
  if (id === "tc-sim-devlet") {
    const era = PERIODS[state.eraId] || PERIODS["2002"];
    if (screen === "Dönemler") {
      return `<article><h2>Dönem paketleri</h2><ul>${Object.values(PERIODS)
        .map((p) => `<li><strong>${h(p.name)}</strong> · ${p.playable ? "oynanır" : "veri paketi"} — ${h(p.theme)}</li>`)
        .join("")}</ul><p>${h(GRAND_HOOKS.note)}</p></article>`;
    }
    if (screen === "Politika") {
      return `<article><h2>Mühür masası</h2><ul>${POLICIES_2002.map((p) => `<li>${h(p.name)} — ${h(p.intent)}</li>`).join("")}</ul></article>`;
    }
    if (screen === "Kurumlar") {
      return `<article><h2>Kurumlar</h2><ul>${state.institutions.map((i) => `<li>${h(i.name)} · kapasite ${i.capacity}</li>`).join("")}</ul><p>Uygulama oranı ${implementationRate(state).toFixed(0)}</p></article>`;
    }
    if (screen === "Arşiv") {
      return `<article><h2>Arşiv</h2><ul>${state.archive
        .slice(-10)
        .map((a) => `<li>${a.year}-${String(a.month).padStart(2, "0")} · oran ${(a.rate * 100).toFixed(0)} ${a.event ? "· " + a.event : ""}</li>`)
        .join("")}</ul></article>`;
    }
    return `<article><h2>Durum</h2><p>${state.time.year}/${state.time.month} · ${h(era.name)}</p><p>Fiili enflasyon ${state.actual.inflation.toFixed?.(1) ?? state.actual.inflation} · raporlanan ${state.reported.inflation} · güven ${state.known.inflation.confidence}</p><p>Hazine fiili ${state.actual.treasury} · rapor ${state.reported.treasury}</p></article>`;
  }
  return `<article><pre>${h(JSON.stringify(state, null, 2))}</pre></article>`;
}

function render(id) {
  let active = +(localStorage.getItem(NS + id + ".active") || 1);
  const slots = [1, 2, 3].map((n) => {
    try {
      return normalize(id, JSON.parse(localStorage.getItem(NS + id + ".slot" + n)));
    } catch {
      return null;
    }
  });
  let state = slots[active - 1];
  const d = defs[id];
  const nav = (d.screens || ["Durum"]).map((x) => `<button type="button" data-screen="${h(x)}">${h(x)}</button>`).join("");
  document.body.innerHTML = `<main>
    <header><a href="/">← Oyunlar</a><span>TLAB NEXT WAVE</span></header>
    <section class="hero"><p class="eyebrow">${h(d.tag)}</p><h1>${h(d.title)}</h1>
      <p id="status">${state ? "Slot " + active + " hazır" : "Yeni bir kayıt başlat."}</p></section>
    <nav>${nav}</nav>
    <section id="panel"></section>
    <section class="slots"><h2>Kayıt yerleri</h2>${[1, 2, 3]
      .map((n) => `<button type="button" class="slot" data-slot="${n}">Slot ${n} · ${slots[n - 1] ? "dolu" : "boş"}</button>`)
      .join("")}</section>
    <div class="actions">
      <button type="button" id="new">Yeni oyun</button>
      <button type="button" id="save">Kaydet</button>
      <button type="button" id="core">${id === "apartman" ? "Toplantı Gecesi" : id === "kayip-telefon" ? "İncele" : id === "tc-sim-devlet" ? "Politika" : id === "hayat" ? "Büyük karar" : "İş / ilerle"}</button>
      <button type="button" id="alt">${id === "kayip-telefon" ? "İade et" : id === "tc-sim-devlet" ? "Ay ilerle" : id === "apartman" ? "Hafta ilerle" : "İlerle"}</button>
      <button type="button" id="reset">Sıfırla</button>
    </div>
    <details><summary>Nasıl oynanır</summary><p>${helpText(id)}</p></details>
    <footer>© 2026 TarikLab · Tarık Halil Ayaz</footer>
  </main>`;
  const panel = document.querySelector("#panel");
  const show = () => {
    panel.innerHTML = panelHtml(id, state);
  };
  const persist = () => {
    if (state) localStorage.setItem(NS + id + ".slot" + active, JSON.stringify(state));
  };
  document.querySelector("#new").onclick = () => {
    state = create(id);
    slots[active - 1] = state;
    show();
  };
  document.querySelector("#save").onclick = persist;
  document.querySelector("#core").onclick = () => {
    if (!state) return;
    if (id === "apartman") applyAction(id, state, "meeting");
    else if (id === "kayip-telefon") {
      const next = DISCOVERABLES.find((d0) => !state.discoveredItems.includes(d0.id));
      applyAction(id, state, "discover:" + (next?.id || "clue_" + state.discoveredItems.length));
    } else if (id === "tc-sim-devlet") applyAction(id, state, "policy");
    else if (id === "hayat") applyAction(id, state, "major-choice");
    else applyAction(id, state, "advance");
    show();
    persist();
  };
  document.querySelector("#alt").onclick = () => {
    if (!state) return;
    applyAction(id, state, id === "kayip-telefon" ? "return" : "advance");
    show();
    persist();
  };
  document.querySelector("#reset").onclick = () => {
    localStorage.removeItem(NS + id + ".slot" + active);
    render(id);
  };
  document.querySelectorAll("[data-screen]").forEach((b) => {
    b.onclick = () => {
      if (state) {
        state.ui.screen = b.dataset.screen;
        const appMap = {
          Mesajlar: "messages",
          Aramalar: "calls",
          Fotoğraflar: "photos",
          Notlar: "notes",
          Takvim: "calendar",
          Rehber: "contacts",
          Dosyalar: "files",
          "Ses Kayıtları": "voice",
        };
        if (appMap[b.dataset.screen]) state.ui.app = appMap[b.dataset.screen];
        show();
      }
    };
  });
  document.querySelectorAll("[data-slot]").forEach((b) => {
    b.onclick = () => {
      active = +b.dataset.slot;
      localStorage.setItem(NS + id + ".active", String(active));
      render(id);
    };
  });
  show();
}

function helpText(id) {
  if (id === "apartman") return "Aidat, sistem ve sakin gerilimi toplantıda oya döner. Ucuz çözüm sonra geri gelir.";
  if (id === "son-100-gun") return "Günde iki hareket. Yüküm kaçınca şişer. Dört senaryo ayrı başlangıçtır.";
  if (id === "hayat") return "18–35. Büyük karar Uzun Gölge bırakır; yıllar sonra karışık döner.";
  if (id === "kayip-telefon") return "Uygulamalar keşifle açılır. Derin bakış mahremiyet baskısı üretir. Üç iade yolu var.";
  if (id === "tc-sim-devlet") return "Oyuncu devlet organizmasıdır. Niyet ≠ sonuç. Fiili / rapor / bilinen ayrı durur. 2002–2005 oynanır; diğer dönemler veri paketidir.";
  return "Kayıt yerleri yereldir.";
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => render(document.body.dataset.game));
}
