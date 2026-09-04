# TC SIM Kalite Backlog

## P2 — Orta

### UI-001 — Kapsamlı mobil optimizasyon
- Ekran/menu: Tüm TC SIM ekranları
- Sorun: Özellik ve menü yapısı tamamlanmadan nihai mobil düzen denetimi yapılmadı.
- Tekrarlama: 390px genişlikte tüm ekranları sırayla aç.
- Beklenen: Tüm paneller, tablolar, modallar, uzun Türkçe metinler ve kontroller rahatça okunur ve kullanılabilir.
- Mevcut: Bu sprint yalnızca acil responsive kırılmaları giderir; kapsamlı son geçiş beklemede.
- Olası dosya/sistem: `public/games/tc-sim/styles.css`, ekran render'ları
- 3D tarafından getirildi mi: Hayır; planlı sonraki kalite geçişi.

### UI-002 — Mobil gezinme yoğunluğu
- Ekran/menu: Üst gezinme
- Sorun: Etiketli yatay gezinme kullanılabilir hale getirildi ancak küçük ekranlarda tüm bölümler tek görünümde yer almayabilir. 12 bölümün tamamı etkinleştikten sonra bu daha da belirgin.
- Tekrarlama: 390px genişlikte gezinme çubuğunu yatay kaydır.
- Beklenen: Etiketler okunur, hedefler erişilebilir ve sayfa yatay taşmaz.
- Mevcut: Kontrollü yatay gezinme kullanılıyor; kapsamlı bilgi mimarisi düzenlemesi sonraya bırakıldı.
- Olası dosya/sistem: `public/games/tc-sim/styles.css`
- 3D tarafından getirildi mi: Hayır.

### UI-004 — Haftalık ilerleme geri bildirimi zayıf
- Ekran/menu: ANA SAYFA / GÜNDEM
- Sorun: Haftayı ilerletme sonuçlarının büyük kısmı yalnız "Yeni hafta başladı." döner; para/beden/ilişki değişimi ayrıca belirtilmez.
- Tekrarlama: Aktif olay yokken birkaç hafta art arda ilerlet.
- Beklenen: O haftaki en görünür değişiklik (para, enerji/stres, önemli ilişki değişimi, yeni bilinen yükümlülük) özetlenir.
- Mevcut: Bu sprint kapsamı dışında bırakıldı; küçük, hedefli bir iyileştirme olarak ayrı ele alınmalı.
- Olası dosya/sistem: `public/games/tc-sim/js/time.js`, `app.js`
- 3D tarafından getirildi mi: Hayır.

### UI-005 — AİLE / İLİŞKİLER, KİŞİLER'e göre az farklılaşmış
- Ekran/menu: AİLE / İLİŞKİLER
- Sorun: Ekran KİŞİLER'in özetiyle büyük ölçüde örtüşüyor; kendine özgü bir değer sunmuyor.
- Tekrarlama: KİŞİLER ve AİLE/İLİŞKİLER ekranlarını art arda aç.
- Beklenen: İlişki değişim zaman çizelgesi, açık sosyal yükümlülükler ve ilişki-seviyesi özeti gibi KİŞİLER'de olmayan bir işlev görülür.
- Mevcut: Bu sprint kapsamı dışında bırakıldı; ayrı bir etkileşim kalitesi sprintinin konusu.
- Olası dosya/sistem: `public/games/tc-sim/js/app.js`
- 3D tarafından getirildi mi: Hayır.

### UI-006 — Çekirdek denge/durak noktası eksik
- Ekran/menu: Genel oynanış döngüsü
- Sorun: Mesai/dinlenme döngüsü baskın stratejidir, para sınırsız birikir ve sağlık 0'a düşse bile somut bir sonuç yoktur.
- Tekrarlama: Uzun bir simülasyonda her hafta mesai + dinlen seç.
- Beklenen: Tekrarlanan mesainin azalan getirisi ve kritik sağlık durumunun somut bir karşılığı olur.
- Mevcut: Bu sprintte kasıtlı olarak dokunulmadı; ayrı bir denge sprintinin konusu.
- Olası dosya/sistem: `public/games/tc-sim/js/time.js`, `state.js`
- 3D tarafından getirildi mi: Hayır.

## P3 — Polish

### UI-003 — İlişki metrikleri için daha ileri görsel açıklama
- Ekran/menu: Kişiler / Aile-İlişkiler
- Sorun: Sayısal metrikler ayrışıyor; ölçek ve anlam için daha zengin açıklama ileride eklenebilir.
- Tekrarlama: İlişki ekranlarını aç.
- Beklenen: Sayılar ve anlamları tek bakışta anlaşılır.
- Mevcut: Etiket-değer çakışması giderildi.
- Olası dosya/sistem: `public/games/tc-sim/styles.css`, render katmanı
- 3D tarafından getirildi mi: Hayır.

### UI-007 — PARA işlem gerekçeleri bazen genel
- Ekran/menu: PARA / Son işlemler
- Sorun: Bazı event etkileri işlem defterine yalnız "Event sonucu" gibi genel bir gerekçeyle düşer (`events.js` içindeki `effects.reason` varsayılanı).
- Tekrarlama: PARA ekranını, birkaç standart event çözüldükten sonra aç.
- Beklenen: Her işlem hangi olaydan geldiğini az çok anlatan bir gerekçe taşır.
- Mevcut: Düzeltme onlarca event tanımına dokunmayı gerektireceğinden bu sprintin kapsamı dışında bırakıldı.
- Olası dosya/sistem: `public/games/tc-sim/js/events.js`
- 3D tarafından getirildi mi: Hayır.
