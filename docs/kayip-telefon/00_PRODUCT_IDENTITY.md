# Kayıp Telefon — Product Identity

## Player fantasy
A phone is found. The player explores it. A private life unfolds through the information on the device.

## What it is NOT
- **Not** a fake chat app — the phone must feel like an artifact belonging to someone else, not a messaging feature demo.
- **Not** a linear visual novel — information is discovered non-linearly through a graph, not read in a fixed sequence.
- **Not** a pure detective puzzle with no state consequence — the player's own intrusiveness (privacy pressure) must matter mechanically, not just narratively.

## Signature mechanic: Discovery Graph + Privacy Pressure
Information is locked behind discovered contacts, message references, dates, files, and passwords/clues — an interconnected graph, not a linear unlock chain. Looking at everything is not free: a `privacyPressure`/`ownerRisk` mechanic makes intrusion carry weight, up to and including moral/ending consequences and irreversible actions.

## Base engine
This game needs the most custom UI of the five — no existing TarikLab game has a "phone" shell. Reuse is at the *pattern* level, not the shell level: TC SIM's event/openCase model (for clue-driven reveals), Racon's log/message-list pattern (for message-thread UI), Bükücü's modal decision structure (for interaction prompts), and the TarikLab save system (if slots are used at all — see below).

**Do not** reuse a full existing game shell (React app, vanilla single-file game shell) as the phone's container if it would make the phone feel like a reskinned game screen instead of an actual phone.

## Phone apps (V1 possibilities)
Mesajlar, Aramalar, Fotoğraflar, Notlar, Takvim, Rehber, Dosyalar, Ses kayıtları. No real branded app clones (no literal WhatsApp/iMessage/Instagram visual identity).

## Content model
Data-driven "phone profile" packs: owner, relationships, hidden problem, key timeline, red herrings, ending possibilities — built so Terra can generate additional phones without touching engine code.

## Progression
Discovery completion (% of the graph uncovered), not XP.

## Save model note
A single phone case may not need the full 3-slot career-persistence system — Kayıp Telefon may use slots only if multiple phone cases/profiles benefit from parallel saved progress (Section 11's explicit exception). V1 ships as one complete phone; whether slots matter is a Sprint 2 decision once multiple phone profiles exist.

## Ending
At least 3 distinct endings driven by discovery completeness and privacy-pressure choices, not a single "solved/unsolved" binary.
