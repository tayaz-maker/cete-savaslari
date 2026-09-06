# Kayıp Telefon — Test Contract

Inherits `docs/next-wave/SHARED_TEST_RELEASE_CONTRACT.md` in full. Additions below.

## Unit
- Gate-check function (prerequisite subset check) is pure and tested against fixture discovery sets, including the "exactly satisfied" and "over-satisfied" boundary cases.
- Privacy-pressure/owner-risk accumulation formulas tested at boundary values (0, threshold, 100).

## System
- Every app's content is reachable via some discovery path from the phone's initial locked state — a content-authoring linter/test that walks the gate graph from empty discovery and confirms all authored items are eventually reachable (no orphaned, permanently-locked content).

## Save/load
- `discoveredItems`/`unlockedApps`/`hypotheses` survive a save/reload roundtrip exactly.
- If slots are used: isolation between two phone-profile saves.

## Exploit
- Re-inspecting an already-discovered item must not re-raise `privacyPressure` a second time for the same discovery (duplicate reward/penalty, shared contract item — applies here as duplicate *penalty*, not just reward).
- Reload must not let the player "peek" at which ending a set of choices leads to and reload to pick differently, if the design intends endings to be locked in progressively rather than fully reversible until the final choice (decide explicitly in `02_STATE_AND_EVENT_CONTRACT.md` at Sprint 0 and test accordingly).

## Browser
Phone-frame rendering specifically tested at 320–430px (the primary target width) and at a representative desktop width to confirm the bounded-device-frame presentation, not a stretched layout.
