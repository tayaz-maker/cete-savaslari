# Son 100 Gün — Test Contract

Inherits `docs/next-wave/SHARED_TEST_RELEASE_CONTRACT.md` in full. Additions below.

## Unit
- Milestone-threshold detection (75/50/25/10/3/final) is pure and tested at every boundary (day 74/75/76, etc.).
- Obligation escalation timing (`dueDay + escalatesAfter`) tested for off-by-one correctness — this is the single most exploit-prone calculation in the game.

## Save/load
- An obligation mid-escalation-window survives a save/reload without its escalation timer resetting or double-firing.

## Exploit
- Reload must not let the player "preview" an obligation's probabilistic outcome and reload to avoid a bad roll (reload-reroll, shared contract item) — verify explicitly since Son 100 Gün's whole tension depends on this holding.
- Milestone reflection beats must not be re-triggerable by save/reload around the milestone day.

## Long-run
Not applicable — 100 days is short enough that no separate long-run stress test is required (per shared contract's exemption for short-length games).

## Browser
Day-transition screen and milestone banners specifically tested at 320px for readability and no overflow.
