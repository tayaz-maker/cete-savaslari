# Son 100 Gün — Wave 2 implementation truth

This file describes the shipped Wave 2 implementation. Earlier sprint briefs in this directory are historical design records, not a statement that planned work is live.

The runtime remains the existing two-actions-per-day game and three-slot `tariklab.nextwave.son-100-gun.slotN` save namespace. Save version 2 migrates version 1 in place and adds bounded preparation, actor-memory, phase trace, crisis-chain and event-director state.

The 100 days now use five mechanical phases with exact ranges: 100–81 preparation, 80–61 first fractures, 60–41 resource crisis, 40–21 systemic collapse, and 20–1 final reckoning. Phase pressure changes passive energy cost, available decision families, eligible event families, crisis timing and the value of preparation.

Five deterministic, save-safe crisis chains expose a signal and risk forecast before resolution. Health, cash, people, legal and legacy preparation reduce only the matching risk, so no single preparation covers the run. The seeded roll is stored implicitly by stable seed/day/chain identity and cannot be rerolled by reloading. A resolved chain cannot resolve twice.

The final dossier is terminal and records the five phase entries, matching preparations, forecast risk at each resolved crisis, actor memories, turning points, unresolved files and the existing moral verdict. History, memories, opportunities, missed items and closed cases are bounded.

TR/EN UI labels are provided for the new phase, risk and dossier surfaces. Content itself remains the existing authored catalog; Wave 2 changes selection/reachability and causality rather than inflating event count.
