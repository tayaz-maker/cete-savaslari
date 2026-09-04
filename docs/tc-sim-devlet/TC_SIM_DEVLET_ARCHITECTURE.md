# TC SIM: DEVLET — Mimari Kilidi

**Durum:** Tasarım kilidi. **Runtime kodu yoktur ve bu belge kod yazma yetkisi vermez.**
Ürün vizyonu `TC_SIM_DEVLET_MASTER.md`; ilk dilim kapsamı `TC_SIM_DEVLET_PROTOTYPE.md`;
TC SIM'den ne alınacağı `TC_SIM_DEVLET_REUSE_PLAN.md`.

Bu belgenin tek görevi: **state / motor / veri / event / save mimarisini** Cowork yeniden
tasarlamak zorunda kalmayacak netlikte sabitlemek.

---

## 1. Mimari karar kaydı (ADR)

Her karar tekrar tartışmaya açılmaz. Değişecekse gerekçesiyle bu tabloya yeni satır eklenir.

| #      | Karar                                                                           | Gerekçe                                                                                                   | Sonuç                                                                                   |
| ------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| ADR-01 | **Ana tur = 1 ay.** Alt gün simülasyonu yok.                                    | 36 aylık dilim ~36 turdur; haftalık tur içeriği doldurulamayacak kadar seyrek olurdu.                     | `time = { year, month, absoluteMonth }`. Hız sistemi prototipte yok.                    |
| ADR-02 | **Karar ≠ uygulama.** Her politika kararı bir uygulama oranından geçer.         | Oyunun imza mekaniği ve "devleti kontrol etmiyorsun" iddiasının tek teknik karşılığı.                     | `resolveDecision()` iki sonuç üretir: `intended` ve `actual`.                           |
| ADR-03 | **Ayrı save alanı.** `tc-sim-devlet-save` / `tc-sim-devlet-save-backup`.        | Ayrı ürün, ayrı state. TC SIM kayıtlarıyla karışma riski sıfırlanmalı.                                    | DEVLET save'i TC SIM'i asla okumaz/yazmaz.                                              |
| ADR-04 | **Deterministik motor.** Rastgelelik yalnız seed'li ve sınırlı.                 | Test edilebilirlik ve tekrar üretilebilir hata ayıklama.                                                  | `meta.rngState` + sınırlı jitter (±5). LLM motor değildir.                              |
| ADR-05 | **Şimdilik ortak motor çıkarılmaz.**                                            | İkinci ürün henüz kodda yok; erken soyutlama iki oyunu da bozar.                                          | Kanıtlanmış küçük yardımcılar **kopyalanıp uyarlanır**, paylaşılmaz.                    |
| ADR-06 | **Veri ile motor ayrıdır.** Dönem/kurum/aktör/event içeriği `js/data/` altında. | İleride dönem eklerken motor dosyalarına dokunulmamalı.                                                   | Motor dosyaları içerik sabiti barındırmaz.                                              |
| ADR-07 | **Gösterge sayısı prototipte 6.**                                               | Master'daki 11 göstergenin hepsi ilk dilimde anlam üretmez.                                               | Kalanlar sonraki aşamalara kilitli (bkz. ROADMAP).                                      |
| ADR-08 | **Bilgi kalitesi prototipte "lite" olarak vardır.**                             | "Gerçek değeri bilmemek" DEVLET hissinin çekirdeği; ertelenirse ilk dilim TC SIM'e benzer.                | Tek gösterge + tek `report()` fonksiyonu; ayrı yalan/istihbarat sistemi yok.            |
| ADR-09 | **Ödül/etki tick içinde uygulanır, event yalnız sunumdur.**                     | TC SIM 3B'de kanıtlandı: event çözümüne bağlı ödül ertelenince kaybolur/çiftlenir.                        | Devlet state mutasyonu `resolveDecision()` içinde; event yalnız brifing/anlatım.        |
| ADR-10 | **openCase → `stateFile` (devlet dosyası).** Tek soyutlama.                     | Soruşturma, politika borcu, skandal ve uyuyan arşiv dosyası aynı yaşam döngüsünü paylaşır.                | Tek şema, `kind` alanıyla ayrışır.                                                      |
| ADR-11 | **Aktör gizli statları asla raporlanan değere yazılmaz.**                       | Bilgi kalitesi mekaniğinin bütünlüğü buna bağlı.                                                          | `true` alanları state'te; `reported` yalnız hesaplanır, saklanmaz.                      |
| ADR-12 | **Tarihsel doğruluk motor değil içerik metadata'sıdır.**                        | Motor tarihsel yargı üretmemeli; etiket içerikte durmalı.                                                 | `historicity` + `contested` + `sources` alanları event/aktör verisinde.                 |
| ADR-13 | **Tarihsel çekim (historical gravity) prototipte yoktur.**                      | 36 aylık sistemik dilimde tarihsel takvim zorlamasına gerek yok.                                          | Eventler yalnız koşul tabanlı. Dönem verisinde boş `anchors` alanı bile açılmaz.        |
| ADR-14 | **Devlet DNA'sı, entropi, politika borcu, ağ simülatörü prototipte yoktur.**    | Vertical slice'ın amacı "devlet olma hissi"ni kanıtlamak; bu sistemler onu kanıtlamaz, kalabalıklaştırır. | Göstergeler bir **map** olduğu için sonradan eklemek veri işidir, şema ameliyatı değil. |
| ADR-15 | **Dört ses zorunlu değildir.**                                                  | Her event için dört metin yazmak içerik maliyetini üçe katlar.                                            | `voices` alanı opsiyonel; yalnız `significance: "high"` eventlerde dördü de beklenir.   |

