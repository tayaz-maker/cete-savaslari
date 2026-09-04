# TC SIM — Sistem Haritası

## Ortak akış

Her hafta oyuncu sınırlı zaman ve enerjiyle karar verir. Kararlar para, insanlar ve beden üzerinde etkiler üretir; hafıza/flag kayıtları koşullu olayları açar; gecikmiş sonuçlar açık dosyalarda bekler. Ay sonu finans, yıl sonu hayat dosyası işlenir.

## Ana sistemler

| Sistem | Ne tutar? | Neyi etkiler? | Nelerden etkilenir? |
|---|---|---|---|
| Zaman | Hafta, ay, yıl, yaş, takvim ve son tarihler | Tüm ilerleme, finans dönemleri, olay uygunluğu | Oyuncu kararları, planlanmış olaylar |
| Karakter | Kimlik, geçmiş, eğitim, kişilik eğilimleri, zaman/enerji | İş, ilişkiler, beden, event koşulları | Başlangıç geçmişi ve yaşanan önemli olaylar |
| Para | Bakiye, gelir, gider, borç ve düzenli yükümlülükler | Ev, beden, ilişkiler, fırsatlar | İş, konut, kararlar, ay sonu ve ileride enflasyon |
| İş | Durum, rol, ücret, süre, sözleşme ve performans | Para, zaman, enerji, stres, çevre | Karakter, beden, ilişkiler, eventler |
| Ev | Konut, kira, hane, mahremiyet, ulaşım | Para, zaman, aile/partner, yaşam standardı | Finans, iş konumu, ilişki kararları |
| NPC | Kimlik, rol, yaşam durumu ve önemli kişisel kayıtlar | İlişki, aile, iş fırsatları, eventler | Zaman, kendi basit ilerlemesi, oyuncu kararları |
| İlişki/Aile | Bağ türü, güven, yakınlık, gerilim ve sorumluluklar | Eventler, zaman, para, beden, NPC davranışı | Görüşmeler, ihmal, ortak geçmiş, finans ve iş |
| Beden | Enerji, stres, uyku ve genel sağlık | Karar kapasitesi, iş ve ilişkiler | İş yükü, ev, para, alışkanlıklar, olaylar |
| Hafıza | Oyuncunun ve NPC'lerin hatırlaması gereken önemli olaylar | NPC tepkileri, ilişkiler ve gelecekteki eventler | Kararlar ve sonuçlanan olaylar |
| Flag | Kısa, sorgulanabilir geçmiş gerçekleri | Event koşulları ve tek seferlik dallar | Kararlar ve sistem geçişleri |
| Açık dosya | Sonucu bekleyen yükümlülük/risk, vade ve tetik koşulu | Gelecekteki eventler, para, ilişkiler | Kararlar, zaman ve flagler |
| Event | Koşul, öncelik, seçenek, anlık/gecikmiş sonuç | İlgili bütün sistemler | State, takvim, hafıza, flag ve açık dosyalar |
| Yıl dosyası | Yıllık finans, iş, ilişki, beden ve önemli olay özeti | Oyuncunun geçmişi ve uzun vadeli okunabilirlik | Yıl boyunca biriken sistem kayıtları |
| Save | Sürüm ve doğrulanmış oyun state'i | Oyunun güvenli devamı | Bütün kalıcı sistemler |

## Kavramsal game state taslağı

Bu bir şema veya kod sözleşmesi değildir; kodlama öncesi ana sınırları gösterir.

```text
gameState
├─ meta            sürüm, oyun kimliği, oluşturma/güncelleme bilgisi
├─ time            hafta, ay, yıl, yaş ve takvim
├─ world           persistent dönem kimliği; eski kayıtlar Günümüz'e migrate edilir
├─ player          kimlik, geçmiş, eğitim, kişilik, zaman/enerji
├─ finances        bakiye, gelirler, giderler, borçlar
├─ career          iş, sözleşme ve performans
├─ household       ev ve hane durumu
├─ people          önemli NPC kayıtları
├─ relationships   oyuncu–NPC ve gerekli aile bağları
├─ health          beden göstergeleri
├─ memories        önemli, sınırlı yaşam/NPC kayıtları
├─ flags           koşul sorgulamada kullanılan geçmiş gerçekleri
├─ openCases       vadesi veya koşulu bekleyen sonuçlar
├─ events          aktif/planlı olaylar ve tekrar kontrolü
└─ yearlyHistory   tamamlanmış yıl dosyaları
```

## Veri ayrımları

- **Hafıza**, oyuncuya veya NPC davranışına anlam veren önemli olaydır.
- **Flag**, bir koşulun hızlıca “oldu/olmadı/değeri ne?” diye sorduğu kısa gerçektir.
- **Açık dosya**, gelecekte sonuç üretmesi gereken aktif yükümlülüktür; sonuçlanınca kapanır.
- **Yıl dosyası**, ham log değildir; yılın sınırlı ve okunabilir özetidir.

Bu ayrım aynı olayın dört yerde tam kopyasını tutmayı önlemelidir. Kayıtlar kimliklerle birbirine bağlanır.

## Save ilkeleri

- Her kayıtta `saveVersion` bulunur; sürüm değişiklikleri migration ile karşılanır.
- Yüklenen state kullanılmadan önce yapı, tür ve kritik değer aralıkları doğrulanır.
- Bozuk ana kayıt oyunu çökertmez; güvenli hata ekranı ve son sağlam yedeğe dönüş sunulur.
- Yazma tamamlanmadan önce önceki sağlam kayıt recovery kopyası olarak korunur.
- Hafıza, event geçmişi ve yıl kayıtları sınırsız ham dizi olarak büyümez; özetleme/saklama sınırı baştan tanımlanır.
- Kayıt hataları sessizce yutulmaz; kullanıcıya anlaşılır biçimde bildirilir.
- Yerel kayıt ilk prototip için yeterlidir; hesap/bulut kaydı ayrı bir ürün kararıdır.
