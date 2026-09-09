/**
 * Regressions for the defects found in the Opus definitive technical closure.
 * Each test names the defect it guards so a future change cannot quietly undo it.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  hydrateDevlet,
  tickDevlet,
  tickDevletN,
  applyPolicy,
} from "../public/games/next-wave/devlet-sim.js";
import { GRAND_HOOKS } from "../public/games/next-wave/devlet-data.js";
import { create, applyAction, normalize } from "../public/games/next-wave.js";

const root = new URL("../", import.meta.url).pathname;

test("DEVLET grand campaign has a real terminal at 2030/12 and stays there", () => {
  // Defect: tickDevletN cleared flags.campaignEnd on every iteration, so no run
  // ever ended; repeated advancing walked the campaign past 2030 indefinitely.
  const s = hydrateDevlet("1923", { campaign: true });
  tickDevletN(s, 5000);
  assert.equal(s.time.year, 2030);
  assert.equal(s.time.month, 12);
  assert.equal(s.flags.campaignEnd, true);

  const frozen = JSON.stringify(s);
  tickDevlet(s);
  tickDevletN(s, 200);
  assert.equal(
    JSON.stringify(s),
    frozen,
    "ticking a finished run must be a no-op, not silent extra months",
  );
});

test("DEVLET era horizons terminate at their own end year", () => {
  // Defect: the 2002-2005 slice ran to 2052 because only the grand campaign
  // was ever checked for an end condition.
  const s = hydrateDevlet("2002");
  assert.equal(s.grand.endYear, 2005);
  tickDevletN(s, 600);
  assert.equal(s.time.year, 2005);
  assert.equal(s.time.month, 12);
  assert.equal(s.flags.campaignEnd, true);
});

test("DEVLET declared campaign length matches the runtime span", () => {
  const s = hydrateDevlet("1923", { campaign: true });
  let months = 0;
  while (!s.flags.campaignEnd && months < 5000) {
    tickDevlet(s);
    months += 1;
  }
  assert.equal(
    months,
    GRAND_HOOKS.months,
    "GRAND_HOOKS.months must equal the real 1923-10 -> 2030-12 span",
  );
});

test("DEVLET campaign history keeps the meaningful record, not month heartbeats", () => {
  // Defect: a {type:"month"} row was pushed every tick into an 80-row capped
  // history, so a 1284-month campaign evicted every period transition, policy
  // and reopened file - the whole institutional record was heartbeat noise.
  const s = hydrateDevlet("1923", { campaign: true });
  tickDevletN(s, 5000);
  assert.equal(
    s.history.some((h) => h.type === "month"),
    false,
    "no per-month heartbeat rows in history",
  );
  const transitions = s.history.filter((h) => h.type === "period-transition");
  assert.equal(
    transitions.length,
    4,
    "1950, 1980, 2002 and gunumuz transitions all survive to the end of the run",
  );
  assert.deepEqual(
    transitions.map((t) => t.era),
    ["1950", "1980", "2002", "gunumuz"],
  );
  assert.ok(s.history.length <= 80);
});

test("DEVLET save/load is neutral at the dangerous boundaries", () => {
  // A reload must never duplicate an effect, reroll an implementation result
  // or replay a period transition. The engine is fully deterministic, so a
  // round trip taken at each risky moment must produce an identical next month.
  const roundTrip = (label, prepare) => {
    const live = prepare();
    const reloaded = JSON.parse(JSON.stringify(live));
    tickDevlet(live);
    tickDevlet(reloaded);
    assert.equal(
      JSON.stringify(live),
      JSON.stringify(reloaded),
      `reload changed the next month at: ${label}`,
    );
  };

  roundTrip("mid-run with a policy still pending", () => {
    const s = hydrateDevlet("2002");
    tickDevletN(s, 7);
    // queue a policy so the save happens between intent and field result
    applyPolicy(s, "imf-sba");
    return s;
  });

  roundTrip("on the December year boundary", () => {
    const s = hydrateDevlet("2002");
    while (s.time.month !== 12) tickDevlet(s);
    return s;
  });

  roundTrip("one month before a period transition", () => {
    const s = hydrateDevlet("1923", { campaign: true });
    while (!(s.time.year === 1949 && s.time.month === 12)) tickDevlet(s);
    return s;
  });

  roundTrip("immediately after a period transition and its ghost", () => {
    const s = hydrateDevlet("1923", { campaign: true });
    while (s.ghosts.length === 0) tickDevlet(s);
    return s;
  });

  // and a reload must not resurrect a finished run
  const done = hydrateDevlet("2002");
  tickDevletN(done, 600);
  const revived = JSON.parse(JSON.stringify(done));
  tickDevletN(revived, 50);
  assert.equal(
    JSON.stringify(revived),
    JSON.stringify(done),
    "reloading a finished run must not restart it",
  );
});

test("DEVLET known-confidence moves on all three reported channels", () => {
  // Defect: only known.inflation was updated per tick; treasury and
  // unemployment confidence stayed frozen at their hydrate values forever.
  const s = hydrateDevlet("2002");
  const before = JSON.parse(JSON.stringify(s.known));
  tickDevletN(s, 24);
  for (const key of ["inflation", "treasury", "unemployment"]) {
    assert.notDeepEqual(s.known[key], before[key], `known.${key} confidence must age with the run`);
    assert.ok(s.known[key].confidence >= 0 && s.known[key].confidence <= 1);
  }
});

test("DEVLET status panel reports, it does not leak simulation truth", () => {
  // Defect: the Durum panel printed actual.inflation / actual.treasury /
  // actual.unemployment straight to the player next to the reported values,
  // which defeats the actual-vs-reported-vs-known mechanic the game is built on.
  const src = readFileSync(root + "public/games/tc-sim-devlet/app.js", "utf8") + readFileSync(root + "public/games/tc-sim-devlet/presentation.js", "utf8");
  assert.equal(
    /(?:state|s)\.actual\./.test(src),
    false,
    "no direct state.actual render anywhere in the DEVLET experience",
  );
  assert.ok(/(?:state|s)\.reported\.inflation/.test(src));
  assert.ok(
    /(?:state|s)\.known/.test(src),
    "player-facing figures are reported values with a confidence readout",
  );
});

test("Son 100 Gün cannot be played past its own final report", () => {
  // Defect: after day 100 the "advance" action kept incrementing the day and
  // kept missing obligations (day 101 -> 121 on twenty presses).
  const s = create("son-100-gun");
  let guard = 0;
  while (!s.flags.finalReport && guard < 5000) {
    applyAction("son-100-gun", s, "act:work");
    guard += 1;
  }
  assert.equal(s.flags.finalReport, true);
  const endDay = s.day;
  const endMissed = s.missed.length;
  for (let i = 0; i < 25; i += 1) applyAction("son-100-gun", s, "advance");
  for (let i = 0; i < 25; i += 1) applyAction("son-100-gun", s, "act:work");
  assert.equal(s.day, endDay, "the day counter must stop at the end of the run");
  assert.equal(s.missed.length, endMissed, "no obligations may be missed after the run is over");
});

test("next-wave saves never load into the wrong game", () => {
  // Defect: validate() only checked meta.version plus two arrays, so one
  // game's payload validated cleanly as another game's save.
  const apartman = create("apartman");
  assert.equal(normalize("kayip-telefon", JSON.parse(JSON.stringify(apartman))), null);
  assert.equal(normalize("tc-sim-devlet", JSON.parse(JSON.stringify(apartman))), null);
  const phone = create("kayip-telefon");
  assert.equal(normalize("kayip-telefon", JSON.parse(JSON.stringify(phone))).meta.id, "kayip-telefon");
  assert.equal(
    normalize("kayip-telefon", null).meta.id,
    "kayip-telefon",
    "an empty slot still starts a fresh game",
  );
});

test("next-wave html escaping actually escapes", () => {
  // Defect: every replacement in the escape helper mapped a character to
  // itself, so nothing rendered through innerHTML was escaped at all.
  const src = readFileSync(root + "public/games/next-wave/shared/runtime.js", "utf8");
  const fn = src.slice(
    src.indexOf("function escapeHtml"),
    src.indexOf("function escapeHtml") + 420,
  );
  assert.ok(fn.includes("&amp;"), "& must be escaped");
  assert.ok(fn.includes("&lt;"), "< must be escaped");
  assert.ok(fn.includes("&gt;"), "> must be escaped");
  assert.equal(/replaceAll\("&", "&"\)/.test(fn), false, "no identity replacement");
});

test("Çete shell never becomes a scroll container (breaks sticky navigation)", () => {
  // Defect: `overflow-x: hidden` on .game-shell computes overflow-y to `auto`
  // per the CSS overflow spec, making the shell a scroll container so the
  // desktop tab nav's `position: sticky` anchored to it instead of the
  // viewport and scrolled away in long views.
  // The behavioural proof lives in scripts/cete-scroll-regression.mjs (real
  // browser); this guard is the CI-safe half, since CI has no browser.
  const src = readFileSync(root + "src/components/game/game-shell.tsx", "utf8");
  const shell = src.slice(
    src.indexOf('className="game-shell'),
    src.indexOf('className="game-shell') + 200,
  );
  assert.equal(
    /overflow-x-hidden/.test(shell),
    false,
    "use overflow-x-clip: `hidden` forces overflow-y to auto",
  );
  assert.ok(/overflow-x-clip/.test(shell), "horizontal guard must stay in place");
  const main = src.slice(src.indexOf("<main"), src.indexOf("<main") + 320);
  assert.equal(
    /overflow-y-auto/.test(main),
    false,
    "the document owns the scroll; no always-on second scroll container",
  );
});
