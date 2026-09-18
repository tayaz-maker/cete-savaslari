import { CARDS } from "./cards.js";
import { shuffle } from "./rng.js";

export const DESKS = ["sicil", "kasa", "manset", "koridor", "nobet"];

export const ARCHETYPES = {
  kalemci: {
    id: "kalemci",
    desk: "sicil",
    secondary: "koridor",
    weak: "manset",
    family: "sicil-hatti",
    inkBonus: 2,
    title: { tr: "Kalemci", en: "Registrar" },
    pitch: {
      tr: "Sicil masasını kilitlersin. İsimler senin defterinde durur. Manşet seni geç yener.",
      en: "You lock the registry desk. Names live in your ledger. The gazette beats you late.",
    },
    weakness: { tr: "Manşet temposuna zayıf.", en: "Weak against gazette tempo." },
  },
  hesapci: {
    id: "hesapci",
    desk: "kasa",
    secondary: "nobet",
    weak: "manset",
    family: "kasa-defteri",
    inkBonus: 1,
    title: { tr: "Hesapçı", en: "Accountant" },
    pitch: {
      tr: "Kasa kalemlerini dondurur, mühür biriktirirsin. Yavaş başlar, geç kapanırsın.",
      en: "You freeze till-lines and stack seals. Slow to start, late to close.",
    },
    weakness: { tr: "Manşet ısınmasına zayıf.", en: "Weak against gazette heat." },
  },
  mansetci: {
    id: "mansetci",
    desk: "manset",
    secondary: "koridor",
    weak: "sicil",
    family: "manset-dizgi",
    inkBonus: 1,
    heatInkBonus: 1,
    title: { tr: "Manşetçi", en: "Gazetteer" },
    pitch: {
      tr: "Cümleyi önce sen basarsın. Isı yükselir. Sicil seni bozar.",
      en: "You print the sentence first. Heat rises. The registry undoes you.",
    },
    weakness: { tr: "Sicil tasfiyesine zayıf.", en: "Weak against registry purge." },
  },
  koridorcu: {
    id: "koridorcu",
    desk: "koridor",
    secondary: "sicil",
    weak: "kasa",
    family: "imza-zinciri",
    inkBonus: 0,
    title: { tr: "Koridorcu", en: "Corridor Clerk" },
    pitch: {
      tr: "Paraf zincirini sen yürürsün. İmza senden geçer. Kasa seni aç bırakır.",
      en: "You walk the chain of initials. Signatures pass through you. The till starves you.",
    },
    weakness: { tr: "Kasa kesintisine zayıf.", en: "Weak against till freeze." },
  },
  nobetci: {
    id: "nobetci",
    desk: "nobet",
    secondary: "kasa",
    weak: "koridor",
    family: "gece-defteri",
    inkBonus: 1,
    title: { tr: "Nöbetçi", en: "Night Watch" },
    pitch: {
      tr: "Gece defteri sendedir. Artçı dosyalar sabah konuşur. Koridor seni geçer.",
      en: "The night ledger is yours. Aftershock files speak at dawn. The corridor outpaces you.",
    },
    weakness: { tr: "Koridor temposuna zayıf.", en: "Weak against corridor tempo." },
  },
  heyetci: {
    id: "heyetci",
    desk: "any",
    secondary: "koridor",
    weak: "sicil",
    family: "heyet-cizelgesi",
    inkBonus: 0,
    title: { tr: "Heyetçi", en: "Commissioner" },
    pitch: {
      tr: "Beş masayı birden konuşturursun. Zirven yok. Sicil seni kilitler.",
      en: "You make all five desks speak. You have no peak. The registry locks you out.",
    },
    weakness: { tr: "Sicil kilidine zayıf.", en: "Weak against registry lock." },
  },
};

export const ARCHETYPE_IDS = Object.keys(ARCHETYPES);

export function buildDeck(archetypeId, rng) {
  const arch = ARCHETYPES[archetypeId] || ARCHETYPES.kalemci;
  const exclusive = CARDS.filter((c) => c.exclusive === arch.id).map((c) => c.id);
  const shared = CARDS.filter((c) => !c.exclusive);
  const primary = shuffle(
    shared.filter((c) => c.desk === arch.desk || c.desk === "any").map((c) => c.id),
    rng,
  );
  const secondary = shuffle(
    shared.filter((c) => c.desk === arch.secondary && c.desk !== arch.desk).map((c) => c.id),
    rng,
  );
  const rest = shuffle(
    shared
      .filter((c) => c.desk !== arch.desk && c.desk !== arch.secondary && c.desk !== "any")
      .map((c) => c.id),
    rng,
  );
  const weakPenalty = arch.weak;
  const restSafe = rest.filter((id) => {
    const c = CARDS.find((x) => x.id === id);
    return c && c.desk !== weakPenalty;
  });
  const restWeak = rest.filter((id) => {
    const c = CARDS.find((x) => x.id === id);
    return c && c.desk === weakPenalty;
  });
  const picked = exclusive.slice();
  const take = (pool, n) => {
    for (const id of pool) {
      if (picked.length >= 30) break;
      if (picked.includes(id)) continue;
      picked.push(id);
      if (--n <= 0) break;
    }
  };
  take(primary, 10);
  take(secondary, 5);
  take(restSafe, 3);
  take(restWeak, 2);
  take(shared.map((c) => c.id), 30 - picked.length);
  return shuffle(picked.slice(0, 30), rng);
}
