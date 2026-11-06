'use client';

import { usePathname } from 'next/navigation';
import styles from '@/styles/academic.module.css';

/** Route-aware page chrome. Home is a page, with no entrance gate or overlay. */
export default function EntranceBoundary({ children, navigation, footer }: {
  children: React.ReactNode;
  navigation: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === '/') return <main key={pathname}>{children}</main>;
  // Pilot styles deliberately apply only to About, including its shared chrome.
  const isAbout = pathname.replace(/\/$/, '') === '/about';
  const chrome = <>
    {navigation}
    <main key={pathname} tabIndex={-1} className="min-h-screen pt-16 lg:pt-20">{children}</main>
    {footer}
  </>;
  return isAbout ? <div className={styles.academic}>{chrome}</div> : chrome;
}
