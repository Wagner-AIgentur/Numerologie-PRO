'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import GoldButton from '@/components/ui/GoldButton';

interface AuthGateProps {
  isOpen: boolean;
  locale: 'de' | 'ru';
  /** URL search params to preserve (d, m, y) so the matrix is recalculated after login */
  redirectParams?: string;
  onClose: () => void;
}

export default function AuthGate({ isOpen, locale, redirectParams = '', onClose }: AuthGateProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const redirectTo = `/rechner${redirectParams ? `?${redirectParams}` : ''}`;
  const loginHref = `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`;
  const registerHref = `/auth/register?redirectTo=${encodeURIComponent(redirectTo)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: [0.12, 0.23, 0.5, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-body/95 backdrop-blur-xl shadow-2xl"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4 text-white/50" />
            </button>

            <div className="px-6 py-8 text-center space-y-5">
              {/* Lock icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                <svg className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white">
                {locale === 'de'
                  ? 'Vollständige Analyse freischalten'
                  : 'Откройте полный анализ'}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed max-w-[280px] mx-auto">
                {locale === 'de'
                  ? 'Melde dich an, um alle 9 Positionen, die Linien-Analyse und dein persönliches PDF zu erhalten.'
                  : 'Войдите, чтобы увидеть все 9 позиций, анализ линий и получить персональный PDF.'}
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <GoldButton href={registerHref} variant="primary" size="md" className="w-full">
                  {locale === 'de' ? 'Kostenlos registrieren' : 'Зарегистрироваться бесплатно'}
                </GoldButton>
                <GoldButton href={loginHref} variant="outline" size="sm" className="w-full">
                  {locale === 'de' ? 'Ich habe bereits ein Konto' : 'У меня уже есть аккаунт'}
                </GoldButton>
              </div>

              {/* Benefits list */}
              <div className="pt-2 space-y-2">
                {(locale === 'de'
                  ? ['Alle 9 Matrix-Positionen', 'Linien-Analyse (Zeilen, Spalten, Diagonalen)', 'PDF-Report per Email']
                  : ['Все 9 позиций матрицы', 'Анализ линий (строки, столбцы, диагонали)', 'PDF-отчёт на email']
                ).map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-xs text-white/50">
                    <svg className="h-3.5 w-3.5 shrink-0 text-gold/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
