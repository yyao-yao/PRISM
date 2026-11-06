'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import DigitalEntrance from './DigitalEntrance';

const sessionKey = 'prism-entry-complete';

export default function EntranceBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [eligible, setEligible] = useState(false);
  const [entered, setEntered] = useState(false);
  const site = useRef<HTMLDivElement>(null);
  const active = pathname === '/' && eligible && !entered;

  useEffect(() => {
    let complete = false;
    try { complete = sessionStorage.getItem(sessionKey) === '1'; } catch { /* Storage is optional. */ }
    setEligible(!window.location.hash && !complete);
  }, []);

  useEffect(() => {
    if (!active) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const skipAnchor = () => { if (window.location.hash) setEntered(true); };
    window.addEventListener('hashchange', skipAnchor);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('hashchange', skipAnchor);
    };
  }, [active]);

  function enter() {
    try { sessionStorage.setItem(sessionKey, '1'); } catch { /* Continue without persistence. */ }
    setEntered(true);
    requestAnimationFrame(() => site.current?.querySelector<HTMLElement>('main')?.focus({ preventScroll: true }));
  }

  return (
    <>
      <div ref={site} inert={active} aria-hidden={active || undefined}>{children}</div>
      {active && <DigitalEntrance onEnter={enter} />}
    </>
  );
}
