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

### UI-006 — Çekirdek denge/durak noktası eksik
- Ekran/menu: Genel oynanış döngüsü
- Sorun: Mesai/dinlenme döngüsü baskın stratejidir, para sınırsız birikir ve sağlık 0'a düşse bile somut bir sonuç yoktur.
- Tekrarlama: Uzun bir simülasyonda her hafta mesai + dinlen seç.
- Beklenen: Tekrarlanan mesainin azalan getirisi ve kritik sağlık durumunun somut bir karşılığı olur.
- Mevcut: Bu sprintte kasıtlı olarak dokunulmadı; ayrı bir denge sprintinin konusu.
- Olası dosya/sistem: `public/games/tc-sim/js/time.js`, `state.js`
- 3D tarafından getirildi mi: Hayır.

### UI-008 — "Mehmet'e borç ver" ve "başvurusuna yardım et" kararları arayüzden hiç seçilemiyor
- Ekran/menu: ANA SAYFA / BU HAFTA
- Sorun: `lend-friend` ve `help-friend` kararları `DECISIONS` listesinde tanımlı ve testlerde doğrudan çağrılıyor, ama `getAvailableDecisions` yalnız `CORE_DECISION_IDS` veya `contextual` koşulu olan kararları döndürüyor; bu ikisinde `contextual` yok. Sonuç: sabit 1.500 TL borç mekanizması ve buna bağlı CHN-01 kolu, oyun içinden asla tetiklenemiyor.
- Tekrarlama: Yeni oyun aç, ANA SAYFA'daki "BU HAFTA" kart listesinde "Mehmet'e borç ver" veya "başvurusuna yardım et" ara.
- Beklenen: Uygun koşulda (ör. bakiye ≥1.500) bu kararlar seçilebilir bir kart olarak görünür.
- Mevcut: Bu sprintin kapsamı dışında bırakıldı (karar kullanılabilirliği çekirdek denge/oynanış konusu); tespit edildi, düzeltilmedi.
- Olası dosya/sistem: `public/games/tc-sim/js/time.js` (`CORE_DECISION_IDS` veya `contextual` eklenmesi)
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

### UI-009 — ANA SAYFA "AÇIK MESELELER" paneli gizli gecikmeli sonuçları içerik vermeden gösteriyor
- Ekran/menu: ANA SAYFA / AÇIK MESELELER
- Sorun: Bu panel `state.openCases`'i tür ayrımı yapmadan listeliyor; `social-followup` türü buraya "Bekleyen sosyal mesele" + geri sayım olarak düşüyor. TAKVİM ve AİLE/İLİŞKİLER bu türü kasıtlı olarak gizliyor (bkz. `calendar.js`), ama ANA SAYFA panel bu kurala uymuyor.
- Not: Bu, olayın ne olduğunu veya sonucunu açıklamıyor, yalnız "bir şey bekliyor" bilgisi veriyor; 3D tasarımının kasıtlı bir gerilim unsuru olabilir. Yine de TAKVİM'in "yalnız bilinen yükümlülük" ilkesiyle tutarsız.
- Tekrarlama: Uzun bir oyunda bir sosyal zincirin (CHN-01/03/08/09/10) ikinci/üçüncü halkası beklerken ANA SAYFA'yı aç.
- Beklenen: Ürün kararı gerekiyor — ya panel de `getKnownOpenCases` ile aynı görünürlük kuralına bağlanmalı, ya da bu bilinçli bir gerilim unsuru olarak belgelenip korunmalı.
- Mevcut: Bu sprintte bilinçli olarak dokunulmadı (kapsam yalnız TAKVİM ve AİLE/İLİŞKİLER'di); tespit edildi, karar bekliyor.
- Olası dosya/sistem: `public/games/tc-sim/js/app.js` (`renderDashboard`)
- 3D tarafından getirildi mi: Evet (3D sprintinden kalma davranış).
