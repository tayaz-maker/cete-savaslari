import assert from "node:assert/strict";
import test from "node:test";
import { applyAction, create, normalize } from "../public/games/next-wave.js";
import {
  CHAINS as APARTMAN_CHAINS,
  applyApartmanEventChoice,
  coverage as apartmanCoverage,
  tickApartmanChains,
} from "../public/games/next-wave/apartman-chains.js";
import { loadGame } from "./racon-harness.mjs";

const copy = (value) => JSON.parse(JSON.stringify(value));

function finiteTree(value, path = "root") {
  if (value == null) return;
  if (typeof value === "number") {
    assert.ok(Number.isFinite(value), `NaN/Inf at ${path}`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => finiteTree(item, `${path}[${i}]`));
    return;
  }
  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value)) finiteTree(item, `${path}.${key}`);
  }
}

test("content coverage: unique ids, no filler-count cheat, targets met", () => {
  const apt = apartmanCoverage();
  assert.equal(apt.chains, 24);
  assert.ok(apt.nodes >= 90, `apartman nodes ${apt.nodes}`);
  assert.ok(apt.delayed >= 35, `apartman delayed ${apt.delayed}`);
  assert.ok(apt.memory >= 30, `apartman memory ${apt.memory}`);
  assert.ok(apt.macro >= 12, `apartman macro ${apt.macro}`);
  assert.ok(apt.politics >= 10, `apartman politics ${apt.politics}`);
  assert.ok(apt.residentLinks >= 20, `apartman resident↔resident ${apt.residentLinks}`);
  assert.ok(apt.exclusive >= 6, `apartman exclusive ${apt.exclusive}`);
  assert.equal(new Set(apt.ids).size, apt.ids.length, "duplicate apartman node ids");

  const game = loadGame();
  const cov = game.win.RaconContent.coverage();
  assert.equal(cov.npcs, 16);
  assert.equal(cov.chains, 24);
  assert.ok(cov.nodes >= 90, `racon nodes ${cov.nodes}`);
  assert.ok(cov.delayed >= 35, `racon delayed ${cov.delayed}`);
  assert.ok(cov.memory >= 30, `racon memory ${cov.memory}`);
  assert.ok(cov.identity >= 20, `racon identity ${cov.identity}`);
  assert.ok(cov.exclusive >= 12, `racon exclusive chains ${cov.exclusive}`);
  assert.deepEqual(cov.duplicateIds, []);
});

test("Apartman: su-kolon walks, delayed callback fires once, save/load mid-chain", () => {
  const state = create("apartman");
  state.activeEvent = null;
  state.flags.chains = {};
  for (const chain of APARTMAN_CHAINS) {
    if (chain.id !== "su-kolon") state.flags.chains[chain.id] = { stage: 0, status: "dead" };
  }
  state.week = 2;
  tickApartmanChains(state);
  assert.equal(state.activeEvent?.chainId, "su-kolon");
  assert.equal(state.activeEvent.nodeId, "su-kolon-1");
  applyAction("apartman", state, "event-choice:su-kolon:su-kolon-1:usta");
  assert.equal(state.activeEvent, null);
  const murat = state.residents.find((r) => r.id === "r2");
  assert.ok(murat.memories.some((m) => m.type === "taraf-tuttu"));
  assert.equal(state.delayedEffects.filter((e) => e.status === "pending").length, 1);
  const mid = copy(state);
  const restored = normalize("apartman", mid);
  assert.equal(restored.flags.chains["su-kolon"].stage, 1);
  assert.equal(restored.delayedEffects.filter((e) => e.status === "pending").length, 1);
  for (let i = 0; i < 4 && restored.history.filter((h) => h.type === "echo").length < 1; i += 1) {
    applyAction("apartman", restored, "advance");
  }
  const callbacks = restored.history.filter((h) => h.type === "echo" && h.cause === "su-kolon");
  assert.equal(callbacks.length, 1);
  applyAction("apartman", restored, "advance");
  assert.equal(restored.history.filter((h) => h.type === "echo" && h.cause === "su-kolon").length, 1);
  finiteTree(restored.finance);
  finiteTree(restored.politics);
});

