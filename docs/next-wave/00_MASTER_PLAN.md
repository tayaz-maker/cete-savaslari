# TarikLab Next Wave — Master Plan

Design/contract lock for the next five TarikLab games. **Docs only — no runtime code in this pass.** Branch: `sonnet/tariklab-next-wave-architecture`, based on `main` at the SHA recorded in the final report. Astra's production closure work on the current catalog is untouched.

## The five games

1. **Apartman: Apartman Yöneticisi** — management sim, reuses Racon Manager's weekly-management engine.
2. **Son 100 Gün** — life sim under hard time scarcity, reuses TC SIM's time/event/save engine.
3. **Hayat** — one life, consequence-dense, reuses TC SIM's engine but far smaller in breadth.
4. **Kayıp Telefon** — investigation/discovery game, custom UI, borrows event/log/modal patterns.
5. **TC SIM: DEVLET** — the state-as-organism sim; existing 2452-line vision doc (`docs/tc-sim-devlet/TC_SIM_DEVLET_MASTER.md`) preserved as-is, audited for reuse-map/Sprint-0/1 delta only.

## Master reuse principle

Reuse the **engine family**, not the product identity. Five proven TarikLab engine families exist in the current codebase (verified against runtime, not old docs):

| Family | Reference game | What's actually reusable (verified in source) |
|---|---|---|
| Life Sim | TC SIM (`public/games/tc-sim/js/`) | `state.js` (createNewGame, transact, addMemory/addNpcMemory/addEventHistory/addYearHistory, `openCases[]`, `validateState`, seeded `nextRandom`), `wealth.js` (lifestyle/investments/properties/debts/netWorth), `lifetime.js` (death/Life Report/generation), `save.js`, `help.js` modal pattern |
| Management Sim | Racon Manager (`public/games/racon/index.html`) | nickname→origin→night onboarding, weekly job/task queue, `people[]`/`streets[]` roster-and-territory cards, `lig{sezon,fikstur,hedefler}` season/fixture structure, `inbox[]` message log, pause/menu sheet UI |
| Generational/Risk | Hanedan (`public/games/hanedan/index.html`) | draft/squad-build flow, season/week/tier/pts league ladder, `kronik[]`/`news[]` capped history arrays, sheet/modal primitives (`openSheet`/`openModal`), `readOnly` action whitelist so help/save/slot stay reachable mid-crisis |
| Shared-device/Turn | Son Mahalle Bükücü (`public/games/bukucu/index.html`) | turn order, board flow, auction/trade, RULES-array help pattern, hotseat 2–4 player state |
| Character Street RPG | Çete Savaşları (`src/game/store.ts`, zustand) | personal progression, jobs/crew/heat/turf, `save-slots.ts` + `save-validation.ts` (the canonical 3-slot implementation), Radix `HelpPanel` |

Shared infrastructure verified across **all five current persistent games** (Çete, Hanedan, Bükücü, Racon, TC SIM): the `tariklab::<game>:<slot>` localStorage namespace, a `tariklab::<game>:active` pointer, a `tariklab::<game>:legacy-migrated` one-shot flag, and corrupt-JSON-is-skipped-not-crashed handling. This is the **3 Save Slot standard** every new persistent game should adopt (see `REUSE_FIRST_STANDARD.md`).

## Development order (locked)

1. Apartman
2. Son 100 Gün
3. Hayat
4. Kayıp Telefon
5. TC SIM: DEVLET

**Why this order:** Apartman is the most direct Racon-engine port (lowest risk, fastest reuse validation) and comes first to prove the "adapt a management-sim engine into a new identity" pattern. Son 100 Gün and Hayat both adapt the TC SIM engine but in opposite directions (scarcity vs. lifespan compression) — building both back-to-back sharpens the shared TC-SIM-derived contract before it hardens into a de facto standard. Kayıp Telefon is deliberately last among the four originals because it needs the most custom, non-reused UI and should benefit from whatever shared conventions (event log, modal decision structure) the first three settle. DEVLET is last because it is the largest, most architecturally novel game (institutional memory, actual/reported/known, implementation rate) and should only start heavy implementation once the reuse-first discipline from the first four is proven in production, not just on paper.

## Identity firewall — cross-game overlap check (Section 28)

| Question | Answer |
|---|---|
| Same core loop in any pair? | No. Apartman = meeting/issue cycle; Son 100 Gün = daily scarcity ledger; Hayat = chapter/shadow-callback cycle; Kayıp Telefon = discovery-graph exploration; DEVLET = monthly briefing/implementation cycle. |
| Same UI metaphor in any pair? | No. Notice-board/ledger (Apartman) vs. shrinking calendar (Son 100 Gün) vs. diary/archive (Hayat) vs. phone OS (Kayıp Telefon) vs. official dossier/dashboard (DEVLET). |
| Same progression in any pair? | No. Apartman = legitimacy/term; Son 100 Gün = resolved goals, no XP; Hayat = shadow resolution + life chapters; Kayıp Telefon = discovery completion + ending; DEVLET = existing DNA/entropy/implementation-rate system (untouched). |
| Same signature mechanic in any pair? | No. Toplantı Gecesi / Time Scarcity / Uzun Gölge / Discovery Graph+Privacy / Actual-vs-Reported-vs-Known — five distinct mechanics, none overlapping. |
| Is any game a reskin of TC SIM or Racon? | No. Son 100 Gün and Hayat both start from the TC SIM engine but diverge hard: Son 100 Gün strips the dashboard to a scarcity ledger with forced obligations; Hayat strips it further to ~6 core resources plus the shadow-callback system TC SIM does not have. Apartman takes Racon's weekly-management loop but replaces personal-crew-and-turf with resident-and-building-systems, and adds the vote/meeting layer Racon has no equivalent of. |
| Does any proposed system duplicate something TarikLab already solves? | No new save-slot system, no new event-engine paradigm, no new modal/sheet UI primitive was invented — all four originals cite an existing implementation to adapt (see each game's `01_REUSE_ARCHITECTURE.md`). |

**PASS** — no unresolved overlap.

## Cost discipline note

Per-game docs are contracts and schemas, not essays. Shared rules live once in `REUSE_FIRST_STANDARD.md`, `MODEL_ASSIGNMENT.md`, and `SHARED_TEST_RELEASE_CONTRACT.md` and are referenced, not repeated, from each game's docs.
