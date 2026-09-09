import { buildCards } from "./card-data.js";
import { createDuel, dispatch, rejection } from "./rules.js";
import { legalActions } from "./actions.js";
import { publicView } from "./projection.js";
import { chooseAction } from "./ai.js";
import { loadDuel, saveDuel } from "./save.js";
import { generateDeck } from "./deckgen.js";
import { random } from "./random.js";
import { PHASES } from "./model.js";
import { labels } from "./labels.js";

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
  let state = null,
    screen = "menu",
    selected = null,
    pool = [],
    saved = null,
    notice = "",
    timer = null,
    setup = null,
    lastPoints = null,
    lastRevision = -1;
  let archiveQuery = "",
    archiveKind = "",
    archiveSeries = "",
    archiveLevel = "",
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
            auxiliary: "Koalisyon",
            "end-main": "Bitişe Geç",
            "set-field": "Alanı Set Et",
          },
          en: {
            unit: "Campaigner",
            spell: "Campaign",
            trap: "Scandal",
            battle: "Debate",
            auxiliary: "Coalition",
            "end-main": "Go to End",
            "set-field": "Set Field",
          },
        }
      : {
          tr: {
            unit: "Adam",
            spell: "Racon",
            trap: "İhbar",
            battle: "Kapışma",
            auxiliary: "Birleşim",
            "end-main": "Bitişe Geç",
            "set-field": "Alanı Set Et",
          },
          en: {
            unit: "Crew",
            spell: "Racon",
            trap: "Tip-off",
            battle: "Clash",
            auxiliary: "Alliance",
            "end-main": "Go to End",
            "set-field": "Set Field",
          },
        };
  const t = (key) => themeLabels[lang][key] || labels[lang][key] || key;
  const text = (value) => (typeof value === "object" ? value[lang] : value);
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
    if (e.key === "Escape") {
      selected = null;
      if (dialog.open) {
        e.preventDefault();
        close();
      }
      if (screen === "duel") render();
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
      const result = dispatch(state, action);
      if (!result.ok) {
        notice = `${t("notLegal")}: ${reason(result.error)}`;
        render();
        return;
      }
      state = result.state;
      selected = null;
      save();
      render();
      animateTransition(oldCards);
      scheduleAI();
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
              { transform: `translate(${dx}px,${dy}px)`, opacity: 0.7 },
              { transform: "translate(0,0)", opacity: 1 },
            ],
            { duration: 250, easing: "ease-out" },
          );
        else if (old.clone.classList.contains("face-down") !== el.classList.contains("face-down"))
          el.animate(
            [
              { transform: "scaleX(.15)", filter: "brightness(1.7)" },
              { transform: "scaleX(1)", filter: "brightness(1)" },
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
            { transform: `translate(${dx}px,${dy}px) scale(.55)`, opacity: 0 },
            { transform: "translate(0,0) scale(1)", opacity: 1 },
          ],
          { duration: 280, easing: "ease-out" },
        );
      }
      if (battle?.attacker === uid)
        el.animate(
          [
            { transform: "translateY(0)" },
            { transform: `translateY(${battle.player === 0 ? -32 : 32}px) scale(1.06)` },
            { transform: "translateY(0)" },
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
    const map = {
      "normal-used": [
        "Bu tur normal çağrı/set hakkı kullanıldı.",
        "Normal summon/set already used this turn.",
      ],
      "main-phase-only": ["Ana evre gerekli.", "Requires a Main Phase."],
      "trap-must-wait": [
        "Set tuzağın sonraki turu beklemesi gerekir.",
        "Set traps must wait until a later turn.",
      ],
      "quick-must-wait": [
        "Bu tur set edilen hızlı kart beklemeli.",
        "A Quick-Play set this turn must wait.",
      ],
      "no-activated-effect": [
        "Bu kartın etkinleştirilen etkisi yok.",
        "This card has no activated effect.",
      ],
      "unit-must-be-on-field": [
        "Birim önce sahaya çağrılmalı.",
        "Summon this unit to the field first.",
      ],
      "position-used": [
        "Bu tur pozisyon değişimi uygun değil.",
        "Position cannot change this turn.",
      ],
      "response-only": [
        "Uygun rakip işlemine tepki sırasında kullanılır.",
        "Use in response to a matching opposing action.",
      ],
      "effect-used": ["Bu etki hakkı kullanıldı.", "This effect has already been used."],
      "tributes-required": [
        "Yeterli adak ve boş bölge gerekli.",
        "Requires enough tributes and a free zone.",
      ],
      "opponent-turn": ["Rakibin sırası.", "It is the opponent’s turn."],
      "battle-unavailable": ["Bu evrede savaş yapılamaz.", "Battle is unavailable in this phase."],
      "stale-action": [
        "Durum değişti; işlemi yeniden seçin.",
        "State changed; select the action again.",
      ],
    };
    Object.assign(map, {
      "unit-zone-required": [
        "Boş bir kadro bölgesi veya o bölgeden adak gerekli.",
        "Requires an empty unit zone or a tribute from that zone.",
      ],
      "support-zone-required": [
        "Boş bir destek bölgesi gerekli.",
        "Requires an empty support zone.",
      ],
      "insufficient-points": [
        "Etki bedelini ödeyecek puan yok.",
        "Not enough points to pay the effect cost.",
      ],
      "no-legal-target": [
        "Etki koşullarını karşılayan hedef yok.",
        "No target meets the effect requirements.",
      ],
      "special-requirements": [
        "Gerekli malzemeler, ritüel kartı veya boş bölge eksik.",
        "Missing required materials, ritual enabler or an empty zone.",
      ],
      "flip-required": ["Kapalı kart önce açılmalı.", "Flip this face-down card first."],
      "effect-negated": [
        "Etki bir saha kuralıyla engelleniyor.",
        "An active field rule blocks this effect.",
      ],
      "response-pending": [
        "Önce bekleyen tepkiyi tamamlayın.",
        "Complete the pending response first.",
      ],
      "choice-required": [
        "Önce bekleyen kart seçimini tamamlayın.",
        "Complete the pending card choice first.",
      ],
      "series-required": [
        "Gerekli seriden bir kart sahada olmalı.",
        "Requires the specified series on the field.",
      ],
      "name-locked": ["Bu isim bu tur kilitlendi.", "This name is locked for this turn."],
      "hand-limit": [
        "Bitişte elinizi altı karta indirin.",
        "Reduce your hand to six cards at End.",
      ],
      "invalid-unit": [
        "Bu işlem eldeki bir kadro içindir.",
        "This action requires a unit in hand.",
      ],
      "attack-used": [
        "Saldırı pozisyonu veya kullanılmamış saldırı hakkı gerekli.",
        "Requires attack position and an unused attack right.",
      ],
    });
    return map[code]?.[lang === "tr" ? 0 : 1] || t("notLegal");
  }
  function scheduleAI() {
    clearTimeout(timer);
    if (screen !== "duel" || !state || state.result || actor() !== 1) return;
    timer = setTimeout(() => {
      const approved = legalActions(state, 1),
        action = chooseAction(publicView(state, 1), approved);
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
      button("?", () => show(t("help"), $("p", {}, t("rules"))), { "aria-label": t("help") }),
      button(t("menu"), () => {
        clearTimeout(timer);
        screen = "menu";
        selected = null;
        render();
      }),
    );
  }
  function render() {
    document.documentElement.lang = lang;
    document.body.dataset.theme = theme;
    document.body.dataset.motion = motion === "on" ? "full" : "reduced";
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
                render();
                scheduleAI();
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
          button(t("help"), () => show(t("help"), $("p", {}, t("rules")))),
          button(t("settings"), settings),
          $("a", { href: "/", target: "_top" }, `← ${t("back")}`),
        ),
      ),
    );
  }
  function settings() {
    show(t("settings"), [
      $(
        "label",
        {},
        t("motion"),
        " ",
        $(
          "select",
          {
            onchange: (e) => {
              motion = e.target.value;
              try {
                localStorage.setItem("tariklab.duel.motion", motion);
              } catch {
                /* Preference remains active for this visit. */
              }
              document.body.dataset.motion = motion === "on" ? "full" : "reduced";
            },
          },
          $("option", { value: "on", selected: motion === "on" }, t("motionOn")),
          $("option", { value: "reduced", selected: motion !== "on" }, t("motionOff")),
        ),
      ),
    ]);
  }
  function beginSetup() {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    setup = { seed, rng: seed, first: null };
    rps();
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
      return $(
        onClick ? "button" : "article",
        {
          type: onClick ? "button" : null,
          ...(onClick ? { onclick: onClick } : {}),
          class: `playing-card ${down ? "face-down" : ""} ${card?.position === "defense" ? "defense" : ""} ${uid === selected ? "selected" : ""}`,
          "data-kind": card?.kind || "",
          "data-card": uid,
          "aria-label": hidden ? t("hidden") : text(card.name),
          ...attrs,
        },
        hidden ? null : $("span", { class: "card-name" }, text(card.name)),
        $(
          "span",
          { class: "card-art", "aria-hidden": "true" },
          down
            ? "◈"
            : card.kind === "unit"
              ? $("img", { src: `/games/${theme}/assets/emblem.svg`, alt: "", loading: "lazy" })
              : card.kind === "spell"
                ? "✦"
                : "◇",
        ),
        hidden
          ? null
          : $(
              "span",
              { class: "card-stats" },
              card.kind === "unit"
                ? [`${card.attack} / ${card.defense}`, $("span", {}, `★${card.level}`)]
                : t(card.subtype) || t(card.kind),
            ),
      );
    }
  }
  function selectCard(uid) {
    selected = uid;
    render();
    if (innerWidth <= 760) inspect(uid);
  }
  function actionTitle(action, v = view()) {
    let title = t(action.type);
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
  function confirmAction(action) {
    show(t("confirm"), [
      $("p", {}, action.card ? cname(action.card) : t("choice")),
      $("p", {}, actionTitle(action)),
      $(
        "div",
        { class: "dialog-actions" },
        button(t("cancel"), close),
        button(
          t("confirm"),
          () => {
            close();
            command(action);
          },
          { class: "primary" },
        ),
      ),
    ]);
  }
  function inspectBody(uid, v = view()) {
    const card = v.cards[uid];
    if (!card) return [$("p", {}, t("hidden"))];
    const available = actions().filter((a) => a.card === uid),
      groups = [...new Set(available.map((a) => a.type))];
    const body = [
      cardEl({ ...card, face: card.name ? "up" : card.face }, uid, null),
      card.name
        ? $(
            "small",
            {},
            `${card.id} · ${[].concat(card.series || []).join(" / ")} · ${t(card.kind)}`,
          )
        : null,
      card.text ? $("p", { class: "effect-text" }, text(card.text)) : null,
      card.hint ? $("small", {}, text(card.hint)) : null,
      card.rulesNote ? $("small", {}, text(card.rulesNote)) : null,
      $("h3", {}, t("action")),
      $(
        "div",
        { class: "inspector-actions" },
        ...groups.map((type) =>
          button(t(type), () => selectAction(available.filter((a) => a.type === type)), {
            class: "primary",
          }),
        ),
      ),
    ];
    if (!available.length) body.push($("p", {}, t("noActions")));
    if (card.name && card.owner === 0)
      for (const type of card.kind === "unit"
        ? card.zone === "hand"
          ? ["summon", "set-unit", ...(card.effects.length ? ["activate"] : [])]
          : card.zone === "units"
            ? ["position", "attack", ...(card.effects.length ? ["activate"] : [])]
            : []
        : card.zone === "hand"
          ? ["activate", card.subtype === "field" ? "set-field" : "set-support"]
          : card.face === "down"
            ? ["activate"]
            : [])
        if (!groups.includes(type)) {
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
              class: `zone ${legal || (uid && selected && actions().some((a) => a.card === selected && a.target === uid)) ? "legal" : ""}`,
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
          t(isPlayer ? "you" : "opponent"),
          ` · ${t(isPlayer ? "hand" : "opponentHand")} ${p.handCount}`,
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
        $("span", { "data-pile": `${player}:deck` }, `${t("deck")} ${p.deckCount}`),
        ...["auxiliary", "grave", "banished", "field"].map((key) =>
          button(
            `${t(key)} ${key === "auxiliary" ? p.auxiliaryCount : key === "field" ? (p.field ? 1 : 0) : p[key].length}`,
            () => pile(player, key, v),
            { disabled: key === "auxiliary" && player === 1, "data-pile": `${player}:${key}` },
          ),
        ),
      ),
    );
  }
  function logLine(e, v) {
    const who = t(e.player === 0 ? "you" : "opponent");
    if (e.event === "battle")
      return `${who}: ${t("battle")} · ${cname(e.attacker, v)} · ${e.damage.join(" / ")} ${point}`;
    if (e.event === "draw") return `${who}: ${t("draw")} +${e.count}`;
    if (e.event === "move")
      return `${who}: ${cname(e.uid, v)} → ${t(e.to === "hand" ? "hand" : e.to === "units" ? "unit" : e.to)}`;
    if (e.event === "phase") return `${who}: ${t(e.phase)}`;
    if (e.event === "result") return t("finished");
    return `${who}: ${t(e.event === "start" ? "start" : e.event === "look" ? "select" : e.event === "reveal" ? "effect" : e.event === "token" ? "summon" : "effect")}`;
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
            { class: "phase-strip", "aria-label": t("phase") },
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
          phase ? button(t("phase"), () => confirmAction(phase), { class: "primary" }) : null,
          pass ? button(t("pass"), () => command(pass)) : null,
          approved.some((a) => a.type === "end-main")
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
            : [$("p", {}, t("select")), $("small", {}, t("deckNote"))],
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
        $("small", {}, text(card.hint)),
        card.rulesNote ? $("small", {}, text(card.rulesNote)) : null,
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
        (!archiveLevel || String(c.level) === archiveLevel),
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
