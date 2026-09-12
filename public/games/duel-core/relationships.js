/**
 * Explainable card relationships.
 *
 * Every row shown in the UI must carry a reason read off the printed
 * definition — which operation ties the two cards together, and in which
 * direction. A pair with no derivable reason is not shown at all, so the combo
 * block never claims a synergy the cards do not actually have.
 */
function seriesOf(card) {
  return [].concat(card?.series || []).filter(Boolean);
}

function definitionBlob(card) {
  return JSON.stringify({
    effects: card?.effects,
    triggers: card?.triggers,
    traits: card?.traits,
    costs: card?.costs,
  });
}

function mentionsSeries(card, series) {
  if (!series.length) return false;
  const blob = definitionBlob(card);
  return series.some((s) => s && blob.includes(s));
}

function opsOf(card) {
  const ops = new Set();
  const walk = (x) => {
    if (!x || typeof x !== "object") return;
    if (x.op) ops.add(x.op);
    Object.values(x).forEach(walk);
  };
  walk({ effects: card?.effects, triggers: card?.triggers, costs: card?.costs });
  return ops;
}

/** Reason codes, strongest first. Each maps to a label in `REASON_LABELS`. */
const REASON_ORDER = [
  "material",
  "search",
  "summon",
  "buff",
  "protect",
  "trigger",
  "respond",
  "series",
];

export const REASON_LABELS = {
  material: { tr: "Malzeme olur", en: "Becomes material" },
  search: { tr: "Arar", en: "Searches" },
  summon: { tr: "Çağırır", en: "Summons" },
  buff: { tr: "Güçlendirir", en: "Strengthens" },
  protect: { tr: "Korur", en: "Protects" },
  trigger: { tr: "Tetikler", en: "Triggers" },
  respond: { tr: "Cevap verir", en: "Answers" },
  series: { tr: "Aynı seri", en: "Same series" },
};

/** Why does `other` matter to `card`? Returns a reason code or null. */
export function reasonFor(card, other) {
  const mine = seriesOf(card);
  const theirs = seriesOf(other);
  const shared = mine.filter((s) => theirs.includes(s));
  // `other` names one of this card's families in its own printed definition.
  const otherWantsMine = mentionsSeries(other, mine);
  const mineWantsOther = mentionsSeries(card, theirs);
  const otherOps = opsOf(other);
  const myOps = opsOf(card);

  // Only a named family counts as a material link. "Any two units" is true of
  // most of the pool and would fill the block with meaningless rows.
  const materialOf = (host, guest) => {
    const wanted = [].concat(host?.traits?.materials?.series || []).filter(Boolean);
    return wanted.length > 0 && wanted.some((s) => seriesOf(guest).includes(s));
  };

  if (card.kind === "unit" && materialOf(other, card)) return "material";
  if (other.kind === "unit" && materialOf(card, other)) return "material";

  if (otherWantsMine || mineWantsOther) {
    const ops = otherWantsMine ? otherOps : myOps;
    const blob = otherWantsMine ? definitionBlob(other) : definitionBlob(card);
    if (blob.includes('"zones":"deck"') || ops.has("lookRest")) return "search";
    if (ops.has("summon") || ops.has("performSpecial") || ops.has("token") || ops.has("ritual"))
      return "summon";
    if (ops.has("modifier") || ops.has("swapStats")) return "buff";
    if (ops.has("negate") || ops.has("cancelAttack") || ops.has("flag")) return "protect";
    const triggers = otherWantsMine ? other.triggers : card.triggers;
    if (triggers?.length) return "trigger";
  }

  // An equip is only meaningful next to a unit it can actually attach to.
  if (card.subtype === "equip" && other.kind === "unit") return "buff";
  if (other.subtype === "equip" && card.kind === "unit") return "buff";

  // A response card answers the kind of action the other card declares.
  if (other.kind === "trap" && shared.length && card.kind === "unit") return "respond";

  if (shared.length) return "series";
  return null;
}

const REASON_SCORE = {
  material: 120,
  search: 100,
  summon: 92,
  buff: 78,
  protect: 70,
  trigger: 64,
  respond: 48,
  series: 40,
};

/** Ranked, explainable partners for one card. */
export function relatedCards(card, pool, limit = 4) {
  if (!card || !pool?.length) return [];
  const mine = seriesOf(card);
  const scored = [];
  for (const other of pool) {
    if (!other || other.id === card.id) continue;
    const why = reasonFor(card, other);
    if (!why) continue;
    let score = REASON_SCORE[why] || 0;
    const shared = mine.filter((s) => seriesOf(other).includes(s));
    score += shared.length * 6;
    if (card.kind === "unit" && other.kind !== "unit") score += 4;
    scored.push({ id: other.id, score, why, series: shared[0] || null, card: other });
  }
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      REASON_ORDER.indexOf(a.why) - REASON_ORDER.indexOf(b.why) ||
      a.id.localeCompare(b.id),
  );
  return scored.slice(0, limit);
}

export function reasonLabel(why, lang) {
  const row = REASON_LABELS[why];
  if (!row) return "";
  return lang === "en" ? row.en : row.tr;
}
