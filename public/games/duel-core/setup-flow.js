/**
 * Three-step pre-match setup: deck, opponent, summary.
 *
 * The wizard owns one container element and re-renders into it directly. It
 * never closes and reopens the dialog, which is what used to throw away scroll
 * position and make a chip tap look like it did nothing.
 */
import { AI_PROFILES, AI_PROFILE_IDS } from "./ai.js";
import { deckBreakdown, deckCopy, findPreset, presetCardIds } from "./decks.js";

export const SETUP_STEPS = 3;

const tr = (lang) => lang !== "en";

/** Deck heading: these presets are the 40-card deck, not a cosmetic label. */
export function deckHeading(theme, lang) {
  if (theme === "veto-h") return tr(lang) ? "Kampanya Destesi" : "Campaign Deck";
  return tr(lang) ? "Racon Destesi" : "Racon Deck";
}

export function deckIntro(theme, lang) {
  if (tr(lang))
    return theme === "veto-h"
      ? "Burada oynayacağın 40 kartlık desteyi seçiyorsun. Her seçenek farklı bir kart listesidir."
      : "Burada oynayacağın 40 kartlık desteyi seçiyorsun. Her semt farklı bir kart listesidir.";
  return "You are choosing the 40-card deck you will play. Each option is a different card list.";
}

function stepLabels(lang) {
  return tr(lang)
    ? ["Deste Seç", "Rakip Tarzı", "Özet"]
    : ["Choose Deck", "Opponent Style", "Summary"];
}

function chip($, { id, selected, title, blurb, onPick, extra }) {
  return $(
    "button",
    {
      type: "button",
      class: "choice-chip",
      "aria-pressed": id === selected,
      "data-pick": id,
      onclick: onPick,
    },
    $("strong", {}, title),
    $("small", {}, blurb),
    extra || null,
  );
}

function stepper($, lang, step) {
  return $(
    "ol",
    { class: "setup-steps", "aria-label": tr(lang) ? "Kurulum adımları" : "Setup steps" },
    ...stepLabels(lang).map((label, i) =>
      $(
        "li",
        {
          class: "setup-step",
          "aria-current": i + 1 === step ? "step" : null,
          "data-state": i + 1 === step ? "current" : i + 1 < step ? "done" : "todo",
        },
        $("span", { class: "setup-step-no" }, String(i + 1)),
        $("span", { class: "setup-step-label" }, label),
      ),
    ),
  );
}

/** Card list for one preset, grouped by type, with copy counts. */
export function deckListBody($, lang, preset, pool, onCard) {
  const byId = new Map(pool.map((c) => [c.id, c]));
  const kinds = [
    ["unit", tr(lang) ? "Birimler" : "Units"],
    ["spell", tr(lang) ? "Büyüler" : "Spells"],
    ["trap", tr(lang) ? "Tuzaklar" : "Traps"],
  ];
  const rows = [];
  for (const [kind, heading] of kinds) {
    const entries = (preset.cards || [])
      .map((entry) => ({ entry, card: byId.get(entry.id) }))
      .filter((row) => row.card?.kind === kind)
      .sort(
        (a, b) =>
          (a.card.level || 0) - (b.card.level || 0) ||
          String(a.card.name[lang] || a.card.name.tr).localeCompare(
            String(b.card.name[lang] || b.card.name.tr),
            lang,
          ),
      );
    if (!entries.length) continue;
    const total = entries.reduce((n, row) => n + row.entry.count, 0);
    rows.push($("h4", { class: "deck-group" }, `${heading} · ${total}`));
    rows.push(
      $(
        "ul",
        { class: "deck-card-list" },
        ...entries.map(({ entry, card }) =>
          $(
            "li",
            {},
            $(
              "button",
              {
                type: "button",
                class: "deck-card-row",
                "data-pick": `deck-card-${card.id}`,
                onclick: () => onCard?.(card),
              },
              $("span", { class: "deck-card-name" }, card.name[lang] || card.name.tr),
              $(
                "span",
                { class: "deck-card-meta" },
                card.kind === "unit" ? `K${card.level} · ${card.attack}/${card.defense}` : "",
              ),
              $("span", { class: "deck-card-count" }, `×${entry.count}`),
            ),
          ),
        ),
      ),
    );
  }
  return rows;
}

/**
 * Render the wizard into `host`.
 * `state` is mutated in place so a Back/Next round trip keeps every choice.
 */
