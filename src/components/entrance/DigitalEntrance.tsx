'use client';

import { useEffect, useRef } from 'react';
import { useThemeStore } from '@/lib/stores/themeStore';
import ParticleTitle from './ParticleTitle';
import styles from './entrance.module.css';

export default function DigitalEntrance({ onEnter }: { onEnter: () => void }) {
  const { theme, setTheme } = useThemeStore();
  const entry = useRef<HTMLButtonElement>(null);
  const portal = useRef<HTMLElement>(null);

  useEffect(() => { entry.current?.focus({ preventScroll: true }); }, []);

  return (
    <section ref={portal} className={styles.portal} role="dialog" aria-modal="true" aria-labelledby="portal-title"
      onKeyDown={(event) => {
        if (event.key === 'Escape') onEnter();
        if (event.key !== 'Tab') return;
        const controls = portal.current?.querySelectorAll<HTMLButtonElement>('button');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }}>
      <header className={styles.header}>
        <div className={styles.identity}><span className={styles.mark} aria-hidden="true">✳</span> YAO YAO <span className={styles.divider}>/</span> <span className={styles.muted}>PERSONAL INTERFACE</span></div>
        <div className={styles.themes} role="group" aria-label="Color theme">
          {(['light', 'dark', 'system'] as const).map((value) => <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value}</button>)}
        </div>
      </header>

      <div className={styles.coordinates} aria-hidden="true"><span>INDEX — 001</span><span>EST. / ACADEMIC SPACE</span></div>
      <div className={styles.content}>
        <p className={styles.eyebrow}><span className={styles.statusDot} /> A SMALL POINT OF ENTRY</p>
        <h1 id="portal-title" className={styles.srOnly}>Yao Yao — academic website entrance</h1>
        <div className={styles.title}><ParticleTitle /><span className={styles.bracketLeft} aria-hidden="true">+</span><span className={styles.bracketRight} aria-hidden="true">+</span></div>
        <div className={styles.titleCaption} aria-hidden="true"><span>FORMED BY PARTICLES</span><span>CONNECTED BY CURIOSITY</span></div>
        <p className={styles.description}>Ideas take shape.<br /><span>A space for research, discovery, and what comes next.</span></p>
        <button ref={entry} type="button" className={styles.entry} onClick={onEnter}><span className={styles.entryArrow} aria-hidden="true">↗</span> initiate_entry()<span className={styles.entryEnd} aria-hidden="true">↵</span></button>
        <p className={styles.hint}>MOVE CLOSER. WATCH THE POSSIBILITIES UNFOLD.</p>
      </div>

      <div className={`${styles.floating} ${styles.floatOne}`} aria-hidden="true"><i /> FIELD / ACTIVE</div>
      <div className={`${styles.floating} ${styles.floatTwo}`} aria-hidden="true"><span className={styles.cross}>+</span> RESTORING EQUILIBRIUM</div>
      <div className={styles.orbit} aria-hidden="true"><span /></div>
      <footer className={styles.footer}><span><span className={styles.statusDot} /> SYSTEM READY</span><span className={styles.footerMiddle}>RESEARCH · THOUGHT · EXPLORATION</span><span>PRISM <span className={styles.blue}>/</span> 01</span></footer>
    </section>
  );
}
