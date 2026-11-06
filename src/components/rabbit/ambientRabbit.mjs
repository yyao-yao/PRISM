/**
 * Reference-based line rig, shared verbatim by About and the offline preview.
 * Matching cubic topology carries the same contours through a side/back turn;
 * there are no image swaps, opacity crossfades, CSS loops, or click reactions.
 */
const NS = 'http://www.w3.org/2000/svg';
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const ease = t => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;
let rigId = 0;

// Left-profile -> back, traced with the reference's long ears, open neck,
// rounded haunches and small circular tail. Every curve retains its identity.
const contours = {
  outline: [
    'M82 114 C67 111 57 126 52 137 C36 142 35 153 49 160 C56 164 63 165 66 168 C68 181 62 196 59 211 C53 238 55 274 59 292 C47 300 29 308 28 316 C27 325 48 325 66 323 C84 333 124 329 140 317 C152 310 162 290 162 275 C163 260 158 247 149 238 C133 216 116 205 106 195 C101 189 100 183 102 177 C103 172 104 168 106 164 C116 146 105 127 94 121',
    'M64 112 C55 126 50 144 55 154 C57 160 60 164 64 165 C51 177 47 191 46 204 C32 221 25 239 24 252 C8 269 8 300 23 318 C28 325 31 329 37 331 C45 334 58 335 72 335 C82 336 98 336 108 335 C122 335 135 334 143 331 C162 322 170 295 165 275 C163 265 160 258 156 252 C155 231 143 212 134 204 C133 187 123 172 116 165 C130 158 129 137 116 112',
  ],
  nearEar: [
    'M82 115 C76 90 84 47 118 17 C125 13 120 36 110 61 C104 77 95 101 94 119',
    'M64 112 C47 91 31 52 39 16 C41 7 58 32 68 57 C76 78 78 99 76 110',
  ],
  farEar: [
    'M95 120 C98 91 119 51 148 34 C156 31 145 57 129 75 C115 92 107 108 106 125',
    'M104 110 C102 84 114 46 137 16 C144 7 147 31 144 52 C141 76 127 99 116 112',
  ],
  nearEarInner: [
    'M86 103 C87 82 103 48 114 28',
    'M69 103 C60 87 51 68 48 59',
  ],
  farEarInner: [
    'M104 111 C117 88 135 60 144 44',
    'M111 103 C120 87 129 68 132 59',
  ],
  crown: [
    'M84 116 C88 116 91 118 95 120',
    'M78 111 C85 109 95 109 102 111',
  ],
  leg: [
    'M69 225 C73 253 69 285 66 306 C64 314 71 316 78 315',
    'M62 299 C66 309 69 316 72 321 C73 327 72 332 72 335',
  ],
  foot: [
    'M135 304 C122 302 110 308 106 316 C104 321 116 323 129 321',
    'M108 335 C110 329 109 324 108 321 C112 316 116 309 118 299',
  ],
};

function curvePair(a, b) {
  const pattern = /-?\d+(?:\.\d+)?/g;
  const start = [...a.matchAll(pattern)].map(v => +v[0]);
  const end = [...b.matchAll(pattern)].map(v => +v[0]);
  if (start.length !== end.length || a.replace(pattern, '#') !== b.replace(pattern, '#')) {
    throw new Error('Rabbit contour topology must match.');
  }
  return t => { let i = 0; return a.replace(pattern, () => mix(start[i], end[i++], t).toFixed(2)); };
}

