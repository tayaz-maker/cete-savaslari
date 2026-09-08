import { SCENARIOS, MILESTONES, ACTIONS as A100, EVENTS as SON_EVENTS, SON_CALLBACKS, SON_ENDINGS } from "./son100-data.js";

export const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));

const SUICIDE = /suicid|intihar|self[-_]?harm|kendine\s*zarar/i;

export function sonPhase(s) {
  const left = s.remainingDays ?? 100;
  if (left <= 0) return { id: "death", label: "Gün 0", note: "Artık karar yok. Hüküm kayıtta duruyor." };
  if (left <= 3) return { id: "end", label: "Son", note: "Filler yok. Açık dosya ve asıl insanlar kaldı." };
  if (left <= 14) return { id: "reckoning", label: "Hesaplaşma", note: "Vasiyet, helallik, sır, korku. Ertelediğin şey kapıda." };
  if (left <= 40) return { id: "consequence", label: "Sonuçlar", note: "Eski kararların faturası. Para, ilişki, hukuk, pişmanlık." };
  if (left <= 70) return { id: "turn", label: "Yön değişimi", note: "İş, aşk, gece, iman, intikam, kaçış. Yol burada kırılır." };
  return { id: "shock", label: "İnkâr / şok", note: "Yüz gün. Doktorun cümlesi duruyor. Kredi ekstresi de duruyor." };
}

export function emptySoul() {
  return {
    fear: 40,
    acceptance: 20,
    conscience: 40,
    faith: 20,
    hedonism: 20,
    anger: 20,
    harm: 0,
    mercy: 0,
    betrayal: 0,
    crime: 0,
    courage: 20,
    forgiveness: 10,
    legacy: 0,
    violence: 0,
    love: 0,
    selfish: 0,
    repent: 0,
  };
}

export function sonSoul(s) {
  return { ...emptySoul(), ...(s.flags?.soul || {}) };
}

function setSoul(s, patch) {
  const soul = sonSoul(s);
  for (const [key, value] of Object.entries(patch)) {
    if (typeof soul[key] === "number" && Number.isFinite(value)) soul[key] = clamp(soul[key] + value, 0, 100);
  }
  s.flags.soul = soul;
}

function rel(s, key, d) {
  const r = (s.relationships || []).find((x) => x.id === key);
  if (r) r.value = clamp(r.value + d);
}

function pushHist(s, row) {
  s.history = (s.history || []).concat(row).slice(-80);
}

function countActs(s, id) {
  return (s.history || []).filter((row) => row.type === "act" && row.id === id).length;
}

function usedToday(s, id) {
  return (s.history || []).some((row) => row.type === "act" && row.id === id && row.day === s.day);
}

export function ensureSonState(s) {
  if (!s || typeof s !== "object") return s;
  s.flags = s.flags || {};
  s.flags.soul = { ...emptySoul(), ...(s.flags.soul || {}) };
  s.flags.milestones = Array.isArray(s.flags.milestones) ? s.flags.milestones : [];
  s.flags.workStreak = Number.isFinite(s.flags.workStreak) ? s.flags.workStreak : 0;
  s.flags.donateCount = Number.isFinite(s.flags.donateCount) ? s.flags.donateCount : 0;
  s.flags.prayCount = Number.isFinite(s.flags.prayCount) ? s.flags.prayCount : 0;
  s.flags.crimeCount = Number.isFinite(s.flags.crimeCount) ? s.flags.crimeCount : 0;
  s.flags.legalRisk = Number.isFinite(s.flags.legalRisk) ? s.flags.legalRisk : 0;
  s.flags.gambleDay = Number.isInteger(s.flags.gambleDay) ? s.flags.gambleDay : 0;
  s.openCases = Array.isArray(s.openCases) ? s.openCases : [];
  s.opportunities = Array.isArray(s.opportunities) ? s.opportunities : [];
  s.missed = Array.isArray(s.missed) ? s.missed : [];
  s.goalProgress = s.goalProgress || { money: 0, relationship: 0, health: 0, work: 0 };
  if (!s.relationships?.length) {
    s.relationships = [
      { id: "family", value: 48 },
      { id: "friend", value: 46 },
      { id: "work", value: 44 },
      { id: "partner", value: 40 },
    ];
  } else if (!s.relationships.some((item) => item.id === "partner")) {
    s.relationships.push({ id: "partner", value: 40 });
  }
  return s;
}

