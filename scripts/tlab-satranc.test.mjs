import test from "node:test";
import assert from "node:assert/strict";
import {
  BLACK,
  WHITE,
  capturedPieces,
  createGame,
  indexToSquare,
  insufficientMaterial,
  isCheckmate,
  isInCheck,
  isSquareAttacked,
  isStalemate,
  legalMoves,
  move,
  moveList,
  movesFrom,
  perft,
  pieceAt,
  setPosition,
  squareToIndex,
  status,
  undo,
} from "../public/games/satranc/js/rules.js";
import { PIECE_SHAPES, pieceSvg } from "../public/games/satranc/js/pieces.js";

const at = (game, square) => pieceAt(game, squareToIndex(square));
const targets = (game, square) =>
  movesFrom(game, squareToIndex(square))
    .map((item) => indexToSquare(item.to))
    .sort();
const play = (game, from, to, promotion) =>
  move(game, squareToIndex(from), squareToIndex(to), promotion);

/* ---------- kural motorunun bütünsel doğruluğu ---------- */

test("başlangıç konumunda düğüm sayımı bilinen değerlerle birebir eşleşir", () => {
  // Perft, satranç motorlarının standart doğruluk kanıtıdır: tek bir
  // kural hatası (rok, geçerken alma, şah kaçışı, terfi) sayıyı bozar.
  const game = createGame();
  assert.equal(perft(game, 1), 20);
  assert.equal(perft(game, 2), 400);
  assert.equal(perft(game, 3), 8902);
  assert.equal(perft(game, 4), 197281);
});

test("rok ve geçerken almayı zorlayan konumda düğüm sayımı da doğrudur", () => {
  // "Kiwipete" konumu: iki taraf da iki yöne rok yapabilir, bağlı taşlar
  // ve geçerken alma fırsatları vardır.
  const game = createGame();
  setPosition(
    game,
    [
      ["a8", "r", "b"], ["e8", "k", "b"], ["h8", "r", "b"],
      ["a7", "p", "b"], ["c7", "p", "b"], ["d7", "p", "b"], ["e7", "q", "b"],
      ["f7", "p", "b"], ["g7", "b", "b"],
      ["a6", "b", "b"], ["b6", "n", "b"], ["e6", "p", "b"], ["f6", "n", "b"], ["g6", "p", "b"],
      ["d5", "p", "w"], ["e5", "n", "w"],
      ["b4", "p", "b"], ["e4", "p", "w"],
      ["c3", "n", "w"], ["f3", "q", "w"], ["h3", "p", "b"],
      ["a2", "p", "w"], ["b2", "p", "w"], ["c2", "p", "w"], ["d2", "b", "w"],
      ["e2", "b", "w"], ["f2", "p", "w"], ["g2", "p", "w"], ["h2", "p", "w"],
      ["a1", "r", "w"], ["e1", "k", "w"], ["h1", "r", "w"],
    ],
    WHITE,
  );
  game.castling = { wK: true, wQ: true, bK: true, bQ: true };
  assert.equal(perft(game, 1), 48);
  assert.equal(perft(game, 2), 2039);
  assert.equal(perft(game, 3), 97862);
});

/* ---------- taş bazında hareket ---------- */

test("piyon: bir ve iki kare ilerler, çapraz vurur, düz vuramaz", () => {
  const game = createGame();
  assert.deepEqual(targets(game, "e2"), ["e3", "e4"]);
  play(game, "e2", "e4");
  play(game, "d7", "d5");
  // e4 piyonu d5'i çapraz alabilir, e5'e de ilerleyebilir.
  assert.deepEqual(targets(game, "e4"), ["d5", "e5"]);
  const before = at(game, "d5");
  assert.equal(before.color, BLACK);
  assert.equal(play(game, "e4", "d5").ok, true);
  assert.equal(at(game, "d5").color, WHITE);
  // Karşısı dolu bir piyon düz ilerleyemez.
  const blocked = createGame();
  setPosition(blocked, [["e4", "p", "w"], ["e5", "p", "b"], ["e1", "k", "w"], ["e8", "k", "b"]], WHITE);
  assert.deepEqual(targets(blocked, "e4"), []);
});

test("at L çizer, kendi taşının üstünden atlar, kendi taşını alamaz", () => {
  const game = createGame();
  assert.deepEqual(targets(game, "b1"), ["a3", "c3"]);
  const open = createGame();
  setPosition(open, [["d4", "n", "w"], ["e1", "k", "w"], ["e8", "k", "b"], ["e6", "p", "w"]], WHITE);
  const list = targets(open, "d4");
  assert.equal(list.length, 7, "e6 kendi piyonu olduğu için sekiz kareden biri düşer");
  assert.equal(list.includes("e6"), false, "kendi taşının olduğu kareye gidemez");
  assert.equal(list.includes("c6"), true);
  assert.equal(list.includes("f5"), true);
});

