'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { MessageCircle, UserCheck, Zap, Award, FileText, Lock, ArrowRight } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton from '@/components/ui/CalBookingButton';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import { FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';

const whyItems = [
  { key: '1', icon: MessageCircle },
  { key: '2', icon: UserCheck },
  { key: '3', icon: Zap },
  { key: '4', icon: Award },
  { key: '5', icon: FileText },
  { key: '6', icon: Lock },
] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function UeberMichPage() {
  const t = useTranslations('aboutPage');

  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Hero section */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16 mb-20">
            {/* Photo placeholder */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full md:w-5/12 flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full border border-gold/20 scale-110" />
                <div className="relative h-56 w-56 md:h-72 md:w-72 rounded-full border-2 border-gold/30 shadow-glow overflow-hidden">
                  <Image
                    src="/images/swetlana-about.jpg"
                    alt="Swetlana Wagner – zertifizierte Numerologin mit 10+ Jahren Erfahrung"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 224px, 288px"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gold/20 blur-sm" />
              </div>
            </motion.div>

            {/* Intro text */}
            <div className="w-full md:w-7/12 text-center md:text-left">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-pill border border-gold/30 bg-gold/10 px-4 py-1.5 text-sm text-gold"
              >
                {t('subtitle')}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-4 font-serif text-3xl md:text-4xl font-bold text-white"
              >
                {t('title')}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 text-white/70 text-lg leading-relaxed"
              >
                {t('intro')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-3 text-white/60 text-base leading-relaxed"
              >
                {t('intro2')}
              </motion.p>
            </div>
          </div>

          {/* Why section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {t('whyTitle')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {whyItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.key}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx}
                  className="rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[12px] border border-gold/20 bg-gold/10 mb-4">
                    <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {t(`why${item.key}Title`)}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {t(`why${item.key}Desc`)}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Certificates Link */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Link href="/zertifikate">
              <div className="group rounded-2xl border border-white/10 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-8 text-center hover:border-gold/30 transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Award className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  <h3 className="text-xl font-semibold text-white">
                    {t('certificatesTitle')}
                  </h3>
                </div>
                <p className="text-white/60 mb-4">
                  {t('certificatesDesc')}
                </p>
                <div className="inline-flex items-center gap-2 text-sm text-gold group-hover:gap-3 transition-all duration-300">
                  <span>{t('certificatesLink')}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* CTA section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-gold/20 bg-[rgba(15,48,63,0.3)] backdrop-blur-sm p-10 text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {t('ctaTitle')}
            </h2>
            <p className="text-white/60 mb-6">
              {t('ctaDesc')}
            </p>
            <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} size="lg">
              {t('ctaButton')}
            </CalBookingButton>
          </motion.div>
        </div>
      </div>
    </>
  );
}
