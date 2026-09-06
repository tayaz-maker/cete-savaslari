# Hayat — Product Identity

## Player fantasy
One life. Big choices. Consequences return years later. A literary, consequential life sim — fewer systems than TC SIM, far more consequence density.

## What it is NOT
- **Not** TC SIM Lite — this is not TC SIM with fewer dashboard tabs. The whole design goal is fewer systems, more depth of consequence per system.
- **Not** another spreadsheet life sim — resources are minimal by design (see below), the game should read more like a life told in chapters than a dashboard.
- **Not** a collection of random life events — every major event's consequence must be traceable to a specific earlier decision via the Uzun Gölge mechanic, not generic random flavor.

## Signature mechanic: Uzun Gölge / Long Shadow
A major decision can create a durable "shadow": `{sourceDecision, category, peopleInvolved, intensity, creationAge, possibleFutureWindows, resolutionState}`. Years later, a shadow may reopen, change an event, unlock an opportunity, create regret, strengthen a relationship, create a debt/obligation, or alter the final Life Report. This is the one mechanic that makes Hayat distinct from every other TarikLab life-adjacent game — Son 100 Gün's obligations resolve within the same 100-day run; Hayat's shadows are explicitly meant to surface **years** later.

## Base engine
Primary reuse: TC SIM (time/event/save engine), but not its full breadth — Hayat intentionally strips TC SIM's dashboard down to ~6 core resources and adds the shadow-callback system TC SIM does not have.

## Time model
Not TC SIM's weekly turns by default. Compressed timeline: yearly chapters, with quarterly/seasonal turns inside major chapters, or major-event-driven time jumps between chapters — final choice locked in `02_STATE_AND_EVENT_CONTRACT.md`. The game should feel like turning pages in a life, not clicking through weeks.

## Content structure
Major life chapters: leaving home, work, love, family, ambition, loss, aging, legacy.

## Progression
No XP. Progress = years lived, chapters completed, shadows resolved/unresolved, relationship states.

## Ending
Life Report focused on key choices, shadows (resolved and unresolved), relationships, missed paths, and long-term consequences — not a stat dump.
