export type CatalogGame = {
  slug: string;
  title: string;
  subtitle: string;
  status: "live" | "soon";
  href: string | null;
};

export const HTML5_SLUGS = [
  "hanedan",
  "labirent",
  "peg-solitaire",
  "satranc",
  "racon",
  "tc-sim",
] as const;

export type Html5Slug = (typeof HTML5_SLUGS)[number];

export function isHtml5Slug(slug: string): slug is Html5Slug {
  return (HTML5_SLUGS as readonly string[]).includes(slug);
}

export const GAMES: CatalogGame[] = [
  {
    slug: "cete-savaslari",
    title: "Çete Savaşları",
    subtitle: "Racon, semt, nakit TL.",
    status: "live",
    href: "/cete-savaslari",
  },
  {
    slug: "hanedan",
    title: "Çete Savaşları: Hanedan",
    subtitle: "Adamlar ölür. Hanedan kalır.",
    status: "live",
    href: "/oyna/hanedan",
  },
  {
    slug: "racon",
    title: "Racon Manager",
    subtitle: "Adamlar ölür. İsim kalır.",
    status: "live",
    href: "/oyna/racon",
  },
  {
    slug: "tc-sim",
    title: "TC SIM",
    subtitle: "Bir hayat. Haftalık kararlar, yıllarca süren sonuçlar.",
    status: "live",
    href: "/oyna/tc-sim",
  },
  {
    slug: "bukucu",
    title: "Son Mahalle Bükücü",
    subtitle: "İstanbul tapusu. Semti tutan büker. Para TL.",
    status: "live",
    href: "/games/bukucu/",
  },
  {
    slug: "labirent",
    title: "Labirent",
    subtitle: "Kapalı yollar, tek çıkış.",
    status: "live",
    href: "/oyna/labirent",
  },
  {
    slug: "peg-solitaire",
    title: "Tek Taş",
    subtitle: "Atla, bir tane bırak.",
    status: "live",
    href: "/oyna/peg-solitaire",
  },
  {
    slug: "satranc",
    title: "Satranç",
    subtitle: "Tahta, hamle, şah mat.",
    status: "live",
    href: "/oyna/satranc",
  },
];
