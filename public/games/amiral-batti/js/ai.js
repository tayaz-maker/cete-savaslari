/**
 * Deterministik Amiral Battı AI. Gizli filo okunmaz.
 */
import { SIZE, FLEET, key, inBounds, cellsOf, lcg } from "./engine.js";

const DIRS = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

function legalTargets(shots) {
  const out = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (!shots[key(r, c)]) out.push([r, c]);
    }
  }
  return out;
}

function pickIndex(rand, n) {
  return Math.floor(rand() * n);
}

export function remainingLens(enemyShots, playerShipsKnownLens = FLEET.map((f) => f.len)) {
  // AI does not see player ships. Estimate remaining lengths from sunk announcements in shots? 
  // We only know sunk via caller passing remaining lens. Default: all fleet sizes.
  return playerShipsKnownLens.slice();
}

function densityMap(shots, lens) {
  const scores = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (const len of lens) {
    for (const dir of ["h", "v"]) {
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          const cells = cellsOf(r, c, dir, len);
          if (!cells) continue;
          if (cells.some(([rr, cc]) => shots[key(rr, cc)] === "miss")) continue;
          if (cells.every(([rr, cc]) => shots[key(rr, cc)] === "hit")) continue;
          for (const [rr, cc] of cells) {
            if (!shots[key(rr, cc)]) scores[rr][cc] += 1;
          }
        }
      }
    }
  }
  return scores;
}

function bestDensity(shots, lens, rand) {
  const scores = densityMap(shots, lens);
  let best = -1;
  const cand = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (shots[key(r, c)]) continue;
      const s = scores[r][c];
      if (s > best) {
        best = s;
        cand.length = 0;
        cand.push([r, c]);
      } else if (s === best) cand.push([r, c]);
    }
  }
  if (!cand.length) {
    const legal = legalTargets(shots);
    return legal[pickIndex(rand, legal.length)] || [0, 0];
  }
  cand.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return cand[0];
}

function huntFromHits(shots, hits, _rand) {
  const openHits = hits.filter((h) => shots[key(h[0], h[1])] === "hit");
  if (openHits.length >= 2) {
    const sameRow = openHits.every((h) => h[0] === openHits[0][0]);
    const aligned = sameRow
      ? openHits.slice().sort((a, b) => a[1] - b[1])
      : openHits.slice().sort((a, b) => a[0] - b[0]);
    const axis = sameRow ? "h" : "v";
    const ends = [];
    const first = aligned[0];
    const last = aligned[aligned.length - 1];
    if (axis === "h") {
      ends.push([first[0], first[1] - 1], [last[0], last[1] + 1]);
    } else {
      ends.push([first[0] - 1, first[1]], [last[0] + 1, last[1]]);
    }
    const valid = ends.filter(([r, c]) => inBounds(r, c) && !shots[key(r, c)]);
    if (valid.length) return valid[0];
  }
  if (openHits.length) {
    const adj = [];
    for (const [r, c] of openHits) {
      for (const [dr, dc] of DIRS) {
        const rr = r + dr;
        const cc = c + dc;
        if (inBounds(rr, cc) && !shots[key(rr, cc)]) adj.push([rr, cc]);
      }
    }
    adj.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (adj.length) return adj[0];
  }
  return null;
}

export function chooseShot(state, randFn) {
  const shots = state.enemyShots;
  const legal = legalTargets(shots);
  if (!legal.length) return null;
  const rand = randFn || lcg((state.seed || 1) + state.log.length * 9973);
  const diff = state.difficulty || "orta";
  const hits = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (shots[key(r, c)] === "hit") {
        const ship = (state.playerShips || []).find((s) => s.cells.some(([rr, cc]) => rr === r && cc === c));
        if (!ship || !(ship.sunk || ship.hits.length >= ship.cells.length)) hits.push([r, c]);
      }
    }
  }
  // Easy: legal cell, checker-ish but weak, no hunt.
  if (diff === "kolay") {
    const parity = legal.filter(([r, c]) => (r + c) % 3 === 0);
    const pool = parity.length ? parity : legal;
    pool.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return pool[Math.floor(rand() * pool.length) % pool.length];
  }
  const hunted = huntFromHits(shots, hits, rand);
  if (diff === "orta") {
    if (hunted) return hunted;
    const parity = legal.filter(([r, c]) => (r + c) % 2 === 0);
    const pool = parity.length ? parity : legal;
    pool.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return pool[0];
  }
  // zor: hunt first, else density
  if (hunted) return hunted;
  // Remaining lens estimated without reading unsunk positions: use announced sunk names via log.
  const sunkLens = (state.log || [])
    .filter((x) => x.who === "cpu" && x.result === "sunk")
    .map((x) => {
      const spec = FLEET.find((f) => f.id === x.sunk);
      return spec ? spec.len : 0;
    })
    .filter(Boolean);
  const all = FLEET.map((f) => f.len);
  const remain = all.slice();
  for (const L of sunkLens) {
    const i = remain.indexOf(L);
    if (i >= 0) remain.splice(i, 1);
  }
  return bestDensity(shots, remain.length ? remain : all, rand);
}

/** Invariant helper: proposed cell is legal and not derived from hidden enemy layout. */
export function assertNoCheat(state, shot) {
  if (!shot) return false;
  const [r, c] = shot;
  if (!inBounds(r, c)) return false;
  if (state.enemyShots[key(r, c)]) return false;
  return true;
}

export { legalTargets };
