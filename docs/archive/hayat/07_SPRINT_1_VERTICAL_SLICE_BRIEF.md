# Hayat — Sprint 1 Vertical Slice Brief

Must prove the signature mechanic: **Long Shadow callback**. If a shadow created early in the slice does not visibly and consequentially resurface later within the same slice, the slice has failed regardless of how much chapter content exists.

## Scope
- Age range 18→35 (covers "leaving home," most of "work," and the start of "love"/"family" — enough chapters to create and resolve real shadows without needing the full 8-chapter set)
- 10–15 major decisions across that age range
- 5–8 of those decisions must be shadow-eligible, and at least 5 shadow callbacks must actually fire and resolve within the slice's age range (not just be created and left dormant — the slice must prove the *round trip*, not just shadow creation)

## Acceptance for Sprint 1
- At least 5 shadow callbacks fire during the age-18-to-35 run, each traceable to a specific earlier decision the player made.
- At least one callback visibly changes a later event or relationship state (not just a text acknowledgment).
- Save/load works across the age range; a shadow's dormant/reopened/resolved state survives a slot-switch-and-back roundtrip.
- Reload during an open callback does not re-roll which callback fires (exploit test from `04_TEST_CONTRACT.md`).
- No fatal console errors, no horizontal overflow at 320–430px, callback modal scrolls internally if needed.

## Explicitly out of scope for Sprint 1
Chapters beyond age 35 (ambition through legacy), full 40–80 decision library, full Life Report screen (a minimal end-of-slice summary is enough to prove the loop).
