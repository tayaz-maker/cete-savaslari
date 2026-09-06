# Apartman — Reuse Architecture

## Reuse map (Section 16 requirement)

| Existing TarikLab system | Reuse directly | Adapt | Do not reuse | Reason |
|---|---|---|---|---|
| Time (weekly tick) | — | Racon's weekly cadence, adapted to "building week" with a fixed meeting cadence (every N weeks) | TC SIM's monthly/week-of-month split | Apartman doesn't need TC SIM's calendar depth; Racon's simpler week counter fits |
| Save (3-slot standard) | `tariklab::apartman:<slot>` key scheme, active/legacy-migrated markers | — | — | Standard applies as-is; see `REUSE_FIRST_STANDARD.md` |
| Migration | Corrupt-save-skip pattern (Hanedan/Bükücü/Racon reference) | — | — | Directly portable, no domain coupling |
| Event engine | — | TC SIM's `openCases[]` shape (`{id, sourceId, status, createdAt, resolveWindow}`) becomes an issue's "deferred" state | TC SIM's full `state → condition → event → decision → result → flag/memory/openCase` verbatim | Apartman's issue/meeting flow needs a two-stage resolution (raised → voted-on) TC SIM's single-stage flow doesn't have — see `02_STATE_AND_EVENT_CONTRACT.md` |
| openCases | Field shape | Renamed to `deferredIssues[]`, resolveWindow tied to "next meeting" not calendar days | — | — |
| UI shell | Button/Dialog/StatBar-equivalent components (shared React components under `src/components/ui/`) | — | Racon's specific game-shell layout (tabs: sehir/kahve/baskın/pazar) | New nav: Bina / Sakinler / Toplantı / Kasa / Arşiv |
| Finance | Racon's cash/transaction pattern (`transact`-style ledger entries) | Adapted to building cash + per-resident dues/arrears ledger (two-sided, not single wallet) | Racon's dirty/clean cash-laundering mechanic | Not relevant to Apartman's fantasy |
| Relationships | — | Hanedan's `kronik[]`/`news[]` capped-history pattern for a building "bülten" (notice board log) | Racon's `rel{id, yakin}` single-relationship field | Apartman needs many simultaneous resident relationships, not one |
| Roster | Racon's `people[]` card shape (id, ad, role-ish field, per-entity state) | Renamed to `residents[]`: apartNo, ownerOrTenant, reliability, satisfaction, influence, complaintTendency, alliances/conflicts, traits | — | — |
| Board (turn/shared-device) | — | Not needed — Apartman is single-player, not shared-device | Bükücü's board/turn engine | No multiplayer/hotseat requirement |
| Archive | Hanedan's capped `kronik[]` pattern | Renamed `bulletin[]`, capped at 60 entries | — | — |
| History | — | TC SIM's `addYearHistory`-style yearly/termly summary, renamed `addTermHistory` | — | — |
| Notifications | Racon's `inbox[]` message-log pattern | Renamed `notices[]` (building announcements, dues reminders, meeting results) | — | — |
| Mobile patterns | Current responsive shell (320–430px tested patterns from FAZ B QA this cycle) | — | — | Proven pattern, no changes needed |
| Testing harness | `node --test` MJS + TS pattern, `scripts/*.test.mjs` convention | — | — | Standard across all TarikLab games |

## Do-not-reuse list (explicit)
- Racon's crew/heat/turf/rival system — no equivalent concept in Apartman.
- Any XP/level progression component.
- Bükücü's turn-order/shared-device state — Apartman is single-player.
- TC SIM's Body/relationship-partner/household modules — no personal-life simulation layer in Apartman.

## Determinism/randomness policy
- Meeting vote outcomes for resident-bloc reactions may have a probabilistic "swing vote" component — this must be seeded from state (a per-building seeded PRNG, TC SIM's `nextRandom` pattern) so save/reload cannot be used to re-roll a vote result.
- Issue-occurrence flavor text (which specific complaint wording appears) may be unseeded — zero gameplay consequence.
