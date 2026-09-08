# Son Kasaba — V1 contract

Source: the user's **TARIKLAB_ASTRA_HAYAT_CETE_REFOUNDATION_PLUS_SON_KASABA_MASTER** and its complete Appendix A. The master strengthens the original minimum to seven endings; this implementation uses a 24-month campaign.

## Product and modules

- `public/games/son-kasaba/data.js`: 13 buildings, 8 mutually exclusive population cohorts, 12 named people, 9 interest groups, 7 investor offers and 45 distinct bilingual events.
- `sim.js`: pure deterministic actions, economy, migration, service dependencies, delayed results, identity and endings. No DOM, timers, network or runtime AI.
- `presentation.js`: bilingual read-only panels, effect previews, reports and help.
- `app.js`: pregame/setup and actual control bindings. Commands capture the displayed month so stale callbacks cannot apply to the next month.
- `style.css`: municipal journal/paper identity, compact management layout, responsive navigation and controls.

Reuse is limited to the existing pregame/save/action gate/i18n/navigation helpers. Other games' engines and content packs are not imported into the town simulation.

## Monthly contract

The route only reads slot metadata. Final **YÖNETİMİ DEVRAL / TAKE OFFICE** creates the state. Three decisions per month, no carryover, one decision per subject each month. Closing a building and reopening it in the same month is blocked. Negotiating and accepting one offer in the same month is blocked.

An action validates its subject, current month, capacity and cash before applying costs and effects. Income is booked only by month close. Month close processes income/costs, wear, road/supply/price changes, cohort-specific migration, teacher and group consequences, due follow-ups and unanswered requests. The next agenda then opens. At 24 completed months, all gameplay commands stop and the final report remains saveable.

## Causality and accounting

- Bad roads or unavailable fuel reduce supply; supply disruption increases prices; prices and transport feed each cohort's migration pressure.
- School closure or pupil decline makes Elif leave; education service becomes zero and family migration worsens. Repairing/reopening the school provides a return route.
- Healthcare depends on clinic, pharmacy, medicine stocks and pollution. Retirees weight it more strongly than workers.
- Investors pay one grant in exchange for persistent control and sector changes. Their six-month tax concession lowers business revenue; later rents and inequality enter through saved follow-up files.
- Every group has a different priority. Influence weights contribute to public trust. A temporary coalition reduces building wear and expires after three months.
- Unpaid municipal costs become debt. Debt interest is 1.2% monthly. Emergency borrowing has a 10% principal premium and a 200,000 TL eligibility ceiling.
- A closed building keeps 15% preservation costs and produces no direct service or income.
- Population is the sum of eight separate cohorts; nobody is counted twice. Per-cohort monthly net migration is bounded to −5% departures / +1.5% arrivals before integer rounding.

Identity derives from company control, service viability, population age mix and sector strengths. There is no separate ideology score or single winning score.

## Endings

The deterministic order resolves overlapping outcomes: Ghost (population below 350 or services below 20), Sold (company control at least 55), Divided (inequality at least 68), Rich but Soulless (cash at least 180,000 and identity below 45), Quiet (young/educated below 75 or retirees above 40%), Reborn (population at least 850, young/educated at least 130, trust at least 55 and services at least 50), Resilient (identity at least 50 and trust at least 40), otherwise Quiet.

Each report records the actual contributing population, services, trust, control, inequality, identity, cash and debt. Tests include seven valid final-month fixtures and varied full campaigns, rather than claiming that a single automatic strategy reaches every ending.

## Save and localization

Namespace: `tariklab.nextwave.son-kasaba.slot1` through `slot3`; backups are scoped under the same slot. State version 1 is the first public format; malformed, partial, nonfinite and foreign-game saves are rejected. A corrupt slot can recover its own previous valid snapshot. Failed load preserves the active game. Storage failures leave play in memory with an explicit retry message.

TR/EN prose is stored as pairs; changing language does not advance the clock, spend decisions or change outcomes. No dynamic translation service is used.

## Verification

`scripts/son-kasaba.test.mjs` covers economy, action safety, causal chains, investors, people, coalitions, delayed outcomes, seven final fixtures, corruption and 100 varied 24-month campaigns. `scripts/son-kasaba-browser.mjs` uses real buttons for purchases, negotiation, follow-ups, reload, save and a full campaign in both languages. The canonical CI also measures every live route across mobile, short landscape, tablet and desktop viewports.
