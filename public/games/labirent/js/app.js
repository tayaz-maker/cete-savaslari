/**
 * Labirent — TLab Edition · arayüz katmanı.
 * TarikLab özgün uygulaması. Kurallar `maze.js` içinde; burada yalnız
 * SVG çizimi, girdi ve yerel kayıt var.
 */
import {
  DIFFICULTY_IDS,
  DIRECTIONS,
  codeFromSeed,
  formatDuration,
  generateMaze,
  gradeRun,
  isExit,
  isOpen,
  seedFromCode,
  solveMaze,
  tryMove,
} from "./maze.js?v=1";

const STORAGE_KEY = "tlab.labirent.v1";
const CELL = 10;
const PAD = 6;

const el = (id) => document.getElementById(id);
const board = el("board");
const statusLine = el("board-status");
const dialog = el("result");

const state = {
  maze: null,
  position: { row: 0, col: 0 },
  trail: [],
  moves: 0,
  startedAt: 0,
  elapsed: 0,
  running: false,
  finished: false,
  shortest: 0,
  timer: 0,
};

/* ---------- yerel kayıt ---------- */

function readBest() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Eski/yabancı bir kayıt şekli oyunu bozamaz: yalnız tanıdığımız
    // alanları, doğru tipte olmak şartıyla alırız.
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const clean = {};
    for (const id of DIFFICULTY_IDS) {
      const entry = parsed[id];
      if (!entry || typeof entry !== "object") continue;
      const moves = Number(entry.moves);
      const ms = Number(entry.ms);
      if (Number.isFinite(moves) && moves > 0 && Number.isFinite(ms) && ms >= 0) {
        clean[id] = { moves: Math.floor(moves), ms: Math.floor(ms) };
      }
    }
    return clean;
  } catch {
    return {};
  }
}

function writeBest(best) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
  } catch {
    /* depolama kapalıysa oyun yine de oynanır */
  }
}

function renderBestLine() {
  const best = readBest()[currentDifficulty()];
  el("best-line").textContent = best
    ? `Bu zorluktaki en iyin: ${best.moves} hamle · ${formatDuration(best.ms)}`
    : "Bu zorlukta henüz kayıtlı derecen yok.";
}

/* ---------- çizim ---------- */

const currentDifficulty = () => el("difficulty").value;

