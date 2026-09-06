const NS = "tariklab.nextwave.";
export const VERSION = 1;
export const seeds = (n) => {
  let x = n >>> 0;
  return () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296);
};
export const rng = seeds;
export const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
export const implementationRate = (s) => {
  const inst = s.institutions || [];
  const cap = inst.reduce((a, x) => a + (x.capacity || 0), 0) / Math.max(1, inst.length);
  if (s.dna || s.entropy != null) {
    const entropy = s.entropy || 0;
    const heat = s.heat || 0;
    const instDna = s.dna?.institutionalism || 50;
    const info = s.infoQuality || 50;
    return clamp(cap - entropy * 0.18 - heat * 0.12 + (instDna - 50) * 0.12 + (info - 50) * 0.08);
  }
  return clamp(cap);
};

import { SYSTEMS, RESIDENTS, ISSUES, ISSUE_TEMPLATES, MEETINGS, PROPOSALS } from "./next-wave/apartman-data.js";
import { SCENARIOS, MILESTONES, ACTIONS as A100 } from "./next-wave/son100-data.js";
import { MAJORS, SHADOWS } from "./next-wave/hayat-data.js";
import { APPS, CONTACTS, THREADS, DISCOVERABLES, ENDINGS } from "./next-wave/kayip-data.js";
import { PERIODS, POLICIES_2002, EVENTS_2002, COHORTS, REGIONS, GRAND_HOOKS, POLICIES, EVENTS as DEVLET_EVENTS } from "./next-wave/devlet-data.js";
import {
  hydrateDevlet,
  applyPolicy as devletPolicyApply,
  tickDevlet,
  tickDevletN,
  applyAlt,
  applyDoctrine,
  finiteState,
  DOCTRINES,
  ALT_PRESETS,
  GUNUMUZ_BASELINE,
} from "./next-wave/devlet-sim.js";

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
    tag: "Devlet organizması · dönemler",
    screens: ["Durum", "Politika", "Kurumlar", "DNA", "Arşiv", "Dönemler", "Kelebekler", "Geçmiş"],
    initial: () => hydrateDevlet("2002"),
  },
};

