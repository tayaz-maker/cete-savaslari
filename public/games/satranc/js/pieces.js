/**
 * Satranç — TLab Edition · özgün taş seti.
 *
 * TarikLab için sıfırdan çizilmiş vektör taşlar. Üçüncü taraf bir setin
 * türevi değildir. Tasarım dili: klasik silüet okunabilirliği (taç, mitra,
 * at başı, burç, piyon) korunur; ama biçimler ortak bir geometrik sistemden
 * kurulur — her taş aynı kaide ve aynı yaka bandını paylaşır, gövdeler düz
 * yüzeyli ve köşeli tutulur. Amaç 40 pikselde bile net okunan, damga
 * hissi veren yalın bir set.
 *
 * Tüm yollar 100×100 kutuya çizilmiştir.
 */

/** Bütün taşların paylaştığı kaide — setin ortak imzası. */
const BASE = "M24 76h52l5 12H19z";
/** Gövdeyi kaideye bağlayan yaka bandı. */
const COLLAR = "M32 67h36l3 9H29z";

/**
 * Her taş, üst üste çizilen yol parçalarından oluşur. Parçalar ayrı
 * tutulur ki dolgu/kontur ayrımı CSS tarafında yapılabilsin.
 */
export const PIECE_SHAPES = Object.freeze({
  p: {
    label: "piyon",
    paths: [
      "M50 18a12 12 0 1 1 0 24 12 12 0 0 1 0-24z",
      "M40 44h20l-3 7H43z",
      "M42 53h16l4 14H38z",
      COLLAR,
      BASE,
    ],
  },
  r: {
    label: "kale",
    paths: [
      "M29 16h10v8h7v-8h8v8h7v-8h10v18H29z",
      "M35 36h30l2 12H33z",
      "M36 50h28l2 17H34z",
      COLLAR,
      BASE,
    ],
  },
  n: {
    label: "at",
    paths: [
      // At başı: köşeli, tek parça profil. Alın–burun–çene hattı düz
      // kesimlerle kurulur; yumuşak eğri yerine kırıklı silüet.
      "M38 67c0-14 2-22 8-30l-5-9 8-2 4-8c14 5 22 18 22 34v15z",
      "M44 30l6-3 2 5-6 2z",
      COLLAR,
      BASE,
    ],
  },
  b: {
    label: "fil",
    paths: [
      "M50 12l4 6-4 4-4-4z",
      "M50 24c9 8 15 17 15 26 0 10-7 16-15 16s-15-6-15-16c0-9 6-18 15-26z",
      "M43 40h14v4H43z",
      "M41 68h18l1-4H40z",
      COLLAR,
      BASE,
    ],
  },
  q: {
    label: "vezir",
    paths: [
      "M28 26l6 20h32l6-20-9 12-5-16-8 13-8-13-5 16z",
      "M26 22a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm48 0a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM50 14a4 4 0 1 1 0 8 4 4 0 0 1 0-8z",
      "M34 48h32l-2 8H36z",
      "M36 58h28l2 9H34z",
      COLLAR,
      BASE,
    ],
  },
  k: {
    label: "şah",
    paths: [
      "M47 8h6v6h6v6h-6v7h-6v-7h-6v-6h6z",
      "M34 34c0-8 8-11 16-5 8-6 16-3 16 5l-3 22H37z",
      "M37 60h26l1 7H36z",
      COLLAR,
      BASE,
    ],
  },
});

export const PIECE_NAMES = Object.freeze({
  p: "Piyon",
  n: "At",
  b: "Fil",
  r: "Kale",
  q: "Vezir",
  k: "Şah",
});

/**
 * Bir taşı SVG parçası olarak üretir. Renk, CSS sınıfıyla verilir; böylece
 * tema değiştiğinde taşlar yeniden çizilmez.
 */
export function pieceSvg(type, color, { size = 100 } = {}) {
  const shape = PIECE_SHAPES[type];
  if (!shape) return "";
  const paths = shape.paths
    .map((d) => `<path d="${d}" />`)
    .join("");
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" class="piece piece-${color}" role="img" aria-label="${color === "w" ? "beyaz" : "siyah"} ${shape.label}" focusable="false">${paths}</svg>`;
}

export const pieceLabel = (type, color) =>
  `${color === "w" ? "Beyaz" : "Siyah"} ${PIECE_NAMES[type] ?? type}`;