export function renderSetup(host, ctx) {
  const { $, lang, theme, pool, decks, state, onStart, onCancel, onInspectCard } = ctx;
  const rerender = () => renderSetup(host, ctx);
  const isTr = tr(lang);
  const preset = findPreset(decks, state.deckId) || decks[0] || null;
  if (preset && state.deckId !== preset.id) state.deckId = preset.id;

  const body = [stepper($, lang, state.step)];

  if (state.step === 1) {
    body.push($("h3", { class: "setup-heading" }, deckHeading(theme, lang)));
    body.push($("p", { class: "setup-intro" }, deckIntro(theme, lang)));
    body.push(
      $(
        "div",
        { class: "identity-grid" },
        ...decks.map((deck) => {
          const copy = deckCopy(theme, deck.id, lang);
          const counts = deckBreakdown(deck, pool);
          const total = presetCardIds(deck).length;
          return chip($, {
            id: deck.id,
            selected: state.deckId,
            title: copy.name,
            blurb: copy.blurb,
            onPick: () => {
              state.deckId = deck.id;
              rerender();
            },
            extra: $(
              "span",
              { class: "deck-chip-meta" },
              `${total} ${isTr ? "kart" : "cards"} · ${counts.unit}/${counts.spell}/${counts.trap}`,
            ),
          });
        }),
      ),
    );
    if (preset)
      body.push(
        $(
          "button",
          {
            type: "button",
            class: "ghost deck-inspect",
            "data-pick": "inspect-deck",
            onclick: () => {
              state.viewingDeck = !state.viewingDeck;
              rerender();
            },
            "aria-expanded": Boolean(state.viewingDeck),
          },
          state.viewingDeck
            ? isTr
              ? "Deste Listesini Gizle"
              : "Hide Deck List"
            : isTr
              ? "Desteyi İncele"
              : "View Deck",
        ),
      );
    if (preset && state.viewingDeck)
      body.push(
        $(
          "div",
          { class: "deck-preview" },
          $(
            "p",
            { class: "deck-preview-note" },
            isTr
              ? "Bu destedeki bütün kartlar. Karta dokununca ayrıntısı açılır."
              : "Every card in this deck. Tap a card to open its detail.",
          ),
          ...deckListBody($, lang, preset, pool, onInspectCard),
        ),
      );
  }

  if (state.step === 2) {
    body.push(
      $("h3", { class: "setup-heading" }, isTr ? "Rakip Tarzı" : "Opponent Style"),
      $(
        "p",
        { class: "setup-intro" },
        isTr
          ? "Yapay rakip bu tarza göre karar verir. Gizli kartlarını asla görmez."
          : "The AI opponent decides by this style. It never sees your hidden cards.",
      ),
      $(
        "div",
        { class: "identity-grid" },
        ...AI_PROFILE_IDS.map((id) => {
          const copy = AI_PROFILES[id][lang === "en" ? "en" : "tr"];
          return chip($, {
            id,
            selected: state.aiProfile,
            title: copy.name,
            blurb: copy.blurb,
            onPick: () => {
              state.aiProfile = id;
              rerender();
            },
          });
        }),
      ),
    );
  }

  if (state.step === 3) {
    const copy = deckCopy(theme, state.deckId, lang);
    const counts = preset ? deckBreakdown(preset, pool) : { unit: 0, spell: 0, trap: 0 };
    const total = preset ? presetCardIds(preset).length : 0;
    const ai = AI_PROFILES[state.aiProfile]?.[lang === "en" ? "en" : "tr"];
    body.push(
      $("h3", { class: "setup-heading" }, isTr ? "Özet" : "Summary"),
      $(
        "dl",
        { class: "setup-summary" },
        $("dt", {}, deckHeading(theme, lang)),
        $("dd", { "data-value": "deck" }, copy.name),
        $("dt", {}, isTr ? "Kart sayısı" : "Card count"),
        $(
          "dd",
          { "data-value": "count" },
          `${total} · ${counts.unit} ${isTr ? "birim" : "units"} · ${counts.spell} ${
            isTr ? "büyü" : "spells"
          } · ${counts.trap} ${isTr ? "tuzak" : "traps"}`,
        ),
        $("dt", {}, isTr ? "Rakip tarzı" : "Opponent style"),
        $("dd", { "data-value": "ai" }, ai?.name || "—"),
      ),
      $(
        "p",
        { class: "setup-intro" },
        isTr
          ? "Başlat'a bastığında ilk oyuncuyu belirlemek için taş-kağıt-makas oynanır."
          : "Pressing Start rolls rock-paper-scissors for the first turn.",
      ),
    );
  }

  const actions = [];
  actions.push(
    $(
      "button",
      {
        type: "button",
        class: "ghost",
        "data-pick": "setup-back",
        onclick: () => {
          if (state.step === 1) onCancel();
          else {
            state.step -= 1;
            rerender();
          }
        },
      },
      state.step === 1 ? (isTr ? "Vazgeç" : "Cancel") : isTr ? "Geri" : "Back",
    ),
  );
  if (state.step < SETUP_STEPS)
    actions.push(
      $(
        "button",
        {
          type: "button",
          class: "primary",
          "data-pick": "setup-next",
          onclick: () => {
            state.step += 1;
            rerender();
          },
        },
        isTr ? "İleri" : "Next",
      ),
    );
  else
    actions.push(
      $(
        "button",
        { type: "button", class: "primary", "data-pick": "setup-start", onclick: () => onStart() },
        isTr ? "Düelloyu Başlat" : "Start Duel",
      ),
    );
  body.push($("div", { class: "dialog-actions setup-actions" }, ...actions));

  host.replaceChildren(...body.filter(Boolean));
  return host;
}
