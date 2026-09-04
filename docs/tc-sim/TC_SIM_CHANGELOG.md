# TC Simülasyonu — Değişiklik Kaydı

## Çalışan Çekirdek

- Modüler Vanilla HTML/CSS/JavaScript oyun iskeleti oluşturuldu.
- Yeni oyun, başlangıç profili, haftalık iki aktivite sınırı ve 4×12 zaman modeli eklendi.
- Para, beden, ilişkiler, NPC hafızası, flag, koşullu event ve gecikmiş sonuç akışları çalıştırıldı.
- Ay sonu finansı, yaş artışı ve temel yıl dosyası eklendi.
- Sürümlü doğrulama, migration, yedek/recovery ve güvenli hata davranışı olan localStorage kaydı eklendi.
- Çekirdek davranış testleri ve üç yıllık deterministik simülasyon eklendi.
- Oyun TarikLab kataloğuna `/oyna/tc-sim` adresiyle bağlandı.

## Yönetim arayüzü düzeni

- Ana ekran; kompakt üst bilgi şeridi, pasif bölüm navigasyonu ve yoğun hayat dashboard'u olarak düzenlendi.

## Aşama 3A — İş + Konut

- Üç prototip iş ve konut; türetilmiş ulaşım/haftalık hayat yükü ve aylık finans zincirine bağlandı.
- Gecikmeli iş başlangıcı, maliyetli atomik taşınma, işten ayrılma ve beş koşullu iş/konut olayı eklendi.
- Save sürümü 2'ye çıkarıldı; eski çekirdek kayıtları para ve geçmiş korunarak migrate ediliyor.
- İŞ ve EV yönetim ekranları ile 3A davranış/regression testleri eklendi.
