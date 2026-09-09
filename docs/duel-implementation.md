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

## Source normalization register (pending complete implementation)

- SND-066 and SND-080 inherit the complete definitions of SND-065 and SND-079,
  retaining their source IDs and names; copy limits count names, not IDs.
- SND-061: source `?` becomes numeric base 0 with the explicit dynamic ATK formula.
- RCN lists 18 normal + 7 counter traps for only 24 IDs (127–150). This conflict
  must be resolved explicitly without silently dropping an effect or inventing ID 151.
- Master overrides first-turn draw, names/routes and independent game menus.

Status: implementation in progress, not released.
