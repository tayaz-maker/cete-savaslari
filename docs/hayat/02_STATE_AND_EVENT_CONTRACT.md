# Hayat — State, Derived State, Event Contract

## Core loop
1. Player is in a life chapter (leaving home / work / love / family / ambition / loss / aging / legacy).
2. Within a chapter, the player faces a small number of major decisions (not a weekly grind — this is chapter-paced, not tick-paced).
3. A major decision may create a shadow.
4. Time advances (a season/quarter or a jump to the next chapter).
5. Each time-advance, any shadow whose window has opened has a chance (seeded) to resurface as a callback event.
6. Chapters progress toward aging/legacy; Life Report at the end.

## Time model
Yearly chapters, quarterly turns inside a chapter where the chapter's content calls for finer granularity (e.g., "work" chapter may have 4 quarterly beats; "aging" chapter may be a single yearly beat). Exact per-chapter grain is a content decision (Terra, Sprint 2), not an engine decision — the engine only needs to support both.

## Resource model (minimal, per Section 8's "fewer systems" mandate)
`money`, `health` (0–100), `relationships` (per key NPC, 0–100), `stability` (0–100, a general life-stability scalar replacing TC SIM's household/housing depth), `age`, `commitments[]` (abstract obligations, not TC SIM's household/property depth).

## State schema
```
{
  age: number
  chapter: string            // "leaving_home" | "work" | "love" | "family" | "ambition" | "loss" | "aging" | "legacy"
  chapterProgress: number     // 0-100 within current chapter
  money: number
  health: number
  stability: number
  relationships: Record<npcId, number>
  commitments: string[]       // abstract obligation tags, e.g. "mortgage", "custody"
  shadows: Array<{
    id: string
    sourceDecisionId: string
    category: string
    peopleInvolved: string[]
    intensity: number          // 0-100
    creationAge: number
    possibleFutureWindows: [number, number]  // [ageMin, ageMax]
    resolutionState: "dormant" | "reopened" | "resolved" | "expired"
  }>
  decisionsLog: Array<{ age, chapter, decisionId, choiceId }>  // capped, feeds Life Report
  seed: number
  savedAt: number
}
```

## Derived state
- Life Report's "key choices" list = filtered `decisionsLog` (major decisions only, tagged at authoring time).
- "Missed paths" = decisions where a shadow was created but never resolved (`resolutionState !== "resolved"` at game end).

## Event contract (adapted)
`DECISION MADE → SHADOW CREATED (if the decision is shadow-eligible) → TIME ADVANCES → WINDOW CHECK (is this shadow's window open?) → SEEDED RESURFACE ROLL → IF FIRED: CALLBACK EVENT (may reopen, unlock, create regret, strengthen, create obligation) → RESOLUTION → LIFE REPORT ENTRY`

Differs from the raw shared contract by splitting "activation" into two gates (window-open AND seeded roll) rather than one condition check — this is the signature-mechanic-specific requirement (a shadow shouldn't fire the instant its window opens every time; the *possibility* of it firing across the window is the tension).

## OpenCase / delayed consequence model
`shadows[]` is the adapted `openCases[]`. Unlike TC SIM's short-window cases, a shadow's window can span years and its resolution is probabilistic within that window, not deterministic-at-a-fixed-date.

## Progression
No XP. Years lived, chapters completed, shadows resolved vs. expired-unresolved, relationship states over time.

## Failure / ending / continuation
No hard failure state — the game runs to a natural life-end (old age) or a player-chosen early stop ("Yaşamı burada özetle" option). The Life Report is generated either way.

## Save schema
`v: 1`, namespaced `tariklab::hayat:<slot>`.

## Migration strategy
`v: 1` passthrough validator at Sprint 0.

## Determinism/randomness policy
See `01_REUSE_ARCHITECTURE.md`.

## Performance/bounds
`shadows[]` capped at ~30 concurrent (a life generating more than 30 unresolved shadows is a content-tuning problem). `decisionsLog[]` capped at ~200 (a full lifespan's worth of major decisions, generously sized) — older entries beyond the cap are summarized into the Life Report's aggregate stats, not silently dropped.
