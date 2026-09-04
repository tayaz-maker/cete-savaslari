# TC SIM — Değişiklik Kaydı

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

## Aşama 3B — Eğitim + Kariyer Temeli

- `education` (seviye, alanlar, aktif program, aylık eğitim borcu) ve `career.jobFamilyExperience` state'e eklendi.
- İki eğitim yolu (mesleki kurs, üniversite) tam/yarı zamanlı yoğunlukla; tam sayı puan ilerlemesiyle çalışıyor.
- Diploma ödülü haftalık tick içinde deterministik veriliyor; event yalnız bildirim olduğu için ertelense de kaybolmuyor.
- Eğitim kaydı/bırakması haftalık karar hakkı tüketmiyor; haftalık enerji/stres yükü mevcut hayat yükü hesabına giriyor.
- Kayıt ücreti peşin, aylık eğitim ücreti ay sonunda tam bir kez; eğitimi bırakmak o ayın borcunu silmiyor.
- İş ailesi (`hizmet`, `ofis`), haftalık deneyim birikimi ve türetilen kariyer bandı eklendi.
- Eğitim/alan/deneyim gereksinimi olan iki yeni iş eklendi; mevcut üç giriş işi gereksinimsiz kaldığı için eski kayıtlar kilitlenmiyor.
- Tek merkezî uygunluk kontrolü teklif kabulünde, event koşullarında ve arayüzde ortak kullanılıyor.
- Save sürümü 4'e çıkarıldı; v3 kayıtlar iş, para, konut, NPC, hafıza, açık dosya ve dönem korunarak taşınıyor, bozuk alanlar kaydı çöpe atmadan onarılıyor.
- EĞİTİM ekranı ile İŞ ekranına deneyim/bant/gereksinim gösterimi eklendi; 34 yeni test ve üç deterministik 144 haftalık senaryo eklendi.
