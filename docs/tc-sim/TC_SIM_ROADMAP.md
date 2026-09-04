# TC SIM — Yol Haritası

## 1. Tasarım Kilidi

**Durum:** Tamamlandı.

**Amaç:** Küçük prototipin sınırlarını ve ortak dilini sabitlemek.

**Ana işler:** Ana belgeleri oluşturmak; sistem ilişkilerini, state sınırlarını, save ilkelerini ve repository konumunu belirlemek; büyük tasarımdaki sonraya bırakılacak parçaları ayırmak.

**Bitmiş sayılma şartı:** Dört temel belge çelişmiyor, kritik açık ürün kararı kalmıyor ve kodlama görevi tek anlamlı kapsamla yazılabiliyor.

## 2. Çalışan Çekirdek

**Durum:** Tamamlandı. State, haftalık zaman, sınırlı karar, koşullu event, hafıza, açık dosya, yıl kaydı ve güvenli yerel kayıt çalışıyor.

**Amaç:** İçeriği az fakat baştan sona işleyen bir simülasyon omurgası kurmak.

**Ana işler:** Modüler oyun iskeleti, temel state, haftalık ilerleme, zaman/enerji harcayan karar, koşullu event, flag, hafıza, açık dosya, ay/yıl geçişi ve güvenli save/load.

**Bitmiş sayılma şartı:** Bir test karakteri en az bir oyun yılını hata vermeden tamamlar; anlık ve gecikmiş sonuçlar açıklanabilir biçimde çalışır; bozuk kayıt oyunu çökertmez.

## 3. Hayatı Detaylandırma

**Amaç:** Çekirdek formülün bütün parçalarını küçük prototip kapsamında birbirine bağlamak.

**Ana işler:** 3 iş, 3 konut, aile, yaklaşık 5 NPC, 1 partner ihtimali, para, temel beden, NPC ilerlemesi, 20–30 koşullu event, yaklaşık 5 açık dosya ve yıl sonu raporu.

**Dönem ilkesi:** Gelecekte farklı başlangıç dönemleri desteklenecek; mevcut oynanabilir kapsam yalnız Günümüz'dür ve dönem kimliği save state'te korunur.

**Dilimler:** 3A (iş + konut) ve 3B (eğitim + kariyer temeli) tamamlandı. **3C (sosyal çevre + ilişkiler temeli) tamamlandı:** yakınlık/güven/gerilim, ilişki evreleri, haftalık sosyal eylemler, kontrollü ihmal, NPC hafızası, sosyal yükümlülükler, romantik ilgi → sevgili yolu, KİŞİLER ve AİLE/İLİŞKİLER ekranları çalışıyor. Save sürümü 5'tir. Ayrıntı: `TC_SIM_3C_POST_IMPLEMENTATION.md`.

**Bitmiş sayılma şartı:** Oyuncu para–zaman–insan–beden arasında gerçek tercihler yapar; bir yıllık geçmiş anlamlı görünür; içerik kotası motor eksiklerini gizlemek için büyütülmemiştir.

## 4. Uzun Hayat

**Amaç:** Kanıtlanmış prototipi önce 18–35 aralığına, gerekirse daha uzun yaşama hazırlamak.

**Ana işler:** Yıllar arası NPC değişimi, kariyer/ilişki evreleri, enflasyon ve kalıcı beden etkileri; tasarım doğrulanırsa evlilik, çocuk, yaşlanma, ölüm ve kuşak sistemini aşamalı ele almak.

**Bitmiş sayılma şartı:** Çok yıllı oyun teknik olarak kararlı, geçmiş okunabilir ve erken kararlar ileriki yıllarda ölçülebilir sonuç üretiyor. Uzun hayat özellikleri prototip eğlenceli bulunmadan eklenmez.

## 5. Denge + İçerik

**Amaç:** Tek baskın stratejiyi azaltmak ve çalışan motoru yeterli çeşitlilikle beslemek.

**Ana işler:** Uzun süreli otomatik simülasyonlar, ekonomi/ilişki/beden dengesi, event tekrar kontrolü; yalnız testlerin gösterdiği ihtiyaç kadar yeni iş, NPC ve olay eklemek.

**Bitmiş sayılma şartı:** Para veya ilişkiler kontrolsüz şişmiyor, çıkmazlar makul, sonuçlar anlaşılır, tekrar oranı kabul edilebilir ve farklı başlangıçlar farklı hayatlar üretiyor.

## 6. Son Temizlik

**Amaç:** Oyunu TarikLab içinde güvenilir ve rahat oynanabilir hâle getirmek.

**Ana işler:** Mobil/masaüstü kullanılabilirlik, erişilebilirlik, metin, performans, save recovery testi, hata durumları ve katalog/route entegrasyonu.

**Bitmiş sayılma şartı:** Temel akış desteklenen ekranlarda çalışır; kritik konsol/save hatası yoktur; yayın kontrol listesi ve gerçek oynanış testi geçer.
