import {
  ALT_PRESETS,
  DOCTRINES,
  PERIODS,
  POLICIES,
  POLICIES_2002,
  hydrateDevlet,
  implementationRate,
} from "../next-wave.js";
import {
  bindFrontMenu,
  bindSavePanel,
  bootGame,
  escapeHtml as h,
  frontMenu,
  loc,
  savePanel,
  text as t,
} from "../next-wave/shared/runtime.js";

const axisLabel = {
  centralization: ["Merkezileşme", "Centralization"],
  localAutonomy: ["Yerel özerklik", "Local autonomy"],
  security: ["Güvenlik", "Security"],
  paternalism: ["Paternalizm", "Paternalism"],
  market: ["Piyasa", "Market"],
  socialState: ["Sosyal devlet", "Social state"],
  institutionalism: ["Kurumsallık", "Institutionalism"],
  negotiation: ["Müzakere", "Negotiation"],
  openness: ["Açıklık", "Openness"],
  nationalEconomy: ["Milli ekonomi", "National economy"],
  ru: ["Rusya", "Russia"],
  us: ["ABD", "United States"],
  eu: ["AB", "EU"],
  inflation: ["Enflasyon", "Inflation"],
  treasury: ["Hazine", "Treasury"],
  unemployment: ["İşsizlik", "Unemployment"],
  fx: ["Kur", "Exchange"],
  debt: ["Borç", "Debt"],
  industry: ["Sanayi", "Industry"],
  agri: ["Tarım", "Agriculture"],
  energy: ["Enerji", "Energy"],
  externalDep: ["Dış bağımlılık", "External dependence"],
};
const formLabel = {
  "Kışla-Devlet": "Garrison-State",
  "Bürokrasi-Devlet": "Bureaucracy-State",
  "Parti-Devlet": "Party-State",
  "Bölgesel-Devlet": "Regional-State",
  "Piyasa-Devlet": "Market-State",
  "Güvenlik-Devlet": "Security-State",
};
const modeLabel = {
  grand: ["Büyük kampanya", "Grand campaign"],
  period: ["Dönem", "Period"],
  open: ["Hedefsiz", "Open-ended"],
  doctrine: ["Doktrin", "Doctrine"],
};
function ax(key) {
  const row = axisLabel[key];
  return row ? t(row[0], row[1]) : loc(String(key).replaceAll("_", " "));
}
function formOf(value) {
  return loc(value, formLabel[value]);
}
function modeOf(value) {
  const row = modeLabel[value];
  return row ? t(row[0], row[1]) : loc(value);
}
const root = document.body;
const nav = [
  ["home", "ANA SAYFA", "HOME"],
  ["agenda", "GÜNDEM", "AGENDA"],
  ["economy", "EKONOMİ", "ECONOMY"],
  ["policy", "POLİTİKA", "POLICY"],
  ["institutions", "KURUMLAR", "INSTITUTIONS"],
  ["society", "TOPLUM", "SOCIETY"],
  ["foreign", "DIŞ İLİŞKİLER", "FOREIGN"],
  ["regions", "BÖLGELER", "REGIONS"],
  ["files", "DOSYALAR", "FILES"],
  ["history", "GEÇMİŞ", "HISTORY"],
  ["year", "YIL DOSYASI", "YEAR FILE"],
  ["period-file", "DÖNEM DOSYASI", "PERIOD FILE"],
];
let view = "menu";
let setupDraft = { era: null, mode: null, goal: null, doctrine: null, alt: null };
const legacyPeriodScreen = "periods";
const conf = (state, key) => Math.round((state.known?.[key]?.confidence || 0) * 100);
const agendaOf = (state) =>
  [
    state.reported.inflation > 30 && [
      "Fiyat istikrarı",
      "Price stability",
      `Resmî rapor %${state.reported.inflation}`,
    ],
    state.reported.treasury < 45 && [
      "Hazine alanı daralıyor",
      "Treasury room is narrowing",
      `Rapor ${state.reported.treasury}`,
    ],
    state.heat > 55 && ["Toplumsal ısı", "Social heat", `${Math.round(state.heat)}/100`],
    implementationRate(state) < 55 && [
      "Uygulama kapasitesi",
      "Implementation capacity",
      `${Math.round(implementationRate(state))}/100`,
    ],
    state.infoQuality < 55 && [
      "Veri güveni",
      "Information confidence",
      `${Math.round(state.infoQuality)}/100`,
    ],
    ...(state.files || [])
      .filter((file) => file.status !== "closed")
      .slice(0, 2)
      .map((file) => ["Açık dosya", "Open file", loc(file.title || file.id)]),
  ]
    .filter(Boolean)
    .slice(0, 6);

