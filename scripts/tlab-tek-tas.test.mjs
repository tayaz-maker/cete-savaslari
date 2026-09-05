import test from "node:test";
import assert from "node:assert/strict";
import {
  CENTER,
  EMPTY,
  HOLE_COUNT,
  PEG,
  SIZE,
  VOID,
  allMoves,
  applyMove,
  cellAt,
  createGame,
  gameStatus,
  gradeGame,
  hasMoves,
  isCenterFinish,
  isLegalMove,
  isPlayable,
  movesFrom,
  pegCount,
  restart,
  suggestMove,
  undoMove,
} from "../public/games/peg-solitaire/js/solitaire.js";

test("başlangıç tahtası klasik İngiliz haçıdır", () => {
  const game = createGame();
  assert.equal(HOLE_COUNT, 33, "oynanabilir delik sayısı 33 olmalı");
  assert.equal(pegCount(game), 32, "başlangıçta 32 taş olmalı");
  assert.equal(cellAt(game, CENTER.row, CENTER.col), EMPTY, "orta delik boş olmalı");
  assert.equal(game.moves, 0);
  assert.equal(game.history.length, 0);
  // Köşe blokları tahtanın dışındadır.
  for (const [row, col] of [
    [0, 0],
    [0, 6],
    [6, 0],
    [6, 6],
    [1, 1],
    [5, 5],
  ]) {
    assert.equal(isPlayable(row, col), false, `${row},${col} oynanabilir olmamalı`);
    assert.equal(cellAt(game, row, col), VOID);
  }
  // Kollar ve merkez oynanabilir.
  for (const [row, col] of [
    [0, 3],
    [3, 0],
    [3, 6],
    [6, 3],
    [3, 3],
  ]) {
    assert.equal(isPlayable(row, col), true, `${row},${col} oynanabilir olmalı`);
  }
});

test("açılışta tam olarak dört yasal hamle vardır ve hepsi merkeze gider", () => {
  const game = createGame();
  const moves = allMoves(game);
  assert.equal(moves.length, 4, "klasik açılışta dört atlayış olmalı");
  for (const move of moves) {
    assert.deepEqual(move.to, { row: CENTER.row, col: CENTER.col }, "hepsi merkeze inmeli");
  }
});

test("yasal atlayış üç deliği de doğru günceller", () => {
  const game = createGame();
  const from = { row: 1, col: 3 };
  const over = { row: 2, col: 3 };
  const to = { row: 3, col: 3 };
  assert.equal(cellAt(game, from.row, from.col), PEG);
  assert.equal(cellAt(game, over.row, over.col), PEG);
  assert.equal(cellAt(game, to.row, to.col), EMPTY);

  const result = applyMove(game, from, to);
  assert.equal(result.ok, true);
  assert.equal(cellAt(game, from.row, from.col), EMPTY, "kaynak boşalmalı");
  assert.equal(cellAt(game, over.row, over.col), EMPTY, "atlanan taş kalkmalı");
  assert.equal(cellAt(game, to.row, to.col), PEG, "hedef dolmalı");
  assert.equal(pegCount(game), 31, "her atlayış bir taş eksiltir");
  assert.equal(game.moves, 1);
});

test("kurallara uymayan atlayışlar tahtayı hiç değiştirmez", () => {
  const game = createGame();
  const before = Array.from(game.cells);
  const illegal = [
    [{ row: 1, col: 3 }, { row: 1, col: 5 }], // hedef dolu
    [{ row: 1, col: 3 }, { row: 4, col: 3 }], // üç delik uzağa atlama yok
    [{ row: 1, col: 2 }, { row: 3, col: 4 }], // çapraz
    [{ row: 3, col: 3 }, { row: 1, col: 3 }], // kaynak boş
    [{ row: 0, col: 2 }, { row: 2, col: 2 }], // kaynak tahta dışı
    [{ row: 2, col: 3 }, { row: 2, col: 3 }], // yerinde durma
  ];
  for (const [from, to] of illegal) {
    const result = applyMove(game, from, to);
    assert.equal(result.ok, false, `${JSON.stringify(from)}→${JSON.stringify(to)} yasal olmamalı`);
    assert.ok(result.reason, "reddin bir gerekçesi olmalı");
  }
  assert.deepEqual(Array.from(game.cells), before, "reddedilen hamle tahtayı bozmamalı");
  assert.equal(game.moves, 0, "reddedilen hamle sayaca yazılmamalı");
  assert.equal(game.history.length, 0);
});

test("isLegalMove uygulama ile aynı kararı verir", () => {
  const game = createGame();
  assert.equal(isLegalMove(game, { row: 1, col: 3 }, { row: 3, col: 3 }), true);
  assert.equal(isLegalMove(game, { row: 1, col: 3 }, { row: 1, col: 5 }), false);
  for (const move of allMoves(game)) {
    assert.equal(isLegalMove(game, move.from, move.to), true);
  }
});

test("geri alma tahtayı bit bit eski durumuna döndürür", () => {
  const game = createGame();
  const snapshot = Array.from(game.cells);
  assert.equal(applyMove(game, { row: 1, col: 3 }, { row: 3, col: 3 }).ok, true);
  const afterFirst = Array.from(game.cells);
  // (1,3) ve (2,3) boşaldığı için bu ikinci atlayış artık yasaldır.
  assert.equal(applyMove(game, { row: 2, col: 1 }, { row: 2, col: 3 }).ok, true);
  assert.equal(game.moves, 2);

  assert.equal(undoMove(game).ok, true);
  assert.deepEqual(Array.from(game.cells), afterFirst, "bir geri alma bir hamleyi siler");
  assert.equal(game.moves, 1);

  assert.equal(undoMove(game).ok, true);
  assert.deepEqual(Array.from(game.cells), snapshot, "başlangıca tam dönülmeli");
  assert.equal(game.moves, 0);
  assert.equal(pegCount(game), 32);

  const empty = undoMove(game);
  assert.equal(empty.ok, false, "boş geçmişte geri alma reddedilir");
  assert.deepEqual(Array.from(game.cells), snapshot, "reddedilen geri alma tahtayı bozmaz");
});

