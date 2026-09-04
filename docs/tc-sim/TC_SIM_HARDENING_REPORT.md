# TC SIM — Sürüm Sertleştirme Raporu (3B sonrası)

## COWORK FINAL VERIFY

- Branch: `claude/grok-game-screen-design-8fa30d`
- Bu turun başlangıcı: `d4c15de` (3B uygulaması) · sertleştirme commit'i: bu belgeyi içeren commit
- Üç komut:

```
node --test 'scripts/tc-sim-*.test.mjs'      # 83/83 PASS
node scripts/tc-sim-longrun.mjs fuzz         # 20 seed × 260 hafta, failed: []
node scripts/tc-sim-sim.mjs full             # 144 hafta senaryosu, problems: []
```

- Derinlemesine doğrulama gerekirse: `node scripts/tc-sim-longrun.mjs 1040 7` (exit 0 beklenir).
- Diff'te en çok bakmaya değen dosyalar: `public/games/tc-sim/js/life.js` (tuition monotonluğu),
  `public/games/tc-sim/js/state.js` (career onarımı), `public/games/tc-sim/js/education.js`
  (`resolveCompletedLevel`, `getPathDurationWeeks`).
- **Bilinen ve bu çalışmayla ilgisiz depo hataları:** `npm test` 232 testten 15'ini geçiremez
  (app-env, share-card meta, og:image, auth şeması, CLI symlink). Bu 15 hata `f7f1a19` ve
  `d4c15de` checkpoint'lerinde de vardı; sayı değişmedi. `eslint .` hataları `src/**`,
  `public/games/satranc`, `public/games/bukucu` ve `scripts/racon-*` dosyalarındadır.
- **Yeniden denetlenmesi gerekmeyenler:** save/migration matrisi, uzun koşu davranışı, fuzz,
  tarayıcı arayüz turu, event spam sayımları — hepsi aşağıda kayıtlı ve tekrarlanabilir komutlara
  bağlı. Cowork'un bug avı, migration denetimi veya test tasarımı yapmasına gerek yok.

---

## CHECKPOINT

|                      |                                                                    |
| -------------------- | ------------------------------------------------------------------ |
| Başlangıç HEAD       | `d4c15de7d42fb4721c12a28d7e39c7ee74d0d479`                         |
| Ana plan commit'i    | `f7f1a19` (accelerator)                                            |
| Test sayısı (TC SIM) | 68 → **83**                                                        |
| Depo geneli          | 217 → 232 test; geçen 202 → 217; **başarısız 15 → 15 (değişmedi)** |

## CURRENT VERIFIED SYSTEMS

Zaman · finans · iş · konut · beden · eğitim · kariyer · NPC/ilişki · event · save/migration ·
dönem · geçmiş. Hepsi aşağıdaki koşularda invariant yürüyüşüyle doğrulandı.

## INVARIANTS

Gerçek koddan çıkarılan ve her uzun koşuda haftalık olarak sınanan kurallar:

1. Haftalık etkiler (beden yükü, deneyim, eğitim ilerlemesi) hafta başına tam bir kez
   (`flags.lastLifeLoadWeek`).
2. Ay dönümü yapısal olarak tek sefer (`weekOfMonth > 4` taşması); ek guard alanı yok.
3. Yıl dönümü tek sefer; yıl dosyası ve yaş artışı bir kez.
4. Haftada en fazla 2 farklı karar; eğitim kaydı/bırakması slot tüketmez.
5. Bir hafta en fazla bir iş ailesine +1 deneyim; işsiz hafta kredi yok.
6. İş geçişi event çözümünde olduğu için geçiş haftası eski işe yazılır.
7. Eğitim ücreti ay başına tam bir kez; **o ayın borcu ay içinde yalnız artabilir**.
8. Tamamlanma tam bir kez; ödül tick'te verilir, event'e bağlı değildir.
9. `education.level` asla düşmez; `fields` append-only ve tekrarsız.
10. `progressPoints` tam sayı ve `0 … targetPoints`.
11. Deneyim toplamı geçen hafta sayısını aşamaz; NaN/negatif/ondalık olamaz.
12. Beden 0–100, ilişkiler 0–100, bakiye sonlu sayı.
13. Uygunluk sağlanmadan teklif üretilemez/kabul edilemez (tek helper).
14. `jobId`/`homeId`/`pathId`/`eraId` her zaman geçerli veya `null`.
15. Sınırlı listeler taşmaz: hafıza 200, defter 120, event geçmişi 200, yıl dosyası 80.

