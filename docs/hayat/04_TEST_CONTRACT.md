# Hayat — Test Contract

Inherits `docs/next-wave/SHARED_TEST_RELEASE_CONTRACT.md` in full. Additions below.

## Unit
- Shadow window-check (`age` within `[ageMin, ageMax]`) is pure and tested at boundary ages.
- Seeded resurface roll is deterministic for a fixed seed + fixed shadow — same seed always produces the same fire/no-fire result across repeated runs of the pure function.

## Save/load
- A dormant shadow's `resolutionState` and window survive save/reload unchanged; a shadow mid-callback-resolution does not reset or double-fire on reload.

## Exploit
- Reload during an open shadow-callback event must not let the player re-roll which callback content appears (reload-reroll, shared contract item) — this is the single highest-value exploit test for Hayat given the mechanic's centrality.
- Two shadows whose windows overlap and both become eligible on the same time-advance must both resolve correctly, not silently drop one.

## Browser
Shadow callback modal specifically tested for internal scroll and no overflow at 320px (callback text can be long — it's a "years later" narrative beat, not a one-line prompt).
