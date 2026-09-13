/**
 * Deterministic curation of the five deck presets per theme.
 *
 * Presets are content, not randomness: this script ranks the existing pool by an
 * explicit per-preset role profile and freezes the winning 40-card main deck into
 * `public/games/<theme>/decks.json`. Draw order still comes from the match seed.
 * No card is added, and no stat, effect or trait is ever touched here.
 */
import { pools } from "./duel-pools.mjs";
import { copyKey } from "../public/games/duel-core/card-data.js";

/** Serialized effect/trait blob, used only to read role signals off a card. */
const blobOf = (card) =>
  JSON.stringify({
    effects: card.effects,
    triggers: card.triggers,
    traits: card.traits,
    costs: card.costs,
  });

/** Role signals derived from the printed definition — never from card names. */
export function signals(card) {
  const blob = blobOf(card);
  const has = (needle) => blob.includes(needle);
  const ops = new Set();
  const walk = (x) => {
    if (!x || typeof x !== "object") return;
    if (x.op) ops.add(x.op);
    Object.values(x).forEach(walk);
  };
  walk({ effects: card.effects, triggers: card.triggers, costs: card.costs });
  return {
    ops,
    draws: ops.has("draw") || ops.has("look") || ops.has("lookRest"),
    searches: has('"zones":"deck"') || ops.has("lookRest") || ops.has("reveal"),
    removes: ops.has("destroy") || ops.has("peekDestroy") || ops.has("banish"),
    negates: ops.has("negate") || ops.has("targetOrBattleNegate") || ops.has("negateResponse"),
    stops: ops.has("cancelAttack") || ops.has("skipBattle") || ops.has("cancelSummonToGrave"),
    buffs: ops.has("modifier") || ops.has("swapStats"),
    burns: (card.effects || []).some((e) => e.op === "points" && e.opponent && e.amount < 0),
    heals: (card.effects || []).some((e) => e.op === "points" && !e.opponent && e.amount > 0),
    recurs: has('"zones":"grave"') || ops.has("relocate") || ops.has("relocateTo"),
    summons:
      ops.has("summon") || ops.has("performSpecial") || ops.has("token") || ops.has("ritual"),
    steals: ops.has("control") || ops.has("transferSameLevel"),
    protects: ops.has("flag") || ops.has("position"),
  };
}

/** Preset role profiles. `series` drives identity, `want` weights printed roles. */
export const PROFILES = {
  "veto-h": {
    halkci: {
      series: ["Sandık", "Kürsü", "Belediye", "Gençlik"],
      want: { summons: 5, buffs: 4, draws: 3, heals: 2 },
      levelBias: "low",
    },
    kurumsal: {
      series: ["Genel Merkez", "Kulis", "Kurultay", "Kurum", "Hukuk"],
      want: { draws: 6, searches: 5, negates: 3, buffs: 2 },
      levelBias: "mid",
    },
    agresif: {
      series: ["Kampanya", "Kürsü", "Basın"],
      want: { burns: 6, buffs: 5, removes: 3, summons: 2 },
      levelBias: "attack",
    },
    savunmaci: {
      series: ["Skandal", "Anket", "Hukuk"],
      want: { negates: 6, stops: 6, protects: 4, removes: 2 },
      levelBias: "defense",
      traps: 8,
    },
    kriz: {
      series: ["Koalisyon", "Skandal", "Anket", "Lobi", "Lojistik"],
      want: { recurs: 6, heals: 5, steals: 4, removes: 3, draws: 2 },
      levelBias: "mid",
      traps: 7,
    },
  },
  "gett-oh": {
    kadikoy: {
      series: ["Çayhane", "Haber", "Apartman"],
      want: { draws: 5, heals: 4, protects: 3, searches: 3 },
      levelBias: "low",
    },
    usküdar: {
      series: ["Liman", "Yemin", "Aile"],
      want: { buffs: 4, searches: 4, negates: 3, protects: 2 },
      levelBias: "mid",
      traps: 7,
    },
    fatih: {
      series: ["Çarşı", "Sanayi", "Borç"],
      want: { removes: 5, burns: 5, buffs: 4, steals: 2 },
      levelBias: "attack",
    },
    besiktas: {
      series: ["Sokak", "Dernek", "İhbar"],
      want: { stops: 5, negates: 4, removes: 4, burns: 3 },
      levelBias: "attack",
      traps: 7,
    },
    beyoglu: {
      series: ["Gece", "Taksi", "Racon"],
      want: { steals: 5, recurs: 4, summons: 4, burns: 3 },
      levelBias: "mid",
    },
  },
};

