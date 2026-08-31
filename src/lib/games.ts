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
] as const;

export type Html5Slug = (typeof HTML5_SLUGS)[number];

export function isHtml5Slug(slug: string): slug is Html5Slug {
  return (HTML5_SLUGS as readonly string[]).includes(slug);
}

export const GAMES: CatalogGame[] = [
  {
    slug: "cete-savaslari",
    title: "Çete Savaşları",
    subtitle: "Racon ve sokak.",
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
    slug: "bukucu",
    title: "Son Mahalle Bükücü",
    subtitle: "Semti tutan büker.",
    status: "live",
    href: "/games/bukucu/",
  },
  {
    slug: "labirent",
    title: "Labirent",
    subtitle: "Çıkışı bul.",
    status: "live",
    href: "/oyna/labirent",
  },
  {
    slug: "peg-solitaire",
    title: "Peg Solitaire",
    subtitle: "Çiviyi atla, tek bırak.",
    status: "live",
    href: "/oyna/peg-solitaire",
  },
  {
    slug: "satranc",
    title: "Satranç",
    subtitle: "Tahta, hamle, mat.",
    status: "live",
    href: "/oyna/satranc",
  },
];
