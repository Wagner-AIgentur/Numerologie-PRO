'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton from '@/components/ui/CalBookingButton';
import { FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';

// Custom easing from Framer reference (composio.dev)
const EASE_SMOOTH = [0.12, 0.23, 0.5, 1] as const;

// Content elements with fixed delays (sequential entry)
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay, duration: 1, ease: EASE_SMOOTH },
  }),
};

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* ---------- scale-in hero overlay (Framer-style entrance) ---------- */}

      <div className="relative z-content mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* ---------- left: text ---------- */}
          <div className="w-full lg:w-[60%] flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* heading */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.6}
              className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-white"
            >
              {t('headline')}
            </motion.h1>

            {/* accent line — gold shimmer */}
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.7}
              className="mt-2 block font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-shimmer"
            >
              {t('accentLine')}
            </motion.span>

            {/* subtitle */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.8}
              className="mt-6 max-w-xl text-lg text-white/70"
            >
              {t('subtitle')}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1.0}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <GoldButton href="/rechner" size="lg" pulse>
                {t('ctaPrimary')}
              </GoldButton>
              <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} variant="outline" size="lg">
                {t('ctaSecondary')}
              </CalBookingButton>
            </motion.div>
          </div>

          {/* ---------- right: portrait ---------- */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.8}
            className="relative w-full lg:w-[40%] flex items-center justify-center"
          >
            {/* portrait — large rounded rectangle with bottom fade */}
            <div className="relative w-72 sm:w-80 md:w-[22rem] lg:w-full max-w-[26rem] aspect-[3/4] rounded-3xl border border-gold/20 shadow-glow overflow-hidden">
              <Image
                src="/images/swetlana-hero.jpg"
                alt="Swetlana Wagner – Numerologin und Psychomatrix-Beraterin bei Numerologie PRO"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, (max-width: 1024px) 352px, 416px"
                priority
              />
              {/* bottom gradient fade into background */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-teal-dark/90 to-transparent" />
              {/* subtle gold accent line at the bottom */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
