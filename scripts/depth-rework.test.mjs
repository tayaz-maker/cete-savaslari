import assert from "node:assert/strict";
import test from "node:test";
import { applyAction, create, normalize } from "../public/games/next-wave.js";
import { loadGame } from "./racon-harness.mjs";

const copy = (value) => JSON.parse(JSON.stringify(value));

test("Apartman v1 save migrates resident memory, politics and delayed chains", () => {
  const old = create("apartman");
  old.meta.version = 1;
  delete old.politics;
  delete old.progression;
  delete old.delayedEffects;
  old.residents.forEach((resident) => {
    resident.memory = ["cheap-patch"];
    delete resident.memories;
    delete resident.trust;
  });
  const migrated = normalize("apartman", copy(old));
  assert.equal(migrated.meta.version, 2);
  assert.ok(migrated.residents.every((resident) => Number.isFinite(resident.trust)));
  assert.ok(migrated.residents.every((resident) => resident.memories.length === 1));
  assert.ok(Array.isArray(migrated.delayedEffects));
});

test("Apartman decision creates causal memory and resolves delayed effect once after round-trip", () => {
  const state = create("apartman");
  applyAction("apartman", state, `focus:${state.issues[0].id}`);
  applyAction("apartman", state, "proposal:cheap-patch");
  assert.ok(state.residents.every((resident) => resident.memories.length === 1));
  assert.equal(state.delayedEffects.filter((effect) => effect.status === "pending").length, 1);
  const restored = normalize("apartman", copy(state));
  for (let i = 0; i < 3; i += 1) applyAction("apartman", restored, "advance");
  const callbacks = restored.history.filter((row) => row.type === "callback" && row.cause === "cheap-patch");
  assert.equal(callbacks.length, 1);
  applyAction("apartman", restored, "advance");
  assert.equal(restored.history.filter((row) => row.type === "callback" && row.cause === "cheap-patch").length, 1);
});

test("Apartman long strategies stay finite, avoid soft-lock and diverge", () => {
  const strategies = ["durable-maintenance", "cheap-patch", "raise-dues"];
  const outcomes = strategies.map((strategy) => {
    const state = create("apartman");
    for (let turn = 0; turn < 36 && !state.runSummary; turn += 1) {
      const issue = state.issues.find((item) => item.status === "acik");
      if (issue) applyAction("apartman", state, `focus:${issue.id}`);
      applyAction("apartman", state, `proposal:${strategy}`);
      applyAction("apartman", state, "advance");
      assert.ok(Number.isFinite(state.finance.cash));
      assert.ok(Number.isFinite(state.politics.confidence));
      assert.ok(state.issues.length < 100);
    }
    return [state.week, state.finance.cash, state.politics.confidence, state.progression.phase, state.runSummary?.result || "devam"].join("|");
  });
  assert.equal(new Set(outcomes).size, 3);
});

function finishRaconJob(game, choice) {
  game.ev('var dj={id:nid("j"),kind:"tahsilat",streetId:S.streetHome,prepLeft:0,assigned:[S.men[0].id],tags:[],phase:"running",tickIndex:0};S.jobs.push(dj);UI.jobId=dj.id;UI.jobOrders=[' + JSON.stringify(choice) + '];UI.fastJob=true;finishJob();');
}

test("Racon identity, actor memory and delayed consequence survive save/load", () => {
  const game = loadGame();
  game.win.__raconSeedSabit = 77;
  game.ev('blank("Derin");enterPlay();S.seed=77;');
  finishRaconJob(game, "ates");
  assert.equal(game.ev("S.depth.identity"), "fevri");
  assert.equal(game.ev("S.men[0].memories.at(-1).type"), "ates");
  assert.equal(game.ev("S.depth.delayedEffects.filter(function(x){return x.status==='pending';}).length"), 1);
  game.ev("writeSave();S=parseSave(localStorage.getItem(KEY));");
  assert.equal(game.ev("S.men[0].memories.at(-1).type"), "ates");
  game.ev("S.week+=2;depthSettle();depthSettle();");
  assert.equal(game.ev("S.depth.endHistory.filter(function(x){return x.type==='violent-echo';}).length"), 1);
});

