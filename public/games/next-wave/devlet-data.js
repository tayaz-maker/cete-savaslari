/**
 * TC SIM: DEVLET — playable period packs.
 * Frozen Günümüz baseline: 2024-01 (deterministic; not live-updated).
 * Provenance: T textbook/official series, A archive/secondary, S social memory.
 * Forum / Ekşi / X = perception texture only.
 */
export const GUNUMUZ_BASELINE = { year: 2024, month: 1, note: "Frozen January 2024 start. Not live-scraped." };

export const DNA_AXES = [
  "centralization",
  "localAutonomy",
  "security",
  "paternalism",
  "market",
  "socialState",
  "institutionalism",
  "negotiation",
  "openness",
  "nationalEconomy",
];

export const DOCTRINES = [
  { id: "muasir", name: "Muasır Medeniyet", prefer: { openness: 8, institutionalism: 6, socialState: 2 } },
  { id: "bolgesel", name: "Bölgesel Güç", prefer: { security: 8, centralization: 4, openness: -2 } },
  { id: "sanayi", name: "Sanayi Devi", prefer: { nationalEconomy: 8, market: 4, socialState: 2 } },
  { id: "demokratik", name: "Demokratik Konsolidasyon", prefer: { institutionalism: 8, negotiation: 6, security: -2 } },
  { id: "sosyal", name: "Sosyal Devlet", prefer: { socialState: 8, paternalism: 4, market: -3 } },
  { id: "bagimsiz", name: "Tam Bağımsızlık", prefer: { nationalEconomy: 7, openness: -4, security: 4 } },
  { id: "istikrar", name: "İstikrar Devleti", prefer: { security: 6, centralization: 6, institutionalism: 2 } },
];

export const ALT_PRESETS = [
  { id: "federal", name: "Federal iskelet", dna: { localAutonomy: 72, centralization: 28 }, form: "Bölgesel-Devlet" },
  { id: "alliance-east", name: "Doğu ağırlıklı ittifak", foreign: { ru: 70, us: 35, eu: 40 }, dna: { openness: 35 } },
  { id: "alliance-west", name: "Batı ittifakı sıkı", foreign: { us: 78, eu: 74, ru: 28 }, dna: { openness: 62 } },
  { id: "socialist", name: "Plan ağırlıklı rejim", dna: { market: 22, socialState: 78, paternalism: 70 }, form: "Parti-Devlet" },
  { id: "symbolic-monarchy", name: "Sembolik monarşi", form: "Bürokrasi-Devlet", dna: { institutionalism: 60, negotiation: 40 } },
  { id: "narrow-border", name: "Dar sınır / yüksek dış bağımlılık", economy: { externalDep: 78 }, dna: { security: 68 } },
];

export const PERIOD_BANDS = [
  { era: "1923", from: 1923, to: 1949 },
  { era: "1950", from: 1950, to: 1979 },
  { era: "1980", from: 1980, to: 2001 },
  { era: "2002", from: 2002, to: 2015 },
  { era: "gunumuz", from: 2016, to: 2030 },
];

const BASE_INST = (rows) => rows.map((x) => ({ autonomy: 50, professionalism: 50, ...x }));

