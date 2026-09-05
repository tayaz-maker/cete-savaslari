import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const game = join(root, "public/games/tc-sim");
const token = "?v=7";

test("production TC SIM loads one coherent, current module graph", () => {
  const html = readFileSync(join(game, "index.html"), "utf8");
  assert.ok(html.includes("styles.css?v=7"));
  assert.ok(html.includes("js/app.js?v=7"));

  for (const name of readdirSync(join(game, "js")).filter((file) => file.endsWith(".js"))) {
    const source = readFileSync(join(game, "js", name), "utf8");
    const imports = [...source.matchAll(/["'](\.\/[^"']+\.js)(\?v=\d+)?["']/g)];
    for (const match of imports)
      assert.equal(match[2], token, `${name}: ${match[1]} must use the production asset token`);
    assert.equal(source.includes(".js?v=5"), false, `${name}: stale production token`);
  }
});

test("service worker never serves a stale TC SIM module before the network", () => {
  const source = readFileSync(join(root, "public/sw.js"), "utf8");
  assert.ok(source.includes('const CACHE = "cete-offline-v2"'));
  assert.ok(source.includes('url.pathname.startsWith("/games/tc-sim/")'));
  const tcBranch = source.indexOf("if (isTcSimAsset(url))");
  const staleBranch = source.indexOf("if (isAsset(url))");
  assert.ok(tcBranch > 0 && tcBranch < staleBranch);
  assert.ok(source.slice(tcBranch, staleBranch).includes("networkFirst(req)"));
});

test("mobile TC SIM navigation remains horizontally usable and tappable", () => {
  const source = readFileSync(join(game, "styles.css"), "utf8");
  const mobile = source.slice(source.indexOf("@media (max-width: 820px)"));
  assert.ok(mobile.includes(".side-nav"));
  assert.ok(mobile.includes("display: flex"));
  assert.ok(mobile.includes("overflow: auto"));
  assert.ok(mobile.includes("min-height: 44px"));
});