test("fil, kale ve vezir çizgide ilerler; araya giren taş yolu keser", () => {
  const game = createGame();
  setPosition(
    game,
    [
      ["d4", "b", "w"], ["g7", "p", "b"], ["b2", "p", "w"],
      ["a1", "r", "w"], ["a5", "p", "b"], ["d1", "q", "w"],
      ["e1", "k", "w"], ["e8", "k", "b"],
    ],
    WHITE,
  );
  // Fil: g7'deki rakip taşa kadar gider ve onu alabilir; b2 kendi taşında durur.
  const bishop = targets(game, "d4");
  assert.deepEqual(bishop, ["a7", "b6", "c3", "c5", "e3", "e5", "f2", "f6", "g1", "g7"]);
  // Kale: a5'teki rakip taşta durur, ötesine geçemez.
  const rook = targets(game, "a1");
  assert.equal(rook.includes("a5"), true, "rakip taş alınabilir");
  assert.equal(rook.includes("a6"), false, "rakip taşın ötesine geçilemez");
  assert.equal(rook.includes("b1"), true);
  // Vezir hem çapraz hem düz hareket eder.
  const queen = targets(game, "d1");
  assert.equal(queen.includes("d3"), true);
  assert.equal(queen.includes("h5"), true);
  assert.equal(queen.includes("a4"), true);
});

test("şah bir kare oynar ve tehdit altındaki kareye gidemez", () => {
  const game = createGame();
  setPosition(game, [["e1", "k", "w"], ["e8", "k", "b"], ["d8", "r", "b"]], WHITE);
  const king = targets(game, "e1");
  assert.equal(king.includes("d1"), false, "d sütunu kale tarafından tutuluyor");
  assert.equal(king.includes("d2"), false);
  assert.equal(king.includes("e2"), true);
  assert.equal(king.includes("f1"), true);
});

/* ---------- şah, mat, pat ---------- */

test("şah tehdidi tanınır ve şahtan çıkmayan hamleler elenir", () => {
  const game = createGame();
  setPosition(
    game,
    [["e1", "k", "w"], ["e8", "k", "b"], ["e5", "r", "b"], ["a1", "r", "w"], ["h2", "p", "w"]],
    WHITE,
  );
  assert.equal(isInCheck(game, WHITE), true, "e sütunundaki kale şah çekiyor");
  const moves = legalMoves(game);
  assert.ok(moves.length > 0);
  // Şahtan çıkmayan hiçbir hamle listede olamaz: h2-h3 gibi ilgisiz
  // hamleler elenmiş olmalı.
  const sanSet = new Set(moves.map((item) => indexToSquare(item.from) + indexToSquare(item.to)));
  assert.equal(sanSet.has("h2h3"), false, "şahtayken ilgisiz hamle oynanamaz");
  // Kaleyi araya koymak ya da şahı kaçırmak yasal olmalı.
  assert.equal(play(game, "h2", "h3").ok, false, "kural dışı hamle reddedilir");
  assert.equal(isInCheck(game, WHITE), true, "reddedilen hamle konumu değiştirmez");
});

test("bağlı taş, şahını açacak şekilde oynayamaz", () => {
  const game = createGame();
  setPosition(
    game,
    [["e1", "k", "w"], ["e2", "n", "w"], ["e8", "r", "b"], ["a8", "k", "b"]],
    WHITE,
  );
  assert.equal(isInCheck(game, WHITE), false, "at şu an şahı koruyor");
  assert.deepEqual(targets(game, "e2"), [], "bağlı at hiç oynayamaz");
  assert.equal(play(game, "e2", "c3").ok, false);
  assert.equal(at(game, "e2").type, "n", "reddedilen hamle taşı yerinden oynatmaz");
});

test("mat: kaçış yok, oyun biter ve kazanan bildirilir", () => {
  // Aptal mat: f3, e5, g4, Qh4#
  const game = createGame();
  assert.equal(play(game, "f2", "f3").ok, true);
  assert.equal(play(game, "e7", "e5").ok, true);
  assert.equal(play(game, "g2", "g4").ok, true);
  const mate = play(game, "d8", "h4");
  assert.equal(mate.ok, true);
  assert.equal(mate.san, "Qh4#", "mat gösterimi # ile biter");
  assert.equal(isCheckmate(game), true);
  assert.equal(isStalemate(game), false);
  assert.equal(legalMoves(game).length, 0);
  const state = status(game);
  assert.equal(state.over, true);
  assert.equal(state.reason, "checkmate");
  assert.equal(state.winner, BLACK);
});

