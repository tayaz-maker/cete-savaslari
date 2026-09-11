# Hayat — Sprint 0 Implementation Brief

Technical skeleton only.

## Deliverables
1. **Route**: catalog entry in `src/lib/games.ts`, `status: "soon"` → real route. Recommend the vanilla single-file pattern given the chapter/diary UI shape (closer to Hanedan's sheet-based navigation than a full React dashboard) — final call at Sprint 0 kickoff.
2. **State**: implement the schema from `02_STATE_AND_EVENT_CONTRACT.md`.
3. **Save key**: `tariklab::hayat:<1|2|3>`, plus active/legacy-migrated markers (no-op flag, no prior format).
4. **3-slot compatibility**: standard slot UI.
5. **Core data structures**: chapter/age progression, `shadows[]`, `decisionsLog[]`, one minimal chapter fixture (leaving-home only) with 2–3 decisions for smoke testing.
6. **Deterministic helpers**: seeded PRNG including the window-check + resurface-roll functions, unit-tested.
7. **Bare UI shell**: chapter navigation renders with the fixture, no full content yet.
8. **Basic migration**: `v: 1` passthrough validator.
9. **Basic tests**: state creation, save/load roundtrip, slot isolation, corrupt-save rejection, shadow window/roll determinism.

## Explicitly out of scope for Sprint 0
Real decision/shadow content beyond the fixture, chapters beyond leaving-home, Life Report generation logic.
