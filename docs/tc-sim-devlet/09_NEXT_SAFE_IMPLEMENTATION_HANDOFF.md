# TC SIM: DEVLET — Next Safe Implementation Handoff

Audit conclusion + build-ready delta. Read alongside `TC_SIM_DEVLET_MASTER.md` (vision, unchanged), `TC_SIM_DEVLET_ROADMAP.md` (phase sequence, unchanged), and `08_CURRENT_REUSE_DELTA.md` (concrete reuse references, this pass).

## Vertical slice: locked to 2002–2005

`TC_SIM_DEVLET_ROADMAP.md`'s Aşama 1 and `TC_SIM_DEVLET_MASTER.md` §62 both name **2002–2005** as one of two acceptable prototype eras (the other being 1980–1983). This task's own handoff instructions (Section 10) lock it to **2002–2005** specifically. This is a narrowing, not a contradiction — no existing doc content needs to change, only the ambiguity between the two options is resolved. **Do not expand to 1923–2030 or add other eras until 2002–2005 is a complete, playable, tested vertical slice** (Roadmap Aşama 1 → Aşama 2+ gate).

## Signature mechanics reconfirmed (unchanged, must survive Sprint 0/1 exactly)
- Actual vs. Reported vs. Known (§11 Bilgi Kalitesi)
- Implementation rate (§13 Gerçek Uygulama Oranı — a decision is never auto-applied; center support × ministry execution × field acceptance × provincial implementation compounds into a real, often much lower, implementation percentage)
- Institutional memory (§36 Devlet Hafızası / Halk Hafızası)
- Policy debt (§26 Politika Borcu)
- State entropy (§9 Devlet Entropisi)
- Paper Turkey vs. Real Turkey (§10 Kağıt Türkiyesi / Gerçek Türkiye)
- Incomplete information, Archive (§30)

## Architecture guard (unchanged, reconfirmed)
Player is the **state**, not a president, party, army, or ideology. Every screen/mechanic added at Sprint 0/1 must be checkable against this guard — a mechanic that only makes sense if the player *is* a specific leader or party has failed the guard.

## Sprint 0 readiness — audit result

The existing docs (Roadmap Aşama 0: "Tasarım kilidi ve TC SIM reuse incelemesi") describe Sprint 0's *intent* correctly but not in the concrete, buildable-today contract shape this task's Section 24 standard requires. Translating:

| Section 24 Sprint 0 requirement | DEVLET status |
|---|---|
| Route | Not yet defined — needs a catalog entry (`src/lib/games.ts`, currently `tc-sim-devlet` listed as `status: "soon"`) and a route decision (vanilla single-file vs. React; recommend vanilla given the dashboard-of-screens shape closer to Racon/Hanedan than Çete's tabbed React shell) |
| State | §5 (Ana Devlet Göstergeleri) and §6 (Devlet DNA'sı) define the *shape* of state; a concrete TypeScript-style schema translating those into `{capacity, legitimacy, socialHeat, consent, institutionality, entropy}` plus per-institution fields is the one genuinely missing artifact — **recommended as the first Sprint 0 task** |
| Save key | Not yet defined — `tariklab::tc-sim-devlet:<slot>` per the updated reuse map |
| 3-slot compatibility | Not yet decided whether DEVLET needs 3 slots (a single long campaign per era vs. parallel eras) — recommend yes, matching every other persistent TarikLab game, since a player will plausibly want to try 2002–2005 more than once with different early decisions |
| Core data structures | §14 (Kurumlar) defines institution fields (kapasite, profesyonellik, bütçe, siyasi bağlılık, otonomi, itibar, yolsuzluk riski, kurumsal hafıza, personel kalitesi) precisely enough to implement directly — no gap here |
| Deterministic helpers | Reuse `nextRandom`-pattern per `08_CURRENT_REUSE_DELTA.md`; genuinely new work is wiring the implementation-rate compounding (§13) to be deterministic-from-seed, since it's the single highest-value exploit surface (a reload-and-retry on a bad implementation roll would undermine the entire game's honesty about how states actually work) |
| Bare UI shell | §50 (Ana Ekranlar) lists 11 named screens (Mühür Masası, Atama Tahtası, Kurumlar, Sır/Ağ Haritası, Hortum Haritası, Isı Haritası, Dosya Dolabı, Arşiv, Dış Kablo, Devlet Formu, DNA, Kelebekler) — §62's own Sprint-0-equivalent guidance correctly says the *first* prototype needs only Mühür Masası + 5 kurum + basic event/uygulama-oranı/arşiv, not all 11 |
| Basic migration | No legacy format exists; `v: 1` passthrough validator, same as the other four next-wave games |
| Basic tests | Not yet written — implementation-rate compounding formula and the actual/reported/known divergence calculation are the two functions that most need direct unit tests from day one, given how exploit-sensitive both are |

**Sprint 0 readiness: mostly build-ready.** The one real gap is a concrete state schema translating §5/§6/§14 into implementable fields — recommend this be the literal first file Luna writes at Sprint 0 kickoff, reviewed against this handoff before coding continues.

## Sprint 1 readiness — audit result

§62's own vertical-slice scope (Mühür Masası, 5–7 göstergesi, 5 temel kurum, 10–20 karakter, atama, event motoru, toplumsal ısı, ekonomi, uygulama oranı, basit arşiv) already matches this task's Section 25 requirement ("must prove: implementation rate + actual/reported/known + institutions") almost exactly. **No redesign needed.** The only addition this handoff makes: an explicit acceptance checklist, since the existing docs describe scope but not a pass/fail bar.

### Sprint 1 acceptance (new, not previously specified)
- A player decision produces a visibly different `reported` value than the `actual` value at least 3 times across the slice.
- At least one decision's implementation rate compounds through all four stages (center support → ministry execution → field acceptance → provincial implementation) with the final rate meaningfully below 100% and visibly explained, not just a single opaque number.
- At least 5 institutions have distinct, visible capacity/legitimacy/autonomy states that affect outcomes differently from each other (not 5 institutions that behave identically with different names).
- Save/load preserves institutional memory and archive entries across a reload without re-rolling any pending implementation-rate outcome.
- No fatal console errors, no horizontal overflow at 320–430px, on whatever UI shell Sprint 0 chose.

## Next safe base

Once Sprint 0's state-schema gap is closed and Sprint 1's acceptance checklist above is met, DEVLET is ready for Luna-led core implementation per `docs/next-wave/MODEL_ASSIGNMENT.md`. No further architecture-level redesign is indicated by this audit — the existing 2452-line master vision is sound and internally consistent with how TarikLab's current engines actually work.
