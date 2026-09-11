# GETT-OH!

## What is this game?

An original, deterministic trading-card duel game with an Istanbul
neighborhood/racon theme: deploy your crew, put your reputation on the line
with cards, and drive your opponent's point total to zero. GETT-OH! is not
affiliated with, and does not reproduce, any third-party trading-card game's
branding, card names, or rules text — see
[Section 10 of the shared engine contract](../duel/DUEL_ENGINE.md) for the
IP-safety framing that applies to both duel games.

## Status

**LIVE.**

## Route

```text
/oyna/gett-oh
```

which embeds the static game shell at `/games/gett-oh/index.html` in an
iframe (see `src/routes/oyna.$slug.tsx` and `src/lib/games.ts`).

## Runtime

```text
public/games/gett-oh/
├── index.html
├── app.js               — theme entry point
├── designs.js            — TR/EN card design text
├── expansion.js           — RCN-151..300 expansion definitions
├── source-cards.json      — RCN-001..150 source-normalized card data
└── assets/                — atmosphere art, emblem, favicon, art manifest
```

Theme-specific files own card definitions, labels, art, and CSS tokens.
All rules, effects, AI, deck generation, persistence, and DOM adapters live in
the shared engine below — GETT-OH! never forks its own copy of engine logic.

## Shared engine

GETT-OH! and VETO-H! run on the same deterministic duel engine:

```text
public/games/duel-core/
```

See **[docs/duel/DUEL_ENGINE.md](../duel/DUEL_ENGINE.md)** for the full
implementation contract (rules boundaries, visual contract, source
normalization register, checkpoints, and accepted-evidence history). Do not
duplicate that document here.

## Major player-facing systems

- 300 cards (RCN-001–300), TR/EN bilingual text and UI.
- 59:86 trading-card aspect ratio for all card renders (board, hand, archive,
  inspector).
- 40-card legal deck generated per duel from a seeded RNG; 5-card opening hand.
- 8000-point duel model with the shared phase architecture (Draw → Standby →
  Main 1 → Battle → Main 2 → End), single-response-per-action chain.
- AI opponent that only sees a public projection of state (never the
  opponent's hidden hand/deck order).
- Card archive with search/filter (kind, subtype, series, level, ATK range,
  deck location) and a 40-card pregame deck preview.
- Local save/reload; a duel resumes exactly at pending decisions, responses,
  or choices.

## What must not be assumed from older design docs

- The theme uses **GETT-OH!** naming and terminology throughout the UI; do
  not reintroduce any prior working title.
- The card pool is 300 per theme (expanded from an original 150 — see the
  "600-card expansion" section of the shared engine doc). Do not assume a
  150-card pool when reasoning about deck generation or archive coverage.
- Desktop board/hand card sizing and the Kart Ayrıntısı (card inspector)
  layout were revised after initial release to fix production regressions;
  read the shared engine doc's checkpoint history rather than assuming any
  single prior PR's CSS values are current.
- The WebKit/Safari card-visibility fix (`translateZ(2px)` on the relevant
  animation keyframes) is load-bearing — do not remove it while "cleaning up"
  animation code.

## Deeper docs

- [`docs/duel/DUEL_ENGINE.md`](../duel/DUEL_ENGINE.md) — canonical shared
  engine contract, used by both VETO-H! and GETT-OH!.
