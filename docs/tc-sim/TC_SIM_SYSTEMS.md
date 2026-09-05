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

## Uzun dönem beden ve takip

- Üç maruziyet 0–100 arasında kalır. Haftanın tüm seçilmiş aktiviteleri birlikte okunur; geçen haftanın son kararı yeniden uygulanmaz. İş yükü ile toparlanma eksikliği ayrı kaynaklardır; hareketsizlik işin yoğunluğundan çıkarılmaz.
- CHN-H01 çalışma yükünü, CHN-H02 toparlanma eksikliğini, CHN-H03 hareketsizliği izler. Uyarıdan sonraki seçim mevcut açık dosya mekanizmasında dört haftalık yeniden değerlendirme oluşturur. Her zincirin en fazla bir aktif dosyası vardır. Çözülmüş veya vadesini sekiz hafta aşmış sağlık dosyaları temizlenir; diğer sistemlerin dosyaları kesilmez.
- Kalıcı etki uyarı alınmadan ve gecikmeli değerlendirme gerçekleşmeden oluşmaz. Uzun süren yorgunluk için çalışma yükü en az 70 ve toparlanma eksikliği en az 55 olmalıdır. Tek kaynaklı toparlanma güçlüğü ve hareketsizliğin etkisi ayrı, tanı içermeyen durumlardır.
- Bakım bir haftalık aktivite ve ₺300 tüketir; maruziyeti silmez. Yönetilen durum, ilgili yük uyarı aralığının altına indikten sonra dört sakin haftada çözülür. Bakım sonrası iyileşmenin ardından dört hafta yenilenen yüksek yük kronik seyir oluşturabilir; yalnız geçen süre kronikleştirmez. Koşul listesi en fazla sekiz benzersiz kayıt tutar.
- Bilinen aktif/kronik durum ek mesaiyi sınırlar ve uygun haftanın performans kazanımını azaltır. İtibar cezası yoktur. Disiplin eğilimi uyarı ve BEDEN bağlamını değiştirir; otomatik iyileşme sağlamaz.
- CHN-H04 Anne'ye açıklama veya saklama kararıdır. Açıklama mevcut gizli mesele kaydındaki `knownBy` üzerinden yalnız Anne'ye ulaşır; aile geçmişi destek tepkisini etkiler. Üç haftalık geri dönüş aynı bilgiyi ve mevcut beden durumunu okur. Saklama Anne'ye hafıza yazmaz.
- Yalnız oyuncunun planladığı takip takvimde görünür; gizli yeniden değerlendirme görünmez. BEDEN ve yıl dosyası bilinen durumun doğal dilde adını ve sonucunu kullanır. Yıl başı/sonu genel sağlık ve sağlık önceliğinin karşılığı kaydedilir; ham maruziyet, iç kimlik ve bilinmeyen geçmiş kaydedilmez.
- Doğrulama: `node --test scripts/tc-sim-*.test.mjs`; dört stratejinin 52/156/520 haftalık gerçek karar matrisi: `node scripts/tc-sim-longrun.mjs body`.


## Ortak yaşam ve evlilik

