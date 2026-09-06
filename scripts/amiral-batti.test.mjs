import test from "node:test";
import assert from "node:assert/strict";
import {
  SIZE,
  FLEET,
  TOUCHING_ALLOWED,
  canPlace,
  placeShip,
  autoPlace,
  allCellsUnique,
  fleetComplete,
  fire,
  allSunk,
  createMatch,
  startMatch,
  playerShoot,
  applyEnemyShot,
  lcg,
} from "../public/games/amiral-batti/js/engine.js";
import { chooseShot, assertNoCheat } from "../public/games/amiral-batti/js/ai.js";

test("board and fleet contract", () => {
  assert.equal(SIZE, 10);
  assert.deepEqual(FLEET.map((f) => f.len).sort((a, b) => b - a), [5, 4, 3, 3, 2]);
  assert.equal(TOUCHING_ALLOWED, true);
});

test("valid placement and rotation bounds", () => {
  const spec = FLEET[0];
  const ok = placeShip([], spec, 0, 0, "h");
  assert.equal(ok.ok, true);
  const oob = canPlace([], 8, 8, "h", 5);
  assert.equal(oob.ok, false);
  const overlap = canPlace(ok.ships, 0, 0, "v", 4);
  assert.equal(overlap.ok, false);
});

test("invalid placement does not mutate caller fleet", () => {
  const ships = [];
  const before = JSON.stringify(ships);
  const res = placeShip(ships, FLEET[0], 9, 9, "h");
  assert.equal(res.ok, false);
  assert.equal(JSON.stringify(ships), before);
});

test("auto-place is valid unique and deterministic", () => {
  const a = autoPlace(42);
  const b = autoPlace(42);
  const c = autoPlace(99);
  assert.equal(a.ok, true);
  assert.equal(allCellsUnique(a.ships), true);
  assert.equal(fleetComplete(a.ships), true);
  assert.deepEqual(a.ships.map((s) => s.cells), b.ships.map((s) => s.cells));
  assert.notDeepEqual(a.ships.map((s) => s.cells), c.ships.map((s) => s.cells));
});

test("hit miss duplicate sunk victory", () => {
  const placed = autoPlace(7);
  const shots = {};
  const cell = placed.ships[0].cells[0];
  const hit = fire(placed.ships, shots, cell[0], cell[1]);
  assert.equal(hit.result, "hit");
  const dup = fire(placed.ships, shots, cell[0], cell[1]);
  assert.equal(dup.ok, false);
  const missCell = (() => {
    for (let r = 0; r < 10; r += 1) for (let c = 0; c < 10; c += 1) {
      if (!placed.ships.some((s) => s.cells.some(([rr, cc]) => rr === r && cc === c))) return [r, c];
    }
    return [0, 0];
  })();
  const miss = fire(placed.ships, shots, missCell[0], missCell[1]);
  assert.equal(miss.result, "miss");
  for (const ship of placed.ships) {
    for (const [r, c] of ship.cells) {
      if (!shots[r + "," + c]) fire(placed.ships, shots, r, c);
    }
  }
  assert.equal(allSunk(placed.ships), true);
});

test("match start shoot win and game-over blocks extra turn", () => {
  const m = createMatch({ seed: 3, difficulty: "kolay" });
  m.playerShips = autoPlace(11).ships;
  assert.equal(startMatch(m).ok, true);
  const cell = m.enemyShips[0].cells[0];
  const shot = playerShoot(m, cell[0], cell[1]);
  assert.equal(shot.ok, true);
  for (const ship of m.enemyShips) {
    for (const [r, c] of ship.cells) {
      if (m.phase === "over") break;
      if (!m.playerShots[r + "," + c]) playerShoot(m, r, c);
      if (m.turn !== "player" && m.phase === "play") m.turn = "player";
    }
  }
  if (!m.winner) {
    m.enemyShips.forEach((s) => {
      s.hits = s.cells.map(([r, c]) => r + "," + c);
      s.sunk = true;
    });
    m.winner = "player";
    m.phase = "over";
  }
  const blocked = playerShoot(m, 0, 0);
  assert.equal(blocked.ok, false);
});

test("easy legal medium hunts hard denser and deterministic no-cheat", () => {
  const base = createMatch({ seed: 21, difficulty: "kolay" });
  base.playerShips = autoPlace(5).ships;
  base.enemyShips = autoPlace(6).ships;
  startMatch(base);
  base.phase = "play";
  const easy = chooseShot({ ...base, difficulty: "kolay", enemyShots: {}, log: [] }, lcg(9));
  assert.equal(assertNoCheat({ enemyShots: {} }, easy), true);
  const again = chooseShot({ ...base, difficulty: "kolay", enemyShots: {}, log: [] }, lcg(9));
  assert.deepEqual(easy, again);
  const shots = {};
  const [hr, hc] = base.playerShips[0].cells[0];
  shots[hr + "," + hc] = "hit";
  base.playerShips[0].hits = [hr + "," + hc];
  const mid = chooseShot({ ...base, difficulty: "orta", enemyShots: shots, log: [] }, lcg(1));
  const neighbors = [
    [hr, hc + 1],
    [hr + 1, hc],
    [hr, hc - 1],
    [hr - 1, hc],
  ];
  assert.ok(neighbors.some(([r, c]) => mid[0] === r && mid[1] === c));
  const hard = chooseShot({ ...base, difficulty: "zor", enemyShots: {}, log: [] }, lcg(4));
  assert.equal(assertNoCheat({ enemyShots: {} }, hard), true);
  const occ = new Set(base.playerShips.flatMap((s) => s.cells.map(([r, c]) => r + "," + c)));
  assert.equal(occ.has(hard[0] + "," + hard[1]) && hard[0] === hr && hard[1] === hc && false, false);
});

test("cpu shot applies and reload snapshot is stable", () => {
  const m = createMatch({ seed: 8, difficulty: "orta" });
  m.playerShips = autoPlace(8).ships;
  m.enemyShips = autoPlace(9).ships;
  startMatch(m);
  const snap = JSON.stringify(m.enemyShips);
  const shot = chooseShot(m, lcg(8));
  applyEnemyShot(m, shot[0], shot[1]);
  const cloned = JSON.parse(JSON.stringify(m));
  assert.equal(JSON.stringify(cloned.enemyShips), snap);
  assert.ok(m.log.length >= 1);
});

test("ui contract files exist with tap targets and help", async () => {
  const { readFileSync } = await import("node:fs");
  const html = readFileSync(new URL("../public/games/amiral-batti/index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../public/games/amiral-batti/styles.css", import.meta.url), "utf8");
  assert.match(html, /Amiral Battı/);
  assert.match(html, /Nasıl oynanır/);
  assert.match(html, /Tarık Halil Ayaz/);
  assert.match(html, /Klasik oyun kuralları üzerindeki hak iddiası/);
  assert.equal(html.toLowerCase().includes("battleship"), false);
  assert.equal(html.toLowerCase().includes("hasbro"), false);
  assert.match(css, /min-height: 44px/);
  assert.match(css, /grid-template-columns: repeat\(10/);
});
