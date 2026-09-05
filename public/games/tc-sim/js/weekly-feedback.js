import { getKnownOpenCases } from "./calendar.js?v=7";

/**
 * Haftalık geri bildirimin salt veri katmanı. Ekrana ne yazılacağına
 * karışmaz; yalnız "önce" durumuyla "sonra" durumu arasındaki gerçek,
 * oyuncunun zaten bildiği farkları döner. İkinci bir simülasyon yürütmez,
 * yalnız mevcut state'i karşılaştırır.
 */

const BODY_AXES = ["energy", "stress", "health"];
const RELATIONSHIP_AXES = ["closeness", "trust", "tension"];
const RELATIONSHIP_NOISE_THRESHOLD = 2;
const MAX_RELATIONSHIP_CHANGES = 2;
const MAX_CHANGES = 6;

export function snapshotWeekState(state) {
  return {
    age: state.player.age,
    balance: state.finances.balance,
    health: { ...state.health },
    people: state.people.map((person) => ({
      id: person.id,
      closeness: state.relationships[person.id],
      trust: person.social.trust,
      tension: person.social.tension,
    })),
    knownCaseIds: getKnownOpenCases(state).map((item) => item.id),
    homeId: state.household.homeId,
    educationLevel: state.education.level,
  };
}

function relationshipChanges(before, afterState) {
  const changes = [];
  for (const beforePerson of before.people) {
    const person = afterState.people.find((candidate) => candidate.id === beforePerson.id);
    if (!person) continue;
    const deltas = {
      closeness: afterState.relationships[person.id] - beforePerson.closeness,
      trust: person.social.trust - beforePerson.trust,
      tension: person.social.tension - beforePerson.tension,
    };
    let topAxis = null;
    for (const axis of RELATIONSHIP_AXES) {
      if (!topAxis || Math.abs(deltas[axis]) > Math.abs(deltas[topAxis])) topAxis = axis;
    }
    const magnitude = Math.abs(deltas[topAxis]);
    if (magnitude < RELATIONSHIP_NOISE_THRESHOLD) continue;
    changes.push({
      kind: "relationship",
      personId: person.id,
      axis: topAxis,
      direction: deltas[topAxis] > 0 ? "up" : "down",
      magnitude,
    });
  }
  changes.sort((a, b) => b.magnitude - a.magnitude);
  return changes.slice(0, MAX_RELATIONSHIP_CHANGES);
}

/** `before`, snapshotWeekState'in döndüğü haftanın başındaki durumdur; `afterState` mevcut, canlı state'tir. */
export function summarizeWeek(before, afterState) {
  const changes = [];

  const balanceDelta = afterState.finances.balance - before.balance;
  if (balanceDelta !== 0) changes.push({ kind: "money", amount: balanceDelta });

  for (const axis of BODY_AXES) {
    const from = before.health[axis];
    const to = afterState.health[axis];
    if (from !== to) changes.push({ kind: "body", axis, from, to });
  }

  if (afterState.player.age !== before.age)
    changes.push({ kind: "age", age: afterState.player.age });
  if (afterState.education.level !== before.educationLevel)
    changes.push({ kind: "education", level: afterState.education.level });

  changes.push(...relationshipChanges(before, afterState));

  const newCases = getKnownOpenCases(afterState).filter(
    (item) => !before.knownCaseIds.includes(item.id),
  );
  for (const item of newCases) changes.push({ kind: "obligation", case: item });

  if (afterState.household.homeId !== before.homeId)
    changes.push({ kind: "housing", homeId: afterState.household.homeId });

  return changes.slice(0, MAX_CHANGES);
}
