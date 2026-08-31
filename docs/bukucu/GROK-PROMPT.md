# Bükücü — Grok Build istem paketi

Aşağıdaki blokların her biri **olduğu gibi kopyalanıp** Grok Build sohbetine
yapıştırılmak üzere yazıldı. Sırayla gidin; her biri kendi başına tamamlanmış
bir iş. Her blok sonunda oyunun yine oynanabilir kalması hedefleniyor.

Ortak zemin (her istemin içinde tekrarlanıyor, ama bilmenizde fayda var):

- Oyun tek dosya: `public/games/bukucu/index.html` — bağımlılıksız,
  ES5 üslubunda IIFE, tahta `<canvas>` ile çiziliyor.
- Durum tek nesnede (`S`), her adımda `localStorage["smb.v1"]`'e yazılıyor.
  Yeni alan eklerken `migrate()` içine varsayılanını koymak şart, yoksa
  eski kayıtla açan oyuncuda oyun çöker.
- Değişiklikten sonra `<meta name="smb-rev">` ve `sw.js` içindeki
  `CACHE = "smb-shell-vN"` birlikte artırılmalı; yoksa telefonlarda eski
  kabuk asılı kalıyor.
- Regresyon koşucusu hazır: `node scripts/bukucu-qa.mjs`. Sıfır sorunla
  bitmeden iş bitmiş sayılmaz.

---

## 0 · Bağlam istemi (ilk mesaj olarak gönderin)

```text
public/games/bukucu/index.html içindeki "Son Mahalle Bükücü" oyunu üzerinde
çalışacağız. Şunları bilerek başla:

- Oyun tek HTML dosyası: stil + mantık + canvas çizimi hepsi içinde.
  Bağımlılık yok, build adımı yok. ES5 üslubunu koru (var, function,
  prototip yok), çünkü dosyanın tamamı bu üslupta.
- Bütün oyun durumu tek bir S nesnesinde ve her adımda
  localStorage["smb.v1"]'e yazılıyor. S'ye alan eklersen migrate()
  fonksiyonuna varsayılanını da ekle; eski kayıtla açan oyuncuda oyun
  patlamasın.
- Tahta canvas'a çiziliyor (drawRingOn). Ekranda tapu kartı (#deed),
  durum satırı (#log), kasa çipleri (#chips), eylem düğmeleri (#acts) var.
  Bütün eylemler tek bir act(code) fonksiyonundan geçiyor, düğmeler
  data-act ile bağlanıyor. Yeni eylemi oraya ekle.
- Görsel dil: koyu tapu/kadastro estetiği, #0B0B0B zemin, #C4A574 altın,
  serif başlıklar, büyük harf damgalar. Yeni ekranlar da bu dile uysun.
  Emoji ikon kullanma, mevcut çizgi/SVG diliyle devam et.
- Metinlerin hepsi Türkçe. Büyük harfe çevirirken toLocaleUpperCase("tr-TR")
  kullan, düz toUpperCase() "Gazi"yi "GAZI" yapıyor.
- Değişiklik bitince <meta name="smb-rev"> ve sw.js'deki
  CACHE = "smb-shell-vN" değerini birlikte bir artır.
- Regresyon testi var: node scripts/bukucu-qa.mjs
  İşi bitirmeden önce çalıştır, sıfır sorunla bitmeli.

Şimdilik kod yazma. Sadece "anladım" de ve bir sonraki mesajı bekle.
```

---

## 1 · Takas — en yüksek öncelik

Oyunun bugün en büyük eksiği. Takas olmadan kimse renk tamamlayamıyor;
otomatik testte 3–4 kişilik oyunların çoğu bitmiyor.