test("pat: şah tehdit altında değil ama hiç hamle yok", () => {
  const game = createGame();
  setPosition(game, [["a8", "k", "b"], ["c7", "q", "w"], ["c1", "k", "w"]], BLACK);
  assert.equal(isInCheck(game, BLACK), false, "şah tehdit altında olmamalı");
  assert.equal(legalMoves(game).length, 0, "hiç yasal hamle kalmamalı");
  assert.equal(isStalemate(game), true);
  assert.equal(isCheckmate(game), false);
  const state = status(game);
  assert.equal(state.reason, "stalemate");
  assert.equal(state.winner, null);
});

/* ---------- özel kurallar ---------- */

test("kısa ve uzun rok: şah ve kale birlikte doğru karelere gider", () => {
  const game = createGame();
  setPosition(
    game,
    [["e1", "k", "w"], ["h1", "r", "w"], ["a1", "r", "w"], ["e8", "k", "b"]],
    WHITE,
  );
  game.castling = { wK: true, wQ: true, bK: false, bQ: false };
  assert.equal(targets(game, "e1").includes("g1"), true, "kısa rok mümkün");
  assert.equal(targets(game, "e1").includes("c1"), true, "uzun rok mümkün");

  const short = play(game, "e1", "g1");
  assert.equal(short.ok, true);
  assert.equal(short.san, "O-O");
  assert.equal(at(game, "g1").type, "k");
  assert.equal(at(game, "f1").type, "r", "kale şahın öbür yanına geçer");
  assert.equal(at(game, "h1"), null);
  assert.equal(at(game, "e1"), null);

  undo(game);
  const long = play(game, "e1", "c1");
  assert.equal(long.ok, true);
  assert.equal(long.san, "O-O-O");
  assert.equal(at(game, "c1").type, "k");
  assert.equal(at(game, "d1").type, "r");
  assert.equal(at(game, "a1"), null);
});

test("rok hakkı; şah oynayınca, kale oynayınca ve tehdit altında düşer", () => {
  const moved = createGame();
  setPosition(moved, [["e1", "k", "w"], ["h1", "r", "w"], ["e8", "k", "b"]], WHITE);
  moved.castling = { wK: true, wQ: false, bK: false, bQ: false };
  play(moved, "h1", "g1");
  play(moved, "e8", "e7");
  play(moved, "g1", "h1");
  play(moved, "e7", "e8");
  assert.equal(targets(moved, "e1").includes("g1"), false, "kale oynadıysa rok hakkı biter");

  // Şahın geçtiği kare tehdit altındaysa rok yapılamaz.
  const attacked = createGame();
  setPosition(
    attacked,
    [["e1", "k", "w"], ["h1", "r", "w"], ["f8", "r", "b"], ["a8", "k", "b"]],
    WHITE,
  );
  attacked.castling = { wK: true, wQ: false, bK: false, bQ: false };
  assert.equal(isSquareAttacked(attacked, squareToIndex("f1"), BLACK), true);
  assert.equal(targets(attacked, "e1").includes("g1"), false, "geçilen kare tehdit altındayken rok yok");

  // Şah tehdit altındayken de rok yapılamaz.
  const inCheck = createGame();
  setPosition(
    inCheck,
    [["e1", "k", "w"], ["h1", "r", "w"], ["e8", "r", "b"], ["a8", "k", "b"]],
    WHITE,
  );
  inCheck.castling = { wK: true, wQ: false, bK: false, bQ: false };
  assert.equal(targets(inCheck, "e1").includes("g1"), false, "şahtayken rok yok");
});

test("geçerken alma yalnız hemen sonraki hamlede geçerlidir", () => {
  const game = createGame();
  setPosition(
    game,
    [["e5", "p", "w"], ["d7", "p", "b"], ["e1", "k", "w"], ["e8", "k", "b"]],
    BLACK,
  );
  assert.equal(play(game, "d7", "d5").ok, true, "iki kare ilerleyiş");
  assert.equal(game.enPassant, squareToIndex("d6"), "geçilen kare işaretlenmeli");
  assert.equal(targets(game, "e5").includes("d6"), true, "geçerken alma sunulmalı");

  const capture = play(game, "e5", "d6");
  assert.equal(capture.ok, true);
  assert.equal(capture.san, "exd6");
  assert.equal(at(game, "d6").color, WHITE, "alan piyon d6'ya geçer");
  assert.equal(at(game, "d5"), null, "alınan piyon tahtadan kalkar");
  assert.equal(at(game, "e5"), null);

  // Fırsat kaçarsa bir daha sunulmaz.
  const late = createGame();
  setPosition(
    late,
    [["e5", "p", "w"], ["d7", "p", "b"], ["e1", "k", "w"], ["e8", "k", "b"], ["h7", "p", "b"], ["a2", "p", "w"]],
    BLACK,
  );
  play(late, "d7", "d5");
  play(late, "a2", "a3");
  play(late, "h7", "h6");
  assert.equal(late.enPassant, null, "araya hamle girince fırsat kapanır");
  assert.equal(targets(late, "e5").includes("d6"), false);
});

