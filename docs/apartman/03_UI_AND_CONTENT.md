# Apartman — UI, Navigation, Content Model

## Visual identity
Building notice board / management ledger aesthetic. Warm fluorescent bureaucracy tone — think a building super's office corkboard and a handwritten dues ledger, not a sleek dashboard. Meeting screens should feel like an agenda printout, not a game menu. Distinct from all four siblings (see `00_MASTER_PLAN.md` Identity Firewall).

## Navigation (top-level tabs, mirrors the proven Çete/Hanedan tab-bar pattern)
- **Bina** (building systems status)
- **Sakinler** (residents list/cards)
- **Toplantı** (agenda + meeting UI, only active near meeting week)
- **Kasa** (finance ledger)
- **Bülten** (notice board / history)

## Mobile behavior
Bottom tab bar on mobile (<768px), side nav on desktop — same responsive pattern already proven in Çete Savaşları's `game-shell.tsx`. Meeting/vote modal must have internal scroll and fit within 320–430px viewports without horizontal overflow (per `SHARED_TEST_RELEASE_CONTRACT.md`'s browser gate).

## Content model
- **Building systems**: fixed list of ~8 (elevator, roof, plumbing, electricity, heating, entrance, parking, cleaning/security/common areas combined or split — final count decided at Sprint 2 content pass, Terra's job).
- **Issue templates**: data-driven, ~30–50 for V1 (Section 27 target), each with `{kind, severity, systemId|null, resolutionOptions: [{label, cost, durability, popularity, legality}]}` — the five-axis tension from `00_PRODUCT_IDENTITY.md`.
- **Meeting archetypes**: 4–6 for V1 (routine, budget crisis, complaint pile-up, election term, emergency).
- **Resident archetypes**: 12–20 for V1, each a trait/tendency template Terra can vary into individual households.

## Dead-control discipline
Every disabled action in the UI must show why (insufficient kasa, no quorum, issue already deferred) — matches the shared UI rule (Section 14): dead control = 0, silent no-op = 0, misleading enabled = 0.
