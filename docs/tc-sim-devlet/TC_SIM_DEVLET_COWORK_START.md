# TC SIM: DEVLET — Cowork Başlangıç Belgesi

## COWORK FAST START

**Baseline:** TC SIM sertleştirme checkpoint'i `496d4a8` (branch
`claude/grok-game-screen-design-8fa30d`). Bu foundation branch'i:
`claude/tc-sim-devlet-foundation`. **DEVLET runtime kodu henüz YOKTUR** — ilk uygulama görevi
sensin.

**Prototip dönem (KİLİTLİ):** `restructuring_2002` — "2002 — Yeniden Yapılanma", **36 ay**
(2002-01 → 2004-12). Tartışmaya açma; gerekçe `TC_SIM_DEVLET_PROTOTYPE.md §1`.

**Önce oku (bu sırayla, tamamı ~4 belge):**

1. Bu belge (tamamı)
2. `TC_SIM_DEVLET_ARCHITECTURE.md` — ADR tablosu + §4 boru hattı + §5 uygulama oranı
3. `TC_SIM_DEVLET_PROTOTYPE.md` — kapsam ve içerik bütçesi
4. `TC_SIM_DEVLET_TEST_PLAN.md` — testleri kodla birlikte yaz

`TC_SIM_DEVLET_MASTER.md` ürün vizyonudur; **prototip kapsamı değildir**, baştan sona okuma.

**İlk dosyalar (sırayla):** `js/data/eras.js` → `js/data/indicators.js` → `js/state.js` →
`js/save.js` → `js/time.js` → `js/data/institutions.*` → `js/data/actors.*` →
`js/implementation.js` → `js/events.js` + `js/data/events.*` → `js/files.js` →
`js/appointments.js` → `js/economy.js` + `js/society.js` → `js/report.js` → `js/app.js` +
`js/navigation.js` + `styles.css` + `index.html` → testler → simülasyon.

**Değişmez 8 kural:**

1. **Karar ≠ uygulama.** Her sayısal etki `rate/100` ile ölçeklenir. Tek mutasyon noktası
   `resolveDecision()` içindedir.
2. `computeImplementationRate()` **`breakdown` döndürmek zorundadır** (arayüz ve test okur).
3. **Gizli gerçek stat asla raporlanan değerle ezilmez.** `report()` saf fonksiyondur, çıktısı
   state'e yazılmaz.
4. Save anahtarı `tc-sim-devlet-save` — TC SIM'den **tamamen ayrı**. Migration zinciri ilk
   günden kurulur ve **her dal `meta.saveVersion` damgasını yazar**.
5. Motor dosyaları içerik sabiti barındırmaz; kurum/aktör/event/dönem verisi `js/data/` altında.
6. Event seçimi **açık `priority`** ile deterministik — dizi sırasına güvenilmez.
7. Gecikmeli sonuç ve arşiv kaydı **tam bir kez**; çözülen `stateFile` arşive taşınıp listeden çıkar.
8. Deterministik motor: rastgelelik yalnız `meta.rngState` üzerinden ve sınırlı (±5). LLM yok.

**Kapsam sınırı (aşma):** 5 kurum · 12 aktör · 20 event · ~45 seçenek · 4 boşluk ·
6 gösterge · 6 çalışan bölüm. Pasif/sahte sekme yok. Bütçe aşımı kapsam ihlalidir.

**Komutlar:**

```
node --test 'scripts/tc-sim-devlet-*.test.mjs'   # 38 test hedefi
node scripts/tc-sim-devlet-sim.mjs A|B|C          # üç deterministik senaryo
node scripts/tc-sim-devlet-longrun.mjs fuzz       # 20 seed × 120 ay
node --test 'scripts/tc-sim-*.test.mjs'           # TC SIM 83/83 — BOZULMAMALI
npm run lint && npm run typecheck && npm run build
```

