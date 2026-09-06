# Apartman — State, Derived State, Event Contract

## Core loop
1. Player spends a week resolving/inspecting issues and talking to residents (limited actions/week, TC-SIM-style action budget).
2. Issues accrue naturally (building systems degrade, residents complain) and via random-but-seeded events.
3. Every N weeks (Sprint 1: every 8 weeks), a **Toplantı Gecesi** resolves the accumulated agenda via votes.
4. Meeting outcomes update trust/satisfaction/building health and may create new deferred issues.
5. Term ends (Sprint 1: after 1 meeting); full game: election/legitimacy check repeats.

## Time model
Weekly tick, fixed meeting cadence (configurable, default every 8 weeks). No sub-week granularity needed — unlike TC SIM's 2-decision weekly cap, Apartman's action budget is issue-driven, not decision-slot-driven.

## Resource model
- `kasa` (building cash), `acilDurumFonu` (emergency fund)
- Per-resident: `borc` (arrears)
- `guven` (trust in manager), `memnuniyet` per resident (satisfaction), `binaSagligi` (building health, 0–100)
- `meslegiSürdürme`/`legitimacy` score feeding the term-end outcome

## State schema (TypeScript-shape, not literal code)
```
Player-visible root state:
{
  week: number
  term: number
  building: {
    systems: { [systemId: string]: { health: number /* 0-100 */, lastServiced: week } }
    // systems: elevator, roof, plumbing, electricity, heating, entrance, parking, cleaning, security, commonAreas
    kasa: number
    acilDurumFonu: number
  }
  residents: Array<{
    id: string
    apartNo: string
    ownerOrTenant: "owner" | "tenant"
    reliability: number       // payment reliability, 0-100
    satisfaction: number      // 0-100
    influence: number         // 0-100, weight in votes
    complaintTendency: number // 0-100
    alliances: string[]       // resident ids
    conflicts: string[]       // resident ids
    traits: string[]
    borc: number
  }>
  issues: Array<{
    id: string
    systemId: string | null   // null if a social/complaint issue, not a building system
    kind: string               // "leak" | "elevator" | "noise" | "dues" | ...
    severity: "low" | "medium" | "high"
    status: "open" | "deferredToMeeting" | "resolved"
    createdWeek: number
  }>
  deferredIssues: Array<{ id, sourceIssueId, status, createdWeek, resolveWindow: "nextMeeting" }>
  meetingHistory: Array<{ term, week, agenda: string[], votes: Record<string, "for"|"against">, outcome: string }>
  bulletin: Array<{ week, text }>  // capped at 60
  trust: number         // guven, 0-100, manager legitimacy input
  legitimacy: number    // 0-100, drives re-election check
  seed: number          // deterministic PRNG carry, TC SIM `nextRandom` pattern
  savedAt: number
}
```

## Derived state
- `binaSagligi` = weighted average of all `building.systems[*].health`.
- Per-meeting bloc alignment = derived from `residents[*].influence` + `alliances`/`conflicts` graph, not stored directly (recomputed at meeting time from seed).
- Issue backlog pressure = count of `open` + `deferredToMeeting` issues, feeds trust decay if it grows unchecked.

## Event contract (adapted, not the raw shared contract)
`ISSUE RAISED → SEVERITY/VISIBILITY → PLAYER RESPONSE (fix now / defer to meeting / ignore) → IF DEFERRED: AGENDA ITEM → MEETING VOTE → RESOLUTION → CONSEQUENCE (trust/satisfaction/health delta, possible new issue) → BULLETIN ENTRY → HISTORY`

This differs from the raw shared contract (`STATE → CONDITION → ACTIVATION → PLAYER KNOWLEDGE → CHOICE → RESOLUTION → CONSEQUENCE → FOLLOW-UP → CLEANUP → HISTORY`) by inserting an explicit **agenda/vote** stage between choice and resolution — this is the signature-mechanic-specific adaptation Section 13 calls for.

## OpenCase / delayed consequence model
An issue deferred to a meeting becomes a `deferredIssues[]` entry (adapted `openCases[]` shape). It resolves at the next Toplantı Gecesi, not on a calendar date — `resolveWindow` is event-triggered, not time-triggered, which is the one meaningful divergence from TC SIM's date-driven openCases.

## Progression
Building health, financial stability, trust, resident satisfaction (aggregate), manager legitimacy, issue backlog, term/election outcome. No XP.

## Failure / ending / continuation
- **Re-elected**: legitimacy above threshold at term end.
- **Voted out**: legitimacy below threshold.
- **Resign**: player-initiated, always available.
- **Building crisis**: binaSagligi or kasa hits a critical floor — forced ending, distinct from voted-out.
- **Multi-year continuation**: legitimacy comfortably above threshold, game continues without a forced ending screen.

## Save schema
Root object versioned (`v: 1`), namespaced `tariklab::apartman:<slot>`. Fields as above. `bulletin[]` capped at 60, `meetingHistory[]` capped at 20 (older terms summarized, not deleted — TBD exact summarization at Sprint 2, not required for Sprint 0/1).

## Migration strategy
Sprint 0 ships `v: 1`. No legacy format exists yet — migration code is a no-op passthrough that validates and rejects malformed saves (same discipline as the current games' `validateState`-style guards), ready to extend when `v: 2` is needed.

## Determinism/randomness policy
Vote-swing and any severity roll use the state-carried seeded PRNG. Complaint flavor text may be unseeded.

## Performance/bounds
`issues[]` capped at ~40 concurrent (older resolved issues purged, not archived indefinitely). `bulletin[]` capped at 60. `meetingHistory[]` capped at 20. No per-tick (weekly) unbounded array growth.
