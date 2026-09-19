# TarikLab global final closure — complete under final override

Date: 2026-09-19. Repository: [tayaz-maker/tariklab](https://github.com/tayaz-maker/tariklab).
This is the current release truth. Earlier incomplete checkpoints are preserved in
[the historical checkpoint](archive/ASTRA_GLOBAL_FINAL_CLOSURE_CHECKPOINT.md).
The owner's FINAL COMPLETION OVERRIDE supersedes their earlier browser-gate
interpretation. No new Wave or speculative rework was opened.

## Integration and release identity

- Starting main: `fce9ccd868d773f2e6a7c5a2c29dc376b1414c50`.
- Reviewed local candidate: `f7550dbdfeee85ffd0ab3702cf9332cd339abca7`.
- Published implementation: `455d2601ef70bc4ebf9d08913f3c717cecde788c`.
- Exact shared implementation tree: `134bae0e4b8b43333ca0e01accda540ac4035e05`.
- Main was fast-forwarded to that implementation using GitHub Git-data
  `update_ref(force=false)`; ancestry and the expected main parent were checked.
- Local main was then fast-forwarded to origin/main. No history rewrite,
  force-push, token extraction or credential request.
- This documentation receipt follows the implementation without runtime changes.
  The delivery response records its final main SHA.
- The existing closure branch carries the reviewed application. A local
  `astra/global-final-closure-receipt` branch preserves documentation preparation.
- Local implementation commits `18ff93f`, `e596dd8`, `33e83ac`, `f7550db`
  correspond to published `e75c923`, `38e023d`, `f7b1cce`, `455d260`;
  metadata differs, reviewed trees match at each checkpoint.

## Product changes

- IHTILAL: expose slots 1–3 during play; explicit delete-save confirmation and
  feedback; reject invalid slot indices before storage; synchronize portal/game
  language; document language and pressed semantics; visible Heat/thresholds,
  card costs and lock owner; readable event ledger and terminal report.
- Apartman: resolve building-system, alliance and memory identifiers into
  display labels. Memory labels derive from authored choices; unknown historical
  memories have a readable fallback. Legacy stored identifiers are unchanged.
- Shared vanilla i18n: stop ignoring the first language change; translate newly
  rendered DOM text and accessible labels after moves, with observer writes
  isolated to avoid loops. Add precise classic-board coordinates and critical
  TC SIM/Hanedan/setup/status copy.
- No game engine, policy/event math, deck/card data, AI strategy, win condition,
  balance or shared duel-core changed. Save schemas/namespaces remain compatible.
- No homepage redesign, new content wave, generated art, audio or native work.

## Eighteen-game acceptance record

All 18 remain live. Acceptance combines the executed evidence below with the
passing regressions and production byte checks, as authorized by the override.
“Not executed” is not a claim of interactive browser coverage.

| Game | Executed real-browser evidence | Regression coverage / this closure's action |
|---|---|---|
| Çete Savaşları | Public route and EN age gate rendered; confirmation NOT clicked | Gate source/semantic Button contract inspected; existing game/slot tests passed. Post-gate traversal: **N/A — user age attestation not provided** |
| Hanedan | New dynasty/name and draft reached | Actual slot roundtrips passed; critical setup copy improved; no mechanics changed |
| Racon Manager | New game, origin and first narrative choice | Existing Wave 1/closure and slot regressions passed; preserved |
| TC SIM | New life, Rest, save, refresh, Continue | Wave 4, migration and responsive regressions passed; critical setup EN copy improved |
| Son Mahalle Bükücü | Not executed this pass | Game and actual slot tests passed; route and entry asset verified; preserved |
| Labirent | Move and solution control | Classic game regressions passed; dynamic EN/accessibility labels improved |
| Tek Taş | Legal jump and undo | Classic game regressions passed; dynamic EN/accessibility labels improved |
| Satranç | New two-player game and e2–e4 | Chess regressions passed; dynamic EN/accessibility labels improved |
| Amiral Battı | Auto-placement, battle start and first shot | Battleship regressions passed; accessible grid labels improved |
| Apartman | Setup, authorized elevator-service choice; cash 12,000→9,900, elevator 48→62 | Wave 1/event/save regressions and new display-ID tests passed; latest display correction checked by tests + exact production bytes |
| Kayıp Telefon | New game, open phone, first message, notebook update | Wave 3/evidence/save tests passed; final-confirmation click hit browser-service timeout and is NOT counted as a pass |
| Son 100 Gün | Scenario selection and Rest action | Wave 2/two-action/event/save regressions passed; preserved |
| TC SIM: DEVLET | 1923 campaign/doctrine setup and live desk | Wave 5/era/policy/save regressions passed; preserved; production catalog retains 1923–2030 scope |
| SON KÖY MANAGER | Named village, road funding, close-month click | Wave 2/town/save regressions passed; alias and legacy namespace preserved |
| VETO-H! | Not executed this pass | 1,250 mirrored matches plus full duel regressions passed; preserved |
| GETT-OH! | Setup/draw/deploy/end turn/AI fusion and combat; refresh/Continue | 1,250 mirrored matches plus duel/save tests passed; preserved |
| İHTİLAL | Tutorial, plays, counters, lock feedback; candidate slot 2 save/refresh/load and external EN synchronization | 1,296-match matrix, hostile-save/repeated-reload/UI tests passed; UX/storage guard changes only |
| DARBE-H! | Not executed this pass | 1,250 diagnostic matches plus explicit 3,000+ mirrored heavy closure passed; Repair-II preserved |

There is no newly reproduced release-blocking product defect. Unexecuted
full playthroughs, exhaustive modals/resets and final interactive production
traversal are acknowledged limitations, not silently promoted to PASS.

## İHTİLAL diagnose-first verdict

The observed difficulty was legibility and usable controls: save-slot selection,
hidden Heat value/costs, unclear lock ownership, raw result/event identifiers
and external language desynchronization. The candidate addresses those issues;
slot 2 persistence, language synchronization and card/lock feedback were played
on the deployed candidate. No evidence justified replacing Kalem Masası,
the five desks or the repaired core loop.

Independent unchanged-engine matrix: 1,296 games; 1,235 Hüküm, 51 time and
10 heat/dissolution endings. Median 11 turns, p95 25. Seats: 606/655 wins,
35 draws. Per-archetype W/L/D over 432 appearances:
Kalemci 208/211/13; Hesapçı 203/223/6; Manşetçi 218/206/8;
Koridorcu 207/212/13; Nöbetçi 237/177/18; Heyetçi 188/232/12.
Intervention level: **UX/presentation + invalid-slot guard**, no mechanical change.
A whole-match human playthrough was not completed; no claim is made otherwise.

## High-protection duel verdict

The unmodified diagnostic harness ran 1,250 mirrored matches per sibling,
3,750 total, with zero stuck games.

- GETT: 1,077/1,250 T1 hand fusions (86.16%); RCN-083 most played in all
  five decks; deck rates 43.2–56.4%; first mover 56.7%; median 7, p95 14.
  Observed AI fusion/combat resolved normally. High frequency alone did not
  establish hard dominance or counterplay failure; no repair was justified
  by evidence and no mechanics were changed.
- VETO: 136/1,250 T1 hand fusions (10.88%); deck rates 44.0–62.4%;
  first mover 55.6%. Preserved.
- DARBE: 0/1,250 T1 hand fusions; first mover 59.8%; median 12, p95 25.
  Separate 3,000+ mirrored heavy closure PASS. Repair-II preserved.

Reproduce with `node scripts/darbe-h-diagnose.mjs sibling 1250` and
`DARBE_H_CLOSURE=1 node --test scripts/darbe-h-balance-closure.test.mjs`.

## Executed tests and infrastructure limitations

- Full JS: 1,265 accounted, 1,264 pass, 0 fail, 1 explicitly gated heavy skip.
  That heavy test was separately enabled and passed (3,000+ games, 326.8 s,
  zero skips), so it is not an untested omission.
- TS: 50/50. Build/typecheck PASS. Lint 0 errors, 50 existing warnings.
  No assertion was weakened. Diff check PASS.
- Final override targeted run: 34/34 covering closure UI, shared slots,
  i18n, mobile/static navigation and production-cache behavior.
- Save coverage includes actual Hanedan/Bükücü/Racon slot roundtrips,
  legacy migration/corrupt/foreign/reset isolation across the full suite,
  IHTILAL hostile-state bounds and pending-state reload ×25.
  Browser save/reload specifically executed for IHTILAL, TC SIM and GETT;
  the whole requested matrix was NOT browser-executed in every game.
- TR/EN: critical catalog/UI dictionaries and new first-switch/dynamic-label
  behavior passed regressions; IHTILAL synchronization was executed.
  Some historical narrative/flavor remains Turkish in EN on
  Hanedan/Racon/TC SIM/DEVLET. Full editorial translation is not claimed.
- Accessibility: semantic controls, selection states, visible meters/costs,
  dynamic board labels and navigation focus-return contracts are covered.
  Exhaustive screen-reader/focus traversal was not executed.
- Exact 390×844, 430×932, desktop and large-desktop matrix: **not executed
  in this closure environment**. Earlier real browser interactions used
  the service's default viewport; exact dimensions were not recorded.
  Passing CSS/mobile/navigation regressions are separate evidence.
- Final bounded recovery: existing service timed out refreshing tabs;
  agent-browser/system Chrome/Chromium absent; Playwright-managed Chromium
  absent; one install attempt stopped at 45 seconds after network timeouts.
  Post-integration production DOM smoke also returned the same service timeout.
  No more recovery loop and no synthetic screenshot substituted for a test.
- Çete age gate: source uses a semantic keyboard-operable Button with a
  48px height; layout/text were inspected, runtime focus activation was not.
  No age declaration, click or storage bypass was made for the user.

## Production and cache acceptance

- Public production: `https://tariklab-six.vercel.app/`.
- Implementation main's Vercel status: success after the main update.
- Root + all 18 live routes: **19/19 HTTP 200**.
- 30 critical static assets and 6 root JavaScript bundles matched the local
  reviewed build by SHA-256; catalog contains all 18 routes and DEVLET's
  1923–2030 scope, with no stale 2002–05-only catalog claim.
- Changed IHTILAL app/copy/save/report/style, Apartman app/presentation and
  shared i18n files are included in exact-byte verification.
- Root SW serves module games and i18n network-first with offline fallback.
  Production SW bytes match; regression tests exercise routing/fallback.
  A fresh post-deploy offline/browser-cache traversal was not executed.
- Dashboard/API 403 is observability-only. Git integration works. Preview
  shell-client SSO does not imply production failure. No access bypass.
- Reproducible verifier:
  `node scripts/final-public-smoke.mjs https://tariklab-six.vercel.app --exact-public`.
  This checks HTTP/bytes/catalog; it does not pretend to be a browser test.

## Repository housekeeping and map

92 historical branches: 61 merged + 9 patch-equivalent superseded +
22 uncertain = 92. Seventy deletion candidates are listed below with exact
tips. None physically deleted; uncertain work retained. No force or history
rewrite. Branch deletion remains a non-blocking housekeeping limitation.

Moved root `RACON_MANAGER_AUDIT.md` and `TC_SIM_CURRENT_CANONICAL_HANDOFF.txt`
to `docs/archive/` with historical/superseded notices. The pre-override
closure checkpoint is archived too. Original text and useful history remain.
Historical screenshots/attachments and authored asset inputs remain in place:
age alone was not treated as proof of junk. No runtime files deleted.

- `README.md`: entry point; `docs/README.md`: current documentation index.
- `src/lib/games.ts`: catalog truth; `src/routes/`: portal and play shells.
- `public/games/`: game runtimes, shared engines and authored content.
- `public/i18n/`: shared language layer; `public/sw.js`: cache strategy.
- `scripts/`: tests, diagnostics, branch inventory and public byte verifier.
- `docs/MASTER_FREEZE_CHECK.md`: pre-closure freeze evidence.
- `docs/ASTRA_GLOBAL_FINAL_CLOSURE.md`: this final truth.
- `docs/WEB_APP_SYNC_LEDGER.md`: presentation parity for later native work.
- `docs/archive/`: historical documents, not current defect declarations.
- Native/Godot remains paused; audio disabled.

The final override accepts this combined evidence with the explicitly recorded
limitations. No new reproduced material product blocker remains.

## Historical branch inventory

| Branch | Tip SHA | Relation to baseline main | Classification | Unique work? | Action | Safe deletion? |
|---|---|---|---|---|---|---|
| astra/absolute-v1-final | 265c3e8abe813503fde634f303429509fb49a61b | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/cete-final-technical-closure | c6eb047143c42570ac1fc0bba9217cf1f7659c2e | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/duel-600-closure | 49dde0a6089694fc7346d3b823e85f964ccbbe5a | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/hanedan-mahalle-absolute-final | 5f2cfb2814457c483cfaf2febf1e10413352bece | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/hayat-son-kasaba | a06546991816fcd2ed356f09df9085303e5b754f | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| astra/market-devlet-playability | 6cfb82c85c8ac756c0fb7984063b723e25680126 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| astra/racon-expired-live-fix | bec717e44f126b85e75c94cbb542a4d6824df40f | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/racon-manager-absolute-final | fc3a93e86c292960486f7c603a089c760ccce7bb | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/resources-page | 8e4af5cc66bacc15ff06fdf75468f7287e34dd0d | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/sitewide-ux-quality | c9bad6e0d01b0f7c90091008249eed5079ab58a2 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| astra/tariklab-v1-absolute-final | eed56fc47b5b5c4a29d345d3e4bc6f003d2ee503 | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/tc-desk-language-followup | 21ba6f79828458d6365a9164b63ec13a26b3c88c | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| astra/tc-management-desk | 2c7a5c17366046843f46128ddfc73b0ca2151fc9 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| astra/tc-sim-full-v1-final | 507adfc9364032cdc9557b8fba52f1f60f0304e1 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| astra/tc-sim-mobile-production-final | dec0be1d26c3acbbddc60a1487367899b74992a0 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/veto-gett-duels | afb06101331727aa781a24e94ea574b451aee7c7 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| astra/web-duel-design-refoundation | 6bcc7af4f39f19a6beb4ab522beb4204d2156abb | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/bukucu-game-testing-4mxty5 | fe2a1454a75a2860338aecb499603d73b476d6a8 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/darbe-h-adversarial-review | 45e53610c8ca8ab3b5248a8f67c2551bd4e44433 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/darbe-h-final-verification | 3d82bbd12ba616374f4ba7f4e3bcb90c605d96c3 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/darbe-h-final-verification-2 | 6052b48b49511a4f1ff0092d24457ce0574500e3 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/grok-game-screen-design-8fa30d | 496d4a8fe65a8ae27c56f6f9e0d39512652e3c16 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/tc-sim-devlet-foundation | a462bf9559e56f6a7c857158009fe8cb2e11f366 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| claude/wave2-son100-sonkasaba-review | cc3d2ea45a6b0c108a7a79746bb3d81390e88258 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/wave3-kayip-telefon-review | fad51e98b4cd4d98cde319a67917db5c18f5ef6e | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/wave4-tc-sim-closure-audit | 6ea5f3dc0d62b56f4596245873089eb029df0059 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/wave4-tc-sim-review | 9e9a597212582ad65369e2fc2cc1656a57c028d2 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/wave5-tc-sim-devlet-rereview | fbeaaf90c0b7c9c6390f941acea5b409447f7f1e | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| claude/wave5-tc-sim-devlet-review | 737de1572d163dc624261d3b5c9ad9cbf60a7735 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| codex/live-credits-correction | 657083f142ba8292044067e58ebb8ce542aa06fd | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| content/veto-h-art-prism | 8355384ce00e8f25ee52ae8176e21c65162915b2 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| cowork/tc-sim-3d | 92cc1da7018d1ed937c4b1fce73da87f065ae56e | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-content-integration | 2f27b2c4e834c0a4c3f026160dc09b0207d593e5 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-core-stakes | 2bd0c5a32480d7a5470ce3b01128b124ebf177e7 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-interaction-quality | cc9969b5eac38476ffaf0631c1610722cd0cfda5 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-longgame-pressure | 38afb92d00d9a3b2d180b3373b1545107874f55d | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-missing-screens | dc9a32682d5b842522226494d0115b27c9cc4b69 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-quality-ui-1 | 5c5dcc88f44afe22ed562059a1a1b258c2b78360 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| cowork/tc-sim-ui-polish | a68c116003cf50d090e662f2827360f80aa9f8aa | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| docs/web-app-sync-ledger | 7930504f38c3d7c895573b74acafcd08f769974c | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/ihtilal-final-integration | 149625fa355a4086da1cc1d404ed5866113e9ce7 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/post-wave5-devlet-catalog-closure | ee374e3e1eee0188fe49ab2c8d8cf5ffdc616c09 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave2-son100-sonkasaba-depth | b26da93675b071fd0d385aaa68352a6e051173d9 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave3-kayip-telefon-deduction | 60244de319226b5405c14ec90568c3eec96eba88 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave4-tc-sim-life-depth | a5a65f6e0dcbb0d422ddf5009189d353f55e919a | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave5-tc-sim-devlet-content-final-integration | 14e6b6103c200eee573c959853ab7cde43a83ccd | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave5-tc-sim-devlet-core-repair | df542458eb6909e32d7bfd3526c7899604024501 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave5-tc-sim-devlet-depth | dd521cee751f27078891881f8323ed6e9fd5121a | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| gpt/wave5-tc-sim-devlet-final-integration | a22fce4029b439b6684b2e99cec7894092c75307 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/darbe-h-balance-repair | cbfbffa1a789b9d2801c34dc7423f9020387ba99 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/darbe-h-balance-repair-2 | df44df475f5ca172785eec987e41d29a67cf415f | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/darbe-h-full-wave | 77969b23a6c42b81a2e9a88325dfcac4342d76f7 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/duel-human-ai-analysis-ux | 2d289e2d4916f6eaee329ba83ea9fc25a6cf0c10 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/ihtilal-full-wave-original | c3b06e7eec318855892f1d0eb7d527758052314e | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/next-wave-absolute-depth-pass | 9399b7c38bb7d13676753208d212fd8f5f0e0382 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/next-wave-mega-pass | 2938dcc0576c2a94a2fc161e601ddf7a42d4bd90 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/racon-apartman-content-max | 9f07bed191823e96b4d5c358803415016ddf84f0 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/tariklab-max-pre-final-en | daf379b4bb5b4df8201d9bd7f0b16d4b4bca05d0 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/tc-sim-3d-content-foundation | b7be025617851c9ee0277b5a8e55bc1c97576381 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| grok/tc-sim-adult-life-content | 09b9f6cf5bc0dfb437ea7cd1e399bb13ee80b253 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| grok/tc-sim-content-realism-final | cec4f599fc68b9559f99d198b729293551068fe2 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/tlab-closeout | 41f371aa60ba051cfa26e76f1ee3437401eea31c | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/wave2-max-content-son-koy-manager | 740cf078f1f0eb35b09bbe7348fcd6d7612df218 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/wave3-kayip-telefon-max-content | 52a1999104cc1868f8451f17d3c42cddd5089a5d | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/wave4-tc-sim-late-life-content | 9fded511e44a24b76ec2a05fc70da78505c922e9 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/wave4-tc-sim-max-content | 2f723980d9012af9cd3002b5da90f5e2a70dd959 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| grok/wave5-tc-sim-devlet-max-content | 67668feb148074d8772c01b9c68312ceca999ac0 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| luna/next-wave-5-games-sprint-0 | aefef7b9034dfae06dddb5a603d3cf99ddf19a9f | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| luna/next-wave-5-games-sprint-1 | 485f3f22835c4ed85d048d4e5fdfc527cf42770a | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| luna/next-wave-summary-fix | b8fa927c0c0206cc45ce8f966990cdd9aed7ef84 | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| luna/sprint1-final-regression | 9b9e80defadb89fd6b129b7cd9b1544173e70091 | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| opus/duel-parity-viewport-hotfix | 4a4ef2a37c13badbb370c3f9366cbf96ce9b6f50 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| opus/duel-release-repair | da502c332995823812cfe824799ad3d2d02b2080 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| opus/gameplay-balance-clarity | b9a5b8c7151f567e6fd101204c483f17e9d39e6d | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| opus/hayat-to-tcsim-migration | 82bff1a77e8be35f483a5a4a41cacea76dc22fc4 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| opus/inspector-null-hotfix | 44e657b8e6ba60de1d52286928024da60cc562bc | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| opus/tc-sim-18-35-definitive | a5bcaee2a29678ad1289834bfadc445aace5dc23 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| opus/tc-sim-child-6-17-definitive | 89ec177adf6b3f5d1095fecd6a7a61edaedfbaaa | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| opus/tlab-classics-original-final | 809d3fd479fea6d79e1a2670c8db30c794f33d6f | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| review/depth-framework-racon-apartman | d602fb42cb3a4a88c32eb9710716b325bfc18991 | all unique commits patch-equivalent | superseded | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sol/tc-sim-36-70-ui-definitive | dfe6ec5c8eef289422933c1952d6d47afec2cca0 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| sol/tc-sim-production-qa-final | fac4012a17ba8adc2a46acaa23ace32e8e92cf43 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sol/tc-sim-wealth-lifestyle-final | 0279b8babe6c24deef13594c0bff6f74d735a6bd | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/docs-reconciliation | 9f41682d9f0caae6b88b9f8ee8b9473482d4f930 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/tariklab-credits-help-final | 0d5e208ef8bcc547093cb0057c0e22281033c465 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/tariklab-next-wave-architecture | da51904a0e27fee6569f99eb5ca60e3a4f441b80 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| sonnet/tc-sim-devlet-master-architecture | f7c2ea7194bbae9a55949be4f2d15c09241b1224 | non-ancestor; differing patches require manual review | uncertain | potential; preserve | retain; do not merge blindly | uncertain |
| sonnet/tr-language-howto-closure | 629032203ddb762fe68bb98b54a66c3fe81b8988 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/v1-final-fix-qa-closure | 265c3e8abe813503fde634f303429509fb49a61b | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/veto-gett-card-ratio-fix | 24fbf4071545ab17f04f34d2a5e4d55358a1d71a | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/veto-gett-card-size-inspector-fix | 9424e35f0035c2ec7e0b5155a77c74d5b9ed1645 | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
| sonnet/veto-gett-compact-duel-crossbrowser | 4ed73b9c2f6027ba7bf3678bc11894354fbe20aa | ancestor | merged | no unrepresented patches | deletion candidate; provenance recorded here | yes |
