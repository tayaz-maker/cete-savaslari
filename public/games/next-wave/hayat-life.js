// Seasonal life management. Four passages still make one year: legacy shadows
// keep their original age clock. No timers, random rerolls or presentation state.
export const LIFE_SCREENS = [
  "actions",
  "me",
  "work",
  "path",
  "money",
  "market",
  "people",
  "home",
  "family",
  "body",
  "decisions",
  "shadows",
  "history",
];
export const PEOPLE = [
  ["ayla", "Ayla", "Anne", "Mother", "family"],
  ["kemal", "Kemal", "Baba", "Father", "family"],
  ["deniz", "Deniz", "Kardeş", "Sibling", "family"],
  ["baris", "Barış", "Arkadaş", "Friend", "friend"],
  ["ece", "Ece", "Yakın arkadaş", "Close friend", "romance"],
  ["selin", "Selin", "İş arkadaşı", "Colleague", "work"],
  ["murat", "Murat", "Yönetici", "Manager", "work"],
  ["leyla", "Leyla", "Eğitmen", "Tutor", "education"],
  ["nermin", "Nermin", "Komşu", "Neighbour", "home"],
  ["onur", "Onur", "Eski okul arkadaşı", "School friend", "friend"],
].map(([id, name, tr, en, group]) => ({ id, name, role: [tr, en], group }));
const a = (id, tr, en, panel, cost, energy, stress, health = 0, extra = {}) => ({
  id,
  label: [tr, en],
  panel,
  cost,
  energy,
  stress,
  health,
  ...extra,
});
export const LIFE_ACTIONS = [
  a("work", "İşe git", "Work a shift", "work", 0, -18, 8, 0, { income: 420 }),
  a("overtime", "Fazla mesai", "Overtime", "work", 0, -30, 17, -2, { income: 650 }),
  a("search", "İş ara", "Look for work", "work", 40, -10, 4),
  a("network", "Barış ile referans görüşmesi", "Ask Barış for a referral", "work", 80, -8, -2, 0, {
    npc: "baris",
    relation: 5,
  }),
  a("promote", "Terfi görüşmesi", "Ask for promotion", "work", 0, -8, 5),
  a("resign", "İstifa et", "Resign", "work", 0, 8, -15),
  a("course", "Kursa kaydol", "Enrol on a course", "path", 300, -5, 3),
  a("study", "Eğitime çalış", "Study", "path", 0, -16, 4),
  a("friend", "Barış ile buluş", "Meet Barış", "people", 60, -5, -10, 0, {
    npc: "baris",
    relation: 8,
  }),
  a("family", "Aileye uğra", "Visit family", "family", 40, -6, -7, 0, { npc: "ayla", relation: 8 }),
  a("date", "Ece ile görüş", "Meet Ece", "family", 100, -8, -9, 0, { npc: "ece", relation: 9 }),
  a("commit", "İlişkiye başla", "Start a relationship", "family", 0, -4, -4),
  a("marry", "Birlikte hayat kur", "Build a life together", "family", 900, -10, 8),
  a("split", "İlişkiyi bitir", "End the relationship", "family", 0, -5, 15),
  a("exercise", "Spor yap", "Exercise", "body", 30, -10, -6, 5),
  a("doctor", "Doktora git", "See a doctor", "body", 180, -4, -5, 15),
  a("rest", "Dinlen", "Rest", "body", 0, 28, -18, 2),
  a("hobby", "Hobiye zaman ayır", "Make time for a hobby", "body", 45, 5, -12),
  a("groceries", "Market alışverişi", "Buy groceries", "market", 75, 10, -3, 3),
  a("book", "Çalışma kitabı al", "Buy a study book", "market", 120, -2, -2),
  a("trip", "Kısa gezi", "Take a short trip", "market", 240, 8, -18),
  a("view-home", "Ev ve taşınma araştır", "Research a move", "home", 50, -8, 3),
  a("move", "Paylaşımlı eve taşın", "Move to a shared flat", "home", 500, -18, -5),
  a("return-home", "Aile evine dön", "Return to the family home", "home", 120, -10, 6),
  a("save", "Kenara 200 TL ayır", "Set aside 200 TL", "money", 200, 0, 1),
  a("withdraw", "Birikimden 200 TL çek", "Withdraw 200 TL", "money", 0, 0, 1),
  a("repay", "Borçtan 200 TL öde", "Repay 200 TL of debt", "money", 200, 0, -3),
  ...PEOPLE.filter((p) => !["ayla", "baris", "ece"].includes(p.id)).map((p) =>
    a(`meet-${p.id}`, `${p.name} ile konuş`, `Talk with ${p.name}`, "people", 20, -4, -4, 0, {
      npc: p.id,
      relation: 6,
    }),
  ),
];
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
export const lifeLog = (s, tr, en, type = "action") => {
  s.history.push({ type, turn: s.turn, age: s.age, text: tr, en });
  s.history = s.history.slice(-80);
};
export function ensureLife(s) {
  const finite = (v) =>
    typeof v === "number"
      ? Number.isFinite(v)
      : v && typeof v === "object"
        ? Object.values(v).every(finite)
        : true;
  if (!finite(s)) return null;
  if (
    !s ||
    !s.resources ||
    !Number.isFinite(s.age) ||
    !Number.isFinite(s.turn) ||
    !Array.isArray(s.relationships) ||
    !Array.isArray(s.shadows) ||
    !Array.isArray(s.decisionsLog) ||
    !s.flags
  )
    return null;
  for (const k of ["money", "energy", "health"]) if (!Number.isFinite(s.resources[k])) return null;
  s.life ||= {
    version: 1,
    used: [],
    job: "assistant",
    experience: 0,
    skill: 0,
    course: null,
    savings: 0,
    debt: 0,
    home: "family",
    homeResearch: false,
    partner: null,
    married: false,
    book: false,
    stress: 25,
    people: PEOPLE.map((p) => ({
      id: p.id,
      value: s.relationships.find((r) => r.id === p.group)?.value ?? 45,
      memory: [],
    })),
  };
  const l = s.life;
  if (
    l.version !== 1 ||
    !Array.isArray(l.used) ||
    l.used.length > 2 ||
    new Set(l.used).size !== l.used.length ||
    !Array.isArray(l.people) ||
    l.people.length !== PEOPLE.length ||
    l.people.some(
      (p) =>
        !PEOPLE.some((x) => x.id === p.id) || !Number.isFinite(p.value) || !Array.isArray(p.memory),
    ) ||
    new Set(l.people.map((p) => p.id)).size !== PEOPLE.length
  )
    return null;
  for (const k of ["experience", "skill", "savings", "debt", "stress"])
    if (!Number.isFinite(l[k]) || l[k] < 0) return null;
  if (
    !["family", "shared"].includes(l.home) ||
    !["assistant", "qualified", null].includes(l.job) ||
    (l.course &&
      (!Number.isFinite(l.course.progress) || l.course.progress < 0 || l.course.progress > 3))
  )
    return null;
  if (l.partner !== null && !PEOPLE.some((p) => p.id === l.partner)) return null;
  s.resources.energy = clamp(s.resources.energy);
  s.resources.health = clamp(s.resources.health);
  l.stress = clamp(l.stress);
  s.ui ||= {};
  if (!LIFE_SCREENS.includes(s.ui.screen)) s.ui.screen = "actions";
  return s;
}
export function lifeReason(s, id) {
  const x = LIFE_ACTIONS.find((a) => a.id === id),
    l = s.life;
  if (!x || !l) return ["Geçersiz eylem", "Invalid action"];
  if (s.age >= 36) return ["Bu hayat dosyası tamamlandı", "This life file is complete"];
  if (l.used.length >= 2)
    return ["Bu dönemin iki hakkı kullanıldı", "Both actions used this passage"];
  if (l.used.includes(id)) return ["Bu dönemde yapıldı", "Already done this passage"];
  if (s.resources.money < x.cost) return ["Nakit yetersiz", "Not enough cash"];
  if (s.resources.energy < -x.energy) return ["Önce dinlenmelisin", "Rest first"];
  if (["work", "overtime", "promote", "resign"].includes(id) && !l.job)
    return ["Önce iş bulmalısın", "Find work first"];
  if (id === "overtime" && l.stress > 75) return ["Stres çok yüksek", "Stress is too high"];
  if (id === "search" && l.job && !(l.skill >= 3 && l.job === "assistant"))
    return [
      "Mevcut işin var; yeni iş için kursu tamamla",
      "Already employed; complete a course to change jobs",
    ];
  if (id === "network" && s.openCases.some((c) => c.kind === "referral"))
    return ["Referans yanıtı bekleniyor", "Referral pending"];
  if (id === "promote" && (l.experience < 4 || l.job === "qualified"))
    return ["Dört iş deneyimi gerekli; tek terfi", "Requires four work experiences; one promotion"];
  if (id === "course" && (l.course || l.skill >= 3))
    return ["Kurs açık veya tamamlandı", "Course active or completed"];
  if (id === "study" && !l.course) return ["Önce kursa kaydol", "Enrol first"];
  if (id === "book" && l.book) return ["Kitap zaten sende", "Already owned"];
  if (id === "commit" && (l.partner || l.people.find((p) => p.id === "ece").value < 58))
    return [
      "Ece ile yakınlık 58 gerekli; mevcut ilişki olmamalı",
      "Requires closeness 58 with Ece and no partner",
    ];
  if (["marry", "split"].includes(id) && !l.partner)
    return ["Mevcut bir ilişki gerekli", "Requires a relationship"];
  if (id === "marry" && (l.married || l.people.find((p) => p.id === l.partner).value < 75))
    return [
      "Yakınlık 75 gerekli; zaten evli olmamalısın",
      "Requires closeness 75 and not already married",
    ];
  if (id === "view-home" && (l.homeResearch || l.home === "shared"))
    return ["Uygun ev bulundu", "Suitable home already found"];
  if (id === "move" && (!l.homeResearch || l.home === "shared"))
    return ["Önce ev araştır", "Research a home first"];
  if (id === "return-home" && l.home === "family")
    return ["Zaten aile evindesin", "Already at the family home"];
  if (id === "withdraw" && l.savings < 200)
    return ["Birikim 200 TL altında", "Savings below 200 TL"];
  if (id === "repay" && l.debt < 200)
    return ["Ödenecek 200 TL borç yok", "No 200 TL debt to repay"];
  return null;
}
export function applyLife(s, id) {
  if (lifeReason(s, id)) return false;
  const x = LIFE_ACTIONS.find((a) => a.id === id),
    l = s.life,
    r = s.resources;
  const before = r.money;
  l.used.push(id);
  r.money -= x.cost;
  r.energy = clamp(r.energy + x.energy);
  r.health = clamp(r.health + x.health);
  l.stress = clamp(l.stress + x.stress);
  if (x.income) {
    r.money += Math.round(x.income * (l.job === "qualified" ? 1.5 : 1));
    l.experience++;
  }
  if (x.npc) {
    const p = l.people.find((p) => p.id === x.npc);
    p.value = clamp(p.value + x.relation);
    p.memory.push({ turn: s.turn, tr: x.label[0], en: x.label[1] });
    p.memory = p.memory.slice(-8);
  }
  if (id === "search") l.job = l.skill >= 3 ? "qualified" : "assistant";
  if (id === "promote") l.job = "qualified";
  if (id === "resign") l.job = null;
  if (id === "network")
    s.openCases.push({
      id: `referral-${s.turn}`,
      kind: "referral",
      due: s.turn + 2,
      status: "open",
    });
  if (id === "course") l.course = { progress: 0 };
  if (id === "study") {
    l.course.progress += l.book ? 2 : 1;
    if (l.course.progress >= 3) {
      l.skill = 3;
      l.course = null;
      lifeLog(
        s,
        "Kurs tamamlandı; nitelikli işler açıldı.",
        "Course complete; qualified jobs unlocked.",
        "milestone",
      );
    }
  }
  if (id === "book") l.book = true;
  if (id === "commit") l.partner = "ece";
  if (id === "marry") l.married = true;
  if (id === "split") {
    l.partner = null;
    l.married = false;
    l.people.find((p) => p.id === "ece").value = 35;
  }
  if (id === "view-home") l.homeResearch = true;
  if (id === "move") l.home = "shared";
  if (id === "return-home") {
    l.home = "family";
    l.homeResearch = false;
  }
  if (id === "save") l.savings += 200;
  if (id === "withdraw") {
    l.savings -= 200;
    r.money += 200;
  }
  if (id === "repay") l.debt -= 200;
  lifeLog(
    s,
    `${x.label[0]} · Nakit ${r.money - before >= 0 ? "+" : ""}${r.money - before} TL · Enerji ${x.energy} · Stres ${x.stress}`,
    `${x.label[1]} · Cash ${r.money - before >= 0 ? "+" : ""}${r.money - before} TL · Energy ${x.energy} · Stress ${x.stress}`,
  );
  return true;
}
export function lifePassage(s) {
  const l = s.life,
    r = s.resources;
  const expense =
    (l.home === "shared" ? 280 : 120) + (l.married ? 70 : 0) + Math.ceil(l.debt * 0.02);
  const paid = Math.min(Math.max(0, r.money), expense);
  r.money -= paid;
  l.debt = clamp(l.debt + expense - paid, 0, 1000000);
  r.energy = clamp(r.energy + 16);
  l.stress = clamp(l.stress + (expense > paid ? 10 : -3));
  if (l.stress > 75) r.health = clamp(r.health - 4);
  for (const p of l.people)
    if (!p.memory.some((m) => m.turn === s.turn - 1)) p.value = clamp(p.value - 1);
  for (const c of s.openCases)
    if (c.kind === "referral" && c.status === "open" && c.due <= s.turn) {
      c.status = "closed";
      l.experience = Math.min(100, l.experience + 2);
      if (!l.job) l.job = "assistant";
      lifeLog(
        s,
        "Barış referans oldu; iş deneyimin güçlendi.",
        "Barış referred you; your work experience improved.",
        "callback",
      );
    }
  l.used = [];
  lifeLog(
    s,
    `Yeni dönem · Temel gider ${expense} TL; ödenen ${paid} TL.`,
    `New passage · Essential costs ${expense} TL; paid ${paid} TL.`,
    "advance",
  );
}
