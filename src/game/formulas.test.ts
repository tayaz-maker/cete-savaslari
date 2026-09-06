import assert from "node:assert/strict";
import { test } from "node:test";
import { hydratePlayer, turfHaraçHourly } from "./data.ts";
import {
  applyXp,
  freeCrew,
  jailChance,
  jobSuccessChance,
  missionCrewBlock,
  missionCrewNeed,
  playerCombat,
  RISK_DMG,
  xpToNext,
} from "./formulas.ts";

function p(over: Record<string, unknown> = {}) {
  return hydratePlayer({
    name: "Test",
    neighborhood: "eyup",
    ...over,
  });
}

test("xpToNext artar", () => {
  assert.ok(xpToNext(2) > xpToNext(1));
  assert.ok(xpToNext(10) > xpToNext(5));
});

test("applyXp kıdem yükseltir", () => {
  const player = p({ level: 1, xp: 0 });
  const need = xpToNext(1);
  const out = applyXp(player, need);
  assert.equal(out.level, 2);
  assert.ok(out.notes.length >= 1);
});

test("hasar aralıkları riskle büyür", () => {
  const low = RISK_DMG.Düşük;
  const crit = RISK_DMG.Kritik;
  assert.ok(crit[0] > low[0]);
  assert.ok(crit[1] > low[1]);
});

test("şans itibar ve kıdemle artar, emniyetle düşer", () => {
  const base = jobSuccessChance(p({ level: 1, itibar: 0, isi: 0 }), "Orta", "j101");
  const high = jobSuccessChance(p({ level: 8, itibar: 80, isi: 0 }), "Orta", "j101");
  const hot = jobSuccessChance(p({ level: 1, itibar: 0, isi: 80 }), "Orta", "j101");
  assert.ok(high > base);
  assert.ok(hot < base);
});

test("jailChance avukat ile düşer", () => {
  const a = jailChance(p({ crew: [] }), "Yüksek");
  const b = jailChance(p({ crew: ["avukat"] }), "Yüksek");
  assert.ok(b < a);
});

test("playerCombat sultangazi ve tetik ekler", () => {
  const plain = playerCombat(p({ neighborhood: "eyup", level: 3 }));
  const sg = playerCombat(p({ neighborhood: "sultangazi", level: 3, crew: ["tetik"] }));
  assert.ok(sg.atk > plain.atk);
});

test("riskli işler serbest ekip ister", () => {
  assert.equal(missionCrewNeed("Düşük"), 0);
  assert.equal(missionCrewNeed("Orta"), 1);
  assert.equal(missionCrewNeed("Kritik"), 2);
  const empty = p({ crew: [] });
  assert.match(missionCrewBlock(empty, "Orta"), /adam/);
  assert.equal(missionCrewBlock(empty, "Düşük"), "");
  const ready = p({ crew: ["gozcu", "tetik"], crewBusy: { gozcu: 3 } });
  assert.deepEqual(freeCrew(ready), ["tetik"]);
  assert.equal(missionCrewBlock(ready, "Orta"), "");
  assert.match(missionCrewBlock(ready, "Kritik"), /2/);
});

test("yüksek heat semt haraçını kısar", () => {
  const cold = p({ jobsDone: 2, isi: 6, turf: { eyup: 80, tarlabasi: 0, kadikoy: 0, sultangazi: 0 } });
  const hot = p({ jobsDone: 2, isi: 80, turf: { eyup: 80, tarlabasi: 0, kadikoy: 0, sultangazi: 0 } });
  assert.ok(turfHaraçHourly(hot) < turfHaraçHourly(cold));
});