export function availableSonActions(s) {
  ensureSonState(s);
  const phase = sonPhase(s).id;
  const left = s.remainingDays ?? 100;
  const energy = s.resources?.energy ?? 50;
  const money = s.resources?.money ?? 0;
  const soul = sonSoul(s);
  const ids = new Set(["work", "rest", "family", "pay"]);
  const windows = (s.opportunities || []).filter((item) => item.status === "open");
  for (const window of windows) for (const choice of window.choices || []) ids.add(choice);
  if (energy < 35) ids.add("rest");
  if (money < 400) ids.add("work");
  if (phase === "shock") {
    ids.add("doctor");
    ids.add("hide");
    ids.add("work");
  }
  if (phase === "turn" || phase === "consequence") {
    ids.add("quit");
    ids.add("party");
    ids.add("drink");
    ids.add("travel");
    ids.add("confront");
    ids.add("sex");
    ids.add("pray");
  }
  if (soul.anger >= 12 || phase === "turn") ids.add("revenge");
  if (soul.faith >= 8 || phase === "reckoning" || phase === "end") ids.add("pray");
  if (left <= 40) ids.add("write-will");
  if (left <= 30) ids.add("forgive");
  if (left <= 20) ids.add("confess");
  if (money > 800) ids.add("donate");
  if (phase === "turn" && money > 300) ids.add("gamble");
  if (phase === "turn" && soul.hedonism >= 8) {
    ids.add("drugs");
    ids.add("escort");
  }
  if (soul.crime >= 4 || s.flags.legalRisk >= 6) ids.add("crime");
  if (s.flags.legalRisk >= 8) ids.add("report-crime");
  if (left <= 14) {
    ids.add("legacy");
    ids.add("call-ex");
    ids.add("visit-friend");
  }
  if (left <= 3) {
    return ["family", "pray", "confess", "forgive", "write-will", "legacy"].filter((id) =>
      A100.some((action) => action.id === id),
    );
  }
  const list = [...ids].filter((id) => A100.some((action) => action.id === id) && !SUICIDE.test(id));
  return list.slice(0, 10);
}

function queueCase(s, spec) {
  if (!spec?.id) return;
  if (s.openCases.some((item) => item.id === spec.id && item.status !== "resolved")) return;
  s.openCases.push({
    id: spec.id,
    title: spec.title,
    due: s.day + (spec.delay || 12),
    status: "open",
    kind: spec.kind || "callback",
    payload: spec.payload || {},
  });
}

