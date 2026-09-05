/**
 * Tek Taş — TLab Edition
 * TarikLab özgün uygulaması. Saf oyun çekirdeği: DOM yok, tarayıcı yok.
 *
 * Klasik İngiliz haçı: 7×7 ızgaradan dört köşedeki 3×3 bloklar çıkarılır,
 * geriye 33 delik kalır. Başlangıçta orta delik boş, kalan 32 delikte taş
 * vardır. Bir taş, yanındaki taşın üzerinden iki delik ötedeki boş deliğe
 * atlar; atlanan taş kalkar. Amaç tek taş bırakmaktır.
 */

export const SIZE = 7;

/** Delik durumları. `VOID` tahtanın dışı, oynanmaz. */
export const VOID = 0;
export const EMPTY = 1;
export const PEG = 2;

export const STEPS = Object.freeze([
  { dr: -1, dc: 0, key: "N" },
  { dr: 0, dc: 1, key: "E" },
  { dr: 1, dc: 0, key: "S" },
  { dr: 0, dc: -1, key: "W" },
]);

export const index = (row, col) => row * SIZE + col;
export const rowOf = (i) => Math.floor(i / SIZE);
export const colOf = (i) => i % SIZE;

/** Bir kare tahtanın oynanabilir kısmında mı? Köşe blokları dışarıdadır. */
export function isPlayable(row, col) {
  if (row < 0 || col < 0 || row >= SIZE || col >= SIZE) return false;
  const inCornerBand = (value) => value < 2 || value > 4;
  return !(inCornerBand(row) && inCornerBand(col));
}

export const CENTER = Object.freeze({ row: 3, col: 3 });

/** Oynanabilir delik sayısı — İngiliz haçında 33. */
export const HOLE_COUNT = (() => {
  let total = 0;
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) if (isPlayable(row, col)) total += 1;
  }
  return total;
})();

/** Başlangıç konumu: orta boş, diğer bütün delikler dolu. */
export function createGame() {
  const cells = new Uint8Array(SIZE * SIZE).fill(VOID);
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (!isPlayable(row, col)) continue;
      cells[index(row, col)] = row === CENTER.row && col === CENTER.col ? EMPTY : PEG;
    }
  }
  return { cells, moves: 0, history: [] };
}

export const cellAt = (game, row, col) =>
  isPlayable(row, col) ? game.cells[index(row, col)] : VOID;

export const pegCount = (game) => {
  let total = 0;
  for (let i = 0; i < game.cells.length; i += 1) if (game.cells[i] === PEG) total += 1;
  return total;
};

/**
 * Verilen taşın yapabileceği yasal atlayışlar.
 * Kaynak dolu, atlanan dolu, hedef boş olmalıdır.
 */
export function movesFrom(game, row, col) {
  if (cellAt(game, row, col) !== PEG) return [];
  const legal = [];
  for (const step of STEPS) {
    const overRow = row + step.dr;
    const overCol = col + step.dc;
    const toRow = row + step.dr * 2;
    const toCol = col + step.dc * 2;
    if (cellAt(game, overRow, overCol) !== PEG) continue;
    if (cellAt(game, toRow, toCol) !== EMPTY) continue;
    legal.push({
      from: { row, col },
      over: { row: overRow, col: overCol },
      to: { row: toRow, col: toCol },
      key: step.key,
    });
  }
  return legal;
}

/** Tahtadaki bütün yasal hamleler. Boşsa oyun bitmiştir. */
export function allMoves(game) {
  const legal = [];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) legal.push(...movesFrom(game, row, col));
  }
  return legal;
}

export const hasMoves = (game) => allMoves(game).length > 0;

const sameCell = (a, b) => Boolean(a) && Boolean(b) && a.row === b.row && a.col === b.col;

/** Bir hamlenin şu an gerçekten yasal olup olmadığını doğrular. */
export function isLegalMove(game, from, to) {
  return movesFrom(game, from.row, from.col).some((move) => sameCell(move.to, to));
}

/**
 * Hamleyi uygular. Yasal değilse tahta değişmez ve `ok:false` döner —
 * çağıran tarafın önceden doğrulama yapmasına gerek yoktur.
 */
export function applyMove(game, from, to) {
  const move = movesFrom(game, from.row, from.col).find((item) => sameCell(item.to, to));
  if (!move) return { ok: false, reason: "Bu atlayış kurallara uymuyor." };
  game.cells[index(move.from.row, move.from.col)] = EMPTY;
  game.cells[index(move.over.row, move.over.col)] = EMPTY;
  game.cells[index(move.to.row, move.to.col)] = PEG;
  game.moves += 1;
  game.history.push(move);
  return { ok: true, move };
}

/** Son hamleyi tam olarak geri alır: üç delik de eski durumuna döner. */
export function undoMove(game) {
  const move = game.history.pop();
  if (!move) return { ok: false, reason: "Geri alınacak hamle yok." };
  game.cells[index(move.to.row, move.to.col)] = EMPTY;
  game.cells[index(move.over.row, move.over.col)] = PEG;
  game.cells[index(move.from.row, move.from.col)] = PEG;
  game.moves -= 1;
  return { ok: true, move };
}

export function restart(game) {
  const fresh = createGame();
  game.cells.set(fresh.cells);
  game.moves = 0;
  game.history.length = 0;
  return game;
}

/** Kalan taşın merkezde olup olmadığı — klasik "tam çözüm" ölçütü. */
export const isCenterFinish = (game) =>
  pegCount(game) === 1 && cellAt(game, CENTER.row, CENTER.col) === PEG;

/**
 * TLab derecesi: kalan taş sayısı azaldıkça yükselir. Tek taş merkezde
 * kalırsa klasik çözümün kendisidir ve ayrıca anılır.
 */
export function gradeGame(game) {
  const remaining = pegCount(game);
  if (remaining === 1) {
    return isCenterFinish(game)
      ? { grade: "Usta", remaining, note: "Tek taş, tam merkezde. Klasik çözüm." }
      : { grade: "Kusursuz", remaining, note: "Tek taş kaldı." };
  }
  if (remaining === 2) return { grade: "Çok iyi", remaining, note: "Kıl payı." };
  if (remaining <= 4) return { grade: "İyi", remaining, note: "Sağlam bir tahta okuması." };
  if (remaining <= 8) return { grade: "Geçer", remaining, note: "Fena değil." };
  return { grade: "Deneme", remaining, note: "Taşlar erken sıkıştı." };
}

/** Oyun durumu: devam mı, bitti mi, neden bitti? */
export function gameStatus(game) {
  const remaining = pegCount(game);
  if (remaining === 1) return { over: true, reason: "solved", ...gradeGame(game) };
  if (!hasMoves(game)) return { over: true, reason: "stuck", ...gradeGame(game) };
  return { over: false, reason: "playing", remaining };
}

/**
 * İpucu: en çok devam seçeneği bırakan hamleyi önerir. Tam çözücü değildir
 * ve öyleymiş gibi sunulmaz — yalnız tahtayı erken kilitlemeyen bir adım
 * gösterir.
 */
export function suggestMove(game) {
  const options = allMoves(game);
  if (!options.length) return null;
  let best = null;
  let bestScore = -1;
  for (const move of options) {
    const probe = { cells: Uint8Array.from(game.cells), moves: 0, history: [] };
    applyMove(probe, move.from, move.to);
    const score = allMoves(probe).length;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  return best;
}
