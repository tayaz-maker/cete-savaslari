# TC SIM: DEVLET — State Schema

Kod sözleşmesi değil, uygulama öncesi kavramsal sınır — TC SIM'in
`TC_SIM_SYSTEMS.md`'deki ASCII taslağıyla aynı işlevi görür. Alan adları
öneridir, ilk implementasyon sırasında küçük ayarlar yapılabilir; ama
**bölüm sınırları ve "hiçbir mutable alan tüketicisiz kalmaz" kuralı
sabittir.**

```text
gameState
├─ meta
│    saveVersion (=1), gameId, scenarioId, createdAt, updatedAt,
│    rngState (seeded — YALNIZ S-etiketli prosedürel çeşitlilik için,
│    politika/uygulama sonucu ASLA buradan gelmez),
│    contentVersion, scenarioSnapshotVersion
│
├─ time
│    absoluteMonth, month, year, turnPhase ("briefing" | "decisions" | "resolved")
│
├─ scenario
│    periodId ("2002-2005"), startConditionsRef, doctrineGoal (nullable — hedefli kampanya için, Sprint 1'de null)
│
├─ actual                 ── zemin gerçeği, UI'da asla ham gösterilmez
│    economy: { inflation, interestRate, unemployment, budgetBalance, growthIndex, fxIndex }
│    society: { cohorts: [...], regions: [...] }         (bkz. cohorts/regions aşağıda)
│    institutions: [...]                                  (asıl kayıt burada; reported/known ayrı türetilir)
│
├─ reported               ── actual'dan deterministik türetilmiş, kurumların "resmî" sayısı
│    economy: {...}  (actual ile aynı şekil, farklı değerler)
│    society summary, institution summaries
│
├─ known                  ── oyuncunun inandığı değer + confidence
│    economy: { ...değerler, confidence: 0-100 }
│    society, institutions için aynı desen
│
├─ institutions[]          (cap: 5 Sprint 1'de, şema daha fazlasına açık)
│    id, name, capacity, professionalism, politicalAlignment, autonomy,
│    budget, headCharacterId, history[] (cap ~40, {month, type, label})
│
├─ characters[]            (cap: 10-20)
│    id, name, office, administrativeSkill, economicSkill, loyalty,
│    ambition, publicStanding, provenance ("T"|"A"|"S"),
│    networkLinks[] (cap ~6, {targetId, kind, strength, createdMonth}),
│    secrets[] (cap ~4, {id, kind, evidenceLevel, knownBy[]}),  // veri şekli var, sızdırma mekaniği yok
│    careerHistory[] (cap ~20, {month, type, label, fromOffice, toOffice})
│
├─ appointments
│    currentOfficeHolders: { officeId → characterId }
│    pendingCases[] (openCase'lere referans, type="appointment-followup")
│
├─ cohorts[]                (Sprint 1: 9 = 3 bölge-tipi × 3 gelir bandı)
│    id, regionType, incomeBand, populationShare, economicPressure,
│    stateTrust, expectation, heatContribution
│
├─ regions[]                (Sprint 1: 4, id ile anahtarlı, 81'e ölçeklenebilir)
│    id, name, texture: { sanayi, tarim, kamuIstihdami, muhafazakarlik },
│    localHeat, localTrust
│
├─ networks[]                (global, cap ~80 — yalnız gerçekten kullanılmış bağlantılar)
│    id, fromId, toId, kind, strength, createdMonth, knownToPlayer
│
├─ events
│    active: { eventId, occurrenceId, sourceCaseId } | null
│    queue: [...]
│    cooldowns: { [eventId]: dueMonth }
│    seen: [eventId, ...]   (cap, TC SIM desenine paralel)
│    history: [...] (cap ~200, {occurrenceId, eventId, choiceId, month})
│
├─ openCases[]                (cap ~40)
│    id, type ("institution-followup" | "appointment-followup" | "policy-followup" | "society-followup"),
│    createdMonth, dueMonth, expiresMonth, status, payload: { kind, ... }
│
├─ archive[]                  (cap ~80)
│    id, month, decisionId, institutionsInvolved[],
│    resmiSes, koridorSesi, halkSesi, arsivSesi   (dördü de opsiyonel string|null)
│    actualOutcomeRef, reportedOutcome, laterReassessmentRef
│
├─ implementationLog[]        (cap ~60 — bounded, generic "infinite log" DEĞİL)
│    id, month, decisionId, institutionId, acceptance, capacityFactor,
│    localFactor, actualRate, reportedRate
│
├─ flags {}                   kısa boolean/enum tek-seferlik gerçekler
│
├─ history[]                  yıllık özet (cap ~80, TC SIM `yearlyHistory` ile aynı büyüklük)
│    year, economySummary, societySummary, institutionSummaries[],
│    derivedDNA (o yılın SONUNDA hesaplanmış anlık görüntü — bkz. not aşağıda),
│    derivedEntropy
│
└─ ui                          transient; kalıcı save'e ya hiç girmez ya da minimal (lastScreen)
```

