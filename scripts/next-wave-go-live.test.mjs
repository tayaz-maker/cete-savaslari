import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const games = read("src/lib/games.ts");

function catalogBlock(slug) {
  const marker = `slug: "${slug}"`;
  const start = games.indexOf(marker);
  assert.notEqual(start, -1, `${slug} must exist in the catalog`);
  const end = games.indexOf("\n  {", start + marker.length);
  return games.slice(start, end === -1 ? games.length : end);
}

test("all five Next Wave games are live and resolve to playable catalog routes", () => {
  for (const slug of ["apartman", "son-100-gun", "kayip-telefon", "tc-sim-devlet"]) {
    const block = catalogBlock(slug);
    assert.match(block, /status: "live"/);
    assert.match(block, new RegExp(`href: "/oyna/${slug}"`));
    assert.ok(existsSync(new URL(`../public/games/${slug}/index.html`, import.meta.url)));
  }

  const html5List = games.slice(
    games.indexOf("export const HTML5_SLUGS"),
    games.indexOf("] as const"),
  );
  for (const slug of ["apartman", "son-100-gun", "kayip-telefon", "tc-sim-devlet"]) {
    assert.match(html5List, new RegExp(`"${slug}"`));
  }
});

test("İhtilâl is the sole coming-soon catalog entry and links to its dedicated route", () => {
  assert.equal((games.match(/status: "soon"/g) ?? []).length, 1);
  const block = catalogBlock("ihtilal");
  assert.match(block, /status: "soon"/);
  assert.match(block, /href: "\/ihtilal"/);
  assert.doesNotMatch(
    games.slice(games.indexOf("export const HTML5_SLUGS"), games.indexOf("] as const")),
    /"ihtilal"/,
  );

  const portal = read("src/components/portal/portal-home.tsx");
  assert.match(portal, /game\.slug === "ihtilal"/);
  assert.match(portal, /<Link to="\/ihtilal"/);
  assert.match(read("src/routeTree.gen.ts"), /'\/ihtilal'/);
});

test("İhtilâl is a bilingual information page, not a gameplay implementation", () => {
  const route = read("src/routes/ihtilal.tsx");
  for (const copy of [
    "Seçim kazanılır. İktidar tutulmaz.",
    "Elections are won. Power is not kept.",
    "1950–80. İki taraf. Bir harita. Kurumlar ayrı konuşur.",
    "Meclis · Polis · Ordu · Üniversite · Sermaye",
    "Parliament · Police · Military · University · Capital",
    "Kart düşer. Pul konur. Zar konuşur.",
    "Dört turda bir sandık.",
    "Bazen gece, sandıktan önce.",
    "İhtilâl (2015), Kene Yapım / Tunca Zeki Berkkurt",
  ]) {
    assert.match(route, new RegExp(copy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(route, /<iframe|localStorage|game engine|newGame|save/i);
});

test("DEVLET release copy is honest about the currently playable period", () => {
  const block = catalogBlock("tc-sim-devlet");
  assert.match(block, /2002–05 çekirdeği/);
  assert.doesNotMatch(block, /4000/);
  const i18n = read("src/lib/i18n.ts");
  assert.match(i18n, /2002–05 core/);
  assert.doesNotMatch(i18n, /Four thousand years of state mind/);
});
