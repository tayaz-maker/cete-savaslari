# Kayıp Telefon — State, Discovery Model, Privacy Model, Event Contract

## Core loop
1. Player opens an app on the phone (Mesajlar, Aramalar, Fotoğraflar, etc.).
2. Player inspects an item; inspecting may reveal a new contact, date, file reference, or clue.
3. Discovering enough related items connects a node in the discovery graph, which may unlock a previously-locked app section or item (`unlockGates[]`).
4. Certain inspections raise `privacyPressure`/`ownerRisk`.
5. Player may act on accumulated understanding: connect a clue explicitly, reveal information to someone, or decide to return/stop investigating the phone.
6. Game ends when the player chooses to stop, or a privacy-pressure threshold forces a consequence.

## State model
```
{
  discoveredItems: string[]        // item ids seen
  unlockedApps: string[]           // app ids currently accessible
  contacts: Record<contactId, { known: boolean, name?: string, relationship?: string }>
  threads: Record<threadId, { discoveredMessageIds: string[] }>
  clues: Record<clueId, { discovered: boolean }>
  hypotheses: string[]              // player-connected clue-graph nodes (explicit "connect clue" actions)
  privacyPressure: number           // 0-100
  ownerRisk: number                 // 0-100, chance/severity of owner noticing intrusion
  flags: Record<string, boolean>
  openGates: string[]               // unlockGates not yet satisfied
  timeline: Array<{ discoveredAt: number /* action index */, itemId }>
  endingState: string | null
  seed: number
  savedAt: number
}
```

## Discovery model
- Each discoverable item declares its prerequisite discoveries (`requiresItems: string[]`, `requiresContacts: string[]`) — a content-authoring concern (phone-profile data), not engine logic beyond the gate-check function.
- `unlockGates[]` resolve when their prerequisite set is a subset of `discoveredItems`/known `contacts`.

## Privacy model
- Certain inspection actions (reading a diary-like note, opening a password-protected file) add to `privacyPressure` and/or `ownerRisk` explicitly and visibly — the player should see the cost before committing, mirroring Son 100 Gün's "visible opportunity cost" principle applied to intrusion instead of time.
- Crossing a privacy threshold can trigger an irreversible consequence (owner notices, a moral-weight ending flag sets) — this is content-defined per phone profile, engine-enforced as a threshold check.

## Event contract (adapted)
`ITEM INSPECTED → DISCOVERY RECORDED → GATE CHECK (does this unlock new content?) → PRIVACY CHECK (does this raise pressure/risk?) → PLAYER KNOWLEDGE UPDATED (hypotheses available to connect) → OPTIONAL PLAYER ACTION (connect clue / reveal / stop) → CONSEQUENCE → TIMELINE ENTRY`

Differs from the raw shared contract by having two parallel checks (unlock-gate and privacy) fire off a single "inspect" action rather than one linear resolution — the signature mechanic requires both consequences to be tracked from the same action.

## OpenCase / delayed consequence model
`openGates[]` are the adapted `openCases[]` — instead of resolving at a future date, they resolve when their discovery prerequisites are met, which may happen much later in play (e.g., a locked folder that only opens once three specific contacts are identified).

## Progression
% of discovery graph uncovered, tracked continuously; no XP.

## Failure / ending / continuation
No failure state in the traditional sense — every playthrough ends in one of ≥3 defined endings (Sprint 1 target), determined by discovery completeness + accumulated privacy-pressure/owner-risk + any explicit reveal/return choices made.

## Save schema
If V1 ships a single phone (recommended): `tariklab::kayip-telefon:case`, no slot number, single save. If V1 ships multiple phone profiles with parallel progress: `tariklab::kayip-telefon:<slot>` per the standard.

## Migration strategy
`v: 1` passthrough validator; decision on slot-vs-single-save format is locked before Sprint 0 begins (affects the save key shape).

## Determinism/randomness policy
See `01_REUSE_ARCHITECTURE.md`.

## Performance/bounds
`timeline[]` capped at the total discoverable-item count for the phone profile (naturally bounded — a finite phone has a finite number of things to find, per Section 27's "20–30 discoverable items" V1 target).
