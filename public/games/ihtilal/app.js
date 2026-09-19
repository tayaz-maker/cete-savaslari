import { ARCHETYPE_IDS, ARCHETYPES, DESKS } from "./decks.js";
import { applyAction, canPlay, cardOf, createMatch, legalActions, publicView } from "./engine.js";
import { AI_PROFILES, chooseAction } from "./ai.js";
import { COPY, HELP, TUTORIAL, fx, labelDesk } from "./copy.js";
import { clearSlot, loadSlot, saveSlot, slotSummary } from "./save.js";
import { endReport } from "./report.js";
import { mulberry } from "./rng.js";

const root = document.querySelector("#app");
const storage = {
  getItem: (k) => localStorage.getItem(k),
  setItem: (k, v) => localStorage.setItem(k, v),
  removeItem: (k) => localStorage.removeItem(k),
};

const renderable = (children) =>
  [children]
    .flat(Infinity)
    .filter((child) => child instanceof Node || typeof child === "string" || typeof child === "number")
    .map((child) => (child instanceof Node ? child : document.createTextNode(String(child))));

function $(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") el.className = value;
    else if (key === "html") el.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2), value);
    else if (key.startsWith("aria-")) el.setAttribute(key, String(value));
    else if (value === false || value == null) continue;
    else if (key.startsWith("data-")) el.setAttribute(key, String(value));
    else if (key === "disabled" || key === "selected") {
      if (value) el.setAttribute(key, "");
    } else el.setAttribute(key, value === true ? "" : String(value));
  }
  el.append(...renderable(children));
  return el;
}

function readLang() {
  try {
    return localStorage.getItem("tariklab.language") === "en" ? "en" : "tr";
  } catch {
    return "tr";
  }
}

let lang = readLang();
let screen = "menu";
let state = null;
let selected = null;
let notice = "";
let helpOn = false;
let coach = -1;
let setup = {
  you: "kalemci",
  opp: "hesapci",
  profile: "adaptive",
  seed: 1923,
  tutorial: false,
};
let busy = false;
let activeSlot = 1;
let aiTimer = null;
let aiGeneration = 0;
let modalReturnKey = null;
let renderedScreen = null;

const t = (key) => COPY[lang][key] || COPY.tr[key] || key;
const titleOf = (card) => (card?.title && (card.title[lang] || card.title.tr)) || "";
const flavorOf = (card) => (card?.flavor && (card.flavor[lang] || card.flavor.tr)) || "";

function stopAi() {
  aiGeneration += 1;
  if (aiTimer != null) clearTimeout(aiTimer);
  aiTimer = null;
  busy = false;
}

function goToMenu() {
  stopAi();
  screen = "menu";
  render();
}

function setLang() {
  lang = lang === "tr" ? "en" : "tr";
  notice = "";
  try {
    localStorage.setItem("tariklab.language", lang);
  } catch {
    /* ignore */
  }
  render();
}

window.addEventListener("storage", (event) => {
  if (event.key !== "tariklab.language") return;
  lang = readLang();
  notice = "";
  render();
});

const modalControls = (dialog) => [...dialog.querySelectorAll("button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex='0']")];
const activeDialog = () => [...root.querySelectorAll('[role="dialog"]')].at(-1);

