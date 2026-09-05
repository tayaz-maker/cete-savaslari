# TC SIM V1 — lifetime acceptance

The existing 354-test source is extended additively. SAVE_VERSION remains 5.
No old save receives a death, estate, adult milestone, or past report on load.

## Runtime

`advanceWeek` advances the existing 48-week year, processes Body, then calls
`processLifetimeWeek`. The current life ends once deterministic age/Body
context reaches its bounded longevity threshold. This is a game abstraction,
not a medical prognosis. Healthy and overworked policies have different outcomes.
Normal decisions, incoming transactions, event activation and week advance stop
after death. Month-close income preceding death follows the existing turn order;
no further month is processed for the deceased player.

Adult context starts after derived child age reaches 18. Existing trajectory
selects studying/working/between paths. Child-keyed delayed cases become normal
player events. Support costs money and energy. Insistence only changes the path
when the existing relationship supports influence. Independence and a small
family milestone can emerge; there is no parallel career, wallet or Body engine.
Family formation is not retroactively invented for imported relatives aged 45+.

Estate settlement is atomic with death: cash less recorded relief and accrued
tuition/care obligations, floored at zero, divided deterministically among valid
children. Rented housing is excluded. Receivables are not misclassified as debt.
Uncollected receivables are not converted into cash. Underage children may have a
recorded share but cannot become the player. This is not a legal inheritance model.

Succession promotes the selected child into the normal player schema, preserves
their age, inheritance and compact lineage, and clears old career, pension,
secrets, cases and weekly action use. A contextual family descendant born during
production progression survives the transition. Detailed qualifications never
tracked for the adult child use neutral defaults rather than invented diplomas.
The current player's birthday derives from the successor's actual birth week.

## Reports and bounds

Life reports clone real current data before terminal cleanup. They retain the
last 40 career entries, 20 memories, eight Year Files, household history and
actual children/estate. They never embed prior whole states or prior reports.
At most eight reports survive. Current-life histories reset at succession.
Player memories remain capped at 200, NPC memories at 50, transactions at 120,
career history at 40 and Year Files at 80. After 70, closed cases retain at most
128 records; active cases remain owned and bounded by their existing systems.
Adult milestones are four one-time child-keyed episodes, not weekly offers.

## Acceptance commands

```sh
node --test scripts/tc-sim-*.test.mjs
node scripts/tc-sim-longrun.mjs 520
node scripts/tc-sim-longrun.mjs fuzz
node scripts/tc-sim-longrun.mjs body
node scripts/tc-sim-longrun.mjs household
node scripts/tc-sim-longrun.mjs separation
node scripts/tc-sim-longrun.mjs parenthood
node scripts/tc-sim-longrun.mjs no-child
node scripts/tc-sim-longrun.mjs child-matrix
node scripts/tc-sim-longrun.mjs adult-matrix
node scripts/tc-sim-longrun.mjs lifetime
```

The lifetime policies use real actions, birth, aging, education, work, retirement,
death and successor transitions. No weekly stat reset or direct forced death is
used. Five policies are repeated for deterministic checkpoint comparisons.

UI tests import the actual `app.js`, capture its DOM-boundary event handlers and
exercise all twelve views, moving, education, job start, retirement, saving,
terminal state and succession. They found and repaired the pre-existing wrong
`getRelationshipContext` import. The tests do not claim pixel-level browser QA.
No browser automation or new QA framework is required.

## Release boundaries

No property ownership, investment system, legal pension/inheritance calculator,
localization or full parallel adult-child simulation is included. These are
advanced depth, not missing V1 lifecycle transitions. Publication authentication
is operational; the verified Git bundle preserves exact commit ancestry.
