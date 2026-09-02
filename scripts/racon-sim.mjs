#!/usr/bin/env node
/**
 * Racon sezon simülatörü.
 *   node scripts/racon-sim.mjs
 *   RACON_SIM=20 node scripts/racon-sim.mjs
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

const file = process.env.RACON_FILE || "public/games/racon/index.html";
const url = "file://" + path.resolve(file);
const n = Math.max(1, parseInt(process.env.RACON_SIM || "100", 10) || 100);
const exe = process.env.RACON_CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
const page = await browser.newPage();
await page.goto(url);
const r = await page.evaluate((k) => window.__raconSim(k), n);
await browser.close();
const sira = (r.sira || []).map((v, i) => (i + 1) + ".:" + v).join("  ");
console.log("RACON SIM " + r.kariyer + " kariyer / " + r.sezon + " sezon / " + r.gun + " gün");
console.log("randevu kazan % " + r.kazanOran + "  (" + r.randevu.kazan + " / " + (r.randevu.kazan + r.randevu.kaybet + r.randevu.kacti) + ")");
console.log("sıra  " + sira);
console.log("kasa  ort " + r.kasa.ortalama + "  min " + r.kasa.min + "  max " + r.kasa.max);
console.log("baskın / sezon  " + r.baskinSezon + "  toplam " + r.baskinToplam);
console.log("oyun sonu  " + r.oyunSonu);
