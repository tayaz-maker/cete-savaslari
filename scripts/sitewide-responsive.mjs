// Real Chromium layout/interaction regression against the Vite runtime.
// Production compilation remains a separate CI gate; deployed assets are smoked separately.
// Run in CI where the browser binary is installed; no emulated DOM or skipped tests.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const origin = "http://127.0.0.1:8081";
const out = `${process.env.RUNNER_TEMP || "/workspace"}/screenshots/tariklab-ux`;
mkdirSync(out, { recursive: true });
const catalog = readFileSync("src/lib/games.ts", "utf8").split("export const GAMES:")[1];
const routes = [...catalog.matchAll(/slug: "([^"]+)"[\s\S]*?status: "live",\s*href: "([^"]+)"/g)]
  .map((match) => ({ id: match[1], href: match[2] }));
assert.equal(routes.length, 14);
const viewports = [[320,568],[360,800],[390,844],[430,932],[640,360],[740,390],[844,390],[768,1024],[820,1180],[1024,768],[1280,800],[1440,900]];
const nextWave = new Set(["apartman", "hayat", "tc-sim-devlet", "son-100-gun", "kayip-telefon"]);
const errors = [], results = [];
const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "8081"], { stdio: "inherit" });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 150; i++) {
    try { ready = (await fetch(origin)).ok; } catch { /* server is starting */ }
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(ready, "Vite runtime did not start");
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, args: ["--no-sandbox"] });
  for (const lang of ["tr", "en"]) {
    for (const route of [{ id: "portal", href: "/" }, ...routes, { id: "credits", href: "/credits.html" }, { id: "ihtilal", href: "/ihtilal" }]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      await context.addInitScript((language) => localStorage.setItem("tariklab.language", language), lang);
      const page = await context.newPage();
      page.on("pageerror", (error) => errors.push(`${route.id}/${lang}: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error" && message.location().url.startsWith(origin)) errors.push(`${route.id}/${lang}: ${message.text()}`);
      });
      page.on("response", (response) => {
        if (response.url().startsWith(origin) && response.status() >= 400) errors.push(`${route.id}: HTTP ${response.status()} ${response.url()}`);
      });
      let surface = page;
      async function measure(stage, sizes = viewports) {
        for (const [width, height] of sizes) {
          await page.setViewportSize({ width, height });
          const dimensions = await surface.evaluate(() => ({
            width: document.documentElement.clientWidth,
            scroll: document.documentElement.scrollWidth,
            text: document.body.innerText.trim().length,
            duplicates: [...document.querySelectorAll("[id]")].map((node) => node.id).filter((id, index, all) => all.indexOf(id) !== index),
          }));
          results.push({ game: route.id, lang, stage, width, height, overflow: dimensions.scroll - dimensions.width });
          assert.ok(dimensions.text > 20, `${route.id}/${stage}: empty surface`);
          assert.ok(dimensions.scroll <= dimensions.width + 1, `${route.id}/${lang}/${stage}/${width}x${height}: overflow ${JSON.stringify(dimensions)}`);
          assert.deepEqual(dimensions.duplicates, [], `${route.id}/${stage}: duplicate IDs`);
        }
      }
      try {
        const response = await page.goto(`${origin}${route.href}`, { waitUntil: "networkidle" });
        assert.equal(response.status(), 200, route.href);
        if (route.href.startsWith("/oyna/")) {
          const iframe = page.locator("iframe");
          await iframe.waitFor();
          surface = await (await iframe.elementHandle()).contentFrame();
          await surface.waitForFunction(() => document.body.innerText.trim().length > 20);
        }
        await measure("entry");
        if (route.id === "portal") {
          assert.equal(await page.locator('a[href^="/oyna/"], a[href="/cete-savaslari"], a[href="/games/bukucu/"]').count(), 14);
        }
        if (nextWave.has(route.id)) {
          assert.equal(await surface.locator(".slot-card").count(), 3);
          await surface.locator("#menu-new").click();
          await measure("setup");
          if (route.id === "tc-sim-devlet") {
            await surface.locator('[data-setup-field="era"][data-setup-value="2002"]').click();
            await surface.locator('[data-setup-field="doctrine"][data-setup-value="none"]').click();
          }
          if (route.id === "hayat") await surface.locator("#player-name").fill("Uzun İsimli Deneme Karakteri QA");
          if (route.id === "son-100-gun") await surface.locator("[data-scenario]").first().click();
          await surface.locator("#confirm-start").click();
          await measure("game");
          await page.setViewportSize({ width: 390, height: 844 });
          const save = surface.locator(".save-menu > summary");
          assert.ok(await save.isVisible(), `${route.id}: embedded save control hidden`);
          await save.click();
          await measure("save", [[320,568],[390,844],[640,360],[1440,900]]);
          const popup = surface.locator(".save-popover");
          const box = await popup.boundingBox();
          assert.ok(box.width > 0 && box.height > 0);
          await save.click();
        } else if (route.id === "tc-sim") {
          await surface.locator('input[name="name"]').fill("Uzun İsimli Deneme Karakteri QA");
          await surface.locator('#new-game-form button[type="submit"]').click();
          await measure("game");
        }
        if (["tc-sim", "tc-sim-devlet", "hayat"].includes(route.id)) {
          await page.setViewportSize({ width: 390, height: 844 });
          const nav = surface.locator(".compact-nav");
          const more = nav.locator(".nav-more");
          await more.click();
          assert.equal(await more.getAttribute("aria-expanded"), "true");
          await more.press("Escape");
          assert.equal(await more.getAttribute("aria-expanded"), "false");
          const attribute = route.id === "tc-sim" ? "data-view" : "data-screen";
          const destinations = await nav.locator(`[${attribute}]`).evaluateAll((nodes, attr) => nodes.map((node) => node.getAttribute(attr)), attribute);
          for (const destination of destinations) {
            await page.setViewportSize({ width: 390, height: 844 });
            const target = nav.locator(`[${attribute}="${destination}"]`);
            if (!(await target.isVisible())) await more.click();
            await target.click();
            assert.equal(await nav.locator(`[${attribute}="${destination}"]`).getAttribute("aria-current"), "page");
            await measure(destination, [[320,568],[360,800],[390,844],[430,932],[640,360],[768,1024],[1440,900]]);
          }
        }
        if (["portal", "hayat", "tc-sim-devlet", "tc-sim"].includes(route.id)) {
          await page.screenshot({ path: `${out}/${route.id}-${lang}.png`, fullPage: true });
          await page.setViewportSize({ width: 390, height: 844 });
          await page.screenshot({ path: `${out}/${route.id}-${lang}-mobile.png`, fullPage: true });
        }
      } catch (error) {
        errors.push(`${route.id}/${lang}: ${error.message}`);
        await page.screenshot({ path: `${out}/${route.id}-${lang}-failure.png`, fullPage: true });
        console.error(errors.at(-1));
      } finally { await context.close(); }
    }
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  writeFileSync(`${out}/results.json`, JSON.stringify({ results, errors }, null, 2));
}
console.log(JSON.stringify({ checks: results.length, errors }, null, 2));
assert.equal(errors.length, 0, "responsive/interaction regression failed");
