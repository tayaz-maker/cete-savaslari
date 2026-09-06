import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const read = (relative) => readFileSync(join(root, relative), "utf8");

const OBSOLETE_TERMS = [
  "hoangsonww",
  "Son Nguyen",
  "OMerkel",
  "Oliver Merkel",
  "oakmac",
  "Chris Oakman",
  "chessboard.js",
  "chess.js",
  "jQuery",
  "/licenses/",
];

test("credits.html artık üçüncü taraf atıflarını içermez", () => {
  const html = read("public/credits.html");
  for (const term of OBSOLETE_TERMS) {
    assert.equal(html.includes(term), false, `credits.html hâlâ "${term}" içeriyor`);
  }
});

test("credits.html güncel yaratıcı bilgisini ve gerekli grupları taşır", () => {
  const html = read("public/credits.html");
  assert.match(html, /Tarık Halil Ayaz/);
  assert.match(html, /TLab Classics/);
  assert.match(html, /Labirent/);
  assert.match(html, /Tek Taş/);
  assert.match(html, /Satranç/);
  assert.match(html, /TC SIM/);
  assert.match(html, /Bükücü/);
  assert.match(html, /Hanedan/);
});

test("credits linki portal ana sayfasında hâlâ çalışır durumda", () => {
  const html = read("src/components/portal/portal-home.tsx");
  assert.match(html, /href="\/credits\.html"/);
  assert.match(html, /Tüm hakları saklıdır/);
});

test("TC SIM footer'ı tam isim kullanır ve yardım kontrolü kabloludur", () => {
  const app = read("public/games/tc-sim/js/app.js");
  assert.match(app, /Tarık Halil Ayaz/);
  assert.equal(app.includes("Oyun tasarımı ve özgün içerik: Tarık.<"), false);
  assert.match(app, /import \{ renderHelpModal \} from "\.\/help\.js/);
  assert.match(app, /id="help-open"/);
  assert.match(app, /helpOpen = false/);
  const help = read("public/games/tc-sim/js/help.js");
  assert.match(help, /id="help-close"/);
});

test("Çete Savaşları HUD'una gerçek bir yardım kontrolü bağlanmış", () => {
  const hud = read("src/components/game/hud.tsx");
  assert.match(hud, /HelpPanel/);
  const panel = read("src/components/game/help-panel.tsx");
  assert.match(panel, /Nasıl Oynanır/);
  assert.match(panel, /DialogContent/);
  // Yardım metni gerçek mekanik terimlerini kullanmalı, jenerik olmamalı.
  for (const term of ["İcraat", "Tezgâh", "Emniyet", "kıdem", "localStorage"]) {
    assert.ok(panel.includes(term), `help-panel.tsx "${term}" içermeli`);
  }
});

test("Hanedan'da yardım kontrolü hem başlıkta hem oyun içinde erişilebilir", () => {
  const html = read("public/games/hanedan/index.html");
  assert.match(html, /data-act":"help"/);
  assert.match(html, /function openHelp/);
  assert.match(html, /var HELP = \[/);
  // readOnly listesine eklenmiş olmalı: sezon kapansa/baskın sürse de erişilebilir.
  const readOnlyLine = html.match(/var readOnly = \[[^\]]*\];/)?.[0] ?? "";
  assert.match(readOnlyLine, /"help"/);
  // İçerik gerçek mekanikleri adlandırmalı.
  for (const term of ["Taht", "sözleşme", "Kefalet", "Sezon", "kicker"]) {
    assert.ok(html.includes(term), `Hanedan yardımı "${term}" içermeli`);
  }
  assert.match(html, /Tarık Halil Ayaz/);
});

test("Son Mahalle Bükücü'nün mevcut Nasıl Oynanır'ı eksik konuları da kapsar", () => {
  const html = read("public/games/bukucu/index.html");
  assert.match(html, /var RULES = \[/);
  assert.match(html, /data-act="pause"/);
  for (const term of ["Naci Bey", "Batma", "Kayıt", "Açık artırma", "Takas", "Nezaret", "Senet"]) {
    assert.ok(html.includes(term), `Bükücü RULES "${term}" içermeli`);
  }
  assert.match(html, /Tarık Halil Ayaz/);
});

test("Racon Manager kilitli kalır: mevcut yardım/menü mantığı bozulmamış", () => {
  const html = read("public/games/racon/index.html");
  assert.match(html, /data-act="yardim-ac"/);
  assert.match(html, /Tarık Halil Ayaz/);
});

test("TLab Classics telif satırları hâlâ tutarlı ve tam isim kullanıyor", () => {
  for (const game of ["labirent", "peg-solitaire", "satranc"]) {
    const html = read(`public/games/${game}/index.html`);
    assert.match(html, /© 2026 TarikLab\. Tüm hakları saklıdır\./);
    assert.match(html, /Tarık Halil Ayaz/);
    assert.match(html, /Klasik oyun kuralları üzerindeki hak iddiası/);
  }
});
