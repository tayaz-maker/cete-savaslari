import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMatch } from "../public/games/ihtilal/engine.js";
import { saveSlot, loadSlot, clearSlot, slotKey } from "../public/games/ihtilal/save.js";
import { endReport } from "../public/games/ihtilal/report.js";
import vm from "node:vm";
import { memoryLabel, allianceLabel, systemLabel } from "../public/games/apartman/presentation.js";

const app = readFileSync(new URL("../public/games/ihtilal/app.js", import.meta.url), "utf8");
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Apartman resolves display IDs without changing legacy memory records", () => {
  const memory = Object.freeze({ type: "asansor-cikti", sentiment: 2 });
  const tr = (a) => a;
  const en = (_, b) => b;
  assert.equal(memoryLabel(memory, tr, tr), "Yetkili servis, bugün");
  assert.equal(memory.type, "asansor-cikti");
  assert.equal(memoryLabel({ type: "foreign" }, tr, en), "An earlier management decision");
  assert.equal(allianceLabel("kiraci", en), "Tenants");
  assert.equal(systemLabel("asansor", [{ id: "asansor", name: "Asansör" }], tr, tr), "Asansör");
  assert.equal(systemLabel("unknown", [], tr, en), "common area");
});

test("classic dynamic accessibility labels translate precisely with TR fallback", () => {
  const context = { localStorage: { getItem: () => "en", setItem() {} }, addEventListener() {} };
  vm.runInNewContext(read("public/i18n/tlab-i18n.js"), context);
  vm.runInNewContext(read("public/i18n/deep-en-final.js"), context);
  const I = context.tlabI18n;
  for (const [tr, en] of [
    ["e2, Beyaz Piyon", "e2, White Pawn"], ["e4, boş", "e4, empty"],
    ["Siyah Şah seçildi.", "Black King selected."],
    ["2. sıra 4. sütundaki taş, seçili", "Peg at row 2, column 4, selected"],
    ["4. sıra 4. sütuna atla", "Jump to row 4, column 4"],
    ["rakip 10-1", "Enemy 10-1"], ["Slot 2 devam", "Continue slot 2"],
    ["Oyuna başla", "Start game"],
  ]) {
    I.setLang("en"); assert.equal(I.phrase(tr), en);
    I.setLang("tr"); assert.equal(I.phrase(tr), tr);
  }
  I.setLang("en");
  assert.equal(I.phrase("arbitrary saved narrative"), "arbitrary saved narrative");
  assert.equal(I.phrase("rakip 99-1"), "rakip 99-1");
});

test("vanilla boot handles the FIRST language change and dynamic rendering", () => {
  let change, mutate, reloads = 0, translations = 0, observing = 0, disconnected = 0;
  const document = { readyState: "complete", body: {}, querySelector: () => ({}) };
  const I = { applyHtmlLang() {}, mountLangToggle() {}, getLang: () => "en",
    applyPhrases() { translations++; }, onLang(fn) { change = fn; } };
  class Observer {
    constructor(fn) { mutate = fn; }
    observe() { observing++; }
    disconnect() { disconnected++; }
  }
  vm.runInNewContext(read("public/i18n/boot.js"), {
    window: { tlabI18n: I }, document, MutationObserver: Observer,
    location: { reload() { reloads++; } },
  });
  assert.equal(translations, 1);
  change(); assert.equal(reloads, 1);
  mutate(); assert.equal(translations, 2);
  assert.equal(disconnected, 1);
  assert.equal(observing, 2);
});
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
