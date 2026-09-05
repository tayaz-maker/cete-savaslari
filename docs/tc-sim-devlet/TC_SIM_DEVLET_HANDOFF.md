# TC SIM: DEVLET — Devir Notu

## Source of truth

`TC_SIM_DEVLET_MASTER.md` ürün vizyonunun ana kaynağıdır ve
değiştirilmemiştir. Bu proje, TC SIM'in expansion'ı veya Racon Manager
modu değildir; oyuncunun devlet denen sürekli organizmayı yönlendirmeye
çalıştığı ayrı TarikLab oyunudur.

**Mimari kilitlendi.** Vizyondan üretim mimarisine geçiş artık aşağıdaki
8 belgede — Master Architecture / Sprint 0/1 Start görevinin çıktısı:

1. `00_MASTER_ARCHITECTURE.md` — kilitli mimari kararlar, TC SIM'den ne
   alınır/ne alınmaz (bu belgenin `TC_SIM_DEVLET_REUSE_PLAN.md`'de
   başlayan işini somutlaştırır)
2. `01_STATE_SCHEMA.md` — kavramsal state şeması, alan→tüketici tablosu
3. `02_EVENT_CHAIN_CONTRACT.md` — event/openCase yaşam döngüsü kontratı
4. `03_HISTORICAL_DATA_PROVENANCE.md` — T/A/S etiketleme, **gerçek kişi
   kuralı** (projedeki en yüksek riskli karar)
5. `04_TEST_AND_RELEASE_CONTRACT.md` — remote-canonical protokolü, test
   kategorileri, performans hedefleri
6. `05_SPRINT_MAP.md` — bağımlılık sıralı yol haritası (bu belge artık
   `TC_SIM_DEVLET_ROADMAP.md`'nin yerini alır)
7. `06_SPRINT_0_IMPLEMENTATION_BRIEF.md` — iskelet sprinti
8. `07_SPRINT_1_VERTICAL_SLICE_BRIEF.md` — **2002–2005** vertical slice
   (seçim gerekçeli)

## Mevcut durum

Mimari kilitlendi, Sprint 0/1 briefleri hazır. Runtime kodu, katalog
kaydı, save sistemi ve playable prototip **henüz yoktur** — bir sonraki
adım `06_SPRINT_0_IMPLEMENTATION_BRIEF.md`'in uygulanmasıdır.
Prototype era artık TBD değil: **2002–2005**.

## Korunacak ilkeler

- Deterministik motor; AI yalnız anlatım katmanında kullanılabilir
  (bkz. `00` §19, `02` §7).
- Karar otomatik uygulama değildir; uygulama oranı `00` §7'deki tek
  hat üzerinden çalışır.
- Tarihsel, alternatif ve simülasyon üretimi içerik birbirinden
  ayrılmalıdır (bkz. `03`).
- TC SIM'in kanıtlanmış parçaları gerektiğinde uyarlanır; bugün shared
  engine çıkarılmaz (bkz. `TC_SIM_DEVLET_REUSE_PLAN.md`, `00` §1).
