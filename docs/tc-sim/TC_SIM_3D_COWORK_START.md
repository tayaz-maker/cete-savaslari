# TC SIM — 3D Cowork Start

## COWORK FAST START

**Checkpoint:** `845bc19e316e0434ba9dac322c8698c639620c39` (main, bu dalın tabanı).
3C runtime içeriği: `d255c7dd` + cache `7d516a4`. Reset etme. Force push yok.

**Oku (sırayla):**
1. `docs/tc-sim/TC_SIM_3D_COWORK_START.md` (bu dosya)
2. `docs/tc-sim/TC_SIM_3D_IMPLEMENTATION.md`
3. `docs/tc-sim/TC_SIM_3D_TEST_PLAN.md`
4. `docs/tc-sim/TC_SIM_3C_POST_IMPLEMENTATION.md`
5. `public/games/tc-sim/js/social.js`
6. `public/games/tc-sim/js/events.js` (`EVENT_DEFINITIONS`, `processDueOpenCases`, `resolveEvent`)
7. `public/games/tc-sim/js/state.js` (`addNpcMemory`, `flags`, `openCases`, `SAVE_VERSION=5`)
8. Seçilmiş metin: `TC_SIM_3D_IMPLEMENTATION.md` § Selected 24 / 5 Chains

**Muhtemel yazılacaklar (3D runtime işi; bu dalda henüz yok):**
- `events.js` — 24+zincir tanımı, due-case → event
- `social.js` — `scheduleSocialFollowup`, `hasNpcMemory`
- `state.js` — yalnız helper; **SAVE_VERSION 5 kalır**
- `scripts/tc-sim-3d.test.mjs` — yeni
- `scripts/tc-sim-longrun.mjs` — sosyal içerik kapalı kalabilir; regression kırılmasın

**Uygulama sırası:**
1. Helper’lar (hafıza sorgu + followup) + test
2. `personal-debt` case + SOC-01/MON-01
3. 24 event tanımı (condition sıkı)
4. 5 zincir halkası (halka 2 tek başına false)
5. Density: haftada ≤1 3D sosyal
6. 111 eski test + 3D test + 144/520/fuzz

**State ekleri:** yok. Flag string’leri ve `openCases.payload` yeter.

**Migration:** yok. `migrateV4` dokunma.

**İlk testler:** `hasNpcMemory`; debt persist/repay; delayed erken ateş yok; reload çift yok; aile romantizm hâlâ false; cap 50.

**İçerik kaynağı:** `TC_SIM_3D_IMPLEMENTATION.md` (kütüphane referans, kopyala şişirme).

**Zincirler:** CHN-01, CHN-03 (referans sade), CHN-08, CHN-09, CHN-10.

**Komutlar:**
```
node --test 'scripts/tc-sim-*.test.mjs'
node scripts/tc-sim-sim.mjs
node scripts/tc-sim-longrun.mjs
```

**YAPMA:** evlilik/çocuk/otonom NPC; sosyal grafik; feed; yeni NPC; v6; kişilik tag persist; `normalizeSocialState` tag kilidini “zenginleştirme”; pornografik metin; 170 olayın tamamı; bu dal dışında force push.

---

## Implementation DAG (12 adım)

1. **Helpers** `hasNpcMemory(state,id,type)`, `scheduleSocialFollowup(...)`. Import döngüsü yok (`state.js` saf kalır, helper `social.js`).
2. **Debt case** type `personal-debt`, payload `{personId,amount}`. `loan_repayment` 1500 davranışını kırma.
3. **Due routing** `processDueOpenCases` bilinmeyen type’ı yutmasın; `social-followup` / `personal-debt` `eventId` kuyruklar. `resolutionApplied` tek.
4. **Density guard** `countQueuedSocial3D(state)<1` veya `flags.lastSocial3DWeek===week` ise yeni standalone false. Zincir due-case istisna (zaten kuyrukta).
5. **Friendship 4** S3D-FRD-01..04. NPC `mehmet` (+03 elif).
6. **Family 4** FAM-01..04. `homeId==="family"`.
7. **Money 4 + CHN-01** MON-01..04, SOC-01 halka 2.
8. **Romance 4** yalnız `elif`. `romance_available` + mevcut partner kuralları.
9. **Visibility 4** SOC-02..04 + grup foto. Witness = flag / elif metni, yeni kişi yok.
10. **Adult 4 + CHN-08** flag `sleptWithElif` vb. `becomePartner` aileye açılmaz.
11. **CHN-03, 09, 10** halka condition’ları memory/flag zorunlu.
12. **Test + longrun + metin pass** terapi/HR yok. 111 yeşil.

Her adımda `validateState` ok. Event `choices.effects` mevcut şema.

## Dosya sınırı
`public/games/tc-sim/js/{events,social}.js` + yeni test. `app.js` yalnız yeni event başlığı taşırsa. `save.js` hayır.
