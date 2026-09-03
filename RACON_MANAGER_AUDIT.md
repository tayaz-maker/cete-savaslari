# RACON MANAGER TAM DENETİM RAPORU

**Denetlenen sürüm:** `main` · commit `b856aa6` · Racon revizyonu `34`  
**Denetim tarihi:** 3 Eylül 2026  
**Kapsam:** Kod, kayıt sistemi, oyun döngüsü, denge, içerik, masaüstü/mobil arayüz, sınır durumları ve uzun vadeli oynanış  
**Bu rapor düzeltme yapmaz.** Yalnızca mevcut durumu tespit eder ve düzeltme sırasını önerir.

---

# YÖNETİCİ ÖZETİ

## Kısa hüküm

**Racon Manager şu anda açılan ve temel akışı çalışan, fakat teknik ve tasarımsal olarak sağlıklı kabul edilemeyecek bir prototiptir.** Oyun çökmeksizin uzun süre simüle edilebiliyor; buna karşılık otomatik testlerin yakalamadığı, ekonomiyi ve kararların sonuçlarını bozan ciddi mantık hataları var.

## Soruların açık cevapları

| Soru | Cevap |
|---|---|
| Racon Manager teknik olarak sağlıklı mı? | **Hayır.** Derlenmesi gerekmeyen tek HTML yapısı açılıyor, fakat kayıt doğrulaması, ekonomi bütünlüğü ve bazı oyun kuralları bozuk. |
| Kritik bug var mı? | **Evet.** Sınırsız ücretsiz itibar/moral, bahisle aynı gün sınırsız para ve kayıt kaybı riski oluşturan sorunlar var. |
| Kayıt kaybı riski var mı? | **Evet.** Kayıt hataları sessizce yutuluyor; veri sınırsız büyüyor; biçimsel olarak geçerli fakat bozuk kayıt oyunu açılır açılmaz çökertebiliyor. |
| En kötü problem nedir? | Toplam kasa ile kirli/temiz kasa aynı parayı temsil etmiyor. Oyuncu gerçekte olmayan parayı harcayabiliyor. |
| Kod yapısı geliştirilmeye uygun mu? | **Kısmen.** İsimler çoğunlukla anlaşılır, fakat 6.829 satırlık tek dosya AI ile güvenli geliştirmeyi ciddi biçimde zorlaştırıyor. |
| Uzun vadede sıkıcılaşma riski var mı? | **Çok yüksek.** Kademe ilerleyişi Ağabey'de bitiyor; altı menü sürekli kilitli kalıyor; ana omurga tekrarlanan 13 haftalık “sezon”lardan oluşuyor. |

## En kötü 5 problem

1. **Kasa sistemi matematiksel olarak tutarsız.** `kasa`, `dirtyKasa` ve `cleanKasa` birbirinden kopuyor.
2. **Zaman harcamadan sınırsız güçlenme mümkün.** Ücretsiz “Cuma namazı” eylemi aynı gün sınırsız tekrarlanabiliyor.
3. **Veliefendi sistemi sınırsız para basıyor.** En yüksek oranlı atın kazanma ihtimali diğer atlarla aynı.
4. **Kayıt sistemi uzun vadede sessizce durabilir.** Kayıt büyüyor, hata kullanıcıya söylenmiyor.
5. **Oyunun ana ilerleme omurgası hâlâ futbol menajerliği mantığında.** Sezon, puan, sıralama ve “Üç maç üç galibiyet” metni doğrudan oyunda.

## En güçlü 5 taraf

1. İstanbul/Fatih tonu, kısa cümleler ve koyu/altın görsel kimlik genel olarak tutarlı.
2. Korku, Saygı, Nam ve Racon ayrı alanlar olarak gerçekten tutuluyor.
3. Şiddet; heat, delil, tanık, husumet, yaralanma, hapis, ölüm ve cenaze sistemlerine bağlanmış.
4. Rastgelelik kayıt içinde saklanan seed ile çalışıyor; testler tekrar üretilebilir.
5. Eski kayıtları yeni alanlarla tamamlamaya çalışan bir `migrate()` katmanı ve bir nesillik yerel yedek bulunuyor.

## En gereksiz veya saçma görünen yapılar

- Mahalle oyununun altında çalışan `lig`, `fikstur`, `sezon`, `puan` iskeleti.
- Silahın çatışmadan bağımsız biçimde iş gelirini artırması; paltonun polis dikkatini azaltması.
- “Bel holster” adlı eşyanın Pompalıdan daha yüksek saldırı vermesi.
- Bütün atların eşit ihtimalle kazanmasına rağmen oranlarının 2,2 / 3,6 / 6,1 olması.
- Oyuncuya hiçbir gerçek işlev sunmayan, daima kilitli altı menü düğmesi.

## İlk düzeltilmesi gereken 10 şey

1. Toplam/kirli/temiz para için tek ve değişmez bir muhasebe kuralı kur.
2. Kayıt şeması doğrulaması, kayıt hatası bildirimi, veri budama ve güvenli yedekleme ekle.
3. Her kişisel eyleme zaman veya günlük kullanım sınırı koy; ücretsiz sonsuz tekrarları kapat.
4. Veliefendi olasılıklarını oranlarla uyumlu yap veya bu sistemi kaldır.
5. Adamların durumunu ve aynı anda başka işte olup olmadığını atama sırasında zorunlu denetle.
6. Takvim eylemlerini yalnız doğru günde aç; ertelemeyi etkinliğin tarihinden hesapla.
7. Dosya artışlarını tek bir kalıcı kaynaktan hesapla; sonradan silinen doğrudan `S.dosya += ...` cezalarını kaldır.
8. Sezon/puan/maç omurgasını mahalle hâkimiyeti ve gerçek sonuç zinciriyle değiştir.
9. Sokak tutmayı yalnız para ödemeye değil, o sokakta kurulmuş etki ve sonuca bağla.
10. Oyunu framework değiştirmeden birkaç Vanilla JS/CSS/veri modülüne ayır ve gerçek regresyon testleri ekle.

---

# 1. DOSYA VE MİMARİ HARİTASI