function scoreCard(card, profile) {
  const sig = signals(card);
  let score = 0;
  const affinity = (card.series || []).filter((s) => profile.series.includes(s)).length;
  score += affinity * 40;
  for (const [key, weight] of Object.entries(profile.want)) if (sig[key]) score += weight * 6;
  const level = card.level || 0;
  if (card.kind === "unit") {
    // Tribute-free bodies are what actually keeps a deck playing every turn, so
    // every identity shares the same curve preference and a stat floor. The
    // per-preset bias then chooses *which* summonable crew to field.
    score += level <= 4 ? 20 : level <= 6 ? 6 : 0;
    score += Math.min(16, Math.max(card.attack || 0, card.defense || 0) / 140);
    if (profile.levelBias === "low") score += level <= 3 ? 8 : 0;
    else if (profile.levelBias === "mid") score += level >= 3 && level <= 5 ? 8 : 0;
    else if (profile.levelBias === "attack") score += Math.min(12, (card.attack || 0) / 180);
    else if (profile.levelBias === "defense") score += Math.min(12, (card.defense || 0) / 180);
    if (level >= 7) score -= 10;
  }
  // Stable tiebreak so the frozen output never depends on pool iteration luck.
  return score;
}

/** Greedy legal build: quotas first, then copies, always inside the deck rules. */
export function buildPreset(pool, profile) {
  const traps = profile.traps || 6;
  const spells = 40 - 23 - traps >= 10 ? 40 - 23 - traps : 10;
  const units = 40 - traps - spells;
  const quota = { unit: units, spell: spells, trap: traps };
  const main = [];
  const copies = new Map();
  const bosses = new Set();
  let middle = 0;

  for (const kind of ["unit", "spell", "trap"]) {
    const ranked = pool
      .filter((c) => c.kind === kind && c.deckLocation === "main")
      .map((c) => ({ card: c, score: scoreCard(c, profile) }))
      .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id));
    let placed = 0;
    // Signature cards run as playsets, the tail as singles: a deck that opens
    // with its own plan rather than 40 unrelated cards.
    const wanted = (rank) => (rank < 4 ? 3 : rank < 10 ? 2 : 1);
    for (const [rank, { card }] of ranked.entries()) {
      if (placed >= quota[kind]) break;
      const key = copyKey(card);
      const level = card.level || 0;
      if (level >= 5 && level <= 6 && middle >= 6) continue;
      if (level >= 7 && bosses.size >= 2 && !bosses.has(key)) continue;
      // One boss copy only: a second would brick the opening hand.
      const cap = level >= 7 ? 1 : level >= 5 ? 2 : wanted(rank);
      for (let n = 0; n < cap && placed < quota[kind]; n++) {
        const held = copies.get(key) || 0;
        if (held >= 3) break;
        if (level >= 5 && level <= 6 && middle >= 6) break;
        main.push(card.id);
        copies.set(key, held + 1);
        if (level >= 5 && level <= 6) middle++;
        if (level >= 7) bosses.add(key);
        placed++;
      }
    }
    if (placed < quota[kind]) throw new Error(`Could not fill ${kind}: ${placed}/${quota[kind]}`);
  }

  const auxiliary = pool
    .filter((c) => c.deckLocation === "auxiliary")
    .map((c) => ({ card: c, score: scoreCard(c, profile) }))
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))
    .slice(0, 5)
    .map((r) => r.card.id);

  return { main, auxiliary };
}

/** Collapse an id list into the stored `{id, count}` shape, in catalog order. */
export function toEntries(ids) {
  const counts = new Map();
  for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, count]) => ({ id, count }));
}

export function curate(theme) {
  const pool = pools[theme];
  const profiles = PROFILES[theme];
  return Object.entries(profiles).map(([id, profile]) => {
    const { main, auxiliary } = buildPreset(pool, profile);
    return { id, cards: toEntries(main), auxiliary: toEntries(auxiliary) };
  });
}
