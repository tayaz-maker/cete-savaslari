# Shared Test & Release Contract

Every next-wave game's `04_TEST_CONTRACT.md` inherits this list and adds only what's genuinely game-specific. Do not restate this file's contents per game — cite it.

## Unit
- Every pure state-transition function (resource deltas, progression math, resolution rolls) has a direct unit test.
- Every state-shape migration function is tested against at least one fixture of the previous version.

## System
- Route actually reachable (matches `src/lib/games.ts` catalog entry or, for HTML5 games, the `/oyna/$slug` iframe wrapper — see `HTML5_SLUGS` in `src/lib/games.ts`).
- First meaningful action reachable from a cold load with no prior save.

## Save/load
- Roundtrip: save → reload → identical meaningful state (see `sameContent`-style comparison in `docs/cete-savaslari/TECHNICAL_CLOSURE_CHECKPOINT.md` — a `savedAt`/checksum-only diff is not a failure).
- Migration: an old-shape fixture loads without crashing and without silently discarding meaningful progress.
- Slot isolation: creating/advancing slot 2 must not change slot 1's meaningful fields (verified this session for Hanedan/Bükücü/Racon/TC SIM via real browser slot-switch flows).
- Corrupt save is rejected/skipped, never crashes the loader.

## Exploit
- Duplicate reward: rapid double-click / double-submit on a reward-granting action does not grant the reward twice for one logical action (a second *deliberate* action legitimately succeeding again is not a bug — see the desktop double-click finding in `docs/cete-savaslari/TECHNICAL_CLOSURE_CHECKPOINT.md`).
- Reload reroll: reloading mid-decision does not re-roll an unresolved probabilistic outcome.
- Invalid repeated action: an action whose precondition just became false (resource spent, slot no longer open) cannot be re-fired from a stale UI state.
- Stale callback: a delayed-consequence/openCase callback scheduled against an entity that no longer exists (fired, removed, resolved) does not crash or double-apply.
- Double click: every primary CTA is safe against a genuine double-click (button disables mid-action or the action is idempotent).

## Long-run
- Only where meaningful: a game with unbounded turn count (Hayat's full lifespan, DEVLET's decades) gets a deterministic long-run stress test (see TC SIM's 20,000-tick precedent). A 100-day or shorter game does not need one beyond its natural length.

## Browser
- Desktop and mobile (320–430px) real interaction pass: cold load, first action, save/load, a representative "locked/blocked" state, no fatal console errors, no horizontal overflow, no clipped/unreachable modal.

## Release
- `npm test` (MJS + TS suites), `tsc --noEmit`, `npm run lint` (0 errors — new warnings require justification), `npm run build`, CI green on the exact commit, Vercel deploy green, a production smoke pass on the live URL for the new route.

## What is explicitly NOT required at Sprint 0/1

- Full content-scale targets (see each game's `05_SPRINT_MAP.md`) — Sprint 1 proves the signature mechanic on a small slice, not full release content.
- Long-run stress tests before the vertical slice's mechanic is proven.
- Cross-browser matrix beyond desktop + mobile Chromium-class rendering, matching current TarikLab practice.
