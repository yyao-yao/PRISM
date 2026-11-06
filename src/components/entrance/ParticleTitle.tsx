'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './entrance.module.css';

interface Particle { x: number; y: number; homeX: number; homeY: number; vx: number; vy: number; size: number; blue: boolean }

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
    let pointer: { x: number; y: number } | null = null;
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
    };

    const animate = (time: number) => {
      const dt = Math.min((time - (lastTime || time)) / 16.667, 2);
      lastTime = time;
      const radius = Math.min(115, Math.max(55, width * 0.12));
      for (const p of particles) {
        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < radius) {
            const force = Math.pow(1 - distance / radius, 2) * 0.85;
            p.vx += dx / Math.max(distance, 1) * force * dt;
            p.vy += dy / Math.max(distance, 1) * force * dt;
          }
        }
        p.vx = (p.vx + (p.homeX - p.x) * 0.013 * dt) * Math.pow(0.88, dt);
        p.vy = (p.vy + (p.homeY - p.y) * 0.013 * dt) * Math.pow(0.88, dt);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      draw();
      frame = requestAnimationFrame(animate);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (reducedMotion.matches || document.hidden) {
        particles.forEach(p => { p.x = p.homeX; p.y = p.homeY; p.vx = p.vy = 0; });
        draw();
      } else frame = requestAnimationFrame(animate);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || reducedMotion.matches) return;
      const rect = element.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
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
    start();
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
