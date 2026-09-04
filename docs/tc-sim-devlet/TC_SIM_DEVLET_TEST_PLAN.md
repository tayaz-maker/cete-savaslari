# TC SIM: DEVLET — Test Planı

Mimari: `TC_SIM_DEVLET_ARCHITECTURE.md`. Kapsam: `TC_SIM_DEVLET_PROTOTYPE.md`.
Bu plan ilk runtime implementasyonuyla **birlikte** yazılır; sonraya bırakılmaz.

TC SIM'de kanıtlanan disiplin aynen alınır: `node:test` + `node:assert/strict`,
`MemoryStorage` sınıfı, `fresh()` yardımcısı, Türkçe numaralı test adları,
`scripts/tc-sim-devlet-*.test.mjs` glob'u `npm test` tarafından otomatik toplanır.

---

## 1. Invariantlar — 18 adet

Uzun koşu doğrulayıcısı bunları **her turda** kontrol eder.

| #   | Invariant                                                                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `world.eraId` her zaman tanımlı bir döneme işaret eder.                                                                                                      |
| 2   | Ay ilerlemesi tam bir kez işlenir; `absoluteMonth` her turda tam +1 artar.                                                                                   |
| 3   | Yıl taşması tam bir kez; yıllık kayıt ayda birden fazla yazılamaz.                                                                                           |
| 4   | Bir brifing bir kez çözülür; aynı `DecisionRecord.id` iki kez yazılamaz.                                                                                     |
| 5   | Uygulama oranı karar başına tam bir kez hesaplanır ve karara yazılır.                                                                                        |
| 6   | `rate` her zaman tam sayı ve `0 ≤ rate ≤ 100`.                                                                                                               |
| 7   | `breakdown` boş olamaz ve terimleri toplamı `rate` ile tutarlı olmalıdır (jitter ve ceza dahil).                                                             |
| 8   | Uygulanan etki, niyetin `rate/100` katıdır; `rate = 0` iken hiçbir sayısal etki uygulanmaz.                                                                  |
| 9   | Bütün kurum statları (`capacity`, `autonomy`, `alignment`, `informationQuality`) 0–100 ve sonlu.                                                             |
| 10  | Bütün göstergeler 0–100 ve sonlu; `NaN`/negatif/ondalık olamaz.                                                                                              |
| 11  | Aktör id'leri geçerli; `institutionId` ya `null` ya tanımlı bir kuruma işaret eder.                                                                          |
| 12  | `institution.leaderActorId` ya `null` ya var olan bir aktör.                                                                                                 |
| 13  | Aynı boşluk iki kez atanamaz; `appointments.pending` tekildir.                                                                                               |
| 14  | **Gizli gerçek stat, raporlanan değerle asla üzerine yazılmaz** (`report()` çıktısı state'e girmez).                                                         |
| 15  | Gecikmeli sonuç tam bir kez tetiklenir; `stateFile.status` yalnız `open → dormant/resolved` yönünde ilerler.                                                 |
| 16  | Arşiv kaydı bir kaynak için tam bir kez yazılır.                                                                                                             |
| 17  | Mali değerler (`treasury`) ve baskı değerleri sonlu; baskılar 0–100.                                                                                         |
| 18  | Sınırlı listeler tavanı aşmaz (arşiv 300, karar 200, brifing geçmişi 200, kurum hafızası 40, yıllık 60) ve `resolved` dosyalar `stateFiles` içinde birikmez. |

---

## 2. Test matrisi — 38 test

### STATE (4)

| ID              | Kurulum                                                            | Eylem                    | Beklenen                                                                                              |
| --------------- | ------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| DEVLET-STATE-01 | —                                                                  | `createNewGame()`        | 6 gösterge, 5 kurum, 12 aktör dolu; `validateState().ok`                                              |
| DEVLET-STATE-02 | Yeni oyun                                                          | —                        | `eraId === "restructuring_2002"`, `time = 2002/1`, `absoluteMonth === 1`                              |
| DEVLET-STATE-03 | Yeni oyun                                                          | —                        | Her kurumun `leaderActorId`'si var olan bir aktör; her aktörün `institutionId`'si geçerli veya `null` |
| DEVLET-STATE-04 | Bozuk state (gösterge `NaN`, kurum statı negatif, aktör id'si çöp) | `normalizeDevletState()` | Onarılır, kayıt atılmaz, `validateState().ok`                                                         |

### TIME (3)

| ID             | Kurulum   | Eylem         | Beklenen                                                                                                       |
| -------------- | --------- | ------------- | -------------------------------------------------------------------------------------------------------------- |
| DEVLET-TIME-01 | Yeni oyun | 1 ay ilerlet  | `absoluteMonth === 2`, `month === 2`                                                                           |
| DEVLET-TIME-02 | Yeni oyun | 12 ay ilerlet | `year === 2003`, `month === 1`, yıllık kayıt **tam 1**                                                         |
| DEVLET-TIME-03 | Yeni oyun | 36 ay ilerlet | `year === 2004`, `month === 12` veya 2005/1 (uygulamaya göre sabitlenir), yıllık kayıt 3, `validateState().ok` |

### EVENT (5)

| ID              | Kurulum                                       | Eylem                   | Beklenen                                                      |
| --------------- | --------------------------------------------- | ----------------------- | ------------------------------------------------------------- |
| DEVLET-EVENT-01 | Koşulu sağlanan tek event                     | Ay ilerlet              | O event `briefing.active` olur                                |
| DEVLET-EVENT-02 | Aynı anda uygun iki event (farklı `priority`) | Ay ilerlet              | Yüksek `priority` seçilir; dizi sırası sonucu **değiştirmez** |
| DEVLET-EVENT-03 | `repeat: "once"` event çözülmüş               | Koşul yine sağlanır     | Tekrar tetiklenmez                                            |
| DEVLET-EVENT-04 | `repeat: "cooldown"`, `cooldownMonths: 6`     | 6 aydan önce / sonra    | Önce tetiklenmez, sonra tetiklenir                            |
| DEVLET-EVENT-05 | Aktif brifing varken                          | İkinci event uygun olur | Aynı anda **tek** aktif brifing; ikincisi kuyruğa girer       |

### DECISION (4)

| ID            | Kurulum                                    | Eylem                  | Beklenen                                             |
| ------------- | ------------------------------------------ | ---------------------- | ---------------------------------------------------- |
| DEVLET-DEC-01 | Aktif brifing                              | Geçerli choice çöz     | `DecisionRecord` yazılır; `briefing.active === null` |
| DEVLET-DEC-02 | Çözülmüş brifing                           | Aynı kararı tekrar çöz | Reddedilir; ikinci kayıt oluşmaz; state değişmez     |
| DEVLET-DEC-03 | Aktif brifing                              | Geçersiz choice id     | Reddedilir; state değişmez                           |
| DEVLET-DEC-04 | `implementation: null` olan sembolik karar | Çöz                    | `rate === 100`, niyet birebir uygulanır              |

### IMPLEMENTATION (5)

| ID            | Kurulum                                                     | Eylem            | Beklenen                                                         |
| ------------- | ----------------------------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| DEVLET-IMP-01 | Yüksek kapasite/uyum, düşük direnç                          | Karar çöz        | `rate` yüksek (>75) ve `0..100`                                  |
| DEVLET-IMP-02 | Herhangi bir karar                                          | Karar çöz        | `breakdown` dolu; terimler + ceza + jitter toplamı `rate`'e eşit |
| DEVLET-IMP-03 | Düşük kapasite, yüksek direnç, yüksek özerklik + düşük uyum | Karar çöz        | `rate` belirgin düşük (<40); niyet **kısmen** uygulanmış         |
| DEVLET-IMP-04 | Aynı seed, aynı state, aynı seçim                           | İki kez çalıştır | Aynı `rate` — deterministik                                      |
| DEVLET-IMP-05 | Aşırı uç girdiler (hepsi 0 / hepsi 100)                     | Karar çöz        | `rate` sınırların dışına taşmaz                                  |

### INSTITUTION + ACTOR + APPOINTMENT (6)

| ID             | Kurulum                                 | Eylem                   | Beklenen                                                                          |
| -------------- | --------------------------------------- | ----------------------- | --------------------------------------------------------------------------------- |
| DEVLET-INST-01 | Karar bir kurumu hedefler               | Çöz                     | Yalnız hedef kurumun statları değişir                                             |
| DEVLET-INST-02 | Kurum hafızası 40 kayıtta               | Yeni kayıt              | Tavan aşılmaz, en eski düşer                                                      |
| DEVLET-APP-01  | Açık boşluk                             | Adayları listele        | 2–3 aday; her biri geçerli aktör; **raporlanan** statlarla                        |
| DEVLET-APP-02  | Açık boşluk                             | Aday ata                | `leaderActorId` güncellenir; kurum statları adayın **gerçek** statlarıyla değişir |
| DEVLET-APP-03  | Atanmış boşluk                          | Aynı boşluğu tekrar ata | Reddedilir; çift çözüm yok                                                        |
| DEVLET-APP-04  | Yetkinliği düşük ama raporu yüksek aday | Ata                     | Kurum kapasitesi beklenenden az artar (gerçek stat kazanır)                       |

### INFORMATION (3)

| ID             | Kurulum                          | Eylem                      | Beklenen                                                         |
| -------------- | -------------------------------- | -------------------------- | ---------------------------------------------------------------- |
| DEVLET-INFO-01 | `informationQuality === 100`     | `report(x, 100)`           | `x` birebir                                                      |
| DEVLET-INFO-02 | Düşük kalite                     | Raporla, sonra state'i oku | Gerçek değer **değişmemiş**; raporlanan değer state'e yazılmamış |
| DEVLET-INFO-03 | Düşük kalite, aynı ay, aynı alan | İki kez raporla            | Aynı sonuç (deterministik, ekran yenilemede zıplamaz)            |

### FILE + ARCHIVE (4)

| ID             | Kurulum                 | Eylem                         | Beklenen                                         |
| -------------- | ----------------------- | ----------------------------- | ------------------------------------------------ |
| DEVLET-FILE-01 | Gecikmeli sonuçlu karar | Çöz                           | `stateFile` açılır, `dueMonth` doğru             |
| DEVLET-FILE-02 | Vadesi gelen dosya      | Vadeyi geç, 3 ay daha ilerlet | Tam bir kez tetiklenir; ikinci kez tetiklenmez   |
| DEVLET-FILE-03 | Çözülen dosya           | Çöz                           | Arşive taşınır ve `stateFiles` içinden **çıkar** |
| DEVLET-ARC-01  | Arşiv etkili karar      | Çöz                           | Tam bir arşiv kaydı; `known` alanı korunur       |

### ECONOMY + SOCIETY (2)

| ID            | Kurulum               | Eylem             | Beklenen                                                              |
| ------------- | --------------------- | ----------------- | --------------------------------------------------------------------- |
| DEVLET-ECO-01 | Yeni oyun             | 12 ay ilerlet     | `treasury` sonlu; baskılar 0–100; ay sonu tam bir kez işlenir         |
| DEVLET-SOC-01 | Yüksek ekonomik baskı | Birkaç ay ilerlet | `heat` yükselir, `consent` düşer; ikisi bağımsız alanlar olarak kalır |

### SAVE + MIGRATION (4)

| ID             | Kurulum                               | Eylem                       | Beklenen                                                                                                                       |
| -------------- | ------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| DEVLET-SAVE-01 | Oynanmış state                        | `saveGame` → `loadGame`     | Tüm alanlar birebir; `validateState().ok`                                                                                      |
| DEVLET-SAVE-02 | Bozuk ana kayıt + sağlam yedek        | `loadGame`                  | Yedekten açılır                                                                                                                |
| DEVLET-SAVE-03 | `SAVE_VERSION` bir artırılmış senaryo | `migrateState(eskiKayıt)`   | `meta.saveVersion` **güncel sürüme eşit**; kayıt geçerli. _(TC SIM'de bu dal unutulunca tüm kayıtlar ölmüştü — kalıcı guard.)_ |
| DEVLET-SAVE-04 | Bozuk kayıt                           | Aynı kaydı 3 kez migrate et | Aynı güvenli state; sapma yok (idempotans)                                                                                     |

### ERA (2)

| ID            | Kurulum                  | Eylem     | Beklenen                                             |
| ------------- | ------------------------ | --------- | ---------------------------------------------------- |
| DEVLET-ERA-01 | `eraId: "olmayan_donem"` | Migration | Prototip dönemine düşer, kayıt yaşar                 |
| DEVLET-ERA-02 | Dönem verisi             | Yükle     | Kurum/aktör/event sayıları bütçeyle uyumlu (5/12/20) |

---

## 3. Üç deterministik senaryo

`scripts/tc-sim-devlet-sim.mjs` ile, sabit seed'le çalışır.

### A — Yüksek kapasite / düşük direnç

**Kurulum:** `interior.capacity` ve `alignment` yüksek, `autonomy` düşük;
`state_capacity` yüksek; düşük dirençli bir politika.
**Kararlar:** aynı politika 3 kez, farklı aylarda.
**Beklenen:** `rate` sürekli >75; uygulanan etki niyete yakın; göstergeler beklenen yönde
hareket eder; `validateState()` her turda geçer.

### B — Düşük kapasite / yüksek direnç → başarısız uygulama

**Kurulum:** `judiciary.autonomy` yüksek, `alignment` düşük, `capacity` orta;
yüksek dirençli bir reform.
**Kararlar:** reform bir kez.
**Beklenen:** `rate` <40; niyetin çoğu **uygulanmaz**; `breakdown` içinde özerklik cezası
görünür; oyuncu "karar verdim ama olmadı" durumunu yaşar; state geçerli kalır.
Bu senaryo **oyunun imza mekaniğinin çalıştığının kanıtıdır.**

### C — Atama → gecikmeli sonuç → arşiv dönüşü

**Kurulum:** bir boşluk açık; adaylardan biri raporda iyi, gerçekte zayıf.
**Kararlar:** o aday atanır; 4–6 ay ilerletilir.
**Beklenen:** atama anında kurum statları **raporun vaat ettiğinden az** iyileşir; gecikmeli
`stateFile` açılır ve vadesinde **tam bir kez** tetiklenir; sonucu arşive `known: false`
olarak düşer; ilerleyen aylarda bir event bu arşiv kaydını koşul olarak kullanıp geri döner.
36 ay içinde tamamlanır.

---

## 4. Simülasyon / uzun koşu planı

TC SIM'in `tc-sim-longrun.mjs` deseni birebir uyarlanır.

| Koşu                        | Amaç                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **36 ay** (prototip dilimi) | Ana doğrulama; üç senaryo burada koşar                                                        |
| **120 ay** (10 yıl)         | State bütünlüğü ve liste büyümesi                                                             |
| **360 ay** (30 yıl)         | Uzun vadeli taşma/işkembe kontrolü — tarihsel doğruluk **test edilmez**, yalnız state sağlığı |
| **Fuzz: 20 seed × 120 ay**  | Yasal eylemlerle rastgele oynama; her turda invariant yürüyüşü                                |

Fuzz botu yalnız **arayüzün izin verdiği** eylemleri kullanır: brifing seçimi, atama, ay ilerletme.
Her turda §1'deki 18 invariant kontrol edilir; ihlalde çıkış kodu 1 ve tur numarası raporlanır.
Bir seed patlarsa: seed raporlanır → minimal regresyon testi yazılır → düzeltilir → seed tekrar geçer.

**Tarihsel doğruluk test edilmez.** Test edilen şey state bütünlüğüdür.

---

## 5. Kabul kriterleri (Aşama 1 "bitti" demek için)

1. Yeni oyun başlar; `restructuring_2002`, 6 gösterge, 5 kurum, 12 aktör yüklü.
2. 36 ay kesintisiz oynanır; her turda `validateState().ok`.
3. En az bir atama yapılır ve gecikmeli sonucu görülür.
4. En az bir karar **belirgin biçimde eksik uygulanır** (`rate < 60`) ve `breakdown` gösterilir.
5. En az bir `stateFile` açılır, vadesinde tetiklenir, arşive taşınır.
6. En az bir arşiv kaydı ileride bir event koşulu olarak geri döner.
7. Save/load roundtrip kayıpsız; bozuk kayıt yedekten kurtarılır.
8. Üç deterministik senaryo (A/B/C) geçer.
9. 38 testin tamamı geçer; fuzz'da başarısız seed yok.
10. Tarayıcıda 6 bölüm gezilebilir; konsol hatası, asset 404'ü, ham id sızıntısı yok.
11. `npm run lint`, `npm run typecheck`, `npm run build` geçer.
12. TC SIM testleri (83/83) **etkilenmemiştir**.