## Gerçekte çalışan Racon Manager

| Yol | Görev |
|---|---|
| `public/games/racon/index.html` | Racon Manager'ın tamamı: HTML, CSS, veri, oyun motoru, kayıt sistemi ve üretimde taşınan test kodu. |
| `src/lib/games.ts` | Racon Manager'ı katalogda `/oyna/racon` adresine bağlar. |
| `src/routes/oyna.$slug.tsx` | Oyunu `/games/racon/index.html` adresinden iframe içinde açar. |
| `scripts/racon-harness.mjs` | Oyunun scriptini sahte DOM ile Node içinde çalıştırır. |
| `scripts/racon-audit.mjs` | Uzun simülasyon ve bazı sınır durumlarını sınar. |
| `scripts/racon-qa.mjs` | Playwright ile görünüm, tıklama ve konsol testi yapmak üzere yazılmıştır. |
| `scripts/racon-sim.mjs` | Farklı davranış profilleriyle çoklu kariyer simülasyonu yapar. |

## Racon Manager olmayan fakat karışabilecek dosyalar

`src/game/*` ve `src/components/game/*` altındaki React/TypeScript kodu **Çete Savaşları** oyunudur. Racon Manager bu kodu kullanmıyor. İki oyun aynı portalı ve genel yayın altyapısını kullanıyor fakat ortak oyun motorları yok.

Bu ayrım önemlidir: Racon Manager'daki bir bug'ı `src/game/store.ts` içinde aramak sonuç vermez. Ana gerçek kaynak `public/games/racon/index.html` dosyasıdır.

---

# 2. OYUN ŞU ANDA NASIL ÇALIŞIYOR?

## Amaç ve ana döngü

Oyuncu Fatih'te bir köken ve lakap seçiyor. İş planlıyor, adam atıyor, işi sahne içinde yönlendiriyor ve **İLERLET** ile günü geçiriyor. Gün ilerlerken yevmiye, yorgunluk, polis dosyası, rakip hareketleri, takvim yükümlülükleri ve rastgele kâğıtlar işleniyor.

Temel döngü şudur:

1. Gelen kâğıtları ve takvimi kontrol et.
2. Sokak, iş türü ve adam seçerek iş planla.
3. Hazırlık süresini gün ilerleterek geçir.
4. İş sahnesinde sessiz kal, sıkıştır, ateş et veya çekil.
5. Para, itibar, heat, delil, yaralanma ve husumet sonuçlarını al.
6. Adamların yevmiyesini ve moralini yönet.
7. Randevulara katıl, sokak tut, sıralamada yüksel.
8. 13 haftalık dönemin hedeflerini tamamla; başarısızlık tekrarlanırsa oyun biter.

## Zaman

- Her **İLERLET** bir gün geçirir.
- Yedi gün bir hafta oluşturur.
- Kodda 13 haftalık yapı `sezon` olarak adlandırılır.
- Haftalık ücret, pasif gelir, rakip hareketi, aklama ve bazı uzun dönem olayları pazar geçişinde çalışır.

## Para

Oyunda üç para değeri var:

- `S.kasa`: ekranda görünen ve çoğu alışverişte kullanılan toplam para.
- `S.dirtyKasa`: suç işlerinden gelen kirli para olarak sunuluyor.
- `S.cleanKasa`: haftalık aklama ile oluşan temiz para.

Bu üç değer arasında zorunlu bir eşitlik kurulmadığı için sistem fiilen bozuk. Ayrıntı KRİTİK-01'de.

## Adamlar ve NPC'ler

Adamların rolü, dokuz açık statı, gönlü, yorgunluğu, formu, yevmiyesi, sağlık/durum bilgisi, hizbi ve bazı gizli özellikleri var. Birlikte iş yaptıkça bağ kuruluyor; ölüm bu bağ üzerinden tepki veya intikam isteği çıkarabiliyor.

NPC tarafında esnaf, berber, kahveci, kapıcı, muhtar, avukat ve komiser gibi kişiler bulunuyor. Buna rağmen çoğu NPC birkaç sayaç ve tek kullanımlık butondan ibaret; günlük hayatı olan bağımsız kişiler gibi davranmıyor.

## Dört itibar

- **Korku:** Sertlik ve tehdit.
- **Saygı:** Düzgün davranış ve mahalle desteği.
- **Nam:** Tanınırlık ve görünür güç.
- **Racon:** Söz, sınır ve davranış tutarlılığı.

Dört değer veri olarak ayrı. Fakat “Korku ile Saygı aynı anda maksimum olamaz” kuralı doğru uygulanmıyor; ikisi de 99–100 seviyesine çıkarılabiliyor.

## Şiddet ve sonuçları

Ateş etmek daha fazla heat ve gürültü üretiyor; tanık/delil, yaralanma, hapis veya ölüm çıkarabiliyor. Ölüm; cenaze, moral kaybı, husumet ve kan davasına uzanabiliyor. Bu, oyunun en güçlü sistem bağlantılarından biri.

## Başlangıç, orta ve uzun oyun

- **Başlangıç:** Köken seçimi, 1–3 adam, ilk işler, ilk sokaklar.
- **Orta oyun:** Yeni adamlar, emlak, komiser, delil temizleme, randevu ve sıralama.
- **Uzun oyun:** Gerçek bir üst oyun henüz yok. Kademe Ağabey'de duruyor; Baba/Aile Reisi/Hanedan uygulanmamış. Rakip gücü her yeni dönemde düz biçimde artıyor.

Tekrar oynanabilirlik köken, rastgele adam statları ve olaylardan geliyor. Fakat stratejik yollar yeterince farklı olmadığı ve kolay exploitler bulunduğu için tekrar oynama değeri kısa sürede düşüyor.

---

# 3. KRİTİK BULGULAR

## KRİTİK-01 — Toplam kasa ile kirli/temiz para birbirinden kopuk

**Yer:** `public/games/racon/index.html` · `kasaAklaHaftalik()` (914–957), iş sonucu (2448–2449), bütün harcama eylemleri, `drawKasa()` (4545–4595)

