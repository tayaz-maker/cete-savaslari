/** TarikLab deterministic, bounded alpha-beta opponent. No external engine. */
import { legalMoves, isInCheck, insufficientMaterial, visitMove } from './rules.js?v=2';
export const LEVELS = Object.freeze({
  easy: { depth: 1, nodes: 1000, noise: 110, quiet: 0 },
  medium: { depth: 2, nodes: 6000, noise: 0, quiet: 0 },
  hard: { depth: 4, nodes: 24000, noise: 0, quiet: 4 },
});
const VALUE = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const MATE = 100000;
export function seeded(seed) {
  let x = seed >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return x >>> 0;
}
export const humanColor = (choice, seed) => choice === 'random' ? (seeded(seed) % 2 ? 'w' : 'b') : choice;
function evaluate(game, mobility) {
  let score = 0;
  const pawns = { w: new Array(8).fill(0), b: new Array(8).fill(0) };
  for (let i = 0; i < 64; i++) {
    const p = game.board[i];
    if (!p) continue;
    const file = i % 8, row = Math.floor(i / 8);
    const advance = p.color === 'w' ? 7 - row : row;
    const center = 7 - Math.abs(3.5 - file) - Math.abs(3.5 - row);
    let position = 0;
    if (p.type === 'p') { position = advance * 7 + center * 3; pawns[p.color][file]++; }
    if (p.type === 'n' || p.type === 'b') position = center * 10 + (advance > 0 ? 12 : -12);
    if (p.type === 'r') position = advance === 6 ? 20 : 0;
    if (p.type === 'q') position = center * 2;
    if (p.type === 'k') position = advance < 2 && (file < 3 || file > 5) ? 30 : -advance * 8;
    score += (p.color === 'w' ? 1 : -1) * (VALUE[p.type] + position);
  }
  for (const color of ['w', 'b']) for (let f = 0; f < 8; f++) {
    const n = pawns[color][f];
    const penalty = Math.max(0, n - 1) * 14 + (n && !pawns[color][f - 1] && !pawns[color][f + 1] ? 10 : 0);
    score -= (color === 'w' ? 1 : -1) * penalty;
  }
  return score * (game.turn === 'w' ? 1 : -1) + Math.min(40, mobility * 2);
}
const order = (moves) => moves.slice().sort((a, b) =>
  (VALUE[b.captured?.type] || 0) * 10 + (VALUE[b.promotion] || 0) -
  (VALUE[a.captured?.type] || 0) * 10 - (VALUE[a.promotion] || 0));

export function chooseMove(position, difficulty = 'medium', seed = 1) {
  const config = LEVELS[difficulty] || LEVELS.medium;
  const game = structuredClone(position);
  const before = performance.now();
  let nodes = 0, completedDepth = 0;
  const budget = Symbol('budget');
  function search(depth, alpha, beta, ply, quiet) {
    if (++nodes > config.nodes) { nodes--; throw budget; }
    const moves = legalMoves(game);
    const check = isInCheck(game);
    if (!moves.length) return check ? -MATE + ply : 0;
    if (game.halfmoveClock >= 100 || insufficientMaterial(game)) return 0;
    const evaluation = evaluate(game, moves.length);
    if (depth <= 0 && quiet <= 0) return evaluation;
    let candidates = moves;
    if (depth <= 0 && !check) {
      if (evaluation >= beta) return evaluation;
      alpha = Math.max(alpha, evaluation);
      candidates = moves.filter(m => m.captured || m.promotion);
    }
    for (const candidate of order(candidates)) {
      const value = visitMove(game, candidate, () => -search(depth - 1, -beta, -alpha, ply + 1, depth <= 0 ? quiet - 1 : quiet));
      if (value >= beta) return value;
      alpha = Math.max(alpha, value);
    }
    return alpha;
  }
  const roots = order(legalMoves(game));
  if (!roots.length || game.halfmoveClock >= 100 || insufficientMaterial(game))
    return { move: null, nodes, depth: 0, elapsedMs: performance.now() - before };
  let best = roots[0], score = -Infinity;
  for (let depth = 1; depth <= config.depth; depth++) {
    let iterationBest = roots[0], iterationScore = -Infinity;
    try {
      for (const candidate of roots) {
        let value = visitMove(game, candidate, () => -search(depth - 1, -Infinity, -iterationScore, 1, config.quiet));
        if (config.noise) value += (seeded(seed ^ (candidate.from * 64 + candidate.to + 1)) % (config.noise * 2 + 1)) - config.noise;
        if (value > iterationScore) { iterationScore = value; iterationBest = candidate; }
      }
    } catch (e) { if (e !== budget) throw e; break; }
    best = iterationBest; score = iterationScore; completedDepth = depth;
    roots.sort((a, b) => Number(b === best) - Number(a === best));
    if (score > MATE - 100) break;
  }
  return { move: best, score, nodes, depth: completedDepth, elapsedMs: performance.now() - before };
}
