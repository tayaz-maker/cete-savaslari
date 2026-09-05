# TC SIM: DEVLET — Sprint Map

`TC_SIM_DEVLET_ROADMAP.md`'nin kısa taslağını yerini alır (o dosya artık
bu haritaya işaret eder). 64 bölümlük ana tasarım belgesi tek seferde
zamanlanmaz; her faz kendinden önceki fazın gerçekten çalıştığını
kanıtlamasını bekler.

## Faz sırası ve bağımlılıklar

```
Sprint 0 ── Temel/şema/test iskeleti
    │
    ▼
Sprint 1 ── 2002–2005 oynanabilir vertical slice
    │
    ▼
Sprint 2 ── Bilgi Kalitesi derinleşmesi + DNA/Refleks görünürlüğü + Politika Borcu
    │         (Sprint 1'de "türetilir ama gösterilmez" olan §11 fonksiyonları UI'ya çıkar)
    │
    ▼
Sprint 3 ── Ağlar + Medya (networkInterference artık gerçek değer döner)
    │
    ▼
Sprint 4 ── Toplum/Bölge derinleşmesi (kohort sayısı artar, bölge sayısı 4→daha fazla)
    │
    ▼
Sprint 5 ── Dış Politika
    │
    ▼
Sprint 6 ── Tarihsel genişleme (yeni başlangıç dönemleri: 1923, 1950, 1980, Günümüz)
    │
    ▼
Sprint 7 ── 1923→2030 Büyük Kampanya (yalnız Sprint 6 tüm dönemler PASS olduktan sonra)
```

Bu sıra "kutsal" değildir (görev belgesi bunu açıkça söylüyor) ama her
değişiklik bağımlılık zincirini yeniden gerekçelendirmelidir — örn.
Sprint 5 (Dış Politika), Sprint 3'ün (Ağlar) jeopolitik aktörleri
network düğümü olarak modellemesine bağımlı olabilir.

## Her sprint için zorunlu alanlar

| Alan | Anlamı |
|---|---|
| Hedef | Tek cümlelik ürün hedefi |
| Sistemler | Hangi §-numaralı ana belge sistemleri açılır |
| Bağımlılıklar | Hangi önceki sprint'in PASS olması şart |
| Dosyalar/modüller | Muhtemelen dokunulacak `public/games/tc-sim-devlet/js/*` |
| State etkisi | `01_STATE_SCHEMA.md`'de hangi bölüm büyür |
| Save etkisi | `SAVE_VERSION` artar mı, migration gerekir mi |
| Testler | Yeni kategori 1-9 kapsamı (bkz. `04`) |
| Uzun-koşu kabulü | Hangi yeni strateji/checkpoint kanıtı istenir |
| Tarayıcı/mobil kabulü | Yeni ekran varsa duyarlılık kontrolü |
| Model ataması | Sonnet/Luna-Sol/Opus/Grok/Astra |
| Remote yayın kapısı | `04_TEST_AND_RELEASE_CONTRACT.md` §1 |
| Ertelenen kapsam | Bu sprintte bilerek yapılmayanlar |

## Sprint 0 — özet (tam brief: `06_SPRINT_0_IMPLEMENTATION_BRIEF.md`)

Hedef: implementasyonu mümkün kılan iskelet. Oynanabilir içerik yok.
Model: **Luna/Sol**, gerekirse Sonnet ile hızlı iterasyon.

## Sprint 1 — özet (tam brief: `07_SPRINT_1_VERTICAL_SLICE_BRIEF.md`)

Hedef: 2002–2005, 36 ay, Mühür Masası'ndan save/load'a kadar tam ve
gerçekten oynanabilir bir döngü. Model: **Luna/Sol** (birincil), zor bir
entegrasyon/bug çıkarsa **Opus**'a devredilir; **Astra kullanılmaz.**

## Sprint 2 — Bilgi Kalitesi + DNA/Refleks görünürlüğü + Politika Borcu

Hedef: `known`/`reported` ayrımını derinleştirmek (kaynak güvenilirliği,
gecikme, MİT/İçişleri raporu deseni — ana belge §11–12) ve
`00_MASTER_ARCHITECTURE.md` §11'deki türetilmiş DNA/refleks/entropi/borç
fonksiyonlarını gerçek bir ekrana (Devlet DNA'sı, basit bir uyarı
listesi) bağlamak. **Yeni state alanı eklenmez** — bu fazın tüm gücü,
Sprint 1'in zaten yazdığı `archive`/`implementationLog` üzerinde çalışan
okuma fonksiyonlarındadır. Bağımlılık: Sprint 1 PASS + en az 24 aylık
gerçek `archive` verisi üreten bir uzun-koşu kanıtı.

## Sprint 3 — Ağlar + Medya

Hedef: `networks[]`'in gerçek `networkInterference` katsayısı üretmesi
(Sprint 1/2'de sabit `1.0`), basit bir medya kuruluşu modeli (ana belge
§34, küçültülmüş: 3-4 kuruluş, her biri `ideology`/`reach`/`reliability`).
Bağımlılık: Sprint 1 karakter/kurum modeli PASS.

## Sprint 4 — Toplum/Bölge derinleşmesi

Hedef: kohort sayısını (9→daha fazla) ve bölge sayısını (4→daha fazla,
81'e doğru kademeli) artırmak; nesil sistemi (§18) burada başlar.
Bağımlılık: Sprint 1'in kohort/bölge şeması (zaten ölçeklenebilir
tasarlandı, bkz. `00` §13–14) — yeniden mimari gerekmez, veri genişler.

## Sprint 5 — Dış Politika

Hedef: ülke-bazlı çok eksenli ilişki modeli (ana belge §39–40).
Bağımlılık: Sprint 3'ün ağ/düğüm altyapısı (ülkeler de birer düğüm
olarak modellenebilir).

## Sprint 6 — Tarihsel genişleme

Hedef: 1923, 1950, 1980, Günümüz başlangıç senaryolarını aynı motora
eklemek. Her yeni dönem kendi `03_HISTORICAL_DATA_PROVENANCE.md`
uygulamasını (özellikle 1980 için gerçek-kişi kuralının sıkı uygulanması)
ve kendi UI dönem-derisini (ana belge §51) gerektirir. Bağımlılık:
Sprint 1–5 tek bir dönemde PASS.

## Sprint 7 — 1923→2030 Büyük Kampanya

Hedef: prestij modu, ~1284 aylık tam kampanya. Bağımlılık: Sprint 6'nın
TÜM dönemleri ayrı ayrı PASS + `04`'teki 1284 ay sentetik stres testinin
performans hedefini karşılaması. **Bu faz Astra'nın ilk makul giriş
noktasıdır** (tam regresyon + prodüksiyon kabulü, bkz. `00` Model Planı).

## Model giriş noktaları

- **Grok:** Sprint 1'den itibaren her fazda içerik/gerçekçilik
  red-team'i olarak paralel çalışabilir (mimariye dokunmaz, event/
  karakter içeriği önerir — `03`'teki provenance kuralına tabi).
- **Opus:** yalnız bir sprint içinde gerçek bir "hard integration/deep
  bug/git kurtarma" ihtiyacı doğduğunda devreye girer, rutin inşa için
  önerilmez.
- **Astra:** yalnız Sprint 7'de (ve gerekirse büyük bir çok-sistemli
  kapanışta) — rutin sprint kapanışı için ASLA önerilmez.
