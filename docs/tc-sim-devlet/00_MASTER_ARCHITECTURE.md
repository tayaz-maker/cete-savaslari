# TC SIM: DEVLET — Master Architecture

Bu belge ürün vizyonunu değil **mimariyi** kilitler. Vizyonun kaynağı
`TC_SIM_DEVLET_MASTER.md`'dir ve değiştirilmemiştir. Burada olan: o vizyonu
production-ready bir state/engine mimarisine indirgeyen kararlar.

Bu belge Sprint 0/1'i uygulayacak ajanın (Luna/Sol) tek referans noktasıdır.
Kullanıcıya hiçbir mikro karar için tekrar danışmaya gerek kalmamalıdır.

## 0. Temel ilke — değişmez

> Hükümetleri değil, devleti oynuyorsun. Oyuncu devleti kontrol etmez,
> yönlendirmeye çalışır.

Kod tarafında bu ilkenin karşılığı: **hiçbir oyuncu kararı state'i doğrudan
mutasyona uğratmaz.** Her karar §5'teki politika hattından geçer; hat,
kurumun kabulü/kapasitesi/otonomisini uygulayıp gerçek bir uygulama oranı
üretir. Bu hat atlanırsa oyun "devlet" değil "diktatör simülatörü" olur.

## 1. TC SIM'den miras — ne alınır, ne alınmaz

TC SIM V1 (`public/games/tc-sim/`) kanıtlanmış bir motor deseni bırakır:
saf ES module dosyaları, `state.js` tek kaynak state fabrikası, olay/openCase
yaşam döngüsü, save/load + normalizasyon disiplini, sınırlı (capped)
koleksiyonlar, sıfır gameplay `Math.random`.

| Sınıf | TC SIM'deki somut karşılık | DEVLET'te |
|---|---|---|
| Doğrudan alınır | `SAVE_VERSION`, `validateState`/normalizasyon deseni, `appendCapped` yardımcı deseni, backup/recovery, uzun-koşu test disiplini | Ayrı save key + ayrı `SAVE_VERSION` (bkz. §3) |
| Uyarlanır | Zaman tick'i, koşullu event + `openCases` yaşam döngüsü, flag sistemi, tek-seferlik event, dashboard/inbox, yıl özeti | Aylık tur, brifing, kurum bağlamına uyarlanır (bkz. §4–5) |
| Kavram olarak taşınır | `openCase`, gecikmeli sonuç, memory/history, era ID, NPC yaklaşımı | Dosya/uyuyan-dosya, politika borcu, arşiv, kurumsal hafıza, senaryo ID (bkz. §9–10) |
| Taşınmaz | Oyuncu beden/ilişki, iş/konut/commute, aile NPC içeriği, `public/games/tc-sim/js/*` dosyalarının kendisi | DEVLET kendi `public/games/tc-sim-devlet/js/*` ağacını yazar; TC SIM dosyaları import edilmez, kopyalanmaz |

`TC_SIM_DEVLET_REUSE_PLAN.md` bu tabloyu onaylar; çelişki yok, bu belge onu
somutlaştırır. **Shared engine/paylaşılan paket bugün çıkarılmaz** — iki oyun
birbirinden bağımsız dosya ağaçları olarak kalır; ortak desenler kopyalanır,
import edilmez. Gerekçe: TC SIM hâlâ tek başına deploy edilen bir runtime;
paylaşılan bir modül DEVLET'in bir hatasını TC SIM'e sızdırma riski taşır.

## 2. Repo mimarisi — DEVLET nereye oturur

- **Route:** `/oyna/tc-sim-devlet` — mevcut `src/routes/oyna.$slug.tsx`
  iframe deseni değişmeden kullanılır.
- **Katalog:** `src/lib/games.ts` → `HTML5_SLUGS` dizisine `"tc-sim-devlet"`
  eklenir; `GAMES` içindeki mevcut satır (`status: "soon", href: null`)
  yalnız Sprint 1 gerçekten oynanabilir olduğunda `status: "live"` /
  gerçek `href`'e çevrilir. **Bu görev docs-only olduğu için bu sprint bu
  satırı DEĞİŞTİRMEZ** — erken çevirmek katalogda kırık bir link yaratır,
  ki bu tam olarak "dead button" kuralının portal tarafındaki karşılığıdır.
