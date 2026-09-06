# TC SIM: DEVLET — Current Reuse Delta

Audit pass only. `TC_SIM_DEVLET_MASTER.md`, `TC_SIM_DEVLET_HANDOFF.md`, `TC_SIM_DEVLET_REUSE_PLAN.md`, and `TC_SIM_DEVLET_ROADMAP.md` are preserved unchanged — they remain the source of truth for DEVLET's vision, DNA, entropy, institutions, event language, archive, and every other system. This file updates only the **reuse map**, checked against the runtime TC SIM/Racon/Hanedan code as it exists today (this repo, `main`), not the descriptions in older docs.

## What changed since `TC_SIM_DEVLET_REUSE_PLAN.md` was written

`TC_SIM_DEVLET_REUSE_PLAN.md` already correctly identifies the right *categories* (save/migration reusable, time/event/dashboard adaptable, openCase/memory conceptual, personal-life content not portable). This delta adds the concrete, current function/field names so a builder doesn't have to reverse-engineer them from source before starting Sprint 0.

## Updated reuse map (concrete, current)

| DEVLET need | Current concrete reference | Notes |
|---|---|---|
| Save validation | `src/game/save-validation.ts` (Çete's zustand implementation) and TC SIM's `validateState` in `public/games/tc-sim/js/state.js` | Two working references now exist (React/zustand style and vanilla style) — pick whichever matches DEVLET's eventual shell |
| 3-slot standard | `src/lib/save-slots.ts` (Çete) + the vanilla `tariklab::<game>:<slot>` pattern now live in Hanedan/Bükücü/Racon/TC SIM (`public/games/*/index.html`, `public/games/tc-sim/js/save.js`) | The REUSE_PLAN's "ayrı DEVLET state/save key'i" instruction is unchanged — DEVLET gets `tariklab::tc-sim-devlet:<slot>`, never touching TC SIM's own key |
| Deterministic engine | `nextRandom(state)` in `public/games/tc-sim/js/state.js` — a seeded PRNG carried in state, not `Math.random()` | Confirms REUSE_PLAN's "deterministik motor" principle is not aspirational — it is the actual, current, load-bearing pattern across every persistent TarikLab game as of this session's closure work |
| openCase / delayed consequence | `state.openCases[]` in TC SIM's `events.js`, shape `{id, sourceCaseId, status}` | REUSE_PLAN's "dosya dolabı, uyuyan dosya" translation of this concept is architecturally sound; no change needed |
| Capped history/memory | `addMemory`/`addNpcMemory`/`addEventHistory`/`addYearHistory` in TC SIM `state.js`; Hanedan's `kronik[]` (capped 80)/`news[]` capped-array pattern | Direct precedent for DEVLET's Arşiv (§30) and Kurumsal Hafıza (§36) bounding — cap explicitly, never let an archive grow per-tick unbounded |
| Weekly/monthly management loop | Racon Manager's job/task queue + `lig{sezon,fikstur,hedefler}` season/fixture structure (`public/games/racon/index.html`) | New reference not in the original REUSE_PLAN (Racon's current save format didn't exist in this shape when REUSE_PLAN was written) — DEVLET's Aylık Oyun Döngüsü (§48) briefing→assignment→crisis cadence maps cleanly onto Racon's week→job-queue→fixture-result cadence, at the "conceptual pattern" level only, per REUSE_PLAN's own instruction not to extract a shared engine yet |
| readOnly/always-reachable actions | Hanedan's `readOnly` action whitelist (help/save/slot-switch stay clickable mid-raid) | Directly relevant to DEVLET: help, save, and "Kim Devlet?" (§38) style meta-views should stay reachable even mid-crisis, matching this proven pattern |
| Help/credits UI pattern | `public/games/tc-sim/js/help.js` (pure render module, no state coupling) — the current in-game "Nasıl Oynanır" standard across all five shipping games | DEVLET's eventual help layer should follow this exact pattern: a pure function rendering static content, no gameplay-state coupling, so it can never mutate save state |

## What did NOT change (confirmed still accurate)
- TC SIM's personal-life systems (Body, relationships, household, career/education content) remain correctly excluded from DEVLET per REUSE_PLAN — nothing in this session's work changes that boundary.
- The "no shared engine extraction yet" discipline in REUSE_PLAN still holds — DEVLET copies/adapts patterns, it does not import a shared module from TC SIM or Racon.
