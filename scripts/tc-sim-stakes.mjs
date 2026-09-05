/**
 * TC SIM çekirdek denge ölçüm aracı.
 *
 *   node scripts/tc-sim-stakes.mjs            # 52 + 156 hafta, varsayılan seedler
 *   node scripts/tc-sim-stakes.mjs 52 1,2,3   # özel ufuk ve seedler
 *
 * Her strateji yalnız oyuncunun arayüzden gerçekten seçebileceği kararları
 * kullanır: haftalık karar hakkı, `getAvailableDecisions` görünürlüğü ve
 * `getAvailableSocialActions` uygunluğu aynen uygulanır.
 */
import { createNewGame } from "../public/games/tc-sim/js/state.js";
import {
  advanceWeek,
  applyDecision,
  canApplyDecision,
  getAvailableDecisions,
} from "../public/games/tc-sim/js/time.js";
import { getEventDefinition, resolveEvent } from "../public/games/tc-sim/js/events.js";
import {
  applySocialAction,
  getAvailableSocialActions,
  getRelationship,
  getRelationshipStage,
} from "../public/games/tc-sim/js/social.js";

const SOCIAL_TARGETS = ["mehmet", "anne", "elif", "baba"];

function settle(state, rand) {
  let guard = 0;
  while (state.events.active && guard++ < 50) {
    const definition = getEventDefinition(state.events.active.eventId);
    const choice = definition.choices[Math.floor(rand() * definition.choices.length)];
    resolveEvent(state, choice.id);
  }
}

const tryDecision = (state, id) => {
  const visible = getAvailableDecisions(state).some((item) => item.id === id);
  if (!visible) return false;
  if (!canApplyDecision(state, id).ok) return false;
  return applyDecision(state, id).ok;
};

function trySocial(state, personId, actionIds) {
  const actions = getAvailableSocialActions(state, personId);
  for (const wanted of actionIds) {
    const action = actions.find((item) => item.id === wanted && item.availability.ok);
    if (action && applySocialAction(state, personId, wanted).ok) return true;
  }
  return false;
}

/** İlk uygulanabilir kararı seçer; hiçbiri olmazsa false döner. */
const tryFirst = (state, ...ids) => ids.some((id) => tryDecision(state, id));

/** Her strateji: (state, week) => haftalık karar hakkı bitene kadar seçim yapar. */
const STRATEGIES = {
  balanced(state, week) {
    // Beden kötüyse önce toparlan, sonra biraz para, arada insan.
    if (state.health.energy <= 40) tryDecision(state, "rest");
    if (state.health.stress >= 60) tryFirst(state, "reset-routine", "rest");
    if (week % 3 === 0) trySocial(state, SOCIAL_TARGETS[week % SOCIAL_TARGETS.length], ["meet", "confide"]);
    if (state.health.energy >= 45) tryDecision(state, "overtime");
    tryDecision(state, "rest");
  },
  money(state) {
    // Parayı en üst düzeye çıkar; bedeni yalnız mesaiyi sürdürecek kadar onar.
    tryDecision(state, "overtime");
    tryFirst(state, "rest", "quiet-evening");
  },
  moneyPaced(state) {
    // Bilinçli para oyuncusu: bedeni izler, mesaiyi aralıklı kullanır.
    if (state.health.stress >= 65) tryDecision(state, "reset-routine");
    if (state.health.health <= 45) tryDecision(state, "exercise");
    const safe = state.health.energy >= 40 && state.health.health > 25 && state.health.stress < 70;
    if (safe) tryDecision(state, "overtime");
    tryFirst(state, "rest", "quiet-evening", "exercise");
  },
  recovery(state) {
    // Düşük risk: dinlen, sporla sağlığı koru, mesai yok.
    tryDecision(state, "rest");
    tryFirst(state, "exercise", "quiet-evening");
  },
  socialActive(state, week) {
    // Haftalık hakkın en az yarısını insanlara ayır.
    const person = SOCIAL_TARGETS[week % SOCIAL_TARGETS.length];
    trySocial(state, person, ["fulfill_promise", "repair", "meet", "confide", "help"]);
    trySocial(state, SOCIAL_TARGETS[(week + 1) % SOCIAL_TARGETS.length], ["meet", "confide", "help"]);
    tryDecision(state, "rest");
  },
  socialPassive(state) {
    // "balanced" ile aynı, yalnız insanlara ayrılan hafta yok. Sosyal etkinin A/B'si.
    if (state.health.energy <= 40) tryDecision(state, "rest");
    if (state.health.stress >= 60) tryFirst(state, "reset-routine", "rest");
    if (state.health.energy >= 45) tryDecision(state, "overtime");
    tryDecision(state, "rest");
  },
};

