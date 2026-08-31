# Son Mahalle Bükücü — test ve analiz raporu

Kapsam: `public/games/bukucu/` (tek dosya oyun + service worker + manifest).
Test edilen sürüm: `smb-rev 7` (commit `ecb34e4`). Düzeltmeler `smb-rev 8`.

---

## 1. Nasıl test edildi

Oyun tarayıcı kapalı kutu olarak sürüldü — kaynak koda çengel atmadan,
sadece ekrandaki düğmelere basılarak ve `localStorage`'daki oyun durumu
okunarak.

| Yöntem          | Ne yapar                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Fuzz**        | Chromium'da 20 tam oyun (2/3/4 kişi + Naci Bey). Her adımda ekrandaki düğmelerden birine basar, ardından oyun durumunun 18 değişmez kuralını doğrular. |
| **Senaryo**     | `localStorage`'a el yapımı bir tahta yazılıp tek bir kural sınanır: nezaretten çıkış, senet sırası, iflas, satın alma, tuval ölçeği…                   |
| **Görsel**      | 8 ekran boyutunda (320×568 → 1280×800, yatay dahil) menü / oyun / orta oyun kareleri.                                                                  |
| **Determinizm** | `Math.random` tohumlanır, `setTimeout` sıfırlanır; bir oyun saniyeler sürer, her bulgu birebir tekrarlanabilir.                                        |

Hepsi tek komutta çalışır:

```bash
node scripts/bukucu-qa.mjs                        # dosyadan
BUKUCU_URL=http://127.0.0.1:8080/games/bukucu/ node scripts/bukucu-qa.mjs
node scripts/bukucu-qa.mjs --games 8 --steps 8000 # daha derin
```

Çıkış kodu 1 ise en az bir kural ihlali var; hangi kural olduğu Türkçe yazılır.

**Önce/sonra:** 20 oyunluk fuzz turu, düzeltmelerden önce **28 kural ihlali**
üretiyordu (hepsi aynı kökten: senetli tapının üstünde bina kalması).
Düzeltmelerden sonra **0 ihlal, 0 JS hatası**.

---

## 2. Bulunan hatalar

Ağırlık: **A** = oyunu/ekonomiyi bozar · **B** = yanlış davranış, oyuncu fark eder · **C** = cila.

### A1 — Senede giren tapının üstündeki binalar duruyor _(ekonomiyi kırıyor)_

`payTo()` para yetmediğinde `cheapestOwned()` ile en ucuz tapuyu senede
sokuyordu; binaları hiç sökmeden. Sonuç: üstünde 4 katlı Hanedan olan bir
tapu, arsa bedelinin yarısına senede giriyor, `liste/2 + %10` ile geri
alındığında **dört bina bedava geri geliyordu**. 20 oyunda 28 kez oluştu.

```
önce:  1:p0b4 3:p0b4  →  öde 50 TL  →  1:p0b4S 3:p0b4S   (kasa 5 → 15)
sonra: 1:p0b4 3:p0b4  →  öde 50 TL  →  1:p0b3 3:p0b3     (kasa 5 → 5)
```

**Düzeltildi.** Nakit toplama sırası artık: (1) en yüksek binayı yarı
fiyatına sök — dengeli inşaat kuralını bozmadan, (2) bitince boş tapuyu
senede sok, (3) o da bitince iflas. Üzerinde bina olan tapu senede giremez.

### A2 — İflasta binalar alacaklıya bedava geçiyor

`bankrupt()` tapuları alacaklıya devrederken `bld` dizisine dokunmuyordu.
Batan oyuncunun Hanedanları rakibin cebine hediye oluyordu.
**Düzeltildi:** binalar bankaya döner (`razeAll`), sadece arsa devredilir.

### A3 — Ekranda görünen tapu ile işlem yapılan tapu farklı

Bir kareye dokununca (`peek`) o karenin tapusu açılıyor, "SENETLİ" damgası
tıklanabilir düğme oluyordu — ama `act("unsen")` `S.focus`'u, yani
**oyuncunun üstünde durduğu** kareyi kullanıyordu. Yani Dolapdere'nin
tapusuna bakıp senedi kapatınca **Tarlabaşı'nın** seneti kapanıyor, para
oradan gidiyordu.

```
ekranda: Dolapdere · SENETLİ  →  tık  →  "Sen Tarlabaşı senet kapadı."  (967 TL)
```

**Düzeltildi:** `act()` girişinde ekranda hangi tapunun durduğu (`peek`
varsa o, yoksa `focus`) yakalanıp kullanılıyor.

### A4 — Nezaret: çift atmak fazladan tur veriyor

`doRoll()` nezaret dalında `S.extra = 1` kuruyordu. Monopoly'de çift atıp
nezaretten çıkarsan **ilerlersin ve turun biter**. Oyundaki hâli çift atan
oyuncuya bedava ikinci zar veriyordu.
**Düzeltildi.**

