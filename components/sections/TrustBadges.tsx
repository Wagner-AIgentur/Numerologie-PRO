'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, ShieldCheck, Users, Languages, Video } from 'lucide-react';

const badges = [
  { key: 'payment', icon: Shield },
  { key: 'dsgvo', icon: ShieldCheck },
  { key: 'sessions', icon: Users },
  { key: 'personal', icon: Video },
  { key: 'languages', icon: Languages },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function TrustBadges() {
  const t = useTranslations('trust');

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.key}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                  <Icon className="h-7 w-7 text-gold" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-white/90">
                  {t(`${badge.key}.label`)}
                </span>
                <span className="text-xs text-white/60">
                  {t(`${badge.key}.description`)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
