import {
  APPS, CONTACTS, DISCOVERABLES, ENDINGS, availableEvidence, phoneThreads,
  PHONE_FACTS, PHONE_THEORIES, PHONE_SIDE_SECRETS, PHONE_DECISIONS,
  createPhoneState, newCaseSeed, evidenceSpec,
} from "../next-wave.js";
import { HELP_SECTIONS } from "./help.js";
import { THREADS } from "../next-wave/kayip-data.js";
import {
  bindFrontMenu,
  bindSavePanel,
  bootGame,
  escapeHtml as h,
  frontMenu,
  loc,
  savePanel,
  text as t,
  helpPanel,
} from "../next-wave/shared/runtime.js";

const root = document.body;
const appCopy = {
  messages: ["Mesajlar", "Messages", "✉"],
  contacts: ["Rehber", "Contacts", "◎"],
  calls: ["Aramalar", "Calls", "↗"],
  photos: ["Fotoğraflar", "Photos", "▧"],
  notes: ["Notlar", "Notes", "≡"],
  calendar: ["Takvim", "Calendar", "□"],
  files: ["Dosyalar", "Files", "⌁"],
  voice: ["Ses Kayıtları", "Voice", "◉"],
};
let view = "menu";
const p = (value) => Array.isArray(value) ? t(value[0], value[1]) : loc(value);

function messageText(message) {
  if (message && typeof message === "object" && !Array.isArray(message)) return p(message.text);
  return p(message);
}

function clueLabel(id, state) {
  const spec = state ? evidenceSpec(state, id) : null;
  if (spec) return p(spec.title);
  const item = DISCOVERABLES.find((row) => row.id === id);
  if (item) return p(item.title);
  const thread = THREADS.find((row) => row.id === id);
  if (thread) {
    const person = CONTACTS.find((contact) => contact.id === thread.contactId);
    return person?.name || id;
  }
  return p(id);
}

function slotSummary(state) {
  const ending = state.flags.ending ? ` · ${t("dosya kapandı", "case closed")}` : "";
  return `${state.discoveredItems.length} ${t("keşif", "discoveries")} · ${t("mahremiyet", "privacy")} ${state.privacyPressure}/100${ending}`;
}

function menu(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header>${frontMenu(
    session,
    {
      kicker: t("BULUNAN CİHAZ", "FOUND DEVICE"),
      title: "KAYIP TELEFON",
      pitch: t(
        "Bir telefon bulundu. İçindeki hayat sana ait değil.",
        "A phone was found. The life inside does not belong to you.",
      ),
      summary: slotSummary,
      help: HELP_SECTIONS,
    },
  )}</main>`;
  bindFrontMenu(root, session, {
    onNew: () => {
      view = "setup";
      session.render();
    },
  });
}

function setup(session) {
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span data-lang-host></span></header><section class="setup-shell phone-wrap"><div class="lockscreen"><div class="lock-time">21:14</div><p class="eyebrow">1 ${t("BİLDİRİM", "NOTIFICATION")}</p><h1>${t("Bu telefon senin değil.", "This phone is not yours.")}</h1><p>${t("Telefonu sokakta buldun. İstediğin an iade edebilirsin. Daha çok kurcalamak daha fazla bilgi verir; mahremiyet bedelini de büyütür.", "You found the phone on the street. You may return it at any time. Looking deeper reveals more and raises the privacy cost.")}</p><div class="setup-actions"><button type="button" id="cancel-setup">${t("GERİ", "BACK")}</button><button type="button" id="confirm-start" class="primary">${t("TELEFONU AÇ", "OPEN PHONE")}</button></div></div></section></main>`;
  root.querySelector("#cancel-setup").addEventListener("click", () => {
    session.cancelNew();
    view = "menu";
    session.render();
  });
  root.querySelector("#confirm-start").addEventListener("click", () => session.commitNew());
}

function contactCards() {
  return `<div class="contact-list">${CONTACTS.map((person) => `<article class="contact-card"><h3>${h(person.name)}</h3><small>${h(p(person.relation || ""))}${person.lastContact ? ` · ${h(p(person.lastContact))}` : ""}</small><p>${h(p(person.bio || person.tone || ""))}</p><em>${h(p(person.voice || ""))}</em></article>`).join("")}</div>`;
}

function itemMeta(item) {
  const bits = [item.when, item.where, item.duration, item.caption].filter(Boolean).map((value) => h(p(value)));
  return bits.length ? `<span class="photo-meta">${bits.join(" · ")}</span>` : "";
}

function threadView(threads) {
  return threads.map((thread) => {
    const person = CONTACTS.find((contact) => contact.id === thread.contactId);
    const bubbles = (thread.messages || []).slice(-10);
    return `<article class="thread"><h3>${h(person?.name)}</h3>${bubbles.map((message) => {
      const sys = message && typeof message === "object" && !Array.isArray(message) && message.sys;
      return `<div class="bubble${sys ? " sys-bubble" : ""}">${h(messageText(message))}</div>`;
    }).join("")}</article>`;
  }).join("");
}

