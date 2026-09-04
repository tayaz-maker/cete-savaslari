# TC SIM — AI Devir Notu

## Oyun

Türkiye'de geçen, tek bir insanın hayatını haftalık kararlarla yöneten yaşam simülasyonu. The Sims'ten hayat kurma fikrini; Football Manager'dan ayrıntılı menü, kişi profili, takvim, finans, geçmiş ve uzun vadeli sonuç yaklaşımını alır. Spor veya ülke yönetimi oyunu değildir.

## Mevcut aşama

**Aşama 3C — Sosyal Çevre + İlişkiler temeli tamamlandı.** Oyun katalogdan açılıyor; içerik kapsamı hâlâ bilinçli olarak küçük.

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

**Aşama 3B — Eğitim + Kariyer temeli tamamlandı ve uygulandı.** Devir notu: `TC_SIM_3B_POST_IMPLEMENTATION.md` (önce bunu oku), plan `TC_SIM_3B_IMPLEMENTATION.md`, testler `TC_SIM_3B_TEST_PLAN.md`.

3B ile gelen ve korunması gereken runtime durumu:

- `education` (`level` / `fields` / `active` / `tuitionOwedThisMonth`) ve `career.jobFamilyExperience` state'in parçasıdır; deneyim birimi **hafta**, kariyer bandı saklanmaz, türetilir.
- İki eğitim yolu (mesleki kurs, üniversite), iki alan (`technical`, `business`), tam sayı puan ilerlemesi (tam +3, yarı +2/hafta). Float kullanılmaz.
- Eğitim kaydı/bırakması **karar hakkı tüketmez**; haftada iki karar invariantı korunur.
- Haftalık deneyim ve eğitim ilerlemesi `applyWeeklyLifeLoad()` guard'ının içindedir; save/load sonrası tekrar işlenmez.
- Diploma ödülü haftalık tick'te verilir, event yalnız bildirimdir; tamamlanma tam bir kezdir.
- Aylık eğitim ücreti ay sonunda tam bir kez alınır; eğitimi bırakmak o ayın borcunu silmez.
- İş uygunluğu tek merkezî `isEligibleForJob()` üzerindendir; teklif kabulü, event koşulları ve arayüz aynı fonksiyonu kullanır.
- `technician` ve `specialist` işleri eğitim/alan/deneyim ister; **mevcut üç giriş işi gereksinimsizdir** ve eski kayıtlar kilitlenmez.
- `SAVE_VERSION = 4`. v3 kayıtlar `migrateV3()` ile taşınır ve her migration dalından sonra `normalizeEducationCareer()` çalışır. Bu zincir bozulursa tüm oyuncu kayıtları geçersiz sayılır.

3C ile gelen ve korunması gereken runtime durumu:

- Eski `state.relationships` puanı yakınlık olarak korunur; güven, gerilim, son anlamlı temas ve romantik durum mevcut NPC kayıtlarındadır.
- İlişki evresi merkezî helper ile türetilir; romantik ilgi ve sevgililik açık karar gerektirir. Aile romantik olamaz, aynı anda en fazla bir partner vardır.
- Altı bağlamsal sosyal eylem haftalık iki karar ekonomisine bağlıdır; para/beden etkileri atomiktir.
- Sosyal bakım haftada en fazla bir kez çalışır. NPC hafızaları 50 kayıtla sınırlıdır.
- Yardım sözü mevcut openCase/event hattını kullanır; başarı veya deadline başarısızlığı yalnız bir kez sonuçlanır.
- `SAVE_VERSION = 5`; `migrateV4()` Aylin/Mehmet, eski yakınlık, hafıza ve diğer bütün 3B state'ini korur.
- KİŞİLER bireysel dosya/eylem ekranıdır; AİLE/İLİŞKİLER özet ve açık sosyal mesele görünümüdür.

**Sıradaki iş:** 3D kapsamını kullanıcı playtest geri bildirimlerinden kilitle; otomatik yeni sistem başlatma.

## Korunacak teknik ilkeler

- Motor önce, içerik sonra.
- State tek doğruluk kaynağı olmalı; sistemler kontrollü işlemlerle state'i değiştirmeli.
- Hafıza, flag, açık dosya ve ham event geçmişi birbirine karıştırılmamalı.
- Eventler mevcut durum ve geçmişten doğmalı; sonuçların nedeni oyuncuya açıklanabilmeli.
- Save yüklenmeden önce doğrulanmalı; hata sessizce yutulmamalı.
- Ürün yönünü değiştiren kararlar dışında kullanıcı küçük teknik tercihlerle durdurulmamalı.
