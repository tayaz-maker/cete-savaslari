/** Pre-match identity. Cosmetic + deck emphasis labels. No stat buffs. */

export const CAMPAIGN_STYLES = {
  halkci: {
    tr: { name: "Halkçı", blurb: "Meydan, sandık, kapı kapı. Kalabalık kadro, sade vaat." },
    en: { name: "Grassroots", blurb: "Doors, ballots, crowds. Lean promises, wide roster." },
    series: ["Sandık", "Kürsü"],
  },
  kurumsal: {
    tr: { name: "Kurumsal", blurb: "Genel merkez, kulis, delege. Disiplinli kadro, kontrollü tempo." },
    en: { name: "Machine", blurb: "HQ, corridors, delegates. Tight tempo, party discipline." },
    series: ["Genel Merkez", "Kulis", "Kurultay"],
  },
  agresif: {
    tr: { name: "Agresif", blurb: "Erken tartışma, sert miting. Baskı kartlarını öne al." },
    en: { name: "Attack Line", blurb: "Early debate, hard rallies. Lead with pressure cards." },
    series: ["Kampanya", "Kürsü"],
  },
  savunmaci: {
    tr: { name: "Savunmacı", blurb: "Skandal bekle, set tut, geç aç. Rakibi kendi hatasına bırak." },
    en: { name: "Defensive", blurb: "Hold Sets, wait on scandals, let them overreach." },
    series: ["Skandal", "Anket"],
  },
  kriz: {
    tr: { name: "Kriz Yönetimi", blurb: "Koalisyon, veto, son dakika. Cevap kartları ve esnek hat." },
    en: { name: "Crisis Desk", blurb: "Coalition, veto, last-minute saves. Answers over speeches." },
    series: ["Koalisyon", "Skandal", "Anket"],
  },
};

export const NEIGHBORHOODS = {
  kadikoy: {
    tr: { name: "Kadıköy", blurb: "İskele tarafı. Çayhane konuşur, cadde geç saate kadar açık kalır." },
    en: { name: "Kadıköy", blurb: "Ferry side. Tea houses talk; the avenue stays up late." },
    accent: "#c4a35a",
    aiBias: "patient",
  },
  usküdar: {
    tr: { name: "Üsküdar", blurb: "Sahil sessiz, arka sokak uyanık. Aile masası bozulmaz." },
    en: { name: "Üsküdar", blurb: "Quiet shore, sharp backstreets. The family table holds." },
    accent: "#6a8f9a",
    aiBias: "controlled",
  },
  fatih: {
    tr: { name: "Fatih", blurb: "Çarşı sıkışık, racon kısa kesilir. Erken hamle, net hesap." },
    en: { name: "Fatih", blurb: "Tight bazaar, short racon. Early moves, clean ledgers." },
    accent: "#b5684a",
    aiBias: "aggressive",
  },
  besiktas: {
    tr: { name: "Beşiktaş", blurb: "Meydan kalabalık, tribün hazır. Tempo yüksek, cevap hazır." },
    en: { name: "Beşiktaş", blurb: "Crowded square, terrace ready. High tempo, answers loaded." },
    accent: "#6b7bb8",
    aiBias: "trapper",
  },
  beyoglu: {
    tr: { name: "Beyoğlu", blurb: "Gece lambası, yan masa, dedikodu. Risk ve fırsat aynı kapıdan girer." },
    en: { name: "Beyoğlu", blurb: "Night lamps, side tables, rumor. Risk and luck share a door." },
    accent: "#9a6aa8",
    aiBias: "gambler",
  },
};

export function campaignStyleIds() {
  return Object.keys(CAMPAIGN_STYLES);
}
export function neighborhoodIds() {
  return Object.keys(NEIGHBORHOODS);
}
export function identityLabel(kind, id, lang) {
  const table = kind === "campaign" ? CAMPAIGN_STYLES : NEIGHBORHOODS;
  return table[id]?.[lang === "en" ? "en" : "tr"] || table[id]?.tr || { name: id, blurb: "" };
}