export function applySonAction(s, actId) {
  ensureSonState(s);
  if (s.flags.finalReport || (s.remainingDays ?? 1) <= 0) return s;
  if (SUICIDE.test(actId || "")) return s;
  const act = A100.find((a) => a.id === actId);
  if (!act) return s;
  if (act.id === "donate" && s.flags.donateCount >= 3) return s;
  if (act.id === "pray" && usedToday(s, "pray")) return s;
  if (act.id === "gamble" && s.flags.gambleDay === s.day) return s;
  if (act.id === "crime" && s.flags.crimeCount >= 5) return s;

  s.resources.energy = clamp(s.resources.energy + (act.energy || 0));
  s.resources.money += act.money || 0;
  s.resources.hope = clamp(s.resources.hope + (act.hope || 0));
  if (act.family) rel(s, "family", act.family);
  if (act.friend) rel(s, "friend", act.friend);
  if (act.work) rel(s, "work", act.work);
  if (act.partner) rel(s, "partner", act.partner);
  if (act.work) s.goalProgress.work += act.work;
  if (act.family || act.friend || act.partner) s.goalProgress.relationship += 1;
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

  const late = (s.remainingDays ?? 100) <= 10;
  const weight = late && ["pray", "donate", "forgive", "confess"].includes(act.id) ? 1 : 2;
  const soulPatch = act.soul || {};
  const scaled = {};
  for (const [key, value] of Object.entries(soulPatch)) scaled[key] = value > 0 ? Math.max(1, Math.round(value * (weight / 2))) : value;
  if (Object.keys(scaled).length) setSoul(s, scaled);

  if (act.id === "donate") {
    s.flags.donateCount += 1;
    if (s.flags.donateCount >= 3) setSoul(s, { mercy: 0, selfish: 1 });
  }
  if (act.id === "pray") s.flags.prayCount += 1;
  if (act.id === "gamble") {
    s.flags.gambleDay = s.day;
    const swing = s.day % 3 === 0 ? 420 : -380;
    s.resources.money += swing;
    setSoul(s, { hedonism: 2, fear: swing < 0 ? 2 : 0 });
  }
  if (act.id === "crime") {
    s.flags.crimeCount += 1;
    s.flags.legalRisk = (s.flags.legalRisk || 0) + 4;
    setSoul(s, { crime: 3, harm: 2, courage: 1 });
    if (s.flags.crimeCount === 2) queueCase(s, { id: "police-file", title: "İfade çağrısı", delay: 9, kind: "legal" });
  }
  if (act.id === "sex" || act.id === "escort") {
    setSoul(s, { hedonism: 3, love: act.id === "sex" ? 1 : 0, betrayal: act.id === "escort" ? 1 : 0 });
    if (act.id === "escort") queueCase(s, { id: "partner-learns", title: "Partner bir şey sezdi", delay: 16, kind: "affair" });
  }
  if (act.id === "revenge") {
    setSoul(s, { anger: 3, harm: 3, courage: 2 });
    queueCase(s, { id: "revenge-back", title: "Karşı hamle", delay: 11, kind: "revenge" });
  }
  if (act.id === "help-stranger" || act.id === "protect") setSoul(s, { mercy: 3, courage: 2, legacy: 1 });
  if (act.id === "write-will" || act.id === "legacy") setSoul(s, { legacy: 4, acceptance: 2 });
  if (act.id === "forgive") setSoul(s, { forgiveness: 4, anger: -3, conscience: 2 });
  if (act.id === "confess") setSoul(s, { conscience: 3, repent: 3, courage: 2 });
  if (act.id === "lie" || act.id === "hide") setSoul(s, { betrayal: 1, fear: 2 });
  if (act.id === "quit") {
    rel(s, "work", -8);
    setSoul(s, { courage: 2, selfish: 1 });
  }

  const hit = (s.opportunities || []).find(
    (o) => o.status === "open" && (o.choices || []).includes(act.id),
  );
  if (hit) {
    hit.status = "done";
    s.resources.hope = clamp(s.resources.hope + 2);
    if (hit.soul) setSoul(s, hit.soul);
    if (hit.callback) queueCase(s, hit.callback);
    pushHist(s, { type: "opportunity", id: hit.id, result: "caught" });
  }
  if (act.id === "pay" || act.id === "min") {
    const ob = s.obligations.find((o) => o.status === "open");
    if (ob) {
      ob.status = act.id === "pay" ? "paid" : "min";
      s.resources.money -= Math.max(0, (ob.cost || 0) - 200);
      if (act.id === "pay") setSoul(s, { conscience: 1, legacy: 1 });
      else setSoul(s, { selfish: 1 });
    }
  }
  s.actionsRemaining = Math.max(0, s.actionsRemaining - 1);
  pushHist(s, { type: "act", id: act.id, day: s.day });
  return s;
}

function seedOpportunity(s) {
  s.opportunities = s.opportunities || [];
  const used = new Set(s.opportunities.map((o) => o.src || o.id));
  const phase = sonPhase(s).id;
  const pool = SON_EVENTS.filter((event) => {
    if (used.has(event.id)) return false;
    if (event.phase && event.phase !== phase && event.phase !== "any") return false;
    if ((s.remainingDays ?? 100) > 14 && event.final) return false;
    if ((s.remainingDays ?? 100) <= 14 && event.final === false) return false;
    return true;
  });
  const next = pool[0] || SON_EVENTS.find((e) => !used.has(e.id)) || SON_EVENTS[s.day % SON_EVENTS.length];
  if (!next) return;
  const openCount = s.opportunities.filter((o) => o.status === "open").length;
  if (openCount >= 2) return;
  s.opportunities.push({
    id: next.id + "_" + s.day,
    src: next.id,
    title: next.title,
    text: next.text,
    expiresOn: s.day + (next.window || 3),
    choices: next.choices.slice(),
    domain: next.domain,
    tags: next.tags || [],
    soul: next.soul,
    callback: next.callback,
    status: "open",
  });
}

