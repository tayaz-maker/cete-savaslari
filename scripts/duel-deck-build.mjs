/** Writes the frozen deck presets to public/games/<theme>/decks.json. */
import { writeFileSync } from "node:fs";
import { pools } from "./duel-pools.mjs";
import { curate } from "./duel-deck-presets.mjs";
import { DECK_COPY, DECK_SCHEMA_VERSION, expandDeck } from "../public/games/duel-core/decks.js";
import { validateDeck } from "../public/games/duel-core/deckgen.js";

for (const theme of ["veto-h", "gett-oh"]) {
  const pool = pools[theme];
  const presets = curate(theme).map((preset) => {
    const copy = DECK_COPY[theme][preset.id];
    if (!copy) throw new Error(`Missing deck copy for ${theme}/${preset.id}`);
    return { id: preset.id, ...copy, cards: preset.cards, auxiliary: preset.auxiliary };
  });
  const doc = { schemaVersion: DECK_SCHEMA_VERSION, theme, decks: presets };

  for (const preset of presets) {
    const deck = expandDeck(preset, pool);
    if (!validateDeck(deck, pool)) throw new Error(`${theme}/${preset.id}: illegal deck`);
    const counts = { unit: 0, spell: 0, trap: 0 };
    for (const id of deck.main) counts[pool.find((c) => c.id === id).kind]++;
    console.log(
      `${theme}/${preset.id}: ${deck.main.length} cards ` +
        `(${counts.unit}U/${counts.spell}S/${counts.trap}T), aux ${deck.auxiliary.length}, ` +
        `${preset.cards.length} distinct`,
    );
  }
  writeFileSync(`public/games/${theme}/decks.json`, `${JSON.stringify(doc, null, 2)}\n`);
}
console.log("decks.json written for both themes");
