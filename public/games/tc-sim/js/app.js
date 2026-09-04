import { WEEKLY_ACTIVITY_LIMIT, WEEKS_PER_MONTH, createNewGame } from "./state.js?v=5";
import { getKnownOpenCases } from "./calendar.js?v=5";
import { snapshotWeekState, summarizeWeek } from "./weekly-feedback.js?v=5";
import { getChoiceEffectSummary, getEventDefinition, resolveEvent } from "./events.js?v=5";
import { advanceWeek, applyDecision, canApplyDecision, getAvailableDecisions } from "./time.js?v=5";
import { clearSaves, loadGame, saveGame } from "./save.js?v=5";
import {
  HOMES,
  JOBS,
  acceptJobOffer,
  enrollEducation,
  getCommuteLoad,
  getCommuteExplanation,
  getHomeById,
  getJobById,
  getMonthlySummary,
  getMoveCost,
  moveHome,
  quitJob,
  stopEducation,
  PRIVACY_CONTEXT,
} from "./life.js?v=5";
import {
  EDUCATION_PATHS,
  JOB_FAMILY_LABELS,
  describeJobRequirements,
  getCareerBand,
  getEducationLevelLabel,
  getEducationProgress,
  getFamilyExperience,
  getFieldLabel,
  getIntensityLabel,
  getPathDurationWeeks,
  isEligibleForJob,
} from "./education.js?v=5";
import { ERAS, PRESENT_DAY_ERA_ID, getEraById } from "./eras.js?v=5";
import { NAVIGATION_ITEMS, getNavigationTarget } from "./navigation.js?v=5";
import {
  RELATIONSHIP_STAGES,
  SOCIAL_ROLE_LABELS,
  applySocialAction,
  getAvailableSocialActions,
  getOpenSocialCase,
  getPerson,
  getPersonalDebt,
  getRelationship,
  getRelationshipStage,
} from "./social.js?v=5";

const app = document.querySelector("#app");
let state = null;
let notice = "";
let saveStatus = "";
let activeView = "dashboard";
let selectedPersonId = "mehmet";
// Haftanın başındaki durum. Yalnız bu oturumda, bellekte tutulur; save'e yazılmaz.
let weekStartSnapshot = null;

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

function openCaseLabel(item) {
  if (item.type === "job-start") return "İş başlangıcı";
  if (item.type === "social-obligation") return "Verilen yardım sözü";
  if (item.type === "friend-loan") return "Mehmet'e verilen borç";
  if (item.type === "personal-debt") {
    const person = getPerson(state, item.payload?.personId);
    return `${person ? person.name : "Bir arkadaşa"} verilen borç`;
  }
  if (item.type === "social-followup") return "Bekleyen sosyal mesele";
  return "Bekleyen mesele";
}

const BODY_AXIS_LABELS = { energy: "Enerji", stress: "Stres", health: "Sağlık" };

function describeWeeklyChange(change) {
  if (change.kind === "money")
    return `Para: ${change.amount >= 0 ? "+" : ""}${money(change.amount)}`;
  if (change.kind === "body")
    return `${BODY_AXIS_LABELS[change.axis]}: ${change.from} → ${change.to}`;
  if (change.kind === "age") return `${change.age} yaşına girdin.`;
  if (change.kind === "education")
    return `Eğitim seviyen değişti: ${getEducationLevelLabel(change.level)}`;
  if (change.kind === "relationship") {
    const person = getPerson(state, change.personId);
    const name = person ? person.name : "Biri";
    if (change.axis === "closeness")
      return `${name} ile yakınlığın ${change.direction === "up" ? "arttı" : "azaldı"}.`;
    if (change.axis === "trust")
      return `${name} sana daha ${change.direction === "up" ? "çok" : "az"} güveniyor.`;
    return `${name} ile aranda gerilim ${change.direction === "up" ? "arttı" : "azaldı"}.`;
  }
  if (change.kind === "obligation") return `Yeni yükümlülük: ${openCaseLabel(change.case)}`;
  if (change.kind === "housing")
    return `Yaşam yerin değişti: ${getHomeById(change.homeId).title}`;
  return "";
}

function weeksAgoLabel(week) {
  const diff = state.time.absoluteWeek - week;
  if (diff <= 0) return "Bu hafta";
  if (diff === 1) return "1 hafta önce";
  return `${diff} hafta önce`;
}

function weeksAheadLabel(week) {
  const diff = Math.max(0, week - state.time.absoluteWeek);
  if (diff === 0) return "Bu hafta";
  if (diff === 1) return "1 hafta içinde";
  return `${diff} hafta içinde`;
}

function getAllPersonalDebts() {
  return state.people
    .map((person) => ({ person, debt: getPersonalDebt(state, person.id) }))
    .filter((entry) => entry.debt);
}

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
    weekStartSnapshot = null;
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
    weekStartSnapshot = null;
    persist("İlk kayıt oluşturuldu.");
    render();
  });
}

