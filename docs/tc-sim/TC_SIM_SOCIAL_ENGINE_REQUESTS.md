# TC SIM — Engine requests (denetim, 3D)
Önceki 8 istek × gerçek 3C kodu. Kaynak: `social.js` / `state.js` / `events.js` @ main `845bc19`.

## ER1 Somut memory
CURRENT SUPPORT: PARTIAL
`addNpcMemory(..., type, metadata)` ve cap 50 var. Metin serbest.
CONTENT NEED: zincir `hasNpcMemory(type)`.
MINIMUM CHANGE: helper, schema yok.
STATE CHANGE: yok.
SAVE IMPACT: none
MIGRATION: yok
TEST: 3D.1–2
DECISION: ADAPT WITHOUT ENGINE CHANGE

## ER2 Gecikmeli kanca
CURRENT SUPPORT: YES
`openCases` + `dueWeek` + `eventId` + `processDueOpenCases`.
CONTENT NEED: halka 2–3.
MINIMUM CHANGE: `scheduleSocialFollowup` sarmalayıcı.
STATE CHANGE: yok (yeni type string).
SAVE IMPACT: none
MIGRATION: yok
TEST: 3D.5–8
DECISION: ACCEPT 3D (helper)

## ER3 Sızdırma
CURRENT SUPPORT: NO (motor) / PARTIAL (flag+event)
CONTENT NEED: story, WA, komşu.
MINIMUM CHANGE: flag + delayed event metni.
STATE CHANGE: yok
SAVE IMPACT: none
DECISION: ADAPT WITHOUT ENGINE CHANGE

## ER4 Circle / tanık
CURRENT SUPPORT: NO
Dört NPC. Graf yok.
MINIMUM CHANGE: `payload.witnessPersonId` isteğe bağlı; Elif metni.
DECISION: ADAPT WITHOUT ENGINE CHANGE
Tam grafik DEFER.

## ER5 Sessiz sonuç + kota
CURRENT SUPPORT: PARTIAL
Event cooldown/once; haftada 2 action; invitation `engaged` ister.
CONTENT NEED: popup yağmuru olmasın.
MINIMUM CHANGE: `lastSocial3DWeek` flag.
DECISION: ADAPT WITHOUT ENGINE CHANGE

## ER6 Yetişkin bayrak
CURRENT SUPPORT: PARTIAL (`flags` serbest; `person.social` üç alan)
MINIMUM CHANGE: `sleptWithElif` vb. flags.
STATE CHANGE: yok
SAVE IMPACT: none
DECISION: ADAPT WITHOUT ENGINE CHANGE

## ER7 Kişisel borç
CURRENT SUPPORT: PARTIAL
`loan_repayment` Mehmet 1500 sabit.
CONTENT NEED: 2500 + story şartı.
MINIMUM CHANGE: type `personal-debt` payload.amount.
STATE CHANGE: yok
SAVE IMPACT: none
TEST: 3D.3–4, 3D.10
DECISION: ACCEPT 3D

## ER8 Kişilik tag
CURRENT SUPPORT: NO
`normalizeSocialState` tag’i `family|friend|peer|romance_available` kilidine çeker.
DECISION: DEFER
3D tag motoru yazmaz.

## 3D bütçe
ACCEPT: followup helper, personal-debt amount, (hafıza sorgu helper).
DEFER: tag, grafik, feed, v6, yeni NPC.