**Sade açıklama:** Oyuncu aynı parayı iki farklı defterde taşıyor. Bir eşya veya emlak alınca toplam kasa azalıyor fakat kirli para azalmıyor. Tanık satın alınca ise kirli para azalıyor fakat toplam kasa azalmıyor.

**Doğrulanan örnek:** Toplam kasa ₺500, kirli kasa ₺18.000 iken oyuncu ₺3.000 karşılığında tanık satın alabildi. İşlemden sonra toplam kasa hâlâ ₺500 kaldı.

**Neden kritik:** Ekonomi, polis riski ve aklama sistemi aynı anda güvenilmez hâle geliyor. Oyuncu gerçekte sahip olmadığı parayı harcayabiliyor; kirli para riski de harcamalardan sonra sahte biçimde yüksek kalıyor.

**Düzeltme:** `kasa` bağımsız üçüncü para olmamalı. En temiz kural `kasa = dirtyKasa + cleanKasa` türevidir. Bütün gelir ve giderler tek bir `paraEkle(kaynak, tutar)` / `paraHarca(tercih, tutar)` katmanından geçmelidir.

**Etkilenecek sistemler:** Alışveriş, emlak, yevmiye, rüşvet, avukat, tanık, bahis, piyasa, randevu geliri, senet ve kayıt göçü.

## KRİTİK-02 — Ücretsiz eylemle aynı gün sınırsız itibar ve moral

**Yer:** `act("hayat")` (5489–5502), `HAYAT` verisi (633–641)

**Sade açıklama:** “Cuma namazı” ücretsiz ve kullanım sınırı yok. Oyuncu İLERLET'e basmadan aynı düğmeye tekrar tekrar basabiliyor.

**Doğrulanan sonuç:** 50 tıklama sonunda, aynı gün ve hiç para harcamadan Saygı 100, Racon 100 ve bütün adamların Gönlü 100 oldu.

**Neden kritik:** Oyunun moral, itibar, ihanet ve ilerleme dengesi tek düğmeyle tamamen iptal oluyor.

**Düzeltme:** Hayat eylemleri zaman harcamalı veya kişi başına/gün başına bir kez kullanılmalı. Cuma namazı yalnız cuma günü ve bir kez açılmalı. Aynı kural kahve, sofra, hamam, sinema, hediye ve ilişki eylemlerine de uygulanmalı.

## KRİTİK-03 — Veliefendi aynı gün sınırsız para üretir

**Yer:** `ATLAR` (647–651), `act("at")` (5519–5535)

**Sade açıklama:** Üç atın kazanma şansı kodda eşit, yani her biri yaklaşık %33. Buna rağmen ödemeleri 2,2; 3,6 ve 6,1 kat. Oyuncu da aynı gün sınırsız bilet alabiliyor.

**Doğrulanan sonuç:** ₺1.000 ile başlanıp yalnız “Haliç” seçilerek aynı oyun gününde kasa ₺1.136.000'e çıktı.

**Neden kritik:** Bütün iş, emlak, adam ve risk sistemleri anlamsızlaşıyor. Ayrıca oyun, belirlenen “kumar öğretme/teşvik etme” sınırına gereksiz yere yaklaşıyor.

**Düzeltme:** En doğrusu bu mini sistemi ana ekonomiden çıkarmak. Kalacaksa oranlara uygun ağırlıklı olasılık, bahis limiti, günlük tek yarış ve negatif/dengeleyici beklenen değer gerekir.

## KRİTİK-04 — Kayıt yazma hataları sessiz; uzun oyunda kayıt durabilir

**Yer:** `writeSave()` (1421–1430), `persist()` (1431–1434), büyüyen `inbox`, `calendar`, `jobs`, `defter` ve `evidence` dizileri

**Sade açıklama:** Yerel depolama dolarsa veya tarayıcı yazmayı reddederse hata tamamen yok sayılıyor. Oyuncu oynamaya devam eder fakat kayıt artık güncellenmiyor.

**Kanıt:** Tamamlanmış işler, eski kâğıtlar, takvim kayıtları ve defter genel olarak budanmıyor. Zorlanmış 1.000 haftalık koşuda tek kayıt yaklaşık **2,4 MB** oldu. Ana kayıt ve yedek birlikte tutulduğu için gerçek kullanım yaklaşık iki katına çıkıyor ve tipik localStorage sınırına yaklaşıyor.

**Neden kritik:** Oyuncu saatlerce oynadığını sanıp geri döndüğünde eski kayda düşebilir.

**Düzeltme:** Yazma hatasını görünür ve kalıcı uyarıya çevir. Eski kayıtları özetleyip buda. Boyut tavanı koy. `pagehide` sırasında son güvenli yazmayı dene. Manuel dışa aktarma düğmesinde başarı/başarısızlık geri bildirimi göster.

## KRİTİK-05 — Geçerli JSON içindeki bozuk alanlar oyunu açılır açılmaz çökertebilir

**Yer:** `migrate()` (1205–1327), `parseSave()` (1435–1440), `recalcDosya()` (1594–1605)

**Sade açıklama:** Kayıt yalnızca “JSON açılıyor mu?” diye kontrol ediliyor. İç dizilerin gerçekten doğru nesneler içerip içermediği doğrulanmıyor.

**Doğrulanan örnekler:**

- `evidence: [null]` içeren kayıt, “null değerinin week alanı okunamaz” hatasıyla çöktü.
- `calendar: [null]` içeren kayıt aynı biçimde çöktü.
- `week: -50`, `kasa: -999`, `korku: 999` gibi değerler göçten aynen geçti.

**Neden kritik:** Kısmen bozulmuş eski kayıt, elle içe aktarılan kayıt veya ileride değişen şema oyuncunun onlarca saatlik kaydını erişilemez hâle getirebilir.

**Düzeltme:** Kayıt için açık sürüm numarası ve bütün alanları doğrulayan şema kullan. Her dizi elemanını göçür, sınırları clamp et, bilinmeyen kimlikleri temizle. Göç başarısızsa ana kayda dokunmadan yedeği aç ve kullanıcıya hangi kopyanın kullanıldığını söyle.

---

# 4. YÜKSEK ÖNCELİKLİ BULGULAR