```text
Bükücü'ye takas ekle.

NEDEN: Şu an bir semtin (renk grubunun) bütün tapularını toplamanın tek yolu
şansa kalmış durumda. Kimse renk tutamayınca bina dikilemiyor, kira artmıyor,
oyun bitmiyor. Otomatik test turlarında 3-4 kişilik oyunların çoğu tur
sınırına takılıyor. Takas bunu çözer ve masaya asıl pazarlığı getirir.

NE İSTİYORUM:
- Eylem satırında sıra bendeyken "Takas" düğmesi. wait === "roll" iken,
  yani zar atmadan önce açılsın. Zar attıktan sonra kapalı olsun.
- Tam ekran takas sayfası (#sheet katmanını kullan, openBig/openRules ile
  aynı iskelet):
  * Üstte karşı tarafı seçme satırı (3-4 kişilik oyunda birden fazla rakip).
  * İki sütun: solda benim tapularım, sağda onunki. Her satırda semt adı,
    renk şeridi, bina sayısı, senetliyse "SENETLİ" damgası.
  * Satıra dokununca teklife girer/çıkar. Seçilenler altın çerçeveli.
  * Altta iki yönlü para kaydırıcısı yerine iki adet "+50 / -50" sayaç
    kullan (mobilde kaydırıcı zor): "Ben veriyorum … TL" ve
    "O veriyor … TL". Kasanın üstüne çıkamasın.
  * En altta canlı özet: "Sen: Balat + 150 TL → O: Kanarya" gibi tek satır.
  * "Teklif et" ve "Vazgeç" düğmeleri.

KURALLAR (bunlara uy):
- Üzerinde bina olan tapu takas edilemez. Teklife eklenmeye çalışılırsa
  düğme kapalı olsun, altında "Önce binaları sök" yazsın.
- Senetli tapu takas edilebilir; alan taraf senedi devralır.
- Bir tarafın vereceği para kasasından fazla olamaz.
- Boş teklif (iki taraf da hiçbir şey vermiyor) gönderilemez.
- Takas sonrası renk grubu tamamlanmışsa kira otomatik ikiye katlanır —
  bu zaten ownsSet() ile çalışıyor, ekstra bir şey yapma.

NACİ BEY (CPU modu):
- Teklifi değerlendirsin. Basit ve okunabilir bir puanlama yaz:
  aldığı her tapunun listesi + aldığı para, verdiği her tapunun listesi +
  verdiği para. Bir tapu ona bir rengi tamamlatıyorsa değerini 2 katı say;
  benim bir rengimi tamamlıyorsa 1.6 katı say (yani vermek istemesin).
  Net puan pozitifse kabul etsin.
- Kabul/ret kararını 500 ms gecikmeyle ve mevcut later() yardımcısıyla ver,
  ani olmasın. Kararı #log satırına yaz: "Naci Bey kabul etti." /
  "Naci Bey burnunu kıvırdı."
- Sıcak koltuk modunda (2-4 insan) teklif diğer oyuncuya "Kabul / Ret"
  ekranı olarak gösterilsin, telefon elden ele geçtiği için ekstra bir
  gizlilik gerekmiyor.

DURUM:
- S.trade diye geçici bir alan tut: { from, to, give:[kare], take:[kare],
  giveCash, takeCash }. Teklif çözülünce null yap. migrate() içine
  varsayılan olarak null ekle.
- Takas turu tüketmesin: takastan sonra oyuncu yine zar atabilsin.

Bitince node scripts/bukucu-qa.mjs çalıştır ve sıfır sorunla bittiğini göster.
```

---

## 2 · Portföy ve elle varlık yönetimi

