# TC SIM: DEVLET — Sprint 1 Vertical Slice Brief

**Model:** Luna/Sol (birincil). Zor bir entegrasyon/derin hata çıkarsa
Opus'a devredilir. **Astra bu sprintte kullanılmaz.**
**Mod:** Gerçekten oynanabilir, uçtan uca tek bir döngü. İçerik hacmi
küçük tutulur; derinlik ve döngünün gerçekliği önceliklidir.

## 0. Seçilen dönem ve gerekçe

**Seçim: 2002–2005** (2002 Ocak – 2004 Aralık, 36 ay).

| Kriter | 2002–2005 | 1980–1983 |
|---|---|---|
| "Devlet, hükümet değil" kanıtı | Güçlü — bürokratik direnç + IMF programı sürekliliği, askerî mekanik merkezde değil | Güçlü ama askerî yönetim merkezde — "güvenlik-devleti simülatörü" izlenimi riski |
| Kurumsal çatışma | Maliye/MB/Yargı/İçişleri/Ordu arasında somut, tarihsel belgeli gerilim | Daha da yoğun ama neredeyse tek eksenli (düzen vs özgürlük) |
| Ekonomi | En güçlü aday — 2001 sonrası disiplin programı, faiz/enflasyon/işsizlik zinciri ders kitabı gibi net | Kriz var ama nedensellik daha az legible |
| Bilgi kalitesi | Makul, aşırıya kaçmadan uygulanabilir | Sansür bağlamında daha ağır, Sprint 1'in "minimal" hedefiyle orantısız |
| Atama | Zengin (kabine, MB Başkanı yeni-bağımsız, valilik) | Zengin ama askerî komuta zinciriyle iç içe |
| Uygulama oranı kanıtı | En güçlü aday — AB uyum paketlerinin kâğıt-üstü/sahada farkı belgeli | Var ama askerî emir zincirinde "uygulanmama" daha az inandırıcı |
| Toplumsal ısı | Orta — 1999 deprem borcu, laiklik-muhafazakârlık, AB-iyimserliği vs ekonomik acı | Yüksek ama şiddet-ağırlıklı, ilk prototipin duygusal varsayılanı olmasın istiyoruz |
| Tarihsel içerik yükü/risk | Yaşayan kurucu figürler var ama kural (`03` §2) ikisinde de aynı şiddette işler; 2002 günlük hayata daha yakın, daha az "darbe meşruiyeti" tartışması taşır | Gerçek bir darbenin adları/meşruiyeti etrafında daha hassas |
| UI/içerik yükü | Faks/Excel/erken internet — CSS-öncelikli "belge" estetiğiyle hızlı üretilebilir | Daktilo/CRT/mühür — üretilebilir ama dönem-doğru detay daha çok araştırma ister |
| İlk prototipte eğlence | "Krizden çıkış, güveni yeniden kurma" doğal 36 aylık yay | Repression-cost mekaniği baskın olursa "devlet olma hissi" yerine "otoriter yönetim hissi" öne çıkabilir |

**Reddedilen alternatif: 1980–1983.** Daha dramatik kurumsal çatışma
sunar ama askerî yönetimi ve gerçek bir darbeyi merkeze koyar; bu, ilk
izlenimi "devleti yönlendirmeye çalışan kırılgan organizma" yerine
"güvenlik aygıtını yöneten otorite" yapma riski taşır — ürün kimliğiyle
(§0, "Oyuncu aziz değildir, devlet şeytan değildir") çelişmez ama ilk
prototip için yanlış vurgu olur. Ayrıca tarihsel-içerik hassasiyeti
(gerçek darbe liderleri, yargılamalar, ölüm cezaları) ilk sprint için
gereksiz yere yüksek risk taşır. 2002–2005 aynı mimari derinliği daha
düşük risk ve daha net ekonomik nedensellikle kanıtlayabiliyor.

## 1. Oynanabilir döngü (kabul kriterinin özeti)

```
YENİ OYUN → senaryo: "2002-2005" (tek seçenek, Sprint 1'de senaryo seçimi yok)
  → Mühür Masası (brifing: ekonomi özeti, kurum uyarıları, bekleyen atama)
  → state/rapor incele (known vs reported farkı en az bir göstergede görünür)
  → en az bir atama VEYA politika kararı ver
  → ayı ilerlet
  → uygulama oranı niyetten farklı çıkar (görünür biçimde: "karar %X uygulandı")
  → ekonomi/toplum/kurum state'i değişir
  → tarihsel VEYA sistemik bir event tetiklenir
  → event'e bir seçimle cevap verilir
  → gecikmeli sonuç (openCase) daha sonraki bir ayda tekrar ortaya çıkar
  → arşive kayıt düşer
  → save
  → reload
  → simülasyon kaldığı yerden devam eder, sonuç çoğalmaz/kaybolmaz
```

## 2. Dahil edilen sistemler (minimum içerik, tam mekanik)

- **Mühür Masası** — tek ana ekran, TC SIM'in ana dashboard deseninden
  UI iskeleti ödünç alınır (yeniden çizilir, kopyalanmaz).
