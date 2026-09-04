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
- Sorun: Etiketli yatay gezinme kullanılabilir hale getirildi ancak küçük ekranlarda tüm bölümler tek görünümde yer almayabilir.
- Tekrarlama: 390px genişlikte gezinme çubuğunu yatay kaydır.
- Beklenen: Etiketler okunur, hedefler erişilebilir ve sayfa yatay taşmaz.
- Mevcut: Kontrollü yatay gezinme kullanılıyor; kapsamlı bilgi mimarisi düzenlemesi sonraya bırakıldı.
- Olası dosya/sistem: `public/games/tc-sim/styles.css`
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