function renderPeople() {
  return state.people
    .map(
      (person) =>
        `<div class="person"><p><strong>${escapeText(person.name)}</strong><small>${escapeText(person.relationType)} · ${escapeText(RELATIONSHIP_STAGES[getRelationshipStage(state, person.id)])} · ${person.memories.length} hatıra</small></p><div class="relation-wrap"><i><span style="width:${state.relationships[person.id]}%"></span></i><b class="relation">${state.relationships[person.id]}</b></div></div>`,
    )
    .join("");
}

function weeksSinceContact(person) {
  return Math.max(0, state.time.absoluteWeek - person.social.lastMeaningfulContactWeek);
}

function renderRelationshipMetrics(person) {
  const relationship = getRelationship(state, person.id);
  return `<div class="social-metrics"><span>Yakınlık <b>${relationship.closeness}</b></span><span>Güven <b>${relationship.trust}</b></span><span>Gerilim <b>${relationship.tension}</b></span></div>`;
}

function renderPeopleScreen() {
  const selected = getPerson(state, selectedPersonId) || state.people[0];
  selectedPersonId = selected.id;
  const stage = RELATIONSHIP_STAGES[getRelationshipStage(state, selected.id)];
  const openCase = getOpenSocialCase(state, selected.id);
  const actions = getAvailableSocialActions(state, selected.id);
  const memories = selected.memories.slice(-5).reverse();
  return `<div class="workspace-head"><div><p class="eyebrow">KİŞİLER</p><h1>Sosyal çevre</h1></div>${renderWeekControl()}</div>
    <div class="social-layout"><section class="panel people-directory"><div class="panel-head"><div><p class="eyebrow">ÇEVRE</p><h2>Önemli kişiler</h2></div><span>${state.people.length}</span></div>${state.people.map((person) => `<button class="person-select ${person.id === selected.id ? "is-current" : ""}" data-person="${person.id}"><span><strong>${escapeText(person.name)}</strong><small>${escapeText(SOCIAL_ROLE_LABELS[person.roleId])}</small></span><b>${escapeText(RELATIONSHIP_STAGES[getRelationshipStage(state, person.id)])}</b></button>`).join("")}</section>
    <section class="panel person-detail"><div class="panel-head"><div><p class="eyebrow">KİŞİ DOSYASI</p><h2>${escapeText(selected.name)}</h2></div><span>${escapeText(stage)}</span></div><p class="context-note">${escapeText(SOCIAL_ROLE_LABELS[selected.roleId])} · Son anlamlı temas ${weeksSinceContact(selected)} hafta önce${openCase ? ` · ${Math.max(0, openCase.dueWeek - state.time.absoluteWeek)} hafta içinde açık söz` : ""}</p>${renderRelationshipMetrics(selected)}<div class="social-actions">${actions.map((action) => `<button class="button decision" data-social-action="${action.id}" data-person-id="${selected.id}" ${action.availability.ok ? "" : "disabled"} title="${escapeText(action.availability.reason || "")}"><strong>${escapeText(action.title)}</strong><small>${escapeText(action.detail)}</small></button>`).join("")}</div><div class="person-memories"><p class="panel-kicker">SON ÖNEMLİ ANILAR</p>${memories.length ? memories.map((memory) => `<p><span>${memory.year}</span>${escapeText(memory.text)}</p>`).join("") : `<p class="empty">Henüz ortak bir anı yok.</p>`}</div><p class="result" role="status">${escapeText(notice || "Bir sosyal etkileşim haftalık karar hakkı kullanır.")}</p></section></div>`;
}

