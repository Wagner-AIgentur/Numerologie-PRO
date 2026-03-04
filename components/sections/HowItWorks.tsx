'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Calendar, Grid3x3, UserCheck } from 'lucide-react';

const steps = [
  { icon: Calendar, key: 'step1' },
  { icon: Grid3x3, key: 'step2' },
  { icon: UserCheck, key: 'step3' },
] as const;

export default function HowItWorks() {
  const t = useTranslations('howItWorks');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Framer-reference easing
  const EASE = [0.12, 0.23, 0.5, 1] as const;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-center font-serif text-3xl md:text-4xl font-bold text-white"
        >
          {t('heading')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mt-4 text-center text-white/70 text-lg"
        >
          {t('subtitle')}
        </motion.p>

        {/* steps */}
        <div ref={ref} className="relative mt-16 flex flex-col md:flex-row items-center justify-between gap-12 md:gap-8">
          {/* dotted connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-gold/30"
          />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: idx * 0.2, ease: EASE }}
                className="relative z-content flex flex-col items-center text-center w-full md:w-1/3"
              >
                {/* numbered circle */}
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold/40 bg-[rgba(15,48,63,0.3)] backdrop-blur-xl shadow-glow">
                  <Icon className="h-10 w-10 text-gold" strokeWidth={1.5} />
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold-gradient text-xs font-bold text-teal-dark">
                    {idx + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-white">
                  {t(`${step.key}.title`)}
                </h3>
                <p className="mt-2 text-white/60 text-sm max-w-[260px]">
                  {t(`${step.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
