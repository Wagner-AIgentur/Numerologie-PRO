'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Lock } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';

interface EmailCaptureProps {
  onUnlock: (email: string) => void;
  isLoading?: boolean;
}

export default function EmailCapture({ onUnlock, isLoading }: EmailCaptureProps) {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const de = locale === 'de';
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }

    onUnlock(email);
  };

  return (
    <div className="rounded-2xl border border-gold/20 bg-gold/5 backdrop-blur-sm p-6 shadow-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
          <Lock className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h3 className="font-semibold text-white">{t('unlock')}</h3>
          <p className="text-sm text-white/60">{t('unlockDesc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
          <input
            type="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/30 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* DSGVO Consent Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-white/20 bg-white/5 accent-gold cursor-pointer"
          />
          <span className="text-xs text-white/50 leading-relaxed">
            {de
              ? 'Ich willige in die Verarbeitung meiner E-Mail-Adresse gemäß der Datenschutzerklärung ein und möchte Numerologie-Tipps per E-Mail erhalten. Die Einwilligung kann jederzeit widerrufen werden. '
              : 'Я даю согласие на обработку моего адреса электронной почты согласно политике конфиденциальности и хочу получать нумерологические советы. Согласие может быть отозвано в любое время. '}
            <Link
              href="/datenschutz"
              className="text-gold/70 hover:text-gold underline transition-colors"
            >
              {de ? 'Datenschutz' : 'Конфиденциальность'}
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !consentChecked}
          className="w-full rounded-pill bg-gold-gradient px-6 py-3 text-base font-semibold text-teal-dark shadow-gold transition-all hover:shadow-gold-hover hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '...' : t('unlockButton')}
        </button>

        <p className="text-xs text-white/40 text-center">{t('privacy')}</p>
      </form>
    </div>
  );
}
