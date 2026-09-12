import { cardValue } from "./telemetry.js";

function nameOf(id, catalog, lang) {
  const card = catalog?.[id];
  if (!card) return id || "—";
  return (card.name && (card.name[lang] || card.name.tr || card.name.en)) || id;
}

export function analyzeMatch(tel, catalog, lang = "tr") {
  const events = tel?.events || [];
  const last = events.at(-1);
  const winner = last?.result?.winner ?? tel?.winner ?? null;
  const turns = Math.max(1, last?.turn || tel?.opByTurn?.length || 1);
  const stats = Object.entries(tel?.cardStats || {});
  const ranked = stats
    .map(([id, s]) => ({ id, ...s, value: cardValue(s) }))
    .sort((a, b) => b.value - a.value);
  const damageRank = stats
    .map(([id, s]) => ({ id, damage: s.damage || 0 }))
    .sort((a, b) => b.damage - a.damage);
  const wasted = stats
    .filter(([, s]) => (s.plays || 0) > 0 && cardValue(s) <= 0 && (s.damage || 0) === 0 && (s.draws || 0) === 0 && (s.destroys || 0) === 0 && (s.summons || 0) === 0)
    .map(([id]) => id)
    .slice(0, 4);
  let turning = null;
  let best = 0;
  for (const e of events) {
    const swing = Math.abs(e.delta?.[0] || 0) + Math.abs(e.delta?.[1] || 0);
    const multi = (e.destroys || 0) >= 2 ? 400 : 0;
    const score = swing + multi + (e.type === "attack" && e.target === "direct" ? 80 : 0);
    if (score > best && e.card) {
      best = score;
      turning = e;
    }
  }
  const star = ranked[0] || null;
  const reason = turning
    ? turning.delta?.[1] < -400
      ? lang === "tr"
        ? "en büyük OP kırılması"
        : "largest OP swing"
      : (turning.destroys || 0) >= 2
        ? lang === "tr"
          ? "saha temizliği"
          : "board clear"
        : lang === "tr"
          ? "masayı çeviren hamle"
          : "the line that flipped the table"
    : null;
  return {
    turns,
    winner,
    starId: star?.id || null,
    starValue: star?.value || 0,
    damageId: damageRank[0]?.damage ? damageRank[0].id : star?.id || null,
    wasted,
    turning: turning
      ? {
          turn: turning.turn,
          card: turning.card,
          type: turning.type,
          reason,
        }
      : null,
    ranked,
    opByTurn: tel?.opByTurn || [],
    aiProfile: tel?.aiProfile,
    identity: tel?.identity,
    events,
  };
}

export function electionShare(analysis) {
  const swing = Math.min(6, (analysis.starValue || 0) / 1200);
  let a = analysis.winner === 0 ? 51.4 + swing : analysis.winner === 1 ? 48.6 - swing : 50;
  a = Math.round(Math.min(62, Math.max(38, a)) * 10) / 10;
  const b = Math.round((100 - a) * 10) / 10;
  return { you: a, opp: b };
}

export function opGraphSvg(opByTurn, w = 320, h = 140) {
  const rows = opByTurn?.length ? opByTurn : [[8000, 8000]];
  const max = 8000;
  const pad = 18;
  const innerW = w - pad * 2,
    innerH = h - pad * 2;
  const x = (i) => pad + (rows.length <= 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW);
  const y = (v) => pad + (1 - Math.max(0, Math.min(max, v)) / max) * innerH;
  const path = (idx) =>
    rows.map((row, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(row[idx]).toFixed(1)}`).join(" ");
  return `<svg class="op-graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="OP">
    <rect x="0" y="0" width="${w}" height="${h}" fill="transparent"/>
    <path d="${path(1)}" fill="none" stroke="#c06c64" stroke-width="2"/>
    <path d="${path(0)}" fill="none" stroke="#be9b56" stroke-width="2"/>
  </svg>`;
}

export function formatAnalysis(analysis, catalog, lang, _theme) {
  const tr = lang !== "en";
  const nm = (id) => nameOf(id, catalog, lang);
  const turning = analysis.turning
    ? tr
      ? `Tur ${analysis.turning.turn} — ${nm(analysis.turning.card)} (${analysis.turning.reason})`
      : `Turn ${analysis.turning.turn} — ${nm(analysis.turning.card)} (${analysis.turning.reason})`
    : tr
      ? "Net bir kırılma anı yok."
      : "No single turning point.";
  return {
    turning,
    star: analysis.starId ? nm(analysis.starId) : "—",
    damage: analysis.damageId ? nm(analysis.damageId) : "—",
    wasted: analysis.wasted.map((id) => nm(id)),
    you: analysis.winner === 0,
  };
}