## YÜKSEK-01 — Aynı adam aynı anda birden fazla işte kullanılabilir

**Yer:** `drawIsler()` (4374–4424), `act("planla")` (5818–5846), `startJob()` (2098–2116)

İş planlama, adamın başka bir açık işe atanıp atanmadığını kontrol etmiyor. Aynı kimlik iki veya daha fazla işin `assigned` dizisine yazılabiliyor. Hazırlık ve yorgunluk da bu çakışmayı doğru temsil etmiyor.

**Düzeltme:** Adam için `reservedJobId` veya türetilmiş “meşgul” kontrolü kur. Aynı zaman aralığında yalnız bir iş/randevuya izin ver.

## YÜKSEK-02 — Yaralı, izinli, yorgun veya askerdeki adam işe gönderilebilir

**Yer:** `drawIsler()` 4376, `startJob()` 2103

Kod yalnız `ölü` ve `hapis` durumlarını dışlıyor. Yapılan testte `yarali` adamın işi `running` durumuna geçti. Aynı açık `izinli`, `asker` ve `yorgun` durumları için de var.

**Düzeltme:** İşe atanabilecek tek normal durum `hazir` olmalı. Bazı özel işler yorgun adama izin verecekse bu açık ve bedelli bir istisna olmalı.

## YÜKSEK-03 — Gelecekteki randevuya bugünden gidilebilir

**Yer:** `drawTakvim()` (4188–4228), `act("randevu-git")` (5235–5240), `randevuSahneBaslat()` (3480–3527)

Takvim, içinde bulunulan haftadaki bütün randevuların eylem düğmelerini açıyor. Gün kontrolü yok. Pazartesi günü cumartesi randevusu tamamlanabiliyor.

Bu sorun düğün, cenaze gibi bazı `duty-go` yükümlülüklerinde de bulunuyor; oyuncu olay gerçekleşmeden “gitmiş” sayılabiliyor.

**Düzeltme:** “Git/Katıl” yalnız `c.week === S.week && c.day === S.day` iken açık olmalı. Borç erken ödeme gibi gerçek istisnalar ayrı eylem olmalı.

## YÜKSEK-04 — “Ertele” randevuyu ileri değil geriye taşıyabilir

**Yer:** `act("randevu-ertele")` (5246–5259)

Yeni tarih etkinliğin tarihine değil, bugüne üç gün eklenerek hesaplanıyor.

**Doğrulanan örnek:** Pazartesi günü cumartesi randevusuna “Ertele” denince randevu perşembeye, yani iki gün erkene taşındı.

**Düzeltme:** Yeni tarih `c.week/c.day + 3 gün` üzerinden hesaplanmalı; çakışma ve üst erteleme sınırı bulunmalı.

## YÜKSEK-05 — Bazı dosya cezaları bir sonraki hesapta siliniyor

**Yer:** 926, 943, 2623, 5042, 5051 ve `recalcDosya()` 1594–1605

Skandal `+20`, kirli kasa `+2`, tehdit erteleme `+6`, muhtar desteği/korkutma `+3` doğrudan `S.dosya` üzerine yazılıyor. Sonraki `recalcDosya()` ise dosyayı sıfırdan evidence/nam/gürültü/toz üzerinden hesaplayıp bu cezaları unutuyor.

**Doğrulanan örnek:** Tehdit erteleme dosyayı 6 yaptı; `recalcDosya()` hemen ardından 0'a indirdi.

**Düzeltme:** Her kalıcı ceza evidence, süreli modifier veya ayrı `dosyaKalici` alanına yazılmalı. `S.dosya` yalnız türetilmiş görüntü değeri olmalı.

## YÜKSEK-06 — Sezon, puan ve maç omurgası belirlenen tasarım kuralına aykırı

**Yer:** 1184, 1239–1247, 3099–3237, 3764–3818, 4658–4703

Oyunun veri modeli ve ekranda görünen metinleri hâlâ şunları kullanıyor:

- “Sezon 1”
- “sezon bitimine”
- mahalle puanı ve sıralama tablosu
- `lig`, `fikstur`, `ligPuan`, `ligTablo`
- “Üç maç üç galibiyet” rozeti

Bu yalnız değişken adı meselesi değil. Oyunun ana ilerlemesi rakiplerle haftalık karşılaşma, puan tablosu ve sezon hedefi mantığına kurulmuş. Racon dünyasına yeni etiket yapıştırılmış futbol menajerliği iskeleti hissi veriyor.

**Düzeltme:** Puan yerine görünür neden-sonuç kullan: tutulan sokak, esnaf bağlılığı, rakip borcu, emniyet baskısı, söz ağırlığı. 13 haftalık sezon yerine “Amcanın mühleti”, “hesap dönemi” veya olayla biten mahalle safhaları kurulmalı.

## YÜKSEK-07 — Otomatik yasak kelime testi yanlış güven veriyor

**Yer:** üretimdeki `window.__raconTest()` (5913 sonrası), `scripts/racon-audit.mjs`

Her iki test “0 bulgu” veriyor. Buna rağmen ekranda “Sezon” ve “Üç maç üç galibiyet” var. Test `maç` için JavaScript'in ASCII tabanlı `\b` sınırını kullanıyor; Türkçe `ç` yüzünden eşleşme kaçıyor. “Sezon” ise yasak listesine hiç eklenmemiş.

**Düzeltme:** Türkçe karakterli kelimelerde Unicode uyumlu açık sınırlar kullan; yasak listenin tek kaynağı olsun. Test, başlangıç durumuyla yetinmeyip rozetler ve ilerleyen dönem metinleri dahil bütün içerik havuzunu taramalı.

## YÜKSEK-08 — Korku ve Saygı aynı anda neredeyse maksimum olabilir

**Yer:** `addRep()` (1989–1995)

Bir değer yükselirken diğeri yalnız **1 puan** düşüyor. Artış +10 olsa bile karşı değer -1. Tekrarlı artışlarda Korku 99, Saygı 100 elde edildi.

**Neden önemli:** Oyunun temel tasarım yasalarından biri fiilen çalışmıyor. Oyuncu iki zıt stratejinin bütün ödüllerini aynı anda alabiliyor.

