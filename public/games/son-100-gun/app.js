import { SCENARIOS, SON_ACTIONS } from "../next-wave.js";
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

const root = document.body;
const actionById = new Map(SON_ACTIONS.map((action) => [action.id, action]));
const signed = (n) => `${n > 0 ? "+" : ""}${n || 0}`;
let view = "menu";
let selectedScenario = null;

function slotSummary(state) {
  const scenario = SCENARIOS.find((item) => item.id === state.scenarioId);
  return `${state.remainingDays} ${t("gün", "days")} · ${loc(scenario?.name || state.scenarioId)} · ₺${state.resources.money} · ${t("enerji", "energy")} ${state.resources.energy}`;
}

function menu(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header>${frontMenu(
    session,
    {
      kicker: t("ZAMAN DOSYASI", "TIME FILE"),
      title: "SON 100 GÜN",
      pitch: t(
        "Yüz gün. Günde iki karar. Her şeyi kurtaramazsın.",
        "One hundred days. Two decisions a day. You cannot save everything.",
      ),
      summary: slotSummary,
      help: t(
        "Bir senaryo seç. Her gün iki aksiyon kullan; süreli fırsatları ve yükümlülükleri kaçırmadan 100 günü tamamla.",
        "Choose a scenario. Use two actions each day and finish the hundred days without losing every timed window and obligation.",
      ),
    },
  )}</main>`;
  bindFrontMenu(root, session, {
    onNew: () => {
      selectedScenario = null;
      view = "setup";
      session.render();
    },
  });
}

function setup(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell"><section class="count-head"><div class="count-number">100</div><div><p class="eyebrow">${t("SENARYONU SEÇ", "CHOOSE YOUR SCENARIO")}</p><h1>SON 100 GÜN</h1><p class="muted">${t("Başlangıç yükün sessizce seçilmez. On sekiz senaryodan birini belirle.", "Your starting burden is never chosen silently. Pick one of eighteen scenarios.")}</p></div></section><section class="scenario-grid">${SCENARIOS.map((scenario, index) => `<button type="button" class="scenario ${index < 5 ? "recommended" : ""} ${selectedScenario === scenario.id ? "is-selected" : ""}" data-scenario="${h(scenario.id)}" aria-pressed="${selectedScenario === scenario.id}"><strong>${h(loc(scenario.name))}</strong><p>${h(loc(scenario.goal))}</p><small>${index < 5 ? t("ÖNERİLEN", "RECOMMENDED") + " · " : ""}₺${scenario.resources.money} · ${t("enerji", "energy")} ${scenario.resources.energy} · ${t("umut", "hope")} ${scenario.resources.hope}${Object.keys(scenario.relations || {}).length ? ` · ${t("ilişki yükü", "relationship pressure")}` : ""}</small></button>`).join("")}</section><div class="setup-actions"><button type="button" id="cancel-setup">${t("GERİ", "BACK")}</button><button type="button" id="confirm-start" class="primary" ${selectedScenario ? "" : "disabled"}>${t("100 GÜNÜ BAŞLAT", "START THE 100 DAYS")}</button></div></section></main>`;
  root.querySelectorAll("[data-scenario]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedScenario = button.dataset.scenario;
      session.render();
    }),
  );
  root.querySelector("#cancel-setup").addEventListener("click", () => {
    session.cancelNew();
    selectedScenario = null;
    view = "menu";
    session.render();
  });
  root.querySelector("#confirm-start").addEventListener("click", () => {
    if (selectedScenario) session.commitNew({ action: `scenario:${selectedScenario}` });
  });
}

