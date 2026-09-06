# Apartman — Test Contract

Inherits `docs/next-wave/SHARED_TEST_RELEASE_CONTRACT.md` in full. This file adds only what's genuinely Apartman-specific.

## Unit (game-specific additions)
- `binaSagligi` derived-average calculation is pure and tested against fixture system-health arrays.
- Vote-bloc alignment calculation (influence + alliances/conflicts graph) is pure and tested for a fixed seed producing a fixed outcome.
- Trust/legitimacy decay/growth formulas tested at boundary values (0, 100, and the re-election threshold).

## System
- Meeting only becomes reachable at the configured cadence week — test that it's unreachable before and reachable at/after.

## Save/load (game-specific)
- A resident's `borc` (arrears) and `alliances`/`conflicts` survive a slot-switch-and-back roundtrip unchanged.
- `deferredIssues[]` resolves correctly across a save/reload that happens between "deferred" and "meeting resolved."

## Exploit (game-specific)
- Voting twice on the same agenda item in one meeting session (double-click on a vote button) must not double-count.
- Deferring the same issue to the meeting agenda twice must not create two agenda entries for one issue.

## Browser
- Meeting/vote modal specifically: internal scroll with a long agenda (10+ items), reachable close, no viewport overflow at 320px.