```text
Bükücü'ye "Tapularım" ekranı ve elle varlık yönetimi ekle.

BUGÜNKÜ SORUN: Oyuncu neye sahip olduğunu tek tek karelere dokunmadan
göremiyor. Ayrıca kendi isteğiyle senet çekemiyor, bina satamıyor — sadece
kasa dibe vurunca otomatik tasfiye devreye giriyor. Bu, "riski yönetme"
kararını oyuncunun elinden alıyor.

NE İSTİYORUM:
- Üstteki MENÜ sayfasına "Tapularım" girişi, ayrıca eylem satırında
  wait === "roll" iken doğrudan bir kısayol.
- Tam ekran liste (#sheet), renk grubuna göre gruplanmış:
  * Grup başlığı: renk adı + "3/3 tuttun" ya da "2/3".
  * Her satır: semt adı, bina seviyesi (Arsa/Tekel/Tek Durak/Mahalle Ağı/
    Semt Hattı/Hanedan), o anki kira, satırın sağında iki küçük düğme.
  * Düğmeler bağlama göre: "Dik · 200 TL" / "Sök · +100 TL" /
    "Senetle · +150 TL" / "Kapat · 165 TL".
  * Yapılamayan işlem düğmesi kapalı olsun ve nedenini altına tek satır
    yazsın: "Semti tutmuyorsun", "Önce diğerlerini eşitle", "Kasa yetmez".
- Üstte özet şerit: Kasa · Tapu sayısı · Bina sayısı · Net servet
  (netOf() zaten var, onu kullan).

KURALLAR:
- Dikme ve sökmede dengeli inşaat kuralı korunacak: bir renkteki binalar
  arasındaki fark 1'i geçemez. canBuildTile() bunu zaten yapıyor;
  sökme için de aynısını yaz (en yüksek binadan sök).
- Sökme yarı fiyata (dikme bedelinin yarısı).
- Üzerinde bina olan tapu senede giremez.
- Senedi kapatma bedeli: liste/2 + %10 (unsenetCost() var, onu kullan).
- Bütün bunlar yalnız sıra sendeyken ve zar atmadan önce yapılabilsin.

Var olan otomatik tasfiye zincirini (payTo → razeOne → senetTile → iflas)
bozma; o hâlâ son çare olarak kalsın.

Bitince node scripts/bukucu-qa.mjs çalıştır.
```

---

## 3 · Oyun uzunluğu — kısa mod ve düzgün bitiş

```text
Bükücü'de oyun uzunluğunu kontrol altına al.

SORUN: 3-4 kişilik oyunlar bitmiyor. Otomatik testte 6000 adımda bile
kazanan çıkmayan turlar var. Telefonda oynanan bir oyun için bu ölümcül.

NE İSTİYORUM:
1. Ana menüde oyun modunun yanında süre seçimi: "Uzun (son ayakta kalan)"
   ve "Kısa (30 tur)". Varsayılan Kısa olsun.
2. Kısa modda S.stat.turns tur sayacını işlet (her oyuncunun sırası bitince
   bir artır). Sınıra gelince oyun biter, net serveti (netOf) en yüksek
   olan kazanır. Son 5 turda üst çubukta "Son 5 tur" uyarısı görünsün.
3. Bitiş ekranını gerçek bir özet yap. Şu an tek satır. Bunun yerine:
   * Kazanan büyük punto.
   * Her oyuncu için satır: kasa, tapu sayısı, bina sayısı, net servet,
     ödediği toplam kira.
   * Altında "Yeni oyun" ve "Ana menü".
   Ödenen kirayı izlemek için S.stat.rentPaid dizisini kullan (migrate'de
   zaten yer ayrıldı), payTo içinde kirayı öderken artır.
4. CUMA'dan geçme parası kısa modda 200 TL kalsın ama Tahsilat/Damga
   vergileri aynı kalsın — dengeyi bozma, sadece süreyi sınırla.

Bitince node scripts/bukucu-qa.mjs çalıştır; kısa modda bütün oyunların
bittiğini raporla.
```

---

## 4 · Naci Bey'e zorluk seviyeleri

```text
Bükücü'de Naci Bey'i (CPU rakip) üç seviyeye ayır.

BUGÜNKÜ HÂLİ: naciWants() sabit eşiklerle karar veriyor (kasada 200 TL
kalsın gibi), naciTryBuild() sadece en ucuz binayı dikiyor, asla senet
çekmiyor, nezarette kalmayı hiç düşünmüyor. Öngörülebilir ve zayıf.

NE İSTİYORUM: Ana menüde "Naci Bey'e karşı" seçilince üç seviye:
"Acemi", "Esnaf", "Bükücü".

- ACEMİ: bugünkü davranış, ama kasa tabanı 300 TL (daha çekingen).
- ESNAF: bugünkü davranış + iki ekleme:
  * Bir renk grubunu tamamlayacak tapuyu kasanın son kuruşuna kadar alır.
  * Bina dikerken en ucuzu değil, kira artışı / maliyet oranı en yüksek
    olanı seçer.
- BÜKÜCÜ:
  * Yukarıdakiler +
  * Oyunun geç safhasında (tahtanın yarısından fazlası satılmışsa)
    nezarette kalmayı tercih eder — dışarıda gezmek kira ödemek demek.
    Yani 50 TL ödeyip çıkmaz, çift beklemeye çalışır.
  * Rakibin bir sonraki 12 karesindeki tehlikeyi hesaplar (her karenin
    kirası × o kareye düşme olasılığı) ve nakit tamponunu ona göre tutar.
    İki zar toplamı olasılıklarını sabit bir tabloda tut: 2..12 için
    1,2,3,4,5,6,5,4,3,2,1 bölü 36.
  * Takas ekliyse (bkz. 1 numaralı iş) semt tamamlayacak teklifi kendi
    açar.

Seviye S.lvl alanında tutulsun, migrate() varsayılanı "esnaf" olsun.
Kod okunabilir kalsın: seviyeye göre if/else yerine, seviyeden bir
parametre nesnesi üret (kasa tabanı, agresiflik, nezaret tercihi) ve
mevcut fonksiyonlar o nesneyi okusun.

Bitince node scripts/bukucu-qa.mjs çalıştır ve üç seviyeyi de fuzz turunda
oynat.
```

