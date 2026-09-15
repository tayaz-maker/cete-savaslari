import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { applyAction, create, normalize } from "../public/games/next-wave.js";
import {
  coverage as sonCoverage,
  EXTRA_CALLBACKS,
  EXTRA_EVENTS as SON_EXTRA,
  SON100_ARCS,
} from "../public/games/next-wave/son100-content.js";
import { EVENTS as SON_EVENTS } from "../public/games/next-wave/son100-data.js";
import {
  availableSonActions,
  sonContentEligible,
  sonDossierTraces,
  sonEventEligibleForPhase,
} from "../public/games/next-wave/son100-sim.js";
import {
  coverage as townCoverage,
  EXTRA_EVENTS as TOWN_EXTRA,
  TOWN_ARCS,
} from "../public/games/son-kasaba/content.js";
import { EVENTS as TOWN_EVENTS, NPCS, GROUPS, INVESTORS, ENDINGS } from "../public/games/son-kasaba/data.js";
import {
  applyTownAction,
  createTown,
  eventEligible,
  normalizeTown,
  advanceTown,
  validateTown,
  population,
  endingFor,
} from "../public/games/son-kasaba/sim.js";

const copy = (value) => JSON.parse(JSON.stringify(value));
const root = new URL("../", import.meta.url).pathname;
const read = (relative) => readFileSync(join(root, relative), "utf8");

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

function injectSon(s, eventId) {
  const ev = SON_EVENTS.find((e) => e.id === eventId);
  assert.ok(ev, eventId);
  s.opportunities = [
    {
      id: ev.id + "_test",
      src: ev.id,
      title: ev.title,
      text: ev.text,
      expiresOn: s.day + 8,
      choices: ev.choices.slice(),
      domain: ev.domain,
      tags: ev.tags || [],
      callback: ev.callback,
      status: "open",
    },
  ];
  return ev;
}

test("Wave 2 content coverage: unique ids, floors met, no filler-count cheat", () => {
  const son = sonCoverage();
  assert.ok(son.extraEvents >= 60, `son extra ${son.extraEvents}`);
  assert.ok(son.chains >= 20, `son chains ${son.chains}`);
  assert.ok(son.delayedCallbacks >= 30, `son delayed ${son.delayedCallbacks}`);
  assert.ok(son.actorMemory >= 20, `son memory ${son.actorMemory}`);
  assert.ok(son.preparation >= 20, `son prep ${son.preparation}`);
  assert.ok(son.exclusive >= 10, `son exclusive ${son.exclusive}`);
  assert.ok(son.finalTraces >= 8, `son traces ${son.finalTraces}`);
  assert.equal(new Set(SON_EXTRA.map((e) => e.id)).size, SON_EXTRA.length);
  assert.equal(new Set(EXTRA_CALLBACKS.map((e) => e.id)).size, EXTRA_CALLBACKS.length);
  assert.equal(new Set(SON_EVENTS.map((e) => e.id)).size, SON_EVENTS.length);
  assert.equal(SON100_ARCS.length, son.chains);

  const town = townCoverage();
  assert.ok(town.extraEvents >= 90, `town extra ${town.extraEvents}`);
  assert.ok(town.chains >= 24, `town chains ${town.chains}`);
  assert.ok(town.delayed >= 35, `town delayed ${town.delayed}`);
  assert.ok(town.memorySensitive >= 30, `town memory ${town.memorySensitive}`);
  assert.ok(town.institutionStage >= 20, `town stage ${town.institutionStage}`);
  assert.ok(town.migrationInvestor >= 15, `town mig/inv ${town.migrationInvestor}`);
  assert.ok(town.exclusive >= 10, `town exclusive ${town.exclusive}`);
  assert.ok(town.finalTraces >= 8);
  assert.equal(town.npcs, 12);
  assert.equal(town.groups, 9);
  assert.equal(NPCS.length, 12);
  assert.equal(GROUPS.length, 9);
  assert.equal(INVESTORS.length, 7);
  assert.equal(Object.keys(ENDINGS).length, 7);
  assert.equal(new Set(TOWN_EVENTS.map((e) => e.id)).size, TOWN_EVENTS.length);
  assert.equal(new Set(TOWN_EXTRA.map((e) => e.id)).size, TOWN_EXTRA.length);
  assert.equal(TOWN_ARCS.length, town.chains);
  const coreTown = new Set(TOWN_EVENTS.map((e) => e.id).filter((id) => !TOWN_EXTRA.some((x) => x.id === id)));
  for (const ev of TOWN_EXTRA) assert.equal(coreTown.has(ev.id), false, `town extra collides ${ev.id}`);
});