test("terfi: dört taş da seçilebilir ve tahtaya doğru taş konur", () => {
  const build = () => {
    const game = createGame();
    setPosition(game, [["a7", "p", "w"], ["e1", "k", "w"], ["e8", "k", "b"]], WHITE);
    return game;
  };
  for (const [choice, expected] of [
    ["q", "q"],
    ["r", "r"],
    ["b", "b"],
    ["n", "n"],
  ]) {
    const game = build();
    const result = play(game, "a7", "a8", choice);
    assert.equal(result.ok, true, `${choice} terfisi kabul edilmeli`);
    assert.equal(at(game, "a8").type, expected);
    assert.equal(at(game, "a8").color, WHITE);
    assert.equal(at(game, "a7"), null);
    assert.match(result.san, new RegExp(`=${expected.toUpperCase()}`));
  }
  // Seçim verilmezse vezir varsayılır.
  const fallback = build();
  assert.equal(play(fallback, "a7", "a8").ok, true);
  assert.equal(at(fallback, "a8").type, "q");
});

test("sıra düzeni korunur: kimse üst üste iki hamle yapamaz", () => {
  const game = createGame();
  assert.equal(game.turn, WHITE);
  assert.equal(play(game, "e2", "e4").ok, true);
  assert.equal(game.turn, BLACK);
  assert.equal(play(game, "d2", "d4").ok, false, "beyaz arka arkaya oynayamaz");
  assert.equal(game.turn, BLACK, "reddedilen hamle sırayı değiştirmez");
  assert.equal(play(game, "e7", "e5").ok, true);
  assert.equal(game.turn, WHITE);
  assert.equal(game.fullmove, 2, "tam hamle sayacı siyahtan sonra artar");
});

/* ---------- geri alma, kayıt, sonuç ---------- */

test("geri alma her özel hamleyi de tam olarak geri sarar", () => {
  const game = createGame();
  setPosition(
    game,
    [["e1", "k", "w"], ["h1", "r", "w"], ["e8", "k", "b"], ["a7", "p", "w"], ["b8", "r", "b"]],
    WHITE,
  );
  game.castling = { wK: true, wQ: false, bK: false, bQ: false };
  const snapshot = game.board.map((piece) => (piece ? `${piece.color}${piece.type}` : null));

  play(game, "e1", "g1");
  assert.equal(undo(game).ok, true);
  assert.deepEqual(
    game.board.map((piece) => (piece ? `${piece.color}${piece.type}` : null)),
    snapshot,
    "rok geri alınınca kale de geri döner",
  );
  assert.equal(game.castling.wK, true, "rok hakkı geri gelir");
  assert.equal(game.turn, WHITE);

  play(game, "a7", "b8", "n");
  assert.equal(at(game, "b8").type, "n");
  assert.equal(undo(game).ok, true);
  assert.deepEqual(
    game.board.map((piece) => (piece ? `${piece.color}${piece.type}` : null)),
    snapshot,
    "terfi ve alınan taş birlikte geri döner",
  );
  assert.equal(undo(game).ok, false, "boş geçmişte geri alma reddedilir");
});

test("hamle listesi standart gösterimle ve belirsizlik çözümüyle üretilir", () => {
  const game = createGame();
  play(game, "e2", "e4");
  play(game, "e7", "e5");
  play(game, "g1", "f3");
  play(game, "b8", "c6");
  assert.deepEqual(moveList(game), ["e4", "e5", "Nf3", "Nc6"]);

  // İki at aynı kareye gidebiliyorsa kaynak sütun eklenir.
  const twin = createGame();
  setPosition(twin, [["b1", "n", "w"], ["f1", "n", "w"], ["e1", "k", "w"], ["e8", "k", "b"]], WHITE);
  const result = move(twin, squareToIndex("b1"), squareToIndex("d2"));
  assert.equal(result.san, "Nbd2", "belirsizlik sütunla çözülür");
});