---

## 2. Zaman modeli

- **Temel tur:** 1 ay. `advanceMonth()` tek atomik fonksiyondur.
- **Ay sonu:** her turda çalışır — ekonomi güncellemesi, toplum güncellemesi, gecikmeli
  sonuçların vadesi, Devlet Karnesi anlık görüntüsü.
- **Yıl sonu:** `month === 12` taşmasında yıllık rapor kaydı. TC SIM'deki `closeYear()`
  deseninin aynısı: **taşma yapısal olarak tek sefer garantiler, ayrı guard alanı eklenmez.**
- **Çeyreklik toplama:** prototipte **yok**. İki farklı raporlama ritmi ilk dilimde
  karmaşıklıktan başka bir şey üretmez.
- **Hız sistemi:** prototipte **yok**.

```
time = { year: 2002, month: 1, absoluteMonth: 1 }
```

`absoluteMonth` tek artan sayaçtır; bütün vade hesapları (`dueMonth`) buna göre yapılır.

---

## 3. Üst düzey state

```
GameState {
  meta        { saveVersion, gameId, createdAt, updatedAt, rngState }
  world       { eraId }
  time        { year, month, absoluteMonth }
  indicators  { [indicatorId]: 0..100 }          // 6 adet, bkz. PROTOTYPE
  institutions{ [institutionId]: Institution }    // 5 adet
  actors      { [actorId]: Actor }                // 12 adet
  economy     { treasury, inflationPressure, unemploymentPressure, growthPressure }
  society     { consent, heat }                   // toplum agregatı
  briefing    { active: null | BriefingInstance, queue: [], seen: [], cooldowns: {} }
  stateFiles  [ StateFile ]                       // açık/uyuyan devlet dosyaları
  archive     [ ArchiveRecord ]                   // kapanmış kayıt
  decisions   [ DecisionRecord ]                  // sınırlı karar geçmişi
  appointments{ vacancies: [Vacancy], pending: null | PendingAppointment }
  yearly      [ YearRecord ]
  flags       { }
}
```

**Kurallar**

