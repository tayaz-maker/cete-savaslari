import test from "node:test";
import assert from "node:assert/strict";
import { normalize } from "../public/games/next-wave.js";
import { hydrateDevlet, tickDevlet, applyPolicy } from "../public/games/next-wave/devlet-sim.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";
import {
  DEVLET_BOUNDS,
  validateDevletDepth,
} from "../public/games/next-wave/devlet-depth.js";

function midCampaign(era = "2002", turns = 80, seed = 5) {
  const s = hydrateDevlet(era, { seed, campaign: true });
  const pool = POLICIES[era];
  for (let i = 0; i < turns; i++) {
    applyPolicy(s, pool[i % pool.length].id);
    tickDevlet(s);
  }
  return s;
}

// Every other game in the dispatcher validates after hydrating; DEVLET only
// hydrated, so validateDevletDepth was dead code and a non-finite save loaded
// cleanly. Most poisoned fields were laundered into plausible numbers over the
// following turns, and taxBurden — which nothing ever writes — stayed NaN for
// the rest of the campaign.
test("a non-finite DEVLET save is refused instead of silently laundered", () => {
  const poisons = {
    "macro.realGrowth": (s) => { s.devletDepth.macro.realGrowth = NaN; },
    "macro.publicDebt": (s) => { s.devletDepth.macro.publicDebt = Infinity; },
    "macro.taxBurden": (s) => { s.devletDepth.macro.taxBurden = NaN; },
    "actual.inflation": (s) => { s.actual.inflation = NaN; },
    heat: (s) => { s.heat = -Infinity; },
    "confidence.household": (s) => { s.devletDepth.confidence.household = NaN; },
    "groups[0].satisfaction": (s) => { s.devletDepth.groups[0].satisfaction = NaN; },
    "institutions[0].capacity": (s) => { s.institutions[0].capacity = Infinity; },
  };
  for (const [field, poison] of Object.entries(poisons)) {
    const save = midCampaign();
    poison(save);
    assert.equal(validateDevletDepth(save), false, `${field} should fail validation`);
    assert.equal(normalize("tc-sim-devlet", save), null, `${field} must not load`);
  }
});

test("legitimate and merely untidy DEVLET saves still load and migrate to v2", () => {
  const cases = {
    "valid v2": (s) => s,
    "v1 without the depth layer": (s) => { delete s.devletDepth; s.meta.version = 1; return s; },
    "v1 without a seed": (s) => { delete s.devletDepth; s.meta.version = 1; delete s.meta.seed; return s; },
    "partial depth": (s) => { s.devletDepth = { macro: s.devletDepth.macro }; return s; },
    "missing groups": (s) => { delete s.devletDepth.groups; return s; },
    "corrupt collections": (s) => {
      s.devletDepth.policy.pending = "nope";
      s.devletDepth.traces = 5;
      s.devletDepth.crises.history = null;
      return s;
    },
    "over-cap collections": (s) => {
      s.devletDepth.traces = Array.from({ length: 500 }, (_, i) => ({ turn: i, type: "x", source: "y", factors: [] }));
      return s;
    },
    "save taken during a crisis": (s) => {
      s.devletDepth.crises.active = [{ id: "c1", family: "financial", startTurn: s.time.turn, severity: 60, status: "active" }];
      return s;
    },
  };
  for (const [name, mutate] of Object.entries(cases)) {
    const loaded = normalize("tc-sim-devlet", mutate(midCampaign()));
    assert.ok(loaded, `${name} must load`);
    assert.equal(loaded.meta.version, 2, name);
    assert.equal(validateDevletDepth(loaded), true, name);
    assert.ok(loaded.devletDepth.traces.length <= DEVLET_BOUNDS.traces, name);
    // Loading is idempotent and the loaded save still ticks.
    const twice = normalize("tc-sim-devlet", loaded);
    assert.ok(twice, name);
    assert.doesNotThrow(() => tickDevlet(twice), name);
  }
  assert.equal(normalize("tc-sim-devlet", Object.assign(midCampaign(), { meta: { id: "tc-sim", version: 2 } })), null);
});

