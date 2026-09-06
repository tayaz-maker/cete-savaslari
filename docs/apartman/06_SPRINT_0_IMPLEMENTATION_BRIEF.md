# Apartman — Sprint 0 Implementation Brief

Technical skeleton only. No content explosion.

## Deliverables
1. **Route**: catalog entry in `src/lib/games.ts` with `status: "soon"` flipped to a real route once Sprint 0 lands (`/oyna/apartman` if built as an HTML5-style single-file game reusing the vanilla pattern, or a React route under `src/routes/apartman.tsx` if built React-side — **decision needed at Sprint 0 kickoff**: Racon Manager, the primary reuse reference, is a vanilla single-file game; recommend following that precedent unless a concrete reason favors React).
2. **State**: implement the schema from `02_STATE_AND_EVENT_CONTRACT.md` as plain objects/functions, no UI yet.
3. **Save key**: `tariklab::apartman:<1|2|3>`, `tariklab::apartman:active`, `tariklab::apartman:legacy-migrated` (the last is a no-op flag set `"1"` immediately since there is no legacy format to migrate from).
4. **3-slot compatibility**: slot switch/create/load/delete wired to the same UI pattern as Hanedan/Bükücü/Racon (`data-act="slot:N"` or equivalent, per the chosen shell).
5. **Core data structures**: `building`, `residents[]`, `issues[]`, `deferredIssues[]` — populated with a minimal fixture (3–4 residents, 2 systems) sufficient for manual smoke testing, not full content.
6. **Deterministic helpers**: a seeded PRNG carried in state (`nextRandom`-equivalent), used by nothing yet except a unit test proving determinism.
7. **Bare UI shell**: 5 tabs render, no meeting/vote UI yet — that's Sprint 1.
8. **Basic migration**: `v: 1` passthrough validator that rejects malformed saves without crashing.
9. **Basic tests**: unit tests for state creation, save/load roundtrip, slot isolation, corrupt-save rejection.

## Explicitly out of scope for Sprint 0
Meeting/vote UI, issue-template content, resident personality content beyond the fixture, mobile polish beyond "doesn't overflow."