function renderRelationshipsOverview() {
  const partner = state.social.currentPartnerNpcId
    ? getPerson(state, state.social.currentPartnerNpcId)
    : null;
  const attention = [...state.people].sort(
    (a, b) => b.social.tension + weeksSinceContact(b) - (a.social.tension + weeksSinceContact(a)),
  )[0];
  const knownCases = getKnownOpenCases(state);
  const personalDebts = getAllPersonalDebts();
  const obligationCount = knownCases.length + personalDebts.length;
  const recentDevelopments = state.people
    .flatMap((person) => person.memories.map((memory) => ({ person, memory })))
    .sort((a, b) => b.memory.year - a.memory.year || b.memory.week - a.memory.week)
    .slice(0, 6);

  return `<div class="workspace-head"><div><p class="eyebrow">AİLE / İLİŞKİLER</p><h1>Bağların</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel">
      <div><span>Romantik durum</span><strong>${partner ? `${escapeText(partner.name)} · Sevgili` : "Sevgili yok"}</strong></div>
      <div><span>İlgi isteyen ilişki</span><strong>${escapeText(attention.name)}</strong><small>${attention.social.tension >= 40 ? "Gerilim yükselmiş" : `${weeksSinceContact(attention)} haftadır anlamlı temas yok`}</small></div>
      <div><span>Açık sosyal mesele</span><strong>${obligationCount}</strong></div>
    </section>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">ÖNEMLİ BAĞLAR</p><h2>Kişiler</h2></div></div><div class="overview-grid">${state.people
      .map(
        (person) =>
          `<article class="panel relationship-summary"><p class="panel-kicker">${escapeText(SOCIAL_ROLE_LABELS[person.roleId])}</p><h2>${escapeText(person.name)}</h2><p>${escapeText(RELATIONSHIP_STAGES[getRelationshipStage(state, person.id)])}</p>${renderRelationshipMetrics(person)}<button class="button button-quiet" data-open-person="${person.id}">Kişi dosyasını aç</button></article>`,
      )
      .join("")}</div></section>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">SON GELİŞMELER</p><h2>Yakın zamanda olanlar</h2></div></div><div class="history">${
      recentDevelopments.length
        ? recentDevelopments
            .map(
              ({ person, memory }) =>
                `<div class="memory"><strong>${escapeText(person.name)}</strong> · ${escapeText(memory.text)}</div>`,
            )
            .join("")
        : `<p class="empty">Henüz kayda değer bir gelişme yok.</p>`
    }</div></section>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">AÇIK MESELELER</p><h2>Sözler ve borçlar</h2></div><span>${obligationCount}</span></div>${
      obligationCount
        ? `${knownCases
            .map(
              (item) =>
                `<p class="open-case"><b>${escapeText(openCaseLabel(item))}</b><span>${escapeText(weeksAheadLabel(item.dueWeek))}</span></p>`,
            )
            .join("")}${personalDebts
            .map(
              ({ person, debt }) =>
                `<p class="open-case"><b>${escapeText(person.name)}: ${money(debt.payload.amount)} borçlu</b><span>Bekleniyor</span></p>`,
            )
            .join("")}`
        : `<p class="empty">Şu anda açık bir sosyal mesele yok.</p>`
    }</section>`;
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
  const socialCases = activeCases.filter((item) => item.type === "social-obligation");
  const partner = state.social.currentPartnerNpcId ? getPerson(state, state.social.currentPartnerNpcId) : null;
  return `<div class="workspace-head"><div><p class="eyebrow">ANA SAYFA</p><h1>Hayat merkezi</h1></div>${renderWeekControl()}</div>
    <section class="overview-grid" aria-label="Hayat özeti">
      <article class="profile-panel"><p class="panel-kicker">KARAKTER</p><h2>${escapeText(state.player.name)}</h2><p>${escapeText(state.player.profile)} · İstanbul · ${escapeText(getEraById(state.world.eraId).title)}</p><dl><div><dt>Yaşam yeri</dt><dd>${escapeText(home.title)}</dd></div><div><dt>İş</dt><dd>${escapeText(job?.title || "İşsiz")}</dd></div><div><dt>Ulaşım yükü</dt><dd>${escapeText(getCommuteExplanation(home.id, job?.id || null).label)}</dd></div></dl></article>
      <article class="metric-panel"><p>FİNANS</p><strong>${money(state.finances.balance)}</strong><span>Aylık ${money(monthly.income)} gelir · ${money(monthly.expenses)} gider</span><small>Ay sonu tahmini: ${money(projectedBalance)}</small></article>
      <article class="body-panel"><p>BEDEN</p><div class="body-row"><span>Enerji</span><i><b style="width:${state.health.energy}%"></b></i><strong>${state.health.energy}</strong></div><div class="body-row stress"><span>Stres</span><i><b style="width:${state.health.stress}%"></b></i><strong>${state.health.stress}</strong></div><div class="body-row"><span>Sağlık</span><i><b style="width:${state.health.health}%"></b></i><strong>${state.health.health}</strong></div><small class="body-note">${escapeText(bodyRiskText())}</small></article>
      <article class="metric-panel"><p>SOSYAL</p><strong>${partner ? escapeText(partner.name) : "Sevgili yok"}</strong><span>${socialCases.length} açık sosyal mesele</span><small>${escapeText(RELATIONSHIP_STAGES[getRelationshipStage(state, "mehmet")])}: Mehmet</small></article>
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
      <section class="panel cases-panel"><div class="panel-head"><div><p class="eyebrow">AÇIK MESELELER</p><h2>Bekleyen sonuçlar</h2></div><span>${activeCases.length}</span></div>${activeCases.length ? activeCases.map((item) => `<p class="open-case"><b>${escapeText(openCaseLabel(item))}</b><span>${Math.max(0, item.dueWeek - state.time.absoluteWeek)} hafta kaldı</span></p>`).join("") : `<p class="empty">Şu anda açık dosya yok.</p>`}<div class="year-file"><span>Yıl dosyası</span>${renderYearHistory()}</div></section>
    </div>`;
}

