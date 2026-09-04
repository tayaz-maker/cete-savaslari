export const NAVIGATION_ITEMS = [
  { label: "ANA SAYFA", view: "dashboard" },
  { label: "BEN", view: null },
  { label: "TAKVİM", view: null },
  { label: "PARA", view: null },
  { label: "İŞ", view: "career" },
  { label: "EĞİTİM", view: "education" },
  { label: "KİŞİLER", view: null },
  { label: "AİLE / İLİŞKİLER", view: null },
  { label: "EV", view: "home" },
  { label: "BEDEN", view: null },
  { label: "GEÇMİŞ", view: null },
  { label: "YIL DOSYASI", view: null },
];

export const getNavigationTarget = (view) =>
  NAVIGATION_ITEMS.some((item) => item.view === view) ? view : null;
