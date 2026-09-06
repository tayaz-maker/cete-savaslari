# Kayıp Telefon — UI, Navigation, Content Model

## Visual identity
A fictional phone OS — modern, intimate, private. No direct copy of iOS/Android visual identity (icon grid conventions, notification styling, and app metaphors should feel phone-like without being a literal skin of a real OS). Distinct from every other TarikLab game — this is the one game whose entire screen *is* the fiction, not a game UI wrapped around a fiction.

## Navigation
Lock screen → home screen (app grid) → per-app views (Mesajlar thread list → thread; Aramalar call log; Fotoğraflar gallery/grid; Notlar list; Takvim; Rehber contact list; Dosyalar file browser; Ses kayıtları list). A persistent, unobtrusive "hypotheses"/notebook view lets the player see connected clues without breaking phone immersion (could be a notes-app-styled meta-view rather than a separate game menu).

## Mobile behavior
This game is arguably *more* natural on a real phone-sized viewport than any other TarikLab game — the 320–430px mobile target is not a constraint here but close to the intended primary experience. Desktop should present the phone as a bounded device frame, not stretch phone-app content to full desktop width.

## Content model
- **Phone profile** (data-driven pack): owner, relationships, hidden problem, key timeline, red herrings, ending possibilities.
- V1 target (Section 27): 1 complete phone, 6 contacts, 3 message threads, 20–30 discoverable items, 1 hidden conflict, 3 endings, 30–45 minute playtime.
- Do not build procedural phone generation in Sprint 1 (Section 9) — one hand-authored profile proves the mechanic; procedural generation is a much later concern if ever pursued.

## Dead-control discipline
An app icon for content not yet unlocked should communicate "locked," not simply be missing or silently do nothing on tap (Section 14: dead control = 0, silent no-op = 0).
