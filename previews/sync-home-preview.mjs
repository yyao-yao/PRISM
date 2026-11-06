// Rebuild the dependency-free review HTML from the actual Home markup and engines.
// Run from the repository root: node previews/sync-home-preview.mjs
import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';

const read = path => fs.readFileSync(path, 'utf8');
const compile = code => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None } }).outputText;
const navigation = {};
new Function('exports', ts.transpileModule(read('src/lib/navigation.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(navigation);
const jsx = read('src/components/entrance/DigitalEntrance.tsx');
let markup = jsx.slice(jsx.indexOf('<section ref={portal}'), jsx.lastIndexOf('</section>') + '</section>'.length);
const links = navigation.PRIMARY_NAVIGATION.map(item => `<a href="${item.id === 'home' ? './prism-stage1-preview.html' : item.href}"${item.id === 'home' ? ' aria-current="page"' : ''}>${item.title}</a>`).join('');
markup = markup.replace(/\{(?:PRIMARY_NAVIGATION|getPrimaryNavigation\(locale\))\.map\([\s\S]*?<\/Link>\)\}/, links);
markup = markup.replace(/\{\(\['light', 'dark', 'system'\][\s\S]*?<\/button>\)\}/, ['light', 'dark', 'system'].map(theme => `<button type="button" data-theme="${theme}" aria-pressed="${theme === 'light'}">${theme}</button>`).join(''));
markup = markup.replace(/<ParticleTitle[^>]*\/>/, '<canvas id="particles" class="canvas" aria-hidden="true"></canvas><span id="fallback" class="fallback" aria-hidden="true">YAO YAO</span>');
markup = markup.replace(/className=\{`([^`]+)`\}/g, (_, value) => `class="${value.replace(/\$\{styles\.(\w+)\}/g, '$1')}"`)
  .replace(/className=\{styles\.(\w+)\}/g, 'class="$1"')
  .replace(/ ref=\{\w+\}/g, '')
  .replace(/<Link\b/g, '<a').replaceAll('</Link>', '</a>')
  .replace('<section ', '<section id="portal" ')
  .replace(/<(div|span|p|i)([^<>]*?)\s*\/>/g, '<$1$2></$1>');
assert(!markup.includes('className') && !markup.includes('{'), 'Unconverted Home markup');
assert.equal((markup.match(/data-signal(?:\s|>)/g) || []).length, 10);

const source = read('src/components/entrance/ParticleTitle.tsx');
const types = source.slice(source.indexOf('interface Particle'), source.indexOf('export default'));
const body = source.slice(source.indexOf('    const element ='), source.indexOf('  }, []);'));
const engine = compile(`${types}\nfunction setup() {\n${body}\n}`);
const symbols = compile(read('src/components/entrance/animateSignals.ts').replace('export function', 'function'));
const interaction = compile(read('src/components/entrance/homeInteraction.ts').replace('export function', 'function'));
const css = read('src/components/entrance/entrance.module.css').replaceAll(':global(.dark)', '.dark');
const script = `
const canvas={current:document.getElementById('particles')};
const setReady=ready=>document.getElementById('fallback').classList.toggle('hidden',ready);
${engine}
${symbols}
${interaction}
const cleanupParticles=setup();
const cleanupSignals=animateSignals(document.querySelector('.signals'));
const cleanupNavigation=bindHomeNavigation(document.getElementById('portal'),()=>window.location.assign('/about/'));
let selectedTheme='light';
const system=matchMedia('(prefers-color-scheme: dark)');
function applyTheme(){const dark=selectedTheme==='dark'||(selectedTheme==='system'&&system.matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.classList.toggle('light',!dark);document.querySelectorAll('[data-theme]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.theme===selectedTheme)));}
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>{selectedTheme=button.dataset.theme;applyTheme();}));system.addEventListener('change',applyTheme);
applyTheme();
`;
const html = `<!doctype html>
<html lang="en" class="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><title>Yao Yao — Standalone Home Preview</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f6f8}button{font:inherit}p,h1{margin-top:0}
${css}
.preview-label{position:fixed;bottom:82px;left:50%;transform:translateX(-50%);z-index:101;font:9px/1.5 monospace;text-align:center;color:var(--portal-muted,#68758b);white-space:nowrap;pointer-events:none}.dark .preview-label{color:#8996aa}.hidden{display:none!important}
</style></head><body><main>
${markup}
</main><div class="preview-label">STANDALONE HOME PREVIEW<br>Local file · no deployment · no audio</div>
<script>${script}</script></body></html>`;
fs.writeFileSync('previews/prism-stage1-preview.html', html);
console.log('Generated matching Home markup, navigation, particle engine, gesture binding, star helper and styles.');
