# TC SIM: DEVLET — Event / OpenCase Chain Contract

TC SIM'in `events.js` + `depth2-systems.js` desenlerinin DEVLET'e
uyarlanmış hâli. Bu kontrat implementasyon öncesi kilitlenir; her yeni
event tipi bu şemadan sapmaz.

## 1. Yaşam döngüsü

```
STATE
  → CONDITION            (event.condition(state) → boolean, saf fonksiyon)
  → SCHEDULE              (openCase oluşturulur; deterministik id, TEKİL)
  → PLAYER KNOWLEDGE GATE  (openCase görünür mü? bkz. §4)
  → EVENT ACTIVATION       (activateNextEvent — kuyruktan tekine geçer)
  → CHOICE                 (oyuncu bir choice seçer)
  → RESOLUTION              (declarative effects + sistem hook'u)
  → IMPLEMENTATION-RATE PIPELINE   (00_MASTER_ARCHITECTURE.md §7)
  → ACTUAL CONSEQUENCE
  → REPORTED CONSEQUENCE    (ayrı türetim, aynı ay içinde de olabilir)
  → DELAYED FOLLOW-UP        (yeni openCase, gerekiyorsa)
  → CLEANUP / EXPIRY
  → ARCHIVE / MEMORY
```

Bu, TC SIM'in `STATE → CONDITION → EVENT → DECISION → RESULT`
zincirinin bire bir genişletilmiş hâlidir; yeni olan iki halka
**IMPLEMENTATION-RATE PIPELINE** ve ayrı **REPORTED CONSEQUENCE**'tır —
DEVLET'in "karar otomatik uygulanmaz" ilkesinin yaşadığı yer.

## 2. Event tanım şeması

```js
{
  id: "kebab_case_id",              // TC SIM konvansiyonu
  provenance: "T" | "A" | "S",      // 03_HISTORICAL_DATA_PROVENANCE.md
  certainty: "confirmed" | "contested" | "claim" | null,
  repeat: "once" | "cooldown" | "repeatable",
  cooldownMonths: number | undefined,
  condition: (state) => boolean,     // saf, yan etkisiz
  choices: [
    {
      id, label,
      effects: { /* declarative — TC SIM'deki gibi money/health/flags/memory değil,
                    DEVLET'e özgü: economyDelta, allianceAdjust, archiveNote */ },
    },
  ],
  // Dört-ses alanları opsiyonel, event tanımında şablon olarak durabilir:
  voices: { resmi, koridor, halk, arsiv } | undefined,
}
```

