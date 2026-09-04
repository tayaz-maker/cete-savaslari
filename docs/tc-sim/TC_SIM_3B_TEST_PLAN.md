# TC SIM — Aşama 3B Test Planı

Ana belge: `TC_SIM_3B_IMPLEMENTATION.md`. Bu belge yalnız testler ve simülasyon senaryolarıdır.

**Baseline:** commit `f628d2ef457e8e5891f99cbe9c07944656782791` — 34/34 PASS, 144 hafta PASS.

---

## 1. Mevcut testler

`scripts/tc-sim-core.test.mjs` (16) · `tc-sim-3a.test.mjs` (11) · `tc-sim-3a1.test.mjs` (4) ·
`tc-sim-relationship.test.mjs` (3) → **toplam 34.**

**Hepsi değişmeden geçmeye devam etmelidir.** 3B hiçbir mevcut testi değiştirmeyi gerektirmez;
gerektiriyorsa bu bir regresyon işaretidir, testi değil kodu düzelt.

Özellikle şu üçü erken uyarı verir:

- core "3. ay geçişinde gelir ve gider bir kez uygulanır" — tuition entegrasyonu ay sonunu bozarsa düşer.
- core save/migration testleri — `SAVE_VERSION` 3→4 dallanması yanlışsa düşer.
- 3a `applyWeeklyLifeLoad` testleri — haftalık guard'a yapılan ekleme yanlışsa düşer.

---

## 2. Yeni test dosyası

`scripts/tc-sim-3b.test.mjs` — mevcut dosyaların biçimini birebir izler:
`node:test` + `node:assert/strict`, `MemoryStorage` sınıfı, `fresh()` yardımcısı,
`settle()` yardımcısı, Türkçe numaralı test adları (`test("1. …")`).

`npm test` glob'u (`scripts/**/*.test.mjs`) yeni dosyayı otomatik alır; script değişikliği gerekmez.

---

## 3. Eğitim testleri

| ID      | Kurulum                                                                                                                                                                                      | Eylem                                                                                   | Beklenen invariant                                                                                                                                                                                                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| EDU-001 | `createNewGame()`                                                                                                                                                                            | —                                                                                       | `education.level === "lise"`, `fields` boş dizi, `active === null`, `tuitionOwedThisMonth === 0`, `career.jobFamilyExperience` boş nesne, `validateState().ok`                                                                       |
| EDU-002 | v3 kayıt nesnesi (education/career alanları yok), ayrıca `saveVersion: 1` eski kayıt                                                                                                         | `migrateState()`                                                                        | `ok === true`; `meta.saveVersion === 4`; education varsayılanları dolu; `jobFamilyExperience` var; **`career.jobId`, `finances.balance`, `household.homeId`, `people`, `memories`, `openCases`, `health`, `world.eraId` değişmemiş** |
| EDU-003 | Bozuk education: `level: "doktora"`, `fields: "teknik"`, `active: { pathId: "yok", intensity: "x", progressPoints: NaN }`, `tuitionOwedThisMonth: -5`, `jobFamilyExperience: { hizmet: -3 }` | `migrateState()`                                                                        | Kayıt **atılmaz**, onarılır: `level === "lise"`, `fields` dizi, `active === null`, `tuitionOwedThisMonth === 0`, deneyim `0`; `validateState().ok`                                                                                   |
| EDU-004 | Taze oyun, bakiye bilinir                                                                                                                                                                    | `enrollEducation("university", "full")`                                                 | Bakiye tam `enrollmentFee` (3000) azalır; `active.progressPoints === 0`; `weekly.used` **artmaz**                                                                                                                                    |
| EDU-005 | Kayıtlı full-time eğitim                                                                                                                                                                     | `advanceWeek()` bir kez; ardından save → load → aynı hafta için `applyWeeklyLifeLoad()` | `progressPoints === 3` (6 değil); ikinci çağrı `false` döner                                                                                                                                                                         |
| EDU-006 | Kayıtlı part-time eğitim                                                                                                                                                                     | 3 hafta ilerlet                                                                         | `progressPoints === 6`, `Number.isInteger(progressPoints)`                                                                                                                                                                           |
| EDU-007 | Eğitim, `progressPoints > 0`                                                                                                                                                                 | `stopEducation()`                                                                       | `active === null`; yeniden kayıt sonrası `progressPoints === 0`; yeni peşinat tekrar tahsil edilir                                                                                                                                   |
| EDU-008 | 1. haftada kayıt, 2. haftada bırak, aya kadar ilerlet                                                                                                                                        | ay sonu                                                                                 | `monthlyTuition` **yine de** tahsil edilir; sonra `tuitionOwedThisMonth === 0`                                                                                                                                                       |
| EDU-009 | Aktif eğitim, bir ay boyunca 4 hafta ilerlet                                                                                                                                                 | ay sonu                                                                                 | Tuition tam **bir kez** düşer (4 kez değil); ledger'da tek `education` kaydı                                                                                                                                                         |
| EDU-010 | `progressPoints` hedefin bir hafta altında                                                                                                                                                   | tamamlanma haftasını geç, sonraki 3 haftayı da ilerlet                                  | `level === "lisans"` bir kez; `active === null`; ikinci bir tamamlanma hatırası/olayı **yok**                                                                                                                                        |
| EDU-011 | `level === "lisans"` karakter                                                                                                                                                                | Kurs (`grantsLevel: null`) tamamla                                                      | `level` hâlâ `"lisans"`; asla `"lise"`ye düşmez                                                                                                                                                                                      |
| EDU-012 | Kurs tamamlanmış (`fields: ["technical"]`)                                                                                                                                                   | Aynı alanı veren yolu tekrar tamamla                                                    | `fields` `["technical"]` kalır (tekrar yok); üniversite sonrası `["technical", "business"]` — hiçbir eleman kaybolmaz                                                                                                                |