### A5 — Nezaret: üçüncü hak bedava

Üç kez çift tutturamayan oyuncu `S.miss >= 3` dalında hiç para ödemeden
çıkıyordu. Oysa oyunun kendi tapu kartı "3 kaçış, **50 TL**, çift veya
çıkış" yazıyor — kod kendi yazdığı kurala uymuyordu.
**Düzeltildi:** 50 TL kefalet alınır (ödeyemezse normal tasfiye zinciri işler).

### B1 — "Al" düğmesi kasa yetmezken de basılabiliyor

400 TL'lik Esenyurt'a 10 TL ile inildiğinde "Al" aktif duruyor, basınca
sadece "Kasa yetmez." yazıp aynı ekranda kalıyordu. Fuzz turlarında oyun
bu ekranda **binlerce adım** dönüp durdu.
**Düzeltildi:** düğme kapanıyor ve "Kasa yetmez" yazıyor, "Geç" birincil oluyor.

### B2 — Tahta tuvali yanlış kutudan ölçülüyor

`drawRingOn()` boyutu `canvas.parentElement`'ten alıyordu; `#ring`'in
`padding: 2px 2px 0` değeri yüzünden çizim kutusu CSS kutusundan büyüktü.
Tahta her cihazda **yatayda %1.04, dikeyde %1.00** oranında, yani eşit
olmayan biçimde geriliyordu — yazılar hafif bulanık, kenar payları kayıktı.
**Düzeltildi:** tuval kendi kutusundan ölçülüyor (`1.000 × 1.000`).

### B3 — Pencere boyutu değişince tahta yeniden çizilmiyor

`drawRing()` yalnızca `paint()` ve `orientationchange` üzerinden
çağrılıyordu. Klavye açılıp kapandığında, tarayıcı çubuğu gizlendiğinde ya
da masaüstünde pencere boyutlandığında tuval bitmap'i eski boyutta kalıyor,
tahta ezilip esniyordu (`780×922` bitmap, `426×308` CSS kutusunda).
**Düzeltildi:** `ResizeObserver` + `resize` + `visualViewport.resize` →
`requestAnimationFrame` ile tek seferlik yeniden çizim. Büyük tahta
katmanı da yeniden çiziliyor.

### B4 — Türkçe büyük harf: GAZI, POLIGON, TAHSILAT

`shortName()` içindeki `toUpperCase()` noktalı `i`'yi noktasız `I` yapıyordu.
Tahtada okunan: **GAZI, POLIGON, TAHSILAT, FIKIRTEPE, ÇEVIRME**.
**Düzeltildi:** `toLocaleUpperCase("tr-TR")` (desteklemeyen motor için yedek yol var).

### B5 — Tahta animasyonu sırasında düğmeler ölü ama canlı görünüyor

"CUMA'ya git" kartı piyonu tahtanın etrafında ~0.5 sn yürütüyor. Bu sürede
`busy` bayrağı bütün dokunuşları sessizce yutuyor, ama düğmeler normal
görünüyordu. Fuzz turu bunu "ilerleme yok" olarak yakaladı.
**Düzeltildi:** animasyon boyunca eylem satırı soluklaşıp `disabled` oluyor,
tahta `pointer-events: none`. Bittiğinde geri geliyor.

### B6 — Tahtaya dokunduktan sonraki ilk klavye tıklaması yutuluyor

`swallow` bayrağı `pointerup`'ta `true` yapılıp yalnızca bir sonraki
`click` olayında sıfırlanıyordu. Tahtaya dokunmak `click`'i tetiklemediği
için bayrak asılı kalıyor, **sonraki gerçek düğme etkinleştirmesi** (klavye
Enter, yardımcı teknoloji tıklaması) sessizce düşüyordu.
**Düzeltildi:** bayrak yerine "hangi düğme + 700 ms" penceresi; ilgisiz
tıklamalar hiç etkilenmiyor.

### B7 — Kurum kirası kart hamlesinde bayat zarla hesaplanıyor

"En yakın kuruma git" kartı piyonu taşıyor ama `kurumRent()` bir önceki
atışın zarını kullanıyordu. Monopoly kuralı: yeni zar atılır ve **her
durumda 10 kat** ödenir.
**Düzeltildi** (`S.uBoost`, iniş çözülünce sıfırlanır).

### B8 — "Yeni RACON çek" kartı kendini tekrar çekebiliyor

Kart önce ıskartaya atılıp sonra deste boşsa ıskarta karıştırıldığı için
aynı kart geri gelebiliyordu.
**Düzeltildi:** yeniden-çek kartı çekilirse atlanır (en fazla 8 deneme).

### B9 — Çıkış kartı desteye geri dönmüyor