export const PERIODS = {
  "1923": {
    id: "1923",
    name: "1923 — Kuruluş",
    playable: true,
    start: { year: 1923, month: 10 },
    theme: "Savaş sonrası kapasite ve yeni kurum iskeleti.",
    flavor: "daktilo",
    channels: ["telgraf", "resmi gazete", "kaymakam raporu"],
    economy: { inflation: 22, treasury: 38, unemployment: 16, fx: 40, debt: 72, industry: 22, agri: 70, energy: 18, externalDep: 58 },
    institutions: BASE_INST([
      { id: "maliye", name: "Maliye", capacity: 32, autonomy: 38 },
      { id: "merkez", name: "Emisyon / banka çekirdeği", capacity: 26, autonomy: 32 },
      { id: "mulkiye", name: "Dahiliye", capacity: 44, autonomy: 48 },
      { id: "yargi", name: "Adliye", capacity: 30, autonomy: 40 },
      { id: "ordu", name: "Ordu", capacity: 60, autonomy: 72 },
      { id: "maarif", name: "Maarif", capacity: 28, autonomy: 42 },
      { id: "belediye", name: "Belediye / nahiye", capacity: 24, autonomy: 30 },
    ]),
    dna: { centralization: 68, localAutonomy: 28, security: 62, paternalism: 58, market: 30, socialState: 35, institutionalism: 40, negotiation: 32, openness: 38, nationalEconomy: 70 },
    form: "Kışla-Devlet",
    entropy: 28,
    infoQuality: 32,
    heat: 36,
    reflexes: ["state-building", "centralization", "security-first"],
    society: "Kır ağırlıklı, okuryazarlık düşük, rejim henüz yerleşiyor.",
  },
  "1950": {
    id: "1950",
    name: "1950 — Çok partili hayat",
    playable: true,
    start: { year: 1950, month: 5 },
    theme: "Seçilmiş hükümet ile bürokratik süreklilik gerilimi.",
    flavor: "radyo",
    channels: ["radyo", "gazete", "kahvehane"],
    economy: { inflation: 8, treasury: 55, unemployment: 10, fx: 48, debt: 50, industry: 34, agri: 62, energy: 28, externalDep: 48 },
    institutions: BASE_INST([
      { id: "maliye", name: "Maliye", capacity: 48, autonomy: 44 },
      { id: "merkez", name: "Merkez Bankası", capacity: 44, autonomy: 50 },
      { id: "mulkiye", name: "İçişleri", capacity: 55, autonomy: 46 },
      { id: "yargi", name: "Yargı", capacity: 46, autonomy: 52 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 70, autonomy: 74 },
      { id: "maarif", name: "Maarif", capacity: 42, autonomy: 48 },
      { id: "belediye", name: "Belediye", capacity: 40, autonomy: 44 },
    ]),
    dna: { centralization: 58, localAutonomy: 40, security: 55, paternalism: 52, market: 48, socialState: 38, institutionalism: 48, negotiation: 50, openness: 52, nationalEconomy: 55 },
    form: "Bürokrasi-Devlet",
    entropy: 34,
    infoQuality: 44,
    heat: 40,
    reflexes: ["rural-vote", "alliance-external", "patronage"],
    society: "Kırdan kente kayış; radyo kamuoyu; NATO eşiği.",
  },
  "1980": {
    id: "1980",
    name: "1980 — Kavşak",
    playable: true,
    start: { year: 1980, month: 1 },
    theme: "Güvenlik, istikrar ve ekonomik açılım aynı masada.",
    flavor: "klasor",
    channels: ["resmi yazı", "TRT", "sendika fısıltısı"],
    economy: { inflation: 82, treasury: 26, unemployment: 15, fx: 28, debt: 68, industry: 40, agri: 42, energy: 36, externalDep: 72 },
    institutions: BASE_INST([
      { id: "maliye", name: "Maliye", capacity: 42, autonomy: 34 },
      { id: "merkez", name: "Merkez Bankası", capacity: 40, autonomy: 36 },
      { id: "mulkiye", name: "İçişleri", capacity: 62, autonomy: 38 },
      { id: "yargi", name: "Yargı", capacity: 34, autonomy: 28 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 78, autonomy: 82 },
      { id: "maarif", name: "YÖK / üniversite", capacity: 36, autonomy: 30 },
      { id: "belediye", name: "Belediye", capacity: 38, autonomy: 32 },
    ]),
    dna: { centralization: 78, localAutonomy: 22, security: 82, paternalism: 60, market: 42, socialState: 30, institutionalism: 36, negotiation: 18, openness: 34, nationalEconomy: 48 },
    form: "Kışla-Devlet",
    entropy: 48,
    infoQuality: 28,
    heat: 72,
    reflexes: ["security-first", "fiscal-shock", "centralization"],
    society: "Kutuplaşma yorgunluğu; fiyat kuyruğu; sonra tüketim açılımı.",
  },
  "2002": {
    id: "2002",
    name: "2002–2005 — Yeniden yapılanma",
    playable: true,
    start: { year: 2002, month: 1 },
    theme: "Kriz mirası, istikrar programı, AB müzakere eşiği.",
    flavor: "tablo",
    channels: ["gazete", "TV", "SMS", "AB raporu"],
    economy: { inflation: 35, treasury: 100, unemployment: 10, fx: 52, debt: 74, industry: 48, agri: 28, energy: 44, externalDep: 62 },
    institutions: BASE_INST([
      { id: "maliye", name: "Maliye", capacity: 60, autonomy: 55 },
      { id: "merkez", name: "Merkez Bankası", capacity: 55, autonomy: 62 },
      { id: "mulkiye", name: "İçişleri / Mülkiye", capacity: 50, autonomy: 48 },
      { id: "yargi", name: "Yargı", capacity: 50, autonomy: 52 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 65, autonomy: 70 },
      { id: "maarif", name: "Milli Eğitim / YÖK", capacity: 48, autonomy: 46 },
      { id: "belediye", name: "Belediye / imar", capacity: 46, autonomy: 44 },
      { id: "istikhbarat", name: "İstihbarat koordinasyonu", capacity: 52, autonomy: 58 },
    ]),
    dna: { centralization: 55, localAutonomy: 42, security: 52, paternalism: 48, market: 58, socialState: 44, institutionalism: 56, negotiation: 48, openness: 58, nationalEconomy: 50 },
    form: "Bürokrasi-Devlet",
    entropy: 40,
    infoQuality: 58,
    heat: 38,
    reflexes: ["fiscal-orthodoxy", "reformism", "bureaucratic-caution"],
    society: "Kriz belleği taze; AB beklentisi yüksek; Anadolu sermayesi yükseliyor.",
  },
  gunumuz: {
    id: "gunumuz",
    name: "Günümüz",
    playable: true,
    start: GUNUMUZ_BASELINE,
    theme: "Çoklu kriz yönetimi; resmi seri ile sokak fiyatı ayrışabilir.",
    flavor: "dashboard",
    channels: ["sosyal ağ", "resmi istatistik", "e-imza", "yerel WhatsApp"],
    economy: { inflation: 52, treasury: 64, unemployment: 10, fx: 36, debt: 62, industry: 46, agri: 22, energy: 48, externalDep: 60 },
    institutions: BASE_INST([
      { id: "maliye", name: "Hazine ve Maliye", capacity: 52, autonomy: 40 },
      { id: "merkez", name: "Merkez Bankası", capacity: 48, autonomy: 42 },
      { id: "mulkiye", name: "İçişleri", capacity: 58, autonomy: 44 },
      { id: "yargi", name: "Yargı", capacity: 46, autonomy: 40 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 68, autonomy: 60 },
      { id: "maarif", name: "Milli Eğitim", capacity: 50, autonomy: 42 },
      { id: "belediye", name: "Belediye / AFAD hattı", capacity: 54, autonomy: 46 },
      { id: "istikhbarat", name: "İstihbarat koordinasyonu", capacity: 58, autonomy: 55 },
    ]),
    dna: { centralization: 70, localAutonomy: 34, security: 64, paternalism: 62, market: 44, socialState: 48, institutionalism: 42, negotiation: 36, openness: 40, nationalEconomy: 52 },
    form: "Popülist-Devlet",
    entropy: 58,
    infoQuality: 46,
    heat: 56,
    reflexes: ["crisis-management", "centralization", "populist-relief"],
    society: "Konut, afet onarımı, genç işsizliği ve tempo aynı anda masada.",
  },
  alternatif: {
    id: "alternatif",
    name: "Alternatif Türkiye",
    playable: true,
    start: { year: 2002, month: 1 },
    theme: "Aynı motor, sapmış başlangıç parametreleri.",
    flavor: "tablo",
    channels: ["gazete", "radyo", "arşiv notu"],
    economy: { inflation: 18, treasury: 80, unemployment: 9, fx: 58, debt: 48, industry: 52, agri: 30, energy: 46, externalDep: 50 },
    institutions: BASE_INST([
      { id: "maliye", name: "Maliye", capacity: 58, autonomy: 60 },
      { id: "merkez", name: "Merkez Bankası", capacity: 64, autonomy: 72 },
      { id: "mulkiye", name: "İçişleri", capacity: 52, autonomy: 55 },
      { id: "yargi", name: "Yargı", capacity: 60, autonomy: 66 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 60, autonomy: 58 },
      { id: "maarif", name: "Eğitim", capacity: 56, autonomy: 58 },
      { id: "belediye", name: "Yerel idare", capacity: 50, autonomy: 62 },
    ]),
    dna: { centralization: 45, localAutonomy: 58, security: 48, paternalism: 40, market: 62, socialState: 50, institutionalism: 64, negotiation: 60, openness: 62, nationalEconomy: 48 },
    form: "Bürokrasi-Devlet",
    entropy: 32,
    infoQuality: 62,
    heat: 30,
    reflexes: ["reformism", "fiscal-orthodoxy", "decentralization-pressure"],
    society: "Karşıolgusal: aynı nesiller, farklı kurumsal alışkanlık.",
  },
};

