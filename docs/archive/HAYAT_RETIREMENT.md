# Hayat — emeklilik kaydı

**Durum:** TarikLab kataloğundan ve public runtime'dan kaldırıldı.
**Tarih:** 2026-09-09
**Son oynanabilir kaynak SHA:** `b9ce0f921c551084025f18161daec55fb390a318`
**Özgün rota:** `/oyna/hayat`

## Neden

Hayat, TC SIM ile aynı türde ama ondan küçük bir yaşam simülasyonuydu.
Katalogda iki yaşam simülasyonu tutmak yerine, Hayat'ın gerçekten ayrı
duran değeri TC SIM'e taşındı ve Hayat kapatıldı. Taşınan ve bilinçli
olarak taşınmayan her kalemin dökümü:

→ [`docs/tc-sim/HAYAT_VALUE_MIGRATION.md`](../tc-sim/HAYAT_VALUE_MIGRATION.md)

Bu bir hata/kalite kararı değil, ürün konsolidasyonudur.

## Kaldırılan shipping dosyaları

```
public/games/hayat/index.html
public/games/hayat/app.js
public/games/hayat/style.css
public/games/next-wave/hayat-life.js
public/games/next-wave/hayat-data.js
scripts/hayat-life.test.mjs
```

Ayrıca paylaşılan dosyalardan yalnız Hayat'a ait olan parçalar çıkarıldı:

- `public/games/next-wave.js` — `defs.hayat`, `hayatApplyChoice()`,
  `hayatAdvance()`, Hayat aksiyon dalları, `MAJORS`/`SHADOWS` yeniden
  dışa aktarımları ve yalnız Hayat'ın kullandığı `rel()` yardımcısı.
  Dosyanın kendisi **silinmedi**: Apartman, Son 100 Gün, Kayıp Telefon
  ve TC SIM: DEVLET bu motoru paylaşmayı sürdürüyor.
- `public/games/next-wave/shared/runtime.js` — `safe` kayıt kipindeki
  `|| id === "hayat"` özel durumu. Kip yaşıyor; Son Kasaba onu
  `engine.safe` seçeneğiyle kullanıyor.
- `public/sw.js` — `/games/hayat/` önbellek girdisi.
- `src/lib/games.ts` — katalog girdisi ve `HTML5_SLUGS` kaydı.
- `public/credits.html`, `public/i18n/tlab-i18n.js` — Kaynaklar girdisi,
  `HELP_EN.hayat`, `CATALOG_EN.hayat`, `hayat.shadow` ve artık yetim kalan
  "Uzun Gölge"/"Gölgeler" sözlük satırları.

`PHRASE["Hayat"] = "Life"` **korundu**: Racon'un kendi "Hayat" sekmesi onu
kullanıyor.

## Kaldırılma anındaki içerik envanteri

| Kaynak | Adet |
|---|---|
| Eylem | 34 |
| İsimli kişi | 10 (Ayla, Kemal, Deniz, Barış, Ece, Selin, Murat, Leyla, Nermin, Onur) |
| Dönüm noktası | 49 |
| Uzun Gölge şablonu | 21 kategori |
| Bölüm | 5 (18–35 yaş) |

## Kayıtlar

Oyuncuların tarayıcısında kalan `tariklab.nextwave.hayat.slot1..3` (ve
`.active`, `.backup`) anahtarları yerinde kalır. Artık hiçbir kod bunları
okumaz veya yazmaz; zararsız yetim veridir. Site genelinde localStorage
taranıp silinmedi ve bu veriler TC SIM kayıtlarına **kopyalanmadı**.

## Geri getirme

Git tam arşivdir; depoda ayrıca bir kopya/ZIP tutulmaz. Emeklilik öncesi
SHA üzerinden herhangi bir dosya okunabilir:

```bash
git show b9ce0f921c551084025f18161daec55fb390a318:public/games/hayat/app.js
git show b9ce0f921c551084025f18161daec55fb390a318:public/games/hayat/index.html
git show b9ce0f921c551084025f18161daec55fb390a318:public/games/hayat/style.css
git show b9ce0f921c551084025f18161daec55fb390a318:public/games/next-wave/hayat-life.js
git show b9ce0f921c551084025f18161daec55fb390a318:public/games/next-wave/hayat-data.js
git show b9ce0f921c551084025f18161daec55fb390a318:scripts/hayat-life.test.mjs
```

Tüm ağacı o haliyle çıkarmak için:

```bash
git worktree add /tmp/hayat-son b9ce0f921c551084025f18161daec55fb390a318
```

Oyunu yeniden yayına almak istenirse gereken asgari iş: yukarıdaki
dosyaları geri getirmek, `next-wave.js` içindeki Hayat dallarını ve
`MAJORS`/`SHADOWS` dışa aktarımlarını geri koymak, `src/lib/games.ts`
katalog girdisini ve `public/sw.js` önbellek yolunu eklemek.