test("yeniden kurma sayaçları ve geçmişi de sıfırlar", () => {
  const game = createGame();
  applyMove(game, { row: 1, col: 3 }, { row: 3, col: 3 });
  applyMove(game, { row: 2, col: 1 }, { row: 2, col: 3 });
  restart(game);
  assert.equal(pegCount(game), 32);
  assert.equal(game.moves, 0);
  assert.equal(game.history.length, 0);
  assert.deepEqual(Array.from(game.cells), Array.from(createGame().cells));
});

test("hamle kalmadığında oyun biter ve gerekçesi bildirilir", () => {
  const game = createGame();
  // Tahtayı elle kilitli bir duruma getir: birbirine uzak iki taş.
  game.cells.fill(0);
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (isPlayable(row, col)) game.cells[row * SIZE + col] = EMPTY;
    }
  }
  game.cells[0 * SIZE + 2] = PEG;
  game.cells[6 * SIZE + 4] = PEG;
  assert.equal(hasMoves(game), false, "uzak taşlar atlayamaz");
  const status = gameStatus(game);
  assert.equal(status.over, true);
  assert.equal(status.reason, "stuck");
  assert.equal(status.remaining, 2);
});

test("tek taş kalınca oyun çözülmüş sayılır; merkez ayrıca anılır", () => {
  const game = createGame();
  const clear = () => {
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (isPlayable(row, col)) game.cells[row * SIZE + col] = EMPTY;
      }
    }
  };

  clear();
  game.cells[CENTER.row * SIZE + CENTER.col] = PEG;
  assert.equal(isCenterFinish(game), true);
  let status = gameStatus(game);
  assert.equal(status.over, true);
  assert.equal(status.reason, "solved");
  assert.equal(status.grade, "Usta");

  clear();
  game.cells[0 * SIZE + 2] = PEG;
  assert.equal(isCenterFinish(game), false);
  status = gameStatus(game);
  assert.equal(status.reason, "solved");
  assert.equal(status.grade, "Kusursuz");
});

test("derece kalan taş sayısına göre anlamlı biçimde düşer", () => {
  const build = (remaining) => {
    const game = createGame();
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (isPlayable(row, col)) game.cells[row * SIZE + col] = EMPTY;
      }
    }
    let placed = 0;
    for (let row = 0; row < SIZE && placed < remaining; row += 1) {
      for (let col = 0; col < SIZE && placed < remaining; col += 1) {
        if (isPlayable(row, col)) {
          game.cells[row * SIZE + col] = PEG;
          placed += 1;
        }
      }
    }
    return game;
  };
  assert.equal(gradeGame(build(2)).grade, "Çok iyi");
  assert.equal(gradeGame(build(4)).grade, "İyi");
  assert.equal(gradeGame(build(7)).grade, "Geçer");
  assert.equal(gradeGame(build(15)).grade, "Deneme");
  assert.equal(gradeGame(build(2)).remaining, 2);
});

test("ipucu her zaman gerçekten yasal bir hamle önerir", () => {
  const game = createGame();
  for (let step = 0; step < 12; step += 1) {
    const hint = suggestMove(game);
    if (!hasMoves(game)) {
      assert.equal(hint, null, "hamle yokken öneri de olmamalı");
      break;
    }
    assert.ok(hint, "hamle varken öneri gelmeli");
    assert.equal(isLegalMove(game, hint.from, hint.to), true, "öneri yasal olmalı");
    assert.equal(applyMove(game, hint.from, hint.to).ok, true, "öneri uygulanabilmeli");
  }
  assert.ok(game.moves > 0, "ipucuyla ilerleme kaydedilmeli");
});

test("uzun bir oyun boyunca taş sayısı ve hamle sayacı tutarlı kalır", () => {
  const game = createGame();
  let guard = 0;
  while (hasMoves(game) && guard < 40) {
    const move = suggestMove(game);
    const before = pegCount(game);
    assert.equal(applyMove(game, move.from, move.to).ok, true);
    assert.equal(pegCount(game), before - 1, "her hamle tam bir taş eksiltir");
    guard += 1;
  }
  assert.equal(game.moves, guard, "hamle sayacı yapılan hamleyle eşleşmeli");
  assert.equal(game.history.length, guard, "geçmiş her hamleyi tutmalı");
  assert.equal(pegCount(game), 32 - guard, "kalan taş = 32 − hamle");
  // Bütün oyunu geri alabilmeliyiz.
  while (game.history.length) assert.equal(undoMove(game).ok, true);
  assert.equal(pegCount(game), 32);
  assert.deepEqual(Array.from(game.cells), Array.from(createGame().cells));
});

test("movesFrom yalnız dolu deliklerden ve yalnız yasal yönlerde üretir", () => {
  const game = createGame();
  assert.deepEqual(movesFrom(game, CENTER.row, CENTER.col), [], "boş delikten hamle çıkmaz");
  assert.deepEqual(movesFrom(game, 0, 0), [], "tahta dışından hamle çıkmaz");
  const fromArm = movesFrom(game, 1, 3);
  assert.equal(fromArm.length, 1);
  assert.equal(fromArm[0].key, "S");
  assert.deepEqual(fromArm[0].over, { row: 2, col: 3 });
});
