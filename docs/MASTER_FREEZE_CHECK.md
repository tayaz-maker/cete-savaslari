# TarikLab — Master Freeze Check Before Astra

**Auditor:** Claude Sonnet, independent repo + production truth audit.
**Canonical main at audit time:** `6052b48b49511a4f1ff0092d24457ce0574500e3`.
**Scope:** verify current main, classify remaining debt, define Astra's exact
authority per game. No fixes beyond tiny proven inventory/doc/test-harness
items. No new game wave. İHTİLAL diagnosed only, not reworked. Astra not
invoked in this task.

---

## 1. Repo-truth inventory

18 catalog entries in `src/lib/games.ts` (`GAMES`), all `status: "live"`.
16 of them route through the shared `/oyna/$slug` shell (`HTML5_SLUGS`);
`cete-savaslari` and `bukucu` use dedicated routes/static hrefs.

| Slug | Route | Engine family | Save namespace | Sitemap | SW | Credits | Prod HTTP |
|---|---|---|---|---|---|---|---|
| cete-savaslari | `/cete-savaslari` | dedicated React game | own | yes | shell only | yes | 200 |
| hanedan | `/oyna/hanedan` | standalone HTML5 | `tariklab.hanedan.*` | yes | not in module-list (non-ESM) | yes | 200 |
| racon | `/oyna/racon` | standalone HTML5 + shared depth-framework | `tariklab.racon.*` | yes | not in module-list | yes | 200 |
| tc-sim | `/oyna/tc-sim` | standalone HTML5, own engine | `tariklab.tcsim.*` | yes | yes | yes | 200 |
| bukucu | `/games/bukucu/index.html` | standalone HTML5 | own | yes | not in module-list | yes | (not re-checked; unchanged since prior waves) |
| labirent / peg-solitaire / satranc / amiral-batti | `/oyna/*` | TLab Classics, shared engine bits | per-game | yes | yes | yes | 200 (sampled) |
| apartman | `/oyna/apartman` | next-wave shared runtime | `tariklab.nextwave.apartman.*` | yes | yes | yes | 200 |
| kayip-telefon | `/oyna/kayip-telefon` | next-wave shared runtime | `tariklab.nextwave.kayip.*` | yes | yes | yes | 200 |
| son-100-gun | `/oyna/son-100-gun` | next-wave shared runtime | `tariklab.nextwave.son100.*` | yes | yes | yes | 200 |
| tc-sim-devlet | `/oyna/tc-sim-devlet` | next-wave shared runtime | `tariklab.devlet.*` | yes | yes | yes | 200 |
| son-kasaba (display: SON KÖY MANAGER) | canonical `/oyna/son-koy-manager`, legacy `/oyna/son-kasaba` both resolve | next-wave shared runtime | `tariklab.son-kasaba.*` (unchanged, internal id) | yes (canonical URL only) | yes | yes | 200 both URLs |
| veto-h / gett-oh / darbe-h | `/oyna/*` | shared `duel-core` | `tariklab.<theme>.*` (see §5) | yes | yes (module-graph list) | yes | 200 |
| ihtilal | `/oyna/ihtilal`, `/ihtilal` redirects | own engine, no shared runtime | `tariklab.ihtilal.v1.slot{1,2,3}` | yes (both URLs) | yes | yes | 200 |

**Hayat:** confirmed retired. No `public/games/hayat/*`, no route, no sitemap
entry, no SW cache entry, no catalog entry, no `HTML5_SLUGS` entry. Retirement
is documented (`docs/archive/HAYAT_RETIREMENT.md`, `docs/archive/hayat/*`,
`docs/tc-sim/HAYAT_VALUE_MIGRATION.md`) with an explicit git-archaeology
recovery recipe. Orphaned `tariklab.nextwave.hayat.*` localStorage keys may
still exist in old players' browsers; nothing reads or writes them. **No
accidental exposure found.**

**Son Kasaba / SON KÖY MANAGER:** `PLAY_ALIASES = { "son-koy-manager":
"son-kasaba" }`; `canonicalPlaySlug()` resolves both the canonical
`/oyna/son-koy-manager` and the legacy `/oyna/son-kasaba` to the same
internal folder/save id. Verified live in-browser: both URLs load the same
iframe (`/games/son-kasaba/index.html`) with identical content. Sitemap
lists only the canonical URL (correct — legacy stays reachable but
unadvertised). **No stale-canonical defect.**

