# Son 100 Gün — Reuse Architecture

## Reuse map

| Existing TarikLab system | Reuse directly | Adapt | Do not reuse | Reason |
|---|---|---|---|---|
| Time | — | TC SIM's week/tick counter, adapted to a straight day counter (1–100) with milestone flags (75/50/25/10/3/final) instead of week/month/year layering | TC SIM's full calendar (weeks-per-month, months-per-year) | Son 100 Gün has no multi-year horizon; a flat day counter is simpler and matches the scarcity framing |
| Save (3-slot) | `tariklab::son-100-gun:<slot>` scheme | — | — | Standard applies |
| Migration | Corrupt-save-skip pattern | — | — | Directly portable |
| Event engine | TC SIM's `openCases[]` shape | Renamed `obligations[]`, `resolveWindow` measured in days-remaining, not calendar date | TC SIM's full body/relationship/household event library content | New scenario-specific obligation content, not TC SIM's life content |
| Action budget | TC SIM's `WEEKLY_ACTIVITY_LIMIT`-style capped-actions-per-period pattern | Adapted to a daily action budget (smaller, e.g. 1–2 actions/day given the compressed timeframe) | — | Same mechanism, new period |
| Resources | TC SIM's `transact`/`adjustHealth`-style mutator pattern | Adapted to the minimal Son 100 Gün resource set (money, energy, stress/body, relationships) | TC SIM's full dashboard (career/education/household/investment/property/vehicle systems) | Explicitly smaller breadth than TC SIM per Section 7 |
| History | TC SIM's `addMemory`/`addEventHistory` capped-array pattern | — | TC SIM's `addYearHistory`/generation/Life Report (no multi-generation concept here) | Son 100 Gün is a single 100-day run, not a lifetime |
| UI shell | Shared Button/Dialog components | Custom day-countdown-forward UI (calendar-style, shrinking visual), not TC SIM's tabbed dashboard | TC SIM's side-nav tab layout | Signature mechanic needs the countdown to be the dominant visual element, not one tab among many |
| Determinism | TC SIM's seeded `nextRandom(state)` | — | — | Directly portable |
| Testing harness | `node --test` MJS+TS convention | — | — | Standard |

## Do-not-reuse list (explicit)
- TC SIM's job/career/education/household/property/investment/vehicle systems — none fit a 100-day scope.
- TC SIM's Body sub-simulation depth (multiple interacting body systems) — collapse to one or two scalar resources (energy, stress) per `00_PRODUCT_IDENTITY.md`'s smaller-breadth mandate.
- Any multi-generation/Life-Report continuation mechanic.

## Determinism/randomness policy
Every probabilistic obligation-outcome roll (e.g., "will the loan shark accept the partial payment") uses the state-seeded PRNG. Reload must not re-roll an unresolved obligation outcome. Flavor text may be unseeded.
