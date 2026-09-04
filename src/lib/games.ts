export type CatalogGame = {
  slug: string;
  title: string;
  subtitle: string;
  status: "live" | "soon";
  href: string | null;
  icon: string;
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
    icon: "cete",
  },
  {
    slug: "hanedan",
    title: "Çete Savaşları: Hanedan",
    subtitle: "Adamlar ölür. Hanedan kalır.",
    status: "live",
    href: "/oyna/hanedan",
    icon: "hanedan",
  },
  {
    slug: "racon",
    title: "Racon Manager",
    subtitle: "Adamlar ölür. İsim kalır.",
    status: "live",
    href: "/oyna/racon",
    icon: "racon",
  },
  {
    slug: "tc-sim",
    title: "TC SIM",
    subtitle: "Bir hayat. Haftalık kararlar, yıllarca süren sonuçlar.",
    status: "live",
    href: "/oyna/tc-sim",
    icon: "tc-sim",
  },
  {
    slug: "bukucu",
    title: "Son Mahalle Bükücü",
    subtitle: "İstanbul tapusu. Semti tutan büker. Para TL.",
    status: "live",
    href: "/games/bukucu/",
    icon: "bukucu",
  },
  {
    slug: "labirent",
    title: "Labirent",
    subtitle: "Kapalı yollar, tek çıkış.",
    status: "live",
    href: "/oyna/labirent",
    icon: "labirent",
  },
  {
    slug: "peg-solitaire",
    title: "Tek Taş",
    subtitle: "Atla, bir tane bırak.",
    status: "live",
    href: "/oyna/peg-solitaire",
    icon: "tek-tas",
  },
  {
    slug: "satranc",
    title: "Satranç",
    subtitle: "Tahta, hamle, şah mat.",
    status: "live",
    href: "/oyna/satranc",
    icon: "satranc",
  },
  {
    slug: "hayat",
    title: "Hayat",
    subtitle: "Bir hayat. Aldığın kararların uzun gölgesi.",
    status: "soon",
    href: null,
    icon: "hayat",
  },
  {
    slug: "apartman",
    title: "Apartman: Apartman Yöneticisi",
    subtitle: "Bir apartman, onlarca insan, bitmeyen meseleler.",
    status: "soon",
    href: null,
    icon: "apartman",
  },
  {
    slug: "kayip-telefon",
    title: "Kayıp Telefon",
    subtitle: "Bir telefon kaybolur. İçindeki hayat ortaya çıkar.",
    status: "soon",
    href: null,
    icon: "kayip-telefon",
  },
  {
    slug: "son-100-gun",
    title: "Son 100 Gün",
    subtitle: "Son yüz gün. Her kararın ağırlığı artıyor.",
    status: "soon",
    href: null,
    icon: "son-100-gun",
  },
  { slug: "tc-sim-devlet", title: "TC SIM: DEVLET", subtitle: "4000 Yıllık Devlet Aklı", status: "soon", href: null, icon: "devlet" },
];
