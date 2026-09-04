# TC SIM — 3D Implementation
Durum: DOKÜMAN. Runtime yok. Cowork bu belgeye göre uygular.

Baseline: `845bc19e316e0434ba9dac322c8698c639620c39` (main HEAD bu dal açılırken).
3C final runtime: `d255c7dd5e540af534734353e5177a513695c8f7` + cache fix aynı içerik.

## 3D Goal
3C motoruna seçilmiş içerik: 24 olay + 5 gecikmeli zincir. Patlama itiraftan değil görünürlükten. Evlilik, çocuk, otonom NPC, feed, grafik yok.

## Current 3C Contract
Kaynak: social.js, state.js, events.js.
- yakınlık `relationships[id]`; güven/gerilim `person.social`
- evre türetilir: family / partner / romantic_interest / close / friend / work_contact / acquaintance
- görünen: "Romantik ilgi"
- 6 eylem: meet confide help repair fulfill_promise advance_romance
- WEEKLY_ACTIVITY_LIMIT=2; bakım 5/8/12 hafta
- NPC hafıza cap 50 `{id,type,week,year,text,metadata?}`
- openCases social-obligation due+3 → social_promise_due
- Aylin anne, Murat baba, Mehmet mehmet, Elif elif (romance_available)
- normalizeSocialState tag kilidi
- SAVE_VERSION=5 migrateV4; 111 test
- loan_repayment Mehmet 1500 sabit
Yeni NPC yok. Aile romantizm yok. Tek partner.

## Event Density
Haftada en fazla 1 yeni 3D sosyal event. Öncelik: job_start / education_completed / social_promise_due / loan_repayment > zincir > standalone. Zincir halkası önceki memory type veya flag yoksa false. cooldown ≥12 veya once.

## Tone
Kısa, somut TR. Terapi / red flag / HR yok.
Kötü: "Finansal davranışlar güven sorununa yol açtı."
İyi: "Sana 2.500 duruyor. Akşam story'de yeni telefon."

## Accepted Engine Additions
1. scheduleSocialFollowup — openCases sarmalayıcı, type social-followup | personal-debt, payload {personId,amount?,memoryType?,flag?,witnessPersonId?}. v6 yok.
2. personal-debt amount. loan_repayment 1500 kırılmaz.
3. hasNpcMemory(state,id,type). metadata zaten var.
Görünürlük=flags+metin. Yetişkin=flags.sleptWithElif, protectionTalked, pregnancyFear, familyKnowsElif.

## Deferred
Kişilik tag persist, NPC graf, feed, EX/flatmate/patron NPC, evlilik/çocuk, ikinci partner, v6.

## Save
SAVE_VERSION 5 kalır. migrateV4 dokunulmaz.

## Selected 24 Events
effects şeması mevcut: money health relationships social flags memory npcMemory. Event haftalık action tüketmez.

### Friendship
S3D-FRD-01 gece ara | mehmet friend+ trust≥45 week≥3 | "Mehmet 00:40'ta aradı. Kafam kötü, gelebilir misin." | A Gel money-80 energy-12 closeness+8 type night_showed_up | B Telefon energy-4 | C Yarın trust-4 tension+6 type night_refused +4h | A motor
S3D-FRD-02 taşınma | week≥8 | "Öğlen kamyonet. İki saat yeter." | A Git money-250 type helped_move | B Bahane type skipped_move +10-16h payback | C Nakit money-400
S3D-FRD-03 taraf | mehmet+elif | "Mehmet, Elif arkandan konuşmuş." | A/B taraf | C karışmam | type took_side +6-12h | B adapt (3. NPC yok)
S3D-FRD-04 ihmal | mehmet gap>12 cooldown 16 | "bir şey mi var" | A Plan | B Yoğun | C Görüldü type ignored_ping

