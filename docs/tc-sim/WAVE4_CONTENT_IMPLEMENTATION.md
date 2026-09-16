# TC SIM Wave 4 — content-max implementation

Content-only pass on the frozen Wave 4 life engine. Catalog: `public/games/tc-sim/js/life-content.js`.

## Frozen (do not change)

- 10 life arcs and stage math
- commute zone model, CASH_FLOOR / arrears
- actor-memory core, education leverage once-per-life
- 4 engine delayed events in `life-depth.js`
- goals ≤6, pendingEffects ≤12, resolvedEffects ≤32
- Life Dossier outcome ids/math
- save v6, slot keys unchanged

## Added

- 128 event nodes / 49 chains / 12 exclusive families / 18 auto delayed callbacks
- Durable once-stamps in `flags.lifeContent.once` (survives the 32-ring)
- Content delayed callbacks live in `flags.lifeContent.waiting[]` — they do **not** occupy `lifeDepth.pendingEffects` (frozen 12-cap stays for engine echoes)
- Seeded exclusive sibling pick via `meta.rngState` so both siblings never appear in one run
- Actor voice overlay on people list/detail (anne, baba, mehmet, elif, burak, kardes, selin)
- Additive dossier flavor + 12 trace templates; outcome ids untouched

## Reachability

Organic openings are queue-only (`condition: () => false` + `organicCheck`) with week/age/job/exclusive gates and a 2-week spacer. They fire only when the production pool is empty, so they do not steal retirement/pregnancy/generic slots.

Delayed stages enqueue through `flags.lifeContent.waiting[]`. `takeDueLifeContent` fires at most one due callback per week when the event queue is empty. Auto-callbacks refuse when waiting is at 11. `activateNextEvent` is unchanged (original pool search).
