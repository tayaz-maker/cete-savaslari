# TC SIM — Aşama 3B Uygulama Sonrası Devir Notu

3B runtime olarak uygulanmıştır; yeniden audit veya yeniden tasarım gerekmez.

> **Sonraki tur:** 3B sonrası sürüm sertleştirmesi tamamlandı —
> `TC_SIM_HARDENING_REPORT.md`. Doğrulama komutları, exploit/migration matrisi, uzun koşu ve
> fuzz sonuçları oradadır ve bu belgedekilerin yerine geçer. Önce onu oku.

## CHECKPOINT

- Accelerator (tasarım) commit: `f7f1a19`
- Uygulama bu commit'in doğrudan devamındadır; force push veya history rewrite yapılmadı.

## IMPLEMENTED

- `education` state'i: `level` · `fields` (append-only, dedupe) · `active` · `tuitionOwedThisMonth`
- `career.jobFamilyExperience`: iş ailesi başına **tam sayı hafta** sayacı
- İki eğitim yolu: `vocational_course` (78 puan) ve `university` (312 puan); tam `+3`, yarı `+2` puan/hafta
- Kayıt (peşin ücret, iade yok) ve bırakma (ilerleme kaybı); ikisi de **karar hakkı tüketmez**
- Haftalık tick: deneyim kredisi + eğitim ilerlemesi + tamamlanma, mevcut `flags.lastLifeLoadWeek` guard'ının içinde
- Eğitim yükü mevcut hayat yükü hesabına üçüncü girdi olarak giriyor
- Ay sonu: aylık eğitim ücreti tam bir kez tahsil, sonra sıfırlanıyor
- Merkezî `isEligibleForJob()`; teklif kabulü, event koşulları ve arayüz aynı fonksiyonu kullanıyor
- İki yeni iş: `technician` (alan + 24 hafta deneyim) ve `specialist` (lisans + alan)
- 5 event: tamamlanma bildirimi, iki fırsat, iş+okul yükü baskısı, eğitim ücreti baskısı
- EĞİTİM ekranı + İŞ ekranında alan/deneyim/bant/gereksinim/kilit gerekçesi

## FILES CHANGED

| Dosya                                  | Değişiklik                                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `public/games/tc-sim/js/education.js`  | **yeni** — veri tabloları, rank/bant helper'ları, uygunluk kontrolü                           |
| `public/games/tc-sim/js/state.js`      | `SAVE_VERSION = 4`, yeni varsayılanlar, `normalizeEducationCareer()`, doğrulama               |
| `public/games/tc-sim/js/save.js`       | `migrateV3()` dalı + her dalda ortak normalizasyon                                            |
| `public/games/tc-sim/js/life.js`       | haftalık deneyim/ilerleme/tamamlanma, `enrollEducation()`, `stopEducation()`, uygunluk kapısı |
| `public/games/tc-sim/js/time.js`       | ay sonunda eğitim ücreti tahsili                                                              |
| `public/games/tc-sim/js/catalog.js`    | mevcut işlere `family`, iki yeni iş                                                           |
| `public/games/tc-sim/js/events.js`     | 5 yeni event tanımı                                                                           |
| `public/games/tc-sim/js/app.js`        | `renderEducation()`, İŞ ekranı eklemeleri, buton dinleyicileri                                |
| `public/games/tc-sim/js/navigation.js` | EĞİTİM nav öğesi                                                                              |
| `public/games/tc-sim/styles.css`       | yalnız yeni eğitim panelleri için sınıflar                                                    |
| `scripts/tc-sim-3b.test.mjs`           | **yeni** — 34 test                                                                            |
| `scripts/tc-sim-sim.mjs`               | senaryo desteği + 3B invariantları (varsayılan çalıştırma değişmedi)                          |
| `scripts/tc-sim-core.test.mjs`         | sabit `3` yerine `SAVE_VERSION` (sürüm yükseldiği için)                                       |

## STATE VERSION

- `SAVE_VERSION`: **3 → 4**
- Zincir: `<2 → mergeLegacy` · `=2 → migrateV2` · `=3 → migrateV3` · diğer → `normalizeCurrentEra`
- Her daldan sonra `normalizeEducationCareer()` çalışır, sonra `validateState()`.
- v3 kayıtlarda iş, bekleyen iş, para, konut, beden, NPC, ilişki, NPC hafızası, açık dosya, geçmiş, flag ve dönem korunur.
- Geçmişe dönük deneyim tahmini **yapılmaz**; deneyim migration haftasından itibaren birikir.
- Migration aynı kayda tekrar uygulandığında state bozulmaz (test 5).

## IMPORTANT INVARIANTS

