import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame, normalizeEducationCareer, validateState, transact } from "../public/games/tc-sim/js/state.js";
import { advanceWeek, applyDecision } from "../public/games/tc-sim/js/time.js";
import { getEventDefinition, resolveEvent, activateNextEvent, processDueOpenCases, getEventChoiceAvailability } from "../public/games/tc-sim/js/events.js";
import { getMonthlySummary, acceptJobOffer, moveHome, promoteCareer, retireCareer, enrollEducation } from "../public/games/tc-sim/js/life.js";
import { deserializeState, saveGame, loadGame } from "../public/games/tc-sim/js/save.js";
import { processLifetimeWeek, continueGeneration, estateSnapshot, mortalityContext, adultChildSummary, adultEventContext, eligibleSuccessors } from "../public/games/tc-sim/js/lifetime.js";
import { renderLifetimeTerminal, renderLineage } from "../public/games/tc-sim/js/lifetime-ui.js";
import { settleHouseholdEvents, runLifetimeScenario } from "./tc-sim-longrun.mjs";

const fresh = () => createNewGame({ now: "2027-01-01T00:00:00.000Z" });
const reload = s => { const result = deserializeState(JSON.stringify(s)); assert.equal(result.ok, true, result.error); return result.state; };
function prepared(age = 36, children = 1) {
  const s = fresh();
  s.player.age = age; s.time.absoluteWeek = (age - 18) * 48 + 1; s.time.year = 2027 + age - 18;
  s.finances.balance = 25000;
  s.parenthood.children = Array.from({ length: children }, (_, i) => ({ id: `kid-${i}`, name: `Çocuk ${i}`, bornWeek: i * 48 + 1, otherParentId: "elif", livesWithPlayer: true, trajectory: i ? "work-focused" : "education-focused", futurePreference: i ? "work" : "education" }));
  return normalizeEducationCareer(s);
}
function week(s, choices = {}) { settleHouseholdEvents(s, choices); assert.equal(advanceWeek(s).ok, true); }
function target(s, id) {
  activateNextEvent(s);
  for (let n = 0; n < 80; n++) {
    if (s.events.active?.eventId === id) return;
    assert.ok(s.events.active, `missing ${id}`);
    const def = getEventDefinition(s.events.active.eventId);
    const choice = def.choices.find(c => getEventChoiceAvailability(s, c.id).ok);
    assert.equal(resolveEvent(s, choice.id).ok, true);
  }
  assert.fail(`unreachable ${id}`);
}
function terminal() {
  const s = prepared(98, 2);
  week(s);
  assert.ok(s.lifetime.death);
  return s;
}

test("adult path uses production scheduling, due time, player choice and one-time cost after reload", () => {
  let s = prepared();
  week(s);
  const source = s.openCases.find(c => c.type === "adult-child");
  assert.ok(source); assert.equal(source.dueWeek, s.time.absoluteWeek + 2);
  assert.equal(s.parenthood.children[0].adult.path, "studying");
  s = reload(s); week(s); week(s); target(s, "adult_child_discussion");
  assert.match(adultEventContext(s), /Çocuk 0/);
  const balance = s.finances.balance;
  const trust = s.parenthood.children[0].relationship.trust;
  assert.equal(resolveEvent(s, "support").ok, true);
  assert.equal(s.finances.balance, balance - 1500);
  assert.equal(s.parenthood.children[0].relationship.trust, trust + 3);
  assert.equal(s.openCases.find(c => c.id === source.id).status, "resolved");
  const after = s.finances.balance;
  processLifetimeWeek(s); processLifetimeWeek(s);
  assert.equal(s.finances.balance, after);
  assert.equal(s.openCases.filter(c => c.id === source.id).length, 1);
  assert.match(adultChildSummary(reload(s))[0].text, /Eğitimine/);
});