- Tek güncel partner `social.currentPartnerNpcId` alanıdır. Partner oynanabilir ikinci karakter değildir. `household.union` yalnız birlikte yaşamaya ve evliliğe başlama haftalarını tutar; evlilik birlikte yaşamadan ayrı, açık bir karardır.
- CHN-S01 taşınma kararını iki hafta, CHN-S02 ev sorumlulukları görüşmesini dört hafta, CHN-S03 evlilik kararını dört hafta, CHN-S04 aileye açıklamayı üç/altı hafta sonra mevcut açık dosya kuyruğuna taşır. Tür başına en fazla bir dosya bulunur; vadesinden sekiz hafta sonra kapanır.
- Görüşmeler bir aktivite kullanır. Dolu haftada erteleme geçerlidir ve ilişki bağlamında sonuç doğurur. Taşınma ve evlilik bedeli karar anında tekrar doğrulanır. Evlilik hazırlığı ₺6.000'dir; tekrar ödül veya gelir üretmez.
- Partner payı kira tutarının yüzde 35'i, en fazla ₺2.500'dür; ortak yaşam gideri ₺900 eklenir. Bu tutarlar yalnız aylık konut giderinden hesaplanır, maaşa eklenmez. İlk ay haftalara göre oranlanır.
- Paylaşımlı evin alan baskısı, gerilim veya para baskısı ortak sorumluluk görüşmesini yeniden gündeme getirebilir; haftalık pasif ilişki cezası yoktur. Ayrı evlere dönmek ilişkiyi veya evliliği kendiliğinden bitirmez.
- Aileye açıklama mevcut gizli mesele kaydının `knownBy` alanını yalnız Anne için günceller; mevcut aile geçmişi tepkisini değiştirir. Ortak kararların geçmişi 24 kayıtla, yıl özeti altı önemli cümleyle sınırlıdır.
- Gerçek kararlarla ilişki → birlikte yaşama → evlilik → 520 hafta senaryosu: `node scripts/tc-sim-longrun.mjs household`. Aynı koşunun tekrarı, aylık tek hesaplama, bütçe/zaman reddi ve kayıt devamlılığı davranış testleriyle doğrulanır.

## Ayrılık ve ortak niyet temeli

- Evlilikte güven 40'ın altına veya gerilim 50'ye ulaştığında ayrılık görüşmesi açılabilir; otomatik ayrılık yoktur. Oyuncu mevcut evde kalır ve partner katkısı kesilir. CHN-S05 altı hafta sonra ayrı bir değerlendirme ister; bekleme seçilebilir.
- Barışma en az altı hafta, güven en az 68, gerilim en fazla 25 ve bağımsız konut gerektirir. Geçmiş silinmez, otomatik ilişki puanı verilmez ve aynı evlilikte ikinci barışma yoktur. Boşanma güncel partner bağlantısını kaldırır; NPC, anılar ve sınırlı ortak geçmiş korunur. Aynı kişiyle romantik başlangıç için 24 haftalık ara vardır.
- Aile planlaması yalnız niyet düzeyindedir: isterim, şimdi değil, istemem veya emin değilim. Partnerin bugünkü yanıtı bütçe ve güven/gerilim bağlamından gelir; kalıcı kişilik hükmü veya çocuk kararı değildir. İki yanıt tek küçük kayıtta tutulur, uyuşmazlık ilişkiye yansır. CHN-S06 dört hafta sonra zaman ayrılan bir görüşme sunar; ertelemek puan kazandırmaz.
- Ayrılık ve niyet bilgisi yalnız oyuncu ve partnerin bildiği mevcut gizli mesele kaydındadır. Aile kendiliğinden öğrenmez. Yeni bir sağlık, çocuk, hukuk, cüzdan veya takvim sistemi yoktur.
- Altı ortak yaşam zincirinin her biri tür başına tek açık dosya taşır. Bağlamı biten dosya kapanır. `node scripts/tc-sim-longrun.mjs separation` gerçek ihmal kararlarıyla evlilik → ayrılık → boşanma ve ardından 520 haftaya devamı doğrular.

## Ebeveynlik temeli

