# Amiral Battı

## What is this game?

A grid-based battleship game: place your fleet, take turns firing at your
opponent's grid, and sink their fleet first.

## Status

**LIVE.**

## Route

```text
/oyna/amiral-batti
```

which embeds the static game shell at `/games/amiral-batti/index.html` in an
iframe (see `src/routes/oyna.$slug.tsx` and `src/lib/games.ts`).

## Runtime

```text
public/games/amiral-batti/
├── index.html
├── styles.css
└── js/
    ├── engine.js   — board/fleet/shot rules (10x10 grid, standard 5-ship fleet)
    ├── ai.js       — opponent shot selection
    └── app.js      — DOM wiring
```

## Shared engine

None. Amiral Battı does not depend on `public/games/duel-core/` or
`public/games/next-wave*`.

## Major player-facing systems

- 10x10 grid, standard fleet (lengths 5/4/3/3/2), touching-allowed placement.
- Deterministic seeded RNG (`lcg`) for AI shot selection, covered by
  `scripts/amiral-batti.test.mjs`.

## What must not be assumed from older design docs

- Unlike Labirent, Tek Taş, and Satranç, Amiral Battı is **not** covered by
  [`docs/tlab-classics/PROVENANCE_AND_LICENSES.md`](../tlab-classics/PROVENANCE_AND_LICENSES.md).
  Do not assume that document's provenance findings apply here; if a
  provenance question comes up for this game, it needs its own audit.

## Deeper docs

None yet. This README is the first-class entry point; expand it here rather
than creating a second competing document elsewhere.
