# VETO-H! / GETT-OH! implementation contract

Baseline: 73a7ee36e5d87f300e219984fec6a186be782e65.
Release gate: neither game enters catalog/resources until all acceptance passes.

## Boundaries

`public/games/duel-core/` owns pure deterministic rules, declarative effects,
public projections, deck generation, AI, persistence and DOM adapters.
Theme folders own card definitions, labels, local assets and CSS tokens.
No engine import of theme-specific names. No runtime prose parser.

Commands carry the expected revision. Validation runs before a cloned transaction;
failure returns the original state. Response/choice transactions are serialized
explicitly, and cannot be rerolled. UI selections, archive and language are not
gameplay state. AI receives a public projection, never opposing hand/deck IDs.

## Visual contract

DOM/CSS 2.5D: opponent above and visually recessed, player foreground; center
phase strip, left log, right inspector, bottom hand. Separate recessed unit and
support rows (five each), field/auxiliary/grave/banished piles. Mobile tap-first,
horizontal hand only, inspector sheet. 150–350ms presentation-only animations;
reduced-motion eliminates movement. No WebGL or baked screenshot UI.

## Source normalization register

- SND-066 and SND-080 inherit the complete definitions of SND-065 and SND-079,
  retaining their source IDs and names; copy limits count names, not IDs.
- SND-061: source `?` becomes numeric base 0 with the explicit dynamic ATK formula.
- RCN lists 18 normal + 7 counter traps for only 24 IDs (127–150). The dual-mode
  resolution below preserves both effects without inventing ID 151.
- Master overrides first-turn draw, names/routes and independent game menus.

Status: game acceptance passed at 9e3ccf0dc7dd9a442579c9653d68b855cdf4656b; catalog/resources integration follows that gate.

## Explicit source resolutions

- RCN-149 keeps **Tanımıyorum**, with **Semt Korudu** as an alternate timing mode.
  Targeted-effect mode negates the declared effect; battle mode prevents one
  destruction of the defending unit while preserving damage. RCN-150 remains
  **Konsey Durdurdu**. This combines two source entries into one dual-mode record
  because the source supplies 25 trap names for 24 IDs. No effect is discarded.
- No separate **Kurultay** ritual spell exists in the supplied SND rows. Rather
  than invent card 151, SND-065/066 **Kurultay Delegesi** enables the rite and is
  consumed in addition to level materials. This authored interpretation is shown
  in TR/EN card details and must be reported as a source clarification.
- RCN-090 **Yemin Metni** retains its source unit statistics and also enables the
  ritual action, being consumed when used as the rite. Ritual summons without an
  enabler are not legal.
- The source section headings disagree with the actual row categories. The
  implemented row totals are SND 82 units / 42 spells / 26 traps and RCN
  90 units / 36 spells / 24 traps, with 150 IDs in each theme.
- Activated unit abilities without an explicit repetition limit use one activation
  per turn; explicitly once-per-duel effects keep their separate persistent right.
- RCN-034 uses the source's explicit Wall-token alternative (0 ATK / 1000 DEF).
- Destruction-specific reactions have their own single post-destruction window,
  restricted to that trigger. They do not reopen the original attack/effect chain.

## Checkpoints

- 261ecbed708a9dfdfff59205c8eaaca6f688a502: preserved WIP engine, definitions,
  menus/archive and original CSS 2.5D table; no catalog changes. Vercel preview
  reported success; preview requires Vercel login in the cloud browser.
- 73e176441492a6de021d9f8b33b5bfc545d40fee: targeted acceptance and CI Chromium
  harness; source/cost/ritual refinements. Still not accepted for release.

- SND-113's original “no further activation in this chain” text would do nothing
  under the mandatory one-response cap. Its explicit single-window adaptation
  protects the player's next declared action that turn against a response.
  The card is proactive, not a response to an already single-response window;
  TR/EN inspectors disclose this interpretation.

## Regression boundaries

Activation costs, Quick-Play surcharges, normal tributes and declared special/ritual
materials are committed before an opponent response. Negation does not refund them.
Set equipment uses the same target binding as equipment played from hand. A source
explicit direct-attack exception (Market Stall) remains separate from ordinary
untargetability. A zone occupied during a response cannot produce a phantom summon.

Perspective is applied to the table itself, never the ancestor of the fixed action
dock. Opposing cards remain above the board surface. Presentation-only animation
layers are contained and canceled on viewport changes; they cannot add horizontal
page overflow. No animation changes timing, damage, state or save boundaries.

