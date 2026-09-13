import { APPS, CONTACTS, DISCOVERABLES, ENDINGS } from "../next-wave.js";
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
function clueLabel(id) {
  const item = DISCOVERABLES.find((row) => row.id === id);
  if (item) return loc(item.title);
  const thread = THREADS.find((row) => row.id === id);
  if (thread) {
    const person = CONTACTS.find((contact) => contact.id === thread.contactId);
    return person?.name || id;
  }
  return loc(id);
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

function draw(session) {
  const state = session.state;
  if (!state) {
    return view === "setup" ? setup(session) : menu(session);
  }
  const ending = state.flags.ending && ENDINGS[state.flags.ending];
  const active = state.ui?.app || "messages";
  const items = DISCOVERABLES.filter((item) => item.app === active);
  const threads = state.threads || [];
  root.innerHTML = `<main class="game-root"><header class="topbar global-chrome"><a href="/">${t("← Oyunlar", "← Games")}</a><span class="topbar__title">KAYIP TELEFON</span><div class="topbar__tools"><span data-lang-host></span>${savePanel(session)}</div></header><section class="phone-wrap"><div class="phone"><div class="phone-status"><span>21:14</span><span>${t("SAHİBİ BİLİNMİYOR", "OWNER UNKNOWN")}</span><span class="privacy">${t("MAHREMİYET", "PRIVACY")} ${state.privacyPressure}/100</span></div>${
    ending
      ? `<section class="ending"><div><p class="eyebrow">${t("TELEFON İADE EDİLDİ", "PHONE RETURNED")}</p><h1>${h(loc(ending.title))}</h1><p>${h(loc(ending.text))}</p><p>${t("Keşif", "Discoveries")} ${state.discoveredItems.length} · ${t("mahremiyet baskısı", "privacy pressure")} ${state.privacyPressure}</p></div></section>`
      : `<div class="phone-grid"><nav class="app-dock" aria-label="${t("Telefon uygulamaları", "Phone apps")}">${APPS.map(
          (app) => {
            const copy = appCopy[app];
            const unlocked = state.unlockedApps.includes(app);
            return `<button type="button" class="app-button ${active === app ? "is-active" : ""}" data-app="${app}" ${unlocked ? "" : "disabled"} title="${unlocked ? t("Aç", "Open") : t("Yeni bir bulgu ile açılır", "Unlocks after another finding")}"><i>${copy[2]}</i><span>${t(copy[0], copy[1])}${unlocked ? "" : ` · ${t("kilitli", "locked")}`}</span></button>`;
          },
        ).join(
          "",
        )}</nav><section class="phone-screen"><p class="eyebrow">${t(appCopy[active][0], appCopy[active][1])}</p>${
          active === "messages"
            ? threads
                .slice(0, 3)
                .map((thread) => {
                  const person = CONTACTS.find((contact) => contact.id === thread.contactId);
                  return `<article class="thread"><h3>${h(person?.name)}</h3>${thread.messages.map((message) => `<div class="bubble">${h(loc(message))}</div>`).join("")}</article>`;
                })
                .join("")
            : ""
        }<div class="item-list">${
          items
            .map((item) => {
              const read = state.discoveredItems.includes(item.id);
              const locked = item.requires?.some(
                (required) => !state.discoveredItems.includes(required),
              );
              return `<button type="button" class="phone-item ${read ? "is-read" : ""}" data-item="${h(item.id)}" ${read || locked ? "disabled" : ""}><strong>${h(loc(item.title))}</strong><small>${read ? h(loc(item.text)) : locked ? t("Önce ilişkili bir notu bulmalısın.", "Find the related note first.") : t("Açmak mahremiyet baskısını artırabilir.", "Opening may increase privacy pressure.")}</small></button>`;
            })
            .join("") ||
          `<p class="muted">${t("Bu uygulamada yeni öğe yok.", "No new item in this app.")}</p>`
        }</div></section><aside class="evidence"><p class="eyebrow">${t("BULGULAR", "EVIDENCE")}</p><p>${t("Doğrulanan", "Corroborated")} ${state.corroboration.length} · ${t("Çelişki", "Contradictions")} ${state.contradiction.length}</p><div class="evidence-list">${state.corroboration
          .slice(-4)
          .map(
            (row) =>
              `<div class="evidence-row">✓ ${h(clueLabel(row.item))} ↔ ${h(clueLabel(row.with))}</div>`,
          )
          .join("")}${state.contradiction
          .slice(-4)
          .map(
            (row) =>
              `<div class="evidence-row contra">! ${h(clueLabel(row.item))} ≠ ${h(clueLabel(row.with))}</div>`,
          )
          .join(
            "",
          )}${!state.corroboration.length && !state.contradiction.length ? `<p class="muted">${t("Öğeleri okuyup ilişkileri kendin kur.", "Read items and build the links yourself.")}</p>` : ""}</div></aside></div><div class="return-bar"><span>${t("Telefonu her an iade edebilirsin; bu dosyayı kapatır.", "You may return the phone at any time; this closes the case.")}</span><button type="button" id="return">${t("TELEFONU İADE ET", "RETURN PHONE")}</button></div>`
  }</div></section><p class="notice">${h(session.notice)}</p>${helpPanel(HELP_SECTIONS)}</main>`;
  root
    .querySelectorAll("[data-app]")
    .forEach((button) =>
      button.addEventListener("click", () => session.setUI("app", button.dataset.app)),
    );
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

bootGame("kayip-telefon", draw);
