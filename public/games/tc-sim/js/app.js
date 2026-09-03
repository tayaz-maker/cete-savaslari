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

function statCard(label, value, meter = null, className = "") {
  return `<section class="card stat ${className}"><span class="stat-label">${label}</span><strong class="stat-value">${value}</strong>${meter === null ? "" : `<div class="meter ${label === "Stres" ? "stress" : ""}"><span style="width:${meter}%"></span></div>`}</section>`;
}

function renderPeople() {
  return state.people
    .map(
      (person) =>
        `<div class="person"><p><strong>${escapeText(person.name)}</strong><br><small>${escapeText(person.relationType)} · ${person.memories.length} hatıra</small></p><span class="relation">${state.relationships[person.id]}</span></div>`,
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
  app.innerHTML = `
    <main class="shell">
      <header class="topbar">
        <div class="brand"><h1>TC Simülasyonu</h1><span>Çalışan çekirdek</span></div>
        <div class="save-area"><span class="save-status" role="status">${escapeText(saveStatus)}</span><button class="button button-quiet" id="save-game">Kaydet</button><button class="button button-quiet button-danger" id="new-game">Yeni oyun</button></div>
      </header>
      <section class="summary" aria-label="Karakter özeti">
        <section class="card character"><span class="stat-label">Karakter</span><h2 class="character-name">${escapeText(state.player.name)}, ${state.player.age}</h2><p class="character-meta">${escapeText(state.player.profile)} · İstanbul · ${escapeText(state.household.housing)}<br>${escapeText(state.career.title)}</p></section>
        ${statCard("Tarih", `${state.time.year} · Ay ${state.time.month}<br><small>Hafta ${state.time.weekOfMonth}</small>`)}
        ${statCard("Para", money(state.finances.balance))}
        ${statCard("Enerji", state.health.energy, state.health.energy)}
        ${statCard("Stres", state.health.stress, state.health.stress)}
        ${statCard("Sağlık", state.health.health, state.health.health)}
      </section>
      <div class="layout">
        <div class="stack">
          <section class="card">
            <div class="section-title"><h2>Bu hafta</h2><span>${remaining} / ${WEEKLY_ACTIVITY_LIMIT} aktivite kaldı</span></div>
            <div class="decisions">${DECISIONS.map((decision) => {
              const check = canApplyDecision(state, decision.id);
              return `<button class="button decision" data-decision="${decision.id}" ${check.ok ? "" : "disabled"} title="${escapeText(check.reason || "")}"><strong>${escapeText(decision.title)}</strong><small>${escapeText(decision.detail)}</small></button>`;
            }).join("")}</div>
            <p class="result" role="status">${escapeText(notice || "Bir veya iki karar ver, sonra haftayı ilerlet.")}</p>
            <button class="button button-primary week-action" id="advance-week" ${state.events.active ? "disabled" : ""}>Haftayı ilerlet</button>
          </section>
          <section class="card"><div class="section-title"><h2>Hayat geçmişi</h2><span>${state.memories.length} kayıt</span></div><div class="history">${renderMemories()}</div></section>
        </div>
        <aside class="stack">
          <section class="card"><div class="section-title"><h2>İnsanlar</h2><span>İlişki / 100</span></div><div class="people">${renderPeople()}</div></section>
          <section class="card"><div class="section-title"><h2>Açık dosyalar</h2><span>${activeCases.length}</span></div>${activeCases.length ? activeCases.map((item) => `<p class="open-case">Mehmet'e verilen borç · ${Math.max(0, item.dueWeek - state.time.absoluteWeek)} hafta</p>`).join("") : `<p class="empty">Bekleyen sonuç yok.</p>`}</section>
          <section class="card"><div class="section-title"><h2>Yıl dosyası</h2><span>${state.yearlyHistory.length}</span></div>${renderYearHistory()}</section>
        </aside>
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
