import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const gameIds = ["apartman", "son-100-gun", "hayat", "kayip-telefon", "tc-sim-devlet"];

function storageHarness(initial = {}) {
  const values = new Map(Object.entries(initial));
  const writes = [];
  return {
    values,
    writes,
    storage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        writes.push(key);
        values.set(key, value);
      },
      removeItem: (key) => values.delete(key),
    },
  };
}

test("route open reads slot metadata but creates, loads and writes no game state", async () => {
  const saved = JSON.stringify({
    meta: { version: 1, id: "apartman", seed: 12345 },
    week: 7,
    building: {},
    finance: {},
    residents: [],
    issues: [],
    meetings: [],
    lastMeeting: null,
    openCases: [],
    history: [],
    flags: {},
    ui: {},
  });
  const harness = storageHarness({ "tariklab.nextwave.apartman.slot1": saved });
  const listeners = new Set();
  globalThis.localStorage = harness.storage;
  globalThis.document = {
    querySelector: () => null,
    documentElement: { classList: { toggle() {} } },
  };
  globalThis.window = {
    self: {},
    top: {},
    confirm: () => true,
    addEventListener() {},
    tlabI18n: {
      getLang: () => "tr",
      onLang(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
    },
  };
  try {
    const { bootGame } =
      await import("../public/games/next-wave/shared/runtime.js?start-flow-boundary");
    const session = bootGame("apartman", () => {});
    assert.equal(session.state, null);
    assert.equal(session.slotSummaries()[0].filled, true);
    assert.deepEqual(harness.writes, []);

    assert.equal(session.continue(), true);
    assert.equal(session.state.week, 7);
    assert.deepEqual(harness.writes, [], "Continue must not rewrite an exact save");
  } finally {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  }
});

test("new-game authorization, cancel and final commit enforce the state boundary exactly once", async () => {
  const harness = storageHarness();
  globalThis.localStorage = harness.storage;
  globalThis.document = {
    querySelector: () => null,
    documentElement: { classList: { toggle() {} } },
  };
  globalThis.window = {
    self: {},
    top: {},
    confirm: () => true,
    addEventListener() {},
    tlabI18n: { getLang: () => "tr", onLang: () => () => {} },
  };
  try {
    const { bootGame } =
      await import("../public/games/next-wave/shared/runtime.js?start-flow-commit");
    const session = bootGame("hayat", () => {});
    assert.equal(session.beginNew(), true);
    assert.equal(session.state, null);
    session.cancelNew();
    assert.equal(
      session.commitNew({
        configure: (state) => {
          state.playerName = "Yanlış";
        },
      }),
      false,
    );
    assert.equal(session.state, null);
    assert.equal(harness.writes.length, 0);

    assert.equal(session.beginNew(), true);
    assert.equal(
      session.commitNew({
        configure: (state) => {
          state.playerName = "Tarık";
        },
      }),
      true,
    );
    assert.equal(session.state.playerName, "Tarık");
    assert.equal(harness.writes.filter((key) => key.endsWith(".slot1")).length, 1);
    assert.equal(session.commitNew(), false, "final CTA cannot create the same run twice");
    assert.equal(harness.writes.filter((key) => key.endsWith(".slot1")).length, 1);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  }
});

test("all five games expose the universal menu before a game-specific setup", () => {
  const ctas = {
    apartman: "YÖNETİMİ DEVRAL",
    "son-100-gun": "100 GÜNÜ BAŞLAT",
    hayat: "HAYATA BAŞLA",
    "kayip-telefon": "TELEFONU AÇ",
    "tc-sim-devlet": "DEVLETİ DEVRAL",
  };
  for (const id of gameIds) {
    const app = read(`public/games/${id}/app.js`);
    assert.match(app, /frontMenu\(/, `${id} must render the shared front menu`);
    assert.match(app, /bindFrontMenu\(/, `${id} must bind every front-menu control`);
    assert.match(app, new RegExp(ctas[id]), `${id} must have a final setup CTA`);
    assert.match(app, /global-chrome/, `${id} must mark duplicate iframe chrome for hiding`);
  }
});

test("Son 100 Gün separates scenario selection from final state creation", () => {
  const app = read("public/games/son-100-gun/app.js");
  assert.match(app, /chooseScenario/);
  assert.match(app, /paintScenarioSelection/);
  assert.match(app, /id="confirm-start"/);
  assert.doesNotMatch(app, /data-scenario[\s\S]{0,300}session\.start/);
  assert.match(app, /commitNew\(\{ action: `scenario:/);
  assert.doesNotMatch(app, /selectedScenario = button\.dataset\.scenario;\s*session\.render\(\)/);
});

test("Hayat is a named, panel-based management shell rather than a diary-only page", () => {
  const app = read("public/games/hayat/app.js");
  for (const marker of [
    "playerName",
    "life-hud",
    "life-nav",
    '"me"',
    '"decisions"',
    '"path"',
    '"money"',
    '"people"',
    '"home"',
    '"shadows"',
    '"history"',
    "result-feed",
  ])
    assert.ok(app.includes(marker), `Hayat missing ${marker}`);
  assert.doesNotMatch(app, /class="life-grid"|class="timeline"/);
  assert.match(app, /commitNew\(\{[\s\S]*playerName/);
});

test("DEVLET setup is conditional, real and cannot reset the run from gameplay", () => {
  const app = read("public/games/tc-sim-devlet/app.js");
  for (const marker of [
    "DOCTRINES",
    "ALT_PRESETS",
    "hydrateDevlet",
    "setupDraft",
    "DÖNEM",
    "OYUN MODU",
    "HEDEF MODU",
    "DOKTRİN",
    "ALTERNATİF PRESET",
    "DEVLET DOSYASI",
    "DEVLETİ DEVRAL",
  ])
    assert.ok(app.includes(marker), `DEVLET setup missing ${marker}`);
  assert.match(app, /factory: \(\) => hydrateDevlet/);
  assert.doesNotMatch(app, /data-era=/, "era selection belongs only to the pre-game wizard");
  assert.doesNotMatch(app, /\["periods",/, "gameplay navigation must not expose a reset surface");
  assert.doesNotMatch(app, /session\.act\(`era:/);
});

test("embedded mode hides duplicate portal chrome but preserves the game's save tools", () => {
  const runtime = read("public/games/next-wave/shared/runtime.js");
  const css = read("public/games/next-wave/shared/base.css");
  assert.match(runtime, /window\.self !== window\.top/);
  assert.match(css, /\.embedded \.topbar > a/);
  assert.match(css, /\.embedded \.topbar__title/);
  assert.doesNotMatch(css, /\.embedded\s+\.(?:global-chrome|topbar)\s*\{[^}]*display:\s*none/);
  assert.match(runtime, /class="save-menu"/);
});
