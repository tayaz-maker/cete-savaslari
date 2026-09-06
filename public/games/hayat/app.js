import { MAJORS } from "../next-wave.js";
import { CHAPTERS } from "../next-wave/hayat-data.js";
import {
  bindSavePanel,
  bootGame,
  escapeHtml as h,
  savePanel,
  text as t,
} from "../next-wave/shared/runtime.js";

const root = document.body;

function currentEvent(state) {
  if (state.flags.majorTurn === state.turn) {
    const last = state.decisionsLog.at(-1);
    const decided = MAJORS.find((event) => event.id === last?.event);
    if (decided) return decided;
  }
  const used = new Set((state.decisionsLog || []).map((decision) => decision.event));
  const fresh = MAJORS.filter((event) => event.chapter === state.chapter && !used.has(event.id));
  const pool = fresh.length ? fresh : MAJORS.filter((event) => event.chapter === state.chapter);
  return pool[state.turn % Math.max(1, pool.length)] || MAJORS[0];
}

function choicesFor(event) {
  const alternates = {
    work: ["work", "school", "stay"],
    education: [event.choice, "work", "delay"],
    housing: [event.choice, "stay", "move"],
    family: [event.choice, "help", "delay"],
    romance: [event.choice, "commit", "free"],
    money: [event.choice, "save", "give"],
  };
  return [...new Set(alternates[event.domain] || [event.choice, "ambition", "slow"])].slice(0, 3);
}

const choiceCopy = {
  ambition: [
    "Yüklen",
    "Para artar; enerji ve zaman daralır",
    "Push ahead",
    "Money rises; energy and time narrow",
  ],
  work: [
    "Şimdi işe gir",
    "Gelir şimdi, başka yol kapanabilir",
    "Take the work",
    "Income now; another path may close",
  ],
  school: [
    "Öğrenime devam",
    "Para ve enerji gider; ileride kapı bırakır",
    "Keep studying",
    "Costs money and energy; leaves a later door",
  ],
  stay: ["Olduğun yerde kal", "Güvenli; hareket alanı dar", "Stay", "Safer; less room to move"],
  move: ["Yola çık", "Bağlar gerilir; yeni yol açılır", "Move", "Ties strain; a new route opens"],
  give: ["El uzat", "Nakit azalır; bağ güçlenir", "Give", "Cash falls; the bond strengthens"],
  help: ["Yanında dur", "Kendi planın gecikir", "Show up", "Your own plan slips"],
  delay: ["Ertele", "Bugün ucuz; gölgesi belirsiz", "Delay", "Cheap today; uncertain shadow"],
  commit: [
    "Bağlan",
    "Esneklik azalır; bağ derinleşir",
    "Commit",
    "Less flexibility; a deeper bond",
  ],
  free: [
    "Mesafeyi koru",
    "Söz yok; güven de sınırlı",
    "Keep distance",
    "No promise; limited trust",
  ],
  save: ["Biriktir", "Bugünü kıs; yarına alan aç", "Save", "Cut today; make room for tomorrow"],
  slow: [
    "Yavaşla",
    "Unvan bekler; beden nefes alır",
    "Slow down",
    "Status waits; the body breathes",
  ],
};

