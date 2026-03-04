'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import PremiumCard from '@/components/ui/PremiumCard';

interface TestimonialItem {
  quote: string;
  name: string;
  handle?: string;
  stars: number;
  category?: string;
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <PremiumCard className="flex flex-col h-full p-6 min-w-[300px] max-w-[340px] shrink-0 select-none">
      {/* category tag + stars */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1">
          {Array.from({ length: item.stars }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-gold text-gold"
              strokeWidth={1}
            />
          ))}
        </div>
        {item.category && (
          <span className="rounded-pill border border-gold/20 bg-gold/5 px-2.5 py-0.5 text-xs text-gold/80">
            {item.category}
          </span>
        )}
      </div>

      {/* quote */}
      <p className="mt-4 flex-1 text-white/80 text-sm leading-relaxed italic">
        &ldquo;{item.quote}&rdquo;
      </p>

      {/* author */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 border border-gold/20">
          <span className="text-sm font-semibold text-gold">
            {item.name.charAt(0)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white/90">
            {item.name}
          </span>
          {item.handle && (
            <span className="text-xs text-white/50">
              {item.handle}
            </span>
          )}
        </div>
      </div>
    </PremiumCard>
  );
}

/** Auto-scroll speed in px per frame (~60fps). Higher = faster. */
const AUTO_SCROLL_SPEED = 0.8;
/** Seconds to wait after user interaction before resuming auto-scroll */
const RESUME_DELAY_MS = 3000;

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Read testimonials array directly from i18n JSON
  const rawItems = t.raw('items');
  const items: TestimonialItem[] = Array.isArray(rawItems)
    ? (rawItems as TestimonialItem[])
    : [];

  // Double items for seamless infinite loop
  const doubled = [...items, ...items];

  // --- Auto-scroll loop ---
  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (el && !pausedRef.current) {
      el.scrollLeft += AUTO_SCROLL_SPEED;

      // Seamless reset: when first set is fully scrolled, jump to start
      const halfWidth = el.scrollWidth / 2;
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }
    }
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [tick]);

  // --- Pause / resume helpers ---
  const pauseAutoScroll = useCallback(() => {
    pausedRef.current = true;
    clearTimeout(resumeTimerRef.current);
  }, []);

  const scheduleResume = useCallback(() => {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  }, []);

  // --- Scroll button state ---
  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // With infinite scroll, both arrows are always usable — but disable at extreme edges
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollButtons);
  }, [updateScrollButtons]);

  // --- Mouse drag (desktop) ---
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoScroll();
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftStart(el.scrollLeft);
  }, [pauseAutoScroll]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeftStart - (x - startX) * 1.5;
  }, [isDragging, startX, scrollLeftStart]);

  const onMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      scheduleResume();
    }
  }, [isDragging, scheduleResume]);

  // --- Touch handlers (pause on touch, resume after) ---
  const onTouchStart = useCallback(() => {
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const onTouchEnd = useCallback(() => {
    scheduleResume();
  }, [scheduleResume]);

  // --- Hover: pause while hovering ---
  const onMouseEnter = useCallback(() => {
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const onMouseLeaveContainer = useCallback(() => {
    if (!isDragging) {
      scheduleResume();
    }
  }, [isDragging, scheduleResume]);

  // --- Arrow buttons ---
  const scrollByCard = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    pauseAutoScroll();
    const cardWidth = 340 + 24;
    el.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
    scheduleResume();
  }, [pauseAutoScroll, scheduleResume]);

  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.12, 0.23, 0.5, 1] }}
          className="flex items-end justify-between mb-14"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
            {t('title')}{' '}
            <span className="text-gold">{t('titleAccent')}</span>
          </h2>

          {/* Arrow buttons (desktop) */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scrollByCard('left')}
              disabled={!canScrollLeft}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold transition-all hover:bg-gold/15 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => scrollByCard('right')}
              disabled={!canScrollRight}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold transition-all hover:bg-gold/15 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Auto-scroll + draggable container */}
      <div
        className="relative"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeaveContainer}
      >
        {/* Gradient fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-body to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-body to-transparent" />

        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={`flex gap-6 px-8 sm:px-16 overflow-x-auto no-scrollbar ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {doubled.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="shrink-0">
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
