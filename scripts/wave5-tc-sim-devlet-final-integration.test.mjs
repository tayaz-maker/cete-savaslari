import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { hydrateDevlet, applyPolicy, tickDevlet } from "../public/games/next-wave/devlet-sim.js";
import { previewPolicy } from "../public/games/next-wave/devlet-depth.js";
import { POLICIES } from "../public/games/next-wave/devlet-data.js";
import { normalize } from "../public/games/next-wave.js";

const clone = value => JSON.parse(JSON.stringify(value));

function bestPolicy(state) {
  return (POLICIES[state.eraId] || POLICIES["2002"])
    .map(policy => ({ policy, preview: previewPolicy(state, policy) }))
    .filter(row => row.preview.cooldown === 0)
    .sort((a, b) => b.preview.rate - a.preview.rate)[0]?.policy;
}

function entropyRun(start, strategy) {
  const state = hydrateDevlet("2002", { seed: 8500 + start, campaign: true });
  state.entropy = start;
  const checkpoints = {};
  for (let month = 0; month < 240; month++) {
    const pool = POLICIES[state.eraId] || POLICIES["2002"];
    if (strategy === "competent" && month % 4 === 0) {
      const policy = bestPolicy(state); if (policy) applyPolicy(state, policy.id);
    }
    if (strategy === "institution" && month % 4 === 0) {
      const policy = pool.find(p => /admin|audit|judicial|yargi|bilgi|stat|kanun|brief/.test(p.id)) || bestPolicy(state);
      if (policy) applyPolicy(state, policy.id);
    }
    if (strategy === "reversal") applyPolicy(state, pool[month % Math.min(2, pool.length)].id);
    tickDevlet(state);
    if ([12, 36, 60, 120, 240].includes(month + 1)) checkpoints[month + 1] = state.entropy;
  }
  return { state, checkpoints };
}

test("high entropy has slow competent recovery while inactivity and reversal remain costly", () => {
  for (const start of [70, 85, 95]) {
    const idle = entropyRun(start, "idle");
    const competent = entropyRun(start, "competent");
    const institution = entropyRun(start, "institution");
    const reversal = entropyRun(start, "reversal");
    assert.ok(competent.checkpoints[60] < start, `competent recovery failed from ${start}`);
    assert.ok(competent.state.entropy < idle.state.entropy, `inactivity beat stabilization from ${start}`);
    assert.ok(institution.state.entropy < idle.state.entropy, `institution repair did not help from ${start}`);
    assert.ok(reversal.state.entropy > competent.state.entropy, `reversal was not worse from ${start}`);
    assert.ok(competent.state.form !== "Boş Kabuk", `competent route cannot leave the empty shell from ${start}`);
  }
});

test("crisis family selection is deterministic and every family has a natural state path", () => {
  const families = ["inflation", "recession", "financial", "migration", "institutional", "trust", "external"];
  for (const [index, family] of families.entries()) {
    let found = false;
    for (let seed = 1; seed <= 180 && !found; seed++) {
      const state = hydrateDevlet("gunumuz", { seed: 9000 + seed + index * 200 });
      state.time.turn = 5;
      state.actual.inflation = family === "inflation" ? 90 : 8;
      state.actual.unemployment = family === "recession" ? 32 : 7;
      Object.assign(state.devletDepth.macro, {
        publicDebt: family === "financial" ? 130 : 30,
        externalPressure: family === "financial" ? 95 : 20,
        interestRate: family === "financial" ? 75 : 8,
      });
      state.devletDepth.demography.internalMigration = family === "migration" ? 10 : .1;
      state.devletDepth.demography.netMigration = family === "migration" ? 4 : 0;
      state.entropy = family === "institutional" ? 98 : 10;
      Object.assign(state.devletDepth.confidence, { institutional: family === "institutional" ? 3 : 88, household: family === "trust" ? 4 : 88 });
      state.heat = family === "trust" ? 96 : 8;
      state.devletDepth.media.fragmentation = family === "trust" ? 96 : 8;
      Object.assign(state.devletDepth.world, { regionalRisk: family === "external" ? 98 : 10, energyPressure: family === "external" ? 98 : 10, globalRates: family === "external" ? 98 : 10 });
      for (const inst of state.institutions) Object.assign(inst, { capacity: family === "institutional" ? 6 : 45, professionalism: family === "institutional" ? 6 : 45 });
      tickDevlet(state);
      found = state.devletDepth.crises.history.some(crisis => crisis.family === family);
    }
    assert.ok(found, `${family} has no deterministic reachable path`);
  }
  const before = hydrateDevlet("gunumuz", { seed: 9177 }); before.time.turn = 5; before.actual.inflation = 100;
  const reloaded = normalize("tc-sim-devlet", clone(before));
  tickDevlet(before); tickDevlet(reloaded);
  assert.deepEqual(reloaded.devletDepth.crises, before.devletDepth.crises, "reload rerolled crisis selection");
});

test("cadre domain expertise affinity is bounded but mechanically visible", () => {
  const fiscal = hydrateDevlet("2002", { seed: 45 }), mismatch = clone(fiscal);
  const policy = POLICIES["2002"].find(p => p.id === "tax-admin");
  const a = fiscal.devletDepth.cadres.find(c => c.institution === "maliye");
  const b = mismatch.devletDepth.cadres.find(c => c.institution === "maliye");
  Object.assign(a, { role: "fiscal", expertise: 100 });
  Object.assign(b, { role: "security", expertise: 100 });
  const delta = previewPolicy(fiscal, policy).rate - previewPolicy(mismatch, policy).rate;
  assert.ok(delta > 1 && delta < 5, `expertise affinity must be useful but bounded: ${delta}`);
});

test("nested non-finite network and cadre values fail closed before hydration", () => {
  for (const mutate of [
    state => { state.networks[0].pressure = Number.NaN; },
    state => { state.devletDepth.cadres[0].competence = Number.POSITIVE_INFINITY; },
  ]) {
    const state = hydrateDevlet("2002", { seed: 61 }); mutate(state);
    assert.equal(normalize("tc-sim-devlet", state), null);
  }
});

test("decision capacity is optional and advancing never requires spending it", () => {
  const app = fs.readFileSync(new URL("../public/games/tc-sim-devlet/app.js", import.meta.url), "utf8");
  const presentation = fs.readFileSync(new URL("../public/games/tc-sim-devlet/presentation.js", import.meta.url), "utf8");
  assert.match(app, /hepsini kullanmak zorunda değilsin/);
  assert.match(presentation, /beklemek de bir tercihtir/);
  assert.doesNotMatch(app, /id="advance"[^>]*remaining/);
});

test("regional state retains mechanically meaningful heterogeneity", () => {
  const state = hydrateDevlet("1923", { seed: 97, campaign: true });
  for (let month = 0; month < 1284 && !state.flags.campaignEnd; month++) {
    if (month % 4 === 0) { const policy = bestPolicy(state); if (policy) applyPolicy(state, policy.id); }
    tickDevlet(state);
  }
  const spread = key => Math.max(...state.regions.map(r => r[key])) - Math.min(...state.regions.map(r => r[key]));
  assert.ok(spread("urbanization") > 1, "regional urbanization became functionally identical");
  assert.ok(spread("satisfaction") > .5, "regional satisfaction became functionally identical");
  assert.ok(state.devletDepth.demography.internalMigration > 0);
});
