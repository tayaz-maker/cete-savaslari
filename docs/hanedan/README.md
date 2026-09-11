# Çete Savaşları: Hanedan

## What is this game?

A generational/risk management sim: build a squad through a draft, run it
through a season/week/tier ladder, and manage the streaks of wins and losses
that decide whether your "hanedan" (dynasty) survives.

## Status

**LIVE.**

## Route

```text
/oyna/hanedan
```

which embeds the static game shell at `/games/hanedan/index.html` in an
iframe (see `src/routes/oyna.$slug.tsx` and `src/lib/games.ts`).

## Runtime

```text
public/games/hanedan/index.html
```

A single self-contained file (markup, styles, and game logic together) — it
does not use the shared `duel-core` or `next-wave` engines.

## Shared engine

None. Hanedan does not depend on `public/games/duel-core/` or
`public/games/next-wave*`.

Hanedan's own engine is referenced as a *reuse pattern* (not a shared,
importable module) by later "Next Wave" games — see
[`docs/next-wave/00_MASTER_PLAN.md`](../next-wave/00_MASTER_PLAN.md), which
documents its draft/squad-build flow, season/week/tier/pts league ladder,
capped history arrays (`kronik[]`/`news[]`), and sheet/modal UI primitives as
the "Generational/Risk" reference family. That document does not describe
Hanedan's current implementation in full; treat it only as an architecture
reference, not as Hanedan's own specification.

## Major player-facing systems

- Draft → squad-build → season loop with a week/tier/points ladder.
- Capped chronicle/news history logs.
- Local save/reload via the shared `tariklab::<game>:<slot>` localStorage
  convention used across TarikLab's persistent games.

## What must not be assumed from older design docs

- There is no dedicated Hanedan design document elsewhere in this repository;
  the only prior references to Hanedan's design are the reuse-pattern
  summary in `docs/next-wave/00_MASTER_PLAN.md`. Do not treat that summary as
  a complete or currently-accurate spec of Hanedan's own code — verify
  against `public/games/hanedan/index.html` directly.

## Deeper docs

None yet. This README is the first-class entry point; expand it here rather
than creating a second competing Hanedan document elsewhere.
