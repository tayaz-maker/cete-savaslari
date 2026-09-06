# Son 100 Gün — State, Derived State, Event Contract

## Core loop
1. Day begins: obligations due today are shown, action budget (1–2 actions) is available.
2. Player spends actions on scenario-relevant activities; each consumes time and may consume money/energy.
3. Unresolved obligations from earlier days may escalate (interest accrues, relationship cools further) — this is the opportunity-cost bite.
4. Day ends, day counter increments, milestone flags fire at 75/50/25/10/3/final remaining.
5. Day 100: final report across all outcome dimensions.

## Time model
Flat day counter (1–100). Milestone days trigger a mandatory check-in/reflection beat (no new mechanic, just a forced narrative pause reinforcing scarcity). Daily action budget default 2, may drop to 1 under a stress/energy penalty (mirrors TC SIM's critical-health activity-limit pattern).

## Resource model
`money`, `energy` (0–100), `stress` (0–100, inverse of body health), `relationships` (per key NPC, 0–100), `obligations[]` (see below), scenario-specific `goalProgress` (0–100 per scenario objective).

## State schema
```
{
  day: number              // 1..100
  scenarioId: string        // "borc" | "aile" | "is" | "duzen" | "hedef"
  money: number
  energy: number
  stress: number
  relationships: Record<npcId, number>
  obligations: Array<{
    id: string
    kind: string
    dueDay: number
    escalatesAfter: number   // days overdue before consequence fires
    status: "pending" | "resolved" | "escalated" | "missed"
    createdDay: number
  }>
  goalProgress: number       // 0-100, scenario objective completion
  flags: Record<string, boolean>
  history: Array<{ day, text }>   // capped at 100 (one run's worth, naturally bounded)
  seed: number
  savedAt: number
}
```

## Derived state
- Days-remaining = `100 - day`.
- Milestone banner = derived from days-remaining hitting one of the fixed thresholds, not stored.
- Overall pressure score (for UI tension cues) = weighted function of overdue obligations + low energy/high stress, recomputed each day, not persisted.

## Event contract (adapted)
`DAY BEGINS → OBLIGATIONS DUE TODAY SURFACE → PLAYER KNOWLEDGE (what's at stake if ignored) → CHOICE (resolve / defer / ignore, each with an explicit time-and-resource cost shown up front) → RESOLUTION → CONSEQUENCE → ESCALATION CHECK FOR STILL-PENDING OBLIGATIONS → HISTORY`

Differs from the raw shared contract by making the **cost of the choice itself visible before commitment** (opportunity cost must be legible, not just felt after the fact) — this is the signature-mechanic-specific requirement.

## OpenCase / delayed consequence model
`obligations[]` (adapted `openCases[]`). `resolveWindow` = `dueDay`; an obligation not resolved by `dueDay + escalatesAfter` transitions to `escalated` (worse consequence) or `missed` (obligation-specific permanent effect, e.g., a relationship that cannot fully recover in the remaining run).

## Progression
No XP. `goalProgress` toward the chosen scenario's objective, tracked alongside the four other outcome dimensions (money, relationships, body/stress, unresolved-obligations count) independently — final report scores all five, no unified score.

## Failure / ending / continuation
Day 100 always ends the run (hard stop, not a failure state by itself). "Failure" is scenario-specific and dimension-specific (e.g., debts unpaid, key relationship broken) — reported, not gated behind a single game-over screen.

## Save schema
`v: 1`, namespaced `tariklab::son-100-gun:<slot>`. A single run fits comfortably within bounds (100 days of history max).

## Migration strategy
`v: 1` passthrough validator at Sprint 0; no legacy format exists yet.

## Determinism/randomness policy
See `01_REUSE_ARCHITECTURE.md`.

## Performance/bounds
`history[]` naturally capped at 100 entries (one per day, one run). `obligations[]` capped at ~20 concurrent — a scenario generating obligations faster than the player can resolve them is a content-tuning bug, not something the engine needs to defend against with a higher cap.