function resolveCases(s) {
  for (const item of s.openCases) {
    if (item.status !== "open" || item.due > s.day) continue;
    item.status = "resolved";
    const spec = SON_CALLBACKS.find((row) => row.id === item.id) || item;
    if (spec.hope) s.resources.hope = clamp(s.resources.hope + spec.hope);
    if (spec.money) s.resources.money += spec.money;
    if (spec.energy) s.resources.energy = clamp(s.resources.energy + spec.energy);
    if (spec.rel) for (const [key, value] of Object.entries(spec.rel)) rel(s, key, value);
    if (spec.soul) setSoul(s, spec.soul);
    if (spec.legal) s.flags.legalRisk = (s.flags.legalRisk || 0) + spec.legal;
    pushHist(s, { type: "callback", id: item.id, title: spec.title || item.title });
  }
}

export function sonAdvanceDay(s) {
  ensureSonState(s);
  if (s.flags.finalReport) return s;
  s.day += 1;
  s.remainingDays = Math.max(0, s.remainingDays - 1);
  s.actionsRemaining = s.remainingDays === 0 ? 0 : 2;
  s.resources.energy = clamp(s.resources.energy - (s.remainingDays <= 14 ? 6 : 4));
  if (s.remainingDays <= 14) setSoul(s, { fear: 1, acceptance: s.flags.soul.faith >= 12 ? 1 : 0 });
  for (const o of s.obligations) {
    if (o.status === "open") {
      o.due -= 1;
      if (o.due <= 0) {
        o.status = "missed";
        s.missed.push(o.id);
        s.resources.hope = clamp(s.resources.hope - 8);
        s.resources.money -= Math.round((o.cost || 0) * 0.15);
        rel(s, "family", o.domain === "family" || o.domain === "home" ? -6 : -1);
        setSoul(s, { selfish: 1, conscience: -1 });
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
  resolveCases(s);
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
  const cadence = s.remainingDays <= 14 ? 2 : 4;
  if (s.day % cadence === 0) seedOpportunity(s);
  for (const m of MILESTONES) {
    if (s.remainingDays === m && !(s.flags.milestones || []).includes(m)) {
      s.flags.milestones = (s.flags.milestones || []).concat(m);
      pushHist(s, { type: "milestone", left: m });
    }
  }
  if (s.remainingDays === 0) finalizeSon(s);
  pushHist(s, { type: "day", day: s.day });
  return s;
}

export function sonDeathScene(s) {
  const family = s.relationships?.find((item) => item.id === "family")?.value ?? 50;
  const partner = s.relationships?.find((item) => item.id === "partner")?.value ?? 40;
  const energy = s.resources?.energy ?? 50;
  if (energy < 25) return "Hastane odası. Monitör düz çizgiye yaklaşırken koridor hâlâ ayakkabı sesi.";
  if (family >= 62 && partner >= 55) return "Ev. Aile ve partner aynı odada. Kimse film müziği açmıyor; ellerin duruyor.";
  if (family >= 58) return "Ev. Annan ya da evladın kapı eşiğinde. Cümle yok, nefes var.";
  if (partner >= 58) return "Evin odası. Partnerin omzuna ağırlık veriyorsun. Dışarıda normal bir akşam.";
  if (energy < 40) return "Hospice koridoru. Çay soğumuş. Ölüm resmi bir form kadar sakin.";
  return "Yalnız oda. Telefon masada. Kimse aramadı, sen de kimseyi aramadın.";
}

function scoreOf(s) {
  const soul = sonSoul(s);
  const family = s.relationships?.find((item) => item.id === "family")?.value ?? 50;
  const partner = s.relationships?.find((item) => item.id === "partner")?.value ?? 40;
  const money = s.resources?.money ?? 0;
  const missed = (s.missed || []).length;
  return {
    mercy: soul.mercy,
    harm: soul.harm,
    betrayal: soul.betrayal,
    violence: soul.violence,
    crime: soul.crime,
    family: family,
    love: soul.love + Math.round(partner / 10),
    selfish: soul.selfish,
    faith: soul.faith,
    repent: soul.repent,
    debt: money < 0 ? 1 : 0,
    courage: soul.courage,
    forgiveness: soul.forgiveness,
    hedonism: soul.hedonism,
    legacy: soul.legacy,
    unresolved: (s.openCases || []).filter((item) => item.status === "open").length + missed,
    acceptance: soul.acceptance,
    fear: soul.fear,
    conscience: soul.conscience,
    anger: soul.anger,
    money,
  };
}

export function sonVerdict(s) {
  const sc = scoreOf(s);
  const heaven =
    sc.mercy >= 16 &&
    sc.harm <= 8 &&
    sc.betrayal <= 4 &&
    sc.crime <= 4 &&
    (sc.faith >= 14 || sc.legacy >= 12) &&
    sc.family >= 52 &&
    sc.repent + sc.forgiveness >= 8;
  const hell =
    sc.harm >= 18 &&
    sc.betrayal >= 8 &&
    sc.crime + sc.violence >= 10 &&
    sc.mercy <= 6 &&
    sc.repent <= 4 &&
    sc.family < 48;
  if (heaven) return SON_ENDINGS.find((item) => item.id === "heaven");
  if (hell) return SON_ENDINGS.find((item) => item.id === "hell");
  const ranked = SON_ENDINGS.filter((item) => item.id !== "heaven" && item.id !== "hell").map((item) => {
    let score = 0;
    for (const [key, need] of Object.entries(item.need || {})) {
      const value = sc[key] ?? 0;
      score += need >= 0 ? (value >= need ? 3 : value - need) : value <= Math.abs(need) ? 3 : -2;
    }
    return { item, score };
  });
  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.item || SON_ENDINGS.find((item) => item.id === "unfinished");
}

export function finalizeSon(s) {
  ensureSonState(s);
  const verdict = sonVerdict(s);
  const sc = scoreOf(s);
  s.flags.finalReport = true;
  s.actionsRemaining = 0;
  s.flags.report = {
    money: s.resources.money,
    energy: s.resources.energy,
    hope: s.resources.hope,
    missed: s.missed.slice(),
    goals: { ...s.goalProgress },
    workStreakMax: s.flags.workStreak || 0,
    caught: (s.opportunities || []).filter((o) => o.status === "done").length,
    expired: (s.opportunities || []).filter((o) => o.status === "expired").length,
    mercy: sc.mercy,
    harm: sc.harm,
    faith: sc.faith,
    endingId: verdict.id,
    verdictTitle: verdict.title,
    verdictKicker: verdict.kicker,
    verdictLine: verdict.line,
    verdictText: verdict.text,
    helped: sc.mercy >= 6 ? ["Birine gerçekten yardım ettin."] : [],
    harmed: sc.harm >= 8 ? ["Birine bilinçli zarar verdin."] : [],
    unresolved: (s.openCases || []).filter((item) => item.status === "open").map((item) => item.title),
    scene: sonDeathScene(s),
  };
  return s;
}

export function applySonScenario(s, scenarioId) {
  const sc = SCENARIOS.find((item) => item.id === scenarioId) || SCENARIOS[0];
  ensureSonState(s);
  s.scenarioId = sc.id;
  s.resources = { ...sc.resources };
  s.relationships = Object.entries(sc.relations || {}).map(([id, value]) => ({ id, value }));
  if (!s.relationships.some((item) => item.id === "partner")) s.relationships.push({ id: "partner", value: sc.partner || 40 });
  s.obligations = (sc.obligations || []).map((o) => ({ ...o, status: "open" }));
  s.missed = [];
  s.openCases = [];
  s.flags = {
    milestones: [],
    finalReport: false,
    workStreak: 0,
    soul: { ...emptySoul(), ...(sc.soul || {}) },
    donateCount: 0,
    prayCount: 0,
    crimeCount: 0,
    legalRisk: sc.legalRisk || 0,
    gambleDay: 0,
    hook: sc.hook || sc.goal,
    burden: sc.burden || sc.obligations?.[0]?.title,
  };
  const opener = SON_EVENTS.find((event) => event.scenario === sc.id) || SON_EVENTS[1] || SON_EVENTS[0];
  s.opportunities = opener
    ? [
        {
          id: opener.id,
          src: opener.id,
          title: opener.title,
          text: opener.text,
          expiresOn: 1 + (opener.window || 3),
          choices: opener.choices,
          domain: opener.domain,
          status: "open",
        },
      ]
    : [];
  return s;
}
