# Hayat — UI, Navigation, Content Model

## Visual identity
Diary / archive / life-chapters aesthetic. Restrained, memory/document tone — closer to reading a life's record than playing a dashboard game. No stat bars dominating the screen the way TC SIM's or Çete's HUD does; resources shown quietly, chapters and shadows shown prominently. Distinct from Son 100 Gün's urgent countdown tone.

## Navigation
Chapter-based, linear-with-branches — not a persistent multi-tab dashboard. A "Gölgeler" (Shadows) view lets the player see dormant/reopened shadows without spoiling exactly when they'll resurface. A "Defter" (life record) view is the Life-Report-in-progress.

## Mobile behavior
Chapter/decision screens are naturally single-column and mobile-friendly. Shadow callback events use the same modal pattern as other TarikLab decision events (internal scroll, no overflow at 320–430px).

## Content model
- **Chapters**: 8 fixed (leaving home, work, love, family, ambition, loss, aging, legacy) for V1.
- **Major decisions**: 40–80 for V1 (Section 27 target), each tagged with whether it's shadow-eligible and, if so, its shadow's category/intensity/window template.
- **Shadow triggers**: 20–30 for V1 (Section 27 target) — the callback-event content that fires when a shadow's window+roll condition is met.
- Full lifespan content ships only after the Sprint 1 vertical slice (age 18→35) validates the mechanic.

## Dead-control discipline
A shadow that cannot yet resurface (window not open) should not be a visible "ticking clock" the player can game — the UI must not reveal exact resurface timing, only that a shadow exists and is dormant.
