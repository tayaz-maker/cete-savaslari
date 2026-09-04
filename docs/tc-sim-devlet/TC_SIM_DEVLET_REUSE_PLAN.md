# TC SIM: DEVLET — TC SIM Yeniden Kullanım Matrisi

Kaynak: sertleştirilmiş TC SIM (`claude/grok-game-screen-design-8fa30d`, `496d4a8`).
Aşağıdaki bütün iddialar **gerçek koda bakılarak** doğrulanmıştır.

**Temel ilke (ADR-05):** bugün ortak motor çıkarılmaz. Kanıtlanmış küçük parçalar
**kopyalanıp uyarlanır**; iki oyun ayrı runtime'da yaşar. Ortaklaştırma, ikinci ürün gerçek
kodda olgunlaştıktan sonra tekrar değerlendirilir.

## Sınıflar

- **KAVRAM** — fikir alınır, kod alınmaz.
- **DESEN** — yapı/akış birebir taklit edilir, kod yeniden yazılır.
- **KOD UYARLA** — TC SIM'deki fonksiyon kopyalanıp DEVLET'e uyarlanır (adı/alanları değişir).
- **ALMA** — TC SIM'e özgüdür, DEVLET'e taşınmaz.

---

## Matris

| TC SIM bileşeni (gerçek)                                             | DEVLET karşılığı                                       | Sınıf              | Not                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `save.js` → `SAVE_KEY` / `BACKUP_KEY`                                | `tc-sim-devlet-save` / `-backup`                       | **KOD UYARLA**     | Anahtar isimleri **mutlaka** farklı (ADR-03). Yapı aynı.                                              |
| `save.js` → `migrateState()` sürüm dallanması                        | `migrateState()` + `migrateV1()` …                     | **KOD UYARLA**     | **En değerli ders:** damga yazmayan dal bütün kayıtları öldürür. İlk günden zincir + guard testi.     |
| `state.js` → `normalizeEducationCareer()` deseni                     | `normalizeDevletState()`                               | **DESEN**          | Her migration dalından sonra **tek yerde** normalize, sonra doğrula.                                  |
| `state.js` → `validateState()` / `assertValidState()`                | Aynı ikili                                             | **KOD UYARLA**     | Hata listesi döndürme biçimi aynen alınır; alanlar DEVLET'e göre yazılır.                             |
| `save.js` → `saveGame` / `loadGame` / yedek-kurtarma                 | Aynı akış                                              | **KOD UYARLA**     | Yaz-önce-doğrula, bozuksa yedek, yedek de bozuksa güvenli yeni oyun. Kanıtlanmış.                     |
| `state.js` → `appendCapped(list, item, limit)`                       | Aynı yardımcı                                          | **KOD UYARLA**     | Beş satır; kopyala. Sınırlı büyümenin temeli.                                                         |
| `state.js` → `LIMITS` sabiti                                         | DEVLET `LIMITS`                                        | **DESEN**          | Tavanlar ARCHITECTURE §9'da.                                                                          |
| `state.js` → `clamp()`                                               | Aynı                                                   | **KOD UYARLA**     | Gösterge ve kurum statları için.                                                                      |
| `state.js` → `nextRandom()` / `meta.rngState` (xorshift)             | Aynı                                                   | **KOD UYARLA**     | Deterministik jitter ve rapor sapması bunun üstüne kurulur (ADR-04).                                  |
| `time.js` → `advanceWeek()` tek atomik tick                          | `advanceMonth()`                                       | **DESEN**          | Tek giriş noktası, sonunda `assertValidState()`. Birim hafta → ay.                                    |
| `time.js` → ay taşmasının yapısal tek-seferliği                      | Yıl taşması                                            | **DESEN**          | Ek guard alanı **eklenmez**; taşma zaten tek sefer (TC SIM'de doğrulandı).                            |
| `life.js` → `flags.lastLifeLoadWeek` tek-sefer guard'ı               | Gerekirse `flags.lastTickMonth`                        | **KAVRAM**         | DEVLET'te tick tek fonksiyon olduğu için muhtemelen **gerekmez**; ihtiyaç doğarsa desen hazır.        |
| `time.js` → `closeYear()` + `yearlyHistory`                          | Yıllık devlet karnesi                                  | **DESEN**          | Yıl sonu anlık görüntüsü.                                                                             |
| `events.js` → `condition(state)` ile koşullu event                   | Aynı                                                   | **DESEN**          | Saf fonksiyon koşulu.                                                                                 |
| `events.js` → `repeat: once/cooldown/repeatable` + `cooldowns`       | Aynı                                                   | **KOD UYARLA**     | Kanıtlanmış tekrar kontrolü; `cooldownWeeks` → `cooldownMonths`.                                      |
| `events.js` → `EVENT_DEFINITIONS.find()` **dizi sırası önceliği**    | **Açık `priority` alanı**                              | **ALMA (düzelt)**  | 3B'de yeni eventlerin bastırılma riski doğurdu. DEVLET'te sıralama açık ve deterministik.             |
| `events.js` → `applyEffects()` etki şeması                           | `intent` / `actual` ayrımı                             | **KAVRAM**         | DEVLET'te etkiler doğrudan uygulanmaz; uygulama oranından geçer (ADR-02).                             |
| `events.js` → `activateNextEvent()` / tek aktif event                | Tek aktif brifing                                      | **DESEN**          | Aynı anda tek karar.                                                                                  |
| `state.openCases` + `processDueOpenCases()`                          | `stateFiles` + vade işleyicisi                         | **KAVRAM + DESEN** | Soruşturma, uyuyan dosya, politika borcu, skandal → tek `stateFile` soyutlaması (ADR-10).             |
| `openCases`'in **kapaksız** olması                                   | `stateFiles` budaması                                  | **ALMA (düzelt)**  | TC SIM'de çözülmüş dosyalar listede kalıyor. DEVLET'te `resolved` → arşive taşınır ve listeden çıkar. |
| `career.pendingJob` (tekil bekleyen geçiş)                           | `appointments.pending`                                 | **DESEN**          | Tekil bekleyen atama; çift çözüm imkânsız. Kanıtlanmış.                                               |
| 3B: ödülün **tick'te**, event'in yalnız bildirim olması              | Karar sonucunun `resolveDecision()` içinde uygulanması | **DESEN**          | ADR-09. 3B'de bu ayrım olmasaydı diploma kaybolabilirdi.                                              |
| 3B: `isEligibleForJob()` tek merkezî uygunluk helper'ı               | Tek `computeImplementationRate()` ve tek `report()`    | **DESEN**          | Aynı kural üç yerde kopyalanmaz.                                                                      |
| 3B: `getPathDurationWeeks()` (tek doğruluk kaynağı dersi)            | Türetilmiş değerler yalnız helper'dan                  | **KAVRAM**         | Arayüz motor sabitini yeniden hesaplamaz.                                                             |
| 3B: `resolveCompletedLevel()` (kuralı test edilebilir kılma dersi)   | Kritik kurallar saf fonksiyon                          | **KAVRAM**         | Gömülü kural = test edilemeyen kural.                                                                 |
| `addNpcMemory()` + kişi başına sınırlı hafıza                        | `institution.memory`                                   | **KAVRAM + DESEN** | Kurumsal hafıza; kişi başına değil kurum başına, 40 kayıt.                                            |
| `addMemory()` / `memories` (oyuncu hayat kaydı)                      | Arşiv + karar geçmişi                                  | **KAVRAM**         | DEVLET'te "hatıra" değil "kayıt" ve "dosya".                                                          |
| `world.eraId` + `eras.js` + geçersizde geri düşme                    | Aynı yapı                                              | **KOD UYARLA**     | `present_day` → `restructuring_2002`. Birinci sınıf kalıcı alan.                                      |
| `catalog.js` (veri) / motor ayrımı                                   | `js/data/` klasörü                                     | **DESEN**          | DEVLET'te daha katı: dönem başına ayrı veri dosyası (ADR-06).                                         |
| `scripts/tc-sim-sim.mjs` (senaryolu 144 hafta)                       | `tc-sim-devlet-sim.mjs`                                | **KOD UYARLA**     | Senaryo argümanı deseni dahil.                                                                        |
| `scripts/tc-sim-longrun.mjs` (uzun koşu + fuzz + invariant yürüyüşü) | `tc-sim-devlet-longrun.mjs`                            | **KOD UYARLA**     | En yüksek değerli test varlığı. `check()` ve seed'li `rand()` yapısı aynen.                           |
| `MemoryStorage` test sınıfı                                          | Aynı                                                   | **KOD UYARLA**     | Testlerde localStorage taklidi.                                                                       |
| Türkçe numaralı test adlandırması                                    | Aynı                                                   | **DESEN**          | Depo konvansiyonu.                                                                                    |
| Mutasyon testi disiplini (3B sertleştirmesi)                         | Aynı                                                   | **KAVRAM**         | Kritik invariantlar için "kuralı boz, test düşüyor mu?" kontrolü.                                     |
| `app.js` → tek `render()` + `data-*` olay bağlama                    | Aynı                                                   | **DESEN**          | Basit, çalıştığı kanıtlanmış; framework yok.                                                          |
| `navigation.js` → `NAVIGATION_ITEMS` + `getNavigationTarget()`       | Aynı                                                   | **KOD UYARLA**     | **Ama pasif sekme yok:** DEVLET'te 6 bölümün hepsi çalışır.                                           |
| `escapeText()`                                                       | Aynı                                                   | **KOD UYARLA**     | Arayüze giden her metin kaçışlanır.                                                                   |
| `styles.css` panel/option-card düzeni                                | **ALMA**                                               | **ALMA**           | DEVLET'in görsel kimliği ayrıdır (bürokratik/arşivsel). Sınıf isimleri kopyalanmaz.                   |

---

## Kesinlikle taşınmayacaklar

Benzer isim yüzünden yanlış yeniden kullanım olmasın diye açıkça listelenir:

| TC SIM'de var                                   | Neden DEVLET'e taşınmaz                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------- |
| `health` (enerji/stres/sağlık)                  | Devletin bedeni yoktur. Karşılığı **gösterge** ve **kapasite**dir, "yorgunluk" değil. |
| `relationships` (0–100 kişisel yakınlık)        | Devlet-aktör ilişkisi sadakat/uyum/özerkliktir; "arkadaşlık puanı" değildir.          |
| Haftada **2 karar** sınırı                      | DEVLET'te tur başına bir brifing kararı vardır; "aktivite hakkı" ekonomisi yoktur.    |
| `household` / konut / taşınma                   | Kişisel yaşam alanı; DEVLET'te karşılığı yok.                                         |
| `career.jobId` / maaş / iş ailesi deneyimi      | Oyuncunun mesleği yok; oyuncu devletin kendisidir.                                    |
| `finances.balance` kişisel bütçe semantiği      | DEVLET'te `treasury` **kamu** maliyesidir; kişisel harcama mantığı taşınmaz.          |
| `education` sistemi                             | Kişisel eğitim; DEVLET'te karşılığı kurum kapasitesidir.                              |
| `people` (aile/arkadaş NPC'leri)                | DEVLET'in aktörleri kurumsal rollerdir, aile değil.                                   |
| `DECISIONS` listesi (dinlen/spor/aileyle vakit) | Yaşam aktiviteleri; DEVLET'te karşılığı politika kararlarıdır.                        |
| `commute` / yaşam yükü                          | Kişisel; taşınmaz.                                                                    |
| `styles.css` görsel dili                        | Ayrı ürün kimliği.                                                                    |

---

## Event akışının evrimi

```
TC SIM:
state → condition → event → decision → result → flag / memory / openCase

DEVLET:
devlet state → condition → briefing/event → decision
            → IMPLEMENTATION (kurum + direnç + kapasite)
            → immediate result (niyetin bir kısmı)
            → delayed consequence (stateFile)
            → archive
```

Tek yapısal fark, aradaki **IMPLEMENTATION** katmanıdır. TC SIM'de karar doğrudan sonuç
üretir; DEVLET'te karar bir niyettir ve devletin kendisi onu süzer.

Bu belge implementation yetkisi vermez.
