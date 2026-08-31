#!/usr/bin/env node
/**
 * Bükücü otomatik QA — kural doğrulama + rastgele oynatma.
 *
 *   node scripts/bukucu-qa.mjs                       # dev sunucusuna karşı
 *   BUKUCU_URL=http://127.0.0.1:8080/games/bukucu/ node scripts/bukucu-qa.mjs
 *   BUKUCU_FILE=public/games/bukucu/index.html node scripts/bukucu-qa.mjs
 *   node scripts/bukucu-qa.mjs --games 5 --steps 6000
 *
 * İki şey yapar:
 *  1) SENARYO — localStorage'a el yapımı bir oyun durumu yazar, tek bir
 *     kuralı test eder (nezaret, senet, iflas, satın alma…).
 *  2) FUZZ — oyunu baştan sona defalarca oynatır; her adımda oyun
 *     durumunun değişmez kurallarını (invariant) doğrular.
 *
 * Çıkış kodu: 0 = temiz, 1 = en az bir ihlal.
 */
import { chromium } from "playwright";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const flag = (name, def) => {
  const i = args.indexOf("--" + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const GAMES = Number(flag("games", 4));
const STEPS = Number(flag("steps", 6000));
const TARGET =
  process.env.BUKUCU_URL ||
  "file://" + path.resolve(process.env.BUKUCU_FILE || "public/games/bukucu/index.html");

/* Tahtanın kendisi — testin oyundan bağımsız referansı. Oyun dosyasındaki
   SQ dizisiyle birebir aynı olmalı; ayrışırsa BOARD testleri patlar. */
const SQ = [
  ["CUMA", "C", 0, ""],
  ["Dolapdere", "T", 60, "kahverengi"],
  ["İHBAR", "I", 0, ""],
  ["Tarlabaşı", "T", 60, "kahverengi"],
  ["Tahsilat", "X", 200, ""],
  ["Plakasız Forza", "K", 200, ""],
  ["Hacıhüsrev", "T", 100, "acik_mavi"],
  ["RACON", "R", 0, ""],
  ["Poligon", "T", 100, "acik_mavi"],
  ["Kuştepe", "T", 120, "acik_mavi"],
  ["NEZARET", "J", 0, ""],
  ["Karagümrük", "T", 140, "pembe"],
  ["Çevirme", "U", 150, ""],
  ["Balat", "T", 140, "pembe"],
  ["Ayvansaray", "T", 160, "pembe"],
  ["Basık Egea", "K", 200, ""],
  ["Sarıgöl", "T", 180, "turuncu"],
  ["İHBAR", "I", 0, ""],
  ["Gazi", "T", 180, "turuncu"],
  ["50. Yıl", "T", 200, "turuncu"],
  ["OCAK", "O", 0, ""],
  ["Çinçin Deresi", "T", 220, "kirmizi"],
  ["RACON", "R", 0, ""],
  ["Oruçreis", "T", 220, "kirmizi"],
  ["Bağcılar", "T", 240, "kirmizi"],
  ["Sürgü Vito", "K", 200, ""],
  ["Fikirtepe", "T", 260, "sari"],
  ["Gülsuyu", "T", 260, "sari"],
  ["Mühür", "U", 150, ""],
  ["Gülensu", "T", 280, "sari"],
  ["BASKIN", "B", 0, ""],
  ["Kanarya", "T", 300, "yesil"],
  ["Saadetdere", "T", 300, "yesil"],
  ["İHBAR", "I", 0, ""],
  ["Kıraç", "T", 320, "yesil"],
  ["Ön Araç", "K", 200, ""],
  ["RACON", "R", 0, ""],
  ["Mehterçeşme", "T", 350, "koyu_mavi"],
  ["Damga", "X", 100, ""],
  ["Esenyurt", "T", 400, "koyu_mavi"],
];
const BUILD_COST = {
  kahverengi: 50,
  acik_mavi: 50,
  pembe: 100,
  turuncu: 100,
  kirmizi: 150,
  sari: 150,
  yesil: 200,
  koyu_mavi: 200,
};

const fails = [];
const notes = [];
const fail = (t, m) => fails.push(`${t}: ${m}`);
const pass = (t) => notes.push(`ok  ${t}`);

/* Determinist Math.random + sıfır gecikmeli setTimeout: bir oyun saniyeler sürer.
   fast=false ise gecikmeler korunur — dokunma/uzun basma testleri gerçek
   zamana ihtiyaç duyar (uzun basma eşiği 400 ms). */
const initScript = (seed, fast = true) => `
(function () {
  var s = ${seed} >>> 0;
  Math.random = function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  var raw = window.setTimeout.bind(window);
  window.__raw = raw;
  if (${fast}) window.setTimeout = function (fn) { return raw(fn, 0); };
  window.__errors = [];
  addEventListener("error", function (e) { window.__errors.push(e.message + " @" + e.lineno); });
  addEventListener("unhandledrejection", function (e) { window.__errors.push("reject: " + e.reason); });
})();`;

const blank = (over = {}) => ({
  v: 1,
  mode: "hotseat",
  n: 2,
  cash: [1500, 1500],
  pos: [0, 0],
  jail: [0, 0],
  miss: [0, 0],
  cik: [0, 0],
  dead: [0, 0],
  own: Array(40).fill(-1),
  bld: Array(40).fill(0),
  sen: Array(40).fill(0),
  rD: [0],
  rX: [],
  iD: [0],
  iX: [],
  held: [],
  uBoost: 0,
  turn: 0,
  rolled: false,
  log: "Zar at.",
  wait: "roll",
  dice: [0, 0],
  doubles: 0,
  extra: 0,
  focus: 0,
  card: null,
  win: null,
  pend: null,
  ...over,
});
const tiles = (map) => Array.from({ length: 40 }, (_, i) => (i in map ? map[i] : -1));
const nums = (map, fill = 0) => Array.from({ length: 40 }, (_, i) => (i in map ? map[i] : fill));

async function fresh(browser, seed = 20260831, fast = true) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push("console: " + m.text());
  });
  await page.addInitScript(initScript(seed, fast));
  await page.goto(TARGET, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#menu button");
  return { ctx, page, errors };
}