**Düzeltme:** Sert tavan, toplam bütçe, doğrusal olmayan karşı tepki veya mahalle gruplarına göre farklı algı modeli kur.

## YÜKSEK-09 — Düşman esnafın tanıklığı dosyaya yazılmıyor

**Yer:** `finishJob()` 2500–2527

Tanık evidence'ı 2500. satırda oluşturuluyor. Esnafın düşman olup tanığı en az 1'e çıkaran kod ise 2524–2527 arasında, yani evidence oluşturulduktan sonra çalışıyor.

**Doğrulanan sonuç:** İlişkisi -50 olan esnafın sokağında tahsilat sonrası tanık değeri yükseldi, fakat `S.evidence` içinde tanık oluşmadı.

**Düzeltme:** Bütün tanık artırıcılarını evidence üretiminden önce hesapla veya tek `tanıkEkle()` fonksiyonunda birleştir.

## YÜKSEK-10 — Sokak hâkimiyeti ₺4.500'lik satın alma işlemine indirgenmiş

**Yer:** harita yan paneli 4039–4041, `act("tut")` 5609–5621

Boş bir sokak, orada iki iş yapma veya yerel ilişki kurma şartı uygulanmadan doğrudan ₺4.500 karşılığı alınabiliyor. Kod iki işten sonra “sokak tutulabilir” kâğıdı üretse de `tut` eylemi bu koşulu denetlemiyor.

**Neden önemli:** Oyunun ana vaadi olan mahallede kök salma, basit mağaza alışverişine dönüşüyor.

**Düzeltme:** Para yalnız maliyetlerden biri olmalı. Yerel keşif, en az iki farklı başarılı iş, esnaf ilişkisi, rakip cevabı ve belirli bir adamın sorumluluğu aranmalı.

## YÜKSEK-11 — Uzun oyun tamamlanmamış ve kaçınılmaz biçimde daralıyor

**Yer:** `stageGate()` 3052–3073, `LOCKED_NAV` 546–553, `ligKur()` 3120–3132

- Kademe yalnız Serseri → Delikanlı → Kabadayı → Ağabey ilerliyor.
- Baba, Aile Reisi ve Hanedan değerleri tanımlı ama ilerleme kuralı yok.
- Çoklu mahalle, alt ekip, aklama, savcı, masa ve hanedan düğmeleri sürekli kilitli.
- Rakip güçleri her 13 haftalık dönemde düz olarak `+9` artıyor.

Bu yapı yeni kararlar açmak yerine sayıları büyütüyor. Oyuncu bir süre sonra aynı işleri daha yüksek rakamlara karşı tekrarlıyor.

## YÜKSEK-12 — Ekipman sonuçları gerçekçilik iddiasını zedeliyor

**Yer:** `SHOP` 584–608, `gearBonus()` 1477–1488, iş sonucu 2414–2418

Silah/giysi/aracın etkisi doğrudan iş parasına yüzde bonus ve heat düşüşü olarak uygulanıyor. Sessiz tahsilatta bile güçlü silah daha fazla para getiriyor. “Defans” değeri polisin dikkatini azaltıyor. Bu, hikâyeyle mekanik arasında açık kopukluk.

**Düzeltme:** Ekipman yalnız ilgili olayda çalışmalı: araç kaçışı, palto gizleme/kimlik, silah çatışma caydırıcılığı gibi. `atk/def` oyuncuya gösterilmemeli; somut etki cümlesi kullanılmalı.

---

# 5. ORTA ÖNCELİKLİ BULGULAR

## ORTA-01 — Tamamlanmış veri sınırsız büyüyor

`jobs`, `inbox`, `calendar`, `defter` ve süresi geçmiş `evidence` genel olarak silinmiyor. `recalcDosya()` 16 haftadan eski evidence'a sıfır ağırlık veriyor fakat nesneyi saklamaya devam ediyor. Bu hem kayıt boyutunu hem ekran çizimini büyütüyor.

**Öneri:** Ayrıntılı yakın geçmiş + özetlenmiş eski tarih modeli kullan. Örneğin son 100 kâğıt, son 100 takvim olayı, son 50 tamamlanmış iş; daha eskisi haftalık özete dönüşsün.

## ORTA-02 — Yerel kayıt tek cihaz ve tek tarayıcıya bağlı

Racon Manager, Çete Savaşları'nın hesap/bulut kayıt altyapısını kullanmıyor. Tarayıcı verisi silinirse yalnız oyuncunun elle kopyaladığı metin yedeği kalıyor. Bu bir bug değil, önemli ürün riski.

## ORTA-03 — Son 200 milisaniyedeki eylem kaybolabilir

Çoğu eylem `persist()` ile 200 ms sonra yazılıyor. `pagehide/beforeunload` üzerinde zorunlu son yazma yok. Oyuncu eylemden hemen sonra sekmeyi kapatırsa son değişiklik kaybolabilir.

## ORTA-04 — Kayıt içe aktarma yolunda HTML öznitelik enjeksiyonu mümkün

Metinlerin çoğu `esc()` ile güvenli basılıyor. Fakat içe aktarılan `id`, `durum` ve benzeri bazı alanlar HTML attribute/class içine kaçışsız yerleştiriliyor. Başkasından alınmış kötü niyetli bir RACON/1 yedeği aynı origin içinde script çalıştırmaya kadar gidebilir.

**Öneri:** İçe aktarılan kimlikleri sıkı karakter listesiyle doğrula; bütün attribute değerlerini de escape et. Mümkünse `innerHTML` yerine DOM üretim yardımcıları kullan.

## ORTA-05 — Baskında aynı adam iki kez seçilebilir

`baskinTick()` iki adam alacağı zaman seçilen adamı aday listesinden çıkarmıyor. Rastgele seçim aynı adamı ikinci kez seçerse ikinci tur atlanıyor ve iki yerine bir kişi içeri giriyor.

## ORTA-06 — “Toz” yalnız artıyor; pasif oyuncunun dosyası da şişiyor

