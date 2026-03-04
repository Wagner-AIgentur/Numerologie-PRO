'use client';

import { useState, useRef, useCallback, useEffect, type UIEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import {
  Compass, CalendarRange, Map, Loader2, FileText, ArrowRight,
  ChevronLeft, ChevronRight, CheckCircle2, Star, Info, ListChecks, Trophy,
} from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';
import GoldButton from '@/components/ui/GoldButton';
import { UI_KEY_TO_PACKAGE_KEY } from '@/lib/stripe/products';
import Link from 'next/link';

/* Only 3 featured packages on the homepage — full list lives on /pakete */
const packages = [
  { key: 'bestimmung', icon: Compass, featured: true, hasPdfOption: false },
  { key: 'lebenskarte', icon: Map, featured: false, hasPdfOption: false },
  { key: 'jahresprognose', icon: CalendarRange, featured: false, hasPdfOption: true },
] as const;

const EASE = [0.12, 0.23, 0.5, 1] as const;

export default function PackagesOverview() {
  const t = useTranslations('packages');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponFromUrl = searchParams.get('coupon') || '';
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [pdfSelected, setPdfSelected] = useState<Record<string, boolean>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function getActiveTab(pkgKey: string) {
    return activeTabs[pkgKey] || 'info';
  }

  function setActiveTab(pkgKey: string, tab: string) {
    setActiveTabs(prev => ({ ...prev, [pkgKey]: tab }));
  }

  const scrollToSlide = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement;
    if (child) {
      el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' });
    }
  }, []);

  /* Track scroll position to update active dot */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const scrollLeft = el.scrollLeft;
      const width = el.offsetWidth;
      const idx = Math.round(scrollLeft / width);
      setActiveSlide(Math.min(idx, packages.length - 1));
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  function handleCheckout(uiKey: string) {
    let resolvedKey: string = UI_KEY_TO_PACKAGE_KEY[uiKey];
    if (!resolvedKey) return;

    if (uiKey === 'jahresprognose' && pdfSelected[uiKey]) {
      resolvedKey = 'jahresprognose_pdf';
    }

    setLoadingKey(uiKey);

    // Defer fetch to next frame so the browser can paint the loading spinner first
    requestAnimationFrame(async () => {
      try {
        const res = await fetch('/api/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageKey: resolvedKey, locale, ...(couponFromUrl && { couponCode: couponFromUrl }) }),
        });

        if (res.status === 401) {
          window.location.href = `/${locale}/auth/login?redirectTo=/${locale}/pakete`;
          return;
        }

        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        } else {
          console.error('Checkout: no URL returned', data);
          setLoadingKey(null);
        }
      } catch (err) {
        console.error('Checkout error:', err);
        setLoadingKey(null);
      }
    });
  }

  function renderCard(pkg: typeof packages[number], idx: number) {
    const Icon = pkg.icon;
    const features = t.raw(`${pkg.key}.features`) as string[];
    const resultsRaw = (() => { try { return t.raw(`${pkg.key}.results`); } catch { return null; } })();
    const results = Array.isArray(resultsRaw) ? resultsRaw as string[] : null;
    const featuresTitle = (() => { try { return t(`${pkg.key}.featuresTitle`); } catch { return null; } })();
    const resultsTitle = (() => { try { return t(`${pkg.key}.resultsTitle`); } catch { return null; } })();
    const pkgDuration = (() => { try { return t(`${pkg.key}.duration`); } catch { return null; } })();
    const isLoading = loadingKey === pkg.key;
    const hasResults = results && results.length > 0;

    const tabs = [
      { id: 'info', label: t('tabInfo'), icon: Info },
      { id: 'features', label: t('tabFeatures'), icon: ListChecks },
      ...(hasResults ? [{ id: 'results', label: t('tabResults'), icon: Trophy }] : []),
    ];
    const active = getActiveTab(pkg.key);

    return (
      <motion.div
        key={pkg.key}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ delay: idx * 0.12, duration: 0.8, ease: EASE }}
        className="w-[85vw] max-w-[360px] md:w-auto md:max-w-none flex-shrink-0 snap-center"
      >
        <PremiumCard
          featured={pkg.featured}
          className="relative flex flex-col h-full p-6"
        >
          {/* popular badge */}
          {pkg.featured && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-gold-gradient px-4 py-1 text-xs font-bold uppercase tracking-wider text-teal-dark">
              {t('popular')}
            </span>
          )}

          {/* icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-[12px] border border-gold/20 bg-gold/10">
            <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
          </div>

          {/* title + subtitle */}
          <h3 className="mt-5 text-xl font-semibold text-white">
            {t(`${pkg.key}.title`)}
          </h3>
          <p className="mt-1 text-sm text-white/60">
            {t(`${pkg.key}.subtitle`)}
          </p>

          {/* Tab navigation */}
          <div className="mt-4 flex gap-1 rounded-[10px] bg-white/5 p-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(pkg.key, tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] px-2 py-2 text-xs font-medium transition-all duration-200 ${
                    active === tab.id
                      ? 'bg-gold/15 text-gold shadow-sm'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content — fixed height with scroll indicator */}
          <div className="mt-3 relative">
            <div className="h-[180px] overflow-y-auto thin-scrollbar pr-1">
            <AnimatePresence mode="wait">
              {active === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="inline-block rounded-pill border border-gold/20 bg-gold/5 px-3 py-1 text-xs text-gold/80">
                    {t(`${pkg.key}.forWhom`)}
                  </span>
                  <p className="mt-3 text-sm text-white/70 leading-relaxed">
                    {t(`${pkg.key}.desc`)}
                  </p>
                </motion.div>
              )}

              {active === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {featuresTitle && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold/80 mb-2">{featuresTitle}</p>
                  )}
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {active === 'results' && hasResults && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  {resultsTitle && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-gold/80 mb-2">{resultsTitle}</p>
                  )}
                  <ul className="space-y-2">
                    {results.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-white/80">
                        <Star className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
            {/* Bottom fade gradient — hints at more content */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[rgba(15,48,63,0.8)] to-transparent rounded-b-xl" />
          </div>

          {/* Spacer pushes price + button to bottom */}
          <div className="mt-auto" />

          {/* PDF toggle (only jahresprognose) */}
          {pkg.hasPdfOption && (
            <div className="mt-4 flex gap-1 rounded-[10px] bg-white/5 p-1">
              <button
                onClick={() => setPdfSelected(prev => ({ ...prev, [pkg.key]: false }))}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
                  !pdfSelected[pkg.key]
                    ? 'bg-gold/15 text-gold shadow-sm'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <span>{t('withoutPdf')}</span>
              </button>
              <button
                onClick={() => setPdfSelected(prev => ({ ...prev, [pkg.key]: true }))}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-[8px] px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
                  pdfSelected[pkg.key]
                    ? 'bg-gold/15 text-gold shadow-sm'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{t('withPdf')}</span>
              </button>
            </div>
          )}

          {/* price + duration */}
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-bold text-gold">
              {pkg.hasPdfOption && pdfSelected[pkg.key]
                ? (() => { try { return t(`${pkg.key}.pricePdf`); } catch { return t(`${pkg.key}.price`); } })()
                : t(`${pkg.key}.price`)
              }
            </span>
            <span className="rounded-pill border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold">
              {pkgDuration || t('duration')}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-5">
            <GoldButton
              onClick={() => handleCheckout(pkg.key)}
              variant={pkg.featured ? 'primary' : 'outline'}
              size="md"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('book')
              )}
            </GoldButton>
          </div>
        </PremiumCard>
      </motion.div>
    );
  }

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center font-serif text-3xl md:text-4xl font-bold text-white"
        >
          {t('sectionTitle')}{' '}
          <span className="text-gold">{t('sectionTitleAccent')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mt-4 text-center text-white/70 text-lg max-w-2xl mx-auto whitespace-pre-line"
        >
          {t('sectionSubtitle')}
        </motion.p>

        {/* Mobile: horizontal scroll slider / Desktop: 3-col grid */}
        <div className="mt-14 relative">
          {/* Arrow buttons — mobile only */}
          <button
            onClick={() => scrollToSlide(Math.max(0, activeSlide - 1))}
            className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-teal-dark/80 backdrop-blur-sm text-gold transition-opacity duration-200"
            style={{ opacity: activeSlide === 0 ? 0.3 : 1 }}
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollToSlide(Math.min(packages.length - 1, activeSlide + 1))}
            className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-teal-dark/80 backdrop-blur-sm text-gold transition-opacity duration-200"
            style={{ opacity: activeSlide === packages.length - 1 ? 0.3 : 1 }}
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Scrollable container on mobile, grid on desktop */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 md:overflow-visible"
            style={{ scrollPaddingInline: '7.5vw' }}
          >
            {packages.map((pkg, idx) => renderCard(pkg, idx))}
          </div>

          {/* Dots — mobile only */}
          <div className="mt-6 flex justify-center gap-2 md:hidden">
            {packages.map((pkg, idx) => (
              <button
                key={pkg.key}
                onClick={() => scrollToSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeSlide
                    ? 'w-6 bg-gold'
                    : 'w-2 bg-white/20'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View all packages CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          className="mt-12 text-center"
        >
          <Link
            href={`/${locale}/pakete`}
            className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-semibold uppercase tracking-wider"
          >
            {t('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
