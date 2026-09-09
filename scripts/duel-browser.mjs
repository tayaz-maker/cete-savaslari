import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
const origin = "http://127.0.0.1:8082";
const out = `${process.env.RUNNER_TEMP || "/workspace"}/screenshots/duel`;
mkdirSync(out, { recursive: true });
const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "8082"], {
  stdio: "inherit",
});
let browser;
const errors = [],
  metrics = [];
try {
  let ready = false;
  for (let i = 0; i < 150; i++) {
    try {
      ready = (await fetch(origin)).ok;
    } catch {
      /* Server is starting. */
    }
    if (ready) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  assert.ok(ready);
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox"],
  });
  for (const theme of ["veto-h", "gett-oh"])
    for (const lang of ["tr", "en"]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
      await context.addInitScript(
        (language) => localStorage.setItem("tariklab.language", language),
        lang,
      );
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(`${theme}/${lang}: ${e.message}`));
      page.on("response", (r) => {
        if (r.url().startsWith(origin) && r.status() >= 400)
          errors.push(`${r.status()}: ${r.url()}`);
      });
      const key = `tariklab.${theme}.duel`;
      const labels =
        lang === "tr"
          ? {
              archive: /Kart Arşivi/,
              new: "Yeni Düello",
              close: "Kapat",
              menu: "Ana Menü",
              start: "Düelloyu Başlat",
              rock: "Taş",
              first: "İlk Başla",
              next: "Sonraki Evre",
              confirm: "Onayla",
              continue: "Devam Et",
              help: "Nasıl Oynanır",
            }
          : {
              archive: /Card Archive/,
              new: "New Duel",
              close: "Close",
              menu: "Main Menu",
              start: "Start Duel",
              rock: "Rock",
              first: "Go First",
              next: "Next Phase",
              confirm: "Confirm",
              continue: "Continue",
              help: "How to Play",
            };
      async function measure(stage) {
        for (const [width, height] of [
          [320, 568],
          [360, 800],
          [390, 844],
          [430, 932],
          [740, 390],
          [768, 1024],
          [1440, 1000],
        ]) {
          await page.setViewportSize({ width, height });
          const d = await page.evaluate(() => ({
            width: document.documentElement.clientWidth,
            scroll: document.documentElement.scrollWidth,
            text: document.body.innerText.length,
          }));
          assert.ok(d.text > 50);
          assert.ok(
            d.scroll <= d.width + 1,
            `${theme}/${lang}/${stage}/${width}: ${JSON.stringify(d)}`,
          );
          if (stage === "board") {
            const dock = await page.locator(".action-dock").boundingBox();
            assert.ok(
              dock && dock.y >= 0 && dock.y + dock.height <= height + 1,
              `${theme}/${width}: action dock outside viewport ${JSON.stringify(dock)}`,
            );
          }
          metrics.push({ theme, lang, stage, width, overflow: d.scroll - d.width });
        }
      }
      await page.goto(`${origin}/games/${theme}/index.html`, { waitUntil: "networkidle" });
      try {
        await page
          .getByRole("button", { name: labels.new, exact: true })
          .waitFor({ timeout: 10000 });
      } catch (error) {
        console.log("DUEL_ENTRY_FAILURE", await page.locator("body").innerText(), errors);
        throw error;
      }
      assert.equal(await page.evaluate((k) => localStorage.getItem(k), key), null);
      await measure("menu");
      await page.getByRole("button", { name: labels.archive }).click();
      await measure("archive");
      assert.equal(await page.locator(".archive-grid .playing-card").count(), 24);
      await page.locator(".archive-grid .playing-card").first().click();
      await measure("archive-inspector");
      await page.getByRole("button", { name: labels.close, exact: true }).click();
      assert.equal(await page.evaluate((k) => localStorage.getItem(k), key), null);
      await page.getByRole("button", { name: labels.menu, exact: true }).click();
      await page.getByRole("button", { name: labels.new, exact: true }).click();
      for (let tries = 0; tries < 20; tries++) {
        if (await page.getByRole("button", { name: labels.rock, exact: true }).isVisible())
          await page.getByRole("button", { name: labels.rock, exact: true }).click();
        if (await page.getByRole("button", { name: labels.first, exact: true }).isVisible())
          await page.getByRole("button", { name: labels.first, exact: true }).click();
        if (await page.getByRole("button", { name: labels.start, exact: true }).isVisible()) break;
      }
      assert.equal(await page.evaluate((k) => localStorage.getItem(k), key), null);
      await page.getByRole("button", { name: labels.start, exact: true }).click();
      await page.locator(".duel-table").waitFor();
      await page.waitForFunction((k) => {
        const e = JSON.parse(localStorage.getItem(k));
        if (!e) return false;
        const s = JSON.parse(e.payload);
        return (s.choice?.player ?? s.pending?.responding ?? s.active) === 0;
      }, key);
      // Reach Main 1 through visible controls, completing any effect choices.
      await page.setViewportSize({ width: 1440, height: 1000 });
      for (let step = 0; step < 30; step++) {
        const live = await page.evaluate(
          (k) => JSON.parse(JSON.parse(localStorage.getItem(k)).payload),
          key,
        );
        if (live.result) break;
        const who = live.choice?.player ?? live.pending?.responding ?? live.active;
        if (who === 1) {
          await page.waitForFunction((k) => {
            const s = JSON.parse(JSON.parse(localStorage.getItem(k)).payload);
            return s.result || (s.choice?.player ?? s.pending?.responding ?? s.active) === 0;
          }, key);
          continue;
        }
        if (live.choice) {
          await page
            .locator(".action-dock")
            .getByRole("button", { name: lang === "tr" ? "Seç" : "Choose", exact: true })
            .click();
          if (await page.locator("dialog .choice-list button").count())
            await page.locator("dialog .choice-list button").first().click();
          await page
            .locator("dialog")
            .getByRole("button", { name: labels.confirm, exact: true })
            .click();
          continue;
        }
        if (live.pending) {
          await page
            .locator(".action-dock")
            .getByRole("button", {
              name: lang === "tr" ? "Tepki Verme" : "Pass Response",
              exact: true,
            })
            .click();
          continue;
        }
        if (live.phase === "main1") break;
        await page
          .locator(".action-dock")
          .getByRole("button", { name: labels.next, exact: true })
          .click();
        await page
          .locator("dialog")
          .getByRole("button", { name: labels.confirm, exact: true })
          .click();
      }
      const hand = page.locator('.hand-row [data-kind="unit"]');
      for (let i = 0; i < (await hand.count()); i++) {
        await hand.nth(i).click();
        const summon = page.locator(".inspector-actions").getByRole("button", {
          name: lang === "tr" ? "Normal Çağır" : "Normal Summon",
          exact: true,
        });
        if (await summon.count()) {
          await summon.click();
          if (await page.locator("dialog .choice-list button").count())
            await page.locator("dialog .choice-list button").first().click();
          await page
            .locator("dialog")
            .getByRole("button", { name: labels.confirm, exact: true })
            .click();
          break;
        }
      }
      await measure("board");
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.locator(".hand-row .playing-card").first().click();
      await page.locator(".inspector .effect-text").waitFor();
      const shot = await page.screenshot({
        path: `${out}/${theme}-${lang}-desktop.jpg`,
        type: "jpeg",
        quality: 65,
        fullPage: true,
      });
      if (lang === "tr") console.log(`DUEL_SCREENSHOT ${theme} ${shot.toString("base64")}`);
      const before = await page.evaluate((k) => localStorage.getItem(k), key);
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.evaluate((k) => localStorage.getItem(k), key), before);
      await page.getByRole("button", { name: labels.continue, exact: true }).click();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator(".hand-row .playing-card").first().click();
      assert.ok(await page.locator("dialog").isVisible());
      const mobileShot = await page.screenshot({
        path: `${out}/${theme}-${lang}-mobile.jpg`,
        type: "jpeg",
        quality: 65,
        fullPage: true,
      });
      if (lang === "tr")
        console.log(`DUEL_SCREENSHOT ${theme}-mobile ${mobileShot.toString("base64")}`);
      await page.getByRole("button", { name: labels.close, exact: true }).click();
      await page.getByRole("button", { name: labels.help, exact: true }).click();
      assert.ok(await page.locator("dialog p").innerText());
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog").isVisible(), false);
      await context.close();
    }
  assert.deepEqual(errors, []);
  writeFileSync(`${out}/results.json`, JSON.stringify(metrics, null, 2));
  console.log(`DUEL_BROWSER_PASS ${metrics.length} viewport checks`);
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
