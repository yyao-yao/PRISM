// Deterministic tests of the actual extracted canvas effect, without a browser.
// Browser checks cover real font sampling, input events, routes, and rendering.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source = fs.readFileSync('src/components/entrance/ParticleTitle.tsx', 'utf8');
const types = source.slice(source.indexOf('export type ParticlePhrase'), source.indexOf('export default')).replace('export type', 'type');
const body = source.slice(source.indexOf('    const element ='), source.indexOf('  }, []);'));
const code = ts.transpileModule(`${types}\nfunction setup(){${body.replace('    return () => {', '    globalThis.inspect = () => ({ particles, targets, morph, activePhrase });\n    return () => {')} }\nglobalThis.setup = setup;`, {compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
function world() {
  let time=0, id=0, seed=42, reduced=false, hidden=false, resize;
  const frames=new Map(), listeners=[];
  const target=()=>{const map=new Map();listeners.push(map);return {addEventListener:(k,f)=>map.set(k,f),removeEventListener:(k,f)=>{assert.equal(map.get(k),f);map.delete(k);},fire:k=>map.get(k)?.()};};
  const media=target(),window=target(),document=target(),html=target();
  Object.defineProperty(media,'matches',{get:()=>reduced});Object.defineProperty(document,'hidden',{get:()=>hidden});
  const math=Object.create(Math);math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function canvas() {
    const element={width:0,height:0,dataset:{},getBoundingClientRect:()=>({width:420,height:86,left:0,top:0})};
    const context={setTransform(){},clearRect(){},beginPath(){},arc(){},fill(){},fillText(label){this.label=label;},measureText(label){return {width:label==='YAO YAO'?390:680};},getImageData(){
      const w=element.width,h=element.height,data=new Uint8ClampedArray(w*h*4),name=this.label==='YAO YAO';
      for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(y>h*(name ? .18 : .34)&&y<h*(name ? .82 : .66)&&x>w*.04&&x<w*.96&&(x%(w/(name?7:12)))<w*(name ? .055 : .028))data[(y*w+x)*4+3]=255;
      return {data};
    }};
    element.getContext=()=>context;return element;
  }
  const element=canvas(),engine={current:null},desired={current:'YAO YAO'};
  Object.assign(window,{devicePixelRatio:1,matchMedia:()=>media});Object.assign(document,{documentElement:html,createElement:canvas});
  const sandbox={window,document,Math:math,canvas:{current:element},engine,desired,setReady(){},performance:{now:()=>time},getComputedStyle:()=>({getPropertyValue:()=>''}),
    ResizeObserver:class{constructor(fn){resize=fn;}observe(){}disconnect(){}},MutationObserver:class{observe(){}disconnect(){}},
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id)};
  vm.createContext(sandbox);vm.runInContext(code,sandbox);const cleanup=sandbox.setup();
  const tick=(n=1)=>{for(let i=0;i<n;i++){time+=1000/60;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));}};
  return {tick,element,inspect:()=>sandbox.inspect(),set:(label,animated=true)=>engine.current.setPhrase(label,animated),resize:()=>resize(),
    reduced:value=>{reduced=value;media.fire('change');},hidden:value=>{hidden=value;document.fire('visibilitychange');},
    close:()=>{cleanup();assert.equal(frames.size,0);assert.equal(engine.current,null);listeners.forEach(map=>assert.equal(map.size,0));}};
}
const w=world();w.tick();const initial=w.inspect().particles.map(p=>({x:p.x,y:p.y,size:p.size,blue:p.blue}));
const visible=()=>w.inspect().particles.filter(p=>p.alpha===1).length;
const countName=w.inspect().targets['YAO YAO'].filter(p=>p.alpha===1).length;
const countGreeting=w.inspect().targets['Nice to meet you.'].filter(p=>p.alpha===1).length;
assert.notEqual(countName,countGreeting);assert.equal(visible(),countName);
w.set('Nice to meet you.');w.tick(18);assert.equal(w.element.dataset.morphState,'flowing');assert(w.inspect().particles.some(p=>p.alpha>0&&p.alpha<1));
assert(w.inspect().particles.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.alpha>=0&&p.alpha<=1));
const curved=w.inspect().particles.filter(p=>p.path&&Math.hypot(p.path.toX-p.path.fromX,p.path.toY-p.path.fromY)>20).some(p=>{
  const path=p.path,dx=path.toX-path.fromX,dy=path.toY-path.fromY;
  return Math.abs((p.homeX-path.fromX)*dy-(p.homeY-path.fromY)*dx)/Math.hypot(dx,dy)>3;
});assert(curved,'Per-particle paths must curve away from straight interpolation.');
w.tick(54);assert.equal(w.element.dataset.morphState,'flowing');w.tick(7);assert.equal(w.element.dataset.morphState,'settled');assert.equal(visible(),countGreeting);
w.set('YAO YAO');w.tick(79);assert.equal(visible(),countName);
w.inspect().particles.forEach((p,i)=>{assert(Math.abs(p.x-initial[i].x)<1e-8);assert(Math.abs(p.y-initial[i].y)<1e-8);assert.equal(p.size,initial[i].size);assert.equal(p.blue,initial[i].blue);});
console.log('PASS 1.3-second loosen/curved-flow/reform; unequal counts fade without duplicate density; exact original cloud appearance after return.');
w.set('Nice to meet you.');w.tick(17);const before=w.inspect().particles.map(p=>({x:p.x,y:p.y,alpha:p.alpha}));w.set('YAO YAO');
w.inspect().particles.forEach((p,i)=>{assert.equal(p.x,before[i].x);assert.equal(p.y,before[i].y);assert.equal(p.alpha,before[i].alpha);});
w.tick(8);w.set('Nice to meet you.');w.tick(79);assert.equal(w.element.dataset.phrase,'Nice to meet you.');assert.equal(w.element.dataset.morphState,'settled');
w.set('YAO YAO',false);assert.equal(w.element.dataset.morphState,'settled');assert.equal(visible(),countName);
w.reduced(true);w.set('Nice to meet you.');assert.equal(w.element.dataset.morphState,'settled');assert.equal(visible(),countGreeting);
w.reduced(false);w.set('YAO YAO');w.tick(10);w.reduced(true);assert.equal(w.element.dataset.morphState,'settled');assert.equal(visible(),countName);
w.reduced(false);w.set('Nice to meet you.');w.tick(12);w.hidden(true);assert.equal(w.element.dataset.morphState,'settled');w.hidden(false);w.resize();assert.equal(w.element.dataset.phrase,'Nice to meet you.');
w.set('YAO YAO');w.tick(6);w.close();
console.log('PASS rapid retarget without snapping; instant Home reset; reduced motion before/during transition; visibility/resize recovery; cleanup during morph.');
