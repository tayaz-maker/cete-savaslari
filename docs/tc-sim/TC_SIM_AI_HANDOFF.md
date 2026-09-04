# TC SIM — AI Devir Notu

## Oyun

Türkiye'de geçen, tek bir insanın hayatını haftalık kararlarla yöneten yaşam simülasyonu. The Sims'ten hayat kurma fikrini; Football Manager'dan ayrıntılı menü, kişi profili, takvim, finans, geçmiş ve uzun vadeli sonuç yaklaşımını alır. Spor veya ülke yönetimi oyunu değildir.

## Mevcut aşama

**Aşama 3C — Sosyal Çevre + İlişkiler temeli tamamlandı.** Oyun katalogdan açılıyor; içerik kapsamı hâlâ bilinçli olarak küçük.

**Aşama 3D — içerik paketi belgelendi, runtime uygulanmadı.** Cowork: `TC_SIM_3D_COWORK_START.md`.

Ana aktif geliştirme projesi **TC SIM — Günümüz** sürümüdür. TC SIM: DEVLET, TarikLab içinde ayrı bir gelecek oyunudur; TC SIM bugün onun için generic engine'e dönüştürülmez.

## Kilitli kararlar

- 18 yaş başlangıç; çocukluk yalnız başlangıç geçmişidir.
- İlk oynanabilir şehir İstanbul; dünya oyuncu merkezlidir.
- Ana tur 1 haftadır; ay sonu finans, yıl sonu hayat dosyası vardır.
- İlk prototip yalnız birkaç oyun yılıdır: 1 oyuncu, 1 aile, ~5 NPC, 3 iş, 3 ev, 1 partner ihtimali, 20–30 event ve ~5 gecikmiş sonuç.
- Çekirdek: Zaman + Para + İnsanlar + Beden + Geçmiş + Sonuçlar.
- Basit HTML/CSS/JavaScript; aşırı tek dosya veya aşırı parçalı mimari yok.
- Belgeler `docs/tc-sim/`; oyun `public/games/tc-sim/` altında, katalog/iframe route.

## Son yapılanlar

- 3A/3B/3C runtime main'de.
- 3D için araştırma + motora map + 24+5 dilim + test planı yazıldı. Save hâlâ v5.

## Sıradaki tek iş

**3D runtime uygulaması (ayrı iş).** Bu belge dalında kod yok.

Başla: `docs/tc-sim/TC_SIM_3D_COWORK_START.md`.
Sözleşme: `TC_SIM_3D_IMPLEMENTATION.md`.
Test: `TC_SIM_3D_TEST_PLAN.md`.

3C ile gelen ve korunması gereken runtime durumu:

- Eski `state.relationships` puanı yakınlık olarak korunur; güven, gerilim, son anlamlı temas ve romantik durum mevcut NPC kayıtlarındadır.
- İlişki evresi merkezî helper ile türetilir; romantik ilgi ve sevgililik açık karar gerektirir. Aile romantik olamaz, aynı anda en fazla bir partner vardır.
- Altı bağlamsal sosyal eylem haftalık iki karar ekonomisine bağlıdır; para/beden etkileri atomiktir.
- Sosyal bakım haftada en fazla bir kez çalışır. NPC hafızaları 50 kayıtla sınırlıdır.
- Yardım sözü mevcut openCase/event hattını kullanır; başarı veya deadline başarısızlığı yalnız bir kez sonuçlanır.
- `SAVE_VERSION = 5`; `migrateV4()` Aylin/Mehmet, eski yakınlık, hafıza ve diğer bütün 3B state'ini korur.
- KİŞİLER bireysel dosya/eylem ekranıdır; AİLE/İLİŞKİLER özet ve açık sosyal mesele görünümüdür.
- `normalizeSocialState` role/tag kilidini korur; 3D kişilik motoru eklemez.

3B özeti: `TC_SIM_3B_POST_IMPLEMENTATION.md`. Eğitim/kariyer invariantları durur.

## Korunacak teknik ilkeler

- Motor önce, içerik sonra — 3D içerik mevcut motora oturur, motora oturmayan sistem yazılmaz.
- State tek doğruluk kaynağı.
- Hafıza, flag, açık dosya ve ham event geçmişi karışmaz.
- Eventler durum ve geçmişten doğar.
- Save yüklenmeden doğrulanır; v6 yok.
- Evlilik, çocuk, otonom NPC, sosyal grafik 3D dışı.