## BUGS FOUND AND FIXED

| #   | Seviye     | Bulgu                                                                                                                                                                          | Düzeltme                                                                                                                                                                                               | Test           |
| --- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| 1   | **MEDIUM** | Ay içinde pahalı programı bırakıp ucuza geçen oyuncu o ayın eğitim borcunu düşürebiliyordu (1500 → 700). 3B'de bilinen sınırlama olarak bırakılmıştı.                          | `tuitionOwedThisMonth` artık `Math.max(mevcut, uygulanabilir)` ile **monotonik**; ay sonunda tahsil edilip sıfırlanır. Proration eklenmedi.                                                            | hardening 1, 2 |
| 2   | **MEDIUM** | `career` nesnesi tamamen kayıp bir kayıt doğrulamadan geçemiyor ve **tüm kayıt çöpe atılıyordu** (para, ev, NPC, hafıza dahil) — oysa `education` için onarım vardı. Asimetri. | `normalizeEducationCareer()` yalnız **eksik** `jobId`/`pendingJob` anahtarlarını güvenli varsayılana çeker (işsiz); var olan geçersiz değerler doğrulamaya bırakılır, kurtarma sözleşmesi gevşetilmez. | hardening 5    |
| 3   | **LOW**    | Arayüz program süresini `targetPoints / 3` ve `/ 2` ile **kendi hesaplıyordu**; ilerleme hızı `education.js`'te değişse arayüz yalan söylerdi (tek doğruluk kaynağı ihlali).   | `getPathDurationWeeks(path, intensity)` eklendi; arayüz süreyi buradan alıyor.                                                                                                                         | hardening 10   |
| 4   | **LOW**    | Seviye düşmezlik kuralı `completeEducation()` içine gömülü olduğu için **test edilemiyordu**; mutasyon testi kuralı kaldırdığında 83 testin hiçbiri düşmedi (tautoloji).       | Kural saf `resolveCompletedLevel()` fonksiyonuna çıkarıldı ve düşürme/eşitlik/yükseltme/null kombinasyonları doğrudan test edildi.                                                                     | hardening 11   |
| 5   | **LOW**    | `EDUCATION_INTENSITIES` export'u hiçbir yerde kullanılmıyordu (3B artığı).                                                                                                     | Kaldırıldı.                                                                                                                                                                                            | —              |

Bulunan HIGH seviyesi bug **yok**; BLOCKER **yok**.

## EXPLOITS TESTED

