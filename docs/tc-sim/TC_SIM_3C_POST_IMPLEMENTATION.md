# TC SIM — 3C Uygulama Sonrası

## Uygulananlar

- Mevcut dört NPC üzerinde yakınlık, güven, gerilim, rol/tag, son anlamlı temas ve romantik durum.
- Merkezî ilişki evresi ve sosyal eylem uygunluğu.
- Görüşme, dertleşme, yardım, gerilim onarma, söz tutma ve ilişkiyi ileri taşıma.
- Haftalık kontrollü ilişki bakımı; davet, yardım sözü, romantik fırsat ve gerilim olayları.
- Yardım sözü için deadline taşıyan openCase; başarı ve başarısızlıkta tek seferlik sonuç/hafıza.
- KİŞİLER dosyası, AİLE/İLİŞKİLER özeti ve dashboard sosyal özeti.
- Vanilla JS modülleri v5 cache anahtarıyla yüklenir; deploy sonrası eski state modülüyle yeni arayüzün karışması engellenir.

## State ve Migration

- `SAVE_VERSION = 5`; açık `migrateV4()` zinciri kullanılır.
- Eski ilişki puanı yakınlık olarak korunur. Güven ve gerilim NPC `social` kaydındadır.
- `state.social.currentPartnerNpcId` tek partneri, `lastMaintenanceWeek` haftalık guard'ı tutar.
- Bozuk eksenler, temas haftası, romantik durum ve partner çakışmaları normalize edilir.

## Testler

- Önceki 83 test korunmuştur; 28 yeni 3C testiyle toplam 111 test vardır.
- Arkadaşlık, ihmal, sözün tutulması/kaçırılması ve romantik geçiş senaryoları testlidir.
- 144 hafta, 520 hafta ve 20 seed × 260 hafta sosyal eylemlerle çalıştırılır.

## Bilinen Sınırlar

- NPC sayısı dört; bağımsız NPC hayat/kariyer simülasyonu yoktur.
- Romantik temel sevgililikte biter; evlilik, ayrılık içeriği ve yetişkin sistemleri yoktur.
- Sosyal yükümlülükler tam takvim değil, mevcut event/openCase hattını kullanır.
- Denge değerleri prototiptir ve manuel playtest gerektirir.

## Sonraki Aşama Önerisi

3D yalnız kullanıcı playtestinden sonra kilitlenmeli. İlk aday, sosyal/iş/eğitim zincirinin içerik ve denge geri bildirimlerine göre seçilmesidir.
