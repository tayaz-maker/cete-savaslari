/**
 * Satranç — TLab Edition
 * TarikLab özgün kural motoru. DOM yok, bağımlılık yok.
 *
 * Tahta 8×8 tek boyutlu dizidir (0 = a8, 63 = h1). Taşlar
 * `{ type, color }` nesneleridir. Motor sözde-yasal hamleleri üretir,
 * ardından hamleyi uygulayıp kendi şahını tehdide açan varyantları eler —
 * bu, "kendi şahını açamazsın" kuralını tek bir yerde kesin biçimde çözer.
 */

export const WHITE = "w";
export const BLACK = "b";

export const PAWN = "p";
export const KNIGHT = "n";
export const BISHOP = "b";
export const ROOK = "r";
export const QUEEN = "q";
export const KING = "k";

const FILES = "abcdefgh";

export const squareIndex = (file, rank) => (8 - rank) * 8 + FILES.indexOf(file);
export const indexToSquare = (index) => `${FILES[index % 8]}${8 - Math.floor(index / 8)}`;
export const squareToIndex = (square) => squareIndex(square[0], Number(square[1]));
export const fileOf = (index) => index % 8;
export const rankOf = (index) => 8 - Math.floor(index / 8);
export const opposite = (color) => (color === WHITE ? BLACK : WHITE);

const RAYS = {
  [ROOK]: [-8, 8, -1, 1],
  [BISHOP]: [-9, -7, 9, 7],
  [QUEEN]: [-8, 8, -1, 1, -9, -7, 9, 7],
  [KING]: [-8, 8, -1, 1, -9, -7, 9, 7],
};
const KNIGHT_STEPS = [-17, -15, -10, -6, 6, 10, 15, 17];

/** Bir adımın tahtanın kenarından dolanmadığını doğrular. */
const stepIsSane = (from, to, maxFileShift) =>
  to >= 0 && to < 64 && Math.abs(fileOf(to) - fileOf(from)) <= maxFileShift;

const BACK_RANK = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK];

/** Klasik başlangıç dizilişi. */
export function createGame() {
  const board = new Array(64).fill(null);
  for (let file = 0; file < 8; file += 1) {
    board[file] = { type: BACK_RANK[file], color: BLACK };
    board[8 + file] = { type: PAWN, color: BLACK };
    board[48 + file] = { type: PAWN, color: WHITE };
    board[56 + file] = { type: BACK_RANK[file], color: WHITE };
  }
  return {
    board,
    turn: WHITE,
    // Rok hakları: taş oynadığında kalıcı olarak düşer.
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    enPassant: null, // geçerken alınabilecek kare indeksi
    halfmoveClock: 0,
    fullmove: 1,
    history: [],
  };
}

export const pieceAt = (game, index) => game.board[index] ?? null;

/** Bir kare verilen renk tarafından tehdit ediliyor mu? */
export function isSquareAttacked(game, index, byColor) {
  // Piyon tehdidi: piyon ilerlediği yönde çapraz vurur.
  const pawnDir = byColor === WHITE ? 8 : -8;
  for (const shift of [-1, 1]) {
    const from = index + pawnDir + shift;
    if (!stepIsSane(index, from, 1) || from < 0 || from > 63) continue;
    if (Math.abs(fileOf(from) - fileOf(index)) !== 1) continue;
    const piece = game.board[from];
    if (piece && piece.color === byColor && piece.type === PAWN) return true;
  }

  for (const step of KNIGHT_STEPS) {
    const from = index + step;
    if (!stepIsSane(index, from, 2)) continue;
    const piece = game.board[from];
    if (piece && piece.color === byColor && piece.type === KNIGHT) return true;
  }

  for (const step of RAYS[KING]) {
    const from = index + step;
    if (!stepIsSane(index, from, 1)) continue;
    const piece = game.board[from];
    if (piece && piece.color === byColor && piece.type === KING) return true;
  }

  const slide = (steps, types) => {
    for (const step of steps) {
      let current = index;
      for (;;) {
        const next = current + step;
        if (!stepIsSane(current, next, 1)) break;
        const piece = game.board[next];
        if (piece) {
          if (piece.color === byColor && types.includes(piece.type)) return true;
          break;
        }
        current = next;
      }
    }
    return false;
  };
  if (slide(RAYS[ROOK], [ROOK, QUEEN])) return true;
  if (slide(RAYS[BISHOP], [BISHOP, QUEEN])) return true;
  return false;
}