- Göstergeler **map**'tir; yeni gösterge eklemek veri işidir.
- `institutions` ve `actors` **map**'tir, dizi değil: id ile erişim ve save doğrulaması kolaydır.
- `society` şu an iki sayıdır. Sınıf/bölge/kuşak kırılımı ileriki aşamaya kilitlidir.
- Bütün listeler `appendCapped` deseniyle sınırlıdır (bkz. §9).

### Institution

Tek generic şema; kuruma özel şema **yoktur**.

```
Institution {
  id, name,
  capacity        0..100   // uygulayabilme gücü
  autonomy        0..100   // merkezden bağımsızlık
  alignment       0..100   // oyuncunun yönüyle uyum
  informationQuality 0..100 // raporlarının doğruluğu
  leaderActorId   actorId | null
  memory          [ { month, note, delta } ]  // kurumsal hafıza, sınırlı
}
```

### Actor

```
Actor {
  id, name,
  // GÖRÜNÜR
  role, institutionId, publicProfile 0..100,
  // GİZLİ — arayüze asla ham verilmez
  hidden { loyalty, competence, ambition, ties: [ { actorId, strength } ] }
}
```

`ties` düz bir dizidir. **Graph veritabanı yok, ağ simülatörü yok.** Prototipte bağlar
yalnız atama sonucunu ve iki event koşulunu besler.

### StateFile (openCase evrimi)

```
StateFile {
  id, kind,            // "investigation" | "policy_debt" | "scandal" | "dormant"
  subject, createdMonth, dueMonth | null,
  relatedActors: [], relatedInstitutions: [],
  status,              // "open" | "dormant" | "resolved"
  significance,        // "low" | "normal" | "high"
  known: boolean,      // oyuncu bu dosyadan haberdar mı
  payload: { }         // türüne göre serbest ama küçük
}
```

Prototipte `kind` yalnız `investigation` ve `dormant` üretir; diğer iki değer **rezervedir**
(şema bugünden sabit, üretim sonraki aşamada).

### ArchiveRecord

```
ArchiveRecord {
  id, month, title, tags: [],
  relatedActors: [], relatedInstitutions: [],
  significance, known,
  sourceDecisionId | null, sourceFileId | null
}
```

Arşiv **salt geçmiş kaydı değildir**: `known: false` kayıtlar ileride event koşulu olarak
geri dönebilir. Prototipte en az bir event bunu kullanır (bkz. PROTOTYPE senaryo C).

### EventDefinition

```
EventDefinition {
  id, eraIds: [],                    // hangi dönemlerde geçerli
  window: { fromMonth, toMonth } | null,
  conditions: (state) => boolean,
  priority: number,                  // yüksek önce; dizi sırasına GÜVENİLMEZ
  repeat: "once" | "cooldown" | "repeatable", cooldownMonths,
  significance: "low" | "normal" | "high",
  briefing: { title, summary, voices: { official?, corridor?, public?, archive? } },
  choices: [ Choice ],
  historicity: "historical" | "alternative" | "systemic",
  contested: boolean,
  sources: [ ]
}

Choice {
  id, label,
  intent: {                          // NİYET — doğrudan uygulanmaz
    indicators: { }, economy: { }, society: { },
    institutions: { [id]: { alignment?, capacity? } }
  },
  implementation: {                  // uygulamayı hangi kurum taşıyor
    institutionId, resistance 0..100
  } | null,                          // null ise doğrudan uygulanır (ör. sembolik karar)
  delayed: [ { kind, afterMonths, payload } ],
  archive: { title, tags, significance, known } | null
}
```

**TC SIM'den ayrılan nokta:** TC SIM'de event sırası dizi sırasıdır (`EVENT_DEFINITIONS.find`).
Bu, 3B'de yeni eventlerin bastırılması riskini doğurdu. DEVLET'te **açık `priority` alanı**
vardır ve seçim `priority` + id'ye göre deterministik sıralanır. Dizi sırası anlam taşımaz.

---

## 4. Karar → uygulama boru hattı

Bu, oyunun en kritik akışıdır. Sıra **kesindir** ve Cowork bunu yeniden tasarlamaz.

