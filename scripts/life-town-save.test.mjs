import test from "node:test";
import assert from "node:assert/strict";
import { bootGame } from "../public/games/next-wave/shared/runtime.js";
test("safe local sessions isolate slots, preserve active state on failed load, recover backup and report quota failures", () => {
  const values = new Map();
  let fail = false;
  globalThis.localStorage = {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      if (fail) throw Error("quota");
      values.set(k, v);
    },
    removeItem: (k) => values.delete(k),
  };
  globalThis.document = {
    querySelector: () => null,
    documentElement: { classList: { toggle() {} } },
  };
  globalThis.window = {
    confirm: () => true,
    addEventListener() {},
    tlabI18n: { getLang: () => "tr", onLang: () => () => {} },
  };
  try {
    const session = bootGame("apartman", () => {}, { safe: true });
    assert.equal(values.size, 0);
    session.beginNew();
    session.commitNew();
    session.state.week = 11;
    session.save(1);
    session.save(2);
    session.state.week = 22;
    session.save(2);
    session.load(1);
    assert.equal(session.state.week, 11);
    const menu = bootGame("apartman", () => {}, { safe: true });
    menu.select(2);
    menu.continue();
    assert.equal(menu.state.week, 22);
    const reloaded = bootGame("apartman", () => {}, { safe: true });
    assert.equal(reloaded.active, 2);
    assert.equal(reloaded.state, null);
    const state = session.state;
    assert.equal(session.load(3), false);
    assert.equal(session.state, state);
    values.set("tariklab.nextwave.apartman.slot2", "{broken");
    session.load(2);
    assert.equal(session.state.week, 11);
    fail = true;
    assert.equal(session.save(2), false);
    assert.match(session.notice, /yazılamadı/);
    assert.equal(session.state.week, 11);
    fail = false;
    session.remove(2);
    assert.equal(values.has("tariklab.nextwave.apartman.slot2.backup"), false);
    session.load(1);
    assert.equal(session.state.week, 11);
    assert.equal(session.save(99), false);
  } finally {
    delete globalThis.localStorage;
    delete globalThis.document;
    delete globalThis.window;
  }
});