export function findKing(game, color) {
  for (let i = 0; i < 64; i += 1) {
    const piece = game.board[i];
    if (piece && piece.type === KING && piece.color === color) return i;
  }
  return -1;
}

export function isInCheck(game, color = game.turn) {
  const king = findKing(game, color);
  return king !== -1 && isSquareAttacked(game, king, opposite(color));
}

const PROMOTIONS = [QUEEN, ROOK, BISHOP, KNIGHT];

/** Sözde-yasal hamleler: şah güvenliği burada denetlenmez. */
function pseudoMoves(game, color) {
  const moves = [];
  const push = (move) => moves.push(move);

  for (let from = 0; from < 64; from += 1) {
    const piece = game.board[from];
    if (!piece || piece.color !== color) continue;

    if (piece.type === PAWN) {
      const forward = color === WHITE ? -8 : 8;
      const startRank = color === WHITE ? 2 : 7;
      const promotionRank = color === WHITE ? 8 : 1;
      const one = from + forward;
      if (one >= 0 && one < 64 && !game.board[one]) {
        if (rankOf(one) === promotionRank) {
          for (const promotion of PROMOTIONS) push({ from, to: one, promotion });
        } else {
          push({ from, to: one });
          const two = from + forward * 2;
          if (rankOf(from) === startRank && !game.board[two]) {
            push({ from, to: two, double: true });
          }
        }
      }
      for (const shift of [-1, 1]) {
        const to = one + shift;
        if (!stepIsSane(one, to, 1) || to < 0 || to > 63) continue;
        if (Math.abs(fileOf(to) - fileOf(from)) !== 1) continue;
        const target = game.board[to];
        if (target && target.color !== color) {
          if (rankOf(to) === promotionRank) {
            for (const promotion of PROMOTIONS) push({ from, to, promotion, captured: target });
          } else push({ from, to, captured: target });
        } else if (!target && to === game.enPassant) {
          const capturedIndex = to - forward;
          push({ from, to, enPassant: true, captured: game.board[capturedIndex], capturedIndex });
        }
      }
      continue;
    }

    if (piece.type === KNIGHT) {
      for (const step of KNIGHT_STEPS) {
        const to = from + step;
        if (!stepIsSane(from, to, 2)) continue;
        const target = game.board[to];
        if (target && target.color === color) continue;
        push({ from, to, captured: target ?? undefined });
      }
      continue;
    }

    if (piece.type === KING) {
      for (const step of RAYS[KING]) {
        const to = from + step;
        if (!stepIsSane(from, to, 1)) continue;
        const target = game.board[to];
        if (target && target.color === color) continue;
        push({ from, to, captured: target ?? undefined });
      }
      // Rok: haklar duruyor, aradaki kareler boş ve şah geçtiği hiçbir
      // karede tehdit altında değil.
      const rights = game.castling;
      const enemy = opposite(color);
      const homeRank = color === WHITE ? 7 : 0;
      if (from === homeRank * 8 + 4 && !isSquareAttacked(game, from, enemy)) {
        const kingSide = color === WHITE ? rights.wK : rights.bK;
        const queenSide = color === WHITE ? rights.wQ : rights.bQ;
        const rookIndexK = homeRank * 8 + 7;
        const rookIndexQ = homeRank * 8;
        if (
          kingSide &&
          !game.board[from + 1] &&
          !game.board[from + 2] &&
          game.board[rookIndexK]?.type === ROOK &&
          game.board[rookIndexK]?.color === color &&
          !isSquareAttacked(game, from + 1, enemy) &&
          !isSquareAttacked(game, from + 2, enemy)
        ) {
          push({ from, to: from + 2, castle: "k", rookFrom: rookIndexK, rookTo: from + 1 });
        }
        if (
          queenSide &&
          !game.board[from - 1] &&
          !game.board[from - 2] &&
          !game.board[from - 3] &&
          game.board[rookIndexQ]?.type === ROOK &&
          game.board[rookIndexQ]?.color === color &&
          !isSquareAttacked(game, from - 1, enemy) &&
          !isSquareAttacked(game, from - 2, enemy)
        ) {
          push({ from, to: from - 2, castle: "q", rookFrom: rookIndexQ, rookTo: from - 1 });
        }
      }
      continue;
    }

    for (const step of RAYS[piece.type]) {
      let current = from;
      for (;;) {
        const to = current + step;
        if (!stepIsSane(current, to, 1)) break;
        const target = game.board[to];
        if (target) {
          if (target.color !== color) push({ from, to, captured: target });
          break;
        }
        push({ from, to });
        current = to;
      }
    }
  }
  return moves;
}