| Senaryo                                                          | Sonuç                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Pahalı → ucuz program ile borç düşürme                           | **Düzeltildi**, artık monotonik                                          |
| Ucuz → pahalı geçiş                                              | Borç yükseliyor (doğru)                                                  |
| Kayıt/bırakma spam'i (×5)                                        | Yalnız para kaybı, ilerleme/karar hakkı kazancı yok                      |
| İlerleme olmadan bırakıp ücretten kaçma                          | Borç doğmuyor (doğru), ilerleyen hafta varsa borç kalıyor                |
| Tam ücret / ücret−1 bakiye ile kayıt                             | Sırasıyla kabul / ret                                                    |
| Negatif bakiyeyle kayıt                                          | Ret                                                                      |
| Geçersiz `pathId` / `intensity` enjeksiyonu                      | Ret                                                                      |
| Save üzerinden seviye yükseltme/düşürme                          | Bilinmeyen seviye `lise`'ye onarılıyor                                   |
| Save üzerinden ilerleme şişirme (NaN/∞/negatif/float/hedef üstü) | `active` güvenle `null`'a düşüyor                                        |
| Save/load ile ilerleme veya deneyim çoğaltma                     | Guard tutuyor (4 turluk save/load döngüsü)                               |
| Uygun olmayan işe teklif kabulü                                  | Ret; `pendingJob`/openCase oluşmuyor                                     |
| Aynı hafta iki taşınma + üçüncü                                  | 2 karar sonrası ret                                                      |
| Aynı hafta taşınma + eğitim kaydı                                | İkisi de çalışıyor, karar hakkı yalnız taşınma için harcanıyor (tasarım) |
| Tamamlanma + ay sonu aynı tick                                   | State geçerli, borç tahsil edilip sıfırlanıyor                           |
| İş geçişi + ay sonu + aktif eğitim aynı tick                     | Tek aile kredisi, state geçerli                                          |
| `pendingJob` ile save/load                                       | Bekleyen iş ve openCase korunuyor, sonraki hafta geçiş tamamlanıyor      |

## MIGRATION MATRIX

Tümü `migrateState()` üzerinden; parantez içi sonuç.

| Girdi                                                      | Sonuç                                   |
| ---------------------------------------------------------- | --------------------------------------- |
| v4 temiz / v3 temiz / v2 temiz / v1 legacy / sürümsüz      | Hepsi v4'e taşınıyor, doğrulama geçiyor |
| `education` eksik                                          | Güvenli varsayılan                      |
| `career` eksik                                             | **Onarılıyor** (bu turda düzeltildi)    |
| `education.active` bozuk (`pathId`/`intensity`/tip)        | `active = null`, kayıt korunuyor        |
| `progressPoints` NaN / ∞ / negatif / ondalık / hedef üstü  | `active = null`                         |
| `jobFamilyExperience` string/null/obje/NaN/negatif/ondalık | Her anahtar `0`'a onarılıyor            |
| `jobFamilyExperience` dizi                                 | `{}`                                    |
| `fields` tekrarlı / sayı / null / obje                     | Tekrarsız string listesine indirgeniyor |
| `fields` obje                                              | `[]`                                    |
| `tuitionOwedThisMonth` NaN/negatif                         | `0`                                     |
| `eraId` geçersiz                                           | `present_day`                           |
| `level` bilinmeyen                                         | `lise`                                  |
| Sürüm 99 / negatif / dizi kök / null kök                   | Reddediliyor (doğru)                    |
| Aynı kaydı 4 kez migrate                                   | Aynı state, sapma yok                   |

Zengin v3 fixture'ı (para, iş, ev, beden, NPC, ilişki, NPC hafızası, açık dosya, yıl dosyası,
flag, event seen/cooldown, zaman, yaş) **hiçbir alan kaybetmeden** taşınıyor — kalıcı regresyon
testi: hardening 6.

## LONG-RUN RESULTS

`node scripts/tc-sim-longrun.mjs <hafta> <seed>` — her hafta invariant yürüyüşü, 12 haftada bir
save/load turu.

| Koşu                            | Sonuç                |
| ------------------------------- | -------------------- |
| 144 hafta (mevcut 4 senaryo)    | PASS, `problems: []` |
| 260 hafta × 20 seed             | PASS                 |
| **520 hafta** (10 yıl, yaş 28)  | PASS, ihlal yok      |
| **1040 hafta** (21 yıl, yaş 39) | PASS, ihlal yok      |

## FUZZ RESULTS

20 deterministik seed × 260 hafta = **5.200 simüle hafta**. Oyuncu eylemleri yalnız yasal
arayüz yollarından seçiliyor (kayıt/bırakma/yoğunluk, teklif kabulü, taşınma, haftalık kararlar,
event seçimleri). **Başarısız seed: 0.**

