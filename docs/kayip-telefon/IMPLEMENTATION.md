# Kayıp Telefon — implemented contract (Wave 3)

This file records repository truth. The numbered sprint files are historical planning inputs.

- Route: `/oyna/kayip-telefon`
- Runtime: custom vanilla phone UI using the shared Next Wave three-slot host.
- Save keys: `tariklab.nextwave.kayip-telefon.slot1` through `slot3`.
- Schema: `meta.version = 2`, migrated idempotently from valid V1 phone saves. Foreign and structurally corrupt payloads are rejected.
- Apps: messages, contacts, calls, photos, notes, calendar, files and voice recordings.
- Investigation: evidence is typed, pinnable and linkable. Five critical facts each have at least two authored evidence paths.
- Theory: three player-authored questions use weak, supported, strong, conflicted and refuted states. Confidence is shown without selecting an answer.
- Variation: persisted `caseSeed` and `caseLayout` deterministically vary plausible app placement, message detail and three-to-five active side-secret threads.
- Endings: the existing five ending identities remain. Evidence, theory quality, decision and privacy produce a deterministic `caseReport`.
- Bounds: history/timeline 80, evidence links 64, pins 20; authored collections are finite.

The lone password-style prerequisite (`lock_note` after `note_pin`) is optional privacy content. It is not part of a critical-fact path and cannot soft-lock the case.