1. Haftalık deneyim + eğitim ilerlemesi hafta başına tam bir kez (`flags.lastLifeLoadWeek`).
2. Bir hafta asla iki iş ailesine kredi yazmaz; işsiz hafta kredi yazmaz.
3. İş geçişi event çözümünde olduğu için geçiş haftasının kredisi eski işe yazılır.
4. `education.level` asla geriye düşmez; `fields` asla eleman kaybetmez ve tekrar içermez.
5. Tamamlanma tam bir kez; ödül tick'te verilir, event'in çözülmesine bağlı değildir.
6. Aylık eğitim ücreti ay sonunda tam bir kez; eğitimi bırakmak o ayın borcunu silmez.
7. `progressPoints` her zaman tam sayı ve `0 … targetPoints` aralığında.
8. Uygunluk sağlanmadan teklif kabul edilemez; arayüz ve motor aynı helper'ı kullanır.
9. Mevcut üç giriş işi gereksinimsizdir; hiçbir kayıt işsiz kalacak şekilde kilitlenemez.
10. Haftada en fazla 2 karar invariantı korunur; eğitim kaydı/bırakması slot tüketmez.

## TESTS

```
node --test 'scripts/tc-sim-*.test.mjs'     # 3B turunda 68/68; sertleştirme sonrası 83/83
npm run lint                                # PASS
npm run typecheck                           # PASS
npm run build                               # PASS
```

`npm test` (tüm depo) 217 testten 202'sini geçirir. Kalan **15 failure 3B ile ilgisizdir ve
bu çalışmadan önce de vardı** (app-env, share-card meta, og:image, auth şeması, CLI symlink).
Aynı 15 failure `f7f1a19` baseline'ında da görülür — doğrulandı.

## SIMULATION

```
node scripts/tc-sim-sim.mjs           # base  — varsayılan, 3B öncesiyle aynı akış
node scripts/tc-sim-sim.mjs work      # yalnız çalışma
node scripts/tc-sim-sim.mjs full      # tam zamanlı üniversite
node scripts/tc-sim-sim.mjs part      # çalışma + yarı zamanlı üniversite
```

Dördü de 144 hafta boyunca PASS (exit 0, `problems: []`):

- **work**: `hizmet` deneyimi 144 hafta, seviye `lise`, eğitim ücreti alınmadı.
- **full**: 104. haftada üniversite bitti → `lisans` + `business`, tamamlanma **tam 1**,
  26 aylık ücret tahsil edildi (çift tahsilat yok) ve `specialist` işi gerçekten açıldı.
- **part**: 144. haftada ilerleme **288/312**, eğitim hâlâ aktif ve state geçerli — beklenen sonuç.

Arayüz ayrıca gerçek Chromium'da iframe içinde doğrulandı: EĞİTİM sekmesi açılıyor, kayıt ücreti
düşüyor, karar hakkı tüketilmiyor, ilerleme `3/312` görünüyor, `specialist` kartı kilitli ve
gerekçesi ("Lisans mezunu olman gerekiyor.") gösteriliyor, mevcut ekranlar bozulmadı, sayfa hatası yok.

## KNOWN LIMITATIONS

- `finances.ledger` 120 kayıtla sınırlı olduğu için uzun oyunda eski eğitim ücreti satırları
  pencereden düşer. Bu mevcut bounded-history disiplinidir, hata değildir; simülasyon bu yüzden
  sayaç yerine "aynı haftada çift tahsilat" kontrolü yapar.
- ~~Aynı ay içinde pahalı programı bırakıp ucuz programa geçen oyuncu o ayın borcunu
  düşürebilir.~~ **Sertleştirme turunda düzeltildi:** o ayın eğitim borcu artık monotoniktir
  (`TC_SIM_HARDENING_REPORT.md`, bulgu 1).
- İki eğitim üst üste çok kısa aralıkla biterse tek bildirim event'i görünür; **ödüller yine de
  ikisi için de verilir** (ödül tick'te). Prototipte pratikte oluşmaz.
- `onlisans` seviyesi rezerve; hiçbir yol onu vermiyor (tasarım gereği).
- Simülasyon botu iş teklifi kabul etmediği için açılan işe **geçiş** senaryosu birim testlerle
  kapsanır (test 24, 30, 31), 144 haftalık koşuda değil.

## FINAL VERIFICATION

1. `git log -1` ile branch ve commit'i doğrula.
2. `node --test 'scripts/tc-sim-*.test.mjs'` → 68/68 bekleniyor.
3. Dört senaryoyu çalıştır (`base`, `work`, `full`, `part`) → hepsi exit 0, `problems: []`.
4. `npm run lint && npm run typecheck && npm run build` → PASS.
5. `git diff f7f1a19 --stat` ile değişimin yalnız TC SIM dosyalarında olduğunu doğrula
   (`src/routeTree.gen.ts` gibi üretilmiş dosyalar bilinçli olarak commit dışında bırakıldı).

Bunlar geçiyorsa 3B tamamdır; runtime iş kalmamıştır.
