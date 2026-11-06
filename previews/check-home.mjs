// Deterministic tests of the fixed-name canvas effect and guarded Home navigation.
// Browser checks cover real input events, links, routes, and rendering.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = fs.readFileSync('src/components/entrance/ParticleTitle.tsx', 'utf8');
const types = source.slice(source.indexOf('interface Particle'), source.indexOf('export default'));
const body = source.slice(source.indexOf('    const element ='), source.indexOf('  }, []);'));
const code = ts.transpileModule(`${types}\nfunction setup(){${body.replace('    return () => {', '    globalThis.inspect = () => ({ particles, pointer, wakes });\n    return () => {')} }\nglobalThis.setup = setup;`, {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
function world() {
  let time=0, id=0, seed=42, reduced=false, hidden=false, resize;
  const frames=new Map(), listeners=[];
  const target=()=>{const map=new Map();listeners.push(map);return {addEventListener:(k,f)=>map.set(k,f),removeEventListener:(k,f)=>{assert.equal(map.get(k),f);map.delete(k);},fire:(k,e)=>map.get(k)?.(e)};};
  const media=target(),window=target(),document=target(),html=target();
  Object.defineProperty(media,'matches',{get:()=>reduced});Object.defineProperty(document,'hidden',{get:()=>hidden});
  const math=Object.create(Math);math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function canvas() {
    const element={width:0,height:0,dataset:{},getBoundingClientRect:()=>({width:420,height:86,left:0,top:0})};
    const context={setTransform(){},clearRect(){},beginPath(){},arc(){},fill(){},fillText(label){this.label=label;},measureText(){return {width:390};},getImageData(){
      const w=element.width,h=element.height,data=new Uint8ClampedArray(w*h*4);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(y>h*.18&&y<h*.82&&x>w*.04&&x<w*.96&&(x%(w/7))<w*.055)data[(y*w+x)*4+3]=255;
      return {data};
    }};
    element.getContext=()=>context;return element;
  }
  const element=canvas();
  Object.assign(window,{devicePixelRatio:1,matchMedia:()=>media});Object.assign(document,{documentElement:html,createElement:canvas});
  const sandbox={window,document,Math:math,canvas:{current:element},setReady(){},performance:{now:()=>time},getComputedStyle:()=>({getPropertyValue:()=>''}),
    ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){}},MutationObserver:class{observe(){}disconnect(){}},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
  vm.createContext(sandbox);vm.runInContext(code,sandbox);const cleanup=sandbox.setup();
  const tick=(n=1)=>{for(let i=0;i<n;i++){time+=1000/60;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}};
  return {tick,element,inspect:()=>sandbox.inspect(),move:(x,y)=>window.fire('pointermove',{pointerType:'mouse',clientX:x,clientY:y,timeStamp:time}),resize:()=>resize(),
    reduced:value=>{reduced=value;media.fire('change');},hidden:value=>{hidden=value;document.fire('visibilitychange');},
    close:()=>{cleanup();assert.equal(frames.size,0);listeners.forEach(map=>assert.equal(map.size,0));}};
}
const w=world();w.tick();assert(w.inspect().particles.length>1000);
w.move(70,40);w.tick(3);w.move(170,40);w.tick(15);
const displacement=()=>Math.max(...w.inspect().particles.map(p=>Math.hypot(p.x-p.homeX,p.y-p.homeY)));
assert(displacement()>1);w.tick(240);assert(displacement()<.05);
w.move(230,40);w.tick(4);w.reduced(true);assert.equal(displacement(),0);w.move(80,40);w.tick(10);assert.equal(displacement(),0);
w.reduced(false);w.move(140,40);w.tick(4);w.hidden(true);assert.equal(displacement(),0);w.hidden(false);w.resize();assert.equal(displacement(),0);w.close();
assert(source.includes("text.fillText('YAO YAO'"));assert(!source.includes('Nice to meet you.'));assert(!source.includes('morph'));
console.log('PASS fixed-name sampling, mouse dispersion/restoration, reduced motion, visibility/resize handling and cleanup.');

const inputSource=fs.readFileSync('src/components/entrance/homeInteraction.ts','utf8');
const inputCode=ts.transpileModule(inputSource.replace('export function','function')+'\nglobalThis.bind = bindHomeNavigation;', {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
class ElementStub { constructor(kind){this.kind=kind;} closest(selector){if(selector==='[data-particle-link]')return this.kind==='title'?this:null;return this.kind==='control'||this.kind==='title'?this:null;} }
const events=new Map();let navigations=0,selected=false;
const root={addEventListener:(k,f)=>events.set(k,f),removeEventListener:(k,f)=>{assert.equal(events.get(k),f);events.delete(k);}};
const input={Element:ElementStub,window:{getSelection:()=>({isCollapsed:!selected})}};vm.createContext(input);vm.runInContext(inputCode,input);const cleanup=input.bind(root,()=>navigations++);
function emit(kind,element,extra={}){const event={target:element,pointerId:1,isPrimary:true,button:0,clientX:10,clientY:10,detail:1,defaultPrevented:false,...extra,preventDefault(){this.defaultPrevented=true;}};events.get(kind)?.(event);return event;}
const background=new ElementStub('background'),control=new ElementStub('control'),title=new ElementStub('title');
emit('pointerdown',background);emit('click',background);assert.equal(navigations,1);
emit('pointerdown',control);assert(!emit('click',control).defaultPrevented);assert.equal(navigations,1);
emit('pointerdown',title);assert(!emit('click',title).defaultPrevented);assert.equal(navigations,1); // native anchor handles navigation
emit('pointerdown',title);emit('pointermove',title,{clientX:35});emit('pointerup',title);assert(emit('click',title).defaultPrevented);
emit('pointerdown',background);emit('pointercancel',background);emit('click',background);assert.equal(navigations,1);
emit('pointerdown',background);emit('click',background,{ctrlKey:true});assert.equal(navigations,1);
emit('pointerdown',background);selected=true;emit('click',background);assert.equal(navigations,1);assert(!emit('click',title,{detail:0}).defaultPrevented);selected=false;
emit('pointerdown',background);emit('click',background,{defaultPrevented:true});assert.equal(navigations,1);
cleanup();assert.equal(events.size,0);
console.log('PASS one background navigation; normal controls/native title link; keyboard link activation; drag/cancel/selection/modifier guards; cleanup.');
