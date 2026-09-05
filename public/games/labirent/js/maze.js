/**
 * Labirent — TLab Edition
 * TarikLab özgün uygulaması. Saf labirent çekirdeği: DOM yok, tarayıcı yok.
 *
 * Hücre duvarları bit maskesiyle tutulur. Bir hücre 4 bitlik bir sayıdır ve
 * her bit "o yönde duvar var mı" sorusunu yanıtlar. Böylece komşu iki hücre
 * arasındaki geçiş iki tarafta da aynı anda açılır; ayrık duvar listesi
 * tutmaya gerek kalmaz.
 */

export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

/** Yön tablosu: her yön için bit, satır/sütun kayması ve karşıt bit. */
export const DIRECTIONS = Object.freeze([
  { bit: N, dr: -1, dc: 0, opposite: S, key: "N" },
  { bit: E, dr: 0, dc: 1, opposite: W, key: "E" },
  { bit: S, dr: 1, dc: 0, opposite: N, key: "S" },
  { bit: W, dr: 0, dc: -1, opposite: E, key: "W" },
]);

export const DIFFICULTIES = Object.freeze({
  kolay: { id: "kolay", label: "Kolay", cols: 9, rows: 9, braid: 0.18 },
  orta: { id: "orta", label: "Orta", cols: 15, rows: 15, braid: 0.08 },
  zor: { id: "zor", label: "Zor", cols: 21, rows: 21, braid: 0 },
});

export const DIFFICULTY_IDS = Object.freeze(["kolay", "orta", "zor"]);

/**
 * Tohumdan türeyen deterministik sayı üreteci (mulberry32 ailesi).
 * Aynı tohum her zaman aynı labirenti verir; `Math.random` kullanılmaz.
 */
export function createRandom(seed) {
  let state = (Number.isFinite(seed) ? Math.floor(seed) : 1) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Metin bir tohum kodunu (paylaşılabilir "meydan okuma" kodu) sayıya çevirir. */
export function seedFromCode(code) {
  const text = String(code ?? "").trim().toUpperCase();
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Sayıyı okunabilir, paylaşılabilir bir koda çevirir. */
export function codeFromSeed(seed) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = (seed >>> 0) || 1;
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[value % alphabet.length];
    value = Math.floor(value / alphabet.length) + 7;
  }
  return out;
}

export const cellIndex = (maze, row, col) => row * maze.cols + col;

export const inBounds = (maze, row, col) =>
  row >= 0 && col >= 0 && row < maze.rows && col < maze.cols;

/** İki komşu hücre arasında geçiş var mı? */
export function isOpen(maze, row, col, direction) {
  if (!inBounds(maze, row, col)) return false;
  const target = { row: row + direction.dr, col: col + direction.dc };
  if (!inBounds(maze, target.row, target.col)) return false;
  return (maze.cells[cellIndex(maze, row, col)] & direction.bit) === 0;
}

function carve(maze, row, col, direction) {
  maze.cells[cellIndex(maze, row, col)] &= ~direction.bit;
  maze.cells[cellIndex(maze, row + direction.dr, col + direction.dc)] &= ~direction.opposite;
}

/**
 * Labirenti üretir. Yöntem: yinelemeli geri izleme (derinlik öncelikli),
 * kendi yığınımızla — özyineleme yok, bu yüzden 21×21'de de yığın taşmaz.
 *
 * `braid` oranı kadar çıkmaz sokak açılır: kolay seviyede labirent daha
 * bağışlayıcı, zor seviyede tek çözümlü mükemmel labirent kalır.
 */
export function generateMaze({ difficulty = "orta", seed = 1 } = {}) {
  const config = DIFFICULTIES[difficulty] || DIFFICULTIES.orta;
  const { cols, rows } = config;
  const random = createRandom(seed);
  const maze = {
    cols,
    rows,
    difficulty: config.id,
    seed: seed >>> 0,
    code: codeFromSeed(seed),
    cells: new Uint8Array(cols * rows).fill(N | E | S | W),
    start: { row: 0, col: 0 },
    exit: { row: rows - 1, col: cols - 1 },
  };

  const visited = new Uint8Array(cols * rows);
  const stack = [maze.start];
  visited[cellIndex(maze, 0, 0)] = 1;

  while (stack.length) {
    const current = stack[stack.length - 1];
    const options = [];
    for (const direction of DIRECTIONS) {
      const row = current.row + direction.dr;
      const col = current.col + direction.dc;
      if (inBounds(maze, row, col) && !visited[cellIndex(maze, row, col)]) options.push(direction);
    }
    if (!options.length) {
      stack.pop();
      continue;
    }
    const direction = options[Math.floor(random() * options.length)];
    carve(maze, current.row, current.col, direction);
    const next = { row: current.row + direction.dr, col: current.col + direction.dc };
    visited[cellIndex(maze, next.row, next.col)] = 1;
    stack.push(next);
  }

  if (config.braid > 0) braid(maze, random, config.braid);
  return maze;
}