Ek olarak **9 mutasyon testi** yapıldı (haftalık guard, tuition monotonluğu, uygunluk kapısı,
seviye düşmezliği, `migrateV3` dalı, alan tekrarı, ilerleme hızı, süre helper'ı, career onarımı).
Başlangıçta 7 mutasyondan 6'sı yakalanıyordu; yakalanmayan seviye-düşmezlik kuralı test edilebilir
hale getirildi. Şimdi **9/9 mutasyon yakalanıyor**.

## UI BROWSER RESULTS

Gerçek Chromium'da, oyunun yayındaki gibi **iframe içinde** çalıştırılmasıyla; iki viewport.

|                                                                                                                                    | Geniş (1440×900)               | Dar (390×844) |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------- |
| Nav öğeleri (12, aktif 4: ANA SAYFA/İŞ/EĞİTİM/EV)                                                                                  | PASS                           | PASS          |
| Dört ekranın açılması + `aria-current`                                                                                             | PASS                           | PASS          |
| Yatay taşma (`scrollWidth-clientWidth`)                                                                                            | 0 px                           | 0 px          |
| Ham değer sızıntısı (`undefined`, `null`, `NaN`, `[object Object]`, `present_day`, `technical`, `entry`, `university`, `hizmet` …) | Yok                            | Yok           |
| Kayıt sonrası ekran tazelenmesi                                                                                                    | PASS                           | PASS          |
| Süre gösterimi (tek kaynaktan)                                                                                                     | "Tam 26 hafta · Yarı 39 hafta" | aynı          |
| Hafta ilerletme sonrası ilerleme tazelenmesi                                                                                       | PASS                           | PASS          |
| Kilitli iş + gerekçe ("Lisans mezunu olman gerekiyor.")                                                                            | PASS                           | PASS          |
| Konsol hatası / asset 404                                                                                                          | Yok                            | Yok           |

## STATE GROWTH

| Ölçüm             | 520 hafta | 1040 hafta | Sınır                          |
| ----------------- | --------- | ---------- | ------------------------------ |
| `memories`        | 132       | 200        | 200 (cap)                      |
| `finances.ledger` | 120       | 120        | 120 (cap)                      |
| `events.history`  | 105       | 196        | 200 (cap)                      |
| `yearlyHistory`   | 10        | 21         | 80 (cap)                       |
| `openCases`       | 18        | 20         | **sınırsız** (aşağıya bakınız) |
| `flags`           | 11        | 12         | —                              |
| Save boyutu       | ~45 KB    | ~68 KB     | sim eşiği 200 KB               |

Event dağılımı (520 hafta örneği) makul: `study_workload_pressure` 36, `commute_fatigue` 29,
`job_start` 18, `job_pressure` 8, `health_warning` 6, tek-atışlıklar 1'er. Cooldown ve `once`
semantiği çalışıyor; 3B'nin eklediği event'ler yağmur üretmiyor.

## KNOWN LIMITATIONS

- `openCases` kapaklı değil: çözülen dosyalar `status: "resolved"` ile listede kalıyor. Büyüme
  zamana değil oyuncu eylemine bağlı (1040 haftada yalnız 20 kayıt) ve save boyutuna etkisi
  ihmal edilebilir. **3B'nin getirdiği bir sorun değil**, 3A'dan gelen bilinçli mimari; broad
  refactor yapılmadı. İleride oyuncu binlerce iş değiştirirse budama gerekir.
- `finances.ledger` 120 kayıtla sınırlı olduğundan uzun oyunda eski eğitim ücreti satırları
  pencereden düşer. Sayaç olarak kullanılamaz; doğrulama "aynı haftada çift tahsilat" kontrolüyle
  yapılır.
- İki eğitim çok kısa aralıkla biterse tek bildirim event'i görünür; **ödüller ikisi için de
  verilir** (ödül tick'te). Prototipte pratikte oluşmaz.
- `onlisans` seviyesi rezerve; hiçbir yol onu vermiyor (tasarım gereği).
- Simülasyon botu kariyer zincirini uçtan uca oynamaz; o zincir ayrı entegrasyon testiyle
  kapsanıyor (hardening 12).

## RELEASE GATES

Aşağıdakiler geçmeden TC SIM sürüm adayı sayılmaz:

1. `node --test 'scripts/tc-sim-*.test.mjs'` → 83/83
2. `node scripts/tc-sim-longrun.mjs fuzz` → `failed: []`
3. `node scripts/tc-sim-sim.mjs` + `work` + `full` + `part` → hepsi `problems: []`
4. `npm run build` ve `npm run typecheck` → PASS
5. Değişen dosyalarda `eslint` → 0 sorun
6. Depo geneli başarısız test sayısı 15'i **aşmamalı** (bunlar TC SIM dışı, önceden var)

## PRE-3C REPO MAP

3C (Sosyal Çevre / İlişkiler) **tasarlanmadı ve uygulanmadı.** Aşağıdaki yalnız mevcut kodun
haritasıdır; gelecekteki oturumun repo'yu yeniden keşfetmesini engellemek içindir.

**Mevcut yeniden kullanılabilir alanlar**

- `state.people`: `[{ id, name, relationType, memories: [] }]` — 4 kişi (`anne`, `baba`,
  `mehmet`, `elif`). `relationType` Türkçe görünen etiket.
- `state.relationships`: `{ [personId]: 0–100 }`, `validateState()` aralığı zorluyor.
- `state.meta.yearStartRelationships`: yıl dosyası karşılaştırması için anlık görüntü.
- NPC hafızası: `addNpcMemory(state, personId, text)` — kişi başına 50 kayıtla sınırlı.
- İlişki değişimi: `updateRelationship(state, personId, amount)` — clamp'li, bilinmeyen kişi
  için `false` döner.

**İlgili mevcut fonksiyonlar/dosyalar**

- `state.js`: `createNewGame()` (people/relationships tohumu), `updateRelationship()`,
  `addNpcMemory()`, `validateState()` (NPC ve ilişki şeması).
- `time.js` → `DECISIONS`: ilişkiye dokunan kararlar `family`, `friend`, `help-friend`
  (`onceFlag`), `lend-friend` (`openCase` + gecikmeli sonuç), `call-anne` ve `reconnect-mehmet`
  (`contextual`, düşük ilişki eşiğinde açılıyor). `closeYear()` ilişkileri yıl dosyasına yazıyor.
- `events.js`: `family_budget_talk`, `family_privacy`, `loan_repayment`; efekt şeması
  `relationships` ve `npcMemory` alanlarını zaten destekliyor.
- `app.js`: `renderPeople()`, `relationshipLabel()` (Yakın/İyi/Mesafeli/Zayıf) — ilişki paneli
  ana sayfada.
- `navigation.js`: **`KİŞİLER` ve `AİLE / İLİŞKİLER` öğeleri `view: null` (pasif)** — 3C'nin
  doğal ekran yeri; EĞİTİM'de kullanılan desen birebir uygulanabilir.

**Teknik kısıtlar**

- Yeni kalıcı alan eklenirse `SAVE_VERSION` 4 → 5 ve `migrateV4()` dalı gerekir; ortak
  `normalizeEducationCareer()` deseni (her daldan sonra normalize, sonra doğrula) izlenmeli.
- Haftalık etki eklenecekse `applyWeeklyLifeLoad()` guard'ının içine girmeli (tek-sefer garantisi).
- Haftada 2 karar invariantı korunmalı; slot tüketmeyen aksiyonlar `enrollEducation()` desenini
  izlemeli.
- Event dizisi **sırası önceliktir** (`EVENT_DEFINITIONS.find`); yeni event'lerin konumu bilinçli
  seçilmeli.
- `state.people` şu an sabit 4 kişi; dinamik kişi ekleme/çıkarma `validateState()`'in benzersiz
  `id` kuralına ve `relationships` anahtarlarıyla tutarlılığa dikkat etmeli.
