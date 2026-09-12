import { AI_PROFILES, AI_PROFILE_IDS } from "./ai.js";
import { CAMPAIGN_STYLES, NEIGHBORHOODS, identityLabel } from "./identities.js";
import { electionShare, formatAnalysis, opGraphSvg } from "./analyzer.js";
import { mostUsedAi } from "./prefs.js";

export function applyDisplay(settings, theme) {
  const root = document.documentElement;
  root.style.setProperty("--ui-scale", String((settings.uiScale || 100) / 100));
  root.style.setProperty(
    "--card-scale",
    settings.cardSize === "small" ? "0.86" : settings.cardSize === "large" ? "1.14" : "1",
  );
  root.style.setProperty("--gap-scale", settings.tableDensity === "compact" ? "0.72" : "1");
  document.body.dataset.cardSize = settings.cardSize || "normal";
  document.body.dataset.density = settings.tableDensity || "normal";
  document.body.dataset.motion = settings.motion === "on" ? "full" : "reduced";
  const identity = theme === "veto-h" ? settings.campaignStyle : settings.neighborhood;
  document.body.dataset.identity = identity || "";
  if (theme === "gett-oh") {
    const hood = NEIGHBORHOODS[settings.neighborhood];
    if (hood?.accent) root.style.setProperty("--hood-accent", hood.accent);
  }
}

export function settingsBody($, t, settings, set) {
  const scaleBtn = (n) =>
    $(
      "button",
      {
        type: "button",
        "aria-pressed": settings.uiScale === n,
        onclick: () => set({ uiScale: n }),
      },
      `${n}%`,
    );
  const sizeBtn = (id, label) =>
    $(
      "button",
      {
        type: "button",
        "aria-pressed": settings.cardSize === id,
        onclick: () => set({ cardSize: id }),
      },
      label,
    );
  const densBtn = (id, label) =>
    $(
      "button",
      {
        type: "button",
        "aria-pressed": settings.tableDensity === id,
        onclick: () => set({ tableDensity: id }),
      },
      label,
    );
  return [
    $(
      "div",
      { class: "settings-group" },
      $("h3", {}, t("display")),
      $("div", {}, t("uiScale")),
      $("div", { class: "scale-row" }, [80, 90, 100, 110, 125].map(scaleBtn)),
      $("div", {}, t("cardSize")),
      $(
        "div",
        { class: "chip-row" },
        sizeBtn("small", t("small")),
        sizeBtn("normal", t("normal")),
        sizeBtn("large", t("large")),
      ),
      $("div", {}, t("tableDensity")),
      $(
        "div",
        { class: "chip-row" },
        densBtn("compact", t("compact")),
        densBtn("normal", t("normal")),
      ),
    ),
    $(
      "div",
      { class: "settings-group" },
      $("h3", {}, t("gameplay")),
      $(
        "label",
        {},
        t("motion"),
        " ",
        $(
          "select",
          {
            onchange: (e) => set({ motion: e.target.value }),
          },
          $("option", { value: "on", selected: settings.motion === "on" }, t("motionOn")),
          $("option", { value: "reduced", selected: settings.motion !== "on" }, t("motionOff")),
        ),
      ),
    ),
    $(
      "div",
      { class: "settings-group" },
      $("h3", {}, t("controls")),
      $("p", { class: "shortcut-hint" }, t("shortcutHint")),
      typeof document.documentElement.requestFullscreen === "function"
        ? $(
            "button",
            {
              type: "button",
              onclick: () => {
                if (document.fullscreenElement) document.exitFullscreen?.();
                else document.documentElement.requestFullscreen?.();
              },
            },
            t("fullscreen"),
          )
        : null,
    ),
  ];
}

function chip($, id, selected, title, blurb, onPick) {
  return $(
    "button",
    {
      type: "button",
      class: "choice-chip",
      "aria-pressed": id === selected,
      onclick: onPick,
    },
    $("strong", {}, title),
    $("small", {}, blurb),
  );
}

