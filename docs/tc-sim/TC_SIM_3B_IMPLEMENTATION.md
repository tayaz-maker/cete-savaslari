# TC SIM — Aşama 3B: Eğitim + Kariyer Temeli (Uygulama Planı)

**Durum: IMPLEMENTED.** Runtime, migration, arayüz, eventler, testler ve simülasyon senaryoları
uygulandı ve geçiyor. Uygulama sonrası özet ve doğrulama listesi:
`TC_SIM_3B_POST_IMPLEMENTATION.md`.

Bu belge planın kendisidir ve tarihsel kayıt olarak korunur; aşağıdaki kararlar uygulanan hâliyle
geçerlidir. Test senaryoları ayrı belgede: `TC_SIM_3B_TEST_PLAN.md`.

### Plandan sapmalar (uygulama sırasında)

- `education.js` içindeki yol yükü, yoğunluk başına ayrı `{ energy, stress, load }` olarak tutuldu;
  böylece tam/yarı zamanlı yük kesirli çarpan gerektirmeden tam sayı kaldı.
- `eduRank()` bilinmeyen seviye için `1` yerine `0` döner; seviye zaten doğrulandığı için
  karşılaştırmalarda daha güvenli davranış verir.
- `stopEducation()` da `enrollEducation()` gibi açık event varken engellenir (simetri).
- Simülasyondaki eğitim ücreti kontrolü sayaç yerine "aynı haftada çift tahsilat" kontrolüdür;
  `finances.ledger` 120 kayıtla sınırlı olduğu için sayaç güvenilir değil.
- `scripts/tc-sim-core.test.mjs` içindeki sabit `3` beklentisi `SAVE_VERSION` ile değiştirildi
  (sürüm yükseldiği için; invariant zayıflatılmadı).

---

## COWORK FAST START

**Baseline commit:** `f628d2ef457e8e5891f99cbe9c07944656782791`
**Baseline durumu:** 34/34 TC SIM testi PASS · 144 haftalık simülasyon PASS · build PASS

**Önce şu dosyaları aç (bu sırayla):**

1. `public/games/tc-sim/js/state.js` — `SAVE_VERSION`, `createNewGame()`, `validateState()`
2. `public/games/tc-sim/js/catalog.js` — `JOBS`, `HOMES`
3. `public/games/tc-sim/js/save.js` — `migrateState()` zinciri
4. `public/games/tc-sim/js/life.js` — `applyWeeklyLifeLoad()`, `acceptJobOffer()`
5. `public/games/tc-sim/js/time.js` — `advanceWeek()`, `processMonthEnd()`

**Uygulama sırası:** Bölüm 12'deki 9 adımı sırayla uygula. Adım 3 (migration) yeşil olmadan adım 4'e geçme.

**Asla bozulmaması gereken 6 invariant:**

- Haftalık etkiler (deneyim + eğitim ilerlemesi) hafta başına **tam bir kez** — mevcut `flags.lastLifeLoadWeek` guard'ı ile.
- Bir hafta **asla iki iş ailesine** deneyim yazamaz; işsiz hafta deneyim yazmaz.
- Ay sonu tuition **tam bir kez**; eğitimi bırakmak o ayın borcunu silmez.
- `education.level` asla geriye düşmez; `education.fields` asla eleman kaybetmez.
- Eligibility kontrolü **tek helper** üzerinden (`isEligibleForJob`), UI ve `acceptJobOffer()` aynı fonksiyonu çağırır.
- Haftada maksimum 2 karar invariantı korunur; eğitim başlat/bırak **karar hakkı tüketmez**.

**En kritik tuzak (mutlaka oku):** Bölüm 6 — `SAVE_VERSION` 3→4 yapılınca mevcut v3 kayıtlar
`migrateState()` içinde `saveVersion` güncellenmeyen dala düşer ve **tüm oyuncu kayıtları bozuk sayılır.**
Bu dalı düzeltmeden hiçbir şey yayınlama.

**Komutlar:**

```
node --test 'scripts/tc-sim-*.test.mjs'    # 34 mevcut + yeni 3B testleri
node scripts/tc-sim-sim.mjs                # 144 haftalık simülasyon
npm run lint
npm run build
```

**Dokunma:** `save.js` içindeki `loadGame()`/`saveGame()`/backup-recovery akışı, `eras.js`,
NPC/ilişki mantığı, `HOMES` ve konut mantığı, `docs/tc-sim-devlet/`, `styles.css` genel düzeni,
`src/lib/games.ts`. Ayrıntı: Bölüm 14.

---

## 1. Gerçek kod haritası (denetlenmiş)