function svgEl(name, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

function drawMaze() {
  const maze = state.maze;
  const width = maze.cols * CELL + PAD * 2;
  const height = maze.rows * CELL + PAD * 2;
  board.setAttribute("viewBox", `0 0 ${width} ${height}`);
  board.setAttribute("aria-label", `${maze.rows}x${maze.cols} labirent, kod ${maze.code}`);
  board.replaceChildren();

  board.append(
    svgEl("rect", {
      x: PAD - 2,
      y: PAD - 2,
      width: maze.cols * CELL + 4,
      height: maze.rows * CELL + 4,
      rx: 2,
      class: "frame",
    }),
  );

  // Duvarlar tek bir path'te toplanır: 21x21'de bile birkaç yüz düğüm
  // yerine tek düğüm çizilir.
  const segments = [];
  for (let row = 0; row < maze.rows; row += 1) {
    for (let col = 0; col < maze.cols; col += 1) {
      const x = PAD + col * CELL;
      const y = PAD + row * CELL;
      const north = DIRECTIONS[0];
      const west = DIRECTIONS[3];
      if (!isOpen(maze, row, col, north)) segments.push(`M${x} ${y}h${CELL}`);
      if (!isOpen(maze, row, col, west)) segments.push(`M${x} ${y}v${CELL}`);
      if (col === maze.cols - 1) segments.push(`M${x + CELL} ${y}v${CELL}`);
      if (row === maze.rows - 1) segments.push(`M${x} ${y + CELL}h${CELL}`);
    }
  }
  board.append(svgEl("path", { d: segments.join(""), class: "wall" }));

  const exitCx = PAD + maze.exit.col * CELL + CELL / 2;
  const exitCy = PAD + maze.exit.row * CELL + CELL / 2;
  board.append(svgEl("circle", { cx: exitCx, cy: exitCy, r: CELL * 0.32, class: "exit-ring" }));
  board.append(svgEl("circle", { cx: exitCx, cy: exitCy, r: CELL * 0.13, class: "exit-core" }));

  const trail = svgEl("path", { d: "", class: "trail-line" });
  trail.id = "trail";
  board.append(trail);

  // Oyuncu: eşkenar dörtgen — klasik "nokta" yerine TLab'a özgü rota işareti.
  const runner = svgEl("path", { d: runnerPath(), class: "runner" });
  runner.id = "runner";
  board.append(runner);
  positionRunner();
}

function runnerPath() {
  const r = CELL * 0.3;
  return `M0 ${-r}L${r} 0L0 ${r}L${-r} 0Z`;
}

function positionRunner() {
  const runner = document.getElementById("runner");
  if (!runner) return;
  const x = PAD + state.position.col * CELL + CELL / 2;
  const y = PAD + state.position.row * CELL + CELL / 2;
  runner.setAttribute("transform", `translate(${x} ${y})`);
}

function drawTrail() {
  const trail = document.getElementById("trail");
  if (!trail) return;
  if (state.trail.length < 2) {
    trail.setAttribute("d", "");
    return;
  }
  const d = state.trail
    .map((cell, index) => {
      const x = PAD + cell.col * CELL + CELL / 2;
      const y = PAD + cell.row * CELL + CELL / 2;
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join("");
  trail.setAttribute("d", d);
}

/* ---------- oyun akışı ---------- */

function setStatus(text) {
  statusLine.textContent = text;
}

function tick() {
  if (!state.running) return;
  state.elapsed = Date.now() - state.startedAt;
  el("stat-time").textContent = formatDuration(state.elapsed);
}

function startClock() {
  if (state.running || state.finished) return;
  state.running = true;
  state.startedAt = Date.now() - state.elapsed;
  state.timer = window.setInterval(tick, 250);
}

function stopClock() {
  state.running = false;
  window.clearInterval(state.timer);
  state.timer = 0;
}

function resetRun() {
  stopClock();
  state.position = { ...state.maze.start };
  state.trail = [{ ...state.maze.start }];
  state.moves = 0;
  state.elapsed = 0;
  state.finished = false;
  el("stat-time").textContent = "00:00";
  el("stat-moves").textContent = "0";
  el("stat-optimal").textContent = String(state.shortest);
  drawTrail();
  positionRunner();
  setStatus("Başlangıçtasın. Sağ alttaki hedefe ulaş.");
}

function loadMaze(seed, difficulty) {
  const maze = generateMaze({ difficulty, seed });
  const path = solveMaze(maze);
  // Üretici her zaman çözülebilir labirent verir; yine de doğrularız.
  if (!path) {
    loadMaze((seed + 1) >>> 0, difficulty);
    return;
  }
  state.maze = maze;
  state.shortest = path.length - 1;
  el("seed-code").textContent = maze.code;
  drawMaze();
  resetRun();
  renderBestLine();
}

function newMaze() {
  // Tohum saatten türer ama üretim tohumdan sonra tamamen deterministiktir.
  loadMaze((Date.now() ^ (performance.now() * 1000)) >>> 0, currentDifficulty());
}

function finish() {
  stopClock();
  state.finished = true;
  const { grade, note } = gradeRun({ moves: state.moves, shortestPath: state.shortest + 1 });

  const best = readBest();
  const previous = best[state.maze.difficulty];
  const isBetter =
    !previous ||
    state.moves < previous.moves ||
    (state.moves === previous.moves && state.elapsed < previous.ms);
  if (isBetter) {
    best[state.maze.difficulty] = { moves: state.moves, ms: state.elapsed };
    writeBest(best);
  }
  renderBestLine();

  el("result-grade").textContent = grade;
  el("result-note").textContent = isBetter ? `${note} Yeni kişisel rekor.` : note;
  el("result-time").textContent = formatDuration(state.elapsed);
  el("result-moves").textContent = String(state.moves);
  el("result-optimal").textContent = String(state.shortest);
  el("result-code").textContent = state.maze.code;
  setStatus(`Çıkışa ulaştın — ${grade}.`);
  if (typeof dialog.showModal === "function") dialog.showModal();
}

function move(key) {
  if (state.finished || !state.maze) return;
  const direction = DIRECTIONS.find((item) => item.key === key);
  if (!direction) return;
  const next = tryMove(state.maze, state.position, direction);
  if (!next) {
    setStatus("Bu yönde duvar var.");
    return;
  }
  startClock();
  state.position = next;
  state.moves += 1;
  // Geri dönüşte iz uzamaz, kısalır: rota gerçekten gidilen yolu gösterir.
  const previous = state.trail[state.trail.length - 2];
  if (previous && previous.row === next.row && previous.col === next.col) state.trail.pop();
  else state.trail.push({ ...next });

  el("stat-moves").textContent = String(state.moves);
  positionRunner();
  drawTrail();
  if (isExit(state.maze, state.position)) finish();
  else setStatus("Yoldasın.");
}

/* ---------- girdi ---------- */

const KEY_MAP = {
  ArrowUp: "N",
  ArrowRight: "E",
  ArrowDown: "S",
  ArrowLeft: "W",
  w: "N",
  d: "E",
  s: "S",
  a: "W",
};

window.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
  const key = KEY_MAP[event.key] || KEY_MAP[event.key?.toLowerCase?.()];
  if (!key) return;
  event.preventDefault();
  move(key);
});

for (const button of document.querySelectorAll(".dpad button")) {
  button.addEventListener("click", () => move(button.dataset.dir));
}

// Kaydırma: tek dokunuşla bir hücre. Eşik, yanlışlıkla tetiklenmeyi önler.
let touchStart = null;
board.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  },
  { passive: true },
);
board.addEventListener("touchend", (event) => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "E" : "W") : dy > 0 ? "S" : "N");
});

el("new-maze").addEventListener("click", newMaze);
el("restart").addEventListener("click", () => {
  resetRun();
  setStatus("Aynı labirent, baştan.");
});
el("difficulty").addEventListener("change", newMaze);

const seedDialog = el("seed-dialog");
const seedInput = el("seed-input");

el("load-seed").addEventListener("click", () => {
  seedInput.value = state.maze?.code ?? "";
  if (typeof seedDialog.showModal === "function") seedDialog.showModal();
  seedInput.focus();
  seedInput.select();
});

seedDialog.addEventListener("close", () => {
  if (seedDialog.returnValue !== "load") return;
  const trimmed = seedInput.value.trim();
  if (!trimmed) {
    setStatus("Kod boş bırakıldı; labirent değişmedi.");
    return;
  }
  const seed = seedFromCode(trimmed);
  loadMaze(seed, currentDifficulty());
  // Girilen kod normalleştirilmiş koda eşlenir; oyuncu ne oynadığını görür.
  setStatus(`Kod yüklendi: ${codeFromSeed(seed)}`);
});

dialog.addEventListener("close", () => {
  if (dialog.returnValue === "again") newMaze();
});

newMaze();