test("Racon three styles create three identities and distinct saved histories", () => {
  const styles = ["sessiz", "cekil", "ates"];
  const results = styles.map((style, index) => {
    const game = loadGame();
    game.win.__raconSeedSabit = 100 + index;
    game.ev(`blank("Run");enterPlay();S.seed=${100 + index};`);
    for (let i = 0; i < 6; i += 1) finishRaconJob(game, style);
    game.ev("writeSave();S=parseSave(localStorage.getItem(KEY));");
    assert.ok(game.ev("S.depth.decisions.length") >= 6);
    return game.ev("S.depth.identity+'|'+S.rep.korku+'|'+S.rep.saygi+'|'+S.dosya");
  });
  assert.equal(new Set(results).size, 3);
});

// ---------------------------------------------------------------------------
// Additional save/load and invariant coverage added during technical review.
// ---------------------------------------------------------------------------

test("depth-framework: scheduling the same effect id twice never creates a duplicate", () => {
  const state = { delayedEffects: [] };
  const scheduled1 = globalThis.TarikLabDepth.schedule(state, { id: "x-1", type: "test", dueTurn: 3 });
  const scheduled2 = globalThis.TarikLabDepth.schedule(state, { id: "x-1", type: "test", dueTurn: 3 });
  assert.equal(scheduled1, true);
  assert.equal(scheduled2, false, "a second schedule() with the same id must be a no-op");
  assert.equal(state.delayedEffects.length, 1);
});

test("depth-framework: settleDue resolves a pending effect exactly once even if called repeatedly", () => {
  const state = { delayedEffects: [] };
  globalThis.TarikLabDepth.schedule(state, { id: "once-1", type: "test", dueTurn: 2 });
  let calls = 0;
  globalThis.TarikLabDepth.settleDue(state, 2, () => { calls += 1; });
  globalThis.TarikLabDepth.settleDue(state, 2, () => { calls += 1; });
  globalThis.TarikLabDepth.settleDue(state, 3, () => { calls += 1; });
  assert.equal(calls, 1, "the resolver must run exactly once for one scheduled effect");
});

test("depth-framework: a malformed dueTurn never resolves and never throws", () => {
  const state = { delayedEffects: [{ id: "bad-1", status: "pending", dueTurn: "soon" }] };
  assert.doesNotThrow(() => globalThis.TarikLabDepth.settleDue(state, 999, () => {
    throw new Error("must not resolve a non-numeric dueTurn");
  }));
  assert.equal(state.delayedEffects[0].status, "pending");
});

test("depth-framework: remember() rejects a duplicate memory id and enforces the cap", () => {
  const actor = { memories: [] };
  assert.equal(globalThis.TarikLabDepth.remember(actor, { id: "m1", type: "a" }), true);
  assert.equal(globalThis.TarikLabDepth.remember(actor, { id: "m1", type: "b" }), false);
  assert.equal(actor.memories.length, 1);
  assert.equal(actor.memories[0].type, "a", "the first write wins; a duplicate id must not overwrite it");
  for (let i = 0; i < 20; i += 1) globalThis.TarikLabDepth.remember(actor, { id: `m-${i}`, type: "x" });
  assert.ok(actor.memories.length <= 12, "remember() must respect its cap");
});

test("Apartman: an accepted proposal's delayed effect still resolves safely if its target resident is gone", () => {
  const state = create("apartman");
  applyAction("apartman", state, `focus:${state.issues[0].id}`);
  applyAction("apartman", state, "proposal:raise-dues");
  const removedId = state.residents[0].id;
  state.residents = state.residents.filter((resident) => resident.id !== removedId);
  assert.doesNotThrow(() => {
    for (let i = 0; i < 4; i += 1) applyAction("apartman", state, "advance");
  });
  assert.ok(Number.isFinite(state.politics.confidence));
  assert.ok(state.residents.every((resident) => Number.isFinite(resident.trust)));
});

test("Apartman: loading the same save repeatedly never re-applies a resolved effect or re-rolls a result", () => {
  const state = create("apartman");
  applyAction("apartman", state, `focus:${state.issues[0].id}`);
  applyAction("apartman", state, "proposal:cheap-patch");
  let restored = normalize("apartman", copy(state));
  for (let i = 0; i < 3; i += 1) applyAction("apartman", restored, "advance");
  const snapshot = copy(restored);
  for (let i = 0; i < 5; i += 1) {
    restored = normalize("apartman", copy(snapshot));
    applyAction("apartman", restored, "advance");
    applyAction("apartman", restored, "advance");
  }
  const callbacks = restored.history.filter((row) => row.type === "callback" && row.cause === "cheap-patch");
  assert.equal(callbacks.length, 1, "repeatedly reloading the same save must not multiply a resolved callback");
});