| Soru                       | Gerçek cevap                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| State nerede oluşuyor?     | `state.js` → `createNewGame()`                                                                                           |
| State nerede doğrulanıyor? | `state.js` → `validateState()` / `assertValidState()`                                                                    |
| Migration nerede?          | `save.js` → `migrateState()` + `mergeLegacy()` / `migrateV2()` / `normalizeCurrentEra()`                                 |
| Haftalık ilerleme?         | `time.js` → `advanceWeek()`                                                                                              |
| Ay sonu?                   | `time.js` → `processMonthEnd()`, `advanceWeek()` içinden çağrılır                                                        |
| İş geçişi?                 | `events.js` → `resolveEvent()` içinde `completePendingJob()` (**tick'te değil, event çözümünde**)                        |
| İş tanımları?              | `catalog.js` → `JOBS`                                                                                                    |
| Teklif üretimi?            | **Yok.** UI tüm `JOBS`'u listeler, oyuncu `acceptJobOffer()` çağırır                                                     |
| Teklif kabulü?             | `life.js` → `acceptJobOffer()`                                                                                           |
| Yaşam yükü?                | `life.js` → `getWeeklyLifeLoad()` / `applyWeeklyLifeLoad()`                                                              |
| Hafıza/geçmiş yazımı?      | `state.js` → `addMemory()`, `addNpcMemory()`, `addEventHistory()`, `addYearHistory()` (hepsi `appendCapped` ile sınırlı) |
| Event değerlendirme?       | `events.js` → `isEligible()` (dosya-içi), `activateNextEvent()`, `resolveEvent()`                                        |
| Testler?                   | `scripts/tc-sim-core.test.mjs`, `-3a`, `-3a1`, `-relationship` (toplam 34)                                               |
| 144 haftalık simülasyon?   | `scripts/tc-sim-sim.mjs`                                                                                                 |

### Yeniden kullanılacak mevcut yardımcılar — yenisini yazma

| İhtiyaç                  | Mevcut çözüm                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Sayı sınırlama           | `state.js` → `clamp()`                                                                                    |
| Para hareketi            | `state.js` → `transact()` (ledger + NaN koruması dahil)                                                   |
| Beden değişimi           | `state.js` → `adjustHealth()`                                                                             |
| Sınırlı liste ekleme     | `state.js` → `appendCapped()`                                                                             |
| Event tekrar kontrolü    | `events.js` → `repeat: "once" \| "cooldown" \| "repeatable"` + `cooldownWeeks` + `state.events.cooldowns` |
| Haftalık tek-sefer guard | `life.js` → `flags.lastLifeLoadWeek` deseni                                                               |
| İş arama                 | `catalog.js` → `getJobById()`                                                                             |
| Gecikmeli sonuç          | `state.openCases` + `processDueOpenCases()`                                                               |

---

## 2. Gerçeklik kontrolleri — teorik spec vs. gerçek kod

Aşağıdaki 6 madde teorik spec'ten **sapıyor.** Gerekçeleri gerçek koddan.

**2.1 `lastMonthEndWeek` guard'ı GEREKMİYOR — ekleme.**
`advanceWeek()` içinde ay sonu, `weekOfMonth > WEEKS_PER_MONTH` taşmasıyla tetikleniyor ve
taşma anında `weekOfMonth = 1` yapılıyor. Yapısal olarak zaten hafta başına en fazla bir kez.
Persistent guard alanı eklemek gereksiz teknik borç olur.

**2.2 Çoklu bekleyen teklif YOK — iptal mantığı yazma.**
`state.career.pendingJob` tekil bir nesne ve `acceptJobOffer()` `if (state.career.pendingJob) return`
ile ikinciyi zaten reddediyor. "Diğer teklifleri iptal et" mantığı gerçek mimaride karşılıksız.

**2.3 Teklif süresi (expiry) sistemi YOK — yenisini icat etme.**
Teklif kabul edilir edilmez `pendingJob` + 1 hafta sonrası `dueWeek`'li openCase oluşuyor; bekleyen
teklif havuzu diye bir şey yok, dolayısıyla "stale offer" sınıfı bu mimaride mevcut değil.
Tek gerçek risk kabul anında eligibility'nin değişmiş olması — o da `acceptJobOffer()` içindeki
kontrolle kapanıyor (Bölüm 5).

**2.4 İş geçişi tick'te DEĞİL, event çözümünde oluyor.**
`processDueOpenCases()` `job_start` event'ini kuyruğa alıyor; `jobId` ancak oyuncu event'i
çözünce `completePendingJob()` ile değişiyor. Bunun sonucu bizim lehimize: deneyim kredisi
`advanceWeek()` içinde verildiğinde `jobId` hâlâ eski iştir, yani **geçiş haftasının kredisi
doğal olarak eski işe yazılır ve bir haftada iki aile kredisi yapısal olarak imkânsızdır.**
Ek guard gerekmiyor.

**2.5 `tuitionOwedThisMonth` boolean DEĞİL, integer TL tutarı olmalı.**
Kilitli spec boolean diyordu; gerçek kod bunu imkânsız kılıyor: eğitim ay ortasında bırakılırsa
`education.active` null olur ve ay sonunda ödenecek tutarı okuyacak `pathId` kalmaz.
**Karar:** `tuitionOwedThisMonth: integer` (varsayılan `0`). Haftalık ilerlemede
`= path.monthlyTuition` **ataması** yapılır (toplama değil — ayda 4 çalışma haftası olsa da borç
tek aylık tuition kalır). Ay sonunda `> 0` ise tahsil edilir ve `0`'a döner.
Kilitli davranış (tam aylık tuition, ayda tam bir kez, bırakınca silinmez) birebir korunur.

**2.6 Eğitim tamamlanma ödülü event'te DEĞİL, tick'te verilmeli.**
Event çözümü oyuncuya bağlıdır ve ertelenebilir. `level`/`fields` güncellemesi `advanceWeek()`
içinde deterministik olarak yapılır; event yalnız anlatısal bildirimdir. Böylece
"completion exactly once" oyuncu davranışından bağımsız garanti edilir.
Ayrıca `life.js → events.js` import'u **döngü yaratacağı için** (events.js zaten life.js'ten
`completePendingJob` alıyor) tamamlanma event'i doğrudan `enqueueEvent()` ile değil,
`flags.educationCompletedPending` bayrağını okuyan normal bir event tanımıyla tetiklenir.