export const POLICIES = {
  "1923": [
    { id: "iskan", name: "İskân ve nüfus", inst: "mulkiye", intent: "Mübadil yerleştirme idareyi şişirir.", cost: 8, inflation: 2, trust: 2, capacityNeed: 40, dna: { paternalism: 2, centralization: 1 } },
    { id: "vergi-idare", name: "Vergi idaresi kur", inst: "maliye", intent: "Kâğıt bütçe ile tahsilat ayrılır.", cost: 5, inflation: -1, trust: -2, capacityNeed: 36, dna: { institutionalism: 3 } },
    { id: "maarif-sefer", name: "Maarif seferberliği", inst: "maarif", intent: "Uzun vadeli elit havuzu; kısa vadede kasa iner.", cost: 6, inflation: 1, trust: 3, capacityNeed: 30, dna: { socialState: 2, openness: 2 } },
    { id: "kanun-set", name: "Kanun seti aktarımı", inst: "yargi", intent: "Metin hızlanır, uygulama taşrada takılır.", cost: 4, inflation: 0, trust: 1, capacityNeed: 34, dna: { institutionalism: 3 } },
    { id: "merkez-tasra", name: "Merkez-taşra hattı", inst: "mulkiye", intent: "Telgraf ve kaymakam raporu sinir sistemidir.", cost: 5, inflation: 0, trust: 0, capacityNeed: 40, dna: { centralization: 3, localAutonomy: -1 } },
    { id: "emisyon-ihtiyat", name: "Emisyon ihtiyatı", inst: "merkez", intent: "Kağıt para refleksini sınırlar.", cost: 3, inflation: -3, trust: -1, capacityNeed: 28, dna: { nationalEconomy: 2 } },
  ],
  "1950": [
    { id: "koy-hizmet", name: "Köy hizmeti / yol", inst: "belediye", intent: "Kır rızası; bütçe yatırımı yer.", cost: 9, inflation: 2, trust: 5, capacityNeed: 42, dna: { paternalism: 2, localAutonomy: 2 } },
    { id: "dis-ittifak", name: "İttifak yükümlülüğü", inst: "ordu", intent: "Dış güvenlik iç önceliği iter.", cost: 7, inflation: 1, trust: 1, capacityNeed: 60, dna: { openness: 3, security: 2 } },
    { id: "acilim-ithalat", name: "İthalat açılımı", inst: "maliye", intent: "Tüketim rahatlar, cari açık şişer.", cost: 6, inflation: -1, trust: 2, capacityNeed: 46, dna: { market: 3, nationalEconomy: -2 } },
    { id: "buro-sureklilik", name: "Bürokratik süreklilik", inst: "mulkiye", intent: "Hükümet değişir, dosya kalır.", cost: 3, inflation: 0, trust: -1, capacityNeed: 48, dna: { institutionalism: 3 } },
    { id: "radyo-hat", name: "Radyo kamu hattı", inst: "mulkiye", intent: "Resmî ses yayılır; koridor başka konuşur.", cost: 2, inflation: 0, trust: 2, capacityNeed: 36, dna: { negotiation: 1 } },
    { id: "tarim-kredi", name: "Tarım kredisi", inst: "maliye", intent: "Kır gelirini öne çeker, tahsilat gecikir.", cost: 8, inflation: 2, trust: 3, capacityNeed: 44, dna: { socialState: 2 } },
  ],
  "1980": [
    { id: "fiyat-sok", name: "Fiyat düzeltmesi", inst: "maliye", intent: "Kuyruk iner, hane şoku çıkar.", cost: 6, inflation: -8, trust: -6, capacityNeed: 44, dna: { market: 3, paternalism: -2 } },
    { id: "anayasa-reset", name: "Kurumsal reset", inst: "yargi", intent: "Yetki çizgisi değişir; uygulama yavaşlar.", cost: 5, inflation: 0, trust: -2, capacityNeed: 36, dna: { centralization: 3, institutionalism: 1 }, contested: true },
    { id: "guvenlik-duruş", name: "İç güvenlik duruşu", inst: "ordu", intent: "Isı düşer, müzakere kapanır.", cost: 7, inflation: 0, trust: -4, capacityNeed: 70, dna: { security: 4, negotiation: -3 } },
    { id: "uni-cati", name: "Üniversite çatısı", inst: "maarif", intent: "Merkezi müfredat; kampüs özerkliği iner.", cost: 4, inflation: 0, trust: -1, capacityNeed: 34, dna: { centralization: 2 } },
    { id: "ihracat-acilim", name: "İhracat açılımı", inst: "maliye", intent: "Döviz arar; ücret baskısı sürer.", cost: 6, inflation: 2, trust: 1, capacityNeed: 42, dna: { market: 3, openness: 2 } },
    { id: "belediye-imar", name: "İmar yetkisi", inst: "belediye", intent: "Yerel rant ve konut stoku büyür.", cost: 5, inflation: 1, trust: 2, capacityNeed: 38, dna: { localAutonomy: 2, market: 1 } },
  ],
  "2002": [
    { id: "imf-sba", name: "İstikrar çıpasi", inst: "maliye", intent: "Faiz dışı fazla ve harcama disiplini.", cost: 8, inflation: -4, trust: -3, capacityNeed: 50, dna: { institutionalism: 2, market: 2 } },
    { id: "inflation-target", name: "Örtük enflasyon hedefi", inst: "merkez", intent: "Beklenti çapası; kısa vadede büyüme yavaşlar.", cost: 4, inflation: -3, trust: 2, capacityNeed: 55, dna: { institutionalism: 3 } },
    { id: "bank-recap", name: "Bankacılık onarımı", inst: "maliye", intent: "Bilinçli maliyet, kredi kanalını açar.", cost: 14, inflation: 1, trust: 1, capacityNeed: 52, dna: { market: 2 } },
    { id: "eu-align", name: "Uyum paketi", inst: "yargi", intent: "Müzakere eşiği için mevzuat. Uygulama ayrı iş.", cost: 6, inflation: 0, trust: 4, capacityNeed: 48, dna: { openness: 3, institutionalism: 2 } },
    { id: "public-admin", name: "Kamu idaresi sadeleştirme", inst: "mulkiye", intent: "Kadrolar direnir; tempo düşer.", cost: 5, inflation: 0, trust: -1, capacityNeed: 45, dna: { institutionalism: 2, entropy: -4 } },
    { id: "social-relief", name: "Hane rahatlatma", inst: "maliye", intent: "Kısa rıza, orta vadede disiplin riski.", cost: 10, inflation: 3, trust: 6, capacityNeed: 40, dna: { paternalism: 2, socialState: 2 } },
    { id: "security-posture", name: "İç güvenlik duruşu", inst: "ordu", intent: "Kapasite kayması, sivil reform temposu yavaşlar.", cost: 7, inflation: 0, trust: -2, capacityNeed: 60, dna: { security: 3 } },
    { id: "tax-admin", name: "Vergi idaresi sıkılaştırma", inst: "maliye", intent: "Kayıt dışına baskı; şikayet artar.", cost: 3, inflation: -1, trust: -4, capacityNeed: 50, dna: { nationalEconomy: 2 } },
  ],
  gunumuz: [
    { id: "deprem-pay", name: "Afet onarım payı", inst: "belediye", intent: "Kısa rıza, uzun kasa; kalite denetlenmezse hayalet dosya açılır.", cost: 12, inflation: 2, trust: 3, capacityNeed: 50, dna: { paternalism: 2, socialState: 2 } },
    { id: "konut-arz", name: "Konut arzı", inst: "belediye", intent: "Arz konuşulur, tapu ve imar ayrı iş.", cost: 9, inflation: 1, trust: 2, capacityNeed: 48, dna: { market: 2 } },
    { id: "faiz-sinyal", name: "Faiz sinyali", inst: "merkez", intent: "Beklenti çapası; siyasi maliyet ayrı satır.", cost: 3, inflation: -4, trust: -2, capacityNeed: 50, dna: { institutionalism: 3 } },
    { id: "goc-idare", name: "Göç idaresi temposu", inst: "mulkiye", intent: "Yerel ısı ile resmi kapasite ayrışır.", cost: 6, inflation: 0, trust: -1, capacityNeed: 52, dna: { security: 2, negotiation: 1 } },
    { id: "enerji-denge", name: "Enerji faturası", inst: "maliye", intent: "Hane rahatlar, dış bağımlılık durur.", cost: 8, inflation: -1, trust: 3, capacityNeed: 46, dna: { paternalism: 2 } },
    { id: "bilgi-kalite", name: "İstatistik şeffaflığı", inst: "maliye", intent: "Rapor güveni artar; siyasi maliyet çıkar.", cost: 2, inflation: 0, trust: 1, capacityNeed: 44, dna: { institutionalism: 3, openness: 2 } },
  ],
  alternatif: [
    { id: "erken-capa", name: "Erken çapa", inst: "merkez", intent: "Kriz sonrası çapa erken oturursa rıza başka dağılır.", cost: 5, inflation: -3, trust: 1, capacityNeed: 58, dna: { institutionalism: 3 } },
    { id: "yerel-pay", name: "Yerel pay anayasası", inst: "belediye", intent: "Merkez zayıflar, uygulama illere yayılır.", cost: 6, inflation: 0, trust: 2, capacityNeed: 50, dna: { localAutonomy: 4, centralization: -3 } },
    { id: "yargi-omu", name: "Yargı özerkliği", inst: "yargi", intent: "Dosya yavaşlar, güven uzun vadede artabilir.", cost: 4, inflation: 0, trust: 2, capacityNeed: 56, dna: { institutionalism: 3 } },
    { id: "sinir-ticaret", name: "Sınır ticareti rejimi", inst: "maliye", intent: "Dış bağımlılık sapması.", cost: 5, inflation: 1, trust: 0, capacityNeed: 48, dna: { openness: 2 } },
    { id: "plan-sanayi", name: "Planlı sanayi koridoru", inst: "maliye", intent: "Kapasite seçilir, piyasa homurdanır.", cost: 8, inflation: 1, trust: -1, capacityNeed: 54, dna: { nationalEconomy: 3, market: -2 } },
  ],
};