export function create(id) {
  const s = defs[id].initial();
  s.meta.seed = 12345;
  return s;
}
export function validate(s, id) {
  if (!s || s.meta?.version !== 1) return false;
  if (!Array.isArray(s.history) || !Array.isArray(s.openCases)) return false;
  // A save only belongs to the game that wrote it. Without this an apartman
  // payload validated cleanly as a hayat save and would have been fed to the
  // wrong engine.
  if (id && s.meta?.id !== id) return false;
  return true;
}
export function normalize(id, raw) {
  return validate(raw, id) ? raw : raw ? null : create(id);
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
    const other = s.shadows.filter((x) => x.status === "resolved").length;
    const mix = (s.resources.money > 1800 ? 1 : 0) + (s.relationships[0].value > 55 ? 1 : 0) + (other >= 2 ? 1 : 0);
    sh.outcome = mix >= 2 ? "good" : mix === 1 ? "mix" : "bad";
    sh.text = tmpl[sh.outcome === "good" ? "good" : sh.outcome === "mix" ? "mix" : "bad"];
    if (other >= 1) sh.combined = true;
    if (sh.outcome === "good") s.resources.hope = clamp((s.resources.hope || 50) + 6);
    if (sh.outcome === "bad") s.resources.health = clamp(s.resources.health - 4);
    pushHist(s, { type: "shadow-callback", id: sh.id, text: sh.text, outcome: sh.outcome, combined: !!sh.combined });
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

function phoneEnding(s) {
  const pressure = s.privacyPressure;
  const sawId = s.discoveredItems.some((x) => ["file_scan", "note_pass"].includes(x));
  if (s.corroboration.length >= 3 && pressure < 70 && !sawId) return "witness";
  return pressure < 20 ? "minimal" : pressure < 60 ? "thorough" : "reckless";
}

function devletPolicy(s, policyId) {
  return devletPolicyApply(s, policyId);
}

function devletAdvance(s) {
  return tickDevlet(s);
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
    // Explicit "skip to next day": forfeits any unused action(s) for today.
    // This used to also sneak in one free "work" action before advancing, so
    // every "advance" press (which is what the UI's only action button sent)
    // silently consumed the day's first action AND ended the day in the same
    // click - the two-actions-per-day contract could never be exercised.
    // Day 100 is the end of the run. Without the finalReport guard the final
    // report stayed on screen while further presses kept advancing the day
    // counter (101 -> 121) and kept missing obligations after the game was over.
    if (!s.flags.finalReport) sonAdvanceDay(s);
  } else if (id === "son-100-gun" && action.startsWith("act:")) {
    if (s.actionsRemaining > 0 && !s.flags.finalReport) applySonAction(s, action.slice(4));
    if (s.actionsRemaining === 0 && !s.flags.finalReport) sonAdvanceDay(s);
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
    s.flags.ending = phoneEnding(s);
    pushHist(s, { type: "ending", ending: s.flags.ending });
  } else if (id === "tc-sim-devlet" && action === "policy") {
    devletPolicy(s, "imf-sba");
  } else if (id === "tc-sim-devlet" && action.startsWith("policy:")) {
    devletPolicy(s, action.slice(7));
  } else if (id === "tc-sim-devlet" && action === "advance") {
    devletAdvance(s);
  } else if (id === "tc-sim-devlet" && action.startsWith("era:")) {
    const eraId = action.slice(4);
    if (PERIODS[eraId]) {
      const keepMeta = s.meta;
      Object.assign(s, hydrateDevlet(eraId), { meta: keepMeta });
      pushHist(s, { type: "era-select", era: eraId, playable: true });
    }
  } else if (id === "tc-sim-devlet" && action === "campaign:grand") {
    const keepMeta = s.meta;
    Object.assign(s, hydrateDevlet("1923", { campaign: true }), { meta: keepMeta });
    pushHist(s, { type: "campaign", mode: "hedefsiz" });
  } else if (id === "tc-sim-devlet" && action.startsWith("campaign:")) {
    const doctrine = action.slice(9);
    const keepMeta = s.meta;
    Object.assign(s, hydrateDevlet("1923", { campaign: true, doctrine }), { meta: keepMeta });
    pushHist(s, { type: "campaign", mode: "hedefli", doctrine });
  } else if (id === "tc-sim-devlet" && action.startsWith("doctrine:")) {
    applyDoctrine(s, action.slice(9));
  } else if (id === "tc-sim-devlet" && action.startsWith("alt:")) {
    const keepMeta = s.meta;
    Object.assign(s, hydrateDevlet("alternatif", { alt: action.slice(4) }), { meta: keepMeta });
  } else if (id === "tc-sim-devlet" && action.startsWith("tick:")) {
    tickDevletN(s, Number(action.slice(5)) || 0);
  }
  s.history = (s.history || []).slice(-80);
  s.openCases = (s.openCases || []).slice(-40);
  return s;
}

export { defs, SYSTEMS, MEETINGS, SCENARIOS, MAJORS, DISCOVERABLES, PERIODS, POLICIES_2002, ENDINGS, APPS, ISSUE_TEMPLATES, hydrateDevlet, tickDevletN, DOCTRINES, ALT_PRESETS, POLICIES, finiteState, GUNUMUZ_BASELINE, SHADOWS, CONTACTS, RESIDENTS };