---

## 3. Kesin state modeli

`createNewGame()` dönüşüne iki yeni üst düzey alan eklenir; `career` genişletilir.

```
career: {
  jobId: "market",
  pendingJob: null,
  jobFamilyExperience: {}          // YENİ — { [familyId]: integer HAFTA }
}

education: {                        // YENİ üst düzey alan
  level: "lise",                    // "lise" | "onlisans" | "lisans"
  fields: [],                       // append-only, dedupe'lu string id listesi
  active: null,                     // null | { pathId, intensity, progressPoints }
  tuitionOwedThisMonth: 0           // integer TL (bkz. 2.5)
}
```

- `intensity`: `"full"` | `"part"`
- `progressPoints`: integer, ≥ 0. **Float kullanılmaz.**
- Kariyer bandı **saklanmaz**, deneyimden türetilir.
- `onlisans` rank 2 olarak rezervedir; prototipte hiçbir yol onu vermez. Yeni yol icat etme.

### Eğitim seviyesi karşılaştırması

`education.js` içinde tek merkezi helper. **String karşılaştırması hiçbir yerde kullanılmaz.**

```
EDUCATION_RANKS = { lise: 1, onlisans: 2, lisans: 3 }
eduRank(level) -> EDUCATION_RANKS[level] ?? 1
```

---

## 4. Veri tanımları (doğrudan kullanılabilir)

Yeni dosya: `public/games/tc-sim/js/education.js`

### Alan (field) kimlikleri — 2 adet

| id          | Görünen ad |
| ----------- | ---------- |
| `technical` | Teknik     |
| `business`  | İşletme    |

Proje kuralı: iç kimlikler İngilizce (`market`, `courier`, `family` ile tutarlı), görünen metinler Türkçe.

### Eğitim yolları — 2 adet

| Alan             | `vocational_course`         | `university`                |
| ---------------- | --------------------------- | --------------------------- |
| displayName      | Mesleki Eğitim Kursu        | Üniversite                  |
| grantsLevel      | `null`                      | `"lisans"`                  |
| grantsField      | `"technical"`               | `"business"`                |
| allowedIntensity | `["full", "part"]`          | `["full", "part"]`          |
| targetPoints     | `78`                        | `312`                       |
| enrollmentFee    | `1200`                      | `3000`                      |
| monthlyTuition   | `700`                       | `1500`                      |
| load.full        | `{ energy: -5, stress: 4 }` | `{ energy: -7, stress: 5 }` |
| load.part        | `{ energy: -3, stress: 2 }` | `{ energy: -4, stress: 3 }` |

**Süreler:** full `+3` puan/hafta, part `+2` puan/hafta.
Kurs: 26 hafta (full) / 39 hafta (part). Üniversite: 104 hafta (full) / 156 hafta (part).

**Ekonomi gerekçesi (gerçek sayılarla):** Başlangıç bakiyesi 4.000–6.500. Market maaşı 9.000,
aile evi 1.500, diğer sabit gider 5.000 → aylık net ≈ **+2.500**. Üniversite peşinatı 3.000
başlangıç bakiyesinin yarısından fazla, aylık 1.500 tuition ise net fazlanın %60'ı: ilk yıllarda
gerçek baskı yaratır. Kurs (1.200 + 700) çalışan karakter için erişilebilir kalır.
Üniversite full toplam maliyeti ≈ 3.000 + 26 × 1.500 = **42.000 TL**.
_Not:_ mevcut 144 haftalık simülasyon ek mesai ağırlıklı oynandığında bakiye ~200.000'e çıkıyor;
geç oyunda tuition önemsizleşiyor. Bu bir ekonomi denge konusudur, 3B'nin kapsamı değildir.

### Yeni işler — 2 adet (`catalog.js` → `JOBS` sonuna eklenir)

Gerekçe: mevcut 3 işin hiçbirinde gereksinim yok ve hepsi giriş seviyesi. Yeni iş
eklenmezse eğitim ve deneyim **hiçbir şeyin kilidini açmaz** ve 3B mekanik olarak anlamsız kalır.

