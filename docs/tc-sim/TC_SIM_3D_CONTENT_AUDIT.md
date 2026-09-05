# TC SIM — 3D içerik denetimi
Kaynak: araştırma kütüphanesi × gerçek 3C runtime (`7d516a4` 3C final, HEAD `845bc19`).
Sınıflar: A şimdi / B içerik sadeleştirme / C küçük motor / D ertele.

## Gerçek motor (özet)
- NPC sabit 4: `anne` Aylin (family), `baba` Murat (family), `mehmet` arkadaş, `elif` tanıdık + `romance_available`.
- Eksen: `relationships[id]` = yakınlık; `people[].social.trust|tension`.
- Evre türetilir: family / partner / romantic_interest / close / friend / work_contact / acquaintance.
- Hafıza: `addNpcMemory(text, type, metadata)` cap 50; oyuncu `addMemory` cap 200.
- Gecikme: `openCases` `{type, dueWeek, eventId, payload, status, resolutionApplied}`.
- Bayrak: serbest `state.flags`.
- Haftada 2 karar; sosyal bakım haftada 1; event cooldown/once/repeatable.
- `normalizeSocialState` tag ve roleId’yi varsayılana kilitler. Yeni kişilik tag’i persist etmez.
- Save v5. `loan_repayment` Mehmet 1500 sabit.

## Kütüphane sınıflaması

| Dilim | A | B | C | D | Not |
|---|---|---|---|---|---|
| MIC 01–60 | 28 | 24 | 2 | 6 | D: ev arkadaşı, patron tanıdığı, uni sınıfı, 5. NPC |
| FRD 01–20 | 8 | 8 | 0 | 4 | D: asker uğurlama sistemi, mahalle çetesi, 3. arkadaş |
| ROM 01–20 | 6 | 10 | 1 | 3 | D: ikinci partner, EX NPC, evlilik |
| FAM 01–15 | 8 | 5 | 0 | 2 | D: miras motoru, görücü sistemi |
| MON 01–15 | 6 | 6 | 2 | 1 | C: miktarlı kişisel borç |
| SOC 01–15 | 2 | 11 | 0 | 2 | D: feed sim, anonim ifşa ağı |
| ADT 01–15 | 4 | 8 | 1 | 2 | D: foto sızıntı motoru, oda arkadaşı mahrem |
| CHN 01–10 | 0 | 5 | 3 | 2 | D: CHN-04 flatmate, CHN-05 EX |

Toplam tarandı: 170 madde.
A ≈ 62 · B ≈ 77 · C ≈ 9 · D ≈ 22.

## D örnekleri (bilinçli)
- CHN-04 ev arkadaşı: `FLATMATE` yok; konut `family|shared|studio` ama 5. NPC yok.
- CHN-05 eski sevgili: ROLE_EX yok.
- FRD-10 asker: yoklama/bedelli sistemi yok.
- Kişilik tag motoru: `normalizeSocialState` tag’i ezer.
- Sosyal grafik / çay halkası NPC’si yok.

## 3D’ye alınanlar
24 standalone + 5 zincir. Hepsi A veya B; borç ve gecikme C’nin minimum hâli (`personal-debt` payload + mevcut openCase).
