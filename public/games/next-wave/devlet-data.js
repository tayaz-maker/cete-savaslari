/**
 * TC SIM: DEVLET — period packs + 2002–2005 playable content.
 * Provenance: T = textbook/official series, A = archive/secondary, S = social memory.
 * Forum/Ekşi/X are perception texture only, never treated as fact.
 */
export const PERIODS = {
  "1923": {
    id: "1923",
    name: "1923 — Kuruluş",
    playable: false,
    theme: "Savaş sonrası kapasite ve yeni kurum iskeleti.",
    economy: { inflation: 20, treasury: 40, unemployment: 18, externalDep: 55 },
    institutions: [
      { id: "maliye", name: "Maliye", capacity: 32, autonomy: 40, note: "Dar gelir, yeni vergi idaresi." },
      { id: "merkez", name: "Emisyon / banka çekirdeği", capacity: 28, autonomy: 35, note: "Merkez Bankası henüz 1930." },
      { id: "mulkiye", name: "Dahiliye", capacity: 45, autonomy: 50, note: "Merkez-taşra inşası." },
      { id: "yargi", name: "Adliye", capacity: 30, autonomy: 40, note: "Yeni kanun seti." },
      { id: "ordu", name: "Ordu", capacity: 58, autonomy: 70, note: "Kurucu ağırlık." },
    ],
    reflexes: ["centralization", "state-building", "security-first"],
    events: [
      { id: "e23-1", title: "Nüfus ve iskân baskısı", text: "Mübadil ve muhacir dalgası taşra idaresini zorlar.", provenance: "T", confidence: "high" },
      { id: "e23-2", title: "Vergi idaresi ince", text: "Toplanamayan gelir, kâğıt üzerindeki bütçeyi şişirir.", provenance: "A", confidence: "med" },
    ],
    society: "Kır ağırlıklı, okuryazarlık düşük, rejim henüz yerleşiyor.",
  },
  "1950": {
    id: "1950",
    name: "1950 — Çok partili hayat",
    playable: false,
    theme: "Seçilmiş hükümet ile bürokratik süreklilik gerilimi.",
    economy: { inflation: 8, treasury: 55, unemployment: 10, externalDep: 48 },
    institutions: [
      { id: "maliye", name: "Maliye", capacity: 48, autonomy: 45 },
      { id: "merkez", name: "Merkez Bankası", capacity: 44, autonomy: 50 },
      { id: "mulkiye", name: "İçişleri", capacity: 55, autonomy: 48 },
      { id: "yargi", name: "Yargı", capacity: 46, autonomy: 52 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 70, autonomy: 72 },
    ],
    reflexes: ["patronage", "rural-vote", "alliance-external"],
    events: [
      { id: "e50-1", title: "Kır seçmeni ve yol", text: "Köy hizmeti talebi bütçeyi yatırımlara çeker.", provenance: "T", confidence: "high" },
      { id: "e50-2", title: "Dış ittifak baskısı", text: "İttifak yükümlülüğü iç öncelikleri iter.", provenance: "A", confidence: "med" },
    ],
    society: "Kırdan kente ilk büyük kayış; radyo kamuoyu.",
  },
  "1980": {
    id: "1980",
    name: "1980 — Kavşak",
    playable: false,
    theme: "Güvenlik, istikrar ve ekonomik açılım aynı masada.",
    economy: { inflation: 80, treasury: 28, unemployment: 14, externalDep: 70 },
    institutions: [
      { id: "maliye", name: "Maliye", capacity: 42, autonomy: 35 },
      { id: "merkez", name: "Merkez Bankası", capacity: 40, autonomy: 38 },
      { id: "mulkiye", name: "İçişleri", capacity: 60, autonomy: 40 },
      { id: "yargi", name: "Yargı", capacity: 36, autonomy: 30 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 78, autonomy: 80 },
    ],
    reflexes: ["security-first", "fiscal-shock", "centralization"],
    events: [
      { id: "e80-1", title: "Fiyatlar ve kuyruk", text: "Enflasyon haneye günlük sızar. Rapor gecikir.", provenance: "T", confidence: "high" },
      { id: "e80-2", title: "Anayasal reset", text: "Kurum yetkileri yeniden çizilir; uygulama yavaşlar.", provenance: "A", confidence: "med", contested: true },
    ],
    society: "Kutuplaşma yorgunluğu, güvenlik dili, sonra tüketim açılımı.",
  },
  "2002": {
    id: "2002",
    name: "2002–2005 — Yeniden yapılanma",
    playable: true,
    theme: "Kriz mirası, istikrar programı, AB müzakere eşiği.",
    economy: { inflation: 35, treasury: 100, unemployment: 10, externalDep: 62 },
    institutions: [
      { id: "maliye", name: "Maliye", capacity: 60, autonomy: 55, note: "Faiz dışı fazla hedefi." },
      { id: "merkez", name: "Merkez Bankası", capacity: 55, autonomy: 62, note: "Örtük enflasyon hedeflemesine geçiş." },
      { id: "mulkiye", name: "İçişleri / Mülkiye", capacity: 50, autonomy: 48 },
      { id: "yargi", name: "Yargı", capacity: 50, autonomy: 52 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 65, autonomy: 70 },
    ],
    reflexes: ["fiscal-orthodoxy", "reformism", "bureaucratic-caution"],
    society: "Kriz belleği taze; AB beklentisi yüksek; Anadolu sermayesi yükseliyor.",
  },
  gunumuz: {
    id: "gunumuz",
    name: "Günümüz",
    playable: false,
    theme: "Yüksek enflasyon belleği, kurumsal güven tartışması, bölgesel sıkışma.",
    economy: { inflation: 45, treasury: 70, unemployment: 11, externalDep: 58 },
    institutions: [
      { id: "maliye", name: "Hazine ve Maliye", capacity: 52, autonomy: 40 },
      { id: "merkez", name: "Merkez Bankası", capacity: 48, autonomy: 42 },
      { id: "mulkiye", name: "İçişleri", capacity: 58, autonomy: 45 },
      { id: "yargi", name: "Yargı", capacity: 46, autonomy: 40 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 68, autonomy: 60 },
    ],
    reflexes: ["crisis-management", "centralization", "populist-relief"],
    events: [
      { id: "eg-1", title: "Fiyat belirsizliği", text: "Hane planı kısa vadeye iner; resmi seri gecikir.", provenance: "S", confidence: "med", perception: "Piyasa ile açıklama metni ayrışır." },
    ],
    society: "Kentli orta sınıf baskısı, göç, sosyal medya tempo.",
  },
  alternatif: {
    id: "alternatif",
    name: "Alternatif Türkiye",
    playable: false,
    theme: "Aynı kurumlar, sapmış yörünge — karşıolgusal paket.",
    economy: { inflation: 18, treasury: 80, unemployment: 9, externalDep: 50 },
    institutions: [
      { id: "maliye", name: "Maliye", capacity: 58, autonomy: 60 },
      { id: "merkez", name: "Merkez Bankası", capacity: 64, autonomy: 72 },
      { id: "mulkiye", name: "İçişleri", capacity: 52, autonomy: 55 },
      { id: "yargi", name: "Yargı", capacity: 60, autonomy: 66 },
      { id: "ordu", name: "Silahlı Kuvvetler", capacity: 60, autonomy: 58 },
    ],
    reflexes: ["reformism", "fiscal-orthodoxy", "decentralization-pressure"],
    events: [
      { id: "ea-1", title: "Erken çapa", text: "Kriz sonrası çapa daha erken oturursa toplumsal rıza başka dağılır.", provenance: "A", confidence: "low", contested: true },
    ],
    society: "Karşıolgusal: aynı nesiller, farklı kurumsal alışkanlık.",
  },
};