`applyFx` "cik" dalı kartı ıskartaya atmıyor ("hold"), kullanıldığında da
kimse geri koymuyordu. Uzun oyunlarda deste kalıcı olarak küçülüyordu.
**Düzeltildi:** tutulan kart `S.held`'de izleniyor, harcanınca ıskartaya dönüyor.

### B10 — Bitiş ekranındaki "Net" binaları saymıyor

`netOf()` yalnızca senetsiz arsa bedellerini topluyordu; binalar ve senetli
tapunun yarı değeri yoktu. Kazananın net serveti olduğundan küçük görünüyordu.
**Düzeltildi:** arsa (senetliyse yarısı) + bina sayısı × dikme bedelinin yarısı.

### B11 — Kart metni "Rakibe", davranışı "herkese"

`give` / `take` kartları 3–4 kişilik oyunda **her** rakibe uygulanıyordu ama
kartın üstünde "Rakibe 25 TL ver." yazıyordu.
**Düzeltildi:** metin davranışa uyduruldu ("Her rakibe…", "Her rakipten…").

### C1 — Geri gitmek animasyonsuz

"3 kare geri" kartında piyon ışınlanıyor, ileri giderken yürüyordu.
**Düzeltildi:** geri yürüyüş de animasyonlu (`prefers-reduced-motion` varsa ikisi de anında).

### C2 — Kart etkisi iflasa yol açınca kart desteye dönmüyor

`applyFx` `payTo` başarısız olunca `return` ediyor, `discard` çalışmıyordu.
**Düzeltildi:** `resolveCard` dönüş değeri tanımsızsa kartı kendisi ıskartaya atar.

### C3 — `paint()` bitiş ekranını iki kez çiziyor

`paint()` → `paintDeed`+`paintDock`+`drawRing`, ardından `paintEnd()` aynı
üçünü tekrar çağırıyordu.
**Düzeltildi.**

---

## 3. Tasarım değerlendirmesi

Sanat yönü **iyi ve özgün**: koyu tapu/kadastro estetiği, altın tel, serif
başlıklar, "SENETLİ / SATILIK / SENİN" damgaları. Bu korundu. Sorun
estetikte değil, **bilginin ve kontrolün yerleşiminde**ydi.

### Düzeltilenler

| Sorun                                                                                                                                                                                             | Yapılan                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Zar hiç görünmüyordu** — sonuç sadece `#log`'da bir satır metindi ("Sen 2-6 attın"), o da iki karakter sonra kesiliyordu. Zar atmak oyunun kalbi, hiçbir görsel karşılığı yoktu.                | Tahtanın boş duran orta madalyonuna gerçek zarlar çizildi (yuvarlatılmış köşe, benek düzeni, altta toplam). |
| **Yatay ekran kullanılamıyordu** — `#app` genişliği `100dvh × 0.46` ile sınırlıydı; 844×390'da oyun **179 piksellik** bir şeride sıkışıyor, ekranın üçte ikisi siyah kalıyordu.                   | Yataya gerçek iki kolonlu düzen: solda tahta, sağda tapu kartı + kasa + eylemler.                           |
| **Oyun içinde menü yoktu** — başlanan oyundan çıkmanın, kuralları görmenin, yeniden başlamanın yolu sayfayı yeniden yüklemekti.                                                                   | Üstte ince bir çubuk + **MENÜ**: Oyuna dön · Nasıl oynanır · Tahtayı büyüt · Oyundan çık.                   |
| **Kural ekranı yoktu** — "senet", "racon", "kurum", "dengeli inşaat" gibi kavramlar hiçbir yerde açıklanmıyordu.                                                                                  | 10 başlıklı Türkçe "Nasıl oynanır" sayfası; hem ana menüden hem oyun içinden.                               |
| **Durum satırı tek satır ve kesikti** — `white-space: nowrap` + ellipsis, en kritik cümleleri yarıda kesiyordu.                                                                                   | İki satıra kadar sarma, sabit yükseklik, `role="status" aria-live="polite"`.                                |
| **Piyonlar kareden taşıyordu** — yan sütun kareleri ~23 px kalınlıkta, piyon yarıçapı 14'e kadar çıkıyordu; piyon hem tahtanın dışına hem komşu karelerin üstüne düşüyor, semt adını kapatıyordu. | Yarıçap kare kalınlığına göre de sınırlandı, merkez kare içine kenetlendi.                                  |
| **Kira seviyesi belirsizdi** — tapu kartı altı seviyeyi eşit gösteriyor, hangisinin yürürlükte olduğunu söylemiyordu.                                                                             | Yürürlükteki satır altın rengiyle işaretli; ayrıca senet bedeli eklendi.                                    |
| **Düğmeler tutar söylemiyordu** — "Al", "Öde", "Dik". Ne kadar?                                                                                                                                   | "Al · 400 TL", "Öde · 50 TL", "Dik · 200 TL".                                                               |
| **Düzen zıplıyordu** — eylem satırı boşken yükseklik kaybediyor, tapu kartı aşağı kayıyordu.                                                                                                      | Eylem satırına taban yükseklik; tapu kartı gövdesi yukarı hizalı, damga altta sabit.                        |
| **Klavye ile oynanamıyordu**                                                                                                                                                                      | Boşluk/Enter birincil eylemi çalıştırır, Escape kart katmanını ve seçimi kapatır.                           |
| **Hareket tercihi yok sayılıyordu**                                                                                                                                                               | `prefers-reduced-motion: reduce` ise piyon yürümez, doğrudan konumlanır.                                    |

