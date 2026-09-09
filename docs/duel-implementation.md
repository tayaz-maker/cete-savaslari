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

Status: implementation in progress, not released.

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
