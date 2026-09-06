/**
 * Amiral Battı — TLab Classics motoru.
 * Kamuya mal olmuş ızgara-filo kavramı; özgün TarikLab uygulaması.
 * Hasbro / Battleship markası, görseli ve metni kullanılmaz.
 */
export const SIZE = 10;
export const FLEET = [
  { id: "amiral", name: "Amiral", len: 5 },
  { id: "kruvazor", name: "Kruvazör", len: 4 },
  { id: "firkateyn", name: "Fırkateyn", len: 3 },
  { id: "korvet", name: "Korvet", len: 3 },
  { id: "karakol", name: "Karakol", len: 2 },
];
export const DIFFICULTIES = ["kolay", "orta", "zor"];
export const TOUCHING_ALLOWED = true;

export function lcg(seed) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

export function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

export function cellsOf(r, c, dir, len) {
  const cells = [];
  for (let i = 0; i < len; i += 1) {
    const rr = dir === "v" ? r + i : r;
    const cc = dir === "h" ? c + i : c;
    if (!inBounds(rr, cc)) return null;
    cells.push([rr, cc]);
  }
  return cells;
}

export function key(r, c) {
  return r + "," + c;
}

export function occupancy(ships) {
  const map = new Map();
  for (const s of ships) {
    for (const [r, c] of s.cells) map.set(key(r, c), s.id);
  }
  return map;
}

export function canPlace(ships, r, c, dir, len) {
  const cells = cellsOf(r, c, dir, len);
  if (!cells) return { ok: false, reason: "Tahta dışına taşıyor." };
  const occ = occupancy(ships);
  for (const [rr, cc] of cells) {
    if (occ.has(key(rr, cc))) return { ok: false, reason: "Gemiler üst üste binemez." };
  }
  return { ok: true, cells };
}

export function placeShip(ships, spec, r, c, dir) {
  const check = canPlace(ships, r, c, dir, spec.len);
  if (!check.ok) return { ok: false, reason: check.reason, ships };
  const next = ships.filter((s) => s.id !== spec.id);
  next.push({ id: spec.id, name: spec.name, len: spec.len, dir, cells: check.cells, hits: [] });
  return { ok: true, ships: next };
}

export function removeShip(ships, id) {
  return ships.filter((s) => s.id !== id);
}

export function rotateDir(dir) {
  return dir === "h" ? "v" : "h";
}

export function autoPlace(seed) {
  const rand = typeof seed === "function" ? seed : lcg(seed >>> 0 || 1);
  const ships = [];
  for (const spec of FLEET) {
    let placed = false;
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const dir = rand() < 0.5 ? "h" : "v";
      const r = Math.floor(rand() * SIZE);
      const c = Math.floor(rand() * SIZE);
      const res = placeShip(ships, spec, r, c, dir);
      if (res.ok) {
        ships.length = 0;
        ships.push(...res.ships);
        placed = true;
        break;
      }
    }
    if (!placed) return { ok: false, ships: [], reason: "Yerleşim bulunamadı." };
  }
  return { ok: true, ships };
}

export function allCellsUnique(ships) {
  const seen = new Set();
  for (const s of ships) {
    for (const [r, c] of s.cells) {
      const k = key(r, c);
      if (seen.has(k)) return false;
      seen.add(k);
    }
  }
  return seen.size === FLEET.reduce((a, f) => a + f.len, 0);
}

export function fleetComplete(ships) {
  if (ships.length !== FLEET.length) return false;
  const ids = new Set(ships.map((s) => s.id));
  return FLEET.every((f) => ids.has(f.id)) && allCellsUnique(ships);
}

export function fire(ships, shots, r, c) {
  if (!inBounds(r, c)) return { ok: false, reason: "Dışarı." };
  const k = key(r, c);
  if (shots[k]) return { ok: false, reason: "Bu kareye ateş edildi." };
  const occ = occupancy(ships);
  const id = occ.get(k);
  if (!id) {
    shots[k] = "miss";
    return { ok: true, result: "miss", sunk: null, shots };
  }
  shots[k] = "hit";
  const ship = ships.find((s) => s.id === id);
  if (!ship.hits.includes(k)) ship.hits.push(k);
  const sunk = ship.hits.length >= ship.cells.length ? ship.id : null;
  if (sunk) ship.sunk = true;
  return { ok: true, result: sunk ? "sunk" : "hit", sunk, ship: ship.name, shots };
}

export function allSunk(ships) {
  return ships.length > 0 && ships.every((s) => s.sunk || s.hits.length >= s.cells.length);
}

export function remainingShips(ships) {
  return ships.filter((s) => !(s.sunk || s.hits.length >= s.cells.length)).map((s) => ({ id: s.id, name: s.name, len: s.len }));
}

export function createMatch({ seed = 1, difficulty = "orta", mode = "cpu" } = {}) {
  const rand = lcg(seed);
  const enemy = autoPlace(rand);
  return {
    version: 1,
    seed,
    difficulty,
    mode,
    phase: "place",
    turn: "player",
    playerShips: [],
    enemyShips: enemy.ok ? enemy.ships : [],
    playerShots: {},
    enemyShots: {},
    log: [],
    winner: null,
    ai: { mode: "hunt", hits: [], tried: {} },
  };
}

export function startMatch(state) {
  if (!fleetComplete(state.playerShips)) return { ok: false, reason: "Filo eksik." };
  if (!fleetComplete(state.enemyShips)) return { ok: false, reason: "Rakip filo kurulamadı." };
  state.phase = "play";
  state.turn = "player";
  return { ok: true };
}

export function playerShoot(state, r, c) {
  if (state.phase !== "play" || state.winner) return { ok: false, reason: "Oyun kapalı." };
  if (state.turn !== "player") return { ok: false, reason: "Sıra rakipte." };
  const res = fire(state.enemyShips, state.playerShots, r, c);
  if (!res.ok) return res;
  state.log.push({ who: "player", r, c, result: res.result, sunk: res.sunk });
  if (allSunk(state.enemyShips)) {
    state.winner = "player";
    state.phase = "over";
    return { ...res, winner: "player" };
  }
  state.turn = state.mode === "hotseat" ? "enemy" : "cpu";
  return res;
}

export function applyEnemyShot(state, r, c) {
  if (state.phase !== "play" || state.winner) return { ok: false, reason: "Oyun kapalı." };
  const res = fire(state.playerShips, state.enemyShots, r, c);
  if (!res.ok) return res;
  state.log.push({ who: "cpu", r, c, result: res.result, sunk: res.sunk });
  if (allSunk(state.playerShips)) {
    state.winner = "cpu";
    state.phase = "over";
    return { ...res, winner: "cpu" };
  }
  state.turn = "player";
  return res;
}
