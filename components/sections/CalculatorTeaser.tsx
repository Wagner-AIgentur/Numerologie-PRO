'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { ArrowRight } from 'lucide-react';

function formatDateInput(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

export default function CalculatorTeaser() {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const router = useRouter();

  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const isComplete = value.length === 10;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    if (formatted.length <= 10) {
      setValue(formatted);
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parts = value.split('.');
    if (parts.length !== 3) {
      setError(locale === 'de' ? 'Format: TT.MM.JJJJ' : 'Формат: ДД.ММ.ГГГГ');
      return;
    }

    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);

    if (!d || d < 1 || d > 31 || !m || m < 1 || m > 12 || !y || y < 1900 || y > 2030) {
      setError(locale === 'de' ? 'Ungültiges Datum' : 'Неверная дата');
      return;
    }

    router.push(`/rechner?d=${String(d).padStart(2, '0')}&m=${String(m).padStart(2, '0')}&y=${y}`);
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gold glow backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[400px] w-[700px] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="relative z-content mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.12, 0.23, 0.5, 1] }}
        >
          <span className="inline-block mb-4 rounded-pill border border-gold/30 bg-gold/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gold">
            {locale === 'de' ? 'Kostenlos & Sofort' : 'Бесплатно - Без регистрации'}
          </span>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
            {t('sectionTitle')}{' '}
            <span className="text-shimmer">{t('sectionTitleAccent')}</span>
          </h2>

          <p className="mt-3 text-white/60 text-base max-w-md mx-auto">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.12, 0.23, 0.5, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Single DD.MM.YYYY input */}
          <div className="relative flex-1 max-w-[220px]">
            <motion.div
              animate={
                isFocused
                  ? { boxShadow: '0 0 0 2px rgba(212,175,55,0.4), 0 0 20px rgba(212,175,55,0.1)' }
                  : { boxShadow: '0 0 0 1px rgba(212,175,55,0.2)' }
              }
              transition={{ duration: 0.2 }}
              className="rounded-2xl overflow-hidden"
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="TT.MM.JJJJ"
                value={value}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                maxLength={10}
                className="w-full rounded-2xl border-0 bg-[rgba(13,45,66,0.5)] px-5 py-4 text-center text-2xl font-bold text-white placeholder-white/25 backdrop-blur-sm focus:outline-none tracking-[0.12em] transition-colors"
                style={{ caretColor: '#D4AF37' }}
              />
            </motion.div>
            {error && (
              <p className="mt-2 text-xs text-red-400 text-center">{error}</p>
            )}
          </div>

          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={!isComplete}
            whileHover={isComplete ? { scale: 1.03 } : {}}
            whileTap={isComplete ? { scale: 0.97 } : {}}
            className={`shrink-0 rounded-pill px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
              isComplete
                ? 'bg-gold-gradient text-teal-dark shadow-gold hover:shadow-gold-hover cursor-pointer btn-pulse-glow'
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
            }`}
          >
            {t('calculate')}
          </motion.button>
        </motion.form>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {[0,1,2,3,4,5,6,7].map((i) => {
            const filled = value.replace(/\./g, '').length > i;
            return (
              <div
                key={i}
                className={`h-1 w-1 rounded-full transition-all duration-200 ${filled ? 'bg-gold scale-125' : 'bg-white/20'}`}
              />
            );
          })}
        </div>

        {/* Direct link to calculator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <Link href="/rechner">
            <span className="group inline-flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors duration-300">
              <span>{locale === 'de' ? 'Oder direkt zum vollständigen Rechner' : 'Или сразу к полному калькулятору'}</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