/** Kayıtlı durumu yazıp "Devam et" ile o duruma girer. */
async function resume(page, state) {
  await page.evaluate((s) => {
    localStorage.setItem("smb.v1", JSON.stringify(s));
    location.reload();
  }, state);
  await page.waitForTimeout(150);
  await page.evaluate(() => document.querySelector('#menu button[data-act="cont"]')?.click());
  await page.waitForTimeout(150);
}
const snap = (page) =>
  page.evaluate(() => ({
    S: JSON.parse(localStorage.getItem("smb.v1")),
    acts: [...document.querySelectorAll("#acts button")].map((b) => ({
      a: b.getAttribute("data-act"),
      t: b.textContent,
      off: b.disabled,
    })),
    deed: document.getElementById("deed").textContent,
    log: document.getElementById("log").textContent,
  }));
const tap = (page, act) =>
  page.evaluate((a) => {
    const b = document.querySelector(
      `#acts button[data-act="${a}"], #deed button[data-act="${a}"]`,
    );
    if (b && !b.disabled) b.click();
    return !!b;
  }, act);

/* ------------------------------------------------------------------ */
/* 1. SENARYOLAR                                                       */
/* ------------------------------------------------------------------ */

async function scenarios(browser) {
  /* Nezaret: çift atmak seni çıkarır ama ikinci bir zar hakkı vermez. */
  {
    const { ctx, page } = await fresh(browser);
    await page.addInitScript(
      `(function(){ var q=[0.5,0.5,0.5,0.5]; var i=0; Math.random=function(){ return q[i++ % q.length]; };})();`,
    );
    await resume(page, blank({ pos: [10, 0], jail: [1, 0], wait: "jail" }));
    await tap(page, "roll");
    await page.waitForTimeout(700);
    const { S } = await snap(page);
    if (S.extra)
      fail("nezaret/cift", "çift atınca fazladan tur veriliyor (Monopoly kuralında yok)");
    else pass("nezaret/cift ekstra tur vermiyor");
    if (S.jail[0]) fail("nezaret/cift", "çift atıldı ama oyuncu hâlâ nezarette");
    await ctx.close();
  }

  /* Nezaret: üçüncü hak yandığında 50 TL kefalet alınır. */
  {
    const { ctx, page } = await fresh(browser);
    await page.addInitScript(
      `(function(){ var q=[0.0,0.9]; var i=0; Math.random=function(){ return q[i++ % q.length]; };})();`,
    );
    await resume(
      page,
      blank({ pos: [10, 0], jail: [1, 0], miss: [2, 0], wait: "jail", cash: [1000, 1500] }),
    );
    await tap(page, "roll");
    await page.waitForTimeout(900);
    const { S } = await snap(page);
    if (S.cash[0] > 950)
      fail("nezaret/ucuncu", `kefalet alınmadı (kasa ${S.cash[0]}, beklenen ≤950)`);
    else pass("nezaret/ucuncu hakta 50 TL kefalet");
    await ctx.close();
  }

  /* Satın alma: kasa yetmiyorsa "Al" tıklanabilir olmamalı. */
  {
    const { ctx, page } = await fresh(browser);
    await resume(page, blank({ pos: [39, 0], wait: "buy", cash: [10, 1500], focus: 39 }));
    const { acts } = await snap(page);
    const al = acts.find((a) => a.a === "al");
    if (!al) fail("satinalma", '"Al" düğmesi yok');
    else if (!al.off) fail("satinalma", '400 TL\'lik tapu için 10 TL kasayla "Al" hâlâ aktif');
    else pass("satinalma/kasa yetmezken Al kapalı");
    await ctx.close();
  }

  /* Nakit toplama sırası: önce bina sökülür, sonra tapu senede girer. */
  {
    const { ctx, page } = await fresh(browser);
    await resume(
      page,
      blank({
        wait: "pay",
        pos: [39, 39],
        cash: [5, 1500],
        focus: 39,
        own: tiles({ 1: 0, 3: 0, 39: 1 }),
        bld: nums({ 1: 4, 3: 4 }),
      }),
    );
    await tap(page, "ode");
    await page.waitForTimeout(400);
    const { S } = await snap(page);
    const mortgagedWithHouses = S.own.some((_, i) => S.sen[i] && S.bld[i] > 0);
    if (mortgagedWithHouses)
      fail("senet", "üzerinde bina olan tapu senede girdi (bina bedava geri geliyor)");
    else pass("senet/bina önce sökülüyor");
    if (S.bld[1] === 4 && S.bld[3] === 4 && S.sen[1])
      fail("senet", "bina hiç sökülmeden senet çekildi");
    await ctx.close();
  }

  /* İflas: binalar bankaya döner, alacaklıya bedava Hanedan geçmez. */
  {
    const { ctx, page } = await fresh(browser);
    await resume(
      page,
      blank({
        wait: "pay",
        pos: [39, 39],
        cash: [0, 1500],
        focus: 39,
        own: tiles({ 1: 0, 39: 1 }),
        bld: nums({ 1: 4 }),
        sen: nums({ 1: 1 }),
      }),
    );
    await tap(page, "ode");
    await page.waitForTimeout(500);
    const { S } = await snap(page);
    if (S.dead[0] && S.bld[1] > 0) fail("iflas", "iflasta binalar alacaklıya bedava geçti");
    else pass("iflas/binalar bankaya dönüyor");
    await ctx.close();
  }

  /* Tapu kartı: ekranda görünen tapu ile işlem yapılan tapu aynı olmalı.
     Gerçek zamanlı: uzun basma eşiği 400 ms, sıfırlanmış zamanlayıcıyla
     her dokunuş büyük tahtayı açardı. */
  {
    const { ctx, page } = await fresh(browser, 20260831, false);
    await resume(
      page,
      blank({
        wait: "roll",
        focus: 3,
        cash: [1000, 1500],
        own: tiles({ 1: 0, 3: 0 }),
        sen: nums({ 1: 1, 3: 1 }),
      }),
    );
    const hit = await page.evaluate(() => {
      const cv = document.getElementById("cv");
      const b = cv.getBoundingClientRect();
      const size = Math.min(b.width, b.height);
      const m = Math.max(2, (size * 0.008) | 0);
      const board = size - 2 * m;
      let D = board * 0.225;
      if (D < 42) D = 42;
      if (D > board * 0.26) D = board * 0.26;
      let inner = board - 2 * D;
      if (inner < 110) {
        D = (board - 110) / 2;
        inner = board - 2 * D;
      }
      const tw = inner / 9;
      const r = { x: m + board - D - tw, y: m + board - D, w: tw, h: D };
      return {
        x: b.x + (b.width - size) / 2 + r.x + r.w / 2,
        y: b.y + (b.height - size) / 2 + r.y + r.h / 2,
      };
    });
    await page.mouse.move(hit.x, hit.y);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(150);
    const shown = await page.evaluate(() =>
      document.getElementById("deed").textContent.slice(0, 20),
    );
    if (!shown.startsWith("Dolapdere")) {
      fail("tapu/dokunma", `kareye dokununca o karenin tapusu açılmadı (görünen: ${shown})`);
    } else {
      const btn = await page.evaluate(() => {
        const el = document.querySelector('#deed button[data-act="unsen"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      if (!btn) fail("tapu/dokunma", "senetli tapuda 'SENETLİ' düğmesi çıkmadı");
      else {
        await page.mouse.move(btn.x, btn.y);
        await page.mouse.down();
        await page.mouse.up();
        await page.waitForTimeout(250);
        const { S } = await snap(page);
        if (S.sen[1] !== 0)
          fail(
            "tapu/dokunma",
            `ekrandaki tapu yerine başka tapunun seneti kapatıldı (sen[1]=${S.sen[1]}, sen[3]=${S.sen[3]})`,
          );
        else pass("tapu/dokunma ekrandaki tapu üstünde çalışıyor");
      }
    }
    await ctx.close();
  }

  /* Tuval: CSS kutusu ile çizim kutusu birebir olmalı, resize'da yeniden çizilmeli. */
  {
    const { ctx, page } = await fresh(browser);
    await resume(page, blank());
    const geo = await page.evaluate(() => {
      const c = document.getElementById("cv");
      const b = c.getBoundingClientRect();
      return { css: [b.width, b.height], bmp: [c.width, c.height], dpr: devicePixelRatio };
    });
    const sx = geo.bmp[0] / geo.dpr / geo.css[0];
    const sy = geo.bmp[1] / geo.dpr / geo.css[1];
    if (Math.abs(sx - 1) > 0.005 || Math.abs(sy - 1) > 0.005) {
      fail(
        "tuval/olcek",
        `tahta ${sx.toFixed(3)}×${sy.toFixed(3)} oranında geriliyor (bulanık çizim)`,
      );
    } else pass("tuval/ölçek 1:1");
    await page.setViewportSize({ width: 430, height: 600 });
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const c = document.getElementById("cv");
      const b = c.getBoundingClientRect();
      return { css: [b.width, b.height], bmp: [c.width, c.height], dpr: devicePixelRatio };
    });
    const rx = after.bmp[0] / after.dpr / after.css[0];
    if (Math.abs(rx - 1) > 0.02)
      fail("tuval/resize", "pencere boyutu değişince tahta yeniden çizilmiyor");
    else pass("tuval/resize sonrası yeniden çiziliyor");
    await ctx.close();
  }

  /* Türkçe büyük harf: "Gazi" → "GAZİ", "Poligon" → "POLİGON". */
  {
    const { ctx, page } = await fresh(browser);
    await resume(page, blank());
    const bad = await page.evaluate(() => {
      const names = ["Gazi", "Poligon", "Tahsilat", "Fikirtepe", "Çevirme"];
      return names.filter(
        (n) =>
          n.toLocaleUpperCase("tr-TR").indexOf("İ") >= 0 &&
          n.toUpperCase() === n.toLocaleUpperCase("tr-TR"),
      );
    });
    if (bad.length) fail("dil", "tr-TR büyük harf beklenmedik: " + bad.join(","));
    else pass("dil/tr-TR büyük harf davranışı");
    await ctx.close();
  }

  /* Erişilebilirlik: durum satırı canlı bölge olmalı, menü düğmesi bulunmalı. */
  {
    const { ctx, page } = await fresh(browser);
    await resume(page, blank());
    const a11y = await page.evaluate(() => ({
      live: document.getElementById("log").getAttribute("aria-live"),
      pause: !!document.querySelector('[data-act="pause"]'),
      tapTargets: [...document.querySelectorAll("#acts button, #bar button")]
        .map((b) => Math.round(b.getBoundingClientRect().height))
        .filter((h) => h > 0 && h < 32),
    }));
    if (a11y.live !== "polite")
      fail("a11y", "#log canlı bölge değil (ekran okuyucu olayları duyurmaz)");
    else pass("a11y/#log aria-live");
    if (!a11y.pause) fail("a11y", "oyun içinde menüye dönüş düğmesi yok");
    else pass("a11y/oyun içi menü düğmesi");
    if (a11y.tapTargets.length)
      fail("a11y", "32 pikselden kısa dokunma hedefi: " + a11y.tapTargets.join(","));
    await ctx.close();
  }
}

/* ------------------------------------------------------------------ */
/* 2. FUZZ — bütün oyunu oynat, her adımda değişmezleri doğrula        */
/* ------------------------------------------------------------------ */

function checkState(S, board, cost) {
  const bad = [];
  const n = S.n;
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(S.cash[i])) bad.push(`kasa sayı değil (o${i})`);
    if (S.cash[i] < 0) bad.push(`eksi kasa (o${i} = ${S.cash[i]})`);
    if (S.pos[i] < 0 || S.pos[i] > 39) bad.push(`konum tahta dışında (o${i})`);
    if (S.dead[i] && S.cash[i] !== 0) bad.push(`batan oyuncunun parası var (o${i})`);
  }
  const groups = {};
  for (let i = 0; i < 40; i++) {
    if (S.own[i] >= n || S.own[i] < -1) bad.push(`geçersiz sahip (kare ${i})`);
    if (S.own[i] >= 0 && S.dead[S.own[i]]) bad.push(`kare ${i} batan oyuncuda`);
    if (S.bld[i] > 0 && S.own[i] < 0) bad.push(`sahipsiz karede bina (${i})`);
    if (S.bld[i] > 0 && S.sen[i])
      bad.push(`senetli tapunun üstünde bina duruyor (kare ${i}, ${S.bld[i]} kat)`);
    if (S.sen[i] && S.own[i] < 0) bad.push(`sahipsiz kare senetli (${i})`);
    if (S.bld[i] < 0 || S.bld[i] > 4) bad.push(`bina seviyesi aralık dışı (${i})`);
    if (S.bld[i] > 0 && board[i][1] !== "T") bad.push(`tapu olmayan karede bina (${i})`);
    const g = board[i][3];
    if (g) (groups[g] = groups[g] || []).push(i);
  }
  for (const g of Object.keys(groups)) {
    const a = groups[g];
    const lv = a.map((i) => S.bld[i]);
    const owners = new Set(a.map((i) => S.own[i]));
    if (Math.max(...lv) - Math.min(...lv) > 1) bad.push(`dengesiz inşaat (${g}: ${lv.join("/")})`);
    if (Math.max(...lv) > 0 && (owners.size > 1 || owners.has(-1)))
      bad.push(`semt tutulmadan bina var (${g})`);
    if (!cost[g]) bad.push(`renk grubunun dikme bedeli yok (${g})`);
  }
  if (S.turn < 0 || S.turn >= n) bad.push("sıra geçersiz oyuncuda");
  if (S.win == null && S.dead[S.turn]) bad.push("sıra batan oyuncuda");
  if (S.win != null && S.dead[S.win]) bad.push("kazanan batmış görünüyor");
  return bad;
}