window.addEventListener("keydown", (event) => {
  const dialog = activeDialog();
  if (!dialog) return;
  if (event.key === "Escape") {
    event.preventDefault();
    if (dialog.getAttribute("data-modal") === "help") helpOn = false;
    else coach = -1;
    render();
  } else if (event.key === "Tab") {
    const controls = modalControls(dialog);
    const first = controls[0] || dialog;
    const last = controls.at(-1) || dialog;
    const focused = document.activeElement;
    if (!controls.includes(focused) || (event.shiftKey ? focused === first : focused === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }
});

function saveControls() {
  return $("div", { class: "row" },
    $("label", {}, t("slotN"), $("select", {
      onchange: (event) => { activeSlot = Number(event.target.value); render(); },
    }, [1, 2, 3].map((n) => $("option", { value: n, selected: activeSlot === n }, `${t("slotN")} ${n}`)))),
    $("button", { class: "btn ghost", type: "button", onclick: () => saveCurrent(activeSlot) }, `${t("save")} ${activeSlot}`));
}

function topbar(extra) {
  return $(
    "header",
    { class: "topbar" },
    $("a", { href: "/" }, t("back")),
    $("span", { class: "kicker display" }, t("title")),
    $(
      "div",
      { class: "row" },
      extra || null,
      $("button", { class: "link", type: "button", onclick: setLang }, t("lang")),
    ),
  );
}

function menu() {
  const slots = [1, 2, 3].map((n) => ({ n, summary: slotSummary(storage, n) }));
  return $(
    "div",
    { class: "shell" },
    topbar(),
    $(
      "main",
      { class: "menu" },
      $("p", { class: "kicker" }, t("kicker")),
      $("h1", { class: "display" }, t("title")),
      $("p", { class: "tagline display" }, t("tagline")),
      $("p", { class: "pitch" }, lang === "en"
        ? "Two pens on a fictional republic's Extraordinary File Board. Files land on desks. Desks lock. A ruling is written — or the board dissolves."
        : "Kurmaca bir cumhuriyetin Olağanüstü Dosya Kurulu'nda iki kalem. Dosyalar masaya iner. Masalar kilitlenir. Hüküm yazılır — ya da masa dağılır."),
      $("div", { class: "stamp-mark display" }, lang === "en" ? "seal" : "mühür"),
      $(
        "div",
        { class: "row" },
        $("button", { class: "btn primary", type: "button", onclick: () => { screen = "setup"; setup.tutorial = false; render(); } }, t("newGame")),
        $("button", { class: "btn", type: "button", onclick: () => { screen = "setup"; setup.tutorial = true; render(); } }, t("tutorial")),
        $("button", { class: "btn ghost", type: "button", "data-focus-key": "help", onclick: () => { helpOn = true; render(); } }, t("how")),
      ),
      $("h2", { class: "display" }, t("slots")),
      notice ? $("p", { role: "status" }, notice) : null,
      $(
        "div",
        { class: "slots" },
        slots.map((slot) =>
          $(
            "div",
            { class: "slot" },
            $("span", {}, slot.summary
              ? `${t("slotN")} ${slot.n} · ${t("turn")} ${slot.summary.turn} · ${t("isi")} ${slot.summary.heat}`
              : `${t("slotN")} ${slot.n} · ${t("empty")}`),
            $(
              "div",
              { class: "row" },
              slot.summary
                ? $("button", { class: "btn", type: "button", onclick: () => openSlot(slot.n) }, t("load"))
                : null,
              slot.summary
                ? $("button", { class: "btn ghost", type: "button", onclick: () => {
                    if (!window.confirm(`${t("deleteConfirm")} ${slot.n}?`)) return;
                    const result = clearSlot(storage, slot.n);
                    notice = result.ok ? t("deleted") : t("saveFail");
                    render();
                  } }, t("deleteSave"))
                : null,
            ),
          ),
        ),
      ),
    ),
    helpOn ? helpSheet() : null,
  );
}

function archButton(id, current, onPick, owner) {
  const a = ARCHETYPES[id];
  return $(
    "button",
    { class: `arch${current === id ? " is-on" : ""}`, type: "button", "aria-pressed": current === id, "data-focus-key": `arch-${owner}-${id}`, onclick: () => onPick(id) },
    $("b", { class: "display" }, a.title[lang] || a.title.tr),
    $("small", {}, a.pitch[lang] || a.pitch.tr),
    $("small", {}, a.weakness[lang] || a.weakness.tr),
  );
}

function setupScreen() {
  return $(
    "div",
    { class: "shell" },
    topbar($("button", { class: "link", type: "button", onclick: goToMenu }, t("menu"))),
    $(
      "main",
      { class: "menu" },
      $("p", { class: "kicker" }, t("kicker")),
      $("h1", { class: "display" }, t("pickYou")),
      $("div", { class: "arch-grid" }, ARCHETYPE_IDS.map((id) => archButton(id, setup.you, (v) => { setup.you = v; render(); }, "you"))),
      $("h2", { class: "display" }, t("pickOpp")),
      $("div", { class: "arch-grid" }, ARCHETYPE_IDS.map((id) => archButton(id, setup.opp, (v) => { setup.opp = v; render(); }, "opp"))),
      $(
        "label",
        {},
        t("profile"),
        $(
          "select",
          { onchange: (e) => { setup.profile = e.target.value; } },
          AI_PROFILES.map((p) => $("option", { value: p, selected: p === setup.profile }, COPY[lang].profiles[p])),
        ),
      ),
      $(
        "label",
        {},
        t("seed"),
        $("input", { type: "number", value: String(setup.seed), min: "1", onchange: (e) => { setup.seed = Number(e.target.value) || 1923; } }),
      ),
      $("button", { class: "btn primary", type: "button", onclick: startMatch }, t("start")),
    ),
  );
}

function startMatch() {
  stopAi();
  state = createMatch({
    seed: setup.seed,
    playerArchetype: setup.you,
    oppArchetype: setup.opp,
    first: 0,
    aiProfile: setup.profile,
  });
  selected = null;
  screen = "play";
  coach = setup.tutorial ? 0 : -1;
  notice = "";
  render();
  pumpAi();
}

function openSlot(n) {
  const loaded = loadSlot(storage, n);
  if (!loaded.ok) {
    notice = loaded.error === "foreign-save" ? t("foreign") : t("corrupt");
    render();
    return;
  }
  stopAi();
  state = loaded.state;
  activeSlot = n;
  selected = null;
  notice = "";
  screen = state.result ? "report" : "play";
  render();
  pumpAi();
}

function saveCurrent(n) {
  if (!state) return;
  const result = saveSlot(storage, n, state);
  notice = result.ok ? t("saved") : t("saveFail");
  render();
}

function cardWhy(cardId, desk) {
  if (!state) return "";
  const actor = state.phase === "karsi" ? 0 : state.turnPlayer;
  const gate = canPlay(state, actor, cardId, desk);
  const key = {
    ink: "whyInk",
    seal: "whySeal",
    phase: "whyPhase",
    "wrong-desk": "whyDesk",
    desk: "whyDesk",
    "repeat-desk": "whyRepeat",
    once: "whyOnce",
    chain: "whyChain",
    "counter-window": "whyPhase",
    plays: "whyPhase",
    "not-in-hand": "whyPhase",
  }[gate.why];
  return key ? t(key) : "";
}

function playFile(cardId, desk) {
  if (busy || !state) return;
  const actor = state.phase === "karsi" ? 1 - state.turnPlayer : state.turnPlayer;
  if (actor !== 0) return;
  const type = state.phase === "karsi" ? "counter" : "play";
  const result = applyAction(state, type === "counter" ? { type, cardId, desk } : { type, cardId, desk });
  if (!result.ok) {
    notice = cardWhy(cardId, desk) || t("whyPhase");
    render();
    return;
  }
  selected = null;
  notice = "";
  afterHuman();
}

function afterHuman() {
  if (state.result) {
    screen = "report";
    render();
    return;
  }
  render();
  pumpAi();
}

function pumpAi() {
  if (screen !== "play" || !state || state.result || busy) return;
  const match = state;
  const generation = aiGeneration;
  const aiActs = () => {
    if (state.phase === "karsi") return 1 - state.turnPlayer === 1;
    return state.turnPlayer === 1 && state.phase === "kalem";
  };
  if (!aiActs()) return;
  busy = true;
  const step = () => {
    // A queued callback belongs to this match and must not touch a new/load session.
    if (generation !== aiGeneration || state !== match || screen !== "play") return;
    aiTimer = null;
    if (!state || state.result || !aiActs()) {
      busy = false;
      if (state?.result) screen = "report";
      render();
      return;
    }
    const actor = state.phase === "karsi" ? 1 - state.turnPlayer : state.turnPlayer;
    const view = publicView(state, actor);
    const actions = legalActions(state, actor);
    const rng = mulberry((state.meta.seed + state.turn * 997 + state.log.length * 13 + actor) >>> 0);
    const pick = chooseAction(view, actions, state.aiProfile || setup.profile, rng) || actions[actions.length - 1];
    applyAction(state, pick);
    render();
    if (aiActs() && !state.result) {
      const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      aiTimer = setTimeout(step, reduce ? 0 : 220);
    } else {
      busy = false;
      if (state.result) screen = "report";
      render();
    }
  };
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  aiTimer = setTimeout(step, reduce ? 0 : 180);
}

function logLine(row) {
  const card = row.c ? cardOf(row.c) : null;
  const name = card ? titleOf(card) : "";
  const who = row.a === 0 ? t("you") : t("opp");
  const desk = row.d ? labelDesk(row.d, lang !== "en") : "";
  if (row.k === "play") return `${who}: ${name}${desk ? " → " + desk : ""}`;
  if (row.k === "counter") return `${who}: ${name} (${t("typeKarsi")})`;
  if (row.k === "lock") return `${labelDesk(row.d, lang !== "en")} · ${t("locked")}`;
  if (row.k === "artci") return `${t("archive")}: ${name}`;
  if (row.k === "end") return t("phaseEnd");
  if (row.k === "chain") return lang === "en" ? "A chain closed." : "Bir zincir kapandı.";
  if (row.k === "family") return lang === "en" ? "Family claimed" : "Aile bağlandı";
  if (row.k === "lock-tenure") return `${who}: ${t("tenure")}`;
  if (row.k === "steal-lock") return `${who}: ${desk} · ${t("stolen")}`;
  if (row.k === "unlock") return `${who}: ${desk} · ${t("unlocked")}`;
  if (row.k === "repeat-heat") return `${who}: ${desk} · ${t("repeatHeat")}`;
  if (row.k === "reshuffle") return `${who}: ${t("reshuffled")}`;
  if (row.k === "artci-overflow") return `${who}: ${name} · ${t("archiveOverflow")}`;
  return `${who}: ${t("opened")}`;
}

function fileCard(id, on) {
  const card = cardOf(id);
  if (!card) return null;
  const stamp = { acik: "A", artci: "R", karsi: "K", heyet: "H", muhurluk: "M" }[card.type] || "A";
  return $(
    "button",
    {
      class: `file-card${on ? " is-on" : ""}`,
      type: "button",
      "aria-label": card.a11y?.[lang] || titleOf(card),
      "aria-pressed": on,
      "data-focus-key": `card-${id}`,
      onclick: () => { selected = id; render(); },
    },
    $("span", { class: "stamp display" }, stamp),
    $("b", {}, titleOf(card)),
    $("div", { class: "fx" }, fx(card, lang)),
    $("small", {}, `${t("cost")} ${card.cost} · ${t("muhur")} ${card.seal}`),
  );
}

function playScreen() {
  const view = publicView(state, 0);
  const selectedCard = selected ? cardOf(selected) : null;
  const humanKalem = view.phase === "kalem" && view.turnPlayer === 0;
  const humanKarsi = view.phase === "karsi" && view.turnPlayer === 1;
  const desksFor = selectedCard
    ? selectedCard.desk === "any" ? DESKS : [selectedCard.desk]
    : [];
  const banner = view.phase === "karsi" && humanKarsi
    ? t("counterWindow")
    : view.turnPlayer === 0
      ? t("yourTurn")
      : t("oppTurn");
  return $(
    "div",
    { class: "shell" },
    topbar(
      $(
        "div",
        { class: "row" },
        $("button", { class: "link", type: "button", "data-focus-key": "help", onclick: () => { helpOn = true; render(); } }, t("how")),
        $("button", { class: "link", type: "button", onclick: goToMenu }, t("menu")),
      ),
    ),
    $(
      "div",
      { class: "play" },
      $(
        "div",
        { class: "meters" },
        meter(t("hukum"), `${t("you")} ${view.me.hukum}/10 · ${t("opp")} ${view.opp.hukum}/10`),
        meter(t("murekkep"), `${view.me.murekkep}`),
        meter(t("muhur"), `${view.me.muhur} / ${view.opp.muhur}`),
        meter(`${t("turn")} ${view.turn}`, view.phase === "karsi" ? t("phaseKarsi") : t("phaseKalem")),
        $("div", { class: "heat-label" }, `${t("isi")} ${view.heat}/100 · ${t("heatHint")}`),
        $("div", { class: "heatbar", role: "meter", "aria-label": t("isi"), "aria-valuenow": view.heat, "aria-valuemin": 0, "aria-valuemax": 100 }, $("i", { style: `width:${view.heat}%` })),
      ),
      $(
        "div",
        { class: "banner", role: "status" },
        $("span", {}, banner),
        notice ? $("span", { class: "why" }, notice) : null,
      ),
      $(
        "div",
        { class: "desks" },
        DESKS.map((desk) => {
          const d = view.desks[desk];
          const target = selectedCard && desksFor.includes(desk);
          return $(
            "button",
            {
              class: `desk${d.lock != null ? " is-locked" : ""}${target ? " is-target" : ""}`,
              type: "button",
              disabled: !target || busy || !(humanKalem || (humanKarsi && selectedCard?.type === "karsi")),
              onclick: () => playFile(selected, desk),
              "aria-label": `${labelDesk(desk, lang !== "en")} ${d.presence[0]} ${d.presence[1]}`,
            },
            $("div", { class: "name display" }, labelDesk(desk, lang !== "en")),
            $("div", { class: "pips" }, `${d.presence[0]} · ${d.presence[1]}`),
            d.lock != null ? $("div", {}, `${t("locked")} · ${d.lock === 0 ? t("you") : t("opp")}`) : null,
          );
        }),
      ),
      $("div", { class: "hand", "aria-label": t("hand") }, view.me.hand.map((id) => fileCard(id, selected === id))),
      $(
        "aside",
        { class: "dock" },
        $(
          "div",
          { class: "inspector" },
          $("div", { class: "kicker" }, t("inspector")),
          selectedCard
            ? [
                $("h3", { class: "display" }, titleOf(selectedCard)),
                $("p", {}, flavorOf(selectedCard)),
                $("p", { class: "fx" }, fx(selectedCard, lang)),
                $("p", {}, `${t("cost")} ${selectedCard.cost} · ${t("seal")} ${selectedCard.seal}${selectedCard.delay ? ` · ${t("delay")} ${selectedCard.delay}` : ""}`),
                whyLine(selectedCard),
              ]
            : $("p", { class: "pitch" }, lang === "en" ? "Pick a file in your hand." : "Elinden bir dosya seç."),
        ),
        $(
          "div",
          { class: "row" },
          humanKarsi ? $("button", { class: "btn", type: "button", disabled: busy, onclick: () => { applyAction(state, { type: "skip-karsi" }); afterHuman(); } }, t("skipCounter")) : null,
          humanKalem ? $("button", { class: "btn primary", type: "button", disabled: busy, onclick: () => { applyAction(state, { type: "end-kalem" }); afterHuman(); } }, t("endKalem")) : null,
          saveControls(),
        ),
        $(
          "div",
          { class: "ledger" },
          $("div", { class: "kicker" }, t("log")),
          $("ul", {}, view.log.map((row) => $("li", {}, logLine(row)))),
        ),
        $("p", {}, `${t("opp")}: ${ARCHETYPES[view.opp.archetype]?.title[lang] || ""} · ${t("hukum")} ${view.opp.hukum} · ${t("hand")} ${view.opp.hand}`),
      ),
    ),
    helpOn ? helpSheet() : null,
    coach >= 0 ? coachSheet() : null,
  );
}

function meter(label, value) {
  return $("div", { class: "meter" }, $("span", {}, label), $("b", { class: "display" }, value));
}

function whyLine(card) {
  const desk = card.desk === "any" ? DESKS[0] : card.desk;
  const actor = state.phase === "karsi" ? 0 : state.turnPlayer;
  const gate = canPlay(state, actor, card.id, desk);
  if (gate.ok) return $("p", {}, t("play"));
  const key = {
    ink: "whyInk",
    seal: "whySeal",
    phase: "whyPhase",
    "wrong-desk": "whyDesk",
    desk: "whyDesk",
    "repeat-desk": "whyRepeat",
    once: "whyOnce",
    chain: "whyChain",
    "counter-window": "whyPhase",
    plays: "whyPhase",
    "not-in-hand": "whyPhase",
  }[gate.why];
  return $("p", { class: "why" }, key ? t(key) : "");
}

function helpSheet() {
  return $(
    "div",
    { class: "overlay", onclick: (e) => { if (e.target.classList.contains("overlay")) { helpOn = false; render(); } } },
    $(
      "div",
      { class: "sheet", role: "dialog", "aria-modal": true, "aria-label": t("helpTitle"), "data-modal": "help", tabindex: "-1" },
      $("h2", { class: "display", tabindex: "-1", "data-modal-primary": true }, t("helpTitle")),
      HELP[lang].map((s) => [$("h3", {}, s.title), $("p", {}, s.body)]),
      $("button", { class: "btn primary", type: "button", onclick: () => { helpOn = false; render(); } }, t("close")),
    ),
  );
}

function coachSheet() {
  const steps = TUTORIAL[lang];
  const step = steps[coach];
  if (!step) return null;
  return $(
    "div",
    { class: "overlay" },
    $(
      "div",
      { class: "sheet", role: "dialog", "aria-modal": true, "aria-label": step.title, "data-modal": "coach", tabindex: "-1" },
      $("p", { class: "kicker" }, `${coach + 1} / ${steps.length}`),
      $("h2", { class: "display" }, step.title),
      $("p", {}, step.body),
      $(
        "div",
        { class: "row" },
        $("button", { class: "btn ghost", type: "button", onclick: () => { coach = -1; render(); } }, t("skip")),
        $("button", {
          class: "btn primary",
          type: "button",
          "data-modal-primary": true,
          onclick: () => {
            coach += 1;
            if (coach >= steps.length) coach = -1;
            render();
          },
        }, coach + 1 >= steps.length ? t("gotIt") : t("next")),
      ),
    ),
  );
}

function reportScreen() {
  const report = endReport(state, lang);
  return $(
    "div",
    { class: "shell" },
    topbar(),
    $(
      "main",
      { class: "report" },
      $("p", { class: "kicker" }, t("report")),
      $("h2", { class: "display" }, report.headline),
      $("p", {}, report.reason),
      $("p", {}, `${report.archetypes[0]} · ${report.archetypes[1]}`),
      $("p", {}, `${t("hukum")} ${report.meters.hukum.join(" / ")} · ${t("muhur")} ${report.meters.muhur.join(" / ")} · ${t("isi")} ${report.meters.heat} · ${t("turn")} ${report.meters.turn}`),
      $("p", {}, report.turning),
      $("div", { class: "locks" }, report.locks.map((row) => $("div", { class: "lock-row" }, `${row.name}: ${row.presence[0]} / ${row.presence[1]}${row.lock != null ? " · " + t("locked") : ""}`))),
      report.repeated.length
        ? $("p", {}, lang === "en"
          ? `Repeated files: ${report.repeated.map((r) => r.title).join(", ")}`
          : `Tekrar eden dosyalar: ${report.repeated.map((r) => r.title).join(", ")}`)
        : null,
      $("p", {}, report.alt),
      notice ? $("p", { role: "status" }, notice) : null,
      $(
        "div",
        { class: "row" },
        $("button", { class: "btn primary", type: "button", onclick: () => { screen = "setup"; render(); } }, t("again")),
        $("button", { class: "btn", type: "button", onclick: goToMenu }, t("toMenu")),
        saveControls(),
      ),
    ),
  );
}

function render() {
  const previousDialog = activeDialog();
  const focused = document.activeElement;
  const focusedIndex = previousDialog ? modalControls(previousDialog).indexOf(focused) : -1;
  document.documentElement.lang = lang;
  const view = screen === "menu" ? menu() : screen === "setup" ? setupScreen() : screen === "report" ? reportScreen() : playScreen();
  root.replaceChildren(view);
  const dialog = activeDialog();
  if (dialog) {
    if (!previousDialog) modalReturnKey = focused?.getAttribute("data-focus-key") || null;
    // Only the active overlay is interactive, including when tutorial/help overlap.
    for (const child of view.children) child.inert = child !== dialog.parentElement;
    const sameDialog = previousDialog?.getAttribute("data-modal") === dialog.getAttribute("data-modal");
    const target = (sameDialog && modalControls(dialog)[focusedIndex]) || dialog.querySelector("[data-modal-primary]") || modalControls(dialog)[0] || dialog;
    target.focus({ preventScroll: true });
  } else if (previousDialog) {
    const target = (modalReturnKey && root.querySelector(`[data-focus-key="${modalReturnKey}"]`)) || root.querySelector(".file-card") || root.querySelector("button");
    target?.focus({ preventScroll: true });
    modalReturnKey = null;
  } else if (screen === renderedScreen) {
    const focusKey = focused?.getAttribute("data-focus-key");
    if (focusKey) root.querySelector(`[data-focus-key="${focusKey}"]`)?.focus({ preventScroll: true });
  }
  if (screen !== renderedScreen) {
    window.scrollTo(0, 0);
    renderedScreen = screen;
  }
}

render();
