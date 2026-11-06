'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './entrance.module.css';

interface Particle { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; size: number; blue: boolean }
interface PointerSample { x: number; y: number; time: number; vx: number; vy: number }
interface Wake { ax: number; ay: number; dx: number; dy: number; lengthSquared: number; ux: number; uy: number; energy: number; time: number }

export default function ParticleTitle() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let cell = 14;
    let columns = 0;
    let rows = 0;
    let fieldX = new Float32Array(0);
    let fieldY = new Float32Array(0);
    let frame = 0;
    let lastTime = 0;
    let pointer: PointerSample | null = null;
    let wakes: Wake[] = [];
    const wakeLifetime = 240;
    const maxWakes = 12;
    let ink = '#243148';
    let accent = '#3678e8';

    const draw = () => {
      context.clearRect(0, 0, width, height);
      for (const p of particles) {
        context.fillStyle = p.blue ? accent : ink;
        context.globalAlpha = p.blue ? 0.8 : 0.66 + p.size * 0.12;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };

    const colors = () => {
      const css = getComputedStyle(element);
      ink = css.getPropertyValue('--portal-ink').trim() || ink;
      accent = css.getPropertyValue('--portal-blue').trim() || accent;
      draw();
    };

    const resize = () => {
      const rect = element.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      pointer = null;
      wakes = [];
      if (!width || !height) return;
      cell = Math.max(10, Math.min(18, width / 70));
      columns = Math.ceil(width / cell) + 1;
      rows = Math.ceil(height / cell) + 1;
      fieldX = new Float32Array(columns * rows);
      fieldY = new Float32Array(columns * rows);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const mask = document.createElement('canvas');
      mask.width = Math.ceil(width);
      mask.height = Math.ceil(height);
      const text = mask.getContext('2d');
      if (!text) return;
      text.font = `900 ${width * 0.205}px Arial, sans-serif`;
      const measure = text.measureText('YAO YAO');
      const scale = width * 0.94 / measure.width;
      text.font = `900 ${width * 0.205 * scale}px Arial, sans-serif`;
      text.textAlign = 'center';
      text.textBaseline = 'middle';
      text.fillText('YAO YAO', width / 2, height * 0.51);
      const pixels = text.getImageData(0, 0, mask.width, mask.height).data;
      // Adaptive sampling keeps thousands of dots without a DOM node per particle.
      const spacing = Math.max(1.65, width / 310);
      particles = [];
      for (let y = spacing; y < height; y += spacing) {
        for (let x = spacing; x < width; x += spacing) {
          if (pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] < 150) continue;
          const jitter = () => (Math.random() - 0.5) * spacing * 0.32;
          const homeX = x + jitter();
          const homeY = y + jitter();
          particles.push({ x: homeX, y: homeY, homeX, homeY, vx: 0, vy: 0, size: spacing * (0.22 + Math.random() * 0.12), blue: Math.random() < 0.075 });
        }
      }
      colors();
      setReady(true);
      start();
    };

    const animate = (time: number) => {
      const dt = Math.max(0, Math.min((time - (lastTime || time)) / 16.667, 2));
      lastTime = time;
      const radius = Math.min(78, Math.max(32, width * 0.075));
      const motionScale = Math.min(1, width / 800);
      const travel = Math.max(10, Math.min(34, width * 0.04));
      // Short-lived swept segments cover the space BETWEEN pointer events. A
      // bounded history keeps fast strokes continuous without leaving long trails.
      wakes = wakes.filter(wake => time - wake.time < wakeLifetime);
      const fields = wakes.map(wake => {
        const age = Math.max(0, time - wake.time) / wakeLifetime;
        const fade = (1 - age) ** 2;
        const spread = radius * (0.85 + wake.energy * 0.3);
        return { ...wake, fade, spread,
          minX: Math.min(wake.ax, wake.ax + wake.dx) - spread * 3.3,
          maxX: Math.max(wake.ax, wake.ax + wake.dx) + spread * 3.3,
          minY: Math.min(wake.ay, wake.ay + wake.dy) - spread * 3.3,
          maxY: Math.max(wake.ay, wake.ay + wake.dy) + spread * 3.3 };
      });
      // Evaluate the fluid field on a small shared grid, then interpolate it for
      // each particle. This avoids thousands of repeated Gaussian evaluations.
      if (fields.length) {
        for (let row = 0; row < rows; row++) {
          const y = row * cell;
          for (let column = 0; column < columns; column++) {
            const x = column * cell;
            const variation = 1 + 0.18 * Math.sin(x * 0.023 + y * 0.041);
            let flowX = 0;
            let flowY = 0;
            let weightSum = 0;
            let peak = 0;
            for (const field of fields) {
              if (x < field.minX || x > field.maxX || y < field.minY || y > field.maxY) continue;
              const along = Math.max(0, Math.min(1,
                ((x - field.ax) * field.dx + (y - field.ay) * field.dy) / field.lengthSquared));
              const dx = (x - field.ax - field.dx * along) / field.spread;
              const dy = (y - field.ay - field.dy * along) / field.spread;
              // A slightly asymmetric Gaussian has no visible circular edge. The
              // spatial variation is fixed, so the field doesn't flicker or ripple.
              const side = dx * -field.uy + dy * field.ux;
              const softness = variation + 0.12 * side / (1 + Math.abs(side));
              const weight = Math.exp(-(dx * dx + dy * dy) * 1.6 / softness) * field.fade * field.energy;
              // Directional drag leads; a restrained curl and a little outward slip
              // let the stream bend around the pointer rather than excavate a hole.
              flowX += (field.ux - dy * 0.22 + dx * 0.09) * weight;
              flowY += (field.uy + dx * 0.22 + dy * 0.09) * weight;
              weightSum += weight;
              peak = Math.max(peak, weight);
            }
            // Normalize overlapping samples: higher event rates must not multiply
            // the force. Motion stops feeding the field as soon as the pointer rests.
            const force = weightSum > 0 ? 0.72 * motionScale * peak / weightSum : 0;
            const index = row * columns + column;
            fieldX[index] = flowX * force;
            fieldY[index] = flowY * force;
          }
        }
      }
      // Small integration steps keep the spring consistent at 30/60/120 Hz.
      const steps = Math.max(1, Math.ceil(dt * 2));
      const step = dt / steps;
      const damping = Math.exp(-0.25 * step);
      let unsettled = fields.length > 0;
      for (const p of particles) {
        let forceX = 0;
        let forceY = 0;
        if (fields.length) {
          const gx = Math.max(0, Math.min(columns - 1.001, p.x / cell));
          const gy = Math.max(0, Math.min(rows - 1.001, p.y / cell));
          const column = Math.floor(gx);
          const row = Math.floor(gy);
          const fx = gx - column;
          const fy = gy - row;
          const index = row * columns + column;
          const a = (1 - fx) * (1 - fy);
          const b = fx * (1 - fy);
          const c = (1 - fx) * fy;
          const d = fx * fy;
          forceX = fieldX[index] * a + fieldX[index + 1] * b + fieldX[index + columns] * c + fieldX[index + columns + 1] * d;
          forceY = fieldY[index] * a + fieldY[index + 1] * b + fieldY[index + columns] * c + fieldY[index + columns + 1] * d;
        }
        for (let i = 0; i < steps; i++) {
          const offsetX = p.x - p.homeX;
          const offsetY = p.y - p.homeY;
          const spring = 0.016 * (1 + (offsetX * offsetX + offsetY * offsetY) / (travel * travel));
          p.vx = (p.vx + (forceX - offsetX * spring) * step) * damping;
          p.vy = (p.vy + (forceY - offsetY * spring) * step) * damping;
          p.x += p.vx * step;
          p.y += p.vy * step;
        }
        const distanceSquared = (p.x - p.homeX) ** 2 + (p.y - p.homeY) ** 2;
        if (distanceSquared > 0.0001 || p.vx * p.vx + p.vy * p.vy > 0.0001) unsettled = true;
        else if (!fields.length) { p.x = p.homeX; p.y = p.homeY; p.vx = p.vy = 0; }
      }
      draw();
      // Once calm, leave a static canvas rather than repainting identical dots.
      frame = unsettled ? requestAnimationFrame(animate) : 0;
      if (!unsettled) lastTime = 0;
    };
    const start = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      pointer = null;
      wakes = [];
      if (reducedMotion.matches || document.hidden) {
        particles.forEach(p => { p.x = p.homeX; p.y = p.homeY; p.vx = p.vy = 0; });
        draw();
      } else frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion.matches || document.hidden) return;
      const rect = element.getBoundingClientRect();
      const coalesced = event.getCoalescedEvents?.();
      const samples = coalesced?.length ? coalesced : [event];
      const count = Math.min(samples.length, 8);
      for (let i = 0; i < count; i++) {
        const sample = samples[count === 1 ? 0 : Math.round(i * (samples.length - 1) / (count - 1))];
        const x = sample.clientX - rect.left;
        const y = sample.clientY - rect.top;
        const time = sample.timeStamp;
        if (pointer) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const length = Math.hypot(dx, dy);
          // Duplicate/stationary samples never sustain an empty region.
          if (length < 0.1) continue;
          const gap = time - pointer.time;
          const elapsed = Math.max(4, Math.min(40, gap));
          const blend = 1 - Math.exp(-elapsed / 24);
          const memory = Math.exp(-Math.max(0, gap - 40) / 60);
          const vx = pointer.vx * memory * (1 - blend) + dx / elapsed * blend;
          const vy = pointer.vy * memory * (1 - blend) + dy / elapsed * blend;
          const speed = Math.hypot(vx, vy) * 0.65 + length / elapsed * 0.35;
          // Saturation makes quick sweeps more expressive without explosive kicks.
          const energy = 1 - Math.exp(-speed / 0.85);
          wakes.push({ ax: pointer.x, ay: pointer.y, dx, dy, lengthSquared: length * length,
            ux: dx / length, uy: dy / length, energy, time });
          if (wakes.length > maxWakes) wakes.shift();
          pointer = { x, y, time, vx, vy };
        } else pointer = { x, y, time, vx: 0, vy: 0 };
      }
      if (wakes.length && !frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    const leave = () => { pointer = null; };
    const observer = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(colors);
    observer.observe(element);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);
    resize();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', start);
      reducedMotion.removeEventListener('change', start);
    };
  }, []);

  return <><canvas ref={canvas} className={styles.canvas} aria-hidden="true" />{!ready && <span className={styles.fallback} aria-hidden="true">YAO YAO</span>}</>;
}