---

## 5 · His — ses, titreşim, mikro animasyon

```text
Bükücü'ye dokunma hissi ekle. Görsel dili değiştirme, sadece geri bildirim
katmanı ekle.

1. Zar atışı: zarlar tahtanın ortasında 350 ms boyunca rastgele yüz
   değiştirsin, sonra sonuca otursun. prefers-reduced-motion açıksa
   doğrudan sonucu göster. Zaten drawDie/drawCentre fonksiyonları var,
   onların üstüne kur.
2. Titreşim: navigator.vibrate ile — zar 10 ms, tapu alma 20 ms,
   kira ödeme 30 ms, iflas [40,60,40]. try/catch içinde çağır, desteklemeyen
   cihazda sessizce geçsin. Şu an sadece CPU modunda ve yalnız zarda
   çalışıyor, her modda çalışsın.
3. Ses: Web Audio ile, dosya indirmeden, kod içinde üretilen üç kısa ton
   yeter (zar takırtısı için filtrelenmiş gürültü patlaması, kasa için
   yükselen iki nota, iflas için alçalan bir nota). Ana menüde ve MENÜ
   sayfasında "Ses açık/kapalı" anahtarı; tercih localStorage'da ayrı bir
   anahtarda (oyun kaydından bağımsız) tutulsun. Varsayılan kapalı.
   AudioContext'i ilk kullanıcı dokunuşunda oluştur, sayfa açılışında değil.
4. Kira ödendiğinde ödeyenin kasa çipinden alanın çipine doğru kısa bir
   sayı animasyonu (tutar yukarı süzülüp kaybolsun). CSS transition yeter.

Hiçbir ses veya titreşim oyunun akışını bekletmesin — hepsi ateşle-unut.

Bitince node scripts/bukucu-qa.mjs çalıştır.
```

---

## 6 · Her işten sonra çalıştırılacak kontrol istemi

```text
Bükücü'de yaptığın son değişiklikten sonra şunları sırayla doğrula ve
sonucu bana özetle:

1. node scripts/bukucu-qa.mjs — sıfır sorunla bitmeli. Çıktıyı göster.
2. Oyunu 320×568, 390×844 ve 844×390 (yatay) boyutlarında aç, ekran
   görüntüsü al ve kendin bak: tahta kırpılmıyor mu, piyon karenin dışına
   taşıyor mu, tapu kartı taşıyor mu, düğmeler 48 pikselden alçak mı.
3. Eski kayıtla uyum: bir önceki sürümde başlanmış bir oyunun kaydını
   localStorage'a koyup "Devam et" ile aç. Oyun çökmeden devam etmeli.
   migrate() yeni alanlara varsayılan veriyor mu, kontrol et.
4. <meta name="smb-rev"> ve sw.js'deki CACHE sürümü birlikte arttı mı.
5. Servis çalışanı: sayfayı yenile, yeni sürümün geldiğini doğrula
   (eski kabuk asılı kalmasın).

Bir şey kırıldıysa düzelt, kırılmadıysa tek paragrafta ne değiştiğini yaz.
```

---