test("Apartman: saving exactly on an election week and reloading does not lose or duplicate the election outcome", () => {
  const state = create("apartman");
  for (let week = 0; week < 11 && !state.runSummary; week += 1) {
    applyAction("apartman", state, "proposal:wait");
    applyAction("apartman", state, "advance");
  }
  assert.ok(state.week <= 12, "test setup should still be before the first election check");
  const savedAtElectionWeek = copy(state);
  applyAction("apartman", savedAtElectionWeek, "advance"); // crosses electionDue once
  const reloaded = normalize("apartman", copy(savedAtElectionWeek));
  const before = JSON.stringify({ conf: savedAtElectionWeek.politics.confidence, recov: savedAtElectionWeek.politics.recoveryUntil, due: savedAtElectionWeek.politics.electionDue });
  const after = JSON.stringify({ conf: reloaded.politics.confidence, recov: reloaded.politics.recoveryUntil, due: reloaded.politics.electionDue });
  assert.equal(before, after, "normalize() must not itself mutate election state");
});

test("Apartman: a rejected proposal never punishes residents who voted against it", () => {
  const state = create("apartman");
  // Tank trust hard enough that a further proposal is guaranteed to fail.
  state.residents.forEach((resident) => { resident.trust = 5; resident.satisfaction = 5; });
  const before = state.residents.map((resident) => ({ id: resident.id, trust: resident.trust }));
  applyAction("apartman", state, `focus:${state.issues[0].id}`);
  applyAction("apartman", state, "proposal:durable-maintenance");
  assert.equal(state.lastMeeting.accepted, false, "test setup expects a rejected vote");
  for (const row of before) {
    const now = state.residents.find((resident) => resident.id === row.id);
    assert.ok(now.trust >= row.trust, `resident ${row.id} voted no and must not lose trust when the vote fails (was ${row.trust}, now ${now.trust})`);
  }
});

test("Apartman: the recovery window closes once confidence is back at or above the floor", () => {
  const state = create("apartman");
  state.week = 10;
  state.politics.recoveryUntil = 9; // an earlier loss whose two-week window just ended
  state.politics.confidence = 90;
  applyAction("apartman", state, "advance");
  assert.equal(state.politics.recoveryUntil, null, "a closed, successful recovery window must not stay armed for the rest of the run");
});

test("Apartman: a stale recovery flag from a long-resolved election loss cannot end an otherwise healthy run", () => {
  const state = create("apartman");
  state.politics.recoveryUntil = 2; // a loss "resolved" back at week 2
  for (let i = 0; i < 40 && !state.runSummary; i += 1) {
    applyAction("apartman", state, `focus:${state.issues.find((issue) => issue.status === "acik")?.id || state.issues[0].id}`);
    applyAction("apartman", state, "proposal:durable-maintenance");
    applyAction("apartman", state, "advance");
  }
  assert.equal(state.runSummary, null, "sustained healthy management must not be ended by a decades-old recovery flag");
  assert.equal(state.politics.recoveryUntil, null);
});

test("Racon: a scheduled job echo resolves safely even if the crew member is gone by then", () => {
  const game = loadGame();
  game.win.__raconSeedSabit = 42;
  game.ev("blank('Repro');enterPlay();S.seed=42;");
  const manId = game.ev("S.men[0].id");
  const finishJob = 'var dj={id:nid("j"),kind:"tahsilat",streetId:S.streetHome,prepLeft:0,assigned:[S.men[0].id],tags:[],phase:"running",tickIndex:0};S.jobs.push(dj);UI.jobId=dj.id;UI.jobOrders=["ates"];UI.fastJob=true;finishJob();';
  game.ev(finishJob);
  assert.equal(game.ev("S.depth.delayedEffects.filter(function(x){return x.status==='pending';}).length"), 1);
  // The referenced man is removed entirely from the roster before the echo fires.
  game.ev(`S.men=S.men.filter(function(m){return m.id!==${JSON.stringify(manId)};});`);
  assert.doesNotThrow(() => game.ev("S.week+=2;depthSettle();"));
  assert.equal(game.ev("S.depth.endHistory.length"), 1, "the effect must still resolve once, even without its man");
});
