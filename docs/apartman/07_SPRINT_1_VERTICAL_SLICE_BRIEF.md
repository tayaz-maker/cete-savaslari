# Apartman — Sprint 1 Vertical Slice Brief

Must prove the signature mechanic: **meeting + issue + resident + finance loop**. If Toplantı Gecesi isn't playable and consequential by the end of this sprint, the slice has failed regardless of how much else is built.

## Scope
- 12 apartments, 8–10 households (real trait/tendency variety, not 8 copies of one template)
- 8 weeks of play
- 1 major meeting at week 8
- 5 building systems (elevator, roof, plumbing, heating, entrance — pick the five with the most gameplay-visible failure states)
- 12–20 issue/event templates covering all 5 systems plus at least 3 pure-social (non-system) complaint types

## Acceptance for Sprint 1
- Player can reach week 8 having made at least 3 real issue-resolution decisions with visible trust/satisfaction consequences.
- The week-8 meeting has a real agenda (built from deferred issues across the 8 weeks, not scripted), a real vote using the bloc-alignment formula, and a real outcome that changes at least one persistent state field (kasa, binaSagligi, or a resident's satisfaction).
- Save/load works across the full 8-week span; slot isolation holds against a second concurrent playthrough.
- No fatal console errors, no horizontal overflow at 320–430px, meeting modal has internal scroll if agenda exceeds viewport.

## Explicitly out of scope for Sprint 1
Election/term-end arc beyond a single meeting, full 30–50 issue library, multi-meeting cadence, building-crisis forced-ending path (can exist as a stub, doesn't need full tuning).