```
1  advanceMonth() çağrılır
2  vadesi gelen stateFile'lar tetiklenir  → briefing kuyruğuna girer
3  uygun event seçilir (priority sıralı, tek adet)  → briefing.active
4  oyuncu bir choice seçer → resolveDecision(state, choiceId)
       4a  intent okunur (hiçbir şey uygulanmaz)
       4b  implementation hedefi yoksa → actualRate = 100
       4c  hedef varsa → computeImplementationRate() (§5)
       4d  actual = ölçeklenmiş intent  (her sayısal etki × rate/100, yuvarlanmış)
       4e  actual state'e UYGULANIR      ← tek mutasyon noktası
       4f  reported = report(actual, informationQuality)  ← yalnız gösterim, saklanmaz
       4g  delayed[] → stateFile olarak eklenir (dueMonth = absoluteMonth + afterMonths)
       4h  archive kaydı yazılır (varsa)
       4i  DecisionRecord yazılır: { id, month, eventId, choiceId, rate, breakdown }
5  briefing.active = null; kuyrukta bir sonraki varsa aktifleşir
6  oyuncu turu bitirir → ay sonu: ekonomi, toplum, kurum hafızası, karne
7  yıl taşmasında yıllık kayıt
8  validateState() — her turun sonunda
```

**Değişmez kurallar**

- 4e **tek** state mutasyon noktasıdır. Event sunumu state değiştirmez.
- Aynı `DecisionRecord.id` iki kez yazılamaz (karar bir kez çözülür).
- `reported` hiçbir zaman state'e yazılmaz (ADR-11).
- Gecikmeli sonuç **tam bir kez** tetiklenir; `stateFile.status` `open → resolved`.

---

## 5. Uygulama oranı (imza mekaniği)

Deterministik, hata ayıklanabilir, test edilebilir. **20 modifier yok — 4 terim + 1 sınırlı jitter.**

```
computeImplementationRate(state, { institutionId, resistance }) → { rate, breakdown }

  terms = [
    { source: "kurum kapasitesi",  value: 0.40 * institution.capacity },
    { source: "kurum uyumu",       value: 0.25 * institution.alignment },
    { source: "devlet kapasitesi", value: 0.20 * indicators.state_capacity },
    { source: "direnç",            value: 0.15 * (100 - resistance) },
  ]
  base = sum(terms)

  // Özerk kurum, uyum düşükken merkezi daha çok süzer.
  autonomyPenalty = (institution.autonomy / 100) * ((100 - institution.alignment) / 100) * 20
  jitter = seededJitter(state, -5..+5)          // meta.rngState, tam sayı

  rate = clamp(round(base - autonomyPenalty + jitter), 0, 100)
```

- `breakdown` **döndürülür ve `DecisionRecord`'a yazılır**: arayüz "neden %54?" sorusunu
  cevaplayabilir, test tek tek terimleri doğrulayabilir.
- Jitter seed'lidir: aynı state + aynı seçim = aynı sonuç.
- `resistance` choice verisinden gelir (içerik), formülden değil.

---

## 6. Bilgi kalitesi (lite)

Tek fonksiyon, tek gösterge:

```
report(trueValue, informationQuality) →
  quality 100 ise trueValue
  aksi halde trueValue ± sapma,  sapma = round((100 - quality) / 10)  // en çok ±10
  seed'li, tam sayı, aynı ay içinde aynı alan için AYNI değeri üretir
```

- Sapma yönü seed'li deterministiktir; oyuncu ekranı yenileyince değer zıplamaz.
- Kurum raporları `institution.informationQuality`, genel göstergeler
  `indicators.information_quality` kullanır.
- Aktörün gizli statları için de aynı fonksiyon: atama ekranında aday "yetkinlik ~62"
  görünür, gerçek değer 58 olabilir.
- **Yalan/istihbarat/ajan sistemi yoktur.** Bu, minimum uygulanabilir çarpıtmadır.

