# TC Simülasyonu — Ana Tasarım

## Tanım ve hedef

**TC Simülasyonu, tek bir insanın Türkiye'deki hayatını; haftalık kararlar, ayrıntılı kayıtlar ve uzun vadeli sonuçlarla yönettiğimiz bir yaşam simülasyonudur.**

Hedef, TarikLab içinde düzgün çalışan, mantıklı, tekrar oynanabilir ve yeterince ayrıntılı bir oyun üretmektir. İlk prototipin cevaplayacağı soru: **“Bu sistemle hayat simülasyonu gerçekten eğlenceli mi?”**

## Temel ilkeler

- Oyuncu Türkiye'yi değil, tek bir insanı yönetir; Türkiye ekonomik, sosyal ve kültürel bağlamdır.
- Çekirdek formül: **Zaman + Para + İnsanlar + Beden + Geçmiş + Sonuçlar**.
- Her önemli sistem en az bir başka sistemi etkilemelidir.
- Olaylar mümkün olduğunca mevcut durumdan ve geçmiş kararlardan doğar; salt rastgelelik ana motor değildir.
- Oyuncu merkezli yaşayan dünya kullanılır; yalnız önemli NPC'ler basitleştirilmiş biçimde ilerler.
- Önce küçük ve test edilebilir motor, sonra içerik yapılır.
- Basit web teknolojileri ve TarikLab'ın mevcut yapısı korunur.

## Kilitlenmiş kararlar

- Başlangıç yaşı: **18**. 0–17 yaş oynanmaz; geçmiş, başlangıç koşullarını belirler.
- İlk şehir: **İstanbul**. İlk sürümde başka şehir simüle edilmez.
- Ana zaman birimi: **1 hafta**. Ay sonunda düzenli finans, yıl sonunda hayat dosyası işlenir.
- İlk prototip: 18 yaşta başlar ve yaklaşık birkaç oyun yılını kapsar. Sonraki hedef 18–35'tir.
- Dünya: yaklaşık beş önemli NPC'den oluşan oyuncu merkezli model.
- Teknik yön: bağımsız HTML/CSS/JavaScript web oyunu; siteye mevcut katalog ve iframe route'u üzerinden bağlanır.
- Tasarım belgeleri `docs/tc-sim/`, ilerideki oyun dosyaları `public/games/tc-sim/` altında tutulur.

## İlk prototip kapsamı

- 1 oyuncu, 1 aile, yaklaşık 5 önemli NPC ve 1 partner ihtimali
- 3 iş ve 3 konut seçeneği
- Haftalık zaman, para, temel beden ve ilişki yönetimi
- Temel NPC hafızası, yaklaşık 20–30 koşullu olay ve 5 gecikmiş sonuç
- Yıl sonu hayat dosyası
- Sürüm kontrollü, doğrulanan ve kurtarma yaklaşımı olan yerel kayıt tasarımı

Sayılar kesin kota değil, kapsam sınırıdır.

## Şimdilik yapılmayacaklar

- 0–17 yaş, tam 18–80 hayat, ölüm, çocuk ve kuşak sistemi
- İstanbul dışı şehirler veya bütün Türkiye simülasyonu
- 3D/açık dünya, karakter yürütme, Sims tarzı ev ekranı ve animasyon sistemi
- Yüzlerce NPC/event/meslek, canlı ekonomik API veya sürekli çalışan AI NPC'ler
- Gelişmiş yetişkin ilişkileri, sır, sosyal medya, yatırım ve kapsamlı mülk sistemi
- Erken dengeleme ve UI polish

## Geliştirme modeli

1. **Tasarım Kilidi** — kararları ve sistem sınırlarını sabitle.
2. **Çalışan Çekirdek** — state, zaman, karar, sonuç ve güvenli kaydı çalıştır.
3. **Hayatı Detaylandırma** — iş, ev, insanlar, aile, ilişki ve bedeni bağla.
4. **Uzun Hayat** — 18–35 ve sonrasında yaşlanma/kuşak yönünü genişlet.
5. **Denge + İçerik** — motoru test et, sonra içerik çoğalt.
6. **Son Temizlik** — kullanılabilirlik, erişilebilirlik, performans ve yayın kalitesi.

