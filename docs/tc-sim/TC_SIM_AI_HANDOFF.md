# TC SIM — AI Devir Notu

## Oyun

Türkiye'de geçen, tek bir insanın hayatını haftalık kararlarla yöneten yaşam simülasyonu. The Sims'ten hayat kurma fikrini; Football Manager'dan ayrıntılı menü, kişi profili, takvim, finans, geçmiş ve uzun vadeli sonuç yaklaşımını alır. Spor veya ülke yönetimi oyunu değildir.

## Mevcut aşama

**Aşama 3A — İş + Konut dikey dilimi tamamlandı.** Oyun katalogdan açılıyor; içerik kapsamı hâlâ bilinçli olarak küçük.

Ana aktif geliştirme projesi **TC SIM — Günümüz** sürümüdür. TC SIM: DEVLET, TarikLab içinde ayrı bir gelecek oyunudur; TC SIM bugün onun için generic engine'e dönüştürülmez.

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
- `public/games/tc-sim/` altında modüler Vanilla JS çekirdeği kuruldu.
- Haftada iki farklı aktivite, 4 haftalık ay, 12 aylık yıl, koşullu event, NPC hafızası ve gecikmiş borç sonucu çalışıyor.
- Site kataloğuna `/oyna/tc-sim` olarak eklendi; çekirdek testleri ve üç yıllık simülasyon hazırlandı.
- Üç iş ve üç konut; ev × iş ulaşımı, haftalık beden yükü ve aylık finansla bağlandı.
- İş teklifleri bir haftalık açık dosyayla başlıyor; taşınma doğrulanan tek seferlik maliyet kullanıyor.
- Save migration eski para, beden, NPC, hafıza ve açık dosya kayıtlarını koruyor.
- Dönem persistent state'in parçasıdır; şu an yalnız `present_day` / Günümüz oynanabilir, eski kayıtlar buna migrate edilir.

## Sıradaki tek iş

**Aşama 3B — Eğitim + Kariyer temeli.** Tasarım ve uygulama planı tamamlandı; runtime kodu henüz yazılmadı.

Uygulamaya başlamadan önce `TC_SIM_3B_IMPLEMENTATION.md` belgesindeki "COWORK FAST START" bloğunu oku; testler için `TC_SIM_3B_TEST_PLAN.md`. Özet kilitli kararlar:

- `education` state'i (`level` / `fields` / `active` / `tuitionOwedThisMonth`) ve `career.jobFamilyExperience` eklenir; deneyim birimi **hafta**, kariyer bandı saklanmaz, türetilir.
- İki eğitim yolu (mesleki kurs, üniversite), iki alan (`technical`, `business`), integer puan ilerlemesi (full +3, part +2/hafta).
- Eğitim başlat/bırak **karar hakkı tüketmez**; haftada iki karar invariantı korunur.
- Haftalık deneyim ve eğitim ilerlemesi mevcut `applyWeeklyLifeLoad()` guard'ının içine yazılır; böylece save/load sonrası tekrar işlenmez.
- Eğitim/deneyimin gerçek karşılığı olması için iki yeni iş eklenir (`technician`, `specialist`); **mevcut üç iş gereksinimsiz kalır** ki eski kayıtlar kilitlenmesin.
- `SAVE_VERSION` 3→4 çıkar; mevcut v3 kayıtlar için `migrateV3()` dalı **zorunludur**, yoksa tüm kayıtlar bozuk sayılır.

Aile ve kişiler tarafının derinleştirilmesi 3B sonrasına bırakıldı.

## Korunacak teknik ilkeler

- Motor önce, içerik sonra.
- State tek doğruluk kaynağı olmalı; sistemler kontrollü işlemlerle state'i değiştirmeli.
- Hafıza, flag, açık dosya ve ham event geçmişi birbirine karıştırılmamalı.
- Eventler mevcut durum ve geçmişten doğmalı; sonuçların nedeni oyuncuya açıklanabilmeli.
- Save yüklenmeden önce doğrulanmalı; hata sessizce yutulmamalı.
- Ürün yönünü değiştiren kararlar dışında kullanıcı küçük teknik tercihlerle durdurulmamalı.
