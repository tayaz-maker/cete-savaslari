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


## Wave 3 content-max (digital footprint)

Content-only expansion. Deduction math, five endings, intimate-file list, restrained 72-pressure solve, save keys and V2 schema are unchanged.

- Extra catalog lives in `public/games/next-wave/kayip-content.js` and is concatenated onto the existing 30 discoverables.
- Message density is a render overlay (`phoneThreads` + `MESSAGE_HEADS` / `THREAD_EXTRAS`). Extra bubbles are not copied into the save.
- `caseLayout.messageVariant` now ranges 0–5 on new cases. Old saves keep their stored 0–2 value.
- Mutually exclusive sibling clues persist in `caseLayout.exclusive` (derived from `caseSeed` for older saves).
- Extra evidence paths were added to the five critical facts; original paths are untouched.
- Side-secret thresholds stay at 2; extra evidence ids were appended.
- Final `caseReport.traces` is an additive field inside the existing report object, not a new top-level save key. Traces include actor voices, opened side-secrets, fair misleads, missed facts and a seed note, capped at 10 unique rows. Ending/decision/privacy always survive the cap.
- Contact cards, photo/call metadata and report traces are presentation only. Contact `relation` is pair-aware.
