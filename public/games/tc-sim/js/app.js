import { WEEKLY_ACTIVITY_LIMIT, createNewGame } from "./state.js";
import { getEventDefinition, resolveEvent } from "./events.js";
import { advanceWeek, applyDecision, canApplyDecision, getAvailableDecisions } from "./time.js";
import { clearSaves, loadGame, saveGame } from "./save.js";
import {
  HOMES,
  JOBS,
  acceptJobOffer,
  getCommuteLoad,
  getCommuteExplanation,
  getHomeById,
  getJobById,
  getMonthlySummary,
  getMoveCost,
  moveHome,
  quitJob,
  PRIVACY_CONTEXT,
} from "./life.js";
import { ERAS, PRESENT_DAY_ERA_ID, getEraById } from "./eras.js";
import { NAVIGATION_ITEMS, getNavigationTarget } from "./navigation.js";

const app = document.querySelector("#app");
let state = null;
let notice = "";
let saveStatus = "";
let activeView = "dashboard";

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
        <h1 id="start-title">TC SIM</h1>
        <p>18 yaşında, İstanbul'da aile evinde başlayan küçük bir hayat. Her hafta yalnız iki önemli karar verebilirsin.</p>
        ${loadResult.ok ? `<div class="continue-box"><strong>${escapeText(loadResult.state.player.name)} · ${loadResult.state.time.year}, ${loadResult.state.time.month}. ay</strong><button class="button button-primary" id="continue-game">Devam et</button></div>` : `<p class="result">${escapeText(loadResult.message)}</p>`}
        <form id="new-game-form" class="form-grid">
          <label>İsim<input name="name" maxlength="40" value="Deniz" required /></label>
          <label>Kimlik<select name="gender"><option value="unspecified">Belirtmek istemiyorum</option><option value="woman">Kadın</option><option value="man">Erkek</option></select></label>
          <label>Başlangıç profili<select name="profile"><option value="balanced">Dengeli</option><option value="ambitious">Hırslı</option><option value="social">Sosyal</option></select></label>
          <label>Başlangıç dönemi<select name="eraId" disabled>${ERAS.map((era) => `<option value="${era.id}" ${era.id === PRESENT_DAY_ERA_ID ? "selected" : ""}>${escapeText(era.title)} · aktif</option>`).join("")}</select><small>Diğer dönemler daha sonra eklenecek.</small></label>
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
      eraId: PRESENT_DAY_ERA_ID,
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
        `<div class="person"><p><strong>${escapeText(person.name)}</strong><small>${escapeText(person.relationType)} · ${relationshipLabel(state.relationships[person.id])} · ${person.memories.length} hatıra</small></p><div class="relation-wrap"><i><span style="width:${state.relationships[person.id]}%"></span></i><b class="relation">${state.relationships[person.id]}</b></div></div>`,
    )
    .join("");
}

function relationshipLabel(value) {
  if (value >= 75) return "Yakın";
  if (value >= 50) return "İyi";
  if (value >= 30) return "Mesafeli";
  return "Zayıf";
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
  return NAVIGATION_ITEMS.map(
    ({ label, view }) =>
      `<button type="button" class="nav-item ${view === activeView ? "is-active" : ""}" ${view ? `data-view="${view}"${view === activeView ? ' aria-current="page"' : ""}` : 'disabled aria-disabled="true"'}><span class="nav-mark"></span><span>${label}</span></button>`,
  ).join("");
}

function lifeLabel(value) {
  return ["Çok düşük", "Düşük", "Orta", "Yüksek", "Çok yüksek"][Math.min(4, value)] || "Düşük";
}

function bodyRiskText() {
  if (state.health.energy <= 45 && getCommuteLoad(state.household.homeId, state.career.jobId) >= 2)
    return "Düşük enerji, yüksek ulaşım yüküyle birlikte yol yorgunluğu olayını açabilir.";
  if (state.health.stress >= 70) return "Yüksek stres yorgunluk uyarısı doğurabilir.";
  if (state.health.stress >= 65 && getJobById(state.career.jobId)?.load >= 3)
    return "Yoğun iş ve stres birlikte iş baskısı olayı doğurabilir.";
  return "Enerji ve stres; haftalık kararlar, iş yükü ve ulaşım tarafından etkilenir.";
}

