/**
 * Çete Savaşları — desktop scroll regression (real browser).
 *
 * ROOT CAUSE THIS GUARDS
 * `.game-shell` carried `overflow-x: hidden`. Per the CSS overflow spec, when
 * one axis is `visible` and the other is not, the `visible` axis computes to
 * `auto`. So the shell silently became a scroll container in BOTH axes, and
 * every descendant `position: sticky` — the desktop tab nav and the log
 * sidebar — anchored to that never-scrolling box instead of the viewport.
 * Scrolling down a long view (İcraat is ~4150px tall at 1440x900) carried the
 * navigation off-screen: the page felt broken and unstable exactly as reported.
 *
 * WHY THIS TEST CATCHES A RECURRENCE
 * It does not look at source text. It drives the real app, scrolls a genuinely
 * long view to the bottom, and measures the nav's viewport rect. With the
 * regression reintroduced the nav measures top ≈ -2700 (off-screen) and this
 * fails; with the fix it measures top ≈ 0 and stays visible. It also asserts
 * scroll stability across rerender and modal open/close, and that the document
 * keeps exactly one vertical scroll owner (no double-scroll trap).
 *
 * Not part of `npm test`: CI has no browser. Run against a dev/preview server:
 *   npm run dev &  node scripts/cete-scroll-regression.mjs
 */
import { chromium } from "playwright-core";

