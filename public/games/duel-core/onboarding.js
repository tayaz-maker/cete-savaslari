/**
 * First-duel coach marks.
 *
 * A newcomer's first match is the moment the game either explains itself or
 * does not. This is deliberately small: six short notes anchored to parts of
 * the board that already exist, shown once, skippable at any point, and
 * replayable from How to Play. It never blocks a click — the note sits beside
 * the thing it describes and the player can keep playing straight through it.
 */
export const ONBOARDING_KEY = "tariklab.duel.onboarding.v1";

/**
 * Steps are anchored by selector and gated by a board predicate, so each note
 * appears when the thing it explains is actually on screen and in play.
 */
export function onboardingSteps(theme, lang, words) {
  const tr = lang !== "en";
  const unit = words.unit;
  const battle = words.battle;
  return [
    {
      id: "hand",
      anchor: ".hand-row",
      title: tr ? "Elin" : "Your hand",
      body: tr
        ? `Buradaki kartlar senin elin. Bir karta dokunduğunda sağdaki Kart Ayrıntısı bölümünde ne yaptığı ve şu an oynanıp oynanamayacağı yazar.`
        : `These are the cards in your hand. Tap one and the Card Inspector on the right tells you what it does and whether you can play it now.`,
    },
    {
      id: "phases",
      anchor: ".phase-strip",
      title: tr ? "Aşamalar" : "Phases",
      body: tr
        ? `Bir tur soldan sağa ilerler. Kart oynamak için Hamle 1 veya Hamle 2 aşamasında olman gerekir; ${battle} aşamasında saldırırsın.`
        : `A turn runs left to right. You play cards in Main 1 or Main 2, and attack in the ${battle} phase.`,
    },
    {
      id: "board",
      anchor: ".player-field.player",
      title: tr ? "Senin sahan" : "Your side",
      body: tr
        ? `Üst sıra senin ${unit} yuvaların, alt sıra destek kartların. Rakibin sahası tam karşında; iki taraf da aynı kurallarla oynar.`
        : `The top row holds your ${unit} zones and the row under it your support cards. The opponent's side faces yours and both play by the same rules.`,
    },
    {
      id: "economy",
      anchor: ".action-dock",
      title: tr ? "Bir turda ne yapabilirsin" : "What one turn allows",
      body: tr
        ? `Turda bir normal çağrı, bir özel çağrı ve en fazla iki destek seti yapabilirsin. Rakip de tam olarak aynı haklara sahiptir.`
        : `One Normal Summon, one Special Summon and at most two support Sets per turn. The opponent gets exactly the same.`,
    },
    {
      id: "flow",
      anchor: ".ledger",
      title: tr ? "Oyun Akışı" : "Match flow",
      body: tr
        ? `Her hamle buraya yazılır: kim ne yaptı ve sonucu ne oldu. Bir kart sahadan kalktıysa sebebini burada bulursun.`
        : `Every move is written here: who did what and what came of it. If a card left the field, the reason is in this rail.`,
    },
    {
      id: "inspector",
      anchor: ".inspector",
      title: tr ? "Kart Ayrıntısı" : "Card Inspector",
      body: tr
        ? `Bir kartı oynayamıyorsan “Neden Kullanamıyorum?” bölümü sebebini açıkça söyler. Takıldığın her yerde önce buraya bak.`
        : `When a card cannot be played, "Why Can't I Use This?" says exactly why. It is the first place to look when you are stuck.`,
    },
  ];
}

/** Has the player already been shown (or dismissed) the first-duel guide? */
export function onboardingSeen(storage) {
  try {
    return storage.getItem(ONBOARDING_KEY) === "done";
  } catch {
    return true; // No storage: never nag.
  }
}

export function markOnboardingSeen(storage) {
  try {
    storage.setItem(ONBOARDING_KEY, "done");
  } catch {
    /* A blocked store only means the guide may appear again. */
  }
}

export function resetOnboarding(storage) {
  try {
    storage.removeItem(ONBOARDING_KEY);
  } catch {
    /* Nothing to clear. */
  }
}