| Alan                    | `technician`         | `specialist`              |
| ----------------------- | -------------------- | ------------------------- |
| title                   | Teknik Servis Uzmanı | Kurumsal Uzman Yardımcısı |
| family                  | `hizmet`             | `ofis`                    |
| salary                  | `15500`              | `19000`                   |
| load                    | `2`                  | `3`                       |
| energy                  | `-6`                 | `-5`                      |
| stress                  | `4`                  | `6`                       |
| security                | Orta                 | Yüksek                    |
| zone                    | `2`                  | `2`                       |
| requiredEducation       | —                    | `"lisans"`                |
| requiredField           | `"technical"`        | `"business"`              |
| requiredExperienceWeeks | `24` (hizmet)        | —                         |

İki ayrı zincir kurar:
**Çalışma zinciri** → market/kurye ile 24 hafta deneyim + kurs → `technician` (≈ 27. hafta).
**Eğitim zinciri** → üniversite (full) → `specialist` (≈ 105. hafta).
Her ikisi de 144 haftalık simülasyon ufkunun içinde.

`specialist` için hem `requiredEducation` hem `requiredField` verilmesi bugün fazlalıktır;
`requiredField`'ı tek disiplin kapısı olarak tutmak, ileride ikinci bir lisans yolu eklenince
şema değişikliği gerektirmemesi için bilinçli tercihtir.

### Mevcut işlere `family` ataması

| id        | family   |
| --------- | -------- |
| `market`  | `hizmet` |
| `courier` | `hizmet` |
| `office`  | `ofis`   |

**Mevcut üç işe gereksinim EKLENMEZ.** Böylece migrate edilen ve yeni başlayan her lise
mezunu karakter bu üç işe erişmeye devam eder; soft-lock riski yoktur.
Sadece iki aile kullanılır, üçüncüsü icat edilmez.

### Kariyer bantları (türetilir, saklanmaz)

| Bant        | Deneyim (hafta) | Etiket    |
| ----------- | --------------- | --------- |
| entry       | 0–23            | Başlangıç |
| experienced | 24–71           | Deneyimli |
| senior      | 72+             | Kıdemli   |

---

## 5. Eligibility — tek merkezî helper

`education.js` içinde:

```
isEligibleForJob(state, job) -> { ok: boolean, reason: string }
```

Sırayla kontrol eder ve **ilk başarısız olanın Türkçe gerekçesini** döner:

1. `job.requiredEducation` varsa → `eduRank(state.education.level) >= eduRank(job.requiredEducation)`
2. `job.requiredField` varsa → `state.education.fields.includes(job.requiredField)`
3. `job.requiredExperienceWeeks` varsa → `(state.career.jobFamilyExperience[job.family] || 0) >= job.requiredExperienceWeeks`

Gereksinimi olmayan iş her zaman uygundur.

**Bu helper üç yerde de aynı şekilde çağrılır:**

