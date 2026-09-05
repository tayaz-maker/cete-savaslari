/**
 * Satranç — TLab Edition · arayüz katmanı.
 * TarikLab özgün uygulaması. Kurallar `rules.js` içinde, taşlar
 * `pieces.js` içinde; burada yalnız tahta, girdi ve durum metinleri var.
 */
import {
  BLACK,
  WHITE,
  capturedPieces,
  createGame,
  findKing,
  indexToSquare,
  isInCheck,
  move as playMove,
  moveList,
  movesFrom,
  pieceAt,
  status,
  undo as undoMove,
} from "./rules.js?v=1";
import { PIECE_NAMES, pieceLabel, pieceSvg } from "./pieces.js?v=1";

const el = (id) => document.getElementById(id);
const boardEl = el("board");
const statusEl = el("status");
const resultDialog = el("result");
const promotionDialog = el("promotion");

const game = createGame();
let selected = null;
let legalTargets = [];
let lastMove = null;
let flipped = false;
let finished = false;
let pendingPromotion = null;

const squares = [];

/* ---------- tahta kurulumu ---------- */

function buildBoard() {
  boardEl.replaceChildren();
  squares.length = 0;
  for (let i = 0; i < 64; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sq";
    button.dataset.index = String(i);
    boardEl.append(button);
    squares.push(button);
  }
}

/** Ekrandaki sıra numarasından gerçek tahta indeksine çevirir. */
const displayToIndex = (position) => (flipped ? 63 - position : position);

function render() {
  const captured = capturedPieces(game);
  const checkedColor = isInCheck(game, game.turn) ? game.turn : null;
  const kingIndex = checkedColor ? findKing(game, checkedColor) : -1;

  for (let position = 0; position < 64; position += 1) {
    const index = displayToIndex(position);
    const button = squares[position];
    const piece = pieceAt(game, index);
    const square = indexToSquare(index);
    const row = Math.floor(index / 8);
    const col = index % 8;
    const isDark = (row + col) % 2 === 1;

    button.className = `sq${isDark ? " dark" : ""}`;
    button.dataset.index = String(index);
    button.dataset.square = square;

    const parts = [];
    if (piece) parts.push(pieceSvg(piece.type, piece.color));
    // Koordinat etiketleri yalnız kenar karelerde — tahta kalabalıklaşmasın.
    const showFile = flipped ? row === 0 : row === 7;
    const showRank = flipped ? col === 7 : col === 0;
    if (showFile) parts.push(`<span class="coord file">${square[0]}</span>`);
    if (showRank) parts.push(`<span class="coord rank">${square[1]}</span>`);
    button.innerHTML = parts.join("");

    if (selected === index) button.classList.add("selected");
    if (legalTargets.includes(index)) {
      button.classList.add("legal");
      if (piece) button.classList.add("occupied");
    }
    if (lastMove && (lastMove.from === index || lastMove.to === index)) {
      button.classList.add("last");
    }
    if (index === kingIndex) button.classList.add("check");

    button.setAttribute(
      "aria-label",
      piece ? `${square}, ${pieceLabel(piece.type, piece.color)}` : `${square}, boş`,
    );
    button.disabled = finished && !piece;
  }

  renderTaken("taken-top", flipped ? captured.b : captured.w, flipped ? WHITE : BLACK);
  renderTaken("taken-bottom", flipped ? captured.w : captured.b, flipped ? BLACK : WHITE);
  renderMoves();
  el("undo").disabled = game.history.length === 0;
}

/** `list` alınan taş tipleridir; `by` onları alan tarafın rengidir. */
function renderTaken(containerId, list, by) {
  const container = el(containerId);
  const label = by === WHITE ? "Beyazın aldıkları" : "Siyahın aldıkları";
  const captured = list
    .slice()
    .sort()
    .map((type) => pieceSvg(type, by === WHITE ? "b" : "w", { size: 20 }))
    .join("");
  container.innerHTML = `<span class="who">${label}</span>${captured || '<span class="who">—</span>'}`;
}

function renderMoves() {
  const list = moveList(game);
  const target = el("move-list");
  const empty = el("moves-empty");
  if (!list.length) {
    // Eski hamleleri DOM'da bırakma: yeni oyun sonrası liste gerçekten boş olsun.
    target.replaceChildren();
    target.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  target.hidden = false;
  const pairs = [];
  for (let i = 0; i < list.length; i += 2) {
    pairs.push([list[i], list[i + 1]].filter(Boolean).join("  "));
  }
  target.replaceChildren(
    ...pairs.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    }),
  );
  target.scrollTop = target.scrollHeight;
}

function setStatus(text, detail) {
  statusEl.innerHTML = `<strong>${text}</strong>${detail ? ` ${detail}` : ""}`;
}

/* ---------- oyun akışı ---------- */