test("Apartman: exclusive branches kill the sibling chain", () => {
  const state = create("apartman");
  state.activeEvent = null;
  state.flags.chains = {
    "aidat-leyla": { stage: 0, status: "done" },
    "aidat-liste": { stage: 0, status: "idle" },
  };
  for (const chain of APARTMAN_CHAINS) {
    if (chain.id !== "aidat-liste" && chain.id !== "aidat-leyla") {
      state.flags.chains[chain.id] = { stage: 0, status: "dead" };
    }
  }
  state.week = 3;
  tickApartmanChains(state);
  assert.notEqual(state.activeEvent?.chainId, "aidat-liste");
  applyApartmanEventChoice(state, "aidat-leyla:x:bekle");
  state.flags.chains["aidat-leyla"].status = "done";
  const sibling = APARTMAN_CHAINS.find((c) => c.id === "aidat-leyla");
  for (const id of sibling.exclusive) {
    const other = state.flags.chains[id] || { status: "idle" };
    other.status = "dead";
    state.flags.chains[id] = other;
  }
  tickApartmanChains(state);
  assert.notEqual(state.activeEvent?.chainId, "aidat-liste");
});

test("Apartman: 20 long runs stay finite, no spam, and diverge", () => {
  const strategies = [
    "durable-maintenance",
    "cheap-patch",
    "raise-dues",
    "wait",
  ];
  const signatures = [];
  for (let seed = 0; seed < 20; seed += 1) {
    const state = create("apartman");
    const pick = strategies[seed % strategies.length];
    const eventPick = seed % 3;
    for (let turn = 0; turn < 28 && !state.runSummary; turn += 1) {
      if (state.activeEvent) {
        const choice = state.activeEvent.choices[eventPick] || state.activeEvent.choices.at(-1);
        applyAction(
          "apartman",
          state,
          `event-choice:${state.activeEvent.chainId}:${state.activeEvent.nodeId}:${choice.id}`,
        );
      }
      const issue = state.issues.find((item) => item.status === "acik");
      if (issue) applyAction("apartman", state, `focus:${issue.id}`);
      applyAction("apartman", state, `proposal:${pick}`);
      applyAction("apartman", state, "advance");
      assert.ok(Number.isFinite(state.finance.cash));
      assert.ok(Number.isFinite(state.politics.confidence));
      assert.ok(state.issues.length < 80);
      assert.ok((state.history || []).length <= 80);
    }
    const chainIds = Object.entries(state.flags.chains || {})
      .filter(([, st]) => st.status === "done")
      .map(([id]) => id)
      .sort();
    signatures.push(
      [
        pick,
        state.week,
        Math.round(state.finance.cash),
        state.politics.confidence,
        state.progression.phase,
        chainIds.join(","),
        state.runSummary?.result || "devam",
      ].join("|"),
    );
    finiteTree(state.finance);
    finiteTree(state.politics.confidence);
  }
  assert.ok(new Set(signatures).size >= 8, `long runs must diverge, got ${new Set(signatures).size}`);
});

function killOtherRaconChains(ev, keep) {
  ev(`(window.RaconContent.CHAINS||[]).forEach(function(c){
    S.flags.chains=S.flags.chains||{};
    if(c.id!==${JSON.stringify(keep)}) S.flags.chains[c.id]={stage:0,status:"dead"};
  });`);
}

