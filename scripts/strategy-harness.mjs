import fs from 'node:fs';
import vm from 'node:vm';
// Executes the real inline game; only the test process gets closure access.
export function loadStrategy(file, seed=4242){
 const html=fs.readFileSync(file,'utf8');let code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 code=code.replace(/\}\)\(\);\s*$/, 'var before,after,old,wage,cash,saved,m,c,d,t,fresh;window.testEval=sourceText=>eval(sourceText);})();');
 const store=new Map(), elements=new Map(), tasks=[];
 const canvas=new Proxy({measureText:t=>({width:String(t).length*7})},{get:(o,k)=>o[k]||(()=>{})});
 function node(tag='div') {const n={tagName:tag.toUpperCase(),style:{setProperty(){}},children:[],dataset:{},attributes:{},textContent:'',value:'',className:'',classList:{add(){},remove(){},toggle(){},contains(){return false;}},get firstChild(){return this.children[0]||null;},appendChild(c){this.children.push(c);c.parentNode=this;return c;},removeChild(c){this.children=this.children.filter(x=>x!==c);},setAttribute(k,v){this.attributes[k]=v;if(k==='id')elements.set(v,this);if(k==='disabled')this.disabled=true;},getAttribute(k){return this.attributes[k]||null;},removeAttribute(k){delete this.attributes[k];},addEventListener(){},removeEventListener(){},focus(){},select(){},click(){},querySelectorAll(){return [];},querySelector(){return null;},getContext:()=>canvas,getBoundingClientRect:()=>({width:390,height:390,top:0,left:0}),contains(){return false;}};return n;}
 const doc={documentElement:node(),body:node(),hidden:false,getElementById(id){if(!elements.has(id))elements.set(id,node(id==='cv'?'canvas':'div'));return elements.get(id);},createTextNode:t=>Object.assign(node(),{textContent:t}),createElement:node,createElementNS:(ns,t)=>node(t),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},execCommand:()=>true};
 let time=100000;const FakeDate=class extends Date{static now(){return time+=1000;}};
 const randomMath=Object.create(Math);randomMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const context={Math:randomMath,document:doc,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},navigator:{},location:{protocol:'file:',hash:''},history:{pushState(){},back(){}},Date:FakeDate,console,innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener(){},matchMedia:()=>({matches:true,addEventListener(){}}),setTimeout:fn=>{tasks.push(fn);return tasks.length;},clearTimeout(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},Blob,URL,TextEncoder};context.window=context;context.self=context;
 vm.createContext(context);vm.runInContext(code,context,{timeout:3000});
 return {ev:c=>vm.runInContext('testEval('+JSON.stringify(c)+')',context,{timeout:5000}),store,doc,flush(n=1000){while(tasks.length&&n-->0)tasks.shift()();},context};
}