function refreshStatus(extra) {
  const state = status(game);
  if (state.over) {
    finished = true;
    setStatus(state.text, extra);
    showResult(state);
    return;
  }
  setStatus(state.text, extra);
}

function showResult(state) {
  el("result-title").textContent =
    state.reason === "checkmate" ? "Mat" : state.reason === "stalemate" ? "Pat" : "Berabere";
  el("result-note").textContent = state.text;
  el("result-summary").textContent = `${game.history.length} hamle oynandı.`;
  if (typeof resultDialog.showModal === "function") resultDialog.showModal();
}

function clearSelection() {
  selected = null;
  legalTargets = [];
}

function selectSquare(index) {
  const piece = pieceAt(game, index);
  if (!piece || piece.color !== game.turn) return false;
  const moves = movesFrom(game, index);
  if (!moves.length) {
    clearSelection();
    render();
    setStatus(status(game).text, `${pieceLabel(piece.type, piece.color)} şu an oynayamıyor.`);
    return true;
  }
  selected = index;
  legalTargets = moves.map((item) => item.to);
  render();
  setStatus(status(game).text, `${pieceLabel(piece.type, piece.color)} seçildi.`);
  return true;
}

function commitMove(from, to, promotion) {
  const result = playMove(game, from, to, promotion);
  if (!result.ok) {
    setStatus(status(game).text, result.reason);
    return;
  }
  lastMove = { from, to };
  clearSelection();
  render();
  refreshStatus(`Son hamle: ${result.san}`);
}

function askPromotion(from, to) {
  pendingPromotion = { from, to };
  const grid = el("promo-grid");
  grid.replaceChildren();
  for (const type of ["q", "r", "b", "n"]) {
    const button = document.createElement("button");
    button.type = "submit";
    button.value = type;
    button.title = PIECE_NAMES[type];
    button.setAttribute("aria-label", PIECE_NAMES[type]);
    button.innerHTML = pieceSvg(type, game.turn);
    grid.append(button);
  }
  if (typeof promotionDialog.showModal === "function") promotionDialog.showModal();
  else commitMove(from, to, "q");
}

function handleSquare(index) {
  if (finished) return;

  if (selected !== null && legalTargets.includes(index)) {
    const piece = pieceAt(game, selected);
    const targetRank = Math.floor(index / 8);
    const promoting =
      piece?.type === "p" && ((piece.color === WHITE && targetRank === 0) || (piece.color === BLACK && targetRank === 7));
    if (promoting) askPromotion(selected, index);
    else commitMove(selected, index);
    return;
  }

  if (selected === index) {
    clearSelection();
    render();
    setStatus(status(game).text, "Seçim bırakıldı.");
    return;
  }

  if (selectSquare(index)) return;

  clearSelection();
  render();
  const piece = pieceAt(game, index);
  setStatus(
    status(game).text,
    piece ? "Sıra rakipte; bu taş şu an oynayamaz." : "Önce oynayacağın taşı seç.",
  );
}

boardEl.addEventListener("click", (event) => {
  const button = event.target.closest(".sq");
  if (!button) return;
  handleSquare(Number(button.dataset.index));
});

promotionDialog.addEventListener("close", () => {
  const choice = promotionDialog.returnValue;
  const pending = pendingPromotion;
  pendingPromotion = null;
  if (!pending) return;
  // Diyalog kapatılırsa (Esc) vezir varsayılır; hamle asla yarım kalmaz.
  commitMove(pending.from, pending.to, ["q", "r", "b", "n"].includes(choice) ? choice : "q");
});

resultDialog.addEventListener("close", () => {
  if (resultDialog.returnValue === "again") newGame();
});

function newGame() {
  const fresh = createGame();
  game.board = fresh.board;
  game.turn = fresh.turn;
  game.castling = fresh.castling;
  game.enPassant = fresh.enPassant;
  game.halfmoveClock = fresh.halfmoveClock;
  game.fullmove = fresh.fullmove;
  game.history.length = 0;
  clearSelection();
  lastMove = null;
  finished = false;
  render();
  setStatus("Beyaz oynayacak.", "Yeni oyun.");
}

el("new-game").addEventListener("click", newGame);

el("undo").addEventListener("click", () => {
  const result = undoMove(game);
  if (!result.ok) {
    setStatus(status(game).text, result.reason);
    return;
  }
  finished = false;
  clearSelection();
  const previous = game.history[game.history.length - 1];
  lastMove = previous ? { from: previous.move.from, to: previous.move.to } : null;
  render();
  setStatus(status(game).text, `${result.san} geri alındı.`);
});

el("flip").addEventListener("click", () => {
  flipped = !flipped;
  render();
  setStatus(status(game).text, flipped ? "Tahta siyahın gözünden." : "Tahta beyazın gözünden.");
});

buildBoard();
render();
setStatus("Beyaz oynayacak.");
