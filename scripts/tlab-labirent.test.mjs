import test from "node:test";
import assert from "node:assert/strict";
import {
  DIFFICULTIES,
  DIFFICULTY_IDS,
  DIRECTIONS,
  codeFromSeed,
  createRandom,
  formatDuration,
  generateMaze,
  gradeRun,
  isExit,
  isOpen,
  seedFromCode,
  solveMaze,
  tryMove,
} from "../public/games/labirent/js/maze.js";

const SEEDS = [1, 7, 42, 1337, 90210, 4294967295];

test("her zorlukta ve her tohumda labirent gerçekten çözülebilir", () => {
  for (const difficulty of DIFFICULTY_IDS) {
    for (const seed of SEEDS) {
      const maze = generateMaze({ difficulty, seed });
      const path = solveMaze(maze);
      assert.ok(path, `${difficulty}/${seed}: çözüm bulunamadı`);
      assert.deepEqual(path[0], maze.start, "yol başlangıçtan çıkmalı");
      assert.deepEqual(path[path.length - 1], maze.exit, "yol çıkışta bitmeli");
      // Yolun her adımı gerçekten açık bir geçiş olmalı.
      for (let i = 1; i < path.length; i += 1) {
        const from = path[i - 1];
        const to = path[i];
        const direction = DIRECTIONS.find(
          (d) => from.row + d.dr === to.row && from.col + d.dc === to.col,
        );
        assert.ok(direction, "ardışık hücreler komşu olmalı");
        assert.equal(isOpen(maze, from.row, from.col, direction), true, "adım duvardan geçemez");
      }
    }
  }
});

test("başlangıç ve çıkış geçerli, birbirinden farklı köşelerde", () => {
  for (const difficulty of DIFFICULTY_IDS) {
    const maze = generateMaze({ difficulty, seed: 11 });
    assert.deepEqual(maze.start, { row: 0, col: 0 });
    assert.deepEqual(maze.exit, { row: maze.rows - 1, col: maze.cols - 1 });
    assert.notDeepEqual(maze.start, maze.exit);
    assert.equal(isExit(maze, maze.exit), true);
    assert.equal(isExit(maze, maze.start), false);
  }
});

test("labirentin dış sınırı kapalıdır ve duvar hareketi engeller", () => {
  const maze = generateMaze({ difficulty: "orta", seed: 5 });
  const north = DIRECTIONS[0];
  const west = DIRECTIONS[3];
  for (let col = 0; col < maze.cols; col += 1) {
    assert.equal(isOpen(maze, 0, col, north), false, "üst kenar açık olamaz");
    assert.equal(tryMove(maze, { row: 0, col }, north), null, "kenardan dışarı çıkılamaz");
  }
  for (let row = 0; row < maze.rows; row += 1) {
    assert.equal(isOpen(maze, row, 0, west), false, "sol kenar açık olamaz");
  }
  // İç duvarlardan en az biri gerçekten hareketi engelliyor olmalı.
  let blocked = 0;
  for (let row = 0; row < maze.rows; row += 1) {
    for (let col = 0; col < maze.cols; col += 1) {
      for (const direction of DIRECTIONS) {
        const inside =
          row + direction.dr >= 0 &&
          col + direction.dc >= 0 &&
          row + direction.dr < maze.rows &&
          col + direction.dc < maze.cols;
        if (inside && !isOpen(maze, row, col, direction)) blocked += 1;
      }
    }
  }
  assert.ok(blocked > 0, "iç duvar bulunmalı");
});

test("aynı tohum aynı labirenti, farklı tohum farklı labirenti üretir", () => {
  const a = generateMaze({ difficulty: "orta", seed: 2024 });
  const b = generateMaze({ difficulty: "orta", seed: 2024 });
  assert.deepEqual(Array.from(a.cells), Array.from(b.cells), "aynı tohum belirlenimli olmalı");
  assert.equal(a.code, b.code);
  const c = generateMaze({ difficulty: "orta", seed: 2025 });
  assert.notDeepEqual(Array.from(a.cells), Array.from(c.cells), "farklı tohum farklı labirent");
});

test("meydan okuma kodu iki yönlü ve kararlıdır", () => {
  const seed = seedFromCode("TLAB01");
  assert.equal(seedFromCode("TLAB01"), seed, "aynı kod aynı tohumu vermeli");
  assert.equal(seedFromCode("tlab01"), seed, "kod büyük/küçük harfe duyarsız");
  assert.equal(seedFromCode(" TLAB01 "), seed, "boşluklar kırpılır");
  const code = codeFromSeed(seed);
  assert.match(code, /^[A-Z2-9]{6}$/, "kod okunabilir olmalı");
  assert.equal(codeFromSeed(seed), code, "kod üretimi belirlenimli");
  const maze = generateMaze({ difficulty: "kolay", seed });
  assert.equal(maze.code, code, "labirent kendi kodunu taşımalı");
});