export const POLICIES_2002 = POLICIES["2002"];

export const EVENTS = {
  "1923": [
    { id: "e23-iskan", month: 11, title: "İskân kervanı", text: "Mübadil kafile taşra hanesini doldurur. Telgraf gecikir.", provenance: "T", confidence: "high", domain: "admin", voices: { resmi: "İskân planı yürürlükte.", koridor: "Yatak yok, un yok.", halk: "Defterde yerimiz yazılmış, odada yok.", arsiv: "Sayılar sonradan düzeltilir." } },
    { id: "e23-vergi", month: 3, title: "Aşar tartışması", text: "Kâğıt gelir sahada toplanmaz.", provenance: "A", confidence: "med", domain: "fiscal" },
    { id: "e23-maarif", month: 9, title: "Mektep kadrosu", text: "Öğretmen yokluğu raporlanmaz, sınıf açılmış görünür.", provenance: "A", confidence: "med", domain: "education" },
    { id: "e23-tasra", month: 6, title: "Kaymakam raporu kayıp", text: "Sinir sistemi kopuk: merkez iyimser, kaza sessiz.", provenance: "S", confidence: "med", domain: "info" },
  ],
  "1950": [
    { id: "e50-secim", month: 5, title: "Sandık sonrası kadro", text: "Hükümet değişir, dosya kalır. Valilik temposu kayar.", provenance: "T", confidence: "high", domain: "admin" },
    { id: "e50-nato", month: 2, title: "İttifak takvimi", text: "Dış yükümlülük iç yatırımı iter.", provenance: "T", confidence: "high", domain: "foreign" },
    { id: "e50-yol", month: 8, title: "Köy yolu talebi", text: "Rıza kırsalda, kasa merkezde.", provenance: "A", confidence: "med", domain: "region" },
    { id: "e50-radyo", month: 12, title: "Radyo saati", text: "Resmî ses akşam yayını; kahvehane başka yorumlar.", provenance: "S", confidence: "med", domain: "media" },
  ],
  "1980": [
    { id: "e80-fiyat", month: 1, title: "Ocak fiyat şoku", text: "Kuyruk haneye iner. Rapor bir ay gecikir.", provenance: "T", confidence: "high", domain: "prices" },
    { id: "e80-reset", month: 9, title: "Kurumsal reset dosyası", text: "Yetki çizgisi değişir. Contest: kapsam ve gerekçe arşivde sisli.", provenance: "A", confidence: "med", domain: "admin", contested: true },
    { id: "e80-doviz", month: 4, title: "Döviz kuyruğu", text: "Resmî kur ile serbest farkı raporlanmaz.", provenance: "A", confidence: "med", domain: "fx" },
    { id: "e80-kampus", month: 10, title: "Kampüs tansiyonu", text: "Isı yüksek; resmi dil sakin.", provenance: "S", confidence: "med", domain: "heat", contested: true },
  ],
  "2002": [
    { id: "e02-imf", year: 2002, month: 2, title: "Program gözden geçirme", text: "Dış finansman şartlı. Raporlanan faiz dışı fazla sahadaki tahsilattan şişkin durabilir.", provenance: "T", confidence: "high", domain: "fiscal" },
    { id: "e02-banks", year: 2002, month: 6, title: "TMSF portföyü", text: "El konulan banka artıkları hâlâ Hazine satırında.", provenance: "A", confidence: "high", domain: "banking" },
    { id: "e02-cpi", year: 2002, month: 11, title: "TÜFE sert iner, gıda inmez", text: "Resmi seri düşer; pazar file si si aynı hissedilmez.", provenance: "S", confidence: "med", domain: "prices" },
    { id: "e03-target", year: 2003, month: 1, title: "Örtük hedef yılı", text: "Merkez sözle çapa kurar. Siyasi faiz baskısı kapıda durur.", provenance: "T", confidence: "high", domain: "monetary" },
    { id: "e03-budget", year: 2003, month: 4, title: "Bütçe gerilimi", text: "Yatırım talebi ile faiz dışı fazla aynı kalemi yer.", provenance: "A", confidence: "med", domain: "fiscal" },
    { id: "e03-admin", year: 2003, month: 8, title: "Mülki kadro kayması", text: "Valiliklerde tempo değişir; uygulama illere göre ayrışır.", provenance: "A", confidence: "med", domain: "admin" },
    { id: "e04-copenhagen", year: 2004, month: 12, title: "Müzakere eşiği", text: "Aralık 2004: siyasi kriter raporu kapıyı aralar. Mevzuat ≠ sahadaki mahkeme.", provenance: "T", confidence: "high", domain: "eu" },
    { id: "e04-credit", year: 2004, month: 5, title: "Kredi genişlemesi", text: "İç talep ısınır. Kırılganlık ötelenir.", provenance: "A", confidence: "med", domain: "banking" },
    { id: "e05-talks", year: 2005, month: 10, title: "Müzakereler açılır", text: "Ekim 2005 takvimi. Fasıl ilerlemesi iç kapasiteye bağlı.", provenance: "T", confidence: "high", domain: "eu" },
    { id: "e05-impl", year: 2005, month: 3, title: "Uygulama açığı raporu", text: "Kâğıt üzerindeki uyum, taşra biriminde takılır.", provenance: "A", confidence: "med", domain: "admin" },
    { id: "e03-unemp", year: 2003, month: 10, title: "İşsizlik yapışkan", text: "Büyüme döner, istihdam gecikir.", provenance: "A", confidence: "med", domain: "labor" },
    { id: "e04-region", year: 2004, month: 9, title: "Bölgesel tempo farkı", text: "Marmara kredi yer, Doğu kamu işi bekler.", provenance: "A", confidence: "med", domain: "region" },
  ],
  gunumuz: [
    { id: "eg-kira", month: 3, title: "Kira yenileme dalgası", text: "Hane planı bir yıla sığmaz. Resmi ortalama gizler.", provenance: "S", confidence: "med", domain: "housing" },
    { id: "eg-afet", month: 2, title: "Afet onarım dosyası", text: "Pay aktarılır; kalite denetimi ayrı satır.", provenance: "A", confidence: "med", domain: "disaster" },
    { id: "eg-veri", month: 7, title: "Veri takvimi kaydı", text: "Seri gecikir. Piyasa kendi enflasyonunu konuşur.", provenance: "S", confidence: "med", domain: "info" },
    { id: "eg-enerji", month: 10, title: "Enerji tarife gerilimi", text: "Hane faturası siyaseti taşır.", provenance: "A", confidence: "med", domain: "energy" },
  ],
  alternatif: [
    { id: "ea-erken", month: 4, title: "Erken çapa denemesi", text: "Aynı kriz, farklı refleks. Contest: karşıolgusal.", provenance: "A", confidence: "low", domain: "monetary", contested: true },
    { id: "ea-yerel", month: 9, title: "Yerel pay çatışması", text: "Merkez ile il rızası ayrışır.", provenance: "S", confidence: "low", domain: "admin" },
  ],
};