- Mevcut `household.union.familyPlan` korunur. Önceki çocuksuz yaşam tercihi yalnız oyuncunun başlattığı yeni görüşmeyle yeniden ele alınır; partnerin temel ret/kararsızlığı para artışıyla silinmez. Deneme, ortak olumlu niyet, birlikte yaşam, uygun ilişki ve oyuncunun açık gebelik senaryosu seçimi gerektirir. Kimlik alanı üreme kapasitesi sayılmaz; gebeliği oyuncunun veya partnerin taşıdığı yol ayrıca onaylanır. Diğer aile kurma yöntemleri bu kapsamda modellenmez.
- `parenthood` küçük gebelik kaydı, çocuklar ve güncel bakım düzenini tutar. Güncel partnerin tek kaynağı değişmez; gebelik/çocuktaki diğer ebeveyn referansı tarihsel bağdır ve boşanmayla silinmez. Bu ilk kapsamda çocuk oyuncunun hanesinde yaşar; velayet paylaşımı simülasyonu yoktur.
- CHN-P01 niyet görüşmesi ve yeniden değerlendirme, CHN-P02 dört haftalık denemeden sonra haber ve sekiz hafta sonra hazırlık, CHN-P03 haberden 36 hafta sonra doğum, CHN-P04 bakım sıkışması, CHN-P05 bakım bütçesi, CHN-P06 aile desteği, CHN-P07 konut alanı görüşmesidir. Bu süreler deterministik oyun kurallarıdır; tıbbi olasılık hesabı yapılmaz.
- Her zincirin en fazla bir aktif dosyası vardır. Sıradan görüşme vadesinden 12 hafta sonra kapanır; gebelik haberi/doğum geçişi süre aşımıyla kaybolmaz. Çözülmüş ve bağlamı bitmiş dosyalar mevcut kuyruğu bozmadan temizlenir. Gizli gebelik kontrolü takvimde görünmez; bilinen hazırlık ve doğum görünür.
- Çocuk kimliği başlangıç haftasından deterministik türetilir; doğum bir kez gerçekleşir. Yaş mevcut 48 haftalık oyun yılından türetilir: ilk yıl bebeklik, 1–2 küçük çocukluk, 3–5 erken çocukluk. Altı yaştan sonra kayıt ve temel gider sürer; okul/ileri çocukluk içeriği ertelenmiştir.
- Yeni deneme 18–35 yaş kapsamındadır; son doğumdan en az 96 hafta geçmesi ve altı yaş altında üçten az çocuk bulunması gerekir. Gerçek çocuklar kesilerek silinmez. Sıralı doğum mümkündür; eşzamanlı iki gebelik veya mükerrer doğum yoktur.
- Evde bakım haftalık bir aktivite ister. Karşılanmayan bakım enerji/stres üzerinden mevcut toparlanma sistemine yansır; iki birikmiş hafta sonrası bakım karşılanmadan ek mesai seçilemez. Eğitim yükü aynı enerji/zaman bütçesini kullanır; ebeveynlik eğitim ilerlemesini doğrudan cezalandırmaz.
- Düzenli aylık gider bebeklikte ₺1.400, küçük çocuklukta ₺1.200, sonrasında ₺1.000'dir; ilk ay haftalara göre oranlanır. Ücretli bakım altı yaş altında çocuk başına ₺1.500/ay karşılığında zaman alanı açar. Kullanılmış haftalar mevcut aylık finans hesabında borç olarak korunur; düzen değiştirerek silinemez. Partner payı yalnız mevcut konut hesabında uygulanır.
- Anne'ye açıklama mevcut gizli mesele kaydının `knownBy` alanını değiştirir. Destek süresi güven/aile geçmişine bağlıdır; nakit ödül üretilmez. Bakım paylaşımı mevcut ilişki boyutlarını ve önemli kişi anılarını kullanır.
- Yıl dosyası doğumları doğrudan kalıcı çocuk kayıtlarından türetir; kısa ortak geçmiş dönmüş olsa da doğum yılı kaybolmaz. İç kimlikler ve gizli kontrol tarihleri gösterilmez.
- Çocuklar tam karakter değildir: cüzdan, kariyer veya beden motoru yoktur. Haftalık iş çocuk sayısı ve sınırlı açık dosyalar kadardır. Ortak geçmiş 24, kişi anısı 50 ve yıl dosyası 80 sınırını korur; haftalık çocuk günlüğü tutulmaz.
- `node scripts/tc-sim-longrun.mjs parenthood` iki sıralı çocukla 520 haftayı; `no-child` niyet ayrılığıyla çocuksuz 520 haftayı gerçek kararlarla doğrular. Kayıt, doğum, bakım borcu, açıklama ve ayrılık devamlılığı davranış testlerindedir.