### Hâlâ açık (sonraki tur)

Bunlar hata değil, **oyunun eksik parçaları**. Sırayla:

1. **Takas yok.** Monopoly'nin can damarı. Semt tamamlamak için tapu
   değiş-tokuşu olmadan oyun kilitleniyor: kimse renk tutamıyorsa oyun
   uzayıp gidiyor. Fuzz turlarında 3–4 kişilik oyunların yarısı adım
   sınırına takıldı — bunun ana sebebi bu.
2. **Manuel varlık yönetimi yok.** Oyuncu kendi isteğiyle senet çekemez,
   bina satamaz. Sadece kasa dibe vurunca otomatik tasfiye devreye giriyor.
3. **Portföy ekranı yok.** "Hangi tapular bende, ne kadar kira getiriyor?"
   sorusunun cevabı yok; oyuncu tek tek karelere dokunmak zorunda.
4. **Açık artırma yok.** Alınmayan tapu bankada kalıyor (basitleştirme,
   kabul edilebilir — ama oyunu uzatıyor).
5. **Kısa mod yok.** 3–4 kişilik oyunlar çok uzun. Bir "hızlı raunt"
   (örneğin 30 tur sonunda en zengin kazanır) mobil için gerçekçi olur.
6. **Naci Bey tek seviye ve zayıf.** Sabit eşiklerle alıyor (`kasa-200`),
   asla senet çekmiyor, takas yok, nezarette geç kalmayı hiç düşünmüyor.
7. **Sıcak koltuk gizliliği yok.** 3–4 kişide sıra devri ekranı var ama
   önceki oyuncunun tapu kartı ekranda kalıyor.
8. **Ses ve dokunsal geri bildirim yok** (`navigator.vibrate` sadece zarda,
   o da 2 kişilik sıcak koltukta hiç çalışmıyor — `sen(p)` yalnızca CPU
   modunda doğru).

---

## 4. Değişen dosyalar

| Dosya                            | Ne değişti                                                                       |
| -------------------------------- | -------------------------------------------------------------------------------- |
| `public/games/bukucu/index.html` | 19 hata düzeltmesi + tasarım güncellemeleri. `smb-rev` 7 → 8.                    |
| `public/games/bukucu/sw.js`      | Önbellek sürümü `smb-shell-v7` → `v8` (eski kabuk telefonlarda takılı kalmasın). |
| `scripts/bukucu-qa.mjs`          | **Yeni.** Senaryo + fuzz test koşucusu.                                          |
| `docs/bukucu/RAPOR.md`           | **Yeni.** Bu belge.                                                              |
| `docs/bukucu/GROK-PROMPT.md`     | **Yeni.** Grok Build'e yapıştırılacak istem paketi.                              |

---

## 5. Doğrulama

```
20 oyun (cpu ×5, 2 kişi ×5, 3 kişi ×5, 4 kişi ×5)

           önce      sonra
kural ihlali   28         0
JS hatası       0         0
```

Senaryo testlerinin hepsi geçiyor: nezaret çıkışı, kefalet, senet sırası,
iflas devri, ekranda görünen tapu, tuval ölçeği (1.000×1.000), resize
sonrası yeniden çizim, `aria-live`, dokunma hedefi boyutları.

Geriye dönük uyum ayrıca elle denendi: `smb-rev 7` döneminden kalma, yeni
alanları (`held`, `uBoost`, `stat`) içermeyen bir kayıt `localStorage`'a
konup "Devam et" ile açıldı — `migrate()` varsayılanları verdi, oyun hatasız
devam etti.

Görsel doğrulama 320×568, 375×667, 390×844, 412×915, 430×932, 844×390
(yatay), 768×1024 ve 1280×800 boyutlarında yapıldı: tahta hiçbirinde
kırpılmıyor, piyon kare dışına taşmıyor, yatay artık iki kolon.

Bitmeyen oyunlar (20 turun 10'u, çoğu 3-4 kişilik) bir hata değil, bölüm
3'teki **takas eksikliği** ve **kısa mod yokluğu**nun sonucu. İlk iki
istem bunu hedefliyor.
