export const VERSION = 1;
export const seeds = (n) => {
  let x = n >>> 0;
  return () => (x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 4294967296;
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

import {
  SYSTEMS,
  RESIDENTS,
  ISSUES,
  ISSUE_TEMPLATES,
  MEETINGS,
  PROPOSALS,
} from "./next-wave/apartman-data.js";
import {
  SCENARIOS,
  MILESTONES,
  ACTIONS as A100,
  EVENTS as SON_EVENTS,
} from "./next-wave/son100-data.js";
import { MAJORS, SHADOWS } from "./next-wave/hayat-data.js";
import { APPS, CONTACTS, THREADS, DISCOVERABLES, ENDINGS } from "./next-wave/kayip-data.js";
import { PERIODS, POLICIES_2002, POLICIES } from "./next-wave/devlet-data.js";
import {
  hydrateDevlet,
  applyPolicy as devletPolicyApply,
  tickDevlet,
  tickDevletN,
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
      residents: RESIDENTS.map((r) => ({ ...r, memory: [] })),
      issues: ISSUES.map((i) => ({ ...i })),
      meetings: MEETINGS.map((m) => m.id),
      lastMeeting: null,
      openCases: [],
      history: [],
      flags: { meeting: false, cheapPatch: 0, cheapCount: 0, duesHikes: 0, financeWeek: 0 },
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
        opportunities: [
          {
            id: SON_EVENTS[0].id,
            title: SON_EVENTS[0].title,
            expiresOn: 1 + (SON_EVENTS[0].window || 3),
            choices: SON_EVENTS[0].choices,
            domain: SON_EVENTS[0].domain,
            status: "open",
          },
        ],
        goalProgress: { money: 0, relationship: 0, health: 0, work: 0 },
        missed: [],
        openCases: [],
        history: [],
        flags: { milestones: [], finalReport: false, workStreak: 0 },
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
      playerName: "İsimsiz",
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
      ui: { screen: "decisions" },
    }),
  },
  "kayip-telefon": {
    title: "Kayıp Telefon",
    tag: "Keşif · mahremiyet",
    screens: [
      "Mesajlar",
      "Aramalar",
      "Fotoğraflar",
      "Notlar",
      "Takvim",
      "Rehber",
      "Dosyalar",
      "Ses Kayıtları",
    ],
    initial: () => ({
      meta: { version: 1, id: "kayip-telefon" },
      caseId: "lost-phone-01",
      unlockedApps: ["messages", "contacts"],
      discoveredItems: [],
      contacts: CONTACTS.map((c) => ({ id: c.id, name: c.name })),
      threads: THREADS.map((t) => ({
        id: t.id,
        contactId: t.contactId,
        messages: t.messages.slice(),
      })),
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
  if (!validate(raw, id)) return raw ? null : create(id);
  if (id === "hayat") {
    raw.playerName =
      typeof raw.playerName === "string" && raw.playerName.trim()
        ? raw.playerName.trim().slice(0, 28)
        : "İsimsiz";
    raw.ui ||= {};
    const screens = ["decisions", "me", "path", "money", "people", "home", "shadows", "history"];
    if (!screens.includes(raw.ui.screen)) raw.ui.screen = "decisions";
  }
  return raw;
}

function rel(s, key, d) {
  const r = (s.relationships || []).find((x) => x.id === key);
  if (r) r.value = clamp(r.value + d);
}

function apartmanVote(s, proposal) {
  const cheap = proposal.id === "cheap-patch";
  const wait = proposal.id === "wait";
  const hike = proposal.id === "raise-dues";
  let yes = 0;
  let no = 0;
  for (const r of s.residents) {
    let score = (r.satisfaction - 50) / 20 + r.influence / 200;
    if (!r.pays) score -= 0.35;
    if (!r.owner) score -= 0.1;
    if (cheap) score += r.satisfaction < 55 ? 0.25 : -0.15;
    if (wait) score += r.pays ? -0.2 : 0.15;
    if (hike) score += r.owner ? -0.1 : -0.35;
    if ((r.memory || []).includes("cheap-patch") && cheap) score -= 0.35;
    if ((r.memory || []).includes("raise-dues") && hike) score -= 0.5;
    if (s.issues.some((i) => (i.parties || []).includes(r.id))) score += 0.2;
    if (score >= 0) yes += 1;
    else no += 1;
  }
  return { yes, no, accepted: yes > no };
}

function applyApartmanProposal(s, proposal, meetingType) {
  if (s.flags.meetingWeek === s.week) return { ...(s.lastMeeting || {}), duplicate: true };
  const vote = apartmanVote(s, proposal);
  s.flags.meeting = true;
  s.flags.meetingWeek = s.week;
  s.lastMeeting = { type: meetingType, proposal: proposal.id, ...vote, week: s.week };
  for (const r of s.residents) {
    r.memory = (r.memory || []).concat(proposal.id).slice(-6);
  }
  const financeOnce = s.flags.financeWeek !== s.week;
  if (vote.accepted) {
    if (financeOnce) {
      s.finance.cash -= proposal.cash || 0;
      s.flags.financeWeek = s.week;
    }
    s.building.condition = clamp(s.building.condition + (proposal.condition || 0));
    const targetSys =
      proposal.id === "raise-dues"
        ? null
        : s.issues.find((i) => i.status === "acik" && i.system)?.system || "asansor";
    const part = targetSys && s.building.parts.find((p) => p.id === targetSys);
    if (part) part.condition = clamp(part.condition + (proposal.condition || 0));
    if (proposal.id === "cheap-patch") {
      s.flags.cheapPatch = 3;
      s.flags.cheapSystem = targetSys || "asansor";
      s.flags.cheapCount = (s.flags.cheapCount || 0) + 1;
    }
    if (proposal.id === "raise-dues") {
      s.finance.dues += proposal.duesDelta || 350;
      s.flags.duesHikes = (s.flags.duesHikes || 0) + 1;
      for (const r of s.residents) r.satisfaction = clamp(r.satisfaction - (r.pays ? 8 : 4));
    }
    if (proposal.id === "durable-maintenance") {
      s.issues = s.issues.map((i) =>
        i.status === "acik" && i.system === (targetSys || "asansor")
          ? { ...i, status: "kapali" }
          : i,
      );
    }
    if (proposal.id === "cheap-patch") {
      s.issues = s.issues.map((i) =>
        i.status === "acik" && i.system === "asansor" ? { ...i, status: "kapali" } : i,
      );
    }
    s.openCases.push({
      id: "followup_" + s.week,
      kind: "inspection",
      due: s.week + 2,
      system: targetSys || "asansor",
    });
  }
  pushHist(s, {
    type: "meeting",
    proposal: proposal.id,
    accepted: vote.accepted,
    yes: vote.yes,
    no: vote.no,
  });
  return vote;
}

function tickApartman(s) {
  s.week += 1;
  s.flags.meeting = false;
  s.flags.prepared = [];
  s.flags.focusIssue = null;
  const paid = s.residents.filter((r) => r.pays).length;
  s.finance.cash += Math.round((s.finance.dues * paid) / s.residents.length);
  s.finance.arrears += Math.round(
    (s.finance.dues * (s.residents.length - paid)) / s.residents.length,
  );
  const cheapSys = s.flags.cheapSystem || "asansor";
  for (const p of s.building.parts) {
    const extra = s.flags.cheapPatch > 0 && p.id === cheapSys ? 2 + (s.flags.cheapCount || 0) : 0;
    p.condition = clamp(p.condition - (1 + extra), 0, 100);
  }
  s.building.condition = clamp(
    Math.round(s.building.parts.reduce((a, p) => a + p.condition, 0) / s.building.parts.length),
  );
  if (s.flags.cheapPatch > 0) {
    s.flags.cheapPatch -= 1;
    if (s.flags.cheapPatch === 0) {
      const sys = cheapSys;
      s.issues.push({
        id: "cb_" + sys + "_" + s.week,
        type: "bakım",
        system: sys,
        title: sys === "asansor" ? "Ucuz asansör yaması tutmadı" : "Ucuz yama tutmadı",
        status: "acik",
        severity: 4,
      });
      pushHist(s, {
        type: "callback",
        text: "Ucuz asansör bakımı ikinci haftada ses yaptı.",
        system: sys,
      });
      const remember = s.residents.filter((r) => (r.memory || []).includes("cheap-patch"));
      for (const r of remember) r.satisfaction = clamp(r.satisfaction - 5);
    }
  }
  if ((s.flags.duesHikes || 0) >= 2 && !s.flags.duesRevolt) {
    s.flags.duesRevolt = true;
    for (const r of s.residents) {
      if (r.pays && r.satisfaction < 50) r.pays = false;
      r.satisfaction = clamp(r.satisfaction - 6);
    }
    s.issues.push({
      id: "aidat-isyan-" + s.week,
      type: "aidat",
      title: "Aidat isyanı: liste asılsın deniyor",
      status: "acik",
      severity: 4,
    });
    pushHist(s, { type: "callback", text: "Üst üste aidat artışı ödemeyi durdurdu." });
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
  if (act.id === "work") s.flags.workStreak = (s.flags.workStreak || 0) + 1;
  else s.flags.workStreak = 0;
  if ((s.flags.workStreak || 0) >= 4) {
    rel(s, "friend", -4);
    rel(s, "family", -3);
    s.resources.hope = clamp(s.resources.hope - 3);
    s.resources.energy = clamp(s.resources.energy - 4);
  }
  const hit = (s.opportunities || []).find(
    (o) => o.status === "open" && (o.choices || []).includes(act.id),
  );
  if (hit) {
    hit.status = "done";
    s.resources.hope = clamp(s.resources.hope + 2);
    pushHist(s, { type: "opportunity", id: hit.id, result: "caught" });
  }
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

function seedOpportunity(s) {
  s.opportunities = s.opportunities || [];
  const used = new Set(s.opportunities.map((o) => o.id));
  const next = SON_EVENTS.find((e) => !used.has(e.id)) || SON_EVENTS[s.day % SON_EVENTS.length];
  if (!next) return;
  const openCount = s.opportunities.filter((o) => o.status === "open").length;
  if (openCount >= 2) return;
  s.opportunities.push({
    id: next.id + "_" + s.day,
    src: next.id,
    title: next.title,
    expiresOn: s.day + (next.window || 3),
    choices: next.choices.slice(),
    domain: next.domain,
    status: "open",
  });
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
  for (const op of s.opportunities || []) {
    if (op.status === "open" && op.expiresOn <= s.day) {
      op.status = "expired";
      s.missed.push(op.id);
      s.resources.hope = clamp(s.resources.hope - 3);
      if (op.domain === "friend") rel(s, "friend", -5);
      if (op.domain === "family") rel(s, "family", -4);
      if (op.domain === "work") rel(s, "work", -3);
      pushHist(s, { type: "opportunity", id: op.id, result: "expired" });
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
  if (s.day % 4 === 0) seedOpportunity(s);
  for (const m of MILESTONES) {
    if (s.remainingDays === m && !(s.flags.milestones || []).includes(m)) {
      s.flags.milestones = (s.flags.milestones || []).concat(m);
      pushHist(s, { type: "milestone", left: m });
    }
  }
  if (s.remainingDays === 0) {
    s.flags.finalReport = true;
    s.flags.report = {
      money: s.resources.money,
      energy: s.resources.energy,
      hope: s.resources.hope,
      missed: s.missed.slice(),
      goals: { ...s.goalProgress },
      workStreakMax: s.flags.workStreak || 0,
      caught: (s.opportunities || []).filter((o) => o.status === "done").length,
      expired: (s.opportunities || []).filter((o) => o.status === "expired").length,
    };
  }
  pushHist(s, { type: "day", day: s.day });
}

function hayatApplyChoice(s, choiceKey) {
  if (s.flags.majorTurn === s.turn) return;
  const used = new Set((s.decisionsLog || []).map((d) => d.event));
  const chapterEvents = MAJORS.filter((m) => m.chapter === s.chapter && !used.has(m.id));
  const pool = chapterEvents.length ? chapterEvents : MAJORS.filter((m) => m.chapter === s.chapter);
  const ev = pool[s.turn % Math.max(1, pool.length)] || MAJORS[0];
  const choice = choiceKey || ev.choice || "ambition";
  s.flags.majorTurn = s.turn;
  s.decisionsLog.push({ turn: s.turn, choice, event: ev.id, title: ev.title });
  const tmpl =
    SHADOWS.find((x) => x.category === ev.shadow) || SHADOWS.find((x) => x.category === "career");
  const openSame = s.shadows.some((x) => x.category === tmpl.category && x.status === "open");
  if (!openSame && s.flags.shadowTurn !== s.turn) {
    s.flags.shadowTurn = s.turn;
    s.shadows.push({
      id: "shadow_" + s.turn + "_" + tmpl.category,
      category: tmpl.category,
      createdAt: s.age,
      eligibleFrom: s.age + (tmpl.delay || 3),
      status: "open",
      choice,
      event: ev.id,
    });
  }
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
    const mix =
      (s.resources.money > 1800 ? 1 : 0) +
      (s.relationships[0].value > 55 ? 1 : 0) +
      (other >= 2 ? 1 : 0);
    sh.outcome = mix >= 2 ? "good" : mix === 1 ? "mix" : "bad";
    sh.text = tmpl[sh.outcome === "good" ? "good" : sh.outcome === "mix" ? "mix" : "bad"];
    if (other >= 1) sh.combined = true;
    if (sh.outcome === "good") s.resources.hope = clamp((s.resources.hope || 50) + 6);
    if (sh.outcome === "bad") s.resources.health = clamp(s.resources.health - 4);
    pushHist(s, {
      type: "shadow-callback",
      id: sh.id,
      text: sh.text,
      outcome: sh.outcome,
      combined: !!sh.combined,
    });
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
  if (s.discoveredItems.length >= 2 && !s.unlockedApps.includes("calls"))
    s.unlockedApps.push("calls");
  if (s.discoveredItems.length >= 3 && !s.unlockedApps.includes("photos"))
    s.unlockedApps.push("photos");
  if (s.discoveredItems.length >= 4 && !s.unlockedApps.includes("notes"))
    s.unlockedApps.push("notes");
  if (s.discoveredItems.length >= 5 && !s.unlockedApps.includes("calendar"))
    s.unlockedApps.push("calendar");
  if (s.discoveredItems.length >= 6 && !s.unlockedApps.includes("files"))
    s.unlockedApps.push("files");
  if (s.discoveredItems.length >= 7 && !s.unlockedApps.includes("voice"))
    s.unlockedApps.push("voice");
}

function phoneDiscover(s, item) {
  if (s.flags.ending) return;
  if (s.discoveredItems.includes(item)) return;
  const spec = DISCOVERABLES.find((d) => d.id === item);
  if (spec?.requires && spec.requires.some((r) => !s.discoveredItems.includes(r))) return;
  s.discoveredItems.push(item);
  s.clues.push(item);
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
  const sawId = s.discoveredItems.some((x) => ["file_scan", "note_pass", "lock_note"].includes(x));
  const travel = s.discoveredItems.some((x) =>
    ["photo_ticket", "photo_bag", "cal_bus"].includes(x),
  );
  const family = s.discoveredItems.includes("call_leyla") || s.discoveredItems.includes("clue_0");
  if (s.corroboration.length >= 3 && pressure < 70 && !sawId) return "witness";
  if (family && travel && !sawId && pressure < 55) return "family";
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
  if (id === "apartman" && action.startsWith("focus:")) {
    const issueId = action.slice(6);
    if (s.issues.some((issue) => issue.id === issueId && issue.status === "acik"))
      s.flags.focusIssue = issueId;
  } else if (id === "apartman" && action.startsWith("prepare:")) {
    const issueId = action.slice(8);
    const prepared = s.flags.prepared || [];
    if (
      prepared.length < 2 &&
      !prepared.includes(issueId) &&
      s.issues.some((issue) => issue.id === issueId && issue.status === "acik")
    ) {
      s.flags.prepared = prepared.concat(issueId);
      pushHist(s, { type: "preparation", issue: issueId, week: s.week });
    }
  } else if (id === "apartman" && action === "meeting") {
    const proposal = s.finance.cash < 2000 ? PROPOSALS[1] : PROPOSALS[0];
    const kind = s.finance.arrears > 2500 ? "aidat-krizi" : "butce";
    applyApartmanProposal(s, proposal, kind);
  } else if (id === "apartman" && action === "advance") {
    tickApartman(s);
  } else if (id === "apartman" && action.startsWith("proposal:")) {
    const proposal = PROPOSALS.find((p) => p.id === action.slice(9)) || PROPOSALS[0];
    applyApartmanProposal(
      s,
      proposal,
      proposal.id === "raise-dues" ? "aidat-krizi" : "acil-onarim",
    );
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
      opportunities: [
        {
          id: SON_EVENTS[1].id,
          title: SON_EVENTS[1].title,
          expiresOn: 1 + (SON_EVENTS[1].window || 3),
          choices: SON_EVENTS[1].choices,
          domain: SON_EVENTS[1].domain,
          status: "open",
        },
      ],
      missed: [],
      flags: { milestones: [], finalReport: false, workStreak: 0 },
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
    if (!s.flags.ending) {
      s.flags.ending = phoneEnding(s);
      pushHist(s, { type: "ending", ending: s.flags.ending });
    }
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

export {
  defs,
  SYSTEMS,
  MEETINGS,
  SCENARIOS,
  MAJORS,
  DISCOVERABLES,
  PERIODS,
  POLICIES_2002,
  ENDINGS,
  APPS,
  ISSUE_TEMPLATES,
  hydrateDevlet,
  tickDevletN,
  DOCTRINES,
  ALT_PRESETS,
  POLICIES,
  finiteState,
  GUNUMUZ_BASELINE,
  SHADOWS,
  CONTACTS,
  RESIDENTS,
  SON_EVENTS,
  PROPOSALS,
};
export { A100 as SON_ACTIONS };