---

## 4. Kariyer testleri

| ID         | Kurulum                                                                                                | Eylem                                                | Beklenen invariant                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| CAREER-001 | `jobId === "market"`                                                                                   | 3 hafta ilerlet                                      | `jobFamilyExperience.hizmet === 3`; `ofis` anahtarı **yok**                                   |
| CAREER-002 | `quitJob()` sonrası işsiz                                                                              | 3 hafta ilerlet                                      | Hiçbir aile artmaz; toplam deneyim değişmez                                                   |
| CAREER-003 | `market` (hizmet) → `office` (ofis) teklifini kabul et, geçiş haftasını `job_start` event'iyle tamamla | geçiş haftasını ilerlet                              | O hafta yalnız **bir** aile +1 alır ve bu **eski** ailedir (`hizmet`); toplam artış tam 1     |
| CAREER-004 | Deneyim 23 / 24 / 71 / 72 hafta                                                                        | `getCareerBand()`                                    | Sırasıyla `entry` / `experienced` / `experienced` / `senior`                                  |
| CAREER-005 | `level: "lise"` karakter                                                                               | `isEligibleForJob()` — `market`, `courier`, `office` | Üçü de `ok === true` (mevcut işler kilitlenmez); `specialist` `ok === false`                  |
| CAREER-006 | `fields: []`, hizmet deneyimi 30 hafta                                                                 | `technician` kontrolü                                | `ok === false`, gerekçe alan eksikliğini söyler; `fields: ["technical"]` olunca `ok === true` |
| CAREER-007 | `fields: ["technical"]`, hizmet deneyimi 10 hafta                                                      | `technician` kontrolü                                | `ok === false`; deneyim 24'e çıkınca `ok === true`                                            |
| CAREER-008 | Uygun olmayan karakter                                                                                 | `specialist` için fırsat event koşulu                | `education_opportunity.condition() === false`                                                 |
| CAREER-009 | Uygun olmayan karakter                                                                                 | `acceptJobOffer("specialist")`                       | `{ ok: false }`; `career.pendingJob === null`; `openCases` büyümedi; `weekly.used` artmadı    |
| CAREER-010 | Eğitim + deneyim dolu karakter                                                                         | `saveGame()` → `loadGame()`                          | `education` ve `jobFamilyExperience` birebir korunur; `validateState().ok`                    |

---

## 5. Simülasyon testleri

`scripts/tc-sim-sim.mjs` yeniden kullanılır — **ayrı büyük simülatör yazılmaz.**
Mevcut betik senaryo parametresi alacak şekilde genişletilir (örn. `process.argv[2]`),
varsayılan davranış **değişmeden** kalır ki mevcut çağrı bozulmasın.

| ID      | Kontrol                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SIM-001 | 144 hafta boyunca her hafta `validateState().ok`; `education.active` ya `null` ya geçerli `pathId`; `progressPoints` her zaman integer ve `0 <= p <= targetPoints` |
| SIM-002 | Full-time üniversite senaryosunda 144 hafta içinde `level === "lisans"` olur ve `education_completed` event'i geçmişte **tam bir kez** görünür                     |
| SIM-003 | Hiçbir `jobFamilyExperience` değeri NaN, negatif veya ondalıklı olmaz; toplam deneyim ≤ geçen hafta sayısı                                                         |
| SIM-004 | Ledger'daki `education` kategorili tahsilat sayısı = eğitimli geçen ay sayısı (fazlası çift tahsilat demektir); `level` yükselmesi tam bir kez                     |

### Senaryo A — Yalnız çalışma

Eğitim yok, mevcut karar döngüsü. **Beklenen:** `hizmet` deneyimi 144'e yakın birikir,
band `senior` olur, `technician` alan eksikliğinden hâlâ kilitli kalır (deneyim tek başına
yetmez), `education.level === "lise"`, tuition tahsilatı **sıfır**.

### Senaryo B — Tam zamanlı üniversite

1. haftada `university` / `full` kaydı. **Beklenen:** ≈105. haftada `level === "lisans"`,
   `fields` `["business"]` içerir, `specialist` uygun hale gelir, `education_opportunity`
   bir kez tetiklenir, tuition tahsilatı ≈26 ay, enerji/stres baskısı `study_workload_pressure`
   event'ini en az bir kez açar, bakiye hiçbir noktada NaN olmaz.

### Senaryo C — Çalışma + yarı zamanlı üniversite

İş korunur, 1. haftada `university` / `part` kaydı. **Beklenen:** 144 haftada
`progressPoints === 288` (< 312) → **eğitim tamamlanmaz ve bu geçerli bir son durumdur**;
`active` hâlâ geçerli; `hizmet` deneyimi paralel birikmiş; hiçbir haftada çift aile kredisi
yok; save/load turlarından sonra ilerleme sıçraması yok.

---

## 6. Kabul ölçütü

```
node --test 'scripts/tc-sim-*.test.mjs'   # 34 mevcut + 26 yeni = 60 PASS
node scripts/tc-sim-sim.mjs               # A/B/C senaryoları PASS
npm run lint
npm run build
```

Mevcut 34 testten herhangi biri düşerse **yeni kodu düzelt, testi değiştirme.**