function renderDashboard() {
  const remaining = WEEKLY_ACTIVITY_LIMIT - state.weekly.used;
  const activeCases = state.openCases.filter((item) => item.status !== "resolved");
  const job = getJobById(state.career.jobId);
  const home = getHomeById(state.household.homeId);
  const monthly = getMonthlySummary(state);
  const projectedBalance = state.finances.balance + monthly.income - monthly.expenses;
  return `<div class="workspace-head"><div><p class="eyebrow">ANA SAYFA</p><h1>Hayat merkezi</h1></div>${renderWeekControl()}</div>
    <section class="overview-grid" aria-label="Hayat özeti">
      <article class="profile-panel"><p class="panel-kicker">KARAKTER</p><h2>${escapeText(state.player.name)}</h2><p>${escapeText(state.player.profile)} · İstanbul · ${escapeText(getEraById(state.world.eraId).title)}</p><dl><div><dt>Yaşam yeri</dt><dd>${escapeText(home.title)}</dd></div><div><dt>İş</dt><dd>${escapeText(job?.title || "İşsiz")}</dd></div><div><dt>Ulaşım yükü</dt><dd>${escapeText(getCommuteExplanation(home.id, job?.id || null).label)}</dd></div></dl></article>
      <article class="metric-panel"><p>FİNANS</p><strong>${money(state.finances.balance)}</strong><span>Aylık ${money(monthly.income)} gelir · ${money(monthly.expenses)} gider</span><small>Ay sonu tahmini: ${money(projectedBalance)}</small></article>
      <article class="body-panel"><p>BEDEN</p><div class="body-row"><span>Enerji</span><i><b style="width:${state.health.energy}%"></b></i><strong>${state.health.energy}</strong></div><div class="body-row stress"><span>Stres</span><i><b style="width:${state.health.stress}%"></b></i><strong>${state.health.stress}</strong></div><div class="body-row"><span>Sağlık</span><i><b style="width:${state.health.health}%"></b></i><strong>${state.health.health}</strong></div><small class="body-note">${escapeText(bodyRiskText())}</small></article>
    </section>
    <div class="dashboard-grid">
      <section class="panel week-panel"><div class="panel-head"><div><p class="eyebrow">BU HAFTA</p><h2>Önceliklerin</h2></div><span>${remaining} hak kaldı</span></div><p class="decision-context">Temel kararlar her hafta açık. Diğer seçenekler hayat durumuna göre değişir.</p><div class="decisions">${getAvailableDecisions(
        state,
      )
        .map((decision) => {
          const check = canApplyDecision(state, decision.id);
          return `<button class="button decision" data-decision="${decision.id}" ${check.ok ? "" : "disabled"} title="${escapeText(check.reason || "")}"><strong>${escapeText(decision.title)}</strong><small>${escapeText(decision.detail)}</small></button>`;
        })
        .join(
          "",
        )}</div><p class="result" role="status">${escapeText(notice || "Bu haftanın kararlarını ver veya zamanı ilerlet.")}</p></section>
      <aside class="right-column"><section class="panel agenda-panel"><div class="panel-head"><div><p class="eyebrow">GÜNDEM</p><h2>Gelen kutusu</h2></div></div>${renderAgenda()}</section><section class="panel people-panel"><div class="panel-head"><div><p class="eyebrow">İLİŞKİLER</p><h2>Önemli kişiler</h2></div><span>/ 100</span></div><div class="people">${renderPeople()}</div></section></aside>
      <section class="panel history-panel"><div class="panel-head"><div><p class="eyebrow">GEÇMİŞ</p><h2>Son hayat kayıtları</h2></div><span>${state.memories.length}</span></div><div class="history">${renderMemories()}</div></section>
      <section class="panel cases-panel"><div class="panel-head"><div><p class="eyebrow">AÇIK MESELELER</p><h2>Bekleyen sonuçlar</h2></div><span>${activeCases.length}</span></div>${activeCases.length ? activeCases.map((item) => `<p class="open-case"><b>${item.type === "job-start" ? "İş başlangıcı" : "Mehmet'e verilen borç"}</b><span>${Math.max(0, item.dueWeek - state.time.absoluteWeek)} hafta kaldı</span></p>`).join("") : `<p class="empty">Şu anda açık dosya yok.</p>`}<div class="year-file"><span>Yıl dosyası</span>${renderYearHistory()}</div></section>
    </div>`;
}