export const POLICIES_2002 = [
  { id: "imf-sba", name: "İstikrar çıpasi", inst: "maliye", intent: "Faiz dışı fazla ve harcama disiplini.", cost: 8, inflation: -4, trust: -3, capacityNeed: 50 },
  { id: "inflation-target", name: "Örtük enflasyon hedefi", inst: "merkez", intent: "Beklenti çapası; kısa vadede büyüme yavaşlar.", cost: 4, inflation: -3, trust: 2, capacityNeed: 55 },
  { id: "bank-recap", name: "Bankacılık onarımı", inst: "maliye", intent: "Bilinçli maliyet, kredi kanalını açar.", cost: 14, inflation: 1, trust: 1, capacityNeed: 52 },
  { id: "eu-align", name: "Uyum paketi", inst: "yargi", intent: "Müzakere eşiği için mevzuat. Uygulama ayrı iş.", cost: 6, inflation: 0, trust: 4, capacityNeed: 48 },
  { id: "public-admin", name: "Kamu idaresi sadeleştirme", inst: "mulkiye", intent: "Kadrolar direnir; tempo düşer.", cost: 5, inflation: 0, trust: -1, capacityNeed: 45 },
  { id: "social-relief", name: "Hane rahatlatma", inst: "maliye", intent: "Kısa rıza, orta vadede disiplin riski.", cost: 10, inflation: 3, trust: 6, capacityNeed: 40 },
  { id: "security-posture", name: "İç güvenlik duruşu", inst: "ordu", intent: "Kapasite kayması, sivil reform temposu yavaşlar.", cost: 7, inflation: 0, trust: -2, capacityNeed: 60 },
  { id: "tax-admin", name: "Vergi idaresi sıkılaştırma", inst: "maliye", intent: "Kayıt dışına baskı; şikayet artar.", cost: 3, inflation: -1, trust: -4, capacityNeed: 50 },
];