Effects **her zaman deklaratif** kalır; event tanımı içinde rastgele
JavaScript mutasyonu yazılmaz (ana belge §18'in doğrudan gereği). Bir
event'in event-tanımına sığmayan sistemsel sonucu varsa (örn. bir kurumun
`politicalAlignment`'ını atamayla değiştirmek), bu `applySystemResolution
(state, definition, choiceId, sourceCase)` adlı **tek** hook fonksiyonunda
işlenir — TC SIM'in `applyDepth2Resolution` deseninin karşılığı.

## 3. ID ve tekillik konvansiyonu

- **Event id:** `kebab_case`, TC SIM ile aynı (örn. `budget_review_window`).
- **OpenCase id:** `<type>-<eventId>-<absoluteMonth>-<subjectId?>` —
  TC SIM'in `depth2-${eventId}-${week}` desenine paralel. Aynı konu için
  ikinci bir dosya açılmaya çalışılırsa (`state.openCases.some(item =>
  item.id === caseId)`) **sessizce reddedilir**, hata fırlatmaz.
- **Cooldown:** `state.events.cooldowns[eventId] = dueMonth`.
  Bir event `repeat: "cooldown"` ise resolve olduğu anda kendi
  cooldown'unu yazar; `condition` fonksiyonu her zaman
  `!(state.time.absoluteMonth < cooldowns[eventId])` kontrolünü içerir.
- **Tekrar önleme:** `repeat: "once"` event'ler `state.events.seen`'e
  yazılır ve `condition` bunu kontrol eder.
- **Süre dolumu (expiry):** her openCase bir `expiresMonth` taşır;
  `processDueOpenCases` süresi geçmiş ve hâlâ `pending` olan dosyaları
  **sonuçsuz bırakmaz** — TC SIM'deki "pencereyi kaçırmak bedelsiz kaçış
  olamaz" dersi burada da geçerlidir: süre dolumu kendi (genelde daha
  ağır) sonucunu üretir, asla sessizce silinmez.

## 4. Bilgi görünürlüğü (oyuncu bilgi kapısı)

TC SIM'in `calendar.js`'teki `KNOWN_CASE_TYPES` / `HIDDEN_CASE_TYPES`
ayrımı doğrudan miras alınır:

- `KNOWN_CASE_TYPES`: oyuncunun kendi kararıyla açtığı yükümlülükler
  (`appointment-followup`, `policy-followup`) — takvimde görünür.
- `HIDDEN_CASE_TYPES`: tanım gereği oyuncuya önceden haber verilmemesi
  gereken sürprizler (örn. gizli bir istihbarat operasyonunun gecikmeli
  sonucu) — takvimde görünmez, yalnız `event.active` olduğunda ortaya
  çıkar.
- Bazı tipler koşullu görünürlük taşır (TC SIM'deki
  `payload.playerKnown === true` deseni): bir `institution-followup`
  dosyası, oyuncu ilgili istihbarat/denetim eşiğini geçmeden görünmez
  olabilir.

Bu ayrım **`known` state katmanıyla aynı prensibi** event seviyesinde
uygular: oyuncu her şeyi bilmez, bilmediği şey UI'da hiç görünmez —
"gizli `actual` değerini yanlışlıkla sızdırma" hatasının event tarafındaki
karşılığı budur.

## 5. Öncelik ve eşzamanlı event'ler

Bir ayda birden fazla event uygun hale gelebilir. TC SIM'deki
`activateNextEvent` mantığı korunur: **öncelik sırası sabit bir liste**
ile belirlenir (örn. atama > kurum krizi > toplumsal ısı > rutin brifing),
zar yoktur. Aynı önceliğe sahip iki event varsa, `createdWeek`/`createdMonth`
küçük olan (daha eski koşul) önce gelir — deterministik tie-break.

## 6. Sınırlı tutma (retention)

| Koleksiyon | Cap | Gerekçe |
|---|---|---|
| `openCases` (aktif+resolved, sonra budanır) | 40 | TC SIM depth2 cap'i (24) + DEVLET'in daha geniş kurum/atama yelpazesi |
| `events.history` | 200 | TC SIM ile aynı büyüklük mertebesi |
| `events.seen` | event tanım sayısıyla sınırlı, ayrıca budanmaz (küçük set) | |
| `archive` | 80 | TC SIM `yearlyHistory` cap'i |
| `implementationLog` | 60 | Politika borcu türetimi için yeterli pencere, sınırsız log değil |
| `institutions[].history` | 40 | |
| `characters[].careerHistory` | 20 | |
| `characters[].networkLinks` | 6 | |
| `characters[].secrets` | 4 | |
| `networks` (global) | 80 | |

Bir koleksiyon cap'e ulaştığında TC SIM'in `appendCapped` deseniyle en
eski **düşük öncelikli** kayıt budanır (arşiv gibi tarihsel önem taşıyan
koleksiyonlarda "düşük öncelikli" = `laterReassessmentRef` boş ve
`resmiSes/koridorSesi/halkSesi/arsivSesi` hepsi boş olan sıradan kayıtlar
önce gider).

## 7. AI'nin bu zincirdeki yeri (bugün yok, yarın nerede girer)

Zincirde AI'nin **tek olası giriş noktası** `RESOLUTION` ile `ARCHIVE`
arasıdır: motor `actualRate`, `reportedRate`, `voices` alanlarının
sayısal/yapısal kısmını hesapladıktan SONRA, isteğe bağlı bir katman bu
sayıları düz metne çevirebilir (`"İstanbul'da kira protestoları üçüncü
haftasına girerken..."` örneği, ana belge §58). AI bu noktadan önceki
hiçbir adıma erişemez ve hiçbir sayıyı değiştiremez. Sprint 1
implementasyonu bu katmanı **template/veri-tabanlı** metinle doldurur
(sabit Türkçe şablon dizeleri, event tanımının `voices` alanından), API
çağrısı yapmaz.

## 8. Test edilebilirlik kuralı

Bir event'in şeması "reachable" (gerçek oyunda ulaşılabilir) sayılması
için test, resolver'ı doğrudan çağırmak yerine **gerçek tick zinciriyle**
kanıtlamalıdır: `condition` sağlanana kadar `advanceMonth` çağır →
`activateNextEvent` ile event'in gerçekten kuyruğa düştüğünü doğrula →
`resolveEvent` ile sonuçlandır. Bkz.
`04_TEST_AND_RELEASE_CONTRACT.md` §2 (bu, TC SIM 18–35 Core kapanışında
gerçek bir hata sınıfını yakalayan dersin doğrudan aktarımıdır).