The full automated acceptance runs in the existing GitHub CI: all MJS/TS tests,
500 deterministic AI duels per theme, typecheck, lint, production build, real
Chromium duel interaction and the existing sitewide responsive regression.
The card integrity suite checks nested effect operations and referenced IDs, not
only top-level handler names. Exact final run evidence is recorded at release.

## Accepted game evidence (before catalog integration)

CI run 34343174503: full regression PASS (920 MJS, 50 TS), 20,000 seeded
decks, 500 completed AI duels per theme, typecheck, lint (0 errors; existing
46 warnings), production build, 112 duel viewport checks and the 15-game
sitewide Chromium regression. Archive traversal covers every one of the 150
IDs per theme, plus search/filter, 40-card pregame preview, reload equality,
language synchronization, keyboard dismissal and reduced motion.

Mean/median turns: VETO-H! 10.168/8, GETT-OH! 8.054/7. No illegal moves,
cap hits or stuck games in these 1,000 duels. Cloud-browser preview also
verified a summon, face-down battle reveal, opposing trap activation and
the consumed attack right. Catalog/resources release follows this checkpoint.

Vercel preview succeeded. The separate Cloudflare Workers check already
failed on accepted main 73a7ee36 and continues to fail on the feature branch;
no Cloudflare account or deployment settings were changed.

A final interactive check exposed an AI mutual-destruction play against an empty
opposing field. The public-information heuristic now declines that harmful trade.
A related exact-count regression prevents Consensus from exchanging one unit for
a two-material summon; if a response removes a required material, the remaining
exchange fizzles visibly without taking a partial payment. Both paths have targeted
regressions and require the final complete CI gate again before main integration.

## 600-card expansion and illustrated table (2026-09-09)

Source baseline: `f5dc6a7dccdea8ac1e63d8de5a3557624ce65111`.
Recovery preserves PR #20 (`astra/duel-600-closure`, `9d11e517`) and the later
local work. The original 150 definitions in each theme are pinned as full
objects and remain unchanged, including effect text, costs and traits.

Both pools now have 300 sequential IDs. SND-151–300 adds 88 units, 37 campaigns
and 25 scandals; RCN-151–300 adds 90 units, 35 racon spells and 25 tip-offs.
New cards use the existing declarative effect registry; no new effect primitive
or alternate rules engine is introduced. The only rules addition checks a new
`requiresFreeZone` trait before spending activation costs. This prevents an
expansion summon/control/set effect from paying into a full destination row.
The source can free its own occupied zone through a declared self-move cost.
Old cards do not acquire the trait. Expansion traps retain their legacy
Scandal/Tip-off search identity alongside their family.

New deck generation biases two seeded families while keeping the existing
40-card contract and auxiliary separation. The larger pool and family weighting
change newly generated decks for historical seeds. Existing active saves never
call deck generation: catalog identity, exact deck order, next draw, hand,
response, set age and spent action rights survive unchanged. Save version is 1.

The presentation adapter uses Draw Card, Go to Main Phase, Enter Debate/Clash,
End Debate/Clash and End Turn. The first turn cannot enter battle. An empty
End Phase finishes in the same UI transaction; required discards, pending
responses/choices and optional position actions still stop for input. Engine
phase commands and timing remain canonical. Cards show base/current stats,
spent activation/attack indicators and a dashed response-ready marker.

Political campaign headquarters and an Istanbul kahvehane frame the respective
DOM tables. Card art has stable SND/RCN paths; original family atlases are cropped
to 400×300 WebP, with provenance and per-card hashes in the art manifests.
Lossless JSON source packs unpack before dev/test/build to ordinary local static
WebP assets. Packs themselves are outside public output. The opening menu requests
no card art; archive pages expose 24 cards with lazy image decoding. No 600-card
precache is added. Archive filters cover kind, subtype, series, level, ATK range
and main/auxiliary deck; navigation remains state-neutral.

Recovery validation: 20,000 full-pool decks had zero contract violations and
reached all 300 IDs per theme. VETO mulligans 576/10,000, high-level initial
bricks 80/10,000; GETT 565 and 122 respectively. Across 500 AI duels per theme:
VETO mean/median/max turns 8.484/7/31, wins 236/264; GETT 9.912/8/36,
wins 257/243. No illegal action, stuck duel, turn-one finish or deck-out.
These are deterministic sample results, not a claim of perfect competitive balance.
Final visual, full-regression and deployment acceptance follows completion of art.
