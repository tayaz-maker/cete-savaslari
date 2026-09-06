# Kayıp Telefon — Sprint 0 Implementation Brief

Technical skeleton only. This game's Sprint 0 carries more UI-shell weight than the other three, since no existing shell fits — budget accordingly.

## Deliverables
1. **Route**: catalog entry in `src/lib/games.ts`, `status: "soon"` → real route. Recommend a fresh, purpose-built shell (React or vanilla — either is fine since nothing is being reused at the shell level; pick whichever the assigned builder is faster in) rather than adapting an existing game's shell.
2. **Decision to lock before coding starts**: single-case save vs. multi-slot save (see `00_PRODUCT_IDENTITY.md`/`02_STATE_AND_EVENT_CONTRACT.md`). Recommend single-case for V1 given the one-phone Sprint 1 target.
3. **State**: implement the schema from `02_STATE_AND_EVENT_CONTRACT.md`.
4. **Save key**: `tariklab::kayip-telefon:case` (or `:<slot>` if multi-profile is chosen).
5. **Core data structures**: `discoveredItems`, `unlockGates[]`, `contacts`, minimal phone-OS chrome (lock screen, home screen with 2–3 app icons, no real content).
6. **Deterministic helpers**: seeded PRNG for any randomized red-herring/ordering element, unit-tested.
7. **Bare UI shell**: phone frame renders, lock→home→one app transition works with placeholder content.
8. **Basic migration**: `v: 1` passthrough validator.
9. **Basic tests**: state creation, save/load roundtrip, gate-check unit tests, corrupt-save rejection.

## Explicitly out of scope for Sprint 0
Real phone-profile content, all 8 apps, ending logic, privacy-pressure tuning.
