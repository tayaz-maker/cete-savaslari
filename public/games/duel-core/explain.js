/**
 * Specific, player-facing reasons an action is unavailable.
 *
 * `rejections.js` maps an engine code to one fixed sentence, which is correct
 * but says the same thing whatever the board looks like: "Bu kart bu aşamada
 * oynanamaz." tells a player nothing they can act on. This layer takes the
 * same code plus the live state and names the actual blocker — which phase
 * they are in and which ones would work, how many zones are free, what the
 * cost is against the points they hold.
 *
 * Every sentence here is derived from the rule that produced the code in
 * rules.js. Where the live state does not give a specific answer, the generic
 * copy is returned unchanged rather than a guess.
 */
import { MAIN, PHASES } from "./model.js";
import { rejectionText } from "./rejections.js";

const TRIBUTES_FOR = (level) => (level >= 7 ? 2 : level >= 5 ? 1 : 0);

/** Turkish suffix for "Hamle 1'de" / "Hazırlık Aşaması'nda". */
const phaseList = (labels, lang) =>
  MAIN.map((p) => labels(p)).join(lang === "tr" ? " veya " : " or ");

/**
 * @param code    engine rejection code, or null when the probe was legal
 * @param ctx     { state, card, type, lang, theme, label, point, unitWord }
 *                `label(key)` resolves a UI label (phases, action names).
 * @returns a specific sentence, or the generic one when nothing is derivable.
 */
export function explainRejection(code, ctx) {
  const generic = rejectionText(code, ctx.lang);
  const specific = SPECIFIC[code]?.(ctx);
  return specific || generic;
}