function makeRig() {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const actor = document.createElementNS(NS, 'g');
  const facing = document.createElementNS(NS, 'g');
  facing.setAttribute('fill', 'none');
  facing.setAttribute('stroke', 'currentColor');
  facing.setAttribute('stroke-linecap', 'round');
  facing.setAttribute('stroke-linejoin', 'round');
  // Keep the body contour from showing through the unfilled circular tail.
  const mask = document.createElementNS(NS, 'mask');
  const maskId = `rabbit-tail-${++rigId}`;
  mask.setAttribute('id', maskId);
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  mask.setAttribute('x', '-50'); mask.setAttribute('y', '-50');
  mask.setAttribute('width', '300'); mask.setAttribute('height', '450');
  const white = document.createElementNS(NS, 'rect');
  white.setAttribute('x', '-50'); white.setAttribute('y', '-50');
  white.setAttribute('width', '300'); white.setAttribute('height', '450');
  white.setAttribute('fill', 'white');
  const tailCutout = document.createElementNS(NS, 'circle');
  tailCutout.setAttribute('fill', 'black');
  mask.append(white, tailCutout); svg.append(mask);
  actor.append(facing); svg.append(actor);
  const parts = {};
  for (const [name, poses] of Object.entries(contours)) {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    path.setAttribute('stroke-width', name.endsWith('Inner') ? '.55' : '.85');
    facing.append(path);
    if (name === 'outline') path.setAttribute('mask', `url(#${maskId})`);
    parts[name] = { path, curve: curvePair(...poses) };
  }
  const tail = document.createElementNS(NS, 'circle');
  tail.setAttribute('vector-effect', 'non-scaling-stroke');
  tail.setAttribute('stroke-width', '.85');
  facing.append(tail);
  const eye = document.createElementNS(NS, 'circle');
  eye.setAttribute('cx', '61'); eye.setAttribute('cy', '142');
  eye.setAttribute('r', '1.8'); eye.setAttribute('stroke', 'none');
  eye.setAttribute('fill', 'currentColor'); facing.append(eye);
  return {
    svg,
    draw({ x, y, height, turn, mirror, lift = 0, squash = 1 }) {
      const t = ease(clamp(turn));
      actor.setAttribute('transform', `translate(${x} ${y - lift}) scale(${height / 360} ${height / 360 * squash})`);
      facing.setAttribute('transform', mirror ? 'translate(180 0) scale(-1 1)' : '');
      for (const [name, { path, curve }] of Object.entries(parts)) {
        path.setAttribute('d', curve(t));
        if (name === 'leg' || name === 'foot') path.setAttribute('opacity', String(1 - t));
      }
      tail.setAttribute('cx', String(mix(153, 90, t)));
      tail.setAttribute('cy', String(mix(306, 323, t)));
      tail.setAttribute('r', String(mix(11, 19, t)));
      for (const attr of ['cx', 'cy', 'r']) tailCutout.setAttribute(attr, tail.getAttribute(attr));
      // The eye vanishes before the head reaches the back-facing pose.
      eye.setAttribute('opacity', String(1 - ease(clamp(t * 2.5))));
    },
  };
}

