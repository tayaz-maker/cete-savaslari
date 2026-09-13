import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import { fixture, place } from "./duel-fixture.mjs";
import { serialize } from "../public/games/duel-core/save.js";
const origin = process.env.DUEL_QA_ORIGIN || "http://127.0.0.1:8084";
const server = process.env.DUEL_QA_ORIGIN
  ? null
  : spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "8084"], {
      stdio: "ignore",
    });
for (let i = 0; i < 100; i++) {
  try {
    if ((await fetch(origin + "/games/veto-h/index.html")).ok) break;
  } catch {
    // The development server is still starting.
  }
  await new Promise((r) => setTimeout(r, 200));
}
const out = "/workspace/screenshots/web-duel";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
});
const errors = [],
  checks = [];
const verify = (ok, label) => {
  assert.ok(ok, label);
  checks.push(label);
};
const profiles = ["aggressive", "patient", "trapper", "gambler", "controlled"];
try {
  for (const theme of ["veto-h", "gett-oh"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.url().startsWith(origin) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${origin}/games/${theme}/index.html`);
    const ids =
      theme === "veto-h"
        ? ["halkci", "kurumsal", "agresif", "savunmaci", "kriz"]
        : ["kadikoy", "usküdar", "fatih", "besiktas", "beyoglu"];
    const key = theme === "veto-h" ? "campaignStyle" : "neighborhood";
    const savedSettings = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("tariklab.duel.settings.v1")));
    async function newSetup() {
      await page.getByRole("button", { name: "Yeni Düello", exact: true }).click();
      if (await page.getByRole("button", { name: "Onayla", exact: true }).count())
        await page.getByRole("button", { name: "Onayla", exact: true }).click();
      await page.locator(".setup-dialog").waitFor();
    }
    async function shot(name) {
      await page.screenshot({ path: `${out}/${theme}-${name}.png`, fullPage: true });
    }
    for (let i = 0; i < (process.env.DUEL_QA_LAYOUT_ONLY ? 0 : 5); i++) {
      await newSetup();
      const profile = page.locator(`[data-pick="${profiles[i]}"]`);
      await profile.focus();
      await profile.press(i % 2 ? "Enter" : "Space");
      await page.locator(`[data-pick="${ids[i]}"]`).click();
      verify(
        (await page.locator(`[data-pick="${profiles[i]}"]`).getAttribute("aria-pressed")) ===
          "true",
        `${theme} ${profiles[i]} selected semantically`,
      );
      verify(
        (await page.locator('.choice-chip[aria-pressed="true"]').count()) === 2,
        `${theme} exactly one choice per group`,
      );
      await page.getByRole("button", { name: "Vazgeç", exact: true }).click();
      await newSetup();
      verify(
        (await savedSettings()).aiProfile === profiles[i] &&
          (await savedSettings())[key] === ids[i],
        `${theme} choices survive close/reopen`,
      );
      if (i === 0) await shot("setup");
      await page.locator(".setup-dialog > .dialog-actions .primary").click();
      for (
        let n = 0;
        n < 20 && (await page.getByRole("button", { name: "Taş", exact: true }).count());
        n++
      )
        await page.getByRole("button", { name: "Taş", exact: true }).click();
      if (await page.getByRole("button", { name: "İlk Başla", exact: true }).count())
        await page.getByRole("button", { name: "İlk Başla", exact: true }).click();
      await page.getByRole("button", { name: "Düelloyu Başlat", exact: true }).click();
      await page.locator(".duel-table").waitFor();
      verify(
        (await page.locator(".match-identity").innerText()).length > 1,
        `${theme} identity visible in live match`,
      );
      await page.getByRole("button", { name: "Teslim Ol", exact: true }).click();
      await page.getByRole("button", { name: "Onayla", exact: true }).click();
      await page.locator(".post-match").waitFor();
      const match = await page.evaluate(
        (theme) =>
          JSON.parse(
            localStorage.getItem(
              theme === "veto-h"
                ? "tariklab.veto-h.campaign-history.v1"
                : `tariklab.${theme}.history.v1`,
            ),
          ).matches[0],
        theme,
      );
      verify(
        match.aiProfile === profiles[i] && match.identity === ids[i],
        `${theme} chosen profile and identity reach completed match`,
      );
      verify(
        !/\b(null|undefined)\b|\[object Object\]/.test(await page.locator("body").innerText()),
        `${theme} post-match clean text`,
      );
      await page
        .locator(".post-match")
        .getByRole("button", { name: "Ana Menü", exact: true })
        .click();
    }
    // Real engine-save fixture: populated board plus long-name hand cards.
    const state = fixture(theme),
      prefix = theme === "veto-h" ? "SND" : "RCN";
    for (let p = 0; p < 2; p++)
      for (let i = 0; i < 3; i++)
        place(state, `${prefix}-${String(151 + i).padStart(3, "0")}`, p, "units", i);
    for (let i = 0; i < 6; i++)
      place(state, `${prefix}-${String(160 + i).padStart(3, "0")}`, 0, "hand");
    await page.evaluate(
      ({ theme, raw }) => {
        localStorage.setItem(`tariklab.${theme}.duel`, raw);
        localStorage.setItem(
          "tariklab.duel.settings.v1",
          JSON.stringify({
            uiScale: 100,
            cardSize: "normal",
            tableDensity: "normal",
            motion: "reduced",
          }),
        );
      },
      { theme, raw: serialize(state) },
    );
    await page.reload();
    await page.getByRole("button", { name: "Devam Et", exact: true }).click();
    await page.locator(".duel-table").waitFor();
    await shot("desktop-gameplay");
    await page.locator(".hand-row .playing-card").first().click();
    await shot("inspector");
    for (const width of [1440, 1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      verify(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${theme} ${width} no horizontal page overflow`,
      );
      verify(
        !/\b(null|undefined)\b|\[object Object\]/.test(await page.locator("body").innerText()),
        `${theme} ${width} clean gameplay text: ${(await page.locator("body").innerText()).match(/.{0,45}(?:null|undefined|\[object Object\]).{0,45}/g)}`,
      );
      for (const selector of [".table-workspace", ".duel-table", ".hand-row", ".action-dock"]) {
        const r = await page.locator(selector).boundingBox();
        verify(
          r.x >= 0 && r.x + r.width <= width + 1,
          `${theme} ${width} ${selector} fits without hidden overflow`,
        );
      }
      const hand = await page.locator(".hand-row").boundingBox(),
        dock = await page.locator(".action-dock").boundingBox();
      verify(hand.y + hand.height <= dock.y + 1, `${theme} ${width} dock never covers hand`);
      if (width === 390) {
        await shot("mobile-gameplay");
        await page.getByRole("button", { name: "Kart Ayrıntısı", exact: true }).click();
        await shot("mobile-inspector");
        await page.getByRole("button", { name: "Kapat", exact: true }).click();
      }
    }
    await page.getByRole("button", { name: "Ana Menü", exact: true }).first().click();
    for (const width of [1440, 1280, 1024, 768, 390])
      for (const scale of [80, 90, 100, 110, 125]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.getByRole("button", { name: "Ayarlar", exact: true }).click();
        await page.locator(`[data-pick="scale-${scale}"]`).click();
        for (const size of ["small", "normal", "large"])
          await page.locator(`[data-pick="size-${size}"]`).click();
        for (const density of ["compact", "normal"])
          await page.locator(`[data-pick="density-${density}"]`).click();
        verify(
          (await savedSettings()).uiScale === scale,
          `${theme} ${width} scale ${scale} persists`,
        );
        const box = await page.locator("dialog").boundingBox();
        verify(
          box.x >= 0 &&
            box.y >= 0 &&
            box.x + box.width <= width + 1 &&
            box.y + box.height <= (width === 390 ? 844 : 900) + 1,
          `${theme} ${width} ${scale} modal fits`,
        );
        await page.getByRole("button", { name: "Kapat", exact: true }).click();
        await page.getByRole("button", { name: "Devam Et", exact: true }).click();
        verify(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${theme} ${width} ${scale} scaled board fits horizontally`,
        );
        await page.getByRole("button", { name: "Ana Menü", exact: true }).first().click();
      }
    await page.reload();
    verify((await savedSettings()).uiScale === 125, `${theme} settings survive reload`);
    await page.getByRole("button", { name: /Kart Arşivi/ }).click();
    verify(
      !/\b(null|undefined)\b|\[object Object\]/.test(await page.locator("body").innerText()),
      `${theme} archive numeric fallback`,
    );
    await context.close();
  }
  verify(errors.length === 0, JSON.stringify(errors));
  writeFileSync(
    `${out}/qa.json`,
    JSON.stringify({ checks: checks.length, errors, passed: checks }, null, 2),
  );
  console.log(`DESIGN_QA_PASS ${checks.length} checks; no browser errors`);
} finally {
  await browser.close();
  server?.kill();
}
