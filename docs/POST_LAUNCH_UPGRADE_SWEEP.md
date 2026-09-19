# Post-launch upgrade sweep

Date: 2026-09-19. Baseline: `e091644e70f5d257adb96591d0690d065416b701`.
Branch: `astra/post-launch-upgrade-sweep`.

This is a small post-launch repair, not a new Wave or another global closure.
The release commit containing this document is the reviewed candidate; its
published SHA and deployment receipt are recorded in the delivery response.

## Decisions

| Priority | Current evidence | Decision |
| --- | --- | --- |
| P0 | No new release-critical security or data-loss defect established | None invented |
| P1 | Production `sw.js` omitted all hashed JS/CSS. The build plugin matched an obsolete full SHELL declaration and silently failed | Explicit build-assets marker; fail build if marker is missing/duplicated; preserve static shell and existing cache policy |
| P1 | İHTİLAL seed 1, AI turn 6: returning to the menu left an AI callback active; it could end the match and eject the player into the report | Cancel and invalidate timers on menu/new/load; scope each callback to its match |
| P1 | İHTİLAL help/tutorial left keyboard focus in the underlying page; rerender lost card selection focus | Focused modal heading/controls, Tab containment, Escape, inert background and focus return; preserve card/archetype focus |
| P2 | Mobile new-game transition retained setup scroll, hiding initial meters under sticky navigation; narrow labels broke mid-word | Reset scroll on screen changes only; wrap header controls and retain readable mixed-case desk labels on small screens |
| P2 | Terminal saves succeeded or failed without visible feedback | Existing TR/EN messages shown through `role=status`, including quota failure |
| P2 | js-yaml 4.3.1 had a published CPU-exhaustion advisory | Surgical lock-only 4.3.2 update; no unrelated dependency changes |
| P3 | Broad dependency refresh, framework migration, forced deduplication, new portal features and balance changes without evidence | Rejected as unnecessary risk/churn |

## İHTİLAL verdict

The existing rules, five desks, card pool, AI policy, Heat, pacing and win
conditions are preserved. All changes are UI lifecycle, accessibility,
feedback or responsive presentation. Save V1, namespaces and slot data are
unchanged.

A real Chromium match was played through the visible UI: 17 action cycles,
13 card plays, two counters, zero rejected attempted plays, normal Ruling
finish on turn 8 (4–10, Heat 47). Terminal slot 3 save/reload passed. This is
an interaction test, not evidence that one strategy establishes balance.

The existing 1,296-match mirrored matrix was rerun: 1,235 Ruling endings,
51 time endings, 10 dissolution endings; median 11 turns, p95 25; 35 draws.
Seat wins were 606/655. Every archetype remained within the existing 40–60%
decisive-win band. No new evidence warrants a mechanical rework.

## Other product surfaces

- VETO-H!, GETT-OH!, DARBE-H! and shared duel-core: no code, content, deck,
  save or mechanical change. The existing quick balance and sibling regressions
  run in the full suite. High T1 fusion frequency alone remains insufficient
  grounds for a GETT change. The separate expensive 3,000-match DARBE gate was
  not reopened for an unrelated UI/build patch.
- Other 14 games: preserved. Existing game/save/migration tests are retained;
  this sweep does not claim fresh full browser playthroughs of all 18 titles.
- Portal/catalog/navigation/iframe: all 18 cards, TR/EN, IHTILAL portal entry,
  iframe gameplay, reload and browser Back exercised on four viewports.
- Çete Savaşları: public age gate checked only. Post-gate traversal remains
  **N/A — user age attestation not provided**.
- No account, analytics, cloud-save, notification, ad or external product
  service was added. Historical branch cleanup was not reopened.

## Browser, responsive and save evidence

Executed in actual Chromium 153 via the existing Playwright dependency:
390×844, 430×932, 1280×800 and 1920×1080. The temporary browser binary is QA
infrastructure only; it was not added to package.json, the lockfile or product.

For İHTİLAL, every viewport was exercised in TR and EN: help, keyboard
containment/Escape, tutorial, new game, card/desk interaction, slot 2 save,
refresh and load. No horizontal page overflow or page exception occurred.
Screenshots were inspected, including the mobile screen-entry and help-focus
defects before/after repair. The help heading now receives visible initial
focus; ordinary game rerenders preserve scroll.

Eleven deterministic actual-app UI regressions cover stale callbacks,
replacement sessions, normal AI progression, modal behavior, focus, scroll
and terminal success/quota feedback. Existing adversarial codec/migration,
cross-game storage and slot tests remain intact. No namespace migration was
introduced.

The cloud browser service still timed out. Local Chromium restored real
viewport coverage. Public production browser requests use the environment's
working Node HTTP transport to forward actual public responses to Playwright;
they retain production URLs and content. This transport is explicitly
distinguished from the isolated local build/service-worker test.

## PWA and performance

The actual browser worker-upgrade test reproduced zero cached build assets
with the old worker, then 28 build assets plus 10 static shell entries with
the candidate worker. With networking disabled, the portal reloaded and
rendered all 18 cards. The worker was registered directly in an isolated QA
profile; no age attestation or post-gate game traversal was performed.

Module-game assets retain network-first behavior, preserving online deploy
consistency and offline fallback. Cache name and save storage remain stable.
Build-specific SW bytes are now compared with `.output/public/sw.js` by the
production acceptance script rather than with its source template.

All 28 compiled client asset names/sizes match the baseline: 937.90 kB raw,
297.40 kB gzip in the build report. The standalone IHTILAL UI grows modestly
for the interaction repairs. No unmeasured performance claim or speculative
optimization is made. Public timing includes the QA transport and is not a
representative end-user Web Vitals measurement.

## Dependency/tooling and verification

[GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh)
affects js-yaml versions before 4.3.2. In this repo it is used by ESLint and
build tooling; no hostile YAML ingress or production-bundled parser was found.
This is preventative tooling hardening, not a claimed production exploit.
The lock changes only version, archive URL and integrity. npm audit reports
zero vulnerabilities after the patch; normal YAML merge and excessive empty
merge handling were checked.

The final full run accounts for 1,279 JS tests: 1,278 pass, zero failures,
one intentional environment-gated heavy DARBE skip; TypeScript tests pass
50/50. Targeted UI/save/SW regressions pass, as do typecheck, production
build and whitespace checks. Lint has zero errors and 50 pre-existing warnings.
The delivery response records publication/production results. Existing lint warnings
and Nitro's ignored `inlineDynamicImports` warning are pre-existing;
neither was suppressed. Assertions were not weakened.

Future options, without automatic implementation: coordinated ESLint major
maintenance; portal search/favorites if discovery research justifies them.
Neither is required for this repair. Narrative rewrites, balance retuning and
new services are not included.