## Ek · Referans kod parçaları

Grok'a "şuna benzesin" diye verebileceğiniz, oyunun kendi üslubuna uygun
iskeletler. Doğrudan yapıştırılabilir.

### Takas puanlaması (1 numaralı iş için)

```js
/* Naci Bey'in bir teklifi tartması. Pozitif = kabul.
   t: { give:[kare], take:[kare], giveCash, takeCash } — "give" teklifi
   yapanın verdikleri, yani Naci Bey'in alacakları. */
function tradeScore(me, t) {
  var s = t.giveCash - t.takeCash,
    i;
  for (i = 0; i < t.give.length; i++) s += tileWorth(me, t.give[i], 1);
  for (i = 0; i < t.take.length; i++) s -= tileWorth(me, t.take[i], -1);
  return s;
}

/* Bir tapunun bu oyuncu için değeri. dir=1 alıyor, dir=-1 veriyor. */
function tileWorth(me, i, dir) {
  var base = S.sen[i] ? (SQ[i][2] / 2) | 0 : SQ[i][2];
  var g = SQ[i][3];
  if (!g) {
    /* Kaçış ve Kurum: kaçıncısı olduğu değeri katlar. */
    var k = ownedKind(me, SQ[i][1]);
    return base * (1 + 0.35 * (dir > 0 ? k : k - 1));
  }
  var a = groupIdx(g),
    mine = 0,
    theirs = 0,
    j;
  for (j = 0; j < a.length; j++) {
    if (a[j] === i) continue;
    if (S.own[a[j]] === me) mine++;
    else if (S.own[a[j]] >= 0) theirs++;
  }
  if (dir > 0 && mine === a.length - 1) return base * 2; /* semti tamamlıyor */
  if (dir < 0 && theirs === a.length - 1) return base * 1.6; /* rakibin semtini tamamlıyor */
  if (mine > 0) return base * 1.25;
  return base;
}
```

### Bina sökme (2 numaralı iş için)

```js
/* Dengeli inşaat kuralını bozmadan sökülebilecek en yüksek bina. */
function razeTarget(p) {
  var best = -1,
    bestLv = 0,
    bestCost = -1,
    i,
    j,
    a,
    mx;
  for (i = 0; i < 40; i++) {
    if (S.own[i] !== p || S.bld[i] <= 0) continue;
    a = groupIdx(SQ[i][3]);
    mx = 0;
    for (j = 0; j < a.length; j++) if (S.bld[a[j]] > mx) mx = S.bld[a[j]];
    if (S.bld[i] < mx) continue; /* önce yükseği sök */
    if (S.bld[i] > bestLv || (S.bld[i] === bestLv && houseValue(i) > bestCost)) {
      best = i;
      bestLv = S.bld[i];
      bestCost = houseValue(i);
    }
  }
  return best;
}
function houseValue(i) {
  return ((BUILD_COST[SQ[i][3]] || 0) / 2) | 0;
}
```

### İki zar olasılık tablosu (4 numaralı iş için)

```js
/* İki zarın toplamı: 2..12. Rakibin kaç kare ötedeki tehlikeye
   düşme olasılığını tartmak için. */
var DICE_P = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
function hitChance(step) {
  return step >= 2 && step <= 12 ? DICE_P[step] / 36 : 0;
}

/* Sıradaki oyuncunun bana ödemesi beklenen kira. */
function expectedRent(from, owner) {
  var e = 0,
    step,
    i;
  for (step = 2; step <= 12; step++) {
    i = (from + step) % 40;
    if (S.own[i] === owner) e += hitChance(step) * landRent(i);
  }
  return e;
}
```

### Yeni bir S alanını güvenle eklemek

```js
/* migrate() içinde, mevcut varsayılanların yanına.
   Bu satır olmadan eski kayıtla açan oyuncuda oyun çöker. */
if (data.trade === undefined) data.trade = null;
if (!data.lvl) data.lvl = "esnaf";
if (!data.stat) data.stat = { turns: 0, rolls: 0, rentPaid: zeros(data.n) };
if (!data.stat.rentPaid || data.stat.rentPaid.length !== data.n) {
  data.stat.rentPaid = zeros(data.n);
}
```
