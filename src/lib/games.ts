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
  "amiral-batti",
  "racon",
  "tc-sim",
  "apartman",
  "son-100-gun",
  "hayat",
  "kayip-telefon",
  "tc-sim-devlet",
  "son-kasaba",
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
    href: "/games/bukucu/index.html",
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
    slug: "amiral-batti",
    title: "Amiral Battı",
    subtitle: "Izgarada filo. İsabet, ıska, battı.",
    status: "live",
    href: "/oyna/amiral-batti",
    icon: "amiral",
  },
  {
    slug: "hayat",
    title: "Hayat",
    subtitle: "Bir hayat. Aldığın kararların uzun gölgesi.",
    status: "live",
    href: "/oyna/hayat",
    icon: "hayat",
  },
  {
    slug: "apartman",
    title: "Apartman: Apartman Yöneticisi",
    subtitle: "Bir apartman, onlarca insan, bitmeyen meseleler.",
    status: "live",
    href: "/oyna/apartman",
    icon: "apartman",
  },
  {
    slug: "kayip-telefon",
    title: "Kayıp Telefon",
    subtitle: "Bir telefon kaybolur. İçindeki hayat ortaya çıkar.",
    status: "live",
    href: "/oyna/kayip-telefon",
    icon: "kayip-telefon",
  },
  {
    slug: "son-100-gun",
    title: "Son 100 Gün",
    subtitle: "Son yüz gün. Her kararın ağırlığı artıyor.",
    status: "live",
    href: "/oyna/son-100-gun",
    icon: "son-100-gun",
  },
  {
    slug: "tc-sim-devlet",
    title: "TC SIM: DEVLET",
    subtitle: "2002–05 çekirdeği. Devlet aklı, tek masada.",
    status: "live",
    href: "/oyna/tc-sim-devlet",
    icon: "devlet",
  },
  {
    slug: "son-kasaba",
    title: "Son Kasaba",
    subtitle: "Herkes gidiyor. Sen kalıp kasabayı yaşatmaya çalışıyorsun.",
    status: "live",
    href: "/oyna/son-kasaba",
    icon: "son-kasaba",
  },
  {
    slug: "ihtilal",
    title: "İhtilâl",
    subtitle: "Seçim kazanılır. İktidar tutulmaz.",
    status: "soon",
    href: "/ihtilal",
    icon: "ihtilal",
  },
];
