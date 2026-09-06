import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const runtime = readFileSync(new URL("../public/i18n/tlab-i18n.js", import.meta.url), "utf8");

test("cross-document language changes notify once without touching gameplay storage", () => {
  const values = new Map([
    ["tariklab.language", "tr"],
    ["game.slot1", '{"week":7}'],
  ]);
  const handlers = {};
  const writes = [];
  const context = {
    localStorage: {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => {
        writes.push(k);
        values.set(k, v);
      },
    },
    addEventListener: (event, fn) => {
      handlers[event] = fn;
    },
  };
  vm.runInNewContext(runtime, context);
  const I = context.tlabI18n;
  let calls = 0;
  let off;
  off = I.onLang(() => {
    calls++;
    off();
    I.onLang(() => {
      calls++;
    });
  });
  values.set(I.KEY, "en");
  handlers.storage({ key: I.KEY });
  assert.equal(I.getLang(), "en");
  assert.equal(calls, 1, "listeners added during a notification wait for the next change");
  handlers.storage({ key: "game.slot1" });
  assert.equal(calls, 1);
  assert.equal(values.get("game.slot1"), '{"week":7}');
  assert.ok(writes.every((k) => k === I.KEY));
  values.delete(I.KEY);
  handlers.storage({ key: null });
  assert.equal(I.getLang(), "tr");
  assert.equal(calls, 2);
});

test("Next Wave language rerender preserves game and screen without an extra save write", async () => {
  const values = new Map();
  const listeners = new Set();
  let lang = "tr";
  const writes = [];
  const storage = {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      writes.push(k);
      values.set(k, v);
    },
    removeItem: (k) => values.delete(k),
  };
  const snapshots = [];
  const doc = { querySelector: () => null };
  const I = {
    HELP_EN: { apartman: "Meeting help" },
    getLang: () => lang,
    phrase: (x) => x,
    applyHtmlLang() {},
    mountLangToggle() {},
    onLang(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
  globalThis.localStorage = storage;
  globalThis.document = doc;
  globalThis.window = { tlabI18n: I, addEventListener() {} };
  try {
    const { bootGame } =
      await import("../public/games/next-wave/shared/runtime.js?final-language-neutrality");
    const game = bootGame("apartman", (api) =>
      snapshots.push({ state: structuredClone(api.state), lang }),
    );
    game.start();
    game.setUI("screen", "Toplantı");
    const before = structuredClone(game.state);
    const writesBeforeLanguageChanges = writes.length;
    for (const next of ["en", "tr", "en"]) {
      lang = next;
      [...listeners].forEach((fn) => fn(next));
      assert.deepEqual(game.state, before);
      assert.equal(
        writes.length,
        writesBeforeLanguageChanges,
        "language switching must not persist or overwrite gameplay",
      );
      assert.equal(listeners.size, 1, "rerenders must not accumulate game listeners");
    }
    const saved = JSON.parse(values.get("tariklab.nextwave.apartman.slot1"));
    assert.equal(saved.week, 1);
    assert.equal(saved.ui.screen, "Toplantı");
    assert.equal(saved.finance.cash, 12000);
    assert.equal(snapshots.at(-1).lang, "en");
  } finally {
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.localStorage;
  }
});