function applyInternal(game, move) {
  const piece = game.board[move.from];
  const undo = {
    move,
    piece,
    castling: { ...game.castling },
    enPassant: game.enPassant,
    halfmoveClock: game.halfmoveClock,
    fullmove: game.fullmove,
    capturedIndex: move.enPassant ? move.capturedIndex : move.to,
    captured: move.captured ?? null,
  };

  game.board[move.from] = null;
  if (move.enPassant) game.board[move.capturedIndex] = null;
  game.board[move.to] = move.promotion
    ? { type: move.promotion, color: piece.color }
    : piece;

  if (move.castle) {
    game.board[move.rookTo] = game.board[move.rookFrom];
    game.board[move.rookFrom] = null;
  }

  // Rok hakları: şah ya da kale kımıldadıysa (veya kale alındıysa) düşer.
  if (piece.type === KING) {
    if (piece.color === WHITE) {
      game.castling.wK = false;
      game.castling.wQ = false;
    } else {
      game.castling.bK = false;
      game.castling.bQ = false;
    }
  }
  const dropRookRight = (index) => {
    if (index === 63) game.castling.wK = false;
    if (index === 56) game.castling.wQ = false;
    if (index === 7) game.castling.bK = false;
    if (index === 0) game.castling.bQ = false;
  };
  dropRookRight(move.from);
  dropRookRight(move.to);

  game.enPassant = move.double ? (move.from + move.to) / 2 : null;
  game.halfmoveClock =
    piece.type === PAWN || move.captured ? 0 : game.halfmoveClock + 1;
  if (game.turn === BLACK) game.fullmove += 1;
  game.turn = opposite(game.turn);
  return undo;
}

function undoInternal(game, undo) {
  const { move, piece } = undo;
  game.board[move.from] = piece;
  game.board[move.to] = null;
  if (move.castle) {
    game.board[move.rookFrom] = game.board[move.rookTo];
    game.board[move.rookTo] = null;
  }
  if (undo.captured) game.board[undo.capturedIndex] = undo.captured;
  game.castling = undo.castling;
  game.enPassant = undo.enPassant;
  game.halfmoveClock = undo.halfmoveClock;
  game.fullmove = undo.fullmove;
  game.turn = piece.color;
}

/**
 * Yasal hamleler: sözde-yasal listeden, uygulandığında kendi şahını
 * tehdide açan her hamle elenir.
 */
export function legalMoves(game, options = {}) {
  const color = options.color || game.turn;
  const result = [];
  for (const move of pseudoMoves(game, color)) {
    const undo = applyInternal(game, move);
    const safe = !isInCheck(game, color);
    undoInternal(game, undo);
    if (safe) result.push(move);
  }
  if (options.from !== undefined) return result.filter((move) => move.from === options.from);
  return result;
}

export const movesFrom = (game, index) => legalMoves(game, { from: index });

/** Bir hamlenin standart cebirsel gösterimi (SAN). */
export function toSan(game, move) {
  if (move.castle) return move.castle === "k" ? "O-O" : "O-O-O";
  const piece = game.board[move.from];
  const target = indexToSquare(move.to);
  const isCapture = Boolean(move.captured) || move.enPassant;
  let text = "";

  if (piece.type === PAWN) {
    text = isCapture ? `${FILES[fileOf(move.from)]}x${target}` : target;
    if (move.promotion) text += `=${move.promotion.toUpperCase()}`;
  } else {
    // Belirsizlik: aynı tipte başka bir taş da aynı kareye gidebiliyorsa
    // kaynak sütun (gerekirse satır) eklenir.
    const rivals = legalMoves(game).filter(
      (other) =>
        other.to === move.to &&
        other.from !== move.from &&
        game.board[other.from]?.type === piece.type,
    );
    let disambiguation = "";
    if (rivals.length) {
      const sameFile = rivals.some((other) => fileOf(other.from) === fileOf(move.from));
      const sameRank = rivals.some((other) => rankOf(other.from) === rankOf(move.from));
      if (!sameFile) disambiguation = FILES[fileOf(move.from)];
      else if (!sameRank) disambiguation = String(rankOf(move.from));
      else disambiguation = indexToSquare(move.from);
    }
    text = `${piece.type.toUpperCase()}${disambiguation}${isCapture ? "x" : ""}${target}`;
  }

  const undo = applyInternal(game, move);
  const opponent = game.turn;
  const inCheck = isInCheck(game, opponent);
  const noReply = legalMoves(game, { color: opponent }).length === 0;
  undoInternal(game, undo);
  if (inCheck) text += noReply ? "#" : "+";
  return text;
}