Her hafta `S.flags.toz += 1`. İddianame dışında düzenli azalma yok. Evidence sıfırlansa bile yalnız zaman geçmesi dosyayı yükseltiyor. Bunun neyi temsil ettiği oyuncuya açıklanmıyor ve sessiz oynamanın değerini azaltıyor.

## ORTA-07 — Hazır olmayan adamlardan da haftalık tam yevmiye kesiliyor

`payWages()` yalnız ölüleri dışlıyor. Hapiste, askerde, izinli veya uzun süre yaralı adam aynı tam ücreti alıyor. Bu tercih olabilir, fakat arayüzde sözleşme kuralı olarak açıklanmamış ve durumlara göre hiçbir farklılık yok.

## ORTA-08 — NPC'ler bağımsız insanlardan çok sayaç gibi

Esnaf ilişkisinin çoğu `mods` toplamı; berber/kahveci/kapıcı “iyilik jetonu” kaynağı; kadın karakterler hediye/randevu/yakınlık barı. NPC'lerin kendi amacı, hafızası, ilişkileri, ev/iş hayatı ve oyuncudan bağımsız hareketleri sınırlı.

## ORTA-09 — İlişki sistemi aynı gün para basılan yakınlık çubuğu

Hediye ve randevu aynı gün tekrarlanabiliyor. Üç kadın karakterin tepkileri büyük ölçüde aynı; yakınlık yalnız 100'e doğru artıyor. Sözden sonra anlamlı ortak hayat, çatışma veya sonuç zinciri yok.

## ORTA-10 — Yardım metni mevcut oyunla çelişiyor

**Yer:** 438–473

- “Elinde ekip yok” deniyor; kökene göre 1–3 adamla başlanıyor.
- “Sol menüdeki 8 ekran” deniyor; açık ekran sayısı 12.
- Pazar, Emlak, Hayat ve Sıralama yardımda açıklanmıyor.
- “Korku ile Saygı aynı anda çok yüksek olamaz” deniyor; kod bunu engellemiyor.
- “Sert gidersen para artar” genellemesi yanlış; Ateş çoğu işte geliri azaltıyor, yalnız Sıkıştır +%25 uyguluyor.

## ORTA-11 — Mobil erişilebilirlik zayıf

**Yer:** viewport 5, CSS 20–355

- `maximum-scale=1, user-scalable=no` yakınlaştırmayı kapatıyor.
- Temel yazı 13 px; mobil üst bilgi 11 px ve bazı menü etiketleri 9 px.
- Genel buton tabanı 40 px, kısa görünümde 36/32 px; rahat dokunma hedefinin altında.
- 360 px ekranda takvim hâlâ yedi sütun; uzun olay başlıkları çok dar hücrelere sıkışıyor.
- Yardım diyaloğu arka planı inert yapmıyor, odağı içine hapsetmiyor ve Escape ile kapanmıyor.

## ORTA-12 — Kilitli menüler bilgi vermekten çok kalabalık yaratıyor

Altı kilitli düğme masaüstü/yatay menüde sürekli yer kaplıyor. Üstelik hiçbiri mevcut kodda açılamıyor. Oyuncuya sahte bir ilerleme vaadi veriyor.

## ORTA-13 — Üretim dosyasının içinde büyük test/simülasyon motoru taşınıyor

`window.__raconTest` ve `window.__raconSim` ile yüzlerce satır test kodu doğrudan oyuncuya gönderiliyor. Bu kod kayıt alanını geçici olarak değiştiriyor ve geliştirici konsolundan çağrılabiliyor.

**Öneri:** Test motorunu ayrı dosyaya taşı ve yalnız test sırasında yükle.

## ORTA-14 — Repo testleri yeşil değil, Racon kodu typecheck/lint dışında

- `npm run typecheck`: geçti.
- `npm run build:dev`: geçti.
- `npm test`: 149 testin 15'i başarısız oldu. Bunlar çoğunlukla Grok PWA/auth şablonu beklentileriyle ilgili; Racon'a doğrudan ait değiller ama ana test kapısı kırmızı.
- `npm run lint`: repo genelinde 486 sorun verdi; büyük bölümü vendor/minified dosyalardan geliyor.
- Racon'ın inline JavaScript'i TypeScript kontrolünden ve anlamlı ESLint denetiminden geçmiyor.

Bu nedenle “build geçti” sonucu Racon motorunun sağlıklı olduğunu kanıtlamaz.

---

# 6. DÜŞÜK ÖNCELİKLİ BULGULAR

## DÜŞÜK-01 — Terminoloji tutarsız ve fazla oyunumsu

Ekranda veya metinde `heat`, `atk`, `def`, `front`, `form`, `rozet`, “Sezon” gibi farklı dil ve türlerden kelimeler birlikte duruyor. Heat proje sözlüğünde kalabilir; diğerleri Racon dünyasına çevrilmeli.

## DÜŞÜK-02 — “Bel holster” eşya adı ve değeri anlamsız

Holster silah değil, silah kılıfıdır. Buna rağmen saldırı 55 veriyor; Pompalı 40 veriyor. Ya eşyanın adı eksik ya da mekanik yanlış.

## DÜŞÜK-03 — Kopyalama işlemi geri bildirim vermiyor

Yedek “Kopyala” düğmesi başarısız olduğunda kullanıcıya hiçbir şey söylenmiyor. Promise reddi de gerçek anlamda yakalanmıyor.

## DÜŞÜK-04 — Silme akışı metin olarak kaba ve tekrarlı

İkinci onay düğmesi “Emin misin? Bu kayıt gider.” cümlesini aynen tekrar ediyor. “Kaydı kalıcı olarak sil” gibi net bir eylem etiketi daha iyi olur.

## DÜŞÜK-05 — Dönem hissi belirsiz

Murat 124, Anadol, Mauser 1910, EDS, modern “site” ve güncel fiyat hissi aynı evrende. Oyun belirli bir yıl söylemediği için bunlar doğrulanabilir bir tarih dünyası oluşturmuyor.

---

# 7. SAVE / LOAD AYRINTILI HÜKMÜ

