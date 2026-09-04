# TC SIM: DEVLET — Devir Notu

## Uygulamaya başlayacaksan

**Önce `TC_SIM_DEVLET_COWORK_START.md` oku.** Bu belge yalnız bağlam özetidir.

## Belge haritası

| Belge                           | Görevi                                                                     |
| ------------------------------- | -------------------------------------------------------------------------- |
| `TC_SIM_DEVLET_MASTER.md`       | Ürün vizyonu ve tasarım yeminleri. Uzun; prototip kapsamı değildir.        |
| `TC_SIM_DEVLET_ARCHITECTURE.md` | State, motor, veri, event, save, uygulama oranı, ADR'ler, riskler.         |
| `TC_SIM_DEVLET_PROTOTYPE.md`    | İlk dilim: dönem, göstergeler, kurumlar, aktörler, içerik bütçesi, arayüz. |
| `TC_SIM_DEVLET_REUSE_PLAN.md`   | TC SIM'den ne alınır, ne alınmaz (gerçek koda karşı doğrulanmış).          |
| `TC_SIM_DEVLET_TEST_PLAN.md`    | 18 invariant, 38 test, 3 senaryo, uzun koşu/fuzz planı.                    |
| `TC_SIM_DEVLET_COWORK_START.md` | Uygulama hızlandırıcı: dosya haritası, DAG, kabul kriterleri.              |
| `TC_SIM_DEVLET_ROADMAP.md`      | Aşama sırası (her aşama bir soruyu cevaplar).                              |

## Source of truth

TC SIM'in expansion'ı veya Racon Manager modu değildir; oyuncunun devlet denen sürekli
organizmayı **yönlendirmeye çalıştığı** ayrı TarikLab oyunudur. Ayrı save, ayrı state,
ayrı runtime, ayrı ürün kimliği.

## Mevcut durum

**Tasarım ve mimari kilidi tamamlandı. Runtime kodu, katalog kaydı, save sistemi ve playable
prototip henüz YOKTUR.**

- Prototip dönem: **`restructuring_2002`** — "2002 — Yeniden Yapılanma", 36 ay. **Kilitli.**
- Ana tur: 1 ay. Göstergeler: 6. Kurumlar: 5. Aktörler: 12. Eventler: 20.
- Save anahtarı: `tc-sim-devlet-save` (TC SIM'den tamamen ayrı).
- Referans aldığı TC SIM checkpoint'i: `496d4a8` (83/83 test, 1040 haftalık koşu temiz).

## Korunacak ilkeler

- **Karar ≠ uygulama.** Oyunun imza mekaniği; her sayısal etki uygulama oranından geçer.
- Deterministik motor; rastgelelik seed'li ve sınırlı. AI yalnız anlatım katmanında
  kullanılabilir, çekirdek simülasyona sokulmaz.
- Gizli gerçek değer ile raporlanan değer birbirine karışmaz.
- Motor ile içerik (dönem/kurum/aktör/event) ayrıdır; dönem eklemek motor değiştirmez.
- Save disiplini ilk günden: sürüm, migration zinciri, normalizasyon, doğrulama, yedek,
  kurtarma, idempotans.
- Sınırlı büyüme: her liste tavanlı; çözülen dosyalar arşive taşınıp listeden çıkarılır.
- TC SIM'in kanıtlanmış parçaları **kopyalanıp uyarlanır**; bugün ortak motor çıkarılmaz.
- Tarihsel, alternatif ve simülasyon üretimi içerik birbirinden ayrılır; tartışmalı iddialar
  kesin bilgi gibi sunulmaz.

## Sıradaki tek iş

**Aşama 1 — dikey dilim implementasyonu.** `TC_SIM_DEVLET_COWORK_START.md` içindeki
18 maddelik dosya haritası ve 14 adımlık DAG takip edilir. Kapsam bütçesi aşılmaz.
