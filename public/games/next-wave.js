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
import { applySonAction, sonAdvanceDay, applySonScenario, ensureSonState } from "./next-wave/son100-sim.js";
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
      return ensureSonState({
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
        flags: { milestones: [], finalReport: false, workStreak: 0, soul: { ...(sc.soul || {}) } },
        ui: { screen: "Durum" },
      });
    },
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
  // payload validated cleanly as another game's save and would have been fed
  // to the wrong engine.
  if (id && s.meta?.id !== id) return false;
  return true;
}
export function normalize(id, raw) {
  if (!validate(raw, id)) return raw ? null : create(id);
  if (id === "son-100-gun") ensureSonState(raw);
  return raw;
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
    applySonScenario(s, action.slice(9));
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
  CONTACTS,
  RESIDENTS,
  SON_EVENTS,
  PROPOSALS,
};
export { A100 as SON_ACTIONS };
