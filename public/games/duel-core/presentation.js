import { dispatch } from "./rules.js";
import { legalActions } from "./actions.js";
import { pickLang, themeMeta } from "./theme-meta.js";
// Presentation-only vocabulary: engine command names and phase semantics stay stable.
export function primaryTitle(view, theme, lang) {
  const tr = lang === "tr",
    meta = themeMeta(theme);
  switch (view.phase) {
    case "draw":
      return tr ? "Kart Çek" : "Draw Card";
    case "standby":
      return tr ? "Hamle Aşamasına Geç" : "Go to Main Phase";
    case "main1":
      return view.turn === 1
        ? tr
          ? "Turu Bitir"
          : "End Turn"
        : pickLang(meta.battleEnter, lang);
    case "battle":
      return pickLang(meta.battleEnd, lang);
    default:
      return tr ? "Turu Bitir" : "End Turn";
  }
}
export function cardActionTitle(action, card, view, theme, lang, fallback) {
  const tr = lang === "tr",
    meta = themeMeta(theme);
  if (action.type === "phase") return primaryTitle(view, theme, lang);
  if (action.type === "end-main") return tr ? "Turu Bitir" : "End Turn";
  if (action.type === "summon")
    return action.tributes?.length
      ? pickLang(meta.tributeSummon, lang)
      : pickLang(meta.normalSummon, lang);
  if (action.type === "set-unit" || action.type === "set-support")
    return pickLang(meta.setVerb, lang);
  if (action.type === "attack")
    return action.target === null
      ? pickLang(meta.directAttack, lang)
      : pickLang(meta.unitAttack, lang);
  if (action.type === "respond") return tr ? "Cevap Ver" : "Respond";
  if (action.type === "pass") return tr ? "Geç" : "Pass";
  if (action.type === "activate" && card?.kind !== "unit")
    return card?.kind === "trap"
      ? pickLang(meta.activateTrap, lang)
      : pickLang(meta.activateSpell, lang);
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
