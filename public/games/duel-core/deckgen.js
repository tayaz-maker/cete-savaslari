import { pick, random, shuffle } from "./random.js";

export function generateDeck(pool, seed) {
  const rng = { rng: seed >>> 0 },
    main = [],
    copies = new Map(),
    bosses = new Set();
  let middle = 0;
  // 23 + 11 + 6 is inside every requested distribution interval.
  for (const [kind, count] of [
    ["unit", 23],
    ["spell", 11],
    ["trap", 6],
  ]) {
    for (let i = 0; i < count; i++) {
      const eligible = pool.filter(
        (c) =>
          c.kind === kind &&
          c.deckLocation === "main" &&
          (copies.get(c.name.tr) || 0) < 3 &&
          !(c.level >= 5 && c.level <= 6 && middle >= 6) &&
          !(c.level >= 7 && bosses.size >= 2 && !bosses.has(c.name.tr)),
      );
      if (!eligible.length) throw new Error(`Insufficient legal ${kind} pool`);
      const weighted = eligible.flatMap((c) =>
        Array(c.kind === "unit" && c.level <= 4 ? 6 : c.level <= 6 ? 2 : 1).fill(c),
      );
      const card = pick(weighted, rng);
      main.push(card.id);
      copies.set(card.name.tr, (copies.get(card.name.tr) || 0) + 1);
      if (card.level >= 5 && card.level <= 6) middle++;
      if (card.level >= 7) bosses.add(card.name.tr);
    }
  }
  const auxiliary = shuffle(
    pool.filter((c) => c.deckLocation === "auxiliary"),
    rng,
  )
    .slice(0, Math.floor(random(rng) * 6))
    .map((c) => c.id);
  let deck = shuffle(main, rng);
  const byId = new Map(pool.map((c) => [c.id, c]));
  const openingUnits = deck.slice(0, 5).filter((id) => byId.get(id).kind === "unit").length;
  const mulligan = openingUnits === 0 || openingUnits === 5;
  if (mulligan) deck = shuffle(deck, rng);
  return { main: deck, auxiliary, seed: seed >>> 0, rng: rng.rng, mulligan };
}

export function validateDeck(deck, pool) {
  const byId = new Map(pool.map((c) => [c.id, c]));
  if (
    !deck ||
    deck.main?.length !== 40 ||
    !Array.isArray(deck.auxiliary) ||
    deck.auxiliary.length > 5
  )
    return false;
  const copies = new Map(),
    counts = { unit: 0, spell: 0, trap: 0 },
    bosses = new Set();
  let middle = 0;
  for (const id of deck.main) {
    const card = byId.get(id);
    if (!card || card.deckLocation !== "main") return false;
    copies.set(card.name.tr, (copies.get(card.name.tr) || 0) + 1);
    if (copies.get(card.name.tr) > 3) return false;
    counts[card.kind]++;
    if (card.level >= 5 && card.level <= 6) middle++;
    if (card.level >= 7) bosses.add(card.name.tr);
  }
  return (
    counts.unit >= 22 &&
    counts.unit <= 24 &&
    counts.spell >= 10 &&
    counts.spell <= 12 &&
    counts.trap >= 6 &&
    counts.trap <= 8 &&
    middle <= 6 &&
    bosses.size <= 2 &&
    deck.auxiliary.every((id) => byId.get(id)?.deckLocation === "auxiliary")
  );
}