const SPECIFIC = {
  "main-phase-only": ({ state, lang, label }) => {
    const now = label(state.phase);
    const mains = phaseList(label, lang);
    if (!PHASES.includes(state.phase)) return "";
    return lang === "tr"
      ? `Şu an ${now} aşamasındasın; bu kartı ${mains} aşamasında oynayabilirsin.`
      : `You are in ${now}; this card can be played in ${mains}.`;
  },
  "normal-used": ({ state, lang, unitWord }) => {
    const used = state.players?.[0]?.normalUsed ?? 1;
    return lang === "tr"
      ? `Bu tur normal çağrı hakkını kullandın (${used}). Yeni bir ${unitWord} çağırmak için sıradaki turu bekle.`
      : `You have used your Normal Summon this turn (${used}). Wait for your next turn.`;
  },
  "normal-blocked": ({ lang }) =>
    lang === "tr"
      ? "Sahadaki bir kart bu tur normal çağrıyı kilitliyor."
      : "A card on the field locks Normal Summons this turn.",
  "unit-zone-required": ({ state, lang, unitWord }) => {
    const free = (state.players?.[0]?.units || []).filter((u) => u === null).length;
    return free
      ? ""
      : lang === "tr"
        ? `Sahandaki 5 ${unitWord} yuvasının hepsi dolu; önce bir yuva boşalmalı.`
        : `All five ${unitWord} zones are full; one must be freed first.`;
  },
  "support-zone-required": ({ state, lang }) => {
    const free = (state.players?.[0]?.support || []).filter((u) => u === null).length;
    return free
      ? ""
      : lang === "tr"
        ? "5 Destek yuvasının hepsi dolu; önce bir yuva boşalmalı."
        : "All five Support zones are full; one must be freed first.";
  },
  "tributes-required": ({ card, state, lang, unitWord }) => {
    const need = TRIBUTES_FOR(card?.level ?? 0);
    if (!need) return "";
    const have = (state.players?.[0]?.units || []).filter(Boolean).length;
    return lang === "tr"
      ? `Kademe ${card.level} olduğu için bu çağrı ${need} adak ister; sahanda ${have} ${unitWord} var.`
      : `Level ${card.level} needs ${need} tribute(s); you have ${have} ${unitWord} on the field.`;
  },
  "insufficient-points": ({ state, lang, point }) => {
    const have = state.players?.[0]?.points;
    return Number.isFinite(have)
      ? lang === "tr"
        ? `Bu etkinin bedelini ödeyecek ${point} yok; elinde ${have} ${point} var.`
        : `Not enough ${point} to pay this cost; you hold ${have} ${point}.`
      : "";
  },
  "no-legal-target": ({ lang }) =>
    lang === "tr"
      ? "Bu kart yalnız uygun bir hedef varken kullanılabilir; şu an sahada uygun hedef yok."
      : "This card needs a legal target, and there is none on the field right now.",
  "opponent-turn": ({ lang }) =>
    lang === "tr"
      ? "Sıra rakipte; bu kartı kendi turunda oynayabilirsin."
      : "It is the opponent's turn; play this on your own turn.",
  "battle-unavailable": ({ state, lang, label }) =>
    state.turn === 1
      ? lang === "tr"
        ? "İlk turda saldırı yok; savaş ikinci turdan itibaren açılır."
        : "No attacks on turn one; battle opens from the second turn."
      : lang === "tr"
        ? `Saldırı yalnız ${label("battle")} aşamasında yapılır; şu an ${label(state.phase)} aşamasındasın.`
        : `Attacks happen only in ${label("battle")}; you are in ${label(state.phase)}.`,
  "attack-used": ({ card, lang }) =>
    card?.attacksUsed > 0
      ? lang === "tr"
        ? "Bu birim bu tur zaten saldırdı."
        : "This unit has already attacked this turn."
      : card?.position === "defense"
        ? lang === "tr"
          ? "Savunma pozisyonundaki birim saldıramaz; önce pozisyonunu değiştir."
          : "A unit in defense position cannot attack; change its position first."
        : lang === "tr"
          ? "Bu birim kapalı olduğu için saldıramaz; önce açılmalı."
          : "A face-down unit cannot attack; it must be face-up first.",
  "position-used": ({ lang }) =>
    lang === "tr"
      ? "Bu kartın pozisyonunu bu tur zaten değiştirdin."
      : "You already changed this card's position this turn.",
  "effect-used": ({ lang }) =>
    lang === "tr" ? "Bu etkiyi bu tur zaten kullandın." : "You already used this effect this turn.",
  "no-activated-effect": ({ lang }) =>
    lang === "tr"
      ? "Bu kartın elle kullanılacak bir etkisi yok; etkisi kendiliğinden işler."
      : "This card has no effect you activate; it works on its own.",
  "trap-must-wait": ({ lang }) =>
    lang === "tr"
      ? "Bu tur set edilen tuzak bir sonraki tura kadar bekler."
      : "A trap Set this turn must wait until your next turn.",
  "quick-must-wait": ({ lang }) =>
    lang === "tr"
      ? "Bu tur set edilen hızlı kart bir sonraki tura kadar bekler."
      : "A Quick-Play card Set this turn must wait until your next turn.",
  "response-only": ({ lang }) =>
    lang === "tr"
      ? "Bu kart yalnız rakibin bir işlemine cevap olarak oynanır."
      : "This card is played only in response to the opponent's action.",
  "series-required": ({ card, lang }) => {
    const series = Array.isArray(card?.series) ? card.series.filter(Boolean) : [];
    if (!series.length) return "";
    return lang === "tr"
      ? `Bu etki için sahanda ${series.join(" / ")} serisinden bir kart olmalı.`
      : `This effect needs a card from ${series.join(" / ")} on the field.`;
  },
  "flip-required": ({ lang }) =>
    lang === "tr"
      ? "Kapalı kart önce açılmalı; kapalıyken kullanılamaz."
      : "A face-down card must be flipped first.",
  "unit-must-be-on-field": ({ lang, unitWord }) =>
    lang === "tr"
      ? `Bu etki için ${unitWord} önce sahada olmalı.`
      : `This effect needs the ${unitWord} on the field first.`,
  "invalid-set": ({ state, lang, label }) =>
    MAIN.includes(state.phase)
      ? ""
      : lang === "tr"
        ? `Set etmek için ${phaseList(label, lang)} aşamasında olmalısın; şu an ${label(state.phase)} aşamasındasın.`
        : `Setting happens in ${phaseList(label, lang)}; you are in ${label(state.phase)}.`,
  "invalid-field": ({ state, lang, label }) =>
    lang === "tr"
      ? `Alan kartı elden, ${phaseList(label, lang)} aşamasında set edilir; şu an ${label(state.phase)} aşamasındasın.`
      : `Field cards are set from hand in ${phaseList(label, lang)}; you are in ${label(state.phase)}.`,
  "hand-limit": ({ lang }) =>
    lang === "tr"
      ? "Tur sonunda elin 6 karta inmeli; fazlasını at."
      : "Cut your hand to 6 cards at the End phase.",
};