test("SON 100 GÜN: sister-key chain walks, exclusive lock, delayed callback once, save/load mid-chain", () => {
  const s = create("son-100-gun");
  applyAction("son-100-gun", s, "scenario:financial-recovery");
  const give = injectSon(s, "prep-sister-key");
  applyAction("son-100-gun", s, `act:${give.choices[0]}`);
  assert.equal(s.flags.sonArcs["sister-key"], "give");
  assert.ok(s.openCases.some((row) => row.id === "sister-keeps"));
  const keep = SON_EVENTS.find((e) => e.id === "prep-sister-keep");
  assert.equal(sonContentEligible(s, keep), false);
  const follow = SON_EVENTS.find((e) => e.id === "coll-sister-return");
  assert.equal(sonContentEligible(s, follow), true);

  const mid = normalize("son-100-gun", copy(s));
  assert.equal(mid.flags.sonArcs["sister-key"], "give");
  assert.equal(mid.openCases.filter((row) => row.id === "sister-keeps").length, 1);
  while (
    mid.remainingDays > 0 &&
    mid.history.filter((row) => row.type === "callback" && row.id === "sister-keeps").length < 1
  ) {
    applyAction("son-100-gun", mid, "advance");
  }
  assert.equal(mid.history.filter((row) => row.type === "callback" && row.id === "sister-keeps").length, 1);
  applyAction("son-100-gun", mid, "advance");
  applyAction("son-100-gun", mid, "advance");
  assert.equal(mid.history.filter((row) => row.type === "callback" && row.id === "sister-keeps").length, 1);
  finiteTree(mid.resources);
  finiteTree(mid.flags);
});

test("SON 100 GÜN: extra events stay phase-reachable and extra callbacks are unique", () => {
  const samples = { preparation: 90, fracture: 70, scarcity: 50, collapse: 30, finale: 10 };
  for (const event of SON_EXTRA) {
    assert.ok(
      Object.entries(samples).some(([phase, left]) => sonEventEligibleForPhase(event, phase, left)),
      event.id,
    );
  }
  const callbackIds = SON_EXTRA.filter((e) => e.callback).map((e) => e.callback.id);
  assert.equal(new Set(callbackIds).size, callbackIds.length);
  for (const id of callbackIds) assert.ok(EXTRA_CALLBACKS.some((row) => row.id === id), id);
});

test("SON 100 GÜN: 20 content-rich runs diverge, stay bounded, leave dossier traces", () => {
  const endings = new Set();
  const seen = new Set();
  const traces = new Set();
  const extraSeen = new Set();
  const extraIds = new Set(SON_EXTRA.map((e) => e.id));
  for (let run = 0; run < 20; run++) {
    const s = create("son-100-gun");
    applyAction(
      "son-100-gun",
      s,
      `scenario:${["financial-recovery", "family-care", "creative-legacy", "justice-case"][run % 4]}`,
    );
    while (s.remainingDays > 0) {
      const actions = availableSonActions(s);
      const preferences =
        run % 4 === 0
          ? ["work", "pay", "family"]
          : run % 4 === 1
            ? ["rest", "doctor", "family"]
            : run % 4 === 2
              ? ["legacy", "write-will", "donate"]
              : ["confess", "report-crime", "forgive"];
      const id = preferences.find((x) => actions.includes(x)) || actions[(run + s.day) % actions.length];
      if (id) applyAction("son-100-gun", s, `act:${id}`);
      applyAction("son-100-gun", s, "advance");
      for (const op of s.opportunities) if (op.src) {
        seen.add(op.src);
        if (extraIds.has(op.src)) extraSeen.add(op.src);
      }
    }
    assert.equal(s.flags.finalReport, true);
    assert.ok(JSON.stringify(s).length < 70000);
    finiteTree(s.resources);
    finiteTree(s.depth.preparations);
    endings.add(s.flags.report.endingId);
    for (const line of s.flags.report.traces || []) traces.add(line);
    assert.ok((s.flags.report.traces || []).length >= 1);
  }
  assert.ok(endings.size >= 3, `endings ${[...endings]}`);
  assert.ok(seen.size >= 30, `seen ${seen.size}`);
  assert.ok(extraSeen.size >= 3, `extra seen ${extraSeen.size}`);
  assert.ok(traces.size >= 4, `trace variety ${traces.size}`);
});