function draw(session) {
  const state = session.state;
  if (!state) return view === "setup" ? setup(session) : menu(session);
  if (state.flags.finalReport) {
    const report = state.flags.report || {};
    root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="count-head"><div class="count-number">0</div><div><p class="eyebrow">${t("FİNAL RAPORU", "FINAL REPORT")}</p><h1>${t("Yüz gün bitti", "The hundred days are over")}</h1></div></section><section class="card"><div class="stat-list"><div>${t("Nakit", "Cash")}<strong>₺${state.resources.money}</strong></div><div>${t("Enerji", "Energy")}<strong>${state.resources.energy}</strong></div><div>${t("Umut", "Hope")}<strong>${state.resources.hope}</strong></div><div>${t("Yakalanan fırsat", "Caught windows")}<strong>${report.caught || 0}</strong></div><div>${t("Kaçan fırsat", "Expired windows")}<strong>${report.expired || 0}</strong></div><div>${t("Kaçan yüküm", "Missed obligations")}<strong>${state.missed.length}</strong></div></div></section><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Final rapor terminaldir; yeni gün veya üçüncü aksiyon üretmez.", "The final report is terminal; it cannot create another day or third action.")}</p></details></main>`;
    bindSavePanel(root, session);
    return;
  }

  const openWindows = (state.opportunities || []).filter((item) => item.status === "open");
  const choiceIds = [
    ...new Set([
      ...openWindows.flatMap((item) => item.choices || []),
      "work",
      "rest",
      "family",
      "pay",
    ]),
  ]
    .filter((id) => actionById.has(id))
    .slice(0, 6);
  const today = state.day;
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">SON 100 GÜN</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="count-head"><div class="count-number">${state.remainingDays}</div><div><p class="eyebrow">${t("KALAN GÜN", "DAYS LEFT")}</p><h1>${h(loc(SCENARIOS.find((scenario) => scenario.id === state.scenarioId)?.name || state.scenarioId))}</h1></div><div class="action-counter">${t("AKSİYON", "ACTION")} ${2 - state.actionsRemaining}/2<br><small class="muted">${t("Gün", "Day")} ${today}</small></div></section>
    <section class="hundred-grid"><aside class="card"><p class="eyebrow">${t("TAKVİM", "CALENDAR")}</p><div class="calendar-strip">${Array.from(
      { length: 7 },
      (_, offset) => {
        const day = today + offset;
        const due = state.obligations
          .filter((item) => item.status === "open" && item.due === offset)
          .map((item) => loc(item.title));
        const expiry = openWindows
          .filter((item) => item.expiresOn === day)
          .map((item) => loc(item.title));
        return `<div class="calendar-day ${offset === 0 ? "today" : ""}"><b>${day}</b><span>${h([...due, ...expiry].join(" · ") || t("boş", "open"))}</span></div>`;
      },
    ).join("")}</div></aside>
      <section class="card today-panel"><p class="eyebrow">${t("BUGÜN", "TODAY")}</p>${openWindows.map((window) => `<div class="window"><strong>${h(loc(window.title))}</strong><br><small>${t("Son gün", "Last day")} ${window.expiresOn} · ${t("kaçarsa sonuç doğar", "missing it has a consequence")}</small></div>`).join("") || `<p class="muted">${t("Bugün açık fırsat yok; yükümlülüklerini ve enerjini tart.", "No open window today; weigh obligations and energy.")}</p>`}<div class="action-grid">${choiceIds
        .map((id) => {
          const action = actionById.get(id);
          return `<button type="button" class="action-card" data-action="${h(id)}"><strong>${h(loc(action.label))}</strong><small>1 ${t("aksiyon", "action")} · ₺${signed(action.money)} · ${t("enerji", "energy")} ${signed(action.energy)} · ${t("umut", "hope")} ${signed(action.hope)}</small></button>`;
        })
        .join(
          "",
        )}</div><button type="button" id="finish-day" class="day-close">${state.actionsRemaining > 0 ? t(`GÜNÜ BİTİR · ${state.actionsRemaining} hak yanar`, `END DAY · forfeit ${state.actionsRemaining} action(s)`) : t("YENİ GÜN", "NEW DAY")}</button></section>
      <aside class="card status-panel"><p class="eyebrow">${t("DURUM", "STATUS")}</p><div class="stat-list"><div>${t("Nakit", "Cash")}<strong>₺${state.resources.money}</strong></div><div>${t("Enerji", "Energy")}<strong>${state.resources.energy}</strong></div><div>${t("Umut", "Hope")}<strong>${state.resources.hope}</strong></div></div><h3>${t("Zorunluluklar", "Obligations")}</h3>${
        state.obligations
          .filter((item) => item.status === "open")
          .map(
            (item) =>
              `<p><strong>${h(loc(item.title))}</strong><br><small>${item.due} ${t("gün ·", "days ·")} ₺${item.cost || 0}</small></p>`,
          )
          .join("") || `<p>${t("Açık yüküm yok.", "No open obligation.")}</p>`
      }</aside></section>
    <div class="recent">${state.history
      .slice(-8)
      .reverse()
      .map(
        (row) =>
          `<span>${row.type === "act" ? t("Karar", "Decision") + ": " + h(loc(row.id)) : row.type === "opportunity" ? t("Fırsat", "Window") + ": " + h(loc(row.result)) : h(loc(row.type))}</span>`,
      )
      .join(
        "",
      )}</div><p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Her gün tam iki aksiyonun var. Kartlar para, enerji ve ilişki bedelini gösterir. Fırsatların son günü vardır. Günü erken bitirirsen kullanılmayan hak yanar; 0'da Final Raporu açılır.", "You have exactly two actions per day. Cards show money, energy and relationship costs. Windows expire. Ending early forfeits unused actions; day zero opens the Final Report.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
  root
    .querySelectorAll("[data-action]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`act:${button.dataset.action}`)),
    );
  root.querySelector("#finish-day").addEventListener("click", () => session.act("advance"));
  bindSavePanel(root, session);
}

bootGame("son-100-gun", draw);
