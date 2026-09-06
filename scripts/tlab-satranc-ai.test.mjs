import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseMove, LEVELS, humanColor } from '../public/games/satranc/js/ai.js';
import { createGame, setPosition, legalMoves, move, isInCheck, status, visitMove } from '../public/games/satranc/js/rules.js';
import { loadChess } from './satranc-app-harness.mjs';
const position = pieces => setPosition(createGame(),pieces);
const same=(a,b)=>a.from===b.from&&a.to===b.to&&a.promotion===b.promotion;
function legal(g,r) { assert.ok(r.move); assert.ok(legalMoves(g).some(m=>same(m,r.move))); }
for(const level of Object.keys(LEVELS)) {
 test(`AI legality, own-check, determinism, budget: ${level}`,()=>{
  const g=position([['e1','k','w'],['e2','r','w'],['e8','r','b'],['a8','k','b']]);
  const before=JSON.stringify(g),a=chooseMove(g,level,42),b=chooseMove(g,level,42);
  legal(g,a);assert.deepEqual(a.move,b.move);assert.equal(a.nodes,b.nodes);assert.ok(a.nodes<=LEVELS[level].nodes);
  assert.equal(JSON.stringify(g),before);
  const color=g.turn;move(g,a.move.from,a.move.to,a.move.promotion);assert.equal(isInCheck(g,color),false);
 });
 test(`AI escapes check and takes free queen: ${level}`,()=>{
  const check=position([['e1','k','w'],['e8','r','b'],['a8','k','b']]);
  const a=chooseMove(check,level,42);legal(check,a);move(check,a.move.from,a.move.to);assert.equal(isInCheck(check,'w'),false);
  const q=position([['g1','k','w'],['g8','k','b'],['d1','q','w'],['d5','q','b']]);
  assert.equal(chooseMove(q,level,42).move.captured.type,'q');
 });
 test(`AI finds mate in one and stops at gameover: ${level}`,()=>{
  const g=position([['f6','k','w'],['g6','q','w'],['h8','k','b']]);
  const a=chooseMove(g,level,42);move(g,a.move.from,a.move.to);assert.equal(status(g).reason,'checkmate');
  assert.equal(chooseMove(g,level).move,null);
  const draw=position([['a1','k','w'],['h8','k','b']]);assert.equal(chooseMove(draw,level).move,null);
 });
}
test('Hard proves forced mate in two that Medium misses',()=>{
 const g=position([['b2','k','w'],['d5','q','w'],['a4','k','b']]);
 const hard=chooseMove(g,'hard',42),medium=chooseMove(g,'medium',42);
 const matesInTwo = candidate => visitMove(g,candidate,()=> legalMoves(g).every(reply=>visitMove(g,reply,()=>legalMoves(g).some(m=>visitMove(g,m,()=>status(g).reason==='checkmate')))));
 assert.ok(matesInTwo(hard.move));assert.equal(matesInTwo(medium.move),false);
 assert.ok(hard.score>99000);
});
test('Easy varies deterministically; Medium develops a minor piece',()=>{
 const g=createGame(),choices=new Set();for(let seed=1;seed<=8;seed++){const a=chooseMove(g,'easy',seed);choices.add(`${a.move.from}-${a.move.to}`);}
 assert.ok(choices.size>1);const m=chooseMove(g,'medium',1).move;assert.ok(['n','b'].includes(g.board[m.from].type));
 const trap=position([['g1','k','w'],['g8','k','b'],['d1','q','w'],['d5','p','b'],['d8','r','b']]);
 for(const level of ['medium','hard']) assert.notEqual(chooseMove(trap,level,42).move.to,27,'do not hang a queen for the defended pawn');
 assert.equal(humanColor('random',42),humanColor('random',42));
});
test('AI promotes, searches castling and en passant without corrupting rules state',()=>{
 const g=position([['h1','k','w'],['h8','k','b'],['a7','p','w']]);
 const a=chooseMove(g,'hard',42);assert.equal(a.move.promotion,'q');assert.ok(move(g,a.move.from,a.move.to,a.move.promotion).ok);
 const castle=position([['e1','k','w'],['h1','r','w'],['e8','k','b'],['a8','r','b']]);castle.castling.wK=true;
 const ep=position([['h1','k','w'],['h8','k','b'],['e5','p','w'],['d5','p','b']]);ep.enPassant=19;
 for(const p of [castle,ep]) { const before=JSON.stringify(p);legal(p,chooseMove(p,'hard',42));assert.equal(JSON.stringify(p),before); }
 assert.ok(legalMoves(castle).some(m=>m.castle));assert.ok(legalMoves(ep).some(m=>m.enPassant));
});
for(const [white,black] of [['easy','medium'],['medium','hard'],['hard','medium']]) test(`bounded deterministic selfplay ${white}/${black}`,()=>{
 const game=createGame();let maxMs=0,nodes=0;
 for(let ply=0;ply<100&&!status(game).over;ply++) {
  const side=game.turn,level=side==='w'?white:black;
  const a=chooseMove(game,level,4242+ply);legal(game,a);assert.ok(a.nodes<=LEVELS[level].nodes);
  assert.ok(move(game,a.move.from,a.move.to,a.move.promotion).ok);assert.equal(isInCheck(game,side),false);
  assert.equal(game.history.length,ply+1);maxMs=Math.max(maxMs,a.elapsedMs);nodes+=a.nodes;
  assert.ok(JSON.stringify(game).length<100000);
 }
 console.log(`selfplay ${white}/${black}: ${game.history.length} plies, max ${maxMs.toFixed(1)}ms, ${nodes} nodes, ${status(game).reason}`);
});
test('Human white starts; black schedules exactly one white reply; flip changes no game state',()=>{
 const a=loadChess();a.start();assert.equal(a.workers.length,0);a.ev('commitMove(52,36)');assert.equal(a.workers.length,1);
 const state=a.ev('JSON.stringify(game)');a.get('flip').fire('click');assert.equal(a.ev('JSON.stringify(game)'),state);assert.match(a.get('status').innerHTML,/düşünüyor/);
 const b=loadChess();b.start('computer','b');assert.equal(b.workers.length,1);assert.equal(b.ev('flipped'),true);
 b.workers[0].reply({from:52,to:36});assert.equal(b.ev('game.turn'),'b');assert.equal(b.ev('game.history.length'),1);
});
for(const action of ['restart','new-game','undo']) test(`${action} cancels stale worker and rapid input`,()=>{
 const a=loadChess();a.start();a.ev('handleSquare(52);handleSquare(36)');const worker=a.workers[0];
 a.ev('handleSquare(51);handleSquare(35)');assert.equal(a.ev('game.history.length'),1);
 a.get(action).fire('click');const before=a.ev('JSON.stringify(game)');worker.reply({from:12,to:28});
 assert.ok(worker.terminated);assert.equal(a.ev('JSON.stringify(game)'),before);assert.equal(a.ev('thinking'),false);
});
test('Computer undo returns to human turn; two-player undo removes one ply',()=>{
 const a=loadChess();a.start();a.ev('commitMove(52,36)');a.workers[0].reply({from:12,to:28});
 assert.equal(a.ev('game.history.length'),2);a.get('undo').fire('click');assert.equal(a.ev('game.history.length'),0);assert.equal(a.ev('game.turn'),'w');
 a.get('new-game').fire('click');a.start('two');a.ev('commitMove(52,36);commitMove(12,28)');a.get('undo').fire('click');assert.equal(a.ev('game.history.length'),1);
});
test('Promotion cancellation, mode/difficulty/color change and gameover reject stale replies',()=>{
 const a=loadChess();a.start();a.ev('askPromotion(48,40)');a.get('restart').fire('click');a.flush();assert.equal(a.ev('game.history.length'),0);
 a.ev('commitMove(52,36)');const old=a.workers[0];a.get('new-game').fire('click');a.start('computer','b','hard');old.reply({from:12,to:28});assert.equal(a.ev('game.history.length'),0);
 const current=a.workers.at(-1);a.ev('finished=true;opponent.cancel()');current.reply({from:52,to:36});assert.equal(a.ev('game.history.length'),0);
});
