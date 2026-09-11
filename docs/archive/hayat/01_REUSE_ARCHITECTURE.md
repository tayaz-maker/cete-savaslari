# Hayat — Reuse Architecture

## Reuse map

| Existing TarikLab system | Reuse directly | Adapt | Do not reuse | Reason |
|---|---|---|---|---|
| Time | — | New compressed timeline: yearly chapters with quarterly turns inside them (final grain decided at Sprint 0, not TC SIM's weekly cadence) | TC SIM's `WEEKS_PER_MONTH`/`MONTHS_PER_YEAR` weekly-turn model | Signature mechanic needs years to pass fast enough for shadows to plausibly resurface "years later" within a reasonable playtime |
| Save (3-slot) | `tariklab::hayat:<slot>` scheme | — | — | Standard applies |
| Migration | Corrupt-save-skip pattern | — | — | Directly portable |
| Event engine | TC SIM's `openCases[]` shape as the base for shadows | Renamed `shadows[]`, `resolveWindow` is a wide multi-year range (`possibleFutureWindows: [ageMin, ageMax]`), not a fixed date | TC SIM's single-fire, short-window `openCases` semantics | Shadows are explicitly long-window and may fire probabilistically within their window, not at one fixed point |
| Memory/history | TC SIM's `addMemory`/`addEventHistory` capped-array pattern | Adapted into the shadow list itself (a shadow *is* a structured memory with future-facing hooks) | TC SIM's `addYearHistory`/generation continuation (no multi-generation concept in V1) | Hayat is one life, not a dynasty (that's Hanedan's territory) |
| Resources | TC SIM's `transact`/`adjustHealth` mutator pattern | Collapsed to ~6 fields: money, health, relationships, stability, time/age, commitments | TC SIM's full dashboard (career/education/household/investment/property/vehicle/wealth-lifestyle systems) | Explicit "fewer systems, more consequence density" mandate |
| UI shell | Shared Button/Dialog components | Diary/archive/chapter-based navigation, not TC SIM's tabbed dashboard | TC SIM's side-nav multi-tab layout | Signature mechanic and tone both call for a page-turning, restrained UI, not a live dashboard |
| Determinism | TC SIM's seeded `nextRandom(state)` | — | — | Directly portable — critical since shadow-resurfacing timing may be probabilistic within its window |
| Testing harness | `node --test` MJS+TS convention | — | — | Standard |

## Do-not-reuse list (explicit)
- TC SIM's full Body sub-simulation (multiple interacting body systems) — collapse to one `health` scalar.
- TC SIM's job/career/education/household/property/investment/vehicle/wealth-lifestyle systems — none survive at TC SIM's depth; at most a single `commitments` field tracks obligations abstractly.
- TC SIM's weekly decision-cap UI pattern.
- Hanedan's multi-generation continuation — Hayat is explicitly one life, no "next generation" mode in V1.

## Determinism/randomness policy
Shadow-resurfacing *whether* and *when within its window* uses the state-seeded PRNG — this must be deterministic from the save, since a shadow reopening is often the biggest single moment in a run and must not be reload-exploitable (reroll to avoid a bad shadow, or reload to force a good one). Which specific flavor text describes a routine life event may be unseeded.