test("SON 100 GÜN: dossier traces key off arcs, prep and actors", () => {
  const s = create("son-100-gun");
  applyAction("son-100-gun", s, "scenario:family-care");
  s.flags.sonArcs = { "sister-key": "give", "partner-door": "stay", "boss-file": "speak", "will-draft": "wrote" };
  s.depth.preparations.health = 4;
  s.depth.preparations.legal = 3;
  s.flags.donateCount = 2;
  const traces = sonDossierTraces(s);
  assert.ok(traces.some((line) => /kız kardeş/i.test(line)));
  assert.ok(traces.some((line) => /partner/i.test(line)));
  assert.ok(traces.some((line) => /vasiyet/i.test(line)));
  assert.ok(traces.length >= 4);
  assert.ok(traces.length <= 10);
});

test("SON KÖY MANAGER: well-war and workshop chains, exclusive lock, delayed once, save/load", () => {
  const s = createTown();
  s.month = 2;
  s.completedMonths = 1;
  s.budget = 300000;
  s.metrics.water = 0;
  s.seenEvents = ["well-clock"];
  s.events = [{ id: "well-clock", status: "open", opened: 2, expires: 5 }];
  assert.equal(applyTownAction(s, "event:well-clock:act"), true);
  assert.equal(s.flags.townArcs["well-war"], "repair");
  const tanker = TOWN_EVENTS.find((e) => e.id === "well-tanker");
  s.metrics.water = 0;
  assert.equal(eventEligible(s, tanker), false, "exclusive well-tanker");
  const share = TOWN_EVENTS.find((e) => e.id === "well-share");
  s.month = 5;
  s.completedMonths = 4;
  s.metrics.water = 0;
  assert.equal(eventEligible(s, share), true, "well-share after repair");
  assert.equal(s.pending.length, 1);
  const restored = normalizeTown("son-kasaba", copy(s));
  assert.equal(restored.flags.townArcs["well-war"], "repair");
  const delay = TOWN_EVENTS.find((e) => e.id === "well-clock").choices[0].delay;
  const laterTr = TOWN_EVENTS.find((e) => e.id === "well-clock").choices[0].text[0];
  for (let i = 0; i < delay + 1; i++) advanceTown(restored);
  assert.equal(
    restored.history.filter((row) => row.type === "callback" && row.text[0] === laterTr).length,
    1,
  );

  const w = createTown();
  w.month = 4;
  w.completedMonths = 3;
  w.budget = 300000;
  w.metrics.jobs = 0;
  w.seenEvents = ["workshop-lease"];
  w.events = [{ id: "workshop-lease", status: "open", opened: 4, expires: 7 }];
  assert.equal(applyTownAction(w, "event:workshop-lease:act"), true);
  assert.equal(w.flags.townArcs.workshop, "lease");
  const close = TOWN_EVENTS.find((e) => e.id === "workshop-refuse");
  w.metrics.jobs = 0;
  assert.equal(eventEligible(w, close), false);
  const order = TOWN_EVENTS.find((e) => e.id === "workshop-order");
  w.month = 8;
  w.metrics.enterprise = 20;
  assert.equal(eventEligible(w, order), true);
  finiteTree(w.metrics);
  finiteTree(w.budget);
});

test("SON KÖY MANAGER: identity and institution gates are content-only", () => {
  const agri = TOWN_EVENTS.find((e) => e.id === "ident-agri-fair");
  const s = createTown();
  s.month = 12;
  s.completedMonths = 11;
  s.metrics.agriculture = 80;
  s.identity = "crisis";
  assert.equal(eventEligible(s, agri), false);
  s.identity = "agriculture";
  assert.equal(eventEligible(s, agri), true);

  const charter = TOWN_EVENTS.find((e) => e.id === "stage-charter-read");
  const t = createTown();
  t.month = 20;
  t.completedMonths = 19;
  t.progression.institutions = ["council"];
  assert.equal(eventEligible(t, charter), false);
  t.progression.institutions = ["council", "town-charter"];
  assert.equal(eventEligible(t, charter), true);

  const hotel = TOWN_EVENTS.find((e) => e.id === "hotel-beach");
  const h = createTown();
  h.month = 8;
  h.metrics.tourism = 40;
  h.investors.find((i) => i.id === "hotel").status = "unseen";
  assert.equal(eventEligible(h, hotel), false);
  h.investors.find((i) => i.id === "hotel").status = "accepted";
  assert.equal(eventEligible(h, hotel), true);
});

