import { dispatch } from "./rules.js";
import { legalActions } from "./actions.js";
// Presentation-only vocabulary: engine command names and phase semantics stay stable.
export function primaryTitle(view, theme, lang) {
  const tr = lang === "tr",
    veto = theme === "veto-h";
  switch (view.phase) {
    case "draw":
      return tr ? "Kart Çek" : "Draw Card";
    case "standby":
      return tr ? "Ana Aşamaya Geç" : "Go to Main Phase";
    case "main1":
      return view.turn === 1
        ? tr
          ? "Turu Bitir"
          : "End Turn"
        : veto
          ? tr
            ? "Tartışmaya Geç"
            : "Enter Debate"
          : tr
            ? "Kapışmaya Geç"
            : "Enter Clash";
    case "battle":
      return veto ? (tr ? "Tartışmayı Bitir" : "End Debate") : tr ? "Kapışmayı Bitir" : "End Clash";
    default:
      return tr ? "Turu Bitir" : "End Turn";
  }
}
export function cardActionTitle(action, card, view, theme, lang, fallback) {
  const tr = lang === "tr",
    veto = theme === "veto-h";
  if (action.type === "phase") return primaryTitle(view, theme, lang);
  if (action.type === "end-main") return tr ? "Turu Bitir" : "End Turn";
  if (action.type === "summon")
    return action.tributes?.length
      ? veto
        ? tr
          ? "İstifa ile Çağır"
          : "Summon by Resignation"
        : tr
          ? "Adam Yakarak Sür"
          : "Tribute Crew"
      : veto
        ? tr
          ? "Normal Çağır"
          : "Normal Summon"
        : tr
          ? "Sahaya Sür"
          : "Deploy Crew";
  if (action.type === "set-unit" || action.type === "set-support")
    return tr ? (veto ? "Set Et" : "Setle") : "Set";
  if (action.type === "attack")
    return action.target === null
      ? veto
        ? tr
          ? "Açık Miting"
          : "Open Rally"
        : tr
          ? "Kapıya Dayan"
          : "Storm the Door"
      : veto
        ? tr
          ? "Tartış"
          : "Debate"
        : tr
          ? "Kapış"
          : "Clash";
  if (action.type === "respond") return tr ? "Cevap Ver" : "Respond";
  if (action.type === "pass") return tr ? "Geç" : "Pass";
  if (action.type === "activate" && card?.kind !== "unit")
    return veto
      ? card?.kind === "trap"
        ? tr
          ? "Skandalı Aç"
          : "Reveal Scandal"
        : tr
          ? "Kampanyayı Aç"
          : "Launch Campaign"
      : card?.kind === "trap"
        ? tr
          ? "İhbarı Aç"
          : "Reveal Tip-off"
        : tr
          ? "Raconu Aç"
          : "Play Racon";
  return fallback;
}

// A UI transaction may finish an empty End Phase, but never resolves a player's
// pending choice, response, hand discard or optional End-position ability.
export function dispatchPresented(state, action) {
  const result = dispatch(state, action);
  if (!result.ok) return result;
  const next = result.state;
  if (next.phase !== "end" || next.pending || next.choice || next.result) return result;
  const legal = legalActions(next, next.active);
  const advance = legal.find((a) => a.type === "phase");
  if (!advance || legal.some((a) => a.type === "position")) return result;
  return dispatch(next, advance);
}
