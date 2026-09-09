import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { JOBS } from "../public/games/tc-sim/js/catalog.js";
import { EDUCATION_PATHS } from "../public/games/tc-sim/js/education.js";
import { NETWORK_CAST } from "../public/games/tc-sim/js/network.js";
import { MARKET } from "../public/games/tc-sim/js/wealth.js";
import { POLICIES, EVENTS, REGIONS, FOREIGN_AXES } from "../public/games/next-wave/devlet-data.js";
import { deskEnglish } from "../public/games/tc-sim/js/desk.js";

// Donmuş taban: içerik/simülasyon kaynakları yalnız bilinçli bir ürün kararıyla
// değişir. Taban en son Hayat→TC SIM değer aktarımında yenilendi (life-echo
// paketi + kardeş kadrosu); masa yeniden tasarımı bu dosyalara hâlâ dokunmuyor.
test("frozen baseline: all 35 content, simulation, persistence and projection sources are byte-identical", () => {
  const files = readdirSync("public/games/tc-sim/js")
    .filter(f => f.endsWith(".js") && !["app.js", "desk.js"].includes(f))
    .map(f => `public/games/tc-sim/js/${f}`)
    .concat(["public/games/next-wave.js", "public/games/next-wave/devlet-data.js", "public/games/next-wave/devlet-sim.js", "public/games/next-wave/shared/runtime.js", "public/games/tc-sim-devlet/presentation.js"]).sort();
  assert.equal(files.length, 35);
  const hash = createHash("sha256");
  for (const file of files) hash.update(file).update(readFileSync(file));
  assert.equal(hash.digest("hex"), "b06db96e79ef8a2754e9273c4b5185453c0db88fa26e2f0fa38d550fc1323112");
});
test("accepted content counts remain intact", () => {
  assert.equal(JOBS.length, 58);
  assert.equal(EDUCATION_PATHS.length, 18);
  assert.equal(NETWORK_CAST.length, 41); // 40 + kardeş
  assert.equal(Object.keys(MARKET).length, 53);
  assert.equal(POLICIES["2002"].length, 48);
  assert.equal(EVENTS["2002"].length, 62);
  assert.equal(REGIONS.length, 7);
  assert.equal(FOREIGN_AXES.length, 8);
});
test("desk boundary cannot dispatch actions, read hidden state or persist UI", () => {
  for (const file of ["public/games/shared/management-desk.js", "public/games/tc-sim/js/desk.js", "public/games/tc-sim-devlet/desk.js"]) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /localStorage|sessionStorage|\.actual\b|session\.act|\.setUI\(|JSON\.stringify|\.click\(/);
  }
  const app = readFileSync("public/games/tc-sim-devlet/app.js", "utf8");
  assert.doesNotMatch(app, /session\.setUI\(/);
  assert.match(app, /selectedScreen = button\.dataset\.screen; session\.render\(\)/);
});
test("desk display translations preserve financial numbers and source strings", () => {
  assert.equal(deskEnglish("Çalışma hayatı"), "Working life");
  assert.equal(deskEnglish("KİŞİ DOSYASI"), "Person file");
  assert.equal(deskEnglish("Otomatik kaydedildi. (9 KB)"), "Autosaved. (9 KB)");
  const original = "Enerji -5 · Stres +3 · ₺9.000";
  assert.equal(deskEnglish(original), "Energy -5 · Stress +3 · ₺9.000");
  assert.equal(original, "Enerji -5 · Stres +3 · ₺9.000");
});
