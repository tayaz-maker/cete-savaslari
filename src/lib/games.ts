export type CatalogGame = {
  slug: string;
  title: string;
  subtitle: string;
  status: "live" | "soon";
  href: string | null;
};

export const HTML5_SLUGS = [
  "labirent",
  "sapan",
  "ipi-kes",
  "bilardo",
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
    slug: "labirent",
    title: "Labirent",
    subtitle: "Çıkışı bul.",
    status: "live",
    href: "/oyna/labirent",
  },
  {
    slug: "sapan",
    title: "Sapan",
    subtitle: "Çek, bırak, yık.",
    status: "live",
    href: "/oyna/sapan",
  },
  {
    slug: "ipi-kes",
    title: "İpi Kes",
    subtitle: "İpi kes, hedefe ulaştır.",
    status: "live",
    href: "/oyna/ipi-kes",
  },
  {
    slug: "bilardo",
    title: "Bilardo",
    subtitle: "Sekiz top.",
    status: "live",
    href: "/oyna/bilardo",
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
