import { createNewGame, validateState } from "../public/games/tc-sim/js/state.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import {
  DECISIONS,
  advanceWeek,
  applyDecision,
  canApplyDecision,
} from "../public/games/tc-sim/js/time.js";
import { loadGame, saveGame } from "../public/games/tc-sim/js/save.js";

class MemoryStorage {
  constructor() {
    this.data = new Map();
  }
  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }
  setItem(key, value) {
    this.data.set(key, String(value));
  }
  removeItem(key) {
    this.data.delete(key);
  }
}

let state = createNewGame({
  name: "Simülasyon",
  profile: "balanced",
  seed: 987654,
  now: "2027-01-01T00:00:00.000Z",
});
const storage = new MemoryStorage();
let eventCount = 0;

for (let step = 0; step < 144; step += 1) {
  if (state.events.active) {
    const definition = getEventDefinition(state.events.active.eventId);
    const preferred =
      state.events.active.eventId === "loan_repayment" ? "collect" : definition.choices[0].id;
    if (!resolveEvent(state, preferred).ok) throw new Error("Event çözülemedi");
    eventCount += 1;
  }
  const first = DECISIONS[(step * 2) % DECISIONS.length];
  const second = DECISIONS[(step * 2 + 1) % DECISIONS.length];
  for (const decision of [first, second])
    if (canApplyDecision(state, decision.id).ok) applyDecision(state, decision.id);
  if (state.events.active) {
    const definition = getEventDefinition(state.events.active.eventId);
    resolveEvent(
      state,
      state.events.active.eventId === "loan_repayment" ? "collect" : definition.choices[0].id,
    );
    eventCount += 1;
  }
  const advanced = advanceWeek(state);
  if (!advanced.ok) throw new Error(advanced.messages.join(" "));
  const validation = validateState(state);
  if (!validation.ok) throw new Error(validation.errors.join("; "));
  if ((step + 1) % 12 === 0) {
    const saved = saveGame(storage, state);
    if (!saved.ok) throw new Error(saved.message);
    const loaded = loadGame(storage);
    if (!loaded.ok) throw new Error(loaded.message);
    state = loaded.state;
  }
}

while (state.events.active) {
  const definition = getEventDefinition(state.events.active.eventId);
  resolveEvent(
    state,
    state.events.active.eventId === "loan_repayment" ? "collect" : definition.choices[0].id,
  );
  eventCount += 1;
}

const overdueCases = state.openCases.filter(
  (item) => item.status !== "resolved" && item.dueWeek <= state.time.absoluteWeek,
);
const serialized = JSON.stringify(state);
const result = {
  simulatedWeeks: 144,
  yearsCompleted: state.yearlyHistory.length,
  finalDate: state.time,
  age: state.player.age,
  balance: state.finances.balance,
  health: state.health,
  eventsResolved: eventCount,
  memories: state.memories.length,
  openCases: state.openCases.length,
  overdueCases: overdueCases.length,
  saveBytes: Buffer.byteLength(serialized),
  valid: validateState(state).ok,
};

if (
  !result.valid ||
  overdueCases.length ||
  !Number.isFinite(result.balance) ||
  result.saveBytes > 200000
)
  process.exitCode = 1;
console.log(JSON.stringify(result, null, 2));