- **7 devlet göstergesi** (ana belgenin 11'inden seçilmiş): Devlet
  Kapasitesi, Kurumsallık, Toplumsal Rıza, Toplumsal Isı, Mali Güç,
  Bilgi Kalitesi, Devlet Entropisi. **Dışarıda bırakılan 4:** Dış Güç
  (Sprint 5'e kadar dış politika yok), Gayriresmî Güç ve Anlatı Kontrolü
  (Sprint 3 medya/ağ sistemine bağımlı, erken göstermek anlamsız bir
  sayı olur), Kurumsal Hafıza (zaten `archive`/`institutionHistory`
  olarak var, ayrı bir üst gösterge Sprint 2'nin türetim ekranına
  bırakılır).
- **5 kurum:** Maliye, Merkez Bankası, İçişleri/Mülkiye, Yargı, Silahlı
  Kuvvetler (bkz. `00_MASTER_ARCHITECTURE.md` §9 gerekçesi).
- **10–20 karakter**, `03_HISTORICAL_DATA_PROVENANCE.md` kuralına tam
  uygun (≈%22 T / %78 S, gerçek kişi asla oynanabilir kart değil).
- **Atama:** en az bir kurumun başını değiştirme mekaniği tam
  fonksiyonel (aday listesi, atama sonucu institution.politicalAlignment/
  autonomy etkileşimi, careerHistory kaydı).
- **Event/openCase motoru:** `02_EVENT_CHAIN_CONTRACT.md` tam kontrat,
  en az 8–12 gerçek event tanımı (karışık T/A/S), en az 2 tanesi
  gecikmeli follow-up zinciri taşır.
- **Toplumsal ısı:** 9 kohort (bkz. `00` §13), ulusal + 4 bölge kırılımı.
- **Ekonomi:** `00_MASTER_ARCHITECTURE.md` §12'deki 6 makro değişken ve
  somut formüller.
- **Gerçek uygulama oranı:** her politika kararı `applyPolicyPipeline`
  üzerinden geçer, oyuncuya açıkça "niyet %100, gerçek uygulama %54"
  gibi bir sayı gösterilir.
- **Basit arşiv:** `01_STATE_SCHEMA.md`'deki `archive[]` şeması dolu
  kayıtlarla çalışır durumda (dört ses hepsi doldurulmak zorunda değil,
  ama en az 2-3 büyük event dört sesi de kullanır).
- **Kâğıt Türkiye / Gerçek Türkiye:** en az ekonomi göstergelerinden
  birinde (örn. işsizlik) `known` değeri `actual`'dan görünür biçimde
  sapar ve oyuncu bunu bir raporun güvenilirlik notunda görür.
- **Bilgi kalitesi:** minimal biçimde — bir raporun yanında güvenilirlik
  yüzdesi gösterilir; tam kaynak-ağacı (§11 "Valilik/Emniyet/muhbir"
  kırılımı) Sprint 2'nin konusu.
- **Save/load.**
- **Duyarlı UI** (320/390/768/masaüstü).

## 3. Kapsam dışı (bilinçli, görev belgesi §9/§12 ile birebir)

Hortum Haritası, tam 81 il, tam dış politika, nesiller, kompromat
imparatorluğu, 107 yıllık kampanya, AI anlatım/API, Devlet DNA'sı/
Refleks/Entropi/Politika Borcu **ekranları** (fonksiyonlar var ama
gösterilmiyor — bkz. `00` §11), medya motoru, söylenti motoru, kirli
ağlar, tam istihbarat/kompromat mekaniği (veri şekli var, kullanım
mekaniği yok).

## 4. Test ve kabul

`04_TEST_AND_RELEASE_CONTRACT.md`'nin 9 kategorisinin tümü Sprint 1'de
zorunludur (Sprint 0'da yalnız 1/3 yeterliydi). Özellikle:

- **Kategori 2 (reachability):** her event gerçek `advanceMonth` zinciriyle
  tetiklenerek kanıtlanır, hiçbiri yalnız doğrudan resolver çağrısıyla
  "PASS" sayılmaz.
- **Kategori 5 (uzun koşu):** dört strateji (`institutionalist`,
  `stability-first`, `spending-heavy`, `market-first`) 36 ay boyunca
  koşturulur, checkpoint'ler (ay 12/24/36) kaydedilir, sonuçların
  gerçekten ayrıştığı ölçülür — TC SIM'in 18–35 Core kapanışındaki
  "savingsMultiple" kanıtının DEVLET karşılığı (örn. bir
  "kurumsallıkEndeksi" veya "toplumsalGüvenEndeksi" metriği).
- **Kategori 7–9:** en az bir gerçek tarayıcı smoke koşusu, `/oyna/tc-sim-devlet`
  route'u üzerinden (bu sprintte katalog `status: "live"` olabilir,
  çünkü artık gerçekten oynanabilir).

## 5. Sprint kapanışında değişecek katalog durumu

Sprint 1 PASS olduğunda (ve yalnız o zaman): `src/lib/games.ts`
içindeki `tc-sim-devlet` satırı `status: "live"`, `href: "/oyna/tc-sim-devlet"`
olur. Bu değişiklik Sprint 1'in kendi kapanış commit'inin bir parçasıdır,
Sprint 0'da veya bu mimari görevde YAPILMAZ.

## 6. Kapanış raporu

`04_TEST_AND_RELEASE_CONTRACT.md` §7 şablonu + ek olarak "VERTICAL SLICE
KANITI" satırı: dört stratejinin 36. ay checkpoint'lerinin özet
karşılaştırması (TC SIM 18-35 raporundaki "ECONOMY COMPARISON" bölümünün
DEVLET karşılığı).
