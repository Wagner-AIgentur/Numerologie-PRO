'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import GoldButton from '@/components/ui/GoldButton';

export default function AboutPreview() {
  const t = useTranslations('about');

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">
          {/* ---------- left: image placeholder ---------- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-5/12 flex justify-center"
          >
            <div className="relative">
              {/* outer ring */}
              <div className="absolute inset-0 rounded-full border border-gold/20 scale-110" />
              {/* portrait */}
              <div className="relative h-56 w-56 md:h-72 md:w-72 rounded-full border-2 border-gold/30 shadow-glow overflow-hidden">
                <Image
                  src="/images/swetlana-about.jpg"
                  alt="Swetlana Wagner – zertifizierte Numerologin für Psychomatrix-Beratung"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 224px, 288px"
                />
              </div>
              {/* small decorative dot */}
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gold/20 blur-sm" />
            </div>
          </motion.div>

          {/* ---------- right: text ---------- */}
          <div className="w-full md:w-7/12 text-center md:text-left">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block rounded-pill border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold"
            >
              {t('badge')}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 font-serif text-3xl md:text-4xl font-bold text-white"
            >
              {t('heading')}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-white/70 text-lg leading-relaxed whitespace-pre-line"
            >
              {t('bio')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <GoldButton href="/ueber-mich" variant="outline" size="md">
                {t('cta')}
              </GoldButton>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