test("zorluk boyutları farklı ve tanımlıdır", () => {
  const sizes = DIFFICULTY_IDS.map((id) => {
    const maze = generateMaze({ difficulty: id, seed: 3 });
    assert.equal(maze.rows, DIFFICULTIES[id].rows);
    assert.equal(maze.cols, DIFFICULTIES[id].cols);
    assert.equal(maze.cells.length, maze.rows * maze.cols);
    return maze.rows * maze.cols;
  });
  assert.ok(sizes[0] < sizes[1] && sizes[1] < sizes[2], "zorluk arttıkça alan büyümeli");
  // Bilinmeyen zorluk sessizce ortaya düşer, çökmez.
  const fallback = generateMaze({ difficulty: "bilinmeyen", seed: 3 });
  assert.equal(fallback.difficulty, "orta");
});

test("zor seviye tek çözümlü, kolay seviye daha bağışlayıcıdır", () => {
  // Mükemmel labirentte kenar sayısı hücre sayısının bir eksiğidir.
  const countOpenings = (maze) => {
    let open = 0;
    for (let row = 0; row < maze.rows; row += 1) {
      for (let col = 0; col < maze.cols; col += 1) {
        for (const direction of DIRECTIONS) {
          if (isOpen(maze, row, col, direction)) open += 1;
        }
      }
    }
    return open / 2;
  };
  const hard = generateMaze({ difficulty: "zor", seed: 99 });
  assert.equal(countOpenings(hard), hard.rows * hard.cols - 1, "zor seviye döngüsüz olmalı");
  const easy = generateMaze({ difficulty: "kolay", seed: 99 });
  assert.ok(countOpenings(easy) > easy.rows * easy.cols - 1, "kolay seviyede döngü açılmalı");
});

test("hareket sözleşmesi: geçerli adım ilerletir, duvar null döner", () => {
  const maze = generateMaze({ difficulty: "orta", seed: 8 });
  const path = solveMaze(maze);
  let position = { ...maze.start };
  let moves = 0;
  for (let i = 1; i < path.length; i += 1) {
    const direction = DIRECTIONS.find(
      (d) => position.row + d.dr === path[i].row && position.col + d.dc === path[i].col,
    );
    const next = tryMove(maze, position, direction);
    assert.ok(next, "çözüm yolundaki adım geçerli olmalı");
    position = next;
    moves += 1;
  }
  assert.equal(isExit(maze, position), true, "yol çıkışa varmalı");
  assert.equal(moves, path.length - 1);
  // Çıkışın sağına/aşağısına gidilemez.
  assert.equal(tryMove(maze, maze.exit, DIRECTIONS[1]), null);
  assert.equal(tryMove(maze, maze.exit, DIRECTIONS[2]), null);
});

test("üretim sonsuz döngüye girmez ve makul sürede biter", () => {
  const started = Date.now();
  for (let seed = 0; seed < 60; seed += 1) {
    const maze = generateMaze({ difficulty: "zor", seed });
    assert.ok(solveMaze(maze), `tohum ${seed} çözülebilir olmalı`);
  }
  assert.ok(Date.now() - started < 4000, "60 zor labirent 4 saniyenin altında üretilmeli");
});

test("tohum üreteci belirlenimli ve sınırlar içinde", () => {
  const first = createRandom(7);
  const second = createRandom(7);
  for (let i = 0; i < 200; i += 1) {
    const value = first();
    assert.equal(value, second(), "aynı tohum aynı diziyi vermeli");
    assert.ok(value >= 0 && value < 1, "değer [0,1) aralığında olmalı");
  }
  // Sıfır tohum bile çalışır duruma düşer.
  assert.ok(Number.isFinite(createRandom(0)()));
});

test("derece hamle ekonomisini ölçer, süreyi değil", () => {
  assert.equal(gradeRun({ moves: 20, shortestPath: 21 }).grade, "Kusursuz");
  assert.equal(gradeRun({ moves: 25, shortestPath: 21 }).grade, "Usta");
  assert.equal(gradeRun({ moves: 35, shortestPath: 21 }).grade, "İyi");
  assert.equal(gradeRun({ moves: 55, shortestPath: 21 }).grade, "Geçer");
  assert.equal(gradeRun({ moves: 200, shortestPath: 21 }).grade, "Dolambaçlı");
  // Bozuk girdi çökmemeli.
  assert.ok(gradeRun({ moves: 0, shortestPath: 0 }).grade);
});

test("süre biçimi dakika:saniye olarak okunur", () => {
  assert.equal(formatDuration(0), "00:00");
  assert.equal(formatDuration(1500), "00:01");
  assert.equal(formatDuration(61000), "01:01");
  assert.equal(formatDuration(-5), "00:00");
});