export const EVENTS_2002 = [
  { id: "e02-imf", year: 2002, month: 2, title: "Program gözden geçirme", text: "Dış finansman şartlı. Raporlanan faiz dışı fazla sahadaki tahsilattan şişkin durabilir.", provenance: "T", confidence: "high", domain: "fiscal" },
  { id: "e02-banks", year: 2002, month: 6, title: "TMSF portföyü", text: "El konulan banka artıkları hâlâ Hazine satırında.", provenance: "A", confidence: "high", domain: "banking" },
  { id: "e02-cpi", year: 2002, month: 11, title: "TÜFE sert iner, gıda inmez", text: "Resmi seri düşer; pazar file si si aynı hissedilmez.", provenance: "S", confidence: "med", domain: "prices", perception: "Hanede 'enflasyon bitti' cümlesi erken." },
  { id: "e03-target", year: 2003, month: 1, title: "Örtük hedef yılı", text: "Merkez sözle çapa kurar. Siyasi faiz baskısı kapıda durur.", provenance: "T", confidence: "high", domain: "monetary" },
  { id: "e03-budget", year: 2003, month: 4, title: "Bütçe gerilimi", text: "Yatırım talebi ile faiz dışı fazla aynı kalemi yer.", provenance: "A", confidence: "med", domain: "fiscal" },
  { id: "e03-admin", year: 2003, month: 8, title: "Mülki kadro kayması", text: "Valiliklerde tempo değişir; uygulama illere göre ayrışır.", provenance: "A", confidence: "med", domain: "admin" },
  { id: "e04-copenhagen", year: 2004, month: 12, title: "Müzakere eşiği", text: "Aralık 2004: siyasi kriter raporu kapıyı aralar. Mevzuat ≠ sahadaki mahkeme.", provenance: "T", confidence: "high", domain: "eu", contested: false },
  { id: "e04-credit", year: 2004, month: 5, title: "Kredi genişlemesi", text: "İç talep ısınır. Bankacılık onarımı işe yaramış görünebilir — kırılganlık ötelenir.", provenance: "A", confidence: "med", domain: "banking" },
  { id: "e05-talks", year: 2005, month: 10, title: "Müzakereler açılır", text: "Ekim 2005 takvimi. Fasıl ilerlemesi iç reform kapasitesine bağlı.", provenance: "T", confidence: "high", domain: "eu" },
  { id: "e05-impl", year: 2005, month: 3, title: "Uygulama açığı raporu", text: "Kâğıt üzerindeki uyum, taşra biriminde takılır. Bilinen ≠ fiili.", provenance: "A", confidence: "med", domain: "admin" },
  { id: "e03-unemp", year: 2003, month: 10, title: "İşsizlik yapışkan", text: "Büyüme döner, istihdam gecikir. Rapor iyimser kalabilir.", provenance: "A", confidence: "med", domain: "labor" },
  { id: "e04-region", year: 2004, month: 9, title: "Bölgesel tempo farkı", text: "Marmara kredi yer, Doğu kamu işi bekler. Ulusal ortalama gizler.", provenance: "A", confidence: "med", domain: "region" },
];

export const COHORTS = [
  { id: "urban", name: "Kent haneleri" },
  { id: "rural", name: "Kır haneleri" },
  { id: "sme", name: "Anadolu KOBİ" },
  { id: "wage", name: "Ücretli kesim" },
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

export const GRAND_HOOKS = {
  span: "1923-2030",
  note: "Dönem paketleri grand-campaign için tohum; motor bu geçişte 2002–2005 oynanır.",
};