---

## 7. Atama akışı

```
vacancy (veri veya event ile açılır)
  → adaylar listelenir (2–3 aktör)
  → her aday için raporlanan (gerçek değil) yetkinlik/sadakat gösterilir
  → oyuncu seçer  → appointActor()
  → kurum etkisi: alignment ve capacity, adayın GERÇEK statlarıyla güncellenir
  → gecikmeli sonuç: 3–6 ay sonra stateFile (ör. beklenmedik performans, klik tepkisi)
```

Oyuncu istediğini atayınca sonuç otomatik istediği gibi olmaz: karar **raporlanan** bilgiyle,
sonuç **gerçek** statla hesaplanır. Aynı atama iki kez çözülemez (`appointments.pending` tekildir —
TC SIM'in `pendingJob` deseni, kanıtlanmış).

---

## 8. Save / migration disiplini

TC SIM'de bedeli ödenerek öğrenilenler ilk günden uygulanır.

- `SAVE_KEY = "tc-sim-devlet-save"`, `BACKUP_KEY = "tc-sim-devlet-save-backup"`. **Ayrı namespace.**
- `SAVE_VERSION` 1'den başlar ve **her şema değişikliğinde artar**.
- Migration zinciri **ilk günden** kurulur, tek sürüm varken bile:
  `migrateState(raw)` → sürüme göre dal → **`normalizeDevletState(state)`** → `validateState(state)`.
- **Kritik ders (TC SIM 3B):** yeni sürüm dalı eklenirken `meta.saveVersion` güncellenmeyen bir
  dal kalırsa **bütün kayıtlar geçersiz sayılır**. Her dal sürüm damgasını yazmak zorundadır;
  bunun için kalıcı test vardır (DEVLET-SAVE-03).
- **Kritik ders 2:** bir alt nesne (TC SIM'de `career`) baştan kurulduğunda başka alanları
  düşürebilir. Bu yüzden normalizasyon **her daldan sonra ve tek yerde** çalışır.
- Normalizasyon onarır, çöpe atmaz: bilinmeyen enum → varsayılan, NaN/negatif/ondalık → 0,
  geçersiz id → `null`, dizi olmayan liste → `[]`. Tek bozuk alan yüzünden kayıt silinmez.
- `saveGame` yazmadan önce doğrular; `loadGame` bozuksa yedeğe düşer; yedek de bozuksa
  "yeni oyun güvenle başlatılabilir" der. TC SIM davranışının aynısı.
- Roundtrip ve **idempotans** (aynı kaydı tekrar migrate etmek state'i bozmaz) test edilir.

---

## 9. Sınırlı büyüme (bounded state)

TC SIM'de 1040 haftalık koşuda kanıtlanan disiplin aynen alınır: her büyüyen liste
`appendCapped(list, item, limit)` ile yazılır.

| Liste                | Sınır            | Not                                                                                                   |
| -------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `archive`            | 300              | En eski kayıt düşer                                                                                   |
| `decisions`          | 200              | `breakdown` küçük tutulur                                                                             |
| `briefing.history`   | 200              |                                                                                                       |
| `institution.memory` | 40 / kurum       |                                                                                                       |
| `yearly`             | 60               |                                                                                                       |
| `stateFiles`         | **300 + budama** | TC SIM'de `openCases` kapaksızdı; **DEVLET'te `resolved` dosyalar arşive taşınıp listeden çıkarılır** |

`stateFiles` budaması bilinçli bir düzeltmedir: TC SIM'de çözülmüş `openCases` listede kalıyor
ve yavaş da olsa büyüyor. DEVLET bu hatayı ilk günden yapmaz.

---

## 10. Motor / veri ayrımı

| MOTOR (`js/`)                                    | VERİ (`js/data/`)                                |
| ------------------------------------------------ | ------------------------------------------------ |
| `time.js` — ay/yıl ilerlemesi                    | `eras.js` — dönem tanımı ve başlangıç değerleri  |
| `events.js` — uygunluk, sıralama, çözüm          | `events.<era>.js` — event içeriği                |
| `implementation.js` — uygulama oranı             | `institutions.<era>.js` — kurum başlangıç verisi |
| `appointments.js` — boşluk/aday/atama            | `actors.<era>.js` — aktör verisi                 |
| `files.js` — stateFile ve arşiv geçişleri        | `indicators.js` — gösterge id/etiket/aralık      |
| `save.js` — sürüm, migration, doğrulama          |                                                  |
| `state.js` — oluşturma, normalizasyon, doğrulama |                                                  |
| `economy.js`, `society.js` — agregat güncelleme  |                                                  |
| `report.js` — bilgi kalitesi çarpıtması          |                                                  |
| `app.js`, `navigation.js` — arayüz               |                                                  |

**Kural:** motor dosyaları içerik sabiti (kurum adı, aktör adı, event metni, dönem sayısı)
barındırmaz. Yeni dönem eklemek = `js/data/` altına dosya eklemek + `eras.js`'e satır eklemek.

---

## 11. Önerilen dosya yapısı

TC SIM'in kanıtlanmış ölçeği (11 dosya, ~1.700 satır) referans alınmıştır: ne tek dev HTML,
ne 50 mikro dosya.

```
public/games/tc-sim-devlet/
  index.html
  styles.css
  js/
    app.js            arayüz ve olay bağlama
    navigation.js     bölüm listesi
    state.js          createNewGame, normalize, validate
    time.js           advanceMonth, ay/yıl sonu
    events.js         event uygunluk + çözüm
    implementation.js uygulama oranı + breakdown
    appointments.js   boşluk, aday, atama
    files.js          stateFile + arşiv
    economy.js        ekonomi agregatı
    society.js        rıza ve ısı
    report.js         bilgi kalitesi çarpıtması
    save.js           save/migration/recovery
    data/
      eras.js
      indicators.js
      institutions.restructuring_2002.js
      actors.restructuring_2002.js
      events.restructuring_2002.js
scripts/
  tc-sim-devlet-core.test.mjs
  tc-sim-devlet-sim.mjs
```

---

## 12. Dönem temeli

- `world.eraId` **birinci sınıf kalıcı alandır** ve save'de korunur.
- Prototip dönem id'si: **`restructuring_2002`** (görünen ad: "2002 — Yeniden Yapılanma").
- İleride: `founding_1923`, `multiparty_1950`, `junction_1980`, `present_day`, `alternative_tr`.
  Bu id'ler **rezervedir**; bugün veri üretilmez.
- `getEraById()` bilinmeyen id'yi `null` döner; normalizasyon prototip dönemine geri düşer
  (TC SIM `eras.js` deseninin aynısı).
- Dönem verisi neyi değiştirir: başlangıç tarihi, kurum listesi ve başlangıç statları, aktör
  listesi, ekonomi/toplum başlangıcı, event havuzu, arayüz tonu. **Motor değişmez.**

---

## 13. Yapay zekânın rolü

- Çekirdek simülasyon **deterministik ve kural tabanlıdır**. LLM state değiştirmez.
- AI ileride yalnız anlatım katmanında: metin varyasyonu, brifing tonu, arşiv özeti,
  karakter yazımı. Bu katman kapatıldığında oyun tamamen oynanabilir kalmalıdır.
- Prototipte AI entegrasyonu **yoktur**.

---

## 14. Performans sınırları

Tarayıcı oyunu; ölçüm değil, kaçak büyümeyi önleyen tavanlar:

| Ölçüm              | Prototip tavanı                                  |
| ------------------ | ------------------------------------------------ |
| Aktör              | 12 (mutlak tavan 40)                             |
| Kurum              | 5 (mutlak tavan 12)                              |
| Event tanımı       | 24                                               |
| Aktif `stateFiles` | eşzamanlı 20                                     |
| Arşiv kaydı        | 300                                              |
| Tur başına iş      | O(kurum + aktör + event) — iç içe tam tarama yok |
| Save boyutu        | < 150 KB                                         |

Aktör-aktör bağları `ties` ile seyrek tutulur; **tam grafik taraması yapılmaz.**

---

## 15. Risk kaydı

| #   | Risk                                                                   | Seviye   | Önlem                                                       | Test/guard        |
| --- | ---------------------------------------------------------------------- | -------- | ----------------------------------------------------------- | ----------------- |
| 1   | Gizli gerçek değerin raporlanan değerle ezilmesi                       | **HIGH** | `report()` saf fonksiyon, dönüşü asla state'e yazılmaz      | DEVLET-INFO-02    |
| 2   | Uygulama oranının anlaşılmaz kara kutuya dönmesi                       | **HIGH** | `breakdown` zorunlu döner ve karara yazılır                 | DEVLET-IMP-02     |
| 3   | Save sürümü artarken bir dalın damga yazmaması → tüm kayıtların ölmesi | **HIGH** | Her dal damgalar; migration zinciri ilk günden              | DEVLET-SAVE-03    |
| 4   | State patlaması (81 il, yüzlerce aktör)                                | **HIGH** | §14 tavanları; bölge/kuşak sonraki aşamalara kilitli        | DEVLET-LONG-02    |
| 5   | Gecikmeli sonucun iki kez tetiklenmesi                                 | MEDIUM   | `stateFile.status` geçişi tek yönlü, çözülen arşive taşınır | DEVLET-FILE-02    |
| 6   | Event spam'i / aynı brifingin yağması                                  | MEDIUM   | `repeat` + `cooldownMonths` + tur başına tek aktif brifing  | DEVLET-EVENT-04   |
| 7   | Arşiv/dosya listelerinin sınırsız büyümesi                             | MEDIUM   | `appendCapped` + `resolved` dosyaların budanması            | DEVLET-LONG-02    |
| 8   | Tarihsel determinizm (oyunun "gerçek tarihi" dayatması)                | MEDIUM   | Tarihsel çekim yok (ADR-13); eventler koşul tabanlı         | — (tasarım)       |
| 9   | Propaganda yanlılığı / tartışmalı iddianın kesinmiş gibi sunulması     | MEDIUM   | `contested` + `sources` metadata zorunlu; içerik politikası | içerik incelemesi |
| 10  | İçerik ile state'in birbirine yapışması                                | MEDIUM   | §10 motor/veri ayrımı; motorda içerik sabiti yasak          | kod incelemesi    |
| 11  | Erken ortak motor çıkarma isteği                                       | LOW      | ADR-05                                                      | —                 |
| 12  | LLM'in simülasyon motoruna dönüşmesi                                   | LOW      | §13                                                         | —                 |

---

## 16. İçerik / kaynak politikası

| Kaynak gerektiren (source-backed)                 | Simülasyon soyutlaması (kaynak gerekmez)     |
| ------------------------------------------------- | -------------------------------------------- |
| Kurumun o dönemde var olması                      | `capacity`, `autonomy`, `alignment` sayıları |
| Aktörün rolü ve görev dönemi                      | `hidden.loyalty`, `competence`, `ambition`   |
| Tarihsel bir olayın gerçekleşmiş olması ve tarihi | Uygulama oranı yüzdesi                       |
| Kurumun yasal yetkisi                             | Gösterge puanları                            |
| Ekonomik göstergenin yönü (kriz/büyüme)           | `heat`, `consent` sayıları                   |

Kural: **gerçek kişiye ölçülemez gizli stat atanır ama bu stat gerçek iddia gibi sunulmaz.**
Tartışmalı konular `contested: true` ile işaretlenir ve kesin bilgi olarak yazılmaz.
Karanlık içerik iktidar mekanizmasını açıklamak için kullanılır, şok için değil.
Bugünün değerleri geçmişe mekanik olarak yapıştırılmaz. Devlet şeytan, halk aptal değildir.
