export type CatalogGame = {
  slug: string;
  title: string;
  subtitle: string;
  status: "live" | "soon";
  href: string | null;
};

export const GAMES: CatalogGame[] = [
  {
    slug: "cete-savaslari",
    title: "Çete Savaşları",
    subtitle: "Racon ve sokak.",
    status: "live",
    href: "/cete-savaslari",
  },
  {
    slug: "yakinda",
    title: "Yakında",
    subtitle: "Yeni oyun eklenecek.",
    status: "soon",
    href: null,
  },
];

// status:"html5" + href:"/games/{slug}/" ileride iframe. Şimdi ekleme.