test("a duplicate pending effect pays out once", () => {
  const s = midCampaign("2002", 12);
  const pool = POLICIES["2002"];
  applyPolicy(s, pool[0].id);
  const effect = s.devletDepth.policy.pending.find((row) => row.horizon === "short");
  assert.ok(effect, "a short-horizon effect should be queued");
  s.devletDepth.policy.pending.push({ ...effect }, { ...effect });
  const loaded = normalize("tc-sim-devlet", s);
  assert.ok(loaded);
  tickDevlet(loaded);
  const paid = loaded.devletDepth.policy.resolved.filter((row) => row.id === effect.id);
  assert.equal(paid.length, 1, "the same effect id must not resolve twice");
  assert.equal(loaded.devletDepth.policy.pending.filter((row) => row.id === effect.id).length, 0);
});

// Nothing used to remove a crisis from `crises.active` or move its status off
// "active", so the `active.length >= 3` guard permanently switched the crisis
// system off: the same three crises stayed active for the rest of a 107-year
// campaign, crisisHistory froze at 3 of its 36 rows, and most families never
// appeared at all.
test("crises run their course, so the crisis system stays alive for a whole campaign", () => {
  const s = hydrateDevlet("1923", { seed: 7, campaign: true });
  const pool = POLICIES["1923"];
  let maxActive = 0;
  const families = new Set();
  const startTurns = new Set();
  for (let i = 0; i < 1300 && !s.flags.campaignEnd; i++) {
    applyPolicy(s, pool[i % pool.length].id);
    tickDevlet(s);
    const crises = s.devletDepth.crises;
    maxActive = Math.max(maxActive, crises.active.length);
    for (const c of crises.active) {
      families.add(c.family);
      startTurns.add(c.startTurn);
      assert.equal(c.status, "active");
      assert.ok(c.startTurn <= s.time.turn);
    }
  }
  const crises = s.devletDepth.crises;
  assert.ok(maxActive <= 3, "the concurrency guard still holds");
  assert.ok(crises.history.length > 3, `crisis history stayed frozen at ${crises.history.length}`);
  assert.ok(crises.history.length <= DEVLET_BOUNDS.crisisHistory);
  assert.ok(families.size >= 2, `only ${[...families]} ever became active`);
  assert.ok(startTurns.size > 3, "new crises must keep starting after the first three");
  const resolved = crises.history.filter((c) => c.status === "resolved");
  assert.ok(resolved.length > 0, "resolved crises should be recorded in history");
  for (const c of resolved) assert.ok(Number.isInteger(c.endTurn) && c.endTurn >= c.startTurn);
  // A crisis active at the end of the campaign has not overstayed its duration.
  for (const c of crises.active) {
    const duration = Math.max(3, Math.round(c.severity * 0.35 - crises.resilience * 0.12 + 6));
    assert.ok(s.time.turn - c.startTurn < duration + 1, `crisis ${c.id} outlived its duration`);
  }
});

test("a resilient state is hit by fewer crises than a brittle one under the same exposure", () => {
  const build = (strong) => {
    const s = hydrateDevlet("1923", { seed: 7, campaign: true });
    for (let i = 0; i < 40; i++) tickDevlet(s);
    const d = s.devletDepth;
    s.actual.inflation = 90;
    d.confidence.institutional = strong ? 95 : 10;
    s.actual.treasury = strong ? 200 : 5;
    d.macro.publicDebt = strong ? 0 : 130;
    d.macro.reserves = strong ? 95 : 5;
    for (const inst of s.institutions) {
      inst.capacity = strong ? 95 : 10;
      inst.professionalism = strong ? 95 : 10;
      inst.fatigue = strong ? 0 : 60;
    }
    for (const region of s.regions) region.stability = strong ? 95 : 10;
    const before = d.crises.history.length;
    for (let i = 0; i < 24; i++) tickDevlet(s);
    return { resilience: d.crises.resilience, fresh: d.crises.history.slice(before) };
  };
  const brittle = build(false), strong = build(true);
  assert.ok(strong.resilience > brittle.resilience + 20, "resilience must actually differ");
  assert.ok(strong.fresh.length < brittle.fresh.length, "resilience must change the crisis count");
});
