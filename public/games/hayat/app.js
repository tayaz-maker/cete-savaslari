import { MAJORS } from "../next-wave.js";
import { CHAPTERS } from "../next-wave/hayat-data.js";
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

const shadowLabel = {
  education: ["Eğitim", "Education"],
  career: ["Kariyer", "Career"],
  family: ["Aile", "Family"],
  romance: ["İlişki", "Romance"],
  friendship: ["Dostluk", "Friendship"],
  housing: ["Barınma", "Housing"],
  money: ["Para", "Money"],
  duty: ["Yükümlülük", "Duty"],
  body: ["Beden", "Body"],
  ambition: ["Hırs", "Ambition"],
  network: ["Çevre", "Network"],
  regret: ["Pişmanlık", "Regret"],
  migration: ["Göç", "Migration"],
  "health-habit": ["Alışkanlık", "Habit"],
  civic: ["Yurttaşlık", "Civic"],
  skill: ["Beceri", "Skill"],
  "kin-money": ["Aile parası", "Family money"],
  lease: ["Kira", "Lease"],
  tempo: ["Tempo", "Pace"],
  "return-home": ["Dönüş", "Return"],
  "second-chance": ["İkinci şans", "Second chance"],
};

function labelShadow(category) {
  const row = shadowLabel[category];
  return row ? t(row[0], row[1]) : loc(category);
}

function labelType(type) {
  const map = {
    decision: ["Karar", "Decision"],
    shadow: ["Uzun Gölge", "Long Shadow"],
    advance: ["Dönem", "Passage"],
    milestone: ["Eşik", "Milestone"],
  };
  const row = map[type];
  return row ? t(row[0], row[1]) : loc(type);
}

function labelRelation(id) {
  const map = {
    family: ["Aile", "Family"],
    friend: ["Arkadaş", "Friend"],
    partner: ["Partner", "Partner"],
    work: ["İş", "Work"],
  };
  const row = map[id];
  return row ? t(row[0], row[1]) : loc(id);
}
const screens = [
  ["decisions", "KARARLAR", "DECISIONS"],
  ["me", "BEN", "ME"],
  ["path", "YOL", "PATH"],
  ["money", "PARA", "MONEY"],
  ["people", "İNSANLAR", "PEOPLE"],
  ["home", "EV", "HOME"],
  ["shadows", "UZUN GÖLGE", "LONG SHADOW"],
  ["history", "GEÇMİŞ", "HISTORY"],
];
const root = document.body;
let view = "menu";
let draftName = "";

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

function setup(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell card"><p class="eyebrow">${t("YENİ HAYAT", "NEW LIFE")}</p><h1>HAYAT</h1><p>${t("18 yaşındasın. Önündeki yol kararlarınla biçimlenecek; bazı kararlar yıllar sonra Uzun Gölge olarak dönecek.", "You are 18. Decisions will shape your path; some return years later as a Long Shadow.")}</p><label for="player-name">${t("Adın", "Your name")}</label><input id="player-name" maxlength="28" autocomplete="off" value="${h(draftName)}" placeholder="${t("Adını yaz", "Enter your name")}"><div class="setup-summary"><span>${t("Başlangıç yaşı", "Starting age")} <b>18</b></span><span>${t("Nakit", "Cash")} <b>₺1.000</b></span><span>${t("Enerji / Beden", "Energy / Health")} <b>100 / 100</b></span></div><div class="setup-actions"><button id="cancel-setup" class="secondary" type="button">${t("GERİ", "BACK")}</button><button id="confirm-start" type="button" ${draftName.trim() ? "" : "disabled"}>${t("HAYATA BAŞLA", "BEGIN LIFE")}</button></div></section></main>`;
  const input = root.querySelector("#player-name");
  input.addEventListener("input", () => {
    draftName = input.value;
    root.querySelector("#confirm-start").disabled = !draftName.trim();
  });
  root.querySelector("#cancel-setup").addEventListener("click", () => {
    session.cancelNew();
    view = "menu";
    draw(session);
  });
  root.querySelector("#confirm-start").addEventListener("click", () => {
    if (!draftName.trim()) return;
    session.commitNew({
      configure: (state) => {
        state.playerName = draftName.trim().slice(0, 28);
        state.ui = { ...state.ui, screen: "decisions" };
      },
    });
  });
}

