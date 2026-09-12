function seriesOf(card) {
  return [].concat(card?.series || []).filter(Boolean);
}

function mentionsSeries(card, series) {
  const blob = JSON.stringify({
    effects: card.effects,
    triggers: card.triggers,
    traits: card.traits,
    costs: card.costs,
  });
  return series.some((s) => s && blob.includes(s));
}

function kindPair(a, b) {
  if (a.kind === "unit" && b.kind !== "unit") return 8;
  if (a.kind === "trap" && b.kind === "unit") return 6;
  if (a.kind === "spell" && b.kind === "unit") return 6;
  return 0;
}

/** Explainable related-card ranking. No 300×300 table. */
export function relatedCards(card, pool, limit = 5) {
  if (!card || !pool?.length) return [];
  const mine = seriesOf(card);
  const scored = [];
  for (const other of pool) {
    if (!other || other.id === card.id) continue;
    let score = 0;
    const theirs = seriesOf(other);
    const shared = mine.filter((s) => theirs.includes(s));
    if (shared.length) score += 50 + shared.length * 8;
    if (mentionsSeries(card, theirs)) score += 36;
    if (mentionsSeries(other, mine)) score += 28;
    if (card.kind === other.kind && card.kind === "unit") {
      const d = Math.abs((card.level || 0) - (other.level || 0));
      if (d === 0) score += 10;
      else if (d === 1) score += 6;
    }
    score += kindPair(card, other);
    if (card.subtype === "equip" && other.kind === "unit") score += 18;
    if (other.subtype === "equip" && card.kind === "unit") score += 14;
    if (score < 20) continue;
    scored.push({
      id: other.id,
      score,
      why: shared[0] || (mentionsSeries(card, theirs) ? "combo" : "line"),
      card: other,
    });
  }
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const seen = new Set();
  const out = [];
  for (const row of scored) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}
