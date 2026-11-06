import Link from 'next/link';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<'a'>, 'href'> & {
  href: string;
  prefetch?: boolean;
  cvAvailable?: boolean;
};

/** PDFs use native navigation so the browser opens its viewer and download controls. */
export default function NavigationLink({ cvAvailable = false, prefetch, href, ...props }: Props) {
  if (href !== '/cv.pdf') return <Link {...props} href={href} prefetch={prefetch} />;

  return <a {...props} href={cvAvailable ? href : undefined}
    role={cvAvailable ? undefined : 'link'}
    aria-disabled={cvAvailable ? undefined : true}
    title={cvAvailable ? undefined : 'CV PDF pending upload / 简历 PDF 待上传'} />;
}