function reportTraces(report) {
  const rows = report?.traces || [];
  if (!rows.length) return "";
  return `<div class="report-traces"><strong>${t("İzler", "Traces")}</strong>${rows.map((row) => `<p>${h(p(row.text))}</p>`).join("")}</div>`;
}

function draw(session) {
  const state = session.state;
  if (!state) {
    return view === "setup" ? setup(session) : menu(session);
  }
  const ending = state.flags.ending && ENDINGS[state.flags.ending];
  const active = state.ui?.app || "messages";
  const items = availableEvidence(state, active);
  const threads = phoneThreads(state);
  const tab = state.ui?.caseTab || "evidence";
  const statusCopy = { weak: ["zayıf", "weak"], supported: ["destekleniyor", "supported"], strong: ["güçlü", "strong"], conflicted: ["çelişkili", "conflicted"], refuted: ["çürütüldü", "refuted"] };
  const report = state.caseReport;
  const noteish = (item) => item.app === "notes" || (item.tags || []).includes("draft");
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">KAYIP TELEFON</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="phone-wrap"><div class="phone"><div class="phone-status"><span>21:14</span><span>${t("SAHİBİ BİLİNMİYOR", "OWNER UNKNOWN")}</span><span class="privacy">${t("MAHREMİYET", "PRIVACY")} ${state.privacyPressure}/100</span></div>${
    ending
      ? `<section class="ending"><div class="case-report"><p class="eyebrow">${t("VAKA RAPORU", "CASE REPORT")} · #${state.caseSeed}</p><h1>${h(p(ending.title))}</h1><p>${h(p(ending.text))}</p><p>${t("Keşif", "Discoveries")} ${state.discoveredItems.length} · ${t("mahremiyet", "privacy")} ${state.privacyPressure} · ${t("güven", "confidence")} ${report?.confidence || 0}%</p><div class="report-grid"><div><strong>${t("Teoriler", "Theories")}</strong>${(report?.theories || []).map((x) => `<p>${h(p(PHONE_THEORIES.find((q) => q.id === x.question)?.options.find((o) => o.id === x.option)?.title))} · ${h(t(...statusCopy[x.status]))}</p>`).join("") || `<p>${t("Teori kurulmadı.", "No theory was formed.")}</p>`}</div><div><strong>${t("Kritik çıkarımlar", "Critical deductions")}</strong><p>${(report?.criticalEvidence || []).map((id) => h(p(PHONE_FACTS.find((x) => x.id === id)?.title))).join(" · ") || t("Yok", "None")}</p><strong>${t("Kaçırılanlar", "Missed")}</strong><p>${(report?.missedFacts || []).map((id) => h(p(PHONE_FACTS.find((x) => x.id === id)?.title))).join(" · ") || t("Yok", "None")}</p></div><div><strong>${t("Yan sırlar", "Side secrets")}</strong><p>${(report?.sideSecrets || []).map((id) => h(p(PHONE_SIDE_SECRETS.find((x) => x.id === id)?.title))).join(" · ") || t("Yok", "None")}</p><strong>${t("Karar", "Decision")}</strong><p>${h(p(PHONE_DECISIONS.find((x) => x.id === report?.decision)?.title))}</p></div></div>${reportTraces(report)}</div></section>`
      : `<div class="phone-grid"><nav class="app-dock" aria-label="${t("Telefon uygulamaları", "Phone apps")}">${APPS.map(
          (app) => {
            const copy = appCopy[app];
            const unlocked = state.unlockedApps.includes(app);
            return `<button type="button" class="app-button ${active === app ? "is-active" : ""}" data-app="${app}" ${unlocked ? "" : "disabled"} title="${unlocked ? t("Aç", "Open") : t("Yeni bir bulgu ile açılır", "Unlocks after another finding")}"><i>${copy[2]}</i><span>${t(copy[0], copy[1])}${unlocked ? "" : ` · ${t("kilitli", "locked")}`}</span></button>`;
          },
        ).join(
          "",
        )}</nav><section class="phone-screen"><p class="eyebrow">${t(appCopy[active][0], appCopy[active][1])}</p>${
          active === "messages" ? threadView(threads) : ""
        }${
          active === "contacts" ? contactCards() : ""
        }<div class="item-list">${
          items
            .map((item) => {
              const read = state.discoveredItems.includes(item.id);
              const locked = item.requires?.some(
                (required) => !state.discoveredItems.includes(required),
              );
              return `<button type="button" class="phone-item ${read ? "is-read" : ""} ${noteish(item) ? "note-draft" : ""}" data-item="${h(item.id)}" ${read || locked ? "disabled" : ""}><strong>${h(p(item.title))}</strong>${itemMeta(item)}<small>${read ? h(p(item.text)) : locked ? t("Önce ilişkili bir notu bulmalısın.", "Find the related note first.") : t("Açmak mahremiyet baskısını artırabilir.", "Opening may increase privacy pressure.")}</small></button>`;
            })
            .join("") ||
          `<p class="muted">${t("Bu uygulamada yeni öğe yok.", "No new item in this app.")}</p>`
        }</div></section><aside class="evidence"><p class="eyebrow">${t("VAKA DEFTERİ", "CASE NOTEBOOK")}</p><div class="case-tabs"><button data-case-tab="evidence" class="${tab === "evidence" ? "is-active" : ""}">${t("KANIT", "EVIDENCE")}</button><button data-case-tab="theory" class="${tab === "theory" ? "is-active" : ""}">${t("TEORİ", "THEORY")}</button><button data-case-tab="timeline" class="${tab === "timeline" ? "is-active" : ""}">${t("ZAMAN", "TIMELINE")}</button></div>${tab === "evidence" ? `<p>${t("Bağ", "Links")} ${state.evidenceLinks.length} · ${t("Çelişki", "Contradictions")} ${state.contradiction.length}</p><div class="evidence-list">${state.discoveredItems.map((id) => `<div class="evidence-row"><span>${h(clueLabel(id, state))}</span><div><button data-pin="${h(id)}">${state.pinnedItems.includes(id) ? "★" : "☆"}</button><button data-link="${h(id)}" class="${state.ui.linkFrom === id ? "is-active" : ""}">${state.ui.linkFrom ? t("BAĞLA", "LINK") : t("SEÇ", "SELECT")}</button></div></div>`).join("") || `<p class="muted">${t("Bir öğeyi inceleyerek başla.", "Inspect an item to begin.")}</p>`}</div>` : tab === "theory" ? `<div class="theory-list">${PHONE_THEORIES.map((q) => `<section><strong>${h(p(q.title))}</strong>${q.options.map((o) => { const selected = state.hypotheses.find((x) => x.question === q.id && x.option === o.id); return `<button data-theory="${q.id}:${o.id}" class="${selected ? "is-active" : ""}">${h(p(o.title))}${selected ? `<small>${h(t(...statusCopy[selected.status]))} · ${selected.confidence}%</small>` : ""}</button>`; }).join("")}</section>`).join("")}</div>` : `<div class="timeline-list">${state.timeline.slice().reverse().map((row) => `<div class="evidence-row"><small>#${row.order || "–"}</small> ${h(clueLabel(row.item, state))}</div>`).join("") || `<p class="muted">${t("Henüz zaman çizelgesi yok.", "The timeline is empty.")}</p>`}</div>`}</aside></div><div class="return-bar"><label>${t("Son karar", "Final decision")} <select id="decision">${PHONE_DECISIONS.map((x) => `<option value="${x.id}" ${state.decision === x.id ? "selected" : ""}">${h(p(x.title))}</option>`).join("")}</select></label><button type="button" id="return">${t("DOSYAYI KAPAT / İADE ET", "CLOSE CASE / RETURN")}</button></div>`
  }</div></section><p class="notice">${h(session.notice)}</p>${helpPanel(HELP_SECTIONS)}</main>`;
  root
    .querySelectorAll("[data-app]")
    .forEach((button) =>
      button.addEventListener("click", () => session.setUI("app", button.dataset.app)),
    );
  root.querySelectorAll("[data-case-tab]").forEach((button) => button.addEventListener("click", () => session.setUI("caseTab", button.dataset.caseTab)));
  root.querySelectorAll("[data-pin]").forEach((button) => button.addEventListener("click", () => session.act(`pin:${button.dataset.pin}`)));
  root.querySelectorAll("[data-link]").forEach((button) => button.addEventListener("click", () => {
    const from = session.state.ui.linkFrom, id = button.dataset.link;
    if (!from) session.setUI("linkFrom", id); else session.act(`link:${from}:${id}`);
  }));
  root.querySelectorAll("[data-theory]").forEach((button) => button.addEventListener("click", () => session.act(`theory:${button.dataset.theory}`)));
  root.querySelector("#decision")?.addEventListener("change", (event) => session.act(`decision:${event.target.value}`));
  root
    .querySelectorAll("[data-item]")
    .forEach((button) =>
      button.addEventListener("click", () => session.act(`discover:${button.dataset.item}`)),
    );
  root.querySelector("#return")?.addEventListener("click", () => {
    if (
      window.confirm(
        t(
          "Telefonu iade edip dosyayı kapatmak istiyor musun?",
          "Return the phone and close the case?",
        ),
      )
    )
      session.act("return");
  });
  bindSavePanel(root, session);
}

bootGame("kayip-telefon", draw, { create: () => createPhoneState(newCaseSeed()), safe: true });
