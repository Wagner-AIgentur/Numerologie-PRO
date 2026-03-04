'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import GoldButton from '@/components/ui/GoldButton';
import CalBookingButton from '@/components/ui/CalBookingButton';
import { FREE_CONSULTATION_CAL_PATH } from '@/lib/stripe/products';

const content = {
  de: {
    success: 'E-Mail erfolgreich bestätigt!',
    successDesc:
      'Deine detaillierte Numerologie-Analyse ist unterwegs. Schau in dein Postfach!',
    already: 'Bereits bestätigt',
    alreadyDesc: 'Deine E-Mail-Adresse wurde bereits bestätigt.',
    invalid: 'Ungültiger Link',
    invalidDesc:
      'Dieser Bestätigungslink ist ungültig oder abgelaufen.',
    backToCalculator: 'Zurück zum Rechner',
    bookConsultation: 'Kostenlose Beratung buchen',
  },
  ru: {
    success: 'Email успешно подтверждён!',
    successDesc:
      'Ваш детальный нумерологический анализ уже в пути. Проверьте почту!',
    already: 'Уже подтверждено',
    alreadyDesc: 'Ваш email-адрес уже подтверждён.',
    invalid: 'Недействительная ссылка',
    invalidDesc:
      'Эта ссылка подтверждения недействительна или устарела.',
    backToCalculator: 'Вернуться к калькулятору',
    bookConsultation: 'Записаться на бесплатную консультацию',
  },
};

function VerifyContent() {
  const searchParams = useSearchParams();
  const locale = useLocale() as 'de' | 'ru';
  const status = searchParams.get('status') ?? 'invalid';
  const t = content[locale] || content.de;

  const config: Record<
    string,
    {
      icon: React.ReactNode;
      title: string;
      desc: string;
      borderColor: string;
      iconBg: string;
      iconBorder: string;
    }
  > = {
    success: {
      icon: <CheckCircle2 className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />,
      title: t.success,
      desc: t.successDesc,
      borderColor: 'border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconBorder: 'border-emerald-500/30',
    },
    already: {
      icon: <Info className="h-7 w-7 text-gold" strokeWidth={1.5} />,
      title: t.already,
      desc: t.alreadyDesc,
      borderColor: 'border-gold/20',
      iconBg: 'bg-gold/10',
      iconBorder: 'border-gold/30',
    },
    invalid: {
      icon: <AlertTriangle className="h-7 w-7 text-red-400" strokeWidth={1.5} />,
      title: t.invalid,
      desc: t.invalidDesc,
      borderColor: 'border-red-500/20',
      iconBg: 'bg-red-500/10',
      iconBorder: 'border-red-500/30',
    },
  };

  const state = config[status] || config.invalid;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.12, 0.23, 0.5, 1] }}
        className="w-full max-w-md"
      >
        <div
          className={`rounded-2xl border ${state.borderColor} bg-white/5 backdrop-blur-sm p-10 text-center`}
        >
          {/* Icon */}
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${state.iconBg} border ${state.iconBorder} mx-auto mb-5`}
          >
            {state.icon}
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl font-bold text-white mb-3">
            {state.title}
          </h1>

          {/* Description */}
          <p className="text-white/60 text-sm mb-8">{state.desc}</p>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <GoldButton href="/rechner" size="md" className="w-full">
              {t.backToCalculator}
            </GoldButton>

            <CalBookingButton calLink={FREE_CONSULTATION_CAL_PATH} variant="outline" size="md" className="w-full">
              {t.bookConsultation}
            </CalBookingButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gold animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
