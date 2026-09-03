import { WEEKLY_ACTIVITY_LIMIT, createNewGame } from "./state.js";
import { getEventDefinition, resolveEvent } from "./events.js";
import { DECISIONS, advanceWeek, applyDecision, canApplyDecision } from "./time.js";
import { clearSaves, loadGame, saveGame } from "./save.js";

const app = document.querySelector("#app");
let state = null;
let notice = "";
let saveStatus = "";

const money = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
const escapeText = (value) =>
  String(value).replace(
    /[&<>'"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char],
  );

function persist(message = "Otomatik kaydedildi.") {
  const result = saveGame(localStorage, state);
  saveStatus = result.ok ? `${message} (${Math.ceil(result.bytes / 1024)} KB)` : result.message;
  return result;
}

function startScreen(loadResult) {
  app.innerHTML = `
    <main class="start-wrap">
      <section class="start-card" aria-labelledby="start-title">
        <h1 id="start-title">TC Simülasyonu</h1>
        <p>18 yaşında, İstanbul'da aile evinde başlayan küçük bir hayat. Her hafta yalnız iki önemli karar verebilirsin.</p>
        ${loadResult.ok ? `<div class="continue-box"><strong>${escapeText(loadResult.state.player.name)} · ${loadResult.state.time.year}, ${loadResult.state.time.month}. ay</strong><button class="button button-primary" id="continue-game">Devam et</button></div>` : `<p class="result">${escapeText(loadResult.message)}</p>`}
        <form id="new-game-form" class="form-grid">
          <label>İsim<input name="name" maxlength="40" value="Deniz" required /></label>
          <label>Kimlik<select name="gender"><option value="unspecified">Belirtmek istemiyorum</option><option value="woman">Kadın</option><option value="man">Erkek</option></select></label>
          <label>Başlangıç profili<select name="profile"><option value="balanced">Dengeli</option><option value="ambitious">Hırslı</option><option value="social">Sosyal</option></select></label>
          <button class="button button-primary" type="submit">Yeni hayat başlat</button>
        </form>
      </section>
    </main>`;

  document.querySelector("#continue-game")?.addEventListener("click", () => {
    state = loadResult.state;
    notice = loadResult.message;
    saveStatus = loadResult.source === "backup" ? "Yedekten devam ediliyor." : "Kayıt hazır.";
    render();
  });
  document.querySelector("#new-game-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    state = createNewGame({
      name: data.get("name"),
      gender: data.get("gender"),
      profile: data.get("profile"),
      seed: Date.now() >>> 0,
    });
    notice = "Yeni hayat başladı.";
    persist("İlk kayıt oluşturuldu.");
    render();
  });
}

function renderPeople() {
  return state.people
    .map(
      (person) =>
        `<div class="person"><p><strong>${escapeText(person.name)}</strong><small>${escapeText(person.relationType)} · ${person.memories.length} hatıra</small></p><div class="relation-wrap"><i><span style="width:${state.relationships[person.id]}%"></span></i><b class="relation">${state.relationships[person.id]}</b></div></div>`,
    )
    .join("");
}

function renderMemories() {
  const items = state.memories.slice(-5).reverse();
  return items.length
    ? items
        .map(
          (memory) =>
            `<div class="memory"><strong>${memory.year}</strong> · ${escapeText(memory.text)}</div>`,
        )
        .join("")
    : `<p class="empty">Henüz önemli bir geçmiş oluşmadı.</p>`;
}

function renderYearHistory() {
  const year = state.yearlyHistory.at(-1);
  if (!year) return `<p class="empty">İlk yıl tamamlandığında burada bir dosya oluşacak.</p>`;
  return `<p class="open-case"><strong>${year.year}</strong><br>Başlangıç ${money(year.startingBalance)} · Bitiş ${money(year.endingBalance)}<br>${year.importantMemories.length} önemli kayıt</p>`;
}

