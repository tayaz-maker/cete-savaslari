#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.env.QA_URL || "http://127.0.0.1:8080/";
mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

function readSave() {
  return page.evaluate(() => {
    const raw = localStorage.getItem("cete-savaslari-save-v1");
    if (!raw) return null;
    const p = JSON.parse(raw).state.player;
    return {
      cash: p.cash,
      health: p.health,
      turf: p.turf,
      gf: p.girlfriend,
      buzz: p.buzz,
      isi: p.isi,
      jobsDone: p.jobsDone ?? 0,
      properties: p.properties ?? [],
    };
  });
}

const t0 = Date.now();
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "domcontentloaded" });
await page.getByPlaceholder("Örn. Halil").waitFor({ timeout: 8000 });
const createMs = Date.now() - t0;

await page.getByPlaceholder("Örn. Halil").fill("Halil");
await page.getByRole("button", { name: /Kadıköy/ }).click();
await page.getByRole("button", { name: "Sokağa in" }).click();
await page.getByText("Emniyet").first().waitFor({ timeout: 8000 });
const afterCreateMs = Date.now() - t0;

const hud = await page.locator("header").innerText();
if (/\bIsı\b/.test(hud)) throw new Error("HUD still shows Isı");
if (!hud.includes("Emniyet")) throw new Error("Emniyet missing");

const spawn = await readSave();
if (!spawn) throw new Error("no save after create");
if (spawn.cash !== 0) throw new Error(`spawn cash ${spawn.cash}, expected 0`);
if (Object.values(spawn.turf ?? {}).some((v) => v > 0)) {
  throw new Error(`spawn turf not empty ${JSON.stringify(spawn.turf)}`);
}

for (let i = 0; i < 4; i++) {
  await page.getByRole("button", { name: "1 saat geçir" }).click();
  await page.waitForTimeout(180);
}
const idle = await readSave();
if ((idle?.cash ?? -1) !== 0) {
  throw new Error(`idle sitting printed cash ${idle?.cash}`);
}

await page.getByRole("button", { name: "İcraata çık" }).first().waitFor({
  timeout: 5000,
});
for (let i = 0; i < 6; i++) {
  await page.getByRole("button", { name: "İcraata çık" }).first().click();
  await page.waitForTimeout(250);
  const s = await readSave();
  if ((s?.cash ?? 0) > 0) break;
}

const afterJob = await readSave();
if ((afterJob?.jobsDone ?? 0) < 1) throw new Error("job did not run");

await page.getByRole("button", { name: "1 saat geçir" }).click();
await page.waitForTimeout(200);

await page.getByRole("button", { name: "Sokak" }).click();
await page.getByText(/Toplam haraç/).waitFor({ timeout: 5000 });
await page.getByRole("button", { name: /Köşeyi bas/ }).first().click();
await page.waitForTimeout(700);

const headerCash = await page.locator("header p.text-xl").first().innerText();
if (headerCash.includes("1.200")) {
  console.error("HUD cash frozen at start", headerCash);
  process.exit(1);
}

const logText = await page.locator("body").innerText();
if (!/basıldı|Haraç/.test(logText)) throw new Error("turf log missing");

await page.getByRole("button", { name: "Emlak" }).click();
await page.getByText("Mahalle Berberi").waitFor({ timeout: 5000 });
const emlakText = await page.locator("body").innerText();
if (!/amorti/i.test(emlakText)) throw new Error("estate amorti missing");
if (!emlakText.includes("15.000")) throw new Error("berber price not 15.000");

await page.getByRole("button", { name: "1 saat geçir" }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Hayat" }).click();
await page.getByText("Bira çek").waitFor({ timeout: 5000 });
const beerBtn = page.getByRole("button", { name: "Yap" }).first();
if (await beerBtn.isEnabled()) {
  await beerBtn.click();
  await page.waitForTimeout(400);
}

await page.getByRole("button", { name: "1 saat geçir" }).click();
await page.waitForTimeout(150);
for (let i = 0; i < 3; i++) {
  await page.getByRole("button", { name: "Laf at" }).first().click();
  await page.waitForTimeout(120);
}
await page.getByRole("button", { name: "İlişki başlat" }).first().click();
await page.waitForTimeout(250);
await page.getByRole("button", { name: "Gece geçir" }).first().click();
await page.waitForTimeout(250);

await page.screenshot({
  path: "/workspace/screenshots/emniyet-hayat.png",
  fullPage: true,
});

const saved = await readSave();

const report = {
  createMs,
  afterCreateMs,
  errors,
  spawn,
  idle,
  afterJob,
  saved,
  hasIsiInHud: /\bIsı\b/.test(hud),
};

console.log(JSON.stringify(report, null, 2));
if (!saved?.gf) {
  console.error("girlfriend not set");
  process.exit(1);
}
if (errors.length) {
  console.error("console errors", errors);
  process.exit(1);
}
await browser.close();