test("Racon: hasan-kuzen walk, identity copy, delayed once, missing NPC, save/load", () => {
  const game = loadGame();
  game.win.__raconSeedSabit = 77;
  game.ev('blank("Derin");enterPlay();S.seed=77;S.week=2;S.day=1;UI.spawnLeft=2;');
  killOtherRaconChains(game.ev, "hasan-kuzen");
  game.ev('S.depth.identity="fevri";window.RaconContent.tick(S,raconContentH(),UI);');
  const paper = game.ev('S.inbox.filter(function(x){return x.kind==="chain";})[0]');
  assert.ok(paper, "hasan-kuzen paper should spawn");
  assert.equal(paper.chainId, "hasan-kuzen");
  assert.match(paper.body, /Ateşin duyulmuş/);
  game.ev(`act("chain-choice",{id:${JSON.stringify(paper.id)},cid:"zarf"});`);
  assert.equal(game.ev('S.men.filter(function(m){return m.id==="m_hasan";})[0].memories.at(-1).type'), "kuzen-zarf");
  assert.equal(game.ev('S.depth.delayedEffects.filter(function(x){return x.status==="pending"&&x.type==="chain-echo";}).length'), 1);
  game.ev("writeSave();S=parseSave(localStorage.getItem(KEY));");
  assert.equal(game.ev('S.flags.chains["hasan-kuzen"].stage'), 1);
  assert.equal(game.ev('S.depth.delayedEffects.filter(function(x){return x.status==="pending"&&x.type==="chain-echo";}).length'), 1);
  game.ev("S.week+=3;depthSettle();depthSettle();");
  assert.equal(game.ev('S.depth.delayedEffects.filter(function(x){return x.type==="chain-echo"&&x.status==="pending";}).length'), 0);
  assert.equal(game.ev('S.depth.endHistory.filter(function(x){return x.type==="chain-echo";}).length'), 1);
  assert.doesNotThrow(() => {
    game.ev('S.men=S.men.filter(function(m){return m.id!=="m_hasan";});window.RaconContent.tick(S,raconContentH(),UI);');
  });
});

test("Racon: exclusive sibling dies when a chain completes", () => {
  const game = loadGame();
  game.win.__raconSeedSabit = 11;
  game.ev('blank("Derin");enterPlay();S.seed=11;S.week=9;UI.spawnLeft=2;S.flags.chains=S.flags.chains||{};S.flags.chains["hasan-kuzen"]={stage:2,status:"active"};S.flags.chains["cevdet-teklif"]={stage:0,status:"idle"};');
  game.ev('var paper={id:"in_x",kind:"chain",chainId:"hasan-kuzen",nodeId:"hk-3",week:S.week,choices:[{id:"yumusat"},{id:"kes"},{id:"bekle"}]};S.inbox.unshift(paper);window.RaconContent.choose(paper,"yumusat",S,raconContentH());');
  assert.equal(game.ev('S.flags.chains["hasan-kuzen"].status'), "done");
  assert.equal(game.ev('S.flags.chains["cevdet-teklif"].status'), "dead");
});

test("Racon: 20 long runs stay finite, inbox bounded, stories diverge", () => {
  const signatures = [];
  for (let i = 0; i < 20; i += 1) {
    const game = loadGame();
    game.win.__raconSeedSabit = 1000 + i * 17;
    game.ev(`blank("Uzun");enterPlay();S.seed=${1000 + i * 17};UI.fastJob=true;UI.spawnLeft=2;`);
    const choiceIdx = i % 3;
    for (let day = 0; day < 70 && !game.ev("S.flags.oyunSonu"); day += 1) {
      game.ev(`UI.spawnLeft=2;var p=S.inbox.filter(function(x){return x.kind==="chain"&&!x.kapali;})[0];if(p){var c=(p.choices||[])[${choiceIdx}]||(p.choices||[]).slice(-1)[0];if(c)act("chain-choice",{id:p.id,cid:c.id});}`);
      game.ev("if(!UI.sahne)act('ilerlet',{});if(UI.modal)act('threat-yes',{});");
      assert.equal(game.ev("Number.isFinite(S.kasa)&&Number.isFinite(S.dosya)"), true);
      assert.ok(game.ev("S.inbox.length") < 400);
    }
    signatures.push(
      game.ev(
        'JSON.stringify({w:S.week,k:S.kasa,d:S.dosya,i:S.depth.identity,f:Object.keys(S.flags.chainFlags||{}).sort(),c:Object.keys(S.flags.chains||{}).filter(function(id){return S.flags.chains[id].status==="done";}).sort(),end:S.flags.oyunSonu||""})',
      ),
    );
  }
  assert.ok(new Set(signatures).size >= 8, `racon long runs must diverge, got ${new Set(signatures).size}`);
});