export const EVENTS_2002 = EVENTS["2002"];

export const COHORTS = [
  { id: "urban", name: "Kent haneleri" },
  { id: "rural", name: "Kır haneleri" },
  { id: "sme", name: "Anadolu KOBİ" },
  { id: "wage", name: "Ücretli kesim" },
  { id: "youth", name: "Genç işsiz / ilk iş" },
  { id: "retiree", name: "Emekli hane" },
];

export const REGIONS = [
  { id: "marmara", name: "Marmara", implMod: 1.08 },
  { id: "ic-anadolu", name: "İç Anadolu", implMod: 1.0 },
  { id: "ege", name: "Ege", implMod: 1.04 },
  { id: "karadeniz", name: "Karadeniz", implMod: 0.96 },
  { id: "akdeniz", name: "Akdeniz", implMod: 0.98 },
  { id: "dogu", name: "Doğu", implMod: 0.86 },
  { id: "guneydogu", name: "Güneydoğu", implMod: 0.84 },
];

export const NETWORKS = [
  { id: "contractor", name: "Yüklenici halkası", pressure: 12 },
  { id: "public-bank", name: "Kamu bankası hattı", pressure: 10 },
  { id: "local-media", name: "Yerel yayın", pressure: 8 },
];

export const FOREIGN_AXES = ["us", "nato", "eu", "ru", "ir", "gulf", "gr", "cy"];

export const GRAND_HOOKS = {
  span: "1923-2030",
  // 1923-10 → 2030-12 inclusive is 1286 monthly turns; the old 1284 was two
  // short of the span this same block documents, and it is shown to the player.
  months: 1286,
  note: "1923 Ekim → 2030 Aralık. Hedefsiz veya doktrinli.",
};

export const DEBT_DOMAINS = ["quake", "education", "pension", "housing", "energy", "water", "migration", "infra", "legal", "region"];