function renderWeekControl() {
  return `<div class="week-control"><span>Karar <b>${state.weekly.used} / ${WEEKLY_ACTIVITY_LIMIT}</b></span><button class="button button-primary" id="advance-week" ${state.events.active ? "disabled" : ""}>Haftayı ilerlet</button></div>`;
}

function renderCareer() {
  const active = getJobById(state.career.jobId);
  const home = getHomeById(state.household.homeId);
  return `<div class="workspace-head"><div><p class="eyebrow">İŞ</p><h1>Çalışma hayatı</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel"><div><span>Çalışma durumu</span><strong>${active ? escapeText(active.title) : "İşsiz"}</strong></div><div><span>Aylık maaş</span><strong>${money(active?.salary || 0)}</strong></div><div><span>İş yükü</span><strong>${lifeLabel(active?.load || 0)}</strong></div><div><span>Güvence</span><strong>${active?.security || "—"}</strong></div><div><span>${escapeText(home.title)} ulaşımı</span><strong>${escapeText(getCommuteExplanation(home.id, active?.id || null).label)}</strong><small>${escapeText(getCommuteExplanation(home.id, active?.id || null).detail)}</small></div></section>
    ${state.career.pendingJob ? `<p class="result">${escapeText(getJobById(state.career.pendingJob.jobId).title)} başlangıcı ${Math.max(0, state.career.pendingJob.startWeek - state.time.absoluteWeek)} hafta sonra.</p>` : ""}
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">FIRSATLAR</p><h2>İş teklifleri</h2></div></div><div class="option-grid">${JOBS.map(
      (job) => {
        const commute = getCommuteExplanation(home.id, job.id);
        const disabled =
          state.career.jobId === job.id ||
          state.career.pendingJob ||
          state.weekly.used >= WEEKLY_ACTIVITY_LIMIT;
        return `<article class="option-card ${state.career.jobId === job.id ? "is-current" : ""}"><div><p class="panel-kicker">${state.career.jobId === job.id ? "AKTİF İŞ" : "İŞ TEKLİFİ"}</p><h3>${escapeText(job.title)}</h3></div><dl><div><dt>Maaş</dt><dd>${money(job.salary)}</dd></div><div><dt>İş yükü</dt><dd>${lifeLabel(job.load)}</dd></div><div><dt>Ulaşım</dt><dd>${escapeText(commute.label)}</dd></div><div><dt>Haftalık etki</dt><dd>Enerji ${job.energy + commute.energy} · Stres +${job.stress + commute.stress}</dd></div><div><dt>Güvence</dt><dd>${job.security}</dd></div></dl><button class="button" data-job-offer="${job.id}" ${disabled ? "disabled" : ""}>Teklifi kabul et</button></article>`;
      },
    ).join(
      "",
    )}</div>${active ? `<button class="button button-danger action-footer" id="quit-job" ${state.career.pendingJob || state.weekly.used >= WEEKLY_ACTIVITY_LIMIT ? "disabled" : ""}>İşi bırak</button>` : ""}<p class="result" role="status">${escapeText(notice || "Teklif kabulü bir karar hakkı kullanır ve iş gelecek hafta başlar.")}</p></section>`;
}