const BASE = process.env.QA_BASE || "http://localhost:8080";
const EXEC = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const VIEWPORTS = [
  { w: 1366, h: 768 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 },
];

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} [${name}] ${detail}`);
};

async function boot(page) {
  await page.goto(`${BASE}/cete-savaslari`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /18 yaşından büyüğüm/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const i = document.querySelector('input[placeholder="Örn. Halil"]');
    if (!i) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(i, "Kaydırma");
    i.dispatchEvent(new Event("input", { bubbles: true }));
    const b = [...document.querySelectorAll("button")].find((x) => /sokağa in/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(900);
}

// Clicks are dispatched in-page: Playwright's own click() scrolls the target
// into view, which would fabricate scroll movement this test is measuring.
const clickText = (page, source, flags = "i") =>
  page.evaluate(([src, f]) => {
    const rx = new RegExp(src, f);
    const b = [...document.querySelectorAll("button")].find((x) => rx.test((x.textContent || "").trim()));
    if (!b) return false;
    b.click();
    return true;
  }, [source, flags]);

const geometry = (page) =>
  page.evaluate(() => {
    const nav = document.querySelector(".game-shell aside nav");
    const shell = document.querySelector(".game-shell");
    const main = document.querySelector(".game-shell main");
    const navRect = nav ? nav.getBoundingClientRect() : null;
    const shellCs = shell ? getComputedStyle(shell) : null;
    const mainCs = main ? getComputedStyle(main) : null;
    return {
      y: Math.round(window.scrollY),
      docH: document.documentElement.scrollHeight,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight,
      navTop: navRect ? Math.round(navRect.top) : null,
      navVisible: navRect ? navRect.bottom > 0 && navRect.top < window.innerHeight : null,
      navPosition: nav ? getComputedStyle(nav).position : null,
      shellOverflowX: shellCs ? shellCs.overflowX : null,
      shellOverflowY: shellCs ? shellCs.overflowY : null,
      mainScrolls: main ? main.scrollHeight > main.clientHeight + 1 : null,
      mainOverflowY: mainCs ? mainCs.overflowY : null,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    };
  });

const browser = await chromium.launch({ executablePath: EXEC });

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await boot(page);
  const tag = `${vp.w}x${vp.h}`;

  // İcraat is the tallest view; it is the one the bug was reported against.
  await clickText(page, "^İcraat$", "");
  await page.waitForTimeout(350);
  const top = await geometry(page);
  check(`${tag} long-view`, top.maxScroll > 600, `İcraat scrollable by ${top.maxScroll}px (needs a genuinely long view to be meaningful)`);

  // The shell must never be a scroll container: that is what broke sticky.
  check(
    `${tag} shell-not-scroll-container`,
    top.shellOverflowY === "visible",
    `.game-shell overflow-x=${top.shellOverflowX} overflow-y=${top.shellOverflowY} (overflow-y must stay visible; 'hidden' on x forces it to 'auto')`,
  );

  // Exactly one vertical scroll owner — no nested double-scroll trap.
  check(`${tag} single-scroll-owner`, top.mainScrolls === false, `main internal scroll = ${top.mainScrolls} (document owns the scroll)`);

  // THE REGRESSION: scroll to the bottom of a long view, nav must stay put.
  await page.evaluate(() => window.scrollTo(0, 99999));
  await page.waitForTimeout(300);
  const bottom = await geometry(page);
  check(
    `${tag} sticky-nav-survives-scroll`,
    bottom.navPosition === "sticky" && bottom.navVisible === true && bottom.navTop >= -1 && bottom.navTop < 80,
    `at scrollY=${bottom.y} nav top=${bottom.navTop} visible=${bottom.navVisible} position=${bottom.navPosition}`,
  );
  check(`${tag} no-horizontal-overflow`, bottom.horizontalOverflow === false, `document horizontal overflow = ${bottom.horizontalOverflow}`);

  // Rerender from a gameplay action must not throw the reader somewhere else.
  const beforeAction = await geometry(page);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /İcraata çık/i.test(x.textContent || "") && !x.disabled);
    if (b) b.click();
  });
  await page.waitForTimeout(700);
  const afterAction = await geometry(page);
  const heightDelta = beforeAction.docH - afterAction.docH;
  const scrollDelta = Math.abs(afterAction.y - beforeAction.y);
  check(
    `${tag} rerender-scroll-stable`,
    scrollDelta <= Math.max(40, heightDelta + 10),
    `scroll moved ${scrollDelta}px while the document shrank ${heightDelta}px (movement must be explained by layout, not a jump)`,
  );

  // Help modal must not eat the reading position.
  await page.evaluate(() => window.scrollTo(0, 99999));
  await page.waitForTimeout(250);
  const beforeModal = await geometry(page);
  await clickText(page, "Nasıl Oynanır");
  await page.waitForTimeout(550);
  const duringModal = await geometry(page);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(650);
  const afterModal = await geometry(page);
  check(
    `${tag} modal-preserves-scroll`,
    Math.abs(afterModal.y - beforeModal.y) <= 4 && Math.abs(duringModal.y - beforeModal.y) <= 4,
    `scrollY ${beforeModal.y} -> during ${duringModal.y} -> after ${afterModal.y}`,
  );

  // Switching views must land somewhere legitimate, never past the new maximum.
  await clickText(page, "^Klinik$", "");
  await page.waitForTimeout(450);
  const afterSwitch = await geometry(page);
  check(
    `${tag} view-switch-offset-sane`,
    afterSwitch.y <= afterSwitch.maxScroll + 2,
    `after İcraat -> Klinik scrollY=${afterSwitch.y} maxScroll=${afterSwitch.maxScroll}`,
  );

  check(`${tag} no-page-errors`, pageErrors.length === 0, pageErrors.slice(0, 2).join(" | ") || "none");
  await context.close();
}

// Mobile regression: the fix must not disturb the phone layout.
for (const vp of [{ w: 320, h: 640 }, { w: 390, h: 844 }, { w: 430, h: 932 }]) {
  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));
  await boot(page);
  const tag = `${vp.w}x${vp.h}`;
  const g = await geometry(page);
  const bottomNav = await page.evaluate(() => {
    const n = document.querySelector("nav.fixed.inset-x-0.bottom-0");
    if (!n) return null;
    const r = n.getBoundingClientRect();
    return { visible: r.top < window.innerHeight && r.bottom > 0, buttons: n.querySelectorAll("button").length };
  });
  check(`${tag} mobile-no-h-overflow`, g.horizontalOverflow === false, `horizontal overflow = ${g.horizontalOverflow}`);
  check(`${tag} mobile-bottom-nav`, !!bottomNav?.visible && bottomNav.buttons === 7, `bottom nav visible=${bottomNav?.visible} buttons=${bottomNav?.buttons}`);
  check(`${tag} mobile-no-page-errors`, pageErrors.length === 0, pageErrors.slice(0, 2).join(" | ") || "none");
  await context.close();
}

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} scroll regression checks passed`);
if (failed.length) {
  console.log("FAILURES:");
  for (const f of failed) console.log(` - [${f.name}] ${f.detail}`);
  process.exit(1);
}
