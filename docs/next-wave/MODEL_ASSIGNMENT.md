# Model Assignment — Next Wave Production Pipeline

## Default pipeline (all games)

| Model | Use for | Do not use for |
|---|---|---|
| **Sonnet** | Architecture, system contracts, sprint briefs, ambiguity resolution | Bulk implementation coding (unless nothing else is available) |
| **Luna** | State plumbing, UI implementation, migration, straightforward systems, repetitive mechanical code | Architecture decisions, content authoring |
| **Terra** | Content/data packs, event variation, structured content generation, fixtures | Core engine/state logic |
| **Grok** | Türkiye realism, cultural/social tone, local detail, event authenticity, content red-team, de-cringe pass | Architecture, core state logic |
| **Opus** | Deep cross-system bugs, invariant failures, complicated save/history problems, architecture deadlocks, hard integration | Routine implementation, content, first-pass architecture |
| **Astra** | Final cross-system integration, exploit red-team, browser/mobile acceptance, production closure, main/deploy verification | Content, routine implementation, early architecture |

Opus is escalation-only — never the default. Astra is last-mile only — never first for content or routine build work.

## Per-game plan

| Game | Sonnet | Luna | Terra | Grok | Opus | Astra |
|---|---|---|---|---|---|---|
| Apartman | Architecture lock (this doc) | Main build (building/finance/issue engine, meeting UI) | Resident/household content packs, issue-template library | Apartment-life realism (dues culture, komşuluk dynamics, bina siyaseti tone) | Only if the vote/meeting resolution logic produces a genuine invariant failure | Final desktop/mobile acceptance + main integration once V1 is stable |
| Son 100 Gün | Pacing/scenario contract (this doc) | Core implementation (time ledger, obligation queue, scenario state) | Scenario/event/obligation-template packs | Türkiye-specific life realism (borç kültürü, aile beklentisi tone) | Only if scarcity pacing produces exploit or invariant issues | Final acceptance |
| Hayat | Long Shadow architecture (this doc) | Engine/UI (chapter transitions, shadow-callback resolution) | Life-event content packs | Realism/tone pass on major-decision writing | Only if delayed-consequence consistency breaks across chapters | Final acceptance |
| Kayıp Telefon | Discovery/state architecture (this doc) | Phone UI/state (apps shell, unlock logic) | Phone content packs (messages, contacts, clue chains) | Message/social realism, red-team for privacy-mechanic taste | Only if the discovery graph's branching logic deadlocks | Final acceptance |
| TC SIM: DEVLET | Architecture/sprint contracts, this pass's delta docs | Core implementation (once Sprint 0 begins) | Structured institutional/event data | Türkiye historical/social realism | Hard systemic/invariant issues (entropy, implementation-rate math) | Final integrated release, after the other four have proven the pipeline |

## Escalation discipline

- Opus is called only when a Luna/Terra/Grok pass has already tried and failed on the same concrete bug, and the failure is one of: cross-system state corruption, a broken invariant a test contract already caught, or an architecture-level deadlock (two required systems cannot both be true at once as currently specified).
- Astra is called only once a game has: passing unit/system/save tests, a clean build, and no known exploit from the shared exploit checklist. Astra's job is acceptance and integration, not first-pass bug-fixing.