function h(s) {
  // Every replacement here used to map a character to itself, so the whole
  // helper was a no-op and nothing rendered through innerHTML was escaped.
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
    if (screen === "Yüküm") {
      return `<article><h2>Yüküm</h2><ul>${state.obligations.map((o) => `<li>${h(o.title)} · ${o.status} · ${o.due}</li>`).join("")}</ul></article>`;
    }
    return `<article><h2>${h(screen)}</h2><p>Kalan ${state.remainingDays} gün · bugün ${state.actionsRemaining} hareket · ${h(state.scenarioId)}</p><p>Enerji ${state.resources.energy} · nakit ${state.resources.money} · umut ${state.resources.hope}</p><ul>${state.obligations
      .filter((o) => o.status === "open")
      .map((o) => `<li>${h(o.title)} · ${o.due} gün · ${o.cost || 0} TL</li>`)
      .join("")}</ul><p>${SCENARIOS.length} ayrı senaryo.</p></article>`;
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
    const pool = (POLICIES[state.eraId] || POLICIES_2002);
    if (screen === "Dönemler") {
      return `<article><h2>Başlangıçlar</h2><ul>${Object.values(PERIODS)
        .map((p) => `<li><strong>${h(p.name)}</strong> · oynanır — ${h(p.theme)}</li>`)
        .join("")}</ul>
        <p>Büyük kampanya ${GRAND_HOOKS.span} · ${GRAND_HOOKS.months} ay. Hedefsiz veya doktrinli.</p>
        <p>Günümüz tabanı ${GUNUMUZ_BASELINE.year}-${String(GUNUMUZ_BASELINE.month).padStart(2, "0")} (kilitli).</p></article>`;
    }
    if (screen === "Politika") {
      return `<article><h2>Mühür masası</h2><ul>${pool.map((p) => `<li>${h(p.name)} — ${h(p.intent)}</li>`).join("")}</ul>
        <p>Niyet ≠ sonuç. Uygulama ${implementationRate(state).toFixed(0)}.</p></article>`;
    }
    if (screen === "Kurumlar") {
      return `<article><h2>Kurumlar</h2><ul>${state.institutions.map((i) => `<li>${h(i.name)} · kapasite ${i.capacity} · özerklik ${i.autonomy ?? "—"}</li>`).join("")}</ul>
        <p>Form ${h(state.form)} · entropi ${state.entropy} · ısı ${state.heat}</p></article>`;
    }
    if (screen === "DNA") {
      const dna = state.dna || {};
      return `<article><h2>Devlet DNA / refleks</h2><ul>${Object.entries(dna).map(([k, v]) => `<li>${h(k)} ${v}</li>`).join("")}</ul>
        <p>Refleks: ${(state.reflexes || []).join(", ")}</p>
        <p>Kim devlet: merkez ${state.kimDevlet?.center} · sokak ${state.kimDevlet?.street}</p>
        <p>Bilgi kalitesi ${state.infoQuality} · sinir: ${(state.nervous?.channels || []).join(", ")}</p></article>`;
    }
    if (screen === "Arşiv") {
      return `<article><h2>Arşiv / dosya</h2><ul>${(state.archive || [])
        .slice(-8)
        .map((a) => `<li>${a.year}-${String(a.month).padStart(2, "0")} · ${(a.rate * 100).toFixed(0)} ${a.event ? "· " + a.event : ""} ${a.provenance || ""}</li>`)
        .join("")}</ul>
        <p>Dosyalar: ${(state.files || []).map((f) => f.status).join(", ") || "yok"}</p>
        <p>Hayalet: ${(state.ghosts || []).slice(-2).map((g) => h(g.text)).join(" / ") || "—"}</p></article>`;
    }
    if (screen === "Kelebekler") {
      return `<article><h2>Kelebekler / yol</h2><ul>${(state.butterflies || []).slice(-8).map((b) => `<li>${h(b.from)} — ${h(b.text)}</li>`).join("") || "<li>Henüz yok</li>"}</ul>
        <p>Politika borcu konut ${state.policyDebt?.housing} · eğitim ${state.policyDebt?.education}</p>
        <p>Doktrin ${h(state.scenario?.doctrineName || "hedefsiz")}</p></article>`;
    }
    if (screen === "Geçmiş") {
      // Real consumer for the meaningful record. Before the heartbeat rows were
      // dropped from history this screen could only ever have shown "month".
      const rows = (state.history || []).slice(-14).reverse();
      const label = {
        "period-transition": "dönem geçişi",
        policy: "mühür",
        "file-return": "dosya yeniden açıldı",
        doctrine: "doktrin",
        campaign: "kampanya",
        "era-select": "dönem seçimi",
        alt: "alternatif",
      };
      return `<article><h2>Geçmiş</h2><ul>${
        rows
          .map((r) => {
            const when = r.year ? `${r.year}${r.month ? "/" + r.month : ""} · ` : "";
            const what = h(label[r.type] || r.type);
            const detail = h(r.policy || r.era || r.id || r.mode || "");
            return `<li>${when}${what}${detail ? " · " + detail : ""}</li>`;
          })
          .join("") || "<li>Defter henüz boş.</li>"
      }</ul>
        <p>Kayıtlı ay: ${(state.archive || []).length} · yıl özeti: ${(state.yearDigest || []).length} · nesil: ${(state.generations || []).length}</p></article>`;
    }
    // The player is the state, and a state does not read its own ledger — it
    // reads what was reported to it. `actual` is simulation truth and stays out
    // of the panel; the divergence is the game.
    const conf = (k) => {
      const c = state.known?.[k]?.confidence;
      return typeof c === "number" ? c.toFixed(2) : "—";
    };
    const ended = state.flags?.campaignEnd;
    return `<article class="era-${h(state.ui?.flavor || era.flavor)}"><h2>Durum</h2>
      <p>${state.time.year}/${state.time.month} · ${h(era.name)} · ${state.scenario?.campaign ? "büyük kampanya" : "dönem"}${ended ? " · kapandı" : ""}</p>
      <p>Rapor edilen enflasyon ${state.reported.inflation} · güven ${conf("inflation")}</p>
      <p>Rapor edilen hazine ${state.reported.treasury} · güven ${conf("treasury")} · işsizlik ${state.reported.unemployment} · güven ${conf("unemployment")}</p>
      <p>Uygulama ${implementationRate(state).toFixed(0)} · form ${h(state.form)} · entropi ${Number(state.entropy).toFixed(0)}</p>
      ${
        ended
          ? `<h3>Defter kapandı</h3><p>${state.scenario?.campaign ? "1923→2030 kampanyası" : h(era.name) + " dönemi"} ${state.time.year}/${state.time.month} itibarıyla bitti. Doktrin ${h(state.scenario?.doctrineName || "hedefsiz")}.</p>
             <p>Dönem geçişi ${(state.history || []).filter((x) => x.type === "period-transition").length} · hayalet ${(state.ghosts || []).length} · nesil ${(state.generations || []).length} · yıl özeti ${(state.yearDigest || []).length}</p>`
          : ""
      }</article>`;
  }
  return `<article><pre>${h(JSON.stringify(state, null, 2))}</pre></article>`;
}

