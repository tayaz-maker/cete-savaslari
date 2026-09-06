# Kayıp Telefon — Sprint 1 Vertical Slice Brief

Must prove: **discovery graph + privacy consequence**. If the player cannot feel both "I'm piecing together a hidden life" and "this intrusion has a cost," the slice has failed regardless of content volume.

## Scope (one complete phone, per Section 9's explicit "do not build procedural generation in Sprint 1")
- 6 contacts
- 3 message threads
- 20–30 discoverable items total (messages, photos, notes, files, call log entries)
- 1 hidden conflict (the phone owner's actual hidden problem, which the discovery graph is built around)
- 3 endings
- 30–45 minute target playtime

## Acceptance for Sprint 1
- Player can complete a full playthrough discovering enough of the graph to reach any of the 3 endings, depending on choices made.
- At least 2 pieces of content are gated behind a genuine multi-prerequisite unlock (not a single linear "find A then B" chain — the graph must actually branch/converge at least once).
- `privacyPressure`/`ownerRisk` visibly changes based on which items the player chooses to inspect, and this measurably affects which ending is reached.
- Save/load preserves discovery state exactly across a reload.
- No fatal console errors, no horizontal overflow at 320–430px, phone frame renders correctly at both mobile and desktop widths.

## Explicitly out of scope for Sprint 1
A second phone profile, procedural content generation, all 8 app types (a subset sufficient to house the 20–30 items is enough — e.g., Mesajlar, Aramalar, Fotoğraflar, Notlar for V1's first slice, with Takvim/Rehber/Dosyalar/Ses kayıtları added at Sprint 2 if the content calls for them).
