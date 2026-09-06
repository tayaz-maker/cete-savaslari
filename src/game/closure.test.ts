import assert from "node:assert/strict";
import test from "node:test";
import { hydratePlayer, ALL_MISSIONS, SAVE_KEY, MARKET_START } from "./data.ts";
import { freeCrew } from "./formulas.ts";
import { validateSaveSlice } from "./save-validation.ts";

const data = new Map<string, string>();
let fail = false;
const storage = {
  getItem: (k: string) => { if (fail) throw Error("denied"); return data.get(k) ?? null; },
  setItem: (k: string, v: string) => { if (fail) throw Error("quota"); data.set(k, v); },
  removeItem: (k: string) => { if (fail) throw Error("denied"); data.delete(k); },
};
Object.assign(globalThis, {
  window: { localStorage: storage, location: { search: "" }, addEventListener() {} },
  document: { addEventListener() {} },
});
const { useGame } = await import("./store.ts");
const state = () => useGame.getState();
function fresh() { fail = false; data.clear(); state().loadSlot(1); state().createPlayer("Test", "eyup"); }

test("three complete worlds roundtrip independently and writes cannot follow another tab", () => {
  fresh();
  for (const slot of [1, 2, 3] as const) {
    assert.equal(state().loadSlot(slot), true);
    state().createPlayer(`Slot${slot}`, "eyup");
    useGame.setState({ player: hydratePlayer({ ...state().player!, jobsDone: slot, cash: slot * 1000, crew: ["gozcu"], crewBusy: { gozcu: slot }, isi: slot * 20, turf: { eyup: slot * 20, kadikoy: 0, tarlabasi: 0, sultangazi: 0 } }) });
    assert.equal(state().saveToSlot(slot), true);
  }
  for (const slot of [1, 2, 3] as const) {
    assert.equal(state().loadSlot(slot), true);
    assert.equal(state().player!.name, `Slot${slot}`);
    assert.equal(state().player!.cash, slot * 1000);
    assert.equal(state().player!.crewBusy.gozcu, slot);
    assert.equal(state().player!.isi, slot * 20);
    assert.equal(state().player!.turf.eyup, slot * 20);
  }
  const sibling = data.get("tariklab::cete:2");
  data.set("tariklab::cete:active", "2");
  state().tick();
  assert.equal(data.get("tariklab::cete:2"), sibling);
});

test("invalid and partial loads are atomic; empty slots never revive legacy", () => {
  fresh();
  const before = state().player;
  for (const raw of ["{", "null", "[]", "{}", '{"player":7}', '{"player":{"name":"X","neighborhood":"eyup","cash":"999"}}', '{"player":null,"rivals":[null]}']) {
    data.set("tariklab::cete:2", raw);
    assert.equal(state().loadSlot(2), false, raw);
    assert.equal(state().player, before);
    assert.equal(state().activeSlot, 1);
  }
  data.set(SAVE_KEY, data.get("tariklab::cete:1")!);
  data.delete("tariklab::cete:3");
  assert.equal(state().loadSlot(3), true);
  assert.equal(state().player, null);
  assert.equal(state().activeSlot, 3);
});

test("storage failure preserves live slot and rejected action", () => {
  fresh(); const before = state().player;
  fail = true;
  assert.equal(state().loadSlot(2), false);
  assert.equal(state().saveToSlot(2), false);
  assert.equal(state().clearPlaySlot(1), false);
  assert.equal(state().player, before);
  fail = false;
});

test("ghost and duplicate crew cannot fulfill mission requirements", () => {
  const p = hydratePlayer({ name: "X", neighborhood: "eyup", crew: ["gozcu", "gozcu", "ghost" as never], crewBusy: { gozcu: 99 }, jobsDone: 1, isi: Infinity, turf: { eyup: 999, kadikoy: -1, tarlabasi: NaN, sultangazi: 30 } });
  assert.deepEqual(p.crew, ["gozcu"]);
  assert.equal(p.crewBusy.gozcu, 8);
  assert.deepEqual(freeCrew(p), []);
  assert.equal(p.turf.eyup, 100);
  assert.equal(p.turf.kadikoy, 0);
  assert.ok(Number.isFinite(p.isi));
});

test("mission validation precedes cost and crew; busy fire/rehire and repeat are blocked", () => {
  fresh();
  const mission = ALL_MISSIONS.find(m => m.risk === "Orta")!;
  useGame.setState({ player: hydratePlayer({ ...state().player!, level: 100, jobsDone: 1, energy: 1000, cash: 100000, itibar: 100, crew: ["gozcu"], inventory: mission.requiredItems ?? [] }) });
  const random = Math.random; Math.random = () => 0;
  try {
    const p = state().player;
    state().doJob("ghost"); assert.equal(state().player, p);
    state().doJob(mission.id);
    assert.ok(state().player!.crewBusy.gozcu! > 0);
    const committed = state().player;
    state().doJob(mission.id); assert.equal(state().player, committed);
    state().fireCrew("gozcu"); assert.equal(state().player, committed);
    const saved = JSON.parse(data.get("tariklab::cete:1")!);
    assert.equal(saved.state.player.cash, committed!.cash);
    assert.deepEqual(saved.state.player.crewBusy, committed!.crewBusy);
    state().loadSlot(1);
    assert.equal(state().player!.cash, committed!.cash);
    assert.deepEqual(state().player!.crewBusy, committed!.crewBusy);
  } finally { Math.random = random; }
});

test("pending ceremony rewards commit once across repeated action and reload", () => {
  fresh();
  useGame.setState({ player: { ...state().player!, jobsDone: 1, pendingSeasonCeremony: { score: 10, title: "Test", bonus: 123 } } });
  state().ackSeason(); const cash = state().player!.cash;
  state().ackSeason(); state().loadSlot(1); state().ackSeason();
  assert.equal(state().player!.cash, cash);
  assert.equal(state().player!.pendingSeasonCeremony, null);
});

test("deterministic 20000-tick simulation stays bounded, serializable and reload-stable", () => {
  fresh();
  useGame.setState({ player: hydratePlayer({ ...state().player!, jobsDone: 50, cash: 1000000, crew: ["gozcu"], crewBusy: { gozcu: 8 }, turf: { eyup: 80, kadikoy: 30, tarlabasi: 20, sultangazi: 10 } }), market: { ...MARKET_START } });
  const random = Math.random; let seed = 73;
  Math.random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
  try {
    for (let i = 0; i < 2500; i++) {
      state().tick(8);
      const s = state();
      validateSaveSlice(s);
      for (const v of Object.values(s.player!.turf)) assert.ok(v >= 0 && v <= 100);
      assert.ok(s.player!.isi >= 0 && s.player!.isi <= 100);
      if (i % 100 === 0) {
        const cash = s.player!.cash;
        assert.equal(s.loadSlot(1), true);
        assert.equal(state().player!.cash, cash);
      }
    }
    assert.ok(data.get("tariklab::cete:1")!.length < 50000);
  } finally { Math.random = random; }
});

test("legitimate pre-mission daily reward survives hydration", () => {
  fresh(); state().claimDaily();
  const cash = state().player!.cash;
  assert.ok(cash > 0);
  state().loadSlot(1);
  assert.equal(state().player!.cash, cash);
  state().claimDaily();
  assert.equal(state().player!.cash, cash);
});
