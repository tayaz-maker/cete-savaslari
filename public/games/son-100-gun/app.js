import { SCENARIOS, SON_ACTIONS } from "../next-wave.js";
import { availableSonActions, sonPhase, sonSoul, sonDeathScene } from "../next-wave/son100-sim.js";
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
        "Öleceğini biliyorsun. İntihar yok. Yüz günün sonunda kesin öleceksin. O zamana kadar kimi seveceğin, kimi mahvedeceğin ve arkanda ne bırakacağın oyunun kendisi.",
        "You know you will die. There is no suicide. On day zero you die. Until then who you love, who you ruin and what you leave behind is the game.",
      ),
      summary: slotSummary,
      help: t(
        "Bir senaryo seç; o senaryonun yükü ve ilişkileriyle başlarsın. Her gün tam iki aksiyonun var; kullanmadığın hak o gün söner, ertesi güne taşınmaz. Takvimde yaklaşan zorunlulukları ve son günü gelen fırsat pencerelerini izle — bazısı kaçırılırsa bir daha açılmaz. Son günlere yaklaştıkça enerjin daha hızlı tükenir ve seçenekler daralır. Gün 0'da oyun biter; o ana kadarki kararlarından bir ölüm ve hüküm ekranı çıkar. İntihar yok. İlerleyişin her hamlede otomatik kaydedilir; üç ayrı kayıt yerin de var.",
        "Pick a scenario. Two actions a day. Ending early burns unused rights. Day zero is death and verdict.",
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

function paintScenarioSelection() {
  root.querySelectorAll("[data-scenario]").forEach((button) => {
    const on = button.dataset.scenario === selectedScenario;
    button.classList.toggle("is-selected", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
  const confirm = root.querySelector("#confirm-start");
  if (!confirm) return;
  if (selectedScenario) confirm.removeAttribute("disabled");
  else confirm.setAttribute("disabled", "");
}

function chooseScenario(id) {
  if (!SCENARIOS.some((item) => item.id === id)) return;
  selectedScenario = id;
  paintScenarioSelection();
}

function setup(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell"><section class="count-head"><div class="count-number">100</div><div><p class="eyebrow">${t("SENARYONU SEÇ", "CHOOSE YOUR SCENARIO")}</p><h1>SON 100 GÜN</h1><p class="muted">${t("Başlangıç yükün sessizce seçilmez. Kartı seç, sonra 100 günü başlat.", "Your starting burden is never chosen silently. Select a card, then start the hundred days.")}</p></div></section><section class="scenario-grid" role="listbox" aria-label="${t("Senaryolar", "Scenarios")}">${SCENARIOS.map((scenario, index) => `<button type="button" class="scenario ${index < 5 ? "recommended" : ""}" data-scenario="${h(scenario.id)}" aria-pressed="false" role="option"><strong>${h(loc(scenario.name))}</strong><p>${h(loc(scenario.context || scenario.goal))}</p><small>${index < 5 ? t("ÖNERİLEN", "RECOMMENDED") + " · " : ""}${h(loc(scenario.hook || scenario.goal))} · ₺${scenario.resources.money} · ${t("enerji", "energy")} ${scenario.resources.energy} · ${t("umut", "hope")} ${scenario.resources.hope}</small></button>`).join("")}</section><div class="setup-actions"><button type="button" id="cancel-setup">${t("GERİ", "BACK")}</button><button type="button" id="confirm-start" class="primary" disabled>${t("100 GÜNÜ BAŞLAT", "START THE 100 DAYS")}</button></div></section></main>`;
  paintScenarioSelection();
  const grid = root.querySelector(".scenario-grid");
  const pick = (event) => {
    const button = event.target.closest("[data-scenario]");
    if (!button || !grid.contains(button)) return;
    event.preventDefault();
    chooseScenario(button.dataset.scenario);
  };
  grid.addEventListener("click", pick);
  grid.addEventListener("pointerup", (event) => {
    if (event.pointerType === "mouse") return;
    pick(event);
  });
  grid.addEventListener("keydown", (event) => {
    const button = event.target.closest("[data-scenario]");
    if (!button) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseScenario(button.dataset.scenario);
    }
  });
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

function relValue(state, id) {
  return state.relationships?.find((item) => item.id === id)?.value ?? 50;
}

function draw(session) {
  const state = session.state;
  if (!state) return view === "setup" ? setup(session) : menu(session);
  if (state.flags.finalReport) {
    const report = state.flags.report || {};
    const scene = sonDeathScene(state);
    root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="count-head"><div class="count-number">0</div><div><p class="eyebrow">${t("ÖLÜM VE HÜKÜM", "DEATH AND VERDICT")}</p><h1>${h(loc(report.verdictTitle || t("Yüz gün bitti", "The hundred days are over")))}</h1></div></section>
      <section class="card verdict-banner"><p class="verdict-kicker">${h(loc(report.verdictKicker || ""))}</p><p class="verdict-line">${h(loc(report.verdictLine || ""))}</p><p>${h(loc(report.verdictText || ""))}</p><p class="muted">${h(loc(scene))}</p></section>
      <section class="card"><div class="stat-list"><div>${t("Nakit / borç", "Cash / debt")}<strong>₺${state.resources.money}</strong></div><div>${t("Enerji", "Energy")}<strong>${state.resources.energy}</strong></div><div>${t("Umut", "Hope")}<strong>${state.resources.hope}</strong></div><div>${t("Merhamet", "Mercy")}<strong>${report.mercy || 0}</strong></div><div>${t("Zarar", "Harm")}<strong>${report.harm || 0}</strong></div><div>${t("İman", "Faith")}<strong>${report.faith || 0}</strong></div><div>${t("Kaçan yüküm", "Missed obligations")}<strong>${(state.missed || []).length}</strong></div></div></section>
      <section class="card"><h3>${t("Arkanda kalan", "What remains")}</h3><ul class="report-list">${(report.helped || []).map((row) => `<li>${h(loc(row))}</li>`).join("")}${(report.harmed || []).map((row) => `<li>${h(loc(row))}</li>`).join("") || `<li>${t("Kimseye özel bir iz bırakmadın.", "You left no particular mark on anyone.")}</li>`}</ul><p>${t("Açık dosya", "Open files")}: ${(report.unresolved || []).map((row) => h(loc(row))).join(" · ") || t("yok", "none")}</p></section>
      <details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Final rapor terminaldir; yeni gün veya üçüncü aksiyon üretmez. Hüküm kayıttan hesaplanır, yenilenmez.", "The final report is terminal; it cannot create another day or third action. The verdict is computed from the save and does not reroll.")}</p></details></main>`;
    bindSavePanel(root, session);
    return;
  }

  const phase = sonPhase(state);
  const soul = sonSoul(state);
  const openWindows = (state.opportunities || []).filter((item) => item.status === "open");
  const openCases = (state.openCases || []).filter((item) => item.status === "open");
  const choiceIds = availableSonActions(state);
  const today = state.day;
  const locked = state.actionsRemaining <= 0;
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">SON 100 GÜN</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="count-head"><div class="count-number">${state.remainingDays}</div><div><p class="eyebrow">${h(loc(phase.label))}</p><h1>${h(loc(SCENARIOS.find((scenario) => scenario.id === state.scenarioId)?.name || state.scenarioId))}</h1></div><div class="action-counter">${t("AKSİYON", "ACTION")} ${2 - state.actionsRemaining}/2<br><small class="muted">${t("Gün", "Day")} ${today}</small></div></section>
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
      <section class="card today-panel"><p class="eyebrow">${t("BUGÜN", "TODAY")}</p>
      <p class="phase-note">${h(loc(phase.note))}</p>
      ${openWindows.map((window) => `<div class="window"><strong>${h(loc(window.title))}</strong><br><small>${t("Son gün", "Last day")} ${window.expiresOn} · ${h(loc(window.text || t("kaçarsa sonuç doğar", "missing it has a consequence")))}</small></div>`).join("")}
      ${openCases.map((item) => `<div class="window case"><strong>${h(loc(item.title))}</strong><br><small>${t("Geri dönüş", "Callback")} · ${t("gün", "day")} ${item.due}</small></div>`).join("")}
      ${!openWindows.length && !openCases.length ? `<p class="muted">${t("Bugün açık pencere yok; iki hakkını nasıl yakacağın hâlâ bir karar.", "No open window today; how you spend two rights is still a decision.")}</p>` : ""}
      <div class="action-grid">${choiceIds
        .map((id) => {
          const action = actionById.get(id);
          if (!action) return "";
          return `<button type="button" class="action-card" data-action="${h(id)}" ${locked ? "disabled" : ""}><strong>${h(loc(action.label))}</strong><small>1 ${t("aksiyon", "action")} · ₺${signed(action.money)} · ${t("enerji", "energy")} ${signed(action.energy)} · ${t("umut", "hope")} ${signed(action.hope)}</small></button>`;
        })
        .join(
          "",
        )}</div><button type="button" id="finish-day" class="day-close">${state.actionsRemaining > 0 ? t(`GÜNÜ BİTİR · ${state.actionsRemaining} hak yanar`, `END DAY · forfeit ${state.actionsRemaining} action(s)`) : t("YENİ GÜN", "NEW DAY")}</button></section>
      <aside class="card status-panel"><p class="eyebrow">${t("DURUM", "STATUS")}</p><div class="stat-list"><div>${t("Nakit", "Cash")}<strong>₺${state.resources.money}</strong></div><div>${t("Enerji", "Energy")}<strong>${state.resources.energy}</strong></div><div>${t("Umut", "Hope")}<strong>${state.resources.hope}</strong></div><div>${t("Aile", "Family")}<strong>${relValue(state, "family")}</strong></div><div>${t("Korku / kabul", "Fear / acceptance")}<strong>${soul.fear}/${soul.acceptance}</strong></div></div><h3>${t("Zorunluluklar", "Obligations")}</h3>${
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
          `<span>${row.type === "act" ? t("Karar", "Decision") + ": " + h(loc(row.id)) : row.type === "opportunity" ? t("Fırsat", "Window") + ": " + h(loc(row.result)) : row.type === "callback" ? t("Dosya", "File") + ": " + h(loc(row.title || row.id)) : h(loc(row.type))}</span>`,
      )
      .join(
        "",
      )}</div><p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Her gün tam iki aksiyonun var. Kartlar para, enerji ve ilişki bedelini gösterir. Zorunluluklar panelindeki işleri süresi dolmadan kapatmazsan kaçan yüküm sayılır; fırsat pencerelerinin de son günü vardır ve kaçırılırsa bir daha açılmaz. Günü erken bitirirsen kullanılmayan hak yanar. Son günlere yaklaştıkça enerji daha hızlı tükenir ve seçenekler daralır. 0'da ölüm ve hüküm açılır; intihar yok. İlerleyişin her hamlede otomatik kaydedilir.", "You have exactly two actions per day. Cards show money, energy and relationship costs. Windows expire. Ending early forfeits unused actions; day zero opens death and verdict. There is no suicide.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
  root
    .querySelectorAll("[data-action]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`act:${button.dataset.action}`)),
    );
  root.querySelector("#finish-day").addEventListener("click", () => session.act("advance"));
  bindSavePanel(root, session);
}

bootGame("son-100-gun", draw);
