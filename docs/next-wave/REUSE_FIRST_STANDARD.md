# Reuse-First Engineering Standard

House rule for every future TarikLab game, distilled from what actually shipped in Çete Savaşları, Hanedan, Bükücü, Racon, and TC SIM. This is the single shared reference — game-specific docs cite this file rather than restating it.

## When to copy an internal system directly

Copy verbatim (same function shapes, same on-disk format style) when the new game's need is **identical in kind**, not just similar in vocabulary:

- The **3 Save Slot** localStorage scheme (see below) — every persistent single-device game copies this exactly.
- Save-corruption handling: a corrupt or unparseable save is **skipped, not thrown** — the game falls back to "empty slot," never crashes on load. Reference: how Hanedan/Bükücü/Racon/TC SIM each guard `JSON.parse`/custom-parse calls around slot reads.
- `savedAt` timestamp + best-effort checksum/versioning line, so a slot-switch re-save is distinguishable from real data drift (this exact pattern was needed to correctly interpret QA results this session — see `docs/cete-savaslari/TECHNICAL_CLOSURE_CHECKPOINT.md`).

## When to adapt

Adapt (same shape, renamed fields, re-scoped bounds) when the underlying pattern is right but the domain differs:

- TC SIM's `openCases[]` → any game with delayed consequences (Son 100 Gün's obligations, Hayat's shadows, DEVLET's sleeping files). Keep the shape `{id, sourceId, status, createdAt, resolveWindow}`; rename the domain fields.
- Racon's weekly job/task queue → Apartman's issue queue. Keep "queue with assigned-resource and resolution phase," drop Racon's crew/heat-specific fields entirely.
- Hanedan's `kronik[]`/`news[]` capped-array history → any game needing a readable in-fiction log. Cap size explicitly (Hanedan caps kronik at 80, archive at 4 on quota pressure) — never let a history array grow unbounded.
- Hanedan's `readOnly` action whitelist (help/save/slot switch stay clickable even mid-crisis/mid-raid) → any game with a "locked" or "resolving" state that shouldn't trap the player away from navigation.

## When NOT to reuse

- Do not reuse a **full game shell** (React shell, vanilla single-file shell) just because it's convenient — Kayıp Telefon explicitly should not borrow a game shell that would make the phone UI feel like a reskinned game screen instead of a phone.
- Do not reuse XP/level progression by default. TC SIM, Racon, Hanedan, Çete all have leveling because their fantasies are personal-growth-shaped. Apartman, Son 100 Gün, Hayat are not — forcing XP onto them is the single most common way a new game becomes an unwanted reskin.
- Do not reuse a game's **specific resource set** (energy/stamina/heat/turf) just because the engine family matches. Reuse the *mechanism* (a capped resource that gates actions), pick new resources that fit the new fantasy.

## How to rename/re-scope state safely

1. Never literally import another game's state module. Copy the function bodies you need into the new game's own module and rename.
2. Prefix every persisted key with the new game's own slug from day one (`tariklab::apartman:*`, never `tariklab::racon:*`).
3. When adapting a schema (e.g., Racon's `people[]` → Apartman's `residents[]`), write the new field names in the new game's own domain language in the very first draft — do not ship a first version with old field names "to be renamed later." That's exactly how a reskin happens by accident.

## How to avoid shared save-key collisions

- Namespace format is fixed: `tariklab::<game-slug>:<slot 1|2|3>`, plus `tariklab::<game-slug>:active` and `tariklab::<game-slug>:legacy-migrated`.
- `<game-slug>` must match the game's catalog `slug` in `src/lib/games.ts` exactly.
- Before writing a new game's first save code, `grep -r "tariklab::<slug>" public/ src/` must return zero pre-existing hits.
- A single-session game with no cross-visit persistence need (per-game call, documented explicitly) does not need to claim a slug prefix at all — see Section 11 exception below.

## How to preserve deterministic behavior

- Any outcome that a reload could exploit (reroll a bad job, retry a failed vote, reopen a resolved case) must be seeded or resolved at decision time, not at render time. TC SIM's `nextRandom(state)` — a seeded PRNG carried in state, not `Math.random()` — is the reference implementation.
- Save/load must never re-roll an unresolved outcome. If a decision was made and its result wasn't yet computed when the save happened, the computation must be deterministic from saved inputs on next load, not re-rolled.
- Procedural *content* variation (flavor text, resident name generation, phone-owner content pack selection) may use unseeded randomness only where a different result on every reload has zero gameplay consequence.

## How to avoid visual reskin syndrome

- Each game's `03_UI_AND_CONTENT.md` must name a visual direction distinct from all four siblings (see `00_MASTER_PLAN.md`'s Identity Firewall table) before any UI code is written.
- A shared component (Button, Dialog, StatBar-equivalent) may be reused at the code level; the *composition and tone* around it must not read as "the same screen with new words." A meeting-agenda ledger and a shrinking-calendar view use the same underlying Button component but look and read nothing alike.

## How to test copied/adapted systems

- A copied/adapted system inherits its origin's exploit test list (see `SHARED_TEST_RELEASE_CONTRACT.md`) automatically — do not re-derive a new exploit checklist per game, apply the shared one and confirm it still applies (e.g., "reload reroll" applies to Apartman's meeting vote outcome exactly as it applied to Çete's mission success roll).

## How to prevent old game-specific assumptions leaking in

- Before adapting a function, read it and list every place it references a domain concept (crew, heat, turf, jobsDone) — every one of those must be either genuinely present in the new game's domain or explicitly removed, never left as a vestigial no-op field "just in case."
- A code reviewer's single most useful question for a next-wave PR: "does this field name make sense to someone who has never played the game it was copied from?"
