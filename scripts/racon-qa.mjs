#!/usr/bin/env node
/**
 * Racon Manager otomatik QA.
 *
 *   node scripts/racon-qa.mjs
 *   RACON_FILE=public/games/racon/index.html node scripts/racon-qa.mjs
 *
 * Üç şey yapar:
 *  1) OYUN İÇİ TEST — window.__raconTest() çıktısını okur.
 *  2) DÜZEN — 1280x800 / 844x390 yatay ve 360x640 dikeyde ölçü doğrular.
 *  3) GEZİNTİ — bütün ekranları dolaşır, konsol hatası toplar.
 *
 * Çıkış kodu: 0 = temiz, 1 = en az bir sorun.
 */
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import process from "node:process";

const file = process.env.RACON_FILE || "public/games/racon/index.html";
const url = "file://" + path.resolve(file);
const sorunlar = [];
const not = (m) => sorunlar.push(m);

const exe = process.env.RACON_CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const konsol = [];
page.on("console", (m) => m.type() === "error" && konsol.push(m.text()));
page.on("pageerror", (e) => konsol.push("pageerror: " + e.message));

await page.goto(url);
await page.waitForTimeout(300);

// 1) oyun içi test
const testVar = await page.evaluate(() => typeof window.__raconTest === "function");
if (!testVar) not("window.__raconTest yok");
else {
  const r = await page.evaluate(() => window.__raconTest());
  if (!Array.isArray(r)) not("__raconTest dizi döndürmedi: " + JSON.stringify(r));
  else if (r.length) r.forEach((x) => not("__raconTest: " + (typeof x === "string" ? x : JSON.stringify(x))));
}

// oyunu oynanır hale getir (menü → yeni oyun)
await page.reload();
await page.waitForTimeout(200);
const yeni = page.locator('[data-act="newgame"], [data-act="new"], button:has-text("Yeni Oyun")').first();
if (await yeni.count()) {
  await yeni.click().catch(() => {});
  await page.waitForTimeout(150);
  const onay = page.locator('[data-act="startgame"], [data-act="start"], button:has-text("Başla"), button:has-text("Gir")').first();
  if (await onay.count()) await onay.click().catch(() => {});
  await page.waitForTimeout(250);
}

// 2) düzen — yatay
for (const [w, h] of [[1280, 800], [844, 390]]) {
  await page.setViewportSize({ width: w, height: h });
  await page.waitForTimeout(150);
  const m = await page.evaluate(() => ({
    yatay: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    dikey: document.documentElement.scrollHeight > document.documentElement.clientHeight + 1,
    app: !!document.querySelector("#app") && getComputedStyle(document.querySelector("#app")).display !== "none",
    nav: !!document.querySelector(".nav"),
    stage: !!document.querySelector(".stage"),
    side: !!document.querySelector(".side"),
    kucukHedef: [...document.querySelectorAll("button:not([disabled])")]
      .filter((b) => b.offsetParent !== null && b.getBoundingClientRect().height > 0 && b.getBoundingClientRect().height < 39).length,
  }));
  if (m.yatay) not(`${w}x${h}: sayfa yatay kayıyor`);
  if (m.dikey) not(`${w}x${h}: sayfa dikey kayıyor`);
  if (!m.app) not(`${w}x${h}: #app görünmüyor`);
  if (!(m.nav && m.stage && m.side)) not(`${w}x${h}: üç sütundan biri yok`);
  if (m.kucukHedef) not(`${w}x${h}: 40px altı ${m.kucukHedef} dokunma hedefi`);
}

// 3) düzen — dikey kilit
await page.setViewportSize({ width: 360, height: 640 });
await page.waitForTimeout(150);
const kilit = await page.evaluate(() => {
  const r = document.querySelector("#rotate"), a = document.querySelector("#app");
  return { rotate: r ? getComputedStyle(r).display !== "none" : false, app: a ? getComputedStyle(a).display !== "none" : true };
});
if (!kilit.rotate) not("360x640 dikey: kilit ekranı görünmüyor");
if (kilit.app) not("360x640 dikey: #app hâlâ görünüyor");

// 4) gezinti — bütün ekranlar
await page.setViewportSize({ width: 1280, height: 800 });
await page.waitForTimeout(150);
const navlar = await page.locator(".navbtn:not([disabled])").count();
if (navlar < 8) not(`sol nav'da ${navlar} açık düğme var, 8 bekleniyordu`);
for (let i = 0; i < navlar; i++) {
  await page.locator(".navbtn:not([disabled])").nth(i).click().catch(() => {});
  await page.waitForTimeout(80);
  const bos = await page.evaluate(() => (document.querySelector(".stage")?.textContent || "").trim().length < 3);
  if (bos) not(`nav ${i}: orta sahne boş kaldı`);
}

