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

### UI-010 — Uzun oyunda para bolluğu
- Ekran/menu: Genel oynanış döngüsü
- Sorun: Çekirdek takaslar güçlendi (mesai azalan getirili, kritik sağlık karar hakkını kısıyor) ama düzenli giderler sabit kaldığı için 2–3 oyun yılından sonra para yine baskı olmaktan çıkıyor. Ölçüm: 156 haftada dengeli oyun ~₺209k, aralıklı mesai ~₺222k; aylık gider 6.500 sabit.
- Tekrarlama: `node scripts/tc-sim-stakes.mjs` çıktısında 156 haftalık satırları karşılaştır.
- Beklenen: Orta/uzun oyunda paranın alıcı gücü ya da hedefleri, birikimle birlikte anlam kazanmaya devam eder.
- Mevcut: Bu sprint kısa/orta vadeli takasları düzeltti; uzun vadeli para eğrisi ayrı bir denge işi olarak bırakıldı.
- Olası dosya/sistem: `public/games/tc-sim/js/catalog.js`, `life.js` (gider/konut kademeleri)
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