function reportedCards(state) {
  return `<div class="dashboard-grid"><div class="report-card"><span>${t("ENFLASYON", "INFLATION")}</span><strong>%${state.reported.inflation}</strong><span class="confidence">${t("Bilgi güveni", "Confidence")} %${conf(state, "inflation")}</span></div><div class="report-card"><span>${t("HAZİNE", "TREASURY")}</span><strong>${state.reported.treasury}</strong><span class="confidence">${t("Bilgi güveni", "Confidence")} %${conf(state, "treasury")}</span></div><div class="report-card"><span>${t("İŞSİZLİK", "UNEMPLOYMENT")}</span><strong>%${state.reported.unemployment}</strong><span class="confidence">${t("Bilgi güveni", "Confidence")} %${conf(state, "unemployment")}</span></div><div class="report-card"><span>${t("UYGULAMA", "IMPLEMENTATION")}</span><strong>%${Math.round(implementationRate(state))}</strong><span class="confidence">${t("Kurum verileri gecikmeli olabilir", "Institutional data may lag")}</span></div></div>`;
}

function screenHtml(state) {
  const screen = state.ui?.screen || "home";
  const agenda = agendaOf(state);
  const pool = POLICIES[state.eraId] || POLICIES_2002;
  if (screen === "home" || screen === "agenda")
    return `<section class="card"><p class="eyebrow">${screen === "agenda" ? t("DEVLET GÜNDEMİ", "STATE AGENDA") : t("DEVLET MERKEZİ", "STATE CENTER")}</p>${reportedCards(state)}<div class="agenda">${agenda.map((item) => `<div class="agenda-item"><strong>${h(t(item[0], item[1]))}</strong><br><small>${h(item[2])}</small></div>`).join("") || `<p>${t("Acil gündem yok; kurum uygulamasını izle.", "No urgent agenda; monitor implementation.")}</p>`}</div><h2>${t("Bu ayın ana kararları", "This month's main decisions")}</h2>${decisionCards(state, pool.slice(0, 4))}</section>`;
  if (screen === "economy")
    return `<section class="card"><p class="eyebrow">${t("RAPOR EDİLEN EKONOMİ", "REPORTED ECONOMY")}</p>${reportedCards(state)}<div class="data-grid">${Object.entries(
      state.policyDebt,
    )
      .map(
        ([key, value]) =>
          `<div class="report-card"><span>${h(ax(key))}</span><strong>${Math.round(value)}</strong><small class="muted">${t("Birikmiş politika borcu", "Accumulated policy debt")}</small></div>`,
      )
      .join(
        "",
      )}<div class="report-card"><span>${t("VERİ KALİTESİ", "DATA QUALITY")}</span><strong>${Math.round(state.infoQuality)}</strong><small class="muted">${t("Rapor güvenini etkiler", "Affects report confidence")}</small></div><div class="report-card"><span>${t("SÖYLENTİ BASINCI", "RUMOR PRESSURE")}</span><strong>${Math.round(state.rumor)}</strong><small class="muted">${t("Bilinen ile rapor arasını açar", "Widens known/report gap")}</small></div></div></section>`;
  if (screen === "policy")
    return `<section class="card"><p class="eyebrow">${t("POLİTİKA MASASI", "POLICY DESK")}</p><p>${t("Niyet ile saha sonucu aynı değildir. Ayda iki farklı ana karar seçebilirsin.", "Intent and field outcome are not the same. Choose two different main decisions per month.")}</p>${decisionCards(state, pool)}</section>`;
  if (screen === "institutions")
    return `<section class="card"><p class="eyebrow">${t("KURUMLAR · DEVLET NPC'LERİ", "INSTITUTIONS · STATE NPCS")}</p><div class="institution-grid">${state.institutions.map((inst) => `<article class="report-card"><strong>${h(loc(inst.name))}</strong><p>${t("Kapasite", "Capacity")} ${Math.round(inst.capacity)} · ${t("Özerklik", "Autonomy")} ${Math.round(inst.autonomy ?? 0)}</p><small>${t("Son uygulama", "Last implementation")}: ${h(loc(state.implementationLog.filter((row) => row.policy).at(-1)?.policy || t("yok", "none")))}</small></article>`).join("")}</div><p>${t("Devlet yapısı", "State form")}: ${h(formOf(state.form))} · ${t("Kurumsal entropi", "Institutional entropy")} ${Math.round(state.entropy)}</p></section>`;
  if (screen === "society")
    return `<section class="card"><p class="eyebrow">${t("TOPLUM", "SOCIETY")}</p><div class="data-grid">${state.cohorts.map((cohort) => `<article class="report-card"><strong>${h(loc(cohort.name))}</strong><p>${t("Ruh hali", "Mood")} ${Math.round(cohort.mood)} · ${t("Güven", "Trust")} ${Math.round(cohort.trust)}</p><small>${h(loc(cohort.pressure || t("Ana baskı sahada oluşur", "Pressure forms in the field")))}</small></article>`).join("")}</div></section>`;
  if (screen === "foreign")
    return `<section class="card"><p class="eyebrow">${t("DIŞ İLİŞKİLER", "FOREIGN RELATIONS")}</p><div class="data-grid">${Object.entries(
      state.foreign,
    )
      .map(
        ([key, value]) =>
          `<div class="report-card"><span>${h(ax(key))}</span><strong>${Math.round(value)}</strong><div class="meter"><i style="--value:${value}%"></i></div></div>`,
      )
      .join("")}</div></section>`;
  if (screen === "regions")
    return `<section class="card"><p class="eyebrow">${t("BÖLGE UYGULAMASI", "REGIONAL IMPLEMENTATION")}</p><div class="data-grid">${state.regions.map((region) => `<div class="report-card"><strong>${h(loc(region.name))}</strong><p>${t("Uygulama", "Implementation")} ${Math.round(region.impl)} · ${t("Isı", "Heat")} ${Math.round(region.heat)}</p></div>`).join("")}</div></section>`;
  if (screen === "files")
    return `<section class="card"><p class="eyebrow">${t("AÇIK DOSYALAR", "OPEN FILES")}</p><div class="decision-grid">${(state.files || []).map((file) => `<div class="file"><strong>${h(loc(file.title || file.id))}</strong><br>${t("Durum", "Status")}: ${h(loc(file.status))} · ${file.year || state.time.year}</div>`).join("") || `<p>${t("Açık dosya yok. Dönem olayları ve uygulama gecikmeleri burada görünür.", "No open file. Period events and implementation lags appear here.")}</p>`}</div><h3>${t("Politika borcu", "Policy debt")}</h3><p>${Object.entries(
      state.policyDebt,
    )
      .map(([key, value]) => `${h(ax(key))} ${Math.round(value)}`)
      .join(" · ")}</p></section>`;
  if (screen === "history")
    return `<section class="card"><p class="eyebrow">${t("ANLAMLI GEÇMİŞ", "MEANINGFUL HISTORY")}</p>${
      state.history
        .slice(-20)
        .reverse()
        .map(
          (row) =>
            `<p><strong>${h(loc(row.type))}</strong> · ${h(loc(row.policy || row.era || row.id || row.mode || ""))}</p>`,
        )
        .join("") || `<p>${t("Defter henüz boş.", "The ledger is empty.")}</p>`
    }</section>`;
  if (screen === "year")
    return `<section class="card official-paper"><p class="eyebrow">${t("YIL DOSYASI", "YEAR FILE")}</p>${
      state.yearDigest
        .slice()
        .reverse()
        .map(
          (row) =>
            `<div class="year-row"><strong>${row.year}</strong><span>${t("Enflasyon", "Inflation")} ${Math.round(row.inflation)}</span><span>${t("Isı", "Heat")} ${Math.round(row.heat)}</span><span>${t("Entropi", "Entropy")} ${Math.round(row.entropy)}</span><span>${h(formOf(row.form))}</span></div>`,
        )
        .join("") ||
      `<p>${t("İlk yıl kapanınca ekonomi, kurum, toplum ve dosya özeti burada mühürlenir.", "When the first year closes, economy, institutions, society and files are sealed here.")}</p>`
    }</section>`;
  if (screen === legacyPeriodScreen)
    return screenHtml({ ...state, ui: { ...state.ui, screen: "period-file" } });
  const period = PERIODS[state.eraId];
  return `<section class="card"><p class="eyebrow">${t("DÖNEM DOSYASI", "PERIOD FILE")}</p><h2>${h(loc(period?.name || state.eraId))}</h2><p>${h(loc(period?.theme || t("Seçili devlet dönemi", "Selected state period")))}</p><div class="data-grid"><article class="report-card"><span>${t("Devlet biçimi", "State form")}</span><strong>${h(formOf(state.form))}</strong></article><article class="report-card"><span>${t("Kampanya", "Campaign")}</span><strong>${state.scenario?.campaign ? t("Büyük", "Grand") : t("Dönem", "Period")}</strong></article></div></section>`;
}

