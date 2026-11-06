'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './entrance.module.css';

interface Particle { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; size: number; blue: boolean }
interface PointerSample { x: number; y: number; time: number; vx: number; vy: number }
interface Wake { ax: number; ay: number; dx: number; dy: number; lengthSquared: number; ux: number; uy: number; speed: number; time: number }

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
    let frame = 0;
    let lastTime = 0;
    let pointer: PointerSample | null = null;
    let wakes: Wake[] = [];
    const wakeLifetime = 100;
    const maxWakes = 4;
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
      // Keep the original independent scatter and spring, with only a small
      // directional stretch and shear at the edge of the pointer disturbance.
      const baseRadius = Math.min(115, Math.max(55, width * 0.12));
      const motionScale = Math.min(1, width / 700);
      const travel = Math.max(14, Math.min(30, width * 0.045));
      wakes = wakes.filter(wake => time - wake.time < wakeLifetime);
      const sources = wakes.map(wake => {
        const slow = 1 / (1 + wake.speed / 0.55);
        return { ...wake, radius: baseRadius * (1 + slow * 0.1),
          gain: 0.85 + slow * 0.25,
          fade: Math.max(0, 1 - (time - wake.time) / wakeLifetime) ** 2 * 0.65,
          moving: Math.min(1, wake.speed / 0.12) };
      });
      if (pointer) {
        const speed = Math.hypot(pointer.vx, pointer.vy);
        const slow = 1 / (1 + speed / 0.55);
        // A pause fades the disturbance instead of maintaining a circular hole.
        // Slow brushing is a little fuller and lingers longer than fast strokes.
        const fade = Math.max(0, 1 - (time - pointer.time) / (260 + slow * 320)) ** 2;
        if (fade > 0) sources.push({ ax: pointer.x, ay: pointer.y, dx: 0, dy: 0,
          lengthSquared: 1, ux: speed > 0.001 ? pointer.vx / speed : 0,
          uy: speed > 0.001 ? pointer.vy / speed : 0, speed, time: pointer.time,
          radius: baseRadius * (1 + slow * 0.1), gain: 0.85 + slow * 0.25,
          fade, moving: Math.min(1, speed / 0.12) });
      }
      const steps = Math.max(1, Math.ceil(dt * 2));
      const step = dt / steps;
      const damping = Math.pow(0.88, step);
      let unsettled = sources.length > 0;
      for (const p of particles) {
        let forceX = 0;
        let forceY = 0;
        let weightSum = 0;
        let peak = 0;
        for (const source of sources) {
          // Project onto the brief swept segment so sparse/fast events still
          // brush particles between positions. No shared group-advection field.
          const alongSegment = Math.max(0, Math.min(1,
            ((p.x - source.ax) * source.dx + (p.y - source.ay) * source.dy) / source.lengthSquared));
          const dx = p.x - source.ax - source.dx * alongSegment;
          const dy = p.y - source.ay - source.dy * alongSegment;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared > source.radius * source.radius * 8) continue;
          const along = dx * source.ux + dy * source.uy;
          const across = dx * -source.uy + dy * source.ux;
          const behind = 0.5 - along / (2 * (Math.abs(along) + source.radius * 0.3));
          const stretch = 1 + 0.24 * behind * source.moving;
          const qSquared = (along * along / (stretch * stretch) + across * across) / (source.radius * source.radius);
          // With no direction yet, retain a soft, round initial touch.
          const q = source.ux || source.uy ? qSquared : distanceSquared / (source.radius * source.radius);
          // Preserve the older quadratic repulsion profile; just feather its
          // perimeter with a faint tail instead of replacing the whole motion.
          const core = Math.max(0, 1 - Math.sqrt(q));
          const weight = (core * core + 0.022 * Math.exp(-q * 4)) * source.fade * source.gain;
          const distance = Math.sqrt(distanceSquared + 16);
          // Outward scatter is dominant, just like the earlier version. The
          // tiny drag lives only in the skirt, like water brushed by a fingertip.
          const skirt = q * Math.exp(-q * 3) * source.moving;
          const slip = 0.06 * skirt;
          const curl = 0.025 * skirt * across / source.radius;
          forceX += (dx / distance * 0.82 + source.ux * slip - source.uy * curl) * weight;
          forceY += (dy / distance * 0.82 + source.uy * slip + source.ux * curl) * weight;
          weightSum += weight;
          peak = Math.max(peak, weight);
        }
        // Overlapping path samples blend without multiplying the disturbance.
        const strength = weightSum > 0 ? motionScale * peak / weightSum : 0;
        for (let i = 0; i < steps; i++) {
          const offsetX = p.x - p.homeX;
          const offsetY = p.y - p.homeY;
          // The original spring is unchanged through ordinary motion. A soft
          // guard beyond that range keeps long slow strokes from pulling text apart.
          const excess = Math.max(0, (offsetX * offsetX + offsetY * offsetY) / (travel * travel) - 1);
          const spring = 0.013 * (1 + excess * excess);
          p.vx = (p.vx + (forceX * strength - offsetX * spring) * step) * damping;
          p.vy = (p.vy + (forceY * strength - offsetY * spring) * step) * damping;
          p.x += p.vx * step;
          p.y += p.vy * step;
        }
        const distanceSquared = (p.x - p.homeX) ** 2 + (p.y - p.homeY) ** 2;
        if (distanceSquared > 0.0001 || p.vx * p.vx + p.vy * p.vy > 0.0001) unsettled = true;
        else if (!sources.length) { p.x = p.homeX; p.y = p.homeY; p.vx = p.vy = 0; }
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
          wakes.push({ ax: pointer.x, ay: pointer.y, dx, dy, lengthSquared: length * length,
            ux: dx / length, uy: dy / length, speed, time });
          if (wakes.length > maxWakes) wakes.shift();
          pointer = { x, y, time, vx, vy };
        } else pointer = { x, y, time, vx: 0, vy: 0 };
      }
      if (pointer && !frame) {
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