/** Çıkmaz sokakların bir kısmını komşuya bağlayarak dolaşımı yumuşatır. */
function braid(maze, random, ratio) {
  const deadEnds = [];
  for (let row = 0; row < maze.rows; row += 1) {
    for (let col = 0; col < maze.cols; col += 1) {
      let openings = 0;
      for (const direction of DIRECTIONS) if (isOpen(maze, row, col, direction)) openings += 1;
      if (openings === 1) deadEnds.push({ row, col });
    }
  }
  for (const cell of deadEnds) {
    if (random() >= ratio) continue;
    const blocked = DIRECTIONS.filter((direction) => {
      const row = cell.row + direction.dr;
      const col = cell.col + direction.dc;
      return inBounds(maze, row, col) && !isOpen(maze, cell.row, cell.col, direction);
    });
    if (!blocked.length) continue;
    carve(maze, cell.row, cell.col, blocked[Math.floor(random() * blocked.length)]);
  }
}

/**
 * Genişlik öncelikli arama ile başlangıçtan çıkışa en kısa yolu döner.
 * Yol yoksa `null`. Testler bu fonksiyonla labirentin çözülebilirliğini
 * doğrular — üreticiye güvenmek yerine gerçekten arar.
 */
export function solveMaze(maze) {
  const total = maze.cols * maze.rows;
  const previous = new Int32Array(total).fill(-1);
  const seen = new Uint8Array(total);
  const startIndex = cellIndex(maze, maze.start.row, maze.start.col);
  const exitIndex = cellIndex(maze, maze.exit.row, maze.exit.col);
  const queue = [startIndex];
  seen[startIndex] = 1;

  for (let head = 0; head < queue.length; head += 1) {
    const index = queue[head];
    if (index === exitIndex) break;
    const row = Math.floor(index / maze.cols);
    const col = index % maze.cols;
    for (const direction of DIRECTIONS) {
      if (!isOpen(maze, row, col, direction)) continue;
      const nextIndex = cellIndex(maze, row + direction.dr, col + direction.dc);
      if (seen[nextIndex]) continue;
      seen[nextIndex] = 1;
      previous[nextIndex] = index;
      queue.push(nextIndex);
    }
  }

  if (!seen[exitIndex]) return null;
  const path = [];
  for (let index = exitIndex; index !== -1; index = previous[index]) {
    path.push({ row: Math.floor(index / maze.cols), col: index % maze.cols });
    if (index === startIndex) break;
  }
  return path.reverse();
}

/** Oyuncunun bir yönde ilerlemesi geçerli mi ve nereye varır? */
export function tryMove(maze, position, direction) {
  if (!isOpen(maze, position.row, position.col, direction)) return null;
  return { row: position.row + direction.dr, col: position.col + direction.dc };
}

export const isExit = (maze, position) =>
  position.row === maze.exit.row && position.col === maze.exit.col;

/**
 * TLab tamamlama derecesi: en kısa yola ne kadar yaklaştığına bakar.
 * Süre değil hamle ekonomisi ölçülür — hızlı ama savrukça dolaşmak
 * ödüllendirilmez.
 */
export function gradeRun({ moves, shortestPath }) {
  const optimal = Math.max(1, (shortestPath || 1) - 1);
  const used = Math.max(1, moves);
  const ratio = used / optimal;
  if (ratio <= 1.05) return { grade: "Kusursuz", note: "En kısa yolu buldun." };
  if (ratio <= 1.35) return { grade: "Usta", note: "Neredeyse en kısa yol." };
  if (ratio <= 1.9) return { grade: "İyi", note: "Sağlam bir rota." };
  if (ratio <= 3) return { grade: "Geçer", note: "Biraz dolaştın." };
  return { grade: "Dolambaçlı", note: "Yol uzadı ama çıktın." };
}

export const formatDuration = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};