- **Oyun ağacı:** `public/games/tc-sim-devlet/index.html` +
  `public/games/tc-sim-devlet/js/*.js` + `public/games/tc-sim-devlet/styles.css`
  — TC SIM ile birebir aynı dosya-düzeni konvansiyonu (vanilla ES module,
  framework yok, `?v=N` cache-bust query'si).
- **Testler:** `scripts/tc-sim-devlet-*.test.mjs` — mevcut
  `npm test` komutu zaten `scripts/**/*.test.mjs` glob'unu çalıştırır;
  test runner konfigürasyonu değişmez.
- **Uzun koşu:** `scripts/tc-sim-devlet-longrun.mjs` — TC SIM'in
  `tc-sim-longrun.mjs`'i gibi paylaşılan bir harness dosyası, CLI modlarıyla
  (`node scripts/tc-sim-devlet-longrun.mjs 36`, `120`, `fuzz`, ...).
- **Dokümantasyon:** `docs/tc-sim-devlet/*` (bu klasör).

## 3. Save / versiyon

- `SAVE_VERSION = 1`, TC SIM'in `SAVE_VERSION = 5`'inden tamamen bağımsız.
- Save key: `tc-sim-devlet-save` (+ `tc-sim-devlet-save-backup`), TC SIM'in
  `tc-sim-save` / `tc-sim-save-backup` desenini birebir kopyalar.
- İlk şemadan itibaren normalizasyon fonksiyonu zorunlu: `loadGame` her
  alanı `Number.isFinite`/`Array.isArray`/enum-üyeliği ile doğrular, eksik
  alanı `createNewGame()`'in taze değeriyle doldurur. Sürüm 1'den başlar
  ama "sürüm 1 = doğrulama yok" demek değildir.
- Deterministik ID'ler: `gameId` = `devlet-${seed}-${scenarioId}`;
  openCase/archive/character ID'leri `<tür>-<ay>-<konu>` kalıbında,
  TC SIM'in `depth2-${eventId}-${week}` desenine birebir paralel — aynı
  koşulun aynı ayda iki kez dosya açmasını yapısal olarak engeller.
- `meta.contentVersion` ve `meta.scenarioSnapshotVersion` alanları ilk
  günden vardır (bkz. §8) — geçmiş içerik verisi değiştiğinde eski
  save'lerin hangi tarihsel veri sürümüyle oluştuğu izlenebilir olsun diye.

## 4. Zaman modeli

**Kanonik tur: 1 ay.** Sprint 1 penceresi: **Ocak 2002 – Aralık 2004, 36 ay**
(bkz. `07_SPRINT_1_VERTICAL_SLICE_BRIEF.md`).

Ay içi faz sırası (tek bir `advanceMonth(state)` fonksiyonu):

1. Bekleyen kararların karar penceresi kapanır (oynanmayan slot'lar boşa gider, TC SIM'in haftalık `weekly.used` sıfırlanması gibi).
2. Ekonomi tick'i (bkz. §12) — `actual` makro state güncellenir.
3. Kurum kapasite/otonomi driftleri (bütçe yetersizse capacity yavaşça düşer — deterministik, formüllü).
4. Toplum ısısı güncellenir (ekonomi + açık dosyalar + kurum durumundan türetilir).
5. `processDueOpenCases` — vadesi gelen dosyalar event kuyruğuna düşer (TC SIM `events.js`'teki fonksiyonla aynı isim/rol).
6. Ay sonu: `reported` state, `actual`'dan yeniden türetilir; arşive ay özeti yazılır.
7. Yıl sonu (Aralık): `closeYear` eşdeğeri — yıllık karne, DNA/refleks/entropi türetilmiş metrikleri hesaplanır (bkz. §11).
8. Yeni ayın event'i aktive edilir.

**Kriz alt-turu (günlük kriz modu):** Sprint 1'de YOK. Sprint 2+ kapsamı.
**Hızlı ileri sarma (sakin dönem otomatik geçiş):** Sprint 1'de YOK — tek
tıkla "bir ay ilerlet" yeterli; QoL olarak Sprint 2+'ya bırakılır.
**Kararlar arası ne olur:** Oyuncu ayın kararlarını bitirmeden ay
ilerlemez (TC SIM'in "önce açık olayı sonuçlandır" kısıtına paralel);
karar slotu TC SIM'in `WEEKLY_ACTIVITY_LIMIT` desenine benzer şekilde
`MONTHLY_DECISION_LIMIT` ile sınırlıdır (Sprint 1 önerisi: 2 — bir atama/
politika + bir gündelik brifing eylemi).

## 5. Event / openCase yaşam döngüsü

`02_EVENT_CHAIN_CONTRACT.md`'de tam kontrat var. Özet zincir:

```
STATE → CONDITION → SCHEDULE(openCase) → PLAYER KNOWLEDGE GATE
      → EVENT ACTIVATION → CHOICE → RESOLUTION
      → IMPLEMENTATION-RATE PIPELINE (§6) → ACTUAL CONSEQUENCE
      → REPORTED CONSEQUENCE (ayrı türetim) → DELAYED FOLLOW-UP(openCase)
      → CLEANUP/EXPIRY → ARCHIVE/MEMORY
```

TC SIM'den kritik ders: **bir resolver'ı doğrudan çağırmak, o event'in
gerçek oyunda hiç ulaşılamaz olmadığının kanıtı değildir.** 18–35 Core
kapanışında tam olarak bu hata bulunmuş ve düzeltilmişti (bkz.
`04_TEST_AND_RELEASE_CONTRACT.md` §2). DEVLET testleri baştan bu kurala
tabidir.

## 6. Gerçeklik / rapor / bilgi modeli

Üç ayrı, karıştırılmayan katman — dördüncü katman (kamu/medya algısı)
Sprint 1'de yok:

- **`actual`** — motorun hesapladığı zemin gerçeği. UI'da **asla ham
  gösterilmez.**
- **`reported`** — kurumların resmî olarak bildirdiği sayı.
  `reported = deriveReported(actual, institution.professionalism,
  institution.politicalAlignment, delayMonths)` — **deterministik bir
  fonksiyon**, zar değil. Düşük profesyonellik/yüksek siyasi hizalanma →
  daha büyük ve daha kalıcı sapma; yüksek profesyonellik → sapma küçük ve
  hızla düzelir.
- **`known`** — oyuncunun o an inandığı değer + `confidence` (0–100).
  Yeni bir rapor geldiğinde `known`, `reported`'a doğru kayar; yalnız
  başarılı bir istihbarat/denetim aksiyonu `known`'u `actual`'a
  yaklaştırabilir. `known` hiçbir zaman `actual`'a otomatik eşitlenmez.

UI kuralı (bkz. `07`): oynanabilir ekranlar yalnız `known` (+ varsa
`reported` karşılaştırması) gösterir. `actual` sadece dev/debug modunda
görünür olabilir, oyuncu build'inde asla.

## 7. Politika uygulama hattı

Tek, yeniden kullanılabilir fonksiyon — her politika kendi motorunu yazmaz:

```
applyPolicyPipeline(state, decision) →
  1. responsibleInstitutions(decision)            // hangi kurum(lar)
  2. acceptance = f(institution.politicalAlignment, decision.alignmentDelta)
  3. capacityFactor = institution.capacity / 100
  4. localFactor = regionOrCohortImplementationModifier(decision)  // taşra
  5. networkInterference = 1.0                    // Sprint 1: no-op, Sprint 3'te gerçek değer
  6. actualRate = clamp(acceptance × capacityFactor × localFactor × networkInterference, 0, 100)
  7. schedule actual consequence (immediate + delayed openCase'ler)
  8. reportedRate = deriveReported(actualRate, institution)   // §6 ile aynı türetim ailesi
  9. archive.record({decision, actualRate, reportedRate, institutionsInvolved})
```

Adım 5, Sprint 3'e kadar sabit `1.0` döner — bu, ileride ağlar sistemi
eklendiğinde pipeline'ın yeniden yazılmasını değil, tek bir fonksiyonun
gövdesinin doldurulmasını gerektirir.

## 8. Tarihsel içerik / güncel veri

- Her event/karakter-tohum/senaryo kaydı `provenance: "T" | "A" | "S"`
  taşır; opsiyonel `certainty: "confirmed" | "contested" | "claim"` ve
  `sourceNote` (serbest metin, UI'da normalde gizli). Tam kontrat:
  `03_HISTORICAL_DATA_PROVENANCE.md`.
- **"Günümüz" senaryosu Sprint 1 kapsamında değildir** (sabit 2002–2005
  penceresi kullanılıyor). İleride eklenirse: canlı API YOK, yalnız
  `meta.scenarioSnapshotVersion` ile damgalanmış statik veri anlık
  görüntüsü; save, o anlık görüntünün sürümünü saklar ki eski bir save
  yeniden açıldığında farklı (daha güncel) bir veri kümesiyle sessizce
  karışmasın.
- **Gerçek kişiler / tartışmalı tarih:** bkz. `03_HISTORICAL_DATA_PROVENANCE.md`
  §"Gerçek kişi kuralı" — bu, tek başına en yüksek hukuki/itibar riski
  taşıyan karardır ve orada ayrıntılı gerekçelendirilmiştir.

## 9. Kurum modeli — indirgenmiş

Ana belgenin 9 alanlı kurum şeması (§14) burada **5 saklanan alana**
indirgenir; her biri en az iki gerçek tüketiciyle:

| Alan | Aralık | Tüketici 1 | Tüketici 2 |
|---|---|---|---|
| `capacity` | 0–100 | Uygulama hattı adım 3 | Kriz-yükü/backlog büyüme hızı |
| `professionalism` | 0–100 | Rapor sapma büyüklüğü (§6) | Yolsuzluk riski (**türetilir**, saklanmaz) |
| `politicalAlignment` | -100…100 | Uygulama hattı adım 2 (kabul) | Atama-sadakat maliyeti |
| `autonomy` | 0–100 | `politicalAlignment`'ın ne kadar önemli olduğunu ölçekler | Atama sonucu şiddeti (yüksek otonomili kurumun başını değiştirmek daha büyük bir olay) |
| `budget` | ekonomiye bağlı ay değeri | `capacity` drift formülü | Ekonomi bütçe defterinin bir kalemi |

**Düşürülenler ve nereye gittikleri:** "itibar" → toplumun o kuruma dair
`known`/arşiv okumalarından **türetilir**, ayrı skaler değildir.
"Yolsuzluk riski" → `f(professionalism, autonomy, budget/capacity oranı)`,
türetilir. "Kurumsal hafıza" → zaten `institutionHistory` (bounded array)
olarak var, ayrı skaler gerekmez. "Personel kalitesi" → `professionalism`
ile aynı ekseni ölçer, Sprint 1'de ayrı tutulmaz.

**Sprint 1'in 5 kurumu:** Maliye, Merkez Bankası, İçişleri/Mülkiye, Yargı,
**Silahlı Kuvvetler (Genelkurmay)**. Ana belgenin önerdiği beşinci
seçenek ("Bürokrasi/merkezi idare") yerine Silahlı Kuvvetler seçildi:
2002–2005'te ordu-sivil ilişkisi (AB uyum paketleriyle MGK'nin anayasal
ağırlığının azaltılması) somut, tarihsel olarak belgeli ve **gerçek
uygulama oranı** mekaniğini kanıtlamak için en güçlü içerik — merkezi
bürokrasi kurumu soyut kalır ve zaten Maliye/İçişleri onun işlevini
büyük ölçüde kapsar. Diyanet, Medya, Üniversite, Belediyeler Sprint 1
dışında (bkz. `05_SPRINT_MAP.md`).

## 10. Karakter modeli — indirgenmiş

Görünür (oyuncu-bilir) alanlar 6'ya indirgenir (ana belgenin 11 alanı
yerine): `office`, `administrativeSkill`, `economicSkill`, `loyalty`
(devlete/kuruma, faksiyona değil — Sprint 1'de faksiyon sistemi yok),
`ambition`, `publicStanding`. Retorik/hukuk/kriz-yönetimi gibi eksenler
Sprint 1'de `administrativeSkill`'in bir görev-tipi modifikatörü olarak
okunur, ayrı stat değildir; gerekirse Sprint 5 (Karakterler/Kurumlar
genişlemesi) bunları ayırabilir.

Gizli alanlar: `networkLinks` (bounded, bkz. §11), `secrets` (bounded
dossier-şekli veri — Sprint 1'de yalnız *veri şekli* var, sızdırma/şantaj
mekaniği yok), `provenance` (T/A/S). `careerHistory` bounded array, TC
SIM'in `addCareerHistory` deseniyle birebir.

**10–20 karakter tavanı.** T/A/S oranı 2002 için ≈ **%22 tarihsel /
%78 prosedürel** (ana belgenin 1990→%30, 2010→%15 eğrisi üzerinde
enterpolasyon). Gerçek-kişi kısıtı: bkz. `03_HISTORICAL_DATA_PROVENANCE.md`.

## 11. DNA / Refleks / Entropi / Politika Borcu — türetilmiş, saklanmayan

Bu, mimarinin en önemli tek kararıdır: **DNA, refleks, entropi ve politika
borcu Sprint 1'de ayrı mutable state alanları olarak SAKLANMAZ.** Bunun
yerine dördü de `archive` + `implementationLog` üzerinde çalışan saf
fonksiyonlardır — girdi aynıysa çıktı aynıdır, ekstra state yok.

```
deriveStateDNA(archive)        → eksen başına ağırlıklı ortalama (örn. "merkeziyetçilik" = merkezi-kararların oranı)
deriveReflexes(archive)        → aynı çözüm tipinin ardışık tekrar sayımı (TC SIM'in throttle deseni fikren aynı)
deriveEntropy(institutions[])  → çakışan yetki/kapatılmamış geçici düzenleme sayımı
derivePolicyDebt(archive, topic) → bir konu etiketinin çözülmeden geçen ay sayısı × ağırlık
```

Bu, görev talimatının kendi kuralını ("gelecek için ölü persisted alan
ekleme; genişleme noktası tasarla, kullanılmayan state ekleme") doğrudan
karşılar. Sprint 1 bu fonksiyonları **çağırmayabilir** (ekranda
göstermeyebilir) ama `archive` şeması onları destekleyecek alanları
(karar tipi, hizalanma deltası, konu etiketi) baştan taşır — bu yüzden
Sprint 2'de "DNA ekle" demek yeni bir migration değil, yeni bir okuma
fonksiyonu demektir.

## 12. Ekonomi — Sprint 1 minimum modeli

Saklanan makro state: `inflation`, `interestRate`, `unemployment`,
`budgetBalance`, `growthIndex`, `fxIndex` (hepsi tek sayı, tam bir döviz
piyasası değil, soyutlanmış endeks). Aylık güncelleme sırası:

1. Bu ay uygulanan politika kaldıraçları (`interestRate` değişikliği vb.) uygulanır.
2. Nedensel formüller (somut, TC SIM'in `getCostOfLivingIndex` gibi tek satırlık deterministik fonksiyonları örnek alınır):
   - `creditPressure = max(0, interestRate - baseline) × sensitivity`
   - `unemploymentDelta = creditPressure × businessSensitivity − growthIndex × jobCreationFactor`
   - `inflationDelta = -interestRate × disinflationFactor + budgetDeficitRatio × fiscalPressureFactor`
   - Yani **aynı anda** faiz artışı işsizliği yukarı, enflasyonu aşağı iter — ana belgenin §23 örneğiyle birebir.
3. Hane-kohort aktarımı: her kohortun `economicPressure`'ı `unemploymentDelta` ve `inflationDelta`'nın kohort-ağırlıklı payını alır (bkz. §13).
4. `budgetBalance` gelir/gider kararlarından güncellenir (IMF programı bağlamı: Sprint 1 senaryosu başlangıçta negatif bütçe dengesiyle açılır — 2002'nin gerçek koşulu).
5. `reported` ekonomi sayıları `actual`'dan §6'daki genel türetimle hesaplanır.

Şok (deprem, bankacılık krizi vb.) ve politika kaldıraçları (faiz, kamu
harcaması, vergi) config-driven küçük bir tablo olarak tanımlanır —
her biri yeni kod değil, tabloya yeni satır.

## 13. Toplum / hane modeli — sınırlı temsili kohortlar

**50.000 hane REDDEDİLDİ.** Sprint 1: **3 bölge-tipi × 3 gelir bandı = 9
temsili kohort** (İstanbul/Metropol, Anadolu-Kentsel, Anadolu-Kırsal ×
alt/orta/üst gelir). Her kohort: `populationShare` (durağan/yavaş
kayan), `economicPressure`, `stateTrust`, `expectation`, `heatContribution`.
Bu, Victoria tarzı toplu kohort simülasyonudur, FM tarzı mikro-hane değil;
tarayıcıda 107 yıllık bir kampanyayı bile hızlı ve deterministik tutar.
Tam `hanehalkı` (§20, 50.000 temsili hane) mimari olarak **çok daha ileri
bir faz** için not edilir, Sprint haritasına dahi girmez (bkz. `05`).

## 14. Bölge modeli — ölçeklenebilir, 81 il derin değil

Sprint 1: **4 temsili bölge** (İstanbul, Ankara, "Doğu/GAP temsili
bölgesi", "Karadeniz/muhafazakâr kırsal temsili bölgesi"), her biri statik
bir doku vektörü (`sanayi/tarım/kamuİstihdamı/muhafazakârlık` ağırlıkları,
0-1 arası) + `localHeat` + `localTrust` taşır. Şema `regions: []`
dizisidir — id ile anahtarlanır; 81 ile genişletmek yeni satır eklemektir,
mimari değişiklik değil. Tam 81 il derinliği açıkça sonraki faz (bkz. `05`).

## 15. Ağ modeli — sınırlı graf

`state.networks` (global, cap ~80 kayıt) + karakter başına
`character.networkLinks` (cap ~6). Düğüm tipleri: `character`,
`institution`. Kenar tipi kapalı bir enum: `hiyerarşi`, `sadakat`,
`favor`, `aile-dostluk`. Yalnız **gerçekten bir event/kararda kullanılan**
bağlantı persist edilir; ambiyans/flavor bağlantıları okuma anında
karakter rolünden türetilir. Bu, "all-to-all simülasyon yok" kuralını
somut olarak karşılar — N² tarama hiçbir yerde yoktur.

## 16. Arşiv

Bounded array (cap ~80, TC SIM `yearlyHistory` cap'iyle aynı büyüklük
mertebesi). Her kayıt dört-ses modelini baştan destekler (alanlar
mevcut, doldurulması opsiyonel):

```
{ id, month, decisionId, institutionsInvolved: [],
  resmiSes: string | null, koridorSesi: string | null,
  halkSesi: string | null, arsivSesi: string | null,
  actualOutcomeRef, reportedOutcome, laterReassessmentRef: null }
```

`laterReassessmentRef`, bir openCase yıllar sonra bu kaydı yeniden
açtığında doldurulur — Kelebekler ekranının (ileri faz) veri temelidir,
ama alan bugün var.

## 17. Performans / sınırlar — bkz. `04_TEST_AND_RELEASE_CONTRACT.md` §4

## 18. UI / üretim

- **Route:** `/oyna/tc-sim-devlet` (bkz. §2).
- **Duyarlı strateji:** TC SIM'in mevcut breakpoint deseni
  (1060/820/540/360px + `prefers-reduced-motion`) doğrudan miras alınır;
  masaüstü-sidebar varsayımı yok, hover-only aksiyon yok.
- **Cache/sürüm stratejisi:** `public/sw.js`'teki `isTcSimAsset` kuralı
  genelleştirilir — `/games/tc-sim-devlet/` yolu da **network-first**
  olarak işlenir (TC SIM'in modül-grafiği "eski cache karışması" dersinden
  sonra zaten düzeltilmiş, kanıtlanmış strateji; eski `?v=` sabitine
  güvenen yöntem değil). `?v=N` query'si yalnız okunabilirlik/debug
  içindir, tazelik garantisi service worker kuralından gelir.
- **Yaratıcı kredi:** TC SIM'deki birebir kalıp kullanılır:
  `<footer class="game-footer">© 2026 TarikLab. Tüm hakları saklıdır.<br>Oyun tasarımı ve özgün içerik: Tarık.</footer>`
  artı DEVLET'e özgü ek cümle: *"Tarihsel olaylar kamuya mal olmuş
  bilgidir; yalnız oyun tasarımı, kurgusal karakterler ve özgün içerik
  telif kapsamındadır."* — bu, §7'nin "tarihsel gerçekler üzerinde
  mülkiyet iddiası yok" kuralını görünür kılar.
- **Üretim kabulü:** `04_TEST_AND_RELEASE_CONTRACT.md`.

## 19. AI sınırı

Sprint 0/1 **hiçbir çalışma zamanı AI/LLM bağımlılığı gerektirmez.**
Simülasyon tamamen deterministik/kural tabanlıdır (§6, §7, §12).
AI'nin gelecekteki rolü yalnız düz metin üretimi (gazete/rapor/koridor
diyaloğu) olacaktır ve motor sonucunu **asla** değiştirmeyecektir — motor
sayıyı hesaplar, AI (varsa) yalnız cümleye çevirir. Bu ayrım
`02_EVENT_CHAIN_CONTRACT.md`'de event şemasının neresinde AI'nin
(opsiyonel, sonradan eklenebilir) devreye girebileceği net biçimde
işaretlenmiştir.