function panel(state) {
  const screen = state.ui?.screen || "decisions";
  const event = currentEvent(state);
  const decided = state.flags.majorTurn === state.turn;
  const open = state.shadows.filter((shadow) => shadow.status === "open");
  if (screen === "decisions")
    return `<section class="active-panel decision-surface"><p class="eyebrow">${decided ? t("KARAR VERİLDİ", "DECISION MADE") : t("ANA KARAR", "MAIN DECISION")}</p><h2>${h(loc(event.title))}</h2><p>${h(loc(event.text))}</p>${
      decided
        ? `<div class="result-card"><strong>${t("Karar işlendi.", "Decision recorded.")}</strong><p>${open.some((shadow) => shadow.event === event.id) ? t("Bir Uzun Gölge doğdu. Ne zaman döneceği gizli.", "A Long Shadow was born. Its return remains hidden.") : t("Bu karar açık gölge bırakmadı.", "This decision left no open shadow.")}</p></div><button id="next" type="button">${t("SONRAKİ DÖNEM", "NEXT PASSAGE")}</button>`
        : `<div class="choice-grid">${choicesFor(event)
            .map((choice) => {
              const c = choiceCopy[choice] || [
                choice,
                "Sonucu şimdi, gölgesi sonra",
                choice,
                "Result now; shadow later",
              ];
              return `<button type="button" class="choice" data-choice="${h(choice)}"><strong>${h(t(c[0], c[2]))}</strong><small>${h(t(c[1], c[3]))}</small></button>`;
            })
            .join("")}</div>`
    }</section>`;
  if (screen === "me")
    return `<section class="active-panel"><p class="eyebrow">${t("BEN", "ME")}</p><h2>${h(state.playerName || t("İsimsiz", "Unnamed"))}</h2><div class="management-grid"><article><span>${t("Yaş", "Age")}</span><b>${state.age}</b></article><article><span>${t("Enerji", "Energy")}</span><b>${state.resources.energy}</b></article><article><span>${t("Beden", "Health")}</span><b>${state.resources.health}</b></article></div></section>`;
  if (screen === "path")
    return `<section class="active-panel"><p class="eyebrow">${t("YOL", "PATH")}</p><h2>${h(CHAPTERS.find((c) => c.id === state.chapter)?.name || String(state.chapter))}</h2><p>${t("Verdiğin ana kararlar yolunu ve açılan seçenekleri belirler.", "Main decisions determine your path and the options that open.")}</p><div class="result-feed">${
      state.decisionsLog
        .slice(-5)
        .reverse()
        .map((d) => `<div><b>${h(loc(d.title))}</b><span>${h(t(choiceCopy[d.choice]?.[0] || d.choice, choiceCopy[d.choice]?.[2] || d.choice))}</span></div>`)
        .join("") || `<p>${t("Henüz karar yok.", "No decisions yet.")}</p>`
    }</div></section>`;
  if (screen === "money")
    return `<section class="active-panel"><p class="eyebrow">${t("PARA", "MONEY")}</p><div class="management-grid"><article><span>${t("Nakit", "Cash")}</span><b>₺${state.resources.money}</b></article><article><span>${t("Kariyer", "Career")}</span><b>${state.resources.career || 0}</b></article></div></section>`;
  if (screen === "people")
    return `<section class="active-panel"><p class="eyebrow">${t("İNSANLAR", "PEOPLE")}</p><div class="management-grid">${
      (state.relationships || [])
        .map(
          (relationship) =>
            `<article><span>${h(labelRelation(relationship.id))}</span><b>${Math.round(relationship.value)}</b></article>`,
        )
        .join("") ||
      `<p>${t("Bağlar kararlarla oluşacak.", "Bonds will form through decisions.")}</p>`
    }</div></section>`;
  if (screen === "home")
    return `<section class="active-panel"><p class="eyebrow">${t("EV", "HOME")}</p><h2>${h(state.home || t("Başlangıç evi", "Starting home"))}</h2><p>${t("Barınma ve aile kararlarının sonuçları burada görünür.", "Housing and family decisions appear here.")}</p></section>`;
  if (screen === "shadows")
    return `<section class="active-panel"><p class="eyebrow">${t("UZUN GÖLGE", "LONG SHADOW")}</p>${open.map((s) => `<article class="shadow"><strong>${h(labelShadow(s.category))}</strong><p>${t("Açık · dönüş zamanı bilinmiyor", "Open · return time unknown")}</p></article>`).join("") || `<p>${t("Henüz açık gölge yok.", "No open shadow yet.")}</p>`}</section>`;
  return `<section class="active-panel"><p class="eyebrow">${t("GEÇMİŞ", "HISTORY")}</p><div class="result-feed">${
    state.history
      .slice(-12)
      .reverse()
      .map(
        (row) =>
          `<div><b>${h(labelType(row.type))}</b><span>${h(loc(row.title || row.text || choiceCopy[row.choice]?.[0] || row.choice || ""))}</span></div>`,
      )
      .join("") || `<p>${t("Kayıt henüz boş.", "The record is empty.")}</p>`
  }</div></section>`;
}

