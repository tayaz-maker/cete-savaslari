# DARBE-H! — final verification II (independent)

Verified against `grok/darbe-h-balance-repair-2` @
`df44df475f5ca172785eec987e41d29a67cf415f`, parent
`3d82bbd12ba616374f4ba7f4e3bcb90c605d96c3`, canonical main at the time
`149625fa355a4086da1cc1d404ed5866113e9ce7`.

**Verdict: CLOSED.** Every hard gate was re-measured from scratch. Nothing
below was taken from the Repair II report.

## The instrument was rebuilt, not reused

The Repair II balance harness (`scripts/darbe-h-sim.mjs`) was written by the
same pass it certifies, so it was not used to certify it. A separate harness
talking straight to the engine produced every number here, and it differs
from the repo's in two ways that matter:

- **Seat-adjusted rates count both seats.** The repo's harness scores only
  the deck sitting in seat 0. Mine scores each deck in both seats and averages
  them, which is twice the data and cannot let seat bias read as deck
  strength. My numbers are consequently lower than the Repair II report's —
  İstişare 43.5% where the report said 48.2%.
- **The hand-fusion probe is semantic, not shape-based.** Rather than
  matching an action shape, it asks the only question that settles it: at the
  moment a special summon is dispatched, is any of its materials sitting in
  the summoner's hand? That probe is theme-agnostic, which is what made the
  sibling comparison below possible.

## Repair II does exactly what it claims, and only that

- Six cards changed in the catalog: DRB-235…240, nothing added or removed.
- `traits.materials.zones: ["units"]` is declared on those six and on **no
  other card in the pool**. The six core fusions DRB-068…073 still default to
  hand+units.
- **DRB-001…150 are byte-identical to the parent**, DRB-068…073 included.
- `scripts/build-darbe-h-cards.py` reproduces both `source-cards.json` and
  `designs.js` byte-for-byte; the tree is clean after regeneration.
- 300 cards, 170/79/51 total, 90/35/25 expansion, 300 unique ids.
- `duel-expansion` / `duel-release` were not touched by Repair II at all, so
  the eight previously-failing assertions are the ones already audited a
  round earlier. 57/57 green.

## The fix works, proven causally against the parent

Same harness, same seeds, parent vs fixed:

| | parent `3d82bbd` | fixed `df44df4` |
| --- | --- | --- |
| turn-1 hand fusions | 47 | **0** |
| hand fusions, any turn | 147 | **0** |
| field fusions | 13 | 78 |
| DRB-236 plays | 590 | 258 |
| Karargâh rate | 0.610 (crown) | 0.460 |

Over 3000 independent mirrored matches on the fixed branch: **0 hand fusions
at any turn**, 503 field fusions. The loophole is closed, not narrowed.

## Balance, re-measured (3000 mirrored matches, 0 stuck/failed/non-finite)

| deck | seat-adjusted | as seat 0 | as seat 1 |
| --- | --- | --- | --- |
| Tebligat | 55.8% | 57.5% | 54.2% |
| Zeyilname | 55.3% | 59.0% | 51.7% |
| Karargâh | 48.6% | 53.2% | 44.0% |
| Muhtıra | 46.8% | 50.0% | 43.5% |
| İstişare | 43.5% | 46.7% | 40.3% |

Spread 12.3 points. Every matchup cell falls between 31% and 69%.

- **No crown.** Tebligat leads at 55.8% but its worst cell is 49% against
  Karargâh — it does not beat the field.
- **No dead deck.** İstişare is the softest desk at 43.5%, still inside the
  38–62% closure band, and it holds an even 50% cell against Muhtıra.
- **No hard lock.** Every deck owns at least one unfavourable matchup.
- First-mover 58.6%, second 41.4%. Opening delta **17.2 points** over 1500
  same-seed seat-swapped pairs (seat 0 wins 61.9% opening, 44.7% not
  opening); the opening flips the winner in 21.1% of pairs.
- Turns median 12 / p75 15 / p90 20 / p95 24 / max 51. Terminals 2971 points,
  29 deck-outs.

Both bands the repo itself defines are met, and the repo's own 3000-match
tight-band closure gate passes on an independent sample.

## The new balance gate is not theatre

The previous round's gate would have passed a 79% crown. This one was fed the
exact Repair I state it was written to catch: it raises **6 problems in tight
mode** — Karargâh's 62.5% crown, both sub-band decks, İstişare's missing
favourable matchup, the 61.8% first-mover rate and the 23.6-point opening
delta — and 2 in loose mode. It bites.

## Card telemetry

113 distinct cards played. Per-deck top-5 concentration 34.8–42.4%. DRB-041
sits fifth by play count — not a hidden crown.

DRB-237/238/239/240 never fire. **This predates Repair II**: the same probe
on the parent commit shows all four at zero plays there too, alongside
DRB-235. It is a content/synergy gap in those decks' own lists, not a
regression introduced by the material-zone fix, and not in this round's
scope.

## Everything else

Safety: ten operational-harm probe families over 300 cards TR+EN plus the
theme copy — zero hits. Isolation: 9/9 keys distinct, all six cross-theme
reads rejected, corrupt payloads refused or kept finite and playable, 25
cycles byte-stable, DARBE reset leaves all six sibling keys intact.
Flow-copy: DARBE prints Arşiv/paraf and archive/countersignature, VETO-H! and
GETT-OH! output unchanged. Browser: 78/78 checks at 1363×936, 390×844 and
430×932 in both languages, zero console errors and zero broken art. Suites:
`npm test` 1257 pass / 0 fail / 1 skipped (the env-gated closure matrix) plus
TS 50/50; `tsc --noEmit` clean, `eslint .` 0 errors, production build clean,
`git diff --check` clean.

## Master-freeze items — recorded, deliberately not fixed here

**MASTER FREEZE BLOCKER/CANDIDATE — the shared fusion-material default.**
The same probe run on the siblings (750 matches each) says the turn-1
hand-fusion pattern was never DARBE-specific; it is the shared engine's
`zones: ["hand", "units"]` default, and DARBE-H! is now the only sibling
clean of it:

| theme | T1 hand fusions / match | hand fusions, any turn | first-mover | opening delta |
| --- | --- | --- | --- | --- |
| DARBE-H! | **0.000** | **0** | 59.6% | 19.2pp |
| VETO-H! | 0.116 | 1515 | 55.6% | 11.2pp |
| GETT-OH! | **0.841** | 1673 | 55.5% | 10.9pp |

GETT-OH! opens with a hand fusion in roughly five matches out of six. Neither
sibling nor the shared engine was touched this round, by instruction.

**Candidate — DARBE's residual seat advantage.** At 58.6–59.6% first-mover
and a 17.2–19.2-point opening delta, DARBE sits 3–4 points and ~7 points
above its live siblings. It is inside DARBE's own tight closure bands and
improved from Repair I (61.8% / 23.6pp), and most of it is the shared
engine's own seat asymmetry. DARBE must not be detuned to compensate for a
generic problem.

**Known limitation.** The four silent expansion bosses above.