function renderAgenda() {
  const active = state.events.active ? getEventDefinition(state.events.active.eventId) : null;
  const latestMemory = state.memories.at(-1);
  if (active) {
    return `<p class="agenda-title">${escapeText(active.title)}</p><p>${escapeText(active.text)}</p><span class="agenda-status">Kararın bekleniyor</span>`;
  }
  if (notice) {
    return `<p class="agenda-title">Son gelişme</p><p>${escapeText(notice)}</p><span class="agenda-status">${state.time.year} · ${state.time.month}. ay · ${state.time.weekOfMonth}. hafta</span>`;
  }
  if (latestMemory) {
    return `<p class="agenda-title">Hayat kaydı</p><p>${escapeText(latestMemory.text)}</p><span class="agenda-status">${latestMemory.year}</span>`;
  }
  return `<p class="agenda-title">Sakin başlangıç</p><p>Hayatın ilk kararlarını vermek için bu haftayı kullan.</p><span class="agenda-status">Gündem açık</span>`;
}

function renderNav() {
  const items = [
    ["ANA SAYFA", true],
    ["BEN", false],
    ["TAKVİM", false],
    ["PARA", false],
    ["İŞ", false],
    ["KİŞİLER", false],
    ["AİLE / İLİŞKİLER", false],
    ["EV", false],
    ["BEDEN", false],
    ["GEÇMİŞ", false],
    ["YIL DOSYASI", false],
  ];
  return items
    .map(
      ([label, active]) =>
        `<button class="nav-item ${active ? "is-active" : ""}" ${active ? 'aria-current="page"' : 'disabled aria-disabled="true"'}><span class="nav-mark"></span><span>${label}</span></button>`,
    )
    .join("");
}

function renderEvent() {
  if (!state.events.active) return "";
  const definition = getEventDefinition(state.events.active.eventId);
  if (!definition) return "";
  return `<div class="event-backdrop" role="presentation"><section class="event-card" role="dialog" aria-modal="true" aria-labelledby="event-title"><h2 id="event-title">${escapeText(definition.title)}</h2><p>${escapeText(definition.text)}</p><div class="event-choices">${definition.choices.map((choice) => `<button class="button" data-event-choice="${choice.id}">${escapeText(choice.label)}</button>`).join("")}</div></section></div>`;
}