test("two adult children have separate cases and autonomous path outcomes", () => {
  let s = prepared(40, 2);
  s.parenthood.children[0].relationship = { trust: 20, tension: 70, closeness: 50 };
  week(s); week(s); week(s); target(s, "adult_child_discussion");
  const source = s.openCases.find(c => c.id === s.events.active.sourceCaseId);
  const id = source.payload.childId;
  assert.equal(resolveEvent(s, "direct").ok, true);
  assert.equal(s.parenthood.children.find(c => c.id === id).adult.path, "studying");
  assert.equal(s.parenthood.children[1].adult.milestones, 0);
  assert.equal(new Set(s.openCases.filter(c => c.type === "adult-child").map(c => c.id)).size, 2);
  s = reload(s); target(s, "adult_child_discussion"); assert.equal(resolveEvent(s, "space").ok, true);
  assert.equal(s.parenthood.children[1].adult.path, "working");
});

test("death freezes all player activity and money, closes events, and report survives reload exactly", () => {
  let s = terminal();
  const report = structuredClone(s.lifetime.reports);
  const snapshot = JSON.stringify(s);
  assert.equal(advanceWeek(s).ok, false);
  assert.equal(applyDecision(s, "overtime").ok, false);
  assert.equal(acceptJobOffer(s, "market").ok, false);
  assert.equal(promoteCareer(s).ok, false);
  assert.equal(retireCareer(s).ok, false);
  assert.equal(moveHome(s, "studio").ok, false);
  assert.equal(enrollEducation(s, "open_university", "part").ok, false);
  assert.equal(resolveEvent(s, "support").ok, false);
  assert.equal(activateNextEvent(s), null);
  processDueOpenCases(s); processLifetimeWeek(s); transact(s, 99999, "duplicate");
  assert.equal(JSON.stringify(s), snapshot);
  assert.equal(getMonthlySummary(s).income, 0);
  s = reload(s);
  assert.deepEqual(s.lifetime.reports, report);
  assert.equal(s.events.active, null);
  assert.equal(s.openCases.every(c => c.status === "resolved"), true);
});

test("estate subtracts actual owed support/tuition, conserves shares, and never inherits negative debt", () => {
  const s = prepared(40, 2);
  s.finances.balance = 10001;
  s.education.tuitionOwedThisMonth = 200;
  s.openCases.push({ id: "relief", status: "pending", payload: { kind: "money_relief", amount: 1500 } });
  const estate = estateSnapshot(s);
  assert.equal(estate.net, 8301);
  assert.equal(estate.shares.reduce((n, c) => n + c.amount, 0), estate.net);
  assert.deepEqual(estate.shares.map(c => c.amount), [4151, 4150]);
  s.finances.balance = -5000;
  assert.equal(estateSnapshot(s).shares.every(c => c.amount === 0), true);
});

test("succession preserves selected identity and archive without old pension, cases, secrets or starting cash", () => {
  let s = reload(terminal());
  const heir = s.parenthood.children[1];
  const amount = s.lifetime.death.estate.shares.find(c => c.childId === heir.id).amount;
  const report = structuredClone(s.lifetime.reports[0]);
  assert.equal(continueGeneration(s, heir.id).ok, true);
  assert.equal(s.player.name, heir.name);
  assert.equal(s.lifetime.generation, 2);
  assert.equal(s.finances.balance, amount);
  assert.equal(s.career.retirement.status, "working");
  assert.equal(s.career.retirement.monthlyIncome, 0);
  assert.equal(s.openCases.length, 0); assert.equal(s.secrets.length, 0);
  assert.equal(s.weekly.used, 0); assert.equal(s.yearlyHistory.length, 0);
  const snapshot = JSON.stringify(s);
  assert.equal(continueGeneration(s, heir.id).ok, false);
  assert.equal(JSON.stringify(s), snapshot);
  s = reload(s);
  assert.deepEqual(s.lifetime.reports[0], report);
  assert.equal(getEventDefinition("life_baba_benzin").condition(s), false);
  assert.equal(getEventDefinition("life_baba_ask_money").condition(s), false);
  for (let i = 0; i < 8; i++) week(s);
  assert.equal(validateState(s).ok, true);
});

test("terminal UI exposes only successor actions and archived reports escape user text", () => {
  const s = terminal(); s.player.name = "<script>bad</script>";
  const html = renderLifetimeTerminal(s);
  assert.ok(!html.includes("<script>"));
  assert.equal((html.match(/data-successor=/g) || []).length, 2);
  assert.ok(!html.includes("data-decision") && !html.includes("advance-week"));
  const id = s.parenthood.children[0].id;
  continueGeneration(s, id);
  assert.equal(renderLifetimeTerminal(s), "");
  assert.match(renderLineage(s), /aile geçmişi/);
});