function run(strategyName, weeks, seed) {
  const state = createNewGame({
    name: "Ölçüm",
    profile: "balanced",
    seed,
    now: "2027-01-01T00:00:00.000Z",
  });
  let rng = seed >>> 0 || 1;
  const rand = () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    rng >>>= 0;
    return rng / 4294967296;
  };
  const strategy = STRATEGIES[strategyName];
  let minHealth = state.health.health;
  let weeksAtZeroHealth = 0;
  let weeksAtHighStress = 0;

  for (let week = 0; week < weeks; week += 1) {
    settle(state, rand);
    strategy(state, week);
    settle(state, rand);
    advanceWeek(state);
    settle(state, rand);
    minHealth = Math.min(minHealth, state.health.health);
    if (state.health.health === 0) weeksAtZeroHealth += 1;
    if (state.health.stress >= 80) weeksAtHighStress += 1;
  }

  const rel = (id) => getRelationship(state, id);
  return {
    strategy: strategyName,
    weeks,
    seed,
    balance: state.finances.balance,
    energy: state.health.energy,
    stress: state.health.stress,
    health: state.health.health,
    minHealth,
    weeksAtZeroHealth,
    weeksAtHighStress,
    mehmet: `${rel("mehmet").closeness}/${rel("mehmet").trust}/${rel("mehmet").tension} ${getRelationshipStage(state, "mehmet")}`,
    anne: `${rel("anne").closeness}/${rel("anne").trust}/${rel("anne").tension}`,
    elif: `${rel("elif").closeness}/${rel("elif").trust}/${rel("elif").tension}`,
    closenessTotal: SOCIAL_TARGETS.reduce((sum, id) => sum + rel(id).closeness, 0),
    trustTotal: SOCIAL_TARGETS.reduce((sum, id) => sum + rel(id).trust, 0),
  };
}

const horizons = (process.argv[2] || "52,156").split(",").map(Number);
const seeds = (process.argv[3] || "1,7,42").split(",").map(Number);
const rows = [];
for (const weeks of horizons) {
  for (const strategyName of Object.keys(STRATEGIES)) {
    const runs = seeds.map((seed) => run(strategyName, weeks, seed));
    const avg = (key) => Math.round(runs.reduce((s, r) => s + r[key], 0) / runs.length);
    rows.push({
      strategy: strategyName,
      weeks,
      balance: avg("balance"),
      energy: avg("energy"),
      stress: avg("stress"),
      health: avg("health"),
      minHealth: avg("minHealth"),
      zeroHealthWeeks: avg("weeksAtZeroHealth"),
      highStressWeeks: avg("weeksAtHighStress"),
      closeness: avg("closenessTotal"),
      trust: avg("trustTotal"),
      sample: runs[0].mehmet,
    });
  }
}
console.log(
  ["strategy", "wk", "balance", "en", "str", "hp", "minHp", "hp0wk", "hiStrWk", "close", "trust", "mehmet(seed1)"].join(
    "\t",
  ),
);
for (const row of rows) {
  console.log(
    [
      row.strategy.padEnd(13),
      row.weeks,
      row.balance,
      row.energy,
      row.stress,
      row.health,
      row.minHealth,
      row.zeroHealthWeeks,
      row.highStressWeeks,
      row.closeness,
      row.trust,
      row.sample,
    ].join("\t"),
  );
}
