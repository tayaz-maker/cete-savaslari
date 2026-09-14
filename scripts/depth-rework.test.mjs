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
