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

Organic openings are queue-only (`condition: () => false` + `organicCheck`) with week/age/job/exclusive gates. A six-week deterministic content slot prevents the production pool from starving them; arc counts, last-seen week and seeded tie-breaking distribute that slot without random spam. Due engine/case queues retain priority.

Delayed stages enqueue through bounded `flags.lifeContent.waiting[]`. The bag sanitizes corrupt/duplicate rows, records permanent resolved stamps, rejects unknown callbacks and safely skips removed actors. `takeDueLifeContent` fires at most one valid due callback per week when the event queue is empty; death never revives a callback. `activateNextEvent` and canonical `lifeDepth.pendingEffects` remain unchanged.

Final closure matrix: 40 seeds × 16 strategies × 720 weeks; 119/128 nodes seen, 48/49 chains started, 43 completed, all 10 arcs represented and all 12 exclusive families reached on both branches without contradictory siblings.