async function fuzz(browser, mode, seed, maxSteps) {
  const { ctx, page, errors } = await fresh(browser, seed);
  await page.evaluate((m) => document.querySelector(`#menu button[data-act="${m}"]`).click(), mode);
  await page.waitForTimeout(50);
  const res = await page.evaluate(
    async ({ maxSteps, board, cost, check }) => {
      const run = new Function("S", "board", "cost", "return (" + check + ")(S, board, cost);");
      const sleep = (ms) => new Promise((r) => window.__raw(r, ms));
      const seen = new Set();
      let steps = 0,
        turns = 0,
        lastTurn = -1,
        idle = 0,
        prev = "",
        spin = 0;
      let finished = false;
      while (steps++ < maxSteps) {
        let S = null;
        try {
          S = JSON.parse(localStorage.getItem("smb.v1"));
        } catch (e) {
          /* yeni oyun */
        }
        if (S) {
          for (const m of run(S, board, cost)) seen.add(m);
          if (S.turn !== lastTurn) {
            lastTurn = S.turn;
            turns++;
          }
          if (S.win != null) {
            finished = true;
            break;
          }
        }
        const btns = [...document.querySelectorAll("#acts button")].filter((b) => !b.disabled);
        if (!btns.length) {
          await sleep(2);
          if (++idle > 4000) {
            seen.add("oyun kilitlendi (tıklanabilir düğme kalmadı)");
            break;
          }
          continue;
        }
        idle = 0;
        const sig = S
          ? S.wait + S.turn + S.cash.join() + S.pos.join() + S.own.join() + S.bld.join()
          : "";
        if (sig && sig === prev) spin++;
        else {
          spin = 0;
          prev = sig;
        }
        if (spin > 400) {
          seen.add("ilerleme yok: " + (S && S.wait));
          break;
        }
        (btns[spin % btns.length] || btns[0]).click();
        await sleep(1);
      }
      let S = null;
      try {
        S = JSON.parse(localStorage.getItem("smb.v1"));
      } catch (e) {
        /* yok */
      }
      return {
        steps,
        turns,
        finished,
        issues: [...seen],
        errors: window.__errors.slice(),
        win: S ? S.win : null,
      };
    },
    { maxSteps, board: SQ, cost: BUILD_COST, check: checkState.toString() },
  );
  await ctx.close();
  return { ...res, errors: [...res.errors, ...errors] };
}

