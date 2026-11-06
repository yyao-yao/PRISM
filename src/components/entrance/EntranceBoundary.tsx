'use client';

import { usePathname } from 'next/navigation';

/** Route-aware page chrome. Home is a page, with no entrance gate or overlay. */
export default function EntranceBoundary({ children, navigation, footer }: {
  children: React.ReactNode;
  navigation: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === '/') return <main key={pathname}>{children}</main>;
  return <>
    {navigation}
    <main key={pathname} tabIndex={-1} className="min-h-screen pt-16 lg:pt-20">{children}</main>
    {footer}
  </>;
}