### Romance (elif)
S3D-ROM-01 ne olduk | interest ≥3h | "Bu ne şimdi." | A partner eşik | B akış flag elifUndefined | C kes closeness-12
S3D-ROM-02 aile evi kalma | family home | "Kapı sesi yapmam." | A olmaz | B kaçak flag elifSleptOverSecret +2-6h FAM/SOC | C otel money-600
S3D-ROM-03 beğeni | partner | eski deniz foto | A sor | B yoksay | C sorgula tension+10 +4h
S3D-ROM-04 ihmal | partner gap>5 | "Bu hafta da yoksun." | A plan money-200 | B iş | C tartış

### Family
S3D-FAM-01 01:10 | family week≥2 | "Nerede kaldın." | A yalan lateHomeLie | B doğru | C Elif'i söyle familyKnowsElif | D oda
S3D-FAM-02 maaş | family week≥6 | "Kasa yine ince." | A dök | B biriktiriyorum | C benim param
S3D-FAM-03 evlilik kahvesi | week≥20 family | "Komşunun kızı/oğlu." | A yok | B gizle | C kariyer careerShield | D otur
S3D-FAM-04 bayram | week 16 veya 40 | "Perşembe otobüs." | A git money-900 | B iş type missed_holiday | C bir gün

### Money
S3D-MON-01 2500 | mehmet friend+ balance≥2500 | "Kart yemedi." | A ver debt 2500 due+4 type lent_2500 | B yok | C 1000 | C motor amount
S3D-MON-02 düğün | week≥12 | kuzen + çeyrek | A 3500 type wedding_gold | B 800 | C bahane wedding_excuse
S3D-MON-03 anne para | family | "Sende duran var." | A 800 | B kira | C yalan moneyLieToMom
S3D-MON-04 maaş IBAN | jobId set weekOfMonth=1 | "Yattı ya. 600." | A ver | B yatmadı paydayLie | C sıra sende

### Visibility
S3D-SOC-01 story telefon | debt pending | "2.500 duruyor. Yeni telefon kılıfı." | A ne zaman | B like | C sil/forgive
S3D-SOC-02 aile grubu foto | partner veya secret stay family | "Bu kim evlat." | A komşu | B sessiz | C itiraf familyKnowsElif
S3D-SOC-03 görüldü | elif interest/partner | mavi tik 4 saat | A yoğun musun | B bekle | C sen de
S3D-SOC-04 konum | partner veya secret | 23:40 kafe | A kapat yalan | B buradayım | C fark etme +1-3h

### Adult
S3D-ADT-01 evde kimse yok | elif interest/partner | "Kal bakayım." | A kal+korunma sleptWithElif protectionTalked | B kal pregnancyFear | C çık
S3D-ADT-02 ertesi | sleptWithElif +1-3h | "Ne olduk şimdi." | A konuş | B ghost | C sadece o gece oneNightElif
S3D-ADT-03 korku | pregnancyFear +4-10h | sayım | A test money-180 fear kapanır (çocuk yok) | B sakla | C suçla
S3D-ADT-04 beraber yaşa | partner ≥8h family home | "Bir bakınsak." | A lookedForPlace | B ailem | C erken

## Selected 5 Chains
CHN-01 borç/story: MON-01 → W+4 SOC-01 → W+10 Elif "sen takma demiş" (lent_2500 şart).
CHN-03 referans sade: söz flag promisedMehmetRef → due+3 → +10-18h gave/broke. İşe alım rng yok.
CHN-08: ADT-01 veya ROM-02B → ADT-02 → FAM-01/SOC-02 veya ADT-03.
CHN-09: MON-02 → +2-6h masa hesabı → +8-16h karşılık; wedding_excuse ise Mehmet gelmez.
CHN-10: kept_secret → Elif sorar 2-8h → leak ise Mehmet öğrenir 6-14h.

## Cross-system
Para MON-01..04 CHN-01/09. İş MON-04 CHN-03 FRD-02. Eğitim FAM-03/04 active. Beden FRD-01 ADT-01 FAM-04. Konut FAM ROM-02 ADT-04 SOC-02.

## Acceptance
Bu dalda runtime yok. v5. 111 test korunacak şekilde tasarlandı. Density. Aile romantizm kapalı. Çocuk doğmaz.
