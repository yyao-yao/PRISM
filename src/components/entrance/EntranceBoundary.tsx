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
  // Keep the editorial scope explicit; Home and other routes retain their chrome.
  const isAcademic = ['/about', '/publications', '/teaching', '/cv', '/photography'].includes(pathname.replace(/\/$/, ''));
  const chrome = <>
    {navigation}
    <main key={pathname} tabIndex={-1} className="flex-1 pt-16 lg:pt-20">{children}</main>
    {footer}
  </>;
  return <div className={`${isAcademic ? styles.academic : ''} min-h-screen flex flex-col`}>{chrome}</div>;
}
