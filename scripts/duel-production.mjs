import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { duelScenarios } from "./duel-browser-scenarios.mjs";

const origin = "https://www.tariklab.com";
const hash = (data) => createHash("sha256").update(data).digest("hex");
const paths = [
  "games/duel-core/app.js",
  "games/duel-core/presentation.js",
  "games/duel-core/table.css",
  ...["veto-h", "gett-oh"].flatMap((theme) => [
    `games/${theme}/source-cards.json`,
    `games/${theme}/expansion.js`,
    `games/${theme}/assets/art-manifest.json`,
    `games/${theme}/assets/atmosphere.webp`,
  ]),
];
const expected = new Map(paths.map((path) => [path, hash(readFileSync(`public/${path}`))]));
let mismatch = paths;
// Deployment runs independently of Actions; wait for this exact revision's bytes.
for (let attempt = 0; attempt < 60; attempt++) {
  mismatch = [];
  for (const path of paths) {
    try {
      const response = await fetch(`${origin}/${path}`, {
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== expected.get(path))
        mismatch.push(path);
    } catch {
      mismatch.push(path);
    }
  }
  if (!mismatch.length) break;
  await new Promise((resolve) => setTimeout(resolve, 3000));
}
assert.deepEqual(mismatch, [], "Production must serve accepted game/art manifests before smoke");
const out = `${process.env.RUNNER_TEMP || "/workspace"}/screenshots/duel-production`;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox"],
});
const evidence = [];
try {
  for (const theme of ["veto-h", "gett-oh"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const key = `tariklab.${theme}.duel`;
    const raw = readFileSync(`scripts/fixtures/duel/${theme}-old-save.json`, "utf8");
    await context.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
        localStorage.setItem("tariklab.language", "tr");
      },
      { key, raw },
    );
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${origin}/oyna/${theme}`, { waitUntil: "networkidle" });
    const game = page.frameLocator("iframe");
    await game.getByRole("button", { name: "Kart Arşivi · 300", exact: true }).click();
    assert.equal(await game.locator(".archive-head span").innerText(), "300 / 300");
    await game.locator(".filters input").fill(theme === "veto-h" ? "SND-300" : "RCN-300");
    await game
      .locator(".archive-grid img")
      .first()
      .evaluate(async (image) => {
        await image.decode();
      });
    assert.equal(
      await game
        .locator(".archive-grid img")
        .first()
        .evaluate((image) => image.naturalWidth),
      400,
    );
    await game.getByRole("button", { name: "Ana Menü", exact: true }).click();
    await game.getByRole("button", { name: "Devam Et", exact: true }).click();
    await game.locator(".duel-table").waitFor();
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), key), raw);
    assert.equal(
      await game.getByRole("button", { name: /^(Sonraki Evre|Next Phase)$/i }).count(),
      0,
    );
    await page.screenshot({ path: `${out}/${theme}-legacy-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: `${out}/${theme}-legacy-mobile.png`, fullPage: true });
    assert.deepEqual(errors, []);
    evidence.push({ theme, archive: 300, expansionArt: true, legacySaveUnchanged: true, errors });
    await context.close();
  }
  await duelScenarios(browser, origin);
  writeFileSync(
    `${out}/results.json`,
    JSON.stringify(
      { sha: process.env.GITHUB_SHA, assets: Object.fromEntries(expected), evidence },
      null,
      2,
    ),
  );
  console.log("DUEL_PRODUCTION_PASS", JSON.stringify(evidence));
} finally {
  await browser.close();
}