function decisionCards(state, pool) {
  const remaining = state.flags.decisionsRemaining ?? 2;
  const picked = state.flags.decisionIds || [];
  return `<div class="decision-grid">${pool.map((policy) => `<button type="button" class="decision ${picked.includes(policy.id) ? "is-picked" : ""}" data-policy="${h(policy.id)}" ${remaining <= 0 || picked.includes(policy.id) ? "disabled" : ""}><strong>${h(loc(policy.name))}</strong><span>${h(loc(policy.intent))}</span><small>${t("Kurum", "Institution")}: ${h(loc(policy.inst))} · ${t("kapasite ihtiyacı", "capacity need")} ${policy.capacityNeed} · ${t("maliyet", "cost")} ${policy.cost}</small></button>`).join("")}</div>`;
}

const setupReady = () =>
  Boolean(
    setupDraft.era &&
    setupDraft.mode &&
    setupDraft.doctrine &&
    (setupDraft.era !== "grand" || setupDraft.goal) &&
    (setupDraft.era !== "alternatif" || setupDraft.alt),
  );
const setupChoice = (field, value, title, detail = "") =>
  `<button type="button" class="setup-choice ${setupDraft[field] === value ? "is-picked" : ""}" data-setup-field="${field}" data-setup-value="${h(value)}"><strong>${h(title)}</strong><small>${h(detail)}</small></button>`;

