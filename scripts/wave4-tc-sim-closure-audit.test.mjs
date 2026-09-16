import test from "node:test";
import assert from "node:assert/strict";
import { createNewGame } from "../public/games/tc-sim/js/state.js";
import { advanceWeek } from "../public/games/tc-sim/js/time.js";
import { normalizeLifetime } from "../public/games/tc-sim/js/lifetime.js";
import { ensureLifeDepthState } from "../public/games/tc-sim/js/life-depth.js";
import {
  CHAINS,
  DOSSIER_TRACE_TEMPLATES,
  LIFE_CONTENT_EVENTS,
  decorateLifeDossier,
  lifeContentBag,
  scheduleContent,
  takeDueLifeContent,
} from "../public/games/tc-sim/js/life-content.js";

const DELAYED = LIFE_CONTENT_EVENTS.filter((event) => !event.organic);
const ACTORS = ["anne", "baba", "mehmet", "elif", "burak", "kardes", "selin", "emre"];

function midLife(seed = 77) {
  const state = createNewGame({ seed });
  normalizeLifetime(state);
  state.time.absoluteWeek = 300;
  state.player.age = 30;
  state.career.jobId = "office";
  return state;
}

// continueGeneration keeps the "baba" roster slot and marks it deceased (it becomes
// the previous player), and network.js marks an absent parent available=false. Content
// used to read existence alone, so it kept addressing people who were dead or gone
// while social.js, state.js and the life-echo events all refused to.
test("authored content never addresses a dead or departed actor", () => {
  const withActor = LIFE_CONTENT_EVENTS.filter((event) => typeof event.organicCheck === "function");
  for (const actor of ACTORS) {
    const missing = midLife();
    missing.people = missing.people.filter((person) => person.id !== actor);
    const dead = midLife();
    const deadPerson = dead.people.find((person) => person.id === actor);
    deadPerson.deceased = true;
    deadPerson.available = false;
    const gone = midLife();
    gone.people.find((person) => person.id === actor).available = false;
    for (const event of withActor) {
      const closedWhenMissing = event.organicCheck(missing) === false;
      if (!closedWhenMissing) continue; // node does not depend on this actor
      assert.equal(event.organicCheck(dead), false, `${event.id} opened for a deceased ${actor}`);
      assert.equal(event.organicCheck(gone), false, `${event.id} opened for a departed ${actor}`);
    }
  }
});

test("a delayed callback addressed to a dead or departed actor is dropped, not delivered", () => {
  for (const actor of ACTORS) {
    for (const mark of ["deceased", "available"]) {
      const state = midLife();
      assert.equal(
        scheduleContent(state, { eventId: DELAYED[0].id, key: `probe-${actor}-${mark}`, dueWeeks: 2, actorId: actor }),
        true,
      );
      const person = state.people.find((row) => row.id === actor);
      if (mark === "deceased") person.deceased = true;
      else person.available = false;
      state.time.absoluteWeek += 2;
      assert.equal(takeDueLifeContent(state), null, `${DELAYED[0].id} reached a ${mark} ${actor}`);
      assert.equal(lifeContentBag(state).waiting.length, 0, "the dropped row must not linger in the queue");
    }
    // Control: the same callback still arrives while the actor is present and well.
    const healthy = midLife();
    scheduleContent(healthy, { eventId: DELAYED[0].id, key: `probe-${actor}-ok`, dueWeeks: 2, actorId: actor });
    healthy.time.absoluteWeek += 2;
    assert.equal(takeDueLifeContent(healthy), DELAYED[0].id);
  }
});

test("a due callback is not delivered after death and is not consumed either", () => {
  const state = midLife();
  scheduleContent(state, { eventId: DELAYED[0].id, key: "death-boundary", dueWeeks: 1 });
  state.time.absoluteWeek += 1;
  state.lifetime.death = {
    week: state.time.absoluteWeek,
    age: state.player.age,
    cause: "test",
    reportId: "report-x",
    estate: null,
  };
  assert.equal(takeDueLifeContent(state), null);
  assert.equal(lifeContentBag(state).waiting.length, 1);
  assert.equal(advanceWeek(state).ok, false);
});

// buildLifeDossier already hands over ten traces in any mature life, so appending the
// authored life-traces last made them structurally unreachable: the ten slots went to
// the final weeks' routine decisions instead of the decisions that shaped the life.
test("the life dossier keeps authored traces and generic rows side by side", () => {
  const state = midLife();
  const depth = ensureLifeDepthState(state);
  depth.arcHistory = Array.from({ length: 12 }, (_, i) => ({
    id: `health:rest:${300 - i}`,
    text: "Haftalık dinlenme.",
  }));
  depth.echoes = Array.from({ length: 4 }, (_, i) => ({ id: `echo:${i}`, week: 300, text: "Yankı." }));
  depth.dossier = {
    version: 1,
    outcome: "balanced",
    traces: [
      ...depth.arcHistory.slice(-8).map((row) => ({ id: row.id, text: row.text })),
      ...depth.echoes.slice(-4).map((row) => ({ id: row.id, text: row.text })),
    ].slice(-10),
  };
  const store = lifeContentBag(state);
  store.exclusive["career-fork"] = "yurtdisi";
  store.exclusive["commute-path"] = "metro";
  store.exclusive["crisis-response"] = "aile";
  store.exclusive["nikah-timing"] = "evlen";
  state.finances.arrears = 900;

  const dossier = decorateLifeDossier(state);
  const ids = dossier.traces.map((row) => row.id);
  assert.equal(ids.length, 10);
  assert.equal(ids[0], "lc-flavor-outcome");
  assert.equal(ids[1], "lc-flavor-seed");
  const authored = ids.filter((id) => id.startsWith("lc-trace-"));
  const generic = ids.filter((id) => !id.startsWith("lc-trace-") && !id.startsWith("lc-flavor-"));
  assert.ok(authored.length >= 5, `authored traces were cut again: ${ids.join(", ")}`);
  assert.ok(generic.length >= 1, `generic arc rows were pushed out entirely: ${ids.join(", ")}`);
  assert.equal(new Set(ids).size, ids.length, "traces must stay deduplicated");
  // The narrative notes keep the full authored set regardless of the trace budget.
  assert.ok(dossier.contentNotes.length >= authored.length);
  assert.ok(DOSSIER_TRACE_TEMPLATES.length >= authored.length);
});

test("the content slot never takes priority over a due, event-backed open case", () => {
  // processDueOpenCases enqueues before the content block, and the block only runs on an
  // empty queue with no active event, so a due case always wins its week.
  const state = midLife();
  const chainEvent = CHAINS[0].nodes[0].id;
  state.openCases.push({
    id: "audit-case",
    type: "depth",
    eventId: DELAYED[0].id,
    status: "pending",
    dueWeek: state.time.absoluteWeek + 1,
    payload: {},
  });
  scheduleContent(state, { eventId: DELAYED[1].id, key: "slot-race", dueWeeks: 1 });
  assert.equal(advanceWeek(state).ok, true);
  const active = state.events.active?.eventId;
  assert.equal(active, DELAYED[0].id, `content took the week instead of the due case (${active}, ${chainEvent})`);
  assert.equal(state.openCases.find((row) => row.id === "audit-case").status, "triggered");
});