function render() {
  if (!state) return startScreen(loadGame(localStorage));
  const remaining = WEEKLY_ACTIVITY_LIMIT - state.weekly.used;
  const activeCases = state.openCases.filter((item) => item.status !== "resolved");
  const projectedBalance =
    state.finances.balance + state.finances.monthlyIncome - state.finances.monthlyExpenses;
  app.innerHTML = `
    <main class="game-frame">
      <header class="game-topbar">
        <div class="game-brand"><strong>TC SİMÜLASYONU</strong><span>Yaşam Yönetimi</span></div>
        <div class="top-meta"><span><b>${escapeText(state.player.name)}</b> · ${state.player.age}</span><span>${state.time.year} / ${state.time.month}. ay / H${state.time.weekOfMonth}</span><span class="top-money">${money(state.finances.balance)}</span></div>
        <div class="save-area"><span class="save-status" role="status">${escapeText(saveStatus)}</span><button class="button button-quiet" id="save-game">Kaydet</button><button class="button button-quiet button-danger" id="new-game">Yeni oyun</button></div>
      </header>
      <div class="game-body">
        <nav class="side-nav" aria-label="Oyun bölümleri">${renderNav()}</nav>
        <section class="workspace">
          <div class="workspace-head"><div><p class="eyebrow">ANA SAYFA</p><h1>Hayat merkezi</h1></div><div class="week-control"><span>Karar <b>${state.weekly.used} / ${WEEKLY_ACTIVITY_LIMIT}</b></span><button class="button button-primary" id="advance-week" ${state.events.active ? "disabled" : ""}>Haftayı ilerlet</button></div></div>
          <section class="overview-grid" aria-label="Hayat özeti">
            <article class="profile-panel"><p class="panel-kicker">KARAKTER</p><h2>${escapeText(state.player.name)}</h2><p>${escapeText(state.player.profile)} · İstanbul</p><dl><div><dt>Yaşam yeri</dt><dd>${escapeText(state.household.housing)}</dd></div><div><dt>İş</dt><dd>${escapeText(state.career.title)}</dd></div></dl></article>
            <article class="metric-panel"><p>FİNANS</p><strong>${money(state.finances.balance)}</strong><span>Aylık ${money(state.finances.monthlyIncome)} gelir · ${money(state.finances.monthlyExpenses)} gider</span><small>Ay sonu tahmini: ${money(projectedBalance)}</small></article>
            <article class="body-panel"><p>BEDEN</p><div class="body-row"><span>Enerji</span><i><b style="width:${state.health.energy}%"></b></i><strong>${state.health.energy}</strong></div><div class="body-row stress"><span>Stres</span><i><b style="width:${state.health.stress}%"></b></i><strong>${state.health.stress}</strong></div><div class="body-row"><span>Sağlık</span><i><b style="width:${state.health.health}%"></b></i><strong>${state.health.health}</strong></div></article>
          </section>
          <div class="dashboard-grid">
            <section class="panel week-panel"><div class="panel-head"><div><p class="eyebrow">BU HAFTA</p><h2>Önceliklerin</h2></div><span>${remaining} hak kaldı</span></div><div class="decisions">${DECISIONS.map(
              (decision) => {
                const check = canApplyDecision(state, decision.id);
                return `<button class="button decision" data-decision="${decision.id}" ${check.ok ? "" : "disabled"} title="${escapeText(check.reason || "")}"><strong>${escapeText(decision.title)}</strong><small>${escapeText(decision.detail)}</small></button>`;
              },
            ).join(
              "",
            )}</div><p class="result" role="status">${escapeText(notice || "Bu haftanın kararlarını ver veya zamanı ilerlet.")}</p></section>
            <aside class="right-column">
              <section class="panel agenda-panel"><div class="panel-head"><div><p class="eyebrow">GÜNDEM</p><h2>Gelen kutusu</h2></div></div>${renderAgenda()}</section>
              <section class="panel people-panel"><div class="panel-head"><div><p class="eyebrow">İLİŞKİLER</p><h2>Önemli kişiler</h2></div><span>/ 100</span></div><div class="people">${renderPeople()}</div></section>
            </aside>
            <section class="panel history-panel"><div class="panel-head"><div><p class="eyebrow">GEÇMİŞ</p><h2>Son hayat kayıtları</h2></div><span>${state.memories.length}</span></div><div class="history">${renderMemories()}</div></section>
            <section class="panel cases-panel"><div class="panel-head"><div><p class="eyebrow">AÇIK MESELELER</p><h2>Bekleyen sonuçlar</h2></div><span>${activeCases.length}</span></div>${activeCases.length ? activeCases.map((item) => `<p class="open-case"><b>Mehmet'e verilen borç</b><span>${Math.max(0, item.dueWeek - state.time.absoluteWeek)} hafta kaldı</span></p>`).join("") : `<p class="empty">Şu anda açık dosya yok.</p>`}<div class="year-file"><span>Yıl dosyası</span>${renderYearHistory()}</div></section>
          </div>
        </section>
      </div>
      ${renderEvent()}
    </main>`;

  document.querySelectorAll("[data-decision]").forEach((button) =>
    button.addEventListener("click", () => {
      const result = applyDecision(state, button.dataset.decision);
      notice = result.reason || result.message;
      persist();
      render();
    }),
  );
  document.querySelectorAll("[data-event-choice]").forEach((button) =>
    button.addEventListener("click", () => {
      const result = resolveEvent(state, button.dataset.eventChoice);
      notice = result.message;
      persist();
      render();
    }),
  );
  document.querySelector("#advance-week").addEventListener("click", () => {
    const result = advanceWeek(state);
    notice = result.messages.join(" ");
    persist();
    render();
  });
  document.querySelector("#save-game").addEventListener("click", () => {
    persist("Elle kaydedildi.");
    render();
  });
  document.querySelector("#new-game").addEventListener("click", () => {
    if (!window.confirm("Mevcut hayatı silip yeni oyuna dönmek istiyor musun?")) return;
    clearSaves(localStorage);
    state = null;
    notice = "";
    saveStatus = "";
    render();
  });
}

render();