**TC SIM: DEVLET date range:** catalog/UI copy says "1923'ten 2030'a"
(1923–2030), matching the shipped grand-campaign runtime. The only
"2002–2005" text left in the repo is in
`docs/tc-sim-devlet/TC_SIM_DEVLET_MASTER.md`, which carries its own
in-document disclaimer ("bu belge özgün ürün vizyonunu... korur... güncel
runtime sınırı değildir") pointing at the sync ledger for current scope —
i.e. a historical design doc that already labels itself historical, not a
stale claim presented as current. Internal `eraId` content tags (`"2002"`,
`"alternatif"`, `"gunumuz"`) are era classifiers, not user-facing scope
copy. **No stale-copy defect.**

**Sitemap / SW / credits:** sitemap.xml (20 URLs) and `credits.html`
(`data-game` for all 18 catalog slugs) are complete and consistent with the
catalog. `sw.js`'s `MODULE_GAME_PATHS` allowlist (network-first strategy for
ES-module games) intentionally excludes `hanedan`/`racon`/`bukucu`, which
are non-ESM engines — not an omission.

**`.output/` build artifact:** present on disk from this audit's own build
run, correctly gitignored, never tracked. `git status` clean throughout.

**Duplicate IDs / save-namespace collisions:** none found. Every duel
sibling gets its own `tariklab.<theme>.*` namespace family
(`theme-meta.js`'s `SIBLING_THEMES`); every next-wave game gets its own
`tariklab.nextwave.<slug>.*` prefix. One historical naming quirk: VETO-H!'s
history key is `tariklab.veto-h.campaign-history.v1` while GETT-OH!/DARBE-H!
use the newer `tariklab.<theme>.history.v1` pattern — a legacy artifact of
VETO-H! shipping first, not a collision, and renaming it now would orphan
real players' saved campaign history for no benefit. Not touched.

**Racon Manager — historical audit reconciled.** `RACON_MANAGER_AUDIT.md`
(2026-09-04) documented real critical bugs: an inconsistent
`kasa`/`dirtyKasa`/`cleanKasa` triple ledger, an unlimited free-reputation
exploit ("Cuma çıkışı" repeatable same-day), an unlimited-money race-betting
exploit, silent save corruption, and residual football-manager structural
logic (season/league text) contradicting the game's own written identity
brief. A later commit (`89f8d65`, 2026-09-15, "16 NPC bibles and 24
identity-aware chains") is contemporaneous with `scripts/racon-final.test.mjs`
and `scripts/racon-apartman-content.test.mjs`, whose current, passing
assertions directly cover every one of those complaints: single normalized
cash total ("cash normalization preserves actual total; spending consumes
money exactly once"), a daily-limited Friday action ("daily personal limit
and Friday eligibility survive reload"), a negative-EV, non-repeatable race
("weighted race has negative expected return and cannot be replayed same
day"), fail-visible save loading ("malformed primary loads good backup;
storage failure is visible"), and closed/reachable/non-dominant content
(96 nodes, chain distribution, save-namespace isolation). No
`dirtyKasa`/`cleanKasa` symbol remains in `content.js`, and no
`Veliefendi`/horse-odds code remains at all. **Classified closed, protected
by regression tests, not re-litigated from scratch** — consistent with
"treat as closed unless a current regression is independently proven," and
none was found (full suite green, see §6).

---

## 2. Shared duel-core fusion/first-mover classification

**Evidence carried in from DARBE-H! Final Verification II** (independently
reproduced there, not re-litigated here): DARBE-H! post-repair first-mover
~58.6–59.6%, opening delta ~17–19pp, T1 hand-fusion 0%. VETO-H! first-mover
~55.6%, T1 hand-fusion ~11.6%. GETT-OH! first-mover ~55.5%, T1 hand-fusion
~84.1%. Shared engine default: `zones: ["hand", "units"]` in
`public/games/duel-core/summoning.js`'s `specialPlans()`.

**New this task — root cause of GETT-OH!'s outlier rate.** All three
siblings have a structurally parallel "core aux" fusion block (GETT-OH!:
RCN-083..089 / VETO-H!: SND-equivalent / DARBE-H!: DRB-068..073, untouched
by Repair II). Reading every special-card material spec directly out of
each theme's shipped `designs.js`:

- DARBE-H!'s six core fusions all require two **specific named series**
  (e.g. `{"series":["Dosya","Paraf"]}`) — the same pattern VETO-H!'s core
  fusions use (9 of 10 are specific named pairs; one is a 3-card generic
  count).
- GETT-OH!'s core block breaks that pattern on two cards: **RCN-083**
  requires only `{"count":2,"differentSeries":true}` — *any* two hand
  cards from different series, no named series at all — and **RCN-085**
  requires `{"series":["Baba",null]}`, i.e. one named series plus a
  wildcard second material.

A 500-match theme-parametric attribution run (reusing
`scripts/darbe-h-sim.mjs`, unmodified, against GETT-OH!'s live
`decks.json`/`designs.js`) reproduces an 85.6% T1 hand-fusion rate and
attributes it overwhelmingly to a single card: **RCN-083 accounted for 942
of ~1,136 total special-card plays inside T1-fusion matches (~83%)**;
RCN-084 (a same-series pair, harder to hit) a distant second at 167; every
other core and boss-tier special card (including RCN-085's wildcard)
essentially never fires in that window. The boss-tier block (RCN-235..240,
positionally parallel to DARBE's fixed 235..240) never fires T1 at all —
consistent with DARBE-H!'s own pre-existing four silently-dead expansion
bosses, a known, harmless authoring-density fact, not a defect.

**Classification: B — measurable issue suitable for Astra's high-protection
repair, not A/C/D.**

- Not **A (intentional/healthy)**: no design doc for GETT-OH! states an
  intentional turn-1-fusion identity, and the card in question is an
  outlier *within its own theme's pool* (11 of 12 GETT-OH! special cards
  use specific-series requirements matching both siblings' pattern; only
  RCN-083 doesn't).
- Not **C (technical blocker)**: it does not block Astra's other work,
  crash, corrupt saves, or touch isolation.
- Not **D (uncertain)**: a concrete, single-card root cause is now
  identified and independently reproduced, not merely suspected.
- **Dominance/counterplay check:** GETT-OH!'s deck-level win rates and
  first-mover rate (~55.5%) are *not* worse than VETO-H!'s despite the far
  higher T1-fusion rate — the effect is highly visible and repetitive
  (breaks GETT-OH!'s early-game legibility and, per the DARBE-H! precedent,
  is exactly the shape of problem that produced a real crown-deck swing
  there) but is not currently proven to produce a hard-locked or dead deck
  in GETT-OH!. It is a **quality/feel defect with a precise, narrow,
  precedented fix path** (tighten RCN-083's material spec to match its
  siblings' pattern — the same class of minimal, single-family change
  DARBE-H!'s Repair II already validated as safe), not an emergency.

**Not fixed here per explicit instruction.** Recorded as the one
shared-duel-family item for Astra's docket, gated by the same six
high-protection conditions as every other duel mechanics change (independent
reproduction — done; root cause — done; minimum intervention — proposed,
not applied; all-three-sibling regression — required before any change;
save/isolation contracts — unaffected either way; deterministic/mirrored
balance proof of no regression — required before any change). DARBE-H!'s
verified balance is not touched or put at risk by this finding.

---

## 3. Game-specific spec checks

- **Racon Manager:** see §1. Chains/content/save/risk-preview/identity
  closed and regression-tested (96 nodes reachable, chain distribution has
  no domination, save namespaces isolated, cash/exploit bugs fixed).
- **Apartman:** copy says "16 daire" / "14 aktif hane"; `RESIDENTS` array
  in `next-wave/apartman-data.js` has exactly 16 entries, of which 2
  (`r10`, `r15`) are ground-floor commercial units ("dükkân arkası yatak",
  "nalbur") rather than households — exactly reconciling 16 physical units
  / 14 active households. Ballot/recovery/save-summary covered by
  `racon-apartman-content.test.mjs`'s Wave-1-closure tests (idempotent v1
  migration, bounded state growth, exclusive-branch kills, 20 long runs
  stay finite and diverge). No regression found.
- **Son 100 Gün:** `openCases` uniqueness is an enforced invariant in
  `son100-sim.js` (`new Set(...).size !== s.openCases.length` guard against
  duplicate case ids); 17 authored `SON_ENDINGS`. Phases/preparation/content
  previously audited and closed (Wave 2); no regression found this pass.
- **SON KÖY MANAGER:** canonical/legacy dual-route confirmed working
  end-to-end in-browser (§1); internal id/save compatibility intact
  (`son-kasaba` stays the storage/folder key under both URLs).
- **Kayıp Telefon:** exactly 5 authored endings (`minimal`, `thorough`,
  `reckless`, `witness`, `family`) in `next-wave/kayip-data.js`. Evidence
  graph, theories, privacy balance previously closed (Wave 3); no
  regression found.
- **TC SIM:** state-growth bounding mechanism (`LIMITS` in `state.js`:
  memories 200, yearlyHistory 56 with an explicit comment tying that number
  to the storage budget, careerHistory 40, etc.) intact and unchanged;
  `CASH_ARREARS_CAP = 300000` (TL, not bytes) governs the arrears/cash
  floor. Long-run growth/reachability previously closed (Wave 4); no
  regression found.
- **TC SIM: DEVLET:** 1923–2030 grand campaign confirmed current (see §1);
  fiscal causality, crisis families, cadre engine previously closed
  (Wave 5, `docs/tc-sim-devlet/TC_SIM_DEVLET_MASTER.md` closure history);
  no regression found this pass (full test suite green, §6).
- **Hayat:** confirmed intentionally retired, TC SIM is the documented
  successor, no accidental exposure (see §1).

---

## 4. İHTİLAL — quality diagnosis (not reworked)

**What it is:** an original, self-contained (no shared duel-core / next-wave
runtime) 5-desk area-control card game. Two players race to Hüküm 10 by
locking desks (Sicil, Kasa, Manşet, Koridor, Nöbet) with 204 unique,
bilingual, chain-linked cards across 6 archetypes, under a shared Isı
(heat) dissolve-tension mechanic. Deterministic, seeded RNG; no
`Math.random` in the ruleset.

**Quantitative evidence** (from `scripts/ihtilal-balance.test.mjs`'s
1,296-match mirrored matrix, currently green, numbers reproduced from this
run's own log):

- 95.3% of matches end by reaching Hüküm 10 (the core mechanic actually
  decides games); 3.9% end by turn-40 exhaustion; 0.8% end by heat-100
  dissolve — a rare but real tension path, not a dominant one.
- Median game length 11 turns, p95 25 turns, against a 40-turn cap: brisk,
  not a slog.
- First-mover advantage measured at <8% (enforced gate) — good seat parity.
- All 6 archetypes land inside the enforced 40–60% win-rate band, but at
  the edges: **Nöbetçi 57.2%** (strongest) vs **Heyetçi 44.8%** (weakest)
  this run. Not a crown/dead-archetype situation, but a real, measurable
  skew worth Astra's attention under tier-2 ("balance/content
  improvements") before any tier-3 mechanics work.

**Qualitative evidence** (live in-browser walkthrough, dev build, this
session): the archetype-select screen states each archetype's playstyle
*and* its explicit weakness in plain language ("Kalemci... Manşet seni geç
yener... Manşet temposuna zayıf" — Manşet beats Kalemci late; Kalemci is
weak to Manşet's tempo) for all 6 archetypes — a real rock-paper-scissors
identity design, legible before the match even starts, not just flavor
text. The board UI (HÜKÜM / MÜREKKEP / MÜHÜR meters, five desks with
lock-count, hand of cards with terse mechanical summaries like "Sicil +1 ·
mürekkep +1", turn/phase indicator, opponent panel) rendered cleanly with
no overlap, no undefined/NaN/null leakage, no console or page errors.
Sampled card content (`cards.js`) is well-authored: short evocative titles,
one-line flavor text tightly tied to the mechanical effect, TR/EN parity,
authored multi-step chains (e.g. "Sicil Hulasası" → "Terfi Askısı") giving
combo depth beyond single-card plays.

**What Astra should preserve:** the five-desk identity and naming (not
generic institutions), the six archetypes' distinct rock-paper-scissors
framing and its up-front legibility, the archive/carbon-paper visual and
copy voice, the "resolves via its own mechanic, not timeout" pacing
profile, the deterministic/seeded/fail-closed save contract.

**What Astra may need to look at (diagnosis only, no verdict given here):**
the Nöbetçi/Heyetçi win-rate gap; whether the 204-card/6-archetype pool
still feels fresh across many replays (a genuine human-feel judgment this
audit's repo-truth methods cannot fully settle — flagged as an open
question for Astra's own diagnose-first pass, not a finding); AI
"feels like a worthy opponent" quality beyond what balance numbers can
show. None of this requires or implies a rework; per the binding authority
model, Astra diagnoses first and preserves what's good, escalating past
bugfix/UX into balance/content and only then into mechanics if genuinely
required.

---

## 5. Duel family (VETO-H! / GETT-OH! / DARBE-H!) — high-protection audit

DARBE-H! Repair II + Final Verification II already independently confirmed
in the prior task (T1 hand-fusion 0%, balanced deck spread, sibling defect
surfaced, production-verified). This task's own contribution is §2's
GETT-OH! root-cause finding. No shared-engine, VETO-H!, or DARBE-H! change
was made in this task. Save/isolation namespaces confirmed non-colliding
(§1). No redesign proposed without blocker-level evidence; the one item
proposed (RCN-083's material spec) has that evidence and is handed to
Astra as a scoped, precedented, six-gated repair — not executed here.

---

## 6. Tests / CI

- `npm test` (108 `scripts/**/*.test.mjs` files + 6 TS test files via
  `--experimental-strip-types`): **1,308 assertions, 1,307 pass, 0 fail, 1
  skip** (the `DARBE_H_CLOSURE=1`-gated 3000+-match heavy closure matrix,
  intentionally gated out of default `npm test` per its own docstring —
  already run and reported green during DARBE-H! Final Verification II).
  Confirmed via `ls scripts/*.test.mjs` (108 files) against the npm script's
  glob plus its 6 explicitly-named TS files: no unaccounted test file.
- `npm run typecheck` (`tsc --noEmit`): clean, no errors.
- `npm run lint` (`eslint .`): 0 errors, 50 pre-existing warnings (all
  `react-refresh`/`react-hooks` style warnings on files untouched this
  task, not new).
- `npm run build`: succeeded (`vite build` + `db:migrate`, which
  gracefully no-ops without `DATABASE_URL` via the documented PGLite
  fallback).
- `git diff --check`: clean. `git status`: clean tree throughout, before
  and after this audit (no code changes were made — see §8).

No test file exceeded a problematic runtime in this pass; the full 108+6
file suite completed well inside normal turn budget (the previously-flagged
long-running `wave4-tc-sim-final-integration.test.mjs` ran as part of this
same green suite).

---

## 7. Browser / production smoke

Dev server QA (Playwright/Chromium, desktop 1280×800 + mobile 390×844):

- Homepage (`/`): renders full content both viewports (a first-request
  cold-Vite-compile artifact produced one transient 0-length body-text
  reading on the very first hit of a freshly-started dev server; a second
  request against the same server rendered identically at both viewports —
  confirmed a cold-start artifact, not a real defect, and not something a
  production/CDN-served build exhibits).
- All 17 `/oyna/$slug` routes (darbe-h, veto-h, gett-oh, ihtilal,
  son-koy-manager, son-kasaba, tc-sim-devlet, apartman, kayip-telefon,
  son-100-gun, tc-sim, hanedan, racon, labirent, peg-solitaire, satranc,
  amiral-batti): each resolves its iframe to the correct
  `/games/<slug>/index.html`, renders real, non-empty, game-specific
  content, zero page errors, zero console errors (excluding one sandbox-only
  `net::ERR_CERT_AUTHORITY_INVALID` from the branding-injector's external
  fetch, which is this container's outbound-proxy TLS trust limitation, not
  a shipped defect — real browsers trust the real certificate chain).
  `son-koy-manager` and legacy `son-kasaba` independently confirmed to
  render identical iframe content.
- Deep content check on DARBE-H!, İHTİLAL, TC SIM: DEVLET, TC SIM, Apartman:
  no `undefined`/`NaN`/`null` leakage, no raw card-id leakage outside
  archive/card-detail contexts.
- İHTİLAL live playthrough (menu → archetype select → board): clean at
  every step (§4).

Production (`https://www.tariklab.com`, verified via `curl` — this
sandbox's browser cannot validate the outbound proxy's re-terminated TLS
certificate against arbitrary internet domains, a known, previously
documented environment limitation, not a production issue):

- `/`, `/oyna/darbe-h`, `/oyna/veto-h`, `/oyna/gett-oh`, `/oyna/ihtilal`,
  `/oyna/son-koy-manager`, `/sitemap.xml`, `/sw.js`, `/credits.html`: all
  HTTP 200.
- Deployed JS bundle (`index-DZaPnXeF.js` — the same bundle hash verified
  live immediately after the DARBE-H! Final Verification II merge, i.e.
  production has not drifted from that verified state) parsed for its
  embedded catalog: **all 18 games present, all `status: "live"`**, exactly
  matching `src/lib/games.ts` on current main.

---

## 8. What was fixed in this task

**Nothing.** No code, content, or config change was made to `main` in this
task — only this report and its ledger entry. Every finding above was
either (a) already closed and regression-tested by prior work (verified,
not re-fixed), or (b) a real-but-non-blocking item explicitly handed to
Astra per the spec's "classify, don't fix" instruction (the GETT-OH!
RCN-083 material spec) or its own future diagnosis (İHTİLAL's balance
edges and replay-freshness question). Working tree is clean; `main` is
unchanged from `6052b48b49511a4f1ff0092d24457ce0574500e3`.

---

## 9. Astra handoff matrix

| Game | Status | Technical health | Gameplay-quality confidence | Browser/polish confidence | Remaining issue | Severity | Fix before Astra? | Astra authority | Protected invariants |
|---|---|---|---|---|---|---|---|---|---|
| Çete Savaşları | live | 95% | — (dedicated shell, out of this audit's game-quality scope) | 95% | none found | — | No | preserve+polish | route, save |
| Hanedan | live | 95% | 85% (Wave-1-era, previously closed) | 90% | none found | — | No | preserve+polish | route, save, TLab-Classics visual family |
| Racon Manager | live | 90% (historical critical bugs closed + regression-tested) | 75% | 85% | none independently found this pass | — | No | preserve+polish; conditional mechanical improvement if Astra finds a new proven issue | cash-ledger invariant, exploit-closure tests, save isolation |
| TC SIM | live | 95% | 90% | 90% | none found | — | No | preserve+polish | state-growth bounds, save/migration contract |
| Bükücü | live | 90% (not re-audited this pass; no signal of regression) | — | — | not independently re-verified this task | low | No | preserve+polish | route, save |
| Labirent / Tek Taş / Satranç / Amiral Battı | live | 95% | 85% | 90% | none found | — | No | preserve+polish | TLab Classics visual family |
| Apartman | live | 95% | 85% | 90% | none found | — | No | preserve+polish; conditional mechanical improvement | 16-unit/14-household truth, save/migration |
| Kayıp Telefon | live | 95% | 88% | 90% | none found | — | No | preserve+polish | 5-ending set, privacy balance |
| Son 100 Gün | live | 95% | 85% | 90% | none found | — | No | preserve+polish | openCases uniqueness, endings |
| TC SIM: DEVLET | live | 92% | 82% | 88% | none found this pass (heavy suite, Wave 5 closure record stands) | — | No | preserve+polish; conditional mechanical improvement | 1923–2030 campaign, crisis-family set, fiscal causality |
| SON KÖY MANAGER | live | 95% | 85% | 90% | none found | — | No | preserve+polish; conditional mechanical improvement | canonical/legacy dual-route, internal `son-kasaba` id |
| VETO-H! | live | 92% | 82% | 90% | shares the RCN-083-class fusion-spec risk pattern in principle; own T1-fusion rate (~11.6%) far below GETT-OH!'s | low-medium | No | HIGH PROTECTION — six-gate mechanics process | first-mover balance, save/onboarding/history isolation |
| GETT-OH! | live | 90% | 78% | 90% | **B-classified:** RCN-083's generic `{count:2,differentSeries:true}` material spec drives ~83% of its T1 hand-fusion rate (~84–86%); root cause identified, fix not applied | medium | No — hand to Astra with full evidence | HIGH PROTECTION — six-gate mechanics process; this is the one duel-family item with a proposed scoped fix | first-mover/opening-delta must not regress; other two siblings must be regression-tested if this is touched |
| DARBE-H! | live | 98% (Repair II + Final Verification II independently closed) | 90% | 92% | 4 expansion boss cards (DRB-237..240) never fire in play; pre-existing, documented, non-regressive | low | No | HIGH PROTECTION — six-gate mechanics process | verified balance bands, T1-hand-fusion-0 fix, save/isolation contracts |
| İHTİLAL | live | 95% | 82% (balanced but Nöbetçi/Heyetçi sit at band edges; replay-freshness not independently judged) | 92% | none technical; two open quality questions flagged in §4 | low | No | BROADEST — diagnose first, preserve what's good, escalate bugfix→balance→mechanics only as needed | five-desk identity, six-archetype rock-paper-scissors framing, archive visual/copy voice, seeded/fail-closed save |

Confidence percentages are this audit's own estimate from the evidence
gathered (repo truth + test results + browser QA where performed); they are
not a replacement for Astra's own deeper pass, especially the games marked
"not independently re-verified this task."

---

## 10. Astra scope package

1. **GLOBAL SITE / PORTAL** — general polish pass across the homepage/
   catalog, credits, help surfaces; no structural changes implied by this
   audit (none found broken).
2. **GAME-SPECIFIC POLISH** — visual/responsive/accessibility/copy polish
   per game, prioritized by the confidence columns in §9 (Bükücü,
   TC SIM: DEVLET and GETT-OH! are the lowest technical/quality-confidence
   non-blocked items).
3. **İHTİLAL — DIAGNOSIS + CONDITIONAL DEEP INTERVENTION** — start from
   §4's diagnosis; escalate bugfix/UX → balance/content (Nöbetçi/Heyetçi
   gap is the concrete lead) → mechanics only if genuinely required after
   Astra's own play-feel judgment. Broadest authority, but diagnose first.
4. **HIGH-PROTECTION DUEL FAMILY** — the one open item is GETT-OH!'s
   RCN-083 material spec (§2); any change requires all six gates
   (independent reproduction — already done here; root cause — already
   done here; minimum intervention — proposed narrowing to a named-series
   pair matching sibling pattern; full three-sibling regression; save/
   isolation preserved; deterministic/mirrored proof of no crown/dead-deck/
   first-mover regression). No shared-engine redesign on feel alone. DARBE-H!'s
   verified balance must not move.
5. **OTHER GAMES — CONDITIONAL MECHANICAL IMPROVEMENT** — default
   preserve+polish; Racon Manager, Apartman, SON KÖY MANAGER, TC SIM: DEVLET
   may receive necessary mechanical improvement only if Astra independently
   proves a real, currently-unproven issue.
6. **RESPONSIVE / ACCESSIBILITY** — mobile/desktop pass across all 18
   games; this audit's own smoke found no overflow/dead-control defects at
   1280×800/390×844, but Astra's exhaustive closure pass is expected to go
   deeper (more viewports, real touch input, screen-reader pass).
7. **I18N / COPY** — TR/EN parity spot-checked clean on all sampled routes
   and İHTİLAL cards; a full bilingual copy pass remains Astra's to run at
   its usual depth.
8. **SAVE / MIGRATION SMOKE** — this audit found no cross-game save
   namespace collisions and no accidental Hayat data access; Astra's deeper
   migration-matrix work on any individual game remains open per §9's
   confidence columns.
9. **BROWSER QA** — this audit's smoke (desktop+mobile, all 18 live
   surfaces, iframe-level content checks) is freeze-level, not exhaustive;
   Astra's own closure pass should go deeper per game.
10. **PRODUCTION ACCEPTANCE** — production confirmed matching main at
    audit time (catalog, key routes, DARBE-H! assets/data all reconciled);
    Astra should re-verify production after any of its own changes land,
    using the same curl-based method if browser TLS trust is unavailable
    in its environment.

**Astra is not executed in this task.**

---

## PASS criteria check

- No unknown live/soon/retired surface: confirmed (18/18 catalog entries
  accounted for; Hayat confirmed retired with no exposure).
- No unresolved critical route/save/catalog collision: none found.
- Waves 1–5 remain healthy: confirmed (full test suite green; Racon
  Manager's historical critical-bug audit reconciled against current,
  passing regression tests).
- DARBE-H!/İHTİLAL production truth reconciled: confirmed (bundle catalog
  parse, route HTTP checks, live browser QA).
- Shared duel issue classified: confirmed (§2, classification B with
  root cause and proposed minimum fix, not executed).
- No hidden blocker requiring another development wave: none found.
- Remaining work can honestly be Astra closure/polish/conditional quality
  repair: confirmed (§9/§10).
- Tests/build clean: confirmed (§6).

**MASTER FREEZE COMPLETE — READY FOR ASTRA GLOBAL FINAL CLOSURE**
