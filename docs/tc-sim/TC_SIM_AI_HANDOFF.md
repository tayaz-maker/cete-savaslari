# TC Simülasyonu — AI Devir Notu

## Oyun

Türkiye'de geçen, tek bir insanın hayatını haftalık kararlarla yöneten yaşam simülasyonu. The Sims'ten hayat kurma fikrini; Football Manager'dan ayrıntılı menü, kişi profili, takvim, finans, geçmiş ve uzun vadeli sonuç yaklaşımını alır. Spor veya ülke yönetimi oyunu değildir.

## Mevcut aşama

**Aşama 1 — Tasarım Kilidi.** Oyun kodu, route ve katalog kaydı henüz oluşturulmadı.

## Kilitli kararlar

- 18 yaş başlangıç; çocukluk yalnız başlangıç geçmişidir.
- İlk oynanabilir şehir İstanbul; dünya oyuncu merkezlidir.
- Ana tur 1 haftadır; ay sonu finans, yıl sonu hayat dosyası vardır.
- İlk prototip yalnız birkaç oyun yılıdır: 1 oyuncu, 1 aile, ~5 NPC, 3 iş, 3 ev, 1 partner ihtimali, 20–30 event ve ~5 gecikmiş sonuç.
- Çekirdek: Zaman + Para + İnsanlar + Beden + Geçmiş + Sonuçlar.
- Basit HTML/CSS/JavaScript; aşırı tek dosya veya aşırı parçalı mimari yok.
- Belgeler `docs/tc-sim/`; ileride oyun `public/games/tc-sim/` altında olacak ve mevcut katalog/iframe route'una bağlanacak.

## Son yapılanlar

- Ana tasarım kaynak belgesi hedefli biçimde sadeleştirildi.
- Master, sistem haritası/state taslağı, 6 aşamalı yol haritası ve bu devir notu oluşturuldu.
- Save için sürüm, migration, doğrulama, sınırlı geçmiş ve recovery ilkeleri kilitlendi.

## Sıradaki tek iş

**Aşama 2 için çalışan çekirdek teknik planını hazırlayıp küçük oyun iskeletini kodlamak:** önce state + hafta ilerletme + koşullu karar/sonuç + güvenli save/load; içerik ve UI polish eklememek.

## Korunacak teknik ilkeler

- Motor önce, içerik sonra.
- State tek doğruluk kaynağı olmalı; sistemler kontrollü işlemlerle state'i değiştirmeli.
- Hafıza, flag, açık dosya ve ham event geçmişi birbirine karıştırılmamalı.
- Eventler mevcut durum ve geçmişten doğmalı; sonuçların nedeni oyuncuya açıklanabilmeli.
- Save yüklenmeden önce doğrulanmalı; hata sessizce yutulmamalı.
- Ürün yönünü değiştiren kararlar dışında kullanıcı küçük teknik tercihlerle durdurulmamalı.