/**
 * Hamleyi uygular. Yasal değilse tahta hiç değişmez ve `ok:false` döner.
 * `promotion` verilmezse vezire terfi varsayılır.
 */
export function move(game, from, to, promotion) {
  const candidates = legalMoves(game).filter((item) => item.from === from && item.to === to);
  if (!candidates.length) return { ok: false, reason: "Bu hamle kurallara uymuyor." };
  const chosen =
    candidates.find((item) => !item.promotion || item.promotion === (promotion || QUEEN)) ||
    candidates[0];
  const san = toSan(game, chosen);
  const undo = applyInternal(game, chosen);
  game.history.push({ ...undo, san });
  return { ok: true, move: chosen, san };
}

/** Son hamleyi geri alır. */
export function undo(game) {
  const last = game.history.pop();
  if (!last) return { ok: false, reason: "Geri alınacak hamle yok." };
  undoInternal(game, last);
  return { ok: true, move: last.move, san: last.san };
}

export const isCheckmate = (game) => isInCheck(game) && legalMoves(game).length === 0;
export const isStalemate = (game) => !isInCheck(game) && legalMoves(game).length === 0;

/** Yalnız gerçekten uyguladığımız beraberlik kuralları raporlanır. */
export function insufficientMaterial(game) {
  const pieces = game.board.filter(Boolean);
  if (pieces.length > 4) return false;
  const nonKings = pieces.filter((piece) => piece.type !== KING);
  if (!nonKings.length) return true;
  if (nonKings.length === 1) return [BISHOP, KNIGHT].includes(nonKings[0].type);
  if (nonKings.length === 2 && nonKings.every((piece) => piece.type === BISHOP)) {
    const squares = [];
    game.board.forEach((piece, index) => {
      if (piece && piece.type === BISHOP) squares.push((fileOf(index) + rankOf(index)) % 2);
    });
    return squares[0] === squares[1];
  }
  return false;
}

export function status(game) {
  if (isCheckmate(game)) {
    return {
      over: true,
      reason: "checkmate",
      winner: opposite(game.turn),
      text: game.turn === WHITE ? "Mat — siyah kazandı." : "Mat — beyaz kazandı.",
    };
  }
  if (isStalemate(game)) {
    return { over: true, reason: "stalemate", winner: null, text: "Pat — berabere." };
  }
  if (insufficientMaterial(game)) {
    return { over: true, reason: "material", winner: null, text: "Yetersiz materyal — berabere." };
  }
  if (game.halfmoveClock >= 100) {
    return { over: true, reason: "fifty", winner: null, text: "Elli hamle kuralı — berabere." };
  }
  const side = game.turn === WHITE ? "Beyaz" : "Siyah";
  return {
    over: false,
    reason: isInCheck(game) ? "check" : "playing",
    winner: null,
    text: isInCheck(game) ? `${side} şahta.` : `${side} oynayacak.`,
  };
}

/** Alınan taşlar, geçmişten türetilir — ayrı bir sayaç tutulmaz. */
export function capturedPieces(game) {
  const captured = { w: [], b: [] };
  for (const entry of game.history) {
    if (!entry.captured) continue;
    captured[entry.captured.color].push(entry.captured.type);
  }
  return captured;
}

export const moveList = (game) => game.history.map((entry) => entry.san);

/** Testler ve hata ayıklama için basit bir kurulum yardımcısı. */
export function setPosition(game, placements, turn = WHITE) {
  game.board.fill(null);
  for (const [square, type, color] of placements) {
    game.board[squareToIndex(square)] = { type, color };
  }
  game.turn = turn;
  game.castling = { wK: false, wQ: false, bK: false, bQ: false };
  game.enPassant = null;
  game.halfmoveClock = 0;
  game.fullmove = 1;
  game.history.length = 0;
  return game;
}

/** Sözde-yasal düğüm sayımı (perft) — kural motorunun doğruluk kanıtı. */
export function perft(game, depth) {
  if (depth === 0) return 1;
  let nodes = 0;
  for (const candidate of legalMoves(game)) {
    const undoState = applyInternal(game, candidate);
    nodes += perft(game, depth - 1);
    undoInternal(game, undoState);
  }
  return nodes;
}