test("SON KÖY MANAGER: 20 campaigns stay bounded with extra content and varied finals", () => {
  const endings = new Set();
  const extras = new Set();
  const extraIds = new Set(TOWN_EXTRA.map((e) => e.id));
  for (let run = 0; run < 20; run++) {
    const s = createTown({ context: ["balanced", "industry", "rural"][run % 3] });
    if (run % 4 === 0) s.budget = 25000;
    if (run % 4 === 2) s.budget = 350000;
    for (let month = 0; month < 24; month++) {
      const civic =
        run % 4 === 0
          ? ["civic:loan", "civic:road", "repair:school"]
          : run % 4 === 1
            ? ["civic:housing", "civic:support", "civic:festival"]
            : run % 4 === 2
              ? ["civic:water", "civic:energy", "repair:clinic"]
              : ["civic:cleanup", "civic:road", "coalition:young:elders"];
      for (const cmd of civic) applyTownAction(s, cmd);
      for (const e of s.events.filter((x) => x.status === "open").slice(0, 1)) {
        applyTownAction(s, `event:${e.id}:${run % 3 ? "act" : "decline"}`);
        if (extraIds.has(e.id)) extras.add(e.id);
      }
      for (const offer of s.investors.filter((x) => x.status === "offered").slice(0, 1))
        applyTownAction(s, `investor:${offer.id}:${run % 3 === 0 ? "reject" : run % 3 === 1 ? "negotiate" : "accept"}`);
      advanceTown(s);
      assert.ok(validateTown(s));
      finiteTree(s.metrics);
      assert.ok(Number.isFinite(population(s)));
    }
    assert.equal(s.ended, true);
    assert.ok(JSON.stringify(s).length < 100000);
    assert.equal(s.ending.reasons.length >= 8, true);
    endings.add(s.ending.id);
    const leftover = copy(s);
    leftover.flags.townArcs = undefined;
    assert.ok(normalizeTown("son-kasaba", leftover));
  }
  assert.ok(endings.size >= 2, `endings ${[...endings]}`);
  assert.ok(endingFor(createTown()).reasons.length >= 8);
});

test("SON KÖY MANAGER rename: canonical route, old alias, save key frozen", () => {
  const games = read("src/lib/games.ts");
  assert.match(games, /"son-koy-manager": "son-kasaba"/);
  assert.match(games, /title: "SON KÖY MANAGER"/);
  assert.match(games, /href: "\/oyna\/son-koy-manager"/);
  assert.match(games, /slug: "son-kasaba"/);
  assert.match(games, /"son-kasaba"/);
  const route = read("src/routes/oyna.$slug.tsx");
  assert.match(route, /canonicalPlaySlug/);
  const app = read("public/games/son-kasaba/app.js");
  assert.match(app, /bootGame\("son-kasaba"/);
  assert.match(app, /SON KÖY MANAGER/);
  assert.doesNotMatch(app, /Son Kasaba/);
  const html = read("public/games/son-kasaba/index.html");
  assert.match(html, /SON KÖY MANAGER/);
  assert.match(html, /data-game="son-kasaba"/);
  const credits = read("public/credits.html");
  assert.match(credits, /data-route="\/oyna\/son-koy-manager"/);
  assert.match(credits, /href="\/oyna\/son-koy-manager"/);
  const i18n = read("public/i18n/tlab-i18n.js");
  assert.match(i18n, /SON KÖY MANAGER/);
  assert.match(i18n, /href="\/oyna\/son-koy-manager"/);
  const docs = read("docs/README.md");
  assert.match(docs, /SON KÖY MANAGER/);
  assert.match(docs, /\/oyna\/son-koy-manager/);
  const sim = read("public/games/son-kasaba/sim.js");
  assert.match(sim, /id: "son-kasaba"/);
  const runtime = read("public/games/next-wave/shared/runtime.js");
  assert.match(runtime, /tariklab\.nextwave\./);
  assert.match(runtime, /\$\{id\}\.slot/);
});