export function mountAmbientRabbit(region, { random = Math.random } = {}) {
  const page = region.closest('[data-academic="page"]');
  const profile = page?.querySelector('[data-academic="profile"]');
  const content = page?.querySelector('[data-academic="content"]');
  if (!page || !profile || !content) return () => {};

  const rig = makeRig();
  region.append(rig.svg);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const between = (a, b) => mix(a, b, clamp(random()));
  let disposed = false, visible = false, safe = false, active = false;
  let timer = 0, raf = 0, started = 0, elapsed = 0, duration = between(5000, 12000);
  let state = 'waiting', geom = null, lastFrame = 0;
  let visitHeight = 0;

  const isHold = () => ['waiting', 'sit', 'away'].includes(state);
  function render() {
    if (!geom) return;
    const absent = state === 'waiting' || state === 'away' || motion.matches;
    rig.svg.style.visibility = absent ? 'hidden' : 'visible';
    region.dataset.rabbitState = state;
    region.dataset.rabbitElapsed = String(Math.round(elapsed));
    if (absent) return;
    const t = clamp(elapsed / duration);
    const height = visitHeight || geom.height;
    const width = height / 2;
    const target = geom.width * .34 - width / 2;
    const hiddenX = -width - 2;
    const peekX = -width * .45;
    let x = target, turn = 1, mirror = true, lift = 0, squash = 1;
    if (state === 'peek') {
      x = mix(hiddenX, peekX, ease(clamp(t / .65))); turn = 0;
    } else if (state === 'enter' || state === 'leave') {
      const leaving = state === 'leave';
      x = mix(leaving ? target : peekX, leaving ? hiddenX : target, ease(t));
      // Two shallow arcs, with zero velocity at take-off and landing.
      const hop = Math.sin(Math.PI * ((t * 2) % 1)) ** 2;
      lift = hop * Math.min(5, height * .04);
      squash = 1 - .012 * hop;
      turn = 0; mirror = !leaving;
    } else if (state === 'settle') {
      turn = t;
    } else if (state === 'turn') {
      // Switch travel direction only while fully back-facing and symmetric.
      turn = 1 - t; mirror = false;
    }
    rig.draw({ x, y: geom.base - height, height, turn, mirror, lift, squash });
  }

  function enterState(next, ms) {
    state = next; elapsed = 0; duration = ms;
    if (next === 'peek') visitHeight = geom.height;
    if (next === 'away') visitHeight = 0;
    render(); schedule();
  }
  function advance() {
    if (state === 'waiting' || state === 'away') enterState('peek', 1700);
    else if (state === 'peek') enterState('enter', 1850);
    else if (state === 'enter') enterState('settle', 1300);
    else if (state === 'settle') enterState('sit', between(7000, 12000));
    else if (state === 'sit') enterState('turn', 1300);
    else if (state === 'turn') enterState('leave', 1850);
    else if (state === 'leave') enterState('away', between(55000, 100000));
  }
  function frame(now) {
    raf = 0;
    if (!active || disposed) return;
    elapsed += Math.min(50, Math.max(0, now - lastFrame));
    lastFrame = now;
    render();
    if (elapsed >= duration) advance();
    else raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (!active || disposed) return;
    if (isHold()) {
      started = performance.now();
      timer = window.setTimeout(() => { timer = 0; elapsed = duration; advance(); }, Math.max(0, duration - elapsed));
    } else {
      lastFrame = performance.now(); raf = requestAnimationFrame(frame);
    }
  }
  function pause() {
    if (timer) { elapsed = Math.min(duration, elapsed + performance.now() - started); clearTimeout(timer); timer = 0; }
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    active = false;
    region.dataset.rabbitRunning = 'false';
  }
  function sync() {
    const shouldRun = !disposed && safe && visible && !document.hidden && !motion.matches;
    region.dataset.rabbitRunning = String(shouldRun);
    if (active === shouldRun) return;
    if (!shouldRun) pause();
    else { active = true; schedule(); }
  }
  function measure() {
    const p = page.getBoundingClientRect();
    const a = profile.getBoundingClientRect();
    const c = content.getBoundingClientRect();
    const desktop = matchMedia('(min-width: 1024px)').matches;
    let left, top, width, height;
    if (desktop) {
      left = a.left - p.left; top = a.bottom - p.top + 40;
      width = Math.min(256, a.width); height = Math.min(200, c.bottom - p.top - top);
    } else {
      // Use only existing bottom padding: no extra mobile row or placeholder.
      left = c.left - p.left; top = c.bottom - p.top + 2;
      width = c.width; height = p.height - top - 2;
    }
    safe = height >= 40 && width >= 120;
    region.style.left = `${left}px`; region.style.top = `${top}px`;
    region.style.width = `${Math.max(0, width)}px`;
    region.style.height = `${Math.max(0, height)}px`;
    const maxHeight = Math.min(desktop ? 132 : 58, height - 8);
    // Resizing never relocates a visible visitor across the page. A fresh
    // visibility delay begins in the new safe area instead.
    const relocated = geom && (Math.abs(geom.width - width) > 2 || geom.desktop !== desktop);
    geom = { desktop, width, height: maxHeight, base: height - 2 };
    rig.svg.setAttribute('viewBox', `0 0 ${Math.max(1, width)} ${Math.max(1, height)}`);
    if (relocated) {
      pause(); state = 'waiting'; elapsed = 0; duration = between(5000, 12000); visitHeight = 0;
    }
    render(); sync();
  }
  function preferenceChanged() {
    pause(); state = 'waiting'; elapsed = 0; duration = between(5000, 12000); visitHeight = 0;
    render(); sync();
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .6;
    sync();
  }, { threshold: [0, .6], rootMargin: '-80px 0px 0px 0px' });
  const resize = new ResizeObserver(measure);
  resize.observe(page); resize.observe(profile); resize.observe(content);
  observer.observe(region);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', preferenceChanged);
  window.addEventListener('resize', measure);
  measure();

  return () => {
    disposed = true; pause(); observer.disconnect(); resize.disconnect();
    document.removeEventListener('visibilitychange', sync);
    motion.removeEventListener('change', preferenceChanged);
    window.removeEventListener('resize', measure);
    rig.svg.remove();
  };
}