let releaseLanguageListener;

function render(id, draft) {
  releaseLanguageListener?.();
  let active = +(localStorage.getItem(NS + id + ".active") || 1);
  const slots = [1, 2, 3].map((n) => {
    try {
      const raw = localStorage.getItem(NS + id + ".slot" + n);
      return raw === null ? null : normalize(id, JSON.parse(raw));
    } catch {
      return null;
    }
  });
  let state = draft === undefined ? slots[active - 1] : draft;
  const d = defs[id];
  const nav = (d.screens || ["Durum"]).map((x) => `<button type="button" data-screen="${h(x)}">${h(loc(x))}</button>`).join("");
  document.body.innerHTML = `<main>
    <header><a href="/">${h(loc("← Oyunlar"))}</a><span>TLAB NEXT WAVE</span></header>
    <section class="hero"><p class="eyebrow">${h(loc(d.tag))}</p><h1>${h(d.title)}</h1>
      <p id="status">${state ? loc("Slot") + " " + active + " " + (window.tlabI18n?.getLang?.() === "en" ? "ready" : "hazır") : h(loc("Yeni bir kayıt başlat."))}</p></section>
    <nav>${nav}</nav>
    <section id="panel"></section>
    <section class="slots"><h2>${h(loc("Kayıt yerleri"))}</h2>${[1, 2, 3]
      .map((n) => `<button type="button" class="slot" data-slot="${n}">${h(loc("Slot"))} ${n} · ${slots[n - 1] ? h(loc("dolu")) : h(loc("boş"))}</button>`)
      .join("")}</section>
    <div class="actions">
      <button type="button" id="new">${h(loc("Yeni oyun"))}</button>
      <button type="button" id="save">${h(loc("Kaydet"))}</button>
      <button type="button" id="core">${h(loc(id === "apartman" ? "Toplantı Gecesi" : id === "kayip-telefon" ? "İncele" : id === "tc-sim-devlet" ? "Politika" : id === "hayat" ? "Büyük karar" : "İş / ilerle"))}</button>
      <button type="button" id="alt">${h(loc(id === "kayip-telefon" ? "İade et" : id === "tc-sim-devlet" ? "Ay ilerle" : id === "apartman" ? "Hafta ilerle" : "İlerle"))}</button>
      <button type="button" id="reset">${h(loc("Sıfırla"))}</button>
    </div>
    ${id === "tc-sim-devlet" ? `<div class="actions" id="starts">${["1923", "1950", "1980", "2002", "gunumuz", "alternatif"].map((e) => `<button type="button" data-era="${e}">${e}</button>`).join("")}<button type="button" data-era="grand">1923→2030</button><button type="button" data-era="hedefli">Hedefli</button></div>` : ""}
    ${id === "son-100-gun" ? `<div class="actions" id="scen">${SCENARIOS.map((sc) => `<button type="button" data-sc="${sc.id}">${h(loc(sc.name))}</button>`).join("")}</div>` : ""}
    <details><summary>${h(loc("Nasıl oynanır"))}</summary><p>${helpText(id)}</p></details>
    <footer>© 2026 TarikLab · Tarık Halil Ayaz</footer>
  </main>`;
  const I18 = typeof window !== "undefined" ? window.tlabI18n : null;
  if (I18) {
    I18.applyHtmlLang();
    const header = document.querySelector("header");
    if (header) I18.mountLangToggle(header);
  }
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
    // "act:work" spends one of today's two action slots and only advances the
    // day itself once both are used (see applyAction's act: handler) - unlike
    // plain "advance", which is the explicit skip-the-rest-of-today button.
    else if (id === "son-100-gun") applyAction(id, state, "act:work");
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
  document.querySelectorAll("[data-era]").forEach((b) => {
    b.onclick = () => {
      if (!state) state = create(id);
      const v = b.dataset.era;
      if (v === "grand") applyAction(id, state, "campaign:grand");
      else if (v === "hedefli") applyAction(id, state, "campaign:istikrar");
      else applyAction(id, state, "era:" + v);
      show();
      persist();
    };
  });
  document.querySelectorAll("[data-sc]").forEach((b) => {
    b.onclick = () => {
      if (!state) state = create(id);
      applyAction(id, state, "scenario:" + b.dataset.sc);
      show();
      persist();
    };
  });
  show();
  if (I18) releaseLanguageListener = I18.onLang(() => render(id, state));
}

