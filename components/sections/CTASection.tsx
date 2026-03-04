'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import GoldButton from '@/components/ui/GoldButton';

export default function CTASection() {
  const t = useTranslations('cta');

  return (
    <section className="relative py-24 border-t border-gold/20">
      {/* subtle glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div className="h-[300px] w-[500px] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-content mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.12, 0.23, 0.5, 1] }}
          className="font-serif text-3xl md:text-4xl font-bold text-white"
        >
          {t('heading')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.12, 0.23, 0.5, 1] }}
          className="mt-4 text-white/70 text-lg max-w-xl mx-auto"
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.12, 0.23, 0.5, 1] }}
          className="mt-8"
        >
          <GoldButton href="/rechner" size="lg" pulse>
            {t('button')}
          </GoldButton>
        </motion.div>
      </div>
    </section>
  );
}