// 5) çift İlerlet tek gün (durum localStorage'dan okunur)
const gun = () => page.evaluate(() => { try { const j = JSON.parse(localStorage.getItem("racon_v1")); return j ? j.week * 7 + j.day : null; } catch (e) { return null; } });
await page.locator(".navbtn:not([disabled])").first().click().catch(() => {});
const gunOnce = await gun();
if (gunOnce === null) not("kayıttan gün okunamadı (çift İlerlet testi yapılamadı)");
else {
  const il = page.locator('#btn-ilerlet').first();
  if (!(await il.count())) not("İLERLET düğmesi bulunamadı");
  else {
    await il.click({ force: true }).catch(() => {});
    await il.click({ force: true }).catch(() => {});
    await page.waitForTimeout(900);
    const gunSonra = await gun();
    if (gunSonra === gunOnce) not("İlerlet gün ilerletmedi");
    else if (gunSonra - gunOnce > 1) not(`çift İlerlet ${gunSonra - gunOnce} gün yedi`);
  }
}

// 5b) fuzz — rastgele tıklama, çökme ve bozuk kayıt avı
for (let i = 0; i < 80; i++) {
  const btns = page.locator('.stage button:not([disabled]), .side button:not([disabled])');
  const n = await btns.count();
  if (!n) { await page.locator(".navbtn:not([disabled])").first().click().catch(() => {}); continue; }
  await btns.nth(Math.floor(Math.random() * n)).click({ timeout: 1500 }).catch(() => {});
  await page.waitForTimeout(40);
  if (i % 10 === 9) {
    const bozuk = await page.evaluate(() => {
      try { const j = JSON.parse(localStorage.getItem("racon_v1")); if (!j) return null;
        const d = [];
        if (j.dosya < 0 || j.dosya > 100) d.push("dosya " + j.dosya);
        for (const k of ["korku", "saygi", "nam", "racon"]) if (j.rep[k] < 0 || j.rep[k] > 100) d.push(k + " " + j.rep[k]);
        if (j.kasa < 0) d.push("kasa " + j.kasa);
        if (j.rep.korku >= 70 && j.rep.saygi >= 70) d.push("korku+saygı ikisi 70+");
        return d.length ? d.join(", ") : null;
      } catch (e) { return "kayıt bozuldu"; }
    });
    if (bozuk) not("fuzz: " + bozuk);
    const nav = await page.locator(".navbtn:not([disabled])").count();
    if (nav < 8) { await page.locator(".navbtn").first().click().catch(() => {}); }
  }
}

// 7) uzun koşu — RACON_LONG=1 ile 150 gün ilerlet, tıkanma/patlama ara
if (process.env.RACON_LONG) {
  const oku = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem("racon_v1")); } catch (e) { return null; } });
  let sonGun = null, takili = 0;
  for (let t = 0; t < 150; t++) {
    await page.locator("#btn-ilerlet").click({ force: true }).catch(() => {});
    await page.waitForTimeout(220);
    // sahne veya modal açıldıysa kapat / ilk seçeneği seç
    for (let k = 0; k < 12; k++) {
      const acik = page.locator('#modal button:not([disabled]), .sahne button:not([disabled]), .stage button:not([disabled])').first();
      const sahneVar = await page.evaluate(() => !!document.querySelector("#modal button, .sahne button"));
      if (!sahneVar) break;
      await acik.click({ force: true, timeout: 1000 }).catch(() => {});
      await page.waitForTimeout(80);
    }
    if (t % 15 === 14) {
      const j = await oku();
      if (!j) { not("uzun koşu: kayıt okunamadı (tık " + t + ")"); break; }
      const g = j.week * 7 + j.day;
      if (g === sonGun) { takili++; if (takili > 1) { not("uzun koşu: oyun " + t + ". tıkta tıkandı (gün ilerlemiyor)"); break; } }
      else takili = 0;
      sonGun = g;
      const d = [];
      if (j.dosya < 0 || j.dosya > 100) d.push("dosya " + j.dosya);
      for (const k of ["korku", "saygi", "nam", "racon"]) if (j.rep[k] < 0 || j.rep[k] > 100) d.push(k + " " + j.rep[k]);
      if (j.kasa < 0) d.push("kasa " + j.kasa);
      if (j.calendar.length > 200) d.push("takvim şişti: " + j.calendar.length);
      if (j.inbox.length > 300) d.push("inbox şişti: " + j.inbox.length);
      if (j.evidence.length > 400) d.push("delil şişti: " + j.evidence.length);
      if (d.length) { not("uzun koşu (tık " + t + "): " + d.join(", ")); break; }
    }
  }
  const son = await oku();
  if (son) console.log(`uzun koşu sonu: H${son.week} G${son.day} · kasa ${son.kasa} · dosya ${son.dosya} · kademe ${son.stage} · takvim ${son.calendar.length} · delil ${son.evidence.length} · adam ${son.men.filter((m) => m.durum !== "olu").length}`);
}

// 6) kayıt
const kayit = await page.evaluate(() => {
  try { const s = localStorage.getItem("racon_v1"); return s ? JSON.parse(s).kind : null; } catch (e) { return "bozuk"; }
});
if (kayit !== "racon_v1") not("localStorage racon_v1 yazılmadı (bulunan: " + kayit + ")");

konsol.forEach((k) => not("konsol: " + k));

await browser.close();
if (sorunlar.length) {
  console.log("SORUN (" + sorunlar.length + "):");
  sorunlar.forEach((s) => console.log(" - " + s));
  process.exit(1);
}
console.log("Racon QA temiz.");
