/** Pre-match identity. Cosmetic + deck emphasis labels. No stat buffs. */

export const CAMPAIGN_STYLES = {
  halkci: {
    tr: { name: "Halkçı", blurb: "Kapı kapı, meydan meydan. Kampanyanın merkezinde seçmen var." },
    en: {
      name: "Grassroots",
      blurb: "Door to door, square to square. A campaign built around voters.",
    },
    series: ["Sandık", "Kürsü"],
  },
  kurumsal: {
    tr: {
      name: "Kurumsal",
      blurb: "Genel merkezden sahaya. Disiplinli bir ekiple, planlı adımlar.",
    },
    en: {
      name: "Machine",
      blurb: "From headquarters to the field. A disciplined team and a clear plan.",
    },
    series: ["Genel Merkez", "Kulis", "Kurultay"],
  },
  agresif: {
    tr: { name: "Agresif", blurb: "Gündemi sen belirle. Sözünü erken söyle, baskıyı sürdür." },
    en: { name: "Attack Line", blurb: "Set the agenda. Speak first and keep the pressure on." },
    series: ["Kampanya", "Kürsü"],
  },
  savunmaci: {
    tr: { name: "Savunmacı", blurb: "Önce zeminini sağlamlaştır. Rakibin açığını sabırla bekle." },
    en: { name: "Defensive", blurb: "Secure your position, then wait for your opponent to slip." },
    series: ["Skandal", "Anket"],
  },
  kriz: {
    tr: {
      name: "Kriz Yönetimi",
      blurb: "Plan değişebilir. Son dakika gelişmelerine hazırlıklı ol.",
    },
    en: { name: "Crisis Desk", blurb: "Plans can change. Be ready for the last-minute turn." },
    series: ["Koalisyon", "Skandal", "Anket"],
  },
};

export const NEIGHBORHOODS = {
  kadikoy: {
    tr: {
      name: "Kadıköy",
      blurb: "Vapur sesleri uzaktan geliyor. Son çaylar söylenmiş, masa hâlâ dağılmamış.",
    },
    en: { name: "Kadıköy", blurb: "Ferries sound in the distance. One last tea, one more round." },
    accent: "#c4a35a",
    aiBias: "patient",
  },
  usküdar: {
    tr: {
      name: "Üsküdar",
      blurb: "Sahilde ışıklar seyrelmiş. Ara sokaktaki masada gece yeni başlıyor.",
    },
    en: {
      name: "Üsküdar",
      blurb: "The waterfront lights thin out. At a backstreet table, the night begins.",
    },
    accent: "#6a8f9a",
    aiBias: "controlled",
  },
  fatih: {
    tr: {
      name: "Fatih",
      blurb: "Kepenkler inmiş. Eski bir dükkânın arkasında kartlar yeniden dağıtılıyor.",
    },
    en: {
      name: "Fatih",
      blurb: "The shutters are down. Behind an old shop, the cards are dealt again.",
    },
    accent: "#b5684a",
    aiBias: "aggressive",
  },
  besiktas: {
    tr: {
      name: "Beşiktaş",
      blurb: "Meydanın uğultusu içeri sızıyor. Kimsenin masadan kalkmaya niyeti yok.",
    },
    en: { name: "Beşiktaş", blurb: "The square hums outside. Nobody is ready to leave the table." },
    accent: "#6b7bb8",
    aiBias: "trapper",
  },
  beyoglu: {
    tr: {
      name: "Beyoğlu",
      blurb: "Sokak lambası masayı yarım aydınlatıyor. Dışarıda başka bir gece akıyor.",
    },
    en: {
      name: "Beyoğlu",
      blurb: "A streetlamp lights half the table. Another night unfolds outside.",
    },
    accent: "#9a6aa8",
    aiBias: "gambler",
  },
};

export const COMMAND_DESKS = {
  muhtira: {
    tr: {
      name: "Muhtıra",
      blurb: "Kâğıt önce durur. İhtarlar setlenir; acele eden masa kendi zeyilini unutur.",
    },
    en: {
      name: "Memorandum",
      blurb: "Paper holds first. Notices are set; the hurried desk forgets its own addendum.",
    },
    accent: "#8a4a32",
    aiBias: "trapper",
    series: ["Muhtira", "Ihtar", "Redaksiyon"],
  },
  tebligat: {
    tr: {
      name: "Tebligat",
      blurb: "Telex erken düşer. Tempo senin; boş masa seni geç yener.",
    },
    en: {
      name: "Dispatch",
      blurb: "The telex lands early. Tempo is yours; an empty desk beats you late.",
    },
    accent: "#c4a574",
    aiBias: "aggressive",
    series: ["Tebligat", "Telex", "Dosya"],
  },
  karargah: {
    tr: {
      name: "Karargâh",
      blurb: "Heyet kalabalık tutulur. Orta saha, paraflı çağrı; İstişare seni yorar.",
    },
    en: {
      name: "Command Post",
      blurb: "Keep the panel crowded. Mid-board, signed summons; Consultation outlasts you.",
    },
    accent: "#6b7bb8",
    aiBias: "controlled",
    series: ["Karargah", "Kabine", "Heyet"],
  },
  istisare: {
    tr: {
      name: "İstişare",
      blurb: "Brifing uzar, kart akar. Uzun kriz; Tebligat seni erken keser.",
    },
    en: {
      name: "Consultation",
      blurb: "The briefing runs long and cards flow. A long crisis; Dispatch cuts you early.",
    },
    accent: "#3d6a6a",
    aiBias: "patient",
    series: ["Brifing", "Paraf", "Arsiv"],
  },
  zeyilname: {
    tr: {
      name: "Zeyilname",
      blurb: "Arşiv konuşur. Mezarlıktan dönüş; Muhtıra seni setlerde boğar.",
    },
    en: {
      name: "Addendum",
      blurb: "The archive speaks. Returns from file; Memorandum drowns you in sets.",
    },
    accent: "#5a4a3a",
    aiBias: "gambler",
    series: ["Zeyil", "Arsiv", "Mesruiyet"],
  },
};

export function campaignStyleIds() {
  return Object.keys(CAMPAIGN_STYLES);
}
export function neighborhoodIds() {
  return Object.keys(NEIGHBORHOODS);
}
export function commandDeskIds() {
  return Object.keys(COMMAND_DESKS);
}
export function identityLabel(kind, id, lang) {
  const table =
    kind === "campaign" ? CAMPAIGN_STYLES : kind === "desk" ? COMMAND_DESKS : NEIGHBORHOODS;
  return table[id]?.[lang === "en" ? "en" : "tr"] || table[id]?.tr || { name: "—", blurb: "" };
}