- `life.js → acceptJobOffer()` — uygun değilse `{ ok: false, reason }` döner, `pendingJob` **oluşturulmaz**.
- `app.js → renderCareer()` — uygun olmayan iş kartının butonu `disabled`, gerekçe `title` olarak gösterilir.
- Event koşulları (fırsat event'leri).

Kabul anında yeniden kontrol, `acceptJobOffer()` çağrısının kendisidir — teklif havuzu
olmadığı için ayrı bir "yeniden doğrula" adımı gerekmez (bkz. 2.3).

---

## 6. Save + migration (EN YÜKSEK RİSKLİ ADIM)

**Mevcut sürüm:** `SAVE_VERSION = 3` → **yeni sürüm: `4`**.

### Tuzak

`migrateState()` şu an şöyle dallanıyor:

```
version < 2   -> mergeLegacy(raw)
version === 2 -> migrateV2(raw)
else          -> normalizeCurrentEra(raw)      // saveVersion'ı GÜNCELLEMİYOR
```

`SAVE_VERSION` 4 yapılırsa mevcut **her v3 kayıt** son dala düşer, `meta.saveVersion` 3 kalır,
`validateState()` "Save sürümü geçersiz" der, `loadGame()` yedeğe düşer, yedek de aynı hatayı
verir → oyuncu **"Kayıt bozuk"** ekranı görür. Bu, yayındaki tüm kayıtların kaybı demektir.

### Zorunlu düzeltme

1. `migrateV3(raw)` ekle: `meta.saveVersion = SAVE_VERSION` ata (ve `normalizeCurrentEra`'nın
   dönem normalizasyonunu uygula).
2. Dallanmayı güncelle:
   ```
   version < 2   -> mergeLegacy(raw)
   version === 2 -> migrateV2(raw)
   version === 3 -> migrateV3(raw)
   else          -> normalizeCurrentEra(raw)
   ```
3. **Tek ortak normalizasyon** yaz: `normalizeEducationCareer(state)` ve `validateState()`
   çağrısından hemen önce **her dala** uygula. `mergeLegacy()` `career` nesnesini
   `{ jobId, pendingJob }` olarak baştan kurduğu için `jobFamilyExperience`'ı **düşürür**;
   ortak normalizasyon bunu geri ekler.

### `normalizeEducationCareer(state)` kuralları

| Durum                                    | Davranış                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `education` yok                          | `{ level: "lise", fields: [], active: null, tuitionOwedThisMonth: 0 }` |
| `level` bilinmeyen                       | `"lise"`                                                               |
| `fields` dizi değil                      | `[]` · dizi ise string olmayan elemanlar atılır, tekrarlar temizlenir  |
| `active.pathId` tanımsız                 | `active = null` (ilerleme kaybı kabul edilir; çökmekten iyidir)        |
| `active.intensity` geçersiz              | `"full"`                                                               |
| `progressPoints` NaN/negatif/ondalıklı   | `0`                                                                    |
| `tuitionOwedThisMonth` NaN/negatif       | `0`                                                                    |
| `career.jobFamilyExperience` nesne değil | `{}`                                                                   |
| deneyim değeri NaN/negatif/ondalıklı     | `0`                                                                    |

**Geçmiş deneyim tahmin EDİLMEZ.** Eski kayıtta karakter yıllardır çalışıyor olsa bile
`jobFamilyExperience = {}` ile başlar. Gerekçe: eski kayıtlarda güvenilir iş başlangıç haftası
yok; tahmin karakteri ilk yüklemede doğrudan kıdemli banda atlatıp anında fırsat event'i
tetikler ve aynı geçmişten farklı state'ler üretir. Deneyim yalnız yukarı doğru fırsat açtığı
için sıfırdan başlamak oyuncudan hiçbir şey **almaz**; migration haftasından itibaren birikir.

### Korunacaklar

`job`, `money`, `home`, `NPC`, `relationships`, `memories`, `openCases`, `health`, `era`
alanlarına dokunulmaz. `saveGame()` / `loadGame()` / yedek-kurtarma akışı **değiştirilmez**.

### `validateState()` eklemeleri

`education` nesnesi ve `career.jobFamilyExperience` için şema kontrolü eklenir.
**Dikkat:** bu kontroller migration'daki normalizasyondan sonra çalışmalı; aksi halde
her eski kayıt reddedilir.

---

## 7. Kesin tick sırası

### MEVCUT — `advanceWeek()` (`time.js`)

1. Açık event varsa çık
2. `applyWeeklyLifeLoad(state)` — `flags.lastLifeLoadWeek` ile hafta başına tek sefer
3. `absoluteWeek += 1`, `weekOfMonth += 1`
4. Ay taşması → `processMonthEnd(state)` → yıl taşması → `closeYear()`
5. `weekly = { used: 0, selectedIds: [] }`
6. Ek mesai serisi sıfırlama
7. `adjustHealth(+7 enerji, −2 stres, …)`
8. `processDueOpenCases(state)`
9. `activateNextEvent(state)`
10. `assertValidState(state)`

### 3B SONRASI — değişen yerler işaretli

1. Açık event varsa çık — _değişmez_
2. **`applyWeeklyLifeLoad(state)`** — mevcut guard'ın **içine**, `lastLifeLoadWeek` atandıktan
   sonra sırayla:
   - **2a. Deneyim kredisi:** `jobId !== null` ise `jobFamilyExperience[job.family] += 1`
   - **2b. Eğitim ilerlemesi:** `education.active` varsa `progressPoints += (full ? 3 : 2)`
     ve `tuitionOwedThisMonth = path.monthlyTuition`
   - **2c. Tamamlanma:** `progressPoints >= targetPoints` ise `grantsLevel` (yalnız rank
     yükseltiyorsa) uygulanır, `grantsField` `fields`'a eklenir, `active = null`,
     `flags.educationCompletedPending = pathId`, `addMemory(..., "important")`
   - **2d. Yaşam yükü:** `getWeeklyLifeLoad()` artık eğitim yükünü de içerir
3. `absoluteWeek += 1`, `weekOfMonth += 1` — _değişmez_
4. Ay taşması → **`processMonthEnd()` içine tuition tahsili eklenir** (Bölüm 8)
   5–10. _Değişmez_

**Neden bu yerleşim:** `applyWeeklyLifeLoad()` zaten `flags.lastLifeLoadWeek === week`
guard'ına sahip ve `flags` save'e yazılıyor. Yeni etkileri bu guard'ın içine koymak,
save/load sonrası aynı haftanın **tekrar işlenmesini yeni bir alan eklemeden** engeller.
Ayrıca 2. adım `absoluteWeek` artmadan önce çalıştığı için kredi **biten haftaya** aittir;
`jobId` bu noktada hâlâ eski iştir (geçiş event çözümünde olur), dolayısıyla
"bir haftada tek aile" invariantı yapısal olarak sağlanır.

**Save noktası:** `app.js` her aksiyondan sonra `persist()` çağırıyor; tick atomik tek
fonksiyon olduğu için tick ortasında kayıt oluşmaz. Değişiklik gerekmez.

---

## 8. Ay sonu akışı

`processMonthEnd()` (`time.js`) mevcut sırası: maaş → diğer gelir → konut → diğer gider.
**Sonuna eklenir:**

```
tuition = state.education.tuitionOwedThisMonth
if (tuition > 0):
    transact(state, -tuition, "Eğitim ücreti", "education")
    state.education.tuitionOwedThisMonth = 0
```

- Proration yok. Ay içinde tek hafta bile ilerleme olduysa tam aylık tuition ödenir.
- Eğitimi bırakmak `tuitionOwedThisMonth`'u **sıfırlamaz** → ödeme kaçırma kapalı.
- Peşin `enrollmentFee` kayıt anında ayrıca alınır (iade yok) → ay sınırı oyunu anlamsız.
- Para yetmezse **mevcut davranış aynen kullanılır**: `transact()` bakiyeyi eksiye
  düşürür ve `tuition_pressure` event'i durumu ele alır. Yeni borç/haciz motoru yazılmaz.
- `getMonthlySummary()`'ye tuition **eklenmelidir** ki panodaki "ay sonu tahmini" doğru kalsın.

---

## 9. Eğitim başlatma / bırakma

Her ikisi de UI aksiyonudur ve **karar hakkı tüketmez** (`markWeeklyAction` çağrılmaz).
`life.js`'teki `acceptJobOffer`/`moveHome` desenini takip et ama `canUseWeeklyAction` kullanma.

**`enrollEducation(state, pathId, intensity)`**

Ön koşullar: `education.active === null` · geçerli `pathId` · `intensity` yol tarafından
destekleniyor · `state.finances.balance >= enrollmentFee` · açık event yok.
Etki: `transact(-enrollmentFee, "Eğitim kayıt ücreti", "education")`,
`active = { pathId, intensity, progressPoints: 0 }`, `addMemory(..., "important")`.
İlerleme bir sonraki tick'te başlar.

**`stopEducation(state)`**

Ön koşul: `education.active !== null`.
Etki: `active = null`, biriken `progressPoints` **kalıcı olarak kaybedilir**,
`tuitionOwedThisMonth` **sıfırlanmaz**, iade yok, `addMemory(..., "important")`.

**Intensity** kayıt anında seçilir, aktifken değiştirilemez. Değiştirmek isteyen bırakıp
yeniden kaydolur (ilerleme kaybı + yeni peşinat bedeli). Ayrı mekanik yazılmaz.

**Başlat/bırak spam'i:** iade edilmeyen peşinat + tam ilerleme kaybı kendi kendini cezalandırır.
Ek cooldown alanı **eklenmez**.

---

## 10. Event tanımları (5 adet)

Mevcut motor yeniden kullanılır: `repeat: "once" | "cooldown" | "repeatable"`, `cooldownWeeks`,
`state.events.cooldowns`. **Yeni `lastFiredWeek` mimarisi eklenmez.**

**Yerleşim uyarısı:** `activateNextEvent()` `EVENT_DEFINITIONS.find(...)` kullanır — yani
**dizi sırası önceliktir.** `education_completed` diziye **ilk sıraya**, diğer dördü
`work_review` ile `job_pressure` arasına eklenir; sona eklenirse mevcut cooldown event'leri
tarafından sürekli bastırılabilirler.

| Alan      | Değer                                                                          |
| --------- | ------------------------------------------------------------------------------ |
| **id**    | `education_completed`                                                          |
| repeat    | `repeatable` (bayrak tek atışı garanti eder)                                   |
| title     | Eğitimin tamamlandı                                                            |
| condition | `Boolean(state.flags.educationCompletedPending)`                               |
| choices   | `acknowledge` — "Kaydını al"                                                   |
| effects   | `health: { stress: -5 }`, `flags: { educationCompletedPending: null }`, memory |
| not       | Seviye/alan ödülü **tick'te** verilir; event yalnız bildirimdir                |

| Alan      | Değer                                                                                |
| --------- | ------------------------------------------------------------------------------------ |
| **id**    | `education_opportunity`                                                              |
| repeat    | `once`                                                                               |
| title     | Diploman kapı açtı                                                                   |
| condition | `specialist` işi için `isEligibleForJob().ok` **ve** `career.jobId !== "specialist"` |
| choices   | `review` — "Fırsatı incele" (`stress −3`, flag, memory)                              |

| Alan      | Değer                                                                                |
| --------- | ------------------------------------------------------------------------------------ |
| **id**    | `experience_opportunity`                                                             |
| repeat    | `once`                                                                               |
| title     | Tecrüben fark edildi                                                                 |
| condition | `technician` işi için `isEligibleForJob().ok` **ve** `career.jobId !== "technician"` |
| choices   | `review` — "Fırsatı incele" (`stress −3`, flag, memory)                              |

| Alan      | Değer                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| **id**    | `study_workload_pressure`                                                                                          |
| repeat    | `cooldown`, `cooldownWeeks: 8`                                                                                     |
| title     | Okul ve iş aynı haftaya sığmıyor                                                                                   |
| condition | `education.active` **ve** `career.jobId !== null` **ve** (`energy <= 40` veya `stress >= 65`)                      |
| choices   | `slow` — "Tempoyu düşür" (`energy +8`, `stress −10`) · `push` — "Devam et" (`energy −6`, `stress +6`, `health −2`) |

| Alan      | Değer                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| **id**    | `tuition_pressure`                                                                                                       |
| repeat    | `cooldown`, `cooldownWeeks: 4`                                                                                           |
| title     | Eğitim ücreti sıkıştırdı                                                                                                 |
| condition | `education.active` **ve** `balance < path.monthlyTuition * 2`                                                            |
| choices   | `ask` — "Aileden destek iste" (`money +1500`, `anne −4`, memory) · `cut` — "Harcamaları kıs" (`stress +6`, flag, memory) |

Etkiler mevcut `applyEffects()` şemasını kullanır; yeni efekt türü eklenmez.

---

## 11. UI entegrasyonu

### Karar: yeni "EĞİTİM" nav öğesi

`navigation.js` → `NAVIGATION_ITEMS` içinde "İŞ"ten hemen sonra
`{ label: "EĞİTİM", view: "education" }` eklenir; `app.js` → `render()` içindeki view
seçimine `activeView === "education" ? renderEducation() : …` dalı eklenir.

**Neden yeni ekran, "BEN" veya "İŞ" içi değil:** Eğitimin üç ayrı aksiyonu var (kursa kayıt,
üniversiteye kayıt — full/part — ve bırakma) artı ilerleme/tuition/yük göstergeleri.
Bunları `renderCareer()` içine sıkıştırmak tek ekranı iki işe koşar ve `disabled` mantığını
karmaşıklaştırır. "BEN" ise karakter özeti anlamına geliyor; eğitim aksiyon ekranıdır.
Mevcut 11 öğeli yoğun FM tarzı nav'a 12. öğeyi eklemek bilgi mimarisiyle tutarlıdır.
Kariyer deneyimi/bandı ise iş verisi olduğu için **`renderCareer()` içinde kalır.**

### `renderEducation()` panelleri

| Panel          | İçerik                                                                                                             | Aksiyon                                    | Devre dışı gerekçesi                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------- |
| Eğitim özeti   | Seviye etiketi, kazanılmış alanlar (yoksa "Henüz alan yok")                                                        | —                                          | —                                                 |
| Aktif eğitim   | Yol adı, yoğunluk, `progressPoints / targetPoints` + yüzde, kalan hafta, aylık tuition, haftalık enerji/stres yükü | "Eğitimi bırak"                            | Aktif eğitim yoksa panel gizlenir                 |
| Eğitim yolları | Her yol için süre (full/part), peşinat, aylık tuition, haftalık yük, kazandırdığı seviye/alan                      | "Tam zamanlı başla" · "Yarı zamanlı başla" | Aktif eğitim var / para yetersiz / açık event var |

### `renderCareer()` eklemeleri

- Özet satırına: **İş ailesi**, **Deneyim** (`floor(hafta / 4)` ay + ham hafta), **Kariyer bandı**.
- Her iş kartına gereksinim satırı (varsa) ve uygun değilse `disabled` buton +
  `title` içinde `isEligibleForJob().reason`.

Yeni ekran/modal yok: CV, mülakat, skill tree, diploma envanteri, üniversite tarayıcısı **yok**.

---

## 12. Uygulama sırası (gerçek bağımlılıklara göre)

1. **`education.js` oluştur** — `EDUCATION_FIELDS`, `EDUCATION_PATHS`, `EDUCATION_RANKS`,
   `eduRank()`, `getPathById()`, `getCareerBand()`, `isEligibleForJob()`. Saf veri + saf fonksiyon,
   state'e dokunmaz.
2. **`catalog.js`** — mevcut 3 işe `family` ekle; `technician` + `specialist` işlerini ekle.
   Mevcut işlere gereksinim ekleme.
3. **`state.js`** — `SAVE_VERSION = 4`; `createNewGame()`'e `education` + `career.jobFamilyExperience`
   varsayılanları; `validateState()`'e şema kontrolleri.
4. **`save.js` migration** — `migrateV3()` + dallanma düzeltmesi + `normalizeEducationCareer()`
   her dalda. **Bölüm 6 buradadır ve en riskli adımdır.**
   → _Devam etmeden önce EDU-002, EDU-003 ve mevcut 34 testi çalıştır._
5. **`life.js` tick** — `getWeeklyLifeLoad()`'a eğitim yükü; `applyWeeklyLifeLoad()` guard'ının
   içine deneyim kredisi + ilerleme + tamamlanma.
6. **`time.js` ay sonu** — `processMonthEnd()`'e tuition tahsili; `getMonthlySummary()`'ye tuition.
7. **`life.js` aksiyonlar** — `enrollEducation()`, `stopEducation()`; `acceptJobOffer()`'a
   eligibility kapısı.
8. **`events.js`** — 5 event tanımı, doğru dizi konumlarında.
9. **`app.js` + `navigation.js`** — EĞİTİM nav öğesi, `renderEducation()`, `renderCareer()`
   eklemeleri, buton dinleyicileri.
10. **Testler + simülasyon** — `scripts/tc-sim-3b.test.mjs` ve 3 senaryo
    (`TC_SIM_3B_TEST_PLAN.md`).

---

## 13. Risk kaydı

| #   | Risk                                                                                    | Seviye     | Önlem                                                                    | Test                |
| --- | --------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------ | ------------------- |
| 1   | `SAVE_VERSION` 3→4 sonrası tüm v3 kayıtlar geçersiz sayılır                             | **HIGH**   | `migrateV3()` + dallanma düzeltmesi (Bölüm 6)                            | EDU-002             |
| 2   | `mergeLegacy()` `career` nesnesini baştan kurup `jobFamilyExperience`'ı düşürür         | **HIGH**   | Ortak `normalizeEducationCareer()` her dalda, `validateState()`'ten önce | EDU-002             |
| 3   | `validateState()` eklemeleri normalizasyondan önce çalışırsa eski kayıtlar reddedilir   | **HIGH**   | Sıra: migrate → normalize → validate                                     | EDU-002, CAREER-010 |
| 4   | Ay ortasında bırakılan eğitimin tuition tutarı okunamaz                                 | **MEDIUM** | `tuitionOwedThisMonth` integer TL (2.5)                                  | EDU-008             |
| 5   | Yeni event'ler dizi sonuna eklenince hiç tetiklenmez                                    | **MEDIUM** | `education_completed` ilk sıraya, diğerleri `work_review` sonrasına      | SIM-002             |
| 6   | `life.js → events.js` import döngüsü                                                    | **MEDIUM** | Tamamlanma bayrak üzerinden; `enqueueEvent` life.js'e import edilmez     | — (build)           |
| 7   | Tamamlanma ödülü event çözümüne bağlanırsa oyuncu erteleyince kaybolur/çiftlenir        | **MEDIUM** | Ödül tick'te, event yalnız bildirim (2.6)                                | EDU-010, SIM-004    |
| 8   | UI eligibility'yi atlayıp uygun olmayan işe geçiş                                       | **MEDIUM** | `acceptJobOffer()` içinde sunucu tarafı kapı; UI aynı helper'ı çağırır   | CAREER-009          |
| 9   | Mevcut 3 işe gereksinim eklenirse migrate karakterler işsiz kalır                       | **MEDIUM** | Mevcut işler gereksinimsiz kalır (Bölüm 4)                               | CAREER-005          |
| 10  | Yeni haftalık etkiler guard dışına yazılırsa save/load ile ilerleme/deneyim tekrarlanır | **MEDIUM** | Her ikisi `applyWeeklyLifeLoad()` guard'ının içinde                      | EDU-005, CAREER-010 |

---

## 14. Dokunulmayacaklar

- `save.js` → `saveGame()`, `loadGame()`, `clearSaves()`, yedek/kurtarma akışı — çalışıyor.
- `eras.js` ve dönem mimarisi — 3B'de dönem verisi üretilmez.
- NPC, ilişki, NPC hafızası mantığı — 3B ilişki sistemine dokunmaz.
- `HOMES` ve konut/taşınma mantığı — konut verisi ve `moveHome()` değişmez.
- `time.js` → `closeYear()`, yıl dosyası, `DECISIONS` dizisi ve haftalık karar limiti.
- `docs/tc-sim-devlet/**` — ayrı oyun, bu görevde hiçbir şey yazılmaz.
- Ortak motor çıkarımı / shared engine refactor — yapılmaz.
- `src/lib/games.ts` ve katalog route'u — oyun zaten kayıtlı.
- `styles.css` genel düzeni — yalnız yeni eğitim panelleri için mevcut sınıflar
  (`panel`, `option-grid`, `option-card`, `detail-summary`) yeniden kullanılır.

---

## 15. Dönem uyumluluğu

**Generic kalır (motor):** `education` state şeması, puan ilerlemesi, `eduRank()`,
eligibility mantığı, deneyim birikimi, kariyer bandı eşikleri, tuition akışı.

**İleride döneme özgü veriye taşınabilir:** `EDUCATION_PATHS` içeriği (yol adları, süreler,
peşinat/tuition tutarları), `EDUCATION_FIELDS` listesi, iş gereksinim sayıları.
Bu yüzden hepsi `education.js` içinde **veri tablosu** olarak durur, motor koduna gömülmez.
İleride `eraId` anahtarlı bir tabloya bölmek şema değişikliği gerektirmez.

Şimdilik yalnız `present_day` doldurulur. **Geçmiş dönem verisi üretilmez.**

---

## 16. Bu aşamada yapılmayacaklar

YKS, KPSS, askerlik, devlet memurluğu, torpil/network, gerçek üniversite veritabanı,
onlarca meslek, skill tree, global XP, ayrıntılı yetenekler, CV, mülakat simülasyonu,
işyeri hiyerarşisi, şirket simülasyonu, girişimcilik, emeklilik, enflasyon revizyonu,
sosyal medya, evlilik/çocuk, otonom NPC kariyerleri, geçmiş dönem içerikleri.

Ayrıca **icat edilmeyecek:** önlisans yolu (enum rezerve, yol yok), tuition proration,
ilerleme bankası, aktifken yoğunluk değiştirme, geçmişe dönük deneyim tahmini,
yeni borç/haciz sistemi, `lastMonthEndWeek` alanı, teklif süresi (expiry) sistemi,
çoklu teklif iptal mantığı.
