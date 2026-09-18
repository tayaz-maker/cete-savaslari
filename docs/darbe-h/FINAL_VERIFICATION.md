# DARBE-H! — final verification (independent)

Verified against `grok/darbe-h-balance-repair` @ `cbfbffa1a789b9d2801c34dc7423f9020387ba99`,
on top of the Opus review parent `45e53610c8ca8ab3b5248a8f67c2551bd4e44433`.
Canonical main at the time of writing: `149625fa355a4086da1cc1d404ed5866113e9ce7`.

**Verdict: NOT CLOSED.** The targeted repair fixed the generated curve and the
release contracts, but it rotated the balance problem rather than removing it.
Nothing here was taken from the repair report; every number below is from an
independent 2500-match run and a direct read of the catalog.

## What the repair genuinely fixed

- **Curve.** L2 (n=24) and L4 (n=22) exist again; L1 collapsed from 33 units
  averaging 764 ATK to 4 units averaging 150. Best-body mean is monotone:
  350 → 800 → 1170 → 1405 → 1977 → 2167 → 2542 → 2675.
- **Paraf economy.** Free L1–4 mean best body 1114, one paraf 2018, two paraf
  2575. The best free body (1600) is below the weakest two-paraf body (2300),
  so paying is never strictly worse.
- **Expansion contract.** 151–300 is exactly 90 / 35 / 25 and the whole set is
  170 / 79 / 51, matching VETO-H!'s totals.
- **Generator determinism.** Re-running `scripts/build-darbe-h-cards.py`
  reproduces the committed catalog byte for byte.
- **The eight prior suite failures are genuinely closed.** The two test edits
  are corrections, not relaxations: the trap-series assertion became a
  per-theme table (DARBE's traps really are `İhtar`), and DARBE was registered
  against teaching content that really exists in `help-duel.js`. The three new
  `-old-*.json` fixtures follow the same contract-freeze pattern VETO-H! and
  GETT-OH! already use — each sibling's `-old-pool.json` is identical to its
  own current first 150.
- **Not a reskin.** With series nouns normalised away, DARBE carries 255 full
  mechanical signatures over 300 cards; only 27% of its cards share a
  signature with VETO-H! at the same index (VETO-H! vs GETT-OH! is 22%), and
  0/300 names, card texts or series lines are shared with either sibling.

## Why it is still not closed

Measured over 2500 independent mirrored matches (5 decks × both seats × 5 AI
profiles × 10 mirrored seeds; 0 stuck, 0 rejected action, 0 non-finite, 0 draw).

| deck | repair report | measured, seat-adjusted |
| --- | --- | --- |
| Muhtıra | 46.4% | **36.3%** |
| Tebligat | 55.0% | 58.5% |
| Karargâh | 60.4% | **62.5%** |
| İstişare | 44.0% | **36.7%** |
| Zeyilname | 50.4% | 56.0% |

1. **Karargâh is the replacement structural crown.** 62.5% overall, and it
   wins three of four matchups outright while tying the fourth: 75% vs
   Muhtıra, 74% vs İstişare, 63% vs Tebligat, 51% vs Zeyilname (n=200/cell).
   The crown moved off Muhtıra; it did not go away.
2. **İstişare is the replacement dead deck.** 36.7% overall with no favourable
   matchup at all — its best cell is 47% against Muhtıra, then 33%, 28%, 26%.
   It is also the only deck that ever decks out (36/900, and 7.2% under the
   gambler profile).
3. **First-mover advantage regressed.** 61.8% (1545/2500), up from 52.4%
   before the repair. On the 1250 complete mirrored pairs — same decks, same
   profiles, same seed, only the opening seat swapped — seat 0 wins 64.9% when
   it opens and 41.3% when it does not, so opening is worth **23.6 percentage
   points** and flips the winner in 28.6% of pairs. (The report's
   `seat0 0.592 / seat1 0.567 ≈ +9 points` is a seat-occupancy statistic, not
   a first-mover one, and does not match this run on either figure.)

Spread is 26.2 points, down from 37.2 before the repair, but three of five
decks sit outside 40–60% and the two structural failures are unchanged in kind.

### Card dependence got worse, not better

DRB-041 is no longer the crown — it fell from first to tenth by play count
(2215 plays) — but the concentration moved into the decks instead of
dissolving. Per-deck top-5 share rose from 23.3–29.3% to **40.0–47.6%**, and
single-card win deltas now reach **+37 points** (DRB-147 in Tebligat, n=616),
+34 (DRB-206 in İstişare), +28 (DRB-236 in Karargâh). Four cards present in
decks are never played at all.

### The new balance test does not test the balance claim

`scripts/darbe-h-balance.test.mjs` is titled "no crowned deck", but it only
asserts deck rates in 0.2–0.8, matchup cells in 0.07–0.93 and first-player in
0.25–0.75. Every failure above passes those bands comfortably. The suite being
green is not evidence for the balance claim.

## Gates that are clean

- **Flow-copy.** The theme-aware match rail survives byte for byte; DARBE
  prints `Arşiv’e gönderdin` / `paraf olarak verildi` and `sent to the
  archive` / `a countersignature`, VETO-H! and GETT-OH! output is unchanged.
  4/4 in `scripts/darbe-h-flow-copy.test.mjs`.
- **Safety.** Ten operational-harm probe families (weapons, assassination,
  violence, infrastructure seizure, comms disruption, detention, illegal
  surveillance, sabotage, evasion, real actors/parties) over all 300
  regenerated cards in TR and EN plus the theme copy files: zero hits.
- **Isolation.** 12/12 storage keys distinct; all six cross-theme save reads
  rejected; DARBE never consumes the legacy shared settings/onboarding keys
  while VETO-H! and GETT-OH! still migrate once; 25 save/load cycles byte
  stable; resetting DARBE leaves every sibling key intact; corrupt, truncated,
  non-finite and oversized payloads stay finite and playable.
- **Scope.** Nothing outside DARBE plus `drbSeries` in the shared
  `card-data.js` was touched — no VETO-H!, GETT-OH!, İHTİLÂL or Wave 1–5 file.
- **Browser.** Chromium at 1363×936, 390×844 and 430×932 in TR and EN: menu,
  archive (300/300, art renders, no raw IDs), setup with all five decks, and
  the board. Zero console or page errors, zero broken images, zero horizontal
  overflow, zero clipped controls, no sibling wording or card IDs on screen.
- **Suites.** All 106 JS test files run individually: 105 exit 0, 1248
  assertions passing, 0 failing. TypeScript 50/50. `tsc --noEmit` clean,
  `eslint .` 0 errors, production build clean, `git diff --check` clean.

## Master-freeze notes (not DARBE's)

- `scripts/wave4-tc-sim-final-integration.test.mjs` does **not** hang. It runs
  324s and passes 5/5; one subtest simulates 40 seeds × 16 strategies × 720
  weeks. The file and the whole `public/games/tc-sim/` tree are byte-identical
  at `149625f`, `45e5361` and `cbfbffa`, so DARBE cannot affect it. It only
  looks like a hang under a timeout below ~330s.
- `scripts/darbe-h-balance.test.mjs` takes 477s against its own 600s budget.
  Together these two add roughly 13 minutes to `npm test`.
