# TC SIM — AI Devir Notu

## Oyun

Türkiye'de geçen, tek bir insanın hayatını haftalık kararlarla yöneten yaşam simülasyonu. The Sims'ten hayat kurma fikrini; Football Manager'dan ayrıntılı menü, kişi profili, takvim, finans, geçmiş ve uzun vadeli sonuç yaklaşımını alır. Spor veya ülke yönetimi oyunu değildir.

## Mevcut aşama

**Aşama 3D — Sosyal içerik + hafıza + gecikmeli sonuçlar tamamlandı.** Oyun katalogdan açılıyor; içerik kapsamı hâlâ bilinçli olarak küçük.

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

- 3A/3B/3C/3D runtime main'de (bu dalda: `cowork/tc-sim-3d`).
- 3D: 24 bağımsız sosyal event + 5 gecikmeli üç adımlı zincir (CHN-01/03/08/09/10), `scheduleSocialFollowup`/`personal-debt`/`hasNpcMemory` motor eklentileri. Save hâlâ v5. Ayrıntı: `TC_SIM_3D_POST_IMPLEMENTATION.md`.

## Sıradaki tek iş

**Manuel 3D playtest.** 3E (evlilik, çocuk, otonom NPC, tam gossip grafiği, save v6) bu playtest tamamlanmadan başlatılmaz.

3D ile gelen ve korunması gereken runtime durumu:

- Eski `state.relationships` puanı yakınlık olarak korunur; güven, gerilim, son anlamlı temas ve romantik durum mevcut NPC kayıtlarındadır.
- İlişki evresi merkezî helper ile türetilir; romantik ilgi ve sevgililik açık karar gerektirir. Aile romantik olamaz, aynı anda en fazla bir partner vardır.
- Altı bağlamsal sosyal eylem haftalık iki karar ekonomisine bağlıdır; para/beden etkileri atomiktir.
- Sosyal bakım haftada en fazla bir kez çalışır. NPC hafızaları 50 kayıtla sınırlıdır.
- Yardım sözü mevcut openCase/event hattını kullanır; başarı veya deadline başarısızlığı yalnız bir kez sonuçlanır.
- `SAVE_VERSION = 5`; `migrateV4()` Aylin/Mehmet, eski yakınlık, hafıza ve diğer bütün 3B state'ini korur.
- KİŞİLER bireysel dosya/eylem ekranıdır; AİLE/İLİŞKİLER özet ve açık sosyal mesele görünümüdür.
- `normalizeSocialState` role/tag kilidini korur; 3D kişilik motoru eklemedi, beşinci NPC/rol yok.
- `personal-debt` (openCase, kişiye özel) ve `social-followup` (openCase, `scheduleSocialFollowup` ile) mevcut `openCases` şemasına ek tür olarak oturur; eski sabit 1500 TL `friend-loan`/`loan_repayment` davranışı değişmedi.
- `hasNpcMemory(state, personId, type)` merkezî sorgu helper'ı event uygunluğu ve gecikmeli geri çağrılarda kullanılır.
- Organik aramada haftada en fazla bir yeni 3D olay aktifleşir (`flags.lastSocial3DWeek` + `flags.lastEventResolvedWeek`); zincir halkaları due-case ile geldiği için siperden muaftır.

3B özeti: `TC_SIM_3B_POST_IMPLEMENTATION.md`. 3D özeti: `TC_SIM_3D_POST_IMPLEMENTATION.md`. Eğitim/kariyer invariantları durur.

## Korunacak teknik ilkeler

- Motor önce, içerik sonra — 3D içerik mevcut motora oturur, motora oturmayan sistem yazılmadı.
- State tek doğruluk kaynağı.
- Hafıza, flag, açık dosya ve ham event geçmişi karışmaz.
- Eventler durum ve geçmişten doğar.
- Save yüklenmeden doğrulanır; v6 yok.
- Evlilik, çocuk, otonom NPC, sosyal grafik 3D'de de eklenmedi; 3E'ye kadar dışarıda.