function loc(text) {
  const I = typeof window !== "undefined" ? window.tlabI18n : null;
  if (!I) return text;
  return I.phrase(text);
}

function helpText(id) {
  const I = typeof window !== "undefined" ? window.tlabI18n : null;
  if (I && I.getLang() === "en") {
    return I.HELP_EN[id] || I.HELP_EN.fallback;
  }
  if (id === "apartman") return "Aidat, sistem ve sakin gerilimi toplantıda oya döner. Ucuz çözüm sonra geri gelir.";
  if (id === "son-100-gun") return "Günde iki hareket. On altı senaryo ayrı başlangıç ve yükümdür. Hep iş veya hep dinlen yetmez.";
  if (id === "hayat") return "18–35. Büyük karar Uzun Gölge bırakır; gölgeler birleşebilir.";
  if (id === "kayip-telefon") return "Uygulamalar keşifle açılır. Doğrulama ve çelişki ayrı yollar üretir.";
  if (id === "tc-sim-devlet") return "Oyuncu devlet organizmasıdır. Niyet ≠ sonuç. Fiili / rapor / bilinen ayrı durur. 1923, 1950, 1980, 2002, Günümüz, Alternatif ve 1923–2030 kampanyası oynanır.";
  return "Kayıt yerleri yereldir.";
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    const id = document.body.dataset.game;
    render(id);
  });
}