function setupScreen(session) {
  const period = setupDraft.era === "grand" ? PERIODS["1923"] : PERIODS[setupDraft.era];
  const doctrine = DOCTRINES.find((item) => item.id === setupDraft.doctrine);
  const alt = ALT_PRESETS.find((item) => item.id === setupDraft.alt);
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell card"><p class="eyebrow">${t("DEVLET KURULUŞ DOSYASI", "STATE INTAKE FILE")}</p><h1>TC SIM: DEVLET</h1><h2>1 · ${t("DÖNEM", "PERIOD")}</h2><div class="setup-grid">${Object.values(
    PERIODS,
  )
    .map((item) => setupChoice("era", item.id, loc(item.name), loc(item.theme)))
    .join(
      "",
    )}${setupChoice("era", "grand", "1923–2030", t("Büyük kampanya", "Grand campaign"))}</div>${setupDraft.era ? `<h2>2 · ${t("OYUN MODU", "GAME MODE")}</h2><div class="setup-grid">${setupChoice("mode", setupDraft.era === "grand" ? "grand" : "period", setupDraft.era === "grand" ? t("Büyük Kampanya", "Grand Campaign") : t("Dönem Kampanyası", "Period Campaign"), period?.name || "")}</div>` : ""}${setupDraft.era === "grand" ? `<h2>3 · ${t("HEDEF MODU", "GOAL MODE")}</h2><div class="setup-grid">${setupChoice("goal", "open", t("Hedefsiz", "Open-ended"), t("Serbest devlet aklı", "Free statecraft"))}${setupChoice("goal", "doctrine", t("Doktrin hedefli", "Doctrine target"), t("Doktrin devlet DNA'sını değiştirir", "Doctrine changes state DNA"))}</div>` : ""}${
    setupDraft.mode
      ? `<h2>4 · ${t("DOKTRİN", "DOCTRINE")}</h2><div class="setup-grid">${setupChoice("doctrine", "none", t("Doktrin yok", "No doctrine"), t("Başlangıç DNA'sını korur", "Keeps starting DNA"))}${DOCTRINES.map(
          (item) =>
            setupChoice(
              "doctrine",
              item.id,
              item.name,
              Object.entries(item.prefer)
                .map(([key, value]) => `${ax(key)} ${value > 0 ? "+" : ""}${value}`)
                .join(" · "),
            ),
        ).join("")}</div>`
      : ""
  }${setupDraft.era === "alternatif" ? `<h2>5 · ${t("ALTERNATİF PRESET", "ALTERNATIVE PRESET")}</h2><div class="setup-grid">${ALT_PRESETS.map((item) => setupChoice("alt", item.id, loc(item.name), formOf(item.form || "") || loc(item.form || ""))).join("")}</div>` : ""}${setupReady() ? `<section class="setup-summary"><p class="eyebrow">${t("DEVLET DOSYASI", "STATE FILE")}</p><h2>${h(loc(period?.name || "1923–2030"))}</h2><p>${t("Mod", "Mode")}: <b>${h(modeOf(setupDraft.mode))}</b> · ${t("Hedef", "Goal")}: <b>${h(modeOf(setupDraft.goal || "period"))}</b> · ${t("Doktrin", "Doctrine")}: <b>${h(loc(doctrine?.name || t("Yok", "None")))}</b>${alt ? ` · ${h(loc(alt.name))}` : ""}</p><p>${t("Başlangıç ekonomisi", "Starting economy")}: ${t("Enflasyon", "Inflation")} %${period?.economy?.inflation} · ${t("Hazine", "Treasury")} ${period?.economy?.treasury}</p></section>` : ""}<div class="setup-actions"><button type="button" id="cancel-setup" class="secondary">${t("GERİ", "BACK")}</button><button type="button" id="confirm-start" ${setupReady() ? "" : "disabled"}>${t("DEVLETİ DEVRAL", "TAKE THE STATE")}</button></div></section></main>`;
  root.querySelectorAll("[data-setup-field]").forEach((button) =>
    button.addEventListener("click", () => {
      const field = button.dataset.setupField;
      setupDraft[field] = button.dataset.setupValue;
      if (field === "era") {
        setupDraft.mode = setupDraft.era === "grand" ? "grand" : "period";
        setupDraft.goal = setupDraft.era === "grand" ? null : "period";
        setupDraft.doctrine = null;
        setupDraft.alt = null;
      }
      setupScreen(session);
    }),
  );
  root.querySelector("#cancel-setup").addEventListener("click", () => {
    session.cancelNew();
    view = "menu";
    draw(session);
  });
  root.querySelector("#confirm-start").addEventListener("click", () => {
    if (!setupReady()) return;
    const options = {
      campaign: setupDraft.mode === "grand",
      doctrine: setupDraft.doctrine === "none" ? undefined : setupDraft.doctrine,
      alt: setupDraft.alt || undefined,
    };
    session.commitNew({
      factory: () => hydrateDevlet(setupDraft.era === "grand" ? "1923" : setupDraft.era, options),
      configure: (state) => {
        state.scenario.mode = setupDraft.mode;
        state.scenario.goalMode = setupDraft.goal;
        state.ui.screen = "home";
      },
    });
  });
}

function draw(session) {
  const state = session.state;
  if (!state) {
    if (view === "setup") return setupScreen(session);
    root.innerHTML = frontMenu(session, {
      title: "TC SIM: DEVLET",
      eyebrow: t("4000 YILLIK DEVLET AKLI", "4,000 YEARS OF STATECRAFT"),
      pitch: t(
        "Aylık gündem, iki ana karar, kurum uygulaması ve asla tam olmayan bilgi.",
        "Monthly agenda, two main decisions, institutional implementation and never-complete information.",
      ),
      slotSummary: (s) =>
        `${s.time?.year || "—"}/${String(s.time?.month || 1).padStart(2, "0")} · ${h(loc(PERIODS[s.eraId]?.name || s.eraId))}`,
    });
    bindFrontMenu(root, session, {
      onNew: () => {
        setupDraft = { era: null, mode: null, goal: null, doctrine: null, alt: null };
        view = "setup";
        draw(session);
      },
    });
    return;
  }
  const screen = state.ui?.screen || "home";
  const remaining = state.flags.decisionsRemaining ?? 2;
  root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">TC SIM: DEVLET</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="state-head"><div><p class="eyebrow">${state.time.year}/${String(state.time.month).padStart(2, "0")} · ${h(loc(PERIODS[state.eraId]?.name || state.eraId))}</p><h1>${t("Devlet Merkezi", "State Center")}</h1></div><div class="state-metrics"><span class="pill">${t("Hazine raporu", "Treasury report")} ${state.reported.treasury}</span><span class="pill">${t("Enflasyon raporu", "Inflation report")} %${state.reported.inflation}</span><span class="pill">${t("Kapasite", "Capacity")} ${Math.round(implementationRate(state))}</span></div></section><section class="state-layout"><nav class="state-nav" aria-label="${t("Devlet bölümleri", "State sections")}">${nav.map((item) => `<button type="button" class="${screen === item[0] ? "is-active" : ""}" data-screen="${item[0]}">${t(item[1], item[2])}</button>`).join("")}</nav><div class="state-center">${screenHtml(state)}<div class="month-bar"><span><strong>${t("ANA KARAR", "MAIN DECISION")} ${2 - remaining}/2</strong><br><small class="muted">${remaining ? t(`${remaining} karar hakkı kalır. Ayı ilerletirsen yanar.`, `${remaining} decision(s) remain. Advancing forfeits them.`) : t("Kurumlar iki kararı uygulamaya hazır.", "Institutions are ready to implement both decisions.")}</small></span><button type="button" id="advance" ${state.flags.campaignEnd ? "disabled" : ""}>${state.flags.campaignEnd ? t("DÖNEM KAPANDI", "PERIOD CLOSED") : t("AYI İLERLET", "ADVANCE MONTH")}</button></div></div></section><p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Gündem state'ten doğar. Her ay iki farklı ana karar seç. Ayı İlerlet tek transaction içinde kurum uygulamasını, fiili değişimi, raporlanan bilgiyi, güven seviyesini, açık dosyaları, geçmişi ve yıl dosyasını günceller. Normal ekranda fiili enflasyon/hazine/işsizlik gösterilmez.", "The agenda is derived from state. Choose two different main decisions each month. Advance Month updates institutional implementation, actual change, reported information, confidence, open files, history and the year file in one transaction. Actual inflation, treasury and unemployment are not shown in the normal UI.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
  root
    .querySelectorAll("[data-screen]")
    .forEach((button) =>
      button.addEventListener("click", () => session.setUI("screen", button.dataset.screen)),
    );
  root
    .querySelectorAll("[data-policy]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`policy:${button.dataset.policy}`)),
    );
  root.querySelector("#advance").addEventListener("click", () => session.act("advance"));
  bindSavePanel(root, session);
}

bootGame("tc-sim-devlet", draw);
