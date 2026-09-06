import { PERIODS, POLICIES, POLICIES_2002, implementationRate } from "../next-wave.js";
import {
  bindSavePanel,
  bootGame,
  escapeHtml as h,
  savePanel,
  text as t,
} from "../next-wave/shared/runtime.js";

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
  ["periods", "DÖNEMLER", "PERIODS"],
];
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
      .map((file) => ["Açık dosya", "Open file", file.id]),
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
          `<div class="report-card"><span>${h(key.replaceAll("_", " "))}</span><strong>${Math.round(value)}</strong><small class="muted">${t("Birikmiş politika borcu", "Accumulated policy debt")}</small></div>`,
      )
      .join(
        "",
      )}<div class="report-card"><span>${t("VERİ KALİTESİ", "DATA QUALITY")}</span><strong>${Math.round(state.infoQuality)}</strong><small class="muted">${t("Rapor güvenini etkiler", "Affects report confidence")}</small></div><div class="report-card"><span>${t("SÖYLENTİ BASINCI", "RUMOR PRESSURE")}</span><strong>${Math.round(state.rumor)}</strong><small class="muted">${t("Bilinen ile rapor arasını açar", "Widens known/report gap")}</small></div></div></section>`;
  if (screen === "policy")
    return `<section class="card"><p class="eyebrow">${t("POLİTİKA MASASI", "POLICY DESK")}</p><p>${t("Niyet ile saha sonucu aynı değildir. Ayda iki farklı ana karar seçebilirsin.", "Intent and field outcome are not the same. Choose two different main decisions per month.")}</p>${decisionCards(state, pool)}</section>`;
  if (screen === "institutions")
    return `<section class="card"><p class="eyebrow">${t("KURUMLAR · DEVLET NPC'LERİ", "INSTITUTIONS · STATE NPCS")}</p><div class="institution-grid">${state.institutions.map((inst) => `<article class="report-card"><strong>${h(inst.name)}</strong><p>${t("Kapasite", "Capacity")} ${Math.round(inst.capacity)} · ${t("Özerklik", "Autonomy")} ${Math.round(inst.autonomy ?? 0)}</p><small>${t("Son uygulama", "Last implementation")}: ${h(state.implementationLog.filter((row) => row.policy).at(-1)?.policy || t("yok", "none"))}</small></article>`).join("")}</div><p>${t("Devlet yapısı", "State form")}: ${h(state.form)} · ${t("Kurumsal entropi", "Institutional entropy")} ${Math.round(state.entropy)}</p></section>`;
  if (screen === "society")
    return `<section class="card"><p class="eyebrow">${t("TOPLUM", "SOCIETY")}</p><div class="data-grid">${state.cohorts.map((cohort) => `<article class="report-card"><strong>${h(cohort.name)}</strong><p>${t("Ruh hali", "Mood")} ${Math.round(cohort.mood)} · ${t("Güven", "Trust")} ${Math.round(cohort.trust)}</p><small>${h(cohort.pressure || t("Ana baskı sahada oluşur", "Pressure forms in the field"))}</small></article>`).join("")}</div></section>`;
  if (screen === "foreign")
    return `<section class="card"><p class="eyebrow">${t("DIŞ İLİŞKİLER", "FOREIGN RELATIONS")}</p><div class="data-grid">${Object.entries(
      state.foreign,
    )
      .map(
        ([key, value]) =>
          `<div class="report-card"><span>${h(key.replaceAll("_", " "))}</span><strong>${Math.round(value)}</strong><div class="meter"><i style="--value:${value}%"></i></div></div>`,
      )
      .join("")}</div></section>`;
  if (screen === "regions")
    return `<section class="card"><p class="eyebrow">${t("BÖLGE UYGULAMASI", "REGIONAL IMPLEMENTATION")}</p><div class="data-grid">${state.regions.map((region) => `<div class="report-card"><strong>${h(region.name)}</strong><p>${t("Uygulama", "Implementation")} ${Math.round(region.impl)} · ${t("Isı", "Heat")} ${Math.round(region.heat)}</p></div>`).join("")}</div></section>`;
  if (screen === "files")
    return `<section class="card"><p class="eyebrow">${t("AÇIK DOSYALAR", "OPEN FILES")}</p><div class="decision-grid">${(state.files || []).map((file) => `<div class="file"><strong>${h(file.id)}</strong><br>${t("Durum", "Status")}: ${h(file.status)} · ${file.year || state.time.year}</div>`).join("") || `<p>${t("Açık dosya yok. Dönem olayları ve uygulama gecikmeleri burada görünür.", "No open file. Period events and implementation lags appear here.")}</p>`}</div><h3>${t("Politika borcu", "Policy debt")}</h3><p>${Object.entries(
      state.policyDebt,
    )
      .map(([key, value]) => `${h(key)} ${Math.round(value)}`)
      .join(" · ")}</p></section>`;
  if (screen === "history")
    return `<section class="card"><p class="eyebrow">${t("ANLAMLI GEÇMİŞ", "MEANINGFUL HISTORY")}</p>${
      state.history
        .slice(-20)
        .reverse()
        .map(
          (row) =>
            `<p><strong>${h(row.type)}</strong> · ${h(row.policy || row.era || row.id || row.mode || "")}</p>`,
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
            `<div class="year-row"><strong>${row.year}</strong><span>${t("Enflasyon", "Inflation")} ${Math.round(row.inflation)}</span><span>${t("Isı", "Heat")} ${Math.round(row.heat)}</span><span>${t("Entropi", "Entropy")} ${Math.round(row.entropy)}</span><span>${h(row.form)}</span></div>`,
        )
        .join("") ||
      `<p>${t("İlk yıl kapanınca ekonomi, kurum, toplum ve dosya özeti burada mühürlenir.", "When the first year closes, economy, institutions, society and files are sealed here.")}</p>`
    }</section>`;
  return `<section class="card"><p class="eyebrow">${t("DÖNEMLER", "PERIODS")}</p><h2>2002–2005 · ${t("Önerilen çekirdek", "Recommended core")}</h2><button type="button" data-era="2002">${t("2002–05 DEVLETİNİ DEVRAL", "TAKE THE 2002–05 STATE")}</button><details class="advanced"><summary>${t("Deneysel / gelişmiş dönemler", "Experimental / advanced periods")}</summary><div class="decision-grid">${Object.values(
    PERIODS,
  )
    .filter((period) => period.id !== "2002")
    .map(
      (period) =>
        `<button type="button" data-era="${h(period.id)}"><strong>${h(period.name)}</strong><br><small>${h(period.theme)}</small></button>`,
    )
    .join("")}</div></details></section>`;
}

function decisionCards(state, pool) {
  const remaining = state.flags.decisionsRemaining ?? 2;
  const picked = state.flags.decisionIds || [];
  return `<div class="decision-grid">${pool.map((policy) => `<button type="button" class="decision ${picked.includes(policy.id) ? "is-picked" : ""}" data-policy="${h(policy.id)}" ${remaining <= 0 || picked.includes(policy.id) ? "disabled" : ""}><strong>${h(policy.name)}</strong><span>${h(policy.intent)}</span><small>${t("Kurum", "Institution")}: ${h(policy.inst)} · ${t("kapasite ihtiyacı", "capacity need")} ${policy.capacityNeed} · ${t("maliyet", "cost")} ${policy.cost}</small></button>`).join("")}</div>`;
}

function draw(session) {
  const state = session.state;
  if (!state) {
    root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="state-head"><div><p class="eyebrow">${t("ÖNERİLEN DÖNEM · 2002–2005", "RECOMMENDED PERIOD · 2002–2005")}</p><h1>TC SIM: DEVLET</h1><p class="muted">${t("Aylık gündem. İki ana karar. Kurum uygulaması. Sana ulaşan rapor hiçbir zaman gerçeğin tamamı değil.", "Monthly agenda. Two main decisions. Institutional implementation. The report reaching you is never the whole truth.")}</p></div></section><section class="card"><h2>${t("Devlet merkezini devral", "Take the state center")}</h2><p>${t("2002 krizi sonrasında hazine dar, enflasyon yüksek, kurum kapasitesi parçalı. Bu çekirdek deneyim 2002–05 için tamamlandı.", "After the 2002 crisis the treasury is tight, inflation high and institutional capacity fragmented. This core experience is complete for 2002–05.")}</p><button type="button" id="start">${t("DEVLETİ DEVRAL", "TAKE THE STATE")}</button><details class="advanced"><summary>${t("Deneysel / gelişmiş dönemler", "Experimental / advanced periods")}</summary><p>${t("1923, 1950, 1980, Günümüz, Alternatif ve büyük kampanya mevcut motoru korur; ana shipping deneyimi değildir.", "1923, 1950, 1980, Present, Alternative and the grand campaign remain available in the engine; they are not the primary shipping experience.")}</p></details></section></main>`;
    root.querySelector("#start").addEventListener("click", () => session.start());
    bindSavePanel(root, session);
    return;
  }
  const screen = state.ui?.screen || "home";
  const remaining = state.flags.decisionsRemaining ?? 2;
  root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">TC SIM: DEVLET</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="state-head"><div><p class="eyebrow">${state.time.year}/${String(state.time.month).padStart(2, "0")} · ${h(PERIODS[state.eraId]?.name || state.eraId)}</p><h1>${t("Devlet Merkezi", "State Center")}</h1></div><div class="state-metrics"><span class="pill">${t("Hazine raporu", "Treasury report")} ${state.reported.treasury}</span><span class="pill">${t("Enflasyon raporu", "Inflation report")} %${state.reported.inflation}</span><span class="pill">${t("Kapasite", "Capacity")} ${Math.round(implementationRate(state))}</span></div></section><section class="state-layout"><nav class="state-nav" aria-label="${t("Devlet bölümleri", "State sections")}">${nav.map((item) => `<button type="button" class="${screen === item[0] ? "is-active" : ""}" data-screen="${item[0]}">${t(item[1], item[2])}</button>`).join("")}</nav><div class="state-center">${screenHtml(state)}<div class="month-bar"><span><strong>${t("ANA KARAR", "MAIN DECISION")} ${2 - remaining}/2</strong><br><small class="muted">${remaining ? t(`${remaining} karar hakkı kalır. Ayı ilerletirsen yanar.`, `${remaining} decision(s) remain. Advancing forfeits them.`) : t("Kurumlar iki kararı uygulamaya hazır.", "Institutions are ready to implement both decisions.")}</small></span><button type="button" id="advance" ${state.flags.campaignEnd ? "disabled" : ""}>${state.flags.campaignEnd ? t("DÖNEM KAPANDI", "PERIOD CLOSED") : t("AYI İLERLET", "ADVANCE MONTH")}</button></div></div></section><p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Gündem state'ten doğar. Her ay iki farklı ana karar seç. Ayı İlerlet tek transaction içinde kurum uygulamasını, fiili değişimi, raporlanan bilgiyi, güven seviyesini, açık dosyaları, geçmişi ve yıl dosyasını günceller. Normal ekranda fiili enflasyon/hazine/işsizlik gösterilmez.", "The agenda is derived from state. Choose two different main decisions each month. Advance Month updates institutional implementation, actual change, reported information, confidence, open files, history and the year file in one transaction. Actual inflation, treasury and unemployment are not shown in the normal UI.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
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
  root
    .querySelectorAll("[data-era]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`era:${button.dataset.era}`)),
    );
  root.querySelector("#advance").addEventListener("click", () => session.act("advance"));
  bindSavePanel(root, session);
}

bootGame("tc-sim-devlet", draw);
