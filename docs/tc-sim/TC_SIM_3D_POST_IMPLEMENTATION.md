# TC SIM — 3D Uygulama Sonrası

## Uygulananlar

- 24 seçilmiş bağımsız sosyal event (arkadaşlık 4, romantik/Elif 4, aile 4, para 4, görünürlük 4, yetişkin hayat 4) mevcut 3C motoruna eklendi.
- 5 gecikmeli üç adımlı zincir: CHN-01 (kişisel borç → görünürlük → yüzleşme), CHN-03 (referans sözü → sonuç → uzun vadeli karşılık, sade), CHN-08 (yetişkin ilişki → ertesi gün → sonlu korku çözümü), CHN-09 (düğün altını → ay sonu → karşılık), CHN-10 (aile evinde saklanan gece → sır sorgusu → Mehmet'e sızma).
- Dört motor eklentisi: `scheduleSocialFollowup`, `personal-debt` openCase türü (`getPersonalDebt`/`createPersonalDebt`/`resolvePersonalDebt`), `hasNpcMemory(state, personId, type)`, ve mevcut `flags` üzerinden görünürlük/yetişkin bağlamı (`elifSleptOverSecret`, `sleptWithElif`, `familyKnowsElif`, `promisedMehmetRef`, `pregnancyFear` vb.).
- Yoğunluk siperi: `state.flags.lastSocial3DWeek` ve yeni `state.flags.lastEventResolvedWeek` ile organik aramada haftada en fazla bir yeni 3D olay aktifleşir; zincir halkaları due-case yoluyla geldiği için siperden muaftır (tasarım gereği).
- Dashboard "AÇIK MESELELER" panelindeki sabit etiket eşlemesi `personal-debt` ve `social-followup` türlerini de tanıyacak şekilde genişletildi (`public/games/tc-sim/js/app.js`).

## Tasarım kararlarından uyarlamalar

Uygulama sırasında üç noktada tasarım dokümanının doğrudan uygulanması, mevcut 111 testi veya motor mimarisini kıracağı için küçük, gerekçeli sapmalar yapıldı:

1. **Erken hafta tabanı eklendi.** `mehmet_elif_gossip`, `mehmet_needs_money`, `mom_needs_money`, `payday_iban_help` ve `promise_mehmet_reference` dokümanda hafta koşulu taşımıyordu; varsayılan NPC değerleriyle (Mehmet yakınlığı 52, güveni 54 — "arkadaş" eşiğinin üzerinde, iş `market` varsayılan atanmış) oyunun ilk haftasından itibaren tetiklenebiliyorlardı. Bu, "içerik motor eksikliğini gizlemek için büyütülmez" ve "sabit 111 testin kırılmaması" ilkeleriyle çelişiyordu. Beşine de `state.time.absoluteWeek >= 4` tabanı eklendi. `night_call_mehmet`'in dokümandaki hafta≥3 koşulu, kısa pencereli (4 haftalık) mevcut testlerle çakıştığı için hafta≥5'e çekildi.
2. **Aynı hafta çoklu aktivasyon kilidi genişletildi.** Mevcut motor, `resolveEvent` sonunda aynı hafta içinde otomatik olarak bir sonraki uygun olayı aktive ediyor (3D öncesi de var olan davranış). 33 yeni, önceye göre çok daha sık uygun olan event eklenince, bu otomatik zincirleme aynı hafta içinde ikinci (hatta üçüncü) bir olayın aktifleşmesine yol açtı ve "haftada tek karar" varsayımına dayanan mevcut testleri kırdı. Çözüm: `state.flags.lastEventResolvedWeek` her event çözümünde güncellenir; bir 3D olay, o hafta *herhangi bir* olay zaten çözülmüşse (3D olsun olmasın) organik olarak aktifleşemez. Bu, dokümandaki "haftada ≤1 yeni 3D sosyal" ilkesini daha sıkı ve güvenli şekilde uygular.
3. **`personal-debt` due-case üzerinden değil, organik event + doğrudan hook üzerinden çözülür.** `processDueOpenCases`, tetiklediği event'i resolve anında otomatik `resolved` işaretliyor; bu, borcu erken/yanlış kapatırdı. Bunun yerine `personal-debt` case'i `eventId: null` ile saf bir durum işaretçisi olarak tutulur (`getPersonalDebt` ile sorgulanır), `mehmet_debt_story` (SOC-01) organik koşullu bir event olarak tetiklenir ve `resolveEvent` içindeki özel bir hook `resolvePersonalDebt`'i açıkça çağırır. "Ignore" seçimi borcu `pending` bırakır (cooldown sonrası tekrar sorulabilir); "collect"/"forgive" borcu kalıcı olarak kapatır.

Bunların dışında 24+5 içerik, dokümanın seçtiği metin/koşul/etkilere sadık kalınarak uygulanmıştır; teknik kırpma (`+2-6h` gibi aralıklar tek bir somut hafta sayısına indirgendi) dışında içerik değiştirilmemiştir.

## State ve Migration

- **`SAVE_VERSION` hâlâ 5.** `migrateV4()`'e dokunulmadı, `migrateV5()` yazılmadı.
- Yeni state yalnız: `flags` üzerinde birkaç yeni string/boolean anahtar (`lastSocial3DWeek`, `lastEventResolvedWeek`, `promisedMehmetRef`, `elifSleptOverSecret`, `sleptWithElif`, `pregnancyFear`, `familyKnowsElif`, `hidingRelationshipFromFamily`, vb.) ve `openCases` dizisinde iki yeni `type` değeri (`personal-debt`, `social-followup`). `validateState` zaten `type` için bir allowlist kullanmıyor; yeni case türleri mevcut şemaya (`id`/`dueWeek`/`status`/`payload`) sorunsuz oturur.
- Yeni NPC, rol, tag veya kişilik state'i eklenmedi; `normalizeSocialState` dokunulmadan bırakıldı. Elif hâlâ tek `romance_available` NPC, Aylin/Murat hâlâ `family` rolünde.
- Eski v1–v5 kayıtları değişmeden yükleniyor; yeni alanlar yoklukta güvenle varsayılana düşüyor (`flags` zaten boş obje varsayılanlı, `openCases` zaten boş dizi varsayılanlı).

## Testler

- Önceki 111 test korunmuştur (bkz. Regresyon ve kök neden bölümü).
- `scripts/tc-sim-3d.test.mjs`: 24 yeni test — dört motor eklentisinin izole testleri (3D.1–3D.16), TAGS kilidi kontrolü ve beş bütünleşik senaryo (A: borç→görünürlük→çözüm, B: referans sözü→gecikme→sonuç, C: yetişkin ilişki→gecikmeli korku→sonlu çözüm, D: sır→sızma→sosyal sonuç, E: düğün karşılığı→uzun vadeli geri dönüş, artı bahane dalının zinciri hiç başlatmadığını doğrulayan ek test).
- Toplam: **135/135 test yeşil** (`node --test 'scripts/tc-sim-*.test.mjs'`).
- 144 haftalık (seed 3) ve 520 haftalık (seed 1, 2, 5, 9) deterministik koşular sorunsuz tamamlandı; `scripts/tc-sim-longrun.mjs` 20 seed × 260 hafta fuzz koşusu ihlalsiz geçti.
- `scripts/tc-sim-longrun.mjs`'e 3D'ye özel invariant kontrolleri eklendi: `openCases` toplamı sınırlı kalıyor, tekrarlayan `openCase` id'si yok, `personal-debt` tutarı her zaman pozitif/sonlu, aynı anda birden fazla bekleyen kişisel borç yok.
- Gerçek tarayıcı (Chromium, Playwright) ile masaüstü (1440×900) ve mobil (390×844) manuel smoke testi yapıldı: yeni oyun başlatma, kaydın sayfa yenilemesinden sonra "Devam et" ile doğru yüklenmesi, KİŞİLER ve AİLE/İLİŞKİLER ekranları, ~60 haftalık organik oynanışta CHN-09 zincirinin ("Mehmet geçen düğündeki iyiliğinin karşılığını verdi.") uçtan uca gerçek arayüzde tetiklenip çözülmesi doğrulandı. Yatay taşma, konsol hatası (favicon 404 dışında) veya ham id sızıntısı görülmedi.

## Kök neden — 111 testin geçici kırılması ve düzeltmesi

33 yeni event eklendikten hemen sonra 8 mevcut test kırıldı. Kök neden iki katmanlıydı: (1) birkaç yeni event'in dokümanda hafta tabanı verilmemiş, varsayılan NPC/finans/iş değerleriyle oyunun ilk haftalarından itibaren doğru olan koşulları vardı; (2) mevcut motor, bir event çözüldüğünde aynı hafta içinde otomatik olarak bir sonrakini aktive ediyor — bu, önceki (seyrek koşullu) içerikle sorun çıkarmıyordu ama 33 yeni, çok daha sık uygun event ile aynı hafta içinde ikinci bir olayın sinsice aktifleşmesine yol açtı ve testlerin "haftada tek olay" varsayımını kırdı. İki fix (hafta tabanları + `lastEventResolvedWeek` siperi, yukarıda detaylandırıldı) sonrası 111/111 tekrar yeşil.

## Bilinen Sınırlar

- NPC sayısı hâlâ dört; bağımsız NPC hayatı/gossip grafiği yoktur. Görünürlük yalnız event koşulu + flag + hafıza + openCase ile taklit edilir.
- Yetişkin içerik yalnız Elif bağlamında, grafik olmayan sonuç simülasyonudur; hamilelik korkusu sonlu bir openCase olarak kapanır, çocuk/aile büyümesi state'i asla üretilmez.
- CHN-03 basitleştirilmiş haliyle uygulanmıştır: işe alım/işveren simülasyonu yoktur, yalnız söz→sonuç→uzun vadeli karşılık üçlüsü mevcut iş state'ini okur.
- Sosyal içerik yoğunluğu haftada ≤1 yeni standalone ile sınırlıdır; denge değerleri (para/ilişki delta'ları) prototip düzeyindedir ve manuel playtest ile ayarlanabilir.
- Bulut ortamında tarayıcı penceresi yeniden boyutlandırılamadığı için masaüstü/mobil görünümler ayrı `viewport` ile aynı oturumda simüle edildi; gerçek cihaz testi yapılmadı.

## Sonraki Aşama Önerisi

3D içerik motora oturduğuna ve testler yeşil olduğuna göre, önerilen sıradaki adım **manuel 3D playtest**tir (denge, metin tonu ve zincir zamanlamasının insan geri bildirimiyle doğrulanması). 3E (evlilik, çocuk, otonom NPC yaşamı, tam dedikodu grafiği, save v6) bu playtest tamamlanmadan başlatılmamalıdır.