function renderHomes() {
  const activeJob = getJobById(state.career.jobId);
  const activeCommute = getCommuteExplanation(state.household.homeId, state.career.jobId);
  return `<div class="workspace-head"><div><p class="eyebrow">EV</p><h1>Konut yönetimi</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel"><div><span>Aktif konut</span><strong>${escapeText(getHomeById(state.household.homeId).title)}</strong></div><div><span>Aylık maliyet</span><strong>${money(getHomeById(state.household.homeId).monthlyCost)}</strong></div><div><span>Çalışma yeri</span><strong>${escapeText(activeJob?.title || "İşsiz")}</strong></div><div><span>Ulaşım yükü</span><strong>${escapeText(activeCommute.label)}</strong><small>${escapeText(activeCommute.detail)}</small></div></section>
    <p class="context-note">${escapeText(PRIVACY_CONTEXT)}</p>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">SEÇENEKLER</p><h2>Konut alternatifleri</h2></div></div><div class="option-grid">${HOMES.map(
      (home) => {
        const cost = getMoveCost(home.id);
        const current = state.household.homeId === home.id;
        const affordable = state.finances.balance >= cost;
        const disabled =
          current ||
          !affordable ||
          state.weekly.used >= WEEKLY_ACTIVITY_LIMIT ||
          state.events.active;
        const commute = getCommuteExplanation(home.id, state.career.jobId);
        return `<article class="option-card ${current ? "is-current" : ""}"><div><p class="panel-kicker">${current ? "MEVCUT EV" : "KONUT"}</p><h3>${escapeText(home.title)}</h3></div><dl><div><dt>Mahremiyet</dt><dd>${lifeLabel(home.privacy)}</dd></div><div><dt>Aylık maliyet</dt><dd>${money(home.monthlyCost)}</dd></div><div><dt>İşe ulaşım</dt><dd>${escapeText(commute.label)}</dd></div><div><dt>Haftalık ulaşım</dt><dd>${escapeText(commute.detail)}</dd></div><div><dt>Taşınma</dt><dd>${money(cost)}</dd></div></dl><button class="button" data-move-home="${home.id}" ${disabled ? "disabled" : ""}>${current ? "Burada yaşıyorsun" : affordable ? "Taşın" : "Para yetersiz"}</button></article>`;
      },
    ).join(
      "",
    )}</div><p class="result" role="status">${escapeText(notice || "Taşınma bir karar hakkı ve tek seferlik taşınma maliyeti kullanır.")}</p></section>`;
}

function renderEvent() {
  if (!state.events.active) return "";
  const definition = getEventDefinition(state.events.active.eventId);
  if (!definition) return "";
  return `<div class="event-backdrop" role="presentation"><section class="event-card" role="dialog" aria-modal="true" aria-labelledby="event-title"><h2 id="event-title">${escapeText(definition.title)}</h2><p>${escapeText(definition.text)}</p><div class="event-choices">${definition.choices.map((choice) => `<button class="button" data-event-choice="${choice.id}">${escapeText(choice.label)}</button>`).join("")}</div></section></div>`;
}

function render() {
  if (!state) return startScreen(loadGame(localStorage));
  const workspace =
    activeView === "career"
      ? renderCareer()
      : activeView === "home"
        ? renderHomes()
        : renderDashboard();
  app.innerHTML = `
    <main class="game-frame">
      <header class="game-topbar">
        <div class="game-brand"><strong>TC SIM</strong><span>Yaşam Yönetimi</span></div>
        <div class="top-meta"><span><b>${escapeText(state.player.name)}</b> · ${state.player.age}</span><span>${state.time.year} / ${state.time.month}. ay / H${state.time.weekOfMonth}</span><span class="top-money">${money(state.finances.balance)}</span></div>
        <div class="save-area"><span class="save-status" role="status">${escapeText(saveStatus)}</span><button class="button button-quiet" id="save-game">Kaydet</button><button class="button button-quiet button-danger" id="new-game">Yeni oyun</button></div>
      </header>
      <div class="game-body">
        <nav class="side-nav" aria-label="Oyun bölümleri">${renderNav()}</nav>
        <section class="workspace">${workspace}</section>
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
  document.querySelectorAll("[data-view]").forEach((button) =>
    button.addEventListener("click", () => {
      const target = getNavigationTarget(button.dataset.view);
      if (!target) return;
      activeView = target;
      notice = "";
      render();
    }),
  );
  document.querySelectorAll("[data-job-offer]").forEach((button) =>
    button.addEventListener("click", () => {
      const result = acceptJobOffer(state, button.dataset.jobOffer);
      notice = result.reason || result.message;
      persist();
      render();
    }),
  );
  document.querySelector("#quit-job")?.addEventListener("click", () => {
    const result = quitJob(state);
    notice = result.reason || result.message;
    persist();
    render();
  });
  document.querySelectorAll("[data-move-home]").forEach((button) =>
    button.addEventListener("click", () => {
      const result = moveHome(state, button.dataset.moveHome);
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
  document.querySelector("#advance-week")?.addEventListener("click", () => {
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