function draw(session) {
  const state = session.state;
  if (!state) {
    if (view === "setup") return setup(session);
    root.innerHTML = frontMenu(session, {
      title: "HAYAT",
      eyebrow: t("BİR YAŞAM YÖNETİM OYUNU", "A LIFE MANAGEMENT GAME"),
      pitch: t(
        "Dönüm noktalarını yönet; seçimlerinin yıllar sonra dönen gölgeleriyle yaşa.",
        "Manage turning points and live with choices whose shadows return years later.",
      ),
      slotSummary: (s) =>
        `${h(s.playerName || t("İsimsiz", "Unnamed"))} · ${s.age} ${t("yaş", "years")} · ${t("Bölüm", "Chapter")} ${s.chapter}`,
    });
    bindFrontMenu(root, session, {
      onNew: () => {
        draftName = "";
        view = "setup";
        draw(session);
      },
    });
    return;
  }
  const screen = state.ui?.screen || "decisions";
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">HAYAT</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="life-hud"><div><p class="eyebrow">${h(state.playerName || t("İsimsiz", "Unnamed"))}</p><h1>${state.age} ${t("YAŞ", "YEARS")}</h1></div><div class="hud-metrics"><span>₺${state.resources.money}</span><span>${t("Enerji", "Energy")} ${state.resources.energy}</span><span>${t("Beden", "Health")} ${state.resources.health}</span><span>${t("Bölüm", "Chapter")} ${state.chapter}</span></div></section><section class="life-management"><nav class="life-nav" aria-label="${t("Hayat bölümleri", "Life sections")}">${screens.map((item) => `<button type="button" data-screen="${item[0]}" class="${screen === item[0] ? "is-active" : ""}">${t(item[1], item[2])}</button>`).join("")}</nav><div>${panel(state)}<section class="result-feed live-log"><p class="eyebrow">${t("CANLI SONUÇ AKIŞI", "LIVE RESULT FEED")}</p>${
    state.history
      .slice(-4)
      .reverse()
      .map(
        (row) =>
          `<div><b>${h(labelType(row.type))}</b><span>${h(loc(row.title || choiceCopy[row.choice]?.[0] || row.choice || row.text || ""))}</span></div>`,
      )
      .join("") || `<p>${t("İlk kararını bekliyor.", "Waiting for your first decision.")}</p>`
  }</section></div></section><p class="notice">${h(session.notice)}</p><footer class="footer">© 2026 TarikLab · Tarık Halil Ayaz</footer></main>`;
  root
    .querySelectorAll("[data-screen]")
    .forEach((button) =>
      button.addEventListener("click", () => session.setUI("screen", button.dataset.screen)),
    );
  root
    .querySelectorAll("[data-choice]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`choose:${button.dataset.choice}`)),
    );
  root.querySelector("#next")?.addEventListener("click", () => session.act("advance"));
  bindSavePanel(root, session);
}

bootGame("hayat", draw);