function renderWeekControl() {
  return `<div class="week-control"><span>Karar <b>${state.weekly.used} / ${WEEKLY_ACTIVITY_LIMIT}</b></span><button class="button button-primary" id="advance-week" ${state.events.active ? "disabled" : ""}>Haftayı ilerlet</button></div>`;
}

function renderCareer() {
  const active = getJobById(state.career.jobId);
  const home = getHomeById(state.household.homeId);
  const experience = experienceSummary();
  return `<div class="workspace-head"><div><p class="eyebrow">İŞ</p><h1>Çalışma hayatı</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel"><div><span>Çalışma durumu</span><strong>${active ? escapeText(active.title) : "İşsiz"}</strong></div><div><span>Aylık maaş</span><strong>${money(active?.salary || 0)}</strong></div><div><span>İş yükü</span><strong>${lifeLabel(active?.load || 0)}</strong></div><div><span>Güvence</span><strong>${active?.security || "—"}</strong></div><div><span>${escapeText(home.title)} ulaşımı</span><strong>${escapeText(getCommuteExplanation(home.id, active?.id || null).label)}</strong><small>${escapeText(getCommuteExplanation(home.id, active?.id || null).detail)}</small></div></section>
    <section class="detail-summary panel"><div><span>İş alanı</span><strong>${escapeText(experience.familyLabel)}</strong></div><div><span>Alan deneyimi</span><strong>${experience.weeks} hafta</strong><small>${experience.months} ay</small></div><div><span>Kariyer bandı</span><strong>${escapeText(experience.band.label)}</strong></div><div><span>Eğitim seviyesi</span><strong>${escapeText(getEducationLevelLabel(state.education.level))}</strong><small>${state.education.fields.length ? escapeText(state.education.fields.map((field) => getFieldLabel(field)).join(" · ")) : "Alan yok"}</small></div></section>
    ${state.career.pendingJob ? `<p class="result">${escapeText(getJobById(state.career.pendingJob.jobId).title)} başlangıcı ${Math.max(0, state.career.pendingJob.startWeek - state.time.absoluteWeek)} hafta sonra.</p>` : ""}
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">FIRSATLAR</p><h2>İş teklifleri</h2></div></div><div class="option-grid">${JOBS.map(
      (job) => {
        const commute = getCommuteExplanation(home.id, job.id);
        const isCurrent = state.career.jobId === job.id;
        const eligibility = isEligibleForJob(state, job);
        const disabled =
          isCurrent ||
          !eligibility.ok ||
          state.career.pendingJob ||
          state.weekly.used >= WEEKLY_ACTIVITY_LIMIT;
        const blockReason = isCurrent
          ? "Zaten bu işte çalışıyorsun."
          : !eligibility.ok
            ? eligibility.reason
            : state.career.pendingJob
              ? "Önce bekleyen iş başlangıcı sonuçlanmalı."
              : state.weekly.used >= WEEKLY_ACTIVITY_LIMIT
                ? "Bu haftanın aktivite hakkı bitti."
                : "";
        return `<article class="option-card ${isCurrent ? "is-current" : ""} ${eligibility.ok ? "" : "is-locked"}"><div><p class="panel-kicker">${isCurrent ? "AKTİF İŞ" : eligibility.ok ? "İŞ TEKLİFİ" : "KİLİTLİ"}</p><h3>${escapeText(job.title)}</h3></div><dl><div><dt>Maaş</dt><dd>${money(job.salary)}</dd></div><div><dt>Alan</dt><dd>${escapeText(JOB_FAMILY_LABELS[job.family] || job.family)}</dd></div><div><dt>İş yükü</dt><dd>${lifeLabel(job.load)}</dd></div><div><dt>Ulaşım</dt><dd>${escapeText(commute.label)}</dd></div><div><dt>Haftalık etki</dt><dd>Enerji ${job.energy + commute.energy} · Stres +${job.stress + commute.stress}</dd></div><div><dt>Güvence</dt><dd>${job.security}</dd></div><div><dt>Gereksinim</dt><dd>${escapeText(describeJobRequirements(job))}</dd></div></dl>${eligibility.ok ? "" : `<p class="context-note">${escapeText(eligibility.reason)}</p>`}<button class="button" data-job-offer="${job.id}" ${disabled ? "disabled" : ""} title="${escapeText(blockReason)}">Teklifi kabul et</button></article>`;
      },
    ).join(
      "",
    )}</div>${active ? `<button class="button button-danger action-footer" id="quit-job" ${state.career.pendingJob || state.weekly.used >= WEEKLY_ACTIVITY_LIMIT ? "disabled" : ""}>İşi bırak</button>` : ""}<p class="result" role="status">${escapeText(notice || "Teklif kabulü bir karar hakkı kullanır ve iş gelecek hafta başlar.")}</p></section>`;
}