export function identityBody($, t, lang, theme, settings, set, onContinue) {
  const profileChips = AI_PROFILE_IDS.map((id) => {
    const copy = AI_PROFILES[id][lang === "en" ? "en" : "tr"];
    return chip($, id, settings.aiProfile, copy.name, copy.blurb, () => set({ aiProfile: id }));
  });
  const table = theme === "veto-h" ? CAMPAIGN_STYLES : NEIGHBORHOODS;
  const current = theme === "veto-h" ? settings.campaignStyle : settings.neighborhood;
  const identityChips = Object.keys(table).map((id) => {
    const copy = identityLabel(theme === "veto-h" ? "campaign" : "hood", id, lang);
    return chip($, id, current, copy.name, copy.blurb, () =>
      set(theme === "veto-h" ? { campaignStyle: id } : { neighborhood: id }),
    );
  });
  const bias =
    theme === "gett-oh" ? NEIGHBORHOODS[settings.neighborhood]?.aiBias : null;
  const biasNote =
    bias && AI_PROFILES[bias]
      ? lang === "tr"
        ? `Bu semt ${AI_PROFILES[bias].tr.name} tarza yatkın; rakip tarzını sen seçersin.`
        : `This neighborhood leans ${AI_PROFILES[bias].en.name}; you still pick the opponent.`
      : theme === "veto-h"
        ? lang === "tr"
          ? "Yaklaşım desteyi değiştirmez; çerçeve ve etiket olarak kalır."
          : "Approach does not change the deck; it frames the campaign."
        : "";
  return [
    $("h3", {}, t("aiStyle")),
    $("div", { class: "identity-grid" }, profileChips),
    $("h3", {}, theme === "veto-h" ? t("campaignApproach") : t("neighborhood")),
    $("div", { class: "identity-grid" }, identityChips),
    biasNote ? $("p", { class: "shortcut-hint" }, biasNote) : null,
    $(
      "div",
      { class: "dialog-actions" },
      $(
        "button",
        { type: "button", class: "primary", onclick: onContinue },
        t("continueMatch"),
      ),
    ),
  ];
}

export function relatedBlock($, t, lang, rows, onOpen) {
  if (!rows?.length) return [];
  return [
    $("h3", {}, t("related")),
    $(
      "div",
      { class: "related-row" },
      ...rows.map((row) =>
        $(
          "button",
          { type: "button", onclick: () => onOpen(row.card) },
          row.card?.name
            ? row.card.name[lang] || row.card.name.tr || row.card.id
            : row.id,
        ),
      ),
    ),
  ];
}

export function postMatchBody($, t, lang, theme, analysis, catalog, on) {
  const fmt = formatAnalysis(analysis, catalog, lang, theme);
  const share = theme === "veto-h" ? electionShare(analysis) : null;
  const title =
    analysis.winner === 0 ? t("win") : analysis.winner === 1 ? t("lose") : t("tie");
  const starLabel = theme === "veto-h" ? t("matchStar") : t("nightMove");
  const turnLabel = theme === "veto-h" ? t("turningPoint") : t("tableTurn");
  const workLabel = theme === "gett-oh" ? t("hardestWorker") : t("matchStar");
  const graph = document.createElement("div");
  graph.innerHTML = opGraphSvg(analysis.opByTurn);
  return [
    $("div", { class: "post-match" },
      $("h3", {}, theme === "veto-h" ? t("electionResult") : t("postMatch")),
      $("p", {}, title),
      share
        ? $(
            "div",
            { class: "share" },
            $("span", {}, `${t("you")}: %${share.you.toFixed(1)}`),
            $("span", {}, `${t("opponent")}: %${share.opp.toFixed(1)}`),
          )
        : null,
      $("p", {}, `${t("turn")}: ${analysis.turns}`),
      $("p", {}, `${turnLabel}: ${fmt.turning}`),
      $("p", {}, `${starLabel}: ${fmt.star}`),
      theme === "gett-oh" ? $("p", {}, `${workLabel}: ${fmt.damage}`) : null,
      $("p", {}, `${t("aiStyle")}: ${AI_PROFILES[analysis.aiProfile || "controlled"]?.[lang === "en" ? "en" : "tr"]?.name || analysis.aiProfile}`),
      graph.firstChild,
      fmt.wasted?.length
        ? $("p", {}, `${t("wasted")}: ${fmt.wasted.join(", ")}`)
        : null,
      $(
        "div",
        { class: "dialog-actions" },
        $("button", { type: "button", onclick: on.analysis }, t("analysis")),
        $("button", { type: "button", onclick: on.history }, t("actionHistory")),
        $("button", { type: "button", class: "primary", onclick: on.replay }, t("replay")),
        $("button", { type: "button", onclick: on.menu }, t("menu")),
      ),
    ),
  ];
}

