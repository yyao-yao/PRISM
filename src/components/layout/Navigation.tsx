'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import NavigationLink from '@/components/ui/NavigationLink';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { getPrimaryNavigation } from '@/lib/navigation';
import { useLocaleStore } from '@/lib/stores/localeStore';
import { useMessages } from '@/lib/i18n/useMessages';
import type { I18nRuntimeConfig } from '@/types/i18n';

interface NavigationProps {
  cvAvailable: boolean;
  siteTitle: string;
  i18n: I18nRuntimeConfig;
  siteTitleByLocale?: Record<string, string>;
}

export default function Navigation({
  siteTitle,
  cvAvailable,
  i18n,
  siteTitleByLocale,
}: NavigationProps) {
  const pathname = usePathname();
  const locale = useLocaleStore((state) => state.locale);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const messages = useMessages();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);
  const resolvedLocale = i18n.enabled ? locale : i18n.defaultLocale;

  const effectiveItems = useMemo(() => getPrimaryNavigation(resolvedLocale), [resolvedLocale]);

  const effectiveSiteTitle = useMemo(() => {
    return siteTitleByLocale?.[resolvedLocale] || siteTitleByLocale?.[i18n.defaultLocale] || siteTitle;
  }, [i18n.defaultLocale, resolvedLocale, siteTitle, siteTitleByLocale]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDesktopItemActive = (item: ReturnType<typeof getPrimaryNavigation>[number]) =>
    item.id === 'home' ? pathname === '/' : pathname.replace(/\/$/, '').startsWith(item.href.replace(/\/$/, ''));
  const getDesktopItemHref = (item: ReturnType<typeof getPrimaryNavigation>[number]) => item.href;

  const activeItem = effectiveItems.find((item) => isDesktopItemActive(item)) ?? null;
  const activeHref = activeItem ? getDesktopItemHref(activeItem) : null;
  const indicatorHref = hoveredHref ?? activeHref;

  const measureIndicator = useCallback(() => {
    const container = navContainerRef.current;
    if (!container || !indicatorHref) {
      setIndicatorStyle(null);
      return;
    }
    const el = container.querySelector<HTMLElement>(
      `[data-nav-href="${CSS.escape(indicatorHref)}"]`
    );
    if (!el) {
      setIndicatorStyle(null);
      return;
    }
    setIndicatorStyle({
      left: el.offsetLeft,
      width: el.offsetWidth,
      top: el.offsetTop,
      height: el.offsetHeight,
    });
  }, [indicatorHref]);

  useEffect(() => {
    measureIndicator();
  }, [measureIndicator]);

  useEffect(() => {
    window.addEventListener('resize', measureIndicator);
    return () => window.removeEventListener('resize', measureIndicator);
  }, [measureIndicator]);

  return (
    <Disclosure as="nav" className="fixed top-0 left-0 right-0 z-50">
      {({ open }) => (
        <>
          <motion.div
            data-academic="nav-surface"
            className={cn(
              'transition-all duration-300 ease-out',
              scrolled
                ? 'bg-background/80 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg'
                : 'bg-transparent'
            )}
          >
            <div data-academic="nav-frame" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 lg:h-20">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-academic="brand"
                  className="flex-shrink-0"
                >
                  <Link
                    href="/"
                    className="text-xl lg:text-2xl font-serif font-semibold text-primary hover:text-accent transition-colors duration-200"
                  >
                    {effectiveSiteTitle}
                  </Link>
                </motion.div>

                <div className="hidden lg:block">
                  <div className="ml-10 flex items-center space-x-3">
                    <div
                      ref={navContainerRef}
                      className="relative flex items-baseline space-x-1"
                      onMouseLeave={() => setHoveredHref(null)}
                    >
                      {indicatorStyle && (
                        <motion.div
                          className={cn(
                            'absolute rounded-lg pointer-events-none',
                            hoveredHref && hoveredHref !== activeHref
                              ? 'bg-accent/[0.07]'
                              : 'bg-accent/10'
                          )}
                          data-academic="nav-indicator"
                          initial={false}
                          animate={{
                            left: indicatorStyle.left,
                            width: indicatorStyle.width,
                            top: indicatorStyle.top,
                            height: indicatorStyle.height,
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 28,
                          }}
                        />
                      )}
                      {effectiveItems.map((item) => {
                        const isActive = isDesktopItemActive(item);
                        const href = getDesktopItemHref(item);

                        return (
                          <NavigationLink
                            cvAvailable={cvAvailable}
                            key={item.id}
                            href={href}
                            data-nav-href={href}
                            aria-current={isActive ? 'page' : undefined}
                            prefetch={true}
                            onMouseEnter={() => setHoveredHref(href)}
                            className={cn(
                              'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
                              isActive
                                ? 'text-primary'
                                : hoveredHref === href
                                  ? 'text-primary'
                                  : 'text-neutral-600'
                            )}
                          >
                            {item.title}
                          </NavigationLink>
                        );
                      })}
                    </div>
                    <LanguageToggle i18n={i18n} />
                    <ThemeToggle />
                  </div>
                </div>

                <div className="lg:hidden flex items-center space-x-2">
                  <LanguageToggle i18n={i18n} />
                  <ThemeToggle />
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent transition-colors duration-200">
                    <span className="sr-only">{messages.navigation.openMainMenu}</span>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </motion.div>
                  </Disclosure.Button>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {open && (
              <Disclosure.Panel static data-academic="mobile-nav">
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-neutral-200/50 shadow-lg"
                >
                  <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {effectiveItems.map((item, index) => {
                      const isActive = isDesktopItemActive(item);
                      const href = item.href;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Disclosure.Button
                            as={NavigationLink}
                            cvAvailable={cvAvailable}
                            aria-current={isActive ? 'page' : undefined}
                            href={href}
                            prefetch={true}
                            className={cn(
                              'block px-3 py-2 rounded-md text-base font-medium transition-all duration-200',
                              isActive
                                ? 'text-primary bg-accent/10 border-l-4 border-accent'
                                : 'text-neutral-600 hover:text-primary hover:bg-neutral-50'
                            )}
                          >
                            {item.title}
                          </Disclosure.Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </Disclosure.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Disclosure>
  );
}
