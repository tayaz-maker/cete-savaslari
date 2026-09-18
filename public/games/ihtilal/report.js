import { ARCHETYPES, DESKS } from "./decks.js";
import { cardOf } from "./cards.js";
import { labelDesk } from "./copy.js";

export function endReport(state, lang = "tr") {
  const tr = lang !== "en";
  const result = state.result || { winner: "draw", reason: "time" };
  const you = result.winner === 0;
  const draw = result.winner === "draw";
  const reasonMap = {
    hukum: tr ? "Hüküm 10 yazıldı." : "Ruling 10 was written.",
    dagilma: tr ? "Isı 100'e çıktı; kurul dağıldı." : "Heat hit 100; the board dissolved.",
    exhaust: tr ? "Evrak tükendi." : "The papers ran out.",
    skip: tr ? "Kalemler üst üste sustu." : "The pens fell silent in a row.",
    time: tr ? "Kırk tur doldu." : "Forty turns elapsed.",
  };
  const locks = DESKS.map((d) => ({
    desk: d,
    lock: state.desks[d].lock,
    presence: state.desks[d].presence.slice(),
  }));
  const plays = state.log.filter((r) => r.k === "play" || r.k === "counter");
  const byCard = {};
  for (const row of plays) {
    byCard[row.c] = (byCard[row.c] || 0) + 1;
  }
  const repeated = Object.entries(byCard)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id, n]) => ({ id, n, title: cardOf(id)?.title?.[lang] || cardOf(id)?.title?.tr || id }));
  const turning = state.log.find((r) => r.k === "steal-lock") || state.log.find((r) => r.k === "lock") || plays[Math.floor(plays.length / 2)];
  const families = Object.entries(state.familyClaim)
    .filter(([k, v]) => !k.includes(":locked") && v.n >= 2)
    .map(([k, v]) => ({ key: k, n: v.n, family: v.family }));
  const chains = Object.values(state.chains || {}).filter((c) => c.step >= 2);
  const crises = state.log.filter((r) => r.k === "repeat-heat" || r.k === "dagilma" || r.k === "artci-overflow");
  const alt =
    result.reason === "dagilma"
      ? tr
        ? "Isı daha düşük tutulsaydı kilitler konuşurdu."
        : "If heat had been kept lower, the locks would have spoken."
      : result.reason === "hukum"
        ? tr
          ? "Karşı kalem bir kilit çalsaydı hüküm gecikirdi."
          : "If the opposing pen had stolen a lock, the ruling would have been late."
        : tr
          ? "Bir masa daha kilitlense sonuç değişirdi."
          : "One more locked desk would have changed it.";
  return {
    headline: draw ? (tr ? "Berabere" : "Draw") : you ? (tr ? "Senin hükmün" : "Your ruling") : tr ? "Karşı hüküm" : "Opposing ruling",
    reason: reasonMap[result.reason] || reasonMap.time,
    archetypes: state.players.map((p) => ARCHETYPES[p.archetype]?.title?.[lang] || p.archetype),
    meters: {
      hukum: state.players.map((p) => p.hukum),
      muhur: state.players.map((p) => p.muhur),
      heat: state.heat,
      turn: state.turn,
    },
    locks: locks.map((row) => ({
      ...row,
      name: labelDesk(row.desk, tr),
    })),
    turning: turning
      ? tr
        ? `Dönemeç: tur ${turning.t}, ${turning.k}${turning.d ? " / " + labelDesk(turning.d, true) : ""}.`
        : `Turning point: turn ${turning.t}, ${turning.k}${turning.d ? " / " + labelDesk(turning.d, false) : ""}.`
      : tr
        ? "Belirgin bir dönemeç yok; masa yavaş kapandı."
        : "No sharp turning point; the board closed slowly.",
    repeated,
    families,
    chains: chains.length,
    crises: crises.length,
    alt,
    log: state.log.slice(-16),
  };
}
