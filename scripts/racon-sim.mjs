#!/usr/bin/env node
/**
 * Racon sezon simülatörü.
 *   node scripts/racon-sim.mjs
 *   RACON_SIM=20 node scripts/racon-sim.mjs
 *   RACON_PROFIL=pervasiz node scripts/racon-sim.mjs
 *
 * Profiller: temkinli (zarfı verir, sessiz çalışır), dengeli (yarı yarıya),
 * pervasiz (zarf yok, diklenir, ateş eder) — varsayılan "karma", kariyerleri
 * üçe böler. Emniyet baskısı ancak pervasiz profille sınanıyor.
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
const profil = process.env.RACON_PROFIL || "karma";
const r = await page.evaluate((a) => window.__raconSim(a.n, a.p), { n, p: profil });
await browser.close();
const sira = (r.sira || []).map((v, i) => (i + 1) + ".:" + v).join("  ");
console.log("RACON SIM " + r.kariyer + " kariyer / " + r.sezon + " sezon / " + r.gun + " gün");
console.log("randevu kazan % " + r.kazanOran + "  (" + r.randevu.kazan + " / " + (r.randevu.kazan + r.randevu.kaybet + r.randevu.kacti) + ")");
console.log("sıra  " + sira);
console.log("kasa  ort " + r.kasa.ortalama + "  min " + r.kasa.min + "  max " + r.kasa.max);
console.log("baskın / sezon  " + r.baskinSezon + "  toplam " + r.baskinToplam +
  "  iddianame " + r.iddianame + "  dosya zirvesi " + r.dosyaZirve);
console.log("oyun sonu  " + r.oyunSonu + "   profil: " + r.profil);
(r.profiller || []).forEach((x) => {
  console.log("  " + x.ad.padEnd(9) + " kariyer " + String(x.kariyer).padStart(3) +
    " · baskın " + String(x.baskin).padStart(3) +
    " · iddianame " + String(x.iddianame).padStart(3) +
    " · oyun sonu " + String(x.oyunSonu).padStart(3) +
    " · dosya zirve " + String(x.dosyaZirve).padStart(3) +
    " · kazan% " + x.kazanOran +
    " · kasa " + x.kasa.toLocaleString("tr-TR"));
});
