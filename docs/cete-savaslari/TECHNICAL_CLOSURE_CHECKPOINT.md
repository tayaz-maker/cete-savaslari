# Çete Savaşları technical closure checkpoint

Status: PARTIAL — not LOCKED; do not merge until browser acceptance is complete.

Recovered previous Work checkout and eight uncommitted files from branch
`astra/cete-final-technical-closure`, based on
`41f371aa60ba051cfa26e76f1ee3437401eea31c`. Remote main was independently checked
through Git fetch and GitHub connector. No earlier changes were discarded.

## Changes

- Validate save structures before live mutation; reject malformed player, rival,
  market and pending reward data while hydrating missing historical fields.
- Empty slots no longer fall back to the legacy single save. Preserve active slot
  on reload and scope autosaves to the live state's slot, including another tab
  changing the active-slot preference.
- Save immediately after state commits, preserving mission cost/reward and crew
  timers together across reload. Storage failure returns false on manual actions.
- Existing Slot 1 seals migration so deleting it cannot revive an older legacy
  save. Corrupt legacy JSON is skipped; game markers remain namespaced.
- Deduplicate and validate crew; bound crewBusy, heat and turf; prevent firing a
  busy member to bypass the assignment cooldown through re-hiring/reloading.
- Preserve legitimate pre-mission daily reward cash on hydration.
- Slot UI reports failed operations, treats corrupt data as occupied and refreshes
  summaries after operations. No gameplay or catalog redesign.
- CI now runs canonical npm test, typecheck, lint and production build.
- Preserve other games' existing legacy dual writes. AccountPanel has no external
  references but was left in place; no auth refactor.

## Verification

- Full MJS suite: 670/670.
- Full TypeScript unit suite: 50/50.
- Includes actual Zustand store tests, malformed/partial load atomicity, storage
  denial/quota, slot 1/2/3, cross-tab slot routing, migration deletion/resurrection,
  crew validation, repeated mission/reward actions, reload and daily reward.
- Deterministic 20,000 ticks: finite state, heat/turf bounds, reload cash equality,
  serializable state and save size below 50 KB.
- Real shared-game save functions roundtrip Slot 1/2: TC SIM, Hanedan, Bukucu,
  Racon. These are Node harness tests, not browser interaction evidence.
- Typecheck PASS. Lint PASS: zero errors, 43 warnings (no blanket ignores added).
- Production build PASS; no database configured, migration correctly skips.

## Remaining mandatory acceptance

- Real desktop and mobile (narrow + phone) interaction QA, console and screenshots.
  Local dev and preview currently fail with `uv_interface_addresses` system error;
  local Chromium is absent and download timed out. Cloud browser reaches the
  production catalog and Çete age gate, but no gameplay QA is claimed.
- Mission/economy/rival acceptance beyond covered automated cases, including full
  browser slot overwrite/reset, navigation, modal keyboard and rapid input.
- Confirm remote CI steps on this checkpoint, then final merge/main CI, Vercel
  production deployment and critical production browser smoke on final SHA.

Keep the checkpoint branch. Continue from it; do not repeat completed work or
mark LOCKED solely from build/unit results. Catalog QA remains out of scope.
