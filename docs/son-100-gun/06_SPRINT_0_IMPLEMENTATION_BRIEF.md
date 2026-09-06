# Son 100 Gün — Sprint 0 Implementation Brief

Technical skeleton only.

## Deliverables
1. **Route**: catalog entry in `src/lib/games.ts`, `status: "soon"` → real route at Sprint 0 completion. Recommend the vanilla single-file pattern (like Racon/Hanedan/Bükücü/TC SIM) given the single-screen, non-tabbed UI — a full React shell is unnecessary weight for this UI shape.
2. **State**: implement the schema from `02_STATE_AND_EVENT_CONTRACT.md`.
3. **Save key**: `tariklab::son-100-gun:<1|2|3>`, plus active/legacy-migrated markers (legacy-migrated is a no-op flag, no prior format exists).
4. **3-slot compatibility**: standard slot switch/create/load/delete UI.
5. **Core data structures**: day counter, `obligations[]`, resource fields, one minimal scenario fixture for smoke testing.
6. **Deterministic helpers**: seeded PRNG, unit-tested for determinism.
7. **Bare UI shell**: single-screen-per-day layout renders with the fixture data, no real content yet.
8. **Basic migration**: `v: 1` passthrough validator.
9. **Basic tests**: state creation, save/load roundtrip, slot isolation, corrupt-save rejection, milestone-threshold unit tests.

## Explicitly out of scope for Sprint 0
Real scenario content, obligation-template library, milestone reflection writing, mobile visual polish beyond "doesn't overflow."
