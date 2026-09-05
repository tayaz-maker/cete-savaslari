import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Source/layout contracts only: these do not claim device emulation.
const css = readFileSync(new URL("../public/games/tc-sim/styles.css", import.meta.url), "utf8");
test("responsive contracts protect tablet grids, short dialogs and mobile save/navigation separation", () => {
  const tablet = css.slice(css.indexOf("@media (max-width: 1060px)"), css.indexOf("@media (max-width: 820px)"));
  assert.match(tablet, /\.overview-grid\s*\{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(tablet, /\.social-layout\s*\{\s*grid-template-columns: minmax\(0, 1fr\)/);
  const mobile = css.slice(css.indexOf("@media (max-width: 540px)"));
  assert.match(mobile, /\.save-status\s*\{\s*position: static;/);
  assert.match(mobile, /\[data-successor\].*width: 100%/);
  assert.match(mobile, /\.event-card.*max-height: calc\(100dvh - 24px\)/);
  assert.match(css, /\.event-card\s*\{[^}]*overflow-y: auto;/);
  assert.match(css, /\.body-row\s*\{[^}]*minmax\(0, 1fr\) max-content/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.doesNotMatch(css, /min-width: 320px/);
});

test("real service-worker fetch handler updates cached TC SIM CSS then retains exact offline fallback", async () => {
  const handlers = {};
  const entries = new Map();
  const cache = { put: async (r, v) => entries.set(r.url, v), match: async r => entries.get(r.url) };
  let online = true;
  const context = vm.createContext({ URL, Response, caches: { open: async () => cache },
    self: { location: { origin: "https://example.test" }, addEventListener: (name, fn) => { handlers[name] = fn; } },
    fetch: async () => { if (!online) throw new Error("offline"); return new Response("new responsive CSS"); } });
  vm.runInContext(readFileSync(new URL("../public/sw.js", import.meta.url), "utf8"), context);
  const request = { method: "GET", mode: "cors", url: "https://example.test/games/tc-sim/styles.css?v=7" };
  entries.set(request.url, new Response("old CSS"));
  let response;
  handlers.fetch({ request, respondWith: result => { response = result; } });
  assert.equal(await (await response).text(), "new responsive CSS");
  online = false;
  handlers.fetch({ request, respondWith: result => { response = result; } });
  assert.equal(await (await response).text(), "new responsive CSS");
});
