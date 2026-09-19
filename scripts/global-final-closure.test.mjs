import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMatch } from "../public/games/ihtilal/engine.js";
import { saveSlot, loadSlot, clearSlot, slotKey } from "../public/games/ihtilal/save.js";
import { endReport } from "../public/games/ihtilal/report.js";

const app = readFileSync(new URL("../public/games/ihtilal/app.js", import.meta.url), "utf8");
test("IHTILAL terminal report translates engine event IDs", () => {
  const state = createMatch({ seed: 42 });
  state.log = [{ t: 2, k: "steal-lock", d: "sicil", a: 0 }];
  assert.match(endReport(state, "tr").turning, /kilit el değiştirdi/);
  assert.match(endReport(state, "en").turning, /lock changed hands/);
  assert.doesNotMatch(endReport(state, "tr").turning, /steal-lock/);
});
test("IHTILAL exposes all three existing slots without changing namespaces", () => {
  const data = new Map();
  const storage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) };
  for (const n of [1,2,3]) {
    assert.equal(saveSlot(storage, n, createMatch({ seed: n })).ok, true);
    assert.equal(loadSlot(storage, n).state.meta.seed, n);
    assert.equal(slotKey(n), `tariklab.ihtilal.v1.slot${n}`);
  }
  assert.equal(clearSlot(storage, 2).ok, true);
  assert.equal(loadSlot(storage, 2).error, "empty");
  assert.equal(loadSlot(storage, 1).state.meta.seed, 1);
  assert.equal(loadSlot(storage, 3).state.meta.seed, 3);
  assert.match(app, /saveCurrent\(activeSlot\)/);
  assert.doesNotMatch(app, /saveCurrent\(1\)/);
});
test("IHTILAL rejects invalid slots before touching storage", () => {
  const storage = new Proxy({}, { get() { throw new Error("storage must not be touched"); } });
  for (const slot of [NaN, Infinity, -Infinity, 0, 4, 1.5, "bad"]) {
    assert.equal(saveSlot(storage, slot, createMatch()).error, "slot");
    assert.equal(loadSlot(storage, slot).error, "slot");
    assert.equal(clearSlot(storage, slot).error, "slot");
  }
});
test("IHTILAL UI keeps language, selection, heat and destructive action explicit", () => {
  assert.match(app, /addEventListener\("storage"/);
  assert.match(app, /document\.documentElement\.lang = lang/);
  assert.match(app, /"aria-pressed": current === id/);
  assert.match(app, /"aria-valuenow": view.heat/);
  assert.match(app, /window\.confirm/);
  assert.match(app, /t\("deleteSave"\)/);
  for (const event of ["lock-tenure", "steal-lock", "unlock", "repeat-heat", "reshuffle", "artci-overflow"]) {
    assert.ok(app.includes(`row.k === "${event}"`), event);
  }
});