**Dokunma:** `public/games/tc-sim/**` ve `scripts/tc-sim-*` (TC SIM runtime'ı ve testleri) ·
`docs/tc-sim/**` · diğer oyunlar · `src/**` · `src/routeTree.gen.ts` (üretilmiş dosya, commit'e
girmemeli). TC SIM'i ortak motora çevirme (ADR-05).

---

## İlk uygulama dosya haritası

| #   | Dosya                                                       | Sorumluluk                                                                                      | Bağımlı    | İlk test                     |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------- | ---------------------------- |
| 1   | `js/data/eras.js`                                           | `restructuring_2002` tanımı, başlangıç tarihi                                                   | —          | DEVLET-ERA-01                |
| 2   | `js/data/indicators.js`                                     | 6 gösterge id/etiket/aralık                                                                     | —          | DEVLET-STATE-01              |
| 3   | `js/state.js`                                               | `createNewGame`, `normalizeDevletState`, `validateState`, `clamp`, `appendCapped`, `nextRandom` | 1, 2       | DEVLET-STATE-01..04          |
| 4   | `js/save.js`                                                | `SAVE_KEY`, sürüm, migration zinciri, backup/recovery                                           | 3          | DEVLET-SAVE-01..04           |
| 5   | `js/time.js`                                                | `advanceMonth`, ay/yıl sonu                                                                     | 3          | DEVLET-TIME-01..03           |
| 6   | `js/data/institutions.restructuring_2002.js`                | 5 kurum başlangıç verisi                                                                        | 1          | DEVLET-ERA-02                |
| 7   | `js/data/actors.restructuring_2002.js`                      | 12 aktör (görünür + gizli)                                                                      | 1, 6       | DEVLET-STATE-03              |
| 8   | `js/implementation.js`                                      | `computeImplementationRate` + `breakdown`                                                       | 3, 6       | DEVLET-IMP-01..05            |
| 9   | `js/report.js`                                              | Bilgi kalitesi çarpıtması                                                                       | 3          | DEVLET-INFO-01..03           |
| 10  | `js/events.js`                                              | Uygunluk, `priority` sıralama, `resolveDecision`                                                | 3, 5, 8, 9 | DEVLET-EVENT-_, DEVLET-DEC-_ |
| 11  | `js/data/events.restructuring_2002.js`                      | 20 event içeriği                                                                                | 10         | DEVLET-EVENT-01              |
| 12  | `js/files.js`                                               | `stateFile` yaşam döngüsü + arşiv geçişi                                                        | 3, 5       | DEVLET-FILE-01..03, ARC-01   |
| 13  | `js/appointments.js`                                        | Boşluk, aday, atama                                                                             | 3, 7, 9    | DEVLET-APP-01..04            |
| 14  | `js/economy.js`, `js/society.js`                            | Agregat ay sonu güncellemeleri                                                                  | 3, 5       | DEVLET-ECO-01, SOC-01        |
| 15  | `index.html`, `styles.css`, `js/navigation.js`, `js/app.js` | 6 bölüm, Mühür Masası                                                                           | hepsi      | tarayıcı turu                |
| 16  | `scripts/tc-sim-devlet-core.test.mjs`                       | 38 test                                                                                         | hepsi      | —                            |
| 17  | `scripts/tc-sim-devlet-sim.mjs`                             | A/B/C senaryoları                                                                               | hepsi      | —                            |
| 18  | `scripts/tc-sim-devlet-longrun.mjs`                         | Uzun koşu + fuzz                                                                                | hepsi      | —                            |

---

## Uygulama sırası (DAG)

```
1  veri iskeleti (eras + indicators)
2  state (oluştur / normalize / doğrula)
3  save + migration            ← 4'e geçmeden testleri yeşil olmalı
4  zaman (advanceMonth)
5  kurum + aktör verisi
6  uygulama oranı  ← imza mekaniği; erken ve tek başına test edilir
7  bilgi kalitesi (report)
8  event motoru + karar çözümü
9  dosyalar + arşiv
10 atamalar
11 ekonomi + toplum
12 arayüz (6 bölüm)
13 testler (38)
14 senaryolar A/B/C + uzun koşu/fuzz
```

**Adım 3 yeşil olmadan adım 4'e geçme.** TC SIM'de en pahalı hata migration'daydı.
**Adım 6'yı arayüzden önce test et:** uygulama oranı yanlışsa oyunun tamamı yanlıştır.

---

## Kabul kriterleri (Stage 1 bitti demek için)

`TC_SIM_DEVLET_TEST_PLAN.md §5`'teki 12 maddenin tamamı. Özet:
36 ay kesintisiz oynanır · en az bir karar belirgin eksik uygulanır ve `breakdown` görünür ·
en az bir atama gecikmeli sonuç üretir · en az bir dosya açılıp vadesinde tetiklenip arşive
gider · en az bir arşiv kaydı event koşulu olarak geri döner · save/load kayıpsız ·
38 test + A/B/C senaryoları + fuzz geçer · TC SIM 83/83 bozulmamıştır.

---

## İçerik yazarken

- Kaynağa dayanması gerekenler ile simülasyon soyutlaması olanlar ayrıdır
  (`ARCHITECTURE §16`). Gizli stat asla gerçek iddia gibi sunulmaz.
- Tartışmalı konu `contested: true` ve kesin bilgi gibi yazılmaz.
- Devlet şeytan değil, aziz değil; halk aptal değil, melek değil. Aktörler propaganda
  karikatürü değildir. Dönem kendi bağlamıyla ele alınır; bugünün değerleri geçmişe mekanik
  olarak yapıştırılmaz. Karanlık içerik iktidar mekanizmasını açıklamak içindir, şok için değil.
- Mizah bürokratik absürtlükten doğar; Racon/Mahalle dili kullanılmaz.
- Dört ses yalnız `significance: "high"` eventlerde beklenir; diğerlerinde resmî + koridor yeter.

---

## Bu görevde yapılmayacaklar

Devlet DNA'sı · entropi · politika borcu mekaniği · yol bağımlılığı · ağ/klik simülatörü ·
medya motoru · söylenti · kompromat · nesiller · bölgeler/81 il · dış politika · seçim ·
tarihsel çekim · kelebekler ekranı · 1923–2030 kampanyası · diğer dönemler · LLM entegrasyonu ·
TC SIM'den ortak motor çıkarma · TC SIM runtime'ına dokunma.
