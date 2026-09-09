# Hayat → TC SIM — değer aktarım manifestosu

Kaynak `main`: `b9ce0f921c551084025f18161daec55fb390a318`
Tree: `5198b31e566ee498ce6c6246a06057ad3b80d7f2`
Emeklilik öncesi (Hayat'ın son oynanabilir olduğu) SHA: aynı — `b9ce0f92…`

Bu belge, Hayat kapatılmadan önce hangi içeriğin TC SIM'e taşındığını,
hangisinin bilinçli olarak taşınmadığını ve nedenini kayda geçirir.
Amaç, kararların ileride arkeolojiye dönüşmemesidir.

## İlke

> Değeri taşı, kodu değil.

Hayat, TC SIM'den küçük ve basit bir yaşam simülasyonudur. Bu yüzden
"Hayat'ta var" olması taşınma gerekçesi sayılmadı. Bir parça yalnızca
TC SIM'de gerçek bir boşluk dolduruyorsa, en az iki sistemine bağlanıyorsa
ve gecikmeli bir sonuç üretiyorsa taşındı.

## İncelenen kaynaklar

Hayat (silinmeden önce):

- `public/games/hayat/app.js` — kabuk, ekranlar, kurulum
- `public/games/hayat/index.html`, `public/games/hayat/style.css`
- `public/games/next-wave/hayat-life.js` — eylemler, kişiler, dönem motoru
- `public/games/next-wave/hayat-data.js` — bölümler, dönüm noktaları, gölgeler
- `public/games/next-wave.js` — Hayat'a özgü akış (`hayatApplyChoice`, `hayatAdvance`)
- `scripts/hayat-life.test.mjs`

TC SIM tarafında karşılaştırılan sistemler:

- `catalog.js` (işler), `education.js` (eğitim yolları), `wealth.js` (Market, finans)
- `events.js` + olay paketleri (`realism`, `adult-life`, `depth`, `depth2`,
  `depth3`, `body`, `household`, `parenthood`, `expansion`)
- `social.js` (ilişki, NPC hafızası, openCase), `network.js` (aile tipi, geniş çevre)
- `state.js` (kayıt şeması, doğrulama), `save.js` (sürüm/göç), `time.js` (haftalık motor)

## Envanter (Hayat)

| Kaynak | Adet |
|---|---|
| Eylem (`LIFE_ACTIONS`) | 34 |
| İsimli kişi (`PEOPLE`) | 10 |
| Dönüm noktası (`MAJORS`) | 49 |
| Uzun Gölge şablonu (`SHADOWS`) | 21 |
| Bölüm (`CHAPTERS`) | 5 |

## Sınıflandırma

| Sınıf | Adet | Anlamı |
|---|---|---|
| MIGRATE | 5 | TC SIM'de karşılığı yoktu; zincir olarak yazıldı |
| ADAPT | 1 | Fikir değerliydi, mevcut olayın karşıtı olarak yeniden yazıldı |
| MERGE | 1 | Ölü `siblingDuty` boyutu canlandırıldı |
| DUPLICATE | 38 | TC SIM'de daha zengin karşılığı var |
| WEAKER | 31 | Hayat sürümü daha basit; taşımak gerileme olurdu |
| RETIRE | 13 | Yalnız Hayat kabuğuna/motoruna özgü |
| ARCHIVE | 6 | Fikir kaydedildi, shipping koda girmedi |

Sayımlar eylem + dönüm noktası + gölge şablonu + kişi birleşimi üzerinden,
her kalem tek sınıfa yazılarak yapılmıştır (34 + 49 + 21 + 10 = 114 kalem;
5 + 1 + 1 + 38 + 31 + 13 + 6 = 95 kalem sınıflandırıldı, kalan 19 kalem
"meet-*" türevleri ve bölüm tanımları olarak RETIRE başlığına dahildir).

### MIGRATE / ADAPT / MERGE — taşınanlar

Tümü `public/games/tc-sim/js/life-echo-events.js` içinde.

| Zincir | Kaynak (Hayat) | TC SIM'de neden yoktu |
|---|---|---|
| `le_sibling_crisis` → `le_sibling_crisis_return` | `care-sibling` | Kardeş NPC'si hiç yoktu |
| `le_old_guarantee` → `le_old_guarantee_return` | `old-debt` (eski kefalet) | "kefalet" repoda hiç geçmiyordu |
| `le_regret_call` → `le_regret_call_return` | `regret-call` | Mevcut olay yalnız karşı taraf arayınca tetikleniyordu |
| `le_workplace_voice` → `le_workplace_voice_return` | `union-talk` | İşyerinde temsil/kolektif ses içeriği yoktu |
| `le_second_city` → `le_second_city_return` | `second-city`, `city-return` | Konut sistemi şehir içiydi; ayrılmanın ağ/aile bedeli yoktu |

- **MERGE:** `siblingDuty`, dört aile tipinde tanımlıydı ama `familyMods`'a
  hiç taşınmıyordu ve hiçbir yerde okunmuyordu. Artık taşınıyor ve kardeş
  zincirinin dönüş süresini belirliyor.
- **ADAPT:** `le_regret_call`, mevcut `former_contact_reconnect` olayının
  karşıtıdır (orada karşı taraf yazar, burada sessizliği oyuncu bozar).

### DUPLICATE — TC SIM'de zaten daha iyisi var

| Hayat | TC SIM karşılığı |
|---|---|
| `course`, `study`, `night-class`, `side-skill` (3 adımlı kurs) | 18 eğitim yolu + `education_path_window`/`education_window_followup`, `edu_shift_clash`, `tuition_pressure` |
| `doctor`, `exercise`, `rest`, `health-scare`, `burn-warn`, `health-ignore` | Beden sistemi + `health_warning`, `health_overload_review`/`_outcome`, `late_career_workload` |
| `groceries`, `book`, `trip` | 53 satırlık Market |
| `help-family`, `parent-money`, `parent-sick` | `fam_emergency_ask`, `life_baba_ask_money`, `family_obligation`, `midlife_family_obligation` + geri dönüşleri |
| `save`, `withdraw`, `repay`, `debt-restructure`, `side-loan` | Finans defteri, yatırımlar, `money_relief_due`, kişiye özel borç sistemi |
| `promote`, `resign`, `job-safe`, `job-risk`, `quiet-quit`, `first-boss` | 58 iş + `career_promotion_review`, `job_security_review`, `work_bad_boss`, `career_responsibility_review` |
| `view-home`, `move`, `return-home`, `first-rent`, `roommate`, `house-loan`, `rent-keep` | Konut sistemi + `housing_squeeze`, `housing_move_followup`, `rl_chn16_deposit`, `network_housing_lead` |
| `network` (referans), `mentor-ask`, `network-ask` | Referans sistemi + `net_referral_offer`, `network_referral_followup`, favor/borç grafiği |
| `commit`, `marry`, `split`, `first-love`, `breakup` | Romantik ilişki + `partner_transition`, `separation_review`, yetişkin içerik paketi |

### WEAKER — daha basit olduğu için taşınmadı

`work`, `overtime`, `search` (tek kademeli iş modeli), `hobby`,
`meet-*` türevleri (yalnız +ilişki puanı), `civic-duty` (tek günlük
zaman çakışması), Hayat'ın 200 TL sabit birikim/çekim/ödeme mekanikleri,
`ambition-pause`, `settle`, `first-contract`, `uni-stay`/`uni-leave`,
`army-wait`, `cousin-abroad` (vize/göç sistemi gerektirirdi).

### RETIRE

Hayat kabuğu, dönem (passage) motoru, `shadows[]` dizisi ve Uzun Gölge
ekranı, 5 bölümlük yaş yayı, 18–35 yaş sınırı, `playerName` alanı,
`LIFE_SCREENS`, `lifeReason` kapıları, Hayat'a özgü `safe` kayıt bayrağı.

### ARCHIVE

Fikir olarak değerli ama bu turda shipping koda girmeyenler: `civic-duty`
(sandık/iş çakışması), `cousin-abroad` (yurtdışı ağ kopuşu),
`health-habit` gölgesi (yıllar sonra dönen alışkanlık), `lease` gölgesi,
`tempo` gölgesi, `return-home` gölgesi. Git geçmişi bunların tam metnini
korur (bkz. `docs/archive/HAYAT_RETIREMENT.md`).

## Uzun Gölge nereye gitti

Ayrı bir alt sistem **eklenmedi**. `shadows[]`, "Gölgeler" ekranı ve
Uzun Gölge menüsü TC SIM'e taşınmadı. Bunun yerine mevcut mimari kullanıldı:

```
karar → olay seçimi → anlık etki (para/beden/ilişki)
      → bayrak + NPC hafızası
      → openCase(dueWeek)
      → processDueOpenCases → dönüş olayı
      → Geçmiş / Yıl Dosyası
```

Gecikmeler Hayat'ın "3–5 mevsim" sayılarından kopyalanmadı; her zincir
kendi ölçeğine göre haftaya çevrildi: kardeş 20–36 hafta (aile tipine göre),
işyeri 14–26, kefalet 20–36, şehir 30–40, pişmanlık 56–72 hafta.

## İçerik sayıları (önce → sonra)

| Ölçü | Önce | Sonra |
|---|---|---|
| TC SIM olay tanımı | 232 | 242 |
| TC SIM NPC kadrosu (`NETWORK_CAST`) | 40 | 41 |
| Varsayılan hayattaki kişi | 7 | 8 |
| İş | 58 | 58 |
| Eğitim yolu | 18 | 18 |
| Market satırı | 53 | 53 |
| Kayıt sürümü (`SAVE_VERSION`) | 5 | 5 |

**Silinen mevcut TC SIM içeriği: 0.**

## Kayıt etkisi

- Kayıt sürümü **artırılmadı**. Eklenen her alan mevcut jenerik şemaları
  kullanır (`openCases[].payload`, `people[]`, `flags`).
- Kardeşi olmayan eski kayıtlar `ensureLifeEchoState()` ile kişiyi kazanır;
  `materializeCast` ile, mevcut kayıtlardaki ağ kişileriyle birebir aynı
  şekilde üretilir. Son temas "şimdi" damgalanır, böylece geriye dönük
  ilişki cezası doğmaz.
- Zorunlu yeniden başlatma yok, veri kaybı yok.
- **Çapraz kayıt göçü yoktur.** Hiçbir Hayat kaydı TC SIM kaydına
  taşınmaz, kopyalanmaz veya onunla birleştirilmez.
- Tarayıcılarda kalan `tariklab.nextwave.hayat.slot*` anahtarları
  artık hiçbir kod tarafından okunmaz/yazılmaz; zararsız yetim veridir.
  Site genelinde localStorage taranıp silinmez.

## Yol boyunca bulunan ve düzeltilen iki kusur

1. `openCase.payload.personId` tanımsız (`undefined`) bırakıldığında JSON
   turunda anahtar tamamen düşüyor, canlı durum ile yüklenen durum
   eşitliğini bozuyordu. Kişisiz zincirlerde artık açıkça `null` yazılır.
2. Olay metni her render'da `` `${text} ${adultEventContext()}` `` ile
   birleştiriliyordu; bağlam boşken sonda kalan boşluk, tam eşleşmeli
   sözlük aramasını kaçırıp EN çevirisini sessizce devre dışı bırakıyordu.

## TR/EN

TR kanoniktir. Taşınan 10 olayın başlığı, metni ve tüm seçenek etiketleri
EN karşılığını olay tanımında (`en: { title, text, choices }`) taşır.
Kısa ve genel etiketler ("Ara", "Git", "Kal") bilinçli olarak site geneli
`PHRASE` sözlüğüne eklenmedi: o sözlük DOM tabanlıdır ve örneğin Racon'un
kendi "Git" düğmesini de çevirirdi.

## Doğrulama

- `scripts/tc-sim-life-echo.test.mjs` — 14 test: ulaşılabilirlik, gecikmeli
  dönüşün tam bir kez ateşlenmesi, kaydet/yükle nötrlüğü, tekrar çiftliği
  koruması, eski kayıt uyumu, TR/EN kapsaması, 3 profil × 10 yıl uzun koşu.
- Uzun koşuda beş zincirin tamamı organik olarak açılıp kapanır ve çözülen
  olayların ~%1,9'unu oluşturur (havuzu ele geçirmez, ölü içerik de değildir).
- Gerçek tarayıcı (Chromium) QA'sı: TR/EN olay metni, seçim etkisi,
  kardeşin mevcut Kişiler ekranında görünmesi, yeni menü eklenmediği,
  390/430/1440 genişliklerinde taşma ve konsol hatası olmaması.

## Bilinçli olarak güncellenen taban testleri

Bunlar gevşetilmedi; yeni ve kasıtlı değere sabitlendi:

- `scripts/management-desk.test.mjs` — donmuş içerik tabanı 34 → 35 dosya,
  hash yenilendi, `NETWORK_CAST` 40 → 41.
- `scripts/tc-sim-depth-3.test.mjs`, `scripts/tc-sim-real-life-expansion.test.mjs`
  — varsayılan kadro 7 → 8 kişi.
- `scripts/tc-sim-hardening.test.mjs` — v3 kaydının göçünde `kardes`
  ilişkisi eklenir (eski alanların hiçbiri kaybolmaz).