test("old v5 saves stay neutral; underage children never become forced successors", () => {
  const old = fresh();
  const loaded = reload(old);
  assert.deepEqual(loaded.lifetime, { generation: 1, bornWeek: null, death: null, reports: [], family: [] });
  assert.deepEqual(loaded.memories, old.memories);
  assert.equal(loaded.parenthood.children.length, 0);
  const s = prepared(98, 1); s.parenthood.children[0].bornWeek = s.time.absoluteWeek - 48 * 10;
  week(s);
  assert.equal(eligibleSuccessors(s).length, 0);
  assert.equal(continueGeneration(s, "kid-0").ok, false);
  assert.match(renderLifetimeTerminal(reload(s)), /Uygun yetişkin çocuk yok/);
});

test("full production lives reach death, healthy choices alter longevity, real-born children and five successor years persist", () => {
  const family = runLifetimeScenario("balanced-family");
  const healthy = runLifetimeScenario("health-first");
  const overwork = runLifetimeScenario("overwork");
  assert.ok(family.birthWeek > 1);
  assert.equal(family.successor.final.generation, 2);
  assert.ok(family.successor.final.week - family.successor.first.week >= 240);
  assert.ok(healthy.death.age > overwork.death.age);
  assert.ok(healthy.death.age > 70 && overwork.death.age > 70);
  assert.ok(family.counts.adult_child_discussion >= 3);
  assert.ok(family.state.parenthood.children.length, "real adult-family milestone survives into next generation");
  const repeat = runLifetimeScenario("balanced-family");
  assert.deepEqual(repeat.death, family.death);
  assert.deepEqual(repeat.checkpoints, family.checkpoints);
  assert.deepEqual(repeat.successor, family.successor);
});

test("multiple real-born heirs divide estate independently and no-heir life ends saveably", () => {
  const multi = runLifetimeScenario("multiple-heirs");
  assert.equal(multi.terminal.children.length, 2);
  assert.equal(multi.death.estate.shares.reduce((n, s) => n + s.amount, 0), multi.death.estate.net);
  assert.ok(multi.state.lifetime.family.some(p => p.relation === "sibling"));
  const none = runLifetimeScenario("no-successor");
  assert.ok(reload(none.state).lifetime.death);
  assert.equal(none.successor, null);
});

test("a third generation is production reachable, with separate year files and no inherited retirement", () => {
  const result = runLifetimeScenario("balanced-family", { generations: 3 });
  assert.equal(result.thirdGeneration.generation, 3);
  assert.equal(result.state.lifetime.reports.length, 2);
  assert.ok(result.state.yearlyHistory.length >= 1);
  assert.ok(result.state.yearlyHistory.length <= 2);
  assert.equal(result.state.career.retirement.status, "working");
  assert.equal(result.state.career.retirement.monthlyIncome, 0);
  assert.equal(reload(result.state).lifetime.generation, 3);
});

test("pending adult response and death-boundary reloads conserve knowledge and estate; corrupt distribution is rejected", () => {
  let s = prepared();
  week(s); week(s); week(s); target(s, "adult_child_discussion");
  const sourceId = s.events.active.sourceCaseId;
  const secrets = structuredClone(s.secrets);
  s = reload(s);
  assert.equal(s.events.active.sourceCaseId, sourceId);
  assert.equal(resolveEvent(s, "space").ok, true);
  assert.deepEqual(s.secrets, secrets, "a family discussion does not transfer unrelated NPC knowledge");
  const beforeDeath = prepared(98, 2);
  const second = reload(beforeDeath);
  week(beforeDeath); week(second);
  assert.deepEqual(beforeDeath.lifetime, second.lifetime);
  const corrupted = structuredClone(second);
  corrupted.lifetime.death.estate.shares[0].amount += 1;
  assert.equal(deserializeState(JSON.stringify(corrupted)).ok, false);
  const storage = { data: new Map(), getItem(k) { return this.data.get(k) ?? null; }, setItem(k, v) { this.data.set(k, v); } };
  assert.equal(saveGame(storage, second).ok, true);
  assert.equal(loadGame(storage).ok, true);
  assert.deepEqual(loadGame(storage).state.lifetime, second.lifetime);
});