## Türetilmiş (saklanmayan) değerler — referans

Bunlar STATE ALANI DEĞİLDİR; `00_MASTER_ARCHITECTURE.md` §11'deki saf
fonksiyonlarla `archive[]` + `implementationLog[]` üzerinden hesaplanır:

- Devlet DNA'sı ekseni skorları
- Devlet refleksleri (tekrarlayan çözüm kalıbı)
- Devlet Entropisi
- Politika borcu (konu etiketi başına)
- Kurum itibarı, kurum yolsuzluk riski (bkz. `00` §9)

`history[].derivedDNA` / `derivedEntropy` istisnası kasıtlıdır: yıl sonu
karnesi için bir **anlık görüntü** cache'lenir (performans), ama bu
öncelikli kaynak değildir — her zaman `archive[]`'den yeniden
hesaplanabilir olmalıdır. Cache bozulursa/silinirse oyun kırılmaz.

## Alan → tüketici tablosu (zorunlu disiplin)

Yeni bir alan eklerken bu tabloya bir satır eklenmeden PR kabul edilmez
(TC SIM'in kurum şeması denetiminden çıkan kural, §9'da uygulanmıştır).
Sprint 0 implementasyonu bu tabloyu `docs/tc-sim-devlet/01_STATE_SCHEMA.md`
içinde (bu dosya) güncel tutar.

| Alan | Tüketici(ler) |
|---|---|
| `institutions[].capacity` | Uygulama hattı, backlog büyüme hızı |
| `institutions[].professionalism` | Rapor sapması, türetilmiş yolsuzluk riski |
| `institutions[].politicalAlignment` | Uygulama kabulü, atama-sadakat maliyeti |
| `institutions[].autonomy` | Alignment'ın ağırlığı, atama sonucu şiddeti |
| `institutions[].budget` | Capacity drift, ekonomi bütçe defteri |
| `characters[].loyalty` | Atama kararı sonucu, ihanet/sadakat event'leri |
| `characters[].networkLinks` | Ağ haritası okuması, favor/borç event'leri |
| `cohorts[].economicPressure` | Toplumsal ısı, oy/rıza türevleri (ileri faz) |
| `regions[].texture` | Bölgesel event uygunluğu, yerel ısı hesabı |
| `archive[].resmiSes/koridorSesi/halkSesi/arsivSesi` | Dört-sesli event anlatımı, Kelebekler ekranı (ileri faz) |

## Eski-save güvenliği

`SAVE_VERSION` 1'den başlasa da normalizasyon disiplini ilk günden
zorunludur (bkz. `00_MASTER_ARCHITECTURE.md` §3 ve
`04_TEST_AND_RELEASE_CONTRACT.md` §3). Şema değiştiğinde: `SAVE_VERSION`
artırılır, `loadGame` eski sürümü yeni şemaya migrate eder, **hiçbir
zaman sahte tarihsel kayıt üretilmez** (eksik `archive` girdisi boş
dizi kalır, uydurulmaz).
