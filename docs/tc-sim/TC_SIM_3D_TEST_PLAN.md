# TC SIM — 3D test planı
Az, davranış. Yüzlerce test yok. Dosya: `scripts/tc-sim-3d.test.mjs` (Cowork yazar).

## MEMORY
- Event seçimi `addNpcMemory` type yazar (`lent_2500`, `kept_secret`, `night_showed_up`).
- Cap 50: 70 yaz, length 50 (3C.10 korunur).
- Aynı type iki kez yazılabilir; sorgu `some` ile yeter. Dedup zorunlu değil.
- Oyuncu `addMemory` metni somut (“2.500 borç verdi”), “iyi davrandı” değil.

## DELAY
- `dueWeek > now` iken followup event condition false / case pending.
- `absoluteWeek >= dueWeek` → `processDueOpenCases` bir id döner, status `triggered`.
- `resolveEvent` sonrası `resolutionApplied` true; ikinci resolve skor değiştirmez.
- save/load sonrası aynı case tek tetik.

## VISIBILITY
- SOC-02 yalnız `family` home veya ilgili flag ile.
- Mehmet sırrı Elif event’inde ancak `holdingMehmetSecret` / leak flag varken.
- Murat, Elif borcunu “bilmez”: baba condition’da `lent_2500` yok.

## DEBT
- MON-01 A: balance -2500, case `personal-debt` amount 2500.
- Collect: +2500, case resolved.
- Forgive: para dönmez, case resolved.
- SOC-01 condition: case pending (veya yeni forgive flag). Case yoksa event false.
- Eski `loan_repayment` 1500 hâlâ çözülür.

## TAGS
3D kişilik tag eklemez.
Bilinmeyen `person.tags` normalize’da varsayılana döner — bunu “düzeltmeye” kalkma.
Test: v5 roundtrip sonra elif hâlâ `romance_available`, anne hâlâ `family`.

## ADULT
- ADT-01 anne/baba’da yok (`setRomanticInterest` false kalır).
- `currentPartnerNpcId` elif iken ikinci partner hâlâ false.
- `sleptWithElif` partner zorunlu değil (interest yeter); family role asla.
- ADT-03 çocuk flag’i üretmez; fear kapanır.

## SAVE
- `SAVE_VERSION === 5`.
- v4 fixture hâlâ v5’e çıkar (3C.23).
- Flag + pending debt save/load.
- NaN tension normalize (3C.24).
- v6 yok.

## REGRESSION
```
node --test 'scripts/tc-sim-*.test.mjs'
```
Beklenen: mevcut 111 + yeni 3D seti. Eski id’ler kırılmasın.

## LONG RUN
- 144 hafta sim: açık event çözülsün, kuyruk şişmesin, balance finite.
- 520 hafta: memory cap, npc cap, openCases resolved birikimi.
- 20 seed × 260 fuzz: social 3D density ihlali yok (haftada >1 yeni standalone).

## Önerilen 16 test id
3D.1 hasNpcMemory true/false
3D.2 cap 50
3D.3 debt case persist
3D.4 debt collect once
3D.5 followup not early
3D.6 followup fires in window
3D.7 resolve once
3D.8 reload no dup
3D.9 witness isolation
3D.10 SOC-01 requires debt
3D.11 family romance blocked
3D.12 second partner blocked
3D.13 adult flag only elif
3D.14 save v5 unchanged
3D.15 density one per week
3D.16 CHN-01 step2 without step1 false