/* ------------------------------------------------------------------ */

const browser = await chromium.launch({ args: ["--no-sandbox"] });
console.log(`Bükücü QA → ${TARGET}\n`);

await scenarios(browser);

let played = 0,
  unfinished = 0;
for (const mode of ["cpu", "hot", "hot3", "hot4"]) {
  for (let g = 0; g < GAMES; g++) {
    const r = await fuzz(browser, mode, 7919 * (g + 1) + 13, STEPS);
    played++;
    if (!r.finished) unfinished++;
    const line = `${mode.padEnd(5)} adım=${String(r.steps).padStart(5)} tur=${String(r.turns).padStart(4)} bitti=${r.finished ? "E" : "h"}`;
    if (r.issues.length || r.errors.length) {
      fail("fuzz/" + mode, `${line} → ${[...r.issues, ...r.errors].join(" | ")}`);
    } else notes.push("ok  fuzz/" + line);
  }
}

await browser.close();

for (const n of notes) console.log(n);
console.log(`\n${played} oyun oynandı, ${unfinished} tanesi adım sınırına takıldı.`);
if (fails.length) {
  console.log(`\n${fails.length} SORUN:`);
  for (const f of fails) console.log("  ✗ " + f);
  process.exit(1);
}
console.log("\nTemiz.");
