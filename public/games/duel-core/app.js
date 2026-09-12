import { primaryTitle, cardActionTitle, dispatchPresented } from "./presentation.js";
import { buildCards } from "./card-data.js";
import { createDuel, rejection } from "./rules.js";
import { legalActions } from "./actions.js";
import { publicView } from "./projection.js";
import { chooseAction } from "./ai.js";
import { loadDuel, saveDuel } from "./save.js";
import { generateDeck } from "./deckgen.js";
import { random } from "./random.js";
import { PHASES } from "./model.js";
import { labels } from "./labels.js";
import { rejectionText } from "./rejections.js";
import { relatedCards } from "./relationships.js";
import { createMatchTelemetry, recordAction } from "./telemetry.js";
import { analyzeMatch } from "./analyzer.js";
import { loadSettings, saveSettings, loadHistory, recordMatch } from "./prefs.js";
import {
  applyDisplay,
  settingsBody,
  identityBody,
  relatedBlock,
  postMatchBody,
  analysisBody,
  historyBody,
  actionLogBody,
} from "./match-ux.js";

const $ = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") el.className = value;
    else if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else if (value !== false && value !== null && value !== undefined)
      el.setAttribute(key, value === true ? "" : String(value));
  }
  for (const child of children.flat(Infinity))
    if (child !== null && child !== undefined)
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return el;
};
export async function startApp(theme, designs) {
  const root = document.querySelector("#app");
  const motionLayer = $("div", { class: "duel-motion-layer", "aria-hidden": "true", inert: true });
  document.body.append(motionLayer);
  window.addEventListener("resize", () => {
    for (const animation of root.getAnimations({ subtree: true })) animation.cancel();
    motionLayer.replaceChildren();
  });
  const storage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  };
  let lang = "tr",
    motion = "on";
  try {
    lang = localStorage.getItem("tariklab.language") === "en" ? "en" : "tr";
    motion = localStorage.getItem("tariklab.duel.motion") || "on";
  } catch {
    /* Storage errors are reported when a duel is saved. */
  }
  let settings = loadSettings(storage);
  motion = settings.motion || motion;
  applyDisplay(settings, theme);
  let state = null,
    screen = "menu",
    selected = null,
    pool = [],
    saved = null,
    notice = "",
    timer = null,
    setup = null,
    lastPoints = null,
    lastRevision = -1,
    telemetry = null,
    lastAnalysis = null,
    shownResult = false,
    drag = null,
    hoverTimer = null,
    pressTimer = null;
  let archiveQuery = "",
    archiveKind = "",
    archiveSeries = "",
    archiveLevel = "",
    archiveSubtype = "",
    archiveLocation = "",
    archiveStat = "",
    archivePage = 0;
  const name = theme === "veto-h" ? "VETO-H!" : "GETT-OH!",
    point = theme === "veto-h" ? "OP" : "RP";
  const themeLabels =
    theme === "veto-h"
      ? {
          tr: {
            unit: "Kadro",
            spell: "Kampanya",
            trap: "Skandal",
            battle: "Tartışma",
            auxiliary: "Koalisyon Destesi",
            grave: "Atılan Kartlar",
            "end-main": "Turu Bitir",
            "set-field": "Alanı Set Et",
            rules: [
              "VETO-H!'ta bir siyasi kampanya yürütüyorsun. Amacın rakibinin OP'sini (puanını) sıfıra indirmek; ikiniz de 8000 OP ve 5 kartlık açılış eliyle başlarsınız.",
              "Düellodan önce 300 kartlık Kart Arşivi'nden rastgele, yasal bir 40 kartlık deste kurulur — her yeni düelloda deste yeniden karılır.",
              "Bir tur şu sırayla ilerler: Kart Çekme, Hazırlık, Hamle Aşaması 1, Tartışma, Hamle Aşaması 2, Tur Sonu. İlk oyuncu ilk turda kart çekmez ve Tartışma Aşaması'na giremez.",
              "Sahanda 5 Kadro ve 5 Destek bölgesi var. Turda 1 kez Kadro çağırabilir veya kapalı savunmada Set edebilirsin: Kademe 1–4 bedelsiz, 5–6 için 1 Kadro'yu adamalısın, 7+ için 2 Kadro.",
              "Set ettiğin kartlar (Kadro veya Skandal) kapalı kalır; sonraki bir Hamle Aşaması'nda açabilir veya Kadro'nun pozisyonunu değiştirebilirsin — çağrıldığı tur ve saldırdıktan sonra değişemez.",
              "Tartışma'da saldıran Kadro'nun gücü, karşısındaki Kadro'nun savunmasıyla ölçülür: yüksek değer kazanır, eşitlikte iki taraf da yok olur. Karşında Kadro yoksa doğrudan saldırıp rakibin OP'sini kırabilirsin.",
              "Rakibin ilan ettiği bir işleme (çağrı, saldırı, etkinleştirme…) bir kez Cevap Ver diyerek karşılık verebilirsin; zincir sonsuz sürmez.",
              "Tur Sonu'nda elinde 6'dan fazla kart kalamaz, fazlasını elden bırakırsın. Kart çekmen gerektiğinde desten boşsa kaybedersin; istediğin an Teslim Ol diyebilirsin.",
              "Düello otomatik kaydedilir — ana menüden Devam Et ile kaldığın yerden sürdürebilirsin.",
            ],
          },
          en: {
            unit: "Campaigner",
            spell: "Campaign",
            trap: "Scandal",
            battle: "Debate",
            auxiliary: "Coalition",
            "end-main": "End Turn",
            "set-field": "Set Field",
          },
        }
      : {
          tr: {
            unit: "Adam",
            spell: "Racon",
            trap: "İhbar",
            battle: "Kapışma",
            auxiliary: "Birleşik Deste",
            grave: "Iskarta",
            "end-main": "Turu Bitir",
            "set-field": "Alanı Set Et",
            rules: [
              "GETT-OH!'da sokakta racon kesiyorsun. Amacın rakibinin RP'sini (racon puanını) sıfıra indirmek; ikiniz de 8000 RP ve 5 kartlık açılış eliyle başlarsınız.",
              "Düellodan önce 300 kartlık Kart Arşivi'nden rastgele, yasal bir 40 kartlık deste kurulur — her yeni düelloda deste yeniden karılır.",
              "Bir tur şu sırayla ilerler: Kart Çekme, Hazırlık, Hamle Aşaması 1, Kapışma, Hamle Aşaması 2, Tur Sonu. İlk oyuncu ilk turda kart çekmez ve Kapışma Aşaması'na giremez.",
              "Sahanda 5 Adam ve 5 Destek bölgesi var. Turda 1 kez Adam'ı sahaya sürebilir veya kapalı Set edebilirsin: Kademe 1–4 bedelsiz, 5–6 için 1 Adam'ı feda etmelisin, 7+ için 2 Adam.",
              "Set ettiğin kartlar (Adam veya İhbar) kapalı kalır; sonraki bir Hamle Aşaması'nda açabilir veya Adam'ın pozisyonunu değiştirebilirsin — sahaya sürüldüğü tur ve saldırdıktan sonra değişemez.",
              "Kapışma'da saldıran Adam'ın gücü, karşısındaki Adam'ın savunmasıyla ölçülür: yüksek değer kazanır, eşitlikte iki taraf da yok olur. Karşında Adam yoksa doğrudan vurup rakibin RP'sini kırabilirsin.",
              "Rakibin ilan ettiği bir işleme (sahaya sürme, saldırı, etkinleştirme…) bir kez Cevap Ver diyerek karşılık verebilirsin; zincir sonsuz sürmez.",
              "Tur Sonu'nda elinde 6'dan fazla kart kalamaz, fazlasını elden bırakırsın. Kart çekmen gerektiğinde desten boşsa kaybedersin; istediğin an Teslim Ol diyebilirsin.",
              "Düello otomatik kaydedilir — ana menüden Devam Et ile kaldığın yerden sürdürebilirsin.",
            ],
          },
          en: {
            unit: "Crew",
            spell: "Racon",
            trap: "Tip-off",
            battle: "Clash",
            auxiliary: "Alliance",
            "end-main": "End Turn",
            "set-field": "Set Field",
          },
        };
  const t = (key) => themeLabels[lang][key] || labels[lang][key] || key;
  const text = (value) => (value && typeof value === "object" ? value[lang] : value);
  const persistSettings = (patch = {}) => {
    settings = { ...settings, ...patch, motion };
    saveSettings(storage, settings);
    applyDisplay(settings, theme);
  };
  const catalog = () => state?.catalog || Object.fromEntries(pool.map((c) => [c.id, c]));
  const rulesBody = () => {
    const rules = t("rules");
    return Array.isArray(rules) ? rules.map((p) => $("p", {}, p)) : $("p", {}, rules);
  };
  const button = (label, fn, attrs = {}) =>
    $("button", { type: "button", onclick: fn, ...attrs }, label);
  const actor = () => state?.choice?.player ?? state?.pending?.responding ?? state?.active;
  const view = () => publicView(state, 0);
  let actionCacheState = null,
    actionCache = [];
  const actions = () => {
    if (state !== actionCacheState) {
      actionCacheState = state;
      actionCache = state ? legalActions(state, 0) : [];
    }
    return actionCache;
  };
  const cname = (uid, v = view()) => {
    const c = v.cards[uid];
    return (
      text(c?.name) ||
      (c
        ? `${t("hidden")} · ${t(c.owner === 0 ? "you" : "opponent")} · ${t(c.zone === "units" ? "unit" : c.zone)} ${(c.slot ?? 0) + 1}`
        : t("hidden"))
    );
  };
  const displayError = (error) =>
    error === "storage-failed" ? t("saveError") : error === "no-save" ? t("noSave") : t("corrupt");
  const dialog = $("dialog", { "aria-labelledby": "dialog-title" });
  document.body.append(dialog);
  function close() {
    dialog.close();
    dialog.replaceChildren();
  }
  function show(title, body, cls = "") {
    if (dialog.open) dialog.close();
    dialog.className = cls;
    dialog.replaceChildren(
      $(
        "div",
        { class: "dialog-head" },
        $("h2", { id: "dialog-title" }, title),
        button(t("close"), close, { "aria-label": t("close") }),
      ),
      $("div", { class: "dialog-body" }, body),
    );
    dialog.showModal();
  }
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) close();
  });
  document.addEventListener("keydown", (e) => {
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName);
    if (e.key === "Escape") {
      selected = null;
      endDrag(true);
      if (dialog.open) {
        e.preventDefault();
        close();
      }
      if (screen === "duel") render();
      return;
    }
    if (typing || dialog.open) return;
    if (e.key === " " && screen === "duel" && state && !state.result && actor() === 0) {
      const phase = actions().find((a) => a.type === "phase");
      if (phase) {
        e.preventDefault();
        command(phase);
      }
      return;
    }
    if (e.key === "i" || e.key === "I") {
      if (selected) inspect(selected);
      return;
    }
    if (e.key === "h" || e.key === "H") {
      e.preventDefault();
      openHistory();
      return;
    }
    if ((e.key === "a" || e.key === "A") && screen === "menu") {
      screen = "archive";
      render();
      return;
    }
    if (screen === "duel" && state && actor() === 0 && /^[1-5]$/.test(e.key)) {
      const hand = view().players[0].hand;
      const uid = hand[Number(e.key) - 1];
      if (uid) selectCard(uid);
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== "tariklab.language" || !pool.length) return;
    lang = event.newValue === "en" ? "en" : "tr";
    close();
    render();
  });
  function ask(message, yes) {
    show(name, [
      $("p", {}, message),
      $(
        "div",
        { class: "dialog-actions" },
        button(t("cancel"), close),
        button(
          t("confirm"),
          () => {
            close();
            yes();
          },
          { class: "primary" },
        ),
      ),
    ]);
  }
  function save() {
    const result = saveDuel(storage, state);
    notice = result.ok ? "" : displayError(result.error);
    saved = { ok: true, state };
  }
  function command(action) {
    clearTimeout(timer);
    const oldCards = new Map(
      [...root.querySelectorAll(".zone [data-card],.hand-row [data-card]")].map((el) => [
        el.dataset.card,
        { rect: el.getBoundingClientRect(), clone: el.cloneNode(true) },
      ]),
    );
    try {
      const prev = state;
      const result = dispatchPresented(state, action);
      if (!result.ok) {
        notice = `${t("notLegal")}: ${reason(result.error)}`;
        render();
        return;
      }
      state = result.state;
      selected = null;
      if (telemetry) recordAction(telemetry, prev, state, action);
      save();
      if (state.result && !shownResult) {
        shownResult = true;
        lastAnalysis = analyzeMatch(telemetry, catalog(), lang);
        const plays = {};
        for (const [id, s] of Object.entries(telemetry?.cardStats || {})) plays[id] = s.plays || 0;
        recordMatch(storage, theme, {
          at: Date.now(),
          turns: lastAnalysis.turns,
          winner: lastAnalysis.winner,
          aiProfile: settings.aiProfile,
          identity: theme === "veto-h" ? settings.campaignStyle : settings.neighborhood,
          starId: lastAnalysis.starId,
          starValue: lastAnalysis.starValue,
          turning: lastAnalysis.turning,
          events: lastAnalysis.events,
          opByTurn: lastAnalysis.opByTurn,
          cardPlays: plays,
        });
      }
      render();
      if (state.result) showPostMatch();
      else {
        animateTransition(oldCards);
        scheduleAI();
      }
    } catch (error) {
      notice = `${t("notLegal")}. ${error.message}`;
      render();
    }
  }
  function animateTransition(oldCards) {
    if (motion !== "on" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const v = view(),
      current = new Map(
        [...root.querySelectorAll(".zone [data-card],.hand-row [data-card]")].map((el) => [
          el.dataset.card,
          el,
        ]),
      );
    const battle = v.log.findLast((e) => e.event === "battle" && e.revision === v.revision);
    for (const [uid, el] of current) {
      const old = oldCards.get(uid),
        rect = el.getBoundingClientRect();
      if (old) {
        const dx = old.rect.x - rect.x,
          dy = old.rect.y - rect.y;
        if (Math.abs(dx) + Math.abs(dy) > 4)
          el.animate(
            [
              { transform: `translate(${dx}px,${dy}px) translateZ(2px)`, opacity: 0.7 },
              { transform: "translate(0,0) translateZ(2px)", opacity: 1 },
            ],
            { duration: 250, easing: "ease-out" },
          );
        else if (old.clone.classList.contains("face-down") !== el.classList.contains("face-down"))
          el.animate(
            [
              { transform: "scaleX(.15) translateZ(2px)", filter: "brightness(1.7)" },
              { transform: "scaleX(1) translateZ(2px)", filter: "brightness(1)" },
            ],
            { duration: 220, easing: "ease-out" },
          );
      } else {
        const from = root
          .querySelector(`[data-pile="${v.cards[uid]?.owner}:deck"]`)
          ?.getBoundingClientRect();
        const dx = from ? from.x - rect.x : 0,
          dy = from ? from.y - rect.y : -18;
        el.animate(
          [
            { transform: `translate(${dx}px,${dy}px) translateZ(2px) scale(.55)`, opacity: 0 },
            { transform: "translate(0,0) translateZ(2px) scale(1)", opacity: 1 },
          ],
          { duration: 280, easing: "ease-out" },
        );
      }
      if (battle?.attacker === uid)
        el.animate(
          [
            { transform: "translateY(0) translateZ(2px)" },
            {
              transform: `translateY(${battle.player === 0 ? -32 : 32}px) translateZ(2px) scale(1.06)`,
            },
            { transform: "translateY(0) translateZ(2px)" },
          ],
          { duration: 250, easing: "ease-in-out" },
        );
    }
    for (const [uid, old] of oldCards)
      if (!current.has(uid)) {
        const { rect } = old,
          card = v.cards[uid],
          clone = card?.name ? cardEl(card, uid, null) : old.clone;
        clone.removeAttribute("data-card");
        clone.setAttribute("aria-hidden", "true");
        clone.style.cssText = `position:fixed;pointer-events:none;left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px;z-index:9;`;
        motionLayer.append(clone);
        const destination = state.players[card?.owner ?? 0].banished.includes(uid)
          ? "banished"
          : "grave";
        const target = root
          .querySelector(`[data-pile="${card?.owner ?? 0}:${destination}"]`)
          ?.getBoundingClientRect();
        const dx = target ? target.x - rect.x : 24,
          dy = target ? target.y - rect.y : 35;
        const effect = clone.animate(
          [
            { opacity: 0.9, transform: "translate(0,0) scale(1)" },
            { opacity: 0.8, transform: "translate(0,0) scale(1.04)", offset: 0.25 },
            { opacity: 0, transform: `translate(${dx}px,${dy}px) scale(.25)` },
          ],
          { duration: 320, easing: "ease-in" },
        );
        effect.onfinish = () => clone.remove();
      }
  }
  function reason(code) {
    return rejectionText(code, lang);
  }
  function scheduleAI() {
    clearTimeout(timer);
    if (screen !== "duel" || !state || state.result || actor() !== 1) return;
    timer = setTimeout(() => {
      const approved = legalActions(state, 1),
        action = chooseAction(publicView(state, 1), approved, settings.aiProfile || "controlled");
      if (action) command(action);
      else {
        notice = t("notLegal");
        render();
      }
    }, 220);
  }
  function header() {
    return $(
      "header",
      { class: "operations" },
      $("img", { src: `/games/${theme}/assets/emblem.svg`, alt: "" }),
      $("div", { class: "brand" }, $("strong", {}, name), $("small", {}, " · TARIKLAB")),
      button(
        lang === "tr" ? "EN" : "TR",
        () => {
          lang = lang === "tr" ? "en" : "tr";
          try {
            localStorage.setItem("tariklab.language", lang);
          } catch {
            /* Preference remains active for this visit. */
          }
          close();
          render();
        },
        { "aria-label": t("language") },
      ),
      button("?", () => show(t("help"), rulesBody()), { "aria-label": t("help") }),
      button(t("menu"), () => {
        clearTimeout(timer);
        screen = "menu";
        selected = null;
        render();
      }),
    );
  }
  function render() {
    root.removeAttribute("aria-busy");
    document.documentElement.lang = lang;
    document.body.dataset.theme = theme;
    document.body.dataset.motion = motion === "on" ? "full" : "reduced";
    applyDisplay(settings, theme);
    const targeting =
      screen === "duel" &&
      selected &&
      actions().some((a) => a.card === selected && (a.target !== undefined || a.slot !== undefined));
    document.body.dataset.targeting = targeting ? "true" : "";
    document.title = `${name} · TarikLab`;
    root.replaceChildren(
      header(),
      $("div", { class: "notice", role: "status", "aria-live": "polite" }, notice),
      screen === "archive" ? archive() : screen === "duel" ? board() : menu(),
    );
  }
  function menu() {
    return $(
      "main",
      { class: "menu-stage" },
      $(
        "section",
        { class: "front" },
        $("img", { class: "emblem", src: `/games/${theme}/assets/emblem.svg`, alt: "" }),
        $(
          "div",
          { class: "eyebrow" },
          theme === "veto-h"
            ? lang === "tr"
              ? "SEÇİM GECESİ · KART DÜELLOSU"
              : "ELECTION NIGHT · CARD DUEL"
            : lang === "tr"
              ? "İSTANBUL GECESİ · KART DÜELLOSU"
              : "ISTANBUL NIGHT · CARD DUEL",
        ),
        $("h1", {}, name),
        $("p", {}, t("deckNote")),
        $(
          "div",
          { class: "menu-buttons" },
          button(
            t("new"),
            () => {
              if (saved?.ok || saved?.error !== "no-save") ask(t("overwrite"), beginSetup);
              else beginSetup();
            },
            { class: "primary" },
          ),
          button(
            t("continue"),
            () => {
              if (saved?.ok) {
                state = saved.state;
                screen = "duel";
                shownResult = Boolean(state.result);
                telemetry =
                  telemetry ||
                  createMatchTelemetry({
                    theme,
                    seed: state.seed,
                    aiProfile: settings.aiProfile,
                    identity: theme === "veto-h" ? settings.campaignStyle : settings.neighborhood,
                  });
                if (state.result) {
                  lastAnalysis = analyzeMatch(telemetry, catalog(), lang);
                  render();
                  showPostMatch();
                } else {
                  render();
                  scheduleAI();
                }
              } else {
                notice = displayError(saved?.error);
                render();
              }
            },
            { disabled: !saved?.ok },
          ),
          button(`${t("archive")} · ${pool.length}`, () => {
            screen = "archive";
            render();
          }),
          button(t("help"), () => show(t("help"), rulesBody())),
          button(theme === "veto-h" ? t("campaignFile") : t("nightFile"), () => openCampaignFile()),
          button(t("settings"), openSettings),
          $("a", { href: "/", target: "_top" }, `← ${t("back")}`),
        ),
      ),
    );
  }
  function openSettings() {
    const refresh = () =>
      show(t("settings"), settingsBody($, t, settings, (patch) => {
        if (patch.motion) {
          motion = patch.motion;
          try {
            localStorage.setItem("tariklab.duel.motion", motion);
          } catch {
            /* Preference remains active for this visit. */
          }
        }
        persistSettings(patch);
        refresh();
      }));
    refresh();
  }
  function openCampaignFile() {
    show(theme === "veto-h" ? t("campaignFile") : t("nightFile"), historyBody($, t, lang, theme, loadHistory(storage, theme), catalog()));
  }
  function openHistory() {
    const events = telemetry?.events || lastAnalysis?.events || [];
    show(t("actionHistory"), actionLogBody($, t, events, catalog(), lang));
  }
  function showPostMatch() {
    if (!lastAnalysis) lastAnalysis = analyzeMatch(telemetry, catalog(), lang);
    show(
      t("postMatch"),
      postMatchBody($, t, lang, theme, lastAnalysis, catalog(), {
        analysis: () => show(t("analysis"), analysisBody($, t, lang, lastAnalysis, catalog())),
        history: openHistory,
        replay: () => {
          close();
          beginSetup();
        },
        menu: () => {
          close();
          screen = "menu";
          render();
        },
      }),
    );
  }
  function beginSetup() {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    setup = { seed, rng: seed, first: null };
    identitySetup();
  }
  function identitySetup() {
    const refresh = () =>
      show(
        t("aiStyle"),
        identityBody(
          $,
          t,
          lang,
          theme,
          settings,
          (patch) => {
            persistSettings(patch);
            refresh();
          },
          () => {
            persistSettings();
            rps();
          },
        ),
      );
    refresh();
  }
  function rps(message = "") {
    show(t("rps"), [
      $("p", {}, message || t("deckNote")),
      $(
        "div",
        { class: "dialog-actions" },
        ...["rock", "paper", "scissors"].map((key, i) =>
          button(t(key), () => {
            const enemy = Math.floor(random(setup) * 3),
              difference = (i - enemy + 3) % 3;
            if (!difference) {
              rps(`${t(key)} / ${t(["rock", "paper", "scissors"][enemy])}. ${t("rpsTie")}`);
              return;
            }
            if (difference === 1)
              show(t("rps"), [
                $("p", {}, t("rpsWin")),
                $(
                  "div",
                  { class: "dialog-actions" },
                  button(t("first"), () => prepare(0)),
                  button(t("second"), () => prepare(1)),
                ),
              ]);
            else prepare(1, t("rpsLose"));
          }),
        ),
      ),
    ]);
  }
  function prepare(first, message = "") {
    setup.first = first;
    setup.decks = [0, 1].map((p) =>
      generateDeck(pool, (setup.seed + Math.imul(p + 1, 2654435761)) >>> 0),
    );
    show(t("new"), [
      $("p", {}, message || t(first === 0 ? "first" : "second")),
      $("p", {}, t("deckNote")),
      button(t("preview"), () =>
        show(t("preview"), [
          $("p", {}, t("previewNote")),
          ...setup.decks[0].main
            .map((id) => pool.find((c) => c.id === id))
            .sort((a, b) => text(a.name).localeCompare(text(b.name), lang))
            .map((c) => $("div", {}, text(c.name))),
          button(t("back"), () => prepare(first, message)),
        ]),
      ),
      button(
        t("start"),
        () => {
          state = createDuel(pool, theme, setup.seed, setup.first, setup.decks);
          telemetry = createMatchTelemetry({
            theme,
            seed: setup.seed,
            aiProfile: settings.aiProfile,
            identity: theme === "veto-h" ? settings.campaignStyle : settings.neighborhood,
          });
          shownResult = false;
          lastAnalysis = null;
          setup = null;
          screen = "duel";
          lastPoints = null;
          close();
          save();
          render();
          scheduleAI();
        },
        { class: "primary" },
      ),
    ]);
  }
  function cardEl(card, uid, onClick, attrs = {}) {
    const hidden = !card?.name,
      down = hidden || (card.face === "down" && ["units", "support", "field"].includes(card.zone));
    return makeCard();
    function makeCard() {
      const el = $(
        onClick ? "button" : "article",
        {
          type: onClick ? "button" : null,
          class: `playing-card ${down ? "face-down" : ""} ${card?.position === "defense" ? "defense" : ""} ${uid === selected ? "selected" : ""} ${selected && uid && actions().some((a) => a.card === selected && a.target === uid) ? "valid-target" : ""}`,
          "data-kind": card?.kind || "",
          "data-card": uid,
          "data-used": state && card?.used?.activate === state.turn ? "true" : "false",
          "data-attacked": card?.attacksUsed > 0 ? "true" : "false",
          "data-response-ready":
            state &&
            card?.owner === 0 &&
            actions().some((a) => a.type === "respond" && a.card === uid)
              ? "true"
              : "false",
          "data-position": card?.position || "",
          "aria-label": hidden ? t("hidden") : text(card.name),
          ...attrs,
        },
        hidden
          ? null
          : $(
              "span",
              { class: "card-banner" },
              $("span", { class: "card-name" }, text(card.name)),
              card.kind === "unit" && Number.isFinite(card.level)
                ? $(
                    "span",
                    { class: "card-level", "aria-label": `${t("level")} ${card.level}` },
                    "★",
                    String(card.level),
                  )
                : $("span", { class: "card-level card-kind-tag" }, t(card.subtype) || t(card.kind)),
            ),
        $(
          "span",
          { class: "card-art", "aria-hidden": "true" },
          down
            ? "◈"
            : card.id && /^(SND|RCN)-[0-9]{3}$/.test(card.id)
              ? $("img", {
                  src: `/games/${theme}/assets/cards/${card.id}.webp`,
                  alt: "",
                  loading: "lazy",
                  decoding: "async",
                  width: theme === "veto-h" ? 576 : 400,
                  height: theme === "veto-h" ? 384 : 300,
                })
              : "◈",
        ),
        hidden
          ? null
          : $(
              "span",
              { class: "card-stats" },
              card.kind === "unit"
                ? [
                    $("span", { class: "card-atk" }, $("small", {}, "ATK"), String(card.attack)),
                    $("span", { class: "card-def" }, $("small", {}, "DEF"), String(card.defense)),
                  ]
                : [
                    $("span", { class: "card-atk" }, t(card.kind)),
                    $("span", { class: "card-def" }, t(card.subtype) || t(card.kind)),
                  ],
            ),
      );
      if (onClick) bindCardChrome(el, uid, card, onClick);
      return el;
    }
  }
  function previewInspect(uid) {
    const body = root.querySelector(".inspector-body");
    if (!body || screen !== "duel" || dialog.open) return;
    body.replaceChildren(...inspectBody(uid));
  }
  function beginDrag(el, uid, ev) {
    if (screen !== "duel" || !state || state.result || actor() !== 0) return;
    const card = view().cards[uid];
    if (!card || card.owner !== 0) return;
    const ghost = el.cloneNode(true);
    ghost.classList.add("drag-ghost");
    ghost.style.width = `${el.getBoundingClientRect().width}px`;
    ghost.style.height = `${el.getBoundingClientRect().height}px`;
    ghost.style.left = `${ev.clientX - 24}px`;
    ghost.style.top = `${ev.clientY - 24}px`;
    document.body.append(ghost);
    el.classList.add("dragging");
    el.dataset.skipClick = "1";
    drag = { uid, ghost, el };
    moveDrag(ev);
  }
  function moveDrag(ev) {
    if (!drag?.ghost) return;
    drag.ghost.style.left = `${ev.clientX - 24}px`;
    drag.ghost.style.top = `${ev.clientY - 24}px`;
  }
  function endDrag(cancel) {
    if (!drag) return;
    const { uid, ghost, el } = drag;
    ghost?.remove();
    el?.classList.remove("dragging");
    const x = cancel?.clientX,
      y = cancel?.clientY;
    drag = null;
    if (cancel === true || x == null) return;
    const hit = document.elementFromPoint(x, y);
    const zone = hit?.closest?.("[data-zone]");
    const targetCard = hit?.closest?.("[data-card]");
    const list = actions().filter((a) => a.card === uid);
    let match = null;
    if (zone) {
      const [, row, slot] = zone.dataset.zone.split("-");
      const n = Number(slot);
      match = list.find(
        (a) =>
          a.slot === n &&
          (row === "units" ? ["summon", "set-unit"].includes(a.type) : a.type === "set-support"),
      );
    }
    if (!match && targetCard?.dataset.card) {
      match = list.find((a) => a.target === targetCard.dataset.card);
    }
    if (match) playAction(match);
    else if (list.length) {
      notice = t("notLegal");
      render();
    }
  }
  function bindCardChrome(el, uid, card, onClick) {
    el.addEventListener("click", (e) => {
      if (el.dataset.skipClick === "1") {
        el.dataset.skipClick = "";
        e.preventDefault();
        return;
      }
      onClick(e);
    });
    el.addEventListener("dblclick", (e) => {
      e.preventDefault();
      if (screen === "archive" && card?.id) archiveInspect(card);
      else inspect(uid);
    });
    el.addEventListener("pointerenter", () => {
      if (window.matchMedia("(hover: hover)").matches && screen === "duel") {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => previewInspect(uid), 280);
      }
    });
    el.addEventListener("pointerleave", () => clearTimeout(hoverTimer));
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const start = { x: e.clientX, y: e.clientY };
      pressTimer = setTimeout(() => {
        if (screen === "archive" && card?.id) archiveInspect(card);
        else inspect(uid);
        el.dataset.skipClick = "1";
      }, 480);
      const move = (ev) => {
        if (Math.hypot(ev.clientX - start.x, ev.clientY - start.y) < 10) return;
        clearTimeout(pressTimer);
        if (!drag) beginDrag(el, uid, ev);
        else moveDrag(ev);
      };
      const up = (ev) => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        clearTimeout(pressTimer);
        if (drag) endDrag(ev);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }
  function selectCard(uid) {
    selected = uid;
    render();
    if (innerWidth <= 760) inspect(uid);
  }
  function actionTitle(action, v = view()) {
    let title = cardActionTitle(action, v.cards[action.card], v, theme, lang, t(action.type));
    if (action.target !== undefined)
      title += ` · ${action.target ? cname(action.target, v) : t("direct")}`;
    if (action.enabler) title += ` · ${t("ritual")}: ${cname(action.enabler, v)}`;
    if (action.slot !== undefined) title += ` · ${t("zone")} ${action.slot + 1}`;
    const materials = action.tributes || action.materials;
    if (materials?.length)
      title += ` · ${t(action.tributes ? "tributes" : "materials")}: ${materials.map((id) => cname(id, v)).join(", ")}`;
    if (action.targets?.length)
      title += ` · ${action.targets.map((id) => cname(id, v)).join(", ")}`;
    if (action.option) title += ` · ${optionName(action.option)}`;
    return title;
  }
  function optionName(id) {
    const option = state?.choice?.options?.find((o) => o.id === id);
    if (option?.card)
      return `${cname(option.card)}${option.materials?.length ? ` · ${t("materials")}: ${option.materials.map((uid) => cname(uid)).join(", ")}` : ""}`;
    if (id.startsWith("zone-")) return `${t("zone")} ${id.slice(5)}`;
    const cost = option?.effects?.find((op) => op.op === "points" && op.amount < 0)?.amount;
    return (
      {
        pay: `${lang === "tr" ? "Puan öde" : "Pay points"}${cost ? ` · ${-cost} ${point}` : ""}`,
        keep: lang === "tr" ? "Tut" : "Keep",
        destroy: lang === "tr" ? "Yok et" : "Destroy",
        discard: t("discard"),
        tribute: t("tributes"),
        set: t("set-support"),
        accept: t("confirm"),
      }[id] || t("choose")
    );
  }
  function selectAction(list) {
    if (!list.length) {
      notice = t("noActions");
      close();
      render();
      return;
    }
    if (list.length === 1) {
      confirmAction(list[0]);
      return;
    }
    let page = 0;
    function choices() {
      show(t("action"), [
        $(
          "div",
          { class: "choice-list" },
          ...list
            .slice(page * 12, page * 12 + 12)
            .map((a) => button(actionTitle(a), () => confirmAction(a))),
        ),
        $(
          "div",
          { class: "dialog-actions" },
          button(
            t("previous"),
            () => {
              page--;
              choices();
            },
            { disabled: page === 0 },
          ),
          button(
            t("next"),
            () => {
              page++;
              choices();
            },
            { disabled: (page + 1) * 12 >= list.length },
          ),
        ),
      ]);
    }
    choices();
  }
  function playAction(action) {
    close();
    if (action.type === "surrender") {
      ask(t("surrenderAsk"), () => command(action));
      return;
    }
    command(action);
  }
  function confirmAction(action) {
    playAction(action);
  }
  function inspectBody(uid, v = view()) {
    const card = v.cards[uid];
    if (!card) return [$("p", {}, t("hidden"))];
    const available = actions().filter((a) => a.card === uid),
      groups = [...new Set(available.map((a) => a.type))];
    const timingHint = card.hint && card.kind !== "unit";
    const body = [
      cardEl({ ...card, face: card.name ? "up" : card.face }, uid, null),
      card.name
        ? $(
            "small",
            {},
            `${card.id} · ${[].concat(card.series || []).join(" / ")} · ${t(card.kind)}`,
          )
        : null,
      card.text
        ? $("h3", {}, lang === "tr" ? "Bu Kart Ne Yapar?" : "What Does This Card Do?")
        : null,
      card.text ? $("p", { class: "effect-text" }, text(card.text)) : null,
      timingHint
        ? $("h3", {}, lang === "tr" ? "Ne Zaman Kullanılır?" : "When Can You Use It?")
        : null,
      card.hint ? $("small", {}, text(card.hint)) : null,
      card.used?.activate === v.turn
        ? $(
            "p",
            { class: "used-state" },
            lang === "tr" ? "Etki bu tur kullanıldı." : "Effect used this turn.",
          )
        : null,
      card.used?.duelActivated && card.traits?.oncePerDuel
        ? $(
            "p",
            { class: "used-state" },
            lang === "tr" ? "Düelloluk hak kullanıldı." : "Once-per-duel use spent.",
          )
        : null,
      available.some((a) => a.type === "respond")
        ? $(
            "p",
            { class: "used-state" },
            lang === "tr" ? "↩ Cevap vermeye hazır." : "↩ Ready to respond.",
          )
        : null,
      card.attacksUsed > 0
        ? $(
            "p",
            { class: "used-state" },
            lang === "tr"
              ? `Bu tur ${card.attacksUsed} saldırı yaptı.`
              : `${card.attacksUsed} attack(s) made this turn.`,
          )
        : null,
      card.kind === "unit" &&
      Number.isFinite(card.baseAttack) &&
      (card.attack !== card.baseAttack || card.defense !== card.baseDefense)
        ? $(
            "p",
            { class: "stat-change" },
            `${lang === "tr" ? "Temel → Güncel" : "Base → Current"}: ATK ${card.baseAttack} → ${card.attack} · DEF ${card.baseDefense} → ${card.defense}`,
          )
        : null,
      card.rulesNote ? $("small", {}, text(card.rulesNote)) : null,
      $("h3", {}, t("action")),
      $(
        "div",
        { class: "inspector-actions" },
        ...groups.map((type) =>
          button(
            cardActionTitle(
              available.find((a) => a.type === type),
              card,
              v,
              theme,
              lang,
              t(type),
            ),
            () => selectAction(available.filter((a) => a.type === type)),
            {
              class: "primary",
            },
          ),
        ),
      ),
    ];
    const blockedTypes =
      card.name && card.owner === 0
        ? (card.kind === "unit"
            ? card.zone === "hand"
              ? ["summon", "set-unit", ...(card.effects.length ? ["activate"] : [])]
              : card.zone === "units"
                ? ["position", "attack", ...(card.effects.length ? ["activate"] : [])]
                : []
            : card.zone === "hand"
              ? ["activate", card.subtype === "field" ? "set-field" : "set-support"]
              : card.face === "down"
                ? ["activate"]
                : []
          ).filter((type) => !groups.includes(type))
        : [];
    if (!available.length || blockedTypes.length)
      body.push($("h3", {}, lang === "tr" ? "Neden Kullanamıyorum?" : "Why Can't I Use This?"));
    if (!available.length) body.push($("p", {}, t("noActions")));
    for (const type of blockedTypes) {
      const error = rejection(state, {
        type,
        player: 0,
        revision: state.revision,
        card: uid,
        slot: 0,
        target: null,
        tributes: [],
      });
      body.push(
        $(
          "div",
          {},
          button(t(type), () => {}, { disabled: true }),
          $("small", {}, ` ${reason(error)}`),
        ),
      );
    }
    const related = card.name ? relatedCards(card, pool, 5) : [];
    body.push(...relatedBlock($, t, lang, related, (other) => {
      const live = Object.values(view().cards).find((c) => c.id === other.id && c.name);
      if (live) inspect(live.uid);
      else archiveInspect(other);
    }));
    return body;
  }
  function inspect(uid) {
    show(t("inspector"), inspectBody(uid), "inspector-sheet");
  }
  function pile(player, key, v) {
    if (key === "deck") return;
    const ids =
      key === "auxiliary"
        ? Object.values(v.cards)
            .filter((c) => c.owner === player && c.zone === "auxiliary")
            .map((c) => c.uid)
        : key === "field"
          ? [v.players[player].field].filter(Boolean)
          : v.players[player][key];
    show(
      t(key),
      ids?.length
        ? ids.map((uid) => button(cname(uid, v), () => inspect(uid)))
        : $("p", {}, t("empty")),
    );
  }
  function playerField(player, v) {
    const p = v.players[player],
      isPlayer = player === 0;
    const rows = ["units", "support"].map((row) =>
      $(
        "div",
        { class: `zones ${row === "support" ? "support-row" : ""}` },
        ...p[row].map((uid, slot) => {
          const legal =
            isPlayer &&
            selected &&
            actions().some(
              (a) =>
                a.card === selected &&
                a.slot === slot &&
                (row === "units"
                  ? ["summon", "set-unit"].includes(a.type)
                  : a.type === "set-support"),
            );
          return $(
            "div",
            {
              class: `zone ${legal || (uid && selected && actions().some((a) => a.card === selected && a.target === uid)) ? "legal valid-target" : ""}`,
              "data-zone": `${player}-${row}-${slot}`,
            },
            uid
              ? cardEl(v.cards[uid], uid, () => {
                  const attacks = selected
                    ? actions().filter((a) => a.card === selected && a.target === uid)
                    : [];
                  if (attacks.length) selectAction(attacks);
                  else selectCard(uid);
                })
              : button(
                  `${t(row === "units" ? "unit" : "support")} ${slot + 1}`,
                  () => {
                    if (legal)
                      selectAction(
                        actions().filter(
                          (a) =>
                            a.card === selected &&
                            a.slot === slot &&
                            (row === "units"
                              ? ["summon", "set-unit"].includes(a.type)
                              : a.type === "set-support"),
                        ),
                      );
                  },
                  {
                    class: "empty-zone",
                    disabled: !legal,
                    "aria-label": `${t("empty")} · ${t(row === "units" ? "unit" : "support")} ${slot + 1}`,
                  },
                ),
          );
        }),
      ),
    );
    const changed = lastPoints && lastPoints[player] !== p.points;
    return $(
      "section",
      {
        class: `player-field ${isPlayer ? "player" : "opponent"}`,
        "aria-label": t(isPlayer ? "you" : "opponent"),
      },
      $(
        "div",
        { class: "player-meter" },
        $(
          "span",
          {},
          lang === "tr"
            ? `${t(isPlayer ? "hand" : "opponentHand")} · ${p.handCount} Kart`
            : `${t(isPlayer ? "you" : "opponent")} · ${t(isPlayer ? "hand" : "opponentHand")} ${p.handCount}`,
        ),
        $(
          "strong",
          { class: changed ? "damage" : "" },
          `${p.points.toLocaleString(lang)} ${point}`,
        ),
      ),
      ...(isPlayer ? rows.slice().reverse() : rows),
      $(
        "div",
        { class: "piles" },
        $("span", { "data-pile": `${player}:deck` }, `${t("deck")} · ${p.deckCount}`),
        ...["auxiliary", "grave", "banished", "field"].map((key) =>
          button(
            `${t(key)} · ${key === "auxiliary" ? p.auxiliaryCount : key === "field" ? (p.field ? 1 : 0) : p[key].length}`,
            () => pile(player, key, v),
            { disabled: key === "auxiliary" && player === 1, "data-pile": `${player}:${key}` },
          ),
        ),
      ),
    );
  }
  const phaseFullName = {
    draw: lang === "tr" ? "Kart Çekme Aşaması" : "Draw Phase",
    standby: lang === "tr" ? "Hazırlık Aşaması" : "Standby Phase",
    main1: lang === "tr" ? "Hamle Aşaması" : "Main Phase",
    battle: lang === "tr" ? (theme === "veto-h" ? "Tartışma Aşaması" : "Kapışma Aşaması") : t("battle"),
    main2: lang === "tr" ? "Hamle Aşaması" : "Main Phase",
    end: lang === "tr" ? "Tur Sonu" : "End Phase",
  };
  function logLine(e, v) {
    const who = t(e.player === 0 ? "you" : "opponent");
    if (e.event === "battle") {
      const atkName = cname(e.attacker, v),
        iAttacked = e.player === 0;
      if (lang !== "tr")
        return `${who} attacked with “${atkName}”: ${e.damage.join(" / ")} ${point}.`;
      if (e.damage[1] > 0)
        return iAttacked
          ? `“${atkName}” rakibine ${e.damage[1]} ${point} hasar verdi.`
          : `Rakibin “${atkName}” kartı sana ${e.damage[1]} ${point} hasar verdi.`;
      if (e.damage[0] > 0)
        return iAttacked
          ? `“${atkName}” ile saldırırken ${e.damage[0]} ${point} kaybettin.`
          : `Rakip “${atkName}” ile saldırırken ${e.damage[0]} ${point} kaybetti.`;
      return iAttacked ? `“${atkName}” ile saldırdın.` : `Rakip “${atkName}” ile saldırdı.`;
    }
    if (e.event === "draw")
      return lang === "tr"
        ? e.player === 0
          ? `${e.count} kart çektin.`
          : `Rakip ${e.count} kart çekti.`
        : `${who} drew ${e.count} card(s).`;
    if (e.event === "move") {
      const label = cname(e.uid, v);
      const verb = {
        tr: {
          units: e.player === 0 ? "sahaya sürdün" : "sahaya sürdü",
          support: e.player === 0 ? "oynadın" : "oynadı",
          hand: e.player === 0 ? "eline aldın" : "eline aldı",
          grave: e.player === 0 ? "mezarlığa gönderdin" : "mezarlığa gönderdi",
          banished: e.player === 0 ? "oyun dışı bıraktın" : "oyun dışı bıraktı",
          deck: e.player === 0 ? "destene geri koydun" : "destesine geri koydu",
        },
        en: {
          units: "put onto the field",
          support: "played",
          hand: "returned to hand",
          grave: "sent to the graveyard",
          banished: "banished",
          deck: "returned to the deck",
        },
      }[lang][e.to];
      if (verb)
        return lang === "tr" ? `${who} “${label}” kartını ${verb}.` : `${who} ${verb} “${label}”.`;
      return `${who}: ${label} → ${t(e.to === "hand" ? "hand" : e.to === "units" ? "unit" : e.to)}`;
    }
    if (e.event === "phase") {
      const label = phaseFullName[e.phase] || t(e.phase);
      return lang === "tr"
        ? e.player === 0
          ? `${label}’na geçtin.`
          : `Rakip ${label}’na geçti.`
        : `${who} moved to the ${label}.`;
    }
    if (e.event === "result") return t("finished");
    if (e.event === "targets-unavailable") return t("targetsUnavailable");
    if (e.event === "start") return lang === "tr" ? "Düello başladı." : "The duel began.";
    return `${who}: ${t(e.event === "look" ? "select" : e.event === "reveal" ? "effect" : e.event === "token" ? "summon" : "effect")}`;
  }
  function board() {
    const v = view(),
      approved = actions(),
      phase = approved.find((a) => a.type === "phase"),
      pass = approved.find((a) => a.type === "pass");
    const logBody = $(
      "ol",
      {},
      ...v.log
        .slice(-20)
        .reverse()
        .map((e) => $("li", {}, $("small", {}, `${t("turn")} ${e.turn} · `), logLine(e, v))),
    );
    const status = v.result
      ? t(v.result.winner === null ? "tie" : v.result.winner === 0 ? "win" : "lose")
      : actor() === 1
        ? t("thinking")
        : v.choice
          ? t("choice")
          : v.pending
            ? t("response")
            : t("yourMove");
    const content = $(
      "main",
      { class: "duel-layout" },
      $("aside", { class: "panel ledger" }, $("h2", { class: "panel-title" }, t("log")), logBody),
      $(
        "section",
        { class: "table-workspace" },
        $(
          "div",
          {
            class: `duel-table ${v.log.at(-1)?.event === "battle" && lastRevision !== v.revision ? "battle-feedback" : ""}`,
          },
          playerField(1, v),
          $(
            "nav",
            {
              class: "phase-strip",
              "aria-label": lang === "tr" ? "Düello Aşamaları" : "Duel Phases",
            },
            ...PHASES.map((p) =>
              $(
                "span",
                {
                  class: p === v.phase ? "current" : "",
                  "aria-current": p === v.phase ? "step" : null,
                },
                t(p),
              ),
            ),
          ),
          playerField(0, v),
        ),
        $(
          "section",
          { class: "hand-deck" },
          $("div", { class: "eyebrow" }, `${t("hand")} · ${v.players[0].handCount}`),
          $(
            "div",
            { class: "hand-row" },
            ...v.players[0].hand.map((uid) => cardEl(v.cards[uid], uid, () => selectCard(uid))),
          ),
        ),
        $(
          "div",
          { class: "action-dock" },
          $("p", { "aria-live": "polite" }, `${t("turn")} ${v.turn} · ${status}`),
          phase
            ? button(primaryTitle(v, theme, lang), () => command(phase), { class: "primary" })
            : null,
          pass ? button(t("pass"), () => command(pass)) : null,
          approved.some((a) => a.type === "end-main") &&
            (!phase || primaryTitle(v, theme, lang) !== t("end-main"))
            ? button(t("end-main"), () =>
                confirmAction(approved.find((a) => a.type === "end-main")),
              )
            : null,
          v.choice && actor() === 0
            ? button(t("choose"), () => selectAction(approved), { class: "primary" })
            : null,
          selected
            ? button(t("inspector"), () => inspect(selected), { class: "mobile-inspect" })
            : null,
          button(t("log"), () => show(t("log"), logBody.cloneNode(true))),
          button(t("actionHistory"), openHistory),
          !v.result
            ? button(
                t("surrender"),
                () =>
                  ask(t("surrenderAsk"), () =>
                    command({ type: "surrender", player: 0, revision: state.revision }),
                  ),
                { class: "danger" },
              )
            : button(t("menu"), () => {
                screen = "menu";
                render();
              }),
        ),
      ),
      $(
        "aside",
        { class: "panel inspector" },
        $("h2", { class: "panel-title" }, t("inspector")),
        $(
          "div",
          { class: "inspector-body" },
          selected
            ? inspectBody(selected, v)
            : [
                $("p", {}, t("select")),
                $(
                  "small",
                  {},
                  lang === "tr"
                    ? "Elinden veya sahadan bir karta dokun. Ayrıntılar ve yasal işlemler burada görünür."
                    : "Tap a card in your hand or on the field. Its details and legal actions appear here.",
                ),
              ],
        ),
      ),
    );
    lastPoints = v.players.map((p) => p.points);
    lastRevision = v.revision;
    return content;
  }
  function archiveInspect(card) {
    show(
      text(card.name),
      [
        cardEl(card, card.id, null),
        $("small", {}, `${card.id} · ${t(card.kind)} · ${card.series.join(" / ")}`),
        $("p", { class: "effect-text" }, text(card.text)),
        card.hint ? $("small", {}, text(card.hint)) : null,
        card.attacksUsed > 0
          ? $(
              "p",
              { class: "used-state" },
              lang === "tr"
                ? `Bu tur ${card.attacksUsed} saldırı yaptı.`
                : `${card.attacksUsed} attack(s) made this turn.`,
            )
          : null,
        card.kind === "unit" &&
        Number.isFinite(card.baseAttack) &&
        (card.attack !== card.baseAttack || card.defense !== card.baseDefense)
          ? $(
              "p",
              { class: "stat-change" },
              `${lang === "tr" ? "Temel → Güncel" : "Base → Current"}: ATK ${card.baseAttack} → ${card.attack} · DEF ${card.baseDefense} → ${card.defense}`,
            )
          : null,
        card.rulesNote ? $("small", {}, text(card.rulesNote)) : null,
        ...relatedBlock($, t, lang, relatedCards(card, pool, 5), archiveInspect),
      ],
      "inspector-sheet",
    );
  }
  function archive() {
    const filtered = pool.filter(
      (c) =>
        (!archiveQuery ||
          `${text(c.name)} ${text(c.text)} ${c.id}`
            .toLocaleLowerCase(lang)
            .includes(archiveQuery.toLocaleLowerCase(lang))) &&
        (!archiveKind || c.kind === archiveKind) &&
        (!archiveSeries || c.series.includes(archiveSeries)) &&
        (!archiveLevel || String(c.level) === archiveLevel) &&
        (!archiveSubtype || c.subtype === archiveSubtype) &&
        (!archiveLocation || c.deckLocation === archiveLocation) &&
        (!archiveStat ||
          (c.kind === "unit" &&
            (archiveStat === "low"
              ? c.attack < 1500
              : archiveStat === "mid"
                ? c.attack >= 1500 && c.attack < 2500
                : c.attack >= 2500))),
    );
    const perPage = 24;
    archivePage = Math.min(archivePage, Math.max(0, Math.ceil(filtered.length / perPage) - 1));
    const select = (key, value, options, onChange) =>
      $(
        "select",
        {
          "aria-label": t(key),
          onchange: (e) => {
            onChange(e.target.value);
            archivePage = 0;
            render();
          },
        },
        $("option", { value: "" }, `${t(key)} · ${t("all")}`),
        ...options.map(([id, label]) => $("option", { value: id, selected: id === value }, label)),
      );
    return $(
      "main",
      { class: "archive" },
      $(
        "div",
        { class: "archive-head" },
        $("h1", {}, t("archive")),
        $("span", {}, `${filtered.length} / ${pool.length}`),
      ),
      $(
        "div",
        { class: "filters" },
        $("input", {
          type: "search",
          placeholder: t("search"),
          "aria-label": t("search"),
          value: archiveQuery,
          oninput: (e) => {
            archiveQuery = e.target.value;
            archivePage = 0;
            const cursor = e.target.selectionStart;
            render();
            const input = root.querySelector("input");
            input.focus();
            input.setSelectionRange(cursor, cursor);
          },
        }),
        select(
          "all",
          archiveKind,
          ["unit", "spell", "trap"].map((k) => [k, t(k)]),
          (v) => (archiveKind = v),
        ),
        select(
          "series",
          archiveSeries,
          [...new Set(pool.flatMap((c) => c.series))].map((s) => [s, s]),
          (v) => (archiveSeries = v),
        ),
        select(
          "subtype",
          archiveSubtype,
          [...new Set(pool.map((c) => c.subtype))].map((k) => [k, t(k)]),
          (v) => (archiveSubtype = v),
        ),
        select(
          "deckLocation",
          archiveLocation,
          [
            ["main", t("mainDeck")],
            ["auxiliary", t("auxiliary")],
          ],
          (v) => (archiveLocation = v),
        ),
        select(
          "statRange",
          archiveStat,
          [
            ["low", "ATK < 1500"],
            ["mid", "ATK 1500–2499"],
            ["high", "ATK ≥ 2500"],
          ],
          (v) => (archiveStat = v),
        ),
        select(
          "level",
          archiveLevel,
          [...new Set(pool.filter((c) => c.kind === "unit").map((c) => c.level))]
            .sort((a, b) => a - b)
            .map((n) => [String(n), String(n)]),
          (v) => (archiveLevel = v),
        ),
      ),
      $(
        "div",
        { class: "archive-grid" },
        ...filtered
          .slice(archivePage * perPage, (archivePage + 1) * perPage)
          .map((c) => cardEl(c, c.id, () => archiveInspect(c))),
      ),
      $(
        "nav",
        { class: "pagination" },
        button(
          t("previous"),
          () => {
            archivePage--;
            render();
          },
          { disabled: archivePage === 0 },
        ),
        $(
          "span",
          {},
          `${t("page")} ${archivePage + 1} / ${Math.max(1, Math.ceil(filtered.length / perPage))}`,
        ),
        button(
          t("next"),
          () => {
            archivePage++;
            render();
          },
          { disabled: (archivePage + 1) * perPage >= filtered.length },
        ),
      ),
    );
  }
  try {
    const response = await fetch(`/games/${theme}/source-cards.json`);
    if (!response.ok) throw Error(String(response.status));
    pool = buildCards(await response.json(), designs, theme);
    saved = loadDuel(storage, pool, theme);
    if (saved.recovered) notice = t("recovered");
    else if (!saved.ok && saved.error !== "no-save") notice = displayError(saved.error);
    render();
  } catch (error) {
    root.removeAttribute("aria-busy");
    root.replaceChildren(
      $(
        "main",
        { class: "menu-stage" },
        $(
          "section",
          { class: "front" },
          $("h1", {}, name),
          $("p", {}, t("loadError")),
          button(t("retry"), () => location.reload()),
          $("a", { href: "/", target: "_top" }, t("back")),
        ),
      ),
    );
    console.error(error);
  }
  return { getScreen: () => screen, getState: () => state };
}