test("alınan taşlar geçmişten doğru türetilir", () => {
  const game = createGame();
  play(game, "e2", "e4");
  play(game, "d7", "d5");
  play(game, "e4", "d5");
  const captured = capturedPieces(game);
  assert.deepEqual(captured.b, ["p"], "beyaz bir siyah piyon aldı");
  assert.deepEqual(captured.w, [], "siyah henüz taş almadı");
  undo(game);
  assert.deepEqual(capturedPieces(game).b, [], "geri alma alınan taşı da siler");
});

test("yetersiz materyal ve elli hamle beraberlikleri raporlanır", () => {
  const bare = createGame();
  setPosition(bare, [["e1", "k", "w"], ["e8", "k", "b"]], WHITE);
  assert.equal(insufficientMaterial(bare), true);
  assert.equal(status(bare).reason, "material");

  const withKnight = createGame();
  setPosition(withKnight, [["e1", "k", "w"], ["e8", "k", "b"], ["b1", "n", "w"]], WHITE);
  assert.equal(insufficientMaterial(withKnight), true, "tek at mat edemez");

  const withRook = createGame();
  setPosition(withRook, [["e1", "k", "w"], ["e8", "k", "b"], ["a1", "r", "w"]], WHITE);
  assert.equal(insufficientMaterial(withRook), false, "kale mat edebilir");

  const fifty = createGame();
  setPosition(fifty, [["e1", "k", "w"], ["e8", "k", "b"], ["a1", "r", "w"], ["h8", "r", "b"]], WHITE);
  fifty.halfmoveClock = 100;
  assert.equal(status(fifty).reason, "fifty");
});

test("tahtayı çevirmek oyun durumunu değiştirmez", () => {
  // Çevirme yalnız görüntüdür; motor tarafında karşılığı yoktur.
  // Bu testin kanıtladığı şey: motorda "yön" diye bir state yok.
  const game = createGame();
  play(game, "e2", "e4");
  const before = {
    board: game.board.map((piece) => (piece ? `${piece.color}${piece.type}` : null)),
    turn: game.turn,
    castling: { ...game.castling },
    enPassant: game.enPassant,
    moves: moveList(game),
  };
  const exported = Object.keys(game);
  assert.equal(exported.includes("flipped"), false, "motorda görüntü yönü tutulmaz");
  assert.equal(exported.includes("orientation"), false);
  assert.deepEqual(
    {
      board: game.board.map((piece) => (piece ? `${piece.color}${piece.type}` : null)),
      turn: game.turn,
      castling: { ...game.castling },
      enPassant: game.enPassant,
      moves: moveList(game),
    },
    before,
  );
});

test("yeni oyun tahtayı ve geçmişi tamamen sıfırlar", () => {
  const game = createGame();
  play(game, "e2", "e4");
  play(game, "e7", "e5");
  const fresh = createGame();
  assert.deepEqual(
    fresh.board.map((piece) => (piece ? `${piece.color}${piece.type}` : null)),
    createGame().board.map((piece) => (piece ? `${piece.color}${piece.type}` : null)),
  );
  assert.equal(fresh.turn, WHITE);
  assert.equal(fresh.history.length, 0);
  assert.deepEqual(fresh.castling, { wK: true, wQ: true, bK: true, bQ: true });
  assert.equal(fresh.enPassant, null);
});

/* ---------- özgün taş seti ---------- */

test("özgün taş seti altı taşı da eksiksiz ve geçerli SVG olarak üretir", () => {
  for (const type of ["p", "n", "b", "r", "q", "k"]) {
    assert.ok(PIECE_SHAPES[type], `${type} tanımlı olmalı`);
    assert.ok(PIECE_SHAPES[type].paths.length >= 3, `${type} birden çok parçadan kurulmalı`);
    for (const color of ["w", "b"]) {
      const svg = pieceSvg(type, color);
      assert.match(svg, /^<svg viewBox="0 0 100 100"/, "ortak çizim kutusu kullanılmalı");
      assert.match(svg, /<path d="M/, "yol verisi bulunmalı");
      assert.match(svg, new RegExp(`class="piece piece-${color}"`));
      assert.match(svg, /aria-label="/, "ekran okuyucu etiketi olmalı");
    }
  }
  assert.equal(pieceSvg("x", "w"), "", "bilinmeyen taş sessizce boş döner");
  // Setin ortak imzası: bütün taşlar aynı kaideyi paylaşır.
  const bases = Object.values(PIECE_SHAPES).map((shape) => shape.paths[shape.paths.length - 1]);
  assert.equal(new Set(bases).size, 1, "bütün taşlar aynı kaide üzerinde durur");
});