function experienceSummary() {
  const job = getJobById(state.career.jobId);
  const familyId = job?.family || null;
  const weeks = familyId ? getFamilyExperience(state, familyId) : 0;
  return {
    familyLabel: familyId ? JOB_FAMILY_LABELS[familyId] || familyId : "—",
    weeks,
    months: Math.floor(weeks / 4),
    band: getCareerBand(weeks),
  };
}

function renderEducation() {
  const education = state.education;
  const progress = getEducationProgress(state);
  const fields = education.fields.length
    ? education.fields.map((field) => escapeText(getFieldLabel(field))).join(" · ")
    : "Henüz alan yok";
  const blocked = Boolean(education.active) || Boolean(state.events.active);

  return `<div class="workspace-head"><div><p class="eyebrow">EĞİTİM</p><h1>Eğitim ve yeterlilik</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel"><div><span>Eğitim seviyesi</span><strong>${escapeText(getEducationLevelLabel(education.level))}</strong></div><div><span>Alanlar</span><strong>${fields}</strong></div><div><span>Aktif program</span><strong>${progress ? escapeText(progress.path.displayName) : "Yok"}</strong>${progress ? `<small>${escapeText(getIntensityLabel(progress.intensity))}</small>` : "<small>Şu an bir programa kayıtlı değilsin.</small>"}</div><div><span>Bu ay eğitim gideri</span><strong>${money(education.tuitionOwedThisMonth)}</strong><small>Ay sonunda tahsil edilir.</small></div></section>
    ${
      progress
        ? `<section class="panel"><div class="panel-head"><div><p class="eyebrow">DEVAM EDEN</p><h2>${escapeText(progress.path.displayName)}</h2></div><span>%${progress.percent}</span></div>
      <div class="body-row"><span>İlerleme</span><i><b style="width:${progress.percent}%"></b></i><strong>${progress.points}/${progress.targetPoints}</strong></div>
      <dl class="edu-facts"><div><dt>Yoğunluk</dt><dd>${escapeText(getIntensityLabel(progress.intensity))}</dd></div><div><dt>Kalan süre</dt><dd>${progress.remainingWeeks} hafta</dd></div><div><dt>Aylık ücret</dt><dd>${money(progress.path.monthlyTuition)}</dd></div><div><dt>Haftalık yük</dt><dd>Enerji ${progress.weeklyLoad.energy} · Stres +${progress.weeklyLoad.stress}</dd></div></dl>
      <button class="button button-danger action-footer" id="stop-education">Eğitimi bırak</button><p class="context-note">Bırakırsan biriken ilerleme silinir, ödenen ücret iade edilmez ve bu ayın eğitim gideri yine tahsil edilir.</p></section>`
        : ""
    }
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">PROGRAMLAR</p><h2>Eğitim yolları</h2></div></div><div class="option-grid">${EDUCATION_PATHS.map(
      (path) => {
        const affordable = state.finances.balance >= path.enrollmentFee;
        const current = education.active?.pathId === path.id;
        return `<article class="option-card ${current ? "is-current" : ""}"><div><p class="panel-kicker">${current ? "DEVAM EDİYOR" : "PROGRAM"}</p><h3>${escapeText(path.displayName)}</h3></div><p class="context-note">${escapeText(path.summary)}</p><dl><div><dt>Süre</dt><dd>Tam ${getPathDurationWeeks(path, "full")} hafta · Yarı ${getPathDurationWeeks(path, "part")} hafta</dd></div><div><dt>Kayıt ücreti</dt><dd>${money(path.enrollmentFee)}</dd></div><div><dt>Aylık ücret</dt><dd>${money(path.monthlyTuition)}</dd></div><div><dt>Haftalık yük</dt><dd>Tam: enerji ${path.load.full.energy} · stres +${path.load.full.stress}<br>Yarı: enerji ${path.load.part.energy} · stres +${path.load.part.stress}</dd></div><div><dt>Kazandırır</dt><dd>${path.grantsLevel ? `${escapeText(getEducationLevelLabel(path.grantsLevel))} · ` : ""}${escapeText(getFieldLabel(path.grantsField))} alanı</dd></div></dl><div class="edu-actions">${path.allowedIntensity
          .map((intensity) => {
            const disabled = blocked || !affordable;
            const reason = education.active
              ? "Zaten devam eden bir eğitimin var."
              : state.events.active
                ? "Önce açık olayı sonuçlandır."
                : !affordable
                  ? `Kayıt için ${money(path.enrollmentFee)} gerekiyor.`
                  : "";
            return `<button class="button" data-enroll="${path.id}" data-intensity="${intensity}" ${disabled ? "disabled" : ""} title="${escapeText(reason)}">${escapeText(getIntensityLabel(intensity))} başla</button>`;
          })
          .join("")}</div></article>`;
      },
    ).join(
      "",
    )}</div><p class="result" role="status">${escapeText(notice || "Eğitime kaydolmak haftalık karar hakkı kullanmaz; haftalık enerji ve stres yükü getirir.")}</p></section>`;
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

function getFriendLoanAmount() {
  const definition = getEventDefinition("loan_repayment");
  const collect = definition?.choices.find((choice) => choice.id === "collect");
  return Number.isFinite(collect?.effects?.money) ? collect.effects.money : null;
}

function renderFinance() {
  const monthly = getMonthlySummary(state);
  const projectedBalance = state.finances.balance + monthly.income - monthly.expenses;
  const personalDebts = getAllPersonalDebts();
  const friendLoan = state.openCases.find(
    (item) => item.type === "friend-loan" && item.status !== "resolved",
  );
  const friendLoanAmount = getFriendLoanAmount();
  const owedToPlayer = [
    ...personalDebts.map(({ person, debt }) => ({ name: person.name, amount: debt.payload.amount })),
    ...(friendLoan && friendLoanAmount ? [{ name: "Mehmet", amount: friendLoanAmount }] : []),
  ];
  const ledger = [...state.finances.ledger].reverse().slice(0, 40);
  return `<div class="workspace-head"><div><p class="eyebrow">PARA</p><h1>Mali durum</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel">
      <div><span>Bakiye</span><strong>${money(state.finances.balance)}</strong></div>
      <div><span>Aylık gelir</span><strong>${money(monthly.income)}</strong><small>Maaş ${money(monthly.salary)}${monthly.otherIncome ? ` · Diğer ${money(monthly.otherIncome)}` : ""}</small></div>
      <div><span>Aylık gider</span><strong>${money(monthly.expenses)}</strong><small>Konut ${money(monthly.housing)}${monthly.tuition ? ` · Eğitim ${money(monthly.tuition)}` : ""} · Diğer ${money(monthly.otherExpenses)}</small></div>
      <div><span>Ay sonu tahmini</span><strong>${money(projectedBalance)}</strong></div>
    </section>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">ALACAKLAR</p><h2>Sana borçlu olanlar</h2></div><span>${owedToPlayer.length}</span></div>${
      owedToPlayer.length
        ? owedToPlayer
            .map((item) => `<p class="open-case"><b>${escapeText(item.name)}</b><span>${money(item.amount)}</span></p>`)
            .join("")
        : `<p class="empty">Şu anda kimsenin sana borcu yok.</p>`
    }</section>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">İŞLEMLER</p><h2>Son işlemler</h2></div><span>${state.finances.ledger.length}</span></div><div class="history">${
      ledger.length
        ? ledger
            .map(
              (entry) =>
                `<div class="memory"><strong>${entry.amount >= 0 ? "+" : ""}${money(entry.amount)}</strong> · ${escapeText(entry.reason)} · <span>${escapeText(weeksAgoLabel(entry.week))}</span></div>`,
            )
            .join("")
        : `<p class="empty">Henüz bir işlem kaydı yok.</p>`
    }</div></section>`;
}

function renderBody() {
  const job = getJobById(state.career.jobId);
  const commute = getCommuteExplanation(state.household.homeId, state.career.jobId);
  const educationProgress = getEducationProgress(state);
  return `<div class="workspace-head"><div><p class="eyebrow">BEDEN</p><h1>Fiziksel ve zihinsel durum</h1></div>${renderWeekControl()}</div>
    <section class="panel body-panel">
      <p>GENEL DURUM</p>
      <div class="body-row"><span>Enerji</span><i><b style="width:${state.health.energy}%"></b></i><strong>${state.health.energy}</strong></div>
      <div class="body-row stress"><span>Stres</span><i><b style="width:${state.health.stress}%"></b></i><strong>${state.health.stress}</strong></div>
      <div class="body-row"><span>Sağlık</span><i><b style="width:${state.health.health}%"></b></i><strong>${state.health.health}</strong></div>
      <small class="body-note">${escapeText(bodyRiskText())}</small>
    </section>
    <section class="detail-summary panel">
      <div><span>İş yükü</span><strong>${escapeText(lifeLabel(job?.load || 0))}</strong></div>
      <div><span>Ulaşım yükü</span><strong>${escapeText(commute.label)}</strong><small>${escapeText(commute.detail)}</small></div>
      <div><span>Eğitim yükü</span><strong>${educationProgress ? escapeText(getIntensityLabel(educationProgress.intensity)) : "Yok"}</strong>${educationProgress ? `<small>Enerji ${educationProgress.weeklyLoad.energy} · Stres +${educationProgress.weeklyLoad.stress}</small>` : ""}</div>
    </section>`;
}

function renderHistory() {
  const entries = [...state.events.history].reverse().slice(0, 60);
  return `<div class="workspace-head"><div><p class="eyebrow">GEÇMİŞ</p><h1>Hayat kayıtları</h1></div>${renderWeekControl()}</div>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">OLAYLAR</p><h2>Yaşananlar</h2></div><span>${state.events.history.length}</span></div><div class="history">${
      entries.length
        ? entries
            .map((entry) => {
              const definition = getEventDefinition(entry.eventId);
              const choice = definition?.choices.find((item) => item.id === entry.choiceId);
              const title = definition ? definition.title : "Bir olay";
              const summary = choice ? getChoiceEffectSummary(choice) : "";
              return `<div class="memory"><strong>${escapeText(weeksAgoLabel(entry.week))}</strong> · ${escapeText(title)}${choice ? `: ${escapeText(choice.label)}` : ""}${summary ? ` — ${escapeText(summary)}` : ""}</div>`;
            })
            .join("")
        : `<p class="empty">Henüz kayıtlı bir yaşam olayı yok.</p>`
    }</div></section>`;
}

function renderYearbook() {
  const years = [...state.yearlyHistory].reverse();
  return `<div class="workspace-head"><div><p class="eyebrow">YIL DOSYASI</p><h1>Tamamlanan yıllar</h1></div>${renderWeekControl()}</div>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">YILLAR</p><h2>Yıl özetleri</h2></div><span>${years.length}</span></div>${
      years.length
        ? years
            .map((year) => {
              const net = year.endingBalance - year.startingBalance;
              return `<div class="open-case"><b>${year.year}</b><span>Başlangıç ${money(year.startingBalance)} · Bitiş ${money(year.endingBalance)} · Net ${net >= 0 ? "+" : ""}${money(net)}</span>${year.importantMemories.length ? `<span>${year.importantMemories.map((text) => escapeText(text)).join(" · ")}</span>` : ""}</div>`;
            })
            .join("")
        : `<p class="empty">İlk yıl tamamlandığında burada bir dosya oluşacak.</p>`
    }</section>`;
}

function renderCharacter() {
  const job = getJobById(state.career.jobId);
  const home = getHomeById(state.household.homeId);
  const partner = state.social.currentPartnerNpcId
    ? getPerson(state, state.social.currentPartnerNpcId)
    : null;
  const closest = [...state.people].sort(
    (a, b) => state.relationships[b.id] - state.relationships[a.id],
  )[0];
  return `<div class="workspace-head"><div><p class="eyebrow">BEN</p><h1>${escapeText(state.player.name)}</h1></div>${renderWeekControl()}</div>
    <section class="detail-summary panel">
      <div><span>Yaş</span><strong>${state.player.age}</strong><small>${escapeText(state.player.profile)}</small></div>
      <div><span>Tarih</span><strong>${state.time.year} · ${state.time.month}. ay</strong><small>H${state.time.weekOfMonth} · ${escapeText(getEraById(state.world.eraId).title)}</small></div>
      <div><span>Şehir</span><strong>${escapeText(state.player.city)}</strong></div>
      <div><span>Yaşam yeri</span><strong>${escapeText(home.title)}</strong><small>${home.id === "family" ? "Aileyle birlikte" : "Ayrı yaşıyor"}</small></div>
    </section>
    <section class="detail-summary panel">
      <div><span>İş</span><strong>${escapeText(job?.title || "İşsiz")}</strong>${state.career.pendingJob ? `<small>${escapeText(getJobById(state.career.pendingJob.jobId)?.title || "")} bekleniyor</small>` : ""}</div>
      <div><span>Eğitim</span><strong>${escapeText(getEducationLevelLabel(state.education.level))}</strong>${state.education.active ? `<small>Devam ediyor</small>` : ""}</div>
      <div><span>Bakiye</span><strong>${money(state.finances.balance)}</strong></div>
      <div><span>İlişki durumu</span><strong>${partner ? `${escapeText(partner.name)} · Sevgili` : "Sevgili yok"}</strong><small>En yakın: ${escapeText(closest.name)}</small></div>
      <div><span>Beden</span><strong>Enerji ${state.health.energy}</strong><small>Stres ${state.health.stress} · Sağlık ${state.health.health}</small></div>
    </section>`;
}

// "job-start" burada ayrıca listelenmez; aşağıda pendingJob üzerinden daha ayrıntılı gösterilir.

function renderCalendar() {
  const monthly = getMonthlySummary(state);
  const weeksLeftInMonth = WEEKS_PER_MONTH - state.time.weekOfMonth + 1;
  const educationProgress = getEducationProgress(state);
  const knownCases = getKnownOpenCases(state);
  const personalDebts = getAllPersonalDebts();
  const itemCount =
    knownCases.length +
    personalDebts.length +
    (state.career.pendingJob ? 1 : 0) +
    (educationProgress ? 1 : 0);
  return `<div class="workspace-head"><div><p class="eyebrow">TAKVİM</p><h1>Bilinen yükümlülükler</h1></div>${renderWeekControl()}</div>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">AY SONU</p><h2>Düzenli tahsilat</h2></div></div><p class="context-note">${weeksLeftInMonth} hafta sonra ay kapanır: ${money(monthly.income)} gelir, ${money(monthly.expenses)} gider işlenecek.</p></section>
    <section class="panel"><div class="panel-head"><div><p class="eyebrow">BİLİNEN İŞLER</p><h2>Yaklaşan tarihler</h2></div><span>${itemCount}</span></div>${
      itemCount
        ? `${
            state.career.pendingJob
              ? `<p class="open-case"><b>${escapeText(getJobById(state.career.pendingJob.jobId)?.title || "Yeni iş")} başlıyor</b><span>${escapeText(weeksAheadLabel(state.career.pendingJob.startWeek))}</span></p>`
              : ""
          }${
            educationProgress
              ? `<p class="open-case"><b>${escapeText(educationProgress.path.displayName)} tamamlanıyor</b><span>${educationProgress.remainingWeeks} hafta içinde</span></p>`
              : ""
          }${knownCases
            .map(
              (item) =>
                `<p class="open-case"><b>${escapeText(openCaseLabel(item))}</b><span>${escapeText(weeksAheadLabel(item.dueWeek))}</span></p>`,
            )
            .join("")}${personalDebts
            .map(
              ({ person, debt }) =>
                `<p class="open-case"><b>${escapeText(person.name)}: ${money(debt.payload.amount)} borçlu</b><span>Bekleniyor</span></p>`,
            )
            .join("")}`
        : `<p class="empty">Şu anda bilinen bir yükümlülüğün yok.</p>`
    }</section>`;
}

function renderEvent() {
  if (!state.events.active) return "";
  const definition = getEventDefinition(state.events.active.eventId);
  if (!definition) return "";
  return `<div class="event-backdrop" role="presentation"><section class="event-card" role="dialog" aria-modal="true" aria-labelledby="event-title"><h2 id="event-title">${escapeText(definition.title)}</h2><p>${escapeText(definition.text)}</p><div class="event-choices">${definition.choices.map((choice) => `<button class="button event-choice" data-event-choice="${choice.id}"><strong>${escapeText(choice.label)}</strong><small>${escapeText(getChoiceEffectSummary(choice))}</small></button>`).join("")}</div></section></div>`;
}

const VIEW_RENDERERS = {
  career: renderCareer,
  education: renderEducation,
  people: renderPeopleScreen,
  relationships: renderRelationshipsOverview,
  home: renderHomes,
  finance: renderFinance,
  body: renderBody,
  history: renderHistory,
  yearbook: renderYearbook,
  character: renderCharacter,
  calendar: renderCalendar,
};

function render() {
  if (!state) return startScreen(loadGame(localStorage));
  if (!weekStartSnapshot) weekStartSnapshot = snapshotWeekState(state);
  const workspace = (VIEW_RENDERERS[activeView] || renderDashboard)();
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
  document.querySelectorAll("[data-person]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedPersonId = button.dataset.person;
      notice = "";
      render();
    }),
  );
  document.querySelectorAll("[data-open-person]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedPersonId = button.dataset.openPerson;
      activeView = "people";
      notice = "";
      render();
    }),
  );
  document.querySelectorAll("[data-social-action]").forEach((button) =>
    button.addEventListener("click", () => {
      const result = applySocialAction(
        state,
        button.dataset.personId,
        button.dataset.socialAction,
      );
      notice = result.reason || result.message;
      persist();
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
  document.querySelectorAll("[data-enroll]").forEach((button) =>
    button.addEventListener("click", () => {
      const result = enrollEducation(state, button.dataset.enroll, button.dataset.intensity);
      notice = result.reason || result.message;
      persist();
      render();
    }),
  );
  document.querySelector("#stop-education")?.addEventListener("click", () => {
    if (!window.confirm("Eğitimi bırakırsan biriken ilerleme silinir. Devam edilsin mi?")) return;
    const result = stopEducation(state);
    notice = result.reason || result.message;
    persist();
    render();
  });
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
    const before = weekStartSnapshot || snapshotWeekState(state);
    const result = advanceWeek(state);
    if (result.ok) {
      const changes = summarizeWeek(before, state);
      notice = changes.length
        ? changes.map((change) => describeWeeklyChange(change)).join(" · ")
        : "Sakin bir hafta geçti.";
      weekStartSnapshot = null;
    } else {
      notice = result.messages.join(" ");
    }
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
    weekStartSnapshot = null;
    render();
  });
}

render();
