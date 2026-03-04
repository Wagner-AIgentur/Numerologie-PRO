'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton from '@/components/ui/CalBookingButton';
import BackgroundOrbs from '@/components/ui/BackgroundOrbs';
import { FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';

export default function DankePage() {
  const t = useTranslations('thankYou');

  return (
    <>
      <BackgroundOrbs />
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center max-w-lg"
        >
          {/* Checkmark animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/10 border border-gold/30 mb-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <CheckCircle2 className="h-10 w-10 text-gold" strokeWidth={1.5} />
            </motion.div>
          </motion.div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gold font-medium mb-4">
            {t('subtitle')}
          </p>

          {/* Description */}
          <p className="text-white/60 text-base mb-10 leading-relaxed">
            {t('description')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GoldButton href="/" variant="outline" size="md">
              {t('backHome')}
            </GoldButton>
            <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} size="md">
              {t('bookConsultation')}
            </CalBookingButton>
          </div>
        </motion.div>
      </div>
    </>
  );
}