| Senaryo | Durum | Risk |
|---|---|---|
| Yeni oyun | İlk gece sonunda doğrudan yazılıyor | Düşük |
| Normal otomatik kayıt | Çoğu eylemden 200 ms sonra | Orta |
| Sayfa yenileme | Son yazılmış ana kayıt açılır | Düşük/Orta |
| Ana JSON bozuk, yedek sağlam | Yedek açılır | İyi; kullanıcıya yedekten açıldığı söylenmiyor |
| JSON geçerli, iç veri bozuk | Göç kabul eder, oyun sonra çökebilir | **Kritik** |
| Depolama kotası dolu | Yazma hatası sessizce yok edilir | **Kritik** |
| Eski kayıt | Bazı alanlar tamamlanıyor | Orta; iç dizi elemanları ve sınırlar yeterince doğrulanmıyor |
| Manuel dışa aktarma | Metin yedeği üretir | İyi; başarı geri bildirimi yok |
| Manuel içe aktarma | Başlık + base64 + JSON okur | Orta/Yüksek; şema ve güvenlik doğrulaması zayıf |
| Cihaz/tarayıcı değişimi | Otomatik taşıma yok | Yüksek ürün riski |

**Net kayıt kararı:** Mevcut sistem kısa prototip kullanımı için idare eder. Onlarca saatlik oyuncu kaydı için güvenli değildir.

---

# 8. UI / UX HÜKMÜ

## İyi taraflar

- Ana üç sütun düzeni ve mobil alt menü yaklaşımı anlaşılır.
- Aktif sekme görsel olarak işaretleniyor.
- Butonlar genel olarak metinli; yalnız ikon kullanımına az başvurulmuş.
- Koyu/altın kimlik oyunun tonuna uyuyor.
- Tehlikeli eylemler kırmızıya yakın renkle ayrılıyor.

## Sorunlar

- 12 açık + 6 kilitli ekran bilgi mimarisini şişiriyor.
- En önemli günlük kararlar Olaylar, Takvim, İşler, Husumet ve Kasa arasında dağılmış.
- Oyuncu hangi adamın meşgul olduğunu göremiyor.
- Eylemlerin zaman maliyeti olmadığı için “gün” ile buton basma arasındaki bağ anlaşılmıyor.
- Mobil yazılar ve dokunma alanları küçük.
- Yedi sütunlu mobil takvim okunabilirlik açısından riskli.
- Bazı başarısız butonlar sessizce hiçbir şey yapmıyor; örneğin para yetmemesi her yerde tutarlı geri bildirim üretmiyor.
- Kayıt başarısı/hatası görünmüyor.

**Not:** Playwright tarayıcısı çalışma ortamında bulunmadığı ve indirme isteği 502/zaman aşımı aldığı için `scripts/racon-qa.mjs` bu denetimde çalıştırılamadı. Mobil/masaüstü bulguları mevcut CSS, DOM yapısı ve repodaki QA kuralları üzerinden doğrulandı; gerçek cihaz ekran görüntüsü testi düzeltme aşamasında ayrıca yapılmalı.

---

# 9. OYUN TASARIMI VE DENGE HÜKMÜ

## Kararlar gerçekten sonuç üretiyor mu?

Kısmen. Sessiz/Sıkıştır/Ateş/Çekil seçimi para, heat ve itibarı değiştiriyor. Ölüm ve cenaze zinciri anlamlı. Fakat exploitler bu sonuçları önemsizleştiriyor. Oyuncu ücretsiz hayat eylemleri ve bahis parasıyla sistemlerin çoğunu atlayabiliyor.

## Baskın strateji var mı?

Evet:

- Haliç'e tekrar tekrar bahis yaparak sınırsız para.
- Cuma namazına tekrar tekrar basarak Saygı/Racon/Gönül maksimumu.
- Boş sokakları yalnız ₺4.500 ödeyerek alma.
- Aynı güçlü adamı birden çok işe yazma.
- Randevuları haftanın başında erkenden çözme.

## Oyun fazla kolay mı, zor mu?

İkisi birden. Exploit bilen oyuncu için anlamsız derecede kolay. Exploit kullanmayan oyuncu içinse rakip gücü her dönemde +9 arttığından ve toz sürekli yükseldiğinden uzun vadede yapay biçimde zorlaşıyor.

## NPC'ler yaşayan insanlar gibi mi?

Henüz değil. Adamlar, bağ/ölüm/ihanet sistemleri sayesinde diğer NPC'lerden daha canlı. Esnaf, kadınlar, muhtar, berber, kahveci ve komiser çoğunlukla sayaç ve eylem kapısı.

## Geçmiş kararlar geri dönüyor mu?

Bazıları dönüyor: esnaf öfkesi, sokak hafızası, adam bağları, kan davası, husumet ve dosya. Fakat pek çok doğrudan dosya cezasının silinmesi ve eski olayların yalnız listede kalması nedeniyle sistemin hafızası güvenilir değil.

## Uzun vadeli tekrar riski

**Çok yüksek.** Yeni katman açmak yerine aynı işler, aynı 12 randevu ve aynı üç hedef daha güçlü rakiplerle tekrarlanıyor. Oyuncunun kurduğu düzenin yönetimi, iç siyaset, mahalleler arası lojistik, miras veya gerçek bir son oyun yok.

---

# 10. EKSİK OLAN NE?

## Olmazsa olmaz

1. **Eylem zamanı/bütçesi:** Her gün sınırlı sayıda kişisel eylem; iş ve randevular gerçek takvime bağlı.
2. **Sağlam muhasebe:** Kirli + temiz = toplam; her gelir ve giderin kaynağı belli.
3. **Adam müsaitliği:** Hazır, meşgul, yaralı, izinli, asker, hapis ve ölü durumları tek merkezden denetlenmeli.
4. **Kayıt güvenliği:** Sürüm, şema, doğrulama, budama, görünür hata, güvenli yedek.
5. **Gerçek sokak ele geçirme:** Para + yerel bağ + iş sonucu + rakip cevabı.
6. **Futbol iskeletinin kaldırılması:** Sezon/puan yerine mahalle içi güç dengesi.

## Oyunu ciddi geliştirir

