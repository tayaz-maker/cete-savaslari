import fs from 'node:fs';
import * as rules from '../public/games/satranc/js/rules.js';
import * as pieces from '../public/games/satranc/js/pieces.js';
import { humanColor, seeded } from '../public/games/satranc/js/ai.js';
import { Opponent } from '../public/games/satranc/js/opponent.js';
export function loadChess() {
  const elements = new Map(), workers = [], closes = [];
  const element = () => ({
    value: '', textContent: '', innerHTML: '', dataset: {}, children: [], disabled: false, open: false,
    selectedOptions: [{ textContent: 'Orta' }], listeners: {}, attrs: {},
    classList: { add() {} },
    setAttribute(k,v) { this.attrs[k]=v; },
    append(x) { this.children.push(x); },
    replaceChildren(...children) { this.children=children; },
    addEventListener(name,fn) { this.listeners[name]=fn; },
    fire(name) { this.listeners[name]?.({preventDefault(){}}); },
    showModal() { this.open=true; },
    close() { if(this.open) { this.open=false; closes.push(()=>this.fire('close')); } },
  });
  const document = { getElementById(id) { if(!elements.has(id)) elements.set(id,element()); return elements.get(id); }, createElement:element };
  class Worker {
    constructor() { workers.push(this); }
    postMessage(data) { this.data=data; }
    terminate() { this.terminated=true; }
    reply(move) { this.onmessage({data:{token:this.data.token,move}}); }
  }
  const env = {...rules,...pieces,humanColor,seeded,Opponent,document,Worker,URL,playMove:rules.move,undoMove:rules.undo};
  const code=fs.readFileSync('public/games/satranc/js/app.js','utf8').replace(/import\s+[\s\S]*?from\s+["'][^"']+["'];/g,'').replaceAll('import.meta.url',"'https://example.test/games/satranc/js/app.js'");
  const ev = new Function(...Object.keys(env),code+'\nreturn code => eval(code);')(...Object.values(env));
  const get = document.getElementById;
  function start(mode='computer',color='w',difficulty='medium') {
    get('mode').value=mode;get('color').value=color;get('difficulty').value=difficulty;get('setup-form').fire('submit');
  }
  return {ev, get, workers, start, flush:()=>{while(closes.length)closes.shift()();}};
}