export function analysisBody($, t, lang, analysis, catalog) {
  const fmt = formatAnalysis(analysis, catalog, lang);
  const rows = (analysis.ranked || []).slice(0, 8).map((row) => {
    const name = catalog?.[row.id]?.name;
    const label = name ? name[lang] || name.tr || row.id : row.id;
    return $("li", {}, `${label} · ${row.value}`);
  });
  return [
    $("p", {}, `${t("turningPoint")}: ${fmt.turning}`),
    $("p", {}, `${t("matchStar")}: ${fmt.star}`),
    $("ol", {}, rows),
  ];
}

export function historyBody($, t, lang, theme, history, catalog) {
  const life = history?.lifetime || {};
  const fileTitle = theme === "veto-h" ? t("campaignFile") : t("nightFile");
  const fav = life.favorite && catalog?.[life.favorite];
  const favName = fav?.name ? fav.name[lang] || fav.name.tr : life.favorite || "—";
  const ai = mostUsedAi(history);
  const aiName = ai ? AI_PROFILES[ai]?.[lang === "en" ? "en" : "tr"]?.name : "—";
  const matches = (history?.matches || []).slice(0, 12).map((m) =>
    $(
      "li",
      {},
      `${t("turn")} ${m.turns} · ${m.winner === 0 ? t("win") : m.winner === 1 ? t("lose") : t("tie")} · ${AI_PROFILES[m.aiProfile]?.[lang === "en" ? "en" : "tr"]?.name || ""}`,
    ),
  );
  return [
    $("h3", {}, fileTitle),
    $("p", {}, `${life.campaigns || 0} ${t("campaigns")} · ${life.wins || 0} ${t("wins")} · ${life.losses || 0} ${t("losses")}`),
    $("p", {}, `${t("longest")}: ${life.longest || "—"} · ${t("shortest")}: ${life.shortest || "—"}`),
    $("p", {}, `${t("favorite")}: ${favName}`),
    $("p", {}, `${t("mostAi")}: ${aiName}`),
    matches.length ? $("ul", { class: "history-list" }, matches) : $("p", {}, t("noHistory")),
  ];
}

export function actionLogBody($, t, events, catalog, lang) {
  const grouped = [];
  for (const e of events || []) {
    if (!grouped.length || grouped.at(-1).turn !== e.turn) grouped.push({ turn: e.turn, rows: [] });
    grouped.at(-1).rows.push(e);
  }
  if (!grouped.length) return [$("p", {}, t("noHistory"))];
  return grouped.map((g) =>
    $(
      "section",
      {},
      $("h3", {}, `${t("turn")} ${g.turn}`),
      $(
        "ol",
        {},
        ...g.rows.map((e) => {
          const who = e.actor === 0 ? t("you") : t("opponent");
          const name = e.card && catalog?.[e.card]?.name;
          const label = name ? name[lang] || name.tr : e.card || e.type;
          const delta = e.delta ? ` · ${e.delta[0]}/${e.delta[1]}` : "";
          return $("li", {}, `${who}: ${t(e.type) || e.type} · ${label}${delta}`);
        }),
      ),
    ),
  );
}