1. NPC'lerin kendi hedefi, ailesi, borcu, işi, hafızası ve birbiriyle ilişkisi.
2. Rakiplerin oyuncuyla aynı temel kaynaklara tabi olması; sayıların rastgele oynaması yerine görünür eylem yapması.
3. Dosyanın olay/kanaat/delil ayrımı ve savcı–karakol–mahkeme zinciri.
4. Ağabey sonrasında alt ekip, mahalle sorumluları, iç hizip ve halef yönetimi.
5. Tek bir büyük final yerine farklı çöküş/çekilme/miras sonuçları.
6. Hayat ve ilişkinin bonus düğmesi değil, zaman ve sorumluluk seçimi olması.

## Güzel olur ama şart değil

1. Daha fazla Fatih sokağı ve yerel mekân.
2. Belirli bir yıl/dönem seçimi ve ona uygun fiyat/eşya/dil.
3. Ayrıntılı mahalle günlüğü ve önemli olayları dışa aktarma.
4. Daha fazla başlangıç kökeni.
5. Ses ve hafif ortam efektleri; kapatılabilir olmalı.

## Eklemeye değmez / gereksiz karmaşıklık

1. Sırf modern görünsün diye React/Vue'ya tam geçiş.
2. 3D şehir ve serbest dolaşma.
3. Çok oyunculu çete savaşı.
4. Yüzlerce silah/eşya kataloğu.
5. Gerçek suç yöntemlerini ayrıntılı öğreten sistemler.
6. Yapay zekâ sohbetli NPC'ler; temel state ve sonuç zinciri düzelmeden fayda sağlamaz.

---

# 11. KOD KALİTESİ VE SÜRDÜRÜLEBİLİRLİK

## Olumlu

- Fonksiyon ve alan adları çoğunlukla Türkçe ve takip edilebilir.
- Merkezi `act()` sayesinde tek event delegation kullanılıyor; listener çoğalması görülmedi.
- Timer'ların önemli kısmı başlamadan önce temizleniyor.
- `finishJob()` tamamlanmış işi ikinci kez sonuçlandırmıyor.
- Metinlerin önemli bölümü `esc()` ile HTML'e güvenli basılıyor.
- Seed tabanlı rastgelelik test edilebilir.

## Olumsuz

- 6.829 satırlık tek HTML dosyası değişiklik çakışması ve istemeden başka sistemi bozma riskini yükseltiyor.
- HTML/CSS/veri/motor/arayüz/test/simülasyon aynı closure içinde.
- `S.flags` onlarca belirsiz alanın toplandığı sınırsız bir torba.
- Kayıt şeması tipli değil; bazı alanlar göçürülüyor, bazıları ham bırakılıyor.
- Aynı kural farklı yerlerde tekrar hesaplanıyor.
- Üretim testi gerçek kullanıcı arayüzünün tamamını kapsamıyor ve false negative veriyor.
- Racon kodu repo typecheck'inden fiilen kaçıyor.

## Önerilen küçük ve güvenli modülerleşme

Framework değiştirmeden şu ayrım yeterlidir:

- `racon-data.js`: sabit veri ve metin havuzları
- `racon-state.js`: canonical, migrate, save/load, invariant
- `racon-engine.js`: zaman, iş, dosya, ekonomi, NPC ve rakip kuralları
- `racon-ui.js`: ekran çizimi ve DOM eylemleri
- `racon.css`: bütün görünüm
- `racon-tests.mjs`: üretimden ayrı testler

Bu ayrım tek seferde büyük refactor olarak yapılmamalı. Önce kritik invariantlar test edilmeli, sonra bölüm bölüm çıkarılmalı.

---

# 12. TEST SONUÇLARI VE GÜVEN SINIRI

## Çalıştırılan kontroller

- `node scripts/racon-audit.mjs`: 700 günlük koşu, 8 sınır senaryosu, eski kayıt örnekleri; araç **0 bulgu** bildirdi.
- `window.__raconTest()` Node harness içinde: **0 bulgu** bildirdi.
- `npm run typecheck`: geçti.
- `npm run build:dev`: geçti.
- Özel harness testleriyle şu sorunlar tekrar üretildi:
  - toplam kasa olmadan kirli para harcama,
  - yaralı adamı işe başlatma,
  - aynı adamı iki işe atama,
  - düşman esnaf tanığının evidence'a yazılmaması,
  - doğrudan dosya cezalarının `recalcDosya()` ile silinmesi,
  - pazartesi günü cumartesi randevusunu bitirme,
  - ertelemenin cumartesiyi perşembeye çekmesi,
  - ücretsiz eylemle Saygı/Racon/Gönül 100,
  - Haliç bahsiyle aynı gün ₺1 milyonu aşma,
  - bozuk iç dizili kaydın çökmesi.

## Otomatik test neden “temiz” dedi?

Mevcut testler kendi kabul kriterlerini doğruluyor, fakat kabul kriterlerinin bazıları yanlış veya çok dar. Örneğin Korku/Saygı testi “+10 Korku gelince Saygı yalnız 1 düştü mü?” diye bakıyor; iki değerin aynı anda çok yüksek kalıp kalmadığını sınamıyor. Yasak kelime testi de Türkçe `maç` kelimesini regex sınırı nedeniyle kaçırıyor.

Bu nedenle mevcut testler yararlı ama güven kapısı olmaya yeterli değil.

---

# SONUÇ

Racon Manager'ın çöpe atılması veya baştan yazılması gerekmiyor. İçinde iyi fikirler ve birbirine bağlanmış güçlü sonuç zincirleri var. Fakat şu anda üzerine yeni özellik eklemek doğru sıra değil. Yeni kat eklenirse bozuk muhasebe, sınırsız eylem, zayıf kayıt ve futbol menajerliği omurgası daha da pahalı hâle gelir.

**Doğru sonraki aşama:** Önce ilk 10 düzeltmeyi küçük, testli ve geri alınabilir paketler hâlinde uygulamak. İlk paket yalnız ekonomi invariantı + kayıt güvenliği + eylem zaman sınırı olmalıdır. Bundan sonra takvim/adam müsaitliği, ardından ilerleme omurgası ele alınmalıdır.

