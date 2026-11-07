"use client";

import { useLocaleStore } from '@/lib/stores/localeStore';

export default function Footer() {
  const locale = useLocaleStore(state => state.locale);
  return (
    <footer data-contact-footer className="border-t border-neutral-200/50 dark:border-neutral-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <p className="text-xs text-neutral-500">
            {locale.startsWith('zh') ? '联系方式' : 'Contact'} · {' '}
            <a href="mailto:YaoYao1@uga.edu" className="hover:text-accent underline underline-offset-4">YaoYao1@uga.edu</a>
          </p>
          <p className="text-xs text-neutral-500">© Yao Yao</p>
        </div>
      </div>
    </footer>
  );
}
