# DARBE-H!

> Telex düşer. Masa karar verir.

## What is this game?

The third sibling of the VETO-H! / GETT-OH! deterministic card-duel family.
Two players sit at a fictional Extraordinary Desk and play officers, orders
and notices until one crisis-point total hits zero.

This is **not** İhtilâl 2 and **not** a VETO-H! or GETT-OH! reskin. It reuses
the shared duel engine (`public/games/duel-core/`) and supplies its own
theme, cards, decks, copy and visual identity.

Theme language is fictional institutional crisis: memorandum, dispatch,
cabinet, archive, redaction, legitimacy shock. It does not teach or optimize
real-world coup execution, weapons, assassination, repression, sabotage or
illegal surveillance.

## Status

**LIVE.** Canonical play is `/oyna/darbe-h`.

## Runtime

```text
public/games/darbe-h/
├── index.html
├── app.js                 — startApp("darbe-h", designs)
├── designs.js             — executable bilingual designs
├── source-cards.json      — DRB-001..300
├── decks.json             — five 40-card presets
└── assets/                — emblem, favicon (procedural card faces)
```

- Game / theme id: `darbe-h`
- Save: `tariklab.darbe-h.duel` (fail-closed, checksum, foreign theme rejected)
- Settings: `tariklab.darbe-h.settings.v1` — **no** shared `tariklab.duel.settings.v1` fallback
- Onboarding: `tariklab.darbe-h.onboarding.v1` — **no** shared onboarding fallback
- History: `tariklab.darbe-h.history.v1`
- Points: KP (Kriz Puanı / Crisis Points)
- Card prefix: `DRB-`

## Decks

Muhtıra, Tebligat, Karargâh, İstişare, Zeyilname — five genuinely different
40-card lists (control, tempo, midrange, grind, recursion).

## Shared engine

See [docs/duel/DUEL_ENGINE.md](../duel/DUEL_ENGINE.md). DARBE-H! does not
fork the rules engine. VETO-H! and GETT-OH! cards, saves and settings are
untouched.

## Visual

Ink-navy briefing room, telex amber, cool grey paper. Stamp crimson is a
warning only. Card faces are procedural SVG (unique per id/series), not a
painted VETO/GETT pack and not İhtilâl oxblood carbon-copy.
