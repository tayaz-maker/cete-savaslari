# Son 100 Gün — UI, Navigation, Content Model

## Visual identity
Countdown/calendar aesthetic. The day counter and days-remaining must be the dominant visual element on every screen — increasingly compressed visual urgency as the run nears its end (e.g., a shrinking calendar-grid metaphor, intensifying color/urgency cues near milestone days). Distinct from Hayat's restrained diary tone and Apartman's bureaucratic ledger tone.

## Navigation
Minimal — a single-screen-per-day flow (today's obligations + action budget + resource strip) rather than a multi-tab dashboard. A secondary "Geçmiş" (history) view and a "Hedef" (scenario objective) view are the only other screens needed for V1.

## Mobile behavior
Single-column, mobile-first by construction (the "one screen per day" structure naturally fits narrow viewports). No horizontal overflow at 320–430px; milestone banners must not block interaction (dismissable, non-modal where possible).

## Content model
- **Scenarios**: 3–5 for V1 (Section 27 target), each defining a starting state, objective, and a pool of scenario-specific obligation templates.
- **Obligation templates**: 60–100 for V1 across all scenarios, each `{kind, dueDayOffset, escalatesAfter, resolutionOptions: [{label, cost: {money?, energy?, time}, outcome}]}`.
- **Milestone reflection beats**: one short forced narrative moment per milestone (75/50/25/10/3/final) — 6 per scenario, so 18–30 total for V1.

## Dead-control discipline
Every obligation-resolution option must show its exact time/money/energy cost before the player commits — this is not just a UI nicety, it is the signature mechanic (Section 14's "clear disabled reasons" rule applies doubly here: an option the player can't afford must say why, not just grey out).