function draw(session) {
  const state = session.state;
  if (!state) {
    root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="life-head"><div><p class="eyebrow">${t("18 YAŞ · BÖLÜM I", "AGE 18 · CHAPTER I")}</p><h1>HAYAT</h1><p class="muted">${t("Her haftayı değil, yıllar sonra hatırlanacak dönüm noktalarını yaşayacaksın.", "You will live the turning points remembered years later, not every ordinary week.")}</p></div></section><section class="card"><h2>${t("İlk sayfa", "The first page")}</h2><p>${t("Cebinde ₺1.000, enerjin yerinde, önünde başkasının yazmadığı bir hayat var. Seçimler hemen sonuç verir; bazıları Uzun Gölge bırakır.", "You have ₺1,000, enough energy, and a life no one else has written. Choices have immediate results; some leave a Long Shadow.")}</p><button id="start" type="button">${t("HAYATA BAŞLA", "BEGIN LIFE")}</button></section></main>`;
    root.querySelector("#start").addEventListener("click", () => session.start());
    bindSavePanel(root, session);
    return;
  }
  const event = currentEvent(state);
  const decided = state.flags.majorTurn === state.turn;
  const chapter = CHAPTERS.find((item) => item.id === state.chapter) || CHAPTERS[0];
  const open = state.shadows.filter((shadow) => shadow.status === "open");
  const resolved = state.shadows.filter((shadow) => shadow.status === "resolved");
  root.innerHTML = `<main class="game-root"><header class="topbar"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">HAYAT · ${state.age}</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="life-head"><div><p class="eyebrow">${state.age} ${t("YAŞ", "YEARS OLD")}</p><h1>HAYAT</h1></div><div class="chapter">${t("BÖLÜM", "CHAPTER")} ${state.chapter} · ${h(chapter.name)}<br><small>${t("Enerji", "Energy")} ${state.resources.energy} · ₺${state.resources.money} · ${t("Beden", "Health")} ${state.resources.health}</small></div></section>
    <section class="life-grid"><aside class="card"><p class="eyebrow">${t("HAYAT ÇİZGİSİ", "LIFE LINE")}</p><div class="timeline">${state.decisionsLog
      .slice(-6)
      .map(
        (decision) =>
          `<div class="life-point"><b>${18 + Math.floor(decision.turn / 4)}</b><span>${h(decision.title)}<br><small class="muted">${h(decision.choice)}</small></span></div>`,
      )
      .join(
        "",
      )}<div class="life-point now"><b>${state.age}</b><span>${t("Şimdi", "Now")}</span></div></div></aside>
      <section class="card turning"><p class="eyebrow">${decided ? t("SEÇİM YAPILDI", "CHOICE MADE") : t("BU DÖNEMİN DÖNÜM NOKTASI", "THIS CHAPTER'S TURNING POINT")}</p><h2>${h(event.title)}</h2><p>${h(event.text)}</p>${
        decided
          ? `<p><strong>${t("Bu karar deftere yazıldı.", "This choice is now in the diary.")}</strong> ${open.some((shadow) => shadow.event === event.id) ? t("Bir Uzun Gölge kaldı; ne zaman döneceğini bilmiyorsun.", "A Long Shadow remains; you do not know when it will return.") : ""}</p><button type="button" id="next" class="life-next">${t("SONRAKİ DÖNEM", "NEXT PASSAGE")}</button>`
          : `<div class="choice-grid">${choicesFor(event)
              .map((choice) => {
                const copy = choiceCopy[choice] || [
                  choice,
                  "Sonucu şimdi, gölgesi sonra",
                  choice,
                  "The result now; the shadow later",
                ];
                return `<button type="button" class="choice" data-choice="${h(choice)}"><strong>${h(t(copy[0], copy[2]))}</strong><br><small>${h(t(copy[1], copy[3]))}</small></button>`;
              })
              .join("")}</div>`
      }</section>
      <aside class="card shadows"><p class="eyebrow">${t("UZUN GÖLGELER", "LONG SHADOWS")}</p><div class="shadow-list">${open.map((shadow) => `<div class="shadow"><strong>${h(shadow.category)}</strong><br>${t("Doğduğu yaş", "Born at age")} ${shadow.createdAt} · ${t("açık", "open")}</div>`).join("") || `<p>${t("Henüz açık gölge yok.", "No open shadow yet.")}</p>`}${resolved
        .slice(-3)
        .map(
          (shadow) =>
            `<div class="shadow resolved"><strong>${h(shadow.category)}</strong><br>${h(shadow.text)}</div>`,
        )
        .join("")}</div></aside></section>
    <section class="archive">${state.history
      .slice(-6)
      .reverse()
      .map(
        (row) =>
          `<span>${row.type === "major" ? t("Dönüm noktası", "Turning point") : t("Gölge döndü", "Shadow returned")} · ${h(row.title || row.text || row.choice || "")}</span>`,
      )
      .join(
        "",
      )}</section><p class="notice">${h(session.notice)}</p><details class="help"><summary>${t("Nasıl oynanır", "How to play")}</summary><p>${t("Her bölümde merkezi dönüm noktasındaki gerçek seçeneklerden birini seç. Aynı dönüm noktası iki kez alınamaz. Seçim bir Uzun Gölge doğurabilir; yaşı ilerlettikçe gölge uygun zamanda arşive geri döner.", "Choose one real option at the chapter's central turning point. A turning point cannot be taken twice. A choice may create a Long Shadow; as life advances it returns to the archive when eligible.")}</p></details><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
  root
    .querySelectorAll("[data-choice]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`choose:${button.dataset.choice}`)),
    );
  root.querySelector("#next")?.addEventListener("click", () => session.act("advance"));
  bindSavePanel(root, session);
}

bootGame("hayat", draw);
